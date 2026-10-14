import test from 'node:test';
import assert from 'node:assert/strict';
import {interpretDecisionNeeds,vacuumNeedsPrototype} from '../src/needs_discovery.js';
import type {NeedsAnswers} from '../src/needs_discovery.js';
const capabilities = new Set(['carpet','pet_hair','ease']);
const base:NeedsAnswers={choices:{floors:'carpet',pets:'yes'},confirmInterpretation:true};
test('essential context asked before refinements',()=>{
  const r=interpretDecisionNeeds(vacuumNeedsPrototype,{choices:{}},capabilities);
  assert.equal(r.status,'needs_context'); assert.deepEqual(r.nextQuestions.map(x=>x.id),['floors','pets']);
});
test('after basics only contextual refinements shown; at most two',()=>{
  const r=interpretDecisionNeeds(vacuumNeedsPrototype,{choices:{floors:'carpet',pets:'no'}},capabilities);
  assert.equal(r.status,'needs_confirmation');
  assert.deepEqual(r.nextQuestions.map(x=>x.id),['handling_preference','noise_preference']);
});
test('user confirmation can skip optional questions',()=>{
  const r=interpretDecisionNeeds(vacuumNeedsPrototype,base,capabilities);
  assert.equal(r.status,'criteria_mapped'); assert.equal(r.nextQuestions.length,0);
  assert.deepEqual(r.syntheticWeights,{carpet:2,pet_hair:2,ease:0});
});
test('distinct user priorities alter synthetic weights',()=>{
  const r=interpretDecisionNeeds(vacuumNeedsPrototype,{...base,priorities:{pet_hair_removal:'essential',carpet_cleaning:'nice_to_have'}},capabilities);
  assert.deepEqual(r.syntheticWeights,{carpet:1,pet_hair:3,ease:0});
  assert.equal(r.criteria.find(c=>c.id==='pet_hair_removal')?.origin,'declared_priority');
});
test('hard-floor interest absent from demo evidence blocks readiness',()=>{
  const r=interpretDecisionNeeds(vacuumNeedsPrototype,{choices:{floors:'mixed',pets:'no'},confirmInterpretation:true},capabilities);
  assert.equal(r.status,'insufficient_evidence'); assert.equal(r.syntheticWeights,null);
  assert.ok(r.evidenceGaps.includes('hard_floor_cleaning'));
});
test('unmeasured noise need cannot be silently discarded',()=>{
  const r=interpretDecisionNeeds(vacuumNeedsPrototype,{choices:{...base.choices,noise_preference:'yes'},confirmInterpretation:true},capabilities);
  assert.equal(r.status,'insufficient_evidence'); assert.ok(r.evidenceGaps.includes('noise'));
});
test('user may explicitly dismiss unwanted criterion',()=>{
  const r=interpretDecisionNeeds(vacuumNeedsPrototype,{...base,priorities:{pet_hair_removal:'irrelevant'}},capabilities);
  assert.equal(r.status,'criteria_mapped');assert.deepEqual(r.syntheticWeights,{carpet:2,pet_hair:0,ease:0});
});
test('empty needs leads to confirmation instead of invented rank',()=>{
  const r=interpretDecisionNeeds(vacuumNeedsPrototype,{choices:{floors:'carpet',pets:'no'},priorities:{carpet_cleaning:'irrelevant'},confirmInterpretation:true},capabilities);
  assert.equal(r.status,'needs_confirmation');assert.equal(r.syntheticWeights,null);
});
test('unconfirmed inferred priorities block automatic scoring',()=>{
  const r=interpretDecisionNeeds(vacuumNeedsPrototype,{choices:base.choices},capabilities);
  assert.equal(r.status,'needs_confirmation');assert.equal(r.syntheticWeights,null);
});
test('commercial field injected into answer is rejected',()=>{
  assert.throws(()=>interpretDecisionNeeds(vacuumNeedsPrototype,{choices:{floors:'carpet',pets:'yes',amazon_price:'yes'}},capabilities),/Unsupported or commercial/);
});
test('unknown option is rejected',()=>{
  assert.throws(()=>interpretDecisionNeeds(vacuumNeedsPrototype,{choices:{floors:'moon',pets:'yes'}},capabilities),/Unknown answer/);
});
test('unknown priority is rejected',()=>{
  assert.throws(()=>interpretDecisionNeeds(vacuumNeedsPrototype,{...base,priorities:{imaginary:'essential'}},capabilities),/Invalid priority/);
});
test('duplicate IDs in category definition are rejected',()=>{
  const bad={...vacuumNeedsPrototype,criteria:[...vacuumNeedsPrototype.criteria,vacuumNeedsPrototype.criteria[0]]};
  assert.throws(()=>interpretDecisionNeeds(bad,base,capabilities),/Duplicate criterion/);
});
test('negative/non-integer question limit is rejected',()=>{
  assert.throws(()=>interpretDecisionNeeds(vacuumNeedsPrototype,base,capabilities,-1),/Invalid question limit/);
});
test('irrelevant option does not create fake criterion',()=>{
  const r=interpretDecisionNeeds(vacuumNeedsPrototype,{choices:{floors:'carpet',pets:'no',noise_preference:'no'},confirmInterpretation:true},capabilities);
  assert.deepEqual(r.criteria.map(c=>c.id),['carpet_cleaning']);
});
test('proof of unavailable category evidence cannot be assumed from capabilities elsewhere',()=>{
  const r=interpretDecisionNeeds(vacuumNeedsPrototype,base,new Set(['ease']));
  assert.equal(r.status,'insufficient_evidence');assert.deepEqual(r.evidenceGaps,['carpet_cleaning','pet_hair_removal']);
});
test('the result explicitly prohibits publication',()=>{
  const r=interpretDecisionNeeds(vacuumNeedsPrototype,base,capabilities);
  assert.equal(r.publicationReady,false);assert.equal(r.purpose,'needs_prototype');
});

test('headphone scenario uses original-domain criteria, not toy vacuum dimensions',async()=>{
  const {headphonesNeedsPrototype} = await import('../src/needs_discovery.js');
  const r=interpretDecisionNeeds(headphonesNeedsPrototype,{choices:{usage:'commute'},confirmInterpretation:true},new Set(['headphone_anc','headphone_battery']));
  assert.equal(r.status,'criteria_mapped');
  assert.equal(r.syntheticWeights,null);
  assert.ok(r.uncertainties.some(x=>x.includes('No validated synthetic scoring mapping')));
});
