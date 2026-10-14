import test from 'node:test';import assert from 'node:assert/strict';
import {evaluateLocalAsr212,type Transcript212,type ProvisionalReference212} from '../src/phase212_local_asr_evaluation.js';
const sha='a'.repeat(64),mod='b'.repeat(64);
const base=():Transcript212=>({schema:'pee212.local-asr.v1',uploadSha256:sha,durationSeconds:15,
 runtime:{engine:'faster_whisper_local',engineVersion:'1.2.1',modelSha256:mod,modelLabel:'local-base',
 inferenceMode:'local_cpu_int8',languageStrategy:'multilingual_windows',noRemoteInference:true,inputShaVerified:true,engineRan:true},
 segments:[{id:'s0',startSecond:0,endSecond:2,text:'This works',language:'en',languageBasis:'window_inference',
 words:[{startSecond:0,endSecond:.7,text:'This'},{startSecond:.8,endSecond:1.8,text:'works'}]},
 {id:'s1',startSecond:3,endSecond:6,text:'Funziona bene',language:'it',languageBasis:'window_inference',words:[]}]});
const ref=():ProvisionalReference212=>({status:'analyst_transcription_unverified',segments:[
 {id:'s0',startSecond:0,endSecond:2,text:'This works',language:'en'},
 {id:'s1',startSecond:3,endSecond:6,text:'Funziona bene',language:'it'}]});
function modify(f:(x:Transcript212)=>void){const x=base();f(x);return x;}
test('recognizes an inferred code switch without claiming language identity verified',()=>{
 const r=evaluateLocalAsr212(base());assert.equal(r.detectedLanguageTransitions,1);
 assert.deepEqual(r.languageCounts,{en:1,it:1});assert.equal(r.languageIdentityValidated,false);
 assert.equal(r.intraWindowCodeSwitchUnresolved,true);
});
test('does not persist transcript, words, phrases, or human reference',()=>{
 const r=evaluateLocalAsr212(base(),ref());const j=JSON.stringify(r);
 for(const sensitive of ['This works','Funziona bene','local-base'])assert.equal(j.includes(sensitive),false);
 assert.equal(r.transcriptTextRetained,false);assert.equal(r.independentGoldLabels,0);
});
test('provisional exact match produces diagnostic WER/CER zero but never scientific accuracy',()=>{
 const r=evaluateLocalAsr212(base(),ref());assert.equal(r.provisionalComparison.wer,0);
 assert.equal(r.provisionalComparison.cer,0);assert.equal(r.provisionalComparison.status,'analyst_diagnostic_only');
 assert.equal(r.provisionalComparison.referenceIsIndependentGold,false);
 assert.equal(r.rankingAuthorized,false);
});
test('substitution alters WER and CER',()=>{
 const t=modify(x=>x.segments[1].text='Funziona male');const r=evaluateLocalAsr212(t,ref());
 assert.equal(r.provisionalComparison.wer,.25);assert.ok(r.provisionalComparison.cer!>0);
});
test('boundary differences are measured only for matching segment IDs',()=>{
 const t=modify(x=>x.segments[1].startSecond=3.4);const r=evaluateLocalAsr212(t,ref());
 assert.equal(r.provisionalComparison.boundaryMaeSeconds,.1);assert.equal(r.provisionalComparison.matchedBoundarySegments,2);
});
test('missing reference does not manufacture accuracy',()=>{
 const r=evaluateLocalAsr212(base());assert.equal(r.provisionalComparison.wer,null);
 assert.equal(r.provisionalComparison.languageAgreement,null);
});
test('language agreement exists only for matched annotation language labels',()=>{
 const p=ref();p.segments[1].language='en';const r=evaluateLocalAsr212(base(),p);
 assert.equal(r.provisionalComparison.languageAgreement,.5);
});
test('single global language must not imply per-segment detection',()=>{
 const r=evaluateLocalAsr212(modify(t=>{t.runtime.languageStrategy='global_language';t.segments[0].languageBasis='global_only';t.segments[1].languageBasis='global_only';}));
 assert.equal(r.detectedLanguageTransitions,0);assert.equal(r.languageScope,'global_only');
});
test('malformed or unverified runtime rejected',()=>{
 for(const k of ['inputShaVerified','engineRan','noRemoteInference'] as const){assert.throws(()=>evaluateLocalAsr212(modify(t=>{(t.runtime as unknown as Record<string,unknown>)[k]=false})),/phase212/);}
});
test('invalid source and model hashes rejected',()=>{
 for(const k of ['uploadSha256'] as const)assert.throws(()=>evaluateLocalAsr212(modify(t=>{t[k]='bad';})),/phase212/);
 assert.throws(()=>evaluateLocalAsr212(modify(t=>{t.runtime.modelSha256='123';})),/phase212/);
});
test('word timing outside segment rejected',()=>{
 assert.throws(()=>evaluateLocalAsr212(modify(t=>{t.segments[0].words[0].endSecond=3;})),/phase212/);
});
test('word timestamp reversed rejected',()=>{
 assert.throws(()=>evaluateLocalAsr212(modify(t=>{t.segments[0].words[0].endSecond=0;})),/phase212/);
});
test('segment beyond video rejected',()=>{
 assert.throws(()=>evaluateLocalAsr212(modify(t=>{t.segments[1].endSecond=17;})),/phase212/);
});
test('duplicate IDs rejected',()=>{
 assert.throws(()=>evaluateLocalAsr212(modify(t=>{t.segments[1].id='s0';})),/phase212/);
});
test('unrealistic length rejected',()=>{
 assert.throws(()=>evaluateLocalAsr212(modify(t=>{t.durationSeconds=7201;})),/phase212/);
});
test('reference without human review status rejected',()=>{
 const p=ref();(p as unknown as Record<string,unknown>).status='independent_gold';
 assert.throws(()=>evaluateLocalAsr212(base(),p),/phase212/);
});
test('Japanese word error rate is diagnostic and CER remains available',()=>{
 const t=modify(x=>{x.segments=[{id:'j',startSecond:0,endSecond:2,text:'おいしい',language:'ja',languageBasis:'window_inference',words:[]}];});
 const r=evaluateLocalAsr212(t,{status:'analyst_transcription_unverified',segments:[{id:'j',startSecond:0,endSecond:2,text:'おいしい',language:'ja'}]});
 assert.equal(r.provisionalComparison.cer,0);assert.equal(r.rankingAuthorized,false);
});
test('language unknown is not coerced into English',()=>{
 const r=evaluateLocalAsr212(modify(t=>{t.segments[1].language=null;t.segments[1].languageBasis='unknown'}));
 assert.equal(r.languageCounts.und,1);assert.equal(r.detectedLanguageTransitions,0);
});
test('a content-free clip remains explicitly unvalidated',()=>{
 const r=evaluateLocalAsr212(modify(t=>t.segments=[]));assert.equal(r.segmentCount,0);assert.equal(r.independentGoldLabels,0);
});
