import {test} from 'node:test';
import assert from 'node:assert/strict';
import {acquireOriginalProfessionalReview} from '../src/phase95_professional_review_intake.js';
import type {WebCandidate,WebSourcePolicy} from '../src/web_evidence_acquisition.js';
import type {CategoryFieldRegistry} from '../src/category_evidence_matrix.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
const asOf='2026-10-10T21:00:00Z';
const url='https://reviews.publicexample.org/sony/wh-1000xm5';
const candidate:WebCandidate={id:'sony_xm5_review',sourceId:'publisher_lab',url,
 exactVariantId:'sony_wh_1000xm5',originalTestId:'sony_review_lab_run_1',
 lineageAttestationReference:'operator_original_test_identity_review',
 kind:'original_professional_test',publishedAt:null,updatedAt:null,metadataOrigin:'human_supplied'};
const policy:WebSourcePolicy={sourceId:'publisher_lab',host:'reviews.publicexample.org',basis:'written_permission',
 rightsDocumentId:'test_permission_receipt',rightsDocumentUrl:'https://reviews.publicexample.org/policy',
 reviewedBy:'test_officer',reviewedAt:'2026-10-10T20:30:00Z',validUntil:'2026-11-30T00:00:00Z',
 permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation'],
 robots:'allowed',robotsCheckedAt:'2026-10-10T20:45:00Z',websiteTerms:'reviewed_permitted',
 termsCheckedAt:'2026-10-10T20:45:00Z',commercialUseReviewed:true};
const registry:CategoryFieldRegistry={categoryId:'headphones',schemaVersion:1,reviewedBy:'lab_officer',
 reviewReference:'headphone_review_registry',fields:[{key:'continuous_battery_hours',type:'number',unit:'hours',
 allowedValues:[],permittedOrigins:['independent_lab_measurement'],requiresProtocol:true,contextKeys:['usage']}]};
const source='<html><body><h1>Sony WH-1000XM5 Headphones Review</h1>'+ 
 '<p>Tested in our laboratory under standard battery test conditions: 27 hours of continuous playback with ANC on.</p></body></html>';
const makeTransport=(html=source, seen:string[]=[]):SourceTransport=>({async get(u){seen.push(u);
 return u.endsWith('/robots.txt')?{status:200,finalUrl:u,contentType:'text/plain',body:'User-agent: *\nAllow: /'}:
  {status:200,finalUrl:u,contentType:'text/html',body:html};}});
const args=(transport:SourceTransport, p:WebSourcePolicy=policy,c:WebCandidate=candidate)=>({
 registry,candidate:c,policy:p,asOf,expectedModel:'Sony WH-1000XM5',
 methodId:'battery_test',methodVersion:'v2_3',transport});

test('approved professional lab review -> Phase69 -> Phase70 quarantine, no scoring',async()=>{
 const seen:string[]=[];
 const r=await acquireOriginalProfessionalReview(args(makeTransport(source,seen)));
 assert.equal(r.status,'quarantined');assert.equal(r.observations.length,1);
 assert.equal(r.observations[0].value.type,'number');
 assert.deepEqual(r.observations[0].value,{type:'number',number:27,unit:'hours'});
 assert.equal(r.observations[0].protocolId,'battery_test');
 assert.equal(r.observations[0].origin,'independent_lab_measurement');
 assert.equal(r.observations[0].reviewStatus,'quarantined_unreviewed');
 assert.equal(r.sourceTextStored,false);assert.equal(r.rankingEligible,false);
 assert.equal(r.localModelCalls,0);assert.equal(seen.length,2);
 assert.ok(!JSON.stringify(r).includes('Tested in our laboratory'));
});
test('wrong model fails before matrix',async()=>{
 const r=await acquireOriginalProfessionalReview(args(makeTransport(source.replaceAll('WH-1000XM5','WH-1000XM4'))));
 assert.equal(r.status,'blocked');assert.equal(r.observations.length,0);
});
test('missing commercial source approval refuses before network',async()=>{
 const seen:string[]=[];
 const r=await acquireOriginalProfessionalReview(args(makeTransport(source,seen),{...policy,websiteTerms:'unknown'}));
 assert.equal(r.status,'blocked');assert.equal(seen.length,0);
});
test('source cannot smuggle a product comparison into single-review channel',async()=>{
 const r=await acquireOriginalProfessionalReview(args(makeTransport('<h1>Sony WH-1000XM5 vs Bose QC</h1><p>Battery lasts 27 hours with ANC on.</p>')));
 assert.equal(r.status,'blocked');assert.equal(r.observations.length,0);
});
test('0.0 subscriber placeholder cannot be imported as runtime',async()=>{
 const r=await acquireOriginalProfessionalReview(args(makeTransport('<h1>Sony WH-1000XM5 Review</h1><p>Locked 0.0 hrs battery. Join Now</p>')));
 assert.equal(r.status,'blocked');assert.equal(r.observations.length,0);
});
test('professional observations cannot be relabelled manufacturer documentation',async()=>{
 const r=await acquireOriginalProfessionalReview(args(makeTransport(),policy,{...candidate,kind:'manufacturer_technical_document'}));
 assert.equal(r.status,'blocked');
});
test('test execution lineage is mandatory',async()=>{
 const r=await acquireOriginalProfessionalReview(args(makeTransport(),policy,{...candidate,originalTestId:null}));
 assert.equal(r.status,'blocked');
});
test('reviewed comparison yields only exact selected model measurement',async()=>{
 const html='<h1>Bose QuietComfort Ultra Headphones vs Sony WH-1000XM5</h1>'+
  '<p>In our shared ANC battery test, Sony WH-1000XM5 lasted 31 hours and 53 minutes with ANC on, while Bose QuietComfort Ultra Headphones lasted 27 hours and 37 minutes.</p>';
 const r=await acquireOriginalProfessionalReview({...args(makeTransport(html)),comparisonModels:['Bose QuietComfort Ultra Headphones','Sony WH-1000XM5']});
 assert.equal(r.status,'quarantined');assert.equal(r.observations.length,1);
 assert.deepEqual(r.observations[0].value,{type:'number',number:31.883333,unit:'hours'});
});
