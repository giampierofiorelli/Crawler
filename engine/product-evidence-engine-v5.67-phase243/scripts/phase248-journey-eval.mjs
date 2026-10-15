#!/usr/bin/env node
/** Runs the Phase248 advisory journey over a benchmark file against a store (opened read-only in practice:
 * the journey performs no writes). Usage: node scripts/phase248-journey-eval.mjs --bench FILE [--db FILE] [--out FILE] [--verbose 1] [--safety F1,F2,...]
 * --safety: safety-notice files written by phase248-safety-notices.mjs (held in memory for this run only). */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve,join} from 'node:path';
import {KnowledgeStore246,defaultKnowledgeDir246} from '../dist/src/phase246_knowledge_store.js';
import {runJourney248,scoreJourneys248} from '../dist/src/phase248_advisory_journey.js';
import {CATEGORY_REGISTRY248} from '../dist/src/phase248_category_registry.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const bench=JSON.parse(readFileSync(resolve(F.bench),'utf8'));
const store=new KnowledgeStore246(resolve(F.db??join(defaultKnowledgeDir246(),'pee246.sqlite')));
const fromFiles=F.safety?F.safety.split(',').flatMap(f=>JSON.parse(readFileSync(resolve(f),'utf8')).notices):[];
// --safety-store 1: notices persisted under the active OGL policy ($PEE_KNOWLEDGE_DIR/safety-notices/opss-notices.json).
const fromStore=F['safety-store']?Object.values(JSON.parse(readFileSync(join(defaultKnowledgeDir246(),'safety-notices','opss-notices.json'),'utf8')).notices):[];
const safetyNotices=fromFiles.length||fromStore.length?[...fromFiles,...fromStore]:undefined;
const opts=safetyNotices?{safetyNotices}:{};
const texts=Object.fromEntries(bench.cases.map(c=>[c.id,c.text]));
const t0=performance.now();
const score=scoreJourneys248(bench.cases,t=>runJourney248(t,store,CATEGORY_REGISTRY248,opts),texts);
const ms=performance.now()-t0;
const journeys=Object.fromEntries(bench.cases.map(c=>[c.id,runJourney248(c.text,store,CATEGORY_REGISTRY248,opts)]));
store.close();
const out={schema:'pee248.journey-eval.v1',bench:F.bench,split:bench.split,generatedAt:new Date().toISOString(),msTotal:+ms.toFixed(1),score,journeys};
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(out,null,1)+'\n');
const {rows,...summary}=score;console.log(JSON.stringify(summary));
if(F.verbose)for(const r of rows)if(!r.categoryOk||!r.decisionOk||r.conceptTp<r.conceptExpected||r.conceptFp||!r.budgetOk)console.log(' ',r.id,JSON.stringify({cat:r.gotCategory,concepts:r.gotConcepts,dec:r.gotDecision,block:r.blockingStage,budget:r.budgetOk}),'|',texts[r.id]);
