import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {fileURLToPath} from 'node:url';

// Principle 2 / 10 fitness check: the machine-readable vertical contract stays true to the code. A component that
// disappears, a cited fitness test that is removed, an undefined status or an implemented stage without a test fails.
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..','..');
const C=JSON.parse(readFileSync(resolve(root,'docs/architecture/vertical-contract.json'),'utf8'));
const ORDER=['request','goal_interpretation','technical_requirements','candidate_discovery','authentic_evidence','attribution','evidence_validation',
 'comparable_assessment','authorised_ranking','explainable_answer'];

test('the contract lists every essential stage, in order, with defined statuses',()=>{
 assert.equal(C.schema,'pee.vertical-contract.v1');
 assert.deepEqual(C.stages.map((s:{id:string})=>s.id),ORDER);
 for(const s of [...C.stages,...C.surfaces])assert.ok(Object.keys(C.statusClasses).includes(s.status),s.id);
 const ids=new Set(C.stages.map((s:{id:string})=>s.id));
 for(const s of C.stages)for(const c of s.consumers)assert.ok(ids.has(c),`${s.id} -> ${c}`);
});

test('every named component exists as an export, and every non-missing stage cites existing fitness tests',async()=>{
 for(const s of [...C.stages,...C.surfaces,{id:'entry',components:[C.entryPoint],status:'x',fitnessTests:['tests/vertical_path_fitness.test.ts']}]){
  for(const c of s.components){const m=await import(resolve(root,'dist/src',c.module+'.js'));assert.equal(typeof m[c.export],'function',`${s.id}: ${c.module}.${c.export}`);}
  if(s.status!=='not_implemented'&&s.status!=='disconnected'){assert.ok(s.fitnessTests?.length,`${s.id} needs a fitness test`);
   for(const f of s.fitnessTests)assert.ok(existsSync(resolve(root,f)),`${s.id}: ${f}`);}
  if(s.status==='not_implemented')assert.equal(s.components.length,0,`${s.id}: not_implemented must not name components`);
 }
});

test('open debt stays tracked until a stage is genuinely connected',()=>{
 const notDone=C.stages.filter((s:{status:string})=>s.status==='not_implemented'||s.status==='blocked').map((s:{id:string})=>s.id);
 for(const id of notDone)assert.ok(C.openDebt.some((d:{stage?:string})=>d.stage===id),`${id} must be listed as open debt`);
 for(const s of C.surfaces.filter((x:{status:string})=>x.status==='disconnected'))assert.ok(C.openDebt.some((d:{surface?:string})=>d.surface===s.id),s.id);
});

test('principle 11: every stage records its authentic validation; synthetic-only work names what it waits for',()=>{
 const R=C.authenticValidationRequirement;assert.ok(R&&/authentic external evidence/.test(R.rule));
 assert.deepEqual(Object.keys(R.tiers),['T1_synthetic','T2_authentic_controlled','T3_operational']);
 for(const s of C.stages){const a=s.authenticValidation;assert.ok(a,`${s.id} must record authentic validation`);
  assert.ok(['done','pending'].includes(a.status),s.id);
  if(a.status==='done'){assert.ok(Object.keys(R.tiers).includes(a.tier),s.id);assert.ok(a.run,`${s.id}: name the run`);}
  else assert.ok(a.waitsFor,`${s.id}: name what authentic validation waits for`);
  if(s.status==='authentic_verified')assert.equal(a.tier,'T3_operational',`${s.id}: authentic_verified means operational`);
  if(s.status==='synthetic_verified')assert.notEqual(a.tier,'T3_operational',`${s.id}: synthetic_verified cannot claim an operational run`);}
});
