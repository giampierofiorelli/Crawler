#!/usr/bin/env node
/** Phase247 audit of Phase243 wave planning: family coverage and strong-candidate retention under a fixed budget.
 * Runs the planner on (a) the recorded Phase246 toaster/air-fryer/coffee leads and (b) synthetic skewed populations,
 * comparing the planner passed via --old (a built copy of the previous module) with the current one. No network. */
import {readFileSync,writeFileSync} from 'node:fs';import {createHash} from 'node:crypto';import {resolve} from 'node:path';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const cur=(await import('../dist/src/phase243_budgeted_category_search.js')).planBudgetedCategoryWave243;
const old=F.old?(await import(resolve(F.old))).planBudgetedCategoryWave243:null;
const id=u=>'lead_'+createHash('sha256').update(u).digest('hex').slice(0,16);
const cand=(pid,fam,strong=false)=>({product:{id:pid,categoryId:'c',market:'uk',familyId:fam,stage:'discovery_stub',editorialAppearances:[],
 officialProductIdentityConfirmed:false,marketListingConfirmed:false,novelVerifiedTechnicalFeature:false,explicitNeedTriggered:false,validatedNicheFit:false,verifiedDiscontinued:false},
 researchState:strong?'cheap_screened':'unseen',signals:strong?[{kind:'reviewed_original_test_strength',originalSourceId:'lab_'+pid,publisherId:'lab',sourceRevisionHash:'1'.repeat(64),
 reviewedOriginalMethod:true,reviewedForExactVariantAndMarket:true,productId:pid,market:'uk'}]:[],suspendedUnderScope:null,reviewedHighPotential:false});
const ctx=(fams,budget)=>({categoryId:'c',market:'uk',scopeKey:'c_uk',asOf:'2026-10-14T13:00:00Z',waveOrdinal:1,explicitUserNeedProductIds:[],changedSourceRevisionProductIds:[],
 recoveryMode:'normal',population:{categoryId:'c',market:'uk',enrichmentBudget:0,independentDiscoveryPasses:1,discoveredNewPlausibleInRecentPasses:10,reviewedFamilyIds:fams,demandMode:'general_launch_seed'},
 policy:{version:'audit',mode:'lean_bootstrap',effortBudget:budget,unitCost:{identity:1,cheap_screen:1,deep_review:4,revisit:2},minimumCredibleCandidateCount:2,reservedTailActionPercent:20,auditSuspendedMaxPerWave:1,auditEveryNWaves:5}});
const run=(plan,cands,budget)=>{const fams=[...new Set(cands.map(c=>c.product.familyId))];const w=plan(ctx(fams,budget),cands);
 const chosen=w.choices.map(c=>cands.find(x=>x.product.id===c.productId));
 return {families:new Set(chosen.map(c=>c.product.familyId)).size,familiesAvailable:fams.length,actions:w.totalActions,effort:w.spentEffortUnits,
  strongChosen:chosen.filter(c=>c.signals.length).length,strongAvailable:cands.filter(c=>c.signals.length).length};};
const out={recorded:[],synthetic:[]};
// (a) recorded Phase246 leads (family = host)
const S=JSON.parse(readFileSync(F.state,'utf8'));
for(const cat of ['air_fryers','coffee_machines','toasters']){
 const leads=S.leads.filter(l=>l.category===cat);const cands=leads.map(l=>cand(id(l.url),new URL(l.url).host));
 out.recorded.push({category:cat,leads:leads.length,current:run(cur,cands,6),...(old?{previous:run(old,cands,6)}:{})});
}
// (b) synthetic skewed populations, ids randomised over 200 seeds
const shapes=[[12,1],[8,3,2],[20,2,1,1],[5,5,5],[30,1,1,1,1]];
for(const shape of shapes){
 const agg={current:{families:0,strong:0},previous:{families:0,strong:0}};const runs=200;
 for(let seed=0;seed<runs;seed++){
  const cands=[];shape.forEach((n,f)=>{for(let k=0;k<n;k++)cands.push(cand(createHash('sha256').update(`${seed}:${f}:${k}`).digest('hex').slice(0,12),'fam'+f,k===0&&f===shape.length-1));});
  const a=run(cur,cands,6);agg.current.families+=a.families;agg.current.strong+=a.strongChosen;
  if(old){const b=run(old,cands,6);agg.previous.families+=b.families;agg.previous.strong+=b.strongChosen;}
 }
 out.synthetic.push({familySizes:shape,budgetActions:6,runs,meanFamiliesCovered:{current:+(agg.current.families/runs).toFixed(2),...(old?{previous:+(agg.previous.families/runs).toFixed(2)}:{})},
  strongCandidateInSmallestFamilyChosen:{current:+(agg.current.strong/runs).toFixed(2),...(old?{previous:+(agg.previous.strong/runs).toFixed(2)}:{})}});
}
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(out,null,1));
