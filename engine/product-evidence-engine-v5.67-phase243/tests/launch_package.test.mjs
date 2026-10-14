import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
const target=path.resolve('release-launch');
const index=await import(path.join(target,'launch/index.js'));

test('release package exposes exactly one runtime recommendation function',()=>{
  assert.deepEqual(Object.keys(index),['buildLaunchRecommendation']);
});
test('standalone release excludes prior pricing and experimental modules and DB code',async()=>{
  const files=await readdir(target,{recursive:true});
  assert.ok(files.includes('launch_rank.js'));
  for(const forbidden of ['engine.js','list_price_context.js','manufacturer_editorial_gate.js',
    'purchase_decision.js','price_observations.js','provider_feeds.js','tradeoffs.js','contextual_functional_suitability.js','src','db','tests']) {
    assert.equal(files.includes(forbidden),false,forbidden);
  }
  const ranking=await readFile(path.join(target,'launch_rank.js'),'utf8');
  assert.ok(!ranking.includes('v.price'));
  assert.ok(!ranking.includes('request.maxPrice'));
});
test('standalone release ranks synthetic products without a price field',()=>{
  const evidence=(variantId,score)=>({id:'e'+variantId,originalTestId:'t'+variantId,source:'synthetic',
    sourceUrl:'https://example.org/test',testedVariantId:variantId,applicableVariantIds:[variantId],
    dimension:'carpet',value:score,scale:'synthetic_0_10',protocolId:'p',conditions:{},
    status:'admitted',rights:'authorized'});
  const records=[evidence('1',9),evidence('2',8)];
  const fingerprint=e=>createHash('sha256').update(JSON.stringify({
    id:e.id,originalTestId:e.originalTestId,source:e.source,sourceUrl:e.sourceUrl,
    testedVariantId:e.testedVariantId,applicableVariantIds:[...e.applicableVariantIds].sort(),
    dimension:e.dimension,value:e.value,scale:e.scale,protocolId:e.protocolId,
    conditions:e.conditions,status:e.status,rights:e.rights,
  })).digest('hex');
  const evidenceApprovals=records.map(e=>({id:'a-'+e.id,evidenceId:e.id,evidenceFingerprint:fingerprint(e),
    status:'approved',reviewer:'demo-only',publisherType:'independent_testing',reviewedAt:'2026-10-01T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z',
    publisherIdentityReference:'demo',commercialReuseGrantReference:'demo',testMethodologyReference:'demo',
    originalTestReference:'demo',exactTestedVariantReference:'demo'}));
  const result=index.buildLaunchRecommendation({
    purpose:'synthetic_demo',evidenceApprovals,
    variants:[{id:'1',familyId:'1',sku:'sku1',market:'UK',currency:'GBP',specifications:{}},
      {id:'2',familyId:'2',sku:'sku2',market:'UK',currency:'GBP',specifications:{}}],
    evidence:records,
    request:{market:'UK',currency:'GBP',weights:{carpet:1,pet_hair:0,ease:0}},
    offers:[],approvals:[],nowIso:'2026-10-10T12:00:00Z',
  });
  assert.equal(result.winnerId,'1');
  assert.equal(result.publicationReady,false);
  assert.equal(result.candidates.length,2);
  assert.ok(!JSON.stringify(result).includes('budgetReference'));
});
