import test from 'node:test';
import assert from 'node:assert/strict';
import { auditOriginalLabUncertainty, type PublishedExpandedUncertainty } from '../src/lab_uncertainty.js';
import { bridgeNeedsToOriginalLab, type OriginalLabMeasurement, type QuarantinedLabExport, type NeedToTestRule } from '../src/lab_needs_bridge.js';
import { headphonesNeedsPrototype } from '../src/needs_discovery.js';

const rec=(id:string,v:string,n:number):OriginalLabMeasurement=>({record_id:id,original_test_id:`original_${id}`,
 test_url:`https://lab.example.org/tests/${id}`,tested_variant:v,criterion:'battery_runtime',measurement:n,
 unit:'hours',protocol_id:'loop',protocol_version:'1',conditions:{codec:'aac',anc:'on'},tested_at:'2026-01-20T00:00:00Z'});
const originalExport:QuarantinedLabExport={source_kind:'original_independent_lab_measurements',review_only:true,
 ranking_input_approved:false,rights_status:'human_attested_not_cryptographically_verified',
 publisher_domain:'lab.example.org',input_sha256:'a'.repeat(64),measurements:[rec('r1','hpa',20),rec('r2','hpb',15)]};
const rule:NeedToTestRule={categoryId:'headphones',needId:'battery',measurementCriterion:'battery_runtime',
 unit:'hours',favourableDirection:'higher',protocolId:'loop',protocolVersion:'1',
 conditions:{codec:'aac',anc:'on'},reviewReference:'reviewed_mapping'};
const bridge=bridgeNeedsToOriginalLab({category:headphonesNeedsPrototype,
 answers:{choices:{usage:'commute'},confirmInterpretation:true},exactVariantIds:['hpa','hpb'],
 export:originalExport,mappingRules:[rule]});
const u=(id:string,v:string,value:number,expanded:number):PublishedExpandedUncertainty=>({
 recordId:id,originalTestId:`original_${id}`,testedVariant:v,measuredValue:value,
 unit:'hours',expandedUncertainty:expanded,coverageFactor:2,uncertaintyMethod:'replicate method with calibration',
 documentationUrl:`https://lab.example.org/methods/${id}`,reportingBasis:'original_lab_reported',
 uncertaintyScope:'full_reported_measurand'});
const rows=[u('r1','hpa',20,1),u('r2','hpb',15,1)];
const run=(override:Partial<Parameters<typeof auditOriginalLabUncertainty>[0]>={})=>auditOriginalLabUncertainty({bridge,originalExport,publishedUncertainties:rows,...override});
const battery=(r:ReturnType<typeof run>)=>r.assessments.find(a=>a.needId==='battery')!;
test('reported expanded intervals may be separated but no winner, readiness or statistical confidence is asserted',()=>{
 const r=run();const a=battery(r);
 assert.equal(a.status,'reported_intervals_separated');assert.deepEqual(a.firstInterval,[19,21]);
 assert.deepEqual(a.secondInterval,[14,16]);assert.equal(a.coverageFactor,2);
 assert.equal(r.reportedPairCount,1);assert.equal(r.winnerId,null);
 assert.equal(r.confidenceScore,null);assert.equal(r.publicationReady,false);
 assert.equal(r.rankingEligible,false);assert.equal(r.sourceRightsVerified,false);
 assert.match(a.limitation,/NOT a significance test/);
});
test('uncertainties that overlap cannot be called separated',()=>{
 assert.equal(battery(run({publishedUncertainties:[rows[0],u('r2','hpb',15,5)]})).status,'reported_intervals_overlap_or_touch');
});
test('intervals touching are treated as overlap',()=>{
 assert.equal(battery(run({publishedUncertainties:[u('r1','hpa',20,2.5),u('r2','hpb',15,2.5)]})).status,'reported_intervals_overlap_or_touch');
});
test('one or both missing uncertainty records means no interval inference',()=>{
 for (const data of [[],[rows[0]]]){
  const r=run({publishedUncertainties:data});
  assert.equal(battery(r).status,'missing_reported_uncertainty');assert.equal(r.reportedPairCount,0);
 }
});
test('different coverage factors block comparability',()=>{
 const r=run({publishedUncertainties:[rows[0],{...rows[1],coverageFactor:3}]});
 assert.equal(battery(r).status,'unequal_coverage_factors');
});
test('no fabricated uncertainty allowed (non-positive and non-finite)',()=>{
 for(const n of [0,-1,Infinity,NaN])
  assert.throws(()=>run({publishedUncertainties:[{...rows[0],expandedUncertainty:n},rows[1]]}),/uncertainty/);
});
test('coverage factor must be finite > 1, not inferred as 95% confidence',()=>{
 for(const n of [1,0,-2,Infinity,NaN])
  assert.throws(()=>run({publishedUncertainties:[{...rows[0],coverageFactor:n},rows[1]]}),/uncertainty/);
});
test('reject self-asserted uncertainty instead of original lab',()=>{
 assert.throws(()=>run({publishedUncertainties:[{...rows[0],reportingBasis:'editor_inferred'} as unknown as PublishedExpandedUncertainty,rows[1]]}),/uncertainty/);
});
test('reject instrument-only accuracy mislabelled as full measurement uncertainty',()=>{
 assert.throws(()=>run({publishedUncertainties:[{...rows[0],uncertaintyScope:'instrument_only'} as unknown as PublishedExpandedUncertainty,rows[1]]}),/uncertainty/);
});
test('reject mismatched numerical observation, variant, unit, or test identity',()=>{
 const cases:PublishedExpandedUncertainty[]=[{...rows[0],measuredValue:19},
  {...rows[0],testedVariant:'hpb'},{...rows[0],unit:'minutes'},{...rows[0],originalTestId:'original_other'}];
 for(const bad of cases) assert.throws(()=>run({publishedUncertainties:[bad,rows[1]]}),/exact original/);
});
test('reject unknown and duplicate record identifiers',()=>{
 assert.throws(()=>run({publishedUncertainties:[{...rows[0],recordId:'r999'},rows[1]]}),/exact original/);
 assert.throws(()=>run({publishedUncertainties:[rows[0],rows[0]]}),/duplicate/);
});
test('uncertainty method URL must be at exact original publisher domain',()=>{
 for(const url of ['https://bad.org/methods/x','http://lab.example.org/method','https://lab.example.org.evil.net/a'])
  assert.throws(()=>run({publishedUncertainties:[{...rows[0],documentationUrl:url},rows[1]]}),/original publisher/);
});
test('without an adequate mapping, uncertainty cannot convert a need to supported',()=>{
 const bridgeUnmapped=bridgeNeedsToOriginalLab({category:headphonesNeedsPrototype,
   answers:{choices:{usage:'commute'},confirmInterpretation:true},exactVariantIds:['hpa','hpb'],
   export:originalExport,mappingRules:[]});
 const r=run({bridge:bridgeUnmapped});
 assert.equal(r.assessments.every(x=>x.status==='not_comparable'),true);assert.equal(r.reportedPairCount,0);
});
test('changed source measurement after bridge calculation causes explicit rejection',()=>{
 const corrupted={...originalExport,measurements:[{...originalExport.measurements[0],measurement:99},originalExport.measurements[1]]};
 assert.throws(()=>run({originalExport:corrupted}),/exact original record|Bridge result does not match/);
});
test('source hash mismatch cannot link stale comparisons',()=>{
 assert.throws(()=>run({originalExport:{...originalExport,input_sha256:'b'.repeat(64)}}),/matching quarantined/);
});
test('different original protocol prevents inference even if uncertainty exists',()=>{
 const e:QuarantinedLabExport={...originalExport,measurements:[originalExport.measurements[0],
  {...originalExport.measurements[1],protocol_version:'2'}]};
 const mismatchedBridge=bridgeNeedsToOriginalLab({category:headphonesNeedsPrototype,
  answers:{choices:{usage:'commute'},confirmInterpretation:true},exactVariantIds:['hpa','hpb'],
  export:e,mappingRules:[rule]});
 const r=run({bridge:mismatchedBridge,originalExport:e});
 assert.equal(battery(r).status,'not_comparable');assert.equal(r.reportedPairCount,0);
});
test('a contrary commercial field or Amazon information cannot be used as an uncertainty record',()=>{
 assert.throws(()=>run({publishedUncertainties:[{...rows[0],recordId:'amazon_price'},rows[1]]}),/uncertainty/);
});
test('reject numeric interval overflow',()=>{
 const huge:QuarantinedLabExport={...originalExport,measurements:[{...originalExport.measurements[0],measurement:1.7e308},
   originalExport.measurements[1]]};
 const b=bridgeNeedsToOriginalLab({category:headphonesNeedsPrototype,
  answers:{choices:{usage:'commute'},confirmInterpretation:true},exactVariantIds:['hpa','hpb'],
  export:huge,mappingRules:[rule]});
 assert.throws(()=>run({bridge:b,originalExport:huge,
  publishedUncertainties:[{...rows[0],measuredValue:1.7e308,expandedUncertainty:1.7e308},rows[1]]}),/overflow/);
});
