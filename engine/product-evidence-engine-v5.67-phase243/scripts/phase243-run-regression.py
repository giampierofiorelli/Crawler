from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import subprocess,json,re,time
root=Path(__file__).resolve().parents[1]
logdir=root/'docs/phase243/test-logs'
logdir.mkdir(parents=True,exist_ok=True)
start=time.monotonic()

def run(i):
  try:
    p=subprocess.run(['node','scripts/run-test-shards.mjs',str(i)],cwd=root,text=True,
      stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=230)
    txt=p.stdout
    (logdir/f'phase243-shard-{i:02}.txt').write_text(txt)
    m=re.search(r'^(\d+) compiled JavaScript/TypeScript tests passed',txt,re.M)
    return {'shard':i,'passed':int(m.group(1)) if m else 0,'status':'passed' if p.returncode==0 and m else 'failed','exit':p.returncode}
  except subprocess.TimeoutExpired as e:
    (logdir/f'phase243-shard-{i:02}.txt').write_text(str(e))
    return {'shard':i,'passed':0,'status':'timeout'}
with ThreadPoolExecutor(max_workers=3) as ex:
  results=sorted([f.result() for f in as_completed([ex.submit(run,i) for i in range(1,18)])],key=lambda x:x['shard'])
summary={'schema':'pee243.test-results.v1','elapsed_seconds':round(time.monotonic()-start,2),
 'shards':results,'total_passed':sum(x['passed'] for x in results),
 'failed_shards':[x['shard'] for x in results if x['status']!='passed']}
(root/'docs/phase243/PHASE243-TEST-RESULTS.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary,indent=2),flush=True)
