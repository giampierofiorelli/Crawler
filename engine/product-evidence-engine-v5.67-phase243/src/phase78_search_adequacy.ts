/** Phase 78 — Answer adequacy is independent of the number of stored products.
 * This module audits a demand-specific *search*, not market completeness.
 * Entries supplied here must have been checked by a trusted evidence service;
 * a TypeScript flag or an LLM assertion is NOT independent verification.
 */
import {demandScopeHash,evaluatePortfolio,type PortfolioAudit} from './phase77_decision_research.js';
const ident=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,119}$/.test(s);
const ids=(a:unknown,max=100):a is string[]=>Array.isArray(a)&&a.length<=max&&a.every(ident)&&new Set(a).size===a.length;
export type DiscoveryChannel='independent_testing'|'manufacturer_catalogue'|'retailer_catalogue'|
 'industry_directory'|'independent_comparison'|'professional_registry';
const channels:DiscoveryChannel[]=['independent_testing','manufacturer_catalogue','retailer_catalogue',
 'industry_directory','independent_comparison','professional_registry'];
export interface SearchMethodReceipt {
 channel:DiscoveryChannel;receiptId:string;/** Assigned externally, identifies independent source/operator lineage. */
 originId:string;
}
export interface ReviewedSearchAudit {
 /** Must bind precisely to all confirmed outcomes, constraints and region. */
 demandScopeHash:string;
 methods:readonly SearchMethodReceipt[];
 /** Verified backend review identifying a reproducible demand-specific search boundary. */
 boundaryApprovalId:string|null;
 /** Alternatives not yet resolved can still change the selection. */
 unresolvedAlternativeIds:readonly string[];
 /** A product may have been excluded, but every exclusion needs actual evidence. */
 examinedExclusions:readonly {productId:string;reasonId:string;
  exclusionClass:'fails_required_condition'|'violates_exclusion'|'not_suitable_for_outcome'|'unavailable_in_region'|'insufficient_evidence';
  evidenceReferenceIds:readonly string[]}[];
 /** True only when no current discovery activity is outstanding. */
 discoveryInProgress:boolean;
}
export interface OptionPublicationApproval {
 /** Editorial approvals for listing specific products, separate from comparison/ranking. */
 demandScopeHash:string;reviewId:string;approvedProductIds:readonly string[];
 /** This never authorizes ordered recommendation rankings. */
 kind:'individual_option_cards';
}
export type SearchAdequacy='coverage_not_established'|'bounded_for_this_demand';
export type VerifiedSelection='none'|'one'|'multiple';
export interface ResearchAdequacy {
 searchAdequacy:SearchAdequacy;
 verifiedSelection:VerifiedSelection;
 /** How many verified variants satisfy all explicit requirements and exclusions. */
 verifiedOptionCount:number;
 catalogCandidateCount:number;
 independentlyDocumentedExclusions:number;
 reasons:string[];
 /** Only editorially approved, demand-matched cards; these are never a ranking. */
 publishableUnrankedProductIds:string[];
 rankedRecommendationsAuthorized:false;
 /** Never assert that the entire market has been exhausted. */
 exhaustiveMarketClaimAuthorized:false;
}
function validateAudit(a:ReviewedSearchAudit):void {
 if(!a||typeof a!=='object'||!/^[a-f0-9]{64}$/.test(a.demandScopeHash)||
 !Array.isArray(a.methods)||a.methods.length>50||a.methods.some(m=>
  !channels.includes(m.channel)||!ident(m.receiptId)||!ident(m.originId))||
 !(a.boundaryApprovalId===null||ident(a.boundaryApprovalId))||
 !ids(a.unresolvedAlternativeIds)||!Array.isArray(a.examinedExclusions)||
 a.examinedExclusions.length>500||a.examinedExclusions.some(x=>
 !ident(x.productId)||!ident(x.reasonId)||
 !['fails_required_condition','violates_exclusion','not_suitable_for_outcome','unavailable_in_region','insufficient_evidence'].includes(x.exclusionClass)||
 !ids(x.evidenceReferenceIds)||x.evidenceReferenceIds.length===0)||
 new Set(a.examinedExclusions.map(x=>x.productId)).size!==a.examinedExclusions.length||
 typeof a.discoveryInProgress!=='boolean')throw Error('Invalid search audit');
}
/** Candidate identities and classification may only be displayed after independent review.
 * No number of candidates acts as a fixed "top N" threshold. */
export function assessResearchAdequacy(
 portfolio:PortfolioAudit,audit:ReviewedSearchAudit,approval:OptionPublicationApproval|null=null
):ResearchAdequacy {
 const expected=demandScopeHash(portfolio.demand);
 validateAudit(audit);
 if(audit.demandScopeHash!==expected)throw Error('Demand and search audit scope mismatch');
 const portfolioResult=evaluatePortfolio(portfolio);
 const verified=portfolioResult.candidateIds;
 const excludedByEvidence=new Map(audit.examinedExclusions.map(x=>[x.productId,x]));
 if(approval!==null){
  if(approval.demandScopeHash!==expected||!ident(approval.reviewId)||
   approval.kind!=='individual_option_cards'||!ids(approval.approvedProductIds,500)||
   approval.approvedProductIds.some(id=>!verified.includes(id)))
   throw Error('Invalid editorial option-card approval');
 }
 const reasons:string[]=[];
 if(!portfolio.sourceLandscapeReviewed)reasons.push('source_landscape_not_reviewed');
 if(!portfolio.discoveryReproducible)reasons.push('discovery_not_reproducible');
 if(!portfolio.searchBoundaryReviewed)reasons.push('search_boundary_not_reviewed');
 if(portfolio.families.length===0||portfolio.families.some(f=>f.disposition==='not_checked'))
  reasons.push('solution_families_unresolved');
 if(portfolio.candidates.some(c=>!c.rightsCleared))reasons.push('candidate_source_rights_unresolved');
 if(audit.boundaryApprovalId===null)reasons.push('missing_independent_boundary_approval');
 // Multiple discovery paths from independent origins, not repeated mirrors of one catalogue.
 if(new Set(audit.methods.map(m=>m.channel)).size<2||
    new Set(audit.methods.map(m=>m.originId)).size<2||
    new Set(audit.methods.map(m=>m.receiptId)).size!==audit.methods.length)
  reasons.push('independent_discovery_paths_not_documented');
 if(audit.unresolvedAlternativeIds.length>0)reasons.push('unresolved_market_alternatives');
 // A poorly populated database MUST NOT be mistaken for a genuinely narrow market.
 // Every encountered but not yet verified candidate needs a documented,
 // use-specific disqualification. Absence of a test is not a disqualification.
 if(portfolio.candidates.some(c=>!verified.includes(c.productId)&&
   (!excludedByEvidence.has(c.productId)||
    excludedByEvidence.get(c.productId)?.exclusionClass==='insufficient_evidence')))
  reasons.push('known_candidates_not_yet_resolved');
 if(audit.discoveryInProgress)reasons.push('discovery_still_underway');
 const bounded=reasons.length===0;
 // Counting available options is NOT equivalent to proving market completeness.
 return {searchAdequacy:bounded?'bounded_for_this_demand':'coverage_not_established',
  verifiedSelection:verified.length===0?'none':verified.length===1?'one':'multiple',
  verifiedOptionCount:verified.length,catalogCandidateCount:portfolio.candidates.length,
  independentlyDocumentedExclusions:audit.examinedExclusions.filter(x=>x.exclusionClass!=='insufficient_evidence').length,reasons,
  publishableUnrankedProductIds:approval?[...approval.approvedProductIds].sort():[],
  rankedRecommendationsAuthorized:false,exhaustiveMarketClaimAuthorized:false};
}
