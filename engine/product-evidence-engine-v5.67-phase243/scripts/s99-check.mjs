#!/usr/bin/env node
/** S99 independent check (evaluation/s99/check-preregistration.json): pages never examined by PEE (BreatheSafeAir air
 * purifier reviews, Best Cordless Vacuum Guide stick vacuum reviews, an Oransi CADR explainer), read through the operational
 * path and scored against a blind, double-annotated and adjudicated reference sealed before the run.
 *   items | input        check items and the blind annotator input (private-eval/s99/wave)
 *   (the run: scripts/s99-integrity.mjs LABEL --set check [--build DIR], after the reference is sealed) */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync,rmSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const [cmd,LABEL]=process.argv.slice(2);const sha=b=>createHash('sha256').update(b).digest('hex');
const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');const ROOT=join(PE,'s99/wave');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const SR=await import(D+'scientific_reading98.js');
const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const DE=await import(D+'document_evidence.js');
const qk=QK.loadQuantityKnowledge();const noOverwrite=f=>{if(existsSync(f))throw Error(f+' exists: never overwritten');return f;};
const wave=()=>JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));const pagesOf=()=>wave().pages.filter(p=>p.outcome==='fetched'&&p.role==='heldout_eval');
const htmlOf=p=>{const b=readFileSync(join(ROOT,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+p.tag);return b.toString('utf8');};
const nQ=bs=>bs.reduce((n,b)=>n+QK.findQuantities(qk,b).filter(q=>q.value!==null||q.low!==undefined).length,0);
function blocksOf(html){const a=textBlocks225(html,{maxBlocks:3000}).blocks;const r=DE.readDocumentEvidence(html,qk,{});const b=r.segments.filter(s=>s.region!=='boilerplate'&&!s.duplicateOf).map(s=>s.text);return nQ(b)>nQ(a)?b:a;}
if(cmd==='items'){const out=[];
 for(const p of pagesOf()){const html=htmlOf(p);const blocks=blocksOf(html);const title=(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]??'').replace(/\s+/g,' ').trim().slice(0,140);
  const all=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface,value:q.value??q.low,unit:q.unitSurface});}});
  const seen=new Set();const uniq=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});const k=Math.ceil(uniq.length/20)||1;
  uniq.filter((_,i)=>i%k===0).forEach((a,j)=>out.push({id:`${p.tag}-${j}`,bi:a.bi,page:p.tag,category:p.category,title,value:a.value,unit:a.unit,surface:a.surface,window:blocks[a.bi].slice(Math.max(0,a.start-160),a.end+160)}));}
 writeFileSync(noOverwrite(join(ROOT,'check-items.json')),JSON.stringify(out,null,1));console.log(out.length,'items',JSON.stringify(Object.fromEntries(pagesOf().map(p=>[p.tag,out.filter(x=>x.page===p.tag).length]))));}
if(cmd==='input'){const it=JSON.parse(readFileSync(join(ROOT,'check-items.json'),'utf8'));const dir=join(ROOT,'annotation');mkdirSync(join(dir,'pages'),{recursive:true});
 for(const p of pagesOf())writeFileSync(noOverwrite(join(dir,'pages',p.tag+'.txt')),blocksOf(htmlOf(p)).map((b,i)=>`L${i}: ${b.replace(/\s+/g,' ')}`).join('\n'));
 const ctx=SR.scientificContext98();
 const meaning=d=>{const m=d.quantity?.metric?ctx.qk.metrics.get(d.quantity.metric):null;return `${d.label} (${d.form}${d.quantity?.kinds?.length?'; kind: '+d.quantity.kinds.join('/'):''}${d.object&&d.object!=='unstated'?'; about: '+d.object:''})`+(m?.note?' - '+m.note:'')+' [also called: '+d.surface.map(s=>s[0]).slice(0,6).join(', ')+']';};
 const axes=[...ctx.qk.pack.conditionAxes].map(a=>({id:a.id,meaning:[a.note,a.values?'values: '+Object.keys(a.values).join(', '):null,a.valueKind?'a quantity of kind '+a.valueKind:null,a.cues?'cues: '+a.cues.slice(0,5).join(', '):null].filter(Boolean).join('; ')}));
 const f=noOverwrite(join(dir,'items.json'));
 writeFileSync(f,JSON.stringify({labels:{properties:[...ctx.defs.properties.values()].sort((a,b)=>a.id.localeCompare(b.id)).map(d=>({id:d.id,meaning:meaning(d)})),conditionAxes:axes.sort((a,b)=>a.id.localeCompare(b.id))},
  items:it.map(x=>({id:x.id,page:x.page,category:x.category,pageTitle:x.title,line:x.bi,value:x.value,unit:x.unit,surface:x.surface,text:x.window}))},null,1));console.log(it.length,'items',sha(readFileSync(f)));}
