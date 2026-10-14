/**
 * Phase107 — deterministic, source-text-free, research-only personalized
 * recomputation from reviewed Phase101 calibrated-level claims, Phase98
 * compensatory MCDA and Phase100 exact restricted preference envelope.
 *
 * Phase105 graph registers immutable configuration by digest, records changes,
 * and stores derived snapshots; Phase104 tracks the source interpretation
 * revision. A fresh read checks the LIVE Phase101 records, cognition journal,
 * graph state and immutable context again. No live-source lookup, LLM call,
 * review-text persistence, source-rating bonus, or public ranking permission.
 */
import {createHash} from 'node:crypto';
import {InterpretationMemory101,type StoredClaim} from './phase101_interpretation_memory.js';
import {EntityCognition104} from './phase104_entity_cognition.js';
import {IncrementalReasoningGraph105,type ResearchCache106,type Dependency105} from './phase105_incremental_reasoning_graph.js';
import {evaluateCompensatoryTradeoffs,type ReviewedPreferenceModel,
  type HardRequirement,type TradeoffResearchResult,type IndependentPerformanceAssessment} from './phase98_tradeoff_value_model.js';
import {assessAdaptiveFromStoredReviewedValues,type OrdinalSwingJudgement,
  type AdaptivePreferenceResult} from './phase100_adaptive_preference_envelope.js';
const sha=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const id=(v:unknown):v is string=>typeof v==='string'&&/^[a-z][a-z0-9_]{1,90}$/.test(v);
const ALG='phase107_reviewed_tradeoff_v1';
const engine=(digest:string)=>ALG+':'+digest;
const touch=(c:StoredClaim,v:string)=>c.variantId===v||(c.kind==='pairwise'&&c.comparedVariantId===v);
export interface CriterionFrame107 {criterionId:string;frameId:string;scaleReference:string;}
export interface ReviewedTradeoffContext107 {
  nodeId:string;categoryId:string;useContextId:string;
  variantIds:readonly [string,string];
  reviewedPreferenceModel:ReviewedPreferenceModel;
  criterionFrames:readonly CriterionFrame107[];
  hardRequirements:readonly HardRequirement[];
  ordinalJudgements:readonly OrdinalSwingJudgement[];
  preferenceExplorationReference:string;
  preferenceExplorationConfirmed:true;
}
export interface ReviewedTradeoffSnapshot107 {
  type:'reviewed_personalized_tradeoff';
  profileSha256:string;
  variantIds:[string,string];
  primary:TradeoffResearchResult;
  ordinalRobustness:AdaptivePreferenceResult;
  unresolvedCalibrations:string[];
  sourceReferences:{criterionId:string;variantId:string;originalTestId:string;sourceUrl:string}[];
  /** No source text or new LLM calls are used to evaluate stored evidence. */
  sourceTextRequired:false;llmCalls:0;publicationReady:false;rankingEligible:false;
  interpretation:'research_conditional_only';
}
export type PersonalizedOutcome107={status:'ready_research'|'awaiting_reviewed_calibration'|'still_stale';
  nodeId:string;cache:ResearchCache106|null;reason:string|null;
  sourceTextRequired:false;llmCalls:0;publicationReady:false;rankingEligible:false};
function checkConfig(c:ReviewedTradeoffContext107):void{
  if(!c||![c.nodeId,c.categoryId,c.useContextId,...(c.variantIds??[])].every(id)||
    !Array.isArray(c.variantIds)||c.variantIds.length!==2||c.variantIds[0]===c.variantIds[1]||
    !c.reviewedPreferenceModel||!Array.isArray(c.reviewedPreferenceModel.criteria)||
    c.reviewedPreferenceModel.criteria.length<2||c.reviewedPreferenceModel.criteria.length>5||
    !Array.isArray(c.criterionFrames)||c.criterionFrames.length!==c.reviewedPreferenceModel.criteria.length||
    !Array.isArray(c.hardRequirements)||!Array.isArray(c.ordinalJudgements)||
    c.preferenceExplorationConfirmed!==true||
    typeof c.preferenceExplorationReference!=='string'||c.preferenceExplorationReference.trim().length<12)
    throw Error('invalid_reviewed_tradeoff_context');
  for(let i=0;i<c.criterionFrames.length;i++){
    const frame=c.criterionFrames[i],scale=c.reviewedPreferenceModel.criteria[i];
    if(!id(frame?.criterionId)||!id(frame?.frameId)||
      frame.criterionId!==scale.criterionId||frame.scaleReference!==scale.valueScaleElicitationReceipt)
      throw Error('unmatched_reviewed_value_frame');
  }
  if(new Set(c.criterionFrames.map(f=>f.criterionId)).size!==c.criterionFrames.length)
    throw Error('duplicate_criterion_frame');
}
function leaves(c:ReviewedTradeoffContext107):Extract<Dependency105,{kind:'belief'}>[]{
  return c.criterionFrames.flatMap(f=>c.variantIds.map(variantId=>({kind:'belief' as const,
    categoryId:c.categoryId,criterionId:f.criterionId,frameId:f.frameId,variantId})));
}
export class PersonalizedRecomputation107 {
  constructor(private readonly memory:InterpretationMemory101,
    private readonly cognition:EntityCognition104,
    private readonly graph:IncrementalReasoningGraph105){}
  register(c:ReviewedTradeoffContext107):void{
    checkConfig(c);
    this.graph.register({nodeId:c.nodeId,categoryId:c.categoryId,useContextId:c.useContextId,
      kind:'personalized_tradeoff',engineReference:engine(sha(c)),dependencies:leaves(c)});
  }
  private verifyDefinition(c:ReviewedTradeoffContext107):void{
    checkConfig(c);
    const node=this.graph.get(c.nodeId);
    if(!node||node.definition.kind!=='personalized_tradeoff'||
      node.definition.engineReference!==engine(sha(c))||
      node.definition.categoryId!==c.categoryId||node.definition.useContextId!==c.useContextId||
      JSON.stringify(node.definition.dependencies)!==JSON.stringify(leaves(c)))
      throw Error('immutable_reviewed_profile_or_dependencies_mismatch');
  }
  private revisions(c:ReviewedTradeoffContext107):Record<string,string>{
    const o:Record<string,string>={};
    for(const d of leaves(c)){
      const snapshot=this.memory.snapshotReviewedFrame({categoryId:d.categoryId,
        criterionId:d.criterionId,frameId:d.frameId});
      const relevant=snapshot.claims.filter(x=>touch(x,d.variantId)).sort((a,b)=>a.id.localeCompare(b.id));
      const cell=this.cognition.productMind(d.categoryId,d.variantId).cells.find(
        x=>x.criterionId===d.criterionId&&x.frameId===d.frameId);
      if(!cell||cell.evidenceFingerprint!==sha(relevant))throw Error('unsynchronized_interpretation_memory');
      o[[d.categoryId,d.criterionId,d.frameId,d.variantId].join(':')]=cell.evidenceFingerprint;
    }
    return Object.fromEntries(Object.entries(o).sort(([a],[b])=>a.localeCompare(b)));
  }
  private syncedCheckpoint(){
    const chk=this.graph.checkpoint(),page=this.cognition.journalPage(chk.sequence,chk.sha256,1);
    if(page.headSequence!==chk.sequence)throw Error('unreplayed_upstream_changes');
    return chk;
  }
  readFresh(c:ReviewedTradeoffContext107):ResearchCache106|null{
    this.verifyDefinition(c);
    let before:ReturnType<PersonalizedRecomputation107['syncedCheckpoint']>;
    try{before=this.syncedCheckpoint();}catch(e){if((e as Error).message==='unreplayed_upstream_changes')return null;throw e;}
    if(this.graph.get(c.nodeId)?.state!=='computed_unverified')return null;
    const cache=this.graph.researchCache(c.nodeId);
    if(!cache||cache.algorithmId!==ALG||!cache.payload||
      (cache.payload as ReviewedTradeoffSnapshot107).profileSha256!==sha(c))return null;
    let now:Record<string,string>;
    try{now=this.revisions(c);}catch(e){if((e as Error).message==='unsynchronized_interpretation_memory')return null;throw e;}
    if(JSON.stringify(cache.frameRevisions)!==JSON.stringify(now)||
      Object.keys(cache.dependencyDigests).length)return null;
    const end=this.syncedCheckpoint();
    return before.sequence===end.sequence&&before.sha256===end.sha256?cache:null;
  }
  recompute(c:ReviewedTradeoffContext107,observedAt:string):PersonalizedOutcome107{
    this.verifyDefinition(c);
    if(!/^\d{4}-\d\d-\d\dT/.test(observedAt)||Number.isNaN(Date.parse(observedAt)))
      throw Error('invalid_personalized_recomputation_timestamp');
    for(const dep of leaves(c))this.cognition.synchronize(this.memory.snapshotReviewedFrame({
      categoryId:dep.categoryId,criterionId:dep.criterionId,frameId:dep.frameId}),dep.variantId,observedAt);
    for(let n=0;n<100;n++){if(!this.graph.replay(this.cognition,250).moreAvailable)break;
      if(n===99)throw Error('personalized_journal_replay_limit');}
    const base={nodeId:c.nodeId,sourceTextRequired:false as const,llmCalls:0 as const,
      publicationReady:false as const,rankingEligible:false as const};
    const existing=this.readFresh(c);
    if(existing)return {...base,status:'ready_research',cache:existing,reason:null};
    if(this.graph.get(c.nodeId)?.state==='computed_unverified')return {...base,
      status:'still_stale',cache:null,reason:'previous_cache_not_current'};
    const before=this.revisions(c),checkpoint=this.syncedCheckpoint();
    const performances:IndependentPerformanceAssessment[]=[],unresolved:string[]=[];
    for(const f of c.criterionFrames){
      const result=this.memory.getCalibratedPerformance({categoryId:c.categoryId,
        criterionId:f.criterionId,frameId:f.frameId,scaleReference:f.scaleReference});
      unresolved.push(...result.unresolvedVariantIds.filter(v=>c.variantIds.includes(v)).map(v=>v+':'+f.criterionId));
      performances.push(...result.performance.filter(x=>c.variantIds.includes(x.variantId)));
    }
    // Multiple independently reviewed, but unreconciled level claims are NOT averaged.
    // Stop until an adjudicator records a single valid replacement interpretation.
    if(unresolved.length)return {...base,status:'awaiting_reviewed_calibration',cache:null,
      reason:'unreconciled_calibrated_levels:'+unresolved.sort().join(',')};
    // A claimed hard pass/fail must at least link back to an ACTIVE reviewed
    // original-test record for that criterion and exact variant. The separate
    // hard-threshold adjudication still requires human review; simple level
    // membership does not establish a pass or a failure.
    for(const hard of c.hardRequirements){
      const frame=c.criterionFrames.find(f=>f.criterionId===hard.criterionId);
      if(!frame)throw Error('hard_requirement_without_reviewed_criterion');
      const currentClaims=this.memory.snapshotReviewedFrame({categoryId:c.categoryId,
        criterionId:frame.criterionId,frameId:frame.frameId}).claims;
      for(const decision of hard.variantAssessments){
        if(decision.result==='unresolved')continue;
        if(!currentClaims.some(claim=>claim.variantId===decision.variantId&&
          claim.source.originalTestId===decision.originalTestId&&
          claim.source.sourceUrl===decision.sourceUrl))
          throw Error('hard_decision_not_linked_to_active_original_test');
      }
    }
    const primary=evaluateCompensatoryTradeoffs({preferenceModel:c.reviewedPreferenceModel,
      variantIds:c.variantIds,performance:performances,hardRequirements:c.hardRequirements});
    const robustness=assessAdaptiveFromStoredReviewedValues({tradeoffs:primary,
      reviewedPreferenceModel:c.reviewedPreferenceModel,ordinalJudgements:c.ordinalJudgements,
      preferenceExplorationConfirmed:true,preferenceExplorationReference:c.preferenceExplorationReference});
    const payload:ReviewedTradeoffSnapshot107={type:'reviewed_personalized_tradeoff',
      profileSha256:sha(c),variantIds:[...c.variantIds],primary,ordinalRobustness:robustness,
      unresolvedCalibrations:[],sourceReferences:performances.map(p=>({criterionId:p.criterionId,
        variantId:p.variantId,originalTestId:p.originalTestId,sourceUrl:p.sourceUrl})),
      sourceTextRequired:false,llmCalls:0,publicationReady:false,rankingEligible:false,
      interpretation:'research_conditional_only'};
    // Detect arrival of a new source interpretation or review event during calculation.
    let current:Record<string,string>;
    try{current=this.revisions(c);}catch(e){if((e as Error).message==='unsynchronized_interpretation_memory')return {...base,
      status:'still_stale',cache:null,reason:'source_changed_during_computation'};throw e;}
    const chk=this.syncedCheckpoint();
    if(JSON.stringify(current)!==JSON.stringify(before)||
      checkpoint.sequence!==chk.sequence||checkpoint.sha256!==chk.sha256)
      return {...base,status:'still_stale',cache:null,reason:'source_changed_during_computation'};
    this.graph.commitResearchCache({nodeId:c.nodeId,algorithmId:ALG,journalSequence:chk.sequence,
      payload,dependencyDigests:{},frameRevisions:before},this.cognition);
    const cache=this.readFresh(c);
    return cache?{...base,status:'ready_research',cache,reason:null}:
      {...base,status:'still_stale',cache:null,reason:'source_changed_after_commit'};
  }
}
