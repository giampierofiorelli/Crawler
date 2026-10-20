// R3-P stage 2 (owner authorisation 2026-10-20, verbatim in .claude/skills/pee-guided-learning/references/
// owner-r3p-authorisation-2026-10-20.md): the need interpretation with a knowledge-path switch (src/need_interpretation.ts).
// Store: the Phase271 air-purifier and dishwasher teaching plus synthetic translated statements (T1: wiring only; the
// R3-P evaluation material is never used here). What these tests protect:
//  - A and B are one build: the switch changes only needInterpretation.inferred (and what derives from it);
//  - an inferred need never becomes a constraint, an exclusion, a statement or a ranking input;
//  - a negated or indifferent aspect never becomes an inferred need; a feature is never evidence of its outcome;
//  - nothing in the request is dropped silently (the trace lists every clause);
//  - C-lite candidates run only in shadow and never fire on a negated context.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {translateDocument} from '../src/knowledge_translation.js';
import {recordTranslation} from '../src/knowledge_statements.js';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {compileRuleSet} from '../src/knowledge_rules.js';

process.env.PEE_ALLOW_TMP_STORE='1';
const qk=loadQuantityKnowledge();const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
const DOC=['# Night use','','“I cannot tolerate noise when sleeping” is measured by simultaneous low-mode CADR, noise and power.','',
 'A sleep-mode label does not establish quiet operation at a useful clean-air rate.','','“We run it overnight next to the bedroom” bears on: quiet operation during sleep.'].join('\n');
function store(){const s=new KnowledgeStore246(':memory:');registerTeachingSources252(SOURCES271);applyTeaching252(s,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271],'2026-10-17T10:00:00.000Z');
 recordTranslation(s,{categoryId:'air_purifiers',sourceDocument:'synthetic.md',sourceSha256:sha(DOC),translator:'t-test',statements:translateDocument(qk,DOC,{source:'air_purifiers'}).statements},{at:'2026-10-20T00:00:00Z'});return s;}
const S=store();
const ask=(t:string,kg:boolean,candidates:ReturnType<typeof compileRuleSet> extends Map<string,infer P>?P|null:null=null)=>adviseFromRequest253(t,S,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-20',needInterpretation:{knowledgeGuided:kg,candidates}});
const decisionFields=(a:ReturnType<typeof ask>)=>JSON.stringify([a.response,a.category,a.needs,a.constraints,a.excluded,a.shortlist,a.statements,a.questions,a.unassessedObjectives,a.ranked??null]);

test('A and B are one build: the switch changes only the need interpretation, never the answer', ()=>{
 for(const t of ['I need an air purifier quiet enough to sleep next to.','I need an air purifier for my bedroom. I\'m a light sleeper.','A dishwasher under 45 cm wide, we run it overnight.']){
  const a=ask(t,false),b=ask(t,true),plain=adviseFromRequest253(t,S,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-20'});
  assert.equal(decisionFields(a),decisionFields(b),'arms differ only in needInterpretation: '+t);
  assert.equal(decisionFields(a),decisionFields(plain),'the opt-in field changes nothing else: '+t);
  assert.equal(a.needInterpretation!.inferred.length,0,'arm A infers nothing');
  assert.equal(plain.needInterpretation,undefined,'operational answers carry no need interpretation');}
});

test('B: an inferred need is attributable, experimental and anchored in the request\'s own words', ()=>{
 const b=ask('I need an air purifier quiet enough to sleep next to.',true).needInterpretation!;
 for(const i of b.inferred){assert.equal(i.state,'experimental_unverified');assert.ok(i.anchors.length,'anchored');
  assert.ok(i.path.every(p=>p.some(x=>x.step==='statement'&&/^kst_/.test(x.ref))),'every path names a stored statement');}
});

test('a negated or indifferent aspect is never inferred; a feature is not evidence of its outcome', ()=>{
 const b=ask('I need an air purifier for the bedroom, noise doesn\'t bother me.',true).needInterpretation!;
 assert.ok(b.stances.some(s=>s.term==='noise'&&s.stance==='indifferent'));
 assert.ok(!b.inferred.some(i=>/quiet|noise/.test(i.concept)),'no quiet need from an indifferent aspect');
 const f=ask('I want an air purifier with a sleep mode.',true).needInterpretation!;
 assert.ok(f.features.some(x=>x.feature==='mode:sleep'&&/not evidence/.test(x.note)));
});

test('nothing is dropped silently: every clause is in the trace, interpreted or not', ()=>{
 const a=ask('I need an air purifier for my bedroom. I\'m a light sleeper.',false).needInterpretation!;
 assert.ok(a.trace.some(t=>/light sleeper/.test(t.span)),'"I\'m a light sleeper" is listed');
 assert.ok(a.trace.every(t=>t.status==='interpreted'?t.by.length>0:t.by.length===0));
});

test('C-lite candidates never fire on a negated or indifferent context and never change the answer', ()=>{
 const rs=JSON.parse(readFileSync(new URL('../../resources/request-semantics/need-candidates.v1.json',import.meta.url),'utf8'));
 const prog=compileRuleSet(rs).get('need_candidates')!;
 assert.ok(prog.rules.length===0&&prog.experimental.length>0,'every candidate is experimental (shadow only)');
 const on=ask('A dishwasher for the flat, we run it overnight.',true,prog),off=ask('A dishwasher for the flat, not overnight though.',true,prog);
 assert.equal(decisionFields(on),decisionFields(ask('A dishwasher for the flat, we run it overnight.',false)),'candidates change nothing in the answer');
 assert.ok(!(off.needInterpretation!.candidateEffects??[]).length,'a negated context fires no candidate');
});
