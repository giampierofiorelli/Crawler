import {test} from 'node:test';
import assert from 'node:assert/strict';
import {routeGeneralPersonalDualLens120, type Frame120,type ExpertPolicy120} from '../src/phase120_general_personal_dual_lens.js';
import {attachReviewedAutonomyLens121,type AutonomyProtocol121,type AutonomyRecord121,
  type AutonomyMetric121,type AutonomyMeasurement121} from '../src/phase121_autonomy_workload_comparison.js';
import {type Snapshot119,type Robot119,type DirectEndpoint119} from '../src/phase119_task_scope_and_value_gate.js';
const U='https://www.rtings.com/robot-vacuum/tests/obstacle-avoidance';
const task='vacuum' as const;
const measure=(score:number):DirectEndpoint119=>({task,metricId:'pickup',protocolKey:'fictional_lab',unit:'percent',favorable:'higher',lower:score,upper:score,evidence:'independent_measured_reviewed',sourceUrl:U});
const robot=(variantId:string,quality:number):Robot119=>({variantId,lifecycle:'orderable_now',hasMopHardware:false,hasVacuumHardware:true,
  functions:[{task,evidence:'documented_product_function',sourceUrl:U}],measurements:[measure(quality)],price:{amount:300,currency:'EUR',market:'DE',observedDate:'2026-10-11',taxIncluded:true,orderable:true,sourceUrl:U}});
const snap:Snapshot119={revision:'fixture123',market:'DE',currency:'EUR',priceObservedDate:'2026-10-11',variants:[robot('alpha',85),robot('beta',85),robot('gamma',85),robot('poor',35),robot('unknown',85)]};
const basic={task,metricId:'pickup',protocolKey:'fictional_lab',unit:'percent',favorable:'higher' as const,minimum:70,evidenceUrl:U};
const quality:ExpertPolicy120={policyId:'constructed_quality',revision:'v1',evidenceUrls:[U],lanes:[
  {lane:'vacuum',endpoints:[basic],usefulButNonMandatory:[]},
  {lane:'mop',endpoints:[{...basic,task:'mop',metricId:'stain'}],usefulButNonMandatory:[]},
  {lane:'both',endpoints:[basic,{...basic,task:'mop',metricId:'stain'}],usefulButNonMandatory:[]}
]};
const user:Frame120={mode:'general',verification:'independently_reviewed_frame',contextReference:'human verified vacuum-only need',
 requested:'best_performance',scope:'vacuum',hardHardwareExclusions:[]};
const frame=()=>routeGeneralPersonalDualLens120(user,quality,snap);
const definitions:Record<AutonomyMetric121,{unit:AutonomyMeasurement121['unit'];favorable:AutonomyMeasurement121['favorable']}>= {
  unattended_completion_fraction:{unit:'fraction',favorable:'higher'},
  rescue_interventions_per_100_runs:{unit:'events_per_100_runs',favorable:'lower'},
  routine_human_minutes_per_30_days:{unit:'minutes_per_30_days',favorable:'lower'},
  unplanned_human_minutes_per_30_days:{unit:'minutes_per_30_days',favorable:'lower'},
  preparation_human_minutes_per_run:{unit:'minutes_per_run',favorable:'lower'}
};
const reqs=(Object.entries(definitions) as [AutonomyMetric121,{unit:AutonomyMeasurement121['unit'];favorable:AutonomyMeasurement121['favorable']}][])
  .filter(([name])=>name!=='preparation_human_minutes_per_run').map(([metric,v])=>({metric,...v}));
const policy:AutonomyProtocol121={policyId:'reviewed_example',revision:'r1',sourceUrls:[U],
  protocolId:'constructed_protocol',protocolRevision:'r1',conditionsKey:'constructed_hardfloor_no_pets',
  lane:'vacuum',minObservedDays:30,minScheduledRuns:20,required:reqs};
const metric=(id:string,m:AutonomyMetric121,value:number,lower=value,upper=value):AutonomyMeasurement121=>({
  metric:m,...definitions[m],lower,upper,evidence:'independent_measured_reviewed',
  sourceUrl:U,verifiedSkuBinding:true,sourceVariantId:id
});
const record=(variantId:string,v:[number,number,number,number]):AutonomyRecord121=>({
  variantId,lane:'vacuum',protocolId:policy.protocolId,protocolRevision:policy.protocolRevision,
  conditionsKey:policy.conditionsKey,observationDays:30,scheduledRuns:30,
  measurements:reqs.map((d,i)=>metric(variantId,d.metric,v[i])),declaredAutomationFeatures:[]
});
const data=():AutonomyRecord121[]=>[
  record('alpha',[.98,1,4,1]),record('beta',[.80,8,14,6]),record('gamma',[.98,0,19,1]),record('poor',[1,0,0,0])
];
const run=(records:readonly AutonomyRecord121[]=data(),p:AutonomyProtocol121=policy)=>attachReviewedAutonomyLens121(frame(),[p],records);
const eligibility=(id:string,records:AutonomyRecord121[]=data())=>run(records).lanes[0].evaluated.find(x=>x.variantId===id)?.status;

test('autonomy is its own lens, retaining both performance and value alternatives',()=>{
  const out=run();assert.equal(out.autonomyPrimary,true);assert.deepEqual(out.secondaryBestAndValue,[{lane:'vacuum',performanceObjective:'best_performance',valueObjective:'best_value'}]);
});
test('reviewed quality floor prevents empty-but-ineffective robot from winning',()=>{
  assert.equal(eligibility('poor'),'fails_quality_floor');
  assert.ok(!run().lanes[0].robustPartialDominance.some(x=>x.better==='poor'));
});
test('observed interventions and maintenance produce strict comparable dominance',()=>{
  assert.deepEqual(run().lanes[0].robustPartialDominance,[{better:'alpha',worse:'beta'}]);
});
test('different automation tradeoffs have no fabricated numeric tie-breaker',()=>{
  assert.deepEqual(run().lanes[0].tradeoffPairs,[['alpha','gamma'],['beta','gamma']]);
});
test('no full autonomy winner claim even when partial dominance exists',()=>{
  assert.equal(run().lanes[0].winner,null);assert.equal(run().publicationReady,false);
});
test('unevaluated product remains missing evidence rather than bad autonomy',()=>{
  assert.equal(eligibility('unknown'),'missing_autonomy_evidence');
});
test('a manufacturer claim cannot replace observed minutes or intervention rates',()=>{
  const r=data();r[0].measurements=[...r[0].measurements.slice(0,2),{...r[0].measurements[2],evidence:'manufacturer_claim'},r[0].measurements[3]];
  assert.equal(eligibility('alpha',r),'ambiguous_or_unverified_measurement');
});
test('feature-rich metadata does not change ranking',()=>{
  const r=data();r[1].declaredAutomationFeatures=[{name:'steam_refill_wash_dock',sourceUrl:U,evidence:'manufacturer_claim'}];
  assert.deepEqual(run(r).lanes,run().lanes);
});
test('missing routine maintenance is unknown, never assumed zero',()=>{
  const r=data();r[0].measurements=r[0].measurements.filter(x=>x.metric!=='routine_human_minutes_per_30_days');
  assert.equal(eligibility('alpha',r),'missing_autonomy_evidence');
});
test('short expo demo cannot prove low-intervention 30-day autonomy',()=>{
  const r=data();r[0].observationDays=1;r[0].scheduledRuns=1;
  assert.equal(eligibility('alpha',r),'insufficient_observation_horizon');
});
test('different protocol revision not harmonized from same-looking units',()=>{
  const r=data();r[0].protocolRevision='v2';
  assert.equal(eligibility('alpha',r),'incompatible_autonomy_protocol');
});
test('different home conditions cannot silently be pooled',()=>{
  const r=data();r[0].conditionsKey='constructed_pet_hair_carpets';
  assert.equal(eligibility('alpha',r),'incompatible_autonomy_protocol');
});
test('different cleaning tasks cannot silently be compared',()=>{
  const r=data();r[0].lane='both';
  assert.throws(()=>run(r),/unexpected_product_or_lane/);
});
test('mismatched SKU evidence binding is explicitly blocked',()=>{
  const r=data();r[0].measurements=[{...r[0].measurements[0],sourceVariantId:'beta'},...r[0].measurements.slice(1)];
  assert.equal(eligibility('alpha',r),'ambiguous_or_unverified_measurement');
});
test('unadjudicated source identity is blocked',()=>{
  const r=data();r[0].measurements=[{...r[0].measurements[0],verifiedSkuBinding:false},...r[0].measurements.slice(1)];
  assert.equal(eligibility('alpha',r),'ambiguous_or_unverified_measurement');
});
test('unknown source outside reviewed policy cannot be treated as independent evidence',()=>{
  const r=data();r[0].measurements=[{...r[0].measurements[0],sourceUrl:'https://advertising.example.org'},...r[0].measurements.slice(1)];
  assert.equal(eligibility('alpha',r),'ambiguous_or_unverified_measurement');
});
test('duplicate observations are ambiguous, not cherry-picked',()=>{
  const r=data();r[0].measurements=[...r[0].measurements,r[0].measurements[0]];
  assert.equal(eligibility('alpha',r),'ambiguous_or_unverified_measurement');
});
test('overlapping uncertainty intervals block dominance',()=>{
  const r=data();r[0].measurements=[metric('alpha','unattended_completion_fraction',.95,.74,1),...r[0].measurements.slice(1)];
  assert.ok(run(r).lanes[0].unresolvedPairs.some(pair=>pair.join('|')==='alpha|beta'));
});
test('identical observed outcomes produce unresolved indistinguishability, not a forced winner',()=>{
  const r=data();r[1]=record('beta',[.98,1,4,1]);
  assert.ok(run(r).lanes[0].unresolvedPairs.some(pair=>pair.join('|')==='alpha|beta'));
});
test('different input order does not change comparison or hash',()=>{
  const r=data();assert.deepEqual(run(r.reverse()),run());
});
test('equivalent human-verified general and personal intents do not rewrite observed evidence',()=>{
  const base=run();const personal=routeGeneralPersonalDualLens120({...user,mode:'personal'},quality,snap);
  const output=attachReviewedAutonomyLens121(personal,[policy],data());
  assert.deepEqual(output.lanes,base.lanes);
});
test('qualitative obstacle avoidance result cannot substitute numeric rescue observations',()=>{
  const r=data();r[0].measurements=[{...r[0].measurements[1],evidence:'reviewer_qualitative'},...r[0].measurements.filter(x=>x.metric!=='rescue_interventions_per_100_runs')];
  assert.equal(eligibility('alpha',r),'ambiguous_or_unverified_measurement');
});
test('negative workload and impossible completion rates are rejected',()=>{
  const r=data();r[0].measurements=[{...r[0].measurements[0],lower:1.1,upper:1.1},...r[0].measurements.slice(1)];
  assert.throws(()=>run(r),/invalid_autonomy_record/);
});
test('meaningless 0-day sample is rejected by research policy horizon',()=>{
  const r=data();r[0].observationDays=0;
  assert.equal(eligibility('alpha',r),'insufficient_observation_horizon');
});
test('no disguised cheap-quality score when task quality fails',()=>{
  const r=data();r[3].declaredAutomationFeatures=[{name:'auto_empty_dock',sourceUrl:U,evidence:'manufacturer_claim'}];
  assert.equal(eligibility('poor',r),'fails_quality_floor');
});
test('policy cannot omit routine or unplanned maintenance just to crown a favorite',()=>{
  assert.throws(()=>run(data(),{...policy,required:reqs.slice(0,2)}),/invalid_autonomy_policy/);
});
test('policy must identify its use context, original source and version',()=>{
  assert.throws(()=>run(data(),{...policy,sourceUrls:['not-a-link']}),/invalid_autonomy_policy/);
});
test('comparison requires reviewed phase120 frame not a fabricated winner claim',()=>{
  const manipulated={...frame(),winnerClaimAllowed:true};
  assert.throws(()=>attachReviewedAutonomyLens121(manipulated as ReturnType<typeof frame>,[policy],data()),/unverified_phase120_frame/);
});
test('duplicate autonomous records for the same exact variant and lane fail closed',()=>{
  const r=data();assert.throws(()=>run([...r,r[0]]),/duplicate_autonomy_record/);
});
test('invalid metric name or manipulated direction cannot create a winner',()=>{
  const r=data();r[0].measurements=[{...r[0].measurements[0],favorable:'lower'},...r[0].measurements.slice(1)];
  assert.throws(()=>run(r),/invalid_autonomy_record/);
});
test('optional preparation work can be made mandatory only through explicit revised policy',()=>{
  const p={...policy,revision:'r2',required:[...reqs,{metric:'preparation_human_minutes_per_run' as const,...definitions.preparation_human_minutes_per_run}]};
  assert.equal(run(data(),p).lanes[0].evaluated.find(x=>x.variantId==='alpha')?.status,'missing_autonomy_evidence');
});
test('unmatched variant id must not enter reviewed comparison',()=>{
  assert.throws(()=>run([...data(),record('invented',[1,0,0,0])]),/unexpected_product_or_lane/);
});
test('different observation exposure does not create a made-up comparable rate',()=>{
  const r=data();r[0].scheduledRuns=45;
  const out=run(r);assert.equal(out.lanes[0].robustPartialDominance.length,0);
  assert.ok(out.lanes[0].unresolvedPairs.some(([a,b])=>a==='alpha'&&b==='beta'));
});
test('record feature count can change input hash without altering inferred pair ranking',()=>{
  const baseline=run();const r=data();r[0].declaredAutomationFeatures=[{name:'mop_auto_washing',sourceUrl:U,evidence:'manufacturer_claim'}];
  const out=run(r);assert.notEqual(out.sourceSnapshotSha256,baseline.sourceSnapshotSha256);
  assert.deepEqual(out.lanes,baseline.lanes);
});
test('none of the original phase120 source facts or lens order is mutated',()=>{
  const original=frame();const copy=structuredClone(original);
  attachReviewedAutonomyLens121(original,[policy],data());
  assert.deepEqual(original,copy);
});
test('an unfiltered general best-autonomy question preserves separate vacuum mop and combined lanes',()=>{
  const f=routeGeneralPersonalDualLens120({...user,scope:'undecided'},quality,snap);
  const policies:AutonomyProtocol121[]=['vacuum','mop','both'].map(lane=>({...policy,lane:lane as AutonomyProtocol121['lane']}));
  const out=attachReviewedAutonomyLens121(f,policies,data());
  assert.deepEqual(out.lanes.map(x=>x.lane),['vacuum','mop','both']);
  assert.equal(out.lanes[0].evaluated.find(x=>x.variantId==='alpha')?.status,'eligible_reviewed_autonomy');
  assert.equal(out.lanes[1].robustPartialDominance.length,0);
  assert.equal(out.lanes[2].robustPartialDominance.length,0);
});
