import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {mkdtemp,rm,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ReviewedRecipeStore,type ReviewedHtmlRecord} from '../src/phase85_source_recipes.js';
import {htmlRecordDigest,htmlRecipeScope,qualifyHtmlReplacementHeldOut,phase92SigningMessage,
 type HtmlLifecycleEvent,type HeldOutSample,type QualificationReference} from '../src/phase92_recipe_lifecycle.js';
import {acquireReviewedHtmlSpecifications} from '../src/phase90_html_mainline.js';
import type {CategoryFieldRegistry} from '../src/category_evidence_matrix.js';
import type {WebCandidate,WebSourcePolicy} from '../src/web_evidence_acquisition.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const original=JSON.parse(await readFile(path.join(root,'tests/fixtures/phase90-approved-html-record.json'),'utf8')) as ReviewedHtmlRecord;
const actor='reviewer_phase92';
const {publicKey,privateKey}=generateKeyPairSync('ed25519');
const trusted={ [actor]:publicKey.export({format:'pem',type:'spki'}).toString() };
const oldHtml=(model:string)=>`<html><h1>${model}</h1><table><tr><th>Battery life</th><td>23 hours</td></tr></table></html>`;
const newHtml=(model:string,n=24)=>`<html><h1>${model}</h1><table><tr><th>Operating time</th><td>${n} hours</td></tr></table></html>`;
const u=(s:string)=>`https://specs.testing.org/products/${s}`;
const python=(action:string,data:object)=>{
 const raw=execFileSync('python3',['-m','phase87.cli',action],{cwd:root,
 env:{...process.env,PYTHONPATH:root},input:JSON.stringify(data),encoding:'utf8'});
 const r=JSON.parse(raw);assert.equal(r.ok,true,raw);return r.result;
};
const label=(slug:string,model:string,n:number,by:string):HeldOutSample=>({
 url:u(slug),model,html:newHtml(model,n),labelledBy:by,
 expected:{battery_hours:{value:n,unit:'h'}}
});
function signed(e:HtmlLifecycleEvent):HtmlLifecycleEvent{
 const event=structuredClone(e);event.approval.signature=sign(null,phase92SigningMessage(event),privateKey).toString('base64');return event;
}
async function setup(){const dir=await mkdtemp(path.join(tmpdir(),'phase92-lifecycle-'));
 const store=new ReviewedRecipeStore(path.join(dir,'approved.json'),trusted);
 await store.addHtml(original);return {dir,store};
}
const trainingReferences=():QualificationReference[]=>[
 label('learn_a','Maker LearnA',22,'reference_label_a'),
 label('learn_b','Maker LearnB',25,'reference_label_b')];
function approvedReplacement():ReviewedHtmlRecord{
 const samples=trainingReferences().map(s=>({...s,labelled_by:s.labelledBy}));
 const fields=[{key:'battery_hours',unit:'h',review_id:'fixture_review'}];
 const inv=python('inventory',{samples,host:'specs.testing.org',prefix:'/products/',fields});
 assert.equal(inv.candidates.length,1);
 const proposed=python('qualify',{samples,host:'specs.testing.org',prefix:'/products/',category:'headphones',fields,
  proposal:[{fieldKey:'battery_hours',candidateId:inv.candidates[0].id}]});
 const recipe=python('review',{recipe:proposed,reviewer:actor,review_receipt:'separately_reviewed_92'});
 return {kind:'reviewed_html_v1',recipe,context:original.context,
  registryReviewReference:original.registryReviewReference,registrySchemaVersion:original.registrySchemaVersion};
}
const heldOut=()=>[label('hold_1','Maker HoldOne',24,'heldout_assessor_one'),label('hold_2','Maker HoldTwo',27,'heldout_assessor_two')];
async function supersession(old:ReviewedHtmlRecord,newRecord:ReviewedHtmlRecord,samples:HeldOutSample[]){
 const proof=await qualifyHtmlReplacementHeldOut(newRecord,samples);
 return signed({kind:'html_lifecycle_v1',action:'supersede',scope:htmlRecipeScope(old),
  previousDigest:old.recipe.recipe_sha256,previousRecordSha256:htmlRecordDigest(old),
  nextDigest:newRecord.recipe.recipe_sha256,nextRecordSha256:htmlRecordDigest(newRecord),
  occurredAt:'2026-10-10T21:30:00Z',heldOut:proof,
  approval:{reviewer:actor,receipt:newRecord.recipe.human_review.receipt,signature:''}});
}
function suspension(r:ReviewedHtmlRecord){return signed({kind:'html_lifecycle_v1',action:'suspend',scope:htmlRecipeScope(r),
 previousDigest:r.recipe.recipe_sha256,previousRecordSha256:htmlRecordDigest(r),
 nextDigest:null,nextRecordSha256:null,occurredAt:'2026-10-10T21:00:00Z',heldOut:null,
 approval:{reviewer:actor,receipt:'signed_suspension_case',signature:''}});}
const registry:CategoryFieldRegistry={categoryId:'headphones',schemaVersion:1,reviewedBy:'fixture_operator',reviewReference:'fixture_review',
 fields:[{key:'battery_hours',type:'number',unit:'h',allowedValues:[],permittedOrigins:['manufacturer_technical_specification'],requiresProtocol:false,contextKeys:['declared_by']}]};
const policy:WebSourcePolicy={sourceId:'approved_specs',host:'specs.testing.org',basis:'written_permission',
 rightsDocumentId:'fixture_permission',rightsDocumentUrl:'https://rights.testing.org/permission',
 reviewedBy:'fixture_operator',reviewedAt:'2026-10-10T19:00:00Z',validUntil:'2026-11-01T00:00:00Z',
 permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation'],
 robots:'allowed',robotsCheckedAt:'2026-10-10T19:30:00Z',websiteTerms:'reviewed_permitted',
 termsCheckedAt:'2026-10-10T19:30:00Z',commercialUseReviewed:true};
function candidate(slug:string):WebCandidate{return {id:'maker_'+slug,sourceId:'approved_specs',url:u(slug),
 exactVariantId:'maker_'+slug,originalTestId:null,lineageAttestationReference:null,
 kind:'manufacturer_technical_document',publishedAt:null,updatedAt:null,metadataOrigin:'human_supplied'};}
function transport(body:string){let count=0;const t:SourceTransport={async get(url){count++;
 return url.endsWith('robots.txt')?{status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /'}:
 {status:200,finalUrl:url,contentType:'text/html',body};}};return {t,calls:()=>count};}

test('Phase92 suspended HTML recipe is removed from Phase90 intake before any HTTP; audit is immutable',async()=>{
 const {dir,store}=await setup();try{
  await store.suspendHtml(suspension(original));
  assert.deepEqual(await store.loadHtml(),[]);
  const history=await store.loadHtmlHistory();
  assert.equal(history[0].versions.length,1);assert.equal(history[0].events.length,1);
  assert.equal(history[0].activeSha256,null);
  const t=transport(oldHtml('Maker X3'));
  const result=await acquireReviewedHtmlSpecifications({registry,candidate:candidate('x3'),policy,
   asOf:'2026-10-10T21:05:00Z',expectedModel:'Maker X3',recipeStore:store,transport:t.t});
  assert.equal(result.status,'blocked');assert.equal(t.calls(),0);assert.equal(result.localModelCalls,0);
  await assert.rejects(store.suspendHtml(suspension(original)),/no longer applies/i);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Phase92 replacement is signed, held-out validated, append-only, and works through original Phase68/69/70 route',async()=>{
 const {dir,store}=await setup();try{
  const next=approvedReplacement(),proofSamples=heldOut();
  await store.suspendHtml(suspension(original));
  const event=await supersession(original,next,proofSamples);
  await store.supersedeHtml({previousDigest:original.recipe.recipe_sha256,newRecord:next,heldOut:proofSamples,trainingReferences:trainingReferences(),event});
  assert.equal((await store.loadHtml())[0].recipe.recipe_sha256,next.recipe.recipe_sha256);
  const history=await store.loadHtmlHistory();
  assert.equal(history[0].versions.length,2);assert.equal(history[0].events.length,2);
  assert.equal(history[0].versions[0].recipe.recipe_sha256,original.recipe.recipe_sha256);
  const restored=new ReviewedRecipeStore(store.filename,trusted);
  assert.equal((await restored.loadHtml()).length,1);
  const t=transport(newHtml('Maker Live',28));
  const result=await acquireReviewedHtmlSpecifications({registry,candidate:candidate('live'),policy,
   asOf:'2026-10-10T21:40:00Z',expectedModel:'Maker Live',recipeStore:restored,transport:t.t,
   watchDbPath:path.join(dir,'monitor.sqlite3')});
  assert.equal(result.status,'quarantined',result.reasons.join(','));
  assert.equal(result.recipeWatch,'cleared');assert.equal(result.monitoring,'recorded');
  assert.equal(result.observations[0].origin,'manufacturer_technical_specification');
  assert.deepEqual(result.observations[0].value,{type:'number',number:28,unit:'h'});
  assert.equal(result.localModelCalls,0);assert.equal(result.publicationReady,false);
  const saved=await readFile(store.filename,'utf8');
  assert.ok(!saved.includes('Maker HoldOne')&&!saved.includes('27 hours')&&!saved.includes('<html'));
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Phase92 refuses incorrect held-out labels without touching existing store',async()=>{
 const {dir,store}=await setup();try{
  const next=approvedReplacement(),correct=heldOut();
  const event=await supersession(original,next,correct);
  const corrupted=structuredClone(correct);corrupted[1].expected.battery_hours.value=99;
  const before=await readFile(store.filename,'utf8');
  await assert.rejects(store.supersedeHtml({previousDigest:original.recipe.recipe_sha256,newRecord:next,
   heldOut:corrupted,trainingReferences:trainingReferences(),event}),/mismatch/);
  assert.equal(await readFile(store.filename,'utf8'),before);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Phase92 refuses same-model pseudo-held-out and reviewer-labelled test cases',async()=>{
 const next=approvedReplacement();
 const repeated=heldOut();repeated[1].model=repeated[0].model;
 await assert.rejects(qualifyHtmlReplacementHeldOut(next,repeated),/Invalid held-out/);
 const own=heldOut();own[0].labelledBy=actor;
 await assert.rejects(qualifyHtmlReplacementHeldOut(next,own),/Invalid held-out/);
});

test('Phase92 rejects unsigned, wrong-key and manipulated transitions',async()=>{
 const {dir,store}=await setup();try{
  const event=suspension(original);
  await assert.rejects(store.suspendHtml({...event,approval:{...event.approval,signature:'A'.repeat(86)+'=='}}),/signature/);
  const {privateKey:alien}=generateKeyPairSync('ed25519');
  const fraudulent=structuredClone(event);fraudulent.approval.signature=sign(null,phase92SigningMessage(fraudulent),alien).toString('base64');
  await assert.rejects(store.suspendHtml(fraudulent),/signature/);
  await assert.rejects(store.suspendHtml({...event,scope:{...event.scope,prefix:'/other'}}),/signature/);
  assert.equal((await store.loadHtml()).length,1);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Phase92 rejects forged or missing reviewer trust on reopening a changed catalogue',async()=>{
 const {dir,store}=await setup();try{
  await store.suspendHtml(suspension(original));
  const plain=new ReviewedRecipeStore(store.filename);
  await assert.rejects(plain.loadHtml(),/Untrusted/);
  const raw=JSON.parse(await readFile(store.filename,'utf8'));
  const entries=JSON.parse(raw.payload);entries[1].approval.receipt='altered_receipt';
  const {createHash}=await import('node:crypto');
  raw.payload=JSON.stringify(entries);raw.sha256=createHash('sha256').update(raw.payload).digest('hex');
  await writeFile(store.filename,JSON.stringify(raw));
  await assert.rejects(store.loadHtml(),/signature/);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Phase92 rejects stale predecessor and does not allow duplicate promotions',async()=>{
 const {dir,store}=await setup();try{
  const next=approvedReplacement(),cases=heldOut();
  const event=await supersession(original,next,cases);
  await store.supersedeHtml({previousDigest:original.recipe.recipe_sha256,newRecord:next,heldOut:cases,trainingReferences:trainingReferences(),event});
  await assert.rejects(store.supersedeHtml({previousDigest:original.recipe.recipe_sha256,
   newRecord:next,heldOut:cases,trainingReferences:trainingReferences(),event}),/Outdated or missing predecessor/);
  assert.equal((await store.loadHtmlHistory())[0].versions.length,2);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Phase92 checked catalogue remains compatible with original JSON-LD additions and legacy HTML',async()=>{
 const {dir,store}=await setup();try{
  assert.equal((await store.loadHtmlHistory())[0].versions.length,1);
  const raw=await readFile(store.filename,'utf8');assert.ok(raw.includes('d0b049'));
  await assert.rejects(store.addHtml(original),/requalification required/);
  assert.equal((await store.loadHtml())[0].recipe.recipe_sha256,original.recipe.recipe_sha256);
 }finally{await rm(dir,{recursive:true,force:true});}
});


test('Phase92 rejects held-out data overlapping the original qualification set',async()=>{
 const {dir,store}=await setup();try{
  const next=approvedReplacement(),proofCases=heldOut();
  const event=await supersession(original,next,proofCases);
  const overlaps=structuredClone(proofCases);overlaps[0].model='Maker LearnA';
  const before=await readFile(store.filename,'utf8');
  await assert.rejects(store.supersedeHtml({previousDigest:original.recipe.recipe_sha256,
   newRecord:next,trainingReferences:trainingReferences(),heldOut:overlaps,event}),/overlaps qualification/);
  assert.equal(await readFile(store.filename,'utf8'),before);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Phase92 rejects a signed replacement timestamp older than the recorded suspension',async()=>{
 const {dir,store}=await setup();try{
  const next=approvedReplacement(),cases=heldOut();
  await store.suspendHtml(suspension(original));
  const good=await supersession(original,next,cases);
  const bad=signed({...good,occurredAt:'2026-10-10T20:59:00Z',approval:{...good.approval,signature:''}});
  await assert.rejects(store.supersedeHtml({previousDigest:original.recipe.recipe_sha256,
   newRecord:next,trainingReferences:trainingReferences(),heldOut:cases,event:bad}),/chronology conflict/);
  assert.equal((await store.loadHtmlHistory())[0].activeSha256,null);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Phase92 detects mutation of an older version even when an attacker recomputes the outer envelope hash',async()=>{
 const {dir,store}=await setup();try{
  await store.suspendHtml(suspension(original));
  const envelope=JSON.parse(await readFile(store.filename,'utf8'));
  const records=JSON.parse(envelope.payload);
  records[0].context.battery_hours.declared_by='manipulated';
  const {createHash}=await import('node:crypto');
  envelope.payload=JSON.stringify(records);
  envelope.sha256=createHash('sha256').update(envelope.payload).digest('hex');
  await writeFile(store.filename,JSON.stringify(envelope));
  await assert.rejects(store.loadHtml(),/predecessor/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
