from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess,re,json,time
root=Path(__file__).resolve().parents[1]
files=sorted(x.name for x in (root/'dist/tests').glob('*.test.js'))
logdir=root/'docs/phase243/test-logs'

def run(args):
 sh,chunks=args
 result=[]
 for j,chunk in enumerate(chunks):
  names=[f'dist/tests/{x}' for x in chunk]
  try:
   p=subprocess.run(['node','--test','--test-concurrency=2',*names],cwd=root,
    capture_output=True,text=True,timeout=230)
   txt=p.stdout+'\n'+p.stderr
   (logdir/f'phase243-slow-shard{sh:02}-part{j+1}.txt').write_text(txt)
   n=re.search(r'^# tests (\d+)',txt,re.M)
   f=re.search(r'^# fail (\d+)',txt,re.M)
   result.append({'part':j+1,'tests':int(n[1]) if n else None,'fail':int(f[1]) if f else None,
    'status':'passed' if p.returncode==0 and n and f and int(f[1])==0 else 'failed'})
  except subprocess.TimeoutExpired as e:
   result.append({'part':j+1,'status':'timeout','tests':None,'fail':None})
 return {'shard':sh,'parts':result}
shards=[(13,[files[156:161],files[161:166],files[166:169]]),
 (15,[files[182:187],files[187:192],files[192:195]])]
with ThreadPoolExecutor(max_workers=2) as ex:
 res=list(ex.map(run,shards))
(logdir/'phase243-slow-rerun.json').write_text(json.dumps(res,indent=2)+'\n')
print(json.dumps(res,indent=2),flush=True)
