/** Demo uses fictional product, fictional lab and fabricated evidence. */
import {auditOriginalTestLineage,originalMeasurementFingerprint,type OriginalTestLineage} from '../src/evidence_lineage.js';
import {appraiseOriginalEvidence,type OriginalRecordReview,type MethodDomain} from '../src/evidence_appraisal.js';
import type {OriginalLabMeasurement,QuarantinedLabExport} from '../src/lab_needs_bridge.js';
const measurements:OriginalLabMeasurement[]=[
 {record_id:'testa',original_test_id:'executiona',test_url:'https://lab.example.org/one',
  tested_variant:'headphone_a',criterion:'battery',measurement:22,unit:'hours',
  protocol_id:'ancplayback',protocol_version:'v2',conditions:{anc:'on',volume:'fixed'},tested_at:'2026-09-01T00:00:00Z'},
 {record_id:'testb',original_test_id:'executionb',test_url:'https://lab.example.org/two',
  tested_variant:'headphone_a',criterion:'battery',measurement:20,unit:'hours',
  protocol_id:'ancplayback',protocol_version:'v2',conditions:{anc:'off',volume:'fixed'},tested_at:'2026-09-02T00:00:00Z'},
];
const exported:QuarantinedLabExport={source_kind:'original_independent_lab_measurements',review_only:true,
 ranking_input_approved:false,rights_status:'human_attested_not_cryptographically_verified',
 publisher_domain:'lab.example.org',input_sha256:'f'.repeat(64),measurements};
const reviews:OriginalRecordReview[]=measurements.map(m=>({recordId:m.record_id,
 measurementFingerprint:originalMeasurementFingerprint(m),reviewerId:'fictional_editor',
 reviewReference:'https://lab.example.org/editorial-notes',
 method:(['sample_selection','protocol_documentation','instrument_qualification',
  'repeatability_information','conflicts_of_interest','data_completeness'] as MethodDomain[]).map(domain=>({
    domain,finding:domain==='repeatability_information'?'not_reported':'documented',
    ...(domain==='repeatability_information'?{}:{reference:'https://lab.example.org/methodology'})
  }))}));
const attestations:OriginalTestLineage[]=measurements.map((m,i)=>({recordId:m.record_id,
 originalTestId:m.original_test_id,testExecutionId:m.original_test_id,
 originalDatasetSha256:(i===0?'a':'b').repeat(64),sourceRole:'original_measurement',
 reviewStatus:'documented_by_editor',reviewerId:'fictional_editor',originalTestReference:m.test_url,
 reviewReference:'Fictional attestation — no real lab',measurementFingerprint:originalMeasurementFingerprint(m),
 rightsStatus:'research_only'}));
const lineage=auditOriginalTestLineage(exported,attestations);
const result=appraiseOriginalEvidence({exportData:exported,lineage,reviews,useCases:[{
 id:'travelling_with_anc',mappingReference:'https://research.example.org/fictional-use-case',
 variantId:'headphone_a',criterion:'battery',unit:'hours',protocolId:'ancplayback',protocolVersion:'v2',
 conditions:{anc:'on',volume:'fixed'}
}]});
console.log(JSON.stringify({notice:'SYNTHETIC DATA ONLY — RESEARCH ONLY, NOT A PRODUCT RECOMMENDATION',result},null,2));
