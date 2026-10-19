import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {checkStructure,assessCompleteness,slotStates,fromTestMeasurement265,fromQualitative270,fromComparative271,comparisonsFromComparative271,comparativeJudgement,fromDeclaration,
 stated,inferred,unknown,OBSERVATION_CONTRACT_VERSION,type ObservationRecord} from '../src/observation_contract.js';

// S87d/S87e: the observation contract v0.3 (shadow). Rows are FICTIONAL, shaped like the stored tables.
const tm={measurement_id:'tm1',revision_id:'r',block_sha256:'b',block_index:3,value_offset:9,product_id:'p1',subject_association:'page_main_product_unverified',
 dimension:'not_established',condition_codes:'["load_empty"]',condition:null,setpoint_c:200,value:1.2,unit:'kWh',method_cue:'first_person_test_statement',protocol_codes:'[]',
 instrument:null,reported_by:'test_publisher_operator_asserted',extractor_version:'x'};
const cmp=(id:string,model:string,value:number,basis='measured',extra:Record<string,unknown>={})=>({result_id:id,revision_id:'r',block_sha256:'b',subject_name:'Brand '+model,subject_model:model,product_id:null,
 identity:'exact_variant',measurand:'energy',task_label:'chips',task_index:1,experiment_key:'e1',condition_codes:'["power_meter","same_food_load"]',value,unit:'kwh',approximate:0,
 value_basis:basis,uncertainty:null,limitations:'[]',reader_version:'v',...extra});

test('S87e A: structural validity and scientific completeness are separate reports',()=>{
 const o=fromTestMeasurement265(tm,'https://www.example.org/review');
 assert.equal(o.contract,OBSERVATION_CONTRACT_VERSION);
 assert.equal(checkStructure(o).valid,true,'an incomplete record can be stored');
 const c=assessCompleteness(o);
 assert.equal(c.interpret.status,'incomplete');assert.ok(c.interpret.missing.includes('assessed.property'),'nobody knows what was measured');
 assert.equal(c.decide.status,'incomplete');assert.deepEqual(c.compare.notAssessed,['condition_relevance']);
});
test('S87e B: a declared attribute is categorical, never a judgement; a judgement keeps its polarity',()=>{
 const steel=fromDeclaration({declaration_id:'d1',product_id:'p',property_key:'material',value_json:'{"kind":"text","text":"stainless steel"}',locator:'dl',evidence_role:'manufacturer_declaration',method:'m'},null);
 assert.equal(steel.result.form,'categorical');assert.deepEqual(steel.result.categorical,{value:'stainless steel',scale:'nominal'});assert.equal(steel.result.judgement,undefined);
 const remote=fromDeclaration({declaration_id:'d2',product_id:'p',property_key:'remote control',value_json:'{"kind":"text","text":"Yes"}',locator:'dl',evidence_role:'retailer_declaration',method:'m'},null);
 assert.equal(remote.result.categorical!.scale,'boolean');
 const price=fromDeclaration({declaration_id:'d4',product_id:'p',property_key:'price',value_json:'{"amount":55,"currency":"GBP","kind":"price"}',locator:'x',evidence_role:'retailer_declaration',method:'m'},null);
 assert.equal(price.result.form,'quantity');assert.equal(price.result.quantity!.quantityKind.value,'price_or_cost');
 const dims=fromDeclaration({declaration_id:'d5',product_id:'p',property_key:'size',value_json:'{"kind":"dimensions","numbers":[51,21],"unit":"mm"}',locator:'x',evidence_role:'retailer_declaration',method:'m'},null);
 assert.deepEqual(dims.result.quantity!.components,[51,21]);
 const count=fromDeclaration({declaration_id:'d6',product_id:'p',property_key:'speeds',value_json:'{"kind":"number","number":3}',locator:'x',evidence_role:'retailer_declaration',method:'m'},null);
 assert.equal(checkStructure(count).valid,true,'a count without a stated unit can be stored');assert.equal(assessCompleteness(count).interpret.status,'incomplete');
 const q=fromQualitative270({observation_id:'q1',block_sha256:'b',block_index:1,product_id:'p',identity:'page_main_product_unverified',outcome:'crispness',dish:'chips',
  dish_from_heading:0,setting_adjusted:1,direction:'negative',strength:'hedged',basis:'first_person_cooking_test',reader_version:'v'},null);
 assert.equal(q.result.form,'judgement');assert.equal(q.result.judgement!.polarity,'negative');
 for(const o of [steel,remote,q])assert.equal(checkStructure(o).valid,true,o.source.id);
});
test('S87e C: no attribution stronger than its evidence',()=>{
 const o=fromTestMeasurement265(tm,null);
 assert.equal(o.subjects[0]!.identity,'inferred','an unverified page association is inferred');assert.match(o.subjects[0]!.productId.rule!,/unverified/);
 assert.equal(o.observationBasis.value,'reported_test_method_unspecified','a test cue is not an instrument');
 const withMeter=fromTestMeasurement265({...tm,condition_codes:'["power_meter"]'},null);assert.equal(withMeter.observationBasis.value,'instrumented_measurement');
 const cls=fromQualitative270({observation_id:'q2',block_sha256:'b',block_index:1,product_id:null,identity:'appliance_class_only',outcome:'browning',dish:'cake',
  dish_from_heading:1,setting_adjusted:0,direction:'positive',strength:'explicit',basis:'first_person_cooking_test',reader_version:'v'},null);
 assert.equal(cls.subjects[0]!.level,'appliance_class');assert.equal(cls.subjects[0]!.identity,'unknown');
 const cost=fromComparative271(cmp('c2','X2',14,'derived_from_tariff',{measurand:'cost',unit:'p'}),null);
 assert.equal(cost.result.derivation.kind,'calculated');assert.ok(cost.result.derivation.from!.some(x=>/tariff/.test(x)));
 const dur=fromComparative271(cmp('c3','X3',40,'measured',{measurand:'duration',unit:'minutes'}),null);
 assert.equal(dur.observationBasis.value,'reported_test_method_unspecified','a power meter does not time a cook');
 const fake:ObservationRecord={...o,observationBasis:{state:'inferred',value:'instrumented_measurement',rule:'guess'}};
 assert.ok(checkStructure(fake).violations.some(v=>v.shape==='V9-instrument-claim-needs-evidence'));
 const bad:ObservationRecord={...o,assessed:{...o.assessed,basis:{state:'inferred',value:'per_year'}}};assert.ok(checkStructure(bad).violations.some(v=>v.shape==='V3-inferred-names-rule'));
 assert.equal(stated('',null).state,'unknown');assert.equal(inferred(null,'r').state,'unknown');
});
test('S87e D: comparisons keep the relation, its members and reasons',()=>{
 const sets=comparisonsFromComparative271([cmp('c1','A1',0.8),cmp('c4','B2',1.1),cmp('c5','C3',0.9,'measured',{experiment_key:'e2'})]);
 assert.equal(sets.length,1,'one experiment-task-measurand with two members');const s=sets[0]!;
 assert.equal(s.result.form,'comparison');assert.equal(s.result.comparison!.members.length,2);assert.equal(s.result.comparison!.relation.value,'values_only');
 assert.deepEqual(s.result.comparison!.members.map(m=>m.memberObservation),['c1','c4']);assert.equal(checkStructure(s).valid,true);
 const j=comparativeJudgement({subjects:[{name:'Alpha DW1'},{name:'Beta DW2'}],property:'dried-on stain removal',task:'baked-on dish load',relation:'better',ordering:[0,1],
  reasons:['no residue after one cycle'],evidence:'block:x#4',document:'https://reviews.example/compare',basis:'hands_on_use_test'});
 assert.equal(j.result.comparison!.members[0]!.rank,1);assert.deepEqual(j.result.comparison!.reasons,['no residue after one cycle']);assert.equal(checkStructure(j).valid,true);
 const one={...j,result:{...j.result,comparison:{...j.result.comparison!,members:[j.result.comparison!.members[0]!]}}};assert.ok(checkStructure(one).violations.some(v=>v.shape==='V6-comparison-members'));
 assert.ok(Object.values(slotStates(s)).every(x=>['stated','inferred','unknown'].includes(x)));assert.equal(unknown().state,'unknown');
});
test('S87e the contract is shadow: no operational module imports it',()=>{
 const dir=new URL('../../src/',import.meta.url);const users=readdirSync(dir).filter(f=>f.endsWith('.ts')&&f!=='observation_contract.ts'&&/observation_contract/.test(readFileSync(new URL(f,dir),'utf8')));
 assert.deepEqual(users,[]);
});
