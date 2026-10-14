/** Phase 79: demand-specific search continuation/stop advice.
 * RESEARCH PILOT, NOT proof of market completeness, external reviewer identity or scoring.
 * Receipt records must be validated by an independent trusted backend before entry.
 * Product cardinality plays NO role in the stopping decision.
 */
import {demandScopeHash,evaluatePortfolio,type PortfolioAudit} from './phase77_decision_research.js';
import {assessResearchAdequacy,type ReviewedSearchAudit} from './phase78_search_adequacy.js';
const id=(x:unknown):x is string=>typeof x==='string'&&/^[a-z][a-z0-9_]{0,119}$/.test(x);
const identifiers=(x:unknown,max=1000):x is string[]=>Array.isArray(x)&&x.length<=max&&x.every(id)&&new Set(x).size===x.length;

export interface CandidateFilterReceipt {
 productId:string;
 /** A failed hard requirement is not a missing measurement. */
 verdict:'verified_fit'|'verified_hard_filter_failure'|'unresolved';
 /** Only outcomes/must-have/exclusions confirmed by this user are valid. */
 failingHardConstraintIds:readonly string[];
 evidenceIds:readonly string[];
 reviewId:string|null;
}
export interface DiscoveryChallenge {
 id:string;originId:string;
 /** Must be a distinct discovery technique, not simply another mirror of an index. */
 channel:'independent_testing'|'manufacturer_catalogue'|'retailer_catalogue'|'industry_directory'|
 'independent_comparison'|'professional_registry';
 /** Reviewed, reproducible pass deliberately looking for things previous passes missed. */
 reviewId:string|null; evidenceIds:readonly string[];
 result:'no_new_plausible_candidates'|'plausible_candidates_found'|'inconclusive';
 plausibleCandidateIds:readonly string[];
}
export interface SearchContinuationAudit {
 demandScopeHash:string;
 candidateFilters:readonly CandidateFilterReceipt[];
 /** Unseen or recently emerged candidates plausibly relevant to this exact need. */
 openChallengerIds:readonly string[];
 challenge:DiscoveryChallenge|null;
 /** Current evidence or product availability may have become stale. */
 staleEvidenceIds:readonly string[];
 /** Selection could change with unresolved method, test or risk information. */
 importantEvidenceGapIds:readonly string[];
 /** A second, use-specific review of whether remaining evidence could change the shortlist. */
 decisionStability:{reviewId:string|null; assessment:'unlikely_to_change'|'could_change'|'not_assessed'};
 /** Confirms that user-defined hard constraints were interpreted as the user intended. */
 constraintInterpretationReviewId:string|null;
}
export type NextResearchAction=
 'confirm_constraint_meaning'|'expand_solution_discovery'|'review_unresolved_products'|
 'verify_hard_filter_exclusions'|'independent_challenge_search'|'assess_decision_stability'|
 'collect_decision_changing_evidence'|'refresh_stale_evidence'|'independent_decision_review';
export type DemandSearchConclusion=
 'continue_research'|'bounded_single_option'|'bounded_multiple_options'|'bounded_no_verified_option';
export interface SearchContinuationDecision {
 scopeHash:string;conclusion:DemandSearchConclusion;
 /** Product numbers are descriptive only; a 1/3/100 count never closes the search. */
 discoveredCandidateCount:number; verifiedFitCount:number;
 reviewedHardFilterExclusionCount:number;unresolvedCandidateCount:number;
 /** Overlapping exclusion counts: a product may fail more than one hard constraint. */
 exclusionsByHardConstraint:Record<string,number>;
 /** Genuine narrowing requires grounded hard-filter exclusions AND audited discovery. */
 narrowingEvidence:'verified_under_scope'|'not_established';
 furtherResearchNeeded:boolean;
 nextActions:NextResearchAction[];
 reasons:string[];
 /** Any public ranking remains governed by existing independent publication gates. */
 rankingAuthorized:false; marketExhaustionClaimAuthorized:false;
}
function assertContinuationAudit(portfolio:PortfolioAudit,a:SearchContinuationAudit):void {
 const scope=demandScopeHash(portfolio.demand);
 const permitted=new Set([...portfolio.demand.outcomeIds,...portfolio.demand.mustHaveIds,
   ...portfolio.demand.exclusionIds]);
 const products=new Set(portfolio.candidates.map(c=>c.productId));
 if(!a||a.demandScopeHash!==scope||!Array.isArray(a.candidateFilters)||
    a.candidateFilters.length!==products.size||
    new Set(a.candidateFilters.map(f=>f.productId)).size!==products.size||
    a.candidateFilters.some(f=>!products.has(f.productId)||
      !['verified_fit','verified_hard_filter_failure','unresolved'].includes(f.verdict)||
      !identifiers(f.failingHardConstraintIds,50)||!f.failingHardConstraintIds.every((x:string)=>permitted.has(x))||
      !identifiers(f.evidenceIds,100)||!(f.reviewId===null||id(f.reviewId))||
      (f.verdict==='verified_hard_filter_failure'&&
       (f.failingHardConstraintIds.length===0||f.evidenceIds.length===0||!f.reviewId))||
      (f.verdict==='verified_fit'&&(!f.reviewId||f.evidenceIds.length===0||f.failingHardConstraintIds.length!==0))||
      (f.verdict==='unresolved'&&(f.failingHardConstraintIds.length>0||f.reviewId!==null)))||
    !identifiers(a.openChallengerIds)||!identifiers(a.staleEvidenceIds)||
    !identifiers(a.importantEvidenceGapIds)||
    !a.decisionStability||!['unlikely_to_change','could_change','not_assessed'].includes(a.decisionStability.assessment)||
    !(a.decisionStability.reviewId===null||id(a.decisionStability.reviewId))||
    (a.decisionStability.assessment==='unlikely_to_change'&&!a.decisionStability.reviewId)||
    !(a.constraintInterpretationReviewId===null||id(a.constraintInterpretationReviewId)))
  throw Error('Invalid search continuation audit');
 if(a.challenge!==null){
  const ch=a.challenge;
  if(!id(ch.id)||!id(ch.originId)||!id(ch.channel)||
    !['independent_testing','manufacturer_catalogue','retailer_catalogue','industry_directory',
      'independent_comparison','professional_registry'].includes(ch.channel)||
    !(ch.reviewId===null||id(ch.reviewId))||!identifiers(ch.evidenceIds)||
    !identifiers(ch.plausibleCandidateIds)||
    !['no_new_plausible_candidates','plausible_candidates_found','inconclusive'].includes(ch.result)||
    (ch.result==='no_new_plausible_candidates'&&ch.plausibleCandidateIds.length>0)||
    (ch.result==='plausible_candidates_found'&&ch.plausibleCandidateIds.length===0)||
    (ch.result!=='inconclusive'&&(!ch.reviewId||ch.evidenceIds.length===0)))
   throw Error('Invalid independent challenge');
 }
 // Never claim a previously ineligible variant is verified fit merely by assigning a label.
 const eligibility=new Set(evaluatePortfolio(portfolio).candidateIds);
 if(a.candidateFilters.some(f=>f.verdict==='verified_fit'&&!eligibility.has(f.productId)||
  f.verdict==='verified_hard_filter_failure'&&eligibility.has(f.productId)))
  throw Error('Filter decision contradicts independently checked product eligibility');
}

/** Advice only: caller MUST authenticate real reviewer receipts and source lineage. */
export function decideWhetherToResearchMore(
 portfolio:PortfolioAudit,baseline:ReviewedSearchAudit,a:SearchContinuationAudit
):SearchContinuationDecision {
 assertContinuationAudit(portfolio,a);
 const coverage=assessResearchAdequacy(portfolio,baseline);
 const origins=new Set(baseline.methods.map(x=>x.originId));
 const challengeValid=!!a.challenge&&a.challenge.reviewId!==null&&
  a.challenge.evidenceIds.length>0&&!origins.has(a.challenge.originId)&&
  a.challenge.result==='no_new_plausible_candidates';
 const exclusionsByHardConstraint:Record<string,number>={};
 for(const key of [...portfolio.demand.outcomeIds,...portfolio.demand.mustHaveIds,...portfolio.demand.exclusionIds])
  exclusionsByHardConstraint[key]=0;
 for(const entry of a.candidateFilters.filter(f=>f.verdict==='verified_hard_filter_failure'))
  for(const key of entry.failingHardConstraintIds)exclusionsByHardConstraint[key]+=1;
 const verifiedFit=a.candidateFilters.filter(f=>f.verdict==='verified_fit');
 const hardExcluded=a.candidateFilters.filter(f=>f.verdict==='verified_hard_filter_failure');
 const unresolved=a.candidateFilters.filter(f=>f.verdict==='unresolved');
 const actions:NextResearchAction[]=[];const reasons:string[]=[];
 const requireAction=(action:NextResearchAction,reason:string)=>{if(!actions.includes(action))actions.push(action);reasons.push(reason);};
 if(!a.constraintInterpretationReviewId)
  requireAction('confirm_constraint_meaning','constraint_meaning_not_reviewed');
 if(coverage.searchAdequacy!=='bounded_for_this_demand')
  requireAction('expand_solution_discovery','demand_specific_discovery_boundary_not_established');
 if(unresolved.length>0)
  requireAction('review_unresolved_products','discovered_products_have_unresolved_filters_or_evidence');
 if(!challengeValid)
  requireAction('independent_challenge_search','independent_nonoverlapping_challenge_not_cleared');
 if(a.openChallengerIds.length>0||a.challenge?.result==='plausible_candidates_found')
  requireAction('expand_solution_discovery','plausible_challengers_need_assessment');
 if(a.importantEvidenceGapIds.length>0||a.decisionStability.assessment==='could_change')
  requireAction('collect_decision_changing_evidence','additional_evidence_could_change_decision');
 if(a.staleEvidenceIds.length>0)
  requireAction('refresh_stale_evidence','decision_relevant_evidence_needs_refresh');
 if(a.decisionStability.assessment==='not_assessed'||!a.decisionStability.reviewId)
  requireAction('assess_decision_stability','decision_stability_not_independently_reviewed');
 const done=actions.length===0;
 if(done)actions.push('independent_decision_review');
 const conclusion:DemandSearchConclusion=done?verifiedFit.length===0?'bounded_no_verified_option':
  verifiedFit.length===1?'bounded_single_option':'bounded_multiple_options':'continue_research';
 return {scopeHash:a.demandScopeHash,conclusion,
  discoveredCandidateCount:portfolio.candidates.length,verifiedFitCount:verifiedFit.length,
  reviewedHardFilterExclusionCount:hardExcluded.length,unresolvedCandidateCount:unresolved.length,
  exclusionsByHardConstraint,
  narrowingEvidence:done&&hardExcluded.length>0?'verified_under_scope':'not_established',
  furtherResearchNeeded:!done,nextActions:actions,reasons,rankingAuthorized:false,
  marketExhaustionClaimAuthorized:false};
}

export function explainSearchState(d:SearchContinuationDecision):string {
 if(d.conclusion==='bounded_single_option')
  return 'Dopo aver verificato le alternative e i vincoli specifici, abbiamo individuato una soluzione supportata dalle evidenze. Non significa che sia l’unica sul mercato. La proposta richiede ancora la revisione finale.';
 if(d.conclusion==='bounded_no_verified_option')
  return 'La ricerca documentata non ha individuato una soluzione verificata con tutti i requisiti. Possiamo esaminare alternative soltanto con il tuo consenso a rivedere i vincoli.';
 if(d.conclusion==='bounded_multiple_options')
  return 'La ricerca di alternative pertinenti è sufficientemente documentata per passare alla revisione comparativa. Il numero di opzioni non determina da solo quali consigliare.';
 if(d.nextActions.includes('review_unresolved_products'))
  return 'Stiamo verificando quali soluzioni soddisfano davvero i tuoi filtri. Il numero di prodotti rimasti non indica ancora se abbiamo cercato abbastanza.';
 return 'Stiamo lavorando per te: approfondiamo le alternative che potrebbero cambiare la risposta alla tua richiesta, prima di consigliarti cosa scegliere.';
}
