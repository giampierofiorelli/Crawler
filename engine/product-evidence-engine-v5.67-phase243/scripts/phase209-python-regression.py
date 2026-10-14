#!/usr/bin/env python3
"""Run six inherited Python groups, logs/summary, no silent missing tests."""
import pathlib,subprocess,json,re,time
root=pathlib.Path(__file__).resolve().parent.parent
out=root/'docs/phase209/test-logs';out.mkdir(parents=True,exist_ok=True)
specs=[
('primary',['python3','-m','unittest','discover','-s','primary_sources','-t','.','-p','test_*.py']),
('ingestion',['python3','-m','unittest','discover','-s','ingestion','-p','test_*.py']),
('evaluation',['python3','-m','unittest','discover','-s','evaluation','-t','.','-p','test_*.py']),
('phase95',['python3','-m','unittest','discover','-s','phase95','-p','test_*.py']),
('tests-python',['python3','-m','unittest','discover','-s','tests-python','-p','test_*.py']),
('companion',['python3','-m','unittest','discover','-s','tests-companion','-p','test_phase*.py'])]
results=[]
for label,cmd in specs:
 start=time.monotonic()
 try:
  p=subprocess.run(cmd,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,timeout=150)
  text=p.stdout; m=re.search(r'Ran (\d+) tests? in',text)
  passed=int(m.group(1)) if p.returncode==0 and m and '\nOK' in text else 0
  status='passed' if passed else 'failed_or_unverified'
 except subprocess.TimeoutExpired as e:
  text=e.stdout or '';text=text.decode('utf8','replace') if isinstance(text,bytes) else text
  text+='\nTIMEOUT\n';passed=0;status='timeout'
 name=f'python-{label}.log';(out/name).write_text(text)
 results.append(dict(group=label,status=status,passed=passed,log=f'docs/phase209/test-logs/{name}',seconds=round(time.monotonic()-start,2)))
 print(label,passed,status,flush=True)
s=dict(schema='phase209.python-results.v1',groups=results,verifiedPassed=sum(x['passed'] for x in results))
(out/'python-summary.json').write_text(json.dumps(s,indent=2)+'\n')
if any(x['status']!='passed' for x in results):raise SystemExit(2)
