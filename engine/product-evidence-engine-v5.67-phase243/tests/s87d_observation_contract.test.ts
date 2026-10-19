import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {checkShapes,slotStates,fromTestMeasurement265,fromQualitative270,fromComparative271,fromDeclaration,stated,inferred,unknown,OBSERVATION_CONTRACT_VERSION,type ObservationV02} from '../src/observation_contract.js';

// S87d: the v0.2 observation contract (shadow). Rows are FICTIONAL, shaped like the stored tables.
const tm={measurement_id:'tm1',revision_id:'r',block_sha256:'b',block_index:3,value_offset:9,product_id:'p1',subject_association:'page_main_product_unverified',
 dimension:'not_established',condition_codes:'["load_empty"]',condition:null,setpoint_c:200,value:1.2,unit:'kWh',method_cue:'first_person_test_statement',protocol_codes:'[]',
 instrument:null,reported_by:'test_publisher_operator_asserted',extractor_version:'x'};
test('S87d adapters keep what a table states and mark the rest unknown (never invented)',()=>{
 const o=fromTestMeasurement265(tm,'https://www.example.org/review');
 assert.equal(o.contract,OBSERVATION_CONTRACT_VERSION);assert.equal(o.assessed.property.state,'unknown','not_established stays unknown');
 assert.equal(o.assessed.basis.state,'unknown');assert.equal(o.observationBasis.state,'inferred');assert.ok(o.observationBasis.rule);
 assert.equal(o.observer.publisher.value,'example.org');assert.deepEqual(o.assessed.constraints.map(c=>c.value),['load_empty','200 °C']);
 assert.equal(checkShapes(o).conforms,true);assert.ok(checkShapes(o).results.some(r=>r.shape==='S2-property-established'));
});
test('S87d one record for quantitative, qualitative (incl. nominal declarations) and comparative findings',()=>{
 const q=fromQualitative270({observation_id:'q1',block_sha256:'b',block_index:1,product_id:'p',identity:'page_main_product_unverified',outcome:'crispness',dish:'chips',
  dish_from_heading:0,setting_adjusted:1,direction:'negative',strength:'hedged',basis:'first_person_cooking_test',reader_version:'v'},null);
 assert.equal(q.result.form,'qualitative');assert.equal(q.result.qualitative!.judgement,'negative');assert.equal(q.observationBasis.value,'hands_on_use_test');
 const c=fromComparative271({result_id:'c1',block_sha256:'b',subject_name:'X 1',subject_model:'X1',product_id:null,identity:'exact_variant',measurand:'energy',task_label:'chips',
  condition_codes:'["power_meter"]',value:0.3,unit:'kwh',approximate:0,value_basis:'measured',experiment_key:'e',uncertainty:null,limitations:'[]',reader_version:'v'},null);
 assert.equal(c.assessed.basis.state,'inferred');assert.match(c.assessed.basis.rule!,/per completed task/);
 const dText=fromDeclaration({declaration_id:'d1',product_id:'p',property_key:'material',value_json:'{"kind":"text","text":"steel"}',locator:'dl',evidence_role:'manufacturer_declaration',method:'m'},null);
 assert.equal(dText.result.form,'qualitative');assert.equal(dText.result.qualitative!.grade.value,'nominal:steel');
 const dQty=fromDeclaration({declaration_id:'d2',product_id:'p',property_key:'width',value_json:'{"kind":"quantity","number":80,"unit":"cm"}',locator:'dl',evidence_role:'retailer_declaration',method:'m'},null);
 assert.equal(dQty.result.quantitative!.value,80);assert.equal(dQty.observer.role,'retailer_declaration');
 for(const o of [q,c,dText,dQty])assert.equal(checkShapes(o).conforms,true,o.source.id);
});
test('S87d shapes: a declaration can never be an independent test; an inferred slot must name its rule; one result form',()=>{
 const d=fromDeclaration({declaration_id:'d3',product_id:'p',property_key:'noise',value_json:'{"kind":"quantity","number":40,"unit":"dB"}',locator:'x',evidence_role:'manufacturer_declaration',method:'m'},null);
 const bad:ObservationV02={...d,observer:{...d.observer,role:'independent_test'}};assert.ok(checkShapes(bad).results.some(r=>r.shape==='S6-declaration-not-test'));
 const bad2:ObservationV02={...d,assessed:{...d.assessed,basis:{state:'inferred',value:'per_year'}}};assert.ok(checkShapes(bad2).results.some(r=>r.shape==='S5-inferred-names-rule'));
 const bad3:ObservationV02={...d,result:{...d.result,qualitative:{judgement:'neutral',grade:unknown(),strength:unknown()}}};assert.ok(checkShapes(bad3).results.some(r=>r.shape==='S1-one-result-form'));
 assert.equal(stated('',null).state,'unknown','an empty value is unknown, not stated');assert.equal(inferred(null,'r').state,'unknown');
 assert.ok(Object.values(slotStates(d)).every(s=>['stated','inferred','unknown'].includes(s)));
});
test('S87d the contract is shadow: no operational module imports it',()=>{
 const dir=new URL('../../src/',import.meta.url);const users=readdirSync(dir).filter(f=>f.endsWith('.ts')&&f!=='observation_contract.ts'&&/observation_contract/.test(readFileSync(new URL(f,dir),'utf8')));
 assert.deepEqual(users,[]);
});
