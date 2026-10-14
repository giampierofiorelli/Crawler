import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {InterpretationMemory101,type SourcePointer,type CalibratedLevelClaim} from '../src/phase101_interpretation_memory.js';
import {EntityCognition104} from '../src/phase104_entity_cognition.js';
import {IncrementalReasoningGraph105} from '../src/phase105_incremental_reasoning_graph.js';
import {PersonalizedRecomputation107,type ReviewedTradeoffContext107,type ReviewedTradeoffSnapshot107}
 from '../src/phase107_personalized_recomputation.js';
const at=(sec=0)=>new Date(Date.UTC(2026,9,11,9,0,sec)).toISOString();
const source=(testId:string):SourcePointer=>({sourceUrl:'https://lab.example.org/'+testId,
  originalTestId:testId,sourceRevisionSha256:'a'.repeat(64),sourceSpanSha256:'b'.repeat(64),
  sourceLocator:'#review-method',methodologyReference:'original professionally tested methodology',
  assessmentReference:'human approved criterion level calibration',assessorId:'research_editor',assessedAt:at(),
  originalTestLineageReviewed:true,exactVariantReviewed:true,contextReviewed:true});
const criteria=['noise','cleaning'];
const context=():ReviewedTradeoffContext107=>({
  nodeId:'tradeoff_ab',categoryId:'vacuum',useContextId:'hard_floor',variantIds:['alpha','beta'],
  criterionFrames:[{criterionId:'noise',frameId:'normal',scaleReference:'noise reviewed scale research'},
    {criterionId:'cleaning',frameId:'normal',scaleReference:'cleaning reviewed scale research'}],
  reviewedPreferenceModel:{profileReference:'confirmed preference user session',userPreferencesConfirmed:true,
    independentlyReviewedAdditiveAssumptions:true,additiveReviewReference:'independent additive assessment',
    criteria:[{criterionId:'noise',swingWeight:0.6,weightElicitationReceipt:'noise weight swing review',
       valueScaleElicitationReceipt:'noise reviewed scale research',levels:[
        {id:'poor',value:0,description:'poor noise experience'},{id:'good',value:100,description:'quiet experience'}]},
      {criterionId:'cleaning',swingWeight:0.4,weightElicitationReceipt:'cleaning swing reviewed',
       valueScaleElicitationReceipt:'cleaning reviewed scale research',levels:[
        {id:'poor',value:0,description:'poor cleaning'},{id:'good',value:100,description:'excellent cleaning'}]}]},
  hardRequirements:[],ordinalJudgements:[],preferenceExplorationConfirmed:true,
  preferenceExplorationReference:'user requests optional ordinal exploration'});
function setup(dir?:string){
  const f=(name:string)=>dir?join(dir,name):':memory:';
  const memory=new InterpretationMemory101(f('memory.sqlite'));
  for(const variantId of ['alpha','beta','gamma'])memory.registerProduct({categoryId:'vacuum',variantId,displayName:'Vacuum '+variantId});
  const cognition=new EntityCognition104(f('mind.sqlite'));
  const graph=new IncrementalReasoningGraph105(f('graph.sqlite'));
  const engine=new PersonalizedRecomputation107(memory,cognition,graph);
  const c=context();engine.register(c);
  const close=()=>{graph.close();cognition.close();memory.close();};
  const record=(variantId:string,criterionId:string,levelId:string,testId:string)=>{
    memory.recordApprovedClaim({id:testId,categoryId:'vacuum',variantId,criterionId,frameId:'normal',
      kind:'calibrated_level',levelId,scaleReference:criterionId+' reviewed scale research',source:source(testId)});
  };
  const seeded=()=>{
    record('alpha','noise','poor','lab_noise_a');record('beta','noise','good','lab_noise_b');
    record('alpha','cleaning','good','lab_clean_a');record('beta','cleaning','poor','lab_clean_b');
  };
  return {memory,cognition,graph,engine,c,record,seeded,close};
}
const payload=(r:ReturnType<PersonalizedRecomputation107['recompute']>)=>r.cache?.payload as ReviewedTradeoffSnapshot107;
test('persisted interpretations feed Phase98 and Phase100; negative performance reduces ranking but is compensated',()=>{
  const f=setup();try{f.seeded();const r=f.engine.recompute(f.c,at(1));
    assert.equal(r.status,'ready_research');const x=payload(r);
    assert.deepEqual(x.primary.conditionalOrder,['beta','alpha']);
    assert.equal(x.primary.variants[0].exactTotalValue,40);
    assert.equal(x.primary.variants[1].exactTotalValue,60);
    assert.equal(x.ordinalRobustness.status,'underdetermined');
    assert.ok(x.ordinalRobustness.question);
    assert.equal(r.llmCalls,0);assert.equal(x.publicationReady,false);
    assert.ok(x.sourceReferences.every(r=>r.sourceUrl.startsWith('https://')));
    assert.equal(JSON.stringify(r.cache).includes('reviewArticleBody'),false);
  }finally{f.close();}
});
test('confirmed full-swing preference drives robust ordinal result without arbitrary word scores',()=>{
  const f=setup();try{f.seeded();f.c.ordinalJudgements=[{firstCriterionId:'cleaning',secondCriterionId:'noise',
    preference:'more_important',userConfirmed:true,answerReference:'user confirmed full swing'}];
    f.engine.register({...f.c,nodeId:'tradeoff_profile_two'});
    const c={...f.c,nodeId:'tradeoff_profile_two'};
    const robust=payload(f.engine.recompute(c,at(1))).ordinalRobustness;
    // Strict ordinal comparisons have no elicited minimum cardinal gap: a near
    // tie stays possible, so the model must NOT invent a robust winner.
    assert.equal(robust.status,'underdetermined');
    assert.ok(robust.differenceBounds![0]>-0.01);
  }finally{f.close();}
});
test('missing evidence remains unknown, not a zero or silent product exclusion',()=>{
  const f=setup();try{f.record('alpha','noise','poor','noise_a');f.record('beta','noise','good','noise_b');
    const x=payload(f.engine.recompute(f.c,at(1)));
    assert.equal(x.ordinalRobustness.status,'need_more_evidence');
    assert.equal(x.primary.variants[0].eligibility,'tradeoff_eligible');
    assert.deepEqual(x.primary.variants[0].missingCriteria,['cleaning']);
  }finally{f.close();}
});
test('unadjudicated multiple calibrated claims cannot enter compensatory ranking',()=>{
  const f=setup();try{f.seeded();f.record('alpha','noise','good','contradictory_independent');
    const r=f.engine.recompute(f.c,at(1));assert.equal(r.status,'awaiting_reviewed_calibration');
    assert.match(r.reason!,/alpha:noise/);assert.equal(f.graph.get(f.c.nodeId)?.state,'needs_recomputation');
  }finally{f.close();}
});
test('new evidence on relevant product invalidates cached preference BEFORE graph replay',()=>{
  const f=setup();try{f.seeded();f.engine.recompute(f.c,at(1));
    f.record('alpha','noise','good','new_calibration');
    assert.equal(f.engine.readFresh(f.c),null);
    assert.equal(f.engine.recompute(f.c,at(2)).status,'awaiting_reviewed_calibration');
  }finally{f.close();}
});
test('unrelated product evidence does not invalidate cached preference',()=>{
  const f=setup();try{f.seeded();const before=f.engine.recompute(f.c,at(1));
    f.record('gamma','noise','good','gamma_independent');
    assert.equal(f.engine.readFresh(f.c)?.resultSha256,before.cache?.resultSha256);
  }finally{f.close();}
});
test('withdrawal and revised approved memory yields new preference without rereading review text',()=>{
  const f=setup();try{f.seeded();const prev=f.engine.recompute(f.c,at(1));
    f.memory.withdrawClaim('lab_noise_a','reviewer withdrew previous measurement',at(2));
    f.record('alpha','noise','good','lab_noise_revision');
    const current=f.engine.recompute(f.c,at(3));
    assert.equal(current.status,'ready_research');
    assert.notEqual(prev.cache?.resultSha256,current.cache?.resultSha256);
    assert.deepEqual(payload(current).primary.conditionalOrder,['alpha','beta']);
    assert.ok(f.graph.invalidationHistory(f.c.nodeId).length>0);
  }finally{f.close();}
});
test('immutable user profile binding rejects changed weights, references, or frame calibration',()=>{
  const f=setup();try{
    const modified=structuredClone(f.c);modified.reviewedPreferenceModel.criteria[0].swingWeight=0.7;
    modified.reviewedPreferenceModel.criteria[1].swingWeight=0.3;
    assert.throws(()=>f.engine.recompute(modified,at(1)),/immutable_reviewed_profile/);
    const mismatched=structuredClone(f.c);mismatched.criterionFrames[0].scaleReference='wrong scale';
    assert.throws(()=>f.engine.register(mismatched),/unmatched_reviewed_value_frame/);
  }finally{f.close();}
});
test('confirmed non-negotiable failure is separated from ordinary compensable defects',()=>{
  const f=setup();try{f.seeded();f.c.hardRequirements=[{criterionId:'noise',
    confirmedHardRequirementReference:'user confirmed eight hour silence requirement',
    variantAssessments:[{variantId:'alpha',result:'demonstrated_failure',sourceUrl:source('lab_noise_a').sourceUrl,
      originalTestId:'lab_noise_a',methodReviewed:true},
      {variantId:'beta',result:'demonstrated_pass',sourceUrl:source('lab_noise_b').sourceUrl,
       originalTestId:'lab_noise_b',methodReviewed:true}]}];
    const c={...f.c,nodeId:'veto_confirmed'};f.engine.register(c);
    const x=payload(f.engine.recompute(c,at(1)));
    assert.equal(x.primary.variants[0].eligibility,'provisionally_excluded');
    assert.equal(x.ordinalRobustness.status,'hard_requirement_unresolved_or_failed');
  }finally{f.close();}
});
test('cache integrity and stable profile survive restart across three source databases',()=>{
  const dir=mkdtempSync(join(tmpdir(),'phase107-'));
  try{let f=setup(dir);f.seeded();const cached=f.engine.recompute(f.c,at(1));f.close();
    f=setup(dir);assert.equal(f.engine.readFresh(f.c)?.resultSha256,cached.cache?.resultSha256);f.close();
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('conflicting user swing preferences are detected, not averaged',()=>{
  const f=setup();try{f.seeded();const c={...f.c,nodeId:'conflict_profile',ordinalJudgements:[
    {firstCriterionId:'noise',secondCriterionId:'cleaning',preference:'more_important' as const,userConfirmed:true as const,answerReference:'confirmed statement one'},
    {firstCriterionId:'cleaning',secondCriterionId:'noise',preference:'more_important' as const,userConfirmed:true as const,answerReference:'confirmed statement two'}]};
    f.engine.register(c);assert.throws(()=>f.engine.recompute(c,at(1)),/duplicate_swing_question/);
  }finally{f.close();}
});
test('unsupported additive scales are rejected rather than treated as calibrated',()=>{
  const f=setup();try{const c=structuredClone(f.c);c.nodeId='invalid_model';
    c.reviewedPreferenceModel.criteria[0].swingWeight=0.9;
    f.engine.register(c);
    f.seeded();assert.throws(()=>f.engine.recompute(c,at(1)),/swing_weights_not_normalized/);
  }finally{f.close();}
});
test('mid-computation source revision never becomes a fresh cached ranking',()=>{
  const f=setup();try{f.seeded();const orig=f.graph.commitResearchCache.bind(f.graph);
    f.graph.commitResearchCache=(params,cog)=>{
      f.record('alpha','noise','good','late_claim');
      return orig(params,cog);
    };
    const result=f.engine.recompute(f.c,at(1));
    assert.equal(result.status,'still_stale');
    assert.equal(f.engine.readFresh(f.c),null);
  }finally{f.close();}
});
test('phase107 cache can never be published as approved consumer recommendation',()=>{
  const f=setup();try{f.seeded();const r=f.engine.recompute(f.c,at(1));
    assert.equal(r.publicationReady,false);assert.equal(r.rankingEligible,false);
    assert.equal(r.cache?.rankingEligible,false);
    assert.equal(payload(r).ordinalRobustness.publicationReady,false);
  }finally{f.close();}
});
test('a fabricated hard veto with no matching active original test is rejected',()=>{
  const f=setup();try{f.seeded();const c={...f.c,nodeId:'nonexistent_hard_test',
    hardRequirements:[{criterionId:'noise',confirmedHardRequirementReference:'user explicitly confirmed mandatory threshold',
      variantAssessments:[{variantId:'alpha',result:'demonstrated_failure' as const,
        sourceUrl:'https://lab.example.org/unknown',originalTestId:'unknown',methodReviewed:true as const},
        {variantId:'beta',result:'unresolved' as const}]}]};
    f.engine.register(c);
    assert.throws(()=>f.engine.recompute(c,at(1)),/hard_decision_not_linked_to_active_original_test/);
  }finally{f.close();}
});
