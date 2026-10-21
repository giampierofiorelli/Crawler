import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {KnowledgeStore246,STORE_SCHEMA_VERSION246,type SourceInput246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {lookupScreening193,type ScreeningDecision193} from '../src/phase193_screening_memory.js';
import {selectSourcesForJob258,type ContributionFeedback258} from '../src/phase258_source_memory.js';
import type {WebSourcePolicy} from '../src/web_evidence_acquisition.js';
import {recordSourceMemory260,checkSourceMemory260,rebuildSourceMemory260,recoverSourceMemory260,replaySourceMemory260,descriptorWithMemory260,
 screeningLedger260,sourceStateLedger260,contributions260,sourceMemory260,type Input260,type ReviewVerifier260} from '../src/phase260_source_memory_store.js';

// Phase260: the full persistence cycle on temporary private stores with a few controlled records. The verifier below is
// a test fixture standing in for the operator's environment; production code has no default verifier.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee260-'));let n=0;const dbPath=()=>join(dir,`store${++n}.sqlite`);
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const AT='2026-10-16T09:00:00.000Z';const at=(m:number)=>new Date(Date.parse(AT)+m*60000).toISOString();
const verify:ReviewVerifier260=c=>c.reviewerId==='operator_a'&&c.reviewId.startsWith('rv_');
const approved=(host:string):WebSourcePolicy=>({sourceId:'pol_'+host.replace(/\W/g,'_'),host,basis:'written_permission',rightsDocumentId:'rights_'+host,
 rightsDocumentUrl:'https://rights.pee-tests.org/'+host,reviewedBy:'rights_reviewer',reviewedAt:'2026-10-01T00:00:00Z',validUntil:'2027-10-01T00:00:00Z',
 permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage'],robots:'allowed',robotsCheckedAt:'2026-10-16T06:00:00Z',
 websiteTerms:'reviewed_permitted',termsCheckedAt:'2026-10-10T00:00:00Z',commercialUseReviewed:true});
const src=(host:string,t:SourceInput246['sourceType']):SourceInput246=>({sourceId:'src_'+host.replace(/\W/g,'_'),host,sourceType:t,sourceTypeBasis:'operator_asserted',policy:approved(host)});
const page=(name:string,mpn:string,w:number)=>`<!doctype html><html><head><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name,
 brand:{'@type':'Brand',name:'Vortex'},mpn,additionalProperty:[{'@type':'PropertyValue',name:'Power',value:w,unitText:'W'}]})}</script></head><body><h1>${name}</h1></body></html>`;
function fixture(path=dbPath()){
 const s=new KnowledgeStore246(path);
 const ingest=(url:string,html:string,source:SourceInput246,t=AT)=>s.ingestObservation246({source,url,sha256:sha(html),bytes:html.length,httpStatus:200,fetchedAt:t,
  runId:'run_260',extractorVersion:'phase245@test',extraction:extractSpecifications245(html,url),categoryHypotheses:['air_fryers']});
 const a=ingest('https://maker.example/p/vx100',page('Vortex VX100 Air Fryer','VX100',1500),src('maker.example','manufacturer'));
 const b=ingest('https://shop.example/p/vx200',page('Vortex VX200 Air Fryer','VX200',1700),src('shop.example','retailer'));
 return {s,path,ingest,revA:a.revisionId,prodA:a.productIds[0],revB:b.revisionId,prodB:b.productIds[0],srcA:'src_maker_example',srcB:'src_shop_example'};
}
type F=ReturnType<typeof fixture>;
const claim=(id='rv_1',m=1)=>({reviewId:id,reviewerId:'operator_a',reviewedAt:at(m)});
const ann=(f:F,o:Partial<Extract<Input260,{kind:'source_annotation_recorded'}>>={}):Input260=>({kind:'source_annotation_recorded',recordId:'ann_lang_1',
 sourceId:f.srcA,revisionId:f.revA,productId:f.prodA,criterion:null,field:'language',value:'en-GB',basis:'operator_annotation',review:claim(),supersedes:null,at:at(1),...o});
const canonical=(s:KnowledgeStore246)=>sha(['sources','revisions','products','product_sources','declarations','product_keys','revision_properties','host_access','research_gaps','category_items']
 .map(t=>JSON.stringify(s.db.prepare(`SELECT * FROM ${t} ORDER BY 1,2`).all())).join('|'));
const feedback=(f:F,o:Partial<ContributionFeedback258>={}):ContributionFeedback258=>({schema:'pee258.contribution-feedback.v1',feedbackId:'fb_1',sourceId:f.srcA,
 jobId:'research_'+'a'.repeat(32),scope:{categoryId:'air_fryers',criterion:'power_min',productId:f.prodA},outcome:'confirmed_specification',reviewId:'rv_fb',at:at(5),
 reliability:'not_assessed',evidenceQuality:{originality:'unknown',methodReported:false},relevance:'exact_product_and_criterion',cost:{sourceReads:1,minutes:4},
 eligibility:{rights:'unreviewed',robots:'unknown'},...o});
const PAGE_A=sha(page('Vortex VX100 Air Fryer','VX100',1500));
const screen=(f:F,o:Partial<ScreeningDecision193>={},hash=PAGE_A):ScreeningDecision193=>({
 source:{sourceId:f.srcA,url:'https://maker.example/p/vx100',contentHash:hash,contentBasis:'publisher_bytes',policyVersion:'pee260-test',market:'uk',category:'air_fryers',
  variantId:'page',field:null,observedAt:'2026-10-16T09:00:00Z',classificationRevision:'phase246.v1'},
 scope:'document',action:'provisional_specification_only',reason:'manufacturer_or_retailer_spec_only',reviewerId:'operator_a',reviewTicket:'rv_screen_1',
 reviewedAt:'2026-10-16T09:10:00Z',reviewBasis:'human_source_screen',evidenceNote:'manufacturer page: declared specifications only, no test',originalTestEventId:null,
 retainedCandidateVariantIds:[],...o});

test('1-3. a permitted annotation persists, survives close and reopen, and is recovered without a rebuild',()=>{
 const f=fixture();assert.equal(f.s.schemaVersion(),STORE_SCHEMA_VERSION246);assert.equal(STORE_SCHEMA_VERSION246,14,'v5 (Phase265) test_measurements265, v6 (Phase268) condition codes, v7 (Phase270) qualitative codes, v8 (Phase271) comparative results, v9 (S78) relation assessments, v10 (S78) knowledge statements, v11 (S98) scientific readings, v12 (S99) observation identity and meaning of each reading, v13 (S100) how each meaning was decided, v14 (N1) relation claims of teaching-table rows');
 assert.equal(descriptorWithMemory260(f.s,f.revA,f.prodA).descriptor.language,'und');
 const r=recordSourceMemory260(f.s,ann(f));assert.equal(r.status,'recorded');assert.equal(r.basis,'operator_annotation','no verifier: an operator claim, not a verified fact');
 f.s.close();
 const s=new KnowledgeStore246(f.path);
 assert.deepEqual(recoverSourceMemory260(s),{recovered:false,records:1});
 const d=descriptorWithMemory260(s,f.revA,f.prodA);
 assert.equal(d.descriptor.language,'en-GB');assert.ok(d.descriptor.limitations.includes('operator_annotation_unverified'));
 assert.equal(d.descriptor.publisherCountry,'unknown','what was not annotated stays unknown');
 assert.equal(d.descriptor.retained?.revisionId,f.revA,'the retained block is still derived from canonical tables');
 assert.equal(d.accessAuthorized,false);assert.equal(d.evidenceAdmitted,false);
 assert.equal(descriptorWithMemory260(s,f.revB,f.prodB).descriptor.language,'und','another source is untouched');
 s.close();
});

test('4. supersession is explicit and keeps history; a retraction returns the field to unknown',()=>{
 const f=fixture();recordSourceMemory260(f.s,ann(f));
 assert.throws(()=>recordSourceMemory260(f.s,ann(f,{recordId:'ann_lang_2',value:'en'})),/supersede it explicitly/);
 recordSourceMemory260(f.s,ann(f,{recordId:'ann_lang_2',value:'en',supersedes:'ann_lang_1',at:at(2)}));
 assert.equal(descriptorWithMemory260(f.s,f.revA,f.prodA).descriptor.language,'en');
 assert.throws(()=>recordSourceMemory260(f.s,ann(f,{recordId:'ann_lang_3',value:'fr',supersedes:'ann_lang_1',at:at(3)})),/active annotation/,'a superseded record cannot be superseded again');
 recordSourceMemory260(f.s,ann(f,{recordId:'ann_lang_3',value:null,supersedes:'ann_lang_2',at:at(3)}));
 assert.equal(descriptorWithMemory260(f.s,f.revA,f.prodA).descriptor.language,'und');
 const m=sourceMemory260(f.s,f.srcA);
 assert.deepEqual(m.history.map(h=>[h.record_id,h.superseded_by]),[['ann_lang_1','ann_lang_2'],['ann_lang_2','ann_lang_3'],['ann_lang_3',null]]);
 assert.equal(m.active.length,0);
 assert.throws(()=>recordSourceMemory260(f.s,ann(f,{recordId:'ann_x',value:null})),/retraction must supersede/);
 f.s.close();
});

test('5. the projection is rebuilt deterministically from the journal and cannot be written directly',()=>{
 const f=fixture();recordSourceMemory260(f.s,ann(f));
 recordSourceMemory260(f.s,ann(f,{recordId:'ann_country',field:'publisherCountry',value:'GB',at:at(2)}));
 recordSourceMemory260(f.s,{kind:'source_state_changed',recordId:'st_1',event:{sourceId:f.srcB,state:'temporarily_unavailable',cause:{kind:'http_status',httpStatus:503},at:at(3)},review:null});
 const table=JSON.stringify(f.s.db.prepare('SELECT * FROM source_memory260 ORDER BY event_seq').all());
 const r1=rebuildSourceMemory260(f.s),r2=rebuildSourceMemory260(f.s);
 assert.equal(r1.digest,r2.digest);assert.equal(r1.records,3);
 assert.equal(JSON.stringify(f.s.db.prepare('SELECT * FROM source_memory260 ORDER BY event_seq').all()),table,'rebuild reproduces the incremental projection exactly');
 assert.throws(()=>f.s.db.prepare('DELETE FROM source_memory260').run(),/read_only_projection/);
 assert.throws(()=>f.s.db.prepare("UPDATE source_memory260 SET basis='verifier_accepted'").run(),/read_only_projection/);
 assert.throws(()=>f.s.db.exec("INSERT INTO source_memory260(record_id,kind,event_seq,source_id,value_json,basis,recorded_at,payload_sha256) VALUES ('x','k',1,'src_maker_example','1','operator_annotation','t','h')"),/read_only_projection/);
 assert.throws(()=>f.s.db.exec('DELETE FROM events'),/append_only_events/);
 assert.equal(checkSourceMemory260(f.s).projectionConsistent,true);
 f.s.close();
});

test('6. malformed, cross-product, unauthorised and uninformative claims are refused',()=>{
 const f=fixture();const before=f.s.verifyJournal().events;
 const refuse=(x:Input260,re:RegExp,opts={})=>assert.throws(()=>recordSourceMemory260(f.s,x,opts),re);
 refuse(ann(f,{field:'sourceType' as never,value:'retailer'}),/field/);
 refuse(ann(f,{value:'english'}),/BCP 47/);
 refuse(ann(f,{value:'und'}),/no information/);
 refuse(ann(f,{field:'publisherCountry',value:'unknown'}),/no information/);
 refuse(ann(f,{field:'roles',value:['role_unknown']}),/no information/);
 refuse(ann(f,{productId:f.prodB}),/cross_product/);
 refuse(ann(f,{sourceId:f.srcB}),/another source/);
 refuse(ann(f,{criterion:'not_a_criterion'}),/criterion/);
 refuse(ann(f,{review:{reviewId:'rv_1',reviewerId:'',reviewedAt:at(1)}}),/review_claim/);
 refuse(ann(f,{basis:'independently_verified'}),/review_not_verified/);
 refuse(ann(f,{basis:'independently_verified'}),/review_not_verified/,{verify:()=>false});
 refuse(ann(f,{basis:'independently_verified',review:claim('fake_review')}),/review_not_verified/,{verify});
 // Rights are never self-granted: a permissive access annotation needs the verifier.
 refuse(ann(f,{field:'access',value:{rights:'reviewed_metadata_only',robots:'allowed'}}),/permissive access/);
 // Epistemic consistency is the Phase258 validator's: a measurement role needs a measurement statement.
 refuse(ann(f,{field:'roles',value:['independent_measurement']}),/instrumental measurement/);
 refuse({kind:'source_contribution_verified',feedback:feedback(f,{scope:{categoryId:'air_fryers',criterion:'power_min',productId:f.prodB}}),review:claim('rv_fb'),supersedes:null},/cross_product/,{verify});
 refuse({kind:'source_contribution_verified',feedback:{...feedback(f),score:5} as never,review:claim('rv_fb'),supersedes:null},/no scores/,{verify});
 refuse({kind:'source_contribution_verified',feedback:feedback(f),review:claim('rv_fb'),supersedes:null},/review_not_verified/);
 refuse({kind:'screening_decision_recorded',recordId:'sc_1',revisionId:f.revA,decision:screen(f,{},'b'.repeat(64))},/revision hash/,{verify});
 refuse({kind:'screening_decision_recorded',recordId:'sc_1',revisionId:f.revA,decision:screen(f,{source:{...screen(f).source,url:'https://maker.example/p/other'}})},/another URL/,{verify});
 refuse({kind:'screening_decision_recorded',recordId:'sc_1',revisionId:f.revA,decision:screen(f,{scope:'field',source:{...screen(f).source,variantId:f.prodB,field:'power_min'}})},/cross_product/,{verify});
 refuse({kind:'screening_decision_recorded',recordId:'sc_1',revisionId:f.revA,decision:screen(f)},/review_not_verified/);
 refuse({kind:'source_state_changed',recordId:'st_x',event:{sourceId:f.srcA,state:'retired',cause:{kind:'http_status',httpStatus:404},at:at(2)},review:null},/only an operator can retire/);
 refuse({kind:'source_state_changed',recordId:'st_x',event:{sourceId:f.srcA,state:'temporarily_unavailable',cause:{kind:'http_status',httpStatus:403},at:at(2)},review:null},/recordAccess246/);
 refuse({kind:'source_state_changed',recordId:'st_x',event:{sourceId:f.srcA,state:'useful',cause:{kind:'feedback',feedbackId:'fb_none'},at:at(2)},review:null},/verified feedback/);
 refuse({kind:'source_state_changed',recordId:'st_x',event:{sourceId:f.srcA,state:'retired',cause:{kind:'operator_retirement',reviewId:'rv_ret'},at:at(2)},review:claim('rv_ret')},/review_not_verified/);
 refuse({kind:'source_state_changed',recordId:'st_x',event:{sourceId:'src_unknown',state:'discovered',cause:{kind:'discovery',reviewId:null},at:at(2)},review:null},/unknown source/);
 assert.equal(f.s.verifyJournal().events,before,'nothing refused reached the journal');
 assert.equal(checkSourceMemory260(f.s).records,0);
 f.s.close();
});

test('7. tampered history is detected; replay, recording and recovery refuse it',()=>{
 const f=fixture();recordSourceMemory260(f.s,ann(f));
 f.s.db.exec('DROP TRIGGER events_no_update');
 f.s.db.prepare("UPDATE events SET payload_json=replace(payload_json,'en-GB','fr') WHERE kind='source_annotation_recorded'").run();
 assert.equal(f.s.verifyJournal().ok,false);
 assert.equal(checkSourceMemory260(f.s).journalOk,false);
 assert.throws(()=>replaySourceMemory260(f.s),/journal_tampered/);
 assert.throws(()=>recoverSourceMemory260(f.s),/journal_tampered/);
 assert.throws(()=>rebuildSourceMemory260(f.s),/journal_tampered/);
 assert.throws(()=>recordSourceMemory260(f.s,ann(f,{recordId:'ann_2',field:'publisherCountry',value:'GB'})),/journal_tampered/);
 f.s.close();
});

test('8. migration v3 -> v4 preserves every earlier record and the journal',()=>{
 const f=fixture();const path=f.path;
 // A Phase246 v3 store: the same records without the v4 objects.
 f.s.db.exec('DROP TABLE source_memory260; DROP TABLE test_measurements265; DROP TABLE qualitative_observations270; DROP TABLE comparative_results271; DROP TABLE relation_assessments; DROP TABLE knowledge_statements; DROP TABLE scientific_readings98; DROP TABLE relation_claims_n1; PRAGMA user_version=3;');
 const canon3=canonical(f.s),events3=f.s.verifyJournal();assert.ok(events3.ok);f.s.close();
 const s=new KnowledgeStore246(path);
 assert.equal(s.schemaVersion(),STORE_SCHEMA_VERSION246);assert.equal(canonical(s),canon3,'canonical tables unchanged by the migration');
 assert.deepEqual(s.verifyJournal(),events3,'the migration appends nothing to the journal');
 assert.deepEqual(checkSourceMemory260(s),{journalOk:true,projectionConsistent:true,records:0,head:'0:0'});
 s.close();const s2=new KnowledgeStore246(path);assert.equal(s2.schemaVersion(),STORE_SCHEMA_VERSION246,'reopening is a no-op');s2.db.exec(`PRAGMA user_version=${STORE_SCHEMA_VERSION246+1}`);s2.close();
 assert.throws(()=>new KnowledgeStore246(path),/246_store_newer_than_software/);
});

test('9. Phase193 screening scope, revision and supersession rules hold through the journal',()=>{
 const f=fixture();
 const r=recordSourceMemory260(f.s,{kind:'screening_decision_recorded',recordId:'sc_1',revisionId:f.revA,decision:screen(f)},{verify});
 assert.equal(r.basis,'verifier_accepted');
 f.s.close();const s=new KnowledgeStore246(f.path);
 const ledger=screeningLedger260(s);const same=screen(f).source;
 assert.equal(lookupScreening193(ledger,same,'document').verdict,'reuse_screening_decision');
 // A new revision of the same URL, another market or another policy needs a new screen: nothing is inherited.
 assert.equal(lookupScreening193(ledger,{...same,contentHash:'c'.repeat(64)},'document').verdict,'screen_required_content_revision');
 assert.equal(lookupScreening193(ledger,{...same,market:'us'},'document').verdict,'screen_required_scope_revision');
 assert.equal(lookupScreening193(ledger,{...same,policyVersion:'other'},'document').verdict,'screen_required_policy_revision');
 // An annotated trial is an unverified claim that never enables reuse; it supersedes per Phase193's own key.
 const t=recordSourceMemory260(s,{kind:'screening_decision_recorded',recordId:'sc_2',revisionId:f.revA,decision:screen(f,{reviewBasis:'annotated_research_trial',reviewedAt:'2026-10-16T09:20:00Z'})});
 assert.equal(t.basis,'unverified_claim');
 assert.equal(sourceMemory260(s,f.srcA).history.find(h=>h.record_id==='sc_2')?.supersedes,'sc_1');
 assert.equal(lookupScreening193(screeningLedger260(s),same,'document').verdict,'screen_required_unverified_revision');
 // Phase193 order rule: a decision older than the one it would supersede is refused.
 assert.throws(()=>recordSourceMemory260(s,{kind:'screening_decision_recorded',recordId:'sc_3',revisionId:f.revA,decision:screen(f,{reviewedAt:'2026-10-16T09:15:00Z'})},{verify}),/invalid193_order/);
 s.close();
});

test('10. rights, access, ranking and evidence gates are unchanged by any memory record',()=>{
 const f=fixture();const c0=canonical(f.s);const suspended0=f.s.hostSuspended246('maker.example',at(1));
 recordSourceMemory260(f.s,ann(f,{recordId:'acc_1',field:'access',value:{rights:'reviewed_metadata_only',robots:'allowed'},basis:'independently_verified',review:claim('rv_acc')}),{verify});
 recordSourceMemory260(f.s,ann(f,{recordId:'kinds_1',field:'statementKinds',value:['instrumental_measurement'],at:at(2)}));
 recordSourceMemory260(f.s,ann(f,{recordId:'roles_1',field:'roles',value:['independent_measurement'],at:at(3)}));
 recordSourceMemory260(f.s,{kind:'source_contribution_verified',feedback:feedback(f),review:claim('rv_fb'),supersedes:null},{verify});
 recordSourceMemory260(f.s,{kind:'source_state_changed',recordId:'st_u',event:{sourceId:f.srcA,state:'useful',cause:{kind:'feedback',feedbackId:'fb_1'},at:at(6)},review:null});
 recordSourceMemory260(f.s,{kind:'screening_decision_recorded',recordId:'sc_1',revisionId:f.revA,decision:screen(f)},{verify});
 assert.equal(canonical(f.s),c0,'no canonical row changed: sources, policies, retention, declarations, identities, host access');
 assert.equal(f.s.hostSuspended246('maker.example',at(1)),suspended0);
 const flags=f.s.db.prepare('SELECT SUM(evidence_admitted) e,SUM(access_authorized) a,SUM(ranking_authorized) r FROM source_memory260').get() as Record<string,number>;
 assert.deepEqual({...flags},{e:0,a:0,r:0});
 assert.throws(()=>f.s.db.exec("INSERT OR REPLACE INTO store_meta VALUES ('source_memory260_writer','1'); UPDATE source_memory260 SET evidence_admitted=1"),/CHECK constraint/);
 f.s.db.exec("DELETE FROM store_meta WHERE k='source_memory260_writer'");
 const decls=f.s.declarations246(f.prodA);assert.ok(decls.length>0&&decls.every(d=>d.state==='extracted_unverified'),'declarations stay unverified declarations');
 const d=descriptorWithMemory260(f.s,f.revA,f.prodA);
 assert.deepEqual(d.descriptor.roles,['manufacturer_specification','independent_measurement'],'roles add to the canonical source type, never replace it');
 assert.equal(d.accessAuthorized,false);assert.equal(sourceMemory260(f.s,f.srcA).rankingAuthorized,false);
 // The memory feeds the existing dry-run selection, which still fetches nothing and admits nothing.
 const sel=selectSourcesForJob258({job:{productId:f.prodA,criterion:'power_min',gapKind:'missing_test'},descriptors:[d.descriptor],feedback:contributions260(f.s),states:sourceStateLedger260(f.s),maxSources:2});
 assert.equal(sel.fetches,0);assert.equal(sel.evidenceAdmitted,false);assert.equal(sel.rankingAuthorized,false);
 f.s.close();
});

test('a changed source voids earlier annotations; a move inherits nothing; 404 and 503 are temporary',()=>{
 const f=fixture();recordSourceMemory260(f.s,ann(f));
 recordSourceMemory260(f.s,{kind:'source_state_changed',recordId:'st_404',event:{sourceId:f.srcA,state:'temporarily_unavailable',cause:{kind:'http_status',httpStatus:404},at:at(2)},review:null});
 assert.equal(sourceMemory260(f.s,f.srcA).state,'temporarily_unavailable');
 assert.equal(descriptorWithMemory260(f.s,f.revA,f.prodA).descriptor.language,'en-GB','a temporary failure keeps what is known');
 recordSourceMemory260(f.s,{kind:'source_state_changed',recordId:'st_chg',event:{sourceId:f.srcA,state:'changed',cause:{kind:'ownership_change',reviewId:null},at:at(3)},review:null});
 const d=descriptorWithMemory260(f.s,f.revA,f.prodA);
 assert.equal(d.descriptor.language,'und','a change voids earlier annotations');assert.ok(d.descriptor.limitations.includes('source_changed_re_review_required'));
 assert.equal(sourceMemory260(f.s,f.srcA).history.length,3,'history is kept');
 recordSourceMemory260(f.s,{kind:'source_state_changed',recordId:'st_mv',event:{sourceId:f.srcB,state:'moved',cause:{kind:'redirect',newUrl:'https://shop2.example/p/vx200',newSourceId:'src_shop2_example'},at:at(4)},review:null});
 assert.equal(sourceStateLedger260(f.s).events.filter(e=>e.sourceId==='src_shop2_example').length,0,'the successor starts with no state, review or feedback');
 // A new revision of a URL is a new record: annotations of the old revision do not follow it.
 const r2=f.ingest('https://maker.example/p/vx100',page('Vortex VX100 Air Fryer','VX100',1550),src('maker.example','manufacturer'),at(10));
 assert.notEqual(r2.revisionId,f.revA);assert.equal(descriptorWithMemory260(f.s,r2.revisionId,f.prodA).annotations.length,0);
 f.s.close();
});

test('interrupted writes leave nothing behind; retries are idempotent; recovery rebuilds after import or an outside append',()=>{
 const f=fixture();const e0=f.s.verifyJournal().events;
 assert.throws(()=>recordSourceMemory260(f.s,ann(f),{_faultAfterJournal:true}),/test_fault_after_journal/);
 assert.equal(f.s.verifyJournal().events,e0,'the journal event rolled back with the projection');
 assert.equal(checkSourceMemory260(f.s).projectionConsistent,true);
 assert.equal(recordSourceMemory260(f.s,ann(f)).status,'recorded');
 assert.equal(recordSourceMemory260(f.s,ann(f)).status,'already_recorded','an identical retry is a no-op');
 assert.equal(f.s.verifyJournal().events,e0+1);
 assert.throws(()=>recordSourceMemory260(f.s,ann(f,{value:'en'})),/supersede it explicitly|record_id_conflict/);
 const st:Input260={kind:'source_state_changed',recordId:'st_1',event:{sourceId:f.srcB,state:'temporarily_unavailable',cause:{kind:'http_status',httpStatus:503},at:at(2)},review:null};
 recordSourceMemory260(f.s,st);assert.equal(recordSourceMemory260(f.s,st).status,'already_recorded');
 const digest=rebuildSourceMemory260(f.s).digest;
 // A memory event appended outside this module (e.g. by an interrupted older process) is picked up by recovery.
 f.s.event('source_state_changed',{schema:'pee260.source-memory.v1',recordId:'st_2',event:{sourceId:f.srcB,state:'temporarily_unavailable',cause:{kind:'http_status',httpStatus:502},at:at(3)},
  basis:'unverified_claim',review:null,supersedes:'st_1',at:at(3)},at(3));
 assert.equal(checkSourceMemory260(f.s).projectionConsistent,false);
 assert.deepEqual(recoverSourceMemory260(f.s),{recovered:true,records:3});assert.deepEqual(recoverSourceMemory260(f.s),{recovered:false,records:3});
 // An export carries the journal, not the derived projection; recovery rebuilds it identically.
 const exp=join(dir,'export260.json');f.s.writeExport246(exp,{includePendingRights:true});
 const expected=rebuildSourceMemory260(f.s).digest;assert.notEqual(expected,digest);
 const imported=KnowledgeStore246.import246(exp,dbPath());
 assert.equal(checkSourceMemory260(imported).records,3);assert.deepEqual(recoverSourceMemory260(imported),{recovered:true,records:3});
 assert.equal(rebuildSourceMemory260(imported).digest,expected);
 imported.close();f.s.close();
});

test('two connections to one store cannot both supersede the same record; the projection stays replayable',()=>{
 const f=fixture();recordSourceMemory260(f.s,ann(f));
 const other=new KnowledgeStore246(f.path);
 recordSourceMemory260(other,ann(f,{recordId:'ann_lang_2',value:'en',supersedes:'ann_lang_1',at:at(2)}));
 assert.throws(()=>recordSourceMemory260(f.s,ann(f,{recordId:'ann_lang_3',value:'fr',supersedes:'ann_lang_1',at:at(3)})),/supersedes must name the active annotation/);
 assert.equal(checkSourceMemory260(f.s).projectionConsistent,true);assert.equal(checkSourceMemory260(other).projectionConsistent,true);
 assert.equal(descriptorWithMemory260(f.s,f.revA,f.prodA).descriptor.language,'en');
 other.close();f.s.close();
});

test('an invalid memory event appended outside the module fails closed: no replay, no new record',()=>{
 const f=fixture();recordSourceMemory260(f.s,ann(f));
 // Hash-chained correctly (store.event), but its meaning is invalid: a 404 retiring a source.
 f.s.event('source_state_changed',{schema:'pee260.source-memory.v1',recordId:'st_bad',event:{sourceId:f.srcA,state:'retired',cause:{kind:'http_status',httpStatus:404},at:at(2)},
  basis:'unverified_claim',review:null,supersedes:null,at:at(2)},at(2));
 assert.equal(f.s.verifyJournal().ok,true,'the chain is intact; the meaning is not');
 assert.throws(()=>replaySourceMemory260(f.s),/only an operator can retire/);
 assert.throws(()=>recoverSourceMemory260(f.s),/only an operator can retire/);
 assert.throws(()=>recordSourceMemory260(f.s,ann(f,{recordId:'ann_c',field:'publisherCountry',value:'GB'})),/only an operator can retire/);
 assert.equal(descriptorWithMemory260(f.s,f.revA,f.prodA).descriptor.language,'en-GB','the existing projection is still readable');
 f.s.close();
});

test('Phase261: an identical retry of a superseding annotation or contribution is a no-op, not a refusal or a duplicate',()=>{
 const f=fixture();recordSourceMemory260(f.s,ann(f));
 const sup=ann(f,{recordId:'ann_lang_2',value:'en',supersedes:'ann_lang_1',at:at(2)});
 assert.equal(recordSourceMemory260(f.s,sup).status,'recorded');
 const e1=f.s.verifyJournal().events;
 assert.equal(recordSourceMemory260(f.s,sup).status,'already_recorded');
 assert.throws(()=>recordSourceMemory260(f.s,{...sup,value:'fr'} as Input260),/record_id_conflict/,'same id, other content: refused');
 recordSourceMemory260(f.s,{kind:'source_contribution_verified',feedback:feedback(f),review:claim('rv_fb'),supersedes:null},{verify});
 const fb2:Input260={kind:'source_contribution_verified',feedback:feedback(f,{feedbackId:'fb_2',outcome:'revealed_error',reviewId:'rv_fb2'}),review:claim('rv_fb2'),supersedes:'fb_1'};
 assert.equal(recordSourceMemory260(f.s,fb2,{verify}).status,'recorded');
 const e2=f.s.verifyJournal().events;
 assert.equal(recordSourceMemory260(f.s,fb2,{verify}).status,'already_recorded');
 assert.equal(f.s.verifyJournal().events,e2,'no duplicate event');assert.equal(e2,e1+2);
 assert.equal(checkSourceMemory260(f.s).projectionConsistent,true);
 f.s.close();
});
