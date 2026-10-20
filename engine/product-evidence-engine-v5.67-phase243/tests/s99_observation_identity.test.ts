import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type ObservationInput246,type ScientificReadingRow98} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {testLeadsFromHtml265} from '../src/phase265_test_measurements.js';
import {readPage98,scientificContext98} from '../src/scientific_reading98.js';
import {clauseCues,decideSemantics} from '../src/observation_semantics.js';
import {compareReadings98} from '../src/scientific_evidence98.js';
import type {WebSourcePolicy} from '../src/web_evidence_acquisition.js';

// S99 (owner review of S98, 2026-10-20): every scientific observation keeps its identity and meaning from the source to the
// store: statement role, product, nature, property, conditions, method and provenance. Every page text is invented here.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee99-'));let n=0;const db=()=>join(dir,`s${++n}.sqlite`);
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');const AT='2026-10-20T10:00:00.000Z';const HOST='lab.example';const URL='https://lab.example/review/acme-p1';
const approved:WebSourcePolicy={sourceId:'pol_lab',host:HOST,basis:'written_permission',rightsDocumentId:'rights_lab',rightsDocumentUrl:'https://rights.pee-tests.org/lab',
 reviewedBy:'rights_reviewer',reviewedAt:'2026-10-01T00:00:00Z',validUntil:'2027-10-01T00:00:00Z',permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage'],
 robots:'allowed',robotsCheckedAt:'2026-10-20T06:00:00Z',websiteTerms:'reviewed_permitted',termsCheckedAt:'2026-10-10T00:00:00Z',commercialUseReviewed:true};
const html=`<!doctype html><html><head><title>Acme P1 monitor review</title><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name:'Acme P1',brand:{'@type':'Brand',name:'Acme'},mpn:'P1-27'})}</script></head>
<body><main><h1>Acme P1 monitor review</h1>
<h2>Specifications</h2><table><tr><th>Peak brightness</th><td>412 nits</td></tr><tr><th>Refresh rate</th><td>240 Hz</td></tr></table>
<h2>Brightness and latency</h2>
<p>In our tests the Acme P1 reached a peak brightness of 412 nits on a 10% window.</p>
<p>The Rival Q9 reached a peak brightness of 655 nits on a 10% window in the same test.</p>
<p>For HDR work, the usual guideline is a peak brightness of at least 600 nits.</p>
<p>We measured an input lag of 9.8 ms, which is excellent for gaming.</p>
</main></body></html>`;
const reading=()=>{const x=extractSpecifications245(html,URL);const leads=testLeadsFromHtml265(html,URL,sha(html),x,{category:'monitors'});return {x,leads,sci:readPage98(html,URL,sha(html),x,leads,[],'monitors','independent_original_test')};};
const observation=():ObservationInput246=>{const {x,leads,sci}=reading();
 return {source:{sourceId:'src_lab',host:HOST,sourceType:'independent_original_test',sourceTypeBasis:'operator_asserted',policy:approved},url:URL,sha256:sha(html),bytes:html.length,httpStatus:200,fetchedAt:AT,
  runId:'run_s99',extractorVersion:'phase245@s99test',extraction:x,categoryHypotheses:['monitors'],testLeads:leads,scientific98:sci};};

test('the same value and unit in another element is another observation, not a duplicate', ()=>{
 const {sci}=reading();
 assert.ok(sci.declarations.some(d=>d.reading.property.id==='qkm_peak_luminance'),'the specification row is read');
 const prose=sci.document.filter(d=>d.value===412);assert.equal(prose.length,1,'the measured 412 nits in prose is kept although the specification row prints the same value and unit');
 assert.equal(prose[0].reading.statement.role,'result');assert.equal(prose[0].reading.nature,'measured');
 assert.ok(sci.counts.identity.sameValueOtherOccurrence>=1);});

test('a norm and another product\'s result are never values of the page product', ()=>{
 const {sci}=reading();
 const norm=sci.document.find(d=>d.value===600);if(norm){assert.ok(['norm','threshold'].includes(norm.reading.statement.role),'a guideline value is a norm or threshold, got '+norm.reading.statement.role);
  assert.equal(norm.reading.statement.bound,'min');assert.equal(norm.reading.subject.value,'none');}
 const rival=sci.document.find(d=>d.value===655);if(rival)assert.notEqual(rival.reading.subject.value,'page_product','another product named in the clause is never the page product');});

test('every field of a reading reaches the store unchanged, and the product link follows the stated subject', ()=>{
 const s=new KnowledgeStore246(db(),{...DEFAULT_STORAGE_POLICY246,scientificReadings98:true});const o=observation();s.ingestObservation246(o);
 const rows=s.db.prepare("SELECT * FROM scientific_readings98 WHERE state='current'").all() as Record<string,unknown>[];
 const all=[...o.scientific98!.declarations.map(d=>d.reading),...o.scientific98!.leads.map(l=>l.reading),...o.scientific98!.document.map(d=>d.reading)];
 assert.ok(all.length>=4);
 for(const r of all){const row=rows.find(x=>x.observation_key===r.source!.key);assert.ok(row,'stored: '+r.source!.key);
  assert.equal(row!.property_id,r.property.id);assert.equal(row!.nature,r.nature);assert.equal(row!.statement_role,r.statement.role);assert.equal(row!.bound,r.statement.bound);
  assert.equal(row!.subject_value,r.subject.value);assert.equal(row!.provenance,r.provenance);assert.equal(row!.source_reader,r.source!.reader);
  assert.deepEqual(JSON.parse(String(row!.conditions_json)),r.conditions);assert.deepEqual(JSON.parse(String(row!.missing_conditions_json)),r.missing);
  if(row!.subject_table==='document_quantity'&&r.subject.value!=='page_product'&&r.subject.value!=='named_product')assert.equal(row!.product_id,null,'no product without a stated subject');}
 const measured=s.scientificReadings98().find(r=>r.subject_table==='document_quantity'&&r.value===412);assert.ok(measured);
 assert.ok(measured!.conditions.some(c=>c.id==='window_size'&&c.state==='explicit'));assert.equal(measured!.product_association,'page_main_product_unverified');
 s.close();});

test('statement roles (S100: decided by the shared rules from clause cues): a generic bound is a threshold, a norm a norm, a maker\'s bounded value a specification', ()=>{
 const ctx=scientificContext98();const role=(t:string,v:string,unit:string)=>{const a=t.indexOf(v);return decideSemantics(clauseCues(ctx.qk,ctx.defs,t,a,a+v.length,unit,{dim:'',propertyStated:false})).role;};
 assert.equal(role('Anything under 45 dB is quiet enough for a bedroom.','45 dB','dB'),'threshold');
 assert.equal(role('The 44 dB quietness standard applies to dishwashers.','44 dB','dB'),'norm');
 assert.equal(role('The battery is rated for up to 120 minutes.','120 minutes','minutes'),'specification');
 assert.equal(role('We measured 38 dB at the lowest speed.','38 dB','dB'),'result');
 assert.equal(role('The panel refresh rate is 240 Hz.','240 Hz','Hz'),'unresolved','no default to result');});

test('comparability needs role, bound, basis, object and method to agree, not only stated conditions', ()=>{
 const base:Partial<ScientificReadingRow98>&{conditions:{id:string;value:string|null;state:string}[];missing:string[];conflicts:string[]}={
  nature:'measured',kind:'luminance',statement_role:'result',bound:null,result_basis:null,object:'display',definitions_identity:'pd.7:x',conditions:[{id:'window_size',value:'10',state:'explicit'}],missing:['window_size'],conflicts:[]};
 const row=(o:Record<string,unknown>)=>({...base,...o}) as never;
 assert.equal(compareReadings98(row({product_id:'a',source_id:'s1',method:{codes:[],cue:'first_person_test_statement',instrumentStated:true}}),row({product_id:'b',source_id:'s1',method:{codes:[],cue:'first_person_test_statement',instrumentStated:true}})).verdict,'comparable_within_source');
 assert.equal(compareReadings98(row({source_id:'s1'}),row({source_id:'s2'})).verdict,'conditions_unestablished','different sources with no stated common method');
 assert.equal(compareReadings98(row({statement_role:'threshold'}),row({})).verdict,'not_comparable');
 assert.equal(compareReadings98(row({bound:'max'}),row({})).verdict,'not_comparable');
 assert.equal(compareReadings98(row({result_basis:'per_run'}),row({result_basis:'per_period'})).verdict,'not_comparable');
 assert.equal(compareReadings98(row({object:'display'}),row({object:'backlight'})).verdict,'not_comparable');
 assert.equal(compareReadings98(row({conditions:[]}),row({})).verdict,'conditions_unestablished','a missing required condition is never equivalence');});

test('two observations in one element keep distinct identities (segments of one paragraph each start at offset 0)', ()=>{
 const page=`<html><body><main><h1>Acme V2 vacuum review</h1><p>Runtime: 42 minutes. Noise: 68 dB. Bin capacity: 0.6 L.</p></main></body></html>`;
 const x=extractSpecifications245(page,URL);const sci=readPage98(page,URL,sha(page),x,null,[],'robot_floor_cleaners','independent_original_test');
 const keys=sci.document.map(d=>d.key);assert.equal(new Set(keys).size,keys.length,'every kept observation has its own key');});
