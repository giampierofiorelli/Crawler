/**
 * Phase261 — research-to-discovery bridge: research requirement → discovery target → authorised discovery channel →
 * unverified URL candidate. A small typed adapter over EXISTING mechanisms, not a crawler, registry or authority:
 *  - the requirement is a genuine Phase182 job (re-derived with researchJobFromGap182, never a hand-made id);
 *  - channels come only from an operator Registry220 (Phase220's registry format), scheduled by Phase82
 *    planMarketWatch and read by Phase75 discoverFromApprovedSitemap or Phase221 discoverFromApprovedFeed221, whose
 *    own rights and robots checks stay authoritative;
 *  - Phase220's free-text interpretation is the only step replaced: a job is already typed, so no user-facing question
 *    is manufactured to satisfy that API.
 *
 * What it provides is capability A: new documents from an already known, authorised source or channel. It does NOT
 * discover new publishers, domains or channels (capability B): no candidate-generation mechanism exists in PEE
 * (Phase220: "No general web index is connected"; Phase196's publisher seed is a closed list; Phase177 keyword proposals
 * are never sent). That stays an explicit gap, reported in every result.
 *
 * Nothing is assumed about the evidence sought (declarations, tests, practical observation, interpretation), the
 * source type, the market (taken from the operator research policy, never fixed), the source language (no language
 * filter; PEE's semantics remain English-only per LANGUAGE_CAPABILITIES258), or the publisher's country (never used).
 * A candidate is a URL lead only: no identity, no retrieval permission, no retained fact, no evidence, no ranking.
 */
import {createHash} from 'node:crypto';
import {researchJobFromGap182} from './phase182_gap_research_orchestrator.js';
import type {ResearchGap181} from './phase181_dynamic_knowledge_ranking.js';
import {planMarketWatch,type WatchChannel,type WatchSource} from './phase82_market_watch.js';
import {discoverFromApprovedSitemap} from './phase75_source_discovery.js';
import {discoverFromApprovedFeed221} from './phase221_authorized_feed_discovery.js';
import {normalizeDiscoveryUrl192} from './phase192_lineage_marketplace_screen.js';
import type {Registry220,Observation220} from './phase220_autonomous_discovery_worker.js';
import type {SourceTransport} from './approved_web_reader.js';
import type {ResearchPolicy257} from './phase257_research_planning.js';
import {LANGUAGE_CAPABILITIES258,type SourceRole258,type StatementKind258} from './phase258_source_contributions.js';
import {urlModelToken252,validGtin246,type KnowledgeStore246} from './phase246_knowledge_store.js';

const sha=(s:string|Uint8Array)=>createHash('sha256').update(s).digest('hex');
const fail=(m:string):never=>{throw Error('phase261_'+m);};

/** The job fields the bridge reads (a ResearchJob182 or a Phase257 planned job carries them). */
export interface JobRef261 {jobId:string;categoryId:string;gapKind:ResearchGap181['kind'];productId:string|null;criterion:string|null}

/** Requirement → evidence sought. Roles and statement kinds are Phase258's; channels are Phase82's. A role with no
 * Phase82 channel type is reported as unrouted rather than forced into a wrong channel. */
interface Lane {statementKinds:StatementKind258[];roles:SourceRole258[];channels:WatchChannel[]}
const DECLARATION:Lane={statementKinds:['declared_specification'],roles:['manufacturer_specification','retailer_listing'],
 channels:['manufacturer_product_index','retailer_new_models','manufacturer_newsroom']};
const LANES:Partial<Record<ResearchGap181['kind'],Lane>>={
 missing_declaration:DECLARATION,declaration_conflict:DECLARATION,missing_product:DECLARATION,
 need_review:{statementKinds:['declared_specification'],roles:['manufacturer_specification'],channels:['manufacturer_product_index']},
 // Independent evidence: measurements, structured hands-on testing, original video demonstrations.
 missing_test:{statementKinds:['instrumental_measurement','observed_practical_result'],roles:['independent_measurement','structured_professional_testing','original_video_demonstration'],
  channels:['professional_test_feed','specialist_editorial']},
 // How a criterion is assessed in a category: method references and qualified interpretation.
 missing_criterion:{statementKinds:['expert_interpretation'],roles:['structured_professional_testing','qualified_cultural_expertise','journalism'],
  channels:['professional_test_feed','specialist_editorial','specialist_community']},
};
/** Roles with a Phase82 channel type today. Regulatory notices, video platforms, news and cultural experts have none. */
const ROUTED_ROLES:Partial<Record<SourceRole258,WatchChannel[]>>={manufacturer_specification:['manufacturer_product_index','manufacturer_newsroom'],
 retailer_listing:['retailer_new_models'],independent_measurement:['professional_test_feed'],structured_professional_testing:['professional_test_feed','specialist_editorial'],
 journalism:['specialist_editorial'],user_experience_report:['specialist_community'],press_release:['manufacturer_newsroom']};

export interface DiscoveryTarget261 {
 schema:'pee261.discovery-target.v1';targetId:string;job:JobRef261;
 /** From the operator research policy; another policy may name any market. */
 market:string;
 evidence:Lane&{unroutedRoles:SourceRole258[]};
 subject:{productId:string|null;identityState:string|null;exactVariantVerified:false;
  /** Exact identifier tokens: model codes from canonical identifiers or from the product's own retained page URLs, MPN, GTIN. */
  knownIdentifiers:string[];
  /** Words that only order which in-scope URLs are kept first (Phase75); never relevance proof or identity. */
  relevanceTerms:string[]};
 /** No language filter; what PEE can do with a language is a separate, per-task capability. */
 language:{filter:null;semanticInterpretation:readonly string[];translation:'none'};
 publisherCountryUsed:false;
 /** Requirement qualifiers that ResearchGap181/ResearchJob182 cannot carry today (reference = product:criterion only). */
 inexpressible:readonly ('test_conditions'|'assessor_expertise'|'cultural_tradition')[];
}

/** Builds a target from a genuine job: the id must be the one Phase182 derives from the same gap. */
export function discoveryTargetFromJob261(job:JobRef261,ctx:{market:string;store?:KnowledgeStore246|null}):DiscoveryTarget261{
 if(!job||typeof job.jobId!=='string'||!/^research_[0-9a-f]{32}$/.test(job.jobId))fail('invalid_job: jobId');
 if(typeof ctx?.market!=='string'||!/^[a-z]{2,10}$/.test(ctx.market))fail('invalid_market: an explicit market from the operator policy is required');
 const lane=LANES[job.gapKind]??fail(`unsupported_gap_kind: ${job.gapKind} has no evidence lane`);
 const reference=job.productId&&job.criterion?`${job.productId}:${job.criterion}`:(job.productId??job.criterion??'');
 let derived='';try{derived=researchJobFromGap182(job.categoryId,{kind:job.gapKind,reference,action:'phase261 re-derivation'}).jobId;}catch(e){fail('invalid_job: '+(e as Error).message);}
 if(derived!==job.jobId)fail('invalid_job: the jobId is not the one Phase182 derives from this gap (not a genuine job)');
 const ids=new Set<string>();const terms=new Set<string>();let identityState:string|null=null;
 if(job.productId&&ctx.store){
  const p=ctx.store.db.prepare('SELECT brand,declared_model,identifiers_json,identity_state FROM products WHERE product_id=?').get(job.productId) as
   {brand:string|null;declared_model:string|null;identifiers_json:string;identity_state:string}|undefined;
  if(!p)fail('unknown_product');
  identityState=p!.identity_state;
  const idj=JSON.parse(p!.identifiers_json) as Record<string,string>;
  for(const v of [p!.declared_model,idj.mpn,idj.model])if(v&&String(v).trim().length>=3)ids.add(String(v).toLowerCase().replace(/[^a-z0-9]/g,''));
  // GTINs are kept only when the check digit is valid, in their 14-digit form (validGtin246), so 12/13/14-digit
  // spellings of one GTIN compare equal.
  for(const v of [idj.gtin13,idj.gtin14,idj.gtin12,idj.gtin8,idj.gtin]){const g=v?validGtin246(String(v)):null;if(g)ids.add(g);}
  for(const r of ctx.store.db.prepare("SELECT r.url FROM product_sources ps JOIN revisions r USING(revision_id) WHERE ps.product_id=? AND ps.role='main_product'").all(job.productId) as {url:string}[]){
   const tok=urlModelToken252(r.url);if(tok)ids.add(tok);}
  if(p!.brand)terms.add(p!.brand);
 }
 for(const i of ids)terms.add(i);
 const t:Omit<DiscoveryTarget261,'targetId'>={schema:'pee261.discovery-target.v1',job:{...job},market:ctx.market,
  evidence:{...lane,unroutedRoles:lane.roles.filter(r=>!ROUTED_ROLES[r])},
  subject:{productId:job.productId,identityState,exactVariantVerified:false,knownIdentifiers:[...ids].sort(),relevanceTerms:[...terms].sort()},
  language:{filter:null,semanticInterpretation:LANGUAGE_CAPABILITIES258.semanticInterpretation,translation:'none'},publisherCountryUsed:false,
  inexpressible:['test_conditions','assessor_expertise','cultural_tradition']};
 return {...t,targetId:'target_'+sha(JSON.stringify([job.jobId,ctx.market])).slice(0,24)};
}

export type Attribution261='url_token_matches_known_identifier'|'product_unknown'|'not_product_scoped';
export interface Candidate261 {
 url:string;jobId:string;targetId:string;registrySourceId:string;host:string;channel:WatchChannel;mechanism:WatchSource['mechanism'];
 origin:'offline_fixture';genuineDiscovery:false;attribution:Attribution261;
 /** The stages a lead must pass before it can matter; only discovery (and its gate) are true here. */
 stages:{candidateUrlDiscovered:true;sourceIdentityRegistered:boolean;metadataDiscoveryAllowed:true;pageRetrievalPermitted:false;
  factualInformationRetained:false;independentEvidenceVerified:false;recommendationAuthorized:false};
}
export type Rejection261='already_observed'|'url_names_other_model'|'host_restricted'|'off_target_host';
export interface Discovery261 {
 schema:'pee261.discovery.v1';targetId:string;jobId:string;mode:'offline_fixture'|'live';
 status:'candidates_found'|'nothing_found'|'no_authorised_channel'|'blocked_live_reads_disabled';
 channels:{considered:number;wrongLane:number;blockedNoPolicy:string[];blockedNotCleared:string[];selected:string[]};
 candidates:Candidate261[];rejected:{url:string;registrySourceId:string;reason:Rejection261}[];
 /** Phase220 checkpoint form (URLs and digests only), so the existing checkpoint can carry these observations. */
 observations:Observation220[];
 networkCalls:{live:0;fixture:number};
 capabilityB:{newPublisherDiscovery:false;reason:'no_candidate_generation_mechanism_in_pee'};
 rankingAuthorized:false;evidenceAdmitted:false;sourcePermissionsGranted:false;
}

/** Lower-case parts of the URL's last path segment, plus the 14-digit form of any part that is a valid GTIN. */
function urlIdentifierParts(url:string):string[]{
 let seg='';try{seg=decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop()??'');}catch{return [];}
 const parts=seg.toLowerCase().split(/[-_.+]/).filter(x=>x.length>=3);
 return [...parts,...parts.map(x=>validGtin246(x)).filter((x):x is string=>!!x)];
}

/** Exact identifiers only: a URL model code that differs from every known identifier names another model. A URL
 * without a code, or a product without identifiers, leaves the product unknown. Nothing merges on names.
 * Checkpoint B: an exact identifier may also be a numeric GTIN, which is not a model token; any path segment part equal
 * to a known identifier is an exact match. A URL that ALSO names a different model code carries conflicting identifiers
 * and stays unknown (neither matched nor rejected). Phase262 reuses this rule for general-search candidates. */
export function attributeUrl261(url:string,t:DiscoveryTarget261):Attribution261|'url_names_other_model'{
 if(!t.subject.productId)return 'not_product_scoped';
 const token=urlModelToken252(url);const known=new Set(t.subject.knownIdentifiers);
 const exact=urlIdentifierParts(url).some(x=>known.has(x));
 const otherModel=!!token&&known.size>0&&!known.has(token);
 if(otherModel&&!exact)return 'url_names_other_model';
 return exact&&!otherModel?'url_token_matches_known_identifier':'product_unknown';
}

/** Capability A for one target. Live reads are refused unless the operator research policy allows them (Phase257:
 * never). Offline mode needs an explicit fixture transport and never falls back to the network transport. */
export async function discoverForTarget261(a:{target:DiscoveryTarget261;registry:Registry220;researchPolicy:ResearchPolicy257;asOf:string;
 mode:'offline_fixture'|'live';fixtureTransport?:SourceTransport;store?:KnowledgeStore246|null;maxChecks?:number;maxCandidatesPerSource?:number}):Promise<Discovery261>{
 const t=a.target;if(t?.schema!=='pee261.discovery-target.v1')fail('invalid_target');
 if(a.researchPolicy?.market!==t.market)fail('market_mismatch: the target market must be the operator policy market');
 if(!a.researchPolicy.categories.includes(t.job.categoryId))fail('category_not_in_policy');
 if(!Number.isFinite(Date.parse(a.asOf)))fail('invalid_clock');
 if(a.registry?.schema!=='pee220.registry.1'||!Array.isArray(a.registry.sources)||!Array.isArray(a.registry.policies))fail('invalid_registry');
 const maxChecks=a.maxChecks??3,perSource=a.maxCandidatesPerSource??20;
 if(!Number.isInteger(maxChecks)||maxChecks<1||maxChecks>10||!Number.isInteger(perSource)||perSource<1||perSource>100)fail('invalid_budget');
 const out:Discovery261={schema:'pee261.discovery.v1',targetId:t.targetId,jobId:t.job.jobId,mode:a.mode,status:'no_authorised_channel',
  channels:{considered:0,wrongLane:0,blockedNoPolicy:[],blockedNotCleared:[],selected:[]},candidates:[],rejected:[],observations:[],
  networkCalls:{live:0,fixture:0},capabilityB:{newPublisherDiscovery:false,reason:'no_candidate_generation_mechanism_in_pee'},
  rankingAuthorized:false,evidenceAdmitted:false,sourcePermissionsGranted:false};
 if(a.mode==='live'){
  // ResearchPolicy257 types allowSourceReads as false: no live read can be authorised under this phase's policy.
  if((a.researchPolicy as {allowSourceReads:boolean}).allowSourceReads!==true)return {...out,status:'blocked_live_reads_disabled'};
  fail('live_mode_not_implemented');
 }
 if(a.mode!=='offline_fixture'||!a.fixtureTransport)fail('fixture_transport_required: offline mode never falls back to the network');
 const inCategory=a.registry.sources.filter(s=>s.watch.categoryId===t.job.categoryId);
 const lane=inCategory.filter(s=>t.evidence.channels.includes(s.watch.channel)&&['sitemap_delta','rss','atom'].includes(s.watch.mechanism));
 out.channels.considered=inCategory.length;out.channels.wrongLane=inCategory.length-lane.length;
 const policyOf=(s:typeof lane[number])=>a.registry.policies.find(p=>p.sourceId===s.watch.id&&p.host===s.watch.host);
 const withPolicy=lane.filter(s=>policyOf(s));
 out.channels.blockedNoPolicy=lane.filter(s=>!policyOf(s)).map(s=>s.watch.id);
 const plan=planMarketWatch({asOf:a.asOf,maxChecks,maxChecksPerHost:2,sources:withPolicy.map(s=>s.watch)});
 out.channels.blockedNotCleared=[...plan.blockedSourceIds];out.channels.selected=[...plan.selectedSourceIds];
 if(!plan.selectedSourceIds.length)return out;
 const observed=new Set<string>(),restricted=new Set<string>(),known=new Set<string>();
 if(a.store){
  for(const r of a.store.db.prepare('SELECT url FROM revisions').all() as {url:string}[]){try{observed.add(normalizeDiscoveryUrl192(r.url));}catch{observed.add(r.url);}}
  for(const r of a.store.db.prepare('SELECT host FROM host_access WHERE restricted>0 OR suspended_until IS NOT NULL').all() as {host:string}[])restricted.add(r.host);
  for(const r of a.store.db.prepare('SELECT host FROM sources').all() as {host:string}[])known.add(r.host);
 }
 let fixtureCalls=0;
 for(const id of plan.selectedSourceIds){
  const s=withPolicy.find(x=>x.watch.id===id)!;const policy=policyOf(s)!;
  const listing=s.watch.mechanism==='sitemap_delta'?s.sitemapPath:s.feedPath;let digest:string|null=null;
  const transport:SourceTransport={get:async(url,agent,cap)=>{fixtureCalls++;const r=await a.fixtureTransport!.get(url,agent,cap);
   if(url===`https://${s.watch.host}${listing}`)digest=sha(r.body);return r;}};
  const urls:string[]=s.watch.mechanism==='sitemap_delta'?
   (await discoverFromApprovedSitemap({policy,asOf:a.asOf,sitemapPath:s.sitemapPath,requirePathPrefix:s.pathPrefix,maxCandidates:perSource,transport,
    accessMode:s.discoveryAccess,relevanceTerms:t.subject.relevanceTerms})).urls.map(u=>u.url):
   s.feedPath?[...(await discoverFromApprovedFeed221({policy,asOf:a.asOf,feedKind:s.watch.mechanism as 'rss'|'atom',feedPath:s.feedPath,requirePathPrefix:s.pathPrefix,
    maxCandidates:perSource,transport,accessMode:s.discoveryAccess,relevanceTerms:t.subject.relevanceTerms})).urls]:[];
  out.observations.push({categoryId:t.job.categoryId,sourceId:id,checkedAt:a.asOf,status:urls.length?'candidate_urls_found':'nothing_relevant',urls,
   sitemapSha256:s.watch.mechanism==='sitemap_delta'?digest:null,feedSha256:s.watch.mechanism==='sitemap_delta'?null:digest,byteExact:false,
   mechanism:s.watch.mechanism,discoveryPath:listing});
  for(const url of urls){
   const reject=(reason:Rejection261)=>out.rejected.push({url,registrySourceId:id,reason});
   let host='';try{host=new URL(url).host;}catch{reject('off_target_host');continue;}
   if(host!==s.watch.host){reject('off_target_host');continue;}
   let key=url;try{key=normalizeDiscoveryUrl192(url);}catch{/* keep the raw URL */}
   if(observed.has(key)){reject('already_observed');continue;}
   if(restricted.has(host)){reject('host_restricted');continue;}
   const at=attributeUrl261(url,t);if(at==='url_names_other_model'){reject('url_names_other_model');continue;}
   const attribution=at;
   out.candidates.push({url,jobId:t.job.jobId,targetId:t.targetId,registrySourceId:id,host,channel:s.watch.channel,mechanism:s.watch.mechanism,
    origin:'offline_fixture',genuineDiscovery:false,attribution,
    stages:{candidateUrlDiscovered:true,sourceIdentityRegistered:known.has(host),metadataDiscoveryAllowed:true,pageRetrievalPermitted:false,
     factualInformationRetained:false,independentEvidenceVerified:false,recommendationAuthorized:false}});
  }
 }
 out.networkCalls={live:0,fixture:fixtureCalls};
 out.status=out.candidates.length?'candidates_found':'nothing_found';
 return out;
}

/** Offline blocker assessment for one target against the operational state (no transport, no reads). */
export function assessDiscovery261(a:{target:DiscoveryTarget261;registry:Registry220;researchPolicy:ResearchPolicy257;store:KnowledgeStore246}){
 const t=a.target;const blockers:string[]=[];
 const inCategory=a.registry.sources.filter(s=>s.watch.categoryId===t.job.categoryId);
 const lane=inCategory.filter(s=>t.evidence.channels.includes(s.watch.channel));
 if(!inCategory.length)blockers.push('no_operator_discovery_registry_source_for_category');
 else if(!lane.length)blockers.push('no_registry_channel_for_evidence_lane');
 const cleared=lane.filter(s=>s.watch.rightsClearedForMetadata&&a.registry.policies.some(p=>p.sourceId===s.watch.id&&p.host===s.watch.host));
 if(lane.length&&!cleared.length)blockers.push('no_metadata_discovery_policy_for_lane_channels');
 // The product's own known hosts could serve capability A only with a metadata-discovery policy; none is retained.
 const hosts=t.job.productId?(a.store.db.prepare('SELECT DISTINCT s.host,s.policy_json FROM product_sources ps JOIN revisions r USING(revision_id) JOIN sources s USING(source_id) WHERE ps.product_id=?')
  .all(t.job.productId) as {host:string;policy_json:string|null}[]):[];
 if(hosts.length&&hosts.every(h=>!h.policy_json))blockers.push('known_product_hosts_have_no_retained_source_policy');
 if((a.researchPolicy as {allowSourceReads:boolean}).allowSourceReads!==true)blockers.push('live_reads_disabled_by_research_policy');
 if(t.subject.productId&&!t.subject.knownIdentifiers.length)blockers.push('no_exact_identifier_for_candidate_attribution');
 if(t.evidence.unroutedRoles.length)blockers.push('evidence_roles_without_phase82_channel:'+t.evidence.unroutedRoles.join('+'));
 blockers.push('capability_b_new_publisher_discovery_absent');
 return {jobId:t.job.jobId,categoryId:t.job.categoryId,gapKind:t.job.gapKind,criterion:t.job.criterion,mapped:true as const,
  identityState:t.subject.identityState,knownIdentifierCount:t.subject.knownIdentifiers.length,knownProductHosts:hosts.length,
  authorisedChannels:cleared.length,blockers,networkCalls:0 as const};
}
