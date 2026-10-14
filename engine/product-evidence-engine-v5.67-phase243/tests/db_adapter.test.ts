import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {rankSnapshot} from '../src/db_adapter.js';
const request={market:'UK' as const,currency:'GBP',weights:{carpet:15,pet_hair:70,ease:15}};
const fixture=JSON.parse(readFileSync('fixtures/bridge-synthetic.json','utf8'));
const copy=()=>{const s=structuredClone(fixture); for(const v of s.variants) v.observed_at=new Date().toISOString(); return s;};

test('synthetic bridge runs full deterministic ranking and retains evidence trace',()=>{
  const report=rankSnapshot(copy(),request,'synthetic_fixture');
  assert.equal(report.result.winnerId,'B-UK');
  assert.equal(report.acceptedEvidence,8);
  assert.ok(report.result.candidates.find(c=>c.variantId==='B-UK')?.usedEvidenceIds.length);
});
test('production rejects synthetic input regardless of its contents',()=>{
  assert.throws(()=>rankSnapshot(copy(),request,'production'),/live DB/);
});
test('production refuses real evidence without validated normalization',()=>{
  const s=copy(); s.origin='live-postgres-eligible-view';
  const r=rankSnapshot(s,request,'production');
  assert.equal(r.acceptedEvidence,0);
  assert.equal(r.result.outcome,'insufficient_evidence');
  assert.ok(r.rejectedEvidence.some(e=>e.reason.includes('normalization')));
});
test('rejects stale or future merchant offers, rather than assuming current price',()=>{
  const s=copy();s.variants[0].observed_at='2020-01-01T00:00:00Z';
  const r=rankSnapshot(s,request,'synthetic_fixture');
  assert.ok(!r.result.candidates.some(c=>c.variantId==='A-UK'));
});
test('rejects cross-market transfer of evidence',()=>{
  const s=copy();s.evidence[0].tested_variant_id='A-US';
  const r=rankSnapshot(s,request,'synthetic_fixture');
  assert.ok(r.rejectedEvidence.some(e=>e.reason.includes('Cross-variant')));
});
test('rejects unsupported measurement units, never assumes scale equivalence',()=>{
  const s=copy();s.evidence[0].unit='kPa';
  const r=rankSnapshot(s,request,'synthetic_fixture');
  assert.ok(r.rejectedEvidence.some(e=>e.reason.includes('metric/unit')));
});
test('rejects missing source citation URL',()=>{
  const s=copy();s.evidence[0].source_url='';
  const r=rankSnapshot(s,request,'synthetic_fixture');
  assert.ok(r.rejectedEvidence.some(e=>e.reason.includes('string')));
});
test('unknown snapshot origin cannot be used in either mode',()=>{
  const s=copy();s.origin='user-supplied';
  assert.throws(()=>rankSnapshot(s,request,'synthetic_fixture'));
  assert.throws(()=>rankSnapshot(s,request,'production'));
});
