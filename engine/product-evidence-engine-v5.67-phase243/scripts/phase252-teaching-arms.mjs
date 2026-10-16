#!/usr/bin/env node
/** Phase252 Stage 4 arms. Each arm runs on its own copy of the same snapshot (outside Git), so teaching applied for the
 * experiment never touches the operational store:
 *   BASE = current system: CATEGORY_REGISTRY250 + ADOPTED_LESSONS250 (no pilot teaching)
 *   L    = BASE + LEXICAL_L252 (vocabulary lessons)
 *   G    = BASE + RESEARCH_GUIDED_G252 (research-guided teaching)
 * For every factual requirement an arm derives, it also counts the category's products holding a comparable declaration
 * (what the declared specifications can check). Usage:
 *   node scripts/phase252-teaching-arms.mjs --bench FILE --arm BASE|L|G --snapshot FILE --out FILE
 */
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,rmSync} from 'node:fs';import {resolve,join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {runJourney248} from '../dist/src/phase248_advisory_journey.js';
import {CATEGORY_REGISTRY248} from '../dist/src/phase248_category_registry.js';
import {ADOPTED_LESSONS250,applyLessons250,registryWithLessons250} from '../dist/src/phase250_category_lessons.js';
import {LEXICAL_L252,RESEARCH_GUIDED_G252,applyTeaching252,registryWithTeaching252,lessonOf252,phraseCount252} from '../dist/src/phase252_category_teaching.js';
import {SPEC_CRITERIA249,candidatesFromStore249,comparable249} from '../dist/src/phase249_decision.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
if(!['BASE','L','G'].includes(F.arm)||!F.bench||!F.out||!F.snapshot)throw Error('usage: --bench FILE --arm BASE|L|G --snapshot FILE --out FILE');
const dir=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local','share','product-evidence-engine','knowledge'),'..','arms252');mkdirSync(dir,{recursive:true});
const db=join(dir,`${F.arm}.sqlite`);for(const x of ['','-wal','-shm'])rmSync(db+x,{force:true});copyFileSync(resolve(F.snapshot),db);
const store=new KnowledgeStore246(db);const AT='2026-10-16T00:00:00.000Z';
const applied={base:applyLessons250(store,ADOPTED_LESSONS250,AT)};
let registry=registryWithLessons250(CATEGORY_REGISTRY248,ADOPTED_LESSONS250);
if(F.arm==='L'){applied.teaching=applyLessons250(store,LEXICAL_L252,AT);registry=registryWithLessons250(CATEGORY_REGISTRY248,[...ADOPTED_LESSONS250,...LEXICAL_L252]);}
if(F.arm==='G'){applied.teaching=applyTeaching252(store,RESEARCH_GUIDED_G252,AT);registry=registryWithTeaching252(registryWithLessons250(CATEGORY_REGISTRY248,ADOPTED_LESSONS250),RESEARCH_GUIDED_G252);}
const budget={phrases:F.arm==='L'?LEXICAL_L252.map(phraseCount252):F.arm==='G'?RESEARCH_GUIDED_G252.map(t=>phraseCount252(lessonOf252(t))):[0,0]};
const bench=JSON.parse(readFileSync(resolve(F.bench),'utf8'));
const cands={};const checkable=(cat,crit)=>{const spec=SPEC_CRITERIA249[crit];if(!spec||!cat)return 0;
 const unit={volume:'l',length:'mm',mass:'g',power:'W',duration:'h',price:'gbp'}[spec.dimension];
 return (cands[cat]??=candidatesFromStore249(store,cat)).filter(p=>p.declarations.some(d=>!d.variantId&&spec.property.test(d.property)&&!spec.exclude?.test(d.property)
  &&(comparable249(d.value,spec.dimension,unit)!==null||(d.value?.kind==='quantity'&&d.value.bound==='max')))).length;};
const t0=performance.now();const journeys={},declared={};
for(const c of bench.cases){const j=runJourney248(c.text,store,registry);journeys[c.id]=j;
 declared[c.id]=Object.fromEntries(j.stages.requirements.factualRequirements.filter(f=>f.criterion!=='budget_max').map(f=>[f.criterion,checkable(j.stages.category.categoryId,f.criterion)]));}
const ms=performance.now()-t0;store.close();
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
writeFileSync(resolve(F.out),JSON.stringify({schema:'pee252.teaching-arm-run.v1',arm:F.arm,bench:F.bench,split:bench.split,generatedAt:new Date().toISOString(),
 snapshotSha256:sha(resolve(F.snapshot)),applied,budget,msTotal:+ms.toFixed(1),checkableDeclared:declared,journeys},null,1)+'\n');
console.log(JSON.stringify({arm:F.arm,cases:bench.cases.length,ms:+ms.toFixed(1),applied,budget}));
