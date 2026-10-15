#!/usr/bin/env node
/** Phase250 A/B/C arms on one benchmark. Each arm runs on its OWN copy of the knowledge store (copied from the verified
 * snapshot, kept outside Git under $PEE_KNOWLEDGE_DIR/../arms250/), so lessons applied for an experiment never touch
 * the operational store. Arm A (the Phase249 journey) runs from a worktree at the frozen pre-Phase250 commit with
 * scripts/phase248-journey-eval.mjs; this script runs the arms on the current code:
 *   R  = Phase250 generic repairs only (no lessons)
 *   B  = repairs + fixed curriculum CURRICULUM_B250
 *   C  = repairs + adaptive lessons ADAPTIVE_C250
 * Usage: node scripts/phase250-journey-arms.mjs --bench FILE --arm R|B|C --out FILE [--snapshot FILE]
 */
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {runJourney248} from '../dist/src/phase248_advisory_journey.js';
import {CATEGORY_REGISTRY248} from '../dist/src/phase248_category_registry.js';
import {CURRICULUM_B250,ADAPTIVE_C250,applyLessons250,registryWithLessons250,lessonBudget250} from '../dist/src/phase250_category_lessons.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const arm=F.arm;const lessons=arm==='B'?CURRICULUM_B250:arm==='C'?ADAPTIVE_C250:arm==='R'?[]:null;
if(!lessons||!F.bench||!F.out)throw Error('usage: --bench FILE --arm R|B|C --out FILE');
const live=process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local','share','product-evidence-engine','knowledge');
const snap=resolve(F.snapshot??join(dirname(new URL(import.meta.url).pathname),'..','..','..','..','pee-knowledge','snapshot','pee246.sqlite'));
const dir=join(live,'..','arms250');mkdirSync(dir,{recursive:true});
const db=join(dir,`${arm}.sqlite`);for(const x of ['','-wal','-shm'])rmSync(db+x,{force:true});
copyFileSync(snap,db);
const store=new KnowledgeStore246(db);
const applied=applyLessons250(store,lessons,'2026-10-15T00:00:00.000Z');
const registry=registryWithLessons250(CATEGORY_REGISTRY248,lessons);
const bench=JSON.parse(readFileSync(resolve(F.bench),'utf8'));
const t0=performance.now();
const journeys=Object.fromEntries(bench.cases.map(c=>[c.id,runJourney248(c.text,store,registry)]));
const ms=performance.now()-t0;
store.close();
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
writeFileSync(resolve(F.out),JSON.stringify({schema:'pee250.arm-run.v1',arm,bench:F.bench,split:bench.split,generatedAt:new Date().toISOString(),
 snapshotSha256:sha(snap),budget:lessonBudget250(lessons),applied,registryCategories:registry.map(r=>r.id),
 knowledgeCategories:[...new Set(Object.values(journeys).filter(j=>j.stages.requirements.categoryHasKnowledge).map(j=>j.stages.category.categoryId))].sort(),
 msTotal:+ms.toFixed(1),journeys},null,1)+'\n');
console.log(JSON.stringify({arm,cases:bench.cases.length,ms:+ms.toFixed(1),budget:lessonBudget250(lessons),applied}));
