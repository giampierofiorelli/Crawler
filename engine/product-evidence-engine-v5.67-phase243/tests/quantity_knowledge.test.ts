import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadQuantityKnowledge,parseUnit,findQuantities,typeQuantity,sameQuantity,compareQuantities,readQuantityRequirements,evidenceNeed,type QuantityKnowledge,type QuantityPack} from '../src/quantity_knowledge.js';
import {interpretWithKnowledge1G,unitInLabel1G} from '../src/table_interpreter1g_knowledge.js';
import {interpretDocumentTables1G} from '../src/table_interpreter1g.js';
import {typedMeasures272,linkTypedToMeasure272,linkToMeasure272,type ExtractionPlan272} from '../src/phase272_extraction_plan.js';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';

const qk=loadQuantityKnowledge();
const rawPack=():QuantityPack=>JSON.parse(readFileSync(new URL('../../resources/quantity-knowledge/quantity-knowledge.v2.json',import.meta.url),'utf8'));
const typed=(k:QuantityKnowledge,surface:string,ctx:Parameters<typeof typeQuantity>[2]={})=>{const f=findQuantities(k,surface)[0];assert.ok(f,'no quantity in '+surface);return typeQuantity(k,f,ctx);};

test('pack: validated, sourced and identified by its digest; UCUM is recorded as not used', ()=>{
 assert.match(qk.identity,/^qk\.2\.3\+kr\.2:[0-9a-f]{16}$/);
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
 const text='Its condensate output must be at least 20 pints per day and it must produce no more than 1.5 sones.';
 assert.equal(readQuantityRequirements(qk,text).some(r=>r.span.includes('sones')),false);
 const p=rawPack();
 p.kinds.push({id:'loudness',dim:{},unitOnly:true,terms:['loudness'],source:'pee'} as never);
 p.units.push({id:'sone',forms:['sone','sones'],dim:{},factor:1,kindHint:'loudness',source:'pee'} as never);
 // WD (qk.2.3): the real pack now knows 'extract' as a dehumidifier capacity word; the new metric has a word of its own
 p.metrics.push({id:'condensate_output',label:'condensate output',kind:'periodic_volume',terms:['condensate output'],requires:[],source:'pee'} as never);
 const k2=loadQuantityKnowledge(p);assert.notEqual(k2.identity,qk.identity,'the reading identity changes with the knowledge');
 const r=readQuantityRequirements(k2,text);
 assert.deepEqual(r.map(x=>[x.span,x.bound,x.quantity.kind.id,x.quantity.metric.id]),[['at least 20 pints per day','min','periodic_volume','condensate_output'],['no more than 1.5 sones','max','loudness',null]]);
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

// ---------------------------------------------------------------------------------------------------------------------
// v2 (KN, 2026-10-18): methods, relations, scales and label language. Synthetic texts; the facts are those the pack cites.
import {unitStatedInLabel,withLabelBasis,typeLabelledNumber,typeClass,compareClasses,compileExpression,relationChecks,readClassRequirements} from '../src/quantity_knowledge.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';

test('v2 pack: every method, relation, scale and source reference resolves; a bad expression or reference is refused', ()=>{
 const p=rawPack();const ids=new Set(p.sources.map(s=>s.id));
 for(const x of [...p.methods!,...p.relations!,...p.scales!])assert.ok(ids.has(x.source),x.id+' cites '+x.source);
 for(const m of p.methods!)for(const id of m.measures)assert.ok(p.metrics.some(x=>x.id===id),m.id+' measures '+id);
 const b1=rawPack();b1.relations![0].expression='cadr*60/(ach*nope)';assert.throws(()=>loadQuantityKnowledge(b1),/quantity_knowledge_invalid|unknown name/);
 const b3=rawPack();delete (b3.relations![0] as {nature?:string}).nature;assert.throws(()=>loadQuantityKnowledge(b3),/nature and caveat/);
 const b2=rawPack();b2.methods![0].measures=['no_such_metric'];assert.throws(()=>loadQuantityKnowledge(b2),/quantity_knowledge_invalid/);
 assert.throws(()=>compileExpression('x+evil()',['x']),/unknown name/);assert.equal(compileExpression('2^3*log10(100)-1',[])({}),15);
});

test('v2 dimension lists: an axis letter is never a unit (27.16W x 10.5D in is inches, not watts)', ()=>{
 assert.deepEqual(findQuantities(qk,'27.16W x 10.5D x 3.2H inches').map(f=>[f.value,f.unit.expression,f.axis]),[[27.16,'in','W'],[10.5,'in','D'],[3.2,'in','H']]);
 assert.deepEqual(findQuantities(qk,'Power: 30 W').map(f=>[f.value,f.unit.expression,f.axis]),[[30,'W',undefined]]);
 // ablation: without the axis letters the old misreading returns
 const p=rawPack();p.language.en.axisLetters=[];const k=loadQuantityKnowledge(p);
 assert.equal(findQuantities(k,'27.16W x 10.5D x 3.2H inches')[0].unit.expression,'W');
});

test('v2 labels: a unit stated by a label, a basis named by a label, a unitless metric', ()=>{
 assert.equal(unitStatedInLabel(qk,'Airflow (m³/h)')!.unit.expression,'m^3/h');assert.equal(unitStatedInLabel(qk,'Power in watts')!.unit.expression,'W');
 assert.equal(unitStatedInLabel(qk,'Weight (lb, kg)'),null,'two units: none is assumed');
 const b=withLabelBasis(qk,parseUnit(qk,'L')!,['Daily extraction']);assert.deepEqual([b!.unit.expression,b!.basis],['L/day','daily']);
 assert.equal(withLabelBasis(qk,parseUnit(qk,'W')!,['Daily use']),null,'a rate never takes a basis');
 const de=typeLabelledNumber(qk,{surface:'1.2',value:1.2},{labels:['Average Delta E']});assert.equal(de!.metric.id,'display_colour_error');
 assert.equal(typeLabelledNumber(qk,{surface:'1.2',value:1.2},{labels:['Score']}),null);
});

test('acoustics: only the source words decide pressure or power; a bare reading stays ambiguous (owner review 2026-10-18)', ()=>{
 assert.equal(typed(qk,'45 dBA',{labels:['Noise level']}).kind.id,null,'45 dBA alone: pressure or power, not decided');
 assert.equal(typed(qk,'45 dBA',{labels:['Noise level'],context:['measured with a sound level meter 1 m away']}).kind.id,'sound_pressure_level');
 assert.equal(typed(qk,'45 dB(A) re 1 pW',{labels:['Noise']}).kind.id,'sound_power_level');
 assert.equal(typed(qk,'45 dBA',{labels:['LWA']}).kind.id,'sound_power_level');
 assert.equal(typed(qk,'45 dBA',{labels:['Noise emission (energy label)']}).kind.id,'sound_power_level','EU 2019/2017 labels declare sound power');
 // a reading the publisher took is not, by itself, evidence of either kind
 const H=`<html><body><h2>Our test results</h2><table><tr><th>Test</th><th>Alpha A1</th></tr><tr><td>Noise</td><td>45 dBA</td></tr></table></body></html>`;
 const o=interpretWithKnowledge1G(H,qk).tables[0].observations.find(x=>x.quantity?.unit.level)!;assert.equal(o.quantity!.kind.id,null);
 assert.ok(!('notDirectlyMeasured' in qk.kinds.get('sound_power_level')!),'the unjustified marker is gone; the method stays as knowledge');
 assert.equal(qk.kinds.get('sound_power_level')!.determinedBy,'iso_3741_3744_sound_power');
});

test('v2 methods: a named method brings the conditions it fixes; two ratings under different methods do not compare', ()=>{
 const a=typed(qk,'50 pints/day',{labels:['Capacity'],context:['Tested to the DOE standard (appendix X1)']});
 const b=typed(qk,'70 pints/day',{labels:['Capacity'],context:['AHAM DH-1 rating']});
 assert.deepEqual(a.conditions.map(c=>[c.axis,c.from]),[['method','context'],['inlet_air_state','method']]);assert.match(a.conditions[1].value,/65 °f/);
 assert.match(b.conditions.find(c=>c.axis==='inlet_air_state')!.value,/80 °f/);
 const c=compareQuantities(qk,a,b);assert.equal(c.verdict,'not_comparable');assert.match(c.reasons[0],/different method/);
 assert.ok(evidenceNeed(qk,typed(qk,'20 L/day',{labels:['Moisture removal']})).methods.some(m=>/65 °F/.test(m)),'the evidence need names the method and what it fixes');
});

test('v2 relations: consistent, an implied assumption, and no check when the pairing is ambiguous', ()=>{
 const cadr=typed(qk,'200 CFM',{labels:['Smoke CADR']}),ctx={labels:['Room size'],context:['based on 4.8 air changes per hour']};
 const ok=relationChecks(qk,[cadr,typed(qk,'313 sq ft',ctx)]);assert.equal(ok.length,1);assert.equal(ok[0].nature,'sizing_convention');assert.match(ok[0].caveat,/not a measurement/);assert.equal(ok[0].consistent,true);assert.equal(ok[0].expected,312.5);
 const off=relationChecks(qk,[cadr,typed(qk,'420 sq ft',ctx)])[0];assert.equal(off.consistent,false);assert.deepEqual([off.implied!.name,off.implied!.value],['height',5.95]);
 assert.equal(relationChecks(qk,[cadr,typed(qk,'180 CFM',{labels:['Dust CADR']}),typed(qk,'313 sq ft',ctx)])[0].inputs.cadr.value,200,'AHAM sizes by the smoke CADR');
 assert.deepEqual(relationChecks(qk,[typed(qk,'200 CFM',{labels:['CADR']}),typed(qk,'150 CFM',{labels:['CADR']}),typed(qk,'313 sq ft',ctx)]),[],'two CADRs, nothing pairs one: no guess');
 assert.equal(relationChecks(qk,[typed(qk,'2 kW',{labels:['Power']}),typed(qk,'1.5 h',{labels:['Cycle time']}),typed(qk,'3 kWh',{labels:['Energy']})])[0].consistent,true);
 const p=rawPack();p.relations=[];assert.deepEqual(relationChecks(loadQuantityKnowledge(p),[cadr,typed(qk,'313 sq ft',ctx)]),[],'ablation');
});

test('v2 scales: an A+++ is pre-rescaling, a B needs the group and date, classes compare only on one scale', ()=>{
 const old=typeClass(qk,'A+++',{labels:['Energy class']})!;assert.equal(old.scale,'eu_energy_class_pre2021');
 const b=typeClass(qk,'B',{labels:['Energy class']})!;assert.equal(b.scale,null);assert.equal(b.candidates.length,2);
 const bNow=typeClass(qk,'B',{labels:['Energy class'],productGroup:'dishwashers',date:'2026-10-18'})!;assert.equal(bNow.scale,'eu_energy_class_2021');
 assert.equal(typeClass(qk,'B',{labels:['Energy class'],productGroup:'tumble_dryers',date:'2025-01-01'})!.scale,'eu_energy_class_pre2021','tumble dryers rescaled on 1 July 2025');
 assert.equal(compareClasses(qk,old,bNow).verdict,'not_comparable');assert.equal(compareClasses(qk,old,b).verdict,'undetermined');
 assert.deepEqual(compareClasses(qk,typeClass(qk,'H13')!,typeClass(qk,'H14')!),{verdict:'comparable',reasons:['same scale'],order:1});
 assert.equal(typeClass(qk,'B'),null,'a bare letter with no scale named is not a class');
});

test('v2 class requirements: read with their bound and scale; the advice states them, and is unchanged without the knowledge', ()=>{
 assert.deepEqual(readClassRequirements(qk,'energy class B or better',{productGroup:'dishwashers',date:'2026-10-18'}).map(r=>[r.span,r.value,r.bound,r.scale]),[['energy class B or better','B','min','eu_energy_class_2021']]);
 const old=readClassRequirements(qk,'I want an A+++ rated dishwasher',{productGroup:'dishwashers',date:'2026-10-18'})[0];assert.equal(old.scale,'eu_energy_class_pre2021');assert.match(old.note!,/no longer used for dishwashers/);
 assert.equal(readClassRequirements(qk,'true HEPA H13 please')[0].scale,'en_1822_filter_class');
 const s=new KnowledgeStore246(':memory:');
 for(const t of ['energy class B fridge','A tumble dryer, energy class A+++','I want a quiet kettle']){
  const a0=adviseFromRequest253(t,s,CATEGORY_REGISTRY250),a0b=adviseFromRequest253(t,s,CATEGORY_REGISTRY250,{date:'2026-10-18'});
  assert.equal(JSON.stringify(a0b),JSON.stringify(a0),'without the knowledge the date changes nothing');assert.equal(a0.classRequirements,undefined);}
 const a=adviseFromRequest253('energy class B fridge',s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-18'});
 assert.deepEqual(a.classRequirements!.map(r=>[r.span,r.scale]),[['energy class B',null]]);assert.ok(a.unassessedObjectives.includes('energy class B'));
 assert.ok(a.questions.some(q=>/Which label do you mean by "energy class B"/.test(q)),'an ambiguous scale becomes a question');
 s.close();
});

test('v2 in 1G: <br>-separated values keep their own labels; a label unit and an axis letter are read in the cell', ()=>{
 const H=`<html><body><table><tr><th>Spec</th><th>Alpha A1</th></tr><tr><td>Airflow (m³/h)</td><td>250</td></tr>
<tr><td>Dimensions</td><td>27.16W x 10.5D x 3.2H inches</td></tr><tr><td>Energy class</td><td>A+++</td></tr></table></body></html>`;
 const r=interpretWithKnowledge1G(H,qk);const obs=r.tables.flatMap(t=>t.observations);
 const air=obs.find(o=>o.value===250)!;assert.deepEqual([air.unitFrom,air.quantity!.unit.expression],['label','m^3/h']);
 assert.ok(obs.filter(o=>o.quantity?.unit.expression==='W').length===0,'no watts in a dimension list');
 assert.equal(obs.find(o=>o.scaleClass)?.scaleClass!.scale,'eu_energy_class_pre2021');
});

test('KN errors become knowledge and mechanism: "HEPA" is not an efficiency; a bare percentage links to no measurement', ()=>{
 assert.equal(typed(qk,'33%',{context:['HEPA filter']}).metric.id,null,'the word names the filter, not the percentage');
 assert.equal(typed(qk,'99.97%',{labels:['Filter efficiency']}).metric.id,'hepa_filter_class');
 const plan:ExtractionPlan272={schema:'pee272.extraction-plan.v1',categoryId:'c',isEvidence:false,compiledFrom:{items:0,relations:0,digest:''},categoryNouns:[],identity:{requireNamedSubject:true,modelCodeBindsResult:true},
  outcomes:[],units:['%'],sectionCues:[],decisionEvidence:[],measurements:[{id:'gas_reduction_percentage',outcomes:['odour'],proxyFor:[],dimensions:['ratio'],units:['%'],terms:['reduction','gas'],conditions:[]}],proxies:[]};
 const store=new KnowledgeStore246(':memory:');const tm=typedMeasures272(store,'c',plan,qk);
 assert.equal(linkTypedToMeasure272(plan,tm,typed(qk,'100%',{labels:['Warranty']}),'Warranty 100%',qk).measureId,null);
 assert.equal(linkTypedToMeasure272(plan,tm,typed(qk,'92%',{labels:['Gas reduction']}),'Gas reduction 92%',qk).measureId,'gas_reduction_percentage','the measurement words still link it');
 store.close();
});

// KN K9 (owner review 2026-10-18): maximise justified conclusions; record how each kind is justified. Synthetic pages.
const page=(intro:string,heading:string,rows:string)=>`<html><body><h1>Review</h1>${intro}<h2>${heading}</h2><table><tr><th>Test</th><th>Alpha A1</th><th>Beta B2</th></tr>${rows}</table></body></html>`;
const levelObs=(h:string)=>interpretWithKnowledge1G(h,qk).tables.flatMap(t=>t.observations).filter(o=>o.quantity?.unit.level);
test('K9 protocol: a document stating its instrument once establishes sound pressure for its own readings, with provenance', ()=>{
 const h=page('<p>We measured the noise of every purifier with a decibel meter at all fan speeds.</p>','Our test results','<tr><td>Noise (measured)</td><td>45 dBA</td><td>52 dBA</td></tr>');
 const o=levelObs(h);assert.equal(o.length,2);
 for(const x of o){assert.equal(x.quantity!.kind.id,'sound_pressure_level');assert.deepEqual([x.quantity!.kind.justification.type,x.quantity!.kind.justification.from],['documented_method','protocol']);
  assert.match(x.quantity!.kind.justification.ref!,/^block /);assert.ok(x.quantity!.missingConditions.includes('measurement_distance'),'the distance stays a comparability condition');}
 // one source, one protocol: they compare with each other, not with other sources
 const c=compareQuantities(qk,o[0].quantity!,o[1].quantity!);assert.equal(c.verdict,'comparable_within_source');assert.match(c.reasons[0],/not comparable with other sources/);
 // K10: one source and one protocol do not make two tests comparable (lowest vs highest speed)
 const sp=levelObs(page('<p>We measured the noise of every purifier with a decibel meter.</p>','Our test results','<tr><td>Noise, lowest speed</td><td>32 dBA</td><td>35 dBA</td></tr><tr><td>Noise, highest speed</td><td>55 dBA</td><td>60 dBA</td></tr>'));
 const v=(x:number)=>sp.find(o=>o.value===x)!.quantity!;
 assert.equal(compareQuantities(qk,v(32),v(35)).verdict,'comparable_within_source','one presented test, two products');
 for(const [x,y] of [[32,55],[32,60]])assert.equal(compareQuantities(qk,v(x),v(y)).verdict,'comparable_conditions_unestablished','different tests of the same source');
 const other=levelObs(h.replace('Alpha A1','Gamma G3'))[0];const elsewhere={...other.quantity!,source:'doc:other'};
 assert.equal(compareQuantities(qk,o[0].quantity!,elsewhere).verdict,'comparable_conditions_unestablished');
});
test('K9 protocol limits: a maker spec is not covered by the reviewer\'s instrument; a power statement defeats; no protocol, no kind', ()=>{
 const spec=page('<p>We measured the noise with a decibel meter.</p>','Manufacturer specifications','<tr><td>Noise level (declared by the manufacturer)</td><td>45 dBA</td><td>52 dBA</td></tr>');
 const s=levelObs(spec);if(s.length&&s[0].evidence.class==='manufacturer_declared')assert.equal(s[0].quantity!.kind.id,null,'a declared spec is not a reading of the reviewer\'s meter');
 const both=page('<p>We record the noise with a decibel meter and compute the sound power from these readings.</p>','Our test results','<tr><td>Noise (measured)</td><td>45 dBA</td><td>52 dBA</td></tr>');
 assert.equal(levelObs(both)[0].quantity!.kind.id,null,'the document names both quantities: ambiguous');
 const none=page('<p>A quiet machine.</p>','Our test results','<tr><td>Noise</td><td>45 dBA</td><td>52 dBA</td></tr>');
 assert.deepEqual([levelObs(none)[0].quantity!.kind.id,levelObs(none)[0].quantity!.kind.justification.type],[null,'insufficient']);
});
test('K9 restated value and standard: a label claim the text restates is sound power under the EU label scheme', ()=>{
 const h=page('<p>It ran close to its quiet energy label claim of 44 dB.</p>','In use','<tr><td>Noise during wash</td><td>44 dB</td><td>47 dB</td></tr>');
 const o=levelObs(h);const a=o.find(x=>x.value===44)!,b=o.find(x=>x.value===47)!;
 assert.equal(a.quantity!.kind.id,'sound_power_level');assert.equal(a.quantity!.kind.justification.type,'standard');assert.match(a.quantity!.kind.justification.ref!,/restates the value/);
 assert.equal(b.quantity!.kind.id,null,'the claim speaks about 44 dB only');
});
test('K9 header units: a header unit never reaches a number of a cell that prints its own unit (speed index)', ()=>{
 const h=`<html><body><table><tr><th>Noise level in decibels</th><th>Alpha A1</th></tr><tr><td>Fan</td><td>Speed 1<br>40.2 dBA</td></tr><tr><td>Night (dB)</td><td>31</td></tr></table></body></html>`;
 const o=interpretWithKnowledge1G(h,qk).tables.flatMap(t=>t.observations);
 assert.ok(!o.some(x=>x.value===1&&x.quantity),'the 1 of "Speed 1" is not a level');
 assert.equal(o.find(x=>x.surface==='40.2 dBA')!.quantity!.unit.level!.weighting,'A');
 const n=o.find(x=>x.value===31);if(n)assert.equal(n.unitFrom,'label','a bare number alone in its cell still takes the header unit');
});
test('K9 pack: document-wide justifications must say which values they cover', ()=>{
 const p=rawPack();delete p.kindEvidence!.find(e=>e.justification==='documented_method')!.covers;assert.throws(()=>loadQuantityKnowledge(p),/must say which values it covers/);
 const p2=rawPack();p2.kindEvidence=[];const k=loadQuantityKnowledge(p2);
 assert.equal(levelObs(page('<p>We measured the noise with a decibel meter.</p>','Our test results','<tr><td>Noise</td><td>45 dBA</td><td>52 dBA</td></tr>')).length>0,true);
 const o=interpretWithKnowledge1G(page('<p>We measured the noise with a decibel meter.</p>','Our test results','<tr><td>Noise</td><td>45 dBA</td><td>52 dBA</td></tr>'),k).tables[0].observations.find(x=>x.quantity?.unit.level)!;
 assert.equal(o.quantity!.kind.id,null,'ablation: without the kind evidence the protocol establishes nothing');
});
