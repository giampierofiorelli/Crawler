import test from 'node:test';
import assert from 'node:assert/strict';
import {authorizeCommercialUse,authorizeAll,type CommercialGrant} from '../src/commercial_rights.js';
const NOW='2026-10-10T12:00:00Z';
const base:CommercialGrant={provider:'awin',status:'approved',market:'GB',permittedUses:['current_price_display','cross_merchant_comparison'],signedAgreementId:'signed-contract-123',reviewedBy:'legal-reviewer',reviewedAt:'2026-10-09T10:00:00Z',validFrom:'2026-10-09T10:00:00Z',validUntil:'2027-10-09T10:00:00Z'};
const check=(g:CommercialGrant|undefined,u:'current_price_display'|'history_storage'|'price_alert'|'cross_merchant_comparison'='current_price_display')=>authorizeCommercialUse(g,g?.provider??'awin',u,'GB',NOW);
test('no grant defaults deny',()=>assert.deepEqual(check(undefined).reasons,['no_grant']));
test('approved and scoped written grant permits exactly authorized use',()=>assert.equal(check(base).authorized,true));
test('history rights are separate from current price rights',()=>assert.equal(check(base,'history_storage').authorized,false));
test('market mismatch denied',()=>assert.equal(authorizeCommercialUse(base,'awin','current_price_display','US',NOW).authorized,false));
test('missing signed agreement denied',()=>assert.equal(check({...base,signedAgreementId:null}).authorized,false));
test('revocation denies even within term',()=>assert.equal(check({...base,status:'revoked'}).authorized,false));
test('expired agreement denied',()=>assert.equal(check({...base,validUntil:'2026-10-09T10:00:00Z'}).authorized,false));
test('Amazon current display requires explicit use case review',()=>assert.ok(check({...base,provider:'amazon'}).reasons.includes('amazon_use_case_not_cleared')));
test('Amazon history needs both tracking and aggregation exceptions',()=>{
 const grant:CommercialGrant={...base,provider:'amazon',permittedUses:['history_storage'],amazonProductUseApprovalId:'amazon-approval'};
 const result=check(grant,'history_storage');
 assert.equal(result.authorized,false);
 assert.ok(result.reasons.includes('amazon_price_tracking_exception_missing'));
 assert.ok(result.reasons.includes('amazon_aggregation_exception_missing'));
});
test('Amazon exceptions can be represented but are not presumed',()=>{
 const grant:CommercialGrant={...base,provider:'amazon',permittedUses:['history_storage'],amazonProductUseApprovalId:'review',amazonPriceTrackingExceptionId:'signed-exception',amazonAggregationExceptionId:'signed-aggregation'};
 assert.equal(check(grant,'history_storage').authorized,true);
});
test('Google Merchant pricing reports denied even with nominal grant',()=>assert.equal(check({...base,provider:'google_merchant'}).authorized,false));
test('multiple grants ambiguous: no cherry picking',()=>assert.ok(authorizeAll([base,base],'awin',['current_price_display'],'GB',NOW).reasons.includes('ambiguous_grants')));
