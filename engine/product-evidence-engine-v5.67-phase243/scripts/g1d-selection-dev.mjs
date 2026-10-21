#!/usr/bin/env node
/** G1d three-stage selection on spent material only (evaluation/g1d/preregistration.json selection): I3 R (60) and the
 * G1c safety probes (development only). Arms: C1, G1b (M2), G1c D (g1c.2, unchanged) and V (verified_retrieval_g1d with the
 * frozen relation method r1.3). Writes the retrieval pools (vector top-10, fused top-10, category-first top-5) privately for
 * blind judging. Public counts evaluation/g1d/selection-dev-LABEL.json. Never overwrites.
 * Usage: node scripts/g1d-selection-dev.mjs LABEL --packages DIR --store COPY */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
import {TAUGHT_DOCS_LOADER} from './g1c-lib.mjs';
const [LABEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!LABEL||!arg('packages')||!arg('store'))throw Error('usage: LABEL --packages DIR --store COPY');
if(/\/\.local\/share\/product-evidence-engine\/knowledge\//.test(resolve(arg('store'))))throw Error('refusing the live store');
const OUT=new URL(`../evaluation/g1d/selection-dev-${LABEL}.json`,import.meta.url).pathname;if(existsSync(OUT))throw Error(OUT+' exists');
const D='../dist/src/';const G=await import(D+'situation_knowledge_g1b.js');const S=await import(D+'semantic_retrieval_g1c.js');const E=await import(D+'semantic_embedding_g1c.js');
const RI=await import(D+'relation_integrity_g1d.js');const V=await import(D+'verified_retrieval_g1d.js');
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const {adviseFromRequest253}=await import(D+'phase253_request_advice.js');
const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');const {goalUnderstandingC}=await import(D+'goal_understanding_c.js');const QK=await import(D+'quantity_knowledge.js');
const docs=TAUGHT_DOCS_LOADER(arg('packages'));mkdirSync(join(homedir(),'.cache-g1d'),{recursive:true});const copy=join(homedir(),'.cache-g1d',`sel-${LABEL}.sqlite`);copyFileSync(arg('store'),copy);
const s=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();const P=G.buildProjectionG1b(s,docs,qk);
const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval');const PJ=f=>JSON.parse(readFileSync(join(PE,f),'utf8'));
const TY=PJ('g1c/situation-types.json');const members=new Map();for(const a of TY.assignments)for(const t of a.types)(members.get(t)??members.set(t,[]).get(t)).push(a.rowId);
const types=TY.types.map(t=>({id:t.id,label:t.label,definition:[t.definition,...(t.typicalExpressions??[])].join(' '),rows:members.get(t.id)??[]}));
const emb=await E.loadEmbedderG1c();const index=new S.SemanticIndexG1c(emb);await index.add(S.knowledgeUnitsG1c(P));
// frozen relation method on every row
const src=RI.sourceRowsG1d(P,docs);const corpus=[...src.values()].flatMap(r=>r.cells.filter(c=>c.role!=='teaching').map(c=>c.text));
const rels=await RI.deriveRelationsG1d(src,P.strategies,emb,{corpus});const relations=new Map();for(const r of rels)(relations.get(r.rowId)??relations.set(r.rowId,[]).get(r.rowId)).push(r);
const catTerms=c=>{const e=CATEGORY_REGISTRY250.find(x=>x.id===c);return [c.replace(/_/g,' '),...(e?.aliases??[])];};
const categories=new Map([...src.values()].map(r=>[r.rowId,RI.categoryApplicabilityG1d(r,catTerms(r.category))]));
const ctx={P,index,types,qk,relations,categories};const ctxC={P,index,types,qk};
const REQ=PJ('i3/r/requests.json').requests;const REF=new Map(PJ('i3/r/reference.json').requests.map(r=>[r.id,r]));const KEY=new Map(PJ('g1/diag/strategy-key.json').items.map(x=>[x.id,x]));
const TAUGHT=new Set(P.categories);const agg={};const bump=(a,g,k,n=1)=>{for(const x of [g,'all']){agg[a]??={};agg[a][x]??={};agg[a][x][k]=(agg[a][x][k]??0)+n;}};
const runArms=async(text)=>{const a=adviseFromRequest253(text,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});const c=goalUnderstandingC(text,a,s,{qk});
 const arms={C1:{fams:[...new Set([...(c.committed?[c.committed]:[]),...c.hypotheses.map(h=>h.family)])],strats:[],action:c.action}};
 const g=G.goalFirstG1b(text,a,s,P,{method:'M2',qk});arms.G1b={fams:g.strategies.filter(y=>y.kind==='purchase').map(y=>y.category),strats:g.strategies.filter(y=>y.kind!=='purchase').map(y=>y.id),action:g.action};
 const d=await S.goalFirstG1c(text,a,s,ctxC,'D');arms.G1cD={fams:d.proposals.filter(y=>y.kind==='purchase').map(y=>y.category),strats:d.proposals.filter(y=>y.kind!=='purchase').map(y=>y.id),action:d.action};
 const v=await V.verifiedSelectionG1d(text,a,s,ctx);arms.V={fams:v.proposals.filter(y=>y.kind==='purchase').map(y=>y.category),strats:v.proposals.filter(y=>y.kind!=='purchase').map(y=>y.id),action:v.action,
  conditional:v.proposals.filter(y=>y.status==='conditional_possibility').length,notSuitable:v.notSuitable.length,competing:v.competing.length,question:!!v.question};
 return {arms,v};};
const detail=[],pool=[];
for(const r of REQ){const ref=REF.get(r.id),key=KEY.get(r.id)??{relevant:[]};const ok=new Set([...ref.plausibleFamilies.map(f=>f.family),...(ref.acceptableFamilies??[])]);
 const okT=[...ok].filter(f=>TAUGHT.has(f));const g=ref.type==='named'?'named':'problem';const {arms,v}=await runArms(r.text);
 for(const [arm,x] of Object.entries(arms)){bump(arm,g,'requests');const canF=okT.length>0,canS=key.relevant.length>0;
  if(canF||canS){bump(arm,g,'with_any');bump(arm,g,'any_reached',(x.fams.some(f=>ok.has(f))||x.strats.some(y=>key.relevant.includes(y)))?1:0);}
  bump(arm,g,'invented',x.fams.filter(f=>!ok.has(f)).length+x.strats.filter(y=>!key.relevant.includes(y)).length);
  if(!canF&&!canS){bump(arm,g,'without_knowledge');bump(arm,g,'outside_or_abstain',['outside_knowledge','abstain','research'].includes(x.action)?1:0);}
  bump(arm,g,'action:'+x.action);}
 bump('V',g,'conditional_possibilities',arms.V.conditional);bump('V',g,'not_suitable',arms.V.notSuitable);bump('V',g,'competing_sets',arms.V.competing?1:0);bump('V',g,'questions',arms.V.question?1:0);
 detail.push({id:r.id,group:g,arms});
 pool.push({request:r.id,method:'vector',units:v.retrieval.vector.slice(0,10).map(x=>x.unitId)},{request:r.id,method:'fused',units:v.retrieval.fused.slice(0,10).map(x=>x.rowId)});
 const named=v.named;if(g==='named'&&named){const q=(await emb.embed([r.text],'query'))[0];pool.push({request:r.id,method:'category_first',category:named,units:index.search(q,{category:named,k:5}).map(h=>h.unit.id)});}}
const PR=PJ('g1c/safety-probes.json').probes;const probes={};
for(const p of PR){const {arms}=await runArms(p.text);for(const [arm,x] of Object.entries(arms)){const ids=[...x.fams.map(f=>'family:'+f),...x.strats];const bad=ids.some(i=>p.mustNotPropose.includes(i));
 probes[arm]??={probes:0,failed:0,byType:{}};probes[arm].probes++;if(bad){probes[arm].failed++;probes[arm].byType[p.type]=(probes[arm].byType[p.type]??0)+1;}}}
const relStats={relations:rels.length,rowsWithRelation:relations.size,byPolarity:rels.reduce((o,r)=>(o[r.polarity]=(o[r.polarity]??0)+1,o),{}),
 categoryApplicability:[...categories.values()].reduce((o,c)=>(o[c.value]=(o[c.value]??0)+1,o),{})};
mkdirSync(join(PE,'g1d','dev'),{recursive:true});writeFileSync(join(PE,'g1d','dev',`selection-${LABEL}-detail.json`),JSON.stringify(detail,null,1));
writeFileSync(join(PE,'g1d','dev',`selection-${LABEL}-pool.json`),JSON.stringify(pool,null,1));
writeFileSync(OUT,JSON.stringify({schema:'pee.g1d.selection-dev.v1',label:LABEL,material:'spent I3 R (development only); safety probes development-only',
 versions:{selection:V.G1D_SELECTION_VERSION,relations:RI.G1D_RELATION_VERSION},params:V.G1D_SELECTION_PARAMS,knowledge:relStats,counts:agg,probes},null,1)+'\n');
for(const a of Object.keys(agg))console.log(a.padEnd(5),JSON.stringify({reach:agg[a].problem.any_reached,of:agg[a].problem.with_any,inv:agg[a].problem.invented,outside:agg[a].problem.outside_or_abstain,of2:agg[a].problem.without_knowledge}),'probes',probes[a].failed);
console.log(JSON.stringify(relStats));console.log('V actions',JSON.stringify(Object.fromEntries(Object.entries(agg.V.all).filter(([k])=>/action|question|compet|suitable|conditional/.test(k)))));
