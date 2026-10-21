import test from 'node:test';import assert from 'node:assert/strict';
import {requestCoverage80} from '../src/request_coverage80.js';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {CONCEPT_VOCABULARY248} from '../src/phase248_concept_vocabulary.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';

// S80 (principle 8): parts of a request PEE related to nothing it recognised are stated, never silently dropped.
// Synthetic requests written for this test (T1); none is an S80 evaluation request.
test('S80 coverage: an uncovered requirement clause is reported; a covered one is not',()=>{
 const t='Which kettle boils water quickly and stays quiet at night?';
 const u=requestCoverage80(t,{matched:['kettle','boils quickly'],spans:[]});
 assert.deepEqual(u.map(x=>x.span),['and stays quiet at night']);assert.equal(u[0].reason,'not_interpreted');
 assert.deepEqual(requestCoverage80(t,{matched:['kettle','boils quickly','quiet at night'],spans:[]}),[]);
});
test('S80 coverage: a number no constraint consumed is reported; a consumed one (span or value) is not',()=>{
 const t='A toaster for a 12 square metre kitchenette under £40';
 const free=requestCoverage80(t,{matched:['toaster'],spans:['under £40']});
 assert.deepEqual(free.map(x=>[x.span,x.reason]),[['for a 12 square metre kitchenette under £40','quantity_not_checked']]);
 assert.deepEqual(requestCoverage80(t,{matched:['toaster','kitchenette'],spans:[],values:[12,40]}),[]);
});
test('S80 coverage: identifiers, URLs and one-word fragments are not requirements; background sentences are skipped',()=>{
 assert.deepEqual(requestCoverage80('Is the C3240 kettle better than the K200?',{matched:['kettle'],spans:[]}),[],'model codes are not quantities');
 assert.deepEqual(requestCoverage80('Which kettle like https://example.org/k2 boils fast?',{matched:['kettle','boils fast'],spans:[]}),[]);
 const long='I used to own a small café years ago. Which kettle boils quickly?';
 assert.deepEqual(requestCoverage80(long,{matched:['kettle','boils quickly'],spans:[]}),[],'a sentence with nothing recognised in a longer request is background');
});
test('S80 coverage in advice: stated, kept among unassessed objectives, and no false "no requirement stated"',()=>{
 const s=new KnowledgeStore246(':memory:');seedCategoryHypotheses246(s,'air_fryers');
 for(const [id,al] of Object.entries(CONCEPT_VOCABULARY248.air_fryers))s.addConceptAliases246('air_fryers',id,al);
 const a=adviseFromRequest253('I want an air fryer for a narrow windowsill shelf.',s,CATEGORY_REGISTRY250);
 assert.ok(a.uninterpreted?.some(x=>/narrow windowsill shelf/.test(x.span)),JSON.stringify(a.uninterpreted));
 assert.ok(a.unassessedObjectives.some(o=>/narrow windowsill shelf/.test(o)));
 assert.ok(a.statements.some(x=>/^Not interpreted: /.test(x)));
 assert.ok(!a.statements.includes('No checkable requirement is stated yet, so no product can be checked against your needs.'));
});
test('S80 negation: words in the scope of "without" or "not" are never evidence for a need',()=>{
 const s=new KnowledgeStore246(':memory:');seedCategoryHypotheses246(s,'air_fryers');
 for(const [id,al] of Object.entries(CONCEPT_VOCABULARY248.air_fryers))s.addConceptAliases246('air_fryers',id,al);
 // the overlap inference must not turn "without ... X" into a need for X; recognised needs, if any, come from other words
 const a=adviseFromRequest253('Which air fryer works without needing much counter space or cleaning effort?',s,CATEGORY_REGISTRY250);
 const b=adviseFromRequest253('Which air fryer needs counter space and cleaning effort?',s,CATEGORY_REGISTRY250);
 for(const n of a.needs)assert.ok(b.needs.includes(n),'a need inferred only under negation: '+n);
});
// G1c residue (owner authorisation 2026-10-21; evaluation/g1c/preregistration.json residue): a limit stated in a sentence
// of its own was treated as background and lost (33 of 98 limits on the development-only set). Synthetic requests (T1).
test('G1c coverage: a sentence stating a limit is checked even when nothing in it was recognised',()=>{
 const t='Which toaster suits a student flat? Nothing bigger than a microwave, and it must be cheap to run.';
 const u=requestCoverage80(t,{matched:['toaster'],spans:[]}).map(x=>x.span);
 assert.ok(u.some(s=>/Nothing bigger/.test(s)),JSON.stringify(u));assert.ok(u.some(s=>/cheap to run/.test(s)),JSON.stringify(u));
 const bg='I used to own a small café years ago. Which kettle boils quickly?';
 assert.deepEqual(requestCoverage80(bg,{matched:['kettle','boils quickly'],spans:[]}),[],'a narrative sentence with no requirement cue stays background');
});
test('G1c coverage: a one-word limit opened by "without" or "than" is reported',()=>{
 const u=requestCoverage80('Which heater warms the shed without guzzling?',{matched:['heater','warms','shed'],spans:[]});
 assert.deepEqual(u.map(x=>x.span),['without guzzling']);
});
