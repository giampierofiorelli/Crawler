import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditRobustPreferences190,optimizeBoxSimplex190,validateScenario190,
 type Scenario190,type PreferenceCriterion190,type Observation190} from '../src/phase190_robust_preference_audit.js';
import {auditStrictPareto189,type ResearchDossier189} from '../src/phase189_source_pilot_reasoning.js';

const r=JSON.parse(readFileSync('evaluation/phase189/annotated-live-source-pilot.json','utf8')) as ResearchDossier189;
const src='https://www.rtings.com/vacuum/reviews/dyson/v15-detect';
const criterion=(field:string, direction:'higher'|'lower'='higher', weight={minimum:0.5,maximum:0.5},
 worst=0,best=100):PreferenceCriterion190=>({field,protocol:'benchmark_v1',condition:'same_test',unit:'points',direction,
 utilityAnchor:{worst,best,reviewReference:'illustrative_anchor_190'},weight});
const obs=(v:string,field:string,value:number,group=`${v}_${field}`,lo=value,hi=value):Observation190=>({
 variantId:v,category:'vacuum',field,protocol:'benchmark_v1',condition:'same_test',unit:'points',low:lo,high:hi,originalGroup:group,
 sourceReference:src,kind:'original_professional_lab_annotation',
 bounds:lo===hi?'reported_point_no_uncertainty_estimate':'illustrative_not_calibrated'});
const base=():Scenario190=>({stage:'research_only_unreviewed',category:'vacuum',variantA:'a',variantB:'b',userGoalConfirmed:true,
 purpose:'Only a controlled analyst scenario about relative pairwise performance.',
 criteria:[criterion('pickup'),criterion('noise')],
 observations:[obs('a','pickup',90),obs('b','pickup',40),obs('a','noise',25),obs('b','noise',85)]});
const clone=()=>structuredClone(base());

test('scenario with broad legitimate preferences does not force an unconditional winner',()=>{
 const s=clone();s.criteria[0].weight={minimum:0.2,maximum:0.8};s.criteria[1].weight={minimum:0.2,maximum:0.8};
 const result=auditRobustPreferences190(s);assert.equal(result.status,'sensitive_or_uncertain');
 assert.ok(result.deltaMinimum!<0&&result.deltaMaximum!>0);assert.equal(result.publicRankingAllowed,false);
});
test('exact preference weights legitimately favor first alternative',()=>{
 const s=clone();s.criteria[0].weight={minimum:0.8,maximum:0.8};s.criteria[1].weight={minimum:0.2,maximum:0.2};
 assert.equal(auditRobustPreferences190(s).status,'robustly_a_on_selected_criteria');
});
test('the same recorded products favor the second when preferences change',()=>{
 const s=clone();s.criteria[0].weight={minimum:0.2,maximum:0.2};s.criteria[1].weight={minimum:0.8,maximum:0.8};
 assert.equal(auditRobustPreferences190(s).status,'robustly_b_on_selected_criteria');
});
test('admitting broad weight ranges rejects an otherwise apparently clear favorite',()=>{
 const s=clone();s.criteria[0].weight={minimum:0.2,maximum:0.8};s.criteria[1].weight={minimum:0.2,maximum:0.8};
 const answer=auditRobustPreferences190(s);assert.equal(answer.status,'sensitive_or_uncertain');
 assert.ok(answer.deltaMinimum!<0&&answer.deltaMaximum!>0);
});
test('all observed dimensions favor A and weights permit no B preference',()=>{
 const s=clone();s.observations=s.observations.map(o=>o.variantId==='a'&&o.field==='noise'?{...o,low:95,high:95}:o);
 assert.equal(auditRobustPreferences190(s).status,'robustly_a_on_selected_criteria');
});
test('adding an unrelated candidate does not reverse a fixed A/B comparison',()=>{
 const s=clone();const before=auditRobustPreferences190(s);
 s.observations=[...s.observations,obs('third','pickup',100),obs('third','noise',10)];
 assert.deepEqual(auditRobustPreferences190(s),before);
});
test('row ordering does not alter a reasoned comparison',()=>{
 const s=clone();const before=auditRobustPreferences190(s);
 s.observations=[...s.observations].reverse();assert.deepEqual(auditRobustPreferences190(s),before);
});
test('criteria ordering does not alter the extrema',()=>{
 const s=clone();const before=auditRobustPreferences190(s);
 s.criteria=[...s.criteria].reverse();const after=auditRobustPreferences190(s);
 assert.equal(after.status,before.status);assert.equal(after.deltaMinimum,before.deltaMinimum);
 assert.equal(after.deltaMaximum,before.deltaMaximum);
});
test('unconfirmed user needs cannot authorize a comparison',()=>{
 const s=clone();s.userGoalConfirmed=false;
 assert.equal(auditRobustPreferences190(s).status,'unconfirmed_goal');
});
test('missing evidence means insufficient, not zero utility',()=>{
 const s=clone();s.observations=s.observations.filter(o=>!(o.variantId==='b'&&o.field==='noise'));
 const a=auditRobustPreferences190(s);assert.equal(a.status,'missing_or_conflicting_evidence');
 assert.equal(a.deltaMinimum,undefined);
});
test('two conflicting original readings cannot be cherry-picked',()=>{
 const s=clone();s.observations=[...s.observations,obs('a','pickup',99,'other_study')];
 assert.equal(auditRobustPreferences190(s).status,'missing_or_conflicting_evidence');
});
test('cross-category observation cannot be used for this category',()=>{
 const s=clone();s.observations=s.observations.map(o=>o.variantId==='b'&&o.field==='pickup'?{...o,category:'water_filter'}:o);
 assert.equal(auditRobustPreferences190(s).status,'missing_or_conflicting_evidence');
});
test('wrong model evidence is never substituted',()=>{
 const s=clone();s.observations=s.observations.map(o=>o.variantId==='b'&&o.field==='pickup'?{...o,variantId:'different_sku'}:o);
 assert.equal(auditRobustPreferences190(s).status,'missing_or_conflicting_evidence');
});
test('protocol mismatch cannot satisfy a criterion',()=>{
 const s=clone();s.observations=s.observations.map(o=>o.field==='noise'&&o.variantId==='b'?{...o,protocol:'other_v2'}:o);
 assert.equal(auditRobustPreferences190(s).status,'missing_or_conflicting_evidence');
});
test('test-condition mismatch cannot satisfy a criterion',()=>{
 const s=clone();s.observations=s.observations.map(o=>o.field==='noise'&&o.variantId==='b'?{...o,condition:'gaming_mode'}:o);
 assert.equal(auditRobustPreferences190(s).status,'missing_or_conflicting_evidence');
});
test('different physical units cannot satisfy a criterion',()=>{
 const s=clone();s.observations=s.observations.map(o=>o.field==='pickup'&&o.variantId==='b'?{...o,unit:'percent'}:o);
 assert.equal(auditRobustPreferences190(s).status,'missing_or_conflicting_evidence');
});
test('same original experiment reused as independent criteria is held',()=>{
 const s=clone();s.observations=s.observations.map(o=>o.variantId==='a'?{...o,originalGroup:'same_group'}:o);
 assert.equal(auditRobustPreferences190(s).status,'overlapping_or_dependent_observations');
});
test('fixed externally defined anchors reject extrapolation rather than clipping',()=>{
 const s=clone();s.observations=s.observations.map(o=>o.variantId==='a'&&o.field==='pickup'?{...o,low:120,high:120}:o);
 assert.equal(auditRobustPreferences190(s).status,'missing_or_conflicting_evidence');
});
test('uncalibrated bounds spanning observed utility flip the conclusion to sensitive',()=>{
 const s=clone();s.observations=s.observations.map(o=>o.variantId==='a'?{...o,low:0,high:100,bounds:'illustrative_not_calibrated'}:o);
 assert.equal(auditRobustPreferences190(s).status,'sensitive_or_uncertain');
});
test('narrow bounds preserve robust choice when mathematically justified',()=>{
 const s=clone();s.criteria[0].weight={minimum:0.8,maximum:0.8};s.criteria[1].weight={minimum:0.2,maximum:0.2};
 s.observations=s.observations.map(o=>({...o,low:o.low-1,high:o.high+1,bounds:'illustrative_not_calibrated'}));
 assert.equal(auditRobustPreferences190(s).status,'robustly_a_on_selected_criteria');
});
test('mandatory failure defeats a compensating positive performance',()=>{
 const s=clone();s.criteria[1].mandatoryThreshold={comparison:'at_least',value:50};
 assert.equal(auditRobustPreferences190(s).status,'failed_mandatory_A');
});
test('both mandatory failures are reported rather than arbitrarily ranked',()=>{
 const s=clone();s.criteria[0].mandatoryThreshold={comparison:'at_least',value:95};
 assert.equal(auditRobustPreferences190(s).status,'failed_mandatory_both');
});
test('mandatory threshold unknown from range is neither pass nor fail',()=>{
 const s=clone();s.criteria[0].mandatoryThreshold={comparison:'at_least',value:90};
 s.observations=s.observations.map(o=>o.variantId==='a'&&o.field==='pickup'?{...o,low:85,high:95,bounds:'illustrative_not_calibrated'}:o);
 assert.equal(auditRobustPreferences190(s).status,'failed_mandatory_B');
 s.criteria[0].mandatoryThreshold={comparison:'at_least',value:30};
 assert.equal(auditRobustPreferences190(s).status,'robustly_b_on_selected_criteria'); // threshold now passes, only performance tradeoffs remain
});
test('at-most threshold uses worst possible upper bound',()=>{
 const s=clone();s.criteria[1].mandatoryThreshold={comparison:'at_most',value:30};
 assert.equal(auditRobustPreferences190(s).status,'failed_mandatory_B');
});
test('invalid negative, NaN or >1 preferences fail closed',()=>{
 const s=clone();s.criteria[0].weight={minimum:-0.1,maximum:0.5};assert.throws(()=>validateScenario190(s));
 s.criteria[0].weight={minimum:0.5,maximum:Number.NaN};assert.throws(()=>validateScenario190(s));
});
test('weight simplex with sums below 1 is infeasible',()=>{
 const s=clone();s.criteria[0].weight={minimum:0.1,maximum:0.3};s.criteria[1].weight={minimum:0.1,maximum:0.3};
 assert.throws(()=>auditRobustPreferences190(s));
});
test('weight simplex with minimum sum above 1 is infeasible',()=>{
 const s=clone();s.criteria[0].weight={minimum:0.7,maximum:0.9};s.criteria[1].weight={minimum:0.7,maximum:0.9};
 assert.throws(()=>auditRobustPreferences190(s));
});
test('a genuine observational tie never becomes an invented winner',()=>{
 const s=clone();s.observations=s.observations.map(o=>o.variantId==='b'?{...o,low:s.observations.find(a=>a.variantId==='a'&&a.field===o.field)!.low,
  high:s.observations.find(a=>a.variantId==='a'&&a.field===o.field)!.high}:o);
 assert.equal(auditRobustPreferences190(s).status,'observational_tie_in_model');
});
test('source derivatives and editorial conclusions cannot be encoded as original lab annotations',()=>{
 const s=clone();s.observations=s.observations.map(o=>o.variantId==='a'&&o.field==='pickup'?{...o,kind:'editorial' as never}:o);
 assert.throws(()=>auditRobustPreferences190(s));
});
test('measured point cannot disguise an illustrative interval',()=>{
 const s=clone();s.observations=s.observations.map(o=>o.variantId==='a'&&o.field==='pickup'?{...o,low:80,bounds:'reported_point_no_uncertainty_estimate' as const}:o);
 assert.throws(()=>auditRobustPreferences190(s));
});
test('no source access rights or calibration is claimed from output',()=>{
 const s=clone();const a=auditRobustPreferences190(s);
 assert.equal(a.publicRankingAllowed,false);assert.ok(a.issues.some(x=>x.includes('No publisher-source custody')));
});
test('robust simplex extrema match exhaustive grid search on 2 dimensions',()=>{
 for(const coeff of [[0.4,-0.2],[0.5,0.8],[-0.1,-0.7]]){
  const bounds=[{minimum:0.15,maximum:0.75},{minimum:0.25,maximum:0.85}];
  const grid=Array.from({length:601},(_,i)=>{const w=0.15+i/1000;return w*coeff[0]+(1-w)*coeff[1];});
  const lo=optimizeBoxSimplex190(coeff,bounds,'min'),hi=optimizeBoxSimplex190(coeff,bounds,'max');
  assert.ok(Math.abs(lo-Math.min(...grid))<1e-8);assert.ok(Math.abs(hi-Math.max(...grid))<1e-8);
 }
});
test('recorded real-source RTINGS values stay research-only; no claimed whole-product ranking',()=>{
 const get=(id:string)=>r.records.find(o=>o.id===id)!;
 const specs=[{field:'hose_airflow',direction:'higher' as const,anchor:{worst:0,best:150},ids:['v15_airflow','shark_airflow']},
  {field:'operating_noise',direction:'lower' as const,anchor:{worst:100,best:30},ids:['v15_noise','shark_noise']}];
 const s:Scenario190={stage:'research_only_unreviewed',category:'vacuum',variantA:'dyson_v15_detect',variantB:'shark_stratos_iz862h',
 userGoalConfirmed:true,purpose:'Analyst-illustrative anchor and preference bounds for actual manually annotated original review facts.',
 criteria:specs.map(x=>({field:x.field,protocol:'rtings_vacuum_v1.4',condition:x.field==='hose_airflow'?'maximum_hose_airflow':'bare_floor',
 unit:x.field==='hose_airflow'?'cfm':'dba',direction:x.direction,utilityAnchor:{...x.anchor,reviewReference:'unreviewed_utility_anchor_190'},
 weight:{minimum:0.25,maximum:0.75}})),
 observations:specs.flatMap(x=>x.ids.map(id=>{const o=get(id);return{variantId:o.variantId,category:o.category,field:o.field,protocol:o.protocol,
  condition:o.condition,unit:o.unit!,low:o.value!,high:o.value!,originalGroup:o.originalGroup,
  sourceReference:r.sourcePages.find(p=>p.id===o.sourceId)!.url,
  kind:'original_professional_lab_annotation' as const,bounds:'reported_point_no_uncertainty_estimate' as const};}))};
 assert.equal(auditStrictPareto189(r,{category:'vacuum',variantA:s.variantA,variantB:s.variantB,
  criteria:s.criteria.map(c=>({field:c.field,protocol:c.protocol,condition:c.condition,unit:c.unit,direction:c.direction}))}).state,'a_dominates_on_selected_fields');
 const result=auditRobustPreferences190(s);
 assert.equal(result.status,'robustly_a_on_selected_criteria');assert.equal(result.publicRankingAllowed,false);
 assert.equal(result.evidenceGroups.length,4);
});

test('cross-category check: Notebookcheck Wi-Fi battery result does not supply an unseen laptop competitor',()=>{
 const fact=r.records.find(x=>x.id==='thinkbook_battery')!;
 const scenario:Scenario190={stage:'research_only_unreviewed',category:'laptop',variantA:fact.variantId,
 variantB:'unreviewed_laptop',userGoalConfirmed:true,
 purpose:'A source-derived exact-variant laptop runtime must not be misused as knowledge about unknown competing laptops.',
 criteria:[{field:fact.field,protocol:fact.protocol,condition:fact.condition,unit:fact.unit!,direction:'higher',
  utilityAnchor:{worst:0,best:50,reviewReference:'analyst_example_not_admitted'},weight:{minimum:1,maximum:1}}],
 observations:[{variantId:fact.variantId,category:fact.category,field:fact.field,
  protocol:fact.protocol,condition:fact.condition,unit:fact.unit!,low:fact.value!,high:fact.value!,
  originalGroup:fact.originalGroup,sourceReference:r.sourcePages.find(p=>p.id===fact.sourceId)!.url,
  kind:'original_professional_lab_annotation',bounds:'reported_point_no_uncertainty_estimate'}]};
 assert.equal(auditRobustPreferences190(scenario).status,'missing_or_conflicting_evidence');
 scenario.criteria[0].condition='gaming_high_load';
 assert.equal(auditRobustPreferences190(scenario).status,'missing_or_conflicting_evidence');
});
test('cross-category check: a SoundGuys 410 Hz ANC datum cannot establish broadband airplane ANC',()=>{
 const fact=r.records.find(x=>x.id==='bose_anc_410hz')!;
 const scenario:Scenario190={stage:'research_only_unreviewed',category:'headphones',variantA:fact.variantId,
 variantB:'unknown_headphones',userGoalConfirmed:true,
 purpose:'Frequency-specific headphone test observations cannot support claims about other sound frequencies.',
 criteria:[{field:fact.field,protocol:fact.protocol,condition:'aircraft_cabin_broadband',unit:fact.unit!,direction:'higher',
  utilityAnchor:{worst:0,best:40,reviewReference:'analyst_example_not_admitted'},weight:{minimum:1,maximum:1}}],
 observations:[{variantId:fact.variantId,category:fact.category,field:fact.field,protocol:fact.protocol,
  condition:fact.condition,unit:fact.unit!,low:fact.value!,high:fact.value!,originalGroup:fact.originalGroup,
  sourceReference:r.sourcePages.find(p=>p.id===fact.sourceId)!.url,
  kind:'original_professional_lab_annotation',bounds:'reported_point_no_uncertainty_estimate'}]};
 assert.equal(auditRobustPreferences190(scenario).status,'missing_or_conflicting_evidence');
});
