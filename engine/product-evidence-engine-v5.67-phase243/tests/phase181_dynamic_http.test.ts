import {test} from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {generateKeyPairSync,sign} from 'node:crypto';
import {createPhase178Server} from '../src/phase178_site_server.js';
import {canonicalJson180} from '../src/phase180_reviewed_first_answer.js';
import {type ProductKnowledgeCatalog181} from '../src/phase181_dynamic_knowledge_ranking.js';
const kp=generateKeyPairSync('ed25519');
const c:ProductKnowledgeCatalog181={phase:181,schema:'181.1',market:'uk',categoryId:'vacuum',knowledgeRevision:'fictional_v1',policyRevision:'fixture_policy_v1',
 reviewedAt:'2026-10-01T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z',marketCoverageComplete:false,
 discoveredVariantIds:['fake_a','fake_b'],coverageStatement:'Small fictional two-model test fixture, never a real comparison.',
 dimensions:[{key:'carpet_pickup',label:'Carpet pickup',value:{kind:'boolean',value:true},methodId:'fixture_method',protocolVersion:'v1',
  weightUnits:{hard:8000,high:4000,normal:2000,low:500},weightingReviewReference:'fixture_review',normalizationReviewReference:'fixture_normalization'},
  {key:'stairs',label:'Carrying upstairs',value:{kind:'boolean',value:true},methodId:'fixture_method',protocolVersion:'v1',
  weightUnits:{hard:8000,high:4000,normal:2000,low:500},weightingReviewReference:'fixture_review',normalizationReviewReference:'fixture_normalization'}],
 originalTests:[
  {id:'a1',variantId:'fake_a',dimensionKey:'carpet_pickup',originalTestId:'fixture_a1',methodId:'fixture_method',protocolVersion:'v1',sourceUrl:'https://example.org/tests/a1',observedAt:'2026-10-01T00:00:00Z',scope:'exact_variant_original_professional_test'},
  {id:'a2',variantId:'fake_a',dimensionKey:'stairs',originalTestId:'fixture_a2',methodId:'fixture_method',protocolVersion:'v1',sourceUrl:'https://example.org/tests/a2',observedAt:'2026-10-01T00:00:00Z',scope:'exact_variant_original_professional_test'},
  {id:'b1',variantId:'fake_b',dimensionKey:'carpet_pickup',originalTestId:'fixture_b1',methodId:'fixture_method',protocolVersion:'v1',sourceUrl:'https://example.org/tests/b1',observedAt:'2026-10-01T00:00:00Z',scope:'exact_variant_original_professional_test'},
  {id:'b2',variantId:'fake_b',dimensionKey:'stairs',originalTestId:'fixture_b2',methodId:'fixture_method',protocolVersion:'v1',sourceUrl:'https://example.org/tests/b2',observedAt:'2026-10-01T00:00:00Z',scope:'exact_variant_original_professional_test'}],
 products:[{variantId:'fake_a',name:'FAKE Test A',observations:[{dimensionKey:'carpet_pickup',valuePoints:9500,hardOutcome:'pass',evidenceId:'a1'},{dimensionKey:'stairs',valuePoints:3000,hardOutcome:'pass',evidenceId:'a2'}]},
 {variantId:'fake_b',name:'FAKE Test B',observations:[{dimensionKey:'carpet_pickup',valuePoints:5000,hardOutcome:'pass',evidenceId:'b1'},{dimensionKey:'stairs',valuePoints:9900,hardOutcome:'pass',evidenceId:'b2'}]}],
 externalReviewReference:'fixture_reference'};
const authority={publicKeys:{test_review:kp.publicKey.export({format:'pem',type:'spki'}).toString()},market:'uk',asOf:'2026-10-12T00:00:00Z'};
const signed={catalog:c,keyId:'test_review',signatureBase64:sign(null,Buffer.from(canonicalJson180(c)),kp.privateKey).toString('base64')};
const knowledge={catalogs:[signed],authority};
async function post(url:string,path:string,payload:object){const r=await fetch(url+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});return {status:r.status,data:await r.json()};}
async function serverTest(fn:(url:string)=>Promise<void>,k:any=knowledge){const server=createPhase178Server('web/phase178',null,k);server.listen(0,'127.0.0.1');await once(server,'listening');const a=server.address();assert(a&&typeof a!=='string');try{await fn(`http://127.0.0.1:${a.port}`)}finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}}
const scope={type:'set_scope',source:'user_web_control',scope:{task:'product_selection',category:'vacuum'}};
const first={type:'set_criterion',source:'user_web_control',key:'carpet_pickup',label:'Carpet pickup',value:{kind:'boolean',value:true},priority:'high'};
const second={type:'set_criterion',source:'user_web_control',key:'stairs',label:'Carrying upstairs',value:{kind:'boolean',value:true},priority:'normal'};
async function update(u:string,s:string,r:number,action:object){return post(u,'/api/action',{session:s,expectedRevision:r,action});}
test('web first answer dynamically recomputes on changed priority without releasing cached rankings',async()=>serverTest(async u=>{
 let r=await post(u,'/api/create',{}),s=r.data.session;
 r=await update(u,s,r.data.snapshot.revision,scope);
 r=await update(u,s,r.data.snapshot.revision,first);
 r=await update(u,s,r.data.snapshot.revision,second);
 assert.equal(r.data.rankingStatus,'dynamic_product_knowledge');assert.equal(r.data.firstAnswer.ranked[0].variantId,'fake_a');
 assert.equal(r.data.firstAnswer.rankingsPrecomputed,false);assert.equal(r.data.firstAnswer.knowledgeRevision,'fictional_v1');
 r=await update(u,s,r.data.snapshot.revision,{type:'set_priority',source:'user_web_control',key:'carpet_pickup',priority:'low'});
 assert.equal(r.data.rankingStatus,'dynamic_product_knowledge');assert.equal(r.data.firstAnswer.ranked[0].variantId,'fake_b');
}));
test('web unknown criterion queues investigation and withdraws incomplete ranking',async()=>serverTest(async u=>{
 let r=await post(u,'/api/create',{}),s=r.data.session;
 for(const x of [scope,first,second])r=await update(u,s,r.data.snapshot.revision,x);
 r=await update(u,s,r.data.snapshot.revision,{type:'set_criterion',source:'user_web_control',key:'allergy_filtration',label:'Allergy filtration',value:{kind:'boolean',value:true},priority:'hard'});
 assert.equal(r.data.rankingStatus,'not_available');assert.equal(r.data.realProductComparisons.length,0);
 assert.ok(r.data.firstAnswer.researchGaps.some((g:any)=>g.kind==='missing_criterion'));
}));
test('web client cannot inject fake knowledge by posting catalog fields',async()=>serverTest(async u=>{
 let r=await post(u,'/api/create',{knowledge:{catalogs:[signed]}}),s=r.data.session;
 r=await update(u,s,r.data.snapshot.revision,{...scope,knowledge:{catalogs:[]}});
 assert.equal(r.data.rankingStatus,'not_available');
 r=await update(u,s,r.data.snapshot.revision,first);
 assert.equal(r.data.rankingStatus,'dynamic_product_knowledge');
}));
test('web missing catalog avoids pretending to have researched a different category',async()=>serverTest(async u=>{
 let r=await post(u,'/api/create',{}),s=r.data.session;
 r=await update(u,s,r.data.snapshot.revision,{type:'set_scope',source:'user_web_control',scope:{task:'product_selection',category:'air_purifier'}});
 assert.equal(r.data.rankingStatus,'not_available');
 assert.ok(r.data.firstAnswer.researchGaps.some((g:any)=>g.kind==='no_catalog'));
}));
test('old no-knowledge default continues safely to abstain',async()=>serverTest(async u=>{
 let r=await post(u,'/api/create',{}),s=r.data.session;
 for(const x of [scope,first,second])r=await update(u,s,r.data.snapshot.revision,x);
 assert.equal(r.data.rankingStatus,'not_available');
},null));
