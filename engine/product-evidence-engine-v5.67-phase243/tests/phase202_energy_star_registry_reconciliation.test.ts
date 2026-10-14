import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {reconcileRoomAirRegistry202,ENERGY_STAR_ROOM_AIR_202,
 type RegistrySnapshot202,type RegistryTarget202} from '../src/phase202_energy_star_registry_reconciliation.js';
const target=():RegistryTarget202=>({exactVariantId:'variant_a1',brandName:'Acme',
 modelNumber:'XY-100',market:'United States',category:'room_air_cleaners',
 asOf:'2026-10-13',maxDatasetAgeDays:30,disqualificationReviewIds:[]});
const record=(overrides:Record<string,unknown>={})=>({pd_id:4567890,brand_name:'Acme',
 model_number:'XY-100',markets:'United States, Canada',date_qualified:'2026-09-01',
 additional_model_information:'XY-100 Series',...overrides});
function snap(records:unknown= [record()]):RegistrySnapshot202{
 const bytes=new TextEncoder().encode(JSON.stringify(records));return {
  sourceUrl:ENERGY_STAR_ROOM_AIR_202.apiEndpoint,datasetId:'gaa3-swy6',
  specification:'3.0',datasetUpdatedOn:'2026-09-28',acquiredOn:'2026-10-12',
  capturedBytes:bytes,reviewedSha256:createHash('sha256').update(bytes).digest('hex'),
  issuerAuthenticatedByRuntime:false};
}
test('exactly scoped fresh record is a candidate, never a certified badge',()=>{
 const result=reconcileRoomAirRegistry202(target(),snap());
 assert.equal(result.status,'registry_record_candidate');
 assert.deepEqual(result.matchingEsuids,['4567890']);
 assert.equal(result.claimScope,'energy_efficiency_programme_only');
 assert.equal(result.sufficientForPublication,false);
 assert.equal(result.certificateStillActiveAuthenticated,false);
 assert.equal(result.specialistOutcomeValidation,false);
 assert.equal(result.consumerBadgeAuthorized,false);
 assert.equal(result.rankingChanged,false);
 assert.equal(result.fullRegistryRowsPersisted,false);
 assert.equal('rows' in result,false);
 assert.equal(JSON.stringify(result).includes('additional_model_information'),false);
});
test('case variants can match only identical ASCII model components',()=>{
 assert.equal(reconcileRoomAirRegistry202({...target(),brandName:'ACME',modelNumber:'xy-100'},snap()).status,
  'registry_record_candidate');
});
test('model-variant suffix cannot be silently substituted',()=>{
 assert.equal(reconcileRoomAirRegistry202({...target(),modelNumber:'XY-100A'},snap()).status,
  'absent_from_supplied_snapshot');
});
test('different brand is never confused with correct model',()=>{
 assert.equal(reconcileRoomAirRegistry202({...target(),brandName:'Acme Two'},snap()).status,
  'absent_from_supplied_snapshot');
});
test('different market cannot share certification',()=>{
 assert.equal(reconcileRoomAirRegistry202({...target(),market:'Canada'},snap([record({markets:'United States'})])).status,
  'absent_from_supplied_snapshot');
});
test('country array accepted but no substring matching',()=>{
 assert.equal(reconcileRoomAirRegistry202({...target(),market:'Canada'},snap([record({markets:['United States','Canada']})])).status,
  'registry_record_candidate');
 assert.equal(reconcileRoomAirRegistry202(target(),snap([record({markets:'United States of America'})])).status,
  'absent_from_supplied_snapshot');
});
test('fuzzy, free text family alias cannot stand in for an exact variant',()=>{
 assert.equal(reconcileRoomAirRegistry202(target(),snap([record({model_number:'XY-200',additional_model_information:'XY-100'})])).status,
  'absent_from_supplied_snapshot');
});
test('model row wildcards cannot be upgraded to exact model certification',()=>{
 assert.equal(reconcileRoomAirRegistry202(target(),snap([record({model_number:'XY-1##'})])).status,
  'absent_from_supplied_snapshot');
});
test('homoglyphs and whitespace quirks do not lead to a false match',()=>{
 assert.equal(reconcileRoomAirRegistry202(target(),snap([record({model_number:'XY–100'})])).status,
  'absent_from_supplied_snapshot');
 assert.equal(reconcileRoomAirRegistry202(target(),snap([record({model_number:' XY-100'})])).status,
  'absent_from_supplied_snapshot');
});
test('two separate ESUIDs for same model require manual reconciliation',()=>{
 const out=reconcileRoomAirRegistry202(target(),snap([record(),record({pd_id:4567891})]));
 assert.equal(out.status,'ambiguous_matching_records');
 assert.deepEqual(out.matchingEsuids,['4567890','4567891']);
});
test('same duplicate ESUID twice is still an ambiguous dataset',()=>{
 assert.equal(reconcileRoomAirRegistry202(target(),snap([record(),record()])).status,
  'ambiguous_matching_records');
});
test('operator noted possible withdrawal triggers explicit human review',()=>{
 const out=reconcileRoomAirRegistry202({...target(),disqualificationReviewIds:['4567890']},snap());
 assert.equal(out.status,'withdrawal_or_disqualification_review');
 assert.equal(out.consumerBadgeAuthorized,false);
});
test('absence cannot become a negative product quality evaluation',()=>{
 const out=reconcileRoomAirRegistry202(target(),snap([record({pd_id:1234567,model_number:'OTHER'})]));
 assert.equal(out.status,'absent_from_supplied_snapshot');
 assert.equal(out.rankingChanged,false);
 assert.ok(out.evidenceLimits.includes('absence_not_exclusion_until_complete_dataset_verified'));
});
test('expired snapshot is not accepted even when model matches',()=>{
 assert.equal(reconcileRoomAirRegistry202({...target(),asOf:'2026-12-20'},snap()).status,
  'stale_registry_snapshot');
});
test('snapshot acquired after decision date is rejected',()=>{
 assert.equal(reconcileRoomAirRegistry202({...target(),asOf:'2026-10-11'},snap()).status,
  'unsupported_scope');
});
test('wrong dataset identity is rejected',()=>{
 assert.equal(reconcileRoomAirRegistry202(target(),{...snap(),datasetId:'other'}).status,
  'unsupported_scope');
});
test('wrong host, mirror or path cannot pass source mapping',()=>{
 assert.equal(reconcileRoomAirRegistry202(target(),{...snap(),sourceUrl:'https://other.example/resource/gaa3-swy6.json'}).status,
  'unsupported_scope');
 assert.equal(reconcileRoomAirRegistry202(target(),{...snap(),sourceUrl:ENERGY_STAR_ROOM_AIR_202.apiEndpoint+'/foo'}).status,
  'unsupported_scope');
});
test('old v2 row cannot silently support v3 scope',()=>{
 assert.equal(reconcileRoomAirRegistry202(target(),{...snap(),specification:'2.0'}).status,
  'unsupported_scope');
});
test('replaced source bytes without digest update are rejected',()=>{
 const s=snap();s.capturedBytes=new TextEncoder().encode(JSON.stringify([record({model_number:'EVIL'})]));
 assert.equal(reconcileRoomAirRegistry202(target(),s).status,'unverified_registry_bytes');
});
test('incorrect recorded document digest is rejected',()=>{
 assert.equal(reconcileRoomAirRegistry202(target(),{...snap(),reviewedSha256:'0'.repeat(64)}).status,
  'unverified_registry_bytes');
});
test('invalid UTF8 and syntactically invalid JSON are refused',()=>{
 const s=snap(); s.capturedBytes=Uint8Array.from([0xff]);
 s.reviewedSha256=createHash('sha256').update(s.capturedBytes).digest('hex');
 assert.equal(reconcileRoomAirRegistry202(target(),s).status,'snapshot_incomplete');
 const q=snap();q.capturedBytes=new TextEncoder().encode('{');
 q.reviewedSha256=createHash('sha256').update(q.capturedBytes).digest('hex');
 assert.equal(reconcileRoomAirRegistry202(target(),q).status,'snapshot_incomplete');
});
test('a single record object does not masquerade as full dataset array',()=>{
 assert.equal(reconcileRoomAirRegistry202(target(),snap(record())).status,'snapshot_incomplete');
 assert.equal(reconcileRoomAirRegistry202(target(),snap([])).status,'snapshot_incomplete');
});
test('bad API record id prevents positive match',()=>{
 assert.equal(reconcileRoomAirRegistry202(target(),snap([record({pd_id:'bad'})])).status,'snapshot_incomplete');
});
test('non 7-digit ESUID refused',()=>{
 assert.equal(reconcileRoomAirRegistry202(target(),snap([record({pd_id:123})])).status,'snapshot_incomplete');
});
test('unreviewed attempted authentication flag refused',()=>{
 assert.equal(reconcileRoomAirRegistry202(target(),{...snap(),issuerAuthenticatedByRuntime:true} as unknown as RegistrySnapshot202).status,
  'unsupported_scope');
});
test('invalid asOf and unreasonable freshness policy throw',()=>{
 assert.throws(()=>reconcileRoomAirRegistry202({...target(),asOf:'2026-02-30'},snap()),/phase202_invalid_request/);
 assert.throws(()=>reconcileRoomAirRegistry202({...target(),maxDatasetAgeDays:366},snap()),/phase202_invalid_request/);
});
test('large unbounded input is rejected',()=>{
 const s=snap();s.capturedBytes=new Uint8Array(2_000_001);
 assert.equal(reconcileRoomAirRegistry202(target(),s).status,'unverified_registry_bytes');
});
test('malformed or duplicate withdrawal IDs are not accepted',()=>{
 assert.throws(()=>reconcileRoomAirRegistry202({...target(),disqualificationReviewIds:['4567890','4567890']},snap()),/phase202_invalid_request/);
 assert.throws(()=>reconcileRoomAirRegistry202({...target(),disqualificationReviewIds:['bad']},snap()),/phase202_invalid_request/);
});
test('market incorrect string does not produce supported scope',()=>{
 assert.equal(reconcileRoomAirRegistry202({...target(),market:'UK' as 'Canada'},snap()).status,'unsupported_scope');
});
test('sparse dataset row with unrelated fields is not a performance test',()=>{
 const s=snap([record({unrelated_commentary:'Great for espresso'})]);
 const r=reconcileRoomAirRegistry202(target(),s);
 assert.equal(r.status,'registry_record_candidate');
 assert.equal(r.specialistOutcomeValidation,false);
 assert.equal(JSON.stringify(r).includes('espresso'),false);
});
test('date after October 2025 condition enforced for v3',()=>{
 assert.equal(reconcileRoomAirRegistry202(target(),{...snap(),datasetUpdatedOn:'2025-08-10'}).status,'unsupported_scope');
});
test('snapshot future update relative to capture is impossible',()=>{
 assert.equal(reconcileRoomAirRegistry202(target(),{...snap(),datasetUpdatedOn:'2026-11-01'}).status,'unsupported_scope');
});
test('different input rows order leaves deterministic output',()=>{
 const a=record(); const b=record({pd_id:1234567,model_number:'OTHER'});
 assert.deepEqual(reconcileRoomAirRegistry202(target(),snap([a,b])).matchingEsuids,
  reconcileRoomAirRegistry202(target(),snap([b,a])).matchingEsuids);
});
