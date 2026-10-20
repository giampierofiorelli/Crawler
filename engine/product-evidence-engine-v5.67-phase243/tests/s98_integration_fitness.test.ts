import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';

// S98 (owner decision 2026-10-20, item 8): a scientific capability may not live only in a shadow harness unnoticed. Every
// module with a scientific capability is registered in docs/architecture/vertical-contract.json (scientificCapabilities)
// with its integration status, a named consumer and a validation; the status must match runtime reachability (type-only
// imports do not count) from the operational entries, or from a named gated entry; shadow modules name their debt.
const ROOT=new URL('../../',import.meta.url).pathname;
const C=JSON.parse(readFileSync(ROOT+'docs/architecture/vertical-contract.json','utf8'));const R=C.scientificCapabilities;
const files=readdirSync(ROOT+'src').filter(f=>f.endsWith('.ts'));
const runtimeImports=(f:string)=>readFileSync(ROOT+'src/'+f,'utf8').split('\n').filter(l=>/^\s*import\s+(?!type\b)/.test(l)||/^\s*export\s+\{[^}]*\}\s+from/.test(l))
 .flatMap(l=>[...l.matchAll(/from '\.\/([^']+)\.js'/g)].map(m=>m[1]+'.ts'));
const reach=(entries:readonly string[])=>{const out=new Set<string>();const visit=(f:string)=>{if(out.has(f)||!files.includes(f))return;out.add(f);for(const g of runtimeImports(f))visit(g);};for(const e of entries)visit(e);return out;};
const SCIENTIFIC=/^(definition_|scientific_|document_evidence|document_semantics|knowledge_|quantity_knowledge|table_interpreter1g|observation_|evidence_assessment|qualitative_|product_facts|property_definitions)/;

test('every scientific module is registered with status, consumer and validation', ()=>{
 const reg=new Map(R.modules.map((m:{module:string})=>[m.module,m]));
 for(const f of files.filter(f=>SCIENTIFIC.test(f)))assert.ok(reg.has(f),`${f} has a scientific capability but no integration status in the contract`);
 for(const m of R.modules as {module:string;status:string;consumer:string;validation:string[];validationMissing?:boolean;gate?:string;integrationDebt?:string}[]){
  assert.ok(files.includes(m.module),`${m.module} is registered but does not exist`);
  assert.ok(['operational','gated','shadow'].includes(m.status),m.module);assert.ok(m.consumer&&m.consumer.length>3,`${m.module} names no consumer`);
  if(m.status!=='shadow'||!m.validationMissing)assert.ok(m.validation.length>0,`${m.module} names no validation`);
  for(const v of m.validation)assert.ok(existsSync(ROOT+v),`${m.module}: validation ${v} does not exist`);
  if(m.status==='gated')assert.ok(m.gate&&m.gate.length>3,`${m.module} is gated but names no gate`);
  if(m.status==='shadow')assert.ok(C.openDebt.some((d:{id:string})=>d.id===m.integrationDebt),`${m.module} is shadow but names no open integration debt`);}});

test('the registered status matches runtime reachability (type-only imports excluded)', ()=>{
 const op=reach(R.operationalEntries);const gated=reach([...R.operationalEntries,...R.gatedEntries.map((g:{module:string})=>g.module)]);
 for(const m of R.modules as {module:string;status:string}[]){
  if(m.status==='operational')assert.ok(op.has(m.module),`${m.module} is claimed operational but no operational entry reaches it at runtime`);
  if(m.status==='gated')assert.ok(gated.has(m.module),`${m.module} is claimed gated but no gated entry reaches it`);
  if(!gated.has(m.module))assert.equal(m.status,'shadow',`${m.module} is unreachable and must be declared shadow`);}});

test('the gated path carries the semantic-preservation validation across boundaries', ()=>{
 const sr=R.modules.find((m:{module:string})=>m.module==='scientific_reading98.ts');
 assert.ok(sr.validation.includes('tests/s98_operational_path.test.ts'),'the shared reading path is validated end to end (page -> readers -> store -> retrieval)');
 const t=readFileSync(ROOT+'tests/s98_operational_path.test.ts','utf8');
 for(const must of ['window_size','missing','product_association','scientificReadings98'])assert.ok(t.includes(must),`the end-to-end test checks ${must}`);});
