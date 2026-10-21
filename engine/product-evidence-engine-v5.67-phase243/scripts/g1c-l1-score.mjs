#!/usr/bin/env node
/** G1c level 1 (retrieval relevance; evaluation/g1c/preregistration.json levels.L1): the top five knowledge units of each
 * method for each spent I3 request, pooled and judged blind (relevant / partly / not) by Claude agents who did not see
 * which method retrieved them. Public counts only. Usage: node scripts/g1c-l1-score.mjs POOL_LABEL */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const [LABEL]=process.argv.slice(2);if(!LABEL)throw Error('usage: POOL_LABEL');
const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval');const J=f=>JSON.parse(readFileSync(join(PE,f),'utf8'));
const OUT=new URL(`../evaluation/g1c/l1-${LABEL}.json`,import.meta.url).pathname;if(existsSync(OUT))throw Error(OUT+' exists');
const key=new Map(J('g1c/l1/key.json').items.map(x=>[x.request+'|'+x.unit,x.pair]));
const verdict=new Map([1,2,3].flatMap(i=>J(`g1c/l1/judge-${i}.json`).items.map(x=>[x.pair,x.verdict])));
const ref=new Map(J('i3/r/reference.json').requests.map(r=>[r.id,r.type==='named'?'named':'problem']));
const pool=J(`g1c/dev/dev-${LABEL}-l1-pool.json`);const out={};let missing=0;
for(const p of pool){const g=ref.get(p.request);const v=p.units.map(u=>{const x=verdict.get(key.get(p.request+'|'+u));if(!x)missing++;return x;});
 for(const grp of [g,'all']){const o=((out[p.method]??={})[grp]??={requests:0,units:0,relevant:0,partly:0,not:0,withRelevant:0,withRelevantOrPartly:0});
  o.requests++;o.units+=v.length;for(const x of v)if(x)o[x]++;if(v.includes('relevant'))o.withRelevant++;if(v.some(x=>x==='relevant'||x==='partly'))o.withRelevantOrPartly++;}}
for(const m of Object.values(out))for(const o of Object.values(m)){o.precisionAt5Strict=+(o.relevant/o.units).toFixed(3);o.precisionAt5Lenient=+((o.relevant+o.partly)/o.units).toFixed(3);}
writeFileSync(OUT,JSON.stringify({schema:'pee.g1c.l1.v1',pool:LABEL,material:'spent I3 R (60 requests), development',judging:'662 pooled request-unit pairs, shuffled (seed 20261021), split across three blind Claude agents (one judgement per pair); method identity hidden',
 note:'A retrieves situation rows of its matched types (lexical); B, C and D retrieve the nearest situation, strategy and statement units of the (D: verified) request; agent judgements, not expert review',missingVerdicts:missing,methods:out},null,1)+'\n');
for(const [m,o] of Object.entries(out))console.log(m,JSON.stringify(o.all),'| problem',o.problem.withRelevant,'/',o.problem.requests);
