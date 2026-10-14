import test from 'node:test';
import assert from 'node:assert/strict';
import {auditCoverage,type PilotInput} from '../src/coverage_pilot.js';
const now='2026-10-10T12:00:00Z';
const empty: PilotInput={market:'GB',asOf:now,maxAgeHours:24,variants:[],offers:[],grants:[]};
test('empty pilot never claims coverage',()=>{
 const r=auditCoverage(empty);assert.equal(r.denominator,0);assert.ok(r.warnings.length);assert.ok(r.providers.every(p=>p.publishableCoverage===0));
});
test('only exact variant identity contributes to matching coverage',()=>{
 const r=auditCoverage({...empty,variants:[{variantId:'UK-1',market:'GB',category:'vacuum',identityReviewed:true}],offers:[{provider:'awin',variantId:'UK-1',merchantId:'store',exactVariantVerified:false,totalPriceVerified:true,inStock:true,observedAt:now,condition:'new'}]});
 assert.equal(r.providers.find(p=>p.provider==='awin')?.matchingCoverage,0);
});
test('current offer with no verified rights is not publishable',()=>{
 const r=auditCoverage({...empty,variants:[{variantId:'UK-1',market:'GB',category:'vacuum',identityReviewed:true}],offers:[{provider:'amazon',variantId:'UK-1',merchantId:'amazon',exactVariantVerified:true,totalPriceVerified:true,inStock:true,observedAt:now,condition:'new'}]});
 const a=r.providers.find(p=>p.provider==='amazon')!;assert.equal(a.matchingCoverage,1);assert.equal(a.publishableCoverage,0);assert.equal(a.rights,'blocked');
});
test('stale offer does not count as fresh',()=>{
 const r=auditCoverage({...empty,variants:[{variantId:'UK-1',market:'GB',category:'vacuum',identityReviewed:true}],offers:[{provider:'awin',variantId:'UK-1',merchantId:'store',exactVariantVerified:true,totalPriceVerified:true,inStock:true,observedAt:'2026-10-01T12:00:00Z',condition:'new'}]});
 assert.equal(r.providers.find(p=>p.provider==='awin')?.freshCoverage,0);
});
test('duplicate variants rejected',()=>assert.throws(()=>auditCoverage({...empty,variants:[{variantId:'x',market:'GB',category:'a',identityReviewed:true},{variantId:'x',market:'GB',category:'a',identityReviewed:true}]})));
test('unverified variants excluded from denominator and flagged',()=>{
 const r=auditCoverage({...empty,variants:[{variantId:'x',market:'GB',category:'a',identityReviewed:false}],offers:[{provider:'ebay',variantId:'x',merchantId:'s',exactVariantVerified:true,totalPriceVerified:true,inStock:true,observedAt:now,condition:'new'}]});
 assert.equal(r.denominator,0);assert.ok(r.warnings.includes('offers_for_unverified_or_out_of_scope_variants_excluded'));
});
