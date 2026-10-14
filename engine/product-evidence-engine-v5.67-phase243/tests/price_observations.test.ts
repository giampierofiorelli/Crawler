import test from 'node:test';
import assert from 'node:assert/strict';
import {quarantinePriceFeed,summarizeMerchantHistory,type PriceFeedSource,type PriceObservation} from '../src/price_observations.js';
const asOf='2026-10-10T12:00:00Z';
const source:PriceFeedSource={sourceId:'licensed-feed',merchantId:'shopA',permission:'authorized',
 permissionEvidenceUrl:'https://example.org/licensing/contract',allowedUses:['price_display','price_history'],market:'EU',currency:'EUR'};
const obs:PriceObservation={observationId:'obs-1',sourceId:'licensed-feed',merchantId:'shopA',variantId:'sku-eu-1',
 identityVerified:true,market:'EU',currency:'EUR',condition:'new',itemPrice:100,shippingPrice:5,taxesIncluded:true,
 availability:'in_stock',observedAt:'2026-10-10T10:00:00Z',productUrl:'https://example.org/product',deliveryDays:2};
const ingest=(o:PriceObservation[],s:PriceFeedSource[]=[source])=>quarantinePriceFeed(s,o,asOf);
const reject=(change:Partial<PriceObservation>,expected:string)=>{
 const r=ingest([{...obs,...change}]);assert.equal(r.accepted.length,0);assert.equal(r.rejected[0].reason,expected);
};
test('authorized observation is quarantined, not published',()=>{const r=ingest([obs]);assert.equal(r.status,'quarantined');assert.equal(r.accepted.length,1);});
test('unknown and prohibited permissions denied',()=>{for(const permission of ['unknown','prohibited','expired'] as const){const r=ingest([obs],[{...source,permission}]);assert.equal(r.rejected[0].reason,'rights_not_verified');}});
test('rights need documentary URL and both permitted uses',()=>{for(const s of [{...source,permissionEvidenceUrl:null},{...source,allowedUses:['price_display' as const]}]){assert.equal(ingest([obs],[s]).accepted.length,0);}});
test('expired rights denied',()=>{assert.equal(ingest([obs],[{...source,expiresAt:'2026-10-09T12:00:00Z'}]).rejected[0].reason,'source_permission_expired');});
test('wrong merchant or market is denied',()=>{reject({merchantId:'shopB'},'source_scope_mismatch');reject({market:'US'},'source_scope_mismatch');});
test('unverified SKU is denied',()=>reject({identityVerified:false},'variant_not_verified'));
test('tax or shipping uncertainty denied',()=>{reject({taxesIncluded:false},'landed_price_incomplete');reject({shippingPrice:null},'landed_price_incomplete');});
test('negative and nonfinite prices denied',()=>{reject({itemPrice:-1},'landed_price_incomplete');reject({itemPrice:NaN},'landed_price_incomplete');});
test('future and stale observations denied',()=>{reject({observedAt:'2026-10-11T00:00:00Z'},'invalid_or_out_of_range_timestamp');reject({observedAt:'2020-01-01T00:00:00Z'},'invalid_or_out_of_range_timestamp');});
test('insecure and credential-bearing URLs denied',()=>{reject({productUrl:'http://example.org/p'},'invalid_product_url');reject({productUrl:'https://user:secret@example.org/p'},'invalid_product_url');});
test('duplicate observation IDs denied',()=>{const r=ingest([obs,obs]);assert.equal(r.accepted.length,1);assert.equal(r.rejected[0].reason,'duplicate_or_missing_observation_id');});
test('distinct observation IDs can share a timestamp',()=>{const r=ingest([obs,{...obs,observationId:'obs-2'}]);assert.equal(r.accepted.length,2);});
test('missing source denied',()=>reject({sourceId:'other'},'unknown_source'));
const policy={asOf,lookbackDays:10,minDistinctDays:5,minDayCoverage:0.5,maxGapDays:4};
const series=(dates:string[],merchantId='shopA')=>dates.map((d,i)=>({...obs,observationId:`x-${i}`,merchantId,
 observedAt:`${d}T10:00:00Z`,itemPrice:100+i}));
test('dense single-merchant series yields descriptive median only',()=>{
 const r=summarizeMerchantHistory(series(['2026-10-01','2026-10-03','2026-10-05','2026-10-07','2026-10-09']),
 'sku-eu-1','shopA','EU','EUR',policy);
 assert.equal(r.status,'descriptive_only');assert.equal(r.observedMedian,107);assert.equal(r.sampleDays,5);
});
test('sparse series cannot produce median',()=>{
 const r=summarizeMerchantHistory(series(['2026-10-01','2026-10-09']),
 'sku-eu-1','shopA','EU','EUR',policy);
 assert.equal(r.observedMedian,null);assert.ok(r.warnings.includes('too_few_observed_days'));
});
test('duplicate same-day snapshots count once',()=>{
 const r=summarizeMerchantHistory([obs,{...obs,observationId:'obs-2',itemPrice:90}],
 'sku-eu-1','shopA','EU','EUR',policy);assert.equal(r.sampleDays,1);
});
test('merchant panels cannot be blended',()=>{
 const data=[...series(['2026-10-01','2026-10-03','2026-10-05','2026-10-07','2026-10-09'],'shopA'),
 ...series(['2026-10-02','2026-10-04','2026-10-06','2026-10-08','2026-10-10'],'shopB')];
 const r=summarizeMerchantHistory(data,'sku-eu-1','shopA','EU','EUR',policy);
 assert.equal(r.sampleDays,5);
});
test('long gap blocks median even if enough days',()=>{
 const dates=['2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05'];
 const r=summarizeMerchantHistory(series(dates),'sku-eu-1','shopA','EU','EUR',{...policy,maxGapDays:2});
 assert.equal(r.status,'insufficient_coverage');assert.ok(r.warnings.includes('long_observation_gap'));
});
test('refurbished, different market and unverified observations excluded',()=>{
 const r=summarizeMerchantHistory([{...obs,condition:'refurbished'}, {...obs,market:'UK'}, {...obs,identityVerified:false}],
 'sku-eu-1','shopA','EU','EUR',policy);assert.equal(r.sampleDays,0);
});
test('invalid history policy fails closed',()=>assert.throws(()=>summarizeMerchantHistory([], 'x','m','EU','EUR',{...policy,minDayCoverage:2}),/Invalid history policy/));
