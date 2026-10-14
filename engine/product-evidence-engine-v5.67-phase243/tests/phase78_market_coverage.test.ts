import test from 'node:test';import assert from 'node:assert/strict';
import {assessResearchAdequacy,type ReviewedSearchAudit,type OptionPublicationApproval} from '../src/phase78_search_adequacy.js';
import {customerResearchUpdate} from '../src/phase78_user_updates.js';
import {demandScopeHash,STEPS,type StructuredDemand,type PortfolioAudit} from '../src/phase77_decision_research.js';
import type {ProgressView} from '../src/phase77_progress_ledger.js';
const demand:StructuredDemand={mode:'functional_discovery',outcomeIds:['mattress_dust_removal'],
 mustHaveIds:['low_moisture','fabric_safe'],exclusionIds:['bleach'],regionId:'uk',productId:null,confirmedBy:'user'};
const p=(productId:string,testId:string,ok=true)=>({productId,familyId:'upholstery_cleaners',
 reviewedApplicableTo:ok?['mattress_dust_removal','low_moisture','fabric_safe']:['mattress_dust_removal'],
 reviewedAvoids:ok?['bleach']:[],independentlyTestedOriginalIds:[testId],
 rightsCleared:true,safetyReviewed:true,methodReviewed:true,productVariantReviewed:true});
const base:PortfolioAudit={demand,families:[{familyId:'upholstery_cleaners',disposition:'evaluated',
 evidenceReferenceIds:['family_source']}],candidates:[p('machine_a','lab_a'),p('machine_b','lab_b',false),p('machine_c','lab_c',false)],
 sourceLandscapeReviewed:true,discoveryReproducible:true,searchBoundaryReviewed:true};
const audit:ReviewedSearchAudit={demandScopeHash:demandScopeHash(demand),
 boundaryApprovalId:'independent_boundary_2026',
 methods:[{channel:'independent_testing',receiptId:'discovery_lab',originId:'lab_group'},
 {channel:'retailer_catalogue',receiptId:'discovery_retail',originId:'merchant_org'}],
 unresolvedAlternativeIds:[],discoveryInProgress:false,examinedExclusions:[
 {productId:'machine_b',reasonId:'missing_low_moisture',exclusionClass:'fails_required_condition',evidenceReferenceIds:['study_b']},
 {productId:'machine_c',reasonId:'uses_bleach',exclusionClass:'violates_exclusion',evidenceReferenceIds:['study_c']} ]};
const approval:OptionPublicationApproval={demandScopeHash:demandScopeHash(demand),reviewId:'editorial_01',
 approvedProductIds:['machine_a'],kind:'individual_option_cards'};
function progress(status:ProgressView['status']):ProgressView{return {requestId:'req_a',status,
 steps:STEPS.map(step=>({step,state:status==='queued'?'not_started':'verified'})),
 completedVerifiedSteps:status==='queued'?0:7,totalSteps:7,currentStep:null,nextScheduledCheckAt:null,
 estimatedCompletionAt:null,automaticNotificationAvailable:false,reviewedResultId:null,canReturnLater:true};}
test('one verified match after documented exclusions can be a narrow result without declaring sole product on market',()=>{
 const result=assessResearchAdequacy(base,audit,approval);
 assert.equal(result.searchAdequacy,'bounded_for_this_demand');assert.equal(result.verifiedOptionCount,1);
 assert.equal(result.independentlyDocumentedExclusions,2);
 assert.deepEqual(result.publishableUnrankedProductIds,['machine_a']);
 assert.equal(result.exhaustiveMarketClaimAuthorized,false);
 assert.equal(result.rankedRecommendationsAuthorized,false);
 const msg=customerResearchUpdate(progress('working'),result,true);
 assert.match(msg.body,/Non significa che sia l’unica sul mercato/);
 assert.deepEqual(msg.optionCards?.productIds,['machine_a']);
 assert.equal(msg.isRanking,false);
});
test('same three catalogued products with missing discovery are NOT evidence of a narrow market',()=>{
 const insufficient=assessResearchAdequacy(base,{...audit,methods:audit.methods.slice(0,1),boundaryApprovalId:null});
 assert.equal(insufficient.searchAdequacy,'coverage_not_established');
 assert.ok(insufficient.reasons.includes('independent_discovery_paths_not_documented'));
 assert.equal(insufficient.verifiedOptionCount,1);
 const update=customerResearchUpdate(progress('working'),insufficient);
 assert.match(update.body,/Non sappiamo ancora/);
 assert.doesNotMatch(update.body,/numero troppo piccolo/);
});
test('unexamined known candidates block coverage even with signed-looking boundary identifier',()=>{
 const insufficient=assessResearchAdequacy(base,{...audit,examinedExclusions:[]});
 assert.equal(insufficient.searchAdequacy,'coverage_not_established');
 assert.ok(insufficient.reasons.includes('known_candidates_not_yet_resolved'));
});
test('not tested is never evidence of exclusion',()=>{
 const unresolved=assessResearchAdequacy(base,{...audit,examinedExclusions:[
 {...audit.examinedExclusions[0],exclusionClass:'insufficient_evidence'},audit.examinedExclusions[1]]});
 assert.ok(unresolved.reasons.includes('known_candidates_not_yet_resolved'));
 assert.equal(unresolved.independentlyDocumentedExclusions,1);
});
test('one candidate in the catalog does not imply narrow market without audited discovery',()=>{
 const report=assessResearchAdequacy({...base,candidates:[p('machine_a','lab_a')]},
 {...audit,discoveryInProgress:true,examinedExclusions:[]});
 assert.equal(report.verifiedOptionCount,1);
 assert.equal(report.searchAdequacy,'coverage_not_established');
});
test('even 30 catalogued products do not prove search adequacy',()=>{
 const more={...base,candidates:Array.from({length:30},(_,i)=>p(`product_${i}`,`lab_${i}`))};
 const result=assessResearchAdequacy(more,{...audit,methods:[],examinedExclusions:[]});
 assert.equal(result.verifiedOptionCount,30);assert.equal(result.searchAdequacy,'coverage_not_established');
});
test('closed reviewed search with no eligible product produces no unsupported recommendation',()=>{
 const rejected={...base,candidates:base.candidates.slice(1)};
 const summary=assessResearchAdequacy(rejected,audit);
 assert.equal(summary.searchAdequacy,'bounded_for_this_demand');
 assert.equal(summary.verifiedOptionCount,0);assert.deepEqual(summary.publishableUnrankedProductIds,[]);
 assert.equal(customerResearchUpdate(progress('working'),summary).optionCards,null);
});
test('multiple individually approved cards are unranked, approval cannot name unverified products',()=>{
 const caseTwo={...base,candidates:[p('machine_a','lab_a'),p('machine_b','lab_b')]};
 const result=assessResearchAdequacy(caseTwo,{...audit,examinedExclusions:[]},
 {...approval,approvedProductIds:['machine_b','machine_a']});
 assert.equal(result.searchAdequacy,'bounded_for_this_demand');
 assert.equal(result.verifiedSelection,'multiple');
 assert.deepEqual(result.publishableUnrankedProductIds,['machine_a','machine_b']);
 assert.equal(result.rankedRecommendationsAuthorized,false);
 assert.throws(()=>assessResearchAdequacy(base,audit,{...approval,approvedProductIds:['machine_c']}),/Invalid editorial/);
});
test('cross-demand audit and editorial approvals are rejected',()=>{
 assert.throws(()=>assessResearchAdequacy(base,{...audit,demandScopeHash:'0'.repeat(64)}),/scope mismatch/);
 assert.throws(()=>assessResearchAdequacy(base,audit,{...approval,demandScopeHash:'0'.repeat(64)}),/Invalid editorial/);
});
test('one source mirrored through two discovery paths is not independent',()=>{
 const report=assessResearchAdequacy(base,{...audit,methods:audit.methods.map(m=>({...m,originId:'syndicated_feed'}))});
 assert.ok(report.reasons.includes('independent_discovery_paths_not_documented'));
});
test('outstanding alternatives, discovery in progress, and unchecked solution family block closure',()=>{
 for(const partial of [{...audit,unresolvedAlternativeIds:['machine_d']},{...audit,discoveryInProgress:true}])
  assert.equal(assessResearchAdequacy(base,partial).searchAdequacy,'coverage_not_established');
 const result=assessResearchAdequacy({...base,families:[{familyId:'upholstery_cleaners',disposition:'not_checked',evidenceReferenceIds:[]}]},audit);
 assert.ok(result.reasons.includes('solution_families_unresolved'));
});
test('honest messages distinguish queued, working, paused, reviewing, and ready',()=>{
 for(const [status,kind] of [['queued','registered'],['working','researching'],['blocked','research_paused'],
 ['awaiting_independent_review','checking'],['ready','complete']] as const){
  const message=customerResearchUpdate(progress(status),null);
  assert.equal(message.kind,kind);assert.equal(message.isRanking,false);
  assert.equal(message.optionCards,null);
  assert.match(message.thanks,/Grazie/);
 }
 assert.match(customerResearchUpdate(progress('queued'),null).body,/non sono ancora iniziate/);
 assert.doesNotMatch(customerResearchUpdate(progress('blocked'),null).body,/Stiamo approfondendo/);
});
test('approval alone never displays cards when queued, paused, or final result exists',()=>{
 const report=assessResearchAdequacy(base,audit,approval);
 for(const status of ['queued','blocked','ready'] as const)
  assert.equal(customerResearchUpdate(progress(status),report).optionCards,null);
});
