#!/usr/bin/env node
/** Original roadmap Step 3: safe re-derivation on AUTHENTIC retained revisions, on a temporary COPY of the live knowledge
 * store (the live file is only copied, never opened). Every revision of the copy whose page bytes are retained privately
 * (matched by SHA-256) is re-observed with identical bytes under: no plan (the historical builder), plan A (compiled from
 * the copy's own teaching for the page category), plan A again, plan B (plan A with one measurement removed: a revised
 * plan), plan A again (rollback), and no plan again (rollback to the historical reading). After each step: logical
 * content of test_measurements265 and comparative_results271 (digests and counts only), the journal check, and what the
 * store says must be reconsidered under the plan now in force. No values leave the private machine.
 * Usage: node scripts/step3-store-copy-rederivation.mjs LABEL -> evaluation/step3/store-copy-rederivation-LABEL.json. */
import {readFileSync,writeFileSync,existsSync,mkdtempSync,copyFileSync,readdirSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir,tmpdir} from 'node:os';import {createHash} from 'node:crypto';
const label=process.argv[2];if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL');
const OUT=resolve(`evaluation/step3/store-copy-rederivation-${label}.json`);if(existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const D=resolve('dist/src')+'/';const ST=await import(D+'phase246_knowledge_store.js');const SP=await import(D+'phase245_spec_extraction.js');const T=await import(D+'phase265_test_measurements.js');
const R=await import(D+'phase249_retention_policy.js');const PL=await import(D+'phase272_extraction_plan.js');const REG=await import(D+'phase248_category_registry.js');
const sha=b=>createHash('sha256').update(b).digest('hex');
const LIVE=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');const liveBefore=sha(readFileSync(LIVE));
const COPY=join(mkdtempSync(join(tmpdir(),'pee-s3copy-')),'pee246.sqlite');copyFileSync(LIVE,COPY);process.env.PEE_ALLOW_TMP_STORE='1';
const E=join(homedir(),'.local/share/product-evidence-engine/private-eval');const pages=new Map();
for(const ph of readdirSync(E)){const w=join(E,ph,'wave.json'),raw=join(E,ph,'raw');if(!existsSync(w)||!existsSync(raw))continue;const W=JSON.parse(readFileSync(w,'utf8'));
 for(const p of W.pages??[]){const f=join(raw,p.tag+'.html');if(!existsSync(f))continue;const b=readFileSync(f);pages.set(sha(b),{html:b.toString('utf8'),page:p,robots:W.robots??{}});}}
// The store's storage policy as recorded at ingest time is not part of the file; the live store was written under the
// Phase249 class policy (every retained revision is facts_retained_class_policy), so the copy is opened with it.
const s=new ST.KnowledgeStore246(COPY,{...ST.DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:R.FACTUAL_CLASS_POLICY249});
const revs=s.db.prepare("SELECT r.revision_id,r.url,r.sha256,r.bytes,s.source_id,s.host,s.source_type,s.source_type_basis FROM revisions r JOIN sources s USING(source_id) WHERE r.state='current' ORDER BY r.url").all().filter(r=>pages.has(r.sha256));
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
const planFor=c=>PL.compileExtractionPlan272(s,c,REG.CATEGORY_REGISTRY250.find(e=>e.id===c)?.aliases??[],TAUGHT.filter(t=>t!==c));
const revised=p=>{const {compiledFrom,...c}=p;const q={...c,measurements:c.measurements.slice(1)};return {...q,compiledFrom:{...compiledFrom,digest:sha(JSON.stringify(q))}};};
let minute=0;const at=()=>new Date(Date.parse('2026-10-18T00:00:00Z')+(minute++)*60000).toISOString();
const produced={};
const observe=(mode,id)=>{const out={revisions:0,persisted:0,alreadyStored:0,withheld:0};const ids=produced[id]=new Set();
 for(const r of revs){const {html,page,robots}=pages.get(r.sha256);const cat=page.category&&page.category!=='mixed'?page.category:null;
  const x=T.testDocumentSubject268(SP.extractSpecifications245(html,r.url),r.source_type);
  const p=mode==='none'||!cat?null:mode==='A'?planFor(cat):revised(planFor(cat));
  const tl=T.testLeadsFromHtml265(html,r.url,r.sha256,x,{category:cat,...(p?{plan:p}:{})});
  const res=s.ingestObservation246({source:{sourceId:r.source_id,host:r.host,sourceType:r.source_type,sourceTypeBasis:r.source_type_basis},url:r.url,sha256:r.sha256,bytes:r.bytes,httpStatus:200,fetchedAt:at(),
   runId:'step3_copy_'+mode,extractorVersion:SP.SPEC_EXTRACTOR_VERSION,extraction:x,categoryHypotheses:cat?[cat]:[],
   reservations:R.detectReservations249(robots[r.host]?.status===200?robots[r.host].body??null:null,html),testLeads:tl});
  for(const c of tl.probe.candidates){const l=T.screenTestLead265(c,{url:r.url,sha256:r.sha256});if(l.ok)ids.add('tm_'+sha(r.revision_id+'|'+l.lead.leadId).slice(0,24));}
  out.revisions++;out.persisted+=res.testMeasurements?.persisted??0;out.alreadyStored+=res.testMeasurements?.alreadyStored??0;out.withheld+=res.testMeasurements?.withheldRights??0;}
 return out;};
const tm=()=>s.db.prepare('SELECT * FROM test_measurements265 ORDER BY measurement_id').all();const cr=()=>s.db.prepare('SELECT * FROM comparative_results271 ORDER BY result_id').all();
const proj=rows=>rows.map(({recorded_at,...k})=>k);
const currentProj=rows=>rows.filter(r=>r.state==='current').map(({recorded_at,extractor_version,...k})=>k);
const snap=()=>{const t=tm(),c=cr();const by=(rows,f)=>rows.reduce((o,r)=>{const k=f(r);o[k]=(o[k]??0)+1;return o;},{});
 return {testMeasurements:{rows:t.length,digest:sha(JSON.stringify(proj(t))),currentDigest:sha(JSON.stringify(currentProj(t))),byVersionAndState:by(t,r=>(r.extractor_version===T.TEST_LEAD_EXTRACTOR265?'BASE':r.extractor_version.replace(T.TEST_LEAD_EXTRACTOR265,'BASE'))+':'+r.state)},
  comparative:{rows:c.length,digest:sha(JSON.stringify(proj(c))),byVersionAndState:by(c,r=>r.reader_version.replace(T.TEST_LEAD_EXTRACTOR265,'BASE')+':'+r.state)},
  journalOk:s.verifyJournal().ok,valuesInNonRetainingRows:t.filter(r=>r.value!==null&&!['facts_retained_class_policy','local_pending_rights_review','facts_retained_owner_policy'].includes(r.retention)).length};};
const cats=[...new Set(revs.map(r=>pages.get(r.sha256).page.category).filter(c=>c&&c!=='mixed'))];
const plansNow=mode=>mode==='none'?[]:cats.map(c=>({categoryId:c,contentDigest:PL.planContentDigest272(mode==='A'?planFor(c):revised(planFor(c)))}));
const S0rows=tm();let S1rows=[];const baseIds=S0rows.filter(r=>r.state==='current').map(r=>r.measurement_id);const steps=[];const S0=snap();steps.push({step:'S0_copy_as_is',...S0});
for(const [id,mode] of [['S1_no_plan','none'],['S2_plan_A','A'],['S3_plan_A_again','A'],['S4_plan_B_revised','B'],['S5_rollback_plan_A','A'],['S6_rollback_no_plan','none']]){
 const o=observe(mode,id);const sn=snap();if(id==='S1_no_plan')S1rows=tm();
 // What the store says must be reconsidered if the knowledge in force became the OTHER plan.
 const other=mode==='A'?'B':mode==='B'?'A':null;const reconsider=other?s.readingsToReconsider265(plansNow(other)):[];
 const currentIds=new Set(tm().filter(r=>r.state==='current').map(r=>r.measurement_id));
 steps.push({step:id,mode,ingest:o,...sn,currentEqualsThisReading:currentIds.size===produced[id].size&&[...produced[id]].every(x=>currentIds.has(x)),
  toReconsiderIfPlanBecame:other?{plan:other,revisions:new Set(reconsider.map(x=>x.revisionId)).size,measurements:reconsider.reduce((a,x)=>a+x.currentMeasurements,0)}:null});}
const g=id=>steps.find(x=>x.step===id);
const checks={
 // A no-plan re-observation changes no stored row; it only adds leads today's reader produces for the first time (the
 // existing Phase265 behaviour for leads first offered later), and leaves comparative results unchanged.
 noPlanReobservationKeepsEveryStoredRowAndOnlyAddsNewLeads:JSON.stringify(proj(S0rows))===JSON.stringify(proj(S1rows.filter(r=>S0rows.some(o=>o.measurement_id===r.measurement_id))))
  &&S1rows.length-S0rows.length===[...produced.S1_no_plan].filter(x=>!S0rows.some(o=>o.measurement_id===x)).length&&g('S1_no_plan').comparative.digest===S0.comparative.digest,
 samePlanTwiceIsANoOp:g('S3_plan_A_again').testMeasurements.digest===g('S2_plan_A').testMeasurements.digest,
 revisedPlanIsADistinctVersion:Object.keys(g('S4_plan_B_revised').testMeasurements.byVersionAndState).some(k=>k.endsWith(':current')&&!Object.keys(g('S2_plan_A').testMeasurements.byVersionAndState).includes(k)),
 rollbackToPlanAReproducesItsCurrentRows:g('S5_rollback_plan_A').testMeasurements.currentDigest===g('S2_plan_A').testMeasurements.currentDigest,
 // After a plan reading, the current rows are exactly that reading's rows (nothing stale stays current).
 everyPlanStepCurrentEqualsItsReading:['S2_plan_A','S3_plan_A_again','S4_plan_B_revised','S5_rollback_plan_A','S6_rollback_no_plan'].every(id=>g(id).currentEqualsThisReading),
 rollbackToNoPlanReproducesTodaysNoPlanReading:g('S6_rollback_no_plan').currentEqualsThisReading&&[...produced.S6_rollback_no_plan].every(x=>produced.S1_no_plan.has(x))&&produced.S6_rollback_no_plan.size===produced.S1_no_plan.size,
 comparativeUnchangedByPlans:steps.every(x=>x.comparative.digest===S0.comparative.digest),
 noValuesInNonRetainingRows:steps.every(x=>x.valuesInNonRetainingRows===0),journalOkThroughout:steps.every(x=>x.journalOk)};
s.close();const liveAfter=sha(readFileSync(LIVE));
const out={schema:'pee.step3.store-copy-rederivation.v1',label,at:new Date().toISOString(),tier:'T2_authentic_controlled (authentic retained revisions, store copy)',
 build:{dist:D},revisions:revs.length,categories:cats,steps,checks,liveStoreUnchanged:liveAfter===liveBefore,
 // Base-reader drift under the unchanged historical version: rows stored at first ingest that today's no-plan reading no
 // longer produces (they stay current after a same-version re-observation), and rows it produces that were not stored.
 baseReaderDrift:(()=>{const s0=new Set(JSON.parse(JSON.stringify(baseIds)));const now=produced.S1_no_plan;return {storedAtFirstIngest:s0.size,stillProduced:[...s0].filter(x=>now.has(x)).length,
  noLongerProduced:[...s0].filter(x=>!now.has(x)).length,newlyProduced:[...now].filter(x=>!s0.has(x)).length};})()};
mkdirSync(resolve('evaluation/step3'),{recursive:true});writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({revisions:revs.length,categories:cats,checks,liveStoreUnchanged:out.liveStoreUnchanged,baseReaderDrift:out.baseReaderDrift,steps:steps.map(x=>({step:x.step,ingest:x.ingest,tm:x.testMeasurements.byVersionAndState,eq:x.currentEqualsThisReading,reconsider:x.toReconsiderIfPlanBecame}))}));
