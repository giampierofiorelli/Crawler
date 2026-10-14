#!/usr/bin/env python3
"""Bounded local regression runner; honest about Phase91/92 exclusions."""
import concurrent.futures,json,pathlib,subprocess,re,time
root=pathlib.Path(__file__).resolve().parent.parent
logs=root/'docs/phase208/test-logs'
files=sorted((root/'dist/tests').glob('*.test.js'))
shards=[files[i:i+13] for i in range(0,len(files),13)]
legacy={'phase91_watch_gate.test.js','phase92_recipe_lifecycle.test.js'}
def run(n,group):
    start=time.monotonic();names=[str(f.relative_to(root)) for f in group]
    path=logs/f'ts-group-{n:02d}.log'
    try:
        p=subprocess.run(['node','--test','--test-concurrency=2',*names],cwd=root,
                         stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,timeout=95)
        output=p.stdout
        m=re.search(r'^# tests (\d+)$',output,re.M); fail=re.search(r'^# fail (\d+)$',output,re.M)
        status='passed' if p.returncode==0 and m and fail and int(fail.group(1))==0 else 'failed_or_incomplete'
        passed=int(m.group(1)) if status=='passed' else 0
    except subprocess.TimeoutExpired as ex:
        output=ex.stdout or b''
        if isinstance(output,bytes):output=output.decode('utf8','replace')
        output+='\nTIMEOUT after 95 seconds\n';passed=0;status='timeout'
    path.write_text(output)
    return dict(shard=n,status=status,passed=passed,files=len(group),log=str(path.relative_to(root)),seconds=round(time.monotonic()-start,2))
items=[(i+1,[f for f in group if f.name not in legacy]) for i,group in enumerate(shards)]
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    futures=[pool.submit(run,i,group) for i,group in items]
    results=[]
    for f in concurrent.futures.as_completed(futures):
        v=f.result();print(f"Group {v['shard']}: {v['passed']} passed {v['status']}",flush=True);results.append(v)
results.sort(key=lambda x:x['shard'])
summary=dict(schema='phase208.local-regression',verified_passed=sum(v['passed'] for v in results),groups=results,
 legacy_not_concluded=sorted(legacy),execution_note='Independent bounded group executions, not one single full suite')
(logs/'ts-regression-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print('TOTAL VERIFIED',summary['verified_passed'],flush=True)
if any(x['status']!='passed' for x in results):raise SystemExit(2)
