#!/usr/bin/env node
/** Phase253 Stage 4 — types sources registered as 'unknown' from retained evidence (proposeSourceTypes253), and with
 * --apply 1 records each proposal with KnowledgeStore246.classifySourceType253 (journaled, basis heuristic_unverified,
 * reversible). Sources without a decisive rule stay unknown. Output: hosts, brands, rules and counts, never values.
 * Usage: node scripts/phase253-classify-sources.mjs [--db FILE] [--out FILE] [--apply 1]
 */
import {writeFileSync} from 'node:fs';import {resolve,join} from 'node:path';import {homedir} from 'node:os';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {proposeSourceTypes253} from '../dist/src/phase253_source_classification.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const db=F.db??join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local','share','product-evidence-engine','knowledge'),'pee246.sqlite');
const store=new KnowledgeStore246(resolve(db));
const proposals=proposeSourceTypes253(store);const applied=[];
if(F.apply==='1')for(const p of proposals)if(p.to&&store.classifySourceType253(p.sourceId,p.to,{rule:p.rule,detail:p.detail}))applied.push(p.sourceId);
const roles=store.db.prepare('SELECT evidence_role r,count(*) n FROM declarations GROUP BY 1 ORDER BY 1').all();
const out={schema:'pee253.source-classification.v1',db:F.db?resolve(F.db):'$PEE_KNOWLEDGE_DIR/pee246.sqlite',applied:applied.length,
 counts:Object.fromEntries(['manufacturer','retailer','one_brand_not_host','no_brand_declared'].map(k=>[k,proposals.filter(p=>(p.to??p.rule)===k).length])),
 declarationRolesAfter:Object.fromEntries(roles.map(r=>[r.r,r.n])),journalOk:store.verifyJournal().ok,
 proposals:proposals.map(({host,to,rule,brands,detail})=>({host,to,rule,brands,detail}))};
store.close();
const txt=JSON.stringify(out,null,1)+'\n';if(F.out)writeFileSync(resolve(F.out),txt);else process.stdout.write(txt);
console.error(`proposals ${proposals.length}; applied ${applied.length}; journal ${out.journalOk?'ok':'BROKEN'}`);
