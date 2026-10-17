#!/usr/bin/env node
/** Original roadmap Step 3: reproducible demonstration of how a build versions plan-guided readings and re-derives them.
 * Runs seven scenarios on temporary stores with ONE fictional page (no network, no retained content) against the build
 * at DIST, using only interfaces present before and after Step 3, so the same script shows the failure modes of the
 * earlier build and their absence after. Usage: node scripts/step3-versioning-demo.mjs LABEL [DIST]
 * -> evaluation/step3/versioning-demo-LABEL.json (refuses to overwrite). */
import {mkdtempSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {tmpdir} from 'node:os';import {join,resolve} from 'node:path';import {createHash} from 'node:crypto';
const [label,distArg]=process.argv.slice(2);if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL [DIST]');
const OUT=resolve(`evaluation/step3/versioning-demo-${label}.json`);if(existsSync(OUT))throw Error(OUT+' exists: never overwritten');
process.env.PEE_ALLOW_TMP_STORE='1';const D=resolve(distArg??'dist/src')+'/';
const ST=await import(D+'phase246_knowledge_store.js');const SP=await import(D+'phase245_spec_extraction.js');const T=await import(D+'phase265_test_measurements.js');const R=await import(D+'phase249_retention_policy.js');
const sha=s=>createHash('sha256').update(s).digest('hex');const dir=mkdtempSync(join(tmpdir(),'pee-s3demo-'));let n=0,m=0;
const CLASS={...ST.DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:R.FACTUAL_CLASS_POLICY249};
const URL='https://lab.pees3-test.test/r/kt5';
const html=`<html><head><title>F</title><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name:'Kettle Co KT5 Kettle',brand:'Kettle Co',model:'KT5'})}</script></head><body><article><h1>Kettle Co KT5 Kettle review</h1><p>We tested the KT5 for a week in our lab.</p><p>In our tests the KT5 boiled a litre in 160 seconds, and its noise level peaked at 61 dB.</p><p>The KT5 boil time was 3 minutes on the eco setting.</p></article></body></html>`;
const plan=(units,terms)=>{const p={schema:'pee272.extraction-plan.v1',categoryId:'kettles',isEvidence:false,categoryNouns:['kettle'],identity:{requireNamedSubject:true,modelCodeBindsResult:true},outcomes:[],
 measurements:[{id:'m',outcomes:[],proxyFor:[],dimensions:units.includes('db')?['sound','duration']:['duration'],units,terms,conditions:[]}],units,proxies:[],sectionCues:[],decisionEvidence:[]};return {...p,compiledFrom:{items:1,relations:0,digest:sha(JSON.stringify(p))}};};
const PA=plan(['db','seconds','minutes'],['noise','boil','time']),PB=plan(['seconds'],['boil']);
const x=SP.extractSpecifications245(html,URL);const leads=p=>T.testLeadsFromHtml265(html,URL,sha(html),x,p?{category:'kettles',plan:p}:{category:'kettles'});
const fresh=()=>new ST.KnowledgeStore246(join(dir,`s${++n}.sqlite`),CLASS);
const obs=(s,l,robots=null)=>s.ingestObservation246({source:{sourceId:'src_lab',host:'lab.pees3-test.test',sourceType:'independent_original_test',sourceTypeBasis:'operator_asserted'},url:URL,sha256:sha(html),bytes:html.length,httpStatus:200,
 fetchedAt:new Date(Date.parse('2026-10-17T09:00:00Z')+(m++)*60000).toISOString(),runId:'run_s3demo',extractorVersion:'phase245@demo',extraction:x,categoryHypotheses:['kettles'],reservations:R.detectReservations249(robots,html),testLeads:l});
const cur=s=>s.testMeasurements265().map(r=>r.value+' '+r.unit).sort();
const custom=(v,patch)=>{const b=leads(PA);return {extractorVersion:v,probe:{...b.probe,candidates:[{...b.probe.candidates[0],...patch}]}};};
const out={schema:'pee.step3.versioning-demo.v1',label,at:new Date().toISOString(),build:D,tier:'T1_synthetic',scenarios:{}};
const sc=(id,question,observed,failure)=>{out.scenarios[id]={question,observed,failureObserved:failure};console.log(id,failure?'FAILURE':'ok',JSON.stringify(observed));};
{const v=[leads(null),leads(PA),leads(PB)].map(l=>l.extractorVersion);sc('D1_identity','do no-plan, plan A and plan B readings get distinct extractor versions?',{noPlanEqualsA:v[0]===v[1],AEqualsB:v[1]===v[2]},v[0]===v[1]||v[1]===v[2]);}
{const s=fresh();obs(s,leads(PA));const a=cur(s);obs(s,leads(PB));const b=cur(s);sc('D2_revised_plan','after plan B, is a value only plan A read still current?',{afterA:a,afterB:b},b.includes('3 minutes'));s.close();}
{const s=fresh();obs(s,leads(PA));const z=leads(PB);obs(s,{extractorVersion:'v-zero-results',probe:{...z.probe,candidates:[]}});const c=cur(s);sc('D3_zero_results','after a new reading version with no results, do earlier rows stay current?',{currentAfter:c},c.length>0);s.close();}
{const s=fresh();obs(s,custom('v1',{methodCue:'plan_guided_measurement_term',condition:null,instrument:null,subjectAssignment:'page_context_unverified',blockIndex:2,valueOffset:40}));
 obs(s,custom('v2',{methodCue:'first_person_test_statement',condition:'20 °c',instrument:'sound meter',subjectAssignment:'not_identified',blockIndex:5,valueOffset:12}));
 const r=s.testMeasurements265()[0];const got=[r.methodCue,r.condition,r.instrument,r.subjectAssignment,r.locator.blockIndex,r.locator.valueOffset,r.productId===null];
 sc('D4_lead_id_collision','with the same lead id under v2, does the row carry v2\'s columns?',{storedVersion:r.extractorVersion,stored:got,offered:['first_person_test_statement','20 °c','sound meter','not_identified',5,12,true]},
  JSON.stringify(got)!==JSON.stringify(['first_person_test_statement','20 °c','sound meter','not_identified',5,12,true]));s.close();}
{const s=fresh();obs(s,leads(PA));const a1=s.testMeasurements265().map(r=>[r.value,r.methodCue,r.locator.valueOffset]).sort();obs(s,leads(PB));obs(s,leads(PA));
 const a2=s.testMeasurements265().map(r=>[r.value,r.methodCue,r.locator.valueOffset]).sort();sc('D5_rollback','plan A → B → A: does A reproduce its first reading?',{first:a1,afterRollback:a2},JSON.stringify(a1)!==JSON.stringify(a2));s.close();}
{const s=fresh();obs(s,leads(PA));const r=obs(s,custom('v-new',{}),'User-agent: *\nContent-Signal: ai-input=no\nAllow: /');
 sc('D6_rights_on_rederivation','re-derived under a reservation now in force: are values written or kept current?',{persisted:r.testMeasurements?.persisted??0,currentWithValues:s.testMeasurements265().filter(t=>t.value!==null).length},
  (r.testMeasurements?.persisted??0)>0||s.testMeasurements265().some(t=>t.value!==null));s.close();}
{const s=fresh();const cmp=[{appliance:'air_fryer',subject:null,taskIndex:0,taskLabel:'chips',dimension:'duration',value:20,unit:'minutes',approximate:false,conditionCodes:[],form:'prose',blockSha256:sha('b')}];
 const q=()=>s.db.prepare("SELECT COUNT(*) AS n FROM comparative_results271 WHERE state='current'").get().n;
 obs(s,{...custom('v1',{}),comparative270:cmp});obs(s,{...custom('v2',{}),comparative270:cmp});obs(s,{...custom('v1',{}),comparative270:cmp});
 sc('D7_comparative_rollback','comparative rows after reader v1 → v2 → v1: is v1\'s result current again?',{currentRows:q()},q()!==1);s.close();}
mkdirSync(resolve('evaluation/step3'),{recursive:true});writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');
