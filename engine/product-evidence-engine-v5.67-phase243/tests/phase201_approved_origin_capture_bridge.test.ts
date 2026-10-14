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


import {captureApprovedSpecialistSource201, type PrimaryOriginRegistry201,
 type CaptureRequest201} from '../src/phase201_approved_origin_capture_bridge.js';
import {readApprovedSource,type SourceTransport} from '../src/approved_web_reader.js';
import {planWebEvidenceAcquisition,type WebCandidate,type WebSourcePolicy}
 from '../src/web_evidence_acquisition.js';
const checkedAt='2026-10-13T06:00:00Z';
const html=sourceBody.toString();
const schemeOrigin:PrimaryOriginRegistry201={schema:'pee201.primary_origin.v1',
 publisherOrIssuerId:'illustrative_registry',exactHost:'registry.example.org',
 allowedPathPrefix:'/ovens',scopeReviewedOn:'2026-10-12',
 programmeId:'pizza_conformance',registryAuthorityIndependentlyAuthenticated:false};
function acquisition(practical=false):CaptureRequest201{
 const phase199=req200(practical), source=phase199.dossiers[0].sourceUrl;
 const candidate:WebCandidate={id:'lab_candidate',sourceId:'lab_primary',url:source,
  exactVariantId:'oven_one',originalTestId:null,lineageAttestationReference:null,
  kind:'original_professional_test',publishedAt:null,updatedAt:null,metadataOrigin:'human_supplied'};
 const webPolicy:WebSourcePolicy={sourceId:'lab_primary',host:new URL(source).hostname,
  basis:'verified_open_licence',rightsDocumentId:'written_terms_a',
  rightsDocumentUrl:'https://creativecommons.org/licenses/by/4.0/',reviewedBy:'operator_1',
  reviewedAt:'2026-10-12T22:00:00Z',validUntil:'2026-10-20T22:00:00Z',
  permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation'],
  robots:'allowed',robotsCheckedAt:'2026-10-13T05:40:00Z',
  websiteTerms:'reviewed_permitted',termsCheckedAt:'2026-10-12T22:00:00Z',
  commercialUseReviewed:true};
 const plan=planWebEvidenceAcquisition({exactVariantId:'oven_one',userQuestion:'independent test',
  asOf:checkedAt,maxDaysSinceCheck:7,candidates:[candidate],existing:[],policies:[webPolicy]});
 return {phase199,plan,queueItem:plan.items[0],candidate,webPolicy,checkedAt,
  evidenceId:phase199.dossiers[0].evidenceId,...(!practical?{primaryOrigin:schemeOrigin}:{}),
  fixtureTransport:fakeTransport()};
}
function fakeTransport(source=html,opts:{robots?:string;raw?:Uint8Array|null;
 contentType?:string;etag?:string;finalUrl?:string}={}):SourceTransport{
 return {async get(url){if(url.endsWith('/robots.txt'))return {status:200,finalUrl:url,
  contentType:'text/plain',body:opts.robots??'User-agent: *\nAllow: /\n'};
  return {status:200,finalUrl:opts.finalUrl??url,contentType:opts.contentType??'text/html',
   body:source,...(opts.raw===null?{}:{rawBytes:opts.raw??Buffer.from(source)}),
   etag:opts.etag??'\"etag-untrusted\"'};}};
}
test('201 staged scheme fixture source is quarantined, unhashed text is never returned',async()=>{
 const r=await captureApprovedSpecialistSource201(acquisition());
 assert.equal(r.state,'fixture_untrusted');assert.equal(r.sourceKind,'issuer_primary_registry');
 assert.equal(r.sha256FullDocument,sha(sourceBody));assert.equal(r.receipt,null);
 assert.equal(r.livePublishingAuthorized,false);assert.equal(r.signedCaptureAuthenticatesActualIssuer,false);
 assert.equal(JSON.stringify(r).includes(html),false);
});
test('201 ordinary specialist article has distinct custody kind',async()=>{
 const r=await captureApprovedSpecialistSource201(acquisition(true));
 assert.equal(r.state,'fixture_untrusted');assert.equal(r.sourceKind,'publisher_original_document');
});
test('201 cannot sign with injected mock even with valid key and signer',async()=>{
 const a=acquisition();let invoked=0;
 a.signer={protectedPolicy:sample().policy,sign:async()=>{invoked++;return {keyId:'controlled_capture',signatureBase64Url:'A'.repeat(86)}}};
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'invalid_or_mixed_trust_boundary');
 assert.equal(invoked,0);
});
test('201 without mock requires controlled signer',async()=>{
 const a=acquisition();delete a.fixtureTransport;
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'invalid_or_mixed_trust_boundary');
});
test('201 registry programme mapping is required for scheme approval',async()=>{
 const a=acquisition();delete a.primaryOrigin;
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'primary_registry_mapping_missing');
});
test('201 reject registry host substitution',async()=>{
 const a=acquisition();a.primaryOrigin={...schemeOrigin,exactHost:'fraud.example.org'};
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'primary_registry_mapping_missing');
});
test('201 reject stale or future registry configuration',async()=>{
 const a=acquisition();a.primaryOrigin={...schemeOrigin,scopeReviewedOn:'2026-11-01'};
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'primary_registry_mapping_missing');
});
test('201 reject forged registry claim on expert article',async()=>{
 const a=acquisition(true);a.primaryOrigin=schemeOrigin;
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'unexpected_primary_registry_claim');
});
test('201 original bytes must match full publisher document sha',async()=>{
 const a=acquisition();a.fixtureTransport=fakeTransport('unexpected altered HTML document');
 const r=await captureApprovedSpecialistSource201(a);
 assert.equal(r.state,'blocked');assert.equal(r.reason,'controlled_capture_callback_failed');
});
test('201 older approved bytes do not prove updated publisher revision',async()=>{
 const a=acquisition();a.phase199.dossiers[0].publisherDocumentSha256='f'.repeat(64);
 const r=await captureApprovedSpecialistSource201(a);
 assert.equal(r.state,'blocked');
});
test('201 must reject decoded text / raw buffer mismatches',async()=>{
 const a=acquisition();a.fixtureTransport=fakeTransport(html,{raw:Buffer.from('DIFFERENT_BYTES')});
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'complete_byte_capture_unavailable');
});
test('201 legacy transports without raw bytes cannot make capture receipts',async()=>{
 const a=acquisition();a.fixtureTransport=fakeTransport(html,{raw:null});
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'complete_byte_capture_unavailable');
});
test('201 ill-formed UTF8 source bytes are rejected even if decoded output looks ordinary',async()=>{
 const a=acquisition();a.fixtureTransport=fakeTransport(html,{raw:Buffer.concat([sourceBody,Buffer.from([0xff])])});
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'complete_byte_capture_unavailable');
});
test('201 do not capture documents denied by robots',async()=>{
 const a=acquisition();let reads=0;
 a.fixtureTransport={async get(url,agent,max){reads++;return fakeTransport(html,{robots:'User-agent: *\nDisallow: /ovens'}).get(url,agent,max);}};
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'robots_disallow');assert.equal(reads,1);
});
test('201 cannot bypass expired rights',async()=>{
 const a=acquisition();a.webPolicy.validUntil='2026-10-12T12:00:00Z';
 assert.equal((await captureApprovedSpecialistSource201(a)).state,'blocked');
});
test('201 must reject source URLs different from reviewed dossier',async()=>{
 const a=acquisition();a.candidate.url='https://registry.example.org/different';
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'presentation_source_scope_mismatch');
});
test('201 wrong exact product variant refused',async()=>{
 const a=acquisition();a.candidate.exactVariantId='other_oven';
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'presentation_source_scope_mismatch');
});
test('201 invalid evidence identity refused',async()=>{
 const a=acquisition();a.evidenceId='edited_issuer_claim';
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'presentation_source_scope_mismatch');
});
test('201 unsupported PDF/binary not promoted by legacy html-only reader',async()=>{
 const a=acquisition();a.fixtureTransport=fakeTransport(html,{contentType:'application/pdf'});
 assert.equal((await captureApprovedSpecialistSource201(a)).state,'blocked');
});
test('201 response redirect to third party cannot create origin receipt',async()=>{
 const a=acquisition();a.fixtureTransport=fakeTransport(html,{finalUrl:'https://other.example.org/ovens'});
 assert.equal((await captureApprovedSpecialistSource201(a)).state,'blocked');
});
test('201 persisted response may retain safe ETag, but never use as source proof',async()=>{
 const r=await captureApprovedSpecialistSource201(acquisition());
 assert.equal(r.etag,'\"etag-untrusted\"');assert.equal(r.receipt,null);
});
test('201 transient callback is invoked only on quarantined text, and byte copy is zeroed',async()=>{
 const a=acquisition();let alias:Uint8Array|undefined;
 const result=await readApprovedSource({plan:a.plan,queueItem:a.queueItem,candidate:a.candidate,
  policy:a.webPolicy,checkedAt:a.checkedAt,transport:a.fixtureTransport,
  onQuarantinedDocument:document=>{alias=document.completeBytes;
    assert.equal(sha(alias),sha(sourceBody));}});
 assert.equal(result.status,'quarantined');assert(alias);assert(alias.every(b=>b===0));
});
test('201 transient capture exception cannot leak source content or produce success',async()=>{
 const a=acquisition();const result=await readApprovedSource({plan:a.plan,queueItem:a.queueItem,
  candidate:a.candidate,policy:a.webPolicy,checkedAt:a.checkedAt,transport:a.fixtureTransport,
  onQuarantinedDocument:()=>{throw Error('SENSITIVE ARTICLE CONTENT');}});
 assert.equal(result.status,'blocked');assert.equal(JSON.stringify(result).includes('SENSITIVE'),false);
});

test('201 registry prefix cannot match sibling paths',async()=>{
 const a=acquisition();a.primaryOrigin={...schemeOrigin,allowedPathPrefix:'/oven'};
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'primary_registry_mapping_missing');
});
test('201 invalid registry prefix traversal fails closed',async()=>{
 const a=acquisition();a.primaryOrigin={...schemeOrigin,allowedPathPrefix:'/ovens/../'};
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'primary_registry_mapping_missing');
});
test('201 local injected transport cannot exploit downstream signed-custody callback',async()=>{
 const a=acquisition();let events=0;a.onSignedCapture=()=>{events++};
 assert.equal((await captureApprovedSpecialistSource201(a)).state,'blocked');
 assert.equal(events,0);
});
test('201 stale controlled HTTPS clock refuses before network IO',async()=>{
 const a=acquisition();delete a.fixtureTransport;a.checkedAt='2020-01-01T00:00:00Z';
 a.signer={protectedPolicy:sample().policy,sign:async()=>{throw Error('must not sign');}};
 assert.equal((await captureApprovedSpecialistSource201(a)).reason,'invalid_or_mixed_trust_boundary');
});
