import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {researchTaskScope173} from '../src/phase173_goal_scope_adapter.js';
import {proposeNeedMechanismGraph173,attachUnverifiedReview173} from '../src/phase173_need_mechanism_graph.js';
const task=(question:string)=>researchTaskScope173({question,language:'en'});
const ids=(question:string)=>task(question).needs.map(x=>x.id);
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
test('real Phase172 goal is retained without ranking admission',()=>{
 const x=task('I need a vacuum for cat hair on stairs');
 assert.equal(x.target,'vacuum_cleaner');assert.equal(x.task,'product_selection');
 assert.deepEqual(x.needs.map(n=>n.id),['vacuum_pets','vacuum_stairs']);
 assert.equal(x.inherited.phase,172);assert.equal(x.rankingAuthorized,false);
 assert.equal(x.shouldStartProductRanking,false);
});
test('already-owned espresso machine is not automatically the shopping target',()=>{
 const x=task('I already ordered an espresso machine; which grinder can handle espresso and pour over for $300?');
 assert.equal(x.task,'product_selection');assert.equal(x.target,'coffee_grinder');
 assert.deepEqual(x.ownedEquipment,['coffee_machine']);
 assert.equal(x.needs.length,0);
 assert.ok(x.unresolvedIssues.includes('coffee_grinder_outside_phase172_five_category_goal_catalogue'));
});
test('owning an espresso machine alone does not imply a new espresso machine purchase',()=>{
 const x=task('I already have an espresso machine, how do I clean it safely?');
 assert.equal(x.task,'use_or_troubleshoot');assert.deepEqual(x.ownedEquipment,['coffee_machine']);
 assert.equal(x.rankingAuthorized,false);
});
test('contrast between tools is a solution comparison, not rank authorization',()=>{
 const x=task('I already own an oven and batch-cook curries. Would an air fryer actually help with reheating my meals?');
 assert.equal(x.target,'air_fryer');assert.equal(x.task,'solution_comparison');
 assert.ok(x.needs.some(n=>n.id==='airfryer_reheat'));
 assert.equal(x.shouldStartProductRanking,false);
});
test('reheating can be a use question rather than shopping',()=>{
 const x=task('How do I reheat food in my air fryer?');
 assert.equal(x.task,'use_or_troubleshoot');assert.equal(x.target,'air_fryer');
 assert.ok(x.needs.some(n=>n.id==='airfryer_reheat'));
});
test('air fryer prep burden adds provisional research only',()=>{
 const x=task('I need frozen meals my partner can cook with very little preparation in an air fryer when I am away.');
 const n=x.needs.find(n=>n.id==='airfryer_low_prep');assert.ok(n);
 assert.equal(n.origin,'phase173_usage_expansion');assert.equal(n.canDisqualifyProduct,false);
});
test('explicit denial of reheating does not create reheating goal',()=>{
 assert.ok(!ids("I don't want to reheat meals, I want an air fryer to cook them").includes('airfryer_reheat'));
});
test('mixed hard and soft floors adds both performance dimensions',()=>{
 const x=task('I want an inexpensive vacuum for a flat with mostly hard floors, and some carpet in the bedrooms.');
 const n=x.needs.find(n=>n.id==='vacuum_mixed_floor');assert.ok(n);
 assert.deepEqual(n.dimensionIds,['hard_floor_debris_pickup','carpet_debris_pickup','surface_change_workflow']);
});
test('no carpets cannot be inferred as mixed floors',()=>{
 assert.ok(!ids('I need a vacuum for hard floors but absolutely no carpets').includes('vacuum_mixed_floor'));
});
test('explicit home pet and a noncompensable cordless condition remain separate',()=>{
 const x=task('We need a vacuum for our cats on hard floors. It must be cordless and cover the apartment without the battery running out.');
 assert.ok(x.needs.some(n=>n.id==='vacuum_pets'));
 assert.ok(x.needs.some(n=>n.id==='vacuum_battery_duration'));
 assert.ok(x.inherited.hardConstraintCandidates.some(h=>h.id==='vacuum_cordless_only'));
 assert.equal(x.exclusionsAuthorized,false);
});
test('runtime not a priority should not yield runtime hypothesis',()=>{
 assert.ok(!ids("The battery isn't a concern; I want a vacuum for my carpet").includes('vacuum_battery_duration'));
});
test('washer top opening under overhead cabinetry is a candidate',()=>{
 const x=task('Need a top-load washing machine. Cabinets above mean the lid must fully open within limited clearance.');
 assert.ok(x.needs.some(n=>n.id==='washer_top_lid'));
 assert.equal(x.target,'washing_machine');
});
test('explicit studio fridge concern does not invent a need for silence',()=>{
 const x=task('I want a fridge for my studio apartment');
 assert.ok(x.needs.some(n=>n.id==='refrigerator_space'));
 assert.ok(!x.needs.some(n=>n.id==='refrigerator_quiet'));
});
test('known equivalent phrasing yields same candidate dimensions and names',()=>{
 const a=task('Need a vacuum for cat hair on stairs');
 const b=task('I need a vacuum for cat hair on stairs');
 assert.deepEqual(a.needs.map(n=>[n.id,...n.dimensionIds]),b.needs.map(n=>[n.id,...n.dimensionIds]));
 // Hash is deliberately request-specific; equality of these probes is not general semantic equivalence.
 assert.notEqual(a.inputSha256,b.inputSha256);
});
test('changing actual needs changes research graph candidates, not product ranks',()=>{
 const a=task('I want a vacuum for cat hair');const b=task('I want a vacuum for cat hair and stairs');
 assert.ok(!a.needs.some(n=>n.id==='vacuum_stairs'));
 assert.ok(b.needs.some(n=>n.id==='vacuum_stairs'));assert.equal(b.rankingAuthorized,false);
});
test('an invalid or non-English request is rejected',()=>{
 assert.throws(()=>researchTaskScope173({question:'Hi',language:'en'}),/bounded_english/);
 assert.throws(()=>researchTaskScope173({question:'Need vacuum',language:'es' as never}),/bounded_english/);
});
test('a tampered Phase172 plan is rejected by recomputing from raw question',()=>{
 const q='I need a vacuum for my cat hair';const plan=task(q).inherited;
 assert.throws(()=>researchTaskScope173({question:q,language:'en',plan172:{...plan,candidates:[]} }),/tampered/);
});
test('a cross-request inherited plan cannot be recycled',()=>{
 const plan=task('I need a vacuum for cat hair').inherited;
 assert.throws(()=>researchTaskScope173({question:'I need an air fryer for batch cooking',language:'en',plan172:plan}),/tampered/);
});
test('graph is deterministic, sorted, research-only and contains no product scores',()=>{
 const x=task('Need a vacuum for cat hair and stairs');
 const a=proposeNeedMechanismGraph173(x),b=proposeNeedMechanismGraph173(x);
 assert.deepEqual(a,b);assert.ok(a.links.length>0);
 assert.equal(a.productRankingAuthorized,false);assert.equal(a.allRelationsProvisional,true);
 assert.ok(a.links.every(l=>l.scientificStatus==='proposed_unreviewed'&&!l.rankingEligible&&!l.hardVetoEligible));
});
test('graph links original Phase172 protocol as a documentary pointer, not a measurement',()=>{
 const g=proposeNeedMechanismGraph173(task('I need a vacuum for my cat hair'));
 const l=g.links.find(x=>x.dimension==='pet_hair_pickup_by_surface');assert.ok(l);
 assert.equal(l.methodStatus,'published_method_to_review');
 assert.ok(l.methodReferences.some(m=>m.methodId==='rtings_vacuum_methods'));
 assert.equal(l.productEvidenceStatus,'not_provided');
});
test('uncovered Phase173 dimensions are explicitly in needs-method backlog',()=>{
 const g=proposeNeedMechanismGraph173(task('Need top-load washing machine; the overhead cabinets obstruct opening the lid.'));
 const l=g.links.find(x=>x.dimension==='lid_open_height');assert.ok(l);
 assert.equal(l.methodStatus,'original_method_missing');
 assert.ok(g.researchTasks.some(t=>t.includes('find_original_comparable_protocol:washing_machine:lid_open_height')));
});
test('document fingerprint is stable across paraphrases with the same candidate relation',()=>{
 const a=proposeNeedMechanismGraph173(task('Need a vacuum for cat hair on stairs'));
 const b=proposeNeedMechanismGraph173(task('I need a vacuum for cat hair on stairs'));
 assert.deepEqual(a.links.map(l=>l.fingerprint),b.links.map(l=>l.fingerprint));
 assert.notEqual(a.goalRequestHash,b.goalRequestHash);
});
test('review note is stored as unverified provenance, never causal validation',()=>{
 const proposal=proposeNeedMechanismGraph173(task('Need vacuum for cat hair')).links[0];
 const excerpt='A source test measures surface pickup under a stated laboratory procedure, not suitability for all homes.';
 const review=attachUnverifiedReview173({proposal,reviewId:'review.001',submittedBy:'internal.reviewer',
  evidenceType:'original_professional_protocol',sourceUrl:'https://www.rtings.com/vacuum/learn/how-we-test',
  sourceDocumentId:'rtings.vacuum.methods',sourceVersion:'2025-03-14',
  suppliedExcerpt:excerpt,reviewerAssessment:'consistent_with_proposal',
  statedLimitations:['Cannot infer product performance from a methods page']});
 assert.equal(review.suppliedExcerptSha256,sha(excerpt));
 assert.equal(review.originalDocumentAuthenticated,false);assert.equal(review.canPromoteToVerifiedCausalLink,false);
 assert.equal(review.rankingAuthorized,false);
});
test('review notes reject incomplete and invalid provenance',()=>{
 const proposal=proposeNeedMechanismGraph173(task('Need vacuum for cat hair')).links[0];
 const args={proposal,reviewId:'rev1',submittedBy:'reviewer1',evidenceType:'original_professional_protocol' as const,
  sourceUrl:'http://insecure.example.org',sourceDocumentId:'doc001',sourceVersion:'v1',
  suppliedExcerpt:'Enough content to pass the minimum excerpt length requirement.',
  reviewerAssessment:'consistent_with_proposal' as const,statedLimitations:[]};
 assert.throws(()=>attachUnverifiedReview173(args),/invalid_review/);
});
test('graph rejects a research plan falsified to authorize a product ranking',()=>{
 const x=task('Need vacuum for cat hair');
 assert.throws(()=>proposeNeedMechanismGraph173({...x,rankingAuthorized:true as never}),/untrusted/);
});
test('grinder target outside pilot catalogue does not invent product graphs',()=>{
 const x=task('I already have an espresso machine; I want a grinder for espresso');
 assert.equal(x.target,'coffee_grinder');
 assert.deepEqual(proposeNeedMechanismGraph173(x).links,[]);
});
test('full coffee machine plus grinder cannot be reduced to grinder-only',()=>{
 const x=task('I want a grinder and espresso machine together under $1500');
 assert.equal(x.target,'coffee_setup');assert.equal(x.needs.length,0);
 assert.ok(x.unresolvedIssues.includes('multi_equipment_coffee_system_requires_joint_scope_and_budget'));
});
test('espresso setup and grinder in a hosting request is multi-equipment',()=>{
 const x=task('What espresso setup and grinder should I choose for several back-to-back drinks?');
 assert.equal(x.target,'coffee_setup');assert.equal(x.task,'product_selection');
});
test('explicit battery repair-vs-replacement is a solution comparison',()=>{
 const x=task("I already have a cordless Jimmy vacuum; should I replace its battery or buy another vacuum for my cat's allergies?");
 assert.equal(x.task,'solution_comparison');
 assert.deepEqual(x.ownedEquipment,['vacuum_cleaner']);
 assert.ok(x.needs.some(n=>n.id==='vacuum_allergen_containment'));
});
test('saying I have allergies does not mean I already own a vacuum',()=>{
 const x=task('I have an allergy and need a vacuum for carpeted bedrooms');
 assert.deepEqual(x.ownedEquipment,[]);
 assert.ok(x.needs.some(n=>n.id==='vacuum_allergen_containment'));
});
test('stated difficulty carrying is recognized without inferring an identity',()=>{
 const x=task('Need a vacuum for stairs, I cannot lift heavy things');
 assert.ok(x.needs.some(n=>n.id==='vacuum_lift_handling'));
});
test('household animals expressed with a quantity are considered as provisional context',()=>{
 assert.ok(ids('Need a vacuum for eight cats and their litter').includes('vacuum_pets'));
});
test('a cat with allergy does not automatically prove fur-removal priority',()=>{
 const x=task('Need a vacuum for a dog with dust allergy and hardwood floor');
 assert.ok(x.needs.some(n=>n.id==='vacuum_allergen_containment'));
 assert.ok(!x.needs.some(n=>n.id==='vacuum_pets'));
});
test('explicit carpeted and hard flooring supports mixed-surface candidate',()=>{
 assert.ok(ids('Need a vacuum for carpeted bedrooms and wood laminate living area').includes('vacuum_mixed_floor'));
});
