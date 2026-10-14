import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runReviewBatch160} from '../src/phase160_batch_review_pipeline.js';
import type {BatchDoc160,BatchManifest160,ExternalNeuralBatch160} from '../src/phase160_batch_review_pipeline.js';
import {auditAttributes160} from '../src/phase160_attribute_eval.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const pilot=JSON.parse(readFileSync('research/phase159/GLINER25-COLAB-CONSTRUCTED-PILOT.json','utf8')) as ExternalNeuralBatch160;
const make=(id:string,text:string,kind:BatchDoc160['kind']='constructed'):BatchDoc160=>({id,kind,
 rightsBasis:kind==='constructed'?'constructed_original':kind==='published_short_excerpt'?'short_citation_research':'document_owner',
 rightsStatement:'Original constructed example; no third party rights asserted',
 category:'refrigerator',sourceTitle:id,sourceUrl:'https://example.org/review/test',sourceRole:'original_product_test',
 text,sha256:sha(text)});
const manifest=(...documents:BatchDoc160[]):BatchManifest160=>({protocol:'pee.phase160.batch.v1',datasetId:'local_pilot_160',documents});
test('batch native-only on two English inputs is deterministic and always quarantines evidence authority',()=>{
 const a=manifest(make('test1','Our review tests the Maytag MRT311FFFE refrigerator.'),make('test2','We tested the Breville Bambino coffee machine.'));
 const x=runReviewBatch160(a),y=runReviewBatch160(a);
 assert.deepEqual(x,y);assert.equal(x.cases.length,2);assert.equal(x.mode,'native_only');
 assert.equal(x.safety.canonicalWriteAuthorized,false);assert.equal(x.safety.rankingAuthorized,false);
 assert.ok(x.cases.every(c=>!c.neuralProcessed&&!c.sourceAuthenticated));
});
test('real externally executed two cases are coordinated in one batch',()=>{
 const m=manifest(make('constructed_fridge',pilot.cases.constructed_fridge.input),make('constructed_coffee',pilot.cases.constructed_coffee.input));
 const result=runReviewBatch160(m,pilot);assert.equal(result.mode,'native_and_external_neural');
 assert.equal(result.cases[0].neuralSpanCount,7);assert.equal(result.cases[1].neuralSpanCount,5);
 assert.ok(result.cases[0].featureValueSummaries.some(x=>x.value==='44.9 dBA'));
 assert.equal(result.cases[0].roleSummaries.find(x=>x.surface==='MRT311FFFE')?.status,'explicitly_tested');
 assert.equal(result.cases[1].roleSummaries.find(x=>x.surface==='Breville Bambino')?.status,'explicitly_not_tested');
});
test('a bad neural offset quarantines its source without preventing another case from completing',()=>{
 const m=manifest(make('constructed_fridge',pilot.cases.constructed_fridge.input),make('constructed_coffee',pilot.cases.constructed_coffee.input));
 const bad=structuredClone(pilot);bad.cases.constructed_fridge.entities.measured_value[0].text='not the source';
 const result=runReviewBatch160(m,bad);assert.equal(result.cases[0].result,'quarantined');
 assert.equal(result.cases[1].result,'processed');assert.equal(result.cases[1].neuralProcessed,true);
 assert.equal(result.mode,'mixed');assert.equal(result.cases[0].rankingAuthorized,false);
});
test('rejects duplicate ids, wrong source digest, publisher full review without rights, fake gold',()=>{
 const a=make('a','Product A was tested.');
 assert.throws(()=>runReviewBatch160(manifest(a,a)),/duplicate_document/);
 const b=make('b','Product B was tested.');b.sha256='00';
 assert.throws(()=>runReviewBatch160(manifest(b)),/digest_or_length/);
 const c=make('c','A product comparison.','rights_permitted_full_review');c.rightsBasis='short_citation_research';
 assert.throws(()=>runReviewBatch160(manifest(c)),/rights_declaration/);
 const d=make('d','We tested the product.');d.independentGoldAvailable=true;
 assert.throws(()=>runReviewBatch160(manifest(d)),/independent_annotation/);
});
test('batch hard budget of 100 and extra neural ids rejected',()=>{
 const texts=Array.from({length:101},(_,i)=>make(`a${i}`,'We tested Product model A2022.'));
 assert.throws(()=>runReviewBatch160(manifest(...texts)),/invalid_manifest/);
 const r=structuredClone(pilot);r.cases.nonexistent=r.cases.constructed_fridge;
 assert.throws(()=>runReviewBatch160(manifest(make('constructed_fridge',pilot.cases.constructed_fridge.input)),r),/untrusted_external/);
});
test('full review contract requires exact source URL, title, and digest before neural spans are accepted',()=>{
 const text='Our review tests the DeLonghi Dedica Duo. '.repeat(20);
 const doc=make('fullreview',text,'rights_permitted_full_review');
 const offsets={product_model:[{text:'DeLonghi Dedica Duo',start:21,end:40,confidence:0.9}],brand:[],product_feature:[],measured_value:[]};
 const report=structuredClone(pilot);report.cases={fullreview:{input:text,source_url:doc.sourceUrl,source_title:doc.sourceTitle,
  source_sha256:sha(text),entities:offsets,seconds_inference:0.2,offset_errors:[]}};
 assert.equal(text.slice(21,40),'DeLonghi Dedica Duo');
 let result=runReviewBatch160(manifest(doc),report);
 assert.equal(result.cases[0].result,'processed');assert.equal(result.cases[0].neuralProcessed,true);
 assert.ok(result.cases[0].unresolved.includes('source_is_unverified_full_review'));
 assert.ok(!result.cases[0].unresolved.includes('source_is_constructed_diagnostic'));
 report.cases.fullreview.source_sha256='bad';result=runReviewBatch160(manifest(doc),report);
 assert.equal(result.cases[0].result,'quarantined');assert.equal(result.cases[0].neuralProcessed,false);
});
test('adapted ExtractGPT error buckets distinguish missed, false, correct and wrong attribute values',()=>{
 const v=auditAttributes160([{target:['n/a'],prediction:'n/a'},{target:[null],prediction:'4 L'},
  {target:['4 L'],prediction:null},{target:['4 L','4 litres'],prediction:'4 litres'},
  {target:['4 L'],prediction:'5 L'}]);
 assert.deepEqual([v.NN,v.NV,v.VN,v.VC,v.VW],[1,1,1,1,1]);
 assert.equal(v.total,5);assert.equal(v.rankingAuthorized,false);assert.equal(v.independentGoldDeclared,false);
 assert.throws(()=>auditAttributes160([{target:[],prediction:null}]),/invalid_gold_row/);
});
