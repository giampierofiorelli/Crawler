#!/usr/bin/env node
/** S86b: read the 12 retained S80 pages (private, spent: diagnosis only) with one build and one configuration, recording
 * every candidate value with its block text (private), the persistence-screen outcome and the typing.
 *   node scripts/s86b-page-recovery.mjs --build DIR --config default|plan|plan_semantics_1e --out PRIVATE_FILE
 * default = the operational reading; plan = Phase272 knowledge-compiled plan (its leads are admitted by the screen);
 * plan_semantics_1e = plan + 1D-A2 semantic tables + 1E table lessons (shadow: their leads are never admitted). */
import {readFileSync,writeFileSync,existsSync,readdirSync,copyFileSync,mkdtempSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const sha=b=>createHash('sha256').update(b).digest('hex');const BUILD=arg('build');const CONFIG=arg('config')??'default';const D=join(BUILD,'dist/src/');
const {extractSpecifications245}=await import(D+'phase245_spec_extraction.js');const T265=await import(D+'phase265_test_measurements.js');
const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
let PLAN=null,REG=null,STORE=null,SEM=null,LESSONS=null;
if(CONFIG!=='default'){PLAN=await import(D+'phase272_extraction_plan.js');REG=(await import(D+'phase248_category_registry.js')).CATEGORY_REGISTRY250;
 const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const dir=mkdtempSync(join(homedir(),'.cache-s86b-'));copyFileSync(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'),join(dir,'s'));STORE=new KnowledgeStore246(join(dir,'s'));
 if(CONFIG==='plan_semantics_1e'){SEM=await import(D+'document_semantics.js');LESSONS=(await import(D+'table_lessons1e.js')).activeTableLessons1E();}}
const P=join(homedir(),'.local/share/product-evidence-engine/private-eval/s80');
const obs=JSON.parse(readFileSync(join(P,'obs-D-firstrun-frozen.json'),'utf8')).map(o=>o.observation).filter(Boolean);const bySha=new Map(obs.map(o=>[o.sha256,o]));
const pages={};
for(const f of readdirSync(join(P,'raw')).sort()){const b=readFileSync(join(P,'raw',f));const o=bySha.get(sha(b));const html=b.toString('utf8');const cat=o.categoryHypotheses?.[0]??null;
 const x=T265.testDocumentSubject268(extractSpecifications245(html,o.url),o.source.sourceType);
 const opts={category:cat};if(PLAN){opts.plan=PLAN.compileExtractionPlan272(STORE,cat,REG.find(e=>e.id===cat)?.aliases??[],TAUGHT.filter(t=>t!==cat));}
 if(SEM){opts.semantics=SEM.readDocumentSemantics1D2(html,o.url);opts.tableLessons=LESSONS;}
 const tl=T265.testLeadsFromHtml265(html,o.url,o.sha256,x,opts);const blocks=textBlocks225(html,{maxBlocks:1500}).blocks;
 const page=T265.pageProductLead265?T265.pageProductLead265(x):null; // (first run read a non-existent field: every attribution came out unresolved)
 const cands=tl.probe.candidates.map(c=>{const s=T265.screenTestLead265(c,{url:o.url,sha256:o.sha256});
  const assoc=s.ok&&T265.subjectAssociation265?T265.subjectAssociation265(s.lead,page):null;
  return {blockIndex:c.blockIndex,valueOffset:c.valueOffset,value:c.value,unit:c.unit,methodCue:c.methodCue,subject:c.subject?.name??null,subjectAssignment:c.subjectAssignment,
   block:(blocks[c.blockIndex]??'').slice(0,600),screened:s.ok?'accepted':s.reason,storedUnit:s.ok?s.lead.unit:null,kinds:s.ok?(s.lead.quantity?.kinds??null):null,
   dimension:s.ok?s.lead.dimension:null,association:assoc};});
 const comparative=(tl.comparative270??[]).map(r=>({value:r.value,unit:r.unit,dimension:r.dimension,appliance:r.appliance,block:String(r.sentence??r.text??'').slice(0,300)}));
 const decl=(x?.facts??x?.declarations??[]).map(d=>({property:d.property??d.key??null,value:d.value?.value??d.value?.amount??(typeof d.value==='number'?d.value:null),unit:d.value?.unit??d.unit??null,raw:String(d.value?.raw??d.raw??'').slice(0,80)}));
 pages[f]={url:o.url,category:cat,pageSubject:page?.name??null,extractorVersion:tl.extractorVersion,candidates:cands,comparative,declarations:decl,declaredSkipped:tl.probe.declaredValuesSkipped86??0,
  shadow:tl.shadowDiagnostics?{keys:Object.keys(tl.shadowDiagnostics)}:null};}
const out={schema:'pee.s86b.page-recovery.v1',build:BUILD,config:CONFIG,pages};if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');
console.log(CONFIG,JSON.stringify(Object.fromEntries(Object.entries(pages).map(([k,v])=>[k,[v.candidates.length,v.candidates.filter(c=>c.screened==='accepted').length,v.declarations.length]]))));
