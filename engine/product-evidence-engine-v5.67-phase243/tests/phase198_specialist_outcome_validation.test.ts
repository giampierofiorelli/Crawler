import test from 'node:test';
import assert from 'node:assert/strict';
import {assessSufficiency197, internationalResearchHints197,
 type EvidenceSufficiencyInput197,type CriterionEvidence197,type RegionalSearchTarget197}
 from '../src/phase197_evidence_sufficiency.js';
import {demandScopeHash,type PortfolioAudit} from '../src/phase77_decision_research.js';
import type {ReviewedSearchAudit} from '../src/phase78_search_adequacy.js';
import type {SearchContinuationAudit} from '../src/phase79_adaptive_search_decision.js';
import type {EvidenceLandscape191,ProductFinding191} from '../src/phase191_sparse_source_integrity.js';
import type {ResearchPlan182} from '../src/phase182_gap_research_orchestrator.js';
import type {SourceMatrix196} from '../src/phase196_source_intelligence.js';
const demand={mode:'specific_product' as const,outcomeIds:['cooking_quality'],mustHaveIds:['safe_install'],
 exclusionIds:[],regionId:'uk',productId:'oven_one',confirmedBy:'user' as const};
const hash=demandScopeHash(demand);
function portfolio():PortfolioAudit{return {demand,sourceLandscapeReviewed:true,discoveryReproducible:true,
 searchBoundaryReviewed:true,families:[{familyId:'ovens',disposition:'evaluated',evidenceReferenceIds:['family_review']}],
 candidates:[{productId:'oven_one',familyId:'ovens',reviewedApplicableTo:['cooking_quality','safe_install'],
 reviewedAvoids:[],independentlyTestedOriginalIds:['lab_orig_one'],rightsCleared:true,safetyReviewed:true,
 methodReviewed:true,productVariantReviewed:true}]};}
const baseline=():ReviewedSearchAudit=>({demandScopeHash:hash,boundaryApprovalId:'boundary_check',
 methods:[{channel:'independent_testing',receiptId:'independent_lookup',originId:'research_lab'},
 {channel:'professional_registry',receiptId:'professional_lookup',originId:'industry_registry'}],
 unresolvedAlternativeIds:[],examinedExclusions:[],discoveryInProgress:false});
function continuation():SearchContinuationAudit{return {demandScopeHash:hash,
 candidateFilters:[{productId:'oven_one',verdict:'verified_fit',failingHardConstraintIds:[],
  evidenceIds:['lab_orig_one'],reviewId:'original_reviewer'}],
 openChallengerIds:[],staleEvidenceIds:[],importantEvidenceGapIds:[],
 constraintInterpretationReviewId:'user_constraints',
 decisionStability:{assessment:'unlikely_to_change',reviewId:'sensitivity_reviewer'},
 challenge:{id:'independent_probe',originId:'another_lab',channel:'industry_directory',
 reviewId:'challenge_reviewer',evidenceIds:['challenge_receipt'],
 result:'no_new_plausible_candidates',plausibleCandidateIds:[]}};}
function finding(field:string,rec:string,state:ProductFinding191['knowledgeState']='reported_original_test_unadmitted'):ProductFinding191{
 return {variantId:'oven_one',name:'Oven One',category:'ovens',field,knowledgeState:state,
 visibility:'retained_with_evidence',sourceCoverage:'single_original_root',rootCount:1,
 originalRecordIds:[rec],otherRecordIds:[],sourceUrl:['https://lab.example.com/oven-one'],
 commercialSignals:[],limitations:[],researchActions:[],thresholdFinding:'not_applicable',
 rankingPermitted:false,absenceMeansPoorPerformance:false,sourceNatureNotProofOfTruth:true};}
function landscape():EvidenceLandscape191{return {phase:191,schema:'191.1',state:'research_only',market:'UK',
 findings:[finding('cooking_quality','record_cook'),finding('safe_install','record_safe')],
 knownCandidates:1,uncoveredCandidateIds:[],sourceReviewIsNotProofOfScientificValidity:true,publicRankingAllowed:false};}
const ev=(criterionId:string,record:string,group:string):CriterionEvidence197=>({criterionId,
 sourceRecordId:record,protocolId:'standard_v1',conditionId:'normal_use',role:'independent_instrumental',finding:'supports',originalEventGroupId:group,
 lineageReviewId:'lineage_review',methodReviewId:'method_review',scopeReviewId:'scope_review'});
function input():EvidenceSufficiencyInput197{return {portfolio:portfolio(),baseline:baseline(),
 continuation:continuation(),landscape:landscape(),productId:'oven_one',variantId:'oven_one',
 category:'ovens',market:'UK',criteria:[
 {criterionId:'cooking_quality',phase191Field:'cooking_quality',protocolId:'standard_v1',conditionId:'normal_use',critical:true,domain:'technical_performance'},
 {criterionId:'safe_install',phase191Field:'safe_install',protocolId:'standard_v1',conditionId:'normal_use',critical:true,domain:'safety_or_compatibility'}],
 evidence:[ev('cooking_quality','record_cook','original_lab_one'),ev('safe_install','record_safe','original_lab_two')],
 passes:[{passId:'native_lab_pass',channel:'independent_testing',originId:'lab_one',language:'en-GB',
 market:'UK',status:'completed_no_new_evidence',reviewId:'search_reviewer',foundSourceIds:[]}],
 regionalTargets:[],expertise:[],operations:{status:'active',reviewerId:null,reasonId:null}};}

import {assessSpecialistOutcome198,specialistJobHints198,type SpecialistInput198,type OutcomeNeed198,
 type PracticalOutcome198,type Recognition198,type Specialist198} from '../src/phase198_specialist_outcome_validation.js';

const req=(need:'essential_for_goal'|'optional_corroboration'='essential_for_goal'):OutcomeNeed198=>({
 criterionId:'cooking_quality',disciplineId:'pizza_napoletana',outcomeId:'correct_baked_pizza',need,
 userGoalReviewId:'goal_interpretation',scopeJustificationId:'task_specificity'});
const specialist=(changes:Partial<Specialist198>={}):Specialist198=>({
 specialistId:'pizza_specialist',disciplineIds:['pizza_napoletana'],outcomeIds:['correct_baked_pizza'],
 evidenceBasis:'documented_professional_practice',credentialOrPracticeUrl:'https://training.example.org/credential',
 competenceReviewId:'credential_review',...changes});
const pTest=(changes:Partial<PracticalOutcome198>={}):PracticalOutcome198=>({
 observationId:'professional_pizza_outcome',criterionId:'cooking_quality',sourceRecordId:'record_cook',
 specialistId:'pizza_specialist',disciplineId:'pizza_napoletana',outcomeId:'correct_baked_pizza',
 protocolId:'standard_v1',conditionId:'normal_use',testMode:'structured_professional_use',
 assessment:'supports',operatorParticipationReviewed:true,testMethodReviewId:'actual_dough_protocol',
 reviewedSourceUrl:'https://chef.example.org/pizza-review',commercialRelationship:'none_disclosed',
 conflictReviewId:'disclosures_checked',...changes});
const scheme=(changes:Partial<Recognition198>={}):Recognition198=>({
 recognitionId:'oven_scheme_entry',criterionId:'cooking_quality',sourceRecordId:'record_cook',
 kind:'discipline_scheme_approval',disciplineId:'pizza_napoletana',outcomeId:'correct_baked_pizza',
 variantId:'oven_one',issuerId:'specialist_association',programmeId:'pizza_conformance',
 programmeVersionId:'pizza_rules_v2',registryUrl:'https://registry.example.org/ovens',
 registryReviewId:'registry_human_review',outcomeScopeReviewId:'pizza_scope_checked',
 testMethodReviewId:'programme_method_checked',entryStatus:'active',recordedFrom:'2026-01-01',
 validThrough:'2027-01-01',documentedConflicts:'relationship_disclosed',...changes});
function args():SpecialistInput198{return {phase197:input(),needs:[req()],
 specialists:[specialist()],practicalTests:[],recognitions:[],asOf:'2026-10-13'};}
function withPractical():SpecialistInput198{const a=args();a.phase197.evidence[0].role='structured_professional_observation';
 a.practicalTests=[pTest()];return a;}
function withScheme():SpecialistInput198{const a=args();a.phase197.evidence[0].role='official_programme_field';
 a.recognitions=[scheme()];return a;}
const assess=(a:SpecialistInput198)=>assessSpecialistOutcome198(a);

test('198 essential outcome missing prevents declaring bounded sufficiency even after technical success',()=>{
 const r=assess(args());assert.equal(r.base197.search197,'sufficient_bounded');
 assert.equal(r.specialistSearch198,'continue');assert.deepEqual(r.unmetEssentialOutcomeIds,['cooking_quality']);
 assert.equal(r.rankingsUnchanged,true);assert.equal(r.nationalityBasedAuthority,false);
});
test('198 optional missing outcome does not create a universal research mandate',()=>{
 const a=args();a.needs=[req('optional_corroboration')];const r=assess(a);
 assert.equal(r.specialistSearch198,'sufficient_bounded');
 assert.equal(r.outcomeNeeds[0].status,'no_qualified_support');
 assert(r.specialistResearchHints.includes('optional_specialist_corroboration:cooking_quality'));
});
test('198 no outcome needs means Phase197 exactly preserved and no phantom certificate',()=>{
 const a=args();a.needs=[];const r=assess(a);
 assert.equal(r.specialistSearch198,r.base197.search197);assert.deepEqual(r.outcomeNeeds,[]);
});
test('198 a qualified practical result supplies scoped specialist review without authenticating provenance',()=>{
 const r=assess(withPractical());assert.equal(r.specialistSearch198,'sufficient_bounded');
 assert.equal(r.outcomeNeeds[0].status,'qualified_support_reviewed_unadmitted');
 assert.equal(r.independentOriginAuthentication,false);
 assert.equal(r.outcomeNeeds[0].externalCredentialsIndependentlyAuthenticated,false);
});
test('198 a structured professional observation is not independently counted twice if same original test event',()=>{
 const a=withPractical();a.phase197.evidence[1].originalEventGroupId='original_lab_one';
 const r=assess(a);assert.deepEqual(r.outcomeNeeds[0].additionalDistinctEventGroupsVsInstrumental,['original_lab_one']);
 // Safety test is not another test on the cooking-criterion, therefore it cannot be used to infer cooking corroboration.
});
test('198 technical and professional observations describing the SAME experiment count as one event',()=>{
 const a=withPractical();a.phase197.landscape.findings[0].originalRecordIds=['record_cook','technical_same_event'];
 a.phase197.evidence=[...a.phase197.evidence,{...ev('cooking_quality','technical_same_event','original_lab_one')}];
 const r=assess(a);assert.deepEqual(r.outcomeNeeds[0].qualifiedSupportEventGroups,['original_lab_one']);
 assert.deepEqual(r.outcomeNeeds[0].additionalDistinctEventGroupsVsInstrumental,[]);
});
test('198 different reviewed original groups can add corroboration compared with instrumental lab',()=>{
 const a=withPractical();a.phase197.landscape.findings[0].originalRecordIds=['record_cook','technical_other'];
 a.phase197.evidence=[...a.phase197.evidence,{...ev('cooking_quality','technical_other','separate_instrumental')}];
 assert.deepEqual(assess(a).outcomeNeeds[0].additionalDistinctEventGroupsVsInstrumental,['original_lab_one']);
});
test('198 a non Italian with documented pizza expertise is eligible (no passport scoring)',()=>{
 const a=withPractical();a.specialists=[specialist({specialistId:'pizza_specialist'})];
 assert.equal(assess(a).outcomeNeeds[0].status,'qualified_support_reviewed_unadmitted');
});
test('198 being Italian without relevant practice is no validated competence',()=>{
 const a=withPractical();a.specialists=[specialist({evidenceBasis:'unverified'})];
 assert.equal(assess(a).specialistSearch198,'continue');
});
test('198 expertise in another tradition cannot validate pizza',()=>{
 const a=withPractical();a.specialists=[specialist({disciplineIds:['sushi']})];
 assert.equal(assess(a).specialistSearch198,'continue');
});
test('198 documented professional unable to evaluate specific OUTCOME is not sufficient',()=>{
 const a=withPractical();a.specialists=[specialist({outcomeIds:['dough_storage']})];
 assert.equal(assess(a).outcomeNeeds[0].status,'unverified_only');
});
test('198 a credential claim without reviewer is not professional qualification',()=>{
 const a=withPractical();a.specialists=[specialist({evidenceBasis:'declared_expertise_only',competenceReviewId:null})];
 assert.equal(assess(a).specialistSearch198,'continue');
});
test('198 a panel with reviewed specific sensory competence can validate the precise outcome',()=>{
 const a=withPractical();a.specialists=[specialist({evidenceBasis:'evaluated_sensory_panel'})];
 a.practicalTests=[pTest({testMode:'controlled_sensory_panel'})];
 assert.equal(assess(a).specialistSearch198,'sufficient_bounded');
});
test('198 an informal tasting comment is never a controlled specialist assessment',()=>{
 const a=withPractical();a.practicalTests=[pTest({testMode:'informal_opinion'})];
 assert.equal(assess(a).specialistSearch198,'continue');
});
test('198 test reviewed without participation confirmation cannot be credited',()=>{
 const a=withPractical();a.practicalTests=[pTest({operatorParticipationReviewed:false})];
 assert.equal(assess(a).specialistSearch198,'continue');
});
test('198 no controlled method review means no specialist support',()=>{
 const a=withPractical();a.practicalTests=[pTest({testMethodReviewId:null})];
 assert.equal(assess(a).outcomeNeeds[0].status,'unverified_only');
});
test('198 undisclosed conflict status blocks outcome confirmation, disclosed relationships do not auto-blacklist',()=>{
 const a=withPractical();a.practicalTests=[pTest({commercialRelationship:'unknown'})];
 assert.equal(assess(a).specialistSearch198,'continue');
 a.practicalTests=[pTest({commercialRelationship:'disclosed'})];
 assert.equal(assess(a).specialistSearch198,'sufficient_bounded');
});
test('198 missing conflict review prevents authentication of the method even when no conflicts are declared',()=>{
 const a=withPractical();a.practicalTests=[pTest({conflictReviewId:null})];
 assert.equal(assess(a).specialistSearch198,'continue');
});
test('198 matching exact variant and active scoped programme is an additional reviewed programme signal',()=>{
 const r=assess(withScheme());assert.equal(r.specialistSearch198,'sufficient_bounded');
 assert.deepEqual(r.outcomeNeeds[0].recognisedProgrammeIds,['pizza_conformance']);
 assert.equal(r.evidenceRows[0].classification,'scoped_programme_support');
});
test('198 certification wording does not prove a registered certificate',()=>{
 const a=withScheme();a.recognitions=[scheme({registryReviewId:null})];
 assert.equal(assess(a).specialistSearch198,'continue');
});
test('198 purported programme without a reviewed outcome method is not enough',()=>{
 const a=withScheme();a.recognitions=[scheme({testMethodReviewId:null})];
 assert.equal(assess(a).specialistSearch198,'continue');
});
test('198 programme whose public scope has not been reviewed is not enough',()=>{
 const a=withScheme();a.recognitions=[scheme({outcomeScopeReviewId:null})];
 assert.equal(assess(a).specialistSearch198,'continue');
});
test('198 an expired programme entry is not current',()=>{
 const a=withScheme();a.recognitions=[scheme({validThrough:'2025-12-31'})];
 assert.equal(assess(a).specialistSearch198,'continue');
});
test('198 future-dated programme decision cannot support an earlier query',()=>{
 const a=withScheme();a.recognitions=[scheme({recordedFrom:'2027-01-01'})];
 assert.equal(assess(a).specialistSearch198,'continue');
});
test('198 withdrawn or suspended or unknown certificate does not cover the need',()=>{
 for(const entryStatus of ['withdrawn','suspended','expired','unknown'] as const){
  const a=withScheme();a.recognitions=[scheme({entryStatus})];
  assert.equal(assess(a).specialistSearch198,'continue');}
});
test('198 sponsorship or supplier listing cannot become a product validation',()=>{
 for(const kind of ['sponsorship_or_supplier','professional_endorsement','person_credential'] as const){
  const a=withScheme();a.recognitions=[scheme({kind})];
  const r=assess(a);assert.equal(r.specialistSearch198,'continue');
  assert.equal(r.evidenceRows[0].classification,'personal_or_commercial_claim');}
});
test('198 coffee FILTER certification does not attest ITALIAN ESPRESSO',()=>{
 const a=withScheme();a.needs=[{...req(),disciplineId:'italian_espresso',outcomeId:'espresso_quality'}];
 a.recognitions=[scheme({disciplineId:'coffee_filter',outcomeId:'filter_brew_quality'})];
 assert.throws(()=>assess(a),/phase198_recognition_scope/);
});
test('198 wrong product variant certification rejected without fallback to brand',()=>{
 const a=withScheme();a.recognitions=[scheme({variantId:'oven_two'})];
 assert.throws(()=>assess(a),/phase198_recognition_scope/);
});
test('198 newer protocol vs stored Phase197 protocol cannot support an older claim',()=>{
 const a=withPractical();a.practicalTests=[pTest({protocolId:'standard_v2'})];
 assert.throws(()=>assess(a),/phase198_method_or_finding_mismatch/);
});
test('198 test for incorrect environmental/test condition rejected',()=>{
 const a=withPractical();a.practicalTests=[pTest({conditionId:'large_batch'})];
 assert.throws(()=>assess(a),/phase198_method_or_finding_mismatch/);
});
test('198 contradictory submitted opinion versus Phase197 reviewed finding rejected',()=>{
 const a=withPractical();a.practicalTests=[pTest({assessment:'contradicts'})];
 assert.throws(()=>assess(a),/phase198_method_or_finding_mismatch/);
});
test('198 professional original source has to exist in Phase191 scoped records',()=>{
 const a=withPractical();a.practicalTests=[pTest({sourceRecordId:'forged_professional_claim'})];
 assert.throws(()=>assess(a),/phase198_unknown_record/);
});
test('198 professional source role cannot be converted from instrumental to outcome test',()=>{
 const a=args();a.practicalTests=[pTest()];
 assert.equal(assess(a).specialistSearch198,'continue');
});
test('198 programme registry field cannot masquerade as independently tested professional outcome',()=>{
 const a=withScheme();a.practicalTests=[pTest()];
 assert.equal(assess(a).specialistSearch198,'sufficient_bounded');
 assert.equal(assess(a).evidenceRows.find(r=>r.kind==='professional_outcome_test')!.classification,'unqualified_or_unreviewed');
});
test('198 professional test cannot masquerade as programme recognition',()=>{
 const a=withPractical();a.recognitions=[scheme()];
 assert.equal(assess(a).evidenceRows.find(r=>r.kind==='product_recognition')!.classification,'unqualified_or_unreviewed');
});
test('198 qualified specialist contradiction overrides an otherwise technically sufficient search',()=>{
 const a=withPractical();a.phase197.evidence[0].finding='contradicts';
 a.practicalTests=[pTest({assessment:'contradicts'})];
 const r=assess(a);assert.equal(r.specialistSearch198,'continue');
 assert.deepEqual(r.outcomeContradictionIds,['cooking_quality']);
 assert.deepEqual(r.outcomeNeeds[0].qualifiedChallengeRecords,['record_cook']);
});
test('198 qualified programme contradiction triggers further investigation',()=>{
 const a=withScheme();a.phase197.evidence[0].finding='contradicts';
 const r=assess(a);assert.equal(r.specialistSearch198,'continue');
 assert.deepEqual(r.outcomeContradictionIds,['cooking_quality']);
});
test('198 research exhaustion with missing essential outcome is insufficiency, not poor product performance',()=>{
 const a=args();a.phase197.operations={status:'no_further_accessible_sources',reviewerId:'operator_one',reasonId:'all_lawful_paths'};
 const r=assess(a);assert.equal(r.specialistSearch198,'exhausted_insufficient');
 assert.equal(r.base197.stopIsNotNegativeQualityAssessment,true);
});
test('198 budget defer remains budget defer even with specialist need unmet',()=>{
 const a=args();a.phase197.operations={status:'budget_deferred',reviewerId:'reviewer',reasonId:'bounded_resources'};
 assert.equal(assess(a).specialistSearch198,'deferred_by_budget');
});
test('198 no specialist evidence may ever upgrade a Phase197 provisional search',()=>{
 const a=withPractical();a.phase197.baseline={...a.phase197.baseline,boundaryApprovalId:null};
 a.phase197.operations={status:'no_further_accessible_sources',reviewerId:'reviewer',reasonId:'sources_exhausted'};
 const r=assess(a);assert.equal(r.base197.search197,'provisional');
 assert.equal(r.specialistSearch198,'provisional');
});
test('198 non-essential endorsement does not affect sufficiency',()=>{
 const a=withScheme();a.needs=[req('optional_corroboration')];
 a.recognitions=[scheme({kind:'professional_endorsement'})];
 assert.equal(assess(a).specialistSearch198,'sufficient_bounded');
});
test('198 no full review text or secrets are stored in output',()=>{
 const a=withPractical();const r=assess(a);const serialized=JSON.stringify(r);
 assert(!serialized.includes('reviewedSourceUrl'));assert(!serialized.includes('credentialOrPracticeUrl'));
 assert.equal(r.fullReviewTextStored,false);
});
test('198 reversed input order yields same reviewed event groups and same outcome status',()=>{
 const a=withPractical();a.phase197.landscape.findings[0].originalRecordIds=['record_cook','another_record'];
 a.phase197.evidence=[...a.phase197.evidence,{...ev('cooking_quality','another_record','original_lab_one'),role:'structured_professional_observation'}];
 a.practicalTests=[pTest(),pTest({observationId:'other_observation',sourceRecordId:'another_record'})];
 const b=structuredClone(a);b.practicalTests=[...b.practicalTests].reverse();
 const x=assess(a),y=assess(b);assert.deepEqual(x.outcomeNeeds,y.outcomeNeeds);
 assert.deepEqual(x.evidenceRows,y.evidenceRows);
});
test('198 malicious duplicate recognition ID is rejected',()=>{
 const a=withScheme();a.recognitions=[scheme(),scheme()];
 assert.throws(()=>assess(a),/phase198_duplicate_identity/);
});
test('198 duplicate criterion requirements are rejected rather than overriding user intent',()=>{
 const a=args();a.needs=[req(),req('optional_corroboration')];
 assert.throws(()=>assess(a),/phase198_duplicate_identity/);
});
test('198 safety criterion cannot be reframed as optional specialist tradition',()=>{
 const a=args();a.needs=[{...req(),criterionId:'safe_install'}];
 assert.throws(()=>assess(a),/phase198_need_scope/);
});
test('198 result is bounded to an explicit, reviewed user goal not automatically generated by category',()=>{
 const a=args();a.needs=[{...req(),userGoalReviewId:''}];
 assert.throws(()=>assess(a),/phase198_need_scope/);
});
test('198 invalid registry URL blocked',()=>{
 const a=withScheme();a.recognitions=[scheme({registryUrl:'http://registry.example.org/ovens'})];
 assert.throws(()=>assess(a),/phase198_recognition_scope/);
});
test('198 invalid date representation blocked rather than lexically used for expiry',()=>{
 const a=withScheme();a.recognitions=[scheme({validThrough:'2026-02-31'})];
 assert.throws(()=>assess(a),/phase198_recognition_scope/);
});
test('198 unknown specialist identity cannot be silently interpreted from domain expertise',()=>{
 const a=withPractical();a.practicalTests=[pTest({specialistId:'unfamiliar_unknown'})];
 assert.throws(()=>assess(a),/phase198_practical_scope/);
});
test('198 source review lineages remain only annotations, not proof of independent lab work',()=>{
 const r=assess(withPractical());
 assert(r.evidenceRows.every(x=>x.notAnAuthenticatedOriginalTest));
 assert.equal(r.base197.evidenceProvenanceAuthenticated,false);
});

test('198 structured sensory panel claim requires documented panel competence rather than chef reputation alone',()=>{
 const a=withPractical();a.practicalTests=[pTest({testMode:'controlled_sensory_panel'})];
 assert.equal(assess(a).specialistSearch198,'continue');
 a.specialists=[specialist({evidenceBasis:'evaluated_sensory_panel'})];
 assert.equal(assess(a).specialistSearch198,'sufficient_bounded');
});
function fakeJobBridge198(){
 const plan={phase:182,schema:'182.1',planningOnly:true,rankingAuthorized:false,categoryId:'ovens',
 jobs:[{jobId:'real_job',kind:'exact_variant_source_research',exactVariantId:'oven_one',
 categoryId:'ovens',criterionId:'cooking_quality'},{jobId:'wrong_category',kind:'exact_variant_source_research',
 exactVariantId:'oven_one',categoryId:'coffeemakers',criterionId:'cooking_quality'},
 {jobId:'wrong_variant',kind:'exact_variant_source_research',exactVariantId:'oven_two',
 categoryId:'ovens',criterionId:'cooking_quality'}]} as unknown as ResearchPlan182;
 const matrix={schema:'196.1',state:'research_only',publicRankingAllowed:false,
 reviewQueue:[{sourceId:'specialist_small'},{sourceId:'known_editor'},{sourceId:'wrong_category'}],
 rows:[{sourceId:'specialist_small',category:'ovens',variantId:'oven_one',field:'cooking_quality'},
 {sourceId:'known_editor',category:'ovens',variantId:'oven_one',field:'cooking_quality'},
 {sourceId:'wrong_category',category:'knives',variantId:'oven_one',field:'cooking_quality'}]} as unknown as SourceMatrix196;
 return {plan,matrix,category:'ovens'};
}
test('198 specialist hints reuse existing Phase182 jobs and all relevant Phase196 sources including unknown',()=>{
 const x=fakeJobBridge198(),r=specialistJobHints198({...x,decision:assess(args())});
 assert.deepEqual(r,[{jobId:'real_job',criterionId:'cooking_quality',
 sourceIds:['known_editor','specialist_small'],unmetEssential:true,
 usesExistingJob:true,executeAutomatically:false}]);
});
test('198 no research job exists: no phantom work authorization is created',()=>{
 const x=fakeJobBridge198();(x.plan as unknown as {jobs:unknown[]}).jobs=[];
 assert.deepEqual(specialistJobHints198({...x,decision:assess(args())}),[]);
});
test('198 specialist bridge cannot change source queue or plan',()=>{
 const x=fakeJobBridge198(),before=JSON.stringify(x);
 specialistJobHints198({...x,decision:assess(args())});
 assert.equal(JSON.stringify(x),before);
});
test('198 specialist bridge rejects cross-category injection',()=>{
 const x=fakeJobBridge198();x.category='knives';
 assert.throws(()=>specialistJobHints198({...x,decision:assess(args())}),/phase198_bridge/);
});
test('198 specialist bridge rejects publication authority',()=>{
 const x=fakeJobBridge198();(x.matrix as unknown as {publicRankingAllowed:boolean}).publicRankingAllowed=true;
 assert.throws(()=>specialistJobHints198({...x,decision:assess(args())}),/phase198_bridge/);
});
test('198 valid specialist result does not falsely claim confirmation of safety or manufacturer compatibility',()=>{
 const r=assess(withPractical());
 assert.deepEqual(r.outcomeNeeds.map(x=>x.criterionId),['cooking_quality']);
 assert.equal(r.base197.criteriaCoverage.find(x=>x.criterionId==='safe_install')?.domain,'safety_or_compatibility');
});
test('198 known source research hints correctly map criterionId to different Phase191 field',()=>{
 const a=args();a.phase197.criteria=[{...a.phase197.criteria[0],phase191Field:'baking_result'},a.phase197.criteria[1]];
 a.phase197.landscape.findings[0].field='baking_result';
 const x=fakeJobBridge198();(x.matrix as unknown as {rows:{sourceId:string;category:string;variantId:string;field:string}[]}).rows[0].field='baking_result';
 const decision=assess(a),r=specialistJobHints198({...x,decision});
 assert.deepEqual(r[0].sourceIds,['specialist_small']);
});
