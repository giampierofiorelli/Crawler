import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assessCreatorCredibility204,appraiseAwardCandidates204,planCreatorLateralChecks204,appraiseVideoMethodCues204,
 type CreatorCue204,type AwardCandidate204} from '../src/phase204_creator_authority_awards.js';
import {inspectVideoObservations203,type VideoEvidenceBatchIn203,
 type VideoObservationIn203,planVideoSearch203} from '../src/phase203_video_evidence_search.js';
import {type ResearchPlan182} from '../src/phase182_gap_research_orchestrator.js';
import {type SourceMatrix196} from '../src/phase196_source_intelligence.js';

const videoId='aB1cD2eF3_4',ch='UC'+'X'.repeat(22);
const o=(patch:Partial<VideoObservationIn203>={}):VideoObservationIn203=>({
 observationId:'opinion1',atSecond:220,durationSeconds:18,criterionId:'cup_quality',
 disciplineId:'italian_espresso',outcomeId:'espresso_flavour',protocolId:null,
 mode:'specialist_practical_opinion',finding:'supports',reportedEventGroupId:null,
 reviewerReceiptId:null,sourceBasis:'human_annotation',transientExcerpt:'I really enjoy the coffee',...patch});
const b=(patch:Partial<VideoEvidenceBatchIn203>={}):VideoEvidenceBatchIn203=>({
 videoUrl:`https://www.youtube.com/watch?v=${videoId}`,sourceId:'video_es1',channelId:ch,
 exactVariantId:'espresso_one',categoryId:'coffee',language:'en',uploadDate:'2026-10-08',
 access:'manually_reviewed_video',rightsReviewId:null,providerId:null,providerVersion:null,
 variantMatchedByReviewId:null,expertiseReviewId:null,sponsorship:'unknown',
 observations:[o()],existingEventGroups:[],...patch});
const cue=(patch:Partial<CreatorCue204>={}):CreatorCue204=>({
 cueId:'cue1',creatorId:'creator1',sourceUrl:'https://guild.example.com/creators/creator1',
 sourceGroupId:'guild_original',kind:'official_qualification_record',disciplineId:'italian_espresso',
 outcomeId:'espresso_flavour',observedOn:'2026-10-11',reviewedRecordId:'rev_document',
 identityMatchReviewId:'rev_identity',originalPublisher:'documented',
 relationship:'independent_reported',...patch});
const c=(patch:Record<string,unknown>={})=>({
 research:inspectVideoObservations203(b()),channelId:ch,creatorId:'creator1',
 disciplineId:'italian_espresso',outcomeId:'espresso_flavour',asOf:'2026-10-13',
 channelIdentityReviewId:'rev_channel',cues:[cue()],declaredCommercialRelationship:'unknown' as const,
 ...patch});
const award=(patch:Partial<AwardCandidate204>={}):AwardCandidate204=>({
 awardId:'award1',issuerId:'ces',programmeId:'innovation_awards',edition:'2026',
 winnerKind:'product',winnerId:'espresso_one',variantId:'variant_one',awardScope:'innovation',
 method:'application_jury_not_product_test',sourceUrl:'https://www.ces.tech/innovation/',
 issuerRecordReviewId:'issuer_review',exactVariantReviewId:'variant_review',
 methodReviewId:'method_review',disciplineId:null,outcomeId:null,awardStatus:'issuer_entry_reviewed',
 relationship:'fee_or_licensing_disclosed',sourceGroupId:'original_award',...patch});
const assessAwards=(entries:AwardCandidate204[])=>appraiseAwardCandidates204({productId:'espresso_one',variantId:'variant_one',entries});
const plan=():ResearchPlan182=>({phase:182,schema:'182.1',categoryId:'coffee',categoryLabel:'Coffee',
 market:'uk',asOf:'2026-10-13T09:00:00Z',inputFingerprint:'abc',knowledgeRevision:null,
 policyRevision:null,planHash:'phase204hash',omittedByBudget:0,planningOnly:true,
 rankingAuthorized:false,hardExclusionsAuthorized:false,jobs:[{jobId:'job1',categoryId:'coffee',
 kind:'exact_variant_source_research',gapKind:'missing_test',reference:'espresso_one:cup_quality',
 exactVariantId:'espresso_one',criterionId:'cup_quality',priorityOrder:0,authority:'research_only',status:'queued'}]});
const matrix=()=>({schema:'196.1',state:'research_only',publicRankingAllowed:false} as SourceMatrix196);
const lateral=()=>{const p=plan();return {plan:p,matrix:matrix(),videoPlan:planVideoSearch203({
 plan:p,matrix:matrix(),scopes:[{jobId:'job1',exactVariantId:'espresso_one',criterionId:'cup_quality',
 productName:'Coffee Machine',disciplineId:'italian_espresso',outcomeId:'espresso_flavour',languages:['en']}]}),
 jobId:'job1',creatorLabel:'Sam Reviewer',disciplineId:'italian_espresso',outcomeId:'espresso_flavour'};};

test('documented scoped credential is only specialist verification candidate, not a seal',()=>{
 const r=assessCreatorCredibility204(c());assert.equal(r.lane,'task_specialist_to_verify');
 assert.deepEqual(r.credentialHints,['cue1']);assert.equal(r.ratingOrUniversalScore,null);
 assert.equal(r.trustBadgeAuthorized,false);assert.equal(r.rankingAuthorized,false);
 assert.equal(r.sourceProfileIsNotClaimAuthentication,true);
});
test('unverified self biography cannot establish specialist qualifications',()=>{
 const r=assessCreatorCredibility204(c({cues:[cue({kind:'self_biography',relationship:'self_asserted'})]}));
 assert.equal(r.lane,'opinion_and_use_experience');assert.equal(r.credentialHints.length,0);
});
test('verified specialist of different technique cannot validate espresso',()=>{
 const r=assessCreatorCredibility204(c({cues:[cue({disciplineId:'japanese_sushi',outcomeId:'sashimi_cut'})]}));
 assert.equal(r.lane,'opinion_and_use_experience');
});
test('off-topic reputable professional reference cannot confer an espresso credential',()=>{
 const r=assessCreatorCredibility204(c({cues:[cue({kind:'independent_professional_reference',
 disciplineId:'japanese_sushi',outcomeId:'sashimi_cut'})]}));
 assert.equal(r.credentialHints.length,0);assert.equal(r.reputationHints.length,1);
});
test('channel size cannot change output because no popularity is an input',()=>{
 assert.deepEqual(assessCreatorCredibility204(c()),assessCreatorCredibility204(c()));
 assert.equal(assessCreatorCredibility204(c()).subscriptionsOrViewsUsed,false);
});
test('absence of reviewed channel identity prevents credential upgrade',()=>{
 const r=assessCreatorCredibility204(c({channelIdentityReviewId:null}));
 assert.equal(r.lane,'opinion_and_use_experience');
 assert.ok(r.missingChecks.includes('creator_channel_identity_not_documented'));
});
test('copied publicity cannot substitute external corroboration',()=>{
 const r=assessCreatorCredibility204(c({cues:[cue({kind:'copied_publicity',
 originalPublisher:'derived_republication'})]}));
 assert.equal(r.independentReferenceGroups,0);
 assert.ok(r.commercialOrDisputeCues.includes('cue1'));
});
test('self assertion and commercial endorsement still recorded without blanket exclusion',()=>{
 const r=assessCreatorCredibility204(c({cues:[cue({relationship:'commercially_connected'})],
 declaredCommercialRelationship:'declared'}));
 assert.equal(r.lane,'opinion_and_use_experience');assert.equal(r.opinionObservations.length,1);
 assert.equal(r.missingChecks.includes('commercial_relationship_unknown'),false);
});
test('AI-extracted opinion kept visibly unverified, not specialist validation',()=>{
 const r=assessCreatorCredibility204(c({research:inspectVideoObservations203(b({
 observations:[o({sourceBasis:'ai_extraction_unverified'})]}))}));
 assert.equal(r.opinionObservations[0].reviewStatus,'ai_unverified');
 assert.equal(r.opinionObservations[0].specialistValidationAdmitted,false);
});
test('even human-annotated personal positive opinion does not become instrumental evidence',()=>{
 const r=assessCreatorCredibility204(c());const op=r.opinionObservations[0];
 assert.equal(op.reviewStatus,'human_annotated');assert.equal(op.instrumentalTestAdmitted,false);
 assert.equal(op.mayInformUserExperienceResearch,true);
 assert.equal(op.urlAtTime,`https://www.youtube.com/watch?v=${videoId}&t=220s`);
});
test('technical claim excluded from personal opinion lane, not silently recast',()=>{
 const r=assessCreatorCredibility204(c({research:inspectVideoObservations203(b({
 observations:[o({mode:'instrument_reading_claimed'})]}))}));
 assert.equal(r.opinionObservations.length,0);
});
test('an opinion about another outcome cannot validate espresso',()=>{
 const r=assessCreatorCredibility204(c({research:inspectVideoObservations203(b({
 observations:[o({disciplineId:'coffee_cleaning',outcomeId:'maintenance'})]}))}));
 assert.equal(r.opinionObservations.length,0);
});
test('negative consumer experience remains discoverable',()=>{
 const r=assessCreatorCredibility204(c({research:inspectVideoObservations203(b({
 observations:[o({finding:'contradicts'})]}))}));
 assert.equal(r.opinionObservations[0].finding,'contradicts');
});
test('original source groups are deduplicated across independent references',()=>{
 const r=assessCreatorCredibility204(c({cues:[cue(),cue({cueId:'cue2'})]}));
 assert.equal(r.independentReferenceGroups,1);
});
test('a distinct independent source group is separately discoverable',()=>{
 const r=assessCreatorCredibility204(c({cues:[cue(),cue({cueId:'cue2',sourceGroupId:'association_two'})]}));
 assert.equal(r.independentReferenceGroups,2);
});
test('cue observation from the future is rejected',()=>{
 assert.throws(()=>assessCreatorCredibility204(c({cues:[cue({observedOn:'2026-10-14'})]})),/phase204_cue/);
});
test('invalid or deceptive external URLs rejected',()=>{
 for(const sourceUrl of ['http://guild.example','https://localhost/a','https://guild.example/#a',
   'https://sam:password@guild.example/c']){
  assert.throws(()=>assessCreatorCredibility204(c({cues:[cue({sourceUrl})]})),/phase204_cue/);
 }
});
test('duplicate cue IDs rejected',()=>{
 assert.throws(()=>assessCreatorCredibility204(c({cues:[cue(),cue()]})),/phase204_input/);
});
test('foreign creator identity cannot be mixed with another channel',()=>{
 assert.throws(()=>assessCreatorCredibility204(c({cues:[cue({creatorId:'someone_else'})]})),/phase204_cue/);
});
test('lateral research uses existing Phase182 work and no new crawler',()=>{
 const r=planCreatorLateralChecks204(lateral());assert.equal(r.queries.length,4);
 assert.ok(r.queries.some(x=>x.purpose==='award_authentication'));
 assert.equal(r.newResearchQueue,false);assert.equal(r.rankingAuthorized,false);
});
test('unknown Phase182 research job cannot initiate creator lateral research',()=>{
 assert.throws(()=>planCreatorLateralChecks204({...lateral(),jobId:'stranger'}),/phase204_lateral_scope/);
});
test('different Phase182 plan hash blocks stale video plan reuse',()=>{
 const a=lateral();assert.throws(()=>planCreatorLateralChecks204({...a,plan:{...a.plan,planHash:'other'}}),/phase204_lateral_scope/);
});
test('lateral research order and budget deterministic',()=>{
 const a=lateral();assert.deepEqual(planCreatorLateralChecks204(a),planCreatorLateralChecks204(a));
 assert.equal(planCreatorLateralChecks204({...a,maxQueries:2}).queries.length,2);
});
test('no accepted award as original independent test even when issuer entry reviewed',()=>{
 const r=assessAwards([award()]);assert.equal(r.awards[0].classification,'issuer_entry_documented_unauthed');
 assert.equal(r.awards[0].originalTestAdmitted,false);
 assert.equal(r.awards[0].canServeAsSpecialistValidation,false);
 assert.equal(r.publicBadgeAuthorized,false);
});
test('CES-type innovation award is NOT espresso performance evaluation',()=>{
 const r=assessAwards([award()]);assert.equal(r.awards[0].relevantFor,'design_or_innovation_context');
});
test('design award cannot confer specialist taste validation even with test method claim',()=>{
 const r=assessAwards([award({awardScope:'design',method:'structured_original_test'})]);
 assert.equal(r.awards[0].canServeAsSpecialistValidation,false);
 assert.equal(r.awards[0].relevantFor,'design_or_innovation_context');
});
test('award for creator must not be awarded to product',()=>{
 const r=assessAwards([award({winnerKind:'creator',winnerId:'creator1',variantId:null,
  awardScope:'creator_career'})]);
 assert.equal(r.awards[0].classification,'outside_variant_or_winner_scope');
 assert.equal(r.awards[0].relevantFor,'creator_biography_only');
 assert.equal(r.awards[0].canServeAsSpecialistValidation,false);
});
test('model variant mismatch prevents issuer-reviewed outcome claims',()=>{
 const r=assessAwards([award({variantId:'variant_two'})]);
 assert.equal(r.awards[0].classification,'outside_variant_or_winner_scope');
});
test('an issuer entry without reviewed method is not authenticated award',()=>{
 const r=assessAwards([award({methodReviewId:null})]);
 assert.equal(r.awards[0].classification,'award_claim_unverified');
});
test('withdrawn awards are explicitly held',()=>{
 const r=assessAwards([award({awardStatus:'withdrawn'})]);
 assert.equal(r.awards[0].classification,'withdrawn_or_expired');assert.equal(r.awards[0].relevantFor,'none');
});
test('expired awards are explicitly held',()=>{
 const r=assessAwards([award({awardStatus:'expired'})]);
 assert.equal(r.awards[0].classification,'withdrawn_or_expired');
});
test('practical specialist jury award produces research lead, not validation',()=>{
 const r=assessAwards([award({awardScope:'specialist_outcome',method:'structured_practical_jury',
 disciplineId:'italian_espresso',outcomeId:'espresso_flavour'})]);
 assert.equal(r.awards[0].relevantFor,'practical_use_research');
 assert.equal(r.awards[0].canServeAsSpecialistValidation,false);
});
test('practical label without matching method and scope not enough',()=>{
 const r=assessAwards([award({awardScope:'specialist_outcome',method:'application_jury_not_product_test'})]);
 assert.equal(r.awards[0].relevantFor,'none');
});
test('popular vote only supports context on consumer preference',()=>{
 const r=assessAwards([award({awardScope:'consumer_popularity',method:'public_vote'})]);
 assert.equal(r.awards[0].relevantFor,'consumer_preference_context');
});
test('disclosed prize fees not proof of fraud and cannot be hidden',()=>{
 const r=assessAwards([award()]);
 assert.equal(r.awards[0].commercialDisclosure,'fee_or_licensing_disclosed');
 assert.equal(r.awards[0].classification,'issuer_entry_documented_unauthed');
});
test('award news duplicated across sites counts as one programme prize',()=>{
 const r=assessAwards([award(),award({awardId:'award2',sourceUrl:'https://example.org/article',
  sourceGroupId:'republished_copy'})]);
 assert.equal(r.uniqueAwardGroups,1);
});
test('different editions remain distinct awards',()=>{
 const r=assessAwards([award(),award({awardId:'award2',edition:'2025'})]);
 assert.equal(r.uniqueAwardGroups,2);
});
test('unknown award is not evidence of failure and no certification',()=>{
 const r=assessAwards([award({awardStatus:'unknown'})]);
 assert.equal(r.awards[0].classification,'award_claim_unverified');
 assert.equal(r.productRankingUnchanged,true);
});
test('invalid official registry URL rejected',()=>{
 assert.throws(()=>assessAwards([award({sourceUrl:'https://localhost/winners'})]),/phase204_award_entry/);
});
test('duplicate award IDs rejected',()=>{
 assert.throws(()=>assessAwards([award(),award()]),/phase204_award_input/);
});
test('no awards is normal for new niche product and not a negative rating',()=>{
 const r=assessAwards([]);assert.deepEqual(r.awards,[]);assert.equal(r.uniqueAwardGroups,0);
 assert.equal(r.productRankingUnchanged,true);
});


test('video can contain reviewed methodology leads without proving test originality',()=>{
 const r=appraiseVideoMethodCues204(inspectVideoObservations203(b()),[{cueId:'m1',
  observationId:'opinion1',kind:'setup_parameters_disclosed',basis:'human_reviewed_annotation',
  reviewReceiptId:'human_one'}]);
 assert.equal(r.mode,'methodology_followup');assert.equal(r.noExperimentsAdmitted,true);
 assert.equal(r.canReplaceSpecialistOutcomeValidation,false);
});
test('honest long-term subjective user report retains research value without lab method',()=>{
 const r=appraiseVideoMethodCues204(inspectVideoObservations203(b()),[{cueId:'m1',
  observationId:'opinion1',kind:'long_term_use_context',basis:'human_reviewed_annotation',
  reviewReceiptId:'human_one'}]);
 assert.equal(r.mode,'situated_experience');
});
test('a video consisting of commercial pitch is not a reviewed method',()=>{
 const r=appraiseVideoMethodCues204(inspectVideoObservations203(b()),[{cueId:'m1',
  observationId:'opinion1',kind:'commercial_pitch',basis:'human_reviewed_annotation',
  reviewReceiptId:'human_one'}]);
 assert.equal(r.mode,'commercial_or_unsupported_only');
});
test('AI-generated video-quality assessment remains unverified',()=>{
 const r=appraiseVideoMethodCues204(inspectVideoObservations203(b()),[{cueId:'m1',
  observationId:'opinion1',kind:'repeat_or_comparison_shown',basis:'ai_proposal',
  reviewReceiptId:null}]);
 assert.equal(r.mode,'not_enough_annotation');assert.deepEqual(r.aiUnverifiedCues,['m1']);
});
test('human reviewed method cue requires receipt',()=>{
 assert.throws(()=>appraiseVideoMethodCues204(inspectVideoObservations203(b()),[{cueId:'m1',
  observationId:'opinion1',kind:'setup_parameters_disclosed',basis:'human_reviewed_annotation',
  reviewReceiptId:null}]),/phase204_video_method_cue/);
});
test('claims about timestamps not in the video cannot be accepted as method cues',()=>{
 assert.throws(()=>appraiseVideoMethodCues204(inspectVideoObservations203(b()),[{cueId:'m1',
  observationId:'unknown_time',kind:'setup_parameters_disclosed',basis:'ai_proposal',
  reviewReceiptId:null}]),/phase204_video_method_cue/);
});
test('method cues cannot alter original video admission or badge status',()=>{
 const research=inspectVideoObservations203(b());
 const r=appraiseVideoMethodCues204(research,[]);assert.equal(r.rankingAuthorized,false);
 assert.equal(r.noTranscriptStored,true);assert.equal(research.experimentMergeAuthorized,false);
});
