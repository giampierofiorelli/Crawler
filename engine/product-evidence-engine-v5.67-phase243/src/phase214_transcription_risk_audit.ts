/** Phase214: critical numeric-claim risk diagnostics ONLY, never truth admission.
 * It uses the Phase212 transient transcript and its validated analyst reference.
 * Returned data has no raw words, quoted claims, numbers or transcripts.
 */
import {evaluateLocalAsr212,type Transcript212,type ProvisionalReference212} from './phase212_local_asr_evaluation.js';
export interface RiskAudit214 {
 schema:'pee214.asr-risk-audit.v1';uploadSha256:string;
 comparedTo:'none'|'analyst_unverified';numericCandidatesInHypothesis:number;
 numericCandidatesInReference:number;numericUnmatchedInHypothesis:number;
 numericUnmatchedInReference:number;referenceLanguageTransitions:number|null;
 languageSwitchWordAccuracy:number|null;originalAudioAuthenticated:false;
 numericScope:'unit_bearing_phrases_only';numericEvaluation:'not_possible_without_reference'|'heuristic_requires_manual_review';
 claimVerification:'not_performed';scientificAccuracyClaimAuthorized:false;productEvidenceAdmissionAuthorized:false;
 criticalMissing:string[];
}
const normUnit=(s:string)=>s.toLowerCase().replace('°c','celsius').replace('°f','fahrenheit').replace('db','decibel');
/** Identify numbers only if adjacent to a unit. This does not parse verbal numbers,
 * determine measurement provenance or establish semantic equivalence.
 */
const numeric=(text:string)=>{
 const matches:string[]=[];
 const pattern=/(^|[^\p{L}\d])([-+]?\d{1,6}(?:[.,]\d{1,3})?)\s*(°\s*[cCfF]|%|mAh|kWh|dB|fps|MP|GB|MB|Hz|W|V)(?![\p{L}])/giu;
 for(const m of text.matchAll(pattern)){
  // Ambiguous comma thousands / decimal interpretation is deliberately NOT resolved.
  const value=m[2].toLowerCase();const unit=normUnit(m[3].replace(/\s+/g,''));
  matches.push(`${value}|${unit}`);
 }
 return matches;
};
function difference(left:string[],right:string[]){
 const counts=new Map<string,number>();for(const n of right)counts.set(n,(counts.get(n)??0)+1);
 let missed=0;for(const n of left){const count=counts.get(n)??0;if(count>0)counts.set(n,count-1);else missed++;}return missed;
}
export function auditTranscriptRisks214(t:Transcript212,ref:ProvisionalReference212|null):RiskAudit214{
 // Invoke the one existing input/reference validator, do not create parallel WER.
 evaluateLocalAsr212(t,ref);
 const hyp=t.segments.flatMap(s=>numeric(s.text));
 const reference=ref?ref.segments.flatMap(s=>numeric(s.text)):[];
 let transitions:null|number=null;
 if(ref){transitions=0;let last:string|null=null;
  for(const seg of ref.segments){if(seg.language!==null){if(last!==null&&seg.language!==last)transitions++;last=seg.language;}}
 }
 return {schema:'pee214.asr-risk-audit.v1',uploadSha256:t.uploadSha256,
  comparedTo:ref?'analyst_unverified':'none',numericCandidatesInHypothesis:hyp.length,
  numericCandidatesInReference:reference.length,
  numericUnmatchedInHypothesis:ref?difference(hyp,reference):0,
  numericUnmatchedInReference:ref?difference(reference,hyp):0,
  referenceLanguageTransitions:transitions,languageSwitchWordAccuracy:null,
  originalAudioAuthenticated:false,numericScope:'unit_bearing_phrases_only',
  numericEvaluation:ref?'heuristic_requires_manual_review':'not_possible_without_reference',
  claimVerification:'not_performed',scientificAccuracyClaimAuthorized:false,
  productEvidenceAdmissionAuthorized:false,
  criticalMissing:[...(!ref?['independent_reference_transcript']:
    ['independent_gold_review_and_numeric_context_validation']),
   'original_audio_authenticity','claim_to_visual_evidence_verification',
   'intra_phrase_code_switch_alignment','unspoken_numbers_and_unit_less_measurements_unchecked']};
}
