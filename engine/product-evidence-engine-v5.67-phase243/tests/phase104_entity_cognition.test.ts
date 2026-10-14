import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {InterpretationMemory101,type SourcePointer,type CalibratedLevelClaim,type StoredClaim} from '../src/phase101_interpretation_memory.js';
import {EntityCognition104} from '../src/phase104_entity_cognition.js';
const frame={categoryId:'vacuum',criterionId:'noise',frameId:'hard_floor_normal_mode'};
const at=(n=0)=>new Date(Date.UTC(2026,9,11,6,0,n)).toISOString();
const source=(id:string):SourcePointer=>({sourceUrl:'https://original.example.org/'+id,originalTestId:id,
 sourceRevisionSha256:'a'.repeat(64),sourceSpanSha256:'b'.repeat(64),sourceLocator:'#tested',
 methodologyReference:'independent original methodology documented',assessmentReference:'reviewed and checked evidence receipt',
 assessorId:'reviewer_1',assessedAt:at(),originalTestLineageReviewed:true,exactVariantReviewed:true,contextReviewed:true});
const create=()=>{const memory=new InterpretationMemory101();memory.registerProduct({categoryId:'vacuum',variantId:'alpha',displayName:'Vacuum Alpha'});
 memory.registerProduct({categoryId:'vacuum',variantId:'beta',displayName:'Vacuum Beta'});return memory;};
const level=(id:string,testId:string,levelId='quiet',variantId='alpha'):CalibratedLevelClaim=>({...frame,id,variantId,kind:'calibrated_level',levelId,
 scaleReference:'reviewed and signed noise anchors',source:source(testId)});
const pair=(id:string,testId:string):StoredClaim=>({...frame,id,variantId:'beta',kind:'pairwise',comparedVariantId:'alpha',relation:'better',
 comparisonBasis:'same_original_test',source:source(testId)});

test('unobserved entity has a targeted evidence task, never a negative rating',()=>{
 const m=create(),c=new EntityCognition104();const result=c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at());
 assert.equal(result.state.state,'unobserved');assert.deepEqual(result.state.reviewTasks,['collect_targeted_evidence']);
 assert.equal(result.state.probabilityCorrect,null);assert.equal(result.state.consumerRankingApproved,false);
 assert.equal(result.llmCalls,0);assert.equal(result.sourceTextRequired,false);m.close();c.close();
});
test('same frame reread is idempotent; entity does not call LLM or duplicate events',()=>{
 const m=create(),c=new EntityCognition104();const f=m.snapshotReviewedFrame(frame);
 c.synchronize(f,'alpha',at());const repeat=c.synchronize(f,'alpha',at(1));
 assert.equal(repeat.changed,false);assert.equal(c.history('vacuum','alpha').length,1);assert.equal(c.verifyJournal().events,1);
 assert.equal(c.productMind('vacuum','alpha').llmCalls,0);m.close();c.close();
});
test('new evidence changes belief provisional → convergent → disputed',()=>{
 const m=create(),c=new EntityCognition104();m.recordApprovedClaim(level('c1','test_1'));
 assert.equal(c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at()).state.state,'provisionally_supported');
 m.recordApprovedClaim(level('c2','test_2'));
 assert.equal(c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at(1)).state.state,'convergent');
 m.recordApprovedClaim(level('c3','test_3','noisy'));
 const r=c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at(2));
 assert.equal(r.state.state,'disputed');assert.deepEqual(r.state.reviewTasks,['reconcile_original_test_claims']);
 assert.deepEqual(c.history('vacuum','alpha').map(x=>x.toState),['provisionally_supported','convergent','disputed']);
 assert.deepEqual(r.transition?.addedClaimIds,['c3']);m.close();c.close();
});
test('withdrawn claim is removed from derived support; no fabricated certainty',()=>{
 const m=create(),c=new EntityCognition104();m.recordApprovedClaim(level('c1','test_1'));
 m.recordApprovedClaim(level('c2','test_2','noisy'));
 c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at());
 m.withdrawClaim('c2','adjudicated defective reference source',at(1));
 const r=c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at(2));
 assert.equal(r.state.state,'provisionally_supported');assert.deepEqual(r.transition?.removedClaimIds,['c2']);
 assert.deepEqual(r.state.originalTestIds,['test_1']);
 m.withdrawClaim('c1','source evidence also retracted',at(3));
 assert.equal(c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at(4)).state.state,'unobserved');
 assert.equal(c.verifyJournal().valid,true);m.close();c.close();
});
test('two publications from one original experiment never fabricate consensus',()=>{
 const m=create(),c=new EntityCognition104();m.recordApprovedClaim(level('c1','test_1'));
 m.recordApprovedClaim(level('c2','test_1'));
 const result=c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at());
 assert.equal(result.state.state,'provisionally_supported');assert.deepEqual(result.state.originalTestIds,['test_1']);m.close();c.close();
});
test('change affecting unrelated product does not rewrite other entity reasoning',()=>{
 const m=create(),c=new EntityCognition104();c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at());
 m.recordApprovedClaim(level('other','test_7','quiet','beta'));
 const result=c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at(1));
 assert.equal(result.changed,false);assert.equal(result.state.state,'unobserved');
 assert.equal(c.verifyJournal().events,1);m.close();c.close();
});
test('pairwise evidence touches both variants and creates a dependency',()=>{
 const m=create(),c=new EntityCognition104();c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at());
 m.recordApprovedClaim(pair('comparison','test_4'));
 const r=c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at(1));
 assert.equal(r.changed,true);assert.deepEqual(r.state.activeClaimIds,['comparison']);
 assert.equal(r.state.state,'provisionally_supported');m.close();c.close();
});
test('descriptor stays uncalibrated; no adjective-to-decibel conversion',()=>{
 const m=create(),c=new EntityCognition104();m.recordApprovedClaim({...frame,id:'c1',variantId:'alpha',kind:'descriptor',descriptor:'somewhat_noisy',
 qualifier:'reviewer_relative',source:source('test_1')});
 const r=c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at());
 assert.equal(r.state.state,'described_uncalibrated'); // adjective never becomes a calibrated performance
 assert.equal(r.state.probabilityCorrect,null);m.close();c.close();
});
test('persisted entity knowledge and append-only history survive restart',()=>{
 const temp=mkdtempSync(path.join(tmpdir(),'phase104-'));
 try{const dbPath=path.join(temp,'mind.sqlite');const m=create();m.recordApprovedClaim(level('c1','test_1'));
  const c=new EntityCognition104(dbPath);c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at());c.close();
  const reopened=new EntityCognition104(dbPath);assert.equal(reopened.productMind('vacuum','alpha').cells[0].state,'provisionally_supported');
  assert.equal(reopened.verifyJournal().events,1);assert.equal(reopened.history('vacuum','alpha')[0].addedClaimIds[0],'c1');reopened.close();m.close();
 }finally{rmSync(temp,{recursive:true,force:true});}
});
test('invalid snapshot fingerprint and unknown variant rejected without updating history',()=>{
 const m=create(),c=new EntityCognition104();const f=m.snapshotReviewedFrame(frame);
 assert.throws(()=>c.synchronize({...f,revisionSha256:'f'.repeat(64)},'alpha',at()),/unverified_snapshot/);
 assert.throws(()=>c.synchronize(f,'gamma',at()),/unregistered_variant/);
 assert.equal(c.verifyJournal().events,0);m.close();c.close();
});
test('time reversal rejected transactionally',()=>{
 const m=create(),c=new EntityCognition104();c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at(3));
 assert.throws(()=>c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at(2)),/out_of_order_observation/);
 assert.equal(c.verifyJournal().events,1);m.close();c.close();
});
test('history logs reason changes with independent claim support and remains append-only',()=>{
 const m=create(),c=new EntityCognition104();m.recordApprovedClaim(level('c1','test_1'));
 c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at());
 const h=c.history('vacuum','alpha');assert.equal(h.length,1);
 assert.equal(h[0].eventType,'first_observation');assert.equal(h[0].previousEventSha256,'0'.repeat(64));
 assert.equal(c.verifyJournal().headSha256,h[0].eventSha256);m.close();c.close();
});
test('SQLite blocks an ordinary attempt to change past reasoning',()=>{
 const temp=mkdtempSync(path.join(tmpdir(),'phase104-'));
 try{const dbPath=path.join(temp,'mind.sqlite');const m=create(),c=new EntityCognition104(dbPath);
  c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at());c.close();
  const db=new DatabaseSync(dbPath);assert.throws(()=>db.exec('DELETE FROM entity_transitions'),/event_log_is_append_only/);db.close();m.close();
 }finally{rmSync(temp,{recursive:true,force:true});}
});
test('aggregate product mind groups contextual cells and tasks without any score',()=>{
 const m=create(),c=new EntityCognition104();c.synchronize(m.snapshotReviewedFrame(frame),'alpha',at());
 const other={...frame,frameId:'carpet_turbo_mode'};
 c.synchronize(m.snapshotReviewedFrame(other),'alpha',at(1));
 const mind=c.productMind('vacuum','alpha');assert.equal(mind.cells.length,2);assert.equal(mind.pendingTasks.length,2);
 assert.equal(mind.llmCalls,0);m.close();c.close();
});
