import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stageTechnicalTable183,type SourceCustody183} from '../src/phase183_source_measurement_intake.js';
import {stageEpaRegistry184,verifyEpaPilot184} from '../src/phase184_real_epa_registry_pilot.js';
const source=readFileSync('evaluation/phase184/source/ENERGY_STAR_Certified_Room_Air_Cleaners_V3.0_20261012.csv');
const digest='4d7d3203e95ef8c2553a55a51799438470d5f71f01c49c295ede8013d608be91';
const args={csvBytes:source,expectedSha256:digest,market:'us' as const,
 obtainedAt:'2026-10-12T20:53:00Z',reviewedAt:'2026-10-12T20:54:00Z',asOf:'2026-10-12T22:00:00Z',
 rightsReviewReference:'epa_public_data_license_review',sourceRevision:'operator_export_2026_10_12'};
let cached:ReturnType<typeof stageEpaRegistry184>|null=null;
const result=()=>cached??(cached=stageEpaRegistry184(args));
test('authentic original CSV bytes, 36 columns, 247 EPA identifiers and provenance are preserved',()=>{
 const a=result();assert.equal(a.documentSha256,digest);assert.equal(a.rows,247);assert.equal(a.columns,36);
 assert.equal(a.bytes,source.length);assert.equal(a.sourceRole,'certification_registry_manufacturer_reported');
 assert.equal(verifyEpaPilot184(a,source),true);
});
test('US market check and held ambiguous group/duplicate identities, no dropped cases',()=>{
 const a=result();assert.equal(a.candidates.length+a.held.length,247);
 assert.ok(a.held.some(x=>x.reason==='model_pattern_or_group'));
 assert.ok(a.held.some(x=>x.reason==='duplicate_brand_model'));
 assert.ok(a.held.some(x=>x.reason==='out_of_market'));
 assert.equal(new Set(a.candidates.map(x=>x.esuid)).size,a.candidates.length);
});
test('Levoit Core 400S is source-anchored, no invented third-party performance approval',()=>{
 const p=result().candidates.find(x=>x.esuid==='4027325');assert.ok(p);
 assert.equal(p.brand,'LEVOIT');assert.equal(p.modelNumber,'Core 400S');
 assert.equal(p.observations.find(o=>o.dimensionKey==='smoke_cadr')?.value,231);
 assert.equal(p.observations.find(o=>o.dimensionKey==='integrated_energy_factor')?.value,5.8);
 assert.equal(p.exactCommercialVariantAuthenticated,false);
 assert.equal(p.independentPerformanceTest,false);
 assert.equal(p.rankingAuthorized,false);
 assert.equal(p.observations.length,11);
});
test('all quantities are per exact certification row, never normalized ranking points',()=>{
 const a=result();for(const p of a.candidates){
  assert.equal(p.observations.length,11);assert.ok(/^esuid_\d{7}$/.test(p.registryEntryId));
  assert.ok(p.observations.every(o=>o.variantId===p.registryEntryId&&o.sourceRole==='certification_registry_manufacturer_reported'));
  assert.ok(p.observations.every(o=>o.rankingAuthorized===false));
 }
});
test('tampering with measured source bytes or staged values defeats replay integrity',()=>{
 const a=result();const bad=Buffer.from(source);bad[200]^=1;
 assert.equal(verifyEpaPilot184(a,bad),false);
 const edited=structuredClone(a);edited.candidates[0].observations[0].value=8000;
 assert.equal(verifyEpaPilot184(edited,source),false);
});
test('different source snapshot cannot be accepted with an old hash',()=>{
 assert.throws(()=>stageEpaRegistry184({...args,expectedSha256:'0'.repeat(64)}),/snapshot_hash_mismatch/);
});
test('existing Phase183 strict-default US-style decimal parsing rejects ambiguous comma',()=>{
 const custody:SourceCustody183={sourceId:'epa_air_cleaners_v3',sourceUrl:'https://data.energystar.gov/d/gaa3-swy6',
  licenseUrl:'https://edg.epa.gov/EPA_Data_License.html',rightsReviewReference:'epa_public_data_license_review',
  permissionStatus:'operator_reviewed_local_fact_storage',sourceRole:'certification_registry_manufacturer_reported',
  sourceRevision:'operator_export_2026_10_12',protocolId:'energystar_room_air_cleaners',protocolVersion:'v3_0',
  market:'us',obtainedAt:args.obtainedAt,rightsReviewedAt:args.reviewedAt,acquisition:'operator_supplied_offline_copy'};
 custody.sourceUrl='https://data.energystar.gov/Active-Specifications/ENERGY-STAR-Certified-Room-Air-Cleaners-V3-0/gaa3-swy6';
 const scope={variantId:'esuid_4027325',brand:'LEVOIT',modelNumber:'Core 400S',categoryId:'air_purifier'};
 const schema={brandColumn:'Brand Name',modelColumn:'Model Number',measurements:[{column:'Integrated Energy Factor (cfm/Watt)',dimensionKey:'ief',unit:'cfm_per_watt',min:0,max:100}]};
 const r=stageTechnicalTable183({csvBytes:source,custody,scope,schema,asOf:args.asOf});
 assert.equal(r.status,'blocked');assert.equal(r.reason,'missing_or_ambiguous_measurement:ief');
});
test('comma locale is explicit and cannot accept dot or arbitrary thousands grouped figures',()=>{
 const custody:SourceCustody183={sourceId:'epa_air_cleaners_v3',sourceUrl:'https://data.energystar.gov/d/gaa3-swy6',
  licenseUrl:'https://edg.epa.gov/EPA_Data_License.html',rightsReviewReference:'epa_public_data_license_review',
  permissionStatus:'operator_reviewed_local_fact_storage',sourceRole:'certification_registry_manufacturer_reported',
  sourceRevision:'operator_export_2026_10_12',protocolId:'energystar_room_air_cleaners',protocolVersion:'v3_0',
  market:'us',obtainedAt:args.obtainedAt,rightsReviewedAt:args.reviewedAt,acquisition:'operator_supplied_offline_copy'};
 const scope={variantId:'model_test',brand:'Example',modelNumber:'A1',categoryId:'air_purifier'};
 const schema={brandColumn:'Brand Name',modelColumn:'Model Number',measurements:[{column:'IEF (cfm/W)',dimensionKey:'ief',unit:'cfm_per_watt',min:0,max:100,decimalSeparator:',' as const}]};
 for(const [raw,status] of [['"5,8"','staged_unreviewed'],['5.8','blocked'],['"5,123"','blocked']]){
  const csv=Buffer.from('Brand Name,Model Number,IEF (cfm/W)\nExample,A1,'+raw+'\n');
  assert.equal(stageTechnicalTable183({csvBytes:csv,custody,scope,schema,asOf:args.asOf}).status,status,raw);
 }
});
test('non-unique and wildcard identities never become exact-product evidence',()=>{
 const a=result();for(const h of a.held){
  if(h.reason==='model_pattern_or_group')assert.match(h.modelNumber,/[*#?;]/);
 }
});
import {openIntakeJournal183,appendStagedIntake183} from '../src/phase183_source_measurement_intake.js';
test('authentic EPA row can enter existing Phase183 claim journal, never Phase181 independent-test ranking',()=>{
 const custody:SourceCustody183={sourceId:'epa_air_cleaners_v3',sourceUrl:'https://data.energystar.gov/d/gaa3-swy6',
  licenseUrl:'https://edg.epa.gov/EPA_Data_License.html',rightsReviewReference:'epa_public_data_license_review',
  permissionStatus:'operator_reviewed_local_fact_storage',sourceRole:'certification_registry_manufacturer_reported',
  sourceRevision:'operator_export_2026_10_12',protocolId:'energystar_room_air_cleaners',protocolVersion:'v3_0',
  market:'us',obtainedAt:args.obtainedAt,rightsReviewedAt:args.reviewedAt,acquisition:'operator_supplied_offline_copy'};
 const scope={variantId:'esuid_4027325',brand:'LEVOIT',modelNumber:'Core 400S',categoryId:'air_purifier'};
 const schema={brandColumn:'Brand Name',modelColumn:'Model Number',measurements:[
  {column:'Smoke-Free Clean Air Delivery Rate (cfm)',dimensionKey:'smoke_cadr',unit:'cfm',min:0,max:5000},
  {column:'Integrated Energy Factor (cfm/Watt)',dimensionKey:'integrated_energy_factor',unit:'cfm_per_watt',min:0,max:1000,decimalSeparator:',' as const}]};
 const intake=stageTechnicalTable183({csvBytes:source,custody,scope,schema,asOf:args.asOf});
 assert.equal(intake.status,'staged_unreviewed');
 const zero=openIntakeJournal183('air_purifier','esuid_4027325');
 const j=appendStagedIntake183({journal:zero,intake,sourceBytes:source,expectedRevision:0,expectedHash:zero.snapshotHash});
 assert.equal(j.revision,1);assert.equal(j.events[0].reviewState,'pending_independent_review');
 assert.equal(j.rankingAuthorized,false);
 const replay=appendStagedIntake183({journal:j,intake,sourceBytes:source,expectedRevision:1,expectedHash:j.snapshotHash});
 assert.equal(replay.revision,1);
 assert.throws(()=>appendStagedIntake183({journal:j,intake,sourceBytes:source,expectedRevision:0,expectedHash:zero.snapshotHash}),/stale_journal/);
});
test('source identity cannot be changed to the other product by changing only the model label',()=>{
 const a=result();const x=a.candidates.find(x=>x.esuid==='4027325');assert.ok(x);
 const y=a.candidates.find(other=>other.esuid!==x.esuid);assert.ok(y);
 assert.notEqual(x.rowSha256,y.rowSha256);
 assert.ok(x.observations.every(o=>o.rowSha256===x.rowSha256));
 assert.ok(y.observations.every(o=>o.rowSha256===y.rowSha256));
});
test('Canadian market is separately filtered and never silently inherited from US list',()=>{
 const ca=stageEpaRegistry184({...args,market:'ca'});
 assert.equal(ca.rows,247);assert.equal(ca.candidates.length+ca.held.length,247);
 assert.ok(ca.held.some(x=>x.reason==='out_of_market'));
 assert.notEqual(ca.candidates.length,result().candidates.length);
 assert.equal(verifyEpaPilot184(ca,source),true);
});
