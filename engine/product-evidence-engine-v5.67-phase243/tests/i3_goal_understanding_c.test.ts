// Third increment (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
// owner-third-increment-authorisation-2026-10-21.md; preregistration evaluation/i3/preregistration.json).
// C (src/goal_understanding_c.ts) and the T2 table methods (src/relation_claims_n1.ts) on synthetic material and the
// Phase271 teaching only (T1: wiring); the sealed R and H3 material is never used here. What these tests protect:
//  - C is shadow: it never changes the answer, and the answer carries no C field;
//  - a hypothesis is never a need attributed to the user: it is marked unverified and carries its reason, its supporting
//    knowledge with references, its conditions and its counter-evidence;
//  - a family the message rules out is never hypothesised; an owned product is not the request;
//  - with no supporting knowledge C abstains and asks, it does not guess;
//  - T2 claims carry relevance kinds only and full provenance, and cannot enter the store under the admitted mapping.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {goalUnderstandingC} from '../src/goal_understanding_c.js';
import {deriveClaimsByN1,loadLearnedModelsN1,recordClaimsN1,columnRolesByN1,teachingTablesN1} from '../src/relation_claims_n1.js';

process.env.PEE_ALLOW_TMP_STORE='1';
const qk=loadQuantityKnowledge();const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
function store(){const s=new KnowledgeStore246(':memory:');registerTeachingSources252(SOURCES271);applyTeaching252(s,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271],'2026-10-17T10:00:00.000Z');return s;}
const S=store();
const run=(t:string)=>{const a=adviseFromRequest253(t,S,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});return {a,c:goalUnderstandingC(t,a,S,{qk})};};
const decision=(a:ReturnType<typeof adviseFromRequest253>)=>JSON.stringify([a.response,a.category,a.needs,a.constraints,a.excluded,a.shortlist,a.statements,a.questions,a.unassessedObjectives,a.ranked??null]);

test('C is shadow: computing it changes nothing in the answer, and the answer has no C field', ()=>{
 for(const t of ['I sneeze all day at home because of pollen and dust.','I want a dishwasher for a family of four.']){
  const before=adviseFromRequest253(t,S,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});const {a,c}=run(t);
  assert.equal(decision(a),decision(before));assert.equal(c.status,'shadow');assert.ok(!('goalUnderstanding' in a));}
});

test('every hypothesis is unverified and carries reason, references, conditions and counter-evidence', ()=>{
 const {c}=run('I sneeze all day at home because of pollen and pet dander, my eyes itch.');
 assert.ok(c.hypotheses.length>=1,'knowledge supports at least one family');
 for(const h of c.hypotheses){assert.equal(h.epistemic,'hypothesis_unverified');assert.ok(h.reason.length>10);
  assert.ok(h.support.length>=1&&h.support.every(s=>s.ref&&s.shared.length>=1),'support names its knowledge and the shared words');
  assert.ok(Array.isArray(h.conditions)&&Array.isArray(h.counterEvidence));}
 assert.ok(c.hypotheses.some(h=>h.family==='air_purifiers'));
 assert.equal(c.requested,null,'nothing was named: a hypothesis is not a request');
});

test('a rejected family is never hypothesised; an owned product is not the request', ()=>{
 const {c}=run('I do not want an air purifier, but the pollen and dust make me sneeze all day.');
 assert.ok(c.objects.some(o=>o.family==='air_purifiers'&&o.role==='rejected'));
 assert.ok(!c.hypotheses.some(h=>h.family==='air_purifiers'),'ruled out');
 const o=run('We already have a dishwasher; I am looking for an air purifier for the bedroom.').c;
 assert.ok(o.objects.some(x=>x.family==='dishwashers'&&x.role==='owned'));assert.equal(o.requested,'air_purifiers');assert.equal(o.action,'commit');
});

test('with no supporting knowledge C abstains and asks instead of guessing', ()=>{
 const {c}=run('Something nice for a birthday.');
 assert.equal(c.hypotheses.length,0);assert.equal(c.action,'abstain');assert.ok(c.question&&c.question.text.endsWith('?'));
});

test('T2: learned column and link models give relevance-only claims with provenance, never admitted under n1.1', ()=>{
 const doc=['# Widgets','','| Everyday expression | Underlying goal | Relevant attributes | Task-specific measurement |','|---|---|---|---|',
  '| My hands hurt after long use | Comfortable long use | Grip diameter | Timed grip test |'].join('\n');
 const {role,link}=loadLearnedModelsN1();
 assert.equal(role.schema,'pee.n1.role-model.v1');assert.equal(link.schema,'pee.n1.link-model.v1');assert.match(role.trainedOn,/spent N1 rows/);
 assert.equal(columnRolesByN1(teachingTablesN1(doc)[0],'learned',{model:role}).length,4);
 const src={categoryId:'widgets',document:'w.md',sha256:sha(doc)};
 const claims=deriveClaimsByN1(doc,src,'learned',{model:role,linkModel:link});
 for(const c of claims){assert.equal(c.claimType,'teaching_relevance');assert.equal(c.source.sha256,src.sha256);
  assert.ok(c.links.every(l=>['relevant_to','addressed_by','assessed_by','qualified_by','alternative_of'].includes(l.kind)));
  assert.match(c.mapping,/\+learned:nb\.1\+lk\.1$/);}
 if(claims.length)assert.throws(()=>recordClaimsN1(new KnowledgeStore246(':memory:'),{...src,claims}),/does_not_match/,'not admitted: only the admitted mapping can be stored');
});
