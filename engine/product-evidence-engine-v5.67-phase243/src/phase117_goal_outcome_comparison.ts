/** Phase117: query-neutral, cross-category comparison of independently measured goals.
 * Research adapter, NOT the public recommendation path.
 * The caller supplies a separately verified intent and a human-reviewed exact
 * measurement contract. This module never parses natural language, chooses a
 * favorable test horizon, infers performance from mechanisms, or publishes scores.
 */
import {createHash} from 'node:crypto';
import {validateModel116,type CategoryModel116,type Observed116} from './phase116_category_function_model.js';

export type Dimension117='outcome_effectiveness'|'time_efficiency'|'pass_efficiency'|'side_effect';
export type Direction117='higher_is_better'|'lower_is_better';
export type Protocol117={
 categoryId:string;goalId:string;endpointNodeId:string;dimension:Dimension117;
 metricId:string;unit:string;direction:Direction117;
 labId:string;protocolRevision:string;setupId:string;contextId:string;
 observationHorizonId:string;targetThresholdId:string|null;
};
export interface ExactContract117 extends Protocol117 {
 verification:'human_reviewed_exact_protocol';
 /** Human explanation of stain/surface/mode, ANC noise profile, or analogous scope. */
 scopeDescription:string;
}
export interface OutcomeRecord117 {
 variant:string;originalTestId:string;sourceUrl:string;
 /** Independent source assertion; production intake must verify it upstream. */
 evidenceBasis:'independent_measured'|'manufacturer_claim'|'independent_qualitative';
 reviewState:'reviewed_original'|'unreviewed';
 evidenceRevision:string;
 protocol:Protocol117;
 value:number;
 /** Optional uncertainty as explicitly reported in the original experiment. */
 reportedInterval?:{low:number;high:number;kind:'reported_ci'|'reported_range'};
}
export interface VerifiedGoalIntent117 {
 verification:'explicitly_verified_semantic_frame';
 categoryId:string;goalId:string;
 primaryDimension:Dimension117;
 /** The preference must never cause the canonical evidence to be overwritten. */
}
export interface Candidate117 {
 variant:string;status:'measured_comparable'|'missing_original_measurement'|'incompatible_protocol'|
   'unreviewed_or_indirect'|'multiple_original_tests_need_review'|'conflicting_original_record'|
   'uncertainty_not_comparable';
 rank:number|null;value:number|null;unit:string|null;
 originalTestIds:string[];sourceUrls:string[];reason:string;
 reportedInterval?:OutcomeRecord117['reportedInterval'];
}
const ident=(s:unknown)=>typeof s==='string'&&/^[a-z0-9][a-z0-9._:-]{0,160}$/.test(s);
const compare=(a:string,b:string)=>a<b?-1:a>b?1:0;
const unitId=(s:unknown)=>typeof s==='string'&&/^[A-Za-z%][A-Za-z0-9%._/:-]{0,80}$/.test(s);
const sha=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const validURL=(s:string)=>{try{const u=new URL(s);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password;}catch{return false;}};
const sorted=(xs:readonly string[])=>[...new Set(xs)].sort(compare);
const canonicalObservation=(r:OutcomeRecord117)=>[r.variant,r.originalTestId,r.sourceUrl,r.evidenceBasis,
 r.reviewState,r.evidenceRevision,pKey(r.protocol),r.value,r.reportedInterval?
 [r.reportedInterval.low,r.reportedInterval.high,r.reportedInterval.kind]:null];
function checkProtocol(p:Protocol117):void{
 if(!p||!unitId(p.unit)||![p.categoryId,p.goalId,p.endpointNodeId,p.metricId,p.labId,p.protocolRevision,p.setupId,
   p.contextId,p.observationHorizonId].every(ident)||
   !['outcome_effectiveness','time_efficiency','pass_efficiency','side_effect'].includes(p.dimension)||
   !['lower_is_better','higher_is_better'].includes(p.direction)||
   (p.targetThresholdId!==null&&!ident(p.targetThresholdId)))throw Error('invalid_measurement_protocol');
 if(['time_efficiency','pass_efficiency'].includes(p.dimension)&&p.targetThresholdId===null)
   throw Error('efficiency_requires_explicit_common_target');
}
const pKey=(p:Protocol117)=>JSON.stringify([p.categoryId,p.goalId,p.endpointNodeId,p.dimension,
 p.metricId,p.unit,p.direction,p.labId,p.protocolRevision,p.setupId,p.contextId,
 p.observationHorizonId,p.targetThresholdId]);
function checkRecord(r:OutcomeRecord117):void{
 if(!r||!ident(r.variant)||!ident(r.originalTestId)||!ident(r.evidenceRevision)||!validURL(r.sourceUrl)||
   !['independent_measured','manufacturer_claim','independent_qualitative'].includes(r.evidenceBasis)||
   !['reviewed_original','unreviewed'].includes(r.reviewState)||!Number.isFinite(r.value))throw Error('invalid_original_measurement');
 checkProtocol(r.protocol);
 if(r.reportedInterval){const {low,high,kind}=r.reportedInterval;
   if(!Number.isFinite(low)||!Number.isFinite(high)||low>high||r.value<low||r.value>high||
     !['reported_ci','reported_range'].includes(kind))throw Error('invalid_reported_uncertainty');}
}
function sameRecord(a:OutcomeRecord117,b:OutcomeRecord117){
 return JSON.stringify([a.variant,a.originalTestId,a.evidenceBasis,a.reviewState,a.evidenceRevision,pKey(a.protocol),a.value,a.reportedInterval??null])===
 JSON.stringify([b.variant,b.originalTestId,b.evidenceBasis,b.reviewState,b.evidenceRevision,pKey(b.protocol),b.value,b.reportedInterval??null]);
}
export function compareGoalOutcomes117(args:{
 model:CategoryModel116;intent:VerifiedGoalIntent117;contract:ExactContract117;
 snapshotId:string;evidenceRevision:string;variants:readonly string[];
 observations:readonly OutcomeRecord117[];
}){
 validateModel116(args.model);
 const {model,intent,contract}=args;
 if(intent.verification!=='explicitly_verified_semantic_frame'||
   contract.verification!=='human_reviewed_exact_protocol'||
   !contract.scopeDescription?.trim()||contract.scopeDescription.length>1500||
   !ident(args.snapshotId)||!ident(args.evidenceRevision))throw Error('unverified_intent_contract_or_snapshot');
 checkProtocol(contract);
 if(model.categoryId!==intent.categoryId||contract.categoryId!==intent.categoryId||
   contract.goalId!==intent.goalId||contract.dimension!==intent.primaryDimension)throw Error('intent_contract_mismatch');
 const goal=model.functions.find(f=>f.id===contract.goalId);
 const endpoint=model.endpoints.find(e=>e.id===contract.endpointNodeId);
 if(!goal||!endpoint||!model.links.some(l=>l.kind==='measured_by'&&l.from===endpoint.id&&l.to===goal.id))
   throw Error('no_direct_measured_goal_link');
 const variants=sorted(args.variants);
 if(variants.length<2||variants.length!==args.variants.length||variants.some(x=>!ident(x)))throw Error('invalid_candidate_set');
 for(const r of args.observations)checkRecord(r);
 // Preserve a canonical data snapshot irrespective of the user's desired lens.
 // It includes all observation classes, not just the chosen favorable metric.
 const normalized=[...args.observations].sort((a,b)=>compare(JSON.stringify(canonicalObservation(a)),JSON.stringify(canonicalObservation(b))));
 const snapshotFingerprint=sha({snapshotId:args.snapshotId,evidenceRevision:args.evidenceRevision,
   modelVersion:model.modelVersion,variants,observations:normalized.map(canonicalObservation)});
 const protocolKey=pKey(contract);
 const candidates:Candidate117[]=variants.map(variant=>{
   const records=normalized.filter(r=>r.variant===variant&&r.evidenceRevision===args.evidenceRevision);
   const related=records.filter(r=>r.protocol.categoryId===contract.categoryId&&
     r.protocol.goalId===contract.goalId&&r.protocol.endpointNodeId===contract.endpointNodeId&&
     r.protocol.dimension===contract.dimension&&r.protocol.metricId===contract.metricId);
   const exact=related.filter(r=>pKey(r.protocol)===protocolKey);
   const strong=exact.filter(r=>r.evidenceBasis==='independent_measured'&&r.reviewState==='reviewed_original');
   const sources=sorted((strong.length?strong:related).map(r=>r.sourceUrl));
   const originalIds=sorted((strong.length?strong:related).map(r=>r.originalTestId));
   const base={variant,rank:null,value:null,unit:null,originalTestIds:originalIds,sourceUrls:sources};
   const abstain=(status:Candidate117['status'],reason:string):Candidate117=>({...base,status,reason});
   if(!strong.length){
     if(exact.length)return abstain('unreviewed_or_indirect','Measured, independently reviewed original endpoint is unavailable');
     if(related.length)return abstain('incompatible_protocol','Method, revision, conditions, horizon, units or target differ');
     return abstain('missing_original_measurement','No corresponding original measurement; missing is not failure');
   }
   // Contradictory duplicate entries cannot be silently dismissed, even when
   // one copy has not yet passed source review.
   if(exact.some(r=>strong.some(s=>r.originalTestId===s.originalTestId&&
       (r.value!==s.value||pKey(r.protocol)!==pKey(s.protocol)))))
     return abstain('conflicting_original_record','Original-test copies disagree about the numerical endpoint');
   // A syndicated copy of the same original experiment adds no second vote.
   const perOriginal=new Map<string,OutcomeRecord117>();
   for(const r of strong){const previous=perOriginal.get(r.originalTestId);
     if(previous&&!sameRecord(previous,r))return abstain('conflicting_original_record','Same original experiment has contradictory records');
     if(!previous)perOriginal.set(r.originalTestId,r);
   }
   if(perOriginal.size>1)return abstain('multiple_original_tests_need_review','Multiple independent tests need an approved synthesis policy');
   const r=[...perOriginal.values()][0];
   return {...base,status:'measured_comparable' as const,value:r.value,unit:r.protocol.unit,
     reason:'Exact independently measured endpoint under reviewed conditions',
     ...(r.reportedInterval?{reportedInterval:r.reportedInterval}:{})};
 });
 let complete=candidates.every(c=>c.status==='measured_comparable');
 // Overlapping uncertainty does not justify an ordered superiority claim or an equivalence claim.
 if(complete&&candidates.some(c=>c.reportedInterval)){
   for(let i=0;i<candidates.length;i++)for(let j=i+1;j<candidates.length;j++){
     const a=candidates[i],b=candidates[j];
     if(!a.reportedInterval||!b.reportedInterval){complete=false;break;}
     if(a.reportedInterval.low<=b.reportedInterval.high&&b.reportedInterval.low<=a.reportedInterval.high)
       complete=false;
   }
   if(!complete)for(const c of candidates)if(c.status==='measured_comparable'){
     c.status='uncertainty_not_comparable';c.reason='Uncertainty overlaps or is unavailable for at least one comparison';}
 }
 const ordering=complete?[...candidates].sort((a,b)=>
   (contract.direction==='lower_is_better'?a.value!-b.value!:b.value!-a.value!)||compare(a.variant,b.variant)):[];
 for(let i=0;i<ordering.length;i++)ordering[i].rank=i>0&&ordering[i].value===ordering[i-1].value?
   ordering[i-1].rank:i+1;
 candidates.sort((a,b)=>a.rank!==null&&b.rank!==null?a.rank-b.rank||compare(a.variant,b.variant):compare(a.variant,b.variant));
 return {phase:117,purpose:'research_only_not_a_public_product_ranking',categoryId:model.categoryId,
   modelVersion:model.modelVersion,snapshotId:args.snapshotId,snapshotFingerprint,
   intentFingerprint:sha([intent.categoryId,intent.goalId,intent.primaryDimension,pKey(contract)]),
   primaryDimension:intent.primaryDimension,scopeDescription:contract.scopeDescription,
   candidates,fullCandidateRankingAvailable:complete,
   observedRanking:complete?candidates.map(c=>({variant:c.variant,rank:c.rank})):null,
   pointEstimateOrderingNotStatisticalSuperiority:true,mechanismsNotUsedAsPerformanceScores:true,
   mixedLabProtocolsSilentlyCombined:false,originalReviewTextNeeded:false,consumerPublicationReady:false};
}
/** Transfer an already independently measured Phase116 endpoint ONLY after the
 * reviewer explicitly supplies the missing lab, setup, revision, horizon, metric
 * and context. A mechanism observation is never accepted as performance data.
 */
export function reviewedObservationBridge116To117(model:CategoryModel116,observation:Observed116,protocol:Protocol117|null,evidenceRevision:string):
 {status:'mapped';record:OutcomeRecord117}|{status:'needs_review';reason:string}{
 if(observation.basis!=='independent_measured'||observation.finding!=='present'||
   !Number.isFinite(observation.value)||!observation.unit||!observation.testProtocol)
   return {status:'needs_review',reason:'not_an_original_independent_measured_endpoint'};
 if(!protocol)return {status:'needs_review',reason:'missing_reviewed_horizon_and_context'};
 validateModel116(model);
 checkProtocol(protocol);
 if(model.categoryId!==protocol.categoryId||observation.nodeId!==protocol.endpointNodeId||
   !model.links.some(l=>l.kind==='measured_by'&&l.from===protocol.endpointNodeId&&l.to===protocol.goalId)||
   !model.endpoints.some(e=>e.id===protocol.endpointNodeId&&e.target===observation.target))
   return {status:'needs_review',reason:'not_a_directly_linked_measured_goal_endpoint'};
 if(protocol.unit!==observation.unit||protocol.protocolRevision!==observation.testProtocol)
   return {status:'needs_review',reason:'reported_unit_or_protocol_version_mismatch'};
 const record:OutcomeRecord117={variant:observation.productVariant,originalTestId:observation.originalTestId,
   sourceUrl:observation.sourceUrl,evidenceBasis:'independent_measured',reviewState:'reviewed_original',
   evidenceRevision,protocol,value:observation.value!};
 checkRecord(record);
 return {status:'mapped',record};
}
