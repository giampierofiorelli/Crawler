import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
import {createPhase77HttpApi} from '../src/phase77_http.js';
import {Phase77ProgressLedger} from '../src/phase77_progress_ledger.js';
import {demandScopeHash,type StructuredDemand,type PortfolioAudit} from '../src/phase77_decision_research.js';
import type {ReviewedSearchAudit} from '../src/phase78_search_adequacy.js';
const demand:StructuredDemand={mode:'functional_discovery',outcomeIds:['dust_removal'],
 mustHaveIds:['low_moisture'],exclusionIds:['bleach'],regionId:'uk',productId:null,confirmedBy:'user'};
const scope=demandScopeHash(demand);
const portfolio:PortfolioAudit={demand,sourceLandscapeReviewed:true,searchBoundaryReviewed:true,discoveryReproducible:true,
 families:[{familyId:'vacuums',disposition:'evaluated',evidenceReferenceIds:['family_1']}],
 candidates:[{productId:'vacuum_1',familyId:'vacuums',reviewedApplicableTo:['dust_removal','low_moisture'],
 reviewedAvoids:['bleach'],independentlyTestedOriginalIds:['lab_1'],rightsCleared:true,safetyReviewed:true,
 methodReviewed:true,productVariantReviewed:true}]};
const audit:ReviewedSearchAudit={demandScopeHash:scope,boundaryApprovalId:'reviewed_boundary',
 discoveryInProgress:false,unresolvedAlternativeIds:[],examinedExclusions:[],
 methods:[{channel:'independent_testing',receiptId:'test_path',originId:'lab_org'},
 {channel:'retailer_catalogue',receiptId:'catalog_path',originId:'shop_org'}]};
test('authenticated HTTP status shows truthful copy and reviewed unranked cards without leaking private demand',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'pee78-http-'));
 const ledger=new Phase77ProgressLedger(path.join(dir,'status.json'));
 const submission=await ledger.submit(scope,'functional_discovery');
 const server=createPhase77HttpApi({ledger,authorizeIntake:async()=>false,
  sharedKnowledgeEnabled:true,
  getReviewedResearch:async({requestId,scopeHash})=>{
   assert.equal(requestId,submission.view.requestId);assert.equal(scopeHash,scope);
   return {portfolio,audit,publicationApproval:{demandScopeHash:scope,reviewId:'editorial_1',
    approvedProductIds:['vacuum_1'],kind:'individual_option_cards'}};
  }});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const addr=server.address();if(!addr||typeof addr==='string')throw Error('No listener');
  const url=`http://127.0.0.1:${addr.port}/v2/decision-research/${submission.view.requestId}`;
  assert.equal((await fetch(url)).status,404);
  const retrieve=async()=>fetch(url,{headers:{Authorization:'Bearer '+submission.accessToken}});
  const registered=await (await retrieve()).json() as Record<string,any>;
  assert.equal(registered.customerUpdate.kind,'registered');
  assert.equal(registered.customerUpdate.optionCards,null);
  assert.equal(JSON.stringify(registered).includes('scopeHash'),false);
  assert.equal(JSON.stringify(registered).includes('accessToken'),false);
  const t='2026-10-10T20:20:00.000Z';
  await ledger.startStep(submission.view.requestId,'goal_review',t,async()=>true);
  const working=await (await retrieve()).json() as Record<string,any>;
  assert.equal(working.customerUpdate.kind,'researching');
  assert.deepEqual(working.customerUpdate.optionCards.productIds,['vacuum_1']);
  assert.equal(working.customerUpdate.isRanking,false);
  assert.equal(working.customerUpdate.verifiedOptionCount,1);
  assert.equal(working.customerUpdate.isMarketExhaustiveClaim,false);
 }finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
 await rm(dir,{recursive:true,force:true});}
});
test('no certified backend evidence => no option cards or market completeness claim',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'pee78-absent-'));
 const ledger=new Phase77ProgressLedger(path.join(dir,'ledger.json'));
 const subscription=await ledger.submit(scope,'functional_discovery');
 const server=createPhase77HttpApi({ledger,authorizeIntake:async()=>false,
  getReviewedResearch:async()=>{throw Error('Backend unavailable');}});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const addr=server.address();if(!addr||typeof addr==='string')throw Error('No listener');
  const r=await fetch(`http://127.0.0.1:${addr.port}/v2/decision-research/${subscription.view.requestId}`,
   {headers:{Authorization:'Bearer '+subscription.accessToken}});
  assert.equal(r.status,200);const body=await r.json() as Record<string,any>;
  assert.equal(body.customerUpdate.optionCards,null);
  assert.equal(body.customerUpdate.verifiedOptionCount,null);
 }finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
 await rm(dir,{recursive:true,force:true});}
});
test('mismatched trusted assessment silently fails closed rather than claim research on another demand',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'pee78-mismatch-'));
 const ledger=new Phase77ProgressLedger(path.join(dir,'ledger.json'));
 const different={...demand,mustHaveIds:['low_moisture','quiet']};
 const subscription=await ledger.submit(demandScopeHash(different),'functional_discovery');
 const server=createPhase77HttpApi({ledger,authorizeIntake:async()=>false,
  getReviewedResearch:async()=>({portfolio,audit,publicationApproval:null})});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const addr=server.address();if(!addr||typeof addr==='string')throw Error('No listener');
  const r=await fetch(`http://127.0.0.1:${addr.port}/v2/decision-research/${subscription.view.requestId}`,
   {headers:{Authorization:'Bearer '+subscription.accessToken}});
  const body=await r.json() as Record<string,any>;
  assert.equal(body.customerUpdate.verifiedOptionCount,null);assert.equal(body.customerUpdate.optionCards,null);
 }finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
 await rm(dir,{recursive:true,force:true});}
});
