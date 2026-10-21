// G1 integration fixes (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
// owner-g1-authorisation-2026-10-21.md; defects found in docs/plans/architectural-review-goal-first.md §3 and the G1
// diagnosis E1/E3). Each test reproduced its defect before the fix. What they protect:
//  F1 nothing the shopper states is dropped silently when no category is established: stated limits are kept and the
//     unrecognised goal is reported as not assessed;
//  F2 a function word ("what can I do") is never read as the name of an unknown product;
//  F3 a clarification always carries at least one question;
//  F4 a no-purchase alternative is never offered as one of the product's goals;
//  F5 a category the store teaches is recognised by its own name even when the code registry omits it;
//  F6 knowledge gaps raise typed research needs also without a category (pending authorisation, never a live read).
// Not fixed here (diagnosis E1, stopped with the representation part): when a problem is described, the category's stored
// no-purchase alternatives are still raised only when named; deciding which apply needs situation -> strategy links.
import test from 'node:test';
import assert from 'node:assert/strict';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {DEHUMIDIFIER_TEACHING271} from '../src/phase270_teaching.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {researchNeedsFromAdvice254} from '../src/phase254_research_needs.js';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {PHASE257_NEED_KINDS} from '../src/phase257_research_planning.js';

process.env.PEE_ALLOW_TMP_STORE='1';
const qk=loadQuantityKnowledge();
registerTeachingSources252(SOURCES271);
const S=new KnowledgeStore246(':memory:');applyTeaching252(S,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,DEHUMIDIFIER_TEACHING271],'2026-10-17T10:00:00.000Z');
const advise=(t:string,s=S)=>adviseFromRequest253(t,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});

test('F1: without a category, a stated budget and the goal are kept, not dropped', ()=>{
 const a=advise('I need something to keep my small flat dry, under 200 pounds');
 assert.equal(a.category,null);
 const kept=a.constraints.some(c=>/200/.test(String(c.span)))||a.unassessedObjectives.some(o=>/200/.test(o));
 assert.ok(kept,'the budget is kept as a stated limit or reported as not assessed');
 assert.ok(a.unassessedObjectives.some(o=>/dry/.test(o))||a.statements.some(s=>/dry/.test(s)),'the goal is reported, not dropped');
});

test('F2: "what can I do" is not an unknown product', ()=>{
 const a=advise('The air in my flat feels stuffy and I get headaches. What can I do?');
 assert.ok(!a.statements.some(s=>/"can i"/i.test(s)),'no product named "can i"');
 assert.notEqual(a.response,'out_of_scope');
});

test('F3: a clarification always asks something', ()=>{
 for(const t of ['My bedroom walls have black mould from condensation','I want crispy chips without much oil','Which kind of thing would help me?']){
  const a=advise(t);if(a.response==='clarification')assert.ok(a.questions.length>=1,`clarification without a question: ${t}`);}
});

test('F4: no-purchase alternatives are not offered as product goals', ()=>{
 const a=advise('Which dehumidifier should I buy?');
 for(const q of a.questions)assert.ok(!/leak|rain penetration|repair/i.test(q),`alternative offered as a goal: ${q}`);
});

test('F5: a category the store teaches is recognised by its own name when the code registry omits it', ()=>{
 const s=new KnowledgeStore246(':memory:');
 applyTeaching252(s,[{...DISHWASHER_TEACHING271,categoryId:'clothes_airers',version:'g1.test'}],'2026-10-17T10:00:00.000Z');
 assert.ok(!CATEGORY_REGISTRY250.some(r=>r.id==='clothes_airers'));
 const a=advise('Which clothes airer should I buy for a small flat?',s);
 assert.equal(a.category,'clothes_airers');
});

test('F6: a gap without a category raises a typed research need, pending authorisation', ()=>{
 const a=advise('Which washing machine is quietest for a flat?');
 assert.equal(a.category,null);
 const needs=researchNeedsFromAdvice254(a,S);
 assert.ok(needs.length>=1,'a research need is raised');
 for(const n of needs){assert.ok(['research','user_clarification'].includes(n.destination));if(n.destination==='research')assert.equal(n.status,'pending_authorization');}
 assert.ok(needs.some(n=>n.kind==='missing_category_knowledge'));
 // Phase257 network-read authorisations are unchanged: these kinds can never become a planned job
 for(const k of ['missing_category_knowledge','missing_need_knowledge'])assert.ok(!(PHASE257_NEED_KINDS as readonly string[]).includes(k));
});
