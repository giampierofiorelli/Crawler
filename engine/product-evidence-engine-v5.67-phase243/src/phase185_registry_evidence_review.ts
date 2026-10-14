/** Phase185: same-publisher presentation cross-check and evidence-class gate.
 * Uploaded EPA table rows remain claims from a certified-products registry.
 * An official product listing can check internal consistency of *what EPA lists*, not turn those
 * values into an independent product test, a retail-SKU match, or a ranking.
 * This module never signs reviews, fetches web pages, or assigns scores.
 */
import {createHash,createPublicKey,verify} from 'node:crypto';
import {canonicalJson180,type TrustedRankingAuthority180} from './phase180_reviewed_first_answer.js';
import {verifyEpaPilot184,type EpaPilot184} from './phase184_real_epa_registry_pilot.js';

const sha=(v:string|Uint8Array)=>createHash('sha256').update(v).digest('hex');
const id=(x:unknown):x is string=>typeof x==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(x)&&!['__proto__','prototype','constructor'].includes(x);
const stamp=(x:unknown):x is string=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(x)&&Number.isFinite(Date.parse(x));
const independentDimension=(x:string)=>x!=='epa_derived_room_area';
export type RegistryEvidenceClass185='epa_certification_registry_reported';
export type OfficialPageEntry185={
  esuid:string;brand:string;modelNumber:string;
  /** Operator transcription of values actually visible in an official EPA page.
   * This input is NOT a separately authenticated publisher download. */
  values:readonly {dimensionKey:string;value:number;unit:string}[];
  officialPageUrl:string;accessedAt:string;captureKind:'operator_transcribed_public_listing';
};
export type RegistryComparison185={
 phase:185;schema:'185.crosscheck.1';entryId:string;brand:string;modelNumber:string;
 documentSha256:string;pilotAuditHash:string;officialPageUrl:string;accessedAt:string;
 reviewedClaims:readonly {observationId:string;dimensionKey:string;value:number;unit:string;
  independentMeasurement:false;derivedFromDimension:string|null;}[];
 missingOnOfficialPage:readonly string[];disagreements:readonly string[];
 identityAligned:boolean;canStageDisplayReview:boolean;rankingAuthorized:false;
 originalProfessionalTest:false;commercialSkuVerified:false;independentPublisherSnapshotAttested:false;
 comparisonHash:string;
};
const pageFor=(esuid:string)=>`https://www.energystar.gov/productfinder/product/certified-room-air-cleaners/details/${esuid}/export/pdf`;
export function compareEpaListing185(args:{pilot:EpaPilot184;originalCsv:Uint8Array;page:OfficialPageEntry185}):RegistryComparison185{
 const {pilot:p,originalCsv,page}=args;
 if(!verifyEpaPilot184(p,originalCsv)||p.market!=='us')throw Error('phase185_unverified_pilot');
 if(!/^\d{7}$/.test(page?.esuid??'')||page.officialPageUrl!==pageFor(page.esuid)||
  !stamp(page.accessedAt)||page.captureKind!=='operator_transcribed_public_listing'||
  !Array.isArray(page.values)||page.values.length<1||page.values.length>25||
  page.values.some(v=>!id(v?.dimensionKey)||!id(v?.unit)||typeof v.value!=='number'||!Number.isFinite(v.value))||
  new Set(page.values.map(v=>v.dimensionKey)).size!==page.values.length)throw Error('phase185_invalid_public_listing');
 const candidate=p.candidates.find(c=>c.esuid===page.esuid);
 if(!candidate)throw Error('phase185_not_a_stageable_registry_candidate');
 const identityAligned=candidate.brand.trim().toLocaleLowerCase('en')===page.brand.trim().toLocaleLowerCase('en')&&
  candidate.modelNumber.trim().toLocaleLowerCase('en')===page.modelNumber.trim().toLocaleLowerCase('en');
 const claims=new Map(candidate.observations.map(o=>[o.dimensionKey,o]));
 const compared:RegistryComparison185['reviewedClaims'][number][]=[],disagreements:string[]=[],missing:string[]=[];
 for(const v of page.values){
  const o=claims.get(v.dimensionKey);
  if(!o){disagreements.push(`unknown_dimension:${v.dimensionKey}`);continue;}
  if(o.unit!==v.unit||o.value!==v.value){disagreements.push(`conflict:${v.dimensionKey}`);continue;}
  compared.push({observationId:o.observationId,dimensionKey:o.dimensionKey,value:o.value,unit:o.unit,
   independentMeasurement:false,derivedFromDimension:o.dimensionKey==='epa_derived_room_area'?'smoke_cadr':null});
 }
 for(const o of candidate.observations)if(!page.values.some(v=>v.dimensionKey===o.dimensionKey))missing.push(o.dimensionKey);
 compared.sort((a,b)=>a.dimensionKey.localeCompare(b.dimensionKey,'en'));disagreements.sort();missing.sort();
 const base={phase:185 as const,schema:'185.crosscheck.1' as const,entryId:candidate.registryEntryId,
  brand:candidate.brand,modelNumber:candidate.modelNumber,documentSha256:p.documentSha256,
  pilotAuditHash:p.auditHash,officialPageUrl:page.officialPageUrl,accessedAt:page.accessedAt,
  reviewedClaims:compared,missingOnOfficialPage:missing,disagreements,
  identityAligned,canStageDisplayReview:identityAligned&&disagreements.length===0&&compared.some(c=>independentDimension(c.dimensionKey)),
  rankingAuthorized:false as const,originalProfessionalTest:false as const,commercialSkuVerified:false as const,
  independentPublisherSnapshotAttested:false as const};
 return {...base,comparisonHash:sha(canonicalJson180(base))};
}
export interface DisplayReviewApproval185 {
 phase:185;schema:'185.display-review.1';comparisonHash:string;entryId:string;documentSha256:string;
  reviewedAt:string;validUntil:string;market:'us';
  permittedDimensions:readonly string[];reviewReference:string;
  permission:'display_source_attributed_registry_claim_only';
  publisherBytesIndependentlyAuthenticated:false;scientificIndependenceClaimed:false;
 }
export interface SignedDisplayReview185 {review:DisplayReviewApproval185;keyId:string;signatureBase64:string;}
export interface SourceAttributedFact185 {
 entryId:string;modelNumber:string;brand:string;dimensionKey:string;value:number;unit:string;
 evidenceClass:RegistryEvidenceClass185;sourceUrl:string;sourceDocumentSha256:string;
 observationId:string;dependentOn:string|null;
 validFor:'attributed_source_fact_display_only';
 independentProfessionalTest:false;originalCommercialVariantAuthenticated:false;
 rankingAuthorized:false;
}
export interface DisplayProjection185 {
 phase:185;status:'source_attributed_facts_available'|'needs_review';
 facts:readonly SourceAttributedFact185[];reasons:readonly string[];
 rankingAuthorized:false;catalog181PromotionAuthorized:false;
 reviewIsNotProofOfScience:true;
}
const pending=(reason:string):DisplayProjection185=>({phase:185,status:'needs_review',facts:[],reasons:[reason],
 rankingAuthorized:false,catalog181PromotionAuthorized:false,reviewIsNotProofOfScience:true});
/** Out-of-band reviewer-signed, narrowly scoped source-fact display permission.
 * An application must pin reviewer public keys outside of user/research inputs.
 * No publisher authentication or independent science validation is implied.
 */
export function sourceFacts185(args:{pilot:EpaPilot184;originalCsv:Uint8Array;
 comparison:RegistryComparison185;review:SignedDisplayReview185|null;
 authority:TrustedRankingAuthority180;}):DisplayProjection185{
 const {pilot:p,originalCsv,comparison:c,review:r,authority:a}=args;
 if(!verifyEpaPilot184(p,originalCsv)||!a||a.market!=='us'||!stamp(a.asOf)||!a.publicKeys||
  Object.getPrototypeOf(a.publicKeys)!==Object.prototype)throw Error('phase185_untrusted_input');
 if(c.phase!==185||c.schema!=='185.crosscheck.1'||c.documentSha256!==p.documentSha256||
  c.pilotAuditHash!==p.auditHash||!stamp(c.accessedAt)||sha(canonicalJson180((({comparisonHash,...base})=>base)(c)))!==c.comparisonHash||
  c.rankingAuthorized!==false||c.originalProfessionalTest!==false||c.commercialSkuVerified!==false||
  c.independentPublisherSnapshotAttested!==false||!p.candidates.some(x=>x.registryEntryId===c.entryId))
  return pending('Cross-check integrity or exact registry identity could not be verified.');
 const match=p.candidates.find(x=>x.registryEntryId===c.entryId)!;
 if(!c.identityAligned||!c.canStageDisplayReview||c.disagreements.length||
  c.brand!==match.brand||c.modelNumber!==match.modelNumber||c.officialPageUrl!==pageFor(match.esuid)||
  c.reviewedClaims.length===0||new Set(c.reviewedClaims.map(x=>x.dimensionKey)).size!==c.reviewedClaims.length)
  return pending('Identity or published values disagree. Investigate the conflicting source.');
 if(!r||!id(r.keyId)||!Object.prototype.hasOwnProperty.call(a.publicKeys,r.keyId))return pending('No independent source-display review was supplied.');
 try {
  const b=r.review;
  const signature=Buffer.from(r.signatureBase64,'base64');
  if(signature.length!==64||!verify(null,Buffer.from(canonicalJson180(b)),createPublicKey(a.publicKeys[r.keyId]),signature)||
   b.phase!==185||b.schema!=='185.display-review.1'||b.comparisonHash!==c.comparisonHash||
   b.entryId!==c.entryId||b.documentSha256!==c.documentSha256||b.market!=='us'||
   b.permission!=='display_source_attributed_registry_claim_only'||
   b.publisherBytesIndependentlyAuthenticated!==false||b.scientificIndependenceClaimed!==false||
   Date.parse(b.reviewedAt)<Date.parse(c.accessedAt)||
   !stamp(b.reviewedAt)||!stamp(b.validUntil)||Date.parse(b.reviewedAt)>Date.parse(a.asOf)||
   Date.parse(b.validUntil)<Date.parse(a.asOf)||Date.parse(b.reviewedAt)>=Date.parse(b.validUntil)||
   !id(b.reviewReference)||!Array.isArray(b.permittedDimensions)||b.permittedDimensions.length<1||
   new Set(b.permittedDimensions).size!==b.permittedDimensions.length||
   b.permittedDimensions.some(dim=>!id(dim)||!c.reviewedClaims.some(q=>q.dimensionKey===dim)))
   return pending('Review is invalid, expired or not authorized for these exact source claims.');
  const original=p.candidates.find(x=>x.registryEntryId===c.entryId)!;
  const observations=new Map(original.observations.map(x=>[x.observationId,x]));
  if(c.reviewedClaims.some(x=>{const o=observations.get(x.observationId);return !o||o.value!==x.value||o.unit!==x.unit||o.dimensionKey!==x.dimensionKey||
   x.independentMeasurement!==false||x.derivedFromDimension!==(x.dimensionKey==='epa_derived_room_area'?'smoke_cadr':null);} ))
   return pending('Compared values cannot be replayed to exact source observations.');
  const facts=c.reviewedClaims.filter(q=>b.permittedDimensions.includes(q.dimensionKey)).map(q=>({
   entryId:c.entryId,brand:c.brand,modelNumber:c.modelNumber,dimensionKey:q.dimensionKey,
   value:q.value,unit:q.unit,evidenceClass:'epa_certification_registry_reported' as const,
   sourceUrl:c.officialPageUrl,sourceDocumentSha256:c.documentSha256,
   observationId:q.observationId,dependentOn:q.derivedFromDimension,
   validFor:'attributed_source_fact_display_only' as const,
   independentProfessionalTest:false as const,originalCommercialVariantAuthenticated:false as const,rankingAuthorized:false as const
  }));
  return {phase:185,status:'source_attributed_facts_available',facts,reasons:[
   'These figures are attributed ENERGY STAR registry values, not independent comparative tests or verified retail SKUs.',
   'The original CSV was operator supplied; this process did not authenticate EPA publisher bytes.' ],
   rankingAuthorized:false,catalog181PromotionAuthorized:false,reviewIsNotProofOfScience:true};
 }catch{return pending('Signature or trusted-review data could not be validated.');}
}
