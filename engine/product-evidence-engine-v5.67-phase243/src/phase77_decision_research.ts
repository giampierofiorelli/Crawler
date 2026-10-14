/** Phase 77: functional demand is not automatically a product category.
 * Deterministic evaluation of structured, externally reviewed input only.
 * No natural-language understanding, crawling, inference or ranking here.
 */
import {createHash} from 'node:crypto';
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,79}$/.test(s);
const uniq=(a:readonly string[])=>new Set(a).size===a.length;
const ids=(a:unknown,max=50):a is string[]=>Array.isArray(a)&&a.length<=max&&a.every(id)&&uniq(a);
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
export type DemandMode='functional_discovery'|'specific_product'|'category_comparison';
export interface StructuredDemand {
  mode:DemandMode; outcomeIds:readonly string[]; mustHaveIds:readonly string[];
  exclusionIds:readonly string[]; regionId:string; productId:string|null;
  /** Externally controlled taxonomy. NOT inferred unreviewed free text. */
  confirmedBy:'user'|'independently_reviewed';
}
export interface SolutionFamily {
 familyId:string;categoryId:string|null;
 relation:'reviewed_applicable'|'hypothesized_applicable'|'reviewed_not_applicable';
 evidenceReferenceIds:readonly string[];
}
export interface DemandRoute {
 kind:'specific_product'|'known_solution_space'|'cross_category_solution_space'|'unknown_solution_space';
 scopeHash:string; reviewedFamilyIds:string[]; hypothesisFamilyIds:string[];
 requiresSolutionResearch:boolean; createsCategoryAutomatically:false;
 steps:readonly ResearchStep[];
}
export type ResearchStep='goal_review'|'solution_family_mapping'|'source_permissions'|
 'candidate_discovery'|'method_and_safety_review'|'candidate_evidence'|'comparative_quality_review';
export const STEPS:readonly ResearchStep[]=['goal_review','solution_family_mapping','source_permissions',
 'candidate_discovery','method_and_safety_review','candidate_evidence','comparative_quality_review'];
export function validateDemand(d:StructuredDemand):void {
 if(!d||!['functional_discovery','specific_product','category_comparison'].includes(d.mode)||
 !ids(d.outcomeIds,15)||d.outcomeIds.length===0||!ids(d.mustHaveIds,30)||!ids(d.exclusionIds,30)||
 !id(d.regionId)||!(d.productId===null||id(d.productId))||
 (d.mode==='specific_product')!==(d.productId!==null)||
 !['user','independently_reviewed'].includes(d.confirmedBy)||
 d.mustHaveIds.some(i=>d.exclusionIds.includes(i)))throw Error('Invalid structured demand');
}
/** Identity includes ALL required outcomes and constraints, not just category. */
export function demandScopeHash(d:StructuredDemand):string {
 validateDemand(d);
 return sha(JSON.stringify([d.mode,[...d.outcomeIds].sort(),[...d.mustHaveIds].sort(),
  [...d.exclusionIds].sort(),d.regionId,d.productId]));
}
export function planDemand(d:StructuredDemand,families:readonly SolutionFamily[]):DemandRoute {
 const scopeHash=demandScopeHash(d);
 if(!Array.isArray(families)||families.length>80||new Set(families.map(f=>f.familyId)).size!==families.length||
 families.some(f=>!id(f.familyId)||!(f.categoryId===null||id(f.categoryId))||
  !['reviewed_applicable','hypothesized_applicable','reviewed_not_applicable'].includes(f.relation)||
  !ids(f.evidenceReferenceIds)||
  (f.relation==='reviewed_applicable'||f.relation==='reviewed_not_applicable')&&
  (f.categoryId===null||f.evidenceReferenceIds.length===0)))throw Error('Invalid solution family evidence');
 const reviewed=families.filter(f=>f.relation==='reviewed_applicable');
 const hypotheses=families.filter(f=>f.relation==='hypothesized_applicable');
 const categories=new Set(reviewed.map(f=>f.categoryId));
 const kind:DemandRoute['kind']=d.mode==='specific_product'?'specific_product':
 reviewed.length===0?'unknown_solution_space':categories.size>1?'cross_category_solution_space':'known_solution_space';
 return {kind,scopeHash,reviewedFamilyIds:reviewed.map(f=>f.familyId).sort(),
  hypothesisFamilyIds:hypotheses.map(f=>f.familyId).sort(),
  requiresSolutionResearch:reviewed.length===0||hypotheses.length>0,
  createsCategoryAutomatically:false,steps:STEPS};
}
export interface PortfolioCandidate {
 productId:string;familyId:string; reviewedApplicableTo:readonly string[];
 /** Explicitly checked exclusions that this variant avoids. Unknown is not a pass. */
 reviewedAvoids:readonly string[];
 independentlyTestedOriginalIds:readonly string[];
 rightsCleared:boolean;safetyReviewed:boolean;methodReviewed:boolean;
 productVariantReviewed:boolean; 
}
export interface FamilyAudit {familyId:string; disposition:'evaluated'|'excluded_with_evidence'|'not_checked';
 evidenceReferenceIds:readonly string[];}
export interface PortfolioAudit {
 demand:StructuredDemand; families:readonly FamilyAudit[]; candidates:readonly PortfolioCandidate[];
 sourceLandscapeReviewed:boolean; discoveryReproducible:boolean;
 /** Evidence-based assessment that further search is unlikely to alter candidate scope.
  * This does NOT mean every product on the market was seen. */
 searchBoundaryReviewed:boolean;
}
export interface PortfolioCoverage {
 status:'research_incomplete'|'eligible_for_comparative_review';
 candidateIds:string[];reasons:string[];independentOriginalTestCount:number;
 fixedTopNRequired:false;rankingEligible:false;
}
export function evaluatePortfolio(a:PortfolioAudit):PortfolioCoverage {
 validateDemand(a.demand);
 if(!Array.isArray(a.families)||a.families.length>80||!Array.isArray(a.candidates)||
 a.candidates.length>500||!uniq(a.families.map(f=>f.familyId))||
 !uniq(a.candidates.map(c=>c.productId))||a.families.some(f=>!id(f.familyId)||
 !['evaluated','excluded_with_evidence','not_checked'].includes(f.disposition)||
 !ids(f.evidenceReferenceIds)||f.disposition==='excluded_with_evidence'&&f.evidenceReferenceIds.length===0)||
 a.candidates.some(c=>!id(c.productId)||!id(c.familyId)||!ids(c.reviewedApplicableTo)||!ids(c.reviewedAvoids)||
 !ids(c.independentlyTestedOriginalIds)||!a.families.some(f=>f.familyId===c.familyId)))
 throw Error('Invalid portfolio audit');
 const reasons:string[]=[];
 if(!a.sourceLandscapeReviewed)reasons.push('source_landscape_not_reviewed');
 if(!a.discoveryReproducible)reasons.push('candidate_discovery_not_reproducible');
 if(!a.searchBoundaryReviewed)reasons.push('search_boundary_not_reviewed');
 if(a.families.length===0||a.families.some(f=>f.disposition==='not_checked'))
  reasons.push('unexamined_solution_family');
 const eligible=a.candidates.filter(c=>c.rightsCleared&&c.safetyReviewed&&
  c.methodReviewed&&c.productVariantReviewed&&c.independentlyTestedOriginalIds.length>0&&
  [...a.demand.outcomeIds,...a.demand.mustHaveIds].every(m=>c.reviewedApplicableTo.includes(m))&&
  a.demand.exclusionIds.every(m=>c.reviewedAvoids.includes(m)));
 const allOriginals=new Set(eligible.flatMap(c=>c.independentlyTestedOriginalIds));
 // A comparison requires alternatives. This is a minimum comparison floor,
 // NOT a fixed N, market completeness assertion, winner or 'best' claim.
 if(eligible.length<2)reasons.push('fewer_than_two_comparable_eligible_products');
 if(allOriginals.size<2)reasons.push('insufficient_distinct_original_tests');
 if(a.candidates.some(c=>!c.rightsCleared))reasons.push('some_sources_not_cleared');
 return {status:reasons.length?'research_incomplete':'eligible_for_comparative_review',
  candidateIds:eligible.map(c=>c.productId).sort(),reasons,
  independentOriginalTestCount:allOriginals.size,
  fixedTopNRequired:false,rankingEligible:false};
}
export interface EntrantSignal {
 productId:string;familyId:string;signalId:string;
 signalType:'manufacturer_announcement'|'independent_original_test'|'user_interest'|'variant_update';
 sourceRightsCleared:boolean;originalTestId:string|null;
 relevanceToConfirmedOutcomes:readonly string[];
 alreadyKnownOriginalTests:readonly string[];isAlreadyTrackedProduct:boolean;
}
export interface EntrantTriage {
 action:'blocked_source'|'duplicate_evidence'|'metadata_watch'|'targeted_evidence_collection';
 requiresCompleteCategoryRebuild:false;rankingChangePermitted:false;reason:string;
}
/** Demand-relevant, original independent evidence causes targeted work, not automatic promotion. */
export function triageNewEntrant(s:EntrantSignal,d:StructuredDemand):EntrantTriage {
 validateDemand(d);
 if(!id(s.productId)||!id(s.familyId)||!id(s.signalId)||
 !['manufacturer_announcement','independent_original_test','user_interest','variant_update'].includes(s.signalType)||
 !(s.originalTestId===null||id(s.originalTestId))||!ids(s.relevanceToConfirmedOutcomes)||
 !ids(s.alreadyKnownOriginalTests))throw Error('Invalid entrant signal');
 const result=(action:EntrantTriage['action'],reason:string):EntrantTriage=>({action,reason,
  requiresCompleteCategoryRebuild:false,rankingChangePermitted:false});
 if(!s.sourceRightsCleared)return result('blocked_source','source_rights_not_cleared');
 if(s.originalTestId&&s.alreadyKnownOriginalTests.includes(s.originalTestId))
  return result('duplicate_evidence','original_test_already_known');
 if(s.signalType==='independent_original_test'&&s.originalTestId&&
   s.relevanceToConfirmedOutcomes.some(o=>d.outcomeIds.includes(o)||d.mustHaveIds.includes(o)))
  return result('targeted_evidence_collection','new_use_relevant_original_test');
 return result('metadata_watch','insufficient_comparative_signal');
}
