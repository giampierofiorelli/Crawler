// G1 diagnosis (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
// owner-g1-authorisation-2026-10-21.md; preregistration evaluation/g1/preregistration.json). The E2-E5 switches of
// goal understanding C exist only for counterfactual diagnosis on store copies. What these tests protect:
//  - with no switch, C behaves exactly as c.1 (the frozen I3 behaviour);
//  - each switch changes only its own mechanism: alternatives as their own strategies (E2), the family list read from
//    the store (E3), roles supplied by an oracle (E5);
//  - C stays shadow under every switch: the answer is unchanged.
import test from 'node:test';
import assert from 'node:assert/strict';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {goalUnderstandingC} from '../src/goal_understanding_c.js';

process.env.PEE_ALLOW_TMP_STORE='1';
const qk=loadQuantityKnowledge();
const S=new KnowledgeStore246(':memory:');registerTeachingSources252(SOURCES271);applyTeaching252(S,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271],'2026-10-17T10:00:00.000Z');
const advise=(t:string)=>adviseFromRequest253(t,S,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});
const T=['I sneeze all day at home because of pollen and pet dander, my eyes itch.','The flat feels stuffy and I get headaches; there is a smoker next door.',
 'We already have a dishwasher; I am looking for an air purifier for the bedroom.'];

test('no switch: C is exactly c.1', ()=>{
 for(const t of T){const a=advise(t);assert.deepEqual(goalUnderstandingC(t,a,S,{qk,diag:{}}),goalUnderstandingC(t,a,S,{qk}));}
});

test('E2: an alternative stands as its own strategy and no longer supports the family it is stored under', ()=>{
 const t='The flat feels stuffy and I get headaches; there is a smoker next door.';const a=advise(t);
 const own=goalUnderstandingC(t,a,S,{qk,diag:{strategyScope:'own'}});
 assert.ok(own.hypotheses.every(h=>!h.family.startsWith('strategy:')||/_(?:alternative|constraint)$/.test(h.family)));
 for(const h of own.hypotheses.filter(h=>!h.family.startsWith('strategy:')))
  assert.ok(h.support.every(s=>!/alternative|constraint/.test(s.ref)||s.kind!=='concept'),'host family not supported by its alternatives');
});

test('E3 and E5: store family list and oracle roles change only their own mechanism; C stays shadow', ()=>{
 const t='We already have a dishwasher; I am looking for an air purifier for the bedroom.';const before=JSON.stringify(advise(t));const a=advise(t);
 const store=goalUnderstandingC(t,a,S,{qk,diag:{families:'store'}});
 assert.ok(store.hypotheses.every(h=>['dishwashers','air_purifiers'].includes(h.family)),'only taught families of this store');
 const oracle=goalUnderstandingC(t,a,S,{qk,diag:{oracleRoles:new Map([['dishwashers','owned'],['air_purifiers','requested']])}});
 assert.equal(oracle.requested,'air_purifiers');assert.ok(oracle.objects.filter(o=>o.family==='dishwashers').every(o=>o.role==='owned'));
 assert.equal(JSON.stringify(advise(t)),before);
});
