#!/usr/bin/env node
/**
 * FC evaluation inputs (2026-10-18): functions, components, operating modes and settings, test conditions and results.
 * Protocol: evaluation/function-fc/protocol.json. Zero HTTP: pages are copies of already retained development pages.
 *   node scripts/fc-eval.mjs wave      copy the selected pages (by tag) into the FC directory, with hashes
 *   node scripts/fc-eval.mjs render    neutral Chromium rendering (JavaScript off, network blocked) into numbered lines
 *   node scripts/fc-eval.mjs freeze    seal the reference (hashes of the gold files, the prompt and the annotation input)
 * Public output: hashes and counts only. Nothing is ever overwritten.
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync,readdirSync,copyFileSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
const sha=b=>createHash('sha256').update(b).digest('hex');
const ROOT=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');const FC=join(ROOT,'function-fc');const PUB='evaluation/function-fc';
const cmd=process.argv[2];
/** reference pages (sealed; the developer does not read their text before the first run) and development pages */
const REFERENCE=['u_ap_hf_xiaomi_4pro','u_ap_trd_coway_350','u_ap_trd_iqair_atemx','s1c_ap_hf_bedroom','s1db_ap_apf_a231_p800','s1db_dh_ih_best','u_td_tr_haier_hd90_a3q397u1','u_dw_tr_candy_cf57cf0w','u_af_tr_philips_1000_flexdrawer'];
const DEVELOPMENT=['dev_ap_hf_airdoctor3000','s1db_ap_apf_best_hepa','u_dw_er_bosch_smv68nd00g','er_ninja_af300'];
const waveMeta=()=>{const m=new Map();for(const ev of readdirSync(ROOT).sort()){const f=join(ROOT,ev,'wave.json');if(!existsSync(f))continue;let j;try{j=JSON.parse(readFileSync(f,'utf8'));}catch{continue;}
 for(const p of j.pages??[])if(p.tag&&!m.has(p.tag)&&existsSync(join(ROOT,ev,'raw',p.tag+'.html')))m.set(p.tag,{...p,from:ev});}return m;};
if(cmd==='wave'){const f=join(FC,'wave.json');if(existsSync(f))throw Error(f+' exists: never overwritten');mkdirSync(join(FC,'raw'),{recursive:true});const meta=waveMeta();
 const pages=[...REFERENCE.map(t=>[t,'reference']),...DEVELOPMENT.map(t=>[t,'development'])].map(([tag,set])=>{const p=meta.get(tag);if(!p)throw Error('page not retained: '+tag);
  const src=join(ROOT,p.from,'raw',tag+'.html');copyFileSync(src,join(FC,'raw',tag+'.html'));const h=sha(readFileSync(src));
  return {tag,set,category:p.category,sourceType:p.sourceType,url:p.finalUrl??p.url,from:p.from,sha256:h};});
 writeFileSync(f,JSON.stringify({schema:'pee.function-fc.wave.v1',createdAt:new Date().toISOString(),http:0,pages},null,1)+'\n');
 mkdirSync(PUB,{recursive:true});const pf=join(PUB,'wave.json');if(existsSync(pf))throw Error(pf+' exists');
 writeFileSync(pf,JSON.stringify({schema:'pee.function-fc.wave.v1',http:0,pages:pages.map(({tag,set,category,url,from,sha256})=>({tag,set,category,url,from,sha256}))},null,1)+'\n');console.log(pages.length,'pages');}
if(cmd==='render'){const req=createRequire(import.meta.url);let pw=null;for(const p of [process.env.PLAYWRIGHT_MODULE,'playwright','/opt/node-tools/node_modules/playwright'].filter(Boolean)){try{pw=req(p);break;}catch{}}
 if(!pw)throw Error('playwright not found');const wave=JSON.parse(readFileSync(join(FC,'wave.json'),'utf8'));const f=join(FC,'annot','annotation-input.json');if(existsSync(f))throw Error(f+' exists: never overwritten');
 const browser=await pw.chromium.launch();const ctx=await browser.newContext({javaScriptEnabled:false});await ctx.route('**/*',r=>r.request().url().startsWith('data:')?r.continue():r.abort());
 const out={pages:{}};
 for(const p of wave.pages.filter(p=>p.set==='reference')){const html=readFileSync(join(FC,'raw',p.tag+'.html'),'utf8');const page=await ctx.newPage();await page.setContent(html,{waitUntil:'domcontentloaded'}).catch(()=>{});
  const r=await page.evaluate(()=>{const t=document.body?document.body.innerText:'';const inTable=new Set();for(const tb of document.querySelectorAll('table'))for(const l of tb.innerText.split('\n'))if(l.trim())inTable.add(l.replace(/\s+/g,' ').trim());return {t,inTable:[...inTable]};});
  await page.close();const tset=new Set(r.inTable);let n=0;
  out.pages[p.tag]={category:p.category,lines:r.t.split('\n').map(l=>l.replace(/\s+/g,' ').trim()).filter(Boolean).map(text=>({n:++n,text,inTable:tset.has(text)}))};}
 await browser.close();mkdirSync(join(FC,'annot'),{recursive:true});const s=JSON.stringify(out,null,1);writeFileSync(f,s);
 console.log(JSON.stringify({sha256:sha(s),pages:Object.fromEntries(Object.entries(out.pages).map(([k,v])=>[k,v.lines.length]))}));process.exit(0);}
if(cmd==='freeze'){const f=join(PUB,'freeze.json');if(existsSync(f))throw Error(f+' exists: never overwritten');const dir=join(FC,'gold');
 const files=readdirSync(dir).filter(x=>x.endsWith('.json')).sort().map(x=>{const b=readFileSync(join(dir,x));const j=JSON.parse(b);const c={};for(const i of j.items)c[i.type]=(c[i.type]??0)+1;return {file:x,sha256:sha(b),items:j.items.length,byType:c};});
 writeFileSync(f,JSON.stringify({schema:'pee.function-fc.freeze.v1',sealedAt:new Date().toISOString(),annotationInputSha256:sha(readFileSync(join(FC,'annot','annotation-input.json'))),
  promptSha256:sha(readFileSync(join(FC,'prompt.md'))),files},null,1)+'\n');console.log(files.length,'files sealed');}
