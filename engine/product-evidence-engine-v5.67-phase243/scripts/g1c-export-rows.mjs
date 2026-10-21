#!/usr/bin/env node
/** G1c: export the G1b situation projection (rows, strategies) built from the taught packages and a store copy, for typing,
 * the blind audit and indexing. Private output (package cell text): $PEE_PRIVATE_EVAL_DIR/g1c/rows.json; public counts and
 * the row-id hash: evaluation/g1c/rows-manifest.json. Usage: node scripts/g1c-export-rows.mjs --packages DIR --store COPY */
import {readFileSync,writeFileSync,existsSync,readdirSync,statSync,mkdirSync} from 'node:fs';import {join,relative} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const D='../dist/src/';const G=await import(D+'situation_knowledge_g1b.js');const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const QK=await import(D+'quantity_knowledge.js');
export const TAUGHT_DOCS={air_fryers:['air-fryers'],coffee_machines:['PEE-COFFEE-COMPLETE-CUMULATIVE-KNOWLEDGE-PACKAGE.md'],dehumidifiers:['PEE-DEHUMIDIFIERS-CONSOLIDATED-RESEARCH-2026-10-15.md','PEE-CATEGORY-RESEARCH-02-DEHUMIDIFIERS-ORIGINAL.md'],
 dishwashers:['PEE-CATEGORY-RESEARCH-06-HOUSEHOLD-DISHWASHERS','PEE-CATEGORY-RESEARCH-06-COUNTERTOP-DISHWASHERS'],air_purifiers:['PEE-CATEGORY-RESEARCH-04-AIR-PURIFIERS'],televisions:['PEE-CATEGORY-RESEARCH-07-TELEVISIONS']};
const walk=p=>statSync(p).isDirectory()?readdirSync(p).flatMap(n=>walk(join(p,n))):[p];
const docs=[];for(const [c,ps] of Object.entries(TAUGHT_DOCS))for(const p of ps){const b=join(arg('packages'),p);if(!existsSync(b))continue;for(const f of walk(b))if(f.endsWith('.md')||f.endsWith('CONSUMER-NEEDS-STRUCTURED.json'))docs.push({path:relative(arg('packages'),f),category:c,text:readFileSync(f,'utf8')});}
const s=new KnowledgeStore246(arg('store'));const P=G.buildProjectionG1b(s,docs,QK.loadQuantityKnowledge());
const out={schema:'pee.g1c.rows.v1',projectionVersion:P.version,rows:P.rows.map(r=>({id:r.id,category:r.category,kind:r.kind,expression:r.expression,guidance:r.guidance,strategies:r.strategies,contraindications:r.contraindications,provenance:r.provenance})),
 strategies:P.strategies.map(x=>({id:x.id,kind:x.kind,storedUnder:x.storedUnder,statement:x.statement,aliases:x.aliases}))};
const dir=join(homedir(),'.local/share/product-evidence-engine/private-eval/g1c');mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'rows.json'),JSON.stringify(out,null,1));
const ids=out.rows.map(r=>r.id).sort();writeFileSync(new URL('../evaluation/g1c/rows-manifest.json',import.meta.url),JSON.stringify({schema:'pee.g1c.rows-manifest.v1',rows:ids.length,linked:out.rows.filter(r=>r.strategies.length).length,
 byKind:out.rows.reduce((a,r)=>(a[r.kind]=(a[r.kind]??0)+1,a),{}),byCategory:out.rows.reduce((a,r)=>(a[r.category]=(a[r.category]??0)+1,a),{}),rowIdsSha256:createHash('sha256').update(ids.join('\n')).digest('hex')},null,1)+'\n');
console.log(ids.length,out.rows.filter(r=>r.strategies.length).length);
