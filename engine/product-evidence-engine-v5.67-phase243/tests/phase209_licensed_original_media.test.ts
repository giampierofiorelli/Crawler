import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {canonicalReviewableVideo209,inspectEphemeralLicensedMedia209,
 type EphemeralCapture209,type LicensedSource209} from '../src/phase209_licensed_original_media.js';
import {evaluateVideoEvidence206,type BenchmarkDataset206} from '../src/phase206_video_evidence_benchmark.js';
import {caseScopeFingerprint207} from '../src/phase207_signed_benchmark_admission.js';

const originalFile='Sunday_Morning_Espresso_Routine_-_Grind_%2B_distribute_%2B_tamp_%2B_extraction_%2815-Second_Abridged_Version%29.webm';
const page=`https://commons.wikimedia.org/wiki/File:${originalFile}`;
const media=`https://upload.wikimedia.org/wikipedia/commons/8/83/${originalFile}`;
const source:LicensedSource209={schema:'pee209.source.v1',caseId:'espresso_cc_clip',sourcePageUrl:page,
 sourceMediaUrl:media,licence:'CC-BY-2.0',licensePageUrl:'https://creativecommons.org/licenses/by/2.0/',
 creator:'Scott Schiller',title:'Sunday Morning Espresso Routine',categoryId:'coffee_machines',
 criterionId:'espresso_preparation',disciplineId:'espresso_preparation',exactVariantId:null,
 sourceRightsCheckedBy:'auditor_a',sourcePageReviewedAt:'2026-10-13T10:00:00Z',
 sourceRightsBasis:'publisher_page_stated_license'};
const clip=Uint8Array.from([0x1a,0x45,0xdf,0xa3,...Array.from({length:60},(_,i)=>i%256)]);
const sha=createHash('sha256').update(clip).digest('hex');
const input=():EphemeralCapture209=>({source:{...source},bytes:clip,
 acquisition:'operator_offline',independentOriginalDigest:null});
const rejects=(mutate:(x:EphemeralCapture209)=>void,reason:string)=>{
 const c=input();mutate(c);assert.throws(()=>inspectEphemeralLicensedMedia209(c),new RegExp(`phase209_${reason}`));
};
test('YouTube source identity unchanged by extension',()=>{
 assert.deepEqual(canonicalReviewableVideo209('https://youtu.be/mAYbmcqPphc'),{
  kind:'youtube',url:'https://www.youtube.com/watch?v=mAYbmcqPphc'});
});
test('licensed Commons media are canonical, isolated from YouTube identity',()=>{
 const r=canonicalReviewableVideo209(page);
 assert.equal(r.kind,'wikimedia_commons_file');assert.ok(r.url.includes('Sunday_Morning_Espresso_Routine'));
 assert.notEqual(r.url,canonicalReviewableVideo209('https://www.youtube.com/watch?v=mAYbmcqPphc').url);
});
test('prototype and hostile URLs are not valid media sources',()=>{
 for(const u of ['http://commons.wikimedia.org/wiki/File:a.webm',
  'https://commons.wikimedia.org.evil.org/wiki/File:a.webm',
  'https://commons.wikimedia.org@evil.org/wiki/File:a.webm',
  'https://commons.wikimedia.org/wiki/File:a.webm?oldid=42',
  'https://commons.wikimedia.org/wiki/File:a%2Fb.webm',
  'https://commons.wikimedia.org/wiki/File:../a.webm',
  'https://commons.wikimedia.org/wiki/File:a.mp4'])assert.throws(()=>canonicalReviewableVideo209(u),/phase20[39]_/);
});
test('opaque synthetic EBML-header bytes produce research receipt, never authenticated proof',()=>{
 const r=inspectEphemeralLicensedMedia209(input());
 assert.equal(r.sourceMediaSha256,sha);assert.equal(r.sourceByteLength,clip.length);
 for(const name of ['publisherBytesAuthenticated','uploaderCompetenceVerified','productVariantVisuallyVerified',
  'videoReviewedBySpecialists','independentTestEventAdmitted','scientificBenchmarkGoldAllowed',
  'productRankingAuthorized','publicTrustBadgeAuthorized','transcriptStored','fullVideoStoredInReceipt'] as const)
  assert.equal(r[name],false);
 assert.ok(!JSON.stringify(r).includes('transientExcerpt'));
 assert.deepEqual(r.missingChecks.includes('qualified_independent_review'),true);
});
test('a matching caller-supplied digest is still not publisher authenticity',()=>{
 const x=input();x.independentOriginalDigest=sha;
 const r=inspectEphemeralLicensedMedia209(x);
 assert.equal(r.independentlyMatchedOriginalDigest,true);assert.equal(r.publisherBytesAuthenticated,false);
});
test('digest mismatch fails before receipt',()=>rejects(x=>{x.independentOriginalDigest='f'.repeat(64);},'original_digest_mismatch'));
test('source page must match exact media filename',()=>rejects(x=>{x.source.sourceMediaUrl=media.replace('Sunday_Morning','Different_Morning');},'media_page_mismatch'));
test('wrong host is rejected even when media filename matches',()=>rejects(x=>{x.source.sourceMediaUrl=media.replace('upload.wikimedia.org','copy.example.com');},'media_url'));
test('mistyped license or license URL rejected',()=>{
 rejects(x=>{x.source.licensePageUrl='https://creativecommons.org/licenses/by/4.0/';},'license');
 rejects(x=>{x.source.licence='commercial_endorsement' as never;},'license');
});
test('media file shape and maximum size are constrained',()=>{
 rejects(x=>{x.bytes=Uint8Array.from([0,1,2,3,...clip]);},'media_bytes');
 rejects(x=>{x.bytes=new Uint8Array(2);},'media_bytes');
});
test('no arbitrary record injection into persisted receipt',()=>{
 rejects(x=>{(x.source as unknown as Record<string,unknown>).transcript='copyright body';},'source_metadata');
 rejects(x=>{(x as unknown as Record<string,unknown>).html='<body>raw</body>';},'source_metadata');
});
test('license is source-stated, not reviewer expertise; source remains variant-unconfirmed',()=>{
 const r=inspectEphemeralLicensedMedia209(input());
 assert.equal(r.exactVariantId,null);assert.equal(r.state,'research_only');
 assert.ok(r.missingChecks.includes('actual_product_variant'));
});
test('Commons public metadata lead reuses Phase206 evaluator, with no gold accuracy',()=>{
 const canonical=canonicalReviewableVideo209(page).url;
 const d:BenchmarkDataset206={schema:'206.dataset.1',datasetId:'commons_meta_pilot',provenance:'source_linked_unblinded_pilot',
  cases:[{caseId:'espresso_cc_clip',videoUrl:canonical,referenceUrl:canonical,
   categoryId:'coffee_machines',variantId:'model_unverified',criterionId:'espresso_preparation',
   disciplineId:'espresso_preparation',language:'en',sourceReviewId:null,
   reviewBasis:'metadata_only',sourceKind:'public_metadata_lead'}],judgments:[],eventPairs:[]};
 const result=evaluateVideoEvidence206(d,[],[],'pee_native_205','not_executed');
 assert.equal(result.independentlyLabelledCases,0);
 assert.equal(result.fields.claimKind.accuracyOnPredictions,null);
 assert.equal(result.independentScientificValidationClaimAllowed,false);
 assert.equal(caseScopeFingerprint207(d.cases[0]).length,64);
});
test('different Commons clips get different scope fingerprints even for same category',()=>{
 const a={caseId:'knife_a',videoUrl:'https://commons.wikimedia.org/wiki/File:Knife_sharpening_video.webm',
  referenceUrl:'https://commons.wikimedia.org/wiki/File:Knife_sharpening_video.webm',
  categoryId:'knives',variantId:'unknown',criterionId:'sharpening',disciplineId:'knife_care',
  language:'en',sourceReviewId:null,reviewBasis:'metadata_only' as const,sourceKind:'public_metadata_lead' as const};
 const canon=canonicalReviewableVideo209(page).url;
 assert.notEqual(caseScopeFingerprint207(a),caseScopeFingerprint207({...a,videoUrl:canon,referenceUrl:canon}));
});
