import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {AddressInfo} from 'node:net';
import {mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import type {SourceTransport} from '../src/approved_web_reader.js';
import type {WebCandidate,WebSourcePolicy} from '../src/web_evidence_acquisition.js';
import type {CategoryFieldRegistry} from '../src/category_evidence_matrix.js';
import {ReviewedRecipeStore} from '../src/phase85_source_recipes.js';
import {createLocalRecipeOllamaModel,generateRecipeFromApprovedPages,type AuthorizedRecipeSample,
 type LocalRecipeModel,type RecipeProposalScope} from '../src/phase86_local_recipe_generation.js';

const asOf='2026-10-10T20:30:00Z';
const field={key:'motor_power_watts',type:'number' as const,unit:'w',allowedValues:[],
 permittedOrigins:['manufacturer_technical_specification' as const],requiresProtocol:false,
 contextKeys:['declared_by']};
const registry:CategoryFieldRegistry={categoryId:'vacuum_cleaners',schemaVersion:1,
 reviewedBy:'operator_alpha',reviewReference:'independent_category_review',fields:[field]};
const scope:RecipeProposalScope={recipeId:'factory_jsonld_motor_power',sourceId:'manufacturer_specs',host:'specs.testing.org',
 pathPrefix:'/products/',version:1,registry,reviewedContexts:{motor_power_watts:{declared_by:'manufacturer'}}};
function html(model:string,power:string,extraProperties:unknown[]=[]){
 return `<!DOCTYPE html><html><script type="application/ld+json">${JSON.stringify({
  '@context':'https://schema.org','@type':'Product',model,brand:'Example Corp',
  additionalProperty:[{'@type':'PropertyValue',name:'Motor power',unitCode:'w',value:power},...extraProperties]})}</script></html>`;
}
const content:Record<string,string>={
 'https://specs.testing.org/products/alpha':html('Alpha','1400'),
 'https://specs.testing.org/products/beta':html('Beta','900')};
function sample(key:'alpha'|'beta'):AuthorizedRecipeSample{
 const candidate:WebCandidate={id:'sample_'+key,sourceId:'manufacturer_specs',
  url:'https://specs.testing.org/products/'+key,exactVariantId:key,originalTestId:null,
  lineageAttestationReference:null,kind:'manufacturer_technical_document',
  publishedAt:null,updatedAt:null,metadataOrigin:'human_supplied'};
 const policy:WebSourcePolicy={sourceId:'manufacturer_specs',host:'specs.testing.org',basis:'written_permission',
  rightsDocumentId:'permission_fixture',rightsDocumentUrl:'https://rights.testing.org/permission',
  reviewedBy:'operator_alpha',reviewedAt:'2026-10-10T19:00:00Z',validUntil:'2026-11-01T00:00:00Z',
  permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation'],
  robots:'allowed',robotsCheckedAt:'2026-10-10T20:00:00Z',
  websiteTerms:'reviewed_permitted',termsCheckedAt:'2026-10-10T20:00:00Z',commercialUseReviewed:true};
 return {candidate,policy,productKey:key,expectedModel:key==='alpha'?'Alpha':'Beta',
  expected:{motor_power_watts:key==='alpha'?1400:900},
  labelReviewer:'assessor_one',labelReference:'label_review_'+key};
}
function transport(metrics:{calls:number}):SourceTransport {return {async get(url){metrics.calls++;
 if(url.endsWith('/robots.txt'))return {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /'};
 return {status:content[url]?200:404,finalUrl:url,contentType:'text/html',body:content[url]??''};
}};}
function model(result:unknown,observed:(x:unknown)=>void=()=>{}):LocalRecipeModel{
 return {execution:'local_only',async proposeMapping(input){observed(input);return result;}};
}
const suggested={mappings:[{fieldKey:'motor_power_watts',propertyName:'Motor power'}]};
async function run(opts:Partial<Parameters<typeof generateRecipeFromApprovedPages>[0]>={}){
 const metrics={calls:0};let sent=0;
 const wrapped=model(suggested,()=>{sent++;});
 const res=await generateRecipeFromApprovedPages({scope,samples:[sample('alpha'),sample('beta')],
  asOf,model:wrapped,transport:transport(metrics),...opts});
 return {res,metrics,sent};
}
test('AI proposes a declarative recipe, but it remains unreviewed despite exact labels',async()=>{
 let seen:unknown=null;
 const {res,metrics}=await run({model:model(suggested,input=>{seen=input;})});
 assert.equal(res.status,'ready_for_human_review');
 assert.equal(res.proposal?.status,'proposed');assert.equal(res.proposal?.reviewedBy,null);
 assert.equal(res.proposal?.mappings[0].field.key,'motor_power_watts');
 assert.equal(res.qualification?.matchedFacts,2);assert.equal(res.sourceDigests.length,2);
 assert.equal(res.operatorReviewRequired,true);assert.equal(res.rankingEligible,false);
 assert.equal(res.publicationReady,false);assert.equal(res.noRemoteAIUsed,true);
 assert.equal(res.noPageHtmlStored,true);assert.equal(metrics.calls,4);
 assert.equal(JSON.stringify(seen).includes('1400'),false);
 assert.equal(JSON.stringify(seen).includes('<script'),false);
 assert.deepEqual((seen as {availableProperties:unknown}).availableProperties,[{name:'Motor power',unit:'w'}]);
 assert.equal(JSON.stringify(res).includes('1400'),false);
});
test('different identifiers for the same model are not mistaken for independent products',async()=>{
 const beta=sample('beta');beta.expectedModel='Alpha';
 const {res,metrics}=await run({samples:[sample('alpha'),beta]});
 assert.equal(res.status,'blocked');assert.equal(metrics.calls,0);
});
test('unknown invented field is rejected before qualification',async()=>{
 const {res}=await run({model:model({mappings:[{fieldKey:'not_a_real_field',propertyName:'Motor power'}]})});
 assert.equal(res.status,'blocked');assert.equal(res.proposal,null);
});
test('an unauthorized page blocks all inference',async()=>{
 let calls=0;let http=0;
 const denied=sample('alpha');denied.policy={...denied.policy,websiteTerms:'unknown'};
 const res=await generateRecipeFromApprovedPages({scope,samples:[denied,sample('beta')],asOf,
  model:model(suggested,()=>calls++),transport:{async get(url){http++;return {status:200,finalUrl:url,contentType:'text/plain',body:''};}}});
 assert.equal(res.status,'blocked');assert.equal(calls,0);assert.equal(http,0);
});
test('one sample outside source or wrong kind blocks before network',async()=>{
 const wrong=sample('beta');wrong.candidate={...wrong.candidate,url:'https://other.testing.org/products/beta'};
 const {res,metrics,sent}=await run({samples:[sample('alpha'),wrong]});
 assert.equal(res.status,'blocked');assert.equal(metrics.calls,0);assert.equal(sent,0);
});
test('AI cannot mark its own recipe reviewed or override policy',async()=>{
 const {res}=await run({model:model({mappings:suggested.mappings,status:'reviewed',reviewedBy:'fake_operator'})});
 assert.equal(res.status,'blocked');assert.equal(res.proposal,null);
});
test('incorrect expected assessor label prevents human-review-ready result',async()=>{
 const beta=sample('beta');beta.expected={motor_power_watts:700};
 const {res}=await run({samples:[sample('alpha'),beta]});
 assert.equal(res.status,'needs_revision');assert.ok(res.qualification?.failures.some(f=>f.includes('mismatch')));
});
test('no single independently labelled product is accepted',async()=>{
 const {res,metrics}=await run({samples:[sample('alpha')]});
 assert.equal(res.status,'blocked');assert.equal(metrics.calls,0);
});
test('model cannot relabel manufacturer technical specification as independent test',async()=>{
 const {res}=await run({model:model({mappings:[{fieldKey:'motor_power_watts',propertyName:'Motor power',origin:'independent_lab_measurement'}]})});
 assert.equal(res.status,'blocked');
});
test('reused proposal without human review cannot be persisted as approved recipe',async()=>{
 const {res}=await run();const dir=await mkdtemp(path.join(tmpdir(),'phase86-'));
 try{await assert.rejects(new ReviewedRecipeStore(path.join(dir,'approved.json')).add(res.proposal!));}
 finally{await rm(dir,{recursive:true,force:true});}
});
test('different model product label is rejected even if property name matches',async()=>{
 const beta=sample('beta');beta.expectedModel='Gamma';
 const {res}=await run({samples:[sample('alpha'),beta]});
 assert.equal(res.status,'blocked');
});
test('changed unit cannot be normalized or assumed by the model',async()=>{
 const old=content['https://specs.testing.org/products/beta'];
 content['https://specs.testing.org/products/beta']=html('Beta','900').replace('"unitCode":"w"','"unitCode":"kw"');
 try{const {res}=await run();assert.equal(res.status,'needs_revision');}
 finally{content['https://specs.testing.org/products/beta']=old;}
});
test('duplicate Product nodes on a source are not eligible for automatic proposal',async()=>{
 const old=content['https://specs.testing.org/products/beta'];
 content['https://specs.testing.org/products/beta']=html('Beta','900')+html('Beta','901');
 try{const {res}=await run();assert.equal(res.status,'blocked');}
 finally{content['https://specs.testing.org/products/beta']=old;}
});
test('bad registry context rejects the AI mapping rather than creating it',async()=>{
 const {res}=await run({scope:{...scope,reviewedContexts:{motor_power_watts:{declared_by:'manufacturer',made_up:'anything'}}}});
 assert.equal(res.status,'blocked');
});
test('model failure does not leak raw output or source body to caller',async()=>{
 const {res}=await run({model:{execution:'local_only',async proposeMapping(){throw Error('secret original article text');}}});
 assert.equal(res.status,'blocked');assert.equal(JSON.stringify(res).includes('secret'),false);
});
test('Ollama adapter supports mock local loopback JSON response, without network API dependency',async()=>{
 let requestBody='';
 const server=createServer((req,res)=>{
  let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>{
   requestBody=body;
   res.writeHead(200,{'Content-Type':'application/json'});
   res.end(JSON.stringify({message:{content:JSON.stringify(suggested)}}));
  });
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const address=server.address() as AddressInfo;
  const actualModel=createLocalRecipeOllamaModel({model:'local-test:latest',port:address.port,timeoutMs:3000});
  const {res}=await run({model:actualModel});
  assert.equal(res.status,'ready_for_human_review');
  assert.equal(requestBody.includes('Motor power'),true);
  assert.equal(requestBody.includes('1400'),false);
  assert.equal(requestBody.includes('<html'),false);
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
test('Ollama adapter rejects unsafe model names and broken local response',async()=>{
 assert.throws(()=>createLocalRecipeOllamaModel({model:'../bad'}));
 assert.throws(()=>createLocalRecipeOllamaModel({model:'ok',port:0}));
 const server=createServer((_,res)=>{res.writeHead(200);res.end('not JSON');});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const model=createLocalRecipeOllamaModel({model:'test',port:(server.address() as AddressInfo).port,timeoutMs:2500});
  const {res}=await run({model});assert.equal(res.status,'blocked');
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
