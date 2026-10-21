// G1c (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
// owner-g1c-authorisation-2026-10-21.md; preregistration evaluation/g1c/preregistration.json).
// What these tests protect (a deterministic stand-in embedder is injected; the pinned model weights are never needed):
//  - the vector index is a rebuildable projection: each record carries the unit's canonical id, kind, category, provenance,
//    review status, model id and revision and text hash; re-indexing never duplicates; a changed unit is replaced in place;
//    a unit without provenance is refused;
//  - re-indexing check: a new knowledge unit is found from two different need phrasings and from its category;
//  - vectors only find candidates: every proposal keeps supporting units with provenance; the operational advice is unchanged;
//  - D verification: a product the shopper owns is not proposed; negated words are not evidence; a generic need alone
//    proposes no category.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {DEHUMIDIFIER_TEACHING271} from '../src/phase270_teaching.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {buildProjectionG1b,type KnowledgeDocG1b} from '../src/situation_knowledge_g1b.js';
import {SemanticIndexG1c,knowledgeUnitsG1c,goalFirstG1c,needsInCategoryG1c,G1C_PARAMS,type KnowledgeUnitG1c} from '../src/semantic_retrieval_g1c.js';
import {stemsNI} from '../src/need_interpretation.js';
import type {EmbedderG1c} from '../src/semantic_embedding_g1c.js';

process.env.PEE_ALLOW_TMP_STORE='1';
const qk=loadQuantityKnowledge();registerTeachingSources252(SOURCES271);
const S=new KnowledgeStore246(':memory:');applyTeaching252(S,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,DEHUMIDIFIER_TEACHING271],'2026-10-17T10:00:00.000Z');
const DOCS:KnowledgeDocG1b[]=[{path:'synthetic/dehumidifier.md',category:'dehumidifiers',text:['# Situations','',
 '| Everyday expression | Underlying goal | Relevant attributes | Caveat |','|---|---|---|---|',
 '| The windows are wet every morning with condensation | Remove condensation moisture | Extraction rate | Ventilation and repair come before appliance advice |',
 '| Mould keeps coming back behind the wardrobe | Stop recurring damp | Extraction rate | Do not recommend an appliance as a substitute for repair |'].join('\n')},
 {path:'synthetic/purifier.md',category:'air_purifiers',text:['# Situations','',
 '| Everyday expression | Underlying goal | Relevant attributes | Caveat |','|---|---|---|---|',
 '| Pollen and dust make me sneeze indoors | Remove airborne particles | Clean air delivery rate | Filters need replacing |'].join('\n')}];
const P=buildProjectionG1b(S,DOCS,qk);
const advise=(t:string)=>adviseFromRequest253(t,S,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});

/** Deterministic stand-in: hashed bag of stems, L2-normalised. Similar wording -> similar vectors (wiring only). */
function fakeEmbedder(rev='test-1'):EmbedderG1c&{calls:number}{const D=128;const e={modelId:'fake-stems',modelRevision:rev,dim:D,calls:0,
 async embed(texts:readonly string[]){e.calls+=texts.length;return texts.map(t=>{const v=new Float32Array(D);
  for(const s of stemsNI(t)){const h=createHash('sha256').update(s).digest();v[h[0]%D]+=1;}
  let n=0;for(const x of v)n+=x*x;n=Math.sqrt(n)||1;return v.map(x=>x/n);});}};return e;}
const withParams=async(p:Partial<typeof G1C_PARAMS>,f:()=>Promise<void>)=>{const old={...G1C_PARAMS};Object.assign(G1C_PARAMS,p);try{await f();}finally{Object.assign(G1C_PARAMS,old);}};

test('index: records carry id, kind, provenance, review, model and text hash; re-indexing never duplicates', async()=>{
 const emb=fakeEmbedder();const ix=new SemanticIndexG1c(emb);const units=knowledgeUnitsG1c(P,{store:S});
 const a=await ix.add(units);assert.equal(a.refused,0,'every unit has text and provenance');assert.equal(a.added,ix.size);assert.equal(ix.size,new Set(units.map(u=>u.id)).size);
 for(const r of ix.records.values()){assert.ok(r.unitId&&r.kind&&r.provenance&&r.review);assert.equal(r.modelId,'fake-stems');assert.equal(r.modelRevision,'test-1');assert.match(r.textSha256,/^[0-9a-f]{64}$/);}
 const calls=emb.calls;const b=await ix.add(units);
 assert.deepEqual(b,{added:0,unchanged:units.length,replaced:0,refused:0});assert.equal(emb.calls,calls,'nothing re-embedded');assert.equal(ix.size,a.added);
 const changed={...units[0],text:units[0].text+' (revised)'};const c=await ix.add([changed]);
 assert.equal(c.replaced,1);assert.equal(ix.size,a.added,'replaced in place, one record per id');
 const d=await ix.add([{...units[0],id:'orphan',provenance:undefined as unknown as KnowledgeUnitG1c['provenance']}]);assert.equal(d.refused,1);
});

test('re-indexing check: a new unit is found from two need phrasings and from its category, with no duplication', async()=>{
 const ix=new SemanticIndexG1c(fakeEmbedder());await ix.add(knowledgeUnitsG1c(P,{store:S}));const n=ix.size;
 const unit:KnowledgeUnitG1c={id:'row_new_unit',kind:'situation',category:'dehumidifiers',text:'Laundry dried indoors leaves the flat humid and musty',
  provenance:{document:'synthetic/dehumidifier.md',sha256:'0'.repeat(64),line:99},review:'documented_relevance'};
 await ix.add([unit]);await ix.add([unit]);assert.equal(ix.size,n+1);
 for(const phrase of ['drying laundry indoors makes everything humid','the flat smells musty and humid after laundry']){
  const q=(await ix.embedder.embed([phrase],'query'))[0];assert.equal(ix.search(q,{kinds:['situation'],k:1})[0].unit.id,'row_new_unit',phrase);}
 assert.ok((await needsInCategoryG1c(ix,'dehumidifiers','humid laundry',3)).some(h=>h.unitId==='row_new_unit'));
});

test('shadow: proposals keep supporting units with provenance; the advice is unchanged', async()=>{
 const ix=new SemanticIndexG1c(fakeEmbedder());await ix.add(knowledgeUnitsG1c(P,{store:S}));
 await withParams({minRowSim:0.2},async()=>{
  const t='Our windows are wet every morning and there is condensation on the glass.';const a=advise(t);const before=JSON.stringify(a);
  for(const m of ['B','C','D'] as const){const x=await goalFirstG1c(t,a,S,{P,index:ix,qk},m);assert.equal(x.status,'shadow');
   assert.ok(x.proposals.some(p=>p.category==='dehumidifiers'),m);
   for(const p of x.proposals)if(p.epistemic==='documented_relevance')assert.ok(p.support.length&&p.support.every(s=>s.provenance),m);
   assert.ok(x.proposals.filter(p=>p.kind==='purchase').length<=G1C_PARAMS.maxCategories);}
  assert.equal(JSON.stringify(a),before,'similarity never changes requirements, exclusions or ranking');});
});

test('D verification: an owned product is not proposed; negated words are not evidence; a generic need proposes no category', async()=>{
 const ix=new SemanticIndexG1c(fakeEmbedder());await ix.add(knowledgeUnitsG1c(P,{store:S}));
 await withParams({minRowSim:0.2},async()=>{
  const owned='I already have a dehumidifier, but pollen and dust make me sneeze indoors.';
  const d=await goalFirstG1c(owned,advise(owned),S,{P,index:ix,qk},'D');
  assert.ok(!d.proposals.some(p=>p.category==='dehumidifiers'),'owned product set aside');
  const neg='It is not damp and there is no condensation; pollen and dust make me sneeze indoors.';
  const n=await goalFirstG1c(neg,advise(neg),S,{P,index:ix,qk},'D');
  assert.ok(n.verification!.maskedSpans.length>0);assert.ok(!n.proposals.some(p=>p.category==='dehumidifiers'),'negated situation is not evidence');
  const g='I want something quiet.';const x=await goalFirstG1c(g,advise(g),S,{P,index:ix,qk},'D');
  assert.equal(x.verification!.genericNeed,true);assert.equal(x.proposals.filter(p=>p.kind==='purchase').length,0);assert.equal(x.action,'ask');});
});

test('A: typed situations carry their rows\' categories; the types are unreviewed Claude typing', async()=>{
 const ix=new SemanticIndexG1c(fakeEmbedder());await ix.add(knowledgeUnitsG1c(P,{store:S}));
 const cond=P.rows.filter(r=>/condensation|mould/i.test(r.expression)).map(r=>r.id);assert.ok(cond.length);
 const types=[{id:'excess_moisture',label:'Excess indoor moisture',definition:'water condenses on cold windows; damp rooms; mould',rows:cond}];
 const t='Water runs down the windows and the room feels damp.';
 const x=await goalFirstG1c(t,advise(t),S,{P,index:ix,qk,types},'A');
 assert.ok(x.proposals.some(p=>p.category==='dehumidifiers'));
});
