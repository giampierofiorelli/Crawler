/** Phase216: bounded comparison of *transient* ASR quantity hypotheses with
 * analyst-observed manufacturer specifications. NOT authentication of producer
 * pages, review method, the audio words, or independent product performance.
 * Reuse Phase212 input checks, Phase210 receipt and Phase215 flags.
 */
import {evaluateLocalAsr212, type Transcript212} from './phase212_local_asr_evaluation.js';
import type {UserUploadReceipt210} from './phase210_user_supplied_video.js';
import type {CrossDecode215} from './phase215_asr_crossdecode_review.js';

const err=(s:string):never=>{throw Error('phase216_'+s);};
const ident=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_.:-]{0,90}$/.test(s)&&!['constructor','prototype','__proto__'].includes(s);
const hex=(s:unknown):s is string=>typeof s==='string'&&/^[0-9a-f]{64}$/.test(s);
const numeric=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1_000_000;
const integer=(n:unknown):n is number=>numeric(n)&&Number.isInteger(n);
const surfaceUnits=['nit','nits','bit','bits','hit','hits','hz','hertz','gram','grams','g','kg','watt','watts','w','°c'] as const;
export type Unit216=typeof surfaceUnits[number];
export type CanonicalUnit216='nit'|'hz'|'g'|'w'|'celsius'|'unknown';
const unit=(u:Unit216):CanonicalUnit216=>({nit:'nit',nits:'nit',hz:'hz',hertz:'hz',gram:'g',grams:'g',g:'g',kg:'g',w:'w',watt:'w',watts:'w', '°c':'celsius'} as Record<string,CanonicalUnit216>)[u]??'unknown';
const convert=(v:number,u:Unit216)=>u==='kg'?v*1000:v;
const safeUrl=(s:unknown):s is string=>{
 if(typeof s!=='string'||s.length>1024)return false;
 try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password&&!u.hash&&!u.port&&!!u.hostname;}
 catch{return false;}
};
const norm=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/,/g,'').replace(/\s+/g,' ');
const matchesSpoken=(text:string,v:number,u:Unit216)=>{
 // Require exactly the annotated surface unit in the transient ASR: never
 // replace a hallucinated 'bits' with a purportedly spoken 'nits'.
 const escaped=u.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const p=new RegExp(`(^|[^\\p{L}\\d])${String(v).replace('.', '\\.')}(?:\\s+)??${escaped}(?![\\p{L}])`,'iu');
 return p.test(norm(text));
};
export interface SpecObservation216{
 factId:string;sourceUrl:string;publisher:'manufacturer';reviewMode:'analyst_observed_public_page';
 sourceByteHash:null;checkedDate:string;variantId:string;market:string;
 metricId:string;conditionId:string;value:number;unit:Unit216;
}
export interface ClaimHypothesis216{
 claimId:string;startSecond:number;endSecond:number;segmentIds:string[];
 kind:'manufacturer_spec_report'|'reviewer_measurement_report';
 metricId:string;conditionId:string;variantId:string;comparisonVariantId:string|null;
 market:string|null;value:number;heardUnit:Unit216;
}
export interface ClaimReviewResult216{
 claimId:string;startSecond:number;endSecond:number;metricId:string;conditionId:string;
 variants:string[];reported:{value:number;surfaceUnit:Unit216};
 state:'spec_quantity_matches'|'possible_asr_unit_error'|'spec_quantity_disagrees'|
 'market_scope_unresolved'|'conflicting_primary_pages'|'insufficient_comparable_specs'|'invalid_measurement_inference';
 specComparison:'analyst_observed_manufacturer_statement_only';
 comparedFacts:{factId:string;sourceUrl:string;market:string;value:number;unit:Unit216}[];
 crossDecodeAlerts:string[];visualTemporalProximitySeconds:number[];
 originalPublisherVideoAuthenticated:false;spokenWordsVerified:false;
 reviewExperimentIndependentlyVerified:false;manufacturerClaimsIndependentlyMeasured:false;
 allowedAsPerformanceEvidence:false;rankingAuthorized:false;trustBadgeAuthorized:false;
}
export interface Triage216{
 schema:'pee216.primary-claim-triage.v1';uploadSha256:string;modelSha256:string;
 state:'research_only';transcriptBodyRetained:false;publisherBodiesRetained:false;framesRetained:false;
 inputVerifiedModelRan:true;sourcePagesByteAuthenticated:false;
 inputCrossDecodeIsCorrelated:true;claims:ClaimReviewResult216[];
 goldAccuracy:null;independentReviewers:0;rankingAuthorized:false;trustBadgeAuthorized:false;
}
export function triagePrimaryClaims216(input:{transcript:Transcript212;receipt:UserUploadReceipt210;
 crossDecode:CrossDecode215;claims:ClaimHypothesis216[];facts:SpecObservation216[]}):Triage216{
 const {transcript:t,receipt:r,crossDecode:c,claims,facts}=input;
 evaluateLocalAsr212(t,null);
 if(!r||r.schema!=='pee210.user-upload-receipt.v1'||r.observedUploadSha256!==t.uploadSha256||
  !hex(r.observedUploadSha256)||r.sourceOriginalAuthenticated!==false||r.rankingAuthorized!==false||
  !Number.isFinite(r.durationSeconds)||Math.abs(r.durationSeconds-t.durationSeconds)>.2)err('receipt_identity');
 if(!c||c.schema!=='pee215.crossdecode-triage.v1'||c.uploadSha256!==t.uploadSha256||
  c.modelSha256!==t.runtime.modelSha256||c.productEvidenceAdmissionAuthorized!==false||
  c.noAlertsIsNotAccuracy!==true||!Array.isArray(c.alerts))err('crossdecode_identity');
 if(!Array.isArray(claims)||claims.length>70||!Array.isArray(facts)||facts.length>300)err('input_size');
 const factIds=new Set<string>();
 for(const f of facts){
  if(!ident(f?.factId)||factIds.has(f.factId)||!safeUrl(f.sourceUrl)||f.publisher!=='manufacturer'||
   f.reviewMode!=='analyst_observed_public_page'||f.sourceByteHash!==null||
   !/^\d{4}-\d{2}-\d{2}$/.test(f.checkedDate)||!ident(f.variantId)||!ident(f.market)||
   !ident(f.metricId)||!ident(f.conditionId)||!numeric(f.value)||!surfaceUnits.includes(f.unit)||
   unit(f.unit)==='unknown')err('fact');
  factIds.add(f.factId);
 }
 const out:ClaimReviewResult216[]=[];const claimIds=new Set<string>();
 for(const h of claims){
  if(!ident(h?.claimId)||claimIds.has(h.claimId)||!numeric(h.startSecond)||!numeric(h.endSecond)||
   h.endSecond<=h.startSecond||h.endSecond>t.durationSeconds+.02||
   !['manufacturer_spec_report','reviewer_measurement_report'].includes(h.kind)||
   !ident(h.metricId)||!ident(h.conditionId)||!ident(h.variantId)||
   (h.comparisonVariantId!==null&&(!ident(h.comparisonVariantId)||h.comparisonVariantId===h.variantId))||
   (h.market!==null&&!ident(h.market))||!numeric(h.value)||!surfaceUnits.includes(h.heardUnit)||
   !Array.isArray(h.segmentIds)||h.segmentIds.length<1||h.segmentIds.length>12||
   new Set(h.segmentIds).size!==h.segmentIds.length)err('claim');
  claimIds.add(h.claimId);
  const selected=h.segmentIds.map(id=>t.segments.find(s=>s.id===id));
  if(selected.some(s=>!s||s.startSecond>=h.endSecond||s.endSecond<=h.startSecond)||
   !matchesSpoken(selected.map(s=>s!.text).join(' '),h.value,h.heardUnit))err('unsupported_asr_claim');
  const relevant=facts.filter(f=>f.metricId===h.metricId&&f.conditionId===h.conditionId&&
   (f.variantId===h.variantId||f.variantId===h.comparisonVariantId));
  const usable=h.market===null?relevant:relevant.filter(f=>f.market===h.market);
  const byMarket=new Map<string,SpecObservation216[]>();
  for(const f of usable){const arr=byMarket.get(f.market)??[];arr.push(f);byMarket.set(f.market,arr);}
  const isDiff=h.comparisonVariantId!==null;
  const comparisons:{market:string;facts:SpecObservation216[];amount:number;unit:CanonicalUnit216}[]=[];
  let contradictory=false;
  for(const [market,all] of byMarket){
   const scoped=[h.variantId,...(h.comparisonVariantId?[h.comparisonVariantId]:[])];
   const chosen:SpecObservation216[]=[];let inconsistent=false;
   for(const variant of scoped){
    const list=all.filter(f=>f.variantId===variant);
    if(!list.length){inconsistent=true;break;}
    const canonical=list.map(f=>[convert(f.value,f.unit),unit(f.unit)] as const);
    if(canonical.some(([n,u])=>u!==canonical[0][1]||Math.abs(n-canonical[0][0])>.000001)){
     contradictory=true;inconsistent=true;break;
    }
    chosen.push(...list);
   }
   if(inconsistent)continue;
   const primary=all.find(f=>f.variantId===h.variantId)!;
   const other=isDiff?all.find(f=>f.variantId===h.comparisonVariantId)!:null;
   if(other&&unit(other.unit)!==unit(primary.unit)){contradictory=true;continue;}
   comparisons.push({market,facts:chosen,amount:convert(primary.value,primary.unit)-
    (other?convert(other.value,other.unit):0),unit:unit(primary.unit)});
  }
  let state:ClaimReviewResult216['state']='insufficient_comparable_specs';
  const requestedUnit=unit(h.heardUnit);
  if(h.kind==='reviewer_measurement_report')state='invalid_measurement_inference';
  else if(contradictory)state='conflicting_primary_pages';
  else if(!comparisons.length)state='insufficient_comparable_specs';
  else if(h.market===null&&(new Set(comparisons.map(k=>`${k.amount}|${k.unit}`)).size>1||
   new Set(relevant.map(f=>f.market)).size>comparisons.length))state='market_scope_unresolved';
  else if(comparisons.some(k=>k.unit!==requestedUnit)){
   // Units suspected if the *number* agrees with a manufacturer field. This
   // is NOT evidence that the person said the correct word.
   state=comparisons.every(k=>Math.abs(k.amount-convert(h.value,h.heardUnit))<.000001)&&requestedUnit==='unknown'
    ?'possible_asr_unit_error':'spec_quantity_disagrees';
  }else state=comparisons.every(k=>Math.abs(k.amount-convert(h.value,h.heardUnit))<.000001)
    ?'spec_quantity_matches':'spec_quantity_disagrees';
  const selectedFacts=(!comparisons.length?usable:comparisons.flatMap(x=>x.facts));
  const unique=[...new Map(selectedFacts.map(f=>[f.factId,f])).values()].sort((a,b)=>a.factId.localeCompare(b.factId));
  const alerts=[...new Set(c.alerts.filter(x=>x.windowStartSecond<h.endSecond&&x.windowEndSecond>h.startSecond)
   .flatMap(x=>x.alerts))].sort();
  const nearby=r.observations.filter(o=>o.atSecond>=h.startSecond-2&&o.atSecond<=h.endSecond+2)
   .map(o=>o.atSecond).sort((a,b)=>a-b);
  out.push({claimId:h.claimId,startSecond:h.startSecond,endSecond:h.endSecond,
   metricId:h.metricId,conditionId:h.conditionId,variants:[h.variantId,...(h.comparisonVariantId?[h.comparisonVariantId]:[])],
   reported:{value:h.value,surfaceUnit:h.heardUnit},state,
   specComparison:'analyst_observed_manufacturer_statement_only',
   comparedFacts:unique.map(f=>({factId:f.factId,sourceUrl:f.sourceUrl,market:f.market,value:f.value,unit:f.unit})),
   crossDecodeAlerts:alerts,visualTemporalProximitySeconds:nearby,
   originalPublisherVideoAuthenticated:false,spokenWordsVerified:false,reviewExperimentIndependentlyVerified:false,
   manufacturerClaimsIndependentlyMeasured:false,allowedAsPerformanceEvidence:false,rankingAuthorized:false,trustBadgeAuthorized:false});
 }
 out.sort((a,b)=>a.startSecond-b.startSecond||a.claimId.localeCompare(b.claimId));
 return {schema:'pee216.primary-claim-triage.v1',uploadSha256:t.uploadSha256,
  modelSha256:t.runtime.modelSha256,state:'research_only',transcriptBodyRetained:false,
  publisherBodiesRetained:false,framesRetained:false,inputVerifiedModelRan:true,
  sourcePagesByteAuthenticated:false,inputCrossDecodeIsCorrelated:true,claims:out,
  goldAccuracy:null,independentReviewers:0,rankingAuthorized:false,trustBadgeAuthorized:false};
}
