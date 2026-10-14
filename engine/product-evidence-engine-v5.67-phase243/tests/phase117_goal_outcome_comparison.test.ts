import test from 'node:test';
import assert from 'node:assert/strict';
import {compareGoalOutcomes117,reviewedObservationBridge116To117,
 type ExactContract117,type OutcomeRecord117,type VerifiedGoalIntent117} from '../src/phase117_goal_outcome_comparison.js';
import {ROBOT_FLOOR_MODEL116,DISHWASHER_MODEL116,HEADPHONES_MODEL116,
 type Observed116} from '../src/phase116_category_function_model.js';
const c:ExactContract117={verification:'human_reviewed_exact_protocol',categoryId:'robot_floor_cleaners',goalId:'goal_clean_floor',endpointNodeId:'result_stains',dimension:'outcome_effectiveness',metricId:'remaining_coffee_stain',unit:'percent',direction:'lower_is_better',labId:'laba',protocolRevision:'v1',setupId:'tile-dried-coffee',contextId:'ceramic_tile_max_water',observationHorizonId:'four_identical_passes',targetThresholdId:null,scopeDescription:'Dried coffee on ceramic tile after four controlled passes; no speed inference'};
const intent:VerifiedGoalIntent117={verification:'explicitly_verified_semantic_frame',categoryId:c.categoryId,goalId:c.goalId,primaryDimension:c.dimension};
const record=(variant:string,value:number,overrides:Partial<OutcomeRecord117>={}):OutcomeRecord117=>({variant,originalTestId:'independent-original-'+variant,sourceUrl:'https://example.org/primary/'+variant,evidenceBasis:'independent_measured',reviewState:'reviewed_original',evidenceRevision:'ev1',protocol:c,value,...overrides});
const run=(observations:OutcomeRecord117[],other:Record<string,any>={})=>compareGoalOutcomes117({model:ROBOT_FLOOR_MODEL116,intent,contract:c,snapshotId:'snap117',evidenceRevision:'ev1',variants:['alpha','beta'],observations,...other});
test('generic verified effectiveness is not overridden by a superior one-pass result',()=>{
 const first={...c,observationHorizonId:'one_pass'};
 const r=run([record('alpha',2),record('beta',2),record('alpha',50,{originalTestId:'one_a',protocol:first}),record('beta',10,{originalTestId:'one_b',protocol:first})]);
 assert.deepEqual(r.observedRanking,[{variant:'alpha',rank:1},{variant:'beta',rank:1}]);
 assert.equal(r.primaryDimension,'outcome_effectiveness');
 assert.equal(r.mechanismsNotUsedAsPerformanceScores,true);
});
test('changing the explicit goal lens permits distinct one-pass selection',()=>{
 const first={...c,observationHorizonId:'one_pass'};
 const r=run([record('alpha',2),record('beta',2),record('alpha',50,{originalTestId:'one_a',protocol:first}),record('beta',10,{originalTestId:'one_b',protocol:first})],{contract:{...c,observationHorizonId:'one_pass'}});
 assert.deepEqual(r.observedRanking,[{variant:'beta',rank:1},{variant:'alpha',rank:2}]);
});
test('a time-efficiency lens requires a common explicit cleanliness target',()=>{
 assert.throws(()=>run([],{intent:{...intent,primaryDimension:'time_efficiency'},contract:{...c,dimension:'time_efficiency',metricId:'seconds',unit:'seconds',targetThresholdId:null}}),/efficiency_requires_explicit_common_target/);
 const contract={...c,dimension:'time_efficiency' as const,metricId:'seconds',unit:'seconds',direction:'lower_is_better' as const,observationHorizonId:'elapsed_from_start',targetThresholdId:'95_percent_soil_removed'};
 const res=run([record('alpha',45,{protocol:contract}),record('beta',60,{protocol:contract})],{intent:{...intent,primaryDimension:'time_efficiency'},contract});
 assert.deepEqual(res.observedRanking,[{variant:'alpha',rank:1},{variant:'beta',rank:2}]);
});
test('unverified natural-language interpretation cannot be silently accepted',()=>{
 assert.throws(()=>run([record('alpha',2),record('beta',3)],{intent:{...intent,verification:'guessed_by_llm'}}),/unverified_intent_contract_or_snapshot/);
});
test('contract cannot silently switch goal or make manufacturer mechanism equivalent to performance',()=>{
 assert.throws(()=>run([],{contract:{...c,endpointNodeId:'mop_roller_continuous'}}),/no_direct_measured_goal_link/);
 assert.throws(()=>run([],{intent:{...intent,goalId:'goal_microbial'}}),/intent_contract_mismatch/);
});
test('different protocols, revisions, substrates and horizons never auto-bridge',()=>{
 for(const field of ['labId','protocolRevision','setupId','contextId','observationHorizonId','unit'] as const){
  const r=run([record('alpha',2),record('beta',3,{protocol:{...c,[field]:'changed'}})]);
  assert.equal(r.fullCandidateRankingAvailable,false,field);
  assert.equal(r.candidates.find(x=>x.variant==='beta')?.status,'incompatible_protocol',field);
 }
});
test('missing evidence is not treated as low performance; no false full-list winner',()=>{
 const r=run([record('alpha',5)]);
 assert.equal(r.fullCandidateRankingAvailable,false);
 assert.equal(r.observedRanking,null);
 assert.equal(r.candidates.find(x=>x.variant==='beta')?.status,'missing_original_measurement');
});
test('manufacturer claim and descriptive review cannot satisfy measured endpoint',()=>{
 for(const evidenceBasis of ['manufacturer_claim','independent_qualitative'] as const){
  const r=run([record('alpha',1,{evidenceBasis}),record('beta',3)]);
  assert.equal(r.observedRanking,null);
  assert.equal(r.candidates.find(x=>x.variant==='alpha')?.status,'unreviewed_or_indirect');
 }
});
test('unreviewed measured number is also excluded',()=>{
 const r=run([record('alpha',2,{reviewState:'unreviewed'}),record('beta',1)]);
 assert.equal(r.fullCandidateRankingAvailable,false);
});
test('same original experiment syndication does not add votes',()=>{
 const x=record('alpha',2);
 const r=run([x,{...x,sourceUrl:'https://example.org/syndicated/copy'},record('beta',3)]);
 assert.deepEqual(r.observedRanking,[{variant:'alpha',rank:1},{variant:'beta',rank:2}]);
 assert.equal(r.candidates.find(y=>y.variant==='alpha')?.originalTestIds.length,1);
 assert.equal(r.candidates.find(y=>y.variant==='alpha')?.sourceUrls.length,2);
});
test('contradiction within an original experiment blocks ranking',()=>{
 const x=record('alpha',2);
 const r=run([x,{...x,value:3},record('beta',3)]);
 assert.equal(r.observedRanking,null);
 assert.equal(r.candidates.find(z=>z.variant==='alpha')?.status,'conflicting_original_record');
});
test('more than one distinct original test needs approved synthesis, never arithmetic averaging',()=>{
 const r=run([record('alpha',2),record('alpha',4,{originalTestId:'second-original'}),record('beta',3)]);
 assert.equal(r.observedRanking,null);
 assert.equal(r.candidates.find(z=>z.variant==='alpha')?.status,'multiple_original_tests_need_review');
});
test('overlapping uncertainty is not a proven winner or equivalent outcome',()=>{
 const r=run([record('alpha',2,{reportedInterval:{low:1,high:5,kind:'reported_ci'}}),record('beta',3,{reportedInterval:{low:2,high:4,kind:'reported_ci'}})]);
 assert.equal(r.observedRanking,null);
 assert.equal(r.candidates[0].status,'uncertainty_not_comparable');
});
test('nonoverlapping fully stated uncertainty preserves descriptive ordering',()=>{
 const r=run([record('alpha',2,{reportedInterval:{low:1,high:2,kind:'reported_ci'}}),record('beta',9,{reportedInterval:{low:8,high:10,kind:'reported_ci'}})]);
 assert.deepEqual(r.observedRanking,[{variant:'alpha',rank:1},{variant:'beta',rank:2}]);
 assert.equal(r.pointEstimateOrderingNotStatisticalSuperiority,true);
});
test('no assumption about uncertainty when only one product has an interval',()=>{
 const r=run([record('alpha',2,{reportedInterval:{low:1,high:2,kind:'reported_ci'}}),record('beta',9)]);
 assert.equal(r.fullCandidateRankingAvailable,false);
});
test('same intent, same complete evidence gives exact output across candidate and source reordering',()=>{
 const x=[record('alpha',2),record('beta',5)];
 assert.deepEqual(run(x),run([...x].reverse(),{variants:['beta','alpha']}));
});
test('same canonical evidence fingerprint cannot depend on which measured lens is displayed',()=>{
 const x=[record('alpha',2),record('beta',5)];
 const alt={...c,observationHorizonId:'first_pass'};
 const v=[...x,record('alpha',10,{protocol:alt,originalTestId:'first-a'}),record('beta',1,{protocol:alt,originalTestId:'first-b'})];
 const r1=run(v),r2=run([...v].reverse(),{contract:{...c,observationHorizonId:'first_pass'}});
 assert.equal(r1.snapshotFingerprint,r2.snapshotFingerprint);
 assert.notDeepEqual(r1.observedRanking,r2.observedRanking);
});
test('dishwasher goal endpoint uses same comparator without robot-specific logic',()=>{
 const contract={...c,categoryId:'dishwashers',goalId:'goal_clean',endpointNodeId:'clean_test',metricId:'food_residue_percent',setupId:'food',contextId:'glassware',scopeDescription:'Original comparable cycle on glassware'};
 const r=run([record('alpha',3,{protocol:contract}),record('beta',1,{protocol:contract})],{
   model:DISHWASHER_MODEL116,contract,intent:{...intent,categoryId:'dishwashers',goalId:'goal_clean'}});
 assert.deepEqual(r.observedRanking,[{variant:'beta',rank:1},{variant:'alpha',rank:2}]);
});
test('headphone measured ANC is supported, ANC hardware is not an independent result',()=>{
 const contract={...c,categoryId:'headphones',goalId:'goal_isolate',endpointNodeId:'anc_test',metricId:'db_attenuation',unit:'dB',direction:'higher_is_better' as const,contextId:'matched_noise_signal',scopeDescription:'Attenuation measured on specified signal'};
 const r=run([record('alpha',25,{protocol:contract}),record('beta',18,{protocol:contract})],{
   model:HEADPHONES_MODEL116,contract,intent:{...intent,categoryId:'headphones',goalId:'goal_isolate'}});
 assert.deepEqual(r.observedRanking,[{variant:'alpha',rank:1},{variant:'beta',rank:2}]);
});
test('source bridge explicitly refuses missing protocol metadata and mechanism features',()=>{
 const obs:Observed116={nodeId:'result_stains',finding:'present',basis:'independent_measured',value:2,unit:'percent',testProtocol:'v1',target:'floor',productVariant:'alpha',originalTestId:'original1',sourceUrl:'https://example.org/original',condition:'dried coffee'};
 assert.equal(reviewedObservationBridge116To117(ROBOT_FLOOR_MODEL116,obs,null,'ev1').status,'needs_review');
 const mapped=reviewedObservationBridge116To117(ROBOT_FLOOR_MODEL116,obs,c,'ev1');
 assert.equal(mapped.status,'mapped');
 assert.equal(reviewedObservationBridge116To117(ROBOT_FLOOR_MODEL116,{...obs,nodeId:'mop_roller_continuous',target:'pad'},c,'ev1').status,'needs_review');
 assert.equal(reviewedObservationBridge116To117(ROBOT_FLOOR_MODEL116,{...obs,basis:'manufacturer_declared'},c,'ev1').status,'needs_review');
});
test('invalid uncertainty, protocol, URL and evidence revision fail closed',()=>{
 assert.throws(()=>run([record('alpha',2,{reportedInterval:{low:3,high:5,kind:'reported_range'}}),record('beta',3)]),/invalid_reported_uncertainty/);
 assert.throws(()=>run([record('alpha',2,{sourceUrl:'http://example.com'}),record('beta',3)]),/invalid_original_measurement/);
 assert.equal(run([record('alpha',2,{evidenceRevision:'obsolete'}),record('beta',3)]).observedRanking,null);
});

test('snapshot digest is independent of object insertion order or query-level scope prose',()=>{
 const a=record('alpha',2);const b=record('beta',3);
 const manipulated={...a,protocol:{...c,scopeDescription:'Different narrative for the same underlying original test'}};
 assert.equal(run([a,b]).snapshotFingerprint,run([manipulated,b]).snapshotFingerprint);
 const reordered=Object.fromEntries(Object.entries(b).reverse()) as OutcomeRecord117;
 assert.deepEqual(run([a,b]),run([reordered,a]));
});
test('same original independent finding with contradictory unreviewed copy blocks ranking',()=>{
 const a=record('alpha',2);
 const r=run([a,{...a,reviewState:'unreviewed',value:20,sourceUrl:'https://example.org/other'},record('beta',3)]);
 assert.equal(r.candidates.find(x=>x.variant==='alpha')?.status,'conflicting_original_record');
 assert.equal(r.observedRanking,null);
});
test('side effect outcome is compared only under its own directly measured goal',()=>{
 const contract:ExactContract117={...c,goalId:'goal_limit_transfer',endpointNodeId:'result_transfer',dimension:'side_effect',metricId:'redeposited_soil',contextId:'same_cleaned_tile',scopeDescription:'Measured soil moved to cleaned region'};
 const r=run([record('alpha',3,{protocol:contract}),record('beta',8,{protocol:contract})],{
   intent:{...intent,goalId:'goal_limit_transfer',primaryDimension:'side_effect'},contract});
 assert.deepEqual(r.observedRanking,[{variant:'alpha',rank:1},{variant:'beta',rank:2}]);
});
