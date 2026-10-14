/**
 * Phase120 reviewed-frame research prototype.
 * General requests are an explicit evaluation mode, NOT missing personalization.
 * Keep functional presence, endpoint performance, eligibility, price and preference
 * independent; never equate feature counts or manufacturer's claims with quality.
 */
import {createHash} from 'node:crypto';
import {
  routeCleaningRobotRequest119,
  type Robot119, type Snapshot119, type Scope119, type Objective119,
  type HardwareRule119, type DirectEndpoint119, type ScopeView119
} from './phase119_task_scope_and_value_gate.js';

export type Lane120='vacuum'|'mop'|'both';
export type FrameMode120='general'|'personal';
export interface Frame120 {
  mode:FrameMode120;
  /** Only independently established modes may be supplied. No keyword heuristic. */
  verification:'independently_reviewed_frame';
  contextReference:string;
  requested:Objective119;
  scope:Scope119;
  hardHardwareExclusions:readonly HardwareRule119[];
}
/** A reviewed category-goal baseline; NEVER generated from feature popularity. */
export interface ExpertPolicy120 {
  policyId:string; revision:string; evidenceUrls:readonly string[];
  lanes:readonly LanePolicy120[];
}
export interface LanePolicy120 {
  lane:Lane120;
  /** Product must pass every required endpoint; no assumption that all features are required. */
  endpoints:readonly Requirement120[];
  /** Ancillary features may be shown, never automatically made mandatory. */
  usefulButNonMandatory:readonly string[];
}
export interface Requirement120 {
  task:'vacuum'|'mop'; metricId:string; protocolKey:string; unit:string; favorable:'higher'|'lower';
  /** A floor, not an arbitrary overall weight or value function. */
  minimum:number;
  evidenceUrl:string;
}
export type BaselineStatus120='eligible_on_reviewed_endpoints'|'fails_reviewed_minimum'|
  'missing_reviewed_endpoint'|'not_candidate'|'not_ready_for_value';
export interface BaselineCandidate120 {variantId:string;status:BaselineStatus120;reasons:string[];}
export interface Lens120 {
  objective:Objective119; lane:Lane120;
  /** Honest, qualified subset of phase119 partial dominance. */
  reviewedEligibility:readonly BaselineCandidate120[];
  robustPartialDominance:readonly {better:string;worse:string;basis:'performance'|'price_and_performance'}[];
  unresolvedPairs:readonly [string,string][];
  winner:null;
}
export interface RecommendationFrame120 {
  purpose:'phase120_general_personal_dual_lens_research_only';
  publicationReady:false; autonomousUnderstandingValidated:false; winnerClaimAllowed:false;
  mode:FrameMode120; requested:Objective119;
  primary:readonly Lens120[]; secondary:readonly Lens120[];
  question:string|null; categoryPolicyRevision:string;
  evidenceSnapshotSha256:string; limitations:readonly string[];
}
const lanes:readonly Lane120[]=['vacuum','mop','both'];
const https=(s:string):boolean=>/^https:\/\/[^\s/?#]+(?:\/[^\s]*)?$/.test(s);
const endpointKey=(r:{task:string;metricId:string;protocolKey:string;unit:string;favorable:string})=>
  [r.task,r.metricId,r.protocolKey,r.unit,r.favorable].join('|');
function validate(frame:Frame120,policy:ExpertPolicy120,snap:Snapshot119):void {
  if(!frame||!['general','personal'].includes(frame.mode)||
    frame.verification!=='independently_reviewed_frame'||
    typeof frame.contextReference!=='string'||frame.contextReference.trim().length<12||
    !['best_performance','best_value'].includes(frame.requested)||
    !['vacuum','mop','both','undecided'].includes(frame.scope)||
    !Array.isArray(frame.hardHardwareExclusions))throw Error('unverified_frame');
  if(!policy||!/^[a-z0-9:_-]{3,100}$/.test(policy.policyId)||
    !/^[a-z0-9:_-]{2,100}$/.test(policy.revision)||
    !Array.isArray(policy.evidenceUrls)||policy.evidenceUrls.length===0||
    policy.evidenceUrls.some(x=>!https(x))||!Array.isArray(policy.lanes)||
    policy.lanes.length!==3||new Set(policy.lanes.map(x=>x.lane)).size!==3||
    policy.lanes.some(x=>!lanes.includes(x.lane)||!Array.isArray(x.endpoints)||
      x.endpoints.length===0||!Array.isArray(x.usefulButNonMandatory)||
      x.usefulButNonMandatory.some((y:string)=>typeof y!=='string'||!y.trim())||
      x.endpoints.some((r:Requirement120)=>!['vacuum','mop'].includes(r.task)||(x.lane!=='both'&&r.task!==x.lane)||!r.metricId||!r.protocolKey||!r.unit||
        !['higher','lower'].includes(r.favorable)||!Number.isFinite(r.minimum)||
        !https(r.evidenceUrl)||!policy.evidenceUrls.includes(r.evidenceUrl))||
      new Set(x.endpoints.map(endpointKey)).size!==x.endpoints.length||
      (x.lane==='both'&&!(['vacuum','mop'] as const).every(t=>x.endpoints.some((r:Requirement120)=>r.task===t)))))
    throw Error('incomplete_or_unreviewed_policy');
  if(!snap||!Array.isArray(snap.variants)||!snap.variants.length)throw Error('invalid_snapshot');
}
function qualify(lane:Lane120,objective:Objective119,view:ScopeView119,policy:LanePolicy120,snap:Snapshot119):
  BaselineCandidate120[] {
  const original=new Map(view.candidates.map(x=>[x.variantId,x]));
  return [...snap.variants].sort((a,b)=>a.variantId.localeCompare(b.variantId)).map(v=>{
    const base=original.get(v.variantId);
    const reasons:string[]=[];
    if(!base||base.status!=='documented_eligible'){
      if(base)reasons.push('phase119:'+base.status,...base.evidenceGaps);
      return {variantId:v.variantId,status:objective==='best_value'&&
        base?.status==='missing_price'?'not_ready_for_value':'not_candidate',reasons};
    }
    let missing=false,failed=false;
    for(const req of policy.endpoints){
      const candidates=v.measurements.filter(m=>m.evidence==='independent_measured_reviewed'&&
        endpointKey(m)===endpointKey(req)&&
        m.task===req.task);
      if(candidates.length!==1){missing=true;reasons.push('missing_or_ambiguous_endpoint:'+endpointKey(req));continue;}
      const m=candidates[0];
      if(req.favorable==='higher'?m.lower<req.minimum:m.upper>req.minimum){
        failed=true;reasons.push('minimum_not_proven:'+endpointKey(req));
      }
    }
    return {variantId:v.variantId,status:missing?'missing_reviewed_endpoint':
      failed?'fails_reviewed_minimum':'eligible_on_reviewed_endpoints',reasons};
  });
}
function constructLens(lane:Lane120,objective:Objective119,frame:Frame120,policy:ExpertPolicy120,
  snapshot:Snapshot119):Lens120 {
  // Reuse phase119's source-aligned, strict partial comparison rather than another ranker.
  const out=routeCleaningRobotRequest119({category:'robot_floor_cleaner',objective,scope:lane,
    verification:'independently_reviewed_frame',contextReference:frame.contextReference,
    hardHardwareExclusions:frame.hardHardwareExclusions},snapshot);
  const view=out.views[0];
  const p=policy.lanes.find(x=>x.lane===lane)!;
  const reviewedEligibility=qualify(lane,objective,view,p,snapshot);
  const eligibleIds=new Set(reviewedEligibility.filter(x=>x.status==='eligible_on_reviewed_endpoints').map(x=>x.variantId));
  // Phase119 isn't a complete end-to-end decision engine; leave a total winner null.
  return {objective,lane,reviewedEligibility,
    robustPartialDominance:view.robustDominances.filter(x=>eligibleIds.has(x.better)&&eligibleIds.has(x.worse)),
    unresolvedPairs:view.unresolvedPairs.filter(([a,b])=>eligibleIds.has(a)&&eligibleIds.has(b)),winner:null};
}
export function routeGeneralPersonalDualLens120(frame:Frame120,policy:ExpertPolicy120,
  snapshot:Snapshot119):RecommendationFrame120 {
  validate(frame,policy,snapshot);
  const requestedLanes:readonly Lane120[]=frame.scope==='undecided'?lanes:[frame.scope];
  const useLanes=requestedLanes.filter(l=>
    !(frame.hardHardwareExclusions.includes('exclude_mop_hardware')&&(l==='mop'||l==='both'))&&
    !(frame.hardHardwareExclusions.includes('exclude_vacuum_hardware')&&(l==='vacuum'||l==='both')));
  if(useLanes.length===0)throw Error('scope_conflicts_with_exclusion');
  const other:Objective119=frame.requested==='best_performance'?'best_value':'best_performance';
  const snapshotHash=createHash('sha256').update(JSON.stringify({revision:snapshot.revision,market:snapshot.market,currency:snapshot.currency,
    priceObservedDate:snapshot.priceObservedDate,variants:[...snapshot.variants].sort((a,b)=>a.variantId.localeCompare(b.variantId))
      .map(v=>({...v,functions:[...v.functions].sort((a,b)=>a.task.localeCompare(b.task)),
        measurements:[...v.measurements].sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))}))})).digest('hex');
  return {purpose:'phase120_general_personal_dual_lens_research_only',publicationReady:false,
    autonomousUnderstandingValidated:false,winnerClaimAllowed:false,
    mode:frame.mode,requested:frame.requested,
    primary:useLanes.map(l=>constructLens(l,frame.requested,frame,policy,snapshot)),
    secondary:useLanes.map(l=>constructLens(l,other,frame,policy,snapshot)),
    question:frame.mode==='personal'&&frame.scope==='undecided'?
      'Ti interessa soprattutto aspirare, lavare i pavimenti oppure entrambe le funzioni?':null,
    categoryPolicyRevision:policy.revision,evidenceSnapshotSha256:snapshotHash,
    limitations:[
      'General evaluation is a legitimate mode: do not force a task clarification.',
      'General mode preserves vacuum, mop and combined lanes; no unjustified cross-task scalar winner.',
      'A baseline is a reviewed, context-scoped minimum, not a universal fixed feature count.',
      'Both lenses use exactly the same source-neutral product facts, with differing objective only.',
      'Auxiliary feature richness is recorded but not presumed beneficial or automatically scored.',
      'One source must be independently checked for product/SKU identity and protocol; URL strings do not prove this.',
      'Minimum review thresholds are supplied by a reviewed external policy; not scientifically calibrated here.',
      'Absence of a required metric is insufficient evidence, never proof of weak performance.',
      'The optional value lens requires an observed market-local price, and lifecycle cost remains unknown.',
      'Neither performance nor value total winner is authorized; no free-text semantic end-to-end benchmark.'
    ]};
}
