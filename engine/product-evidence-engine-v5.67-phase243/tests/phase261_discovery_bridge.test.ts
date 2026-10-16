import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {KnowledgeStore246,type SourceInput246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {researchJobFromGap182} from '../src/phase182_gap_research_orchestrator.js';
import {validateResearchPolicy257} from '../src/phase257_research_planning.js';
import type {Registry220,Source220} from '../src/phase220_autonomous_discovery_worker.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
import type {WebSourcePolicy} from '../src/web_evidence_acquisition.js';
import {discoveryTargetFromJob261,discoverForTarget261,assessDiscovery261,type JobRef261} from '../src/phase261_discovery_bridge.js';

// Phase261 checkpoint A. Hosts under pee261-fixture.test are fictional; fixture policies use the Phase223
// public-metadata mode with basis "unknown", so no rights review is asserted. No test touches the network.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee261-'));let n=0;const dbPath=()=>join(dir,`s${++n}.sqlite`);
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const AT='2026-10-16T12:00:00.000Z';
const HOST='maker.pee261-fixture.test',LAB='lab.pee261-fixture.test',SHOP='shop.pee261-fixture.test';
const researchPolicy=validateResearchPolicy257({schema:'pee257.research-policy.v1',policyId:'pee261_test_policy',revision:1,market:'uk',issuedAt:'2026-10-16T00:00:00.000Z',
 expiresAt:'2026-11-10T00:00:00.000Z',categories:['air_fryers'],needKinds:['missing_declaration','declaration_conflict'],maxJobsPerPlan:20,allowSourceReads:false,maxSourceReads:0,maxWorkerTasks:0},new Date(AT));
const job=(productId:string|null,criterion:string|null,gapKind:JobRef261['gapKind']='missing_declaration',categoryId='air_fryers'):JobRef261=>{
 const reference=productId&&criterion?`${productId}:${criterion}`:(productId??criterion??'');
 const j=researchJobFromGap182(categoryId,{kind:gapKind,reference,action:'test'});return {jobId:j.jobId,categoryId,gapKind,productId,criterion};};
const page=(name:string)=>`<!doctype html><html><head><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name,
 brand:{'@type':'Brand',name:'Vortex'},additionalProperty:[{'@type':'PropertyValue',name:'Power',value:1500,unitText:'W'}]})}</script></head><body><h1>${name}</h1></body></html>`;
function store(){
 const s=new KnowledgeStore246(dbPath());
 const source:SourceInput246={sourceId:'src_maker_fixture',host:HOST,sourceType:'manufacturer',sourceTypeBasis:'operator_asserted'};
 const url=`https://${HOST}/p/vortex-vx100`;const html=page('Vortex VX100 Air Fryer');
 const r=s.ingestObservation246({source,url,sha256:sha(html),bytes:html.length,httpStatus:200,fetchedAt:AT,runId:'run_261',extractorVersion:'phase245@test',
  extraction:extractSpecifications245(html,url),categoryHypotheses:['air_fryers']});
 return {s,productId:r.productIds[0]};
}
const watch=(id:string,host:string,channel:Source220['watch']['channel'],cleared=true):Source220=>({watch:{id,categoryId:'air_fryers',host,channel,mechanism:'sitemap_delta',
 tier:'core',rightsClearedForMetadata:cleared,nextCheckAt:'2026-10-16T00:00:00.000Z',lastCheckAt:null,quietChecks:0,errors:0},sitemapPath:'/sitemap.xml',pathPrefix:'/p/',discoveryAccess:'public_metadata'});
const policy=(sourceId:string,host:string):WebSourcePolicy=>({sourceId,host,basis:'unknown',rightsDocumentId:null,rightsDocumentUrl:null,reviewedBy:null,reviewedAt:null,validUntil:null,
 permittedOperations:['metadata_discovery'],robots:'unknown',robotsCheckedAt:null,websiteTerms:'unknown',termsCheckedAt:null,commercialUseReviewed:false} as unknown as WebSourcePolicy);
const registry=(sources:Source220[],policies:WebSourcePolicy[]):Registry220=>({schema:'pee220.registry.1',vocabulary:[],sources,policies});
const SITEMAP=`<?xml version="1.0"?><urlset>${['/p/vortex-vx100','/p/vortex-vx100-manual','/p/vortex-vx200','/p/air-fryer-guide','/blog/news']
 .map(p=>`<url><loc>https://${HOST}${p}</loc></url>`).join('')}</urlset>`;
const calls:string[]=[];
const transport:SourceTransport={async get(url){calls.push(url);return url.endsWith('/robots.txt')?{status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /\n'}:
 {status:200,finalUrl:url,contentType:'application/xml',body:SITEMAP};}};
const noNetwork:SourceTransport={async get(){throw Error('network must not be touched');}};

test('a genuine job becomes a discovery target; forged or unsupported jobs are refused',()=>{
 const {s,productId}=store();
 const t=discoveryTargetFromJob261(job(productId,'capacity_min'),{market:'uk',store:s});
 assert.deepEqual(t.evidence.statementKinds,['declared_specification']);
 assert.ok(t.evidence.channels.includes('manufacturer_product_index'));
 assert.deepEqual(t.subject.knownIdentifiers,['vx100'],'the model code of the product\'s own retained page, an exact identifier');
 assert.equal(t.subject.exactVariantVerified,false);assert.equal(t.language.filter,null);assert.equal(t.publisherCountryUsed,false);
 assert.equal(discoveryTargetFromJob261(job(productId,'capacity_min'),{market:'jp',store:s}).market,'jp','the market comes from the policy, not from code');
 assert.throws(()=>discoveryTargetFromJob261({...job(productId,'capacity_min'),criterion:'width_max'},{market:'uk',store:s}),/not a genuine job/);
 assert.throws(()=>discoveryTargetFromJob261(job(productId,'capacity_min'),{market:'',store:s}),/explicit market/);
 assert.throws(()=>discoveryTargetFromJob261(job(null,'cat_x','stale_knowledge'),{market:'uk'}),/no evidence lane/);
 s.close();
});

test('forward compatibility: independent tests, conditions and cultural expertise enter as lanes or named boundaries',()=>{
 // Air fryer cooking evenness: an independent-test requirement (missing_test preview, not a Phase257 job).
 const even=discoveryTargetFromJob261(job('prd_future_a','cooking_evenness','missing_test'),{market:'uk'});
 assert.deepEqual(even.evidence.statementKinds,['instrumental_measurement','observed_practical_result']);
 assert.ok(even.evidence.channels.includes('professional_test_feed'));assert.ok(!even.evidence.channels.includes('manufacturer_product_index'));
 assert.deepEqual(even.evidence.unroutedRoles,['original_video_demonstration'],'video has no Phase82 channel type yet');
 // Dehumidifier extraction at stated temperature and humidity: the criterion fits, the conditions cannot be carried.
 const dh=discoveryTargetFromJob261(job('prd_future_d','extraction_rate','missing_test','dehumidifiers'),{market:'de'});
 assert.ok(dh.inexpressible.includes('test_conditions'));
 // Qualified Italian espresso sensory assessment: an interpretation lane whose expert role has no channel, and
 // assessor expertise and cultural tradition cannot be required by the job.
 const esp=discoveryTargetFromJob261(job(null,'espresso_sensory_quality','missing_criterion','coffee_machines'),{market:'it'});
 assert.ok(esp.evidence.roles.includes('qualified_cultural_expertise'));assert.ok(esp.evidence.unroutedRoles.includes('qualified_cultural_expertise'));
 assert.ok(esp.inexpressible.includes('assessor_expertise')&&esp.inexpressible.includes('cultural_tradition'));
 // None of these is authorised: the Phase257 policy names neither the category nor the gap kind.
 return assert.rejects(discoverForTarget261({target:dh,registry:registry([],[]),researchPolicy:{...researchPolicy,market:'de'},asOf:AT,mode:'offline_fixture',fixtureTransport:noNetwork}),/category_not_in_policy/);
});

test('capability A offline: authorised channel to unverified candidates, with exact attribution and every stage kept apart',async()=>{
 const {s,productId}=store();const before=JSON.stringify(s.stats246());calls.length=0;
 const t=discoveryTargetFromJob261(job(productId,'capacity_min'),{market:'uk',store:s});
 const reg=registry([watch('maker_index',HOST,'manufacturer_product_index'),watch('lab_feed',LAB,'professional_test_feed'),
  watch('shop_new',SHOP,'retailer_new_models'),watch('shop_blocked','blocked.pee261-fixture.test','retailer_new_models',false)],
  [policy('maker_index',HOST),policy('lab_feed',LAB),policy('shop_blocked','blocked.pee261-fixture.test')]);
 const d=await discoverForTarget261({target:t,registry:reg,researchPolicy,asOf:AT,mode:'offline_fixture',fixtureTransport:transport,store:s});
 assert.equal(d.status,'candidates_found');
 assert.equal(d.channels.wrongLane,1,'a test feed is not a declaration channel');
 assert.deepEqual(d.channels.blockedNoPolicy,['shop_new']);assert.deepEqual(d.channels.blockedNotCleared,['shop_blocked']);assert.deepEqual(d.channels.selected,['maker_index']);
 const why=Object.fromEntries(d.rejected.map(r=>[new URL(r.url).pathname,r.reason]));
 assert.equal(why['/p/vortex-vx100'],'already_observed');assert.equal(why['/p/vortex-vx200'],'url_names_other_model');
 const got=Object.fromEntries(d.candidates.map(c=>[new URL(c.url).pathname,c.attribution]));
 assert.deepEqual(got,{'/p/vortex-vx100-manual':'url_token_matches_known_identifier','/p/air-fryer-guide':'product_unknown'},'/blog/ is outside the source path scope');
 for(const c of d.candidates){
  assert.equal(c.jobId,t.job.jobId);assert.equal(c.registrySourceId,'maker_index');assert.equal(c.genuineDiscovery,false);assert.equal(c.origin,'offline_fixture');
  assert.deepEqual(c.stages,{candidateUrlDiscovered:true,sourceIdentityRegistered:true,metadataDiscoveryAllowed:true,pageRetrievalPermitted:false,
   factualInformationRetained:false,independentEvidenceVerified:false,recommendationAuthorized:false});
 }
 assert.deepEqual(d.networkCalls,{live:0,fixture:2});assert.deepEqual(calls,[`https://${HOST}/robots.txt`,`https://${HOST}/sitemap.xml`]);
 assert.equal(d.observations.length,1);assert.equal(d.observations[0].sitemapSha256,sha(SITEMAP));
 assert.equal(d.capabilityB.newPublisherDiscovery,false);
 assert.equal(JSON.stringify(s.stats246()),before,'discovery writes nothing to the store');
 s.close();
});

test('live mode is refused under the Phase257 policy; offline mode never falls back to the network',async()=>{
 const {s,productId}=store();const t=discoveryTargetFromJob261(job(productId,'capacity_min'),{market:'uk',store:s});
 const reg=registry([watch('maker_index',HOST,'manufacturer_product_index')],[policy('maker_index',HOST)]);
 const live=await discoverForTarget261({target:t,registry:reg,researchPolicy,asOf:AT,mode:'live',fixtureTransport:noNetwork,store:s});
 assert.equal(live.status,'blocked_live_reads_disabled');assert.deepEqual(live.networkCalls,{live:0,fixture:0});
 await assert.rejects(discoverForTarget261({target:t,registry:reg,researchPolicy,asOf:AT,mode:'offline_fixture',store:s}),/fixture_transport_required/);
 await assert.rejects(discoverForTarget261({target:t,registry:reg,researchPolicy:{...researchPolicy,market:'us'},asOf:AT,mode:'offline_fixture',fixtureTransport:transport}),/market_mismatch/);
 s.close();
});

test('a restricted host is not proposed; a product without identifiers stays unknown rather than matched by name',async()=>{
 const {s,productId}=store();
 s.recordAccess246(HOST,'forbidden',AT);s.recordAccess246(HOST,'forbidden',AT);
 const reg=registry([watch('maker_index',HOST,'manufacturer_product_index')],[policy('maker_index',HOST)]);
 const t=discoveryTargetFromJob261(job(productId,'capacity_min'),{market:'uk',store:s});
 const d=await discoverForTarget261({target:t,registry:reg,researchPolicy,asOf:AT,mode:'offline_fixture',fixtureTransport:transport,store:s});
 assert.equal(d.candidates.length,0);assert.ok(d.rejected.some(r=>r.reason==='host_restricted'));
 // No store, no identifiers: nothing is rejected as another model and nothing is claimed as the product.
 const bare=discoveryTargetFromJob261(job('prd_without_ids','capacity_min'),{market:'uk'});
 const b=await discoverForTarget261({target:bare,registry:reg,researchPolicy,asOf:AT,mode:'offline_fixture',fixtureTransport:transport});
 assert.ok(b.candidates.length>=3&&b.candidates.every(c=>c.attribution==='product_unknown'&&c.stages.sourceIdentityRegistered===false));
 const a=assessDiscovery261({target:t,registry:registry([],[]),researchPolicy,store:s});
 assert.deepEqual(a.blockers,['no_operator_discovery_registry_source_for_category','known_product_hosts_have_no_retained_source_policy','live_reads_disabled_by_research_policy',
  'capability_b_new_publisher_discovery_absent']);
 assert.equal(a.authorisedChannels,0);assert.equal(a.networkCalls,0);
 s.close();
});

test('checkpoint B regression: a URL carrying the product\'s exact GTIN matches; a GTIN beside another model code stays unknown',async()=>{
 // Pilot first-run defect: both pilot products had only a GTIN, which is not a letters-and-digits model token.
 const s=new KnowledgeStore246(dbPath());
 const g='5012345678900';const url=`https://${HOST}/p/item-${g}`;
 const html=`<!doctype html><html><head><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name:'Vortex Fryer',gtin13:g,
  brand:{'@type':'Brand',name:'Vortex'},additionalProperty:[{'@type':'PropertyValue',name:'Power',value:1500,unitText:'W'}]})}</script></head><body><h1>Vortex Fryer</h1></body></html>`;
 const r=s.ingestObservation246({source:{sourceId:'src_maker_fixture',host:HOST,sourceType:'manufacturer',sourceTypeBasis:'operator_asserted'},url,sha256:sha(html),bytes:html.length,
  httpStatus:200,fetchedAt:AT,runId:'run_261',extractorVersion:'phase245@test',extraction:extractSpecifications245(html,url),categoryHypotheses:['air_fryers']});
 const t=discoveryTargetFromJob261(job(r.productIds[0],'capacity_min'),{market:'uk',store:s});
 assert.ok(t.subject.knownIdentifiers.includes('0'+g),'GTINs are compared in their 14-digit form');
 const xml=`<?xml version="1.0"?><urlset>${[`/p/${g}-manual`,`/p/0${g}`,`/p/zx500-${g}`,'/p/zx500-guide'].map(p=>`<url><loc>https://${HOST}${p}</loc></url>`).join('')}</urlset>`;
 const tr:SourceTransport={async get(u){return u.endsWith('/robots.txt')?{status:200,finalUrl:u,contentType:'text/plain',body:'User-agent: *\nAllow: /\n'}:{status:200,finalUrl:u,contentType:'application/xml',body:xml};}};
 const d=await discoverForTarget261({target:t,registry:registry([watch('maker_index',HOST,'manufacturer_product_index')],[policy('maker_index',HOST)]),researchPolicy,asOf:AT,
  mode:'offline_fixture',fixtureTransport:tr,store:s});
 const got=Object.fromEntries(d.candidates.map(c=>[new URL(c.url).pathname,c.attribution]));
 assert.equal(got[`/p/${g}-manual`],'url_token_matches_known_identifier');assert.equal(got[`/p/0${g}`],'url_token_matches_known_identifier');
 assert.equal(got[`/p/zx500-${g}`],'product_unknown','conflicting identifiers: neither matched nor rejected');
 assert.equal(d.rejected.find(x=>x.url.endsWith('/p/zx500-guide'))?.reason,'url_names_other_model');
 s.close();
});
