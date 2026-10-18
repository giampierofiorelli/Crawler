import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadQuantityKnowledge,parseUnit,findQuantities,typeQuantity,sameQuantity,compareQuantities,readQuantityRequirements,evidenceNeed,type QuantityKnowledge,type QuantityPack} from '../src/quantity_knowledge.js';
import {interpretWithKnowledge1G,unitInLabel1G} from '../src/table_interpreter1g_knowledge.js';
import {interpretDocumentTables1G} from '../src/table_interpreter1g.js';
import {typedMeasures272,linkTypedToMeasure272,linkToMeasure272,type ExtractionPlan272} from '../src/phase272_extraction_plan.js';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';

const qk=loadQuantityKnowledge();
const rawPack=():QuantityPack=>JSON.parse(readFileSync(new URL('../../resources/quantity-knowledge/quantity-knowledge.v1.json',import.meta.url),'utf8'));
const typed=(k:QuantityKnowledge,surface:string,ctx:Parameters<typeof typeQuantity>[2]={})=>{const f=findQuantities(k,surface)[0];assert.ok(f,'no quantity in '+surface);return typeQuantity(k,f,ctx);};

test('pack: validated, sourced and identified by its digest; UCUM is recorded as not used', ()=>{
 assert.match(qk.identity,/^qk\.1:[0-9a-f]{16}$/);
 const p=rawPack();assert.ok(p.sources.find(s=>s.id==='ucum_not_used')!.use.includes('NOT incorporated'));
 for(const k of p.kinds)assert.ok(p.sources.some(s=>s.id===k.source));
 const bad=rawPack();bad.metrics[0].kind='no_such_kind';assert.throws(()=>loadQuantityKnowledge(bad),/quantity_knowledge_invalid/);
 const dup=rawPack();dup.units.push({...dup.units[0],id:'m_again'});assert.throws(()=>loadQuantityKnowledge(dup),/form/);
});

test('units: composed by dimension, not listed; levels keep weighting and reference and are never converted', ()=>{
 const m3h=parseUnit(qk,'m³/h')!,cfm=parseUnit(qk,'CFM')!,cuft=parseUnit(qk,'cu ft/min')!;
 assert.deepEqual([m3h.kinds,cfm.kinds],[['volumetric_flow_rate'],['volumetric_flow_rate']]);
 assert.ok(Math.abs(cfm.factor/m3h.factor-1.69901079552)<1e-9,'1 cfm = 1.699 m³/h (ft = 0.3048 m exactly)');
 assert.equal(cuft.expression,'cfm');
 assert.equal(parseUnit(qk,'sq. ft.')!.kinds[0],'area');
 assert.deepEqual(parseUnit(qk,'dB(A)')!.level,{unit:'dBA',weighting:'A',reference:null,kinds:['sound_pressure_level','sound_power_level']});
 assert.equal(parseUnit(qk,'dBA')!.level!.weighting,'A');assert.equal(parseUnit(qk,'dB')!.level!.weighting,'unspecified');
 assert.deepEqual(parseUnit(qk,'dB(A) re 1 pW')!.kinds,['sound_power_level']);
 // same dimension, different quantities
 assert.deepEqual(parseUnit(qk,'kWh/annum')!.kinds,['periodic_energy_consumption']);assert.deepEqual(parseUnit(qk,'W')!.kinds,['power']);
 assert.deepEqual(parseUnit(qk,'kWh/100 cycles')!.kinds,['energy_per_event']);
 assert.deepEqual([parseUnit(qk,'nits')!.kinds,parseUnit(qk,'cd/m²')!.kinds,parseUnit(qk,'lux')!.kinds],[['luminance'],['luminance'],['illuminance']]);
 assert.deepEqual([parseUnit(qk,'Hz')!.kinds,parseUnit(qk,'rpm')!.kinds,parseUnit(qk,'ACH')!.kinds],[['frequency'],['rotational_speed'],['air_change_rate']]);
 // not units
 assert.equal(parseUnit(qk,'inches / cm'),null,'a ratio of like units lists alternatives');assert.equal(parseUnit(qk,'K'),null,'"4K" is a resolution');
 assert.equal(parseUnit(qk,'uses'),null,'a counted basis appears only per something');
});

test('scanning: ranges, dual expressions and English words that look like symbols', ()=>{
 const f=findQuantities(qk,'CADR of 147 CFM (250 m³/h); Noise Level 40.2 – 66.5 dBA; 2 in the box; a 4K TV; 12 h a day');
 assert.deepEqual(f.map(x=>[x.surface,x.unit.expression]),[['147 CFM','cfm'],['250 m³/h','m^3/h'],['40.2 – 66.5 dBA','dBA']]);
 assert.deepEqual([f[2].low,f[2].high],[40.2,66.5]);
});

test('kind and metric from words: CADR is a metric of flow, fan airflow is another, a label settles sound power', ()=>{
 const cadr=typed(qk,'250 m³/h',{labels:['Clean Air Delivery Rate (CADR)']});assert.equal(cadr.metric.id,'cadr');assert.deepEqual(cadr.missingConditions,['challenge_pollutant','fan_setting']);
 const air=typed(qk,'500 m³/h',{labels:['Max airflow']});assert.equal(air.metric.id,'free_airflow');
 const dust=typed(qk,'134 CFM',{labels:['CADR','Dust'],conditions:['top speed']});assert.deepEqual(dust.conditions.map(c=>c.axis+'='+c.value),['challenge_pollutant=dust','fan_setting=top']);
 const spl=typed(qk,'36.9 dB',{labels:['Speed 1'],context:['Noise level measured from 3 ft. away with a sound level meter']});
 assert.equal(spl.kind.id,'sound_pressure_level');assert.deepEqual(spl.conditions.map(c=>c.axis),['measurement_distance']);assert.equal(spl.weighting,'unspecified');
 const label=typed(qk,'44dB',{labels:['Noise'],context:['its Energy Label claim of 44dB']});assert.equal(label.kind.id,'sound_power_level');
 const bare=typed(qk,'40.2 dBA',{labels:['Noise Level']});assert.equal(bare.kind.id,null,'nothing says pressure or power');assert.deepEqual(bare.kind.candidates,['sound_pressure_level','sound_power_level']);
 // a setting in a nearby paragraph does not say which setting a cell was measured at
 assert.deepEqual(typed(qk,'134 CFM',{labels:['CADR','Dust'],context:['we ran it in sleep mode overnight']}).conditions.map(c=>c.axis),['challenge_pollutant']);
});

test('comparability comes from the knowledge, with reasons', ()=>{
 const a=typed(qk,'147 CFM',{labels:['CADR']}),b=typed(qk,'250 m³/h',{labels:['CADR']});
 assert.equal(sameQuantity(a,b).same,true,'one quantity printed in two units');
 assert.equal(sameQuantity(a,typed(qk,'260 m³/h',{labels:['CADR']})).same,false);
 assert.equal(compareQuantities(qk,b,typed(qk,'500 m³/h',{labels:['Airflow']})).verdict,'not_comparable');
 const dust=typed(qk,'134 CFM',{labels:['CADR','Dust'],conditions:['top speed']}),smoke=typed(qk,'126 CFM',{labels:['CADR','Smoke'],conditions:['top speed']});
 assert.match(compareQuantities(qk,dust,smoke).reasons[0],/challenge pollutant/);
 const dust2=typed(qk,'230 m³/h',{labels:['CADR','Dust'],conditions:['max speed']});const c=compareQuantities(qk,dust,dust2);assert.equal(c.verdict,'comparable');assert.ok(c.a!<c.b!);
 const spl=typed(qk,'45 dB',{context:['measured 1 m away with a sound level meter']}),swl=typed(qk,'44 dB(A) re 1 pW');
 assert.match(compareQuantities(qk,spl,swl).reasons[0],/different quantities/);
 assert.equal(compareQuantities(qk,typed(qk,'40 dBA',{context:['measured 1 m away']}),typed(qk,'41 dB',{context:['measured 1 m away']})).verdict,'undetermined','weighting unknown on one side');
 const ka=typed(qk,'250 kWh/annum'),kb=typed(qk,'0.8 kWh/cycle');assert.equal(compareQuantities(qk,ka,kb).verdict,'not_comparable');
});

test('requirements: every bound read from pack language; ambiguity becomes a question, not a guess', ()=>{
 const r=readQuantityRequirements(qk,'An air purifier with a CADR of at least 200 CFM that is quieter than 45 dBA, no wider than 30 cm, and a TV with at least 1000 nits and 120 Hz or more. A 2 kg chicken.');
 const s=Object.fromEntries(r.map(x=>[x.span,[x.bound,x.status,x.quantity.metric.id??x.quantity.kind.id]]));
 assert.deepEqual(s['at least 200 CFM'],['min','typed','cadr']);
 assert.deepEqual(s['quieter than 45 dBA'],['max','kind_ambiguous',null]);
 assert.deepEqual(s['no wider than 30 cm'],['max','typed','length']);
 assert.deepEqual(s['at least 1000 nits'],['min','typed','luminance']);
 assert.equal(s['120 Hz'][0],'min');
 assert.equal(s['2 kg'][1],'no_bound','a food weight is not a requirement');
 assert.match(r.find(x=>x.span==='quieter than 45 dBA')!.question!,/sound pressure level.*sound power level/s);
 const need=evidenceNeed(qk,r[0].quantity);assert.equal(need.target,'clean air delivery rate');assert.ok(need.methods.includes('ANSI/AHAM AC-1'));assert.deepEqual(need.notEvidence,['fan airflow']);
});

test('knowledge change without code change: a new unit and a new metric reach every consumer', ()=>{
 const text='It must extract at least 20 pints per day and produce no more than 1.5 sones.';
 assert.equal(readQuantityRequirements(qk,text).some(r=>r.span.includes('sones')),false);
 const p=rawPack();
 p.kinds.push({id:'loudness',dim:{},unitOnly:true,terms:['loudness'],source:'pee'} as never);
 p.units.push({id:'sone',forms:['sone','sones'],dim:{},factor:1,kindHint:'loudness',source:'pee'} as never);
 p.metrics.push({id:'dehumidifier_extraction',label:'water extraction',kind:'periodic_volume',terms:['extract','extraction'],requires:[],source:'pee'} as never);
 const k2=loadQuantityKnowledge(p);assert.notEqual(k2.identity,qk.identity,'the reading identity changes with the knowledge');
 const r=readQuantityRequirements(k2,text);
 assert.deepEqual(r.map(x=>[x.span,x.bound,x.quantity.kind.id,x.quantity.metric.id]),[['at least 20 pints per day','min','periodic_volume','dehumidifier_extraction'],['no more than 1.5 sones','max','loudness',null]]);
});

test('ablation: without the knowledge entry the behaviour disappears (cause, not coincidence)', ()=>{
 const p=rawPack();p.units=p.units.filter(u=>u.id!=='cfm');const k2=loadQuantityKnowledge(p);
 assert.equal(findQuantities(k2,'CADR 147 CFM').length,0);
 const p2=rawPack();for(const u of p2.levelUnits)if(u.id==='dBA')u.weighting='unspecified';
 assert.equal(typed(loadQuantityKnowledge(p2),'40 dBA').weighting,'unspecified');
 const p3=rawPack();p3.metrics.find(m=>m.id==='cadr')!.notEquivalentTo=[];p3.metrics.find(m=>m.id==='free_airflow')!.notEquivalentTo=[];const k3=loadQuantityKnowledge(p3);
 assert.doesNotMatch(compareQuantities(k3,typed(k3,'250 m³/h',{labels:['CADR']}),typed(k3,'500 m³/h',{labels:['Airflow']})).reasons[0],/not equivalent/);
});

test('metamorphic: respelling a unit or converting a value never changes the verdict', ()=>{
 for(const [x,y] of [['45 dB(A)','45 dBA'],['250 m³/h','250 m3/h'],['147 CFM','147 cubic feet per minute']]){
  const a=typed(qk,x,{labels:['CADR','Dust'],conditions:['top speed']}),b=typed(qk,y,{labels:['CADR','Dust'],conditions:['top speed']});
  assert.deepEqual([a.kind.id,a.metric.id,a.weighting,a.si,a.conditions],[b.kind.id,b.metric.id,b.weighting,b.si,b.conditions]);}
 const ref=typed(qk,'250 m³/h',{labels:['CADR','Dust'],conditions:['top speed']});
 const conv=typed(qk,'147.1 CFM',{labels:['CADR','Dust'],conditions:['top speed']});
 const c=compareQuantities(qk,ref,conv);assert.equal(c.verdict,'comparable');assert.ok(Math.abs(c.a!-c.b!)<1e-4);
});

const TABLE=`<html><body><h2>Specs</h2><table><tr><th>Model</th><th>Alpha A1</th><th>Beta B2</th></tr>
<tr><td>Clean Air Delivery Rate (CADR)</td><td>147 CFM (250 m³/h)</td><td>100 CFM (170 m³/h)</td></tr>
<tr><td>Noise Level</td><td>40.2 dBA</td><td>48.2 dBA</td></tr><tr><td>Weight</td><td>6.75 lb (3.1 kg)</td><td>8.5 lb</td></tr></table></body></html>`;
test('1G with knowledge: baseline untouched, own identity, dual expressions and weighting kept', ()=>{
 const base=interpretDocumentTables1G(TABLE);const before=JSON.stringify(base);
 const r=interpretWithKnowledge1G(TABLE,qk,{base});assert.equal(JSON.stringify(base),before,'the 1G reading is not modified');
 assert.equal(r.baseReadingIdentity,base.readingIdentity);assert.equal(r.readingIdentity,base.readingIdentity+'+qk:'+qk.identity);
 const obs=r.tables.flatMap(t=>t.observations);
 const m3=obs.filter(o=>o.quantity?.unit.expression==='m^3/h');assert.equal(m3.length,2);assert.ok(m3.every(o=>o.sameAs&&o.quantity!.metric.id==='cadr'));
 const lv=obs.filter(o=>o.quantity?.unit.level);assert.equal(lv.length,2);
 assert.ok(lv.every(o=>o.quantity!.weighting==='A'&&base.tables[0].observations.find(b=>b.id===o.id)!.unit==='db'),'1G alone reads dBA as db');
 assert.notEqual(obs.find(o=>o.surface==='3.1 kg')!.sameAs,null);assert.equal(obs.find(o=>o.surface==='8.5 lb')!.sameAs,null);
 assert.equal(unitInLabel1G(qk,'Weight (pounds / kg)'),null);assert.equal(unitInLabel1G(qk,'Noise During Wash (dB)')!.unit.expression,'dB');
});

test('typed link to taught measurements: a declared proxy never reaches the outcome it cannot establish', ()=>{
 const plan:ExtractionPlan272={schema:'pee272.extraction-plan.v1',categoryId:'c',isEvidence:false,compiledFrom:{items:0,relations:0,digest:''},categoryNouns:[],identity:{requireNamedSubject:true,modelCodeBindsResult:true},
  outcomes:[],units:['m3/h','cfm','db','dba'],sectionCues:[],decisionEvidence:[],
  measurements:[{id:'particle_cadr_by_pollutant',outcomes:['clean_air'],proxyFor:[],dimensions:['airflow'],units:['m3/h','cfm'],terms:['cadr','delivery','rate','airflow','particle'],conditions:[]},
   {id:'in_situ_sound_pressure',outcomes:['quiet'],proxyFor:[],dimensions:['sound'],units:['db','dba'],terms:['sound','pressure','noise'],conditions:[]},
   {id:'sound_power_label',outcomes:['quiet'],proxyFor:[],dimensions:['sound'],units:['db','dba'],terms:['sound','power','label','noise'],conditions:[]}],
  proxies:[{ref:'attr:rated airflow',outcome:'clean_air',terms:['rated','airflow']}]};
 const store=new KnowledgeStore246(':memory:');const tm=typedMeasures272(store,'c',plan,qk);
 assert.deepEqual(tm.map(m=>[m.id,m.metrics,m.kinds]),[['particle_cadr_by_pollutant',['cadr'],[]],['in_situ_sound_pressure',[],['sound_pressure_level']],['sound_power_label',[],['sound_power_level']]]);
 const rated=typed(qk,'400 m3/h',{labels:['Rated airflow']});
 assert.equal(linkToMeasure272(plan,'Rated airflow 400 m3/h','m3/h')!.measureId,'particle_cadr_by_pollutant','the word link reaches CADR');
 const l=linkTypedToMeasure272(plan,tm,rated,'Rated airflow 400 m3/h',qk);assert.equal(l.measureId,null);assert.deepEqual(l.proxyFor,['clean_air']);
 const c=typed(qk,'250 m³/h',{labels:['CADR']});assert.equal(linkTypedToMeasure272(plan,tm,c,'CADR 250 m³/h',qk).measureId,'particle_cadr_by_pollutant');
 const spl=typed(qk,'45 dB',{context:['measured 1 m away']});assert.equal(linkTypedToMeasure272(plan,tm,spl,'45 dB measured 1 m away',qk).measureId,'in_situ_sound_pressure');
 const amb=typed(qk,'44 dB',{labels:['Noise']});const la=linkTypedToMeasure272(plan,tm,amb,'Noise 44 dB',qk);assert.equal(la.measureId,null);assert.equal(la.candidates.length,2);
 store.close();
});

import {extractConstraints253} from '../src/phase253_request_constraints.js';
test('Phase253 requests: a rate is never checked as a capacity (the knowledge reads the whole unit)', ()=>{
 for(const t of ['A dehumidifier that removes at least 12 L/day.','A dehumidifier that can extract at least 20 litres per day.','A kettle that boils at least 1.5 L per minute.']){
  const ex=extractConstraints253(t);assert.equal(ex.constraints.length,0,t);assert.match(ex.unmapped[0].reason,/not a volume/);}
 // capacities, sizes, weights and powers are unchanged
 assert.deepEqual(extractConstraints253('A kettle of at least 1.5 litres, no wider than 20 cm, at least 2000 W.').constraints.map(c=>c.criterion),['capacity_min','width_max','power_min']);
 assert.deepEqual(extractConstraints253('A tumble dryer that takes at least 9 kg per load and weighs no more than 40 kg.').constraints.map(c=>c.criterion),['weight_max']);
});
