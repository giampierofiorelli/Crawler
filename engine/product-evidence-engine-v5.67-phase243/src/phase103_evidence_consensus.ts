/**
 * Phase 103 — evidence convergence, not an overall product score.
 * Scope: independently reviewed, persisted claims; no article content or LLM at query time.
 * It distinguishes shared evaluated findings, disagreement, coverage and method mismatch.
 * A plurality of expert claims is NOT treated as an objective probability of truth.
 *
 * Methodological inspirations (domain adaptation, not certification):
 * Cochrane Ch.4 reports-versus-studies; Ch.10 heterogeneity; Ch.12 limitations
 * of directional vote counts; GRADE-CERQual findings-level coherence/adequacy.
 */
import type {EvidenceFrameSnapshot102, EvidencePair102} from './phase102_evidence_knowledge.js';
import {reasonOverEvidenceFrame102} from './phase102_evidence_knowledge.js';
import type {CalibratedLevelClaim,DescriptorClaim,MeasurementClaim,StoredClaim} from './phase101_interpretation_memory.js';

export type ConvergenceStatus103=
  'no_registered_evidence'|'uncalibrated_descriptions_only'|'single_original_test'|
  'consistent_calibrated_levels'|'discordant_calibrated_levels'|
  'uncertain_calibrated_levels'|'incompatible_calibration_scales'|
  'conflicting_claims_in_same_test'|'measurements_without_calibrated_level';
export interface LevelGroup103 {scaleReference:string; levelId:string; originalTestIds:string[]; claimIds:string[]}
export interface DescriptorGroup103 {descriptor:string;originalTestIds:string[];claimIds:string[]}
export interface MeasurementGroup103 {
  metricId:string;protocolId:string;unit:string;
  observations:{originalTestId:string;value:number;uncertainty:number|null;claimIds:string[]}[];
  limitation:'numeric_methods_only_no_equivalence_test';
}
export interface CriterionConsensus103 {
  categoryId:string;criterionId:string;frameId:string;variantId:string;
  status:ConvergenceStatus103;
  /** Test executions, not publisher page count. With source lineage reviewed upstream. */
  distinctOriginalTests:number;originalTestIds:string[];numberOfStoredClaims:number;
  calibratedScaleReferences:string[];
  levels:LevelGroup103[];descriptors:DescriptorGroup103[];
  measurementGroups:MeasurementGroup103[];
  intervalOrUncertainTestIds:string[];
  interpretation:string;
  confidenceInAccuracy:'not_estimated';
  syntheticConsensusPercentage:null;
  sourceTextRequired:false;llmCalls:0;
}
export interface ProductEvidenceProfile103 {
  purpose:'phase103_product_profile_research_only';publicationReady:false;rankingEligible:false;
  variantId:string;categoryId:string;criterionFrames:CriterionConsensus103[];
  coverage:{framesRequested:number;framesWithAnyRegisteredEvidence:number;
    framesWithoutRegisteredEvidence:number;framesWithAtLeastTwoOriginalTests:number};
  consistentFrameKeys:string[];disputedFrameKeys:string[];unassessedFrameKeys:string[];
  /** Deliberately no universal percentage or aggregate score. */
  overallConsensusScore:null;
  sourceTextRequired:false;llmCalls:0;
  caveats:string[];
}
const id=(x:string)=>/^[a-z][a-z0-9_]{0,100}$/.test(x);
const uniq=(xs:string[])=>[...new Set(xs)].sort();
const label=(s:StoredClaim)=>s.source.originalTestId;
const frameKey=(f:{criterionId:string;frameId:string})=>`${f.criterionId}/${f.frameId}`;
function descriptorGroups(cs:DescriptorClaim[]):DescriptorGroup103[]{
  const map=new Map<string,{tests:Set<string>;claims:string[]}>();
  for(const c of cs){if(!map.has(c.descriptor))map.set(c.descriptor,{tests:new Set(),claims:[]});
    const g=map.get(c.descriptor)!;g.tests.add(label(c));g.claims.push(c.id);}
  return [...map].sort(([a],[b])=>a.localeCompare(b)).map(([descriptor,g])=>({descriptor,originalTestIds:[...g.tests].sort(),claimIds:uniq(g.claims)}));
}
function measurementGroups(cs:MeasurementClaim[]):MeasurementGroup103[]{
  const map=new Map<string,MeasurementClaim[]>();
  for(const c of cs){const key=[c.metricId,c.protocolId,c.unit].join('\u0000');
    if(!map.has(key))map.set(key,[]);map.get(key)!.push(c);}
  return [...map].sort(([a],[b])=>a.localeCompare(b)).map(([,values])=>{
    const byTest=new Map<string,MeasurementClaim[]>();
    for(const c of values){if(!byTest.has(label(c)))byTest.set(label(c),[]);byTest.get(label(c))!.push(c);}
    const observations=[...byTest].sort(([a],[b])=>a.localeCompare(b)).flatMap(([originalTestId,items])=>
      // An original test can report different observations; preserve them all.
      items.map(c=>({originalTestId,value:c.value,uncertainty:c.uncertainty??null,claimIds:[c.id]})));
    return {metricId:values[0].metricId,protocolId:values[0].protocolId,unit:values[0].unit,
      observations,limitation:'numeric_methods_only_no_equivalence_test' as const};
  });
}
/** A conservative, evidence-only synthesis from previously approved claims. */
export function evaluateCriterionConsensus103(snapshot:EvidenceFrameSnapshot102,variantId:string):CriterionConsensus103 {
  const base=reasonOverEvidenceFrame102(snapshot); // validates immutable snapshot, source/variant/frame scope
  if(!base.products.some(p=>p.variantId===variantId))throw Error('unregistered_variant_for_consensus');
  const cs=snapshot.claims.filter(c=>c.variantId===variantId);
  // Include original test where a pairwise comparison refers to this product as the comparator.
  const touching=snapshot.claims.filter(c=>c.variantId===variantId ||
    (c.kind==='pairwise'&&c.comparedVariantId===variantId));
  const originalTestIds=uniq(touching.map(label));
  const descriptors=descriptorGroups(cs.filter((c):c is DescriptorClaim=>c.kind==='descriptor'));
  const measurements=measurementGroups(cs.filter((c):c is MeasurementClaim=>c.kind==='measurement'));
  const calibrated=cs.filter((c):c is CalibratedLevelClaim=>c.kind==='calibrated_level');
  const byTest=new Map<string,CalibratedLevelClaim[]>();
  for(const c of calibrated){if(!byTest.has(label(c)))byTest.set(label(c),[]);byTest.get(label(c))!.push(c);}
  const scaleReferences=uniq(calibrated.map(c=>c.scaleReference));
  const ambiguousTests:string[]=[],conflictedTests:string[]=[];
  const exactByTest=new Map<string,CalibratedLevelClaim>();
  for(const [test,items] of byTest){
    const distinct=uniq(items.map(c=>`${c.scaleReference}\u0000${c.levelId}\u0000${(c.plausibleLevelIds??[]).join('/')}`));
    if(distinct.length>1){conflictedTests.push(test);continue;}
    if(items[0].plausibleLevelIds){ambiguousTests.push(test);continue;}
    exactByTest.set(test,items[0]);
  }
  const levels:LevelGroup103[]=[];
  const groups=new Map<string,CalibratedLevelClaim[]>();
  for(const c of calibrated.filter(c=>exactByTest.get(label(c))===c ||
    (exactByTest.has(label(c))&&exactByTest.get(label(c))!.levelId===c.levelId&&
      exactByTest.get(label(c))!.scaleReference===c.scaleReference))){
    const key=`${c.scaleReference}\u0000${c.levelId}`;
    if(!groups.has(key))groups.set(key,[]);groups.get(key)!.push(c);
  }
  for(const [key,claims] of [...groups].sort(([a],[b])=>a.localeCompare(b))){
    const [scaleReference,levelId]=key.split('\u0000');
    levels.push({scaleReference,levelId,originalTestIds:uniq(claims.map(label)),claimIds:uniq(claims.map(c=>c.id))});
  }
  let status:ConvergenceStatus103;
  if(touching.length===0)status='no_registered_evidence';
  else if(conflictedTests.length)status='conflicting_claims_in_same_test';
  else if(scaleReferences.length>1)status='incompatible_calibration_scales';
  else if(ambiguousTests.length)status='uncertain_calibrated_levels';
  else if(exactByTest.size>1&&levels.length>1)status='discordant_calibrated_levels';
  else if(exactByTest.size>1&&levels.length===1)status='consistent_calibrated_levels';
  else if(exactByTest.size===1||originalTestIds.length===1)status='single_original_test';
  else if(measurements.length)status='measurements_without_calibrated_level';
  else status='uncalibrated_descriptions_only';
  const interpretations:Record<ConvergenceStatus103,string>={
    no_registered_evidence:'No applicable claim is recorded for this product in this criterion/context. This does not prove the feature was not tested.',
    uncalibrated_descriptions_only:'Evidence exists, but its verbal categories and/or relative comparisons do not establish a calibrated consensus level.',
    single_original_test:'Only one independently identified test supports the available calibrated assessment, or evidence is limited to one test. Agreement between experts cannot be inferred.',
    consistent_calibrated_levels:'At least two identified original tests give the same reviewed level on an identical scale and context. Descriptive convergence, not a certainty estimate.',
    discordant_calibrated_levels:'Independent tests give different levels on the same reviewed scale and context. Expose disagreement; do not average it away.',
    uncertain_calibrated_levels:'At least one reviewed calibrated result is an interval, not a point. Exact unanimity cannot be inferred.',
    incompatible_calibration_scales:'Level assessments use different calibration references and cannot be pooled by matching level names.',
    conflicting_claims_in_same_test:'The same underlying original test contains conflicting calibrated claims; requires source-level reconciliation.',
    measurements_without_calibrated_level:'Raw measurements are available, but agreement/equivalence needs a validated method and uncertainty model.'
  };
  return {categoryId:snapshot.categoryId,criterionId:snapshot.criterionId,frameId:snapshot.frameId,variantId,
    status,distinctOriginalTests:originalTestIds.length,originalTestIds,
    numberOfStoredClaims:touching.length,calibratedScaleReferences:scaleReferences,
    levels,descriptors,measurementGroups:measurements,
    intervalOrUncertainTestIds:uniq([...ambiguousTests,...conflictedTests]),
    interpretation:interpretations[status],confidenceInAccuracy:'not_estimated',syntheticConsensusPercentage:null,
    sourceTextRequired:false,llmCalls:0};
}
export function buildProductEvidenceProfile103(args:{variantId:string;categoryId:string;
  requestedFrames:EvidenceFrameSnapshot102[]}):ProductEvidenceProfile103 {
  if(!id(args.variantId)||!id(args.categoryId)||!Array.isArray(args.requestedFrames)||
    args.requestedFrames.length===0||args.requestedFrames.length>120)throw Error('invalid_profile_request');
  const seen=new Set<string>(),results:CriterionConsensus103[]=[];
  for(const f of args.requestedFrames){
    if(f.categoryId!==args.categoryId)throw Error('mixed_categories_in_profile');
    const k=frameKey(f);if(seen.has(k))throw Error('duplicate_criterion_context_frame');seen.add(k);
    results.push(evaluateCriterionConsensus103(f,args.variantId));
  }
  const consistent=results.filter(r=>r.status==='consistent_calibrated_levels');
  const disputed=results.filter(r=>['discordant_calibrated_levels','conflicting_claims_in_same_test',
    'incompatible_calibration_scales','uncertain_calibrated_levels'].includes(r.status));
  const none=results.filter(r=>r.status==='no_registered_evidence');
  return {purpose:'phase103_product_profile_research_only',publicationReady:false,rankingEligible:false,
    variantId:args.variantId,categoryId:args.categoryId,criterionFrames:results,
    coverage:{framesRequested:results.length,framesWithAnyRegisteredEvidence:results.length-none.length,
      framesWithoutRegisteredEvidence:none.length,framesWithAtLeastTwoOriginalTests:results.filter(r=>r.distinctOriginalTests>=2).length},
    consistentFrameKeys:consistent.map(frameKey),disputedFrameKeys:disputed.map(frameKey),unassessedFrameKeys:none.map(frameKey),
    overallConsensusScore:null,sourceTextRequired:false,llmCalls:0,
    caveats:['Agreement is per criterion and controlled context; a product-wide percent would conflate unlike constructs.',
      'Recorded evidence coverage is not proof that every original review examined, omitted or endorsed a criterion.',
      'Two concordant tests are descriptive convergence, not a calibrated probability of correctness.',
      'Review pages may share a source or methods; original-test independence requires prior real lineage verification.',
      'Divergent results may indicate legitimate changes in operating mode, users or protocols rather than faulty testing.',
      'Consensus is supporting information for confidence, not a positive/negative performance score or an automatic ranking bonus.']};
}
/** No ratio on outcomes is called consensus; this is just an auditable raw evidence ledger. */
export function pairAgreementLedger103(pair:EvidencePair102){
  const support=pair.supportOriginalTestIds.length,oppose=pair.opposeOriginalTestIds.length,tie=pair.tieOriginalTestIds.length;
  return {firstVariantId:pair.firstVariantId,secondVariantId:pair.secondVariantId,
    independentTestDirectionCounts:{supportFirst:support,supportSecond:oppose,reportEquivalent:tie},
    completeConcordance:pair.status==='not_directly_comparable'?null:(
      ((support>0?1:0)+(oppose>0?1:0)+(tie>0?1:0))===1 && (support+oppose+tie)>=2),
    notAQualityOrConfidenceScore:true};
}
