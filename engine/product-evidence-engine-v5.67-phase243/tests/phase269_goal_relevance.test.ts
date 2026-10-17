import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash,generateKeyPairSync,sign} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {testLeadsFromHtml265,testDocumentSubject268} from '../src/phase265_test_measurements.js';
import {validateTestMeasurements268,compileCatalog268,VALIDATION_POLICY268,VALIDATION_POLICY268_R1,SCORING_POLICY268,SCORING_POLICY268_R1,type ValidationPolicy268} from '../src/phase268_evidence_validation.js';
import {canonicalJson180} from '../src/phase180_reviewed_first_answer.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {applyLessons250,ADOPTED_LESSONS250} from '../src/phase250_category_lessons.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {AIR_FRYER_TEACHING269,RESEARCH_SOURCES269} from '../src/phase269_research_teaching.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {runJourney248} from '../src/phase248_advisory_journey.js';
import {qualitativeObservations269} from '../src/phase269_qualitative_observations.js';

// Phase269: every product, host, value and sentence here is FICTIONAL and written for this test. The scenario mirrors
// the Phase268 finding: a fixed one-hour empty-run energy measurement exists for some air fryers and is a proxy, not the
// energy to cook a meal, and not cooking quality.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee269-'));let n=0;
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const HOST='www.fryerlab.test';
const review=(product:string,body:string)=>`<html><head><meta property="og:type" content="article" /><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name:`${product} review: A fictional tagline`})}</script></head><body><h1>${product} review: A fictional tagline</h1>${body}</body></html>`;
const PROTOCOL='<h2>How I tested the fryer</h2><p>Before any cooking, the first thing I do is test the power consumption by running it empty for 1 hour at 200&deg;C, using a plug-in power meter to record usage. If it has two drawers, I will run both.</p>';
const DOCS:Record<string,[string,string]>={
 zephyr:['Zephyrine Crisp 3 ZC300X Air Fryer',PROTOCOL+'<p>One hour&rsquo;s usage at 200&deg;C consumed 0.512 kWh of electricity.</p>'],
 stratus:['Stratus Glass Air Fryer','<p>I measured its electricity usage using a power meter and, running it empty at 200&deg;C from cold, it showed a consumption rate of just 0.402kwh. That is 11p for a full hour of use.</p>'],
};
const policy:ValidationPolicy268={...VALIDATION_POLICY268,qualifiedPublishers:[{...VALIDATION_POLICY268.qualifiedPublishers[0],host:HOST}]};
const policyR1:ValidationPolicy268={...VALIDATION_POLICY268_R1,qualifiedPublishers:[{...VALIDATION_POLICY268_R1.qualifiedPublishers[0],host:HOST}]};
function world(teach=true){
 const s=new KnowledgeStore246(join(dir,`s${++n}.sqlite`),CLASS);
 seedCategoryHypotheses246(s,'air_fryers','2026-10-16T08:00:00.000Z');applyLessons250(s,ADOPTED_LESSONS250,'2026-10-16T08:00:00.000Z');
 if(teach){registerTeachingSources252(RESEARCH_SOURCES269);applyTeaching252(s,[AIR_FRYER_TEACHING269],'2026-10-16T08:30:00.000Z');}
 for(const [k,[name,body]] of Object.entries(DOCS)){const html=review(name,body);const url=`https://${HOST}/reviews/${k}-review`;
  const x=testDocumentSubject268(extractSpecifications245(html,url),'independent_original_test');
  s.ingestObservation246({source:{sourceId:'src_fryerlab',host:HOST,sourceType:'independent_original_test',sourceTypeBasis:'operator_asserted'},url,sha256:sha(html),
   bytes:html.length,httpStatus:200,fetchedAt:'2026-10-16T09:00:00.000Z',runId:'run_269',extractorVersion:'phase245@test',extraction:x,categoryHypotheses:['air_fryers'],
   testLeads:testLeadsFromHtml265(html,url,sha(html),x)});}
 return s;
}
const keys=generateKeyPairSync('ed25519');
function ranking(s:KnowledgeStore246,r1=false){
 const product=(id:string)=>{const r=s.db.prepare('SELECT name,declared_model FROM products WHERE product_id=?').get(id) as {name:string|null;declared_model:string|null}|undefined;return r?{name:r.name,declaredModel:r.declared_model}:null;};
 const vp=r1?policyR1:policy;const v=validateTestMeasurements268(s.testMeasurements265(),product,vp);
 const all=(s.db.prepare('SELECT product_id FROM products').all() as {product_id:string}[]).map(r=>r.product_id);
 const cat=compileCatalog268(v,r1?SCORING_POLICY268_R1:SCORING_POLICY268,{categoryId:'air_fryers',market:'uk',discoveredVariantIds:all,reviewedAt:'2026-10-16T12:00:00Z',expiresAt:'2026-10-23T12:00:00Z',validationPolicy:vp});
 return {catalog:{catalog:cat,keyId:'k',signatureBase64:sign(null,Buffer.from(canonicalJson180(cat)),keys.privateKey).toString('base64')},
  authority:{publicKeys:{k:keys.publicKey.export({type:'spki',format:'pem'}).toString()},asOf:'2026-10-16T13:00:00Z',market:'uk'}};
}
const Q='Which air fryer gives the best cooking results for one person while using relatively little electricity?';

test('a proxy never ranks: even a catalog that labels the empty-run metric as the need cannot produce a recommendation',()=>{
 const s=world();const a=adviseFromRequest253(Q,s,CATEGORY_REGISTRY250,{ranking:ranking(s,true)});
 assert.notEqual(a.response,'ranked_recommendation');assert.equal(a.ordered,false);
 const e=a.goalAssessment!.outcomes.find(o=>o.need==='low_energy_use')!;
 assert.deepEqual([e.coverage,e.relevantMeasures,e.rejectedProxies.includes('energy_empty_run'),e.incomparable],['proxy_only',['energy_per_cooking_task'],true,['energy_empty_run']]);
 assert.deepEqual(e.requiredConditions,['compartments_in_use','completed_doneness','same_food_load']);
 assert.ok(a.unassessedObjectives.includes('low_energy_use')&&a.unassessedObjectives.includes('cooking_results'));
 // Phase270: without the teaching, the same catalog no longer ranks: absence of category knowledge is not permission
 // (Phase269 still ranked here; that permissive rule is the defect the owner review identified).
 const u=world(false);const ua=adviseFromRequest253(Q,u,CATEGORY_REGISTRY250,{ranking:ranking(u,true)});
 assert.notEqual(ua.response,'ranked_recommendation');assert.equal(ua.rankingAuthorized,false);
 s.close();u.close();
});

test('r2: the proxy is shown separately as a partial comparison with raw values, direction, and limitations in the answer',()=>{
 const s=world();const a=adviseFromRequest253(Q,s,CATEGORY_REGISTRY250,{ranking:ranking(s)});
 const g=a.goalAssessment!;assert.equal(g.decision,'partial_comparison');
 assert.deepEqual(g.partialComparison!.items.map(i=>[i.name,i.value,i.unit,i.variantVerified]),[['Stratus Glass Air Fryer',0.402,'kwh',false],['Zephyrine Crisp 3 ZC300X Air Fryer',0.512,'kwh',true]]);
 assert.ok(a.statements.some(x=>/^Partial comparison only, not a recommendation/.test(x)&&/0\.402 kWh; variant not verified/.test(x)));
 assert.ok(a.statements.some(x=>/does not show the electricity needed to cook a meal/.test(x)));
 assert.ok(a.limitations.some(x=>/^Stratus Glass Air Fryer: the tester names the product without a model code/.test(x)));
 assert.ok(a.statements.some(x=>/^What would answer this: .*energy per cooking task \(compartments in use, completed doneness, same food load\)/.test(x)));
 s.close();
});

test('stated use and owned equipment change the decision: one drawer makes the whole-appliance metric incomparable; an oven makes it a no-purchase check',()=>{
 const s=world();const r=ranking(s);
 const one=adviseFromRequest253('I live alone and would only ever use one drawer of a dual air fryer. Which air fryer uses little electricity?',s,CATEGORY_REGISTRY250,{ranking:r});
 assert.equal(one.goalAssessment!.decision,'research');assert.equal(one.goalAssessment!.partialComparison,undefined);
 assert.ok(one.goalAssessment!.outcomes.find(o=>o.need==='low_energy_use')!.incomparable.includes('compartments_in_use'));
 assert.ok(one.statements.some(x=>/cannot answer a question about using one drawer/.test(x)));
 const oven=adviseFromRequest253('I already have a fan oven. Is an air fryer actually cheaper to run, or should I keep using the oven?',s,CATEGORY_REGISTRY250,{ranking:r});
 assert.equal(oven.goalAssessment!.decision,'no_purchase_check');assert.ok(oven.statements.some(x=>/buying may not be necessary/.test(x)));
 s.close();
});

test('exact-variant integrity: only a model code in the tested subject earns exact-variant scope; similar names stay separate products',()=>{
 const s=world();const cat=ranking(s).catalog.catalog;
 const scope=Object.fromEntries(cat.originalTests.map(t=>[(s.db.prepare('SELECT name FROM products WHERE product_id=?').get(t.variantId) as {name:string}).name,t.scope]));
 assert.deepEqual(scope,{'Zephyrine Crisp 3 ZC300X Air Fryer':'exact_variant_original_professional_test','Stratus Glass Air Fryer':'named_product_original_professional_test'});
 // Negative controls: a family/range headline and a two-model comparison name no single model code.
 const x=(name:string)=>testDocumentSubject268(extractSpecifications245(review(name,'<p>x</p>'),`https://${HOST}/r/${sha(name).slice(0,6)}`),'independent_original_test')!;
 assert.equal(x('Zephyrine Crisp range').mainProduct.identifiers.model,undefined);
 assert.equal(x('Zephyrine ZC300X versus ZC300XL').mainProduct.identifiers.model,undefined);
 assert.equal(x('Zephyrine Crisp 3 ZC300XEU Air Fryer').mainProduct.identifiers.model,'ZC300XEU','a regional code is its own model code');
 // A regional variant reviewed separately is a separate product (never merged on a similar name).
 const html=review('Zephyrine Crisp 3 ZC300XEU Air Fryer','<p>x</p>');const url=`https://${HOST}/reviews/zephyr-eu-review`;
 const ex=testDocumentSubject268(extractSpecifications245(html,url),'independent_original_test');
 const r=s.ingestObservation246({source:{sourceId:'src_fryerlab',host:HOST,sourceType:'independent_original_test',sourceTypeBasis:'operator_asserted'},url,sha256:sha(html),bytes:html.length,
  httpStatus:200,fetchedAt:'2026-10-16T09:05:00.000Z',runId:'run_269',extractorVersion:'phase245@test',extraction:ex,categoryHypotheses:['air_fryers'],testLeads:testLeadsFromHtml265(html,url,sha(html),ex)});
 const uk=(s.db.prepare("SELECT product_id FROM products WHERE declared_model='ZC300X'").get() as {product_id:string}).product_id;
 assert.notEqual(r.productIds[0],uk);
 s.close();
});

test('teaching is data in the existing store (idempotent, hypotheses only); measurement concepts have no aliases and are never needs',()=>{
 const s=world();const again=applyTeaching252(s,[AIR_FRYER_TEACHING269],'2026-10-16T08:40:00.000Z');
 assert.deepEqual([again.itemsAdded,again.items,again.relations],[0,0,0]);
 const m=s.categoryItems246('air_fryers').filter(i=>i.concept?.kind==='measurement');
 assert.ok(m.length>=10&&m.every(i=>i.concept!.aliases.length===0&&i.knowledgeClass==='technical_hypothesis'));
 assert.throws(()=>s.addCategoryItem246({categoryId:'air_fryers',section:'quality_measurements',statement:'x measurement',knowledgeClass:'technical_hypothesis',
  provenance:'assistant_authored_unreviewed',concept:{kind:'measurement',id:'m_bad',aliases:['crispy']}}),/246_invalid_concept/);
 assert.ok(!runJourney248('I want energy per cooking task from an air fryer',s,CATEGORY_REGISTRY250).stages.need.concepts.some(c=>c.id==='energy_per_cooking_task'));
 s.close();
});

test('request parsing fixes: predicate after the category, an outcome obtained from a category, a gapped match never hides a contiguous one',()=>{
 const s=world();const j=(t:string)=>runJourney248(t,s,CATEGORY_REGISTRY250);
 assert.equal(j('Which air fryer actually cooks fish evenly?').stages.category.categoryId,'air_fryers');
 assert.equal(j('I want the crunchiest roast potatoes possible from an air fryer. What should I buy?').stages.category.categoryId,'air_fryers');
 assert.ok(j('Which air fryer gives the best cooking results for one person?').stages.need.concepts.some(c=>c.id==='cooking_results'));
 s.close();
});

test('qualitative pilot: codes only (no text), negation and hedges kept, method paragraphs skipped, never ranking input',()=>{
 const html='<html><body><p>How I test: I note how crispy the chips are and how evenly they brown in every model.</p>'+
  '<p>I cooked frozen hash browns first. Once cooked, they were crisp and not soggy, while most but not all had golden corners.</p>'+
  '<p>Next I made chicken legs for the second test. The chicken was cooked through with clear juices and mostly crisp skin.</p></body></html>';
 const {observations:o}=qualitativeObservations269(html);
 const k=o.map(x=>[x.dish,x.outcome,x.direction,x.strength].join(':'));
 for(const want of ['hash_browns:crispness:positive:explicit','hash_browns:browning:mixed:hedged','chicken:doneness:positive:explicit'])assert.ok(k.includes(want),want);
 assert.ok(!o.some(x=>x.blockIndex===0),'the method paragraph is not a finding');
 assert.ok(o.every(x=>x.rankingInput===false&&x.independentFinding===false&&x.laboratoryMeasurement===false&&/^[0-9a-f]{64}$/.test(x.blockSha256)));
 assert.ok(!JSON.stringify(o).includes('golden'),'no source wording is kept');
 assert.deepEqual(qualitativeObservations269('<html><body><p>The chips were crisp and golden according to the maker of this fryer.</p></body></html>').observations,[],'no first-person test, no observation');
});
