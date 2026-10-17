/**
 * Phase253 — the evaluation contract for final product advice.
 *
 * Earlier journey scores (Phase248–252) measured the category label, need ids and the response type. They did not
 * measure the advice a person receives. This module defines:
 *  - Advice253: what PEE answers (purchase target, constraints taken from the request, an UNORDERED specification-based
 *    shortlist with citations, products that could not be checked, exclusions with reasons, questions, limitations).
 *    A specification shortlist is never a quality ranking: `ordered` and `rankingAuthorized` are always false here;
 *    ranking stays with the signed Phase180 path.
 *  - AdviceGold253: the gold for one request, validated strictly (missing or invalid labels throw).
 *  - scoreRow253 / summarise253: ten separate metrics (target, category, constraints and needs, implicit needs and
 *    unresolved requirements, quantities, product checks, shortlist, unknown evidence, provenance, response type).
 */
import {SPEC_CRITERIA249,comparable249,type Dimension249} from './phase249_decision.js';

export const RESPONSES253=['positive_shortlist','clarification','justified_negative','justified_abstention','out_of_scope','ranked_recommendation',
 /** Phase270: the response mirrors the goal assessment's decision when it is a labelled partial comparison or a
  * no-purchase check (neither is a recommendation; a no-purchase check does not mean "do not buy"). */
 'partial_comparison','no_purchase_check'] as const;
export type Response253=typeof RESPONSES253[number];
export type TargetKind253='category'|'other'|'none'|'ambiguous';
export interface Constraint253 {criterion:string;value:number;unit:string;bound?:'min'|'max';span?:string;
 status?:'stated_in_request'|'candidate';confidence?:'clear'|'ambiguous'}
export interface CitedEvidence253 {declarationId:string;productId:string;rawValue:string;sourceUrl:string|null;sourceRole:string;variantId:string|null;observedAt?:string|null}
export interface Advice253 {
 schema:'pee253.advice.v1';text:string;
 target:{kind:TargetKind253;category:string|null;other:string|null;basis:string};
 category:string|null;
 constraints:Constraint253[];unmappedConstraints:{span:string;reason:string}[];
 needs:string[];unresolved:string[];
 response:Response253;
 /** True only for 'ranked_recommendation', produced by the existing Phase181 engine from a verified, signed, reviewed
  * catalog supplied with the request (2026-10-16 vertical integration); a specification shortlist is never ordered. */
 ordered:boolean;rankingAuthorized:boolean;
 /** Order from Phase181 over the products that passed every stated factual check; ties share a rank. */
 ranked?:{productId:string;name:string;rank:number;scorePoints:number;originalTestIds:string[];sourceUrls:string[]}[];
 /** Candidates the ranking held back, with Phase181's reason. */
 held?:{productId:string;name:string;reason:string}[];
 /** Principle 8: objectives the user stated that this answer does not assess (never silently dropped). */
 unassessedObjectives:string[];
 shortlist:{productId:string;name:string;evidence:CitedEvidence253[];cautions:string[]}[];
 unknown:{productId:string;name:string;reasons:string[]}[];
 excluded:{productId:string;name:string;reasons:string[]}[];
 conflicts:{productId:string;criterion:string;reason:string}[];
 questions:string[];statements:string[];limitations:string[];researchPlan:string[];
 /** Phase269: consumer-goal relevance. For each recognised need: which measurements would establish it (category
  * knowledge), which proxies are rejected, which test conditions are required, whether supplied evidence assesses it
  * directly or only through a proxy, and the resulting decision. A proxy never assesses an outcome. */
 goalAssessment?:GoalAssessment253;
 /** Phase254: the structured outcome behind the answer (keys, outcomes, codes, product ids; never declared values),
  * consumed by the research-gap bridge instead of parsing the human-readable reasons. */
 researchInputs?:AdviceResearchInputs253;
}
export interface AdviceResearchInputs253 {
 targetKind:TargetKind253;category:string|null;statedCriteria:string[];pendingCriteria:string[];
 performanceNeeds:string[];unresolvedNeeds:string[];
 /** 2026-10-16: the words that stated each performance need, and how the category was established (for the ranking step). */
 performanceNeedSpans?:{id:string;matched:string}[];categoryBasis?:string;
 productChecks:{productId:string;outcome:'meets_all'|'fails'|'unknown';criteria:{key:string;outcome:'meets'|'fails'|'unknown';code:string}[]}[];
 ineligible:{productId:string;code:'product_line'}[];
}
export interface AdviceGold253 {
 id:string;text:string;tier:'T1_synthetic'|'T2_real_request_developer_gold'|'T3_human_span_labels';
 purchase:{target:TargetKind253;category:string|null;other:string|null};
 constraints:{criterion:string;value:number;unit:string}[];
 explicitNeeds:string[];implicitNeeds:string[];unresolved:string[];
 response:Response253;
 shortlist:{include:string[];exclude:string[];unknown:string[]}|null;
}
const UNIT:Record<Dimension249,string>={volume:'l',length:'mm',mass:'g',power:'W',duration:'h',price:'gbp'};
const arr=(x:unknown):x is string[]=>Array.isArray(x)&&x.every(v=>typeof v==='string');
/** Throws, naming every invalid case and field, instead of scoring incomplete gold. */
export function validateAdviceGold253(cases:readonly unknown[]):AdviceGold253[]{
 const problems:string[]=[];const ids=new Set<string>();
 cases.forEach((c0,i)=>{const c=c0 as Partial<AdviceGold253>;const at=`case ${typeof c?.id==='string'?c.id:'#'+i}`;
  const p=(m:string)=>problems.push(`${at}: ${m}`);
  if(typeof c?.id!=='string'||!c.id)p('id missing');else if(ids.has(c.id))p('duplicate id');else ids.add(c.id);
  if(typeof c?.text!=='string'||c.text.length<3)p('text missing');
  if(!['T1_synthetic','T2_real_request_developer_gold','T3_human_span_labels'].includes(c?.tier as string))p('tier invalid');
  const t=c?.purchase;
  if(!t||!['category','other','none','ambiguous'].includes(t.target))p('purchase.target invalid');
  else{if(t.target==='category'&&typeof t.category!=='string')p('purchase.category required for target category');
   if(t.target!=='category'&&t.category!==null)p('purchase.category must be null unless target is category');
   if(t.target==='other'&&typeof t.other!=='string')p('purchase.other required for target other');}
  if(!Array.isArray(c?.constraints))p('constraints missing');
  else for(const k of c.constraints){const s=SPEC_CRITERIA249[k?.criterion];
   if(!s)p(`unknown criterion ${k?.criterion}`);else if(!Number.isFinite(k.value)||typeof k.unit!=='string')p(`constraint ${k.criterion} value/unit invalid`);
   else if(s.dimension!=='price'&&comparable249({kind:'quantity',number:k.value,unit:k.unit,approximate:false} as never,s.dimension,UNIT[s.dimension])===null)p(`constraint ${k.criterion} unit ${k.unit} not convertible`);}
  for(const f of ['explicitNeeds','implicitNeeds','unresolved'] as const)if(!arr(c?.[f]))p(`${f} must be a string array`);
  if(!RESPONSES253.includes(c?.response as Response253))p('response invalid');
  if(c?.shortlist!==null){const s=c?.shortlist;
   if(!s||!arr(s.include)||!arr(s.exclude)||!arr(s.unknown))p('shortlist must be null or {include,exclude,unknown}');
   else{if(new Set([...s.include,...s.exclude,...s.unknown]).size!==s.include.length+s.exclude.length+s.unknown.length)p('a product is in two shortlist lists');
    if(c?.response==='positive_shortlist'&&!s.include.length)p('positive_shortlist needs at least one included product');}}
  else if(c?.response==='positive_shortlist')p('positive_shortlist needs shortlist gold');
 });
 if(problems.length)throw Error(`invalid advice gold (${problems.length} problem(s)):\n`+problems.slice(0,40).join('\n'));
 return cases as AdviceGold253[];
}
const base=(criterion:string,value:number,unit:string):number|null=>{const s=SPEC_CRITERIA249[criterion];if(!s)return null;
 if(s.dimension==='price')return value;
 return comparable249({kind:'quantity',number:value,unit,approximate:false} as never,s.dimension,UNIT[s.dimension]);};
const same=(a:{criterion:string;value:number;unit:string},b:{criterion:string;value:number;unit:string})=>{
 if(a.criterion!==b.criterion)return false;
 if(SPEC_CRITERIA249[a.criterion]?.dimension==='price')return a.unit.toLowerCase()===b.unit.toLowerCase()&&Math.abs(a.value-b.value)<1e-6;
 const x=base(a.criterion,a.value,a.unit),y=base(b.criterion,b.value,b.unit);return x!==null&&y!==null&&Math.abs(x-y)<=Math.max(1e-6,Math.abs(y)*1e-6);};
export interface AdviceRow253 {id:string;tier:string;targetOk:boolean;categoryOk:boolean;
 constraintTp:number;constraintFp:number;constraintGold:number;quantityWrongValue:number;
 explicitTp:number;explicitN:number;implicitTp:number;implicitN:number;falseNeeds:number;unresolvedN:number;unresolvedAsked:boolean;
 productChecks:{gold:string;got:string}[];wrongInclusions:string[];missedInclusions:string[];unknownAsIncluded:number;
 includedWithFullProvenance:number;included:number;responseOk:boolean;gotResponse:Response253;goldResponse:Response253;harmful:boolean;questions:number}
export function scoreRow253(g:AdviceGold253,a:Advice253):AdviceRow253{
 const targetOk=a.target.kind===g.purchase.target&&(g.purchase.target!=='category'||a.target.category===g.purchase.category);
 const tp=g.constraints.filter(k=>a.constraints.some(x=>same(x,k))).length;
 const fp=a.constraints.filter(x=>!g.constraints.some(k=>same(x,k))).length;
 const wrongValue=g.constraints.filter(k=>!a.constraints.some(x=>same(x,k))&&a.constraints.some(x=>x.criterion===k.criterion)).length;
 const got=new Set(a.needs),gold=new Set([...g.explicitNeeds,...g.implicitNeeds]);
 const status=(pid:string)=>a.shortlist.some(s=>s.productId===pid)?'include':a.unknown.some(s=>s.productId===pid)?'unknown':a.excluded.some(s=>s.productId===pid)?'exclude':'absent';
 const S=g.shortlist;const checks=S?[...S.include.map(p=>({gold:'include',got:status(p)})),...S.exclude.map(p=>({gold:'exclude',got:status(p)})),...S.unknown.map(p=>({gold:'unknown',got:status(p)}))]:[];
 const wrongIn=a.shortlist.map(s=>s.productId).filter(p=>!S||!S.include.includes(p));
 const missed=S?S.include.filter(p=>status(p)!=='include'):[];
 const full=a.shortlist.filter(s=>s.evidence.length>0&&s.evidence.every(e=>e.sourceUrl&&e.productId===s.productId&&!e.variantId)).length;
 const harmful=(a.response==='positive_shortlist'&&(g.response!=='positive_shortlist'||!targetOk))||wrongIn.length>0;
 return {id:g.id,tier:g.tier,targetOk,categoryOk:a.category===g.purchase.category,
  constraintTp:tp,constraintFp:fp,constraintGold:g.constraints.length,quantityWrongValue:wrongValue,
  explicitTp:g.explicitNeeds.filter(n=>got.has(n)).length,explicitN:g.explicitNeeds.length,implicitTp:g.implicitNeeds.filter(n=>got.has(n)).length,implicitN:g.implicitNeeds.length,
  falseNeeds:[...got].filter(n=>!gold.has(n)).length,unresolvedN:g.unresolved.length,unresolvedAsked:g.unresolved.length>0&&a.questions.length>0,
  productChecks:checks,wrongInclusions:wrongIn,missedInclusions:missed,unknownAsIncluded:S?S.unknown.filter(p=>status(p)==='include').length:0,
  includedWithFullProvenance:full,included:a.shortlist.length,responseOk:a.response===g.response,gotResponse:a.response,goldResponse:g.response,harmful,questions:a.questions.length};
}
export function summarise253(rows:readonly AdviceRow253[]){
 const n=rows.length,c=(f:(r:AdviceRow253)=>boolean)=>rows.filter(f).length,s=(k:keyof AdviceRow253)=>rows.reduce((a,r)=>a+(r[k] as number),0);
 const ratio=(a:number,b:number)=>b?+(a/b).toFixed(3):null;const checks=rows.flatMap(r=>r.productChecks);
 const byResponse=Object.fromEntries(RESPONSES253.map(x=>[x,{gold:c(r=>r.goldResponse===x),correct:c(r=>r.goldResponse===x&&r.responseOk),returned:c(r=>r.gotResponse===x)}]));
 return {cases:n,
  m1_purchaseTarget:{correct:c(r=>r.targetOk),of:n},
  m2_category:{correct:c(r=>r.categoryOk),of:n},
  m3_explicitConstraintsAndNeeds:{constraints:{tp:s('constraintTp'),fp:s('constraintFp'),gold:s('constraintGold'),recall:ratio(s('constraintTp'),s('constraintGold')),precision:ratio(s('constraintTp'),s('constraintTp')+s('constraintFp'))},
   explicitNeeds:{tp:s('explicitTp'),of:s('explicitN')}},
  m4_implicitAndUnresolved:{implicitNeeds:{tp:s('implicitTp'),of:s('implicitN')},falseNeeds:s('falseNeeds'),unresolvedCases:c(r=>r.unresolvedN>0),unresolvedAsked:c(r=>r.unresolvedAsked)},
  m5_quantities:{goldQuantities:s('constraintGold'),correct:s('constraintTp'),rightPropertyWrongValueOrUnit:s('quantityWrongValue')},
  m6_productChecks:{total:checks.length,agree:checks.filter(x=>x.gold===x.got).length,
   confusion:Object.fromEntries(['include','exclude','unknown'].map(gk=>[gk,Object.fromEntries(['include','exclude','unknown','absent'].map(k=>[k,checks.filter(x=>x.gold===gk&&x.got===k).length]))]))},
  m7_shortlist:{included:s('included'),wrongInclusions:rows.reduce((a,r)=>a+r.wrongInclusions.length,0),missedInclusions:rows.reduce((a,r)=>a+r.missedInclusions.length,0)},
  m8_unknownEvidence:{goldUnknown:checks.filter(x=>x.gold==='unknown').length,keptUnknown:checks.filter(x=>x.gold==='unknown'&&x.got==='unknown').length,presentedAsMeeting:s('unknownAsIncluded')},
  m9_provenance:{included:s('included'),withFullProvenance:s('includedWithFullProvenance')},
  m10_response:{correct:c(r=>r.responseOk),of:n,harmful:c(r=>r.harmful),byResponse,questionsAsked:s('questions')}};
}
/** Phase269 goal-relevance contract (consumer outcome -> relevant criteria -> evidence -> applicability -> coverage ->
 * decision). Ids are category concept ids; attribute proxies are 'attr:<attribute with underscores>'. */
export interface GoalAssessment253 {
 decision:'clarify'|'research'|'partial_comparison'|'ranking'|'abstain'|'no_purchase_check';
 outcomes:{need:string;coverage:'assessed'|'proxy_only'|'unassessed'|'context';
  relevantMeasures:string[];rejectedProxies:string[];requiredConditions:string[];
  /** Supplied measurements that cannot be compared for this outcome (a proxy, or a test configuration the user excluded). */
  incomparable:string[];assessedBy?:string[];
  /** Phase271: retained comparative results for a relevant measurement: how many experiments report it, how many groups
   * compare two products of the asked class (what a choice between products needs), how many compare the class with
   * another class, and the taught conditions no group satisfies. Unreviewed; never ranking input. */
  comparativeEvidence?:{measure:string;experiments:number;sameClassComparable:number;crossClass:number;conditionsMissing:string[]}}[];
 /** Phase271: when the user owns an alternative, comparisons of the asked class with that alternative in one experiment. */
 alternativeComparison?:{host:string;url:string;task:string|null;measure:string;asked:{subject:string|null;identity:string;value:number;unit:string};
  alternative:{equipmentClass:string;subject:string|null;identity:string;value:number;unit:string};conditionsMissing:string[]}[];
 /** A metric comparison shown separately from any recommendation, with its raw quantity and per-product limitations. */
 partialComparison?:{measure:string;label:string;direction:'lower_is_better'|'higher_is_better';doesNotAssess:string[];
  items:{productId:string;name:string;value:number;unit:string;sourceUrl:string;variantVerified:boolean;limitations:string[]}[]};
}

