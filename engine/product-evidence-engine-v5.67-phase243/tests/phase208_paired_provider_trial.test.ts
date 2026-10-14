import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign as edSign} from 'node:crypto';
import {comparePairedVideoProviders208,type PairedTrialInput208,
 type TrialArm208} from '../src/phase208_paired_provider_trial.js';
import {caseScopeFingerprint207,freezeFingerprints207,freezeMessage207,
 caseReviewMessage207,type AdmissionRequest207,type CaseReviewClaim207,
 type ReviewerPolicy207,type PredictionFreeze207} from '../src/phase207_signed_benchmark_admission.js';
import {type Case206,type Prediction206,type CaseJudgment206} from '../src/phase206_video_evidence_benchmark.js';

const t1='2026-10-13T08:00:00Z',t2='2026-10-13T09:00:00Z',asOf='2026-10-13T10:00:00Z';
const keys=Array.from({length:3},()=>generateKeyPairSync('ed25519'));
const policy:ReviewerPolicy207={policyId:'phase208_test_only',anchors:keys.map((k,i)=>({
 keyId:`test_key_${i}`,principalId:i?`test_reviewer_${i}`:'test_coordinator',
 role:i?'independent_video_reviewer':'benchmark_coordinator',
 publicKeyPem:k.publicKey.export({type:'spki',format:'pem'}).toString(),
 activeFrom:'2026-10-12T00:00:00Z',activeThrough:'2026-10-15T00:00:00Z'}))};
const signature=<T>(payload:T,index:number,message:string)=>({payload,keyId:`test_key_${index}`,
 signatureBase64Url:edSign(null,Buffer.from(message),keys[index].privateKey).toString('base64url')});
const cases:Case206[]=[{
 caseId:'espresso_a',videoUrl:'https://www.youtube.com/watch?v=mAYbmcqPphc',
 referenceUrl:'https://www.youtube.com/watch?v=mAYbmcqPphc',categoryId:'coffee_machines',
 variantId:'exact_machine',criterionId:'espresso_outcome',disciplineId:'espresso_preparation',
 language:'it',sourceReviewId:'review_espresso_a',reviewBasis:'human_viewed_video',
 sourceKind:'reviewed_original_video'
},{caseId:'espresso_b',videoUrl:'https://www.youtube.com/watch?v=zX6F_l_KreM',
 referenceUrl:'https://www.youtube.com/watch?v=zX6F_l_KreM',categoryId:'coffee_machines',
 variantId:'exact_machine',criterionId:'espresso_outcome',disciplineId:'espresso_preparation',
 language:'it',sourceReviewId:'review_espresso_b',reviewBasis:'human_viewed_video',
 sourceKind:'reviewed_original_video'}];
// These are synthetic, imagined judgments. The real source links are NEVER
// portrayed as watched or verified by this test fixture.
function judgement(c:Case206,i:number,change:Partial<CaseJudgment206>={}):CaseJudgment206{
 return {caseId:c.caseId,reviewerId:`test_reviewer_${i}`,receiptId:`receipt_${c.caseId}_${i}`,
  blindToPrediction:true,claimKind:'specialist_result',expertise:'specialist_outcome_specific',
  modelScope:'exact_variant_confirmed',originality:'unresolved',commercial:'undetermined',
  timeSecond:120,...change};
}
function caseReviewsFor(cs:readonly Case206[]){
 return cs.flatMap(c=>[1,2].map(i=>{
  const payload:CaseReviewClaim207={schema:'pee207.case-review.v1',datasetId:'phase208_fixture',
   caseId:c.caseId,caseScopeSha256:caseScopeFingerprint207(c),sourceReviewId:c.sourceReviewId!,
   sourceVersionId:'imagined_test_only',accessReceiptId:'fixture_access_only',reviewedAt:t2,
   sourceExamined:'human_viewed_video',judgement:judgement(c,i)};
  return signature(payload,i,caseReviewMessage207(payload));
 }));
}
const sharedReviews=caseReviewsFor(cases);
function request(providerId:string,changes:Partial<Prediction206>[]|null=[]):AdmissionRequest207{
 const predictions=changes===null?[]:cases.map((c,i)=>({caseId:c.caseId,providerId,
  providerVersion:'208.fixture',claimKind:'specialist_result' as const,
  expertise:'specialist_outcome_specific' as const,modelScope:'exact_variant_confirmed' as const,
  originality:null,commercial:null,timeSecond:null,...changes[i]}));
 const f:PredictionFreeze207={schema:'pee207.freeze.v1',datasetId:'phase208_fixture',
  providerId,providerVersion:'208.fixture',...freezeFingerprints207(cases,predictions,[]),
  frozenAt:t1,blindAccessAttested:true};
 return {schema:'pee207.admission.v1',datasetId:'phase208_fixture',cases,predictions,
  pairPredictions:[],frozen:signature(f,0,freezeMessage207(f)),caseReviews:sharedReviews,
  pairReviews:[],policy,asOf};
}
function arm(armId:string,family:TrialArm208['family'],changes:Partial<Prediction206>[]|null=[]):TrialArm208{
 return {armId,family,runStatus:changes===null?'not_executed':'offline_output_submitted',
  admission:request(armId,changes)};
}
function trial(arms:TrialArm208[]=[arm('native','pee_native_205'),arm('pyabsa','pyabsa')]):PairedTrialInput208{
 return {schema:'pee208.paired-trial.v1',trialId:'trial_fixture',buyerUseCaseId:'espresso_traditional',
  categoryId:'coffee_machines',criteria:[{criterionId:'espresso_outcome',critical:true,
   expectedObservation:'specialist_result'}],arms};
}
const run=(arms?:TrialArm208[])=>comparePairedVideoProviders208(trial(arms));

test('shared signed synthetic fixture produces directional comparison but no scientific validation',()=>{
 const r=run([arm('native','pee_native_205'),arm('pyabsa','pyabsa',[
  {claimKind:'daily_use'},{claimKind:'specialist_result'}])]);
 assert.equal(r.resultState,'signed_research_labels_only');
 assert.equal(r.reviewedCasesWithTwoSignatures,2);
 const claim=r.pairs[0].fields.find(f=>f.field==='claimKind')!;
 assert.deepEqual([claim.eligible,claim.leftCorrectOnly,claim.bothCorrect],[2,1,1]);
 assert.equal(r.arms[0].essentialCriterionIdentification[0].identifiedCorrectly,2);
 assert.equal(r.arms[1].essentialCriterionIdentification[0].misclassified,1);
 for(const flag of ['independentHumanAnnotationAuthenticated','videoSourceBytesAuthenticated',
 'scientificAccuracyClaimAllowed','providerRuntimeMeasured','userPurchaseRecommendationChanged',
 'publicTrustBadgeAuthorized','statisticalSuperiorityClaimAllowed'] as const)assert.equal(r[flag],false);
});
test('prediction order cannot change paired counts',()=>{
 const a=arm('native','pee_native_205');a.admission.predictions=[...a.admission.predictions].reverse();
 const r=run([a,arm('pyabsa','pyabsa')]);assert.equal(r.pairs[0].fields[0].bothCorrect,2);
});
test('arm order is symmetric except left-right wording',()=>{
 const a=arm('native','pee_native_205');const b=arm('pyabsa','pyabsa',[{claimKind:'daily_use'},{}]);
 const x=run([a,b]).pairs[0].fields[0];const y=run([b,a]).pairs[0].fields[0];
 assert.equal(x.leftCorrectOnly,y.rightCorrectOnly);assert.equal(x.bothCorrect,y.bothCorrect);
});
test('metadata-only real leads may be compared only as missing evidence',()=>{
 const meta=cases.map(c=>({...c,sourceReviewId:null,reviewBasis:'metadata_only' as const,
  sourceKind:'public_metadata_lead' as const}));
 const reqs=['native','pyabsa'].map(providerId=>{
  const r=request(providerId,null);
  const p={...r.frozen.payload,...freezeFingerprints207(meta,[],[])};
  return {...r,cases:meta,caseReviews:[],frozen:signature(p,0,freezeMessage207(p))};
 });
 const r=run([{armId:'native',family:'pee_native_205',runStatus:'not_executed',admission:reqs[0]},
  {armId:'pyabsa',family:'pyabsa',runStatus:'not_executed',admission:reqs[1]}]);
 assert.equal(r.resultState,'unscorable_no_shared_gold');assert.equal(r.reviewedCasesWithTwoSignatures,0);
 assert.equal(r.pairs[0].fields[0].eligible,0);assert.deepEqual(r.missingCriticalCriterionIds,['espresso_outcome']);
 assert.ok(r.reasonCodes.includes('public_metadata_only_not_original_video_review'));
 assert.equal(r.arms[0].fieldResults.claimKind.accuracyOnPredictions,null);
});
test('both abstaining counts as abstentions and not as errors',()=>{
 const r=run([arm('native','pee_native_205',[{claimKind:null},{claimKind:null}]),
  arm('pyabsa','pyabsa',[{claimKind:null},{claimKind:null}])]);
 assert.equal(r.pairs[0].fields[0].bothAbstained,2);assert.equal(r.pairs[0].fields[0].bothWrong,0);
});
test('one-sided abstention is separate from paired win',()=>{
 const r=run([arm('native','pee_native_205',[{claimKind:null},{}]),arm('pyabsa','pyabsa')]);
 assert.equal(r.pairs[0].fields[0].rightOnlyResponded,1);
 assert.equal(r.pairs[0].fields[0].rightCorrectOnly,0);
});
test('two mistaken answers counted as both wrong',()=>{
 const r=run([arm('native','pee_native_205',[{claimKind:'daily_use'},{}]),
  arm('pyabsa','pyabsa',[{claimKind:'personal_preference'},{}])]);
 assert.equal(r.pairs[0].fields[0].bothWrong,1);
});
test('irrelevant outcome code cannot establish critical criterion',()=>{
 const t=trial();t.criteria=[{criterionId:'missing_criterion',critical:true,expectedObservation:'specialist_result'}];
 const r=comparePairedVideoProviders208(t);
 assert.deepEqual(r.missingCriticalCriterionIds,['missing_criterion']);
});
test('no label on the exact variant blocks criterion validation',()=>{
 const reviews=sharedReviews.map(s=>{
  const p={...s.payload,judgement:{...s.payload.judgement,modelScope:'unresolved' as const}};
  const i=s.keyId==='test_key_1'?1:2;
  return signature(p,i,caseReviewMessage207(p));
 });
 const a=arm('native','pee_native_205');a.admission.caseReviews=reviews;
 const b=arm('pyabsa','pyabsa');b.admission.caseReviews=reviews;
 const r=run([a,b]);assert.deepEqual(r.missingCriticalCriterionIds,['espresso_outcome']);
});
test('mismatched source variant rejected',()=>{
 const b=arm('pyabsa','pyabsa');b.admission.cases=[{...cases[0],variantId:'another'},cases[1]];
 assert.throws(()=>run([arm('native','pee_native_205'),b]),/phase208_not_same_sources_or_gold/);
});
test('different channel language rejected even with same URLs',()=>{
 const b=arm('pyabsa','pyabsa');b.admission.cases=[{...cases[0],language:'ja'},cases[1]];
 assert.throws(()=>run([arm('native','pee_native_205'),b]),/phase208_not_same_sources_or_gold/);
});
test('different source-review identity rejected',()=>{
 const b=arm('pyabsa','pyabsa');b.admission.cases=[{...cases[0],sourceReviewId:'alternate'},cases[1]];
 assert.throws(()=>run([arm('native','pee_native_205'),b]),/phase208_not_same_sources_or_gold/);
});
test('different gold labels rejected',()=>{
 const b=arm('pyabsa','pyabsa');b.admission.caseReviews=b.admission.caseReviews.slice(1);
 assert.throws(()=>run([arm('native','pee_native_205'),b]),/phase208_not_same_sources_or_gold/);
});
test('reordered gold does not make cohorts incomparable',()=>{
 const b=arm('pyabsa','pyabsa');b.admission.caseReviews=[...b.admission.caseReviews].reverse();
 assert.equal(run([arm('native','pee_native_205'),b]).reviewedCasesWithTwoSignatures,2);
});
test('trust anchor substitution not considered equivalent labels',()=>{
 const b=arm('pyabsa','pyabsa');b.admission.policy={...policy,policyId:'different_trust_policy'};
 assert.throws(()=>run([arm('native','pee_native_205'),b]),/phase208_not_same_sources_or_gold/);
});
test('different assessment instant cannot be silently combined',()=>{
 const b=arm('pyabsa','pyabsa');b.admission.asOf='2026-10-13T11:00:00Z';
 assert.throws(()=>run([arm('native','pee_native_205'),b]),/phase208_not_same_sources_or_gold/);
});
test('altered signed freeze rejected by reused Phase207 admission',()=>{
 const b=arm('pyabsa','pyabsa');b.admission.predictions[0].claimKind='commercial_pitch';
 assert.throws(()=>run([arm('native','pee_native_205'),b]),/phase207_invalid_freeze/);
});
test('declaring no execution with submitted outputs rejected',()=>{
 const b=arm('pyabsa','pyabsa');b.runStatus='not_executed';
 assert.throws(()=>run([arm('native','pee_native_205'),b]),/phase208_not_run_with_predictions/);
});
test('duplicate implementation family rejected despite different arm IDs',()=>{
 assert.throws(()=>run([arm('a','pee_native_205'),arm('b','pee_native_205')]),/phase208_duplicate_provider_family/);
});
test('third arm supported with identical reviewed cohort',()=>{
 const r=run([arm('native','pee_native_205'),arm('transcript','youtube_transcript_api'),arm('model','pyabsa')]);
 assert.equal(r.pairs.length,3);assert.equal(r.arms.length,3);
});
test('five arms supported but sixth forbidden',()=>{
 const arms=[arm('a','pee_native_205'),arm('b','youtubejs'),arm('c','youtube_transcript_api'),
  arm('d','pyabsa'),arm('e','other')];
 assert.equal(run(arms).pairs.length,10);
 assert.throws(()=>run([...arms,arm('f','other')]),/phase208_trial/);
});
test('two different names for same provider family are not independent baselines',()=>{
 assert.throws(()=>run([arm('native','pyabsa'),arm('elsewhere','pyabsa')]),/phase208_duplicate_provider_family/);
});
test('unknown category scope cannot slip into a provider experiment',()=>{
 const t=trial();t.categoryId='vacuums';
 assert.throws(()=>comparePairedVideoProviders208(t),/phase208_category_mismatch/);
});
test('no critical criteria is refused',()=>{
 const t=trial();t.criteria=[{criterionId:'espresso_outcome',critical:false,
  expectedObservation:'specialist_result'}];
 assert.throws(()=>comparePairedVideoProviders208(t),/phase208_criteria/);
});
test('prototype injection into a trial request is refused',()=>{
 const x={...trial(),reviewText:'forbidden'};
 assert.throws(()=>comparePairedVideoProviders208(x as PairedTrialInput208),/phase208_trial/);
});
test('source text cannot leave via comparison output',()=>{
 const r=run();const json=JSON.stringify(r);
 assert.ok(!json.includes('accessReceiptId'));assert.ok(!json.includes('caseReviewId'));
 assert.equal(r.publisherFullTextRetained,false);
});
test('provider implementation not_run produces null accuracy even alongside synthetic gold',()=>{
 const r=run([arm('native','pee_native_205'),arm('transcript','youtube_transcript_api',null)]);
 assert.equal(r.arms[1].fieldResults.claimKind.accuracyOnPredictions,null);
 assert.equal(r.pairs[0].fields[0].leftOnlyResponded,2);
 assert.ok(r.reasonCodes.includes('some_provider_implementations_not_run'));
});
test('one signed reviewer never allows paired accuracy',()=>{
 const a=arm('native','pee_native_205');a.admission.caseReviews=a.admission.caseReviews.filter(x=>x.keyId==='test_key_1');
 const b=arm('pyabsa','pyabsa');b.admission.caseReviews=a.admission.caseReviews;
 const r=run([a,b]);assert.equal(r.resultState,'unscorable_no_shared_gold');
 assert.equal(r.pairs[0].fields[0].eligible,0);
});

test('malformed arm does not crash outside the trial protocol',()=>{
 const t=trial();(t.arms as unknown[])[1]={armId:'broken',family:'pyabsa',runStatus:'not_executed',admission:null};
 assert.throws(()=>comparePairedVideoProviders208(t),/phase208_malformed_arm/);
});
