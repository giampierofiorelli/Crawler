/**
 * Phase137 — source-custody and blind annotation protocol for the PEE evidence screen.
 *
 * This code does NOT download copyrighted articles, authenticate permissions or
 * establish human-reviewer identities. A web URL, checksum or pair of user IDs
 * cannot establish legal rights, genuinely independent judgement, preregistration,
 * or scientific accuracy. Machine screening is never shown to blind annotators.
 *
 * No new runtime dependencies; this module never touches ranking or canonical data.
 */
import {createHash} from 'node:crypto';
import type {BenchmarkCase136,GoldEvidence136,GoldVote136} from './phase136_independent_signal_benchmark.js';
import {manifestDigest136,evaluateCorpus136, type CorpusEvaluation136} from './phase136_independent_signal_benchmark.js';

const hash137=(s:string)=>createHash('sha256').update(s).digest('hex');
const validId137=(s:unknown):s is string=>typeof s==='string'&&/^[A-Za-z0-9_.:-]{1,100}$/.test(s);
const validHash137=(s:unknown):s is string=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const validUrl137=(s:unknown):s is string=>{
 if(typeof s!=='string'||s.length>1500)return false;
 try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password&&!u.hash&&
  u.hostname.includes('.')&&!u.hostname.endsWith('.example.org')&&!u.hostname.endsWith('.invalid');}
 catch{return false;}
};
export interface SourceCandidate137 {
 id:string;url:string;publisherHost:string;publisherGroupId:string;
 categoryId:string;productFamilyId:string;reviewedProduct:string;
 originalSourceStatus:'publisher_declares_original_testing'|'not_yet_verified';
 rightsStatus:'not_established';
 snapshotStatus:'not_collected';
 /** Discoverability is not publisher authorization or an inspected snapshot. */
 stage:'url_discovered_only';
}
export interface InventoryAudit137 {
 phase:137;sourceCount:number;publisherHosts:string[];productFamilies:string[];
 originalSnapshots:0;rightsVerified:0;independentlyAnnotatedCases:0;
 releaseEligible:false;rankingAuthorized:false;canonicalWriteAuthorized:false;
 candidates:SourceCandidate137[];
 warnings:string[];
}
/** An inventory of externally located URLs, never a claim about article contents. */
export function auditSourceInventory137(sources:readonly SourceCandidate137[]):InventoryAudit137 {
 if(!Array.isArray(sources)||sources.length>100)throw Error('invalid_inventory_size_137');
 const ids=new Set<string>(),urls=new Set<string>();
 for(const s of sources){
  if(!s||!validId137(s.id)||!validId137(s.publisherGroupId)||
   !validId137(s.categoryId)||!validId137(s.productFamilyId)||
   !validUrl137(s.url)||typeof s.publisherHost!=='string'||
   new URL(s.url).hostname.toLowerCase()!==s.publisherHost.toLowerCase()||
   !/^[a-z0-9.-]{4,200}$/.test(s.publisherHost)||
   typeof s.reviewedProduct!=='string'||!s.reviewedProduct.trim()||s.reviewedProduct.length>150||
   !['publisher_declares_original_testing','not_yet_verified'].includes(s.originalSourceStatus)||
   s.rightsStatus!=='not_established'||s.snapshotStatus!=='not_collected'||
   s.stage!=='url_discovered_only')throw Error('invalid_source_inventory_item_137');
  if(ids.has(s.id)||urls.has(s.url))throw Error('duplicate_inventory_item_137');
  ids.add(s.id);urls.add(s.url);
 }
 return {phase:137,sourceCount:sources.length,
  publisherHosts:[...new Set(sources.map(x=>x.publisherHost))].sort(),
  productFamilies:[...new Set(sources.map(x=>x.productFamilyId))].sort(),
  originalSnapshots:0,rightsVerified:0,independentlyAnnotatedCases:0,
  releaseEligible:false,rankingAuthorized:false,canonicalWriteAuthorized:false,
  candidates:[...sources].sort((a,b)=>a.id.localeCompare(b.id)),
  warnings:['PUBLIC_URL_NOT_A_LICENSE','ORIGINAL_SOURCE_AND_VARIANT_REQUIRE_MANUAL_VERIFICATION',
   'NO_DOCUMENT_SNAPSHOT','NO_HUMAN_ANNOTATIONS','NO_SCIENTIFIC_ACCURACY_ESTIMATE']};
}

export type ReferenceLabel137='same_entity'|'different_entity'|'unresolved';
/** Does not contain results from Phase134/135/136, signals, model margins, or gold labels. */
export interface BlindPacket137 {
 protocol:'PEE_BLIND_SOURCE_EVIDENCE_V1';id:string;split:'development'|'frozen_holdout';
 sourceGroupId:string;productFamilyId:string;categoryId:string;
 sourceUrl:string;originalDocumentId:string;sourceSha256:string;
 documentText:string;subject:{literal:string;start:number;end:number};
 object:{literal:string;start:number;end:number};
 evidence:{literal:string;start:number;end:number};
 relationLabel:string;subjectMentionId:string;objectMentionId:string;
 blindPacketDigest:string;
 rankingAuthorized:false;canonicalWriteAuthorized:false;
}
const packetPayload137=(p:Omit<BlindPacket137,'blindPacketDigest'|'rankingAuthorized'|'canonicalWriteAuthorized'>)=>
 JSON.stringify(p);
export function makeBlindPacket137(c:BenchmarkCase136):BlindPacket137 {
 if(!c||!validId137(c.id)||!validUrl137(c.document?.source?.url)||
  !validHash137(c.document?.sha256)||hash137(c.document.text)!==c.document.sha256||
  c.document.text.length>25000||!c.proposal||
  c.proposal.sourceId!==c.document.source.id||
  c.proposal.originalDocumentId!==c.document.source.originalDocumentId||
  c.proposal.sourceContentSha256!==c.document.sha256||
  !validHash137(c.proposal.evidenceSha256)||
  !c.proposal.evidenceSpan||
  !Number.isSafeInteger(c.proposal.evidenceSpan.start)||
  !Number.isSafeInteger(c.proposal.evidenceSpan.end)||
  c.proposal.evidenceSpan.start<0||
  c.proposal.evidenceSpan.end>c.document.text.length||
  c.proposal.evidenceSpan.start>=c.proposal.evidenceSpan.end||
  hash137(c.document.text.slice(c.proposal.evidenceSpan.start,c.proposal.evidenceSpan.end))!==c.proposal.evidenceSha256||
  !validId137(c.subjectMentionId)||!validId137(c.objectMentionId)||
  !validId137(c.metadata?.sourceGroupId)||!validId137(c.metadata?.productFamilyId)||
  !validId137(c.metadata?.categoryId)||
  (c.metadata.origin==='original_professional'&&c.metadata.permission!=='evaluation_authorized')||
  !['development','frozen_holdout'].includes(c.split))throw Error('invalid_blind_source_137');
 const pair=(span:{start:number;end:number},literal:string)=>{
  if(!span||!Number.isSafeInteger(span.start)||!Number.isSafeInteger(span.end)||
   span.start<0||span.end>c.document.text.length||span.start>=span.end||
   c.document.text.slice(span.start,span.end)!==literal)throw Error('unanchored_annotation_span_137');
  return {literal,start:span.start,end:span.end};
 };
 const plain={protocol:'PEE_BLIND_SOURCE_EVIDENCE_V1' as const,
  id:c.id,split:c.split,sourceGroupId:c.metadata.sourceGroupId,
  productFamilyId:c.metadata.productFamilyId,categoryId:c.metadata.categoryId,
  sourceUrl:c.document.source.url,originalDocumentId:c.document.source.originalDocumentId,
  sourceSha256:c.document.sha256,documentText:c.document.text,
  subject:pair(c.proposal.subjectSpan,c.proposal.subject),
  object:pair(c.proposal.objectSpan,c.proposal.object),
  evidence:pair(c.proposal.evidenceSpan,c.document.text.slice(c.proposal.evidenceSpan.start,c.proposal.evidenceSpan.end)),
  relationLabel:c.proposal.label,subjectMentionId:c.subjectMentionId,objectMentionId:c.objectMentionId};
 return {...plain,blindPacketDigest:hash137(packetPayload137(plain)),
  rankingAuthorized:false,canonicalWriteAuthorized:false};
}
export interface BlindVote137 {
 packetId:string;packetDigest:string;annotatorId:string;
 textSupport:GoldEvidence136;reference:ReferenceLabel137;
 /** Optional written reason, never an algorithm output. */
 rationale?:string;
}
export type AdjudicationStatus137='consensus'|'disagreement_needs_external_adjudication'|'insufficient_votes';
export interface Adjudication137 {
 caseId:string;status:AdjudicationStatus137;
 gold:GoldEvidence136|null;reference:ReferenceLabel137|null;
 votesReceived:number;independenceExternallyVerified:false;
 annotationBlindnessExternallyVerified:false;rankingAuthorized:false;canonicalWriteAuthorized:false;
}
export function adjudicateBlindVotes137(p:BlindPacket137,votes:readonly BlindVote137[]):Adjudication137 {
 const {blindPacketDigest,rankingAuthorized,canonicalWriteAuthorized,...payload}=p;
 if(!validHash137(blindPacketDigest)||hash137(packetPayload137(payload))!==blindPacketDigest||
  rankingAuthorized!==false||canonicalWriteAuthorized!==false)throw Error('modified_blind_packet_137');
 if(!Array.isArray(votes)||votes.length>12)throw Error('invalid_vote_batch_137');
 const ids=new Set<string>();
 for(const v of votes){
  if(!v||!validId137(v.annotatorId)||ids.has(v.annotatorId)||
   v.packetId!==p.id||v.packetDigest!==p.blindPacketDigest||
   !['supported_by_passage','contradicted_by_passage','indeterminate_from_passage'].includes(v.textSupport)||
   !['same_entity','different_entity','unresolved'].includes(v.reference)||
   v.rationale!==undefined&&(typeof v.rationale!=='string'||v.rationale.length>1000))
   throw Error('invalid_or_duplicate_blind_vote_137');
  ids.add(v.annotatorId);
 }
 let status:AdjudicationStatus137='insufficient_votes',gold:GoldEvidence136|null=null,
  reference:ReferenceLabel137|null=null;
 if(votes.length>=2){
  const g=new Set(votes.map(x=>x.textSupport)),r=new Set(votes.map(x=>x.reference));
  if(g.size===1&&r.size===1){status='consensus';gold=votes[0].textSupport;reference=votes[0].reference;}
  else status='disagreement_needs_external_adjudication';
 }
 return {caseId:p.id,status,gold,reference,votesReceived:votes.length,
  independenceExternallyVerified:false,annotationBlindnessExternallyVerified:false,
  rankingAuthorized:false,canonicalWriteAuthorized:false};
}
/** Optional review workflow is provided before any model outputs are created.
 * Digests must also be preserved by an independent system before tuning. */
export function blindCorpusDigest137(cases:readonly BenchmarkCase136[]):string {
 if(!Array.isArray(cases)||cases.length>120)throw Error('unbounded_blind_corpus_137');
 const ids=new Set<string>();
 const packets=cases.map(c=>{
  if(ids.has(c.id))throw Error('duplicate_blind_case_137');ids.add(c.id);
  const p=makeBlindPacket137(c);
  return {id:p.id,digest:p.blindPacketDigest,origin:c.metadata.origin,
   permission:c.metadata.permission,phenomena:[...new Set(c.metadata.phenomena)].sort(),
   mentions:[...c.mentions].sort((a,b)=>a.id.localeCompare(b.id)),
   reviewedLinks:[...(c.reviewedLinks??[])].sort((a,b)=>a.id.localeCompare(b.id))};
 }).sort((a,b)=>a.id.localeCompare(b.id));
 return hash137(JSON.stringify(packets));
}

/** Unicode-folded word-shingle fingerprint. This is a leakage guard, not an
 * identity detector. Short formulaic tests can be false positives; cases are
 * quarantined for review instead of silently entering a test holdout. */
function shingles137(raw:string):Set<string>{
 const words=raw.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(/\s+/).filter(Boolean);
 const result=new Set<string>(),size=Math.min(5,words.length);
 if(!size)return result;
 for(let i=0;i<=words.length-size;i++)result.add(words.slice(i,i+size).join(' '));
 return result;
}
export interface LeakageFlag137 {developmentId:string;holdoutId:string;reason:'normalized_duplicate'|'high_shingle_overlap';similarity:number;}
export function inspectCrossSplitNearDuplicates137(cases:readonly BenchmarkCase136[]):LeakageFlag137[]{
 if(!Array.isArray(cases)||cases.length>120)throw Error('unbounded_leakage_check_137');
 const train=cases.filter(c=>c.split==='development');
 const test=cases.filter(c=>c.split==='frozen_holdout');
 const sets=new Map(cases.map(c=>[c.id,shingles137(c.document.text)]));
 const flags:LeakageFlag137[]=[];
 for(const a of train)for(const b of test){
  const left=sets.get(a.id)!,right=sets.get(b.id)!;
  if(!left.size||!right.size)continue;
  const count=[...left].filter(x=>right.has(x)).length;
  const containment=count/Math.min(left.size,right.size);
  const normalizedEqual=left.size===right.size&&count===left.size;
  if(normalizedEqual||containment>=0.84){
   flags.push({developmentId:a.id,holdoutId:b.id,
    reason:normalizedEqual?'normalized_duplicate':'high_shingle_overlap',similarity:containment});
  }
 }
 return flags.sort((a,b)=>a.developmentId.localeCompare(b.developmentId)||a.holdoutId.localeCompare(b.holdoutId));
}

export interface Run137 {
 phase:137;blindCorpusDigest:string;blindCorpusDigestMatched:true;
 annotationPackets:number;consensusCases:number;disagreementCases:number;
 missingVotes:number;nearDuplicateFlags:LeakageFlag137[];
 fullyScorableOriginalHoldoutCases:number;phase136:CorpusEvaluation136;
 annotatorIndependenceVerified:false;rightsAuthenticated:false;
 preregistrationExternallyVerified:false;scientificAccuracyClaimAuthorized:false;
 rankingAuthorized:false;canonicalWriteAuthorized:false;warnings:string[];
}
export function evaluateBlindAnnotatedCorpus137(args:{cases:readonly BenchmarkCase136[];
 votes:Readonly<Record<string,readonly BlindVote137[]>>;expectedBlindCorpusDigest:string;}):Run137{
 const digest=blindCorpusDigest137(args.cases);
 if(digest!==args.expectedBlindCorpusDigest)throw Error('unfrozen_or_modified_blind_corpus_137');
 const nearDuplicateFlags=inspectCrossSplitNearDuplicates137(args.cases);
 if(nearDuplicateFlags.length)throw Error('potential_cross_split_near_duplicate_137');
 // Phase136 validates exact document and declared source/hostname/product split leakage.
 const prepared:BenchmarkCase136[]=[];let consensusCases=0,disagreementCases=0,missingVotes=0;
 const caseIds=new Set(args.cases.map(c=>c.id));
 if(Object.keys(args.votes).some(k=>!caseIds.has(k)))throw Error('votes_for_unknown_cases_137');
 for(const c of args.cases){
  if(c.goldVotes?.length)throw Error('gold_already_visible_before_blind_annotation_137');
  const p=makeBlindPacket137(c),votes=args.votes[c.id]??[];
  const decision=adjudicateBlindVotes137(p,votes);
  if(decision.status==='consensus')consensusCases++;
  else if(decision.status==='insufficient_votes')missingVotes++;
  else disagreementCases++;
  // Equal *textual* votes do not suffice if the subject referent is uncertain.
  // There is never a synthesized reviewer identity or an automatic gold label.
  const eligible=decision.status==='consensus'&&decision.reference==='same_entity'&&
   c.metadata.origin==='original_professional'&&c.metadata.permission==='evaluation_authorized';
  const goldVotes:GoldVote136[]|undefined=eligible?votes.map(v=>({annotatorId:v.annotatorId,label:v.textSupport})):undefined;
  prepared.push({...c,goldVotes});
 }
 // Historical Phase136 uses digest over the final, sealed *annotation-inclusive* set.
 const scoring=evaluateCorpus136({cases:prepared,expectedManifestDigest:manifestDigest136(prepared)});
 return {phase:137,blindCorpusDigest:digest,blindCorpusDigestMatched:true,
  annotationPackets:args.cases.length,consensusCases,disagreementCases,missingVotes,
  nearDuplicateFlags,fullyScorableOriginalHoldoutCases:scoring.counts.descriptivelyScorableHoldout,
  phase136:scoring,annotatorIndependenceVerified:false,rightsAuthenticated:false,
  preregistrationExternallyVerified:false,scientificAccuracyClaimAuthorized:false,
  rankingAuthorized:false,canonicalWriteAuthorized:false,
  warnings:['EXTERNAL_ANNOTATOR_INDEPENDENCE_NOT_VERIFIED',
   'RIGHTS_PERMISSION_AND_ORIGINAL_SOURCE_ARE_CALLER_ATTESTATIONS',
   'LOCAL_DIGEST_IS_NOT_AN_EXTERNALLY_TIMESTAMPED_PREREGISTRATION',
   'SCORES_ARE_DESCRIPTIVE_ONLY_AND_NEVER_SCIENTIFIC_FACTS',
   ...(scoring.counts.descriptivelyScorableHoldout===0?['ZERO_ELIGIBLE_ORIGINAL_HOLDOUT_CASES']:[])]};
}
