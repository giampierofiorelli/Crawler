/** Phase 168: a conservative, qualitative companion to the Phase 167 quantity
 * research bridge. Reuses Phase 165 scope and Phase 96 evidence assessment.
 * Reviewer/user receipts are documentary assertions, NOT authenticated facts.
 * NEVER connects to production rankers, automatic exclusions or science DB.
 */
import {createHash} from 'node:crypto';
import type {RequestOutput164} from './phase164_user_request_journey.js';
import {assessQualitativeNeeds,type QuarantinedQualitativeFinding,
 type ReviewEvidenceApproval,type QualitativeNeed,type QualitativeNeedAssessment}
 from './phase96_qualitative_review_evidence.js';

const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,80}$/.test(s);
const isHash=(s:unknown):s is string=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
export type Meaning168='required'|'excluded'|'preferred'|'optional';
export interface FacetMapping168 {
 categoryId:string;aspectId:string;criterionId:string;
 /** Binary presence/absence is NOT equivalent to performance or sentiment. */
 evidenceSemantics:'feature_presence'|'performance_quality';
 /** Documentary ontology review; this adapter cannot authenticate a reviewer. */
 categoryReviewReference:string;
}
export interface UserConfirmation168 {
 confirmationId:string;turnId:string;questionSha256:string;aspectId:string;
 meaning:Meaning168;exactUserPhrase:string;
 /** Must be supplied by a separate explicit user-confirmation action. */
 confirmationEventReference:string;
 /** Qualifiers are not inferred from unstructured prose by this adapter. */
 confirmedContext:Record<string,string>;
}
export type NeedDisposition168='pending_user_confirmation'|'ambiguous_user_scope'|
 'unmapped_reviewed_facet'|'optional_not_requirement'|'qualitative_test_research'|
 'structural_feature_verification'|'unresolved_excluded_performance';
export interface QualitativeRequirement168 {
 id:string;aspectId:string;criterionId:string|null;variantIndependent:true;
 mentionSpans:readonly {start:number;end:number;literal:string;sha256:string}[];
 proposedMeaning:Meaning168|null;status:NeedDisposition168;
 userConfirmationDocumented:boolean;userConfirmationAuthenticated:false;
 confirmationId:string|null;method:'feature_presence'|'performance_quality'|null;
 researchAction:string;rankingAuthorized:false;
}
export interface VariantQualitativePreview168 {
 variantId:string;assessments:readonly QualitativeNeedAssessment[];
 sourceFindingIds:readonly string[];
 originalReviewReceiptsAuthenticated:false;
 eligibleForRanking:false;eligibleForExclusion:false;
}
export interface QualitativePlan168 {
 phase:168;questionSha256:string;categoryId:string;
 requirements:readonly QualitativeRequirement168[];
 variantPreviews:readonly VariantQualitativePreview168[];
 researchObligations:readonly string[];
 untrustedDocumentaryConfirmations:number;
 independentUserConfirmationAuthentication:false;
 independentlyAuthenticatedReviewEvidence:false;
 publicationAuthorized:false;rankingAuthorized:false;
 candidateOnly:true;
}

function checkContext(c:unknown):c is Record<string,string>{
 return !!c&&typeof c==='object'&&!Array.isArray(c)&&
 Object.keys(c).length>0&&Object.keys(c).length<=8&&Object.entries(c).every(([k,v])=>
  id(k)&&typeof v==='string'&&v.length>0&&v.length<=100);
}
export function planQualitativeNeedResearch168(input:{
 question:string;request:RequestOutput164;facets:readonly FacetMapping168[];
 confirmations?:readonly UserConfirmation168[];
 /** These are Phase96 QUARANTINED reports; no source authentication here. */
 variantEvidence?:readonly {variantId:string;
  findings:readonly QuarantinedQualitativeFinding[];
  approvals:readonly ReviewEvidenceApproval[]}[];
}):QualitativePlan168 {
 const {question,request,facets}=input;
 const confirmations:readonly UserConfirmation168[]=input.confirmations??[];
 const variants:readonly {variantId:string;findings:readonly QuarantinedQualitativeFinding[];
  approvals:readonly ReviewEvidenceApproval[]}[]=input.variantEvidence??[];
 if(typeof question!=='string'||question.length<3||question.length>4000||
  !request||request.phase!==164||!isHash(request.requestSha256)||
  sha(question)!==request.requestSha256||request.turnId!==request.session?.history?.at(-1)?.turnId||
  request.session.history.at(-1)?.questionSha256!==request.requestSha256||
  !request.categoryId||request.session.activeCategoryId!==request.categoryId||
  !request.frame||request.frame.categoryId!==request.categoryId||
  request.frame.questionSha256!==request.requestSha256||
  !Array.isArray(facets)||facets.length>150||!Array.isArray(confirmations)||confirmations.length>150||
  !Array.isArray(variants)||variants.length>40||
  !facets.every(f=>f&&id(f.categoryId)&&f.categoryId===request.categoryId&&
   id(f.aspectId)&&id(f.criterionId)&&['feature_presence','performance_quality'].includes(f.evidenceSemantics)&&
   typeof f.categoryReviewReference==='string'&&f.categoryReviewReference.length>=8)||
  new Set(facets.map(f=>f.aspectId)).size!==facets.length||
  new Set(facets.map(f=>f.criterionId)).size!==facets.length||
  variants.some(v=>!v||!id(v.variantId)||!Array.isArray(v.findings)||!Array.isArray(v.approvals))||
  new Set(variants.map(v=>v.variantId)).size!==variants.length)
  throw Error('invalid_phase168_request_mapping_or_variant');
 const audit=request.contextAudit165;
 const occur=audit?.occurrences??[];
 if(audit&&(audit.phase!==165||audit.originalUserMeaningVerified!==false||
  audit.rankingAuthorized!==false||!Array.isArray(audit.occurrences)||
  audit.occurrences.some(o=>!id(o.aspectId)||!Number.isSafeInteger(o.start)||
   !Number.isSafeInteger(o.end)||o.start<0||o.end>question.length||o.end<=o.start||
   question.slice(o.start,o.end)!==o.literal)))
   throw Error('invalid_phase168_question_context');
 const byAspect=new Map(facets.map(f=>[f.aspectId,f]));
 // Confirmation events cannot manufacture meaning when the source occurrence
 // was unresolved, disputed or absent; nor can they apply to another turn.
 const relevantAspects=new Set(occur.map(o=>o.aspectId));
 const confirmationsByAspect=new Map<string,UserConfirmation168>();
 for(const c of confirmations){
  if(!c||!id(c.confirmationId)||!id(c.aspectId)||!relevantAspects.has(c.aspectId)||
   !id(c.turnId)||c.turnId!==request.turnId||c.questionSha256!==request.requestSha256||
   !['required','excluded','preferred','optional'].includes(c.meaning)||
   typeof c.exactUserPhrase!=='string'||!occur.some(o=>o.aspectId===c.aspectId&&o.literal===c.exactUserPhrase)||
   typeof c.confirmationEventReference!=='string'||c.confirmationEventReference.length<8||
   !checkContext(c.confirmedContext)||confirmationsByAspect.has(c.aspectId))
   throw Error('unmatched_or_replayed_phase168_confirmation');
  confirmationsByAspect.set(c.aspectId,c);
 }
 const obligations=new Set<string>(request.research.obligations);
 const groups=new Map<string,typeof occur>();
 for(const o of occur)groups.set(o.aspectId,[...(groups.get(o.aspectId)??[]),o]);
 const requirements:QualitativeRequirement168[]=[];
 const checkedNeeds:{criterionId:string;need:QualitativeNeed}[]=[];
 for(const [aspectId,mentions] of groups){
  const mapping=byAspect.get(aspectId);
  const meanings=new Set(mentions.map(m=>m.proposedMeaning));
  const contextualDispute=!!audit?.issues.some(i=>i.aspectId===aspectId&&
    (i.code==='conflicting_modifiers'||i.needsUserClarification));
  // A separate unresolved numeric width bound must not invert or suppress
  // a clear qualitative requirement. Scalar negation remains a global hold.
  const globalMeaningHazard=!!audit?.issues.some(i=>i.aspectId===null&&
   i.needsUserClarification&&i.code==='ambiguous_scalar_negation');
  const unambiguous=meanings.size===1&&!meanings.has('unresolved')&&
   !contextualDispute&&!globalMeaningHazard;
  const meaning=unambiguous?[...meanings][0] as Meaning168:null;
  const confirmation=confirmationsByAspect.get(aspectId);
  if(confirmation&&(!meaning||confirmation.meaning!==meaning))
   throw Error('confirmation_cannot_resolve_unverified_scope_168');
  let status:NeedDisposition168='pending_user_confirmation';
  let action='confirm_exact_user_constraint';
  if(!mapping){status='unmapped_reviewed_facet';action='review_category_criterion_mapping';}
  else if(!meaning){status='ambiguous_user_scope';action='clarify_polarity_strength_and_scope';}
  else if(meaning==='optional'){status='optional_not_requirement';action='preserve_optionality_without_exclusion';}
  else if(!confirmation){status='pending_user_confirmation';action='obtain_explicit_user_confirmation_event';}
  else if(mapping.evidenceSemantics==='feature_presence'){
   status='structural_feature_verification';
   action=meaning==='excluded'?'verify_feature_absent_for_exact_variant':
    'verify_feature_present_for_exact_variant';
  }else if(meaning==='excluded'){
   status='unresolved_excluded_performance';
   action='clarify_direction_of_excluded_performance';
  }else {
   status='qualitative_test_research';
   action='independently_review_contextual_original_test_and_protocol';
   checkedNeeds.push({criterionId:mapping!.criterionId,need:{criterionId:mapping!.criterionId,
    importance:meaning==='required'?'essential':'important',
    context:{...confirmation.confirmedContext},
    avoidAdverseFinding:meaning==='required'}});
  }
  obligations.add(`${action}_${aspectId}`);
  requirements.push({id:`qual168_${aspectId}`,aspectId,criterionId:mapping?.criterionId??null,
   variantIndependent:true,mentionSpans:mentions.map(m=>({start:m.start,end:m.end,literal:m.literal,
    sha256:sha(m.literal)})).sort((a,b)=>a.start-b.start),proposedMeaning:meaning,
   status,userConfirmationDocumented:!!confirmation&&!!meaning,
   userConfirmationAuthenticated:false,confirmationId:confirmation?.confirmationId??null,
   method:mapping?.evidenceSemantics??null,researchAction:action,rankingAuthorized:false});
 }
 // No unspecified facet, confirmation or source may authorize a decision.
 for(const c of confirmations)if(!groups.has(c.aspectId))throw Error('orphan_phase168_confirmation');
 const previews:VariantQualitativePreview168[]=variants.map(variant=>{
  const {variantId,findings,approvals}=variant;
  if(findings.some((f:QuarantinedQualitativeFinding)=>f.exactVariantId!==variantId)||
   approvals.some((a:ReviewEvidenceApproval)=>!findings.some((f:QuarantinedQualitativeFinding)=>f.findingId===a.findingId)))
   throw Error('cross_variant_or_orphaned_qualitative_evidence_168');
  const needs=checkedNeeds.map(n=>n.need);
  const assessed=assessQualitativeNeeds({needs,observations:findings,approvals});
  for(const n of assessed.assessments){
   obligations.add(`revalidate_authenticity_and_protocol_${variantId}_${n.criterionId}`);
   if(n.status==='no_evidence'||n.status==='unresolved_methodology'||n.status==='not_applicable')
    obligations.add(`seek_relevant_independent_review_${variantId}_${n.criterionId}`);
   if(n.status==='conflicting_evidence'||n.status==='potential_essential_constraint_conflict')
    obligations.add(`adjudicate_conflicting_or_adverse_evidence_${variantId}_${n.criterionId}`);
  }
  return {variantId,assessments:assessed.assessments,
   sourceFindingIds:findings.map((f:QuarantinedQualitativeFinding)=>f.findingId).sort(),
   originalReviewReceiptsAuthenticated:false as const,
   eligibleForRanking:false as const,eligibleForExclusion:false as const};
 });
 return {phase:168,questionSha256:sha(question),categoryId:request.categoryId,
  requirements:requirements.sort((a,b)=>a.aspectId.localeCompare(b.aspectId)),
  variantPreviews:previews.sort((a,b)=>a.variantId.localeCompare(b.variantId)),
  researchObligations:[...obligations].sort(),
  untrustedDocumentaryConfirmations:confirmations.length,
  independentUserConfirmationAuthentication:false,
  independentlyAuthenticatedReviewEvidence:false,
  publicationAuthorized:false,rankingAuthorized:false,candidateOnly:true};
}
