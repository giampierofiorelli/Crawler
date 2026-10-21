#!/usr/bin/env node
/** G1d relation method development on the TRACE rows only (spent: the 120 G1c-audit rows, source-traced by two blind
 * judges; evaluation/g1d/preregistration.json). Compares R0 (G1b links) and R1 (assertion-grounded) against the judges'
 * consensus; category applicability against the development labels. Never touches the sealed reference R.
 * Usage: node scripts/g1d-relations-dev.mjs LABEL --packages DIR --store COPY [--sims 0.45,0.5,...] */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
import {TAUGHT_DOCS_LOADER} from './g1c-lib.mjs';
const [LABEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!LABEL||!arg('packages')||!arg('store'))throw Error('usage: LABEL --packages DIR --store COPY');
if(/\/\.local\/share\/product-evidence-engine\/knowledge\//.test(resolve(arg('store'))))throw Error('refusing the live store');
const OUT=new URL(`../evaluation/g1d/relations-dev-${LABEL}.json`,import.meta.url).pathname;if(existsSync(OUT))throw Error(OUT+' exists');
const D='../dist/src/';const G=await import(D+'situation_knowledge_g1b.js');const RI=await import(D+'relation_integrity_g1d.js');const E=await import(D+'semantic_embedding_g1c.js');
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const QK=await import(D+'quantity_knowledge.js');const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');
const docs=TAUGHT_DOCS_LOADER(arg('packages'));mkdirSync(join(homedir(),'.cache-g1d'),{recursive:true});const copy=join(homedir(),'.cache-g1d',`rel-${LABEL}.sqlite`);copyFileSync(arg('store'),copy);
const s=new KnowledgeStore246(copy);const P=G.buildProjectionG1b(s,docs,QK.loadQuantityKnowledge());
const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval/g1d/trace');const J=f=>JSON.parse(readFileSync(join(PE,f),'utf8'));
const K=J('key.json').items,A=[1,2].map(i=>new Map(J(`judge-${i}.json`).items.map(x=>[x.item,x])));const CD=new Map(J('category-dev.json').items.map(x=>[x.item,x]));
const rel=(j,it,st)=>(j.get(it).pairs??[]).find(p=>p.strategy===st)?.relation??'not_addressed';const pos=r=>r==='supported'||r==='conditional';
const all=RI.sourceRowsG1d(P,docs);const rows=new Map(K.map(k=>[k.rowId,all.get(k.rowId)]));
const corpus=[...all.values()].flatMap(r=>r.cells.filter(c=>c.role!=='teaching').map(c=>c.text));const emb=await E.loadEmbedderG1c();const SIDS=P.strategies.map(x=>x.id);
const score=(links)=>{let tp=0,fp=0,fn=0,amb=0;const fpL=[],fnL=[];
 for(const k of K)for(const st of SIDS){const a=rel(A[0],k.item,st),b=rel(A[1],k.item,st);const gold=pos(a)&&pos(b)?1:(!pos(a)&&!pos(b))?0:null;const p=links.has(k.rowId+'|'+st);
  if(gold===null){if(p)amb++;continue;}if(p&&gold)tp++;else if(p){fp++;fpL.push(k.item+' '+st);}else if(gold){fn++;fnL.push(k.item+' '+st);}}
 return {proposed:tp+fp+amb,tp,fp,fn,ambiguousProposed:amb,precision:+(tp/Math.max(1,tp+fp)).toFixed(3),recall:+(tp/Math.max(1,tp+fn)).toFixed(3),fp:fpL,fn:fnL};};
if(arg('share'))RI.G1D_RELATION_PARAMS.maxTermCellShare=Number(arg('share'));
const R0=new Set(K.flatMap(k=>k.g1bLinks.map(x=>k.rowId+'|'+x)));const res={R0:score(R0)};
for(const t of (arg('sims')??'0.45,0.5,0.55,0.6,0.65').split(',').map(Number)){const R=await RI.deriveRelationsG1d(rows,P.strategies,emb,{minActionSim:t,corpus});
 res['R1@'+t]=score(new Set(R.map(r=>r.rowId+'|'+r.strategy)));}
// category applicability vs development labels
const catTerms=c=>{const e=CATEGORY_REGISTRY250.find(x=>x.id===c);return [c.replace(/_/g,' '),...(e?.aliases??[])];};
const cm={};let cOk=0;for(const k of K){const pr=RI.categoryApplicabilityG1d(rows.get(k.rowId),catTerms(rows.get(k.rowId).category)).value,g=CD.get(k.item).category;cm[`${g}->${pr}`]=(cm[`${g}->${pr}`]??0)+1;if(pr===g)cOk++;}
const complete=[...rows.values()].filter(r=>r.complete).length;
writeFileSync(OUT,JSON.stringify({schema:'pee.g1d.relations-dev.v1',label:LABEL,material:'trace rows (spent, development only)',version:RI.G1D_RELATION_VERSION,rowsRereadComplete:complete,
 relations:Object.fromEntries(Object.entries(res).map(([k,v])=>[k,{proposed:v.proposed,tp:v.tp,fp:v.fp,fn:v.fn,ambiguousProposed:v.ambiguousProposed,precision:v.precision,recall:v.recall}])),
 category:{agreement:cOk,of:K.length,confusion:cm}},null,1)+'\n');
mkdirSync(join(PE,'..','dev'),{recursive:true});writeFileSync(join(PE,'..','dev',`relations-${LABEL}.json`),JSON.stringify(res,null,1));
for(const [k,v] of Object.entries(res))console.log(k.padEnd(9),JSON.stringify({p:v.proposed,tp:v.tp,fp:v.fp,fn:v.fn,amb:v.ambiguousProposed,prec:v.precision,rec:v.recall}));
console.log(JSON.stringify(RI.strategyActionsG1d(P.strategies,corpus).map(x=>[x.id.slice(9),x.actionTerms])));console.log('category',cOk,'/',K.length,JSON.stringify(cm),'complete rows',complete);
