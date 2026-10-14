"""Isolated regression over eligible TS tests; historic Phase91/92 quarantined."""
import pathlib,subprocess,json,re,sys
root=pathlib.Path(__file__).resolve().parent.parent
files=sorted((root/'dist'/'tests').glob('*.test.js'))
eligible=[str(x.relative_to(root)) for x in files if not x.name.startswith(('phase91_','phase92_'))]
groups=[eligible[i:i+11] for i in range(0,len(eligible),11)]
results=[]
for i,g in enumerate(groups,1):
 try:
  p=subprocess.run(['node','--test','--test-concurrency=3',*g],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,timeout=100)
  m=re.search(r'^# tests (\d+)$',p.stdout,re.M);f=re.search(r'^# fail (\d+)$',p.stdout,re.M)
  entry={'group':i,'files':len(g),'tests':int(m.group(1)) if m else None,'fail':int(f.group(1)) if f else None,'returncode':p.returncode}
  if p.returncode or m is None or f is None or entry['fail']:entry['tail']=(p.stdout+'\n'+p.stderr)[-6000:]
  results.append(entry);print(entry,flush=True)
  if 'tail' in entry:break
 except subprocess.TimeoutExpired:
  results.append({'group':i,'files':len(g),'timeout':True});print(results[-1],flush=True);break
out={'phase':188,'scope':'eligible TypeScript suites excluding historic Phase91/92','totalEligibleFiles':len(eligible),'groupsPlanned':len(groups),'groupsExecuted':len(results),
 'passed':sum(r.get('tests') or 0 for r in results if r.get('returncode')==0),'failed':sum(r.get('fail') or 0 for r in results),
 'allGroupsPass':len(results)==len(groups) and all(r.get('returncode')==0 and r.get('fail')==0 for r in results),'results':results}
(root/'evaluation'/'phase188'/'regression-ts.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({k:v for k,v in out.items() if k!='results'}),flush=True)
sys.exit(0 if out['allGroupsPass'] else 1)
