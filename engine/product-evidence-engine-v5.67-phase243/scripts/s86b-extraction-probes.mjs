#!/usr/bin/env node
/** S86b: extraction-side capability probes, written before any run. Generated from every alternative of the pre-S86 local
 * vocabularies (Phase265 UNITS and DIMENSION_UNITS; Phase226 header units, single-value units and heading words) plus
 * quantities the shared knowledge reads. Fixture pages and values are FICTIONAL. Writes evaluation/s86b/extraction-probes.json.
 * screen probes: a probe candidate with this unit (and declared dimension) -> expect accept (with the physical kind) or reject.
 * table probes: a lab table with this header and cell -> expect a lead (value, kind) or none. */
import {writeFileSync,existsSync} from 'node:fs';
const OUT='evaluation/s86b/extraction-probes.json';if(existsSync(OUT))throw Error(OUT+' exists: sealed, never regenerated');
const P=[];const add=(group,probe,expect)=>P.push({id:'x'+String(P.length+1).padStart(3,'0'),group,probe,expect});
const KIND={mm:'length',cm:'length',kg:'mass',g:'mass',l:'volume',litre:'volume',litres:'volume',liter:'volume',liters:'volume',db:'sound_level',dba:'sound_level','db(a)':'sound_level',
 decibel:'sound_level',decibels:'sound_level','%':'ratio',minute:'duration',minutes:'duration',mins:'duration',min:'duration',hour:'duration',hours:'duration',hrs:'duration',second:'duration',seconds:'duration',ms:'duration',
 w:'power',watt:'power',watts:'power',kwh:'energy',wh:'energy',mah:'charge','°c':'temperature',nits:'luminance','cd/m2':'luminance','cd/m²':'luminance',cfm:'volume_flow','m3/h':'volume_flow','m³/h':'volume_flow',hz:'frequency',ml:'volume'};
// 1. screen: every old UNITS key, no declared dimension -> accepted, with its physical kind
for(const [u,k] of Object.entries(KIND))add('screen:unit',{unit:u,value:12,declared:null},{accept:true,kind:k});
// 2. screen: every old (declared dimension, unit) pair -> accepted; one off-dimension unit each -> rejected
const DU={mass:['g','kg'],volume:['l'],noise:['db','dba'],duration:['ms','seconds','minutes','hours'],length:['mm','cm'],power:['w'],energy:['kwh','wh'],luminance:['nits'],airflow:['cfm','m3/h'],frequency:['hz']};
const OFF={mass:'l',volume:'kg',noise:'w',duration:'kwh',length:'g',power:'kwh',energy:'w',luminance:'db',airflow:'kg',frequency:'w'};
for(const [d,us] of Object.entries(DU)){for(const u of us)add('screen:declared',{unit:u,value:12,declared:d},{accept:true,kind:KIND[u]});add('screen:mismatch',{unit:OFF[d],value:12,declared:d},{accept:false});}
// 3. screen: units the old table lacked, read by the shared knowledge
for(const [u,k] of [['L/day','volume_rate'],['l/24h','volume_rate'],['m³/min','volume_flow'],['kWh/annum','energy_rate'],['Pa','pressure'],['bar','pressure'],['dB(C)','sound_level'],['lux','illuminance'],['rpm','rotational_speed'],['kg/h','mass_rate']])
 add('screen:new_unit',{unit:u,value:12,declared:null},{accept:true,kind:k});
add('screen:new_unit',{unit:'pence',value:12,declared:null},{accept:false,note:'a cost, not a test measurement unit'});
add('screen:new_unit',{unit:'stars',value:4,declared:null},{accept:false});
// 4. tables: the old header-unit list and heading words, in a lab table
const HU=[['Weight (g)','196','mass'],['Weight (kg)','4.2','mass'],['Thickness (mm)','12','length'],['Height (cm)','32','length'],['Capacity (l)','4.5','volume'],['Capacity (litres)','4.5','volume'],
 ['Capacity (liters)','4.5','volume'],['Noise (db)','52','sound_level'],['Noise (dBA)','52','sound_level'],['Battery remaining (%)','80','ratio'],['Response time (ms)','35','duration'],['Boil time (seconds)','150','duration'],
 ['Run time (minutes)','42','duration'],['Runtime (hours)','6','duration'],['Power (W)','1450','power'],['Power (watts)','1450','power'],['Energy (kWh)','0.82','energy'],['Battery (mAh)','5000','charge']];
for(const [h,v,k] of HU)add('table:header_unit',{header:h,cell:v},{lead:true,value:Number(v),kind:k});
for(const [h,v,k] of [['Weight','196 g','mass'],['Capacity','4.5 l','volume'],['Noise','52 dBA','sound_level'],['Run time','42 minutes','duration'],['Power','1450 W','power'],['Energy','0.82 kWh','energy']])
 add('table:cell_unit',{header:h,cell:v},{lead:true,value:parseFloat(v),kind:k});
// contradictions and unsafe headers (old safeguards)
add('table:contradiction',{header:'Measured time (W)',cell:'12'},{lead:false});
add('table:contradiction',{header:'Weight (W)',cell:'12'},{lead:false});
add('table:unsafe',{header:'Manufacturer claimed noise (dB)',cell:'48'},{lead:false});
add('table:unsafe',{header:'Rated power (W)',cell:'1450'},{lead:false});
// 5. tables: quantities beyond the old lists
for(const [h,v,k] of [['Noise (dB(A))','52','sound_level'],['CADR (m³/h)','310','volume_flow'],['Airflow (m3/h)','420','volume_flow'],['Extraction (L/day)','12','volume_rate'],
 ['Energy per cycle (kWh)','0.82','energy'],['Pressure (bar)','9','pressure'],['Brightness (nits)','650','luminance'],['Weight (grams)','196','mass'],['Weight (lb)','4','mass'],['Capacity (ml)','500','volume'],['Capacity (quarts)','5','volume']])
 add('table:new_header',{header:h,cell:v},{lead:true,value:Number(v),kind:k});
// 6. prose: candidate finding (Phase225 pattern) -- measured statements
for(const [t,v,k] of [['We measured 58 dB(A) at one metre on the top setting.',58,'sound_level'],['In our test it used 0.82 kWh over the cycle.',0.82,'energy'],['We measured 196 g of chips after the cycle.',196,'mass'],
 ['Our test took 42 minutes to dry the load.',42,'duration'],['We measured a CADR of 310 m³/h in our chamber.',310,'volume_flow'],['In our test it extracted 12 litres a day at 30°C and 80% RH.',12,'volume_rate'],
 ['We measured 650 nits of peak brightness.',650,'luminance'],['We recorded 9 bar of pump pressure in our test.',9,'pressure'],['In our test it boiled 1 litre in 150 seconds.',150,'duration'],['Our meter read 1450 W during the test.',1450,'power']])
 add('prose:measured',{text:t},{lead:true,value:v,kind:k});
// prose: declarations and conditions must not become results
for(const t of ['The manufacturer claims 52 dB(A).','It is rated at 1700 W.','We measured from 1 m away.'])add('prose:not_result',{text:t},{lead:false});
writeFileSync(OUT,JSON.stringify({schema:'pee.s86b.extraction-probes.v1',written:'2026-10-19, before any run',probes:P},null,1)+'\n');console.log(P.length,'probes');
