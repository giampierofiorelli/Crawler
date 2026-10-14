import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePurchaseLinks, type ApprovedPurchaseLink } from '../src/purchase_links.js';
import type { RankingResult } from '../src/types.js';

const ranking: RankingResult = {winnerId:'A',outcome:'candidate',warnings:[],candidates:[
 {variantId:'A',score:9,coverage:1,dimensionScores:{},usedEvidenceIds:[],notes:[]},
 {variantId:'B',score:8,coverage:1,dimensionScores:{},usedEvidenceIds:[],notes:[]},
]};
const base: ApprovedPurchaseLink = {variantId:'A',market:'UK',retailer:'amazon',retailerName:'Amazon',url:'https://www.amazon.co.uk/dp/B012345678?tag=sample-21',amazonAssociateTag:'sample-21',exactVariantVerified:true,independentlySourced:true,rightsApproved:true,destinationApproved:true};
test('commercial resolution cannot alter ranking, even when winner has no offers',()=>{
 const before = JSON.stringify(ranking);
 const result = resolvePurchaseLinks(ranking,'UK',[{...base,variantId:'B'}]);
 assert.strictEqual(result.ranking,ranking);
 assert.equal(JSON.stringify(ranking),before);
 assert.equal(result.ranking.winnerId,'A');
 assert.equal(result.linksByVariant.A.length,0);
 assert.equal(result.linksByVariant.B.length,1);
});
test('only verified and approved exact-variant offers survive',()=>{
 for(const field of ['exactVariantVerified','independentlySourced','rightsApproved','destinationApproved'] as const){
  assert.equal(resolvePurchaseLinks(ranking,'UK',[{...base,[field]:false}]).linksByVariant.A.length,0);
 }
 assert.equal(resolvePurchaseLinks(ranking,'UK',[base]).linksByVariant.A.length,1);
});
test('Amazon links require canonical UK product destination and matching affiliate tag',()=>{
 for(const url of ['https://www.amazon.co.uk/dp/B012345678?tag=wrong-21',
  'https://www.amazon.co.uk/s?k=vacuum&tag=sample-21',
  'https://evil.test/dp/B012345678?tag=sample-21',
  'http://www.amazon.co.uk/dp/B012345678?tag=sample-21',
  'https://www.amazon.co.uk@evil.test/dp/B012345678?tag=sample-21']) {
  assert.equal(resolvePurchaseLinks(ranking,'UK',[{...base,url}]).linksByVariant.A.length,0,url);
 }
});
test('other retailer links must be independently approved, and cannot masquerade as Amazon',()=>{
 const other: ApprovedPurchaseLink={...base,retailer:'other',retailerName:'Example shop',url:'https://example.org/item/123',amazonAssociateTag:undefined};
 assert.equal(resolvePurchaseLinks(ranking,'UK',[other]).linksByVariant.A.length,1);
 assert.equal(resolvePurchaseLinks(ranking,'UK',[{...other,url:base.url}]).linksByVariant.A.length,0);
});
test('market mismatch and unranked variants are omitted',()=>{
 assert.equal(resolvePurchaseLinks(ranking,'UK',[{...base,market:'US'},{...base,variantId:'C'}]).linksByVariant.A.length,0);
});
