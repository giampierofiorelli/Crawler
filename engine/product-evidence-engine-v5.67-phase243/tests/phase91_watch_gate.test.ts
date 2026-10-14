import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ReviewedRecipeStore,type ReviewedHtmlRecord} from '../src/phase85_source_recipes.js';
import {acquireReviewedHtmlSpecifications} from '../src/phase90_html_mainline.js';
import {checkReviewedHtmlRecipeWatch,planMarketWatchWithRecipeReview,htmlScope} from '../src/phase91_watch_gate.js';
import type {CategoryFieldRegistry} from '../src/category_evidence_matrix.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
import type {WebCandidate,WebSourcePolicy} from '../src/web_evidence_acquisition.js';
import type {WatchSource} from '../src/phase82_market_watch.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const fixture=JSON.parse(await readFile(path.join(root,'tests/fixtures/phase90-approved-html-record.json'),'utf8')) as ReviewedHtmlRecord;
const now='2026-10-10T20:00:00Z';
const registry:CategoryFieldRegistry={categoryId:'headphones',schemaVersion:1,reviewedBy:'fixture_operator',reviewReference:'fixture_review',fields:[
 {key:'battery_hours',type:'number',unit:'h',allowedValues:[],permittedOrigins:['manufacturer_technical_specification'],requiresProtocol:false,contextKeys:['declared_by']} ]};
const policy:WebSourcePolicy={sourceId:'approved_specs',host:'specs.testing.org',basis:'written_permission',
 rightsDocumentId:'fixture_permission',rightsDocumentUrl:'https://rights.testing.org/permission',
 reviewedBy:'fixture_operator',reviewedAt:'2026-10-10T19:00:00Z',validUntil:'2026-11-01T00:00:00Z',
 permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation'],
 robots:'allowed',robotsCheckedAt:'2026-10-10T19:30:00Z',websiteTerms:'reviewed_permitted',
 termsCheckedAt:'2026-10-10T19:30:00Z',commercialUseReviewed:true};
const watch:WatchSource={id:'approved_specs',categoryId:'headphones',host:'specs.testing.org',
 channel:'manufacturer_product_index',mechanism:'sitemap_delta',tier:'core',rightsClearedForMetadata:true,
 nextCheckAt:now,lastCheckAt:null,quietChecks:0,errors:0};
const page=(m:string,broken:boolean)=>`<html><body><h1>${m}</h1><table><tr><th>${broken?'Charge duration':'Battery life'}</th><td>23 hours</td></tr></table></body></html>`;
function transport(body:string){let n=0;const t:SourceTransport={async get(u){n++;return u.endsWith('/robots.txt')?
 {status:200,finalUrl:u,contentType:'text/plain',body:'User-agent: *\nAllow: /'}:
 {status:200,finalUrl:u,contentType:'text/html',body};}};
 return {transport:t,calls:()=>n};}
function candidate(slug:string):WebCandidate{return {id:`maker_${slug}`,sourceId:'approved_specs',
 url:`https://specs.testing.org/products/${slug}`,exactVariantId:`maker_${slug}`,
 originalTestId:null,lineageAttestationReference:null,kind:'manufacturer_technical_document',
 publishedAt:null,updatedAt:null,metadataOrigin:'human_supplied'};}
async function setup(){const dir=await mkdtemp(path.join(tmpdir(),'phase91-gate-'));
 const store=new ReviewedRecipeStore(path.join(dir,'reviews.json'));
 await store.addHtml(fixture);return {dir,store,db:path.join(dir,'watch.db')};}
async function run(store:ReviewedRecipeStore,db:string,slug:string,model:string,broken:boolean,at:string){
 const t=transport(page(model,broken));
 const r=await acquireReviewedHtmlSpecifications({registry,candidate:candidate(slug),policy,asOf:at,
  expectedModel:model,recipeStore:store,watchDbPath:db,transport:t.transport});
 return {r,calls:t.calls()};
}
function cli(action:string,body:object){const raw=execFileSync('python3',['-m','phase89.cli',action],{
 cwd:root,env:{...process.env,PYTHONPATH:root},input:JSON.stringify(body),encoding:'utf8'});
 const data=JSON.parse(raw) as {ok:boolean;result:any};assert.equal(data.ok,true);return data.result;}

test('Phase91: no drift case permits reviewed recipe only through unchanged Phase68/69/70 route',async()=>{
 const {dir,store,db}=await setup();try{
  const v=await run(store,db,'x3','Maker X3',false,now);
  assert.equal(v.r.status,'quarantined');assert.equal(v.r.recipeWatch,'cleared');assert.equal(v.r.monitoring,'recorded');
  assert.equal(v.r.localModelCalls,0);assert.equal(v.calls,2);
  const gate=await checkReviewedHtmlRecipeWatch({watchDbPath:db,recipe:fixture});
  assert.equal(gate.case_status,'none');assert.equal(gate.safe_to_reuse_under_review_gate,true);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Phase91: two distinct structural drift products block all subsequent reuse before network I/O',async()=>{
 const {dir,store,db}=await setup();try{
  const first=await run(store,db,'x4','Maker X4',true,'2026-10-10T20:10:00Z');
  const second=await run(store,db,'x5','Maker X5',true,'2026-10-10T20:15:00Z');
  assert.equal(first.r.advisoryAction,'observe_more_models');
  assert.equal(second.r.advisoryAction,'human_requalification_required');
  const next=await run(store,db,'x6','Maker X6',false,'2026-10-10T20:20:00Z');
  assert.equal(next.r.status,'blocked');assert.equal(next.r.recipeWatch,'requalification_required');
  assert.deepEqual(next.r.reasons,['reviewed_html_recipe_requalification_required']);
  assert.equal(next.calls,0);assert.equal(next.r.observations.length,0);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Phase91: manually closing a watch ticket does not silently re-authorize stale recipe',async()=>{
 const {dir,store,db}=await setup();try{
  await run(store,db,'x4','Maker X4',true,'2026-10-10T20:10:00Z');
  await run(store,db,'x5','Maker X5',true,'2026-10-10T20:15:00Z');
  const state=await checkReviewedHtmlRecipeWatch({watchDbPath:db,recipe:fixture});
  assert.equal(state.case_status,'pending_review');
  const closed=cli('close_case',{db_path:db,source_key:state.source_key,
    recipe_id:state.recipe_id,disposition_receipt:'human_acknowledgement_only'});
  assert.equal(closed.status,'closed_manually');
  const after=await checkReviewedHtmlRecipeWatch({watchDbPath:db,recipe:fixture});
  assert.equal(after.case_status,'closed_manually');assert.equal(after.safe_to_reuse_under_review_gate,false);
  const refused=await run(store,db,'x7','Maker X7',false,'2026-10-10T20:30:00Z');
  assert.equal(refused.calls,0);assert.equal(refused.r.status,'blocked');
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Phase91: market discovery stays scheduled even when the exact HTML recipe is blocked',async()=>{
 const {dir,store,db}=await setup();try{
  await run(store,db,'x4','Maker X4',true,'2026-10-10T20:10:00Z');
  await run(store,db,'x5','Maker X5',true,'2026-10-10T20:15:00Z');
  const plan=await planMarketWatchWithRecipeReview({asOf:'2026-10-10T20:20:00Z',
   maxChecks:3,maxChecksPerHost:1,sources:[watch,{...watch,id:'denied',host:'elsewhere.test',rightsClearedForMetadata:false}],
   recipes:await store.loadHtml(),watchDbPath:db});
  assert.deepEqual(plan.discoveryPlan.selectedSourceIds,['approved_specs']);
  assert.deepEqual(plan.discoveryPlan.blockedSourceIds,['denied']);
  assert.equal(plan.recipeIntakeBlocked.length,1);
  assert.deepEqual(plan.recipeIntakeBlocked[0].watchSourceIds,['approved_specs']);
  assert.equal(plan.recipeIntakeBlocked[0].caseStatus,'pending_review');
  assert.equal(plan.actualNetworkRequests,0);assert.equal(plan.automaticLlmCalls,0);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Phase91: unavailable telemetry fails closed on monitored HTML reuse, with no source requests',async()=>{
 const {dir,store}=await setup();try{
  const unwritable=path.join(dir,'absent-parent','missing.db');
  const result=await run(store,unwritable,'x3','Maker X3',false,now);
  assert.equal(result.r.status,'blocked');assert.equal(result.r.recipeWatch,'unavailable');
  assert.equal(result.r.monitoring,'unavailable');assert.equal(result.calls,0);
  assert.deepEqual(result.r.reasons,['recipe_watch_preflight_unavailable']);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Phase91: watch scopes and source integrity match exact recipe digest, never unrelated URL prefixes',async()=>{
 const {dir,db}=await setup();try{
  const scope=htmlScope(fixture);
  const x=cli('case_status',{db_path:db,...scope});
  assert.equal(x.case_status,'none');assert.equal(x.source_key.length,64);
  const y=cli('case_status_many',{db_path:db,recipes:[scope]});
  assert.equal(y.length,1);assert.equal(y[0].source_key,x.source_key);
  const other=cli('case_status',{db_path:db,...scope,path_prefix:'/other-products'});
  assert.notEqual(other.source_key,x.source_key);
 }finally{await rm(dir,{recursive:true,force:true});}
});
