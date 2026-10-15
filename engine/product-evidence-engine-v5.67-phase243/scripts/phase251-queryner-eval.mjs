#!/usr/bin/env node
/** Phase251 — T3 check of product-type recognition against QueryNER (bltlab/queryner, CC BY 4.0, human-annotated
 * e-commerce query segmentation; test split read through the official Hugging Face datasets-server API, kept privately).
 * Rules fixed before the run, derived mechanically from the human labels:
 *  - a case is a query containing a category name (alias) known to the arm's registry;
 *  - alias inside a core_product_type span  -> "product" case: the arm should choose that category;
 *  - alias inside any other span (modifier, product_name, department, ...) -> "not_product" case: the user wants
 *    something else (an accessory, a part, a related item); choosing the alias's category is a wrong attribution.
 * This measures product-type versus modifier recognition only; it says nothing about consumer needs.
 * Usage: node scripts/phase251-queryner-eval.mjs --rows DIR --arm R|D --out FILE [--snapshot FILE]
 */
import {readFileSync,readdirSync,writeFileSync,copyFileSync,rmSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {runJourney248} from '../dist/src/phase248_advisory_journey.js';
import {CATEGORY_REGISTRY248} from '../dist/src/phase248_category_registry.js';
import {ADOPTED_LESSONS250,applyLessons250,registryWithLessons250} from '../dist/src/phase250_category_lessons.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const NAMES=["O","B-UoM","I-UoM","B-color","I-color","B-condition","I-condition","B-content","I-content","B-core_product_type","I-core_product_type","B-creator","I-creator","B-department","I-department","B-material","I-material","B-modifier","I-modifier","B-occasion","I-occasion","B-origin","I-origin","B-price","I-price","B-product_name","I-product_name","B-product_number","I-product_number","B-quantity","I-quantity","B-shape","I-shape","B-time","I-time"];
const rows=readdirSync(resolve(F.rows)).filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(readFileSync(join(resolve(F.rows),f),'utf8')).rows.map(r=>({idx:r.row_idx,...r.row})));
const lessons=F.arm==='D'?ADOPTED_LESSONS250:[];
const registry=registryWithLessons250(CATEGORY_REGISTRY248,lessons);
const live=process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local','share','product-evidence-engine','knowledge');
const dir=join(live,'..','arms250');mkdirSync(dir,{recursive:true});const db=join(dir,`qn-${F.arm}.sqlite`);for(const x of ['','-wal','-shm'])rmSync(db+x,{force:true});
copyFileSync(resolve(F.snapshot??join(dir,'base-f9f20cc.sqlite')),db);
const store=new KnowledgeStore246(db);applyLessons250(store,lessons,'2026-10-15T00:00:00.000Z');
const cases=[];
for(const r of rows){const toks=r.tokens.map(t=>t.toLowerCase());const tags=r.ner_tags.map(i=>NAMES[i].replace(/^[BI]-/,''));const text=toks.join(' ');
 for(const e of registry)for(const a of e.aliases){const al=a.toLowerCase().split(' ');
  for(let i=0;i+al.length<=toks.length;i++){const span=toks.slice(i,i+al.length);if(!span.every((w,k)=>w===al[k]||w===al[k]+'s'||w===al[k]+'es'))continue;
   const t=new Set(tags.slice(i,i+al.length));const kind=t.size===1&&t.has('core_product_type')?'product':t.has('core_product_type')?null:'not_product';
   if(kind)cases.push({idx:r.idx,text,alias:a,category:e.id,kind,tags:[...t]});}}}
const seen=new Set();const uniq=cases.filter(c=>{const k=c.idx+'|'+c.category;if(seen.has(k))return false;seen.add(k);return true;});
const res=uniq.map(c=>{const j=runJourney248(c.text.length>=3?c.text:c.text+'   ',store,registry);const got=j.stages.category.basis==='ambiguous'?'ambiguous':j.stages.category.categoryId;
 return {...c,got,ok:c.kind==='product'?got===c.category:got!==c.category};});
store.close();
const P=res.filter(r=>r.kind==='product'),N=res.filter(r=>r.kind==='not_product');
const out={schema:'pee251.queryner-eval.v1',arm:F.arm,source:'bltlab/queryner test split (CC BY 4.0), rows via datasets-server API',queries:rows.length,
 product:{cases:P.length,correct:P.filter(r=>r.ok).length},notProduct:{cases:N.length,wrongAttributions:N.filter(r=>!r.ok).length},results:res};
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({arm:F.arm,queries:rows.length,product:out.product,notProduct:out.notProduct}));
