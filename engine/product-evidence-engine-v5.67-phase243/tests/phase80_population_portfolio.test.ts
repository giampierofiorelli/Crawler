import test from 'node:test';
import assert from 'node:assert/strict';
import {planProductPopulation,type CandidateForPopulation,type PopulationContext} from '../src/phase80_population_portfolio.js';
import {assessProductLifecycle} from '../src/phase80_product_lifecycle.js';
const ctx:PopulationContext={categoryId:'vacuum',market:'uk',enrichmentBudget:1,
 independentDiscoveryPasses:0,discoveredNewPlausibleInRecentPasses:3,
 reviewedFamilyIds:['upright','robot'],demandMode:'general_launch_seed'};
const stub=(id:string,familyId='upright'):CandidateForPopulation=>({id,categoryId:'vacuum',market:'uk',familyId,
 stage:'discovery_stub',editorialAppearances:[],officialProductIdentityConfirmed:true,
 marketListingConfirmed:true,novelVerifiedTechnicalFeature:false,explicitNeedTriggered:false,
 validatedNicheFit:false,verifiedDiscontinued:false});
const mention=(publisherId:string,originalListId='review_1',prominence:'leading'|'included'='included')=>
 ({publisherId,originalListId,type:'professionally_tested_shortlist' as const,
  prominence,independentPublisherAttested:true});
test('populates high-potential candidates first; leaves long tail as discoverable stubs',()=>{
 const top={...stub('top'),editorialAppearances:[mention('publication_a'),mention('publication_b')]};
 const low=stub('low');
 const r=planProductPopulation(ctx,[low,top]);
 assert.deepEqual(r.selectedForEnrichment,['top']);
 assert.equal(r.candidates[0].disposition,'retain_stub_for_later');
 assert.equal(r.candidates[1].bucket,'high_baseline');
 assert.equal(r.rankingChanged,false);
 assert.equal(r.marketCoverageCertified,false);
});
test('syndicated and repeated original-list items do not inflate signals',()=>{
 const s={...stub('repeat'),editorialAppearances:[mention('publication_a'),mention('publication_a'),mention('publication_a','review_2')]};
 const r=planProductPopulation({...ctx,reviewedFamilyIds:[]},[s]);
 assert.equal(r.candidates[0].independentEditorialPublishers,1);
 assert.equal(r.candidates[0].bucket,'standard');
});
test('commercial and unverified editorial appearances do not imply independently recommended product',()=>{
 const p={...stub('advert'),editorialAppearances:[{...mention('publication_a'),type:'commercial_or_unknown' as const},
  {...mention('publication_b'),independentPublisherAttested:false}]};
 const r=planProductPopulation({...ctx,reviewedFamilyIds:[]},[p]);
 assert.equal(r.candidates[0].independentEditorialPublishers,0);
 assert.equal(r.candidates[0].bucket,'standard');
});
test('need-specific niche brings a long-tail candidate to top without proving it wins',()=>{
 const popular={...stub('popular'),editorialAppearances:[mention('publication_a'),mention('publication_b')]};
 const niche={...stub('niche'),explicitNeedTriggered:true,validatedNicheFit:true};
 const r=planProductPopulation({...ctx,demandMode:'specific_user_need'},[popular,niche]);
 assert.deepEqual(r.selectedForEnrichment,['niche']);
 assert.equal(r.candidates[1].bucket,'urgent_for_need');
 assert.equal(r.decisionQualityCertified,false);
});
test('new product with verified spec difference may be prioritized but has no independent-performance claim',()=>{
 const p={...stub('new'),novelVerifiedTechnicalFeature:true};
 const r=planProductPopulation({...ctx,reviewedFamilyIds:[]},[p]);
 assert.equal(r.candidates[0].bucket,'high_baseline');
 assert.ok(r.candidates[0].reasons.some(x=>x.includes('unproven_performance')));
});
test('no candidate count is a stopping criterion; budget can pause without coverage certification',()=>{
 const p=Array.from({length:180},(_,i)=>stub(`p_${i}`));
 const r=planProductPopulation({...ctx,enrichmentBudget:3,reviewedFamilyIds:[]},p);
 assert.equal(r.selectedForEnrichment.length,3);
 assert.equal(r.wave,'pause_after_budget');
 assert.equal(r.ongoingDiscoveryRequired,true);
 assert.equal(r.marketCoverageCertified,false);
});
test('a reviewed missing solution family blocks saturation pause',()=>{
 const r=planProductPopulation({...ctx,enrichmentBudget:0,independentDiscoveryPasses:2,
 discoveredNewPlausibleInRecentPasses:0},[{...stub('p_1'),stage:'structured_record'}]);
 assert.equal(r.wave,'continue_priority_population');
});
test('pause seed when no priority backlog and independent discovery found nothing new, retain deferred stub',()=>{
 const r=planProductPopulation({...ctx,reviewedFamilyIds:['upright'],enrichmentBudget:0,
 independentDiscoveryPasses:2,discoveredNewPlausibleInRecentPasses:0},
 [{...stub('known'),stage:'structured_record'},
 {...stub('longtail'),marketListingConfirmed:false,officialProductIdentityConfirmed:false}]);
 assert.equal(r.wave,'seed_sufficient_to_pause');
 assert.equal(r.backlogCount,1);
 assert.equal(r.marketCoverageCertified,false);
});
test('never auto-enrich discontinued model',()=>{
 const r=planProductPopulation(ctx,[{...stub('retired'),verifiedDiscontinued:true},stub('active')]);
 assert.equal(r.candidates[0].disposition,'excluded_by_verified_lifecycle');
 assert.deepEqual(r.selectedForEnrichment,['active']);
});
test('reject cross-market records or invalid inputs',()=>{
 assert.throws(()=>planProductPopulation(ctx,[{...stub('x'),market:'us'}]));
 assert.throws(()=>planProductPopulation({...ctx,enrichmentBudget:-1},[]));
});
test('stock events are not manufacturing lifecycle evidence and are rejected',()=>{
 assert.throws(()=>assessProductLifecycle('uk',[{sourceId:'shop',kind:'retailer_out_of_stock' as any,
 verified:true,market:'uk',verifiedAt:'2026-10-10T00:00:00Z'}]));
});
test('verified manufacturer discontinuation preserves product archive and suppresses current competition',()=>{
 const r=assessProductLifecycle('uk',[{sourceId:'manufacturer_notice',kind:'manufacturer_discontinued_notice',
 verified:true,market:'uk',verifiedAt:'2026-10-10T00:00:00Z'}]);
 assert.equal(r.modelState,'discontinued');
 assert.equal(r.eligibleForCurrentProductCompetition,false);
 assert.equal(r.productPage,'archive_greyed_out');
});
test('authoritative current and discontinued conflict requires investigation, does not silently archive',()=>{
 const records=['manufacturer_discontinued_notice','manufacturer_current_listing'].map((kind,i)=>
  ({sourceId:`s${i}`,kind:kind as 'manufacturer_discontinued_notice'|'manufacturer_current_listing',verified:true,
    market:'uk',verifiedAt:'2026-10-10T00:00:00Z'}));
 const r=assessProductLifecycle('uk',records);
 assert.equal(r.modelState,'discontinued');
 assert.equal(r.eligibleForCurrentProductCompetition,false);
 assert.equal(r.needsVerification,true);
});
test('launch announcement is not independent test evidence',()=>{
 const r=assessProductLifecycle('uk',[{sourceId:'launch',kind:'new_model_announced',
 verified:true,market:'uk',verifiedAt:'2026-10-10T00:00:00Z'}]);
 assert.equal(r.newModelNeedsIndependentTests,true);
 assert.equal(r.modelState,'uncertain');
});
test('unconfirmed identities enter cheap verification rather than expensive full enrichment',()=>{
 const p={...stub('uncertain'),officialProductIdentityConfirmed:false};
 const r=planProductPopulation({...ctx,reviewedFamilyIds:[]},[p]);
 assert.deepEqual(r.selectedForEnrichment,[]);
 assert.equal(r.candidates[0].disposition,'confirm_identity_first');
});
