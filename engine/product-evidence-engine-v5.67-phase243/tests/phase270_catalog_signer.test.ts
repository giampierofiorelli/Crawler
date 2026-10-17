import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {testLeadsFromHtml265,testDocumentSubject268} from '../src/phase265_test_measurements.js';
import {validateTestMeasurements268,VALIDATION_POLICY268,VALIDATION_POLICY268_R1,SCORING_POLICY268,SCORING_POLICY268_R1,type ValidationPolicy268} from '../src/phase268_evidence_validation.js';
import {verifySignedCatalog181} from '../src/phase181_dynamic_knowledge_ranking.js';
import {signCompiledCatalog270,evaluationSigningKey270,productionSigningKey270,assertProductionAuthority270,EVALUATION_SIGNING_POLICY270} from '../src/phase270_catalog_signer.js';

// Phase270 §6. FICTIONAL publisher, product and value; evaluation credentials only (generated in memory here).
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee270s-'));
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const HOST='www.fryerlab.test';
const policy:ValidationPolicy268={...VALIDATION_POLICY268,qualifiedPublishers:[{...VALIDATION_POLICY268.qualifiedPublishers[0],host:HOST}]};
function run(vp=policy){
 const s=new KnowledgeStore246(join(dir,'s.sqlite'),CLASS);seedCategoryHypotheses246(s,'air_fryers','2026-10-16T08:00:00.000Z');
 const name='Zephyrine Crisp 3 ZC300X Air Fryer';
 const html=`<html><head><meta property="og:type" content="article" /><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name:`${name} review: A fictional tagline`})}</script></head><body><h1>${name} review: A fictional tagline</h1><h2>How I tested the fryer</h2><p>Before any cooking, the first thing I do is test the power consumption by running it empty for 1 hour at 200&deg;C, using a plug-in power meter to record usage. If it has two drawers, I will run both.</p><p>One hour&rsquo;s usage at 200&deg;C consumed 0.512 kWh of electricity.</p></body></html>`;
 const url=`https://${HOST}/reviews/zephyr-review`;const x=testDocumentSubject268(extractSpecifications245(html,url),'independent_original_test');
 s.ingestObservation246({source:{sourceId:'src_fryerlab',host:HOST,sourceType:'independent_original_test',sourceTypeBasis:'operator_asserted'},url,sha256:sha(html),bytes:html.length,httpStatus:200,
  fetchedAt:'2026-10-16T09:00:00.000Z',runId:'run_270s',extractorVersion:'phase245@test',extraction:x,categoryHypotheses:['air_fryers'],testLeads:testLeadsFromHtml265(html,url,sha(html),x)});
 const product=(id:string)=>{const r=s.db.prepare('SELECT name,declared_model FROM products WHERE product_id=?').get(id) as {name:string|null;declared_model:string|null}|undefined;return r?{name:r.name,declaredModel:r.declared_model}:null;};
 const v=validateTestMeasurements268(s.testMeasurements265(),product,vp);
 const ids=(s.db.prepare('SELECT product_id FROM products').all() as {product_id:string}[]).map(r=>r.product_id);s.close();
 return {validation:v,scoring:SCORING_POLICY268,validationPolicy:vp,categoryId:'air_fryers',market:'uk',discoveredVariantIds:ids,reviewedAt:'2026-10-16T12:00:00Z',expiresAt:'2026-10-23T12:00:00Z'};
}

test('the signer compiles and signs only under the signing policy; the envelope verifies through the consumer verification',()=>{
 const input=run();assert.equal(input.validation.validated.length,1);
 const key=evaluationSigningKey270('unit_test');const r=signCompiledCatalog270(input,EVALUATION_SIGNING_POLICY270,key);
 assert.ok(r.ok);if(!r.ok)return;
 assert.equal(r.envelope.keyId,'eval_unit_test');
 assert.ok(verifySignedCatalog181(r.envelope,{publicKeys:{eval_unit_test:key.publicKeyPem},asOf:'2026-10-17T00:00:00Z',market:'uk'},{categoryId:'air_fryers'}).ok);
 assert.deepEqual([r.audit.validationRevision,r.audit.scoringRevision,r.audit.environment],['pee268-test-evidence-validation:r2','pee268-energy-scoring:r2','evaluation']);
 // No key material anywhere in what the signer returns or the handle serialises to.
 const out=JSON.stringify([r,key]);assert.ok(!/PRIVATE KEY/.test(out));assert.ok(!JSON.stringify(r.audit).includes('0.512'),'the audit holds digests, not values');
});

test('the signer refuses every input outside policy: revision, category, market, validity, empty runs, environment',()=>{
 const key=evaluationSigningKey270('unit_test');const base=run();
 const refuse=(why:string,input:Parameters<typeof signCompiledCatalog270>[0],reason:string,pol=EVALUATION_SIGNING_POLICY270,k=key)=>{
  const r=signCompiledCatalog270(input,pol,k);assert.equal(r.ok,false,why);if(!r.ok)assert.equal(r.reason,reason,why);};
 const r1=run({...VALIDATION_POLICY268_R1,qualifiedPublishers:[{...VALIDATION_POLICY268_R1.qualifiedPublishers[0],host:HOST}]});
 refuse('r1 validation policy',r1,'validation_revision_not_permitted');
 refuse('r1 scoring policy',{...base,scoring:SCORING_POLICY268_R1},'scoring_revision_not_permitted');
 refuse('validation run from another revision than the one named',{...base,validationPolicy:{...base.validationPolicy,revision:3}},'validation_revision_not_permitted',{...EVALUATION_SIGNING_POLICY270,validationRevisions:['pee268-test-evidence-validation:r3']});
 refuse('category out of scope',{...base,categoryId:'kettles'},'category_out_of_scope');
 refuse('market out of scope',{...base,market:'au'},'market_out_of_scope');
 refuse('validity longer than policy',{...base,expiresAt:'2026-11-30T12:00:00Z'},'validity_exceeds_policy');
 refuse('inverted validity',{...base,expiresAt:'2026-10-15T12:00:00Z'},'validity_interval_invalid');
 refuse('nothing validated',{...base,validation:{...base.validation,validated:[]}},'nothing_to_sign');
 refuse('production signing policy',base,'production_not_authorised',{...EVALUATION_SIGNING_POLICY270,environment:'production'});
 refuse('a key claiming evaluation without an eval_ id',base,'environment_mismatch',EVALUATION_SIGNING_POLICY270,{...key,keyId:'pee_prod_2026q4'});
 refuse('a production key handle',base,'production_not_authorised',EVALUATION_SIGNING_POLICY270,{...key,environment:'production'});
});

test('production signing is not activated, and a production authority cannot pin an evaluation key',()=>{
 assert.throws(()=>productionSigningKey270(),/production_signing_not_authorised/);
 assert.throws(()=>assertProductionAuthority270({publicKeys:{eval_x:'pem'},asOf:'2026-10-17T00:00:00Z',market:'uk'}),/evaluation_key_in_production_authority/);
 assert.doesNotThrow(()=>assertProductionAuthority270({publicKeys:{pee_prod_2026q4:'pem'},asOf:'2026-10-17T00:00:00Z',market:'uk'}));
});
