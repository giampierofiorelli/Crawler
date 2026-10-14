import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {auditOriginalTestLineage,deriveQuarantinedExport,originalMeasurementFingerprint,
  type OriginalTestLineage,type DownstreamReport} from '../src/evidence_lineage.js';
import type {OriginalLabMeasurement,QuarantinedLabExport} from '../src/lab_needs_bridge.js';
const rows=():OriginalLabMeasurement[]=>[
  {record_id:'a',original_test_id:'testone',test_url:'https://lab.example.org/tests/one',tested_variant:'headphone_a',
    criterion:'battery',measurement:20,unit:'hours',protocol_id:'testcycle',protocol_version:'1',conditions:{anc:'on'},tested_at:'2026-09-01T00:00:00Z'},
  {record_id:'b',original_test_id:'testtwo',test_url:'https://lab.example.org/tests/two',tested_variant:'headphone_a',
    criterion:'battery',measurement:19,unit:'hours',protocol_id:'testcycle',protocol_version:'1',conditions:{anc:'on'},tested_at:'2026-09-01T00:00:00Z'},
];
const exportRows=(measurements=rows()):QuarantinedLabExport=>({source_kind:'original_independent_lab_measurements',review_only:true,
 ranking_input_approved:false,rights_status:'human_attested_not_cryptographically_verified',publisher_domain:'lab.example.org',
 input_sha256:'a'.repeat(64),measurements});
const attest=(m:OriginalLabMeasurement,opts:Partial<OriginalTestLineage>={}):OriginalTestLineage=>({recordId:m.record_id,
 originalTestId:m.original_test_id,testExecutionId:m.original_test_id,originalDatasetSha256:m.original_test_id==='testone'?'1'.repeat(64):'2'.repeat(64),
 sourceRole:'original_measurement',reviewStatus:'documented_by_editor',reviewerId:'sample_editor',
 originalTestReference:m.test_url,reviewReference:'Synthetic documentary check; no external verification',
 measurementFingerprint:originalMeasurementFingerprint(m),rightsStatus:'research_only',...opts});
const report=(id:string,testId:string):DownstreamReport=>({id,originalTestId:testId,
 sourceUrl:`https://editor.example.org/posts/${id}`,reportKind:'syndication',lineageReference:'https://lab.example.org/tests/one'});
const run=(ms=rows(),as=ms.map(m=>attest(m)),rs:DownstreamReport[]=[])=>auditOriginalTestLineage(exportRows(ms),as,rs);
test('two originally reported test executions, not two reports, count as two documented tests',()=>{
 const result=run();assert.equal(result.counts.primaryTestExecutionsFromDocumentedLineage,2);
 assert.equal(result.admittedOriginalRecordIds.length,2);assert.equal(result.statisticalConfidence,null);
 assert.equal(result.scientificallyVerifiedIndependence,false);assert.equal(result.rankingEligible,false);
 assert.equal(result.observedBetweenTestVariation.length,1);
});
test('10 syndicated reports keep original test count unchanged',()=>{
 const result=run(rows(),rows().map(m=>attest(m)),Array.from({length:10},(_,i)=>report(`report${i}`, 'testone')));
 assert.equal(result.counts.primaryTestExecutionsFromDocumentedLineage,2);
 assert.equal(result.counts.downstreamReports,10);
 assert.equal(result.originGroups.find(g=>g.originalTestId==='testone')!.downstreamReportIds.length,10);
});
test('multiple identical first-party records of the same test are counted once',()=>{
 const ms=rows();ms.push({...ms[0],record_id:'copya'});
 const result=run(ms);assert.equal(result.counts.primaryTestExecutionsFromDocumentedLineage,2);
 assert.deepEqual(result.admittedOriginalRecordIds,['a','b']);assert(result.excludedRecordIds.includes('copya'));
});
test('conflicting values attributed to the SAME original measurement trigger quarantine',()=>{
 const ms=rows();ms.push({...ms[0],record_id:'copya',measurement:30});
 const result=run(ms);assert(result.issues.some(x=>x.code==='inconsistent_values_within_test'));
 assert(!result.admittedOriginalRecordIds.includes('a'));assert(!result.admittedOriginalRecordIds.includes('copya'));
 assert.deepEqual(result.admittedOriginalRecordIds,['b']);
});
test('the same dataset hash under two different test IDs does NOT count as replication',()=>{
 const ms=rows();const as=ms.map(m=>attest(m,{originalDatasetSha256:'b'.repeat(64)}));
 const result=run(ms,as);assert.equal(result.counts.primaryTestExecutionsFromDocumentedLineage,0);
 assert(result.issues.some(x=>x.code==='shared_dataset_across_claimed_tests'));
});
test('missing documentary review quarantines without substituting synthetic evidence',()=>{
 const result=run(rows(),[attest(rows()[0])]);assert.deepEqual(result.admittedOriginalRecordIds,['a']);
 assert(result.issues.some(x=>x.code==='missing_or_ambiguous_attestation'));
});
test('unresolved identity is not silently accepted',()=>{
 const ms=rows();const result=run(ms,ms.map(m=>attest(m,{reviewStatus:'unresolved'})));
 assert.equal(result.admittedOriginalRecordIds.length,0);
 assert(result.issues.every(x=>x.code==='unverified_lineage'));
});
test('fake source role does not make a syndicated copy count as primary',()=>{
 const ms=rows();const as=ms.map(m=>attest(m,{sourceRole:'syndicated_report'}));
 const result=run(ms,as);assert.equal(result.counts.primaryTestExecutionsFromDocumentedLineage,0);
 assert(result.issues.some(x=>x.code==='missing_original_primary_record'));
});
test('edited measurement invalidates the original documentary fingerprint',()=>{
 const ms=rows();const as=ms.map(m=>attest(m));ms[0].measurement=22;
 const result=run(ms,as);assert(!result.admittedOriginalRecordIds.includes('a'));
 assert(result.issues.some(x=>x.code==='unreviewed_measurement'));
});
test('records with different protocols must not be called statistically conflicting',()=>{
 const ms=rows();ms[1].protocol_id='alternatecycle';
 const result=run(ms);assert.equal(result.observedBetweenTestVariation.length,0);
 assert.equal(result.admittedOriginalRecordIds.length,2);
 assert.equal(result.methodAndContextDifferences.length,1);
});
test('two measured values are descriptive variation, not a statistical confidence claim',()=>{
 const result=run();assert.equal(result.observedBetweenTestVariation.length,1);
 assert.equal(result.observedBetweenTestVariation[0].values.length,2);
 assert.equal(result.statisticalConfidence,null);
});
test('quarantined export is derived, hash changed and never approved for ranking',()=>{
 const exp=exportRows();const audit=run();const derived=deriveQuarantinedExport(exp,audit);
 assert.notEqual(derived.input_sha256,exp.input_sha256);
 assert.equal(derived.ranking_input_approved,false);
 assert.equal(derived.review_only,true);assert.equal(derived.measurements.length,2);
});
test('unknown downstream reports are not counted as primary and are flagged',()=>{
 const result=run(rows(),rows().map(m=>attest(m)),[report('foreignreport','othertest')]);
 assert(result.issues.some(x=>x.code==='unattached_downstream_report'));
 assert.equal(result.counts.primaryTestExecutionsFromDocumentedLineage,2);
});
test('quarantined feeds only: cannot input a live/approved ranking feed',()=>{
 const exp=exportRows();(exp as unknown as {ranking_input_approved:boolean}).ranking_input_approved=true;
 assert.throws(()=>auditOriginalTestLineage(exp,rows().map(m=>attest(m))),/quarantined/);
});
test('two attestations on one original record are not interpreted as stronger evidence',()=>{
 const ms=rows();const as=ms.map(m=>attest(m));as.push(attest(ms[0]));
 const result=run(ms,as);
 assert.deepEqual(result.admittedOriginalRecordIds,['b']);
 assert(result.issues.some(x=>x.code==='missing_or_ambiguous_attestation'));
});
test('publisher mismatch on claimed primary report is blocked',()=>{
 const ms=rows();const as=ms.map(m=>attest(m));as[0].originalTestReference='https://unrelated.example.org/test';
 const result=run(ms,as);assert.deepEqual(result.admittedOriginalRecordIds,['b']);
 assert(result.issues.some(x=>x.code==='unverified_lineage'));
});
test('inconsistent execution metadata within same original test is quarantined',()=>{
 const ms=rows();ms.push({...ms[0],record_id:'repeat',criterion:'comfort',unit:'points'});
 const as=ms.map(m=>attest(m));as[2].testExecutionId='anotherexecution';
 const result=run(ms,as);assert.deepEqual(result.admittedOriginalRecordIds,['b']);
 assert(result.issues.some(x=>x.code==='conflicting_original_identity'));
});
test('source roles and publication readiness remain distinct from actual license validation',()=>{
 const ms=rows();const as=ms.map(m=>attest(m,{rightsStatus:'documented_commercial_grant',rightsReference:'synthetic grant'}));
 const result=run(ms,as);assert.equal(result.publicationReady,false);
 assert.equal(result.scientificallyVerifiedIndependence,false);
});

test('cannot replay a prior lineage audit against modified records',()=>{
 const exp=exportRows(),audit=run();exp.measurements[0].measurement=333;
 assert.throws(()=>deriveQuarantinedExport(exp,audit),/does not match/);
});
test('method and context mismatch is reported without merging results',()=>{
 const ms=rows();ms[1].conditions={anc:'off'};
 const result=run(ms);
 assert.equal(result.methodAndContextDifferences.length,1);
 assert.equal(result.observedBetweenTestVariation.length,0);
});
