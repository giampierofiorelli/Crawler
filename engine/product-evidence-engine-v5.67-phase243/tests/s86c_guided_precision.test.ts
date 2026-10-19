import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {SOURCES272} from '../src/phase272_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {compileExtractionPlan272} from '../src/phase272_extraction_plan.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {testLeadsFromHtml265,testDocumentSubject268,screenTestLead265,readingConfiguration265,readingIdentity265,pageProductLead265,subjectAssociation265} from '../src/phase265_test_measurements.js';
import {observationRole86c,otherProductInClause86c,bareValue86c} from '../src/phase225_transient_test_probe.js';

// S86c (owner: knowledge-guided discovery with per-observation role and attribution controls, shadow). Every page, product and
// value is FICTIONAL.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee86c-'));let n=0;
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
function taught(){const s=new KnowledgeStore246(join(dir,`p${++n}.sqlite`),CLASS);registerTeachingSources252([...SOURCES271,...SOURCES272]);
 applyTeaching252(s,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271],'2026-10-17T08:00:00.000Z');return s;}
const role=(sent:string,value:string,dim:string)=>{const i=sent.indexOf(value);return observationRole86c(sent,i,i+value.length,dim).role;};

test('S86c role of one observation in its own clause: result, condition, preset, declaration, certified, derived, unresolved',()=>{
 assert.equal(role('In our test it cleared the room in 24 minutes.','24 minutes','duration'),'measured_result');
 assert.equal(role('I set it to 200°C for 15 minutes.','15 minutes','duration'),'test_condition');
 assert.equal(role('I set it to 200°C for 15 minutes.','200°C','temperature'),'test_condition');
 assert.equal(role('The basket reached 212°C at the rack in our test.','212°C','temperature'),'measured_result','a measuring verb makes a temperature a result');
 assert.equal(role('The bake programme defaulted to 25 minutes.','25 minutes','duration'),'programme_preset');
 assert.equal(role('This was pre-set to 200°C, and 10 minutes.','10 minutes','duration'),'programme_preset','a clause opened by "and" continues the previous one');
 assert.equal(role('It used 0.41 kWh in our test.','0.41 kWh','energy'),'measured_result');
 assert.equal(role('I used this to cook a 1.5kg chicken.','1.5kg','mass'),'test_condition','the verb nearest the value decides');
 assert.equal(role('AHAM PM2.5 CADR: 287 cfm','287 cfm','airflow'),'certified_or_quoted','a label before a colon belongs to its value');
 assert.equal(role('Its lab-reported CADR is 130 cfm.','130 cfm','airflow'),'declared_spec');
 assert.equal(role('That works out at around 250kWh a year.','250kWh','energy'),'unresolved');
 assert.equal(role('Frozen chips usually take 25 minutes in the oven.','25 minutes','duration'),'unresolved','a generic statement is not this test');
 assert.equal(role('Based on its CADR, it suits rooms of 459 sq ft.','459','area'),'derived');
});

test('S86c subject: another product, another version or another tester withholds the page product; partial own names do not',()=>{
 const c=(t:string,v:string,subj:string)=>{const j=t.indexOf(v);return otherProductInClause86c(t,j,j+v.length,subj);};
 assert.equal(c('It took the SA600 just 24 minutes in our test.','24','Smart Air SA600'),false);
 assert.equal(c('One hour of usage at 200°C consumed 1.2kWh of electricity.','1.2kWh','Example Drawer Fryer'),false,'a unit capital (°C) is not a product name (S86c four-set check: a legacy result was lost)');
 assert.equal(c('Our Brightair Zen sensor shows the ProX needed 13 minutes.','13','Coway Airmega ProX'),false,'the name nearest the value decides');
 assert.equal(c('Faster than the Levoit Vital 100S (37 minutes), the Mila (38 minutes) and others.','38','Smart Air SA600'),true);
 assert.equal(c('taking 49 minutes vs the 40 minutes achieved by the cheaper Core 300','40','Levoit Vital 100'),true);
 assert.equal(c('The SA600 v1 offered good cleaning at its top speed (56 db).','56','Smart Air SA600'),true,'another version is another variant');
 assert.equal(otherProductInClause86c('Philips 3000i (Speed 2)',23,23,'Smart Air SA600',{wholeLabel:true}),true);
 assert.equal(otherProductInClause86c('Smart Air SA600 (Speed 3)',25,25,'Smart Air SA600',{wholeLabel:true}),false);
 assert.equal(otherProductInClause86c('Energy consumption eco clean',28,28,'Example Dishwasher DW60',{wholeLabel:true}),false,'a row label is not a product name');
 assert.equal(bareValue86c('130 CFM (221 m³/h)'),true);assert.equal(bareValue86c('Philips 3000i (Speed 2)'),false);
});

const page=(title:string,body:string)=>`<html><head><meta property="og:type" content="article" /><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name:title})}</script></head><body><h1>${title}</h1>${body}</body></html>`;
const AP=page('Aerona Pure AP500 review',
 '<p>We tested the Aerona Pure AP500 in our 700 cubic foot test room, burning incense and timing how long it took to clean the air.</p>'+
 '<p>The Aerona Pure AP500 cleared our test room of particles in 24 minutes at its top fan speed.</p>'+
 '<p>That is faster than the Brightline Zephyr 20 (31 minutes) in the same test.</p>'+
 '<p>The AP500 v1 we reviewed last year generated 58 dBA at top speed in our noise test.</p>'+
 '<p>Its lab-reported CADR is 210 cfm, and AHAM lists a dust CADR of 205 cfm.</p>'+
 '<p>In our noise test the AP500 hit 49 dBA at top speed.</p>'+
 '<p>Summary: it cleared our test room in 24 minutes.</p>'+
 '<p>The model code AP500B0G is printed on the base.</p>'+
 '<h2>The specifications</h2><table><tbody><tr><td>Clean air delivery rate (CADR):</td></tr><tr><td>215 CFM</td></tr></tbody></table>'+
 '<h2>Noise test results</h2><table><thead><tr><th>Air purifier</th><th>Noise</th></tr></thead><tbody>'+
 '<tr><td>Aerona Pure AP500 (Speed 3)</td><td>44.1 dBA</td></tr><tr><td>Brightline Zephyr 20 (Speed 3)</td><td>47.9 dBA</td></tr></tbody></table>');
const url='https://www.aerona-lab.test/aerona-pure-ap500-review';

test('S86c guided reading on a fictional page: precision controls versus the S86b plan reading (shadow; production path unchanged)',()=>{
 const s=taught();const plan=compileExtractionPlan272(s,'air_purifiers',['air purifier'],['dishwashers','air_purifiers']);
 const x=testDocumentSubject268(extractSpecifications245(AP,url),'independent_original_test');const pageLead=pageProductLead265(x);
 const read=(o:object)=>{const tl=testLeadsFromHtml265(AP,url,sha(AP),x,{category:'air_purifiers',plan,...o});
  return {tl,leads:tl.probe.candidates.map(c=>{const r=screenTestLead265(c,{url,sha256:sha(AP)});return r.ok?{v:r.lead.value,u:r.lead.unit,page:subjectAssociation265(r.lead,pageLead)!=='subject_unresolved'}:null;}).filter(Boolean) as {v:number;u:string;page:boolean}[]};};
 const plain=read({}).leads,guided=read({precision86c:{}});
 const onPage=(l:typeof plain)=>l.filter(x=>x.page).map(x=>x.v).sort((a,b)=>a-b);
 // the uncontrolled plan reading puts other products' and other variants' results, and declarations, on the page product
 assert.ok(onPage(plain).some(v=>[31,58,210,205].includes(v)),'baseline shows the failure the controls address: '+JSON.stringify(onPage(plain)));
 const g=onPage(guided.leads);
 for(const v of [31,58,47.9])assert.ok(!g.includes(v),`another product's or variant's result ${v} is never on the page product: ${JSON.stringify(g)}`);
 for(const v of [210,205,215,0])assert.ok(!guided.leads.some(x=>x.v===v),`a declared, certified or model-code value ${v} is never a result`);
 for(const v of [24,49])assert.ok(g.includes(v),`the page product's own result ${v} is kept: ${JSON.stringify(g)}`);
 assert.equal(guided.leads.filter(x=>x.v===24).length,1,'one result read twice is offered once');
 assert.ok((guided.tl.probe.repeatedReadings86c??0)>=1);
 const roles=new Set((guided.tl.probe.classifiedObservations86c??[]).map(r=>r.role));
 assert.ok(roles.has('certified_or_quoted')&&roles.has('declared_spec'),'set-aside values keep their role: '+JSON.stringify([...roles]));
 assert.ok(guided.leads.some(x=>x.v===31&&!x.page),'another product\'s result is kept, unresolved, not discarded');
 // reading identity: the controls are part of the reading configuration, so their rows never collide with plan rows
 const a=readingIdentity265(readingConfiguration265({plan})!),b=readingIdentity265(readingConfiguration265({plan,precision86c:{}})!),c=readingIdentity265(readingConfiguration265({plan,precision86c:{role:false}})!);
 assert.notEqual(a,b);assert.notEqual(b,c);assert.equal(guided.tl.extractorVersion,b);
 // the production reading (no plan) has no controls and is unchanged by them
 const prod=testLeadsFromHtml265(AP,url,sha(AP),x,{category:'air_purifiers',precision86c:{}});const prod0=testLeadsFromHtml265(AP,url,sha(AP),x,{category:'air_purifiers'});
 assert.deepEqual(prod.probe.candidates,prod0.probe.candidates);assert.equal(prod.extractorVersion,prod0.extractorVersion);
 // persisted through the real ingestion: the page product gets only its own results
 const out=s.ingestObservation246({source:{sourceId:'src_aerona',host:'www.aerona-lab.test',sourceType:'independent_original_test',sourceTypeBasis:'operator_asserted'},url,sha256:sha(AP),bytes:AP.length,httpStatus:200,
  fetchedAt:'2026-10-17T09:00:00.000Z',runId:'s86c',extractorVersion:'phase245@test',extraction:x,categoryHypotheses:['air_purifiers'],testLeads:guided.tl});
 const rows=s.db.prepare("SELECT value,product_id FROM test_measurements265 WHERE revision_id=? AND state='current'").all(out.revisionId) as {value:number;product_id:string|null}[];
 assert.ok(rows.length>0);
 for(const r of rows)if([31,58,47.9].includes(r.value))assert.equal(r.product_id,null,`stored ${r.value} is not attached to the page product`);
 s.close();
});
