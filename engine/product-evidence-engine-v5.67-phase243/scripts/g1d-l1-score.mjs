#!/usr/bin/env node
/** G1d retrieval relevance (evaluation/g1d/preregistration.json retrieval): vector-only vs the ACTUAL fused ranking (G1c
 * exposed only vector neighbours for C), and category-first retrieval for named requests, on the spent I3 set. Verdicts:
 * blind Claude judges (G1c verdicts reused for pairs already judged; new pairs judged blind). Pooled recall@10: relevant
 * units among all units either ranking retrieved for the request. Public counts only. Never overwrites. Usage: LABEL */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const [LABEL]=process.argv.slice(2);const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval');const J=f=>JSON.parse(readFileSync(join(PE,f),'utf8'));
const OUT=new URL(`../evaluation/g1d/l1-${LABEL}.json`,import.meta.url).pathname;if(existsSync(OUT))throw Error(OUT+' exists');
const v=new Map();const load=(keyF,judges)=>{const k=J(keyF).items;const m=new Map(judges.flatMap(f=>J(f).items.map(x=>[x.pair,x.verdict])));for(const x of k)if(m.has(x.pair))v.set(x.request+'|'+x.unit,m.get(x.pair));};
load('g1c/l1/key.json',['g1c/l1/judge-1.json','g1c/l1/judge-2.json','g1c/l1/judge-3.json']);load('g1d/l1/key.json',['g1d/l1/judge-1.json','g1d/l1/judge-2.json']);
const ref=new Map(J('i3/r/reference.json').requests.map(r=>[r.id,r.type==='named'?'named':'problem']));
const pool=J(`g1d/dev/selection-${LABEL}-pool.json`);const by=new Map();for(const p of pool)(by.get(p.request)??by.set(p.request,{}).get(p.request))[p.method]=p.units;
const out={};let missing=0;const get=(r,u)=>{const x=v.get(r+'|'+u);if(!x)missing++;return x;};
for(const [r,m] of by){const g=ref.get(r);const relAll=new Set([...(m.vector??[]),...(m.fused??[])].filter(u=>get(r,u)==='relevant'));
 for(const meth of ['vector','fused','category_first']){const us=m[meth];if(!us)continue;
  for(const grp of [g,'all']){const o=((out[meth]??={})[grp]??={requests:0,relevantAt5:0,lenientAt5:0,units5:0,relevantAt10:0,units10:0,poolRelevant:0,recalled10:0,withRelevant5:0});
   o.requests++;const v5=us.slice(0,5).map(u=>get(r,u)),v10=us.slice(0,10).map(u=>get(r,u));
   o.units5+=v5.length;o.relevantAt5+=v5.filter(x=>x==='relevant').length;o.lenientAt5+=v5.filter(x=>x==='relevant'||x==='partly').length;o.withRelevant5+=v5.includes('relevant')?1:0;
   o.units10+=v10.length;o.relevantAt10+=v10.filter(x=>x==='relevant').length;
   if(meth!=='category_first'){o.poolRelevant+=relAll.size;o.recalled10+=us.slice(0,10).filter(u=>relAll.has(u)).length;}}}}
for(const m of Object.values(out))for(const o of Object.values(m)){o.precisionAt5=+(o.relevantAt5/Math.max(1,o.units5)).toFixed(3);o.lenientPrecisionAt5=+(o.lenientAt5/Math.max(1,o.units5)).toFixed(3);
 o.precisionAt10=+(o.relevantAt10/Math.max(1,o.units10)).toFixed(3);if(o.poolRelevant)o.pooledRecallAt10=+(o.recalled10/o.poolRelevant).toFixed(3);}
writeFileSync(OUT,JSON.stringify({schema:'pee.g1d.l1.v1',pool:LABEL,material:'spent I3 R (60), development',judging:'blind Claude agents; G1c verdicts reused, 491 new pairs judged by two agents (one judgement per pair); method identity hidden',
 note:'pooled recall is relative to units either ranking retrieved, not to all relevant knowledge',missingVerdicts:missing,methods:out},null,1)+'\n');
for(const [m,o] of Object.entries(out))console.log(m.padEnd(15),JSON.stringify(o.all));
