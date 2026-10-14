import test from 'node:test';
import assert from 'node:assert/strict';
import { rank } from '../src/engine.js';
import { variants,evidence } from '../examples/fixture.js';
import type { Evidence,Request } from '../src/types.js';
const req:Request = {market:'UK',currency:'GBP',weights:{carpet:15,pet_hair:70,ease:15}};
const run=(es:Evidence[]=evidence,r:Request=req)=>rank(variants,es,r);
test('different needs change the leading fully-covered candidate',()=>{
 assert.equal(run().winnerId,'B-UK');
 assert.equal(run(evidence,{...req,weights:{carpet:80,pet_hair:10,ease:10}}).winnerId,'A-UK');
});
test('missing critical evidence does not become zero or a winner',()=>{
 const c=run().candidates.find(c=>c.variantId==='C-UK')!;
 assert.equal(c.coverage,0.3);assert.equal(c.dimensionScores.pet_hair,undefined);
 assert.notEqual(run().winnerId,'C-UK');
});
test('UK request excludes US variants and their evidence',()=>{
 assert.equal(run().candidates.some(c=>c.variantId==='A-US'),false);
});
test('budget excludes out-of-budget products',()=>{
 assert.equal(run(evidence,{...req,maxPrice:200}).candidates.some(c=>c.variantId==='B-UK'),false);
});
test('duplicate articles sharing originalTestId do not change scoring',()=>{
 const duplicated={...evidence[0],id:'republished',source:'Second article',value:0};
 assert.deepEqual(run([...evidence,duplicated]).candidates,run().candidates);
});
test('unlicensed evidence cannot influence ranking',()=>{
 const changed=evidence.map(e=>e.id==='ev-B-UK-pet_hair'?{...e,rights:'prohibited' as const}:e);
 assert.equal(run(changed).candidates.find(c=>c.variantId==='B-UK')?.dimensionScores.pet_hair,undefined);
});
test('incompatible protocols withhold pooled score',()=>{
 const x=evidence.find(e=>e.id==='ev-B-UK-pet_hair')!;
 const incompatible={...x,id:'independent-other-protocol',originalTestId:'other-test',protocolId:'different'};
 const b=run([...evidence,incompatible]).candidates.find(c=>c.variantId==='B-UK')!;
 assert.equal(b.dimensionScores.pet_hair,undefined);
 assert.ok(b.notes.some(n=>n.includes('Incompatible')));
});
test('no positive weights is invalid',()=>{
 assert.throws(()=>run(evidence,{...req,weights:{carpet:0,pet_hair:0,ease:0}}));
});
test('hard requirements are enforced',()=>{
 assert.equal(run(evidence,{...req,requiredSpecifications:{cordless:false}}).candidates.length,0);
});
test('scores reproducible regardless of repeat execution',()=>{
 assert.deepEqual(run(),run());
});
