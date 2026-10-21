#!/usr/bin/env node
/** G1b development on spent material only (evaluation/g1b/preregistration.json): the I3 R set (60, adjudicated reference,
 * blind strategy key from G1). Compares C1 and the goal-first methods M1-M3 over the situation projection built from the
 * taught packages and a store copy. Public counts evaluation/g1b/dev-LABEL.json; detail private. Never overwrites.
 * Usage: node scripts/g1b-dev.mjs LABEL --packages DIR --store STORE_COPY */
import {readFileSync,writeFileSync,existsSync,mkdirSync,readdirSync,statSync,copyFileSync} from 'node:fs';import {join,relative,resolve} from 'node:path';import {homedir} from 'node:os';
const [LABEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!LABEL||!arg('packages')||!arg('store'))throw Error('usage: LABEL --packages DIR --store COPY');
if(/\/\.local\/share\/product-evidence-engine\/knowledge\//.test(resolve(arg('store'))))throw Error('refusing the live store');
const OUT=new URL(`../evaluation/g1b/dev-${LABEL}.json`,import.meta.url).pathname;if(existsSync(OUT))throw Error(OUT+' exists');
const D='../dist/src/';const G=await import(D+'situation_knowledge_g1b.js');const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const {adviseFromRequest253}=await import(D+'phase253_request_advice.js');const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');
const {goalUnderstandingC}=await import(D+'goal_understanding_c.js');const QK=await import(D+'quantity_knowledge.js');
export const TAUGHT_DOCS={air_fryers:['air-fryers'],coffee_machines:['PEE-COFFEE-COMPLETE-CUMULATIVE-KNOWLEDGE-PACKAGE.md'],dehumidifiers:['PEE-DEHUMIDIFIERS-CONSOLIDATED-RESEARCH-2026-10-15.md','PEE-CATEGORY-RESEARCH-02-DEHUMIDIFIERS-ORIGINAL.md'],
 dishwashers:['PEE-CATEGORY-RESEARCH-06-HOUSEHOLD-DISHWASHERS','PEE-CATEGORY-RESEARCH-06-COUNTERTOP-DISHWASHERS'],air_purifiers:['PEE-CATEGORY-RESEARCH-04-AIR-PURIFIERS'],televisions:['PEE-CATEGORY-RESEARCH-07-TELEVISIONS']};
const walk=p=>statSync(p).isDirectory()?readdirSync(p).flatMap(n=>walk(join(p,n))):[p];
const docs=[];for(const [c,parts] of Object.entries(TAUGHT_DOCS))for(const part of parts){const b=join(arg('packages'),part);if(!existsSync(b))continue;
 for(const f of walk(b))if(f.endsWith('.md')||f.endsWith('CONSUMER-NEEDS-STRUCTURED.json'))docs.push({path:relative(arg('packages'),f),category:c,text:readFileSync(f,'utf8')});}
const copy=join(homedir(),'.cache-g1b',`dev-${LABEL}.sqlite`);mkdirSync(join(homedir(),'.cache-g1b'),{recursive:true});copyFileSync(arg('store'),copy);
const s=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();const P=G.buildProjectionG1b(s,docs,qk);const dist=G.buildDistModelG1b(docs);
const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval');
const REQ=JSON.parse(readFileSync(join(PE,'i3/r/requests.json'),'utf8')).requests;const REF=new Map(JSON.parse(readFileSync(join(PE,'i3/r/reference.json'),'utf8')).requests.map(r=>[r.id,r]));
const KEY=new Map(JSON.parse(readFileSync(join(PE,'g1/diag/strategy-key.json'),'utf8')).items.map(x=>[x.id,x]));
const TAUGHT=new Set(P.categories);const agg={};const bump=(a,g,k,n=1)=>{for(const x of [g,'all']){agg[a]??={};agg[a][x]??={};agg[a][x][k]=(agg[a][x][k]??0)+n;}};const detail=[];
for(const r of REQ){const ref=REF.get(r.id),key=KEY.get(r.id)??{relevant:[],wrong:[]};
 const ok=new Set([...ref.plausibleFamilies.map(f=>f.family),...(ref.acceptableFamilies??[])]);const okTaught=[...ok].filter(f=>TAUGHT.has(f));
 const g=ref.type==='named'?'named':'problem';const a=adviseFromRequest253(r.text,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});
 const c=goalUnderstandingC(r.text,a,s,{qk});
 const arms={C1:{fams:[...new Set([...(c.committed?[c.committed]:[]),...c.hypotheses.map(h=>h.family)])],strats:[],action:c.action}};
 for(const m of process.env.G1B_POSTHOC?['M2']:['M1','M2','M3']){const x=G.goalFirstG1b(r.text,a,s,P,{method:m,dist,qk,keepGeneralNeedTerms:!!process.env.G1B_POSTHOC});arms[m]={fams:x.strategies.filter(y=>y.kind==='purchase').map(y=>y.category),strats:x.strategies.filter(y=>y.kind!=='purchase').map(y=>y.id),action:x.action};}
 const row={id:r.id,group:g,arms:{}};
 for(const [arm,x] of Object.entries(arms)){bump(arm,g,'requests');
  const canFam=okTaught.length>0,canStrat=key.relevant.length>0;
  if(canFam){bump(arm,g,'with_taught_family');bump(arm,g,'family_reached',x.fams.some(f=>ok.has(f))?1:0);}
  if(canStrat){bump(arm,g,'with_relevant_strategy');bump(arm,g,'strategy_reached',x.strats.some(s=>key.relevant.includes(s))?1:0);}
  if(canFam||canStrat){bump(arm,g,'with_any');bump(arm,g,'any_reached',(x.fams.some(f=>ok.has(f))||x.strats.some(s=>key.relevant.includes(s)))?1:0);}
  bump(arm,g,'invented',x.fams.filter(f=>!ok.has(f)).length+x.strats.filter(s=>!key.relevant.includes(s)).length);
  if(!canFam&&!canStrat){bump(arm,g,'without_knowledge');bump(arm,g,'outside_or_abstain',x.action==='outside_knowledge'||x.action==='abstain'?1:0);}
  row.arms[arm]=x;}
 detail.push(row);}
mkdirSync(join(PE,'g1b','dev'),{recursive:true});writeFileSync(join(PE,'g1b','dev',`dev-${LABEL}-detail.json`),JSON.stringify(detail,null,1));
writeFileSync(OUT,JSON.stringify({schema:'pee.g1b.dev.v1',label:LABEL,material:'spent I3 R (development only)',projection:{rows:P.rows.length,strategies:P.strategies.length,generalNeeds:P.generalNeeds.length,linkedRows:P.rows.filter(r=>r.strategies.length).length,categories:P.categories},params:G.G1B_PARAMS,counts:agg},null,1)+'\n');
if(process.env.G1B_POSTHOC)process.stdout.write('POST HOC (not a reformulation): general-need words kept as evidence\n');
console.log(JSON.stringify({rows:P.rows.length,linked:P.rows.filter(r=>r.strategies.length).length}));for(const a of Object.keys(agg))console.log(a,JSON.stringify(agg[a].problem),'| named',JSON.stringify({r:agg[a].named?.family_reached,inv:agg[a].named?.invented}));
