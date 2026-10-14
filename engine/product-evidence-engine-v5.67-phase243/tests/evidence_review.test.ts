import test from 'node:test';
import assert from 'node:assert/strict';
import { evidenceFingerprint, auditEvidenceReviews, type EvidenceApproval } from '../src/evidence_review.js';
import type { Evidence } from '../src/types.js';
const now='2026-10-10T14:00:00Z';
const base: Evidence={id:'e1',originalTestId:'original-test-1',source:'Fictional lab',sourceUrl:'https://example.org/test',
  testedVariantId:'UK-X',applicableVariantIds:['UK-X'],dimension:'carpet',value:7,scale:'synthetic_0_10',
  protocolId:'test-v1',conditions:{temperature:'22C'},status:'admitted',rights:'authorized'};
function approve(e:Evidence):EvidenceApproval {return {
  id:'review1',evidenceId:e.id,evidenceFingerprint:evidenceFingerprint(e),status:'approved',reviewer:'synthetic-editor',publisherType:'independent_testing',
  reviewedAt:'2026-10-09T00:00:00Z',expiresAt:'2026-11-10T00:00:00Z',
  publisherIdentityReference:'example-publisher',commercialReuseGrantReference:'example-licence',
  testMethodologyReference:'example-method',originalTestReference:'example-test',
  exactTestedVariantReference:'example-variant',
};}
const audit=(e:Evidence[],a:EvidenceApproval[]=e.map(approve))=>auditEvidenceReviews(e,a,now,['UK-X']);
test('documented synthetic proof passes pilot gate but can NEVER be called publishable',()=>{
  const r=audit([base]);assert.equal(r.admitted.length,1);assert.equal(r.publishable,false);
});
test('no reviewer, duplicate reviews, revoked and expired reviews all fail closed',()=>{
  assert.equal(audit([base],[]).rejected[0].reason,'missing_or_ambiguous_editorial_review');
  assert.equal(audit([base],[approve(base),approve(base)]).admitted.length,0);
  assert.equal(audit([base],[{...approve(base),status:'revoked'}]).admitted.length,0);
  assert.equal(audit([base],[{...approve(base),expiresAt:'2026-10-01T00:00:00Z'}]).admitted.length,0);
  assert.equal(audit([base],[{...approve(base),reviewedAt:'2027-01-01T00:00:00Z'}]).admitted.length,0);
});
test('every material field is review-bound: value, URL, tested variant, conditions and rights',()=>{
  const a=approve(base);
  for (const changed of [
    {...base,value:9}, {...base,sourceUrl:'https://another.example/test'},
    {...base,testedVariantId:'UK-Y',applicableVariantIds:['UK-Y']},
    {...base,conditions:{temperature:'30C'}}, {...base,rights:'unknown' as const}
  ]) assert.equal(audit([changed],[a]).admitted.length,0);
});
test('cross-variant inference is barred even if reviewer record claims to approve it',()=>{
  const e={...base,applicableVariantIds:['UK-X','UK-Y']};
  const r=audit([e],[approve(e)]);
  assert.equal(r.rejected[0].reason,'unverified_cross_variant_applicability');
});
test('non-HTTPS and credential-bearing source references fail closed',()=>{
  for(const sourceUrl of ['http://example.org/test','https://u:p@example.org/test','https://localhost/a', 'file:///tmp/doc']) {
    const e={...base,sourceUrl};
    assert.equal(audit([e],[approve(e)]).rejected[0].reason,'untrusted_source_url');
  }
});
test('conflicting syndicated measurements for the same original test are excluded',()=>{
  const copy={...base,id:'e2',sourceUrl:'https://example.net/test',value:8};
  const r=audit([base,copy]);
  assert.equal(r.admitted.length,0);
  assert.deepEqual(r.rejected.map(e=>e.reason),['conflicting_syndicated_test_copies','conflicting_syndicated_test_copies']);
});
test('literal duplicate evidence identifiers are rejected',()=>{
  const r=audit([base,base]);assert.equal(r.admitted.length,0);
  assert.equal(r.rejected[0].reason,'missing_or_duplicate_evidence_id');
});
test('missing commercial reuse permission reference blocks score admission',()=>{
  const r=audit([base],[{...approve(base),commercialReuseGrantReference:''}]);
  assert.equal(r.rejected[0].reason,'approval_or_documentation_missing');
});
test('fingerprint stable under ordering of protocol conditions and variant IDs',()=>{
  const e={...base,conditions:{z:'1',a:'2'}};
  assert.equal(evidenceFingerprint(e),evidenceFingerprint({...e,conditions:{a:'2',z:'1'}}));
});
test('audit rejects malformed evaluation timestamps',()=>{
  assert.throws(()=>auditEvidenceReviews([base],[approve(base)],'not-a-time',['UK-X']),/Valid audit time/);
});

test('Amazon-sourced measurements cannot enter independent ranking, even with a forged approval',()=>{
  const e={...base,sourceUrl:'https://www.amazon.co.uk/dp/B012345678'};
  const r=audit([e],[approve(e)]);
  assert.equal(r.admitted.length,0);
  assert.equal(r.rejected[0].reason,'amazon_source_not_allowed_for_independent_ranking');
});
test('retailers and manufacturer materials are not treated as independent product tests',()=>{
  for(const publisherType of ['retailer','manufacturer'] as const) {
    const r=audit([base],[{...approve(base),publisherType}]);
    assert.equal(r.rejected[0].reason,'nonindependent_source');
  }
});
