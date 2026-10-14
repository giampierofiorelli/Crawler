import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';import path from 'node:path';
import {demandScopeHash,planDemand,evaluatePortfolio,triageNewEntrant,STEPS,
 type StructuredDemand,type PortfolioAudit} from '../src/phase77_decision_research.js';
import {Phase77ProgressLedger} from '../src/phase77_progress_ledger.js';
const d:StructuredDemand={mode:'functional_discovery',outcomeIds:['mattress_dust_removal'],
 mustHaveIds:['low_moisture','suitable_for_upholstery'],exclusionIds:['bleach'],
 regionId:'uk',productId:null,confirmedBy:'user'};
const at='2026-10-10T20:00:00.000Z';
const authorized=async()=>true;const denied=async()=>false;
async function fixture(cb:(ledger:Phase77ProgressLedger)=>Promise<void>){
 const dir=await mkdtemp(path.join(os.tmpdir(),'pee77-'));
 try{await cb(new Phase77ProgressLedger(path.join(dir,'ledger.json')));}finally{await rm(dir,{recursive:true,force:true});}
}
test('new problem is not invented category, can span multiple reviewed solution families',()=>{
 const route=planDemand(d,[{familyId:'upholstery_vac',categoryId:'vacuum_cleaners',relation:'reviewed_applicable',evidenceReferenceIds:['catalogue_01']},
 {familyId:'extractor',categoryId:'spot_cleaners',relation:'reviewed_applicable',evidenceReferenceIds:['catalogue_02']},
 {familyId:'uv_only',categoryId:null,relation:'hypothesized_applicable',evidenceReferenceIds:[]}]);
 assert.equal(route.kind,'cross_category_solution_space');assert.equal(route.createsCategoryAutomatically,false);
 assert.equal(route.requiresSolutionResearch,true);assert.deepEqual(route.reviewedFamilyIds,['extractor','upholstery_vac']);
});
test('new demand with zero categories triggers solution research, not an unknown-category publication',()=>{
 const r=planDemand(d,[]);assert.equal(r.kind,'unknown_solution_space');
 assert.equal(r.createsCategoryAutomatically,false);assert.equal(r.steps.length,7);
});
test('different constraints lead to different research scopes and dedupe is insensitive to order',()=>{
 const other={...d,mustHaveIds:['low_moisture','quiet','suitable_for_upholstery']};
 assert.notEqual(demandScopeHash(d),demandScopeHash(other));
 assert.equal(demandScopeHash(d),demandScopeHash({...d,mustHaveIds:[...d.mustHaveIds].reverse()}));
 assert.throws(()=>demandScopeHash({...d,mustHaveIds:['bleach']}),/Invalid structured demand/);
});
test('specific model is a different request type, requires exact product id',()=>{
 assert.equal(planDemand({...d,mode:'specific_product',productId:'new_cleaner_9'},[]).kind,'specific_product');
 assert.throws(()=>planDemand({...d,mode:'specific_product'},[]),/Invalid structured demand/);
});
const portfolio:PortfolioAudit={demand:d,
 families:[{familyId:'upholstery_vac',disposition:'evaluated',evidenceReferenceIds:['audit_1']},
 {familyId:'extractor',disposition:'excluded_with_evidence',evidenceReferenceIds:['audit_2']}],
 candidates:[{productId:'vac_1',familyId:'upholstery_vac',reviewedApplicableTo:['mattress_dust_removal','low_moisture','suitable_for_upholstery'],reviewedAvoids:['bleach'],
  independentlyTestedOriginalIds:['lab_1'],rightsCleared:true,safetyReviewed:true,methodReviewed:true,productVariantReviewed:true},
 {productId:'vac_2',familyId:'upholstery_vac',reviewedApplicableTo:['mattress_dust_removal','low_moisture','suitable_for_upholstery'],reviewedAvoids:['bleach'],
  independentlyTestedOriginalIds:['lab_2'],rightsCleared:true,safetyReviewed:true,methodReviewed:true,productVariantReviewed:true}],
 sourceLandscapeReviewed:true,discoveryReproducible:true,searchBoundaryReviewed:true};
test('no fixed top-N, yet minimum comparable alternatives and audited search scope',()=>{
 const result=evaluatePortfolio(portfolio);
 assert.equal(result.status,'eligible_for_comparative_review');assert.equal(result.rankingEligible,false);
 assert.equal(result.fixedTopNRequired,false);assert.equal(result.independentOriginalTestCount,2);
});
test('insufficient sources or variants never masquerade as full recommendation',()=>{
 const a=evaluatePortfolio({...portfolio,sourceLandscapeReviewed:false,
 candidates:[{...portfolio.candidates[0],independentlyTestedOriginalIds:['lab_1']}]});
 assert.equal(a.status,'research_incomplete');assert.ok(a.reasons.includes('source_landscape_not_reviewed'));
 assert.ok(a.reasons.includes('fewer_than_two_comparable_eligible_products'));
 const b=evaluatePortfolio({...portfolio,candidates:portfolio.candidates.map(c=>({...c,independentlyTestedOriginalIds:['same_lab']}))});
 assert.ok(b.reasons.includes('insufficient_distinct_original_tests'));
});

test('an unverified exclusion or an untested desired outcome invalidates a product',()=>{
 const withoutAvoidance=evaluatePortfolio({...portfolio,candidates:[
  {...portfolio.candidates[0],reviewedAvoids:[]},portfolio.candidates[1]]});
 assert.equal(withoutAvoidance.status,'research_incomplete');
 const withoutOutcome=evaluatePortfolio({...portfolio,candidates:[
  {...portfolio.candidates[0],reviewedApplicableTo:['low_moisture','suitable_for_upholstery']},portfolio.candidates[1]]});
 assert.equal(withoutOutcome.status,'research_incomplete');
});

test('new product announcement alone does not reorder; relevant original test starts targeted comparison',()=>{
 const sig={productId:'vac_3',familyId:'upholstery_vac',signalId:'signal_1',
  signalType:'manufacturer_announcement' as const,sourceRightsCleared:true,
  originalTestId:null,relevanceToConfirmedOutcomes:['mattress_dust_removal'],
  alreadyKnownOriginalTests:[],isAlreadyTrackedProduct:false};
 assert.equal(triageNewEntrant(sig,d).action,'metadata_watch');
 const testSignal={...sig,signalType:'independent_original_test' as const,originalTestId:'lab_3'};
 const r=triageNewEntrant(testSignal,d);
 assert.equal(r.action,'targeted_evidence_collection');assert.equal(r.rankingChangePermitted,false);
 assert.equal(r.requiresCompleteCategoryRebuild,false);
 assert.equal(triageNewEntrant({...testSignal,alreadyKnownOriginalTests:['lab_3']},d).action,'duplicate_evidence');
 assert.equal(triageNewEntrant({...testSignal,sourceRightsCleared:false},d).action,'blocked_source');
});
test('progress is a verifiable sequence and never invented percent or ETA',async()=>fixture(async l=>{
 const reg=await l.submit(demandScopeHash(d),d.mode,at);
 assert.equal(reg.view.status,'queued');assert.equal(reg.view.completedVerifiedSteps,0);
 assert.equal(reg.view.estimatedCompletionAt,null);assert.equal(reg.view.nextScheduledCheckAt,null);
 assert.equal(reg.view.automaticNotificationAvailable,false);
 assert.equal((await l.publicStatus(reg.view.requestId,'0'.repeat(64))),null);
 await assert.rejects(l.verifyStep({requestId:reg.view.requestId,step:STEPS[0],receiptId:'r_1',verifiedAt:at},authorized),/not actually active/);
 await assert.rejects(l.startStep(reg.view.requestId,STEPS[1],at,authorized),/prerequisites/);
 await assert.rejects(l.startStep(reg.view.requestId,STEPS[0],at,denied),/verification required/);
 const started=await l.startStep(reg.view.requestId,STEPS[0],at,authorized);
 assert.equal(started.status,'working');
 await l.verifyStep({requestId:reg.view.requestId,step:STEPS[0],receiptId:'confirmed_goals_1',verifiedAt:at},authorized);
 assert.equal((await l.publicStatus(reg.view.requestId,reg.accessToken))?.completedVerifiedSteps,1);
 const reloaded=new Phase77ProgressLedger(l.filePath);
 assert.equal((await reloaded.publicStatus(reg.view.requestId,reg.accessToken))?.completedVerifiedSteps,1);
 await assert.rejects(l.publishVerified({requestId:reg.view.requestId,resultId:'ready_1',reviewId:'review_1',verifiedAt:at},authorized),/incomplete/);
}));
test('blocked research resumes after verified capacity/source change; no false waiting spinner',async()=>fixture(async l=>{
 const reg=await l.submit(demandScopeHash(d),d.mode,at);const requestId=reg.view.requestId;
 await l.startStep(requestId,STEPS[0],at,authorized);
 const b=await l.blockStep({requestId,step:STEPS[0],reasonCode:'no_approved_sources',at},authorized);
 assert.equal(b.status,'blocked');assert.equal(b.steps[0].state,'blocked');
 await assert.rejects(l.resumeStep({requestId,step:STEPS[0],reasonCode:'different_reason',at},authorized),/not eligible/);
 const r=await l.resumeStep({requestId,step:STEPS[0],reasonCode:'no_approved_sources',at},authorized);
 assert.equal(r.status,'working');
}));
test('check back time appears only after a backend-confirmed schedule',async()=>fixture(async l=>{
 const reg=await l.submit(demandScopeHash(d),d.mode,at);
 const future='2026-10-11T08:00:00.000Z';
 await assert.rejects(l.scheduleCheck(reg.view.requestId,future,at,denied),/verification required/);
 await assert.rejects(l.scheduleCheck(reg.view.requestId,at,at,authorized),/future scheduler/);
 assert.equal((await l.publicStatus(reg.view.requestId,reg.accessToken))?.nextScheduledCheckAt,null);
 await l.scheduleCheck(reg.view.requestId,future,at,authorized);
 const status=await l.publicStatus(reg.view.requestId,reg.accessToken);
 assert.equal(status?.nextScheduledCheckAt,future);assert.equal(status?.estimatedCompletionAt,null);
}));
test('only verified milestones plus independent publication permit ready',async()=>fixture(async l=>{
 const reg=await l.submit(demandScopeHash(d),d.mode,at);const requestId=reg.view.requestId;
 for(const [i,step] of STEPS.entries()){
  await l.startStep(requestId,step,at,authorized);
  const r=await l.verifyStep({requestId,step,receiptId:'receipt_'+i,verifiedAt:at},authorized);
  assert.equal(r.completedVerifiedSteps,i+1);
 }
 assert.equal((await l.publicStatus(requestId,reg.accessToken))?.status,'awaiting_independent_review');
 await assert.rejects(l.publishVerified({requestId,resultId:'result_1',reviewId:'review_1',verifiedAt:at},denied),/verification required/);
 const result=await l.publishVerified({requestId,resultId:'result_1',reviewId:'review_1',verifiedAt:at},authorized);
 assert.equal(result.status,'ready');assert.equal(result.reviewedResultId,'result_1');
 await assert.rejects(l.startStep(requestId,STEPS[0],at,authorized),/closed request/);
}));
test('identical scopes share research but have separate private access tokens',async()=>fixture(async l=>{
 const first=await l.submit(demandScopeHash(d),d.mode,at);
 const second=await l.submit(demandScopeHash({...d,mustHaveIds:[...d.mustHaveIds].reverse()}),d.mode,at);
 const different=await l.submit(demandScopeHash({...d,exclusionIds:['bleach','perfume']}),d.mode,at);
 assert.equal(first.view.requestId,second.view.requestId);assert.equal(second.deduplicated,true);
 assert.notEqual(first.accessToken,second.accessToken);
 assert.notEqual(first.view.requestId,different.view.requestId);
 assert.equal((await l.publicStatus(first.view.requestId,second.accessToken))?.status,'queued');
}));
test('ledger corruption fails closed',async()=>fixture(async l=>{
 await l.submit(demandScopeHash(d),d.mode,at);
 const raw=await readFile(l.filePath,'utf8');await writeFile(l.filePath,raw.replace('not_started','verified'));
 await assert.rejects(l.load(),/integrity mismatch/);
}));
