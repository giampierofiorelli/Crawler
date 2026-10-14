/**
 * Phase 101: durable, reusable *derived* expert-test evidence. No review body,
 * quotation, article text, publisher star average, user review, LLM call or
 * fabricated decibels is stored. Different metrics/protocols cannot be pooled.
 *
 * Methodological references: W3C PROV; Bradley–Terry/Thurstone require actual
 * pairwise comparison data (not an inferred word-to-number map); anchoring
 * vignettes illustrate reviewer threshold incomparability; IEC 60704/ISO 532
 * distinguish noise-emission measurement from perceived loudness.
 *
 * Node 22 built-in SQLite is experimental; this is a single-process research
 * adapter, NOT hardened multiworker database persistence or public ranking.
 */
import {DatabaseSync} from 'node:sqlite';
import {fingerprintEvidenceFrame102} from './phase102_evidence_knowledge.js';
import type {IndependentPerformanceAssessment} from './phase98_tradeoff_value_model.js';

const key=(v:unknown):v is string=>typeof v==='string'&&/^[a-z][a-z0-9_]{0,100}$/.test(v);
const digest=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{64}$/i.test(v);
const receipt=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>=12&&v.length<=400;
const url=(v:unknown):v is string=>typeof v==='string'&&/^https:\/\/[^\s/@?#]+(?:\/[^\s]*)?$/.test(v)&&v.length<1500;
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);

export type ClaimKind='descriptor'|'pairwise'|'measurement'|'calibrated_level';
export type Descriptor='very_quiet'|'relatively_quiet'|'ordinary_noise'|'somewhat_noisy'|'very_noisy'|'tonal_whine'|'vibration'|'unknown';
export type Relation='better'|'worse'|'roughly_equal'; // direction on criterion (lower noise = better)
export interface SourcePointer {
  sourceUrl:string;originalTestId:string;sourceRevisionSha256:string;
  sourceSpanSha256:string;sourceLocator:string;methodologyReference:string;
  assessmentReference:string;assessorId:string;assessedAt:string;
  originalTestLineageReviewed:true;exactVariantReviewed:true;contextReviewed:true;
}
export interface Product {
  categoryId:string;variantId:string;displayName:string;
}
export interface StoredClaimBase {
  id:string;categoryId:string;variantId:string;criterionId:string;
  /** Same operational context AND calibrated comparison frame; never generic source reputation. */
  frameId:string;source:SourcePointer;
}
export interface DescriptorClaim extends StoredClaimBase {
  kind:'descriptor';descriptor:Descriptor;
  /** No numerical strength assigned to a word without external calibration. */
  qualifier:'reviewer_relative'|'absolute_claim_without_calibration';
}
export interface PairwiseClaim extends StoredClaimBase {
  kind:'pairwise';comparedVariantId:string;relation:Relation;
  /** Direct observation, or a separately reviewed cross-source calibration. */
  comparisonBasis:'same_original_test'|'independently_calibrated_bridge';
  calibrationReference?:string;
}
export interface MeasurementClaim extends StoredClaimBase {
  kind:'measurement';value:number;unit:'db_a_sound_power'|'db_a_sound_pressure'|'sone'|'other';
  metricId:string;protocolId:string;
  /** Given by the publisher/test metadata, not invented as zero. */
  uncertainty?:number;
}
/** Linked to a separately reviewed Phase98 criterion-value scale; the lexical
 * descriptor itself does NOT determine these ordinal/cardinal levels. */
export interface CalibratedLevelClaim extends StoredClaimBase {
  kind:'calibrated_level';levelId:string;plausibleLevelIds?:readonly [string,string];
  scaleReference:string;
}
export type StoredClaim=DescriptorClaim|PairwiseClaim|MeasurementClaim|CalibratedLevelClaim;
export type EvidenceStatus='supported_preference'|'qualitatively_described'|'not_comparable';
export interface FrameRankResult {
  purpose:'phase101_stored_evidence_reuse_research_only';publicationReady:false;rankingEligible:false;
  sourceTextRequired:false;llmCalls:0;
  categoryId:string;criterionId:string;frameId:string;
  tiers:{tier:number;variantIds:string[];meaning:'supported_relative_order_not_cardinal_score'}[];
  uncertainVariantIds:string[];unassessedVariantIds:string[];
  cases:{variantId:string;name:string;descriptors:Descriptor[];status:EvidenceStatus;sourceUrls:string[];claimIds:string[]}[];
  blockedComparisons:string[];edgeEvidence:{better:string;worse:string;claimIds:string[]}[];
  limitations:string[];
}
function sourceValid(s:SourcePointer):boolean{
  return !!s&&url(s.sourceUrl)&&key(s.originalTestId)&&digest(s.sourceRevisionSha256)&&
    digest(s.sourceSpanSha256)&&typeof s.sourceLocator==='string'&&s.sourceLocator.length>=2&&s.sourceLocator.length<=300&&
    receipt(s.methodologyReference)&&receipt(s.assessmentReference)&&key(s.assessorId)&&
    !Number.isNaN(Date.parse(s.assessedAt))&&s.originalTestLineageReviewed===true&&
    s.exactVariantReviewed===true&&s.contextReviewed===true;
}
function validClaim(c:StoredClaim):void{
  if(!c||![c.id,c.categoryId,c.variantId,c.criterionId,c.frameId].every(key)||!sourceValid(c.source))
    throw Error('invalid_reviewed_interpretation');
  if(c.kind==='descriptor'){
    if(!['very_quiet','relatively_quiet','ordinary_noise','somewhat_noisy','very_noisy','tonal_whine','vibration','unknown'].includes(c.descriptor)||
      !['reviewer_relative','absolute_claim_without_calibration'].includes(c.qualifier))throw Error('invalid_qualitative_descriptor');
  }else if(c.kind==='pairwise'){
    if(!key(c.comparedVariantId)||c.comparedVariantId===c.variantId||
      !['better','worse','roughly_equal'].includes(c.relation)||
      !['same_original_test','independently_calibrated_bridge'].includes(c.comparisonBasis)||
      (c.comparisonBasis==='independently_calibrated_bridge'&&!receipt(c.calibrationReference)))
      throw Error('unsupported_relative_comparison');
  }else if(c.kind==='calibrated_level'){
    if(!key(c.levelId)||!receipt(c.scaleReference)||
      (c.plausibleLevelIds!==undefined&&(!Array.isArray(c.plausibleLevelIds)||
        c.plausibleLevelIds.length!==2||!c.plausibleLevelIds.every(key))))
      throw Error('unreviewed_or_invalid_calibrated_level');
  }else if(c.kind==='measurement'){
    if(c.criterionId!=='noise'||c.unit==='other'||!finite(c.value)||c.value<0||c.value>100000||
      !['db_a_sound_power','db_a_sound_pressure','sone','other'].includes(c.unit)||
      !key(c.metricId)||!key(c.protocolId)||
      (c.uncertainty!==undefined&&(!finite(c.uncertainty)||c.uncertainty<0||c.uncertainty>100000)))
      throw Error('invalid_measured_performance');
  }else throw Error('unsupported_claim_kind');
  // Disallow unintended addition of raw source text or synthetic numeric scores.
  const allowed=new Set(['id','categoryId','variantId','criterionId','frameId','source','kind',
    ...(c.kind==='descriptor'?['descriptor','qualifier']:c.kind==='pairwise'?
      ['comparedVariantId','relation','comparisonBasis','calibrationReference']:
      c.kind==='calibrated_level'?['levelId','plausibleLevelIds','scaleReference']:
      ['value','unit','metricId','protocolId','uncertainty'])]);
  if(Object.keys(c).some(k=>!allowed.has(k)))throw Error('unexpected_raw_or_unreviewed_payload');
  const sourceKeys=new Set(['sourceUrl','originalTestId','sourceRevisionSha256','sourceSpanSha256',
    'sourceLocator','methodologyReference','assessmentReference','assessorId','assessedAt',
    'originalTestLineageReviewed','exactVariantReviewed','contextReviewed']);
  if(Object.keys(c.source).some(k=>!sourceKeys.has(k)))throw Error('unexpected_raw_source_payload');
}

export class InterpretationMemory101 {
  private db:DatabaseSync;
  constructor(path:string=':memory:'){
    this.db=new DatabaseSync(path);
    this.db.exec(`PRAGMA busy_timeout=3000; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS products (
        category_id TEXT NOT NULL, variant_id TEXT NOT NULL, name TEXT NOT NULL,
        PRIMARY KEY(category_id,variant_id));
      CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY, category_id TEXT NOT NULL, variant_id TEXT NOT NULL,
        criterion_id TEXT NOT NULL, frame_id TEXT NOT NULL,
        kind TEXT NOT NULL, original_test_id TEXT NOT NULL,
        payload TEXT NOT NULL,
        FOREIGN KEY(category_id,variant_id) REFERENCES products(category_id,variant_id));
      CREATE INDEX IF NOT EXISTS idx_claim_lookup ON claims(category_id,criterion_id,frame_id);
      CREATE TABLE IF NOT EXISTS claim_withdrawal (
        claim_id TEXT PRIMARY KEY, withdrawal_reference TEXT NOT NULL,
        withdrawn_at TEXT NOT NULL,
        FOREIGN KEY(claim_id) REFERENCES claims(id));`);
  }
  close():void{this.db.close();}
  registerProduct(p:Product):void{
    if(!p||!key(p.categoryId)||!key(p.variantId)||typeof p.displayName!=='string'||
      p.displayName.trim().length<2||p.displayName.length>150)throw Error('invalid_product_variant');
    const row=this.db.prepare('SELECT name FROM products WHERE category_id=? AND variant_id=?').get(p.categoryId,p.variantId) as {name:string}|undefined;
    if(row&&row.name!==p.displayName)throw Error('variant_identity_change_requires_review');
    this.db.prepare('INSERT OR IGNORE INTO products(category_id,variant_id,name) VALUES (?,?,?)').run(p.categoryId,p.variantId,p.displayName);
  }
  recordApprovedClaim(c:StoredClaim):void{
    validClaim(c);
    const compared=c.kind==='pairwise'?[c.comparedVariantId]:[];
    for(const v of [c.variantId,...compared]){
      if(!this.db.prepare('SELECT 1 AS yes FROM products WHERE category_id=? AND variant_id=?').get(c.categoryId,v))
        throw Error('unregistered_or_mismatched_variant');
    }
    const payload=JSON.stringify(c);
    const existing=this.db.prepare('SELECT payload FROM claims WHERE id=?').get(c.id) as {payload:string}|undefined;
    if(existing){if(existing.payload!==payload)throw Error('immutable_interpretation_conflict');return;}
    this.db.prepare(`INSERT INTO claims(id,category_id,variant_id,criterion_id,frame_id,kind,original_test_id,payload)
      VALUES (?,?,?,?,?,?,?,?)`).run(c.id,c.categoryId,c.variantId,c.criterionId,c.frameId,c.kind,c.source.originalTestId,payload);
  }
  withdrawClaim(claimId:string,reference:string,at:string):void{
    if(!key(claimId)||!receipt(reference)||Number.isNaN(Date.parse(at)))throw Error('invalid_withdrawal');
    const exists=this.db.prepare('SELECT 1 AS ok FROM claims WHERE id=?').get(claimId);
    if(!exists)throw Error('claim_not_found');
    const prior=this.db.prepare('SELECT withdrawal_reference FROM claim_withdrawal WHERE claim_id=?').get(claimId) as {withdrawal_reference:string}|undefined;
    if(prior)throw Error('already_withdrawn');
    this.db.prepare('INSERT INTO claim_withdrawal VALUES (?,?,?)').run(claimId,reference,at);
  }
  /** Phase 102: stable snapshot of current structured knowledge in this frame.
   * Includes no page body; a hash identifies exactly which claims were used.
   * Does not expose reviewer approvals as authenticated identities.
   */
  snapshotReviewedFrame(input:{categoryId:string;criterionId:string;frameId:string}) {
    if(![input.categoryId,input.criterionId,input.frameId].every(key))throw Error('invalid_evidence_frame');
    this.db.exec('BEGIN DEFERRED');
    try {
      const products=this.db.prepare('SELECT category_id AS categoryId,variant_id AS variantId,name AS displayName FROM products WHERE category_id=? ORDER BY variant_id')
        .all(input.categoryId) as unknown as Product[];
      const claims=(this.db.prepare(`SELECT payload FROM claims WHERE category_id=? AND criterion_id=? AND frame_id=?
        AND id NOT IN (SELECT claim_id FROM claim_withdrawal) ORDER BY id`).all(
        input.categoryId,input.criterionId,input.frameId) as {payload:string}[]).map(row=>JSON.parse(row.payload) as StoredClaim);
      const withdrawnClaimIds=(this.db.prepare(`SELECT c.id AS id FROM claims c JOIN claim_withdrawal w ON c.id=w.claim_id
        WHERE c.category_id=? AND c.criterion_id=? AND c.frame_id=? ORDER BY c.id`).all(
        input.categoryId,input.criterionId,input.frameId) as {id:string}[]).map(x=>x.id);
      const base={...input,products,claims,withdrawnClaimIds};
      const result={...base,revisionSha256:fingerprintEvidenceFrame102(base)};
      this.db.exec('COMMIT');
      return result;
    }catch(error){this.db.exec('ROLLBACK');throw error;}
  }
  /** Source-free hand-off into the existing Phase98/99/100 value model.
   * Returns NOTHING if the scale has not been explicitly matched or if there
   * are multiple unadjudicated assessments for the same variant and criterion.
   * The caller must supply a real independently reviewed Phase98 value scale.
   */
  getCalibratedPerformance(input:{categoryId:string;criterionId:string;frameId:string;
    scaleReference:string}):{performance:IndependentPerformanceAssessment[];unresolvedVariantIds:string[]}{
    if(![input.categoryId,input.criterionId,input.frameId].every(key)||!receipt(input.scaleReference))
      throw Error('invalid_anchored_retrieval');
    const rows=this.db.prepare(`SELECT payload FROM claims WHERE category_id=? AND criterion_id=? AND frame_id=?
      AND kind='calibrated_level' AND id NOT IN (SELECT claim_id FROM claim_withdrawal)`).all(
        input.categoryId,input.criterionId,input.frameId) as {payload:string}[];
    const grouped=new Map<string,CalibratedLevelClaim[]>();
    for(const row of rows){const claim=JSON.parse(row.payload) as CalibratedLevelClaim;
      if(claim.scaleReference!==input.scaleReference)continue;
      if(!grouped.has(claim.variantId))grouped.set(claim.variantId,[]);
      grouped.get(claim.variantId)!.push(claim);
    }
    const performance:IndependentPerformanceAssessment[]=[],unresolvedVariantIds:string[]=[];
    for(const [variantId,cs] of grouped){
      if(cs.length!==1){unresolvedVariantIds.push(variantId);continue;}
      const c=cs[0];performance.push({variantId,criterionId:input.criterionId,levelId:c.levelId,
        plausibleLevelIds:c.plausibleLevelIds,evidenceOrigin:'original_professional_qualitative_test',
        originalTestId:c.source.originalTestId,sourceUrl:c.source.sourceUrl,
        performanceAdjudicationReference:c.source.assessmentReference,
        exactModelConfirmed:true,contextConfirmed:true,methodReviewed:true});
    }
    return {performance,unresolvedVariantIds:unresolvedVariantIds.sort()};
  }
  /** Read ONLY normalized, reviewed assertions and registered catalogue IDs.
   * Never retrieves the source page or the original article body. */
  findLessNoisy(input:{categoryId:string;criterionId:string;frameId:string;
    /** Optional, reviewed practical-difference threshold for a compatible metric. */
    minimumMeaningfulMeasuredDifference?:number;
    thresholdReviewReference?:string}):FrameRankResult {
    const {categoryId,criterionId,frameId}=input;
    if(input.minimumMeaningfulMeasuredDifference===undefined && input.thresholdReviewReference!==undefined)
      throw Error('orphaned_threshold_review_reference');
    if(!key(categoryId)||criterionId!=='noise'||!key(frameId)||
      (input.minimumMeaningfulMeasuredDifference!==undefined&&
        (!finite(input.minimumMeaningfulMeasuredDifference)||input.minimumMeaningfulMeasuredDifference<0||
        !receipt(input.thresholdReviewReference))))
      throw Error('invalid_context_or_unreviewed_threshold');
    const products=this.db.prepare('SELECT variant_id AS variantId,name FROM products WHERE category_id=? ORDER BY variant_id').all(categoryId) as {variantId:string;name:string}[];
    if(products.length>250)throw Error('research_query_exceeds_validated_scope');
    const claims=(this.db.prepare(`SELECT payload FROM claims
      WHERE category_id=? AND criterion_id=? AND frame_id=? AND id NOT IN (SELECT claim_id FROM claim_withdrawal)`)
      .all(categoryId,criterionId,frameId) as {payload:string}[]).map(x=>JSON.parse(x.payload) as StoredClaim);
    const pids=products.map(p=>p.variantId),known=new Set(pids);
    const descriptors=new Map<string,Descriptor[]>(),evidence=new Map<string,StoredClaim[]>();
    for(const p of products){descriptors.set(p.variantId,[]);evidence.set(p.variantId,[]);}
    const relation=new Map<string,Set<string>>(),edgeCitations=new Map<string,string[]>();
    const blocked=new Set<string>(),uncertain=new Set<string>();
    const addEdge=(better:string,worse:string,ids:string[])=>{
      if(!relation.has(better))relation.set(better,new Set());
      relation.get(better)!.add(worse);
      const k=better+':'+worse;edgeCitations.set(k,[...new Set([...(edgeCitations.get(k)??[]),...ids])]);
    };
    const measures=new Map<string,MeasurementClaim[]>(),ties:[string,string][]=[];
    for(const c of claims){
      evidence.get(c.variantId)!.push(c);
      if(c.kind==='descriptor')descriptors.get(c.variantId)!.push(c.descriptor);
      if(c.kind==='pairwise'){
        if(c.relation==='roughly_equal'){ties.push([c.variantId,c.comparedVariantId]);blocked.add(c.variantId+':'+c.comparedVariantId+':relative_tie');continue;}
        const good=c.relation==='better'?c.variantId:c.comparedVariantId;
        const bad=c.relation==='better'?c.comparedVariantId:c.variantId;
        if(known.has(good)&&known.has(bad))addEdge(good,bad,[c.id]);
      }
      if(c.kind==='measurement'){
        const g=[c.unit,c.metricId,c.protocolId].join(':');
        if(!measures.has(g))measures.set(g,[]);measures.get(g)!.push(c);
      }
    }
    // Numeric evidence cannot mix sound power with sound pressure, testing
    // modes, protocols or unknown repeatability. Don't claim significance from
    // an unknown/unspecified practical threshold. 0 is NOT defaulted.
    for(const [group,rs] of measures){
      if(measures.size>1){blocked.add('multiple_incompatible_numeric_protocols_in_frame:'+group);continue;}
      if(input.minimumMeaningfulMeasuredDifference===undefined){blocked.add(group+':missing_reviewed_practical_threshold');continue;}
      const grouped=new Map<string,MeasurementClaim[]>();
      for(const c of rs){if(!grouped.has(c.variantId))grouped.set(c.variantId,[]);grouped.get(c.variantId)!.push(c);}
      for(const [v,observations] of grouped)if(observations.length!==1){
        uncertain.add(v);blocked.add(group+':multiple_measurements_not_reconciled:'+v);
      }
      const good=[...grouped].filter(([v,x])=>x.length===1&&!uncertain.has(v)).map(([,x])=>x[0]);
      for(let i=0;i<good.length;i++)for(let j=i+1;j<good.length;j++){
        const a=good[i],b=good[j],ua=a.uncertainty,ub=b.uncertainty;
        if(ua===undefined||ub===undefined){blocked.add(group+':unreported_uncertainty:'+a.variantId+':'+b.variantId);continue;}
        const threshold=input.minimumMeaningfulMeasuredDifference!;
        if(a.value+ua+threshold < b.value-ub)addEdge(a.variantId,b.variantId,[a.id,b.id]);
        else if(b.value+ub+threshold < a.value-ua)addEdge(b.variantId,a.variantId,[a.id,b.id]);
        else blocked.add(group+':overlapping_or_immaterial_measurements:'+a.variantId+':'+b.variantId);
      }
    }
    // Reject cyclic/conflicting comparisons rather than inventing a tie or
    // aggregating opposite reviewer opinions. These products stay visible.
    const reach=(start:string,target:string,seen=new Set<string>()):boolean=>{
      for(const nxt of relation.get(start)??[]){if(nxt===target)return true;
        if(!seen.has(nxt)){seen.add(nxt);if(reach(nxt,target,seen))return true;}}
      return false;
    };
    for(const [a,b] of ties)if(reach(a,b)||reach(b,a)){uncertain.add(a);uncertain.add(b);blocked.add('tie_vs_strict_preference_conflict:'+a+':'+b);}
    for(const a of pids)for(const b of pids)if(a!==b&&reach(a,b)&&reach(b,a)){
      uncertain.add(a);uncertain.add(b);blocked.add('opposing_or_cyclic_relative_evidence:'+a+':'+b);
    }
    for(const v of uncertain){relation.delete(v);for(const peers of relation.values())peers.delete(v);}
    const judged=new Set<string>();for(const [a,bs] of relation){if(bs.size)judged.add(a);for(const b of bs)judged.add(b);}
    const remaining=new Set(judged),tiers:FrameRankResult['tiers']=[];
    while(remaining.size){
      const top=[...remaining].filter(v=>![...remaining].some(other=>other!==v&&relation.get(other)?.has(v))).sort();
      if(!top.length){for(const v of remaining)uncertain.add(v);blocked.add('unresolved_comparison_cycle');break;}
      tiers.push({tier:tiers.length+1,variantIds:top,meaning:'supported_relative_order_not_cardinal_score'});
      top.forEach(v=>remaining.delete(v));
    }
    const cases=products.map(p=>({variantId:p.variantId,name:p.name,
      descriptors:[...new Set(descriptors.get(p.variantId)!)],
      status:(uncertain.has(p.variantId)?'not_comparable':judged.has(p.variantId)?'supported_preference':
        evidence.get(p.variantId)!.length?'qualitatively_described':'not_comparable') as EvidenceStatus,
      sourceUrls:[...new Set(evidence.get(p.variantId)!.map(e=>e.source.sourceUrl))],
      claimIds:evidence.get(p.variantId)!.map(e=>e.id).sort()}));
    return {purpose:'phase101_stored_evidence_reuse_research_only',publicationReady:false,rankingEligible:false,
      sourceTextRequired:false,llmCalls:0,categoryId,criterionId,frameId,tiers,
      uncertainVariantIds:[...uncertain].sort(),unassessedVariantIds:pids.filter(v=>!evidence.get(v)!.length&&!judged.has(v)),
      cases,blockedComparisons:[...blocked].sort(),
      edgeEvidence:[...edgeCitations].filter(([k])=>{
        const [a,b]=k.split(':');return !uncertain.has(a)&&!uncertain.has(b);
      }).map(([k,ids])=>({better:k.split(':')[0],worse:k.split(':')[1],claimIds:ids})),
      limitations:[
        'A noisy descriptor alone has no cardinal score or universal quietness rank.',
        'Partial-order tiers are not additive utility or probabilities; tiers do not imply complete ordering across disconnected chains.',
        'Unknown and incomparable products remain visible instead of being screened out.',
        'Source/page hash and locator are retained for audit, not full review text; approval receipts need authenticated production controls.',
        'SQLite single-process research store requires transactional operational validation; no public ranking or rights clearance is asserted.'
      ]};
  }
}
