/**
 * Phase 121 — intervention-first, source-bounded autonomy comparison.
 * This is a review-input-only research adapter. It does not extract reviews,
 * verify external SKU identities, or publish a total consumer leaderboard.
 */
import {createHash} from 'node:crypto';
import type {Lane120, RecommendationFrame120, BaselineStatus120} from './phase120_general_personal_dual_lens.js';

export type AutonomyMetric121 =
  'unattended_completion_fraction' |
  'rescue_interventions_per_100_runs' |
  'routine_human_minutes_per_30_days' |
  'unplanned_human_minutes_per_30_days' |
  'preparation_human_minutes_per_run';
export type MetricDirection121='higher'|'lower';
export type EvidenceClass121='independent_measured_reviewed'|'reviewer_qualitative'|'manufacturer_claim';
export interface AutonomyEndpoint121 {
  metric:AutonomyMetric121; unit:'fraction'|'events_per_100_runs'|'minutes_per_30_days'|'minutes_per_run';
  favorable:MetricDirection121;
}
export interface AutonomyProtocol121 {
  policyId:string; revision:string; sourceUrls:readonly string[];
  protocolId:string; protocolRevision:string;
  /** Same use conditions across compared candidates. An opaque human-reviewed configuration identity. */
  conditionsKey:string;
  /** The comparison is for a fixed task, rather than for a product type. */
  lane:Lane120;
  minObservedDays:number; minScheduledRuns:number;
  required:readonly AutonomyEndpoint121[];
}
export interface AutonomyMeasurement121 extends AutonomyEndpoint121 {
  lower:number;upper:number;
  evidence:EvidenceClass121; sourceUrl:string;
  /** Reviewer adjudicated cross-check; a true flag is NOT independently proven by this adapter. */
  verifiedSkuBinding:boolean;
  sourceVariantId:string;
}
export interface AutonomyRecord121 {
  variantId:string; lane:Lane120;
  protocolId:string;protocolRevision:string;conditionsKey:string;
  observationDays:number;scheduledRuns:number;
  measurements:readonly AutonomyMeasurement121[];
  /** Product features are explanatory metadata, never a substitute for a measured result. */
  declaredAutomationFeatures:readonly {name:string;sourceUrl:string;evidence:EvidenceClass121}[];
}
export type AutonomyEligibility121=
  'eligible_reviewed_autonomy'|'not_candidate'|'fails_quality_floor'|
  'missing_quality_evidence'|'missing_autonomy_evidence'|'incompatible_autonomy_protocol'|
  'insufficient_observation_horizon'|'ambiguous_or_unverified_measurement';
export interface AutonomyCandidate121 {variantId:string;status:AutonomyEligibility121;reasons:readonly string[];}
export interface AutonomyPair121 {left:string;right:string;relation:'left_dominates'|'right_dominates'|'tradeoff'|'unresolved'|'equal_observed_points';}
export interface AutonomyLane121 {
  lane:Lane120; evaluated:readonly AutonomyCandidate121[];
  robustPartialDominance:readonly {better:string;worse:string}[];
  tradeoffPairs:readonly [string,string][];
  unresolvedPairs:readonly [string,string][];
  /** Source-bounded comparison only; never a universal winner. */
  winner:null;
}
export interface AutonomySidecar121 {
  purpose:'phase121_reviewed_autonomy_comparison';publicationReady:false;
  mode:'general'|'personal';autonomyPrimary:true;
  secondaryBestAndValue:readonly {lane:Lane120;performanceObjective:string;valueObjective:string}[];
  policyRevision:string;sourceSnapshotSha256:string;
  lanes:readonly AutonomyLane121[];limitations:readonly string[];
}
const https=(u:string)=>/^https:\/\/[^\s/?#]+(?:\/[^\s]*)?$/.test(u);
const metricDefinitions:Readonly<Record<AutonomyMetric121,AutonomyEndpoint121>>={
  unattended_completion_fraction:{metric:'unattended_completion_fraction',unit:'fraction',favorable:'higher'},
  rescue_interventions_per_100_runs:{metric:'rescue_interventions_per_100_runs',unit:'events_per_100_runs',favorable:'lower'},
  routine_human_minutes_per_30_days:{metric:'routine_human_minutes_per_30_days',unit:'minutes_per_30_days',favorable:'lower'},
  unplanned_human_minutes_per_30_days:{metric:'unplanned_human_minutes_per_30_days',unit:'minutes_per_30_days',favorable:'lower'},
  preparation_human_minutes_per_run:{metric:'preparation_human_minutes_per_run',unit:'minutes_per_run',favorable:'lower'}
};
const knownMetric=(x:string):x is AutonomyMetric121=>Object.prototype.hasOwnProperty.call(metricDefinitions,x);
const sameDefinition=(a:AutonomyEndpoint121,b:AutonomyEndpoint121)=>a.metric===b.metric&&a.unit===b.unit&&a.favorable===b.favorable;
const isSafeString=(v:string)=>typeof v==='string'&&v.length>=2&&v.length<=256&&v.trim()===v;
function checkPolicy(p:AutonomyProtocol121):void {
  if(!p||!isSafeString(p.policyId)||!isSafeString(p.revision)||
    !isSafeString(p.protocolId)||!isSafeString(p.protocolRevision)||
    !isSafeString(p.conditionsKey)||!['vacuum','mop','both'].includes(p.lane)||
    !Number.isSafeInteger(p.minObservedDays)||p.minObservedDays<1||
    !Number.isSafeInteger(p.minScheduledRuns)||p.minScheduledRuns<1||
    !Array.isArray(p.sourceUrls)||p.sourceUrls.length===0||p.sourceUrls.some(x=>!https(x))||
    !Array.isArray(p.required)||p.required.length<4||
    new Set(p.required.map(x=>x.metric)).size!==p.required.length||
    p.required.some(x=>!knownMetric(x.metric)||!sameDefinition(x,metricDefinitions[x.metric as AutonomyMetric121]))||
    !(['unattended_completion_fraction','rescue_interventions_per_100_runs',
      'routine_human_minutes_per_30_days','unplanned_human_minutes_per_30_days'] as const)
      .every(key=>p.required.some(r=>r.metric===key)))throw Error('invalid_autonomy_policy');
}
function checkRecord(r:AutonomyRecord121):void {
  if(!r||!isSafeString(r.variantId)||!['vacuum','mop','both'].includes(r.lane)||
    !isSafeString(r.protocolId)||!isSafeString(r.protocolRevision)||!isSafeString(r.conditionsKey)||
    !Number.isSafeInteger(r.observationDays)||r.observationDays<0||
    !Number.isSafeInteger(r.scheduledRuns)||r.scheduledRuns<0||
    !Array.isArray(r.measurements)||!Array.isArray(r.declaredAutomationFeatures)||
    r.declaredAutomationFeatures.some(f=>!f||!isSafeString(f.name)||!https(f.sourceUrl)||
      !['independent_measured_reviewed','reviewer_qualitative','manufacturer_claim'].includes(f.evidence))||
    r.measurements.some(m=>!m||!knownMetric(m.metric)||!sameDefinition(m,metricDefinitions[m.metric as AutonomyMetric121])||
      !Number.isFinite(m.lower)||!Number.isFinite(m.upper)||m.lower<0||m.upper<m.lower||
      (m.metric==='unattended_completion_fraction'&&m.upper>1)||
      !['independent_measured_reviewed','reviewer_qualitative','manufacturer_claim'].includes(m.evidence)||
      !https(m.sourceUrl)||typeof m.verifiedSkuBinding!=='boolean'||!isSafeString(m.sourceVariantId)))
    throw Error('invalid_autonomy_record');
}
function qualifiedStatus(baseline:BaselineStatus120|undefined):AutonomyEligibility121|null {
  if(baseline==='eligible_on_reviewed_endpoints')return null;
  if(baseline==='fails_reviewed_minimum')return 'fails_quality_floor';
  if(baseline==='missing_reviewed_endpoint')return 'missing_quality_evidence';
  return 'not_candidate';
}
const sorted=(a:string,b:string)=>a.localeCompare(b,'en');
function classify(r:AutonomyRecord121|undefined,p:AutonomyProtocol121,baseline:BaselineStatus120|undefined):AutonomyCandidate121 {
  if(!r)throw Error('record_required_by_caller');
  const base=qualifiedStatus(baseline);
  if(base)return {variantId:r.variantId,status:base,reasons:['phase120_quality_gate:'+baseline]};
  if(r.lane!==p.lane||r.protocolId!==p.protocolId||r.protocolRevision!==p.protocolRevision||
     r.conditionsKey!==p.conditionsKey)return {variantId:r.variantId,status:'incompatible_autonomy_protocol',reasons:['protocol_lane_or_conditions_mismatch']};
  if(r.observationDays<p.minObservedDays||r.scheduledRuns<p.minScheduledRuns)return {
    variantId:r.variantId,status:'insufficient_observation_horizon',reasons:['short_or_sparse_observation']};
  const missing:string[]=[],unverified:string[]=[];
  for(const requirement of p.required){
    const matching=r.measurements.filter(m=>m.metric===requirement.metric);
    if(!matching.length){missing.push(requirement.metric);continue;}
    if(matching.length!==1||!sameDefinition(matching[0],requirement)||
      matching[0].evidence!=='independent_measured_reviewed'||
      !matching[0].verifiedSkuBinding||matching[0].sourceVariantId!==r.variantId||
      !p.sourceUrls.includes(matching[0].sourceUrl))unverified.push(requirement.metric);
  }
  if(unverified.length)return {variantId:r.variantId,status:'ambiguous_or_unverified_measurement',reasons:unverified.map(x=>'ambiguous_or_unverified:'+x)};
  if(missing.length)return {variantId:r.variantId,status:'missing_autonomy_evidence',reasons:missing.map(x=>'missing:'+x)};
  return {variantId:r.variantId,status:'eligible_reviewed_autonomy',reasons:[]};
}
function relate(a:AutonomyRecord121,b:AutonomyRecord121,p:AutonomyProtocol121):AutonomyPair121['relation'] {
  let betterA=0,betterB=0,uncertain=0;
  for(const required of p.required){
    const x=a.measurements.find(m=>m.metric===required.metric)!;
    const y=b.measurements.find(m=>m.metric===required.metric)!;
    if(x.lower===y.lower&&x.upper===y.upper&&x.lower===x.upper)continue;
    if(required.favorable==='lower'){
      if(x.upper<=y.lower)betterA++;
      else if(y.upper<=x.lower)betterB++;
      else uncertain++;
    }else{
      if(x.lower>=y.upper)betterA++;
      else if(y.lower>=x.upper)betterB++;
      else uncertain++;
    }
  }
  if(betterA&&betterB)return 'tradeoff';
  if(uncertain)return 'unresolved';
  if(betterA)return 'left_dominates';
  if(betterB)return 'right_dominates';
  return 'equal_observed_points';
}
function compareLane(lane:Lane120,frame:RecommendationFrame120,policy:AutonomyProtocol121,
  records:readonly AutonomyRecord121[]):AutonomyLane121 {
  const pane=frame.primary.find(x=>x.lane===lane);
  if(!pane)throw Error('lane_not_in_frame');
  const policyScoped={...policy,lane};
  const available=new Map(records.filter(r=>r.lane===lane).map(r=>[r.variantId,r]));
  const evaluated=pane.reviewedEligibility.map(c=>{
    const r=available.get(c.variantId);
    if(!r)return {variantId:c.variantId,status:qualifiedStatus(c.status)??'missing_autonomy_evidence',
      reasons:['no_reviewed_autonomy_record']} as AutonomyCandidate121;
    return classify(r,policyScoped,c.status);
  }).sort((a,b)=>sorted(a.variantId,b.variantId));
  const valid=evaluated.filter(x=>x.status==='eligible_reviewed_autonomy').map(x=>x.variantId);
  const dominance:{better:string;worse:string}[]=[],tradeoffPairs:[string,string][]=[],unresolvedPairs:[string,string][]=[];
  for(let i=0;i<valid.length;i++)for(let j=i+1;j<valid.length;j++){
    const a=valid[i],b=valid[j];
    const left=available.get(a)!,right=available.get(b)!;
    // Never convert different workload exposures into an equivalent autonomy claim.
    if(left.observationDays!==right.observationDays||left.scheduledRuns!==right.scheduledRuns){
      unresolvedPairs.push([a,b]);continue;
    }
    const relationship=relate(left,right,policyScoped);
    if(relationship==='left_dominates')dominance.push({better:a,worse:b});
    else if(relationship==='right_dominates')dominance.push({better:b,worse:a});
    else if(relationship==='tradeoff')tradeoffPairs.push([a,b]);
    else unresolvedPairs.push([a,b]);
  }
  return {lane,evaluated,robustPartialDominance:dominance.sort((a,b)=>sorted(a.better+':'+a.worse,b.better+':'+b.worse)),
    tradeoffPairs,unresolvedPairs,winner:null};
}
/** Enrich the phase120 primary + secondary view without rewriting either ranking. */
export function attachReviewedAutonomyLens121(frame:RecommendationFrame120,
  policies:readonly AutonomyProtocol121[],records:readonly AutonomyRecord121[]):AutonomySidecar121 {
  if(!frame||frame.purpose!=='phase120_general_personal_dual_lens_research_only'||
    frame.publicationReady||frame.winnerClaimAllowed||!frame.evidenceSnapshotSha256||
    !Array.isArray(policies)||!Array.isArray(records))throw Error('unverified_phase120_frame');
  for(const policy of policies)checkPolicy(policy);
  for(const record of records)checkRecord(record);
  const lanes=frame.primary.map(x=>x.lane);
  if(policies.length!==lanes.length||new Set(policies.map(p=>p.lane)).size!==policies.length||
    lanes.some(l=>!policies.some(p=>p.lane===l)))throw Error('missing_lane_policy');
  if(new Set(records.map(r=>r.variantId+'|'+r.lane)).size!==records.length)throw Error('duplicate_autonomy_record');
  const validVariants=new Set(frame.primary.flatMap(l=>l.reviewedEligibility.map(c=>c.variantId)));
  if(records.some(r=>!validVariants.has(r.variantId)||!lanes.includes(r.lane)))throw Error('unexpected_product_or_lane');
  const ordered=lanes.map(l=>policies.find(x=>x.lane===l)!);
  const comparison=lanes.map((l,i)=>compareLane(l,frame,ordered[i],records));
  const evidenceSnapshotSha256=createHash('sha256').update(JSON.stringify({
    productEvidenceSnapshot:frame.evidenceSnapshotSha256,policy:ordered,
    records:[...records].sort((a,b)=>sorted(a.variantId+'|'+a.lane,b.variantId+'|'+b.lane)).map(r=>({
      ...r,measurements:[...r.measurements].sort((a,b)=>sorted(a.metric+':'+a.sourceUrl,b.metric+':'+b.sourceUrl)),
      declaredAutomationFeatures:[...r.declaredAutomationFeatures].sort((a,b)=>sorted(a.name+':'+a.sourceUrl,b.name+':'+b.sourceUrl))}))
  })).digest('hex');
  return {purpose:'phase121_reviewed_autonomy_comparison',publicationReady:false,
    mode:frame.mode,autonomyPrimary:true,
    secondaryBestAndValue:lanes.map(l=>({lane:l,performanceObjective:'best_performance',valueObjective:'best_value'})),
    policyRevision:ordered.map(x=>x.lane+':'+x.revision).join('|'),sourceSnapshotSha256:evidenceSnapshotSha256,
    lanes:comparison,limitations:[
      'Autonomy means observed ability to finish acceptable work without human rescue, preparation or maintenance; features alone do not prove it.',
      'Mandatory effectiveness floor is inherited from the independent phase120 reviewed policy, not silently traded away for lower burden.',
      'Every compared dimension has its own outcome, protocol, observation window, numerator/denominator and original source; different exposure lengths are not silently reconciled.',
      'Unobserved maintenance, short demonstrations, manufacturer claims, and announced firmware never count as zero interventions.',
      'An identical reviewed SKU binding flag does not independently prove external source identity; Phase118 misattribution remains an open ingestion risk.',
      'Zero interventions during a finite test do not imply a guarantee of indefinite hands-free operation.',
      'No publisher standardizes all four mandatory fields across the market; this module abstains when data or conditions are incompatible.',
      'No numeric score, cross-metric weights, inferred lifetime, price/value winner or total robot leaderboard is generated.',
      'The module consumes human-reviewed structured records; live full-text discovery, autonomous intent parsing and mainline integration remain unvalidated.'
    ]};
}
