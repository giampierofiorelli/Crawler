/** Phase143: conservative subject-identity gate for transfer across categories.
 * This module NEVER establishes whether a product really exists or whether the
 * document is authentic. It only distinguishes an exact PAGE HINT alias from a
 * name guessed from typography. Neither is verified external evidence.
 * No category-specific vocabulary, vendor code, or runtime dependencies.
 */
import {readUnmarkedEnglish139,type ReaderInput139,type CandidateDisposition139} from './phase139_unmarked_english_candidate_reader.js';
export type IdentityDisposition143='unverified_surface_name_abstain'|'unresolved_reference_abstain'|
 'page_alias_candidate_only';
export interface SubjectScreen143 {
 pairId:string;baselineStatus:CandidateDisposition139;surfaceSubject:string;
 identityDisposition:IdentityDisposition143; reasons:string[];
 productIdentityVerified:false;sourceAuthenticityVerified:false;
 scientificReviewRequired:true;canonicalWriteAuthorized:false;rankingAuthorized:false;
}
export interface CrossDomainResult143 {
 phase:143;sourceId:string;documentSha256:string;
 baselinePairCount:number;identityScreens:SubjectScreen143[];
 unverifiedSurfaceNames:number;pageAliasCandidates:number;
 independentGoldAnnotations:0;domainAccuracy:null;
 scientificReviewRequired:true;canonicalWriteAuthorized:false;rankingAuthorized:false;
}
export function screenCrossDomainSubjects143(input:ReaderInput139):CrossDomainResult143{
 const b=readUnmarkedEnglish139(input), screens:SubjectScreen143[]=[];
 let unverifiedSurfaceNames=0,pageAliasCandidates=0;
 for(const p of b.pairs){
  const m=b.mentions.find(x=>x.id===p.subjectMentionId);
  const matched=m?.type==='product_name'&&m.identityClaim==='page_alias_asserted_not_authenticated';
  const guessed=m?.type==='product_name'&&!matched;
  const disposition:IdentityDisposition143=matched?'page_alias_candidate_only':
   guessed?'unverified_surface_name_abstain':'unresolved_reference_abstain';
  const reasons=[matched?'caller_supplied_page_alias_not_externally_authenticated':
   guessed?'typographic_name_guess_cannot_establish_product_identity':
   'reference_without_resolved_subject'];
  if(disposition==='unverified_surface_name_abstain')unverifiedSurfaceNames++;
  if(disposition==='page_alias_candidate_only')pageAliasCandidates++;
  screens.push({pairId:p.id,baselineStatus:p.status,
   surfaceSubject:m?.literal??input.document.text.slice(p.subjectSpan.start,p.subjectSpan.end),
   identityDisposition:disposition,reasons,productIdentityVerified:false,
   sourceAuthenticityVerified:false,scientificReviewRequired:true,
   canonicalWriteAuthorized:false,rankingAuthorized:false});
 }
 return {phase:143,sourceId:b.sourceId,documentSha256:b.documentSha256,
  baselinePairCount:b.pairs.length,identityScreens:screens,unverifiedSurfaceNames,pageAliasCandidates,
  independentGoldAnnotations:0,domainAccuracy:null,scientificReviewRequired:true,
  canonicalWriteAuthorized:false,rankingAuthorized:false};
}
