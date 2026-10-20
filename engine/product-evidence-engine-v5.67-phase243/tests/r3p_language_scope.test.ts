// R3-P stage 1 (owner authorisation 2026-10-20, verbatim in .claude/skills/pee-guided-learning/references/
// owner-r3p-authorisation-2026-10-20.md): one mechanism for clause boundaries, negation scope, polarity and contrast,
// shared by requests and documents (src/language_scope.ts, vocabulary in the quantity-knowledge pack language.en.scope).
// The owner's distinctions:
//   "nothing over 6 L"            -> maximum 6 L, inclusive
//   "more than 6 L"               -> strict minimum
//   "not less than 6 L"           -> inclusive minimum
//   "I don't need more than 6 L"  -> no mandatory maximum from that phrase alone
//   "noise doesn't bother me"     -> no quiet-operation requirement
//   "measured values, not manufacturer claims" -> attribution and contrast in their proper scope
// Development fixtures only (written by the implementer); the sealed R3-P material is never used here.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import fc from 'fast-check';
import {negationAt,stanceAt,clauseAround,maskNegated,scopeVocabulary} from '../src/language_scope.js';
import {extractConstraints253} from '../src/phase253_request_constraints.js';
import {loadQuantityKnowledge,quantityBound,findQuantities} from '../src/quantity_knowledge.js';
import {DECLARATION_CUE272,TEST_CONTEXT272} from '../src/phase272_extraction_plan.js';

const ROOT=new URL('../../',import.meta.url).pathname;
const SEEDS=JSON.parse(readFileSync(ROOT+'evaluation/r3p/property-seeds.json','utf8')) as {seeds:Record<string,number>};
const seed=(name:string)=>{const s=SEEDS.seeds[name];assert.ok(Number.isInteger(s),'seed recorded for '+name);return s;};
const C=(t:string)=>extractConstraints253(t).constraints.map(c=>`${c.criterion}=${c.value}:${c.status}:${c.closure}`);

test('the owner\'s distinctions: negation of a bound, of a requirement, and plain bounds', ()=>{
 assert.deepEqual(C('An air fryer, nothing over 6 L'),['capacity_max=6:stated_in_request:inclusive'],'nothing over 6 L: at most 6 L');
 assert.deepEqual(C('An air fryer of more than 6 L'),['capacity_min=6:stated_in_request:strict']);
 assert.deepEqual(C('An air fryer of not less than 6 L'),['capacity_min=6:stated_in_request:inclusive']);
 assert.deepEqual(C('I don\'t need more than 6 L'),['capacity_max=6:preference:inclusive'],'a negated need is a preference: reported, never applied');
 assert.deepEqual(C('It doesn\'t have to be wider than 60 cm'),['width_max=60:preference:inclusive']);
 assert.deepEqual(C('nothing bigger than 30 cm wide'),['width_max=30:stated_in_request:inclusive'],'a negated comparative is read by the same scope');
 assert.deepEqual(C('never above 2 kg in weight'),['weight_max=2:stated_in_request:inclusive']);
 assert.deepEqual(C('not under 4 litres'),['capacity_min=4:stated_in_request:inclusive'],'not(under 4) is at least 4');
});

test('negation that does not touch the limit leaves it alone (contrast, clause break, number, fixed phrases)', ()=>{
 assert.deepEqual(C('I\'m not sure, but at least 4 litres'),['capacity_min=4:stated_in_request:inclusive']);
 assert.deepEqual(C('Not only cheap: at least 4 litres'),['capacity_min=4:stated_in_request:inclusive']);
 assert.deepEqual(C('No idea about brands. At least 4 litres'),['capacity_min=4:stated_in_request:inclusive']);
 assert.deepEqual(C('At least 4 litres but nothing over 6L'),['capacity_min=4:stated_in_request:inclusive','capacity_max=6:stated_in_request:inclusive'],'each bound has its own scope');
});

test('the shared scope: clause, negator, kind', ()=>{
 const v=scopeVocabulary();const t='nothing over 6 L, but at least 4 L';
 assert.equal(negationAt(t,t.indexOf('over'),v)?.kind,'proposition');
 assert.equal(negationAt(t,t.indexOf('at least'),v),null,'the contrast marker ends the scope');
 assert.equal(negationAt("I don't need more than 6 L",12,v)?.kind,'requirement');
 assert.equal(negationAt('not the 40 dB the maker claims',27,v),null,'a number ends the scope: the relative clause is not negated');
 assert.equal(negationAt('not loud and cheap',13,v),null,'a scope ender ends the scope');
 assert.deepEqual(clauseAround('quiet, but noise doesn\'t bother me',12,17,v).text.trim(),'noise doesn\'t bother me');
});

test('stances: indifference and negation of a term, never across a contrast or beyond the predicate\'s arguments', ()=>{
 const st=(t:string,w:string)=>{const i=t.indexOf(w);return stanceAt(t,i,i+w.length)?.stance??null;};
 assert.equal(st('noise doesn\'t bother me','noise'),'indifferent');
 assert.equal(st('I\'m not fussed about wifi','wifi'),'indifferent');
 assert.equal(st('wifi isn\'t important to me','wifi'),'indifferent');
 assert.equal(st('I don\'t want wifi','wifi'),'negated');
 assert.equal(st('noise doesn\'t bother me but it must be cheap','cheap'),null,'a contrast ends the clause');
 assert.equal(st('I want it quiet','quiet'),null);
});

test('documents: a denied cue is not a cue; a denied claim is never turned into a measurement', ()=>{
 const m=(t:string)=>maskNegated(t,[DECLARATION_CUE272]).text;
 assert.ok(!DECLARATION_CUE272.test(m('These are our measurements, not the manufacturer\'s figures')));
 assert.ok(!DECLARATION_CUE272.test(m('real everyday use numbers, and not what manufacturers claim')));
 assert.ok(DECLARATION_CUE272.test(m('We measured 46 dB, not the 40 dB the maker claims')),'the claim about 40 dB stays a claim');
 assert.ok(DECLARATION_CUE272.test(m('The maker claims 40 dB, but we measured 46 dB')));
 assert.equal(m('not independently verified; the maker claims 300').length,'not independently verified; the maker claims 300'.length,'offsets are kept');
 // development finding (spent S93 page, 2026-10-20): a negated observation is still the publisher's observation; only an
 // adjacent negation removes a test cue ("did not test", "not measured")
 const mt=(t:string)=>maskNegated(t,[],undefined,[TEST_CONTEXT272]).text;
 assert.ok(TEST_CONTEXT272.test(mt('We did not notice any electronic noises form our unit.')),'the test cue survives a negation four words away');
 assert.ok(!TEST_CONTEXT272.test(mt('These are not our measurements.'))||!/our measurements/.test(mt('These are not our measurements.')),'an adjacent negation removes it');
});

test('the shared bound reader reports the negation it applied (documents read the same scope)', ()=>{
 const qk=loadQuantityKnowledge();const t='We saw nothing over 45 dB in quiet mode';const q=findQuantities(qk,t)[0];
 const b=quantityBound(qk,t,q.start,q.end,q.unit.kinds);
 assert.equal(b.bound,'max');assert.equal(b.negation?.kind,'proposition');
});

test('property: a negator before a contrast marker never changes the bound after it (metamorphic, scoped)', ()=>{
 fc.assert(fc.property(fc.integer({min:1,max:40}),fc.constantFrom('at least','more than','up to','under','no more than'),fc.constantFrom('I\'m not sure','not a big deal','no idea','I don\'t know'),
  (n,cue,neg)=>{const plain=C(`${cue} ${n} litres`);const prefixed=C(`${neg}, but ${cue} ${n} litres`);assert.deepEqual(prefixed,plain);}),{seed:seed('negation-before-contrast'),numRuns:200});
});

test('property: negating a bound twice gives back the bound (not under N = at least N; nothing over N = at most N)', ()=>{
 fc.assert(fc.property(fc.integer({min:1,max:40}),(n)=>{
  assert.deepEqual(C(`not under ${n} litres`),C(`at least ${n} litres`));
  assert.deepEqual(C(`nothing over ${n} litres`),C(`at most ${n} litres`));}),{seed:seed('double-negation'),numRuns:100});
});
