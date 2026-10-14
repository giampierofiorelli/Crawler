import {test} from 'node:test';
import assert from 'node:assert/strict';
import {researchUserGoal172,explainGoalResearch172,explainGoalChange172} from '../src/phase172_goal_suitability_guide.js';
import {mapGoalToMethodResearch172,listResearchMethods172} from '../src/phase172_domain_protocol_registry.js';
import {explainResearchConflicts172} from '../src/phase172_conflict_explanation.js';
import type {ConflictWorkbench171} from '../src/phase171_source_conflict_workbench.js';
const plan=(question:string)=>researchUserGoal172({question,language:'en'});
const ids=(q:string)=>plan(q).candidates.map(x=>x.id);

test('negated food texture does not become a positive crispiness objective',()=>{
 const p=plan("I don't want crispy chips in my air fryer");
 assert.equal(p.category,'air_fryer');assert.ok(!p.candidates.some(c=>c.id==='airfryer_crisp'));
});
test('category directly rejected is not silently selected',()=>{
 const p=plan("I don't want an air fryer. I need a fridge in my small kitchen");
 assert.equal(p.category,'refrigerator');assert.deepEqual(p.candidates.map(c=>c.id),['refrigerator_space']);
});
test('category object remains after saying no to a feature',()=>{
 const p=plan("I don't need a quiet fridge");
 assert.equal(p.category,'refrigerator');assert.deepEqual(p.candidates,[]);
});
test('do not mind noise is not a quietness request',()=>{
 assert.ok(!ids("I don't mind noise, need a fridge").includes('refrigerator_quiet'));
});
test('negated expertise does not infer novice workflow',()=>{
 assert.ok(!ids("I'm not a beginner. I need an espresso machine").includes('coffee_easy'));
});
test('qualified negative of noisiness means noise matters',()=>{
 assert.ok(ids('I need a fridge that is not too noisy').includes('refrigerator_quiet'));
});
test('small living space is not evidence of a priority for quiet',()=>{
 const p=plan('Fridge for my studio apartment');
 assert.ok(ids('Fridge for my studio apartment').includes('refrigerator_space'));
 assert.ok(!p.candidates.some(x=>x.id==='refrigerator_quiet'));
});
test('post-contrast positive mention is not blocked by prior dislike',()=>{
 const p=plan("I don't want crispy chips, but I do need crunchy chips in my air fryer");
 assert.equal(p.category,'air_fryer');assert.ok(p.candidates.some(x=>x.id==='airfryer_crisp'));
});
test('not knowing what to buy is not rejection of pet hair cleaning',()=>{
 assert.ok(ids("I don't know what vacuum is best for my dog hair").includes('vacuum_pets'));
});
test('pet fur described without naming vacuum generates provisional category clue',()=>{
 const p=plan('I need something to clean cat fur off carpeted stairs');
 assert.equal(p.category,'vacuum_cleaner');assert.equal(p.categoryBasis,'usage_clue_only');
 assert.ok(p.candidates.some(x=>x.id==='vacuum_stairs'));
});
test('explicitly excluding coffee machine may leave vacuum as current choice',()=>{
 const p=plan("I don't want a coffee machine, I want a vacuum for dog hair");
 assert.equal(p.category,'vacuum_cleaner');
});
test('ambiguity from two positive categories is not silently resolved',()=>{
 const p=plan('I need an air fryer and a fridge');assert.equal(p.category,'unknown');
 assert.equal(p.rankingAuthorized,false);
});
test('material cautions for multiple needs remain upfront rather than hidden',()=>{
 const v=explainGoalResearch172(plan('I need a vacuum for dog hair on carpets, also stairs'));
 assert.ok(v.mustSeeNow.some(x=>x.includes('suction figure')));
 assert.ok(v.mustSeeNow.some(x=>x.includes('Carrying')));
});
test('existing original Phase172 cases remain stable under new registry',()=>{
 const p=plan('I live alone and meal prep several meals in an air fryer');
 assert.ok(p.candidates.some(x=>x.id==='airfryer_batch'));
 assert.equal(p.questions.length,0);
});
test('document registry records provenance but authorizes no product facts',()=>{
 const p=plan('I want crunchy chips in an air fryer');
 const m=mapGoalToMethodResearch172(p);
 const d=m.dimensions.find(x=>x.dimension==='food_specific_texture_result')!;
 assert.equal(d.status,'method_documented_product_evidence_missing');
 assert.equal(d.methods[0].kind,'original_professional_test_method');
 assert.ok(d.methods[0].url.startsWith('https://www.which.co.uk/'));
 assert.equal(d.technicalLinkScientificallyValidated,false);
 assert.equal(m.verifiedIndependentMeasurements,0);
 assert.equal(m.productRankingAuthorized,false);
});
test('washed laundry fit has documentary installation context from maker, not lab validation',()=>{
 const p=plan('My washing machine must fit a tight space');
 const m=mapGoalToMethodResearch172(p);
 const d=m.dimensions.find(x=>x.dimension==='door_swing_clearance')!;
 assert.equal(d.methods[0].kind,'manufacturer_general_installation_guidance');
 assert.ok(d.methods[0].doesNotEstablish.includes('generic'));
});
test('vacuum measured pickup and carried weight point to distinct method categories',()=>{
 const m=mapGoalToMethodResearch172(plan('Need a vacuum for cat hair and stairs'));
 assert.ok(m.dimensions.find(x=>x.dimension==='pet_hair_pickup_by_surface')?.methods.length);
 assert.ok(m.dimensions.find(x=>x.dimension==='carried_weight')?.methods.length);
});
test('coffee use and cleaning must not be presented as already tested if registry lacks protocol',()=>{
 const m=mapGoalToMethodResearch172(plan('Easy to clean coffee machine for a beginner'));
 assert.equal(m.dimensions.find(x=>x.dimension==='cleaning_time')?.status,'method_still_to_locate');
});
test('refrigerator noise has documentary duration method without home disturbance claim',()=>{
 const m=mapGoalToMethodResearch172(plan('I want a quiet fridge'));
 const noise=m.dimensions.find(x=>x.dimension==='noise_events_and_character')!;
 assert.ok(noise.methods.length>0);
 assert.ok(noise.methods[0].doesNotEstablish.includes('specific studio'));
});
test('registry determinism for same plan and no mutated global registry',()=>{
 const p=plan('I want a quiet fridge');
 const first=JSON.stringify(mapGoalToMethodResearch172(p));
 const copy=listResearchMethods172();
 (copy[0].dimensions as string[]).push('fake_injected_metric');
 assert.equal(JSON.stringify(mapGoalToMethodResearch172(p)),first);
});
test('reject compromised candidate-only plan',()=>{
 const p=plan('Need air fryer for crispy chips');
 assert.throws(()=>mapGoalToMethodResearch172({...p,rankingAuthorized:true as never}),/candidate_only/);
});
test('same detected dimensions but altered family set triggers reassessment',()=>{
 const a=plan('Good coffee at home with a coffee machine');
 const b=plan('I specifically want an espresso machine to make good coffee at home');
 const guide=explainGoalChange172(a,b);
 assert.equal(guide.mode,'context_changed_research_again');
 assert.ok(guide.details.some(x=>x.includes('solution-family')));
 assert.equal(guide.rankingChanged,false);
});
const constructedTrace:ConflictWorkbench171={phase:171,questionSha256:'a'.repeat(64),sessionId:'constructed_session',revisionFingerprint:'b'.repeat(64),
 items:[{requirementId:'req1',kind:'quantity',variantId:'example',constraintId:'c1',
  disposition:'conflict_under_declared_same_method',distinctDeclaredFamilies:2,distinctOriginalDocuments:2,
  supportingCandidateIds:[],opposingCandidateIds:[],originalDocumentHashes:['d'.repeat(64)],candidateTraces:[],
  researchTasks:['adjudicate'],userIdentityVerified:false,sourceFamiliesIndependentlyVerified:false,
  methodsIndependentlyValidated:false,rightsIndependentlyVerified:false,eligibleForRanking:false,eligibleForExclusion:false},
  {requirementId:'req2',kind:'qualitative',variantId:'example',constraintId:'c2',
  disposition:'qualitative_adverse_signal',distinctDeclaredFamilies:0,distinctOriginalDocuments:0,
  supportingCandidateIds:[],opposingCandidateIds:[],originalDocumentHashes:[],candidateTraces:[],
  researchTasks:['check fit'],userIdentityVerified:false,sourceFamiliesIndependentlyVerified:false,
  methodsIndependentlyValidated:false,rightsIndependentlyVerified:false,eligibleForRanking:false,eligibleForExclusion:false}],
 tasks:['adjudicate'],evaluatedWithRealIndependentReview:false,candidateOnly:true,
 userIdentityVerified:false,sourceIndependenceVerified:false,rankingAuthorized:false,
 exclusionsAuthorized:false,publicationAuthorized:false};
test('Phase171 conflict projection surfaces both critical problems without winner',()=>{
 const p=explainResearchConflicts172(constructedTrace);
 assert.ok(p.mustSeeNow.some(x=>x.includes('adjudication')));
 assert.ok(p.mustSeeNow.some(x=>x.includes('decisive drawback')));
 assert.equal(p.rankingAuthorized,false);assert.equal(p.excludedProductClaimed,false);
 assert.deepEqual(p.expandable.map(x=>x.requirementId),['req1','req2']);
});
test('Phase171 conflict projection rejects ranking-authorized or eligible traces',()=>{
 assert.throws(()=>explainResearchConflicts172({...constructedTrace,rankingAuthorized:true as never}),/research_only/);
 const x=constructedTrace.items[0];
 assert.throws(()=>explainResearchConflicts172({...constructedTrace,items:[{...x,eligibleForExclusion:true as never}]}),/research_only/);
});
test('explicit cordless-only requirement is retained upfront without excluding products',()=>{
 const p=plan('I need a vacuum for cat hair and it must be cordless');
 assert.equal(p.hardConstraintCandidates[0]?.id,'vacuum_cordless_only');
 assert.equal(p.hardConstraintCandidates[0].exclusionAuthorized,false);
 const view=explainGoalResearch172(p);
 assert.ok(view.mustSeeNow.some(x=>x.includes('cordless')));
 assert.equal(view.noVerifiedProductRecommendation,true);
});
test('cordless preference without must is not automatically a hard veto',()=>{
 const p=plan('I prefer a cordless vacuum for cat hair');
 assert.deepEqual(p.hardConstraintCandidates,[]);
});
test('changing to a hard cordless restriction triggers reassessment, no fabricated new winner',()=>{
 const a=plan('I need a vacuum for cat hair');
 const b=plan('I need a vacuum for cat hair, must be cordless');
 const d=explainGoalChange172(a,b);
 assert.equal(d.mode,'context_changed_research_again');
 assert.equal(d.rankingChanged,false);
});
