import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {inspectOriginalExcerpt138,inspectPilotBatch138,type OriginalExcerpt138} from '../src/phase138_original_excerpt_pilot.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const fixture=(text='The Aster X2 performs well on hard floors.',subject='Aster X2',object='hard floors'):OriginalExcerpt138=>({
 id:'case1',publisherGroupId:'publisher_a',reviewedProductFamilyId:'aster_x2',
 url:'https://publisher.example/reviews/aster-x2',reviewedProductName:'Aster X2',approvedNameAliases:['Aster X2'],
 text,excerptSha256:sha(text),subjectLiteral:subject,objectLiteral:object,label:'contributes_to',
 developerExpectation:'text_supports',developerReason:'Constructed developer test only',
 sourceMethod:'manual_public_page_excerpt',rights:'full_article_not_licensed_for_redistribution'
});
test('explicit first mention can receive quarantined context screen without fake cross-sentence antecedent',()=>{
 const d=inspectOriginalExcerpt138(fixture());assert.equal(d.status,'candidate_quarantined');
 assert.equal(d.phase134Status,'quarantined_candidate');assert.equal(d.rankingAuthorized,false);
 assert.equal(d.canonicalWriteAuthorized,false);assert.equal(d.independentAnnotations,0);
});
test('same product naming difference is not inferred without predeclared alias',()=>{
 const d=inspectOriginalExcerpt138(fixture('The X2 performs well on hard floors.','X2'));
 assert.equal(d.status,'abstain_variant_not_reviewed');
});
test('related FE variant cannot inherit PE review just by appearing on page',()=>{
 const d=inspectOriginalExcerpt138(fixture('The Aster X3 performs well on hard floors.','Aster X3'));
 assert.equal(d.status,'abstain_variant_not_reviewed');
});
test('unresolved pronoun cannot be converted to source product by title',()=>{
 const d=inspectOriginalExcerpt138(fixture('It performs well on hard floors.','It'));
 assert.equal(d.status,'abstain_reference_unresolved');
});
test('possessive pronoun remains unresolved',()=>{
 const d=inspectOriginalExcerpt138(fixture('Its brush handles hard floors.','Its'));
 assert.equal(d.status,'abstain_reference_unresolved');
});
test('measured percentage alone does not establish the measured endpoint',()=>{
 const f=fixture('The Aster X2 collected 95%.','Aster X2','95%');f.label='measures';
 const d=inspectOriginalExcerpt138(f);
 assert.equal(d.status,'abstain_ambiguous_context');
 assert.equal(d.reason,'measurement_endpoint_not_identified_in_short_excerpt');
});
test('even with caller-attested endpoint, measurable claim remains only quarantined',()=>{
 const f=fixture('The Aster X2 collected 95%.','Aster X2','95%');
 f.label='measures';f.measurementEndpointId='embedded_sand_fraction';
 assert.equal(inspectOriginalExcerpt138(f).status,'candidate_quarantined');
});
test('negation gate cannot become positive review evidence',()=>{
 const f=fixture('The Aster X2 does not remove fine dust.','Aster X2','fine dust');
 const d=inspectOriginalExcerpt138(f);assert.notEqual(d.status,'candidate_quarantined');
});
test('source excerpt digest mismatch blocks screening',()=>{
 const f=fixture();f.text+=' unverified';
 assert.throws(()=>inspectOriginalExcerpt138(f),/invalid_or_unverified_excerpt/);
});
test('caller cannot label an extract as authenticated full snapshot',()=>{
 const f=fixture();(f as any).sourceMethod='verified_full_publisher_snapshot';
 assert.throws(()=>inspectOriginalExcerpt138(f),/invalid_or_unverified_excerpt/);
});
test('missing subject or object span fails explicitly',()=>{
 const f=fixture();f.objectLiteral='missing outcome';
 assert.throws(()=>inspectOriginalExcerpt138(f),/missing_or_repeated_pilot_span/);
});
test('duplicate surface makes span attribution uncertain',()=>{
 const f=fixture('The Aster X2 cleaned well. The Aster X2 handled hard floors.');
 assert.throws(()=>inspectOriginalExcerpt138(f),/missing_or_repeated_pilot_span/);
});
test('overlapping spans cannot become a relation',()=>{
 const f=fixture('The Aster X2 performed well.','Aster X2','X2');
 assert.throws(()=>inspectOriginalExcerpt138(f),/overlapping_pilot_spans/);
});
test('the pilot cannot compute a precision/accuracy estimate from developer judgments',()=>{
 const b=inspectPilotBatch138([fixture()]);
 assert.equal(b.independentlyLabeledOriginalCases,0);assert.equal(b.realAccuracyEstimate,null);
 assert.equal(b.byStatus.candidate_quarantined,1);
});
test('input order does not affect individual decisions',()=>{
 const a=fixture(),b=fixture('The Aster X3 removed loose debris.','Aster X3','loose debris');
 b.id='case2';b.approvedNameAliases=['Aster X3'];
 const x=inspectPilotBatch138([a,b]);const y=inspectPilotBatch138([b,a]);
 assert.deepEqual(x.decisions,y.decisions);
});
test('duplicate IDs are rejected',()=>{
 assert.throws(()=>inspectPilotBatch138([fixture(),fixture()]),/duplicate_excerpt_id/);
});
test('per-source excerpt quote budget is checked',()=>{
 const f=fixture('The Aster X2 performs quite well on hard floors with many different surfaces and a noticeable amount of pet hair in our testing.');
 const g={...f,id:'next'};
 assert.throws(()=>inspectPilotBatch138([f,g]),/excerpt_quote_budget_exceeded/);
});
test('the sample is capped',()=>{
 assert.throws(()=>inspectPilotBatch138(Array.from({length:31},(_,i)=>({...fixture(),id:'case_'+i}))),/invalid_pilot_size/);
});
test('negative labelled expectations never override actual guard results',()=>{
 const f=fixture();f.developerExpectation='text_contradicts';
 assert.equal(inspectOriginalExcerpt138(f).status,'candidate_quarantined');
});
