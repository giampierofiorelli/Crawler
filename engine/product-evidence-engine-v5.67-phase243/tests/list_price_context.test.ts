import test from 'node:test';
import assert from 'node:assert/strict';
import { assessManufacturerListPrices, type ManufacturerListPriceRecord } from '../src/list_price_context.js';
const record: ManufacturerListPriceRecord = {
  variantId:'A',market:'UK',currency:'GBP',amount:120,sourceKind:'manufacturer',
  sourceUrl:'https://manufacturer.example/official',verifiedAt:'2026-10-01T00:00:00Z',
  validUntil:'2026-11-01T00:00:00Z',rights:'authorized',exactVariantVerified:true,
  reviewer:'editor',evidenceReference:'manufacturer-doc-1',
};
const base = {variantIds:['A','B'],records:[record],market:'UK' as const,currency:'GBP',budget:100,preference:'strict' as const,nowIso:'2026-10-10T12:00:00Z'};
test('verified manufacturer reference gives a band, not an actual price',()=>{
  const result=assessManufacturerListPrices(base);
  assert.equal(result.contextByVariant.A.band,'above_reference');
  assert.equal(result.contextByVariant.B.band,'unknown');
  assert.equal(JSON.stringify(result).includes('120'),false);
  assert.ok(result.warnings.some(x=>x.includes('Strict budget cannot be guaranteed')));
});
test('independent reference within budget is contextual only',()=>{
  assert.equal(assessManufacturerListPrices({...base,records:[{...record,amount:90}]}).contextByVariant.A.band,'within_reference');
});
test('ambiguous, unauthorized, stale, wrong market, wrong variant records fail closed',()=>{
  const cases: ManufacturerListPriceRecord[][] = [
    [record,record], [{...record,rights:'unknown'}], [{...record,rights:'prohibited'}],
    [{...record,validUntil:'2026-10-01T00:00:00Z'}], [{...record,market:'EU'}],
    [{...record,exactVariantVerified:false}], [{...record,sourceUrl:'http://invalid'}],
    [{...record,amount:NaN}], [{...record,reviewer:''}],
  ];
  for(const records of cases) assert.equal(assessManufacturerListPrices({...base,records}).contextByVariant.A.band,'unknown');
});
test('missing budget or none preference cannot produce a band',()=>{
  assert.equal(assessManufacturerListPrices({...base,budget:undefined}).contextByVariant.A.band,'unknown');
  assert.equal(assessManufacturerListPrices({...base,preference:'none'}).contextByVariant.A.band,'unknown');
});
test('invalid budget or timestamp rejected',()=>{
  assert.throws(()=>assessManufacturerListPrices({...base,budget:-1}));
  assert.throws(()=>assessManufacturerListPrices({...base,nowIso:'yesterday'}));
});
test('flexible budget marks a nearby official list reference without excluding or reprioritising products',()=>{
  const result=assessManufacturerListPrices({...base,preference:'flexible',flexibleStretchPercent:20});
  assert.equal(result.contextByVariant.A.signal,'slightly_above_list_reference');
  assert.equal(result.contextByVariant.A.band,'above_reference');
  const farther=assessManufacturerListPrices({...base,preference:'flexible',flexibleStretchPercent:10});
  assert.equal(farther.contextByVariant.A.signal,'substantially_above_list_reference');
  assert.equal(assessManufacturerListPrices({...base,preference:'strict',flexibleStretchPercent:20}).contextByVariant.A.signal,'substantially_above_list_reference');
});
test('budget reference never treats unverified or mismatched list prices as affordability evidence',()=>{
  const result=assessManufacturerListPrices({...base,records:[{...record,rights:'unknown'}],preference:'flexible'});
  assert.equal(result.contextByVariant.A.signal,'unavailable');
  assert.equal(result.contextByVariant.B.signal,'unavailable');
});
test('flexible tolerance is bounded and validated',()=>{
  for(const value of [-1,31,Infinity,NaN]) assert.throws(()=>assessManufacturerListPrices({...base,flexibleStretchPercent:value}));
});
test('audit rejects future verification, inverted dates and unsafe evidence URLs', async () => {
  const { auditManufacturerListPrices } = await import('../src/list_price_context.js');
  const cases: Array<[Partial<ManufacturerListPriceRecord>, string]> = [
    [{verifiedAt:'2026-10-11T00:00:00Z'},'invalid_dates'],
    [{verifiedAt:'2026-10-20T00:00:00Z',validUntil:'2026-10-10T00:00:00Z'},'invalid_dates'],
    [{sourceUrl:'https://user:secret@manufacturer.example/a'},'invalid_source'],
    [{sourceUrl:'https://manufacturer.example/a#fragment'},'invalid_source'],
    [{sourceUrl:'https://localhost/a'},'invalid_source'],
    [{sourceUrl:'https://manufacturer.example:444/a'},'invalid_source'],
    [{validUntil:'2026-10-09T00:00:00Z'},'stale'],
  ];
  for (const [changes, reason] of cases) {
    const records=[{...record,...changes}];
    const audit=auditManufacturerListPrices({...base,records});
    assert.equal(audit[0].reason,reason);
    assert.equal(assessManufacturerListPrices({...base,records}).contextByVariant.A.signal,'unavailable');
    assert.ok(!JSON.stringify(audit).includes('120'));
  }
});
test('audit accepts only exact reviewed and authorized manufacturer references', async () => {
  const { auditManufacturerListPrices } = await import('../src/list_price_context.js');
  const result=auditManufacturerListPrices(base);
  assert.deepEqual(result,[{variantId:'A',accepted:true},{variantId:'B',accepted:false,reason:'missing'}]);
  assert.equal(auditManufacturerListPrices({...base,records:[record,record]})[0].reason,'ambiguous');
  assert.equal(auditManufacturerListPrices({...base,records:[{...record,rights:'unknown'}]})[0].reason,'invalid_rights');
});
