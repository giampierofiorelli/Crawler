/** Phase 142: independently authored, bounded syntactic scope screening over
 * independently licensed lexical DATA from Phase141. This is NOT a parser,
 * VerbNet semantic-role labeler, NLI model, or source-fact validator.
 * No decision authorizes canonical writes or product ranking.
 */
import {createHash} from 'node:crypto';
import {readLexicalEnglish141,lexicalLookup141,type LexicalProposal141} from './phase141_local_lexical_resources.js';
import {readUnmarkedEnglish139,type ReaderInput139} from './phase139_unmarked_english_candidate_reader.js';
import type {Span131} from './phase131_local_relation_learning.js';
import type {ProposalState140} from './phase140_bounded_english_recall.js';

export type FrameIssue142='negated_target'|'negated_predicate'|'passive_voice'|'conditional_or_modal'|
 'comparator_not_direct_object'|'quoted_claim'|'coordinated_predicate'|'scope_preserved';
export interface ScopedFrame142 extends Omit<LexicalProposal141,'status'|'reasons'|'objectSpan'>{
 status:ProposalState140; reasons:string[];objectSpan:Span131|null;
 issue:FrameIssue142;syntacticSubject:'explicit_product'|'unresolved';
 voice:'active_surface'|'passive_surface'|'unknown';
 roleAssignmentsVerified:false;
 verbnetRolesPossible:{class:string;roles:string[]}[];
 spanReceipts:{predicateSha256:string;subjectSha256:string|null;objectSha256:string|null};
}
export interface ScopedLexicalResult142{
 phase:142;sourceId:string;originalDocumentId:string;documentSha256:string;
 baseline141Proposals:number;frames:ScopedFrame142[];
 changedDisposition:number;boundedObjects:number;
 issueCounts:Record<FrameIssue142,number>;
 coverageTruncated:boolean;truncationReasons:string[];
 evaluationKind:'unvalidated_extraction_hypotheses';independentGoldCases:0;accuracy:null;
 scientificReviewRequired:true;canonicalWriteAuthorized:false;rankingAuthorized:false;
}
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const leadingNegative=/^(?:no|not|without|neither|none|nothing|zero|never|hardly\s+any)\b/i;
const modal=/\b(?:might|may|could|would|should|perhaps|possibly|apparently|reportedly|allegedly|purportedly|will)\b/i;
const conditional=/\b(?:if|assuming|provided\s+that|in\s+the\s+event\s+that)\b/i;
const negation=/\b(?:never|cannot|can't|won't|doesn't|don't|didn't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|couldn't|shouldn't|wouldn't)\b|\b(?:does|do|did|is|are|was|were|has|have|had|can|could|will|would)\s+not\b/i;
const passiveAux=/\b(?:(?:is|are|was|were|be|been|being|gets|got)\s+|(?:has|have|had)\s+been\s+)(?:(?:also|often|usually|reportedly)\s+)?$/i;
function trimSpan142(text:string,from:number,to:number):Span131|null{
 let a=from,b=to;
 while(a<b&&/[\s,;:.]/.test(text[a]))a++;
 while(a<b&&/[\s,;:.]/.test(text[b-1]))b--;
 return b>a?{start:a,end:b}:null;
}
function directComparator142(text:string,span:Span131,entitySpans:Span131[],subject:Span131|null):boolean{
 const tail=text.slice(span.start,span.end);
 for(const entity of entitySpans){
  if(entity.start<span.start||entity.end>span.end)continue;
  if(subject&&text.slice(entity.start,entity.end).toLowerCase()===text.slice(subject.start,subject.end).toLowerCase())continue;
  // The compared model must be the first content noun phrase, not merely
  // mentioned in a preposition or an incidental subordinate clause.
  if(/^(?:\s*the\s+)?$/i.test(text.slice(span.start,entity.start)))return true;
 }
 return false;
}
function quoteAround142(text:string,start:number,end:number):boolean{
 const before=text.slice(Math.max(0,start-180),start),after=text.slice(end,Math.min(text.length,end+180));
 // Only detect symmetric typographic double quotes to avoid confusing
 // contractions and product-name apostrophes with direct quotation.
 return ((before.lastIndexOf('“')>before.lastIndexOf('”')) && after.includes('”')) ||
  ((before.split('"').length-1)%2===1 && after.includes('"'));
}
function emptyCounts142():Record<FrameIssue142,number>{return {
 negated_target:0,negated_predicate:0,passive_voice:0,conditional_or_modal:0,
 comparator_not_direct_object:0,quoted_claim:0,coordinated_predicate:0,scope_preserved:0};}
/** Original frame audit: source/digest checks remain inherited from Phase139.
 * Proposals may become MORE cautious. A new positive support decision is never
 * introduced by a lexical match or VerbNet membership.
 */
export function readScopedLexicalFrames142(input:ReaderInput139,maxProposals=80):ScopedLexicalResult142{
 const base=readLexicalEnglish141(input,maxProposals);
 const text=input.document.text;
 const counts=emptyCounts142(),frames:ScopedFrame142[]=[];
 let changed=0,bounded=0;
 const mentions=readUnmarkedEnglish139(input).mentions;
 for(const p of base.lexicalProposals){
  const subject=p.subjectSpan,pre=text.slice(subject?.end??p.evidenceSpan.start,p.predicateSpan.start);
  let object=p.objectSpan,issue:FrameIssue142='scope_preserved';
  let status=p.status,voice:ScopedFrame142['voice']='active_surface';
  const reasons=[...p.reasons];
  // An object should not silently absorb a second predicate and its subject.
  if(object){
   const next=base.lexicalProposals.filter(other=>other.predicateSpan.start>p.predicateSpan.start &&
    other.predicateSpan.start<object!.end).sort((a,b)=>a.predicateSpan.start-b.predicateSpan.start)[0];
   if(next){
    const between=text.slice(object.start,next.predicateSpan.start);
    const connector=/\b(?:and|or)\s*$/i.exec(between);
    if(connector){
     const clipped=trimSpan142(text,object.start,object.start+connector.index);
     if(clipped){object=clipped;issue='coordinated_predicate';bounded++;reasons.push('second_predicate_not_part_of_first_object');}
    }
   }
   // Relative clauses are not automatically part of the asserted object.
   const relative=/,\s*(?:which|who|whose|where|while)\b/i.exec(text.slice(object.start,object.end));
   if(relative){const clipped=trimSpan142(text,object.start,object.start+relative.index);
    if(clipped){object=clipped;issue='coordinated_predicate';bounded++;reasons.push('relative_clause_excluded_from_direct_complement');}}
  }
  // Phase141 may reuse a product name from earlier in the sentence after
  // an elided coordinating subject. Do not claim that this attachment was
  // independently established merely because the name occurred upstream.
  const prior=base.lexicalProposals.filter(other=>other.predicateSpan.start<p.predicateSpan.start &&
   other.evidenceSpan.start===p.evidenceSpan.start).sort((a,b)=>b.predicateSpan.start-a.predicateSpan.start)[0];
  const coordinatedElision=!!prior&&!!subject&&subject.end<prior.predicateSpan.start&&
   /\b(?:and|or)\s*$/i.test(text.slice(prior.predicateSpan.end,p.predicateSpan.start))&&
   !mentions.some(m=>m.type==='product_name'&&m.span.start>prior.predicateSpan.start&&m.span.end<=p.predicateSpan.start);
  const predicateText=text.slice(p.predicateSpan.start,p.predicateSpan.end);
  const objectText=object?text.slice(object.start,object.end):'';
  const passive=/ed\b/i.test(predicateText)&&passiveAux.test(pre);
  const negated=negation.test(pre);
  const prefix=text.slice(p.evidenceSpan.start,p.predicateSpan.start);
  const modalOrConditional=modal.test(pre)||conditional.test(prefix);
  if(coordinatedElision){issue='coordinated_predicate';status='unsupported_scope';
   reasons.push('elided_coordinated_subject_requires_separate_link');}
  else if(passive){voice='passive_surface';issue='passive_voice';status='unsupported_scope';
   reasons.push('passive_surface_subject_not_verified_agent');}
  else if(negated){issue='negated_predicate';status='unsupported_scope';
   reasons.push('lexical_predicate_scoped_by_explicit_negation');}
  else if(object&&leadingNegative.test(objectText)){
   issue='negated_target';status='unsupported_scope';
   reasons.push('negated_or_absent_complement_not_feature_presence');}
  else if(modalOrConditional){issue='conditional_or_modal';status='unsupported_scope';
   reasons.push('hypothetical_or_reported_action_not_observed');}
  else if(p.structure==='comparison'&&object&&!directComparator142(text,object,
   mentions.filter(m=>m.type==='product_name').map(m=>m.span),subject)){
   issue='comparator_not_direct_object';status='unsupported_scope';
   reasons.push('named_model_not_a_verified_direct_comparator');}
  else if(quoteAround142(text,p.predicateSpan.start,p.predicateSpan.end)){
   issue='quoted_claim';status='unsupported_scope';
   reasons.push('quotation_does_not_establish_reviewers_observation');}
  if(issue==='scope_preserved'&&p.status==='unsupported_scope')voice='unknown';
  if(status!==p.status)changed++;
  counts[issue]++;
  const lexical=lexicalLookup141(p.lexicalLemma);
  frames.push({...p,status,reasons,objectSpan:object,issue,voice,
   syntacticSubject:subject?'explicit_product':'unresolved',roleAssignmentsVerified:false,
   verbnetRolesPossible:lexical.possibleVerbnetClasses,
   spanReceipts:{predicateSha256:sha(predicateText),subjectSha256:subject?sha(text.slice(subject.start,subject.end)):null,
    objectSha256:object?sha(text.slice(object.start,object.end)):null}});
 }
 return {phase:142,sourceId:base.sourceId,originalDocumentId:input.document.source.originalDocumentId,
  documentSha256:base.documentSha256,baseline141Proposals:base.lexicalProposals.length,frames,
  changedDisposition:changed,boundedObjects:bounded,issueCounts:counts,
  coverageTruncated:base.coverageTruncated,truncationReasons:base.truncationReasons,
  evaluationKind:'unvalidated_extraction_hypotheses',independentGoldCases:0,accuracy:null,
  scientificReviewRequired:true,canonicalWriteAuthorized:false,rankingAuthorized:false};
}
