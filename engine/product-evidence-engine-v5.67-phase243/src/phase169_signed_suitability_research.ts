/** Phase 169: signed, version-bound research attestations; NEVER publication/ranking authority.
 * The trusted-key registry and replay ledger MUST be provided by protected server configuration,
 * never from a question, HTTP body, inferred actor or an AI model. A signature proves key control,
 * NOT human identity, original source authenticity, protocol quality or a lab result.
 */
import {createHash,createPublicKey,verify} from 'node:crypto';
import type {RequestOutput164} from './phase164_user_request_journey.js';
import {auditQuantifiedRequest166,type QuantityCandidate166} from './phase166_quantified_evidence_bridge.js';
import type {Preview167,CandidateMeasure167} from './phase167_source_variant_quantity_adapter.js';
import {planQualitativeNeedResearch168,type FacetMapping168,type UserConfirmation168,
 type Meaning168,type QualitativePlan168} from './phase168_qualitative_need_research_bridge.js';
import type {QuarantinedQualitativeFinding,ReviewEvidenceApproval} from './phase96_qualitative_review_evidence.js';

const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
const identifier=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,100}$/.test(s);
const hex=(s:unknown):s is string=>typeof s==='string'&&/^[0-9a-f]{64}$/.test(s);
const instant=(s:unknown):s is string=>{
 if(typeof s!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(s))return false;
 const parsed=Date.parse(s);
 return Number.isFinite(parsed)&&new Date(parsed).toISOString()===
  (s.includes('.')?s:s.replace('Z','.000Z'));
};
/** JSON wire canonicalization with domain separation. No exotic JS/undefined/NaN. */
function stable(x:unknown):string {
 if(x===null||typeof x==='string'||typeof x==='boolean')return JSON.stringify(x);
 if(typeof x==='number'&&Number.isFinite(x))return JSON.stringify(x);
 if(Array.isArray(x))return `[${x.map(stable).join(',')}]`;
 if(x&&typeof x==='object'&&Object.getPrototypeOf(x)===Object.prototype){
  const keys=Object.keys(x).sort();
  return `{${keys.map(k=>`${JSON.stringify(k)}:${stable((x as Record<string,unknown>)[k])}`).join(',')}}`;
 }
 throw Error('invalid_phase169_canonical_payload');
}
export interface TrustKey169 {
 keyId:string;actorId:string;role:'user_session_issuer'|'source_reviewer';
 /** Pinned by operator, OUTSIDE user-controlled inputs. */
 publicKeyPem:string;validFrom:string;validUntil:string;revoked:boolean;
 /** Reviewer cannot attest findings from other sources. */
 allowedSourceIds:readonly string[];
}
export interface UserAttestation169 {
 kind:'user_constraint';sessionId:string;sessionRevision:number;sessionEpoch:number;
 turnId:string;questionSha256:string;
 target:{kind:'qualitative';aspectId:string;meaning:Meaning168;exactPhrase:string;context:Record<string,string>}|
        {kind:'quantity';quantityId:string;exactPhrase:string};
}
export interface SourceAttestation169 {
 kind:'source_candidate';questionSha256:string;
 target:{kind:'quantity';candidateId:string;variantId:string;sourceId:string;
   documentSha256:string;spanSha256:string}|
  {kind:'qualitative';findingId:string;variantId:string;sourceId:string;
   sourceSha256:string;sourceSpanSha256:string};
 protocolReference:string;methodReview:'documented'|'uncertain'|'concern';
 variantReview:'documented'|'uncertain'|'concern';
 rightsReview:'documented'|'uncertain'|'concern';
}
export interface SignedReceipt169 {
 version:1;receiptId:string;keyId:string;actorId:string;
 issuedAt:string;expiresAt:string;
 payload:UserAttestation169|SourceAttestation169;
 /** Strict base64, Ed25519 signature of domain-separated canonical receipt without signature. */
 signature:string;
}
export function signingBytes169(receipt:Omit<SignedReceipt169,'signature'>):Buffer {
 return Buffer.from('PEE_PHASE169_SIGNED_RESEARCH_RECEIPT_V1\n'+stable(receipt),'utf8');
}
export interface ReceiptAudit169 {
 receiptId:string;kind:SignedReceipt169['payload']['kind'];keyId:string;
 signatureVerified:true;roleAuthorized:true;bindingVerified:true;
 humanIdentityIndependentlyVerified:false;sourceIndependenceEstablished:false;
 productionAuthority:false;
}
export type ResearchState169='pending_user_attestation'|'unresolved_requirement'|
 'awaiting_original_evidence'|'unreviewed_candidate'|'signed_candidate_fit'|
 'signed_candidate_concern'|'conflicting_candidates'|'qualitative_review_pending'|
 'signed_qualitative_candidate'|'signed_qualitative_concern'|'optional_not_required';
export interface RequirementState169 {
 id:string;kind:'quantity'|'qualitative';aspectOrQuantityId:string;
 proposedImportance:string;userAttestationVerified:boolean;
 variantId:string|null;state:ResearchState169;
 candidateReferences:readonly string[];signedSourceReceipts:readonly string[];
 missingChecks:readonly string[];
 eligibleForRanking:false;eligibleForExclusion:false;
}
export interface SuitabilityResearch169 {
 phase:169;revisionFingerprint:string;questionSha256:string;sessionId:string;
 receiptAudits:readonly ReceiptAudit169[];requirements:readonly RequirementState169[];
 qualitative:QualitativePlan168;
 sourceCandidateCount:number;researchObligations:readonly string[];
 replayProtectionRequiresExternalDurableLedger:true;
 signingKeyEnrollmentVerifiedByThisModule:false;
 confirmedHumanIdentity:false;independentScientificReviewApproved:false;
 rankingAuthorized:false;publicationAuthorized:false;exclusionsAuthorized:false;
}
interface VariantQualitativeEvidence169 {variantId:string;sourceIdByFinding:Readonly<Record<string,string>>;
 findings:readonly QuarantinedQualitativeFinding[];approvals:readonly ReviewEvidenceApproval[];}

export function planSignedSuitabilityResearch169(input:{
 question:string;request:RequestOutput164;facets:readonly FacetMapping168[];
 quantitative?:Preview167|null;qualitativeEvidence?:readonly VariantQualitativeEvidence169[];
 /** Signature verification is not safe if this is sourced from a user request. */
 trustedKeys:readonly TrustKey169[];receipts:readonly SignedReceipt169[];
 /** External operator-controlled durable accepted receipt IDs, not a client-provided list. */
 previouslyAcceptedReceiptIds:ReadonlySet<string>;
 /** Operator-controlled evaluation time, UTC. */now:string;
}):SuitabilityResearch169 {
 const {question,request,facets}=input;
 if(!request||request.phase!==164||typeof question!=='string'||question.length>4000||
  hash(question)!==request.requestSha256||request.turnId!==request.session.history.at(-1)?.turnId||
  !identifier(request.session.sessionId)||!Number.isSafeInteger(request.session.revision)||
  !Number.isSafeInteger(request.session.epoch)||!instant(input.now)||
  !Array.isArray(input.trustedKeys)||input.trustedKeys.length>100||
  !Array.isArray(input.receipts)||input.receipts.length>500||
  !(input.previouslyAcceptedReceiptIds instanceof Set)||
  new Set(input.trustedKeys.map(k=>k.keyId)).size!==input.trustedKeys.length||
  (input.quantitative&& (input.quantitative.phase!==167||input.quantitative.sourceQuestionSha256!==request.requestSha256||input.quantitative.productRankingAuthorized!==false)))
  throw Error('invalid_phase169_research_inputs');
 const q=auditQuantifiedRequest166(question);
 const candidates=input.quantitative?.candidateMeasures??[];
 const matches169=input.quantitative?.potentialMatches??[];
 const measureIndex=new Map(candidates.map(c=>[c.id,c]));
 const quantityIndex=new Map(q.candidates.map(c=>[c.id,c]));
 if(new Set(candidates.map(c=>c.id)).size!==candidates.length||
  new Set(matches169.map(m=>`${m.candidateMeasureId}:${m.quantityId}`)).size!==matches169.length)
  throw Error('duplicate_phase169_candidate_or_match');
 // Recompute comparative arithmetic. Never let a supplied research preview edit
 // the user's limits, negate a fit, or silently substitute another variant.
 for(const m of matches169){
  const c=measureIndex.get(m.candidateMeasureId),constraint=quantityIndex.get(m.quantityId);
  if(!c||!constraint||c.disposition!=='candidate_pending_scientific_review'||
   !c.productId||!c.variantId||!Number.isFinite(c.canonicalValue)||
   m.productId!==c.productId||m.variantId!==c.variantId||
   c.metric!==constraint.metric||c.canonicalUnit!==constraint.canonicalUnit||
   constraint.scope==='unresolved'||m.status!=='source_candidate_unapproved'||
   m.eligibleForRanking!==false||m.eligibleForExclusion!==false)
   throw Error('tampered_phase167_research_match');
  const value=c.canonicalValue!;
  const expected=constraint.direction==='strict_lt'?value<constraint.maximum!:
   constraint.direction==='lte'?value<=constraint.maximum!:
   constraint.direction==='strict_gt'?value>constraint.minimum!:
   constraint.direction==='gte'?value>=constraint.minimum!:
   constraint.direction==='range_inclusive'?value>=constraint.minimum!&&value<=constraint.maximum!:null;
  if(expected===null||m.potentialNumericFit!==expected)
   throw Error('tampered_phase167_potential_fit');
 }
 const qualitativeEvidence:readonly VariantQualitativeEvidence169[]=input.qualitativeEvidence??[];
 if(!Array.isArray(qualitativeEvidence)||qualitativeEvidence.length>40||
  new Set(qualitativeEvidence.map(v=>v.variantId)).size!==qualitativeEvidence.length||
  qualitativeEvidence.some(v=>!identifier(v.variantId)||!Array.isArray(v.findings)||!Array.isArray(v.approvals)||!v.sourceIdByFinding))
  throw Error('invalid_phase169_qualitative_evidence');
 const findings=new Map<string,{finding:QuarantinedQualitativeFinding;sourceId:string}>();
 for(const v of qualitativeEvidence)for(const f of v.findings){
  if(findings.has(f.findingId)||f.exactVariantId!==v.variantId||!identifier(v.sourceIdByFinding[f.findingId]))
   throw Error('invalid_phase169_qualitative_finding_binding');
  findings.set(f.findingId,{finding:f,sourceId:v.sourceIdByFinding[f.findingId]});
 }
 const receiptIds=new Set<string>(),userForAspect=new Map<string,SignedReceipt169>(),userForQuantity=new Map<string,SignedReceipt169>();
 const sourceForCandidate=new Map<string,SignedReceipt169>(),sourceForFinding=new Map<string,SignedReceipt169>();
 const audits:ReceiptAudit169[]=[];
 const byKey=new Map(input.trustedKeys.map(k=>[k.keyId,k]));
 for(const r of input.receipts){
  if(!r||r.version!==1||!identifier(r.receiptId)||receiptIds.has(r.receiptId)||
   input.previouslyAcceptedReceiptIds.has(r.receiptId)||!identifier(r.keyId)||!identifier(r.actorId)||
   !instant(r.issuedAt)||!instant(r.expiresAt)||Date.parse(r.issuedAt)>Date.parse(input.now)||
   Date.parse(r.expiresAt)<=Date.parse(input.now)||Date.parse(r.expiresAt)<=Date.parse(r.issuedAt)||
   typeof r.signature!=='string'||!/^[A-Za-z0-9+/]{86}==$/.test(r.signature))
   throw Error('invalid_or_replayed_phase169_receipt');
  const k=byKey.get(r.keyId);
  if(!k||k.revoked||k.actorId!==r.actorId||!instant(k.validFrom)||!instant(k.validUntil)||
   Date.parse(r.issuedAt)<Date.parse(k.validFrom)||Date.parse(input.now)>=Date.parse(k.validUntil)||
   Date.parse(r.issuedAt)>=Date.parse(k.validUntil)||
   !Array.isArray(k.allowedSourceIds)||!k.allowedSourceIds.every(identifier))
   throw Error('phase169_untrusted_or_expired_signer');
  const p=r.payload;
  if(!p||!['user_constraint','source_candidate'].includes(p.kind)||
   k.role!==(p.kind==='user_constraint'?'user_session_issuer':'source_reviewer'))
   throw Error('phase169_wrong_signer_role');
  let key;
  try {key=createPublicKey(k.publicKeyPem);} catch {throw Error('phase169_invalid_pinned_public_key');}
  if(key.asymmetricKeyType!=='ed25519'||!verify(null,signingBytes169({version:1,receiptId:r.receiptId,
   keyId:r.keyId,actorId:r.actorId,issuedAt:r.issuedAt,expiresAt:r.expiresAt,payload:p}),key,Buffer.from(r.signature,'base64')))
   throw Error('phase169_bad_receipt_signature');
  if(p.questionSha256!==request.requestSha256)throw Error('phase169_wrong_question');
  if(p.kind==='user_constraint'){
   if(p.sessionId!==request.session.sessionId||p.sessionRevision!==request.session.revision||
    p.sessionEpoch!==request.session.epoch||p.turnId!==request.turnId)
    throw Error('phase169_stale_or_cross_session_receipt');
   if(p.target.kind==='quantity'){
    const target=q.candidates.find(x=>x.id===p.target.quantityId&&x.span.literal===p.target.exactPhrase);
    if(!target||target.scope==='unresolved'||userForQuantity.has(target.id))throw Error('phase169_invalid_quantity_confirmation');
    userForQuantity.set(target.id,r);
   }else if(p.target.kind==='qualitative'){
    const occur=request.contextAudit165?.occurrences??[];
    if(!identifier(p.target.aspectId)||!['required','excluded','preferred','optional'].includes(p.target.meaning)||
     !occur.some(o=>o.aspectId===p.target.aspectId&&o.literal===p.target.exactPhrase&&o.proposedMeaning===p.target.meaning)||
     !p.target.context||Array.isArray(p.target.context)||
     Object.entries(p.target.context).length===0||Object.entries(p.target.context).length>8||
     !Object.entries(p.target.context).every(([a,b])=>identifier(a)&&typeof b==='string'&&b.length>0&&b.length<=100)||
     userForAspect.has(p.target.aspectId))throw Error('phase169_invalid_qualitative_confirmation');
    userForAspect.set(p.target.aspectId,r);
   }else throw Error('phase169_invalid_user_target');
  }else {
   if(!identifier(p.protocolReference)||!['documented','uncertain','concern'].includes(p.methodReview)||
    !['documented','uncertain','concern'].includes(p.variantReview)||
    !['documented','uncertain','concern'].includes(p.rightsReview)||
    !k.allowedSourceIds.includes(p.target.sourceId))throw Error('phase169_unscoped_source_receipt');
   if(p.target.kind==='quantity'){
    const c=candidates.find(x=>x.id===p.target.candidateId);
    if(!c||c.disposition!=='candidate_pending_scientific_review'||
     c.sourceId!==p.target.sourceId||c.variantId!==p.target.variantId||
     c.documentSha256!==p.target.documentSha256||c.quantitySpan.sha256!==p.target.spanSha256||
     sourceForCandidate.has(c.id))throw Error('phase169_unmatched_quantity_evidence');
    sourceForCandidate.set(c.id,r);
   }else if(p.target.kind==='qualitative'){
    const f=findings.get(p.target.findingId);
    if(!f||f.finding.exactVariantId!==p.target.variantId||f.sourceId!==p.target.sourceId||
     f.finding.sourceSha256!==p.target.sourceSha256||
     f.finding.sourceSpanSha256!==p.target.sourceSpanSha256||sourceForFinding.has(p.target.findingId))
     throw Error('phase169_unmatched_qualitative_evidence');
    sourceForFinding.set(p.target.findingId,r);
   }else throw Error('phase169_invalid_source_target');
  }
  receiptIds.add(r.receiptId);
  audits.push({receiptId:r.receiptId,kind:p.kind,keyId:r.keyId,signatureVerified:true,
   roleAuthorized:true,bindingVerified:true,humanIdentityIndependentlyVerified:false,
   sourceIndependenceEstablished:false,productionAuthority:false});
 }
 // Phase168 remains documentary: signed session receipts provide traceability of a
 // confirmation event, but are not proof of the user being independently authenticated.
 const confirmations:UserConfirmation168[]=[...userForAspect.values()].map(r=>{
  const p=r.payload as UserAttestation169;const t=p.target as Extract<UserAttestation169['target'],{kind:'qualitative'}>;
  return {confirmationId:r.receiptId,turnId:p.turnId,questionSha256:p.questionSha256,
   aspectId:t.aspectId,meaning:t.meaning,exactUserPhrase:t.exactPhrase,
   confirmationEventReference:`signed_receipt_${r.receiptId}`,confirmedContext:t.context};
 });
 const qual=planQualitativeNeedResearch168({question,request,facets,confirmations,
  variantEvidence:qualitativeEvidence.map(v=>({variantId:v.variantId,findings:v.findings,approvals:v.approvals}))});
 const variants=new Set<string>([...qualitativeEvidence.map(v=>v.variantId),...candidates.flatMap(c=>c.variantId?[c.variantId]:[])]);
 const state:RequirementState169[]=[];
 const obligations=new Set<string>(qual.researchObligations);
 for(const x of q.candidates){
  const accepted=userForQuantity.has(x.id)&&x.scope!=='unresolved';
  for(const variantId of variants.size?[...variants].sort():[null]){
   const matches=(input.quantitative?.potentialMatches??[]).filter(m=>m.quantityId===x.id&&m.variantId===variantId);
   const reviewed=matches.filter(m=>{
    const receipt=sourceForCandidate.get(m.candidateMeasureId);
    const p=receipt?.payload as SourceAttestation169|undefined;
    return !!p&&p.methodReview==='documented'&&p.variantReview==='documented'&&p.rightsReview==='documented';
   });
   const opinions=[...new Set(reviewed.map(m=>m.potentialNumericFit))];
   let result:ResearchState169;
   if(x.scope==='unresolved')result='unresolved_requirement';
   else if(!accepted)result='pending_user_attestation';
   else if(!matches.length)result='awaiting_original_evidence';
   else if(!reviewed.length)result='unreviewed_candidate';
   else if(opinions.includes(true)&&opinions.includes(false))result='conflicting_candidates';
   else if(opinions.length===1&&opinions[0]===true)result='signed_candidate_fit';
   else if(opinions.length===1&&opinions[0]===false)result='signed_candidate_concern';
   else result='unreviewed_candidate';
   const refs=reviewed.map(m=>sourceForCandidate.get(m.candidateMeasureId)!.receiptId).sort();
   const missing=[...(!accepted?['verify_user_confirmation']:[]),
    ...(!matches.length?['obtain_original_test_for_exact_variant']:[]),
    ...(matches.length&&!reviewed.length?['adjudicate_original_source_method_rights_and_identity']:[]),
    'independently_authenticate_evidence_and_protocol_before_any_rank'];
   state.push({id:`q169_${x.id}_${variantId??'global'}`,kind:'quantity',aspectOrQuantityId:x.id,
    proposedImportance:x.scope,userAttestationVerified:accepted,variantId,state:result,
    candidateReferences:matches.map(m=>m.candidateMeasureId).sort(),signedSourceReceipts:refs,
    missingChecks:missing,eligibleForRanking:false,eligibleForExclusion:false});
   for(const item of missing)obligations.add(`${item}_${x.id}_${variantId??'global'}`);
  }
 }
 for(const x of qual.requirements){
  for(const variantId of variants.size?[...variants].sort():[null]){
   const reviewed=(qualitativeEvidence.find(v=>v.variantId===variantId)?.findings??([] as readonly QuarantinedQualitativeFinding[]))
    .filter((f:QuarantinedQualitativeFinding)=>x.criterionId===f.criterionId&&sourceForFinding.has(f.findingId))
    .filter((f:QuarantinedQualitativeFinding)=>{
     const a=sourceForFinding.get(f.findingId)!.payload as SourceAttestation169;
     return a.methodReview==='documented'&&a.variantReview==='documented'&&a.rightsReview==='documented';
    });
   const assessment=qual.variantPreviews.find(v=>v.variantId===variantId)?.assessments
    .find(a=>a.criterionId===x.criterionId);
   const reviewedRelevant=reviewed.filter((f:QuarantinedQualitativeFinding)=>
    !!assessment&&(assessment.supportingFindingIds.includes(f.findingId)||
     assessment.contrastingFindingIds.includes(f.findingId)));
   let result:ResearchState169='qualitative_review_pending';
   if(x.proposedMeaning==='optional')result='optional_not_required';
   else if(!x.proposedMeaning||x.status==='ambiguous_user_scope'||x.status==='unmapped_reviewed_facet'||x.status==='unresolved_excluded_performance')result='unresolved_requirement';
   else if(!x.userConfirmationDocumented)result='pending_user_attestation';
   else if(x.status==='qualitative_test_research'&&reviewedRelevant.length&&assessment){
    if(assessment.status==='conflicting_evidence')result='conflicting_candidates';
    else if(assessment.status==='potential_essential_constraint_conflict'||
     assessment.status==='contextual_concern')result='signed_qualitative_concern';
    else if(['contextual_support','contextual_tradeoff'].includes(assessment.status))
     result='signed_qualitative_candidate';
   }
   const missing=['independently_authenticate_evidence_and_protocol_before_any_rank',
    ...(reviewedRelevant.length?[]:['obtain_original_qualitative_test_review_for_exact_variant']),
    ...(reviewed.length&&!reviewedRelevant.length?['resolve_method_context_and_phase96_adjudication']:[])];
   state.push({id:`qual169_${x.aspectId}_${variantId??'global'}`,kind:'qualitative',
    aspectOrQuantityId:x.aspectId,proposedImportance:x.proposedMeaning??'ambiguous',
    userAttestationVerified:userForAspect.has(x.aspectId),variantId,state:result,
    candidateReferences:reviewedRelevant.map((f:QuarantinedQualitativeFinding)=>f.findingId).sort(),
    signedSourceReceipts:reviewedRelevant.map((f:QuarantinedQualitativeFinding)=>sourceForFinding.get(f.findingId)!.receiptId).sort(),
    missingChecks:missing,eligibleForRanking:false,eligibleForExclusion:false});
   for(const item of missing)obligations.add(`${item}_${x.aspectId}_${variantId??'global'}`);
  }
 }
 return {phase:169,revisionFingerprint:hash(stable({sessionId:request.session.sessionId,
   revision:request.session.revision,epoch:request.session.epoch,turnId:request.turnId,
   questionSha256:request.requestSha256})),questionSha256:request.requestSha256,
  sessionId:request.session.sessionId,receiptAudits:audits.sort((a,b)=>a.receiptId.localeCompare(b.receiptId)),
  requirements:state.sort((a,b)=>a.id.localeCompare(b.id)),qualitative:qual,
  sourceCandidateCount:candidates.length,researchObligations:[...obligations].sort(),
  replayProtectionRequiresExternalDurableLedger:true,signingKeyEnrollmentVerifiedByThisModule:false,
  confirmedHumanIdentity:false,independentScientificReviewApproved:false,
  rankingAuthorized:false,publicationAuthorized:false,exclusionsAuthorized:false};
}
