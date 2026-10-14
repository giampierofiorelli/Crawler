/** Phase197: an AUDITABLE research-stop advisory overlay, not a new evidence/ranking system.
 * Reuses Phase79's demand search decision and Phase191's sparse findings, with
 * Phase182/196 planning kept research-only. No fixed number of reviews, universal
 * language / nationality score, corpus retention, or automatic credibility grant.
 * Human/operator receipts below are annotations until authenticated externally.
 */
import {demandScopeHash,type PortfolioAudit} from './phase77_decision_research.js';
import {type ReviewedSearchAudit} from './phase78_search_adequacy.js';
import {decideWhetherToResearchMore,type SearchContinuationAudit,
 type SearchContinuationDecision} from './phase79_adaptive_search_decision.js';
import {type EvidenceLandscape191,type ProductFinding191} from './phase191_sparse_source_integrity.js';
import {type ResearchPlan182} from './phase182_gap_research_orchestrator.js';
import {type SourceMatrix196} from './phase196_source_intelligence.js';

const ident=(v:unknown):v is string=>typeof v==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(v);
const unique=(items:readonly string[])=>new Set(items).size===items.length;
const lang=(v:unknown):v is string=>typeof v==='string'&&/^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-[A-Z]{2}|-[0-9]{3})?$/.test(v);
const market=(v:unknown):v is string=>typeof v==='string'&&/^[A-Z]{2}$/.test(v);
const list=(v:unknown,n=100):v is string[]=>Array.isArray(v)&&v.length<=n&&v.every(ident)&&unique(v);
function assert(ok:unknown,why:string):asserts ok {if(!ok)throw Error('phase197_'+why);}

export type EvidenceRole197='independent_instrumental'|'structured_professional_observation'|
 'official_programme_field'|'manufacturer_specification'|'derivative_or_unresolved';
export type ClaimFinding197='supports'|'contradicts'|'inconclusive';
/** A record ID must belong to a real Phase191 scoped finding; neither an analyst
 * receipt nor a Phase191 root count proves authenticated test-event originality. */
export interface CriterionEvidence197 {
 criterionId:string;sourceRecordId:string;role:EvidenceRole197;finding:ClaimFinding197;
 protocolId:string;conditionId:string;
 originalEventGroupId:string|null;lineageReviewId:string|null;methodReviewId:string|null;
 scopeReviewId:string|null;
}
export interface CriterionScope197 {
 criterionId:string;phase191Field:string;protocolId:string;conditionId:string;critical:boolean;
 /** Values beyond generic core constraints may be descriptive, never inferred hard requirements. */
 domain:'technical_performance'|'safety_or_compatibility'|'practical_use'|
 'cultural_standard_conformance'|'sensory_preference';
}
export type SearchPassStatus197='completed_no_new_evidence'|'completed_new_evidence'|
 'blocked_rights'|'blocked_translation'|'pending';
export interface ResearchPass197 {
 passId:string;channel:'independent_testing'|'professional_registry'|'industry_directory'|
 'manufacturer_catalogue'|'specialist_editorial'|'international_search';
 originId:string;language:string;market:string;status:SearchPassStatus197;
 /** Every completed search requires a review receipt; receipt is not publisher-byte custody. */
 reviewId:string|null;foundSourceIds:readonly string[];
 /** Explicit scope of a regional search receipt. Same language/market alone is
  * insufficient to close searches about distinct criteria. */
 targetIds?:readonly string[];
}
export interface RegionalSearchTarget197 {
 targetId:string;criterionId:string;language:string;market:string;
 rationale:'specialist_market'|'exact_variant_market'|'cultural_protocol'|
 'independent_challenge'|'novel_publisher';
 /** True only when a research reviewer judged this exploration necessary. */
 required:boolean;reviewId:string;
}
/** Does not encode nationality as competence. All documented expertise is narrowly
 * tied to a method/field/tradition and is never multiplied into source authority. */
export interface AssessorExpertise197 {
 evidenceRecordId:string;criterionId:string;language:string;testedMarket:string;
 expertise:'documented_professional_practice'|'sensory_training'|
 'protocol_authorship'|'domain_standard_experience'|'not_established';
 competenceScopeReviewId:string|null;
 basisReferenceId:string|null;
}
export type SufficiencyState197='sufficient_bounded'|'provisional'|'continue'|
 'exhausted_insufficient'|'deferred_by_budget';
export interface EvidenceSufficiencyInput197 {
 portfolio:PortfolioAudit;baseline:ReviewedSearchAudit;continuation:SearchContinuationAudit;
 landscape:EvidenceLandscape191;
 productId:string;variantId:string;category:string;market:string;
 criteria:readonly CriterionScope197[];evidence:readonly CriterionEvidence197[];
 passes:readonly ResearchPass197[];regionalTargets:readonly RegionalSearchTarget197[];
 expertise:readonly AssessorExpertise197[];
 /** Stop for practical resource reasons, not a claim of scientifically adequate proof. */
 operations:{status:'active'|'no_further_accessible_sources'|'budget_deferred';
  reviewerId:string|null;reasonId:string|null};
}
export interface CriterionCoverage197 {
 criterionId:string;field:string;protocolId:string;conditionId:string;critical:boolean;domain:CriterionScope197['domain'];
 rootGroupsFromReviewedAnnotations:readonly string[];
 independentEvidenceRecordCount:number;inconclusiveIndependentRecordCount:number;manufacturerProvisionalCount:number;
 unresolvedOrDerivedCount:number;conflictingEvidence:boolean;domainExpertiseMissing:boolean;
 /** Reviewed annotations are not publisher-authenticated test-event identities. */
 originIdentityScientificallyVerified:false;
 evidenceForDecision:'reviewed_unadmitted'|'provisional_only'|'unresolved'|'absent';
}
export interface SufficiencyDecision197 {
 schema:'197.1';state:'research_only';scopeHash:string;productId:string;variantId:string;
 search197:SufficiencyState197;priorSearch79:SearchContinuationDecision['conclusion'];
 criteriaCoverage:readonly CriterionCoverage197[];missingCriticalIds:readonly string[];
 unresolvedContradictionIds:readonly string[];unexploredRequiredTargetIds:readonly string[];
 completedResearchPaths:number;remainingResearchHints:readonly string[];reasons:readonly string[];
 evidenceProvenanceAuthenticated:false;exactTestEventIdentityAuthenticated:false;
 stopIsNotNegativeQualityAssessment:true;rankingAuthorized:false;fullReviewTextStored:false;
 independenceOfRegionalReportsNotAssumed:true;languageOrPassportReputationScoreUsed:false;
}
const independent=(r:EvidenceRole197)=>r==='independent_instrumental'||
 r==='structured_professional_observation'||r==='official_programme_field';
/** Deterministic advisory on already reviewed research, not an auto-publication gate. */
export function assessSufficiency197(a:EvidenceSufficiencyInput197):SufficiencyDecision197 {
 const {portfolio:p,landscape:l}=a;
 const baseline79=decideWhetherToResearchMore(p,a.baseline,a.continuation);
 assert(!!l&&l.phase===191&&l.schema==='191.1'&&l.state==='research_only'&&
  l.publicRankingAllowed===false&&l.market===a.market,'landscape_scope');
 assert(ident(a.productId)&&p.candidates.some(c=>c.productId===a.productId)&&
  ident(a.variantId)&&ident(a.category)&&market(a.market),'product_scope');
 const demanded=new Set([...p.demand.outcomeIds,...p.demand.mustHaveIds,...p.demand.exclusionIds]);
 assert(Array.isArray(a.criteria)&&a.criteria.length>0&&a.criteria.length<=100&&
  unique(a.criteria.map(c=>c.criterionId))&&a.criteria.every(c=>ident(c.criterionId)&&
  ident(c.phase191Field)&&ident(c.protocolId)&&ident(c.conditionId)&&demanded.has(c.criterionId)&&
  ['technical_performance','safety_or_compatibility','practical_use',
   'cultural_standard_conformance','sensory_preference'].includes(c.domain)&&
   typeof c.critical==='boolean')&&
  [...p.demand.outcomeIds,...p.demand.mustHaveIds].every(x=>a.criteria.some(c=>c.criterionId===x&&c.critical)),
  'criterion_scope');
 const findings=new Map<string,ProductFinding191>();
 for(const c of a.criteria){
  const matched=l.findings.filter(f=>f.category===a.category&&f.variantId===a.variantId&&
   f.field===c.phase191Field);
  assert(matched.length===1,'missing_or_ambiguous_191_field');
  findings.set(c.criterionId,matched[0]);
 }
 assert(Array.isArray(a.evidence)&&a.evidence.length<=500&&
  unique(a.evidence.map(r=>`${r.criterionId}|${r.sourceRecordId}`)),'evidence_duplicates');
 for(const r of a.evidence){
  const finding=findings.get(r.criterionId);
  const criterion=a.criteria.find(c=>c.criterionId===r.criterionId);
  assert(!!finding&&!!criterion&&r.protocolId===criterion.protocolId&&
   r.conditionId===criterion.conditionId&&finding.originalRecordIds.includes(r.sourceRecordId)&&
   ['independent_instrumental','structured_professional_observation','official_programme_field',
    'manufacturer_specification','derivative_or_unresolved'].includes(r.role)&&
   ['supports','contradicts','inconclusive'].includes(r.finding)&&
   (r.originalEventGroupId===null||ident(r.originalEventGroupId))&&
   (r.lineageReviewId===null||ident(r.lineageReviewId))&&
   (r.methodReviewId===null||ident(r.methodReviewId))&&
   (r.scopeReviewId===null||ident(r.scopeReviewId)),'evidence_scope');
  // Only a reviewer with methodology + lineage + exact scope may propose a
  // distinct original group. Reusing it twice is counted once, never 2 experiments.
  if(independent(r.role))assert(!!r.originalEventGroupId&&!!r.lineageReviewId&&
   !!r.methodReviewId&&!!r.scopeReviewId&&
   ['reported_original_test_unadmitted','reported_registry_field_unadmitted',
    'professional_usage_observation_only'].includes(finding.knowledgeState),
    'independence_not_reviewed');
  else assert(r.originalEventGroupId===null,'unreviewed_claim_cannot_create_original_root');
 }
 assert(Array.isArray(a.passes)&&a.passes.length<=200&&
  unique(a.passes.map(x=>x.passId)),'pass_duplicates');
 for(const pass of a.passes){
  assert(ident(pass.passId)&&ident(pass.originId)&&lang(pass.language)&&market(pass.market)&&
   ['independent_testing','professional_registry','industry_directory','manufacturer_catalogue',
    'specialist_editorial','international_search'].includes(pass.channel)&&
   ['completed_no_new_evidence','completed_new_evidence','blocked_rights',
    'blocked_translation','pending'].includes(pass.status)&&
   (pass.reviewId===null||ident(pass.reviewId))&&list(pass.foundSourceIds)&&
   (pass.targetIds===undefined||list(pass.targetIds,100))&&
   (pass.targetIds??[]).every((tid:string)=>a.regionalTargets.some(t=>t.targetId===tid&&
    t.language===pass.language&&t.market===pass.market))&&
   (pass.status.startsWith('completed_')?!!pass.reviewId:pass.reviewId===null)&&
   (pass.status==='completed_no_new_evidence'?pass.foundSourceIds.length===0:true)&&
   (pass.status==='completed_new_evidence'?pass.foundSourceIds.length>0:true),
   'pass_invalid');
 }
 assert(Array.isArray(a.regionalTargets)&&a.regionalTargets.length<=100&&
  unique(a.regionalTargets.map(t=>t.targetId)),'target_duplicates');
 for(const t of a.regionalTargets){
  assert(ident(t.targetId)&&findings.has(t.criterionId)&&lang(t.language)&&market(t.market)&&
   ['specialist_market','exact_variant_market','cultural_protocol','independent_challenge',
    'novel_publisher'].includes(t.rationale)&&typeof t.required==='boolean'&&ident(t.reviewId),
    'target_invalid');
 }
 assert(Array.isArray(a.expertise)&&a.expertise.length<=150&&
  unique(a.expertise.map(x=>`${x.criterionId}|${x.evidenceRecordId}`)),'expertise_duplicates');
 for(const e of a.expertise){
  const finding=findings.get(e.criterionId);
  assert(!!finding&&finding.originalRecordIds.includes(e.evidenceRecordId)&&
   lang(e.language)&&market(e.testedMarket)&&
   ['documented_professional_practice','sensory_training','protocol_authorship',
    'domain_standard_experience','not_established'].includes(e.expertise)&&
   (e.competenceScopeReviewId===null||ident(e.competenceScopeReviewId))&&
   (e.basisReferenceId===null||ident(e.basisReferenceId))&&
   (e.expertise==='not_established'||!!e.competenceScopeReviewId&&!!e.basisReferenceId),
   'expertise_not_supported');
 }
 assert(!!a.operations&&['active','no_further_accessible_sources','budget_deferred'].includes(a.operations.status)&&
  (a.operations.reviewerId===null||ident(a.operations.reviewerId))&&
  (a.operations.reasonId===null||ident(a.operations.reasonId))&&
  (a.operations.status==='active'||!!a.operations.reviewerId&&!!a.operations.reasonId)&&
  (a.operations.status!=='no_further_accessible_sources'||a.passes.length>0&&
   a.passes.every(x=>x.status!=='pending')),'operations_not_reviewed');
 const coverage:CriterionCoverage197[]=a.criteria.map(c=>{
  const relevant=a.evidence.filter(e=>e.criterionId===c.criterionId);
  const independentRecords=relevant.filter(r=>independent(r.role));
  const roots=[...new Set(independentRecords.map(r=>r.originalEventGroupId!))].sort();
  const informativeRoots=[...new Set(independentRecords.filter(r=>r.finding!=='inconclusive')
   .map(r=>r.originalEventGroupId!))].sort();
  const inconclusiveCount=independentRecords.length-independentRecords.filter(r=>r.finding!=='inconclusive').length;
  const contradicted=independentRecords.some(x=>x.finding==='contradicts');
  const expertiseMissing=c.domain==='cultural_standard_conformance'&&
   independentRecords.some(x=>x.role==='structured_professional_observation'&&!a.expertise.some(e=>
    e.criterionId===c.criterionId&&e.evidenceRecordId===x.sourceRecordId&&
    e.expertise!=='not_established'&&e.competenceScopeReviewId&&e.basisReferenceId));
  const man=relevant.filter(r=>r.role==='manufacturer_specification').length;
  const weak=relevant.filter(r=>r.role==='derivative_or_unresolved').length;
  return {criterionId:c.criterionId,field:c.phase191Field,protocolId:c.protocolId,
   conditionId:c.conditionId,critical:c.critical,domain:c.domain,
   rootGroupsFromReviewedAnnotations:roots,independentEvidenceRecordCount:independentRecords.length,
   inconclusiveIndependentRecordCount:inconclusiveCount,manufacturerProvisionalCount:man,unresolvedOrDerivedCount:weak,
   domainExpertiseMissing:!!expertiseMissing,
   conflictingEvidence:contradicted||findings.get(c.criterionId)!.knowledgeState==='conflicting_measurements',
   originIdentityScientificallyVerified:false as const,
   evidenceForDecision:informativeRoots.length?'reviewed_unadmitted':man?'provisional_only':
    (weak||inconclusiveCount)?'unresolved':'absent'} as CriterionCoverage197;
 }).sort((x,y)=>x.criterionId.localeCompare(y.criterionId,'en'));
 const missing=coverage.filter(c=>c.critical&&c.evidenceForDecision!=='reviewed_unadmitted')
  .map(c=>c.criterionId);
 const contradictions=coverage.filter(c=>c.conflictingEvidence).map(c=>c.criterionId);
 const expertiseGaps=coverage.filter(c=>c.domainExpertiseMissing).map(c=>c.criterionId);
 // A country or language is never in itself an independent experiment. Each
 // requested regional search must be attempted on exactly that language/market.
 const unexplored=a.regionalTargets.filter(t=>t.required&&!a.passes.some(pass=>
  pass.language===t.language&&pass.market===t.market&&
  (pass.targetIds??[]).includes(t.targetId)&&pass.status.startsWith('completed_')))
  .map(t=>t.targetId).sort();
 const completePaths=a.passes.filter(x=>x.status.startsWith('completed_')).length;
 const extraHints=[...new Set([
  ...baseline79.nextActions.filter(x=>x!=='independent_decision_review'),
  ...missing.map(x=>`seek_scoped_evidence:${x}`),
  ...contradictions.map(x=>`resolve_conflicting_origins:${x}`),
  ...expertiseGaps.map(x=>`verify_domain_expertise:${x}`),
  ...unexplored.map(x=>`research_region_or_language:${x}`),
  ...a.passes.filter(x=>x.status==='blocked_translation').map(x=>`resolve_translation_access:${x.passId}`),
  ...a.passes.filter(x=>x.status==='blocked_rights').map(x=>`resolve_source_rights:${x.passId}`),
 ])].sort();
 const reviewed=coverage.some(c=>c.independentEvidenceRecordCount>0);
 const gaps=missing.length>0||contradictions.length>0||unexplored.length>0||expertiseGaps.length>0;
 const baseReady=baseline79.conclusion!=='continue_research';
 let state:SufficiencyState197='continue';const reasons:string[]=[];
 if(a.operations.status==='budget_deferred'){
  state='deferred_by_budget';reasons.push('resource_limit_not_scientific_sufficiency');
 }else if(a.operations.status==='no_further_accessible_sources'){
  if(!gaps&&baseReady&&reviewed)state='sufficient_bounded';
  else if(!gaps&&reviewed)state='provisional';
  else state='exhausted_insufficient';
  reasons.push('accessible_search_attempts_exhausted_not_market_exhaustion');
 }else if(baseReady&&!gaps&&reviewed){
  state='sufficient_bounded';reasons.push('bounded_phase79_search_and_reviewed_criterion_coverage');
 }else if(baseReady&&!gaps&&coverage.some(c=>c.evidenceForDecision==='provisional_only')){
  state='provisional';reasons.push('only_provisional_criterion_evidence');
 }else reasons.push('new_research_could_change_decision');
 if(missing.length)reasons.push('critical_criteria_unverified');
 if(contradictions.length)reasons.push('conflicting_evidence_unresolved');
 if(expertiseGaps.length)reasons.push('criterion_specific_expertise_not_reviewed');
 if(unexplored.length)reasons.push('required_international_exploration_unfinished');
 if(!reviewed)reasons.push('no_reviewed_original_source_claims');
 if(!baseReady)reasons.push('phase79_search_boundary_not_reached');
 return {schema:'197.1',state:'research_only',scopeHash:demandScopeHash(p.demand),
  productId:a.productId,variantId:a.variantId,search197:state,
  priorSearch79:baseline79.conclusion,criteriaCoverage:coverage,missingCriticalIds:missing.sort(),
  unresolvedContradictionIds:contradictions.sort(),unexploredRequiredTargetIds:unexplored,
  completedResearchPaths:completePaths,remainingResearchHints:extraHints,reasons:reasons.sort(),
  evidenceProvenanceAuthenticated:false,exactTestEventIdentityAuthenticated:false,
  stopIsNotNegativeQualityAssessment:true,rankingAuthorized:false,fullReviewTextStored:false,
  independenceOfRegionalReportsNotAssumed:true,languageOrPassportReputationScoreUsed:false};
}

/** Read-only bridge to existing Phase182 jobs + Phase196 discovery ordering.
 * No new unapproved job, no web access, no ranking, no geography-based trust.
 */
export function internationalResearchHints197(args:{plan:ResearchPlan182;matrix:SourceMatrix196;
 category:string;variantId:string;targets:readonly RegionalSearchTarget197[]}):{
 jobId:string;criterionId:string|null;sourceIds:string[];
 targetIds:string[];doesNotExecuteSearch:true;admittedEvidence:false;
}[]{
 const {plan, matrix}=args;
 assert(!!plan&&plan.phase===182&&plan.schema==='182.1'&&plan.planningOnly&&
  !plan.rankingAuthorized&&!!matrix&&matrix.schema==='196.1'&&matrix.state==='research_only'&&
  !matrix.publicRankingAllowed&&matrix.sourceBodiesStored===false,'research_bridge');
 assert(ident(args.category)&&ident(args.variantId)&&Array.isArray(args.targets)&&
  args.targets.every(t=>ident(t.targetId)&&ident(t.criterionId)&&lang(t.language)&&market(t.market)),
  'research_bridge_scope');
 return plan.jobs.filter(j=>j.kind==='exact_variant_source_research'&&j.exactVariantId===args.variantId&&
   j.categoryId===args.category).map(j=>{
  const targets=args.targets.filter(t=>j.criterionId===null||t.criterionId===j.criterionId);
  const selected=matrix.reviewQueue.map(q=>matrix.rows.find(r=>r.sourceId===q.sourceId)).filter(
   (r):r is NonNullable<typeof r>=>!!r&&r.category===args.category&&r.variantId===args.variantId&&
   (j.criterionId===null||r.field===j.criterionId)&&targets.some(t=>t.market===r.market));
  return {jobId:j.jobId,criterionId:j.criterionId,sourceIds:selected.map(x=>x.sourceId),
   targetIds:targets.map(x=>x.targetId).sort(),doesNotExecuteSearch:true as const,admittedEvidence:false as const};
 }).sort((a,b)=>a.jobId.localeCompare(b.jobId,'en'));
}
