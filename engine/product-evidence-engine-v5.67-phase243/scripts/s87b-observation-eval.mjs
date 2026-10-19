#!/usr/bin/env node
/** S87b: score the category-free observation model (src/observation_model.ts) and the existing condition axes (baseline:
 * quantity_knowledge.typeQuantity conditions) against the sealed blind annotation, per group.
 *   node scripts/s87b-observation-eval.mjs --corpus PRIVATE --annotations PRIVATE --scope dev|check|all [--untaught-check] [--out PUBLIC] [--private DETAIL]
 * Development groups are fixed in evaluation/s87b/preregistration.json. Public output: counts per group only. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists');
const D=new URL('../dist/src/',import.meta.url).href;
const QK=await import(D+'quantity_knowledge.js');const M=await import(D+'observation_model.js');
const qk=QK.loadQuantityKnowledge();
const pre=JSON.parse(readFileSync(new URL('../evaluation/s87b/preregistration.json',import.meta.url),'utf8'));const DEV=new Set(pre.development);
const corpus=JSON.parse(readFileSync(arg('corpus'),'utf8'));const ann=JSON.parse(readFileSync(arg('annotations'),'utf8'));
const scope=arg('scope')??'dev';
const COARSE={sound_pressure_level:'sound_level',sound_power_level:'sound_level',luminance:'luminance',illuminance:'luminance',volumetric_flow_rate:'volumetric_flow_rate',
 ratio:'ratio_or_percentage',amount_fraction:'ratio_or_percentage',relative_humidity:'ratio_or_percentage',mass_concentration:'concentration',colour_difference:'colour_difference',duration:'duration',
 energy:'energy',energy_per_event:'energy',periodic_energy_consumption:'energy',power:'power',volume:'volume',volume_per_event:'volume',periodic_volume:'volume',air_change_rate:'air_change_rate',
 price_or_cost:'price_or_cost',frequency:'frequency',voltage:'voltage',temperature:'temperature',length:'length',area:'area',mass:'mass'};
const coarse=k=>{if(!k)return null;const ks=String(k).split('|').map(x=>COARSE[x]??x);return new Set(ks).size===1?ks[0]:null;};
const condKind={length:'length',area:'area',volume:'volume',mass:'mass',duration:'duration',temperature:'temperature',voltage:'voltage',power:'power',energy:'energy',price_or_tariff:'price_or_tariff',relative_humidity:'relative_humidity'};
// baseline: the existing pack axes, mapped onto the same classes
const AXIS_CLASS={measurement_distance:'quantity:length',challenge_pollutant:'sample_or_challenge',fan_setting:'operating_setting',air_changes_per_hour:'quantity:other',programme:'operating_setting',
 window_size:'sample_or_challenge',method:'method_or_protocol',inlet_air_state:'quantity:temperature',reference_gamut:'sample_or_challenge',signal_mode:'operating_setting',floor_type:'sample_or_challenge',drive_level:'operating_setting'};
const norm=t=>String(t).replace(/^untaught:/,'').replace(/_/g,' ').trim();
function baseline(o){const p=QK.parseUnit(qk,String(o.unit??''));const conds=(o.conditions??[]).map(norm);
 const tq=p?QK.typeQuantity(qk,{surface:`${o.value} ${o.unit}`,value:o.value,unit:p},{labels:[[o.note,o.measurand].filter(Boolean).join('; ')],conditions:conds}):null;
 return conds.map(t=>{const c=tq?.conditions.find(c=>c.from!=='method'&&(QK.hasPhrase(t,c.raw)||QK.hasPhrase(c.raw,t)));return c?(AXIS_CLASS[c.axis]??'other'):'unclassified';});}
const rows=[];
corpus.forEach((o,i)=>{const g=o.category+' @ '+o.host;const isDev=DEV.has(g);if(scope==='dev'&&!isDev||scope==='check'&&isDev)return;
 const m=M.interpretObservation87(qk,{value:o.value,unit:String(o.unit??''),words:[o.note,(o.measurand??'').replace(/_/g,' ')].filter(Boolean).join('; '),conditions:o.conditions??[]});
 const b=baseline(o);const a=ann.measurands['o'+i];
 (o.conditions??[]).forEach((c,j)=>{const g0=ann.conditions['o'+i+'c'+j];const mc=m.conditions[j];const mcls=mc.class==='quantity'?'quantity:'+(condKind[mc.kind]??'other_quantity'):mc.class;
  rows.push({type:'cond',group:g,category:o.category,publisher:o.host,dev:isDev,gold:g0.class,also:g0.also??[],model:mcls,base:b[j],text:norm(c)});});
 rows.push({type:'meas',group:g,category:o.category,publisher:o.host,dev:isDev,goldKind:a.kind,goldBasis:a.basis,modelKind:coarse(m.measurand.kind),modelBasis:m.measurand.basis,key:m.comparabilityKey});});
const ok=(gold,also,x)=>x===gold||(also??[]).includes(x)||(gold.startsWith('quantity:')&&x.startsWith('quantity:')&&(gold==='quantity:other_quantity'||x==='quantity:other_quantity'));
const scoreC=(rs,f)=>{const e=rs.filter(r=>r.gold!=='other');const made=e.filter(r=>r[f]!=='unclassified');const right=made.filter(r=>ok(r.gold,r.also,r[f]));
 return {conditions:e.length,annotatedOther:rs.length-e.length,classified:made.length,correct:right.length,coverage:+(made.length/(e.length||1)).toFixed(3),precision:made.length?+(right.length/made.length).toFixed(3):null,accuracy:+(right.length/(e.length||1)).toFixed(3)};};
const basisOk=(g,m)=>g===m||((g==='not_stated'||g==='unclear')&&m==='none');
const scoreM=rs=>({observations:rs.length,kindCorrect:rs.filter(r=>r.modelKind===r.goldKind).length,kindProduced:rs.filter(r=>r.modelKind).length,basisCorrect:rs.filter(r=>basisOk(r.goldBasis,r.modelBasis)).length,
 basisStated:rs.filter(r=>!['none','not_stated','unclear'].includes(r.goldBasis)).length,basisStatedCorrect:rs.filter(r=>!['none','not_stated','unclear'].includes(r.goldBasis)&&r.modelBasis===r.goldBasis).length});
const C=rows.filter(r=>r.type==='cond'),Ms=rows.filter(r=>r.type==='meas');
const groups=[...new Set(rows.map(r=>r.group))].sort();
const out={schema:'pee.s87b.observation-eval.v1',scope,build:'see git',overall:{model:scoreC(C,'model'),baseline:scoreC(C,'base'),measurand:scoreM(Ms)},
 byGroup:Object.fromEntries(groups.map(g=>[g,{model:scoreC(C.filter(r=>r.group===g),'model'),baseline:scoreC(C.filter(r=>r.group===g),'base'),measurand:scoreM(Ms.filter(r=>r.group===g))}])),
 byCategory:Object.fromEntries([...new Set(rows.map(r=>r.category))].sort().map(c=>[c,{model:scoreC(C.filter(r=>r.category===c),'model'),baseline:scoreC(C.filter(r=>r.category===c),'base'),measurand:scoreM(Ms.filter(r=>r.category===c))}]))};
const accs=Object.entries(out.byGroup).filter(([,v])=>v.model.conditions>=5).map(([g,v])=>[g,v.model.accuracy,v.baseline.accuracy]);
out.worstGroupConditions=accs.sort((a,b)=>a[1]-b[1])[0]??null;
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');if(arg('private'))writeFileSync(arg('private'),JSON.stringify(rows,null,1)+'\n');
console.log(JSON.stringify({overall:out.overall,worst:out.worstGroupConditions},null,1));
for(const [g,v] of Object.entries(out.byGroup))console.log(g.padEnd(40),'cond acc model',v.model.accuracy,'base',v.baseline.accuracy,'| prec',v.model.precision,'| kind',v.measurand.kindCorrect+'/'+v.measurand.observations,'basis',v.measurand.basisCorrect+'/'+v.measurand.observations);
