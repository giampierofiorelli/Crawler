# S84: static import graph of src/ and reachability from the operational entry points (advice, ingestion, acquisition scripts).
# Usage: python3 scripts/s84-module-graph.py OUT.json   (run from the engine directory)
import re,os,json,glob,sys
src='src';mods={f[:-3] for f in os.listdir(src) if f.endswith('.ts')}
imp={}
for m in mods:
  t=open(f'{src}/{m}.ts').read()
  imp[m]=sorted({x for x in re.findall(r"from\s+'\./([a-z0-9_]+)\.js'",t)+re.findall(r"import\(\s*'\./([a-z0-9_]+)\.js'",t) if x in mods})
def scripts_refs(path):
  t=open(path).read();return {x for x in re.findall(r"(?:dist/src/|D\s*\+\s*'|\.\./dist/src/)([a-z0-9_]+)\.js",t) if x in mods}
def reach(roots):
  seen=set();st=list(roots)
  while st:
    m=st.pop()
    if m in seen: continue
    seen.add(m);st+=imp.get(m,[])
  return seen
entries={
 'advice':{'phase253_request_advice'},
 'ingestion':scripts_refs('scripts/phase246-knowledge.mjs'),
 'acquisition':set().union(*[scripts_refs(f'scripts/{s}') for s in ['phase246-live-wave.mjs','phase257-research-policy.mjs','phase258-source-pilot.mjs','phase261-discovery-pilot.mjs','phase262-search-pilot.mjs','phase264-metadata-pilot.mjs','phase266-authentic-pilot.mjs','phase269-qualitative-pilot.mjs','phase254-research-needs.mjs']]),
}
R={k:reach(v) for k,v in entries.items()}
op=set().union(*R.values())
# consumers of each module: importers in src, tests, scripts
tests={os.path.basename(f):open(f).read() for f in glob.glob('tests/*.ts')}
scr={os.path.basename(f):open(f).read() for f in glob.glob('scripts/*.mjs')}
rev={m:[k for k in imp if m in imp[k]] for m in mods}
rows=[]
for m in sorted(mods):
  nt=sum(1 for t in tests.values() if f"/{m}.js'" in t or f"/{m}.js\"" in t)
  ns=sum(1 for t in scr.values() if f"{m}.js" in t)
  rows.append({'module':m,'lines':sum(1 for _ in open(f'{src}/{m}.ts')),'advice':m in R['advice'],'ingestion':m in R['ingestion'],'acquisition':m in R['acquisition'],'srcImporters':len(rev[m]),'tests':nt,'scripts':ns})
json.dump({'entries':{k:sorted(v) for k,v in entries.items()},'rows':rows,'imports':imp},open(sys.argv[1],'w'),indent=1)
print('modules',len(mods),'lines',sum(r['lines'] for r in rows))
for k in R: print(k,len(R[k]),sum(r['lines'] for r in rows if r[k]))
print('operational (any)',len(op),sum(r['lines'] for r in rows if r['module'] in op))
off=[r for r in rows if r['module'] not in op]
print('off-path',len(off),sum(r['lines'] for r in off))
print('off-path with no src importer and no script:',[r['module'] for r in off if r['srcImporters']==0 and r['scripts']==0][:80])
