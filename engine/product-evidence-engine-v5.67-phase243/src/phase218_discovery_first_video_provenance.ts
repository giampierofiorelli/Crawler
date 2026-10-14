/** Phase218: discovery-time video provenance. Reuses Phases 69, 203 and 205.
 * A known URL identifies a candidate LOCATION, not the author, licence, contents,
 * method, originality, or scientific validity. All page bytes are ephemeral.
 * No crawler, platform request, playback, caption retrieval or media download.
 */
import {createHash} from 'node:crypto';
import {readApprovedSource,type SourceTransport} from './approved_web_reader.js';
import {canonicalYouTubeVideo203} from './phase203_video_evidence_search.js';
import type {DiscoveryReport205} from './phase205_video_provider_normalization.js';
import type {EvidenceAcquisitionPlan,EvidenceQueueItem,WebCandidate,WebSourcePolicy} from './web_evidence_acquisition.js';

const fail=(why:string):never=>{throw Error(`phase218_${why}`);};
const sha=(x:Uint8Array)=>createHash('sha256').update(x).digest('hex');
const goodHash=(s:unknown):s is string=>typeof s==='string'&&/^[0-9a-f]{64}$/.test(s);
const identifier=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(s)&&!['__proto__','constructor','prototype'].includes(s);
const ytId=(s:unknown):s is string=>typeof s==='string'&&/^[A-Za-z0-9_-]{11}$/.test(s);
const urlLimit=2048;
function safeWebUrl(raw:unknown,allowQuery=false):string|null{
 if(typeof raw!=='string'||raw.length>urlLimit||raw.trim()!==raw)return null;
 try{
  const u=new URL(raw);
  if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash||(!allowQuery&&u.search)||
    !/^[a-z0-9.-]+$/.test(u.hostname)||!u.hostname.includes('.')||
    /(?:^|\.)(?:localhost|local|internal|test|invalid|example)$/.test(u.hostname)||
    /^(?:\d+\.){3}\d+$/.test(u.hostname)||/\[(?:[a-f\d:]+)\]/.test(u.hostname)||
    /%(?:00|2e|2f|5c)/i.test(u.pathname))return null;
  return u.toString();
 }catch{return null;}
}
function youtubeFromLocation(raw:string):{videoId:string;canonicalUrl:string;playerUrl:string}|null{
 try{
  const u=new URL(raw);
  if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash)return null;
  if(['www.youtube.com','youtube.com','m.youtube.com','youtu.be'].includes(u.hostname)){
   if(u.pathname==='/watch'||u.hostname==='youtu.be'||/^\/(?:shorts|live)\//.test(u.pathname)){
    const v=canonicalYouTubeVideo203(raw);
    return {videoId:v.videoId,canonicalUrl:v.url,playerUrl:raw};
   }
  }
  if(!['youtube.com','www.youtube.com','www.youtube-nocookie.com','youtube-nocookie.com'].includes(u.hostname))return null;
  const m=/^\/embed\/([A-Za-z0-9_-]{11})\/?$/.exec(u.pathname);
  if(!m||u.searchParams.has('list')||u.searchParams.has('playlist')||u.searchParams.has('v'))return null;
  const v=canonicalYouTubeVideo203(`https://www.youtube.com/watch?v=${m[1]}`);
  return {videoId:v.videoId,canonicalUrl:v.url,playerUrl:raw};
 }catch{return null;}
}
const escapeAttr=(raw:string)=>raw.replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#(?:x27|39);/gi,"'");
function attribute(tag:string,name:string):string|null{
 const re=new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"<>]*)"|'([^'<>]*)'|([^\\s<>]+))`,'i');
 const m=re.exec(tag);return m?escapeAttr(m[1]??m[2]??m[3]):null;
}
export type LocationType218='youtube_video'|'external_player'|'declared_content_url';
export interface PageVideoLocation218{
 locationType:LocationType218;discoveryTag:'iframe_src'|'jsonld_embedUrl'|'jsonld_contentUrl';
 url:string;youtubeVideoId:string|null;canonicalVideoUrl:string|null;
 /** Player and content are distinct; HTML metadata never establishes media-byte identity. */
 videoBytesAuthenticated:false;publisherIdentityVerified:false;
}
/** Not a general HTML/DOM extractor. Only literal bounded iframe and VideoObject declarations.
 * Comment, script and template shadowing is conservative; ambiguities reject/omit rather than guess. */
export function extractTransientVideoLocations218(html:string):PageVideoLocation218[]{
 if(typeof html!=='string'||Buffer.byteLength(html,'utf8')>1_000_000)return fail('html_size');
 const out:PageVideoLocation218[]=[];
 function add(raw:unknown,tag:PageVideoLocation218['discoveryTag']):void{
  if(typeof raw!=='string'||raw.length>urlLimit)return;
  const yt=youtubeFromLocation(raw);
  if(yt){out.push({locationType:'youtube_video',discoveryTag:tag,url:yt.playerUrl,
   youtubeVideoId:yt.videoId,canonicalVideoUrl:yt.canonicalUrl,
   videoBytesAuthenticated:false,publisherIdentityVerified:false});return;}
  const ordinary=safeWebUrl(raw);
  if(!ordinary)return;
  out.push({locationType:tag==='jsonld_contentUrl'?'declared_content_url':'external_player',
   discoveryTag:tag,url:ordinary,youtubeVideoId:null,canonicalVideoUrl:null,
   videoBytesAuthenticated:false,publisherIdentityVerified:false});
 }
 // Treat JSON-LD as publisher assertions. Never interpret arbitrary script text as an iframe.
 const uncommented=html.replace(/<!--[\s\S]*?-->/g,'');
 const scripts=/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;
 for(const match of uncommented.matchAll(scripts)){
  const tag=match[0],open=tag.slice(0,tag.indexOf('>')+1);
  if(attribute(open,'type')?.toLowerCase()!=='application/ld+json')continue;
  const raw=tag.slice(open.length).replace(/<\/script\s*>$/i,'').trim();
  if(raw.length<2||raw.length>32_000)continue;
  let doc:unknown;try{doc=JSON.parse(raw);}catch{continue;}
  const queue=[doc];let visited=0;
  while(queue.length&&visited++<100){
   const n=queue.shift();
   if(Array.isArray(n)){queue.push(...n.slice(0,30));continue;}
   if(!n||typeof n!=='object')continue;
   const x=n as Record<string,unknown>;
   if(Array.isArray(x['@graph']))queue.push(...x['@graph'].slice(0,30));
   const type=x['@type'];
   if(type==='VideoObject'||Array.isArray(type)&&type.includes('VideoObject')){
    if(typeof x.embedUrl==='string')add(x.embedUrl,'jsonld_embedUrl');
    if(typeof x.contentUrl==='string')add(x.contentUrl,'jsonld_contentUrl');
   }
  }
 }
 // Mask script/comment/template/noscript/style contents so string literals and hidden
 // fallback markup do not masquerade as an observed embedded player.
 const visible=uncommented
  .replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
 for(const m of visible.matchAll(/<iframe\b[^>]*>/gi)){
  const raw=attribute(m[0],'src');if(raw)add(raw,'iframe_src');
 }
 const dedup=new Map<string,PageVideoLocation218>();
 for(const x of out){const key=`${x.discoveryTag}|${x.locationType}|${x.url}`;dedup.set(key,x);}
 return [...dedup.values()].sort((a,b)=>a.url.localeCompare(b.url)||a.discoveryTag.localeCompare(b.discoveryTag)).slice(0,30);
}
export interface PageVideoCaptureRequest218{
 plan:EvidenceAcquisitionPlan;queueItem:EvidenceQueueItem;candidate:WebCandidate;
 policy:WebSourcePolicy;checkedAt:string;expectedDocumentSha256:string|null;
 /** Only synthetic tests may inject transport, never claim real publisher retrieval. */
 fixtureTransport?:SourceTransport;
}
export interface PageVideoCapture218{
 schema:'pee218.page-video.v1';status:'blocked'|'fixture_only'|'controlled_fetch_unreviewed';
 pageUrl:string;sourceId:string;documentSha256:string|null;
 versionStatus:'not_captured'|'first_observation'|'matches_expected'|'changed';
 locations:readonly PageVideoLocation218[];reason:string|null;
 originalVideoVerified:false;rightsToMediaVerified:false;captionsFetched:false;
 webpageBodyRetained:false;productVariantVerified:false;rankingAuthorized:false;
}
export async function captureDiscoveredPageVideos218(req:PageVideoCaptureRequest218):Promise<PageVideoCapture218>{
 if(!req||!req.plan||!req.candidate||!req.queueItem||!req.policy||
  !identifier(req.candidate.sourceId)||req.candidate.sourceId!==req.policy.sourceId||
  req.queueItem.candidateId!==req.candidate.id||req.queueItem.canonicalUrl!==req.candidate.url||
  req.plan.exactVariantId!==req.candidate.exactVariantId||
  (req.expectedDocumentSha256!==null&&!goodHash(req.expectedDocumentSha256)))fail('capture_boundary');
 const base:PageVideoCapture218={schema:'pee218.page-video.v1',status:'blocked',
  pageUrl:req.candidate.url,sourceId:req.candidate.sourceId,documentSha256:null,
  versionStatus:'not_captured',locations:[],reason:null,originalVideoVerified:false,
  rightsToMediaVerified:false,captionsFetched:false,webpageBodyRetained:false,
  productVariantVerified:false,rankingAuthorized:false};
 let observed:{hash:string;locations:PageVideoLocation218[]}|null=null;
 try{
  const result=await readApprovedSource({plan:req.plan,queueItem:req.queueItem,candidate:req.candidate,
   policy:req.policy,checkedAt:req.checkedAt,transport:req.fixtureTransport,
   onQuarantinedDocument:doc=>{
    if(doc.url!==req.candidate.url||!/^text\/html(?:;|$)/i.test(doc.contentType))throw Error('not_original_html');
    const html=Buffer.from(doc.completeBytes).toString('utf8');
    observed={hash:sha(doc.completeBytes),locations:extractTransientVideoLocations218(html)};
   }});
  if(result.status!=='quarantined'||!observed)return {...base,reason:result.status==='blocked'?result.reasons.join(','):'capture_missing'};
  const o=observed as {hash:string;locations:PageVideoLocation218[]};
  return {...base,status:req.fixtureTransport?'fixture_only':'controlled_fetch_unreviewed',
   documentSha256:o.hash,locations:o.locations,
   versionStatus:req.expectedDocumentSha256===null?'first_observation':
    req.expectedDocumentSha256===o.hash?'matches_expected':'changed'};
 }catch{return {...base,reason:'controlled_capture_failed'};}
}
export interface VideoOriginCandidate218{
 videoId:string;canonicalUrl:string;discoveredOnPages:readonly string[];
 playerUrls:readonly string[];channelId:string|null;
 channelClaimBasis:'provider_metadata_unreviewed'|'unknown';
 sourceKinds:readonly ('youtube_search'|'webpage_embed'|'webpage_structured_data')[];
 missingChecks:readonly string[];originalTestAuthenticated:false;
 publisherIdentityAuthenticated:false;mediaBytesAuthenticated:false;
 rankingAuthorized:false;
}
export interface OriginReconciliation218{
 schema:'pee218.discovery-origin.v1';state:'research_only';videos:readonly VideoOriginCandidate218[];
 unresolvedExternalLocations:readonly {pageUrl:string;locationUrl:string;kind:LocationType218}[];
 controlledPageCount:number;fixturePageCount:number;blockedPageCount:number;
 mediaDownloaded:false;sourceScraped:false;trustBadgeAuthorized:false;rankingAuthorized:false;
}
/** Merges existing Phase205 YouTube discovery with approved page observations.
 * The URL/ID is known at DISCOVERY; no retroactive screen-recording search. */
export function reconcileDiscoveredVideoOrigins218(input:{
 discovery:DiscoveryReport205|null;pageCaptures:readonly PageVideoCapture218[];
}):OriginReconciliation218{
 if(!input||!Array.isArray(input.pageCaptures)||input.pageCaptures.length>100||
  (input.discovery!==null&&(!input.discovery||input.discovery.schema!=='205.discovery.1'||
   input.discovery.state!=='research_only'||input.discovery.rankingsChanged!==false)))fail('reconcile_input');
 type Mutable={pages:Set<string>;players:Set<string>;channels:Set<string>;
  kinds:Set<'youtube_search'|'webpage_embed'|'webpage_structured_data'>;needs:Set<string>};
 const videos=new Map<string,Mutable>();
 const get=(v:string):Mutable=>{
  let r=videos.get(v);if(!r){r={pages:new Set(),players:new Set(),channels:new Set(),
   kinds:new Set(),needs:new Set()};videos.set(v,r);}return r;
 };
 for(const hit of input.discovery?.hits??[]){
  const canonical=canonicalYouTubeVideo203(hit.url);
  if(hit.videoId!==canonical.videoId)fail('provider_video_id_mismatch');
  const r=get(canonical.videoId);r.kinds.add('youtube_search');r.players.add(canonical.url);
  if(hit.channelId!==null)r.channels.add(hit.channelId);
  for(const n of hit.needsReview)r.needs.add(n);
 }
 const external:{pageUrl:string;locationUrl:string;kind:LocationType218}[]=[];
 const pageVersions=new Map<string,Set<string>>();
 for(const c of input.pageCaptures){
  if(c?.schema!=='pee218.page-video.v1'||!['blocked','fixture_only','controlled_fetch_unreviewed'].includes(c.status)||
   !Array.isArray(c.locations)||c.locations.length>30||
   !identifier(c.sourceId)||!safeWebUrl(c.pageUrl,true)||
   (c.status!=='blocked'&&!goodHash(c.documentSha256))||
   c.rankingAuthorized!==false||c.originalVideoVerified!==false||c.webpageBodyRetained!==false)fail('capture_record');
  if(c.status==='blocked')continue;
  const versions=pageVersions.get(c.pageUrl)??new Set<string>();versions.add(c.documentSha256!);
  pageVersions.set(c.pageUrl,versions);
  for(const x of c.locations){
   if(x.youtubeVideoId!==null){
    const v=canonicalYouTubeVideo203(x.canonicalVideoUrl!);
    if(v.videoId!==x.youtubeVideoId||youtubeFromLocation(x.url)?.videoId!==v.videoId)fail('capture_video_mismatch');
    const r=get(v.videoId);r.pages.add(c.pageUrl);r.players.add(x.url);
    r.kinds.add(x.discoveryTag==='iframe_src'?'webpage_embed':'webpage_structured_data');
    r.needs.add(c.status==='fixture_only'?'page_fixture_only':'controlled_page_unreviewed');
    if(c.versionStatus==='changed')r.needs.add('page_revision_changed');
   }else{
    if(x.canonicalVideoUrl!==null||!safeWebUrl(x.url))fail('external_location');
    external.push({pageUrl:c.pageUrl,locationUrl:x.url,kind:x.locationType});
   }
  }
 }
 const entries=[...videos.entries()].map(([videoId,r]):VideoOriginCandidate218=>{
  if(r.channels.size>1)r.needs.add('channel_metadata_conflict');
  for(const page of r.pages)if((pageVersions.get(page)?.size??0)>1)r.needs.add('page_snapshot_conflict');
  r.needs.add('original_review_publication_not_authenticated');
  r.needs.add('rights_and_media_access_not_reviewed');
  r.needs.add('creator_competence_and_test_method_unverified');
  return {videoId,canonicalUrl:canonicalYouTubeVideo203(`https://www.youtube.com/watch?v=${videoId}`).url,
   discoveredOnPages:[...r.pages].sort(),playerUrls:[...r.players].sort(),
   channelId:r.channels.size===1?[...r.channels][0]:null,
   channelClaimBasis:r.channels.size===1?'provider_metadata_unreviewed':'unknown',
   sourceKinds:[...r.kinds].sort(),missingChecks:[...r.needs].sort(),
   originalTestAuthenticated:false,publisherIdentityAuthenticated:false,
   mediaBytesAuthenticated:false,rankingAuthorized:false};
 }).sort((a,b)=>a.videoId.localeCompare(b.videoId));
 return {schema:'pee218.discovery-origin.v1',state:'research_only',videos:entries,
  unresolvedExternalLocations:external.sort((a,b)=>a.pageUrl.localeCompare(b.pageUrl)||a.locationUrl.localeCompare(b.locationUrl)),
  controlledPageCount:input.pageCaptures.filter(x=>x.status==='controlled_fetch_unreviewed').length,
  fixturePageCount:input.pageCaptures.filter(x=>x.status==='fixture_only').length,
  blockedPageCount:input.pageCaptures.filter(x=>x.status==='blocked').length,
  mediaDownloaded:false,sourceScraped:false,trustBadgeAuthorized:false,rankingAuthorized:false};
}
