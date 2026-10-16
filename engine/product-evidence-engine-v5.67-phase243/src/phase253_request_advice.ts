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
import type {Advice253,AdviceResearchInputs253,CitedEvidence253} from './phase253_advice_contract.js';
import {dynamicKnowledgeAnswer181,type SignedCatalog181} from './phase181_dynamic_knowledge_ranking.js';
import type {TrustedRankingAuthority180} from './phase180_reviewed_first_answer.js';

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

function adviseCore253(text:string,store:KnowledgeStore246,registry:readonly CategoryEntry248[]):Advice253{
 const j=runJourney248(text,store,registry);
 const ex=extractConstraints253(text);
 const category=j.stages.category.categoryId;
 const needs=j.stages.need.concepts.map(c=>c.id);
 const limitations=['Checks use specifications declared by manufacturers or retailers, cited per product; they are not independent performance tests.',
  'The list is unordered: meeting your stated limits is not a quality ranking.'];
 const out:Advice253={schema:'pee253.advice.v1',text,target:{kind:j.stages.target.kind,category:j.stages.target.category,other:j.stages.target.other,basis:j.stages.target.basis},
  category,constraints:[],unmappedConstraints:ex.unmapped,needs,unresolved:[],response:'clarification',ordered:false,rankingAuthorized:false,
  shortlist:[],unknown:[],excluded:[],conflicts:[],questions:[],statements:[],limitations,researchPlan:[...j.researchPlan],unassessedObjectives:[]};
 const ri:AdviceResearchInputs253={targetKind:j.stages.target.kind,category,statedCriteria:[],pendingCriteria:[],performanceNeeds:[],unresolvedNeeds:[],productChecks:[],ineligible:[]};
 out.researchInputs=ri;
 ri.performanceNeeds=j.stages.need.concepts.filter(c=>!j.stages.requirements.factualRequirements.some(f=>f.conceptId===c.id)).map(c=>c.id);
 ri.performanceNeedSpans=j.stages.need.concepts.filter(c=>ri.performanceNeeds.includes(c.id)).map(c=>({id:c.id,matched:c.matched}));
 ri.categoryBasis=j.stages.category.basis;
 // 1. What is being bought.
 if(j.stages.target.kind==='other'){out.response='out_of_scope';
  out.statements.push(`You seem to be looking for ${j.stages.target.other}; the ${category??'product'} mentioned is context. PEE holds no knowledge or products for ${j.stages.target.other}.`);
  return out;}
 if(!category){
  if(j.decision==='out_of_scope'){out.response='out_of_scope';out.statements.push(...j.reasons);return out;}
  out.response='clarification';out.questions.push(...j.clarificationQuestions);out.statements.push(...j.reasons);return out;}
 // Phase255: a category PEE has no category knowledge for (no modelled needs, mechanisms or tests) can still be checked
 // against limits the user stated, from retained declarations; the answer says what is not understood.
 const statedCheckable=ex.constraints.some(c=>!!SPEC_CRITERIA249[c.criterion]&&c.status==='stated_in_request');
 if(j.decision==='unsupported_category'&&!statedCheckable){out.response='out_of_scope';out.statements.push(...j.reasons);return out;}
 if(j.decision==='unsupported_category')out.limitations.push(`PEE has no category knowledge for ${category.replace(/_/g,' ')}: only the limits you stated are checked; other needs are not understood.`);
 // 2. Requirements the user stated (confirmed with their own provenance) and ones to confirm or ask about.
 const applicable=ex.constraints.filter(c=>!!SPEC_CRITERIA249[c.criterion]);
 const stated=applicable.filter(c=>c.status==='stated_in_request');
 const pending=applicable.filter(c=>c.status==='candidate');
 ri.statedCriteria=stated.map(c=>c.criterion);ri.pendingCriteria=pending.map(c=>c.criterion);
 out.constraints=applicable.map(c=>({criterion:c.criterion,value:c.value,unit:c.unit,bound:c.bound,span:c.span,status:c.status,confidence:c.confidence}));
 for(const c of pending)out.questions.push(`Did you mean that it must have ${c.bound==='max'?'at most':'at least'} ${c.value} ${c.unit} (${c.property.replace('_',' ')})? You wrote "${c.span}".`);
 // Needs a declaration could check but whose value the user has not given: ask once, unless already stated.
 const statedCriteria=new Set(stated.map(c=>c.criterion));
 const entry=registry.find(e=>e.id===category);
 for(const f of j.stages.requirements.factualRequirements)if(f.conceptId!=='budget'&&!statedCriteria.has(f.criterion)&&!out.unresolved.includes(f.conceptId)){
  const sameNeed=j.stages.requirements.factualRequirements.filter(x=>x.conceptId===f.conceptId).map(x=>x.criterion);
  if(sameNeed.some(k=>statedCriteria.has(k)))continue;out.unresolved.push(f.conceptId);}
 ri.unresolvedNeeds=[...out.unresolved];
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
 for(const p of pool.filter(x=>!x.eligible))ri.ineligible.push({productId:p.candidate.productId,code:'product_line'});
 for(const p of pool.filter(x=>!x.eligible))out.unknown.push({productId:p.candidate.productId,name:p.candidate.name,reasons:p.reasons});
 const eligible=pool.filter(p=>p.eligible);
 const advice=decideAdvice249({snapshot:snap,candidates:eligible.map(p=>p.candidate)});
 const cite=(productId:string,e:{declarationId:string;rawValue:string;sourceUrl:string|null;evidenceRole:string}):CitedEvidence253=>({declarationId:e.declarationId,productId,rawValue:e.rawValue,sourceUrl:e.sourceUrl,
  sourceRole:(ROLE_LABEL[e.evidenceRole]??e.evidenceRole)+(!e.declarationId.startsWith('name:')&&sourceBasis(store,e.declarationId)==='heuristic_unverified'?' (source type inferred from its host and declared brand, not verified)':''),variantId:null,observedAt:e.declarationId.startsWith('name:')?null:observedAt(store,e.declarationId)});
 for(const c of advice.checks)ri.productChecks.push({productId:c.productId,outcome:c.outcome,criteria:c.checks.map(k=>({key:k.key,outcome:k.outcome,code:k.code}))});
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

/** The authority under which a ranking may be produced: a reviewed, signed Phase181 catalog and the pinned public keys
 * that verify it (never taken from the request). Without one, PEE answers with the specification path only. */
export interface RankingContext253 {catalog:SignedCatalog181|null;authority:TrustedRankingAuthority180}
/** Stated quality objectives ("best-tasting traditional Italian espresso", "quietest coffee machine"). */
const OBJECTIVE253=/\b(best[- ]tasting|tastiest|good[- ]tasting|great[- ]tasting|best|quietest|most (?:reliable|durable|efficient|consistent|powerful)|top[- ]rated|highest[- ]quality)\b((?:\s+[A-Za-z][A-Za-z-]*){0,5})/gi;
const OBJECTIVE_STOP=/^(?:for|under|over|with|that|which|i|you|we|in|on|at|to|and|or|than|below|around|within|my|can|is|are|of)$/i;
function statedObjectives253(text:string):string[]{
 const out:string[]=[];
 for(const m of text.matchAll(OBJECTIVE253)){const words=(m[2]??'').trim().split(/\s+/).filter(Boolean);const kept:string[]=[];
  for(const w of words){if(OBJECTIVE_STOP.test(w))break;kept.push(w);}
  // "best way", "best type", "best option" ask for advice in general, not for a product outcome.
  if(!kept.length||/^(?:way|ways|type|types|kind|kinds|option|options|choice|choices|thing|things|one|ones|idea|ideas|method|methods|place|time|approach|solution|advice|deal|deals|value|price|brand|brands)$/i.test(kept[0]))continue;
  const phrase=[m[1],...kept].join(' ').toLowerCase();if(!out.includes(phrase))out.push(phrase);}
 return out;
}
/** From an ordinary-English request to a justified answer (see the module comment). With a ranking context, stated
 * performance needs that a reviewed catalog dimension covers are confirmed from the request's own words and ranked by
 * the existing Phase181 engine, restricted to the products that passed every stated factual check. Without one, or when
 * Phase181 holds every candidate, the answer stays a specification answer and says which objectives it does not assess. */
export function adviseFromRequest253(text:string,store:KnowledgeStore246,registry:readonly CategoryEntry248[],opts:{ranking?:RankingContext253|null}={}):Advice253{
 const out=adviseCore253(text,store,registry);
 const ri=out.researchInputs;const perf=ri?.performanceNeeds??[];const objectives=statedObjectives253(text);
 const assessed=new Set<string>();
 const rankable=!!opts.ranking&&!!out.category&&out.target.kind==='category'&&ri?.categoryBasis==='explicit_alias'&&perf.length>0&&
  (out.response==='positive_shortlist'||(out.response==='clarification'&&(ri?.statedCriteria.length??0)===0));
 if(rankable){
  const r=opts.ranking!;const dims=new Map((r.catalog?.catalog.dimensions??[]).map(d=>[d.key,d]));
  const covered=(ri!.performanceNeedSpans??[]).filter(n=>dims.has(n.id));
  let snap=createDecision177('request_'+sha(text).slice(0,16));
  snap=applyDecisionAction177(snap,{type:'set_scope',source:'user_request_statement',scope:{task:'product_selection',category:out.category!}}).snapshot;
  for(const n of covered){const d=dims.get(n.id)!;
   snap=applyDecisionAction177(snap,{type:'state_in_request',source:'user_request_statement',key:n.id,label:d.label,value:d.value as never,priority:'high',referenceHash:sha(n.matched)}).snapshot;}
  const d=dynamicKnowledgeAnswer181({snapshot:snap,catalog:r.catalog,authority:r.authority});
  // Only products that passed every stated factual check (or, with none stated, every eligible product) can be ranked.
  const allowed=new Set((ri!.statedCriteria.length?out.shortlist.map(x=>x.productId):eligibleCandidates253(store,out.category!).filter(p=>p.eligible).map(p=>p.candidate.productId)));
  const name=(id:string,fallback:string)=>(store.db.prepare('SELECT name FROM products WHERE product_id=?').get(id) as {name:string|null}|undefined)?.name??fallback;
  const ranked=covered.length?d.ranked.filter(x=>allowed.has(x.variantId)):[];
  if(d.status==='ranking_ready'&&ranked.length){
   const rows=ranked.map((x,i)=>({productId:x.variantId,name:name(x.variantId,x.name),rank:0,scorePoints:x.scorePoints,originalTestIds:[...x.originalTestIds],sourceUrls:[...x.sourceUrls],i}));
   rows.forEach((x,i)=>{x.rank=i>0&&x.scorePoints===rows[i-1].scorePoints?rows[i-1].rank:i+1;});
   out.response='ranked_recommendation';out.ordered=true;out.rankingAuthorized=true;
   out.ranked=rows.map(({i:_i,...x})=>x);
   out.held=d.held.filter(h=>allowed.has(h.variantId)).map(h=>({productId:h.variantId,name:name(h.variantId,h.name),reason:h.reason}));
   for(const n of covered)assessed.add(n.id);
   out.statements.push(`Ranked by ${covered.map(n=>dims.get(n.id)!.label).join(', ')} from the signed catalog ${d.knowledgeRevision} (scoring policy ${d.policyRevision}); equal scores share a rank.`);
   out.limitations=out.limitations.filter(l=>!/^The list is unordered/.test(l));
   // The specification statements described an unordered list; the ranked criteria are no longer "not checked".
   out.statements=out.statements.map(x=>x.replace(' (alphabetical, not ranked)','')).filter(x=>!/^Not checked: /.test(x)||!covered.some(n=>x.includes(n.id)));
   // Phase268: a signature authenticates the issuer, not a review; the catalog's own review status is always stated.
   out.limitations.push('Only the criteria named above are ranked, from original tests cited per product; the stated limits were checked against declared specifications.',
    `Catalog review status: ${r.catalog!.catalog.externalReviewReference.replace(/[_:]+/g,' ')}.`,...d.visibleCautions);
  }else{
   out.statements.push(covered.length?`No ranking: ${d.firstLayer[0]}`:'No ranking: no reviewed catalog dimension covers the stated objectives.');
   out.researchPlan.push(...d.researchGaps.map(g=>`${g.kind}: ${g.reference} (${g.action})`));
  }
 }
 // Principle 8: an objective the answer does not assess stays explicit.
 const unassessedNeeds=perf.filter(id=>!assessed.has(id));
 const toks=(x:string)=>x.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
 out.unassessedObjectives=[...unassessedNeeds,...objectives.filter(o=>!(ri?.performanceNeedSpans??[]).some(n=>assessed.has(n.id)&&toks(n.matched).every(w=>toks(o).includes(w))))];
 if(out.unassessedObjectives.length&&out.response!=='out_of_scope')
  out.statements.push(`Not assessed: ${out.unassessedObjectives.map(o=>`"${o.replace(/_/g,' ')}"`).join(', ')}. PEE holds no reviewed evidence for ${out.unassessedObjectives.length>1?'these':'this'}, so this answer does not address ${out.unassessedObjectives.length>1?'them':'it'}.`);
 return out;
}
