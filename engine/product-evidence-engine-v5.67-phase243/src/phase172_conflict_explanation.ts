/** Phase172: bounded research-only explanation of the REAL Phase171 trace shape.
 * This presenter MUST be called after the server-side Phase171 verifier; it
 * cannot independently authenticate an arbitrary object or a product ranking.
 */
import type {ConflictWorkbench171,RequirementConflict171,SourceDisposition171} from './phase171_source_conflict_workbench.js';

const warnings:Partial<Record<SourceDisposition171,string>>={
 user_scope_unresolved:'The original requirement is not clear enough for a product verdict.',
 user_confirmation_pending:'The proposed requirement has not been confirmed by the person choosing.',
 original_evidence_missing:'Original testing is missing for an essential comparison.',
 documentary_review_missing:'The original test and its conditions still require review.',
 method_lineage_missing:'The original test method or its conditions have not been established.',
 republication_across_declared_families:'Republished evidence cannot be treated as independent confirmation.',
 conflict_within_editorial_family:'Measurements from the same declared source family disagree.',
 different_methods_not_directly_comparable:'Tests using different methods or conditions cannot be directly compared.',
 conflict_under_declared_same_method:'Provisional tests with the same declared method disagree; this needs adjudication.',
 single_editorial_family_only:'There is only one declared editorial family, not independent confirmation.',
 apparent_cross_family_agreement_unverified:'Apparent agreement does not prove that the sources are independent.',
 qualitative_evidence_or_context_conflict:'The original qualitative evidence has an unresolved context conflict.',
 qualitative_adverse_signal:'A possible decisive drawback requires investigation before choosing.',
 qualitative_research_pending:'The claimed benefit still needs a context-matched original test.'
};
export interface ResearchConflictExplanation172{
 phase:172;sourcePhase:171;requestSha256:string;
 mode:'research_trace_not_product_verdict';
 brief:readonly string[];mustSeeNow:readonly string[];
 expandable:readonly {requirementId:string;variantId:string|null;state:SourceDisposition171;
  sourceDocuments:readonly string[];receiptIds:readonly string[];researchTasks:readonly string[]}[];
 verifiedWinnerClaimed:false;rankingAuthorized:false;excludedProductClaimed:false;
}
export function explainResearchConflicts172(trace:ConflictWorkbench171):ResearchConflictExplanation172{
 if(!trace||trace.phase!==171||!(/^[0-9a-f]{64}$/.test(trace.questionSha256))||
  trace.candidateOnly!==true||trace.evaluatedWithRealIndependentReview!==false||
  trace.rankingAuthorized!==false||trace.exclusionsAuthorized!==false||
  trace.publicationAuthorized!==false||trace.sourceIndependenceVerified!==false||
  !Array.isArray(trace.items)||trace.items.length>500||trace.items.some(x=>
   !x||x.eligibleForRanking!==false||x.eligibleForExclusion!==false||
   !Array.isArray(x.candidateTraces)||!Array.isArray(x.originalDocumentHashes)||
   !Array.isArray(x.researchTasks)))throw Error('phase172_requires_research_only_phase171_trace');
 const ordered:RequirementConflict171[]=[...trace.items].sort((a,b)=>a.requirementId.localeCompare(b.requirementId)||
  (a.variantId??'').localeCompare(b.variantId??'')||a.disposition.localeCompare(b.disposition));
 const cautions=[...new Set(ordered.map(x=>warnings[x.disposition]).filter((x):x is string=>!!x))].sort();
 return {phase:172,sourcePhase:171,requestSha256:trace.questionSha256,
  mode:'research_trace_not_product_verdict',
  brief:['The original-source comparison is still research, not a verified product recommendation.'],
  mustSeeNow:['The candidate measurements cannot authorize a winner or an exclusion.',...cautions],
  expandable:ordered.map(x=>({requirementId:x.requirementId,variantId:x.variantId,
   state:x.disposition,sourceDocuments:[...x.originalDocumentHashes].sort(),
   receiptIds:[...new Set(x.candidateTraces.map(c=>c.signedDocumentaryReceiptId))].sort(),
   researchTasks:[...new Set(x.researchTasks)].sort()})),
  verifiedWinnerClaimed:false,rankingAuthorized:false,excludedProductClaimed:false};
}
