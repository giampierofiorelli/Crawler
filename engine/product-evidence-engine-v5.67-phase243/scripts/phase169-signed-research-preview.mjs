/** Synthetic diagnostic ONLY: keys are generated in-memory for a single demo.
 * NEVER treat these as enrolled accounts, authentic users, real reviews or rankings.
 */
import {createHash,generateKeyPairSync,sign} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {advanceUserRequest164,newRequestSession164} from '../dist/src/phase164_user_request_journey.js';
import {previewOriginalReviewMeasures167} from '../dist/src/phase167_source_variant_quantity_adapter.js';
import {auditQuantifiedRequest166} from '../dist/src/phase166_quantified_evidence_bridge.js';
import {planSignedSuitabilityResearch169,signingBytes169} from '../dist/src/phase169_signed_suitability_research.js';
const sha=t=>createHash('sha256').update(t).digest('hex');
const q='Best coffee machine must have quiet and width under 35 cm';
const brain={categoryId:'coffee_machine',schemaVersion:1,aliases:['coffee machine'],
 sources:[{id:'demo_source',url:'https://example.org/synthetic',title:'Constructed',originalDocumentId:'demo_doc',role:'original_expert_method'}],
 concepts:[{id:'quiet_operation',kind:'capability',label:'quiet operation',aliases:['quiet'],
 evidenceKeys:['synthetic_quality'],state:'reviewed_definition',review:{reviewId:'demo_schema',
 reviewerId:'synthetic',reviewScope:'category_definition',sourceRefIds:['demo_source']}}],quality:[],distinctions:[]};
const request=advanceUserRequest164(newRequestSession164('demo_session'),{
 turnId:'demo_turn',question:q,language:'en',brains:[brain]});
const text='The Aster coffee machine measured 31 cm in width.';
const reader={document:{text,sha256:sha(text),source:{id:'demo_source',
 originalDocumentId:'demo_doc',url:'https://example.org/synthetic',title:'Constructed',role:'original_product_test'}},
 pageIdentity:{reviewedProductId:'machine_a',reviewedVariantId:'variant_a',reviewedAliases:['Aster coffee machine']}};
const preview=previewOriginalReviewMeasures167({request,question:q,products:['machine_a'],sources:[{reader,
 binding:{productId:'machine_a',variantId:'variant_a',sourceId:'demo_source',originalDocumentId:'demo_doc',
 documentSha256:sha(text),reviewedAliases:['Aster coffee machine'],identityIndependentlyAuthenticated:false,
 sourceIndependentlyAuthenticated:false}}]});
const facets=[{categoryId:'coffee_machine',aspectId:'quiet_operation',criterionId:'acoustic_quality',
 evidenceSemantics:'performance_quality',categoryReviewReference:'synthetic_mapping'}];
const now='2026-10-12T12:00:00.000Z',issued='2026-10-12T11:00:00.000Z',expires='2026-10-13T11:00:00.000Z';
const userKeys=generateKeyPairSync('ed25519'),sourceKeys=generateKeyPairSync('ed25519');
const trustKeys=[{keyId:'demo_user',actorId:'demo_gateway',role:'user_session_issuer',
 publicKeyPem:userKeys.publicKey.export({format:'pem',type:'spki'}).toString(),
 validFrom:'2026-10-01T00:00:00.000Z',validUntil:'2026-11-01T00:00:00.000Z',revoked:false,allowedSourceIds:[]},
 {keyId:'demo_reviewer',actorId:'demo_researcher',role:'source_reviewer',
 publicKeyPem:sourceKeys.publicKey.export({format:'pem',type:'spki'}).toString(),
 validFrom:'2026-10-01T00:00:00.000Z',validUntil:'2026-11-01T00:00:00.000Z',revoked:false,
 allowedSourceIds:['demo_source']}];
let n=0;
const make=payload=>{
 const user=payload.kind==='user_constraint';const unsigned={version:1,receiptId:'demo_receipt_'+(++n),
 keyId:user?'demo_user':'demo_reviewer',actorId:user?'demo_gateway':'demo_researcher',
 issuedAt:issued,expiresAt:expires,payload};
 return {...unsigned,signature:sign(null,signingBytes169(unsigned),user?userKeys.privateKey:sourceKeys.privateKey).toString('base64')};
};
const confirmedUser={kind:'user_constraint',sessionId:request.session.sessionId,
 sessionRevision:request.session.revision,sessionEpoch:request.session.epoch,turnId:request.turnId,
 questionSha256:request.requestSha256,target:{kind:'quantity',quantityId:auditQuantifiedRequest166(q).candidates[0].id,
 exactPhrase:auditQuantifiedRequest166(q).candidates[0].span.literal}};
const c=preview.candidateMeasures.find(x=>x.disposition==='candidate_pending_scientific_review');
const reviewedSource={kind:'source_candidate',questionSha256:request.requestSha256,
 target:{kind:'quantity',candidateId:c.id,variantId:c.variantId,sourceId:c.sourceId,
 documentSha256:c.documentSha256,spanSha256:c.quantitySpan.sha256},protocolReference:'synthetic_protocol',
 methodReview:'documented',variantReview:'documented',rightsReview:'documented'};
const state=planSignedSuitabilityResearch169({question:q,request,facets,quantitative:preview,
 trustedKeys:trustKeys,receipts:[make(confirmedUser),make(reviewedSource)],
 previouslyAcceptedReceiptIds:new Set(),now});
const output={kind:'constructed_synthetic_diagnostic_not_real_review_or_verified_user',
 question:q,sourceText:text,
 researchStates:state.requirements.map(({id,kind,variantId,state,userAttestationVerified,
  candidateReferences,missingChecks,eligibleForRanking,eligibleForExclusion})=>({id,kind,variantId,
  state,userAttestationVerified,candidateReferences,missingChecks,eligibleForRanking,eligibleForExclusion})),
 receiptIds:state.receiptAudits.map(x=>x.receiptId),
 sourceCandidateCount:state.sourceCandidateCount,rankingAuthorized:state.rankingAuthorized,
 publicationAuthorized:state.publicationAuthorized,confirmedHumanIdentity:state.confirmedHumanIdentity,
 independentScientificReviewApproved:state.independentScientificReviewApproved,
 note:'Demo signs with disposable in-memory keys; no production identity/key enrollment or source authenticity established.'};
mkdirSync('evaluation/phase169',{recursive:true});
writeFileSync('evaluation/phase169/PHASE169-CONSTRUCTED-SIGNED-RESEARCH.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({states:output.researchStates.map(x=>x.state),receipts:output.receiptIds.length,
 rankingAuthorized:output.rankingAuthorized},null,2));
