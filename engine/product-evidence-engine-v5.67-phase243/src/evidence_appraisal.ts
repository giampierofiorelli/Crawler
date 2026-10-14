/**
 * Phase 64 — research-only documentary methodological appraisal.
 *
 * Informed by ISO/IEC 17025:2017 (competence/impartiality), ISO 5725-2:2025
 * (repeatability/reproducibility), NIST TN1297 (conditions), Cochrane Handbook
 * Ch14 (risk of bias, indirectness, inconsistency, imprecision). Adaptation for
 * consumer testing is PROPOSED, NOT a validated domain-specific grading scale.
 *
 * Data here are research-only and human-supplied; assertions of method, licence,
 * funding, accuracy, test independence and reviewer identity are not authenticated.
 * The module NEVER calculates scores, confidence percentages or public rankings.
 */
import type {OriginalLabMeasurement,QuarantinedLabExport} from './lab_needs_bridge.js';
import {deriveQuarantinedExport,originalMeasurementFingerprint,
 type OriginalTestEvidenceAudit} from './evidence_lineage.js';

export type MethodDomain =
 'sample_selection'|'protocol_documentation'|'instrument_qualification'|
 'repeatability_information'|'conflicts_of_interest'|'data_completeness';
const DOMAINS:readonly MethodDomain[]=[
 'sample_selection','protocol_documentation','instrument_qualification',
 'repeatability_information','conflicts_of_interest','data_completeness'];
export type MethodFinding='documented'|'not_reported'|'documented_concern'|'not_applicable';
export interface ReviewedMethodDomain {
 domain:MethodDomain;
 finding:MethodFinding;
 /** Where to inspect the documentary basis; a URL does NOT prove it is genuine. */
 reference?:string;
 /** Specific documented issue or why a domain is not applicable. */
 rationale?:string;
}
export interface OriginalRecordReview {
 recordId:string;
 /** Review anchored to exact bytes of this original observation, not a mutable record ID. */
 measurementFingerprint:string;
 reviewerId:string;
 reviewReference:string;
 method:ReviewedMethodDomain[];
}
export interface DocumentedUseCase {
 id:string;
 /** Human-approved research mapping of a need to an original measurement. */
 mappingReference:string;
 variantId:string;
 criterion:string;
 unit:string;
 protocolId:string;
 protocolVersion:string;
 /** Exact context keys/values: no implicit generalization from a different setup. */
 conditions:Record<string,string>;
}
export type MethodAppraisalState =
 'no_review'|'documented_concern'|'documentation_incomplete'|'documented_without_recorded_concern';
export type UseCaseApplicability='exact_context_match'|'different_context'|'unmapped';
export interface MethodAppraisalRow {
 recordId:string;
 originalTestId:string;
 variantId:string;
 criterion:string;
 lineageAdmitted:boolean;
 methodState:MethodAppraisalState;
 notReportedDomains:MethodDomain[];
 concernDomains:MethodDomain[];
 /** Even complete notes do not establish real competence, accreditation, independence or legal permission. */
 documentaryReviewOnly:true;
 contextMatches:{useCaseId:string;status:UseCaseApplicability;differenceFields:string[]}[];
 flags:string[];
}
export interface EvidenceMethodAppraisal {
 purpose:'original_test_method_and_applicability_research_only';
 publicationReady:false;
 rankingEligible:false;
 reliabilityScore:null;
 confidencePercentage:null;
 inferredAccreditation:null;
 verifiedCommercialRights:false;
 auditedInputFingerprint:string;
 records:MethodAppraisalRow[];
 /** Shared method is not proof of statistical reproducibility across laboratories. */
 documentedBetweenTestVariation:{variantId:string;criterion:string;protocolId:string;recordIds:string[];interpretation:'descriptive_only_not_statistical_disagreement'}[];
 useCases:{id:string;exactContextRecords:string[];otherContextRecords:string[];unreviewedOrBlockedRecords:string[];inference:'documentary_coverage_only'}[];
 caveats:string[];
}
const forbidden=/(?:price|cost|budget|msrp|rrp|deal|discount|sale|retailer|merchant|amazon|affiliate|commission|marketing|promotion|sponsored|advertis)/i;
const goodId=(x:unknown):x is string=>typeof x==='string'&&/^[a-z][a-z0-9_]*$/.test(x)&&x.length<160&&!forbidden.test(x);
const goodText=(x:unknown):x is string=>typeof x==='string'&&x.trim().length>3&&x.length<=1500;
const sha=(x:unknown):x is string=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
function safeReference(x:unknown):boolean {
 try {const u=new URL(x as string);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password&&!/(?:^|\.)amazon\./i.test(u.hostname);} catch {return false;}
}
function fields(cond:Record<string,string>):[string,string][] {
 return Object.entries(cond).sort(([a],[b])=>a.localeCompare(b));
}
function validConditions(x:unknown):x is Record<string,string> {
 return !!x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length>0&&Object.keys(x).length<=32&&
  Object.entries(x).every(([k,v])=>goodId(k)&&typeof v==='string'&&v.trim().length>0&&v.length<=128);
}
function validateMethod(r:OriginalRecordReview) {
 if(!r||!goodId(r.recordId)||!sha(r.measurementFingerprint)||!goodId(r.reviewerId)||
    !safeReference(r.reviewReference)||!Array.isArray(r.method)||r.method.length!==DOMAINS.length)
    throw Error('Malformed or incomplete method review');
 const seen=new Set<MethodDomain>();
 for(const d of r.method){
  if(!d||!DOMAINS.includes(d.domain)||seen.has(d.domain)||
     !['documented','not_reported','documented_concern','not_applicable'].includes(d.finding)||
     (d.finding==='not_reported'&&d.reference!==undefined)||
     (d.finding==='not_reported'&&d.rationale!==undefined)||
     (d.finding!=='not_reported'&&!safeReference(d.reference))||
     (['not_applicable','documented_concern'].includes(d.finding)&&!goodText(d.rationale)))
      throw Error('Invalid or duplicated method domain');
  seen.add(d.domain);
 }
}
function compareContext(m:OriginalLabMeasurement,u:DocumentedUseCase):{status:UseCaseApplicability;differenceFields:string[]} {
 const differences:string[]=[];
 if(m.tested_variant!==u.variantId)differences.push('exact_variant');
 if(m.criterion!==u.criterion)differences.push('criterion');
 if(m.unit!==u.unit)differences.push('unit');
 if(m.protocol_id!==u.protocolId)differences.push('protocol');
 if(m.protocol_version!==u.protocolVersion)differences.push('protocol_version');
 if(JSON.stringify(fields(m.conditions))!==JSON.stringify(fields(u.conditions)))differences.push('conditions');
 return {status:differences.length?'different_context':'exact_context_match',differenceFields:differences};
}
/**
 * Uses the Phase-63 audited immutable measurement identities, without treating
 * the documentary lineage audit as a real laboratory or licensing certification.
 * Only records previously admitted for research can have applicable coverage.
 */
export function appraiseOriginalEvidence(input:{
 exportData:QuarantinedLabExport;
 lineage:OriginalTestEvidenceAudit;
 reviews:readonly OriginalRecordReview[];
 useCases:readonly DocumentedUseCase[];
}):EvidenceMethodAppraisal {
 if(!input||!Array.isArray(input.reviews)||!Array.isArray(input.useCases)||
    input.reviews.length>10000||input.useCases.length>1000)throw Error('Invalid or unbounded methodological appraisal');
 // This validates original identity and guarantees that a previously computed
 // lineage audit cannot be replayed against edited measurements.
 deriveQuarantinedExport(input.exportData,input.lineage);
 const seenReview=new Map<string,OriginalRecordReview>();
 const originalById=new Map(input.exportData.measurements.map(m=>[m.record_id,m]));
 for(const r of input.reviews){
  validateMethod(r);
  if(seenReview.has(r.recordId)||!originalById.has(r.recordId))throw Error('Ambiguous or unknown original measurement review');
  if(r.measurementFingerprint!==originalMeasurementFingerprint(originalById.get(r.recordId)!))
   throw Error('Method review does not match current measurement');
  seenReview.set(r.recordId,r);
 }
 const seenCases=new Set<string>();
 for(const u of input.useCases){
  if(!u||!goodId(u.id)||seenCases.has(u.id)||!safeReference(u.mappingReference)||
     !goodId(u.variantId)||!goodId(u.criterion)||typeof u.unit!=='string'||!u.unit.trim()||u.unit.length>128||
     !goodId(u.protocolId)||typeof u.protocolVersion!=='string'||!u.protocolVersion.trim()||u.protocolVersion.length>128||!validConditions(u.conditions))
     throw Error('Invalid or duplicate documented use case');
  seenCases.add(u.id);
 }
 const admitted=new Set(input.lineage.admittedOriginalRecordIds);
 const records:MethodAppraisalRow[]=input.exportData.measurements.map(m=>{
  const review=seenReview.get(m.record_id);
  const concerns=review?.method.filter(x=>x.finding==='documented_concern').map(x=>x.domain)??[];
  const notReported=review?.method.filter(x=>x.finding==='not_reported').map(x=>x.domain)??[];
  const methodState:MethodAppraisalState=!review?'no_review':concerns.length?'documented_concern':
    notReported.length?'documentation_incomplete':'documented_without_recorded_concern';
  const flags:string[]=[];
  if(!admitted.has(m.record_id))flags.push('lineage_not_admitted_for_research');
  if(!review)flags.push('no_method_review');
  if(concerns.length)flags.push('documented_method_concern');
  if(notReported.length)flags.push('method_details_not_reported');
  const contextMatches=input.useCases.filter(u=>u.variantId===m.tested_variant&&u.criterion===m.criterion)
    .map(u=>({useCaseId:u.id,...compareContext(m,u)}));
  if(contextMatches.length===0)flags.push('no_documented_applicability_mapping');
  if(contextMatches.length>0&&contextMatches.every(x=>x.status==='different_context'))flags.push('no_exact_context_match');
  return {recordId:m.record_id,originalTestId:m.original_test_id,variantId:m.tested_variant,
   criterion:m.criterion,lineageAdmitted:admitted.has(m.record_id),methodState,
   notReportedDomains:notReported,concernDomains:concerns,documentaryReviewOnly:true,
   contextMatches,flags};
 });
 const useCases=input.useCases.map(u=>{
  const related=records.filter(r=>r.variantId===u.variantId&&r.criterion===u.criterion);
  const exactContextRecords=related.filter(r=>r.lineageAdmitted&&r.methodState==='documented_without_recorded_concern'&&
   r.contextMatches.some(c=>c.useCaseId===u.id&&c.status==='exact_context_match')).map(r=>r.recordId).sort();
  const otherContextRecords=related.filter(r=>r.lineageAdmitted&&r.contextMatches.some(c=>c.useCaseId===u.id&&c.status==='different_context'))
   .map(r=>r.recordId).sort();
  const unreviewedOrBlockedRecords=related.filter(r=>!r.lineageAdmitted||r.methodState!=='documented_without_recorded_concern')
   .map(r=>r.recordId).sort();
  return {id:u.id,exactContextRecords,otherContextRecords,unreviewedOrBlockedRecords,
   inference:'documentary_coverage_only' as const};
 });
 return {purpose:'original_test_method_and_applicability_research_only',publicationReady:false,
  rankingEligible:false,reliabilityScore:null,confidencePercentage:null,inferredAccreditation:null,
  verifiedCommercialRights:false,auditedInputFingerprint:input.lineage.auditedInputFingerprint,
  records,documentedBetweenTestVariation:input.lineage.observedBetweenTestVariation.map(v=>({
   variantId:v.variantId,criterion:v.criterion,protocolId:v.protocolId,recordIds:v.recordIds,
   interpretation:'descriptive_only_not_statistical_disagreement' as const})),useCases,
  caveats:[
   'A completed documentary checklist is NOT validation of a laboratory method, accreditation or reviewer authenticity.',
   'An unchecked field means not reported, never proof that the laboratory omitted the procedure.',
   'A conflict of interest is a potential bias indicator, not proof of an invalid result.',
   'Matching a documented use case is only applicability screening, not evidence of task success.',
   'No composite source credibility coefficient, fixed weights, p-value, statistical confidence or recommended winner is inferred.',
   'The source set is selected: publication/availability bias cannot be ruled out by this audit.',
   'Reported variation between distinct tests is descriptive; different protocols are not merged.',
   'No real licensing or access permission is established by editor-supplied links and fields.',
   'Manufacturer marketing, Amazon, retailer data and prices are not inputs.',
  ]};
}
