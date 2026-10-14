import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash,generateKeyPairSync,sign} from 'node:crypto';
import {advanceUserRequest164,newRequestSession164} from '../src/phase164_user_request_journey.js';
import {previewOriginalReviewMeasures167} from '../src/phase167_source_variant_quantity_adapter.js';
import {auditQuantifiedRequest166} from '../src/phase166_quantified_evidence_bridge.js';
import {planSignedSuitabilityResearch169,signingBytes169,
 type TrustKey169,type SignedReceipt169,type UserAttestation169,type SourceAttestation169}
 from '../src/phase169_signed_suitability_research.js';
import type {ReaderInput139} from '../src/phase139_unmarked_english_candidate_reader.js';
import type {CategoryBrain128} from '../src/phase128_category_cognition_dialogue_bridge.js';
import type {QuarantinedQualitativeFinding,ReviewEvidenceApproval} from '../src/phase96_qualitative_review_evidence.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const question='Best coffee machine must have quiet and width under 35 cm';
const sourceText='The Aster coffee machine measured 31 cm in width.';
const brain:CategoryBrain128={categoryId:'coffee_machine',schemaVersion:1,aliases:['coffee machine'],
 sources:[{id:'source_a',url:'https://example.org/constructed',title:'Constructed',originalDocumentId:'doc_a',role:'original_expert_method'}],
 concepts:[{id:'quiet_operation',kind:'capability',label:'quiet operation',aliases:['quiet'],
 evidenceKeys:['constructed_quality'],state:'reviewed_definition',review:{reviewId:'fixture_review',reviewerId:'synthetic',
 reviewScope:'category_definition',sourceRefIds:['source_a']}}],quality:[],distinctions:[]};
const request=advanceUserRequest164(newRequestSession164('session_alpha'),{
 turnId:'turn_1',question,language:'en',brains:[brain]});
const facets=[{categoryId:'coffee_machine',aspectId:'quiet_operation',criterionId:'acoustic_quality',
 evidenceSemantics:'performance_quality' as const,categoryReviewReference:'constructed_mapping'}];
const reader:ReaderInput139={document:{text:sourceText,sha256:sha(sourceText),source:{
 id:'source_a',originalDocumentId:'doc_a',url:'https://example.org/constructed',title:'Constructed source',role:'original_product_test'}},
 pageIdentity:{reviewedProductId:'machine_a',reviewedVariantId:'variant_a',reviewedAliases:['Aster coffee machine']}};
const quantitative=previewOriginalReviewMeasures167({request,question,products:['machine_a'],
 sources:[{reader,binding:{productId:'machine_a',variantId:'variant_a',sourceId:'source_a',
 originalDocumentId:'doc_a',documentSha256:sha(sourceText),reviewedAliases:['Aster coffee machine'],
 identityIndependentlyAuthenticated:false,sourceIndependentlyAuthenticated:false}}]});
const q=auditQuantifiedRequest166(question);
const now='2026-10-12T12:00:00.000Z',issued='2026-10-12T11:00:00.000Z',expires='2026-10-13T11:00:00.000Z';
const userPair=generateKeyPairSync('ed25519'),sourcePair=generateKeyPairSync('ed25519');
const keys:TrustKey169[]=[
 {keyId:'user_key',actorId:'event_gateway',role:'user_session_issuer',
 publicKeyPem:userPair.publicKey.export({format:'pem',type:'spki'}).toString(),
 validFrom:'2026-10-01T00:00:00.000Z',validUntil:'2026-11-01T00:00:00.000Z',revoked:false,allowedSourceIds:[]},
 {keyId:'source_key',actorId:'researcher_alpha',role:'source_reviewer',
 publicKeyPem:sourcePair.publicKey.export({format:'pem',type:'spki'}).toString(),
 validFrom:'2026-10-01T00:00:00.000Z',validUntil:'2026-11-01T00:00:00.000Z',revoked:false,allowedSourceIds:['source_a']}
];
let serial=0;
function receipt(payload:UserAttestation169|SourceAttestation169):SignedReceipt169{
 const user=payload.kind==='user_constraint';
 const unsigned={version:1 as const,receiptId:`receipt_${++serial}`,keyId:user?'user_key':'source_key',
 actorId:user?'event_gateway':'researcher_alpha',issuedAt:issued,expiresAt:expires,payload};
 return {...unsigned,signature:sign(null,signingBytes169(unsigned),user?userPair.privateKey:sourcePair.privateKey).toString('base64')};
}
const quantityConfirm=():UserAttestation169=>({kind:'user_constraint',sessionId:request.session.sessionId,
 sessionRevision:request.session.revision,sessionEpoch:request.session.epoch,turnId:request.turnId,
 questionSha256:request.requestSha256,target:{kind:'quantity',quantityId:q.candidates[0].id,
 exactPhrase:q.candidates[0].span.literal}});
const qualConfirm=():UserAttestation169=>({kind:'user_constraint',sessionId:request.session.sessionId,
 sessionRevision:request.session.revision,sessionEpoch:request.session.epoch,turnId:request.turnId,
 questionSha256:request.requestSha256,target:{kind:'qualitative',aspectId:'quiet_operation',
 meaning:'required',exactPhrase:'quiet',context:{usage:'shared_kitchen'}}});
const candidate=quantitative.candidateMeasures.find(c=>c.disposition==='candidate_pending_scientific_review')!;
const review=(over:Partial<SourceAttestation169>={}):SourceAttestation169=>({
 kind:'source_candidate',questionSha256:request.requestSha256,
 target:{kind:'quantity',candidateId:candidate.id,variantId:'variant_a',sourceId:'source_a',
 documentSha256:sha(sourceText),spanSha256:candidate.quantitySpan.sha256},
 protocolReference:'reviewed_method_01',methodReview:'documented',variantReview:'documented',
 rightsReview:'documented',...over});
const finding:QuarantinedQualitativeFinding={findingId:'finding_quiet',exactVariantId:'variant_a',
 criterionId:'acoustic_quality',proposition:'In this constructed source this model sounded quiet enough.',
 polarity:'favourable',basis:'hands_on_observation',context:{usage:'shared_kitchen'},
 methodologyReference:'constructed_protocol',qualification:null,originalTestId:'test_a',
 sourceUrl:'https://example.org/constructed',sourceSha256:sha('qualitative article'),
 sourceSpanSha256:sha('qualitative excerpt'),sourceSpanBytes:55,
 reviewStatus:'quarantined_for_semantic_method_and_rights_review',
 evidenceKind:'original_professional_qualitative_observation',quantifiedMeasurement:false,
 weight:null,numericScore:null};
const approval:ReviewEvidenceApproval={findingId:finding.findingId,reviewerId:'researcher_alpha',
 reviewReference:'constructed_original_review',validatedSourceSha256:finding.sourceSha256,
 reviewedAt:issued,semanticFaithfulness:'confirmed',methodAssessment:'documented',
 adequacyAssessment:'documented',criterionImplication:'supports'};
const qualitativeEvidence=[{variantId:'variant_a',sourceIdByFinding:{finding_quiet:'source_a'},
 findings:[finding],approvals:[approval]}];
const qualitativeReview=():SourceAttestation169=>({kind:'source_candidate',questionSha256:request.requestSha256,
 target:{kind:'qualitative',findingId:finding.findingId,variantId:'variant_a',sourceId:'source_a',
 sourceSha256:finding.sourceSha256,sourceSpanSha256:finding.sourceSpanSha256},
 protocolReference:'reviewed_method_qual',methodReview:'documented',variantReview:'documented',rightsReview:'documented'});
const run=(receipts:SignedReceipt169[]=[],over:Record<string,unknown>={})=>planSignedSuitabilityResearch169({
 question,request,facets,quantitative,qualitativeEvidence,trustedKeys:keys,receipts,
 previouslyAcceptedReceiptIds:new Set<string>(),now,...over});
const st=(result:ReturnType<typeof run>,kind:'quantity'|'qualitative')=>result.requirements.find(x=>x.kind===kind)!;

test('all unsigned candidate evidence is quarantined and no rank is available',()=>{
 const r=run();
 assert.equal(st(r,'quantity').state,'pending_user_attestation');
 assert.equal(st(r,'qualitative').state,'pending_user_attestation');
 assert.equal(r.rankingAuthorized,false);assert.equal(r.publicationAuthorized,false);
 assert.equal(r.exclusionsAuthorized,false);assert.equal(r.confirmedHumanIdentity,false);
});
test('signed user quantity event is bound to request but does not validate review',()=>{
 const r=run([receipt(quantityConfirm())]);
 assert.equal(st(r,'quantity').userAttestationVerified,true);
 assert.equal(st(r,'quantity').state,'unreviewed_candidate');
 assert.equal(r.independentScientificReviewApproved,false);
});
test('signed original reviewer candidate only yields preliminary fit, never rank',()=>{
 const r=run([receipt(quantityConfirm()),receipt(review())]);
 assert.equal(st(r,'quantity').state,'signed_candidate_fit');
 assert.equal(st(r,'quantity').signedSourceReceipts.length,1);
 assert.equal(st(r,'quantity').eligibleForRanking,false);
 assert.equal(st(r,'quantity').eligibleForExclusion,false);
});
test('signed qualitative confirmation retains exact meaning and context',()=>{
 const r=run([receipt(qualConfirm())]);
 assert.equal(st(r,'qualitative').userAttestationVerified,true);
 assert.equal(r.qualitative.requirements[0].proposedMeaning,'required');
 assert.equal(st(r,'qualitative').state,'qualitative_review_pending');
 assert.equal(r.qualitative.independentUserConfirmationAuthentication,false);
});
test('signed qualitative finding stays research-only even with documentary reviewer approval',()=>{
 const r=run([receipt(qualConfirm()),receipt(qualitativeReview())]);
 assert.equal(st(r,'qualitative').state,'signed_qualitative_candidate');
 assert.equal(st(r,'qualitative').eligibleForRanking,false);
 assert.equal(r.qualitative.rankingAuthorized,false);
});
test('mixed signed quantity and qualitative paths preserve independent guards',()=>{
 const r=run([receipt(quantityConfirm()),receipt(review()),receipt(qualConfirm()),receipt(qualitativeReview())]);
 assert.deepEqual(new Set(r.requirements.map(x=>x.state)),new Set(['signed_candidate_fit','signed_qualitative_candidate']));
 assert.equal(r.receiptAudits.length,4);
 assert.equal(r.researchObligations.some(x=>x.includes('independently_authenticate')),true);
});
test('tampered signature cannot authenticate anything',()=>{
 const r=receipt(quantityConfirm());r.signature=r.signature[0]==='A'?'B'+r.signature.slice(1):'A'+r.signature.slice(1);
 assert.throws(()=>run([r]),/bad_receipt_signature/);
});
test('altered signed message fails signature verification',()=>{
 const r=receipt(quantityConfirm());(r.payload as UserAttestation169).target={kind:'quantity',quantityId:'q166_99',exactPhrase:'x'};
 assert.throws(()=>run([r]),/bad_receipt_signature/);
});
test('wrong actor role cannot issue user confirmation',()=>{
 const r=receipt(quantityConfirm());
 const u={...r,keyId:'source_key',actorId:'researcher_alpha'};
 assert.throws(()=>run([u]),/wrong_signer_role/);
});
test('same receipt ID cannot be accepted twice in a batch',()=>{
 const r=receipt(quantityConfirm());assert.throws(()=>run([r,r]),/replayed_phase169_receipt/);
});
test('durable previous receipt IDs block replay across batches',()=>{
 const r=receipt(quantityConfirm());
 assert.throws(()=>run([r],{previouslyAcceptedReceiptIds:new Set([r.receiptId])}),/replayed_phase169_receipt/);
});
test('different user session revision fails even with cryptographically valid receipt',()=>{
 const p=quantityConfirm();p.sessionRevision+=1;
 assert.throws(()=>run([receipt(p)]),/stale_or_cross_session_receipt/);
});
test('different session ID or epoch rejected',()=>{
 const p=quantityConfirm();p.sessionId='session_other';
 assert.throws(()=>run([receipt(p)]),/stale_or_cross_session_receipt/);
 const t=quantityConfirm();t.sessionEpoch+=1;
 assert.throws(()=>run([receipt(t)]),/stale_or_cross_session_receipt/);
});
test('cross-question receipt cannot borrow verified intent',()=>{
 const p=quantityConfirm();p.questionSha256=sha('different question');
 assert.throws(()=>run([receipt(p)]),/wrong_question/);
});
test('incorrect qualitative strength cannot be smuggled by event gateway',()=>{
 const p=qualConfirm();if(p.target.kind==='qualitative')p.target.meaning='preferred';
 assert.throws(()=>run([receipt(p)]),/invalid_qualitative_confirmation/);
});
test('source reviewer must have exact source in server-controlled allowlist',()=>{
 const bad=keys.map(k=>({...k,allowedSourceIds:k.role==='source_reviewer'?['source_b']:[]}));
 assert.throws(()=>run([receipt(review())],{trustedKeys:bad}),/unscoped_source_receipt/);
});
test('source receipt wrong document binding is refused',()=>{
 const p=review();if(p.target.kind==='quantity')p.target.documentSha256=sha('wrong');
 assert.throws(()=>run([receipt(p)]),/unmatched_quantity_evidence/);
});
test('source receipt wrong variant cannot leak to another product',()=>{
 const p=review();if(p.target.kind==='quantity')p.target.variantId='variant_b';
 assert.throws(()=>run([receipt(p)]),/unmatched_quantity_evidence/);
});
test('qualitative receipt wrong passage is refused',()=>{
 const p=qualitativeReview();if(p.target.kind==='qualitative')p.target.sourceSpanSha256=sha('other span');
 assert.throws(()=>run([receipt(p)]),/unmatched_qualitative_evidence/);
});
test('expired receipt rejected',()=>{
 const r=receipt(quantityConfirm());r.expiresAt='2026-10-12T11:30:00.000Z';
 assert.throws(()=>run([r]),/replayed_phase169_receipt/);
});
test('key revocation rejects even a valid signature',()=>{
 const denied=keys.map(k=>({...k,revoked:k.role==='user_session_issuer'}));
 assert.throws(()=>run([receipt(quantityConfirm())],{trustedKeys:denied}),/untrusted_or_expired_signer/);
});
test('uncertain method cannot be treated as a signed fit',()=>{
 const r=run([receipt(quantityConfirm()),receipt(review({methodReview:'uncertain'}))]);
 assert.equal(st(r,'quantity').state,'unreviewed_candidate');
});
test('fabricated unsigned evidence cannot establish independent scientific review',()=>{
 const r=run([receipt(quantityConfirm()),receipt(review())]);
 assert.equal(r.independentScientificReviewApproved,false);
 assert.equal(r.signingKeyEnrollmentVerifiedByThisModule,false);
 assert.equal(r.replayProtectionRequiresExternalDurableLedger,true);
});
test('same exact session and evidence produce deterministic state fingerprint independent of receipt list order',()=>{
 const a=receipt(quantityConfirm()),b=receipt(review());
 const x=run([a,b]),y=run([b,a]);
 assert.equal(x.revisionFingerprint,y.revisionFingerprint);
 assert.deepEqual(x.requirements,y.requirements);
 assert.deepEqual(x.receiptAudits,y.receiptAudits);
});
test('tampered potential numeric fit is rejected rather than used as a ranking fact',()=>{
 const altered={...quantitative,potentialMatches:quantitative.potentialMatches.map(m=>({...m,potentialNumericFit:false}))};
 assert.throws(()=>run([receipt(quantityConfirm())],{quantitative:altered}),/tampered_phase167_potential_fit/);
});
test('cross-variant candidate match cannot borrow other variant measurement',()=>{
 const altered={...quantitative,potentialMatches:quantitative.potentialMatches.map(m=>({...m,variantId:'variant_b'}))};
 assert.throws(()=>run([],{quantitative:altered}),/tampered_phase167_research_match/);
});
test('signed source receipt does not override an absent Phase96 approval',()=>{
 const evidence=[{...qualitativeEvidence[0],approvals:[]}];
 const r=run([receipt(qualConfirm()),receipt(qualitativeReview())],{qualitativeEvidence:evidence});
 assert.equal(st(r,'qualitative').state,'qualitative_review_pending');
});
test('source evidence from a different use context cannot fulfil qualitative requirement',()=>{
 const f={...finding,context:{usage:'bedroom'}};
 const evidence=[{...qualitativeEvidence[0],findings:[f]}];
 const r=run([receipt(qualConfirm()),receipt(qualitativeReview())],{qualitativeEvidence:evidence});
 assert.equal(st(r,'qualitative').state,'qualitative_review_pending');
});
test('an adverse qualitative signed claim is flagged as concern, never fit',()=>{
 const adverse={...finding,polarity:'unfavourable' as const};
 const adjudicated={...approval,criterionImplication:'concerns' as const};
 const evidence=[{...qualitativeEvidence[0],findings:[adverse],approvals:[adjudicated]}];
 const r=run([receipt(qualConfirm()),receipt(qualitativeReview())],{qualitativeEvidence:evidence});
 assert.equal(st(r,'qualitative').state,'signed_qualitative_concern');
 assert.equal(r.exclusionsAuthorized,false);
});
