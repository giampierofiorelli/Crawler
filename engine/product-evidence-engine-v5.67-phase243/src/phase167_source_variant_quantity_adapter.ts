/** Phase167 — evidence-preserving 145 -> 166 bridge. No scientific evidence promotion.
 * Read the ORIGINAL source text through Phase145, bind only exact explicitly
 * supplied subject surfaces to a DECLARED variant, and preview against Phase166
 * quantified request candidates. These are RESEARCH hypotheses, NOT approved
 * independent test evidence, user-confirmed requirements, product exclusions,
 * performance claims, or a public ranking. No external dependencies.
 */
import {createHash} from 'node:crypto';
import {readDimensionalContext145,type NumericCandidate145,type Role145} from './phase145_unit_context_bridge.js';
import {auditQuantifiedRequest166,screenQuestionEvidence166,
 type Metric166,type EvidenceBridge166,type QuantityCandidate166} from './phase166_quantified_evidence_bridge.js';
import type {ReaderInput139} from './phase139_unmarked_english_candidate_reader.js';
import type {RequestOutput164} from './phase164_user_request_journey.js';

const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
const validId=(x:unknown):x is string=>typeof x==='string'&&/^[a-z][a-z0-9_]{0,80}$/.test(x);
const alias=(v:string)=>v.normalize('NFKC').trim().toLocaleLowerCase('en').replace(/^the\s+/,'').replace(/\s+/g,' ');
const metricUnit:Partial<Record<Metric166,string>>={width:'cm',height:'cm',depth:'cm',capacity:'L',weight:'kg',noise:'dBA'};
export interface DeclaredSourceIdentity167 {
 /** A binding asserted by a research input; NOT proof of real-world identity. */
 productId:string;variantId:string;sourceId:string;originalDocumentId:string;
 documentSha256:string;reviewedAliases:readonly string[];
 identityIndependentlyAuthenticated:false;sourceIndependentlyAuthenticated:false;
}
export type CandidateDisposition167='candidate_pending_scientific_review'|'identity_unbound'|
 'wrong_or_unreviewed_variant_surface'|'not_observed_candidate'|'metric_ambiguous'|
 'unit_or_dimension_unmapped'|'source_scope_not_bound';
export interface CandidateMeasure167 {
 id:string;sourceId:string;originalDocumentId:string;documentSha256:string;
 originalMeasurementId:string;productId:string|null;variantId:string|null;
 quantitySpan:{start:number;end:number;literal:string;sha256:string};
 sentenceSpan:{start:number;end:number;literal:string;sha256:string};
 subjectSpan:{start:number;end:number;literal:string;sha256:string}|null;
 role145:Role145;disposition:CandidateDisposition167;
 metric:Exclude<Metric166,'unbound_dimension'>|null;
 canonicalValue:number|null;canonicalUnit:string|null;
 observations166Created:0;identityVerified:false;sourceVerified:false;
 scientificMeasurementApproved:false;protocolComparable:false;rankingAuthorized:false;
}
export interface ResearchMatch167 {
 productId:string;variantId:string;quantityId:string;candidateMeasureId:string;
 potentialNumericFit:boolean|null;status:'source_candidate_unapproved';
 constraintsConfirmed:false;sourceAuthenticated:false;variantAuthenticated:false;
 eligibleForExclusion:false;eligibleForRanking:false;
}
export interface Preview167 {
 phase:167;sourceQuestionSha256:string;
 sourceDocumentIds:readonly string[];
 candidateMeasures:readonly CandidateMeasure167[];
 potentialMatches:readonly ResearchMatch167[];
 unpromotedPhase166:EvidenceBridge166;
 researchObligations:readonly string[];
 totalMeasurements:number;documentsCoverageTruncated:boolean;
 candidateOnly:true;scientificApprovals:0;productRankingAuthorized:false;
 publicationAuthorized:false;
}
function classify(m:NumericCandidate145):{metric:CandidateMeasure167['metric'];value:number|null;unit:string|null}{
 const {dimension,canonicalUnit,canonicalValue}=m;
 if(!Number.isFinite(canonicalValue))return {metric:null,value:null,unit:null};
 if(dimension==='mass'&&canonicalUnit==='kg')return {metric:'weight',value:canonicalValue,unit:'kg'};
 if(dimension==='sound_pressure_level'&&canonicalUnit==='dBA'&&m.acousticWeighting==='A'){
  // An unqualified speaker/output dBA reading is not assumed to be appliance noise.
  const context=m.sentenceEvidence.literal.toLowerCase();
  if(!/\b(?:noise|noisy|sound\s+(?:level|pressure)|loudness|acoustic)\b/.test(context))return {metric:null,value:null,unit:null};
  return {metric:'noise',value:canonicalValue,unit:'dBA'};
 }
 if(dimension==='volume'&&canonicalUnit==='mL'){
  // Water usage, product volume, flow and basket/tank capacity differ.
  const t=m.sentenceEvidence.literal.toLowerCase();
  if(!/\b(?:tank|basket|reservoir)\s+capacity\b|\bcapacity\s+(?:of\s+)?(?:the\s+)?(?:tank|basket|reservoir)\b|\b(?:tank|basket|reservoir)\b.{0,30}\b(?:holds?|capacity)\b/.test(t))return {metric:null,value:null,unit:null};
  if(/\b(?:consumed|used|flow(?:\s+rate)?|dispensed|wasted)\b/.test(t))return {metric:null,value:null,unit:null};
  return {metric:'capacity',value:canonicalValue/1000,unit:'L'};
 }
 if(dimension==='length'&&canonicalUnit==='mm'){
  const s=m.sentenceEvidence;
  const relStart=m.quantity.start-s.start,relEnd=m.quantity.end-s.start;
  const before=s.literal.slice(Math.max(0,relStart-85),relStart).split(/\b(?:and|but|whereas|while)\b|;/i).at(-1)??'';
  const after=(s.literal.slice(relEnd,relEnd+40).split(/\b(?:and|but|whereas|while)\b|;/i)[0]??'');
  const axes=new Set<string>();
  for(const part of [before,after]){
   if(/\b(?:width|wide|wider)\b/i.test(part))axes.add('width');
   if(/\b(?:height|tall|taller)\b/i.test(part))axes.add('height');
   if(/\b(?:depth|deep|deeper)\b/i.test(part))axes.add('depth');
  }
  if(axes.size===1)return {metric:[...axes][0] as 'width'|'height'|'depth',value:canonicalValue/10,unit:'cm'};
 }
 return {metric:null,value:null,unit:null};
}
function bindingValid(b:DeclaredSourceIdentity167|null|undefined,raw:ReaderInput139):boolean{
 if(!b)return false;
 const src=raw.document.source;
 if(!validId(b.productId)||!validId(b.variantId)||!validId(b.sourceId)||!validId(b.originalDocumentId)||
  !Array.isArray(b.reviewedAliases)||b.reviewedAliases.length===0||b.reviewedAliases.length>30||
  !b.reviewedAliases.every(x=>typeof x==='string'&&x.length>=3&&x.length<=100)||
  !/^[a-f0-9]{64}$/.test(b.documentSha256)||b.identityIndependentlyAuthenticated!==false||
  b.sourceIndependentlyAuthenticated!==false)throw Error('invalid_phase167_declared_identity');
 return b.sourceId===src.id&&b.originalDocumentId===src.originalDocumentId&&
  b.documentSha256===raw.document.sha256&&
  b.productId===raw.pageIdentity?.reviewedProductId&&
  b.variantId===raw.pageIdentity?.reviewedVariantId&&
  b.reviewedAliases.every(x=>raw.pageIdentity?.reviewedAliases.some((a:string)=>alias(a)===alias(x)));
}
function potentialFit(q:QuantityCandidate166,v:number):boolean|null{
 if(q.direction==='strict_lt')return v<q.maximum!;
 if(q.direction==='lte')return v<=q.maximum!;
 if(q.direction==='strict_gt')return v>q.minimum!;
 if(q.direction==='gte')return v>=q.minimum!;
 if(q.direction==='range_inclusive')return v>=q.minimum!&&v<=q.maximum!;
 return null;
}
/** This intentionally DOES NOT return an EvidenceObservation166. A Phase145
 * surface-role hypothesis cannot satisfy Phase166 independent-test receipts. */
export function previewOriginalReviewMeasures167(input:{
 request:RequestOutput164;question:string;products:readonly string[];
 sources:readonly {reader:ReaderInput139;binding?:DeclaredSourceIdentity167|null}[];
}):Preview167{
 const {question,request,products,sources}=input;
 if(!Array.isArray(sources)||sources.length>40||!Array.isArray(products)||
  !request||sha(question)!==request.requestSha256||
  !products.every(validId)||new Set(products).size!==products.length)throw Error('invalid_phase167_preview_request');
 const quant=auditQuantifiedRequest166(question);
 const base=screenQuestionEvidence166(request,question,products,[]);
 const out:CandidateMeasure167[]=[];
 const obligations=new Set(base.researchObligations);
 const seenDocs=new Set<string>();
 let truncated=false,total=0;
 for(const {reader,binding} of sources){
  if(!reader?.document?.text||!reader.document.source)throw Error('invalid_phase167_source_input');
  const docKey=reader.document.sha256; // One text cannot masquerade as several independent sources.
  if(seenDocs.has(docKey))throw Error('duplicate_phase167_source_document');
  seenDocs.add(docKey);
  const checked=readDimensionalContext145(reader);
  const bound=bindingValid(binding,reader);
  if(bound&&!products.includes(binding!.productId))throw Error('phase167_binding_product_not_in_universe');
  total+=checked.measurements.length;truncated||=checked.coverageTruncated;
  for(const m of checked.measurements){
   const converted=classify(m);
   const subject= m.subjectSurface?alias(m.subjectSurface.literal):null;
   const declared=bound&&subject!==null&&binding!.reviewedAliases.some((a:string)=>alias(a)===subject);
   let disposition:CandidateDisposition167;
   if(!bound||reader.document.source.role!=='original_product_test')disposition='source_scope_not_bound';
   else if(m.role!=='observed_candidate')disposition='not_observed_candidate';
   else if(!m.subjectSurface)disposition='identity_unbound';
   else if(!declared)disposition='wrong_or_unreviewed_variant_surface';
   else if(!converted.metric)disposition='metric_ambiguous';
   else if(metricUnit[converted.metric]!==converted.unit)disposition='unit_or_dimension_unmapped';
   else disposition='candidate_pending_scientific_review';
   const matched=disposition==='candidate_pending_scientific_review';
   out.push({id:`p167_${out.length}`,sourceId:m.sourceId,originalDocumentId:m.originalDocumentId,
    documentSha256:m.documentSha256,originalMeasurementId:m.id,productId:matched?binding!.productId:null,
    variantId:matched?binding!.variantId:null,quantitySpan:m.quantity,sentenceSpan:m.sentenceEvidence,
    subjectSpan:m.subjectSurface,role145:m.role,disposition,
    metric:converted.metric,canonicalValue:converted.value,canonicalUnit:converted.unit,
    observations166Created:0,identityVerified:false,sourceVerified:false,
    scientificMeasurementApproved:false,protocolComparable:false,rankingAuthorized:false});
  }
  obligations.add(`authenticate_original_document_${checked.originalDocumentId}`);
  obligations.add(`independently_review_variant_identity_${checked.originalDocumentId}`);
 }
 if(truncated)obligations.add('expand_truncated_source_extraction_before_negative_conclusions');
 const matches:ResearchMatch167[]=[];
 for(const c of out){
  if(c.disposition!=='candidate_pending_scientific_review'||c.productId===null||c.variantId===null)continue;
  for(const q of quant.candidates){
   if(q.scope==='unresolved'||q.metric!==c.metric||q.canonicalUnit!==c.canonicalUnit)continue;
   matches.push({productId:c.productId,variantId:c.variantId,quantityId:q.id,
    candidateMeasureId:c.id,potentialNumericFit:potentialFit(q,c.canonicalValue!),
    status:'source_candidate_unapproved',constraintsConfirmed:false,sourceAuthenticated:false,
    variantAuthenticated:false,eligibleForExclusion:false,eligibleForRanking:false});
   obligations.add(`independently_review_measurement_${c.originalDocumentId}_${c.originalMeasurementId}`);
   obligations.add(`qualify_original_test_protocol_${c.originalDocumentId}_${c.originalMeasurementId}`);
  }
 }
 matches.sort((a,b)=>a.productId.localeCompare(b.productId)||a.quantityId.localeCompare(b.quantityId)||a.candidateMeasureId.localeCompare(b.candidateMeasureId));
 return {phase:167,sourceQuestionSha256:sha(question),sourceDocumentIds:[...seenDocs].sort(),
  candidateMeasures:out,potentialMatches:matches,unpromotedPhase166:base,
  researchObligations:[...obligations].sort(),totalMeasurements:total,
  documentsCoverageTruncated:truncated,candidateOnly:true,scientificApprovals:0,
  productRankingAuthorized:false,publicationAuthorized:false};
}
