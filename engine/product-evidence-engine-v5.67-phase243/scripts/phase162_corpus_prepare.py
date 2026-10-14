#!/usr/bin/env python3
"""Phase162 private, rights-declared full-review corpus to Phase160 manifests.

This never downloads third-party material or certifies permission. Index and source
texts stay outside the release; only hash-only summaries should be published.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

IDENT = re.compile(r'^[a-z0-9_]{1,50}$')
def sha(text): return hashlib.sha256(text.encode('utf-8')).hexdigest()
def die(message): raise ValueError(message)

def build(index, root):
    if index.get('protocol') != 'pee.phase162.corpus.v1': die('invalid_corpus_protocol')
    ds = index.get('datasetId')
    if not isinstance(ds,str) or not IDENT.fullmatch(ds): die('invalid_dataset_id')
    records=index.get('records')
    if not isinstance(records,list) or not 1<=len(records)<=5000:die('invalid_corpus_size')
    split_by_family={};split_by_source={}; seen_id=set();seen_url=set();seen_sha=set();docs=[]; provenance=[]
    for row in records:
        if not isinstance(row,dict):die('invalid_record')
        rid=row.get('id'); split=row.get('split'); family=row.get('productFamilyId'); group=row.get('publisherGroupId')
        if not isinstance(rid,str) or not IDENT.fullmatch(rid) or rid in seen_id:die('duplicate_or_bad_id')
        if split not in ('development','frozen_holdout'):die('invalid_split')
        for field,value in [('productFamilyId',family),('publisherGroupId',group)]:
            if not isinstance(value,str) or not IDENT.fullmatch(value):die('invalid_'+field)
        # A frozen source/product-disjoint split cannot share either dimension.
        if family in split_by_family and split_by_family[family]!=split:die('product_family_cross_split_leakage')
        if group in split_by_source and split_by_source[group]!=split:die('publisher_group_cross_split_leakage')
        split_by_family[family]=split;split_by_source[group]=split
        if row.get('kind') not in ('constructed','rights_permitted_full_review'):
            die('no_unauthorised_publisher_excerpt_in_full_review_corpus')
        rights=row.get('rightsBasis')
        if row['kind']=='constructed' and rights!='constructed_original':die('invalid_constructed_rights')
        if row['kind']=='rights_permitted_full_review' and rights not in ('document_owner','permission_granted','public_domain'):
            die('full_review_rights_declaration_required')
        # Use data files inside an operator-controlled private directory, not URLs.
        rel=row.get('textFile')
        if not isinstance(rel,str) or rel.startswith('/') or '\\' in rel or not re.fullmatch(r'[a-zA-Z0-9_./-]{1,220}',rel) or '..' in Path(rel).parts:
            die('unsafe_text_path')
        path=(root/rel).resolve(); secure_root=root.resolve()
        if not path.is_relative_to(secure_root) or not path.is_file() or path.is_symlink():die('missing_or_escaped_document')
        text=path.read_text(encoding='utf-8')
        if not text.strip() or len(text.encode('utf-16-le'))//2>120000:die('invalid_document_length')
        digest=sha(text)
        if row.get('sha256')!=digest:die('source_digest_mismatch')
        if row.get('sourceUrl') in seen_url or digest in seen_sha:die('duplicate_url_or_document')
        seen_id.add(rid);seen_url.add(row.get('sourceUrl'));seen_sha.add(digest)
        if not isinstance(row.get('rightsStatement'),str) or not 8<=len(row['rightsStatement'])<=500:die('invalid_rights_statement')
        doc={key:row[key] for key in ('id','kind','rightsBasis','rightsStatement','category','sourceTitle','sourceUrl','sourceRole')}
        doc.update(text=text,sha256=digest,independentGoldAvailable=False)
        docs.append(doc)
        provenance.append({'id':rid,'split':split,'publisherGroupId':group,'productFamilyId':family,'category':row['category'],
                           'sourceUrl':row['sourceUrl'],'sha256':digest,'kind':row['kind']})
    # Separate development and holdout batches; never mingle splits in a job.
    jobs=[]
    for split in ('development','frozen_holdout'):
        group_docs=[x for x,p in zip(docs,provenance) if p['split']==split]
        for idx in range(0,len(group_docs),100):
            jobs.append({'protocol':'pee.phase160.batch.v1',
                         'datasetId':f'{ds}_{split}_{idx//100:03d}','documents':group_docs[idx:idx+100]})
    return jobs,{'protocol':'pee.phase162.corpus_receipt.v1','datasetId':ds,'count':len(docs),
                 'jobs':[{'datasetId':j['datasetId'],'documentCount':len(j['documents'])} for j in jobs],
                 'documents':provenance,'sourceRightsAuthenticated':False,'independentGoldVerified':False,
                 'rankingAuthorized':False,'canonicalWriteAuthorized':False}

def main():
    p=argparse.ArgumentParser();p.add_argument('--index',required=True);p.add_argument('--private-root',required=True)
    p.add_argument('--out-dir',required=True);a=p.parse_args()
    output=Path(a.out_dir)
    if output.exists() and any(output.iterdir()):die('output_dir_not_empty')
    index=json.loads(Path(a.index).read_text(encoding='utf-8'))
    jobs,receipt=build(index,Path(a.private_root))
    output.mkdir(mode=0o700,parents=True,exist_ok=True)
    for item in jobs:
        (output/(item['datasetId']+'.json')).write_text(json.dumps(item,indent=2,ensure_ascii=False)+'\n')
    (output/'private-corpus-receipt.json').write_text(json.dumps(receipt,indent=2,ensure_ascii=False)+'\n')
    print(json.dumps({'documents':receipt['count'],'jobs':len(jobs),'splits':sorted(set(x['split'] for x in receipt['documents']))}))
if __name__=='__main__':
    try:main()
    except (ValueError, OSError, KeyError, TypeError) as e:print(str(e),file=sys.stderr);sys.exit(2)
