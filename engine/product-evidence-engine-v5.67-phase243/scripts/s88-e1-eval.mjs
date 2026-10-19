#!/usr/bin/env node
/** S88 E1: the definition-driven interpreter (src/definition_interpreter.ts) against the sealed S87b blind annotation
 * (condition classes, measurand basis), beside the S87b observation model and the QK axis baseline, per group.
 * Condition class of the definitions arm = the structure of the dimension a condition is typed to.
 *   node scripts/s88-e1-eval.mjs --corpus PRIVATE --annotations PRIVATE --scope dev|check|all [--out PUBLIC] [--private DETAIL]
 * Groups follow evaluation/s88/preregistration.json. Public output: counts only. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists');
const D=new URL('../dist/src/',import.meta.url).href;
const QK=await import(D+'quantity_knowledge.js');const M=await import(D+'observation_model.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');
const qk=QK.loadQuantityKnowledge();const defs=PD.loadPropertyDefinitions(qk);
const pre=JSON.parse(readFileSync(new URL('../evaluation/s88/preregistration.json',import.meta.url),'utf8'));const DEV=new Set(pre.groups.development);
const corpus=JSON.parse(readFileSync(arg('corpus'),'utf8'));const ann=JSON.parse(readFileSync(arg('annotations'),'utf8'));const scope=arg('scope')??'dev';
const condKind={length:'length',area:'area',volume:'volume',mass:'mass',duration:'duration',temperature:'temperature',voltage:'voltage',power:'power',energy:'energy',price_or_tariff:'price_or_tariff',relative_humidity:'relative_humidity'};
const AXIS_CLASS={measurement_distance:'quantity:length',challenge_pollutant:'sample_or_challenge',fan_setting:'operating_setting',air_changes_per_hour:'quantity:other',programme:'operating_setting',
 window_size:'sample_or_challenge',method:'method_or_protocol',inlet_air_state:'quantity:temperature',reference_gamut:'sample_or_challenge',signal_mode:'operating_setting',floor_type:'sample_or_challenge',drive_level:'operating_setting'};
const norm=t=>String(t).replace(/^untaught:/,'').replace(/_/g,' ').trim();
function baseline(o){const p=QK.parseUnit(qk,String(o.unit??''));const conds=(o.conditions??[]).map(norm);
 const tq=p?QK.typeQuantity(qk,{surface:`${o.value} ${o.unit}`,value:o.value,unit:p},{labels:[[o.note,o.measurand].filter(Boolean).join('; ')],conditions:conds}):null;
 return conds.map(t=>{const c=tq?.conditions.find(c=>c.from!=='method'&&(QK.hasPhrase(t,c.raw)||QK.hasPhrase(c.raw,t)));return c?(AXIS_CLASS[c.axis]??'other'):'unclassified';});}
function defClass(r,text){if(!r||!r.structure)return 'unclassified';if(r.structure!=='quantity')return r.structure;const d=r.dimension;
 if(!d){const k=QK.findQuantities(qk,norm(text)).flatMap(x=>x.unit.kinds)[0];return 'quantity:'+(condKind[k]??'other_quantity');}
 if(d.nonQkUnit==='currency_per_energy')return 'quantity:price_or_tariff';
 const ks=d.valueKinds??[];const q=QK.findQuantities(qk,norm(text)).flatMap(x=>x.unit.kinds).find(k=>ks.includes(k));return 'quantity:'+(condKind[q??ks[0]]??'other_quantity');}
const BASIS={per_run:'per_task_or_cycle',per_period:'per_time_period',per_hour:'per_time_period',per_unit:'per_portion_or_unit',none:'none'};
const rows=[];
corpus.forEach((o,i)=>{const g=o.category+' @ '+o.host;const isDev=DEV.has(g);if(scope==='dev'&&!isDev||scope==='check'&&isDev)return;
 const words=[o.note,(o.measurand??'').replace(/_/g,' ')].filter(Boolean).join('; ');
 const m=M.interpretObservation87(qk,{value:o.value,unit:String(o.unit??''),words,conditions:o.conditions??[]});
 const di=I.interpretWithDefinitions(defs,qk,{value:o.value,unit:String(o.unit??''),label:words,conditions:o.conditions??[],category:o.category});
 const b=baseline(o);const a=ann.measurands['o'+i];
 (o.conditions??[]).forEach((c,j)=>{const g0=ann.conditions['o'+i+'c'+j];const mc=m.conditions[j];const mcls=mc.class==='quantity'?'quantity:'+(condKind[mc.kind]??'other_quantity'):mc.class;
  const r=I.classifyConditionWithDefinitions(defs,qk,c,di.property.kind,di.property.value,o.category);
  rows.push({type:'cond',id:'o'+i+'c'+j,group:g,category:o.category,dev:isDev,gold:g0.class,also:g0.also??[],model:mcls,base:b[j],defs:defClass(r,c),defsDim:r?.dimension?.id??null,text:norm(c)});});
 rows.push({type:'meas',id:'o'+i,group:g,category:o.category,dev:isDev,goldBasis:a.basis,modelBasis:m.measurand.basis,defsBasis:BASIS[di.basis.value]??'none',defsBasisState:di.basis.state,property:di.property.value,propertyState:di.property.state,words});});
const ok=(gold,also,x)=>x===gold||(also??[]).includes(x)||(gold.startsWith('quantity:')&&x.startsWith('quantity:')&&(gold==='quantity:other_quantity'||x==='quantity:other_quantity'));
const scoreC=(rs,f)=>{const e=rs.filter(r=>r.gold!=='other');const made=e.filter(r=>r[f]!=='unclassified');const right=made.filter(r=>ok(r.gold,r.also,r[f]));
 return {conditions:e.length,classified:made.length,correct:right.length,wrong:made.length-right.length,coverage:+(made.length/(e.length||1)).toFixed(3),precision:made.length?+(right.length/made.length).toFixed(3):null,accuracy:+(right.length/(e.length||1)).toFixed(3)};};
// four sets against the S87b model: right in both, fixed by defs, broken by defs, wrong in both
const four=(rs,a,b)=>{const e=rs.filter(r=>r.gold!=='other');const R=(r,f)=>r[f]!=='unclassified'&&ok(r.gold,r.also,r[f]);
 return {bothRight:e.filter(r=>R(r,a)&&R(r,b)).length,fixed:e.filter(r=>!R(r,a)&&R(r,b)).length,broken:e.filter(r=>R(r,a)&&!R(r,b)).length,bothWrongOrMissing:e.filter(r=>!R(r,a)&&!R(r,b)).length};};
const basisOk=(g,m)=>g===m||((g==='not_stated'||g==='unclear')&&m==='none');
const scoreM=rs=>({observations:rs.length,model:rs.filter(r=>basisOk(r.goldBasis,r.modelBasis)).length,defs:rs.filter(r=>basisOk(r.goldBasis,r.defsBasis)).length,
 statedGold:rs.filter(r=>!['none','not_stated','unclear'].includes(r.goldBasis)).length,
 statedModel:rs.filter(r=>!['none','not_stated','unclear'].includes(r.goldBasis)&&r.modelBasis===r.goldBasis).length,
 statedDefs:rs.filter(r=>!['none','not_stated','unclear'].includes(r.goldBasis)&&r.defsBasis===r.goldBasis).length,
 defsWrongNonNone:rs.filter(r=>r.defsBasis!=='none'&&r.defsBasis!==r.goldBasis).length,modelWrongNonNone:rs.filter(r=>r.modelBasis!=='none'&&r.modelBasis!==r.goldBasis).length,
 propertyAttributed:rs.filter(r=>r.property).length});
const C=rows.filter(r=>r.type==='cond'),Ms=rows.filter(r=>r.type==='meas');
const pack=(c,m)=>({defs:scoreC(c,'defs'),model87:scoreC(c,'model'),qkBaseline:scoreC(c,'base'),fourSetsVsModel87:four(c,'model','defs'),basis:scoreM(m)});
const keys=(f)=>[...new Set(rows.map(f))].sort();
const out={schema:'pee.s88.e1-eval.v1',scope,definitions:defs.identity,overall:pack(C,Ms),
 byCategory:Object.fromEntries(keys(r=>r.category).map(c=>[c,pack(C.filter(r=>r.category===c),Ms.filter(r=>r.category===c))])),
 byGroup:Object.fromEntries(keys(r=>r.group).map(g=>[g,pack(C.filter(r=>r.group===g),Ms.filter(r=>r.group===g))]))};
const accs=Object.entries(out.byGroup).filter(([,v])=>v.defs.conditions>=5).map(([g,v])=>[g,v.defs.accuracy,v.model87.accuracy]).sort((a,b)=>a[1]-b[1]);out.worstGroupDefs=accs[0]??null;
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');if(arg('private'))writeFileSync(arg('private'),JSON.stringify(rows,null,1)+'\n');
const o=out.overall;console.log('defs',JSON.stringify(o.defs),'\nm87 ',JSON.stringify(o.model87),'\nqk  ',JSON.stringify(o.qkBaseline),'\nfour',JSON.stringify(o.fourSetsVsModel87),'\nbasis',JSON.stringify(o.basis),'\nworst',JSON.stringify(out.worstGroupDefs));
for(const [c,v] of Object.entries(out.byCategory))console.log(c.padEnd(16),'defs',v.defs.accuracy,'prec',v.defs.precision,'| m87',v.model87.accuracy,'| qk',v.qkBaseline.accuracy,'| four',JSON.stringify(v.fourSetsVsModel87),'| basis defs',v.basis.defs+'/'+v.basis.observations,'m87',v.basis.model);
