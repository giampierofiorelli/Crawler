import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeWhisperCppWindow213} from '../src/phase213_whispercpp_normalization.js';
import {evaluateLocalAsr212} from '../src/phase212_local_asr_evaluation.js';
const h='a'.repeat(64),m='b'.repeat(64);
const ctx=()=>({uploadSha256:h,modelSha256:m,modelLabel:'ggml-base.bin',durationSeconds:41,
 offsetSeconds:15,windowSeconds:15,engineVersion:'1.8.0'});
const fixture=()=>({params:{language:'auto',translate:false},model:{multilingual:true},result:{language:'it'},
 transcription:[{offsets:{from:1200,to:2900},text:' Funziona bene'},
 {offsets:{from:3000,to:4400},text:' Anche questo'}]});
test('whisper.cpp offsets are milliseconds, shifted once to absolute video seconds',()=>{
 const t=normalizeWhisperCppWindow213(fixture(),ctx());
 assert.equal(t.segments[0].startSecond,16.2);assert.equal(t.segments[0].endSecond,17.9);
 assert.equal(t.segments[1].startSecond,18);assert.equal(t.runtime.engine,'whispercpp_local');
});
test('multilingual result uses window inference not certified word language',()=>{
 const t=normalizeWhisperCppWindow213(fixture(),ctx());assert.equal(t.segments[0].language,'it');
 assert.equal(t.segments[0].languageBasis,'window_inference');assert.deepEqual(t.segments[0].words,[]);
 const r=evaluateLocalAsr212(t);assert.equal(r.engineRan,true);assert.equal(r.engine,'whispercpp_local');assert.equal(r.wordCount,0);
 assert.equal(r.languageIdentityValidated,false);assert.ok(r.criticalMissing.includes('word_timing_not_validated_from_whispercpp_segment_output'));
});
test('transcript and local model label are not retained in the evaluation',()=>{
 const r=evaluateLocalAsr212(normalizeWhisperCppWindow213(fixture(),ctx()));
 const j=JSON.stringify(r);for(const t of ['Funziona','Anche','ggml-base.bin'])assert.ok(!j.includes(t));
 assert.equal(r.rankingAuthorized,false);assert.equal(r.trustBadgeAuthorized,false);
});
test('wrong time units fail closed, preventing millisecond/second confusion',()=>{
 const f=fixture();f.transcription[0].offsets.from=120000;assert.throws(()=>normalizeWhisperCppWindow213(f,ctx()),/phase213_timing/);
});
test('translation rather than transcription is rejected',()=>{
 const f=fixture();f.params.translate=true;assert.throws(()=>normalizeWhisperCppWindow213(f,ctx()),/phase213_cli_json/);
});
test('English-only weights are refused for multilingual pilot',()=>{
 const f=fixture();f.model.multilingual=false;assert.throws(()=>normalizeWhisperCppWindow213(f,ctx()),/phase213_cli_json/);
});
test('missing genuine CLI fields rejected',()=>{
 for(const f of [null,{}, {params:{language:'auto',translate:false},transcription:[]},
 {params:{language:'it',translate:false},model:{multilingual:true},result:{language:'it'},transcription:[]}])
 assert.throws(()=>normalizeWhisperCppWindow213(f,ctx()),/phase213_cli_json/);
});
test('different variants and evidence are not inferred from transcript content',()=>{
 const r=evaluateLocalAsr212(normalizeWhisperCppWindow213(fixture(),ctx()));
 assert.equal(r.independentGoldLabels,0);assert.equal(r.provisionalComparison.wer,null);
});
test('no language is not silently translated to English',()=>{
 const f=fixture();(f.result as {language:unknown}).language='unknown';
 const r=evaluateLocalAsr212(normalizeWhisperCppWindow213(f,ctx()));assert.equal(r.languageCounts.und,2);
});
test('source and model hashes must both be SHA256',()=>{
 assert.throws(()=>normalizeWhisperCppWindow213(fixture(),{...ctx(),modelSha256:'wrong'}),/phase213_context/);
 assert.throws(()=>normalizeWhisperCppWindow213(fixture(),{...ctx(),uploadSha256:'wrong'}),/phase213_context/);
});
test('clipping beyond video duration or allotted window rejected',()=>{
 const f=fixture();f.transcription[0].offsets.to=15500;
 assert.throws(()=>normalizeWhisperCppWindow213(f,ctx()),/phase213_timing/);
});
test('one valid window alone never proves rapid code switching',()=>{
 const r=evaluateLocalAsr212(normalizeWhisperCppWindow213(fixture(),ctx()));
 assert.equal(r.intraWindowCodeSwitchUnresolved,true);
});
test('false cross-engine compute types rejected',()=>{
 const t=normalizeWhisperCppWindow213(fixture(),ctx());
 t.runtime.inferenceMode='local_cpu_int8';assert.throws(()=>evaluateLocalAsr212(t),/phase212_input/);
});
test('numeric and malformed text entries rejected',()=>{
 const f=fixture();(f.transcription[0] as {text:unknown}).text=12;
 assert.throws(()=>normalizeWhisperCppWindow213(f,ctx()),/phase213_segment/);
});
