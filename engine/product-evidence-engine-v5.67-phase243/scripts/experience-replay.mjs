#!/usr/bin/env node
/** Continuous-learning Step 1A: deterministic replay of the experience cases (no network, no store writes).
 * For each case: (1) re-observe it on the frozen historical build when available (is the committed historical state
 * reproducible?), (2) observe it on the build under test, (3) compare both with the reference. Reports, per case and per
 * family: preserved success, lost success (regression), corrected, persistent failure, unreproducible.
 * Usage: node scripts/experience-replay.mjs LABEL [--current DIST] [--inject-fault CASE_ID]
 *   --current: the build under test (default: this checkout's dist/src);
 *   --inject-fault: FAULT INJECTION only: the named case's current observation is replaced by "absent" to prove that a lost
 *     success is detected; such a run is labelled fault_injection and never counts as evidence about the system.
 * Writes PRIVATE (values) to pee-knowledge/private-eval/experience/replay-LABEL.json and the value-free summary to
 * evaluation/experience/replay-LABEL.json. Never overwrites. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join,resolve} from 'node:path';import {createHash} from 'node:crypto';
import {observeCase} from './experience-observe.mjs';
const {replayVerdict,summariseReplay,recurringPatterns}=await import(resolve('dist/src/experience_cases.js'));
const A=process.argv.slice(2);const label=A[0];if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL [--current DIST] [--inject-fault ID]');
const opt=k=>{const i=A.indexOf(k);return i>0?A[i+1]:null;};
const CURRENT=resolve(opt('--current')??'dist/src');const FAULT=opt('--inject-fault');
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';const SET=join(REPO,'private-eval/experience/pilot-cases.json');
const PRIV=join(REPO,`private-eval/experience/replay-${label}.json`),PUB=`evaluation/experience/replay-${label}.json`;
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: replays are never overwritten');
const bytes=readFileSync(SET);const S=JSON.parse(bytes);
const idx=JSON.parse(readFileSync('evaluation/experience/pilot-index.json','utf8'));
if(idx.privateCasesSha256!==createHash('sha256').update(bytes).digest('hex'))throw Error('private case set does not match the committed public index');
const rows=[];
for(const c of S.cases){
 let frozen=null,current=null,reason=null,meta={};
 if(c.kind!=='request'&&existsSync(c.source.historicalBuild.path)){const r=await observeCase(c,c.source.historicalBuild.path);if(r.observation)frozen=r.observation;else reason='frozen: '+r.unobservable;}
 const r=await observeCase(c,CURRENT);if(r.observation){current=r.observation;meta=r.meta??{};}else reason=(reason?reason+'; ':'')+'current: '+r.unobservable;
 if(FAULT===c.id&&current)current={status:'absent'};
 const v=replayVerdict(c,current,frozen,reason);
 rows.push({...v,planFrozen:meta.planFrozen??null,historical:c.historical,frozenReobserved:frozen,current,committedCheck:c.historicalCheck??null});
}
const summary=summariseReplay(rows);
const byFamily={};for(const r of rows){const f=byFamily[r.family]??={};f[r.transition]=(f[r.transition]??0)+1;}
const out={schema:'pee.experience-replay.v1',label,at:new Date().toISOString(),mode:FAULT?'fault_injection':'replay',faultCase:FAULT,
 currentBuild:CURRENT,caseSetSha256:idx.privateCasesSha256,summary,byFamily,patterns:recurringPatterns(S.cases)};
writeFileSync(PRIV,JSON.stringify({...out,rows},null,1)+'\n');
writeFileSync(PUB,JSON.stringify({...out,rows:rows.map(r=>({caseId:r.caseId,family:r.family,transition:r.transition,historicalMeets:r.historicalMeets,currentMeets:r.currentMeets,
 historicalReproduced:r.historicalReproduced,planFrozen:r.planFrozen,reason:r.reason,
 states:{historical:{status:r.historical.status,subjectOutcome:r.historical.subjectOutcome??null,response:r.historical.response??null},
  frozenReobserved:r.frozenReobserved?{status:r.frozenReobserved.status,subjectOutcome:r.frozenReobserved.subjectOutcome??null,response:r.frozenReobserved.response??null}:null,
  current:r.current?{status:r.current.status,subjectOutcome:r.current.subjectOutcome??null,response:r.current.response??null}:null}}))},null,1)+'\n');
console.log(JSON.stringify({summary,byFamily},null,1));
for(const r of rows)console.log(r.caseId.padEnd(6),r.family.padEnd(26),r.transition.padEnd(18),'hist',r.historical.status,r.historical.subjectOutcome??r.historical.response??'','| frozen',r.frozenReobserved?.status??'-',r.frozenReobserved?.subjectOutcome??r.frozenReobserved?.response??'','| now',r.current?.status??'-',r.current?.subjectOutcome??r.current?.response??'',r.reason?'| '+r.reason:'');
