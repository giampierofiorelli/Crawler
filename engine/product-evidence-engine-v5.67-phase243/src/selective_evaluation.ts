/** Phase 67. Independent-label evaluation harness for the Phase 66 RESEARCH ONLY gate.
 * This module cannot establish expert independence, legal rights, source authenticity,
 * dataset representativeness, or model accuracy without actual external assessment.
 * Synthetic/constructed cases MUST never be treated as a gold-standard evaluation.
 * No Amazon review data, prices, ranking modifications, crawling, or LLM calls.
 */
import {decideSelectiveUserReviewResearch,
 type UnresolvedQuestion, type ReviewSourceGrant, type SearchDecision} from './selective_user_evidence.js';

export const DECISIONS:readonly SearchDecision[] = [
 'no_search_sufficient_professional_evidence','clarify_user_need_first',
 'professional_test_required','not_decision_material','rights_blocked',
 'candidate_research_only'
];
export type QuestionOrigin = 'constructed_scenario'|'real_user_question_consented';
export interface EvaluationCase {
 caseId:string;
 category:string;
 question:UnresolvedQuestion;
 grants:ReviewSourceGrant[];
 asOf:string;
 origin:QuestionOrigin;
 /** URL or agreed internal record for human verification; never a claim that it was checked. */
 sourceReference:string;
 split:'development'|'held_out';
}
export interface BlindAnnotation {
 caseId:string;
 assessorId:string;
 label:SearchDecision;
 rationale:string;
 sourceReferences:string[];
 assessmentDate:string;
 /** Self-attestation, NOT independent confirmation by software. */
 blindedToAlgorithm:boolean;
}
export interface Adjudication {
 caseId:string;
 adjudicatorId:string;
 label:SearchDecision;
 rationale:string;
 adjudicatedAt:string;
 sourceReferences:string[];
}
export interface EvaluationRow {
 caseId:string;category:string;origin:QuestionOrigin;split:'development'|'held_out';
 predicted:SearchDecision;
 reference:SearchDecision|null;
 referenceStatus:'not_annotated'|'single_annotation'|'disagreement_requires_adjudication'|'agreed_by_two'|'adjudicated';
 /** Never expresses a probabilistic model confidence. */
 match:boolean|null;
}
export interface EvaluationReport {
 purpose:'selective_review_research_gate_research_only';
 publicationReady:false;
 humanValidationVerifiedBySoftware:false;
 caseCount:number;
 annotatedCaseCount:number;
 evaluatedCaseCount:number;
 rows:EvaluationRow[];
 /** Null until at least one TWO-ASSESSOR agreed or adjudicated reference exists. */
 metrics:null|{
  sampleSize:number;
  accuracy:number;
  matches:number;
  confusion:Array<{reference:SearchDecision;predicted:SearchDecision;count:number}>;
  perDecision:Array<{decision:SearchDecision;support:number;truePositive:number;falsePositive:number;falseNegative:number;precision:number|null;recall:number|null}>;
  /** Descriptive only: NOT validated performance, CIs, or a deployment pass decision. */
  warning:string;
 };
 limitations:string[];
}
const safeId=(v:unknown):v is string=>typeof v==='string'&&/^[a-z][a-z0-9_]{2,80}$/.test(v);
const isoDate=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().startsWith(s);
const labelOk=(s:unknown):s is SearchDecision=>DECISIONS.includes(s as SearchDecision);
const limitation=[
 'Constructed scenarios are software tests, not representative user data or independent human validation.',
 'Two assessor IDs and blinded-attestation fields are metadata; software cannot verify identities, independence or blinding.',
 'No threshold, confidence interval or claim of generalization is justified by a small convenience sample.',
 'A source-rights grant contained in a fixture does not prove a real license or permission for AI processing.',
 'No user reviews are acquired; Amazon review data never enters this evaluation or the ranking.'
];
export function createBlindAnnotationTemplate(cases:readonly EvaluationCase[]):Array<{
 caseId:string;category:string;question:UnresolvedQuestion;
 evidenceAccess:string;rightsDocuments:Array<{sourceId:string;documentUrl:string}>;annotationRequired:['search_decision','written_rationale','source_references'];
}> {
 validateCases(cases);
 return cases.map(c=>({caseId:c.caseId,category:c.category,question:c.question,
  rightsDocuments:c.grants.map(g=>({sourceId:g.sourceId,documentUrl:g.approvedDocumentUrl})),
  evidenceAccess:c.sourceReference,annotationRequired:['search_decision','written_rationale','source_references']}));
}
function validateCases(cases:readonly EvaluationCase[]):void {
 if(!Array.isArray(cases)||cases.length>1000)throw Error('Invalid evaluation cases');
 const ids=new Set<string>(); const qids=new Set<string>();
 for(const c of cases){
  if(!c||!safeId(c.caseId)||ids.has(c.caseId)||!safeId(c.category)||
   !c.question||!safeId(c.question.id)||qids.has(c.question.id)||
   !['constructed_scenario','real_user_question_consented'].includes(c.origin)||
   !['development','held_out'].includes(c.split)||
   typeof c.sourceReference!=='string'||c.sourceReference.trim().length<6||!isoDate(c.asOf)||
   !Array.isArray(c.grants))throw Error('Invalid or duplicate evaluation case');
  ids.add(c.caseId);qids.add(c.question.id);
 }
}
export function evaluateSelectiveGate(input:{
 cases:readonly EvaluationCase[];
 annotations?:readonly BlindAnnotation[];
 adjudications?:readonly Adjudication[];
}):EvaluationReport {
 const {cases,annotations=[],adjudications=[]}=input;
 validateCases(cases);
 const allowed=new Set(cases.map(c=>c.caseId));
 const byCase=new Map<string,BlindAnnotation[]>();
 for(const a of annotations){
  if(!a||!allowed.has(a.caseId)||!safeId(a.assessorId)||!labelOk(a.label)||
    !isoDate(a.assessmentDate)||!a.blindedToAlgorithm||!a.rationale||a.rationale.trim().length<12||
    !Array.isArray(a.sourceReferences)||!a.sourceReferences.length||a.sourceReferences.some(x=>typeof x!=='string'||!x.trim()))
   throw Error('Invalid or non-blinded annotation metadata');
  const list=byCase.get(a.caseId)??[];
  if(list.some(x=>x.assessorId===a.assessorId)||list.length>=2)throw Error('Duplicate or excessive annotation');
  list.push(a);byCase.set(a.caseId,list);
 }
 const adjudicated=new Map<string,Adjudication>();
 for(const a of adjudications){
  const pair=byCase.get(a?.caseId)??[];
  if(!a||!allowed.has(a.caseId)||!safeId(a.adjudicatorId)||!labelOk(a.label)||
   !isoDate(a.adjudicatedAt)||!a.rationale||a.rationale.trim().length<12||
   !Array.isArray(a.sourceReferences)||!a.sourceReferences.length||
   a.sourceReferences.some(x=>typeof x!=='string'||!x.trim())||
   pair.length!==2||pair[0].label===pair[1].label||pair.some(p=>p.assessorId===a.adjudicatorId)||
   adjudicated.has(a.caseId))throw Error('Invalid or unnecessary adjudication');
  adjudicated.set(a.caseId,a);
 }
 const rows:EvaluationRow[]=cases.map(c=>{
  const predicted=decideSelectiveUserReviewResearch({question:c.question,grants:c.grants,asOf:c.asOf}).status;
  const pair=byCase.get(c.caseId)??[];
  const arb=adjudicated.get(c.caseId);
  const reference:SearchDecision|null=arb?.label??(pair.length===2&&pair[0].label===pair[1].label?pair[0].label:null);
  const referenceStatus:EvaluationRow['referenceStatus']=arb?'adjudicated':pair.length===0?'not_annotated':pair.length===1?'single_annotation':reference?'agreed_by_two':'disagreement_requires_adjudication';
  return {caseId:c.caseId,category:c.category,origin:c.origin,split:c.split,predicted,reference,referenceStatus,match:reference===null?null:predicted===reference};
 });
 const assessed=rows.filter(r=>r.reference!==null);
 const confusion=DECISIONS.flatMap(reference=>DECISIONS.map(predicted=>({reference,predicted,count:assessed.filter(r=>r.reference===reference&&r.predicted===predicted).length}))).filter(x=>x.count>0);
 const perDecision=DECISIONS.map(decision=>{
  const support=assessed.filter(r=>r.reference===decision).length;
  const tp=assessed.filter(r=>r.reference===decision&&r.predicted===decision).length;
  const fp=assessed.filter(r=>r.reference!==decision&&r.predicted===decision).length;
  const fn=support-tp;
  return {decision,support,truePositive:tp,falsePositive:fp,falseNegative:fn,precision:tp+fp?tp/(tp+fp):null,recall:support?tp/support:null};
 });
 return {purpose:'selective_review_research_gate_research_only',publicationReady:false,
  humanValidationVerifiedBySoftware:false,caseCount:cases.length,annotatedCaseCount:byCase.size,
  evaluatedCaseCount:assessed.length,rows,
  metrics:assessed.length?{sampleSize:assessed.length,accuracy:assessed.filter(r=>r.match).length/assessed.length,
   matches:assessed.filter(r=>r.match).length,confusion,perDecision,
   warning:'Descriptive agreement with supplied reference labels; NOT verified expert validity, representativeness, or deployment readiness.'}:null,
  limitations:[...limitation]};
}
