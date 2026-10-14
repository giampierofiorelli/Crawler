import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign as edSign,type KeyObject} from 'node:crypto';
import {type Signed200} from '../src/phase200_signed_source_publication_gate.js';
import {admitSignedBenchmark207,caseScopeFingerprint207,freezeFingerprints207,
 freezeMessage207,caseReviewMessage207,pairReviewMessage207,
 type ReviewerPolicy207,type AdmissionRequest207,type CaseReviewClaim207,
 type PairReviewClaim207,type PredictionFreeze207} from '../src/phase207_signed_benchmark_admission.js';
import {type Case206,type CaseJudgment206,type EventPair206,type Prediction206,
 type PairPrediction206} from '../src/phase206_video_evidence_benchmark.js';

const makeKeys=()=>Array.from({length:3},()=>generateKeyPairSync('ed25519'));
const keys=makeKeys();
const now='2026-10-13T09:55:00Z',freezeTime='2026-10-13T09:00:00Z',viewTime='2026-10-13T09:30:00Z';
const policy:ReviewerPolicy207={policyId:'controlled_video_benchmark',anchors:keys.map((k,i)=>({
 keyId:`key_${i}`,principalId:i===0?'benchmark_ops':`reviewer_${i}`,
 role:i===0?'benchmark_coordinator':'independent_video_reviewer',
 publicKeyPem:k.publicKey.export({format:'pem',type:'spki'}).toString(),
 activeFrom:'2026-10-01T00:00:00Z',activeThrough:'2026-11-01T00:00:00Z'}))};
const sign=<T>(p:T,ki:number,message:string):Signed200<T>=>({payload:p,keyId:`key_${ki}`,
 signatureBase64Url:edSign(null,Buffer.from(message),keys[ki].privateKey as KeyObject).toString('base64url')});
const c=(id:string,video:string,patch:Partial<Case206>={}):Case206=>({caseId:id,
 videoUrl:`https://www.youtube.com/watch?v=${video}`,
 referenceUrl:`https://www.youtube.com/watch?v=${video}`,
 categoryId:'coffee_machines',variantId:'machine_model',criterionId:'espresso_result',
 disciplineId:'espresso_preparation',language:'it',sourceReviewId:'source_'+id,
 reviewBasis:'human_viewed_video',sourceKind:'reviewed_original_video',...patch});
const j=(caseId:string,i:number,patch:Partial<CaseJudgment206>={}):CaseJudgment206=>({caseId,
 reviewerId:`reviewer_${i}`,receiptId:`case_${caseId}_${i}`,blindToPrediction:true,
 claimKind:'specialist_result',expertise:'specialist_outcome_specific',
 modelScope:'exact_variant_confirmed',originality:'unresolved',commercial:'undetermined',
 timeSecond:140,...patch});
const p=(caseId:string,patch:Partial<Prediction206>={}):Prediction206=>({caseId,
 providerId:'native',providerVersion:'207.0',claimKind:'specialist_result',
 expertise:'specialist_outcome_specific',modelScope:'exact_variant_confirmed',
 originality:null,commercial:null,timeSecond:141,...patch});
const makeReview=(caseObj:Case206,i:number,patch:Partial<CaseReviewClaim207>={})=>{
 const payload:CaseReviewClaim207={schema:'pee207.case-review.v1',datasetId:'phase207_bench',
 caseId:caseObj.caseId,caseScopeSha256:caseScopeFingerprint207(caseObj),
 sourceReviewId:caseObj.sourceReviewId!,sourceVersionId:'annotator_view_01',
 accessReceiptId:'source_access_001',reviewedAt:viewTime,
 sourceExamined:caseObj.reviewBasis as 'human_viewed_video',judgement:j(caseObj.caseId,i),...patch};
 return sign(payload,i,caseReviewMessage207(payload));
};
const makePair=(a:Case206,b:Case206,i:number,rel:EventPair206['relation']='different_test_event',
 patch:Partial<PairReviewClaim207>={})=>{
 const payload:PairReviewClaim207={schema:'pee207.pair-review.v1',datasetId:'phase207_bench',
 left:a.caseId,right:b.caseId,leftScopeSha256:caseScopeFingerprint207(a),
 rightScopeSha256:caseScopeFingerprint207(b),sourceReviewIds:[a.sourceReviewId!,b.sourceReviewId!],
 reviewedAt:viewTime,judgement:{left:a.caseId,right:b.caseId,reviewerId:`reviewer_${i}`,
 receiptId:`pair_${i}`,blindToPrediction:true,relation:rel},...patch};
 return sign(payload,i,pairReviewMessage207(payload));
};
const setup=(two=true):AdmissionRequest207=>{
 const cases=[c('espresso_a','mAYbmcqPphc'),c('espresso_b','zX6F_l_KreM')];
 const predictions=cases.map(v=>p(v.caseId));
 const pairPredictions:PairPrediction206[]=[{left:cases[0].caseId,right:cases[1].caseId,
 providerId:'native',providerVersion:'207.0',relation:'same_test_event'}];
 const fingerprints=freezeFingerprints207(cases,predictions,pairPredictions);
 const frozen:PredictionFreeze207={schema:'pee207.freeze.v1',datasetId:'phase207_bench',
 providerId:'native',providerVersion:'207.0',...fingerprints,
 frozenAt:freezeTime,blindAccessAttested:true};
 return {schema:'pee207.admission.v1',datasetId:'phase207_bench',cases,predictions,
 pairPredictions,frozen:sign(frozen,0,freezeMessage207(frozen)),
 caseReviews:two?cases.flatMap(x=>[makeReview(x,1),makeReview(x,2)]):[],
 pairReviews:two?[makePair(cases[0],cases[1],1),makePair(cases[0],cases[1],2)]:[],
 policy,asOf:now};
};
const run=(x:AdmissionRequest207=setup())=>admitSignedBenchmark207(x);

test('two signed labelers produce reviewed benchmark fields but no scientific certification',()=>{
 const r=run();assert.equal(r.caseGoldAdmitted,2);assert.equal(r.pairGoldAdmitted,1);
 assert.equal(r.benchmark.fields.claimKind.correct,2);assert.equal(r.benchmark.eventPairs.falseMerges,1);
 assert.equal(r.realScientificAccuracyClaimAllowed,false);assert.equal(r.actualOriginalVideoAccessVerified,false);
 assert.equal(r.reviewerIndependenceProvenBySignature,false);assert.equal(r.productRankingModified,false);
 assert.equal(r.rawVideoOrTranscriptStored,false);
});
test('no annotations is no gold data and no reported accuracy',()=>{
 const r=run(setup(false));assert.equal(r.caseGoldAdmitted,0);
 assert.equal(r.benchmark.fields.claimKind.accuracyOnPredictions,null);
 assert.equal(r.benchmark.fields.claimKind.eligible,0);
 assert.equal(r.heldCases.length,2);
});
test('one reviewer does not constitute independent corroboration',()=>{
 const x=setup();x.caseReviews=x.caseReviews.slice(0,1);
 x.pairReviews=[];const r=run(x);assert.equal(r.caseGoldAdmitted,0);
 assert.ok(r.rejected.some(v=>v.reason==='missing_two_distinct_reviewers'));
});
test('signing payload key absent from policy is rejected',()=>{
 const x=setup();x.caseReviews=[{...x.caseReviews[0],keyId:'alien'},...x.caseReviews.slice(1)];
 const r=run(x);assert.equal(r.caseGoldAdmitted,1);assert.ok(r.rejected.some(v=>v.reason==='invalid_signature'));
});
test('signed review tampering changes captured judgment and invalidates signature',()=>{
 const x=setup();x.caseReviews=[{...x.caseReviews[0],payload:{...x.caseReviews[0].payload,
 judgement:{...x.caseReviews[0].payload.judgement,claimKind:'personal_preference'}}},
 ...x.caseReviews.slice(1)];
 const r=run(x);assert.ok(r.rejected.some(v=>v.reason==='invalid_signature'));
});
test('signed reviewer identity must match out-of-band configured principal',()=>{
 const x=setup();x.caseReviews=[makeReview(x.cases[0],1,{judgement:j('espresso_a',1,{reviewerId:'another'})}),
  ...x.caseReviews.slice(1)];
 assert.ok(run(x).rejected.some(v=>v.reason==='reviewer_identity_mismatch'));
});
test('untrusted coordinator freeze fails closed',()=>{
 const x=setup();x.frozen={...x.frozen,keyId:'key_1'};
 assert.throws(()=>run(x),/phase207_invalid_freeze/);
});
test('freeze digest binds case set, including exact variant',()=>{
 const x=setup();x.cases=[{...x.cases[0],variantId:'different_product'},x.cases[1]];
 assert.throws(()=>run(x),/phase207_invalid_freeze/);
});
test('freeze digest binds prediction and prevents replacing result after review',()=>{
 const x=setup();x.predictions=[p('espresso_a',{claimKind:'commercial_pitch'}),p('espresso_b')];
 assert.throws(()=>run(x),/phase207_invalid_freeze/);
});
test('prediction order does not break valid freeze',()=>{
 const x=setup();x.cases=[...x.cases].reverse();x.predictions=[...x.predictions].reverse();
 x.pairPredictions=[...x.pairPredictions].reverse();
 assert.equal(run(x).caseGoldAdmitted,2);
});
test('signature binds exact review source version',()=>{
 const x=setup();x.caseReviews=[{...x.caseReviews[0],payload:{...x.caseReviews[0].payload,
 sourceVersionId:'later_version'}},...x.caseReviews.slice(1)];
 assert.ok(run(x).rejected.some(v=>v.reason==='invalid_signature'));
});
test('case scope binds YouTube url and language',()=>{
 const x=setup();x.cases=[{...x.cases[0],language:'ja'},x.cases[1]];
 assert.throws(()=>run(x),/phase207_invalid_freeze/);
});
test('metadata-only leads cannot acquire gold simply from signed review',()=>{
 const x=setup();x.cases=[{...x.cases[0],reviewBasis:'metadata_only',
 sourceReviewId:null,sourceKind:'public_metadata_lead'},x.cases[1]];
 const f=freezeFingerprints207(x.cases,x.predictions,x.pairPredictions);
 const frozen={...x.frozen.payload,...f};x.frozen=sign(frozen,0,freezeMessage207(frozen));
 const r=run(x);assert.equal(r.caseGoldAdmitted,1);
 assert.ok(r.rejected.some(v=>v.reason==='review_scope'));
});
test('transcript-reviewed case is distinct from human-viewed footage',()=>{
 const x=setup();x.cases=[{...x.cases[0],reviewBasis:'permitted_transcript_checked'},x.cases[1]];
 const f=freezeFingerprints207(x.cases,x.predictions,x.pairPredictions);
 const frozen={...x.frozen.payload,...f};x.frozen=sign(frozen,0,freezeMessage207(frozen));
 assert.ok(run(x).rejected.some(v=>v.reason==='review_scope'));
});
test('duplicate receipt across two cases does not double-count',()=>{
 const x=setup();x.caseReviews=[...x.caseReviews.slice(0,2),
 makeReview(x.cases[1],1,{judgement:j('espresso_b',1,{receiptId:'case_espresso_a_1'})}),
 x.caseReviews[3]];
 assert.ok(run(x).rejected.some(v=>v.reason==='duplicate_receipt'));
});
test('expired signing key cannot authenticate gold',()=>{
 const x=setup();x.policy={...policy,anchors:policy.anchors.map(a=>a.keyId==='key_1'?{
  ...a,activeThrough:'2026-10-13T09:20:00Z'}:a)};
 assert.equal(run(x).caseGoldAdmitted,0);
});
test('same public key reused by alternate identity cannot fake two reviewers',()=>{
 const x=setup();x.policy={...policy,anchors:policy.anchors.map(a=>a.keyId==='key_2'?{
 ...a,publicKeyPem:policy.anchors[1].publicKeyPem}:a)};
 assert.throws(()=>run(x),/phase207_duplicate_public_key/);
});
test('same reviewer principal assigned to two distinct keys is rejected',()=>{
 const x=setup();x.policy={...policy,anchors:policy.anchors.map(a=>a.keyId==='key_2'?{
 ...a,principalId:'reviewer_1'}:a)};
 assert.throws(()=>run(x),/phase207_trust_anchor/);
});
test('invalid event-pair source association not admitted',()=>{
 const x=setup();x.pairReviews=[makePair(x.cases[0],x.cases[1],1,'different_test_event',{sourceReviewIds:['source_espresso_a','source_elsewhere']}),x.pairReviews[1]];
 assert.equal(run(x).pairGoldAdmitted,0);
});
test('event review text injections forbidden by strict schema',()=>{
 const x=setup();x.pairReviews=[{...x.pairReviews[0],payload:{...x.pairReviews[0].payload,
 transcript:'copied original transcript'}} as any,x.pairReviews[1]];
 assert.ok(run(x).rejected.some(v=>v.reason==='event_scope'));
});
test('no copying editorial text into output',()=>{
 const r=run();const obj=JSON.stringify(r);
 assert.ok(!obj.includes('fullTranscript'));assert.equal(r.benchmark.sourceTextStored,false);
});
test('untrusted video url rejected by original Phase203 canonical parser',()=>{
 const x=setup();x.cases=[{...x.cases[0],videoUrl:'https://www.youtube.com.bad.test/watch?v=mAYbmcqPphc'},x.cases[1]];
 assert.throws(()=>run(x),/phase203_url/);
});
test('reviewer claim without blindness attestation is refused even when signed',()=>{
 const x=setup();x.caseReviews=[makeReview(x.cases[0],1,{judgement:j('espresso_a',1,{blindToPrediction:false} as any)}),
 ...x.caseReviews.slice(1)];
 assert.ok(run(x).rejected.some(v=>v.reason==='review_scope'));
});
test('reviews predating frozen predictions not accepted',()=>{
 const x=setup();x.caseReviews=[makeReview(x.cases[0],1,{reviewedAt:'2026-10-13T08:59:59Z'}),...x.caseReviews.slice(1)];
 assert.ok(run(x).rejected.some(v=>v.reason==='review_scope'));
});
test('signed case cannot be reassigned to another case',()=>{
 const x=setup();x.caseReviews=[{...x.caseReviews[0],payload:{...x.caseReviews[0].payload,
 caseId:'espresso_b'}},...x.caseReviews.slice(1)];
 assert.ok(run(x).rejected.some(v=>v.reason==='review_scope'));
});
test('operator cannot provide full transcript as extra input field',()=>{
 const x=setup() as any;x.transcript='unauthorized full captions';
 assert.throws(()=>run(x),/phase207_request/);
});
test('pair review with two signer agreement cannot turn award into product certification',()=>{
 const r=run();assert.equal(r.benchmark.outputTrustBadgeAllowed,false);
 assert.equal(r.benchmark.independentScientificValidationClaimAllowed,false);
});
