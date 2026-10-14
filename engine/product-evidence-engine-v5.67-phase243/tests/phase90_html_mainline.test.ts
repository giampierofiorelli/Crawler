import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ReviewedRecipeStore,type ReviewedHtmlRecord} from '../src/phase85_source_recipes.js';
import {acquireReviewedHtmlSpecifications} from '../src/phase90_html_mainline.js';
import type {CategoryFieldRegistry} from '../src/category_evidence_matrix.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
import type {WebCandidate,WebSourcePolicy} from '../src/web_evidence_acquisition.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const fixture=JSON.parse(await readFile(path.join(root,'tests/fixtures/phase90-approved-html-record.json'),'utf8')) as ReviewedHtmlRecord;
const now='2026-10-10T20:00:00Z';
const url='https://specs.testing.org/products/x3';
const registry:CategoryFieldRegistry={categoryId:'headphones',schemaVersion:1,reviewedBy:'fixture_operator',reviewReference:'fixture_review',
 fields:[{key:'battery_hours',type:'number',unit:'h',allowedValues:[],permittedOrigins:['manufacturer_technical_specification'],
 requiresProtocol:false,contextKeys:['declared_by']}]};
const candidate:WebCandidate={id:'maker_x3',sourceId:'approved_specs',url,exactVariantId:'maker_x3',
 originalTestId:null,lineageAttestationReference:null,kind:'manufacturer_technical_document',
 publishedAt:null,updatedAt:null,metadataOrigin:'human_supplied'};
const policy:WebSourcePolicy={sourceId:'approved_specs',host:'specs.testing.org',basis:'written_permission',
 rightsDocumentId:'fixture_permission',rightsDocumentUrl:'https://rights.testing.org/permission',
 reviewedBy:'fixture_operator',reviewedAt:'2026-10-10T19:00:00Z',validUntil:'2026-11-01T00:00:00Z',
 permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation'],
 robots:'allowed',robotsCheckedAt:'2026-10-10T19:30:00Z',websiteTerms:'reviewed_permitted',
 termsCheckedAt:'2026-10-10T19:30:00Z',commercialUseReviewed:true};
const html=(model='Maker X3',value='23 hours')=>`<html><body><h1>${model}</h1><table><tr><th>Battery life</th><td>${value}</td></tr></table></body></html>`;
function transport(body=html()){let count=0;const t:SourceTransport={async get(requested){count++;
  return requested.endsWith('/robots.txt')?{status:200,finalUrl:requested,contentType:'text/plain',body:'User-agent: *\nAllow: /'}:
  {status:200,finalUrl:requested,contentType:'text/html',body};}};
 return {t,calls:()=>count};}
async function setup(){const dir=await mkdtemp(path.join(tmpdir(),'phase90-mainline-'));
 return {dir,store:new ReviewedRecipeStore(path.join(dir,'recipes.json'))};}

test('phase85 one-authority file stores both JSON-LD-compatible and reviewed HTML without HTML content',async()=>{
 const {dir,store}=await setup();try{
  assert.deepEqual(await store.loadHtml(),[]);await store.addHtml(fixture);
  assert.equal((await store.loadHtml()).length,1);assert.equal((await store.load()).length,0);
  await assert.rejects(store.addHtml(fixture),/already active/);
  const raw=await readFile(store.filename,'utf8');
  assert.ok(!raw.includes('<html>')&&!raw.includes('23 hours'));
  const changed={...fixture,recipe:{...fixture.recipe,mappings:[{...fixture.recipe.mappings[0],label:'Wrong'}]}};
  await assert.rejects(store.addHtml(changed),/checksum mismatch/);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('real phases 68/69/70 execute bounded manufacturer HTML intake and never rank',async()=>{
 const {dir,store}=await setup();try{
  await store.addHtml(fixture);const {t,calls}=transport();
  const result=await acquireReviewedHtmlSpecifications({registry,candidate,policy,asOf:now,expectedModel:'Maker X3',recipeStore:store,transport:t});
  assert.equal(result.status,'quarantined',result.reasons.join(','));assert.equal(result.observations.length,1);
  assert.deepEqual(result.observations[0].value,{type:'number',number:23,unit:'h'});
  assert.equal(result.observations[0].origin,'manufacturer_technical_specification');
  assert.equal(result.observations[0].reviewStatus,'quarantined_unreviewed');
  assert.equal(result.observations[0].rankingEligible,false);assert.equal(result.localModelCalls,0);
  assert.equal(result.storedSourceHtml,false);assert.equal(calls(),2);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('rights denied upstream before network I/O and no bypass',async()=>{
 const {dir,store}=await setup();try{
  await store.addHtml(fixture);const {t,calls}=transport();
  const result=await acquireReviewedHtmlSpecifications({registry,candidate,policy:{...policy,websiteTerms:'unknown'},
   asOf:now,expectedModel:'Maker X3',recipeStore:store,transport:t});
  assert.equal(result.status,'blocked');assert.equal(result.observations.length,0);assert.equal(calls(),0);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('wrong exact product and changed table structure do not contaminate evidence',async()=>{
 const {dir,store}=await setup();try{
  await store.addHtml(fixture);
  for(const bad of [html('Maker X4'),html().replace('Battery life','Charge time'),html('Maker X3','up to 23 hours')]){
   const result=await acquireReviewedHtmlSpecifications({registry,candidate,policy,asOf:now,expectedModel:'Maker X3',recipeStore:store,transport:transport(bad).t});
   assert.equal(result.status,'blocked');assert.equal(result.observations.length,0);
  }
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('changes in mainline approved registry block before source retrieval',async()=>{
 const {dir,store}=await setup();try{
  await store.addHtml(fixture);const {t,calls}=transport();
  const result=await acquireReviewedHtmlSpecifications({registry:{...registry,fields:[{...registry.fields[0],unit:'min'}]},candidate,policy,
    asOf:now,expectedModel:'Maker X3',recipeStore:store,transport:t});
  assert.equal(result.status,'blocked');assert.equal(calls(),0);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('phase89 advisory record sees successes and distinguishes structural changes',async()=>{
 const {dir,store}=await setup();try{
  await store.addHtml(fixture);const watchDbPath=path.join(dir,'strategy_watch.sqlite3');
  const ok=await acquireReviewedHtmlSpecifications({registry,candidate,policy,asOf:now,expectedModel:'Maker X3',
   recipeStore:store,transport:transport().t,watchDbPath});
  assert.equal(ok.status,'quarantined');assert.equal(ok.monitoring,'recorded');
  const bad=await acquireReviewedHtmlSpecifications({registry,candidate:{...candidate,url:'https://specs.testing.org/products/x4',id:'maker_x4',exactVariantId:'maker_x4'},
   policy,asOf:'2026-10-10T20:05:00Z',expectedModel:'Maker X4',recipeStore:store,
   transport:transport(html('Maker X4').replace('Battery life','Charge duration')).t,watchDbPath});
  assert.equal(bad.status,'blocked');assert.equal(bad.monitoring,'recorded');
  assert.equal(bad.advisoryAction,'observe_more_models');
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('legacy JSON-LD recipe and Phase87 HTML recipe persist in the same authoritative file',async()=>{
 const {dir,store}=await setup();try{
  const field={key:'motor_power_watts',type:'number' as const,unit:'w',allowedValues:[],
   permittedOrigins:['manufacturer_technical_specification' as const],requiresProtocol:false,contextKeys:['declared_by']};
  const legacy={recipeId:'maker_jsonld',sourceId:'approved_specs',host:'specs.testing.org',categoryId:'vacuum_cleaners',
    pathPrefix:'/products/',version:1,mappings:[{field,propertyName:'Motor power',unit:'w',context:{declared_by:'manufacturer'}}],
    status:'reviewed' as const,reviewedBy:'fixture_operator',reviewRef:'operator_reviewed_two_distinct_samples'};
  await store.add(legacy);
  await store.addHtml(fixture);
  assert.equal((await store.load()).length,1);
  assert.equal((await store.loadHtml()).length,1);
  const fresh=new ReviewedRecipeStore(store.filename);
  assert.equal((await fresh.load())[0].recipeId,'maker_jsonld');
  assert.equal((await fresh.loadHtml())[0].recipe.recipe_sha256,fixture.recipe.recipe_sha256);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('two distinct broken products create a manual requalification advisory, never invoke an LLM',async()=>{
 const {dir,store}=await setup();try{
  await store.addHtml(fixture);const watchDbPath=path.join(dir,'watch.sqlite3');
  for(const [index,model] of ['Maker X4','Maker X5'].entries()){
   const slug=`x${index+4}`;
   const r=await acquireReviewedHtmlSpecifications({registry,
    candidate:{...candidate,url:`https://specs.testing.org/products/${slug}`,id:`maker_${slug}`,exactVariantId:`maker_${slug}`},
    policy,asOf:`2026-10-10T20:${10+index*5}:00Z`,expectedModel:model,recipeStore:store,
    transport:transport(html(model,'25 hours').replace('Battery life','Operating time')).t,watchDbPath});
   assert.equal(r.status,'blocked');assert.equal(r.localModelCalls,0);
   assert.equal(r.monitoring,'recorded');
   assert.equal(r.advisoryAction,index===0?'observe_more_models':'human_requalification_required');
  }
 }finally{await rm(dir,{recursive:true,force:true});}
});
