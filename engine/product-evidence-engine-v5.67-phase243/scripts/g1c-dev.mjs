#!/usr/bin/env node
/** G1c development on spent material only (evaluation/g1c/preregistration.json development): the I3 R set (60, adjudicated
 * reference, blind strategy key of G1). Compares C1, G1b (M2, g1b.4) and the G1c methods A-D at the equal candidate count,
 * and counts the development-only safety-probe failures per method (not used for selection). Writes the level-1 pool (top
 * five units per method per request) privately for blind relevance judging. Public counts evaluation/g1c/dev-LABEL.json;
 * detail private. Never overwrites. Usage: node scripts/g1c-dev.mjs LABEL --packages DIR --store COPY [--model ID] */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
import {TAUGHT_DOCS_LOADER} from './g1c-lib.mjs';
const [LABEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!LABEL||!arg('packages')||!arg('store'))throw Error('usage: LABEL --packages DIR --store COPY [--model ID]');
if(/\/\.local\/share\/product-evidence-engine\/knowledge\//.test(resolve(arg('store'))))throw Error('refusing the live store');
const OUT=new URL(`../evaluation/g1c/dev-${LABEL}.json`,import.meta.url).pathname;if(existsSync(OUT))throw Error(OUT+' exists');
const D='../dist/src/';const G=await import(D+'situation_knowledge_g1b.js');const S=await import(D+'semantic_retrieval_g1c.js');const E=await import(D+'semantic_embedding_g1c.js');
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const {adviseFromRequest253}=await import(D+'phase253_request_advice.js');
const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');const {goalUnderstandingC}=await import(D+'goal_understanding_c.js');const QK=await import(D+'quantity_knowledge.js');
const docs=TAUGHT_DOCS_LOADER(arg('packages'));
const copy=join(homedir(),'.cache-g1c',`dev-${LABEL}.sqlite`);mkdirSync(join(homedir(),'.cache-g1c'),{recursive:true});copyFileSync(arg('store'),copy);
const s=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();const P=G.buildProjectionG1b(s,docs,qk);
const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval');const PJ=f=>JSON.parse(readFileSync(join(PE,f),'utf8'));
const TY=PJ('g1c/situation-types.json');const members=new Map();for(const a of TY.assignments)for(const t of a.types)(members.get(t)??members.set(t,[]).get(t)).push(a.rowId);
const types=TY.types.map(t=>({id:t.id,label:t.label,definition:[t.definition,...(t.typicalExpressions??[])].join(' '),rows:members.get(t.id)??[]}));
const t0=Date.now();const emb=await E.loadEmbedderG1c(arg('model')??'bge-small-en-v1.5');const tLoad=Date.now()-t0;
const index=new S.SemanticIndexG1c(emb);const t1=Date.now();const units=S.knowledgeUnitsG1c(P,{store:s,statements:true});const add=await index.add(units);const tIndex=Date.now()-t1;
const ctx={P,index,types,qk};
const REQ=PJ('i3/r/requests.json').requests;const REF=new Map(PJ('i3/r/reference.json').requests.map(r=>[r.id,r]));
const KEY=new Map(PJ('g1/diag/strategy-key.json').items.map(x=>[x.id,x]));
const TAUGHT=new Set(P.categories);const agg={};const bump=(a,g,k,n=1)=>{for(const x of [g,'all']){agg[a]??={};agg[a][x]??={};agg[a][x][k]=(agg[a][x][k]??0)+n;}};
const detail=[],pool=[];const METHODS=['A','B','C','D'];const t2=Date.now();
const runArms=async(text)=>{const a=adviseFromRequest253(text,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});const c=goalUnderstandingC(text,a,s,{qk});
 const arms={C1:{fams:[...new Set([...(c.committed?[c.committed]:[]),...c.hypotheses.map(h=>h.family)])],strats:[],action:c.action}};
 const g=G.goalFirstG1b(text,a,s,P,{method:'M2',qk});arms.G1b={fams:g.strategies.filter(y=>y.kind==='purchase').map(y=>y.category),strats:g.strategies.filter(y=>y.kind!=='purchase').map(y=>y.id),action:g.action};
 const raw={};for(const m of METHODS){const x=await S.goalFirstG1c(text,a,s,ctx,m);raw[m]=x;
  arms[m]={fams:x.proposals.filter(y=>y.kind==='purchase').map(y=>y.category),strats:x.proposals.filter(y=>y.kind!=='purchase').map(y=>y.id),action:x.action,
   conditional:x.proposals.filter(y=>y.status==='conditional').map(y=>y.id),verification:x.verification};}
 return {arms,raw};};
for(const r of REQ){const ref=REF.get(r.id),key=KEY.get(r.id)??{relevant:[],wrong:[]};
 const ok=new Set([...ref.plausibleFamilies.map(f=>f.family),...(ref.acceptableFamilies??[])]);const okTaught=[...ok].filter(f=>TAUGHT.has(f));
 const g=ref.type==='named'?'named':'problem';const {arms,raw}=await runArms(r.text);const row={id:r.id,group:g,arms};
 for(const [arm,x] of Object.entries(arms)){bump(arm,g,'requests');
  const canFam=okTaught.length>0,canStrat=key.relevant.length>0;
  if(canFam){bump(arm,g,'with_taught_family');bump(arm,g,'family_reached',x.fams.some(f=>ok.has(f))?1:0);}
  if(canStrat){bump(arm,g,'with_relevant_strategy');bump(arm,g,'strategy_reached',x.strats.some(y=>key.relevant.includes(y))?1:0);}
  if(canFam||canStrat){bump(arm,g,'with_any');bump(arm,g,'any_reached',(x.fams.some(f=>ok.has(f))||x.strats.some(y=>key.relevant.includes(y)))?1:0);}
  bump(arm,g,'invented',x.fams.filter(f=>!ok.has(f)).length+x.strats.filter(y=>!key.relevant.includes(y)).length);
  if(!canFam&&!canStrat){bump(arm,g,'without_knowledge');bump(arm,g,'outside_or_abstain',x.action==='outside_knowledge'||x.action==='abstain'?1:0);}}
 detail.push(row);for(const m of METHODS)pool.push({request:r.id,method:m,units:raw[m].retrieved.map(u=>u.unitId)});}
const tRun=Date.now()-t2;
// safety probes (development only; not used for selection)
const PR=PJ('g1c/safety-probes.json').probes;const probes={};const pdet=[];
for(const p of PR){const {arms}=await runArms(p.text);const prow={id:p.id,type:p.type,arms:{}};
 for(const [arm,x] of Object.entries(arms)){const ids=[...x.fams.map(f=>'family:'+f),...x.strats];const bad=ids.filter(i=>p.mustNotPropose.includes(i));
  probes[arm]??={probes:0,failed:0,byType:{}};probes[arm].probes++;if(bad.length){probes[arm].failed++;probes[arm].byType[p.type]=(probes[arm].byType[p.type]??0)+1;}
  probes[arm].acceptableReached=(probes[arm].acceptableReached??0)+(ids.some(i=>p.acceptable.includes(i))?1:0);prow.arms[arm]={ids,bad};}
 pdet.push(prow);}
mkdirSync(join(PE,'g1c','dev'),{recursive:true});writeFileSync(join(PE,'g1c','dev',`dev-${LABEL}-detail.json`),JSON.stringify({requests:detail,probes:pdet},null,1));
writeFileSync(join(PE,'g1c','dev',`dev-${LABEL}-l1-pool.json`),JSON.stringify(pool,null,1));
writeFileSync(OUT,JSON.stringify({schema:'pee.g1c.dev.v1',label:LABEL,material:'spent I3 R (development only); safety probes development-only, not used for selection',
 model:{id:emb.modelId,revision:emb.modelRevision},index:{units:index.size,byKind:units.reduce((o,u)=>(o[u.kind]=(o[u.kind]??0)+1,o),{}),add},
 costs:{loadMs:tLoad,indexMs:tIndex,requestsMs:tRun,perRequestMs:Math.round(tRun/REQ.length),rssMB:Math.round(process.memoryUsage().rss/1048576)},
 projection:{rows:P.rows.length,linkedRows:P.rows.filter(r=>r.strategies.length).length,types:types.length},params:S.G1C_PARAMS,counts:agg,probes},null,1)+'\n');
for(const a of Object.keys(agg))console.log(a.padEnd(4),'problem',JSON.stringify({reach:agg[a].problem.any_reached,of:agg[a].problem.with_any,inv:agg[a].problem.invented,inv_all:agg[a].all.invented,outside:agg[a].problem.outside_or_abstain}),'probes failed',probes[a].failed,'acc',probes[a].acceptableReached);
console.log(JSON.stringify({index:index.size,add,tLoad,tIndex,tRun}));
