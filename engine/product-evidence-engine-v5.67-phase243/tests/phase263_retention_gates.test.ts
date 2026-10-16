import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type SourceInput246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {FACTUAL_CLASS_POLICY249,detectReservations249} from '../src/phase249_retention_policy.js';
import {validateResearchPolicy257} from '../src/phase257_research_planning.js';
import {researchJobFromGap182} from '../src/phase182_gap_research_orchestrator.js';
import {discoveryTargetFromJob261} from '../src/phase261_discovery_bridge.js';
import {planJobSearch262,searchForTarget262,type SearchProvider262} from '../src/phase262_job_search.js';
import {operationGates263} from '../src/phase263_operation_gates.js';
import type {SearchConfig223} from '../src/phase223_search_discovery.js';

// Phase263 checkpoint B. Temporary private stores; fictional hosts; no network.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee263-'));
const AT='2026-10-16T12:00:00.000Z';
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class',classPolicy:FACTUAL_CLASS_POLICY249};
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const src=(host:string,type:SourceInput246['sourceType'],policy?:SourceInput246['policy']):SourceInput246=>({sourceId:'src_'+host.replace(/\W/g,'_'),host,sourceType:type,sourceTypeBasis:'operator_asserted',policy});
const PROSE='Our best fryer ever, loved by chefs everywhere and made with care.';
const page=(name:string)=>`<!doctype html><html><head><script type="application/ld+json">${JSON.stringify({'@type':'Product',name,offers:{price:'99.00',priceCurrency:'GBP'}})}</script></head>
 <body><main><h1>${name}</h1><p>${PROSE}</p><table><tr><th>Power</th><td>1500 W</td></tr><tr><th>Capacity</th><td>5.5 l</td></tr></table></main></body></html>`;
const obs=(s:KnowledgeStore246,url:string,html:string,source:SourceInput246,extra={})=>s.ingestObservation246({source,url,sha256:sha(html),bytes:html.length,httpStatus:200,
 fetchedAt:AT,runId:'r263',extractorVersion:'spec-extractor-7',extraction:extractSpecifications245(html,url),categoryHypotheses:['air_fryers'],...extra});
const store=(p=CLASS)=>new KnowledgeStore246(join(dir,Math.random().toString(36).slice(2)+'.sqlite'),p);
const researchPolicy=validateResearchPolicy257({schema:'pee257.research-policy.v1',policyId:'pee263_test',revision:1,market:'uk',issuedAt:'2026-10-16T00:00:00.000Z',
 expiresAt:'2026-11-10T00:00:00.000Z',categories:['air_fryers'],needKinds:['missing_declaration','declaration_conflict'],maxJobsPerPlan:20,allowSourceReads:false,maxSourceReads:0,maxWorkerTasks:0},new Date(AT));

test('facts are retained apart from expression, and each operation gate is reported separately',()=>{
 const s=store();const r=obs(s,'https://maker.pee263-fixture.test/a',page('Fryer A'),src('maker.pee263-fixture.test','manufacturer'));
 assert.ok(r.declarationsRetained>=2,'individual facts kept');
 assert.ok(!JSON.stringify(s.export246({includePendingRights:true})).includes('loved by chefs'),'no sentence of the page is kept anywhere');
 const g=operationGates263(s,'src_maker_pee263_fixture_test',{asOf:AT,researchPolicy});
 assert.equal(g.structuredRetention.status,'class_policy_capped');assert.equal(g.structuredRetention.allows,true);
 assert.equal(g.originalAnalysis.allows,true);
 assert.equal(g.publication.status,'not_permitted_private_only','retention never implies publication');
 assert.equal(g.access.status,'not_authorised_by_research_policy','retention never implies a read: the research policy still decides');
 assert.equal(g.discovery.status,'requires_operator_registry_entry');assert.equal(g.legalReviewPerformed,false);
 s.close();
});

test('a known prohibition still blocks every operation it governs, without touching another source',()=>{
 const s=store();
 const refused={sourceId:'p',host:'no.pee263-fixture.test',basis:'refused' as const,rightsDocumentId:null,rightsDocumentUrl:null,reviewedBy:null,reviewedAt:null,validUntil:null,
  permittedOperations:[],robots:'allowed' as const,robotsCheckedAt:null,websiteTerms:'unknown' as const,termsCheckedAt:null,commercialUseReviewed:false};
 assert.equal(obs(s,'https://no.pee263-fixture.test/a',page('Fryer N'),src('no.pee263-fixture.test','retailer',refused)).retention,'blocked');
 obs(s,'https://ok.pee263-fixture.test/a',page('Fryer O'),src('ok.pee263-fixture.test','retailer'));
 const g=operationGates263(s,'src_no_pee263_fixture_test',{asOf:AT,researchPolicy:{...researchPolicy,allowSourceReads:true} as never});
 for(const k of ['discovery','access','temporaryInterpretation','structuredRetention','publication'] as const)assert.equal(g[k].allows,false,k+' stays blocked even if reads were allowed');
 assert.equal(g.originalAnalysis.status,'existing_citations_only');
 assert.equal(operationGates263(s,'src_ok_pee263_fixture_test',{asOf:AT,researchPolicy}).structuredRetention.allows,true,'the prohibition does not spread to other sources');
 s.close();
});

test('a machine-readable reservation keeps metadata only but does not stop PEE-authored analysis',()=>{
 const s=store();
 const res=detectReservations249('User-agent: *\nContent-Signal: ai-input=no\nAllow: /\n',null);
 const r=obs(s,'https://cs.pee263-fixture.test/a',page('Fryer C'),src('cs.pee263-fixture.test','retailer'),{reservations:res});
 assert.equal(r.declarationsRetained,0);
 const g=operationGates263(s,'src_cs_pee263_fixture_test',{asOf:AT,researchPolicy});
 assert.equal(g.structuredRetention.status,'machine_readable_reservation');assert.equal(g.structuredRetention.allows,false);
 assert.equal(g.originalAnalysis.allows,true,'a retention restriction is not a prohibition of every other operation');
 s.close();
});

test('rights gaps close when rights are no longer the cause, and stay open while a revision is still restricted',()=>{
 const s=store(DEFAULT_STORAGE_POLICY246);
 const a=obs(s,'https://shop.pee263-fixture.test/a',page('Fryer A'),src('shop.pee263-fixture.test','retailer'));
 const b=obs(s,'https://shop.pee263-fixture.test/b',page('Fryer B'),src('shop.pee263-fixture.test','retailer'));
 const pa=a.productIds[0],pb=b.productIds[0];
 const open=(p:string)=>s.gaps246({refId:p}).filter(g=>g.kind==='declarations_not_retained_rights'&&!g.resolvedAt).length;
 assert.equal(open(pa),1);assert.equal(open(pb),1);
 // Re-derivation can leave a product with no linked revision (as for 2 real products); its gap is then not a rights gap.
 s.db.prepare('DELETE FROM product_sources WHERE product_id=?').run(pa);
 s.reconcileRetentionGaps249(AT);
 assert.equal(open(pa),0,'closed: no current linked revision');
 assert.equal(open(pb),1,'kept: its revision is still metadata only');
 assert.ok(s.verifyJournal().ok);
 assert.ok((s.db.prepare("SELECT payload_json FROM events WHERE kind='gap_reclassified'").all() as {payload_json:string}[]).some(e=>JSON.parse(e.payload_json).reason==='no_current_linked_revision'));
 s.close();
});

test('the search provider is replaceable; leads keep provenance; document role and identity stay unknown',async()=>{
 const s=store();const r=obs(s,'https://maker.pee263-fixture.test/fryer-a',page('Vortex Fryer A'),src('maker.pee263-fixture.test','manufacturer'));
 const pid=r.productIds[0];
 const job={jobId:researchJobFromGap182('air_fryers',{kind:'missing_declaration',reference:`${pid}:width_max`,action:'t'}).jobId,categoryId:'air_fryers',gapKind:'missing_declaration' as const,productId:pid,criterion:'width_max'};
 const t=discoveryTargetFromJob261(job,{market:'uk',store:s});const plan=planJobSearch262(t,{store:s});
 const calls:string[]=[];
 const other:SearchProvider262=async({plan:p})=>{calls.push(...p.queries);return {candidates:[{url:'https://maker.pee263-fixture.test/support/manual',queryIndex:1},{url:'https://new-lab.pee263-fixture.test/fryer-review',queryIndex:0}],
  networkRequests:p.queries.map(q=>'fixture:'+q),reasonCodes:[]};};
 const config:SearchConfig223={schema:'pee223.search-config.1',provider:'searxng',endpoint:'https://search.pee263-fixture.test/search',enabled:true,maxQueries:2,maxResults:10,serviceAccessReviewed:true};
 const x=await searchForTarget262({target:t,plan,config,researchPolicy,mode:'synthetic_fixture',fixtureTransport:{async get(){throw Error('the default provider must not run');}},store:s,
  provider:{id:'fixture_index',run:other}});
 assert.equal(x.provider,'fixture_index');assert.deepEqual(calls,plan.queries.map(q=>q.query));
 const manual=x.candidates.find(c=>c.url.endsWith('/support/manual'))!;
 assert.equal(manual.documentRole,'role_unknown');assert.equal(manual.publisher.recognition,'recognised_publisher');assert.equal(manual.publisher.canonicalSourceType,'manufacturer');
 assert.equal(manual.lead.query,plan.queries[1].query);assert.equal(manual.lead.provider,'fixture_index');
 assert.deepEqual(manual.lead.requirement,{jobId:job.jobId,gapKind:'missing_declaration',criterion:'width_max'});
 const lab=x.candidates.find(c=>c.host==='new-lab.pee263-fixture.test')!;
 assert.equal(lab.publisher.recognition,'unrecognised_domain');assert.equal(lab.attribution,'product_unknown');
 assert.ok(lab.lead.verificationRequired.includes('product_identity'),'unknown identity is carried forward as work to do');
 assert.equal(lab.lead.originality,'unknown');assert.equal(lab.lead.access.pageRetrieval,'not_authorised');
 const live=await searchForTarget262({target:t,plan,config,researchPolicy,mode:'live',store:s,provider:{id:'fixture_index',run:other}});
 assert.equal(live.status,'blocked_live_reads_disabled','a replaceable provider is still behind the research policy');
 s.close();
});

test('scientific claims stay hypotheses until reviewed',()=>{
 const s=store();
 assert.throws(()=>s.addCategoryItem246({categoryId:'air_fryers',section:'mechanisms',statement:'Faster airflow improves surface browning.',knowledgeClass:'reviewed_general_knowledge',
  provenance:'assistant_authored_unreviewed'}),/review_promotion/);
 const id=s.addCategoryItem246({categoryId:'air_fryers',section:'mechanisms',statement:'Faster airflow may improve surface browning.',knowledgeClass:'technical_hypothesis',provenance:'assistant_authored_unreviewed'});
 assert.equal(s.categoryItems246('air_fryers').find(i=>i.itemId===id)?.knowledgeClass,'technical_hypothesis');
 s.close();
});
