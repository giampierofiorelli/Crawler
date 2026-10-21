// G1b (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
// owner-g1b-authorisation-2026-10-21.md; preregistration evaluation/g1b/preregistration.json; SKILL.md §2b).
// What these tests protect:
//  - the situation projection is derived and rebuildable: every row keeps its source (document hash and line, case or item);
//    links are 'documented_relevance', never causation; the store is not written;
//  - both directions of the same knowledge: need -> strategies -> categories, and category -> the needs it may serve;
//  - a general need (noise, space...) is recognised as a need and never becomes evidence that a category is relevant; in
//    the named category it is realised by the category's own concepts;
//  - the goal-first reading is shadow: the operational answer is unchanged;
//  - nothing known -> outside knowledge with a typed research need, pending authorisation;
//  - residues R1-R3 on the operational path: limits kept in every answer, unmapped limits reported, every question with a cause.
import test from 'node:test';
import assert from 'node:assert/strict';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {DEHUMIDIFIER_TEACHING271} from '../src/phase270_teaching.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {buildProjectionG1b,goalFirstG1b,needsOfCategoryG1b,type KnowledgeDocG1b} from '../src/situation_knowledge_g1b.js';

process.env.PEE_ALLOW_TMP_STORE='1';
const qk=loadQuantityKnowledge();registerTeachingSources252(SOURCES271);
const S=new KnowledgeStore246(':memory:');applyTeaching252(S,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,DEHUMIDIFIER_TEACHING271],'2026-10-17T10:00:00.000Z');
// synthetic package material in the owner's table shape (wiring only; the real packages are private)
const DOCS:KnowledgeDocG1b[]=[{path:'synthetic/dehumidifier.md',category:'dehumidifiers',text:['# Situations','',
 '| Everyday expression | Underlying goal | Relevant attributes | Caveat |','|---|---|---|---|',
 '| The windows are wet every morning | Remove condensation moisture | Extraction rate | Ventilation and repair come before appliance advice |',
 '| Mould keeps coming back behind the wardrobe | Stop recurring damp | Extraction rate | Do not recommend an appliance as a substitute for repair |'].join('\n')},
 {path:'synthetic/needs.json',category:'air_purifiers',text:JSON.stringify({cases:[{id:'C1',utterance:'The flat smells of cooking for days',requirement:'Reduce cooking odour',
  candidate_or_alternative:'Ducted extraction venting outdoors',forbidden_inference:'Do not treat odour reduction as ventilation'}]})}];
const P=buildProjectionG1b(S,DOCS,qk);
const advise=(t:string)=>adviseFromRequest253(t,S,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});

test('projection: derived rows keep their source; links are documented relevance; the store is not written', ()=>{
 const before=S.db.prepare('SELECT COUNT(*) n FROM events').get() as {n:number};
 const q=buildProjectionG1b(S,DOCS,qk);
 assert.equal((S.db.prepare('SELECT COUNT(*) n FROM events').get() as {n:number}).n,before.n);
 assert.ok(q.rows.some(r=>r.kind==='package_row')&&q.rows.some(r=>r.kind==='structured_case')&&q.rows.some(r=>r.kind==='store_concept'));
 for(const r of q.rows){assert.equal(r.epistemic,'documented_relevance');
  assert.ok(r.provenance.line!==null||r.provenance.caseId||r.provenance.itemId,'every row is traceable to its source');}
 assert.deepEqual(q.rows.map(r=>r.id),P.rows.map(r=>r.id),'rebuilt identically');
});

test('both directions: a situation reaches strategies with their conditions; a category lists the needs it may serve', ()=>{
 const t='Our bedroom windows are wet every morning and there is condensation everywhere.';
 const x=goalFirstG1b(t,advise(t),S,P,{method:'M2',qk});
 assert.ok(x.strategies.some(s=>s.category==='dehumidifiers'),'the documented situation leads to its category');
 for(const s of x.strategies)if(s.epistemic==='documented_relevance')assert.ok(s.support.length>=1&&s.support.every(u=>u.provenance.document));
 const back=needsOfCategoryG1b(P,'dehumidifiers');assert.ok(back.rows>=2&&back.examples.length>=1);
});

test('a general need is a need, never category evidence; in the named category it is realised by its own concepts', ()=>{
 const t='I want something quiet.';const x=goalFirstG1b(t,advise(t),S,P,{method:'M2',qk});
 assert.ok(x.generalNeeds.some(g=>g.id==='aspect:noise'));
 assert.equal(x.strategies.filter(s=>s.kind==='purchase').length,0,'"quiet" alone points to no category');
 const n='Which dishwasher is quiet enough for an open-plan flat?';const y=goalFirstG1b(n,advise(n),S,P,{method:'M2',qk});
 assert.equal(y.expressed.named,'dishwashers');
 assert.ok(y.generalNeeds.find(g=>g.id==='aspect:noise')!.realisations.every(r=>r.category==='dishwashers'));
});

test('shadow; nothing known -> outside knowledge with a typed research need pending authorisation', ()=>{
 const t='My bike chain keeps slipping when I ride uphill.';const a=advise(t);const before=JSON.stringify(a);
 const x=goalFirstG1b(t,a,S,P,{method:'M2',qk});assert.equal(JSON.stringify(a),before);assert.equal(x.status,'shadow');
 assert.equal(x.action,'outside_knowledge');assert.ok(x.researchNeeds.length>=1&&x.researchNeeds.every(r=>r.status==='pending_authorization'));
 for(const q of x.questions)assert.ok(q.cause);
});

test('R1-R3: limits kept in every answer; unmapped limits reported; every operational question carries a cause', ()=>{
 const k=advise('Which kettle boils fastest and is quiet?');
 assert.ok(k.unassessedObjectives.some(o=>/quiet/.test(o))||k.constraints.length>0,'"quiet" is not dropped in an out-of-scope answer');
 for(const t of ['I need something to keep my small flat dry, under 200 pounds','Which dehumidifier should I buy?','I want a dishwasher or an air purifier',
  'Help me choose something','The air in my flat feels stuffy and I get headaches. What can I do?','My bike chain keeps slipping when I ride uphill.']){
  const a=advise(t);assert.equal((a.questionCauses??[]).length,a.questions.length);
  for(const c of a.questionCauses??[])assert.notEqual(c.cause,'unclassified',`no cause for: ${c.question}`);
  if((a.questionCauses??[]).some(c=>c.cause==='not_understood'))assert.ok(a.limitations.some(l=>/could not relate/.test(l)),'PEE states its own limit');}
});
