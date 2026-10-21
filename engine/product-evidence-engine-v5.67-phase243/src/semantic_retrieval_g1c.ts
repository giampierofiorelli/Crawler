/** G1c (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
 * owner-g1c-authorisation-2026-10-21.md; preregistration evaluation/g1c/preregistration.json). SHADOW.
 *
 * Semantic retrieval of scientific knowledge units. Vectors only FIND candidate knowledge; the scientific relations
 * (situation -> category, situation -> strategy, conditions, contraindications, provenance) stay in the G1b projection
 * and the store. Similarity is a ranking signal, never a probability, and never sets a requirement, an exclusion, an
 * efficacy claim or a ranking: every output here is a shadow hypothesis with its supporting units.
 *
 * The index is a rebuildable projection: one vector record per knowledge unit (canonical id, kind, category, provenance,
 * review status, model id and revision, text SHA-256). Adding units is incremental and idempotent: a unit whose id and
 * text hash are already indexed is not embedded again and never duplicated. Nothing is written to the store; no remote
 * service or database is used.
 *
 * Methods (equal candidate count: at most G1C_PARAMS.maxCategories categories and maxStrategies strategies):
 *  A  typed scientific situations: lexical evidence pooled over each situation type (definition and member expressions);
 *  B  local sentence embeddings over situation and strategy units;
 *  C  hybrid: reciprocal-rank fusion of B, the G1b lexical row matching and A;
 *  D  C followed by verification (object roles, negation scope, general needs, strategy relation, contraindications,
 *     provenance).
 * Callers: scripts/g1c-dev.mjs, scripts/g1c-check.mjs, tests/g1c_semantic_retrieval.test.ts. No operational module imports
 * this file. No category, product or phrase is named here. */
import {createHash} from 'node:crypto';
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import type {Advice253} from './phase253_advice_contract.js';
import type {EmbedderG1c} from './semantic_embedding_g1c.js';
import {dotG1c} from './semantic_embedding_g1c.js';
import {matchRowsG1b,type ProjectionG1b,type SituationRowG1b,type ProvenanceG1b,type GeneralNeedG1b} from './situation_knowledge_g1b.js';
import {stemsNI} from './need_interpretation.js';
import {stanceAt,scopeVocabulary,tokens} from './language_scope.js';
import {FUNCTION_WORDS80} from './request_coverage80.js';
import type {QuantityKnowledge} from './quantity_knowledge.js';

export const G1C_VERSION='g1c.2';
export type MethodG1c='A'|'B'|'C'|'D';
/** Development parameters (spent I3 problem requests only; at most three reformulations, preregistered). */
export const G1C_PARAMS={
 maxCategories:2,maxStrategies:2,
 /** B: a situation unit supports a proposal at or above this cosine; categories kept within keepShare of the best */
 minRowSim:0.62,keepShare:0.5,topRows:3,
 /** B/D: a strategy unit is proposed (B) or a strategy relation is verified (D) at or above this cosine */
 minStrategySim:0.60,
 /** A: a situation type is matched at or above this idf-weighted cosine */
 minTypeScore:0.15,
 /** C: reciprocal-rank fusion constant and the depth read from each ranking */
 rrfK:60,depth:30,
 /** D: a request with fewer content words than this, once general-need words are set aside, is a generic need */
 minSpecificWords:2,
 /** g1c.1 (dev it1, reformulation 1; D only): it0 showed that absolute similarity does not separate relevant from
  * invented categories and the level-2 audit found most row->strategy links inappropriate. A D proposal now needs
  * corroboration: a situation row counts only when at least this many independent retrievers (B, lexical, A) found it,
  * and a strategy also ranks within strategyTopRank of the strategy units nearest to the verified request. */
 minCorroboration:2,strategyTopRank:3};

export type UnitKindG1c='situation'|'strategy'|'general_need'|'statement'|'situation_type';
export interface KnowledgeUnitG1c {id:string;kind:UnitKindG1c;category:string|null;text:string;
 provenance:ProvenanceG1b|{store:'category_items'|'knowledge_statements'|'quantity_knowledge'|'situation_types';ref:string};
 review:'documented_relevance'|'stored'|'machine_translated_unreviewed'|'claude_typed_unreviewed'}
export interface VectorRecordG1c {unitId:string;kind:UnitKindG1c;category:string|null;provenance:KnowledgeUnitG1c['provenance'];
 review:KnowledgeUnitG1c['review'];modelId:string;modelRevision:string;textSha256:string;vector:Float32Array}

const sha=(s:string)=>createHash('sha256').update(s).digest('hex');

/** Knowledge units from the G1b projection (situations, strategies, general needs) and, optionally, typed statements. */
export function knowledgeUnitsG1c(P:ProjectionG1b,o:{store?:KnowledgeStore246;statements?:boolean}={}):KnowledgeUnitG1c[]{
 const u:KnowledgeUnitG1c[]=[];
 for(const r of P.rows)u.push({id:r.id,kind:'situation',category:r.category,text:r.expression,provenance:r.provenance,review:'documented_relevance'});
 for(const s of P.strategies)u.push({id:s.id,kind:'strategy',category:null,text:[s.statement,...s.aliases].join('; '),provenance:{store:'category_items',ref:s.itemId},review:'stored'});
 for(const g of P.generalNeeds)u.push({id:'need:'+g.id,kind:'general_need',category:null,text:(g.terms.length?g.terms:[g.id.replace(/^[a-z_]+:/,'').replace(/_/g,' ')]).join('; '),provenance:{store:'quantity_knowledge',ref:g.id},review:'stored'});
 if(o.statements&&o.store)for(const s of o.store.db.prepare('SELECT statement_id i,category_id c,rendered t FROM knowledge_statements ORDER BY statement_id').all() as {i:string;c:string;t:string}[])
  u.push({id:'statement:'+s.i,kind:'statement',category:s.c,text:s.t,provenance:{store:'knowledge_statements',ref:s.i},review:'machine_translated_unreviewed'});
 return u;
}

/** Rebuildable vector index of knowledge units (in memory; a projection, never a store). */
export class SemanticIndexG1c {
 readonly records=new Map<string,VectorRecordG1c>();readonly units=new Map<string,KnowledgeUnitG1c>();
 constructor(readonly embedder:EmbedderG1c){}
 get size(){return this.records.size;}
 /** Index units incrementally: an id already indexed with the same text hash and model is skipped; a changed text is
  * re-embedded in place (same id, one record). Units without provenance are refused. */
 async add(units:readonly KnowledgeUnitG1c[]):Promise<{added:number;unchanged:number;replaced:number;refused:number}>{
  const todo:KnowledgeUnitG1c[]=[];let unchanged=0,replaced=0,refused=0;
  for(const x of units){if(!x.provenance||!x.text.trim()){refused++;continue;}
   const old=this.records.get(x.id);const h=sha(x.text);
   if(old&&old.textSha256===h&&old.modelId===this.embedder.modelId&&old.modelRevision===this.embedder.modelRevision){unchanged++;continue;}
   if(old)replaced++;todo.push(x);}
  const vecs=todo.length?await this.embedder.embed(todo.map(x=>x.text),'passage'):[];
  todo.forEach((x,i)=>{this.units.set(x.id,x);this.records.set(x.id,{unitId:x.id,kind:x.kind,category:x.category,provenance:x.provenance,review:x.review,
   modelId:this.embedder.modelId,modelRevision:this.embedder.modelRevision,textSha256:sha(x.text),vector:vecs[i]});});
  return {added:todo.length-replaced,unchanged,replaced,refused};
 }
 /** Nearest units by cosine (vectors are normalised). A similarity is a rank signal only. */
 search(q:Float32Array,o:{kinds?:readonly UnitKindG1c[];category?:string;k?:number}={}):{unit:KnowledgeUnitG1c;record:VectorRecordG1c;sim:number}[]{
  const out:{unit:KnowledgeUnitG1c;record:VectorRecordG1c;sim:number}[]=[];
  for(const r of this.records.values()){if(o.kinds&&!o.kinds.includes(r.kind))continue;if(o.category!==undefined&&r.category!==o.category)continue;
   out.push({unit:this.units.get(r.unitId)!,record:r,sim:dotG1c(q,r.vector)});}
  return out.sort((a,b)=>b.sim-a.sim||(a.unit.id<b.unit.id?-1:1)).slice(0,o.k??10);
 }
}

/** Situation types (method A): authored by an independent Claude agent from the projection rows; unreviewed. */
export interface SituationTypeG1c {id:string;label:string;definition:string;rows:string[]}

export interface ProposalG1c {id:string;kind:'purchase'|'no_purchase'|'purchase_constraint';category:string|null;
 epistemic:'documented_relevance'|'named_by_the_shopper';
 /** supporting knowledge units with the retriever that found them; similarity is a rank signal, not a probability */
 support:{unitId:string;via:string[];provenance:KnowledgeUnitG1c['provenance']}[];
 /** D: 'conditional' when every supporting situation carries a contraindication from its source */
 status:'hypothesis'|'conditional';conditions:string[];contraindications:string[]}
export interface GoalFirstG1c {schema:'pee.g1c.goal-first.v1';version:string;method:MethodG1c;status:'shadow';text:string;
 named:string|null;proposals:ProposalG1c[];
 /** top knowledge units retrieved (for the level-1 relevance judging), best first */
 retrieved:{unitId:string;kind:UnitKindG1c}[];
 verification:{setAsideCategories:string[];maskedSpans:string[];genericNeed:boolean;strategiesRejected:string[]}|null;
 action:'propose'|'ask'|'outside_knowledge'}

export interface ContextG1c {P:ProjectionG1b;index:SemanticIndexG1c;types?:readonly SituationTypeG1c[];qk?:QuantityKnowledge}

const NOT_CANDIDATE_ROLES=new Set(['owned','context','rejected']);

/** Masked request text for D: object mentions that are not requested and negated words are removed from the query. */
function verifyRequest(text:string,n0:ReturnType<typeof matchRowsG1b>['n0'],qk:QuantityKnowledge|undefined,gn:{g:GeneralNeedG1b}[]){
 const v=scopeVocabulary(qk);const drop:[number,number][]=n0.objects.filter(x=>NOT_CANDIDATE_ROLES.has(x.role)).map(x=>[x.start,x.end]);
 const masked:string[]=[];const kept:string[]=[];
 for(const t of tokens(text)){if(t.kind!=='word'){continue;}
  if(drop.some(([a,b])=>t.start>=a&&t.end<=b)){masked.push(t.w);continue;}
  if(stanceAt(text,t.start,t.end,v)){masked.push(t.w);continue;}
  kept.push(t.w);}
 const gnStems=new Set(gn.flatMap(x=>[...stemsNI(x.g.terms.join(' '))]));
 const specific=kept.filter(w=>!FUNCTION_WORDS80.has(w.toLowerCase())&&![...stemsNI(w)].every(s=>gnStems.has(s)));
 return {query:kept.join(' '),masked,specific,setAside:[...new Set(n0.objects.filter(x=>NOT_CANDIDATE_ROLES.has(x.role)).map(x=>x.category))]};
}

/** Exported for G1d (fused-ranking measurement); behaviour unchanged. */
export function typeScores(ctx:ContextG1c,req:readonly string[]):{type:SituationTypeG1c;score:number}[]{
 if(!ctx.types?.length||!req.length)return [];
 const bags=ctx.types.map(t=>{const st=new Map<string,number>();
  for(const s of stemsNI(t.label+' '+t.definition))st.set(s,1);
  for(const id of t.rows){const ss=ctx.P.rowStems.get(id);if(ss)for(const s of ss)st.set(s,1);}return {t,st};});
 const df=new Map<string,number>();for(const b of bags)for(const s of b.st.keys())df.set(s,(df.get(s)??0)+1);
 const N=bags.length;const idf=(s:string)=>Math.log((N+1)/((df.get(s)??0)+0.5));
 return bags.map(({t,st})=>{const shared=req.filter(s=>st.has(s));if(!shared.length)return {type:t,score:0};
  const nq=Math.sqrt(req.reduce((a,s)=>a+idf(s)**2,0)),nt=Math.sqrt([...st.keys()].reduce((a,s)=>a+idf(s)**2,0));
  return {type:t,score:shared.reduce((a,s)=>a+idf(s)**2,0)/((nq||1)*(nt||1))*Math.sqrt(st.size/Math.max(1,shared.length))};})
  .filter(x=>x.score>=G1C_PARAMS.minTypeScore).sort((a,b)=>b.score-a.score);
}

/** Goal-first reading of one request with method A, B, C or D. Shadow: never changes the advice. */
export async function goalFirstG1c(text:string,advice:Advice253,store:KnowledgeStore246,ctx:ContextG1c,method:MethodG1c):Promise<GoalFirstG1c>{
 const {P,index}=ctx;const lex=matchRowsG1b(text,advice,store,P,{method:'M2',qk:ctx.qk});const {n0,named,gn}=lex;
 const rowById=new Map(P.rows.map(r=>[r.id,r]));
 const ver=method==='D'?verifyRequest(text,n0,ctx.qk,gn):null;
 const qtext=ver?ver.query:text;
 const embedQ=async()=>qtext.trim()?(await index.embedder.embed([qtext],'query'))[0]:null;
 // rankings of situation rows per retriever
 const ranks=new Map<string,Map<string,number>>();const gated=new Map<string,Set<string>>();
 const setRank=(via:string,ids:string[],pass:(id:string)=>boolean)=>{ranks.set(via,new Map(ids.map((id,i)=>[id,i+1])));gated.set(via,new Set(ids.filter(pass)));};
 let q:Float32Array|null=null;
 if(method!=='A'){q=await embedQ();
  const hits=q?index.search(q,{kinds:['situation'],k:G1C_PARAMS.depth}):[];
  setRank('B',hits.map(h=>h.unit.id),id=>(hits.find(h=>h.unit.id===id)?.sim??0)>=G1C_PARAMS.minRowSim);}
 if(method==='A'||method==='C'||method==='D'){
  const ts=typeScores(ctx,lex.requestStems);const ids:string[]=[];
  for(const t of ts)for(const id of t.type.rows)if(rowById.has(id)&&!ids.includes(id))ids.push(id);
  setRank('A',ids.slice(0,G1C_PARAMS.depth*3),()=>true);}
 if(method==='C'||method==='D'){const ids=lex.matched.map(m=>m.row.id).slice(0,G1C_PARAMS.depth);setRank('lexical',ids,()=>true);}
 // fused row scores (single retriever: its own ordering)
 const fused=new Map<string,{score:number;via:string[]}>();
 for(const [via,r] of ranks)for(const [id,rank] of r){if(!gated.get(via)!.has(id))continue;
  const f=fused.get(id)??{score:0,via:[]};f.score+=1/(G1C_PARAMS.rrfK+rank);f.via.push(via);fused.set(id,f);}
 let rows=[...fused].map(([id,f])=>({row:rowById.get(id)!,...f})).filter(x=>x.row).sort((a,b)=>b.score-a.score||(a.row.id<b.row.id?-1:1));
 if(ver)rows=rows.filter(x=>!ver.setAside.includes(x.row.category)&&!!x.row.provenance&&x.via.length>=G1C_PARAMS.minCorroboration);
 const genericNeed=!!ver&&ver.specific.length<G1C_PARAMS.minSpecificWords;
 if(genericNeed)rows=[];
 // categories: top rows per category, kept within a share of the best
 const byCat=new Map<string,typeof rows>();for(const x of rows)(byCat.get(x.row.category)??byCat.set(x.row.category,[]).get(x.row.category)!).push(x);
 // g1c.2 (dev it2, reformulation 2: a defect found by the unit test): a category is scored by its best row, so that the
 // nearest situation decides; summing the reciprocal ranks of three rows let a category with several weak rows outrank one
 // with a single close match
 const cats=[...byCat].map(([c,xs])=>({c,xs:xs.slice(0,G1C_PARAMS.topRows),s:xs[0].score})).sort((a,b)=>b.s-a.s||(a.c<b.c?-1:1));
 const best=cats[0]?.s??0;
 const proposals:ProposalG1c[]=[];
 const supOf=(xs:typeof rows)=>xs.map(x=>({unitId:x.row.id,via:x.via,provenance:x.row.provenance}));
 if(named&&!(ver?.setAside.includes(named)))proposals.push({id:'family:'+named,kind:'purchase',category:named,epistemic:'named_by_the_shopper',support:[],status:'hypothesis',conditions:[],contraindications:[]});
 for(const k of cats.filter(x=>x.s>=best*G1C_PARAMS.keepShare)){if(proposals.filter(p=>p.kind==='purchase').length>=G1C_PARAMS.maxCategories)break;if(k.c===named)continue;
  const contra=[...new Set(k.xs.flatMap(x=>x.row.contraindications))].slice(0,3);
  proposals.push({id:'family:'+k.c,kind:'purchase',category:k.c,epistemic:'documented_relevance',support:supOf(k.xs),
   status:ver&&k.xs.every(x=>x.row.contraindications.length>0)?'conditional':'hypothesis',
   conditions:[...new Set(k.xs.flatMap(x=>x.row.guidance))].slice(0,3),contraindications:contra});}
 // strategies: B direct strategy units; lexical/A through the rows' documented links; D verifies each relation against the request
 const sScore=new Map<string,{score:number;via:Set<string>;rows:SituationRowG1b[]}>();
 const addS=(id:string,score:number,via:string,row?:SituationRowG1b)=>{const s=sScore.get(id)??{score:0,via:new Set(),rows:[]};s.score+=score;s.via.add(via);if(row)s.rows.push(row);sScore.set(id,s);};
 const sHits=q?index.search(q,{kinds:['strategy'],k:P.strategies.length}):[];
 if(method!=='A')sHits.forEach((h,i)=>{if(h.sim>=G1C_PARAMS.minStrategySim)addS(h.unit.id,1/(G1C_PARAMS.rrfK+i+1),'B');});
 if(method!=='B')for(const x of rows.slice(0,G1C_PARAMS.depth))for(const s of x.row.strategies)addS(s,x.score,'linked',x.row);
 const rejected:string[]=[];
 const strat=[...sScore].sort((a,b)=>b[1].score-a[1].score||(a[0]<b[0]?-1:1)).filter(([id])=>{
  if(!ver)return true;const rank=sHits.findIndex(h=>h.unit.id===id);
  if(rank>=0&&rank<G1C_PARAMS.strategyTopRank&&sScore.get(id)!.via.has('linked'))return true;rejected.push(id);return false;});
 for(const [id,s] of strat.slice(0,G1C_PARAMS.maxStrategies)){const st=P.strategies.find(x=>x.id===id);if(!st)continue;
  proposals.push({id,kind:st.kind,category:null,epistemic:'documented_relevance',
   support:[...(s.via.has('B')?[{unitId:id,via:['B'],provenance:index.units.get(id)?.provenance??{store:'category_items' as const,ref:st.itemId}}]:[]),
    ...s.rows.slice(0,G1C_PARAMS.topRows).map(r=>({unitId:r.id,via:['linked'],provenance:r.provenance}))],
   status:'hypothesis',conditions:[st.statement],contraindications:[...new Set(s.rows.flatMap(r=>r.contraindications))].slice(0,3)});}
 const retrieved=(q?index.search(q,{kinds:['situation','strategy','statement'],k:5}).map(h=>({unitId:h.unit.id,kind:h.unit.kind})):
  rows.slice(0,5).map(x=>({unitId:x.row.id,kind:'situation' as const})));
 const purchase=proposals.filter(p=>p.kind==='purchase'),noBuy=proposals.filter(p=>p.kind==='no_purchase');
 const action:GoalFirstG1c['action']=!proposals.length?(genericNeed?'ask':'outside_knowledge'):(named&&!noBuy.length)?'propose':(purchase.length+noBuy.length>1?'ask':'propose');
 return {schema:'pee.g1c.goal-first.v1',version:G1C_VERSION,method,status:'shadow',text,named,proposals,
  retrieved:method==='A'?rows.slice(0,5).map(x=>({unitId:x.row.id,kind:'situation' as const})):retrieved,
  verification:ver?{setAsideCategories:ver.setAside,maskedSpans:ver.masked,genericNeed,strategiesRejected:rejected}:null,action};
}

/** Category direction (SKILL.md §2b): knowledge units of one category nearest to a need phrase. */
export async function needsInCategoryG1c(index:SemanticIndexG1c,category:string,need:string,k=5){
 const q=(await index.embedder.embed([need],'query'))[0];
 return index.search(q,{category,k}).map(h=>({unitId:h.unit.id,kind:h.unit.kind,text:h.unit.text.slice(0,160)}));
}
