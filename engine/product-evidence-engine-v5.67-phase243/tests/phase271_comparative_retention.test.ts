import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {testLeadsFromHtml265,testDocumentSubject268} from '../src/phase265_test_measurements.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {applyLessons250,ADOPTED_LESSONS250} from '../src/phase250_category_lessons.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {AIR_FRYER_TEACHING269,RESEARCH_SOURCES269} from '../src/phase269_research_teaching.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {comparativeEvidence271} from '../src/phase271_comparative_evidence.js';

// Phase271 §4: extracted -> attributed -> retained -> retrieved -> evaluated for comparability -> used or rejected.
// Every publisher, product and value is FICTIONAL.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee271c-'));let n=0;
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const page=(title:string,body:string)=>`<html><head><meta property="og:type" content="article" /><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name:title})}</script></head><body><h1>${title}</h1>${body}</body></html>`;
const table=(dish:string,rows:[string,string,string,string][])=>`<h3>${dish}</h3><table><tr><th>Appliance</th><th>Cooking time</th><th>Energy used</th><th>Cost</th><th>Cooking quality</th></tr>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>4* Good</td></tr>`).join('')}</table>`;
const LAB='<p>For our test we cooked each dish in every appliance and measured the energy in our laboratory. The quantities of all the foods were the same in each appliance (except for the cake in the air fryer).</p>';
const OVEN_DOC=page('Air fryer vs oven: a fictional lab comparison',LAB+table('Roast chicken',[['Air fryer','50 mins','0.50kWh','13p'],['Built-in oven','70 mins','1.10kWh','29p']])+
 table('Cake',[['Air fryer','30 mins','0.20kWh','5p'],['Built-in oven','50 mins','0.70kWh','18p']])+'<p>We had to make a smaller cake for the air fryer.</p><p>Our appliances:</p><ul><li>Gamma Heat GH4000X built-in electric oven</li><li>Zephyrine Crisp ZC300X air fryer</li></ul>');
const TWO_FRYERS=page('Two air fryers compared on chips',LAB.replace(' (except for the cake in the air fryer)','')+table('Chips',[['Zephyrine air fryer','22 mins','0.28kWh','7p'],['Nimbus air fryer','25 mins','0.33kWh','9p'],['Built-in oven','33 mins','0.85kWh','22p']])+
 '<p>Our appliances:</p><ul><li>Zephyrine Crisp ZC300X air fryer</li><li>Nimbus Duo NB200Y air fryer</li><li>Gamma Heat GH4000X built-in electric oven</li></ul>');
function world(docs:[string,string][],sourceType:'independent_original_test'|'manufacturer'|'editorial'='independent_original_test'){
 const s=new KnowledgeStore246(join(dir,`c${++n}.sqlite`),CLASS);
 seedCategoryHypotheses246(s,'air_fryers','2026-10-16T08:00:00.000Z');applyLessons250(s,ADOPTED_LESSONS250,'2026-10-16T08:00:00.000Z');
 registerTeachingSources252(RESEARCH_SOURCES269);applyTeaching252(s,[AIR_FRYER_TEACHING269],'2026-10-16T08:30:00.000Z');
 for(const [u,html] of docs){const url=`https://www.labfryer.test/${u}`;const x=testDocumentSubject268(extractSpecifications245(html,url),sourceType);
  s.ingestObservation246({source:{sourceId:'src_lab',host:'www.labfryer.test',sourceType,sourceTypeBasis:'operator_asserted'},url,sha256:sha(html),bytes:html.length,httpStatus:200,
   fetchedAt:'2026-10-17T09:00:00.000Z',runId:'p271c',extractorVersion:'phase245@test',extraction:x,categoryHypotheses:['air_fryers'],testLeads:testLeadsFromHtml265(html,url,sha(html),x,{category:'air_fryers'})});}
 return s;
}
const COND=['same_food_load','completed_doneness','compartments_in_use'];

test('retained with identity, measurand separation and tariff-derived cost; an article headline is not a product',()=>{
 const s=world([['oven-vs-fryer',OVEN_DOC]]);
 const rows=s.comparativeResults271();assert.equal(rows.length,12);
 const fryer=rows.filter(r=>r.equipment_class==='air_fryer');
 assert.ok(fryer.every(r=>r.subject_name==='Zephyrine Crisp ZC300X air fryer'&&r.identity==='exact_variant'),JSON.stringify(fryer.map(r=>[r.subject_name,r.identity])));
 assert.ok(rows.filter(r=>r.equipment_class==='oven').every(r=>r.subject_name==='Gamma Heat GH4000X'),'an oven is an oven, never an air-fryer variant');
 assert.ok(rows.filter(r=>r.measurand==='cost').every(r=>r.value_basis==='derived_from_tariff'));
 assert.ok(rows.filter(r=>r.task_label==='cake').every(r=>(r.condition_codes as string[]).includes('quantity_reduced')));
 assert.throws(()=>s.db.prepare("UPDATE comparative_results271 SET value_basis='measured' WHERE measurand='cost'").run(),/CHECK constraint/);
 assert.throws(()=>s.db.prepare('UPDATE comparative_results271 SET ranking_input=1').run(),/CHECK constraint/);
 assert.equal((s.db.prepare("SELECT count(*) n FROM products WHERE name LIKE 'Air fryer vs oven%'").get() as {n:number}).n,0);
 s.close();
});

test('comparability: within one experiment and task only; a reduced load and a republished experiment do not count',()=>{
 const s=world([['oven-vs-fryer',OVEN_DOC],['republished/oven-vs-fryer',OVEN_DOC.replace('<h1>','<h1 class="x">')]]);
 const ev=comparativeEvidence271(s,'energy_per_cooking_task','air_fryer',COND)!;
 assert.equal(ev.experiments,1,'the same experiment republished is one experiment');assert.ok(ev.duplicatesIgnored>0);
 const chicken=ev.groups.find(g=>g.task==='chicken')!,cake=ev.groups.find(g=>g.task==='cake')!;
 assert.equal(chicken.comparableWithinExperiment,true);assert.deepEqual(chicken.conditions.filter(c=>c.state==='not_verifiable').map(c=>c.condition),['compartments_in_use']);
 // S83: three states; an unrecorded condition is not verifiable (was 'unmet'), a reduced load is a documented incompatibility
 assert.equal(chicken.comparability,'comparable_conditions_not_verifiable','structurally comparable, but a required condition is not recorded');assert.equal(cake.comparability,'not_comparable');
 assert.equal(cake.conditions.find(c=>c.condition==='same_food_load')!.state,'incompatible');
 assert.deepEqual([cake.comparableWithinExperiment,cake.reasons],[false,['load_not_matched']]);
 assert.equal(ev.sameClassComparable,0);assert.equal(ev.crossClass,1);
 assert.ok(chicken.items.every(i=>i.unit==='kwh'),'energy groups carry energy only (never cost or time)');
 s.close();
});

test('decision: evidence is used for what it shows (air fryer vs owned oven) and rejected for what it cannot (which air fryer)',()=>{
 const s=world([['oven-vs-fryer',OVEN_DOC],['two-fryers',TWO_FRYERS]]);
 const own=adviseFromRequest253('I already have a fan oven. Is an air fryer actually cheaper to run, or should I keep using the oven?',s,CATEGORY_REGISTRY250);
 assert.equal(own.goalAssessment!.decision,'no_purchase_check');
 assert.ok((own.goalAssessment!.alternativeComparison??[]).length>=2);
 assert.ok(own.statements.some(x=>/^Original test evidence .*publisher-reported, not reviewed by PEE.*one experiment/.test(x)));
 assert.ok(own.statements.some(x=>/comparable only within that experiment.*does not record compartments in use.*conditional comparison/.test(x)),'unmet essential conditions are stated');
 const pick=adviseFromRequest253('Which air fryer gives the best cooking results for one person while using relatively little electricity?',s,CATEGORY_REGISTRY250);
 const e=pick.goalAssessment!.outcomes.find(o=>o.need==='low_energy_use')!;
 assert.equal(e.comparativeEvidence!.sameClassComparable,1,'one experiment does compare two air fryers');
 // Even then: a taught condition (compartments in use) is not recorded, and nothing here is reviewed: no ranking.
 assert.equal(e.coverage,'unassessed');assert.notEqual(pick.response,'ranked_recommendation');assert.equal(pick.ordered,false);
 assert.ok(pick.unassessedObjectives.includes('low_energy_use'));
 s.close();
});

test('S85: comparative results read on a manufacturer or editorial page are withheld (journaled), never stored as measured tests',()=>{
 for(const role of ['manufacturer','editorial'] as const){
  const s=world([['two-fryers',TWO_FRYERS]],role);
  assert.equal(s.comparativeResults271({}).length,0,role+': no comparative row');
  const ev=s.db.prepare("SELECT payload_json FROM events WHERE kind='comparative_results_withheld'").all() as {payload_json:string}[];
  assert.ok(ev.some(e=>JSON.parse(e.payload_json).reason===(role==='manufacturer'?'source_role_not_test:manufacturer':'source_role_not_test:other_publisher')),role+': journaled with its role');
  assert.equal(comparativeEvidence271(s,'energy_per_cooking_task','air_fryer',COND)!.groups.length,0);s.close();}
 // control: the same page from a test publisher is kept as before, and nothing is excluded at query time
 const t=world([['two-fryers',TWO_FRYERS]]);const ce=comparativeEvidence271(t,'energy_per_cooking_task','air_fryer',COND)!;
 assert.ok(t.comparativeResults271({}).length>0);assert.equal(ce.notTestSourceExcluded,0);assert.ok(ce.groups.length>0);t.close();
});
