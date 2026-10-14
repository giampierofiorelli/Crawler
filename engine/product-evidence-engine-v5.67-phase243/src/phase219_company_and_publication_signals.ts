/** Phase219 — company experience, press release and editorial discovery adapter.
 * Strictly routes permitted upstream metadata to existing Phase82 discovery.
 * No crawlers, Trustpilot scraping, journalistic content harvesting, ratings,
 * scientific evidence admission, lifecycle changes, or rank modifications.
 * Source/input descriptors are assertions, not proof of independence/quality.
 */
import {triageMarketSignals,planMarketWatch,type MarketSignal,type KnownProductState,
 type MarketSignalTriage,type WatchChannel,type WatchSource,type MarketWatchPlan} from './phase82_market_watch.js';

const fail=(s:string):never=>{throw Error('phase219_'+s);};
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z0-9][a-z0-9_.:-]{0,127}$/.test(s);
const text=(s:unknown,max=160):s is string=>typeof s==='string'&&s.length>0&&s.length<=max&&
 s.trim()===s&&!/[\x00-\x1f\x7f]/.test(s);
const instant=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(s)&&
 Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,19)===s.slice(0,19);
const url=(s:unknown):s is string=>{
 if(typeof s!=='string'||s.length>2048||s.trim()!==s)return false;
 try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash&&
 /^[a-z0-9.-]+$/.test(u.hostname)&&u.hostname.includes('.')&&
 !/(?:^|\.)(?:localhost|local|internal|test|invalid|example)$/.test(u.hostname)&&
 !/^(?:\d+\.){3}\d+$/.test(u.hostname)&&!/%(?:00|2e|2f|5c)/i.test(u.pathname);
 }catch{return false;}
};
const uniq=<T>(a:readonly T[])=>new Set(a).size===a.length;

export type Permission219='unreviewed'|'not_permitted'|'reviewed_metadata_only'|'explicit_platform_licence';
export type PublicationKind219='manufacturer_press_release'|'manufacturer_catalog_notice'|
 'wire_reprint'|'original_editorial_article'|'editorial_product_review'|
 'sponsored_article'|'news_safety_alert'|'news_discontinuation'|'unknown';
export interface PublicationCandidate219{
 sourceId:string;url:string;originalWorkId:string|null;publisherId:string;
 publisherRole:'manufacturer'|'media_outlet'|'press_wire'|'retailer'|'unknown';
 manufacturerId:string;productId:string;categoryId:string;publishedAt:string;
 kind:PublicationKind219;permission:Permission219;permissionRecordId:string|null;
 publisherIdentityReviewed:boolean;exactVariantReviewed:boolean;
 /** Must be reviewed as source provenance, NOT inferred from similarity. */
 originalWorkIdentityReviewed:boolean;
 editorialIndependence:'unreviewed'|'reviewed_independent'|'sponsored'|'manufacturer_supplied';
 methodStatus:'unreviewed'|'firsthand_claim_unreviewed'|'original_method_reviewed';
}
export interface PublicationDecision219{
 sourceId:string;url:string;originalWorkId:string|null;action:
 'blocked_access'|'hold_access_review'|'verify_product_identity'|'collect_official_specs'|
 'inspect_original_editorial_work'|'investigate_original_test'|'verify_primary_safety_notice'|
 'verify_discontinuation'|'discovery_only';
 sourceCategory:'commercial_announcement'|'editorial'|'sponsored'|'safety_lead'|'unknown';
 canReadFullText:false;scientificEvidenceAdmitted:false;independentTestAdmitted:false;
 rankingAuthorized:false;reasonCodes:readonly string[];
}
export interface PublicationIntake219{
 schema:'pee219.publication-intake.v1';state:'research_only';
 decisions:readonly PublicationDecision219[];
 /** only when eligible; handed to the PREEXISTING Phase82 triage */
 phase82:MarketSignalTriage;
 mediaStoryReviewRequired:readonly string[];
 safetyNoticesToVerify:readonly string[];
 noNetworkRequests:true;noFullTextStored:true;rankingsChanged:false;
}
function checkPublication(x:PublicationCandidate219):void{
 if(!x||!id(x.sourceId)||!url(x.url)||!(x.originalWorkId===null||id(x.originalWorkId))||
 !id(x.publisherId)||!id(x.manufacturerId)||!id(x.productId)||!id(x.categoryId)||!instant(x.publishedAt)||
 !['manufacturer','media_outlet','press_wire','retailer','unknown'].includes(x.publisherRole)||
 !['manufacturer_press_release','manufacturer_catalog_notice','wire_reprint','original_editorial_article',
 'editorial_product_review','sponsored_article','news_safety_alert','news_discontinuation','unknown'].includes(x.kind)||
 !['unreviewed','not_permitted','reviewed_metadata_only','explicit_platform_licence'].includes(x.permission)||
 !(x.permissionRecordId===null||id(x.permissionRecordId))||
 typeof x.publisherIdentityReviewed!=='boolean'||typeof x.exactVariantReviewed!=='boolean'||
 typeof x.originalWorkIdentityReviewed!=='boolean'||
 !['unreviewed','reviewed_independent','sponsored','manufacturer_supplied'].includes(x.editorialIndependence)||
 !['unreviewed','firsthand_claim_unreviewed','original_method_reviewed'].includes(x.methodStatus)||
 ((x.permission==='reviewed_metadata_only'||x.permission==='explicit_platform_licence')&&!x.permissionRecordId)||
 (x.originalWorkIdentityReviewed&&x.originalWorkId===null))fail('publication_input');
}
/** Never auto-promote unverified independence or media claims to experiment proof.
 * Phase82 actions are ONLY new research leads, even for method-reviewed metadata. */
export function triagePublications219(input:{publications:readonly PublicationCandidate219[];
 knownProducts:readonly KnownProductState[];knownCategoryIds:readonly string[]}):PublicationIntake219{
 if(!input||!Array.isArray(input.publications)||input.publications.length>1000||
 !Array.isArray(input.knownProducts)||!Array.isArray(input.knownCategoryIds))fail('input');
 input.publications.forEach(checkPublication);
 const decisions:PublicationDecision219[]=[],signals:MarketSignal[]=[],media=new Set<string>(),safety=new Set<string>();
 for(const p of input.publications){
  const reason:string[]=[];
  let action:PublicationDecision219['action']='discovery_only';
  let category:PublicationDecision219['sourceCategory']='unknown';
  if(p.permission==='not_permitted'){action='blocked_access';reason.push('access_prohibited');}
  else if(p.permission==='unreviewed'){action='hold_access_review';reason.push('permission_not_reviewed');}
  else if(!p.publisherIdentityReviewed){action='discovery_only';reason.push('publisher_identity_unverified');}
  else if(!p.exactVariantReviewed){action='verify_product_identity';reason.push('exact_variant_unverified');}
  else {
   switch(p.kind){
    case 'manufacturer_press_release':
    case 'manufacturer_catalog_notice':
     category='commercial_announcement';action=p.publisherRole==='manufacturer'?
      'collect_official_specs':'discovery_only';
     reason.push('producer_claims_not_independent_test');
     if(p.publisherRole!=='manufacturer')reason.push('manufacturer_origin_unverified');break;
    case 'wire_reprint':
     category='commercial_announcement';action='discovery_only';
     reason.push('wire_reprint_not_independent');break;
    case 'original_editorial_article':
    case 'editorial_product_review':
     category='editorial';action='inspect_original_editorial_work';
     if(p.editorialIndependence==='reviewed_independent'&&p.kind==='editorial_product_review'&&
       p.methodStatus==='original_method_reviewed')action='investigate_original_test';
     if(p.editorialIndependence!=='reviewed_independent')reason.push('editorial_independence_unverified');
     if(p.methodStatus!=='original_method_reviewed')reason.push('original_test_method_unverified');
     media.add(p.url);break;
    case 'sponsored_article':
     category='sponsored';reason.push('paid_placement_not_independent');break;
    case 'news_safety_alert':
     category='safety_lead';action='verify_primary_safety_notice';
     reason.push('news_alert_not_regulatory_confirmation');safety.add(p.url);break;
    case 'news_discontinuation':
     category='editorial';action='verify_discontinuation';
     reason.push('news_report_not_primary_retirement_proof');break;
    default:reason.push('content_kind_unresolved');
   }
   // Re-use Phase82 intake. A derivative release is only a lead, not a source of new work.
   // Only a REVIEWED original-work identity may be used to deduplicate publication clusters.
   // Unknown lineages are unique locations, never falsely merged by headline similarity.
   const original=p.originalWorkIdentityReviewed?p.originalWorkId!: `unresolved_${p.sourceId}_${signals.length}`;
   const base:Omit<MarketSignal,'kind'>={sourceId:p.sourceId,originalWorkId:original,
    publisherId:p.publisherId,productId:p.productId,categoryId:p.categoryId,
    lawfulMetadata:true,publisherIdentityVerified:true,productIdentityConfirmed:true,
    publishedAt:p.publishedAt};
   const kind:MarketSignal['kind']=(p.kind==='wire_reprint'&&p.originalWorkIdentityReviewed)?
    'manufacturer_announcement':
    action==='collect_official_specs'?
    (p.kind==='manufacturer_catalog_notice'?'manufacturer_catalog_addition':'manufacturer_announcement'):
    action==='investigate_original_test'?'independent_original_test':
    action==='inspect_original_editorial_work'&&p.kind==='editorial_product_review'&&
     p.editorialIndependence==='reviewed_independent'&&p.originalWorkIdentityReviewed?
     'independent_professional_review':
    'community_tip';
   signals.push({...base,kind});
  }
  if(category==='unknown'&&['manufacturer_press_release','manufacturer_catalog_notice','wire_reprint'].includes(p.kind))category='commercial_announcement';
  if(category==='unknown'&&p.kind==='sponsored_article')category='sponsored';
  if(category==='unknown'&&p.kind==='news_safety_alert')category='safety_lead';
  decisions.push({sourceId:p.sourceId,url:p.url,originalWorkId:p.originalWorkId,action,sourceCategory:category,
   canReadFullText:false,scientificEvidenceAdmitted:false,independentTestAdmitted:false,
   rankingAuthorized:false,reasonCodes:reason.sort()});
 }
 return {schema:'pee219.publication-intake.v1',state:'research_only',
  decisions,phase82:triageMarketSignals({signals,knownProducts:input.knownProducts,knownCategoryIds:input.knownCategoryIds}),
  mediaStoryReviewRequired:[...media].sort(),safetyNoticesToVerify:[...safety].sort(),
  noNetworkRequests:true,noFullTextStored:true,rankingsChanged:false};
}

export type CompanyFeedbackTopic219='warranty'|'repairs'|'support'|'returns'|'direct_sale_delivery'|
 'retailer_shipping'|'third_party_carrier'|'product_failure'|'product_usability'|'pricing'|'other';
export interface CompanyFeedback219{
 source:'trustpilot'|'other_review_platform';sourceUrl:string;reviewId:string;
 manufacturerId:string;subjectBusinessId:string;
 responsibleParty:'manufacturer'|'manufacturer_direct_shop'|'retailer'|'carrier'|'unknown';
 modelId:string|null;market:string|null;
 topics:readonly CompanyFeedbackTopic219[];publishedAt:string;
 access:'not_permitted'|'unreviewed'|'explicit_platform_licence';permissionRecordId:string|null;
 /** Review authenticity is not guaranteed even when source access is permitted. */
 reviewAuthenticity:'unverified'|'source_claimed_verified';
}
export interface CompanyFeedbackReport219{
 schema:'pee219.company-experience.v1';state:'research_only';manufacturerId:string;
 acceptedDistinctReports:number;blockedOrHeld:number;duplicateObservations:number;
 companyExperience:{supportOrWarranty:number;directCommerce:number;productProblemLeads:number};
 excludedAsDifferentResponsibleParty:number;unresolvedResponsibility:number;
 needsIndependentVerification:readonly string[];
 notProductPerformanceEvidence:true;noTrustScoreInference:true;noReviewBodiesStored:true;
 noPlatformAccessPerformed:true;rankingAuthorized:false;
}
const feedbackTopics:readonly CompanyFeedbackTopic219[]=['warranty','repairs','support','returns','direct_sale_delivery',
 'retailer_shipping','third_party_carrier','product_failure','product_usability','pricing','other'];
function checkFeedback(x:CompanyFeedback219):void{
 if(!x||!['trustpilot','other_review_platform'].includes(x.source)||!url(x.sourceUrl)||
 !id(x.reviewId)||!id(x.manufacturerId)||!id(x.subjectBusinessId)||
 !['manufacturer','manufacturer_direct_shop','retailer','carrier','unknown'].includes(x.responsibleParty)||
 !(x.modelId===null||id(x.modelId))||!(x.market===null||text(x.market,12))||
 !Array.isArray(x.topics)||x.topics.length<1||x.topics.length>10||!uniq(x.topics)||
 x.topics.some(t=>!feedbackTopics.includes(t))||!instant(x.publishedAt)||
 !['not_permitted','unreviewed','explicit_platform_licence'].includes(x.access)||
 !(x.permissionRecordId===null||id(x.permissionRecordId))||
 !['unverified','source_claimed_verified'].includes(x.reviewAuthenticity)||
 (x.access==='explicit_platform_licence'&&!x.permissionRecordId))fail('feedback_input');
}
/** Deliberately requires license for Trustpilot, never treating public pages as
 * implied permission. Review fields must arrive from an authorised caller. */
export function assessCompanyFeedback219(input:{manufacturerId:string;feedback:readonly CompanyFeedback219[]}):CompanyFeedbackReport219{
 if(!input||!id(input.manufacturerId)||!Array.isArray(input.feedback)||input.feedback.length>2000)fail('input');
 const seen=new Map<string,CompanyFeedback219>();let blocked=0,duplicate=0,unrelated=0,unknown=0;
 const count={supportOrWarranty:0,directCommerce:0,productProblemLeads:0};
 const needs=new Set<string>(['report_sampling_bias','review_authenticity','representativeness_unknown']);
 for(const x of input.feedback){
  checkFeedback(x);
  if(x.manufacturerId!==input.manufacturerId)fail('manufacturer_scope');
  if(x.access!=='explicit_platform_licence'){blocked++;needs.add('source_permission_not_verified');continue;}
  const key=`${x.source}/${x.reviewId}`;
  const prev=seen.get(key);
  if(prev){
   // One review ID with contradictory entity/market/topic is a provenance conflict.
   if(JSON.stringify(prev)!==JSON.stringify(x))fail('duplicate_review_metadata_conflict');
   duplicate++;continue;
  }
  seen.set(key,x);
  if(x.responsibleParty==='unknown'){unknown++;continue;}
  if(['carrier','retailer'].includes(x.responsibleParty)||
   x.subjectBusinessId!==x.manufacturerId){unrelated++;continue;}
  if(x.topics.some(t=>['support','warranty','repairs','returns'].includes(t)))count.supportOrWarranty++;
  if(x.responsibleParty==='manufacturer_direct_shop'&&x.topics.includes('direct_sale_delivery'))count.directCommerce++;
  if(x.modelId&&x.topics.some(t=>['product_failure','product_usability'].includes(t)))count.productProblemLeads++;
  if(x.reviewAuthenticity==='unverified')needs.add('review_identity_unverified');
 }
 return {schema:'pee219.company-experience.v1',state:'research_only',manufacturerId:input.manufacturerId,
  acceptedDistinctReports:seen.size,blockedOrHeld:blocked,duplicateObservations:duplicate,
  companyExperience:count,excludedAsDifferentResponsibleParty:unrelated,
  unresolvedResponsibility:unknown,needsIndependentVerification:[...needs].sort(),
  notProductPerformanceEvidence:true,noTrustScoreInference:true,noReviewBodiesStored:true,
  noPlatformAccessPerformed:true,rankingAuthorized:false};
}

/** Phase82 already provides schedule and lawful metadata checks for newsroom and
 * editorial sources. Source records are explicit, not scraped into existence. */
export function planPublicationWatch219(input:{asOf:string;maxChecks:number;maxChecksPerHost:number;
 sources:readonly WatchSource[]}):MarketWatchPlan{
 for(const s of input.sources??[])if(!(['manufacturer_newsroom','manufacturer_product_index',
 'specialist_editorial','professional_test_feed'] as WatchChannel[]).includes(s.channel))fail('watch_channel_scope');
 return planMarketWatch(input);
}
