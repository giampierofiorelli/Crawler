import test from 'node:test';
import assert from 'node:assert/strict';
import * as launch from '../src/index.js';
import { resolveLaunchPurchaseLinks, type PurchaseLinkApprovalRecord } from '../src/launch_purchase.js';
import type { ApprovedPurchaseLink } from '../src/purchase_links.js';
import type { RankingResult } from '../src/types.js';
const ranking: RankingResult = { winnerId:'A', outcome:'candidate',warnings:[], candidates:[
 {variantId:'A',score:9,coverage:1,dimensionScores:{},usedEvidenceIds:[],notes:[]},
 {variantId:'B',score:8,coverage:1,dimensionScores:{},usedEvidenceIds:[],notes:[]} ]};
const offer: ApprovedPurchaseLink = { variantId:'B',market:'UK',retailer:'amazon',retailerName:'Amazon',url:'https://www.amazon.co.uk/dp/B012345678?tag=sample-21',amazonAssociateTag:'sample-21',exactVariantVerified:true,independentlySourced:true,rightsApproved:true,destinationApproved:true };
const approval: PurchaseLinkApprovalRecord = {id:'review-1',variantId:'B',market:'UK',retailer:'amazon',destinationUrl:offer.url,reviewer:'human',approvedAt:'2026-10-01T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z',evidenceReference:'evidence-1',merchantAgreementReference:'agreement-1',exactVariantEvidenceReference:'variant-1',sourceRightsReference:'rights-1',status:'approved'};
const now='2026-10-10T12:00:00Z';
test('launch gate fails closed without review and does not change fit ranking',()=>{
 const out=resolveLaunchPurchaseLinks(ranking,'UK',[offer],[],now);
 assert.strictEqual(out.ranking,ranking);
 assert.equal(out.ranking.winnerId,'A');
 assert.equal(out.linksByVariant.B.length,0);
 assert.equal(out.rejectedApprovalIds.length,1);
});
test('launch gate accepts exactly one documented unexpired approval',()=>{
 const out=resolveLaunchPurchaseLinks(ranking,'UK',[offer],[approval],now);
 assert.equal(out.linksByVariant.B.length,1);
 assert.equal(out.linksByVariant.A.length,0);
});
test('draft, revoked, expired, incomplete and ambiguous approvals fail closed',()=>{
 for (const altered of [{...approval,status:'draft' as const},{...approval,status:'revoked' as const},
 {...approval,expiresAt:'2026-10-09T00:00:00Z'},{...approval,merchantAgreementReference:''}]) {
  assert.equal(resolveLaunchPurchaseLinks(ranking,'UK',[offer],[altered],now).linksByVariant.B.length,0);
 }
 assert.equal(resolveLaunchPurchaseLinks(ranking,'UK',[offer],[approval,approval],now).linksByVariant.B.length,0);
});
test('review must match exact destination, variant, retailer and market',()=>{
 for(const altered of [{...approval,destinationUrl:approval.destinationUrl+'&x=1'},
  {...approval,variantId:'A'},{...approval,market:'US'},{...approval,retailer:'other' as const}]) {
  assert.equal(resolveLaunchPurchaseLinks(ranking,'UK',[offer],[altered],now).linksByVariant.B.length,0);
 }
});
test('production entrypoint does not expose price timing or history functionality',()=>{
 assert.equal('assessPurchaseDecision' in launch,false);
 assert.equal('authorizeCommercialUse' in launch,false);
 assert.equal('resolveLaunchPurchaseLinks' in launch,true);
});
