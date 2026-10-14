export { rank } from './engine.js';
export type { Variant, Evidence, Request, Candidate, RankingResult } from './types.js';
// Historical price and purchase-timing experiments are deliberately NOT exported from the launch entrypoint.

// Legacy commercial data rights tooling is research-only, not part of the launch surface.
export * from './coverage_pilot.js';
export { resolvePurchaseLinks } from './purchase_links.js';
export type { ApprovedPurchaseLink, PurchaseLink, PurchaseLinksResult } from './purchase_links.js';

export { resolveLaunchPurchaseLinks } from './launch_purchase.js';
export type { PurchaseLinkApprovalRecord, LaunchPurchaseResult } from './launch_purchase.js';

// Launch orchestration: ranking precedes and is isolated from merchant resolution.
export { buildLaunchRecommendation } from './launch_pipeline.js';
export type { LaunchCandidate, LaunchRecommendation } from './launch_pipeline.js';
export * from './category_cognitive_mesh.js';

export * from './category_cold_start_intake.js';
export * from './category_research_execution.js';

// Explicit, review-only evidence intake. Source-derived hypotheses never write
// canonical evidence or influence launch ranking without a separate review gate.
export {analyzeEnglishProductDocument154} from './phase154_integrated_review.js';
export {buildContextGraph154,PRODUCT_REVIEW_CONTEXT_RULES154} from './phase154_context_graph.js';
export {analyzeLabelMatrix154} from './phase154_label_diagnostics.js';

// Opt-in review-aware orchestration: title, model shapes, context and vote
// diagnostics cooperate, without automatic scientific DB/ranking access.
export {analyzeEnglishReview155} from './phase155_review_orchestrator.js';

// Phase164: review-only, category-scoped user-request research. NO public ranking.
export {newRequestSession164,advanceUserRequest164,registerUserCandidates164,
 resolveBudgetRevision164} from './phase164_user_request_journey.js';
export type {RequestSession164,RequestOutput164,RequestAction164}
 from './phase164_user_request_journey.js';

export {auditRequestContext165} from './phase165_request_context_audit.js';

// Phase166: bounded English quantitative requests and evidence-research screening.
export {auditQuantifiedRequest166,screenQuestionEvidence166,advanceAndPlanRequest166}
 from './phase166_quantified_evidence_bridge.js';
export type {QuantityCandidate166,QuantifiedAudit166,EvidenceObservation166,EvidenceBridge166,ProductEvidenceScreen166}
 from './phase166_quantified_evidence_bridge.js';

// Phase167: original-source numerical candidates remain quarantined until
// variant, original-test methods, evidence and user constraints are reviewed.
export {previewOriginalReviewMeasures167} from './phase167_source_variant_quantity_adapter.js';
export type {DeclaredSourceIdentity167,Preview167,CandidateMeasure167,ResearchMatch167}
 from './phase167_source_variant_quantity_adapter.js';

// Phase168: qualitative user intent -> contextual original-review research ONLY.
// Neither documentary user confirmations nor Phase96 review receipts authorize ranking.
export {planQualitativeNeedResearch168} from './phase168_qualitative_need_research_bridge.js';
export type {QualitativePlan168,FacetMapping168,UserConfirmation168,QualitativeRequirement168}
 from './phase168_qualitative_need_research_bridge.js';

// Phase169: signed, version-bound research receipts + guarded qualitative/quantity join.
// Signature validation is NOT independent human/source authentication or ranking clearance.
export {planSignedSuitabilityResearch169,signingBytes169} from './phase169_signed_suitability_research.js';
export type {SignedReceipt169,TrustKey169,SuitabilityResearch169,RequirementState169}
 from './phase169_signed_suitability_research.js';

// Phase196: research-only source intelligence. No evidence/ranking authority.
export {loadPublisherSeed196,validatePublisherSeed196,planSourceReviews196,
 linkSourceQueueToResearch182} from './phase196_source_intelligence.js';
export type {PublisherSeed196,Profile196,CandidateAnnotation196,SourceMatrix196,
 ScopedMatrixRow196,SourceQueue196,PriorityLane196,MaterialRole196}
 from './phase196_source_intelligence.js';
export {evaluateSourceQueue196} from './phase196_evaluation.js';
export type {SourceLabel196,QueueEvaluation196,LabelProvenance196}
 from './phase196_evaluation.js';
