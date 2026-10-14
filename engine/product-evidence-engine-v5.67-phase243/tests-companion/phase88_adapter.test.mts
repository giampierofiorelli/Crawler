import { test } from 'node:test';
import assert from 'node:assert/strict';
import { intakeApprovedHTML } from '../phase88/approved_html_intake.ts';
import type { Phase69ApprovedHTML, IntakeDependencies, IntakeInput } from '../phase88/approved_html_intake.ts';

const sha = 'a'.repeat(64);
const url = 'https://maker.example/products/m3';
const input: IntakeInput = {
  url, model: 'Maker M3', category: 'headphones', asOf: '2026-10-10T18:00:00Z',
  dbPath: '/tmp/phase88-fixture.db', recipeId: sha, allowedFieldKeys: ['battery_hours'],
};
const approved: Phase69ApprovedHTML = {
  state: 'approved_source_read', requestedUrl: url, finalUrl: url,
  body: '<h1>Maker M3</h1><p>Battery life: 23 h</p>',
  contentType: 'text/html; charset=utf-8', sourcePolicyId: 'phase69-policy-001',
  acquisitionPlanId: 'phase68-plan-001', rightsReviewId: 'rights-review-001',
  robots: 'allowed', websiteTerms: 'allowed', extractionRights: 'allowed',
  operation: 'manufacturer_specifications',
};
const measured = { battery_hours: {
  value:23, unit:'h', origin:'manufacturer_declared',
  evidence_state:'quarantined_not_independently_tested',
  model: 'Maker M3', source_url: url, strategy_sha256: sha,
}};
function fixture(overrides: Partial<Phase69ApprovedHTML> = {}, result: unknown = measured) {
  let registries = 0, reads = 0, extracts = 0, quarantines = 0, seen: unknown;
  const deps: IntakeDependencies = {
    resolveReviewedFieldRegistry: async (category) => {registries++;return {
      state:'reviewed_field_registry',category,registryReviewId:'reviewed-registry-001',fieldKeys:['battery_hours'],
    };},
    readApprovedSource: async () => { reads++; return {...approved,...overrides}; },
    extractStoredRecipe: (async (action: string, payload: Record<string,unknown>) => {
      extracts++;
      assert.equal(action,'extract_stored');
      assert.equal(payload.url,url);
      return result;
    }) as IntakeDependencies['extractStoredRecipe'],
    quarantineManufacturerClaims: async (claims) => {
      quarantines++;seen = claims;
      return {state:'quarantined',acceptedCount:claims.length,receiptId:'phase72-receipt-001',evidenceRole:'manufacturer_declared'};
    },
  };
  return {deps,get counts(){return {registries,reads,extracts,quarantines}},get claims(){return seen}};
}

test('approved HTML -> reviewed extraction -> quarantine once; no model calls, no ranking',async () => {
  const f = fixture();
  const result = await intakeApprovedHTML(input,f.deps);
  assert.deepEqual(f.counts,{registries:1,reads:1,extracts:1,quarantines:1});
  assert.equal(result.rankingApproved,false);
  assert.equal(result.publicationApproved,false);
  assert.equal(result.modelCalls,0);
  assert.equal(result.acceptedCount,1);
  const claims = f.claims as any[];
  assert.equal(claims[0].evidenceState,'quarantined_not_independently_tested');
  assert.equal(claims[0].rightsReviewId,approved.rightsReviewId);
  assert.equal(claims[0].registryReviewId,'reviewed-registry-001');
});

test('source access denial must stop before extraction and quarantine',async () => {
  for(const bad of [
    {state:'denied' as any}, {robots:'denied' as any}, {websiteTerms:'denied' as any},
    {extractionRights:'denied' as any}, {operation:'review_article' as any},
    {sourcePolicyId:''}, {rightsReviewId:''}, {acquisitionPlanId:''},
  ]) {
    const f=fixture(bad);
    await assert.rejects(intakeApprovedHTML(input,f.deps),/phase88_/);
    assert.deepEqual(f.counts,{registries:1,reads:1,extracts:0,quarantines:0});
  }
});

test('redirect, host, port, query or protocol mismatch stops before extraction', async () => {
  for(const alternate of [
    'https://evil.example/products/m3','http://maker.example/products/m3',
    'https://maker.example:444/products/m3','https://maker.example/products/m3?variant=2',
    'https://maker.example/other/m3',
  ]) {
    const f=fixture({finalUrl:alternate});
    await assert.rejects(intakeApprovedHTML(input,f.deps),/phase88_source_redirect_or_mismatch/);
    assert.equal(f.counts.extracts,0);
  }
});

test('non-HTML source and large HTML stop before Python subprocess',async () => {
  for(const bad of [{contentType:'application/pdf'}, {body:'X'.repeat(750_001)}]) {
    const f=fixture(bad);
    await assert.rejects(intakeApprovedHTML(input,f.deps),/phase88_/);
    assert.equal(f.counts.extracts,0);
  }
});

test('source claims masquerading as independent tests refused, without intake',async () => {
  const f=fixture({}, {battery_hours:{...measured.battery_hours,origin:'independent_lab_test'}});
  await assert.rejects(intakeApprovedHTML(input,f.deps),/phase88_invalid_or_promoted_manufacturer_claim/);
  assert.equal(f.counts.quarantines,0);
});

test('wrong model, changed source, wrong strategy, NaN and unknown field rejected',async () => {
  const variations = [
    {battery_hours:{...measured.battery_hours,model:'Maker M4'}},
    {battery_hours:{...measured.battery_hours,source_url:'https://evil.example'}},
    {battery_hours:{...measured.battery_hours,strategy_sha256:'b'.repeat(64)}},
    {battery_hours:{...measured.battery_hours,value:Number.NaN}},
    {price:measured.battery_hours},
    {},
  ];
  for(const result of variations) {
    const f=fixture({},result);
    await assert.rejects(intakeApprovedHTML(input,f.deps),/phase88_/);
    assert.equal(f.counts.quarantines,0);
  }
});

test('no source read when field registry or recipe ID invalid', async () => {
  for(const changes of [
    {recipeId:'bad'}, {allowedFieldKeys:['battery_hours','price','price']},
    {url:'http://maker.example/products/m3'}, {category:'INVALID CATEGORY'},
    {allowedFieldKeys:['retailer_price']}, {allowedFieldKeys:['discontinued']},
  ]) {
    const f=fixture();
    await assert.rejects(intakeApprovedHTML({...input,...changes},f.deps),/phase88_/);
    assert.equal(f.counts.reads,0);
  }
});

test('quarantine receipt failure never yields a successful return',async () => {
  const f = fixture();
  const broken: IntakeDependencies = {...f.deps,
    quarantineManufacturerClaims:async () => ({state:'quarantined',acceptedCount:0,receiptId:'receipt-12345',evidenceRole:'manufacturer_declared'})};
  await assert.rejects(intakeApprovedHTML(input,broken),/phase88_quarantine_receipt_invalid/);
});

test('missing Phase85, Phase69 and Phase72 dependencies prohibited',async () => {
  const f = fixture();
  await assert.rejects(intakeApprovedHTML(input,{...f.deps,readApprovedSource:undefined} as any),/phase88_/);
  assert.deepEqual(f.counts,{registries:0,reads:0,extracts:0,quarantines:0});
});

test('unreviewed category field rejected before source read', async () => {
  const f=fixture();
  const deps={...f.deps,resolveReviewedFieldRegistry:async () => ({state:'reviewed_field_registry',category:'headphones',registryReviewId:'reviewed-registry-001',fieldKeys:['noise_level']})} as IntakeDependencies;
  await assert.rejects(intakeApprovedHTML(input,deps),/phase88_unreviewed_category_fields/);
  assert.equal(f.counts.reads,0);
});
