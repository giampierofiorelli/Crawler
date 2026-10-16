import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash,generateKeyPairSync,sign} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {probeTransientTestContent225} from '../src/phase225_transient_test_probe.js';
import {testLeadsFromHtml265,testDocumentSubject268} from '../src/phase265_test_measurements.js';
import {validateTestMeasurements268,compileCatalog268,points268,VALIDATION_POLICY268,SCORING_POLICY268,type ValidationPolicy268} from '../src/phase268_evidence_validation.js';
import {dynamicKnowledgeAnswer181} from '../src/phase181_dynamic_knowledge_ranking.js';
import {canonicalJson180} from '../src/phase180_reviewed_first_answer.js';
import {createDecision177,applyDecisionAction177} from '../src/phase177_decision_snapshot.js';

// Phase268: authentic-shaped review pages, but every product, host, value and sentence here is FICTIONAL and written for
// this test. They reproduce the defects found on real pages (2026-10-16): first-person singular testers, "&deg;",
// thousands separators, a rated power beside the result, results linked to the review's own protocol, two values in one
// sentence, review headlines marked up as the product name.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee268-'));let n=0;
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const HOST='www.fryerlab.test';
const review=(product:string,body:string)=>`<html><head><meta property="og:type" content="article" /><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name:`${product} review: A fictional tagline`})}</script></head><body><h1>${product} review: A fictional tagline</h1>${body}</body></html>`;
const PROTOCOL='<h2>How I tested the fryer</h2><p>Before any cooking, the first thing I do is test the power consumption by running it empty for 1 hour at 200&deg;C, using a plug-in power meter to record usage. If it has two drawers, I will run both.</p>';
const DOCS:Record<string,[string,string]>={
 zephyr:['Zephyrine Crisp 3 ZC300X Air Fryer',PROTOCOL+'<p>At 1,700W, it is not power hungry. One hour&rsquo;s usage at 200&deg;C consumed 0.512 kWh of electricity. At 25p per unit this costs 13p.</p>'],
 borealis:['Borealis Twin Oven Air Fryer',PROTOCOL+'<p>From cold, one hour&rsquo;s usage of both drawers at 200&deg;C consumed 1.104 kWh of electricity.</p>'],
 nimbus:['Nimbus Mini NM2 Air Fryer','<p>At 2,000W, from cold, one hour&rsquo;s usage at 200&deg;C consumed 0.633 kWh of electricity in our tests.</p>'],
 cirrus:['Cirrus Duo Air Fryer','<p>In tests, the Cirrus used just 0.91kWh at 200&ordm;C with both baskets running and 0.47kWh with a single basket running.</p>'],
 stratus:['Stratus Glass Air Fryer','<p>I measured its electricity usage using a power meter and, running it empty at 200&deg;C from cold, it showed a consumption rate of just 0.402kwh. That is 11p for a full hour of use.</p><p>In my cooking tests, 450g of chips cooked in 22 minutes.</p>'],
};
const url=(k:string)=>`https://${HOST}/reviews/${k}-review`;
function build(){
 const s=new KnowledgeStore246(join(dir,`s${++n}.sqlite`),CLASS);
 for(const [k,[name,body]] of Object.entries(DOCS)){const html=review(name,body);
  const x=testDocumentSubject268(extractSpecifications245(html,url(k)),'independent_original_test');
  s.ingestObservation246({source:{sourceId:'src_fryerlab',host:HOST,sourceType:'independent_original_test',sourceTypeBasis:'operator_asserted'},url:url(k),sha256:sha(html),
   bytes:html.length,httpStatus:200,fetchedAt:'2026-10-16T09:00:00.000Z',runId:'run_268',extractorVersion:'phase245@test',extraction:x,categoryHypotheses:['air_fryers'],
   testLeads:testLeadsFromHtml265(html,url(k),sha(html),x)});}
 const product=(id:string)=>{const r=s.db.prepare('SELECT name,declared_model FROM products WHERE product_id=?').get(id) as {name:string|null;declared_model:string|null}|undefined;
  return r?{name:r.name,declaredModel:r.declared_model}:null;};
 const ids=Object.fromEntries((s.db.prepare('SELECT product_id,name FROM products').all() as {product_id:string;name:string}[]).map(r=>[r.name,r.product_id]));
 return {s,product,ids};
}
const qualified:ValidationPolicy268={...VALIDATION_POLICY268,qualifiedPublishers:[{...VALIDATION_POLICY268.qualifiedPublishers[0],host:HOST}]};

test('extraction: first-person singular, entities, thousands separators, protocol-linked results, clause codes, rated power and test loads',()=>{
 const leads=(k:string)=>{const html=review(DOCS[k][0],DOCS[k][1]);return probeTransientTestContent225(html,url(k),{productLeads:[{name:'X',model:null,sku:null}]}).candidates;};
 const z=leads('zephyr');assert.deepEqual(z.map(c=>[c.value,c.unit,c.methodCue]),[[0.512,'kwh','energy_result_with_document_protocol']],'the rated 1,700W is not a result');
 assert.deepEqual([z[0].setpointC,z[0].conditionCodes,z[0].documentProtocolCodes],[200,['duration_1h','setpoint_c'],['all_compartments','duration_1h','load_empty','power_meter','setpoint_c']]);
 const ni=leads('nimbus');assert.deepEqual(ni.map(c=>[c.value,c.unit]),[[0.633,'kwh']],'"At 2,000W" is neither 0 W nor a result');
 const ci=leads('cirrus');assert.deepEqual(ci.map(c=>[c.value,c.conditionCodes]).sort(),[[0.47,['setpoint_c','single_compartment']],[0.91,['all_compartments','setpoint_c']]]);
 const st=leads('stratus');assert.deepEqual(st.map(c=>[c.value,c.unit]).sort(),[[0.402,'kwh'],[22,'minutes']],'450g "of chips" is the test load');
 assert.ok(st.find(c=>c.unit==='kwh')!.conditionCodes!.includes('conditions_from_block'),'the hour is stated in the next sentence of the block');
 assert.deepEqual(leads('borealis')[0].conditionCodes,['all_compartments','duration_1h','from_cold','setpoint_c']);
 // A sentence with no first-person cue and no protocol in the document yields nothing (conservative).
 assert.deepEqual(probeTransientTestContent225(review('Quiet Q1',`<p>One hour&rsquo;s usage at 200&deg;C consumed 0.7 kWh.</p>`),url('q'),{}).candidates,[]);
});

test('a review headline is not a product identity; the subject and a single model code are; other pages are unchanged',()=>{
 const x=extractSpecifications245(review('Zephyrine Crisp 3 ZC300X Air Fryer','<p>x</p>'),url('zephyr'));
 assert.equal(testDocumentSubject268(x,'independent_original_test')!.mainProduct.name,'Zephyrine Crisp 3 ZC300X Air Fryer');
 assert.equal(testDocumentSubject268(x,'independent_original_test')!.mainProduct.identifiers.model,'ZC300X');
 assert.equal(testDocumentSubject268(x,'retailer'),x,'only test documents');
 const two=extractSpecifications245(review('Ketto AB12 versus CD34','<p>x</p>'),url('two'));
 assert.equal(testDocumentSubject268(two,'independent_original_test')!.mainProduct.identifiers.model,undefined,'two model codes: none chosen');
 const plain=extractSpecifications245(review('Zephyrine Crisp 3','<p>x</p>').replace(/ review: A fictional tagline/g,''),url('p'));
 assert.equal(testDocumentSubject268(plain,'independent_original_test'),plain);
});

test('store v6 keeps the condition codes; validation applies the protocol, names every rejection, never writes back',()=>{
 const {s,product,ids}=build();const rows=s.testMeasurements265();
 assert.equal(s.schemaVersion(),6);
 const z=rows.find(r=>r.productId===ids['Zephyrine Crisp 3 ZC300X Air Fryer'])!;assert.deepEqual([z.setpointC,z.protocolCodes.includes('load_empty')],[200,true]);
 const v=validateTestMeasurements268(rows,product,qualified);
 const valid=Object.fromEntries(v.validated.map(x=>[x.productName,x.value]));
 assert.deepEqual(valid,{'Zephyrine Crisp 3 ZC300X Air Fryer':0.512,'Borealis Twin Oven Air Fryer':1.104,'Stratus Glass Air Fryer':0.402});
 const why=(name:string)=>v.rejected.filter(r=>r.productId===ids[name]).map(r=>[r.value,r.reasons]);
 assert.deepEqual(why('Nimbus Mini NM2 Air Fryer'),[[0.633,['load_not_established']]]);
 assert.deepEqual(why('Cirrus Duo Air Fryer').sort(),[[0.47,['duration_not_stated','load_not_established','single_compartment_value']],[0.91,['duration_not_stated','load_not_established']]]);
 assert.deepEqual(why('Stratus Glass Air Fryer'),[[22,['measurand_not_in_protocol']]]);
 assert.ok(v.validated.every(x=>x.independenceEstablished===false&&x.humanReviewed===false&&x.policyStatus==='proposed_not_authorised'));
 // Alternatives: the publisher's recorded protocol admits the silent review; an unqualified publisher admits nothing.
 assert.equal(validateTestMeasurements268(rows,product,{...qualified,protocols:qualified.protocols.map(p=>({...p,load:'stated_or_publisher_protocol' as const}))}).validated.length,4);
 assert.equal(validateTestMeasurements268(rows,product,VALIDATION_POLICY268).validated.length,0);
 assert.equal(validateTestMeasurements268(rows,product,{...qualified,identity:{requireDeclaredModelCode:true}}).validated.length,1);
 assert.ok(s.testMeasurements265().every(r=>r.verification==='unreviewed'&&r.rankingAuthorized===false),'nothing promoted in the store');
 // Duplicates count once; conflicting values are all withheld.
 const dup=validateTestMeasurements268([z,{...z,measurementId:'tm_dup'}],product,qualified);assert.deepEqual([dup.validated.length,dup.rejected[0].reasons],[1,['duplicate_of_another_revision']]);
 const con=validateTestMeasurements268([z,{...z,measurementId:'tm_con',value:0.6}],product,qualified);assert.deepEqual([con.validated.length,con.rejected.map(r=>r.reasons[0])],[0,['conflicting_values_for_product','conflicting_values_for_product']]);
 s.close();
});

test('scoring is fixed and monotone; the compiled catalog is accepted by the existing Phase181 engine only when signed by a pinned key',()=>{
 const d=SCORING_POLICY268.dimensions[0];
 assert.deepEqual([points268(0,d),points268(0.5,d),points268(1,d),points268(2,d),points268(3,d)],[10000,7500,5000,0,0]);
 const {s,product}=build();
 const v=validateTestMeasurements268(s.testMeasurements265(),product,qualified);
 const all=(s.db.prepare('SELECT product_id FROM products').all() as {product_id:string}[]).map(r=>r.product_id);
 const cat=compileCatalog268(v,SCORING_POLICY268,{categoryId:'air_fryers',market:'uk',discoveredVariantIds:all,reviewedAt:'2026-10-16T12:00:00Z',expiresAt:'2026-10-23T12:00:00Z',validationPolicy:qualified});
 const k=generateKeyPairSync('ed25519'),rogue=generateKeyPairSync('ed25519');
 const authority={publicKeys:{evaluation_key:k.publicKey.export({type:'spki',format:'pem'}).toString()},asOf:'2026-10-16T13:00:00Z',market:'uk'};
 let snap=createDecision177('request_268');
 snap=applyDecisionAction177(snap,{type:'set_scope',source:'user_request_statement',scope:{task:'product_selection',category:'air_fryers'}}).snapshot;
 snap=applyDecisionAction177(snap,{type:'state_in_request',source:'user_request_statement',key:d.key,label:d.label,value:{kind:'boolean',value:true} as never,priority:'high',referenceHash:sha('little electricity')}).snapshot;
 const env=(key=k)=>({catalog:cat,keyId:'evaluation_key',signatureBase64:sign(null,Buffer.from(canonicalJson180(cat)),key.privateKey).toString('base64')});
 const r=dynamicKnowledgeAnswer181({snapshot:snap,catalog:env(),authority});
 assert.equal(r.status,'ranking_ready');
 assert.deepEqual(r.ranked.map(x=>x.name),['Stratus Glass Air Fryer','Zephyrine Crisp 3 ZC300X Air Fryer','Borealis Twin Oven Air Fryer'],'lower measured energy ranks first');
 assert.ok(r.ranked.every(x=>x.sourceUrls.length===1&&x.sourceUrls[0].startsWith(`https://${HOST}/`)),'each rank cites its test');
 assert.equal(dynamicKnowledgeAnswer181({snapshot:snap,catalog:env(rogue),authority}).status,'research_required','an unpinned signer ranks nothing');
 assert.ok(cat.externalReviewReference.startsWith('not_externally_reviewed'),'the catalog says it is not externally reviewed');
 s.close();
});
