#!/usr/bin/env node
/** Phase255 — measures whether retained evidence is used before new research is requested. Runs adviseFromRequest253
 * and researchNeedsFromAdvice254 on a copy of a snapshot (outside Git) and scores, against a gold file: response type,
 * per-product status (include / exclude / unknown), wrong inclusions and exclusions, and for unknown products the
 * destination of the need (research, source_reinspection, reextraction, not_actionable). Output: ids, criteria,
 * statuses and destinations only, never declared values.
 * Usage: node scripts/phase255-reuse-eval.mjs --gold FILE --snapshot FILE [--out FILE]
 */
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,rmSync} from 'node:fs';import {resolve,join} from 'node:path';import {homedir} from 'node:os';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {CATEGORY_REGISTRY250} from '../dist/src/phase248_category_registry.js';
import {adviseFromRequest253} from '../dist/src/phase253_request_advice.js';
import {researchNeedsFromAdvice254} from '../dist/src/phase254_research_needs.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const dir=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local','share','product-evidence-engine','knowledge'),'..','arms255');mkdirSync(dir,{recursive:true});
const db=join(dir,'reuse.sqlite');for(const x of ['','-wal','-shm'])rmSync(db+x,{force:true});copyFileSync(resolve(F.snapshot),db);
const store=new KnowledgeStore246(db);const gold=JSON.parse(readFileSync(resolve(F.gold),'utf8'));
const rows=[];
for(const c of gold.cases){const a=adviseFromRequest253(c.text,store,CATEGORY_REGISTRY250);const needs=researchNeedsFromAdvice254(a,store);
 const status=p=>a.shortlist.some(x=>x.productId===p)?'include':a.excluded.some(x=>x.productId===p)?'exclude':a.unknown.some(x=>x.productId===p)?'unknown':'absent';
 const products=c.products.map(g=>{const got=status(g.productId);const n=needs.find(x=>x.productId===g.productId);
  return {productId:g.productId,gold:g.status,got,goldNeed:g.need??null,gotNeed:got==='unknown'?(n?.destination??'none'):null,criterion:g.criterion??null,gotCriterion:n?.criterion??null};});
 rows.push({id:c.id,goldResponse:c.response,gotResponse:a.response,products,
  needs:needs.map(n=>({destination:n.destination,kind:n.kind,productId:n.productId,criterion:n.criterion}))});}
store.close();
const P=rows.flatMap(r=>r.products);const unknownGold=P.filter(p=>p.gold==='unknown');
const m={cases:rows.length,responseCorrect:rows.filter(r=>r.gotResponse===r.goldResponse).length,
 productStatusCorrect:P.filter(p=>p.got===p.gold).length,products:P.length,
 checkableComparisonsCorrect:P.filter(p=>p.gold!=='unknown'&&p.got===p.gold).length,checkableGold:P.filter(p=>p.gold!=='unknown').length,
 wrongInclusions:P.filter(p=>p.got==='include'&&p.gold!=='include').length,wrongExclusions:P.filter(p=>p.got==='exclude'&&p.gold!=='exclude').length,
 unknownWhereCheckable:P.filter(p=>p.gold!=='unknown'&&p.got==='unknown').length,
 needDestinationCorrect:unknownGold.filter(p=>p.got==='unknown'&&p.gotNeed===p.goldNeed&&p.gotCriterion===p.criterion).length,unknownGoldProducts:unknownGold.length,
 researchRequested:rows.reduce((s,r)=>s+r.needs.filter(n=>n.destination==='research').length,0),
 unnecessaryResearch:rows.reduce((s,r)=>s+r.needs.filter(n=>n.destination==='research'&&!r.products.some(p=>p.productId===n.productId&&p.gold==='unknown'&&p.goldNeed==='research')).length,0)};
const out={schema:'pee255.reuse-eval.v1',gold:F.gold,measured:m,rows};
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(m));
for(const r of rows){const bad=r.products.filter(p=>p.got!==p.gold||(p.gold==='unknown'&&p.gotNeed!==p.goldNeed));if(bad.length||r.gotResponse!==r.goldResponse)console.log(r.id,r.goldResponse,'->',r.gotResponse,JSON.stringify(bad.map(p=>[p.productId.slice(4,10),p.gold+'>'+p.got,p.goldNeed+'>'+p.gotNeed])))}
