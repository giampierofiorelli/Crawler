#!/usr/bin/env node
/** Phase251 scorer: implements the scoring registered in evaluation/phase251/protocol.json before set 4 was collected.
 * Decision quality per case (correct / unhelpful / premature / harmful), needs, budgets and paired differences.
 * Usage: node scripts/phase251-score.mjs --bench FILE --runs A=F,R=F,D=F [--pairs D:R,R:A] [--out FILE]
 */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve} from 'node:path';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const bench=JSON.parse(readFileSync(resolve(F.bench),'utf8'));
const runs=Object.fromEntries(F.runs.split(',').map(x=>{const [k,f]=x.split('=');return [k,JSON.parse(readFileSync(resolve(f),'utf8'))];}));
const RANK={correct:3,unhelpful:2,premature:1,harmful:0};
function rowFor(c,j){
 const got=j.stages.category.basis==='ambiguous'?'ambiguous':j.stages.category.categoryId;
 let quality;
 if(c.expectedBehaviour==='advise')quality=got===c.expectedCategory?'correct':got===null||got==='ambiguous'?'unhelpful':'harmful';
 else if(c.expectedBehaviour==='out_of_scope')quality=got===null?'correct':got==='ambiguous'?'unhelpful':'harmful';
 else quality=got==='ambiguous'||(got===null&&j.decision==='clarify')?'correct':(c.candidates??[]).includes(got)?'premature':'harmful';
 const gotNeeds=new Set(j.stages.need.concepts.map(x=>x.id)),exp=new Set(c.expectedConcepts??[]);
 const tp=[...exp].filter(x=>gotNeeds.has(x)).length,fp=[...gotNeeds].filter(x=>!exp.has(x)).length;
 const b=j.stages.need.budget;
 const budgetOk=c.expectedBudget?!!b&&b.currency===c.expectedBudget.currency&&b.max===c.expectedBudget.max:!b;
 return {id:c.id,behaviour:c.expectedBehaviour,expCategory:c.expectedCategory,gotCategory:got,basis:j.stages.category.basis,quality,decision:j.decision,
  needTp:tp,needExpected:exp.size,needUnlisted:(c.unlistedNeeds??[]).length,needFp:fp,falseNeedsOutOfScope:c.expectedBehaviour==='out_of_scope'?fp:0,
  gotNeeds:[...gotNeeds].sort(),budgetOk,budgetFound:b?`${b.currency} ${b.min??''}-${b.max}`:null,tags:c.tags??[],rankingAuthorized:j.rankingAuthorized};
}
const out={schema:'pee251.score.v1',bench:F.bench,split:bench.split,scoredAt:new Date().toISOString(),arms:{},paired:{}};
for(const [arm,run] of Object.entries(runs)){
 const rows=bench.cases.map(c=>rowFor(c,run.journeys[c.id]));
 const n=rows.length,cnt=f=>rows.filter(f).length,sum=k=>rows.reduce((a,r)=>a+r[k],0);
 const q=k=>cnt(r=>r.quality===k);const tp=sum('needTp'),ex=sum('needExpected'),un=sum('needUnlisted'),fp=sum('needFp');
 const byTag={};for(const r of rows)for(const t of r.tags){const e=byTag[t]??={cases:0,correct:0,harmful:0};e.cases++;if(r.quality==='correct')e.correct++;if(r.quality==='harmful')e.harmful++;}
 out.arms[arm]={cases:n,decision:{correct:q('correct'),unhelpful:q('unhelpful'),premature:q('premature'),harmful:q('harmful'),
   advise:{cases:cnt(r=>r.behaviour==='advise'),correct:cnt(r=>r.behaviour==='advise'&&r.quality==='correct')},
   outOfScope:{cases:cnt(r=>r.behaviour==='out_of_scope'),correct:cnt(r=>r.behaviour==='out_of_scope'&&r.quality==='correct'),harmful:cnt(r=>r.behaviour==='out_of_scope'&&r.quality==='harmful')}},
  needs:{tp,listedExpected:ex,unlisted:un,fp,falseNeedsOnOutOfScope:sum('falseNeedsOutOfScope'),recallListed:ex?+(tp/ex).toFixed(3):null,recallAll:(ex+un)?+(tp/(ex+un)).toFixed(3):null,precision:(tp+fp)?+(tp/(tp+fp)).toFixed(3):null},
  budget:{correct:cnt(r=>r.budgetOk),of:n,expected:cnt(r=>!!bench.cases.find(c=>c.id===r.id).expectedBudget)},
  unsafeRankings:cnt(r=>r.rankingAuthorized),msTotal:run.msTotal??null,byTag,rows};
}
for(const pair of (F.pairs??'').split(',').filter(Boolean)){const [x,y]=pair.split(':');const X=out.arms[x].rows,Y=out.arms[y].rows;
 const d=X.map((r,i)=>RANK[r.quality]-RANK[Y[i].quality]),n=X.map((r,i)=>(r.needTp-r.needFp)-(Y[i].needTp-Y[i].needFp));
 out.paired[`${x}-${y}`]={decision:{better:d.filter(v=>v>0).length,worse:d.filter(v=>v<0).length,same:d.filter(v=>v===0).length,
   changedCases:X.map((r,i)=>d[i]?`${r.id}:${Y[i].quality}->${r.quality}`:null).filter(Boolean)},
  needs:{better:n.filter(v=>v>0).length,worse:n.filter(v=>v<0).length,same:n.filter(v=>v===0).length}};}
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(out,null,1)+'\n');
for(const [a,s] of Object.entries(out.arms)){const {rows,byTag,...x}=s;console.log(a,JSON.stringify(x));}
for(const [p,s] of Object.entries(out.paired))console.log(p,JSON.stringify(s));
