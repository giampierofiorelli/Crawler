// First increment B (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
// owner-first-increment-authorisation-2026-10-21.md): N0 essential, shadow only. Written before the module.
// The shared semantic representation must tell apart:
//  - the object's role: requested, owned, context, hypothesised, alternative;
//  - the content kind: goal, outcome, problem, property, function, preference, constraint;
//  - the stance: wanted, not needed, unwanted (strength to determine), explicitly excluded, indifferent;
//  - force, provenance and epistemic status;
// keep not_sufficient_for and requires_condition, represent a rejected function without turning it into a positive need,
// and never equate "I don't need" with an absolute exclusion. It changes no decision: it is not on the request path.
// Cases: the owner's mop and milk-frother counterexamples (owner reviews of the N0 inventory and design) and NR §8
// (docs/plans/needs-reasoning-research.md), all synthetic sentences written for these tests, never evaluation material.
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {applyLessons250,ADOPTED_LESSONS250} from '../src/phase250_category_lessons.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {needModelN0,type NeedModelN0} from '../src/need_model_n0.js';

process.env.PEE_ALLOW_TMP_STORE='1';
const qk=loadQuantityKnowledge();
const S=new KnowledgeStore246(':memory:');
seedCategoryHypotheses246(S,'coffee_machines');applyLessons250(S,ADOPTED_LESSONS250);
registerTeachingSources252(SOURCES271);applyTeaching252(S,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271],'2026-10-17T10:00:00.000Z');
const model=(t:string):NeedModelN0=>needModelN0(t,adviseFromRequest253(t,S,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'}),S,{qk});
const itemOn=(m:NeedModelN0,word:RegExp)=>m.items.find(i=>word.test(i.span));

test('N0: the four mop stances are four different representations; none is a positive need', ()=>{
 const base='I am buying a robot vacuum.';
 const cases:[string,string,string][]=[
  ["I don't need a mop.",'not_needed','optional'],
  ["I don't want a mop.",'unwanted','undetermined'],
  ['It must not have a mop.','excluded','excluded'],
  ["I don't mind having a mop.",'indifferent','none']];
 for(const [s,stance,force] of cases){const m=model(base+' '+s);const it=itemOn(m,/\bmop\b/);
  assert.ok(it,`the mop is represented: ${s}`);assert.equal(it!.stance,stance,s);assert.equal(it!.force,force,s);
  assert.notEqual(it!.stance,'wanted');}
 const un=itemOn(model(base+" I don't want a mop."),/\bmop\b/)!;assert.equal(un.strength,'undetermined','unwanted: strength to determine, not a ban');
 assert.notEqual(itemOn(model(base+" I don't need a mop."),/\bmop\b/)!.force,'excluded','"I don\'t need" is never an absolute exclusion');
});

test('N0: a rejected function is represented without becoming a positive need (milk frother)', ()=>{
 const m=model("I want an espresso machine. I don't want a milk frother.");
 const it=itemOn(m,/milk frother/)!;
 assert.ok(it,'the frother is represented');assert.equal(it.stance,'unwanted');assert.equal(it.concept,'milk_drinks');
 assert.ok(!m.items.some(i=>i.concept==='milk_drinks'&&i.stance==='wanted'),'no positive milk-drinks need in the model');
 // the frozen operational path still reads a need from these words (R3-P artefact, unchanged): the model reports it
 assert.ok(m.conflicts.some(c=>c.concept==='milk_drinks'),'the conflict with the operational reading is visible');
 const ex=itemOn(model('I want an espresso machine. It must not have a milk frother.'),/milk frother/)!;
 assert.equal(ex.stance,'excluded');assert.equal(ex.force,'excluded');
});

test('N0: object roles: requested, owned, context, hypothesised, alternative', ()=>{
 const a=model('I need a quiet dishwasher; it runs while we watch the telly.');
 assert.equal(a.objects.find(o=>o.category==='dishwashers')?.role,'requested');
 assert.equal(a.objects.find(o=>o.category==='televisions')?.role,'context','a context object is not a second product');
 const b=model('We already have a dishwasher but it is too loud. Looking for a new dishwasher.');
 assert.ok(b.objects.some(o=>o.category==='dishwashers'&&o.role==='owned'));
 assert.ok(b.objects.some(o=>o.category==='dishwashers'&&o.role==='requested'));
 const c=model('Our bathroom has mould. Will a dehumidifier fix it?');
 assert.equal(c.objects.find(o=>o.category==='dehumidifiers')?.role,'hypothesised');
 const d=model('I want an air purifier for the bedroom, or would a dehumidifier be better?');
 assert.equal(d.objects.find(o=>o.category==='dehumidifiers')?.role,'alternative');
 assert.equal(d.objects.find(o=>o.category==='air_purifiers')?.role,'requested');
});

test('N0: content kinds, force, provenance and epistemic status come from the existing readers', ()=>{
 const m=model('A dishwasher under 45 cm wide and under £400. It must be good at scrubbing dried egg.');
 const width=m.items.find(i=>i.content==='constraint'&&/45/.test(i.span));
 assert.ok(width,'a stated limit is a constraint');assert.equal(width!.force,'requirement','a clear stated limit suffices (owner decision 1)');
 assert.ok(width!.producer.includes('phase253_request_constraints'));
 const clean=m.items.find(i=>i.concept==='cleaning_soil_removal');
 assert.ok(clean,'the stated cleaning need');assert.equal(clean!.content,'outcome');assert.equal(clean!.basis,'expressed');assert.equal(clean!.epistemic,'stated');
 for(const i of m.items){assert.ok(i.start>=0&&i.end>i.start&&m.text.slice(i.start,i.end)===i.span,'every item carries its exact span');assert.ok(i.producer.length>0);}
});

test('N0: not_sufficient_for and requires_condition are preserved on the needs that have them', ()=>{
 const m=model('Which dishwasher is best for scrubbing dried egg? I want to avoid pre-rinsing.');
 const clean=m.items.find(i=>i.concept==='cleaning_soil_removal')!;
 assert.ok(clean.evidence,'the evidence plan is attached');
 assert.ok(clean.evidence!.conditions.length>0,'requires_condition kept');
 assert.ok(clean.evidence!.notSufficient.length>0,'not_sufficient_for kept');
 assert.ok(clean.evidence!.measures.includes('residual_soil_score_by_soil_type'));
});

test('N0 (NR §8 X2, X6): indifference is a stance; a named feature is a function, not evidence of its outcome', ()=>{
 const x2=model("I need an air purifier for the bedroom, noise doesn't bother me.");
 assert.equal(itemOn(x2,/noise/)?.stance,'indifferent');
 const x6=model('I want an air purifier with a sleep mode.');
 const f=itemOn(x6,/sleep mode/)!;assert.equal(f.content,'function');assert.equal(f.stance,'wanted');
 assert.ok(!x6.items.some(i=>i.basis==='inferred'),'no outcome inferred from the feature alone');
});

test('N0 (NR §8 X14, X15): unread words stay visible; an irrelevant sentence changes nothing', ()=>{
 const m=model("I'm getting a dehumidifier. I don't need a zorbulator.");
 assert.ok(itemOn(m,/zorbulator/),'an unknown negated object is kept, with its stance');
 assert.equal(itemOn(m,/zorbulator/)!.content,'unknown');
 const key=(x:NeedModelN0)=>JSON.stringify(x.items.map(i=>[i.span,i.content,i.stance,i.force,i.concept]));
 const a=model("I need a quiet dishwasher. I don't want wifi."),b=model("I need a quiet dishwasher. My cousin lives in Leeds. I don't want wifi.");
 assert.equal(key(a),key(b),'metamorphic: an irrelevant sentence leaves items unchanged');
});

test('N0 is shadow: it is not imported by the request path and the answer is unchanged by building it', ()=>{
 const C=JSON.parse(readFileSync(new URL('../../docs/architecture/vertical-contract.json',import.meta.url),'utf8'));
 assert.ok(!C.reachability.requestPathImports.includes('need_model_n0'),'need_model_n0 is not on the request path');
 const t="I want an espresso machine. I don't want a milk frother.";
 const a=adviseFromRequest253(t,S,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});const before=JSON.stringify(a);
 needModelN0(t,a,S,{qk});assert.equal(JSON.stringify(a),before,'building the model does not mutate the answer');
});

test('N0: the inventory incompatibilities are each classified, with the test or decision that covers them', ()=>{
 const R=JSON.parse(readFileSync(new URL('../../evaluation/n0/incompatibilities.json',import.meta.url),'utf8'));
 const ids=R.items.map((x:{id:string})=>x.id);
 assert.deepEqual(ids,Array.from({length:15},(_,i)=>'I-'+(i+1)));
 for(const x of R.items){assert.ok(['represented_and_tested','represented_owner_decision','outside_essential_model'].includes(x.status),x.id);
  if(x.status!=='outside_essential_model')assert.ok(x.covers&&x.covers.length>0,x.id+' names its test or decision');else assert.ok(x.why,x.id+' says why it is outside');}
});
