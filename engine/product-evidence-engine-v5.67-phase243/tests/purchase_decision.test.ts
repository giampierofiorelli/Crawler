import test from 'node:test';
import assert from 'node:assert/strict';
import {assessPurchaseDecision, type DecisionInput} from '../src/purchase_decision.js';
const base:DecisionInput={
 fit:{winnerId:'A',outcome:'candidate',warnings:[],candidates:[
 {variantId:'A',score:9.4,coverage:1,dimensionScores:{},usedEvidenceIds:[],notes:[]},
 {variantId:'B',score:9.1,coverage:1,dimensionScores:{},usedEvidenceIds:[],notes:[]},
 {variantId:'C',score:9.8,coverage:0.5,dimensionScores:{},usedEvidenceIds:[],notes:[]}]},
 market:'EU',currency:'EUR',asOf:'2026-10-10T12:00:00Z',urgency:'immediate',maxDeliveryDays:3,maxOfferAgeHours:24,minHistoryDays:3,
 offers:[
 {variantId:'A',merchantId:'shop1',market:'EU',currency:'EUR',itemPrice:179,shipping:0,available:true,observedAt:'2026-10-10T10:00:00Z',condition:'new',deliveryDays:2},
 {variantId:'B',merchantId:'shop2',market:'EU',currency:'EUR',itemPrice:115,shipping:4,available:true,observedAt:'2026-10-10T10:00:00Z',condition:'new',deliveryDays:1}],
 history:[...['2026-10-01','2026-10-02','2026-10-03'].map(d=>({variantId:'A',currency:'EUR',market:'EU',condition:'new' as const,totalPrice:145,observedAt:`${d}T12:00:00Z`})),
 ...['2026-10-01','2026-10-02','2026-10-03'].map(d=>({variantId:'B',currency:'EUR',market:'EU',condition:'new' as const,totalPrice:139,observedAt:`${d}T12:00:00Z`}))]
};
const run=(changes:Partial<DecisionInput>={})=>assessPurchaseDecision({...base,...changes});
test('best-fit stays A even when B has favorable price',()=>{const r=run();assert.equal(r.bestFitVariantId,'A');assert.deepEqual(r.shortlist.map(x=>x.variantId),['A','B','C']);assert.equal(r.shortlist[0].timing,'above_observed_median');assert.equal(r.shortlist[1].timing,'below_observed_median');});
test('price includes shipping',()=>assert.equal(run().shortlist[1].bestOffer?.totalPrice,119));
test('urgent alternatives exclude incomplete evidence',()=>assert.deepEqual(run().immediateAlternatives,['A','B']));
test('no forced buy/wait advice for flexible user',()=>assert.deepEqual(run({urgency:'flexible'}).immediateAlternatives,[]));
test('stale offers are not actionable',()=>{const r=run({offers:base.offers.map(o=>({...o,observedAt:'2026-10-01T10:00:00Z'}))});assert.equal(r.shortlist[0].actionableNow,false);});
test('wrong market and refurbished offers are excluded',()=>{const r=run({offers:[{...base.offers[0],market:'US'},{...base.offers[1],condition:'refurbished'}]});assert.equal(r.shortlist[0].bestOffer,null);assert.equal(r.shortlist[1].bestOffer,null);});
test('delivery constraint excludes slow offers',()=>{const r=run({offers:base.offers.map(o=>({...o,deliveryDays:5}))});assert.equal(r.shortlist[0].actionableNow,false);});
test('few daily history observations produce no timing signal',()=>{const r=run({history:base.history.slice(0,2)});assert.equal(r.shortlist[0].timing,'insufficient_history');});
test('duplicate daily snapshots do not count as extra history days',()=>{const r=run({history:[...base.history.slice(0,2),...base.history.slice(0,2)]});assert.equal(r.shortlist[0].historySampleDays,2);});
test('future prices are excluded',()=>{const r=run({history:[{...base.history[0],observedAt:'2026-11-01T12:00:00Z'}]});assert.equal(r.shortlist[0].historySampleDays,0);});
test('invalid price is rejected',()=>assert.throws(()=>run({offers:[{...base.offers[0],itemPrice:-1}]}),/Invalid offer price/));
test('bad freshness policy rejected',()=>assert.throws(()=>run({maxOfferAgeHours:-2}),/Invalid freshness/));
test('does not mutate source ranking',()=>{const snapshot=JSON.stringify(base.fit);run();assert.equal(JSON.stringify(base.fit),snapshot);});
