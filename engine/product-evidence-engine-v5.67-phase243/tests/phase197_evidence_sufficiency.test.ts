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
const it:RegionalSearchTarget197={targetId:'italian_kitchen',criterionId:'cooking_quality',
 language:'it-IT',market:'IT',rationale:'cultural_protocol',required:true,reviewId:'context_approved'};
const get=(a:EvidenceSufficiencyInput197)=>assessSufficiency197(a);
test('197 bounded demand and scoped evidence proposes bounded research, not public ranking',()=>{
 const r=get(input());assert.equal(r.search197,'sufficient_bounded');
 assert.equal(r.priorSearch79,'bounded_single_option');assert.equal(r.rankingAuthorized,false);
 assert.equal(r.evidenceProvenanceAuthenticated,false);assert.equal(r.exactTestEventIdentityAuthenticated,false);
 assert.equal(r.independenceOfRegionalReportsNotAssumed,true);
});
test('197 removal of safety measurement prevents sufficiency regardless of review count',()=>{
 const a=input();a.evidence=a.evidence.slice(0,1);
 const r=get(a);assert.equal(r.search197,'continue');assert.deepEqual(r.missingCriticalIds,['safe_install']);
});
test('197 true reviewed exhaustion with missing safety means insufficient NOT defective product',()=>{
 const a=input();a.evidence=a.evidence.slice(0,1);
 a.operations={status:'no_further_accessible_sources',reviewerId:'operator_one',reasonId:'sources_checked'};
 const r=get(a);assert.equal(r.search197,'exhausted_insufficient');
 assert.equal(r.stopIsNotNegativeQualityAssessment,true);assert.equal(r.fullReviewTextStored,false);
});
test('197 source exhaustion with Phase79 discovery not complete, but reviewed narrow data => provisional',()=>{
 const a=input();a.baseline={...a.baseline,boundaryApprovalId:null};
 a.operations={status:'no_further_accessible_sources',reviewerId:'operator_one',reasonId:'sources_checked'};
 assert.equal(get(a).search197,'provisional');
});
test('197 work budget deferred never means research sufficient',()=>{
 const a=input();a.operations={status:'budget_deferred',reviewerId:'operator_one',reasonId:'license_cost'};
 assert.equal(get(a).search197,'deferred_by_budget');
});
test('197 recent decision-changing gap reopens research even if the current evidence meets criteria',()=>{
 const a=input();a.continuation.importantEvidenceGapIds=['new_test_conflict'];
 assert.equal(get(a).search197,'continue');
});
test('197 operational exhaustion after new decision-changing gap => provisional with caveat',()=>{
 const a=input();a.continuation.importantEvidenceGapIds=['new_test_conflict'];
 a.operations={status:'no_further_accessible_sources',reviewerId:'operator_one',reasonId:'sources_checked'};
 assert.equal(get(a).search197,'provisional');
});
test('197 required Italian search opens research even with complete English sources',()=>{
 const a=input();a.regionalTargets=[it];const r=get(a);
 assert.equal(r.search197,'continue');assert.deepEqual(r.unexploredRequiredTargetIds,['italian_kitchen']);
});
test('197 a real completed Italian research receipt clears targeted exploration condition',()=>{
 const a=input();a.regionalTargets=[it];a.passes=[...a.passes,{passId:'italian_search',channel:'international_search',
  originId:'italian_cook_association',language:'it-IT',market:'IT',
  status:'completed_no_new_evidence',reviewId:'italian_reader',foundSourceIds:[],targetIds:['italian_kitchen']}];
 assert.equal(get(a).search197,'sufficient_bounded');
});
test('197 an English or French search cannot satisfy a requested Italian market/language pair',()=>{
 for(const language of ['en-GB','fr-FR']){const a=input();a.regionalTargets=[it];
 a.passes=[...a.passes,{passId:'wrong_language',channel:'international_search',originId:'italian_catalogue',
 language,market:'IT',status:'completed_no_new_evidence',reviewId:'reader',foundSourceIds:[]}];
 assert.deepEqual(get(a).unexploredRequiredTargetIds,['italian_kitchen']);}
});
test('197 Italian article about different market is not counted as requested product-market exploration',()=>{
 const a=input();a.regionalTargets=[it];a.passes=[...a.passes,{passId:'wrong_market',channel:'international_search',
 originId:'other_lab',language:'it-IT',market:'US',status:'completed_no_new_evidence',reviewId:'reader',foundSourceIds:[]}];
 assert.deepEqual(get(a).unexploredRequiredTargetIds,['italian_kitchen']);
});
test('197 translated/rights-blocked research does not impersonate completed exploration',()=>{
 for(const status of ['blocked_translation','blocked_rights','pending'] as const){
 const a=input();a.regionalTargets=[it];a.passes=[...a.passes,{passId:'foreign_attempt',channel:'international_search',
 originId:'new_searcher',language:'it-IT',market:'IT',status,reviewId:null,foundSourceIds:[]}];
 assert.equal(get(a).search197,'continue');}
});
test('197 repeated same event group is ONE origin group, including across separate documents',()=>{
 const a=input();a.landscape.findings[0].originalRecordIds=['record_cook','rec_translation'];
 a.evidence=[...a.evidence,ev('cooking_quality','rec_translation','original_lab_one')];
 const r=get(a);assert.equal(r.criteriaCoverage.find(x=>x.criterionId==='cooking_quality')!.rootGroupsFromReviewedAnnotations.length,1);
 assert.equal(r.criteriaCoverage.find(x=>x.criterionId==='cooking_quality')!.independentEvidenceRecordCount,2);
});
test('197 different event groups with identical finding direction remain distinct',()=>{
 const a=input();a.landscape.findings[0].originalRecordIds=['record_cook','rec_independent'];
 a.evidence=[...a.evidence,ev('cooking_quality','rec_independent','second_lab')];
 assert.equal(get(a).criteriaCoverage.find(x=>x.criterionId==='cooking_quality')!.rootGroupsFromReviewedAnnotations.length,2);
});
test('197 contradiction forces investigation even with original method and controlled demand',()=>{
 const a=input();a.evidence=[{...a.evidence[0],finding:'contradicts'},a.evidence[1]];
 assert.equal(get(a).search197,'continue');assert.deepEqual(get(a).unresolvedContradictionIds,['cooking_quality']);
});
test('197 inconclusive result is uncertainty but not invented numerical conflict',()=>{
 const a=input();a.evidence=[{...a.evidence[0],finding:'inconclusive'},a.evidence[1]];
 assert.deepEqual(get(a).unresolvedContradictionIds,[]);
});
test('197 research with only manufacturer assertions remains insufficient for critical need',()=>{
 const a=input();a.landscape.findings[0].knowledgeState='manufacturer_specification_provisional';
 a.evidence=[{criterionId:'cooking_quality',sourceRecordId:'record_cook',protocolId:'standard_v1',conditionId:'normal_use',role:'manufacturer_specification',
 finding:'supports',originalEventGroupId:null,lineageReviewId:null,methodReviewId:null,scopeReviewId:null},a.evidence[1]];
 assert.equal(get(a).search197,'continue');assert.deepEqual(get(a).missingCriticalIds,['cooking_quality']);
});
test('197 manufacturer assertions remain available, never credited as original tests',()=>{
 const a=input();a.landscape.findings[0].knowledgeState='manufacturer_specification_provisional';
 a.evidence=[{criterionId:'cooking_quality',sourceRecordId:'record_cook',protocolId:'standard_v1',conditionId:'normal_use',role:'manufacturer_specification',
 finding:'supports',originalEventGroupId:null,lineageReviewId:null,methodReviewId:null,scopeReviewId:null},a.evidence[1]];
 const x=get(a).criteriaCoverage.find(c=>c.criterionId==='cooking_quality')!;
 assert.equal(x.manufacturerProvisionalCount,1);assert.equal(x.rootGroupsFromReviewedAnnotations.length,0);
 assert.equal(x.evidenceForDecision,'provisional_only');
});
test('197 a specialist’s nationality is never a numerical authority input',()=>{
 const a=input();a.criteria[0].domain='cultural_standard_conformance';
 a.evidence[0].role='structured_professional_observation';
 a.landscape.findings[0].knowledgeState='professional_usage_observation_only';
 a.expertise=[{evidenceRecordId:'record_cook',criterionId:'cooking_quality',language:'it-IT',testedMarket:'IT',
 expertise:'documented_professional_practice',competenceScopeReviewId:'scope_review',basisReferenceId:'cook_training'}];
 const italian=get(a);assert.equal(italian.search197,'sufficient_bounded');
 a.expertise[0].language='ja-JP';a.expertise[0].testedMarket='JP';
 assert.deepEqual(get(a).criteriaCoverage,italian.criteriaCoverage);
 assert.equal(get(a).languageOrPassportReputationScoreUsed,false);
});
test('197 heritage/tradition claim by an uncredentialed assessor is not treated as complete',()=>{
 const a=input();a.criteria[0].domain='cultural_standard_conformance';
 a.evidence[0].role='structured_professional_observation';
 a.landscape.findings[0].knowledgeState='professional_usage_observation_only';
 assert.equal(get(a).search197,'continue');
 assert.ok(get(a).reasons.includes('criterion_specific_expertise_not_reviewed'));
});
test('197 safety instrument is not boosted by cultural training',()=>{
 const a=input();a.expertise=[{evidenceRecordId:'record_safe',criterionId:'safe_install',language:'it-IT',
 testedMarket:'IT',expertise:'sensory_training',competenceScopeReviewId:'training',basisReferenceId:'cook_cert'}];
 assert.deepEqual(get(a).criteriaCoverage,input().criteria.map(c=>get(input()).criteriaCoverage.find(x=>x.criterionId===c.criterionId)!));
});
test('197 unknown record in Phase191 findings cannot become new evidence by fiat',()=>{
 const a=input();a.evidence[0].sourceRecordId='fabricated_record';assert.throws(()=>get(a),/phase197_evidence_scope/);
});
test('197 test method version mismatch is rejected',()=>{
 const a=input();a.evidence[0].protocolId='standard_v2';assert.throws(()=>get(a),/phase197_evidence_scope/);
});
test('197 test condition mismatch is rejected',()=>{
 const a=input();a.evidence[0].conditionId='max_load';assert.throws(()=>get(a),/phase197_evidence_scope/);
});
test('197 hidden cross-variant source is rejected',()=>{
 const a=input();a.variantId='oven_two';assert.throws(()=>get(a),/phase197_missing_or_ambiguous_191_field/);
});
test('197 different market than Phase191 researched market is rejected',()=>{
 const a=input();a.market='IT';assert.throws(()=>get(a),/phase197_landscape_scope/);
});
test('197 mismatched demand scope is rejected by existing Phase79',()=>{
 const a=input();a.continuation.demandScopeHash='0'.repeat(64);assert.throws(()=>get(a));
});
test('197 dependent origin cannot claim original root even with lineage review id',()=>{
 const a=input();a.evidence[0].role='derivative_or_unresolved';assert.throws(()=>get(a),/unreviewed_claim_cannot_create_original_root/);
});
test('197 purported independent measurement without lineage review cannot close search',()=>{
 const a=input();a.evidence[0].lineageReviewId=null;assert.throws(()=>get(a),/independence_not_reviewed/);
});
test('197 purported independent measurement without method review cannot close search',()=>{
 const a=input();a.evidence[0].methodReviewId=null;assert.throws(()=>get(a),/independence_not_reviewed/);
});
test('197 commercial material misrepresented as original study fails knowledge-state consistency',()=>{
 const a=input();a.landscape.findings[0].knowledgeState='commercial_promotion_only';
 assert.throws(()=>get(a),/independence_not_reviewed/);
});
test('197 no completed search passes cannot claim exhausted accessible research',()=>{
 const a=input();a.passes=[];a.operations={status:'no_further_accessible_sources',reviewerId:'operator_one',reasonId:'no_studies'};
 assert.throws(()=>get(a),/operations_not_reviewed/);
});
test('197 a pending pass means available research cannot be declared exhausted',()=>{
 const a=input();a.passes=[{...a.passes[0],status:'pending',reviewId:null}];
 a.operations={status:'no_further_accessible_sources',reviewerId:'operator_one',reasonId:'new_study'};
 assert.throws(()=>get(a),/operations_not_reviewed/);
});
test('197 a completed search without reviewer receipt is rejected',()=>{
 const a=input();a.passes[0].reviewId=null;assert.throws(()=>get(a),/pass_invalid/);
});
test('197 a completed-empty search cannot secretly list new sources',()=>{
 const a=input();a.passes[0].foundSourceIds=['surprise_review'];assert.throws(()=>get(a),/pass_invalid/);
});
test('197 a duplicate pass ID across language or market is rejected',()=>{
 const a=input();a.passes=[...a.passes,{...a.passes[0],market:'IT'}];assert.throws(()=>get(a),/pass_duplicates/);
});
test('197 malformed language tags rejected instead of pretending translation',()=>{
 for(const language of ['Italian','en-1234','it<script>']){const a=input();a.passes[0].language=language;
 assert.throws(()=>get(a),/pass_invalid/);}
});
test('197 unreviewed broad cultural competency is not accepted',()=>{
 const a=input();a.expertise=[{evidenceRecordId:'record_cook',criterionId:'cooking_quality',language:'it-IT',
 testedMarket:'IT',expertise:'documented_professional_practice',competenceScopeReviewId:null,basisReferenceId:null}];
 assert.throws(()=>get(a),/expertise_not_supported/);
});
test('197 unknown new product cannot be injected into another user demand',()=>{
 const a=input();a.productId='not_in_portfolio';assert.throws(()=>get(a),/product_scope/);
});
test('197 original content is never returned in the audit schema',()=>{
 const text=JSON.stringify(get(input()));assert.equal(text.includes('transientText'),false);
 assert.equal(text.includes('fullReviewBody'),false);
});
test('197 deterministic across evidence, passes and expertise input order',()=>{
 const a=input();const b=input();b.evidence=[...b.evidence].reverse();b.passes=[...b.passes].reverse();
 assert.deepEqual(get(a),get(b));
});
function fakeBridge(){
 const plan={phase:182,schema:'182.1',planningOnly:true,rankingAuthorized:false,
 jobs:[{jobId:'research_cooking',kind:'exact_variant_source_research',exactVariantId:'oven_one',
 categoryId:'ovens',criterionId:'cooking_quality'},{jobId:'research_other',kind:'exact_variant_source_research',
 categoryId:'ovens',exactVariantId:'other_oven',criterionId:'cooking_quality'}]} as unknown as ResearchPlan182;
 const matrix={schema:'196.1',state:'research_only',publicRankingAllowed:false,sourceBodiesStored:false,
 reviewQueue:[{sourceId:'source_known'},{sourceId:'source_unknown'},{sourceId:'source_wrong'}],
 rows:[{sourceId:'source_known',category:'ovens',variantId:'oven_one',field:'cooking_quality',market:'IT'},
  {sourceId:'source_unknown',category:'ovens',variantId:'oven_one',field:'cooking_quality',market:'IT'},
  {sourceId:'source_wrong',category:'ovens',variantId:'oven_one',field:'cooking_quality',market:'US'}]} as unknown as SourceMatrix196;
 return {plan,matrix};
}
test('197 read-only international hints reuse Phase182/196 and include unfamiliar source',()=>{
 const bridge=fakeBridge();const r=internationalResearchHints197({...bridge,category:'ovens',variantId:'oven_one',targets:[it]});
 assert.equal(r.length,1);assert.deepEqual(r[0].sourceIds,['source_known','source_unknown']);
 assert.equal(r[0].doesNotExecuteSearch,true);assert.equal(r[0].admittedEvidence,false);
});
test('197 international research hint planning does not mutate Phase182 or matrix',()=>{
 const bridge=fakeBridge(),before=JSON.stringify(bridge);
 internationalResearchHints197({...bridge,category:'ovens',variantId:'oven_one',targets:[it]});
 assert.equal(JSON.stringify(bridge),before);
});
test('197 international research hints reject fake publication authority',()=>{
 const bridge=fakeBridge();(bridge.matrix as unknown as {publicRankingAllowed:boolean}).publicRankingAllowed=true;
 assert.throws(()=>internationalResearchHints197({...bridge,category:'ovens',variantId:'oven_one',targets:[it]}),/research_bridge/);
});


test('197 inconclusive original test leaves a critical outcome unresolved',()=>{
 const a=input();a.evidence=[{...a.evidence[0],finding:'inconclusive'},a.evidence[1]];
 const r=get(a);assert.equal(r.search197,'continue');
 assert.deepEqual(r.missingCriticalIds,['cooking_quality']);
 const c=r.criteriaCoverage.find(c=>c.criterionId==='cooking_quality')!;
 assert.equal(c.inconclusiveIndependentRecordCount,1);
 assert.equal(c.evidenceForDecision,'unresolved');
});
test('197 same-language completed search on another target cannot clear Italian cooking',()=>{
 const a=input();const other={...it,targetId:'italian_safety',criterionId:'safe_install'};
 a.regionalTargets=[it,other];a.passes=[...a.passes,{
  passId:'italian_safety_only',channel:'international_search',originId:'italian_safety_team',
  language:'it-IT',market:'IT',status:'completed_no_new_evidence',
  reviewId:'safety_reviewer',foundSourceIds:[],targetIds:['italian_safety']}];
 const r=get(a);assert.deepEqual(r.unexploredRequiredTargetIds,['italian_kitchen']);
});
test('197 a regional search cannot claim a target in a different language or market',()=>{
 const a=input();a.regionalTargets=[it];a.passes=[...a.passes,{
  passId:'incorrect_receipt',channel:'international_search',originId:'other_lab',
  language:'en-GB',market:'IT',status:'completed_no_new_evidence',
  reviewId:'reader',foundSourceIds:[],targetIds:['italian_kitchen']}];
 assert.throws(()=>get(a),/phase197_pass_invalid/);
});
test('197 a same-language untargeted search cannot clear a criterion',()=>{
 const a=input();a.regionalTargets=[it];a.passes=[...a.passes,{
  passId:'italian_generic',channel:'international_search',originId:'search_team',
  language:'it-IT',market:'IT',status:'completed_no_new_evidence',
  reviewId:'reader',foundSourceIds:[]}];
 assert.equal(get(a).search197,'continue');
 assert.deepEqual(get(a).unexploredRequiredTargetIds,['italian_kitchen']);
});
