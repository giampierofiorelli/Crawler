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



import {createHash,generateKeyPairSync,sign} from 'node:crypto';
import {buildSpecialistTrustPresentation199,fingerprintTrustPresentation199,
 type TrustPresentationRequest199,type PublicationDossier199} from '../src/phase199_specialist_trust_presentation.js';
import {stageSpecialistTrust200,captureMessage200,approvalMessage200,statusMessage200,claimBinding200,
 type StageRequest200,type CaptureClaim200,type ApprovalClaim200,type ReleaseStatus200,type Role200,
 type Signed200,type Anchor200} from '../src/phase200_signed_source_publication_gate.js';

const reviewer=(id:string)=>({reviewerId:id,sourceCustodyReviewId:id+'_custody',
 variantAndOutcomeReviewId:id+'_variant',originalTestOrSchemeReviewId:id+'_scheme',
 commercialDisclosureReviewId:id+'_disclosure'});
const sourceBody=Buffer.from('ILLUSTRATIVE original issuer page, synthetic bytes, no real certificate');
const sha=(x:Uint8Array)=>createHash('sha256').update(x).digest('hex');
function req200(practical=false):TrustPresentationRequest199{
 const a=practical?withPractical():withScheme();
 return {specialistInput:a,dossiers:[{evidenceId:practical?'professional_pizza_outcome':'oven_scheme_entry',
  sourceRecordId:'record_cook',criterionId:'cooking_quality',variantId:'oven_one',
  disciplineId:'pizza_napoletana',outcomeId:'correct_baked_pizza',
  sourceUrl:practical?'https://chef.example.org/pizza-review':'https://registry.example.org/ovens',
  publisherDocumentSha256:sha(sourceBody),documentVersionId:'publisher_v1',
  creditedAgentDisplayName:'Illustrative specialist programme',digestBasis:'complete_publisher_document',
  publisherOrigin:'confirmed_original_publisher',evaluatedAt:'2026-10-12',
  reviewers:[reviewer('human_one'),reviewer('human_two')],authorizationToUseSchemeMark:false}],
  labels:[{criterionId:'cooking_quality',disciplineId:'pizza_napoletana',
  outcomeId:'correct_baked_pizza',plainOutcomeName:'Neapolitan pizza baking'}]};
}
const signers=Object.fromEntries((['controlled_capture','source_custody_reviewer',
 'scope_and_conflict_reviewer','release_status_authority'] as Role200[]).map((role)=>{
 const pair=generateKeyPairSync('ed25519');return [role,pair];
})) as Record<Role200,ReturnType<typeof generateKeyPairSync>>;
const roles=['controlled_capture','source_custody_reviewer','scope_and_conflict_reviewer','release_status_authority'] as Role200[];
const anchors:Anchor200[]=roles.map(role=>({keyId:role,principalId:role,role,
 publicKeyPem:signers[role].publicKey.export({format:'pem',type:'spki'}).toString(),
 activeFrom:'2026-01-01',activeThrough:'2027-01-01'}));
function signed<T>(payload:T,role:Role200,message:string):Signed200<T>{return {payload,keyId:role,
 signatureBase64Url:sign(null,Buffer.from(message),signers[role].privateKey).toString('base64url')};}
function sample(practical=false):StageRequest200{
 const phase199=req200(practical);const view=buildSpecialistTrustPresentation199(phase199);
 const card=view.cards[0];
 const cap:CaptureClaim200={schema:'pee200.capture.v1',evidenceId:card.evidenceIds[0],
 kind:practical?'publisher_original_document':'issuer_primary_registry',sourceUrl:card.sourceUrl,
 documentVersionId:card.sourceVersionId,variantId:'oven_one',sha256FullDocument:sha(sourceBody),
 capturedAt:'2026-10-12',originCheck:'tls_origin_checked_by_controlled_fetcher',sourceContentType:'text/html'};
 const binding=claimBinding200(card,cap,view);
 const reviewerApprovals=(['source_custody_reviewer','scope_and_conflict_reviewer'] as const)
 .map(role=>{const a:ApprovalClaim200={schema:'pee200.approval.v1',evidenceId:cap.evidenceId,
  claimBindingSha256:binding,presentationHash:fingerprintTrustPresentation199(view),
  variantId:'oven_one',criterionId:'cooking_quality',sourceVersionId:'publisher_v1',
  approvedAt:'2026-10-12',role,decision:'checked_and_supported'};
  return signed(a,role,approvalMessage200(a));});
 const status:ReleaseStatus200={schema:'pee200.status.v1',policyId:'production_review_policy_v1',
 checkedThrough:'2026-10-13',revokedClaimBindingSha256:[]};
 return {phase199,evidencePackets:[{evidenceId:cap.evidenceId,
   capture:{claim:signed(cap,'controlled_capture',captureMessage200(cap)),
    transientCompleteDocument:sourceBody},reviewerApprovals}],
 signedReleaseStatus:signed(status,'release_status_authority',statusMessage200(status)),
 policy:{policyId:'production_review_policy_v1',anchors:anchors.map(a=>({...a})),maximumCaptureAgeDays:90,maximumStatusAgeDays:2}};
}
function verdict(req=sample()){return stageSpecialistTrust200(req);}
function signedStatus(req:StageRequest200){const p=req.signedReleaseStatus.payload;
 req.signedReleaseStatus=signed(p,'release_status_authority',statusMessage200(p));}
function signedCapture(req:StageRequest200){const p=req.evidencePackets[0].capture.claim.payload;
 req.evidencePackets[0].capture.claim=signed(p,'controlled_capture',captureMessage200(p));}
function resignReview(req:StageRequest200,index:number){const s=req.evidencePackets[0].reviewerApprovals[index];
 (req.evidencePackets[0].reviewerApprovals as Signed200<ApprovalClaim200>[])[index]=signed(s.payload,s.payload.role,approvalMessage200(s.payload));}

test('200 authentic signatures and complete bytes permit STAGING only',()=>{
 const v=verdict();assert.equal(v.stageCards.length,1);
 assert.equal(v.livePublishingAuthorized,false);assert.equal(v.thirdPartyMarkAuthorized,false);
 assert.equal(v.actualIssuerClaimsValidatedByRuntime,false);assert.equal(v.rankingChanged,false);
 assert.equal(v.stageCards[0].card.kind,'specialist_scheme_approval');
 assert.equal(v.stageCards[0].signerKeyIds.length,2);
});
test('200 signed ordinary expert outcome has distinct provenance kind',()=>{
 const v=verdict(sample(true));assert.equal(v.stageCards.length,1);
 assert.equal(v.stageCards[0].card.kind,'expert_practical_test');
});
test('200 no raw publisher document in returned decision',()=>{
 const json=JSON.stringify(verdict());assert(!json.includes('ILLUSTRATIVE original issuer page'));
 assert(!json.includes('BEGIN PUBLIC KEY'));assert(!json.includes('PRIVATE KEY'));
});
test('200 no unsigned capture accepted',()=>{
 const r=sample();r.evidencePackets[0].capture.claim.signatureBase64Url='A'.repeat(86);
 assert.equal(verdict(r).held[0].reason,'invalid_capture_signature');
});
test('200 capture full-document bytes must match signed SHA256',()=>{
 const r=sample();r.evidencePackets[0].capture.transientCompleteDocument=Buffer.from('tampered');
 assert.equal(verdict(r).held[0].reason,'document_digest_mismatch');
});
test('200 mismatched original document version rejected',()=>{
 const r=sample();r.evidencePackets[0].capture.claim.payload.documentVersionId='second_version';signedCapture(r);
 assert.equal(verdict(r).held[0].reason,'capture_scope_mismatch');
});
test('200 capture copied from a different product variant rejected',()=>{
 const r=sample();r.evidencePackets[0].capture.claim.payload.variantId='oven_two';signedCapture(r);
 assert.equal(verdict(r).held[0].reason,'capture_scope_mismatch');
});
test('200 expert review cannot impersonate primary issuer registry capture',()=>{
 const r=sample();r.evidencePackets[0].capture.claim.payload.kind='publisher_original_document';signedCapture(r);
 assert.equal(verdict(r).held[0].reason,'missing_registry_origin');
});
test('200 issuer programme cannot impersonate specialist authored experiment',()=>{
 const r=sample(true);r.evidencePackets[0].capture.claim.payload.kind='issuer_primary_registry';signedCapture(r);
 assert.equal(verdict(r).held[0].reason,'missing_registry_origin');
});
test('200 capture from before maximum freshness denied',()=>{
 const r=sample();r.evidencePackets[0].capture.claim.payload.capturedAt='2026-01-01';signedCapture(r);
 assert.equal(verdict(r).held[0].reason,'source_capture_expired');
});
test('200 stale status snapshot denies all badges despite perfect signatures',()=>{
 const r=sample();r.signedReleaseStatus.payload.checkedThrough='2026-09-30';signedStatus(r);
 assert.equal(verdict(r).held[0].reason,'untrusted_release_status');
});
test('200 signed revocation overrides valid old approvals',()=>{
 const r=sample();const binding=claimBinding200(buildSpecialistTrustPresentation199(r.phase199).cards[0],
 r.evidencePackets[0].capture.claim.payload,buildSpecialistTrustPresentation199(r.phase199));
 r.signedReleaseStatus.payload.revokedClaimBindingSha256=[binding];signedStatus(r);
 assert.equal(verdict(r).held[0].reason,'rejected_revoked');
});
test('200 forged revocation-free status is rejected',()=>{
 const r=sample();r.signedReleaseStatus.payload.checkedThrough='2026-10-12';
 assert.equal(verdict(r).held[0].reason,'untrusted_release_status');
});
test('200 different signing key not in pinned policy cannot authorize capture',()=>{
 const r=sample();const other=generateKeyPairSync('ed25519');
 r.evidencePackets[0].capture.claim.signatureBase64Url=sign(null,
 Buffer.from(captureMessage200(r.evidencePackets[0].capture.claim.payload)),other.privateKey).toString('base64url');
 assert.equal(verdict(r).held[0].reason,'invalid_capture_signature');
});
test('200 incomplete second reviewer stops staging',()=>{
 const r=sample();(r.evidencePackets[0].reviewerApprovals as Signed200<ApprovalClaim200>[]).pop();
 assert.equal(verdict(r).held[0].reason,'missing_independent_review');
});
test('200 one human cannot play two review roles through two keys',()=>{
 const r=sample();r.policy.anchors[2].principalId='source_custody_reviewer';
 assert.equal(verdict(r).held[0].reason,'missing_independent_review');
});
test('200 altered signed reviewer scope is rejected',()=>{
 const r=sample();r.evidencePackets[0].reviewerApprovals[1].payload.criterionId='other';
 assert.equal(verdict(r).held[0].reason,'approval_scope_mismatch');
});
test('200 correct scope but forged reviewer signature denied',()=>{
 const r=sample();r.evidencePackets[0].reviewerApprovals[1].signatureBase64Url='A'.repeat(86);
 assert.equal(verdict(r).held[0].reason,'invalid_approval_signature');
});
test('200 altered claim hash with correctly re-signed reviewer still fails scope',()=>{
 const r=sample();r.evidencePackets[0].reviewerApprovals[0].payload.claimBindingSha256='b'.repeat(64);resignReview(r,0);
 assert.equal(verdict(r).held[0].reason,'approval_scope_mismatch');
});
test('200 altered presentation hash invalidates previously approved state',()=>{
 const r=sample();r.phase199.labels[0].plainOutcomeName='Other cooking outcome';
 assert.equal(verdict(r).held[0].reason,'approval_scope_mismatch');
});
test('200 non-Ed25519 anchor rejected, no fallback to insecure algorithms',()=>{
 const r=sample();const {publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
 r.policy.anchors[0].publicKeyPem=publicKey.export({type:'spki',format:'pem'}).toString();
 assert.throws(()=>verdict(r),/phase200_key_type|phase200_key/);
});
test('200 policy date bounds reject invalid cryptographic trust configuration',()=>{
 const r=sample();r.policy.maximumCaptureAgeDays=999;
 assert.throws(()=>verdict(r),/phase200_policy/);
});
test('200 capture signer with wrong role cannot authorize issuer record',()=>{
 const r=sample();r.evidencePackets[0].capture.claim=signed(r.evidencePackets[0].capture.claim.payload,
  'source_custody_reviewer',captureMessage200(r.evidencePackets[0].capture.claim.payload));
 assert.equal(verdict(r).held[0].reason,'invalid_capture_signature');
});
test('200 expired pin stops old valid signature',()=>{
 const r=sample();r.policy.anchors[0].activeThrough='2026-09-30';
 assert.equal(verdict(r).held[0].reason,'invalid_capture_signature');
});
test('200 extra unqualified evidence packet cannot issue additional trust card',()=>{
 const r=sample();(r.evidencePackets as typeof r.evidencePackets[number][]).push({...r.evidencePackets[0],evidenceId:'unknown'});
 const v=verdict(r);assert.equal(v.stageCards.length,1);
 assert(v.held.some(h=>h.evidenceId==='unknown'&&h.reason==='no_matching_phase199_disclosure'));
});
test('200 absent specialist validation yields no signal, not bad product',()=>{
 const r=sample();r.phase199.dossiers=[];const v=verdict(r);
 assert.equal(v.stageCards.length,0);assert.equal(v.underlyingPresentation.unmetEssentialCriteria[0],'cooking_quality');
});
test('200 unordered status revocation list is not trusted',()=>{
 const r=sample();r.signedReleaseStatus.payload.revokedClaimBindingSha256=['f'.repeat(64),'a'.repeat(64)];signedStatus(r);
 assert.equal(verdict(r).held[0].reason,'untrusted_release_status');
});
test('200 no document body can exceed bounded transient maximum',()=>{
 const r=sample();r.evidencePackets[0].capture.transientCompleteDocument=Buffer.alloc(20_000_001);
 assert.equal(verdict(r).held[0].reason,'capture_scope_mismatch');
});

import {emptyLedger193,recordScreening193,type ScreeningDecision193,type SourceRevision193}
 from '../src/phase193_screening_memory.js';
function historicallyExcluded():StageRequest200{
 const r=sample();const c=r.evidencePackets[0].capture.claim.payload;
 const revision:SourceRevision193={sourceId:'record_cook',url:c.sourceUrl,
  contentHash:c.sha256FullDocument,contentBasis:'publisher_bytes',
  policyVersion:'source_policy_v1',classificationRevision:'star_only_v1',
  market:'UK',category:'ovens',variantId:'oven_one',field:'cooking_quality',
  observedAt:'2026-10-12T09:00:00Z'};
 const decision:ScreeningDecision193={source:revision,scope:'document',action:'discovery_only',
  reason:'marketplace_stars_without_original_test',reviewerId:'prior_reviewer',
  reviewTicket:'PEE-REVIEW-193-012',reviewedAt:'2026-10-12T10:00:00Z',
  reviewBasis:'human_source_screen',evidenceNote:'Synthetic document judged a stars-only list, not original testing.',
  originalTestEventId:null,retainedCandidateVariantIds:['oven_one']};
 r.screeningMemory={ledger:recordScreening193(emptyLedger193(),decision),revisions:[revision]};
 return r;
}
test('200 Phase193 identical publisher bytes and reviewed star-only decision blocks staged original claim',()=>{
 const r=historicallyExcluded();const v=verdict(r);
 assert.equal(v.stageCards.length,0);
 assert.equal(v.held[0].reason,'previous_review_limits_originality');
});
test('200 Phase193 revised document does not silently reuse an old negative screen',()=>{
 const r=historicallyExcluded();r.screeningMemory!.revisions[0].contentHash='b'.repeat(64);
 assert.equal(verdict(r).stageCards.length,1);
});
test('200 Phase193 policy change forces new evaluation; stale exclusion does not become a domain blacklist',()=>{
 const r=historicallyExcluded();r.screeningMemory!.revisions[0].policyVersion='new_policy_v2';
 assert.equal(verdict(r).stageCards.length,1);
});
test('200 Phase193 unrelated domain-wide exclusion does not suppress new original',()=>{
 const r=historicallyExcluded();r.screeningMemory!.revisions[0].url='https://other.example.org/ovens';
 assert.equal(verdict(r).stageCards.length,1);
});
test('200 Phase193 review metadata hash chains cannot be spoofed',()=>{
 const r=historicallyExcluded();r.screeningMemory!.ledger.events[0].eventHash='c'.repeat(64);
 assert.throws(()=>verdict(r),/invalid193_chain/);
});
test('200 unknown scheme registry version cannot produce eligible Phase199 card',()=>{
 const r=sample();r.phase199.specialistInput.recognitions[0].entryStatus='unknown';
 const v=verdict(r);assert.equal(v.stageCards.length,0);
});
test('200 commercial professional endorsement cannot be signed into official approval',()=>{
 const r=sample();r.phase199.specialistInput.recognitions[0].kind='professional_endorsement';
 assert.equal(verdict(r).stageCards.length,0);
});
test('200 source data change despite identical text annotation forces new signatures',()=>{
 const r=sample();r.phase199.dossiers[0].publisherDocumentSha256='f'.repeat(64);
 assert.equal(verdict(r).stageCards.length,0);
});
test('200 policy does not accept duplicate capture service key identifiers',()=>{
 const r=sample();r.policy.anchors[1].keyId=r.policy.anchors[0].keyId;
 assert.throws(()=>verdict(r),/phase200_policy/);
});
test('200 signed status with unsorted revoked set fails closed, not sanitized',()=>{
 const r=sample();r.signedReleaseStatus.payload.revokedClaimBindingSha256=['f'.repeat(64),'a'.repeat(64)];signedStatus(r);
 assert.equal(verdict(r).stageCards.length,0);
});

test('200 same Ed25519 key cannot impersonate two distinct reviewer accounts',()=>{
 const r=sample();r.policy.anchors[2].publicKeyPem=r.policy.anchors[1].publicKeyPem;
 assert.throws(()=>verdict(r),/phase200_duplicate_public_key/);
});
