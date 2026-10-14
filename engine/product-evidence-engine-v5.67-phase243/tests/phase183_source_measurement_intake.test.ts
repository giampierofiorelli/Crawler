import test from 'node:test';
import assert from 'node:assert/strict';
import {stageTechnicalTable183,verifyStagedSpan183,type SourceCustody183} from '../src/phase183_source_measurement_intake.js';
const asOf='2026-10-12T22:00:00Z';
const custody:SourceCustody183={sourceId:'epa_certified_cleaners',sourceUrl:'https://data.energystar.gov/Active-Specifications/ENERGY-STAR-Certified-Room-Air-Cleaners-V3-0/gaa3-swy6',
 licenseUrl:'https://edg.epa.gov/EPA_Data_License.html',rightsReviewReference:'epa_licence_operator_audit',
 permissionStatus:'operator_reviewed_local_fact_storage',sourceRole:'certification_registry_manufacturer_reported',
 sourceRevision:'release_2026_09',protocolId:'epa_energystar_air_cleaners',protocolVersion:'v3_0',
 market:'us',obtainedAt:'2026-10-12T20:00:00Z',rightsReviewedAt:'2026-10-12T20:00:00Z',acquisition:'operator_supplied_offline_copy'};
const schema={brandColumn:'brand_name',modelColumn:'model_number',measurements:[
 {column:'smoke_free_clean_air_delivery',dimensionKey:'smoke_cadr',unit:'cfm',min:1,max:1200},
 {column:'dust_free_clean_air_delivery',dimensionKey:'dust_cadr',unit:'cfm',min:1,max:1200}]};
const scope={variantId:'afloia_kilo',brand:'Afloia',modelNumber:'Kilo',categoryId:'air_purifier'};
const csv='brand_name,model_number,smoke_free_clean_air_delivery,dust_free_clean_air_delivery\nAfloia,Kilo,56,69\nAirDoctor,AD2000,162,152\n';
const encode=(s:string)=>Buffer.from(s,'utf8');
const make=(overrides:Record<string,unknown>={})=>stageTechnicalTable183({csvBytes:encode(csv),custody,scope,schema,asOf,...overrides});
const clone=<T>(x:T):T=>JSON.parse(JSON.stringify(x));
test('intake quarantines two exact numeric measurements from one model',()=>{
 const r=make();assert.equal(r.status,'staged_unreviewed');assert.equal(r.observations.length,2);
 assert.deepEqual(r.observations.map(o=>o.value),[56,69]);assert.equal(r.rankingAuthorized,false);
 assert.equal(r.canonicalProductKnowledgeUpdated,false);assert.equal(r.independentScienceReviewed,false);
 assert.equal(r.observations[0].sourceRole,'certification_registry_manufacturer_reported');
 assert.ok(verifyStagedSpan183(r,encode(csv)));
});
test('row start, end and sha refer to real original bytes',()=>{
 const r=make();const o=r.observations[0];
 assert.equal(encode(csv).subarray(o.rowByteStart,o.rowByteEnd).toString('utf8'),'Afloia,Kilo,56,69\n');
 assert.equal(o.sourceRow,2);
});
test('casing and whitespace in product identifiers may normalize, not substring match',()=>{
 assert.equal(make({scope:{...scope,brand:' aFLOIA ',modelNumber:'KILO'}}).status,'staged_unreviewed');
 assert.equal(make({scope:{...scope,modelNumber:'Kil'}}).reason,'exact_model_not_found');
});
test('another model in same source cannot contaminate the requested exact variant',()=>{
 const r=make({scope:{...scope,variantId:'airdoctor_ad2000',brand:'AirDoctor',modelNumber:'AD2000'}});
 assert.deepEqual(r.observations.map(o=>o.value),[162,152]);
 assert.equal(r.observations.every(o=>o.variantId==='airdoctor_ad2000'),true);
});
test('ambiguous duplicate exact model is held instead of arbitrarily choosing a row',()=>{
 const r=make({csvBytes:encode(csv+'Afloia,Kilo,58,70\n')});
 assert.equal(r.status,'blocked');assert.equal(r.reason,'ambiguous_duplicate_exact_model');
});
test('a model wildcard is not an exact tested configuration',()=>{
 assert.throws(()=>make({scope:{...scope,modelNumber:'Kilo*'}}),/invalid_intake_contract/);
});
test('missing required original columns blocks the whole source',()=>{
 const r=make({csvBytes:encode('brand_name,model_number,smoke_free_clean_air_delivery\nAfloia,Kilo,56\n')});
 assert.equal(r.reason,'required_columns_missing');
});
test('missing value blocks staging instead of silently giving zero',()=>{
 const r=make({csvBytes:encode(csv.replace('Kilo,56,69','Kilo,56,'))});
 assert.equal(r.reason,'missing_or_ambiguous_measurement:dust_cadr');
});
test('comma decimal, range, scientific notation, wildcards rejected as unverified',()=>{
 for(const val of ['10-20','1e3','~56','56*','N/A','-5','0.6.2']){
  const r=make({csvBytes:encode(csv.replace('Kilo,56,69',`Kilo,${val},69`))});
  assert.equal(r.status,'blocked',val);
 }
});
test('out of range checks are not converted into arbitrary weights',()=>{
 const r=make({csvBytes:encode(csv.replace('Kilo,56,69','Kilo,9999,69'))});
 assert.equal(r.reason,'out_of_range:smoke_cadr');
});
test('quoted identifiers, embedded commas and correct offsets are supported',()=>{
 const text='brand_name,model_number,smoke_free_clean_air_delivery,dust_free_clean_air_delivery\r\n"Afloia, Inc","Kilo, Plus",56,69\r\n';
 const r=make({scope:{...scope,brand:'Afloia, Inc',modelNumber:'Kilo, Plus'},csvBytes:encode(text)});
 assert.equal(r.status,'staged_unreviewed');assert.ok(verifyStagedSpan183(r,encode(text)));
});
test('multiline quoted fields are parsed as one source row',()=>{
 const text='brand_name,model_number,smoke_free_clean_air_delivery,dust_free_clean_air_delivery\n"Afloia\nLabs",Kilo,56,69\n';
 const r=make({scope:{...scope,brand:'Afloia Labs'},csvBytes:encode(text)});
 assert.equal(r.status,'staged_unreviewed');assert.ok(verifyStagedSpan183(r,encode(text)));
});
test('UTF8 BOM and non-ASCII row bytes retain correct hashes and offsets',()=>{
 const text='\ufeffbrand_name,model_number,smoke_free_clean_air_delivery,dust_free_clean_air_delivery\nLüften,Neo,56,69\n';
 const r=make({scope:{...scope,brand:'Lüften',modelNumber:'Neo'},csvBytes:encode(text)});
 assert.equal(r.status,'staged_unreviewed');assert.ok(verifyStagedSpan183(r,encode(text)));
 assert.equal(encode(text).subarray(r.observations[0].rowByteStart,r.observations[0].rowByteEnd).toString(),'Lüften,Neo,56,69\n');
});
test('source byte mutation invalidates the stage even if values are superficially similar',()=>{
 const r=make();assert.equal(verifyStagedSpan183(r,encode(csv.replace('Kilo,56,69','Kilo,57,69'))),false);
});
test('altered observation cannot retain the old result hash',()=>{
 const r=clone(make());r.observations[0].value=999;
 assert.equal(verifyStagedSpan183(r,encode(csv)),false);
});
test('an altered science authority flag fails sealed verification',()=>{
 const r=clone(make());(r as any).rankingAuthorized=true;
 assert.equal(verifyStagedSpan183(r,encode(csv)),false);
});
test('local intake never asserts the source was automatically downloaded',()=>{
 assert.throws(()=>make({custody:{...custody,acquisition:'autonomous_crawler'}}),/invalid_intake_contract/);
});
test('source policy must have operator-reviewed, original license references',()=>{
 assert.throws(()=>make({custody:{...custody,permissionStatus:'none'}}),/invalid_intake_contract/);
 assert.throws(()=>make({custody:{...custody,rightsReviewReference:''}}),/invalid_intake_contract/);
 assert.throws(()=>make({custody:{...custody,licenseUrl:'http://unsupported'}}),/invalid_intake_contract/);
});
test('rights review or source obtained in the future is not accepted',()=>{
 assert.throws(()=>make({custody:{...custody,obtainedAt:'2026-11-01T00:00:00Z'}}),/invalid_intake_contract/);
 assert.throws(()=>make({custody:{...custody,rightsReviewedAt:'2026-11-01T00:00:00Z'}}),/invalid_intake_contract/);
});
test('duplicate header or duplicate measurement definition is unsafe',()=>{
 const r=make({csvBytes:encode(csv.replace('dust_free_clean_air_delivery','brand_name'))});
 assert.equal(r.reason,'invalid_or_duplicate_headers');
 assert.throws(()=>make({schema:{...schema,measurements:[schema.measurements[0],schema.measurements[0]]}}),/invalid_schema/);
});
test('ragged records cannot be misattributed to wrong column',()=>{
 assert.equal(make({csvBytes:encode(csv.replace('AD2000,162,152','AD2000,162'))}).reason,'ragged_rows');
});
test('unknown schema does not infer units from column names',()=>{
 const r=make({schema:{...schema,measurements:[{...schema.measurements[0],unit:'cfm_per_watt'}]}});
 assert.equal(r.status,'staged_unreviewed');
 // This remains untrusted and must be reviewed; declaration alone is not a valid unit conversion.
 assert.equal(r.independentScienceReviewed,false);
});
test('invalid binary and malformed CSV remain blocked',()=>{
 assert.equal(make({csvBytes:Uint8Array.from([0xff,0xfd,...encode(csv)])}).reason,'invalid_utf8');
 assert.equal(make({csvBytes:encode(csv+'"oops,unclosed')}).reason,'malformed_or_unbounded_csv');
});
test('large offline documents are bounded and do not silently truncate',()=>{
 assert.throws(()=>make({csvBytes:encode('brand_name,model_number,'+'x'.repeat(700_000))}),/invalid_intake_contract/);
});
test('one document, multiple exact variants produce separate identities without copying their metrics',()=>{
 const a=make(),b=make({scope:{...scope,variantId:'airdoctor_ad2000',brand:'AirDoctor',modelNumber:'AD2000'}});
 assert.notEqual(a.observations[0].observationId,b.observations[0].observationId);
 assert.equal(a.documentSha256,b.documentSha256);
});
import {stageForResearchJob183,openIntakeJournal183,appendStagedIntake183} from '../src/phase183_source_measurement_intake.js';
import {planResearchGaps182} from '../src/phase182_gap_research_orchestrator.js';
import type {DynamicDecision181} from '../src/phase181_dynamic_knowledge_ranking.js';
function researchPlan(){
 const decision:DynamicDecision181={phase:181,language:'en',source:'signed_product_knowledge',status:'research_required',
  firstLayer:[],visibleCautions:[],rankInputFingerprint:'intent',knowledgeRevision:null,policyRevision:null,
  ranked:[],held:[],researchGaps:[{kind:'missing_test',reference:'afloia_kilo:smoke_cadr',action:'Need original data'}],
  coverage:{discovered:0,reviewed:0,notYetReviewed:0,marketCoverageComplete:false},rankingsPrecomputed:false,
  researchAccessPerformed:false,scientificValidityNotEstablishedBySignature:true};
 return planResearchGaps182({decision,categoryId:'air_purifier',categoryLabel:'Air purifiers',market:'us',asOf});
}
test('the actual Phase182 missing-test job links to staged exact-variant source',()=>{
 const p=researchPlan();const r=stageForResearchJob183({plan:p,jobId:p.jobs[0].jobId,csvBytes:encode(csv),custody,scope,schema,operatorSourceUrl:custody.sourceUrl});
 assert.equal(r.input.status,'staged_unreviewed');assert.equal(r.planHash,p.planHash);
 assert.equal(r.catalogPromotionAuthorized,false);
});
test('a tampered Phase182 research job cannot be accepted',()=>{
 const p=clone(researchPlan());p.market='uk';
 assert.throws(()=>stageForResearchJob183({plan:p,jobId:p.jobs[0].jobId,csvBytes:encode(csv),custody,scope,schema,operatorSourceUrl:custody.sourceUrl}),/integrity/);
});
test('a plan for a different exact model cannot stage this model',()=>{
 const p=researchPlan();
 assert.throws(()=>stageForResearchJob183({plan:p,jobId:p.jobs[0].jobId,csvBytes:encode(csv),custody,
  scope:{...scope,variantId:'other_model'},schema,operatorSourceUrl:custody.sourceUrl}),/mismatch/);
});
test('the actual missing dimension must be included in the staged measurements',()=>{
 const p=researchPlan();
 assert.throws(()=>stageForResearchJob183({plan:p,jobId:p.jobs[0].jobId,csvBytes:encode(csv),custody,
  scope,schema:{...schema,measurements:[schema.measurements[1]]},operatorSourceUrl:custody.sourceUrl}),/mismatch/);
});
test('wrong market, source url or job id cannot be confused',()=>{
 const p=researchPlan();const input={plan:p,jobId:p.jobs[0].jobId,csvBytes:encode(csv),custody,scope,schema,operatorSourceUrl:custody.sourceUrl};
 assert.throws(()=>stageForResearchJob183({...input,custody:{...custody,market:'uk'}}),/mismatch/);
 assert.throws(()=>stageForResearchJob183({...input,operatorSourceUrl:'https://another.site.org/file'}),/mismatch/);
 assert.throws(()=>stageForResearchJob183({...input,jobId:'none'}),/mismatch/);
});
test('new measurements append to product-scoped journal but remain unreviewed',()=>{
 const j=openIntakeJournal183('air_purifier','afloia_kilo');
 const k=appendStagedIntake183({journal:j,intake:make(),sourceBytes:encode(csv),expectedRevision:0,expectedHash:j.snapshotHash});
 assert.equal(k.revision,1);assert.equal(k.events[0].reviewState,'pending_independent_review');
 assert.equal(k.scientificallyApproved,false);assert.equal(k.rankingAuthorized,false);
});
test('identical replay is idempotent and history is not destroyed',()=>{
 const j=openIntakeJournal183('air_purifier','afloia_kilo');const input=make();
 const k=appendStagedIntake183({journal:j,intake:input,sourceBytes:encode(csv),expectedRevision:0,expectedHash:j.snapshotHash});
 const again=appendStagedIntake183({journal:k,intake:input,sourceBytes:encode(csv),expectedRevision:1,expectedHash:k.snapshotHash});
 assert.deepEqual(k,again);assert.equal(j.revision,0);
});
test('updated source measurement produces explicit unresolved conflict',()=>{
 const j=openIntakeJournal183('air_purifier','afloia_kilo');
 const k=appendStagedIntake183({journal:j,intake:make(),sourceBytes:encode(csv),expectedRevision:0,expectedHash:j.snapshotHash});
 const updated=csv.replace('Kilo,56,69','Kilo,58,69');
 const l=appendStagedIntake183({journal:k,intake:make({csvBytes:encode(updated),custody:{...custody,sourceRevision:'release_2026_10'}}),sourceBytes:encode(updated),expectedRevision:1,expectedHash:k.snapshotHash});
 assert.equal(l.revision,2);assert.equal(l.events[1].reviewState,'conflict_requires_review');
 assert.equal(l.events[0].criterionValues[0].value,56);assert.equal(l.events[1].criterionValues[0].value,58);
 assert.equal(l.scientificallyApproved,false);
});
test('a protocol version change triggers review even if measured number stays equal',()=>{
 const j=openIntakeJournal183('air_purifier','afloia_kilo');
 const k=appendStagedIntake183({journal:j,intake:make(),sourceBytes:encode(csv),expectedRevision:0,expectedHash:j.snapshotHash});
 const l=appendStagedIntake183({journal:k,intake:make({custody:{...custody,protocolVersion:'v4_0'}}),sourceBytes:encode(csv),expectedRevision:1,expectedHash:k.snapshotHash});
 assert.equal(l.events[1].reviewState,'conflict_requires_review');
});
test('a corrupt previous receipt cannot be used to append new facts',()=>{
 const j=openIntakeJournal183('air_purifier','afloia_kilo');
 const k=appendStagedIntake183({journal:j,intake:make(),sourceBytes:encode(csv),expectedRevision:0,expectedHash:j.snapshotHash});
 const fake=clone(k);fake.events[0].criterionValues[0].value=1000;
 assert.throws(()=>appendStagedIntake183({journal:fake,intake:make(),sourceBytes:encode(csv),expectedRevision:1,expectedHash:fake.snapshotHash}),/corrupted_history/);
});
test('stale revision is rejected when two editors update the same product',()=>{
 const j=openIntakeJournal183('air_purifier','afloia_kilo');
 const k=appendStagedIntake183({journal:j,intake:make(),sourceBytes:encode(csv),expectedRevision:0,expectedHash:j.snapshotHash});
 assert.throws(()=>appendStagedIntake183({journal:k,intake:make(),sourceBytes:encode(csv),expectedRevision:0,expectedHash:j.snapshotHash}),/stale/);
});
test('journal cannot receive unreviewed source for another model',()=>{
 const j=openIntakeJournal183('air_purifier','airdoctor_ad2000');
 assert.throws(()=>appendStagedIntake183({journal:j,intake:make(),sourceBytes:encode(csv),expectedRevision:0,expectedHash:j.snapshotHash}),/untrusted_intake/);
});
