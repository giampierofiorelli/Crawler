import test from 'node:test';
import assert from 'node:assert/strict';
import {assessProductLifecycle,type ProductLifecycleEvidence} from '../src/phase80_product_lifecycle.js';
import {triageNewModel,type NewModelEvidenceLead} from '../src/phase81_new_model_intake.js';
import {gateCurrentProducts,productPageLifecycleView,rankCurrentPriceFree} from '../src/phase81_competition_gate.js';
import type {LaunchVariant,LaunchRequest} from '../src/launch_rank.js';
const e=(kind:ProductLifecycleEvidence['kind'],sourceId='manufacturer'):ProductLifecycleEvidence=>({kind,sourceId,verified:true,market:'uk',verifiedAt:'2026-10-10T10:00:00Z'});
const current=assessProductLifecycle('uk',[e('manufacturer_current_listing')]);
const retired=assessProductLifecycle('uk',[e('manufacturer_discontinued_notice')]);
const lead=(kind:NewModelEvidenceLead['kind'],id:string):NewModelEvidenceLead=>({sourceId:id,originalWorkId:id,kind,
 identityMatched:true,verifiedProvenance:true,lawfulToProcess:true});
test('verified manufacturing end is sticky even if later snapshot omits evidence',()=>{
 const newSnapshot=assessProductLifecycle('uk',[],retired.persistentState);
 assert.equal(newSnapshot.modelState,'discontinued');
 assert.equal(newSnapshot.eligibleForCurrentProductCompetition,false);
 assert.equal(newSnapshot.productPage,'archive_greyed_out');
});
test('an official globally scoped retirement excludes the model in every market',()=>{
 const official={...e('manufacturer_discontinued_notice','global_manufacturer'),market:'global'};
 for(const market of ['uk','us','eu']){
  const r=assessProductLifecycle(market,[official]);
  assert.equal(r.modelState,'discontinued');
  assert.equal(r.eligibleForCurrentProductCompetition,false);
 }
});
test('a current listing conflicts with retired tombstone but never restores competition',()=>{
 const changed=assessProductLifecycle('uk',[e('manufacturer_current_listing','newer')],retired.persistentState);
 assert.equal(changed.modelState,'discontinued');
 assert.equal(changed.needsVerification,true);
 assert.equal(changed.eligibleForCurrentProductCompetition,false);
});
test('out-of-stock inputs are rejected instead of being interpreted as discontinued',()=>{
 assert.throws(()=>assessProductLifecycle('uk',[{...e('manufacturer_current_listing'),kind:'retailer_out_of_stock' as any}]));
});
test('retired page persists, is visibly grey, has text label and no current competition',()=>{
 const p=productPageLifecycleView(retired);
 assert.equal(p.remainsAccessible,true);
 assert.equal(p.appearance,'greyed_out');
 assert.equal(p.showInCurrentComparisons,false);
 assert.equal(p.showInCurrentRecommendations,false);
 assert.equal(p.allowHistoricalSpecsAndTests,true);
 assert.match(p.bannerText!,/Fuori produzione/);
});
test('new product with manufacturer specifications only has no inferred performance',()=>{
 const r=triageNewModel({productId:'new_model',categoryId:'vacuums',identityConfirmed:true,lifecycle:current,
  leads:[lead('manufacturer_specs','specsheet')]});
 assert.equal(r.state,'specifications_only');
 assert.equal(r.discoveryRecord,'structured_specifications');
 assert.deepEqual(r.queue,['discover_independent_reviews']);
 assert.equal(r.candidateForEvidenceReview,false);
 assert.equal(r.competitionAuthorized,false);
 assert.equal(r.inferredPerformanceFromSpecs,false);
});
test('new product with independent review is queued for appraisal not automatically ranked',()=>{
 const r=triageNewModel({productId:'new_model',categoryId:'vacuums',identityConfirmed:true,lifecycle:current,
  leads:[lead('manufacturer_specs','specsheet'),lead('independent_professional_review','review_a')]});
 assert.equal(r.state,'independent_review_found');
 assert.equal(r.candidateForEvidenceReview,true);
 assert.equal(r.competitionAuthorized,false);
});
test('new product with original independent test requires method/rights checking',()=>{
 const r=triageNewModel({productId:'new_model',categoryId:'vacuums',identityConfirmed:true,lifecycle:current,
  leads:[lead('independent_original_test','lab_a')]});
 assert.equal(r.state,'original_test_found');
 assert.ok(r.queue.includes('verify_independent_methods_and_rights'));
 assert.ok(r.queue.includes('assess_original_tests'));
});
test('unverified or non-lawful review does not lift specs-only intake',()=>{
 const r=triageNewModel({productId:'new_model',categoryId:'vacuums',identityConfirmed:true,lifecycle:current,
  leads:[lead('manufacturer_specs','specs'),{...lead('independent_original_test','unlicensed'),lawfulToProcess:false}]});
 assert.equal(r.state,'specifications_only');
 assert.equal(r.candidateForEvidenceReview,false);
});
test('discontinued model is always archived regardless of compelling old tests',()=>{
 const r=triageNewModel({productId:'old_model',categoryId:'vacuums',identityConfirmed:true,lifecycle:retired,
  leads:[lead('independent_original_test','oldlab')]});
 assert.equal(r.state,'archived_discontinued');
 assert.deepEqual(r.queue,[]);
 assert.equal(r.candidateForEvidenceReview,false);
});
test('current-product shortlist excludes retired and unknown lifecycle statuses',()=>{
 const g=gateCurrentProducts(['old','new','unknown'],{old:retired,new:current});
 assert.deepEqual(g.excludedDiscontinuedIds,['old']);
 assert.deepEqual(g.allowedVariantIds,['new']);
 assert.deepEqual(g.awaitingLifecycleVerificationIds,['unknown']);
});
test('price-free ranking cannot include archived or unverified lifecycle variants',()=>{
 const vs:LaunchVariant[]=[{id:'old',familyId:'f',market:'UK',sku:'o',currency:'GBP',specifications:{}},
 {id:'new',familyId:'g',market:'UK',sku:'n',currency:'GBP',specifications:{}}];
 const request:LaunchRequest={market:'UK',currency:'GBP',weights:{carpet:1,pet_hair:1,ease:1}};
 const r=rankCurrentPriceFree(vs,[],request,{old:retired,new:current});
 assert.deepEqual(r.gate.excludedDiscontinuedIds,['old']);
 assert.deepEqual(r.ranking.candidates.map(c=>c.variantId),['new']);
 assert.equal(r.publicationReady,false);
});
