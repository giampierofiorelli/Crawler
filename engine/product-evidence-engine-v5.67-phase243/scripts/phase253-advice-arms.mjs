#!/usr/bin/env node
/** Phase253 Stage 8 arms. Each arm runs on its own copy of the same snapshot, outside Git.
 *  P (previous): the Phase252 path, runJourney248 alone. It never reached decideAdvice249, so it returns no
 *    constraints and no products. Its response is mapped as pre-registered: clarify → clarification;
 *    out_of_scope or unsupported_category → out_of_scope; recommend or withhold_insufficient_evidence →
 *    justified_abstention (no product was checked).
 *  N (new): adviseFromRequest253 (journey → constraints → Phase177 → eligibility → decideAdvice249).
 * Both use the operational registry CATEGORY_REGISTRY250. No teaching or lessons are applied to the copy.
 * Usage: node scripts/phase253-advice-arms.mjs --bench FILE --arm P|N --snapshot FILE --out PUBLIC_FILE [--private-out FILE]
 */
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,rmSync} from 'node:fs';import {resolve,join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {runJourney248} from '../dist/src/phase248_advisory_journey.js';
import {CATEGORY_REGISTRY250} from '../dist/src/phase248_category_registry.js';
import {adviseFromRequest253} from '../dist/src/phase253_request_advice.js';
import {redactAdvice} from './phase253-redact-advice.mjs';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
if(!['P','N'].includes(F.arm)||!F.bench||!F.out||!F.snapshot)throw Error('usage: --bench FILE --arm P|N --snapshot FILE --out FILE');
const dir=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local','share','product-evidence-engine','knowledge'),'..','arms253');mkdirSync(dir,{recursive:true});
const db=join(dir,`${F.arm}.sqlite`);for(const x of ['','-wal','-shm'])rmSync(db+x,{force:true});copyFileSync(resolve(F.snapshot),db);
const store=new KnowledgeStore246(db);
const bench=JSON.parse(readFileSync(resolve(F.bench),'utf8'));
const RESP={clarify:'clarification',out_of_scope:'out_of_scope',unsupported_category:'out_of_scope',recommend:'justified_abstention',withhold_insufficient_evidence:'justified_abstention'};
const previous=text=>{const j=runJourney248(text,store,CATEGORY_REGISTRY250);
 return {schema:'pee253.advice.v1',text,target:{kind:j.stages.category.categoryId?'category':j.stages.category.basis==='ambiguous'?'ambiguous':'none',category:j.stages.category.categoryId,other:null,basis:'phase252_category_stage'},
  category:j.stages.category.categoryId,constraints:[],unmappedConstraints:[],needs:j.stages.need.concepts.map(c=>c.id),unresolved:[],response:RESP[j.decision],ordered:false,rankingAuthorized:false,
  shortlist:[],unknown:[],excluded:[],conflicts:[],questions:[...j.clarificationQuestions],statements:[...j.reasons],limitations:[],researchPlan:[...j.researchPlan],phase248Decision:j.decision};};
const t0=performance.now();const advice={};
for(const c of bench.cases)advice[c.id]=F.arm==='N'?adviseFromRequest253(c.text,store,CATEGORY_REGISTRY250):previous(c.text);
store.close();
// --out is the public form (declared values removed); --private-out, outside Git, keeps the full advice.
const run=a=>JSON.stringify({schema:'pee253.advice-run.v1',arm:F.arm,bench:F.bench,snapshotSha256:createHash('sha256').update(readFileSync(resolve(F.snapshot))).digest('hex'),
 msTotal:+(performance.now()-t0).toFixed(1),...(a===advice?{}:{redaction:'declared values removed (pee249-factual-observations-v1); full run kept in private-eval'}),advice:a},null,1)+'\n';
if(F['private-out'])writeFileSync(resolve(F['private-out']),run(advice));
writeFileSync(resolve(F.out),run(Object.fromEntries(Object.entries(advice).map(([k,a])=>[k,redactAdvice(a)]))));
