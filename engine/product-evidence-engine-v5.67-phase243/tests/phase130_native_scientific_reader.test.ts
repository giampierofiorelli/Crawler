import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {discoverCandidates130,nativeScientificExtractor130,planConceptReviews130} from '../src/phase130_native_scientific_reader.js';
import {stageCategoryObservations129} from '../src/phase129_category_growth_cycle.js';
import type {SourceRef128,CategoryBrain128} from '../src/phase128_category_cognition_dialogue_bridge.js';
const url='https://www.energystar.gov/products/dehumidifiers/key_efficiency_criteria';
const source:SourceRef128={id:'energy_doc',originalDocumentId:'energy_doc_original',url,
 title:'Efficiency criteria',role:'original_expert_method'};
const read=(text:string)=>discoverCandidates130({text,source});
const text='Integrated Energy Factor (IEF): An efficiency measure expressed in liters per kilowatt-hour.';
const at='2026-10-11T13:00:00Z';
const brain:CategoryBrain128={categoryId:'dehumidifier',schemaVersion:1,aliases:['dehumidifier'],
 sources:[],concepts:[],quality:[],distinctions:[]};
test('recognises metrological acronym, stores exact anchored quote and abstains on product ranking',()=>{
 const r=read(text);assert.deepEqual(r.map(x=>x.name),['Integrated Energy Factor']);
 assert.equal(r[0].literal,text.slice(r[0].start,r[0].end));
 assert.equal(r[0].abbreviation,'IEF');assert.equal(r[0].rankingAuthorized,false);
 assert.equal(r[0].status,'hypothesis_requires_review');
});
test('parses colon-style definitions without acronym',()=>{
 const r=read('Product Capacity: This measures moisture removed over a day, in pints.');
 assert.deepEqual(r.map(x=>x.name),['Product Capacity']);
});
test('detects two independent measurement criteria with no prior category lexicon',()=>{
 const r=read('Water removal capacity is measured in pints per day; energy efficiency is measured in liters per kilowatt-hour.');
 assert.deepEqual(r.map(x=>x.name),['Water removal capacity','energy efficiency']);
});
test('detects a named factor as an object of a measurement relation',()=>{
 const r=read('Drying efficiency is measured by combined energy factor.');
 assert.deepEqual(r.map(x=>x.name),['Drying efficiency','combined energy factor']);
});
test('does not treat acronyms for arbitrary features as scientific metrics',()=>{
 assert.equal(read('This product has a remote control (RC) and a filter system (FILT).').length,0);
});
test('rejects promotional indices lacking test method',()=>{
 assert.equal(read('A brochure promotes a Superior Comfort Index (SCI), but no independent test method exists for that index.').length,0);
});
test('rejects explicit lack of measurement',()=>{
 assert.equal(read('The device does not measure Air Quality Rating (AQR), which has not been tested.').length,0);
});
test('does not reintroduce an obsolete measurement as current through acronyms',()=>{
 const r=read('The historical Energy Factor (EF) was replaced by Integrated Energy Factor (IEF), a modern efficiency measure.');
 assert.deepEqual(r.map(x=>x.name),['Integrated Energy Factor']);
});
test('keeps independent original spans after punctuation and deterministic outputs',()=>{
 const t='The appliance has a safety switch.\nCombined Energy Factor (CEF): efficiency measured in pounds per kilowatt-hour.';
 const r=read(t),r2=read(t);assert.deepEqual(r,r2);
 assert.equal(r.length,1);assert.equal(r[0].literal,t.slice(r[0].start,r[0].end));
});
test('rejects invalid bounds, large inputs and missing document identity',()=>{
 assert.throws(()=>discoverCandidates130({text,source,maxCandidates:0}),/invalid_native_reader_input/);
 assert.throws(()=>discoverCandidates130({text:'A'.repeat(250001),source}),/invalid_native_reader_input/);
 assert.throws(()=>discoverCandidates130({text,source:{...source,id:''}}),/invalid_native_reader_input/);
});
test('review scheduling distinguishes URL hosts from repeated mentions but not true source independence',()=>{
 const x=read(text)[0];
 const a={...x,sourceId:'first'},b={...x,sourceId:'second'},c={...x,sourceId:'third'};
 const r=planConceptReviews130([a,b,c],{
  first:'https://www.energystar.gov/one',second:'https://www.energystar.gov/two',third:'https://www.energy.gov/three'});
 assert.equal(r.length,1);assert.equal(r[0].sourceCount,3);
 assert.equal(r[0].distinctHostCount,2);
 assert.equal(r[0].priority,'multiple_hosts');assert.equal(r[0].status,'human_scientific_review_required');
});
test('bad review source and spoofed auto-approval are forbidden',()=>{
 assert.throws(()=>planConceptReviews130(read(text),{}),/missing_source/);
 assert.throws(()=>planConceptReviews130([{...read(text)[0],rankingAuthorized:true as false}],{energy_doc:url}),/unverified_only/);
});
test('integration: new unseen category metric enters Phase129 quarantine only',async()=>{
 const content='Product Capacity: This measures moisture removed during testing, in pints per day.';
 const sha=createHash('sha256').update(content).digest('hex');
 const batch=await stageCategoryObservations129({brain,asOf:at,
  documents:[{source,text:content,contentSha256:sha,observedAt:at,
   permission:{fetchAllowed:true,factExtractionAllowed:true,publicCitationAllowed:true}}],
  extractor:nativeScientificExtractor130()});
 assert.equal(batch.claims.length,1);assert.equal(batch.claims[0].discovery.concept.label,'Product Capacity');
 assert.equal(batch.rankingAuthorized,false);assert.equal(batch.sourceBodiesRetained,false);
 assert.equal(brain.concepts.length,0);assert.equal(batch.reviewNeeded,true);
});
test('case and whitespace in label do not change normalized concept in review queue',()=>{
 const x=read(text)[0];const r=planConceptReviews130([x,{...x,name:' integrated   ENERGY factor '}],{energy_doc:url});
 assert.equal(r.length,1);
});
test('ambiguous statement about fabrics cannot be relabelled as measurable fabric wear',()=>{
 const r=read('Drying efficiency is measured by combined energy factor. The number alone is not a direct measure of fabric wear.');
 assert.deepEqual(r.map(x=>x.name),['Drying efficiency','combined energy factor']);
});
import {planScientificFollowups130} from '../src/phase130_native_scientific_reader.js';
test('new measurement automatically creates falsifiable research obligations, not a quality score',()=>{
 const questions=planScientificFollowups130(read(text));
 assert.equal(questions.length,1);
 assert.deepEqual(questions[0].checks.map(x=>x.code),[
  'definition','protocol_version','measurement_context','user_goal_relevance','comparison_evidence']);
 assert.equal(questions[0].productRankingBlocked,true);
 assert.ok(questions[0].checks.every(x=>x.question.includes('Integrated Energy Factor')));
});
test('unverified research agenda is deterministic and does not authorize fabricated product comparison',()=>{
 const c=read(text)[0];
 assert.deepEqual(planScientificFollowups130([c,c]),planScientificFollowups130([c]));
 assert.throws(()=>planScientificFollowups130([{...c,rankingAuthorized:true as false}]),/only_unverified_candidates/);
});
