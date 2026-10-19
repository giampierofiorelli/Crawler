#!/usr/bin/env node
/** S86c (v2 of s86b-page-recovery.mjs, which stays unchanged): read the 12 retained S80 pages (private, spent: development and
 * diagnosis only) with one build and configuration, then INGEST each reading into a throwaway copy of the live store and read
 * back what was actually persisted (row, product association). Private output (values, block windows).
 *   node scripts/s86c-page-recovery.mjs --build DIR --config default|plan|plan_semantics_1e|guided86c [--off a,b] --out FILE
 * guided86c = plan + the S86c observation-role and attribution controls (opts.precision86c); --off disables named controls
 * for ablation. */
import {readFileSync,writeFileSync,existsSync,readdirSync,copyFileSync,mkdtempSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const sha=b=>createHash('sha256').update(b).digest('hex');const BUILD=arg('build');const CONFIG=arg('config')??'default';const OFF=(arg('off')??'').split(',').filter(Boolean);const D=join(BUILD,'dist/src/');
const {extractSpecifications245}=await import(D+'phase245_spec_extraction.js');const T265=await import(D+'phase265_test_measurements.js');
const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
const dir=mkdtempSync(join(homedir(),'.cache-s86c-'));const storeFile=join(dir,'s');copyFileSync(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'),storeFile);
// the operational storage policy (as scripts/phase246-knowledge.mjs): Phase249 class policy; the default policy denies all values
const {DEFAULT_STORAGE_POLICY246}=await import(D+'phase246_knowledge_store.js');const {FACTUAL_CLASS_POLICY249}=await import(D+'phase249_retention_policy.js');
const store=new KnowledgeStore246(storeFile,{...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249});
let PLAN=null,REG=null,SEM=null,LESSONS=null;
if(CONFIG!=='default'){PLAN=await import(D+'phase272_extraction_plan.js');REG=(await import(D+'phase248_category_registry.js')).CATEGORY_REGISTRY250;
 if(CONFIG==='plan_semantics_1e'){SEM=await import(D+'document_semantics.js');LESSONS=(await import(D+'table_lessons1e.js')).activeTableLessons1E();}}
const P=join(homedir(),'.local/share/product-evidence-engine/private-eval/s80');
const obs=JSON.parse(readFileSync(join(P,'obs-D-firstrun-frozen.json'),'utf8')).map(o=>o.observation).filter(Boolean);const bySha=new Map(obs.map(o=>[o.sha256,o]));
const pages={};
for(const f of readdirSync(join(P,'raw')).sort()){const b=readFileSync(join(P,'raw',f));const o=bySha.get(sha(b));const html=b.toString('utf8');const cat=o.categoryHypotheses?.[0]??null;
 const x=T265.testDocumentSubject268(extractSpecifications245(html,o.url),o.source.sourceType);
 const opts={category:cat};if(PLAN)opts.plan=PLAN.compileExtractionPlan272(store,cat,REG.find(e=>e.id===cat)?.aliases??[],TAUGHT.filter(t=>t!==cat));
 if(SEM){opts.semantics=SEM.readDocumentSemantics1D2(html,o.url);opts.tableLessons=LESSONS;}
 if(CONFIG==='guided86c')opts.precision86c=Object.fromEntries(OFF.map(k=>[k,false]));
 const tl=T265.testLeadsFromHtml265(html,o.url,o.sha256,x,opts);const blocks=textBlocks225(html,{maxBlocks:1500}).blocks;const page=T265.pageProductLead265(x);
 // persistence, exactly as the ingestion does it (store copy; this revision's earlier rows are superseded by the new reading)
 let persisted=new Map(),ingest=null,ingestError=null;
 try{const r=store.ingestObservation246({...o,extraction:x,testLeads:tl});ingest=r.testMeasurements??null;
  for(const row of store.db.prepare("SELECT lead_id,product_id,value,unit FROM test_measurements265 WHERE revision_id=? AND extractor_version=? AND state='current'").all(r.revisionId,tl.extractorVersion))persisted.set(row.lead_id,row);}
 catch(e){ingestError=String(e.message??e);}
 const cands=tl.probe.candidates.map(c=>{const s=T265.screenTestLead265(c,{url:o.url,sha256:o.sha256});const row=persisted.get(c.id);const blk=blocks[c.blockIndex]??'';
  return {leadId:c.id,blockIndex:c.blockIndex,valueOffset:c.valueOffset,value:c.value,unit:c.unit,methodCue:c.methodCue,subject:c.subject?.name??null,subjectAssignment:c.subjectAssignment,
   block:blk.slice(0,700),window:blk.slice(Math.max(0,c.valueOffset-70),c.valueOffset+50),screened:s.ok?'accepted':s.reason,kinds:s.ok?(s.lead.quantity?.kinds??null):null,
   association:s.ok?T265.subjectAssociation265(s.lead,page):null,persisted:!!row,persistedProduct:row?row.product_id:null};});
 pages[f]={url:o.url,category:cat,pageSubject:page?.name??null,extractorVersion:tl.extractorVersion,candidates:cands,ingest,ingestError,
  roles86c:(tl.probe.classifiedObservations86c??null)?.map(r=>({...r,window:(blocks[r.blockIndex]??"").slice(Math.max(0,r.valueOffset-70),r.valueOffset+50)}))??null,repeated86c:tl.probe.repeatedReadings86c??0,declaredSkipped:tl.probe.declaredValuesSkipped86??0};}
const out={schema:'pee.s86c.page-recovery.v2',build:BUILD,config:CONFIG,off:OFF,pages};if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');
console.log(CONFIG,OFF.join(',')||'-',JSON.stringify(Object.fromEntries(Object.entries(pages).map(([k,v])=>[k.slice(4,8),[v.candidates.length,v.candidates.filter(c=>c.persisted).length,v.ingestError?'ERR':'']]))));
