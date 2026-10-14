/** Phase206: independently reviewable, fail-closed video evidence benchmark.
 * Bounded offline evaluation only: no network, transcript, model inference, publisher
 * text, rank change, public trust badge or automatically asserted ground truth.
 * Source observations and predictions must be independently labelled before scoring.
 */
import {canonicalReviewableVideo209} from './phase209_licensed_original_media.js';

const error=(reason:string):never=>{throw new Error('phase206_'+reason);};
const id=(v:unknown):v is string=>typeof v==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(v)&&!['__proto__','constructor','prototype'].includes(v);
const uniq=(x:readonly string[])=>new Set(x).size===x.length;
const exactKeys=(v:unknown,allowed:readonly string[])=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&
 Object.keys(v).every(k=>allowed.includes(k));
const safeUrl=(s:unknown):s is string=>typeof s==='string'&&s.length<=1024&&/^https:\/\//.test(s);
const text=(s:unknown,max=180):s is string=>typeof s==='string'&&s.length>0&&s.length<=max&&
 s.trim()===s&&!/[\u0000-\u001f\u007f]/.test(s);
const integers=(x:unknown):x is number=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=0&&x<=86400;
export type ReviewBasis206='metadata_only'|'human_viewed_video'|'permitted_transcript_checked';
export type ClaimKind206='instrumental_claim'|'specialist_result'|'daily_use'|'personal_preference'|'commercial_pitch'|'unknown';
export type ExpertiseKind206='technical_specific'|'specialist_outcome_specific'|'situated_experience'|'not_established'|'unknown';
export type ModelScope206='exact_variant_confirmed'|'not_exact_variant'|'unresolved';
export type Originality206='independent_event_supported'|'derived_or_repeated'|'unresolved';
export type Conflict206='commercial_disclosure_present'|'no_disclosure_observed'|'undetermined';
export interface Case206 {
 caseId:string;videoUrl:string;categoryId:string;variantId:string;criterionId:string;
 disciplineId:string;language:string;referenceUrl:string;sourceReviewId:string|null;
 reviewBasis:ReviewBasis206; /** Real-source metadata are NOT video/content annotations. */
 sourceKind:'public_metadata_lead'|'reviewed_original_video'|'synthetic_fixture';
}
export interface CaseJudgment206 {
 caseId:string;reviewerId:string;receiptId:string;blindToPrediction:true;
 claimKind:ClaimKind206;expertise:ExpertiseKind206;modelScope:ModelScope206;
 originality:Originality206;commercial:Conflict206;
 /** Reference to the moment actually inspected, or null when not checked. */
 timeSecond:number|null;
}
export type EventRelation206='same_test_event'|'different_test_event'|'unresolved';
export interface EventPair206{left:string;right:string;reviewerId:string;receiptId:string;
 blindToPrediction:true;relation:EventRelation206;}
export interface Prediction206 {
 caseId:string;providerId:string;providerVersion:string;
 claimKind:ClaimKind206|null;expertise:ExpertiseKind206|null;
 modelScope:ModelScope206|null;originality:Originality206|null;
 commercial:Conflict206|null;timeSecond:number|null;
 /** Uncertainty is explicit; null means abstain, not 'unknown' truth. */
}
export interface PairPrediction206 {left:string;right:string;providerId:string;providerVersion:string;
 relation:EventRelation206|null;}
export interface BenchmarkDataset206 {schema:'206.dataset.1';datasetId:string;
 provenance:'authored_fixture'|'source_linked_unblinded_pilot'|'independent_blind_annotations';
 cases:readonly Case206[];judgments:readonly CaseJudgment206[];
 eventPairs:readonly EventPair206[];
}
export interface FieldMetrics206 {
 eligible:number;correct:number;incorrect:number;abstained:number;conflicted:number;unresolvedGold:number;
 accuracyOnPredictions:number|null;coverage:number|null;
 /** A micro result is NOT independent evidence of production accuracy. */
 confusion:readonly {actual:string;predicted:string;count:number}[];
}
export interface BenchmarkResult206 {
 schema:'206.benchmark.1';state:'research_only';datasetId:string;providerId:string;
 providerVersion:string;provenance:BenchmarkDataset206['provenance'];
 casesTotal:number;metadataOnlyCases:number;independentlyLabelledCases:number;
 casesWithUnresolvedReview:number;fields:Readonly<Record<string,FieldMetrics206>>;
 eventPairs:{eligible:number;falseMerges:number;falseSplits:number;abstained:number;
 unresolvedGold:number;trueMatches:number};
 eligibleTimestampPairs:number;timestampWithinFiveSeconds:number;timestampUnscored:number;
 missingEvidenceReasonCodes:readonly string[];independentScientificValidationClaimAllowed:false;
 sourceOriginalityAuthenticated:false;sourceTextStored:false;rankingsChanged:false;
 outputTrustBadgeAllowed:false;unknownSourcePenaltyApplied:false;
}
const claims=['instrumental_claim','specialist_result','daily_use','personal_preference','commercial_pitch','unknown'];
const expertise=['technical_specific','specialist_outcome_specific','situated_experience','not_established','unknown'];
const scopes=['exact_variant_confirmed','not_exact_variant','unresolved'];
const originals=['independent_event_supported','derived_or_repeated','unresolved'];
const commercials=['commercial_disclosure_present','no_disclosure_observed','undetermined'];
const fields={claimKind:claims,expertise,modelScope:scopes,originality:originals,commercial:commercials} as const;
type Field206=keyof typeof fields;
const pairKey=(left:string,right:string)=>[left,right].sort().join('|');

function validate206(d:BenchmarkDataset206,pred:readonly Prediction206[],pp:readonly PairPrediction206[],providerId:string,version:string):void{
 if(!exactKeys(d,['schema','datasetId','provenance','cases','judgments','eventPairs'])||
  d.schema!=='206.dataset.1'||!id(d.datasetId)||
  !['authored_fixture','source_linked_unblinded_pilot','independent_blind_annotations'].includes(d.provenance)||
  !Array.isArray(d.cases)||d.cases.length>250||!Array.isArray(d.judgments)||d.judgments.length>600||
  !Array.isArray(d.eventPairs)||d.eventPairs.length>1000||
  !Array.isArray(pred)||pred.length>250||!Array.isArray(pp)||pp.length>1000||
  !id(providerId)||!text(version,80))error('dataset');
 const cids=new Set<string>(),scopesSeen=new Set<string>();
 for(const c of d.cases){
  if(!exactKeys(c,['caseId','videoUrl','categoryId','variantId','criterionId','disciplineId','language','referenceUrl','sourceReviewId','reviewBasis','sourceKind'])||
   !id(c.caseId)||!id(c.categoryId)||!id(c.variantId)||!id(c.criterionId)||!id(c.disciplineId)||
   !text(c.language,12)||!safeUrl(c.referenceUrl)||
   !(c.sourceReviewId===null||id(c.sourceReviewId))||
   !['metadata_only','human_viewed_video','permitted_transcript_checked'].includes(c.reviewBasis)||
   !['public_metadata_lead','reviewed_original_video','synthetic_fixture'].includes(c.sourceKind)||
   (c.reviewBasis==='metadata_only'&&c.sourceReviewId!==null)||
   (c.reviewBasis!=='metadata_only'&&c.sourceReviewId===null)||
   (c.sourceKind==='public_metadata_lead'&&c.reviewBasis!=='metadata_only')||
   (d.provenance==='authored_fixture'&&c.sourceKind!=='synthetic_fixture')||
   (d.provenance!=='authored_fixture'&&c.sourceKind==='synthetic_fixture'))error('case');
  const video=canonicalReviewableVideo209(c.videoUrl);
  if(c.referenceUrl!==video.url||cids.has(c.caseId))error('video_or_duplicate_case');
  const scope=[video.url,c.variantId,c.criterionId,c.disciplineId].join('|');
  if(scopesSeen.has(scope))error('duplicate_scope');
  scopesSeen.add(scope);cids.add(c.caseId);
 }
 const reviews=new Set<string>(),group=new Map<string,CaseJudgment206[]>();
 for(const r of d.judgments){
  if(!exactKeys(r,['caseId','reviewerId','receiptId','blindToPrediction','claimKind','expertise','modelScope','originality','commercial','timeSecond'])||
   !cids.has(r.caseId)||!id(r.reviewerId)||!id(r.receiptId)||r.blindToPrediction!==true||
   !Object.entries(fields).every(([f,values])=>(values as readonly string[]).includes(String(r[f as Field206])))||
   !(r.timeSecond===null||integers(r.timeSecond))||reviews.has(r.receiptId))error('judgment');
  reviews.add(r.receiptId);group.set(r.caseId,[...(group.get(r.caseId)??[]),r]);
 }
 for(const c of d.cases){
  const entries=group.get(c.caseId)??[];
  if(c.reviewBasis==='metadata_only'&&entries.length)error('metadata_has_gold');
  if(entries.length>3||new Set(entries.map(r=>r.reviewerId)).size!==entries.length)error('reviewer_independence');
 }
 const seenPairs=new Map<string,Set<string>>();
 for(const p of d.eventPairs){
  if(!exactKeys(p,['left','right','reviewerId','receiptId','blindToPrediction','relation'])||
   !cids.has(p.left)||!cids.has(p.right)||p.left===p.right||!id(p.reviewerId)||!id(p.receiptId)||
   p.blindToPrediction!==true||!['same_test_event','different_test_event','unresolved'].includes(p.relation)||
   reviews.has(p.receiptId))error('event_judgment');
  const a=d.cases.find(x=>x.caseId===p.left)!,b=d.cases.find(x=>x.caseId===p.right)!;
  if(a.reviewBasis==='metadata_only'||b.reviewBasis==='metadata_only'||
   (p.relation==='same_test_event'&&(a.variantId!==b.variantId||a.criterionId!==b.criterionId)))error('event_scope');
  const key=pairKey(p.left,p.right),set=seenPairs.get(key)??new Set<string>();
  if(set.has(p.reviewerId)||set.size>=3)error('event_reviewer');
  set.add(p.reviewerId);seenPairs.set(key,set);reviews.add(p.receiptId);
 }
 const preds=new Set<string>();
 for(const p of pred){
  if(!exactKeys(p,['caseId','providerId','providerVersion','claimKind','expertise','modelScope','originality','commercial','timeSecond'])||
   !cids.has(p.caseId)||p.providerId!==providerId||p.providerVersion!==version||preds.has(p.caseId)||
   !Object.entries(fields).every(([f,values])=>p[f as Field206]===null||(values as readonly string[]).includes(String(p[f as Field206])))||
   !(p.timeSecond===null||integers(p.timeSecond)))error('prediction');
  preds.add(p.caseId);
 }
 const ppSet=new Set<string>();
 for(const p of pp){
  if(!exactKeys(p,['left','right','providerId','providerVersion','relation'])||
   !cids.has(p.left)||!cids.has(p.right)||p.left===p.right||p.providerId!==providerId||p.providerVersion!==version||
   !(p.relation===null||['same_test_event','different_test_event','unresolved'].includes(p.relation))||
   ppSet.has(pairKey(p.left,p.right)))error('pair_prediction');
  ppSet.add(pairKey(p.left,p.right));
 }
}
/** An evaluator measures only previously blinded, source-reviewed labels. Conflicts
 * are not adjudicated by the model or hidden by a majority from the same source. */
export function evaluateVideoEvidence206(d:BenchmarkDataset206,predictions:readonly Prediction206[],
 pairPredictions:readonly PairPrediction206[],providerId:string,providerVersion:string):BenchmarkResult206{
 validate206(d,predictions,pairPredictions,providerId,providerVersion);
 const gold=new Map<string,CaseJudgment206[]>();
 for(const j of d.judgments)gold.set(j.caseId,[...(gold.get(j.caseId)??[]),j]);
 const byPrediction=new Map(predictions.map(p=>[p.caseId,p]));
 const result:Record<string,FieldMetrics206>={};
 for(const field of Object.keys(fields) as Field206[]){
  let eligible=0,correct=0,incorrect=0,abstained=0,conflicted=0,unresolvedGold=0;
  const confusion=new Map<string,number>();
  for(const c of d.cases){
   const reviews=gold.get(c.caseId)??[];
   if(reviews.length<2)continue;
   const uniqueValues=new Set(reviews.map(r=>r[field]));
   if(uniqueValues.size!==1){conflicted++;continue;}
   const expected=reviews[0][field];
   if(['unknown','unresolved','undetermined'].includes(expected)){unresolvedGold++;continue;}
   eligible++;
   const received=byPrediction.get(c.caseId)?.[field]??null;
   if(received===null){abstained++;continue;}
   confusion.set(`${expected}\0${received}`,(confusion.get(`${expected}\0${received}`)??0)+1);
   if(received===expected)correct++;else incorrect++;
  }
  result[field]={eligible,correct,incorrect,abstained,conflicted,unresolvedGold,
   accuracyOnPredictions:correct+incorrect?correct/(correct+incorrect):null,
   coverage:eligible?(correct+incorrect)/eligible:null,
   confusion:[...confusion].map(([k,count])=>{const [actual,predicted]=k.split('\0');return {actual,predicted,count};})
    .sort((a,b)=>a.actual.localeCompare(b.actual)||a.predicted.localeCompare(b.predicted))};
 }
 const pairGold=new Map<string,EventPair206[]>();
 for(const p of d.eventPairs){const k=pairKey(p.left,p.right);pairGold.set(k,[...(pairGold.get(k)??[]),p]);}
 const pairPred=new Map(pairPredictions.map(p=>[pairKey(p.left,p.right),p]));
 let eligible=0,falseMerges=0,falseSplits=0,abstained=0,unresolvedGold=0,trueMatches=0;
 for(const [key,pairs] of pairGold){
  if(pairs.length<2||new Set(pairs.map(p=>p.relation)).size!==1||pairs[0].relation==='unresolved'){
   unresolvedGold++;continue;
  }
  eligible++;const prediction=pairPred.get(key)?.relation??null;
  if(prediction===null||prediction==='unresolved'){abstained++;continue;}
  if(prediction==='same_test_event'&&pairs[0].relation==='different_test_event')falseMerges++;
  else if(prediction==='different_test_event'&&pairs[0].relation==='same_test_event')falseSplits++;
  else trueMatches++;
 }
 let eligibleTimestampPairs=0,timestampWithinFiveSeconds=0,timestampUnscored=0;
 for(const c of d.cases){
  const values=gold.get(c.caseId)??[];
  if(values.length<2||values.some(v=>v.timeSecond===null)||
   new Set(values.map(v=>v.timeSecond)).size!==1)continue;
  eligibleTimestampPairs++;
  const prediction=byPrediction.get(c.caseId)?.timeSecond;
  if(prediction==null){timestampUnscored++;continue;}
  if(Math.abs(prediction-values[0].timeSecond!)<=5)timestampWithinFiveSeconds++;
 }
 const labelled=[...gold.values()].filter(v=>v.length>=2).length;
 const notes:string[]=[];
 if(d.cases.some(c=>c.reviewBasis==='metadata_only'))notes.push('source_metadata_is_not_video_content');
 if(labelled===0)notes.push('no_dual_reviewed_content_labels');
 if(d.provenance!=='independent_blind_annotations')notes.push('not_independent_blind_benchmark');
 if(Object.values(result).some(v=>v.unresolvedGold))notes.push('unknown_gold_values_not_scored');
 if(Object.values(result).some(v=>v.conflicted))notes.push('annotator_disagreements_not_adjudicated');
 if(unresolvedGold)notes.push('experiment_identity_requires_review');
 if(predictions.length===0)notes.push('no_provider_predictions');
 return {schema:'206.benchmark.1',state:'research_only',datasetId:d.datasetId,providerId,providerVersion,
  provenance:d.provenance,casesTotal:d.cases.length,
  metadataOnlyCases:d.cases.filter(c=>c.reviewBasis==='metadata_only').length,
  independentlyLabelledCases:labelled,casesWithUnresolvedReview:d.cases.length-labelled,
  fields:result,eventPairs:{eligible,falseMerges,falseSplits,abstained,unresolvedGold,trueMatches},
  eligibleTimestampPairs,timestampWithinFiveSeconds,timestampUnscored,
  missingEvidenceReasonCodes:notes.sort(),independentScientificValidationClaimAllowed:false,
  sourceOriginalityAuthenticated:false,sourceTextStored:false,rankingsChanged:false,
  outputTrustBadgeAllowed:false,unknownSourcePenaltyApplied:false};
}
