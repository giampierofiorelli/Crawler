/** Phase202: exact-model, scoped ENERGY STAR room air cleaner registry reconciliation.
 * Evidence is a transient operator-supplied copy of the EPA V3.0 dataset.
 * Hashing this copy does NOT authenticate EPA as issuer, prove a live status,
 * grant ENERGY STAR logo rights or create independent specialist outcome tests.
 * No network, new crawler, transcript acquisition or consumer badge.
 * Designed to attach to Phase201 source custody when JSON registry acquisition is
 * separately authorised and security-tested in a future phase.
 */
import {createHash} from 'node:crypto';

export const ENERGY_STAR_ROOM_AIR_202={
 issuer:'us_epa_energy_star',datasetId:'gaa3-swy6',specification:'3.0',
 category:'room_air_cleaners',
 originalDatasetPage:'https://data.energystar.gov/Active-Specifications/ENERGY-STAR-Certified-Room-Air-Cleaners-V3-0/gaa3-swy6',
 apiEndpoint:'https://data.energystar.gov/resource/gaa3-swy6.json',
} as const;
const date=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d\d-\d\d$/.test(s)&&
 !Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const plain=(s:unknown):s is string=>typeof s==='string'&&s.length>0&&s.length<=120&&
 s.trim()===s&&/^[\x20-\x7e]+$/.test(s);
const model=(s:unknown):s is string=>plain(s)&&/^[A-Za-z0-9][A-Za-z0-9 ._+/-]{0,119}$/.test(s)&&
 !/[#*?]/.test(s);
const market=(s:unknown):s is 'United States'|'Canada'=>
 s==='United States'||s==='Canada';
const eq=(a:string,b:string)=>a.trim().toUpperCase()===b.trim().toUpperCase();
const timeDiff=(earlier:string,later:string)=>
 (Date.parse(later+'T00:00:00Z')-Date.parse(earlier+'T00:00:00Z'))/86400000;

export type RegistryRecord202={
 pd_id?:unknown;brand_name?:unknown;model_name?:unknown;model_number?:unknown;
 markets?:unknown;date_certified?:unknown;date_qualified?:unknown;
 additional_model_information?:unknown;[other:string]:unknown;
};
export interface RegistrySnapshot202 {
 /** Registry bytes provided through an operator-authorized source pipeline;
  * NOT cryptographic evidence that the issuer generated them. */
 sourceUrl:string; datasetId:string;specification:string;datasetUpdatedOn:string;
 acquiredOn:string;capturedBytes:Uint8Array;
 /** Reviewed byte digest, not an excerpt or HTTP ETag. */
 reviewedSha256:string;
 /** The current phase deliberately does not implement verified issuer custody. */
 issuerAuthenticatedByRuntime:false;
}
export interface RegistryTarget202 {
 exactVariantId:string;brandName:string;modelNumber:string;
 market:'United States'|'Canada';category:'room_air_cleaners';
 asOf:string;maxDatasetAgeDays:number;
 /** Optional independent, separately checked disqualified ESUIDs.
  * In this phase these are review hints, NOT authenticated issuer status. */
 disqualificationReviewIds:readonly string[];
}
export type RegistryStatus202='registry_record_candidate'|'absent_from_supplied_snapshot'|
 'ambiguous_matching_records'|'unsupported_scope'|'stale_registry_snapshot'|
 'unverified_registry_bytes'|'withdrawal_or_disqualification_review'|'snapshot_incomplete';
export interface RegistryResult202 {
 schema:'pee202.energy_star_room_air.v1';phase:202;status:RegistryStatus202;
 exactVariantId:string;datasetId:'gaa3-swy6';specification:'3.0';
 matchingEsuids:readonly string[];matchedModelNumber:string|null;
 sourceUrl:string;fullByteSha256:string|null;datasetUpdatedOn:string|null;
 evidenceLimits:readonly string[];
 /** ENERGY STAR is efficiency-program certification, not specialist sensory/outcome validation. */
 claimScope:'energy_efficiency_programme_only';
 independentlyVerifiedIssuer:false;certificateStillActiveAuthenticated:false;
 sufficientForPublication:false;specialistOutcomeValidation:false;
 consumerBadgeAuthorized:false;rankingChanged:false;fullRegistryRowsPersisted:false;
}
const limits=['source_bytes_supplied_by_operator_not_authenticated_epa_origin',
 'registry_dataset_listing_is_not_an_independent_product_review',
 'no_independently_authenticated_issuer_withdrawal_status',
 'no_authorization_to_use_official_energy_star_marks'] as const;
function result(target:RegistryTarget202,status:RegistryStatus202,esuid:string[]=[],sha:string|null=null,
 dateUpdated:string|null=null,matched:string|null=null,extra:string[]=[]):RegistryResult202{
 return {schema:'pee202.energy_star_room_air.v1',phase:202,status,
  exactVariantId:target.exactVariantId,datasetId:'gaa3-swy6',specification:'3.0',
  matchingEsuids:[...new Set(esuid)].sort(),matchedModelNumber:matched,
  sourceUrl:ENERGY_STAR_ROOM_AIR_202.originalDatasetPage,fullByteSha256:sha,
  datasetUpdatedOn:dateUpdated,evidenceLimits:[...limits,...extra],
  claimScope:'energy_efficiency_programme_only',independentlyVerifiedIssuer:false,
  certificateStillActiveAuthenticated:false,sufficientForPublication:false,
  specialistOutcomeValidation:false,consumerBadgeAuthorized:false,
  rankingChanged:false,fullRegistryRowsPersisted:false};
}
/** Schema-light parsing: preserve no publisher body or whole registry record.
 * Unknown API fields are ignored, not interpreted as proof of approval.
 * Caller may retrieve an authentic official dataset in a *separate* permitted
 * acquisition process; this function never asserts transport authenticity. */
export function reconcileRoomAirRegistry202(target:RegistryTarget202,
 snapshot:RegistrySnapshot202):RegistryResult202 {
 if(!target||!snapshot||typeof target.exactVariantId!=='string'||
  !/^[a-z][a-z0-9_.:-]{0,100}$/.test(target.exactVariantId)||!date(target.asOf)||
  !Number.isInteger(target.maxDatasetAgeDays)||target.maxDatasetAgeDays<0||
  target.maxDatasetAgeDays>90||!Array.isArray(target.disqualificationReviewIds)||
  target.disqualificationReviewIds.length>1000||
  !target.disqualificationReviewIds.every(x=>typeof x==='string'&&/^\d{7}$/.test(x))||
  new Set(target.disqualificationReviewIds).size!==target.disqualificationReviewIds.length)
  throw Error('phase202_invalid_request');
 if(target.category!=='room_air_cleaners'||!market(target.market)||
  !plain(target.brandName)||!model(target.modelNumber)||
  snapshot.sourceUrl!==ENERGY_STAR_ROOM_AIR_202.apiEndpoint||
  snapshot.datasetId!==ENERGY_STAR_ROOM_AIR_202.datasetId||
  snapshot.specification!==ENERGY_STAR_ROOM_AIR_202.specification||
  snapshot.issuerAuthenticatedByRuntime!==false)
  return result(target,'unsupported_scope');
 if(!date(snapshot.datasetUpdatedOn)||!date(snapshot.acquiredOn)||
  snapshot.acquiredOn>target.asOf||snapshot.datasetUpdatedOn>snapshot.acquiredOn||
  snapshot.datasetUpdatedOn<'2025-10-09')return result(target,'unsupported_scope');
 if(timeDiff(snapshot.datasetUpdatedOn,target.asOf)>target.maxDatasetAgeDays||
  timeDiff(snapshot.acquiredOn,target.asOf)>target.maxDatasetAgeDays)
  return result(target,'stale_registry_snapshot');
 if(!(snapshot.capturedBytes instanceof Uint8Array)||
  snapshot.capturedBytes.length===0||snapshot.capturedBytes.length>2_000_000||
  typeof snapshot.reviewedSha256!=='string'||!/^[a-f0-9]{64}$/.test(snapshot.reviewedSha256))
  return result(target,'unverified_registry_bytes');
 const sha=createHash('sha256').update(snapshot.capturedBytes).digest('hex');
 if(sha!==snapshot.reviewedSha256)return result(target,'unverified_registry_bytes');
 let raw:unknown;
 try{raw=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(snapshot.capturedBytes));}
 catch{return result(target,'snapshot_incomplete',[],sha,snapshot.datasetUpdatedOn);}
 if(!Array.isArray(raw)||raw.length===0||raw.length>20000||
  raw.some(r=>r===null||typeof r!=='object'||Array.isArray(r)))
  return result(target,'snapshot_incomplete',[],sha,snapshot.datasetUpdatedOn);
 // The supplied snapshot may be a filtered page or first API page. Absence
 // cannot be inferred without a separately audited complete-set receipt.
 const matched: {esuid:string;number:string}[]=[];
 for(const r of raw as RegistryRecord202[]){
  if(!plain(r.brand_name)||!model(r.model_number)||
   !eq(r.brand_name,target.brandName)||!eq(r.model_number,target.modelNumber))continue;
  const ms=r.markets;
  const marketList=Array.isArray(ms)?ms:typeof ms==='string'?ms.split(/\s*,\s*/):[];
  if(!marketList.some(m=>m===target.market))continue;
  const esuid=typeof r.pd_id==='number'&&Number.isSafeInteger(r.pd_id)?String(r.pd_id):r.pd_id;
  if(typeof esuid!=='string'||!/^\d{7}$/.test(esuid))
   return result(target,'snapshot_incomplete',[],sha,snapshot.datasetUpdatedOn);
  // A wildcard/alias row never validates an exact model. Matching is strictly
  // against model_number and does not use the free-text model-family column.
  matched.push({esuid,number:r.model_number});
 }
 if(matched.length===0)return result(target,'absent_from_supplied_snapshot',[],sha,
  snapshot.datasetUpdatedOn,null,['absence_not_exclusion_until_complete_dataset_verified']);
 if(matched.length!==1)return result(target,'ambiguous_matching_records',matched.map(x=>x.esuid),sha,
  snapshot.datasetUpdatedOn,null,['same_model_multiple_registry_rows_require_manual_reconciliation']);
 const found=matched[0];
 if(target.disqualificationReviewIds.includes(found.esuid))
  return result(target,'withdrawal_or_disqualification_review',[found.esuid],sha,snapshot.datasetUpdatedOn,
   found.number,['withdrawal_feed_requires_independent_origin_and_freshness_verification']);
 return result(target,'registry_record_candidate',[found.esuid],sha,snapshot.datasetUpdatedOn,found.number,
  ['candidate_only_requires_independent_issuer_and_current_status_verification']);
}
