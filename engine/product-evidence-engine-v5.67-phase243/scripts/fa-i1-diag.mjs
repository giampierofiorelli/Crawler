#!/usr/bin/env node
/** FA-I1: run the km.2 inference program on the encoded diagnostic cases (each with its request frame) and assemble the
 * diagnostic judge input (case with expectations, encoding, frame, derived conclusions). Usage: node scripts/fa-i1-diag.mjs */
import {readFileSync,writeFileSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'fa-i1');
const L=await import('./fa-i1-lib.mjs');
const cases=JSON.parse(readFileSync(new URL('../evaluation/fa-i1/diagnostic-cases.json',import.meta.url),'utf8')).cases;
const enc=new Map(JSON.parse(readFileSync(join(PE,'runs/encoding-diag.json'),'utf8')).items.map(x=>[x.item,x]));
const out=[],inp=[];
for(const c of cases){const e=enc.get(c.id);if(!e)throw Error('no encoding for '+c.id);const v=L.validateEncoding(e);let derived=null,error=null;
 try{derived=await L.infer(e,e.frame??{});}catch(x){error=String(x.message??x);}
 out.push({id:c.id,validatorErrors:v.errors,derived,error});inp.push({case:c,encoding:e,validatorErrors:v.errors,derived,error});}
writeFileSync(join(PE,'runs/diag-inference.json'),JSON.stringify({schema:'pee.fa-i1.diag-inference.v1',cases:out},null,1));
writeFileSync(join(PE,'input/d.json'),JSON.stringify({schema:'pee.fa-i1.diag-judge-input.v1',predicateMeanings:L.RULES.vocabulary.filter(x=>x.role==='derived').map(x=>({name:x.name,args:x.args,meaning:x.meaning})),cases:inp}));
for(const o of out)console.log(o.id,o.error??'',o.validatorErrors.length+' errs',Object.entries(o.derived??{}).filter(([k])=>!['capok','relevant'].includes(k)).map(([k,v])=>k+'='+v.length).join(' '));
