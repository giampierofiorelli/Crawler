import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadQuantityKnowledge,type TypedQuantity} from '../src/quantity_knowledge.js';
import {describeMeasurement,linkValues,loadLinkRules,type TeachingView,type LinkValue} from '../src/knowledge_link.js';
import type {RuleSet} from '../src/knowledge_rules.js';

// R2 (owner S68): typed link of values to taught measurements, graded evidential force. Synthetic teaching and values.
const qk=loadQuantityKnowledge();
const q=(o:{kind?:string|null;candidates?:string[];metric?:string|null;conditions?:[string,string][];missing?:string[]}):TypedQuantity=>({
 surface:'',value:1,unit:{} as TypedQuantity['unit'],si:null,
 kind:{id:o.kind??null,candidates:o.candidates??[],basis:[],justification:{type:'unit' as never,from:null,evidence:[],ref:null,rules:[],derivation:[]}},
 metric:{id:o.metric??null,candidates:[],basis:[]},weighting:null,reference:null,
 conditions:(o.conditions??[]).map(([axis,value])=>({axis,value,raw:value,from:'labels' as const})),missingConditions:o.missing??[],unresolved:[],knowledge:'test',
 source:null,protocol:null,cohort:null,product:null,contextScope:null});
const v=(id:string,o:Parameters<typeof q>[0],product='Acme P1'):LinkValue=>({id,quantity:q(o),product});
const concept=(id:string,statement='Measured as stated.')=>({id,statement,aliases:[]});
type M=TeachingView['measurements'][number];
const meas=(id:string,outcomes:[string,'direct'|'partial'|'unverified'][],extra:Partial<M>={}):M=>({concept:concept(id),outcomes:outcomes.map(([outcome,force])=>({outcome,force,relation:'r_'+id+'_'+outcome})),indirectFor:[],conditions:[],...extra});
const view=(ms:M[]):TeachingView=>({category:'test',measurements:ms,basis:{items:ms.length,relations:0,forceOverlay:null}});
const res=(r:ReturnType<typeof linkValues>,id:string)=>r.results.find(x=>x.value===id)!;
const PAIRING=concept('same_mode_pairing','Condition: compared only when measured at the same fan setting.');
const PURIFIER=view([meas('particle_cadr_by_pollutant_and_mode',[['fine_particle_reduction','partial']]),meas('pollen_dust_cadr_at_sleep_mode',[['allergen_particle_reduction','partial']]),
 meas('room_volume_equivalent_ach',[['room_coverage','partial']]),meas('mode_power_and_tco',[['energy_cost','direct']],{conditions:[PAIRING]})]);

test('R2 translation: a taught measurement becomes a typed descriptor with the words it came from', ()=>{
 const d=describeMeasurement(qk,concept('pollen_dust_cadr_at_sleep_mode','Dust and pollen CADR re-measured at the quiet setting.'));
 assert.ok(d.measurands.some(m=>m.metric==='cadr'&&m.level==='head'));
 assert.deepEqual(d.fixed.map(f=>f.axis+'='+f.value).sort(),['challenge_pollutant=dust','challenge_pollutant=pollen','fan_setting=sleep']);
 // a leading preposition does not empty the measurand ("in situ sound level trace")
 assert.ok(describeMeasurement(qk,concept('in_situ_sound_level_trace')).measurands.length>0);
 // what PEE cannot type is reported, not guessed
 assert.ok(describeMeasurement(qk,concept('sustained_sdr_luminance')).untyped.includes('sdr'));
 // an axis named only by a requires_condition statement must be named by the axis itself, not by a loose cue
 const t=describeMeasurement(qk,concept('hdr_luminance_by_window_and_duration'),[concept('luminance_metadata','Condition: keep window %, ambient sensor, firmware.')]);
 assert.ok(t.axes.some(a=>a.axis==='window_size'));assert.ok(!t.axes.some(a=>a.axis==='inlet_air_state'));
});

test('R2 link: the metric level is the most specific; a value of another metric is not linked; outside the teaching is reported', ()=>{
 const r=linkValues(qk,PURIFIER,[v('a',{kind:'volumetric_flow_rate',metric:'cadr',conditions:[['fan_setting','top'],['challenge_pollutant','smoke']]}),
  v('b',{kind:'volumetric_flow_rate',metric:'free_airflow'}),v('c',{kind:'duration'})]);
 assert.equal(res(r,'a').status,'linked');assert.deepEqual(res(r,'a').measurements,['particle_cadr_by_pollutant_and_mode']);
 assert.equal(res(r,'b').status,'no_taught_measurement');
 assert.equal(res(r,'c').status,'no_taught_measurement');
 assert.ok(res(r,'a').derivation.some(l=>l.includes('L5')));
});

test('R2 link: a candidate that would assume an unstated condition is not preferred; changing the mode changes the link (metamorphic)', ()=>{
 const top=linkValues(qk,PURIFIER,[v('a',{kind:'volumetric_flow_rate',metric:'cadr',conditions:[['fan_setting','top'],['challenge_pollutant','dust']]})]);
 assert.deepEqual(res(top,'a').measurements,['particle_cadr_by_pollutant_and_mode']);
 // the same value at sleep: both candidates assume nothing and lead to different outcomes -> ambiguous, not guessed
 const sleep=linkValues(qk,PURIFIER,[v('a',{kind:'volumetric_flow_rate',metric:'cadr',conditions:[['fan_setting','sleep'],['challenge_pollutant','dust']]})]);
 assert.equal(res(sleep,'a').status,'ambiguous');assert.deepEqual(res(sleep,'a').measurements,['particle_cadr_by_pollutant_and_mode','pollen_dust_cadr_at_sleep_mode']);
 // with no other candidate, the link assumes the unstated condition and cannot assess
 const only=linkValues(qk,view([PURIFIER.measurements[1]]),[v('a',{kind:'volumetric_flow_rate',metric:'cadr',conditions:[['challenge_pollutant','dust']]})]);
 assert.equal(res(only,'a').status,'linked_condition_not_shown');
 assert.ok(res(only,'a').evidence.length>0&&res(only,'a').evidence.every(e=>e.force==='conditions_not_shown'));
});

test('R2 link: competing candidates with the same consequences are immaterial; with different ones the value stays ambiguous', ()=>{
 const same=view([meas('cadr_a',[['o1','partial']]),meas('cadr_b',[['o1','partial']])]);
 const r=linkValues(qk,same,[v('a',{kind:'volumetric_flow_rate',metric:'cadr',conditions:[['fan_setting','top'],['challenge_pollutant','smoke']]})]);
 assert.equal(res(r,'a').status,'linked_equivalent');assert.deepEqual(res(r,'a').measurements,['cadr_a','cadr_b']);
 const diff=view([meas('cadr_a',[['o1','partial']]),meas('smoke_cadr_b',[['o2','partial']])]);
 const r2=linkValues(qk,diff,[v('a',{kind:'volumetric_flow_rate',metric:'cadr'}),v('b',{kind:'volumetric_flow_rate',metric:'cadr',conditions:[['challenge_pollutant','smoke']]})]);
 // 'a' states no pollutant: only cadr_a assumes nothing
 assert.deepEqual(res(r2,'a').measurements,['cadr_a']);
 assert.equal(res(r2,'b').status,'ambiguous');
 // a value stating no pollutant against two candidates that both fix one: the deciding axis is named
 const fixed=view([meas('smoke_cadr_x',[['o1','partial']]),meas('dust_cadr_y',[['o2','partial']])]);
 const r3=linkValues(qk,fixed,[v('c',{kind:'volumetric_flow_rate',metric:'cadr'})]);
 assert.equal(res(r3,'c').status,'ambiguous');assert.deepEqual(res(r3,'c').decidingAxes,['challenge_pollutant']);
});

test('R2 evidence: graded force (direct, partial, indirect, conditions not shown) and what it allows per outcome', ()=>{
 const t=view([meas('mode_power_and_tco',[['energy_cost','direct']],{conditions:[PAIRING]}),
  meas('room_volume_equivalent_ach',[['room_coverage','partial']],{indirectFor:['clean_breathing_zone']})]);
 const r=linkValues(qk,t,[v('p',{kind:'power',conditions:[['fan_setting','sleep']]}),v('np',{kind:'power'},'Acme P2'),v('ach',{kind:'air_change_rate',conditions:[['fan_setting','top']]})]);
 assert.deepEqual(res(r,'p').evidence.map(e=>e.force),['direct']);
 assert.deepEqual(res(r,'np').evidence.map(e=>e.force),['conditions_not_shown']);
 assert.deepEqual(res(r,'ach').evidence.map(e=>e.force).sort(),['indirect','partial']);
 const a=(p:string,o:string)=>r.outcomes.find(x=>x.product===p&&x.outcome===o)?.assessment;
 assert.equal(a('Acme P1','energy_cost'),'direct_evidence');assert.equal(a('Acme P2','energy_cost'),'relevant_conditions_not_shown');
 assert.equal(a('Acme P1','room_coverage'),'partial_contributions');assert.equal(a('Acme P1','clean_breathing_zone'),'indirect_only');
 // a metric's own required condition, missing from the value, also keeps it from assessing
 const m=linkValues(qk,PURIFIER,[v('c',{kind:'volumetric_flow_rate',metric:'cadr',conditions:[['fan_setting','top']],missing:['challenge_pollutant']})]);
 assert.deepEqual(res(m,'c').evidence.map(e=>e.force),['conditions_not_shown']);
 assert.equal(r.rankingInput,false);
});

test('R2 evidence: every contributing measurement the teaching lists, from two measurements, versus only some', ()=>{
 const t=view([meas('cadr_x',[['o','partial']]),meas('mode_power_x',[['o','partial']])]);
 const both=linkValues(qk,t,[v('c',{kind:'volumetric_flow_rate',metric:'cadr',conditions:[['fan_setting','top'],['challenge_pollutant','smoke']]}),v('w',{kind:'power'})]);
 assert.equal(both.outcomes.find(o=>o.outcome==='o')?.assessment,'all_listed_contributions');
 const one=linkValues(qk,t,[v('w',{kind:'power'})]);
 assert.equal(one.outcomes.find(o=>o.outcome==='o')?.assessment,'partial_contributions');
});

test('R2 metamorphic: renaming the product keeps every link and force; removing the only support withdraws the conclusion', ()=>{
 const vals=[v('p',{kind:'power',conditions:[['fan_setting','sleep']]})];
 const a=linkValues(qk,PURIFIER,vals),b=linkValues(qk,PURIFIER,vals.map(x=>({...x,product:'Zeta Z9'})));
 assert.deepEqual(a.results.map(r=>[r.status,r.measurements,r.evidence]),b.results.map(r=>[r.status,r.measurements,r.evidence]));
 assert.deepEqual(a.outcomes.map(o=>[o.outcome,o.assessment]),b.outcomes.map(o=>[o.outcome,o.assessment]));
 assert.ok(a.outcomes.length>0);
 const withdrawn=view(PURIFIER.measurements.map(m=>m.concept.id==='mode_power_and_tco'?{...m,outcomes:[]}:m));
 const c=linkValues(qk,withdrawn,vals);
 assert.equal(res(c,'p').status,'linked');assert.deepEqual(res(c,'p').evidence,[]);assert.equal(c.outcomes.length,0);
});

test('R2 rules: no link without a candidate, no direct or partial force without its conditions (shape over the rule set)', ()=>{
 const rs=JSON.parse(readFileSync(new URL('../../resources/quantity-knowledge/link-rules.v1.json',import.meta.url),'utf8')) as RuleSet;
 loadLinkRules(rs);
 const rules=rs.programs.flatMap(p=>p.rules);
 for(const r of rules.filter(r=>/^linked(_equivalent)?\(/.test(r.rule)))assert.match(r.rule,/:- (chosen|assumed)\(/,r.id);
 for(const r of rules.filter(r=>/^(chosen|assumed)\(/.test(r.rule)))assert.match(r.rule,/(preferred|cand)\(/,r.id);
 assert.match(rules.find(r=>r.id==='E4')!.rule,/conditions_ok\(V,M\)/);
 for(const r of rules.filter(r=>/^outcome_assessment\(P,O,(direct_evidence|all_listed_contributions)\)/.test(r.rule)))assert.doesNotMatch(r.rule,/indirect|conditions_not_shown/,r.id);
});
