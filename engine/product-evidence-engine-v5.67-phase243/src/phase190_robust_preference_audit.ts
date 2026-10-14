/** Phase190 RESEARCH ONLY: scenario sensitivity of pairwise, condition-matched performance.
 * Models interval-valued measurements and *reviewer-proposed*, explicit feasible preference
 * envelopes. This module does not estimate uncertainty, authenticate sources, verify rights,
 * accept unconfirmed user goals, promote findings into Phase181/187 ranks, or recommend purchases.
 * It is a bounded deterministic experiment inspired by robust ordinal regression, not a
 * statistical confidence interval, a certification, or a substitution for original-source review.
 */
export interface PreferenceCriterion190 {
 field:string;protocol:string;condition:string;unit:string;
 direction:'higher'|'lower';
 // Strict fixed utility anchors, defined outside the candidate set and requiring expert review.
 utilityAnchor:{worst:number;best:number;reviewReference:string};
 weight:{minimum:number;maximum:number};
 mandatoryThreshold?:{comparison:'at_least'|'at_most';value:number};
}
export interface Observation190 {
 variantId:string;category:string;field:string;protocol:string;condition:string;unit:string;
 low:number;high:number;originalGroup:string;sourceReference:string;
 kind:'original_professional_lab_annotation';
 // Scenario bounds are analyst-defined and NOT a measured error bar.
 bounds:'reported_point_no_uncertainty_estimate'|'illustrative_not_calibrated';
}
export interface Scenario190 {
 stage:'research_only_unreviewed';category:string;variantA:string;variantB:string;
 userGoalConfirmed:boolean;criteria:readonly PreferenceCriterion190[];
 observations:readonly Observation190[];
 purpose:string;
}
export interface RobustAudit190 {
 stage:'research_only_unreviewed';publicRankingAllowed:false;
 status:'unconfirmed_goal'|'failed_mandatory_A'|'failed_mandatory_B'|'failed_mandatory_both'|
  'indeterminate_mandatory'|'missing_or_conflicting_evidence'|'overlapping_or_dependent_observations'|
  'robustly_a_on_selected_criteria'|'robustly_b_on_selected_criteria'|
  'sensitive_or_uncertain'|'observational_tie_in_model';
 deltaMinimum?:number;deltaMaximum?:number;
 evidenceGroups:readonly string[];issues:readonly string[];
 baselineRelation:'unavailable'|'robust_or_sensitive_model_only';
}
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(s);
const distinct=(xs:readonly string[])=>new Set(xs).size===xs.length;
const finite=(x:unknown)=>typeof x==='number'&&Number.isFinite(x);
const tol=1e-10;
const round=(n:number)=>Math.round(n*1e11)/1e11;

/** Greedy optimum for a linear objective over a box-constrained simplex.
 * This is exact for independent weight ranges and sum(weight)=1, not for general
 * interdependent preferences. The explicit feasible set is part of the scenario. */
export function optimizeBoxSimplex190(coeff:readonly number[],bounds:readonly {minimum:number;maximum:number}[],sense:'min'|'max'):number {
 if(!Array.isArray(coeff)||!coeff.length||coeff.length!==bounds.length||
  coeff.some(x=>!finite(x))||bounds.some(b=>!finite(b?.minimum)||!finite(b?.maximum)||b.minimum<0||b.maximum>1||b.minimum>b.maximum)||
  bounds.reduce((s,b)=>s+b.minimum,0)>1+tol||bounds.reduce((s,b)=>s+b.maximum,0)<1-tol||!['min','max'].includes(sense))
  throw Error('phase190_infeasible_preference_envelope');
 const w=bounds.map(b=>b.minimum);let remaining=Math.max(0,1-w.reduce((a,b)=>a+b,0));
 const indices=coeff.map((_,i)=>i).sort((i,j)=>(sense==='min'?coeff[i]-coeff[j]:coeff[j]-coeff[i])||i-j);
 for(const i of indices){const add=Math.min(remaining,bounds[i].maximum-w[i]);w[i]+=add;remaining-=add;if(remaining<=tol)break;}
 if(remaining>tol)throw Error('phase190_unfilled_simplex');
 return round(w.reduce((s,v,i)=>s+v*coeff[i],0));
}
export function validateScenario190(s:Scenario190):void {
 if(!s||s.stage!=='research_only_unreviewed'||![s.category,s.variantA,s.variantB].every(id)||
  s.variantA===s.variantB||typeof s.userGoalConfirmed!=='boolean'||typeof s.purpose!=='string'||s.purpose.length<20||
  !Array.isArray(s.criteria)||s.criteria.length<1||s.criteria.length>20||
  !Array.isArray(s.observations)||s.observations.length>200||!distinct(s.criteria.map(c=>c.field)))throw Error('phase190_invalid_scenario');
 for(const c of s.criteria){const a=c.utilityAnchor, w=c.weight;
  if(![c.field,c.protocol,c.condition,c.unit,a?.reviewReference].every(id)||!['higher','lower'].includes(c.direction)||
    !finite(a?.worst)||!finite(a?.best)||a.worst===a.best||
    (c.direction==='higher'&&a.best<a.worst)||(c.direction==='lower'&&a.best>a.worst)||
    !finite(w?.minimum)||!finite(w?.maximum)||w.minimum<0||w.maximum>1||w.minimum>w.maximum||
    (c.mandatoryThreshold!==undefined&&(!finite(c.mandatoryThreshold.value)||!['at_least','at_most'].includes(c.mandatoryThreshold.comparison))))throw Error('phase190_bad_criterion');
 }
 optimizeBoxSimplex190(s.criteria.map(_=>0),s.criteria.map(c=>c.weight),'min');
 for(const o of s.observations){if(![o?.variantId,o?.category,o?.field,o?.protocol,o?.condition,o?.unit,o?.originalGroup].every(id)||
  typeof o.sourceReference!=='string'||!/^https:\/\/[^\s/]+\//.test(o.sourceReference)||
  !finite(o.low)||!finite(o.high)||o.low>o.high||
  o.kind!=='original_professional_lab_annotation'||
  !['reported_point_no_uncertainty_estimate','illustrative_not_calibrated'].includes(o.bounds)||
  (o.bounds==='reported_point_no_uncertainty_estimate'&&o.low!==o.high))throw Error('phase190_bad_observation');}
}
function utilityRange(c:PreferenceCriterion190,o:Observation190):[number,number]|null {
 const a=c.utilityAnchor;const denominator=a.best-a.worst;
 const u=(v:number)=>(v-a.worst)/denominator;
 const l=Math.min(u(o.low),u(o.high)),h=Math.max(u(o.low),u(o.high));
 // Extrapolation and arbitrary clipping can change the winning alternative; force review.
 if(l<-tol||h>1+tol)return null;
 return [Math.max(0,l),Math.min(1,h)];
}
function thresholdState(c:PreferenceCriterion190,o:Observation190):'pass'|'fail'|'unknown'{
 if(!c.mandatoryThreshold)return 'pass';const t=c.mandatoryThreshold;
 if(t.comparison==='at_least')return o.low>=t.value?'pass':o.high<t.value?'fail':'unknown';
 return o.high<=t.value?'pass':o.low>t.value?'fail':'unknown';
}
/** A and B are *not* compared by votes, site popularity or unapproved weights.
 * The output remains non-publishable and necessarily conditional on explicit research
 * anchor scales, feasible weights, observed scope and illustrated measurement ranges. */
export function auditRobustPreferences190(s:Scenario190):RobustAudit190 {
 validateScenario190(s);
 const issues:string[]=['Scenario-only analysis; utility anchors and weight envelopes require independent justification.',
  'Reported test points do not provide empirically calibrated measurement uncertainty.',
  'No publisher-source custody, verified rights, signed admission or public ranking is established.'];
 const emit=(status:RobustAudit190['status'],groups:readonly string[]=[],lo?:number,hi?:number):RobustAudit190=>({
  stage:'research_only_unreviewed',publicRankingAllowed:false,status,
  ...(lo!==undefined?{deltaMinimum:lo,deltaMaximum:hi}:{}),
  evidenceGroups:[...new Set(groups)].sort(),issues,
  baselineRelation:lo===undefined?'unavailable':'robust_or_sensitive_model_only'});
 if(!s.userGoalConfirmed){issues.push('User requirement is not confirmed.');return emit('unconfirmed_goal');}
 const metricPairs:{a:Observation190;b:Observation190;criterion:PreferenceCriterion190}[]=[];
 const groups:string[]=[];let invalid=false,unknown=false,failA=false,failB=false;
 for(const c of s.criteria){
  const select=(v:string)=>s.observations.filter(o=>o.variantId===v&&o.category===s.category&&o.field===c.field&&o.protocol===c.protocol&&o.condition===c.condition&&o.unit===c.unit);
  const a=select(s.variantA),b=select(s.variantB);
  if(a.length!==1||b.length!==1){issues.push(`${c.field}: missing or conflicting exact-variant/original-condition observation.`);invalid=true;continue;}
  if(!utilityRange(c,a[0])||!utilityRange(c,b[0])){issues.push(`${c.field}: outside fixed utility anchors; no silent clipping.`);invalid=true;continue;}
  const ar=thresholdState(c,a[0]),br=thresholdState(c,b[0]);
  if(ar==='fail')failA=true;if(br==='fail')failB=true;
  if(ar==='unknown'||br==='unknown')unknown=true;
  groups.push(a[0].originalGroup,b[0].originalGroup);
  metricPairs.push({a:a[0],b:b[0],criterion:c});
 }
 if(failA||failB){issues.push('An explicitly mandatory threshold failed; performance trade-offs cannot compensate.');return emit(failA&&failB?'failed_mandatory_both':failA?'failed_mandatory_A':'failed_mandatory_B',groups);}
 if(invalid)return emit('missing_or_conflicting_evidence',groups);
 if(unknown){issues.push('Mandatory suitability unresolved across stated measurement ranges.');return emit('indeterminate_mandatory',groups);}
 if(!distinct(groups)){issues.push('One original evidence group appears across distinct performance criteria/products; dependency requires review.');return emit('overlapping_or_dependent_observations',groups);}
 const lowerDiff:number[]=[],upperDiff:number[]=[];
 for(const {a,b,criterion:c} of metricPairs){const [al,ah]=utilityRange(c,a)!,[bl,bh]=utilityRange(c,b)!;
  lowerDiff.push(al-bh);upperDiff.push(ah-bl);
  if(a.bounds==='illustrative_not_calibrated'||b.bounds==='illustrative_not_calibrated')
   issues.push(`${c.field}: at least one uncertainty range is illustrative and uncalibrated.`);
 }
 const weights=s.criteria.map(c=>c.weight);
 const lo=optimizeBoxSimplex190(lowerDiff,weights,'min');
 const hi=optimizeBoxSimplex190(upperDiff,weights,'max');
 const status:RobustAudit190['status']=lo>tol?'robustly_a_on_selected_criteria':hi< -tol?'robustly_b_on_selected_criteria':
  Math.abs(lo)<tol&&Math.abs(hi)<tol?'observational_tie_in_model':'sensitive_or_uncertain';
 if(status==='sensitive_or_uncertain')issues.push('No robust preference: allowable tradeoffs/observation bounds permit different or tied outcomes.');
 if(status.startsWith('robustly'))issues.push('Robustness is conditional on the *specified scenario*, not proof of overall product superiority.');
 return emit(status,groups,lo,hi);
}
