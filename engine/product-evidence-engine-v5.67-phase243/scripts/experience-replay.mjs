#!/usr/bin/env node
/** Continuous-learning Step 1A: deterministic replay of the experience cases (no network, no store writes).
 * For each case: (1) re-observe it on the frozen historical build when available (is the committed historical state
 * reproducible?), (2) observe it on the build under test, (3) compare both with the reference. Reports, per case and per
 * family: preserved success, lost success (regression), corrected, persistent failure, unreproducible.
 * Usage: node scripts/experience-replay.mjs LABEL [--set step1a|step1b] [--current DIST] [--policy ambiguity_preserving] [--inject-fault CASE_ID]
 *   --set: the case set (step1a = pilot-cases.json, the default; step1b = step1b-cases.json); each set is checked against its
 *     committed public index;
 *   --current: the build under test (default: this checkout's dist/src);
 *   --policy: EVALUATION-ONLY COUNTERFACTUAL applied to the current build's leads (scripts/experience-observe.mjs); such a run
 *     is labelled counterfactual and describes no shipped behaviour;
 *   --inject-fault: FAULT INJECTION only: the named case's current observation is replaced by "absent" to prove that a lost
 *     success is detected; such a run is labelled fault_injection and never counts as evidence about the system.
 * Writes PRIVATE (values) to pee-knowledge/private-eval/experience/replay-LABEL.json and the value-free summary to
 * evaluation/experience/replay-LABEL.json. Never overwrites. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join,resolve} from 'node:path';import {createHash} from 'node:crypto';
import {observeCase,buildIdentity,MATCHING_RULE_DIGEST,sameProduct as sameProductLoose} from './experience-observe.mjs';import {homedir} from 'node:os';
const {replayVerdict,summariseReplay,recurringPatterns}=await import(resolve('dist/src/experience_cases.js'));
const A=process.argv.slice(2);const label=A[0];if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL [--current DIST] [--inject-fault ID]');
const opt=k=>{const i=A.indexOf(k);return i>0?A[i+1]:null;};
const CURRENT=resolve(opt('--current')??'dist/src');const FAULT=opt('--inject-fault');const POLICY=opt('--policy');
const SETS={step1a:['pilot-cases.json','pilot-index.json'],step1b:['step1b-cases.json','step1b-index.json']};const SETNAME=opt('--set')??'step1a';
if(!SETS[SETNAME])throw Error('unknown set '+SETNAME);
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';const SET=join(REPO,'private-eval/experience/',SETS[SETNAME][0]);
const PRIV=join(REPO,`private-eval/experience/replay-${label}.json`),PUB=`evaluation/experience/replay-${label}.json`;
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: replays are never overwritten');
const bytes=readFileSync(SET);const S=JSON.parse(bytes);
const idx=JSON.parse(readFileSync('evaluation/experience/'+SETS[SETNAME][1],'utf8'));
if(idx.privateCasesSha256!==createHash('sha256').update(bytes).digest('hex'))throw Error('private case set does not match the committed public index');
// Step 1B provenance: every input that governs a verdict is recorded; a changed knowledge state makes a case incomparable.
const PRIVEVAL=join(homedir(),'.local/share/product-evidence-engine/private-eval');
const goldOf=ev=>{try{return JSON.parse(readFileSync(join(PRIVEVAL,ev,'gold-untouched.json'),'utf8'));}catch{return null;}};
const manifest=(()=>{try{return JSON.parse(readFileSync(join(REPO,'snapshot/pee246.sqlite.manifest.json'),'utf8'));}catch{return null;}})();
const liveStore=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');
const provenance={currentBuild:buildIdentity(CURRENT),historicalBuilds:{},matchingRuleDigest:MATCHING_RULE_DIGEST,
 knowledgeSnapshot:manifest?{sha256:manifest.sha256??manifest.snapshotSha256??null,verifiedAt:manifest.verifiedAt??null,schemaVersion:manifest.schemaVersion??null}:null,
 liveStoreFileNote:'file bytes change when SQLite opens the store (WAL), so the comparability test is the compiled plan digest, not this hash',liveStoreFileSha256:existsSync(liveStore)?createHash('sha256').update(readFileSync(liveStore)).digest('hex'):null,
 planDigestsFrozen:'evaluation/phase272/plans-frozen-known.json',caseSetSha256:idx.privateCasesSha256,
 scoringLimits:'committed historical states come from whole-document one-to-one scoring with identical (value, unit, subject) leads counted once; the per-case observer is not exclusive, so same-value gold siblings are flagged'};
const rows=[];
for(const c of S.cases){
 let frozen=null,current=null,reason=null,meta={};
 const hb=c.source.historicalBuild.path;if(c.kind!=='request'&&existsSync(hb)&&!provenance.historicalBuilds[c.source.historicalBuild.commit])provenance.historicalBuilds[c.source.historicalBuild.commit]=buildIdentity(hb);
 if(c.kind!=='request'&&existsSync(hb)){const r=await observeCase(c,hb);if(r.observation)frozen=r.observation;else reason='frozen: '+r.unobservable;}
 const r=await observeCase(c,CURRENT,POLICY?{policy:POLICY}:{});if(r.observation){current=r.observation;meta=r.meta??{};}else reason=(reason?reason+'; ':'')+'current: '+r.unobservable;
 if(FAULT===c.id&&current)current={status:'absent'};
 // Same-value siblings: another gold item of the document with the same value and unit. A fallback (other-subject) lead
 // whose subject is a sibling's may belong to that sibling: the attribution of this case is then allocation-ambiguous.
 const sib=(c.sameValueGoldIds??[]).map(id=>goldOf(c.source.evaluation)?.quantitative.find(g=>g.id===id)).filter(Boolean);
 const allocationAmbiguous=sib.length?[current,frozen].some(o=>o?.status==='found'&&sib.some(g=>o.subject&&(g.subject===o.subject||sameProductLoose(g.subject,o.subject)))):false;
 const comparable=c.kind==='request'||meta.planFrozen!==false;
 const v=replayVerdict(c,current,frozen,reason,{comparable,why:'the compiled extraction plan differs from the frozen Phase272 digest'});
 rows.push({...v,planFrozen:meta.planFrozen??null,allocationAmbiguous,historical:c.historical,frozenReobserved:frozen,current,committedCheck:c.historicalCheck??null});
}
const summary=summariseReplay(rows);
const byFamily={};for(const r of rows){const f=byFamily[r.family]??={};f[r.transition]=(f[r.transition]??0)+1;}
const out={schema:'pee.experience-replay.v2',label,at:new Date().toISOString(),set:SETNAME,mode:FAULT?'fault_injection':POLICY?'counterfactual':'replay',faultCase:FAULT,policy:POLICY,
 currentBuild:CURRENT,caseSetSha256:idx.privateCasesSha256,provenance,summary,byFamily,patterns:recurringPatterns(S.cases)};
writeFileSync(PRIV,JSON.stringify({...out,rows},null,1)+'\n');
writeFileSync(PUB,JSON.stringify({...out,rows:rows.map(r=>({caseId:r.caseId,family:r.family,transition:r.transition,historicalMeets:r.historicalMeets,currentMeets:r.currentMeets,
 historicalReproduced:r.historicalReproduced,planFrozen:r.planFrozen,reason:r.reason,historicalClass:r.historicalClass,currentClass:r.currentClass,allocationAmbiguous:r.allocationAmbiguous,
 states:{historical:{status:r.historical.status,subjectOutcome:r.historical.subjectOutcome??null,response:r.historical.response??null},
  frozenReobserved:r.frozenReobserved?{status:r.frozenReobserved.status,subjectOutcome:r.frozenReobserved.subjectOutcome??null,response:r.frozenReobserved.response??null}:null,
  current:r.current?{status:r.current.status,subjectOutcome:r.current.subjectOutcome??null,response:r.current.response??null}:null}}))},null,1)+'\n');
console.log(JSON.stringify({summary,byFamily},null,1));
for(const r of rows)console.log(r.caseId.padEnd(6),r.family.padEnd(26),r.transition.padEnd(18),(r.historicalClass+'>'+(r.currentClass??'-')).padEnd(36),r.allocationAmbiguous?'ALLOC?':'','hist',r.historical.status,r.historical.subjectOutcome??r.historical.response??'','| frozen',r.frozenReobserved?.status??'-',r.frozenReobserved?.subjectOutcome??r.frozenReobserved?.response??'','| now',r.current?.status??'-',r.current?.subjectOutcome??r.current?.response??'',r.reason?'| '+r.reason:'');
