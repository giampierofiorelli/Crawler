/**
 * Phase 63 — RESEARCH ONLY: documented test-origin provenance and report deduplication.
 *
 * Adapted principles, NOT a Cochrane systematic review:
 * - Cochrane Handbook Ch. 4/5: the original study/test, not each report, is the unit.
 * - PRISMA 2020: distinguish records, reports and original investigations.
 * - Cochrane Handbook Ch. V: overlapping primary research must be identified.
 * - GRADE: inconsistency, indirectness and limitations are independent considerations.
 *
 * All claims of editorial review and original publisher status are supplied by the
 * caller and CANNOT be authenticated by this module. No statistical significance,
 * commercial rights, real-world independence, source credibility or public ranking
 * is inferred. No Amazon, prices, marketing or retailer information enters here.
 */
import {createHash} from 'node:crypto';
import type {OriginalLabMeasurement,QuarantinedLabExport} from './lab_needs_bridge.js';

export type SourceRole='original_measurement'|'syndicated_report'|'unresolved';
export interface OriginalTestLineage {
  recordId:string;
  originalTestId:string;
  /** Stable identity for one actual execution, not a publication identifier. */
  testExecutionId:string;
  /** Hash of the underlying ORIGINAL dataset, not of a republisher's HTML. */
  originalDatasetSha256:string;
  sourceRole:SourceRole;
  /** Documentary attestation only — it is not technical verification of a publisher. */
  reviewStatus:'documented_by_editor'|'unresolved';
  reviewerId:string;
  originalTestReference:string;
  reviewReference:string;
  /** Fingerprint of the exact original measurement record reviewed by the editor. */
  measurementFingerprint:string;
  rightsStatus:'research_only'|'documented_commercial_grant';
  rightsReference?:string;
}
export interface DownstreamReport {
  id:string;
  originalTestId:string;
  sourceUrl:string;
  reportKind:'syndication'|'commentary'|'methodology_report';
  /** A citation/backlink, NOT a new independent measurement. */
  lineageReference:string;
}
export interface EvidenceLineageIssue {
  code:'missing_or_ambiguous_attestation'|'unverified_lineage'|'unreviewed_measurement'|
    'conflicting_original_identity'|'shared_dataset_across_claimed_tests'|'inconsistent_values_within_test'|
    'missing_original_primary_record'|'invalid_attestation'|'unattached_downstream_report'|
    'invalid_downstream_report';
  recordIds:string[];
  originalTestIds:string[];
  detail:string;
}
export interface ResearchOriginGroup {
  originalTestId:string;
  testExecutionId:string;
  sourceRecordIds:string[];
  originalDatasetSha256:string;
  /** This counts a documented test execution, not independent scientific replication. */
  primaryRecordsEligibleForResearch:string[];
  downstreamReportIds:string[];
}
export interface OriginalTestEvidenceAudit {
  purpose:'test_lineage_and_overlap_research_only';
  publicationReady:false;
  rankingEligible:false;
  scientificallyVerifiedIndependence:false;
  statisticalConfidence:null;
  evidenceCountByOriginalTest:true;
  auditedInputFingerprint:string;
  admittedOriginalRecordIds:string[];
  excludedRecordIds:string[];
  originGroups:ResearchOriginGroup[];
  reports:DownstreamReport[];
  issues:EvidenceLineageIssue[];
  counts:{measurementRecords:number;primaryTestExecutionsFromDocumentedLineage:number;downstreamReports:number};
  /** Variation is descriptive; no assertion of statistical disagreement. */
  observedBetweenTestVariation:{variantId:string;criterion:string;protocolId:string;recordIds:string[];values:number[];unit:string}[];
  methodAndContextDifferences:{variantId:string;criterion:string;methodSignatures:string[];recordIds:string[];interpretation:'not_directly_comparable'}[];
  caveats:string[];
}
const validId=(v:unknown):v is string=>typeof v==='string'&&/^[a-z][a-z0-9_]*$/.test(v) &&
 !/(?:amazon|affiliate|retailer|price|budget|marketing|commission|deal)/i.test(v);
const sha=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{64}$/.test(v);
const nonEmpty=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=1024;
const sortEntries=(v:Record<string,string>)=>Object.entries(v).sort(([a],[b])=>a.localeCompare(b));
const stableComparisonKey=(m:OriginalLabMeasurement)=>JSON.stringify([
  m.tested_variant,m.criterion,m.unit,m.protocol_id,m.protocol_version,sortEntries(m.conditions)
]);
function safeUrl(value:unknown):boolean {
  try {const u=new URL(value as string);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password&&!/(?:^|\.)amazon\./i.test(u.hostname)} catch {return false;}
}
/** Records are fingerprinted in a canonical order, rather than trusting a review checkbox. */
export function originalMeasurementFingerprint(m:OriginalLabMeasurement):string {
  return createHash('sha256').update(JSON.stringify({recordId:m.record_id,originalTestId:m.original_test_id,
    sourceUrl:m.test_url,exactVariant:m.tested_variant,criterion:m.criterion,
    measurement:m.measurement,unit:m.unit,protocolId:m.protocol_id,
    protocolVersion:m.protocol_version,conditions:sortEntries(m.conditions),testedAt:m.tested_at})).digest('hex');
}
function inputFingerprint(exp:QuarantinedLabExport):string {
  return createHash('sha256').update(JSON.stringify({exportIdentity:exp.input_sha256,
    publisher:exp.publisher_domain, measurements:exp.measurements.map(m=>originalMeasurementFingerprint(m)).sort()})).digest('hex');
}
function metadataValid(a:OriginalTestLineage,m:OriginalLabMeasurement):boolean {
  return !!a && validId(a.recordId) && a.recordId===m.record_id && validId(a.originalTestId) &&
   a.originalTestId===m.original_test_id && validId(a.testExecutionId) && sha(a.originalDatasetSha256) &&
   ['original_measurement','syndicated_report','unresolved'].includes(a.sourceRole) &&
   ['documented_by_editor','unresolved'].includes(a.reviewStatus) && validId(a.reviewerId) &&
   safeUrl(a.originalTestReference) && nonEmpty(a.reviewReference) &&
   sha(a.measurementFingerprint) &&
   ['research_only','documented_commercial_grant'].includes(a.rightsStatus) &&
   (a.rightsStatus==='research_only'||nonEmpty(a.rightsReference));
}
/**
 * An audit of a QUARANTINED feed, not an eligibility or legal approval system.
 * Fail closed on uncertain identity, reuse across purportedly distinct tests,
 * contradictory reports of the SAME measurement, or absent primary records.
 */
export function auditOriginalTestLineage(
  exportData:QuarantinedLabExport,
  attestations:readonly OriginalTestLineage[],
  downstreamReports:readonly DownstreamReport[]=[],
):OriginalTestEvidenceAudit {
  if(!exportData||exportData.review_only!==true||exportData.ranking_input_approved!==false||
    exportData.source_kind!=='original_independent_lab_measurements'||
    exportData.rights_status!=='human_attested_not_cryptographically_verified'||
    !sha(exportData.input_sha256)||!Array.isArray(exportData.measurements)||!Array.isArray(attestations)||
    !Array.isArray(downstreamReports)||exportData.measurements.length>10000||attestations.length>20000||downstreamReports.length>10000)
    throw Error('Only bounded quarantined original-laboratory research input is accepted');
  const issues:EvidenceLineageIssue[]=[];
  const flag=(code:EvidenceLineageIssue['code'],records:string[],tests:string[],detail:string)=>
    issues.push({code,recordIds:[...new Set(records)].sort(),originalTestIds:[...new Set(tests)].sort(),detail});
  const blocked=new Set<string>();
  const allIds=new Set<string>();
  for(const m of exportData.measurements){
    if(!m||!validId(m.record_id)||allIds.has(m.record_id)||!validId(m.original_test_id)||
      !validId(m.tested_variant)||!validId(m.criterion)||!validId(m.protocol_id)||
      !safeUrl(m.test_url)||!m.protocol_version||!m.unit||!Number.isFinite(m.measurement)||
      !m.conditions||Array.isArray(m.conditions)||typeof m.conditions!=='object'||
      Object.entries(m.conditions).some(([k,v])=>!validId(k)||!nonEmpty(v))){
       throw Error('Malformed or duplicate original-laboratory record');
    }
    allIds.add(m.record_id);
  }
  // Each attestation is keyed by exact measurement ID. Missing or multiple attestors are ambiguous.
  const attestMap=new Map<string,OriginalTestLineage[]>();
  for(const a of attestations){
    if(!a||!validId(a.recordId)||!allIds.has(a.recordId))throw Error('Unknown attested measurement ID');
    const arr=attestMap.get(a.recordId)??[];arr.push(a);attestMap.set(a.recordId,arr);
  }
  const eligible=new Map<string,{m:OriginalLabMeasurement;a:OriginalTestLineage}>();
  for(const m of exportData.measurements){
    const att=attestMap.get(m.record_id)??[];
    if(att.length!==1){blocked.add(m.record_id);flag('missing_or_ambiguous_attestation',[m.record_id],[m.original_test_id],'Exactly one documented lineage review is required');continue;}
    const a=att[0];
    if(!metadataValid(a,m)){blocked.add(m.record_id);flag('invalid_attestation',[m.record_id],[m.original_test_id],'Lineage metadata is malformed or does not match the original-test identity');continue;}
    if(a.measurementFingerprint!==originalMeasurementFingerprint(m)){
      blocked.add(m.record_id);flag('unreviewed_measurement',[m.record_id],[m.original_test_id],'Measurement bytes changed after documentary review');continue;
    }
    if(a.reviewStatus!=='documented_by_editor'||a.sourceRole==='unresolved'){
      blocked.add(m.record_id);flag('unverified_lineage',[m.record_id],[m.original_test_id],'Lineage cannot be resolved from the supplied documents');continue;
    }
    // A syndicated record may be shown as a report, but never treated as a test execution.
    if(a.sourceRole==='original_measurement' && (new URL(m.test_url).hostname.toLowerCase()!==
         new URL(a.originalTestReference).hostname.toLowerCase())){
      blocked.add(m.record_id);flag('unverified_lineage',[m.record_id],[m.original_test_id],'Original-source host mismatch requires human review');continue;
    }
    eligible.set(m.record_id,{m,a});
  }
  const byTest=new Map<string,Array<{m:OriginalLabMeasurement;a:OriginalTestLineage}>>();
  for(const e of eligible.values()){
    const arr=byTest.get(e.m.original_test_id)??[];arr.push(e);byTest.set(e.m.original_test_id,arr);
  }
  // Identical raw data presented as two distinct test executions is SUSPECT: no free independence count.
  const byDataHash=new Map<string,Set<string>>();
  for(const [test,entries] of byTest){for(const x of entries){
    const groups=byDataHash.get(x.a.originalDatasetSha256)??new Set<string>();groups.add(test);byDataHash.set(x.a.originalDatasetSha256,groups);
  }}
  for(const [hash,ids] of byDataHash){
    if(ids.size<2)continue;
    const records=[...eligible.values()].filter(x=>x.a.originalDatasetSha256===hash).map(x=>x.m.record_id);
    for(const r of records)blocked.add(r);
    flag('shared_dataset_across_claimed_tests',records,[...ids],
      'Distinct test IDs cite the same raw dataset hash; independent replication is not established');
  }
  for(const [id,entries] of byTest){
    const executions=new Set(entries.map(x=>x.a.testExecutionId));
    const hashes=new Set(entries.map(x=>x.a.originalDatasetSha256));
    if(executions.size>1||hashes.size>1){
      for(const x of entries)blocked.add(x.m.record_id);
      flag('conflicting_original_identity',entries.map(x=>x.m.record_id),[id],
        'Reports of one original test disagree on execution or underlying dataset');
    }
    const byMeasurement=new Map<string,Array<typeof entries[number]>>();
    for(const e of entries){const key=stableComparisonKey(e.m);const arr=byMeasurement.get(key)??[];arr.push(e);byMeasurement.set(key,arr);}
    for(const group of byMeasurement.values()){
      const values=new Set(group.map(e=>e.m.measurement));
      if(values.size>1){
        for(const x of group)blocked.add(x.m.record_id);
        flag('inconsistent_values_within_test',group.map(x=>x.m.record_id),[id],
          'Different reports attribute different numerical results to the same original test, criterion and conditions');
      }
    }
    if(!entries.some(e=>e.a.sourceRole==='original_measurement')){
      for(const e of entries)blocked.add(e.m.record_id);
      flag('missing_original_primary_record',entries.map(e=>e.m.record_id),[id],
       'Syndicated reports alone do not establish a primary original-test observation');
    }
  }
  const reports:DownstreamReport[]=[];
  const seenReports=new Set<string>();
  for(const r of downstreamReports){
    if(!r||!validId(r.id)||seenReports.has(r.id)||!validId(r.originalTestId)||
       !safeUrl(r.sourceUrl)||!safeUrl(r.lineageReference)||
       !['syndication','commentary','methodology_report'].includes(r.reportKind)){
       flag('invalid_downstream_report',[],[],`Invalid or duplicate downstream report record; not counted as evidence`);continue;
    }
    seenReports.add(r.id);
    reports.push(r);
    if(!byTest.has(r.originalTestId))flag('unattached_downstream_report',[],[r.originalTestId],
      'Report refers to an original test not present in the supplied evidence records');
  }
  const originGroups:ResearchOriginGroup[]=[];
  for(const [test,entries] of [...byTest].sort(([a],[b])=>a.localeCompare(b))){
    const goodPrimary=entries.filter(x=>x.a.sourceRole==='original_measurement'&&!blocked.has(x.m.record_id));
    const canonical=new Map<string,string>();
    for(const e of goodPrimary.sort((a,b)=>a.m.record_id.localeCompare(b.m.record_id))){
      const key=stableComparisonKey(e.m);
      if(!canonical.has(key))canonical.set(key,e.m.record_id);
      else blocked.add(e.m.record_id); // identical repeat of one measurement is not independent
    }
    originGroups.push({originalTestId:test,testExecutionId:entries[0].a.testExecutionId,
      originalDatasetSha256:entries[0].a.originalDatasetSha256,
      sourceRecordIds:entries.map(x=>x.m.record_id).sort(),
      primaryRecordsEligibleForResearch:[...canonical.values()],
      downstreamReportIds:reports.filter(r=>r.originalTestId===test).map(r=>r.id).sort()});
  }
  const admittedOriginalRecordIds=originGroups.flatMap(g=>g.primaryRecordsEligibleForResearch).filter(id=>!blocked.has(id)).sort();
  const included=new Set(admittedOriginalRecordIds);
  const comparable=new Map<string,OriginalLabMeasurement[]>();
  for(const m of exportData.measurements.filter(x=>included.has(x.record_id))){
    const k=stableComparisonKey(m);const arr=comparable.get(k)??[];arr.push(m);comparable.set(k,arr);
  }
  const observedBetweenTestVariation:OriginalTestEvidenceAudit['observedBetweenTestVariation']=[];
  for(const group of comparable.values()){
    if(new Set(group.map(r=>r.original_test_id)).size<2||new Set(group.map(r=>r.measurement)).size<2)continue;
    observedBetweenTestVariation.push({variantId:group[0].tested_variant,criterion:group[0].criterion,
      protocolId:group[0].protocol_id,recordIds:group.map(r=>r.record_id).sort(),
      values:group.map(r=>r.measurement),unit:group[0].unit});
  }
  const methodsByCriterion=new Map<string,OriginalLabMeasurement[]>();
  for(const m of exportData.measurements.filter(x=>included.has(x.record_id))){
    const key=JSON.stringify([m.tested_variant,m.criterion]);
    const existing=methodsByCriterion.get(key)??[];existing.push(m);methodsByCriterion.set(key,existing);
  }
  const methodAndContextDifferences:OriginalTestEvidenceAudit['methodAndContextDifferences']=[];
  for(const group of methodsByCriterion.values()) {
    const signatures=[...new Set(group.map(m=>JSON.stringify([m.unit,m.protocol_id,m.protocol_version,sortEntries(m.conditions)])))].sort();
    if(signatures.length>1)methodAndContextDifferences.push({
      variantId:group[0].tested_variant,criterion:group[0].criterion,methodSignatures:signatures,
      recordIds:group.map(m=>m.record_id).sort(),interpretation:'not_directly_comparable'});
  }
  return {purpose:'test_lineage_and_overlap_research_only',publicationReady:false,rankingEligible:false,
    scientificallyVerifiedIndependence:false,statisticalConfidence:null,evidenceCountByOriginalTest:true,
    auditedInputFingerprint:inputFingerprint(exportData),
    admittedOriginalRecordIds,excludedRecordIds:exportData.measurements.map(r=>r.record_id).filter(id=>!included.has(id)).sort(),
    originGroups,reports,issues,
    counts:{measurementRecords:exportData.measurements.length,
      primaryTestExecutionsFromDocumentedLineage:new Set(exportData.measurements.filter(m=>included.has(m.record_id))
        .map(m=>m.original_test_id)).size,downstreamReports:reports.length},
    observedBetweenTestVariation,methodAndContextDifferences,
    caveats:[
      'A report is not an original test; syndicated copies and commentary never increase independent test counts.',
      'Same numeric value in different documents is NOT sufficient to prove duplicate studies; shared raw-data identity is only a warning signal.',
      'Distinct original-test IDs cannot prove statistical independence or unbiased sampling; the editorial metadata is not authenticated here.',
      'Variation between comparable test results is descriptive, NOT a statistical inconsistency or significance calculation.',
      'Different test protocols and conditions cannot be labelled contradictions without a reviewed comparability method.',
      'Rights assertions and source identities need separate real-world verification before public deployment.',
      'No missing data is imputed, and no aggregate score, winner or purchase recommendation is computed.',
      'No retailer, Amazon, manufacturer marketing or price data is used.',
    ]};
}
/** A filtered research copy only; input bytes/hash never falsely presented as unmodified. */
export function deriveQuarantinedExport(exportData:QuarantinedLabExport,audit:OriginalTestEvidenceAudit):QuarantinedLabExport {
  if(audit.purpose!=='test_lineage_and_overlap_research_only'||audit.publicationReady!==false||audit.rankingEligible!==false)
    throw Error('A research-only audit is required');
  if(audit.auditedInputFingerprint!==inputFingerprint(exportData))
    throw Error('Lineage audit does not match current measurements: review again');
  const allowed=new Set(audit.admittedOriginalRecordIds);
  const filtered=exportData.measurements.filter(m=>allowed.has(m.record_id));
  return {...exportData,review_only:true,ranking_input_approved:false,
    input_sha256:createHash('sha256').update(JSON.stringify({derivedFrom:exportData.input_sha256,
       recordIds:filtered.map(m=>m.record_id).sort(),researchOnly:true})).digest('hex'),measurements:filtered};
}
