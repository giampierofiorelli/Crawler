"""Re-run the six inherited Python test groups without changing their semantics."""
import pathlib,subprocess,json,re,sys
root=pathlib.Path(__file__).resolve().parent.parent
commands=[
 ['python','-m','unittest','discover','-s','evaluation','-t','.','-p','test_*.py'],
 ['python','-m','unittest','discover','-s','ingestion','-p','test_*.py'],
 ['python','-m','unittest','discover','-s','phase95','-p','test_*.py'],
 ['python','-m','unittest','discover','-s','primary_sources','-t','.','-p','test_*.py'],
 ['python','-m','unittest','discover','-s','tests-python','-p','test_*.py'],
 ['python','-m','unittest','discover','-s','tests-companion','-p','test_phase*.py'],
]
results=[]
for c in commands:
 try:
  p=subprocess.run(c,cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=150)
  v=re.search(r'Ran (\d+) tests?',p.stderr+p.stdout)
  counts=len(re.findall('ResourceWarning:',p.stderr+p.stdout))
  result={'command':' '.join(c),'tests':int(v.group(1)) if v else None,'returncode':p.returncode,'resourceWarningLines':counts}
  if p.returncode or not v:result['tail']=(p.stderr+p.stdout)[-3500:]
 except subprocess.TimeoutExpired:result={'command':' '.join(c),'timeout':True}
 results.append(result);print(result,flush=True)
 if result.get('returncode')!=0:break
out={'phase':174,'groupsPlanned':len(commands),'groupsExecuted':len(results),
 'passed':sum(x.get('tests') or 0 for x in results if x.get('returncode')==0),
 'allGroupsPass':len(results)==len(commands) and all(x.get('returncode')==0 for x in results), 'results':results}
(root/'evaluation'/'phase174'/'regression-python.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({k:v for k,v in out.items() if k!='results'}),flush=True)
sys.exit(0 if out['allGroupsPass'] else 1)
