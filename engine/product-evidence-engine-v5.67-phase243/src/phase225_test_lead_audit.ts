/** Source-bound audit: Phase225 findings are hypotheses awaiting Phase95/193+
 * source-originality, reviewer, method, market, exact-variant and protocol gates.
 * No measurements may enter a ranked evidence matrix from this module. */
import {createHash} from 'node:crypto';
import type {Observation222} from './phase222_transient_public_page_observer.js';
import type {TestCandidate225} from './phase225_transient_test_probe.js';
const digest=(v:string)=>createHash('sha256').update(v).digest('hex');
const isSha=(x:unknown)=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
export interface TestLeadAudit225{
 schema:'pee225.test-lead-audit.v1';status:'research_only';
 candidateCount:number;observedSourceCount:number;sourceRevisionConflicts:readonly string[];
 methodBlocksObserved:number;instrumentBlocksObserved:number;
 needsHumanReview:readonly {sourceUrl:string;leadId:string;action:'verify_original_work_method_reviewer_and_variant'}[];
 reasons:readonly string[];
 sourceBodiesStored:false;sourcePassagesStored:false;independentTestsAuthenticated:0;
 evidencePromoted:0;rankingAuthorized:false;
}
export function auditTestLeads225(...observations:readonly (Observation222|null)[]):TestLeadAudit225{
 const seen=new Map<string,TestCandidate225>(),sources=new Set<string>();
 const revisions=new Map<string,Set<string>>();let methods=0,instruments=0,blocked=0,truncated=false;
 for(const run of observations){
  if(!run)continue;
  if(run.schema!=='pee222.page-observation.v1'||run.noSourceBodiesStored!==true||
   run.rankingAuthorized!==false||run.independentEvidenceVerified!==false)throw Error('phase225_untrusted_observation');
  for(const receipt of run.receipts){
   if(receipt.status==='blocked'){blocked++;continue;}
   const probe=receipt.transientTestProbe225;
   if(!probe||probe.schema!=='pee225.transient-test-probe.v1'||
     probe.sourceUrl!==receipt.url||probe.sourceBodyRetained!==false||
     probe.sourcePassagesRetained!==false||probe.rankingAuthorized!==false||
     probe.independenceAuthenticated!==false||probe.protocolAuthenticated!==false||
     !Array.isArray(probe.candidates)||probe.candidates.length>20)throw Error('phase225_invalid_probe');
   methods+=probe.methodBlocks;instruments+=probe.instrumentBlocks;
   if(probe.truncated)truncated=true;
   const revisionsForUrl=revisions.get(receipt.url)??new Set<string>();
   revisionsForUrl.add(receipt.responseSha256??'unverified_sha');revisions.set(receipt.url,revisionsForUrl);
   for(const c of probe.candidates){
    if(c.sourceUrl!==receipt.url||c.documentSha256!==receipt.responseSha256||
      !isSha(c.id)||!isSha(c.blockSha256)||!Number.isFinite(c.value)||
      c.value<0||c.value>1e7||c.classification!=='publisher_reported_measurement_lead_only'||
      c.originalWorkReviewed!==false||c.methodReviewed!==false||c.reviewerIndependent!==false||
      c.exactVariantVerified!==false||c.scientificEvidenceAdmitted!==false||c.rankingAuthorized!==false||
      c.market!=='unknown'||
      !Number.isSafeInteger(c.blockIndex)||c.blockIndex<0||
      !Number.isSafeInteger(c.valueOffset)||c.valueOffset<0||
      c.id!==digest(JSON.stringify([c.sourceUrl,c.blockSha256,c.valueOffset,c.value,c.unit,c.subject]))||
      !['page_context_unverified','multiple_models_unresolved','not_identified','table_row_declared_model_unverified'].includes(c.subjectAssignment)||
      (c.subjectAssignment==='table_row_declared_model_unverified'&&
       (c.subject===null||c.methodCue!=='bounded_table_result_with_local_method'||
       !/^[a-z][a-z0-9_]{1,48}$/.test(c.publisherDeclaredDimension??'')||
       !['compartment_unspecified','whole_product_unspecified'].includes(c.publisherDeclaredTargetScope??'')))||
      (c.subject!==null&&!receipt.productLeads.some(p=>p.name===c.subject?.name&&p.model===c.subject?.model&&p.sku===c.subject?.sku)))
      throw Error('phase225_claim_promoted_or_scope_mismatch');
    seen.set(c.id,c);sources.add(receipt.url);
   }
  }
 }
 const versionConflicts=[...revisions].filter(([,set])=>set.size>1).map(([u])=>u).sort();
 const reasons=['original_publication_editorial_independence_unverified','test_method_instrument_conditions_and_protocol_require_review',
  'product_variant_and_market_scope_unverified'];
 if(!seen.size)reasons.push('no_explicit_measured_test_candidates');
 if(blocked)reasons.push('source_access_blocked');
 if(truncated)reasons.push('incomplete_bounded_text_coverage');
 if(versionConflicts.length)reasons.push('source_version_changed_requires_reinspection');
 return {schema:'pee225.test-lead-audit.v1',status:'research_only',candidateCount:seen.size,
  observedSourceCount:sources.size,sourceRevisionConflicts:versionConflicts,
  methodBlocksObserved:methods,instrumentBlocksObserved:instruments,
  needsHumanReview:[...seen.values()].sort((a,b)=>a.id.localeCompare(b.id)).map(c=>({sourceUrl:c.sourceUrl,leadId:c.id,
   action:'verify_original_work_method_reviewer_and_variant' as const})),reasons,
  sourceBodiesStored:false,sourcePassagesStored:false,independentTestsAuthenticated:0,evidencePromoted:0,rankingAuthorized:false};
}
