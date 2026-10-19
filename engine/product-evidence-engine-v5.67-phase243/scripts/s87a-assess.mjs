#!/usr/bin/env node
/** S87a: knowledge-derived evidence assessment (src/evidence_assessment.ts, shadow) of the test rows an experiment stored in a
 * store copy, beside Phase268 validation. Two variants: labels = the words the reading saw around each value (what a reader
 * could pass on as a taught-measurement code), and store_only = what the store keeps today (value, unit, codes).
 *   PEE_KNOWLEDGE_DIR=COPY node scripts/s87a-assess.mjs --readings PRIVATE_RUN --out PUBLIC --private PRIVATE_DETAIL
 * --link-fixes off reproduces the assessment before the S87a linking corrections. Public output: counts only. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists');
const D=new URL('../dist/src/',import.meta.url).href;const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const A=await import(D+'evidence_assessment.js');const V=await import(D+'phase268_evidence_validation.js');
const dir=process.env.PEE_KNOWLEDGE_DIR;if(!dir)throw Error('PEE_KNOWLEDGE_DIR (a store copy) is required');const store=new KnowledgeStore246(join(dir,'pee246.sqlite'));
const R=JSON.parse(readFileSync(arg('readings'),'utf8'));const urls=new Set(Object.values(R.pages).map(p=>p.url));
const win=new Map();for(const p of Object.values(R.pages))for(const c of p.candidates)win.set(c.leadId,{window:c.window,page:p.url,category:p.category});
const rows=store.testMeasurements265().filter(r=>urls.has(r.source.url)&&r.state==='current');
const product=id=>{const p=store.db.prepare('SELECT name,declared_model FROM products WHERE product_id=?').get(id);return p?{name:p.name,declaredModel:p.declared_model}:null;};
const v268=V.validateTestMeasurements268(rows,product,V.VALIDATION_POLICY268);
const out={schema:'pee.s87a.evidence-assessment.v1',linkFixes:arg('link-fixes')!=='off',rows:rows.length,phase268Validated:v268.validated.length,variants:{}};const detail=[];
for(const variant of ['labels','store_only']){const T={};const inc=k=>T[k]=(T[k]??0)+1;
 for(const cat of [...new Set(Object.values(R.pages).map(p=>p.category))]){const catRows=rows.filter(r=>win.get(r.leadId)?.category===cat);if(!catRows.length)continue;
  const as=A.assessStoredEvidence87(store,cat,{rows:catRows,linkFixes:arg('link-fixes')!=='off',labelsOf:variant==='labels'?(id=>{const r=catRows.find(x=>x.measurementId===id);return win.get(r?.leadId)?.window??'';}):undefined});
  for(const a of as){inc('assessed');inc('quantity:'+a.quantity.status);inc(a.measure.id?'measure:linked':a.measure.candidates.length>1?'measure:ambiguous':'measure:not_linked');
   for(const [p,x] of Object.entries(a.purposes)){if(x.met)inc('purpose_met:'+p);else for(const why of x.reasons)inc(`purpose_reason:${p}:${why.replace(/:.*/,'')}`);}
   if(variant==='labels'){const r=catRows.find(x=>x.measurementId===a.measurementId);detail.push({...a,window:win.get(r?.leadId)?.window??null,value:r?.value,unit:r?.unit});}}}
 out.variants[variant]=Object.fromEntries(Object.entries(T).sort());}
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');if(arg('private'))writeFileSync(arg('private'),JSON.stringify(detail,null,1)+'\n');
console.log(JSON.stringify(out,null,1));
