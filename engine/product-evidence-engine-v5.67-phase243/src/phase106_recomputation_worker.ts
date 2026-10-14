/**
 * Phase106 — pinned-evidence research recomputation for Phase105's dirty graph.
 * Original professional-review content NEVER enters this module. Only fixed,
 * deterministic evaluators are available. Neither a checksum nor successful
 * execution authorizes a consumer ranking, review claim or source access.
 *
 * Source authority: Phase101, belief journal: Phase104, dependency graph:
 * Phase105. Different SQLite files are NOT a shared atomic transaction;
 * therefore all reads are freshly checked against ALL three stores.
 */
import {createHash} from 'node:crypto';
import {InterpretationMemory101,type StoredClaim} from './phase101_interpretation_memory.js';
import {EntityCognition104} from './phase104_entity_cognition.js';
import {IncrementalReasoningGraph105,type Dependency105,type ResearchCache106} from './phase105_incremental_reasoning_graph.js';
import {reasonOverEvidenceFrame102,type EvidenceFrameSnapshot102} from './phase102_evidence_knowledge.js';

const sha=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const frameId=(x:{categoryId:string;criterionId:string;frameId:string})=>
  [x.categoryId,x.criterionId,x.frameId].join(':');
const touch=(c:StoredClaim,variantId:string)=>c.variantId===variantId||
  (c.kind==='pairwise'&&c.comparedVariantId===variantId);

export type ResearchOutcome106={status:'ready_research'|'awaiting_reviewed_evaluator'|'still_stale';
  nodeId:string;result:ResearchCache106|null;sourceTextRequired:false;llmCalls:0;
  publicationReady:false;rankingEligible:false;reason:string|null};
export type PairResearch106={type:'direct_pairwise';categoryId:string;criterionId:string;frameId:string;
  firstVariantId:string;secondVariantId:string;
  status:'supported_better'|'supported_worse'|'reported_equivalent'|'contested'|'not_directly_comparable';
  supportOriginalTestIds:string[];opposeOriginalTestIds:string[];tieOriginalTestIds:string[];
  sourceClaimIds:string[];sourceReferences:{claimId:string;originalTestId:string;sourceUrl:string;methodologyReference:string}[];
  limitation:string|null;independentLaboratoryProven:false;};
export type ExplanationResearch106={type:'evidence_explanation';status:PairResearch106['status'];
  firstVariantId:string;secondVariantId:string;criterionId:string;
  explanation:string;originalTestIds:string[];upstreamNodeId:string;upstreamResultSha256:string;
  sourceReferences:{claimId:string;originalTestId:string;sourceUrl:string;methodologyReference:string}[];
  confidencePercentage:null;consumerWinnerId:null;};

const refFor=(kind:'comparison'|'explanation')=>kind==='comparison'?
  'phase106_direct_pair_v1_reviewed_research':'phase106_pair_explanation_v1_reviewed_research';

export class ResearchRecomputation106 {
  constructor(private readonly memory:InterpretationMemory101,
    private readonly cognition:EntityCognition104,
    private readonly graph:IncrementalReasoningGraph105){}
  /** Ancestors first. Registration in Phase105 already prevents cycles. */
  private dependencyLeaves(nodeId:string,visited=new Set<string>()):Extract<Dependency105,{kind:'belief'}>[]{
    if(visited.has(nodeId))throw Error('recursive_research_dependency');
    const node=this.graph.get(nodeId);
    if(!node)throw Error('unknown_research_node');
    visited.add(nodeId);
    const leaves:Extract<Dependency105,{kind:'belief'}>[]=[];
    for(const dep of node.definition.dependencies){
      if(dep.kind==='belief')leaves.push(dep);
      else leaves.push(...this.dependencyLeaves(dep.nodeId,new Set(visited)));
    }
    return [...new Map(leaves.map(d=>[[d.categoryId,d.variantId,d.criterionId,d.frameId].join('/'),d])).values()];
  }
  private snapshotFor(dep:Extract<Dependency105,{kind:'belief'}>):EvidenceFrameSnapshot102{
    return this.memory.snapshotReviewedFrame({categoryId:dep.categoryId,
      criterionId:dep.criterionId,frameId:dep.frameId});
  }
  /** Checks Phase101 state *even if Phase104 synchronization has not run*.
   * This prevents a previously cached projection being returned after a newly
   * approved/withdrawn record changes upstream outside the Phase104 journal. */
  private validateLeaves(nodeId:string):Record<string,string>{
    const revisions:Record<string,string>={};
    for(const dep of this.dependencyLeaves(nodeId)){
      const snap=this.snapshotFor(dep);
      const f=frameId(dep)+':'+dep.variantId;
      // Pin exactly the evidence for this variant, not all other products in
      // the category. An unrelated product's new review must not force refresh.
      const cell=this.cognition.productMind(dep.categoryId,dep.variantId).cells
        .find(c=>c.criterionId===dep.criterionId&&c.frameId===dep.frameId);
      const applicable=snap.claims.filter(c=>touch(c,dep.variantId)).sort((a,b)=>a.id.localeCompare(b.id));
      if(!cell||cell.evidenceFingerprint!==sha(applicable))throw Error('unsynchronized_interpretation_memory');
      revisions[f]=cell.evidenceFingerprint;
    }
    return Object.fromEntries(Object.entries(revisions).sort(([a],[b])=>a.localeCompare(b)));
  }
  private journalCurrent(){
    const checkpoint=this.graph.checkpoint();
    const journal=this.cognition.journalPage(checkpoint.sequence,checkpoint.sha256,1);
    if(journal.headSequence!==checkpoint.sequence)throw Error('upstream_events_not_replayed');
    return checkpoint;
  }
  /** Read only if source snapshot, journal, cache digest, and every derived
   * dependency remain current. Public recommendations are NEVER authorized. */
  readFresh(nodeId:string):ResearchCache106|null{
    let initial:ReturnType<ResearchRecomputation106['journalCurrent']>;
    try{initial=this.journalCurrent();}
    catch(e){if(e instanceof Error&&e.message==='upstream_events_not_replayed')return null;throw e;}
    const node=this.graph.get(nodeId);
    if(!node||node.state!=='computed_unverified')return null;
    const cache=this.graph.researchCache(nodeId);
    if(!cache)return null;
    if(node.definition.engineReference!==refFor(node.definition.kind==='comparison'?'comparison':'explanation'))return null;
    let revisions:Record<string,string>;
    try{revisions=this.validateLeaves(nodeId);}
    catch(e){if(e instanceof Error&&e.message==='unsynchronized_interpretation_memory')return null;throw e;}
    if(JSON.stringify(revisions)!==JSON.stringify(cache.frameRevisions))return null;
    for(const dep of node.definition.dependencies){
      if(dep.kind!=='derived')continue;
      const child=this.readFresh(dep.nodeId);
      if(!child||child.resultSha256!==cache.dependencyDigests[dep.nodeId])return null;
    }
    const after=this.journalCurrent();
    if(after.sequence!==initial.sequence||after.sha256!==initial.sha256)return null;
    return cache;
  }
  /** Idempotently synchronize only the belief cells required by this node.
   * No page retrieval, LLM inference, or new evidence approval occurs here. */
  private synchronizeLeaves(nodeId:string,observedAt:string){
    for(const dep of this.dependencyLeaves(nodeId))
      this.cognition.synchronize(this.snapshotFor(dep),dep.variantId,observedAt);
    for(let i=0;i<100;i++){
      const r=this.graph.replay(this.cognition,250);
      if(!r.moreAvailable)return;
    }
    throw Error('journal_replay_limit_exceeded');
  }
  private runNode(nodeId:string):ResearchOutcome106{
    const node=this.graph.get(nodeId);
    if(!node)throw Error('unknown_research_node');
    const notReady=(reason:string):ResearchOutcome106=>({status:'awaiting_reviewed_evaluator',nodeId,
      result:null,sourceTextRequired:false,llmCalls:0,publicationReady:false,rankingEligible:false,reason});
    if(node.definition.kind==='personalized_tradeoff')return notReady('reviewed_personalized_values_required');
    if(node.definition.engineReference!==refFor(node.definition.kind))return notReady('evaluator_not_allowlisted');
    if(node.definition.kind==='comparison'){
      const ds=node.definition.dependencies;
      if(ds.length!==2||ds.some(d=>d.kind!=='belief'))return notReady('exactly_two_beliefs_required');
      const [a,b]=ds as Extract<Dependency105,{kind:'belief'}>[];
      if(a.variantId===b.variantId||a.categoryId!==b.categoryId||
        a.criterionId!==b.criterionId||a.frameId!==b.frameId)
        return notReady('incomparable_context_or_variants');
    }else if(node.definition.dependencies.length!==1||
        node.definition.dependencies[0].kind!=='derived')return notReady('one_derived_pair_required');
    if(node.state==='computed_unverified'){
      const existing=this.readFresh(nodeId);
      if(existing)return {status:'ready_research',nodeId,result:existing,reason:null,
        sourceTextRequired:false,llmCalls:0,publicationReady:false,rankingEligible:false};
      return {status:'still_stale',nodeId,result:null,reason:'previous_result_not_fresh_or_not_verified',
        sourceTextRequired:false,llmCalls:0,publicationReady:false,rankingEligible:false};
    }
    for(const dep of node.definition.dependencies){
      if(dep.kind!=='derived')continue;
      const r=this.runNode(dep.nodeId);
      if(r.status!=='ready_research')return notReady('dependent_projection_not_ready');
    }
    const pinned=this.validateLeaves(nodeId);
    const expected=this.journalCurrent();
    const dependencyDigests:Record<string,string>={};
    let algorithmId:string,payload:PairResearch106|ExplanationResearch106;
    if(node.definition.kind==='comparison'){
      const [a,b]=node.definition.dependencies as Extract<Dependency105,{kind:'belief'}>[];
      const snapshot=this.snapshotFor(a);
      const pair=reasonOverEvidenceFrame102(snapshot).comparisons.find(p=>
        p.firstVariantId===[a.variantId,b.variantId].sort()[0]&&
        p.secondVariantId===[a.variantId,b.variantId].sort()[1]);
      if(!pair)throw Error('missing_exact_variant_pair');
      payload={type:'direct_pairwise',categoryId:a.categoryId,criterionId:a.criterionId,frameId:a.frameId,
        firstVariantId:pair.firstVariantId,secondVariantId:pair.secondVariantId,
        status:pair.status,supportOriginalTestIds:pair.supportOriginalTestIds,
        opposeOriginalTestIds:pair.opposeOriginalTestIds,tieOriginalTestIds:pair.tieOriginalTestIds,
        sourceClaimIds:pair.sourceClaimIds,sourceReferences:snapshot.claims.filter(c=>pair.sourceClaimIds.includes(c.id))
          .map(c=>({claimId:c.id,originalTestId:c.source.originalTestId,
            sourceUrl:c.source.sourceUrl,methodologyReference:c.source.methodologyReference})),
        limitation:pair.limitation,independentLaboratoryProven:false};
      algorithmId='phase106_direct_pair_v1';
    }else{
      const dep=node.definition.dependencies[0];
      if(dep.kind!=='derived')throw Error('invalid_explanation_dependency');
      const upstream=this.readFresh(dep.nodeId);
      if(!upstream||upstream.algorithmId!=='phase106_direct_pair_v1')return notReady('verified_pair_dependency_required');
      const pair=upstream.payload as PairResearch106;
      dependencyDigests[dep.nodeId]=upstream.resultSha256;
      const messages:Record<PairResearch106['status'],string>={
        supported_better:`The available direct original tests favor ${pair.firstVariantId} over ${pair.secondVariantId} for ${pair.criterionId} in this test context.`,
        supported_worse:`The available direct original tests favor ${pair.secondVariantId} over ${pair.firstVariantId} for ${pair.criterionId} in this test context.`,
        reported_equivalent:`Available direct original tests report similar performance for ${pair.firstVariantId} and ${pair.secondVariantId} on ${pair.criterionId} in this context.`,
        contested:'Original test reports conflict for this comparison; the disagreement has not been reconciled.',
        not_directly_comparable:'There is no reviewed direct comparison between these exact variants in this context.'
      };
      payload={type:'evidence_explanation',status:pair.status,firstVariantId:pair.firstVariantId,
        secondVariantId:pair.secondVariantId,criterionId:pair.criterionId,
        explanation:messages[pair.status],originalTestIds:[...new Set([
          ...pair.supportOriginalTestIds,...pair.opposeOriginalTestIds,...pair.tieOriginalTestIds])].sort(),
        upstreamNodeId:dep.nodeId,upstreamResultSha256:upstream.resultSha256,
        sourceReferences:pair.sourceReferences,confidencePercentage:null,consumerWinnerId:null};
      algorithmId='phase106_pair_explanation_v1';
    }
    const repinned=this.validateLeaves(nodeId);
    if(JSON.stringify(pinned)!==JSON.stringify(repinned))throw Error('upstream_snapshot_changed_during_computation');
    const end=this.journalCurrent();
    if(expected.sequence!==end.sequence||expected.sha256!==end.sha256)
      throw Error('journal_advanced_during_computation');
    this.graph.commitResearchCache({nodeId,algorithmId,journalSequence:end.sequence,payload,
      dependencyDigests,frameRevisions:pinned},this.cognition);
    // Never advertise a result unless all three stores still agree.
    const fresh=this.readFresh(nodeId);
    if(!fresh)return {status:'still_stale',nodeId,result:null,reason:'source_changed_after_commit',
      sourceTextRequired:false,llmCalls:0,publicationReady:false,rankingEligible:false};
    return {status:'ready_research',nodeId,result:fresh,reason:null,
      sourceTextRequired:false,llmCalls:0,publicationReady:false,rankingEligible:false};
  }
  recompute(nodeId:string,observedAt:string):ResearchOutcome106{
    if(Number.isNaN(Date.parse(observedAt))||!/^\d{4}-\d\d-\d\dT/.test(observedAt))throw Error('invalid_recompute_time');
    this.synchronizeLeaves(nodeId,observedAt);
    return this.runNode(nodeId);
  }
}
export const phase106EngineReferences={
  comparison:'phase106_direct_pair_v1_reviewed_research',
  explanation:'phase106_pair_explanation_v1_reviewed_research'
} as const;
