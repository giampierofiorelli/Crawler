/** Phase150 — executable, read-only discourse-reference audit and annotation benchmark.
 * Compares actual PEE Phase149 hypotheses to span-grounded labels. Nothing here
 * authenticates a source, verifies coreference, learns from gold or writes facts.
 * All labels, rights, split assignment and reviewer independence are caller claims.
 */
import {createHash} from 'node:crypto';
import {readBidirectionalDocument149, type BidirectionalDocumentGraph149, type Proposal149} from './phase149_bidirectional_discourse_candidates.js';
import type {ReaderInput139} from './phase139_unmarked_english_candidate_reader.js';

const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
const id=(s:unknown):s is string=>typeof s==='string'&&/^[A-Za-z0-9_.:-]{1,100}$/.test(s);
export type ReferenceTruth150='same_textual_referent'|'different_referent'|'unresolved_from_passage';
export type ReferencePrediction150='proposed_unverified'|'blocked_or_abstained'|'not_detected';
export interface SpanLabel150 {start:number;end:number;literal:string;}
export interface ReferenceVote150 {reviewerId:string;truth:ReferenceTruth150;targetSpan?:SpanLabel150;}
export interface ReferenceAnnotation150 {id:string;mention:SpanLabel150;votes:readonly ReferenceVote150[];phenomenon:
 'forward'|'backward'|'cross_paragraph'|'variant'|'component'|'comparison'|'condition'|'other';}
export interface ReferenceCase150 {id:string;split:'development'|'frozen_holdout';
  origin:'constructed'|'original_professional';permission:'evaluation_authorized'|'unestablished';
  sourceGroupId:string;productFamilyId:string;categoryId:string;input:ReaderInput139;
  annotations:readonly ReferenceAnnotation150[];}
export interface ReferenceRow150 {caseId:string;annotationId:string;split:ReferenceCase150['split'];
  origin:ReferenceCase150['origin'];categoryId:string;phenomenon:ReferenceAnnotation150['phenomenon'];
  predicted:ReferencePrediction150;proposalStatus:string|null;candidateCount:number;
  gold:ReferenceTruth150|null;scorableIndependentlyAttested:boolean;goldExclusion:string|null;
  targetNamedSurfaceInCandidates:boolean|null;correctTentativeLink:boolean|null;
  falseTentativeLink:boolean|null;missedTextualLink:boolean|null;
  sourceAuthenticated:false;identityAuthenticated:false;canonicalWriteAuthorized:false;rankingAuthorized:false;}
export interface ReferenceCounts150 {total:number;withGold:number;proposed:number;abstained:number;undetected:number;
 correctTentative:number;falseTentative:number;missedLink:number;precisionAmongProposals:number|null;
 linkedRecallAmongSame:number|null;coverage:number|null;}
export interface ReferenceReport150 {phase:150;manifestSha256:string;expectedManifestMatched:boolean;
 rows:ReferenceRow150[];developmentDescriptive:ReferenceCounts150;holdoutAttested:ReferenceCounts150;
 byPhenomenon:Record<string,ReferenceCounts150>;byCategory:Record<string,ReferenceCounts150>;
 warnings:string[];preregistrationIndependentlyVerified:false;reviewerIndependenceVerified:false;
 originAuthenticityVerified:false;rightsIndependentlyVerified:false;scientificAccuracyAuthorized:false;
 noCandidateMeaning:'unseen_or_unlinked_reference_is_not_absence_of_product_evidence';
 canonicalWriteAuthorized:false;rankingAuthorized:false;}
const validSpan=(text:string,s:SpanLabel150)=>s&&Number.isSafeInteger(s.start)&&Number.isSafeInteger(s.end)&&s.start>=0&&s.end>s.start&&
 s.end<=text.length&&text.slice(s.start,s.end)===s.literal;
const phenomenon=new Set<ReferenceAnnotation150['phenomenon']>(['forward','backward','cross_paragraph','variant','component','comparison','condition','other']);
export function validateReferenceCorpus150(cases:readonly ReferenceCase150[]):void{
 if(!Array.isArray(cases)||cases.length>150)throw Error('invalid_corpus_size_150');
 const caseIds=new Set<string>(),devSources=new Set<string>(),testSources=new Set<string>(),devHosts=new Set<string>(),testHosts=new Set<string>(),
  devFamilies=new Set<string>(),testFamilies=new Set<string>(),splitByHash=new Map<string,string>();
 for(const c of cases){
  if(!c||![c.id,c.sourceGroupId,c.productFamilyId,c.categoryId].every(id)||caseIds.has(c.id)||
   !['development','frozen_holdout'].includes(c.split)||!['constructed','original_professional'].includes(c.origin)||
   !['evaluation_authorized','unestablished'].includes(c.permission)||!c.input?.document||
   typeof c.input.document.text!=='string'||c.input.document.text.length>250000||
   !c.input.document.text.trim()||!Array.isArray(c.annotations)||c.annotations.length>300||
   c.input.document.sha256!==hash(c.input.document.text))throw Error('invalid_case_150');
  caseIds.add(c.id);
  const source=c.input.document.source;
  if(!source||!id(source.id)||!id(source.originalDocumentId)||typeof source.url!=='string')throw Error('invalid_source_150');
  let hostname:string;try{const u=new URL(source.url);if(u.protocol!=='https:')throw Error();hostname=u.hostname.toLowerCase();}catch{throw Error('invalid_source_url_150');}
  const [groups,hosts,families]=c.split==='development'?[devSources,devHosts,devFamilies]:[testSources,testHosts,testFamilies];
  groups.add(c.sourceGroupId);hosts.add(hostname);families.add(c.productFamilyId);
  const prior=splitByHash.get(c.input.document.sha256);if(prior&&prior!==c.split)throw Error('duplicate_text_between_splits_150');
  splitByHash.set(c.input.document.sha256,c.split);
  const annIds=new Set<string>();
  for(const a of c.annotations){
   if(!a||!id(a.id)||annIds.has(a.id)||!phenomenon.has(a.phenomenon)||
    !validSpan(c.input.document.text,a.mention)||!Array.isArray(a.votes)||a.votes.length>12)throw Error('invalid_annotation_150');
   annIds.add(a.id);const voters=new Set<string>();
   for(const v of a.votes){
    if(!v||!id(v.reviewerId)||voters.has(v.reviewerId)||
      !['same_textual_referent','different_referent','unresolved_from_passage'].includes(v.truth)||
      (v.targetSpan&&!validSpan(c.input.document.text,v.targetSpan))||
      (v.truth==='same_textual_referent'&&!v.targetSpan)||
      (v.truth!=='same_textual_referent'&&v.targetSpan))throw Error('invalid_annotation_vote_150');
    voters.add(v.reviewerId);
   }
  }
 }
 if([...devSources].some(x=>testSources.has(x))||[...devHosts].some(x=>testHosts.has(x))||
  [...devFamilies].some(x=>testFamilies.has(x)))throw Error('development_holdout_leakage_150');
}
/** Deterministic manifest. Reproducible checksum does not authenticate when it was frozen. */
export function referenceManifest150(cases:readonly ReferenceCase150[]):string{
 validateReferenceCorpus150(cases);
 return hash(JSON.stringify([...cases].map(c=>({id:c.id,split:c.split,origin:c.origin,permission:c.permission,
  sourceGroupId:c.sourceGroupId,productFamilyId:c.productFamilyId,categoryId:c.categoryId,
  source:c.input.document.source,documentSha256:c.input.document.sha256,
  pageIdentity:c.input.pageIdentity??null,annotations:[...c.annotations].map(a=>({...a,votes:[...a.votes].sort((x,y)=>x.reviewerId.localeCompare(y.reviewerId))})).sort((a,b)=>a.id.localeCompare(b.id))
 })).sort((a,b)=>a.id.localeCompare(b.id))));
}
const isProposed=(p:Proposal149|undefined)=>p?.status==='prior_candidate_unverified'||
 p?.status==='forward_candidate_unverified'||p?.status==='cross_paragraph_candidate_unverified';
function independentlyScorable(c:ReferenceCase150,a:ReferenceAnnotation150):{gold:ReferenceTruth150|null;target:SpanLabel150|null;reason:string|null}{
 if(c.split!=='frozen_holdout')return {gold:null,target:null,reason:'development_not_holdout'};
 if(c.origin!=='original_professional')return {gold:null,target:null,reason:'constructed_not_original'};
 if(c.permission!=='evaluation_authorized')return {gold:null,target:null,reason:'rights_not_established'};
 if(a.votes.length<2)return {gold:null,target:null,reason:'fewer_than_two_votes'};
 if(a.votes.some(v=>v.truth!==a.votes[0].truth))return {gold:null,target:null,reason:'reviewer_label_disagreement'};
 if(a.votes[0].truth==='same_textual_referent'&&a.votes.some(v=>v.targetSpan?.start!==a.votes[0].targetSpan?.start||v.targetSpan?.end!==a.votes[0].targetSpan?.end))
  return {gold:null,target:null,reason:'reviewer_target_disagreement'};
 return {gold:a.votes[0].truth,target:a.votes[0].targetSpan??null,reason:null};
}
function descriptiveGold(a:ReferenceAnnotation150):{gold:ReferenceTruth150|null;target:SpanLabel150|null}{
 if(!a.votes.length||a.votes.some(v=>v.truth!==a.votes[0].truth))return {gold:null,target:null};
 if(a.votes[0].truth==='same_textual_referent'&&a.votes.some(v=>v.targetSpan?.start!==a.votes[0].targetSpan?.start||v.targetSpan?.end!==a.votes[0].targetSpan?.end))return {gold:null,target:null};
 return {gold:a.votes[0].truth,target:a.votes[0].targetSpan??null};
}
function scoreRows(rows:ReferenceRow150[]):ReferenceCounts150{
 const gold=rows.filter(r=>r.gold!==null),proposals=rows.filter(r=>r.predicted==='proposed_unverified');
 const withGoldProposals=gold.filter(r=>r.predicted==='proposed_unverified');
 const correct=gold.filter(r=>r.correctTentativeLink===true).length;
 const same=gold.filter(r=>r.gold==='same_textual_referent');
 return {total:rows.length,withGold:gold.length,proposed:proposals.length,
  abstained:rows.filter(r=>r.predicted==='blocked_or_abstained').length,
  undetected:rows.filter(r=>r.predicted==='not_detected').length,
  correctTentative:correct,falseTentative:gold.filter(r=>r.falseTentativeLink===true).length,
  missedLink:gold.filter(r=>r.missedTextualLink===true).length,
  precisionAmongProposals:withGoldProposals.length?correct/withGoldProposals.length:null,
  linkedRecallAmongSame:same.length?correct/same.length:null,
  coverage:rows.length?proposals.length/rows.length:null};
}
export function evaluateDocumentReferences150(cases:readonly ReferenceCase150[],expectedManifestSha256?:string):ReferenceReport150{
 const manifestSha256=referenceManifest150(cases);
 if(expectedManifestSha256!==undefined&&expectedManifestSha256!==manifestSha256)throw Error('frozen_manifest_mismatch_150');
 const rows:ReferenceRow150[]=[];const warnings:string[]=[];
 for(const c of cases){
  const graph:BidirectionalDocumentGraph149=readBidirectionalDocument149(c.input);
  if(graph.coverageTruncated)warnings.push(`${c.id}:extractor_truncated`);
  for(const a of c.annotations){
   const candidate=graph.proposals.find(p=>p.mention.start===a.mention.start&&p.mention.end===a.mention.end);
   const pred:ReferencePrediction150=!candidate?'not_detected':isProposed(candidate)?'proposed_unverified':'blocked_or_abstained';
   const scored=independentlyScorable(c,a),descriptive=descriptiveGold(a);
   const use=c.split==='development'?descriptive:{gold:scored.gold,target:scored.target};
   const candidateSpans=(candidate?.candidateAnchorIds??[]).map(cid=>graph.baseline148.anchors.find(an=>an.id===cid)?.span).filter(x=>x!==undefined);
   const match=use.target?candidateSpans.some(s=>s!.start===use.target!.start&&s!.end===use.target!.end):null;
   const correctness=use.gold===null?null:pred==='proposed_unverified'&&use.gold==='same_textual_referent'&&match===true&&candidateSpans.length===1;
   const falseLink=use.gold===null?null:pred==='proposed_unverified'&&!correctness;
   const missed=use.gold===null?null:use.gold==='same_textual_referent'&&!correctness;
   rows.push({caseId:c.id,annotationId:a.id,split:c.split,origin:c.origin,categoryId:c.categoryId,
    phenomenon:a.phenomenon,predicted:pred,proposalStatus:candidate?.status??null,
    candidateCount:candidate?.candidateAnchorIds.length??0,gold:use.gold,
    scorableIndependentlyAttested:scored.gold!==null,goldExclusion:scored.reason,
    targetNamedSurfaceInCandidates:match,correctTentativeLink:correctness,
    falseTentativeLink:falseLink,missedTextualLink:missed,
    sourceAuthenticated:false,identityAuthenticated:false,canonicalWriteAuthorized:false,rankingAuthorized:false});
  }
 }
 const groups=(key:(r:ReferenceRow150)=>string)=>{
  const obj:Record<string,ReferenceCounts150>={};for(const k of [...new Set(rows.map(key))].sort())obj[k]=scoreRows(rows.filter(r=>key(r)===k));return obj;
 };
 const eligible=rows.filter(r=>r.scorableIndependentlyAttested);
 if(!eligible.length)warnings.push('no_eligible_independent_original_review_annotations');
 if(rows.some(r=>r.split==='frozen_holdout'&&!r.scorableIndependentlyAttested))warnings.push('holdout_unscored_without_two_consistent_authorized_original_votes');
 return {phase:150,manifestSha256,expectedManifestMatched:expectedManifestSha256===undefined||expectedManifestSha256===manifestSha256,
  rows,developmentDescriptive:scoreRows(rows.filter(r=>r.split==='development')),
  holdoutAttested:scoreRows(eligible),byPhenomenon:groups(r=>r.phenomenon),byCategory:groups(r=>r.categoryId),warnings,
  preregistrationIndependentlyVerified:false,reviewerIndependenceVerified:false,originAuthenticityVerified:false,
  rightsIndependentlyVerified:false,scientificAccuracyAuthorized:false,
  noCandidateMeaning:'unseen_or_unlinked_reference_is_not_absence_of_product_evidence',
  canonicalWriteAuthorized:false,rankingAuthorized:false};
}
