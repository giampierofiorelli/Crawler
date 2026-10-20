// S103 — request semantics (owner review of S102 and authorisation of 2026-10-20). RQ08 ("two different limits for one
// criterion contradict each other") was wrong in general. The owner's table:
//   at least 4 L and at least 6 L, both mandatory, same object  -> the stricter applies: 6 L
//   at least 4 L, preferably 6 L                                -> a requirement and a preference
//   at least 6 L and at most 4 L, same property and conditions  -> contradiction
//   at least 4 L for one appliance and 6 L for another          -> two distinct requirements
// and the follow-up: "at least 4 litres, or at least 6 for a family" may be two alternative scenarios, never an invented
// preference. Property-based cases use fast-check with seeds recorded in evaluation/s103/property-seeds.json; the
// metamorphic relations are scoped as the owner asked: reordering independent requirements must not change the reading,
// reordering a correction may.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import fc from 'fast-check';
import {extractConstraints253,requestSemanticsRules,type RequestConstraint253} from '../src/phase253_request_constraints.js';
import {evaluate,decide} from '../src/knowledge_rules.js';
import {createDecision177,applyDecisionAction177,type DecisionSnapshot177,type CriterionValue177} from '../src/phase177_decision_snapshot.js';
import {decideAdvice249,type Candidate249} from '../src/phase249_decision.js';

const ROOT=new URL('../../',import.meta.url).pathname;
const SEEDS=JSON.parse(readFileSync(ROOT+'evaluation/s103/property-seeds.json','utf8')) as {seeds:Record<string,number>};
const seed=(name:string)=>{const s=SEEDS.seeds[name];assert.ok(Number.isInteger(s),'seed recorded for '+name);return s;};
const X=(t:string)=>extractConstraints253(t).constraints;
const S=(t:string)=>X(t).map(c=>`${c.criterion}${c.closure==='strict'?'!':''}=${c.value}${c.unit}:${c.status}`);
const applied=(t:string)=>X(t).filter(c=>c.status==='stated_in_request');

test('two mandatory minimums on one object combine to the stricter one', ()=>{
 assert.deepEqual(S('An air fryer of at least 4 litres and at least 6 litres.'),['capacity_min=4l:implied','capacity_min=6l:stated_in_request']);
 const c=X('An air fryer of at least 4 litres and at least 6 litres.');assert.ok(c[0].relations.some(r=>r.kind==='implied_by'));assert.match(c[0].note!,/stricter limit "at least 6 litres"/);
 assert.deepEqual(S('An air fryer between 3 and 5 litres, at least 4 litres.'),['capacity_min=3l:implied','capacity_max=5l:stated_in_request','capacity_min=4l:stated_in_request'],'an interval narrowed by a further minimum');});

test('a requirement and a preference stay distinct', ()=>{
 assert.deepEqual(S('I want an air fryer with at least 4 litres of capacity, possibly at least 6.'),['capacity_min=4l:stated_in_request','capacity_min=6l:preference']);
 assert.deepEqual(S('An air fryer of at least 4 litres, ideally 6 litres.'),['capacity_min=4l:stated_in_request','capacity_min=6l:preference']);
 assert.deepEqual(S("I'd like an air fryer of at least 4 litres."),['capacity_min=4l:stated_in_request'],'"I\'d like" introduces the request; it is not a hedge');
 assert.deepEqual(S('An air fryer of at least 4 litres, preferably at most 3 litres.'),['capacity_min=4l:stated_in_request','capacity_max=3l:preference'],'a preference does not contradict a requirement');});

test('a correction replaces the earlier limit', ()=>{
 assert.deepEqual(S('I need a capacity of at least 4 litres. Actually, make it 6.'),['capacity_min=4l:superseded','capacity_min=6l:stated_in_request']);
 assert.deepEqual(S('A kettle of at least 1.5 litres, I mean at least 1.7 litres.'),['capacity_min=1.5l:superseded','capacity_min=1.7l:stated_in_request']);
 const c=X('I need a capacity of at least 4 litres. Actually, make it 6.');assert.equal(c[0].force,'superseded');assert.deepEqual(c[1].relations,[{kind:'corrects',with:0}]);});

test('alternative scenarios: the bound shared by every scenario applies, the others are asked', ()=>{
 const c=X('An air fryer with at least 4 litres, or at least 6 for a family.');
 assert.deepEqual(c.map(x=>[x.value,x.status,x.scenario]),[[4,'stated_in_request','base'],[6,'candidate','for a family']]);
 assert.match(c[1].question!,/at least 6 l .*should PEE apply it\?/);assert.notEqual(c[1].status,'preference','an alternative is never turned into a preference');
 assert.deepEqual(S('At least 4 litres normally, and at least 6 litres when we have guests.'),['capacity_min=4l:stated_in_request','capacity_min=6l:candidate']);});

test('a minimum above a maximum is a contradiction and both are asked', ()=>{
 const c=X('An air fryer of at least 6 litres and at most 4 litres.');
 assert.deepEqual(c.map(x=>x.status),['candidate','candidate']);assert.match(c[0].question!,/no product can satisfy both/);
 assert.deepEqual(X('An air fryer of at most 4 litres and at least 6 litres.').map(x=>x.status),['candidate','candidate'],'order does not matter');
 assert.deepEqual(S('An air fryer of at least 4 litres and at most 6 litres.'),['capacity_min=4l:stated_in_request','capacity_max=6l:stated_in_request'],'compatible limits are an interval');
 const {combination}=requestSemanticsRules();
 const m=evaluate(combination,{mandatory:[['a'],['b']],frame:[['a','capacity','product','base'],['b','capacity','product','base']],limit:[['a','low','6','inclusive'],['b','high','4','inclusive']]});
 assert.deepEqual(m.all('contradiction').map(f=>f.args).sort(),[['a','b'],['b','a']]);assert.equal(m.all('combines').length,0);});

test('limits for two different products are never combined', ()=>{
 const c=X('I need an air fryer of at least 4 litres, and another one of at least 6 litres for my mother.');
 assert.deepEqual(c.map(x=>[x.value,x.object,x.status]),[[4,'product','stated_in_request'],[6,'other','candidate']]);
 assert.ok(c[0].relations.some(r=>r.kind==='other_object'));
 assert.deepEqual(S('My old one broke, I want another air fryer of at least 4 litres.'),['capacity_min=4l:stated_in_request'],'"another air fryer" alone describes the purchase');
 const {combination}=requestSemanticsRules();
 const m=evaluate(combination,{mandatory:[['a'],['b']],frame:[['a','capacity','product','base'],['b','capacity','other','base']],limit:[['a','low','6','inclusive'],['b','high','4','inclusive']]});
 assert.equal(m.all('contradiction').length,0,'different objects never contradict');assert.equal(m.all('combines').length,0);});

const snap=(key:string,value:CriterionValue177)=>{let s:DecisionSnapshot177=applyDecisionAction177(createDecision177('t'),{type:'set_scope',source:'user_web_control',scope:{category:'air_fryers',task:'product_selection'}}).snapshot;
 return applyDecisionAction177(s,{type:'set_criterion',source:'user_web_control',key,label:'test limit',value,priority:'hard'}).snapshot;};
const product=(n:number):Candidate249=>({productId:'p',name:'Synthetic fryer',declarations:[{declarationId:'d',property:'Capacity',value:{kind:'quantity',number:n,unit:'l',approximate:false} as never,rawValue:`${n} L`,evidenceRole:'manufacturer_declaration',sourceUrl:'https://maker.example/p',variantId:null}]});
const outcome=(key:string,limit:number,strict:boolean,declared:number)=>decideAdvice249({snapshot:snap(key,{kind:'quantity',value:limit,unit:'l',...(strict?{exclusive:true as const}:{})}),candidates:[product(declared)]}).checks[0].checks[0].outcome;

test('strict and inclusive bounds are kept apart and checked strictly', ()=>{
 assert.deepEqual(S('An air fryer of more than 4 litres.'),['capacity_min!=4l:stated_in_request']);
 assert.deepEqual(S('An air fryer of at least 4 litres.'),['capacity_min=4l:stated_in_request']);
 assert.deepEqual(S('An air fryer of less than 4 litres.'),['capacity_max!=4l:stated_in_request']);
 assert.deepEqual(S('An air fryer of 4 litres or less.'),['capacity_max=4l:stated_in_request']);
 assert.equal(outcome('capacity_min',4,true,4),'fails','4 L is not more than 4 L');assert.equal(outcome('capacity_min',4,false,4),'meets');
 assert.equal(outcome('capacity_max',4,true,4),'fails');assert.equal(outcome('capacity_max',4,false,4),'meets');
 assert.deepEqual(S('An air fryer of more than 4 litres and at most 4 litres.').map(x=>x.split(':')[1]),['candidate','candidate'],'an open end at 4 and a closed end at 4 leave no value');
 assert.deepEqual(S('An air fryer of at least 4 litres and at most 4 litres.').map(x=>x.split(':')[1]),['stated_in_request','stated_in_request'],'exactly 4 L');
 assert.match(X('An air fryer under £120.').find(c=>c.criterion==='budget_max')!.closure,/strict/);});

test('between states both ends of an interval', ()=>{
 assert.deepEqual(S('An air fryer between 3 and 5 litres.'),['capacity_min=3l:stated_in_request','capacity_max=5l:stated_in_request']);
 assert.deepEqual(X('An air fryer between 3 and 5 litres.').map(c=>c.closureBasis),['between','between']);
 assert.deepEqual(S('A blender between 800 and 1200 watts.'),['power_min=800W:stated_in_request','power_max=1200W:stated_in_request']);});

test('a space limit is a maximum unless a bound word says otherwise', ()=>{
 assert.deepEqual(S('A dehumidifier that fits a space 40 cm wide.'),['width_max=40cm:stated_in_request']);
 assert.equal(X('A dehumidifier that fits a space 40 cm wide.')[0].closureBasis,'space');
 const {program}=requestSemanticsRules();
 assert.equal(decide(evaluate(program,{reading:[['q','shared','min']],space:[['q']]})).find(d=>d.field==='bound')!.value,'min','an explicit bound outranks the space convention');});

test('units are normalised before limits are compared', ()=>{
 assert.deepEqual(S('A kettle of at least 1500 ml and at least 1.2 litres.'),['capacity_min=1500ml:stated_in_request','capacity_min=1.2l:implied']);
 assert.deepEqual(X('A kettle of at least 1500 ml.').map(c=>c.base),[1.5]);
 assert.deepEqual(X('A kettle of at least 8383 ml.').map(c=>c.base),[8.383],'shrunk counterexample (seed 6091): canonical base value');
 assert.deepEqual(S('A kettle of at least 2 litres and at most 1500 ml.').map(x=>x.split(':')[1]),['candidate','candidate'],'2 L is above 1500 ml');});

test('a preference never becomes a hard requirement (semantic invariant)', ()=>{
 const {combination}=requestSemanticsRules();
 assert.equal(evaluate(combination,{preference:[['c']],mandatory:[['c']]}).all('violation').length,1,'RC10 detects the violation');
 const raw=JSON.parse(readFileSync(ROOT+'resources/request-semantics/request-semantics.v1.json','utf8'));
 const rc10=raw.programs[1].rules.find((r:{id:string})=>r.id==='RC10');assert.equal(rc10.invariant,true);assert.equal(rc10.admission.classification.invariantKind,'semantic');
 fc.assert(fc.property(fc.integer({min:1,max:12}),fc.integer({min:1,max:12}),fc.constantFrom('ideally','preferably','possibly','if possible'),(a,b,h)=>{
  const c=X(`An air fryer of at least ${a} litres, ${h} at least ${b} litres.`);
  const pref=c.filter(x=>x.value===b&&x.start>c[0].start);
  return pref.length===1&&pref[0].status==='preference'&&applied(`An air fryer of at least ${a} litres, ${h} at least ${b} litres.`).every(x=>x.force==='requirement');}),{seed:seed('preference-never-hard'),numRuns:200});});

test('one bound reader reads every phrase of the retired local reader', async ()=>{
 const {loadQuantityKnowledge,findQuantities,quantityBound}=await import('../src/quantity_knowledge.js');const qk=loadQuantityKnowledge();
 const before={min:['at least','minimum','minimum of','min.','min','no less than','not less than','more than','over','above','bigger than','larger than','greater than','upwards of','longer than'],
  max:['at most','maximum','maximum of','max.','max','no more than','not more than','less than','under','below','up to','no bigger than','no larger than','no wider than','no taller than','no higher than','no deeper than','no heavier than','smaller than','lighter than','narrower than','shorter than','within']};
 const after={min:['+','or more','or bigger','or larger','or longer','or above','or higher','minimum','at least'],max:['or less','or smaller','or narrower','or lighter','or shorter','or under','max','maximum','at most','or below']};
 const read=(t:string)=>{const f=findQuantities(qk,t)[0];return quantityBound(qk,t,f.start,f.end,f.unit.kinds).bound;};
 for(const [b,ws] of Object.entries(before))for(const w of ws)assert.equal(read(`I want a kettle ${w} 5 litres.`),b,w);
 for(const [b,ws] of Object.entries(after))for(const w of ws)assert.equal(read(`I want a kettle of 5 litres${w==='+'?'':' '}${w}.`),b,w);
 for(const w of ['wide or less','tall or less','wide max'])assert.equal(read(`a dehumidifier 40 cm ${w}.`),'max',w);
 // documents read the same words (one reader): a declared "max. 60 dB" is an upper bound
 assert.equal(read('Noise: max. 60 dB in boost mode.'),'max');
 assert.equal(read('Runs for 30 min. Then it stops.'),null,'a unit "min" is not a bound word');
 // 'min' after a number is the minute, not a minimum, when a reader passes the number's span alone (7 run times on spent pages)
 const t='Runtime: 40 min.';const at=t.indexOf('40');assert.equal(quantityBound(qk,t,at,at+2,['duration']).bound,null);});

// ---------------------------------------------------------------------------------------------------------------------
// Property-based and metamorphic cases
const key=(cs:RequestConstraint253[])=>cs.map(c=>`${c.criterion}${c.closure==='strict'?'!':''}=${c.value}:${c.status}`).sort();
test('metamorphic: reordering independent requirements does not change the reading', ()=>{
 const clause=fc.record({cap:fc.integer({min:1,max:12}),width:fc.integer({min:20,max:80}),price:fc.integer({min:20,max:400}),weight:fc.integer({min:2,max:20})});
 fc.assert(fc.property(clause,fc.constantFrom(', ',' and ','; '),({cap,width,price,weight},sep)=>{
  const parts=[`at least ${cap} litres`,`no wider than ${width} cm`,`under £${price}`,`a weight of no more than ${weight} kg`];
  const a=key(X(`An air fryer with ${parts.join(sep)}.`)),b=key(X(`An air fryer with ${[...parts].reverse().join(sep)}.`));
  assert.deepEqual(a,b);assert.equal(a.length,4);}),{seed:seed('reorder-independent'),numRuns:150});});

test('metamorphic (scoped): reordering a correction changes which limit applies', ()=>{
 fc.assert(fc.property(fc.integer({min:1,max:12}),fc.integer({min:1,max:12}),(a,b)=>{fc.pre(a!==b);
  const first=applied(`I need at least ${a} litres. Actually, make it ${b}.`),second=applied(`I need at least ${b} litres. Actually, make it ${a}.`);
  assert.deepEqual(first.map(c=>c.value),[b]);assert.deepEqual(second.map(c=>c.value),[a]);}),{seed:seed('reorder-correction'),numRuns:150});});

test('property: two stated limits on one frame contradict exactly when their interval is empty', ()=>{
 fc.assert(fc.property(fc.integer({min:1,max:15}),fc.integer({min:1,max:15}),fc.boolean(),fc.boolean(),(lo,hi,ls,hs)=>{
  const t=`An air fryer of ${ls?'more than':'at least'} ${lo} litres and ${hs?'less than':'at most'} ${hi} litres.`;
  const empty=lo>hi||(lo===hi&&(ls||hs));const st=X(t).map(c=>c.status);
  assert.deepEqual(st,empty?['candidate','candidate']:['stated_in_request','stated_in_request'],t);}),{seed:seed('interval-emptiness'),numRuns:300});});

test('property: two minimums apply the larger, in any unit', ()=>{
 fc.assert(fc.property(fc.integer({min:200,max:9000}),fc.integer({min:1,max:9}),(ml,l)=>{fc.pre(ml!==l*1000);
  const cs=X(`A kettle of at least ${ml} ml and at least ${l} litres.`);const app=cs.filter(c=>c.status==='stated_in_request');
  assert.equal(app.length,1);assert.equal(app[0].base,Math.max(ml/1000,l));assert.equal(cs.filter(c=>c.status==='implied').length,1);}),{seed:seed('two-minimums'),numRuns:200});});

test('property: a strict limit is met only beyond it, an inclusive one at it (Phase249 check)', ()=>{
 fc.assert(fc.property(fc.integer({min:1,max:12}),fc.integer({min:1,max:12}),fc.boolean(),fc.constantFrom('capacity_min','capacity_max'),(limit,declared,strict,key)=>{
  const meets=key==='capacity_min'?(strict?declared>limit:declared>=limit):(strict?declared<limit:declared<=limit);
  assert.equal(outcome(key,limit,strict,declared),meets?'meets':'fails');}),{seed:seed('strict-check'),numRuns:300});});
