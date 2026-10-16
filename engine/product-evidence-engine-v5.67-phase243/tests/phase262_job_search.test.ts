import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {KnowledgeStore246,type SourceInput246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {researchJobFromGap182} from '../src/phase182_gap_research_orchestrator.js';
import {validateResearchPolicy257} from '../src/phase257_research_planning.js';
import {planSearchQueries223,searchCandidateUrls223,type SearchConfig223} from '../src/phase223_search_discovery.js';
import {discoveryTargetFromJob261,type JobRef261} from '../src/phase261_discovery_bridge.js';
import {planJobSearch262,searchForTarget262,historicalAssessment262} from '../src/phase262_job_search.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
import type {WebSourcePolicy} from '../src/web_evidence_acquisition.js';
import type {Registry220} from '../src/phase220_autonomous_discovery_worker.js';

// Phase262 checkpoint A. Every network response is a fixture (Phase223 synthetic_fixture mode); hosts under
// pee262-fixture.test are fictional and absent from any store.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee262-'));let n=0;const dbPath=()=>join(dir,`s${++n}.sqlite`);
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const AT='2026-10-16T12:00:00.000Z';
const MAKER='maker.pee262-fixture.test',SHOP='shop.pee262-fixture.test',LAB='new-lab.pee262-fixture.test';
const GTIN='5012345678900';
const researchPolicy=validateResearchPolicy257({schema:'pee257.research-policy.v1',policyId:'pee262_test_policy',revision:1,market:'uk',issuedAt:'2026-10-16T00:00:00.000Z',
 expiresAt:'2026-11-10T00:00:00.000Z',categories:['air_fryers'],needKinds:['missing_declaration','declaration_conflict'],maxJobsPerPlan:20,allowSourceReads:false,maxSourceReads:0,maxWorkerTasks:0},new Date(AT));
const config:SearchConfig223={schema:'pee223.search-config.1',provider:'searxng',endpoint:'https://search.pee262-fixture.test/search',enabled:true,maxQueries:2,maxResults:20,serviceAccessReviewed:true};
const approved=(host:string):WebSourcePolicy=>({sourceId:'pol_'+host,host,basis:'written_permission',rightsDocumentId:'rights_'+host,rightsDocumentUrl:'https://rights.pee262-fixture.test/'+host,
 reviewedBy:'rights_reviewer',reviewedAt:'2026-10-01T00:00:00Z',validUntil:'2027-10-01T00:00:00Z',permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage'],
 robots:'allowed',robotsCheckedAt:'2026-10-16T06:00:00Z',websiteTerms:'reviewed_permitted',termsCheckedAt:'2026-10-10T00:00:00Z',commercialUseReviewed:true});
const job=(productId:string|null,criterion:string|null,gapKind:JobRef261['gapKind']='missing_declaration'):JobRef261=>{
 const reference=productId&&criterion?`${productId}:${criterion}`:(productId??criterion??'');
 return {jobId:researchJobFromGap182('air_fryers',{kind:gapKind,reference,action:'t'}).jobId,categoryId:'air_fryers',gapKind,productId,criterion};};
const page=(name:string,extra:Record<string,unknown>)=>`<!doctype html><html><head><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name,
 brand:{'@type':'Brand',name:'Vortex'},...extra,additionalProperty:[{'@type':'PropertyValue',name:'Power',value:1500,unitText:'W'}]})}</script></head><body><h1>${name}</h1></body></html>`;
function store(){
 const s=new KnowledgeStore246(dbPath());
 const ingest=(url:string,html:string,source:SourceInput246)=>s.ingestObservation246({source,url,sha256:sha(html),bytes:html.length,httpStatus:200,fetchedAt:AT,runId:'run_262',
  extractorVersion:'spec-extractor-7',extraction:extractSpecifications245(html,url),categoryHypotheses:['air_fryers']});
 // A product with an exact GTIN on a retained manufacturer page (values retained), and one with only a shop name (metadata only).
 const a=ingest(`https://${MAKER}/p/fryer-${GTIN}`,page('Vortex Crisp Fryer',{gtin13:GTIN}),{sourceId:'src_maker',host:MAKER,sourceType:'manufacturer',sourceTypeBasis:'operator_asserted',policy:approved(MAKER)});
 const b=ingest(`https://${SHOP}/item/family-fryer`,page('Vortex Family Air Fryer',{}),{sourceId:'src_shop',host:SHOP,sourceType:'retailer',sourceTypeBasis:'operator_asserted'});
 return {s,withId:a.productIds[0],noId:b.productIds[0]};
}
const RESULTS=(withIdUrl:string)=>({results:[
 {url:`https://${LAB}/reviews/vortex-${GTIN}-tested?utm_source=feed`,title:'not stored'},
 {url:`https://${LAB}/reviews/vortex-${GTIN}-tested`,title:'duplicate'},
 {url:`https://${MAKER}/support/${GTIN}-manual`},
 {url:withIdUrl},
 {url:`https://${LAB}/reviews/vortex-zx900-tested`},
 {url:`https://${LAB}/best-air-fryers`},
 {url:'http://insecure.pee262-fixture.test/x'},{url:'https://127.0.0.1/admin'},{url:'not a url'},{title:'no url'}]});
const transport=(body:unknown,calls:string[]=[]):SourceTransport=>({async get(url){calls.push(url);
 if(url.endsWith('/robots.txt'))return {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /\n'};
 return {status:200,finalUrl:url,contentType:'application/json',body:JSON.stringify(body)};}});

test('a genuine job yields bounded, deterministic queries from retained identity only, with no user text',()=>{
 const {s,withId,noId}=store();
 const t=discoveryTargetFromJob261(job(withId,'capacity_min'),{market:'uk',store:s});
 const p=planJobSearch262(t,{store:s});
 assert.deepEqual(p.queries.map(q=>q.purpose),['declared_specification','manufacturer_documentation']);
 assert.ok(p.queries.every(q=>q.query.includes(' '+GTIN+' ')&&!q.query.includes('0'+GTIN)&&q.usesExactIdentifier),'the exact identifier, in its declared form, is the subject');
 assert.ok(p.queries[0].query.includes('capacity'));assert.equal(p.userTextSent,false);
 assert.deepEqual(planJobSearch262(t,{store:s}),p,'deterministic');
 // No cross-site identifier: discovery stays possible, from brand and retained name, flagged as not exact.
 const u=planJobSearch262(discoveryTargetFromJob261(job(noId,'capacity_min'),{market:'uk',store:s}),{store:s});
 assert.ok(u.queries.length===2&&u.queries.every(q=>!q.usesExactIdentifier&&q.query.startsWith('vortex family air fryer')));
 // Independent-test and method lanes produce different query purposes.
 assert.deepEqual(planJobSearch262(discoveryTargetFromJob261(job(withId,'cooking_evenness','missing_test'),{market:'uk',store:s}),{store:s}).queries.map(q=>q.purpose),['performance_measurement','practical_test']);
 assert.deepEqual(planJobSearch262(discoveryTargetFromJob261(job(null,'cooking_evenness','missing_criterion'),{market:'uk'})).queries.map(q=>q.purpose),['test_method','expert_evaluation']);
 assert.ok(p.notYetExpressible.includes('test_conditions')&&p.notYetExpressible.includes('non_english_query_terms'));
 s.close();
});

test('search candidates: new domains found, known URLs and other models excluded, unknown identity preserved, unsafe dropped',async()=>{
 const {s,withId}=store();const calls:string[]=[];
 const t=discoveryTargetFromJob261(job(withId,'capacity_min'),{market:'uk',store:s});const plan=planJobSearch262(t,{store:s});
 const known=`https://${MAKER}/p/fryer-${GTIN}`;
 const r=await searchForTarget262({target:t,plan,config,researchPolicy,mode:'synthetic_fixture',fixtureTransport:transport(RESULTS(known),calls),store:s});
 assert.equal(r.status,'candidates_found');
 const by=Object.fromEntries(r.candidates.map(c=>[new URL(c.url).pathname,c]));
 const tested=by[`/reviews/vortex-${GTIN}-tested`];
 assert.equal(tested.publisher.recognition,'unrecognised_domain');assert.equal(tested.documentRole,'role_unknown');assert.equal(tested.attribution,'url_token_matches_known_identifier');
 assert.equal(tested.stages.publisherRecognised,false);assert.equal(tested.stages.documentRegistered,false);assert.equal(tested.genuineDiscovery,false);
 const manual=by[`/support/${GTIN}-manual`];
 // Phase263: a familiar manufacturer host does not make a new document a manufacturer specification.
 assert.equal(manual.publisher.recognition,'recognised_publisher');assert.equal(manual.publisher.canonicalSourceType,'manufacturer');
 assert.equal(manual.documentRole,'role_unknown','the document role is unknown until the document is reviewed');
 assert.equal(manual.stages.publisherRecognised,true);assert.equal(manual.stages.documentRegistered,false);
 assert.equal(by['/best-air-fryers'].attribution,'product_unknown','a plausible page is not this product');
 const why=Object.fromEntries(r.rejected.map(x=>[new URL(x.url).pathname,x.reason]));
 assert.equal(why[`/p/fryer-${GTIN}`],'already_observed');assert.equal(why['/reviews/vortex-zx900-tested'],'url_names_other_model');
 assert.equal(r.candidates.length+r.rejected.length,5,'duplicate (tracking parameter) merged; insecure, private and malformed URLs dropped by Phase223');
 assert.ok(r.candidates.every(c=>c.purpose==='declared_specification'),'each lead keeps the query purpose that found it');
 assert.deepEqual(r.cost,{requests:3,searchRequests:2,robotsRequests:1,liveNetworkCalls:0});
 assert.ok(calls.every(u=>u.startsWith('https://search.pee262-fixture.test/')),'only the search service is contacted; no candidate page is read');
 assert.ok(calls.filter(u=>u.includes('/search?')).every(u=>new URL(u).searchParams.get('language')==='en'));
 assert.deepEqual(r.capabilityStates,{adapterExists:true,providerConfiguredAndPermitted:false,realDiscoveryDemonstrated:false,verifiedUsefulEvidence:false});
 s.close();
});

test('live search is refused under the research policy; a disabled or unreviewed provider is not used',async()=>{
 const {s,withId}=store();const t=discoveryTargetFromJob261(job(withId,'capacity_min'),{market:'uk',store:s});const plan=planJobSearch262(t,{store:s});
 const live=await searchForTarget262({target:t,plan,config,researchPolicy,mode:'live',store:s});
 assert.equal(live.status,'blocked_live_reads_disabled');assert.equal(live.cost.requests,0);
 for(const change of [{enabled:false},{serviceAccessReviewed:false}]){const calls:string[]=[];
  const r=await searchForTarget262({target:t,plan,config:{...config,...change},researchPolicy,mode:'synthetic_fixture',fixtureTransport:transport(RESULTS(''),calls),store:s});
  assert.equal(r.status,'provider_not_usable');assert.equal(calls.length,0);}
 await assert.rejects(searchForTarget262({target:t,plan,config,researchPolicy:{...researchPolicy,categories:['kettles']},mode:'synthetic_fixture',fixtureTransport:transport(RESULTS(''))}),/category_not_in_policy/);
 s.close();
});

test('Phase223 question path unchanged; the result-language filter is configurable and validated',async()=>{
 const registry:Registry220=JSON.parse(readFileSync('docs/phase220/phase220-category-vocabulary.json','utf8'));
 assert.equal(planSearchQueries223('I need football boots for AG pitches',registry).queries.length,2);
 const calls:string[]=[];
 await searchCandidateUrls223({question:'I need football boots for AG pitches',registry,config:{...config,language:'all'},mode:'synthetic_fixture',fixtureTransport:transport({results:[]},calls)});
 assert.ok(calls.filter(u=>u.includes('/search?')).length>0);
 assert.ok(calls.filter(u=>u.includes('/search?')).every(u=>new URL(u).searchParams.get('language')==='all'));
 await assert.rejects(searchCandidateUrls223({question:'I need football boots for AG pitches',registry,config:{...config,language:'english'},mode:'synthetic_fixture',fixtureTransport:transport({results:[]})}),/bad_search_config/);
});

test('historical assessment separates rights-withheld, retained and absent information from discovery needs',()=>{
 const {s,withId,noId}=store();
 // The shop page declared a Power label, but its values were not retained (no fact-storage permission).
 assert.equal(historicalAssessment262(s,{productId:noId,criterion:'power_min'}).class,'label_seen_value_withheld_by_rights');
 // A retained Power declaration exists for the GTIN product: the gap is not a missing document.
 assert.equal(historicalAssessment262(s,{productId:withId,criterion:'power_min'}).class,'retained_but_not_usable');
 const abs=historicalAssessment262(s,{productId:withId,criterion:'capacity_min'});
 assert.equal(abs.class,'absent_from_known_sources');assert.equal(abs.newDiscoveryNeeded,true);assert.equal(abs.reinspectionOpportunity,false);
 s.close();
});
