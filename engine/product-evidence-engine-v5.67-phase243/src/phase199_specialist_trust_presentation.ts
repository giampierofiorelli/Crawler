/** Phase199: narrowly scoped specialist-outcome disclosure for a future product page.
 * Input reuses Phase198, re-evaluated on every call. Human custody declarations are
 * NOT cryptographically authenticated by this module. No certification authority,
 * recommendation, ranking, logo, publisher review body or blanket trust score.
 * Unsubstantiated records never become positive public trust signals.
 */
import {assessSpecialistOutcome198,type SpecialistInput198,
 type Recognition198,type PracticalOutcome198} from './phase198_specialist_outcome_validation.js';
import {createHash} from 'node:crypto';

export type PrimarySourceReview199={
 reviewerId:string;
 sourceCustodyReviewId:string;variantAndOutcomeReviewId:string;
 originalTestOrSchemeReviewId:string;commercialDisclosureReviewId:string;
};
/** Explicit, independently reviewed source custody obtained OUTSIDE the PEE prototype.
 * The caller must provide the attestation; its truth is not verified by this code.
 * A digest of an excerpt does not satisfy `complete_publisher_document`.
 */
export interface PublicationDossier199 {
 evidenceId:string;sourceRecordId:string;criterionId:string;variantId:string;
 disciplineId:string;outcomeId:string;
 sourceUrl:string;publisherDocumentSha256:string;
 documentVersionId:string;creditedAgentDisplayName:string;digestBasis:'complete_publisher_document'|'excerpt_or_annotation';
 publisherOrigin:'confirmed_original_publisher'|'unconfirmed';
 evaluatedAt:string;
 reviewers:readonly PrimarySourceReview199[];
 /** Distinct type of person or product approval; validated against Phase198. */
 authorizationToUseSchemeMark:boolean;
}
export interface TrustPresentationRequest199 {
 specialistInput:SpecialistInput198;
 dossiers:readonly PublicationDossier199[];
 /** Copy is editorially reviewed by the deployer, not harvested from review text. */
 labels:readonly {criterionId:string;outcomeId:string;disciplineId:string;plainOutcomeName:string}[];
 /** Must be chosen outside this module; current phase uses conservative default. */
 maximumDaysSinceCustodyReview?:number;
}
export type TrustKind199='product_certification'|'specialist_scheme_approval'|'expert_practical_test';
export interface TrustCard199 {
 criterionId:string;outcomeId:string;disciplineId:string;
 kind:TrustKind199;title:string;outcomeName:string;
 /** Not a claim of independent PEE tests, a universal grade or product certification by PEE. */
 explanation:string;issuerName:string|null;sourceUrl:string;sourceVersionId:string;
 evidenceIds:readonly string[];sourceRecordIds:readonly string[];
 eventGroupId:string;reviewedOn:string;
 commercialDisclosure:'relationship_disclosed'|'none_declared_but_not_audit';
 methods:'official_product_programme_record'|'reviewed_professional_observation';
 detailLinkLabel:'Examine the source and scope';
 identityClaim:'human_reviewed_source_custody_not_automated_authentication';
 logoOrThirdPartyMarkIncluded:false;qualifiedForAllUses:false;
}
export type HoldReason199='unreviewed_or_unqualified'|'unverified_primary_source'|
 'source_digest_not_complete'|'reviewer_scope_missing'|'stale_custody_review'|
 'variant_or_protocol_mismatch'|'no_relevant_result'|'contradictory_evidence'|
 'duplicate_underlying_event';
export interface TrustHold199 {evidenceId:string;reason:HoldReason199;}
export interface TrustPresentation199 {
 schema:'199.1';phase:199;state:'consumer_preview_research_only';
 productId:string;variantId:string;goalScopeHash:string;asOf:string;
 cards:readonly TrustCard199[];held:readonly TrustHold199[];
 /** Shown even when no badge qualifies for a user-essential outcome. */
 unmetEssentialCriteria:readonly string[];resultStatus:
 'documented_additional_specialist_evidence'|'no_public_specialist_signal'|'requires_additional_review';
 overallProductSuitabilityCertified:false;sourceTruthVerifiedByRuntime:false;
 programmeMarksUsed:false;noNewProductRanking:true;noCopiedReviewBody:true;
}
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(s);
const iso=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&
 !Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const url=(s:unknown):s is string=>typeof s==='string'&&s.length<=2048&&
 /^https:\/\/[^\s/?#]+(?:\/[^\s]*)?$/.test(s)&&(()=>{try{
  const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password&&!u.hash&&!u.hostname.endsWith('.')&&
   !['localhost','127.0.0.1','0.0.0.0','::1'].includes(u.hostname)&&!u.hostname.endsWith('.local');
 }catch{return false;}})();
const sha=(s:unknown):s is string=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const txt=(s:unknown):s is string=>typeof s==='string'&&s.length>0&&s.length<=120&&
 !/[<>\u0000-\u001f\u007f]/.test(s)&&s.trim()===s;
const unique=(a:readonly string[])=>new Set(a).size===a.length;
const daysBetween=(d1:string,d2:string)=>(Date.parse(d2+'T00:00:00Z')-Date.parse(d1+'T00:00:00Z'))/86400000;
function assert199(v:unknown,code:string):asserts v {if(!v)throw Error('phase199_'+code);}
const classify=(x:Recognition198|PracticalOutcome198):TrustKind199=>
 'kind' in x?(x.kind==='formal_product_certification'?'product_certification':'specialist_scheme_approval'):
  'expert_practical_test';

/** Pure, deterministic, deny-by-default consumer VIEW MODEL. This module cannot
 * authenticate reviewer identities, original page bytes or third-party registers. */
export function buildSpecialistTrustPresentation199(request:TrustPresentationRequest199):TrustPresentation199 {
 const input=request.specialistInput;
 const decision=assessSpecialistOutcome198(input); // Never trust a caller-supplied verdict.
 const asOf=input.asOf,maximumDays=request.maximumDaysSinceCustodyReview??180;
 assert199(Number.isInteger(maximumDays)&&maximumDays>=1&&maximumDays<=365,'review_age_policy');
 assert199(Array.isArray(request.dossiers)&&request.dossiers.length<=500&&
  unique(request.dossiers.map(d=>d.evidenceId))&&Array.isArray(request.labels)&&
  request.labels.length<=100&&unique(request.labels.map(l=>l.criterionId)),'dossier_list');
 for(const label of request.labels){
  const n=input.needs.find(n=>n.criterionId===label.criterionId);
  assert199(!!n&&n.disciplineId===label.disciplineId&&n.outcomeId===label.outcomeId&&
   txt(label.plainOutcomeName),'label_scope');
 }
 const byLabel=new Map(request.labels.map(x=>[x.criterionId,x]));
 const byDossier=new Map(request.dossiers.map(x=>[x.evidenceId,x]));
 const recognized=new Map(input.recognitions.map(x=>[x.recognitionId,x]));
 const practical=new Map(input.practicalTests.map(x=>[x.observationId,x]));
 for(const d of request.dossiers){
  assert199(id(d.evidenceId)&&id(d.sourceRecordId)&&id(d.criterionId)&&id(d.variantId)&&
   id(d.disciplineId)&&id(d.outcomeId)&&url(d.sourceUrl)&&sha(d.publisherDocumentSha256)&&
   id(d.documentVersionId)&&txt(d.creditedAgentDisplayName)&&iso(d.evaluatedAt)&&
   ['complete_publisher_document','excerpt_or_annotation'].includes(d.digestBasis)&&
   ['confirmed_original_publisher','unconfirmed'].includes(d.publisherOrigin)&&
   typeof d.authorizationToUseSchemeMark==='boolean'&&
   Array.isArray(d.reviewers)&&d.reviewers.length<=4&&
   unique(d.reviewers.map((x:PrimarySourceReview199)=>x.reviewerId))&&d.reviewers.every((x:PrimarySourceReview199)=>
    id(x.reviewerId)&&id(x.sourceCustodyReviewId)&&id(x.variantAndOutcomeReviewId)&&
    id(x.originalTestOrSchemeReviewId)&&id(x.commercialDisclosureReviewId)), 'dossier_shape');
 }
 const holds:TrustHold199[]=[];const eligible:TrustCard199[]=[];
 for(const row of decision.evidenceRows){
  const d=byDossier.get(row.evidenceId),r=recognized.get(row.evidenceId),p=practical.get(row.evidenceId);
  const n=input.needs.find(x=>x.criterionId===row.criterionId)!;
  const positive=row.classification==='qualified_practical_support'||row.classification==='scoped_programme_support';
  let hold:HoldReason199|null=null;
  if(!positive||!row.eventGroupId)hold='unreviewed_or_unqualified';
  else if(decision.outcomeContradictionIds.includes(row.criterionId)||
   decision.base197.unresolvedContradictionIds.includes(row.criterionId))hold='contradictory_evidence';
  else if(!d)hold='unverified_primary_source';
  else if(d.criterionId!==row.criterionId||d.sourceRecordId!==row.sourceRecordId||
   d.variantId!==input.phase197.variantId||d.disciplineId!==n.disciplineId||
   d.outcomeId!==n.outcomeId||d.sourceUrl!==(r?.registryUrl??p?.reviewedSourceUrl))
   hold='variant_or_protocol_mismatch';
  else if(d.digestBasis!=='complete_publisher_document')hold='source_digest_not_complete';
  else if(d.publisherOrigin!=='confirmed_original_publisher')hold='unverified_primary_source';
  else if(d.reviewers.length<2)hold='reviewer_scope_missing';
  else if(d.evaluatedAt>asOf||daysBetween(d.evaluatedAt,asOf)>maximumDays)hold='stale_custody_review';
  else if(!byLabel.has(n.criterionId))hold='reviewer_scope_missing';
  if(hold){holds.push({evidenceId:row.evidenceId,reason:hold});continue;}
  const dossier=d!, name=byLabel.get(n.criterionId)!.plainOutcomeName;
  const kind=classify((r??p)!);
  // Recognition active date / exact-variant / method was already checked by Phase198.
  // Do not render any official seal even when caller asserts mark permission.
  const title=kind==='product_certification'?'Product certification documented':
   kind==='specialist_scheme_approval'?'Specialist programme approval documented':
   'Specialist practical test documented';
  const disclosure=r?(r.documentedConflicts==='relationship_disclosed'?'relationship_disclosed':
   'none_declared_but_not_audit'):
   p!.commercialRelationship==='disclosed'?'relationship_disclosed':'none_declared_but_not_audit';
  eligible.push({criterionId:n.criterionId,outcomeId:n.outcomeId,disciplineId:n.disciplineId,
   kind,title,outcomeName:name,
   explanation:kind==='expert_practical_test'?
    `A qualified specialist's practical assessment addresses ${name}; technical tests remain separate.`:
    `The published programme entry covers ${name}; it does not certify every product characteristic.`,
   issuerName:dossier.creditedAgentDisplayName,sourceUrl:dossier.sourceUrl,
   sourceVersionId:dossier.documentVersionId,evidenceIds:[row.evidenceId],
   sourceRecordIds:[row.sourceRecordId],eventGroupId:row.eventGroupId!,
   reviewedOn:dossier.evaluatedAt,commercialDisclosure:disclosure,
   methods:r?'official_product_programme_record':'reviewed_professional_observation',
   detailLinkLabel:'Examine the source and scope',
   identityClaim:'human_reviewed_source_custody_not_automated_authentication',
   logoOrThirdPartyMarkIncluded:false,qualifiedForAllUses:false});
 }
 // Never produce multiple visual trust confirmations from two publications of
 // one underlying event. Preserve the covered record IDs in the single card.
 const byRoot=new Map<string,TrustCard199>();
 const priority=(x:TrustCard199)=>x.kind==='product_certification'?0:
  x.kind==='specialist_scheme_approval'?1:2;
 for(const c of eligible.sort((a,b)=>priority(a)-priority(b)||
  a.criterionId.localeCompare(b.criterionId)||a.eventGroupId.localeCompare(b.eventGroupId)||
  a.evidenceIds[0].localeCompare(b.evidenceIds[0]))){
  const key=c.criterionId+'|'+c.eventGroupId;const old=byRoot.get(key);
  if(!old)byRoot.set(key,c);
  else{byRoot.set(key,{...old,evidenceIds:[...old.evidenceIds,c.evidenceIds[0]].sort(),
   sourceRecordIds:[...new Set([...old.sourceRecordIds,...c.sourceRecordIds])].sort()});
   holds.push({evidenceId:c.evidenceIds[0],reason:'duplicate_underlying_event'});}
 }
 // Stable ordering independent of input listing, reviewer ordering or publisher popularity.
 const cards=[...byRoot.values()].sort((a,b)=>a.criterionId.localeCompare(b.criterionId)||
  a.eventGroupId.localeCompare(b.eventGroupId));
 const unmet=decision.outcomeNeeds.filter(n=>n.need==='essential_for_goal'&&
  !cards.some(c=>c.criterionId===n.criterionId)).map(n=>n.criterionId).sort();
 const resultStatus=cards.length?(unmet.length?'requires_additional_review':
  'documented_additional_specialist_evidence'):'no_public_specialist_signal';
 return {schema:'199.1',phase:199,state:'consumer_preview_research_only',
  productId:input.phase197.productId,variantId:input.phase197.variantId,
  goalScopeHash:decision.base197.scopeHash,asOf,cards,
  held:holds.sort((a,b)=>a.evidenceId.localeCompare(b.evidenceId)||a.reason.localeCompare(b.reason)),
  unmetEssentialCriteria:unmet,resultStatus,overallProductSuitabilityCertified:false,
  sourceTruthVerifiedByRuntime:false,programmeMarksUsed:false,noNewProductRanking:true,
  noCopiedReviewBody:true};
}
const escapeHtml=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;')
 .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
/** No script, third-party seal, injected review HTML or remote visual asset.
 * Native <details>/<summary> is accessible without custom JavaScript. */
export function renderSpecialistTrustSection199(p:TrustPresentation199):string {
 assert199(p.schema==='199.1'&&p.state==='consumer_preview_research_only'&&
  p.programmeMarksUsed===false&&p.noNewProductRanking===true&&
  Array.isArray(p.cards)&&p.cards.length<=100,'presenter_scope');
 for(const c of p.cards){
  const titles:Record<TrustKind199,string>={product_certification:'Product certification documented',
   specialist_scheme_approval:'Specialist programme approval documented',
   expert_practical_test:'Specialist practical test documented'};
  assert199(Object.hasOwn(titles,c.kind)&&c.title===titles[c.kind as TrustKind199]&&
   url(c.sourceUrl)&&id(c.sourceVersionId)&&iso(c.reviewedOn)&&
   id(c.criterionId)&&id(c.outcomeId)&&id(c.disciplineId)&&
   c.logoOrThirdPartyMarkIncluded===false&&c.qualifiedForAllUses===false,
   'untrusted_render_card');
 }
 const cards=p.cards.map(c=>`<article class="pee-specialist-card" data-kind="${c.kind}">
 <h3>${escapeHtml(c.title)}</h3><p>For: ${escapeHtml(c.outcomeName)}</p>
 <p>${escapeHtml(c.explanation)}</p>
 <p>Source or evaluator: ${escapeHtml(c.issuerName??'Unspecified')}</p>
 ${c.commercialDisclosure==='relationship_disclosed'?'<p>Commercial relationship disclosed</p>':''}
 <details><summary>Why this evidence matters</summary>
 <p>Scope: ${escapeHtml(c.disciplineId)} · Outcome: ${escapeHtml(c.outcomeId)}</p>
 <p>Documented review: ${escapeHtml(c.reviewedOn)} · Source version: ${escapeHtml(c.sourceVersionId)}</p>
 <p>${c.commercialDisclosure==='relationship_disclosed'?'A commercial relationship was disclosed.':'No relationship was declared in the reviewed record; this is not an independence audit.'}</p>
 <p>This is evidence from reviewed source documentation, not a PEE certification, guarantee of suitability or independent PEE laboratory test.</p>
 <a href="${escapeHtml(c.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(c.detailLinkLabel)}</a>
 </details></article>`).join('\n');
 const uncertain=p.unmetEssentialCriteria.length?`<p class="pee-specialist-gap">Specialist outcome evidence is not sufficiently documented for: ${p.unmetEssentialCriteria.map(escapeHtml).join(', ')}. This does not mean the product is poor.</p>`:'';
 return `<section class="pee-specialist-evidence" aria-label="Specialist outcome evidence">
 <h2>Specialist outcome evidence</h2>${cards}
 ${uncertain||(!cards?'<p>No additional specialist confirmation has been verified for this use.</p>':'')}
 </section>`;
}
/** Stable digest for consumer-view snapshot diffing; only derived data is hashed. */
export function fingerprintTrustPresentation199(p:TrustPresentation199):string{
 return createHash('sha256').update(JSON.stringify(p)).digest('hex');
}
