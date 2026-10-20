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
import {stanceAt} from './language_scope.js';
import {requestCoverage80} from './request_coverage80.js';
import {createHash} from 'node:crypto';
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import {runJourney248,type CategoryEntry248} from './phase248_advisory_journey.js';
import {decideAdvice249,candidatesFromStore249,SPEC_CRITERIA249,type Candidate249} from './phase249_decision.js';
import {createDecision177,applyDecisionAction177} from './phase177_decision_snapshot.js';
import {extractConstraints253,type RequestConstraint253} from './phase253_request_constraints.js';
import type {Advice253,AdviceResearchInputs253,CitedEvidence253} from './phase253_advice_contract.js';
import {dynamicKnowledgeAnswer181,verifySignedCatalog181,type SignedCatalog181,type KnowledgeDimension181,type ProductKnowledgeCatalog181,type CatalogRejection181} from './phase181_dynamic_knowledge_ranking.js';
import {relations247,sufficiencyOf247,type RankingBasis247} from './phase247_category_relations.js';
import {caveatsAbout} from './knowledge_statements.js';
import {conditionsMetFromStoreRecords} from './knowledge_link.js';
import type {StoredStatement} from './knowledge_statements.js';
import {protocolOfMethod268} from './phase268_evidence_validation.js';
import {comparativeEvidence271,COMPARATIVE_MEASURES271} from './phase271_comparative_evidence.js';
import {scientificEvidence98} from './scientific_evidence98.js';
import {applianceMentions270} from './phase270_comparative_results.js';
import type {GoalAssessment253} from './phase253_advice_contract.js';
import type {TrustedRankingAuthority180} from './phase180_reviewed_first_answer.js';
import {loadQuantityKnowledge,readQuantityRequirements,readClassRequirements,evidenceNeed,type QuantityKnowledge,type QuantityRequirement} from './quantity_knowledge.js';
import type {QuantityRequirement253} from './phase253_advice_contract.js';

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

/** S85 (owner boundary check: "steam wand" and "high brew pressure" became scientific outcome needs). The store's concept
 * kind decides: a 'mechanism' (how the product works: brew pressure, convection fan) and a 'task' named as equipment of
 * the product ("with a steam wand") are features the user asks for, not outcomes to assess. They are kept, visible, as
 * feature preferences; they never become outcome needs, research needs or checks. Need recognition is otherwise unchanged. */
// "with a steam wand", "has a built-in grinder": a determiner or built-in/integrated is required, so a use ("struggles with
// some doughs") is never read as equipment (S85 first run, r116)
const FEATURE_CUE253=/(?:^|\s)(?:with|has|have|having|plus|including)\s+(?:a|an|the|built-in|integrated)\s*$/i;
function featureConcepts253(text:string,concepts:readonly {id:string;matched:string;kind:string|null}[]):Set<string>{
 const low=text.toLowerCase();const out=new Set<string>();
 for(const c of concepts){if(c.kind==='mechanism'){out.add(c.id);continue;}
  if(c.kind!=='task'||!c.matched)continue;const i=low.indexOf(c.matched.toLowerCase());if(i>0&&FEATURE_CUE253.test(low.slice(Math.max(0,i-40),i)))out.add(c.id);}
 return out;
}
function adviseCore253(text:string,store:KnowledgeStore246,registry:readonly CategoryEntry248[]):Advice253{
 const j0=runJourney248(text,store,registry);
 const featureIds=featureConcepts253(text,j0.stages.need.concepts);
 const features=j0.stages.need.concepts.filter(c=>featureIds.has(c.id));
 const j:typeof j0={...j0,stages:{...j0.stages,need:{...j0.stages.need,concepts:j0.stages.need.concepts.filter(c=>!featureIds.has(c.id))}}};
 const ex=extractConstraints253(text);
 const category=j.stages.category.categoryId;
 const needs=j.stages.need.concepts.map(c=>c.id);
 const limitations=['Checks use specifications declared by manufacturers or retailers, cited per product; they are not independent performance tests.',
  'The list is unordered: meeting your stated limits is not a quality ranking.'];
 const out:Advice253={schema:'pee253.advice.v1',text,target:{kind:j.stages.target.kind,category:j.stages.target.category,other:j.stages.target.other,basis:j.stages.target.basis},
  category,constraints:[],unmappedConstraints:ex.unmapped,needs,unresolved:[],response:'clarification',ordered:false,rankingAuthorized:false,
  shortlist:[],unknown:[],excluded:[],conflicts:[],questions:[],statements:[],limitations,researchPlan:[...j.researchPlan],unassessedObjectives:[]};
 if(features.length){out.featurePreferences=features.map(c=>({id:c.id,matched:c.matched,kind:c.kind}));
  out.statements.push(`Asked for as a feature: ${features.map(c=>`"${c.matched}"`).join(', ')}. ${features.length>1?'These are features':'This is a feature'} of the product, not an outcome PEE assesses; no product is checked or ordered by ${features.length>1?'them':'it'}.`);
  for(const c of features)if(!out.unassessedObjectives.includes(c.matched))out.unassessedObjectives.push(c.matched);}
 const ri:AdviceResearchInputs253={targetKind:j.stages.target.kind,category,statedCriteria:[],pendingCriteria:[],performanceNeeds:[],unresolvedNeeds:[],productChecks:[],ineligible:[]};
 out.researchInputs=ri;
 ri.performanceNeeds=j.stages.need.concepts.filter(c=>!j.stages.requirements.factualRequirements.some(f=>f.conceptId===c.id)).map(c=>c.id);
 ri.performanceNeedSpans=j.stages.need.concepts.filter(c=>ri.performanceNeeds.includes(c.id)).map(c=>({id:c.id,matched:c.matched}));
 ri.categoryBasis=j.stages.category.basis;
 ri.needSpans=j.stages.need.concepts.map(c=>({id:c.id,matched:c.matched}));
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
 const shape=(c:typeof applicable[number])=>({criterion:c.criterion,value:c.value,unit:c.unit,bound:c.bound,span:c.span,status:c.status,confidence:c.confidence,...(c.closure==='strict'?{closure:'strict' as const}:{})});
 out.constraints=applicable.filter(c=>c.status==='stated_in_request'||c.status==='candidate').map(shape);
 // S103: preferences, corrected and implied limits are reported, never applied
 const others=applicable.filter(c=>c.status==='preference'||c.status==='superseded'||c.status==='implied');
 if(others.length){out.otherLimits=others.map(c=>({...shape(c),note:c.note}));
  const pref=others.filter(c=>c.status==='preference'),sup=others.filter(c=>c.status==='superseded');
  if(pref.length)out.statements.push(`Noted as preferences, not used to exclude any product: ${pref.map(c=>`"${c.span}"`).join(', ')}.`);
  if(sup.length)out.statements.push(`Replaced by your correction: ${sup.map(c=>`"${c.span}"`).join(', ')}.`);}
 for(const c of pending)out.questions.push(c.question??`Did you mean that it must have ${c.bound==='max'?(c.closure==='strict'?'less than':'at most'):(c.closure==='strict'?'more than':'at least')} ${c.value} ${c.unit} (${c.property.replace('_',' ')})? You wrote "${c.span}".`);
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
  out.statements.push(NO_CHECKABLE253);
  return out;}
 // 3. The decision snapshot: the scope only when the product was named, the stated limits as hard requirements.
 if(j.stages.category.basis!=='explicit_alias'){out.response='clarification';
  out.questions.unshift(`Is a ${category.replace(/_/g,' ')} what you are looking for?`);return out;}
 let snap=createDecision177('request_'+sha(text).slice(0,16));
 snap=applyDecisionAction177(snap,{type:'set_scope',source:'user_request_statement',scope:{task:'product_selection',category}}).snapshot;
 for(const c of stated)snap=applyDecisionAction177(snap,{type:'state_in_request',source:'user_request_statement',key:c.criterion,label:c.span.length>=3?c.span.slice(0,300):c.criterion,
  value:{kind:'quantity',value:c.value,unit:c.unit.toLowerCase(),...(c.closure==='strict'?{exclusive:true as const}:{})},priority:'hard',referenceHash:sha(c.span)}).snapshot;
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
 const lim=stated.map(c=>`${c.criterion.replace(/_(?:min|max)$/,'').replace('_',' ')} ${c.bound==='max'?(c.closure==='strict'?'<':'≤'):(c.closure==='strict'?'>':'≥')} ${c.value} ${c.unit} ("${c.span}")`).join('; ');
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
/** Phase269: what category knowledge says about each recognised need. Measurements are 'measurement' concept items;
 * 'measured_by' links a measurement to the outcome it establishes, 'not_sufficient_for' marks a proxy (a declared
 * attribute or a measurement), 'requires_condition' the test conditions without which results are not comparable. */
export interface NeedKnowledge269 {need:string;kind:string|null;relevant:string[];proxies:string[];conditions:string[];notes:Map<string,string>;statements:Map<string,string>;
 /** S78: per measurement linked by measured_by: its relation, the assessed sufficiency, and ITS required conditions. */
 byMeasure:Map<string,{relationId:string;sufficiency:'established'|'informs_only'|'unclear'|'contested'|'unassessed';conditions:string[];
  /** S85: what supports an established verdict for ranking beyond same-model readings (null: nothing) */
  rankingBasis:RankingBasis247|null}>}
/** Context needs (not outcomes): equipment already owned ('*_alternative', a naming contract of the teaching) and stated use. */
// Phase271: '*_constraint' (an installation constraint such as cannot plumb) is context too, but not owned equipment.
const CONTEXT_NEEDS269={has:(id:string)=>id.endsWith('_alternative')||id.endsWith('_constraint')||id==='single_compartment_use'};
export function needKnowledge269(store:KnowledgeStore246,category:string,needs:readonly string[]):NeedKnowledge269[]{
 const items=store.categoryItems246(category);const rels=relations247(store,category);
 const byRef=new Map(items.map(i=>['item:'+i.itemId,i]));
 const measureOf=(ref:string)=>{const i=byRef.get(ref);return i?.concept?.kind==='measurement'?i.concept.id:null;};
 const attrId=(ref:string)=>'attr:'+ref.slice(5).replace(/\s+/g,'_');
 return needs.map(need=>{
  const targets=new Set(items.filter(i=>i.concept?.id===need&&i.concept.kind!=='measurement').map(i=>'item:'+i.itemId));
  const into=rels.filter(r=>targets.has(r.to));
  const relevant=[...new Set(into.filter(r=>r.kind==='measured_by').map(r=>measureOf(r.from)).filter((x):x is string=>!!x))].sort();
  const notes=new Map<string,string>();const proxies:string[]=[];
  for(const r of into.filter(r=>r.kind==='not_sufficient_for')){const id=r.from.startsWith('attr:')?attrId(r.from):measureOf(r.from);if(id&&!proxies.includes(id)){proxies.push(id);notes.set(id,r.qualification);}}
  const relevantRefs=new Set(items.filter(i=>i.concept?.kind==='measurement'&&relevant.includes(i.concept.id)).map(i=>'item:'+i.itemId));
  const conditions=[...new Set(rels.filter(r=>r.kind==='requires_condition'&&relevantRefs.has(r.from)).map(r=>measureOf(r.to)).filter((x):x is string=>!!x))].sort();
  const statements=new Map(items.filter(i=>i.concept?.kind==='measurement').map(i=>[i.concept!.id,i.statement.replace(/\s*\[[^\]]*\]\s*$/,'')]));
  const byMeasure:NeedKnowledge269['byMeasure']=new Map();
  for(const r of into.filter(r=>r.kind==='measured_by')){const m=measureOf(r.from);if(!m)continue;
   const conds=[...new Set(rels.filter(x=>x.kind==='requires_condition'&&x.from===r.from).map(x=>measureOf(x.to)).filter((x):x is string=>!!x))].sort();
   const prev=byMeasure.get(m);const so=sufficiencyOf247(store,r.relationId);const suff=so.state;
   // two measured_by relations for one measurement (two items of the same id): the weaker sufficiency holds
   const rank={established:4,informs_only:2,unclear:1,unassessed:0,contested:-1} as const;
   // S85: the weaker relation decides; with equal verdicts, a missing ranking basis is weaker
   if(!prev||rank[suff]<rank[prev.sufficiency]||(rank[suff]===rank[prev.sufficiency]&&!so.rankingBasis))
    byMeasure.set(m,{relationId:r.relationId,sufficiency:suff,conditions:[...new Set([...(prev?.conditions??[]),...conds])].sort(),rankingBasis:so.rankingBasis});
   else byMeasure.set(m,{...prev,conditions:[...new Set([...prev.conditions,...conds])].sort()});}
  return {need,kind:items.find(i=>i.concept?.id===need)?.concept?.kind??null,relevant,proxies:proxies.sort(),conditions,notes,statements,byMeasure};
 });
}
/** The measurement a catalog dimension carries: its key when it is a measurement concept, else the measurement of the
 * protocol its method names; null when unknown (the catalog then asserts relevance itself, as before Phase269). */
function dimensionMeasure269(d:KnowledgeDimension181,measureIds:ReadonlySet<string>):string|null{
 if(d.measureId)return measureIds.has(d.measureId)?d.measureId:null;
 if(measureIds.has(d.key))return d.key;const m=protocolOfMethod268(d.methodId)?.measureId??null;return m&&measureIds.has(m)?m:null;
}
/** Phase270 ranking authorisation (replaces the Phase269 permissive rule, under which an unknown measurement or a need
 * without category teaching allowed ranking). A scored catalog dimension may assess a consumer outcome only when ALL hold:
 * category knowledge for the need exists; the dimension's measurement is known to that knowledge; a 'measured_by'
 * relation says this measurement establishes the outcome; the measurement is not marked as a proxy for it; the
 * dimension's protocol satisfies every condition the knowledge requires for comparability; and the dimension carries a
 * score at all (raw quantities never rank). The explicit policy behind any ranking is therefore the category teaching
 * ('measured_by' and 'requires_condition' relations, cited to their sources) plus the signed catalog. */
export function outcomeAuthorised270(k:{relevant:readonly string[];proxies:readonly string[];conditions:readonly string[]}|undefined,d:KnowledgeDimension181,measure:string|null):
 {ok:true}|{ok:false;reason:'no_category_teaching'|'unknown_measurement'|'no_measured_by_relation'|'known_proxy'|'conditions_not_verified'|'raw_quantity_not_a_score'}{
 if(d.valueKind==='raw_quantity_only')return {ok:false,reason:'raw_quantity_not_a_score'};
 if(!k)return {ok:false,reason:'no_category_teaching'};
 if(!measure)return {ok:false,reason:'unknown_measurement'};
 if(k.proxies.includes(measure))return {ok:false,reason:'known_proxy'};
 if(!k.relevant.includes(measure))return {ok:false,reason:'no_measured_by_relation'};
 if(!k.conditions.every(c=>(d.conditionsMet??[]).includes(c)))return {ok:false,reason:'conditions_not_verified'};
 return {ok:true};
}
/** S78 ranking authorisation ra.2 (owner S78 §2: "a measured_by relationship must not automatically establish an
 * outcome. Require positive evidence of sufficiency. Check experimental conditions per measurement"). Replaces ra.1
 * (outcomeAuthorised270), which accepted any measured_by relation, including unassessed hypotheses and relations a blind
 * source check found to inform only, and pooled the required conditions of every measurement relevant to the need.
 * A dimension may assess an outcome only when ALL hold: category teaching for the need; a known measurement; not a proxy;
 * a measured_by relation from THIS measurement; an active source-citing assessment that it ESTABLISHES the outcome and
 * none that disagrees; every condition required for THIS measurement met; a score, not a raw quantity. */
export const RANKING_AUTHORISATION_VERSION='ra.2';
/** The rule that decides when the caller names none: ra.2 since the S78 shadow census (evaluation/s78/authorisation-census-live-1.json),
 * applied restrict-only since S79 (outcomeAuthorisedRelease); ra.1 stays callable for comparison only. */
export const DEFAULT_RANKING_AUTHORISATION:'ra.1'|'ra.2'='ra.2';
export type AuthorisationRefusal='no_category_teaching'|'unknown_measurement'|'no_measured_by_relation'|'known_proxy'|'conditions_not_verified'|'raw_quantity_not_a_score'|
 'sufficiency_not_established'|'sufficiency_only_informs'|'sufficiency_contested'|'new_authorisation_pending_validation'|'sufficiency_same_model_only';
export function outcomeAuthorisedRa2(k:{proxies:readonly string[];byMeasure:ReadonlyMap<string,{sufficiency:string;conditions:readonly string[];rankingBasis?:string|null}>}|undefined,d:KnowledgeDimension181,measure:string|null):
 {ok:true}|{ok:false;reason:AuthorisationRefusal}{
 if(d.valueKind==='raw_quantity_only')return {ok:false,reason:'raw_quantity_not_a_score'};
 if(!k)return {ok:false,reason:'no_category_teaching'};
 if(!measure)return {ok:false,reason:'unknown_measurement'};
 if(k.proxies.includes(measure))return {ok:false,reason:'known_proxy'};
 const m=k.byMeasure.get(measure);if(!m)return {ok:false,reason:'no_measured_by_relation'};
 if(m.sufficiency==='contested')return {ok:false,reason:'sufficiency_contested'};
 if(m.sufficiency==='informs_only')return {ok:false,reason:'sufficiency_only_informs'};
 if(m.sufficiency!=='established')return {ok:false,reason:'sufficiency_not_established'};
 // S85 (owner decision): an 'established' verdict resting only on same-model readings of the teaching package does not
 // establish the relation for public ranking (restrict-only; an absent basis is treated as none)
 if(!m.rankingBasis)return {ok:false,reason:'sufficiency_same_model_only'};
 // S83: a required condition the catalog does not show is NOT VERIFIED (was 'conditions_not_met'): the refusal stands,
 // but the absence of a record is never stated as a failure of the products
 if(!m.conditions.every(c=>(d.conditionsMet??[]).includes(c)))return {ok:false,reason:'conditions_not_verified'};
 return {ok:true};
}
/** S79 (owner release-safety review): the rule that decides in production. ra.2's safeguards apply in full, but ra.2 may
 * only RESTRICT: a pair ra.1 refused (in S78's census, two pairs refused only because ra.1 pooled other measurements'
 * conditions) is withheld until its sufficiency and its behaviour with real signed catalogs are specifically
 * validated. The pairs so validated would be listed here, each with its validation record; none is yet. ra.1's own
 * acceptance is never enough. */
export const VALIDATED_NEW_AUTHORISATIONS:readonly {need:string;measure:string;validation:string}[]=[];
export function outcomeAuthorisedRelease(k:NeedKnowledge269|undefined,d:KnowledgeDimension181,measure:string|null):{ok:true}|{ok:false;reason:AuthorisationRefusal}{
 const a2=outcomeAuthorisedRa2(k,d,measure);if(!a2.ok)return a2;
 const a1=outcomeAuthorised270(k,d,measure);
 if(!a1.ok&&!VALIDATED_NEW_AUTHORISATIONS.some(v=>v.need===k?.need&&v.measure===measure))return {ok:false,reason:'new_authorisation_pending_validation'};
 return {ok:true};
}
/** S83 (D28, owner review of S82: design and experimental verification authorised, public authorisations unchanged).
 * The conditions a dimension meets, derived from the store records of its original tests (per observation, then the
 * largest group of usable observations that compare), and what ra.2 would decide with them. SHADOW: the decision above
 * is unchanged; an authorisation the derived conditions would newly enable is reported as 'new_authorisation_shadow_only'. */
function derivedConditions83(store:KnowledgeStore246,category:string,k:NeedKnowledge269|undefined,d:KnowledgeDimension181,measure:string,cat:ProductKnowledgeCatalog181,current:boolean):NonNullable<NonNullable<Advice253['authorisationTrace']>[number]['derivedConditions']>{
 const ids=cat.originalTests.filter(t=>t.dimensionKey===d.key).map(t=>t.originalTestId);
 const r=conditionsMetFromStoreRecords(store,category,measure,ids,d.conditionsMet??[]);
 const a2=outcomeAuthorisedRa2(k,{...d,conditionsMet:r.derived},measure);
 // the subset: what ra.2 would decide for a catalog restricted to the complete, comparable tests (reported, never applied)
 const s2=r.subset&&r.subset.setAside.length?outcomeAuthorisedRa2(k,{...d,conditionsMet:r.subset.derived},measure):null;
 return {observations:r.observations.length,usable:r.observations.filter(o=>o.usable).length,derived:r.derived,declared:r.declared??[],unsupported:r.unsupported,notDeclared:r.notDeclared,
  decisionWithDerived:a2.ok?(current?'authorised':'new_authorisation_shadow_only'):a2.reason,
  ...(r.subset&&s2?{subset:{covered:r.subset.covered.length,setAside:r.subset.setAside.length,derived:r.subset.derived,decision:s2.ok?'restricted_catalog_shadow_only':s2.reason}}:{})};
}
/** Phase270 (owner brief §4): the policy revisions under which a catalog may be shown as a labelled partial comparison.
 * Restricted authorisation: comparison of raw quantities only, after catalog verification; never a recommendation. */
export const PARTIAL_COMPARISON_POLICY270={policyRevisions:['pee268-energy-scoring:r2:partial-comparison-only'] as readonly string[],
 protocolVersions:['pee268-test-evidence-validation:r2'] as readonly string[]};
const REJECTION_TEXT270:Record<CatalogRejection181,string>={no_catalog:'no catalog was supplied',untrusted_key_or_bad_signature:'its signature does not verify against a pinned key',
 invalid_or_altered_content:'its content is invalid or was altered after signing',wrong_category:'it covers a different category',wrong_market:'it covers a different market',
 not_yet_valid:'it is not yet valid',expired:'it has expired',policy_revision_not_permitted:'its policy revision is not permitted for this use'};
const LIMITATION_TEXT269:Record<string,string>={identity_by_product_name_only:'the tester names the product without a model code, so the exact variant is not verified',
 condition_from_same_paragraph:'a test condition is stated in the same paragraph rather than the same sentence',load_from_document_protocol:'the empty load is stated in the review\'s test protocol, not beside the result',
 load_from_publisher_protocol:'the review does not itself say the appliance ran empty',all_compartments_running:'every compartment was running',includes_preheat:'the figure includes preheating',
 fixed_duration_not_cooking_task:'a fixed one-hour run, not the energy to cook a meal',single_publisher:'one publisher only'};

/** From an ordinary-English request to a justified answer (see the module comment). With a ranking context, stated
 * performance needs that a reviewed catalog dimension covers are confirmed from the request's own words and ranked by
 * the existing Phase181 engine, restricted to the products that passed every stated factual check. Without one, or when
 * Phase181 holds every candidate, the answer stays a specification answer and says which objectives it does not assess. */
export function adviseFromRequest253(text:string,store:KnowledgeStore246,registry:readonly CategoryEntry248[],opts:{ranking?:RankingContext253|null;quantityKnowledge?:QuantityKnowledge|null;date?:string;
 /** S98 (gated): attach the stored scientific readings of the considered products (no decision effect) */
 scientific98?:boolean}={}):Advice253{
 const out=adviseFromRequestBase253(text,store,registry,opts);
 if(opts.quantityKnowledge&&out.response!=='out_of_scope'){applyQuantityRequirements253(out,text,opts.quantityKnowledge);applyClassRequirements253(out,text,opts.quantityKnowledge,opts.date);}
 if(opts.scientific98&&out.response!=='out_of_scope'){const ids=[...out.shortlist,...out.unknown,...out.excluded].map(x=>x.productId);
  if(ids.length&&store.schemaVersion()>=11)out.scientificEvidence98=scientificEvidence98(store,ids);}
 if(out.response!=='out_of_scope'&&out.category)applyRequestCoverage80(out,text,registry);
 // S80: "the list is unordered" speaks about the shortlist; without one it contradicts an ordered partial comparison
 // shown in the same answer (S80 first run, judge finding on D1).
 if(!out.shortlist.length)out.limitations=out.limitations.filter(l=>!/^The list is unordered/.test(l));
 return out;
}
/** S80 (principle 8): parts of the request nothing recognised are stated, never silently dropped (request_coverage80.ts). */
function applyRequestCoverage80(out:Advice253,text:string,registry:readonly CategoryEntry248[]):void{
 const entry=registry.find(e=>e.id===out.category);
 const matched=[...(out.researchInputs?.needSpans??[]).map(n=>n.matched),...(out.featurePreferences??[]).map(f=>f.matched),...(entry?.aliases??[]),...((entry as {cues?:readonly string[]}|undefined)?.cues??[]),
  ...statedObjectives253(text)];
 const spans=[...out.constraints.map(c=>c.span),...out.unmappedConstraints.map(u=>u.span),...(out.quantityRequirements??[]).map(q=>q.span),
  ...(out.classRequirements??[]).map(c=>c.span)].filter((x):x is string=>typeof x==='string'&&x.length>0);
 const values=[...out.constraints.map(c=>c.value),...(out.quantityRequirements??[]).flatMap(q=>[q.value,q.low,q.high])].filter((v):v is number=>typeof v==='number');
 const u=requestCoverage80(text,{matched,spans,values});if(!u.length)return;
 out.uninterpreted=u;
 for(const x of u)if(!out.unassessedObjectives.includes(x.span))out.unassessedObjectives.push(x.span);
 const i=out.statements.indexOf(NO_CHECKABLE253);
 if(i>=0)out.statements[i]='No requirement that PEE can check against retained declarations is stated yet.';
 const q=u.filter(x=>x.reason==='quantity_not_checked'),n=u.filter(x=>x.reason==='not_interpreted');
 // at most four parts in the text (long requests carry background); every part stays in out.uninterpreted
 const list=(a:typeof u)=>a.slice(0,4).map(x=>`"${x.span}"`).join(', ')+(a.length>4?` and ${a.length-4} other part${a.length>5?'s':''}`:'');
 if(n.length)out.statements.push(`Not interpreted: ${list(n)}. PEE could not relate ${n.length>1?'these parts':'this part'} of your request to anything it can check, so this answer does not take ${n.length>1?'them':'it'} into account.`);
 if(q.length)out.statements.push(`Stated but not checked: ${list(q)}. PEE did not read ${q.length>1?'these quantities':'this quantity'} as a requirement it can check, so this answer does not apply ${q.length>1?'them':'it'}.`);
}
const NO_CHECKABLE253='No checkable requirement is stated yet, so no product can be checked against your needs.';
const kindText=(qk:QuantityKnowledge,r:QuantityRequirement)=>{const q=r.quantity;const k=q.metric.id?qk.metrics.get(q.metric.id)!.label:(q.kind.id?q.kind.id:q.kind.candidates.join(' or ')).replace(/_/g,' ');
 return k+(q.weighting&&q.weighting!=='unspecified'?`, ${q.weighting}-weighted`:'');};
/** GK: the quantitative requirements the request states beyond the Phase253 constraint vocabulary. Without quantity
 * knowledge they were dropped silently (no constraint, no unmapped span, no unassessed objective). With it they are
 * typed, stated as understood-but-not-checked, asked about when the quantity is ambiguous, and turned into evidence
 * needs (metric, defining method, comparability conditions). Nothing here checks, filters or orders products. */
function applyQuantityRequirements253(out:Advice253,text:string,qk:QuantityKnowledge):void{
 // S85 (intervention A): only a checkable constraint covers a quantity. A span Phase253 could not map ("unclear which
 // property", a rate that is not a capacity) no longer hides the quantity knowledge's typed reading of it: that reading
 // replaces the unmapped entry, so one interpretation of the span is kept and none is silently discarded.
 const at=(s:string)=>({s,i:text.indexOf(s)});const overlaps=(x:{s:string;i:number},r:{start:number;end:number})=>x.i>=0&&x.i<r.end&&x.i+x.s.length>r.start;
 const covered=out.constraints.map(c=>c.span).filter((s):s is string=>typeof s==='string').map(at);
 // a quantity with no bound is a requirement only when the knowledge names its measurand ("extracts 12 litres a day":
 // moisture removal capacity); a bare quantity ("a 2 kg chicken", "15 bar") stays with the coverage check
 const reqs=readQuantityRequirements(qk,text).filter(r=>(r.bound!==null||r.quantity.low!==undefined||(r.status==='no_bound'&&!!r.quantity.metric.id))&&
  !covered.some(c=>overlaps(c,r))&&!/^[£$€]/.test(r.quantity.unit.surface));
 if(!reqs.length)return;
 out.unmappedConstraints=out.unmappedConstraints.filter(u=>typeof u.span!=='string'||!reqs.some(r=>overlaps(at(u.span),r)));
 out.quantityRequirements=reqs.map((r):QuantityRequirement253=>{const q=r.quantity;const e=evidenceNeed(qk,q);
  return {span:r.span,bound:r.bound??(q.low!==undefined?'range':'unstated'),value:q.value,...(q.low!==undefined?{low:q.low,high:q.high}:{}),unit:q.unit.surface,kind:q.kind.id,kindCandidates:q.kind.candidates,
   metric:q.metric.id,weighting:q.weighting,status:r.status==='kind_ambiguous'?'kind_ambiguous':'typed',evidence:{target:e.target,methods:e.methods,conditions:e.conditions,notEvidence:e.notEvidence},knowledge:qk.identity};});
 const i=out.statements.indexOf(NO_CHECKABLE253);
 if(i>=0)out.statements[i]='No requirement that PEE can check against retained declarations is stated yet.';
 out.statements.push(`Understood but not checked: ${reqs.map(r=>`"${r.span}" (${kindText(qk,r)})`).join('; ')}. PEE has no retained declarations it can compare with ${reqs.length>1?'these requirements':'this requirement'}, so the answer does not assess ${reqs.length>1?'them':'it'}.`);
 for(const r of reqs){if(!out.unassessedObjectives.includes(r.span))out.unassessedObjectives.push(r.span);if(r.question&&!out.questions.includes(r.question))out.questions.push(r.question);
  // a stated measurand without a bound: ask, never assume which direction is wanted
  if(r.bound===null&&r.quantity.low===undefined){const q=`Do you need at least or at most ${r.span} (${kindText(qk,r)})?`;if(!out.questions.includes(q))out.questions.push(q);}
  const e=evidenceNeed(qk,r.quantity);
  out.researchPlan.push(`need_evidence: ${e.target}${e.methods.length?` (defined by ${e.methods.join('; ')})`:''}${e.conditions.length?`; comparable only when ${e.conditions.join(', ')} ${e.conditions.length>1?'are':'is'} stated`:''}${e.notEvidence.length?`; not evidence of it: ${e.notEvidence.join(', ')}`:''}`);}
}
/** GK2: class requirements ("an A+++ dishwasher"). Resolved against the scale in force for the category on the request date;
 * a class of a superseded scale is stated as such and never translated. Explicit, not checked here. */
function applyClassRequirements253(out:Advice253,text:string,qk:QuantityKnowledge,date?:string):void{
 const day=date??new Date().toISOString().slice(0,10);
 const reqs=readClassRequirements(qk,text,{productGroup:out.category??undefined,date:day});if(!reqs.length)return;
 out.classRequirements=reqs.map(r=>({...r,knowledge:qk.identity}));
 for(const r of reqs){if(!out.unassessedObjectives.includes(r.span))out.unassessedObjectives.push(r.span);
  if(r.note)out.statements.push(`"${r.span}": ${r.note}.`);
  else if(!r.scale&&r.candidates.length>1)out.questions.push(`Which label do you mean by "${r.span}"? ${r.candidates.map(c=>(qk.pack.scales??[]).find(s=>s.id===c)!.label).join(' and ')} use the same letters for different efficiencies.`);}
}
/** S85 (owner boundary check: "quiet dishwasher" lost its acoustic requirement). A quality the request asks of the product
 * is read with the quantity knowledge's aspect vocabulary (noise: quiet, loud; reliability: reliable ...), not a new word
 * list, and only where it qualifies the product asked for: before its name ("quiet dishwasher", "very reliable kettle") or
 * predicated of it ("a dishwasher quiet enough", "a kettle that is reliable"). It becomes a stated objective, which the
 * answer reports as not assessed unless evidence assesses it; it never filters or orders products. */
let QK_ASPECTS253:{id:string;terms:string[];negative?:string[]}[]|null=null;
function aspectObjectives253(text:string,aliases:readonly string[]):string[]{
 QK_ASPECTS253??=(loadQuantityKnowledge().pack.aspects??[]).filter(a=>a.id!=='other').map(a=>({id:a.id,terms:a.terms.filter(t=>/^[a-z]+$/.test(t)),negative:a.negative??[]}));
 const low=text.toLowerCase();const out:string[]=[];
 const names=aliases.filter(a=>a.length>=3).map(a=>a.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).sort((a,b)=>b.length-a.length);if(!names.length)return out;
 const N=`(?:${names.join('|')})s?`;
 for(const a of QK_ASPECTS253)for(const t of a.terms){
  const before=new RegExp(`\\b(?:(?:most|very|really|quite|super|extra)\\s+)?${t}\\s+(?:(?:and|or)\\s+[a-z-]+\\s+)?(?:[a-z-]+\\s+){0,1}${N}\\b`);
  const after=new RegExp(`\\b${N}\\s+(?:(?:that|which)\\s+(?:is|are|'s|runs|stays)\\s+(?:very\\s+|really\\s+)?)?${t}\\b(?=\\s+enough|\\s*(?:[,.;!?]|$|\\s+and\\b|\\s+for\\b))`);
  const hit=before.exec(low)??after.exec(low);
  if(hit){
   // R3-P: the shared scope (src/language_scope.ts): an aspect the request is indifferent to, or a negated quality, is not an
   // objective ("a quiet dishwasher? noise doesn't bother me"); a negated negative quality still is ("not a loud kettle")
   const ti=hit.index+hit[0].search(new RegExp(`\\b${t}\\b`));const st=ti>=hit.index?stanceAt(text,ti,ti+t.length):null;
   if(st?.stance==='indifferent'||(st?.stance==='negated'&&!(a.negative??[]).includes(t)))continue;
   const ph=`${t} (${a.id.replace(/_/g,' ')})`;if(!out.some(o=>o.startsWith(t+' ')))out.push(ph);}}
 return out;
}
function adviseFromRequestBase253(text:string,store:KnowledgeStore246,registry:readonly CategoryEntry248[],opts:{ranking?:RankingContext253|null}={}):Advice253{
 const out=adviseCore253(text,store,registry);
 const ri=out.researchInputs;const perf=ri?.performanceNeeds??[];const stated=statedObjectives253(text);
 const entry=out.category?registry.find(e=>e.id===out.category):undefined;
 // an aspect word already inside a stated objective ("most reliable dishwasher") or a recognised need is not repeated
 const objectives=[...stated,...aspectObjectives253(text,entry?.aliases??[]).filter(o=>{const w=o.split(' ')[0];
  return !stated.some(x=>x.split(/\s+/).some(y=>y.startsWith(w)))&&!(ri?.performanceNeedSpans??[]).some(n=>n.matched.toLowerCase().includes(w));})];
 const assessed=new Set<string>();
 const rankable=!!opts.ranking&&!!out.category&&out.target.kind==='category'&&ri?.categoryBasis==='explicit_alias'&&perf.length>0&&
  (out.response==='positive_shortlist'||(out.response==='clarification'&&(ri?.statedCriteria.length??0)===0));
 // Phase270: every evidence-consuming path below uses only a catalog verified here (signature against a pinned key,
 // content and test-reference integrity, category, market, validity). A rejected catalog contributes no measurement.
 const vc=opts.ranking&&out.category?verifySignedCatalog181(opts.ranking.catalog,opts.ranking.authority,{categoryId:out.category}):null;
 const verified=vc?.ok?vc.catalog:null;
 if(vc&&!vc.ok&&vc.reason!=='no_catalog'){out.limitations.push(`The supplied evidence catalog was not used: ${REJECTION_TEXT270[vc.reason]}. None of its measurements appear in this answer.`);
  out.researchPlan.push(`need_review: catalog rejected (${vc.reason}); obtain a valid reviewed catalog or research the stated objectives directly`);}
 if(rankable){
  const r=opts.ranking!;const dims=new Map((verified?.dimensions??[]).map(d=>[d.key,d]));
  // Phase270: a dimension confirms a need only under outcomeAuthorised270 (positive, attributable relevance).
  const spans=(ri!.performanceNeedSpans??[]).filter(n=>!CONTEXT_NEEDS269.has(n.id));
  const nk=new Map(needKnowledge269(store,out.category!,spans.map(n=>n.id)).filter(k=>k.kind!==null).map(k=>[k.need,k]));
  const mIds=new Set(store.categoryItems246(out.category!).filter(i=>i.concept?.kind==='measurement').map(i=>i.concept!.id));
  const refused:string[]=[];
  // S78: ra.2 decides; ra.1 is evaluated alongside and recorded (shadow trace), never used for the decision.
  // S80 (owner: never restore ra.1): the production entry point no longer accepts a rule choice; ra.1 stays callable
  // directly (outcomeAuthorised270) for comparisons only.
  out.authorisationTrace=[];
  const covered=spans.filter(n=>{const d=dims.get(n.id);if(!d)return false;const ms=dimensionMeasure269(d,mIds);
   const a1=outcomeAuthorised270(nk.get(n.id),d,ms),a2=outcomeAuthorisedRa2(nk.get(n.id),d,ms);const a=outcomeAuthorisedRelease(nk.get(n.id),d,ms);
   out.authorisationTrace!.push({need:n.id,dimension:d.key,measure:ms,decidedBy:'ra.2-restrict-only',ra1:a1.ok?'authorised':a1.reason,ra2:a2.ok?'authorised':a2.reason,decision:a.ok?'authorised':a.reason,...(ms?{derivedConditions:derivedConditions83(store,out.category!,nk.get(n.id),d,ms,verified!,a.ok)}:{})});
   if(!a.ok)refused.push(`${n.id}: ${a.reason.replace(/_/g,' ')}`);return a.ok;});
  // Every stated outcome and every factual need must be assessed; otherwise no overall ranking (principle 8).
  const complete=covered.length===spans.length&&out.unresolved.length===0;
  if(refused.length)out.limitations.push(`Catalog dimensions not accepted as evidence of the stated outcome (${refused.join('; ')}).`);
  let snap=createDecision177('request_'+sha(text).slice(0,16));
  snap=applyDecisionAction177(snap,{type:'set_scope',source:'user_request_statement',scope:{task:'product_selection',category:out.category!}}).snapshot;
  for(const n of covered){const d=dims.get(n.id)!;
   snap=applyDecisionAction177(snap,{type:'state_in_request',source:'user_request_statement',key:n.id,label:d.label,value:d.value as never,priority:'high',referenceHash:sha(n.matched)}).snapshot;}
  const d=dynamicKnowledgeAnswer181({snapshot:snap,catalog:r.catalog,authority:r.authority});
  // Only products that passed every stated factual check (or, with none stated, every eligible product) can be ranked.
  const allowed=new Set((ri!.statedCriteria.length?out.shortlist.map(x=>x.productId):eligibleCandidates253(store,out.category!).filter(p=>p.eligible).map(p=>p.candidate.productId)));
  const name=(id:string,fallback:string)=>(store.db.prepare('SELECT name FROM products WHERE product_id=?').get(id) as {name:string|null}|undefined)?.name??fallback;
  const ranked=covered.length&&complete?d.ranked.filter(x=>allowed.has(x.variantId)):[];
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
   out.statements.push(!covered.length?'No ranking: no reviewed catalog dimension covers the stated objectives.':!complete?'No ranking: not every stated objective is assessed by relevant evidence, so no overall order is given.':`No ranking: ${d.firstLayer[0]}`);
   out.researchPlan.push(...d.researchGaps.map(g=>`${g.kind}: ${g.reference} (${g.action})`));
  }
 }
 // Phase269: consumer-goal relevance, always computed when a category is known.
 if(out.category)out.goalAssessment=goalAssessment269(store,out,assessed,verified);
 // Phase270: one decision. The response states what the goal assessment decided (a partial comparison or a no-purchase
 // check is never presented as a recommendation); an order survives only when the decision is a ranking.
 const g=out.goalAssessment;
 if(g&&out.response==='ranked_recommendation'&&g.decision!=='ranking'){out.ordered=false;out.rankingAuthorized=false;delete out.ranked;delete out.held;
  for(const id of [...assessed])assessed.delete(id);
  out.statements=out.statements.filter(x=>!/^Ranked by /.test(x));out.statements.push('No ranking: the evidence does not assess every stated objective, so no overall order is given.');}
 if(g&&(g.decision==='partial_comparison'||g.decision==='no_purchase_check')&&out.response!=='out_of_scope')out.response=g.decision;
 // Principle 8: an objective the answer does not assess stays explicit.
 const unassessedNeeds=perf.filter(id=>!assessed.has(id));
 const toks=(x:string)=>x.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
 out.unassessedObjectives=[...(out.featurePreferences??[]).map(f=>f.matched),...unassessedNeeds,...out.unresolved.filter(n=>!unassessedNeeds.includes(n)),...objectives.filter(o=>!(ri?.performanceNeedSpans??[]).some(n=>assessed.has(n.id)&&toks(n.matched).every(w=>toks(o).includes(w))))];
 // Phase271: context needs (owned equipment, constraints) stay in the structure but are not called objectives in the text.
 const shown=out.unassessedObjectives.filter(o=>!CONTEXT_NEEDS269.has(o));
 if(shown.length&&out.response!=='out_of_scope')
  out.statements.push(`Not assessed: ${shown.map(o=>`"${o.replace(/_/g,' ')}"`).join(', ')}. PEE holds no reviewed evidence for ${shown.length>1?'these':'this'}, so this answer does not address ${shown.length>1?'them':'it'}.`);
 return out;
}

/** Phase269 decision: ranking only when every recognised outcome is assessed by a measurement that establishes it;
 * a proxy metric is shown separately as a partial comparison (never when the user excluded its test configuration);
 * an existing appliance makes the decision a no-purchase check; otherwise targeted research. */
function goalAssessment269(store:KnowledgeStore246,out:Advice253,assessed:ReadonlySet<string>,verified:ProductKnowledgeCatalog181|null):GoalAssessment253{
 const needs=[...new Set(out.needs)];const know=needKnowledge269(store,out.category!,needs);
 const mIds=new Set(store.categoryItems246(out.category!).filter(i=>i.concept?.kind==='measurement').map(i=>i.concept!.id));
 // Phase270: only a verified catalog, and for a partial comparison only one under a permitted policy revision.
 const cat=verified;
 const comparable=!!cat&&PARTIAL_COMPARISON_POLICY270.policyRevisions.includes(cat.policyRevision);
 const dims=(cat?.dimensions??[]).map(d=>({d,m:dimensionMeasure269(d,mIds)}));
 const single=needs.includes('single_compartment_use');
 const outcomes:GoalAssessment253['outcomes']=know.map(k=>{
  if(CONTEXT_NEEDS269.has(k.need))return {need:k.need,coverage:'context',relevantMeasures:[],rejectedProxies:[],conditionsByMeasure:[],incomparable:[]};
  const proxyDims=dims.filter(x=>x.m&&k.proxies.includes(x.m)).map(x=>x.m!);
  return {need:k.need,coverage:assessed.has(k.need)?'assessed':proxyDims.length?'proxy_only':'unassessed',relevantMeasures:k.relevant,rejectedProxies:k.proxies,
   conditionsByMeasure:[...k.byMeasure.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([measure,i])=>({measure,conditions:[...i.conditions]})),incomparable:[...new Set(proxyDims)],...(assessed.has(k.need)?{assessedBy:dims.filter(x=>x.d.key===k.need).map(x=>x.m??x.d.key)}:{})};});
 const real=outcomes.filter(o=>o.coverage!=='context');
 // The proxy metric to show separately, when its tested configuration does not contradict the user's stated use.
 const proxy=dims.find(x=>x.m&&x.d.valueKind==='raw_quantity_only'&&PARTIAL_COMPARISON_POLICY270.protocolVersions.includes(x.d.protocolVersion)&&real.some(o=>o.incomparable.includes(x.m!)));
 const proto=proxy?protocolOfMethod268(proxy.d.methodId):null;
 const excluded=!!proxy&&single&&proto?.compartments==='whole_appliance';
 let partial:GoalAssessment253['partialComparison'];
 if(proxy&&cat&&comparable&&!excluded){
  const name=(id:string)=>(store.db.prepare('SELECT name FROM products WHERE product_id=?').get(id) as {name:string|null}|undefined)?.name??id;
  const items=cat.originalTests.filter(t=>t.dimensionKey===proxy.d.key&&t.measured).map(t=>({productId:t.variantId,name:name(t.variantId),value:t.measured!.value,unit:t.measured!.unit,
   sourceUrl:t.sourceUrl,variantVerified:t.scope==='exact_variant_original_professional_test',limitations:[...(t.limitations??[])].map(c=>LIMITATION_TEXT269[c]??c)}));
  const dir=cat.originalTests.find(t=>t.dimensionKey===proxy.d.key&&t.measured)?.measured?.direction??'lower_is_better';
  items.sort((a,b)=>(dir==='lower_is_better'?a.value-b.value:b.value-a.value)||a.productId.localeCompare(b.productId));
  if(items.length)partial={measure:proxy.m!,label:proxy.d.label,direction:dir,doesNotAssess:real.filter(o=>o.coverage!=='assessed').map(o=>o.need),items};
 }
 for(const o of real)if(excluded&&o.incomparable.length&&!o.incomparable.includes('compartments_in_use'))o.incomparable.push('compartments_in_use');
 const decision:GoalAssessment253['decision']=!real.length&&!needs.length?'clarify':needs.some(n=>n.endsWith('_alternative'))?'no_purchase_check':
  real.length&&real.every(o=>o.coverage==='assessed')&&out.response==='ranked_recommendation'?'ranking':
  partial||(out.response==='ranked_recommendation'&&real.some(o=>o.coverage==='assessed'))?'partial_comparison':real.length||needs.some(n=>n.endsWith('_constraint'))?'research':'clarify';
 // What the answer says (concise; details stay in the structure).
 const st=(id:string)=>id.replace(/_/g,' ');
// S78: each measurement with its own conditions, and what the sources say about it (establishes, or only informs)
 const SUFF_TEXT:Record<string,string>={informs_only:'informs it but does not establish it',unclear:'whether it establishes it is unclear',contested:'sources disagree whether it establishes it',unassessed:'whether it establishes it is not assessed'};
 const statement=(k:NeedKnowledge269)=>k.byMeasure.size?`for ${st(k.need)}, ${[...k.byMeasure.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([m,i])=>{
  const notes=[...(i.conditions.length?[i.conditions.map(st).join(', ')]:[]),...(SUFF_TEXT[i.sufficiency]?[SUFF_TEXT[i.sufficiency]]:[])];return st(m)+(notes.length?` (${notes.join('; ')})`:'');}).join(' or ')}`:null;
 const unit=(u:string)=>({kwh:'kWh',w:'W',minutes:'min'} as Record<string,string>)[u]??u;
 const plain=(q:string|undefined)=>(q??'').replace(/^[a-z_]+:\s*/,'').replace(/\s*Package [^.]*\.?\s*$/,'');
 // Phase270: the alternative is named by its taught statement (owned equipment, or a leak to repair), never assumed to
 // be equipment; a no-purchase check is not an instruction not to buy.
 if(decision==='no_purchase_check'){const alt=needs.filter(n=>n.endsWith('_alternative'));
  const taught=store.categoryItems246(out.category!).filter(i=>i.concept&&alt.includes(i.concept.id)&&i.section==='user_goals').map(i=>i.statement.replace(/\s*\[[^\]]*\]\s*$/,'').replace(/\.$/,''));
  out.statements.push(`Buying may not be necessary. ${taught.length?taught.join('; ')+'. ':''}A new ${st(out.category!).replace(/s$/,'')} is worthwhile only if, for your own use, it is measurably better than that alternative on what you care about. That needs a comparison under the same conditions; PEE does not hold one.`);}
 if(partial){out.statements.push(`Partial comparison only, not a recommendation: ${partial.label}. ${partial.direction==='lower_is_better'?'Lower is better for this metric':'Higher is better for this metric'}: ${partial.items.map(i=>`${i.name} (${i.value} ${unit(i.unit)}${i.variantVerified?'':'; variant not verified'})`).join('; ')}.`,
   `This metric does not show the electricity needed to cook a meal, and it does not assess ${partial.doesNotAssess.map(st).join(', ')}.`);
  for(const i of partial.items)if(i.limitations.length)out.limitations.push(`${i.name}: ${i.limitations.join('; ')} (${i.sourceUrl}).`);}
 if(excluded)out.statements.push('The only energy measurements PEE holds ran every compartment at once, so they cannot answer a question about using one drawer.');
 // Phase271: retained comparative results (one task, several appliances) for a relevant measurement. They are used only for
 // what one experiment can show: a comparison between the products it tested, under the conditions it records.
 const askedClass=({air_fryers:'air_fryer'} as Record<string,string>)[out.category!]??null;
 let altComparison:GoalAssessment253['alternativeComparison'];
 if(askedClass)for(const o of real){
  const m=o.relevantMeasures.find(x=>COMPARATIVE_MEASURES271[x]);if(!m)continue;
  // S83: the conditions of THIS measurement (per measurement, not pooled per need), each verified, incompatible or not
  // verifiable in the evidence; one not verifiable is a gap in the record, never a failure of the product
  const conds=o.conditionsByMeasure.find(x=>x.measure===m)?.conditions??[];
  const ev=comparativeEvidence271(store,m,askedClass,conds);if(!ev||!ev.experiments)continue;
  // Conditions no comparable group verifies (the best evidence available, not the union of every group's gaps).
  const usable=ev.groups.filter(g=>g.comparableWithinExperiment);const base=usable.length?usable:ev.groups;
  const stateIn=(g:typeof ev.groups[number],c:string)=>g.conditions.find(x=>x.condition===c)?.state;
  const notVerifiable=conds.filter(c=>base.every(g=>stateIn(g,c)!=='verified')&&!base.every(g=>stateIn(g,c)==='incompatible'));
  const incompatible=conds.filter(c=>base.length>0&&base.every(g=>stateIn(g,c)==='incompatible'));
  o.comparativeEvidence={measure:m,experiments:ev.experiments,sameClassComparable:ev.sameClassComparable,crossClass:ev.crossClass,conditionsNotVerifiable:notVerifiable,conditionsIncompatible:incompatible};
  if(!ev.sameClassComparable)out.statements.push(`Original test evidence for ${st(m)} exists (${ev.experiments} experiment${ev.experiments>1?'s':''}), but no experiment measures two ${st(askedClass)}s under the same conditions, so it cannot show which ${st(askedClass)} uses less${notVerifiable.length?`; not verifiable from the records: ${notVerifiable.map(st).join(', ')}`:''}.`);
  // The user's own alternative (named in the request): within-experiment comparisons with that equipment class only.
  if(decision==='no_purchase_check'){
   const alts=new Set(applianceMentions270(out.text).map(x=>x.cls).filter(c=>c!==askedClass));
   for(const g of ev.groups.filter(g=>g.comparableWithinExperiment)){
    const a=g.items.find(i=>i.equipmentClass===askedClass),b=g.items.find(i=>alts.has(i.equipmentClass as never));if(!a||!b)continue;
    (altComparison??=[]).push({host:g.host,url:g.url,task:g.task,measure:m,asked:{subject:a.subject,identity:a.identity,value:a.value,unit:a.unit},
     alternative:{equipmentClass:b.equipmentClass,subject:b.subject,identity:b.identity,value:b.value,unit:b.unit},conditionsNotVerifiable:g.conditions.filter(x=>x.state==='not_verifiable').map(x=>x.condition)});}
   if(alts.size&&!altComparison)out.statements.push(`No retained experiment compares a ${st(askedClass)} with the ${[...alts].map(st).join(' or ')} you have.`);
  }
 }
 if(altComparison){const u=(x:string)=>x==='kwh'?'kWh':x;
  out.statements=out.statements.map(x=>x.startsWith('Buying may not be necessary.')?x.replace('That needs a comparison under the same conditions; PEE does not hold one.','That needs a comparison under the same conditions; the closest evidence PEE holds follows.'):x);const byHost=[...new Set(altComparison.map(c=>c.host))];
  const a=altComparison[0];
  out.statements.push(`Original test evidence (${byHost.join(', ')}; publisher-reported, not reviewed by PEE): for the same dishes, the ${st(askedClass!)} tested${a.asked.subject?` (${a.asked.subject})`:''} used ${altComparison.map(c=>`${c.asked.value} ${u(c.asked.unit)} against ${c.alternative.value} ${u(c.alternative.unit)} for ${c.task?st(c.task):'one dish'}`).join('; ')} in the ${st(a.alternative.equipmentClass)} tested${a.alternative.subject?` (${a.alternative.subject})`:''}. This is one ${st(askedClass!)} against one ${st(a.alternative.equipmentClass)} in one experiment; whether it holds for your ${st(a.alternative.equipmentClass)} is not established.`);
  // Phase272 (owner review §9): comparable within the experiment is not the same as every essential condition met.
  const unverifiable=[...new Set(altComparison.flatMap(c=>c.conditionsNotVerifiable))];
  if(unverifiable.length)out.statements.push(`These results are comparable only within that experiment (same task and food load); the experiment does not record ${unverifiable.map(st).join(', ')}, which the comparison requires, so it is a conditional comparison, not an established one.`);}
 if(decision==='research'||decision==='partial_comparison'||decision==='no_purchase_check'){
  const need=know.filter(k=>!CONTEXT_NEEDS269.has(k.need)&&!assessed.has(k.need)).map(statement).filter((x):x is string=>!!x);
  if(need.length)out.statements.push(`What would answer this: ${need.join('; ')}.`);
  // S79: research caveats are NOT part of the answer (owner release-safety review): see teachingCaveatsShadow
  for(const k of know)for(const p of k.proxies)if(p.startsWith('attr:')&&!CONTEXT_NEEDS269.has(k.need))out.limitations.push(`Declared ${st(p.slice(5))} is not evidence of ${st(k.need)}: ${plain(k.notes.get(p))}`.slice(0,320));
 }
 return {decision,outcomes,...(partial?{partialComparison:partial}:{}),...(altComparison?{alternativeComparison:altComparison}:{})};
}


/** S79 (owner release-safety review): the research caveats PEE WOULD attach to an answer, for internal evaluation only.
 * Machine-translated and unreviewed; their scope and applicability conditions are not yet checked against the user's
 * situation, so they never enter an Advice253 (no field, no statement, no limitation). Callers are evaluation scripts. */
export function teachingCaveatsShadow(store:KnowledgeStore246,advice:Advice253):{need:string;concept:string;caveat:StoredStatement}[]{
 if(!advice.category)return [];const needs=(advice.goalAssessment?.outcomes??[]).filter(o=>o.coverage!=='context'&&o.coverage!=='assessed').map(o=>o.need);
 const out:{need:string;concept:string;caveat:StoredStatement}[]=[];const shown=new Set<string>();
 for(const k of needKnowledge269(store,advice.category,needs))for(const c of [k.need,...k.byMeasure.keys()])
  for(const st of caveatsAbout(store,advice.category,c,1))if(!shown.has(st.rendered)){shown.add(st.rendered);out.push({need:k.need,concept:c,caveat:st});}
 return out;
}
