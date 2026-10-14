import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluateVideoEvidence206,type BenchmarkDataset206,type Case206,type CaseJudgment206,
 type Prediction206,type PairPrediction206,type EventPair206} from '../src/phase206_video_evidence_benchmark.js';
const base='https://www.youtube.com/watch?v=';
const makeCase=(caseId:string,videoId:string,patch:Partial<Case206>={}):Case206=>({
 caseId,videoUrl:base+videoId,referenceUrl:base+videoId,categoryId:'coffee_machines',
 variantId:'fellow_es1',criterionId:'espresso_taste',disciplineId:'espresso_preparation',
 language:'en',sourceReviewId:'review_'+caseId,reviewBasis:'human_viewed_video',
 sourceKind:'synthetic_fixture',...patch});
const makeJudgment=(caseId:string,reviewerId:string,patch:Partial<CaseJudgment206>={}):CaseJudgment206=>({
 caseId,reviewerId,receiptId:reviewerId+'_'+caseId,blindToPrediction:true,
 claimKind:'specialist_result',expertise:'specialist_outcome_specific',
 modelScope:'exact_variant_confirmed',originality:'unresolved',commercial:'undetermined',
 timeSecond:130,...patch});
const makePrediction=(caseId:string,patch:Partial<Prediction206>={}):Prediction206=>({
 caseId,providerId:'native',providerVersion:'206.1',claimKind:'specialist_result',
 expertise:'specialist_outcome_specific',modelScope:'exact_variant_confirmed',
 originality:null,commercial:null,timeSecond:132,...patch});
const pair=(left:string,right:string,reviewerId:string,relation:EventPair206['relation']):EventPair206=>({
 left,right,reviewerId,receiptId:`pair_${reviewerId}_${left}_${right}`,blindToPrediction:true,relation});
const d=():BenchmarkDataset206=>({schema:'206.dataset.1',datasetId:'authored_bench',provenance:'authored_fixture',
 cases:[makeCase('a','aB1cD2eF3_4'),makeCase('b','zX6F_l_KreM')],
 judgments:[makeJudgment('a','reviewer1'),makeJudgment('a','reviewer2'),
  makeJudgment('b','reviewer1',{claimKind:'daily_use',expertise:'situated_experience',timeSecond:55}),
  makeJudgment('b','reviewer2',{claimKind:'daily_use',expertise:'situated_experience',timeSecond:55})],
 eventPairs:[pair('a','b','reviewer1','different_test_event'),pair('a','b','reviewer2','different_test_event')]});
const evaluate=(x:BenchmarkDataset206=d(),p:readonly Prediction206[]=[makePrediction('a'),makePrediction('b')],
 pp:readonly PairPrediction206[]=[{left:'a',right:'b',providerId:'native',providerVersion:'206.1',relation:'same_test_event'}])=>
 evaluateVideoEvidence206(x,p,pp,'native','206.1');
test('count genuine false test-event merges without claiming original experiment verification',()=>{
 const r=evaluate();assert.equal(r.eventPairs.eligible,1);assert.equal(r.eventPairs.falseMerges,1);
 assert.equal(r.sourceOriginalityAuthenticated,false);assert.equal(r.rankingsChanged,false);
 assert.equal(r.outputTrustBadgeAllowed,false);assert.equal(r.sourceTextStored,false);
});
test('separate field evaluations preserve aspect and expertise distinction',()=>{
 const r=evaluate();assert.equal(r.fields.claimKind.correct,1);assert.equal(r.fields.claimKind.incorrect,1);
 assert.equal(r.fields.expertise.correct,1);assert.equal(r.fields.expertise.incorrect,1);
 assert.equal(r.fields.originality.eligible,0);assert.equal(r.fields.originality.unresolvedGold,2);
 assert.equal(r.fields.claimKind.coverage,1);assert.equal(r.fields.claimKind.accuracyOnPredictions,.5);
});
test('abstention is counted, never silently omitted from coverage',()=>{
 const r=evaluate(d(),[makePrediction('a',{claimKind:null,expertise:null})],[]);
 assert.equal(r.fields.claimKind.abstained,2);assert.equal(r.fields.claimKind.coverage,0);
 assert.equal(r.eventPairs.abstained,1);assert.equal(r.eligibleTimestampPairs,2);
 assert.equal(r.timestampUnscored,1);
});
test('timestamp metric checks reviewed moment within 5 seconds',()=>{
 const r=evaluate(d(),[makePrediction('a',{timeSecond:135}),makePrediction('b',{timeSecond:75})],[]);
 assert.equal(r.timestampWithinFiveSeconds,1);
});
test('conflicts between independent reviewers do not become ground truth',()=>{
 const x=d();(x.judgments as CaseJudgment206[])[1]=makeJudgment('a','reviewer2',{claimKind:'daily_use'});
 const r=evaluate(x);assert.equal(r.fields.claimKind.conflicted,1);
 assert.equal(r.fields.claimKind.eligible,1);
 assert.ok(r.missingEvidenceReasonCodes.includes('annotator_disagreements_not_adjudicated'));
});
test('experiment event disagreements are excluded, not majority voted',()=>{
 const x=d();(x.eventPairs as EventPair206[])[1]=pair('a','b','reviewer2','same_test_event');
 assert.equal(evaluate(x).eventPairs.unresolvedGold,1);
});
test('known same event split is separately counted',()=>{
 const x=d();x.eventPairs=[pair('a','b','reviewer1','same_test_event'),pair('a','b','reviewer2','same_test_event')];
 assert.equal(evaluate(x,[],[{left:'a',right:'b',providerId:'native',providerVersion:'206.1',relation:'different_test_event'}]).eventPairs.falseSplits,1);
});
test('same event across unlike variants prohibited, distinct events permitted',()=>{
 const x=d();(x.cases as Case206[])[1]=makeCase('b','zX6F_l_KreM',{variantId:'aldi_coffee'});
 assert.equal(evaluate(x).eventPairs.falseMerges,1);
 x.eventPairs=[pair('a','b','reviewer1','same_test_event'),pair('a','b','reviewer2','same_test_event')];
 assert.throws(()=>evaluate(x),/phase206_event_scope/);
});
test('real public metadata cases are held out of gold scoring until source content reviewed',()=>{
 const x:BenchmarkDataset206={schema:'206.dataset.1',datasetId:'real_metadata',
 provenance:'source_linked_unblinded_pilot',cases:[makeCase('a','mAYbmcqPphc',{
 sourceReviewId:null,reviewBasis:'metadata_only',sourceKind:'public_metadata_lead'})],
 judgments:[],eventPairs:[]};
 const r=evaluate(x,[],[]);assert.equal(r.casesTotal,1);assert.equal(r.metadataOnlyCases,1);
 assert.equal(r.fields.claimKind.eligible,0);assert.equal(r.fields.claimKind.coverage,null);
 assert.ok(r.missingEvidenceReasonCodes.includes('no_dual_reviewed_content_labels'));
});
test('metadata cannot be promoted to gold simply by adding reviewer labels',()=>{
 const x=d();(x.cases as Case206[])[0]=makeCase('a','aB1cD2eF3_4',{
 sourceReviewId:null,reviewBasis:'metadata_only'});
 assert.throws(()=>evaluate(x),/phase206_metadata_has_gold/);
});
test('duplicate reviewer for same case rejected, no fake independent agreement',()=>{
 const x=d();(x.judgments as CaseJudgment206[])[1]=makeJudgment('a','reviewer1',{receiptId:'different_receipt'});
 assert.throws(()=>evaluate(x),/phase206_reviewer_independence/);
});
test('duplicate review receipts fail even if reviewer identities differ',()=>{
 const x=d();(x.judgments as CaseJudgment206[])[1]=makeJudgment('a','reviewer2',{receiptId:'reviewer1_a'});
 assert.throws(()=>evaluate(x),/phase206_judgment/);
});
test('unblinded self-generated predictions cannot be passed as gold',()=>{
 const x=d();(x.judgments as CaseJudgment206[])[0]=makeJudgment('a','reviewer1',{blindToPrediction:false} as any);
 assert.throws(()=>evaluate(x),/phase206_judgment/);
});
test('wrong provider version is not silently evaluated',()=>{
 assert.throws(()=>evaluate(d(),[makePrediction('a',{providerVersion:'fake'})]),/phase206_prediction/);
});
test('unexpected fields including whole transcript bodies are rejected',()=>{
 const x=d();(x.cases as any)[0].transcript='full proprietary caption body';
 assert.throws(()=>evaluate(x),/phase206_case/);
});
test('unexpected prediction text not allowed to leak into derived metrics',()=>{
 assert.throws(()=>evaluate(d(),[{...makePrediction('a'),transcript:'private text'} as any]),/phase206_prediction/);
});
test('malicious YouTube URL hosts rejected, valid canonical required',()=>{
 const x=d();(x.cases as Case206[])[0]=makeCase('a','aB1cD2eF3_4',{videoUrl:'https://youtube.com.evil.test/watch?v=aB1cD2eF3_4'});
 assert.throws(()=>evaluate(x),/phase203_/);
});
test('cannot fake duplicate scoped instances of same video',()=>{
 const x=d();(x.cases as Case206[])[1]=makeCase('b','aB1cD2eF3_4');
 assert.throws(()=>evaluate(x),/phase206_duplicate_scope/);
});
test('mixed reviews from non-specialist and specialist never auto promote to a score',()=>{
 const r=evaluate();assert.equal(r.independentScientificValidationClaimAllowed,false);
 assert.equal(r.unknownSourcePenaltyApplied,false);
});
test('metric is order invariant for independent reviewers and cases',()=>{
 const x=d(),r=evaluate(x);
 const shuffled:BenchmarkDataset206={...x,cases:[...x.cases].reverse(),judgments:[...x.judgments].reverse(),
 eventPairs:[...x.eventPairs].reverse()};
 assert.deepEqual(evaluate(shuffled),r);
});
test('pair predictions reject duplicated reversed keys',()=>{
 assert.throws(()=>evaluate(d(),[],[
 {left:'a',right:'b',providerId:'native',providerVersion:'206.1',relation:'same_test_event'},
 {left:'b',right:'a',providerId:'native',providerVersion:'206.1',relation:'same_test_event'}]),/phase206_pair_prediction/);
});
test('unresolved prediction event is abstention, not false merge',()=>{
 const r=evaluate(d(),[],[{left:'a',right:'b',providerId:'native',providerVersion:'206.1',relation:'unresolved'}]);
 assert.equal(r.eventPairs.falseMerges,0);assert.equal(r.eventPairs.abstained,1);
});
test('unknown human gold expertise cannot be scored as correct by unknown guess',()=>{
 const x=d();(x.judgments as CaseJudgment206[])[0]=makeJudgment('a','reviewer1',{expertise:'unknown'});
 (x.judgments as CaseJudgment206[])[1]=makeJudgment('a','reviewer2',{expertise:'unknown'});
 const r=evaluate(x,[makePrediction('a',{expertise:'unknown'})]);
 assert.equal(r.fields.expertise.unresolvedGold,1);assert.equal(r.fields.expertise.correct,0);
});
test('real source corpus refuses synthetic test fixture under real provenance',()=>{
 const x=d();x.provenance='independent_blind_annotations';
 assert.throws(()=>evaluate(x),/phase206_case/);
});
test('synthetic fixture cannot be passed as independent scientific validation',()=>{
 const r=evaluate();assert.equal(r.provenance,'authored_fixture');
 assert.ok(r.missingEvidenceReasonCodes.includes('not_independent_blind_benchmark'));
});
