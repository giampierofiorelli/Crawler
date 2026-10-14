import test from 'node:test';
import assert from 'node:assert/strict';
import {decideWhetherToResearchMore,explainSearchState,
 type SearchContinuationAudit,type CandidateFilterReceipt} from '../src/phase79_adaptive_search_decision.js';
import {demandScopeHash,type StructuredDemand,type PortfolioAudit} from '../src/phase77_decision_research.js';
import type {ReviewedSearchAudit} from '../src/phase78_search_adequacy.js';
const demand:StructuredDemand={mode:'functional_discovery',outcomeIds:['mattress_cleaning'],
 mustHaveIds:['dry_method','fabric_safe'],exclusionIds:['bleach'],regionId:'uk',productId:null,confirmedBy:'user'};
const scope=demandScopeHash(demand);
const candidate=(name:string,fit:boolean)=>({productId:name,familyId:'cleaners',
 reviewedApplicableTo:fit?['mattress_cleaning','dry_method','fabric_safe']:['mattress_cleaning'],
 reviewedAvoids:fit?['bleach']:[],independentlyTestedOriginalIds:fit?[`lab_${name}`]:[],
 rightsCleared:true,safetyReviewed:true,methodReviewed:true,productVariantReviewed:true});
const portfolio=(fit=1,fail=2):PortfolioAudit=>({demand,sourceLandscapeReviewed:true,
 discoveryReproducible:true,searchBoundaryReviewed:true,
 families:[{familyId:'cleaners',disposition:'evaluated',evidenceReferenceIds:['family_independent_review']}],
 candidates:[...Array.from({length:fit},(_,i)=>candidate(`pass_${i}`,true)),
 ...Array.from({length:fail},(_,i)=>candidate(`fail_${i}`,false))]});
const baseline:ReviewedSearchAudit={demandScopeHash:scope,boundaryApprovalId:'independent_scope_boundary',
 methods:[{channel:'independent_testing',receiptId:'lab_search',originId:'lab'},
 {channel:'retailer_catalogue',receiptId:'retail_search',originId:'merchant'}],
 unresolvedAlternativeIds:[],discoveryInProgress:false,
 examinedExclusions:[{productId:'fail_0',reasonId:'dry_missing_0',exclusionClass:'fails_required_condition',evidenceReferenceIds:['verified_failure_0']},
 {productId:'fail_1',reasonId:'dry_missing_1',exclusionClass:'fails_required_condition',evidenceReferenceIds:['verified_failure_1']}]};
const fit=(id:string):CandidateFilterReceipt=>({productId:id,verdict:'verified_fit',
 failingHardConstraintIds:[],evidenceIds:[`observed_${id}`],reviewId:`review_${id}`});
const fails=(id:string):CandidateFilterReceipt=>({productId:id,verdict:'verified_hard_filter_failure',
 failingHardConstraintIds:['dry_method'],evidenceIds:[`observed_${id}`],reviewId:`review_${id}`});
function control(p:PortfolioAudit):SearchContinuationAudit{return {demandScopeHash:scope,
 candidateFilters:p.candidates.map(c=>c.productId.startsWith('pass_')?fit(c.productId):fails(c.productId)),
 openChallengerIds:[],staleEvidenceIds:[],importantEvidenceGapIds:[],
 constraintInterpretationReviewId:'confirmed_user_constraints',
 decisionStability:{assessment:'unlikely_to_change',reviewId:'independent_sensitivity_review'},
 challenge:{id:'challenge_a',originId:'independent_third_party',channel:'industry_directory',
 reviewId:'challenge_review',evidenceIds:['challenge_search_receipt'],
 result:'no_new_plausible_candidates',plausibleCandidateIds:[]}};}
const evaluatedExclusions=(p:PortfolioAudit):ReviewedSearchAudit=>({...baseline,examinedExclusions:p.candidates
 .filter(c=>c.productId.startsWith('fail_')).map((c,i)=>({productId:c.productId,
 reasonId:`failed_condition_${i}`,exclusionClass:'fails_required_condition',evidenceReferenceIds:[`support_${i}`]}))});

test('ONE after verified filters and independent challenge is a legitimate narrow selection',()=>{
 const p=portfolio(1,2);const result=decideWhetherToResearchMore(p,baseline,control(p));
 assert.equal(result.conclusion,'bounded_single_option');assert.equal(result.verifiedFitCount,1);
 assert.equal(result.reviewedHardFilterExclusionCount,2);assert.equal(result.narrowingEvidence,'verified_under_scope');
 assert.equal(result.furtherResearchNeeded,false);assert.deepEqual(result.nextActions,['independent_decision_review']);
 assert.equal(result.rankingAuthorized,false);assert.match(explainSearchState(result),/Non significa che sia l’unica/);
});
test('ONE in catalog without independently bounded discovery must prompt more discovery',()=>{
 const p=portfolio(1,0);
 const insufficient={...baseline,methods:baseline.methods.slice(0,1),boundaryApprovalId:null,
 examinedExclusions:[]};
 const r=decideWhetherToResearchMore(p,insufficient,control(p));
 assert.equal(r.verifiedFitCount,1);assert.equal(r.conclusion,'continue_research');
 assert.ok(r.nextActions.includes('expand_solution_discovery'));
});
test('THREE left after confirmed hard filters is valid when search is audited',()=>{
 const p=portfolio(3,80);const r=decideWhetherToResearchMore(p,evaluatedExclusions(p),control(p));
 assert.equal(r.verifiedFitCount,3);assert.equal(r.discoveredCandidateCount,83);
 assert.equal(r.conclusion,'bounded_multiple_options');assert.equal(r.narrowingEvidence,'verified_under_scope');
 assert.equal(r.furtherResearchNeeded,false);
});
test('100 verified fits can be research-bounded; do not demand fixed top N',()=>{
 const p=portfolio(100,0);const r=decideWhetherToResearchMore(p,evaluatedExclusions(p),control(p));
 assert.equal(r.conclusion,'bounded_multiple_options');assert.equal(r.discoveredCandidateCount,100);
 assert.equal(r.furtherResearchNeeded,false);assert.equal(r.rankingAuthorized,false);
});
test('100 items with missing product checks are NOT adequate even if 3 known items fit',()=>{
 const p=portfolio(3,97);const a=control(p);
 a.candidateFilters=a.candidateFilters.map(f=>f.productId.startsWith('fail_')?
 ({productId:f.productId,verdict:'unresolved',failingHardConstraintIds:[],evidenceIds:[],reviewId:null}):f);
 const r=decideWhetherToResearchMore(p,evaluatedExclusions(p),a);
 assert.equal(r.verifiedFitCount,3);assert.equal(r.unresolvedCandidateCount,97);
 assert.ok(r.nextActions.includes('review_unresolved_products'));
 assert.equal(r.conclusion,'continue_research');
});
test('same number of products, independent discovery missing: more research',()=>{
 const p=portfolio(3,2);const audit=evaluatedExclusions(p);
 const r=decideWhetherToResearchMore(p,{...audit,discoveryInProgress:true},control(p));
 assert.equal(r.conclusion,'continue_research');assert.ok(r.nextActions.includes('expand_solution_discovery'));
});
test('independent challenge must be independent of initial sources',()=>{
 const p=portfolio();const a=control(p);
 a.challenge={...a.challenge!,originId:'merchant'};
 const r=decideWhetherToResearchMore(p,baseline,a);
 assert.ok(r.nextActions.includes('independent_challenge_search'));
});
test('a challenge discovering a plausible entrant reopens the search despite complete original portfolio',()=>{
 const p=portfolio();const a=control(p);a.challenge={...a.challenge!,
 result:'plausible_candidates_found',plausibleCandidateIds:['new_entrant']};
 const r=decideWhetherToResearchMore(p,baseline,a);
 assert.equal(r.conclusion,'continue_research');assert.ok(r.nextActions.includes('expand_solution_discovery'));
});
test('challenge still pending is not a completed independent check',()=>{
 const p=portfolio();const a=control(p);a.challenge={...a.challenge!,result:'inconclusive',reviewId:null};
 assert.ok(decideWhetherToResearchMore(p,baseline,a).nextActions.includes('independent_challenge_search'));
});
test('new risk, conflicting test, freshness or material uncertainty causes targeted research',()=>{
 const p=portfolio();const a=control(p);
 a.importantEvidenceGapIds=['new_lab_protocol_conflict'];a.staleEvidenceIds=['price_region_evidence'];
 a.decisionStability={assessment:'could_change',reviewId:'fresh_review'};
 const r=decideWhetherToResearchMore(p,baseline,a);
 assert.ok(r.nextActions.includes('collect_decision_changing_evidence'));
 assert.ok(r.nextActions.includes('refresh_stale_evidence'));
 assert.ok(!r.nextActions.includes('expand_solution_discovery'));
});
test('unconfirmed meaning of filters must never close the search',()=>{
 const p=portfolio();const a=control(p);a.constraintInterpretationReviewId=null;
 assert.equal(decideWhetherToResearchMore(p,baseline,a).conclusion,'continue_research');
 assert.ok(decideWhetherToResearchMore(p,baseline,a).nextActions.includes('confirm_constraint_meaning'));
});
test('zero verified products may be a bounded, truthful negative, without asking to relax hard limits automatically',()=>{
 const p=portfolio(0,2),r=decideWhetherToResearchMore(p,baseline,control(p));
 assert.equal(r.conclusion,'bounded_no_verified_option');assert.equal(r.furtherResearchNeeded,false);
 assert.match(explainSearchState(r),/tuo consenso/);
});
test('unseen viable alternative must not be interpreted as a narrow market',()=>{
 const p=portfolio(),a=control(p);a.openChallengerIds=['alternative_with_unchecked_results'];
 assert.equal(decideWhetherToResearchMore(p,baseline,a).conclusion,'continue_research');
});
test('mislabelled untested product as verified fit is rejected',()=>{
 const p=portfolio();const a=control(p);a.candidateFilters=a.candidateFilters.map(f=>f.productId==='fail_0'?fit('fail_0'):f);
 assert.throws(()=>decideWhetherToResearchMore(p,baseline,a),/contradicts/);
});
test('an exclusion without real user filter evidence cannot narrow the field',()=>{
 const p=portfolio();const a=control(p);
 a.candidateFilters=a.candidateFilters.map(f=>f.productId==='fail_0'?{...f,failingHardConstraintIds:['imagined_condition']}:f);
 assert.throws(()=>decideWhetherToResearchMore(p,baseline,a),/Invalid/);
});
test('cross-demand request is never permitted to reuse another filter audit',()=>{
 const p=portfolio(),a=control(p);a.demandScopeHash='0'.repeat(64);
 assert.throws(()=>decideWhetherToResearchMore(p,baseline,a),/Invalid/);
});
test('hard-filter evidence shows why a narrow selection arose, not simply number in database',()=>{
 const p=portfolio(1,2);const r=decideWhetherToResearchMore(p,baseline,control(p));
 assert.equal(r.exclusionsByHardConstraint.dry_method,2);
 assert.equal(r.exclusionsByHardConstraint.fabric_safe,0);
 assert.equal(r.discoveredCandidateCount,3);assert.equal(r.verifiedFitCount,1);
});
test('500 candidates at legacy portfolio boundary can be handled without a forced quota',()=>{
 const p=portfolio(3,497);const r=decideWhetherToResearchMore(p,evaluatedExclusions(p),control(p));
 assert.equal(r.discoveredCandidateCount,500);assert.equal(r.verifiedFitCount,3);
 assert.equal(r.conclusion,'bounded_multiple_options');
});
