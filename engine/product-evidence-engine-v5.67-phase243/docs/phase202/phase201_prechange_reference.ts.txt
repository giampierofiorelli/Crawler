/** Phase201: rights-checked transient complete-byte capture for Phase200 custody.
 * This is a PRIVILEGED RESEARCH adapter to Phase69, not a new crawler and not
 * an independent issuer identity verifier. Only the built-in HTTPS transport
 * may produce a signed custody receipt; injected transport is fixture-only.
 * No third-party certification, expert qualification or public mark is conferred.
 */
import {createHash,createPublicKey,verify as verifySignature} from 'node:crypto';
import {readApprovedSource,type SourceTransport} from './approved_web_reader.js';
import type {EvidenceAcquisitionPlan,EvidenceQueueItem,WebCandidate,WebSourcePolicy}
 from './web_evidence_acquisition.js';
import {buildSpecialistTrustPresentation199,type TrustPresentationRequest199}
 from './phase199_specialist_trust_presentation.js';
import {captureMessage200,type CaptureClaim200,type Signed200,type SourceCustody200,
 type TrustAnchorPolicy200} from './phase200_signed_source_publication_gate.js';

export interface PrimaryOriginRegistry201 {
 /** Privileged operator-curated primary issuer host, never extracted from a review. */
 schema:'pee201.primary_origin.v1';publisherOrIssuerId:string;
 exactHost:string;allowedPathPrefix:string;scopeReviewedOn:string;
 programmeId:string;registryAuthorityIndependentlyAuthenticated:false;
}
export interface CaptureSigner201 {
 /** Key managed outside the source/claim/search system. Function performs signing only. */
 sign:(message:string)=>Promise<{keyId:string;signatureBase64Url:string}>;
 /** Policy must originate from independent deployment config, not the page. */
 protectedPolicy:TrustAnchorPolicy200;
}
export interface CaptureRequest201 {
 phase199:TrustPresentationRequest199;
 plan:EvidenceAcquisitionPlan;queueItem:EvidenceQueueItem;
 candidate:WebCandidate;webPolicy:WebSourcePolicy;
 checkedAt:string;evidenceId:string;
 /** For programme approvals, source registry must be explicitly curated.
  * This metadata does not prove actual registry issuer identity. */
 primaryOrigin?:PrimaryOriginRegistry201;
 /** Supplying a transport forces fixture mode and disables signing. */
 fixtureTransport?:SourceTransport;
 signer?:CaptureSigner201;
 /** Called only in controlled HTTPS mode, while bytes remain ephemeral.
  * Must not retain or log full source text. Phase200 staging may be performed here. */
 onSignedCapture?:(custody:SourceCustody200)=>Promise<void>|void;
}
export interface SourceCaptureResult201 {
 schema:'pee201.capture_result.v1';phase:201;
 state:'blocked'|'fixture_untrusted'|'signed_custody_only';
 evidenceId:string;sourceUrl:string;variantId:string;
 sha256FullDocument:string|null;captureDay:string|null;
 documentVersionId:string|null;etag:string|null;lastModified:string|null;
 sourceKind:'publisher_original_document'|'issuer_primary_registry'|null;
 receipt:Signed200<CaptureClaim200>|null;
 reason:string|null;
 /** The custody signature proves only what the controlled fetcher claims to have read. */
 signedCaptureAuthenticatesActualIssuer:false;sourceTextRetained:false;
 certificateClaimsAutomaticallyVerified:false;livePublishingAuthorized:false;
 rankingChanged:false;
}
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(s);
const iso=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&
 !Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const hash=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
const sig=(s:unknown):s is string=>typeof s==='string'&&/^[A-Za-z0-9_-]{86}$/.test(s);
function primaryMatch(p:PrimaryOriginRegistry201|undefined,sourceUrl:string,asOf:string):boolean{
 if(!p||p.schema!=='pee201.primary_origin.v1'||!id(p.publisherOrIssuerId)||!id(p.programmeId)||
  p.registryAuthorityIndependentlyAuthenticated!==false||!iso(p.scopeReviewedOn)||p.scopeReviewedOn>asOf||
  typeof p.exactHost!=='string'||typeof p.allowedPathPrefix!=='string'||
  !/^\/[a-zA-Z0-9_./-]{0,200}$/.test(p.allowedPathPrefix)||p.allowedPathPrefix.includes('..'))return false;
 try{const url=new URL(sourceUrl);return url.hostname===p.exactHost&&url.protocol==='https:'&&
  (url.pathname===p.allowedPathPrefix||
   url.pathname.startsWith(p.allowedPathPrefix.endsWith('/')?p.allowedPathPrefix:p.allowedPathPrefix+'/'))&&
  !url.username&&!url.password;}
 catch{return false;}
}
function signedByControlledCapture(s:Signed200<CaptureClaim200>,config:CaptureSigner201,day:string):boolean{
 if(!sig(s.signatureBase64Url)||!id(s.keyId)||!config.protectedPolicy||
  !Array.isArray(config.protectedPolicy.anchors))return false;
 const k=config.protectedPolicy.anchors.find(a=>a.keyId===s.keyId&&a.role==='controlled_capture'&&
  a.activeFrom<=day&&a.activeThrough>=day);
 if(!k||typeof k.publicKeyPem!=='string')return false;
 try{const key=createPublicKey(k.publicKeyPem);return key.asymmetricKeyType==='ed25519'&&
  verifySignature(null,Buffer.from(captureMessage200(s.payload)),key,
    Buffer.from(s.signatureBase64Url,'base64url'));}catch{return false;}
}
/** Plans, web policies and source dossiers are REVALIDATED by Phase69/199.
 * A local fixture cannot yield a signed source-custody result, even if its
 * caller controls keys. A real HTTPS fetch cannot be faked via this API. */
export async function captureApprovedSpecialistSource201(req:CaptureRequest201):Promise<SourceCaptureResult201>{
 const denied=(reason:string):SourceCaptureResult201=>({schema:'pee201.capture_result.v1',phase:201,
  state:'blocked',evidenceId:req.evidenceId,sourceUrl:req.candidate?.url??'',
  variantId:req.candidate?.exactVariantId??'',sha256FullDocument:null,captureDay:null,
  documentVersionId:null,etag:null,lastModified:null,sourceKind:null,receipt:null,reason,
  signedCaptureAuthenticatesActualIssuer:false,sourceTextRetained:false,
  certificateClaimsAutomaticallyVerified:false,livePublishingAuthorized:false,rankingChanged:false});
 if(!id(req.evidenceId)||!req.candidate||!req.webPolicy||
  typeof req.checkedAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(req.checkedAt)||
  !Number.isFinite(Date.parse(req.checkedAt))||
  (req.fixtureTransport&& (req.signer||req.onSignedCapture))||
  (!req.fixtureTransport&&!req.signer)||
  (req.onSignedCapture&&!req.signer)||
  (!req.fixtureTransport&&Math.abs(Date.now()-Date.parse(req.checkedAt))>15*60*1000))return denied('invalid_or_mixed_trust_boundary');
 let view:ReturnType<typeof buildSpecialistTrustPresentation199>;
 try{view=buildSpecialistTrustPresentation199(req.phase199);}catch{return denied('invalid_reviewed_presentation');}
 const dossier=req.phase199.dossiers.find(d=>d.evidenceId===req.evidenceId);
 const card=view.cards.find(c=>c.evidenceIds.includes(req.evidenceId)&&c.sourceUrl===dossier?.sourceUrl);
 if(!dossier||!card||dossier.variantId!==view.variantId||
  req.candidate.exactVariantId!==view.variantId||req.candidate.url!==dossier.sourceUrl||
  req.plan.exactVariantId!==view.variantId||req.checkedAt.slice(0,10)!==view.asOf||
  dossier.digestBasis!=='complete_publisher_document'||
  dossier.publisherOrigin!=='confirmed_original_publisher'||
  req.queueItem.candidateId!==req.candidate.id||
  req.webPolicy.sourceId!==req.candidate.sourceId)return denied('presentation_source_scope_mismatch');
 const scheme=card.kind!=='expert_practical_test';
 if(scheme&&!primaryMatch(req.primaryOrigin,card.sourceUrl,view.asOf))return denied('primary_registry_mapping_missing');
 if(!scheme&&req.primaryOrigin)return denied('unexpected_primary_registry_claim');
 const kind=scheme?'issuer_primary_registry':'publisher_original_document';
 // Requirement: check exactly one version and full ORIGINAL bytes, never the
 // Phase69 decoded-text digest, a Last-Modified value, or a caller-supplied ETag.
 let observed:{sha256:string;etag:string|null;modified:string|null;receipt:Signed200<CaptureClaim200>|null}|null=null;
 let outcome:Awaited<ReturnType<typeof readApprovedSource>>;
 try{outcome=await readApprovedSource({plan:req.plan,queueItem:req.queueItem,candidate:req.candidate,
  policy:req.webPolicy,checkedAt:req.checkedAt,transport:req.fixtureTransport,
  onQuarantinedDocument:async doc=>{
   if(doc.url!==card.sourceUrl||!/^text\/html(?:;|$)/i.test(doc.contentType))
    throw Error('unsupported_exact_primary_html');
   const digest=hash(doc.completeBytes);
   if(digest!==dossier.publisherDocumentSha256)throw Error('document_version_or_digest_mismatch');
   const safeHeader=(s:string|null)=>s!==null&&s.length<=160&&/^[\x20-\x7e]+$/.test(s)?s:null;
   let signed:Signed200<CaptureClaim200>|null=null;
   if(!req.fixtureTransport){
    const claim:CaptureClaim200={schema:'pee200.capture.v1',evidenceId:req.evidenceId,kind,
     sourceUrl:doc.url,documentVersionId:dossier.documentVersionId,variantId:view.variantId,
     sha256FullDocument:digest,capturedAt:view.asOf,
     originCheck:'tls_origin_checked_by_controlled_fetcher',sourceContentType:'text/html'};
    const signature=await req.signer!.sign(captureMessage200(claim));
    signed={payload:claim,keyId:signature.keyId,signatureBase64Url:signature.signatureBase64Url};
    if(!signedByControlledCapture(signed,req.signer!,view.asOf))
     throw Error('signer_or_credential_scope_not_authorized');
    if(req.onSignedCapture)await req.onSignedCapture({claim:signed,
      transientCompleteDocument:doc.completeBytes});
   }
   observed={sha256:digest,etag:safeHeader(doc.etag),modified:safeHeader(doc.lastModified),receipt:signed};
  }});}
 catch{return denied('approved_reader_rejected_input');}
 if(outcome.status==='blocked'||!observed)return denied(outcome.status==='blocked'?
  outcome.reasons[0]:'missing_ephemeral_capture');
 const capture=observed as {sha256:string;etag:string|null;modified:string|null;receipt:Signed200<CaptureClaim200>|null};
 return {schema:'pee201.capture_result.v1',phase:201,state:req.fixtureTransport?'fixture_untrusted':'signed_custody_only',
  evidenceId:req.evidenceId,sourceUrl:card.sourceUrl,variantId:view.variantId,
  sha256FullDocument:capture.sha256,captureDay:view.asOf,documentVersionId:card.sourceVersionId,
  etag:capture.etag,lastModified:capture.modified,sourceKind:kind,receipt:capture.receipt,
  reason:null,signedCaptureAuthenticatesActualIssuer:false,sourceTextRetained:false,
  certificateClaimsAutomaticallyVerified:false,livePublishingAuthorized:false,rankingChanged:false};
}
