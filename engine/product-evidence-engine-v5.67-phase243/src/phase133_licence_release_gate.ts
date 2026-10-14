/** Product Evidence Engine Phase 133: zero-fee permissive licence admission.
 * This is policy validation of a separately audited artifact manifest, NOT
 * automated legal due diligence or authentication of metadata found online.
 * Fail closed on ANY unreviewed direct/transitive dependency, model or data artifact.
 */
import {inspectLocalCandidate132, type OfflineModelCandidate132, type OfflineSource132,
  type OfflineReview132, type ApprovedLocalModel132} from './phase132_local_extractor_adapter.js';
export const PERMISSIVE133 = ['Apache-2.0','MIT','BSD-2-Clause','BSD-3-Clause','ISC','0BSD','CC0-1.0'] as const;
export type ArtifactKind133='code'|'weights'|'runtime_dependency'|'dataset'|'tokenizer'|'configuration';
export interface Artifact133 {
 name:string;kind:ArtifactKind133;version:string;sha256:string;
 license:string; licenseUrl:string; originUrl:string;
 independentlyReviewed:boolean; reviewReference:string;
 distributionCostEUR:number; usageFeeEUR:number;
 requiresPrivatePermission:boolean; externalServiceRequired:boolean;
 noticePreserved:boolean; commercialUseConfirmed:boolean;
}
export interface ModelBundle133 {modelId:string;modelDigest:string;artifacts:Artifact133[];
 offlineRuntime:boolean; sourceRevision:string;}
export interface BundleDecision133 {admissible:boolean; reasons:string[]; modelId:string;
 knownArtifacts:number; reviewedArtifacts:number; knowledgeWriteAuthorized:false; rankingAuthorized:false;}
const hashOk=(s:string)=>/^[a-f\d]{64}$/.test(s);
const allowed=new Set<string>(PERMISSIVE133);
export function auditBundle133(bundle:ModelBundle133):BundleDecision133 {
 const reasons:string[]=[];
 if(!bundle||!bundle.modelId?.trim()||!hashOk(bundle.modelDigest))throw Error('invalid_bundle_identity');
 if(!bundle.offlineRuntime)reasons.push('offline_runtime_required');
 if(!bundle.sourceRevision?.trim())reasons.push('unpinned_release_revision');
 const arts=bundle.artifacts??[];
 if(!arts.length)reasons.push('incomplete_artifact_inventory');
 if(!arts.some(a=>a.kind==='code'))reasons.push('missing_library_code');
 if(!arts.some(a=>a.kind==='weights'))reasons.push('missing_model_weights');
 if(!arts.some(a=>a.kind==='runtime_dependency'))reasons.push('missing_runtime_dependencies');
 const keys=new Set<string>();
 for(const a of arts){
  if(!a||!a.name?.trim()||!a.version?.trim()||!hashOk(a.sha256)||!a.originUrl?.startsWith('https://')||
     !a.licenseUrl?.startsWith('https://'))reasons.push('missing_artifact_identity');
  const key=`${a.kind}:${a.name}`;if(keys.has(key))reasons.push('duplicate_artifact');keys.add(key);
  if(!allowed.has(a.license))reasons.push('unapproved_or_unknown_license');
  if(!a.independentlyReviewed||!a.reviewReference?.trim())reasons.push('missing_independent_review');
  if(!a.noticePreserved)reasons.push('licence_notice_not_retained');
  if(!a.commercialUseConfirmed)reasons.push('commercial_rights_not_reviewed');
  if(!Number.isFinite(a.distributionCostEUR)||a.distributionCostEUR!==0||
     !Number.isFinite(a.usageFeeEUR)||a.usageFeeEUR!==0)reasons.push('licence_or_usage_fee');
  if(a.requiresPrivatePermission)reasons.push('private_permission_required');
  if(a.externalServiceRequired)reasons.push('online_dependency_required');
 }
 return {admissible:reasons.length===0,reasons:[...new Set(reasons)].sort(),
  modelId:bundle.modelId,knownArtifacts:arts.length,
  reviewedArtifacts:arts.filter(a=>a.independentlyReviewed).length,
  knowledgeWriteAuthorized:false,rankingAuthorized:false};
}
/** Convert an externally reviewed bundle to Phase132's proposal-only adapter.
 * Caller must verify actual artifact SHA256s against these expected digests;
 * this policy contract cannot inspect a library's runtime dependency tree alone.
 */
export function inspectLicensedProposal133(x:OfflineModelCandidate132, source:OfflineSource132,
 bundle:ModelBundle133):OfflineReview132 & {licenceAdmitted:boolean} {
 const audit=auditBundle133(bundle);
 if(!audit.admissible||x.modelId!==bundle.modelId||x.modelDigest!==bundle.modelDigest)
  return {status:'rejected',reasons:[...new Set([...audit.reasons, ...(x.modelId!==bundle.modelId||x.modelDigest!==bundle.modelDigest?['model_identity_mismatch']:[])])],
   label:x.predictedRelation,sourceId:x.sourceId,modelId:x.modelId,knowledgeWriteAuthorized:false,
   rankingAuthorized:false,semanticPolicyVersion:'132.1',licenceAdmitted:false};
 const approved:ApprovedLocalModel132[]=[{modelId:bundle.modelId,modelDigest:bundle.modelDigest,
  licenseReviewed:'Phase133 complete pinned offline inventory',localOnly:true}];
 return {...inspectLocalCandidate132(x,source,approved),licenceAdmitted:true};
}
