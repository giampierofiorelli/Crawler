import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,writeFile} from 'node:fs/promises';
import os from 'node:os';import path from 'node:path';
import {createHash} from 'node:crypto';
import {Phase76RequestQueue} from '../src/phase76_request_queue.js';
import {Phase75ResearchJournal} from '../src/phase75_memory.js';
import {workNextUserRequest} from '../src/phase76_service.js';
import {createPhase76HttpApi} from '../src/phase76_http.js';
import type {LocalCapabilityWorker} from '../src/category_research_execution.js';
import type {CategoryIdentity} from '../src/category_cognitive_mesh.js';
const asOf='2026-10-10T20:20:00Z';
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
async function fixture(f:(queue:Phase76RequestQueue,journal:Phase75ResearchJournal)=>Promise<void>){
 const root=await mkdtemp(path.join(os.tmpdir(),'pee76-test-'));
 try{await f(new Phase76RequestQueue(path.join(root,'requests.json')),
  new Phase75ResearchJournal(path.join(root,'research.json')));}
 finally{await rm(root,{recursive:true,force:true});}
}
const catalog:CategoryIdentity[]=[{categoryId:'headphones',label:'Headphones',aliases:['Headsets'],status:'reviewed',registryVersion:1}];
const worker:LocalCapabilityWorker={execution:'local_only',capability:'category_identity',
 async run(_task,t){return {outcome:'research_material_collected',reasonCode:'test_data_only',questions:[],
 sourceReferences:[{referenceId:'fixture_source_1',sourceId:'fixture_lab_1',
 url:'https://lab.testing.org/protocol',contentSha256:hash('fixture'),observedAt:t},
 {referenceId:'fixture_source_2',sourceId:'fixture_lab_2',
 url:'https://lab.testing.org/protocol_2',contentSha256:hash('fixture2'),observedAt:t}]};}};
test('new category queues an actionable job; no invented recommendations',async()=>fixture(async queue=>{
 const result=await queue.submit({categoryLabel:'Smart pet fountains',useCaseKey:'cat_use',catalog:[],asOf});
 assert.ok(!('kind' in result));if('kind'in result)return;
 assert.equal(result.view.status,'queued');assert.equal(result.view.reviewedResultId,null);
 assert.equal(result.view.canClosePage,true);
 assert.ok(result.view.message.includes('coda'));
 assert.equal((await queue.publicStatus(result.view.requestId,'0'.repeat(64))),null);
 assert.equal((await queue.publicStatus(result.view.requestId,result.accessToken))?.status,'queued');
}));
test('category with two aliases requires clarification, not a phantom work item',async()=>fixture(async queue=>{
 const collision=[...catalog,{categoryId:'other',label:'Headsets',aliases:[],status:'reviewed',registryVersion:1}] as CategoryIdentity[];
 const r=await queue.submit({categoryLabel:'HEADSETS',useCaseKey:'office_use',catalog:collision,asOf});
 assert.ok('kind'in r);if(!('kind'in r))return;
 assert.equal(r.reason,'alias_collision');assert.deepEqual(r.categoryIds,['headphones','other']);
 assert.equal((await queue.load()).requests.length,0);
}));
test('same category/use-case deduplicates with independent bearer tokens; different use-cases differ',async()=>fixture(async queue=>{
 const r=await queue.submit({categoryLabel:' Smart pet fountains ',useCaseKey:'cat_use',catalog:[],asOf});
 const next=await queue.submit({categoryLabel:'Smart pet fountains',useCaseKey:'cat_use',catalog:[],asOf});
 const diff=await queue.submit({categoryLabel:'Smart pet fountains',useCaseKey:'dog_use',catalog:[],asOf});
 if('kind'in r||'kind'in next||'kind'in diff)throw Error('Bad intake');
 assert.equal(r.view.requestId,next.view.requestId);assert.equal(next.deduplicated,true);
 assert.notEqual(r.accessToken,next.accessToken);
 assert.equal((await queue.publicStatus(r.view.requestId,next.accessToken))?.status,'queued');
 assert.notEqual(r.view.requestId,diff.view.requestId);
 assert.equal((await queue.load()).requests.length,2);
}));
test('no worker reports capacity honestly; later installed capability resumes',async()=>fixture(async(queue,journal)=>{
 const r=await queue.submit({categoryLabel:'Pet air purifiers',useCaseKey:'small_room',catalog:[],asOf});
 if('kind'in r)throw Error('Bad intake');
 const initial=await workNextUserRequest({queue,journal,catalog:[],workers:[],gaps:[]},asOf);
 assert.equal(initial.processed,true);if(!initial.processed)return;
 assert.equal(initial.view.status,'awaiting_research_capacity');assert.equal(initial.workExecuted,false);
 assert.equal((await workNextUserRequest({queue,journal,catalog:[],workers:[],gaps:[]},asOf)).processed,false);
 const resumed=await workNextUserRequest({queue,journal,catalog:[],workers:[worker],gaps:[]},asOf);
 assert.equal(resumed.processed,true);if(!resumed.processed)return;
 assert.equal(resumed.view.status,'awaiting_independent_review');assert.equal(resumed.workExecuted,true);
 const status=await queue.publicStatus(r.view.requestId,r.accessToken);
 assert.equal(status?.reviewedResultId,null);
 assert.equal((await journal.load()).rows.length,1);
}));
test('unknown category executes research-only with independent review gate',async()=>fixture(async(queue,journal)=>{
 const r=await queue.submit({categoryLabel:'Pet air purifiers',useCaseKey:'small_room',catalog:[],asOf});
 if('kind'in r)throw Error('Bad intake');
 const run=await workNextUserRequest({queue,journal,catalog:[],workers:[worker],gaps:[]},asOf);
 assert.ok(run.processed&&run.view.status==='awaiting_independent_review');
 const report={requestId:r.view.requestId,resultId:'reviewed_catalogue_result_1',reviewReferenceId:'qa_1',
  verifiedAt:asOf,independentSourceCount:2,
 verifiedOriginalTestIds:['original_test_1','original_test_2'],
 verifiedEvidenceReferenceIds:['fixture_source_1','fixture_source_2']};
 await assert.rejects(queue.publishVerified(report,async()=>false),/not authenticated/);
 await assert.rejects(queue.publishVerified({...report,independentSourceCount:1},async()=>true),/Incomplete/);
 await assert.rejects(queue.publishVerified({...report,verifiedEvidenceReferenceIds:['foreign_1','foreign_2']},async()=>true),/Unlinked/);
 assert.equal((await queue.publicStatus(r.view.requestId,r.accessToken))?.reviewedResultId,null);
 const ready=await queue.publishVerified(report,async()=>true); // simulated verified backend attestation
 assert.equal(ready.status,'ready');assert.equal(ready.reviewedResultId,'reviewed_catalogue_result_1');
 assert.equal((await queue.publicStatus(r.view.requestId,r.accessToken))?.status,'ready');
}));
test('an unsupported research response cannot become approved automatically',async()=>fixture(async(queue,journal)=>{
 const r=await queue.submit({categoryLabel:'Pet air purifiers',useCaseKey:'small_room',catalog:[],asOf});
 if('kind'in r)throw Error('Bad intake');
 const noEvidence:LocalCapabilityWorker={execution:'local_only',capability:'category_identity',
  async run(){return {outcome:'no_sufficient_material',sourceReferences:[],questions:[],reasonCode:'none_found'};}};
 const run=await workNextUserRequest({queue,journal,catalog:[],workers:[noEvidence],gaps:[]},asOf);
 assert.ok(run.processed&&run.view.status==='insufficient_evidence');
 await assert.rejects(queue.publishVerified({requestId:r.view.requestId,resultId:'false',reviewReferenceId:'qa_2',
  independentSourceCount:2,verifiedAt:asOf,
  verifiedOriginalTestIds:['original_test_1','original_test_2'],
  verifiedEvidenceReferenceIds:['fixture_source_1','fixture_source_2']},async()=>true),/Not eligible/);
}));
test('leases prevent duplicate claims, expired workers cannot overwrite new attempt',async()=>fixture(async queue=>{
 await queue.submit({categoryLabel:'Pet air purifiers',useCaseKey:'small_room',catalog:[],asOf});
 const c1=await queue.claimNext(asOf,1000);assert.ok(c1);
 assert.equal(await queue.claimNext(asOf,1000),null);
 const later='2026-10-10T20:20:02Z';const c2=await queue.claimNext(later,2000);
 assert.ok(c1&&c2&&c1.requestId===c2.requestId);
 if(!c1||!c2)return;
 await assert.rejects(queue.settle(c1,'insufficient_evidence',[],later),/Invalid or expired/);
 assert.equal((await queue.settle(c2,'insufficient_evidence',[],later)).status,'insufficient_evidence');
}));
test('persistent storage reloads and detects tampering',async()=>fixture(async queue=>{
 const r=await queue.submit({categoryLabel:'Pet air purifiers',useCaseKey:'small_room',catalog:[],asOf});
 if('kind'in r)throw Error('Bad intake');
 const second=new Phase76RequestQueue(queue.filePath);
 assert.equal((await second.publicStatus(r.view.requestId,r.accessToken))?.status,'queued');
 const bytes=await readFile(queue.filePath,'utf8');
 await writeFile(queue.filePath,bytes.replace('queued','ready'));
 await assert.rejects(second.load(),/integrity mismatch/);
}));
test('HTTP supports asynchronous submit/status, no source or result leakage, and bearer auth',async()=>fixture(async queue=>{
 const server=createPhase76HttpApi({queue,catalog:[]});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const a=server.address();if(!a||typeof a==='string')throw Error('no listener');
  const url=`http://127.0.0.1:${a.port}`;
  const submit=await fetch(url+'/v1/research-requests',{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({categoryLabel:'Pet air purifiers',useCaseKey:'small_room'})});
  assert.equal(submit.status,202);const result=await submit.json() as {checkUrl:string;accessToken:string;view:{requestId:string}};
  const unauthorized=await fetch(url+result.checkUrl);assert.equal(unauthorized.status,404);
  const authorized=await fetch(url+result.checkUrl,{headers:{Authorization:'Bearer '+result.accessToken}});
  const status=await authorized.json() as {status:string;reviewedResultId:null};
  assert.equal(authorized.status,200);assert.equal(status.status,'queued');
  assert.equal(status.reviewedResultId,null);
  assert.equal(authorized.headers.get('cache-control'),'no-store');
 }finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}
}));
test('unknown product and unknown category are distinct; product requires its own worker',async()=>fixture(async(queue,journal)=>{
 const p=await queue.submit({categoryLabel:'Headphones',productLabel:'New Model 900',useCaseKey:'train',catalog,asOf});
 const c=await queue.submit({categoryLabel:'Headphones',useCaseKey:'train',catalog,asOf});
 if('kind'in p||'kind'in c)throw Error('Bad input');
 assert.notEqual(p.view.requestId,c.view.requestId);
 const waiting=await workNextUserRequest({queue,journal,catalog,workers:[worker],gaps:[]},asOf);
 assert.equal(waiting.processed,true);
 if(!waiting.processed)return;
 assert.equal(waiting.view.status,'awaiting_research_capacity');
 const productWorker={execution:'local_only' as const,async research(){return {
  outcome:'source_candidates_found' as const,sourceReferenceIds:['candidate_1']};}};
 const resumed=await workNextUserRequest({queue,journal,catalog,workers:[worker],productWorker,gaps:[]},asOf);
 assert.equal(resumed.processed,true);if(!resumed.processed)return;
 assert.equal(resumed.view.status,'awaiting_independent_review');
 assert.equal(resumed.view.reviewedResultId,null);
}));
