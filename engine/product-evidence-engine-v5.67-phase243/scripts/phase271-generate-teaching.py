#!/usr/bin/env python3
"""Phase271: generates src/phase271_category_teaching.ts from the private Stage-A inventories
(pee-knowledge/research-inventory/phase271/{dishwashers,air_purifiers}.json). Usage: python3 scripts/phase271-generate-teaching.py
Statements are the inventories' paraphrases, shortened to fit the store (cite suffix included, <= 300 chars, no < >).
Phase272: optional arguments CONFIG OUT HEADER (relative to scripts/..) generate another teaching file with the same
mechanism (scripts/phase272-teaching-config.json -> src/phase272_category_teaching.ts); without arguments the Phase271
file is generated exactly as before."""
import json,os,re,sys
INV=os.environ.get('PEE_INVENTORY_DIR','/home/user/pee-knowledge/research-inventory/phase271')+'/'
ROOT=os.path.join(os.path.dirname(__file__),'..')
ARGS=sys.argv[1:]
OUT=os.path.join(ROOT,ARGS[1]) if ARGS else os.path.join(ROOT,'src','phase271_category_teaching.ts')
BASIS={'proposed_method':'method_reference','source_backed_observation':'source_backed_observation','technical_principle':'source_backed_observation','original_experiment':'source_backed_observation','expert_assessment':'source_backed_observation','hypothesis':'instructor_hypothesis','manufacturer_claim':'instructor_hypothesis'}
def js(x): return json.dumps(x,ensure_ascii=False)
def short(t,n):
  t=re.sub(r'[<>\r\n]+',' ',t).replace('≤','at most ').replace('≥','at least ').strip()
  return t if len(t)<=n else t[:n].rsplit(' ',1)[0].rstrip(',;:')+'…'
CFG=json.loads(open(os.path.join(ROOT,ARGS[0]) if ARGS else os.path.join(os.path.dirname(__file__),'phase271-teaching-config.json')).read())
out=open(os.path.join(ROOT,ARGS[2]) if ARGS else os.path.join(os.path.dirname(__file__),'phase271-teaching-header.ts.txt')).read().rstrip('\n').split('\n')
for cat,c in CFG.items():
  d=json.load(open(INV+c['file']+'.json'));lab={o['id']:o['label'] for o in d['concepts']['outcomes']}
  meas=[m for m in d['measurementToOutcome'] if m['outcome'] in c['outcomes']]
  conds={x['id']:x for x in d['requiredConditions']}
  needs=[]
  for oid,al in c['outcomes'].items():
    ms=[m for m in meas if m['outcome']==oid] or [None]
    prox=[p for p in d['weakProxies'] if p['outcome']==oid]
    # Development-driven: a proxy the package states for one particle outcome applies to a sibling outcome (config).
    prox+=[p for p in d['weakProxies'] if p['attribute'] in c.get('extraProxies',{}).get(oid,[]) and p not in prox]
    for i,m in enumerate(ms):
      x=[]
      if m:
        cs=[k for k,v in conds.items() if m['measureId'] in v['appliesTo']]
        st=short(m['statement'],150)+f" {c['pkg']} ({m['status'].replace('_',' ')}; {', '.join(m['refs'][:3])})."
        x.append(f"measureId:{js(m['measureId'])},conditions:{js(cs)},outcome:S({js(st)},{js(BASIS.get(m['status'],'instructor_hypothesis'))},{js(c['src'])})")
      if i==0 and prox:
        x.append('proxies:['+','.join(f"{{attribute:{js(p['attribute'].replace('_',' '))},kind:'not_sufficient_for',note:S({js(short(p['why'],170)+' '+c['pkg']+' ('+', '.join(p.get('refs',[])[:2])+').')},'source_backed_observation',{js(c['src'])})}}" for p in prox)+']')
      needs.append(f"  TN(N({js(oid)},'outcome',{js(short(lab[oid],160)+'.')},{js(al if i==0 else [])}),{{{','.join(x)}}}),")
  for cid,(al,stm) in c['context'].items():
    needs.append(f"  TN(N({js(cid)},'environment',{js(stm)},{js(al)}),{{}}),")
  usedc=sorted({k for m in meas for k,v in conds.items() if m['measureId'] in v['appliesTo']})
  out.append(f"export const {c['const']}:CategoryTeaching252={{")
  out.append(f" categoryId:{js(cat)},version:'{c.get('version','t271.'+c['file'][:2]+'1')}',written:'2026-10-17',registry:{{aliases:{js(c['aliases'])},partPhrases:[]}},")
  subs=d['concepts'].get('subtypes',[])[:8]
  out.append(" subtypes:["+','.join(f"S({js(short(s['label'],150)+'. '+c['pkg']+' taxonomy.')},'source_backed_observation',{js(c['src'])})" for s in subs)+"],mechanisms:[],")
  out.append(" needs:[");out+=needs;out.append(" ],")
  out.append(" sourceRoutes:[],interpretation:[],applicability:[],gaps:[],")
  out.append(" conditions:["+','.join(f"{{id:{js(k)},statement:S({js('Condition: '+short(conds[k]['statement'],190))},'source_backed_observation',{js(c['src'])})}}" for k in usedc)+"],")
  out.append("};")
open(OUT,'w').write('\n'.join(out)+'\n')
print('wrote',OUT)
