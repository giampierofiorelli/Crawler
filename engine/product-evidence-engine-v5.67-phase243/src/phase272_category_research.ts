/** Phase272 — researching a category PEE was never taught (owner brief 2026-10-17 §7; memo "Memoria strategica" §6.1).
 *
 * A procedure over the EXISTING architecture, not a new engine:
 *  1. gap: the request names a product type the registry and the store do not know (Phase248 'out_of_scope');
 *  2. principles: transferable METHOD patterns mined from the categories the store was taught — per generic physical
 *     dimension, which taught measurements use it, which conditions they require and which declared attributes the teaching
 *     calls insufficient. A pattern counts only when it recurs in at least two taught categories;
 *  3. hypotheses: for the new category, the outcomes the request's own words name (matched against the need phrases of
 *     every taught category, i.e. transferred phrase-to-outcome knowledge) become PROVISIONAL outcome/measurement pairs,
 *     each attributed to the categories it was transferred from and labelled instructor_hypothesis;
 *  4. acquisition: a method page the research step reads (transient bytes) confirms a hypothesis only when the page itself
 *     names the dimension's words AND units; a confirmed pair becomes a method_reference citing the page; what the page
 *     measures that no hypothesis anticipated becomes a research lead (exploratory), never a measurement;
 *  5. the result is a CategoryTeaching252 applied through applyTeaching252 (the same mechanism as owner packages), so the
 *     Phase272 extraction plan, the request path and the decision layer reuse it unchanged.
 * Nothing here is product evidence; every item stays technical_hypothesis / assistant_authored_unreviewed in the store,
 * and the teaching's own basis label (instructor_hypothesis vs method_reference) keeps the distinction visible.
 */
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import {relations247} from './phase247_category_relations.js';
import {DIMENSION_WORDS272,UNIT_LEXICON272,unitAlternation272,canonicalUnit272,planWords272} from './phase272_extraction_plan.js';
import {textBlocks225} from './phase225_transient_test_probe.js';
import type {CategoryTeaching252,TeachingSource252,Taught252,TaughtNeed252} from './phase252_category_teaching.js';

export interface MethodPrinciple272 {
 dimension:string;
 /** Taught categories whose measurements use this dimension (at least two for a principle). */
 categories:string[];measures:string[];
 /** Condition ids those measurements require, per category (the comparability lesson that transfers). */
 conditions:{categoryId:string;id:string}[];
 /** Declared attributes the teaching marks not_sufficient_for an outcome measured in this dimension. */
 proxyAttributes:{categoryId:string;ref:string}[];
 status:'transferable_method_hypothesis';
}
const dimsOf=(text:string)=>{const ws=planWords272(text);return Object.entries(DIMENSION_WORDS272).filter(([,dw])=>dw.some(w=>ws.includes(w))).map(([d])=>d);};
/** Mine the taught categories for method patterns that recur across categories (store read-only). */
export function transferablePrinciples272(store:KnowledgeStore246,taught:readonly string[]):MethodPrinciple272[]{
 const per=new Map<string,MethodPrinciple272>();
 for(const c of taught){const items=store.categoryItems246(c);const rels=relations247(store,c);const by=new Map(items.map(i=>[i.itemId,i]));
  const condIds=new Set(rels.filter(r=>r.kind==='requires_condition').map(r=>by.get(r.to.slice(5))?.concept?.id));
  for(const m of items.filter(i=>i.concept?.kind==='measurement'&&!condIds.has(i.concept.id))){
   const out=rels.filter(r=>r.from==='item:'+m.itemId&&r.kind==='measured_by').map(r=>r.to.slice(5));
   if(!out.length)continue;
   for(const d of dimsOf(m.concept!.id.replace(/_/g,' ')+' '+m.statement)){
    const p=per.get(d)??{dimension:d,categories:[],measures:[],conditions:[],proxyAttributes:[],status:'transferable_method_hypothesis' as const};
    if(!p.categories.includes(c))p.categories.push(c);p.measures.push(c+':'+m.concept!.id);
    for(const r of rels.filter(r=>r.from==='item:'+m.itemId&&r.kind==='requires_condition')){const id=by.get(r.to.slice(5))?.concept?.id;if(id)p.conditions.push({categoryId:c,id});}
    for(const r of rels.filter(r=>r.kind==='not_sufficient_for'&&r.from.startsWith('attr:')&&out.includes(r.to.slice(5))))p.proxyAttributes.push({categoryId:c,ref:r.from});
    per.set(d,p);}
  }}
 return [...per.values()].filter(p=>p.categories.length>=2).map(p=>({...p,categories:p.categories.sort(),measures:[...new Set(p.measures)].sort(),
  conditions:p.conditions.filter((x,i,a)=>a.findIndex(y=>y.categoryId===x.categoryId&&y.id===x.id)===i),
  proxyAttributes:p.proxyAttributes.filter((x,i,a)=>a.findIndex(y=>y.categoryId===x.categoryId&&y.ref===x.ref)===i)})).sort((a,b)=>a.dimension.localeCompare(b.dimension));
}

export interface ProvisionalOutcome272 {id:string;dimension:string;requestPhrases:string[];transferredFrom:{categoryId:string;outcome:string;phrase:string}[];
 status:'instructor_hypothesis'|'method_reference';confirmedBy:string[]}
export interface CategoryResearch272 {
 categoryId:string;term:string;
 gap:{registryKnows:false;storeItems:number;statement:string};
 principles:MethodPrinciple272[];
 outcomes:ProvisionalOutcome272[];
 /** What a method page measures that no hypothesis anticipated: research leads (dimension words and units seen). */
 leads:{dimension:string;unitsSeen:string[];source:string;status:'exploratory_research_lead'}[];
 sources:TeachingSource252[];
}
const idOf=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
/** Steps 1-3: the gap and the provisional hypotheses for `term`, from the request texts and the taught categories only. */
export function researchUnknownCategory272(store:KnowledgeStore246,term:string,requestTexts:readonly string[],taught:readonly string[]):CategoryResearch272{
 const categoryId=idOf(term)+(idOf(term).endsWith('s')?'':'s');const low=requestTexts.join(' \n ').toLowerCase();
 const principles=transferablePrinciples272(store,taught);
 // Transferred phrase-to-outcome knowledge: a need phrase taught for ANY category, found in a request, names an outcome type;
 // the type is the dimension of the measurements that establish that outcome where it was taught.
 const outs=new Map<string,ProvisionalOutcome272>();
 for(const c of taught){const items=store.categoryItems246(c);const rels=relations247(store,c);const by=new Map(items.map(i=>[i.itemId,i]));
  for(const o of items.filter(i=>i.concept?.kind==='outcome')){
   // A taught need phrase of two or more words, or one distinctive word, present in a request (word order free within it).
   const phrase=o.concept!.aliases.map(a=>a.toLowerCase()).find(a=>{const ws=planWords272(a);return ws.length>=1&&(ws.length>=2||a.split(/\s+/).length===1)&&ws.every(w=>new RegExp('\\b'+esc(w)).test(low));});
   if(!phrase)continue;
   const ms=rels.filter(r=>r.kind==='measured_by'&&r.to==='item:'+o.itemId).map(r=>by.get(r.from.slice(5))).filter((x):x is NonNullable<typeof x>=>!!x);
   // The dimension of a measurement is read from its id first (what it measures), its statement only when the id names none.
   const dims=new Set(ms.flatMap(m=>{const d=dimsOf(m.concept!.id.replace(/_/g,' '));return d.length?d:dimsOf(m.statement);}));
   for(const d of dims){if(!principles.some(p=>p.dimension===d))continue;const id=`${d}_outcome`;
    const x=outs.get(id)??{id,dimension:d,requestPhrases:[],transferredFrom:[],status:'instructor_hypothesis' as const,confirmedBy:[]};
    if(!x.requestPhrases.includes(phrase))x.requestPhrases.push(phrase);x.transferredFrom.push({categoryId:c,outcome:o.concept!.id,phrase});outs.set(id,x);}
  }}
 // Generic dimension words in the requests themselves ("quiet", "electricity", "noise"): an outcome type even when no taught
 // phrase matches, provided the dimension is a cross-category principle.
 const reqWords=new Set(planWords272(low));
 for(const p of principles){const hit=DIMENSION_WORDS272[p.dimension].filter(w=>w.length>3&&reqWords.has(w));if(!hit.length)continue;const id=`${p.dimension}_outcome`;
  const x=outs.get(id)??{id,dimension:p.dimension,requestPhrases:[],transferredFrom:[],status:'instructor_hypothesis' as const,confirmedBy:[]};
  for(const w of hit)if(!x.requestPhrases.includes(w))x.requestPhrases.push(w);outs.set(id,x);}
 return {categoryId,term,gap:{registryKnows:false,storeItems:store.categoryItems246(categoryId).length,
  statement:`"${term}" is not a category PEE was taught: its outcomes, measurements and conditions are transferred hypotheses until a source confirms them`},
  principles,outcomes:[...outs.values()].sort((a,b)=>a.id.localeCompare(b.id)),leads:[],sources:[]};
}
/** Step 4: read one method page (transient). A hypothesis is confirmed only by the page's own dimension words (two or more)
 * AND a unit of that dimension; dimensions the page measures that no hypothesis names become research leads. */
export function acquireFromMethodPage272(r:CategoryResearch272,page:{url:string;publisher:string;html:string;consulted:string}):CategoryResearch272{
 const {blocks}=textBlocks225(page.html,{maxBlocks:1500});const text=blocks.join('\n');const low=text.toLowerCase();const ws=new Set(planWords272(text));
 const unitRe=new RegExp('(?<![\\d.,])\\d{1,4}(?:[.,]\\d{1,3})?\\s*('+unitAlternation272(UNIT_LEXICON272.map(u=>u.unit))+')(?![a-z0-9])','gi');
 const units=new Set([...text.matchAll(unitRe)].map(m=>canonicalUnit272(m[1])).filter((u):u is string=>!!u));
 const unitSeen=(d:string)=>UNIT_LEXICON272.filter(u=>u.dimension===d).some(u=>units.has(u.unit)||(u.re.length>4&&new RegExp('\\b(?:'+u.re+')\\b','i').test(low)));
 const named=(d:string)=>DIMENSION_WORDS272[d].filter(w=>ws.has(w)).length>=2;
 const sid='m272_'+idOf(new URL(page.url).host).slice(0,24)+'_'+r.sources.length;
 const src:TeachingSource252={id:sid,url:page.url,publisher:page.publisher,role:'independent_test_publisher',consulted:page.consulted,
  access:'public method page read once under the Phase272 research policy (transient bytes; not retained)',teaches:'test method for '+r.term};
 const outcomes=r.outcomes.map(o=>named(o.dimension)&&unitSeen(o.dimension)?{...o,status:'method_reference' as const,confirmedBy:[...new Set([...o.confirmedBy,sid])]}:o);
 const leads=[...r.leads];
 for(const d of Object.keys(DIMENSION_WORDS272))if(named(d)&&unitSeen(d)&&!outcomes.some(o=>o.dimension===d)&&!leads.some(l=>l.dimension===d))
  leads.push({dimension:d,unitsSeen:UNIT_LEXICON272.filter(u=>u.dimension===d&&units.has(u.unit)).map(u=>u.unit),source:sid,status:'exploratory_research_lead'});
 return {...r,outcomes,leads,sources:[...r.sources,src]};
}
/** Step 5: the research as a CategoryTeaching252 (applied with applyTeaching252; sources registered with
 * registerTeachingSources252). Unconfirmed hypotheses stay instructor_hypothesis; leads are recorded as knowledge gaps. */
export function teachingFromResearch272(r:CategoryResearch272,written:string):CategoryTeaching252{
 const S=(text:string,basis:Taught252['basis'],sources:string[]=[]):Taught252=>({text:text.replace(/[<>]/g,' ').slice(0,170),basis,sources});
 const needs:TaughtNeed252[]=r.outcomes.map(o=>{const p=r.principles.find(x=>x.dimension===o.dimension)!;const from=[...new Set(o.transferredFrom.map(t=>t.categoryId))].join(', ');
  const confirmed=o.status==='method_reference';
  // Aliases: the request phrases that produced the hypothesis plus the everyday words of its dimension (generic lexicon).
  const aliases=[...new Set([...o.requestPhrases,...DIMENSION_WORDS272[o.dimension].filter(w=>/^[a-z]{5,}$/.test(w))])].slice(0,8);
  return {id:o.id,kind:'outcome',statement:`${r.term}: outcome measured in ${o.dimension} (${from?'transferred from '+from:'generic dimension'}).`.slice(0,160),aliases,
   measureId:`${o.dimension}_per_completed_task`,conditions:[`${o.dimension}_matched_conditions`],
   outcome:S(confirmed?`${o.dimension} result of a completed task; a test publisher's method page states this measurement`:`Hypothesis: ${o.dimension} per completed task under matched conditions, as taught for ${p.categories.join(', ')}`,
    confirmed?'method_reference':'instructor_hypothesis',confirmed?o.confirmedBy:[])};});
 const conditions=r.outcomes.map(o=>{const p=r.principles.find(x=>x.dimension===o.dimension)!;
  return {id:`${o.dimension}_matched_conditions`,statement:S(`Condition (transferred): compare ${o.dimension} only for the same task, load and mode; source categories require ${[...new Set(p.conditions.map(c=>c.id))].slice(0,3).join(', ')}`,'instructor_hypothesis')};});
 return {categoryId:r.categoryId,version:'t272.research1',written,registry:{aliases:[r.term,r.term+'s'],partPhrases:[]},subtypes:[],mechanisms:[],needs,
  sourceRoutes:[{question:`which ${r.term} best meets a measured outcome`,sourceRoles:['independent_test_publisher','standards_body'],why:'transferred: outcomes need first-hand tests with stated conditions; declarations are proxies'}],
  interpretation:[],applicability:[S(`Every ${r.term} relation here is transferred or read from method pages; none is evidence about any product`,'instructor_hypothesis')],
  gaps:[S(r.gap.statement,'instructor_hypothesis'),...r.leads.map(l=>S(`Research lead: a method page measures ${l.dimension} (${l.unitsSeen.join(', ')||'unit words'}) that no transferred hypothesis anticipated`,'instructor_hypothesis'))],conditions};
}
