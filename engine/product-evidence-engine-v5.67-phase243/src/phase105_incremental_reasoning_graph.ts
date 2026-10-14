/**
 * Phase 105 — incremental dependency propagation for evidence-derived knowledge.
 *
 * Phase101 remains authority for interpreted observations; Phase104 owns the
 * authoritative reasoning-event journal. This module ONLY stores declarations
 * of derived computations, invalidation work, and research-only projection
 * bookkeeping. It never creates facts, rewrites expert conclusions, chooses
 * a consumer winner, or calls a model/network.
 *
 * ATMS/Doyle-style dependency inspiration, W3C PROV derivation/invalidation,
 * and database incremental view maintenance. This is NOT a complete ATMS,
 * differential dataflow engine, authenticated audit log or production queue.
 */
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {EntityCognition104} from './phase104_entity_cognition.js';

const ident=(x:unknown):x is string=>typeof x==='string'&&/^[a-z][a-z0-9_]{0,100}$/.test(x);
const hash=(x:unknown):x is string=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const sha=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const parse=<T>(x:string):T=>JSON.parse(x) as T;
const ROOT='0'.repeat(64);
export interface ResearchCache106 {nodeId:string;algorithmId:string;journalSequence:number;resultSha256:string;
  payload:unknown;dependencyDigests:Record<string,string>;frameRevisions:Record<string,string>;
  publicationReady:false;rankingEligible:false;}


export type Dependency105={kind:'belief';categoryId:string;variantId:string;criterionId:string;frameId:string}|
  {kind:'derived';nodeId:string};
export type ProjectionKind105='comparison'|'personalized_tradeoff'|'explanation';
export interface ProjectionDefinition105 {
  nodeId:string;categoryId:string;useContextId:string;kind:ProjectionKind105;
  dependencies:Dependency105[];engineReference:string;
}
export type ProjectionState105='needs_recomputation'|'computed_unverified';
export interface ProjectionView105 {
  definition:ProjectionDefinition105;state:ProjectionState105;
  firstDirtySequence:number|null;lastDirtySequence:number|null;
  triggeringEvidenceKeys:string[];resultSha256:string|null;
  computedAtJournalSequence:number|null;
  /** This cannot be used as a consumer decision or evidence confidence score. */
  publicationReady:false;rankingEligible:false;llmCalls:0;
}
export interface GraphCheckpoint105 {sequence:number;sha256:string;}
export interface ReplayResult105 {read:number;affectedNodeIds:string[];checkpoint:GraphCheckpoint105;
  moreAvailable:boolean;sourceTextRequired:false;llmCalls:0;publicationReady:false;}

const beliefKey=(d:{categoryId:string;variantId:string;criterionId:string;frameId:string})=>
  `belief:${d.categoryId}:${d.variantId}:${d.criterionId}:${d.frameId}`;
const derivedKey=(nodeId:string)=>`derived:${nodeId}`;
function validDefinition(d:ProjectionDefinition105):boolean{
  return !!d&&ident(d.nodeId)&&ident(d.categoryId)&&ident(d.useContextId)&&
    ['comparison','personalized_tradeoff','explanation'].includes(d.kind)&&
    typeof d.engineReference==='string'&&d.engineReference.trim().length>=12&&d.engineReference.length<=500&&
    Array.isArray(d.dependencies)&&d.dependencies.length>=1&&d.dependencies.length<=64&&
    d.dependencies.every(x=>x.kind==='belief'?
      [x.categoryId,x.variantId,x.criterionId,x.frameId].every(ident)&&x.categoryId===d.categoryId:
      x.kind==='derived'&&ident(x.nodeId)&&x.nodeId!==d.nodeId);
}
export class IncrementalReasoningGraph105 {
  private readonly db:DatabaseSync;
  constructor(dbPath=':memory:'){
    this.db=new DatabaseSync(dbPath);
    this.db.exec(`PRAGMA busy_timeout=3000; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS graph_checkpoint (id INTEGER PRIMARY KEY CHECK(id=1),seq INTEGER NOT NULL,hash TEXT NOT NULL);
      INSERT OR IGNORE INTO graph_checkpoint VALUES (1,0,'${ROOT}');
      CREATE TABLE IF NOT EXISTS projection_nodes (
        id TEXT PRIMARY KEY,category_id TEXT NOT NULL,definition TEXT NOT NULL,
        state TEXT NOT NULL CHECK(state IN ('needs_recomputation','computed_unverified')),
        first_dirty_seq INTEGER,last_dirty_seq INTEGER,trigger_keys TEXT NOT NULL DEFAULT '[]',
        result_hash TEXT, computed_seq INTEGER);
      CREATE TABLE IF NOT EXISTS projection_edges (
        source_key TEXT NOT NULL,node_id TEXT NOT NULL,
        PRIMARY KEY(source_key,node_id),FOREIGN KEY(node_id) REFERENCES projection_nodes(id));
      CREATE INDEX IF NOT EXISTS projection_reverse_dependencies ON projection_edges(source_key);
      CREATE TABLE IF NOT EXISTS projection_research_cache (
        node_id TEXT PRIMARY KEY, algorithm_id TEXT NOT NULL, journal_seq INTEGER NOT NULL,
        result_sha TEXT NOT NULL, payload TEXT NOT NULL,
        dependency_digests TEXT NOT NULL, frame_revisions TEXT NOT NULL,
        FOREIGN KEY(node_id) REFERENCES projection_nodes(id));
      CREATE TABLE IF NOT EXISTS projection_change_log (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,node_id TEXT NOT NULL,
        source_seq INTEGER NOT NULL,source_hash TEXT NOT NULL,trigger_key TEXT NOT NULL);
      CREATE TRIGGER IF NOT EXISTS no_update_projection_log BEFORE UPDATE ON projection_change_log BEGIN
        SELECT RAISE(ABORT,'append_only_projection_log');END;
      CREATE TRIGGER IF NOT EXISTS no_delete_projection_log BEFORE DELETE ON projection_change_log BEGIN
        SELECT RAISE(ABORT,'append_only_projection_log');END;
    `);
  }
  close(){this.db.close();}
  checkpoint():GraphCheckpoint105{
    const r=this.db.prepare('SELECT seq,hash FROM graph_checkpoint WHERE id=1').get() as {seq:number;hash:string};
    return {sequence:r.seq,sha256:r.hash};
  }
  register(def:ProjectionDefinition105):ProjectionView105{
    if(!validDefinition(def))throw Error('invalid_derived_node');
    const sources=def.dependencies.map(dep=>dep.kind==='belief'?beliefKey(dep):derivedKey(dep.nodeId));
    if(new Set(sources).size!==sources.length)throw Error('duplicate_dependency');
    this.db.exec('BEGIN IMMEDIATE');
    try{
      const exists=this.db.prepare('SELECT definition FROM projection_nodes WHERE id=?').get(def.nodeId) as {definition:string}|undefined;
      if(exists){
        if(sha(parse<unknown>(exists.definition))!==sha(def))throw Error('immutable_projection_definition');
        this.db.exec('COMMIT');return this.get(def.nodeId)!;
      }
      for(const dep of def.dependencies){
        if(dep.kind==='derived'){
          const input=this.db.prepare('SELECT category_id FROM projection_nodes WHERE id=?').get(dep.nodeId) as {category_id:string}|undefined;
          if(!input)throw Error('unknown_derived_dependency');
          if(input.category_id!==def.categoryId)throw Error('cross_category_derived_dependency');
        }
      }
      this.db.prepare(`INSERT INTO projection_nodes(id,category_id,definition,state,trigger_keys)
        VALUES (?,?,?,'needs_recomputation','[]')`).run(def.nodeId,def.categoryId,JSON.stringify(def));
      const insert=this.db.prepare('INSERT INTO projection_edges(source_key,node_id) VALUES (?,?)');
      for(const key of sources)insert.run(key,def.nodeId);
      this.db.exec('COMMIT');return this.get(def.nodeId)!;
    }catch(e){this.db.exec('ROLLBACK');throw e;}
  }
  get(nodeId:string):ProjectionView105|null{
    if(!ident(nodeId))throw Error('invalid_node_id');
    const r=this.db.prepare('SELECT * FROM projection_nodes WHERE id=?').get(nodeId) as {
      definition:string;state:ProjectionState105;first_dirty_seq:number|null;
      last_dirty_seq:number|null;trigger_keys:string;result_hash:string|null;computed_seq:number|null;
    }|undefined;
    if(!r)return null;
    return {definition:parse<ProjectionDefinition105>(r.definition),state:r.state,
      firstDirtySequence:r.first_dirty_seq,lastDirtySequence:r.last_dirty_seq,
      triggeringEvidenceKeys:parse<string[]>(r.trigger_keys),resultSha256:r.result_hash,
      computedAtJournalSequence:r.computed_seq,publicationReady:false,rankingEligible:false,llmCalls:0};
  }
  pending():ProjectionView105[]{
    return (this.db.prepare("SELECT id FROM projection_nodes WHERE state='needs_recomputation' ORDER BY id")
      .all() as {id:string}[]).map(r=>this.get(r.id)!);
  }
  /** Consume the globally ordered Phase104 journal with replay-safe checkpointing.
   * A crash rolls back graph changes AND the checkpoint. */
  replay(cognition:EntityCognition104,limit=200):ReplayResult105{
    const start=this.checkpoint();
    const page=cognition.journalPage(start.sequence,start.sha256,limit);
    const affected=new Set<string>();
    if(page.events.length){
      this.db.exec('BEGIN IMMEDIATE');
      try{
        let current=start.sequence,prior=start.sha256;
        const dependents=this.db.prepare('SELECT node_id FROM projection_edges WHERE source_key=? ORDER BY node_id');
        const evict=this.db.prepare('DELETE FROM projection_research_cache WHERE node_id=?');
        const change=this.db.prepare('INSERT INTO projection_change_log(node_id,source_seq,source_hash,trigger_key) VALUES (?,?,?,?)');
        const update=this.db.prepare(`UPDATE projection_nodes SET state='needs_recomputation',
          first_dirty_seq=COALESCE(first_dirty_seq,?),last_dirty_seq=?,trigger_keys=?,
          result_hash=NULL,computed_seq=NULL WHERE id=?`);
        for(const event of page.events){
          if(event.sequence!==current+1||event.previousEventSha256!==prior||!hash(event.eventSha256))
            throw Error('noncontiguous_or_untrusted_reasoning_journal');
          const sourceKey=beliefKey(event);
          const queue=[sourceKey],visited=new Set<string>();
          for(let i=0;i<queue.length;i++){
            const currentKey=queue[i];
            for(const {node_id:nodeId} of dependents.all(currentKey) as {node_id:string}[]){
              if(visited.has(nodeId))continue;
              visited.add(nodeId);affected.add(nodeId);
              const record=this.get(nodeId)!;
              const triggers=[...new Set([...record.triggeringEvidenceKeys,sourceKey])].sort();
              // Bound retained explanatory triggers, but not the append-only ledger.
              const bounded=triggers.slice(-128);
              update.run(event.sequence,event.sequence,JSON.stringify(bounded),nodeId);
              evict.run(nodeId);
              change.run(nodeId,event.sequence,event.eventSha256,sourceKey);
              queue.push(derivedKey(nodeId));
            }
          }
          current=event.sequence;prior=event.eventSha256;
        }
        this.db.prepare('UPDATE graph_checkpoint SET seq=?,hash=? WHERE id=1').run(current,prior);
        this.db.exec('COMMIT');
      }catch(e){this.db.exec('ROLLBACK');throw e;}
    }
    return {read:page.events.length,affectedNodeIds:[...affected].sort(),checkpoint:this.checkpoint(),
      moreAvailable:page.hasMore,sourceTextRequired:false,llmCalls:0,publicationReady:false};
  }
  /** Record an externally computed cache only after all source events were consumed.
   * This is a cache record, NOT proof that the computation is methodologically
   * correct or permission to serve a ranking. */
  acknowledgeComputed(nodeId:string,cognition:EntityCognition104,resultSha256:string,
    expectedSequence:number):ProjectionView105{
    if(!hash(resultSha256)||!Number.isSafeInteger(expectedSequence)||expectedSequence<0)
      throw Error('invalid_computation_receipt');
    const checkpoint=this.checkpoint();
    if(checkpoint.sequence!==expectedSequence)throw Error('stale_projection_checkpoint');
    const page=cognition.journalPage(checkpoint.sequence,checkpoint.sha256,1);
    if(page.headSequence!==checkpoint.sequence)throw Error('unreplayed_upstream_changes');
    this.db.exec('BEGIN IMMEDIATE');
    try{
      const current=this.get(nodeId);
      if(!current)throw Error('unknown_projection');
      if(current.state!=='needs_recomputation')throw Error('projection_not_dirty');
      for(const dep of current.definition.dependencies){
        if(dep.kind==='derived'&&this.get(dep.nodeId)?.state!=='computed_unverified')
          throw Error('dependency_not_recomputed');
      }
      this.db.prepare(`UPDATE projection_nodes SET state='computed_unverified',
        result_hash=?,computed_seq=?,first_dirty_seq=NULL,last_dirty_seq=NULL,trigger_keys='[]' WHERE id=?`)
        .run(resultSha256,expectedSequence,nodeId);
      this.db.exec('COMMIT');return this.get(nodeId)!;
    }catch(e){this.db.exec('ROLLBACK');throw e;}
  }
  invalidationHistory(nodeId:string):{sequence:number;sourceEventSha256:string;dependency:string}[]{
    if(!ident(nodeId))throw Error('invalid_node_id');
    return (this.db.prepare(`SELECT source_seq,source_hash,trigger_key FROM projection_change_log
      WHERE node_id=? ORDER BY log_id`).all(nodeId) as
      {source_seq:number;source_hash:string;trigger_key:string}[])
      .map(x=>({sequence:x.source_seq,sourceEventSha256:x.source_hash,dependency:x.trigger_key}));
  }
  /** Phase106 research-only atomic cache write. This is not a proof of assessment,
   * authority, or publishability; only the fixed evaluator may supply this payload.
   * The method checks graph transaction invariants. Cross-store revalidation lives
   * in Phase106 readFresh(), which must be used for every consumer read. */
  commitResearchCache(input:{nodeId:string;algorithmId:string;journalSequence:number;
    payload:unknown;dependencyDigests:Record<string,string>;frameRevisions:Record<string,string>},
    cognition:EntityCognition104):ResearchCache106{
    if(!ident(input.nodeId)||!['phase106_direct_pair_v1','phase106_pair_explanation_v1','phase107_reviewed_tradeoff_v1'].includes(input.algorithmId)||
       !Number.isSafeInteger(input.journalSequence)||input.journalSequence<0||
       !input.payload||typeof input.payload!=='object'||Array.isArray(input.payload))
      throw Error('invalid_research_cache_input');
    const payloadText=JSON.stringify(input.payload);
    if(payloadText.length>16384)throw Error('oversized_research_projection');
    const entries=(o:Record<string,string>)=>Object.entries(o);
    if(!input.frameRevisions||!input.dependencyDigests||
      entries(input.frameRevisions).some(([k,v])=>k.length>250||!hash(v))||
      entries(input.dependencyDigests).some(([k,v])=>!ident(k)||!hash(v)))
      throw Error('invalid_research_dependency_receipt');
    const head=this.checkpoint();
    const page=cognition.journalPage(head.sequence,head.sha256,1);
    if(head.sequence!==input.journalSequence||page.headSequence!==head.sequence)
      throw Error('upstream_changed_during_research');
    this.db.exec('BEGIN IMMEDIATE');
    try{
      const inside=this.checkpoint();
      if(inside.sequence!==input.journalSequence||
         cognition.journalPage(inside.sequence,inside.sha256,1).headSequence!==inside.sequence)
        throw Error('graph_advanced_during_research_commit');
      const node=this.get(input.nodeId);
      if(!node||node.state!=='needs_recomputation')throw Error('research_node_not_dirty');
      if((node.definition.kind==='comparison'&&input.algorithmId!=='phase106_direct_pair_v1')||
         (node.definition.kind==='explanation'&&input.algorithmId!=='phase106_pair_explanation_v1')||
         (node.definition.kind==='personalized_tradeoff'&&
          (input.algorithmId!=='phase107_reviewed_tradeoff_v1'||
           !node.definition.engineReference.startsWith('phase107_reviewed_tradeoff_v1:'))))throw Error('unapproved_research_evaluator');
      const expectedDerived=node.definition.dependencies.filter(d=>d.kind==='derived').map(d=>d.nodeId);
      if(expectedDerived.length!==entries(input.dependencyDigests).length||
        expectedDerived.some(id=>!Object.hasOwn(input.dependencyDigests,id)))
        throw Error('missing_derived_input_receipt');
      for(const dep of expectedDerived){
        const upstream=this.get(dep)!;
        const stored=this.db.prepare('SELECT result_sha FROM projection_research_cache WHERE node_id=?')
          .get(dep) as {result_sha:string}|undefined;
        if(upstream.state!=='computed_unverified'||!stored||
           upstream.resultSha256!==stored.result_sha||stored.result_sha!==input.dependencyDigests[dep])
          throw Error('derived_receipt_stale');
      }
      const digest=sha([input.algorithmId,input.journalSequence,input.payload,
        input.dependencyDigests,input.frameRevisions]);
      this.db.prepare(`INSERT INTO projection_research_cache
        (node_id,algorithm_id,journal_seq,result_sha,payload,dependency_digests,frame_revisions)
        VALUES (?,?,?,?,?,?,?) ON CONFLICT(node_id) DO UPDATE SET
        algorithm_id=excluded.algorithm_id,journal_seq=excluded.journal_seq,
        result_sha=excluded.result_sha,payload=excluded.payload,
        dependency_digests=excluded.dependency_digests,frame_revisions=excluded.frame_revisions`)
        .run(input.nodeId,input.algorithmId,input.journalSequence,digest,payloadText,
          JSON.stringify(input.dependencyDigests),JSON.stringify(input.frameRevisions));
      this.db.prepare(`UPDATE projection_nodes SET state='computed_unverified',result_hash=?,
        computed_seq=?,first_dirty_seq=NULL,last_dirty_seq=NULL,trigger_keys='[]' WHERE id=?`)
        .run(digest,input.journalSequence,input.nodeId);
      this.db.exec('COMMIT');
      return this.researchCache(input.nodeId)!;
    }catch(e){this.db.exec('ROLLBACK');throw e;}
  }
  /** Raw internal cache; never use as a fresh or approved result without Phase106. */
  researchCache(nodeId:string):ResearchCache106|null{
    if(!ident(nodeId))throw Error('invalid_node_id');
    const r=this.db.prepare(`SELECT algorithm_id,journal_seq,result_sha,payload,
      dependency_digests,frame_revisions FROM projection_research_cache WHERE node_id=?`).get(nodeId) as
      {algorithm_id:string;journal_seq:number;result_sha:string;payload:string;
        dependency_digests:string;frame_revisions:string}|undefined;
    if(!r)return null;
    const payload=parse<unknown>(r.payload),dependencyDigests=parse<Record<string,string>>(r.dependency_digests),
      frameRevisions=parse<Record<string,string>>(r.frame_revisions);
    if(sha([r.algorithm_id,r.journal_seq,payload,dependencyDigests,frameRevisions])!==r.result_sha||
       this.get(nodeId)?.resultSha256!==r.result_sha)
      throw Error('research_cache_integrity_failure');
    return {nodeId,algorithmId:r.algorithm_id,journalSequence:r.journal_seq,
      resultSha256:r.result_sha,payload,dependencyDigests,frameRevisions,
      publicationReady:false,rankingEligible:false};
  }

}
