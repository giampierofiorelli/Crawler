/** G1d (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
 * owner-g1d-authorisation-2026-10-21.md; preregistration evaluation/g1d/preregistration.json). SHADOW.
 *
 * Verified semantic retrieval in three separate stages:
 *  1. RETRIEVAL of candidate knowledge units: the vector ranking (G1c index), the G1b lexical ranking and the typed-situation
 *     ranking, and their actual reciprocal-rank fusion, each exposed separately (G1c measured only the vector neighbours);
 *  2. VERIFICATION of each retrieved situation: is it a consumer situation, what does its source say about its category
 *     (applicability with condition kind), which strategies does its source assert (relation_integrity_g1d), and is the
 *     match close enough to count at all; similarity and retriever agreement never establish a relation;
 *  3. SELECTION: categories only from verified situations; candidates of different categories that are equally close are
 *     competing documented situations and neither is proposed on similarity; the owner rule on contraindications (essential
 *     incompatibility -> not presented as suitable; modifiable or unverified condition -> conditional possibility, never
 *     suitable; nonessential disadvantage -> assessed); a question only when two viable verified alternatives differ by
 *     something only the user knows (their situation); missing knowledge or unverifiable relations -> a typed research
 *     need or abstention, never a question.
 * Callers: scripts/g1d-selection-dev.mjs, tests/g1d_relation_integrity.test.ts. No operational module imports this file. */
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import type {Advice253} from './phase253_advice_contract.js';
import {matchRowsG1b,type ProjectionG1b,type SituationRowG1b} from './situation_knowledge_g1b.js';
import {typeScores,type SemanticIndexG1c,type SituationTypeG1c,type UnitKindG1c} from './semantic_retrieval_g1c.js';
import type {RelationG1d,CategoryRelationG1d} from './relation_integrity_g1d.js';
import type {QuantityKnowledge} from './quantity_knowledge.js';

export const G1D_SELECTION_VERSION='g1d.v0';
export const G1D_SELECTION_PARAMS={
 /** stage 1: depth of each ranking and the fusion constant (as G1c) */ depth:30,rrfK:60,
 /** stage 2: a vector match counts only at or above this cosine (the G1c post-hoc separation on spent data: 13 plausible /
  * 28 invented categories at 0.65); a lexical or typed match counts when its retriever matched at all */ minRowSim:0.65,
 /** stage 3: categories whose best verified situation is within this cosine of another category's are competing */ competeMargin:0.02,
 maxCategories:2,maxStrategies:2};

export interface RetrievalG1d {vector:{unitId:string;kind:UnitKindG1c;sim:number}[];lexical:string[];typed:string[];fused:{rowId:string;score:number;via:string[]}[]}
export interface VerifiedSituationG1d {rowId:string;category:string;sim:number|null;via:string[];consumerSituation:boolean;
 applicability:CategoryRelationG1d['value'];conditionKind:CategoryRelationG1d['conditionKind'];condition:string|null;strategies:{id:string;polarity:RelationG1d['polarity'];quote:string}[];
 counts:boolean;why:string}
export interface SelectionG1d {schema:'pee.g1d.verified-retrieval.v1';version:string;status:'shadow';text:string;named:string|null;
 retrieval:RetrievalG1d;verified:VerifiedSituationG1d[];
 proposals:{id:string;kind:'purchase'|'no_purchase'|'purchase_constraint';category:string|null;status:'hypothesis'|'conditional_possibility';
  support:string[];condition:string|null;quote:string|null}[];
 notSuitable:{category:string;reason:string;support:string}[];
 competing:{category:string;rowId:string}[];
 action:'propose'|'ask'|'research'|'abstain';
 question:{text:string;basis:'user_situation'}|null;
 researchNeeds:{kind:'missing_need_knowledge'|'unverified_relation';subject:string;status:'pending_authorization'}[]}

export interface ContextG1d {P:ProjectionG1b;index:SemanticIndexG1c;types?:readonly SituationTypeG1c[];qk?:QuantityKnowledge;
 relations:ReadonlyMap<string,RelationG1d[]>;categories:ReadonlyMap<string,CategoryRelationG1d>}

/** Stage 1: every ranking and the actual fusion, exposed. */
export async function retrieveG1d(text:string,advice:Advice253,store:KnowledgeStore246,ctx:ContextG1d){
 const lex=matchRowsG1b(text,advice,store,ctx.P,{method:'M2',qk:ctx.qk});
 const q=(await ctx.index.embedder.embed([text],'query'))[0];
 const vec=ctx.index.search(q,{kinds:['situation'],k:G1D_SELECTION_PARAMS.depth}).map(h=>({unitId:h.unit.id,kind:h.unit.kind,sim:+h.sim.toFixed(4)}));
 const lexical=lex.matched.slice(0,G1D_SELECTION_PARAMS.depth).map(m=>m.row.id);
 const typed:string[]=[];if(ctx.types?.length)for(const t of typeScores({P:ctx.P,index:ctx.index,types:ctx.types},lex.requestStems))for(const id of t.type.rows)if(!typed.includes(id))typed.push(id);
 const fused=new Map<string,{score:number;via:string[]}>();
 const add=(via:string,ids:readonly string[])=>ids.slice(0,G1D_SELECTION_PARAMS.depth).forEach((id,i)=>{const f=fused.get(id)??{score:0,via:[]};f.score+=1/(G1D_SELECTION_PARAMS.rrfK+i+1);f.via.push(via);fused.set(id,f);});
 add('vector',vec.map(v=>v.unitId));add('lexical',lexical);add('typed',typed);
 const retrieval:RetrievalG1d={vector:vec,lexical,typed:typed.slice(0,G1D_SELECTION_PARAMS.depth),
  fused:[...fused].map(([rowId,f])=>({rowId,...f})).sort((a,b)=>b.score-a.score||(a.rowId<b.rowId?-1:1))};
 return {retrieval,lex,q};
}

/** Stages 2 and 3. */
export async function verifiedSelectionG1d(text:string,advice:Advice253,store:KnowledgeStore246,ctx:ContextG1d):Promise<SelectionG1d>{
 const {retrieval,lex}=await retrieveG1d(text,advice,store,ctx);const rowById=new Map(ctx.P.rows.map(r=>[r.id,r]));
 const named=lex.n0.objects.find(o=>o.role==='requested')?.category??null;
 const setAside=new Set(lex.n0.objects.filter(o=>['owned','context','rejected'].includes(o.role)).map(o=>o.category));
 const simOf=new Map(retrieval.vector.map(v=>[v.unitId,v.sim]));
 // stage 2: verify each retrieved situation
 const verified:VerifiedSituationG1d[]=[];
 for(const f of retrieval.fused.slice(0,G1D_SELECTION_PARAMS.depth)){const r=rowById.get(f.rowId) as SituationRowG1b|undefined;if(!r)continue;
  const cat=ctx.categories.get(r.id);const sim=simOf.get(r.id)??null;
  const strategies=(ctx.relations.get(r.id)??[]).map(x=>({id:x.strategy,polarity:x.polarity,quote:x.quote}));
  const consumer=!!cat&&cat.value!=='not_a_purchase_situation';
  const close=(sim!==null&&sim>=G1D_SELECTION_PARAMS.minRowSim)||f.via.includes('lexical');
  const counts=consumer&&close&&!setAside.has(r.category);
  verified.push({rowId:r.id,category:r.category,sim,via:f.via,consumerSituation:consumer,applicability:cat?.value??'not_a_purchase_situation',
   conditionKind:cat?.conditionKind??null,condition:cat?.condition??null,strategies,counts,
   why:!consumer?'not a consumer situation in its source':!close?'match too weak to count':setAside.has(r.category)?'category owned, context or rejected':'verified'});}
 const ok=verified.filter(v=>v.counts);
 // stage 3: categories from verified situations, best match per category
 const best=new Map<string,VerifiedSituationG1d>();for(const v of ok){const b=best.get(v.category);if(!b||(v.sim??0)>(b.sim??0))best.set(v.category,v);}
 const ranked=[...best.values()].sort((a,b)=>(b.sim??0)-(a.sim??0));
 const proposals:SelectionG1d['proposals']=[];const notSuitable:SelectionG1d['notSuitable']=[];const competing:SelectionG1d['competing']=[];
 if(named&&!setAside.has(named))proposals.push({id:'family:'+named,kind:'purchase',category:named,status:'hypothesis',support:[],condition:null,quote:null});
 const top=ranked[0];const rivals=top?ranked.filter(v=>v!==top&&v.category!==named&&(top.sim??0)-(v.sim??0)<=G1D_SELECTION_PARAMS.competeMargin):[];
 if(top&&top.category!==named&&rivals.length){for(const v of [top,...rivals])competing.push({category:v.category,rowId:v.rowId});}
 else for(const v of ranked.slice(0,G1D_SELECTION_PARAMS.maxCategories)){if(v.category===named)continue;
  if(proposals.filter(p=>p.kind==='purchase').length>=G1D_SELECTION_PARAMS.maxCategories)break;
  if(v.applicability==='unsuitable'&&v.conditionKind==='essential'){notSuitable.push({category:v.category,reason:v.condition??'documented incompatibility with an essential requirement',support:v.rowId});continue;}
  proposals.push({id:'family:'+v.category,kind:'purchase',category:v.category,status:v.applicability==='conditional'||v.applicability==='unsuitable'?'conditional_possibility':'hypothesis',
   support:[v.rowId],condition:v.condition,quote:v.condition});}
 // strategies: only relations asserted by the sources of verified situations
 const sCount=new Map<string,{n:number;rows:string[];polarity:RelationG1d['polarity'];quote:string}>();
 for(const v of ok)for(const s of v.strategies){if(s.polarity==='contraindicated')continue;const e=sCount.get(s.id)??{n:0,rows:[],polarity:s.polarity,quote:s.quote};e.n++;e.rows.push(v.rowId);sCount.set(s.id,e);}
 for(const [id,e] of [...sCount].sort((a,b)=>b[1].n-a[1].n||(a[0]<b[0]?-1:1)).slice(0,G1D_SELECTION_PARAMS.maxStrategies)){const st=ctx.P.strategies.find(x=>x.id===id);if(!st)continue;
  proposals.push({id,kind:st.kind,category:null,status:e.polarity==='conditional'?'conditional_possibility':'hypothesis',support:e.rows,condition:e.polarity==='conditional'?e.quote:null,quote:e.quote});}
 // action: a question only when verified alternatives compete and the distinguishing fact is the user's own situation
 let action:SelectionG1d['action'];let question:SelectionG1d['question']=null;const researchNeeds:SelectionG1d['researchNeeds']=[];
 if(proposals.length){action='propose';}
 else if(competing.length>=2){action='ask';const ex=competing.slice(0,2).map(c=>rowById.get(c.rowId)!.expression.split(' | ')[0].replace(/[“”"]/g,'').slice(0,90));
  question={text:`Which is closer to your situation: "${ex[0]}" or "${ex[1]}"?`,basis:'user_situation'};}
 else if(verified.some(v=>v.consumerSituation&&!v.counts&&v.why==='match too weak to count')||!verified.length){action='research';
  researchNeeds.push({kind:'missing_need_knowledge',subject:text.slice(0,140),status:'pending_authorization'});}
 else{action='abstain';}
 return {schema:'pee.g1d.verified-retrieval.v1',version:G1D_SELECTION_VERSION,status:'shadow',text,named,retrieval,verified,proposals,notSuitable,competing,action,question,researchNeeds};
}
