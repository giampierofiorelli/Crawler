/** Phase208: fair, fixed-sample comparison of source-evidence providers.
 * Calls the existing signed Phase207 intake and Phase206 benchmark. Does not
 * authenticate a reviewer, access original video, run a provider, establish
 * accuracy on real videos, recommend a product or authorize public trust marks.
 * Its purpose is to prevent incomparable experiments being described as a win.
 */
import {admitSignedBenchmark207,caseScopeFingerprint207,
 type AdmissionRequest207,type AdmissionResult207} from './phase207_signed_benchmark_admission.js';
import {type Prediction206,type CaseJudgment206} from './phase206_video_evidence_benchmark.js';

const fail=(reason:string):never=>{throw Error('phase208_'+reason);};
const isId=(x:unknown):x is string=>typeof x==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(x)&&
 !['__proto__','constructor','prototype'].includes(x);
const exact=(x:unknown,fields:readonly string[])=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).length===fields.length&&Object.keys(x).every(k=>fields.includes(k));
const distinct=(a:readonly string[])=>new Set(a).size===a.length;
const canonical=(x:unknown):string=>JSON.stringify(x);
const allFields=['claimKind','expertise','modelScope','originality','commercial'] as const;
type TrialField208=typeof allFields[number];
const nonGold=new Set(['unknown','unresolved','undetermined']);

export type ProviderFamily208='pee_native_205'|'youtubejs'|'youtube_transcript_api'|'pyabsa'|'other';
export interface TrialArm208 {
 armId:string;family:ProviderFamily208;
 /** This is an operator assertion, NOT proof that third-party code was executed. */
 runStatus:'not_executed'|'offline_output_submitted';
 admission:AdmissionRequest207;
}
export interface BuyingCriterion208 {
 criterionId:string;critical:boolean;
 expectedObservation:'instrumental_claim'|'specialist_result'|'daily_use'|'personal_preference';
}
export interface PairedTrialInput208 {
 schema:'pee208.paired-trial.v1';trialId:string;buyerUseCaseId:string;
 categoryId:string;criteria:readonly BuyingCriterion208[];
 arms:readonly TrialArm208[];
}
export interface ArmObservation208 {
 armId:string;family:ProviderFamily208;providerId:string;providerVersion:string;
 runStatus:TrialArm208['runStatus'];cases:number;admittedCases:number;heldCases:number;
 rejectedReviewAttestations:number;
 /** Fixed dataset; this reflects signed annotations, not demonstrated human independence. */
 fieldResults:AdmissionResult207['benchmark']['fields'];
 essentialCriterionIdentification:readonly {criterionId:string;labelledRelevant:number;
 identifiedCorrectly:number;misclassified:number;abstained:number;
 cannotInferGoodProduct:true}[];
 rawMediaAccessValidated:false;providerExecutionIndependentlyVerified:false;
}
export interface FieldPair208 {
 field:TrialField208;eligible:number;bothCorrect:number;bothWrong:number;
 leftCorrectOnly:number;rightCorrectOnly:number;leftOnlyResponded:number;rightOnlyResponded:number;
 bothAbstained:number;
}
export interface PairResult208 {
 leftArmId:string;rightArmId:string;fields:readonly FieldPair208[];
 /** Comparisons on signed synthetic labels cannot establish real-world advantage. */
 realWorldAdvantageEstablished:false;
}
export interface PairedTrialResult208 {
 schema:'pee208.paired-trial-result.v1';state:'research_only';trialId:string;
 buyerUseCaseId:string;datasetId:string;totalCases:number;metadataOnlyCases:number;
 reviewedCasesWithTwoSignatures:number;eligibleLabelledComparisons:number;
 arms:readonly ArmObservation208[];pairs:readonly PairResult208[];
 missingCriticalCriterionIds:readonly string[];
 resultState:'unscorable_no_shared_gold'|'signed_research_labels_only';
 reasonCodes:readonly string[];
 /** The guardrails remain true even when all input signatures verify. */
 independentHumanAnnotationAuthenticated:false;videoSourceBytesAuthenticated:false;
 publishedSourceAccessProven:false;providerRuntimeMeasured:false;
 statisticalSuperiorityClaimAllowed:false;scientificAccuracyClaimAllowed:false;
 userPurchaseRecommendationChanged:false;publisherFullTextRetained:false;
 publicTrustBadgeAuthorized:false;
}

function canonicalReviewSet208(r:AdmissionRequest207){
 const sort=(entries:readonly unknown[])=>entries.map(canonical).sort();
 const anchors=r.policy.anchors.map(a=>[a.keyId,a.principalId,a.role,a.publicKeyPem,a.activeFrom,a.activeThrough]).sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
 return canonical([r.datasetId,r.asOf,r.policy.policyId,anchors,
  sort(r.caseReviews),sort(r.pairReviews)]);
}
function goldFor208(judgments:readonly CaseJudgment206[],caseId:string,field:TrialField208):string|null{
 const two=judgments.filter(j=>j.caseId===caseId);
 if(two.length!==2||two[0][field]!==two[1][field]||nonGold.has(two[0][field]))return null;
 return two[0][field];
}
function predictionField208(p:Prediction206|undefined,f:TrialField208):string|null{
 return p?.[f]??null;
}
/** Only fair when all arms have the same source, exact product variants, verified
 * signing-policy trust anchors and literally the same signed human review set.
 * Execution status is reported, not promoted to independently witnessed latency.
 */
export function comparePairedVideoProviders208(input:PairedTrialInput208):PairedTrialResult208{
 if(!exact(input,['schema','trialId','buyerUseCaseId','categoryId','criteria','arms'])||
  input.schema!=='pee208.paired-trial.v1'||!isId(input.trialId)||
  !isId(input.buyerUseCaseId)||!isId(input.categoryId)||
  !Array.isArray(input.criteria)||!input.criteria.length||input.criteria.length>30||
  !Array.isArray(input.arms)||input.arms.length<2||input.arms.length>5)fail('trial');
 if(input.criteria.some(c=>!exact(c,['criterionId','critical','expectedObservation'])||
  !isId(c.criterionId)||typeof c.critical!=='boolean'||
  !['instrumental_claim','specialist_result','daily_use','personal_preference'].includes(c.expectedObservation))||
  !distinct(input.criteria.map(c=>c.criterionId))||
  !input.criteria.some(c=>c.critical))fail('criteria');
 if(input.arms.some(a=>!exact(a,['armId','family','runStatus','admission'])||!isId(a.armId)||
  !['pee_native_205','youtubejs','youtube_transcript_api','pyabsa','other'].includes(a.family)||
  !['not_executed','offline_output_submitted'].includes(a.runStatus))||
  !distinct(input.arms.map(a=>a.armId)))fail('arms');
 for(const a of input.arms){
  if(!a.admission||!Array.isArray(a.admission.cases)||
   !Array.isArray(a.admission.caseReviews)||!Array.isArray(a.admission.pairReviews)||
   !a.admission.policy||!Array.isArray(a.admission.policy.anchors))fail('malformed_arm');
 }
 const baseline=input.arms[0].admission;
 const baseCases=baseline.cases.map(c=>[c.caseId,caseScopeFingerprint207(c)]).sort((a,b)=>a[0].localeCompare(b[0]));
 const reviews=canonicalReviewSet208(baseline);
 const observedFamilies=new Set<string>();
 const validated:{arm:TrialArm208;result:AdmissionResult207}[]=[];
 for(const arm of input.arms){
  const req=arm.admission;
  if(!req||req.datasetId!==baseline.datasetId||
   canonical(req.cases.map(c=>[c.caseId,caseScopeFingerprint207(c)]).sort((a,b)=>a[0].localeCompare(b[0])))!==canonical(baseCases)||
   canonicalReviewSet208(req)!==reviews)fail('not_same_sources_or_gold');
  if(observedFamilies.has(arm.family))fail('duplicate_provider_family');
  observedFamilies.add(arm.family);
  if(arm.runStatus==='not_executed'&&(req.predictions.length||req.pairPredictions.length))fail('not_run_with_predictions');
  // Reuse signature checking, exact-scope checks and gold admission unchanged.
  const result=admitSignedBenchmark207(req);
  if(result.dataset.cases.some(c=>c.categoryId!==input.categoryId))fail('category_mismatch');
  validated.push({arm,result});
 }
 const reference=validated[0].result;
 const caseIds=reference.dataset.cases.map(c=>c.caseId).sort();
 const sharedGold=reference.dataset.judgments;
 const criteria=input.criteria;
 const missingCritical=criteria.filter(c=>c.critical&&
  !reference.dataset.cases.some(s=>s.criterionId===c.criterionId&&
   goldFor208(sharedGold,s.caseId,'claimKind')===c.expectedObservation&&
   goldFor208(sharedGold,s.caseId,'modelScope')==='exact_variant_confirmed')).map(c=>c.criterionId).sort();
 const arms:ArmObservation208[]=validated.map(({arm,result})=>{
  const predicted=new Map(arm.admission.predictions.map(p=>[p.caseId,p]));
  return {armId:arm.armId,family:arm.family,providerId:arm.admission.frozen.payload.providerId,
   providerVersion:arm.admission.frozen.payload.providerVersion,runStatus:arm.runStatus,
   cases:caseIds.length,admittedCases:result.caseGoldAdmitted,heldCases:result.heldCases.length,
   rejectedReviewAttestations:result.rejected.length,fieldResults:result.benchmark.fields,
   essentialCriterionIdentification:criteria.map(c=>{
    let labelledRelevant=0,identifiedCorrectly=0,misclassified=0,abstained=0;
    for(const s of reference.dataset.cases.filter(x=>x.criterionId===c.criterionId)){
     if(goldFor208(sharedGold,s.caseId,'claimKind')!==c.expectedObservation||
      goldFor208(sharedGold,s.caseId,'modelScope')!=='exact_variant_confirmed')continue;
     labelledRelevant++;
     const p=predicted.get(s.caseId);
     if(!p||p.claimKind===null||p.modelScope===null)abstained++;
     else if(p.claimKind===c.expectedObservation&&p.modelScope==='exact_variant_confirmed')identifiedCorrectly++;
     else misclassified++;
    }
    return {criterionId:c.criterionId,labelledRelevant,identifiedCorrectly,misclassified,abstained,
     cannotInferGoodProduct:true as const};
   }),rawMediaAccessValidated:false as const,providerExecutionIndependentlyVerified:false as const};
 });
 const pairs:PairResult208[]=[];
 for(let i=0;i<validated.length;i++)for(let k=i+1;k<validated.length;k++){
  const left=validated[i],right=validated[k];
  const lp=new Map(left.arm.admission.predictions.map(p=>[p.caseId,p]));
  const rp=new Map(right.arm.admission.predictions.map(p=>[p.caseId,p]));
  const fields:FieldPair208[]=allFields.map(field=>{
   let eligible=0,bothCorrect=0,bothWrong=0,leftCorrectOnly=0,rightCorrectOnly=0;
   let leftOnlyResponded=0,rightOnlyResponded=0,bothAbstained=0;
   for(const cid of caseIds){
    const gold=goldFor208(sharedGold,cid,field);
    if(gold===null)continue;
    eligible++;
    const a=predictionField208(lp.get(cid),field),b=predictionField208(rp.get(cid),field);
    if(a===null&&b===null)bothAbstained++;
    else if(a!==null&&b===null)leftOnlyResponded++;
    else if(a===null&&b!==null)rightOnlyResponded++;
    else if(a===gold&&b===gold)bothCorrect++;
    else if(a!==gold&&b!==gold)bothWrong++;
    else if(a===gold)leftCorrectOnly++;
    else rightCorrectOnly++;
   }
   return {field,eligible,bothCorrect,bothWrong,leftCorrectOnly,rightCorrectOnly,
    leftOnlyResponded,rightOnlyResponded,bothAbstained};
  });
  pairs.push({leftArmId:left.arm.armId,rightArmId:right.arm.armId,fields,realWorldAdvantageEstablished:false});
 }
 const eligibleLabelledComparisons=pairs.reduce((sum,p)=>sum+p.fields.reduce((n,f)=>n+f.eligible,0),0);
 const reasonCodes:string[]=[];
 if(reference.caseGoldAdmitted===0)reasonCodes.push('no_two_signed_source_reviews');
 if(missingCritical.length)reasonCodes.push('missing_critical_outcome_review');
 if(input.arms.some(a=>a.runStatus==='not_executed'))reasonCodes.push('some_provider_implementations_not_run');
 if(reference.dataset.cases.some(c=>c.reviewBasis==='metadata_only'))reasonCodes.push('public_metadata_only_not_original_video_review');
 reasonCodes.push('signatures_not_external_identity_or_source_access_proof','no_verified_real_world_provider_comparison');
 return {schema:'pee208.paired-trial-result.v1',state:'research_only',trialId:input.trialId,
  buyerUseCaseId:input.buyerUseCaseId,datasetId:baseline.datasetId,totalCases:caseIds.length,
  metadataOnlyCases:reference.dataset.cases.filter(c=>c.reviewBasis==='metadata_only').length,
  reviewedCasesWithTwoSignatures:reference.caseGoldAdmitted,eligibleLabelledComparisons,
  arms,pairs,missingCriticalCriterionIds:missingCritical,
  resultState:eligibleLabelledComparisons===0?'unscorable_no_shared_gold':'signed_research_labels_only',
  reasonCodes:reasonCodes.sort(),independentHumanAnnotationAuthenticated:false,
  videoSourceBytesAuthenticated:false,publishedSourceAccessProven:false,providerRuntimeMeasured:false,
  statisticalSuperiorityClaimAllowed:false,scientificAccuracyClaimAllowed:false,
  userPurchaseRecommendationChanged:false,publisherFullTextRetained:false,publicTrustBadgeAuthorized:false};
}
