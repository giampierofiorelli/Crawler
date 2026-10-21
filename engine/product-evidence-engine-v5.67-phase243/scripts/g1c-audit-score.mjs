#!/usr/bin/env node
/** G1c level 2 (scientific correctness of G1b links; evaluation/g1c/preregistration.json levels.L2): merges two blind
 * audits and the blind third adjudication of their disagreements, then counts per stratum (60 random unlinked rows,
 * 60 random strategy-linked rows; evaluation/g1c/audit-sample.json). Public counts only; merged reference private.
 * Usage: node scripts/g1c-audit-score.mjs */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const D=join(homedir(),'.local/share/product-evidence-engine/private-eval/g1c');const J=f=>JSON.parse(readFileSync(join(D,f),'utf8'));
const OUT=new URL('../evaluation/g1c/audit-l2.json',import.meta.url).pathname;if(existsSync(OUT))throw Error(OUT+' exists');
const a=new Map(J('audit-j1.json').items.map(x=>[x.item,x])),b=new Map(J('audit-j2.json').items.map(x=>[x.item,x]));
const adj=new Map(J('audit-j3.json').items.map(x=>[x.item,x.decisions]));const key=new Map(J('audit-key.json').items.map(x=>[x.item,x]));
const agree={situationCoherent:0,categoryRelevant:0,contraindicationsFaithful:0,strategyVerdicts:0,strategyTotal:0};const merged=[];
for(const [id,x] of a){const y=b.get(id);const d=adj.get(id)??[];
 const pick=f=>{if(x[f]===y[f]){agree[f]++;return x[f];}const z=d.find(q=>q.field===f);if(!z)throw Error('unadjudicated '+id+' '+f);return z.value;};
 const sx=new Map(x.strategies.map(s=>[s.strategy,s.verdict])),sy=new Map(y.strategies.map(s=>[s.strategy,s.verdict]));const strategies=[];
 for(const s of new Set([...sx.keys(),...sy.keys()])){agree.strategyTotal++;let v;if(sx.get(s)===sy.get(s)){agree.strategyVerdicts++;v=sx.get(s);}
  else{const z=d.find(q=>q.field==='strategy'&&q.strategy===s);if(!z)throw Error('unadjudicated '+id+' '+s);v=z.value;}
  if(v&&v!=='None')strategies.push({strategy:s,verdict:v});}
 merged.push({item:id,rowId:key.get(id).rowId,linked:key.get(id).linked,situationCoherent:pick('situationCoherent'),categoryRelevant:pick('categoryRelevant'),
  contraindicationsFaithful:pick('contraindicationsFaithful'),strategies});}
writeFileSync(join(D,'audit-merged.json'),JSON.stringify({schema:'pee.g1c.audit-merged.v1',items:merged},null,1));
const count=(xs,f)=>xs.reduce((o,x)=>(o[x[f]]=(o[x[f]]??0)+1,o),{});const strat={};
for(const m of merged)for(const s of m.strategies)strat[s.verdict]=(strat[s.verdict]??0)+1;
const by=l=>{const xs=merged.filter(m=>m.linked===l);return {items:xs.length,situationCoherent:count(xs,'situationCoherent'),categoryRelevant:count(xs,'categoryRelevant'),contraindicationsFaithful:count(xs,'contraindicationsFaithful')};};
writeFileSync(OUT,JSON.stringify({schema:'pee.g1c.audit-l2.v1',level:'L2 scientific correctness of retrieved/linked knowledge',
 sample:'evaluation/g1c/audit-sample.json (seed 20261021; 60 unlinked + 60 strategy-linked rows of 926)',
 judges:'two blind Claude agents (J1, J2), disagreements adjudicated blind by a third (J3); none saw how the links were built',
 agreement:agree,unlinked:by(false),linked:{...by(true),strategyVerdicts:strat},
 note:'agent judgements, not expert review; a sample of one projection (g1b.4)'},null,1)+'\n');
console.log(readFileSync(OUT,'utf8'));
