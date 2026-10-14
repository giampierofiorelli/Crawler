/** Phase198: task-specific outcome corroboration ADVISORY over Phase197.
 * Original product evidence is still only research-annotated. No certification
 * lookup, reviewer credential authentication, evidence admission or ranking.
 * A professional's passport, language, celebrity or publisher never conveys authority.
 */
import {assessSufficiency197,type EvidenceSufficiencyInput197,
 type SufficiencyDecision197,type SufficiencyState197,type CriterionEvidence197}
 from './phase197_evidence_sufficiency.js';
import {type ResearchPlan182} from './phase182_gap_research_orchestrator.js';
import {type SourceMatrix196} from './phase196_source_intelligence.js';

const ident=(x:unknown):x is string=>typeof x==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(x);
const date=(x:unknown):x is string=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&
 !Number.isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
const https=(x:unknown):x is string=>typeof x==='string'&&x.length<=2048&&
 /^https:\/\/[^\s/?#]+(?:\/[^\s]*)?$/.test(x);
const unique=(a:readonly string[])=>new Set(a).size===a.length;
function require198(ok:unknown,why:string):asserts ok {if(!ok)throw Error('phase198_'+why);}

export type Need198='optional_corroboration'|'essential_for_goal';
export interface OutcomeNeed198 {
 criterionId:string;disciplineId:string;outcomeId:string;need:Need198;
 /** Must be reviewed against the user's explicit goal; not inferred from category. */
 userGoalReviewId:string;scopeJustificationId:string;
}
/** Documented competence for EXACT practice, not nationality or a source's reputation. */
export interface Specialist198 {
 specialistId:string;disciplineIds:readonly string[];outcomeIds:readonly string[];
 evidenceBasis:'documented_professional_practice'|'evaluated_sensory_panel'|
  'declared_expertise_only'|'unverified';
 credentialOrPracticeUrl:string|null;competenceReviewId:string|null;
 /** Test authorship and actual participation must be checked separately. */
}
/** Must map to a Phase197 original record / reviewed event group. */
export interface PracticalOutcome198 {
 observationId:string;criterionId:string;sourceRecordId:string;specialistId:string;
 disciplineId:string;outcomeId:string;protocolId:string;conditionId:string;
 testMode:'structured_professional_use'|'controlled_sensory_panel'|'informal_opinion';
 assessment:'supports'|'contradicts'|'inconclusive';
 operatorParticipationReviewed:boolean;testMethodReviewId:string|null;
 reviewedSourceUrl:string;commercialRelationship:'none_disclosed'|'disclosed'|'unknown';
 conflictReviewId:string|null;
}
export type RecognitionKind198='formal_product_certification'|'discipline_scheme_approval'|
 'professional_endorsement'|'sponsorship_or_supplier'|'person_credential';
export interface Recognition198 {
 recognitionId:string;criterionId:string;sourceRecordId:string;
 kind:RecognitionKind198;disciplineId:string;outcomeId:string;variantId:string;
 /** Issuer name is informational; not an allowlist or certificate proof. */
 issuerId:string;programmeId:string|null;programmeVersionId:string|null;
 registryUrl:string|null;registryReviewId:string|null;
 outcomeScopeReviewId:string|null;testMethodReviewId:string|null;
 entryStatus:'active'|'suspended'|'withdrawn'|'expired'|'unknown';
 recordedFrom:string|null;validThrough:string|null;
 documentedConflicts:'reviewed_no_known_conflict'|'relationship_disclosed'|'not_reviewed';
}
export interface SpecialistInput198 {
 phase197:EvidenceSufficiencyInput197;
 needs:readonly OutcomeNeed198[];
 specialists:readonly Specialist198[];
 practicalTests:readonly PracticalOutcome198[];
 recognitions:readonly Recognition198[];
 /** Deterministic caller-supplied evaluation date. No Date.now or network. */
 asOf:string;
}
export interface SpecialistEvidenceRow198 {
 evidenceId:string;kind:'professional_outcome_test'|'product_recognition';
 criterionId:string;sourceRecordId:string;eventGroupId:string|null;
 classification:'qualified_practical_support'|'qualified_practical_challenge'|
  'scoped_programme_support'|'scoped_programme_challenge'|'unqualified_or_unreviewed'|
  'personal_or_commercial_claim'|'inconclusive';
 notAnAuthenticatedOriginalTest:true;
}
export interface SpecialistCoverage198 {
 criterionId:string;disciplineId:string;outcomeId:string;need:Need198;
 qualifiedSupportEventGroups:readonly string[];qualifiedChallengeEventGroups:readonly string[];
 qualifiedSupportRecords:readonly string[];qualifiedChallengeRecords:readonly string[];
 additionalDistinctEventGroupsVsInstrumental:readonly string[];
 recognisedProgrammeIds:readonly string[];
 unqualifiedClaimCount:number;conflictingResult:boolean;
 status:'qualified_support_reviewed_unadmitted'|'conflict_needs_review'|
  'no_qualified_support'|'unverified_only';
 /** A competence review/certificate registry annotation is NOT independent authentication. */
 externalCredentialsIndependentlyAuthenticated:false;
}
export interface SpecialistDecision198 {
 schema:'198.1';state:'research_only';category:string;base197:SufficiencyDecision197;
 specialistSearch198:SufficiencyState197;outcomeNeeds:readonly SpecialistCoverage198[];
 evidenceRows:readonly SpecialistEvidenceRow198[];
 unmetEssentialOutcomeIds:readonly string[];outcomeContradictionIds:readonly string[];
 specialistResearchHints:readonly string[];
 specialistReviewCannotUpgradeBase197:true;independentOriginAuthentication:false;
 commercialEndorsementsAreNotTests:true;nationalityBasedAuthority:false;
 noUniversalSpecialistRequirement:true;rankingsUnchanged:true;fullReviewTextStored:false;
}
const sorted=(xs:Iterable<string>)=>[...new Set(xs)].sort();
function getRecord(a:SpecialistInput198,criterionId:string,sourceRecordId:string):CriterionEvidence197{
 const record=a.phase197.evidence.find(e=>e.criterionId===criterionId&&e.sourceRecordId===sourceRecordId);
 require198(!!record,'unknown_record');return record;
}
/** Produces a second, scoped explanation of outcome suitability, never awards a
 * generalized quality score or reinterprets Phase193 / 195 source custody. */
export function assessSpecialistOutcome198(a:SpecialistInput198):SpecialistDecision198 {
 const base=assessSufficiency197(a.phase197);
 require198(date(a.asOf)&&Array.isArray(a.needs)&&a.needs.length<=100&&
  Array.isArray(a.specialists)&&a.specialists.length<=200&&
  Array.isArray(a.practicalTests)&&a.practicalTests.length<=500&&
  Array.isArray(a.recognitions)&&a.recognitions.length<=500,'input_shape');
 require198(unique(a.needs.map(x=>x.criterionId))&&
  unique(a.specialists.map(x=>x.specialistId))&&
  unique(a.practicalTests.map(x=>x.observationId))&&
  unique(a.recognitions.map(x=>x.recognitionId))&&
  unique([...a.practicalTests.map(x=>x.observationId),...a.recognitions.map(x=>x.recognitionId)]),
  'duplicate_identity');
 const needMap=new Map(a.needs.map(n=>[n.criterionId,n]));
 const specialistMap=new Map(a.specialists.map(s=>[s.specialistId,s]));
 for(const n of a.needs){
  const criterion=a.phase197.criteria.find(c=>c.criterionId===n.criterionId);
  require198(!!criterion&&criterion.domain!=='safety_or_compatibility'&&
   ident(n.disciplineId)&&ident(n.outcomeId)&&ident(n.userGoalReviewId)&&
   ident(n.scopeJustificationId)&&['optional_corroboration','essential_for_goal'].includes(n.need),
   'need_scope');
 }
 for(const s of a.specialists){
  require198(ident(s.specialistId)&&Array.isArray(s.disciplineIds)&&s.disciplineIds.length<=30&&
   s.disciplineIds.every(ident)&&unique(s.disciplineIds)&&Array.isArray(s.outcomeIds)&&
   s.outcomeIds.length<=50&&s.outcomeIds.every(ident)&&unique(s.outcomeIds)&&
   ['documented_professional_practice','evaluated_sensory_panel','declared_expertise_only','unverified'].includes(s.evidenceBasis)&&
   (s.credentialOrPracticeUrl===null||https(s.credentialOrPracticeUrl))&&
   (s.competenceReviewId===null||ident(s.competenceReviewId)),'expert_profile');
 }
 const rows:SpecialistEvidenceRow198[]=[];
 for(const x of a.practicalTests){
  const n=needMap.get(x.criterionId),s=specialistMap.get(x.specialistId);
  require198(!!n&&!!s&&ident(x.observationId)&&ident(x.sourceRecordId)&&
   x.disciplineId===n.disciplineId&&x.outcomeId===n.outcomeId&&
   https(x.reviewedSourceUrl)&&
   ['structured_professional_use','controlled_sensory_panel','informal_opinion'].includes(x.testMode)&&
   ['supports','contradicts','inconclusive'].includes(x.assessment)&&
   typeof x.operatorParticipationReviewed==='boolean'&&
   (x.testMethodReviewId===null||ident(x.testMethodReviewId))&&
   ['none_disclosed','disclosed','unknown'].includes(x.commercialRelationship)&&
   (x.conflictReviewId===null||ident(x.conflictReviewId)),'practical_scope');
  const r=getRecord(a,x.criterionId,x.sourceRecordId);
  require198(x.protocolId===r.protocolId&&x.conditionId===r.conditionId&&
   x.assessment===(r.finding==='supports'?'supports':r.finding==='contradicts'?'contradicts':'inconclusive'),
   'method_or_finding_mismatch');
  const documented=(s.evidenceBasis==='documented_professional_practice'||
   s.evidenceBasis==='evaluated_sensory_panel')&&s.disciplineIds.includes(n.disciplineId)&&
   s.outcomeIds.includes(n.outcomeId)&&!!s.credentialOrPracticeUrl&&!!s.competenceReviewId;
  const qualified=!!documented&&r.role==='structured_professional_observation'&&
   !!r.originalEventGroupId&&!!r.lineageReviewId&&!!r.methodReviewId&&!!r.scopeReviewId&&
   !!x.testMethodReviewId&&x.operatorParticipationReviewed&&
   (x.testMode!=='controlled_sensory_panel'||s.evidenceBasis==='evaluated_sensory_panel')&&
   x.testMode!=='informal_opinion'&&x.commercialRelationship!=='unknown'&&!!x.conflictReviewId;
  rows.push({evidenceId:x.observationId,kind:'professional_outcome_test',
   criterionId:x.criterionId,sourceRecordId:x.sourceRecordId,
   eventGroupId:qualified?r.originalEventGroupId:null,
   classification:!qualified?'unqualified_or_unreviewed':x.assessment==='inconclusive'?'inconclusive':
    x.assessment==='supports'?'qualified_practical_support':'qualified_practical_challenge',
   notAnAuthenticatedOriginalTest:true});
 }
 for(const x of a.recognitions){
  const n=needMap.get(x.criterionId);
  require198(!!n&&ident(x.recognitionId)&&ident(x.sourceRecordId)&&
   x.disciplineId===n.disciplineId&&x.outcomeId===n.outcomeId&&
   x.variantId===a.phase197.variantId&&ident(x.issuerId)&&
   ['formal_product_certification','discipline_scheme_approval','professional_endorsement',
    'sponsorship_or_supplier','person_credential'].includes(x.kind)&&
   (x.programmeId===null||ident(x.programmeId))&&
   (x.programmeVersionId===null||ident(x.programmeVersionId))&&
   (x.registryUrl===null||https(x.registryUrl))&&
   (x.registryReviewId===null||ident(x.registryReviewId))&&
   (x.outcomeScopeReviewId===null||ident(x.outcomeScopeReviewId))&&
   (x.testMethodReviewId===null||ident(x.testMethodReviewId))&&
   ['active','suspended','withdrawn','expired','unknown'].includes(x.entryStatus)&&
   (x.recordedFrom===null||date(x.recordedFrom))&&
   (x.validThrough===null||date(x.validThrough))&&
   ['reviewed_no_known_conflict','relationship_disclosed','not_reviewed'].includes(x.documentedConflicts),
   'recognition_scope');
  const r=getRecord(a,x.criterionId,x.sourceRecordId);
  const isScheme=x.kind==='formal_product_certification'||x.kind==='discipline_scheme_approval';
  const reviewed=isScheme&&r.role==='official_programme_field'&&!!r.originalEventGroupId&&
   !!r.lineageReviewId&&!!r.methodReviewId&&!!r.scopeReviewId&&
   !!x.programmeId&&!!x.programmeVersionId&&!!x.registryUrl&&!!x.registryReviewId&&
   !!x.outcomeScopeReviewId&&!!x.testMethodReviewId&&
   x.entryStatus==='active'&&x.documentedConflicts!=='not_reviewed'&&
   !!x.recordedFrom&&x.recordedFrom<=a.asOf&&
   (x.validThrough===null||x.validThrough>=a.asOf);
  rows.push({evidenceId:x.recognitionId,kind:'product_recognition',
   criterionId:x.criterionId,sourceRecordId:x.sourceRecordId,
   eventGroupId:reviewed?r.originalEventGroupId:null,
   classification:!isScheme?'personal_or_commercial_claim':!reviewed?'unqualified_or_unreviewed':
    r.finding==='inconclusive'?'inconclusive':r.finding==='supports'?
    'scoped_programme_support':'scoped_programme_challenge',
   notAnAuthenticatedOriginalTest:true});
 }
 const cover:SpecialistCoverage198[]=[...a.needs].sort((x,y)=>x.criterionId.localeCompare(y.criterionId))
  .map(n=>{
   const rel=rows.filter(r=>r.criterionId===n.criterionId);
   const supporting=rel.filter(r=>r.classification==='qualified_practical_support'||
    r.classification==='scoped_programme_support');
   const challenging=rel.filter(r=>r.classification==='qualified_practical_challenge'||
    r.classification==='scoped_programme_challenge');
   const supportRoots=sorted(supporting.map(r=>r.eventGroupId!).filter(Boolean));
   const challengeRoots=sorted(challenging.map(r=>r.eventGroupId!).filter(Boolean));
   const baseInstrumental=new Set(a.phase197.evidence.filter(r=>r.criterionId===n.criterionId&&
    r.role==='independent_instrumental').map(r=>r.originalEventGroupId));
   const unqualified=rel.filter(r=>r.classification==='unqualified_or_unreviewed'||
    r.classification==='personal_or_commercial_claim').length;
   const conflicted=challengeRoots.length>0||
    supportRoots.some(k=>challengeRoots.includes(k));
   return {criterionId:n.criterionId,disciplineId:n.disciplineId,outcomeId:n.outcomeId,
    need:n.need,qualifiedSupportEventGroups:supportRoots,qualifiedChallengeEventGroups:challengeRoots,
    qualifiedSupportRecords:sorted(supporting.map(x=>x.sourceRecordId)),
    qualifiedChallengeRecords:sorted(challenging.map(x=>x.sourceRecordId)),
    additionalDistinctEventGroupsVsInstrumental:supportRoots.filter(x=>!baseInstrumental.has(x)),
    recognisedProgrammeIds:sorted(a.recognitions.filter(r=>r.criterionId===n.criterionId&&
     supporting.some(x=>x.evidenceId===r.recognitionId)).map(x=>x.programmeId!).filter(Boolean)),
    unqualifiedClaimCount:unqualified,conflictingResult:conflicted,
    status:conflicted?'conflict_needs_review':supportRoots.length?
     'qualified_support_reviewed_unadmitted':unqualified?'unverified_only':'no_qualified_support',
    externalCredentialsIndependentlyAuthenticated:false as const};
  });
 const unmet=cover.filter(c=>c.need==='essential_for_goal'&&
  c.status!=='qualified_support_reviewed_unadmitted').map(x=>x.criterionId);
 const contradictions=cover.filter(c=>c.conflictingResult).map(x=>x.criterionId);
 const gaps=unmet.length>0||contradictions.length>0;
 let specialistSearch198=base.search197;
 if(gaps&&base.search197==='sufficient_bounded'){
  specialistSearch198=a.phase197.operations.status==='no_further_accessible_sources'?
   'exhausted_insufficient': 'continue';
 }else if(gaps&&base.search197==='provisional'&&a.phase197.operations.status==='active'){
  specialistSearch198='continue';
 }
 const hints=sorted([...cover.filter(x=>x.need==='essential_for_goal'&&
  x.status!=='qualified_support_reviewed_unadmitted').map(x=>`seek_specialist_outcome:${x.criterionId}`),
  ...cover.filter(x=>x.need==='optional_corroboration'&&
   x.status==='no_qualified_support').map(x=>`optional_specialist_corroboration:${x.criterionId}`),
  ...cover.filter(x=>x.status==='unverified_only').map(x=>`verify_professional_or_scheme:${x.criterionId}`),
  ...contradictions.map(x=>`review_specialist_contradiction:${x}`)]);
 return {schema:'198.1',state:'research_only',category:a.phase197.category,base197:base,specialistSearch198,
  outcomeNeeds:cover,evidenceRows:rows.sort((x,y)=>x.evidenceId.localeCompare(y.evidenceId)),
  unmetEssentialOutcomeIds:unmet,outcomeContradictionIds:contradictions,
  specialistResearchHints:hints,specialistReviewCannotUpgradeBase197:true,
  independentOriginAuthentication:false,commercialEndorsementsAreNotTests:true,
  nationalityBasedAuthority:false,noUniversalSpecialistRequirement:true,
  rankingsUnchanged:true,fullReviewTextStored:false};
}
/** Narrow read-only hand-off to Phase182 research jobs; never queues a phantom job.
 * Caller must integrate hints with existing research priority review, not execute automatically. */
export function specialistJobHints198(args:{decision:SpecialistDecision198;
 plan:ResearchPlan182;matrix:SourceMatrix196;category:string}):readonly {
 jobId:string;criterionId:string;sourceIds:readonly string[];unmetEssential:boolean;
 usesExistingJob:true;executeAutomatically:false;}[]{
 const {decision:d,plan:p,matrix:m}=args;
 require198(d.schema==='198.1'&&d.state==='research_only'&&d.rankingsUnchanged&&
  p.phase===182&&p.schema==='182.1'&&p.planningOnly&&p.rankingAuthorized===false&&
  m.schema==='196.1'&&m.state==='research_only'&&m.publicRankingAllowed===false&&
  ident(args.category)&&p.categoryId===args.category&&d.category===args.category,'bridge');
 const candidates=d.outcomeNeeds.filter(n=>n.status!=='qualified_support_reviewed_unadmitted');
 return p.jobs.filter(j=>j.kind==='exact_variant_source_research'&&
  j.exactVariantId===d.base197.variantId&&j.categoryId===args.category).flatMap(j=>candidates.filter(n=>j.criterionId===n.criterionId)
  .map(n=>({jobId:j.jobId,criterionId:n.criterionId,
   sourceIds:sorted(m.rows.filter(r=>r.category===j.categoryId&&
    r.variantId===d.base197.variantId&&
    r.field===d.base197.criteriaCoverage.find(c=>c.criterionId===n.criterionId)?.field&&
    m.reviewQueue.some(q=>q.sourceId===r.sourceId)).map(r=>r.sourceId)),
   unmetEssential:n.need==='essential_for_goal',usesExistingJob:true as const,
   executeAutomatically:false as const}))).sort((a,b)=>a.jobId.localeCompare(b.jobId)||
    a.criterionId.localeCompare(b.criterionId));
}
