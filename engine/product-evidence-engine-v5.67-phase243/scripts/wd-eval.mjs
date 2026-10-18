#!/usr/bin/env node
/**
 * Whole-document evaluation (WD, 2026-10-18). Protocol: evaluation/whole-document/protocol.json (committed before any
 * reader code). Zero HTTP: pages come from the KV wave (private evaluation directory, kr-unseen/raw).
 *   render               neutral annotation input: Chromium innerText (JavaScript off, network blocked) in numbered lines,
 *                        lines inside HTML tables flagged; a data view of JSON-LD and inline hydration payloads. Written
 *                        next to the raw pages only (never committed).
 *   freeze-gold          hash the sealed reference files -> evaluation/whole-document/gold-freeze.json (no overwrite)
 *   run ARM LABEL        run one arm once and score it against the sealed reference (no overwrite)
 * Public output: counts only. Private output (pee-knowledge private-eval/whole-document): rows without page text.
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync,readdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
const sha=b=>createHash('sha256').update(b).digest('hex');
const KV=process.env.PEE_WD_KV??join(homedir(),'.local/share/product-evidence-engine/private-eval/kr-unseen');
const WD=process.env.PEE_WD_ROOT??join(homedir(),'.local/share/product-evidence-engine/private-eval/whole-document');
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';const PUB=process.env.PEE_WD_PUB??'evaluation/whole-document';const PRIV=process.env.PEE_WD_PRIV??join(REPO,'private-eval/whole-document');
const [cmd,...args]=process.argv.slice(2);
export const pagesOf=root=>JSON.parse(readFileSync(join(root,'wave.json'),'utf8')).pages.filter(p=>p.outcome==='fetched').map(p=>{const b=readFileSync(join(root,'raw',p.tag+'.html'));
 if(p.sha256&&sha(b)!==p.sha256)throw Error('page bytes differ from the receipt: '+p.tag);return {...p,html:b.toString('utf8')};});

/** The data view: string and number leaves of JSON-LD, __NEXT_DATA__, Next.js flight data and application/json scripts. */
export function dataView(html){const out=[];const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
 const leaves=(o,path,src)=>{if(o===null||o===undefined)return;if(Array.isArray(o)){o.forEach((x,i)=>leaves(x,path+'['+i+']',src));return;}
  if(typeof o==='object'){for(const [k,v] of Object.entries(o))leaves(v,path?path+'.'+k:k,src);return;}
  const s=String(o).replace(/\s+/g,' ').trim();if(!s||!/[0-9a-z]/i.test(s)||/^(?:https?:|\/|data:|#)/.test(s)||s.length>2000)return;out.push({source:src,path,text:s});};
 const tryJson=s=>{try{return JSON.parse(s);}catch{return undefined;}};
 for(const [,attrs,body] of scripts){const type=(/type\s*=\s*["']?([^"'\s>]+)/i.exec(attrs)?.[1]??'').toLowerCase();const id=/id\s*=\s*["']?([^"'\s>]+)/i.exec(attrs)?.[1]??'';
  if(type==='application/ld+json'){const j=tryJson(body.trim());if(j!==undefined)leaves(j,'','json-ld');continue;}
  if(id==='__NEXT_DATA__'||type==='application/json'){const j=tryJson(body.trim());if(j!==undefined)leaves(j,'',id||'application/json');continue;}
  if(/self\.__next_f\.push/.test(body)){let flight='';for(const m of body.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)){const s=tryJson(m[1]);if(typeof s==='string')flight+=s;}
   for(const line of flight.split('\n')){const i=line.indexOf(':');if(i<0)continue;const j=tryJson(line.slice(i+1));if(j!==undefined)leaves(j,'flight '+line.slice(0,i),'next-flight');}}}
 return out;}

if(cmd==='render'){
 const req=createRequire(import.meta.url);let pw=null;for(const p of [process.env.PLAYWRIGHT_MODULE,'playwright','/opt/node-tools/node_modules/playwright'].filter(Boolean)){try{pw=req(p);break;}catch{}}
 if(!pw)throw Error('playwright not found');const Q=await import(resolve('dist/src/quantity_knowledge.js'));const qk=Q.loadQuantityKnowledge();
 const browser=await pw.chromium.launch();const ctx=await browser.newContext({javaScriptEnabled:false});await ctx.route('**/*',r=>r.request().url().startsWith('data:')?r.continue():r.abort());
 const out={knowledge:{kinds:qk.pack.kinds.map(k=>({id:k.id,note:k.note??null})),metrics:qk.pack.metrics.map(m=>({id:m.id,label:m.label,kind:m.kind,note:m.note??null})),conditionAxes:qk.pack.conditionAxes.map(a=>({id:a.id,note:a.note??null}))},pages:{}};
 for(const p of pagesOf(KV)){const page=await ctx.newPage();await page.setContent(p.html,{waitUntil:'domcontentloaded'}).catch(()=>{});
  const r=await page.evaluate(()=>{const t=document.body?document.body.innerText:'';const inTable=new Set();for(const tb of document.querySelectorAll('table'))for(const l of tb.innerText.split('\n'))if(l.trim())inTable.add(l.replace(/\s+/g,' ').trim());return {t,inTable:[...inTable]};});
  await page.close();const tset=new Set(r.inTable);let n=0;
  const lines=r.t.split('\n').map(l=>l.replace(/\s+/g,' ').trim()).filter(Boolean).map(text=>({n:++n,text,inTable:tset.has(text)}));
  let d=0;const data=dataView(p.html).map(x=>({n:'d'+(++d),...x}));
  out.pages[p.tag]={url:p.finalUrl??p.url,category:p.category,sourceType:p.sourceType,sha256:p.sha256,lines,data};}
 await browser.close();mkdirSync(WD,{recursive:true});const f=join(WD,'annotation-input.json');if(existsSync(f))throw Error(f+' exists: never overwritten');
 const s=JSON.stringify(out,null,1);writeFileSync(f,s);
 console.log(JSON.stringify({file:f,sha256:sha(s),pages:Object.fromEntries(Object.entries(out.pages).map(([k,v])=>[k,{lines:v.lines.length,tableLines:v.lines.filter(l=>l.inTable).length,dataLines:v.data.length}]))},null,1));process.exit(0);}

if(cmd==='freeze-gold'){const dir=join(WD,'gold');const f=join(PUB,'gold-freeze.json');if(existsSync(f))throw Error(f+' exists: never overwritten');
 const files=readdirSync(dir).filter(x=>x.endsWith('.json')).sort();const rows=files.map(x=>{const b=readFileSync(join(dir,x));const j=JSON.parse(b);return {file:x,sha256:sha(b),quantities:j.quantities?.length??0,qualitative:j.qualitative?.length??0};});
 const input=sha(readFileSync(join(WD,'annotation-input.json')));
 writeFileSync(f,JSON.stringify({sealedAt:new Date().toISOString(),protocolSha256:sha(readFileSync(join(PUB,'protocol.json'))),annotationInputSha256:input,files:rows},null,1)+'\n');console.log('wrote',f);process.exit(0);}

if(cmd==='run'){const {runArm}=await import(resolve('scripts/wd-score.mjs'));await runArm(args[0],args[1],{KV,WD,PUB,PRIV,pagesOf});process.exit(0);}
if(!['render','freeze-gold','run'].includes(cmd))throw Error('usage: render | freeze-gold | run ARM LABEL');
