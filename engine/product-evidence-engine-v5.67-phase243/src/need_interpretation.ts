/** R3-P stage 2 (owner authorisation 2026-10-20, verbatim in .claude/skills/pee-guided-learning/references/
 * owner-r3p-authorisation-2026-10-20.md): the interpretation of a buying request's needs, with a knowledge-path switch.
 *
 * One build, one parser, one negation foundation (src/language_scope.ts) for every arm:
 *  - A (knowledgeGuided off): what the operational path already recognises (needs named by their aliases or paraphrased,
 *    features, limits, stances, scenarios, questions), laid out in distinct fields, plus a trace of every clause;
 *  - B (knowledgeGuided on): A plus needs INFERRED from scientific knowledge PEE already holds. The path is typed and
 *    attributable at every step: a use context of the quantity knowledge (QK useContexts) or the request's own words ->
 *    typed knowledge statements of the category (knowledge_statements: bears_on_outcome, measured_by, requires, ...; each
 *    with its source document and line) -> the taught concept the statement is about -> the outcome it serves (a stored
 *    measured_by relation when the concept is a measurement). Nothing here names a category, a product or a phrase.
 *  - C-lite (shadow): candidate relations generated from the knowledge (scripts/r3p-need-candidates.mjs) and admitted as
 *    `experimental` rules under the S103 admission; their effect is reported, never applied.
 *
 * Boundaries (never crossed): an inferred need is experimental and unverified (the knowledge it comes from is
 * proposed_unverified / assistant_authored_unreviewed); it never becomes a constraint, an exclusion, a ranking input or a
 * statement of the answer. A requested feature is never evidence that its outcome is met. */
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import type {Advice253} from './phase253_advice_contract.js';
import {statementsOf} from './knowledge_statements.js';
import {loadQuantityKnowledge,type QuantityKnowledge} from './quantity_knowledge.js';
import {stanceAt,clauseAround,tokens,scopeVocabulary} from './language_scope.js';
import {loadProductFunctions} from './product_facts.js';
import {relations247,needKnowledge269} from './phase247_category_relations.js';
import {evaluate,type CompiledProgram} from './knowledge_rules.js';
import {claimsOfN1,type RowClaimN1} from './relation_claims_n1.js';

export const NEED_INTERPRETATION_VERSION='ni.1';
/** A1: how any consumer must read this block */
export const STATUS_NOTE='Experimental pilot output from machine-translated, unreviewed knowledge: hypotheses for evaluation, not established facts; never a decision input.';
/** The statement types that relate a situation, a goal or a measurement to something else (not method steps). */
export const INFERENCE_TYPES=['bears_on_outcome','measured_by','requires','not_sufficient','limitation','depends_on','definition','applicability'] as const;
/** Thresholds, fixed before any evaluation run (development material only; see evaluation/r3p/preregistration.json). */
export const NI_THRESHOLDS={statementMatch:2.0,minSharedStems:1,conceptMatch:2.5,conceptMargin:1.25,minSupport:1,
 /** an anchor word may appear in at most this share of the category's concept texts (otherwise it names nothing in particular) */ anchorMaxShare:0.25,
 /** ... and in the concept texts of at most this many categories (otherwise it is generic vocabulary) */ anchorMaxCategories:2,
 /** inferred needs kept per request (the best supported first) */ maxInferred:1};

export interface PathStep {step:'request_words'|'use_context'|'statement'|'concept'|'relation'|'candidate';ref:string;text:string}
export interface InferredNeed {concept:string;category:string;kind:string;state:'experimental_unverified';support:number;score:number;
 from:string[];anchors:string[];path:PathStep[][];provenance:'existing_statement'|'existing_relation'|'recovered_relation'}
export interface NeedInterpretation {
 schema:'pee.r3p.need-interpretation.v1';version:string;knowledgeGuided:boolean;category:string|null;
 /** A1 (owner 2026-10-21): the block declares itself; its inferences are never established facts */
 status:'experimental_unreviewed';statusNote:string;
 expressed:{concept:string;span:string|null}[];
 inferred:InferredNeed[];
 unsupported:{concept:string;reason:string;support:number}[];
 features:{feature:string;kind:'function'|'mode';span:string;note:string}[];
 stances:{term:string;stance:'indifferent'|'negated';negator:string}[];
 contexts:{id:string;term:string}[];
 scenarios:string[];questions:string[];
 /** principle 8: every clause, with what interpreted it; nothing is dropped silently */
 trace:{span:string;status:'interpreted'|'uninterpreted';by:string[]}[];
 evidencePlan:{concept:string;basis:'expressed'|'inferred';measures:string[];conditions:string[];notSufficient:string[]}[];
 /** C-lite (shadow): what admitted experimental candidates would add; never applied */
 candidateEffects?:{concept:string;rules:string[]}[];
}

const STOP=new Set(('a an the to of for and or with in on at by from my me i i\'m im it its is be am are was were been this that these those very so too just '+
 'want wants need needs looking look buy buying get getting good best which what how would like could should can will something some any '+
 'one ones we our us you your they their he she his her do does did have has had not no but if then than about into also really quite '+
 'please thanks hi hello there here when where who why much many more most less lot lots use using used uses actual actually every each only least '+
 'during make makes made work works working people person thing things way well enough next other another same new old still even just also proper properly real really right').split(' '));
/** A light English stem (no category word list): plural, -ing, -er, -ed, -ly. */
export function stemNI(w:string):string{let s=w.toLowerCase().replace(/[’']s$/,'').replace(/[^\p{L}\p{N}]/gu,'');
 // superlatives and comparatives ('crunchiest' -> crunchy, 'cheapest' -> cheap) before the plain suffixes
 for(const suf of ['iest','ier','ingly','edly','ings','ing','est','ers','ies','ed','er','es','ly','s'])if(s.length-suf.length>=4&&s.endsWith(suf)){s=s.slice(0,-suf.length);if(suf==='ies'||suf==='iest'||suf==='ier')s+='y';break;}
 return s;}
export const stemsNI=(t:string)=>new Set(tokens(t).filter(x=>x.kind==='word'&&!STOP.has(x.w)&&x.w.length>=3).map(x=>stemNI(x.w)).filter(s=>s.length>=3));

interface ConceptText {id:string;kind:string;itemRef:string;stems:Set<string>}
function idfOf(docs:readonly Set<string>[]){const df=new Map<string,number>();for(const d of docs)for(const s of d)df.set(s,(df.get(s)??0)+1);
 const n=Math.max(1,docs.length);return (s:string)=>Math.log((n+1)/((df.get(s)??0)+0.5));}

/** In how many categories' concept texts each word stem appears (generic vocabulary spreads across categories). */
const spreadCache=new WeakMap<KnowledgeStore246,Map<string,number>>();
function crossCategorySpread(store:KnowledgeStore246):Map<string,number>{
 const hit=spreadCache.get(store);if(hit)return hit;const out=new Map<string,number>();
 const cats=(store.db.prepare('SELECT DISTINCT category_id c FROM category_items WHERE concept_id IS NOT NULL').all() as {c:string}[]).map(r=>r.c);
 for(const c of cats){const st=new Set<string>();for(const i of store.categoryItems246(c).filter(i=>i.concept))for(const x of stemsNI([i.statement,...i.concept!.aliases].join(' ')))st.add(x);
  for(const x of st)out.set(x,(out.get(x)??0)+1);}
 spreadCache.set(store,out);return out;}
export interface OutcomeSupport {c:ConceptText;stmts:Set<string>;score:number;from:Set<string>;path:PathStep[][];prov:InferredNeed['provenance'];
 /** query words that name this outcome in its own definition (description, aliases, id), are specific to it, and that a
  * supporting statement itself uses (the knowledge relates the word to the outcome) */ anchors:string[];via:Set<string>}
/** The outcomes of a category that typed knowledge statements relate to the given words: each statement sharing at least
 * two informative words with the query (one of them the request's own) is mapped to the taught concept it is about (best
 * text match, with a margin), and a measurement concept to the outcomes it measures (stored measured_by relations).
 * Shared by arm B (request words + use-context words) and the C-lite candidate generator (use-context words alone). */
export function knowledgeOutcomes(store:KnowledgeStore246,cat:string,reqStems:ReadonlySet<string>,ctxStems:ReadonlySet<string>=new Set(),contexts:readonly {id:string;term:string}[]=[],
 o:{claims?:boolean}={}):OutcomeSupport[]{
 const items=store.categoryItems246(cat).filter(i=>i.concept);
 const concepts:ConceptText[]=items.map(i=>({id:i.concept!.id,kind:i.concept!.kind,itemRef:'item:'+i.itemId,stems:stemsNI([i.statement,...i.concept!.aliases,i.concept!.id.replace(/_/g,' ')].join(' '))}));
 const cIdf=idfOf(concepts.map(c=>c.stems));
 const rels=relations247(store,cat);
 const outcomesOfMeasure=(ref:string)=>rels.filter(r=>r.kind==='measured_by'&&r.from===ref).map(r=>concepts.find(c=>c.itemRef===r.to)).filter((c):c is ConceptText=>!!c&&c.kind!=='measurement');
 // N1 (opt-in): the situation/need links of recovered row claims join the statements as situation -> outcome pairs; every
 // guard below (shared words, concept margin, anchors, one inference per request) applies to them unchanged
 const st=[...statementsOf(store,cat,{types:INFERENCE_TYPES}),...(o.claims?claimStatementsN1(claimsOfN1(store,cat)):[])];
 // the typed structure of a statement: in measured_by and requires the SUBJECT is the goal or situation and the object what
 // establishes or conditions it; in bears_on_outcome the subject is the situation and the OBJECT the outcome. The request is
 // compared with the goal/situation side; the outcome is read from the side that names it.
 const GOAL_SUBJECT=new Set(['measured_by','requires']);const SITUATION_OUTCOME=new Set(['bears_on_outcome']);
 const sideText=(s:typeof st[number],side:'subject'|'object')=>(s[side] as {text?:string}|null)?.text??'';
 const matchText=(s:typeof st[number])=>GOAL_SUBJECT.has(s.type)||SITUATION_OUTCOME.has(s.type)?sideText(s,'subject')||s.rendered:s.rendered;
 const sStems=st.map(s=>stemsNI(matchText(s)));const sIdf=idfOf(sStems);
 const mapStems=st.map(s=>stemsNI(SITUATION_OUTCOME.has(s.type)?sideText(s,'object')||s.rendered:GOAL_SUBJECT.has(s.type)?sideText(s,'subject')||s.rendered:s.rendered));
 const query=new Set([...reqStems,...ctxStems]);
 const df=new Map<string,number>();for(const c of concepts)for(const x of c.stems)df.set(x,(df.get(x)??0)+1);
 const cross=crossCategorySpread(store);
 const specific=(x:string)=>(df.get(x)??0)<=Math.max(1,NI_THRESHOLDS.anchorMaxShare*concepts.length)&&(cross.get(x)??0)<=NI_THRESHOLDS.anchorMaxCategories;
 const agg=new Map<string,OutcomeSupport>();
 st.forEach((s,k)=>{const shared=[...sStems[k]].filter(x=>query.has(x));const own=shared.filter(x=>reqStems.has(x));
  const score=shared.reduce((a,x)=>a+sIdf(x),0);
  if(shared.length<NI_THRESHOLDS.minSharedStems||!own.length||score<NI_THRESHOLDS.statementMatch)return;
  const ranked=concepts.filter(c=>!GOAL_SUBJECT.has(s.type)||c.kind!=='measurement').map(c=>({c,sim:[...mapStems[k]].filter(x=>c.stems.has(x)).reduce((a,x)=>a+cIdf(x),0)})).sort((a,b)=>b.sim-a.sim);
  const best=ranked[0];const second=ranked.find(r=>r.c.id!==best?.c.id);
  if(!best||best.sim<NI_THRESHOLDS.conceptMatch)return;
  const resolve=(c:ConceptText)=>c.kind==='measurement'?outcomesOfMeasure(c.itemRef):[c];
  let targets=resolve(best.c);
  // two close concepts are no ambiguity when they resolve to the same outcome (a measurement and the outcome it measures)
  if(second&&best.sim<second.sim*NI_THRESHOLDS.conceptMargin){const ids=new Set(resolve(second.c).map(c=>c.id));targets=targets.filter(t=>ids.has(t.id));if(!targets.length)return;}
  for(const t of targets){if(t.kind!=='outcome'&&t.kind!=='environment')continue;
   const path:PathStep[]=[{step:'request_words',ref:'request',text:own.join('+')},
    ...contexts.filter(c=>shared.some(x=>ctxStems.has(x))).map(c=>({step:'use_context' as const,ref:'qk:useContexts/'+c.id,text:c.term})),
    {step:'statement',ref:s.statementId,text:`${s.type} (${s.sourceDocument}:${s.line}, ${s.reliability})`},
    {step:'concept',ref:best.c.id,text:`matched ${best.sim.toFixed(2)}`},
    ...(best.c.kind==='measurement'?[{step:'relation' as const,ref:`measured_by ${best.c.id} -> ${t.id}`,text:'stored category relation'}]:[])];
   const a=agg.get(t.id)??{c:t,stmts:new Set<string>(),score:0,from:new Set<string>(),path:[],prov:s.statementId.startsWith('clm_')?'recovered_relation':best.c.kind==='measurement'?'existing_relation':'existing_statement',anchors:[...query].filter(x=>t.stems.has(x)&&specific(x)),via:new Set<string>()};
   if(!a.stmts.has(s.statementId)){a.stmts.add(s.statementId);a.score+=score;a.path.push(path);}own.forEach(x=>a.from.add(x));shared.forEach(x=>a.via.add(x));agg.set(t.id,a);}});
 return [...agg.values()].sort((x,y)=>y.score-x.score||x.c.id.localeCompare(y.c.id));
}

/** N1: the relevance links of row claims that start at a situation or need, as situation -> outcome statement pairs
 * (subject = the situation or need cell, object = the cell it is relevant to or addressed by). Machine-derived and
 * unreviewed; the statement id is the claim id with the link index. */
export function claimStatementsN1(claims:readonly RowClaimN1[]):StoredStatementLike[]{
 const out:StoredStatementLike[]=[];
 const push=(c:RowClaimN1,ref:string,f:{text:string},t:{text:string},how:string)=>out.push({statementId:`${c.claimId}#${ref}`,categoryId:c.categoryId,sourceDocument:c.source.document,
  line:c.source.line,headings:c.source.headings,type:'bears_on_outcome',polarity:'positive',hedge:null,status:[],scope:[],subject:{text:f.text},object:{text:t.text},parts:[],
  rendered:`${f.text} -> ${how} -> ${t.text}`,selfCheck:[],translator:c.mapping,reliability:'machine_derived_unreviewed'});
 for(const c of claims){
  // the need column of a row interprets its situation column (a role pairing of the claim, not a link)
  for(const sp of c.participants.filter(p=>p.role==='situation'))for(const np of c.participants.filter(p=>p.role==='need'))push(c,`s${sp.col}n${np.col}`,sp,np,'interpreted_as');
  c.links.forEach((l,i)=>{const f=c.participants.find(p=>p.col===l.from),t=c.participants.find(p=>p.col===l.to);
   if(!f||!t||(l.kind!=='relevant_to'&&l.kind!=='addressed_by')||(f.role!=='situation'&&f.role!=='need'))return;push(c,String(i),f,t,l.kind);});}
 return out;
}
type StoredStatementLike=Omit<ReturnType<typeof statementsOf>[number],'subject'|'object'|'reliability'>&{subject:{text:string}|null;object:{text:string}|null;reliability:string};

/** N1 L3: knowledge retrieved for a new situation, from the stored statements (R0: the arm-B statement texts) or from the
 * recovered row claims (R1: their situation and need cells), with one scoring for both: inverse-document-frequency weight of
 * the request words an item shares, over the items in scope, kept from the arm-B statement threshold. The category may be
 * unknown (null): every category's items are pooled. Read-only; nothing here decides anything. */
export function retrieveKnowledgeN1(store:KnowledgeStore246,text:string,o:{categoryId:string|null;source:'statements'|'claims';k?:number}):
 {ref:string;categoryId:string;text:string;shared:string[];score:number}[]{
 const cats=o.categoryId?[o.categoryId]:o.source==='claims'?[...new Set(claimsOfN1(store).map(c=>c.categoryId))]:
  (store.db.prepare("SELECT DISTINCT category_id c FROM knowledge_statements WHERE state='current' ORDER BY c").all() as {c:string}[]).map(r=>r.c);
 const items:{ref:string;categoryId:string;text:string;stems:Set<string>}[]=[];
 const GOAL_SUBJECT=new Set(['measured_by','requires','bears_on_outcome']);
 for(const cat of cats){
  if(o.source==='claims')for(const c of claimsOfN1(store,cat)){const from=c.participants.filter(p=>p.role==='situation'||p.role==='need');
   items.push({ref:c.claimId,categoryId:cat,text:c.participants.map(p=>`${p.header}: ${p.text}`).join(' | '),stems:stemsNI(from.map(p=>p.text).join(' '))});}
  else for(const s of statementsOf(store,cat,{types:INFERENCE_TYPES}))
   items.push({ref:s.statementId,categoryId:cat,text:s.rendered,stems:stemsNI(GOAL_SUBJECT.has(s.type)?(s.subject as {text?:string}|null)?.text||s.rendered:s.rendered)});}
 const idf=idfOf(items.map(i=>i.stems));const q=stemsNI(text);
 return items.map(i=>{const shared=[...i.stems].filter(x=>q.has(x));return {ref:i.ref,categoryId:i.categoryId,text:i.text,shared,score:Number(shared.reduce((a,x)=>a+idf(x),0).toFixed(3))};})
  .filter(r=>r.shared.length>=NI_THRESHOLDS.minSharedStems&&r.score>=NI_THRESHOLDS.statementMatch)
  .sort((a,b)=>b.score-a.score||a.ref.localeCompare(b.ref)).slice(0,o.k??5);
}

export interface NeedInterpretationOptions {knowledgeGuided?:boolean;qk?:QuantityKnowledge;
 /** N1 (opt-in, experimental): recovered row claims join the arm-B knowledge (same code, same guards) */ claims?:boolean;
 /** words of the category's own names (they say which product, not which need) */ categoryWords?:readonly string[];
 /** C-lite: the admitted experimental candidate program (shadow) */ candidates?:CompiledProgram|null}

/** The needs of a request, laid out for the R3-P pilot. `advice` is the operational answer for the same text (unchanged). */
export function interpretNeeds(text:string,advice:Advice253,store:KnowledgeStore246,o:NeedInterpretationOptions={}):NeedInterpretation{
 const qk=o.qk??loadQuantityKnowledge();const v=scopeVocabulary(qk);const low=text.toLowerCase().replace(/[’‘]/g,"'");
 const cat=advice.category;const kg=!!o.knowledgeGuided;
 const catStems=new Set((o.categoryWords??[]).flatMap(w=>[...stemsNI(w)]));
 // ---- stances: request words set aside (indifferent or negated), from the shared scope
 const stances:NeedInterpretation['stances']=[];const setAside=new Set<string>();
 for(const t of tokens(text))if(t.kind==='word'&&!STOP.has(t.w)&&t.w.length>=3&&!v.negators.includes(t.w)&&!/n't$/.test(t.w)){const st=stanceAt(text,t.start,t.end,v);
  if(st){stances.push({term:t.w,stance:st.stance,negator:st.negator});setAside.add(stemNI(t.w));}}
 // ---- features: functions and named modes of the reading vocabulary (functions.v1.json), not negated
 const fp=loadProductFunctions().pack;const features:NeedInterpretation['features']=[];
 const findPhrase=(p:string)=>{const re=new RegExp('(?:^|[^\\p{L}\\p{N}])('+p.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')(?![\\p{L}\\p{N}])','u');const m=re.exec(low);return m?{start:m.index+m[0].length-m[1].length,end:m.index+m[0].length}:null;};
 const NOTE='a feature is not evidence that its outcome is met: what it achieves needs a result measured at that setting';
 for(const f of fp.functions)for(const term of f.terms){const h=findPhrase(term);if(h&&!stanceAt(text,h.start,h.end,v)&&!features.some(x=>x.feature===f.id))features.push({feature:f.id,kind:'function',span:text.slice(h.start,h.end),note:NOTE});}
 for(const [term,mode] of ((fp as {modes?:{nominalTerms?:[string,string][]}}).modes?.nominalTerms??[])){const h=findPhrase(term);if(h&&!stanceAt(text,h.start,h.end,v)&&!features.some(x=>x.feature==='mode:'+mode))features.push({feature:'mode:'+mode,kind:'mode',span:text.slice(h.start,h.end),note:NOTE});}
 // ---- expressed needs (the operational recognition, unchanged)
 const spans=new Map((advice.researchInputs?.needSpans??[]).map(s=>[s.id,s.matched]));
 const expressed=advice.needs.map(n=>({concept:n,span:spans.get(n)??null}));
 // ---- use contexts (QK useContexts), not negated: a typed entity of the knowledge, read by B only
 const contexts:NeedInterpretation['contexts']=[];
 if(kg)for(const c of qk.pack.useContexts??[])for(const term of c.terms){const h=findPhrase(term);if(h&&!stanceAt(text,h.start,h.end,v)){contexts.push({id:c.id,term});break;}}
 // ---- B: inference from typed knowledge statements
 const inferred:InferredNeed[]=[];const unsupported:NeedInterpretation['unsupported']=[];
 if(kg&&cat){
  // knowledge fills what the operational path left unexplained: words already used by a recognised need or a limit are not
  // evidence again
  const explained=new Set([...stemsNI([...spans.values()].join(' ').replace(/[~+]/g,' ')),...stemsNI([...advice.constraints,...(advice.otherLimits??[])].map(c=>c.span).join(' '))]);
  const reqStems=new Set([...stemsNI(text)].filter(s=>!setAside.has(s)&&!catStems.has(s)&&!explained.has(s)));
  const ctxStems=new Set(contexts.flatMap(c=>(qk.pack.useContexts??[]).find(u=>u.id===c.id)!.terms.flatMap(t=>[...stemsNI(t)])).filter(s=>!catStems.has(s)));
  const have=new Set(advice.needs);
  for(const a of knowledgeOutcomes(store,cat,reqStems,ctxStems,contexts,{claims:!!o.claims})){
   if(have.has(a.c.id))continue;
   const blocked=[...a.c.stems].find(x=>setAside.has(x));
   if(blocked){unsupported.push({concept:a.c.id,reason:`the request sets "${blocked}" aside`,support:a.stmts.size});continue;}
   if(!a.anchors.length){unsupported.push({concept:a.c.id,reason:'statements relate the request to it, but no word of the request names it',support:a.stmts.size});continue;}
   if(a.stmts.size<NI_THRESHOLDS.minSupport){unsupported.push({concept:a.c.id,reason:'too little support',support:a.stmts.size});continue;}
   if(inferred.length>=NI_THRESHOLDS.maxInferred){unsupported.push({concept:a.c.id,reason:'a better supported inference was kept (one per request)',support:a.stmts.size});continue;}
   inferred.push({concept:a.c.id,category:cat,kind:a.c.kind,state:'experimental_unverified',support:a.stmts.size,score:Number(a.score.toFixed(2)),from:[...a.from],anchors:a.anchors,path:a.path.slice(0,4),provenance:a.prov});}
 }
 // ---- C-lite (shadow): admitted experimental candidates, evaluated on the request's facts; never applied
 let candidateEffects:NeedInterpretation['candidateEffects'];
 if(kg&&cat&&o.candidates){
  const facts:Record<string,string[][]>={req_category:[['r',cat]],req_context:contexts.map(c=>['r',c.id]),req_word:[...stemsNI(text)].filter(s=>!setAside.has(s)).map(s=>['r',s])};
  const m=evaluate(o.candidates,facts,{shadow:true});
  const by=new Map<string,Set<string>>();for(const f of m.all('candidate_need'))for(const r of m.rulesOf(f))(by.get(f.args[1])??by.set(f.args[1],new Set()).get(f.args[1])!).add(r);
  candidateEffects=[...by].filter(([c])=>!advice.needs.includes(c)&&!inferred.some(i=>i.concept===c)&&![...setAside].some(x=>c.includes(x))).map(([concept,rules])=>({concept,rules:[...rules].sort()}));}
 // ---- evidence plan of every need (stored relations of the category)
 const evidencePlan:NeedInterpretation['evidencePlan']=[];
 if(cat){const all=[...expressed.map(e=>({c:e.concept,b:'expressed' as const})),...inferred.map(i=>({c:i.concept,b:'inferred' as const}))];
  for(const k of needKnowledge269(store,cat,all.map(x=>x.c)))evidencePlan.push({concept:k.need,basis:all.find(x=>x.c===k.need)!.b,measures:k.relevant,conditions:k.conditions,notSufficient:k.proxies});}
 // ---- trace: every clause, interpreted by something or listed as not interpreted
 const used:{by:string;stems:Set<string>}[]=[
  {by:'constraint',stems:stemsNI([...advice.constraints,...(advice.otherLimits??[])].map(c=>c.span).join(' '))},
  {by:'need',stems:stemsNI([...spans.values()].join(' ').replace(/[~+]/g,' '))},
  {by:'category',stems:catStems},{by:'feature',stems:stemsNI(features.map(f=>f.span).join(' '))},
  {by:'stance',stems:new Set(stances.map(s=>stemNI(s.term)))},
  {by:'quantity',stems:stemsNI((advice.quantityRequirements??[]).map(q=>q.span).join(' '))},
  {by:'use_context',stems:new Set(contexts.flatMap(c=>[...stemsNI(c.term)]))},
  {by:'inferred_need',stems:new Set(inferred.flatMap(i=>i.from))}];
 const trace:NeedInterpretation['trace']=[];const seen=new Set<string>();
 for(const t of tokens(text)){if(t.kind!=='word')continue;const cl=clauseAround(text,t.start,t.end,v);const key=cl.start+':'+cl.end;if(seen.has(key))continue;seen.add(key);
  const span=cl.text.trim();if(!span)continue;const cs=stemsNI(span);if(!cs.size)continue;
  const by=used.filter(u=>[...cs].some(x=>u.stems.has(x))).map(u=>u.by);trace.push({span,status:by.length?'interpreted':'uninterpreted',by});}
 const scenarios=[...new Set(advice.constraints.map(c=>(c as {scenario?:string}).scenario).filter((s):s is string=>!!s&&s!=='base'))];
 return {schema:'pee.r3p.need-interpretation.v1',version:NEED_INTERPRETATION_VERSION,knowledgeGuided:kg,category:cat,
  status:'experimental_unreviewed',statusNote:STATUS_NOTE,expressed,inferred,unsupported:unsupported.slice(0,6),features,stances,contexts,
  scenarios,questions:advice.questions,trace,evidencePlan,...(candidateEffects?{candidateEffects}:{})};
}
