#!/usr/bin/env node
/** FA-I1: assemble judge inputs (private): per item the source item, the inventory units, the full encoding (with
 * quotes and unrepresented list), the validator messages and the blind reconstruction. Batches for J1 (all items) and J2
 * (the 30 preregistered items). Usage: node scripts/fa-i1-judge-input.mjs */
import {readFileSync,writeFileSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'fa-i1');
const J=p=>JSON.parse(readFileSync(join(PE,p),'utf8'));
const sample=new Map(J('sample.json').items.map(x=>[x.item,x]));
const inv=new Map([...J('runs/inventory-1.json').items,...J('runs/inventory-2.json').items].map(x=>[x.item,x.units]));
const enc=new Map([1,2,3,4].flatMap(k=>J(`runs/encoding-${k}.json`).items).map(x=>[x.item,x]));
const val=J('runs/validation.json').items;
const rec=new Map([1,2].flatMap(k=>J(`runs/reconstruction-${k}.json`).items).map(x=>[x.item,x]));
const pre=JSON.parse(readFileSync(new URL('../evaluation/fa-i1/preregistration.json',import.meta.url),'utf8'));
const bundle=id=>{const {features,...src}=sample.get(id);return {item:id,source:src,units:inv.get(id)??[],encoding:enc.get(id)??null,validator:val[id]??null,reconstruction:rec.get(id)??null};};
const ids=[...sample.keys()].sort();const missing=ids.filter(i=>!inv.get(i)||!enc.get(i)||!rec.get(i));if(missing.length)throw Error('missing material for '+missing.join(','));
const J1=[['a',0,25],['b',25,50],['c',50,70],['d',70,85],['e',85,100]];
for(const [k,s,e] of J1)writeFileSync(join(PE,`input/j1-${k}.json`),JSON.stringify({schema:'pee.fa-i1.judge-input.v1',items:ids.slice(s,e).map(bundle)}));
const j2=pre.j2Items;writeFileSync(join(PE,'input/j2-a.json'),JSON.stringify({schema:'pee.fa-i1.judge-input.v1',items:j2.slice(0,15).map(bundle)}));
writeFileSync(join(PE,'input/j2-b.json'),JSON.stringify({schema:'pee.fa-i1.judge-input.v1',items:j2.slice(15).map(bundle)}));
console.log('J1 batches',J1.map(([k,s,e])=>k+':'+(e-s)).join(' '),'J2',j2.length);
