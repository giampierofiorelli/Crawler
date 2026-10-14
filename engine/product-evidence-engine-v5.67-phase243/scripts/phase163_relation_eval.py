#!/usr/bin/env python3
"""Exact source-span typed-relation research evaluation, no quality certification.

Requires separately authored gold. Never promotes a model link to scientific
proof, and rejects misleading independent-annotation declarations.
"""
import argparse
import hashlib
import json
from pathlib import Path
from phase162_benchmark import sha, fail

TYPES={'product_has_feature','feature_has_measurement','product_compared_with'}

def offset_text(text,part):
    if not isinstance(part,dict):fail('relation_endpoint_not_object')
    a,b=part.get('start'),part.get('end')
    if type(a) is not int or type(b) is not int or not 0<=a<b<=len(text.encode('utf-16-le'))//2:
        fail('relation_endpoint_invalid_offsets')
    try:surface=text.encode('utf-16-le')[2*a:2*b].decode('utf-16-le',errors='strict')
    except UnicodeDecodeError:fail('relation_endpoint_splits_surrogate')
    if surface!=part.get('text'):fail('relation_endpoint_text_mismatch')
    return a,b

def validate_relations(text,rels,gold=False):
    if not isinstance(rels,list) or len(rels)>150:fail('relation_budget')
    result=set();typed=set()
    for item in rels:
        if not isinstance(item,dict) or item.get('type') not in TYPES:fail('relation_type_invalid')
        head=offset_text(text,item.get('head'));tail=offset_text(text,item.get('tail'))
        if head==tail:fail('relation_self_loop')
        key=(item['type'],*head,*tail)
        if key in result:fail('duplicate_relation')
        result.add(key)
        if gold:
            continue
        if any(item.get(flag) is not False for flag in
               ('scientificEvidence','canonicalWriteAuthorized','rankingAuthorized','identityVerified')):
            fail('neural_relation_claims_unearned_authority')
        if item.get('entityTypeCheck')=='matched':
            typed.add(key)
        elif item.get('entityTypeCheck')!='mismatch_or_missing':
            fail('relation_entity_type_unreviewed')
    return result,typed

def ratio(a,b):return round(a/b,5) if b else None

def evaluate(manifest,coordinate,gold):
    if (manifest.get('protocol')!='pee.phase160.batch.v1' or coordinate.get('protocol')!='pee.phase161.coordination.v1' or
        gold.get('protocol')!='pee.phase163.relation.gold.v1'):
        fail('protocol_invalid')
    if not (manifest.get('datasetId')==coordinate.get('datasetId')==gold.get('datasetId')):
        fail('dataset_mismatch')
    if gold.get('annotationProcess') not in ('developer_constructed','external_human_unverified'):
        fail('gold_process_unverified')
    docs={d['id']:d for d in manifest.get('documents',[])}
    cases={r['id']:r for r in coordinate.get('cases',[])}
    goldcases=gold.get('cases',{})
    if not docs or not isinstance(goldcases,dict) or not goldcases or not set(goldcases).issubset(docs):
        fail('invalid_gold_cases')
    if len(cases)!=len(docs) or set(cases)!=set(docs) or len(coordinate.get('cases',[]))!=len(cases):fail('incomplete_coordinate_cases')
    counts=dict(tp=0,fp=0,fn=0);typed_counts=dict(tp=0,fp=0,fn=0)
    per=[];missing=[]
    for id in sorted(goldcases):
        doc=docs[id];case=cases[id];g=goldcases[id]
        if sha(doc['text'])!=doc['sha256'] or g.get('sha256')!=doc['sha256'] or case.get('documentSha256')!=doc['sha256']:
            fail('source_digest_mismatch')
        if gold['annotationProcess']=='developer_constructed' and doc['kind']!='constructed':
            fail('developer_gold_cannot_claim_publisher_review')
        truth,_=validate_relations(doc['text'],g.get('relations'),gold=True)
        if case.get('result')!='processed' or not case.get('neuralProcessed'):
            missing.append(id);continue
        predicted,typed=validate_relations(doc['text'],case.get('relationCandidates'),gold=False)
        for dest,pr in ((counts,predicted),(typed_counts,typed)):
            dest['tp']+=len(truth&pr);dest['fp']+=len(pr-truth);dest['fn']+=len(truth-pr)
        per.append({'id':id,'gold':len(truth),'proposed':len(predicted),'typedMatched':len(typed),
                    'exactMatches':len(truth&predicted)})
    result={'protocol':'pee.phase163.relation.evaluation.v1','datasetId':manifest['datasetId'],
     'goldProcessDeclared':gold['annotationProcess'],'independentBenchmarkEstablished':False,
     'scoredDocuments':len(per),'missingOrQuarantined':missing,
     'candidateCounts':{**counts,'precision':ratio(counts['tp'],counts['tp']+counts['fp']),
                        'recall':ratio(counts['tp'],counts['tp']+counts['fn'])},
     'typedMatchedCounts':{**typed_counts,'precision':ratio(typed_counts['tp'],typed_counts['tp']+typed_counts['fp']),
                          'recall':ratio(typed_counts['tp'],typed_counts['tp']+typed_counts['fn'])},
     'cases':per,'rankingAuthorized':False,'canonicalWriteAuthorized':False,
     'qualityClaimAuthorized':False,
     'note':'Developer labels or externally unverified annotations are not independent expert-review gold.'}
    return result

def main():
    p=argparse.ArgumentParser();p.add_argument('--manifest',required=True);p.add_argument('--coordination',required=True)
    p.add_argument('--gold',required=True);p.add_argument('--out',required=True)
    a=p.parse_args();load=lambda p:json.loads(Path(p).read_text())
    result=evaluate(load(a.manifest),load(a.coordination),load(a.gold))
    out=Path(a.out)
    with out.open('x',encoding='utf-8') as f:json.dump(result,f,indent=2,ensure_ascii=False)
    print(json.dumps({'documents':result['scoredDocuments'],'independentBenchmarkEstablished':False}))
if __name__=='__main__':main()
