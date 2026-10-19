#!/usr/bin/env node
/** S86b: request-side capability probes, written before any run (expectations are the English meaning, not either build's
 * output). Generated systematically from every alternative of the pre-S85 reader's vocabularies (units, bound cues,
 * range forms, context words) plus the quantities the shared quantity knowledge added. Writes evaluation/s86b/request-probes.json.
 * expect: {c:criterion,v:value,b:bound,s?:'stated'|'candidate'} = a checkable constraint; 'visible' = no criterion exists, but
 * the quantity must stay visible (unmapped, quantity requirement or question); 'none' = not a product requirement. */
import {writeFileSync,existsSync} from 'node:fs';
const OUT='evaluation/s86b/request-probes.json';if(existsSync(OUT))throw Error(OUT+' exists: sealed, never regenerated');
const P=[];const add=(group,text,expect)=>P.push({id:'q'+String(P.length+1).padStart(3,'0'),group,text,expect});
// A. every unit spelling of the old unit list, in a clear frame per dimension
for(const u of ['litres','liters','litre','liter','ltr','ltrs','l','L'])add('unit:volume',`I want an air fryer with a capacity of at least 5 ${u}`,{c:'capacity_min',v:5,b:'min',s:'stated'});
for(const u of ['ml','millilitres','milliliters'])add('unit:volume',`I want a coffee machine with a water tank of at least 1500 ${u}`,{c:'water_tank_capacity_min',v:1500,b:'min',s:'stated'});
for(const u of ['quart','quarts','qt'])add('unit:volume',`I want an air fryer with a capacity of at least 6 ${u}`,{c:'capacity_min',v:6,b:'min',s:'stated'});
for(const u of ['cm','centimetres','centimeters','mm','inch','inches','"','ft','feet'])add('unit:length',`I need a dishwasher no wider than 45 ${u}`.replace(' 45 "',' 45"'),{c:'width_max',v:45,b:'max',s:'stated'});
for(const u of ['kg','kilo','kilos','kilogram','kilograms','g','gram','grams','lb','lbs','oz','ounce','ounces'])add('unit:mass',`I want a vacuum cleaner that weighs no more than 6 ${u}`,{c:'weight_max',v:6,b:'max',s:'stated'});
for(const u of ['w','W','watt','watts'])add('unit:power',`I want an air fryer with at least 1500 ${u} of power`,{c:'power_min',v:1500,b:'min',s:'stated'});
for(const u of ['kw','kW'])add('unit:power',`I want a kettle with at least 3 ${u} of power`,{c:'power_min',v:3,b:'min',s:'stated'});
for(const u of ['hours','hour','hrs','hr','h'])add('unit:duration',`I want headphones with a battery life of at least 30 ${u}`,{c:'battery_life_min',v:30,b:'min',s:'stated'});
// no space between number and unit
for(const [t,e] of [['at least 5l capacity',{c:'capacity_min',v:5,b:'min',s:'stated'}],['no wider than 40cm',{c:'width_max',v:40,b:'max',s:'stated'}],['at least 1500W',{c:'power_min',v:1500,b:'min',s:'stated'}],
 ['weighs under 6kg',{c:'weight_max',v:6,b:'max',s:'stated'}],['a battery life of at least 30h',{c:'battery_life_min',v:30,b:'min',s:'stated'}]])add('unit:nospace',`I want one, ${t}`,e);
// B. every bound cue
for(const cue of ['at least','minimum','minimum of','min','min.','no less than','not less than','more than','over','above','bigger than','larger than','greater than','upwards of','at minimum'])
 add('cue:min_before',`An air fryer with a capacity ${cue} 5 litres please`,{c:'capacity_min',v:5,b:'min',s:'stated'});
for(const tail of ['+','or more','or bigger','or larger','minimum','min','at least'])add('cue:min_after',`An air fryer with a capacity of 5 litres ${tail}`.replace('litres +','litres+'),{c:'capacity_min',v:5,b:'min',s:'stated'});
for(const cue of ['at most','maximum','maximum of','max','max.','no more than','not more than','less than','under','below','up to','no bigger than','no larger than','no wider than','smaller than','narrower than','within'])
 add('cue:max_before',`A dishwasher ${cue} 45 cm wide`,{c:'width_max',v:45,b:'max',s:'stated'});
for(const cue of ['no taller than','no higher than'])add('cue:max_before',`A dishwasher ${cue} 82 cm`,{c:'height_max',v:82,b:'max',s:'stated'});
add('cue:max_before','A dishwasher no deeper than 55 cm',{c:'depth_max',v:55,b:'max',s:'stated'});
for(const cue of ['no heavier than','lighter than','shorter than'])add('cue:max_before',cue==='shorter than'?`A dishwasher ${cue} 82 cm`:`A vacuum ${cue} 3 kg`,cue==='shorter than'?{c:'height_max',v:82,b:'max',s:'stated'}:{c:'weight_max',v:3,b:'max',s:'stated'});
for(const tail of ['or less','or smaller','or narrower','or under','max','maximum','at most','or below'])add('cue:max_after',`A dishwasher 45 cm wide ${tail}`,{c:'width_max',v:45,b:'max',s:'stated'});
// C. ranges
add('range','An air fryer between 3 and 5 litres',{c:'capacity_min',v:3,b:'min',s:'stated'});
add('range','An air fryer between 3 litres and 5 litres',{c:'capacity_min',v:3,b:'min',s:'stated'});
add('range','An air fryer of 3-5 litres',{c:'capacity_min',v:3,b:'min',s:'candidate'});
add('range','An air fryer of 3 to 5 litres',{c:'capacity_min',v:3,b:'min',s:'candidate'});
add('range','A dishwasher between 40 and 45 cm wide',{c:'width_max',v:45,b:'max',s:'stated'});
add('range','An air fryer with 1500-1800W',{c:'power_min',v:1500,b:'min',s:'candidate'});
// D. context
add('context','A coffee machine with a water tank of at least 1.5 litres',{c:'water_tank_capacity_min',v:1.5,b:'min',s:'stated'});
add('context','A dehumidifier with a reservoir of at least 3 litres',{c:'water_tank_capacity_min',v:3,b:'min',s:'stated'});
add('context','A dishwasher that fits in a space 57.5 cm wide',{c:'width_max',v:57.5,b:'max',s:'stated'});
add('context','A microwave that fits inside a cupboard 50 cm deep',{c:'depth_max',v:50,b:'max',s:'stated'});
add('context','The alcove is 60 cm wide',{c:'width_max',v:60,b:'max'});
add('context','It must be 57.5 cm wide and 36.5 cm high at most',{c:'height_max',v:36.5,b:'max'});
add('context','I don\'t need at least 5 litres',{c:'capacity_min',v:5,b:'min',s:'candidate'});
add('context','An air fryer big enough for a 2 kg chicken',{none:'weight_max'});
add('context','An air fryer for 4 people',{none:'any'});
add('context','A dishwasher, 45 cm',{visible:true});
add('context','An air fryer around 1500 W',{c:'power_min',v:1500,b:'min'});
// E. numbers
add('number','A kettle of at least 1.7 litres',{c:'capacity_min',v:1.7,b:'min',s:'stated'});
add('number','A kettle of at least 1,7 litres',{c:'capacity_min',v:1.7,b:'min',s:'stated'});
add('number','At least 2,000 W of power',{c:'power_min',v:2000,b:'min',s:'stated'});
add('number','At least 2,000W of power',{c:'power_min',v:2000,b:'min',s:'stated'});
// F. budget (Phase125 reading, unchanged code)
add('budget','An air fryer under £120',{c:'budget_max',v:120,b:'max',s:'stated'});
add('budget','My budget is £80 for a kettle',{c:'budget_max',v:80,b:'max',s:'stated'});
// G. quantities beyond the old unit list (what the shared knowledge adds), and shared gaps
add('qk:rate','A dehumidifier that extracts at least 12 litres a day',{visible:true,none:'capacity_min'});
add('qk:rate','A dehumidifier that extracts at least 12 litres per day',{visible:true,none:'capacity_min'});
add('qk:rate','A dehumidifier rated at 20 L/day or more',{visible:true,none:'capacity_min'});
add('qk:acoustic','A dishwasher quieter than 44 dB(A)',{visible:true});
add('qk:acoustic','A dishwasher under 44 dB',{visible:true});
add('qk:acoustic','A dishwasher of at most 44 dBA',{visible:true});
add('qk:pressure','An espresso machine with at least 15 bar',{visible:true});
add('qk:airflow','An air purifier with a CADR of at least 300 m3/h',{visible:true});
add('qk:airflow','An air purifier with a CADR of at least 300 m³/h',{visible:true});
add('qk:energy','A dishwasher using less than 0.8 kWh per cycle',{visible:true});
add('qk:duration','Headphones with a battery life of at least 1800 minutes',{c:'battery_life_min',v:1800,b:'min',s:'stated'});
add('qk:duration','A robot vacuum with a runtime of at least 120 min',{visible:true});
add('qk:length','A TV of at least 55 inches',{visible:true});
add('qk:length','A dishwasher no wider than 0.45 m',{c:'width_max',v:0.45,b:'max',s:'stated'});
add('qk:length','A dishwasher no wider than 450 millimetres',{c:'width_max',v:450,b:'max',s:'stated'});
add('qk:mass','A vacuum that weighs no more than 2.5 kilogrammes',{c:'weight_max',v:2.5,b:'max',s:'stated'});
add('qk:volume','A fridge of at least 300 litres',{c:'capacity_min',v:300,b:'min',s:'stated'});
add('qk:volume','An air fryer with a capacity of at least 5 litre',{c:'capacity_min',v:5,b:'min',s:'stated'});
add('qk:noise_word','A quiet dishwasher',{visible:true});
add('qk:temperature','A kettle that keeps water at 80 °C',{visible:true});
add('qk:time','A kettle that boils in under 3 minutes',{visible:true});
add('qk:years','A washing machine with a 5 year warranty',{none:'any'});
writeFileSync(OUT,JSON.stringify({schema:'pee.s86b.request-probes.v1',written:'2026-10-19, before any run',probes:P},null,1)+'\n');
console.log(P.length,'probes');
