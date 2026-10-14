import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ReviewedRecipeStore,type ReviewedHtmlRecord} from '../src/phase85_source_recipes.js';
import {createPolicyEnforcedRecipeStore,policyMessage,verifyReviewerPolicy,reviewerPolicyDigest,
 type Phase93ReviewerPolicy} from '../src/phase93_reviewer_policy.js';
import {htmlRecipeScope,htmlRecordDigest,phase92SigningMessage,
 type HtmlLifecycleEvent} from '../src/phase92_recipe_lifecycle.js';
import {acquireReviewedHtmlSpecifications} from '../src/phase90_html_mainline.js';
import {runPermissionedHtmlPilot} from '../src/phase93_permissioned_pilot.js';
import type {CategoryFieldRegistry} from '../src/category_evidence_matrix.js';
import type {WebCandidate,WebSourcePolicy} from '../src/web_evidence_acquisition.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const fixture=JSON.parse(await readFile(path.join(root,'tests/fixtures/phase90-approved-html-record.json'),'utf8')) as ReviewedHtmlRecord;
const rootKey=generateKeyPairSync('ed25519');
const reviewer=generateKeyPairSync('ed25519');
const rootPem=rootKey.publicKey.export({format:'pem',type:'spki'}).toString();
const reviewerPem=reviewer.publicKey.export({format:'pem',type:'spki'}).toString();
const now='2026-10-10T23:00:00Z';
function policy(revokedAt:string|null=null,actions:('suspend'|'supersede')[]=['suspend','supersede']):Phase93ReviewerPolicy{
 const p:Phase93ReviewerPolicy={schema:'phase93_reviewer_policy_v1',policyId:'reviewer_trust_v1',
 issuedAt:'2026-10-10T00:00:00Z',expiresAt:'2029-10-10T00:00:00Z',
 reviewers:[{reviewer:'phase93_reviewer',keyPem:reviewerPem,actions,
 host:fixture.recipe.source_host,category:fixture.recipe.category,prefix:fixture.recipe.path_prefix,
 validFrom:'2026-10-10T00:00:00Z',validUntil:'2029-10-10T00:00:00Z',revokedAt}],
 signature:{rootKeyId:'trusted_root',ed25519:''}};
 p.signature.ed25519=sign(null,policyMessage(p),rootKey.privateKey).toString('base64');return p;
}
function suspension():HtmlLifecycleEvent{
 const e:HtmlLifecycleEvent={kind:'html_lifecycle_v1',action:'suspend',scope:htmlRecipeScope(fixture),
 previousDigest:fixture.recipe.recipe_sha256,previousRecordSha256:htmlRecordDigest(fixture),
 nextDigest:null,nextRecordSha256:null,occurredAt:'2026-10-10T22:30:00Z',heldOut:null,
 approval:{reviewer:'phase93_reviewer',receipt:'independent_suspension_review',signature:''}};
 e.approval.signature=sign(null,phase92SigningMessage(e),reviewer.privateKey).toString('base64');return e;
}
const registry:CategoryFieldRegistry={categoryId:'headphones',schemaVersion:1,reviewedBy:'fixture_operator',reviewReference:'fixture_review',
 fields:[{key:'battery_hours',type:'number',unit:'h',allowedValues:[],permittedOrigins:['manufacturer_technical_specification'],requiresProtocol:false,contextKeys:['declared_by']}]};
const sourcePolicy:WebSourcePolicy={sourceId:'approved_specs',host:'specs.testing.org',basis:'written_permission',
 rightsDocumentId:'fixture_permission',rightsDocumentUrl:'https://rights.testing.org/permission',
 reviewedBy:'fixture_operator',reviewedAt:'2026-10-10T19:00:00Z',validUntil:'2026-11-01T00:00:00Z',
 permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation'],
 robots:'allowed',robotsCheckedAt:'2026-10-10T19:30:00Z',websiteTerms:'reviewed_permitted',
 termsCheckedAt:'2026-10-10T19:30:00Z',commercialUseReviewed:true};
const candidate=(slug:string,model:string):WebCandidate=>({id:'maker_'+slug,sourceId:'approved_specs',
 url:`https://specs.testing.org/products/${slug}`,exactVariantId:'maker_'+slug,
 originalTestId:null,lineageAttestationReference:null,kind:'manufacturer_technical_document',
 publishedAt:null,updatedAt:null,metadataOrigin:'human_supplied'});
const body=(model:string,h:number)=>`<html><h1>${model}</h1><table><tr><th>Battery life</th><td>${h} hours</td></tr></table></html>`;
const mockTransport=(html:string,hook?:()=>Promise<void>):SourceTransport=>({async get(url){
 if(url.endsWith('/robots.txt'))return {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /'};
 await hook?.();return {status:200,finalUrl:url,contentType:'text/html',body:html};}});
async function setup(){const dir=await mkdtemp(path.join(tmpdir(),'pee-phase93-'));return {dir,
 store:new ReviewedRecipeStore(path.join(dir,'recipes.json'))};}

test('root-signed role and scope policy validates and fails on tampering, wrong root and expiration',()=>{
 const p=policy();verifyReviewerPolicy(p,rootPem,'trusted_root',now);
 assert.throws(()=>verifyReviewerPolicy({...p,policyId:'tampered'},rootPem,'trusted_root',now),/signature/);
 assert.throws(()=>verifyReviewerPolicy(p,rootPem,'other_root',now),/invalid_or_expired/);
 assert.throws(()=>verifyReviewerPolicy(p,rootPem,'trusted_root','2030-10-10T00:00:00Z'),/expired/);
 const rogue=generateKeyPairSync('ed25519').publicKey.export({format:'pem',type:'spki'}).toString();
 assert.throws(()=>verifyReviewerPolicy(p,rogue,'trusted_root',now),/signature/);
});

test('an older still-signed approval policy is rejected when the deployment pins a newer digest',()=>{
 const previous=policy();const next=policy('2026-10-10T22:00:00Z');
 assert.throws(()=>createPolicyEnforcedRecipeStore('/tmp/phase93-no-creation.json',previous,
  rootPem,'trusted_root',reviewerPolicyDigest(next),()=>now),/checkpoint_mismatch/);
});

test('reviewer-grant policy allows signed suspension with matching host/category/path',async()=>{
 const {dir}=await setup();try{
  const store=createPolicyEnforcedRecipeStore(path.join(dir,'recipes.json'),policy(),rootPem,'trusted_root',reviewerPolicyDigest(policy()),()=>now);
  await store.addHtml(fixture);await store.suspendHtml(suspension());
  assert.equal((await store.loadHtml()).length,0);assert.equal((await store.loadHtmlHistory())[0].events.length,1);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('revoked and scope-ineligible reviewer cannot suspend; old catalog remains active',async()=>{
 for(const p of [policy('2026-10-10T22:00:00Z'),policy(null,['supersede'])]){
  const {dir}=await setup();try{
   const store=createPolicyEnforcedRecipeStore(path.join(dir,'recipes.json'),p,rootPem,'trusted_root',reviewerPolicyDigest(p),()=>now);
   await store.addHtml(fixture);
   await assert.rejects(store.suspendHtml(suspension()),/not_authorized/);
   assert.equal((await store.loadHtml()).length,1);
  }finally{await rm(dir,{recursive:true,force:true});}
 }
});

test('strict monitor requirement blocks acquisition before HTTP when absent',async()=>{
 const {dir,store}=await setup();try{
  await store.addHtml(fixture);let count=0;
  const transport:SourceTransport={async get(u){count++;return {status:200,finalUrl:u,contentType:'text/html',body:body('Maker X3',23)};}};
  const r=await acquireReviewedHtmlSpecifications({registry,candidate:candidate('x3','Maker X3'),policy:sourcePolicy,
    expectedModel:'Maker X3',asOf:now,recipeStore:store,monitoringMode:'required',transport});
  assert.equal(r.status,'blocked');assert.equal(count,0);
  assert.deepEqual(r.reasons,['phase93_monitoring_configuration_required']);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('strict monitor with persistent SQLite ledger can quarantine exact declared values',async()=>{
 const {dir,store}=await setup();try{
  await store.addHtml(fixture);
  const r=await acquireReviewedHtmlSpecifications({registry,candidate:candidate('x3','Maker X3'),policy:sourcePolicy,
    expectedModel:'Maker X3',asOf:now,recipeStore:store,monitoringMode:'required',
    watchDbPath:path.join(dir,'watch.sqlite3'),transport:mockTransport(body('Maker X3',23))});
  assert.equal(r.status,'quarantined',r.reasons.join(','));assert.equal(r.monitoring,'recorded');
  assert.equal(r.observations[0].value.type,'number');assert.equal(r.localModelCalls,0);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('catalog change while source is being fetched blocks quarantining those bytes',async()=>{
 const {dir,store}=await setup();try{
  await store.addHtml(fixture);
  const change=async()=>{await store.add({recipeId:'test_jsonld_93',sourceId:'approved_specs',host:'specs.testing.org',
   categoryId:'vacuum_cleaners',pathPrefix:'/other/',version:1,
   mappings:[{field:{key:'motor_watts',type:'number',unit:'W',allowedValues:[],
    permittedOrigins:['manufacturer_technical_specification'],requiresProtocol:false,contextKeys:['declared_by']},
    propertyName:'Motor',unit:'W',context:{declared_by:'manufacturer'}}],
    status:'reviewed',reviewedBy:'fixture_operator',reviewRef:'reference_review_93'});};
  const r=await acquireReviewedHtmlSpecifications({registry,candidate:candidate('x3','Maker X3'),policy:sourcePolicy,
    expectedModel:'Maker X3',asOf:now,recipeStore:store,transport:mockTransport(body('Maker X3',23),change)});
  assert.equal(r.status,'blocked',r.reasons.join(','));assert.deepEqual(r.observations,[]);
  assert.ok(r.reasons.includes('phase93_catalog_changed_during_acquisition'));
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('permissioned-pilot harness counts both correct and blocked reference fields in denominator',async()=>{
 const {dir,store}=await setup();try{
  await store.addHtml(fixture);
  const samples=[{caseId:'case_good',model:'Maker X3',slug:'x3',h:23},
   {caseId:'case_missing',model:'Maker X4',slug:'x4',h:27}];
  const report=await runPermissionedHtmlPilot({recipeStore:store,asOf:now,watchDbPath:path.join(dir,'pilot.sqlite3'),
   cases:samples.map(s=>({caseId:s.caseId,candidate:candidate(s.slug,s.model),policy:sourcePolicy,
    registry,expectedModel:s.model,annotator:'independent_annotator',labelReceipt:'label_reference_93',
    reference:{battery_hours:{number:s.h,unit:'h'}}})),
   transportFor:p=>mockTransport(p.expectedModel==='Maker X4'?body('Maker X4',27).replace('Battery life','Operating time'):
    body('Maker X3',23))});
  assert.equal(report.correct,1);assert.equal(report.missing,1);assert.equal(report.recall,0.5);
  assert.equal(report.precision,1);assert.equal(report.blockedCases,1);
  assert.equal(report.automaticLlmCalls,0);assert.equal(report.publicationReady,false);
 }finally{await rm(dir,{recursive:true,force:true});}
});
