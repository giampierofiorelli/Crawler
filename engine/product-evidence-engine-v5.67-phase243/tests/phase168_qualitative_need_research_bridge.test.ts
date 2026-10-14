import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {advanceUserRequest164,newRequestSession164} from '../src/phase164_user_request_journey.js';
import {planQualitativeNeedResearch168,type FacetMapping168,type UserConfirmation168}
 from '../src/phase168_qualitative_need_research_bridge.js';
import type {CategoryBrain128,Concept128} from '../src/phase128_category_cognition_dialogue_bridge.js';
import type {QuarantinedQualitativeFinding,ReviewEvidenceApproval}
 from '../src/phase96_qualitative_review_evidence.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
// Research fixtures are synthetic; schema review receipts are NOT authentic humans.
const aspects=[
 ['quiet_operation','quiet','performance_quality','appliance_noise_quality'],
 ['steam_wand','steam wand','feature_presence','steam_wand_presence'],
 ['app_control','app control','feature_presence','app_control_presence'],
 ['fast_heating','quick heat-up','performance_quality','heating_speed']
] as const;
const brain:CategoryBrain128={categoryId:'coffee_machine',schemaVersion:1,
 aliases:['coffee machine','espresso machine'],sources:[{id:'fixture_source',
 url:'https://example.org/constructed-method',title:'Constructed method',
 originalDocumentId:'constructed_doc',role:'original_expert_method'}],
 concepts:aspects.map(a=>({id:a[0],kind:'capability',label:a[0],aliases:[a[1]],
 evidenceKeys:['constructed_'+a[0]],state:'reviewed_definition',review:{reviewId:'fixture_review',
 reviewerId:'not_a_real_reviewer',reviewScope:'category_definition',
 sourceRefIds:['fixture_source']}})) as Concept128[],quality:[],distinctions:[]};
const mappings:FacetMapping168[]=aspects.map(a=>({categoryId:'coffee_machine',aspectId:a[0],
 criterionId:a[3],evidenceSemantics:a[2],categoryReviewReference:'fixture_only_reference'}));
const run=(question:string)=>advanceUserRequest164(newRequestSession164('phase168_fixture'),{
 turnId:'turn_1',question,language:'en',brains:[brain]});
const userConfirm=(q:string,aspectId:string,meaning:UserConfirmation168['meaning'],
 exactUserPhrase:string,context={usage:'shared_kitchen'}):UserConfirmation168=>({
 confirmationId:'confirm_'+aspectId,turnId:'turn_1',questionSha256:sha(q),aspectId,meaning,
 exactUserPhrase,confirmationEventReference:'constructed_user_confirmation_event',confirmedContext:context});
const plan=(q:string,other:Record<string,unknown>={})=>planQualitativeNeedResearch168({
 request:run(q),question:q,facets:mappings,...other});
const finding=(variant='variant_a',over:Partial<QuarantinedQualitativeFinding>={}):QuarantinedQualitativeFinding=>({
 findingId:'quiet_test',exactVariantId:variant,criterionId:'appliance_noise_quality',
 proposition:'This model was noisy during the constructed usage trial.',polarity:'unfavourable',
 basis:'hands_on_observation',context:{usage:'shared_kitchen'},
 methodologyReference:'constructed_protocol',qualification:null,
 originalTestId:'constructed_test_run',sourceUrl:'https://example.org/constructed-review',
 sourceSha256:sha('source'),sourceSpanSha256:sha('span'),sourceSpanBytes:33,
 reviewStatus:'quarantined_for_semantic_method_and_rights_review',
 evidenceKind:'original_professional_qualitative_observation',quantifiedMeasurement:false,
 weight:null,numericScore:null,...over});
const approval=(f:QuarantinedQualitativeFinding,over:Partial<ReviewEvidenceApproval>={}):ReviewEvidenceApproval=>({
 findingId:f.findingId,reviewerId:'constructed_reviewer',reviewReference:'constructed_not_a_real_approval',
 validatedSourceSha256:f.sourceSha256,reviewedAt:'2026-10-12T08:00:00Z',
 semanticFaithfulness:'confirmed',methodAssessment:'documented',adequacyAssessment:'documented',
 criterionImplication:'concerns',...over});

test('required performance is only a proposal until a separate user confirmation',()=>{
 const p=plan('Best coffee machine must have quiet');
 assert.equal(p.requirements.length,1);
 assert.equal(p.requirements[0].status,'pending_user_confirmation');
 assert.equal(p.requirements[0].method,'performance_quality');
 assert.equal(p.requirements[0].proposedMeaning,'required');
 assert.equal(p.rankingAuthorized,false);
});
test('documentary confirmed performance routes to prior Phase96 qualitative method',()=>{
 const q='Best coffee machine must have quiet';const r=plan(q,{
  confirmations:[userConfirm(q,'quiet_operation','required','quiet')],
  variantEvidence:[{variantId:'variant_a',findings:[finding()],approvals:[approval(finding())]}]});
 assert.equal(r.requirements[0].status,'qualitative_test_research');
 assert.equal(r.variantPreviews[0].assessments[0].status,'potential_essential_constraint_conflict');
 assert.equal(r.variantPreviews[0].assessments[0].recommendationGuard,'hold_for_review');
 assert.equal(r.variantPreviews[0].eligibleForExclusion,false);
 assert.equal(r.independentUserConfirmationAuthentication,false);
 assert.equal(r.independentlyAuthenticatedReviewEvidence,false);
});
test('preferred quality does not become an essential user hard constraint',()=>{
 const q='Best coffee machine ideally quiet';const r=plan(q,{
  confirmations:[userConfirm(q,'quiet_operation','preferred','quiet')],
  variantEvidence:[{variantId:'variant_a',findings:[finding()],approvals:[approval(finding())]}]});
 assert.equal(r.requirements[0].proposedMeaning,'preferred');
 assert.equal(r.variantPreviews[0].assessments[0].status,'contextual_concern');
 assert.equal(r.variantPreviews[0].assessments[0].recommendationGuard,'no_additional_hold');
});
test('without a feature requires direct absence verification, not opinion polarity',()=>{
 const q='Best coffee machine without a steam wand';const r=plan(q,{
  confirmations:[userConfirm(q,'steam_wand','excluded','steam wand')]});
 assert.equal(r.requirements[0].status,'structural_feature_verification');
 assert.match(r.requirements[0].researchAction,/verify_feature_absent/);
 assert.equal(r.variantPreviews.length,0);
});
test('must have physical feature requires presence not good performance',()=>{
 const q='Best coffee machine must have a steam wand';const r=plan(q,{
  confirmations:[userConfirm(q,'steam_wand','required','steam wand')],
  variantEvidence:[{variantId:'variant_a',findings:[finding()],approvals:[approval(finding())]}]});
 assert.equal(r.requirements[0].status,'structural_feature_verification');
 assert.equal(r.variantPreviews[0].assessments.length,0);
});
test('no need for feature stays optional and cannot exclude or force a match',()=>{
 const q='Best coffee machine no need for a steam wand';const r=plan(q);
 assert.equal(r.requirements[0].proposedMeaning,'optional');
 assert.equal(r.requirements[0].status,'optional_not_requirement');
 assert.equal(r.requirements[0].rankingAuthorized,false);
});
test('an excluded quality facet is not naively inverted from sentiment',()=>{
 const q='Best coffee machine without quiet';const r=plan(q,{
  confirmations:[userConfirm(q,'quiet_operation','excluded','quiet')]});
 assert.equal(r.requirements[0].status,'unresolved_excluded_performance');
 assert.equal(r.variantPreviews.length,0);
});
test('unreviewed qualitative evidence with no approval remains unresolved',()=>{
 const q='Best coffee machine must have quiet';const r=plan(q,{
  confirmations:[userConfirm(q,'quiet_operation','required','quiet')],
  variantEvidence:[{variantId:'variant_a',findings:[finding()],approvals:[]}]});
 assert.equal(r.variantPreviews[0].assessments[0].status,'unresolved_methodology');
});
test('different user usage context is not silently treated as applicable',()=>{
 const q='Best coffee machine must have quiet';const r=plan(q,{
  confirmations:[userConfirm(q,'quiet_operation','required','quiet',{usage:'bedroom'})],
  variantEvidence:[{variantId:'variant_a',findings:[finding()],approvals:[approval(finding())]}]});
 assert.equal(r.variantPreviews[0].assessments[0].status,'not_applicable');
});
test('source note applies only to exact variant, not nearby competitor',()=>{
 const q='Best coffee machine must have quiet';const r=plan(q,{
  confirmations:[userConfirm(q,'quiet_operation','required','quiet')],
  variantEvidence:[{variantId:'variant_a',findings:[finding()],approvals:[approval(finding())]},
   {variantId:'variant_b',findings:[],approvals:[]}]});
 assert.equal(r.variantPreviews[0].variantId,'variant_a');
 assert.equal(r.variantPreviews[1].variantId,'variant_b');
 assert.equal(r.variantPreviews[1].assessments[0].status,'no_evidence');
});
test('cross variant source injection cannot be evaluated as another variant',()=>{
 const q='Best coffee machine must have quiet';assert.throws(()=>plan(q,{
  confirmations:[userConfirm(q,'quiet_operation','required','quiet')],
  variantEvidence:[{variantId:'variant_b',findings:[finding('variant_a')],approvals:[]}]
 }),/cross_variant/);
});
test('wrong turn or question hash cannot borrow a confirmation',()=>{
 const q='Best coffee machine must have quiet';const c=userConfirm(q,'quiet_operation','required','quiet');
 for(const bad of [{...c,turnId:'turn_wrong'},{...c,questionSha256:sha('other')},
  {...c,exactUserPhrase:'silent'}])assert.throws(()=>plan(q,{confirmations:[bad]}),/unmatched/);
});
test('unresolved contradictory mention is never repaired by false confirmation',()=>{
 const q='Best coffee machine must have quiet but without quiet';
 const p=plan(q);assert.equal(p.requirements[0].status,'ambiguous_user_scope');
 assert.throws(()=>plan(q,{confirmations:[userConfirm(q,'quiet_operation','required','quiet')]}),
 /confirmation_cannot_resolve/);
});
test('a question without an explicit qualitative occurrence has no invented requirement',()=>{
 const p=plan('Best coffee machine overall');assert.deepEqual(p.requirements,[]);
});
test('source preference no customer reviews does not become a missing product feature',()=>{
 const q='Best coffee machine no customer reviews, must have quiet';const r=plan(q);
 assert.equal(r.requirements.length,1);
 assert.equal(r.requirements[0].aspectId,'quiet_operation');
});
test('a genuine question mismatch is rejected, even with same category',()=>{
 const q='Best coffee machine must have quiet';const request=run(q);
 assert.throws(()=>planQualitativeNeedResearch168({question:'Best coffee machine overall',request,
  facets:mappings}),/invalid_phase168_request/);
});
test('unknown mapping must stay pending taxonomy review',()=>{
 const p=plan('Best coffee machine must have quiet',{facets:[]});
 assert.equal(p.requirements[0].status,'unmapped_reviewed_facet');
});
test('methodological assessment never turns into rank when all receipts agree',()=>{
 const q='Best coffee machine must have quiet';const a=finding();
 const r=plan(q,{confirmations:[userConfirm(q,'quiet_operation','required','quiet')],
  variantEvidence:[{variantId:'variant_a',findings:[a],approvals:[approval(a,{criterionImplication:'supports'})]}]});
 assert.equal(r.variantPreviews[0].assessments[0].status,'contextual_support');
 assert.equal(r.rankingAuthorized,false);assert.equal(r.publicationAuthorized,false);
});
test('tampered finding receipt cannot manufacture evidence',()=>{
 const q='Best coffee machine must have quiet';const a=finding();
 const r=plan(q,{confirmations:[userConfirm(q,'quiet_operation','required','quiet')],
  variantEvidence:[{variantId:'variant_a',findings:[a],approvals:[approval(a,{validatedSourceSha256:sha('different')})]}]});
 assert.equal(r.variantPreviews[0].assessments[0].status,'unresolved_methodology');
});
test('duplicate mapping criterion is rejected rather than double counting',()=>{
 const q='Best coffee machine must have quiet';assert.throws(()=>plan(q,{
  facets:[mappings[0],{...mappings[1],criterionId:mappings[0].criterionId}]}),/invalid_phase168_request/);
});

test('unrelated numerical bound does not erase an explicit qualitative obligation',()=>{
 const q='Best coffee machine must have quiet under 35 cm';
 const r=plan(q);
 assert.equal(r.requirements[0].proposedMeaning,'required');
 assert.equal(r.requirements[0].status,'pending_user_confirmation');
 assert.ok(r.researchObligations.some(x=>x.includes('quantity')||x.includes('context')));
});
test('ambiguous scalar negation blocks committing even an otherwise recognized quality',()=>{
 const q='Best coffee machine must have quiet but not too noisy';
 const r=plan(q);
 assert.equal(r.requirements[0].status,'ambiguous_user_scope');
 assert.equal(r.rankingAuthorized,false);
});
