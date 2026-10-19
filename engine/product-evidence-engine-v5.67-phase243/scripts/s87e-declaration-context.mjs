#!/usr/bin/env node
/** S87e: recover the original page context of each stored declaration (read-only store; locally retained page bytes found
 * by the revision's sha256). Context = label, raw value, section, the element at the locator, its row or item text, table
 * caption and header row, nearest headings, page title, and a bounded window of surrounding text. Private output only.
 *   node scripts/s87e-declaration-context.mjs --store STORE --pages DIR[,DIR] --out PRIVATE */
import {readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';import {join} from 'node:path';import {createHash} from 'node:crypto';import {DatabaseSync} from 'node:sqlite';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const D=new URL('../dist/src/',import.meta.url).href;const H=await import(D+'phase245_html_dom.js');const G=await import(D+'phase245_table_grid.js');
const files=new Map();const walk=d=>{for(const f of readdirSync(d)){const p=join(d,f);let st;try{st=statSync(p);}catch{continue;}if(st.isDirectory()){if(!/node_modules|\.git/.test(f))walk(p);}else if(/\.html?$/.test(f)&&st.size>2000)files.set(createHash('sha256').update(readFileSync(p)).digest('hex'),p);}};
for(const d of arg('pages').split(','))walk(d);
const db=new DatabaseSync(arg('store'),{readOnly:true});
const rows=db.prepare('SELECT d.*, v.url, v.sha256 AS page_sha FROM declarations d JOIN revisions v ON v.revision_id=d.revision_id').all();
const byPage=new Map();for(const r of rows)(byPage.get(r.page_sha)??byPage.set(r.page_sha,[]).get(r.page_sha)).push(r);
const T=n=>H.clean245(H.textOf245(n));const clip=(s,n)=>s.length>n?s.slice(0,n)+'…':s;
const out=[];let found=0,missing=0;
for(const [sha,rs] of byPage){const p=files.get(sha);if(!p){missing+=rs.length;continue;}
 const {root}=H.parseHtml245(readFileSync(p,'utf8'));const loc=new Map();const order=[];
 for(const n of H.walk245(root))if(n.kind==='element'){loc.set(H.locator245(n),n);order.push(n);}
 const headings=order.filter(n=>/^h[1-4]$/.test(n.tag));const title=T(order.find(n=>n.tag==='h1')??order.find(n=>n.tag==='title')??root).slice(0,160);
 const grids=new Map();const gridOf=t=>{if(!grids.has(t))grids.set(t,G.buildTableGrid245(t));return grids.get(t);};
 for(const r of rs){const L=String(r.locator);
  // jsonld/meta locators have no DOM position: the context is the label, value and page title
  if(/^(?:jsonld|meta):/.test(L)){found++;out.push({id:r.declaration_id,url:r.url,host:new URL(r.url).hostname.replace(/^www\./,''),found:true,structured:true,label:r.property,propertyKey:r.property_key,
    rawValue:r.raw_value,valueJson:JSON.parse(r.value_json),section:r.section,component:r.component,evidenceRole:r.evidence_role,method:r.method,element:null,row:null,tableCaption:null,tableHeader:null,headings:[],pageTitle:title,window:null});continue;}
  const m=/^(.*?)(?:@r(\d+)c(\d+)(?:\+\d+x\d+)?|:line(\d+)|:offers)?$/.exec(L);const baseLoc=m[1];let n=loc.get(baseLoc);
  if(!n){out.push({id:r.declaration_id,url:r.url,found:false});missing++;continue;}found++;
  let cellRow=null,cellCol=null,tableCtx=null;
  if(m[2]!==undefined&&n.tag==='table'){const g=gridOf(n);if(g){const ri=+m[2],ci=+m[3];const txt=(rr,cc)=>{const id=g.slot[rr]?.[cc];return id>=0&&id!==undefined?g.cells[id].text:'';};
    tableCtx={row:clip(Array.from({length:g.cols},(_,c)=>txt(ri,c)).filter(Boolean).join(' | '),300),header:clip(Array.from({length:g.cols},(_,c)=>txt(0,c)).filter(Boolean).join(' | '),300),
     rowHeader:clip(txt(ri,0),120),colHeader:clip(txt(0,ci),120),cell:clip(txt(ri,ci),200),caption:g.caption?clip(g.caption,200):null};}}
  const up=(x,re)=>{let y=x;while(y&&!(y.kind==='element'&&re.test(y.tag)))y=y.parent;return y;};
  const row=up(n,/^(tr|li|dl|div)$/);const table=up(n,/^table$/);
  const caption=table?(table.children.find(c=>c.tag==='caption')):null;const headRow=table?[...H.walk245(table)].find(x=>x.tag==='tr'&&x.children.some(c=>c.tag==='th')):null;
  const before=headings.filter(h=>h.order<n.order).slice(-2).map(T);
  const parent=n.parent?.parent??n.parent;
  if(tableCtx){out.push({id:r.declaration_id,url:r.url,host:new URL(r.url).hostname.replace(/^www\./,''),found:true,label:r.property,propertyKey:r.property_key,rawValue:r.raw_value,valueJson:JSON.parse(r.value_json),
    section:r.section,component:r.component,evidenceRole:r.evidence_role,method:r.method,element:tableCtx.cell,row:tableCtx.row,rowHeader:tableCtx.rowHeader,colHeader:tableCtx.colHeader,
    tableCaption:tableCtx.caption,tableHeader:tableCtx.header,headings:headings.filter(h=>h.order<n.order).slice(-2).map(T).map(h=>clip(h,120)),pageTitle:title,window:null});continue;}
  out.push({id:r.declaration_id,url:r.url,host:new URL(r.url).hostname.replace(/^www\./,''),found:true,label:r.property,propertyKey:r.property_key,rawValue:r.raw_value,valueJson:JSON.parse(r.value_json),
   section:r.section,component:r.component,evidenceRole:r.evidence_role,method:r.method,element:clip(T(n),200),row:row?clip(T(row),300):null,
   tableCaption:caption?clip(T(caption),200):null,tableHeader:headRow?clip(T(headRow),300):null,headings:before.map(h=>clip(h,120)),pageTitle:title,
   window:parent?clip(T(parent),500):null});}}
writeFileSync(arg('out'),JSON.stringify(out,null,1));console.log('declarations',rows.length,'context found',found,'missing',missing);
