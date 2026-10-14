#!/usr/bin/env node
/** Phase248 sampled-gold evaluation. Recall on pre-registered attributes; identity and attribution checks
 * (listing pages, forbidden product strings, values of other products/charges on the main product,
 * must-abstain attributes); every promoted fact is written out for a separate precision audit.
 * Usage: node scripts/phase248-evaluate-sampled.mjs --pages DIR --gold FILE --manifest STATE.json [--out FILE] [--audit FILE] */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {resolve} from 'node:path';
import {extractSpecifications245,SPEC_EXTRACTOR_VERSION} from '../dist/src/phase245_spec_extraction.js';
import {canonicalUnit245} from '../dist/src/phase245_value_normalizer.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const gold=JSON.parse(readFileSync(resolve(F.gold),'utf8')).pages;
const state=F.manifest?JSON.parse(readFileSync(resolve(F.manifest),'utf8')):{pages:[]};
const norm=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const pkey=s=>norm(s).replace(/[:：]\s*$/,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const near=(a,b)=>Math.abs(a-b)<=Math.max(0.005*Math.abs(b),0.001);
const unitEq=(a,b)=>(canonicalUnit245(a??'')??norm(a))===(canonicalUnit245(b??'')??norm(b));
function match(f,g,raw){
 if(g.kind==='text')return (f.kind==='text'&&norm(f.text)===norm(g.text))||norm(raw)===norm(g.text);
 if(g.kind==='number')return (f.kind==='number'&&near(f.number,g.number));
 if(g.kind==='boolean')return f.kind==='boolean'&&f.value===g.value;
 if(g.kind==='quantity')return f.kind==='quantity'&&near(f.number,g.number)&&unitEq(f.unit,g.unit);
 if(g.kind==='price')return f.kind==='price'&&near(f.amount,g.amount)&&f.currency===g.currency;
 if(g.kind==='range')return f.kind==='range'&&near(f.min,g.min)&&near(f.max,g.max)&&unitEq(f.unit,g.unit);
 if(g.kind==='dimensions')return f.kind==='dimensions'&&f.numbers.length===g.numbers.length&&f.numbers.every((n,i)=>near(n,g.numbers[i]))&&unitEq(f.unit,g.unit);
 return false;
}
const rows=[];const audit=[];let ms=0;
for(const [tag,g] of Object.entries(gold)){
 const file=`${F.pages}/${tag}.html`;if(!existsSync(file)){rows.push({tag,missingPage:true});continue;}
 const url=state.pages.find(p=>p.tag===tag)?.finalUrl??state.pages.find(p=>p.tag===tag)?.url??'eval:'+tag;
 const t0=performance.now();const x=extractSpecifications245(readFileSync(file,'utf8'),url);ms+=performance.now()-t0;
 const main=x.facts.filter(f=>f.product.ref==='main');
 const found=g.expected.map(([prop,val])=>({prop,ok:main.some(f=>f.propertyKey===pkey(prop)&&match(f.value,val,f.rawValue))}));
 const identityErrors=[];
 if(g.pageType==='listing'&&main.length)identityErrors.push(`listing page: ${main.length} facts attributed to a page product "${x.mainProduct.name}"`);
 for(const fp of g.forbiddenProducts??[])if(x.facts.some(f=>f.product.ref==='named'&&norm(f.product.name)===norm(fp)))identityErrors.push(`not a product used as product: ${fp}`);
 const wrongAttribution=(g.forbiddenMainValues??[]).filter(([prop,val])=>main.some(f=>f.propertyKey===pkey(prop)&&match(f.value,val,f.rawValue))).map(([p,v])=>`${p}=${JSON.stringify(v)}`);
 const abstentionViolations=(g.mustAbstain??[]).filter(p=>main.some(f=>f.propertyKey===pkey(p))).map(p=>p);
 rows.push({tag,pageType:g.pageType,mainProduct:x.mainProduct.name,mainAmbiguous:x.mainProduct.ambiguous,promoted:x.facts.length,promotedMain:main.length,heldBack:x.ambiguous.length,
  expected:g.expected.length,found:found.filter(f=>f.ok).length,missed:found.filter(f=>!f.ok).map(f=>f.prop),identityErrors,wrongAttribution,abstentionViolations});
 for(const f of x.facts)audit.push({tag,product:f.product.ref==='main'?'main':f.product.name,variant:f.variant,section:f.section,property:f.property,value:f.value,rawValue:f.rawValue,method:f.method});
}
const ok=rows.filter(r=>!r.missingPage);const sum=k=>ok.reduce((a,r)=>a+r[k],0);
const totals={pages:ok.length,hosts:new Set(ok.map(r=>state.pages.find(p=>p.tag===r.tag)?.finalUrl?new URL(state.pages.find(p=>p.tag===r.tag).finalUrl).host:r.tag)).size,
 expected:sum('expected'),found:sum('found'),sampledRecall:+(sum('found')/sum('expected')).toFixed(3),promotedFacts:sum('promoted'),
 identityErrorPages:ok.filter(r=>r.identityErrors.length).length,wrongAttributions:ok.reduce((a,r)=>a+r.wrongAttribution.length,0),
 abstentionViolations:ok.reduce((a,r)=>a+r.abstentionViolations.length,0),mustAbstainTotal:Object.values(gold).reduce((a,g)=>a+(g.mustAbstain?.length??0),0),
 extractMs:+ms.toFixed(1),extractor:SPEC_EXTRACTOR_VERSION};
const out={schema:'pee248.sampled-eval.v1',generatedAt:new Date().toISOString(),totals,pages:rows};
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(out,null,1)+'\n');
if(F.audit)writeFileSync(resolve(F.audit),JSON.stringify({schema:'pee248.precision-audit-input.v1',facts:audit},null,1)+'\n');
console.log(JSON.stringify(totals));
for(const r of ok)console.log(r.tag.padEnd(16),`${r.found}/${r.expected}`.padEnd(7),'promoted',String(r.promoted).padEnd(4),r.identityErrors.length?'ID-ERR '+r.identityErrors.join('; '):'',r.wrongAttribution.length?'WRONG-ATTR '+r.wrongAttribution.join(','):'',r.abstentionViolations.length?'ABST-VIOL '+r.abstentionViolations.join(','):'');
