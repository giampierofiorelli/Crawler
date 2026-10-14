/**
 * Phase171 — deterministic original-source conflict workbench, RESEARCH ONLY.
 * Takes already admitted Phase170 research, re-verifies the Phase169 receipt
 * signatures and bindings using the operator-provided original inputs, and
 * groups provisional measurements by exact product variant, user requirement,
 * original document, editorial family, protocol and test condition.
 *
 * Editorial families and protocol identities below are DECLARATIONS, not
 * independent validation. Never publish, exclude or rank from these results.
 */
import {createHash} from 'node:crypto';
import {auditQuantifiedRequest166} from './phase166_quantified_evidence_bridge.js';
import {planSignedSuitabilityResearch169,type SourceAttestation169}
 from './phase169_signed_suitability_research.js';
import type {AdmissionInput170,ResearchAdmission170} from './phase170_durable_research_admission.js';
import type {Preview167,CandidateMeasure167} from './phase167_source_variant_quantity_adapter.js';

const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,100}$/.test(s);
const unique=(xs:readonly string[])=>[...new Set(xs)].sort();

/** Operator-entered documentary metadata: no authenticity is inferred. */
export interface DeclaredMethodLineage171 {
 candidateId:string;sourceId:string;originalDocumentId:string;documentSha256:string;
 /** Multiple URLs under one publisher/test family are not independent votes. */
 editorialFamilyId:string|null;
 /** Both method and conditions must match for direct comparison. */
 protocolId:string|null;protocolVersion:string|null;conditionId:string|null;
 familyIndependentlyAuthenticated:false;methodIndependentlyValidated:false;
 sourceRightsIndependentlyVerified:false;
}
export type SourceDisposition171=
 'user_scope_unresolved'|'user_confirmation_pending'|'original_evidence_missing'|
 'documentary_review_missing'|'method_lineage_missing'|
 'republication_across_declared_families'|'conflict_within_editorial_family'|
 'different_methods_not_directly_comparable'|
 'conflict_under_declared_same_method'|'single_editorial_family_only'|
 'apparent_cross_family_agreement_unverified'|
 'qualitative_evidence_or_context_conflict'|'qualitative_adverse_signal'|
 'qualitative_research_pending'|'optional_requirement';
export interface CandidateTrace171 {
 candidateId:string;sourceId:string;originalDocumentId:string;documentSha256:string;
 variantId:string;metric:string;canonicalValue:number;canonicalUnit:string;
 potentialFit:boolean;editorialFamilyId:string|null;
 protocolId:string|null;protocolVersion:string|null;conditionId:string|null;
 signedDocumentaryReceiptId:string;
}
export interface RequirementConflict171 {
 requirementId:string;kind:'quantity'|'qualitative';variantId:string|null;
 constraintId:string;disposition:SourceDisposition171;
 /** These are unique DECLARED families, not verified independent laboratories. */
 distinctDeclaredFamilies:number;distinctOriginalDocuments:number;
 supportingCandidateIds:readonly string[];opposingCandidateIds:readonly string[];
 originalDocumentHashes:readonly string[];candidateTraces:readonly CandidateTrace171[];
 researchTasks:readonly string[];
 userIdentityVerified:false;sourceFamiliesIndependentlyVerified:false;
 methodsIndependentlyValidated:false;rightsIndependentlyVerified:false;
 eligibleForRanking:false;eligibleForExclusion:false;
}
export interface ConflictWorkbench171 {
 phase:171;questionSha256:string;sessionId:string;revisionFingerprint:string;
 items:readonly RequirementConflict171[];tasks:readonly string[];
 evaluatedWithRealIndependentReview:false;candidateOnly:true;
 userIdentityVerified:false;sourceIndependenceVerified:false;
 rankingAuthorized:false;exclusionsAuthorized:false;publicationAuthorized:false;
}
function fit(c:CandidateMeasure167,d:ReturnType<typeof auditQuantifiedRequest166>['candidates'][number]):boolean {
 const v=c.canonicalValue!;
 switch(d.direction){
  case 'strict_lt':return v<d.maximum!;
  case 'lte':return v<=d.maximum!;
  case 'strict_gt':return v>d.minimum!;
  case 'gte':return v>=d.minimum!;
  case 'range_inclusive':return v>=d.minimum!&&v<=d.maximum!;
  default:throw Error('phase171_unresolved_numeric_comparator');
 }
}
function requiredTask(disposition:SourceDisposition171):string {
 const tasks:Record<SourceDisposition171,string>={
  user_scope_unresolved:'clarify_original_user_requirement',
  user_confirmation_pending:'obtain_authenticated_explicit_user_confirmation',
  original_evidence_missing:'find_original_test_for_exact_variant',
  documentary_review_missing:'review_original_test_method_variant_and_rights',
  method_lineage_missing:'identify_original_editorial_family_and_measurement_conditions',
  republication_across_declared_families:'trace_republished_document_to_one_original_test',
  conflict_within_editorial_family:'reconcile_inconsistent_measurements_in_same_editorial_family',
  different_methods_not_directly_comparable:'compare_protocols_and_conditions_before_interpreting_disagreement',
  conflict_under_declared_same_method:'independently_adjudicate_disagreement_in_matching_protocol',
  single_editorial_family_only:'seek_truly_independent_original_test',
  apparent_cross_family_agreement_unverified:'verify_independence_methods_and_uncertainty_before_synthesis',
  qualitative_evidence_or_context_conflict:'review_qualitative_method_context_and_original_passages',
  qualitative_adverse_signal:'investigate_potential_essential_user_constraint_failure',
  qualitative_research_pending:'obtain_context_matched_independent_qualitative_test',
  optional_requirement:'preserve_optionality_do_not_filter'
 };
 return tasks[disposition];
}
/** Never consumes receipts in the ledger: Phase170 must have admitted them first.
 * The caller MUST be a trusted server boundary, not a browser or user payload.
 */
export function reconcileOriginalSourceConflicts171(input:{
 admitted:ResearchAdmission170;originalVerifiedInputs:AdmissionInput170;
 quantitative?:Preview167|null;declaredLineage?:readonly DeclaredMethodLineage171[];
}):ConflictWorkbench171 {
 const {admitted,originalVerifiedInputs}=input;
 if(!admitted||admitted.phase!==170||admitted.state!=='admitted_research_only'||
  admitted.rankingAuthorized!==false||admitted.exclusionsAuthorized!==false||
  admitted.scientificIndependenceVerified!==false||admitted.humanIdentityVerified!==false||
  admitted.publicationAuthorized!==false||!originalVerifiedInputs||
  sha(originalVerifiedInputs.question)!==admitted.signedResearch?.questionSha256)
  throw Error('invalid_phase171_trusted_research_envelope');
 // Re-run cryptographic role/scope, document and user-turn validation; not a
 // second ledger admission. This also prevents a forged signedResearch object.
 const verified=planSignedSuitabilityResearch169({...originalVerifiedInputs,
  previouslyAcceptedReceiptIds:new Set<string>()});
 if(JSON.stringify(verified)!==JSON.stringify(admitted.signedResearch)||
  admitted.revisionFingerprint!==verified.revisionFingerprint||
  admitted.sessionId!==originalVerifiedInputs.request.session.sessionId||
  admitted.epoch!==originalVerifiedInputs.request.session.epoch||
  admitted.revision!==originalVerifiedInputs.request.session.revision||
  JSON.stringify([...admitted.receiptIds].sort())!==
  JSON.stringify(verified.receiptAudits.map(r=>r.receiptId).sort()))
  throw Error('phase171_research_admission_integrity_mismatch');
 const quantitative=input.quantitative??null;
 if(quantitative&&(!originalVerifiedInputs.quantitative||
  JSON.stringify(quantitative)!==JSON.stringify(originalVerifiedInputs.quantitative)||
  quantitative.phase!==167||quantitative.sourceQuestionSha256!==verified.questionSha256||
  quantitative.productRankingAuthorized!==false||quantitative.candidateOnly!==true))
  throw Error('phase171_wrong_or_modified_original_measurements');
 if(!quantitative&&originalVerifiedInputs.quantitative)throw Error('phase171_missing_quantitative_preview');
 const candidates=quantitative?.candidateMeasures??[];
 const candidateMap=new Map(candidates.map(c=>[c.id,c]));
 if(candidateMap.size!==candidates.length)throw Error('phase171_duplicate_candidates');
 const declarations=input.declaredLineage??[];
 if(!Array.isArray(declarations)||declarations.length>400)throw Error('phase171_bad_lineage_list');
 const lineage=new Map<string,DeclaredMethodLineage171>();
 for(const x of declarations){
  const c=candidateMap.get(x?.candidateId);
  if(!c||lineage.has(x.candidateId)||x.sourceId!==c.sourceId||
   x.originalDocumentId!==c.originalDocumentId||x.documentSha256!==c.documentSha256||
   x.familyIndependentlyAuthenticated!==false||x.methodIndependentlyValidated!==false||
   x.sourceRightsIndependentlyVerified!==false||
   ![x.editorialFamilyId,x.protocolId,x.protocolVersion,x.conditionId].every(v=>v===null||id(v)))
   throw Error('phase171_lineage_not_bound_to_original_candidate');
  lineage.set(c.id,x);
 }
 const signed=new Map<string,{receiptId:string,protocolReference:string}>();
 for(const r of originalVerifiedInputs.receipts){
  const p=r.payload;
  if(p.kind!=='source_candidate'||p.target.kind!=='quantity')continue;
  if(p.methodReview==='documented'&&p.variantReview==='documented'&&p.rightsReview==='documented'){
   signed.set(p.target.candidateId,{receiptId:r.receiptId,protocolReference:p.protocolReference});
  }
 }
 const quant=auditQuantifiedRequest166(originalVerifiedInputs.question);
 const quantityById=new Map(quant.candidates.map(q=>[q.id,q]));
 const items:RequirementConflict171[]=[];
 for(const req of verified.requirements){
  let disposition:SourceDisposition171;const traces:CandidateTrace171[]=[];
  if(req.kind==='qualitative'){
   disposition=req.state==='optional_not_required'?'optional_requirement':
    req.state==='conflicting_candidates'?'qualitative_evidence_or_context_conflict':
    req.state==='signed_qualitative_concern'?'qualitative_adverse_signal':
    req.state==='unresolved_requirement'?'user_scope_unresolved':
    req.state==='pending_user_attestation'?'user_confirmation_pending':
    'qualitative_research_pending';
  }else{
   const q=quantityById.get(req.aspectOrQuantityId);
   if(!q)throw Error('phase171_unknown_original_user_quantity');
   const pairs=(quantitative?.potentialMatches??[]).filter(m=>
    m.quantityId===req.aspectOrQuantityId&&m.variantId===req.variantId);
   if(new Set(pairs.map(m=>m.candidateMeasureId)).size!==pairs.length)
    throw Error('phase171_duplicate_source_matches');
   for(const match of pairs){
    const c=candidateMap.get(match.candidateMeasureId),r=signed.get(match.candidateMeasureId);
    if(!c||c.productId!==match.productId||c.variantId!==match.variantId||
     c.metric!==q.metric||c.canonicalUnit!==q.canonicalUnit||
     !Number.isFinite(c.canonicalValue)||c.disposition!=='candidate_pending_scientific_review'||
     fit(c,q)!==match.potentialNumericFit)
     throw Error('phase171_tampered_or_cross_variant_measurement');
    if(!r)continue; // Unreviewed candidates cannot vote in documentary comparisons.
    const d=lineage.get(c.id);
    traces.push({candidateId:c.id,sourceId:c.sourceId,originalDocumentId:c.originalDocumentId,
     documentSha256:c.documentSha256,variantId:c.variantId!,metric:c.metric!,
     canonicalValue:c.canonicalValue!,canonicalUnit:c.canonicalUnit!,
     potentialFit:fit(c,q),editorialFamilyId:d?.editorialFamilyId??null,
     protocolId:d?.protocolId??null,protocolVersion:d?.protocolVersion??null,
     conditionId:d?.conditionId??null,signedDocumentaryReceiptId:r.receiptId});
   }
   traces.sort((a,b)=>a.candidateId.localeCompare(b.candidateId));
   if(q.scope==='unresolved'||req.state==='unresolved_requirement')disposition='user_scope_unresolved';
   else if(!req.userAttestationVerified)disposition='user_confirmation_pending';
   else if(!pairs.length)disposition='original_evidence_missing';
   else if(!traces.length)disposition='documentary_review_missing';
   else if(traces.some(t=>!t.editorialFamilyId||!t.protocolId||!t.protocolVersion||!t.conditionId))
    disposition='method_lineage_missing';
   else{
    const documentGroups=new Map<string,Set<string>>();
    const familyGroups=new Map<string,Set<boolean>>();
    const methodGroups=new Map<string,Set<boolean>>();
    for(const t of traces){
     const family=t.editorialFamilyId!;
     documentGroups.set(t.documentSha256,new Set([...(documentGroups.get(t.documentSha256)??[]),family]));
     familyGroups.set(family,new Set([...(familyGroups.get(family)??[]),t.potentialFit]));
     const method=JSON.stringify([t.protocolId,t.protocolVersion,t.conditionId]);
     methodGroups.set(method,new Set([...(methodGroups.get(method)??[]),t.potentialFit]));
    }
    if([...documentGroups.values()].some(s=>s.size>1))disposition='republication_across_declared_families';
    else if([...methodGroups.values()].some(s=>s.size>1))
     disposition=[...familyGroups.values()].some(s=>s.size>1)?
      'conflict_within_editorial_family':'conflict_under_declared_same_method';
    else if(methodGroups.size>1)disposition='different_methods_not_directly_comparable';
    else if(familyGroups.size===1)disposition='single_editorial_family_only';
    else disposition='apparent_cross_family_agreement_unverified';
   }
  }
  const families=unique(traces.flatMap(t=>t.editorialFamilyId?[t.editorialFamilyId]:[]));
  const task=requiredTask(disposition);
  const unmet=unique([...req.missingChecks,task]);
  items.push({requirementId:req.id,kind:req.kind,variantId:req.variantId,
   constraintId:req.aspectOrQuantityId,disposition,
   distinctDeclaredFamilies:families.length,
   distinctOriginalDocuments:unique(traces.map(t=>t.documentSha256)).length,
   supportingCandidateIds:traces.filter(t=>t.potentialFit).map(t=>t.candidateId),
   opposingCandidateIds:traces.filter(t=>!t.potentialFit).map(t=>t.candidateId),
   originalDocumentHashes:unique(traces.map(t=>t.documentSha256)),candidateTraces:traces,
   researchTasks:unmet,userIdentityVerified:false,sourceFamiliesIndependentlyVerified:false,
   methodsIndependentlyValidated:false,rightsIndependentlyVerified:false,
   eligibleForRanking:false,eligibleForExclusion:false});
 }
 items.sort((a,b)=>a.requirementId.localeCompare(b.requirementId));
 return {phase:171,questionSha256:verified.questionSha256,sessionId:admitted.sessionId,
  revisionFingerprint:verified.revisionFingerprint,items,
  tasks:unique(items.flatMap(i=>i.researchTasks)),evaluatedWithRealIndependentReview:false,
  candidateOnly:true,userIdentityVerified:false,sourceIndependenceVerified:false,
  rankingAuthorized:false,exclusionsAuthorized:false,publicationAuthorized:false};
}
