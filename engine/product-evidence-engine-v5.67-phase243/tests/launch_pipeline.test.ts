import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLaunchRecommendation, type LaunchVariant, type LaunchRequest } from '../src/launch_pipeline.js';
import type { Evidence } from '../src/types.js';
import { evidenceFingerprint, type EvidenceApproval } from '../src/evidence_review.js';
import type { ApprovedPurchaseLink } from '../src/purchase_links.js';
import type { PurchaseLinkApprovalRecord } from '../src/launch_purchase.js';

const variants: LaunchVariant[] = [
  {id:'A',familyId:'A',market:'UK',sku:'A',currency:'GBP',specifications:{battery_hours:11}},
  {id:'B',familyId:'B',market:'UK',sku:'B',currency:'GBP',specifications:{battery_hours:10}},
];
const evidence: Evidence[] = ['A','B'].map((id,i)=>({
  id:`e-${id}`,originalTestId:`t-${id}`,source:'Independent synthetic source',
  sourceUrl:'https://example.org/test',testedVariantId:id,applicableVariantIds:[id],
  dimension:'carpet',value:9-i,scale:'synthetic_0_10',protocolId:'p1',conditions:{},
  status:'admitted',rights:'authorized',
}));
const request: LaunchRequest = {market:'UK',currency:'GBP',weights:{carpet:1,pet_hair:0,ease:0}};
const offer: ApprovedPurchaseLink = {
  variantId:'B',market:'UK',retailer:'amazon',retailerName:'Amazon',
  url:'https://www.amazon.co.uk/dp/B012345678?tag=sample-21',amazonAssociateTag:'sample-21',
  exactVariantVerified:true,independentlySourced:true,rightsApproved:true,destinationApproved:true,
};
const approval: PurchaseLinkApprovalRecord = {
  id:'approval-B',variantId:'B',market:'UK',retailer:'amazon',destinationUrl:offer.url,
  reviewer:'reviewer',approvedAt:'2026-10-01T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z',
  evidenceReference:'evidence-ref',merchantAgreementReference:'merchant-ref',
  exactVariantEvidenceReference:'variant-ref',sourceRightsReference:'rights-ref',status:'approved',
};
const evidenceApprovals: EvidenceApproval[] = evidence.map(e=>({
  id:`review-${e.id}`,evidenceId:e.id,evidenceFingerprint:evidenceFingerprint(e),
  status:'approved',reviewer:'synthetic-reviewer',publisherType:'independent_testing',reviewedAt:'2026-10-01T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z',
  publisherIdentityReference:'demo-publisher-document', commercialReuseGrantReference:'demo-license-document',
  testMethodologyReference:'demo-protocol-document', originalTestReference:'demo-test-document',exactTestedVariantReference:'demo-variant-document',
}));
const base = {variants,evidence,evidenceApprovals,purpose:'synthetic_demo' as const,request,nowIso:'2026-10-10T12:00:00Z'};
const run=(extra:Record<string, unknown>={}) => buildLaunchRecommendation({...base,offers:[],approvals:[],...extra});

test('product ranking completes before independently approved retailer links',()=>{
  const baseline=run();
  const linked=run({offers:[offer],approvals:[approval]});
  assert.equal(baseline.winnerId,'A');
  assert.equal(linked.winnerId,baseline.winnerId);
  assert.deepEqual(linked.candidates.map(c=>[c.variantId,c.score,c.coverage]),baseline.candidates.map(c=>[c.variantId,c.score,c.coverage]));
  assert.equal(linked.candidates.find(c=>c.variantId==='B')?.purchaseLinks.length,1);
  assert.equal(linked.candidates.find(c=>c.variantId==='A')?.purchaseLinks.length,0);
});
test('missing merchant approval fails closed without removing ranked products',()=>{
  const result=run({offers:[offer]});
  assert.equal(result.candidates.length,2);
  assert.equal(result.candidates.reduce((n,c)=>n+c.purchaseLinks.length,0),0);
  assert.equal(result.rejectedApprovalIds.length,1);
});
test('independent scores and winner remain identical with legacy price properties of any value',()=>{
  const baseline=run();
  for(const a of [-1,0,1,123456,Number.NaN,Infinity]) {
    const legacy = variants.map((v,i)=>({...v,price:i===0?a:42, manufacturerRrp:i===0?1:999999}));
    const result=run({variants:legacy});
    assert.equal(result.winnerId,baseline.winnerId);
    assert.deepEqual(result.candidates,baseline.candidates);
    assert.ok(!JSON.stringify(result).includes('123456'));
  }
});
test('launch output has no price, budget band, historic tracking, or purchase timing',()=>{
  const result=run({offers:[offer],approvals:[approval]});
  const output=JSON.stringify(result);
  for(const name of ['"price"','"budgetReference"','"purchaseTiming"','"history"','"manufacturerListPrices"']) {
    assert.equal(output.includes(name),false,name);
  }
  assert.ok(result.warnings.some(w=>w.includes('Price and budget filtering are not offered')));
});
test('launch rejects legacy budget and manufacturer-list-price payloads instead of silently ignoring them',()=>{
  assert.throws(()=>run({request:{...request,maxPrice:100}}),/Price and budget filtering are disabled/);
  for(const field of ['manufacturerListPrices','manufacturerPublishers','manufacturerPriceApprovals',
    'budgetPreference','flexibleStretchPercent','priceHistory','currentPrices','purchaseTiming']) {
    assert.throws(()=>run({[field]:[]}),/Price-related launch input is disabled/);
  }
});
test('pricing and merchant specs cannot affect ranking even when disguised as product specifications',()=>{
  const baseline=run();
  const manipulated=run({variants:variants.map((v,i)=>({...v,specifications:{...v.specifications,
    msrp:i?100:1000,retailer_available:i?true:false,amazon_price:i?1:999}}))});
  assert.deepEqual(manipulated.candidates,baseline.candidates);
  for (const key of ['msrp','retailer_available','amazon_price','discount']) {
    assert.throws(()=>run({request:{...request,requiredSpecifications:{[key]:5}}}),/cannot be used as launch filters/);
  }
});
test('valid nonfinancial hard specification constraints remain active',()=>{
  const result=run({request:{...request,requiredSpecifications:{battery_hours:10}}});
  assert.deepEqual(result.candidates.map(c=>c.variantId),['B']);
});
test('price-free pipeline does not mutate source arrays or merchant approvals',()=>{
  const before=JSON.stringify({variants,evidence,request,offer,approval});
  run({offers:[offer],approvals:[approval]});
  assert.equal(JSON.stringify({variants,evidence,request,offer,approval}),before);
});

test('missing evidence rights review fails closed and cannot create a winner',()=>{
  const out=run({evidenceApprovals:[]});
  assert.equal(out.winnerId,null);
  assert.equal(out.outcome,'insufficient_evidence');
  assert.equal(out.rejectedEvidence.length,2);
});
test('a score tampered after reviewer approval is excluded',()=>{
  const changed=evidence.map((e,i)=>i?e:{...e,value:10});
  const out=run({evidence:changed});
  assert.equal(out.rejectedEvidence.length,1);
  assert.equal(out.rejectedEvidence[0].reason,'review_does_not_match_evidence');
});
test('launch only operates in explicitly marked nonpublishable demonstration mode',()=>{
  assert.throws(()=>run({purpose:'public'}),/Production ranking disabled/);
  assert.throws(()=>run({purpose:undefined}),/Production ranking disabled/);
  const result=run();
  assert.equal(result.publicationReady,false);
  assert.equal(result.purpose,'synthetic_demo');
});
