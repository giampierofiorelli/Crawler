/**
 * Phase108 — Query-neutral shared evidence vs request-scoped decisions.
 *
 * Design requirements:
 * - A user's question NEVER supplies product facts, performance level, expert
 *   interpretation, source reliability or weights to the canonical memory.
 * - Query-discovered omissions are research TASKS, not product facts.
 * - Expert-accepted criteria are added for a whole category, independently of
 *   the initial product/query that prompted the review.
 * - Knowledge projection uses only the immutable Phase101 interpreted facts;
 *   Phase107 personal tradeoffs are a separate derived, non-authoritative view.
 * - No automatic inference from bacterial reduction to viral inactivation.
 *
 * CQRS, W3C PROV, and feedback-loop/selection-bias literature inform the
 * boundaries. This single-process research adapter is not an authenticated
 * production approval or a multi-database atomic transaction.
 */
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {InterpretationMemory101,type StoredClaim,type Product} from './phase101_interpretation_memory.js';
import {PersonalizedRecomputation107,type ReviewedTradeoffContext107,
  type PersonalizedOutcome107} from './phase107_personalized_recomputation.js';

const ident=(v:unknown):v is string=>typeof v==='string'&&/^[a-z][a-z0-9_]{0,100}$/.test(v);
const reference=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>=12&&v.length<=600;
const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const clone=<T>(v:T):T=>structuredClone(v);

/** Read-only view. Callers cannot write expert claims through this interface. */
export type CanonicalEvidenceReader108=Pick<InterpretationMemory101,'snapshotReviewedFrame'|'getCalibratedPerformance'>;
export interface ReviewedCategoryCriterion108 {
  categoryId:string;criterionId:string;frameId:string;
  /** A source-independent, category-wide decision, not a query-tailored field. */
  scope:'whole_category';
  semanticsReference:string;methodologyReference:string;
  expertReviewReference:string;reviewerId:string;
  /** Task provenance is intentionally absent; no user/request ID is accepted. */
}
export interface Gap108 {
  gapId:string;categoryId:string;criterionId:string;frameId:string;
  /** Opaque research-job ID (NOT a user ID or raw search query). */
  triggerReference:string;
  reason:'evidence_not_recorded'|'new_criterion_proposed'|'insufficient_test_coverage';
}
export interface Coverage108 {
  categoryId:string;criterionId:string;frameId:string;
  protocol:'unreviewed_category_criterion'|'independently_reviewed_category_criterion';
  variants:{variantId:string;displayName:string;status:'evidence_recorded'|'not_yet_assessed';
    activeClaimIds:string[]}[];
  sourceTextRequired:false;llmCalls:0;
}

/** The research queue is deliberately a different DB and type from Phase101. */
export class ResearchDiscoveryQueue108 {
  private readonly db:DatabaseSync;
  constructor(path=':memory:'){
    this.db=new DatabaseSync(path);
    this.db.exec(`PRAGMA foreign_keys=ON; PRAGMA busy_timeout=3000;
      CREATE TABLE IF NOT EXISTS research_gaps (
        id TEXT PRIMARY KEY, payload TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS adopted_category_criteria (
        category_id TEXT NOT NULL,criterion_id TEXT NOT NULL,frame_id TEXT NOT NULL,
        payload TEXT NOT NULL,PRIMARY KEY(category_id,criterion_id,frame_id));`);
  }
  close(){this.db.close();}
  flag(gap:Gap108):void{
    if(!gap||![gap.gapId,gap.categoryId,gap.criterionId,gap.frameId].every(ident)||
      !(typeof gap.triggerReference==='string'&&/^researchjob_[a-z0-9_]{8,80}$/.test(gap.triggerReference))||
      !['evidence_not_recorded','new_criterion_proposed','insufficient_test_coverage'].includes(gap.reason)||
      Object.keys(gap).sort().join(',')!==['gapId','categoryId','criterionId','frameId','triggerReference','reason'].sort().join(','))
      throw Error('invalid_research_only_gap');
    const prior=this.db.prepare('SELECT payload FROM research_gaps WHERE id=?').get(gap.gapId) as {payload:string}|undefined;
    if(prior&&hash(JSON.parse(prior.payload))!==hash(gap))throw Error('research_gap_id_conflict');
    this.db.prepare('INSERT OR IGNORE INTO research_gaps(id,payload) VALUES (?,?)').run(gap.gapId,JSON.stringify(gap));
  }
  gaps():Gap108[]{return (this.db.prepare('SELECT payload FROM research_gaps ORDER BY id').all() as {payload:string}[])
    .map(x=>JSON.parse(x.payload) as Gap108);}
  adoptCriterion(c:ReviewedCategoryCriterion108):void{
    if(!c||![c.categoryId,c.criterionId,c.frameId,c.reviewerId].every(ident)||
      c.scope!=='whole_category'||
      ![c.semanticsReference,c.methodologyReference,c.expertReviewReference].every(reference)||
      Object.keys(c).sort().join(',')!==['categoryId','criterionId','frameId','scope',
        'semanticsReference','methodologyReference','expertReviewReference','reviewerId'].sort().join(','))
      throw Error('not_independently_reviewed_category_criterion');
    const old=this.getCriterion(c.categoryId,c.criterionId,c.frameId);
    if(old&&hash(old)!==hash(c))throw Error('criterion_revision_requires_explicit_requalification');
    this.db.prepare(`INSERT OR IGNORE INTO adopted_category_criteria
      (category_id,criterion_id,frame_id,payload) VALUES (?,?,?,?)`).run(
        c.categoryId,c.criterionId,c.frameId,JSON.stringify(c));
  }
  getCriterion(cat:string,criterion:string,frame:string):ReviewedCategoryCriterion108|null{
    if(![cat,criterion,frame].every(ident))throw Error('invalid_criterion_key');
    const x=this.db.prepare(`SELECT payload FROM adopted_category_criteria
      WHERE category_id=? AND criterion_id=? AND frame_id=?`).get(cat,criterion,frame) as {payload:string}|undefined;
    return x?JSON.parse(x.payload) as ReviewedCategoryCriterion108:null;
  }
}

/** Stateless read projection: context may SELECT evidence but never MODIFY it. */
export class QueryNeutralEvidence108 {
  constructor(private readonly canonical:CanonicalEvidenceReader108,
    private readonly discovery:ResearchDiscoveryQueue108){}
  /** The canonical fingerprint is completely independent of user context. */
  evidenceIdentity(fields:{categoryId:string;criterionId:string;frameId:string}):string{
    return this.canonical.snapshotReviewedFrame(fields).revisionSha256;
  }
  coverage(fields:{categoryId:string;criterionId:string;frameId:string}):Coverage108{
    const snapshot=this.canonical.snapshotReviewedFrame(fields);
    const adopted=this.discovery.getCriterion(fields.categoryId,fields.criterionId,fields.frameId);
    const grouped=new Map<string,string[]>();
    for(const c of snapshot.claims){
      // A pairwise test observes both exact variants in the same reviewed
      // comparison frame. Counting only the subject would incorrectly label
      // the compared product as unassessed, biasing future research priorities.
      const observedVariants=c.kind==='pairwise'?[c.variantId,c.comparedVariantId]:[c.variantId];
      for(const variantId of observedVariants){
        if(!grouped.has(variantId))grouped.set(variantId,[]);
        grouped.get(variantId)!.push(c.id);
      }
    }
    return {categoryId:fields.categoryId,criterionId:fields.criterionId,frameId:fields.frameId,
      protocol:adopted?'independently_reviewed_category_criterion':'unreviewed_category_criterion',
      variants:snapshot.products.map((p:Product)=>({variantId:p.variantId,displayName:p.displayName,
        status:grouped.has(p.variantId)?'evidence_recorded':'not_yet_assessed',
        activeClaimIds:(grouped.get(p.variantId)??[]).sort()})),sourceTextRequired:false,llmCalls:0};
  }
  /** Retains the fact that there is no evidence; does NOT record a negative claim. */
  researchGap(gap:Gap108):void{this.discovery.flag(gap);}
  /** Reuses evidence and reviewer calibration without ever reading review text. */
  expertClaims(fields:{categoryId:string;criterionId:string;frameId:string}):StoredClaim[]{
    return clone(this.canonical.snapshotReviewedFrame(fields).claims);
  }
  /** Prefer a reviewed frame and indicate unresolved competing calibrated levels. */
  valueLevels(input:{categoryId:string;criterionId:string;frameId:string;scaleReference:string}){
    return clone(this.canonical.getCalibratedPerformance(input));
  }
}

/** Only a request-specific projection; deliberately NO claim/criterion write API. */
export class PersonalizedEvidenceQuery108 {
  constructor(private readonly canonical:CanonicalEvidenceReader108,
    private readonly personalized:PersonalizedRecomputation107){}
  evaluate(request:ReviewedTradeoffContext107,observedAt:string):{
    type:'request_scoped_projection';contextDigest:string;canonicalFrameDigests:Record<string,string>;
    result:PersonalizedOutcome107;canonicalUnchanged:true;sharedProductScoreWritten:false;
  }{
    const fingerprints=()=>{
      const revisions:Record<string,string>={};
      for(const frame of request.criterionFrames){
        const k=[request.categoryId,frame.criterionId,frame.frameId].join(':');
        revisions[k]=this.canonical.snapshotReviewedFrame({categoryId:request.categoryId,
          criterionId:frame.criterionId,frameId:frame.frameId}).revisionSha256;
      }
      return Object.fromEntries(Object.entries(revisions).sort(([a],[b])=>a.localeCompare(b)));
    };
    const before=fingerprints();
    this.personalized.register(request);
    const result=this.personalized.recompute(request,observedAt);
    const after=fingerprints();
    if(JSON.stringify(before)!==JSON.stringify(after))throw Error('canonical_changed_during_user_query');
    return {type:'request_scoped_projection',contextDigest:hash(request),canonicalFrameDigests:before,
      result,canonicalUnchanged:true,sharedProductScoreWritten:false};
  }
}

/** Explicitly separated intake. A user question can initiate acquisition, but
 * cannot adjudicate what the reviewed source actually shows. The context and
 * method must have been adopted category-wide before this write is attempted.
 * Approver receipts are structural only: cryptographic identity validation and
 * independent human source audits remain necessary before production.
 */
export interface SourceIndependentAdmission108 {
  claim:StoredClaim;
  reviewerId:string;
  independentSourceAuditReference:string;
  /** Explicit full-review aspect audit; a query-specific excerpt is insufficient. */
  fullSourceAspectAuditReference:string;
  fullSourceAspectReviewCompleted:true;
  interpretationScope:'source_observation_independent_of_user_request';
  categoryProtocolScope:'all_eligible_category_variants';
  evaluatorVerifiedContext:true;
}
export class SourceIndependentIntake108 {
  constructor(private readonly canonicalWriter:Pick<InterpretationMemory101,'recordApprovedClaim'>,
    private readonly discovery:ResearchDiscoveryQueue108){}
  admit(admission:SourceIndependentAdmission108):void{
    if(!admission||Object.keys(admission).sort().join(',')!==
      ['claim','reviewerId','independentSourceAuditReference','fullSourceAspectAuditReference',
        'fullSourceAspectReviewCompleted','interpretationScope','categoryProtocolScope','evaluatorVerifiedContext'].sort().join(',')||
      !ident(admission.reviewerId)||!reference(admission.independentSourceAuditReference)||
      !reference(admission.fullSourceAspectAuditReference)||
      admission.fullSourceAspectReviewCompleted!==true||
      admission.interpretationScope!=='source_observation_independent_of_user_request'||
      admission.categoryProtocolScope!=='all_eligible_category_variants'||
      admission.evaluatorVerifiedContext!==true||
      !admission.claim||!admission.claim.source||admission.claim.source.assessorId!==admission.reviewerId)
      throw Error('user_query_cannot_author_canonical_interpretation');
    const p=this.discovery.getCriterion(admission.claim.categoryId,
      admission.claim.criterionId,admission.claim.frameId);
    if(!p||p.reviewerId!==admission.reviewerId)
      throw Error('category_criterion_must_be_independently_adopted');
    this.canonicalWriter.recordApprovedClaim(admission.claim);
  }
}
