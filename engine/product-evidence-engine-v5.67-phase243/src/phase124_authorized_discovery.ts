/** Phase124 source discovery continuation. Reuses the Phase75 first-party,
 * self-hosted HTTPS sitemap discovery instead of relying on a search API.
 * Discovery is candidate URL collection only. No page fact extraction/ranking.
 */
import {discoverFromApprovedSitemap} from './phase75_source_discovery.js';
import type {WebSourcePolicy} from './web_evidence_acquisition.js';
import type {SourceTransport} from './approved_web_reader.js';
import type {EndToEndAttempt124} from './phase124_end_to_end_attempt.js';
export interface SourceDiscoveryContinuation124 {phase:124;
 status:'needs_permissions'|'candidate_urls_found'|'no_candidates';
 webCalls:number;candidateUrls:readonly {url:string;sourceId:string}[];
 articleTextAcquired:false;productEvidenceValidated:false;publicRankingAuthorized:false;
 warnings:readonly string[];}
export async function continueNativeDiscovery124(input:{attempt:EndToEndAttempt124;
 policies:readonly WebSourcePolicy[];asOf:string;transport?:SourceTransport;
 maxPerSource?:number;}):Promise<SourceDiscoveryContinuation124>{
 const no=(status:SourceDiscoveryContinuation124['status'],warnings:string[]):SourceDiscoveryContinuation124=>
  ({phase:124,status,webCalls:0,candidateUrls:[],articleTextAcquired:false,
    productEvidenceValidated:false,publicRankingAuthorized:false,warnings});
 if(input.attempt.phase!==124||input.attempt.publicRankingAuthorized!==false||
    input.attempt.retrieval.externalWebSearchExecuted!==false)throw Error('invalid_attempt');
 if(!['source_acquisition_required','candidate_sources_found','new_goal_research_required']
   .includes(input.attempt.state))return no('needs_permissions',['semantic_or_category_review_before_discovery']);
 if(!Array.isArray(input.policies)||input.policies.length===0)return no('needs_permissions',['no_approved_source_policy']);
 if(input.policies.length>20||!Number.isFinite(Date.parse(input.asOf)))throw Error('invalid_source_scope');
 const all:SourceDiscoveryContinuation124['candidateUrls'][number][]=[];
 let webCalls=0;const warnings:string[]=[];
 for(const policy of input.policies){
  const r=await discoverFromApprovedSitemap({policy,asOf:input.asOf,
    ...(input.transport?{transport:input.transport}:{}),maxCandidates:input.maxPerSource??12});
  webCalls+=r.webCalls;
  warnings.push(...r.reasons.map(reason=>`${policy.sourceId}:${reason}`));
  for(const p of r.urls)if(!all.some(q=>q.url===p.url))all.push({url:p.url,sourceId:p.sourceId});
 }
 return {phase:124,status:all.length?'candidate_urls_found':webCalls?'no_candidates':'needs_permissions',
  webCalls,candidateUrls:all,articleTextAcquired:false,productEvidenceValidated:false,
  publicRankingAuthorized:false,warnings};
}
