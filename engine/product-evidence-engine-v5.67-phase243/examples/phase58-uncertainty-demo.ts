/** Fictitious teaching scenario. No real laboratory, product, permissions, or recommendation. */
import {headphonesNeedsPrototype} from '../src/needs_discovery.js';
import {bridgeNeedsToOriginalLab, type QuarantinedLabExport, type NeedToTestRule} from '../src/lab_needs_bridge.js';
import {auditOriginalLabUncertainty, type PublishedExpandedUncertainty} from '../src/lab_uncertainty.js';

const source: QuarantinedLabExport={
 source_kind:'original_independent_lab_measurements',review_only:true,ranking_input_approved:false,
 rights_status:'human_attested_not_cryptographically_verified',publisher_domain:'lab.example.org',
 input_sha256:'a'.repeat(64),measurements:[
  {record_id:'test_a',original_test_id:'lab_a',test_url:'https://lab.example.org/tests/a',
   tested_variant:'model_a',criterion:'battery_runtime',measurement:20,unit:'hours',protocol_id:'battery_loop',
   protocol_version:'1',conditions:{volume:'70_percent',anc:'on'},tested_at:'2026-01-01T00:00:00Z'},
  {record_id:'test_b',original_test_id:'lab_b',test_url:'https://lab.example.org/tests/b',
   tested_variant:'model_b',criterion:'battery_runtime',measurement:19,unit:'hours',protocol_id:'battery_loop',
   protocol_version:'1',conditions:{volume:'70_percent',anc:'on'},tested_at:'2026-01-01T00:00:00Z'},
 ]
};
const rules: NeedToTestRule[]=[{categoryId:'headphones',needId:'battery',measurementCriterion:'battery_runtime',
 unit:'hours',favourableDirection:'higher',protocolId:'battery_loop',protocolVersion:'1',
 conditions:{volume:'70_percent',anc:'on'},reviewReference:'fictional_editorial_review'}];
const bridge=bridgeNeedsToOriginalLab({category:headphonesNeedsPrototype,
 answers:{choices:{usage:'commute'},confirmInterpretation:true},exactVariantIds:['model_a','model_b'],
 export:source,mappingRules:rules});
const u=(id:string,test:string,variant:string,value:number):PublishedExpandedUncertainty=>({
 recordId:id,originalTestId:test,testedVariant:variant,measuredValue:value,unit:'hours',
 expandedUncertainty:1.5,coverageFactor:2,uncertaintyMethod:'hypothetical lab expanded uncertainty model',
 documentationUrl:`https://lab.example.org/uncertainty/${id}`,reportingBasis:'original_lab_reported',
 uncertaintyScope:'full_reported_measurand'});
const audit=auditOriginalLabUncertainty({bridge,originalExport:source,publishedUncertainties:[
 u('test_a','lab_a','model_a',20),u('test_b','lab_b','model_b',19)]});
console.log(JSON.stringify({demoOnly:true,fictionalLab:true,originalMeasurements:source.measurements.map(m=>({variant:m.tested_variant,value:m.measurement,unit:m.unit})),
 uncertaintyAudit:audit,publicationReady:false},null,2));
