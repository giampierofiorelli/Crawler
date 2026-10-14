import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {InterpretationMemory101,type CalibratedLevelClaim,type SourcePointer} from '../src/phase101_interpretation_memory.js';
import {EntityCognition104} from '../src/phase104_entity_cognition.js';
import {IncrementalReasoningGraph105,type ProjectionDefinition105} from '../src/phase105_incremental_reasoning_graph.js';
const frame={categoryId:'vacuum',criterionId:'noise',frameId:'hard_floor_normal_mode'};
const time=(s=0)=>new Date(Date.UTC(2026,9,11,7,0,s)).toISOString();
const source=(testId:string):SourcePointer=>({sourceUrl:`https://evidence.example.org/${testId}`,
 originalTestId:testId,sourceRevisionSha256:'a'.repeat(64),sourceSpanSha256:'b'.repeat(64),
 sourceLocator:'#measure',methodologyReference:'independent original methodology documented',
 assessmentReference:'independent review receipt recorded',assessorId:'reviewer_1',
 assessedAt:time(),originalTestLineageReviewed:true,exactVariantReviewed:true,contextReviewed:true});
const claim=(id:string,testId:string,variantId='alpha',levelId='quiet'):CalibratedLevelClaim=>({
 ...frame,id,variantId,kind:'calibrated_level',levelId,
 scaleReference:'approved calibrated noise scale',source:source(testId)
});
const belief=(variantId:string)=>({kind:'belief' as const,...frame,variantId});
const node=(nodeId:string,dependencies:ProjectionDefinition105['dependencies'],kind:'comparison'|'personalized_tradeoff'|'explanation'='comparison')=>({
 nodeId,categoryId:'vacuum',useContextId:'normal_use',kind,dependencies,engineReference:'reviewed deterministic evidence dependency projection'
});
function fixture(){
 const memory=new InterpretationMemory101();
 for(const id of ['alpha','beta','gamma'])memory.registerProduct({categoryId:'vacuum',variantId:id,displayName:id});
 const cognition=new EntityCognition104(),graph=new IncrementalReasoningGraph105();
 return {memory,cognition,graph,close:()=>{graph.close();cognition.close();memory.close();}};
}
const sync=(f:ReturnType<typeof fixture>,variantId:string,t:number)=>
 f.cognition.synchronize(f.memory.snapshotReviewedFrame(frame),variantId,time(t));

test('an original test changes only dependent comparison and explanation, not unrelated nodes',()=>{
 const f=fixture();try{
  f.graph.register(node('compare_ab',[belief('alpha'),belief('beta')]));
  f.graph.register(node('explain_ab',[{kind:'derived',nodeId:'compare_ab'}],'explanation'));
  f.graph.register(node('compare_gamma',[belief('gamma')]));
  f.memory.recordApprovedClaim(claim('e1','source_1'));sync(f,'alpha',1);
  const result=f.graph.replay(f.cognition);
  assert.deepEqual(result.affectedNodeIds,['compare_ab','explain_ab']);
  assert.equal(result.read,1);assert.equal(f.graph.invalidationHistory('compare_gamma').length,0);
  assert.equal(result.llmCalls,0);assert.equal(result.sourceTextRequired,false);
 }finally{f.close();}
});
test('replay is idempotent, cursor survives repeat and no false journal events',()=>{
 const f=fixture();try{f.graph.register(node('compare_ab',[belief('alpha')]));sync(f,'alpha',1);
  const r=f.graph.replay(f.cognition);assert.equal(r.read,1);
  assert.equal(f.graph.replay(f.cognition).read,0);
  assert.equal(f.graph.invalidationHistory('compare_ab').length,1);
  assert.deepEqual(f.graph.checkpoint(),{sequence:1,sha256:r.checkpoint.sha256});
 }finally{f.close();}
});
test('added, withdrawn and conflicting claims all invalidate prior computations',()=>{
 const f=fixture();try{
  f.graph.register(node('noise_compare',[belief('alpha'),belief('beta')]));
  f.memory.recordApprovedClaim(claim('c1','t1'));sync(f,'alpha',1);f.graph.replay(f.cognition);
  const first=f.graph.checkpoint().sequence;
  f.graph.acknowledgeComputed('noise_compare',f.cognition,'c'.repeat(64),first);
  assert.equal(f.graph.get('noise_compare')?.state,'computed_unverified');
  f.memory.recordApprovedClaim(claim('c2','t2','alpha','noisy'));
  sync(f,'alpha',2);f.graph.replay(f.cognition);
  assert.equal(f.graph.get('noise_compare')?.state,'needs_recomputation');
  f.memory.withdrawClaim('c2','source test corrected after methodological review',time(3));
  sync(f,'alpha',4);f.graph.replay(f.cognition);
  assert.equal(f.graph.invalidationHistory('noise_compare').length,3);
  assert.equal(f.graph.get('noise_compare')?.resultSha256,null);
 }finally{f.close();}
});
test('an unprocessed source revision blocks acknowledgement even if caller provides a digest',()=>{
 const f=fixture();try{f.graph.register(node('noise_compare',[belief('alpha')]));
  sync(f,'alpha',1);f.graph.replay(f.cognition);
  f.memory.recordApprovedClaim(claim('c1','t1'));sync(f,'alpha',2);
  assert.throws(()=>f.graph.acknowledgeComputed('noise_compare',f.cognition,'c'.repeat(64),1),/unreplayed_upstream_changes/);
  assert.equal(f.graph.get('noise_compare')?.state,'needs_recomputation');
 }finally{f.close();}
});
test('derived nodes must be recalculated in dependency order, no publication approval',()=>{
 const f=fixture();try{
  f.graph.register(node('compare_ab',[belief('alpha')]));
  f.graph.register(node('explain_ab',[{kind:'derived',nodeId:'compare_ab'}],'explanation'));
  sync(f,'alpha',1);f.graph.replay(f.cognition);
  assert.throws(()=>f.graph.acknowledgeComputed('explain_ab',f.cognition,'f'.repeat(64),1),/dependency_not_recomputed/);
  const x=f.graph.acknowledgeComputed('compare_ab',f.cognition,'a'.repeat(64),1);
  const y=f.graph.acknowledgeComputed('explain_ab',f.cognition,'b'.repeat(64),1);
  assert.equal(x.publicationReady,false);assert.equal(y.rankingEligible,false);assert.equal(y.state,'computed_unverified');
 }finally{f.close();}
});
test('multiple event page replay resumes exactly and downstream invalidation is coalesced',()=>{
 const f=fixture();try{f.graph.register(node('comparison',[belief('alpha')]));
  f.memory.recordApprovedClaim(claim('c1','t1'));sync(f,'alpha',1);
  f.memory.recordApprovedClaim(claim('c2','t2'));sync(f,'alpha',2);
  const a=f.graph.replay(f.cognition,1);
  assert.equal(a.moreAvailable,true);assert.equal(f.graph.replay(f.cognition,1).moreAvailable,false);
  assert.equal(f.graph.checkpoint().sequence,2);
  assert.equal(f.graph.pending().length,1);
  assert.deepEqual(f.graph.invalidationHistory('comparison').map(x=>x.sequence),[1,2]);
 }finally{f.close();}
});
test('durable graph survives restart; authoritative evidence stays in phase101',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'phase105-'));
 try{
  const c=new EntityCognition104(path.join(dir,'cognition.sqlite')),
    g=new IncrementalReasoningGraph105(path.join(dir,'graph.sqlite')),
    memory=new InterpretationMemory101();
  memory.registerProduct({categoryId:'vacuum',variantId:'alpha',displayName:'Alpha'});
  g.register(node('comparison',[belief('alpha')]));
  c.synchronize(memory.snapshotReviewedFrame(frame),'alpha',time(1));g.replay(c);g.close();c.close();
  const rc=new EntityCognition104(path.join(dir,'cognition.sqlite')),
    rg=new IncrementalReasoningGraph105(path.join(dir,'graph.sqlite'));
  assert.equal(rg.replay(rc).read,0);assert.equal(rg.invalidationHistory('comparison').length,1);
  assert.equal(rg.get('comparison')?.state,'needs_recomputation');
  rc.close();rg.close();memory.close();
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('checkpoint mismatches and missing upstream journal events fail closed',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'phase105-'));
 try{
  const c=new EntityCognition104(path.join(dir,'mind.sqlite')),
    g=new IncrementalReasoningGraph105(path.join(dir,'graph.sqlite')),
    memory=new InterpretationMemory101();
  memory.registerProduct({categoryId:'vacuum',variantId:'alpha',displayName:'Alpha'});
  c.synchronize(memory.snapshotReviewedFrame(frame),'alpha',time(1));g.replay(c);
  const db=new DatabaseSync(path.join(dir,'graph.sqlite'));
  db.exec(`UPDATE graph_checkpoint SET hash='${'f'.repeat(64)}' WHERE id=1`);db.close();
  assert.throws(()=>g.replay(c),/upstream_checkpoint_mismatch/);
  c.close();g.close();memory.close();
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('rejects graph cycles, unknown dependencies, cross category and duplicate inputs',()=>{
 const f=fixture();try{
  assert.throws(()=>f.graph.register(node('nodea',[{kind:'derived',nodeId:'nodeb'}])),/unknown_derived_dependency/);
  assert.throws(()=>f.graph.register(node('nodea',[{kind:'derived',nodeId:'nodea'}])),/invalid_derived_node/);
  assert.throws(()=>f.graph.register(node('dup',[belief('alpha'),belief('alpha')])),/duplicate_dependency/);
  assert.throws(()=>f.graph.register(node('wrong',[{...belief('alpha'),categoryId:'other'}])),/invalid_derived_node/);
  f.graph.register(node('nodea',[belief('alpha')]));
  assert.throws(()=>f.graph.register(node('nodea',[belief('beta')])),/immutable_projection_definition/);
 }finally{f.close();}
});
test('journal contains globally ordered events from multiple entities, not per-entity gaps',()=>{
 const f=fixture();try{
  f.graph.register(node('alpha_only',[belief('alpha')]));
  sync(f,'beta',1);sync(f,'alpha',2);sync(f,'gamma',3);
  const page=f.cognition.journalPage(0,'0'.repeat(64),2);
  assert.deepEqual(page.events.map(x=>x.sequence),[1,2]);assert.equal(page.hasMore,true);
  const first=f.graph.replay(f.cognition,2);assert.deepEqual(first.affectedNodeIds,['alpha_only']);
  const second=f.graph.replay(f.cognition,2);assert.deepEqual(second.affectedNodeIds,[]);
  assert.equal(f.graph.checkpoint().sequence,3);
 }finally{f.close();}
});
test('append-only causal invalidation history refuses SQL rewrite',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'phase105-'));
 try{
  const dbPath=path.join(dir,'graph.sqlite');const f=fixture();const graph=new IncrementalReasoningGraph105(dbPath);
  graph.register(node('comparison',[belief('alpha')]));sync(f,'alpha',1);graph.replay(f.cognition);
  const db=new DatabaseSync(dbPath);
  assert.throws(()=>db.exec('DELETE FROM projection_change_log'),/append_only_projection_log/);
  db.close();graph.close();f.close();
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('no text, price, review excerpts, arbitrary rating or generated recommendation in projection data',()=>{
 const f=fixture();try{
  const r=f.graph.register(node('comparison',[belief('alpha')]));
  assert.equal(r.publicationReady,false);assert.equal(r.resultSha256,null);
  assert.equal(r.llmCalls,0);assert.equal(r.rankingEligible,false);
  assert.throws(()=>f.graph.acknowledgeComputed('comparison',f.cognition,'score: 90',0),/invalid_computation_receipt/);
 }finally{f.close();}
});
