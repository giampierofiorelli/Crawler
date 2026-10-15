#!/usr/bin/env node
/** Phase249: audit public evaluation files for third-party material. Reports, per gold file, how many third-party
 * declared values are published per page (insubstantial-part check), files holding long verbatim strings, raw HTML,
 * e-mail addresses and phone-like numbers. Read-only; prints JSON. Usage: node scripts/phase249-public-audit.mjs [DIR] */
import {readFileSync,readdirSync,statSync} from 'node:fs';import {join,resolve} from 'node:path';
const root=resolve(process.argv[2]??'evaluation');
const walk=d=>readdirSync(d).flatMap(f=>{const p=join(d,f);return statSync(p).isDirectory()?walk(p):[p];});
const files=walk(root);const rel=f=>f.slice(root.length+1);
const out={root,files:files.length,html:[],emails:[],phones:[],longText:[],goldValues:[]};
for(const f of files){
 const s=readFileSync(f,'utf8');
 if(/\.html?$/i.test(f))out.html.push({file:rel(f),synthetic:/example|fixture/i.test(f+s.slice(0,2000))});
 for(const m of s.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/g))out.emails.push({file:rel(f),match:m[0]});
 if(/\+?\d[\d -]{9,}\d/.test(s)&&/phone|tel/i.test(s))out.phones.push(rel(f));
 if(!f.endsWith('.json'))continue;let j;try{j=JSON.parse(s);}catch{continue;}
 const strs=[];const v=x=>{if(typeof x==='string'){if(x.length>=300)strs.push(x.length);}else if(Array.isArray(x))x.forEach(v);else if(x&&typeof x==='object')Object.values(x).forEach(v);};v(j);
 if(strs.length)out.longText.push({file:rel(f),strings:strs.length,maxChars:Math.max(...strs)});
 // Gold files: values per page (sampled gold uses pages{tag:{expected:[[prop,value]]}}; Phase245 gold uses {tag:{expected:[{...}]}}).
 const pages=j.pages&&typeof j.pages==='object'&&!Array.isArray(j.pages)?j.pages:(/gold/i.test(f)&&!j.cases&&!j.notices?j:null);
 if(pages&&/gold/i.test(f)){const per=Object.values(pages).map(p=>Array.isArray(p?.expected)?p.expected.length:0).filter(n=>n>0);
  if(per.length)out.goldValues.push({file:rel(f),pages:per.length,values:per.reduce((a,b)=>a+b,0),maxPerPage:Math.max(...per)});}
}
console.log(JSON.stringify(out,null,1));
