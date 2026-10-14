/**
 * Phase135 — ORIGINAL English-first document mention and reference graph.
 * Only anchors separately supplied with exact offsets and typed identity can
 * be aligned. Pronouns yield candidates; a separate, traceable review receipt
 * is needed to use them as an entity reference in a relation hypothesis.
 *
 * No package imports, model weights, web calls, canonical writes or ranking.
 * A receipt here records an upstream human assertion; it is NOT a cryptographic
 * authentication of the reviewer, a source licence, or scientific verification.
 */
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {assertRelationAnchoring131,type CandidateRelation131,type RelationDocument131,type Span131} from './phase131_local_relation_learning.js';
import {inspectLearnedProposal134,type AtomicDecision134} from './phase134_atomic_context_evidence.js';

const digest135=(text:string)=>createHash('sha256').update(text).digest('hex');
const idOk135=(s:unknown)=>typeof s==='string'&&/^[-.\w:]{1,100}$/.test(s);
const spanOk135=(text:string,s:Span131)=>Number.isSafeInteger(s?.start)&&Number.isSafeInteger(s?.end)&&s.start>=0&&s.end>s.start&&s.end<=text.length;
const norm135=(s:string)=>s.normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
export type EntityType135='product'|'component'|'feature'|'metric'|'outcome'|'surface'|'other';
export type MentionKind135='explicit_name'|'anaphor';
/** All spans are half-open UTF-16 offsets into the unchanged original text.
 * Entity IDs and variant IDs originate from an upstream annotation/catalogue;
 * this phase does not establish independently whether they are correct. */
export interface MentionInput135 {
 id:string;span:Span131;kind:MentionKind135;entityType:EntityType135;
 entityId?:string;variantId?:string;
}
export interface Sentence135 {id:number;span:Span131;paragraph:number;}
export interface MentionNode135 extends MentionInput135 {text:string;sentenceId:number;paragraph:number;}
/** Reviewer assertion about one anaphor/alias and one antecedent within the
 * document, linked to the exact original two-sentence text. Not a signature. */
export interface ReferenceReview135 {
 id:string;fromMentionId:string;toMentionId:string;
 sourceId:string;originalDocumentId:string;documentSha256:string;contextSha256:string;
 reviewerId:string;method:'human_coreference_adjudication';
}
export type LinkStatus135='anchor'|'resolved_explicit_repeat'|'resolved_reviewed_reference'|'unresolved';
export type LinkReason135='first_explicit_mention'|'exact_name_and_upstream_identity'|'upstream_review_receipt_not_authenticated'|
 'requires_coreference_review'|'multiple_candidate_referents'|'no_adjacent_antecedent'|'identity_collision'|
 'generic_descriptor_not_identity'|'paragraph_boundary'|'not_product_reference';
export interface MentionLink135 {
 mentionId:string;status:LinkStatus135;antecedentId:string|null;
 candidateAntecedentIds:string[];reason:LinkReason135;
 reviewReceiptId:string|null;
}
export interface DocumentMentionGraph135 {
 phase:135;sourceId:string;originalDocumentId:string;documentSha256:string;
 sentences:Sentence135[];mentions:MentionNode135[];links:MentionLink135[];reviewedLinks:ReferenceReview135[];
 rankingAuthorized:false;canonicalWriteAuthorized:false;independentScientificReviewRequired:true;
 reviewReceiptsIndependentlyAuthenticated:false;
}
function sentences135(text:string):Sentence135[]{
 const out:Sentence135[]=[];
 let start=0,paragraph=0;
 // Periods only separate sentences when followed by space/end; decimals stay intact.
 // A blank line always terminates a paragraph. Single newlines are preserved.
 const boundary=/[.!?](?=\s|$)|\n\s*\n/g;
 const add=(end:number)=>{
  let a=start,b=end;while(a<b&&/\s/.test(text[a]))a++;while(b>a&&/\s/.test(text[b-1]))b--;
  if(b>a)out.push({id:out.length,span:{start:a,end:b},paragraph});
 };
 for(const hit of text.matchAll(boundary)){
  const end=hit.index!+hit[0].length;
  add(end);if(hit[0].startsWith('\n'))paragraph++;
  start=end;
 }
 add(text.length);
 return out;
}
const genericNames135=new Set(['the product','the device','the unit','the model','the vacuum','the robot',
 'the mop','the dock','the cleaner','this device','this model','this unit','a device','a model',
 'a robot','a vacuum','device','model','unit','vacuum','robot','product','cleaner','dock']);
const anaphors135=new Set(['it','its','they','their','this device','the device','this model','the unit','this unit']);
function sameIdentity135(a:MentionNode135,b:MentionNode135):boolean{
 return a.kind==='explicit_name'&&b.kind==='explicit_name'&&a.entityType===b.entityType&&
 a.entityId===b.entityId&&a.variantId===b.variantId;
}
/** All potential referents are grounded in supplied annotations. Missing or
 * incorrectly typed mentions will change coverage and can conceal ambiguity. */
export function buildDocumentMentionGraph135(args:{document:RelationDocument131;
 mentions:readonly MentionInput135[];reviewedLinks?:readonly ReferenceReview135[]}):DocumentMentionGraph135{
 const d=args.document;
 if(!d||typeof d.text!=='string'||d.text.length>250000||d.sha256!==digest135(d.text)||
 !idOk135(d.source?.id)||!idOk135(d.source?.originalDocumentId)||
 !/^https:\/\//.test(d.source?.url??''))throw Error('invalid_document_provenance_135');
 if(!Array.isArray(args.mentions)||args.mentions.length>300||!Array.isArray(args.reviewedLinks??[])||
 (args.reviewedLinks?.length??0)>100)throw Error('unbounded_graph_135');
 const sentences=sentences135(d.text),ids=new Set<string>();
 const mentions:MentionNode135[]=args.mentions.map(m=>{
  if(!m||!idOk135(m.id)||ids.has(m.id)||!spanOk135(d.text,m.span)||
   !(['explicit_name','anaphor'] as const).includes(m.kind)||
   !(['product','component','feature','metric','outcome','surface','other'] as const).includes(m.entityType))
   throw Error('invalid_mention_135');
  ids.add(m.id);
  const sentence=sentences.find(s=>m.span.start>=s.span.start&&m.span.end<=s.span.end);
  if(!sentence)throw Error('mention_crosses_sentence_135');
  const surface=d.text.slice(m.span.start,m.span.end);
  if(m.kind==='anaphor'){
   if(m.entityId!==undefined||m.variantId!==undefined||!anaphors135.has(norm135(surface)))
    throw Error('invalid_anaphor_135');
  }else if(!idOk135(m.entityId)||m.entityType==='product'&&!idOk135(m.variantId)||
   m.entityType!=='product'&&m.variantId!==undefined)throw Error('unproven_named_identity_135');
  return {...m,span:{...m.span},text:surface,sentenceId:sentence.id,paragraph:sentence.paragraph};
 }).sort((a,b)=>a.span.start-b.span.start||a.id.localeCompare(b.id));
 for(let i=1;i<mentions.length;i++){
  if(mentions[i].span.start<mentions[i-1].span.end)throw Error('overlapping_mentions_135');
 }
 const byId=new Map(mentions.map(m=>[m.id,m]));
 const reviewMap=new Map<string,ReferenceReview135>();
 const receiptIds=new Set<string>();
 for(const r of args.reviewedLinks??[]){
  if(!r||!idOk135(r.id)||!idOk135(r.reviewerId)||!idOk135(r.fromMentionId)||
   !idOk135(r.toMentionId)||reviewMap.has(r.fromMentionId)||receiptIds.has(r.id)||
   r.method!=='human_coreference_adjudication'||r.sourceId!==d.source.id||
   r.originalDocumentId!==d.source.originalDocumentId||r.documentSha256!==d.sha256)
   throw Error('invalid_reference_receipt_135');
  const from=byId.get(r.fromMentionId),to=byId.get(r.toMentionId);
  if(!from||!to||from.id===to.id||from.kind!=='anaphor'&&from.kind!=='explicit_name'||
   to.kind!=='explicit_name'||from.entityType!==to.entityType||
   from.sentenceId!==to.sentenceId+1||from.paragraph!==to.paragraph||
   from.entityType==='product'&&(!to.variantId||!to.entityId)||
   from.kind==='explicit_name'&&(!sameIdentity135(from,to) &&
    (from.entityId!==to.entityId||from.variantId!==to.variantId)))
   throw Error('invalid_reference_endpoints_135');
  const context=d.text.slice(sentences[to.sentenceId].span.start,sentences[from.sentenceId].span.end);
  if(digest135(context)!==r.contextSha256)throw Error('invalid_reference_context_hash_135');
  receiptIds.add(r.id);reviewMap.set(from.id,r);
 }
 // Exact surface collisions across distinct annotated entities/variants are
 // globally detected before any link; input ordering cannot change the answer.
 const collision=new Set<string>();
 const nameGroups=new Map<string,MentionNode135[]>();
 for(const m of mentions.filter(x=>x.kind==='explicit_name')){
  const key=m.entityType+'|'+norm135(m.text);
  nameGroups.set(key,[...(nameGroups.get(key)??[]),m]);
 }
 for(const group of nameGroups.values()){
  if(new Set(group.map(x=>`${x.entityId}|${x.variantId??''}`)).size>1)
   for(const m of group)collision.add(m.id);
 }
 const links:MentionLink135[]=mentions.map(m=>{
  const prior=mentions.filter(p=>p.span.end<=m.span.start);
  const review=reviewMap.get(m.id);
  // Even a supplied review must not silently override a contradictory name
  // annotated as two distinct products or variants in the same document.
  if(collision.has(m.id)||review&&collision.has(review.toMentionId))
   return {mentionId:m.id,status:'unresolved',antecedentId:null,
    candidateAntecedentIds:[],reason:'identity_collision',reviewReceiptId:null};
  if(review)return {mentionId:m.id,status:'resolved_reviewed_reference',antecedentId:review.toMentionId,
   candidateAntecedentIds:[review.toMentionId],reason:'upstream_review_receipt_not_authenticated',reviewReceiptId:review.id};
  if(m.kind==='explicit_name'){
   if(collision.has(m.id))return {mentionId:m.id,status:'unresolved',antecedentId:null,
    candidateAntecedentIds:[],reason:'identity_collision',reviewReceiptId:null};
   if(genericNames135.has(norm135(m.text)))return {mentionId:m.id,status:'unresolved',antecedentId:null,
    candidateAntecedentIds:[],reason:'generic_descriptor_not_identity',reviewReceiptId:null};
   const same=prior.filter(p=>!collision.has(p.id)&&sameIdentity135(p,m)&&norm135(p.text)===norm135(m.text));
   const found=same[same.length-1];
   if(found)return {mentionId:m.id,status:'resolved_explicit_repeat',antecedentId:found.id,
    candidateAntecedentIds:[found.id],reason:'exact_name_and_upstream_identity',reviewReceiptId:null};
   return {mentionId:m.id,status:'anchor',antecedentId:null,candidateAntecedentIds:[],
    reason:'first_explicit_mention',reviewReceiptId:null};
  }
  // No pronoun resolution from mere proximity. The best observable heuristic
  // is surfaced as a list of possible antecedents awaiting review.
  const sentence=sentences[m.sentenceId];
  if(!m.sentenceId)return {mentionId:m.id,status:'unresolved',antecedentId:null,
   candidateAntecedentIds:[],reason:'no_adjacent_antecedent',reviewReceiptId:null};
  const previous=sentences[m.sentenceId-1];
  if(sentence.paragraph!==previous.paragraph)return {mentionId:m.id,status:'unresolved',antecedentId:null,
   candidateAntecedentIds:[],reason:'paragraph_boundary',reviewReceiptId:null};
  const possible=prior.filter(p=>p.kind==='explicit_name'&&p.sentenceId===previous.id&&
   (m.entityType===p.entityType||m.entityType==='product'&&p.entityType==='component')&&
   !collision.has(p.id));
  // Include plausible component competitors for product 'it'. No language model
  // is used to decide whether a dock or a robot is the true antecedent.
  const candidateAntecedentIds=possible.map(p=>p.id).sort();
  const reason:LinkReason135=!possible.length?'no_adjacent_antecedent':possible.length>1?
   'multiple_candidate_referents':'requires_coreference_review';
  return {mentionId:m.id,status:'unresolved',antecedentId:null,candidateAntecedentIds,
   reason,reviewReceiptId:null};
 });
 return {phase:135,sourceId:d.source.id,originalDocumentId:d.source.originalDocumentId,
  documentSha256:d.sha256,sentences,mentions,links,
  reviewedLinks:[...reviewMap.values()].map(x=>({...x})).sort((a,b)=>a.id.localeCompare(b.id)),
  rankingAuthorized:false,canonicalWriteAuthorized:false,independentScientificReviewRequired:true,
  reviewReceiptsIndependentlyAuthenticated:false};
}
export type BridgeStatus135='quarantined_cross_sentence_hypothesis'|'reference_unresolved'|
 'invalid_proposal'|'rejected_by_context'|'abstain_for_review';
export interface BridgeDecision135 {phase:135;status:BridgeStatus135;
 antecedentMentionId:string|null;referenceStatus:LinkStatus135|null;
 atomicDecision:AtomicDecision134|null;rankingAuthorized:false;canonicalWriteAuthorized:false;
 independentScientificReviewRequired:true;}
/** Connect an EXISTING same-sentence, Phase131-anchored claim to a previous
 * product mention only after explicit identity or a human reference receipt.
 * This does not generate relations from two unrelated sentences. */
export function inspectDocumentBridge135(args:{document:RelationDocument131;graph:DocumentMentionGraph135;
 proposal:CandidateRelation131;subjectMentionId:string;objectMentionId:string}):BridgeDecision135{
 const {document:d,graph:g,proposal:p}=args;
 const base={phase:135 as const,rankingAuthorized:false as const,canonicalWriteAuthorized:false as const,
  independentScientificReviewRequired:true as const};
 const invalid={...base,status:'invalid_proposal' as const,antecedentMentionId:null,
  referenceStatus:null,atomicDecision:null};
 if(!g||g.sourceId!==d.source?.id||g.originalDocumentId!==d.source.originalDocumentId||
  g.documentSha256!==d.sha256||d.sha256!==digest135(d.text)||
  !p)return invalid;
 try{if(!assertRelationAnchoring131(p,d))return invalid;}catch{return invalid;}
 // Reconstruct from evidence-carrying inputs. Merely setting a link to
 // 'resolved_reviewed_reference' in an untrusted graph cannot bypass review.
 try{
  const rebuilt=buildDocumentMentionGraph135({document:d,mentions:g.mentions,reviewedLinks:g.reviewedLinks});
  if(!isDeepStrictEqual(g,rebuilt))return invalid;
 }catch{return invalid;}
 const subject=g.mentions.find(m=>m.id===args.subjectMentionId);
 const object=g.mentions.find(m=>m.id===args.objectMentionId);
 if(!subject||!object||subject.entityType!=='product'||subject.id===object.id||
  subject.sentenceId!==object.sentenceId||subject.span.start!==p.subjectSpan.start||
  subject.span.end!==p.subjectSpan.end||object.span.start!==p.objectSpan.start||
  object.span.end!==p.objectSpan.end||
  p.evidenceSpan.start<g.sentences[subject.sentenceId].span.start||
  p.evidenceSpan.end>g.sentences[subject.sentenceId].span.end||
  d.text.slice(subject.span.start,subject.span.end)!==subject.text||
  d.text.slice(object.span.start,object.span.end)!==object.text)return invalid;
 const link=g.links.find(x=>x.mentionId===subject.id);
 if(!link||link.status!=='resolved_explicit_repeat'&&link.status!=='resolved_reviewed_reference')
  return {...base,status:'reference_unresolved',antecedentMentionId:null,
   referenceStatus:link?.status??null,atomicDecision:null};
 const antecedent=g.mentions.find(m=>m.id===link.antecedentId);
 if(!antecedent||antecedent.entityType!=='product'||antecedent.kind!=='explicit_name'||
  antecedent.sentenceId>=subject.sentenceId)return invalid;
 const atomicDecision=inspectLearnedProposal134({document:d,proposal:p});
 const status:BridgeStatus135=atomicDecision.status==='quarantined_candidate'?
  'quarantined_cross_sentence_hypothesis':atomicDecision.status==='rejected_candidate'?
  'rejected_by_context':'abstain_for_review';
 return {...base,status,antecedentMentionId:antecedent.id,
  referenceStatus:link.status,atomicDecision};
}
