/**
 * Phase112 — semantic-equivalence ranking contract (RESEARCH ONLY).
 * Paraphrases do not create separate product knowledge. A structured, verified
 * intent is the only ranking input. This module does NOT validate arbitrary
 * NLP intent extraction, MCDA calibration, sound perception, or product suitability.
 *
 * Scientific motivations: Bailey et al., SIGIR 2017 query variation consistency;
 * UQV100; metamorphic testing; NIST AI RMF validation and robustness.
 */
import {createHash} from 'node:crypto';

const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{1,90}$/.test(s);
const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const sorted=(xs:readonly string[])=>[...xs].sort();
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);

export interface VerifiedIntent112 {
  categoryId:'vacuum_cleaner';
  criterionId:'noise_dba';
  contextId:'bare_floor'|'low_pile_carpet';
  direction:'lower_is_better';
  /** Real constraints, if any, must be recorded explicitly and NEVER silently dropped. */
  hardRequirements:readonly string[];
  /** Elicited and verified before this object is used, not inferred from user identity. */
  profileReference:string;
  verification:'explicitly_verified_semantic_frame';
}
export interface Measurement112 {
  variantId:string; productName:string; criterionId:'noise_dba';
  contextId:VerifiedIntent112['contextId']; value:number;
  unit:'dBA'; methodId:string; sourceUrl:string; originalTestId:string;
  provenanceStatus:'independent_measured';
}
export interface EvidenceSnapshot112 {
  snapshotId:string; categoryId:'vacuum_cleaner';
  methodId:string; measurements:readonly Measurement112[];
  variantIds:readonly string[];
  /** Immutable release/reference for data and eligibility, not a clock-based guess. */
  evidenceRevision:string;
}
export interface RankedCandidate112 {
  variantId:string;productName:string; rank:number|null;
  value:number|null; unit:'dBA'|null;
  status:'measured_and_comparable'|'missing_evidence'|'conflicting_measurements';
  originalTestIds:string[]; sourceUrls:string[];
}
export interface Ranking112 {
  purpose:'phase112_research_only_not_a_public_recommendation';
  intentSha256:string; snapshotSha256:string;
  ordered:RankedCandidate112[]; notRanked:RankedCandidate112[];
  profileReference:string; sourceTextRequired:false;llmCalls:0;
  publicationReady:false; rankingEligible:false;
  qualification:'measured_noise_only_not_perceived_comfort_or_overall_product_quality';
}
function verified(intent:VerifiedIntent112):void{
  if(!intent||Object.keys(intent).sort().join('|')!==
    ['categoryId','criterionId','contextId','direction','hardRequirements','profileReference','verification'].sort().join('|')||
    intent.categoryId!=='vacuum_cleaner'||intent.criterionId!=='noise_dba'||
    !['bare_floor','low_pile_carpet'].includes(intent.contextId)||
    intent.direction!=='lower_is_better'||intent.verification!=='explicitly_verified_semantic_frame'||
    !Array.isArray(intent.hardRequirements)||!intent.hardRequirements.every(id)||
    new Set(intent.hardRequirements).size!==intent.hardRequirements.length||
    typeof intent.profileReference!=='string'||intent.profileReference.trim().length<12)
    throw Error('unverified_or_unsupported_semantic_frame');
  // This narrow, independently measured criterion pipeline does not adjudicate
  // unsupported hard requirements. Never ignore them or silently call them passed.
  if(intent.hardRequirements.length)throw Error('hard_requirement_needs_independent_eligibility_gate');
}
export function canonicalIntent112(intent:VerifiedIntent112):string{
  verified(intent);
  return hash({categoryId:intent.categoryId,criterionId:intent.criterionId,
    contextId:intent.contextId,direction:intent.direction,
    hardRequirements:sorted(intent.hardRequirements),profileReference:intent.profileReference});
}
function validatedSnapshot(s:EvidenceSnapshot112):void{
  if(!s||!id(s.snapshotId)||!id(s.evidenceRevision)||
    s.categoryId!=='vacuum_cleaner'||!id(s.methodId)||
    !Array.isArray(s.variantIds)||!s.variantIds.length||s.variantIds.length>5000||
    !s.variantIds.every(id)||new Set(s.variantIds).size!==s.variantIds.length||
    !Array.isArray(s.measurements)||s.measurements.length>50000)throw Error('invalid_evidence_snapshot');
  const variants=new Set(s.variantIds);
  for(const m of s.measurements){
    if(!m||!variants.has(m.variantId)||!id(m.originalTestId)||
      m.criterionId!=='noise_dba'||!['bare_floor','low_pile_carpet'].includes(m.contextId)||
      m.unit!=='dBA'||m.methodId!==s.methodId||
      !Number.isFinite(m.value)||m.value<0||m.value>150||
      typeof m.productName!=='string'||!m.productName.trim()||
      !/^https:\/\//.test(m.sourceUrl)||
      m.provenanceStatus!=='independent_measured')throw Error('invalid_or_uncomparable_measurement');
  }
}
function fingerprint(s:EvidenceSnapshot112){
  return hash({snapshotId:s.snapshotId,categoryId:s.categoryId,methodId:s.methodId,
    evidenceRevision:s.evidenceRevision,variantIds:sorted(s.variantIds),
    measurements:[...s.measurements].sort((a,b)=>
      [a.variantId,a.contextId,a.originalTestId,a.sourceUrl].join('|').localeCompare(
      [b.variantId,b.contextId,b.originalTestId,b.sourceUrl].join('|')))});
}
/** Stable group ranking: identical measurements share a rank. Missing / conflicting
 * products remain visible but cannot be falsely ordered or vetoed. No price and
 * no cross-protocol averaging. This is NOT a multi-criterion product ranking. */
export function rankSameIntent112(intent:VerifiedIntent112,snapshot:EvidenceSnapshot112):Ranking112{
  const intentSha256=canonicalIntent112(intent);
  validatedSnapshot(snapshot);
  if(snapshot.categoryId!==intent.categoryId)throw Error('category_snapshot_mismatch');
  const byVariant=new Map<string,Measurement112[]>();
  for(const m of snapshot.measurements){
    if(m.contextId!==intent.contextId)continue;
    byVariant.set(m.variantId,[...byVariant.get(m.variantId)??[],m]);
  }
  const ordered:RankedCandidate112[]=[],notRanked:RankedCandidate112[]=[];
  for(const variantId of snapshot.variantIds){
    const originals=byVariant.get(variantId)??[];
    // A syndicated copy of the same original experiment adds NO extra vote.
    const distinct=new Map<string,Measurement112>();
    for(const m of originals){
      const old=distinct.get(m.originalTestId);
      if(old&&(!same({...old,sourceUrl:''},{...m,sourceUrl:''})))
        throw Error('same_original_test_conflicting_records');
      if(!old)distinct.set(m.originalTestId,m);
    }
    const unique=[...distinct.values()];
    const provenance={originalTestIds:sorted(unique.map(m=>m.originalTestId)),
      sourceUrls:sorted([...new Set(unique.map(m=>m.sourceUrl))])};
    const base={variantId,productName:unique[0]?.productName??variantId,...provenance};
    if(unique.length===0){notRanked.push({...base,rank:null,value:null,unit:null,status:'missing_evidence'});continue;}
    // Across multiple independently measured values, reconciliation cannot be
    // supplied by raw numeric averaging. Even agreement needs an explicit
    // approved synthesis policy; stay conservative.
    if(unique.length>1){notRanked.push({...base,rank:null,value:null,unit:null,status:'conflicting_measurements'});continue;}
    ordered.push({...base,rank:0,value:unique[0].value,unit:'dBA',status:'measured_and_comparable'});
  }
  ordered.sort((a,b)=>a.value!-b.value!||a.variantId.localeCompare(b.variantId));
  for(let i=0;i<ordered.length;i++)ordered[i].rank=i&&ordered[i].value===ordered[i-1].value?
    ordered[i-1].rank:i+1;
  notRanked.sort((a,b)=>a.variantId.localeCompare(b.variantId));
  return {purpose:'phase112_research_only_not_a_public_recommendation',
    intentSha256,snapshotSha256:fingerprint(snapshot),ordered,notRanked,
    profileReference:intent.profileReference,sourceTextRequired:false,llmCalls:0,
    publicationReady:false,rankingEligible:false,
    qualification:'measured_noise_only_not_perceived_comfort_or_overall_product_quality'};
}

/** This parser is a CONTROLLED GRAMMAR DEMO, not general semantic NLP.
 * Unknown constraints must fail closed, not be silently erased. */
export function boundedNoiseRequest112(text:string,profileReference:string):
  {status:'verified_bounded_grammar';intent:VerifiedIntent112}|
  {status:'needs_semantic_review';reason:string}{
  if(typeof text!=='string'||text.length<12||text.length>300)return {status:'needs_semantic_review',reason:'unsupported_input'};
  const normal=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/[^a-z\s]/g,' ').replace(/\s+/g,' ').trim();
  const tokens=normal.split(' ');
  const vac=tokens.some(t=>['aspirapolvere','aspirapolveri','vacuum','vacuums','cleaner','cleaners'].includes(t));
  const noise=tokens.some(t=>['noise','noisy','quiet','quietest','silent','silenzioso','silenziosi',
    'silenziosa','silenziose','rumoroso','rumorosi','rumorosa','rumorose','rumore'].includes(t));
  const floor=tokens.some(t=>['pavimento','pavimenti','floor','floors'].includes(t));
  const carpet=tokens.some(t=>['moquette','tappeto','tappeti','carpet','carpets'].includes(t));
  if(!vac||!noise)return {status:'needs_semantic_review',reason:'category_or_goal_not_resolved'};
  if((floor&&carpet)||(!floor&&!carpet))return {status:'needs_semantic_review',reason:'test_surface_ambiguous'};
  const known=new Set(['cercami','cerca','dammi','quali','quale','sono','gli','le','i','la','il',
    'che','fanno','fa','meno','piu','rumore','rumorosi','rumoroso','rumorosa','rumorose',
    'silenziosi','silenzioso','silenziosa','silenziose','per','sui','sul','sulla','su','dei','delle','di',
    'aspirapolvere','aspirapolveri','pavimento','pavimenti','duri','duro','a','in',
    'which','the','what','are','is','a','an','of','for','on','make','makes','least','most',
    'low','pile','hard','bare','quiet','quietest','noisy','noise','vacuums','vacuum','cleaner',
    'cleaners','floors','floor','carpets','carpet','moquette','tappeto','tappeti']);
  if(tokens.some(t=>!known.has(t)))return {status:'needs_semantic_review',reason:'unrecognized_constraint_or_language'};
  // 'quiet' is a relative request. 'silent', 'completely', 'zero' and absolute
  // thresholds are outside this demo to avoid inventing mandatory gates.
  if(tokens.some(t=>['silent','silence','silenzio','zero','completely','assolutamente'].includes(t)))
    return {status:'needs_semantic_review',reason:'possible_absolute_noise_requirement'};
  return {status:'verified_bounded_grammar',intent:{categoryId:'vacuum_cleaner',
    criterionId:'noise_dba',contextId:carpet?'low_pile_carpet':'bare_floor',
    direction:'lower_is_better',hardRequirements:[],profileReference,
    verification:'explicitly_verified_semantic_frame'}};
}

export interface ParaphraseResult112 {
  equivalent:boolean; sameRankAndEvidence:boolean; discrepancies:string[];
  canonicalIntentSha256s:string[]; snapshotSha256s:string[];
  claim:'controlled_semantic_equivalence_contract_not_arbitrary_language_validation';
}
/** Evaluation oracle: human/adjudicator verifies two intents are equivalent
 * BEFORE demanding invariant ranking. Candidate, evidence, profile, rank and
 * tie/unranked statuses must agree; a model is never allowed to self-grade. */
export function compareEquivalentRequests112(a:{intent:VerifiedIntent112;snapshot:EvidenceSnapshot112},
  b:{intent:VerifiedIntent112;snapshot:EvidenceSnapshot112}):ParaphraseResult112{
  const ra=rankSameIntent112(a.intent,a.snapshot),rb=rankSameIntent112(b.intent,b.snapshot);
  const equivalent=ra.intentSha256===rb.intentSha256;
  const discrepancies:string[]=[];
  if(!equivalent)discrepancies.push('material_intent_or_profile_difference');
  if(ra.snapshotSha256!==rb.snapshotSha256)discrepancies.push('different_evidence_or_candidate_snapshot');
  const shape=(r:Ranking112)=>({ordered:r.ordered,notRanked:r.notRanked});
  if(!same(shape(ra),shape(rb)))discrepancies.push('different_ranking_or_provenance');
  return {equivalent,sameRankAndEvidence:equivalent&&discrepancies.length===0,
    discrepancies,canonicalIntentSha256s:[ra.intentSha256,rb.intentSha256],
    snapshotSha256s:[ra.snapshotSha256,rb.snapshotSha256],
    claim:'controlled_semantic_equivalence_contract_not_arbitrary_language_validation'};
}
