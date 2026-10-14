import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {analyzeEphemeralBatch195,writeDerivedMetadata195,readDerivedMetadata195,
 type BatchInput195,type ReviewIn195} from '../src/phase195_ephemeral_batch_lineage.js';
const secret='DO_NOT_STORE_THIS_REVIEW_BODY_137b29a81';
const long='The independent reviewer measured airflow in a controlled laboratory environment with repeatable instrument settings. The airflow results were documented for the exact model and test condition and provide limited evidence only for this measured attribute. The reviewer described the source of measurements and a detailed practical evaluation of the product user experience. ';
const BASE='2026-10-13T04:00:00Z';
const mk=(id:string,override:Partial<ReviewIn195>={}):ReviewIn195=>({
 sourceId:id,url:`https://${id}.example.com/reviews/product?utm_source=test`,category:'vacuum',variantId:'vacuum_x',
 transientText:long+secret,textBasis:'rights_appropriate_extract',dates:[{kind:'publisher_datePublished',iso:'2025-10-01T00:00:00Z'}],
 attribution:[],measurements:[],...override});
const input=(...r:ReviewIn195[]):BatchInput195=>({reviews:r,batchId:'batch_195',analyzedAt:BASE});
const run=(...r:ReviewIn195[])=>analyzeEphemeralBatch195(input(...r));
const measurement=(extra:object={})=>({field:'airflow',value:43,unit:'cfm',protocol:'rtings_v1_4',condition:'hard_floor',producerId:'lab_a',testEventId:'test_001',basis:'original_test_claimed' as const,...extra});

test('empty batch is safe and explicitly non-ranking',()=>{const r=run();assert.equal(r.sources.length,0);assert.equal(r.publicRankingAllowed,false)});
test('single review does not become verified test',()=>{const r=run(mk('a',{measurements:[measurement()]}));assert.equal(r.coverage[0].originalTestsVerified,0);assert.equal(r.sources[0].claimedOriginalCount,1)});
test('no review text or unique marker leaks into returned result',()=>{const json=JSON.stringify(run(mk('a')));assert.ok(!json.includes(secret));assert.ok(!json.includes(long));assert.equal(JSON.parse(json).sourceBodiesStored,false)});
test('conserves only extract hash and never full-publisher digest claim',()=>{const r=run(mk('a'));assert.match(r.sources[0].transientExtractSha256,/^[a-f0-9]{64}$/);assert.equal(r.sources[0].fingerprintBasis,'rights_appropriate_extract');assert.equal(r.sources[0].needsFreshPublisherCheck,true)});
test('two exact texts form document-candidate not one original test',()=>{const r=run(mk('a'),mk('b'));assert.equal(r.documentCandidates.length,1);assert.equal(r.testEventMergesAuthorized,false)});
test('two near-duplicate texts form inspect-only candidate',()=>{const r=run(mk('a'),mk('b',{transientText:(long+secret).replace('airflow','acoustic')}));assert.ok(r.documentCandidates.length>0);assert.equal(r.documentCandidates[0].action,'inspect_not_auto_merge')});
test('different product variant never compared by text',()=>{const r=run(mk('a'),mk('b',{variantId:'vacuum_y'}));assert.equal(r.documentCandidates.length,0);assert.equal(r.coverage.length,2)});
test('different categories never compared, even matching text',()=>{const r=run(mk('a'),mk('b',{category:'headphones'}));assert.equal(r.documentCandidates.length,0)});
test('same measurements from distinct laboratories raise review cue, not event merge',()=>{const r=run(mk('a',{measurements:[measurement()]}),mk('b',{measurements:[measurement({producerId:'lab_b',testEventId:'test_002'})]}));assert.equal(r.measurementCollisions.length,1);assert.equal(r.measurementCollisions[0].testEventsMerged,false)});
test('different protocol measurement is not marked a collision',()=>{const r=run(mk('a',{measurements:[measurement()]}),mk('b',{measurements:[measurement({protocol:'rtings_v1_3'})]}));assert.equal(r.measurementCollisions.length,0)});
test('different test conditions are not marked a collision',()=>{const r=run(mk('a',{measurements:[measurement()]}),mk('b',{measurements:[measurement({condition:'carpet'})]}));assert.equal(r.measurementCollisions.length,0)});
test('different values are not marked a collision',()=>{const r=run(mk('a',{measurements:[measurement()]}),mk('b',{measurements:[measurement({value:42})]}));assert.equal(r.measurementCollisions.length,0)});
test('same numeric claim in different product model never marked as duplicate',()=>{const r=run(mk('a',{measurements:[measurement()]}),mk('b',{variantId:'vacuum_y',measurements:[measurement()]}));assert.equal(r.measurementCollisions.length,0)});
test('explicit citation is retained only as unverified attribution',()=>{const r=run(mk('a'),mk('b',{attribution:[{targetSourceId:'a',kind:'reports_test_of'}]}));assert.equal(r.explicitAttribution.length,1);assert.equal(r.explicitAttribution[0].proof,'source_supplied_unverified')});
test('publication before cited source raises investigation not automatic origin',()=>{const r=run(mk('a',{dates:[{kind:'publisher_datePublished',iso:'2025-12-01T00:00:00Z'}]}),mk('b',{dates:[{kind:'publisher_datePublished',iso:'2025-01-01T00:00:00Z'}],attribution:[{targetSourceId:'a',kind:'claims_republication'}]}));assert.equal(r.chronologyAlerts[0].issue,'republication_predates_cited_publication');assert.equal(r.chronologyAlerts[0].originalityProven,false)});
test('ordinary citation to a later page does not imply chronological republishing',()=>{const r=run(mk('a',{dates:[{kind:'publisher_datePublished',iso:'2025-12-01T00:00:00Z'}]}),mk('b',{dates:[{kind:'publisher_datePublished',iso:'2025-01-01T00:00:00Z'}],attribution:[{targetSourceId:'a',kind:'explicitly_cites'}]}));assert.equal(r.chronologyAlerts.length,0)});
test('modified before first published is an alert',()=>{const r=run(mk('a',{dates:[{kind:'publisher_datePublished',iso:'2025-10-01T00:00:00Z'},{kind:'publisher_dateModified',iso:'2024-09-01T00:00:00Z'}]}));assert.equal(r.chronologyAlerts[0].issue,'modified_before_published')});
test('archived before declared publication is an alert, not original proof',()=>{const r=run(mk('a',{dates:[{kind:'publisher_datePublished',iso:'2025-10-01T00:00:00Z'},{kind:'archive_capture',iso:'2025-01-01T00:00:00Z'}]}));assert.equal(r.chronologyAlerts[0].issue,'first_seen_before_claimed_publication')});
test('disagreement visible and structured publication dates triggers review',()=>{const r=run(mk('a',{dates:[{kind:'publisher_datePublished',iso:'2025-10-01T00:00:00Z'},{kind:'visible_publication',iso:'2025-10-02T00:00:00Z'}]}));assert.equal(r.chronologyAlerts[0].issue,'date_signal_disagreement')});
test('normal dates generate no suspicion or declaration of originality',()=>{const r=run(mk('a',{dates:[{kind:'publisher_datePublished',iso:'2024-10-01T00:00:00Z'},{kind:'publisher_dateModified',iso:'2025-10-01T00:00:00Z'},{kind:'first_seen_by_pee',iso:'2026-10-01T00:00:00Z'}]}));assert.equal(r.chronologyAlerts.length,0);assert.equal(r.sources[0].status,'original_origin_unverified')});
test('marketplace-only source can be analyzed without original test promotion',()=>{const r=run(mk('a',{textBasis:'analyst_annotation',transientText:'Top five best sellers Amazon star ratings',measurements:[]}));assert.equal(r.coverage[0].originalTestsVerified,0)});
test('batch output invariant to order of input sources',()=>{const a=mk('a',{measurements:[measurement()]}),b=mk('b',{measurements:[measurement()]});assert.deepEqual(run(a,b),run(b,a))});
test('different URLs with trackers normalized in stored metadata',()=>{const r=run(mk('a'));assert.ok(!r.sources[0].url.includes('utm_source'))});
test('modified text produces a different ephemeral hash',()=>{const a=run(mk('a')),b=run(mk('a',{transientText:long+' changed'}));assert.notEqual(a.sources[0].transientExtractSha256,b.sources[0].transientExtractSha256)});
test('duplicate source identifiers rejected',()=>assert.throws(()=>run(mk('a'),mk('a')),/invalid195_batch/));
test('invalid source and category rejected',()=>assert.throws(()=>run(mk('Bad_ID')),/invalid195_review/));
test('invalid page URL rejected',()=>assert.throws(()=>run(mk('a',{url:'http://example.com'})),/bad192_url/));
test('invalid date rejected',()=>assert.throws(()=>run(mk('a',{dates:[{kind:'publisher_datePublished',iso:'not-a-date'}]})),/invalid195_dates/));
test('future dates relative to documented analysis rejected',()=>assert.throws(()=>run(mk('a',{dates:[{kind:'publisher_datePublished',iso:'2027-01-01T00:00:00Z'}]})),/invalid195_dates/));
test('referencing unknown target rejected',()=>assert.throws(()=>run(mk('a',{attribution:[{targetSourceId:'missing',kind:'reports_test_of'}]})),/invalid195_attribution/));
test('self-citation rejected',()=>assert.throws(()=>run(mk('a',{attribution:[{targetSourceId:'a',kind:'explicitly_cites'}]})),/invalid195_attribution/));
test('nonfinite numeric claims rejected',()=>assert.throws(()=>run(mk('a',{measurements:[measurement({value:NaN})]})),/invalid195_measurement/));
test('empty protocol rejected',()=>assert.throws(()=>run(mk('a',{measurements:[measurement({protocol:''})]})),/invalid195_measurement/));
test('persist compact output and roundtrip without source texts',()=>{const dir=mkdtempSync(join(tmpdir(),'pee195-'));try{const file=join(dir,'summary.json');const r=run(mk('a'),mk('b'));writeDerivedMetadata195(file,r);const saved=readFileSync(file,'utf8');assert.ok(!saved.includes(secret));assert.ok(!saved.includes(long));assert.deepEqual(readDerivedMetadata195(file),r)}finally{rmSync(dir,{recursive:true,force:true})}});
test('persist rejects arbitrary extra text property in report',()=>{const dir=mkdtempSync(join(tmpdir(),'pee195-'));try{const file=join(dir,'bad.json');assert.throws(()=>writeDerivedMetadata195(file,{...run(mk('a')),reviewBody:secret} as any),/unsafe195_report_keys/)}finally{rmSync(dir,{recursive:true,force:true})}});
test('persist rejects extra raw text nested inside source',()=>{const dir=mkdtempSync(join(tmpdir(),'pee195-'));try{const file=join(dir,'bad.json');const r=run(mk('a'));assert.throws(()=>writeDerivedMetadata195(file,{...r,sources:[{...r.sources[0],text:secret}]} as any),/unsafe195_report_keys/)}finally{rmSync(dir,{recursive:true,force:true})}});
test('reader rejects tampered raw-content injection from disk',()=>{const dir=mkdtempSync(join(tmpdir(),'pee195-'));try{const file=join(dir,'bad.json');const r=run(mk('a'));writeFileSync(file,JSON.stringify({...r,transientText:secret}));assert.throws(()=>readDerivedMetadata195(file),/unsafe195_report_keys/)}finally{rmSync(dir,{recursive:true,force:true})}});
test('input never gives permission to skip original source review',()=>{const r=run(mk('a'));assert.equal(r.skipFutureSourceScreeningWithoutFreshRead,false);assert.equal(r.publicRankingAllowed,false)});
test('persist rejects injected raw text as date value',()=>{const dir=mkdtempSync(join(tmpdir(),'pee195-'));try{const file=join(dir,'bad.json');const r=run(mk('a'));assert.throws(()=>writeDerivedMetadata195(file,{...r,sources:[{...r.sources[0],dates:[{kind:'publisher_datePublished',iso:secret}]}]} as any),/unsafe195_report/)}finally{rmSync(dir,{recursive:true,force:true})}});
test('persist rejects injected raw text in claim fingerprint',()=>{const dir=mkdtempSync(join(tmpdir(),'pee195-'));try{const file=join(dir,'bad.json');const r=run(mk('a',{measurements:[measurement()]}),mk('b',{measurements:[measurement()]}));assert.throws(()=>writeDerivedMetadata195(file,{...r,measurementCollisions:[{...r.measurementCollisions[0],fingerprint:secret}]} as any),/unsafe195_report/)}finally{rmSync(dir,{recursive:true,force:true})}});
