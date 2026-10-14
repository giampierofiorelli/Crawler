import {test} from 'node:test';
import assert from 'node:assert/strict';
import {routeCleaningRobotRequest119,type VerifiedNeed119,type Snapshot119,type Robot119,
  type DirectEndpoint119} from '../src/phase119_task_scope_and_value_gate.js';
const site='https://evidence.example.org/original-test';
const dry=(n:number,proto='test_v1'):DirectEndpoint119=>({task:'vacuum',metricId:'dry_pickup_hardfloor',protocolKey:proto,
  unit:'pct',favorable:'higher',lower:n,upper:n,evidence:'independent_measured_reviewed',sourceUrl:site});
const wet=(n:number):DirectEndpoint119=>({task:'mop',metricId:'stain_after_four_passes',protocolKey:'wet_v1',
  unit:'pct',favorable:'higher',lower:n,upper:n,evidence:'independent_measured_reviewed',sourceUrl:site});
const p=(amount:number,date='2026-10-11')=>({amount,currency:'EUR',market:'DE',observedDate:date,
  taxIncluded:true as const,orderable:true as const,sourceUrl:site});
const onlyVac:Robot119={variantId:'dry_only',lifecycle:'orderable_now',functions:[{task:'vacuum',evidence:'documented_product_function',sourceUrl:site}],
  hasMopHardware:false,hasVacuumHardware:true,measurements:[dry(91)],price:p(300)};
const hybrid:Robot119={variantId:'hybrid',lifecycle:'orderable_now',functions:[
  {task:'vacuum',evidence:'documented_product_function',sourceUrl:site},
  {task:'mop',evidence:'documented_product_function',sourceUrl:site}],
  hasMopHardware:true,hasVacuumHardware:true,measurements:[dry(88),wet(90)],price:p(500)};
const onlyMop:Robot119={variantId:'mop_only',lifecycle:'orderable_now',functions:[{task:'mop',evidence:'documented_product_function',sourceUrl:site}],
  hasMopHardware:true,hasVacuumHardware:false,measurements:[wet(92)],price:p(200)};
const snap=(vs:Robot119[]=[onlyVac,hybrid,onlyMop]):Snapshot119=>({revision:'revision_a',market:'DE',currency:'EUR',
  priceObservedDate:'2026-10-11',variants:vs});
const need=(scope:VerifiedNeed119['scope']='undecided',objective:VerifiedNeed119['objective']='best_performance',
  hardHardwareExclusions:VerifiedNeed119['hardHardwareExclusions']=[]):VerifiedNeed119=>({
  category:'robot_floor_cleaner',scope,objective,verification:'independently_reviewed_frame',
  contextReference:'verified-request-fixture',hardHardwareExclusions});
const status=(s:VerifiedNeed119['scope'],name:string,objective:VerifiedNeed119['objective']='best_performance',
  exclusion:VerifiedNeed119['hardHardwareExclusions']=[])=>routeCleaningRobotRequest119(need(s,objective,exclusion),snap()).views[0].candidates.find(x=>x.variantId===name)?.status;

test('best robot with unknown task asks one task question and shows separate cohorts',()=>{
  const r=routeCleaningRobotRequest119(need(),snap());
  assert.equal(r.decision,'clarify_task');assert.equal(r.question!==null,true);
  assert.deepEqual(r.views.map(x=>x.scope),['vacuum','mop','both']);
  assert.equal(r.rankingEligible,false);assert.equal(r.publicationReady,false);
  assert.ok(r.views.every(x=>x.robustDominances.every(d=>d.better!==d.worse)));
});
test('best value with unknown task also cannot invent combined product preference',()=>{
  const r=routeCleaningRobotRequest119(need('undecided','best_value'),snap());
  assert.equal(r.decision,'clarify_task');assert.equal(r.objective,'best_value');
  assert.equal(r.views.length,3);
});
test('vacuum focus allows competent hybrid unless it is explicitly forbidden',()=>{
  assert.equal(status('vacuum','hybrid'),'documented_eligible');
  assert.equal(status('vacuum','hybrid','best_performance',['exclude_mop_hardware']),'excluded_by_hardware');
  assert.equal(status('vacuum','dry_only','best_performance',['exclude_mop_hardware']),'documented_eligible');
});
test('mop focus allows hybrid; a mop-only machine is eligible',()=>{
  assert.equal(status('mop','mop_only'),'documented_eligible');
  assert.equal(status('mop','hybrid'),'documented_eligible');
});
test('two functions require evidence for both, not marketing class name',()=>{
  assert.equal(status('both','hybrid'),'documented_eligible');
  assert.equal(status('both','dry_only'),'excluded_by_task');
  assert.equal(status('both','mop_only'),'excluded_by_task');
});
test('future and prototype machines do not join shopping ranking',()=>{
  const x=structuredClone(hybrid);x.variantId='future';x.lifecycle='announced';
  assert.equal(routeCleaningRobotRequest119(need('both'),snap([x])).views[0].candidates[0].status,'not_orderable');
});
test('advertised-only function stays unverified',()=>{
  const x=structuredClone(hybrid);x.functions=[{task:'vacuum',evidence:'documented_product_function',sourceUrl:site},
    {task:'mop',evidence:'advertised_only',sourceUrl:site}];
  assert.equal(routeCleaningRobotRequest119(need('both'),snap([x])).views[0].candidates[0].status,'function_only_advertised');
});
test('manufacturer performance assertion cannot make another product dominated',()=>{
  const a=structuredClone(onlyVac),b=structuredClone(onlyVac);a.variantId='a';b.variantId='b';
  b.measurements=[{...dry(99),evidence:'manufacturer_claim'}];
  const r=routeCleaningRobotRequest119(need('vacuum'),snap([a,b]));
  assert.deepEqual(r.views[0].robustDominances,[]);
  assert.deepEqual(r.views[0].unresolvedPairs,[['a','b']]);
});
test('best performance can record matching-protocol strict dominance only',()=>{
  const a=structuredClone(onlyVac),b=structuredClone(onlyVac);a.variantId='a';b.variantId='b';
  b.measurements=[dry(50)];
  const r=routeCleaningRobotRequest119(need('vacuum'),snap([b,a]));
  assert.deepEqual(r.views[0].robustDominances,[{better:'a',worse:'b',basis:'performance'}]);
});
test('cheaper machine dominates in value only if not worse on matched outcomes',()=>{
  const a=structuredClone(onlyVac),b=structuredClone(onlyVac);a.variantId='a';b.variantId='b';
  a.price=p(200);b.price=p(500);
  assert.deepEqual(routeCleaningRobotRequest119(need('vacuum','best_value'),snap([a,b])).views[0].robustDominances,
    [{better:'a',worse:'b',basis:'price_and_performance'}]);
});
test('cheaper but worse performance is a real tradeoff, not an automatic value winner',()=>{
  const a=structuredClone(onlyVac),b=structuredClone(onlyVac);a.variantId='a';b.variantId='b';
  a.price=p(200);a.measurements=[dry(70)];b.price=p(500);b.measurements=[dry(99)];
  assert.deepEqual(routeCleaningRobotRequest119(need('vacuum','best_value'),snap([a,b])).views[0].robustDominances,[]);
});
test('a price missing in value mode is an evidence gap, not bad value',()=>{
  const a=structuredClone(onlyVac);a.price=null;
  assert.equal(routeCleaningRobotRequest119(need('vacuum','best_value'),snap([a])).views[0].candidates[0].status,'missing_price');
});
test('different price observation date disqualifies a same-day value comparison',()=>{
  const a=structuredClone(onlyVac);a.price=p(200,'2026-09-01');
  assert.equal(routeCleaningRobotRequest119(need('vacuum','best_value'),snap([a])).views[0].candidates[0].status,'incompatible_price');
});
test('protocol versions cannot be silently combined for dominance',()=>{
  const a=structuredClone(onlyVac),b=structuredClone(onlyVac);a.variantId='a';b.variantId='b';b.measurements=[dry(30,'test_v2')];
  assert.deepEqual(routeCleaningRobotRequest119(need('vacuum'),snap([a,b])).views[0].unresolvedPairs,[['a','b']]);
});
test('same candidate set and revised evidence invariant under input reordering',()=>{
  const r=routeCleaningRobotRequest119(need('undecided','best_value'),snap([hybrid,onlyMop,onlyVac]));
  const x=routeCleaningRobotRequest119(need('undecided','best_value'),snap([onlyVac,hybrid,onlyMop]));
  assert.deepEqual(r,x);
});
test('absolute missing source metadata rejected',()=>{
  const x=structuredClone(hybrid);x.functions=[{task:'mop',evidence:'documented_product_function',sourceUrl:null}];
  assert.throws(()=>routeCleaningRobotRequest119(need(),snap([x])));
});
test('incompatible currency or market rejected',()=>{
  const x=structuredClone(hybrid);x.price={...p(400),currency:'GBP'};
  assert.throws(()=>routeCleaningRobotRequest119(need('both','best_value'),snap([x])));
});
test('unknown hardware cannot satisfy an explicit hardware exclusion',()=>{
  const x=structuredClone(onlyVac);x.hasMopHardware='unknown';
  assert.equal(routeCleaningRobotRequest119(need('vacuum','best_performance',['exclude_mop_hardware']),snap([x])).views[0].candidates[0].status,
    'excluded_by_hardware');
});
test('user confirmation reference and contradicted exclusion policy required',()=>{
  assert.throws(()=>routeCleaningRobotRequest119({...need(),contextReference:'x'},snap()));
  assert.throws(()=>routeCleaningRobotRequest119(need('both','best_value',['exclude_mop_hardware','exclude_vacuum_hardware']),snap()));
});
test('uncertain bounds can prevent a claimed quality dominance',()=>{
  const a=structuredClone(onlyVac),b=structuredClone(onlyVac);a.variantId='a';b.variantId='b';
  a.measurements=[{...dry(94),lower:89,upper:97}];b.measurements=[{...dry(91),lower:85,upper:95}];
  assert.deepEqual(routeCleaningRobotRequest119(need('vacuum'),snap([a,b])).views[0].robustDominances,[]);
});
test('a missing mop measurement prevents full combined quality dominance',()=>{
  const a=structuredClone(hybrid),b=structuredClone(hybrid);a.variantId='a';b.variantId='b';
  a.measurements=[dry(99),wet(99)];b.measurements=[dry(80)];
  assert.deepEqual(routeCleaningRobotRequest119(need('both'),snap([a,b])).views[0].unresolvedPairs,[['a','b']]);
});

test('explicit hardware exclusions must not conflict with the requested task',()=>{
  assert.throws(()=>routeCleaningRobotRequest119(need('both','best_performance',['exclude_mop_hardware']),snap()));
  assert.throws(()=>routeCleaningRobotRequest119(need('vacuum','best_performance',['exclude_vacuum_hardware']),snap()));
});
