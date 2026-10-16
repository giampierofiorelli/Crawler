/**
 * Phase264 — the first live, owner-authorised, metadata-only discovery pilot: brand → Wikidata entity and official
 * website claims (P856) → robots.txt → public sitemap metadata of candidate official domains → URL leads attributed to
 * genuine research jobs. Nothing else: no product page or article is read, no value is retained, no source is
 * registered, nothing is admitted or ranked.
 *
 * Authority. A separate, operation-specific policy (pee264.metadata-discovery-policy.v1), loaded with the Phase257
 * protected-file checks and validated against a trusted clock. It does not supersede or widen Phase257, whose type
 * still forbids source reads. Every request passes one gate that enforces: operation scope (Wikidata entity lookups,
 * robots.txt, sitemap metadata on accepted candidate domains only), expiry at the time of each request, a global and a
 * per-host request budget, at least one second between requests, a per-response byte cap, provider stop instructions
 * (403, 429, 5xx, Retry-After, Wikidata maxlag: stop, never retry around them) and a clock check against the server's
 * Date header. Network transport is the existing Phase69 reader; sitemap parsing is Phase75's.
 *
 * Wikidata P856 is an unverified claim. A domain becomes a candidate only when exactly one organisation or brand
 * entity exactly matches the brand and holds a current (not ended, not deprecated) official-website statement.
 * Ambiguity, several values, ended statements and regional qualifiers are reported, never resolved by guessing.
 */
import {createHash} from 'node:crypto';
import {readProtectedPolicyFile257} from './phase257_research_planning.js';
import {discoverFromApprovedSitemap} from './phase75_source_discovery.js';
import {attributeUrl261,type DiscoveryTarget261,type Attribution261} from './phase261_discovery_bridge.js';
import {normalizeDiscoveryUrl192} from './phase192_lineage_marketplace_screen.js';
import type {SourceTransport,SourceResponse} from './approved_web_reader.js';
import type {WebSourcePolicy} from './web_evidence_acquisition.js';
import type {KnowledgeStore246} from './phase246_knowledge_store.js';

const fail=(m:string):never=>{throw Error('phase264_'+m);};
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const STAMP=/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/;
export const WIKIDATA_API264='https://www.wikidata.org/w/api.php';
export type Operation264='wikidata_entity_lookup'|'robots_fetch'|'sitemap_metadata';
const OPERATIONS:readonly Operation264[]=['wikidata_entity_lookup','robots_fetch','sitemap_metadata'];

// ---- policy ----------------------------------------------------------------------------------------------------------
export interface MetadataPilotPolicy264 {
 schema:'pee264.metadata-discovery-policy.v1';policyId:string;revision:number;issuedAt:string;expiresAt:string;
 /** The owner's authorisation as recorded (no legal review implied). */
 authorisation:string;
 operations:Operation264[];jobIds:string[];
 maxRequests:number;
 /** maxRequestsPerHost bounds each candidate domain; the Wikidata API has its own budget (one search per brand plus the entity read). */
 maxRequestsPerHost:number;maxWikidataRequests:number;minIntervalMs:number;maxResponseBytes:number;maxClockSkewSeconds:number;
 /** Wikimedia User-Agent policy: client name/version, contact, the word "bot". */
 userAgent:string;
 prohibited:{pageRetrieval:true;factRetention:true;sourceRegistration:true;evidenceAdmission:true;ranking:true};
}
const KEYS=['schema','policyId','revision','issuedAt','expiresAt','authorisation','operations','jobIds','maxRequests','maxRequestsPerHost','maxWikidataRequests','minIntervalMs',
 'maxResponseBytes','maxClockSkewSeconds','userAgent','prohibited'];
const DAY=86400000;
export function validateMetadataPilotPolicy264(p0:unknown,now:Date):MetadataPilotPolicy264{
 const p:any=p0;const bad=(m:string):never=>fail('invalid_policy: '+m);
 if(!p||typeof p!=='object'||Array.isArray(p))bad('not an object');
 for(const k of Object.keys(p))if(!KEYS.includes(k))bad('unknown field '+k);
 for(const k of KEYS)if(!(k in p))bad('missing field '+k);
 if(p.schema!=='pee264.metadata-discovery-policy.v1')bad('schema');
 if(typeof p.policyId!=='string'||!/^[a-z][a-z0-9_]{2,60}$/.test(p.policyId))bad('policyId');
 if(!Number.isSafeInteger(p.revision)||p.revision<1)bad('revision');
 for(const k of ['issuedAt','expiresAt'])if(typeof p[k]!=='string'||!STAMP.test(p[k]))bad(k);
 const issued=Date.parse(p.issuedAt),expires=Date.parse(p.expiresAt);
 if(!(expires>issued)||expires-issued>7*DAY)bad('expiresAt must be after issuedAt and at most 7 days later');
 if(!(now instanceof Date)||!Number.isFinite(now.getTime()))bad('no trusted clock');
 if(now.getTime()<issued)bad('not yet valid');if(now.getTime()>=expires)bad('expired');
 if(typeof p.authorisation!=='string'||p.authorisation.trim().length<20)bad('authorisation');
 if(!Array.isArray(p.operations)||!p.operations.length||p.operations.some((o:string)=>!OPERATIONS.includes(o as Operation264))||new Set(p.operations).size!==p.operations.length)bad('operations');
 if(!Array.isArray(p.jobIds)||!p.jobIds.length||p.jobIds.length>50||p.jobIds.some((j:string)=>!/^research_[0-9a-f]{32}$/.test(j)))bad('jobIds');
 const int=(k:string,lo:number,hi:number)=>{if(!Number.isInteger(p[k])||p[k]<lo||p[k]>hi)bad(`${k} must be ${lo}..${hi}`);};
 int('maxRequests',1,60);int('maxRequestsPerHost',1,10);int('maxWikidataRequests',1,20);int('minIntervalMs',1000,60000);int('maxResponseBytes',1,2_000_000);int('maxClockSkewSeconds',1,600);
 if(typeof p.userAgent!=='string'||p.userAgent.length>200||!/\bhttps:\/\/\S+/.test(p.userAgent)||!/bot/i.test(p.userAgent)||!/^[A-Za-z][\w.-]*\/[\w.-]+ /.test(p.userAgent))
  bad('userAgent must give name/version, a contact URL and the word bot (Wikimedia User-Agent policy)');
 const pr=p.prohibited;
 if(!pr||Object.keys(pr).sort().join()!=='evidenceAdmission,factRetention,pageRetrieval,ranking,sourceRegistration'||Object.values(pr).some(v=>v!==true))
  bad('prohibited must fix pageRetrieval, factRetention, sourceRegistration, evidenceAdmission and ranking to true');
 return p as MetadataPilotPolicy264;
}
export function loadMetadataPilotPolicy264(path:string,now:Date):MetadataPilotPolicy264{return validateMetadataPilotPolicy264(readProtectedPolicyFile257(path),now);}

// ---- the gate --------------------------------------------------------------------------------------------------------
export interface RequestLog264 {seq:number;at:string;operation:Operation264;host:string;path:string;status:number|null;bytes:number;outcome:string;
 /** The provider's Retry-After instruction, recorded so a later, separately authorised run can honour it. */
 retryAfter?:string|null}
export class MetadataPilotGate264 {
 readonly log:RequestLog264[]=[];halted:string|null=null;
 private bytes=0;private last=0;private readonly perHost=new Map<string,number>();private readonly haltedHosts=new Map<string,string>();
 private readonly domains=new Set<string>();
 constructor(readonly policy:MetadataPilotPolicy264,private readonly transport:SourceTransport,
  private readonly clock:{now:()=>Date;sleep:(ms:number)=>Promise<void>}){
  validateMetadataPilotPolicy264(policy,clock.now());
 }
 /** A candidate official domain becomes reachable for robots and sitemap operations only once accepted. */
 allowDomain(host:string){if(!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host))fail('bad_domain');this.domains.add(host);}
 private sent(){return this.log.filter(l=>l.status!==null||l.outcome==='network_error').length;}
 totals(){return {requests:this.sent(),bytes:this.bytes,halted:this.halted,haltedHosts:Object.fromEntries(this.haltedHosts)};}
 /** The only way to reach the network in this pilot. */
 transportFor(op:Operation264):SourceTransport{return {get:(url,_agent,cap)=>this.request(op,url,cap)};}
 private async request(op:Operation264,raw:string,cap:number):Promise<SourceResponse>{
  const now=this.clock.now();
  const refuse=(outcome:string):never=>{this.log.push({seq:this.log.length+1,at:now.toISOString(),operation:op,host:'',path:'',status:null,bytes:0,outcome});return fail(outcome);};
  if(this.halted)refuse('pilot_halted:'+this.halted);
  if(now.getTime()>=Date.parse(this.policy.expiresAt))refuse('policy_expired');
  if(!this.policy.operations.includes(op))refuse('operation_not_authorised');
  let u:URL|null=null;try{u=new URL(raw);}catch{refuse('bad_url');}
  if(u!.protocol!=='https:'||u!.username||u!.password||u!.port)refuse('url_not_https');
  if(op==='wikidata_entity_lookup'){
   if(u!.origin+u!.pathname!==WIKIDATA_API264)refuse('not_the_wikidata_api');
   const action=u!.searchParams.get('action');
   if(!['wbsearchentities','wbgetentities'].includes(action??'')||u!.searchParams.get('format')!=='json'||u!.searchParams.get('maxlag')!=='5')refuse('wikidata_call_not_authorised');
  }else{
   if(!this.domains.has(u!.hostname))refuse('domain_not_accepted');
   if(op==='robots_fetch'&&u!.pathname!=='/robots.txt')refuse('robots_path_only');
   if(op==='sitemap_metadata'&&u!.pathname==='/robots.txt')refuse('wrong_operation');
  }
  const host=u!.hostname;
  if(this.haltedHosts.has(host))refuse('host_halted:'+this.haltedHosts.get(host));
  if(this.sent()>=this.policy.maxRequests)refuse('request_budget_exhausted');
  const hostCap=op==='wikidata_entity_lookup'?this.policy.maxWikidataRequests:this.policy.maxRequestsPerHost;
  if((this.perHost.get(host)??0)>=hostCap)refuse('host_budget_exhausted');
  const wait=this.last+this.policy.minIntervalMs-this.clock.now().getTime();if(this.last&&wait>0)await this.clock.sleep(wait);
  this.last=this.clock.now().getTime();this.perHost.set(host,(this.perHost.get(host)??0)+1);
  const entry:RequestLog264={seq:this.log.length+1,at:new Date(this.last).toISOString(),operation:op,host,path:u!.pathname,status:null,bytes:0,outcome:'pending'};
  this.log.push(entry);
  let res:SourceResponse;
  try{res=await this.transport.get(u!.toString(),this.policy.userAgent,Math.min(cap,this.policy.maxResponseBytes));}
  catch(e){entry.outcome='network_error';
   if(op==='wikidata_entity_lookup')this.halted='wikidata_network_error';else this.haltedHosts.set(host,'network_error');
   throw Error('phase264_network_error: '+String((e as Error).message??e).slice(0,80));}
  entry.status=res.status;if(res.retryAfter)entry.retryAfter=String(res.retryAfter).slice(0,64);entry.bytes=res.rawBytes?.length??Buffer.byteLength(res.body);this.bytes+=entry.bytes;
  // Trusted clock: the server's Date header must agree with the local clock that validated the policy.
  if(res.date){const skew=Math.abs(Date.parse(res.date)-this.clock.now().getTime())/1000;
   if(!Number.isFinite(skew)||skew>this.policy.maxClockSkewSeconds){entry.outcome='clock_untrusted';this.halted='clock_untrusted';fail('clock_untrusted');}}
  const stop=res.status===403||res.status===429||res.status>=500||!!res.retryAfter;
  const maxlag=op==='wikidata_entity_lookup'&&/"code"\s*:\s*"maxlag"/.test(res.body);
  if(stop||maxlag){
   entry.outcome=maxlag?'maxlag_stop':`stop_${res.status}${res.retryAfter?'_retry_after':''}`;
   // Provider instructions are obeyed by stopping: the Wikidata API stops the pilot; a domain stops that domain only.
   if(op==='wikidata_entity_lookup')this.halted=entry.outcome;else this.haltedHosts.set(host,entry.outcome);
   return res;
  }
  entry.outcome='ok';return res;
 }
}

// ---- Wikidata assessment -------------------------------------------------------------------------------------------
const norm=(s:string)=>s.normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'');
/** Organisation or brand classes recognised directly on P31 (no subclass traversal; an unrecognised type stays unresolved). */
export const ORG_TYPES264:Readonly<Record<string,'organisation'|'brand'>>={Q4830453:'organisation',Q783794:'organisation',Q6881511:'organisation',Q891723:'organisation',
 Q167037:'organisation',Q43229:'organisation',Q658255:'organisation',Q18388277:'organisation',Q1589009:'organisation',Q431289:'brand'};
export function wikidataSearchUrl264(brand:string){const u=new URL(WIKIDATA_API264);
 for(const [k,v] of [['action','wbsearchentities'],['search',brand],['language','en'],['uselang','en'],['type','item'],['limit','7'],['format','json'],['maxlag','5']])u.searchParams.set(k,v);return u.toString();}
export function wikidataEntitiesUrl264(ids:readonly string[]){if(!ids.length||ids.length>50||ids.some(i=>!/^Q\d{1,12}$/.test(i)))fail('bad_entity_ids');const u=new URL(WIKIDATA_API264);
 for(const [k,v] of [['action','wbgetentities'],['ids',ids.join('|')],['props','labels|aliases|claims'],['languages','en'],['format','json'],['maxlag','5']])u.searchParams.set(k,v);return u.toString();}
export function exactMatches264(brand:string,search:any):string[]{
 const n=norm(brand);if(!n)return [];
 return (Array.isArray(search?.search)?search.search:[]).filter((h:any)=>/^Q\d+$/.test(h?.id)&&(norm(h?.label??'')===n||norm(h?.match?.text??'')===n||(h?.aliases??[]).some((a:string)=>norm(a)===n))).map((h:any)=>h.id as string);
}
export interface OfficialSite264 {url:string;host:string;current:boolean;rank:string;languages:string[];jurisdictions:string[]}
export interface BrandAssessment264 {
 brand:string;status:'unambiguous'|'ambiguous'|'unresolved';reasons:string[];
 entities:{id:string;kind:'organisation'|'brand'|'other';typeIds:string[];officialSites:OfficialSite264[]}[];
 candidateDomains:{host:string;entity:string;kind:'organisation'|'brand';multipleCurrentValues:boolean;regional:boolean}[];
}
export function assessBrand264(brand:string,ids:readonly string[],entities:any):BrandAssessment264{
 const out:BrandAssessment264={brand,status:'unresolved',reasons:[],entities:[],candidateDomains:[]};
 if(!ids.length){out.reasons.push('no_exact_label_or_alias_match');return out;}
 for(const id of ids){const e=entities?.entities?.[id];if(!e||e.missing!==undefined){out.reasons.push('entity_missing:'+id);continue;}
  const typeIds=(e.claims?.P31??[]).map((c:any)=>c?.mainsnak?.datavalue?.value?.id).filter((x:unknown)=>typeof x==='string');
  const kinds=typeIds.map((t:string)=>ORG_TYPES264[t]).filter(Boolean);
  const kind:'organisation'|'brand'|'other'=kinds.includes('organisation')?'organisation':kinds.includes('brand')?'brand':'other';
  const sites:OfficialSite264[]=[];
  for(const c of e.claims?.P856??[]){
   if(c?.mainsnak?.snaktype!=='value'||typeof c.mainsnak.datavalue?.value!=='string')continue;
   let host='';try{const u=new URL(c.mainsnak.datavalue.value);if(!/^https?:$/.test(u.protocol))continue;host=u.hostname.toLowerCase();}catch{continue;}
   const q=c.qualifiers??{};
   sites.push({url:c.mainsnak.datavalue.value,host,rank:c.rank??'normal',current:c.rank!=='deprecated'&&!q.P582,
    languages:(q.P407??[]).map((x:any)=>x?.datavalue?.value?.id).filter(Boolean),jurisdictions:(q.P1001??[]).map((x:any)=>x?.datavalue?.value?.id).filter(Boolean)});
  }
  out.entities.push({id,kind,typeIds,officialSites:sites});
 }
 const usable=out.entities.filter(e=>e.kind!=='other'&&e.officialSites.some(s=>s.current));
 if(out.entities.some(e=>e.kind==='other'))out.reasons.push('exact_match_of_non_organisation_type_excluded');
 if(out.entities.some(e=>e.officialSites.some(s=>!s.current)))out.reasons.push('ended_or_deprecated_website_excluded');
 if(usable.length===0){out.reasons.push(out.entities.some(e=>e.kind!=='other')?'organisation_without_current_official_website':'no_organisation_or_brand_entity');return out;}
 if(usable.length>1){out.status='ambiguous';out.reasons.push(`${usable.length}_organisation_or_brand_entities_share_the_name`);return out;}
 const e=usable[0];const current=e.officialSites.filter(s=>s.current);const hosts=[...new Set(current.map(s=>s.host))];
 out.status='unambiguous';
 if(e.kind==='brand')out.reasons.push('brand_entity_manufacturer_may_differ');
 if(hosts.length>1)out.reasons.push('multiple_current_official_websites');
 for(const h of hosts){const s=current.filter(x=>x.host===h);
  out.candidateDomains.push({host:h,entity:e.id,kind:e.kind as 'organisation'|'brand',multipleCurrentValues:hosts.length>1,regional:s.some(x=>x.languages.length>0||x.jurisdictions.length>0)});}
 return out;
}

// ---- sitemap discovery and attribution ----------------------------------------------------------------------------
export interface DomainResult264 {host:string;knownHost:boolean;status:'candidate_urls_found'|'nothing_relevant'|'blocked';reasons:string[];urls:string[]}
/** Robots + sitemap metadata through Phase75, with an in-memory public-metadata record (never persisted, asserts no
 * licence) and the gate as the only transport. */
export async function discoverDomain264(gate:MetadataPilotGate264,host:string,asOf:string,relevanceTerms:readonly string[],knownHosts:ReadonlySet<string>):Promise<DomainResult264>{
 gate.allowDomain(host);
 const policy={sourceId:'pilot264_'+sha(host).slice(0,12),host,basis:'unknown',rightsDocumentId:null,rightsDocumentUrl:null,reviewedBy:null,reviewedAt:null,validUntil:null,
  permittedOperations:['metadata_discovery'],robots:'unknown',robotsCheckedAt:null,websiteTerms:'unknown',termsCheckedAt:null,commercialUseReviewed:false} as unknown as WebSourcePolicy;
 const transport:SourceTransport={get:(url,agent,cap)=>gate.transportFor(new URL(url).pathname==='/robots.txt'?'robots_fetch':'sitemap_metadata').get(url,agent,cap)};
 const r=await discoverFromApprovedSitemap({policy,asOf,maxCandidates:100,transport,accessMode:'public_metadata',relevanceTerms});
 return {host,knownHost:knownHosts.has(host)||knownHosts.has(host.replace(/^www\./,''))||knownHosts.has('www.'+host),status:r.status,reasons:r.reasons,urls:r.urls.map(u=>u.url)};
}
export interface Lead264 {url:string;host:string;jobId:string;attribution:Attribution261;categoryRelevant:boolean;
 stages:{candidateUrlDiscovered:true;publisherRecognised:boolean;documentRegistered:false;metadataDiscoveryAllowed:true;pageRetrievalPermitted:false;
  factualInformationRetained:false;independentEvidenceVerified:false;recommendationAuthorized:false}}
export function classifyForJob264(urls:readonly string[],target:DiscoveryTarget261,ctx:{observed:ReadonlySet<string>;knownHost:boolean;categoryTerms:readonly string[];seen:Set<string>}){
 const leads:Lead264[]=[];const rejected:{url:string;reason:'already_observed'|'url_names_other_model'|'duplicate'}[]=[];
 for(const url of urls){let key=url;try{key=normalizeDiscoveryUrl192(url);}catch{/* keep */}
  if(ctx.observed.has(key)){rejected.push({url,reason:'already_observed'});continue;}
  if(ctx.seen.has(key+'|'+target.job.jobId)){rejected.push({url,reason:'duplicate'});continue;}ctx.seen.add(key+'|'+target.job.jobId);
  const at=attributeUrl261(url,target);if(at==='url_names_other_model'){rejected.push({url,reason:'url_names_other_model'});continue;}
  let path='';try{path=decodeURIComponent(new URL(url).pathname).toLowerCase();}catch{path=url.toLowerCase();}
  leads.push({url,host:new URL(url).hostname,jobId:target.job.jobId,attribution:at,categoryRelevant:ctx.categoryTerms.some(t=>path.includes(t))||at==='url_token_matches_known_identifier',
   stages:{candidateUrlDiscovered:true,publisherRecognised:ctx.knownHost,documentRegistered:false,metadataDiscoveryAllowed:true,pageRetrievalPermitted:false,
    factualInformationRetained:false,independentEvidenceVerified:false,recommendationAuthorized:false}});
 }
 return {leads,rejected};
}
/** Read-only context from the store: retained URLs and known source hosts. */
export function storeContext264(store:KnowledgeStore246){
 const observed=new Set<string>();for(const r of store.db.prepare('SELECT url FROM revisions').all() as {url:string}[]){try{observed.add(normalizeDiscoveryUrl192(r.url));}catch{observed.add(r.url);}}
 const knownHosts=new Set((store.db.prepare('SELECT host FROM sources').all() as {host:string}[]).map(r=>r.host));
 return {observed,knownHosts};
}
