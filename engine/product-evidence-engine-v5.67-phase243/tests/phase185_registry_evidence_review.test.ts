import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {generateKeyPairSync,sign,createHash} from 'node:crypto';
import {stageEpaRegistry184} from '../src/phase184_real_epa_registry_pilot.js';
import {canonicalJson180} from '../src/phase180_reviewed_first_answer.js';
import {compareEpaListing185,sourceFacts185,type OfficialPageEntry185,type DisplayReviewApproval185} from '../src/phase185_registry_evidence_review.js';
const csv=readFileSync('evaluation/phase184/source/ENERGY_STAR_Certified_Room_Air_Cleaners_V3.0_20261012.csv');
const pilot=stageEpaRegistry184({csvBytes:csv,expectedSha256:'4d7d3203e95ef8c2553a55a51799438470d5f71f01c49c295ede8013d608be91',
 market:'us',obtainedAt:'2026-10-12T20:00:00Z',reviewedAt:'2026-10-12T20:00:00Z',asOf:'2026-10-12T20:00:00Z',
 rightsReviewReference:'epa_public_data_license_review',sourceRevision:'operator_export_2026_10_12'});
const keys=generateKeyPairSync('ed25519');
const authority={market:'us',asOf:'2026-10-12T21:10:00Z',publicKeys:{external_reviewer:keys.publicKey.export({type:'spki',format:'pem'}).toString()}};
const page:OfficialPageEntry185={esuid:'4027325',brand:'LEVOIT',modelNumber:'Core 400S',
 officialPageUrl:'https://www.energystar.gov/productfinder/product/certified-room-air-cleaners/details/4027325/export/pdf',
 accessedAt:'2026-10-12T21:00:00Z',captureKind:'operator_transcribed_public_listing',
 values:[{dimensionKey:'smoke_cadr',value:231,unit:'cfm'},{dimensionKey:'dust_cadr',value:240,unit:'cfm'},
 {dimensionKey:'pollen_cadr',value:259,unit:'cfm'},{dimensionKey:'integrated_energy_factor',value:5.8,unit:'cfm_per_watt'},
 {dimensionKey:'epa_derived_room_area',value:358,unit:'sq_ft'}]};
const compare=(p=page)=>compareEpaListing185({pilot,originalCsv:csv,page:p});
const review=(c=compare(),overrides:Partial<DisplayReviewApproval185>={})=>{
 const b:DisplayReviewApproval185={phase:185,schema:'185.display-review.1',entryId:c.entryId,
 comparisonHash:c.comparisonHash,documentSha256:c.documentSha256,
 reviewedAt:'2026-10-12T21:05:00Z',validUntil:'2026-11-12T20:30:00Z',market:'us',
 permittedDimensions:['smoke_cadr','integrated_energy_factor','epa_derived_room_area'],reviewReference:'operator_source_check_fixture',
 permission:'display_source_attributed_registry_claim_only',publisherBytesIndependentlyAuthenticated:false,
 scientificIndependenceClaimed:false,...overrides};
 return {review:b,keyId:'external_reviewer',signatureBase64:sign(null,Buffer.from(canonicalJson180(b)),keys.privateKey).toString('base64')};
};
const project=(c=compare(),r=review(c))=>sourceFacts185({pilot,originalCsv:csv,comparison:c,review:r,authority});
const cloned=<T>(x:T):T=>JSON.parse(JSON.stringify(x));

test('matches five source-attributed facts from genuine EPA Core 400S listing; not independent tests',()=>{
 const c=compare();assert.equal(c.identityAligned,true);assert.equal(c.disagreements.length,0);
 assert.equal(c.reviewedClaims.length,5);assert.equal(c.canStageDisplayReview,true);
 assert.equal(c.missingOnOfficialPage.length,6);
 const r=project(c);assert.equal(r.status,'source_attributed_facts_available');assert.equal(r.facts.length,3);
 assert.equal(r.rankingAuthorized,false);assert.equal(r.catalog181PromotionAuthorized,false);
 assert.ok(r.facts.every(x=>x.rankingAuthorized===false&&x.independentProfessionalTest===false));
 assert.equal(r.facts.find(x=>x.dimensionKey==='epa_derived_room_area')?.dependentOn,'smoke_cadr');
});
test('signature is required; with no review no original source is made rank-ready',()=>{
 assert.equal(project(compare(),null as any).status,'needs_review');
 assert.equal(project(compare(),{...review(),signatureBase64:'a'.repeat(88)}).facts.length,0);
});
test('crosscheck rejects a mismatch, even if a review is correctly signed',()=>{
 const changed=cloned(page);changed.values[0].value=999;
 const c=compare(changed);assert.deepEqual(c.disagreements,['conflict:smoke_cadr']);assert.equal(c.canStageDisplayReview,false);
 assert.equal(project(c,review(c)).status,'needs_review');
});
test('exact registry ESUID and model identity, not loose matching',()=>{
 const wrong=cloned(page);wrong.modelNumber='Core 300S';assert.equal(compare(wrong).identityAligned,false);
 assert.equal(project(compare(wrong),review(compare(wrong))).status,'needs_review');
 const missing=cloned(page);missing.esuid='1111111';missing.officialPageUrl=missing.officialPageUrl.replace('4027325','1111111');
 assert.throws(()=>compare(missing),/not_a_stageable/);
});
test('URL must be official EPA product PDF for exact model entry',()=>{
 const p=cloned(page);p.officialPageUrl='https://other.com/4027325';assert.throws(()=>compare(p),/invalid_public_listing/);
});
test('dimension and unit disagreement are caught and missing dimensions stay visible',()=>{
 const p=cloned(page);p.values[0].unit='m3_per_hour';const c=compare(p);
 assert.equal(c.disagreements[0],'conflict:smoke_cadr');assert.equal(c.missingOnOfficialPage.includes('smoke_cadr'),false);
});
test('invented dimension cannot be admitted even if signed',()=>{
 const p=cloned(page);p.values=[...p.values,{dimensionKey:'health_cure',value:1,unit:'boolean'}];
 const c=compare(p);assert.equal(c.canStageDisplayReview,false);assert.ok(c.disagreements.includes('unknown_dimension:health_cure'));
});
test('altered comparison or source hash cannot silently survive approval',()=>{
 const c=cloned(compare());c.reviewedClaims[0].value=999;assert.equal(project(c).status,'needs_review');
 const other=cloned(compare());other.documentSha256='0'.repeat(64);assert.equal(project(other).status,'needs_review');
});
test('review may authorize only dimensions that were corroborated',()=>{
 const c=compare();assert.equal(project(c,review(c,{permittedDimensions:['fake_dimension']})).status,'needs_review');
});
test('review must be unexpired and scope-bound to current market and hash',()=>{
 const c=compare();
 assert.equal(project(c,review(c,{market:'us',validUntil:'2026-10-12T20:59:00Z'})).status,'needs_review');
 assert.equal(project(c,review(c,{entryId:'esuid_9999999'})).status,'needs_review');
 assert.equal(project(c,review(c,{scientificIndependenceClaimed:true as false})).status,'needs_review');
});
test('review cannot predate the supposed listing observation',()=>{
 const c=compare();assert.equal(project(c,review(c,{reviewedAt:'2026-10-12T20:59:00Z'})).status,'needs_review');
});
test('only source-fact display is possible, never an OriginalTest181 shape',()=>{
 const r=project();assert.ok(r.facts.every(x=>x.validFor==='attributed_source_fact_display_only'));
 assert.ok(r.facts.every(x=>!('scope' in x)&&!('valuePoints' in x)&&!('hardOutcome' in x)));
});
test('deterministic replay on same source, listing and reviewed permission',()=>{
 const c=compare(),r=review(c);assert.deepEqual(project(c,r),project(c,r));
});
const alen:OfficialPageEntry185={
 esuid:'4481446',brand:'Alen',modelNumber:'BreatheSmart 25i',
 officialPageUrl:'https://www.energystar.gov/productfinder/product/certified-room-air-cleaners/details/4481446/export/pdf',
 accessedAt:'2026-10-12T21:00:00Z',captureKind:'operator_transcribed_public_listing',values:[
 {dimensionKey:'smoke_cadr',value:97,unit:'cfm'},
 {dimensionKey:'dust_cadr',value:106,unit:'cfm'},
 {dimensionKey:'pollen_cadr',value:105,unit:'cfm'},
 {dimensionKey:'integrated_energy_factor',value:6.6,unit:'cfm_per_watt'},
 {dimensionKey:'annual_energy_use',value:90,unit:'kwh_per_year'},
 {dimensionKey:'ozone_emissions',value:0,unit:'ppb'},
 {dimensionKey:'epa_derived_room_area',value:150,unit:'sq_ft'},
 ]};
test('second independently located EPA listing matches seven Alen BreatheSmart 25i registry fields',()=>{
 const c=compare(alen);assert.equal(c.identityAligned,true);assert.equal(c.reviewedClaims.length,7);
 assert.equal(c.disagreements.length,0);assert.equal(c.missingOnOfficialPage.length,4);
 const r=project(c,review(c,{permittedDimensions:['smoke_cadr','annual_energy_use']}));
 assert.equal(r.facts.length,2);assert.equal(r.facts[0].entryId,'esuid_4481446');
 assert.ok(r.facts.every(x=>x.independentProfessionalTest===false));
});
test('changing just a reviewed source observation invalidates signature despite preserved metadata',()=>{
 const c=compare(alen);const signed=review(c);
 const changed=cloned(signed);changed.review.permittedDimensions=['smoke_cadr'];
 assert.equal(project(c,changed).status,'needs_review');
});
test('changing the signed comparison hash invalidates a review',()=>{
 const c=compare(alen),signed=review(c);
 assert.equal(project(c,review(c,{comparisonHash:'f'.repeat(64)})).status,'needs_review');
 assert.equal(project(c,{...signed,keyId:'untrusted_signer'}).status,'needs_review');
});
test('fake ranking permission in a source display review is not silently accepted',()=>{
 const c=compare(alen);const forged=review(c);
 (forged.review as any).permission='ranking_authorized';
 assert.equal(project(c,forged).status,'needs_review');
});
test('registry entry cannot be relabeled after comparison hash recomputation and signed',()=>{
 const c=cloned(compare(alen));c.brand='Different Brand';
 const {comparisonHash,...base}=c;
 c.comparisonHash=createHash('sha256').update(canonicalJson180(base)).digest('hex');
 assert.equal(project(c,review(c)).status,'needs_review');
});
test('held duplicate or grouped model cannot be crosschecked into individual SKU',()=>{
 const h=pilot.held.find(x=>x.reason==='model_pattern_or_group');assert.ok(h);
 const p=cloned(page);p.esuid=h.esuid;p.brand=h.brand;p.modelNumber=h.modelNumber;
 p.officialPageUrl=p.officialPageUrl.replace('4027325',h.esuid);
 assert.throws(()=>compare(p),/not_a_stageable/);
});
test('different numeric scales and rounding do not silently pass exact source comparison',()=>{
 const p=cloned(alen);p.values[0].value=97.01;
 assert.deepEqual(compare(p).disagreements,['conflict:smoke_cadr']);
});
