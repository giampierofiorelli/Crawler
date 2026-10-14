import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {planCategoryCapabilities} from '../src/category_cognitive_mesh.js';
import {executeCategoryResearchCycle,type LocalCapabilityWorker} from '../src/category_research_execution.js';
import {prioritizeCategoryResearch,type ResearchGap} from '../src/phase75_priority.js';
import {Phase75ResearchJournal} from '../src/phase75_memory.js';
import {runPhase75Research} from '../src/phase75_runtime.js';
import {createLocalOllamaAdapter} from '../src/phase75_local_model.js';
import {discoverFromApprovedSitemap} from '../src/phase75_source_discovery.js';
import type {WebSourcePolicy} from '../src/web_evidence_acquisition.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
const now='2026-10-10T19:00:00Z';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const catalog=[{categoryId:'headphones',label:'Headphones',aliases:[],status:'reviewed' as const,registryVersion:3}];
const gap=(patch:Partial<ResearchGap>={}):ResearchGap=>({id:'gap_1',categoryId:'headphones',gapClass:'poor_coverage',
 severity:3,affectedUses:2,sourceIds:[],distinctOriginalTests:0,lastCheckedAt:null,
 asOf:now,nextAllowedAt:null,rightsStatus:'cleared_for_discovery',...patch});
const plan=()=>planCategoryCapabilities({label:'Headphones',catalog,asOf:now});
const worker:LocalCapabilityWorker={execution:'local_only',capability:'coverage_analysis',
 async run(task,asOf){return {outcome:'research_material_collected',reasonCode:'documented_gap',
  sourceReferences:[{referenceId:'source_reference_1',sourceId:'original_lab',
   url:'https://lab.testing.org/method',contentSha256:sha('test fixture'),observedAt:asOf}],
  questions:[]};}};

test('prioritizes eligible tasks with bounded, explicitly non-probabilistic ordinal priority',()=>{
 const x=prioritizeCategoryResearch({plan:plan(),asOf:now,gaps:[gap()],maxTasks:1});
 assert.equal(x.selected.length,1);
 assert.equal(x.selected[0].capability,'coverage_analysis');
 assert.equal(x.selected[0].webDiscoveryPermitted,false);
 assert.equal(x.noAutomaticPublication,true);
});
test('pending work never resubmitted, cooldown rights do not grant web permission',()=>{
 const x=prioritizeCategoryResearch({plan:plan(),asOf:now,
  gaps:[gap({rightsStatus:'blocked',nextAllowedAt:'2026-10-12T00:00:00Z'})],
  maxTasks:2,pendingTaskIds:['headphones_coverage_analysis']});
 assert.ok(x.blocked.some(t=>t.reason==='previous_run_pending_review'));
 assert.ok(x.selected.every(t=>!t.webDiscoveryPermitted));
});
test('invalid gap and unbounded task budget fail closed',()=>{
 assert.throws(()=>prioritizeCategoryResearch({plan:plan(),asOf:now,gaps:[gap({affectedUses:-1})],maxTasks:2}));
 assert.throws(()=>prioritizeCategoryResearch({plan:plan(),asOf:now,gaps:[],maxTasks:100}));
});
test('priority filter cannot bypass dependency receipts',async()=>{
 const r=await executeCategoryResearchCycle({label:'Smart air purifiers',catalog,asOf:now,workers:[],
 onlyTaskIds:['provisional_smart_air_purifiers_criterion_design']});
 assert.equal(r.outcomes.length,0);
});
test('journal persists only metadata, resumes across instances, deduplicates run ID',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'pee75-'));
 try {
  const file=path.join(dir,'journal.json');const store=new Phase75ResearchJournal(file);
  const cycle=await executeCategoryResearchCycle({label:'Headphones',catalog,asOf:now,workers:[worker],onlyTaskIds:['headphones_coverage_analysis']});
  const s1=await store.record('run_1','headphones',now,cycle);
  assert.deepEqual(s1.pendingTaskIds,['headphones_coverage_analysis']);
  assert.equal(s1.revision,1);
  const second=new Phase75ResearchJournal(file);
  assert.equal((await second.load()).rows.length,1);
  assert.equal((await second.record('run_1','headphones',now,cycle)).revision,1);
  assert.equal(JSON.stringify(await second.load()).includes('test fixture'),false);
  assert.equal(JSON.stringify(await second.load()).includes('lab.testing.org'),false);
  await assert.rejects(second.record('run_1','headphones','2026-10-10T19:00:01Z',cycle));
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('journal tampering is detected, not replaced with an empty store',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'pee75-'));
 try{const file=path.join(dir,'state.json');await writeFile(file,'{"sha256":"fake","payload":"{}"}');
  await assert.rejects(new Phase75ResearchJournal(file).load(),/integrity mismatch/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('runtime stores a run but second call does not re-execute pending capability',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'pee75-'));
 try{const journal=new Phase75ResearchJournal(path.join(dir,'state.json'));
  let calls=0;const counting={...worker,async run(task:Parameters<LocalCapabilityWorker['run']>[0],asOf:string){calls++;return worker.run(task,asOf);}};
  const input={label:'Headphones',catalog,asOf:now,workers:[counting],journal,gaps:[gap()],maxTasks:1};
  const first=await runPhase75Research(input);
  assert.equal(first.executed.actualWorkExecuted,true);
  const next=await runPhase75Research(input);
  assert.equal(calls,1);
  assert.equal(next.executed.actualWorkExecuted,false);
  assert.equal((await journal.load()).revision,2);
 }finally{await rm(dir,{recursive:true,force:true});}
});
const policy:WebSourcePolicy={sourceId:'lab_source',host:'lab.testing.org',basis:'written_permission',
 rightsDocumentId:'written_permission_1',rightsDocumentUrl:'https://lab.testing.org/permission',reviewedBy:'legal_review',
 reviewedAt:'2026-10-10T18:00:00Z',validUntil:'2027-01-01T00:00:00Z',
 permittedOperations:['metadata_discovery'],robots:'allowed',robotsCheckedAt:'2026-10-10T18:50:00Z',
 websiteTerms:'reviewed_permitted',termsCheckedAt:'2026-10-10T18:00:00Z',commercialUseReviewed:true};
const sourceTransport:SourceTransport={async get(url){return url.endsWith('/robots.txt')?
 {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /\nDisallow: /private'}:
 {status:200,finalUrl:url,contentType:'application/xml',body:`<?xml version="1.0"?>\n<urlset><url><loc>https://lab.testing.org/tests/product-one</loc></url><url><loc>https://lab.testing.org/private/data</loc></url><url><loc>https://other.org/test</loc></url></urlset>`};}};
test('scoped public sitemap discovers candidate URLs but never auto-fetches product pages',async()=>{
 const r=await discoverFromApprovedSitemap({policy,asOf:now,transport:sourceTransport});
 assert.equal(r.webCalls,2);assert.equal(r.urls.length,1);
 assert.equal(r.urls[0].url,'https://lab.testing.org/tests/product-one');
 assert.equal(r.urls[0].originalTestIdentityKnown,false);
 assert.equal(r.urls[0].automaticPageAcquisition,false);
});
test('documented rights URL may be on a different HTTPS publisher domain',async()=>{
 const r=await discoverFromApprovedSitemap({policy:{...policy,
  rightsDocumentUrl:'https://creativecommons.org/licenses/by/4.0/'},asOf:now,transport:sourceTransport});
 assert.equal(r.status,'candidate_urls_found');
});
test('metadata discovery is blocked without independent rights review',async()=>{
 let requests=0;const transport:SourceTransport={async get(){requests++;throw Error('forbidden');}};
 const r=await discoverFromApprovedSitemap({policy:{...policy,websiteTerms:'unknown'},asOf:now,transport});
 assert.equal(r.status,'blocked');assert.equal(requests,0);
});
test('malformed sitemap has no partial URL leakage',async()=>{
 const transport:SourceTransport={async get(url){return url.endsWith('/robots.txt')?
 {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /'}:
 {status:200,finalUrl:url,contentType:'application/xml',body:'<!DOCTYPE x SYSTEM "https://somewhere"> <loc>https://lab.testing.org/foo</loc>'};}};
 const r=await discoverFromApprovedSitemap({policy,asOf:now,transport});
 assert.equal(r.status,'blocked');assert.deepEqual(r.urls,[]);
});
test('real loopback HTTP request to locally configured Ollama-compatible endpoint without remote APIs',async()=>{
 const server=createServer(async(req,res)=>{
  assert.equal(req.method,'POST');assert.equal(req.url,'/api/chat');
  let body='';for await(const chunk of req)body+=chunk;
  assert.equal(JSON.parse(body).stream,false);
  res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify({message:{content:JSON.stringify({suggestions:[]})}}));
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const address=server.address();if(!address||typeof address==='string')throw Error('No local listening port');
  const adapter=createLocalOllamaAdapter({model:'test_model',port:address.port});
  const result=await adapter.suggestTransient('This is an untrusted synthetic review source.');
  assert.deepEqual(result,[]);assert.equal(adapter.execution,'local_only');
 }finally{await new Promise<void>((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
});
test('local inference refuses unbounded page text and invalid configuration',async()=>{
 assert.throws(()=>createLocalOllamaAdapter({model:'../../etc/passwd'}));
 await assert.rejects(async()=>await createLocalOllamaAdapter({model:'local'}).suggestTransient('x'.repeat(25000)));
});
test('local model accepts anchored numeric candidate but rejects an invented number',async()=>{
 const body='The controlled dehumidifier test measured 14 litres per day under fixed room conditions.';
 const base={id:'obs_water_14',definition:{kind:'field',field:{key:'water_removed',type:'number',unit:'litres_per_day',
  allowedValues:[],permittedOrigins:['independent_lab_measurement'],requiresProtocol:true,contextKeys:['room_conditions']}},
  origin:'independent_lab_measurement',value:{type:'number',number:14,unit:'litres_per_day'},
  context:{room_conditions:'controlled'},protocolId:'test_method',protocolVersion:'version_1',
  anchorText:body,literalText:'14',interpretation:'direct_source_value'};
 const server=createServer(async(_req,res)=>{
  for await(const _chunk of _req) { /* drain without logging private source */ }
  res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify({message:{content:JSON.stringify({suggestions:[base,
   {...base,id:'obs_invented',literalText:'999',value:{type:'number',number:999,unit:'litres_per_day'}}]})}}));
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {const address=server.address();if(!address||typeof address==='string')throw Error('Local server unavailable');
  const adapter=createLocalOllamaAdapter({model:'local_test',port:address.port});
  const parsed=await adapter.suggestTransient(body);
  assert.equal(parsed.length,1);assert.equal(parsed[0].literalText,'14');
  assert.equal(parsed[0].value.type,'number');
 }finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}
});
