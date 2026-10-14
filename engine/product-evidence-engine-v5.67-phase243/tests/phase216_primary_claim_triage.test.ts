import {test} from 'node:test';
import assert from 'node:assert/strict';
import {triagePrimaryClaims216,type SpecObservation216,type ClaimHypothesis216} from '../src/phase216_primary_claim_triage.js';
import type {Transcript212} from '../src/phase212_local_asr_evaluation.js';
import type {UserUploadReceipt210} from '../src/phase210_user_supplied_video.js';
import type {CrossDecode215} from '../src/phase215_asr_crossdecode_review.js';

const upload='a'.repeat(64),model='b'.repeat(64);
const transcript:Transcript212={schema:'pee212.local-asr.v1',uploadSha256:upload,durationSeconds:65,
 runtime:{engine:'whispercpp_local',engineVersion:'1.9.5',modelSha256:model,modelLabel:'ggml-base.bin',
 inferenceMode:'local_cpu',languageStrategy:'global_language',inputShaVerified:true,noRemoteInference:true,engineRan:true},
 segments:[{id:'s0',startSecond:35,endSecond:47,text:'and the new phone is 16 grams heavier',language:'en',languageBasis:'global_only',words:[]},
 {id:'s1',startSecond:47,endSecond:55,text:'reaching 3000 bits and 120 hertz',language:'en',languageBasis:'global_only',words:[]}]};
const receipt:UserUploadReceipt210={schema:'pee210.user-upload-receipt.v1',caseId:'user_case',observedUploadSha256:upload,
 uploadByteLength:52000,container:'mp4',durationSeconds:65,hasAudio:true,receivedFileName:'review.mp4',originalPublisherUrl:null,
 captureKind:'user_supplied_screen_recording',observations:[{atSecond:51,kind:'edited_comparison',description:'phones shown',method:'frame_inspection',independentlyCorroborated:false}],
 sourceOriginalAuthenticated:false,publisherIdentityVerified:false,exactProductVariantVerified:false,creatorExpertiseVerified:false,
 measurementsScientificallyVerified:false,visualAnnotationsIndependentlyVerified:false,transcriptAvailable:false,independentGoldLabels:0,
 rankingAuthorized:false,publicTrustSignalsAuthorized:false,fullAudioRetained:false,fullVideoRetained:false,framesRetained:false,missingChecks:[]};
const crossDecode:CrossDecode215={schema:'pee215.crossdecode-triage.v1',uploadSha256:upload,modelSha256:model,
 scope:'same_model_two_windowing_strategies',transcriptTextRetained:false,comparedWindows:5,
 alerts:[{windowStartSecond:45,windowEndSecond:60,alerts:['context_sensitive_unit','unit_disagreement'],claimVerified:false,manualReferenceAvailable:false}],
 repeatedLanguageObservation:['en'],languageChangeAccuracy:null,wordErrorRate:null,characterErrorRate:null,
 originalPublisherAuthenticated:false,productEvidenceAdmissionAuthorized:false,needsOriginalAudioInspection:true,
 noAlertsIsNotAccuracy:true,conclusion:'diagnostic_disagreement_only'};
const spec=(factId:string,variantId:string,market:string,metricId:string,conditionId:string,value:number,unit:SpecObservation216['unit']):SpecObservation216=>({
 factId,sourceUrl:`https://support.apple.com/${market}/specs`,publisher:'manufacturer',reviewMode:'analyst_observed_public_page',sourceByteHash:null,
 checkedDate:'2026-10-13',variantId,market,metricId,conditionId,value,unit});
const weight=():ClaimHypothesis216=>({claimId:'weight_delta',startSecond:35,endSecond:47,segmentIds:['s0'],kind:'manufacturer_spec_report',
 metricId:'mass',conditionId:'nominal',variantId:'phone18',comparisonVariantId:'phone17',market:null,value:16,heardUnit:'grams'});
const bright=():ClaimHypothesis216=>({claimId:'brightness',startSecond:47,endSecond:55,segmentIds:['s1'],kind:'manufacturer_spec_report',
 metricId:'brightness',conditionId:'peak_outdoor',variantId:'phone18',comparisonVariantId:null,market:'uk',value:3000,heardUnit:'bits'});
const facts=[spec('w18uk','phone18','uk','mass','nominal',249,'g'),spec('w17uk','phone17','uk','mass','nominal',231,'g'),
 spec('w18la','phone18','la','mass','nominal',249,'g'),spec('w17la','phone17','la','mass','nominal',233,'g'),
 spec('br18','phone18','uk','brightness','peak_outdoor',3000,'nit'),
 spec('hz18','phone18','uk','refresh','max',120,'hz')];
const check=(claims:ClaimHypothesis216[],fs:SpecObservation216[]=facts)=>triagePrimaryClaims216({transcript,receipt,crossDecode,claims,facts:fs});
test('real-style brightness requires suspicion, never a silent word correction',()=>{
 const r=check([bright()]);assert.equal(r.claims[0].state,'possible_asr_unit_error');assert.deepEqual(r.claims[0].crossDecodeAlerts,['context_sensitive_unit','unit_disagreement']);
 assert.equal(r.claims[0].spokenWordsVerified,false);assert.equal(r.claims[0].manufacturerClaimsIndependentlyMeasured,false);
});
test('refresh rate correctly compares manufacturer claim, still no independent test',()=>{
 const c:ClaimHypothesis216={...bright(),claimId:'refresh',metricId:'refresh',conditionId:'max',value:120,heardUnit:'hertz'};
 const r=check([c]);assert.equal(r.claims[0].state,'spec_quantity_matches');assert.equal(r.rankingAuthorized,false);
});
test('market unknown with differing weights remains unresolved',()=>{assert.equal(check([weight()]).claims[0].state,'market_scope_unresolved');});
test('market bound produces exact result without transferring a different region',()=>{
 const x=weight();x.market='la';assert.equal(check([x]).claims[0].state,'spec_quantity_matches');
 x.market='uk';assert.equal(check([x]).claims[0].state,'spec_quantity_disagrees');
});
test('incomplete market pair cannot be silently blended',()=>{
 const x=weight();x.market='la';const f=facts.filter(f=>f.factId!=='w18la');assert.equal(check([x],f).claims[0].state,'insufficient_comparable_specs');
});
test('conflicting official observations in same market are not cherry picked',()=>{
 const x=weight();x.market='uk';const f=[...facts,spec('w17uk_new','phone17','uk','mass','nominal',233,'g')];
 assert.equal(check([x],f).claims[0].state,'conflicting_primary_pages');
});
test('reviewer instrumental measurement not validated by a matching manufacturer value',()=>{
 const x=bright();x.kind='reviewer_measurement_report';assert.equal(check([x]).claims[0].state,'invalid_measurement_inference');
});
test('condition mismatch prevents misleading confirmation of peak HDR versus outdoor',()=>{
 const x=bright();const f=[spec('brhdr','phone18','uk','brightness','peak_hdr',3000,'nit')];
 assert.equal(check([x],f).claims[0].state,'insufficient_comparable_specs');
});
test('variant mismatch prevents confirmation',()=>{
 const f=[spec('br17','phone17','uk','brightness','peak_outdoor',3000,'nit')];assert.equal(check([bright()],f).claims[0].state,'insufficient_comparable_specs');
});
test('unknown unit with mismatching value is not silently repaired',()=>{
 const f=[spec('bad','phone18','uk','brightness','peak_outdoor',3500,'nit')];assert.equal(check([bright()],f).claims[0].state,'spec_quantity_disagrees');
});
test('reject invented ASR quotes not present in segment',()=>{
 const x=bright();x.heardUnit='nits';assert.throws(()=>check([x]),/unsupported_asr_claim/);
});
test('reject fabricated numeric quantity not present in segment',()=>{
 const x=bright();x.value=3500;assert.throws(()=>check([x]),/unsupported_asr_claim/);
});
test('reject source shift to other uploaded video',()=>{
 const r={...receipt,observedUploadSha256:'c'.repeat(64)};assert.throws(()=>triagePrimaryClaims216({transcript,receipt:r,crossDecode,claims:[bright()],facts}),/receipt_identity/);
});
test('reject flags from another model',()=>{
 const c={...crossDecode,modelSha256:'c'.repeat(64)};assert.throws(()=>triagePrimaryClaims216({transcript,receipt,crossDecode:c,claims:[bright()],facts}),/crossdecode_identity/);
});
test('reject non-HTTPS and credentialed spec urls',()=>{
 for(const url of ['http://apple.com/specs','https://user:pass@apple.com/specs','https://apple.com:8080/specs']){
  const f=[{...facts[4],sourceUrl:url}];assert.throws(()=>check([bright()],f),/fact/);
 }
});
test('reject overstated authenticated source hashes in unreviewed facts',()=>{
 const f=[{...facts[4],sourceByteHash:'a'.repeat(64)}] as unknown as SpecObservation216[];
 assert.throws(()=>check([bright()],f),/fact/);
});
test('no transcript, publisher page content, or secret review note retained',()=>{
 const r=check([bright(),weight()]);const j=JSON.stringify(r);
 assert.equal(r.transcriptBodyRetained,false);assert.ok(!j.includes('reaching 3000 bits')&&!j.includes('phones shown'));
 assert.equal(r.sourcePagesByteAuthenticated,false);assert.equal(r.goldAccuracy,null);
});
test('output deterministic regardless of original input order',()=>{
 const a=check([weight(),bright()]);const b=check([bright(),weight()],[...facts].reverse());
 assert.deepEqual(a,b);
});
test('not every frame temporal proximity is actual validation',()=>{
 const r=check([bright()]);assert.deepEqual(r.claims[0].visualTemporalProximitySeconds,[51]);assert.equal(r.claims[0].reviewExperimentIndependentlyVerified,false);
});
test('an empty candidate collection is explicitly non-admissible',()=>{
 const r=check([]);assert.deepEqual(r.claims,[]);assert.equal(r.rankingAuthorized,false);assert.equal(r.trustBadgeAuthorized,false);
});
