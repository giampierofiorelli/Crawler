/** Phase207 — admission of signed, task-scoped, independently labelled video cases.
 * Reuses the Phase206 benchmark and Phase200's Signed200 envelope. A signature
 * authenticates a configured signing key, NOT actual video viewing, legal access,
 * reviewer competence, impartiality, or the correctness of a claim.
 * No private keys, source bodies, transcripts or commercial ranking effects.
 */
import {createHash,createPublicKey,verify as verifySignature} from 'node:crypto';
import {canonicalReviewableVideo209} from './phase209_licensed_original_media.js';
import {type Signed200} from './phase200_signed_source_publication_gate.js';
import {evaluateVideoEvidence206,type BenchmarkDataset206,type Case206,
 type CaseJudgment206,type EventPair206,type Prediction206,type PairPrediction206,
 type BenchmarkResult206} from './phase206_video_evidence_benchmark.js';

const fail=(r:string):never=>{throw new Error('phase207_'+r);};
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(s)&&
 !['__proto__','constructor','prototype'].includes(s);
const iso=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(s)&&
 Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,19)===s.slice(0,19);
const sha=(s:string):string=>createHash('sha256').update(s).digest('hex');
const digest=(s:unknown):s is string=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const exact=(x:unknown,k:readonly string[]):boolean=>!!x&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).length===k.length&&Object.keys(x).every(y=>k.includes(y));
const signature=(x:unknown)=>typeof x==='string'&&/^[A-Za-z0-9_-]{86}$/.test(x);
const casePair=(a:string,b:string)=>[a,b].sort().join('|');

export type ReviewRole207='benchmark_coordinator'|'independent_video_reviewer';
export interface ReviewerAnchor207{
 keyId:string;principalId:string;role:ReviewRole207;publicKeyPem:string;
 activeFrom:string;activeThrough:string;
 /** Operator-supplied configuration: never derive this from the video itself. */
}
export interface ReviewerPolicy207{
 policyId:string;anchors:readonly ReviewerAnchor207[];
}
export interface PredictionFreeze207{
 schema:'pee207.freeze.v1';datasetId:string;providerId:string;providerVersion:string;
 caseSetSha256:string;predictionSetSha256:string;frozenAt:string;
 /** This cannot prove that labels were concealed from a reviewer. */
 blindAccessAttested:true;
}
export interface CaseReviewClaim207{
 schema:'pee207.case-review.v1';datasetId:string;caseId:string;
 caseScopeSha256:string;sourceReviewId:string;sourceVersionId:string;
 accessReceiptId:string;reviewedAt:string;
 /** The signed assertion cannot authenticate original platform bytes. */
 sourceExamined:'human_viewed_video'|'permitted_transcript_checked';
 judgement:CaseJudgment206;
}
export interface PairReviewClaim207{
 schema:'pee207.pair-review.v1';datasetId:string;left:string;right:string;
 leftScopeSha256:string;rightScopeSha256:string;
 sourceReviewIds:readonly [string,string];reviewedAt:string;
 judgement:EventPair206;
}
export interface AdmissionRequest207{
 schema:'pee207.admission.v1';datasetId:string;
 cases:readonly Case206[];predictions:readonly Prediction206[];
 pairPredictions:readonly PairPrediction206[];
 frozen:Signed200<PredictionFreeze207>;
 caseReviews:readonly Signed200<CaseReviewClaim207>[];
 pairReviews:readonly Signed200<PairReviewClaim207>[];
 policy:ReviewerPolicy207;asOf:string;
}
export interface AdmissionResult207{
 schema:'pee207.admission-result.v1';state:'research_only';dataset:BenchmarkDataset206;
 benchmark:BenchmarkResult206;datasetReviewReceipts:readonly string[];
 rejected:readonly {kind:'case'|'event_pair';ref:string;reason:string}[];
 heldCases:readonly string[];caseGoldAdmitted:number;pairGoldAdmitted:number;
 providerOutputsFrozen:true;keySignaturesVerified:true;
 /** Cryptographic validity is not proof of human independence or that footage was viewed. */
 reviewerIndependenceProvenBySignature:false;
 actualOriginalVideoAccessVerified:false;realScientificAccuracyClaimAllowed:false;
 rawVideoOrTranscriptStored:false;productRankingModified:false;
}

/** Versioned canonical messages. Signed payload keys are explicitly whitelisted below. */
export const freezeMessage207=(p:PredictionFreeze207)=>JSON.stringify([
 p.schema,p.datasetId,p.providerId,p.providerVersion,p.caseSetSha256,
 p.predictionSetSha256,p.frozenAt,p.blindAccessAttested]);
export const caseReviewMessage207=(p:CaseReviewClaim207)=>JSON.stringify([
 p.schema,p.datasetId,p.caseId,p.caseScopeSha256,p.sourceReviewId,
 p.sourceVersionId,p.accessReceiptId,p.reviewedAt,p.sourceExamined,
 p.judgement.caseId,p.judgement.reviewerId,p.judgement.receiptId,
 p.judgement.blindToPrediction,p.judgement.claimKind,p.judgement.expertise,
 p.judgement.modelScope,p.judgement.originality,p.judgement.commercial,p.judgement.timeSecond]);
export const pairReviewMessage207=(p:PairReviewClaim207)=>JSON.stringify([
 p.schema,p.datasetId,p.left,p.right,p.leftScopeSha256,p.rightScopeSha256,
 p.sourceReviewIds[0],p.sourceReviewIds[1],p.reviewedAt,
 p.judgement.left,p.judgement.right,p.judgement.reviewerId,
 p.judgement.receiptId,p.judgement.blindToPrediction,p.judgement.relation]);

export function caseScopeFingerprint207(c:Case206):string{
 const video=canonicalReviewableVideo209(c.videoUrl);
 if(video.url!==c.referenceUrl)fail('case_reference');
 return sha(JSON.stringify(['pee207.case-scope.v1',c.caseId,video.url,c.categoryId,
  c.variantId,c.criterionId,c.disciplineId,c.language,c.sourceReviewId,c.reviewBasis,c.sourceKind]));
}
export function freezeFingerprints207(cases:readonly Case206[],p:readonly Prediction206[],
 pp:readonly PairPrediction206[]):{caseSetSha256:string;predictionSetSha256:string}{
 const scope=cases.map(c=>[c.caseId,caseScopeFingerprint207(c)] as const).sort((a,b)=>a[0].localeCompare(b[0]));
 const predictions=p.map(x=>[x.caseId,x.providerId,x.providerVersion,x.claimKind,
  x.expertise,x.modelScope,x.originality,x.commercial,x.timeSecond] as const)
  .sort((a,b)=>a[0].localeCompare(b[0]));
 const pairs=pp.map(x=>[...([x.left,x.right].sort()),x.providerId,x.providerVersion,x.relation])
  .sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
 return {caseSetSha256:sha(JSON.stringify(['pee207.case-set.v1',scope])),
  predictionSetSha256:sha(JSON.stringify(['pee207.predictions.v1',predictions,pairs]))};
}
function anchors207(policy:ReviewerPolicy207,asOf:string):Map<string,ReviewerAnchor207>{
 if(!exact(policy,['policyId','anchors'])||!id(policy.policyId)||!Array.isArray(policy.anchors)||
  policy.anchors.length<3||policy.anchors.length>40||!iso(asOf))fail('trust_policy');
 const m=new Map<string,ReviewerAnchor207>(),keys=new Set<string>(),principals=new Set<string>();
 let coordinator=0,reviewers=0;
 for(const a of policy.anchors){
  if(!exact(a,['keyId','principalId','role','publicKeyPem','activeFrom','activeThrough'])||
   !id(a.keyId)||!id(a.principalId)||
   !['benchmark_coordinator','independent_video_reviewer'].includes(a.role)||
   !iso(a.activeFrom)||!iso(a.activeThrough)||a.activeFrom>a.activeThrough||
   typeof a.publicKeyPem!=='string'||a.publicKeyPem.length>3000||
   m.has(a.keyId)||principals.has(a.principalId))fail('trust_anchor');
  let key;
  try{key=createPublicKey(a.publicKeyPem);if(key.asymmetricKeyType!=='ed25519')fail('trust_anchor_key');}
  catch{fail('trust_anchor_key');}
  const fp=sha((key!.export({type:'spki',format:'der'}) as Buffer).toString('base64'));
  if(keys.has(fp))fail('duplicate_public_key');
  keys.add(fp);principals.add(a.principalId);m.set(a.keyId,a);
  if(a.role==='benchmark_coordinator')coordinator++;else reviewers++;
 }
 if(coordinator<1||reviewers<2)fail('missing_roles');
 return m;
}
function verify207<T>(s:Signed200<T>,role:ReviewRole207,at:string,anchors:Map<string,ReviewerAnchor207>,message:string){
 if(!s||!id(s.keyId)||!signature(s.signatureBase64Url))return null;
 const a=anchors.get(s.keyId);
 if(!a||a.role!==role||at<a.activeFrom||at>a.activeThrough)return null;
 try{if(!verifySignature(null,Buffer.from(message),createPublicKey(a.publicKeyPem),
  Buffer.from(s.signatureBase64Url,'base64url')))return null;}catch{return null;}
 return a;
}
/** This layer ADDS authentic signing-key provenance; it cannot prove claimed
 * real-world viewing, licence, blindness or professional accreditation.
 */
export function admitSignedBenchmark207(req:AdmissionRequest207):AdmissionResult207{
 if(!exact(req,['schema','datasetId','cases','predictions','pairPredictions','frozen','caseReviews',
  'pairReviews','policy','asOf'])||req.schema!=='pee207.admission.v1'||!id(req.datasetId)||
  !Array.isArray(req.cases)||req.cases.length>250||!Array.isArray(req.predictions)||
  req.predictions.length>250||!Array.isArray(req.pairPredictions)||req.pairPredictions.length>1000||
  !Array.isArray(req.caseReviews)||req.caseReviews.length>750||
  !Array.isArray(req.pairReviews)||req.pairReviews.length>2000)fail('request');
 const anchors=anchors207(req.policy,req.asOf);
 const f=req.frozen?.payload;
 const scope=freezeFingerprints207(req.cases,req.predictions,req.pairPredictions);
 if(!exact(f,['schema','datasetId','providerId','providerVersion','caseSetSha256',
   'predictionSetSha256','frozenAt','blindAccessAttested'])||
  f.schema!=='pee207.freeze.v1'||f.datasetId!==req.datasetId||
  !id(f.providerId)||typeof f.providerVersion!=='string'||f.providerVersion.length===0||
  f.providerVersion.length>80||!digest(f.caseSetSha256)||!digest(f.predictionSetSha256)||
  !iso(f.frozenAt)||f.frozenAt>req.asOf||f.blindAccessAttested!==true||
  scope.caseSetSha256!==f.caseSetSha256||scope.predictionSetSha256!==f.predictionSetSha256||
  !verify207(req.frozen,'benchmark_coordinator',f.frozenAt,anchors,freezeMessage207(f)))fail('invalid_freeze');
 const cases=new Map(req.cases.map(c=>[c.caseId,c]));
 if(cases.size!==req.cases.length)fail('duplicate_case');
 // Validates the authoritative Phase206 schema and prediction scope even when
 // no signed labels exist, before accepting any review attestations.
 evaluateVideoEvidence206({schema:'206.dataset.1',datasetId:req.datasetId,
  provenance:'source_linked_unblinded_pilot',cases:req.cases,judgments:[],eventPairs:[]},
  req.predictions,req.pairPredictions,f.providerId,f.providerVersion);
 const held=new Set<string>(req.cases.map(c=>c.caseId));
 const rejected:{kind:'case'|'event_pair';ref:string;reason:string}[]=[];
 const accepted=new Map<string,{j:CaseJudgment206;principal:string;receipt:string}[]>();
 const allReceipts=new Set<string>();
 for(const s of req.caseReviews){
  const p=s?.payload;
  const ref=typeof p?.caseId==='string'?p.caseId:'invalid';
  let reason:string|null=null;
  const c=cases.get(p?.caseId);const j=p?.judgement;
  if(!exact(p,['schema','datasetId','caseId','caseScopeSha256','sourceReviewId',
   'sourceVersionId','accessReceiptId','reviewedAt','sourceExamined','judgement'])||
   p.schema!=='pee207.case-review.v1'||p.datasetId!==req.datasetId||!c||
   c.reviewBasis==='metadata_only'||c.sourceKind!=='reviewed_original_video'||
   !digest(p.caseScopeSha256)||p.caseScopeSha256!==caseScopeFingerprint207(c)||
   p.sourceReviewId!==c.sourceReviewId||!id(p.sourceVersionId)||!id(p.accessReceiptId)||
   !iso(p.reviewedAt)||p.reviewedAt<f.frozenAt||p.reviewedAt>req.asOf||
   p.sourceExamined!==c.reviewBasis||
   !exact(j,['caseId','reviewerId','receiptId','blindToPrediction','claimKind',
     'expertise','modelScope','originality','commercial','timeSecond'])||
   j.caseId!==p.caseId||j.blindToPrediction!==true||!id(j.receiptId))reason='review_scope';
  const who=!reason?verify207(s,'independent_video_reviewer',p.reviewedAt,anchors,caseReviewMessage207(p)):null;
  if(!reason&&!who)reason='invalid_signature';
  if(!reason&&j.reviewerId!==who!.principalId)reason='reviewer_identity_mismatch';
  if(!reason&&allReceipts.has(j.receiptId))reason='duplicate_receipt';
  if(reason){rejected.push({kind:'case',ref,reason});continue;}
  allReceipts.add(j.receiptId);
  accepted.set(p.caseId,[...(accepted.get(p.caseId)??[]),{j,principal:who!.principalId,receipt:j.receiptId}]);
 }
 const judgments:CaseJudgment206[]=[];
 for(const [caseId,entries] of accepted){
  if(entries.length===2&&new Set(entries.map(e=>e.principal)).size===2){
   judgments.push(...entries.map(x=>x.j));held.delete(caseId);
  }else{
   rejected.push({kind:'case',ref:caseId,reason:'missing_two_distinct_reviewers'});
  }
 }
 const pairAccepted=new Map<string,{j:EventPair206;principal:string;receipt:string}[]>();
 for(const s of req.pairReviews){
  const p=s?.payload;const ref=typeof p?.left==='string'&&typeof p?.right==='string'?casePair(p.left,p.right):'invalid';
  let reason:string|null=null;
  const a=cases.get(p?.left),b=cases.get(p?.right),j=p?.judgement;
  if(!exact(p,['schema','datasetId','left','right','leftScopeSha256','rightScopeSha256',
   'sourceReviewIds','reviewedAt','judgement'])||p.schema!=='pee207.pair-review.v1'||
   p.datasetId!==req.datasetId||!a||!b||a.caseId===b.caseId||held.has(a.caseId)||held.has(b.caseId)||
   !Array.isArray(p.sourceReviewIds)||p.sourceReviewIds.length!==2||
   p.sourceReviewIds[0]!==a.sourceReviewId||p.sourceReviewIds[1]!==b.sourceReviewId||
   p.leftScopeSha256!==caseScopeFingerprint207(a)||p.rightScopeSha256!==caseScopeFingerprint207(b)||
   !iso(p.reviewedAt)||p.reviewedAt<f.frozenAt||p.reviewedAt>req.asOf||
   !exact(j,['left','right','reviewerId','receiptId','blindToPrediction','relation'])||
   j.left!==p.left||j.right!==p.right||j.blindToPrediction!==true||!id(j.receiptId))reason='event_scope';
  const who=!reason?verify207(s,'independent_video_reviewer',p.reviewedAt,anchors,pairReviewMessage207(p)):null;
  if(!reason&&!who)reason='invalid_signature';
  if(!reason&&j.reviewerId!==who!.principalId)reason='reviewer_identity_mismatch';
  if(!reason&&allReceipts.has(j.receiptId))reason='duplicate_receipt';
  if(reason){rejected.push({kind:'event_pair',ref,reason});continue;}
  allReceipts.add(j.receiptId);
  pairAccepted.set(ref,[...(pairAccepted.get(ref)??[]),{j,principal:who!.principalId,receipt:j.receiptId}]);
 }
 const eventPairs:EventPair206[]=[];
 for(const [ref,entries] of pairAccepted){
  if(entries.length===2&&new Set(entries.map(e=>e.principal)).size===2)
   eventPairs.push(...entries.map(x=>x.j));
  else rejected.push({kind:'event_pair',ref,reason:'missing_two_distinct_reviewers'});
 }
 const dataset:BenchmarkDataset206={schema:'206.dataset.1',datasetId:req.datasetId,
  provenance:'source_linked_unblinded_pilot',cases:req.cases,
  judgments:judgments.sort((a,b)=>a.caseId.localeCompare(b.caseId)||a.reviewerId.localeCompare(b.reviewerId)),
  eventPairs:eventPairs.sort((a,b)=>casePair(a.left,a.right).localeCompare(casePair(b.left,b.right))||
    a.reviewerId.localeCompare(b.reviewerId))};
 const benchmark=evaluateVideoEvidence206(dataset,req.predictions,req.pairPredictions,
  f.providerId,f.providerVersion);
 return {schema:'pee207.admission-result.v1',state:'research_only',dataset,benchmark,
  datasetReviewReceipts:[...allReceipts].sort(),
  rejected:rejected.sort((a,b)=>a.kind.localeCompare(b.kind)||a.ref.localeCompare(b.ref)||a.reason.localeCompare(b.reason)),
  heldCases:[...held].sort(),caseGoldAdmitted:judgments.length/2,pairGoldAdmitted:eventPairs.length/2,
  providerOutputsFrozen:true,keySignaturesVerified:true,
  reviewerIndependenceProvenBySignature:false,actualOriginalVideoAccessVerified:false,
  realScientificAccuracyClaimAllowed:false,rawVideoOrTranscriptStored:false,productRankingModified:false};
}
