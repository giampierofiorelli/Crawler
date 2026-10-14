import test from 'node:test';
import assert from 'node:assert/strict';
import { fingerprintManufacturerRecord, gateManufacturerRecords,
  type ManufacturerPublisherApproval, type ManufacturerPriceEditorialApproval } from '../src/manufacturer_editorial_gate.js';
import type { ManufacturerListPriceRecord } from '../src/list_price_context.js';

const nowIso='2026-10-10T12:00:00Z';
const record: ManufacturerListPriceRecord={
  variantId:'P1', market:'UK',currency:'GBP',amount:195,sourceKind:'manufacturer',
  sourceUrl:'https://manufacturer.example/list-price/model-xyz',
  verifiedAt:'2026-10-01T00:00:00Z',validUntil:'2026-11-01T00:00:00Z',
  rights:'authorized',exactVariantVerified:true,reviewer:'submitter',evidenceReference:'capture-0001',
};
const publisher: ManufacturerPublisherApproval={
  manufacturerId:'maker-1',exactHosts:['manufacturer.example'],
  identityEvidenceReference:'ownership-manual-review',rightsEvidenceReference:'contract-manual-review',
  rightsScope:'internal_list_price_budget_reference',reviewedBy:'publisher-reviewer',
  reviewedAt:'2026-10-02T00:00:00Z',validUntil:'2026-11-01T00:00:00Z',status:'approved',
};
const approved: ManufacturerPriceEditorialApproval={
  approvalId:'approval-1',recordSha256:fingerprintManufacturerRecord(record),
  manufacturerId:'maker-1',submittedBy:'submitter',reviewedBy:'another-reviewer',
  reviewedAt:'2026-10-03T00:00:00Z',validUntil:'2026-11-01T00:00:00Z',
  captureEvidenceReference:'capture-0001',captureSha256:'a'.repeat(64),variantMatchEvidenceReference:'exact-sku-check',
  rightsEvidenceReference:'contract-manual-review',status:'approved',
};
const gate=(r:ManufacturerListPriceRecord=record, p:ManufacturerPublisherApproval=publisher, a:ManufacturerPriceEditorialApproval=approved)=>
  gateManufacturerRecords({records:[r],publishers:[p],approvals:[a],nowIso});
const check=(expected:string, r:ManufacturerListPriceRecord=record, p:ManufacturerPublisherApproval=publisher, a:ManufacturerPriceEditorialApproval=approved)=>{
  const output=gate(r,p,a);
  assert.equal(output.acceptedRecords.length,0);
  assert.equal(output.audit[0].reason,expected);
  assert.ok(!JSON.stringify(output.audit).includes('195'));
};

test('no editorial approval or publisher domain registry => fail closed',()=>{
  assert.deepEqual(gateManufacturerRecords({records:[record],approvals:[],publishers:[],nowIso}).audit,
    [{variantId:'P1',accepted:false,reason:'missing_approval'}]);
  check('unverified_publisher',record,{...publisher,manufacturerId:'different'});
});
test('separate editorial and source approvals admit synthetic reference',()=>{
  const out=gate();
  assert.deepEqual(out.audit,[{variantId:'P1',accepted:true}]);
  assert.deepEqual(out.acceptedRecords,[record]);
});
test('approval fingerprint binds amount, variant, market, evidence URL, review status and evidence refs',()=>{
  for(const change of [{amount:1},{variantId:'P2'},{market:'US' as const},{sourceUrl:'https://manufacturer.example/other'},
    {rights:'unknown' as const},{evidenceReference:'replaced'}]) check('missing_approval',{...record,...change});
});
test('source must match publisher exact hostname, not plausible suffix or lookalike',()=>{
  for(const hostname of ['manufacturer.example.evil.org','other.example','manufacturеr.example']) {
    const r={...record,sourceUrl:`https://${hostname}/list-price/model-xyz`};
    check('source_not_allowlisted',r,publisher,{...approved,recordSha256:fingerprintManufacturerRecord(r)});
  }
});
test('cannot self-approve manufacturer record or publisher',()=>{
  check('review_not_independent',record,publisher,{...approved,reviewedBy:'submitter'});
  check('review_not_independent',record,{...publisher,reviewedBy:'submitter'});
});
test('rights, publisher revocation, approval expiry and revoked review fail closed',()=>{
  check('rights_unverified',record,{...publisher,status:'revoked'});
  check('rights_unverified',record,{...publisher,rightsScope:'wrong' as never});
  check('approval_expired',record,publisher,{...approved,validUntil:'2026-10-09T00:00:00Z'});
  check('approval_expired',record,{...publisher,validUntil:'2026-10-09T00:00:00Z'});
  check('invalid_approval',record,publisher,{...approved,status:'revoked'});
  check('rights_unverified',record,publisher,{...approved,captureEvidenceReference:'different-evidence'});
});
test('ambiguous and duplicate editorial approvals fail closed',()=>{
  const out=gateManufacturerRecords({records:[record],publishers:[publisher],approvals:[approved,{...approved,approvalId:'approval-2'}],nowIso});
  assert.equal(out.audit[0].reason,'ambiguous_approval');
});
test('invalid review timestamps are rejected',()=>{
  check('invalid_approval',record,publisher,{...approved,reviewedAt:'2026-10-11T00:00:00Z'});
  assert.throws(()=>gateManufacturerRecords({records:[record],approvals:[approved],publishers:[publisher],nowIso:'not-a-date'}));
});
test('captured evidence fingerprint and right scope are mandatory',()=>{
  check('invalid_approval',record,publisher,{...approved,captureSha256:'not-digested'});
  check('rights_unverified',record,publisher,{...approved,rightsEvidenceReference:'other-contract'});
  check('invalid_approval',record,publisher,{...approved,reviewedAt:'2026-09-30T00:00:00Z'});
});
