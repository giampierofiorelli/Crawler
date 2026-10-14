import {test} from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {generateKeyPairSync,sign} from 'node:crypto';
import {createPhase178Server} from '../src/phase178_site_server.js';
import {createDecision177,applyDecisionAction177} from '../src/phase177_decision_snapshot.js';
import {canonicalJson180,type ReviewedRelease180} from '../src/phase180_reviewed_first_answer.js';
const key=generateKeyPairSync('ed25519');
let template=createDecision177('offline_template');
template=applyDecisionAction177(template,{type:'set_scope',source:'user_web_control',scope:{task:'product_selection',category:'water_filter'}}).snapshot;
template=applyDecisionAction177(template,{type:'set_criterion',source:'user_web_control',key:'lead_reduction',label:'Lead reduction',value:{kind:'boolean',value:true},priority:'hard'}).snapshot;
const release:ReviewedRelease180={phase:180,schema:'180.1',market:'uk',categoryId:'water_filter',rankInputFingerprint:template.rankInputFingerprint,
 evidenceRevision:'release_a',policyRevision:'reviewed_a',reviewedAt:'2020-01-01T00:00:00Z',expiresAt:'2035-01-01T00:00:00Z',
 discoveredVariantIds:['demo_a','demo_b'],coverageStatement:'Controlled test fixture, no public market coverage claim.',marketCoverageComplete:false,
 reviewedCriteria:[{key:'lead_reduction',label:'Lead reduction',value:{kind:'boolean',value:true},priority:'hard'}],
 criteriaWeights:[{key:'lead_reduction',weightUnits:10000,elicitationReference:'reviewed_elicitation_a',methodId:'method_a',protocolVersion:'v1'}],
 evidence:[{id:'ev1',variantId:'demo_a',originalTestId:'original_a',methodId:'method_a',protocolVersion:'v1',sourceUrl:'https://example.org/original/a',observedAt:'2020-01-01T00:00:00Z',scope:'exact_variant_original_professional_test'}],
 variants:[{id:'demo_a',name:'FAKE TEST FIXTURE (not a product)',criteria:[{key:'lead_reduction',valuePoints:9000,evidenceIds:['ev1']}],hardAssessments:[{key:'lead_reduction',outcome:'pass',evidenceIds:['ev1']}]}],externalReviewReference:'fixture_reference'};
const signed={release,keyId:'test_reviewer',signatureBase64:sign(null,Buffer.from(canonicalJson180(release)),key.privateKey).toString('base64')};
const config={authority:{asOf:'2020-01-01T00:00:00Z',market:'uk',publicKeys:{test_reviewer:key.publicKey.export({format:'pem',type:'spki'}).toString()}},releases:[signed]};
async function post(base:string,path:string,payload:object){const r=await fetch(base+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});return {status:r.status,data:await r.json()};}
async function withServer(fn:(url:string)=>Promise<void>){const server=createPhase178Server('web/phase178',config);server.listen(0,'127.0.0.1');await once(server,'listening');const adr=server.address();assert(adr&&typeof adr!=='string');try{await fn(`http://127.0.0.1:${adr.port}`);}finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}}
const scopeAction={type:'set_scope',source:'user_web_control',scope:{task:'product_selection',category:'water_filter'}};
const needAction={type:'set_criterion',source:'user_web_control',key:'lead_reduction',label:'Lead reduction',value:{kind:'boolean',value:true},priority:'hard'};
test('HTTP shows published ranking only on matching confirmed requirements, and withdraws it on criterion changes',async()=>withServer(async url=>{
 let r=await post(url,'/api/create',{}),token=r.data.session;
 assert.equal(r.data.rankingStatus,'not_available');
 r=await post(url,'/api/action',{session:token,expectedRevision:r.data.snapshot.revision,action:scopeAction});
 assert.equal(r.data.rankingStatus,'not_available');
 r=await post(url,'/api/action',{session:token,expectedRevision:r.data.snapshot.revision,action:needAction});
 assert.equal(r.data.rankingStatus,'reviewed_release');assert.equal(r.data.firstAnswer.status,'ranking_ready');
 assert.equal(r.data.firstAnswer.ranked.length,1);assert.ok(r.data.firstAnswer.ranked[0].name.includes('FAKE TEST FIXTURE'));
 assert.equal(r.data.firstAnswer.coverage.unreviewed,1);
 r=await post(url,'/api/action',{session:token,expectedRevision:r.data.snapshot.revision,
   action:{type:'set_priority',source:'user_web_control',key:'lead_reduction',priority:'normal'}});
 assert.equal(r.data.rankingStatus,'not_available');assert.deepEqual(r.data.realProductComparisons,[]);
}));
test('client cannot inject or replace publication release via HTTP',async()=>withServer(async url=>{
 let r=await post(url,'/api/create',{publication:config,expectedRevision:1});const token=r.data.session;
 assert.equal(r.data.rankingStatus,'not_available');
 r=await post(url,'/api/action',{session:token,expectedRevision:0,action:scopeAction,publication:config});
 assert.equal(r.data.rankingStatus,'not_available');
}));
test('a different visitor does not inherit the first visitor\'s confirmed shopping decision',async()=>withServer(async url=>{
 const a=await post(url,'/api/create',{}),b=await post(url,'/api/create',{});
 const first=await post(url,'/api/action',{session:a.data.session,expectedRevision:0,action:scopeAction});
 const next=await post(url,'/api/action',{session:a.data.session,expectedRevision:first.data.snapshot.revision,action:needAction});
 assert.equal(next.data.rankingStatus,'reviewed_release');
 assert.equal(b.data.rankingStatus,'not_available');
}));
