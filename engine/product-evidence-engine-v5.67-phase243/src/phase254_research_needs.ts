/**
 * Phase254 — research-gap bridge: from what adviseFromRequest253 could not establish to structured, deduplicated and
 * prioritised research needs. It plans nothing, fetches nothing and admits nothing.
 *
 * Input: Advice253.researchInputs (criterion keys, outcomes and machine codes from decideAdvice249; never the
 * human-readable reasons, never declared values). Output, per need:
 *  - destination: research (new lawful evidence would close it), user_clarification (only the user can close it),
 *    reextraction (the retained page holds it but it was not parsed), not_actionable (with the reason);
 *  - exact attribution: category, criterion (SPEC_CRITERIA249 key or need concept id), product id and identity basis;
 *  - for research: the ResearchGap181 it corresponds to and the exact ResearchJob182 Phase182 would create
 *    (researchJobFromGap182), always with phase182.eligible=false.
 *
 * Trust boundary. planResearchGaps182 accepts only a Phase181 decision, and per-product gaps come only from a signed,
 * verified catalog (dynamicKnowledgeAnswer181). PEE has no signed catalog, so no ResearchPlan182 is produced here and
 * no decision is constructed: every research need stays pending_authorization with that reason. User text never
 * becomes a source permission, a gap reference is a bounded identifier, and nothing here is evidence.
 */
import {createHash} from 'node:crypto';
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import type {Advice253} from './phase253_advice_contract.js';
import type {ResearchGap181} from './phase181_dynamic_knowledge_ranking.js';
import {researchJobFromGap182,type ResearchJob182} from './phase182_gap_research_orchestrator.js';

export type NeedKind254='missing_declaration'|'conflicting_declarations'|'missing_independent_test'|'identity_review'|
 'retained_not_comparable'|'clarify_requirement'|'clarify_purchase'|'not_actionable';
export type Destination254='research'|'user_clarification'|'reextraction'|'not_actionable';
export type NeedStatus254='pending_authorization'|'omitted_by_budget'|'awaiting_user'|'pending_reextraction'|'not_actionable';
export interface ResearchNeed254 {
 needId:string;kind:NeedKind254;destination:Destination254;status:NeedStatus254;reason:string;
 categoryId:string;criterion:string|null;productId:string|null;
 identity:{productId:string;name:string;keyBasis:string;declaredModel:string|null;identityState:string}|null;
 /** Prices change and depend on market: a found price would be dated and market-bound. */
 volatile:boolean;
 gap181:ResearchGap181|null;
 phase182:{eligible:false;reason:string;jobPreview:ResearchJob182|null};
 /** sha256 prefixes of the requests that raised the need (the text itself is not repeated). */
 requests:string[];priority:number;
}
export interface ResearchNeeds254 {
 schema:'pee254.research-needs.v1';needs:ResearchNeed254[];
 summary:{research:number;queuedWithinBudget:number;omittedByBudget:number;clarification:number;reextraction:number;notActionable:number;duplicatesMerged:number};
 planningOnly:true;rankingAuthorized:false;evidenceAdmitted:false;sourcePermissionsGranted:false;
}
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const PHASE182_REASON='Phase182 plans only from a signed Phase181 decision (a verified product catalog); none exists for this category, so this need stays pending authorization (no decision is constructed).';
const PRIORITY:Partial<Record<NeedKind254,number>>={conflicting_declarations:0,missing_declaration:1,identity_review:2,missing_independent_test:3};

function identityOf(store:KnowledgeStore246,productId:string):ResearchNeed254['identity']{
 const r=store.db.prepare('SELECT name,key_basis,declared_model,identity_state FROM products WHERE product_id=?').get(productId) as {name:string;key_basis:string;declared_model:string|null;identity_state:string}|undefined;
 return r?{productId,name:r.name,keyBasis:r.key_basis,declaredModel:r.declared_model,identityState:r.identity_state}:null;
}
function need(store:KnowledgeStore246,request:string,x:{kind:NeedKind254;destination:Destination254;reason:string;categoryId:string;criterion:string|null;productId:string|null;
 volatile?:boolean;gap?:ResearchGap181}):ResearchNeed254{
 // A clarification belongs to the person who asked: it is keyed by the request, never merged across requests.
 const scope=x.destination==='user_clarification'?request:'';
 const needId='need_'+sha(JSON.stringify([x.kind,x.categoryId,x.productId,x.criterion,scope])).slice(0,24);
 let job:ResearchJob182|null=null;
 if(x.gap)job=researchJobFromGap182(x.categoryId,x.gap);
 const status:NeedStatus254=x.destination==='research'?'pending_authorization':x.destination==='user_clarification'?'awaiting_user':x.destination==='reextraction'?'pending_reextraction':'not_actionable';
 return {needId,kind:x.kind,destination:x.destination,status,reason:x.reason,categoryId:x.categoryId,criterion:x.criterion,productId:x.productId,
  identity:x.productId?identityOf(store,x.productId):null,volatile:!!x.volatile,gap181:x.gap??null,
  phase182:{eligible:false,reason:x.destination==='research'?PHASE182_REASON:'not a research task',jobPreview:job},requests:[request],
  priority:x.destination==='research'?(PRIORITY[x.kind]??9)+(x.volatile?0.5:0):99};
}

/** The needs raised by one answer. Products that met or failed every stated limit raise none. */
export function researchNeedsFromAdvice254(advice:Advice253,store:KnowledgeStore246):ResearchNeed254[]{
 const ri=advice.researchInputs;const cat=ri?.category;if(!ri||!cat||ri.targetKind==='other')return [];
 const req=sha(advice.text).slice(0,16);const out:ResearchNeed254[]=[];const N=(x:Parameters<typeof need>[2])=>out.push(need(store,req,x));
 // 1. Only the user can close these.
 for(const k of ri.pendingCriteria)N({kind:'clarify_requirement',destination:'user_clarification',reason:'stated ambiguously (negated, unbounded or a bare range): confirm with the user',categoryId:cat,criterion:k,productId:null});
 for(const k of ri.unresolvedNeeds)N({kind:'clarify_requirement',destination:'user_clarification',reason:'a need was recognised but its value was not given',categoryId:cat,criterion:k,productId:null});
 if(ri.targetKind==='ambiguous')N({kind:'clarify_purchase',destination:'user_clarification',reason:'several product types fit the request',categoryId:cat,criterion:null,productId:null});
 // 2. Per product and stated criterion, from decideAdvice249's machine codes.
 for(const p of ri.productChecks){
  if(p.outcome==='fails')continue; // a declared failure already decides; more research cannot make it pass a hard limit
  for(const c of p.criteria){
   if(c.outcome!=='unknown')continue;
   const ref=`${p.productId}:${c.key}`;const price=c.key==='budget_max';
   const gap=(action:string):ResearchGap181=>({kind:'missing_test',reference:ref,action});
   if(c.code==='sources_disagree')N({kind:'conflicting_declarations',destination:'research',reason:'sources disagree for this exact product; find which declaration belongs to which variant or source revision',categoryId:cat,criterion:c.key,productId:p.productId,
    gap:gap('Re-check the exact product\'s own sources for this criterion; record which declaration applies to which variant.')});
   else if(c.code==='no_declaration'||c.code==='upper_bound_only')N({kind:'missing_declaration',destination:'research',volatile:price,
    reason:c.code==='upper_bound_only'?'only an "up to" value is declared':'no declaration retained for this criterion',categoryId:cat,criterion:c.key,productId:p.productId,
    gap:gap(price?'Find a dated, market-bound price declaration for the exact product.':'Find a declaration of this criterion for the exact product from a permitted source.')});
   else if(c.code==='not_comparable'&&price)N({kind:'not_actionable',destination:'not_actionable',reason:'price declared in another currency: the product may not be sold in this market; prices are never converted',categoryId:cat,criterion:c.key,productId:p.productId});
   else if(c.code==='not_comparable')N({kind:'retained_not_comparable',destination:'reextraction',reason:'a retained declaration could not be compared (unparsed text, a declared range or another unit); revisit the retained evidence before any new research',categoryId:cat,criterion:c.key,productId:p.productId});
   else if(c.code==='identity_unreviewed')N({kind:'identity_review',destination:'research',reason:'the product identity rests on a name shared by pages of different models',categoryId:cat,criterion:null,productId:p.productId,
    gap:{kind:'need_review',reference:p.productId,action:'Review which model each page describes before any declaration is used.'}});
  }
 }
 for(const x of ri.ineligible)N({kind:'not_actionable',destination:'not_actionable',reason:'a product line, not a single product: research the individual models instead',categoryId:cat,criterion:null,productId:x.productId});
 // 3. Performance needs cannot be closed by declarations: independent tests of the products the user would consider.
 const considered=ri.productChecks.filter(p=>p.outcome==='meets_all').map(p=>p.productId);
 for(const k of ri.performanceNeeds){
  if(considered.length)for(const p of considered)N({kind:'missing_independent_test',destination:'research',reason:'a performance need: only an independent test of this exact product can show it',categoryId:cat,criterion:k,productId:p,
   gap:{kind:'missing_test',reference:`${p}:${k}`,action:'Find an independent original test of this exact product measuring this outcome; a declaration is not a test.'}});
  else N({kind:'missing_independent_test',destination:'research',reason:'a performance need with no shortlisted product yet: establish how the outcome is tested in this category',categoryId:cat,criterion:k,productId:null,
   gap:{kind:'missing_criterion',reference:k,action:'Find how independent testers measure this outcome in this category.'}});
 }
 return [...new Map(out.map(n=>[n.needId,n])).values()];
}

/** Needs across several answers: merged by identity, prioritised, and bounded by a research budget. */
export function collectResearchNeeds254(advices:readonly Advice253[],store:KnowledgeStore246,opts:{maxResearch?:number}={}):ResearchNeeds254{
 const max=opts.maxResearch??20;if(!Number.isSafeInteger(max)||max<0||max>100)throw Error('phase254_bad_budget');
 const merged=new Map<string,ResearchNeed254>();let raw=0;
 for(const a of advices)for(const n of researchNeedsFromAdvice254(a,store)){raw++;const m=merged.get(n.needId);
  if(m){for(const r of n.requests)if(!m.requests.includes(r))m.requests.push(r);}else merged.set(n.needId,{...n,requests:[...n.requests]});}
 const needs=[...merged.values()];
 const research=needs.filter(n=>n.destination==='research').sort((a,b)=>a.priority-b.priority||b.requests.length-a.requests.length||a.needId.localeCompare(b.needId));
 research.forEach((n,i)=>{if(i>=max)n.status='omitted_by_budget';});
 const order=[...research,...needs.filter(n=>n.destination!=='research')];
 const count=(d:Destination254)=>needs.filter(n=>n.destination===d).length;
 return {schema:'pee254.research-needs.v1',needs:order,
  summary:{research:research.length,queuedWithinBudget:Math.min(max,research.length),omittedByBudget:Math.max(0,research.length-max),
   clarification:count('user_clarification'),reextraction:count('reextraction'),notActionable:count('not_actionable'),duplicatesMerged:raw-needs.length},
  planningOnly:true,rankingAuthorized:false,evidenceAdmitted:false,sourcePermissionsGranted:false};
}
