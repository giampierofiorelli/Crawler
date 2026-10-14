import test from 'node:test';
import assert from 'node:assert/strict';
import {runNeedsDemo} from '../src/needs_demo_pipeline.js';
import {vacuumNeedsPrototype} from '../src/needs_discovery.js';
import type {Evidence} from '../src/types.js';
const variants=[
  {id:'A',familyId:'demo',market:'UK' as const,sku:'A-UK',currency:'GBP',specifications:{}},
  {id:'B',familyId:'demo',market:'UK' as const,sku:'B-UK',currency:'GBP',specifications:{}}
];
const ev=(id:string,dim:'carpet'|'pet_hair',v:string,n:number):Evidence=>({
  id,originalTestId:id,source:'fictional',sourceUrl:'https://example.org/fictional',
  testedVariantId:v,applicableVariantIds:[v],dimension:dim,value:n,scale:'synthetic_0_10',
  protocolId:'fictional-test',conditions:{mode:'same'},status:'admitted',rights:'authorized'
});
const evidence=[ev('a1','carpet','A',9),ev('a2','pet_hair','A',3),ev('b1','carpet','B',5),ev('b2','pet_hair','B',8)];
const input={purpose:'synthetic_demo' as const,category:vacuumNeedsPrototype,variants,evidence,market:'UK' as const,currency:'GBP'};
test('changing explicitly declared needs changes demonstrative winner, not merchant ranking',()=>{
  const a=runNeedsDemo({...input,answers:{choices:{floors:'carpet',pets:'yes'},priorities:{carpet_cleaning:'essential',pet_hair_removal:'nice_to_have'},confirmInterpretation:true}});
  const b=runNeedsDemo({...input,answers:{choices:{floors:'carpet',pets:'yes'},priorities:{carpet_cleaning:'nice_to_have',pet_hair_removal:'essential'},confirmInterpretation:true}});
  assert.equal(a.winnerId,'A');assert.equal(b.winnerId,'B');
  assert.equal(a.publicationReady,false);
});
test('an unmeasured critical need blocks a synthetic winner',()=>{
  const r=runNeedsDemo({...input,answers:{choices:{floors:'mixed',pets:'yes'},confirmInterpretation:true}});
  assert.equal(r.winnerId,null);assert.equal(r.ranking,null);
  assert.ok(r.needs.evidenceGaps.includes('hard_floor_cleaning'));
});
test('unconfirmed needs do not start ranking',()=>{
  const r=runNeedsDemo({...input,answers:{choices:{floors:'carpet',pets:'yes'}}});
  assert.equal(r.winnerId,null);assert.equal(r.ranking,null);
});
test('incomplete product evidence blocks winner, even if another product fully covered',()=>{
  const r=runNeedsDemo({...input,evidence:evidence.filter(x=>x.id!=='a1'),answers:{choices:{floors:'carpet',pets:'yes'},confirmInterpretation:true}});
  assert.equal(r.winnerId,null);assert.ok(r.ranking);
});
test('commercial fields are not accepted',()=>{
  const bad=[{...variants[0],price:99},variants[1]];
  assert.throws(()=>runNeedsDemo({...input,variants:bad as typeof variants,answers:{choices:{floors:'carpet',pets:'yes'},confirmInterpretation:true}}),/Commercial fields/);
});
test('synthetic evidence cannot be marked as real publication output',()=>{
  const r=runNeedsDemo({...input,answers:{choices:{floors:'carpet',pets:'no'},confirmInterpretation:true}});
  assert.equal(r.publicationReady,false);assert.equal(r.purpose,'synthetic_demo');
});
