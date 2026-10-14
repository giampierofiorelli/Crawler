import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverTradeoffs } from '../src/tradeoffs.js';
import type { Dimension, Evidence, Request, Variant } from '../src/types.js';

const variants:Variant[] = [
 {id:'basic',familyId:'b',sku:'SYN-B',market:'EU',currency:'EUR',price:99,specifications:{widthCm:30,portable:true}},
 {id:'better',familyId:'c',sku:'SYN-C',market:'EU',currency:'EUR',price:114,specifications:{widthCm:30,portable:true}},
 {id:'saving',familyId:'d',sku:'SYN-D',market:'EU',currency:'EUR',price:80,specifications:{widthCm:30,portable:true}},
 {id:'wide',familyId:'e',sku:'SYN-E',market:'EU',currency:'EUR',price:99,specifications:{widthCm:32,portable:true}},
 {id:'too-wide',familyId:'f',sku:'SYN-F',market:'EU',currency:'EUR',price:99,specifications:{widthCm:40,portable:true}},
 {id:'us',familyId:'g',sku:'SYN-G',market:'US',currency:'USD',price:99,specifications:{widthCm:30,portable:true}},
 {id:'unverified',familyId:'h',sku:'SYN-H',market:'EU',currency:'EUR',price:110,specifications:{widthCm:30,portable:true}},
 {id:'wrong-feature',familyId:'i',sku:'SYN-I',market:'EU',currency:'EUR',price:112,specifications:{widthCm:30,portable:false}}
];
const values:Record<string,number>={basic:7,better:9,saving:6.8,wide:9.2,'too-wide':10,us:10,unverified:10,'wrong-feature':10};
const dimensions:Dimension[]=['carpet','pet_hair','ease'];
const evidence:Evidence[]=Object.entries(values).flatMap(([id,value])=>dimensions.map(d=>({
 id:`${id}-${d}`,originalTestId:`${id}-${d}-test`,source:'SYNTHETIC',sourceUrl:'https://example.org/test',
 testedVariantId:id,applicableVariantIds:[id],dimension:d,value,scale:'synthetic_0_10' as const,
 protocolId:'synthetic-v1',conditions:{mode:'fixture'},status:'admitted' as const,
 rights:(id==='unverified'?'unknown':'authorized') as Evidence['rights']
})));
const req:Request={market:'EU',currency:'EUR',maxPrice:100,requiredSpecifications:{widthCm:30,portable:true},weights:{carpet:30,pet_hair:40,ease:30}};
const go=(options:Parameters<typeof discoverTradeoffs>[3]={},es=evidence,r=req)=>discoverTradeoffs(variants,es,r,{enabled:true,...options});

test('opt-in is required and primary ranking never changes',()=>{
 const disabled=discoverTradeoffs(variants,evidence,req);
 assert.equal(disabled.suggestions.length,0);
 assert.deepEqual(go({budgetIsHard:false}).primary,disabled.primary);
});
test('hard budget cannot be relaxed',()=>{
 assert.ok(!go({budgetIsHard:true}).suggestions.some(s=>s.kind==='spend_a_little_more'));
});
test('soft budget surfaces justified near-miss and keeps it outside primary',()=>{
 const r=go({budgetIsHard:false});
 const s=r.suggestions.find(s=>s.variantId==='better');
 assert.equal(s?.kind,'spend_a_little_more');
 assert.equal(s?.priceDifference,15);
 assert.ok(s?.evidenceIds.length===3);
 assert.ok(!r.primary.candidates.some(c=>c.variantId==='better'));
});
test('small benefit and expensive alternatives are rejected',()=>{
 const r=go({budgetIsHard:false,minScoreGain:3,maxExtraPriceAbsolute:10});
 assert.ok(!r.suggestions.some(s=>s.kind==='spend_a_little_more'));
});
test('cheaper near-equivalent option is also surfaced',()=>{
 const r=go();assert.equal(r.suggestions.find(s=>s.variantId==='saving')?.kind,'save_with_similar_fit');
});
test('flexible width allows only small overage, while price stays strict',()=>{
 const r=go({flexibleSizeLimits:{widthCm:{maxExtraAbsolute:3,maxExtraPercent:10}}});
 assert.equal(r.suggestions.find(s=>s.variantId==='wide')?.kind,'slightly_larger');
 assert.ok(!r.suggestions.some(s=>s.variantId==='too-wide'));
 assert.ok(!r.primary.candidates.some(c=>c.variantId==='wide'));
});
test('size not marked flexible is never relaxed',()=>{
 assert.ok(!go().suggestions.some(s=>s.kind==='slightly_larger'));
});
test('no cross-market transfer, hard feature relaxation, or unlicensed evidence',()=>{
 const r=go({budgetIsHard:false,flexibleSizeLimits:{widthCm:{maxExtraAbsolute:3,maxExtraPercent:10}}});
 for(const id of ['us','unverified','wrong-feature']) assert.ok(!r.suggestions.some(s=>s.variantId===id));
});
test('no complete baseline prevents superiority claim',()=>{
 const r=go({budgetIsHard:false},evidence.filter(e=>!(e.testedVariantId==='basic'&&e.dimension==='pet_hair')&&e.testedVariantId!=='saving'));
 assert.equal(r.suggestions.length,0);
 assert.ok(r.warnings.some(w=>w.includes('baseline')));
});
test('invalid thresholds and unknown size keys fail closed',()=>{
 assert.throws(()=>go({maxExtraPricePercent:-1}),/nonnegative/);
 assert.throws(()=>go({flexibleSizeLimits:{heightCm:{maxExtraAbsolute:2,maxExtraPercent:10}}}),/No size constraint/);
});
test('out-of-filter evidence must be complete and authorized',()=>{
 const r=go({budgetIsHard:false},evidence.filter(e=>!(e.testedVariantId==='better'&&e.dimension==='pet_hair')));
 assert.ok(!r.suggestions.some(s=>s.variantId==='better'));
});
