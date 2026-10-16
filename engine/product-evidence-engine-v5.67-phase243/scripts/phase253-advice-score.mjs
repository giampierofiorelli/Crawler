#!/usr/bin/env node
/** Phase253 Stage 8 scorer: validates the gold strictly (validateAdviceGold253 throws on incomplete labels; exit 2)
 * and reports the ten metrics per arm and per tier, plus each case's row.
 * Usage: node scripts/phase253-advice-score.mjs --bench FILE --runs P=FILE,N=FILE [--out FILE]
 */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve} from 'node:path';
import {validateAdviceGold253,scoreRow253,summarise253} from '../dist/src/phase253_advice_contract.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const bench=JSON.parse(readFileSync(resolve(F.bench),'utf8'));
let gold;try{gold=validateAdviceGold253(bench.cases);}catch(e){console.error(String(e.message));process.exit(2);}
const out={schema:'pee253.advice-score.v1',bench:F.bench,scoredAt:new Date().toISOString(),arms:{}};
for(const spec of F.runs.split(',')){const [arm,file]=spec.split('=');const run=JSON.parse(readFileSync(resolve(file),'utf8'));
 const rows=gold.map(g=>{const a=run.advice[g.id];if(!a)throw Error(`run ${arm} has no advice for ${g.id}`);return scoreRow253(g,a);});
 const tiers=[...new Set(gold.map(g=>g.tier))].sort();
 out.arms[arm]={all:summarise253(rows),byTier:Object.fromEntries(tiers.map(t=>[t,summarise253(rows.filter(r=>r.tier===t))])),rows};}
const txt=JSON.stringify(out,null,1)+'\n';if(F.out)writeFileSync(resolve(F.out),txt);
for(const [arm,v] of Object.entries(out.arms)){for(const [t,s] of [['all',v.all],...Object.entries(v.byTier)])
 console.log(arm,t.padEnd(32),'n',s.cases,'| target',s.m1_purchaseTarget.correct,'| cat',s.m2_category.correct,'| constr',`${s.m3_explicitConstraintsAndNeeds.constraints.tp}/${s.m3_explicitConstraintsAndNeeds.constraints.gold} fp ${s.m3_explicitConstraintsAndNeeds.constraints.fp}`,
  '| checks',`${s.m6_productChecks.agree}/${s.m6_productChecks.total}`,'| wrongIn',s.m7_shortlist.wrongInclusions,'missed',s.m7_shortlist.missedInclusions,'| unk→in',s.m8_unknownEvidence.presentedAsMeeting,
  '| prov',`${s.m9_provenance.withFullProvenance}/${s.m9_provenance.included}`,'| resp',`${s.m10_response.correct}/${s.m10_response.of}`,'harm',s.m10_response.harmful);}
