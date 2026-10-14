/** Phase 57: research-only bridge from CONFIRMED needs to original lab measurements.
 * Deliberately no score normalization, no recommendation winner, no commercial inputs.
 * Source rights remain unverified until a separate contractual/evidence review.
 */
import {
  interpretDecisionNeeds, type DecisionNeedsResult,
  type NeedsAnswers, type NeedsCategory,
} from './needs_discovery.js';

export interface OriginalLabMeasurement {
  record_id: string;
  original_test_id: string;
  test_url: string;
  tested_variant: string;
  criterion: string;
  measurement: number;
  unit: string;
  protocol_id: string;
  protocol_version: string;
  conditions: Record<string,string>;
  tested_at: string;
}
export interface QuarantinedLabExport {
  source_kind: 'original_independent_lab_measurements';
  review_only: true;
  ranking_input_approved: false;
  rights_status: 'human_attested_not_cryptographically_verified';
  publisher_domain: string;
  input_sha256: string;
  measurements: OriginalLabMeasurement[];
}
/** Mapping is an editorially specified hypothesis, not an automatic equivalence. */
export interface NeedToTestRule {
  categoryId: string;
  needId: string;
  measurementCriterion: string;
  unit: string;
  /** Same physical observation may imply better performance when higher OR lower. */
  favourableDirection: 'higher' | 'lower';
  protocolId: string;
  protocolVersion: string;
  /** Conditions must match exactly, not merely overlap. */
  conditions: Record<string,string>;
  /** Documented editor-approved rationale for a need-to-test mapping; not a licence. */
  reviewReference: string;
}
export type Direction = 'first_observed_better'|'second_observed_better'|'same_observed_value';
export type ComparisonStatus = 'descriptive_only'|'missing_measurement'|'incompatible_methods'|'ambiguous_records'|'unmapped_need';
export interface NeedComparison {
  needId: string;
  status: ComparisonStatus;
  variantIds: [string,string];
  direction?: Direction;
  firstValue?: number;
  secondValue?: number;
  unit?: string;
  testUrls: string[];
  /** Exact original records backing the comparison: deterministic provenance for later audits. */
  sourceRecordIds?: [string,string];
  /** NEVER infer statistical significance from a difference of two point estimates. */
  limitation: string;
}
export interface LabNeedsBridgeResult {
  needs: DecisionNeedsResult;
  comparisons: NeedComparison[];
  unmappedNeeds: string[];
  capabilityGaps: string[];
  hypotheticalTradeoffs: string[];
  winnerId: null;
  numericScores: null;
  publicationReady: false;
  purpose: 'original_lab_research_bridge';
  provenance: { publisherDomain: string; exportSha256: string; rightsVerified: false };
}

const commercialKey = /(?:price|cost|budget|msrp|rrp|deal|discount|sale|retailer|merchant|amazon|affiliate|commission)/i;
const safeId = (s:unknown) => typeof s==='string' && /^[a-z][a-z0-9_]*$/.test(s) && !commercialKey.test(s);
function conditionsEqual(a:Record<string,string>,b:Record<string,string>):boolean {
  const entries = (o:Record<string,string>) => Object.entries(o).sort(([a],[b])=>a.localeCompare(b));
  return JSON.stringify(entries(a))===JSON.stringify(entries(b));
}
function checkExport(e:QuarantinedLabExport,variants:[string,string]) {
  if(!e || e.source_kind!=='original_independent_lab_measurements' || e.review_only!==true ||
    e.ranking_input_approved!==false || e.rights_status!=='human_attested_not_cryptographically_verified')
    throw new Error('Only quarantined original lab research records accepted');
  if(!e.publisher_domain || !/^[a-z0-9.-]+$/.test(e.publisher_domain) ||
    !/^[a-f0-9]{64}$/.test(e.input_sha256) || !Array.isArray(e.measurements) || e.measurements.length>10000)
    throw new Error('Invalid original export identity');
  if(variants.length!==2 || new Set(variants).size!==2 || variants.some(v=>!safeId(v)))
    throw new Error('Two unique, exact research variant IDs required');
  const seen = new Set<string>();
  for(const m of e.measurements) {
    if(!m || !safeId(m.record_id) || !safeId(m.original_test_id) || !safeId(m.tested_variant) ||
       !safeId(m.criterion) || !safeId(m.protocol_id) || !m.protocol_version || !m.unit ||
       typeof m.measurement !== 'number' || !Number.isFinite(m.measurement) ||
       !m.conditions || !Object.keys(m.conditions).length ||
       Object.entries(m.conditions).some(([k,v])=>!k || !v || typeof v!=='string') ||
       !Number.isFinite(Date.parse(m.tested_at)) || seen.has(m.record_id))
      throw new Error('Malformed or duplicate original measurement');
    seen.add(m.record_id);
    let url:URL;
    try {url=new URL(m.test_url);} catch {throw new Error('Invalid original source URL');}
    if(url.protocol!=='https:' || url.hostname!==e.publisher_domain || url.username || url.password)
      throw new Error('Measurement must link to its original publisher');
  }
}
function checkRules(rules:NeedToTestRule[], category:NeedsCategory) {
  const seen=new Set<string>();
  for (const r of rules) {
    if(!safeId(r.categoryId) || r.categoryId!==category.id || !safeId(r.needId) ||
      !category.criteria.some(c=>c.id===r.needId) || !safeId(r.measurementCriterion) ||
      !safeId(r.protocolId) || !r.unit || !r.protocolVersion ||
      !['higher','lower'].includes(r.favourableDirection) ||
      !r.reviewReference?.trim() || !r.conditions || !Object.keys(r.conditions).length ||
      Object.entries(r.conditions).some(([k,v])=>!k || !v || typeof v!=='string') ||
      seen.has(r.needId)) throw new Error('Invalid, unreviewed or ambiguous need-to-test mapping');
    seen.add(r.needId);
  }
}
/** This can describe an observed trade-off. It CANNOT claim which product is best. */
export function bridgeNeedsToOriginalLab(input: {
  category: NeedsCategory;
  answers: NeedsAnswers;
  exactVariantIds: [string,string];
  export: QuarantinedLabExport;
  mappingRules: NeedToTestRule[];
}):LabNeedsBridgeResult {
  checkExport(input.export,input.exactVariantIds);
  checkRules(input.mappingRules,input.category);
  // Two passes: requirements come from user needs; coverage from test evidence, not guesses.
  const identified=interpretDecisionNeeds(input.category,input.answers,new Set());
  const comparisons:NeedComparison[]=[];
  const supportedCapabilities=new Set<string>();
  const [first,second]=input.exactVariantIds;
  for(const need of identified.criteria) {
    const r=input.mappingRules.find(x=>x.needId===need.id);
    const base:NeedComparison={needId:need.id,variantIds:[first,second],testUrls:[],
      status:'unmapped_need',limitation:'No reviewed mapping from this user need to an original laboratory measurement'};
    if(!r) {comparisons.push(base);continue;}
    const candidates=input.export.measurements.filter(m=>m.criterion===r.measurementCriterion &&
      m.unit===r.unit && [first,second].includes(m.tested_variant));
    const matches=candidates.filter(m=>m.protocol_id===r.protocolId &&
      m.protocol_version===r.protocolVersion && conditionsEqual(m.conditions,r.conditions));
    const a=matches.filter(m=>m.tested_variant===first);
    const b=matches.filter(m=>m.tested_variant===second);
    if(a.length>1 || b.length>1) {
      comparisons.push({...base,status:'ambiguous_records',limitation:'Multiple records for one variant: no arbitrary selection or averaging'});continue;
    }
    if(a.length!==1 || b.length!==1) {
      comparisons.push({...base,status:candidates.some(m=>m.tested_variant===first) && candidates.some(m=>m.tested_variant===second) ? 'incompatible_methods':'missing_measurement',
        limitation:'Both exact variants require results under the same documented method, unit and conditions'});continue;
    }
    const direction:Direction=a[0].measurement===b[0].measurement ? 'same_observed_value' :
      (r.favourableDirection==='higher' ? a[0].measurement>b[0].measurement : a[0].measurement<b[0].measurement)
      ? 'first_observed_better':'second_observed_better';
    const item:NeedComparison={needId:need.id,status:'descriptive_only',variantIds:[first,second],
      direction,firstValue:a[0].measurement,secondValue:b[0].measurement,unit:r.unit,
      testUrls:[a[0].test_url,b[0].test_url],
      sourceRecordIds:[a[0].record_id,b[0].record_id],
      limitation:'Observed direction only; uncertainty, repeatability and independent verification not established'};
    comparisons.push(item);
    const originalNeed=input.category.criteria.find(c=>c.id===need.id)!;
    supportedCapabilities.add(originalNeed.requiredEvidence);
  }
  const needs=interpretDecisionNeeds(input.category,input.answers,supportedCapabilities);
  const positive=comparisons.filter(c=>c.status==='descriptive_only' && c.direction!=='same_observed_value');
  const favFirst=positive.filter(c=>c.direction==='first_observed_better').map(c=>c.needId);
  const favSecond=positive.filter(c=>c.direction==='second_observed_better').map(c=>c.needId);
  const hypotheticalTradeoffs=favFirst.length && favSecond.length ? [
    `In comparable observations the first variant was favourable for ${favFirst.join(', ')}, while the second was favourable for ${favSecond.join(', ')}; this is not a validated ranking.`
  ]:[];
  return {needs,comparisons,unmappedNeeds:comparisons.filter(c=>c.status==='unmapped_need').map(c=>c.needId),
    capabilityGaps:needs.evidenceGaps,hypotheticalTradeoffs,
    winnerId:null,numericScores:null,publicationReady:false,purpose:'original_lab_research_bridge',
    provenance:{publisherDomain:input.export.publisher_domain,exportSha256:input.export.input_sha256,rightsVerified:false}};
}
