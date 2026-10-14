/** Phase203: YouTube video as a DISCOVERY surface for existing PEE research jobs.
 * No second crawler, caption scraper, automatic video interpretation or ranking.
 * Candidate publication/creator expertise/visual truth never authenticated by metadata.
 * Evidence may be annotated transiently by a human or an optional reviewed provider;
 * outputs contain no caption/video bodies and do not admit independent test events.
 */
import {createHash,createHmac} from 'node:crypto';
import {type ResearchPlan182} from './phase182_gap_research_orchestrator.js';
import {type SourceMatrix196} from './phase196_source_intelligence.js';

const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const ident=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(s)&&!['__proto__','constructor','prototype'].includes(s);
const lang=(s:unknown):s is string=>typeof s==='string'&&/^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$/.test(s);
const code=(s:unknown):s is string=>typeof s==='string'&&/^[A-Za-z0-9_-]{11}$/.test(s);
const channel=(s:unknown):s is string=>typeof s==='string'&&/^UC[A-Za-z0-9_-]{22}$/.test(s);
const stamp=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(s)&&
 Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,19)===s.slice(0,19);
const unique=<T>(a:readonly T[])=>new Set(a).size===a.length;
const fail=(s:string):never=>{throw Error('phase203_'+s);};
const cleanText=(x:unknown,max=180)=>typeof x==='string'&&x.length>0&&x.length<=max&&
 !/[\u0000-\u001f\u007f]/.test(x)&&x.trim()===x;

/** Strict source-identity parser. Reject redirects, arbitrary hosts, playlists and URL userinfo.
 * Never follow a supplied link while identifying a video. */
export function canonicalYouTubeVideo203(value:string):{videoId:string;url:string}{
 if(typeof value!=='string'||value.length>1024)return fail('url');
 let u:URL;try{u=new URL(value);}catch{return fail('url');}
 if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash||
   (u.hostname!=='youtube.com'&&u.hostname!=='www.youtube.com'&&
    u.hostname!=='m.youtube.com'&&u.hostname!=='youtu.be'))return fail('url');
 let videoId:string|null=null;
 if(u.hostname==='youtu.be'){
  if(u.pathname.split('/').length!==2||u.pathname.length!==12)return fail('video_path');
  videoId=u.pathname.slice(1);
 }else if(u.pathname==='/watch'){
  const values=u.searchParams.getAll('v');if(values.length!==1)return fail('video_path');
  videoId=values[0];
 }else {
  const m=/^\/(?:shorts|live)\/([A-Za-z0-9_-]{11})\/?$/.exec(u.pathname);
  if(!m)return fail('video_path');videoId=m[1];
 }
 if(!code(videoId))return fail('video_id');
 return {videoId,url:`https://www.youtube.com/watch?v=${videoId}`};
}
export interface VideoSearchScope203{
 jobId:string;exactVariantId:string;criterionId:string|null;
 /** Operator-reviewed product identity and use, never inferred automatically from title. */
 productName:string;disciplineId:string;outcomeId:string;languages:readonly string[];
}
export interface VideoSearchTask203{
 jobId:string;exactVariantId:string;criterionId:string|null;
 query:string;language:string;regionHint:string|null;method:'youtube_metadata_only';
 sourcePriority:'known_criteria_scoped'|'open_specialist_exploration';
 requiresExactVariantReview:true;authority:'research_only';
}
export interface VideoSearchPlan203{
 schema:'203.1';researchPlanHash:string;tasks:readonly VideoSearchTask203[];
 useExistingPhase182Jobs:true;newCrawlerCreated:false;creatorOAuthRequired:false;
 automaticDownloadsEnabled:false;rankingAuthorized:false;
}
/** English-first remains the baseline; relevant Italian/Japanese specialist probes are additive.
 * Preserve new-source exploration even if Source Intelligence already knows publishers. */
export function planVideoSearch203(args:{plan:ResearchPlan182;matrix:SourceMatrix196;
 scopes:readonly VideoSearchScope203[];maxTasks?:number}):VideoSearchPlan203{
 const {plan:p,matrix:m}=args;const max=args.maxTasks??30;
 if(!p||p.schema!=='182.1'||p.planningOnly!==true||p.rankingAuthorized!==false||
  !m||m.schema!=='196.1'||m.state!=='research_only'||m.publicRankingAllowed!==false||
  !Array.isArray(args.scopes)||args.scopes.length>120||!Number.isSafeInteger(max)||max<1||max>200)fail('search_plan');
 const jobs=new Map(p.jobs.filter(j=>j.kind==='exact_variant_source_research').map(j=>[j.jobId,j]));
 const tasks:VideoSearchTask203[]=[];
 for(const s of args.scopes){
  const j=jobs.get(s?.jobId);
  if(!j||j.categoryId!==p.categoryId||j.exactVariantId!==s.exactVariantId||
   j.criterionId!==s.criterionId||!ident(s.exactVariantId)||!ident(s.disciplineId)||!ident(s.outcomeId)||
   !cleanText(s.productName,110)||!Array.isArray(s.languages)||s.languages.length<1||s.languages.length>8||
   !unique(s.languages)||!s.languages.every(lang))fail('search_scope');
  for(const language of s.languages){
   const regionHint=language.startsWith('it')?'IT':language.startsWith('ja')?'JP':null;
   const query=`${s.productName} ${s.disciplineId.replace(/_/g,' ')} ${s.outcomeId.replace(/_/g,' ')} test`;
   for(const sourcePriority of ['known_criteria_scoped','open_specialist_exploration'] as const){
    tasks.push({jobId:s.jobId,exactVariantId:s.exactVariantId,criterionId:s.criterionId,
     query,language,regionHint,method:'youtube_metadata_only',sourcePriority,
     requiresExactVariantReview:true,authority:'research_only'});
   }
  }
 }
 const ordered=[...new Map(tasks.map(t=>[JSON.stringify([t.jobId,t.language,t.sourcePriority]),t])).values()]
  .sort((a,b)=>a.jobId.localeCompare(b.jobId)||a.language.localeCompare(b.language)||
   a.sourcePriority.localeCompare(b.sourcePriority)).slice(0,max);
 return {schema:'203.1',researchPlanHash:p.planHash,tasks:ordered,
  useExistingPhase182Jobs:true,newCrawlerCreated:false,creatorOAuthRequired:false,
  automaticDownloadsEnabled:false,rankingAuthorized:false};
}
export interface SearchHit203 {
 videoId:string;url:string;channelId:string;publishedAt:string;title:string;
 languageHint:string|null;paidPromotion:'declared'|'not_declared'|'unknown';
 /** Metadata alone does not confirm that exact model was reviewed. */
 exactVariantReviewed:false;creatorCompetenceReviewed:false;testOriginalityVerified:false;
}
export interface VideoMetadataReport203{
 schema:'203.metadata.1';jobId:string;provider:'youtube_data_api_official_snapshot';
 hits:readonly SearchHit203[];candidateOnly:true;videoTextStored:false;
 channelPopularityUsed:false;noCreatorPermissionAsked:true;sourceBodiesStored:false;
}
/** Adapt an externally supplied response from official search.list. Does not perform HTTP.
 * Search snippets are untrusted metadata; no title/description may prove competence or model. */
export function inspectYouTubeSearchSnapshot203(jobId:string,data:unknown):VideoMetadataReport203{
 if(!ident(jobId)||!data||typeof data!=='object'||Array.isArray(data))fail('metadata');
 const raw=data as Record<string,unknown>;
 if(raw.kind!=='youtube#searchListResponse'||!Array.isArray(raw.items)||raw.items.length>50)fail('metadata');
 const hits:SearchHit203[]=[];
 for(const x of raw.items as unknown[]){
  if(!x||typeof x!=='object'||Array.isArray(x))fail('item');
  const i=x as Record<string,unknown>,id=i.id as Record<string,unknown>|undefined,
   sn=i.snippet as Record<string,unknown>|undefined;
  if(!id||!sn||id.kind!=='youtube#video'||!code(id.videoId)||!channel(sn.channelId)||
    !stamp(sn.publishedAt)||!cleanText(sn.title,400))fail('item');
  const videoId=id!.videoId as string;
  hits.push({videoId,url:canonicalYouTubeVideo203(`https://www.youtube.com/watch?v=${videoId}`).url,
   channelId:sn!.channelId as string,publishedAt:sn!.publishedAt as string,title:sn!.title as string,
   languageHint:null,paidPromotion:'unknown',exactVariantReviewed:false,
   creatorCompetenceReviewed:false,testOriginalityVerified:false});
 }
 const dedup=[...new Map(hits.map(h=>[h.videoId,h])).values()].sort((a,b)=>a.videoId.localeCompare(b.videoId));
 return {schema:'203.metadata.1',jobId,provider:'youtube_data_api_official_snapshot',hits:dedup,
  candidateOnly:true,videoTextStored:false,channelPopularityUsed:false,
  noCreatorPermissionAsked:true,sourceBodiesStored:false};
}

export type VideoAccess203='public_url_ai_provider'|'rights_cleared_transcript'|'manually_reviewed_video';
export type ObservationMode203='spoken_claim'|'claimed_visible_demonstration'|
 'visually_checked_demonstration'|'instrument_reading_claimed'|'specialist_practical_opinion'|'commercial_promotion';
export interface VideoObservationIn203{
 observationId:string;atSecond:number;durationSeconds:number;
 criterionId:string;disciplineId:string;outcomeId:string;protocolId:string|null;
 mode:ObservationMode203;finding:'supports'|'contradicts'|'inconclusive';
 /** Scoped ID linking written/video publications of SAME reviewed experimental event. */
 reportedEventGroupId:string|null;
 /** Reviewer/provider receipt is a lead, not authentication of the actual footage. */
 reviewerReceiptId:string|null;sourceBasis:'human_annotation'|'ai_extraction_unverified';
 /** Transient observation text, NOT persisted, including when produced from a transcript. */
 transientExcerpt:string;
}
export interface VideoEvidenceBatchIn203{
 videoUrl:string;sourceId:string;channelId:string;exactVariantId:string;
 categoryId:string;language:string;uploadDate:string;
 access:VideoAccess203;rightsReviewId:string|null;
 providerId:string|null;providerVersion:string|null;
 variantMatchedByReviewId:string|null;expertiseReviewId:string|null;
 sponsorship:'none_disclosed'|'disclosed'|'unknown';
 observations:readonly VideoObservationIn203[];
 /** Optional caller-supplied ephemeral secret; no raw unkeyed short-text fingerprints. */
 sessionHmacKey?:Uint8Array;
 /** Existing Phase192-195 event groups for linked written articles, when known. */
 existingEventGroups:readonly string[];
}
export interface VideoEvidenceCandidate203{
 observationId:string;videoId:string;sourceId:string;atSecond:number;durationSeconds:number;
 urlAtTime:string;criterionId:string;disciplineId:string;outcomeId:string;
 mode:ObservationMode203;finding:VideoObservationIn203['finding'];sourceBasis:VideoObservationIn203['sourceBasis'];
 textHmacSha256:string|null;eventGroupId:string|null;
 lineageStatus:'known_event_already_reported'|'group_requires_review'|'unknown_event';
 findingRequiresHumanVerification:true;independentTestAdmitted:false;
 visualProofAuthenticated:false;specialistAuthorityVerified:false;
}
export interface VideoEvidenceResearch203{
 schema:'203.evidence.1';sourceId:string;videoId:string;url:string;
 state:'research_only';candidates:readonly VideoEvidenceCandidate203[];
 rightsReviewRequired:boolean;exactVariantReviewRequired:boolean;expertiseReviewRequired:boolean;
 sourceLanguage:string;providerDisclosure:string|null;
 missingChecks:readonly string[];publisherBodiesPersisted:false;
 transcriptPersisted:false;automaticCaptionsFetched:false;noUnkeyedTextFingerprints:true;
 experimentMergeAuthorized:false;rankingAuthorized:false;consumerBadgeAuthorized:false;
}
/** All observations are candidate assertions, NEVER automatic proof. No subtitle extractor.
 * Accepts human/provider annotations transiently and returns bounded textless records. */
export function inspectVideoObservations203(a:VideoEvidenceBatchIn203):VideoEvidenceResearch203{
 const video=canonicalYouTubeVideo203(a?.videoUrl);
 if(!ident(a.sourceId)||!channel(a.channelId)||!ident(a.exactVariantId)||!ident(a.categoryId)||
  !lang(a.language)||!/^\d{4}-\d\d-\d\d$/.test(a.uploadDate)||
  !Number.isFinite(Date.parse(a.uploadDate))||!['public_url_ai_provider','rights_cleared_transcript','manually_reviewed_video'].includes(a.access)||
  (a.rightsReviewId!==null&&!ident(a.rightsReviewId))||
  (a.variantMatchedByReviewId!==null&&!ident(a.variantMatchedByReviewId))||
  (a.expertiseReviewId!==null&&!ident(a.expertiseReviewId))||
  (a.providerId!==null&&!ident(a.providerId))||(a.providerVersion!==null&&!cleanText(a.providerVersion,80))||
  !['none_disclosed','disclosed','unknown'].includes(a.sponsorship)||
  !Array.isArray(a.observations)||a.observations.length>200||
  !Array.isArray(a.existingEventGroups)||a.existingEventGroups.length>300||
  !a.existingEventGroups.every(ident)||!unique(a.existingEventGroups)||
  !unique(a.observations.map(o=>o?.observationId)))fail('observation_batch');
 if(a.sessionHmacKey!==undefined&&(!(a.sessionHmacKey instanceof Uint8Array)||
    a.sessionHmacKey.byteLength<32||a.sessionHmacKey.byteLength>128))fail('hmac_key');
 if(a.access==='public_url_ai_provider'&&(!a.providerId||!a.providerVersion))fail('provider_required');
 if(a.access==='rights_cleared_transcript'&&!a.rightsReviewId)fail('transcript_rights');
 const candidates:VideoEvidenceCandidate203[]=[];
 for(const o of a.observations){
  if(!ident(o?.observationId)||!Number.isSafeInteger(o.atSecond)||o.atSecond<0||o.atSecond>86400||
   !Number.isSafeInteger(o.durationSeconds)||o.durationSeconds<1||o.durationSeconds>600||
   !ident(o.criterionId)||!ident(o.disciplineId)||!ident(o.outcomeId)||
   (o.protocolId!==null&&!ident(o.protocolId))||
   !['spoken_claim','claimed_visible_demonstration','visually_checked_demonstration',
     'instrument_reading_claimed','specialist_practical_opinion','commercial_promotion'].includes(o.mode)||
   !['supports','contradicts','inconclusive'].includes(o.finding)||
   !['human_annotation','ai_extraction_unverified'].includes(o.sourceBasis)||
   (o.reportedEventGroupId!==null&&!ident(o.reportedEventGroupId))||
   (o.reviewerReceiptId!==null&&!ident(o.reviewerReceiptId))||
   typeof o.transientExcerpt!=='string'||o.transientExcerpt.length>1600)fail('observation');
  // AI's claim to see a demonstration is not a human-reviewed visual check.
  if(o.mode==='visually_checked_demonstration'&&
    (o.sourceBasis!=='human_annotation'||!o.reviewerReceiptId))fail('visual_assertion');
  const eventGroupId=o.reportedEventGroupId;
  candidates.push({observationId:o.observationId,videoId:video.videoId,sourceId:a.sourceId,
   atSecond:o.atSecond,durationSeconds:o.durationSeconds,
   urlAtTime:`${video.url}&t=${o.atSecond}s`,criterionId:o.criterionId,
   disciplineId:o.disciplineId,outcomeId:o.outcomeId,mode:o.mode,finding:o.finding,
   sourceBasis:o.sourceBasis,textHmacSha256:a.sessionHmacKey?
    createHmac('sha256',a.sessionHmacKey).update(o.transientExcerpt).digest('hex'):null,eventGroupId,
   lineageStatus:eventGroupId===null?'unknown_event':a.existingEventGroups.includes(eventGroupId)?
    'known_event_already_reported':'group_requires_review',
   findingRequiresHumanVerification:true,independentTestAdmitted:false,
   visualProofAuthenticated:false,specialistAuthorityVerified:false});
 }
 candidates.sort((x,y)=>x.atSecond-y.atSecond||x.observationId.localeCompare(y.observationId));
 const missingChecks:string[]=[];
 if(a.rightsReviewId===null)missingChecks.push('source_access_and_reuse_scope_unreviewed');
 if(a.variantMatchedByReviewId===null)missingChecks.push('exact_product_variant_unverified');
 if(a.expertiseReviewId===null)missingChecks.push('task_specific_creator_expertise_unverified');
 if(a.sponsorship==='unknown')missingChecks.push('commercial_relationship_unreviewed');
 if(candidates.some(x=>x.sourceBasis==='ai_extraction_unverified'))missingChecks.push('ai_extraction_not_independent_video_verification');
 if(candidates.some(x=>x.lineageStatus!=='known_event_already_reported'))missingChecks.push('test_event_originality_unresolved');
 return {schema:'203.evidence.1',sourceId:a.sourceId,videoId:video.videoId,url:video.url,
  state:'research_only',candidates,rightsReviewRequired:a.rightsReviewId===null,
  exactVariantReviewRequired:a.variantMatchedByReviewId===null,
  expertiseReviewRequired:a.expertiseReviewId===null,sourceLanguage:a.language,
  providerDisclosure:a.providerId===null?null:`${a.providerId}:${a.providerVersion}`,
  missingChecks, publisherBodiesPersisted:false,transcriptPersisted:false,
  automaticCaptionsFetched:false,noUnkeyedTextFingerprints:true,experimentMergeAuthorized:false,
  rankingAuthorized:false,consumerBadgeAuthorized:false};
}
