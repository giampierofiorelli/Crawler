/** Phase200: bounded, offline cryptographic CUSTODY and reviewer-attestation gate.
 * Never claims that an HTTPS document, registry or product outcome is *true*.
 * Only a separately configured, trusted capture service can attest its own TLS
 * collection; third party claims still require independent validation.
 * Neither evidence text nor private keys are serialized by this module.
 * This stages research disclosures; it NEVER authorizes live-site publication.
 */
import {createHash,createPublicKey,verify as cryptoVerify} from 'node:crypto';
import {buildSpecialistTrustPresentation199,fingerprintTrustPresentation199,
 type TrustPresentationRequest199,type TrustCard199,type TrustPresentation199}
 from './phase199_specialist_trust_presentation.js';
import {lookupScreening193,type ScreeningLedger193,type SourceRevision193}
 from './phase193_screening_memory.js';

export type Role200='controlled_capture'|'source_custody_reviewer'|'scope_and_conflict_reviewer'|'release_status_authority';
export interface Anchor200 {keyId:string;principalId:string;role:Role200;publicKeyPem:string;activeFrom:string;activeThrough:string;}
/** Deployed anchors must come from independently managed privileged configuration.
 * Never load them from the publisher page, the claim dossier or a search result. */
export interface TrustAnchorPolicy200 {policyId:string;anchors:readonly Anchor200[];maximumCaptureAgeDays:number;maximumStatusAgeDays:number;}
export type CaptureKind200='issuer_primary_registry'|'publisher_original_document';
export interface CaptureClaim200 {
 schema:'pee200.capture.v1'; evidenceId:string;kind:CaptureKind200;
 sourceUrl:string;documentVersionId:string;variantId:string;
 sha256FullDocument:string;capturedAt:string; originCheck:'tls_origin_checked_by_controlled_fetcher';
 /** Collection is through a privileged capture service; not a user-provided excerpt. */
 sourceContentType:'text/html'|'application/pdf'|'application/json';
}
export interface Signed200<T> {payload:T;keyId:string;signatureBase64Url:string;}
export interface SourceCustody200 {claim:Signed200<CaptureClaim200>; transientCompleteDocument:Uint8Array;}
export interface ApprovalClaim200 {
 schema:'pee200.approval.v1';evidenceId:string;claimBindingSha256:string;presentationHash:string;
 variantId:string;criterionId:string;sourceVersionId:string;approvedAt:string;
 role:'source_custody_reviewer'|'scope_and_conflict_reviewer';
 /** Each signatory attests review within their own domain; a signed claim is
  * not automatically a correct claim about independent real-world facts. */
 decision:'checked_and_supported';
}
export interface ReleaseStatus200 {
 schema:'pee200.status.v1';policyId:string;checkedThrough:string;
 /** Status input must come from trusted authority; not from evidence submitter. */
 revokedClaimBindingSha256:readonly string[];
}
export interface EvidencePacket200 {
 evidenceId:string;capture:SourceCustody200;
 reviewerApprovals:readonly Signed200<ApprovalClaim200>[];
}
export interface StageRequest200 {
 phase199:TrustPresentationRequest199;
 evidencePackets:readonly EvidencePacket200[];
 /** Signed up-to-date release-status snapshot; never trust empty caller revocation list. */
 signedReleaseStatus:Signed200<ReleaseStatus200>;
 policy:TrustAnchorPolicy200;
 /** Optional prior reviewed screening decisions: a reused discovery-only or derived
  * source must not gain original-outcome status from a new signature alone. */
 screeningMemory?:{ledger:ScreeningLedger193;revisions:readonly SourceRevision193[]};
}
export type Hold200='no_matching_phase199_disclosure'|'missing_source_capture'|'invalid_capture_signature'|
 'document_digest_mismatch'|'capture_scope_mismatch'|'source_capture_expired'|'missing_registry_origin'|
 'missing_independent_review'|'invalid_approval_signature'|'approval_scope_mismatch'|
 'approval_after_evaluation'|'rejected_revoked'|'untrusted_release_status'|'release_status_expired'|
 'previous_review_limits_originality';
export interface GateHold200 {evidenceId:string;reason:Hold200;}
export interface StagedCard200 {card:TrustCard199;captureHash:string;claimBindingHash:string;
 signerKeyIds:readonly string[];custodyAuthenticatedByDeploymentKeys:true;
 /** Even a signed capture cannot independently prove product quality. */
 productOutcomeIndependentlyVerifiedByPEE:false;}
export interface GateDecision200 {
 schema:'200.1';state:'privileged_staging_only';asOf:string;policyId:string;
 stageCards:readonly StagedCard200[];held:readonly GateHold200[];
 underlyingPresentation:TrustPresentation199;
 /** No public trust mark or product certificate issued. */
 livePublishingAuthorized:false;thirdPartyMarkAuthorized:false;rankingChanged:false;
 sourceBodiesPersisted:false;reviewerIdentitiesIndependentlyProvenByPEE:false;
 actualIssuerClaimsValidatedByRuntime:false;revalidationOnPublisherChangeRequired:true;
}
const ident=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(s);
const date=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&
 !Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const hex=(s:unknown):s is string=>typeof s==='string'&&/^[0-9a-f]{64}$/.test(s);
const validUrl=(s:unknown):s is string=>typeof s==='string'&&s.length<=2048&&
 (()=>{try{const x=new URL(s);return x.protocol==='https:'&&!x.username&&!x.password&&!x.hash&&
 x.hostname!== 'localhost'&&!x.hostname.endsWith('.local')&&x.port===''&&
 !['127.0.0.1','0.0.0.0','[::1]'].includes(x.hostname)&&x.hostname.includes('.');}
 catch{return false;}})();
const unique=(a:readonly string[])=>a.length===new Set(a).size;
const digest=(x:Uint8Array|string)=>createHash('sha256').update(x).digest('hex');
const days=(a:string,b:string)=>(Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000;
const fail=(code:string):never=>{throw Error('phase200_'+code);};
const validSign=(s:unknown):s is string=>typeof s==='string'&&/^[A-Za-z0-9_-]{86}$/.test(s);
/** Fixed ordered object keys supplied by trusted application code, not loose JSON. */
export function captureMessage200(c:CaptureClaim200):string{
 return JSON.stringify([c.schema,c.evidenceId,c.kind,c.sourceUrl,c.documentVersionId,c.variantId,
  c.sha256FullDocument,c.capturedAt,c.originCheck,c.sourceContentType]);
}
export function approvalMessage200(c:ApprovalClaim200):string{
 return JSON.stringify([c.schema,c.evidenceId,c.claimBindingSha256,c.presentationHash,c.variantId,
  c.criterionId,c.sourceVersionId,c.approvedAt,c.role,c.decision]);
}
export function statusMessage200(c:ReleaseStatus200):string{
 return JSON.stringify([c.schema,c.policyId,c.checkedThrough,c.revokedClaimBindingSha256]);
}
/** A binding prevents a valid approval for one card/version being reused for another. */
export function claimBinding200(card:TrustCard199,capture:CaptureClaim200,presentation:TrustPresentation199):string{
 return digest(JSON.stringify(['pee200.binding.v1',presentation.productId,presentation.variantId,
 presentation.goalScopeHash,card.criterionId,card.disciplineId,card.outcomeId,
 card.kind,card.eventGroupId,capture.evidenceId,capture.sourceUrl,capture.documentVersionId,
 capture.sha256FullDocument,capture.capturedAt]));
}
function validatePolicy(p:TrustAnchorPolicy200):Map<string,Anchor200>{
 if(!p||!ident(p.policyId)||!Number.isInteger(p.maximumCaptureAgeDays)||
  p.maximumCaptureAgeDays<1||p.maximumCaptureAgeDays>365||
  !Number.isInteger(p.maximumStatusAgeDays)||p.maximumStatusAgeDays<0||p.maximumStatusAgeDays>30||
  !Array.isArray(p.anchors)||p.anchors.length>50||!unique(p.anchors.map(a=>a.keyId)))fail('policy');
 const byId=new Map<string,Anchor200>();
 const publicKeyFingerprints=new Set<string>();
 for(const a of p.anchors){
  if(!ident(a.keyId)||!ident(a.principalId)||!date(a.activeFrom)||!date(a.activeThrough)||
   a.activeThrough<a.activeFrom||!['controlled_capture','source_custody_reviewer',
   'scope_and_conflict_reviewer','release_status_authority'].includes(a.role)||
   typeof a.publicKeyPem!=='string'||a.publicKeyPem.length>3000)fail('anchor');
  try{const k=createPublicKey(a.publicKeyPem);if(k.asymmetricKeyType!=='ed25519')fail('key_type');
   const fingerprint=digest(k.export({format:'der',type:'spki'}) as Buffer);
   if(publicKeyFingerprints.has(fingerprint))fail('duplicate_public_key');
   publicKeyFingerprints.add(fingerprint);
  }catch(e){if(e instanceof Error&&e.message==='phase200_duplicate_public_key')throw e;
   fail('key');}
  byId.set(a.keyId,a);
 }
 return byId;
}
function validateCapture(c:CaptureClaim200):boolean{
 return !!c&&c.schema==='pee200.capture.v1'&&ident(c.evidenceId)&&
  ['issuer_primary_registry','publisher_original_document'].includes(c.kind)&&
  validUrl(c.sourceUrl)&&ident(c.documentVersionId)&&ident(c.variantId)&&hex(c.sha256FullDocument)&&
  date(c.capturedAt)&&c.originCheck==='tls_origin_checked_by_controlled_fetcher'&&
  ['text/html','application/pdf','application/json'].includes(c.sourceContentType);
}
function validateApproval(a:ApprovalClaim200):boolean{
 return !!a&&a.schema==='pee200.approval.v1'&&ident(a.evidenceId)&&hex(a.claimBindingSha256)&&
  hex(a.presentationHash)&&ident(a.variantId)&&ident(a.criterionId)&&ident(a.sourceVersionId)&&
  date(a.approvedAt)&&['source_custody_reviewer','scope_and_conflict_reviewer'].includes(a.role)&&
  a.decision==='checked_and_supported';
}
function signedValid200<T>(s:Signed200<T>,role:Role200,asOf:string,
 anchors:Map<string,Anchor200>,msg:string):boolean{
 if(!s||!ident(s.keyId)||!validSign(s.signatureBase64Url))return false;
 const k=anchors.get(s.keyId);
 if(!k||k.role!==role||k.activeFrom>asOf||k.activeThrough<asOf)return false;
 try{return cryptoVerify(null,Buffer.from(msg),createPublicKey(k.publicKeyPem),
  Buffer.from(s.signatureBase64Url,'base64url'));}catch{return false;}
}
function validStatus200(s:ReleaseStatus200,policyId:string,asOf:string,maxDays:number):boolean{
 return !!s&&s.schema==='pee200.status.v1'&&s.policyId===policyId&&date(s.checkedThrough)&&
 s.checkedThrough<=asOf&&days(s.checkedThrough,asOf)<=maxDays&&
 Array.isArray(s.revokedClaimBindingSha256)&&s.revokedClaimBindingSha256.length<=10000&&
 s.revokedClaimBindingSha256.every(hex)&&unique(s.revokedClaimBindingSha256)&&
 [...s.revokedClaimBindingSha256].sort().every((v,i)=>v===s.revokedClaimBindingSha256[i]);
}
/** Offline decision: the application must receive evidence from independent
 * controlled-capture and human-review systems; a caller-supplied private key or
 * trust policy is not itself a production security boundary. */
export function stageSpecialistTrust200(req:StageRequest200):GateDecision200{
 const anchors=validatePolicy(req.policy);
 const preview=buildSpecialistTrustPresentation199(req.phase199);
 const asOf=preview.asOf;
 const hash=fingerprintTrustPresentation199(preview);
 const packets=req.evidencePackets;
 if(!Array.isArray(packets)||packets.length>500||!unique(packets.map(p=>p.evidenceId)))fail('packets');
 const status=req.signedReleaseStatus;
 const statusValid=validStatus200(status?.payload,req.policy.policyId,asOf,req.policy.maximumStatusAgeDays)&&
  signedValid200(status,'release_status_authority',status.payload.checkedThrough,anchors,
   statusMessage200(status.payload));
 const holds:GateHold200[]=[];
 const stageCards:StagedCard200[]=[];
 const byId=new Map(packets.map(p=>[p.evidenceId,p]));
 for(const card of preview.cards){
  // Phase199 groups duplicate tests. Only the representative source is signed.
  const evidenceId=card.evidenceIds.find(e=>req.phase199.dossiers.some(d=>
   d.evidenceId===e&&d.sourceUrl===card.sourceUrl&&d.documentVersionId===card.sourceVersionId))??card.evidenceIds[0];
  const pkt=byId.get(evidenceId),d=req.phase199.dossiers.find(d=>d.evidenceId===evidenceId);
  let reason:Hold200|null=null;let binding='';
  if(!statusValid)reason='untrusted_release_status';
  else if(!pkt||!d)reason='missing_source_capture';
  else {
   const c=pkt.capture?.claim?.payload;
   const raw=pkt.capture?.transientCompleteDocument;
   if(!validateCapture(c)||!raw||!(raw instanceof Uint8Array)||raw.byteLength===0||raw.byteLength>20_000_000)
    reason='capture_scope_mismatch';
   else if(c.evidenceId!==evidenceId||c.variantId!==preview.variantId||c.sourceUrl!==card.sourceUrl||
    c.documentVersionId!==card.sourceVersionId||c.sha256FullDocument!==d.publisherDocumentSha256)
    reason='capture_scope_mismatch';
   else if(c.kind!==(card.kind==='expert_practical_test'?'publisher_original_document':'issuer_primary_registry'))
    reason='missing_registry_origin';
   else if(digest(raw)!==c.sha256FullDocument)reason='document_digest_mismatch';
   else if(req.screeningMemory){
    const versions=req.screeningMemory.revisions.filter(x=>x.sourceId===d.sourceRecordId&&
     x.url===c.sourceUrl&&x.contentHash===c.sha256FullDocument&&
     x.contentBasis==='publisher_bytes'&&x.variantId===c.variantId&&x.field===card.criterionId);
    // Screening-memory absence never invents a negative finding; it also
    // never upgrades a claim to independently measured proof.
    if(versions.some(v=>{const l=lookupScreening193(req.screeningMemory!.ledger,v,'field');
     return l.verdict==='reuse_screening_decision'&&l.reused!==null&&
      ['discovery_only','contextual_research_only','provisional_specification_only'].includes(l.reused.action);}))
      reason='previous_review_limits_originality';
   }
   if(!reason&&(c.capturedAt>asOf||days(c.capturedAt,asOf)>req.policy.maximumCaptureAgeDays))
    reason='source_capture_expired';
   else if(!reason&&!signedValid200(pkt.capture.claim,'controlled_capture',c.capturedAt,anchors,captureMessage200(c)))
    reason='invalid_capture_signature';
   else if(!reason) {

    binding=claimBinding200(card,c,preview);
    if(status.payload.revokedClaimBindingSha256.includes(binding))reason='rejected_revoked';
    else {
     const approvals=pkt.reviewerApprovals;
     if(!Array.isArray(approvals)||approvals.length!==2)reason='missing_independent_review';
     else {
      const roles=new Set<Role200>(),people=new Set<string>(),keys=new Set<string>();
      for(const signed of approvals){
       const a=signed?.payload;
       if(!validateApproval(a)||a.evidenceId!==evidenceId||a.claimBindingSha256!==binding||
        a.presentationHash!==hash||a.variantId!==preview.variantId||a.criterionId!==card.criterionId||
        a.sourceVersionId!==card.sourceVersionId){reason='approval_scope_mismatch';break;}
       if(a.approvedAt<c.capturedAt||a.approvedAt>asOf){reason='approval_after_evaluation';break;}
       if(!signedValid200(signed,a.role,a.approvedAt,anchors,approvalMessage200(a))){
        reason='invalid_approval_signature';break;}
       const anchor=anchors.get(signed.keyId)!;
       roles.add(a.role);people.add(anchor.principalId);keys.add(anchor.keyId);
      }
      if(!reason&&(roles.size!==2||people.size!==2||keys.size!==2))reason='missing_independent_review';
      if(!reason)stageCards.push({card,captureHash:c.sha256FullDocument,claimBindingHash:binding,
       signerKeyIds:[...keys].sort(),custodyAuthenticatedByDeploymentKeys:true,
       productOutcomeIndependentlyVerifiedByPEE:false});
     }
    }
   }
  }
  if(reason)holds.push({evidenceId,reason});
 }
 for(const packet of packets){
  if(!preview.cards.some(c=>c.evidenceIds.includes(packet.evidenceId)))
   holds.push({evidenceId:packet.evidenceId,reason:'no_matching_phase199_disclosure'});
 }
 stageCards.sort((a,b)=>a.card.criterionId.localeCompare(b.card.criterionId)||
  a.card.eventGroupId.localeCompare(b.card.eventGroupId));
 holds.sort((a,b)=>a.evidenceId.localeCompare(b.evidenceId)||a.reason.localeCompare(b.reason));
 return {schema:'200.1',state:'privileged_staging_only',asOf,policyId:req.policy.policyId,
  stageCards,held:holds,underlyingPresentation:preview,livePublishingAuthorized:false,
  thirdPartyMarkAuthorized:false,rankingChanged:false,sourceBodiesPersisted:false,
  reviewerIdentitiesIndependentlyProvenByPEE:false,actualIssuerClaimsValidatedByRuntime:false,
  revalidationOnPublisherChangeRequired:true};
}
