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


import {buildSpecialistTrustPresentation199,renderSpecialistTrustSection199,fingerprintTrustPresentation199,type PublicationDossier199,type TrustPresentationRequest199} from '../src/phase199_specialist_trust_presentation.js';

const reviewer=(id:string)=>({reviewerId:id,sourceCustodyReviewId:id+'_custody',
 variantAndOutcomeReviewId:id+'_variant',originalTestOrSchemeReviewId:id+'_scheme',
 commercialDisclosureReviewId:id+'_disclosure'});
const digest='a'.repeat(64);
const dossier=(changes:Partial<PublicationDossier199>={}):PublicationDossier199=>({
 evidenceId:'oven_scheme_entry',sourceRecordId:'record_cook',criterionId:'cooking_quality',
 variantId:'oven_one',disciplineId:'pizza_napoletana',outcomeId:'correct_baked_pizza',
 sourceUrl:'https://registry.example.org/ovens',publisherDocumentSha256:digest,
 documentVersionId:'publisher_v1',creditedAgentDisplayName:'Illustrative specialist programme',digestBasis:'complete_publisher_document',
 publisherOrigin:'confirmed_original_publisher',evaluatedAt:'2026-10-12',
 reviewers:[reviewer('human_one'),reviewer('human_two')],authorizationToUseSchemeMark:false,...changes});
const presentation=(a:SpecialistInput198=withScheme(),ds:PublicationDossier199[]=[dossier()])=>
 buildSpecialistTrustPresentation199({specialistInput:a,dossiers:ds,
 labels:[{criterionId:'cooking_quality',disciplineId:'pizza_napoletana',
 outcomeId:'correct_baked_pizza',plainOutcomeName:'Neapolitan pizza baking'}]});

test('199 ordinary reviewed phase198 record alone NEVER creates a trust claim',()=>{
 const v=presentation(withScheme(),[]);
 assert.equal(v.cards.length,0);assert.equal(v.held[0].reason,'unverified_primary_source');
 assert.deepEqual(v.unmetEssentialCriteria,['cooking_quality']);
 assert.equal(v.overallProductSuitabilityCertified,false);
});
test('199 two human publisher custody reviews enable narrowly described programme disclosure',()=>{
 const v=presentation();assert.equal(v.cards.length,1);
 assert.equal(v.cards[0].title,'Specialist programme approval documented');
 assert.equal(v.cards[0].commercialDisclosure,'relationship_disclosed');
 assert.equal(v.cards[0].sourceVersionId,'publisher_v1');
 assert.equal(v.resultStatus,'documented_additional_specialist_evidence');
 assert.equal(v.sourceTruthVerifiedByRuntime,false);
 assert.equal(v.programmeMarksUsed,false);assert.equal(v.noNewProductRanking,true);
 assert(!renderSpecialistTrustSection199(v).includes('<img'));
});
test('199 preview wording never claims original PEE laboratory certification',()=>{
 const html=renderSpecialistTrustSection199(presentation());
 assert.match(html,/not a PEE certification/);
 assert.match(html,/<details><summary>Why this evidence matters<\/summary>/);
 assert.match(html,/rel="noopener noreferrer"/);
 assert.doesNotMatch(html,/<script|badge.*certified/i);
});
test('199 a formal product certificate is distinguished from a programme approval',()=>{
 const a=withScheme();a.recognitions=[scheme({kind:'formal_product_certification'})];
 const v=presentation(a);assert.equal(v.cards[0].kind,'product_certification');
 assert.equal(v.cards[0].title,'Product certification documented');
});
test('199 a reviewed expert outcome test has a different label and needs original publisher custody',()=>{
 const a=withPractical();const d=dossier({evidenceId:'professional_pizza_outcome',
  sourceUrl:'https://chef.example.org/pizza-review'});
 const v=presentation(a,[d]);assert.equal(v.cards.length,1);
 assert.equal(v.cards[0].title,'Specialist practical test documented');
 assert.equal(v.cards[0].issuerName,'Illustrative specialist programme');
});
test('199 does not equate a person credential with a certified product',()=>{
 const a=withScheme();a.recognitions=[scheme({kind:'person_credential'})];
 const v=presentation(a);assert.equal(v.cards.length,0);
 assert.equal(v.held[0].reason,'unreviewed_or_unqualified');
});
test('199 affiliate endorsement never becomes certification',()=>{
 const a=withScheme();a.recognitions=[scheme({kind:'professional_endorsement'})];
 assert.equal(presentation(a).cards.length,0);
});
test('199 out-of-scope issuer variant is rejected upstream even with full dossier',()=>{
 const a=withScheme();a.recognitions=[scheme({variantId:'oven_two'})];
 assert.throws(()=>presentation(a),/phase198_recognition_scope/);
});
test('199 approval does not override expired, withdrawn or suspended registry status',()=>{
 for(const entryStatus of ['expired','withdrawn','suspended','unknown'] as const){
  const a=withScheme();a.recognitions=[scheme({entryStatus})];
  assert.equal(presentation(a).cards.length,0);}
});
test('199 excerpt hash cannot impersonate authenticated complete publisher document',()=>{
 const v=presentation(withScheme(),[dossier({digestBasis:'excerpt_or_annotation'})]);
 assert.equal(v.cards.length,0);assert.equal(v.held[0].reason,'source_digest_not_complete');
});
test('199 original publisher authenticity must be separately confirmed',()=>{
 const v=presentation(withScheme(),[dossier({publisherOrigin:'unconfirmed'})]);
 assert.equal(v.cards.length,0);assert.equal(v.held[0].reason,'unverified_primary_source');
});
test('199 a single reviewer is insufficient',()=>{
 const v=presentation(withScheme(),[dossier({reviewers:[reviewer('human_one')]})]);
 assert.equal(v.cards.length,0);assert.equal(v.held[0].reason,'reviewer_scope_missing');
});
test('199 cannot satisfy independent reviews with duplicated reviewer identity',()=>{
 assert.throws(()=>presentation(withScheme(),[dossier({reviewers:[reviewer('one'),reviewer('one')]})]),
  /phase199_dossier_shape/);
});
test('199 cannot accept missing scope attestations',()=>{
 const rev=reviewer('two');rev.variantAndOutcomeReviewId='';
 assert.throws(()=>presentation(withScheme(),[dossier({reviewers:[reviewer('one'),rev]})]),
  /phase199_dossier_shape/);
});
test('199 cannot represent source custody after asOf date',()=>{
 assert.equal(presentation(withScheme(),[dossier({evaluatedAt:'2026-10-14'})]).cards.length,0);
});
test('199 stale source custody blocks visible trust label',()=>{
 const v=presentation(withScheme(),[dossier({evaluatedAt:'2025-01-01'})]);
 assert.equal(v.cards.length,0);assert.equal(v.held[0].reason,'stale_custody_review');
});
test('199 configurable freshness cap is bounded and version safe',()=>{
 assert.throws(()=>buildSpecialistTrustPresentation199({specialistInput:withScheme(),
  dossiers:[dossier()],labels:[],maximumDaysSinceCustodyReview:100000}),/phase199_review_age_policy/);
 const req:TrustPresentationRequest199={specialistInput:withScheme(),dossiers:[dossier({evaluatedAt:'2026-10-10'})],
 labels:[{criterionId:'cooking_quality',disciplineId:'pizza_napoletana',outcomeId:'correct_baked_pizza',
 plainOutcomeName:'Neapolitan pizza baking'}],maximumDaysSinceCustodyReview:2};
 assert.equal(buildSpecialistTrustPresentation199(req).cards.length,0);
});
test('199 source URL substitution blocks even same sourceRecordId',()=>{
 const v=presentation(withScheme(),[dossier({sourceUrl:'https://another.example.org/ovens'})]);
 assert.equal(v.cards.length,0);assert.equal(v.held[0].reason,'variant_or_protocol_mismatch');
});
test('199 different target outcome cannot use the programme dossier',()=>{
 const v=presentation(withScheme(),[dossier({outcomeId:'filter_brew_quality'})]);
 assert.equal(v.cards.length,0);assert.equal(v.held[0].reason,'variant_or_protocol_mismatch');
});
test('199 incomplete dossier for essential specialty shows explicit gap without downgrading product',()=>{
 const v=presentation(withScheme(),[]);
 const html=renderSpecialistTrustSection199(v);
 assert.match(html,/does not mean the product is poor/);
 assert.match(html,/not sufficiently documented/);
});
test('199 no universal specialist requirement on unrelated product field',()=>{
 const a=args();a.needs=[];
 const v=buildSpecialistTrustPresentation199({specialistInput:a,dossiers:[],labels:[]});
 assert.equal(v.cards.length,0);assert.deepEqual(v.unmetEssentialCriteria,[]);
});
test('199 unknown unrelated expertise is not a badge even if the person is prominent',()=>{
 const a=withPractical();a.specialists=[specialist({disciplineIds:['sushi_preparation']})];
 const d=dossier({evidenceId:'professional_pizza_outcome',sourceUrl:'https://chef.example.org/pizza-review'});
 assert.equal(presentation(a,[d]).cards.length,0);
});
test('199 linked commercial relationship disclosed adjacent to evidence',()=>{
 const html=renderSpecialistTrustSection199(presentation());
 assert.match(html,/A commercial relationship was disclosed/);
});
test('199 clean disclosure is not marketed as independently audited',()=>{
 const a=withScheme();a.recognitions=[scheme({documentedConflicts:'reviewed_no_known_conflict'})];
 const html=renderSpecialistTrustSection199(presentation(a));
 assert.match(html,/not an independence audit/);
});
test('199 unresolved specialist contradiction suppresses optimistic trust card',()=>{
 const a=withScheme();a.phase197.landscape.findings[0].originalRecordIds=['record_cook','challenger'];
 a.phase197.evidence=[...a.phase197.evidence,{...ev('cooking_quality','challenger','another_event'),finding:'contradicts',role:'official_programme_field'}];
 a.recognitions=[...a.recognitions,scheme({recognitionId:'challenge_entry',sourceRecordId:'challenger'})];
 const v=presentation(a);assert.equal(v.cards.length,0);
 assert(v.held.some(x=>x.reason==='contradictory_evidence'));
});
test('199 show specialist evidence without claiming overall goal is validated',()=>{
 const a=withScheme();a.phase197.operations={status:'budget_deferred',reviewerId:'review_one',reasonId:'cost'};
 const v=presentation(a);assert.equal(v.cards.length,1);
 assert.equal(v.overallProductSuitabilityCertified,false);
 assert.equal(v.resultStatus,'documented_additional_specialist_evidence');
});
test('199 optional outcome missing does not create an empty failure label',()=>{
 const a=args();a.needs=[req('optional_corroboration')];
 const v=presentation(a,[]);assert.deepEqual(v.unmetEssentialCriteria,[]);
});
test('199 duplicate publication of same reviewed experiment cannot create another card',()=>{
 const a=withScheme();a.phase197.landscape.findings[0].originalRecordIds=['record_cook','record_same'];
 a.phase197.evidence=[...a.phase197.evidence,{...ev('cooking_quality','record_same','original_lab_one'),role:'official_programme_field'}];
 a.recognitions=[...a.recognitions,scheme({recognitionId:'another_scheme',sourceRecordId:'record_same'})];
 const ds=[dossier(),dossier({evidenceId:'another_scheme',sourceRecordId:'record_same'})];
 const v=presentation(a,ds);assert.equal(v.cards.length,1);
 assert.deepEqual(v.cards[0].evidenceIds,['another_scheme','oven_scheme_entry']);
 assert(v.held.some(x=>x.reason==='duplicate_underlying_event'));
});
test('199 deterministic across reordered sources, attestations and analysts',()=>{
 const a=withScheme();const d=dossier();
 const first=presentation(a,[d]);const second=presentation(a,[{...d,reviewers:[...d.reviewers].reverse()}]);
 assert.deepEqual(first,second);assert.equal(fingerprintTrustPresentation199(first),fingerprintTrustPresentation199(second));
});
test('199 invalid method override cannot forge a positive verdict',()=>{
 const a=withScheme();a.phase197.evidence[0].finding='inconclusive';
 assert.equal(presentation(a).cards.length,0);
});
test('199 html escapes links/text and never renders user supplied HTML',()=>{
 const v=presentation();v.cards[0].outcomeName='<img src=x onerror=alert(1)>';
 const html=renderSpecialistTrustSection199(v);
 assert(!html.includes('<img'));assert(!html.includes(' onmouseover="evil'));
 assert.match(html,/&lt;img/);
});
test('199 invalid label HTML or dangerous javascript link in dossier fails before rendering',()=>{
 assert.throws(()=>buildSpecialistTrustPresentation199({specialistInput:withScheme(),
  dossiers:[dossier()],labels:[{criterionId:'cooking_quality',outcomeId:'correct_baked_pizza',
  disciplineId:'pizza_napoletana',plainOutcomeName:'<script>alert(1)</script>'}]}),/phase199_label_scope/);
 assert.throws(()=>presentation(withScheme(),[dossier({sourceUrl:'javascript:alert(1)'})]),/phase199_dossier_shape/);
});
test('199 invalid documentary digest is rejected',()=>{
 assert.throws(()=>presentation(withScheme(),[dossier({publisherDocumentSha256:'extract_hash'})]),/phase199_dossier_shape/);
});
test('199 permits unknown new professional source after documented original-source review',()=>{
 const a=withPractical();a.specialists=[specialist({specialistId:'new_unknown_expert'})];
 a.practicalTests=[pTest({specialistId:'new_unknown_expert',reviewedSourceUrl:'https://new-source.example.org/review'})];
 const d=dossier({evidenceId:'professional_pizza_outcome',sourceUrl:'https://new-source.example.org/review'});
 assert.equal(presentation(a,[d]).cards.length,1);
});
test('199 no authentic document or review text is persisted into consumer card',()=>{
 const v=presentation();const encoded=JSON.stringify(v);
 assert(!encoded.includes('publisherDocumentSha256'));
 assert(!encoded.includes('complete_publisher_document'));
 assert(!encoded.includes(digest));
});
test('199 negative qualified finding cannot become reassurance even if a human dossier exists',()=>{
 const a=withPractical();a.phase197.evidence[0].finding='contradicts';
 a.practicalTests=[pTest({assessment:'contradicts'})];
 const d=dossier({evidenceId:'professional_pizza_outcome',sourceUrl:'https://chef.example.org/pizza-review'});
 assert.equal(presentation(a,[d]).cards.length,0);
});

test('199 renderer refuses a forged certified badge, unsafe URL or unauthorized logo',()=>{
 const v=presentation();v.cards[0].title='Certified #1 by PEE';
 assert.throws(()=>renderSpecialistTrustSection199(v),/phase199_untrusted_render_card/);
 const v2=presentation();v2.cards[0].sourceUrl='javascript:alert(1)';
 assert.throws(()=>renderSpecialistTrustSection199(v2),/phase199_untrusted_render_card/);
 const v3=presentation();(v3.cards[0] as any).logoOrThirdPartyMarkIncluded=true;
 assert.throws(()=>renderSpecialistTrustSection199(v3),/phase199_untrusted_render_card/);
});
test('199 public trust cannot be granted by an unreviewed paid scheme',()=>{
 const a=withScheme();a.recognitions=[scheme({documentedConflicts:'not_reviewed'})];
 assert.equal(presentation(a).cards.length,0);
});
test('199 proposed trust cannot hide a contradictory technical result',()=>{
 const a=withScheme();a.phase197.landscape.findings[0].originalRecordIds=['record_cook','contra_record'];
 a.phase197.evidence=[...a.phase197.evidence,{...ev('cooking_quality','contra_record','contra_group'),finding:'contradicts'}];
 const p=presentation(a);
 assert.equal(p.cards.length,0);assert(p.held.some(x=>x.reason==='contradictory_evidence'));
});
