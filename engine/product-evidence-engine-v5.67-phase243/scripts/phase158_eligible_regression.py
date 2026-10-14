#!/usr/bin/env python3
"""Bounded sharded regression; excludes only historical Phase91/92 suites."""
import glob,json,re,subprocess,sys,time
files=sorted(glob.glob('dist/tests/*.test.js'))
excluded=[p for p in files if p.split('/')[-1] in {'phase91_watch_gate.test.js','phase92_recipe_lifecycle.test.js'}]
selected=[p for p in files if p not in excluded]
started=time.monotonic();shards=[]
for idx in range(0,len(selected),12):
    group=selected[idx:idx+12]
    try:p=subprocess.run(['node','--test','--test-concurrency=3',*group],capture_output=True,text=True,timeout=120)
    except subprocess.TimeoutExpired:
        print('TIMEOUT',idx,flush=True);sys.exit(2)
    m=re.search(r'^# tests (\d+)\s*$',p.stdout,re.M)
    f=re.search(r'^# fail (\d+)\s*$',p.stdout,re.M)
    if p.returncode!=0 or not m or not f or int(f.group(1)):
        print('FAILED',idx,p.stdout[-2000:],p.stderr[-1000:],flush=True);sys.exit(1)
    shards.append({'index':len(shards),'files':len(group),'tests':int(m.group(1)),'failed':int(f.group(1))})
    print('PASS',len(shards),len(group),'files',int(m.group(1)),'tests',flush=True)
result={'phase':158,'totalFilesDiscovered':len(files),'eligibleFiles':len(selected),'excludedFiles':excluded,
        'totalTestsPassed':sum(x['tests'] for x in shards),'failed':0,'elapsedSeconds':round(time.monotonic()-started,2),
        'shards':shards,'method':'node --test groups of 12 with 3 concurrent workers'}
with open('PHASE158-TYPESCRIPT-REGRESSION.json','w') as out:json.dump(result,out,indent=2)
print('RESULT',result['totalTestsPassed'],'tests',len(selected),'files',flush=True)
