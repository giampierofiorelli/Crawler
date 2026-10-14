import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {auditOriginalTestLineage,originalMeasurementFingerprint,type OriginalTestLineage} from '../src/evidence_lineage.js';
import {appraiseOriginalEvidence,type OriginalRecordReview,type ReviewedMethodDomain,type DocumentedUseCase,type MethodDomain} from '../src/evidence_appraisal.js';
import type {OriginalLabMeasurement,QuarantinedLabExport} from '../src/lab_needs_bridge.js';
const domains:MethodDomain[]=['sample_selection','protocol_documentation','instrument_qualification',
 'repeatability_information','conflicts_of_interest','data_completeness'];
const measurements=():OriginalLabMeasurement[]=>[
 {record_id:'first',original_test_id:'originalone',test_url:'https://lab.example.org/one',tested_variant:'headphone_a',criterion:'battery',measurement:20,
  unit:'hours',protocol_id:'batterycycle',protocol_version:'v2',conditions:{anc:'on',volume:'fixed'},tested_at:'2026-09-10T00:00:00Z'},
 {record_id:'second',original_test_id:'originaltwo',test_url:'https://lab.example.org/two',tested_variant:'headphone_a',criterion:'battery',measurement:18,
  unit:'hours',protocol_id:'batterycycle',protocol_version:'v2',conditions:{anc:'on',volume:'fixed'},tested_at:'2026-09-11T00:00:00Z'},
];
const exp=(rows=measurements()):QuarantinedLabExport=>({source_kind:'original_independent_lab_measurements',review_only:true,ranking_input_approved:false,
 rights_status:'human_attested_not_cryptographically_verified',publisher_domain:'lab.example.org',input_sha256:'a'.repeat(64),measurements:rows});
const attest=(m:OriginalLabMeasurement):OriginalTestLineage=>({recordId:m.record_id,originalTestId:m.original_test_id,
 testExecutionId:m.original_test_id,originalDatasetSha256:(m.record_id==='first'?'1':'2').repeat(64),
 sourceRole:'original_measurement',reviewStatus:'documented_by_editor',reviewerId:'reviewer_one',
 originalTestReference:m.test_url,reviewReference:'Fictional editorial documentary record',
 measurementFingerprint:originalMeasurementFingerprint(m),rightsStatus:'research_only'});
const method=(finding:ReviewedMethodDomain['finding']='documented'):ReviewedMethodDomain[]=>domains.map(domain=>({domain,finding,
 ...(finding!=='not_reported'?{reference:`https://lab.example.org/method/${domain}`}:{ }),
 ...(['documented_concern','not_applicable'].includes(finding)?{rationale:'Documentary rationale for this method domain'}:{})
}));
const review=(m:OriginalLabMeasurement):OriginalRecordReview=>({recordId:m.record_id,
 measurementFingerprint:originalMeasurementFingerprint(m),reviewerId:'editor_one',reviewReference:'https://lab.example.org/review',method:method()});
const useCase=():DocumentedUseCase=>({id:'travel_battery',mappingReference:'https://research.example.org/needs/travel',
 variantId:'headphone_a',criterion:'battery',unit:'hours',protocolId:'batterycycle',protocolVersion:'v2',
 conditions:{volume:'fixed',anc:'on'}});
const go=(options?:{measurements?:OriginalLabMeasurement[];reviews?:OriginalRecordReview[];useCases?:DocumentedUseCase[];
 attestations?:OriginalTestLineage[]})=>{
 const rows=options?.measurements??measurements();const exportData=exp(rows);
 const attestations=options?.attestations??rows.map(attest);
 const lineage=auditOriginalTestLineage(exportData,attestations);
 return appraiseOriginalEvidence({exportData,lineage,reviews:options?.reviews??rows.map(review),useCases:options?.useCases??[useCase()]});
};
test('two separately documented original executions remain documentary observations not statistical confidence',()=>{
 const r=go();assert.equal(r.records.length,2);assert.equal(r.useCases[0].exactContextRecords.length,2);
 assert.equal(r.reliabilityScore,null);assert.equal(r.confidencePercentage,null);assert.equal(r.publicationReady,false);
 assert.equal(r.rankingEligible,false);assert.equal(r.verifiedCommercialRights,false);assert.equal(r.inferredAccreditation,null);
});
test('missing independent method review is NOT a failed test or evidence of misconduct',()=>{
 const r=go({reviews:[review(measurements()[0])]});
 assert.equal(r.records[1].methodState,'no_review');assert(r.useCases[0].unreviewedOrBlockedRecords.includes('second'));
 assert(!r.useCases[0].exactContextRecords.includes('second'));
});
test('missing method field is documentation_incomplete not documented_concern',()=>{
 const rows=measurements();const rev=rows.map(review);
 rev[0].method[0]={domain:'sample_selection',finding:'not_reported'};
 const r=go({reviews:rev});assert.equal(r.records[0].methodState,'documentation_incomplete');
 assert(r.records[0].notReportedDomains.includes('sample_selection'));assert(!r.records[0].concernDomains.length);
});
test('documented method concern remains visible even if another domain is not reported',()=>{
 const rows=measurements();const rev=rows.map(review);
 rev[0].method[0]={domain:'sample_selection',finding:'documented_concern',
  reference:'https://lab.example.org/issues/sample',rationale:'Source describes selection of unusually favorable review unit'};
 rev[0].method[1]={domain:'protocol_documentation',finding:'not_reported'};
 const r=go({reviews:rev});assert.equal(r.records[0].methodState,'documented_concern');
 assert(r.records[0].concernDomains.includes('sample_selection'));assert(r.records[0].notReportedDomains.includes('protocol_documentation'));
});
test('no fixed weights or overall quality rating is emitted',()=>{
 const r=go();const txt=JSON.stringify(r);assert.equal((r as unknown as Record<string,unknown>).score,undefined);
 assert(!txt.includes('0.75'));assert(!txt.includes('winnerId'));assert.equal(r.useCases[0].inference,'documentary_coverage_only');
});
test('a changed original measurement invalidates previous method review',()=>{
 const rows=measurements();const rs=rows.map(review);rows[0].measurement=999;
 assert.throws(()=>go({measurements:rows,reviews:rs}),/Method review does not match/);
});
test('edited data after the original lineage audit is rejected',()=>{
 const exportData=exp(),lineage=auditOriginalTestLineage(exportData,measurements().map(attest));
 exportData.measurements[0].measurement=99;
 assert.throws(()=>appraiseOriginalEvidence({exportData,lineage,reviews:[],useCases:[]}),/does not match/);
});
test('different conditions do not establish applicability even with favorable outcome',()=>{
 const uc=useCase();uc.conditions={anc:'off',volume:'fixed'};
 const r=go({useCases:[uc]});assert.deepEqual(r.useCases[0].exactContextRecords,[]);
 assert.deepEqual(r.useCases[0].otherContextRecords,['first','second']);
 assert(r.records[0].contextMatches[0].differenceFields.includes('conditions'));
});
test('different test protocol version does not silently count as relevant',()=>{
 const uc=useCase();uc.protocolVersion='v3';const r=go({useCases:[uc]});
 assert.deepEqual(r.useCases[0].exactContextRecords,[]);
 assert(r.records[0].contextMatches[0].differenceFields.includes('protocol_version'));
});
test('mismatched measurement unit cannot be treated as same outcome',()=>{
 const uc=useCase();uc.unit='minutes';const r=go({useCases:[uc]});
 assert.equal(r.useCases[0].exactContextRecords.length,0);
 assert(r.records[0].contextMatches[0].differenceFields.includes('unit'));
});
test('matching variant alone cannot make different criterion applicable',()=>{
 const uc=useCase();uc.criterion='microphone';const r=go({useCases:[uc]});
 assert.deepEqual(r.useCases[0].exactContextRecords,[]);assert.deepEqual(r.useCases[0].otherContextRecords,[]);
});
test('lineage-quarantined record cannot contribute to exact context coverage',()=>{
 const rows=measurements();const attestations=[attest(rows[0])];
 const r=go({attestations});assert.equal(r.records[1].lineageAdmitted,false);
 assert.deepEqual(r.useCases[0].exactContextRecords,['first']);
 assert(r.useCases[0].unreviewedOrBlockedRecords.includes('second'));
});
test('no use-case mapping means no claim of fitness for use',()=>{
 const r=go({useCases:[]});assert.equal(r.records[0].contextMatches.length,0);
 assert(r.records[0].flags.includes('no_documented_applicability_mapping'));
});
test('duplicated method domains are rejected',()=>{
 const rows=measurements();const rs=rows.map(review);rs[0].method[1]=rs[0].method[0];
 assert.throws(()=>go({reviews:rs}),/method domain/);
});
test('no arbitrary five-domain review is accepted as complete six-domain appraisal',()=>{
 const rows=measurements();const rs=rows.map(review);rs[0].method.pop();
 assert.throws(()=>go({reviews:rs}),/incomplete method review/);
});
test('not_applicable requires explicit reference and rationale',()=>{
 const rows=measurements();const rs=rows.map(review);rs[0].method[0]={domain:'sample_selection',finding:'not_applicable',reference:'https://lab.example.org/method'};
 assert.throws(()=>go({reviews:rs}),/method domain/);
});
test('not_reported cannot falsely carry a supporting document citation',()=>{
 const rows=measurements();const rs=rows.map(review);rs[0].method[0]={domain:'sample_selection',finding:'not_reported',reference:'https://lab.example.org/method'};
 assert.throws(()=>go({reviews:rs}),/method domain/);
});
test('marketing, retailer and Amazon terms cannot be smuggled in use-case identity',()=>{
 const uc=useCase();uc.id='amazon_deal';assert.throws(()=>go({useCases:[uc]}),/use case/);
});
test('unknown or duplicated method reviews are rejected',()=>{
 const rows=measurements();const rs=rows.map(review);rs.push(rs[0]);assert.throws(()=>go({reviews:rs}),/Ambiguous/);
 rs.pop();rs[0].recordId='phantom';assert.throws(()=>go({reviews:rs}),/Ambiguous/);
});
test('invalid field types and forged review fingerprints are rejected',()=>{
 const rows=measurements();const rs=rows.map(review);rs[0].measurementFingerprint='a'.repeat(64);
 assert.throws(()=>go({reviews:rs}),/does not match/);
 rs[0].measurementFingerprint=originalMeasurementFingerprint(rows[0]);rs[0].reviewReference='file:///etc/passwd';
 assert.throws(()=>go({reviews:rs}),/method review/);
});
test('observed between-test variation is descriptive, not a significance test',()=>{
 const r=go();assert.equal(r.documentedBetweenTestVariation.length,1);
 assert.equal(r.documentedBetweenTestVariation[0].interpretation,'descriptive_only_not_statistical_disagreement');
 assert.equal(r.confidencePercentage,null);
});
test('mixed method versions do not count as variation with matching protocol',()=>{
 const rows=measurements();rows[1].protocol_version='v3';const r=go({measurements:rows});
 assert.equal(r.documentedBetweenTestVariation.length,0);
 assert.deepEqual(r.useCases[0].exactContextRecords,['first']);
 assert.deepEqual(r.useCases[0].otherContextRecords,['second']);
});
test('an observed method concern is not automatically inferred from funding disclosure alone',()=>{
 const r=go();assert.deepEqual(r.records[0].concernDomains,[]);
 assert.equal(r.records[0].methodState,'documented_without_recorded_concern');
 assert.equal(r.records[0].documentaryReviewOnly,true);
});
