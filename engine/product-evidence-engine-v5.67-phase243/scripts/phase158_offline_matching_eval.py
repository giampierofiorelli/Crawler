#!/usr/bin/env python3
"""Offline research-only supervised diagnostic on historical Ditto/WDC title pairs.

Never writes a model into PEE or treats supervised WDC labels as publisher review evidence.
Frozen `train.txt.small`/`valid.txt.small` used to fit/select, `test.txt` held out.
The WDC pair record rights are not established for redistributing a trained model.
"""
import argparse, hashlib, io, json, math, re, sys, time, zipfile
from collections import Counter
from difflib import SequenceMatcher
from pathlib import Path
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
sys.path.insert(0, str(Path(__file__).resolve().parent))
from phase157_wdc_eval import CATEGORIES,parse_row,codes,weak_prediction

TOKENS=re.compile(r'[a-z0-9]+')
def features(a,b):
    # All these are inference-time implementable without external services.
    a=a.removeprefix('COL title VAL ').lower();b=b.removeprefix('COL title VAL ').lower()
    ts=[set(TOKENS.findall(v)) for v in (a,b)]
    aa,bb=ts
    shared=len(aa&bb); union=len(aa|bb)
    ca,cb=codes(a),codes(b)
    da={x for x in aa if re.search(r'\d',x)}
    db={x for x in bb if re.search(r'\d',x)}
    useful=lambda x: len(x)>=3 and x not in {'product','model','store','online','sale','with','shop','item','null'}
    a3={x for x in aa if useful(x)};b3={x for x in bb if useful(x)}
    digitsa=set(re.findall(r'\d{3,}',a));digitsb=set(re.findall(r'\d{3,}',b))
    return [
        shared/max(1,union),shared/max(1,min(len(aa),len(bb))),
        len(a3&b3)/max(1,len(a3|b3)),
        float(bool(ca&cb)),float(bool(ca and cb and not(ca&cb))),
        len(da&db)/max(1,len(da|db)),float(bool(da and db and not da&db)),
        float(bool(digitsa&digitsb)),float(bool(digitsa and digitsb and not(digitsa&digitsb))),
        SequenceMatcher(None,a[:160],b[:160],autojunk=False).ratio(),
        min(len(a),len(b))/max(1,max(len(a),len(b))),
        math.log1p(shared),
    ]

def load(z,cat,split):
    name=f'ditto-master/data/wdc/{cat}/{split}'
    contents=z.read(name);rows=[];bad=0
    for ln in io.StringIO(contents.decode('utf-8','replace')):
        row=parse_row(ln)
        if row:rows.append(row)
        else:bad+=1
    return rows,{'source':name,'sha256':hashlib.sha256(contents).hexdigest(),'records':len(rows),'excluded_malformed':bad}

def score(y,prob,threshold):
    c=Counter()
    for gold,p in zip(y,prob):
        c['n']+=1;c['gold_positive']+=int(gold)
        if p>=threshold:
            c['candidates']+=1;c['tp' if gold else 'fp']+=1
        else:
            c['abstained']+=1
    return {'records':c['n'],'gold_positive':c['gold_positive'],'proposed_matches':c['candidates'],
        'true_positive':c['tp'],'false_positive':c['fp'],'abstained':c['abstained'],
        'precision_on_positive_proposals':round(c['tp']/c['candidates'],5) if c['candidates'] else None,
        'gold_positive_recall':round(c['tp']/c['gold_positive'],5) if c['gold_positive'] else None,
        'proposal_coverage':round(c['candidates']/c['n'],5) if c['n'] else None}

def decision_threshold(y,p):
    # pre-committed candidates, pick highest positive recall with validation precision >= 98%
    thresholds=[.80,.85,.90,.92,.94,.96,.97,.98,.99,.995,.999]
    viable=[(t,score(y,p,t)) for t in thresholds]
    ok=[(t,s) for t,s in viable if s['proposed_matches']>=10 and s['precision_on_positive_proposals']>=.98]
    return (min(ok,key=lambda t:t[0])[0],'validation_precision_ge_98_and_10_candidates') if ok else (1.0,'no_threshold_meets_validation_gate_all_abstain')

def run(archive):
    tic=time.perf_counter()
    with zipfile.ZipFile(archive) as z:
        sets={cat:{} for cat in CATEGORIES};inventory={}
        for cat in CATEGORIES:
            for split in ('train.txt.small','valid.txt.small','test.txt'):
                sets[cat][split], meta=load(z,cat,split);inventory[f'{cat}/{split}']=meta
    def xy(rows):return np.asarray([features(a,b) for a,b,_ in rows],dtype=float),np.asarray([g for _,_,g in rows],dtype=int)
    def train(train,valid,test):
        x,y=xy(train); xv,yv=xy(valid);xt,yt=xy(test)
        model=make_pipeline(StandardScaler(),LogisticRegression(max_iter=500,random_state=17,class_weight=None))
        model.fit(x,y)
        pv=model.predict_proba(xv)[:,1];pt=model.predict_proba(xt)[:,1]
        threshold,reason=decision_threshold(yv,pv)
        return {'train_records':len(train),'validation_records':len(valid),'test_records':len(test),
                'threshold_selected_using_validation_only':threshold,'threshold_decision':reason,
                'validation':score(yv,pv,threshold),'heldout_test':score(yt,pt,threshold),
                'closed_world_test_accuracy_at_0_5':round(float(np.mean((pt>=.5)==yt)),5),
                'reference_token_overlap_on_heldout':score(yt,[float(weak_prediction(a,b)=='match_candidate') for a,b,_ in test],.5)}
    pooled=train(sum((sets[c]['train.txt.small'] for c in CATEGORIES),[]),
                 sum((sets[c]['valid.txt.small'] for c in CATEGORIES),[]),
                 sum((sets[c]['test.txt'] for c in CATEGORIES),[]))
    cross={}
    for holdout in CATEGORIES:
        other=[c for c in CATEGORIES if c!=holdout]
        cross[holdout]=train(sum((sets[c]['train.txt.small'] for c in other),[]),
            sum((sets[c]['valid.txt.small'] for c in other),[]),sets[holdout]['test.txt'])
    return {'phase':158,'experiment':'research-only supervised product-pair matcher',
            'model_type':'standardized_logistic_regression_with_12_handcoded_features',
            'learned_neural_weights_loaded':False,'PEE_mainline_benchmarked':False,
            'identity_merge_allowed':False,'trained_weights_distributed':False,
            'dataset':'historical Ditto bundled WDC pair datasets, not 2024 WDC Products benchmark',
            'rights_to_train_or_redistribute_model_not_cleared':True,
            'split_warning':'Original train/validation/test pair splits may reuse entities; cross-category tests hold out categories but do not validate unseen product-review performance.',
            'threshold_policy':'candidate precision >=0.98 on validation, >=10 proposals; otherwise abstain',
            'data_inventory':inventory,'pooled':pooled,'cross_category_holdout':cross,
            'elapsed_seconds':round(time.perf_counter()-tic,2)}
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--ditto-zip',required=True);ap.add_argument('--output',required=True)
    args=ap.parse_args();data=run(args.ditto_zip)
    Path(args.output).write_text(json.dumps(data,indent=2,sort_keys=True)+'\n')
    print(json.dumps({'pooled':data['pooled'],'cross_category':{k:v['heldout_test'] for k,v in data['cross_category_holdout'].items()},'runtime_seconds':data['elapsed_seconds']},indent=2))
