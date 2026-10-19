#!/usr/bin/env node
/** S89: learn a definitions layer from a wave's pages (src/definition_learning.ts) and write it (private: terms come from
 * third-party pages; the public file keeps counts and the terms' properties only).
 *   node scripts/s89-learn.mjs --items PRIVATE_ITEMS.json --out PRIVATE_LAYER.json [--public PUBLIC_COUNTS.json]
 * Items: the E4-format item list (id, page, host, category, value, unit, surface, label, context). */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const L=await import(D+'definition_learning.js');
const qk=QK.loadQuantityKnowledge();const defs=PD.loadPropertyDefinitions(qk);
const locate=x=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((a,b)=>Math.abs(a-80)-Math.abs(b-80))[0]:null;};
const items=JSON.parse(readFileSync(arg('items'),'utf8'));
const obs=items.map(x=>({docId:x.page,publisher:x.host,category:x.category,value:x.value,unit:x.unit,label:x.label,context:x.context,valueAt:x.valueAt??locate(x),surface:x.surface}));
const layer=L.learnFromDocuments(defs,qk,obs);
for(const f of [arg('out'),arg('public')])if(f&&existsSync(f))throw Error(f+' exists');
writeFileSync(arg('out'),JSON.stringify(layer,null,1));
if(arg('public'))writeFileSync(arg('public'),JSON.stringify({schema:'pee.s89.learned-counts.v1',learnedFrom:layer.learnedFrom,thresholds:layer.thresholds,
 termsByProperty:Object.fromEntries([...new Set(layer.terms.map(t=>t.property))].sort().map(p=>[p,layer.terms.filter(t=>t.property===p).length])),proposals:layer.proposals.length},null,1)+'\n');
console.log('terms',layer.terms.length,'proposals',layer.proposals.length);
for(const t of layer.terms)console.log(' T',t.property.padEnd(20),JSON.stringify(t.term),JSON.stringify(t.evidence).slice(0,110));
for(const p of layer.proposals.slice(0,40))console.log(' P',p.kind.padEnd(14),JSON.stringify(p.term),JSON.stringify(p.evidence));
