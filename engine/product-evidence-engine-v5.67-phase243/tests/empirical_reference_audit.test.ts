import test from 'node:test';
import assert from 'node:assert/strict';
import {auditPrimaryReviewReferences,type PublishedObservation,type DecisionQuestion} from '../src/empirical_reference_audit.js';
const base:PublishedObservation={
 id:'test_record',sourceId:'source_one',sourceUrl:'https://www.rtings.com/headphones/tools/compare/sony-wh-1000xm5-wireless-bose-quietcomfort-ultra-headphones-wireless/33024/44629',
 productPair:'bose_qc_ultra_1_vs_sony_wh1000xm5',criterion:'wearing_comfort',observedContext:'long_flight',kind:'editorial_judgment',
 outcome:'both_suitable',annotation:'Independent human summary of a published professional review.',methodRevision:null,
 reviewStatus:'one_researcher_transcription_not_expert_adjudicated',commercialRights:'reference_only_not_cleared',exactVariantVerified:true,rawLabNumbersAvailable:false
};
const q:DecisionQuestion={id:'comfort_check',task:'Long flight user comfort',criterion:'wearing_comfort',requestedContext:'long_flight',essential:true};
const run=(obs:PublishedObservation[]= [base], questions:DecisionQuestion[]=[q], externalAnnotations:unknown[]=[])=>
 auditPrimaryReviewReferences({observations:obs,questions,externalAnnotations:externalAnnotations as never[]});
test('public reference remains research-only and never creates a winner',()=>{
 const r=run();assert.equal(r.publicationReady,false);assert.equal(r.rankingEligible,false);
 assert.equal(r.expertAgreement.rate,null);assert.equal(r.cases[0].comparativeResult,'withheld');
});
test('exact context records are separated from different contexts',()=>{
 const r=run([{...base,observedContext:'brief_visit'}]);
 assert.equal(r.cases[0].directlyMatchingObservations.length,0);
 assert.deepEqual(r.cases[0].blockers.filter(x=>x==='no_exact_use_context'),['no_exact_use_context']);
});
test('same topic does not silently count as two independent lab tests',()=>{
 const r=run([base,{...base,id:'test_another',sourceId:'source_two',sourceUrl:'https://www.soundguys.com/bose-quietcomfort-ultra-headphones-vs-sony-wh-1000xm5-104454/'}]);
 assert.equal(r.cases[0].unresolvedDependence,true);
 assert.equal(r.cases[0].comparativeResult,'withheld');
});
test('missing criterion is explicitly unobserved',()=>{
 const r=run([base],[{...q,criterion:'durability'}]);
 assert.ok(r.cases[0].blockers.includes('no_recorded_professional_observation'));
});
test('source rights may not be marked cleared',()=>{
 assert.throws(()=>run([{...base,commercialRights:'cleared'} as never]),/Cannot claim validated/);
});
test('cannot label a single-human extraction as expert adjudication',()=>{
 assert.throws(()=>run([{...base,reviewStatus:'independently_approved'} as never]),/Cannot claim validated/);
});
test('rejects numeric lab-data claim not present in source capture',()=>{
 assert.throws(()=>run([{...base,rawLabNumbersAvailable:true} as never]),/Cannot claim validated/);
});
test('duplicate document observation ID rejected',()=>{
 assert.throws(()=>run([base,base]),/repeated observation/);
});
test('no Amazon or arbitrary URL as primary article',()=>{
 assert.throws(()=>run([{...base,sourceUrl:'https://www.amazon.co.uk/' }]),/Invalid source/);
});
test('two separately supplied ratings calculate agreement only, not validation',()=>{
 const ratings=[
 {caseId:q.id,raterId:'expert_alpha',verdict:'sufficient_for_this_task',protocolRef:'https://example.org/a'},
 {caseId:q.id,raterId:'expert_beta',verdict:'insufficient_for_this_task',protocolRef:'https://example.org/b'} ];
 const r=run([base],[q],ratings);
 assert.equal(r.expertAgreement.rate,0);assert.equal(r.publicationReady,false);
 assert.equal(r.independentExpertValidation,'not_performed');
});
test('cannot invent fake independent annotator without two submitted judgments',()=>{
 const r=run([base],[q],[{caseId:q.id,raterId:'expert_alpha',verdict:'inapplicable',protocolRef:'https://example.org/a'}]);
 assert.equal(r.expertAgreement.rate,null);
 assert.ok(r.cases[0].blockers.includes('two_independent_expert_assessments_missing'));
});
test('contradictory duplicate ratings rejected',()=>{
 const a={caseId:q.id,raterId:'expert_alpha',verdict:'inapplicable',protocolRef:'https://example.org/a'};
 assert.throws(()=>run([base],[q],[a,a]),/Duplicate independent annotation/);
});

test('one source identifier cannot silently switch original article',()=>{
 const other={...base,id:'another_record',sourceUrl:'https://www.soundguys.com/bose-quietcomfort-ultra-headphones-vs-sony-wh-1000xm5-104454/'};
 assert.throws(()=>run([base,other]),/One source ID cannot/);
});
test('non-text unsupported annotation fails closed',()=>{
 assert.throws(()=>run([{...base,annotation:null} as never]),/Missing manual source traceability/);
});
