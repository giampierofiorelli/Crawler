import subprocess,concurrent.futures,json,pathlib,re,time
base=pathlib.Path('docs/phase202/test-logs');base.mkdir(parents=True,exist_ok=True)
def shard(i):
 try:
  p=subprocess.run(['node','scripts/run-test-shards.mjs',str(i)],capture_output=True,text=True,timeout=110)
  out=(p.stdout or '')+'\n'+(p.stderr or '')
  (base/f'ts-shard{i}.log').write_text(out)
  n=re.search(r'(\d+) compiled JavaScript/TypeScript tests passed',out)
  return {'shard':i,'ok':p.returncode==0 and n is not None,'count':int(n.group(1)) if n else 0,'tail':out[-350:]}
 except subprocess.TimeoutExpired as e:
  (base/f'ts-shard{i}.log').write_text('TIMEOUT 110 seconds\n'+str(e))
  return {'shard':i,'ok':False,'count':0,'timeout':True}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 futures={pool.submit(shard,i):i for i in range(1,14)}
 results=[]
 for f in concurrent.futures.as_completed(futures):
  r=f.result();results.append(r); print(r,flush=True)
results.sort(key=lambda x:x['shard'])
(base/'ts-summary.json').write_text(json.dumps({'results':results,'passedCount':sum(r['count'] for r in results),'allPassed':all(r['ok'] for r in results)},indent=2))
