#!/usr/bin/env node
/** Phase252 Stage 4 scorer, registered with evaluation/phase252/teaching-protocol.json before any request was collected.
 * Ten dimensions per arm: category/decision, explicit needs, implicit needs, incorrect inferred needs, technical
 * requirements, applicability, declared specifications, missing evidence, correct and harmful decisions, cost.
 * Results are split by whether the request contains a category name shared by both teaching arms (name control).
 * Usage: node scripts/phase252-teaching-score.mjs --bench FILE --runs BASE=F,L=F,G=F [--out FILE]
 */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve} from 'node:path';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const bench=JSON.parse(readFileSync(resolve(F.bench),'utf8'));
const runs=Object.fromEntries(F.runs.split(',').map(x=>{const [k,f]=x.split('=');return [k,JSON.parse(readFileSync(resolve(f),'utf8'))];}));
// Rubric, fixed before collection (from the Phase252 research, so the BASE and L arms cannot meet it by construction).
export const REQUIREMENT_OF={batch_capacity:['capacity_min'],small_kitchen:['width_max','depth_max','height_max'],fast_heating:['power_min'],comfort:['weight_max'],battery_life:['battery_life_min']};
export const APPLICABILITY_NEEDS=['fast_heating','even_heating','grill_browning','cleaning_effort','noise_cancelling','sound_quality'];
export const MISSING_EVIDENCE_NEEDS=['fast_heating','even_heating','defrosting','noise_cancelling','sound_quality','battery_life','microphone_calls'];
const NAMES=['microwave','microwaves','microwave oven','microwave ovens','headphones','headphone','earphones','earbuds','headset','in-ear','over-ear'];
const norm=s=>' '+s.toLowerCase().replace(/[^a-z0-9-]+/g,' ')+' ';
const namePresent=c=>NAMES.some(n=>norm(c.text).includes(' '+n+' '));
const RANK={correct:3,unhelpful:2,premature:1,harmful:0};
function row(c,j,run){
 const got=j.stages.category.basis==='ambiguous'?'ambiguous':j.stages.category.categoryId;
 let quality;
 if(c.expectedBehaviour==='advise')quality=got===c.expectedCategory?'correct':got===null||got==='ambiguous'?'unhelpful':'harmful';
 else if(c.expectedBehaviour==='out_of_scope')quality=got===null?'correct':got==='ambiguous'?'unhelpful':'harmful';
 else quality=got==='ambiguous'||(got===null&&j.decision==='clarify')?'correct':(c.candidates??[]).includes(got)?'premature':'harmful';
 const gotNeeds=new Set(got===c.expectedCategory?j.stages.need.concepts.map(x=>x.id):[]),allGot=j.stages.need.concepts.map(x=>x.id);
 const ex=c.explicitNeeds??[],im=c.implicitNeeds??[],gold=new Set([...ex,...im]);
 const reqExp=[...new Set([...gold].flatMap(n=>REQUIREMENT_OF[n]??[]))];
 const reqGot=new Set(j.stages.requirements.factualRequirements.map(f=>f.criterion).filter(k=>k!=='budget_max'));
 const appExp=[...gold].filter(n=>APPLICABILITY_NEEDS.includes(n));
 const cautionNeeds=new Set(j.stages.requirements.cautions.map(x=>x.conceptId));
 const misExp=[...gold].filter(n=>MISSING_EVIDENCE_NEEDS.includes(n));
 const flagged=n=>j.researchPlan.some(p=>p.startsWith(`missing evidence for ${n}:`)||(p.startsWith('find an original test method for:')&&p.split(':')[1].split(',').map(x=>x.trim()).includes(n)));
 const declaredCounts=run.checkableDeclared?.[c.id]??{};
 return {id:c.id,behaviour:c.expectedBehaviour,role:c.role,namePresent:namePresent(c),expCategory:c.expectedCategory,gotCategory:got,quality,decision:j.decision,
  explicitTp:ex.filter(n=>gotNeeds.has(n)).length,explicitN:ex.length,implicitTp:im.filter(n=>gotNeeds.has(n)).length,implicitN:im.length,
  falseNeeds:allGot.filter(n=>!gold.has(n)).length,falseNeedList:allGot.filter(n=>!gold.has(n)),
  reqTp:reqExp.filter(k=>reqGot.has(k)).length,reqN:reqExp.length,reqFp:[...reqGot].filter(k=>!reqExp.includes(k)).length,
  appTp:appExp.filter(n=>cautionNeeds.has(n)).length,appN:appExp.length,
  declaredChecks:Object.values(declaredCounts).reduce((a,b)=>a+b,0),declaredCriteria:Object.keys(declaredCounts).length,
  misTp:misExp.filter(flagged).length,misN:misExp.length,questions:j.clarificationQuestions.length};
}
function summary(rows,run){
 const sum=k=>rows.reduce((a,r)=>a+r[k],0),cnt=f=>rows.filter(f).length,ratio=(a,b)=>b?+(a/b).toFixed(3):null;
 return {cases:rows.length,
  decision:{correct:cnt(r=>r.quality==='correct'),harmful:cnt(r=>r.quality==='harmful'),unhelpful:cnt(r=>r.quality==='unhelpful'),premature:cnt(r=>r.quality==='premature'),
   advise:{cases:cnt(r=>r.behaviour==='advise'),correct:cnt(r=>r.behaviour==='advise'&&r.quality==='correct')},controlsHarmful:cnt(r=>r.behaviour!=='advise'&&r.quality==='harmful')},
  explicitNeeds:{tp:sum('explicitTp'),of:sum('explicitN'),recall:ratio(sum('explicitTp'),sum('explicitN'))},
  implicitNeeds:{tp:sum('implicitTp'),of:sum('implicitN'),recall:ratio(sum('implicitTp'),sum('implicitN'))},
  incorrectNeeds:{total:sum('falseNeeds'),onControls:rows.filter(r=>r.behaviour!=='advise').reduce((a,r)=>a+r.falseNeeds,0),precision:ratio(sum('explicitTp')+sum('implicitTp'),sum('explicitTp')+sum('implicitTp')+sum('falseNeeds'))},
  requirements:{tp:sum('reqTp'),of:sum('reqN'),fp:sum('reqFp'),recall:ratio(sum('reqTp'),sum('reqN'))},
  applicability:{tp:sum('appTp'),of:sum('appN'),recall:ratio(sum('appTp'),sum('appN'))},
  declaredSpecs:{criteriaDerived:sum('declaredCriteria'),productChecksAvailable:sum('declaredChecks')},
  missingEvidence:{tp:sum('misTp'),of:sum('misN'),recall:ratio(sum('misTp'),sum('misN'))},
  cost:{msTotal:run?.msTotal??null,budget:run?.budget??null,applied:run?.applied??null,questions:sum('questions')}};
}
const out={schema:'pee252.teaching-score.v1',bench:F.bench,split:bench.split,scoredAt:new Date().toISOString(),arms:{},byName:{},paired:{}};
for(const [arm,run] of Object.entries(runs)){const rows=bench.cases.map(c=>row(c,run.journeys[c.id],run));
 out.arms[arm]={...summary(rows,run),rows};
 out.byName[arm]={namePresent:summary(rows.filter(r=>r.namePresent)),nameAbsent:summary(rows.filter(r=>!r.namePresent))};}
for(const [x,y] of [['G','L'],['L','BASE'],['G','BASE']])if(out.arms[x]&&out.arms[y]){const X=out.arms[x].rows,Y=out.arms[y].rows;
 const d=X.map((r,i)=>RANK[r.quality]-RANK[Y[i].quality]),n=X.map((r,i)=>(r.explicitTp+r.implicitTp-r.falseNeeds)-(Y[i].explicitTp+Y[i].implicitTp-Y[i].falseNeeds));
 out.paired[`${x}-${y}`]={decision:{better:d.filter(v=>v>0).length,worse:d.filter(v=>v<0).length,same:d.filter(v=>v===0).length,changed:X.map((r,i)=>d[i]?`${r.id}:${Y[i].quality}->${r.quality}`:null).filter(Boolean)},
  needs:{better:n.filter(v=>v>0).length,worse:n.filter(v=>v<0).length,same:n.filter(v=>v===0).length}};}
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(out,null,1)+'\n');
for(const [a,s] of Object.entries(out.arms)){const {rows,...x}=s;console.log(a,JSON.stringify(x));}
for(const [a,s] of Object.entries(out.byName))console.log(a,'nameAbsent',JSON.stringify({cases:s.nameAbsent.cases,decision:s.nameAbsent.decision,explicit:s.nameAbsent.explicitNeeds,implicit:s.nameAbsent.implicitNeeds}));
for(const [p,s] of Object.entries(out.paired))console.log(p,JSON.stringify(s));
