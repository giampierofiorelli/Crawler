/** Phase 78 — constructed portfolios, never a live marketplace search. */
import {assessResearchAdequacy} from '../dist/src/phase78_search_adequacy.js';
import {customerResearchUpdate} from '../dist/src/phase78_user_updates.js';
import {demandScopeHash,STEPS} from '../dist/src/phase77_decision_research.js';
const demand={mode:'functional_discovery',outcomeIds:['mattress_dust_removal'],
 mustHaveIds:['low_moisture'],exclusionIds:['bleach'],regionId:'uk',productId:null,confirmedBy:'user'};
const candidate=(id,passes)=>({productId:id,familyId:'upholstery',reviewedApplicableTo:passes?
 ['mattress_dust_removal','low_moisture']:['mattress_dust_removal'],reviewedAvoids:passes?['bleach']:[],
 independentlyTestedOriginalIds:[id+'_test'],rightsCleared:true,safetyReviewed:true,
 methodReviewed:true,productVariantReviewed:true});
const portfolio={demand,families:[{familyId:'upholstery',disposition:'evaluated',evidenceReferenceIds:['constructed_family_record']}],
 candidates:[candidate('one_validated',true),candidate('does_not_satisfy',false)],
 sourceLandscapeReviewed:true,discoveryReproducible:true,searchBoundaryReviewed:true};
const audit={demandScopeHash:demandScopeHash(demand),methods:[
 {channel:'independent_testing',originId:'constructed_lab',receiptId:'constructed_discovery_1'},
 {channel:'retailer_catalogue',originId:'constructed_shop',receiptId:'constructed_discovery_2'}],
 boundaryApprovalId:'constructed_review',unresolvedAlternativeIds:[],discoveryInProgress:false,
 examinedExclusions:[{productId:'does_not_satisfy',reasonId:'constructed_failure',
 exclusionClass:'fails_required_condition',evidenceReferenceIds:['constructed_lab_test']}]};
const state={requestId:'req_constructed',status:'working',steps:STEPS.map(step=>({step,state:'not_started'})),
 completedVerifiedSteps:0,totalSteps:7,currentStep:'goal_review',nextScheduledCheckAt:null,
 estimatedCompletionAt:null,automaticNotificationAvailable:false,reviewedResultId:null,canReturnLater:true};
const narrowed=assessResearchAdequacy(portfolio,audit);
const underexplored=assessResearchAdequacy(portfolio,{...audit,methods:[],boundaryApprovalId:null});
console.log(JSON.stringify({demo_only:true,all_inputs_constructed:true,
 narrowed:{searchAdequacy:narrowed.searchAdequacy,verifiedOptions:narrowed.verifiedOptionCount,
  userUpdate:customerResearchUpdate(state,narrowed,true)},
 underexplored:{searchAdequacy:underexplored.searchAdequacy,verifiedOptions:underexplored.verifiedOptionCount,
  userUpdate:customerResearchUpdate(state,underexplored,true)},
 no_live_crawling:true,no_live_llm:true,no_live_postgres:true},null,2));
