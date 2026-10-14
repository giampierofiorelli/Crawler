import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {InterpretationMemory101,type StoredClaim,type SourcePointer} from '../src/phase101_interpretation_memory.js';
import {EntityCognition104} from '../src/phase104_entity_cognition.js';
import {IncrementalReasoningGraph105} from '../src/phase105_incremental_reasoning_graph.js';
import {ResearchRecomputation106,phase106EngineReferences,type PairResearch106,type ExplanationResearch106}
 from '../src/phase106_recomputation_worker.js';
const frame={categoryId:'vacuum',criterionId:'noise',frameId:'normal_floor'};
const at=(s=0)=>new Date(Date.UTC(2026,9,11,9,0,s)).toISOString();
const source=(originalTestId:string):SourcePointer=>({sourceUrl:`https://tests.example.org/${originalTestId}`,
 originalTestId,sourceRevisionSha256:'a'.repeat(64),sourceSpanSha256:'b'.repeat(64),
 sourceLocator:'#comparison',methodologyReference:'reviewed independent primary method',
 assessmentReference:'separately assessed test observations',assessorId:'reviewer_one',
 assessedAt:at(0),originalTestLineageReviewed:true,exactVariantReviewed:true,contextReviewed:true});
const pair=(id:string,variantId:string,comparedVariantId:string,originalTestId:string):StoredClaim=>({
 id,...frame,variantId,comparedVariantId,kind:'pairwise',relation:'better',
 comparisonBasis:'same_original_test',source:source(originalTestId)});
const dep=(variantId:string)=>({kind:'belief' as const,...frame,variantId});
function setup(dir?:string){
 const p=(name:string)=>dir?join(dir,name):':memory:';
 const memory=new InterpretationMemory101(p('memory.sqlite'));
 memory.registerProduct({categoryId:'vacuum',variantId:'alpha',displayName:'Vacuum Alpha'});
 memory.registerProduct({categoryId:'vacuum',variantId:'beta',displayName:'Vacuum Beta'});
 memory.registerProduct({categoryId:'vacuum',variantId:'gamma',displayName:'Vacuum Gamma'});
 const cognition=new EntityCognition104(p('mind.sqlite'));
 const graph=new IncrementalReasoningGraph105(p('graph.sqlite'));
 graph.register({nodeId:'compare_ab',categoryId:'vacuum',useContextId:'floor_use',kind:'comparison',
   engineReference:phase106EngineReferences.comparison,dependencies:[dep('alpha'),dep('beta')]});
 graph.register({nodeId:'explain_ab',categoryId:'vacuum',useContextId:'floor_use',kind:'explanation',
   engineReference:phase106EngineReferences.explanation,dependencies:[{kind:'derived',nodeId:'compare_ab'}]});
 const worker=new ResearchRecomputation106(memory,cognition,graph);
 return {memory,cognition,graph,worker,close:()=>{graph.close();cognition.close();memory.close();}};
}
test('direct original test comparison is recomputed and stored, text-free and without LLM',()=>{
 const f=setup();try{
  f.memory.recordApprovedClaim(pair('c1','alpha','beta','study_one'));
  const r=f.worker.recompute('compare_ab',at(1));
  assert.equal(r.status,'ready_research');
  const p=r.result!.payload as PairResearch106;
  assert.equal(p.status,'supported_better');
  assert.deepEqual(p.supportOriginalTestIds,['study_one']);
  assert.equal(r.llmCalls,0);assert.equal(r.publicationReady,false);assert.equal(r.rankingEligible,false);
  assert.deepEqual(f.worker.readFresh('compare_ab'),r.result);
  assert.equal(f.graph.get('compare_ab')?.state,'computed_unverified');
 }finally{f.close();}
});
test('dependent explanation recomputes in order, linked by upstream result hash',()=>{
 const f=setup();try{
  f.memory.recordApprovedClaim(pair('c1','alpha','beta','study_one'));
  const r=f.worker.recompute('explain_ab',at(1));
  assert.equal(r.status,'ready_research');
  const explanation=r.result!.payload as ExplanationResearch106;
  assert.equal(explanation.status,'supported_better');
  assert.equal(explanation.upstreamResultSha256,f.graph.researchCache('compare_ab')?.resultSha256);
  assert.deepEqual(explanation.originalTestIds,['study_one']);
  assert.equal(explanation.consumerWinnerId,null);
  assert.equal(f.worker.recompute('explain_ab',at(2)).result?.resultSha256,r.result?.resultSha256);
 }finally{f.close();}
});
test('new disagreement invalidates direct pair and explanation and recomputes only affected projections',()=>{
 const f=setup();try{
  f.memory.recordApprovedClaim(pair('c1','alpha','beta','study_one'));
  f.worker.recompute('explain_ab',at(1));
  f.memory.recordApprovedClaim(pair('c2','beta','alpha','study_two'));
  assert.equal(f.worker.readFresh('compare_ab'),null);
  const changed=f.worker.recompute('explain_ab',at(2));
  assert.equal((changed.result!.payload as ExplanationResearch106).status,'contested');
  assert.deepEqual((f.worker.readFresh('compare_ab')!.payload as PairResearch106).opposeOriginalTestIds,['study_two']);
  assert.ok(f.graph.invalidationHistory('explain_ab').length>=2);
 }finally{f.close();}
});
test('withdrawal recovers supported comparison without erasing revision history',()=>{
 const f=setup();try{
  f.memory.recordApprovedClaim(pair('c1','alpha','beta','study_one'));
  f.memory.recordApprovedClaim(pair('c2','beta','alpha','study_two'));
  f.worker.recompute('explain_ab',at(1));
  f.memory.withdrawClaim('c2','methodological correction from primary test',at(2));
  assert.equal(f.worker.readFresh('explain_ab'),null);
  const next=f.worker.recompute('explain_ab',at(3));
  assert.equal((next.result!.payload as ExplanationResearch106).status,'supported_better');
  assert.ok(f.graph.invalidationHistory('compare_ab').length>=3);
 }finally{f.close();}
});
test('unrelated source record cannot be treated as conflicting direct pair',()=>{
 const f=setup();try{
  f.memory.recordApprovedClaim({...frame,id:'c1',variantId:'gamma',kind:'descriptor',
   descriptor:'somewhat_noisy',qualifier:'reviewer_relative',source:source('study_other')});
  const r=f.worker.recompute('compare_ab',at(1));
  assert.equal((r.result?.payload as PairResearch106).status,'not_directly_comparable');
  assert.deepEqual((r.result?.payload as PairResearch106).sourceClaimIds,[]);
 }finally{f.close();}
});
test('a newly stored interpretation blocks serving even before entity journal sync',()=>{
 const f=setup();try{
  f.memory.recordApprovedClaim(pair('c1','alpha','beta','study_one'));
  f.worker.recompute('compare_ab',at(1));
  f.memory.recordApprovedClaim(pair('c2','beta','alpha','study_two'));
  assert.equal(f.worker.readFresh('compare_ab'),null);
  assert.equal(f.graph.get('compare_ab')?.state,'computed_unverified');
 }finally{f.close();}
});
test('an already consumed journal cannot be faked into a publishable ranking',()=>{
 const f=setup();try{
  f.worker.recompute('compare_ab',at(1));
  const r=f.worker.readFresh('compare_ab')!;
  assert.equal(r.publicationReady,false);assert.equal(r.rankingEligible,false);
  assert.equal(JSON.stringify(r).includes('reviewArticleBody'),false);
  assert.throws(()=>f.graph.commitResearchCache({nodeId:'compare_ab',algorithmId:'phase106_direct_pair_v1',
     journalSequence:f.graph.checkpoint().sequence,payload:{score:99},
     dependencyDigests:{},frameRevisions:{}},f.cognition),/research_node_not_dirty/);
 }finally{f.close();}
});
test('legacy checksum-only result is not treated as verified research output',()=>{
 const f=setup();try{
  f.cognition.synchronize(f.memory.snapshotReviewedFrame(frame),'alpha',at(1));
  f.cognition.synchronize(f.memory.snapshotReviewedFrame(frame),'beta',at(1));
  f.graph.replay(f.cognition);
  f.graph.acknowledgeComputed('compare_ab',f.cognition,'d'.repeat(64),f.graph.checkpoint().sequence);
  assert.equal(f.worker.readFresh('compare_ab'),null);
  assert.equal(f.worker.recompute('compare_ab',at(2)).status,'still_stale');
 }finally{f.close();}
});
test('unsupported personalized tradeoff remains a review-gated, dirty projection',()=>{
 const f=setup();try{
  f.graph.register({nodeId:'tradeoff_ab',categoryId:'vacuum',useContextId:'floor_use',
   kind:'personalized_tradeoff',engineReference:'reviewed value function required by Phase98',
   dependencies:[{kind:'derived',nodeId:'compare_ab'}]});
  const r=f.worker.recompute('tradeoff_ab',at(1));
  assert.equal(r.status,'awaiting_reviewed_evaluator');
  assert.match(r.reason!,/reviewed_personalized_values_required/);
  assert.equal(f.graph.get('tradeoff_ab')?.state,'needs_recomputation');
 }finally{f.close();}
});
test('unknown or non-allowlisted algorithm is not executed',()=>{
 const f=setup();try{
  f.graph.register({nodeId:'compare_bc',categoryId:'vacuum',useContextId:'floor_use',
    kind:'comparison',engineReference:'unreviewed algorithm version 2040',
    dependencies:[dep('beta'),dep('gamma')]});
  assert.equal(f.worker.recompute('compare_bc',at(1)).status,'awaiting_reviewed_evaluator');
 }finally{f.close();}
});
test('research results survive process restart and retain reproducible source-free provenance',()=>{
 const dir=mkdtempSync(join(tmpdir(),'phase106-'));
 try{
  let f=setup(dir);
  f.memory.recordApprovedClaim(pair('c1','alpha','beta','study_one'));
  const first=f.worker.recompute('explain_ab',at(1));f.close();
  f=setup(dir); // same previously reviewed products/immutable definitions
  const second=f.worker.readFresh('explain_ab');
  assert.equal(second?.resultSha256,first.result?.resultSha256);
  assert.equal(second?.publicationReady,false);
  f.close();
 }finally{rmSync(dir,{force:true,recursive:true});}
});
test('tampered cache is rejected even if graph state says computed',()=>{
 const dir=mkdtempSync(join(tmpdir(),'phase106-'));
 try{
  const f=setup(dir);f.worker.recompute('compare_ab',at(1));
  const db=new DatabaseSync(join(dir,'graph.sqlite'));
  db.prepare('UPDATE projection_research_cache SET payload=? WHERE node_id=?').run('{"score":100}','compare_ab');
  db.close();
  assert.throws(()=>f.worker.readFresh('compare_ab'),/research_cache_integrity_failure/);
  f.close();
 }finally{rmSync(dir,{force:true,recursive:true});}
});
test('graph rejects forged child digest during dependency commit',()=>{
 const f=setup();try{
  f.worker.recompute('compare_ab',at(1));
  assert.throws(()=>f.graph.commitResearchCache({nodeId:'explain_ab',
    algorithmId:'phase106_pair_explanation_v1',journalSequence:f.graph.checkpoint().sequence,
    payload:{type:'evidence_explanation'},dependencyDigests:{compare_ab:'a'.repeat(64)},
    frameRevisions:{}},f.cognition),/derived_receipt_stale/);
 }finally{f.close();}
});
test('fresh research comparison survives evidence added for completely unrelated product',()=>{
 const f=setup();try{
  f.memory.recordApprovedClaim(pair('c1','alpha','beta','study_one'));
  const before=f.worker.recompute('compare_ab',at(1));
  f.memory.recordApprovedClaim({...frame,id:'c2',variantId:'gamma',kind:'descriptor',
    descriptor:'very_noisy',qualifier:'reviewer_relative',source:source('study_gamma')});
  assert.equal(f.worker.readFresh('compare_ab')?.resultSha256,before.result?.resultSha256);
  assert.equal(f.worker.recompute('compare_ab',at(2)).result?.resultSha256,before.result?.resultSha256);
 }finally{f.close();}
});
test('an unprocessed Phase104 event fails a read closed and does not serve stale comparison',()=>{
 const f=setup();try{
  f.memory.recordApprovedClaim(pair('c1','alpha','beta','study_one'));
  f.worker.recompute('compare_ab',at(1));
  f.memory.recordApprovedClaim(pair('c2','beta','alpha','study_two'));
  f.cognition.synchronize(f.memory.snapshotReviewedFrame(frame),'beta',at(2));
  assert.equal(f.worker.readFresh('compare_ab'),null);
  assert.equal(f.worker.recompute('compare_ab',at(3)).status,'ready_research');
 }finally{f.close();}
});
test('mid-computation evidence changes cannot yield a fresh research result',()=>{
 const f=setup();try{
  const orig=f.graph.commitResearchCache.bind(f.graph);
  f.graph.commitResearchCache=(input,cognition)=>{
    f.memory.recordApprovedClaim(pair('late','beta','alpha','study_late'));
    return orig(input,cognition);
  };
  const out=f.worker.recompute('compare_ab',at(1));
  assert.equal(out.status,'still_stale');
  assert.equal(f.worker.readFresh('compare_ab'),null);
  // After the new evidence is synchronized, a deterministic rebuild works.
  assert.equal(f.worker.recompute('compare_ab',at(2)).status,'ready_research');
 }finally{f.close();}
});
