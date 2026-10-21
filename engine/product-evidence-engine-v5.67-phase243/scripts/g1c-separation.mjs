#!/usr/bin/env node
/** G1c post-hoc diagnosis on the spent I3 problem requests (not a reformulation, not used for selection): does the cosine
 * of the nearest situation of each category, and of each strategy unit, separate reference-plausible from invented
 * proposals? Run for each pinned model (preregistration model.selection). Public counts only; appends nothing, never
 * overwrites. Usage: node scripts/g1c-separation.mjs MODEL_ID --packages DIR --store COPY --fam t1,t2 --strat t1,t2 */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
import {TAUGHT_DOCS_LOADER} from './g1c-lib.mjs';
const [MODEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!MODEL||!arg('packages')||!arg('store'))throw Error('usage: MODEL --packages DIR --store COPY --fam .. --strat ..');
if(/\/\.local\/share\/product-evidence-engine\/knowledge\//.test(resolve(arg('store'))))throw Error('refusing the live store');
const OUT=new URL(`../evaluation/g1c/dev-posthoc-separation-${MODEL}.json`,import.meta.url).pathname;if(existsSync(OUT))throw Error(OUT+' exists');
const D='../dist/src/';const G=await import(D+'situation_knowledge_g1b.js');const S=await import(D+'semantic_retrieval_g1c.js');const E=await import(D+'semantic_embedding_g1c.js');
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const QK=await import(D+'quantity_knowledge.js');
mkdirSync(join(homedir(),'.cache-g1c'),{recursive:true});const copy=join(homedir(),'.cache-g1c',`sep-${MODEL}.sqlite`);copyFileSync(arg('store'),copy);
const s=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();const P=G.buildProjectionG1b(s,TAUGHT_DOCS_LOADER(arg('packages')),qk);
const emb=await E.loadEmbedderG1c(MODEL);const idx=new S.SemanticIndexG1c(emb);await idx.add(S.knowledgeUnitsG1c(P));
const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval');const PJ=f=>JSON.parse(readFileSync(join(PE,f),'utf8'));
const REQ=PJ('i3/r/requests.json').requests;const REF=new Map(PJ('i3/r/reference.json').requests.map(r=>[r.id,r]));const KEY=new Map(PJ('g1/diag/strategy-key.json').items.map(x=>[x.id,x]));
const rows=[];
for(const r of REQ){const ref=REF.get(r.id);if(ref.type==='named')continue;const ok=new Set([...ref.plausibleFamilies.map(f=>f.family),...(ref.acceptableFamilies??[])]);
 const q=(await emb.embed([r.text],'query'))[0];const hits=idx.search(q,{kinds:['situation'],k:50});const best=new Map();
 for(const h of hits){if(!best.has(h.unit.category))best.set(h.unit.category,h.sim);}
 for(const [c,s1] of best)rows.push({req:r.id,ok:ok.has(c),s1,gap:s1-hits[0].sim,kind:'category'});
 const key=KEY.get(r.id)??{relevant:[]};for(const h of idx.search(q,{kinds:['strategy'],k:9}))rows.push({req:r.id,ok:key.relevant.includes(h.unit.id),s1:h.sim,kind:'strategy'});}
const sweep=(kind,ts,extra=()=>true)=>ts.map(t=>{const p=rows.filter(x=>x.kind===kind&&x.s1>=t&&extra(x));return {threshold:t,plausible:p.filter(x=>x.ok).length,invented:p.filter(x=>!x.ok).length,requestsReached:new Set(p.filter(x=>x.ok).map(x=>x.req)).size};});
const num=k=>(arg(k)??'').split(',').filter(Boolean).map(Number);
writeFileSync(OUT,JSON.stringify({schema:'pee.g1c.separation.v1',model:{id:emb.modelId,revision:emb.modelRevision},status:'post hoc diagnosis on spent material; not a reformulation',
 material:'spent I3 R problem requests (39)',categories:sweep('category',num('fam'),x=>x.gap>=-0.02),strategies:sweep('strategy',num('strat'))},null,1)+'\n');
console.log(readFileSync(OUT,'utf8'));
