/** Phase 75: API-free, source-scoped discovery of candidate URLs from sitemap XML.
 * Discovery != right to retrieve, parse, mine, cite or store page facts.
 * Only source policies explicitly cleared for metadata discovery are accepted.
 */
import {isIP} from 'node:net';
import {RESEARCH_AGENT,robotsDecision,restrictedHttpsTransport,type SourceTransport} from './approved_web_reader.js';
import type {WebSourcePolicy} from './web_evidence_acquisition.js';
import {publicMetadataDiscoveryGate223,publicRobotsDecision223} from './phase223_public_metadata_access.js';
export interface DiscoveredMetadataUrl {
 url:string;sourceId:string;discoveryChannel:'authorized_sitemap';
 verification:'candidate_only_unverified';automaticPageAcquisition:false;
 originalTestIdentityKnown:false;rankingEligible:false;
}
export interface DiscoveryResult {
 status:'candidate_urls_found'|'blocked'|'nothing_relevant';
 urls:DiscoveredMetadataUrl[];reasons:string[];webCalls:number;
 noArticleTextRetained:true;publicationReady:false;
}
const validDate=(v:string|null)=>typeof v==='string'&&Number.isFinite(Date.parse(v));
function isSafeUrl(s:string,hostname:string|null){
 try{const u=new URL(s);return u.protocol==='https:'&&(hostname===null||u.hostname===hostname)&&isIP(u.hostname)===0&&
 u.hostname.includes('.')&&!/(?:^|\.)(?:localhost|internal|local|invalid|example)$/.test(u.hostname)&&
 !u.username&&!u.password&&(!u.port||u.port==='443')&&u.hash===''&&
 !/%2f|%5c|%2e|%00/i.test(u.pathname)&&u.toString().length<1500;}
 catch{return false;}
}
/** Shared Phase75 permission predicate for source-scoped METADATA discovery.
 * Registry records are operator attestation claims, not proof of permission by themselves. */
export function approvedMetadataDiscovery75(p:WebSourcePolicy|undefined,asOf:string):boolean {
 if(!p||!Number.isFinite(Date.parse(asOf))||
  !/^[a-z0-9.-]+$/.test(p.host)||!p.host.includes('.')||
!Array.isArray(p.permittedOperations)||!p.permittedOperations.includes('metadata_discovery')||
  !['written_permission','verified_open_licence','reviewed_statutory_exception'].includes(p.basis)||
  !p.commercialUseReviewed||p.websiteTerms!=='reviewed_permitted'||p.robots!=='allowed'||
  !p.rightsDocumentId||!p.reviewedBy||!p.rightsDocumentUrl||
  !isSafeUrl(p.rightsDocumentUrl,null)||!validDate(p.validUntil)||Date.parse(p.validUntil!)<Date.parse(asOf)||
  !validDate(p.reviewedAt)||Date.parse(p.reviewedAt!)>Date.parse(asOf)||
  !validDate(p.robotsCheckedAt)||Date.parse(p.robotsCheckedAt!)>Date.parse(asOf)||
  Date.parse(asOf)-Date.parse(p.robotsCheckedAt!)>86400000||
  !validDate(p.termsCheckedAt)||Date.parse(p.termsCheckedAt!)>Date.parse(asOf)||
  Date.parse(asOf)-Date.parse(p.termsCheckedAt!)>30*86400000 )return false;
 return true;
}
/** Exact-host conservative discovery URL checks; no wildcard third-party links. */
export function safeMetadataUrl75(url:string,host:string):boolean{return isSafeUrl(url,host);}

/** Deliberately a conservative sitemap URL extractor, not a general XML parser. */
function parseLocs(xml:string):string[]{
 if(xml.length>800_000||/<!DOCTYPE|<!ENTITY|<script/i.test(xml))throw Error('Unsafe sitemap syntax');
 const urls:string[]=[];
 for(const m of xml.matchAll(/<(?:[a-z\w-]+:)?loc\s*>([^<]{1,1500})<\/(?:[a-z\w-]+:)?loc\s*>/gi)){
  const raw=m[1].trim();
  if(raw.includes('&')||raw.includes('\\')||raw.includes('%00'))continue;
  urls.push(raw);
  if(urls.length>1000)throw Error('Unbounded sitemap');
 }
 return urls;
}
export async function discoverFromApprovedSitemap(input:{policy:WebSourcePolicy;asOf:string;
 sitemapPath?:string;maxCandidates?:number;transport?:SourceTransport;requirePathPrefix?:string;
 accessMode?:'legacy_reviewed'|'public_metadata';}):Promise<DiscoveryResult>{
 const result:DiscoveryResult={status:'blocked',urls:[],reasons:[],webCalls:0,noArticleTextRetained:true,publicationReady:false};
 const p=input.policy;const max=input.maxCandidates??40;
 if(!Number.isInteger(max)||max<1||max>100||
  !(input.accessMode==='public_metadata'?publicMetadataDiscoveryGate223(p,input.asOf):approvedMetadataDiscovery75(p,input.asOf))){
   result.reasons=['metadata_discovery_rights_not_cleared'];return result;
  }
 const path=input.sitemapPath??'/sitemap.xml',prefix=input.requirePathPrefix??'/';
 if(!/^\/[a-zA-Z0-9._~/-]{0,180}$/.test(path)||!/^\/[a-zA-Z0-9._~/-]{0,180}$/.test(prefix)){
  result.reasons=['unsafe_sitemap_scope'];return result;
 }
 const transport=input.transport??restrictedHttpsTransport;
 try{
  result.webCalls++;
  const robots=await transport.get(`https://${p.host}/robots.txt`,RESEARCH_AGENT,512000);
  if(input.accessMode==='public_metadata'?
    publicRobotsDecision223(robots,`https://${p.host}${path}`)!=='allow':
    robots.status!==200||robots.finalUrl!==`https://${p.host}/robots.txt`||
    !/^text\/plain(?:\s*;|\s*$)/i.test(robots.contentType)||
    robotsDecision(robots.body,path)!=='allow')throw Error('robots_sitemap_not_allowed');
  result.webCalls++;
  const sm=await transport.get(`https://${p.host}${path}`,RESEARCH_AGENT,800000);
  if(sm.status!==200||sm.finalUrl!==`https://${p.host}${path}`||
    !/(?:application|text)\/(?:xml|x-xml|plain)(?:\s*;|\s*$)/i.test(sm.contentType))
    throw Error('sitemap_response_rejected');
  const seen=new Set<string>();
  for(const url of parseLocs(sm.body)){
   if(!isSafeUrl(url,p.host))continue;
   const u=new URL(url);
   if(!u.pathname.startsWith(prefix)||
     (input.accessMode==='public_metadata'?publicRobotsDecision223(robots,u.toString()):
      robotsDecision(robots.body,u.pathname+u.search))!=='allow')continue;
   if(seen.has(u.toString()))continue;
   seen.add(u.toString());
   result.urls.push({url:u.toString(),sourceId:p.sourceId,discoveryChannel:'authorized_sitemap',
     verification:'candidate_only_unverified',automaticPageAcquisition:false,
     originalTestIdentityKnown:false,rankingEligible:false});
   if(result.urls.length>=max)break;
  }
  result.status=result.urls.length?'candidate_urls_found':'nothing_relevant';
  return result;
 }catch{
  result.urls=[];result.reasons=['sitemap_access_or_parser_failed'];return result;
 }
}
