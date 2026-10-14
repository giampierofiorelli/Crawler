import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {analyzeEnglishReviewWithLocalHints158} from '../src/phase158_offline_inference_coordination.js';
import type {ReaderInput139} from '../src/phase139_unmarked_english_candidate_reader.js';
const t='The GE GTS22KGNRWW refrigerator is quieter than the Maytag MRT311FFFE. The GE uses less power.';
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
const input=():ReaderInput139=>({document:{text:t,sha256:hash(t),source:{id:'158',originalDocumentId:'158',url:'https://example.org/reviews',title:'GE GTS22KGNRWW Review',role:'original_product_test'}}});
const output=(v:any[]=[]):any=>({phase:158,runtime:'offline_local_gliner2',sourceSha256:hash(t),
  checkpointFilesystemVerified:true,scientificEvidence:false,identityMergeAuthorized:false,rankingAuthorized:false,predictions:v,truncated:false});
test('without weights model does not silently claim inference',()=>{
 const r=analyzeEnglishReviewWithLocalHints158(input());
 assert.equal(r.neuralModelExecutedWithinPEE,false);assert.equal(r.neuralInputAccepted,false);
 assert.equal(r.neuralHypotheses.length,0);assert.ok(r.issues.includes('offline_neural_checkpoint_not_supplied'));
});
test('aligns valid local spans but cannot accept canonical entity identity',()=>{
 const s=t.indexOf('GE GTS22KGNRWW');const r=analyzeEnglishReviewWithLocalHints158(input(),output([
  {start:s,end:s+14,surface:'GE GTS22KGNRWW',label:'product',confidence:0.91}]));
 assert.equal(r.localRunnerClaimedExecution,true);assert.equal(r.neuralHypotheses.length,1);
 assert.equal(r.neuralHypotheses[0].identityVerified,false);assert.equal(r.rankingAuthorized,false);
 assert.equal(r.canonicalWriteAuthorized,false);
});
test('wrong source digest never merged',()=>{
 const x=output();x.sourceSha256='0'.repeat(64);
 const r=analyzeEnglishReviewWithLocalHints158(input(),x);
 assert.equal(r.neuralInputAccepted,false);assert.ok(r.issues.includes('invalid_or_unbound_local_inference_output'));
});
test('hallucinated and illegal offsets are skipped instead of accepted',()=>{
 const s=t.indexOf('Maytag');const r=analyzeEnglishReviewWithLocalHints158(input(),output([
  {start:s,end:s+6,surface:'BOSCH!',label:'product',confidence:0.99},
  {start:-2,end:2000,surface:'irrelevant',label:'brand',confidence:0.9},
  {start:s,end:s+6,surface:'Maytag',label:'product',confidence:0.72}]));
 assert.equal(r.neuralHypotheses.length,1);assert.ok(r.issues.includes('unverifiable_neural_span_skipped'));
});
test('untrusted, unauthorised model outputs are rejected',()=>{
 const x=output();x.rankingAuthorized=true;
 assert.equal(analyzeEnglishReviewWithLocalHints158(input(),x).neuralInputAccepted,false);
});
test('structured product claims remain separate from observations',()=>{
 const r=analyzeEnglishReviewWithLocalHints158(input(),null,{'json-ld':[{'@type':'Product',name:'GE GTS22KGNRWW',additionalProperty:[{name:'Noise',value:'40 dBA'}]}]});
 assert.equal(r.structured?.products[0].attributes[0].scientificEvidence,false);
 assert.equal(r.rankingAuthorized,false);assert.equal(r.heuristic.modelInferencePerformed,false);
});
test('determinism and digest integrity',()=>{
 assert.deepEqual(analyzeEnglishReviewWithLocalHints158(input()),analyzeEnglishReviewWithLocalHints158(input()));
 const x=input();x.document.sha256='bad';assert.throws(()=>analyzeEnglishReviewWithLocalHints158(x),/sha_mismatch/);
});
