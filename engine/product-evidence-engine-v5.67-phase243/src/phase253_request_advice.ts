/**
 * Phase253 — from an ordinary-English request to a justified answer, using the existing layers:
 *   runJourney248 (purchase target, category, needs, clarifications, research plan)
 *   → extractConstraints253 (requirements the user stated, with spans)
 *   → Phase177 snapshot (stated constraints confirmed with provenance 'user_request_statement'; inferences stay out)
 *   → candidatesFromStore249 + evidence eligibility (product lines, table-only products, source role, price dates)
 *   → decideAdvice249 (declared-specification checks; ranking only through signed Phase180)
 *   → Advice253 (unordered cited shortlist, exclusions with reasons, unknowns, conflicts, questions, limitations).
 * This is not a second recommendation engine: every check is decideAdvice249's. A specification shortlist says which
 * known products' declarations meet the stated limits; it is not a quality ranking and not the whole market.
 */
import {createHash} from 'node:crypto';
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import {runJourney248,type CategoryEntry248} from './phase248_advisory_journey.js';
import {decideAdvice249,candidatesFromStore249,SPEC_CRITERIA249,type Candidate249} from './phase249_decision.js';
import {createDecision177,applyDecisionAction177} from './phase177_decision_snapshot.js';
import {extractConstraints253,type RequestConstraint253} from './phase253_request_constraints.js';
import type {Advice253,CitedEvidence253} from './phase253_advice_contract.js';

const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const ROLE_LABEL:Record<string,string>={manufacturer_declaration:'declared by the manufacturer',retailer_declaration:'declared by a retailer',
 editorial_declaration:'stated by an editorial source',secondary_reference_declaration:'stated by a reference work',unclassified_declaration:'declared by a source of unknown type',
 test_publisher_declaration_unreviewed:'reported by a test publisher (not reviewed)',product_name_declaration:'stated in the product name'};
/** A product-line record ("2000 Series") is not one product: its declarations describe a range. */
const PRODUCT_LINE=/\b(?:series|range|collection|line|family)\s*$/i;

export interface EligibleCandidate253 {candidate:Candidate249;eligible:boolean;reasons:string[];cautions:string[];tableOnly:boolean}
/** Stage 4 evidence eligibility for factual checks, from existing identity, source and revision metadata. Missing or
 * uncertain evidence stays uncertain: nothing here turns it into a negative product finding. */
export function eligibleCandidates253(store:KnowledgeStore246,categoryId:string):EligibleCandidate253[]{
 return candidatesFromStore249(store,categoryId).map(candidate=>{
  const roles=(store.db.prepare('SELECT DISTINCT role FROM product_sources WHERE product_id=?').all(candidate.productId) as {role:string}[]).map(r=>r.role);
  const tableOnly=!roles.includes('main_product');
  const reasons:string[]=[],cautions:string[]=[];
  if(PRODUCT_LINE.test(candidate.name)&&tableOnly)reasons.push('a product line or series, not a single product: its declarations describe a range');
  if(tableOnly)cautions.push('known only from a comparison table on another page; attribution is by table column');
  if(candidate.declarations.some(d=>d.evidenceRole==='unclassified_declaration'))cautions.push('some declarations come from a source whose type (maker or retailer) is not known');
  return {candidate,eligible:!reasons.length,reasons,cautions,tableOnly};
 });
}
const observedAt=(store:KnowledgeStore246,declarationId:string):string|null=>(store.db.prepare('SELECT r.fetched_at f FROM declarations d JOIN revisions r USING(revision_id) WHERE d.declaration_id=?').get(declarationId) as {f:string}|undefined)?.f??null;
/** Stage 4: a source type inferred from host and declared brand (Phase253) is cited as inferred, not as asserted. */
const sourceBasis=(store:KnowledgeStore246,declarationId:string):string|null=>(store.db.prepare('SELECT s.source_type_basis b FROM declarations d JOIN revisions r USING(revision_id) JOIN sources s USING(source_id) WHERE d.declaration_id=?').get(declarationId) as {b:string}|undefined)?.b??null;

export function adviseFromRequest253(text:string,store:KnowledgeStore246,registry:readonly CategoryEntry248[]):Advice253{
 const j=runJourney248(text,store,registry);
 const ex=extractConstraints253(text);
 const category=j.stages.category.categoryId;
 const needs=j.stages.need.concepts.map(c=>c.id);
 const limitations=['Checks use specifications declared by manufacturers or retailers, cited per product; they are not independent performance tests.',
  'The list is unordered: meeting your stated limits is not a quality ranking.'];
 const out:Advice253={schema:'pee253.advice.v1',text,target:{kind:j.stages.target.kind,category:j.stages.target.category,other:j.stages.target.other,basis:j.stages.target.basis},
  category,constraints:[],unmappedConstraints:ex.unmapped,needs,unresolved:[],response:'clarification',ordered:false,rankingAuthorized:false,
  shortlist:[],unknown:[],excluded:[],conflicts:[],questions:[],statements:[],limitations,researchPlan:[...j.researchPlan]};
 // 1. What is being bought.
 if(j.stages.target.kind==='other'){out.response='out_of_scope';
  out.statements.push(`You seem to be looking for ${j.stages.target.other}; the ${category??'product'} mentioned is context. PEE holds no knowledge or products for ${j.stages.target.other}.`);
  return out;}
 if(!category){
  if(j.decision==='out_of_scope'){out.response='out_of_scope';out.statements.push(...j.reasons);return out;}
  out.response='clarification';out.questions.push(...j.clarificationQuestions);out.statements.push(...j.reasons);return out;}
 if(j.decision==='unsupported_category'){out.response='out_of_scope';out.statements.push(...j.reasons);return out;}
 // 2. Requirements the user stated (confirmed with their own provenance) and ones to confirm or ask about.
 const applicable=ex.constraints.filter(c=>!!SPEC_CRITERIA249[c.criterion]);
 const stated=applicable.filter(c=>c.status==='stated_in_request');
 const pending=applicable.filter(c=>c.status==='candidate');
 out.constraints=applicable.map(c=>({criterion:c.criterion,value:c.value,unit:c.unit,bound:c.bound,span:c.span,status:c.status,confidence:c.confidence}));
 for(const c of pending)out.questions.push(`Did you mean that it must have ${c.bound==='max'?'at most':'at least'} ${c.value} ${c.unit} (${c.property.replace('_',' ')})? You wrote "${c.span}".`);
 // Needs a declaration could check but whose value the user has not given: ask once, unless already stated.
 const statedCriteria=new Set(stated.map(c=>c.criterion));
 const entry=registry.find(e=>e.id===category);
 for(const f of j.stages.requirements.factualRequirements)if(f.conceptId!=='budget'&&!statedCriteria.has(f.criterion)&&!out.unresolved.includes(f.conceptId)){
  const sameNeed=j.stages.requirements.factualRequirements.filter(x=>x.conceptId===f.conceptId).map(x=>x.criterion);
  if(sameNeed.some(k=>statedCriteria.has(k)))continue;out.unresolved.push(f.conceptId);}
 const NEED_QUESTION:Record<string,string>={batch_capacity:'What capacity do you need at least (litres, cups or slices)?',small_kitchen:'How much space do you have for it (maximum width, depth and height)?'};
 for(const n of out.unresolved){const q=entry?.needQuestions?.[n]??NEED_QUESTION[n];if(q&&!out.questions.includes(q))out.questions.push(q);}
 if(!stated.length){
  out.response='clarification';
  if(!out.questions.length)out.questions.push(...j.clarificationQuestions.slice(0,2));
  out.statements.push('No checkable requirement is stated yet, so no product can be checked against your needs.');
  return out;}
 // 3. The decision snapshot: the scope only when the product was named, the stated limits as hard requirements.
 if(j.stages.category.basis!=='explicit_alias'){out.response='clarification';
  out.questions.unshift(`Is a ${category.replace(/_/g,' ')} what you are looking for?`);return out;}
 let snap=createDecision177('request_'+sha(text).slice(0,16));
 snap=applyDecisionAction177(snap,{type:'set_scope',source:'user_request_statement',scope:{task:'product_selection',category}}).snapshot;
 for(const c of stated)snap=applyDecisionAction177(snap,{type:'state_in_request',source:'user_request_statement',key:c.criterion,label:c.span.length>=3?c.span.slice(0,300):c.criterion,
  value:{kind:'quantity',value:c.value,unit:c.unit.toLowerCase()},priority:'hard',referenceHash:sha(c.span)}).snapshot;
 // 4. Eligible candidates, then the existing decision layer.
 const pool=eligibleCandidates253(store,category);
 for(const p of pool.filter(x=>!x.eligible))out.unknown.push({productId:p.candidate.productId,name:p.candidate.name,reasons:p.reasons});
 const eligible=pool.filter(p=>p.eligible);
 const advice=decideAdvice249({snapshot:snap,candidates:eligible.map(p=>p.candidate)});
 const cite=(productId:string,e:{declarationId:string;rawValue:string;sourceUrl:string|null;evidenceRole:string}):CitedEvidence253=>({declarationId:e.declarationId,productId,rawValue:e.rawValue,sourceUrl:e.sourceUrl,
  sourceRole:(ROLE_LABEL[e.evidenceRole]??e.evidenceRole)+(!e.declarationId.startsWith('name:')&&sourceBasis(store,e.declarationId)==='heuristic_unverified'?' (source type inferred from its host and declared brand, not verified)':''),variantId:null,observedAt:e.declarationId.startsWith('name:')?null:observedAt(store,e.declarationId)});
 for(const c of advice.checks){const p=eligible.find(x=>x.candidate.productId===c.productId)!;
  for(const k of c.checks)if(/^sources disagree/.test(k.reason))out.conflicts.push({productId:c.productId,criterion:k.key,reason:k.reason});
  if(c.outcome==='meets_all')out.shortlist.push({productId:c.productId,name:c.name,evidence:c.checks.flatMap(k=>k.evidence.map(e=>cite(c.productId,e))),
   cautions:[...p.cautions,...(c.checks.some(k=>k.key==='budget_max')?['price as declared on the date shown; it may have changed']:[])]});
  else if(c.outcome==='fails')out.excluded.push({productId:c.productId,name:c.name,reasons:c.checks.filter(k=>k.outcome==='fails').map(k=>k.reason)});
  else out.unknown.push({productId:c.productId,name:c.name,reasons:c.checks.filter(k=>k.outcome==='unknown').map(k=>`${k.key}: ${k.reason}`)});
 }
 const checked=out.shortlist.length+out.excluded.length;
 out.response=out.shortlist.length?'positive_shortlist':out.excluded.length?'justified_negative':'justified_abstention';
 const lim=stated.map(c=>`${c.criterion.replace(/_(?:min|max)$/,'').replace('_',' ')} ${c.bound==='max'?'≤':'≥'} ${c.value} ${c.unit} ("${c.span}")`).join('; ');
 out.statements.push(`Requirements taken from your request: ${lim}.`);
 out.statements.push(out.response==='positive_shortlist'?`${out.shortlist.length} of ${pool.length} known ${category.replace(/_/g,' ')} meet every stated requirement by their declared specifications (alphabetical, not ranked).`
  :out.response==='justified_negative'?`None of the ${checked} known ${category.replace(/_/g,' ')} that could be checked meets every stated requirement; ${out.unknown.length} could not be checked.`
  :`None of the ${pool.length} known ${category.replace(/_/g,' ')} could be checked against your requirements: the needed declarations are missing, incomparable or conflicting.`);
 // Needs no declaration can check (performance, comfort, noise): reported apart, never inferred from specifications.
 const perf=j.stages.need.concepts.filter(c=>!j.stages.requirements.factualRequirements.some(f=>f.conceptId===c.id)).map(c=>c.id);
 if(perf.length)out.statements.push(`Not checked: ${perf.join(', ')}. These need independent test results, which PEE does not hold for these products.`);
 for(const c of stated)if(c.note&&!out.limitations.includes(c.note))out.limitations.push(c.note);
 out.limitations.push(`Coverage is limited to the ${pool.length} ${category.replace(/_/g,' ')} PEE has observed; it is not the whole market.`);
 if(out.shortlist.length&&pending.length===0&&out.questions.length>2)out.questions.splice(2);
 out.researchPlan.push(...advice.researchPlan);
 return out;
}
