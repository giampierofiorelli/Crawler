/** Phase 104: entity-centred, explainable, REVISIONABLE evidence state.
 *
 * This is a materialized, derived knowledge projection, NOT an independent
 * repository for review content, approved claims, authenticated authority, or
 * consumer-ranking results. All source facts live in Phase101, and Phase102/103
 * remain the only inputs for interpretation. No LLM or network calls.
 *
 * Concepts: W3C PROV-O; Doyle (1979) truth maintenance; Dung (1995)
 * argumentation; AWS event sourcing; W3C SHACL (shape validation inspiration).
 * A deterministic status lifecycle is NOT equivalent to implementing their
 * full semantics. Stored SHA-256 chains are not signatures, nor proof of an
 * independent assessor's identity.
 */
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {fingerprintEvidenceFrame102,reasonOverEvidenceFrame102,type EvidenceFrameSnapshot102} from './phase102_evidence_knowledge.js';
import {evaluateCriterionConsensus103,type ConvergenceStatus103,type CriterionConsensus103} from './phase103_evidence_consensus.js';
import type {StoredClaim} from './phase101_interpretation_memory.js';

const sha=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const validId=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,100}$/.test(s);
const validTime=(s:unknown):s is string=>typeof s==='string'&&!Number.isNaN(Date.parse(s))&&/^\d{4}-\d\d-\d\dT/.test(s);
const sorted=(s:Iterable<string>)=>[...new Set(s)].sort();

export type EpistemicState104='unobserved'|'described_uncalibrated'|'observed_not_calibrated'|
 'provisionally_supported'|'convergent'|'disputed'|'uncertain'|'incomparable';
export type ReviewTask104='collect_targeted_evidence'|'review_qualitative_calibration'|
 'reconcile_original_test_claims'|'check_context_and_methods'|'inspect_uncertainty';
export interface EntityBelief104 {
  categoryId:string;variantId:string;criterionId:string;frameId:string;
  evidenceFingerprint:string;frameSnapshotSha256:string;
  state:EpistemicState104;convergence:ConvergenceStatus103;
  activeClaimIds:string[];originalTestIds:string[];
  reviewTasks:ReviewTask104[];lastObservedAt:string;
  /** Never a confidence score or product-ranking bonus. */
  probabilityCorrect:null;consumerRankingApproved:false;llmCalls:0;
}
export interface EntityTransition104 {
  sequence:number;categoryId:string;variantId:string;criterionId:string;frameId:string;
  fromState:EpistemicState104|null;toState:EpistemicState104;
  addedClaimIds:string[];removedClaimIds:string[];
  evidenceFingerprint:string;observedAt:string;
  eventType:'first_observation'|'evidence_changed';
  previousEventSha256:string;eventSha256:string;
}
export interface SynchronizationResult104 {
  state:EntityBelief104;changed:boolean;transition:EntityTransition104|null;
  sourceTextRequired:false;llmCalls:0;publicationReady:false;
}
function interpret(result:CriterionConsensus103):{state:EpistemicState104;tasks:ReviewTask104[]}{
  switch(result.status){
    case 'no_registered_evidence':return {state:'unobserved',tasks:['collect_targeted_evidence']};
    case 'uncalibrated_descriptions_only':return {state:'described_uncalibrated',tasks:['review_qualitative_calibration']};
    case 'single_original_test':
      if(result.levels.length>0)return {state:'provisionally_supported',tasks:['collect_targeted_evidence']};
      if(result.measurementGroups.length>0)return {state:'observed_not_calibrated',tasks:['check_context_and_methods']};
      if(result.descriptors.length>0)return {state:'described_uncalibrated',tasks:['review_qualitative_calibration']};
      return {state:'provisionally_supported',tasks:['collect_targeted_evidence']};
    case 'consistent_calibrated_levels':return {state:'convergent',tasks:[]};
    case 'discordant_calibrated_levels':
    case 'conflicting_claims_in_same_test':return {state:'disputed',tasks:['reconcile_original_test_claims']};
    case 'incompatible_calibration_scales':return {state:'incomparable',tasks:['check_context_and_methods']};
    case 'uncertain_calibrated_levels':return {state:'uncertain',tasks:['inspect_uncertainty']};
    case 'measurements_without_calibrated_level':return {state:'observed_not_calibrated',tasks:['check_context_and_methods']};
  }
}
function touching(claim:StoredClaim, variantId:string):boolean{
  return claim.variantId===variantId||(claim.kind==='pairwise'&&claim.comparedVariantId===variantId);
}
const parse=<T>(s:string):T=>JSON.parse(s) as T;
export class EntityCognition104 {
  private db:DatabaseSync;
  constructor(dbPath=':memory:'){
    this.db=new DatabaseSync(dbPath);
    this.db.exec(`PRAGMA busy_timeout=3000; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS entity_beliefs (
        category_id TEXT NOT NULL, variant_id TEXT NOT NULL, criterion_id TEXT NOT NULL, frame_id TEXT NOT NULL,
        evidence_fingerprint TEXT NOT NULL, frame_revision TEXT NOT NULL, payload TEXT NOT NULL,
        PRIMARY KEY(category_id,variant_id,criterion_id,frame_id));
      CREATE TABLE IF NOT EXISTS entity_transitions (
        sequence INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id TEXT NOT NULL,variant_id TEXT NOT NULL,criterion_id TEXT NOT NULL,frame_id TEXT NOT NULL,
        event_payload TEXT NOT NULL, previous_hash TEXT NOT NULL, event_hash TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS ix_entity_history ON entity_transitions(category_id,variant_id,criterion_id,frame_id,sequence);
      CREATE TRIGGER IF NOT EXISTS no_mutate_entity_transitions BEFORE UPDATE ON entity_transitions BEGIN SELECT RAISE(ABORT,'event_log_is_append_only'); END;
      CREATE TRIGGER IF NOT EXISTS no_delete_entity_transitions BEFORE DELETE ON entity_transitions BEGIN SELECT RAISE(ABORT,'event_log_is_append_only'); END;`);
  }
  close(){this.db.close();}
  /** Consume a fresh, immutable snapshot from the authoritative Phase101 store. */
  synchronize(snapshot:EvidenceFrameSnapshot102,variantId:string,observedAt:string):SynchronizationResult104{
    if(!validId(variantId)||!validTime(observedAt))throw Error('invalid_entity_sync_request');
    // Validate all snapshot data, not merely a caller-asserted SHA.
    if(!snapshot||snapshot.revisionSha256!==fingerprintEvidenceFrame102(snapshot))throw Error('unverified_snapshot');
    const reasoning=reasonOverEvidenceFrame102(snapshot);
    if(!reasoning.products.some(p=>p.variantId===variantId))throw Error('unregistered_variant');
    const applicable=snapshot.claims.filter(c=>touching(c,variantId)).sort((a,b)=>a.id.localeCompare(b.id));
    const evidenceFingerprint=sha(applicable);
    const k=[snapshot.categoryId,variantId,snapshot.criterionId,snapshot.frameId];
    this.db.exec('BEGIN IMMEDIATE');
    try{
      const old=this.db.prepare(`SELECT payload FROM entity_beliefs WHERE category_id=? AND variant_id=? AND criterion_id=? AND frame_id=?`)
        .get(...k) as {payload:string}|undefined;
      const previous=old?parse<EntityBelief104>(old.payload):null;
      if(previous&&Date.parse(observedAt)<Date.parse(previous.lastObservedAt))throw Error('out_of_order_observation');
      if(previous&&previous.evidenceFingerprint===evidenceFingerprint){
        // New frame revision may concern another product, not this entity.
        const refreshed:EntityBelief104={...previous,frameSnapshotSha256:snapshot.revisionSha256,lastObservedAt:observedAt};
        this.db.prepare(`UPDATE entity_beliefs SET frame_revision=?,payload=? WHERE category_id=? AND variant_id=? AND criterion_id=? AND frame_id=?`)
          .run(snapshot.revisionSha256,JSON.stringify(refreshed),...k);
        this.db.exec('COMMIT');
        return {state:refreshed,changed:false,transition:null,sourceTextRequired:false,llmCalls:0,publicationReady:false};
      }
      const convergence=evaluateCriterionConsensus103(snapshot,variantId);
      const interpretation=interpret(convergence);
      const claimIds=applicable.map(c=>c.id);
      const originalTestIds=sorted(applicable.map(c=>c.source.originalTestId));
      const belief:EntityBelief104={categoryId:snapshot.categoryId,variantId,criterionId:snapshot.criterionId,frameId:snapshot.frameId,
        evidenceFingerprint,frameSnapshotSha256:snapshot.revisionSha256,
        state:interpretation.state,convergence:convergence.status,activeClaimIds:claimIds,originalTestIds,
        reviewTasks:interpretation.tasks,lastObservedAt:observedAt,
        probabilityCorrect:null,consumerRankingApproved:false,llmCalls:0};
      const priorHash=(this.db.prepare('SELECT event_hash FROM entity_transitions ORDER BY sequence DESC LIMIT 1').get() as {event_hash:string}|undefined)?.event_hash??'0'.repeat(64);
      const eventWithoutSeq={categoryId:belief.categoryId,variantId,criterionId:belief.criterionId,frameId:belief.frameId,
        fromState:previous?.state??null,toState:belief.state,
        addedClaimIds:claimIds.filter(x=>!previous?.activeClaimIds.includes(x)),
        removedClaimIds:(previous?.activeClaimIds??[]).filter(x=>!claimIds.includes(x)),
        evidenceFingerprint,observedAt,
        eventType:previous?'evidence_changed' as const:'first_observation' as const};
      const eventSha256=sha([priorHash,eventWithoutSeq]);
      const info=this.db.prepare(`INSERT INTO entity_transitions(category_id,variant_id,criterion_id,frame_id,event_payload,previous_hash,event_hash)
        VALUES (?,?,?,?,?,?,?)`).run(...k,JSON.stringify(eventWithoutSeq),priorHash,eventSha256);
      const transition:EntityTransition104={sequence:Number(info.lastInsertRowid),...eventWithoutSeq,previousEventSha256:priorHash,eventSha256};
      this.db.prepare(`INSERT INTO entity_beliefs(category_id,variant_id,criterion_id,frame_id,evidence_fingerprint,frame_revision,payload)
        VALUES (?,?,?,?,?,?,?) ON CONFLICT(category_id,variant_id,criterion_id,frame_id) DO UPDATE SET
        evidence_fingerprint=excluded.evidence_fingerprint,frame_revision=excluded.frame_revision,payload=excluded.payload`)
        .run(...k,evidenceFingerprint,snapshot.revisionSha256,JSON.stringify(belief));
      this.db.exec('COMMIT');
      return {state:belief,changed:true,transition,sourceTextRequired:false,llmCalls:0,publicationReady:false};
    }catch(error){this.db.exec('ROLLBACK');throw error;}
  }
  /** Ordered source-of-truth event page for downstream incremental projections.
   * Revalidates the entire existing hash chain and the caller checkpoint before
   * returning any events. No source text, LLM call or new fact authority.
   */
  journalPage(afterSequence:number,afterHash:string,limit=200):{
    events:EntityTransition104[];headSequence:number;headSha256:string;hasMore:boolean;
  }{
    if(!Number.isSafeInteger(afterSequence)||afterSequence<0||
      !/^[a-f0-9]{64}$/.test(afterHash)||!Number.isSafeInteger(limit)||limit<1||limit>500)
      throw Error('invalid_journal_checkpoint');
    const verified=this.verifyJournal();
    const headRow=this.db.prepare('SELECT MAX(sequence) AS seq FROM entity_transitions').get() as {seq:number|null};
    const headSequence=headRow.seq??0;
    if(afterSequence>headSequence)throw Error('upstream_journal_truncated');
    const expectedHash=afterSequence===0?'0'.repeat(64):
      (this.db.prepare('SELECT event_hash AS hash FROM entity_transitions WHERE sequence=?').get(afterSequence) as
      {hash:string}|undefined)?.hash;
    if(!expectedHash||expectedHash!==afterHash)throw Error('upstream_checkpoint_mismatch');
    const rows=this.db.prepare(`SELECT sequence,event_payload,previous_hash,event_hash FROM entity_transitions
      WHERE sequence>? ORDER BY sequence LIMIT ?`).all(afterSequence,limit) as
      {sequence:number;event_payload:string;previous_hash:string;event_hash:string}[];
    const events=rows.map(r=>({sequence:r.sequence,
      ...parse<Omit<EntityTransition104,'sequence'|'previousEventSha256'|'eventSha256'>>(r.event_payload),
      previousEventSha256:r.previous_hash,eventSha256:r.event_hash}));
    return {events,headSequence,headSha256:verified.headSha256,
      hasMore:events.length>0&&events[events.length-1].sequence<headSequence};
  }
  /** Materialized view for a product, across criteria and use contexts. */
  productMind(categoryId:string,variantId:string):{variantId:string;cells:EntityBelief104[];pendingTasks:{criterionId:string;frameId:string;task:ReviewTask104}[];llmCalls:0}{
    if(!validId(categoryId)||!validId(variantId))throw Error('invalid_entity_query');
    const cells=(this.db.prepare(`SELECT payload FROM entity_beliefs WHERE category_id=? AND variant_id=? ORDER BY criterion_id,frame_id`)
      .all(categoryId,variantId) as {payload:string}[]).map(r=>parse<EntityBelief104>(r.payload));
    const pendingTasks=cells.flatMap(c=>c.reviewTasks.map(task=>({criterionId:c.criterionId,frameId:c.frameId,task})));
    return {variantId,cells,pendingTasks,llmCalls:0};
  }
  history(categoryId:string,variantId:string):EntityTransition104[]{
    if(!validId(categoryId)||!validId(variantId))throw Error('invalid_entity_query');
    const rows=this.db.prepare(`SELECT sequence,event_payload,previous_hash,event_hash FROM entity_transitions
      WHERE category_id=? AND variant_id=? ORDER BY sequence`).all(categoryId,variantId) as
      {sequence:number;event_payload:string;previous_hash:string;event_hash:string}[];
    return rows.map(r=>({sequence:r.sequence,...parse<Omit<EntityTransition104,'sequence'|'previousEventSha256'|'eventSha256'>>(r.event_payload),
      previousEventSha256:r.previous_hash,eventSha256:r.event_hash}));
  }
  /** Check global causal chain. Not proof against an attacker with file write access. */
  verifyJournal():{valid:true;events:number;headSha256:string}{
    const rows=this.db.prepare('SELECT sequence,event_payload,previous_hash,event_hash FROM entity_transitions ORDER BY sequence').all() as
      {sequence:number;event_payload:string;previous_hash:string;event_hash:string}[];
    let prior='0'.repeat(64);
    for(const r of rows){
      if(r.previous_hash!==prior||sha([prior,parse<unknown>(r.event_payload)])!==r.event_hash)
        throw Error('entity_transition_chain_mismatch');
      prior=r.event_hash;
    }
    return {valid:true,events:rows.length,headSha256:prior};
  }
}
