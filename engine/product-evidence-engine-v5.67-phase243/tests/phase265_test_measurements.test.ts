import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type SourceInput246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {FACTUAL_CLASS_POLICY249,detectReservations249} from '../src/phase249_retention_policy.js';
import {candidatesFromStore249} from '../src/phase249_decision.js';
import {probeTransientTestContent225} from '../src/phase225_transient_test_probe.js';
import {testLeadsFromHtml265,screenTestLead265,TEST_LEAD_EXTRACTOR265,type TestLeadsInput265} from '../src/phase265_test_measurements.js';

// Phase265: publisher-reported test measurements through the real extraction (Phase245 + Phase225/226/227) and the real
// ingestion (Phase246, Phase249 retention) on temporary private stores. Fixtures are synthetic: fictional hosts and
// products, written for this test (not publisher content).
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee265-'));let n=0;const dbPath=()=>join(dir,`s${++n}.sqlite`);
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const AT='2026-10-16T09:00:00.000Z';const at=(m:number)=>new Date(Date.parse(AT)+m*60000).toISOString();
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const KT={name:'Kettle Co KT5 Kettle',brand:'Kettle Co',model:'KT5',mpn:'KT5'},KX={name:'Kettle Co KX9 Kettle',brand:'Kettle Co',model:'KX9',mpn:'KX9'};
const ld=(p:object)=>`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',...p})}</script>`;
const page=(head:string,body:string)=>`<html><head><title>Fixture</title>${head}</head><body><article>${body}</article></body></html>`;
const prose=(v:number,extra='')=>`<h2>How we tested</h2><p>We tested the KT5 for a week.</p><p>We measured the noise of the KT5 as ${v} dB under 20 °C using a sound meter.</p>${extra}`;
const table=(heads:string[],rows:string[][],intro='<p>We measured both kettles ourselves; our tests used a sound meter.</p>')=>intro+
 `<table><caption>Our test measurements</caption><thead><tr><th scope="col">Model</th>${heads.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>`+
 rows.map(r=>`<tr><th scope="row">${r[0]}</th>${r.slice(1).map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')+'</tbody></table>';
const src=(host:string,t:SourceInput246['sourceType']):SourceInput246=>({sourceId:'src_'+host.replace(/\W/g,'_'),host,sourceType:t,sourceTypeBasis:'operator_asserted'});
function store(storage:StoragePolicy246=CLASS,path=dbPath()){
 const s=new KnowledgeStore246(path,storage);
 /** The operational builder path: Phase245 extraction and the Phase225 probe on the same transient bytes. */
 const ingest=(url:string,html:string,t:SourceInput246['sourceType'],m=0,o:{leads?:TestLeadsInput265|null;robots?:string|null}={})=>{
  const x=extractSpecifications245(html,url);
  return s.ingestObservation246({source:src(new URL(url).host,t),url,sha256:sha(html),bytes:html.length,httpStatus:200,fetchedAt:at(m),runId:'run_265',
   extractorVersion:'phase245@test',extraction:x,categoryHypotheses:['kettles'],reservations:detectReservations249(o.robots??null,html),
   testLeads:o.leads===undefined?testLeadsFromHtml265(html,url,sha(html),x):o.leads});};
 return {s,path,ingest};
}
const LAB='https://lab.pee265-test.test/r/kt5',LAB2='https://bench.pee265-test.test/kt5';

test('1. an explicit publisher-reported measurement survives closing and reopening the store, with provenance and qualifiers',()=>{
 const {s,path,ingest}=store();const html=page(ld(KT),prose(61));
 const r=ingest(LAB,html,'independent_original_test');
 assert.deepEqual({p:r.testMeasurements!.persisted,a:r.testMeasurements!.associated,u:r.testMeasurements!.unresolved},{p:1,a:1,u:0});
 const before=s.testMeasurements265();s.close();
 const s2=new KnowledgeStore246(path,CLASS);const after=s2.testMeasurements265();
 assert.deepEqual(after,before,'identical after reopening');
 const m=after[0];
 assert.equal(m.productId,r.productIds[0]);assert.equal(m.subjectAssociation,'page_main_product_unverified');
 // S86 (2026-10-19): stored units are the quantity knowledge's canonical keys (were the Phase265 table's lowercase spellings); same unit, same value
 assert.deepEqual([m.value,m.unit,m.condition,m.instrument,m.methodCue],[61,'dB','20 °c','sound meter','test_section_with_method_cue']);
 assert.deepEqual([m.dimension,m.dimensionBasis,m.targetScope],['not_established','not_established','not_established'],'a prose figure does not establish what was measured');
 assert.deepEqual([m.reportedBy,m.evidenceRole,m.independence,m.verification,m.market,m.exactVariantVerified],
  ['test_publisher_operator_asserted','test_publisher_declaration_unreviewed','not_established','unreviewed','unknown',false]);
 assert.deepEqual([m.source.url,m.source.sha256,m.extractorVersion],[LAB,sha(html),TEST_LEAD_EXTRACTOR265]);
 assert.match(m.leadId,/^[0-9a-f]{64}$/);assert.match(m.locator.blockSha256,/^[0-9a-f]{64}$/);
 assert.ok(s2.verifyJournal().ok);
 assert.equal((s2.db.prepare("SELECT COUNT(*) AS n FROM events WHERE kind='test_measurements_ingested'").get() as {n:number}).n,1);
 s2.close();
});

test('2. repeating the same ingestion never duplicates; leads first offered later, or under a new extractor, are applied once',()=>{
 const {s,ingest}=store();const html=page(ld(KT),prose(61));
 ingest(LAB,html,'independent_original_test');
 const again=ingest(LAB,html,'independent_original_test',1);
 assert.deepEqual([again.testMeasurements!.persisted,again.testMeasurements!.alreadyStored],[0,1]);
 assert.equal(s.testMeasurements265({includeSuperseded:true}).length,1);
 // The same bytes ingested first without leads (an older builder), then with them: applied once.
 const html2=page(ld(KT),prose(62));
 ingest(LAB2,html2,'independent_original_test',2,{leads:null});assert.equal(s.testMeasurements265({revisionId:'rev_'+sha(LAB2+'|'+sha(html2)).slice(0,24)}).length,0);
 assert.equal(ingest(LAB2,html2,'independent_original_test',3).testMeasurements!.persisted,1);
 assert.equal(ingest(LAB2,html2,'independent_original_test',4).testMeasurements!.persisted,0);
 // A new lead extractor version: this revision's rows are re-derived, not duplicated.
 const x=extractSpecifications245(html2,LAB2);const leads={...testLeadsFromHtml265(html2,LAB2,sha(html2),x),extractorVersion:'pee225-probe.v2-test'};
 ingest(LAB2,html2,'independent_original_test',5,{leads});
 const rows=s.testMeasurements265({includeSuperseded:true}).filter(m=>m.source.url===LAB2);
 assert.deepEqual(rows.map(m=>[m.state,m.extractorVersion]),[['current','pee225-probe.v2-test']]);
});

test('3. a new source revision supersedes with a traceable link; disagreeing publishers are a conflict, agreeing ones a repeated observation',()=>{
 const {s,ingest}=store();
 const r1=ingest(LAB,page(ld(KT),prose(61)),'independent_original_test');
 const r2=ingest(LAB,page(ld(KT),prose(63)),'independent_original_test',1);
 const all=s.testMeasurements265({includeSuperseded:true});
 const old=all.find(m=>m.revisionId===r1.revisionId)!,cur=all.find(m=>m.revisionId===r2.revisionId)!;
 assert.deepEqual([old.state,old.supersededByRevision,old.value],['superseded_by_revision',r2.revisionId,61],'history kept, linked to its successor');
 assert.deepEqual([cur.state,cur.value],['current',63]);
 assert.equal(s.testMeasurements265().filter(m=>m.source.url===LAB).length,1,'only the current revision is current');
 const pid=r1.productIds[0];
 ingest('https://one.pee265-test.test/t',page(ld(KT),table(['Measured noise (dB)'],[['KT5','61']])),'independent_original_test',2);
 ingest('https://two.pee265-test.test/t',page(ld(KT),table(['Measured noise (dB)'],[['KT5','64']])),'independent_original_test',3);
 let c=s.testMeasurementConflicts265(pid);
 assert.equal(c.length,1);assert.equal(c[0].kind,'conflicting_values');assert.deepEqual([...c[0].values].sort(),[61,64]);
 const t=store();const same=page(ld(KT),table(['Measured noise (dB)'],[['KT5','61']]));
 const a=t.ingest('https://three.pee265-test.test/t',same,'independent_original_test',4);t.ingest('https://four.pee265-test.test/t',same,'independent_original_test',5);
 c=t.s.testMeasurementConflicts265(a.productIds[0]);
 assert.deepEqual([c.length,c[0].kind],[1,'repeated_observation'],'equal values from two publishers: repeated, which says nothing about independence');
});

test('4. an ambiguously identified subject is kept without a product and never attributed to another product',()=>{
 const {s,ingest}=store();
 const kt=ingest(LAB,page(ld(KT),'<p>Product page.</p>'),'manufacturer');const ktId=kt.productIds[0];
 // (a) A page declaring two products: no main product, the lead stays unresolved.
 const r=ingest('https://roundup.pee265-test.test/two',page(ld(KT)+ld(KX),'<h2>Our tests</h2><p>We measured the noise at 58 dB using a sound meter on the KT5 and KX9.</p>'),'independent_original_test',1);
 assert.deepEqual([r.testMeasurements!.persisted,r.testMeasurements!.unresolved,r.testMeasurements!.associated],[1,1,0]);
 const m=s.testMeasurements265({revisionId:r.revisionId})[0];
 assert.deepEqual([m.productId,m.subjectAssociation,m.subjectAssignment],[null,'subject_unresolved','not_identified']);
 assert.equal(s.testMeasurements265({productId:ktId}).length,0,'not attributed to the similarly named product already in the store');
 assert.ok(s.gaps246({refId:r.revisionId}).some(g=>g.kind==='test_measurement_subject_unresolved'));
 // (b) A probe that saw two candidate models: unresolved even though the page has a main product.
 const html=page(ld(KT),'<h2>How we tested</h2><p>We measured the noise of the kettle at 57 dB using a sound meter.</p>');const url='https://multi.pee265-test.test/k';
 const leads={extractorVersion:TEST_LEAD_EXTRACTOR265,probe:probeTransientTestContent225(html,url,{documentSha256:sha(html),
  productLeads:[{name:KT.name,model:'KT5',sku:null},{name:KX.name,model:'KX9',sku:null}]})};
 const r2=ingest(url,html,'independent_original_test',2,{leads});
 assert.deepEqual([r2.testMeasurements!.unresolved,s.testMeasurements265({revisionId:r2.revisionId})[0].subjectAssignment],[1,'multiple_models_unresolved']);
 // (c) A table row naming another model than the page product yields no lead at all.
 const r3=ingest('https://rows.pee265-test.test/k',page(ld(KT),table(['Measured noise (dB)'],[['KX9','55']])),'independent_original_test',3);
 assert.equal(r3.testMeasurements!.offered,0);
 assert.equal(s.testMeasurements265({productId:ktId}).length,0);
});

test('5. manufacturer test results stay manufacturer-reported; a claim of independence establishes nothing',()=>{
 const {s,ingest}=store();
 const r=ingest('https://maker.pee265-test.test/kt5',page(ld(KT),'<h2>Test results</h2><p>In our lab we measured the noise of the KT5 at 59 dB using a sound meter.</p>'),'manufacturer');
 const m=s.testMeasurements265({revisionId:r.revisionId})[0];
 assert.deepEqual([m.reportedBy,m.evidenceRole,m.independence,m.verification],['manufacturer','manufacturer_declaration','not_established','unreviewed']);
 const e=ingest('https://mag.pee265-test.test/kt5',page(ld(KT),'<h2>How we tested</h2><p>As an independent lab we measured the noise of the KT5 at 60 dB using a sound meter.</p>'),'editorial',1);
 const me=s.testMeasurements265({revisionId:e.revisionId})[0];
 assert.deepEqual([me.reportedBy,me.evidenceRole,me.independence],['other_publisher','editorial_declaration','not_established'],'self-described independence is not established');
 for(const sql of ["UPDATE test_measurements265 SET independence='established'","UPDATE test_measurements265 SET reported_by='independent_tester'",
  "UPDATE test_measurements265 SET verification='reviewed'","UPDATE test_measurements265 SET independent_test_evidence=1"])assert.throws(()=>s.db.exec(sql),/CHECK constraint/);
});

test('6. ambiguous units or scope are represented as unresolved or withheld, never converted or guessed',()=>{
 const {s,ingest}=store();
 const r=ingest('https://units.pee265-test.test/k',page(ld(KT),'<p>We measured the lid temperature at 80 % using a timer.</p>'+
  table(['Measured time (W)','Measured mass (g)'],[['KT5','1500','1200']],'<p>We measured the kettle ourselves; our tests used a digital scale.</p>')),'independent_original_test');
 assert.deepEqual(r.testMeasurements!.rejected,{unit_dimension_mismatch:1},'a power unit under a time header is withheld');
 const rows=s.testMeasurements265({revisionId:r.revisionId}).map(m=>[m.value,m.unit,m.dimension,m.dimensionBasis]).sort();
 assert.deepEqual(rows,[[1200,'g','mass','publisher_table_header'],[80,'%','not_established','not_established']]);
 // Tampered leads are refused, never stored with their claim.
 const html=page(ld(KT),prose(61));const x=extractSpecifications245(html,LAB);const lead=testLeadsFromHtml265(html,LAB,sha(html),x).probe.candidates[0];
 assert.deepEqual(screenTestLead265({...lead,unit:'furlongs'},{url:LAB,sha256:sha(html)}),{ok:false,reason:'unit_not_recognised'});
 assert.deepEqual(screenTestLead265({...lead,rankingAuthorized:true as never},{url:LAB,sha256:sha(html)}),{ok:false,reason:'lead_claims_review_or_admission'});
 assert.deepEqual(screenTestLead265({...lead,reviewerIndependent:true as never},{url:LAB,sha256:sha(html)}),{ok:false,reason:'lead_claims_review_or_admission'});
 assert.deepEqual(screenTestLead265(lead,{url:LAB2,sha256:sha(html)}),{ok:false,reason:'lead_not_from_this_revision'});
 assert.deepEqual(screenTestLead265({...lead,publisherDeclaredDimension:'mass'},{url:LAB,sha256:sha(html)}),{ok:false,reason:'unit_dimension_mismatch'});
});

test('7. machine-readable reservations, default-deny storage and the per-host cap withhold values; pending-rights values expire',()=>{
 const {s,ingest}=store();
 const r=ingest(LAB,page(ld(KT)+'<meta name="tdm-reservation" content="1">',prose(61)),'independent_original_test');
 assert.deepEqual([r.testMeasurements!.persisted,r.testMeasurements!.withheldRights,r.testMeasurements!.withheldReason],[0,1,'machine_readable_reservation']);
 const ai=ingest(LAB2,page(ld(KT),prose(62)),'independent_original_test',1,{robots:'User-agent: *\nContent-Signal: ai-input=no\nAllow: /\n'});
 assert.equal(ai.testMeasurements!.withheldReason,'machine_readable_reservation');
 assert.equal(s.testMeasurements265({includeSuperseded:true}).length,0);
 assert.ok(s.gaps246({refId:r.revisionId}).some(g=>g.kind==='test_measurements_not_retained_rights'));
 const deny=store(DEFAULT_STORAGE_POLICY246);const d=deny.ingest(LAB,page(ld(KT),prose(61)),'independent_original_test');
 assert.deepEqual([d.retention,d.testMeasurements!.withheldRights,d.testMeasurements!.withheldReason],['metadata_only',1,'metadata_only']);
 assert.equal(deny.s.testMeasurements265({includeSuperseded:true}).length,0);
 // Per-host cap: test-measurement products count towards the Phase249 cap like declaration products.
 const capped:StoragePolicy246={...CLASS,classPolicy:{...FACTUAL_CLASS_POLICY249,classes:{...FACTUAL_CLASS_POLICY249.classes,
  independent_original_test:{...FACTUAL_CLASS_POLICY249.classes.independent_original_test,maxProductsPerHost:1}}}};
 const c=store(capped);
 assert.equal(c.ingest('https://cap.pee265-test.test/kt5',page(ld(KT),prose(61)),'independent_original_test').testMeasurements!.persisted,1);
 const second=c.ingest('https://cap.pee265-test.test/kx9',page(ld(KX),'<h2>How we tested</h2><p>We measured the noise of the KX9 as 66 dB using a sound meter.</p>'),'independent_original_test',1);
 assert.deepEqual([second.testMeasurements!.persisted,second.testMeasurements!.withheldReason],[0,'insubstantial_part_cap_reached']);
 // Local pending-rights values expire with their declarations.
 const pend=store({...DEFAULT_STORAGE_POLICY246,localPendingRightsCache:{enabled:true,expiresAfterDays:1}});
 const p=pend.ingest(LAB,page(ld(KT),prose(61)),'independent_original_test');
 assert.deepEqual([p.retention,p.testMeasurements!.persisted],['local_pending_rights_review',1]);
 assert.equal(pend.s.purgeExpired246(at(3*1440)),1);
 const e=pend.s.testMeasurements265({includeSuperseded:true})[0];assert.deepEqual([e.state,e.value],['expired_pending_rights',null]);
 assert.equal(pend.s.export246().tables.test_measurements265.length,0,'pending-rights rows are not exported by default');
});

test('8. persisted unreviewed test measurements stay ineligible for scientific ranking and never enter the decision layer',()=>{
 const {s,ingest}=store();const r=ingest(LAB,page(ld(KT),prose(61)),'independent_original_test');
 const m=s.testMeasurements265()[0];
 assert.deepEqual([m.scientificEvidenceAdmitted,m.independentTestEvidence,m.rankingAuthorized],[false,false,false]);
 for(const col of ['ranking_authorized','scientific_evidence_admitted','exact_variant_verified'])
  assert.throws(()=>s.db.exec(`UPDATE test_measurements265 SET ${col}=1`),/CHECK constraint/);
 const cands=candidatesFromStore249(s,'kettles');
 assert.equal(cands.find(c=>c.productId===r.productIds[0])?.declarations.length??0,0,'a test measurement is not a declaration the decision layer reads');
 assert.equal(s.declarations246(r.productIds[0]).length,0);
});

test('9. no page body, sentence or passage reaches the knowledge store',()=>{
 const {s,ingest}=store();
 const htmls=[page(ld(KT),prose(61)),page(ld(KT),table(['Measured mass (g)','Measured noise (dB)'],[['KT5','1200','61']]))];
 htmls.forEach((h,i)=>ingest(`https://body${i}.pee265-test.test/k`,h,'independent_original_test',i));
 assert.ok(s.testMeasurements265().length>=3);
 const dump=(s.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as {name:string}[]).map(t=>JSON.stringify(s.db.prepare(`SELECT * FROM "${t.name}"`).all())).join('\n');
 for(const h of htmls)for(const p of [...h.matchAll(/<p>([^<]+)<\/p>/g)].map(x=>x[1]))
  for(let i=0;i+24<=p.length;i+=4)assert.ok(!dump.includes(p.slice(i,i+24)),`fragment stored: ${p.slice(i,i+24)}`);
 assert.ok(!/<html|<table|<p>/i.test(dump));
});
