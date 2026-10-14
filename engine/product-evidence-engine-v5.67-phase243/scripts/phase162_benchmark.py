#!/usr/bin/env python3
"""Phase162: strictly source-aligned paired native/neural span evaluation.

Gold is supplied separately by humans/operators. 'Independence' cannot be
certified by code; constructed labels remain diagnostics only. No database writes.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys

LABELS=('product_model','brand','product_feature','measured_value')
def sha(s):return hashlib.sha256(s.encode('utf-8')).hexdigest()
def fail(s):raise ValueError(s)
def utf16_slice(text,start,end):
    buf=text.encode('utf-16-le');return buf[2*start:2*end].decode('utf-16-le',errors='strict')
def spans(text,labels,tag):
    if not isinstance(labels,dict) or set(labels)!=set(LABELS):fail('invalid_label_inventory:'+tag)
    output={}
    max_offset=len(text.encode('utf-16-le'))//2
    for label,entries in labels.items():
        if not isinstance(entries,list) or len(entries)>500:fail('invalid_span_budget:'+tag)
        found=set()
        for e in entries:
            if not isinstance(e,dict):fail('invalid_span:'+tag)
            a,b=e.get('start'),e.get('end')
            if type(a)!=int or type(b)!=int or not 0<=a<b<=max_offset:fail('invalid_offset:'+tag)
            if e.get('text')!=utf16_slice(text,a,b):fail('unaligned_span:'+tag)
            found.add((a,b))
        # Duplicates are not independent extra observations.
        if len(found)!=len(entries):fail('duplicate_spans:'+tag)
        output[label]=found
    return output

def validate_gold(gold,manifest):
    if gold.get('protocol')!='pee.phase162.gold.v1' or gold.get('datasetId')!=manifest['datasetId']:
        fail('gold_not_for_manifest')
    method=gold.get('annotationProcess')
    if method not in ('developer_constructed','external_human_adjudication_unverified'):
        fail('unsupported_gold_process')
    gs=gold.get('cases')
    if not isinstance(gs,dict) or not gs:fail('missing_gold')
    docmap={d['id']:d for d in manifest['documents']}
    if not set(gs).issubset(docmap):fail('gold_unknown_document')
    for name,c in gs.items():
        doc=docmap[name]
        if c.get('sha256')!=doc['sha256'] or sha(doc['text'])!=doc['sha256']:fail('gold_source_mismatch')
        if method=='developer_constructed' and doc['kind']!='constructed':fail('constructed_gold_on_external_source')
        spans(doc['text'],c.get('entities'),'gold:'+name)
    return method,gs

def score(pred,gold):
    tp=len(pred&gold);fp=len(pred-gold);fn=len(gold-pred)
    return {'tp':tp,'fp':fp,'fn':fn}
def metrics(c):
    tp,fp,fn=c['tp'],c['fp'],c['fn'];precision=tp/(tp+fp) if tp+fp else None
    recall=tp/(tp+fn) if tp+fn else None
    f1=2*precision*recall/(precision+recall) if precision is not None and recall is not None and precision+recall else (0. if precision is not None and recall is not None else None)
    return {**c,'precision':precision,'recall':recall,'f1':f1}
def accumulate(bucket,counts):
    for key in ('tp','fp','fn'):bucket[key]+=counts[key]

def evaluate(manifest,native,neural,gold,manifest_bytes=None):
    if manifest.get('protocol')!='pee.phase160.batch.v1' or not isinstance(manifest.get('documents'),list):fail('invalid_manifest')
    docs=manifest['documents']; IDs={d['id'] for d in docs}
    if len(IDs)!=len(docs) or not 1<=len(docs)<=100:fail('invalid_document_ids')
    method,goldcases=validate_gold(gold,manifest)
    if native.get('protocol')!='pee.phase162.native_spans.v1' or native.get('datasetId')!=manifest['datasetId']:
        fail('wrong_native_report')
    if manifest_bytes is not None and native.get('sourceManifestDigest')!=hashlib.sha256(manifest_bytes).hexdigest():
        fail('native_manifest_bytes_mismatch')
    if not isinstance(native.get('predictions'),dict) or not set(native['predictions']).issubset(IDs):fail('invalid_native_cases')
    if neural is not None and (neural.get('model_id')!='fastino/gliner2.5-small-v1' or
      neural.get('model_architecture')!='boundary' or neural.get('model_integration_status') not in
      ('local_offline_worker_not_connected_to_PEE','standalone_colab_not_connected_to_PEE') or
      not isinstance(neural.get('cases'),dict) or not set(neural['cases']).issubset(IDs)):
        fail('invalid_neural_report')
    aggregate={side:{label:dict(tp=0,fp=0,fn=0) for label in LABELS} for side in ('native','neural')}
    by_doc=[];paired=0;missing_native=[];missing_neural=[]
    for doc in docs:
        id=doc['id']; text=doc['text']
        if sha(text)!=doc['sha256']:fail('altered_source_manifest')
        if id not in goldcases:continue
        target=spans(text,goldcases[id]['entities'],'gold:'+id)
        each={'id':id,'category':doc['category'],'kind':doc['kind'],'sha256':doc['sha256'],'goldAnnotationStatus':method}
        for side,report in (('native',native['predictions']),('neural',neural['cases'] if neural is not None else {})):
            data=report.get(id)
            if data is None:
                (missing_native if side=='native' else missing_neural).append(id);each[side]=None;continue
            if side=='native' and data.get('sha256')!=doc['sha256']:fail('native_source_mismatch')
            if side=='neural' and (data.get('input')!=text or data.get('source_sha256')!=doc['sha256'] or data.get('offset_errors')):
                fail('neural_source_or_offset_mismatch')
            extracted=spans(text,data.get('entities'),side+':'+id)
            counts={label:metrics(score(extracted[label],target[label])) for label in LABELS}
            each[side]=counts
            for label in LABELS:accumulate(aggregate[side][label],counts[label])
        if each['native'] is not None and each['neural'] is not None:paired+=1
        by_doc.append(each)
    if not by_doc:fail('no_scored_documents')
    # To avoid comparing runs with different coverage, headline metrics use only
    # the exact paired subset. Separate coverage counts report missing outputs.
    paired_totals={side:{label:dict(tp=0,fp=0,fn=0) for label in LABELS} for side in ('native','neural')}
    for item in by_doc:
        if item['native'] is None or item['neural'] is None:continue
        for side in ('native','neural'):
            for label in LABELS:accumulate(paired_totals[side][label],item[side][label])
    return {'protocol':'pee.phase162.comparison.v1','datasetId':manifest['datasetId'],'goldProcessDeclared':method,
       'independentBenchmarkEstablished':False,'goldIndependenceExternallyVerified':False,
       'goldDocuments':len(by_doc),'pairedDocuments':paired,'missingNative':missing_native,'missingNeural':missing_neural,
       'pairedExactSpanMetrics':{side:{l:metrics(c) for l,c in lbl.items()} for side,lbl in paired_totals.items()},
       'allAvailableMetrics':{side:{l:metrics(c) for l,c in lbl.items()} for side,lbl in aggregate.items()},
       'cases':by_doc,'qualityClaimAuthorized':False,'canonicalWriteAuthorized':False,'rankingAuthorized':False,
       'note':'Exact-offset spans only; model confidence does not establish accuracy. No external annotation independence authenticated.'}

def main():
    p=argparse.ArgumentParser();p.add_argument('--manifest',required=True);p.add_argument('--native',required=True)
    p.add_argument('--neural');p.add_argument('--gold',required=True);p.add_argument('--out',required=True)
    a=p.parse_args();dest=Path(a.out)
    if dest.exists():fail('output_exists')
    mb=Path(a.manifest).read_bytes();get=lambda f:json.loads(Path(f).read_text(encoding='utf-8'))
    result=evaluate(json.loads(mb),get(a.native),get(a.neural) if a.neural else None,get(a.gold),mb)
    with dest.open('x',encoding='utf-8') as f:json.dump(result,f,ensure_ascii=False,indent=2);f.write('\n')
    print(json.dumps({'goldDocuments':result['goldDocuments'],'pairedDocuments':result['pairedDocuments'],
                      'independentBenchmarkEstablished':False}))
if __name__=='__main__':
    try:main()
    except (ValueError, OSError, TypeError, KeyError, UnicodeError) as e:print(str(e),file=sys.stderr);sys.exit(2)
