/**
 * Phase 65: SMALL public-source editorial feasibility audit, NOT a licensed lab feed
 * or empirical validation against independent expert raters.
 *
 * Source assertions are human-created paraphrases and references to public articles.
 * These are research-reference-only; no commercial reuse rights are presumed.
 * No publisher score, numerical laboratory result, Amazon/retailer, or ranking.
 */
export type ObservationKind =
  'editorial_judgment'|'lab_informed_editorial_summary'|'documented_feature';
export type OutcomeLabel =
  'bose_advantage'|'sony_advantage'|'both_suitable'|'sony_only_feature'|'both_unverified';
export type ResearchRights = 'reference_only_not_cleared';
export interface PublishedObservation {
  id: string;
  sourceId: string;
  sourceUrl: string;
  productPair: 'bose_qc_ultra_1_vs_sony_wh1000xm5';
  criterion: string;
  observedContext: string;
  kind: ObservationKind;
  outcome: OutcomeLabel;
  /** Short independently written editorial annotation, NOT verbatim source article. */
  annotation: string;
  /** Method revision exactly as described by source, or null if not established. */
  methodRevision: string|null;
  reviewStatus:'one_researcher_transcription_not_expert_adjudicated';
  commercialRights: ResearchRights;
  exactVariantVerified:boolean;
  rawLabNumbersAvailable:false;
}
export interface DecisionQuestion {
  id:string;
  task:string;
  criterion:string;
  requestedContext:string;
  essential:boolean;
}
export interface ExpertAnnotation {
  caseId:string;
  raterId:string;
  verdict:'sufficient_for_this_task'|'insufficient_for_this_task'|'inapplicable';
  protocolRef:string;
}
export type AuditCase = {
  caseId:string;
  task:string;
  criterion:string;
  documents:string[];
  directlyMatchingObservations:string[];
  otherContextObservations:string[];
  unresolvedDependence:boolean;
  independentExpertValidation:'not_performed'|'requires_external_review';
  comparativeResult:'withheld';
  blockers:string[];
};
export interface ReferenceAudit {
 purpose:'research_only_primary_review_feasibility';
 publicationReady:false;
 rankingEligible:false;
 sourceRightsCleared:false;
 sourceAuthenticityEstablishedBySoftware:false;
 independentExpertValidation:'not_performed';
 sourceCount:number;
 observationCount:number;
 cases:AuditCase[];
 expertAgreement:{usablePairedCases:number;exactAgreement:number;rate:number|null};
 warnings:string[];
}
const idRx=/^[a-z][a-z0-9_]{2,120}$/;
function refOk(url:string):boolean {
 try {const u=new URL(url);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password&&
 (u.hostname==='www.rtings.com'||u.hostname==='www.soundguys.com');} catch{return false;}
}
function fail(condition:boolean,message:string) {if(condition)throw new Error(message);}
export function auditPrimaryReviewReferences(input:{observations:PublishedObservation[];questions:DecisionQuestion[];externalAnnotations?:ExpertAnnotation[]}):ReferenceAudit {
 fail(!input||!Array.isArray(input.observations)||!Array.isArray(input.questions)||!Array.isArray(input.externalAnnotations??[]),'Invalid audit input');
 fail(input.observations.length>200||input.questions.length>100,'Oversized reference-only evaluation');
 const unique = new Set<string>();
 const sourceLocations = new Map<string,string>();
 for(const o of input.observations){
  fail(!o||!idRx.test(o.id)||unique.has(o.id),'Invalid or repeated observation id'); unique.add(o.id);
  fail(!idRx.test(o.sourceId)||!refOk(o.sourceUrl)||!idRx.test(o.criterion)||!idRx.test(o.observedContext),'Invalid source or classification');
  fail(sourceLocations.has(o.sourceId)&&sourceLocations.get(o.sourceId)!==o.sourceUrl,'One source ID cannot name different articles');
  sourceLocations.set(o.sourceId,o.sourceUrl);
  fail(o.productPair!=='bose_qc_ultra_1_vs_sony_wh1000xm5'||!['editorial_judgment','lab_informed_editorial_summary','documented_feature'].includes(o.kind)||
   !['bose_advantage','sony_advantage','both_suitable','sony_only_feature','both_unverified'].includes(o.outcome),'Invalid case evidence');
  fail(o.commercialRights!=='reference_only_not_cleared'||o.rawLabNumbersAvailable!==false||
   o.reviewStatus!=='one_researcher_transcription_not_expert_adjudicated','Cannot claim validated/cleared evidence');
  fail(o.exactVariantVerified!==true||typeof o.annotation!=='string'||o.annotation.length<15||o.annotation.length>400,'Missing manual source traceability');
 }
 const questions = new Set<string>();
 for(const q of input.questions){
  fail(!q||!idRx.test(q.id)||questions.has(q.id)||!idRx.test(q.criterion)||
    !idRx.test(q.requestedContext)||!q.task||q.task.length>300||typeof q.essential!=='boolean','Invalid decision task');
  questions.add(q.id);
 }
 const allAnnotations=input.externalAnnotations??[];
 const ratings = new Map<string,ExpertAnnotation[]>();
 const seen = new Set<string>();
 for(const a of allAnnotations){
  fail(!questions.has(a.caseId)||!idRx.test(a.raterId)||!
    ['sufficient_for_this_task','insufficient_for_this_task','inapplicable'].includes(a.verdict)||
    !/^https:\/\//.test(a.protocolRef),'Invalid independently supplied annotation');
  const k=`${a.caseId}|${a.raterId}`;fail(seen.has(k),'Duplicate independent annotation');seen.add(k);
  ratings.set(a.caseId,[...(ratings.get(a.caseId)??[]),a]);
 }
 const cases:AuditCase[]=input.questions.map(q=>{
  const relevant=input.observations.filter(o=>o.criterion===q.criterion);
  const exact=relevant.filter(o=>o.observedContext===q.requestedContext);
  const distinctSources=[...new Set(relevant.map(o=>o.sourceUrl))];
  const blockers:string[]=[];
  if(!relevant.length)blockers.push('no_recorded_professional_observation');
  else if(!exact.length)blockers.push('no_exact_use_context');
  if(exact.some(o=>o.kind!=='documented_feature'))blockers.push('qualitative_or_lab_summary_not_raw_measured_effect');
  if(exact.length)blockers.push('no_independently_assessed_practical_importance_threshold');
  blockers.push('source_rights_not_cleared_for_commercial_engine');
  if((ratings.get(q.id)??[]).length<2)blockers.push('two_independent_expert_assessments_missing');
  return {caseId:q.id,task:q.task,criterion:q.criterion,documents:distinctSources,
   directlyMatchingObservations:exact.map(o=>o.id),
   otherContextObservations:relevant.filter(o=>o.observedContext!==q.requestedContext).map(o=>o.id),
   unresolvedDependence:relevant.length>1,independentExpertValidation:'requires_external_review',
   comparativeResult:'withheld',blockers};
 });
 const paired=[...ratings.values()].filter(a=>a.length===2);
 return {purpose:'research_only_primary_review_feasibility',publicationReady:false,rankingEligible:false,
  sourceRightsCleared:false,sourceAuthenticityEstablishedBySoftware:false,
  independentExpertValidation:'not_performed',
  sourceCount:new Set(input.observations.map(o=>o.sourceUrl)).size,
  observationCount:input.observations.length,cases,
  expertAgreement:{usablePairedCases:paired.length,exactAgreement:paired.filter(a=>a[0].verdict===a[1].verdict).length,
   rate:paired.length?paired.filter(a=>a[0].verdict===a[1].verdict).length/paired.length:null},
  warnings:['Single-researcher source notes are not blinded independent expert judgments.',
   'No original numeric laboratory measurements or publisher scoring have been ingested.',
   'Public access and citations do not grant commercial ingestion or derivative-use rights.',
   'External annotation entries are unverified; their agreement is a raw descriptive statistic, not expert validation.',
   'No product winner, inferential confidence, or expert-validation claim is supported.']};
}
