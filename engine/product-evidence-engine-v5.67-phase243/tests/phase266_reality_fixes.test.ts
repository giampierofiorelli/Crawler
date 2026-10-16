import test from 'node:test';import assert from 'node:assert/strict';
import {extractConstraints253} from '../src/phase253_request_constraints.js';
import {purchaseTarget253} from '../src/phase248_advisory_journey.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {decideAdvice249,type Candidate249} from '../src/phase249_decision.js';
import {createDecision177,applyDecisionAction177} from '../src/phase177_decision_snapshot.js';
import {normalizeValue245} from '../src/phase245_value_normalizer.js';

// Reality check 2026-10-16: the two corrections measured on the frozen consumer requests (evaluation/phase266).
// Products below are fictional; declarations mimic the shapes found in the store (property + raw value).
const decl=(id:string,property:string,raw:string)=>({declarationId:id,property,rawValue:raw,value:normalizeValue245(raw,property),evidenceRole:'manufacturer_declaration',sourceUrl:null,variantId:null});
const cand=(id:string,ds:ReturnType<typeof decl>[]):Candidate249=>({productId:id,name:id,declarations:ds} as unknown as Candidate249);
const snap=(key:string,value:number,unit:string)=>{let s=createDecision177('t');
 s=applyDecisionAction177(s,{type:'set_scope',source:'user_explicit_confirmation',scope:{category:'coffee_machines',task:'product_selection'}}).snapshot;
 return applyDecisionAction177(s,{type:'set_criterion',source:'user_explicit_confirmation',key,label:key,value:{kind:'quantity',value,unit},priority:'hard'}).snapshot;};

test('fix 1: a water-tank volume is the tank requirement, checked against tank declarations, never against a boiler',()=>{
 assert.deepEqual(extractConstraints253('Looking for an espresso machine with a water tank of at least 1.5 litres.').constraints.map(c=>[c.criterion,c.value,c.unit,c.status]),
  [['water_tank_capacity_min',1.5,'l','stated_in_request']]);
 assert.equal(extractConstraints253('an air fryer of at least 5 litres').constraints[0].criterion,'capacity_min','product capacity is unchanged');
 const a=decideAdvice249({snapshot:snap('water_tank_capacity_min',1.5,'l'),candidates:[
  cand('boiler_only',[decl('d1','Boiler capacity','250 cc'),decl('d2','Water tank capacity','2.7 L')]),
  cand('small_tank',[decl('d3','Water Tank Capacity','1.4L')]),
  cand('generic_label',[decl('d4','Capacity','Water tank 1.9L (64 fl.oz)')]),
  cand('no_tank',[decl('d5','Boiler capacity','800 ml')])]});
 const o=Object.fromEntries(a.checks.map(c=>[c.productId,c.outcome]));
 assert.deepEqual(o,{boiler_only:'meets_all',small_tank:'fails',generic_label:'meets_all',no_tank:'unknown'},'boiler volumes neither satisfy nor fail a tank requirement');
 // Product capacity no longer reads a boiler as the product's capacity.
 const c=decideAdvice249({snapshot:snap('capacity_min',1.5,'l'),candidates:[cand('boiler_only',[decl('d1','Boiler capacity','250 cc')])]});
 assert.equal(c.checks[0].outcome,'unknown');
});

test('fix 2: an article inside the phrase ends the purchase noun phrase; the category is not displaced by a verb phrase',()=>{
 const t=(s:string)=>{const p=purchaseTarget253(s,CATEGORY_REGISTRY250);return [p.kind,p.category];};
 assert.deepEqual(t('Which espresso machine makes the best-tasting traditional Italian espresso for under £600?'),['category','coffee_machines']);
 assert.deepEqual(t('Which air fryer has the biggest basket?'),['category','air_fryers']);
 assert.deepEqual(t('I need a toaster for the office'),['category','toasters']);
 assert.deepEqual(t('Best kettle for a small kitchen'),['category','kettles']);
});
