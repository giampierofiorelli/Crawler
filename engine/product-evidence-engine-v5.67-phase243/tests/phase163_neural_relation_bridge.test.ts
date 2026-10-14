import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {reviewRelationCandidates163} from '../src/phase163_relation_candidate_bridge.js';
import {runReviewBatch160} from '../src/phase160_batch_review_pipeline.js';
const data=JSON.parse(readFileSync('research/phase159/GLINER25-COLAB-CONSTRUCTED-PILOT.json','utf8'));
const text:string=data.cases.constructed_fridge.input;
const span=(surface:string)=>({text:surface,start:text.indexOf(surface),end:text.indexOf(surface)+surface.length,confidence:0.85});
const rel=(type:string,head:string,tail:string)=>({type,head:span(head),tail:span(tail),
 identityVerified:false,scientificEvidence:false,canonicalWriteAuthorized:false,rankingAuthorized:false});
const checked=()=>[rel('product_has_feature','MRT311FFFE','cooling noise'),
 rel('feature_has_measurement','cooling noise','44.9 dBA'),
 rel('product_compared_with','MRT311FFFE','GTS22KGNRWW')];
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
function prepare(){
 const m={protocol:'pee.phase160.batch.v1' as const,datasetId:'phase163_relation_pilot',documents:[{
  id:'constructed_fridge',kind:'constructed' as const,rightsBasis:'constructed_original' as const,
  rightsStatement:'Developer-authored diagnostic text',category:'refrigerator',sourceTitle:'Maytag diagnostic',
  sourceUrl:'https://example.org/test',sourceRole:'original_product_test' as const,text,sha256:sha(text)}]};
 const n=structuredClone(data);n.model_integration_status='local_offline_worker_not_connected_to_PEE';
 n.cases={constructed_fridge:{...n.cases.constructed_fridge,source_sha256:sha(text),
  source_url:'https://example.org/test',source_title:'Maytag diagnostic',
  relation_candidates:checked(),relation_extraction_status:'local_model_executed_unverified'}};
 const a={protocol:'pee.phase161.worker.v1' as const,datasetId:m.datasetId,checkpoint_fingerprint:'a'.repeat(64),
  checkpointAuthenticated:false as const,rankingAuthorized:false as const,scientificEvidenceApproved:false as const,
  identityMergeAuthorized:false as const,processed:1,totalDocuments:1,document_sha256:{constructed_fridge:sha(text)},failures:{}};
 return {m,n,a};
}
test('relation proposals are source aligned and typed, but remain unverified',()=>{
 const {m,n,a}=prepare();const result=runReviewBatch160(m,n,a).cases[0];
 assert.equal(result.result,'processed');assert.equal(result.neuralRelationCount,3);
 assert.ok(result.relationCandidates.every(r=>r.entityTypeCheck==='matched'));
 assert.ok(result.relationCandidates.every(r=>r.candidateOnly&&!r.scientificEvidence&&!r.rankingAuthorized&&!r.publisherTestStatusVerified));
 assert.ok(result.unresolved.includes('neural_relation_hypotheses_not_verified'));
 assert.equal(runReviewBatch160(m,n,a).cases[0].neuralRelationCount,3);
});
test('wrongly typed endpoints are retained only as unverified, nonmatching hypotheses',()=>{
 const entities=[{id:'x',label:'brand',start:0,end:6,text:'Maytag',contextCategories:[]}];
 const r=reviewRelationCandidates163(text,[rel('product_has_feature','MRT311FFFE','cooling noise')],
  'local_model_executed_unverified',entities);
 assert.equal(r[0].entityTypeCheck,'mismatch_or_missing');assert.equal(r[0].headEntityId,null);
});
test('source tampering, unsupported relation type and unauthorized approval flags quarantine only the document',()=>{
 const {m,n,a}=prepare();
 for(const mutate of [
  (v:any)=>{v.relation_candidates[0].tail.text='unseen feature'},
  (v:any)=>{v.relation_candidates[0].head.start+=1},
  (v:any)=>{v.relation_candidates[0].type='best_in_world'},
  (v:any)=>{v.relation_candidates[0].scientificEvidence=true},
  (v:any)=>{v.relation_candidates.push(v.relation_candidates[0])},
 ]){
  const q=structuredClone(n);mutate(q.cases.constructed_fridge);
  const result=runReviewBatch160(m,q,a).cases[0];
  assert.equal(result.result,'quarantined');assert.equal(result.neuralRelationCount,0);
  assert.equal(result.rankingAuthorized,false);
 }
});
test('unattested Colab relationship proposals cannot be imported as worker results',()=>{
 const {m,n}=prepare();n.model_integration_status='standalone_colab_not_connected_to_PEE';
 const result=runReviewBatch160(m,n).cases[0];
 assert.equal(result.result,'quarantined');assert.match(result.error!,/phase163_relations_require_local_worker_audit/);
});
test('old two-case genuine Colab report remains backward compatible',()=>{
 const {m}=prepare();const result=runReviewBatch160(m);
 assert.equal(result.cases[0].neuralRelationCount,0);
 assert.equal(result.cases[0].result,'processed');
});
