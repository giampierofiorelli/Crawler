#!/usr/bin/env node
/** G1d source trace (evaluation/g1d/preregistration.json material.trace): the 120 rows of the G1c L2 audit traced to their
 * original source passages by two new blind Claude agents (relation per strategy read from the source only). Classifies
 * the 70 G1b links and finds source-supported relations G1b missed. Public counts only. Never overwrites. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const D=join(homedir(),'.local/share/product-evidence-engine/private-eval/g1d/trace');const J=f=>JSON.parse(readFileSync(join(D,f),'utf8'));
const OUT=new URL('../evaluation/g1d/trace.json',import.meta.url).pathname;if(existsSync(OUT))throw Error(OUT+' exists');
const K=J('key.json').items,S=J('input.json').strategies.map(s=>s.id),I=new Map(J('input.json').items.map(x=>[x.item,x]));
const A=[1,2].map(i=>new Map(J(`judge-${i}.json`).items.map(x=>[x.item,x])));
const rel=(j,it,s)=>(j.get(it).pairs??[]).find(p=>p.strategy===s)?.relation??'not_addressed';
const pos=r=>r==='supported'||r==='conditional';const inc=(o,k)=>o[k]=(o[k]??0)+1;
const T={rows:K.length,pairs:K.length*S.length,g1bLinks:0,g1bLinkByJudge:[{},{}],g1bLinkAgreed:{},g1bLinkAgreement:0,
 sourcePositivesBoth:0,sourcePositivesEither:0,positivesLinkedByG1b:0,positivesMissedByG1b:0,missedBySourceType:{},positivesBySourceType:{},
 natureOfPositives:{},pairAgreement:0,extraction:[{},{}],sourceStatus:{}};
for(const k of K){const it=k.item,type=I.get(it).source.type;
 for(const s of S){const a=rel(A[0],it,s),b=rel(A[1],it,s);if(a===b)T.pairAgreement++;
  if(k.g1bLinks.includes(s)){T.g1bLinks++;inc(T.g1bLinkByJudge[0],a);inc(T.g1bLinkByJudge[1],b);if(a===b){T.g1bLinkAgreement++;inc(T.g1bLinkAgreed,a);}}
  if(pos(a)||pos(b))T.sourcePositivesEither++;
  if(pos(a)&&pos(b)){T.sourcePositivesBoth++;inc(T.positivesBySourceType,type);
   inc(T.natureOfPositives,(A[0].get(it).pairs.find(p=>p.strategy===s)?.nature)??'none');
   if(k.g1bLinks.includes(s))T.positivesLinkedByG1b++;else{T.positivesMissedByG1b++;inc(T.missedBySourceType,type);}}}
 for(const i of [0,1])inc(T.extraction[i],A[i].get(it).extraction);inc(T.sourceStatus,String(A[0].get(it).sourceStatus??'none').slice(0,60));}
writeFileSync(OUT,JSON.stringify({schema:'pee.g1d.trace.v1',material:'120 rows of the G1c L2 audit (spent), traced to original source passages',
 judges:'two new blind Claude agents (T1, T2), source-only relation judgement; not expert validation',counts:T},null,1)+'\n');console.log(JSON.stringify(T));
