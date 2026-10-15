#!/usr/bin/env node
/** Phase250 scorer: scores any arm's journeys (from phase248-journey-eval.mjs or phase250-journey-arms.mjs) against a
 * benchmark with the same rules, so arms are compared on identical terms.
 * Gold fields: expectedCategory (catalogue id, 'other:<name>', null for no purchase decision, or 'ambiguous'),
 * expectedConcepts (catalogue need ids), unlistedNeeds (needs outside the catalogue), expectedBudget.
 * Usage: node scripts/phase250-score.mjs --bench FILE --runs ARM=FILE,ARM=FILE [--out FILE]
 */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve} from 'node:path';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const bench=JSON.parse(readFileSync(resolve(F.bench),'utf8'));
const runs=Object.fromEntries(F.runs.split(',').map(x=>{const [k,f]=x.split('=');return [k,JSON.parse(readFileSync(resolve(f),'utf8'))];}));
export function score(cases,journeys){
 const rows=cases.map(c=>{const j=journeys[c.id];
  const got=j.stages.category.basis==='ambiguous'?'ambiguous':j.stages.category.categoryId;
  const exp=c.expectedCategory??null;
  const known=new Set(Object.values(journeys).flatMap(x=>[x.stages.category.categoryId,...x.stages.category.candidates]).filter(Boolean));
  const gotNeeds=new Set(j.stages.need.concepts.map(x=>x.id));const expNeeds=new Set(c.expectedConcepts??[]);
  const tp=[...expNeeds].filter(x=>gotNeeds.has(x)).length;
  const categoryOk=got===exp;
  // A wrong attribution: a definite category that is not the one the user is choosing.
  const wrongCategory=got!==null&&got!=='ambiguous'&&got!==exp;
  // Justified abstention: the arm does not model the true category and does not pretend to.
  const outOfArm=typeof exp==='string'&&(exp.startsWith('other:')||!j.__registry?.includes(exp));
  const abstained=got===null||got==='ambiguous';
  const budgetOk=c.expectedBudget?!!j.stages.need.budget&&j.stages.need.budget.currency===c.expectedBudget.currency&&j.stages.need.budget.max===c.expectedBudget.max
   :!j.stages.need.budget||c.budgetNotScored===true;
  return {id:c.id,expCategory:exp,gotCategory:got,categoryOk,wrongCategory,justifiedAbstention:!categoryOk&&abstained&&outOfArm,
   needTp:tp,needExpected:expNeeds.size,needUnlisted:(c.unlistedNeeds??[]).length,needFp:[...gotNeeds].filter(x=>!expNeeds.has(x)).length,
   gotNeeds:[...gotNeeds].sort(),missedNeeds:[...expNeeds].filter(x=>!gotNeeds.has(x)).sort(),budgetOk,decision:j.decision,
   advicePath:categoryOk&&j.stages.requirements.categoryHasKnowledge,rankingAuthorized:j.rankingAuthorized};});
 const n=rows.length,sum=k=>rows.reduce((a,r)=>a+r[k],0),cnt=f=>rows.filter(f).length;
 const tp=sum('needTp'),ex=sum('needExpected'),un=sum('needUnlisted'),fp=sum('needFp');
 return {cases:n,
  category:{correct:cnt(r=>r.categoryOk),of:n,wrongAttributions:cnt(r=>r.wrongCategory),justifiedAbstentions:cnt(r=>r.justifiedAbstention),
   correctOrJustified:cnt(r=>r.categoryOk||r.justifiedAbstention)},
  needs:{tp,listedExpected:ex,unlisted:un,fp,recallListed:ex?+(tp/ex).toFixed(3):null,recallAll:(ex+un)?+(tp/(ex+un)).toFixed(3):null,precision:(tp+fp)?+(tp/(tp+fp)).toFixed(3):null},
  budget:{correct:cnt(r=>r.budgetOk),of:n},advicePath:cnt(r=>r.advicePath),unsafeRankings:cnt(r=>r.rankingAuthorized),rows};
}
const out={schema:'pee250.score.v1',bench:F.bench,split:bench.split,scoredAt:new Date().toISOString(),arms:{}};
for(const [arm,run] of Object.entries(runs)){
 // The arm's own registry decides whether a true category was outside its knowledge (justified abstention).
 const reg=run.registryCategories??run.registry??null;
 for(const j of Object.values(run.journeys))j.__registry=reg??[];
 out.arms[arm]=score(bench.cases,run.journeys);
}
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(out,null,1)+'\n');
for(const [arm,s] of Object.entries(out.arms)){const {rows,...x}=s;console.log(arm,JSON.stringify(x));}
