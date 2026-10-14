import subprocess,re,json,pathlib
base=pathlib.Path('docs/phase202/test-logs')
groups={
 'companion':['python3','-m','unittest','discover','-s','tests-companion','-p','test_phase*.py'],
 'primary':['python3','-m','unittest','discover','-s','primary_sources','-t','.','-p','test_*.py'],
 'ingestion':['python3','-m','unittest','discover','-s','ingestion','-p','test_*.py'],
 'evaluation':['python3','-m','unittest','discover','-s','evaluation','-t','.','-p','test_*.py'],
 'phase95':['python3','-m','unittest','discover','-s','phase95','-p','test_*.py'],
 'tests-python':['python3','-m','unittest','discover','-s','tests-python','-p','test_*.py'],
}
results=[]
for name,cmd in groups.items():
 try:
  p=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,timeout=90)
  (base/f'python-{name}.log').write_text(p.stdout)
  nums=re.findall(r'Ran (\d+) tests?',p.stdout)
  r={'group':name,'passed':int(nums[-1]) if nums else 0,'success':p.returncode==0,'command':cmd}
 except subprocess.TimeoutExpired as e:
  r={'group':name,'passed':0,'success':False,'timeout':True,'command':cmd}
 results.append(r);print(r,flush=True)
(base/'python-summary.json').write_text(json.dumps({'groups':results,'count':sum(r['passed'] for r in results),'allPassed':all(r['success'] for r in results)},indent=2))
