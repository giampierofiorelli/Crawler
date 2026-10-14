import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {emptyResearchJournal243,appendResearchDecision243,validateResearchJournal243,
 saveResearchJournal243,loadResearchJournal243} from '../src/phase243_budgeted_journal.js';
import {freezeWave243,type ResearchWave243} from '../src/phase243_budgeted_category_search.js';
const hex='c'.repeat(64);
const wave=(key:string):ResearchWave243=>({schema:'pee243.budgeted-wave.v1',
 scopeKey:key,categoryId:'irons',market:'uk',policyVersion:'policy1',mode:'lean_bootstrap',
 credibleCandidateCount:0,shortageTriggersRevisit:true,
 choices:[],productDecisions:[{productId:'deferred',baselineBucket:'deferred',
  triage:'temporarily_suspended',reasons:['weak_signal_soft_pause_only'],
  distinctNegativeOrigins:2,observedOriginalProblemCount:0,proposedAction:null,
  rankingAuthorized:false,permanentExclusion:false}],spentEffortUnits:0,remainingEffortUnits:10,
 tailActions:0,totalActions:0,auditedSuspendedCount:0,rankingAuthorized:false,
 marketCoverageCertified:false,discoveryMustContinue:true,limitations:['planning_only']});
const d1='2026-10-14T13:00:00Z',d2='2026-10-14T14:00:00Z';
test('journal is empty until explicitly populated',()=>{
 const j=emptyResearchJournal243();assert.equal(j.events.length,0);
 validateResearchJournal243(j);
});
test('append decisions with source fingerprint and reversible suspended reason',()=>{
 let j=appendResearchDecision243(emptyResearchJournal243(),freezeWave243(wave('general'),hex),d1);
 j=appendResearchDecision243(j,freezeWave243(wave('specific_need'),hex),d2);
 assert.equal(j.events.length,2);
 assert.equal(j.events[0].snapshot.wave.productDecisions[0].permanentExclusion,false);
 assert.equal(j.events[1].snapshot.scopeKey,'specific_need');
 validateResearchJournal243(j);
});
test('reject tampering and sequence rewriting',()=>{
 const j=appendResearchDecision243(emptyResearchJournal243(),freezeWave243(wave('general'),hex),d1);
 const forged=structuredClone(j);forged.events[0].snapshot.wave.productDecisions[0].reasons=['forged'];
 assert.throws(()=>validateResearchJournal243(forged),/broken_journal_chain/);
 const forged2=structuredClone(j);forged2.events[0].sequence=10;
 assert.throws(()=>validateResearchJournal243(forged2),/broken_journal_chain/);
});
test('snapshot persists to local file and can be reloaded',()=>{
 const dir=mkdtempSync(join(tmpdir(),'pee243-'));
 try{
  const path=join(dir,'decisions.json');
  assert.equal(loadResearchJournal243(path).events.length,0);
  const j=appendResearchDecision243(emptyResearchJournal243(),freezeWave243(wave('general'),hex),d1);
  saveResearchJournal243(path,j);
  assert.deepEqual(loadResearchJournal243(path),j);
  const raw=readFileSync(path,'utf8');
  assert.equal(raw.includes('weak_signal_soft_pause_only'),true);
  assert.equal(raw.includes('manufacturer PDF body'),false);
 }finally{rmSync(dir,{force:true,recursive:true});}
});
test('reject invalid journal bytes instead of blindly trusting cached decisions',()=>{
 const dir=mkdtempSync(join(tmpdir(),'pee243-'));
 try{const path=join(dir,'decisions.json');writeFileSync(path,'{"schema":"fake"}');
  assert.throws(()=>loadResearchJournal243(path),/invalid_journal/);
 }finally{rmSync(dir,{force:true,recursive:true});}
});
test('reject backwards wall clock during append',()=>{
 const j=appendResearchDecision243(emptyResearchJournal243(),freezeWave243(wave('general'),hex),d2);
 assert.throws(()=>appendResearchDecision243(j,freezeWave243(wave('general'),hex),d1),/invalid_journal_append/);
});
