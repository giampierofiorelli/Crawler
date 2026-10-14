/**
 * Phase 97 — combined non-compensatory suitability gate, RESEARCH ONLY.
 *
 * A documented essential failure cannot be compensated by positive tests on
 * other criteria. Missing evidence, a reviewer's individual judgement and
 * conflicting independent findings must NOT turn into automatic exclusions.
 * This is a conservative adaptation of MCDA (ISPOR 2016), the Phase 61
 * functional task gate and Phase 96 contextual qualitative review.
 */
import {evaluateContextualFunctionalSuitability,
  type ContextualFunctionalResult} from './contextual_functional_suitability.js';
import {assessQualitativeNeeds,
  type QualitativeNeed,type QuarantinedQualitativeFinding,type ReviewEvidenceApproval,
  type QualitativeNeedAssessment} from './phase96_qualitative_review_evidence.js';

export type FunctionalInput = Parameters<typeof evaluateContextualFunctionalSuitability>[0];
export interface QualitativeVariantEvidence {
  variantId:string;
  /** Only user-confirmed category needs may enter this assessment. */
  needs:readonly QualitativeNeed[];
  findings:readonly QuarantinedQualitativeFinding[];
  approvals:readonly ReviewEvidenceApproval[];
}
/** Additional independent judgement of whether a *reviewed* observation
 * actually violates the explicitly confirmed user's non-negotiable need.
 * Receipt is documentary until Phase92/93 identity/signature checks are wired.
 */
export interface HardConstraintAdjudication {
  variantId:string;criterionId:string;
  findingIds:string[];
  judgment:'documented_user_incompatibility'|'insufficient_for_exclusion';
  reviewerId:string;reviewReference:string;
  /** Must identify the exact user's confirmed non-negotiable requirement. */
  confirmedUserRequirementReference:string;
  reviewedAt:string;
  /** This adapter does NOT authenticate reviewer identity or check signatures. */
  independentlyAuthenticated:false;
}
export type GateOutcome='provisionally_excluded'|'hold_for_adjudication'|'conditional_comparison_only';
export interface GateReason {
  criterionId:string;
  channel:'independent_lab'|'manufacturer_declaration'|'professional_qualitative'|'missing_or_uncertain'|'user_confirmation';
  kind:'established_failure_signal'|'potential_failure'|'unresolved'|'contradiction'|'contextual_drawback'|'support';
  findingIds:string[];
  originalTestIds:string[];
  sourceRecordIds:string[];
  sourceUrls:string[];
  explanation:string;
}
export interface VariantGateResult {
  variantId:string;outcome:GateOutcome;
  /** An actual screening restriction, never a public recommendation. */
  eligibleForConditionalComparison:boolean;
  exclusions:GateReason[];holds:GateReason[];nonFatalDrawbacks:GateReason[];support:GateReason[];
  reviewedQualitativeAssessments:QualitativeNeedAssessment[];
}
export interface NonCompensatoryGateResult {
  purpose:'noncompensatory_original_evidence_research_only';
  publicationReady:false;rankingEligible:false;winnerId:null;overallProductScore:null;
  variants:[VariantGateResult,VariantGateResult];
  comparisonStatus:'no_eligible_variants'|'one_conditionally_eligible'|'multiple_conditionally_eligible';
  /** Never infer a best product from a screen. */
  researchLimitations:string[];
}
const validId=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{1,100}$/.test(s);
const validRef=(s:unknown):s is string=>typeof s==='string'&&s.trim().length>=8&&s.length<=250;
function validateAdjudications(adjudications:readonly HardConstraintAdjudication[]):void{
 if(!Array.isArray(adjudications)||adjudications.length>200)throw Error('invalid_adjudication_collection');
 const seen=new Set<string>();
 for(const a of adjudications){
  if(!a||!validId(a.variantId)||!validId(a.criterionId)||
   !['documented_user_incompatibility','insufficient_for_exclusion'].includes(a.judgment)||
   !validId(a.reviewerId)||!validRef(a.reviewReference)||
   !validRef(a.confirmedUserRequirementReference)||
   !Number.isFinite(Date.parse(a.reviewedAt))||a.independentlyAuthenticated!==false||
   !Array.isArray(a.findingIds)||!a.findingIds.length||a.findingIds.length>30||
   !a.findingIds.every(validId)||new Set(a.findingIds).size!==a.findingIds.length)
   throw Error('invalid_constraint_adjudication');
  const key=`${a.variantId}:${a.criterionId}`;
  if(seen.has(key))throw Error('conflicting_constraint_adjudications');
  seen.add(key);
 }
}
/**
 * The Phase61 result must be independently produced by the existing validated
 * pipeline; this function never accepts a source-extracted score or price.
 * A strict review hold precedes consideration of all positive advantages.
 */
export function screenNonCompensatoryEvidence(input:{
 functional:ContextualFunctionalResult;
 qualitativeByVariant:readonly QualitativeVariantEvidence[];
 adjudications:readonly HardConstraintAdjudication[];
}):NonCompensatoryGateResult{
 const {functional,qualitativeByVariant,adjudications}=input;
 if(!functional||functional.purpose!=='contextual_functional_suitability_research_only'||
  functional.publicationReady!==false||functional.rankingEligible!==false||
  functional.winnerId!==null||functional.overallProductScore!==null||
  !Array.isArray(functional.variants)||functional.variants.length!==2||
  !Array.isArray(functional.criteria)||!Array.isArray(qualitativeByVariant)||
  qualitativeByVariant.length!==2)throw Error('invalid_functional_research_input');
 validateAdjudications(adjudications);
 const variantIds=functional.variants.map(v=>v.variantId);
 if(!variantIds.every(validId)||variantIds[0]===variantIds[1]||
  new Set(qualitativeByVariant.map(v=>v.variantId)).size!==2||
  qualitativeByVariant.some(v=>!variantIds.includes(v.variantId)))throw Error('wrong_or_duplicate_variant');
 const criteriaMap=new Map(functional.criteria.map(c=>[c.needId,c]));
 if(criteriaMap.size!==functional.criteria.length)throw Error('duplicate_functional_criterion');
 for(const a of adjudications){
  if(!variantIds.includes(a.variantId)||criteriaMap.get(a.criterionId)?.importance!=='essential')
   throw Error('adjudication_not_for_confirmed_essential');
 }
 const variants=functional.variants.map((variant,i):VariantGateResult=>{
  const q=qualitativeByVariant.find(x=>x.variantId===variant.variantId)!;
  if(!Array.isArray(q.needs)||!Array.isArray(q.findings)||!Array.isArray(q.approvals))throw Error('invalid_variant_evidence');
  const findings:readonly QuarantinedQualitativeFinding[]=q.findings;
  const needs:readonly QualitativeNeed[]=q.needs;
  const approvals:readonly ReviewEvidenceApproval[]=q.approvals;
  const assessedIds=new Set<string>();
  for(const need of needs){
   if(!need||assessedIds.has(need.criterionId)||!criteriaMap.has(need.criterionId))
    throw Error('duplicate_or_unknown_qualitative_criterion');
   const criterion=criteriaMap.get(need.criterionId)!;
   if((criterion.importance==='essential'?'essential':criterion.importance==='important'?'important':'optional')!==need.importance)
    throw Error('unconfirmed_priority_change');
   assessedIds.add(need.criterionId);
  }
  if(findings.some(f=>f.exactVariantId!==variant.variantId||!assessedIds.has(f.criterionId)))
   throw Error('cross_variant_or_unmapped_qualitative_finding');
  const assessments=assessQualitativeNeeds({needs,observations:findings,approvals}).assessments;
  const exclusions:GateReason[]=[],holds:GateReason[]=[],nonFatalDrawbacks:GateReason[]=[],support:GateReason[]=[];
  const put=(arr:GateReason[],criterionId:string,channel:GateReason['channel'],kind:GateReason['kind'],
   explanation:string,ids:string[]=[],recordIds:string[]=[])=>{
   const fs=findings.filter(f=>ids.includes(f.findingId));
   arr.push({criterionId,channel,kind,explanation,findingIds:ids,
    originalTestIds:[...new Set(fs.map(f=>f.originalTestId))],
    sourceRecordIds:recordIds,
    sourceUrls:[...new Set(fs.map(f=>f.sourceUrl))]});
  };
  const reviewed=new Map<string,ReviewEvidenceApproval>(approvals.map(a=>[a.findingId,a]));
  const usedAdjudications=new Set<string>();
  for(const criterion of functional.criteria){
   const state=criterion.perVariant[i];
   if(state.variantId!==variant.variantId)throw Error('functional_variant_order_mismatch');
   if(criterion.importance!=='essential')continue;
   if(!functional.needsConfirmed){
    put(holds,criterion.needId,'user_confirmation','unresolved','User has not confirmed the non-negotiable requirements.');
    continue;
   }
   if(state.state==='reported_interval_fails'&&state.sourceType==='INDEPENDENT_EVIDENCE'){
    put(exclusions,criterion.needId,'independent_lab','established_failure_signal',
     'An independently observed expanded interval fails the documented essential threshold; no unrelated advantage offsets it.',[],state.sourceRecordId?[state.sourceRecordId]:[]);
   }else if(state.state==='declared_mismatch'){
    put(holds,criterion.needId,'manufacturer_declaration','potential_failure',
     'Declared structural incompatibility requires validation before definitive exclusion.',[],state.sourceRecordId?[state.sourceRecordId]:[]);
   }else if(!['declared_match','reported_interval_meets'].includes(state.state)){
    put(holds,criterion.needId,'missing_or_uncertain','unresolved',
     'The essential task has no demonstrated pass under the relevant tested conditions. Unknown is not a failing score.',[],state.sourceRecordId?[state.sourceRecordId]:[]);
   }
  }
  for(const assessment of assessments){
   const criterion=criteriaMap.get(assessment.criterionId)!;
   const need=needs.find(n=>n.criterionId===assessment.criterionId)!;
   const a=adjudications.find(a=>a.variantId===variant.variantId&&a.criterionId===assessment.criterionId);
   const adverseIds=assessment.contrastingFindingIds;
   if(a){
    usedAdjudications.add(a.criterionId);
    if(!functional.needsConfirmed||criterion.importance!=='essential'||!need.avoidAdverseFinding||
     !adverseIds.length||a.findingIds.some(id=>!adverseIds.includes(id))||
     a.findingIds.some(id=>{
       const f=findings.find(f=>f.findingId===id)!;
       const ap=reviewed.get(id);
       return f.basis!=='hands_on_observation'||!f.methodologyReference||
        !ap||ap.reviewerId===a.reviewerId||Date.parse(a.reviewedAt)<=Date.parse(ap.reviewedAt)||
        ap.semanticFaithfulness!=='confirmed'||ap.methodAssessment!=='documented'||
        ap.adequacyAssessment!=='documented'||ap.criterionImplication!=='concerns'||
        ap.validatedSourceSha256!==f.sourceSha256;
     }))throw Error('unsubstantiated_adjudication');
   }
   if(assessment.status==='conflicting_evidence'){
    put(holds,assessment.criterionId,'professional_qualitative','contradiction',
     'Original tests disagree under apparently matching circumstances; independent reconciliation required.',
     [...assessment.supportingFindingIds,...adverseIds]);
   }else if(assessment.status==='potential_essential_constraint_conflict'){
    if(a?.judgment==='documented_user_incompatibility'){
     put(exclusions,assessment.criterionId,'professional_qualitative','established_failure_signal',
      'Independent assessor documented an applicable observed failure against the confirmed hard requirement; provisionally excluded pending operational approval.',a.findingIds);
    }else{
     put(holds,assessment.criterionId,'professional_qualitative','potential_failure',
      'Adverse original test is relevant to a non-negotiable need but no separately adjudicated exclusion is established.',adverseIds);
    }
   }else if(assessment.status==='contextual_concern'||assessment.status==='contextual_tradeoff'){
    put(nonFatalDrawbacks,assessment.criterionId,'professional_qualitative','contextual_drawback',
     'Observed drawback may matter in this context; it is not automatically a disqualifier.',adverseIds);
   }else if(assessment.status==='contextual_support'){
    put(support,assessment.criterionId,'professional_qualitative','support',
     'A reviewed contextual observation supports this need but does not prove universal suitability.',assessment.supportingFindingIds);
   }else if(criterion.importance==='essential'&&assessment.status==='unresolved_methodology'){
    put(holds,assessment.criterionId,'professional_qualitative','unresolved',
     'A relevant professional finding has not passed independent semantic/methodological assessment.');
   }
  }
  for(const a of adjudications.filter(a=>a.variantId===variant.variantId)){
   if(!usedAdjudications.has(a.criterionId))throw Error('unmatched_constraint_adjudication');
  }
  if(!functional.criteria.some(c=>c.importance==='essential')){
   put(holds,'requirements','user_confirmation','unresolved','No confirmed essential criteria are available.');
  }
  const outcome:GateOutcome=exclusions.length?'provisionally_excluded':
   holds.length?'hold_for_adjudication':'conditional_comparison_only';
  return {variantId:variant.variantId,outcome,
   eligibleForConditionalComparison:outcome==='conditional_comparison_only',
   exclusions,holds,nonFatalDrawbacks,support,reviewedQualitativeAssessments:assessments};
 }) as [VariantGateResult,VariantGateResult];
 const n=variants.filter(v=>v.eligibleForConditionalComparison).length;
 return {purpose:'noncompensatory_original_evidence_research_only',publicationReady:false,
  rankingEligible:false,winnerId:null,overallProductScore:null,variants,
  comparisonStatus:n===0?'no_eligible_variants':n===1?'one_conditionally_eligible':'multiple_conditionally_eligible',
  researchLimitations:[
   'No positive observation, score, feature or trade-off overrides a documented essential failure.',
   'Single subjective reports, contradictory tests and missing evidence are not automatic exclusions.',
   'Adjudication requires a distinct declared reviewer and later review date; identity and signatures are NOT authenticated. No public ranking or winner is authorized.',
   'Criteria, test identity, rights and exact user context require independent verification.',
   'Source methodology and relevance are case-specific: CERQual/MCDA do not validate this product gate.'
  ]};
}
export function evaluateNonCompensatorySuitability(input:{
 functionalInput:FunctionalInput;
 qualitativeByVariant:readonly QualitativeVariantEvidence[];
 adjudications:readonly HardConstraintAdjudication[];
}):NonCompensatoryGateResult{
 return screenNonCompensatoryEvidence({
  functional:evaluateContextualFunctionalSuitability(input.functionalInput),
  qualitativeByVariant:input.qualitativeByVariant,adjudications:input.adjudications});
}
