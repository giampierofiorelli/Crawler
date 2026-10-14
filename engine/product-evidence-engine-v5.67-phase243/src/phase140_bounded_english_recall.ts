/** Phase 140: original, bounded structural recall supplement for Phase 139.
 * An explicit product mention, not a page title or pronoun, is required to
 * attach a new surface hypothesis. These are NOT semantically entailed facts.
 * No code/weights/runtime from GLiNER2, DeepKE, medSpaCy, Snorkel or TypeSafe.
 */
import type {Span131} from './phase131_local_relation_learning.js';
import {readUnmarkedEnglish139,type ReaderInput139,type UnmarkedMention139} from './phase139_unmarked_english_candidate_reader.js';

export type Structure140='limitation'|'positive_assessment'|'feature_presence'|'feature_absence'|'comparison';
export type ProposalState140='quarantined_surface_hypothesis'|'quarantined_negative_statement'|
 'unresolved_reference'|'ambiguous_subject'|'different_variant'|'insufficient_target'|
 'attributed_claim'|'unsupported_scope';
export interface RecallProposal140{
 id:string;structure:Structure140;status:ProposalState140;
 subjectMentionId:string|null;subjectSpan:Span131|null;predicateSpan:Span131;objectSpan:Span131|null;
 evidenceSpan:Span131;conditionSpans:Span131[];reasons:string[];
 sourceVerified:false;scientificallyValidated:false;canonicalWriteAuthorized:false;rankingAuthorized:false;
}
export interface RecallResult140{
 phase:140;documentSha256:string;sourceId:string;originalDocumentId:string;
 baseline139Pairs:number;baseline139Mentions:number;structuralCueCount:number;
 proposals:RecallProposal140[];unattachedCues:number;unscannedSentenceCount:number;
 coverageTruncated:boolean;truncationReasons:string[];
 estimatedRecall:null;independentGoldCases:0;scientificallyValidated:false;
 canonicalWriteAuthorized:false;rankingAuthorized:false;
}
interface Sentence140 {id:number;span:Span131;}
interface Cue140 {structure:Structure140; start:number;end:number;}
const cues140:readonly {kind:Structure140;re:RegExp}[]=[
 {kind:'limitation',re:/\b(?:struggl(?:e|es|ed)\s+with|fail(?:s|ed)?\s+to|(?:is|are|was|were)\s+(?:poor|bad|weak)\s+at)\b/gi},
 {kind:'positive_assessment',re:/\b(?:excel(?:s|led)?\s+at|succeed(?:s|ed)?\s+in|(?:is|are|was|were)\s+(?:good|great|effective)\s+at)\b/gi},
 {kind:'feature_presence',re:/\b(?:uses?|comes?\s+with|(?:is|are)\s+equipped\s+with)\b/gi},
 {kind:'feature_absence',re:/\b(?:lacks?|(?:is|are)\s+without)\b/gi},
 {kind:'comparison',re:/\b(?:outperforms?|underperforms?)\b/gi}
];
const stop140=/\s+(?:but|however|whereas|although|though)\b|[;.!?]|\n/gi;
const condition140=/\b(?:on|in|under|during|against)\s+(?:the\s+)?(?:[a-z]+(?:-[a-z]+)*\s+){0,5}[a-z]+(?:-[a-z]+)*/gi;
function getSentences140(text:string):Sentence140[]{
 let start=0;const out:Sentence140[]=[];
 const add=(end:number)=>{let a=start,b=end;
  while(a<b&&/\s/.test(text[a]))a++;while(b>a&&/\s/.test(text[b-1]))b--;
  if(a<b)out.push({id:out.length,span:{start:a,end:b}});};
 for(const m of text.matchAll(/(?:[.!?](?=\s|$)|\n\s*\n)/g)){
  add(m.index!+m[0].length);start=m.index!+m[0].length;
 }
 add(text.length);return out;
}
function boundedCues140(text:string,s:Sentence140):Cue140[]{
 const local=text.slice(s.span.start,s.span.end),all:Cue140[]=[];
 for(const c of cues140)for(const m of local.matchAll(c.re))
  all.push({structure:c.kind,start:s.span.start+m.index!,end:s.span.start+m.index!+m[0].length});
 return all.sort((a,b)=>a.start-b.start||a.end-b.end||a.structure.localeCompare(b.structure));
}
function safelyScopedObject140(text:string,from:number,to:number):Span131|null{
 const local=text.slice(from,to);const stop=stop140.exec(local);
 stop140.lastIndex=0;
 let end=stop?from+stop.index:to;
 while(end>from&&/[\s,]/.test(text[end-1]))end--;
 let start=from;while(start<end&&/[\s,]/.test(text[start]))start++;
 if(end<=start||end-start>180)return null;
 return {start,end};
}
/** Integrates Stage139 identity candidates; never invents a canonical entity id.
 * Source SHA and offsets are validated by Stage139 before any supplemental scan.
 */
export function readBoundedEnglishRecall140(input:ReaderInput139,maxProposals=80):RecallResult140{
 if(!Number.isSafeInteger(maxProposals)||maxProposals<1||maxProposals>200)throw Error('invalid_phase140_cap');
 const baseline=readUnmarkedEnglish139(input),text=input.document.text;
 const sentences=getSentences140(text),proposals:RecallProposal140[]=[];
 let structuralCueCount=0,unattachedCues=0,unscannedSentenceCount=0,truncated=false;
 for(const s of sentences){
  const cues=boundedCues140(text,s);
  if(!cues.length){unscannedSentenceCount++;continue;}
  structuralCueCount+=cues.length;
  for(const c of cues){
   if(proposals.length>=maxProposals){truncated=true;continue;}
   // Bound subject to current sentence/clause. A different product in the same
   // clause makes identity ambiguous; do not choose the nearest product.
   const preceding=text.slice(s.span.start,c.start);
   const lastBoundary=Math.max(preceding.lastIndexOf(';'), ...[...preceding.matchAll(/\b(?:but|whereas|although|however)\b/gi)].map(x=>x.index!));
   const subjectStart=s.span.start+lastBoundary+1;
   const names=baseline.mentions.filter(m=>m.type==='product_name'&&m.span.start>=subjectStart&&
     m.span.end<=c.start&&m.span.start>=s.span.start);
   const subject:UnmarkedMention139|null=names.length===1?names[0]:null;
   const next=baseline.mentions.filter(m=>m.type==='product_name'&&m.span.start>=c.end&&m.span.end<=s.span.end);
   const obj=safelyScopedObject140(text,c.end,s.span.end);
   const reasons:string[]=[];
   let status:ProposalState140='quarantined_surface_hypothesis';
   if(names.length>1){status='ambiguous_subject';reasons.push('multiple_subject_products_in_clause');}
   else if(!subject){status='unresolved_reference';reasons.push('no_explicit_product_subject_in_clause');unattachedCues++;}
   else if(subject.identityClaim==='different_or_unverified_variant'){
    status='different_variant';reasons.push('model_name_similarity_does_not_authorize_variant_equivalence');
   }else if(!obj){status='insufficient_target';reasons.push('no_bounded_complement');}
   else if(c.structure==='limitation'||c.structure==='feature_absence'){
    status='quarantined_negative_statement';reasons.push('text_reports_limitation_not_positive_product_evidence');
   }
   if(obj&&next.some(n=>n.span.start<obj.end)){
    // Phase139 capitalized-name proposals include app / accessory names.
    // Never silently classify a named component as a second vacuum model.
    const maybeAccessory=next.some(n=>n.span.start<obj.end&&
     /^\s+(?:app|software|dock|sensor|camera|filter|brush|motor|mode|system)\b/i.test(
      text.slice(n.span.end,obj.end)));
    reasons.push(maybeAccessory?'named_app_or_component_is_not_a_verified_product':
     'other_model_mentioned_in_target_no_absolute_inference');
   }
   const prefix=text.slice(s.span.start,c.start);
   if(/\b(?:manufacturer|brand|company)\s+(?:claims?|says?|promises?)\b/i.test(prefix)
      &&(status==='quarantined_surface_hypothesis'||status==='quarantined_negative_statement')){
    status='attributed_claim';reasons.push('manufacturer_report_not_independent_measurement');
   }
   if(/\b(?:no\s+evidence|not\s+necessarily|may|might|could|allegedly|reportedly)\b/i.test(prefix)
      &&(status==='quarantined_surface_hypothesis'||status==='quarantined_negative_statement')){
    status='unsupported_scope';reasons.push('uncertain_or_evidence_absence_scope');
   }
   if(/\b(?:not\s+only|does\s+not|doesn't|never)\s*$/i.test(prefix)
      &&(status==='quarantined_surface_hypothesis'||status==='quarantined_negative_statement')){
    status='unsupported_scope';reasons.push('preceding_negation_requires_scope_resolution');
   }
   if(obj&&/^(?:no\s+|not\s+|never\s+)/i.test(text.slice(obj.start,obj.end))
      &&status==='quarantined_surface_hypothesis'){
    status='unsupported_scope';reasons.push('negative_object_requires_scope_resolution');
   }
   if(!reasons.length)reasons.push('unreviewed_structural_pattern_not_entailment');
   const conditions:Span131[]=[];
   if(obj){for(const m of text.slice(obj.start,obj.end).matchAll(condition140)){
    const sp={start:obj.start+m.index!,end:obj.start+m.index!+m[0].length};
    if(!conditions.some(x=>x.start===sp.start&&x.end===sp.end))conditions.push(sp);
   }}
   proposals.push({id:`p140_${c.start}_${c.structure}`,structure:c.structure,status,
    subjectMentionId:subject?.id??null,subjectSpan:subject?.span??null,
    predicateSpan:{start:c.start,end:c.end},objectSpan:obj,evidenceSpan:s.span,
    conditionSpans:conditions,reasons,sourceVerified:false,scientificallyValidated:false,
    canonicalWriteAuthorized:false,rankingAuthorized:false});
  }
 }
 return {phase:140,documentSha256:baseline.documentSha256,sourceId:baseline.sourceId,
  originalDocumentId:baseline.originalDocumentId,baseline139Pairs:baseline.pairs.length,
  baseline139Mentions:baseline.mentions.length,structuralCueCount,proposals,unattachedCues,
  unscannedSentenceCount,coverageTruncated:truncated||baseline.coverageTruncated,
  truncationReasons:[...(truncated?['phase140_proposal_limit']:[]),...baseline.truncationReasons],
  estimatedRecall:null,independentGoldCases:0,scientificallyValidated:false,
  canonicalWriteAuthorized:false,rankingAuthorized:false};
}
