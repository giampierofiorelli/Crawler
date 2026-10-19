# S84: which dist/src modules executed a named function, from a NODE_V8_COVERAGE directory.
# Usage: NODE_V8_COVERAGE=DIR node scripts/s83-advice-regression.mjs; python3 scripts/s84-coverage-summary.py DIR OUT.json
import json,glob,sys,os,re
d=sys.argv[1];mods={}
for f in glob.glob(d+'/*.json'):
  for s in json.load(open(f))['result']:
    m=re.search(r'/dist/src/([a-z0-9_]+)\.js$',s['url'])
    if not m: continue
    name=m.group(1);fs=s['functions']
    called=[x['functionName'] for x in fs if x['functionName'] and any(r['count']>0 for r in x['ranges'][:1])]
    total=[x['functionName'] for x in fs if x['functionName']]
    mods[name]={'called':len(set(called)),'named':len(set(total)),'calledNames':sorted(set(called))}
json.dump(mods,open(sys.argv[2],'w'),indent=1)
print(len(mods),'loaded;',sum(1 for v in mods.values() if v['called']>0),'with a named function executed')
print('loaded but no named function executed:',sorted(k for k,v in mods.items() if v['called']==0))
