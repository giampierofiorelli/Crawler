import test from 'node:test';import assert from 'node:assert/strict';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {loadPropertyDefinitions} from '../src/property_definitions.js';
import {attributeProperty,interpretWithDefinitions,ownWords,definitionPlanMeasurements} from '../src/definition_interpreter.js';
import {learnFromDocuments,withLearned,ngrams} from '../src/definition_learning.js';

// S89: knowledge principles and the learning mechanism. Every text is invented for this test.
const qk=loadQuantityKnowledge();const defs=loadPropertyDefinitions(qk);

test('S89 the refuted profile licence is off by default; explicit true reproduces S88',()=>{
 const o={value:2.4,unit:'in',label:'2.4in',category:'robot_floor_cleaners'};
 assert.equal(attributeProperty(defs,qk,o).value,null);
 assert.equal(attributeProperty(defs,qk,o,{profileLicense:true}).value,'obstacle_height');
});

test('S89 known objects and plausible ranges: a video signal is not an audio response; a latency is not years',()=>{
 assert.equal(attributeProperty(defs,qk,{value:120,unit:'Hz',label:'HDMI ports support 4K 120Hz for consoles',category:'soundbars'}).value,null);
 assert.equal(attributeProperty(defs,qk,{value:15,unit:'years',label:'audio latency testing for 15 years',category:'soundbars'}).value,null);
 assert.equal(attributeProperty(defs,qk,{value:30,unit:'ms',label:'audio latency over ARC',category:'soundbars'}).value,'audio_latency');
});

test('S89 a term attaches to the nearest quantity',()=>{
 const label='it achieved 100% pet hair pickup and had 0% hair tangling';
 const at=label.indexOf('0% hair');
 assert.ok(!ownWords(label,at,qk).includes('pickup'),'pickup belongs to the 100% value');
 assert.ok(ownWords(label,label.indexOf('100%'),qk).includes('pickup'));
});

test('S89 role and subject are separate slots, never merged into the property',()=>{
 const label='The manufacturer claims a 45 dB noise level';
 const r=interpretWithDefinitions(defs,qk,{value:45,unit:'dB',label,valueAt:label.indexOf('45'),surface:'45 dB'});
 assert.equal(r.property.value,'sound_level');assert.equal(r.role.value,'declared_spec');
});

test('S89/S90 learning: one source teaches a candidate, independent publishers a supported term; it reaches every consumer',()=>{
 const doc=(i:number,pub:string,label:string)=>({docId:'d'+i,publisher:pub,category:'robot_floor_cleaners',value:90,unit:'%',label,valueAt:label.indexOf('90'),surface:'90%'});
 const seedsOnePub=[doc(1,'a.com','debris pickup in the sandbox trial 90%'),doc(2,'a.com','debris pickup in the sandbox trial 90%')];
 const one=learnFromDocuments(defs,qk,seedsOnePub).terms;
 assert.ok(one.length>0&&one.every(t=>t.state==='candidate'),'one publisher teaches only candidates (S90: uncertainty state, not refusal)');
 const obs=[doc(1,'a.com','debris pickup in the sandbox trial 90%'),doc(2,'b.com','debris pickup on the sandbox trial 90%')];
 const layer=learnFromDocuments(defs,qk,obs);
 assert.ok(layer.terms.some(t=>t.property==='debris_pickup'&&t.term==='sandbox trial'&&t.state==='supported'),JSON.stringify(layer.terms));
 const learned=withLearned(qk,defs.pack,layer);
 const p=(d:typeof defs)=>definitionPlanMeasurements(d,qk,'robot_floor_cleaners').find(m=>m.id==='debris_pickup')!.terms;
 assert.ok(!p(defs).includes('sandbox trial')&&p(learned).includes('sandbox trial'),'reading plan');
 const o={value:93,unit:'%',label:'sandbox trial 93%',valueAt:13,surface:'93%',category:'robot_floor_cleaners'};
 assert.equal(attributeProperty(defs,qk,o).value,null);assert.equal(attributeProperty(learned,qk,o).value,'debris_pickup','attribution');
});

test('S89 n-grams never start or end on a stopword or contain digits',()=>{
 assert.deepEqual(ngrams('the 2 deep clean score of',3).sort(),['clean','deep','deep clean'].sort());
});

test('S91 role from positive evidence only: measured, declared, or unresolved (never measured by default)',()=>{
 const role=(label:string,v='45 dB')=>interpretWithDefinitions(defs,qk,{value:45,unit:'dB',label,valueAt:label.indexOf(v),surface:v}).role;
 assert.equal(role('In our tests it peaked at 45 dB on the top setting').value,'measured_result');
 assert.equal(role('It is rated at 45 dB by the manufacturer').value,'declared_spec');
 // recorded gap (S91, not changed while frozen): 'the maker rates it' carries no cue in pd.5
 assert.equal(role('Noise: 45 dB').value,'unresolved','a bare value with no evidence is an abstention');
 assert.equal(role('Noise: 45 dB').reason,'no_positive_evidence');
});
