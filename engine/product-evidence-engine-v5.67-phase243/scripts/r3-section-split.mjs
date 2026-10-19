#!/usr/bin/env node
/**
 * R3 (owner S73): split the three selected owner packages into development and held-out sections BEFORE their content is
 * read for R3. Sections are the "## " headings of each main document. Order is fixed by a SHA-256 of
 * (file, heading index, heading); sections are then dealt alternately to dev and held-out until each side reaches its
 * byte budget. Writes the private split ($PE/r3/section-split.json, holds headings) and a public summary (counts, sizes,
 * split hash). No content is read beyond heading lines and section sizes.
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');const PK=join(PE,'r1v/packages');
const OUT=join(PE,'r3/section-split.json');if(existsSync(OUT))throw Error('split exists');mkdirSync(join(PE,'r3'),{recursive:true});
const sha=s=>createHash('sha256').update(s).digest('hex');
const DOCS={air_purifiers:'PEE-CATEGORY-RESEARCH-04-AIR-PURIFIERS-COMPLETE-v1.2.0/PEE-CATEGORY-RESEARCH-04-AIR-PURIFIERS/PEE-CATEGORY-RESEARCH-04-AIR-PURIFIERS-v1.2-CONSOLIDATED.md',
 coffee_machines:'PEE-THREE-SCIENTIFIC-RESEARCH-PACKAGES/PEE-COFFEE-COMPLETE-CUMULATIVE-KNOWLEDGE-PACKAGE.md',
 air_fryers:'PEE-THREE-SCIENTIFIC-RESEARCH-PACKAGES/af/PEE-AIR-FRYERS-COMPLETE-COMPENDIUM-v2.2.0-RECOVERED.md'};
const BUDGET=45000,MIN=1500,MAX=22000;
const split={schema:'pee.r3.section-split.v1',createdAt:new Date().toISOString(),method:'sha256 order, alternate dealing, byte budget per side',budget:BUDGET,docs:{}};
for(const [cat,rel] of Object.entries(DOCS)){const text=readFileSync(join(PK,rel),'utf8');const lines=text.split('\n');const secs=[];let cur=null;
 lines.forEach((l,i)=>{if(/^## /.test(l)){if(cur)secs.push(cur);cur={index:secs.length,heading:l.slice(3).trim(),start:i+1,end:i+1,bytes:0};}else if(cur){cur.end=i+1;cur.bytes+=Buffer.byteLength(l)+1;}});if(cur)secs.push(cur);
 const eligible=secs.filter(s=>s.bytes>=MIN&&s.bytes<=MAX).map(s=>({...s,key:sha(rel+'|'+s.index+'|'+s.heading)})).sort((a,b)=>a.key.localeCompare(b.key));
 const side={dev:[],heldout:[]},bytes={dev:0,heldout:0};let turn='dev';
 for(const s of eligible){const other=turn==='dev'?'heldout':'dev';const t=bytes[turn]+s.bytes<=BUDGET?turn:bytes[other]+s.bytes<=BUDGET?other:null;if(!t)continue;side[t].push(s);bytes[t]+=s.bytes;turn=t==='dev'?'heldout':'dev';}
 split.docs[cat]={file:rel,fileSha256:sha(text),sections:secs.length,eligible:eligible.length,dev:side.dev.map(({key,...s})=>s),heldout:side.heldout.map(({key,...s})=>s),bytes};}
const body=JSON.stringify(split,null,1)+'\n';writeFileSync(OUT,body);
const pub={schema:'pee.r3.section-split-summary.v1',createdAt:split.createdAt,splitSha256:sha(body),method:split.method,budget:BUDGET,
 docs:Object.fromEntries(Object.entries(split.docs).map(([c,d])=>[c,{fileSha256:d.fileSha256,sections:d.sections,eligible:d.eligible,dev:d.dev.length,heldout:d.heldout.length,bytes:d.bytes}]))};
writeFileSync('evaluation/r3/section-split.json',JSON.stringify(pub,null,1)+'\n');console.log(JSON.stringify(pub.docs));
