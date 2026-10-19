import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {applyTeaching252,registerTeachingSources252,type CategoryTeaching252} from '../src/phase252_category_teaching.js';
import {AIR_FRYER_TEACHING269,RESEARCH_SOURCES269} from '../src/phase269_research_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {TELEVISION_TEACHING272,SOURCES272} from '../src/phase272_category_teaching.js';
import {assessRelation247,relations247} from '../src/phase247_category_relations.js';
import {loadQuantityKnowledge,type TypedQuantity} from '../src/quantity_knowledge.js';
import {categoryKnowledge,evidenceUnderKnowledge,attributeEvidence,compareUnderKnowledge,linkUnderKnowledge,linkValues,teachingView,
 type ObservedValue,type KnowledgeAblation} from '../src/knowledge_link.js';
import type {RuleSet} from '../src/knowledge_rules.js';

// S81 (owner brief 2026-10-19, "make scientific knowledge operational"): the SAME algorithms behave differently because
// the acquired teaching is present. Teaching: the code-held category teaching (air fryers, dishwashers, air purifiers,
// televisions) applied to an in-memory store; values are synthetic structured records (T1).
const qk=loadQuantityKnowledge();
registerTeachingSources252([...RESEARCH_SOURCES269,...SOURCES271,...SOURCES272]);
const TEACHING:Record<string,CategoryTeaching252>={air_fryers:AIR_FRYER_TEACHING269,dishwashers:DISHWASHER_TEACHING271,air_purifiers:AIR_PURIFIER_TEACHING271,televisions:TELEVISION_TEACHING272};
function store(cat:string,establish:[string,string][]=[]){
 const s=new KnowledgeStore246(':memory:');if(cat==='air_fryers')seedCategoryHypotheses246(s,cat);applyTeaching252(s,[TEACHING[cat]],'2026-10-19T09:00:00.000Z');
 const items=s.categoryItems246(cat);const ref=(id:string)=>'item:'+items.find(i=>i.concept?.id===id)!.itemId;
 for(const [m,o] of establish){const r=relations247(s,cat).find(x=>x.kind==='measured_by'&&x.from===ref(m)&&x.to===ref(o))!;
  assessRelation247(s,{relationId:r.relationId,value:'establishes',basis:'teaching_source_statement',independence:'human_reviewer',assessor:'test',citation:'test fixture'},'2026-10-19T09:01:00.000Z');}
 return s;
}
const know=(s:KnowledgeStore246,cat:string,ablate:KnowledgeAblation|null=null)=>categoryKnowledge(s,cat,{qk,ablate});
const tq=(kind:string,axes:[string,string][]=[],metric:string|null=null,product='P'):TypedQuantity=>({surface:'',value:1,unit:{expression:'x',kinds:[kind],dim:{},factor:1,offset:0,atoms:[]} as never,si:{value:1},
 kind:{id:kind,candidates:[kind],basis:[],justification:{type:'unit' as never,from:'unit',evidence:[],ref:null,rules:[],derivation:[]}},metric:{id:metric,candidates:[],basis:[]},
 weighting:null,reference:null,conditions:axes.map(([axis,value])=>({axis,value,raw:value,from:'labels' as const})),missingConditions:[],unresolved:[],knowledge:'test',
 source:'doc-'+product,protocol:null,cohort:null,product,contextScope:null});
const val=(id:string,product:string,o:{m?:string;q?:TypedQuantity;states?:Record<string,string>;axes?:[string,string][]}):ObservedValue=>({id,product,measurement:o.m??null,quantity:o.q??null,states:o.states,axes:o.axes});
const pair=(product:string,kind:string,axes:[string,string][],states:Record<string,string>={})=>({...val(product,product,{q:tq(kind,axes,null,product),states}),quantity:tq(kind,axes,null,product)});

test('S81 conditions: a requirement the quantity knowledge cannot type is still a requirement (lk.6 treated it as met)',()=>{
 const s=store('air_fryers',[['energy_per_cooking_task','low_energy_use']]);const k=know(s,'air_fryers');
 const none=evidenceUnderKnowledge(qk,k,[val('v','Fryer A',{m:'energy_per_cooking_task'})]);
 assert.deepEqual(none.byOutcome.low_energy_use,['conditions_not_shown']);
 assert.deepEqual(none.conditionsNotShown.map(c=>c.condition).sort(),['compartments_in_use','completed_doneness','same_food_load']);
 // the absence is closed over the record: the derivation says "not shown", never that the condition was not met
 assert.ok(none.results[0].derivation.some(l=>/not conditions_ok\(v, energy_per_cooking_task\)/.test(l)),none.results[0].derivation.join('\n'));
 const all=evidenceUnderKnowledge(qk,k,[val('v','Fryer A',{m:'energy_per_cooking_task',states:{compartments_in_use:'one drawer',same_food_load:'500 g fries',completed_doneness:'golden'}})]);
 assert.deepEqual(all.byOutcome.low_energy_use,['direct'],'established relation, every condition shown, identified link: direct evidence');
 // knowledge off for requirements: the same value with the same algorithm over-claims
 assert.deepEqual(evidenceUnderKnowledge(qk,know(s,'air_fryers','conditions'),[val('v','Fryer A',{m:'energy_per_cooking_task'})]).byOutcome.low_energy_use,['direct']);
});

test('S81 sufficiency: the store\'s own source verdicts decide the force by default (a caller no longer gets "unverified")',()=>{
 const est=store('air_fryers',[['energy_per_cooking_task','low_energy_use']]),un=store('air_fryers');
 const f=(s:KnowledgeStore246)=>teachingView(s,'air_fryers').measurements.find(m=>m.concept.id==='energy_per_cooking_task')!.outcomes.find(o=>o.outcome==='low_energy_use')!.force;
 assert.equal(f(est),'direct');assert.equal(f(un),'unverified');
 assert.equal(teachingView(est,'air_fryers',null).measurements.find(m=>m.concept.id==='energy_per_cooking_task')!.outcomes[0].force,'unverified','null reproduces the pre-S81 view');
 const states={compartments_in_use:'one drawer',same_food_load:'500 g fries',completed_doneness:'golden'};
 assert.deepEqual(evidenceUnderKnowledge(qk,know(est,'air_fryers','assessments'),[val('v','A',{m:'energy_per_cooking_task',states})]).byOutcome.low_energy_use,['not_verified']);
});

test('S81 principle across categories: results compare only when every required condition is shown equal (knowledge on vs off)',()=>{
 // one principle, four categories, four different taught conditions; no category code
 const cases:[string,string,string,[string,string][],[string,string][],Record<string,string>,Record<string,string>][]=[
  ['air_purifiers','mode_power_and_tco','power',[['fan_setting','sleep']],[['fan_setting','turbo']],{},{}],
  ['dishwashers','wall_plug_kwh_per_programme','energy',[['programme','eco'],['method','plug meter']],[['programme','eco'],['method','plug meter']],
   {programme_identity:'Eco',energy_boundary_hot_fill:'cold fill',method_version_and_jurisdiction:'EN 60436:2020'},{programme_identity:'Eco',energy_boundary_hot_fill:'cold fill',method_version_and_jurisdiction:'EN 60436:2020'}],
  ['televisions','input_lag_by_signal_mode','duration',[['signal_mode','4K 120 Hz game mode']],[['signal_mode','4K 120 Hz game mode']],
   {signal_mode_match:'4K 120 Hz SDR game mode',exact_variant_identity:'TV-A UK'},{signal_mode_match:'4K 120 Hz SDR game mode',exact_variant_identity:'TV-B UK'}],
  // (QK does not read a bare "500 g": a reading limit recorded in the S81 report; this case states 0.5 kg)
  ['air_fryers','energy_per_cooking_task','energy',[],[],{compartments_in_use:'one drawer',same_food_load:'0.5 kg frozen fries',completed_doneness:'golden'},
   {compartments_in_use:'one drawer',same_food_load:'1 kg chicken wings',completed_doneness:'golden'}]];
 for(const [cat,m,kind,ax1,ax2,s1,s2] of cases){const s=store(cat);const on=know(s,cat),off=know(s,cat,'conditions');
  // nothing stated: the knowledge makes comparability unestablished; without it the same algorithm says comparable
  const bare=[pair('A',kind,[]),pair('B',kind,[])] as const;
  assert.equal(compareUnderKnowledge(qk,on,m,bare[0],bare[1]).verdict,'unestablished',cat);
  assert.equal(compareUnderKnowledge(qk,off,m,bare[0],bare[1]).verdict,'comparable',cat+' (knowledge off)');
  const r=compareUnderKnowledge(qk,on,m,pair('A',kind,ax1,s1),pair('B',kind,ax2,s2));
  assert.ok(r.verdict!=='unestablished',cat+': '+JSON.stringify(r.conditions));
  if(cat==='dishwashers'||cat==='televisions')assert.equal(r.verdict,'comparable',cat);else assert.equal(r.verdict,'not_comparable',cat);
  assert.ok(r.derivation.length>0);}
});

test('S81 identity conditions bind each result to its product and are never required to be equal',()=>{
 const s=store('televisions');const k=know(s,'televisions');
 const r=compareUnderKnowledge(qk,k,'off_axis_colour_luminance_shift',pair('A','luminance',[],{exact_variant_identity:'TV-A UK'}),pair('B','luminance',[],{exact_variant_identity:'TV-B EU'}));
 assert.equal(r.verdict,'comparable');assert.ok(!r.conditions.some(c=>c.condition==='exact_variant_identity'));
 // but a single result still has to be bound to its exact variant to count as evidence
 assert.deepEqual(evidenceUnderKnowledge(qk,k,[val('v','TV A',{m:'off_axis_colour_luminance_shift'})]).byOutcome.wide_seating_consistency,['conditions_not_shown']);
});

test('S81 proxies: a declared attribute the teaching marks not sufficient is an indirect indicator only; knowledge off, nothing',()=>{
 const s=store('air_fryers');
 assert.deepEqual(attributeEvidence(know(s,'air_fryers'),[{id:'d',product:'A',attribute:'Capacity'}]).byOutcome.batch_capacity,['indirect']);
 assert.deepEqual(attributeEvidence(know(s,'air_fryers','proxies'),[{id:'d',product:'A',attribute:'capacity'}]).byOutcome,{});
 assert.deepEqual(attributeEvidence(know(s,'air_fryers'),[{id:'d',product:'A',attribute:'colour'}]).byOutcome,{},'an attribute the teaching relates to nothing bears on nothing');
 // the empty-run measurement is a proxy too, whatever conditions its record states
 assert.deepEqual(evidenceUnderKnowledge(qk,know(s,'air_fryers'),[val('v','A',{m:'energy_empty_run',states:{same_food_load:'empty'}})]).byOutcome.low_energy_use,['indirect']);
});

test('S81 counterexample (lk.7 -> lk.8): recording a condition one procedure requires is not evidence against a procedure that does not require it',()=>{
 const s=store('air_fryers');const k=know(s,'air_fryers');
 // an empty-run energy reading that records the compartments in use (the Phase265 store rows do)
 const v={...val('v','Fryer A',{q:tq('energy'),states:{compartments_in_use:'all compartments'}}),quantity:tq('energy')};
 assert.equal(linkUnderKnowledge(qk,k,v).link,'ambiguous','lk.8: empty run and cooking task stay undecided');
 const v7=JSON.parse(readFileSync(new URL('../../resources/quantity-knowledge/link-rules.v7.json',import.meta.url),'utf8')) as RuleSet;
 const r7=linkValues(qk,k.view,[{id:'v',quantity:tq('energy'),product:'Fryer A',states:{compartments_in_use:'all compartments'}}],{rules:v7,descriptors:k.descriptors}).results[0];
 assert.deepEqual(r7.measurements,['energy_per_cooking_task'],'lk.7 reproduces the unsound preference');
});

test('S81 the incomplete-translation cap applies to links made by type, not to identified links',()=>{
 const s=store('air_fryers',[['two_zone_cooking_test','cook_two_foods_simultaneously']]);const k=know(s,'air_fryers');
 assert.deepEqual(evidenceUnderKnowledge(qk,k,[val('v','A',{m:'two_zone_cooking_test',states:{compartments_in_use:'both drawers'}})]).byOutcome.cook_two_foods_simultaneously,['direct']);
});

test('S81 metamorphic: renaming products changes nothing; removing the only support withdraws the conclusion; changing one condition changes comparability',()=>{
 const s=store('air_purifiers',[['mode_power_and_tco','ownership_cost_energy']]);const k=know(s,'air_purifiers');
 const a=compareUnderKnowledge(qk,k,'mode_power_and_tco',pair('A','power',[['fan_setting','sleep']]),pair('B','power',[['fan_setting','sleep']]));
 const b=compareUnderKnowledge(qk,k,'mode_power_and_tco',pair('Zeta','power',[['fan_setting','sleep']]),pair('Omega','power',[['fan_setting','sleep']]));
 assert.equal(a.verdict,'comparable');assert.equal(b.verdict,a.verdict);
 const v=[val('v','A',{m:'mode_power_and_tco',axes:[['fan_setting','auto']]})];
 assert.deepEqual(evidenceUnderKnowledge(qk,k,v).byOutcome.ownership_cost_energy,['direct']);
 const dropped=categoryKnowledge(s,'air_purifiers',{qk,dropRelation:{from:'mode_power_and_tco',to:'ownership_cost_energy',kind:'measured_by'}});
 assert.equal(evidenceUnderKnowledge(qk,dropped,v).byOutcome.ownership_cost_energy,undefined);
 assert.equal(compareUnderKnowledge(qk,k,'mode_power_and_tco',pair('A','power',[['fan_setting','sleep']]),pair('B','power',[['fan_setting','top']])).verdict,'not_comparable');
});

// ---------------------------------------------------------------------------------------------------------------------
// S82 (owner review of S81): whole conditions, "not documented is not different", reader conditions (D27), conditions
// derived from records (D28). Same synthetic structured records over the code-held teaching.
import {withReaderConditions,readerConditionAxes,conditionsMetFromRecords,conditionConcept} from '../src/knowledge_link.js';

test('S82 a condition is shown only whole: an axis named among other components shows a component, never the condition',()=>{
 const s=store('dishwashers');const k=know(s,'dishwashers');
 const acoustic=k.view.measurements.flatMap(m=>m.conditions).find(c=>c.id==='acoustic_quantity_and_position')!;
 const cc=conditionConcept(qk,acoustic);assert.deepEqual(cc.axes,['programme']);assert.equal(cc.whole,false);assert.ok(cc.residue.length>0);
 const programme=conditionConcept(qk,k.view.measurements.flatMap(m=>m.conditions).find(c=>c.id==='programme_identity')!);
 assert.equal(programme.whole,true,'the enumerated programmes are values of the programme axis');assert.ok(programme.enumerated.includes('intensive'));
 // the held-back over-claim of S81: programme and method stated, acoustic condition not shown
 const r=evidenceUnderKnowledge(qk,k,[val('v','W',{m:'in_situ_sound_pressure_time_trace',axes:[['programme','eco']]})]);
 assert.ok(r.conditionsNotShown.some(c=>c.condition==='acoustic_quantity_and_position'));
 assert.ok(!(r.byOutcome.noise_and_acoustic_events??[]).some(f=>f==='direct'||f==='partial'));
});

test('S82 not documented is not different: comparison, identification and the quantity knowledge keep the distinction',()=>{
 const s=store('dishwashers');const k=know(s,'dishwashers');
 const st={energy_boundary_hot_fill:'cold fill',method_version_and_jurisdiction:'EN 60436:2020'};
 // enumerated states named differently: documented different (the teaching lists them as distinct programmes)
 const d=compareUnderKnowledge(qk,k,'wall_plug_kwh_per_programme',pair('A','energy',[['programme','eco']],{...st,programme_identity:'Eco'}),pair('B','energy',[['programme','intensive 70']],{...st,programme_identity:'Intensive 70'}));
 assert.equal(d.verdict,'not_comparable');assert.match(d.conditions.find(c=>c.condition==='programme_identity')!.detail??'',/enumerated/);
 // one record silent: unestablished, never not comparable
 const u=compareUnderKnowledge(qk,k,'wall_plug_kwh_per_programme',pair('A','energy',[['programme','eco']],{...st,programme_identity:'Eco'}),pair('B','energy',[],st));
 assert.equal(u.verdict,'unestablished');
 // identification: an energy reading with no load stated is not shown to be a cooking task rather than an empty run
 const f=store('air_fryers');const kf=categoryKnowledge(f,'air_fryers',{qk:withReaderConditions(qk)});
 const e={...val('v','F',{q:tq('energy')}),quantity:tq('energy')};
 assert.equal(linkUnderKnowledge(withReaderConditions(qk),kf,e).link,'ambiguous');
});

test('S82 D27: reader condition codes reach the reasoning; the empty load identifies the empty run (ablation: without the axes, undecided)',()=>{
 const q2=withReaderConditions(qk);const f=store('air_fryers');const kf=categoryKnowledge(f,'air_fryers',{qk:q2});
 const {axes,unmapped}=readerConditionAxes(['setpoint_c','duration_1h','load_empty','all_compartments','power_meter']);
 assert.deepEqual(axes,[['load','empty'],['compartments','all']]);assert.deepEqual(unmapped,['setpoint_c','duration_1h','power_meter']);
 const energy=(ax:[string,string][])=>({...val('v','F',{q:tq('energy',ax)}),quantity:tq('energy',ax)});
 assert.equal(linkUnderKnowledge(q2,kf,energy(axes)).link,'energy_empty_run');
 assert.equal(linkUnderKnowledge(q2,kf,energy([['compartments','all']])).link,'ambiguous','compartments alone do not tell the procedures apart');
 // ablation: the same algorithm without the reader axes cannot read the code; without the teaching it has nothing to link
 assert.equal(linkUnderKnowledge(qk,know(f,'air_fryers'),energy([])).link,'ambiguous');
 // and as evidence: the empty run is a proxy, whatever is recorded
 assert.deepEqual(evidenceUnderKnowledge(q2,kf,[{...energy(axes),measurement:null}]).byOutcome.low_energy_use,['indirect']);
});

test('S83 D28: validity per observation; incomplete observations are set aside, not allowed to discard complete ones; a declaration is not evidence',()=>{
 const q2=withReaderConditions(qk);const f=store('air_fryers');const kf=categoryKnowledge(f,'air_fryers',{qk:q2});
 const t=(id:string,states:Record<string,string>,axes:[string,string][]=[])=>({id,product:id,quantity:null,states,axes});
 const full={compartments_in_use:'one drawer',same_food_load:'0.5 kg fries',completed_doneness:'golden'};
 const q=(id:string,states:Record<string,string>)=>({id,product:id,quantity:tq('energy',[],null,id),states,axes:[] as [string,string][]});
 const partial={compartments_in_use:'one drawer',completed_doneness:'golden'};
 const d=conditionsMetFromRecords(q2,kf,'energy_per_cooking_task',[q('A',full),q('B',partial),q('C',full)],['compartments_in_use','same_food_load','completed_doneness']);
 // S82 required every record and so derived only two conditions; S83 (owner review of S82): B is incomplete and set
 // aside, the complete tests of two products are used together
 assert.deepEqual(d.observations.map(o=>[o.test,o.usable]),[['A',true],['B',false],['C',true]]);
 assert.equal(d.observations[1].conditions.find(c=>c.condition==='same_food_load')!.state,'not_verifiable');
 // the dimension as compiled holds B, so its food load is not shown for the dimension (S82's answer, kept) ...
 assert.deepEqual([d.derived,d.unsupported],[['compartments_in_use','completed_doneness'],['same_food_load']]);
 // ... and the complete tests of two products, used together with B set aside, show all three
 assert.deepEqual(d.subset,{covered:['A','C'],setAside:['B'],derived:['compartments_in_use','completed_doneness','same_food_load']});assert.equal(d.rankingInput,false);
 // S83 battery regression (S2-K-af-1): ONE product's complete test does not show a condition of comparing it with others
 const one=conditionsMetFromRecords(q2,kf,'energy_per_cooking_task',[q('A',full),q('B',partial)],['compartments_in_use','same_food_load','completed_doneness']);
 assert.deepEqual([one.derived,one.subset,one.unsupported],[['compartments_in_use','completed_doneness'],null,['same_food_load']]);
 // no complete observation: no subset; the dimension shows only what its record shows; the declaration is unsupported
 const none=conditionsMetFromRecords(q2,kf,'energy_per_cooking_task',[t('B',{completed_doneness:'golden'})],['same_food_load']);
 assert.deepEqual([none.derived,none.subset,none.unsupported],[['completed_doneness'],null,['same_food_load']]);
 // two complete observations with a documented difference are not used together
 const e=(id:string,load:string)=>({id,product:id,quantity:tq('energy',[],null,id),states:{...full,same_food_load:load},axes:[] as [string,string][]});
 const g=conditionsMetFromRecords(q2,kf,'energy_per_cooking_task',[e('C','0.5 kg fries'),e('D','1 kg wings')]);
 assert.equal(g.groups.length,2);assert.deepEqual(g.incompatible.map(x=>x.conditions),[['same_food_load']]);
 // reader codes of the tests show the compartments condition (whole: the condition is about the compartments alone)
 const z=(id:string)=>({id,product:id,quantity:tq('energy',[],null,id),states:{},axes:readerConditionAxes(['all_compartments']).axes});
 const c=conditionsMetFromRecords(q2,kf,'two_zone_cooking_test',[z('A'),z('B')],['compartments_in_use']);
 assert.deepEqual(c.derived,['compartments_in_use']);assert.deepEqual(c.unsupported,[]);
 // no tests: nothing is met
 assert.deepEqual(conditionsMetFromRecords(q2,kf,'two_zone_cooking_test',[],['compartments_in_use']).derived,[]);
});
