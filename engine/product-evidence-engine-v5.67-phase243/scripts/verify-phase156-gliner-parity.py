import importlib.util,json,random,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
original=str(root/'third_party/phase156_reference_sources/gliner2/overlap.py')
spec=importlib.util.spec_from_file_location('gliner2_original_overlap',original)
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
rng=random.Random(156)
fixtures=[]
for p in ['allow','nested','longest','disallow']:
 for j in range(45):
  rows=[]
  for k in range(rng.randrange(1,25)):
   start=rng.randrange(0,50)
   rows.append({'start':start,'end':start+rng.randrange(1,15),'score':rng.randrange(1,100)+k*0.0001})
  expected=module.resolve_overlaps(rows,p,score=lambda x:x['score'],start=lambda x:x['start'],end=lambda x:x['end'])
  fixtures.append({'policy':p,'spans':rows,'expected':[(r['start'],r['end'],r['score']) for r in expected]})
script="""import fs from 'node:fs';import {resolveSpans156} from './dist/src/phase156_gliner_portable.js';let a=JSON.parse(fs.readFileSync(0,'utf8'));console.log(JSON.stringify(a.map(x=>resolveSpans156(x.spans,x.policy).map(r=>[r.start,r.end,r.score]))));"""
p=subprocess.run(['node','--input-type=module','-e',script],input=json.dumps(fixtures),text=True,capture_output=True,cwd=root)
if p.returncode:print(p.stderr);raise SystemExit(1)
computed=json.loads(p.stdout)
fail=[{'policy':fixture['policy'],'fixtureIndex':i,'expected':fixture['expected'],'found':computed[i]} for i,fixture in enumerate(fixtures) if [list(x) for x in fixture['expected']]!=computed[i]]
report={'upstream':'GLiNER2 gliner2/inference/overlap.py','fixtureCount':len(fixtures),'parityMatches':len(fixtures)-len(fail),'differences':fail[:6],
 'qualityClaim':'algorithmic behavior equivalence on deterministic generated cases only; no NER prediction accuracy'}
(root/'PHASE156-UPSTREAM-OVERLAP-PARITY.json').write_text(json.dumps(report,indent=2)+'\n')
print('Matched',report['parityMatches'],'/',report['fixtureCount'],'sample failures',report['differences'][:2])
