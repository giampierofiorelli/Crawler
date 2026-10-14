import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {auditQuantifiedRequest166,screenQuestionEvidence166,advanceAndPlanRequest166,
 type EvidenceObservation166} from '../src/phase166_quantified_evidence_bridge.js';
import {newRequestSession164,advanceUserRequest164} from '../src/phase164_user_request_journey.js';
import type {CategoryBrain128,Concept128} from '../src/phase128_category_cognition_dialogue_bridge.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const brain:CategoryBrain128={categoryId:'coffee_machine',schemaVersion:1,
 aliases:['coffee machine','espresso machine','coffee maker'],sources:[{
  id:'constructed_source',url:'https://example.org/not-real-test',title:'Test fixture',
  originalDocumentId:'fixture_document',role:'original_expert_method'}],
 concepts:[{id:'steam_wand',kind:'capability',label:'Steam wand',aliases:['steam wand'],
  evidenceKeys:['steam_test'],state:'reviewed_definition',review:{reviewId:'fixture_review',
   reviewerId:'fixture_reviewer',sourceRefIds:['constructed_source'],reviewScope:'category_definition'}} as Concept128],
 quality:[],distinctions:[]};
const request=(question:string)=>advanceUserRequest164(newRequestSession164('phase166_session'),{
 turnId:'turn_1',question,language:'en',brains:[brain]});
const obs=(overrides:Partial<EvidenceObservation166>={}):EvidenceObservation166=>({
 id:'measurement_1',productId:'machine_a',metric:'width',canonicalUnit:'cm',value:34,
 sourceKind:'independent_original_test',sourceUrl:'https://example.org/review/machine-a',
 originalDocumentId:'original_doc_a',documentSha256:sha('constructed measurement, not a real review'),
 testProtocolId:'width_method',reviewReceiptId:'structural_receipt',independentlyAuthenticated:false,
 ...overrides
});
const audit=(q:string)=>auditQuantifiedRequest166(q).candidates;

test('width requirement uses supported original cm unit and exact substring',()=>{
 const q='Best coffee machine width under 35 cm';const a=audit(q);
 assert.equal(a.length,1);assert.deepEqual([a[0].metric,a[0].direction,a[0].canonicalUnit,a[0].maximum],
  ['width','strict_lt','cm',35]);assert.equal(q.slice(a[0].span.start,a[0].span.end),a[0].span.literal);
 assert.equal(a[0].userMeaningConfirmed,false);
});
test('metric conversion for inches, millimetres and metres is consistent',()=>{
 assert.equal(audit('Espresso machine width at most 14 inches')[0].maximum,35.56);
 assert.equal(audit('Espresso machine width under 350 mm')[0].maximum,35);
 assert.equal(audit('Espresso machine height under 0.35 metres')[0].maximum,35);
});
test('adjectival depth and height constraints preserve their semantics',()=>{
 assert.equal(audit('Coffee machine no deeper than 40 cm')[0].metric,'depth');
 assert.equal(audit('Coffee machine not taller than 30 cm')[0].metric,'height');
 assert.equal(audit('Coffee machine no deeper than 40 cm')[0].direction,'lte');
});
test('a bare dimension under 35 cm never pretends to know width or height',()=>{
 const a=audit('Best coffee machine under 35 cm')[0];
 assert.equal(a.metric,'unbound_dimension');assert.equal(a.scope,'unresolved');
});
test('sound pressure weighting cannot be inferred from unqualified dB',()=>{
 const a=audit('Coffee machine noise under 45 dB')[0];
 assert.equal(a.metric,'noise');assert.equal(a.canonicalUnit,null);
 assert.equal(a.reason,'ambiguous_acoustic_weighting');
});
test('dBA is distinct and can be modeled as a bounded candidate',()=>{
 const a=audit('Coffee machine noise no more than 45 dBA')[0];
 assert.equal(a.metric,'noise');assert.equal(a.canonicalUnit,'dBA');assert.equal(a.maximum,45);
});
test('candidate range is inclusive with preserved endpoints',()=>{
 const a=audit('Coffee machine width between 25 and 35 cm')[0];
 assert.equal(a.direction,'range_inclusive');assert.deepEqual([a.minimum,a.maximum],[25,35]);
});
test('reversed ranges are not silently normalized',()=>{
 const a=audit('Coffee machine width between 35 and 25 cm')[0];
 assert.equal(a.scope,'unresolved');assert.equal(a.reason,'reversed_range');
});
test('capacity recognizer cannot confuse ml with liters',()=>{
 const a=audit('Coffee machine tank capacity at least 750 ml')[0];
 assert.equal(a.metric,'capacity');assert.equal(a.minimum,0.75);
 assert.equal(a.canonicalUnit,'L');
});
test('price bounds require stated currency and polarity',()=>{
 const a=audit('Best coffee machine under £300 and width under 35 cm');
 assert.deepEqual(a.map(x=>x.metric),['price','width']);
 assert.deepEqual(a.map(x=>x.maximum),[300,35]);
});
test('unbounded money amount is not treated as a ceiling',()=>{
 const a=audit('Coffee machine for £300')[0];
 assert.equal(a.direction,'unresolved');assert.equal(a.reason,'price_without_explicit_comparator');
});
test('currency and unit categories are not mixed or converted at assumed FX rates',()=>{
 const a=audit('Coffee machine under $1,200, width under 35 cm');
 assert.equal(a[0].canonicalUnit,'USD');assert.equal(a[0].maximum,1200);
 assert.equal(a[1].canonicalUnit,'cm');
});
test('soft preference does not become a mandatory exclusion',()=>{
 const a=audit('Best coffee machine preferably width under 35 cm')[0];
 assert.equal(a.scope,'soft_preference');
});
test('negated comparator is unresolved rather than inverted',()=>{
 const a=audit('Coffee machine width not under 35 cm')[0];
 assert.equal(a.scope,'unresolved');assert.equal(a.reason,'negated_comparator_scope');
});
test('independent-source structural receipt produces only provisional compatibility',()=>{
 const q='Best coffee machine width under 35 cm';
 const r=screenQuestionEvidence166(request(q),q,['machine_a'],[obs()]);
 assert.equal(r.screens[0].status,'candidate_fit_not_verified');
 assert.deepEqual(r.screens[0].citedObservationIds,['measurement_1']);
 assert.equal(r.publicationAuthorized,false);assert.equal(r.productRankingAuthorized,false);
 assert.equal(r.independentReviewAuthenticated,false);
});
test('a structurally matching measurement above bound is not an authorized exclusion',()=>{
 const q='Coffee machine width under 35 cm';
 const r=screenQuestionEvidence166(request(q),q,['machine_a'],[obs({value:40})]);
 assert.equal(r.screens[0].status,'candidate_failure_not_verified');
 assert.equal(r.screens[0].excludedFromRanking,false);
});
test('an isolated manufacturer claim cannot certify fit or failure',()=>{
 const q='Coffee machine width under 35 cm';
 const r=screenQuestionEvidence166(request(q),q,['machine_a'],[obs({sourceKind:'manufacturer_specification'})]);
 assert.equal(r.screens[0].status,'insufficient_evidence');
});
test('customer rating cannot become independent expert measurement',()=>{
 const q='Coffee machine width under 35 cm';
 const r=screenQuestionEvidence166(request(q),q,['machine_a'],[obs({sourceKind:'customer_review'})]);
 assert.equal(r.screens[0].status,'insufficient_evidence');
});
test('a missing receipt or protocol never qualifies as an original reviewed observation',()=>{
 const q='Coffee machine width under 35 cm';
 const r=screenQuestionEvidence166(request(q),q,['machine_a'],[obs({reviewReceiptId:null})]);
 assert.equal(r.screens[0].status,'insufficient_evidence');
});
test('opposing qualified measurements produce contradiction hold',()=>{
 const q='Coffee machine width under 35 cm';
 const r=screenQuestionEvidence166(request(q),q,['machine_a'],[obs(),obs({id:'measurement_2',value:40})]);
 assert.equal(r.screens[0].status,'contradictory_evidence');
 assert.ok(r.researchObligations.includes('adjudicate_conflicting_width_for_machine_a'));
});
test('distinct protocols do not masquerade as comparable measurements',()=>{
 const q='Coffee machine width under 35 cm';
 const r=screenQuestionEvidence166(request(q),q,['machine_a'],[obs(),obs({id:'measurement_2',testProtocolId:'other_protocol'})]);
 assert.equal(r.screens[0].status,'uncomparable_evidence');
});
test('different canonical units for same metric are refused as invalid evidence',()=>{
 const q='Coffee machine width under 35 cm';
 assert.throws(()=>screenQuestionEvidence166(request(q),q,['machine_a'],[obs({canonicalUnit:'kg'})]),/invalid_phase166_evidence/);
});
test('query hash must bind evidence screening to exact user text',()=>{
 const r=request('Coffee machine width under 35 cm');
 assert.throws(()=>screenQuestionEvidence166(r,'Coffee machine width under 30 cm',[],[]),/mismatch/);
});
test('invalid evidence scope and duplicate observations fail closed',()=>{
 const q='Coffee machine width under 35 cm';const r=request(q);
 assert.throws(()=>screenQuestionEvidence166(r,q,['machine_a'],[obs(),obs()]),/invalid_phase166/);
 assert.throws(()=>screenQuestionEvidence166(r,q,['machine_b'],[obs()]),/invalid_phase166/);
});
test('multi-product same criterion retains equality of status under source-row reorder',()=>{
 const q='Coffee machine width under 35 cm';const r=request(q);
 const rows=[obs(),obs({id:'measurement_2',productId:'machine_b',value:37})];
 const a=screenQuestionEvidence166(r,q,['machine_a','machine_b'],rows);
 const b=screenQuestionEvidence166(r,q,['machine_a','machine_b'],[...rows].reverse());
 assert.deepEqual(a,b);
 assert.deepEqual(a.screens.map(s=>s.status),['candidate_fit_not_verified','candidate_failure_not_verified']);
});
test('full route: user request, context audit, quantity candidates, evidence tasks, no rank',()=>{
 const q='Best coffee machine with a steam wand, width under 35 cm, only expert reviews';
 const r=advanceAndPlanRequest166(newRequestSession164('phase166_route'),{
  turnId:'turn_1',question:q,language:'en',brains:[brain]},['machine_a'],[obs()]);
 assert.equal(r.request.contextAudit165?.requiresReview,true);
 assert.equal(r.request.rankingAuthorized,false);
 assert.equal(r.evidenceBridge?.screens[0].status,'candidate_fit_not_verified');
 assert.ok(r.evidenceBridge?.researchObligations.includes('confirm_quantity_q166_0_width'));
 assert.equal(r.evidenceBridge?.publicationAuthorized,false);
});
test('non-English workflow does not fake English quantified interpretation',()=>{
 const q='Migliore macchina del caffè sotto 35 cm';
 const r=advanceAndPlanRequest166(newRequestSession164('phase166_italian'),{
  turnId:'turn_1',question:q,language:'it',brains:[brain]});
 assert.equal(r.evidenceBridge,null);assert.equal(r.reason,'english_only_quantified_adapter');
});
test('constructed no-products research never asserts candidate-market completeness',()=>{
 const q='Coffee machine width under 35 cm';
 const r=screenQuestionEvidence166(request(q),q,[]);
 assert.ok(r.researchObligations.includes('discover_and_verify_product_universe'));
 assert.equal(r.productRankingAuthorized,false);
});
test('no quantity still retains source requirements and abstains',()=>{
 const q='Best coffee machine with a steam wand, only expert reviews';
 const r=screenQuestionEvidence166(request(q),q,['machine_a']);
 assert.deepEqual(r.quantityAudit.candidates,[]);assert.equal(r.productRankingAuthorized,false);
});
test('verified semantic-equivalent unit paraphrases share canonical fingerprint',()=>{
 const a=auditQuantifiedRequest166('Coffee machine width under 35 cm');
 const b=auditQuantifiedRequest166('Coffee machine width below 350 mm');
 assert.equal(a.canonicalConstraintFingerprint,b.canonicalConstraintFingerprint);
});
test('optional vs hard and strict vs inclusive do not share fingerprints',()=>{
 const hard=auditQuantifiedRequest166('Coffee machine width under 35 cm');
 const soft=auditQuantifiedRequest166('Coffee machine ideally width under 35 cm');
 const inc=auditQuantifiedRequest166('Coffee machine width at most 35 cm');
 assert.notEqual(hard.canonicalConstraintFingerprint,soft.canonicalConstraintFingerprint);
 assert.notEqual(hard.canonicalConstraintFingerprint,inc.canonicalConstraintFingerprint);
});
test('current market price cannot be borrowed from an original product test',()=>{
 const q='Best coffee machine under £300';
 const r=screenQuestionEvidence166(request(q),q,['machine_a'],[obs({metric:'price',canonicalUnit:'GBP',value:200})]);
 assert.equal(r.screens[0].status,'insufficient_evidence');
 assert.equal(r.screens[0].reason,'needs_current_authenticated_price_not_historical_review_price');
 assert.ok(r.researchObligations.includes('acquire_current_authorized_price_for_machine_a'));
});
test('conflicting mandatory dimension bounds are detected rather than choosing one',()=>{
 const q='Coffee machine width under 30 cm and width over 35 cm';
 const a=auditQuantifiedRequest166(q);
 assert.equal(a.candidates.length,2);
 assert.deepEqual(a.candidates.map(x=>x.reason),['contradictory_quantity_bounds','contradictory_quantity_bounds']);
 assert.equal(a.requiresUserConfirmation,true);
});
test('nonconflicting constraints on different dimensions do not conflict',()=>{
 const a=auditQuantifiedRequest166('Coffee machine width under 30 cm and depth over 35 cm');
 assert.deepEqual(a.candidates.map(x=>x.scope),['hard_candidate','hard_candidate']);
});
test('unsupported units are visible as unresolved candidates',()=>{
 const a=auditQuantifiedRequest166('Air fryer capacity under 2 quarts');
 assert.equal(a.candidates.length,1);
 assert.equal(a.candidates[0].reason,'unsupported_or_unbound_quantity_unit');
 assert.equal(a.candidates[0].scope,'unresolved');
});
test('corrupt type/unit observation pairs are rejected, not normalized by guess',()=>{
 const q='Coffee machine width under 35 cm';
 assert.throws(()=>screenQuestionEvidence166(request(q),q,['machine_a'],[obs({canonicalUnit:'kg'})]),/invalid_phase166_evidence/);
});
