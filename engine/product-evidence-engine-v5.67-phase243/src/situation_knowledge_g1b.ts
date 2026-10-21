/** G1b (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
 * owner-g1b-authorisation-2026-10-21.md; preregistration evaluation/g1b/preregistration.json). SHADOW.
 *
 * Situation-linked scientific knowledge, consultable in both directions (SKILL.md §2b):
 *  - from the need: a described situation -> the documented situations it resembles -> the needs and strategies those
 *    situations are linked to (the category a source documents, and the no-purchase strategies its guidance names), with
 *    the source's conditions and contraindications;
 *  - from the category: a named category -> the general needs the request expresses (noise, space, running cost...) ->
 *    the category's own realisation of each need (its concept and the measurements the store links to it).
 *
 * The knowledge is a DERIVED projection, rebuilt from what PEE already holds for its taught categories: the owner-package
 * rows (situation and need cells, guidance cells; structured consumer cases with the inference to avoid) and the store's
 * concept items. Nothing is written; every row keeps its document SHA-256 and line (or case or item id). A link is
 * 'documented_relevance': the source says the situation and the strategy belong together; it is never read as causation.
 *
 * General needs (the quantity-knowledge aspects, use contexts and facets, which recur across categories) are recognised as
 * needs and never count as evidence that a category is relevant; their category realisations are kept separate.
 * Callers: scripts/g1b-dev.mjs, scripts/g1b-check.mjs, tests/g1b_situation_knowledge.test.ts. No operational module
 * imports this file. No category, product or phrase is named here. */
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import type {Advice253} from './phase253_advice_contract.js';
import {deriveClaimsN1} from './relation_claims_n1.js';
import {needModelN0} from './need_model_n0.js';
import {stemsNI} from './need_interpretation.js';
import {stanceAt,scopeVocabulary,tokens} from './language_scope.js';
import {FUNCTION_WORDS80} from './request_coverage80.js';
import {loadQuantityKnowledge,type QuantityKnowledge} from './quantity_knowledge.js';
import {createHash} from 'node:crypto';

export const G1B_VERSION='g1b.4';
export type MethodG1b='M1'|'M2'|'M3';
/** Development parameters (spent I3 problem requests only; at most three reformulations, preregistered). */
export const G1B_PARAMS={
 /** g1b.3 (dev it2): a row is matched when it explains enough of the request: cosine of idf/spread-weighted content
  * stems between the request and the row's expression (M2/M3); M1 keeps the summed overlap. g1b.4 (dev it3, last): cosine
  * 0.15 together with the it1 coherence gate; at most two categories and two strategies */ rowScore:2.0,minCosine2:0.15,
 /** categories kept while within this share of the best */ keepShare:0.5,
 /** at most this many categories and strategies proposed */ maxCategories:2,maxStrategies:2,
 /** rows summed per category */ topRows:3,
 /** g1b.2 (dev it1): a row is matched on at least this many distinct content stems, or on one stem documented in at most
  * singleTermMaxDf rows (a specific term); a term shared by several categories is weighted by 1/spread, never discarded */
 minShared:2,singleTermMaxDf:3,
 /** distributional neighbours: at most this many per request term, at least this cosine */ neighbours:3,minCosine:0.25,
 /** a guidance cell links a strategy when it shares terms of this summed specificity with the strategy */ linkScore:3.0};

export interface KnowledgeDocG1b {path:string;category:string;text:string}
export interface ProvenanceG1b {document:string;sha256:string;line:number|null;caseId?:string|null;itemId?:string|null}
export interface SituationRowG1b {id:string;category:string;kind:'package_row'|'structured_case'|'store_concept';
 expression:string;guidance:string[];strategies:string[];contraindications:string[];provenance:ProvenanceG1b;epistemic:'documented_relevance'}
export interface StrategyG1b {id:string;kind:'no_purchase'|'purchase_constraint';storedUnder:string;statement:string;itemId:string;aliases:string[]}
export interface GeneralNeedG1b {id:string;source:'qk_aspect'|'qk_use_context'|'qk_facet';terms:string[];kinds:string[]}
export interface ProjectionG1b {version:string;rows:SituationRowG1b[];strategies:StrategyG1b[];generalNeeds:GeneralNeedG1b[];
 /** per stem: rows whose expression holds it, and the categories those rows belong to */
 df:Map<string,number>;spread:Map<string,Set<string>>;rowStems:Map<string,Set<string>>;categories:string[]}

const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const isStrategyId=(id:string)=>/_(?:alternative|constraint)$/.test(id);
/** directive wording in a source's guidance that makes a purchase conditional rather than advised as such */
const CONTRA=/\b(?:do not|don't|never|not a substitute|reject|before (?:any )?appliance|instead of|investigate|inspection)\b/i;

function storeStrategies(store:KnowledgeStore246):StrategyG1b[]{
 const rows=store.db.prepare("SELECT category_id c,item_id i,concept_id id,aliases_json a,statement s FROM category_items WHERE concept_id IS NOT NULL").all() as {c:string;i:string;id:string;a:string|null;s:string}[];
 return rows.filter(r=>isStrategyId(r.id)).map(r=>({id:'strategy:'+r.id,kind:r.id.endsWith('_constraint')?'purchase_constraint' as const:'no_purchase' as const,storedUnder:r.c,
  statement:r.s,itemId:r.i,aliases:JSON.parse(r.a||'[]') as string[]}));
}

/** Build the projection from the taught categories' documents and the store (read only). */
export function buildProjectionG1b(store:KnowledgeStore246,docs:readonly KnowledgeDocG1b[],qk:QuantityKnowledge=loadQuantityKnowledge()):ProjectionG1b{
 const rows:SituationRowG1b[]=[];const seen=new Set<string>();
 const push=(r:Omit<SituationRowG1b,'id'|'strategies'|'epistemic'>)=>{const key=r.category+'|'+r.expression.toLowerCase().replace(/\s+/g,' ').trim()+'|'+r.guidance.join('|').toLowerCase();
  if(!r.expression.trim()||seen.has(key))return;seen.add(key);rows.push({...r,id:'row_'+sha(key).slice(0,16),strategies:[],epistemic:'documented_relevance'});};
 for(const d of docs){const h=sha(d.text);
  if(d.path.endsWith('.json')){let j:Record<string,unknown>;try{j=JSON.parse(d.text);}catch{continue;}
   const list=(j.cases??j.needs??j.scenarios??[]) as Record<string,unknown>[];
   for(const x of list){const utt=(x.consumer_utterance??x.synthetic_utterance??x.utterance) as string|undefined;if(!utt)continue;
    const need=[x.goal,x.requirement,x.technical_requirement_or_evidence].filter((v):v is string=>typeof v==='string');
    const guidance=[x.conditional_evidence_or_rejection,x.candidate_or_alternative].filter((v):v is string=>typeof v==='string');
    const contra=[x.forbidden_inference,x.incorrect_inference_to_avoid].filter((v):v is string=>typeof v==='string');
    push({category:d.category,kind:'structured_case',expression:[utt,...need].join(' | '),guidance:[...guidance,...contra],contraindications:contra,
     provenance:{document:d.path,sha256:h,line:null,caseId:typeof x.id==='string'?x.id:null}});}
   continue;}
  let claims;try{claims=deriveClaimsN1(d.text,{categoryId:d.category,document:d.path,sha256:h});}catch{continue;}
  for(const c of claims){const by=(r:string)=>c.participants.filter(p=>p.role===r).map(p=>p.text);
   const expr=[...by('situation'),...by('need')];if(!expr.length)continue;
   const caveats=[...by('caveat'),...by('condition')];
   push({category:d.category,kind:'package_row',expression:expr.join(' | '),guidance:[...by('alternative'),...caveats],
    contraindications:caveats.filter(t=>CONTRA.test(t)),provenance:{document:d.path,sha256:h,line:c.source.line}});}}
 // the store's goal- and situation-side concepts (the category's own wording); stored strategies are rows of their own
 const items=store.db.prepare("SELECT category_id c,item_id i,concept_id id,concept_kind k,aliases_json a,statement s FROM category_items WHERE concept_id IS NOT NULL AND concept_kind IN ('outcome','environment','failure','task')").all() as {c:string;i:string;id:string;k:string;a:string|null;s:string}[];
 for(const i of items){const al=JSON.parse(i.a||'[]') as string[];
  push({category:i.c,kind:'store_concept',expression:[i.id.replace(/_/g,' '),...al].join(' | '),guidance:isStrategyId(i.id)?[i.s]:[],contraindications:[],provenance:{document:'store:category_items',sha256:'',line:null,itemId:i.i}});}
 const strategies=storeStrategies(store);
 // links: a row is linked to a stored strategy when its guidance names terms specific to that strategy, or it is that
 // strategy's own concept row; a strategy's specific terms are those of its statement and aliases no other strategy has
 const sStems=new Map(strategies.map(s=>[s.id,stemsNI([s.id.slice(9).replace(/_/g,' '),...s.aliases,s.statement].join(' '))]));
 const sdf=new Map<string,number>();for(const st of sStems.values())for(const x of st)sdf.set(x,(sdf.get(x)??0)+1);
 const gdf=new Map<string,number>();const gStems=rows.map(r=>stemsNI(r.guidance.join(' ')));for(const g of gStems)for(const x of g)gdf.set(x,(gdf.get(x)??0)+1);
 const G=Math.max(1,rows.length);const gidf=(x:string)=>Math.log((G+1)/((gdf.get(x)??0)+0.5));
 rows.forEach((r,k)=>{for(const s of strategies){
  if(r.kind==='store_concept'&&r.provenance.itemId===s.itemId){r.strategies.push(s.id);continue;}
  const shared=[...gStems[k]].filter(x=>sStems.get(s.id)!.has(x)&&(sdf.get(x)??0)<=1);
  if(shared.reduce((a,x)=>a+gidf(x),0)>=G1B_PARAMS.linkScore)r.strategies.push(s.id);}});
 // general needs: quantity-knowledge aspects, use contexts and facets (cross-category by construction)
 const pack=(qk as unknown as {pack:{aspects?:{id:string;terms:string[];kinds?:string[]}[];useContexts?:{id:string;terms:string[]}[];facets?:{id:string;needTerms:string[]}[]}}).pack;
 const generalNeeds:GeneralNeedG1b[]=[...(pack.aspects??[]).map(a=>({id:'aspect:'+a.id,source:'qk_aspect' as const,terms:a.terms,kinds:a.kinds??[]})),
  ...(pack.useContexts??[]).map(a=>({id:'context:'+a.id,source:'qk_use_context' as const,terms:a.terms,kinds:[]})),
  ...(pack.facets??[]).map(a=>({id:'facet:'+a.id,source:'qk_facet' as const,terms:a.needTerms,kinds:[]}))];
 const df=new Map<string,number>(),spread=new Map<string,Set<string>>(),rowStems=new Map<string,Set<string>>();
 for(const r of rows){const st=stemsNI(r.expression);rowStems.set(r.id,st);for(const x of st){df.set(x,(df.get(x)??0)+1);(spread.get(x)??spread.set(x,new Set()).get(x)!).add(r.category);}}
 return {version:G1B_VERSION,rows,strategies,generalNeeds,df,spread,rowStems,categories:[...new Set(rows.map(r=>r.category))].sort()};
}

/** Category -> needs (the other direction of the same projection): the situations and strategies a category's documented
 * rows link to. Documented relevance only: no efficacy is implied. */
export function needsOfCategoryG1b(P:ProjectionG1b,category:string):{rows:number;strategies:string[];examples:string[]}{
 const rs=P.rows.filter(r=>r.category===category);
 return {rows:rs.length,strategies:[...new Set(rs.flatMap(r=>r.strategies))].sort(),examples:rs.slice(0,3).map(r=>r.expression.slice(0,120))};
}

/** Distributional model (M3): positive pointwise mutual information of stems co-occurring within a window, learned only from
 * the taught documents; cosine similarity relates a request term to situation terms it never shares literally. */
export interface DistModelG1b {vec:Map<string,Map<string,number>>;norm:Map<string,number>}
export function buildDistModelG1b(docs:readonly KnowledgeDocG1b[],window=5):DistModelG1b{
 const co=new Map<string,Map<string,number>>();const cnt=new Map<string,number>();let total=0;
 for(const d of docs){for(const sent of d.text.toLowerCase().split(/[.!?\n|]+/)){const w=[...stemsNI(sent)];
  for(let i=0;i<w.length;i++){cnt.set(w[i],(cnt.get(w[i])??0)+1);for(let j=Math.max(0,i-window);j<Math.min(w.length,i+window+1);j++){if(i===j)continue;
   const m=co.get(w[i])??co.set(w[i],new Map()).get(w[i])!;m.set(w[j],(m.get(w[j])??0)+1);total++;}}}}
 const vec=new Map<string,Map<string,number>>(),norm=new Map<string,number>();const N=Math.max(1,total);
 for(const [a,m] of co){const v=new Map<string,number>();let n=0;
  for(const [b,c] of m){const p=Math.log((c*N)/((cnt.get(a)??1)*(cnt.get(b)??1)));if(p>0){v.set(b,p);n+=p*p;}}
  if(v.size){vec.set(a,v);norm.set(a,Math.sqrt(n));}}
 return {vec,norm};
}
function cosine(m:DistModelG1b,a:string,b:string):number{const x=m.vec.get(a),y=m.vec.get(b);if(!x||!y)return 0;let s=0;
 const [small,big]=x.size<y.size?[x,y]:[y,x];for(const [k,v] of small){const w=big.get(k);if(w)s+=v*w;}return s/((m.norm.get(a)??1)*(m.norm.get(b)??1));}

export type CauseG1b='user_only'|'knowledge_gap'|'not_understood';
export interface StrategyProposalG1b {id:string;kind:'purchase'|'no_purchase'|'purchase_constraint';category:string|null;label:string;
 epistemic:'documented_relevance'|'named_by_the_shopper';support:{rowId:string;expression:string;provenance:ProvenanceG1b;shared:string[]}[];
 conditions:string[];contraindications:string[]}
export interface GoalFirstG1b {schema:'pee.g1b.goal-first.v1';version:string;method:MethodG1b;status:'shadow';text:string;
 /** expressed by the shopper; hypothesised by PEE (strategies, each 'documented_relevance' with its support); unknown */
 expressed:{named:string|null;objects:{span:string;family:string;role:string}[];limits:string[]};
 generalNeeds:{id:string;matched:string;realisations:{category:string;conceptId:string;measurements:string[]}[]}[];
 strategies:StrategyProposalG1b[];
 unknown:string[];
 action:'propose'|'ask'|'outside_knowledge';
 questions:{text:string;cause:CauseG1b}[];
 researchNeeds:{kind:'missing_need_knowledge';subject:string;status:'pending_authorization'}[]}

export interface RowMatchG1b {row:SituationRowG1b;score:number;shared:string[]}
/** The lexical row matching of goalFirstG1b, exposed unchanged for G1c (fusion with other retrievers). */
export function matchRowsG1b(text:string,advice:Advice253,store:KnowledgeStore246,P:ProjectionG1b,o:{method?:MethodG1b;dist?:DistModelG1b|null;qk?:QuantityKnowledge;
 /** post-hoc diagnosis switch (not a reformulation): keep the request's general-need words as situation evidence */ keepGeneralNeedTerms?:boolean}={}){
 const method=o.method??'M2';const qk=o.qk??loadQuantityKnowledge();const v=scopeVocabulary(qk);
 const n0=needModelN0(text,advice,store,{qk});
 const named=n0.objects.find(x=>x.role==='requested')?.category??null;
 // request evidence: content words outside object mentions, not negated or set aside (M2/M3); every word (M1)
 const objSpans=n0.objects.map(x=>[x.start,x.end] as [number,number]);
 const words:string[]=[];for(const t of tokens(text)){if(t.kind!=='word')continue;
  if(method!=='M1'){if(objSpans.some(([a,b])=>t.start>=a&&t.end<=b))continue;if(stanceAt(text,t.start,t.end,v))continue;if(FUNCTION_WORDS80.has(t.w.toLowerCase()))continue;}
  words.push(t.w);}
 let req=stemsNI(words.join(' '));
 // general needs: recognised as needs; their terms are not category evidence (M2/M3)
 const low=' '+text.toLowerCase().replace(/[^a-z0-9' ]+/g,' ')+' ';
 const gn=P.generalNeeds.map(g=>({g,hit:g.terms.find(t=>low.includes(' '+t.toLowerCase()+' '))})).filter(x=>x.hit);
 const gnStems=new Set(gn.flatMap(x=>[...stemsNI(x.g.terms.join(' '))]));
 if(method!=='M1'&&!o.keepGeneralNeedTerms)req=new Set([...req].filter(s=>!gnStems.has(s)));
 // M3: distributional neighbours of request terms that no situation holds literally
 const weightOf=new Map<string,number>([...req].map(s=>[s,1]));
 if(method==='M3'&&o.dist){for(const s of [...req]){if(P.df.has(s))continue;
  const cands=[...P.df.keys()].map(t=>[t,cosine(o.dist!,s,t)] as [string,number]).filter(([,c])=>c>=G1B_PARAMS.minCosine).sort((a,b)=>b[1]-a[1]).slice(0,G1B_PARAMS.neighbours);
  for(const [t,c] of cands)weightOf.set(t,Math.max(weightOf.get(t)??0,c));}}
 const N=Math.max(1,P.rows.length);const idf=(s:string)=>Math.log((N+1)/((P.df.get(s)??0)+0.5));
 const spec=(s:string)=>method==='M1'?1:1/(P.spread.get(s)?.size??1);
 const matched:RowMatchG1b[]=[];
 for(const r of P.rows){const st=P.rowStems.get(r.id)!;const shared=[...weightOf.keys()].filter(s=>st.has(s));if(!shared.length)continue;
  if(method!=='M1'&&shared.length<G1B_PARAMS.minShared&&!shared.some(s=>(P.df.get(s)??0)<=G1B_PARAMS.singleTermMaxDf))continue;
  const w=(s:string)=>idf(s)*spec(s);
  const score=shared.reduce((a,s)=>a+w(s)*(weightOf.get(s)??1),0);
  if(method==='M1'){if(score>=G1B_PARAMS.rowScore)matched.push({row:r,score,shared});continue;}
  const nq=Math.sqrt([...weightOf].reduce((a,[s,x])=>a+(w(s)*x)**2,0)),nr=Math.sqrt([...st].reduce((a,s)=>a+w(s)**2,0));
  const cos=shared.reduce((a,s)=>a+w(s)*w(s)*(weightOf.get(s)??1),0)/((nq||1)*(nr||1));
  if(cos>=G1B_PARAMS.minCosine2)matched.push({row:r,score:cos*10,shared});}
 matched.sort((a,b)=>b.score-a.score);
 return {method,qk,n0,named,gn,matched,requestStems:[...weightOf.keys()]};
}

/** Goal-first reading of one request over the projection. Never changes the advice; never a requirement, exclusion or ranking. */
export function goalFirstG1b(text:string,advice:Advice253,store:KnowledgeStore246,P:ProjectionG1b,o:{method?:MethodG1b;dist?:DistModelG1b|null;qk?:QuantityKnowledge;
 /** post-hoc diagnosis switch (not a reformulation): keep the request's general-need words as situation evidence */ keepGeneralNeedTerms?:boolean}={}):GoalFirstG1b{
 const {method,qk,n0,named,gn,matched}=matchRowsG1b(text,advice,store,P,o);
 // purchase strategies (categories) and no-purchase strategies, each with its supporting rows
 const byCat=new Map<string,typeof matched>();for(const m of matched)(byCat.get(m.row.category)??byCat.set(m.row.category,[]).get(m.row.category)!).push(m);
 const catScore=[...byCat].map(([c,ms])=>({c,ms:ms.slice(0,G1B_PARAMS.topRows),s:ms.slice(0,G1B_PARAMS.topRows).reduce((a,m)=>a+m.score,0)})).sort((a,b)=>b.s-a.s);
 const best=catScore[0]?.s??0;
 const keptCats=catScore.filter(x=>x.s>=best*G1B_PARAMS.keepShare).slice(0,G1B_PARAMS.maxCategories);
 const sup=(ms:typeof matched)=>ms.map(m=>({rowId:m.row.id,expression:m.row.expression.slice(0,160),provenance:m.row.provenance,shared:m.shared}));
 const strategies:StrategyProposalG1b[]=[];
 if(named)strategies.push({id:'family:'+named,kind:'purchase',category:named,label:named.replace(/_/g,' '),epistemic:'named_by_the_shopper',support:[],conditions:[],contraindications:[]});
 for(const k of keptCats){if(k.c===named)continue;
  strategies.push({id:'family:'+k.c,kind:'purchase',category:k.c,label:k.c.replace(/_/g,' '),epistemic:'documented_relevance',support:sup(k.ms),
   conditions:[...new Set(k.ms.flatMap(m=>m.row.guidance))].slice(0,3),contraindications:[...new Set(k.ms.flatMap(m=>m.row.contraindications))].slice(0,3)});}
 const sScore=new Map<string,typeof matched>();for(const m of matched)for(const s of m.row.strategies)(sScore.get(s)??sScore.set(s,[]).get(s)!).push(m);
 for(const [id,ms] of [...sScore].sort((a,b)=>b[1].reduce((x,m)=>x+m.score,0)-a[1].reduce((x,m)=>x+m.score,0)).slice(0,G1B_PARAMS.maxStrategies)){
  const s=P.strategies.find(x=>x.id===id)!;
  strategies.push({id,kind:s.kind,category:null,label:s.statement.split(/[;:.]/)[0],epistemic:'documented_relevance',support:sup(ms.slice(0,G1B_PARAMS.topRows)),
   conditions:[s.statement],contraindications:[...new Set(ms.flatMap(m=>m.row.contraindications))].slice(0,3)});}
 // category direction: the general needs expressed, realised in the named category (its own concepts and their measurements)
 const realise=(cat:string,g:GeneralNeedG1b)=>{const ts=stemsNI(g.terms.join(' '));
  return store.categoryItems246(cat).filter(i=>i.concept&&[...stemsNI([i.concept.id.replace(/_/g,' '),...i.concept.aliases].join(' '))].some(s=>ts.has(s))).slice(0,3)
   .map(i=>({category:cat,conceptId:i.concept!.id,measurements:(store.db.prepare("SELECT to_ref t FROM category_relations WHERE category_id=? AND kind='measured_by' AND from_ref=?").all(cat,'item:'+i.itemId) as {t:string}[]).map(x=>x.t)}));};
 const generalNeeds=gn.map(x=>({id:x.g.id,matched:x.hit!,realisations:named?realise(named,x.g):[]}));
 // what stays unknown: problem, goal or context clauses no documented situation supported
 const used=new Set(matched.flatMap(m=>m.shared));
 const unknown=n0.items.filter(i=>['problem','goal','outcome','context'].includes(i.content)&&![...stemsNI(i.span)].some(s=>used.has(s))).map(i=>i.span).slice(0,4);
 const purchase=strategies.filter(s=>s.kind==='purchase'),noBuy=strategies.filter(s=>s.kind==='no_purchase');
 let action:GoalFirstG1b['action'];const questions:GoalFirstG1b['questions']=[];const researchNeeds:GoalFirstG1b['researchNeeds']=[];
 if(!strategies.length){action='outside_knowledge';
  for(const u of unknown.length?unknown:[text.slice(0,120)])researchNeeds.push({kind:'missing_need_knowledge',subject:u,status:'pending_authorization'});}
 else if(named&&!noBuy.length){action='propose';}
 else{action=purchase.length+noBuy.length>1?'ask':'propose';
  if(action==='ask'){const cond=noBuy[0]?.conditions[0]??purchase.find(p=>p.contraindications.length)?.contraindications[0];
   questions.push({text:cond?`Before choosing: does this apply to you — "${cond.slice(0,140)}"?`:`Which of these is closest to your situation: ${strategies.slice(0,3).map(s=>s.label).join('; ')}?`,cause:'user_only'});}}
 return {schema:'pee.g1b.goal-first.v1',version:G1B_VERSION,method,status:'shadow',text,
  expressed:{named,objects:n0.objects.map(x=>({span:x.span,family:x.category,role:x.role})),limits:(advice.constraints??[]).map(c=>String(c.span??''))},
  generalNeeds,strategies,unknown,action,questions,researchNeeds};
}
