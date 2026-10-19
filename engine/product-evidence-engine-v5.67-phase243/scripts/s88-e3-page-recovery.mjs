#!/usr/bin/env node
/** S88 E3: the S86d runner (scripts/s86d-page-recovery.mjs, unchanged) with one more configuration, defplan: the taught plan
 * whose MEASUREMENTS are compiled from the property definitions (definitionPlanMeasurements); each definition inherits the
 * outcomes of the taught measurements the definition interpreter attributes to it (decomposition of bundled teaching).
 * Original header follows.
 * S86d: the S86c page runner (scripts/s86c-page-recovery.mjs, unchanged) generalised to any page set, for the frozen
 * independent run. A manifest lists private pages: [{file, url, sha256, category, sourceType, publisher, observation?}].
 * Each page is read by one build and configuration, ingested into a store copy under the operational Phase249 class policy,
 * and what was persisted is read back. Private output (values, windows).
 *   node scripts/s86d-page-recovery.mjs --build DIR --manifest FILE --config default|plan|guided86c [--off a,b]
 *        --out FILE [--keep-store DIR]   (DIR receives the store copy, for downstream checks; never the live store)
 * Without an observation in the manifest, a minimal ingestion input is built from the manifest fields. */
import {readFileSync,writeFileSync,existsSync,copyFileSync,mkdtempSync,mkdirSync} from 'node:fs';import {join,dirname,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const sha=b=>createHash('sha256').update(b).digest('hex');const BUILD=arg('build');const CONFIG=arg('config')??'default';const OFF=(arg('off')??'').split(',').filter(Boolean);const D=join(BUILD,'dist/src/');
const MAN=resolve(arg('manifest'));const pagesIn=JSON.parse(readFileSync(MAN,'utf8'));const base=dirname(MAN);
const {extractSpecifications245}=await import(D+'phase245_spec_extraction.js');const T265=await import(D+'phase265_test_measurements.js');
const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const ST=await import(D+'phase246_knowledge_store.js');
const {FACTUAL_CLASS_POLICY249}=await import(D+'phase249_retention_policy.js');
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
const keep=arg('keep-store');const dir=keep?resolve(keep):mkdtempSync(join(homedir(),'.cache-s86d-'));mkdirSync(dir,{recursive:true});
const storeFile=join(dir,'pee246.sqlite');if(existsSync(storeFile))throw Error(storeFile+' exists');
const LIVE=join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite');if(resolve(storeFile)===resolve(LIVE))throw Error('never the live store');
copyFileSync(LIVE,storeFile);
const store=new ST.KnowledgeStore246(storeFile,{...ST.DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249});
let PLAN=null,REG=null,DEFS=null,QKM=null,DI=null,QKK=null;if(['defplan','defguided','defunion','defunionguided'].includes(CONFIG)){QKM=await import(D+'quantity_knowledge.js');QKK=QKM.loadQuantityKnowledge();DI=await import(D+'definition_interpreter.js');DEFS=(await import(D+'property_definitions.js')).loadPropertyDefinitions(QKK);}
const DECOMP={};const UNION=CONFIG.startsWith('defunion');
function defPlan(plan,cat){const taught=new Map();
 // fix1: a bundled taught measurement decomposes into every property one of its units admits with term support
 for(const m of plan.measurements){const props=new Set();for(const unit of m.units){const r=DI.attributeProperty(DEFS,QKK,{value:1,unit:unit==='°c'?'°C':unit,label:m.id.replace(/_/g,' ')+' '+m.terms.join(' '),category:cat});if(r.value)props.add(r.value);}
  (DECOMP[cat]??={})[m.id]=[...props];for(const p of props)taught.set(p,[...new Set([...(taught.get(p)??[]),...m.outcomes])]);}
 let measurements=DI.definitionPlanMeasurements(DEFS,QKK,cat,taught);
 if(UNION)measurements=[...plan.measurements,...measurements.filter(d=>!plan.measurements.some(m=>m.id===d.id))];const {compiledFrom:_c,...content}=plan;const next={...content,measurements,units:[...new Set(measurements.flatMap(m=>m.units))].sort()};
 return {...next,compiledFrom:{...plan.compiledFrom,digest:PLAN.planContentDigest272(next)}};}
if(CONFIG!=='default'){PLAN=await import(D+'phase272_extraction_plan.js');REG=(await import(D+'phase248_category_registry.js')).CATEGORY_REGISTRY250;}
const pages={};
for(const p of pagesIn){const b=readFileSync(resolve(base,p.file));if(sha(b)!==p.sha256)throw Error('sha mismatch '+p.file);const html=b.toString('utf8');const cat=p.category;
 const o=p.observation??{source:{sourceId:'src_'+sha(p.publisher).slice(0,12),host:new URL(p.url).hostname,sourceType:p.sourceType,sourceTypeBasis:'operator_asserted'},url:p.url,sha256:p.sha256,
  bytes:b.length,httpStatus:200,fetchedAt:p.fetchedAt??'2026-10-19T00:00:00.000Z',runId:'s86d',extractorVersion:'phase245@s86d',categoryHypotheses:[cat]};
 const x=T265.testDocumentSubject268(extractSpecifications245(html,o.url),o.source.sourceType);
 const opts={category:cat};if(PLAN)opts.plan=PLAN.compileExtractionPlan272(store,cat,REG.find(e=>e.id===cat)?.aliases??[],TAUGHT.filter(t=>t!==cat));
 if(['defplan','defguided','defunion','defunionguided'].includes(CONFIG))opts.plan=defPlan(opts.plan,cat);
 if(['guided86c','defguided','defunionguided'].includes(CONFIG))opts.precision86c=Object.fromEntries(OFF.map(k=>[k,false]));
 const tl=T265.testLeadsFromHtml265(html,o.url,o.sha256,x,opts);const blocks=textBlocks225(html,{maxBlocks:1500}).blocks;const page=T265.pageProductLead265(x);
 let persisted=new Map(),ingest=null,ingestError=null;
 try{const r=store.ingestObservation246({...o,extraction:x,testLeads:tl});ingest=r.testMeasurements??null;
  for(const row of store.db.prepare("SELECT lead_id,product_id,value,unit FROM test_measurements265 WHERE revision_id=? AND extractor_version=? AND state='current'").all(r.revisionId,tl.extractorVersion))persisted.set(row.lead_id,row);}
 catch(e){ingestError=String(e.message??e);}
 const cands=tl.probe.candidates.map(c=>{const s=T265.screenTestLead265(c,{url:o.url,sha256:o.sha256});const row=persisted.get(c.id);const blk=blocks[c.blockIndex]??'';
  return {leadId:c.id,blockIndex:c.blockIndex,valueOffset:c.valueOffset,value:c.value,unit:c.unit,methodCue:c.methodCue,subject:c.subject?.name??null,subjectAssignment:c.subjectAssignment,
   block:blk.slice(0,700),window:blk.slice(Math.max(0,c.valueOffset-70),c.valueOffset+50),screened:s.ok?'accepted':s.reason,kinds:s.ok?(s.lead.quantity?.kinds??null):null,
   association:s.ok?T265.subjectAssociation265(s.lead,page):null,persisted:!!row,persistedProduct:row?row.product_id:null};});
 pages[p.file.split('/').pop()]={url:o.url,category:cat,publisher:p.publisher??new URL(o.url).hostname,pageSubject:page?.name??null,extractorVersion:tl.extractorVersion,candidates:cands,ingest,ingestError,
  roles86c:(tl.probe.classifiedObservations86c??null)?.map(r=>({...r,window:(blocks[r.blockIndex]??'').slice(Math.max(0,r.valueOffset-70),r.valueOffset+50)}))??null,repeated86c:tl.probe.repeatedReadings86c??0,truncated:!!tl.probe.truncated};}
store.close();
const out={schema:'pee.s88.e3-page-recovery.v1',decomposition:DECOMP,build:BUILD,config:CONFIG,off:OFF,manifest:MAN,store:keep?storeFile:'(temporary copy)',pages};if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');
console.log(CONFIG,OFF.join(',')||'-',JSON.stringify(Object.fromEntries(Object.entries(pages).map(([k,v])=>[k.slice(0,12),[v.candidates.length,v.candidates.filter(c=>c.persisted).length,v.ingestError?'ERR':'']]))));
