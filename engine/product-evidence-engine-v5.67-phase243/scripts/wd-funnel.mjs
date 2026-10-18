#!/usr/bin/env node
// WD-A funnel census (2026-10-18): where quantities sit on each retained page and how many reach the knowledge layer. Counts only; zero HTTP. Usage: node scripts/wd-funnel.mjs [EXPERIMENT]  (default: every retained experiment except kr-unseen)
import {readFileSync,readdirSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {resolve} from 'node:path';const D=resolve('dist/src');
const Q=await import(D+'/quantity_knowledge.js');const K=await import(D+'/table_interpreter1g_knowledge.js');const G=await import(D+'/table_interpreter1g.js');
const H=await import(D+'/phase245_html_dom.js');
const qk=Q.loadQuantityKnowledge();const ROOT=join(homedir(),'.local/share/product-evidence-engine/private-eval');
const only=process.argv[2];const sha=b=>createHash('sha256').update(b).digest('hex');const seen=new Set();
const RAW=new Set(['script','style','textarea','title','noscript','template','iframe']);
const tot={};const inc=(k,n=1)=>tot[k]=(tot[k]??0)+n;const per=[];
for(const ev of readdirSync(ROOT).sort()){const rd=join(ROOT,ev,'raw');if(!existsSync(rd))continue;
 if(only?ev!==only:ev==='kr-unseen')continue;
 for(const f of readdirSync(rd).filter(f=>f.endsWith('.html')).sort()){const b=readFileSync(join(rd,f));const h=sha(b);if(seen.has(h))continue;seen.add(h);
  const html=b.toString('utf8');const r=K.interpretWithKnowledge1G(html,qk);
  const tv=r.tables.flatMap(t=>t.observations).filter(o=>['quantity','range','bound','number'].includes(o.kind));
  const typed=tv.filter(o=>o.quantity);const tables=r.tables.length;
  const dm=G.documentModel1G(html);const fq=t=>Q.findQuantities(qk,t).length;
  const byTag={};for(const bl of dm.blocks){if(bl.tag==='table')continue;const n=fq(bl.text);if(n)byTag[bl.tag]=(byTag[bl.tag]??0)+n;}
  // text outside blocks and tables: whole rendered body minus block texts
  const {root}=H.parseHtml245(html,{keepSource:true});let all='';const w=x=>{if(x.kind==='text'){all+=x.text;return;}if(RAW.has(x.tag)||x.tag==='table')return;all+=' ';x.children.forEach(w);all+=' ';};
  const body=[...H.walk245(root)].find(n=>n.tag==='body')??root;w(body);
  const allN=fq(H.decodeEntities245(all).replace(/\s+/g,' '));
  const blockN=Object.values(byTag).reduce((a,b)=>a+b,0);
  // embedded data
  let hydQ=0,ld=0,hyd=0,otherJson=0,scripts=0;for(const n of H.walk245(root)){if(n.tag!=='script')continue;const t=(n.attrs.type??'').toLowerCase();const txt=(n.text||'')+n.children.map(c=>c.rawText??c.text??'').join('');
   if(/ld\+json/.test(t)){ld+=fq(ldText(txt));}
   else if(n.attrs.id==='__NEXT_DATA__'||/__next_f|__NUXT__|__INITIAL_STATE__|__APOLLO_STATE__|__PRELOADED_STATE__|RTINGS_CONFIG/.test(txt.slice(0,300))){hyd+=txt.length;hydQ+=fq(strings(txt));}
   else if(/json/.test(t)){otherJson+=txt.length;hydQ+=fq(strings(txt));}else scripts+=txt.length;}
  const row={page:ev+'/'+f.replace('.html',''),tables,tableValues:tv.length,typed:typed.length,blocks:byTag,blockQuantities:blockN,outsideBlocksQuantities:Math.max(0,allN-blockN),ldQuantities:ld,hydrationBytes:hyd,embeddedQuantities:hydQ,otherJsonBytes:otherJson,scriptBytes:scripts};
  per.push(row);inc('pages');inc('tableValues',tv.length);inc('typed',typed.length);inc('blockQuantities',blockN);inc('outsideBlocks',row.outsideBlocksQuantities);inc('ld',ld);inc('embedded',hydQ);
  for(const[k,v]of Object.entries(byTag))inc('tag_'+k,v);if(hyd)inc('pagesWithHydration');if(otherJson>2000)inc('pagesWithJsonData');
 }}
function safe(s){try{return s.trim();}catch{return 'null';}}
console.log(JSON.stringify({tot,per},null,0).slice(0,200000));
function ldText(s){try{const out=[];const v=o=>{if(Array.isArray(o))o.forEach(v);else if(o&&typeof o==='object')for(const[k,x]of Object.entries(o)){if(typeof x==='string'||typeof x==='number')out.push(k+': '+x);else v(x);}};v(JSON.parse(s));return out.join('. ');}catch{return '';}}

// decoded string literals of a script (JSON or JS), with nested escapes undone twice (RSC payloads embed JSON in strings)
function strings(src){const out=[];const re=/"((?:[^"\\\n]|\\.){2,400})"/g;let m;const dec=x=>{try{return JSON.parse('"'+x+'"');}catch{return x;}};
 let t=src;for(let k=0;k<2;k++){out.length=0;while((m=re.exec(t)))out.push(dec(m[1]));t=out.join('\n');re.lastIndex=0;if(!/\\"|"/.test(t))break;}
 return out.filter(x=>/[a-z]/i.test(x)&&!/^(?:https?:|\/|\$|[A-Za-z0-9_-]+$)/.test(x)).join('. ');}
