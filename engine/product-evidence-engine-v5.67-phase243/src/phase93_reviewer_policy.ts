/** Phase93 — externally root-signed deployment approval permissions.
 * This policy is a narrow additional authorization gate for NEW lifecycle
 * transitions, not a replacement for Phase92 Ed25519 signature checking.
 * Trusted public keys are supplied by independent deployment configuration.
 * Historical transitions remain signature-verifiable after staff revocation.
 */
import {createPublicKey,verify,createHash} from 'node:crypto';
import {phase92Canonical,type HtmlLifecycleEvent} from './phase92_recipe_lifecycle.js';
import type {ReviewedRecipeStore} from './phase85_source_recipes.js';
import {ReviewedRecipeStore as Store} from './phase85_source_recipes.js';

export interface Phase93ReviewerPolicy {
 schema:'phase93_reviewer_policy_v1';policyId:string;
 issuedAt:string;expiresAt:string;
 reviewers:readonly {reviewer:string;keyPem:string;actions:readonly ('suspend'|'supersede')[];
  host:string;category:string;prefix:string;validFrom:string;validUntil:string;
  revokedAt:string|null;}[];
 signature:{rootKeyId:string;ed25519:string};
}
export function isUTC(x:string):boolean{
 return typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(x)&&
  Number.isFinite(Date.parse(x))&&new Date(x).toISOString().slice(0,19)===x.slice(0,19);
}
const ident=(x:unknown)=>typeof x==='string'&&/^[a-z][a-z0-9_]{0,90}$/.test(x);
const host=(x:unknown)=>typeof x==='string'&&/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(x)&&x===x.toLowerCase();
const prefix=(x:unknown)=>typeof x==='string'&&/^\/[a-zA-Z0-9/_~-]{0,180}$/.test(x);
export function reviewerPolicyDigest(p:Phase93ReviewerPolicy):string{
 return createHash('sha256').update(phase92Canonical(p)).digest('hex');
}
export function policyMessage(p:Phase93ReviewerPolicy):Buffer{
 const {signature,...unsigned}=p;
 return Buffer.from('PRODUCT_EVIDENCE_PHASE93_POLICY_V1\n'+phase92Canonical(unsigned));
}
export function verifyReviewerPolicy(p:Phase93ReviewerPolicy,rootPem:string,expectedRootId:string,at:string):void{
 if(!p||p.schema!=='phase93_reviewer_policy_v1'||!ident(p.policyId)||
 !isUTC(at)||!isUTC(p.issuedAt)||!isUTC(p.expiresAt)||
 Date.parse(at)<Date.parse(p.issuedAt)||Date.parse(at)>=Date.parse(p.expiresAt)||
 !Array.isArray(p.reviewers)||!p.reviewers.length||p.reviewers.length>100||
 !ident(expectedRootId)||p.signature?.rootKeyId!==expectedRootId||
 typeof p.signature.ed25519!=='string'||!/^[-A-Za-z0-9+/]{86}==$/.test(p.signature.ed25519)||
 Buffer.byteLength(phase92Canonical(p))>35000)throw Error('phase93_invalid_or_expired_reviewer_policy');
 try{
  const root=createPublicKey(rootPem);
  if(root.asymmetricKeyType!=='ed25519'||!verify(null,policyMessage(p),root,Buffer.from(p.signature.ed25519,'base64')))
   throw Error('phase93_policy_signature_invalid');
 }catch{throw Error('phase93_policy_signature_invalid');}
 const seen=new Set<string>();
 for(const r of p.reviewers){
  if(!r||!ident(r.reviewer)||seen.has(r.reviewer)||!host(r.host)||!ident(r.category)||!prefix(r.prefix)||
   !Array.isArray(r.actions)||!r.actions.length||r.actions.length>2||
   new Set(r.actions).size!==r.actions.length||r.actions.some((a:string)=>a!=='suspend'&&a!=='supersede')||
   !isUTC(r.validFrom)||!isUTC(r.validUntil)||Date.parse(r.validFrom)>=Date.parse(r.validUntil)||
   (r.revokedAt!==null&&!isUTC(r.revokedAt)))throw Error('phase93_invalid_reviewer_grant');
  try{if(createPublicKey(r.keyPem).asymmetricKeyType!=='ed25519')throw Error();}
  catch{throw Error('phase93_invalid_reviewer_key');}
  seen.add(r.reviewer);
 }
}
/** Check policy again at each NEW change, never for simply reading historic events. */
export function reviewerPolicyGate(p:Phase93ReviewerPolicy,rootPem:string,rootId:string,
 expectedPolicySha256:string,now:()=>string=()=>new Date().toISOString()):(event:HtmlLifecycleEvent)=>void{
 return event=>{
  const at=now();verifyReviewerPolicy(p,rootPem,rootId,at);
  if(reviewerPolicyDigest(p)!==expectedPolicySha256)throw Error('phase93_policy_checkpoint_mismatch');
  const grant=p.reviewers.find(r=>r.reviewer===event.approval.reviewer);
  if(!grant||!grant.actions.includes(event.action)||grant.host!==event.scope.host||
    grant.category!==event.scope.category||grant.prefix!==event.scope.prefix||
    Date.parse(at)<Date.parse(grant.validFrom)||Date.parse(at)>=Date.parse(grant.validUntil)||
    (grant.revokedAt!==null&&Date.parse(at)>=Date.parse(grant.revokedAt))||
    Date.parse(event.occurredAt)<Date.parse(grant.validFrom)||
    Date.parse(event.occurredAt)>Date.parse(at)+5*60_000)
   throw Error('phase93_reviewer_not_authorized_for_transition');
 };
}
/** No implicit trust-on-first-use. No private key in the crawler. */
export function createPolicyEnforcedRecipeStore(filename:string,policy:Phase93ReviewerPolicy,
 rootPem:string,rootId:string,pinnedPolicySha256:string,
 now:()=>string=()=>new Date().toISOString()):ReviewedRecipeStore{
 verifyReviewerPolicy(policy,rootPem,rootId,now());
 if(!/^[a-f0-9]{64}$/.test(pinnedPolicySha256)||reviewerPolicyDigest(policy)!==pinnedPolicySha256)
  throw Error('phase93_policy_checkpoint_mismatch');
 const reviewers=Object.fromEntries(policy.reviewers.map(r=>[r.reviewer,r.keyPem]));
 return new Store(filename,reviewers,reviewerPolicyGate(policy,rootPem,rootId,pinnedPolicySha256,now));
}
