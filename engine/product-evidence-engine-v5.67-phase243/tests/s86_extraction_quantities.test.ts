import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {probeTransientTestContent225} from '../src/phase225_transient_test_probe.js';
import {screenTestLead265} from '../src/phase265_test_measurements.js';
import {comparativeResults270} from '../src/phase270_comparative_results.js';
import {loadQuantityKnowledge,typeObservedValue,typeStoredQuantity,sameUnit} from '../src/quantity_knowledge.js';

// S86 (owner: one scientific representation for what PEE reads in requests and pages; declarations never become
// measurements because of the publisher). Every page, product and value is FICTIONAL.
const qk=loadQuantityKnowledge();const url='https://review-lab.example.org/tests/review';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const products=[{name:'Sample Purifier P1',model:'P1',sku:'SKU-P1'},{name:'Sample Purifier P2',model:'P2',sku:'SKU-P2'}];
const make=(body:string,prefix='<p>We tested both purifiers ourselves in our lab using a calibrated sensor.</p>')=>`<html><head><title>Fixture</title></head><body>${prefix}${body}</body></html>`;
const table=(heads:string[],rows:[string,...string[]][])=>`<table><caption>Our test measurements</caption><thead><tr><th scope="col">Model</th>${heads.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${
 rows.map(r=>`<tr><th scope="row">${r[0]}</th>${r.slice(1).map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const probe=(html:string,ps=products)=>probeTransientTestContent225(html,url,{productLeads:ps,documentSha256:sha(html)});
const screened=(html:string,ps=products)=>{const x=probe(html,ps);return x.candidates.map(c=>screenTestLead265(c,{url,sha256:sha(html)}));};

test('S86 shared typing: units, weighting, time denominators and metrics come from the quantity knowledge; undecided stays explicit',()=>{
 const t=(value:number,unit:string,labels:string[]=[])=>{const x=typeObservedValue(qk,{value,unit,labels});return [x.unit,x.kind,x.metric,x.weighting,x.per,x.status];};
 assert.deepEqual(t(52,'dB(A)'),['dBA',null,null,'A',null,'kind_ambiguous'],'A-weighting kept; pressure or power level not assumed');
 assert.deepEqual(t(63,'dB',['sound level meter']),['dB','sound_pressure_level',null,'unspecified',null,'typed']);
 assert.deepEqual(t(300,'m³/h',['CADR']),['m^3/h','volumetric_flow_rate','cadr',null,'h','typed']);
 assert.deepEqual(t(300,'m³/h',['max airflow']),['m^3/h','volumetric_flow_rate','free_airflow',null,'h','typed'],'airflow is not CADR');
 assert.deepEqual(t(12,'L/day'),['L/day','periodic_volume',null,null,'day','typed'],'a rate, not a capacity');
 assert.deepEqual(t(5,'L'),['L','volume',null,null,null,'typed']);
 assert.equal(typeObservedValue(qk,{value:7,unit:'furlongs/fortnight-ish'}).status,'unit_not_recognised');
 // stored keys of earlier readers type and compare as the same units
 assert.ok(sameUnit(qk,'kwh','kWh')&&sameUnit(qk,'minutes','min')&&!sameUnit(qk,'kwh','kW'));
 assert.equal(typeStoredQuantity(qk,{value:0.5,unit:'kwh'})!.kind.id,'energy');
 assert.equal(typeStoredQuantity(qk,{value:300,unit:'m^3/h',dimension:'cadr'})!.metric.id,'cadr');
});
test('S86 tables: CADR and airflow columns keep their own measurand; rate and capacity columns are not merged',()=>{
 const html=make(table(['CADR (m³/h)','Max airflow (m³/h)'],[['P1','310','420'],['P2','280','390']]));
 const ok=screened(html).filter(r=>r.ok).map(r=>(r as {ok:true;lead:{value:number;unit:string;dimension:string;quantity?:{metric:string|null}}}).lead);
 assert.deepEqual(ok.map(l=>[l.value,l.unit,l.dimension,l.quantity?.metric]).sort((a,b)=>Number(a[0])-Number(b[0])),
  [[280,'m^3/h','cadr','cadr'],[310,'m^3/h','cadr','cadr'],[390,'m^3/h','free_airflow','free_airflow'],[420,'m^3/h','free_airflow','free_airflow']]);
 const deh=make(table(['Measured daily extraction (L/day)','Measured tank volume (L)'],[['P1','12','3']]),'<p>We tested the dehumidifier ourselves in our lab.</p>');
 const d=screened(deh,[products[0]]).filter(r=>r.ok).map(r=>(r as {ok:true;lead:{value:number;quantity?:{kind:string|null}}}).lead);
 assert.deepEqual(d.map(l=>[l.value,l.quantity?.kind]).sort(),[[12,'periodic_volume'],[3,'volume']]);
});
test('S86 tables: a heading word that contradicts the unit is still withheld; a declared column is never read',()=>{
 const html=make(table(['Measured time (W)'],[['P1','1500']]));
 assert.deepEqual(screened(html,[products[0]]).map(r=>r.ok?'ok':r.reason),['unit_dimension_mismatch']);
 assert.equal(probe(make(table(['Manufacturer CADR (m³/h)'],[['P1','400']])),[products[0]]).candidates.length,0,'a manufacturer column is not a test result');
});
test('S86 prose: a specification quoted in a test sentence is not a measurement; the tester\'s own value is',()=>{
 const html=make('<h2>How we tested</h2><p>During our testing the claimed noise level of 52dB(A) was not what we found: we measured 58dB(A) on the top fan setting.</p>');
 const x=probe(html,[products[0]]);
 assert.deepEqual(x.candidates.map(c=>[c.value,c.unit]),[[58,'db(a)']]);assert.equal(x.declaredValuesSkipped86,1);
 const r=screenTestLead265(x.candidates[0],{url,sha256:sha(html)});assert.ok(r.ok);
 if(r.ok)assert.deepEqual([r.lead.unit,r.lead.quantity?.weighting],['dBA','A'],'the A-weighting reaches the stored unit');
 // a rated power beside a measured energy stays a declaration (Phase268 rule, unchanged)
 const e=probe(make('<p>Rated at 1,700W, it used 0.5 kWh in our test over one hour at 200°C.</p>'),[products[0]]);
 assert.deepEqual(e.candidates.map(c=>c.unit),['kwh']);
});
test('S86 prose: a method mentioned but not performed yields nothing; documented and missing conditions stay distinct',()=>{
 assert.equal(probe(make('<p>We did not test the noise level; the brochure lists 45 dB.</p>'),[products[0]]).candidates.length,0);
 const withC=probe(make('<p>I measured 0.48 kWh over one hour at 200°C with a plug-in power meter.</p>'),[products[0]]).candidates[0];
 const without=probe(make('<p>I measured 0.48 kWh with a plug-in power meter.</p>'),[products[0]]).candidates[0];
 assert.deepEqual([withC.conditionCodes,without.conditionCodes],[['duration_1h','power_meter','setpoint_c'],['power_meter']]);
});
test('S86 comparative: a sentence quoting the maker or a test not done gives no comparative result; the tester\'s results do',()=>{
 const base='<p>For our test we cooked chips in each appliance and measured the energy with a plug-in power meter in our lab.</p>';
 const list=(lines:string[])=>`<html><body>${base}<h3>Chips</h3><ul>${lines.map(l=>`<li>${l}</li>`).join('')}</ul></body></html>`;
 const own=comparativeResults270(list(['Air fryer – 22 mins, 0.28kWh','Built-in oven – 33 mins, 0.85kWh']));
 assert.deepEqual(own.results.filter(r=>r.dimension==='duration').map(r=>[r.appliance,r.value]),[['air_fryer',22],['oven',33]]);
 const quoted=comparativeResults270(list(['Air fryer – 15 mins (claimed by the manufacturer)','Built-in oven – 33 mins, 0.85kWh']));
 assert.ok(!quoted.results.some(r=>r.value===15),'the maker\'s figure is not a result');assert.ok((quoted.declaredSkipped??0)>=1);
 const notDone=comparativeResults270(list(['Air fryer – 22 mins, 0.28kWh','Built-in oven – 40 mins (we did not test the oven; brochure figure)']));
 assert.ok(!notDone.results.some(r=>r.value===40),'a test not done gives no result');
 // and in prose: a quoted maker sentence gives nothing
 const prose=comparativeResults270(`<html><body>${base}<p>The manufacturer claims chips in 15 minutes in the air fryer compared with 25 minutes in the oven.</p></body></html>`);
 assert.equal(prose.results.length,0);
});

test('S86b capability audit: a rated (declared) column is never read as a measured result; restored request capabilities',async()=>{
 const html=make(table(['Rated power (W)','Measured power (W)'],[['Sample Purifier P1','1450','1380']]));
 const leads=screened(html).filter(r=>r.ok).map(r=>r.ok?r.lead.value:null);
 assert.deepEqual(leads,[1380],'the rated column is a declaration');
 const {extractConstraints253}=await import('../src/phase253_request_constraints.js');
 const c=(t:string)=>extractConstraints253(t).constraints.map(x=>[x.criterion,x.value,x.bound,x.status]);
 assert.deepEqual(c('An air fryer with a capacity of 5 litres+'),[['capacity_min',5,'min','stated_in_request']]);
 // S103: both ends of a stated interval are limits
 assert.deepEqual(c('An air fryer between 3 litres and 5 litres'),[['capacity_min',3,'min','stated_in_request'],['capacity_max',5,'max','stated_in_request']]);
 assert.deepEqual(c('A dishwasher 45 cm wide or less'),[['width_max',45,'max','stated_in_request']]);
 assert.deepEqual(c('An air fryer with a capacity min. 5 litres please'),[['capacity_min',5,'min','stated_in_request']]);
 // counterexample: different units never join into one range
 assert.deepEqual(c('a capacity between 3 litres and 5 kg').filter(x=>x[0]==='capacity_min').map(x=>x[1]),[3]);
 const {purchaseTarget253}=await import('../src/phase248_advisory_journey.js');const {CATEGORY_REGISTRY250}=await import('../src/phase248_category_registry.js');
 assert.equal(purchaseTarget253('A dishwasher quieter than 44 dB(A)',CATEGORY_REGISTRY250).category,'dishwashers');
 assert.equal(purchaseTarget253('A dishwasher using less than 1 kWh',CATEGORY_REGISTRY250).category,'dishwashers');
});
