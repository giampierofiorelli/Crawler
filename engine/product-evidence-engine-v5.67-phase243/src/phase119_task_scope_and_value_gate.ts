/**
 * Phase119 research-only decision gate: resolve the JOB before recommending the robot.
 * Does not parse open-ended language, scrape sources, infer user preferences, or
 * claim a commercially publishable best/value winner.
 * Never converts feature presence into product performance.
 */
import {createHash} from 'node:crypto';

export type Task119='vacuum'|'mop';
export type Scope119='vacuum'|'mop'|'both'|'undecided';
export type Objective119='best_performance'|'best_value';
export type Lifecycle119='orderable_now'|'preorder'|'announced'|'prototype'|'discontinued'|'unknown';
export type Evidence119='documented_product_function'|'advertised_only'|'unknown';
export type HardwareRule119='exclude_mop_hardware'|'exclude_vacuum_hardware';
export interface VerifiedNeed119 {
  category:'robot_floor_cleaner';
  objective:Objective119;
  scope:Scope119;
  /** An externally adjudicated or user-confirmed context. Never automatically
   * fill task scope from manufacturer popularity or existing product inventory. */
  verification:'independently_reviewed_frame';
  contextReference:string;
  hardHardwareExclusions:readonly HardwareRule119[];
}
export interface FunctionalCapability119 {
  task:Task119; evidence:Evidence119; sourceUrl:string|null;
}
export interface DirectEndpoint119 {
  task:Task119; metricId:string; protocolKey:string; unit:string;
  favorable:'higher'|'lower'; lower:number; upper:number;
  evidence:'independent_measured_reviewed'|'manufacturer_claim'|'unreviewed';
  sourceUrl:string;
}
export interface Price119 {
  amount:number; currency:string; market:string; observedDate:string;
  /** Item list/checkout price, not full cost of ownership. */
  taxIncluded:boolean; orderable:true; sourceUrl:string;
}
export interface Robot119 {
  variantId:string; lifecycle:Lifecycle119;
  functions:readonly FunctionalCapability119[];
  /** Optional explicit negative facts about the hardware, not absence from a list. */
  hasMopHardware:boolean|'unknown'; hasVacuumHardware:boolean|'unknown';
  measurements:readonly DirectEndpoint119[]; price:Price119|null;
}
export interface Snapshot119 {
  revision:string; market:string; currency:string; priceObservedDate:string;
  variants:readonly Robot119[];
}
export interface CandidateView119 {
  variantId:string;
  status:'documented_eligible'|'function_only_advertised'|'unknown_function'|'excluded_by_task'|
    'excluded_by_hardware'|'not_orderable'|'missing_price'|'incompatible_price';
  evidenceGaps:string[];
}
export interface ScopeView119 {
  scope:Exclude<Scope119,'undecided'>;
  candidates:CandidateView119[];
  /** Strict dominance among comparable, current, same-protocol evidence ONLY;
   * entries are partial findings, never an overall quality ranking. */
  robustDominances:{better:string;worse:string;basis:'performance'|'price_and_performance'}[];
  unresolvedPairs:[string,string][];
}
export interface Route119 {
  purpose:'phase119_scope_value_research_only'; publicationReady:false; rankingEligible:false;
  decision:'clarify_task'|'analyze_scope'|'compare_with_caveats';
  question:string|null; options:readonly string[];
  objective:Objective119; scope:Scope119; views:ScopeView119[];
  snapshotSha256:string; limitations:string[];
}
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_:-]{0,100}$/.test(s);
const url=(s:unknown):s is string=>typeof s==='string'&&/^https:\/\/[^\s/?#]+(?:\/[^\s]*)?$/.test(s);
const date=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&
  !Number.isNaN(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
const stable=(x:unknown)=>JSON.stringify(x);
const tasks=(s:Exclude<Scope119,'undecided'>):readonly Task119[]=>s==='both'?['vacuum','mop']:[s];
const compareId=(a:{variantId:string},b:{variantId:string})=>a.variantId.localeCompare(b.variantId);
function validate(input:VerifiedNeed119,s:Snapshot119):void {
  if(!input||input.category!=='robot_floor_cleaner'||
    !['best_performance','best_value'].includes(input.objective)||
    !['vacuum','mop','both','undecided'].includes(input.scope)||
    input.verification!=='independently_reviewed_frame'||
    typeof input.contextReference!=='string'||input.contextReference.trim().length<12||
    !Array.isArray(input.hardHardwareExclusions)||new Set(input.hardHardwareExclusions).size!==input.hardHardwareExclusions.length||
    input.hardHardwareExclusions.some(x=>!['exclude_mop_hardware','exclude_vacuum_hardware'].includes(x))||
    input.hardHardwareExclusions.length>1||
    (input.scope!=='undecided'&&input.hardHardwareExclusions.some(rule=>
      tasks(input.scope as Exclude<Scope119,'undecided'>).includes(rule==='exclude_mop_hardware'?'mop':'vacuum')))
    )throw Error('need_not_verified_or_conflicting');
  if(!s||!id(s.revision)||typeof s.market!=='string'||s.market.length<2||s.market.length>60||
    !/^[A-Z]{3}$/.test(s.currency)||!date(s.priceObservedDate)||!Array.isArray(s.variants)||
    !s.variants.length||s.variants.length>1000||
    new Set(s.variants.map(v=>v.variantId)).size!==s.variants.length)throw Error('invalid_snapshot');
  for(const v of s.variants){
    if(!v||!id(v.variantId)||
      !['orderable_now','preorder','announced','prototype','discontinued','unknown'].includes(v.lifecycle)||
      !Array.isArray(v.functions)||v.functions.length>2||
      new Set(v.functions.map((f:FunctionalCapability119)=>f.task)).size!==v.functions.length||
      ![true,false,'unknown'].includes(v.hasMopHardware)||![true,false,'unknown'].includes(v.hasVacuumHardware)||
      !Array.isArray(v.measurements)||v.measurements.length>30)throw Error('invalid_variant');
    for(const f of v.functions)if(!['vacuum','mop'].includes(f.task)||
      !['documented_product_function','advertised_only','unknown'].includes(f.evidence)||
      (f.evidence==='unknown'?f.sourceUrl!==null:!url(f.sourceUrl)))throw Error('unverified_function_metadata');
    for(const m of v.measurements)if(!['vacuum','mop'].includes(m.task)||
      !id(m.metricId)||!id(m.protocolKey)||!id(m.unit)||
      !['higher','lower'].includes(m.favorable)||!Number.isFinite(m.lower)||!Number.isFinite(m.upper)||m.lower>m.upper||
      !['independent_measured_reviewed','manufacturer_claim','unreviewed'].includes(m.evidence)||!url(m.sourceUrl))
        throw Error('unreviewed_or_invalid_measurement_metadata');
    if(v.price){const p=v.price;
      if(!Number.isFinite(p.amount)||p.amount<0||p.currency!==s.currency||p.market!==s.market||
        !date(p.observedDate)||p.taxIncluded!==true||p.orderable!==true||!url(p.sourceUrl))
        throw Error('invalid_market_price_metadata');
    }
  }
}
function candidate(scope:Exclude<Scope119,'undecided'>,need:VerifiedNeed119,s:Snapshot119,v:Robot119):CandidateView119 {
  const base=(status:CandidateView119['status'],evidenceGaps:string[]=[]):CandidateView119=>({variantId:v.variantId,status,evidenceGaps});
  if(v.lifecycle!=='orderable_now')return base('not_orderable',[`lifecycle:${v.lifecycle}`]);
  if(need.hardHardwareExclusions.includes('exclude_mop_hardware')&&v.hasMopHardware!==false||
     need.hardHardwareExclusions.includes('exclude_vacuum_hardware')&&v.hasVacuumHardware!==false)
    return base('excluded_by_hardware',['explicit_hardware_exclusion_not_verified']);
  if(tasks(scope).some(t=>t==='vacuum'?v.hasVacuumHardware===false:v.hasMopHardware===false))
    return base('excluded_by_task',['documented_missing_required_hardware']);
  const f=tasks(scope).map(t=>v.functions.find(f=>f.task===t));
  if(f.some(x=>x===undefined))return base('unknown_function',['capability_not_documented']);
  if(f.some(x=>x?.evidence==='unknown'))return base('unknown_function',['capability_unknown']);
  if(f.some(x=>x?.evidence==='advertised_only'))return base('function_only_advertised',['manufacturer_advertisement_requires_review']);
  if(need.objective==='best_value'){
    if(!v.price)return base('missing_price',['no_current_observed_price']);
    if(v.price.observedDate!==s.priceObservedDate)return base('incompatible_price',['price_observation_date_differs']);
  }
  return base('documented_eligible');
}
function aligned(a:Robot119,b:Robot119,scope:Exclude<Scope119,'undecided'>):
  {left:DirectEndpoint119;right:DirectEndpoint119}[]|null {
  const result:{left:DirectEndpoint119;right:DirectEndpoint119}[]=[];
  for(const task of tasks(scope)){
    const aa=a.measurements.filter(x=>x.task===task&&x.evidence==='independent_measured_reviewed');
    const bb=b.measurements.filter(x=>x.task===task&&x.evidence==='independent_measured_reviewed');
    if(!aa.length||!bb.length)return null;
    const k=(x:DirectEndpoint119)=>[x.task,x.metricId,x.protocolKey,x.unit,x.favorable].join('|');
    if(new Set(aa.map(k)).size!==aa.length||new Set(bb.map(k)).size!==bb.length)return null;
    if(aa.map(k).sort().join(';')!==bb.map(k).sort().join(';'))return null;
    for(const x of aa)result.push({left:x,right:bb.find(y=>k(x)===k(y))!});
  }
  return result;
}
function robustlyBetter(a:Robot119,b:Robot119,scope:Exclude<Scope119,'undecided'>,objective:Objective119):boolean|null {
  const measures=aligned(a,b,scope);
  if(!measures)return null;
  const notWorse=measures.every(({left,right})=>left.favorable==='higher'?left.lower>=right.upper:left.upper<=right.lower);
  const measStrict=measures.some(({left,right})=>left.favorable==='higher'?left.lower>right.upper:left.upper<right.lower);
  if(objective==='best_performance')return notWorse&&measStrict;
  if(!a.price||!b.price||a.price.observedDate!==b.price.observedDate)return null;
  return notWorse&&a.price.amount<=b.price.amount&&
    (measStrict||a.price.amount<b.price.amount);
}
function view(scope:Exclude<Scope119,'undecided'>,need:VerifiedNeed119,s:Snapshot119):ScopeView119 {
  const variants=[...s.variants].sort(compareId);
  const candidates=variants.map(v=>candidate(scope,need,s,v));
  const eligible=candidates.filter(c=>c.status==='documented_eligible');
  const robustDominances:ScopeView119['robustDominances']=[],unresolvedPairs:[string,string][]=[];
  for(let i=0;i<eligible.length;i++)for(let j=i+1;j<eligible.length;j++){
    const a=variants.find(v=>v.variantId===eligible[i].variantId)!;
    const b=variants.find(v=>v.variantId===eligible[j].variantId)!;
    const ab=robustlyBetter(a,b,scope,need.objective),ba=robustlyBetter(b,a,scope,need.objective);
    if(ab===null||ba===null){unresolvedPairs.push([a.variantId,b.variantId]);continue;}
    if(ab)robustDominances.push({better:a.variantId,worse:b.variantId,
      basis:need.objective==='best_value'?'price_and_performance':'performance'});
    if(ba)robustDominances.push({better:b.variantId,worse:a.variantId,
      basis:need.objective==='best_value'?'price_and_performance':'performance'});
  }
  return {scope,candidates,robustDominances,unresolvedPairs};
}
/** Routes an independently adjudicated frame. Does NOT extract one from prose. */
export function routeCleaningRobotRequest119(need:VerifiedNeed119,s:Snapshot119):Route119 {
  validate(need,s);
  const variants=[...s.variants].sort(compareId).map(v=>({...v,
    functions:[...v.functions].sort((a,b)=>a.task.localeCompare(b.task)),
    measurements:[...v.measurements].sort((a,b)=>stable(a).localeCompare(stable(b)))}));
  const sha=createHash('sha256').update(stable({...s,variants})).digest('hex');
  const undecided=need.scope==='undecided';
  const views=(undecided?['vacuum','mop','both']:[need.scope] as Scope119[])
    .map(x=>view(x as Exclude<Scope119,'undecided'>,need,s));
  return {purpose:'phase119_scope_value_research_only',publicationReady:false,rankingEligible:false,
    objective:need.objective,scope:need.scope,decision:undecided?'clarify_task':'compare_with_caveats',
    question:undecided?'Ti interessa soprattutto aspirare, lavare i pavimenti oppure entrambe le funzioni?':null,
    options:undecided?['Solo aspirazione','Solo lavaggio','Entrambe','Non so: confrontale']:[],
    views,snapshotSha256:sha,
    limitations:[
      'No winner across vacuum-only, mop-only and combo scopes until the task scope is established.',
      'Focus on one task does not exclude multi-function hardware unless expressly required.',
      'Function evidence is not performance evidence; comparisons demand original reviewed measurements of matching endpoints and protocols.',
      'Only exact same-market, currency and observation-date item prices are comparable; shipping, consumables, warranty and lifespan remain unquantified.',
      'Missing data, unreleased products and incomparability never become a low quality score.',
      'Pareto dominance is partial evidence, not a personalized best/value total ordering.',
      'Input frame is supplied by an external reviewer; no free-language parsing or end-to-end model validation is claimed.'
    ]};
}
