/** Constructed deterministic scheduler exercising budget & recovery; NOT live web / quality test. */
import {writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {planBudgetedCategoryWave243,freezeWave243,validateSnapshot243,evaluatePausedMisses243}
 from '../dist/src/phase243_budgeted_category_search.js';
const x='9'.repeat(64);
const ctx={categoryId:'air_fryers',market:'uk',scopeKey:'air_fryers_uk_general',
 asOf:'2026-10-14T12:30:00Z',waveOrdinal:1,recoveryMode:'normal',
 explicitUserNeedProductIds:[],changedSourceRevisionProductIds:[],
 population:{categoryId:'air_fryers',market:'uk',enrichmentBudget:0,
  independentDiscoveryPasses:1,discoveredNewPlausibleInRecentPasses:2,
  reviewedFamilyIds:['basket','oven','dual'],demandMode:'general_launch_seed'},
 policy:{version:'demo_lean_v1',effortBudget:40,minimumCredibleCandidateCount:3,
  reservedTailActionPercent:20,auditSuspendedMaxPerWave:2,auditEveryNWaves:5,
  mode:'lean_bootstrap',unitCost:{identity:1,cheap_screen:1,deep_review:5,revisit:2}}};
const models=Array.from({length:90},(_,i)=>{
 const id=`fictional_model_${String(i).padStart(3,'0')}`;
 const source=(kind,n)=>({kind,originalSourceId:`fixture_original_${i}_${n}`,
  publisherId:`fictional_publisher_${n}`,sourceRevisionHash:x,
  reviewedOriginalMethod:kind.startsWith('reviewed_original_test'),
  reviewedForExactVariantAndMarket:kind.startsWith('reviewed_original_test'),
  productId:id,market:'uk'});
 const state=i<45?'unseen':i<75?'cheap_screened':i<80?'suspended':'deep_reviewed';
 const signals=[];
 if(i>=45&&i<53)signals.push(source('reviewed_original_test_problem',0));
 if(i>=53&&i<60)signals.push(source('community_complaint_lead',1),source('community_complaint_lead',2));
 if(i>=60&&i<68)signals.push(source('community_complaint_lead',1));
 if(i>=70&&i<75)signals.push(source('reviewed_original_test_strength',0));
 if(i>=80&&i<83)signals.push(source('reviewed_original_test_strength',0));
 const listed=i%3===0;
 return {product:{id,categoryId:'air_fryers',market:'uk',familyId:['basket','oven','dual'][i%3],
  stage:'discovery_stub',editorialAppearances:listed?[{publisherId:'fictional_professional_lab',
   originalListId:`fictional_list_${i}`,type:'professionally_tested_shortlist',
   prominence:'included',independentPublisherAttested:true}]:[],
  officialProductIdentityConfirmed:true,marketListingConfirmed:true,
  novelVerifiedTechnicalFeature:i%10===0,explicitNeedTriggered:false,validatedNicheFit:false,
  verifiedDiscontinued:false},researchState:state,signals,
  suspendedUnderScope:state==='suspended'?'air_fryers_uk_general':null,
  reviewedHighPotential:i>=80&&i<83};
});
const first=planBudgetedCategoryWave243(ctx,models);
const fifth=planBudgetedCategoryWave243({...ctx,waveOrdinal:5},models);
const recovery=planBudgetedCategoryWave243({...ctx,recoveryMode:'review_suspended_due_to_shortage'},
 models.map(m=>({...m,reviewedHighPotential:false})));
const hash=freezeWave243(first,x);
if(!validateSnapshot243(hash))throw Error('snapshot validation');
const triageCounts=Object.fromEntries([...new Set(first.productDecisions.map(x=>x.triage))]
 .sort().map(k=>[k,first.productDecisions.filter(x=>x.triage===k).length]));
const pilot={schema:'pee243.constructed-evaluation.v1',fixtureOnly:true,
 originalWebPagesFetched:0,realModelsTested:0,measuredCrawlerOrLLMLatency:false,
 category:'fictional_air_fryers',inputCount:models.length,
 effortUnitsNotDollars:true,config:ctx.policy,firstWave:{
 budget:ctx.policy.effortBudget,spent:first.spentEffortUnits,unused:first.remainingEffortUnits,
 actions:first.choices.length,byAction:Object.fromEntries(['verify_identity','cheap_screen','deep_review','revisit_suspended']
 .map(k=>[k,first.choices.filter(c=>c.action===k).length])),triageCounts,remainingDiscoveryMandatory:first.discoveryMustContinue,
 rankingAuthorized:first.rankingAuthorized},
 periodicAudit:{waveNumber:5,auditedSuspendedCount:fifth.auditedSuspendedCount,
 spentUnits:fifth.spentEffortUnits},recovery:{revisited:recovery.choices.filter(x=>x.action==='revisit_suspended').length,
 shortageTriggered:recovery.shortageTriggersRevisit},hashValidated:true,
 auditedOutcomeExample:evaluatePausedMisses243(first,[]),
 limitation:'Synthetic inputs and human-defined signals; does not estimate actual savings, precision, recall, latency or USD cost.'};
writeFileSync('evaluation/phase243/CONSTRUCTED-90-CANDIDATE-PILOT.json',JSON.stringify(pilot,null,2)+'\n');
console.log(JSON.stringify(pilot,null,2));
