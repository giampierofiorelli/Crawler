#!/usr/bin/env node
/** Phase251: does retained observation become USEFUL category knowledge? Per category, counted separately:
 *  - observed attributes: declared labels on >= 2 products from >= 2 distinct hosts (one site's many models do not count
 *    twice; frequency is never read as importance);
 *  - checkable factual criteria: SPEC_CRITERIA249 keys for which >= 2 products from >= 2 hosts have a comparable declared
 *    value, i.e. where Phase249's decideAdvice249 can answer a confirmed requirement with a cited shortlist.
 * Usage: node scripts/phase251-observational-knowledge.mjs --db STORE [--out FILE] */
import {writeFileSync} from 'node:fs';import {resolve} from 'node:path';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {SPEC_CRITERIA249,candidatesFromStore249,comparable249} from '../dist/src/phase249_decision.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const store=new KnowledgeStore246(resolve(F.db));
const UNIT={volume:'l',length:'mm',mass:'g',power:'w',price:'GBP'};
const cats=[...new Set(store.db.prepare("SELECT value c FROM products,json_each(category_hypotheses_json) WHERE identity_state NOT IN ('unsupported_after_rederivation','merged')").all().map(r=>r.c))].sort();
const out={};
for(const c of cats){
 const cands=candidatesFromStore249(store,c);
 const host=u=>{try{return new URL(u).host;}catch{return u;}};
 const attr=new Map();
 for(const p of cands)for(const d of p.declarations){const k=d.property.toLowerCase().trim();const e=attr.get(k)??{products:new Set(),hosts:new Set()};e.products.add(p.productId);e.hosts.add(host(d.sourceUrl));attr.set(k,e);}
 const observed=[...attr].filter(([,e])=>e.products.size>=2&&e.hosts.size>=2).map(([k])=>k).sort();
 const checkable=Object.entries(SPEC_CRITERIA249).filter(([,s])=>{const ok=cands.filter(p=>p.declarations.some(d=>!d.variantId&&s.property.test(d.property)&&!(s.exclude?.test(d.property))&&comparable249(d.value,s.dimension,UNIT[s.dimension])!==null));
  return ok.length>=2&&new Set(ok.flatMap(p=>p.declarations.map(d=>host(d.sourceUrl)))).size>=2;}).map(([k])=>k);
 out[c]={products:cands.length,hosts:new Set(cands.flatMap(p=>p.declarations.map(d=>host(d.sourceUrl)))).size,observedAttributes:observed.length,checkableCriteria:checkable};
}
store.close();
const tot={categories:cats.length,categoriesWithCheckableCriteria:Object.values(out).filter(v=>v.checkableCriteria.length).length,
 checkableCriteria:Object.values(out).reduce((a,v)=>a+v.checkableCriteria.length,0),observedAttributes:Object.values(out).reduce((a,v)=>a+v.observedAttributes,0)};
if(F.out)writeFileSync(resolve(F.out),JSON.stringify({schema:'pee251.observational-knowledge.v1',totals:tot,categories:out},null,1)+'\n');
console.log(JSON.stringify(tot));for(const [c,v] of Object.entries(out))if(v.checkableCriteria.length||v.observedAttributes)console.log(' ',c,JSON.stringify(v));
