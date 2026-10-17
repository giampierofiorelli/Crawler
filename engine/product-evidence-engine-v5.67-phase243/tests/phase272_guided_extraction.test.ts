import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {TELEVISION_TEACHING272,SOURCES272} from '../src/phase272_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {compileExtractionPlan272,linkToMeasure272,polarity272} from '../src/phase272_extraction_plan.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {testLeadsFromHtml265,testDocumentSubject268,screenTestLead265,documentMentions272} from '../src/phase265_test_measurements.js';
import {qualitativeObservations269} from '../src/phase269_qualitative_observations.js';

// Phase272: category knowledge compiled into an extraction plan before reading. Every page, product and value is FICTIONAL.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee272-'));let n=0;
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
function taught(){const s=new KnowledgeStore246(join(dir,`p${++n}.sqlite`),CLASS);registerTeachingSources252([...SOURCES271,...SOURCES272]);
 applyTeaching252(s,[TELEVISION_TEACHING272,DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271],'2026-10-17T08:00:00.000Z');return s;}
const ALL=['televisions','dishwashers','air_purifiers'];
const page=(title:string,body:string)=>`<html><head><meta property="og:type" content="article" /><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name:title})}</script></head><body><h1>${title}</h1>${body}</body></html>`;
const TV=page('Lumora Vista QX9 review: bright and bold',
 '<p>We tested the Lumora Vista QX9 in our lab for a week.</p>'+
 '<p>I measured its peak HDR brightness in a 10% window at 1,250 nits in Filmmaker mode.</p>'+
 '<p>Lumora claims a peak brightness of 2,000 nits for this panel.</p>'+
 '<p>Input lag ranged from 9.4 to 13 ms depending on the mode.</p>'+
 '<p>If you watched it for six hours a day it would use 210kWh a year.</p>'+
 '<p>We recorded 52 Hz judder artefacts on one stream.</p>'+
 '<p>Colours looked vibrant and accurate, but black levels were slightly crushed in dark scenes.</p>');
const url='https://www.lab.test/lumora-vista-qx9-review';

test('the plan is derived from the store, names no category in code, and is never evidence',()=>{
 const s=taught();const before=(s.db.prepare('SELECT count(*) c FROM category_items').get() as {c:number}).c;
 const p=compileExtractionPlan272(s,'televisions',['tv','television'],ALL);const q=compileExtractionPlan272(s,'televisions',['tv','television'],ALL);
 assert.equal(p.isEvidence,false);assert.equal(p.compiledFrom.digest,q.compiledFrom.digest,'deterministic');
 assert.ok(p.units.includes('nits')&&p.units.includes('ms'),JSON.stringify(p.units));
 assert.ok(p.outcomes.some(o=>o.id==='bright_room_visibility'&&o.measures.includes('hdr_luminance_by_window_and_duration')));
 assert.ok(p.decisionEvidence.find(d=>d.outcome==='bright_room_visibility')!.conditions.includes('luminance_measurement_metadata'));
 assert.equal((s.db.prepare('SELECT count(*) c FROM category_items').get() as {c:number}).c,before,'compiling a plan writes nothing');
 const src=readFileSync(new URL('../../src/phase272_extraction_plan.ts',import.meta.url),'utf8');
 for(const c of ['air_fryer','dishwasher','purifier','television','tumble'])assert.ok(!src.toLowerCase().includes(c),'no category named in the plan compiler: '+c);
 const d=compileExtractionPlan272(s,'dishwashers',['dishwasher'],ALL);assert.notDeepEqual(d.units,p.units,'a different category compiles a different plan');
 s.close();
});

test('guided reading admits a measured value with a taught term; declarations, ranges and projections stay out; A is unchanged',()=>{
 const s=taught();const plan=compileExtractionPlan272(s,'televisions',['tv','television'],ALL);s.close();
 const x=testDocumentSubject268(extractSpecifications245(TV,url),'independent_original_test');
 const A=testLeadsFromHtml265(TV,url,sha(TV),x,{category:'televisions'}).probe;
 const B=testLeadsFromHtml265(TV,url,sha(TV),x,{category:'televisions',plan}).probe;
 assert.ok(!A.candidates.some(c=>c.unit==='nits'),'without the plan nits are not read');
 assert.deepEqual(A.candidates.map(c=>[c.value,c.unit]),[[10,'%']],'the Phase268 reader takes the 10% window for a result');
 const got=B.candidates.map(c=>[c.value,c.unit]);
 assert.ok(got.some(([v,u])=>v===1250&&u==='nits'));
 for(const v of [2000,210,9.4,13,10])assert.ok(!got.some(([x])=>x===v),'not a result: '+v+' (claim, projection, range endpoint, condition parameter)');
 const c=B.candidates.find(c=>c.value===1250)!;assert.equal(c.methodCue,'plan_guided_measurement_term');assert.equal(c.subject?.name,'Lumora Vista QX9');assert.ok(c.planConditionIds272?.includes('luminance_measurement_metadata'));
 assert.equal(screenTestLead265(c,{url,sha256:sha(TV)}).ok,true,'a guided lead is still an unreviewed lead the store can screen');
 assert.equal(c.rankingAuthorized,false);assert.equal(c.scientificEvidenceAdmitted,false);assert.equal(B.planDigest272,plan.compiledFrom.digest);
 assert.equal(linkToMeasure272(plan,'peak HDR brightness in a 10% window','nits')?.measureId,'hdr_luminance_by_window_and_duration');
});

test('exploratory pass: what no rule anticipated becomes a research lead, never a candidate',()=>{
 const s=taught();const plan=compileExtractionPlan272(s,'televisions',['tv'],ALL);s.close();
 const x=testDocumentSubject268(extractSpecifications245(TV,url),'independent_original_test');
 const C=testLeadsFromHtml265(TV,url,sha(TV),x,{category:'televisions',plan,exploratory:true}).probe;
 assert.ok((C.exploratoryLeads272??[]).every(l=>l.status==='exploratory_research_lead'));
 assert.ok(!C.candidates.some(c=>c.value===2000||c.value===210),'a claim and a projection are never candidates');
 const E=testLeadsFromHtml265(TV,url,sha(TV),x,{category:'televisions',exploratory:true}).probe;
 const A0=testLeadsFromHtml265(TV,url,sha(TV),x,{category:'televisions'}).probe;
 assert.deepEqual(E.candidates.map(c=>c.id),A0.candidates.map(c=>c.id),'exploration without a plan adds no candidates');assert.ok((E.exploratoryLeads272??[]).some(l=>l.value===1250&&l.unit==='nits'));
});

test('a value binds to the product its own clause names; a single-mention typo makes no second product',()=>{
 const s=taught();const plan=compileExtractionPlan272(s,'televisions',['tv'],ALL);s.close();
 const html=page("'My pick': I tested the Lumora Q7 and Lumora Q8 side by side",'<h2>Lumora Q7 vs Lumora Q8 brightness</h2><p>I measured the Q8 at 694 nits at a 25% window (Q7: 775 nits).</p><p>The Q8 and Q7 were tested in our lab.</p>');
 const x=testDocumentSubject268(extractSpecifications245(html,url),'independent_original_test');
 const B=testLeadsFromHtml265(html,url,sha(html),x,{category:'televisions',plan}).probe;
 assert.deepEqual(B.candidates.map(c=>[c.value,c.subject?.name]).sort(),[[694,'Lumora Q8'],[775,'Lumora Q7']]);
 assert.ok(B.candidates.every(c=>c.subjectAssignment==='clause_named_model_unverified'));
 const typo=page('Zentra DW500X review','<h2>Zentra DW500X performance</h2><h2>Zentra DW50OX design</h2><p>We tested the Zentra DW500X.</p>');
 assert.deepEqual(documentMentions272(typo).map(m=>m.model),['DW500X']);
});

test('guided qualitative: two outcomes in contrast are two observations; no score; never retained by the store',()=>{
 const s=taught();const plan=compileExtractionPlan272(s,'televisions',['tv'],ALL);
 assert.equal(polarity272('black levels were not crushed'),'positive');assert.equal(polarity272('slightly crushed blacks'),'negative');
 const r=qualitativeObservations269(TV,{plan,page:{name:'Lumora Vista QX9',model:null}});
 const g=r.observations.filter(o=>o.outcome==='taught_dimension');
 assert.ok(g.some(o=>o.dimension272==='dark_room_cinema_picture'&&o.direction==='positive'),JSON.stringify(g.map(o=>[o.dimension272,o.direction])));
 assert.ok(g.some(o=>o.dimension272==='dark_room_cinema_picture'&&o.direction==='negative'),JSON.stringify(g.map(o=>[o.dimension272,o.direction])));
 assert.ok(g.every(o=>o.rankingInput===false&&!('score' in o)));
 const plain=qualitativeObservations269(TV);assert.equal(plain.observations.length,0,'without options the Phase271 reader is unchanged (no first-person cooking test here)');
 const x=testDocumentSubject268(extractSpecifications245(TV,url),'independent_original_test');
 const out=s.ingestObservation246({source:{sourceId:'src_lab',host:'www.lab.test',sourceType:'independent_original_test',sourceTypeBasis:'operator_asserted'},url,sha256:sha(TV),bytes:TV.length,httpStatus:200,
  fetchedAt:'2026-10-17T09:00:00.000Z',runId:'p272t',extractorVersion:'phase245@test',extraction:x,categoryHypotheses:['televisions'],qualitative270:{readerVersion:'phase272-test',observations:g}});
 assert.equal(out.qualitative270?.persisted,0,'taught-dimension codes are outside the Phase270 amendment and are withheld');
 assert.equal((s.db.prepare('SELECT count(*) c FROM qualitative_observations270').get() as {c:number}).c,0);
 s.close();
});
