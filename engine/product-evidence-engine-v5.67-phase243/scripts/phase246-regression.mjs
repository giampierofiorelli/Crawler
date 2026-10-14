#!/usr/bin/env node
/** Phase246 regression check: compares re-fetched pages with the Phase245 recorded revision (SHA-256, size) and
 * re-runs the SAME frozen extractor on old and new bytes. These pages were seen during development, so the
 * result is a regression signal only, never a held-out score. Usage:
 *  node scripts/phase246-regression.mjs --old DIR[,DIR] --new DIR --pairs newTag=oldTag,... [--out FILE]
 */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';import {join,resolve} from 'node:path';
import {extractSpecifications245} from '../dist/src/phase245_spec_extraction.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const root=resolve(new URL('..',import.meta.url).pathname);
const inv=JSON.parse(readFileSync(join(root,'evaluation/phase246/recovery-inventory.json'),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const key=f=>[f.product.ref==='main'?'main':f.product.name,f.variant,f.section,f.propertyKey,JSON.stringify(f.value)].join(' | ');
const rows=[];
for(const pair of F.pairs.split(',')){
 const [nt,ot]=pair.split('=');const rec=inv.pages.find(p=>p.tag===ot);
 const nb=readFileSync(join(F.new,nt+'.html'));
 let ob=null;for(const d of F.old.split(','))if(existsSync(join(d,ot+'.html'))){const b=readFileSync(join(d,ot+'.html'));if(sha(b)===rec.recordedSha256)ob=b;}
 const nx=extractSpecifications245(nb.toString('utf8'),rec.url),ox=ob?extractSpecifications245(ob.toString('utf8'),rec.url):null;
 const nk=new Set(nx.facts.map(key)),ok=ox?new Set(ox.facts.map(key)):null;
 rows.push({tag:ot,url:rec.url,recordedSha256:rec.recordedSha256,newSha256:sha(nb),bytesChanged:sha(nb)!==rec.recordedSha256,
  recordedBytes:rec.bytes,newBytes:nb.length,oldBytesVerified:!!ob,
  extractor:'phase245@ee2336f (unchanged)',old:ox&&{mainProduct:ox.mainProduct.name,ambiguousMain:ox.mainProduct.ambiguous,facts:ox.facts.length,heldBack:ox.ambiguous.length},
  new:{mainProduct:nx.mainProduct.name,ambiguousMain:nx.mainProduct.ambiguous,facts:nx.facts.length,heldBack:nx.ambiguous.length},
  factsOnlyInOld:ok?[...ok].filter(k=>!nk.has(k)).length:null,factsOnlyInNew:ok?[...nk].filter(k=>!ok.has(k)).length:null,
  role:'regression_not_holdout'});
}
const out={schema:'pee246.regression.v1',generatedAt:new Date().toISOString(),rows};
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(rows,null,1));
