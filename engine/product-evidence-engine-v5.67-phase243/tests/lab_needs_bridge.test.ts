import test from 'node:test';
import assert from 'node:assert/strict';
import { bridgeNeedsToOriginalLab, type OriginalLabMeasurement,
 type QuarantinedLabExport, type NeedToTestRule } from '../src/lab_needs_bridge.js';
import {headphonesNeedsPrototype,vacuumNeedsPrototype} from '../src/needs_discovery.js';
const baseRecord=(id:string,v:string,value:number,override:Partial<OriginalLabMeasurement>={}):OriginalLabMeasurement=>({
 record_id:id,original_test_id:`original_${id}`,test_url:`https://lab.example.org/tests/${id}`,
 tested_variant:v,criterion:'battery_runtime',measurement:value,unit:'hours',
 protocol_id:'battery_loop',protocol_version:'1',conditions:{volume:'70_percent',codec:'aac',anc:'enabled'},
 tested_at:'2026-01-10T00:00:00Z',...override
});
const src:QuarantinedLabExport={source_kind:'original_independent_lab_measurements',review_only:true,
 ranking_input_approved:false,rights_status:'human_attested_not_cryptographically_verified',
 publisher_domain:'lab.example.org',input_sha256:'a'.repeat(64),measurements:[baseRecord('r1','headphone_a',20),baseRecord('r2','headphone_b',15)]};
const battery:NeedToTestRule={categoryId:'headphones',needId:'battery',measurementCriterion:'battery_runtime',
 unit:'hours',favourableDirection:'higher',protocolId:'battery_loop',protocolVersion:'1',
 conditions:{volume:'70_percent',codec:'aac',anc:'enabled'},reviewReference:'editorial_mapping_review_57'};
const input={category:headphonesNeedsPrototype,answers:{choices:{usage:'commute'},confirmInterpretation:true},
 exactVariantIds:['headphone_a','headphone_b'] as [string,string],export:src,mappingRules:[battery]};
const run=(overrides:Partial<Omit<typeof input,'answers'>> & {answers?:import('../src/needs_discovery.js').NeedsAnswers}={})=>bridgeNeedsToOriginalLab({...input,...overrides});
test('preserves user needs: battery mapped but ANC missing blocks readiness',()=>{
 const r=run();assert.equal(r.needs.status,'insufficient_evidence');assert.deepEqual(r.capabilityGaps,['anc']);
 assert.equal(r.comparisons.find(x=>x.needId==='battery')?.status,'descriptive_only');
});
test('reports observed direction, actual units, and original test URLs without numerical scores',()=>{
 const r=run();const c=r.comparisons.find(x=>x.needId==='battery')!;
 assert.equal(c.direction,'first_observed_better');assert.equal(c.firstValue,20);assert.equal(c.unit,'hours');
 assert.equal(c.testUrls.length,2);assert.equal(r.numericScores,null);assert.equal(r.winnerId,null);
 assert.equal(r.publicationReady,false);assert.equal(r.provenance.rightsVerified,false);
});
test('protocol version mismatch does not silently compare',()=>{
 const measurements=[src.measurements[0],{...src.measurements[1],protocol_version:'2'}];
 const r=run({export:{...src,measurements}});
 assert.equal(r.comparisons.find(x=>x.needId==='battery')?.status,'incompatible_methods');
});
test('different recorded conditions do not compare',()=>{
 const measurements=[src.measurements[0],{...src.measurements[1],conditions:{volume:'80_percent',codec:'aac',anc:'enabled'}}];
 assert.equal(run({export:{...src,measurements}}).comparisons.find(x=>x.needId==='battery')?.status,'incompatible_methods');
});
test('unit mismatch does not automatically convert incompatible measurements',()=>{
 const measurements=[src.measurements[0],{...src.measurements[1],unit:'minutes',measurement:900}];
 assert.equal(run({export:{...src,measurements}}).comparisons.find(x=>x.needId==='battery')?.status,'missing_measurement');
});
test('exact variant mismatch does not grant evidence for sibling model',()=>{
 const measurements=[src.measurements[0],{...src.measurements[1],tested_variant:'headphone_b_other'}];
 assert.equal(run({export:{...src,measurements}}).comparisons.find(x=>x.needId==='battery')?.status,'missing_measurement');
});
test('multiple results for same variant refuse arbitrary pick or mean',()=>{
 const measurements=[...src.measurements,baseRecord('r3','headphone_a',18)];
 assert.equal(run({export:{...src,measurements}}).comparisons.find(x=>x.needId==='battery')?.status,'ambiguous_records');
});
test('missing source-to-need mapping refuses invented link between ANC and battery',()=>{
 const r=run({mappingRules:[]});assert.equal(r.comparisons.length,2);
 assert.deepEqual(r.unmappedNeeds,['anc','battery']);
});
test('incorrect direction is not inferred from raw number',()=>{
 const r=run({mappingRules:[{...battery,favourableDirection:'lower'}]});
 assert.equal(r.comparisons.find(x=>x.needId==='battery')?.direction,'second_observed_better');
});
test('unreviewed mapping is rejected',()=>{
 assert.throws(()=>run({mappingRules:[{...battery,reviewReference:''}]}),/mapping/);
});
test('ambiguous duplicate mapping is rejected',()=>{
 assert.throws(()=>run({mappingRules:[battery,battery]}),/mapping/);
});
test('cannot disguise research-only feed as production approved',()=>{
 assert.throws(()=>run({export:{...src,ranking_input_approved:true} as unknown as QuarantinedLabExport}),/quarantined/);
});
test('wrong publisher URL rejected',()=>{
 const measurements=[{...src.measurements[0],test_url:'https://retailer.example.com/p'},src.measurements[1]];
 assert.throws(()=>run({export:{...src,measurements}}),/original publisher/);
});
test('price or Amazon integration cannot be a source criterion',()=>{
 assert.throws(()=>run({mappingRules:[{...battery,measurementCriterion:'amazon_price'}]}),/mapping/);
});
test('unconfirmed needs never become publishable',()=>{
 const r=run({answers:{choices:{usage:'commute'}}});assert.equal(r.needs.status,'needs_confirmation');
 assert.equal(r.winnerId,null);assert.equal(r.publicationReady,false);
});
test('ties do not imply a winner',()=>{
 const measurements=[src.measurements[0],{...src.measurements[1],measurement:20}];
 const r=run({export:{...src,measurements}});
 assert.equal(r.comparisons.find(x=>x.needId==='battery')?.direction,'same_observed_value');
 assert.equal(r.winnerId,null);
});
test('reversed observations reverse the descriptive direction',()=>{
 const measurements=[{...src.measurements[0],measurement:12},src.measurements[1]];
 assert.equal(run({export:{...src,measurements}}).comparisons.find(x=>x.needId==='battery')?.direction,'second_observed_better');
});

test('identifies multi-criterion directional tradeoff without manufacturing an overall winner',()=>{
 const carpet=(id:string,v:string,n:number):OriginalLabMeasurement=>baseRecord(id,v,n,{
   criterion:'cleaning_effectiveness',unit:'percent',protocol_id:'surface_test',protocol_version:'1',
   conditions:{surface:'carpet',debris:'standard'}});
 const noise=(id:string,v:string,n:number):OriginalLabMeasurement=>baseRecord(id,v,n,{
   criterion:'noise_level',unit:'db_a',protocol_id:'sound_test',protocol_version:'1',
   conditions:{distance:'one_meter',mode:'max'}});
 const rules:NeedToTestRule[]=[
  {categoryId:'vacuum',needId:'carpet_cleaning',measurementCriterion:'cleaning_effectiveness',unit:'percent',favourableDirection:'higher',protocolId:'surface_test',protocolVersion:'1',conditions:{surface:'carpet',debris:'standard'},reviewReference:'editorial_carpet_review'},
  {categoryId:'vacuum',needId:'noise',measurementCriterion:'noise_level',unit:'db_a',favourableDirection:'lower',protocolId:'sound_test',protocolVersion:'1',conditions:{distance:'one_meter',mode:'max'},reviewReference:'editorial_noise_review'}
 ];
 const r=bridgeNeedsToOriginalLab({category:vacuumNeedsPrototype,
   answers:{choices:{floors:'carpet',pets:'no',noise_preference:'yes'},confirmInterpretation:true},
   exactVariantIds:['vac_a','vac_b'],mappingRules:rules,
   export:{...src,measurements:[carpet('c1','vac_a',95),carpet('c2','vac_b',80),noise('n1','vac_a',70),noise('n2','vac_b',60)]}});
 assert.equal(r.needs.status,'criteria_mapped');
 assert.deepEqual(r.comparisons.map(x=>x.direction),['first_observed_better','second_observed_better']);
 assert.equal(r.hypotheticalTradeoffs.length,1);assert.equal(r.winnerId,null);assert.equal(r.publicationReady,false);
});
