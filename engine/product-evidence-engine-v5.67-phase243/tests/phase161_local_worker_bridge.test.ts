import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {runReviewBatch160} from '../src/phase160_batch_review_pipeline.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const text='Our review tests the Maytag MRT311FFFE refrigerator. The GE GTS22KGNRWW is mentioned only as a competitor. We measured cooling noise at 44.9 dBA on the Maytag; the manufacturer\'s energy claim was not independently verified in this passage.';
const document={id:'constructed_fridge',kind:'constructed',rightsBasis:'constructed_original',rightsStatement:'Developer authored diagnostic',category:'refrigerator',sourceTitle:'Maytag constructed pilot',sourceUrl:'https://example.org/sample',sourceRole:'original_product_test',text,sha256:sha(text)};
const manifest={protocol:'pee.phase160.batch.v1',datasetId:'phase161_bridge',documents:[document]};
const entities={product_model:[{text:'MRT311FFFE',start:text.indexOf('MRT311FFFE'),end:text.indexOf('MRT311FFFE')+10,confidence:0.91}],brand:[],product_feature:[],measured_value:[]};
const neural={model_id:'fastino/gliner2.5-small-v1',model_architecture:'boundary',gliner2_version:'2.1.0',model_integration_status:'local_offline_worker_not_connected_to_PEE',case_status:'mixed_batch_provisional_unannotated',cases:{constructed_fridge:{input:text,source_url:document.sourceUrl,source_title:document.sourceTitle,source_sha256:sha(text),entities,seconds_inference:0.1,offset_errors:[]}}};
const audit={protocol:'pee.phase161.worker.v1',datasetId:'phase161_bridge',checkpoint_fingerprint:'a'.repeat(64),checkpointAuthenticated:false,rankingAuthorized:false,identityMergeAuthorized:false,modelQualityBenchmark:false,scientificEvidenceApproved:false,document_sha256:{constructed_fridge:sha(text)},processed:1,totalDocuments:1,failures:{},freshInferCalls:1,cacheHits:0};
test('phase161 local-worker neural report passes through PEE with no evidence authority',()=>{
 assert.throws(()=>runReviewBatch160(manifest as any,neural as any),/phase161_missing_or_mismatched/);
 const result=runReviewBatch160(manifest as any,neural as any,audit as any);
 assert.equal(result.mode,'native_and_external_neural');assert.equal(result.cases[0].result,'processed');
 assert.equal(result.cases[0].neuralSpanCount,1);
 assert.equal(result.safety.rankingAuthorized,false);
 assert.equal(result.safety.checkpointAuthenticated,false);
});
test('phase161 CLI verifies source and operator audit and refuses altered contents',()=>{
 const temp=mkdtempSync(join(tmpdir(),'pee161-'));
 try{
  const m=join(temp,'manifest.json'),n=join(temp,'neural.json'),a=join(temp,'audit.json'),o=join(temp,'out.json');
  writeFileSync(m,JSON.stringify(manifest));writeFileSync(n,JSON.stringify(neural));writeFileSync(a,JSON.stringify(audit));
  const invoke=()=>spawnSync('node',['scripts/phase161-coordinate.mjs','--manifest',m,'--neural',n,'--audit',a,'--out',o],{encoding:'utf8'});
  const result=invoke();assert.equal(result.status,0,result.stderr);
  const output=JSON.parse(readFileSync(o,'utf8'));
  assert.equal(output.phase,161);assert.equal(output.checkpointAuthenticated,false);
  assert.equal(output.cases[0].neuralProcessed,true);
  assert.equal(invoke().status,2,'cannot overwrite existing output');
  rmSync(o);
  writeFileSync(a,JSON.stringify({...audit,document_sha256:{constructed_fridge:'0'.repeat(64)}}));
  const invalid=invoke();assert.equal(invalid.status,2);assert.match(invalid.stderr,/source_disagreement/);
 }finally{rmSync(temp,{recursive:true,force:true})}
});
