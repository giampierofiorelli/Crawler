#!/usr/bin/env node
/** Phase245 evaluation: Phase244 baseline (Phase241 HTML IR as wired into Phase222) vs Phase245
 * specification extraction, scored against hand-written gold annotations.
 * Usage: node scripts/phase245-evaluate.mjs --pages <dir with TAG.html> --gold <gold.json> [--out result.json]
 * Pages are read from local files the operator fetched under robots rules; nothing is fetched here.
 * Only facts about the gold's scoped products are scored, so every scored fact is judged.
 */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {extractSpecifications245} from '../dist/src/phase245_spec_extraction.js';
import {htmlToIR241} from '../dist/src/phase241_unified_product_facts.js';
import {extractDeclaredPageIdentity222} from '../dist/src/phase222_transient_public_page_observer.js';
import {canonicalUnit245,normalizeValue245} from '../dist/src/phase245_value_normalizer.js';

const args=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
if(!args.pages||!args.gold){console.error('usage: --pages DIR --gold FILE [--out FILE]');process.exit(2);}
const gold=JSON.parse(readFileSync(resolve(args.gold),'utf8'));
const norm=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const pkey=s=>norm(s).replace(/[:：]\s*$/,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const near=(a,b)=>Math.abs(a-b)<=Math.max(0.005*Math.abs(b),0.001);
const unitEq=(a,b)=>(canonicalUnit245(a??'')??norm(a))===(canonicalUnit245(b??'')??norm(b));
function valueMatches(f,g){
 if(g.kind==='text')return f.kind==='text'&&norm(f.text)===norm(g.text);
 if(g.kind==='number')return f.kind==='number'&&near(f.number,g.number);
 if(g.kind==='boolean')return f.kind==='boolean'&&f.value===g.value&&(g.qualifier===undefined||norm(f.qualifier)===norm(g.qualifier));
 if(g.kind==='quantity')return f.kind==='quantity'&&near(f.number,g.number)&&unitEq(f.unit,g.unit);
 if(g.kind==='price')return f.kind==='price'&&near(f.amount,g.amount)&&f.currency===g.currency&&(g.maxAmount===undefined?f.maxAmount===undefined:near(f.maxAmount,g.maxAmount));
 if(g.kind==='options')return f.kind==='options'&&f.numbers.length===g.numbers.length&&f.numbers.every((n,i)=>near(n,g.numbers[i]))&&unitEq(f.unit,g.unit);
 if(g.kind==='range')return f.kind==='range'&&near(f.min,g.min)&&near(f.max,g.max)&&unitEq(f.unit,g.unit);
 if(g.kind==='dimensions')return f.kind==='dimensions'&&f.numbers.length===g.numbers.length&&f.numbers.every((n,i)=>near(n,g.numbers[i]))&&unitEq(f.unit,g.unit);
 return false;
}
/** Phase241 value -> comparable shape (baseline). */
function from241(v,property){
 if(v.type==='text')return normalizeValue245(v.value,property).kind==='boolean'?normalizeValue245(v.value,property):{kind:'text',text:v.value};
 if(v.type==='range')return ['usd','gbp','eur'].includes(v.unit)?{kind:'price',amount:v.min,maxAmount:v.max,currency:v.unit.toUpperCase()}:{kind:'range',min:v.min,max:v.max,unit:v.unit};
 if(['usd','gbp','eur'].includes(v.unit))return {kind:'price',amount:v.number,currency:v.unit.toUpperCase()};
 if(!v.unit)return {kind:'number',number:v.number};
 return {kind:'quantity',number:v.number,unit:v.unit};
}
function baselineFacts(html){
 const facts=htmlToIR241(html,'eval').facts;
 const leads=extractDeclaredPageIdentity222(html).productLeads;
 const pageProduct=leads.length===1?leads[0].name:null;
 return facts.map(f=>({product:f.context.variant?{ref:'named',name:f.context.variant}:{ref:'main',name:pageProduct},
  variant:null,section:f.context.rowHeading&&f.context.rowHeading!==f.property?f.context.rowHeading:null,
  property:f.property,propertyKey:pkey(f.property),value:from241(f.value,f.property),method:f.provenance.method}));
}
function score(facts,g,mainName,{respectMethods}){
 const inScope=f=>{
  if(respectMethods&&g.scopeMethods&&!g.scopeMethods.includes(f.method))return false;
  return g.scopeProducts.some(sp=>sp==='main'?f.product.ref==='main':norm(f.product.name)===norm(sp)||(mainName&&norm(sp)===norm(mainName)&&f.product.ref==='main'));
 };
 const ownerOk=(f,e)=>e.product==='main'?f.product.ref==='main':norm(f.product.name)===norm(e.product);
 const sectionOk=(f,e)=>!e.section||norm(f.section)===norm(e.section);
 const scoped=facts.filter(inScope);
 const matched=new Set();let tp=0,falseAssoc=0,fp=0;const fpList=[],assocList=[];
 for(const f of scoped){
  const hit=g.expected.findIndex((e,i)=>!matched.has(i)&&pkey(e.property)===f.propertyKey&&ownerOk(f,e)&&sectionOk(f,e)&&
   (e.variant??null)===(f.variant??null)&&valueMatches(f.value,e.value));
  if(hit>=0){matched.add(hit);tp++;continue;}
  const forb=g.forbidden.find(x=>ownerOk(f,x)&&(x.propertyAny||pkey(x.property)===f.propertyKey&&(!x.value||valueMatches(f.value,x.value))&&(!x.section||norm(f.section)===norm(x.section))));
  const wrongOwner=g.expected.some(e=>pkey(e.property)===f.propertyKey&&valueMatches(f.value,e.value)&&(!ownerOk(f,e)||!sectionOk(f,e)));
  if(forb||wrongOwner){falseAssoc++;assocList.push(`${f.product.name??f.product.ref} | ${f.section??''} | ${f.property}`);continue;}
  if((g.acceptableExtra??[]).some(x=>pkey(x.property)===f.propertyKey))continue;
  fp++;fpList.push(`${f.product.name??f.product.ref} | ${f.property} = ${JSON.stringify(f.value)}`);
 }
 const missed=g.expected.filter((_,i)=>!matched.has(i)).map(e=>`${e.product} | ${e.section??''} | ${e.property}`);
 // Required abstentions are judged within the gold's method scope (e.g. an infobox cell), like other scoring.
 const abst=(g.mustAbstain??[]).map(a=>!facts.some(f=>(!respectMethods||!g.scopeMethods||g.scopeMethods.includes(f.method))&&
  pkey(a.property)===f.propertyKey&&ownerOk(f,a)));
 return {scopedFacts:scoped.length,correct:tp,falseAssociations:falseAssoc,falsePositives:fp,missed:missed.length,expected:g.expected.length,
  abstentionsRequired:abst.length,abstentionsCorrect:abst.filter(Boolean).length,fpList,assocList,missedList:missed};
}
const rows=[];
for(const [tag,g] of Object.entries(gold)){
 const file=`${args.pages}/${tag}.html`;
 if(!existsSync(file)){rows.push({tag,missingPage:true});continue;}
 const html=readFileSync(file,'utf8');
 const sha=createHash('sha256').update(readFileSync(file)).digest('hex');
 let t=performance.now();const base=baselineFacts(html);const baseMs=performance.now()-t;
 t=performance.now();const x=extractSpecifications245(html,'eval:'+tag);const newMs=performance.now()-t;
 const mainName=x.mainProduct.name;
 const newFacts=x.facts.map(f=>({...f}));
 rows.push({tag,sha256:sha,bytes:html.length,
  baseline:{...score(base,g,mainName,{respectMethods:false}),ms:+baseMs.toFixed(1)},
  phase245:{...score(newFacts,g,mainName,{respectMethods:true}),ms:+newMs.toFixed(1),ambiguousKept:x.ambiguous.length}});
}
const sum=(k,s)=>rows.filter(r=>!r.missingPage).reduce((a,r)=>a+r[k][s],0);
const totals={};
for(const k of ['baseline','phase245'])totals[k]=Object.fromEntries(['expected','correct','falseAssociations','falsePositives','missed','abstentionsRequired','abstentionsCorrect','ms'].map(s=>[s,+sum(k,s).toFixed(1)]));
for(const k of ['baseline','phase245']){const t=totals[k];const promoted=t.correct+t.falseAssociations+t.falsePositives;
 t.precision=promoted?+(t.correct/promoted).toFixed(3):null;t.recall=t.expected?+(t.correct/t.expected).toFixed(3):null;}
const out={schema:'pee245.evaluation.v1',gold:args.gold,generatedAt:new Date().toISOString(),totals,pages:rows};
if(args.out)writeFileSync(resolve(args.out),JSON.stringify(out,null,1)+'\n');
console.log('page'.padEnd(24),'| baseline: corr assoc fp miss abst  ms | phase245: corr assoc fp miss abst  ms');
for(const r of rows){if(r.missingPage){console.log(r.tag.padEnd(24),'| PAGE MISSING');continue;}
 const f=x=>`${String(x.correct).padStart(4)} ${String(x.falseAssociations).padStart(5)} ${String(x.falsePositives).padStart(2)} ${String(x.missed).padStart(4)} ${x.abstentionsCorrect}/${x.abstentionsRequired} ${String(Math.round(x.ms)).padStart(4)}`;
 console.log(r.tag.padEnd(24),'|',f(r.baseline),'           |',f(r.phase245));}
console.log('TOTALS',JSON.stringify(totals));
if(args.verbose)for(const r of rows)if(!r.missingPage)for(const k of ['baseline','phase245']){const s=r[k];
 for(const x of s.fpList)console.log(`  [${r.tag}] ${k} FP: ${x}`);for(const x of s.assocList)console.log(`  [${r.tag}] ${k} ASSOC: ${x}`);
 for(const x of s.missedList)console.log(`  [${r.tag}] ${k} MISSED: ${x}`);}
