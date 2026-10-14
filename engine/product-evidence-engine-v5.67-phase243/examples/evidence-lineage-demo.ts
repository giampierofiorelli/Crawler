/** Phase 63 — entirely fictional provenance demonstration, not product evidence. */
import {auditOriginalTestLineage,originalMeasurementFingerprint,type OriginalTestLineage,
  type DownstreamReport} from '../src/evidence_lineage.js';
import type {OriginalLabMeasurement,QuarantinedLabExport} from '../src/lab_needs_bridge.js';
const make=(id:string,test:string,value:number):OriginalLabMeasurement=>({record_id:id,original_test_id:test,
  test_url:`https://fictional-lab.example.org/tests/${test}`,tested_variant:'headphone_a',criterion:'battery_runtime',
  measurement:value,unit:'hours',protocol_id:'call_loop',protocol_version:'1',
  conditions:{anc:'on',codec:'aac'},tested_at:'2026-09-20T00:00:00Z'});
const rows=[make('record_a','session_a',20),make('record_b','session_b',19)];
const feed:QuarantinedLabExport={source_kind:'original_independent_lab_measurements',review_only:true,
  ranking_input_approved:false,rights_status:'human_attested_not_cryptographically_verified',
  publisher_domain:'fictional-lab.example.org',input_sha256:'a'.repeat(64),measurements:rows};
const attest=(m:OriginalLabMeasurement):OriginalTestLineage=>({recordId:m.record_id,
  originalTestId:m.original_test_id,testExecutionId:m.original_test_id,
  originalDatasetSha256:(m.original_test_id==='session_a'?'b':'c').repeat(64),
  sourceRole:'original_measurement',reviewStatus:'documented_by_editor',reviewerId:'fictional_editor',
  originalTestReference:m.test_url,reviewReference:'Fictional editorial review fixture',
  measurementFingerprint:originalMeasurementFingerprint(m),rightsStatus:'research_only'});
const secondary:DownstreamReport[]=Array.from({length:10},(_,i)=>({id:`secondary_${i}`,
  originalTestId:'session_a',sourceUrl:`https://fictional-publication.example.org/reports/${i}`,
  reportKind:'syndication',lineageReference:'https://fictional-lab.example.org/tests/session_a'}));
const result=auditOriginalTestLineage(feed,rows.map(attest),secondary);
process.stdout.write(JSON.stringify({illustrativeOnly:true,
   sourceDocuments:result.counts.measurementRecords+result.counts.downstreamReports,
   actualDocumentedTestExecutions:result.counts.primaryTestExecutionsFromDocumentedLineage,
   statisticallyVerifiedIndependence:result.scientificallyVerifiedIndependence,
   betweenStudyVariation:result.observedBetweenTestVariation,
   publicRecommendationsAllowed:result.publicationReady,
   groupedReports:result.originGroups.map(g=>({originalTest:g.originalTestId,secondaryReports:g.downstreamReportIds.length})),
   methodologicalCaveats:result.caveats},null,2)+'\n');
