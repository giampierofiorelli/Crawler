import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assessQuestion189,auditStrictPareto189,validateDossier189,
 type ResearchDossier189,type Question189,type SourceRecord189} from '../src/phase189_source_pilot_reasoning.js';
// A SMALL REAL-SOURCE MANUAL ANNOTATION PILOT. Original web pages were checked
// externally; no originals are bundled, no production evidence is admitted.
const original=JSON.parse(readFileSync('evaluation/phase189/annotated-live-source-pilot.json','utf8')) as ResearchDossier189;
const copy=()=>structuredClone(original);
function question(id:string,variantId:string,category:string,field:string,condition:string,protocol:string,
 threshold:number,unit:string,kind:'numeric_minimum'|'numeric_maximum'='numeric_minimum'):Question189{
 return {id,variantId,category,field,condition,protocol,kind,threshold,unit};}
const v15noise=()=>question('vacuum_noise','dyson_v15_detect','vacuum','operating_noise','bare_floor',
 'rtings_vacuum_v1.4',72,'dba','numeric_maximum');
const sharkNoise=()=>({...v15noise(),id:'shark_noise',variantId:'shark_stratos_iz862h'});
const pareto=()=>({category:'vacuum',variantA:'dyson_v15_detect',variantB:'shark_stratos_iz862h',
 criteria:[{field:'hose_airflow',protocol:'rtings_vacuum_v1.4',condition:'maximum_hose_airflow',
  unit:'cfm',direction:'higher' as const},{field:'operating_noise',protocol:'rtings_vacuum_v1.4',
  condition:'bare_floor',unit:'dba',direction:'lower' as const}]});
const reject=(d:ResearchDossier189)=>assert.throws(()=>validateDossier189(d));
test('original-source notebook: 4 published documents, three different product categories',()=>{
 validateDossier189(original);assert.equal(original.sourcePages.length,4);
 assert.deepEqual([...new Set(original.records.map(r=>r.category))].sort(),['headphones','laptop','vacuum']);
 assert.equal(original.status,'research_only_not_reviewed_or_admitted');
 assert.ok(original.method.includes('no full article'));
});
test('vacuum V15 measured noise satisfies only a user-proposed 72 dBA hard-floor threshold',()=>{
 const r=assessQuestion189(original,v15noise());
 assert.equal(r.state,'observed_threshold_met');assert.deepEqual(r.eligibleOriginalObservationIds,['v15_noise']);
 assert.equal(r.rankingAllowed,false);assert.equal(r.independentSourceRightsVerified,false);
});
test('vacuum Shark original measurement exceeds identical limit on same lab protocol',()=>{
 const r=assessQuestion189(original,sharkNoise());
 assert.equal(r.state,'observed_threshold_missed');assert.deepEqual(r.eligibleOriginalObservationIds,['shark_noise']);
});
test('vacuum airflow: editor praise is a derivative, not another measurement',()=>{
 const r=assessQuestion189(original,question('airflow','dyson_v15_detect','vacuum','hose_airflow',
  'maximum_hose_airflow','rtings_vacuum_v1.4',60,'cfm'));
 assert.equal(r.state,'observed_threshold_met');assert.equal(r.originalGroups.length,1);
 assert.ok(r.excludedOrDerivedIds.includes('v15_airflow_editorial'));
});
test('same exact model: air quality while operating is not dust exposure during bin emptying',()=>{
 const q:Question189={id:'emptying',category:'vacuum',variantId:'dyson_v15_detect',field:'emptying_dust_exposure',
  condition:'bin_emptying',protocol:'rtings_vacuum_v1.4',kind:'experiential_context'};
 const r=assessQuestion189(original,q);
 assert.equal(r.state,'context_observed_only');assert.deepEqual(r.eligibleOriginalObservationIds,['v15_emptying']);
 assert.ok(r.limitations.some(x=>x.includes('rubric')));
});
test('Shark folding wand yields context for furniture, not a numeric cleaning score',()=>{
 const r=assessQuestion189(original,{id:'furniture',category:'vacuum',variantId:'shark_stratos_iz862h',
  field:'under_furniture_reach',condition:'under_furniture',protocol:'rtings_vacuum_v1.4',kind:'experiential_context'});
 assert.equal(r.state,'context_observed_only');assert.equal(r.rankingAllowed,false);
});
test('Lenovo exact 21NH0005GE battery: benchmark duration 26.9 hours at defined conditions',()=>{
 const r=assessQuestion189(original,question('battery','thinkbook_16_g7_qoy_21nh0005ge','laptop',
  'wifi_battery_runtime','edge131_150nits','notebookcheck_wifi_v1.3',24,'hours'));
 assert.equal(r.state,'observed_threshold_met');assert.deepEqual(r.eligibleOriginalObservationIds,['thinkbook_battery']);
});
test('Lenovo exact tested panel: below hypothetical 400 cd/m2 criterion; other panels unassessed',()=>{
 const r=assessQuestion189(original,question('screen','thinkbook_16_g7_qoy_21nh0005ge','laptop',
  'display_brightness','panel_len160wuxga','notebookcheck_display_wuxga',400,'cd_m2'));
 assert.equal(r.state,'observed_threshold_missed');assert.deepEqual(r.eligibleOriginalObservationIds,['thinkbook_brightness']);
});
test('Lenovo Windows ARM compatibility issue does not prove any specific application fails',()=>{
 const r=assessQuestion189(original,{id:'app',category:'laptop',variantId:'thinkbook_16_g7_qoy_21nh0005ge',
  field:'legacy_windows_app_compatibility',condition:'snapdragon_arm_windows',protocol:'reviewer_observation',kind:'experiential_context'});
 assert.equal(r.state,'context_observed_only');assert.equal(r.rankingAllowed,false);
});
test('Lenovo Wi-Fi battery benchmark does not prove runtime in gaming or another brightness setting',()=>{
 const r=assessQuestion189(original,question('gaming','thinkbook_16_g7_qoy_21nh0005ge','laptop',
  'wifi_battery_runtime','gaming_full_brightness','notebookcheck_wifi_v1.3',24,'hours'));
 assert.equal(r.state,'not_established');assert.equal(r.eligibleOriginalObservationIds.length,0);
 assert.ok(r.limitations.some(x=>x.includes('other-condition')));
});
test('headphone ANC spectrum value can support only the exact 410Hz result',()=>{
 const r=assessQuestion189(original,question('anc410','bose_headphones_700','headphones',
  'anc_attenuation_410hz','anc_on_410hz','soundguys_anc_curve',18,'db'));
 assert.equal(r.state,'observed_threshold_met');assert.deepEqual(r.originalGroups,['soundguys_bose_anc_curve']);
 assert.ok(r.excludedOrDerivedIds.includes('bose_anc_editorial'));
});
test('a 410Hz reading cannot establish airplane-wide or whole-spectrum ANC performance',()=>{
 const r=assessQuestion189(original,question('airplane','bose_headphones_700','headphones',
  'anc_attenuation_410hz','aircraft_cabin_all_frequencies','soundguys_anc_curve',18,'db'));
 assert.equal(r.state,'not_established');
});
test('headphone missing folding hinges counts as expert usage context only',()=>{
 const r=assessQuestion189(original,{id:'travel',category:'headphones',variantId:'bose_headphones_700',
  field:'folding_hinges',condition:'storage_transport',protocol:'reviewer_observation',kind:'experiential_context'});
 assert.equal(r.state,'context_observed_only');
});
test('unknown category, exact variant, field, or protocol must remain non-established',()=>{
 const q=v15noise();for(const edit of [{category:'kettle'},{variantId:'other_v15_variant'},{field:'motor_temperature'},
  {protocol:'rtings_vacuum_v1.3'},{unit:'cfm'}]){
  const r=assessQuestion189(original,{...q,...edit});assert.equal(r.state,'not_established');
 }
});
test('missing measurements are not assumed zero, not used as negatives',()=>{
 const r=assessQuestion189(original,question('other','bose_headphones_700','headphones',
  'battery_hours','headset_wireless','soundguys_battery',20,'hours'));
 assert.equal(r.state,'not_established');assert.deepEqual(r.eligibleOriginalObservationIds,[]);
});
test('independent conflicting originals cannot be averaged or cherry-picked',()=>{
 const d=copy();d.records=[...d.records,{...d.records.find(r=>r.id==='v15_noise')!,id:'v15_noise_independent',
  sourceId:'rtings_v15',originalGroup:'new_experiment_same_review',value:76}];
 const r=assessQuestion189(d,v15noise());assert.equal(r.state,'conflicting_originals');
});
test('even different values within one declared original experiment hold as conflict',()=>{
 const d=copy();d.records=[...d.records,{...d.records.find(r=>r.id==='v15_noise')!,id:'v15_noise_same_experiment',value:73}];
 assert.equal(assessQuestion189(d,v15noise()).state,'conflicting_originals');
});
test('manufacturer stated value never silently becomes an original lab measurement',()=>{
 const d=copy();d.records=[...d.records,{...d.records.find(r=>r.id==='v15_noise')!,
  id:'v15_manufacturer',kind:'manufacturer_statement' as const,originalGroup:'maker_v15',value:65}];
 assert.equal(assessQuestion189(d,v15noise()).state,'observed_threshold_met');
 const only=copy();only.records=only.records.filter(r=>r.id!=='v15_noise');
 only.records=[...only.records.filter(r=>r.id!=='v15_airflow_editorial'),{...d.records[d.records.length-1]}];
 assert.equal(assessQuestion189(only,v15noise()).state,'not_established');
});
test('forged editorial dependency to another field must fail validation',()=>{
 const d=copy();const r=d.records.find(x=>x.id==='bose_anc_editorial')!;
 d.records=d.records.map(x=>x.id===r.id?{...x,derivedFrom:['bose_folding']}:x);reject(d);
});
test('fake derivative across model variants must fail',()=>{
 const d=copy();d.records=[...d.records,{...d.records.find(r=>r.id==='v15_airflow_editorial')!,
  id:'shark_fake_derivation',variantId:'shark_stratos_iz862h'}];reject(d);
});
test('editorial summary without a parent observation must be rejected',()=>{
 const d=copy();d.records=d.records.map(r=>r.id==='bose_anc_editorial'?{...r,derivedFrom:[]}:r);reject(d);
});
test('cyclic editorial references must fail validation',()=>{
 const d=copy();const r=d.records.find(x=>x.id==='v15_airflow_editorial')!;
 d.records=[...d.records,{...r,id:'editor_b',derivedFrom:[r.id]}];
 d.records=d.records.map(x=>x.id===r.id?{...x,derivedFrom:['editor_b']}:x);reject(d);
});
test('one purported original group mixing two models is rejected',()=>{
 const d=copy();d.records=d.records.map(r=>r.id==='shark_noise'?{...r,originalGroup:'rtings_v15_noise'}:r);reject(d);
});
test('a duplicate source record identifier must be rejected',()=>{
 const d=copy();d.records=[...d.records,{...d.records[0]}];reject(d);
});
test('site source URL must be HTTPS with an identified path',()=>{
 const d=copy();d.sourcePages=[{...d.sourcePages[0],url:'http://fake.test'},...d.sourcePages.slice(1)];reject(d);
});
test('strict Pareto on two narrow measurements: V15 is higher airflow and lower hard-floor dBA',()=>{
 const r=auditStrictPareto189(original,pareto());
 assert.equal(r.state,'a_dominates_on_selected_fields');assert.equal(r.evidenceFields.length,2);
 assert.ok(r.caution.includes('not overall')===false||r.caution.includes('Pareto'));
});
test('Pareto direction must remain true if products swapped',()=>{
 const p=pareto();const r=auditStrictPareto189(original,{...p,variantA:p.variantB,variantB:p.variantA});
 assert.equal(r.state,'b_dominates_on_selected_fields');
});
test('Pareto cannot turn missing third dimension into a zero',()=>{
 const p=pareto();const r=auditStrictPareto189(original,{...p,criteria:[...p.criteria,
  {field:'pet_hair',protocol:'rtings_vacuum_v1.4',condition:'upholstery',unit:'points',direction:'higher'}]});
 assert.equal(r.state,'incomparable');
});
test('Pareto must not compare values across changed protocols or conditions',()=>{
 const p=pareto();const r=auditStrictPareto189(original,{...p,criteria:[{...p.criteria[0],protocol:'another_vacuum_bench'},p.criteria[1]]});
 assert.equal(r.state,'incomparable');
});
test('Pareto must not use source popularity or editorial reviews as numbers',()=>{
 const d=copy();d.records=[...d.records,{...d.records.find(r=>r.id==='v15_airflow_editorial')!,id:'v15_copy_more'}];
 assert.equal(auditStrictPareto189(d,pareto()).state,'a_dominates_on_selected_fields');
});
test('ambiguous duplicate quantitative data cannot authorize dominance',()=>{
 const d=copy();d.records=[...d.records,{...d.records.find(r=>r.id==='v15_noise')!,id:'another_measure'}];
 assert.equal(auditStrictPareto189(d,pareto()).state,'incomparable');
});
test('new purchase candidate cannot magically make pairwise measured dominance disappear',()=>{
 const d=copy();d.records=[...d.records,{...d.records.find(r=>r.id==='shark_noise')!,id:'third_product_noise',
  variantId:'third_vacuum',originalGroup:'third_noise'},
  {...d.records.find(r=>r.id==='shark_airflow')!,id:'third_product_airflow',
   variantId:'third_vacuum',originalGroup:'third_airflow'}];
 assert.equal(auditStrictPareto189(d,pareto()).state,'a_dominates_on_selected_fields');
});
