/**
 * Phase 102: query-time reasoning over preinterpreted, approved evidence.
 * Research boundary: no source-body access, LLM, arbitrary lexical sentiment
 * scale, independent-test multiplication, personalized weighting or published
 * consumer recommendations. This layer exposes *which comparisons are known*
 * and which are unresolved, while preserving the audit chain.
 *
 * Scientific inputs: W3C PROV; GRADE-CERQual (adaptation, not certification),
 * Bradley–Terry identifiability caution, robust ordinal regression.
 */
import {createHash} from 'node:crypto';
import type {Product,StoredClaim,CalibratedLevelClaim,PairwiseClaim} from './phase101_interpretation_memory.js';

const isId=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,100}$/.test(s);
export interface EvidenceFrameSnapshot102 {
  categoryId:string; criterionId:string; frameId:string;
  /** Immutable approved product identities and current, non-withdrawn claims. */
  products:Product[]; claims:StoredClaim[];
  withdrawnClaimIds:string[];
  /** SHA-256 is only an audit checksum, not a signed authorization receipt. */
  revisionSha256:string;
}
export function fingerprintEvidenceFrame102(input:Omit<EvidenceFrameSnapshot102,'revisionSha256'>):string {
  const products=[...input.products].sort((a,b)=>a.variantId.localeCompare(b.variantId));
  const claims=[...input.claims].sort((a,b)=>a.id.localeCompare(b.id));
  const withdrawn=[...input.withdrawnClaimIds].sort();
  return createHash('sha256').update(JSON.stringify({categoryId:input.categoryId,criterionId:input.criterionId,
    frameId:input.frameId,products,claims,withdrawn})).digest('hex');
}
export type PairStatus102='supported_better'|'supported_worse'|'reported_equivalent'|
  'contested'|'not_directly_comparable';
export interface EvidencePair102 {
  firstVariantId:string;secondVariantId:string;status:PairStatus102;
  /** Independent ORIGINAL test executions, not raw publication/claim count. */
  supportOriginalTestIds:string[];opposeOriginalTestIds:string[];tieOriginalTestIds:string[];
  sourceClaimIds:string[];
  /** Evidence from the same test or syndication is never counted as repeated corroboration. */
  limitation:string|null;
}
export interface CalibratedCriterion102 {
  variantId:string;status:'agreed_level'|'interval_level'|'disputed_level'|'no_calibrated_level';
  levelId:string|null;plausibleLevelIds:readonly [string,string]|null;scaleReference:string|null;supportOriginalTestIds:string[];claimIds:string[];
}
export interface EvidenceKnowledgeResult102 {
  purpose:'phase102_reusable_knowledge_research_only';publicationReady:false;rankingEligible:false;
  sourceTextRequired:false;llmCalls:0;engineVersion:'phase102-v1';
  revisionSha256:string; categoryId:string;criterionId:string;frameId:string;
  products:Product[];
  /** Each pair is reported; absence of comparison is not evidence of equality. */
  comparisons:EvidencePair102[];
  calibratedLevels:CalibratedCriterion102[];
  descriptors:{variantId:string;terms:string[];originalTestIds:string[]}[];
  rawMeasurements:{variantId:string;value:number;unit:string;metricId:string;protocolId:string;originalTestId:string;claimId:string}[];
  withdrawnClaimIds:string[];
  warnings:string[];
}
export function reasonOverEvidenceFrame102(snapshot:EvidenceFrameSnapshot102):EvidenceKnowledgeResult102 {
  if(!snapshot||![snapshot.categoryId,snapshot.criterionId,snapshot.frameId].every(isId)||
      !Array.isArray(snapshot.products)||!Array.isArray(snapshot.claims)||
      !Array.isArray(snapshot.withdrawnClaimIds)||snapshot.products.length>250||snapshot.claims.length>20000)
    throw Error('invalid_evidence_snapshot');
  if(snapshot.revisionSha256!==fingerprintEvidenceFrame102(snapshot))throw Error('evidence_snapshot_integrity_failure');
  const productIds=snapshot.products.map(p=>p.variantId);
  if(new Set(productIds).size!==productIds.length||!snapshot.products.every(p=>
      p.categoryId===snapshot.categoryId&&isId(p.variantId)&&typeof p.displayName==='string'))
    throw Error('invalid_exact_variants');
  const known=new Set(productIds),ids=new Set<string>();
  for(const c of snapshot.claims){
    if(ids.has(c.id)||!known.has(c.variantId)||c.categoryId!==snapshot.categoryId||
       c.criterionId!==snapshot.criterionId||c.frameId!==snapshot.frameId||
       (c.kind==='pairwise'&&!known.has(c.comparedVariantId)))
       throw Error('invalid_or_cross_frame_evidence');
    ids.add(c.id);
  }
  if(snapshot.withdrawnClaimIds.some(id=>ids.has(id)))throw Error('withdrawn_claim_in_active_snapshot');
  const claimsByPair=new Map<string,PairwiseClaim[]>();
  const groupKey=(a:string,b:string)=>[a,b].sort().join('\u0000');
  for(const c of snapshot.claims){
    if(c.kind!=='pairwise')continue;
    const k=groupKey(c.variantId,c.comparedVariantId);
    if(!claimsByPair.has(k))claimsByPair.set(k,[]);
    claimsByPair.get(k)!.push(c);
  }
  const products=[...snapshot.products].sort((a,b)=>a.variantId.localeCompare(b.variantId));
  const comparisons:EvidencePair102[]=[];
  for(let i=0;i<products.length;i++)for(let j=i+1;j<products.length;j++){
    const first=products[i].variantId,second=products[j].variantId;
    const cs=claimsByPair.get(groupKey(first,second))??[];
    const supports=new Set<string>(),opposes=new Set<string>(),ties=new Set<string>();
    for(const c of cs){
      const t=c.source.originalTestId;
      if(c.relation==='roughly_equal')ties.add(t);
      else if((c.variantId===first&&c.relation==='better')||
              (c.variantId===second&&c.relation==='worse'))supports.add(t);
      else opposes.add(t);
    }
    const contested=(supports.size>0&&opposes.size>0)||
      (ties.size>0&&(supports.size>0||opposes.size>0));
    const status:PairStatus102=contested?'contested':supports.size?'supported_better':
      opposes.size?'supported_worse':ties.size?'reported_equivalent':'not_directly_comparable';
    comparisons.push({firstVariantId:first,secondVariantId:second,status,
      supportOriginalTestIds:[...supports].sort(),opposeOriginalTestIds:[...opposes].sort(),
      tieOriginalTestIds:[...ties].sort(),sourceClaimIds:cs.map(c=>c.id).sort(),
      limitation:contested?'Unreconciled original tests or incompatible judgments; no majority-vote resolution.':
        cs.length===0?'No direct verified comparison; transitive/global ranking is not inferred.':
        'Direct context-scoped expert comparison, not a universal numerical distance.'});
  }
  const calibratedLevels:CalibratedCriterion102[]=products.map(p=>{
    const cs=snapshot.claims.filter((c):c is CalibratedLevelClaim=>c.kind==='calibrated_level'&&c.variantId===p.variantId);
    const distinct=new Set(cs.map(c=>c.scaleReference+'\u0000'+c.levelId+'\u0000'+(c.plausibleLevelIds??[]).join(':')));
    // A plausible range requires a separately reviewed value function; it is
    // NOT equal to the central ordinal level and cannot be silently collapsed.
    const mixed=cs.length>0&&distinct.size!==1;
    const interval=cs.length>0&&!mixed&&cs[0].plausibleLevelIds!==undefined;
    return {variantId:p.variantId,status:cs.length===0?'no_calibrated_level':mixed?'disputed_level':interval?'interval_level':'agreed_level',
      levelId:cs.length&&!mixed?cs[0].levelId:null,
      plausibleLevelIds:cs.length&&!mixed?(cs[0].plausibleLevelIds??null):null,
      scaleReference:cs.length&&!mixed?cs[0].scaleReference:null,
      supportOriginalTestIds:[...new Set(cs.map(c=>c.source.originalTestId))].sort(),claimIds:cs.map(c=>c.id).sort()
    } satisfies CalibratedCriterion102;
  });
  const descriptors=products.map(p=>({variantId:p.variantId,
    terms:[...new Set(snapshot.claims.filter(c=>c.kind==='descriptor'&&c.variantId===p.variantId)
      .map(c=>(c as Extract<StoredClaim,{kind:'descriptor'}>).descriptor))].sort(),
    originalTestIds:[...new Set(snapshot.claims.filter(c=>c.kind==='descriptor'&&c.variantId===p.variantId)
      .map(c=>c.source.originalTestId))].sort()}));
  const rawMeasurements=snapshot.claims.filter(c=>c.kind==='measurement').map(c=>{
    if(c.kind!=='measurement')throw Error('unreachable');
    return {variantId:c.variantId,value:c.value,unit:c.unit,metricId:c.metricId,
      protocolId:c.protocolId,originalTestId:c.source.originalTestId,claimId:c.id};
  });
  const warnings=[
    'Direct comparisons do not automatically justify transitive or global rankings.',
    'Independence is only as sound as prior original-test lineage review; duplicate articles must share one test ID.',
    'Qualitative descriptors have no universal ordinal or cardinal translation.',
    'An agreed level requires independently validated scale anchors and contextual applicability.',
    'No numeric expert reliability or statistical significance is inferred from claim counts.',
    'Source content can be rechecked by URL and locator, but original text is not required for queries.'
  ];
  return {purpose:'phase102_reusable_knowledge_research_only',publicationReady:false,rankingEligible:false,
    sourceTextRequired:false,llmCalls:0,engineVersion:'phase102-v1',revisionSha256:snapshot.revisionSha256,
    categoryId:snapshot.categoryId,criterionId:snapshot.criterionId,frameId:snapshot.frameId,
    products,comparisons,calibratedLevels,descriptors,rawMeasurements,
    withdrawnClaimIds:[...snapshot.withdrawnClaimIds].sort(),warnings};
}
