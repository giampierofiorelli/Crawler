/** Constructed illustration only. Evidence receipt identifiers below are fictional. */
import {demandScopeHash,type StructuredDemand,type PortfolioAudit} from '../src/phase77_decision_research.js';
import type {ReviewedSearchAudit} from '../src/phase78_search_adequacy.js';
import {decideWhetherToResearchMore,explainSearchState,
 type SearchContinuationAudit} from '../src/phase79_adaptive_search_decision.js';
const demand:StructuredDemand={mode:'functional_discovery',outcomeIds:['mattress_dust'],
 mustHaveIds:['dry_cleaning'],exclusionIds:['bleach'],regionId:'uk',productId:null,confirmedBy:'user'};
const hash=demandScopeHash(demand);
function make(fit:number,fail:number):PortfolioAudit{return {demand,
 families:[{familyId:'specialist_cleaning',disposition:'evaluated',evidenceReferenceIds:['family_review']}],
 sourceLandscapeReviewed:true,discoveryReproducible:true,searchBoundaryReviewed:true,
 candidates:[...Array.from({length:fit},(_,i)=>({productId:`eligible_${i}`,familyId:'specialist_cleaning',
 reviewedApplicableTo:['mattress_dust','dry_cleaning'],reviewedAvoids:['bleach'],
 independentlyTestedOriginalIds:[`test_${i}`],rightsCleared:true,safetyReviewed:true,
 methodReviewed:true,productVariantReviewed:true})),
 ...Array.from({length:fail},(_,i)=>({productId:`rejected_${i}`,familyId:'specialist_cleaning',
 reviewedApplicableTo:['mattress_dust'],reviewedAvoids:[],independentlyTestedOriginalIds:[],
 rightsCleared:true,safetyReviewed:true,methodReviewed:true,productVariantReviewed:true}))]};}
function audit(p:PortfolioAudit,complete:boolean):ReviewedSearchAudit{return {demandScopeHash:hash,
 boundaryApprovalId:complete?'boundary_confirmed':null,methods:complete?[
 {channel:'independent_testing',receiptId:'s1',originId:'a'},
 {channel:'retailer_catalogue',receiptId:'s2',originId:'b'}]:[],
 unresolvedAlternativeIds:[],discoveryInProgress:!complete,
 examinedExclusions:p.candidates.filter(c=>c.productId.startsWith('rejected_'))
  .map((c,i)=>({productId:c.productId,reasonId:`fails_dry_${i}`,
   exclusionClass:'fails_required_condition',evidenceReferenceIds:[`evidence_${i}`]}))};}
function continuation(p:PortfolioAudit):SearchContinuationAudit{return {demandScopeHash:hash,
 candidateFilters:p.candidates.map(c=>c.productId.startsWith('eligible_')?({productId:c.productId,
 verdict:'verified_fit',failingHardConstraintIds:[],reviewId:`review_${c.productId}`,
 evidenceIds:[`evidence_${c.productId}`]}):({productId:c.productId,
 verdict:'verified_hard_filter_failure',failingHardConstraintIds:['dry_cleaning'],
 reviewId:`review_${c.productId}`,evidenceIds:[`evidence_${c.productId}`]})),
 openChallengerIds:[],importantEvidenceGapIds:[],staleEvidenceIds:[],
 constraintInterpretationReviewId:'user_confirmed_filters',
 decisionStability:{reviewId:'sensitivity_review',assessment:'unlikely_to_change'},
 challenge:{id:'independent_audit',originId:'c',channel:'industry_directory',
 reviewId:'independent_review',evidenceIds:['audit_evidence'],
 result:'no_new_plausible_candidates',plausibleCandidateIds:[]}};}
const cases=[{name:'one after audited hard filters',fit:1,fail:2,complete:true},
 {name:'one only because discovery was not established',fit:1,fail:0,complete:false},
 {name:'three after filtering a large explored catalogue',fit:3,fail:100,complete:true},
 {name:'one hundred viable options in a well-documented search',fit:100,fail:0,complete:true}];
for(const c of cases){const p=make(c.fit,c.fail);const r=decideWhetherToResearchMore(
 p,audit(p,c.complete),continuation(p));
 console.log(JSON.stringify({scenario:c.name,discovered:r.discoveredCandidateCount,
 verified:r.verifiedFitCount,hardFilterExclusions:r.reviewedHardFilterExclusionCount,
 conclusion:r.conclusion,nextActions:r.nextActions,message:explainSearchState(r)}));}
