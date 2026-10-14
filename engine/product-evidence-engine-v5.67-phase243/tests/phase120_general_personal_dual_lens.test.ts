import {test} from 'node:test';
import assert from 'node:assert/strict';
import {routeGeneralPersonalDualLens120, type Frame120, type ExpertPolicy120} from '../src/phase120_general_personal_dual_lens.js';
import {type Snapshot119, type Robot119, type DirectEndpoint119} from '../src/phase119_task_scope_and_value_gate.js';

const U='https://review.example.org/original';
const date='2026-10-11';
const measure=(task:'vacuum'|'mop',value:number, metricId:string):DirectEndpoint119=>({
  task,metricId,protocolKey:'bench1',unit:'percent',favorable:'higher',
  lower:value,upper:value,evidence:'independent_measured_reviewed',sourceUrl:U
});
const data=(id:string,vac:number|null,mop:number|null,price:number|null,
  lifecycle:Robot119['lifecycle']='orderable_now'):Robot119=>({
  variantId:id,lifecycle,hasMopHardware:mop!==null,hasVacuumHardware:vac!==null,
  functions:[...(vac!==null?[{task:'vacuum' as const,evidence:'documented_product_function' as const,sourceUrl:U}]:[]),
    ...(mop!==null?[{task:'mop' as const,evidence:'documented_product_function' as const,sourceUrl:U}]:[])],
  measurements:[...(vac!==null?[measure('vacuum',vac,'pickup')]:[]),
    ...(mop!==null?[measure('mop',mop,'stain')]:[])],
  price:price===null?null:{amount:price,currency:'EUR',market:'DE',observedDate:date,
    taxIncluded:true,orderable:true,sourceUrl:U}
});
const robots:Robot119[]=[
  data('dry_premium',95,null,700),data('dry_value',81,null,250),
  data('combo_premium',92,91,1100),data('combo_value',82,81,450),
  data('mop_specialist',null,97,520),data('cheap_but_bad',30,25,130),
  data('future_combo',99,99,1000,'announced'),data('unknown_price',84,82,null)
];
const snap:Snapshot119={revision:'r1',market:'DE',currency:'EUR',priceObservedDate:date,variants:robots};
const req=(task:'vacuum'|'mop',metricId:string,minimum:number)=>({task,metricId,minimum,
  protocolKey:'bench1',unit:'percent',favorable:'higher' as const,evidenceUrl:U});
const policy:ExpertPolicy120={policyId:'human_reviewed_example',revision:'rev1',evidenceUrls:[U],lanes:[
  {lane:'vacuum',endpoints:[req('vacuum','pickup',75)],usefulButNonMandatory:['dock_auto_empty']},
  {lane:'mop',endpoints:[req('mop','stain',70)],usefulButNonMandatory:['steam_mop']},
  {lane:'both',endpoints:[req('vacuum','pickup',75),req('mop','stain',70)],usefulButNonMandatory:['dock_auto_empty','steam_mop']}
]};
const general:Frame120={mode:'general',scope:'undecided',requested:'best_performance',
  verification:'independently_reviewed_frame',contextReference:'user explicitly asks overall recommendation',hardHardwareExclusions:[]};
const run=(frame:Frame120=general,p:ExpertPolicy120=policy,s:Snapshot119=snap)=>
  routeGeneralPersonalDualLens120(frame,p,s);
const status=(lane:'vacuum'|'mop'|'both',variantId:string,objective:'best_performance'|'best_value'='best_performance')=>
  run().primary.find(p=>p.lane===lane)?.reviewedEligibility.find(x=>x.variantId===variantId)?.status;

test('explicit general request does not force clarification or invent 2in1 preference',()=>{
  const out=run();assert.equal(out.question,null);assert.deepEqual(out.primary.map(x=>x.lane),['vacuum','mop','both']);
  assert.deepEqual(out.secondary.map(x=>x.lane),['vacuum','mop','both']);
  assert.ok(out.primary.every(x=>x.winner===null));
});
test('general best value has best performance secondary',()=>{
  const out=run({...general,requested:'best_value'});
  assert.ok(out.primary.every(x=>x.objective==='best_value'));
  assert.ok(out.secondary.every(x=>x.objective==='best_performance'));
});
test('personal task restricts to requested scope without made-up preferences',()=>{
  const out=run({...general,mode:'personal',scope:'vacuum'});
  assert.deepEqual(out.primary.map(x=>x.lane),['vacuum']);assert.equal(out.question,null);
});
test('personal undecided asks targeted question while preserving provisional scope views',()=>{
  const out=run({...general,mode:'personal'});
  assert.ok(out.question?.includes('aspirare'));assert.equal(out.primary.length,3);
});
test('non-combined cleaners remain valid within their specialist lane',()=>{
  assert.equal(status('vacuum','dry_value'),'eligible_on_reviewed_endpoints');
  assert.equal(status('mop','mop_specialist'),'eligible_on_reviewed_endpoints');
  assert.equal(status('both','dry_value'),'not_candidate');
  assert.equal(status('both','mop_specialist'),'not_candidate');
});
test('combined devices remain eligible for single tasks',()=>{
  assert.equal(status('vacuum','combo_value'),'eligible_on_reviewed_endpoints');
  assert.equal(status('mop','combo_value'),'eligible_on_reviewed_endpoints');
});
test('cheap model below minimum cannot win value merely for low price',()=>{
  const out=run({...general,requested:'best_value'});
  assert.equal(out.primary.find(x=>x.lane==='both')!.reviewedEligibility.find(x=>x.variantId==='cheap_but_bad')?.status,'fails_reviewed_minimum');
  assert.equal(out.primary.find(x=>x.lane==='both')!.robustPartialDominance.some(x=>x.better==='cheap_but_bad'),false);
});
test('missing price affects value lens only, not measured quality',()=>{
  const out=run();
  assert.equal(out.primary.find(x=>x.lane==='both')!.reviewedEligibility.find(x=>x.variantId==='unknown_price')?.status,'eligible_on_reviewed_endpoints');
  assert.equal(out.secondary.find(x=>x.lane==='both')!.reviewedEligibility.find(x=>x.variantId==='unknown_price')?.status,'not_ready_for_value');
});
test('future announcements not currently eligible even if benchmark numbers supplied',()=>{
  assert.equal(status('both','future_combo'),'not_candidate');
});
test('mandatory outcome missing is insufficient evidence rather than product failure',()=>{
  const p=structuredClone(policy);p.lanes.find(x=>x.lane==='both')!.endpoints=[...p.lanes.find(x=>x.lane==='both')!.endpoints,req('mop','smear',30)];
  const out=run(general,p);assert.equal(out.primary.find(x=>x.lane==='both')!.reviewedEligibility.find(x=>x.variantId==='combo_premium')?.status,'missing_reviewed_endpoint');
});
test('nonmandatory flashy features never confer performance points or eligibility',()=>{
  const p=structuredClone(policy);p.lanes.find(x=>x.lane==='both')!.usefulButNonMandatory=['stair_walking','steam_generator','marketing_ai'];
  const out=run(general,p);assert.deepEqual(out.primary,run().primary);
});
test('thresholds and requirements cannot be omitted as a covert value trick',()=>{
  const p=structuredClone(policy);p.lanes.find(x=>x.lane==='both')!.endpoints=[];
  assert.throws(()=>run(general,p),/policy/);
});
test('combined baseline must cover aspirating and mopping endpoints',()=>{
  const p=structuredClone(policy);p.lanes.find(x=>x.lane==='both')!.endpoints=[req('vacuum','pickup',75)];
  assert.throws(()=>run(general,p),/policy/);
});
test('expert baseline requires verifiable URLs and nonempty revision',()=>{
  const p=structuredClone(policy);p.evidenceUrls=['not-a-url'];assert.throws(()=>run(general,p),/policy/);
});
test('one criterion cannot appear twice in the same policy',()=>{
  const p=structuredClone(policy);p.lanes.find(x=>x.lane==='both')!.endpoints=[...p.lanes.find(x=>x.lane==='both')!.endpoints,req('mop','stain',70)];
  assert.throws(()=>run(general,p),/policy/);
});
test('no silent true absence: unspecified or undocumented outcomes withheld',()=>{
  const copy=structuredClone(snap);copy.variants.find(x=>x.variantId==='combo_value')!.measurements=[];
  const out=run(general,policy,copy);
  assert.equal(out.primary.find(x=>x.lane==='both')!.reviewedEligibility.find(x=>x.variantId==='combo_value')?.status,'missing_reviewed_endpoint');
});
test('known explicit exclusions stay hard in both general and personal mode',()=>{
  const out=run({...general,mode:'personal',scope:'vacuum',hardHardwareExclusions:['exclude_mop_hardware']});
  assert.equal(out.primary[0].reviewedEligibility.find(x=>x.variantId==='combo_premium')?.status,'not_candidate');
  assert.equal(out.primary[0].reviewedEligibility.find(x=>x.variantId==='dry_premium')?.status,'eligible_on_reviewed_endpoints');
});
test('source neutral ordering: input product permutation does not alter results or snapshot key',()=>{
  const copy={...snap,variants:[...snap.variants].reverse()};
  assert.deepEqual(run(general,policy,copy),run());
});
test('same verified intent different language provenance yields identical outcome',()=>{
  const out=run(); const fr={...general,contextReference:'The user explicitly wants general best robot'};
  const other=run(fr); assert.deepEqual({...other},out);
});
test('no full winner claims permitted from partial review data',()=>{
  const out=run();assert.equal(out.publicationReady,false);
  assert.equal(out.winnerClaimAllowed,false);assert.equal(out.autonomousUnderstandingValidated,false);
});
test('missing user evidence frame rejected',()=>{
  assert.throws(()=>run({...general,verification:'unknown' as 'independently_reviewed_frame'}),/unverified_frame/);
});

test('general with expressly specified cleaning scope stays in that lane',()=>{
  const out=run({...general,scope:'both'});
  assert.deepEqual(out.primary.map(x=>x.lane),['both']);assert.equal(out.question,null);
});
test('general no-mop constraint does not illicitly rank mopping panels',()=>{
  const out=run({...general,hardHardwareExclusions:['exclude_mop_hardware']});
  assert.deepEqual(out.primary.map(x=>x.lane),['vacuum']);
});
test('self-contradictory scope and hardware requirement fails closed',()=>{
  assert.throws(()=>run({...general,scope:'mop',hardHardwareExclusions:['exclude_mop_hardware']}),/scope_conflicts/);
});
