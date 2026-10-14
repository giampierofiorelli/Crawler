/** Phase138. Tiny real-language pilot on manually checked publisher excerpts.
 * Original TypeScript; no scraping, inference service, weights, new dependency,
 * automatic entity detection, full article snapshot, scientific review or rank.
 * A user/developer attestation of excerpt provenance is NOT authenticated.
 */
import {createHash} from 'node:crypto';
import {inspectLearnedProposal134,type AtomicDecision134} from './phase134_atomic_context_evidence.js';
import type {CandidateRelation131,RelationDocument131} from './phase131_local_relation_learning.js';
const sha138=(s:string)=>createHash('sha256').update(s).digest('hex');
const safeId138=(s:unknown)=>typeof s==='string'&&/^[\w.:-]{1,100}$/.test(s);
const normalized138=(s:string)=>s.normalize('NFKC').toLocaleLowerCase('en').replace(/\s+/g,' ').trim();
const anaphors138=new Set(['it','its','the robot','the device','the model','the vacuum','this model','the unit']);
export type PilotDisposition138='candidate_quarantined'|'rejected_by_context'|
 'abstain_reference_unresolved'|'abstain_variant_not_reviewed'|'abstain_ambiguous_context';
export interface OriginalExcerpt138 {
 id:string;publisherGroupId:string;reviewedProductFamilyId:string;
 url:string;reviewedProductName:string;approvedNameAliases:string[];
 /** Small manually checked ORIGINAL contiguous excerpt, not the full page. */
 text:string;excerptSha256:string;
 subjectLiteral:string;objectLiteral:string;
 label:CandidateRelation131['label'];
 /** Optional caller-attested measured endpoint, never verified by this stage. */
 measurementEndpointId?:string;
 /** A local human interpretation for error inspection, never independent gold. */
 developerExpectation:'text_supports'|'text_contradicts'|'context_insufficient';
 developerReason:string;
 sourceMethod:'manual_public_page_excerpt';
 rights:'full_article_not_licensed_for_redistribution';
}
export interface PilotDecision138 {
 id:string;phase:138;publisherGroupId:string;url:string;
 status:PilotDisposition138;reason:string;
 phase134Status:AtomicDecision134['status']|null;
 modelSurface:string;reviewedProductName:string;
 contextCompleteness:'short_excerpt_only';
 labelOrigin:'developer_review_not_independent';
 expectation:OriginalExcerpt138['developerExpectation'];
 scientificAccuracyClaimAuthorized:false;independentAnnotations:0;
 canonicalWriteAuthorized:false;rankingAuthorized:false;
}
const loc138=(text:string,literal:string)=>{
 const i=text.indexOf(literal);
 if(!literal||i<0||text.indexOf(literal,i+literal.length)!==-1)throw Error('missing_or_repeated_pilot_span_138');
 return {start:i,end:i+literal.length};
};
/** This stage permits a single explicit, page-reviewed product mention through
 * the existing Phase131/132/134 *screen*; Phase135 remains responsible for
 * cross-sentence links. An alias is an upstream *assertion*, never established
 * by surface similarity or a page title alone. Comparator variants abstain. */
export function inspectOriginalExcerpt138(e:OriginalExcerpt138):PilotDecision138{
 if(!e||!safeId138(e.id)||!safeId138(e.publisherGroupId)||!safeId138(e.reviewedProductFamilyId)||
  !/^https:\/\/[^\s/]+\//.test(e.url)||!e.reviewedProductName?.trim()||
  !Array.isArray(e.approvedNameAliases)||!e.approvedNameAliases.length||e.approvedNameAliases.length>8||
  e.approvedNameAliases.some(a=>typeof a!=='string'||a.length>100||!a.trim())||
  typeof e.text!=='string'||e.text.length<12||e.text.length>650||
  e.excerptSha256!==sha138(e.text)||
  (e.measurementEndpointId!==undefined&&!safeId138(e.measurementEndpointId))||
  !['measures','contributes_to','conditioned_on','not_evidence_of'].includes(e.label)||
  !['text_supports','text_contradicts','context_insufficient'].includes(e.developerExpectation)||
  typeof e.developerReason!=='string'||!e.developerReason.trim()||e.developerReason.length>500||
  e.sourceMethod!=='manual_public_page_excerpt'||e.rights!=='full_article_not_licensed_for_redistribution')
  throw Error('invalid_or_unverified_excerpt_138');
 const s=loc138(e.text,e.subjectLiteral),o=loc138(e.text,e.objectLiteral);
 if(!(s.end<=o.start||o.end<=s.start))throw Error('overlapping_pilot_spans_138');
 const base={id:e.id,phase:138 as const,publisherGroupId:e.publisherGroupId,url:e.url,
  modelSurface:e.subjectLiteral,reviewedProductName:e.reviewedProductName,
  contextCompleteness:'short_excerpt_only' as const,labelOrigin:'developer_review_not_independent' as const,
  expectation:e.developerExpectation,scientificAccuracyClaimAuthorized:false as const,
  independentAnnotations:0 as const,canonicalWriteAuthorized:false as const,rankingAuthorized:false as const};
 if(anaphors138.has(normalized138(e.subjectLiteral)))return {...base,status:'abstain_reference_unresolved',
  reason:'short_excerpt_anaphor_without_verified_referent',phase134Status:null};
 const aliases=new Set(e.approvedNameAliases.map(normalized138));
 if(!aliases.has(normalized138(e.subjectLiteral)))return {...base,status:'abstain_variant_not_reviewed',
  reason:'subject_is_not_an_explicitly_approved_alias_of_page_reviewed_product',phase134Status:null};
 // A percentage without an identified endpoint cannot be an interpreted test result.
 // Keep the candidate unresolved even if the number was literally extracted.
 if(e.label==='measures'&&!e.measurementEndpointId)return {...base,status:'abstain_ambiguous_context',
  reason:'measurement_endpoint_not_identified_in_short_excerpt',phase134Status:null};
 const document:RelationDocument131={text:e.text,sha256:e.excerptSha256,
  source:{id:'pilot_'+e.id,originalDocumentId:'excerpt_'+e.id,url:e.url,
   title:'Manually checked partial excerpt, not authenticated article snapshot',role:'original_product_test'}};
 const candidate:CandidateRelation131={subject:e.subjectLiteral,object:e.objectLiteral,
  subjectSpan:s,objectSpan:o,evidenceSpan:{start:0,end:e.text.length},
  label:e.label,sourceId:document.source.id,originalDocumentId:document.source.originalDocumentId,
  sourceContentSha256:document.sha256,evidenceSha256:e.excerptSha256,margin:0,
  rankingAuthorized:false,status:'hypothesis_requires_scientific_review'};
 let atomic:AtomicDecision134;
 try{atomic=inspectLearnedProposal134({document,proposal:candidate});}
 catch{return {...base,status:'abstain_ambiguous_context',
  reason:'phase131_or_132_did_not_validate_context',phase134Status:null};}
 const status:PilotDisposition138=atomic.status==='quarantined_candidate'?'candidate_quarantined':
  atomic.status==='rejected_candidate'?'rejected_by_context':'abstain_ambiguous_context';
 return {...base,status,reason:atomic.reasons.join('|'),phase134Status:atomic.status};
}
export function inspectPilotBatch138(excerpts:readonly OriginalExcerpt138[]):{
 phase:138;sourceCount:number;excerptCount:number;byStatus:Record<PilotDisposition138,number>;
 decisions:PilotDecision138[];independentlyLabeledOriginalCases:0;realAccuracyEstimate:null;
 rankingAuthorized:false;canonicalWriteAuthorized:false;
}{
 if(!Array.isArray(excerpts)||!excerpts.length||excerpts.length>30)throw Error('invalid_pilot_size_138');
 const ids=new Set<string>(),quoteCounts=new Map<string,number>();
 const decisions=excerpts.map(e=>{
  if(ids.has(e.id))throw Error('duplicate_excerpt_id_138');ids.add(e.id);
  // Avoid quoting more than a short, attributed fragment of one source in a release.
  const count=e.text.match(/\S+/g)?.length??0;
  quoteCounts.set(e.url,(quoteCounts.get(e.url)??0)+count);
  return inspectOriginalExcerpt138(e);
 });
 if([...quoteCounts.values()].some(n=>n>25))throw Error('excerpt_quote_budget_exceeded_138');
 const byStatus={} as Record<PilotDisposition138,number>;
 for(const d of decisions)byStatus[d.status]=(byStatus[d.status]??0)+1;
 return {phase:138,sourceCount:new Set(excerpts.map(x=>x.url)).size,excerptCount:excerpts.length,
  byStatus,decisions:decisions.sort((a,b)=>a.id.localeCompare(b.id)),
  independentlyLabeledOriginalCases:0,realAccuracyEstimate:null,
  canonicalWriteAuthorized:false,rankingAuthorized:false};
}
