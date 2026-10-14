import json, os, re, subprocess, pathlib, sys
root=pathlib.Path(__file__).resolve().parents[1]; os.chdir(root)
p=root/'evaluation/phase177';p.mkdir(exist_ok=True)
files=sorted((root/'dist/tests').glob('*.test.js'))
files=[f for f in files if f.name not in {'phase91_watch_gate.test.js','phase92_recipe_lifecycle.test.js'}]
print('eligible',len(files), flush=True)
results=[]; count=0
for i in range(0,len(files),11):
 group=files[i:i+11];g=i//11+1
 args=['node','--test','--test-concurrency=3',*[str(x.relative_to(root)) for x in group]]
 try:
  p1=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,encoding='utf-8',timeout=95)
  out=p1.stdout; n=re.search(r'^# tests (\d+)\s*$',out,re.M); failed=re.search(r'^# fail (\d+)\s*$',out,re.M)
  good=p1.returncode==0 and bool(n) and bool(failed) and int(failed[1])==0
  item={'group':g,'files':len(group),'tests':int(n[1]) if n else None,'fail':int(failed[1]) if failed else None,'returncode':p1.returncode,'allPass':good}
  print('TS',g,'PASS' if good else 'FAILED',item['tests'],flush=True)
  if not good:print(out[-1300:],flush=True)
 except subprocess.TimeoutExpired:
  item={'group':g,'files':len(group),'tests':None,'timeout':True,'allPass':False};print('TS',g,'TIMEOUT',flush=True)
 results.append(item)
 if item['allPass']:count+=item['tests']
 (p/'regression-ts.json').write_text(json.dumps({'phase':177,'eligibleFiles':len(files),'groupsExecuted':len(results),'passed':count,'allGroupsPass':all(x['allPass'] for x in results) and sum(x['files'] for x in results)==len(files),'results':results},indent=2)+'\n')
 if not item['allPass']:sys.exit(1)
commands=[['python','-m','unittest','discover','-s','evaluation','-t','.','-p','test_*.py'],['python','-m','unittest','discover','-s','ingestion','-p','test_*.py'],['python','-m','unittest','discover','-s','phase95','-p','test_*.py'],['python','-m','unittest','discover','-s','primary_sources','-t','.','-p','test_*.py'],['python','-m','unittest','discover','-s','tests-python','-p','test_*.py'],['python','-m','unittest','discover','-s','tests-companion','-p','test_phase*.py']]
pyresults=[];ptot=0
for j,cmd in enumerate(commands,1):
 try:
  x=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,encoding='utf-8',timeout=95)
  out=x.stdout;n=re.search(r'Ran (\d+) tests?',out);good=x.returncode==0 and bool(n)
  item={'group':j,'command':' '.join(cmd),'tests':int(n[1]) if n else None,'returncode':x.returncode,'allPass':good,'resourceWarnings':out.count('ResourceWarning')}
  print('PY',j,'PASS' if good else 'FAILED',item['tests'],flush=True)
  if not good:print(out[-1100:],flush=True)
 except subprocess.TimeoutExpired:
  item={'group':j,'command':' '.join(cmd),'tests':None,'timeout':True,'allPass':False};print('PY',j,'TIMEOUT',flush=True)
 pyresults.append(item)
 if item['allPass']:ptot+=item['tests']
 (p/'regression-python.json').write_text(json.dumps({'phase':177,'groupsExecuted':len(pyresults),'passed':ptot,'allGroupsPass':all(x['allPass'] for x in pyresults) and len(pyresults)==len(commands),'results':pyresults},indent=2)+'\n')
 if not item['allPass']:sys.exit(2)
