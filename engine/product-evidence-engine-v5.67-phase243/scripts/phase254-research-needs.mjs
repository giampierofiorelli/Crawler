#!/usr/bin/env node
/** Phase254 — runs adviseFromRequest253 on a copy of a store snapshot (outside Git), turns each answer into research
 * needs (researchNeedsFromAdvice254), collects them across requests (collectResearchNeeds254) and scores them against
 * a gold file: research needs found, false and missed; destination (research / clarification / reextraction / not
 * actionable); product and criterion attribution; duplicates merged; budget. Output holds ids, criteria, destinations
 * and statuses only, never declared values. Nothing is fetched, planned in Phase182 or admitted.
 * Usage: node scripts/phase254-research-needs.mjs --gold FILE --snapshot FILE [--max-research N] [--out FILE]
 */
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,rmSync} from 'node:fs';import {resolve,join} from 'node:path';import {homedir} from 'node:os';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {CATEGORY_REGISTRY250} from '../dist/src/phase248_category_registry.js';
import {adviseFromRequest253} from '../dist/src/phase253_request_advice.js';
import {researchNeedsFromAdvice254,collectResearchNeeds254} from '../dist/src/phase254_research_needs.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
if(!F.gold||!F.snapshot)throw Error('usage: --gold FILE --snapshot FILE [--max-research N] [--out FILE]');
const dir=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local','share','product-evidence-engine','knowledge'),'..','arms254');mkdirSync(dir,{recursive:true});
const db=join(dir,'needs.sqlite');for(const x of ['','-wal','-shm'])rmSync(db+x,{force:true});copyFileSync(resolve(F.snapshot),db);
const store=new KnowledgeStore246(db);const gold=JSON.parse(readFileSync(resolve(F.gold),'utf8'));
const k=n=>`${n.destination}|${n.productId}|${n.criterion}`;
const rows=[];const advices=[];
for(const c of gold.cases){const a=adviseFromRequest253(c.text,store,CATEGORY_REGISTRY250);advices.push(a);
 const got=researchNeedsFromAdvice254(a,store);const gk=new Set(c.expect.map(k)),ok=new Set(got.map(k));
 const loose=n=>`${n.productId}|${n.criterion}`;
 rows.push({id:c.id,response:a.response,expected:c.expect.length,got:got.length,
  correct:got.filter(n=>gk.has(k(n))).length,
  falseNeeds:got.filter(n=>!c.expect.some(e=>loose(e)===loose(n))).map(n=>({kind:n.kind,destination:n.destination,productId:n.productId,criterion:n.criterion})),
  missed:c.expect.filter(e=>!got.some(n=>loose(n)===loose(e))),
  wrongDestination:got.filter(n=>!gk.has(k(n))&&c.expect.some(e=>loose(e)===loose(n))).map(n=>({got:n.destination,expected:c.expect.find(e=>loose(e)===loose(n)).destination,productId:n.productId,criterion:n.criterion})),
  researchForClarification:got.filter(n=>n.destination==='research'&&c.expect.some(e=>e.destination==='user_clarification'&&e.criterion===n.criterion)).length,
  clarificationForResearch:got.filter(n=>n.destination==='user_clarification'&&c.expect.some(e=>e.destination==='research'&&e.criterion===n.criterion)).length,
  attributionChecked:got.filter(n=>n.productId).length,
  attributionOk:got.filter(n=>n.productId&&n.identity?.productId===n.productId&&n.categoryId===a.researchInputs?.category&&(n.destination!=='research'||!n.phase182.jobPreview||(n.phase182.jobPreview.exactVariantId===n.productId&&(n.criterion===null||n.phase182.jobPreview.criterionId===n.criterion||n.phase182.jobPreview.reference===n.criterion)))).length,
  needs:got.map(n=>({needId:n.needId,kind:n.kind,destination:n.destination,status:n.status,productId:n.productId,criterion:n.criterion,phase182Kind:n.phase182.jobPreview?.kind??null}))});}
const all=collectResearchNeeds254(advices,store,{maxResearch:Number(F['max-research']??20)});
store.close();
const sum=f=>rows.reduce((s,r)=>s+f(r),0);
const out={schema:'pee254.research-needs-run.v1',gold:F.gold,store:'copy of '+F.snapshot,
 measured:{cases:rows.length,expectedNeeds:sum(r=>r.expected),returnedNeeds:sum(r=>r.got),correct:sum(r=>r.correct),falseNeeds:sum(r=>r.falseNeeds.length),missed:sum(r=>r.missed.length),
  wrongDestination:sum(r=>r.wrongDestination.length),researchForClarification:sum(r=>r.researchForClarification),clarificationForResearch:sum(r=>r.clarificationForResearch),
  attribution:{checked:sum(r=>r.attributionChecked),ok:sum(r=>r.attributionOk)}},
 collected:{summary:all.summary,planningOnly:all.planningOnly,rankingAuthorized:all.rankingAuthorized,evidenceAdmitted:all.evidenceAdmitted,sourcePermissionsGranted:all.sourcePermissionsGranted,
  phase182Eligible:all.needs.filter(n=>n.phase182.eligible).length,
  needs:all.needs.map(n=>({needId:n.needId,kind:n.kind,destination:n.destination,status:n.status,categoryId:n.categoryId,productId:n.productId,criterion:n.criterion,volatile:n.volatile,priority:n.priority,requests:n.requests.length,gap181:n.gap181,phase182JobPreview:n.phase182.jobPreview}))},
 rows};
const txt=JSON.stringify(out,null,1)+'\n';if(F.out)writeFileSync(resolve(F.out),txt);
console.log(JSON.stringify(out.measured));console.log(JSON.stringify(out.collected.summary),'phase182Eligible',out.collected.phase182Eligible);
for(const r of rows)if(r.falseNeeds.length||r.missed.length||r.wrongDestination.length)console.log(r.id,r.response,'false',JSON.stringify(r.falseNeeds),'missed',JSON.stringify(r.missed),'wrongDest',JSON.stringify(r.wrongDestination));
