/** Phase 58: research-only audit of uncertainties reported by original laboratories.
 * This is an INTERVAL DESCRIPTIVE CHECK, not a significance test, a probability,
 * a device-quality score, evidence of repeatability or a public recommendation.
 * Never add this module to src/launch/ or use Amazon/retailer information.
 */
import { type LabNeedsBridgeResult, type QuarantinedLabExport } from './lab_needs_bridge.js';

/** Only expanded uncertainty as *reported by the original laboratory* is accepted.
 * U = k × u_c. k alone does not prove a numerical confidence level.
 */
export interface PublishedExpandedUncertainty {
  recordId: string;
  originalTestId: string;
  testedVariant: string;
  measuredValue: number;
  unit: string;
  expandedUncertainty: number;
  coverageFactor: number;
  uncertaintyMethod: string;
  /** Original lab publication describing the estimation method and assumptions. */
  documentationUrl: string;
  reportingBasis: 'original_lab_reported';
  /** This means the lab says it covers its full reported measurand, not just instrument accuracy. */
  uncertaintyScope: 'full_reported_measurand';
}
export type IntervalStatus =
  | 'not_comparable'
  | 'missing_reported_uncertainty'
  | 'unequal_coverage_factors'
  | 'reported_intervals_separated'
  | 'reported_intervals_overlap_or_touch';
export interface AssessedNeedInterval {
  needId: string;
  status: IntervalStatus;
  observedDirection?: 'first_observed_better'|'second_observed_better'|'same_observed_value';
  firstInterval?: [number,number];
  secondInterval?: [number,number];
  unit?: string;
  coverageFactor?: number;
  originalRecordIds?: [string,string];
  documentationUrls: string[];
  limitation: string;
}
export interface UncertaintyAuditResult {
  purpose: 'uncertainty_research_audit';
  publicationReady: false;
  rankingEligible: false;
  winnerId: null;
  confidenceScore: null;
  sourceRightsVerified: false;
  assessments: AssessedNeedInterval[];
  /** Number of needs with two comparable *reported* U intervals, not a coverage probability. */
  reportedPairCount: number;
}
const forbidden = /(?:price|cost|budget|msrp|rrp|deal|discount|sale|retailer|merchant|amazon|affiliate|commission)/i;
function safeId(id:unknown):id is string {
  return typeof id==='string' && /^[a-z][a-z0-9_]*$/.test(id) && !forbidden.test(id);
}
function checkUncertaintyRows(rows: PublishedExpandedUncertainty[], source: QuarantinedLabExport) {
  if (!Array.isArray(rows) || rows.length>10000) throw Error('Invalid uncertainty record collection');
  const originals=new Map(source.measurements.map(m=>[m.record_id,m]));
  const seen=new Set<string>();
  for (const r of rows) {
    if (!r || !safeId(r.recordId) || seen.has(r.recordId)) throw Error('Invalid or duplicate uncertainty record');
    seen.add(r.recordId);
    const m=originals.get(r.recordId);
    if (!m || r.originalTestId!==m.original_test_id || r.testedVariant!==m.tested_variant ||
        r.unit!==m.unit || r.measuredValue!==m.measurement)
      throw Error('Uncertainty not tied to an exact original record and measured value');
    if (r.reportingBasis!=='original_lab_reported' || r.uncertaintyScope!=='full_reported_measurand' ||
        typeof r.expandedUncertainty!=='number' || !Number.isFinite(r.expandedUncertainty) || r.expandedUncertainty<=0 ||
        typeof r.coverageFactor!=='number' || !Number.isFinite(r.coverageFactor) || r.coverageFactor<=1 ||
        typeof r.uncertaintyMethod!=='string' || r.uncertaintyMethod.trim().length<8)
      throw Error('Unsubstantiated or malformed expanded uncertainty');
    let url:URL;
    try { url=new URL(r.documentationUrl); } catch {throw Error('Invalid uncertainty method URL');}
    if(url.protocol!=='https:' || url.hostname!==source.publisher_domain || url.username || url.password)
      throw Error('Uncertainty method must be documented by original publisher');
  }
}
/** Relies on exact source-record IDs from a completed bridge and prohibits repurposed synthetic scores. */
export function auditOriginalLabUncertainty(input:{
  bridge: LabNeedsBridgeResult;
  originalExport: QuarantinedLabExport;
  publishedUncertainties: PublishedExpandedUncertainty[];
}): UncertaintyAuditResult {
  const {bridge,originalExport,publishedUncertainties}=input;
  if(!bridge || bridge.purpose!=='original_lab_research_bridge' || bridge.publicationReady!==false ||
     bridge.winnerId!==null || bridge.numericScores!==null || bridge.provenance.rightsVerified!==false ||
     originalExport.source_kind!=='original_independent_lab_measurements' ||
     originalExport.review_only!==true || originalExport.ranking_input_approved!==false ||
     originalExport.rights_status!=='human_attested_not_cryptographically_verified' ||
     bridge.provenance.publisherDomain!==originalExport.publisher_domain ||
     bridge.provenance.exportSha256!==originalExport.input_sha256)
    throw Error('Only matching quarantined research bridge and source export accepted');
  checkUncertaintyRows(publishedUncertainties,originalExport);
  const index=new Map(publishedUncertainties.map(row=>[row.recordId,row]));
  const originals=new Map(originalExport.measurements.map(row=>[row.record_id,row]));
  const assessments:AssessedNeedInterval[]=[];
  for(const comparison of bridge.comparisons) {
    const base: AssessedNeedInterval={needId:comparison.needId,status:'not_comparable',
      documentationUrls:[],limitation:'Need-to-test bridge did not establish comparable original measurements'};
    if (comparison.status!=='descriptive_only' || !comparison.sourceRecordIds) {
      assessments.push(base);continue;
    }
    const [aId,bId]=comparison.sourceRecordIds;
    const aOriginal=originals.get(aId);const bOriginal=originals.get(bId);
    // Do not trust stale bridge results if input records have been changed after assessment.
    if(!aOriginal || !bOriginal || aOriginal.measurement!==comparison.firstValue ||
       bOriginal.measurement!==comparison.secondValue ||
       aOriginal.unit!==comparison.unit || bOriginal.unit!==comparison.unit ||
       aOriginal.test_url!==comparison.testUrls[0] || bOriginal.test_url!==comparison.testUrls[1] ||
       aOriginal.tested_variant!==comparison.variantIds[0] || bOriginal.tested_variant!==comparison.variantIds[1] ||
       aOriginal.criterion!==bOriginal.criterion || aOriginal.protocol_id!==bOriginal.protocol_id ||
       aOriginal.protocol_version!==bOriginal.protocol_version ||
       JSON.stringify(Object.entries(aOriginal.conditions).sort())!==JSON.stringify(Object.entries(bOriginal.conditions).sort()))
      throw Error('Bridge result does not match original measurement records');
    const a=index.get(aId),b=index.get(bId);
    if(!a || !b) {
      assessments.push({...base,status:'missing_reported_uncertainty',
        observedDirection:comparison.direction,originalRecordIds:[aId,bId],
        limitation:'At least one exact measurement lacks lab-reported expanded uncertainty; no interval comparison possible'});
      continue;
    }
    if(a.coverageFactor!==b.coverageFactor) {
      assessments.push({...base,status:'unequal_coverage_factors',observedDirection:comparison.direction,
        originalRecordIds:[aId,bId],documentationUrls:[a.documentationUrl,b.documentationUrl],
        limitation:'Different reported coverage factors: intervals are not evaluated as directly comparable'});
      continue;
    }
    const aInterval:[number,number]=[a.measuredValue-a.expandedUncertainty,a.measuredValue+a.expandedUncertainty];
    const bInterval:[number,number]=[b.measuredValue-b.expandedUncertainty,b.measuredValue+b.expandedUncertainty];
    if(!aInterval.concat(bInterval).every(Number.isFinite)) throw Error('Uncertainty interval overflow');
    const separated = aInterval[1]<bInterval[0] || bInterval[1]<aInterval[0];
    assessments.push({...base,
      status: separated?'reported_intervals_separated':'reported_intervals_overlap_or_touch',
      observedDirection:comparison.direction,firstInterval:aInterval,secondInterval:bInterval,
      unit:comparison.unit,coverageFactor:a.coverageFactor,
      originalRecordIds:[aId,bId],documentationUrls:[a.documentationUrl,b.documentationUrl],
      limitation:separated ?
        'Lab-reported expanded intervals are disjoint under their reported assumptions. This is NOT a significance test, proof of better real-world performance or quantified confidence; systematic effects and dependence remain unverified.' :
        'Lab-reported expanded intervals overlap or touch. No reliable superiority inference can be made; overlap alone is not a statistical hypothesis test.'});
  }
  return {purpose:'uncertainty_research_audit',publicationReady:false,rankingEligible:false,
    winnerId:null,confidenceScore:null,sourceRightsVerified:false,assessments,
    reportedPairCount:assessments.filter(x=>x.status==='reported_intervals_separated'||x.status==='reported_intervals_overlap_or_touch').length};
}
