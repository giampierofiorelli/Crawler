// First increment A2 (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
// owner-first-increment-authorisation-2026-10-21.md): "Correggi il contratto verticale e aggiungi test di
// raggiungibilità effettiva dei moduli, non soltanto di presenza degli export."
// The external audit found that the contract said knowledge_statements and product_facts were on no user path while
// adviseFromRequest253 imported them (introduced by R3-P stage 2 without updating the contract). The existing checks
// were one-directional: an export existed, an 'operational' module was reachable; a module claimed off-path could be
// imported without any test failing. These tests compare the contract with the real path in both directions:
//  - imported: the runtime import closure of the entry module (compiled code) equals the recorded list;
//  - executed: V8 coverage of the advice calls (setup excluded) per option configuration equals the recorded sets;
//  - every registered scientific module's requestPath class follows from those two measurements.
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,readdirSync,mkdtempSync,rmSync,statSync} from 'node:fs';import {join} from 'node:path';import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';

const ROOT=new URL('../../',import.meta.url).pathname;
const C=JSON.parse(readFileSync(ROOT+'docs/architecture/vertical-contract.json','utf8'));
const DIST=ROOT+'dist/src/';
const IMPORT=/(?:^|[;\n])\s*(?:import|export)\s[^;]*?from\s*['"](\.\/[^'"]+)['"]|import\(\s*['"](\.\/[^'"]+)['"]\s*\)/g;
const deps=(m:string)=>[...new Set([...readFileSync(DIST+m+'.js','utf8').matchAll(IMPORT)].map(x=>(x[1]??x[2]).replace(/^\.\//,'').replace(/\.js$/,'')))];
function closure(entry:string){const seen=new Set([entry]);const st=[entry];while(st.length)for(const d of deps(st.pop()!))if(!seen.has(d)){seen.add(d);st.push(d);}return seen;}
function executed(config:string):string[]{
 const dir=mkdtempSync(join(tmpdir(),'pee-i1-cov-'));
 try{const r=spawnSync(process.execPath,[ROOT+'dist/tests/request_path_probe.js',config],{env:{...process.env,NODE_V8_COVERAGE:dir,NODE_NO_WARNINGS:'1'},encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);
  const last=readdirSync(dir).map(f=>({f,t:statSync(join(dir,f)).mtimeMs})).sort((a,b)=>a.t-b.t).at(-1)!.f;
  const j=JSON.parse(readFileSync(join(dir,last),'utf8')) as {result:{url:string;functions:{functionName:string;ranges:{count:number}[]}[]}[]};
  const out=new Set<string>();
  for(const s of j.result){const m=/\/dist\/src\/([^/]+)\.js$/.exec(s.url);if(m&&s.functions.some(fn=>fn.functionName!==''&&fn.ranges[0].count>0))out.add(m[1]);}
  return [...out].sort();}
 finally{rmSync(dir,{recursive:true,force:true});}
}
const R=C.reachability;
const entry=R.entry.split('.')[0];

test('A2: the recorded request-path imports equal the runtime import closure of the entry module', ()=>{
 assert.deepEqual([...closure(entry)].sort(),R.requestPathImports,
  'the real request path changed: review the change, then update reachability.requestPathImports and each module requestPath in the contract');
});

const MEASURED:Record<string,string[]>={};
for(const cfg of Object.keys(R.executed))MEASURED[cfg]=executed(cfg);

test('A2: the recorded executed modules equal the measured execution of the advice calls, per option', ()=>{
 assert.deepEqual(Object.keys(R.executed).sort(),['default','needInterpretation','quantity','scientific98']);
 for(const [cfg,mods] of Object.entries(R.executed))assert.deepEqual(MEASURED[cfg],mods,`${cfg}: executed modules differ from the contract`);
 assert.ok(MEASURED.default.includes('phase253_request_advice'),'non-vacuous: the entry module itself runs');
});

test('A2: every registered scientific module states its measured request-path class, in both directions', ()=>{
 const imp=closure(entry);
 const cls=(m:string)=>{const id=m.replace(/\.ts$/,'');if(MEASURED.default.includes(id))return 'executed_by_default';
  const opt=['quantity','needInterpretation','scientific98'].filter(k=>MEASURED[k].includes(id));if(opt.length)return 'executed_with_opt_in:'+opt.join('+');
  return imp.has(id)?'imported_not_executed':'not_imported';};
 for(const m of C.scientificCapabilities.modules as {module:string;status:string;requestPath:string;consumer:string}[]){
  assert.equal(m.requestPath,cls(m.module),`${m.module}: the contract says ${m.requestPath}`);
  // a module the request path executes cannot be described as on no path, and a shadow module cannot run by default
  if(m.requestPath!=='not_imported')assert.ok(!/none on any path|evaluation scripts only|tests only/.test(m.consumer),`${m.module}: consumer text denies a measured reach`);
  if(m.requestPath==='executed_by_default')assert.equal(m.status,'operational',`${m.module} runs on every request but is not declared operational`);
  if(m.requestPath.startsWith('executed_with_opt_in'))assert.notEqual(m.status,'shadow',`${m.module} runs under an option but is declared shadow`);}
});

test('A2: the stale R3-P claims are corrected and the correction is dated, not silently rewritten', ()=>{
 const reg=new Map((C.scientificCapabilities.modules as {module:string}[]).map(m=>[m.module,m]));
 for(const m of ['knowledge_statements.ts','product_facts.ts','need_interpretation.ts','language_scope.ts'])assert.ok(reg.has(m),m+' registered');
 const d30=C.openDebt.find((d:{id:string})=>d.id==='D30');
 assert.ok(d30.corrections?.some((c:{date:string;what:string})=>c.date==='2026-10-21'&&/superseded/.test(c.what)));
});
