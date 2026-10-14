/** Phase205: bounded, provider-honest video/track/aspect intake, research-only.
 * Based on the actual user-supplied YouTube.js 18.1.0, youtube-transcript-api 1.2.4
 * and PyABSA 2.4.3 source snapshots. No SDK, model, network, scraper or transcript archive.
 * All source text and source timing arrays belong to the CALLER and are not returned.
 */
import {canonicalYouTubeVideo203,inspectYouTubeSearchSnapshot203,
 inspectVideoObservations203,type VideoEvidenceBatchIn203,type VideoEvidenceResearch203,
 type VideoSearchPlan203,type VideoObservationIn203} from './phase203_video_evidence_search.js';
import {appraiseVideoMethodCues204,type VideoMethodAnnotation204,
 type VideoMethodCue204,type VideoMethodSummary204} from './phase204_creator_authority_awards.js';

const fail=(why:string):never=>{throw Error(`phase205_${why}`);};
const validId=(s:unknown):s is string=>typeof s==='string'&&
 /^[a-z][a-z0-9_.:-]{0,100}$/.test(s)&&!['__proto__','constructor','prototype'].includes(s);
const validChannel=(s:unknown):s is string=>typeof s==='string'&&/^UC[A-Za-z0-9_-]{22}$/.test(s);
const validLanguage=(s:unknown):s is string=>typeof s==='string'&&/^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$/.test(s);
const validDate=(s:unknown):s is string=>typeof s==='string'&&
 /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(s)&&
 Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,19)===s.slice(0,19);
const clean=(s:unknown,max=400):s is string=>typeof s==='string'&&s.length>0&&
 s.length<=max&&s.trim()===s&&!/[\u0000-\u001f\u007f]/.test(s);
const unique=(a:readonly string[])=>new Set(a).size===a.length;

export type DiscoveryProvider205='youtube_data_api_official_snapshot'|'youtubejs_parsed_snapshot';
/** Caller converts parsed YouTube.js Video nodes into explicit video fields; this is
 * NOT the undocumented InnerTube HTTP payload or an official API response. */
export interface YouTubeJsVideoHit205{
 videoUrl:string;title:string;channelId:string|null;publishedAt:string|null;
 selectedLanguageHint:string|null;
}
export interface DiscoveryInput205 {
 plan:VideoSearchPlan203;jobId:string;provider:DiscoveryProvider205;
 providerVersion:string;
 officialSnapshot?:unknown;parsedHits?:readonly YouTubeJsVideoHit205[];
}
export interface DiscoveryCandidate205 {
 videoId:string;url:string;title:string;channelId:string|null;publishedAt:string|null;
 languageHint:string|null;needsReview:readonly string[];exactVariantReviewed:false;
 creatorExpertiseVerified:false;originalTestVerified:false;
}
export interface DiscoveryReport205 {
 schema:'205.discovery.1';state:'research_only';jobId:string;
 provider:DiscoveryProvider205;providerVersion:string;
 hits:readonly DiscoveryCandidate205[];noNewQueue:true;
 sourceIdentityPreserved:true;independentEventsAdmitted:false;
 rankingsChanged:false;noPlatformRequestsMade:true;
}
/** Accepts only an EXISTING video job. Provider method is immutable in the output. */
export function normalizeVideoDiscovery205(input:DiscoveryInput205):DiscoveryReport205 {
 if(!input?.plan||input.plan.schema!=='203.1'||!input.plan.useExistingPhase182Jobs||
  input.plan.rankingAuthorized!==false||!validId(input.jobId)||
  !input.plan.tasks.some(t=>t.jobId===input.jobId)||!clean(input.providerVersion,80)||
  !['youtube_data_api_official_snapshot','youtubejs_parsed_snapshot'].includes(input.provider))fail('discovery_scope');
 let candidates:DiscoveryCandidate205[]=[];
 if(input.provider==='youtube_data_api_official_snapshot'){
  if(input.parsedHits!==undefined||input.officialSnapshot===undefined)fail('provider_shape');
  const report=inspectYouTubeSearchSnapshot203(input.jobId,input.officialSnapshot);
  candidates=report.hits.map(h=>({videoId:h.videoId,url:h.url,title:h.title,
   channelId:h.channelId,publishedAt:h.publishedAt,languageHint:null,
   needsReview:['exact_variant_unverified','creator_expertise_unverified','video_originality_unverified'],
   exactVariantReviewed:false,creatorExpertiseVerified:false,originalTestVerified:false}));
 }else{
  if(input.officialSnapshot!==undefined||!Array.isArray(input.parsedHits)||input.parsedHits.length>50)fail('provider_shape');
  for(const x of input.parsedHits!){
   const v=canonicalYouTubeVideo203(x?.videoUrl);
   if(!clean(x.title)||!(x.channelId===null||validChannel(x.channelId))||
    !(x.publishedAt===null||validDate(x.publishedAt))||
    !(x.selectedLanguageHint===null||validLanguage(x.selectedLanguageHint)))fail('parsed_hit');
   candidates.push({videoId:v.videoId,url:v.url,title:x.title,channelId:x.channelId,
    publishedAt:x.publishedAt,languageHint:x.selectedLanguageHint,
    needsReview:['unofficial_parser_source','exact_variant_unverified','creator_expertise_unverified',
     'video_originality_unverified',...(x.channelId===null?['channel_identity_missing']:[]),
     ...(x.publishedAt===null?['publication_date_missing']:[])],
    exactVariantReviewed:false,creatorExpertiseVerified:false,originalTestVerified:false});
  }
 }
 // A duplicate with conflicting channel attribution is NOT silently treated as trustworthy.
 const grouped=new Map<string,DiscoveryCandidate205[]>();
 for(const c of candidates){const group=grouped.get(c.videoId)??[];group.push(c);grouped.set(c.videoId,group);}
 const out=[...grouped.values()].map(g=>{
  const one=g[0],channelIds=new Set(g.map(v=>v.channelId).filter(Boolean));
  const dates=new Set(g.map(v=>v.publishedAt).filter(Boolean));
  const conflicts=channelIds.size>1||dates.size>1;
  return {...one,channelId:channelIds.size===1?[...channelIds][0]!:null,
   publishedAt:dates.size===1?[...dates][0]!:null,
   needsReview:[...new Set([...one.needsReview,...(conflicts?['metadata_conflict']:[]),
    ...(g.length>1?['duplicate_upload_reference']:[])])].sort()};
 }).sort((a,b)=>a.videoId.localeCompare(b.videoId));
 return {schema:'205.discovery.1',state:'research_only',jobId:input.jobId,
  provider:input.provider,providerVersion:input.providerVersion,hits:out,noNewQueue:true,
  sourceIdentityPreserved:true,independentEventsAdmitted:false,rankingsChanged:false,
  noPlatformRequestsMade:true};
}

export type TrackProvider205='youtubejs_transcript_segment'|'youtube_transcript_api_snippet'|'operator_segment';
export type TrackStatus205='available'|'unavailable'|'blocked'|'no_transcript'|'not_permitted'|'needs_review';
export interface YoutubeJsSegment205{start_ms:string;end_ms:string;text:string;}
export interface TranscriptApiSegment205{start:number;duration:number;text:string;}
export interface OperatorSegment205{startMs:number;endMs:number;text:string;}
export interface TranscriptTrack205 {
 provider:TrackProvider205;providerVersion:string;videoUrl:string;
 status:TrackStatus205;
 /** One reviewed access basis covers processing, NOT independent claim verification. */
 accessReviewId:string|null;
 selectedTrackLanguage:string|null;
 /** Only when separately evidenced, never inferred from translation or menu titles. */
 spokenLanguageReviewed:string|null;
 captionKind:'human'|'asr'|'translated'|'unknown';
 youtubeJsSegments?:readonly YoutubeJsSegment205[];
 transcriptApiSegments?:readonly TranscriptApiSegment205[];
 operatorSegments?:readonly OperatorSegment205[];
}
export interface NormalizedTrack205{
 schema:'205.track.1';state:'research_only';videoId:string;provider:TrackProvider205;
 providerVersion:string;status:TrackStatus205;captionKind:TranscriptTrack205['captionKind'];
 selectedTrackLanguage:string|null;spokenLanguageReviewed:string|null;
 segmentCount:number;firstSecond:number|null;lastSecond:number|null;
 missingChecks:readonly string[];captionBodiesStored:false;perSegmentTextHashesStored:false;
 footageVerified:false;newIndependentTestsAdmitted:false;rankingAuthorized:false;
}
interface TimedSegment205{startMs:number;endMs:number;text:string;}
const boundedMillis=(x:number)=>Number.isSafeInteger(x)&&x>=0&&x<=86_400_000;
const secondsMillis=(x:number)=>{
 if(typeof x!=='number'||!Number.isFinite(x)||x<0||x>86400)return fail('segment_timestamp');
 const ms=Math.round(x*1000);
 if(Math.abs(x*1000-ms)>0.500001||!boundedMillis(ms))fail('segment_timestamp');
 return ms;
};
function transientSegments205(t:TranscriptTrack205):TimedSegment205[]{
 const kinds=[t.youtubeJsSegments!==undefined,t.transcriptApiSegments!==undefined,t.operatorSegments!==undefined];
 const expected=t.provider==='youtubejs_transcript_segment'?0:
  t.provider==='youtube_transcript_api_snippet'?1:2;
 if(kinds.filter(Boolean).length!==1||!kinds[expected])fail('source_shape');
 const raw=expected===0?t.youtubeJsSegments:expected===1?t.transcriptApiSegments:t.operatorSegments;
 if(!Array.isArray(raw)||raw.length>4000)fail('segment_count');
 const out:TimedSegment205[]=[];
 for(const x of raw!){
  let startMs:number,endMs:number,text:string;
  if(expected===0){const y=x as YoutubeJsSegment205;
   if(typeof y?.start_ms!=='string'||typeof y?.end_ms!=='string'||
     !/^(?:0|[1-9]\d*)$/.test(y.start_ms)||!/^(?:0|[1-9]\d*)$/.test(y.end_ms))fail('segment_timestamp');
   startMs=Number(y.start_ms);endMs=Number(y.end_ms);text=y.text;
  }else if(expected===1){const y=x as TranscriptApiSegment205;
   startMs=secondsMillis(y?.start);const duration=secondsMillis(y?.duration);
   endMs=startMs+duration;text=y.text;
  }else{const y=x as OperatorSegment205;
   startMs=y?.startMs;endMs=y?.endMs;text=y?.text;}
  if(!boundedMillis(startMs)||!boundedMillis(endMs)||endMs<=startMs||
    !clean(text,1600)||endMs-startMs>600_000)fail('segment');
  out.push({startMs,endMs,text});
 }
 // Captions may overlap (youtube-transcript-api explicitly documents this).
 if(out.some((s,i)=>i>0&&s.startMs<out[i-1].startMs))fail('unsorted_segments');
 return out;
}
function checkTrack(t:TranscriptTrack205):{videoId:string;parts:TimedSegment205[]}{
 const video=canonicalYouTubeVideo203(t?.videoUrl);
 if(!['youtubejs_transcript_segment','youtube_transcript_api_snippet','operator_segment'].includes(t.provider)||
  !clean(t.providerVersion,80)||
  !['available','unavailable','blocked','no_transcript','not_permitted','needs_review'].includes(t.status)||
  !(t.accessReviewId===null||validId(t.accessReviewId))||
  !(t.selectedTrackLanguage===null||validLanguage(t.selectedTrackLanguage))||
  !(t.spokenLanguageReviewed===null||validLanguage(t.spokenLanguageReviewed))||
  !['human','asr','translated','unknown'].includes(t.captionKind))fail('track');
 if(t.status!=='available'){
  const arrays=[t.youtubeJsSegments,t.transcriptApiSegments,t.operatorSegments];
  if(arrays.some(v=>v!==undefined&&(!Array.isArray(v)||v.length!==0)))fail('unavailable_has_content');
  return {videoId:video.videoId,parts:[]};
 }
 if(t.accessReviewId===null||t.selectedTrackLanguage===null)fail('unreviewed_track');
 const parts=transientSegments205(t);
 if(parts.length===0)fail('empty_available_track');
 return {videoId:video.videoId,parts};
}
/** Text never escapes the invocation: only bounds, provider and access-review leads. */
export function normalizeTranscriptTrack205(t:TranscriptTrack205):NormalizedTrack205{
 const {videoId,parts}=checkTrack(t);
 const missing:string[]=[];
 if(t.status!=='available')missing.push(`source_${t.status}`);
 if(t.accessReviewId===null)missing.push('access_review_missing');
 if(t.spokenLanguageReviewed===null)missing.push('original_spoken_language_unverified');
 if(t.captionKind==='asr')missing.push('automatic_caption_accuracy_unverified');
 if(t.captionKind==='translated')missing.push('translation_fidelity_unverified');
 if(t.captionKind==='unknown')missing.push('caption_generation_method_unknown');
 return {schema:'205.track.1',state:'research_only',videoId,
  provider:t.provider,providerVersion:t.providerVersion,status:t.status,
  captionKind:t.captionKind,selectedTrackLanguage:t.selectedTrackLanguage,
  spokenLanguageReviewed:t.spokenLanguageReviewed,segmentCount:parts.length,
  firstSecond:parts.length?Math.floor(parts[0].startMs/1000):null,
  lastSecond:parts.length?Math.ceil(Math.max(...parts.map(p=>p.endMs))/1000):null,
  missingChecks:missing,captionBodiesStored:false,perSegmentTextHashesStored:false,
  footageVerified:false,newIndependentTestsAdmitted:false,rankingAuthorized:false};
}

/** Aspect opinions are RESEARCH labels, not accuracy-validated sentiment. The source
 * text is available only in the supplied ephemeral track, never in output. */
export type AspectKind205='personal_taste'|'daily_use'|'instrument_claim'|'demonstration_claim'|
 'method_explanation'|'sales_pitch';
export type Polarity205='positive'|'negative'|'mixed'|'neutral'|'unknown';
export interface AspectAnnotation205 {
 annotationId:string;segmentIndex:number;criterionId:string;disciplineId:string;
 outcomeId:string;protocolId:string|null;kind:AspectKind205;polarity:Polarity205;
 sourceBasis:'human_annotation'|'ai_extraction_unverified';reviewerReceiptId:string|null;
 reportedEventGroupId:string|null;methodCue:VideoMethodCue204|null;
}
export interface AspectIntake205{
 track:TranscriptTrack205;batch:Omit<VideoEvidenceBatchIn203,'observations'>;
 annotations:readonly AspectAnnotation205[];
}
export interface AspectOutcome205{
 schema:'205.aspects.1';state:'research_only';videoId:string;
 provider:TrackProvider205;research:VideoEvidenceResearch203;
 methodSummary:VideoMethodSummary204;
 aspects:readonly {annotationId:string;criterionId:string;kind:AspectKind205;
  polarity:Polarity205;timeSecond:number;sourceBasis:AspectAnnotation205['sourceBasis'];
  specialistCompetenceNotInferred:true;measurementNotAuthenticated:true;}[];
 originalSpokenLanguageNotInferred:true;noModelConfidenceAsTruth:true;
 sourceTextRetained:false;noAutomaticOriginalityClaim:true;rankingAuthorized:false;
}
/** Reuse Phase203 evidence assertions AND Phase204 method appraisal in one path. */
export function inspectTranscriptAspects205(a:AspectIntake205):AspectOutcome205 {
 const {videoId,parts}=checkTrack(a?.track);
 const actualProviderId=a.track.provider==='youtubejs_transcript_segment'?'youtubejs':
  a.track.provider==='youtube_transcript_api_snippet'?'youtube_transcript_api':'operator_annotation';
 if(a.batch?.providerId!==null&&a.batch?.providerId!==actualProviderId)fail('provider_mismatch');
 if(a.batch?.providerVersion!==null&&a.batch?.providerVersion!==a.track.providerVersion)fail('provider_version_mismatch');
 if(a.track.status!=='available'||!Array.isArray(a.annotations)||a.annotations.length>150||
  !unique(a.annotations.map(x=>x?.annotationId))||
  canonicalYouTubeVideo203(a.batch?.videoUrl).videoId!==videoId||
  a.batch.access!=='rights_cleared_transcript'||a.batch.rightsReviewId!==a.track.accessReviewId||
  !a.batch.rightsReviewId||a.batch.language!==a.track.selectedTrackLanguage)fail('aspect_scope');
 const obs:VideoObservationIn203[]=[],cues:VideoMethodAnnotation204[]=[],aspects:AspectOutcome205['aspects'][number][]=[];
 for(const x of a.annotations){
  if(!validId(x?.annotationId)||!Number.isSafeInteger(x.segmentIndex)||
   x.segmentIndex<0||x.segmentIndex>=parts.length||!validId(x.criterionId)||
   !validId(x.disciplineId)||!validId(x.outcomeId)||
   !(x.protocolId===null||validId(x.protocolId))||
   !['personal_taste','daily_use','instrument_claim','demonstration_claim','method_explanation','sales_pitch'].includes(x.kind)||
   !['positive','negative','mixed','neutral','unknown'].includes(x.polarity)||
   !['human_annotation','ai_extraction_unverified'].includes(x.sourceBasis)||
   !(x.reviewerReceiptId===null||validId(x.reviewerReceiptId))||
   !(x.reportedEventGroupId===null||validId(x.reportedEventGroupId))||
   !(x.methodCue===null||['setup_parameters_disclosed','repeat_or_comparison_shown',
    'limitations_or_confounders_discussed','long_term_use_context','personal_taste_explicit',
    'unsupported_superlative','commercial_pitch'].includes(x.methodCue))||
   (x.sourceBasis==='ai_extraction_unverified'&&x.reviewerReceiptId!==null)||
   (x.sourceBasis==='human_annotation'&&x.reviewerReceiptId===null))fail('annotation');
  const seg=parts[x.segmentIndex],second=Math.floor(seg.startMs/1000),
   duration=Math.max(1,Math.ceil((seg.endMs-seg.startMs)/1000));
  const kind=x.kind==='instrument_claim'?'instrument_reading_claimed':
   x.kind==='demonstration_claim'?'claimed_visible_demonstration':
   x.kind==='sales_pitch'?'commercial_promotion':
   x.kind==='method_explanation'?'spoken_claim':'specialist_practical_opinion';
  const finding=x.polarity==='positive'?'supports':x.polarity==='negative'?'contradicts':'inconclusive';
  obs.push({observationId:x.annotationId,atSecond:second,durationSeconds:duration,
   criterionId:x.criterionId,disciplineId:x.disciplineId,outcomeId:x.outcomeId,
   protocolId:x.protocolId,mode:kind,finding,reportedEventGroupId:x.reportedEventGroupId,
   reviewerReceiptId:x.reviewerReceiptId,sourceBasis:x.sourceBasis,
   transientExcerpt:seg.text});
  if(x.methodCue!==null)cues.push({cueId:`cue_${x.annotationId}`,observationId:x.annotationId,
   kind:x.methodCue,basis:x.sourceBasis==='human_annotation'?'human_reviewed_annotation':'ai_proposal',
   reviewReceiptId:x.reviewerReceiptId});
  aspects.push({annotationId:x.annotationId,criterionId:x.criterionId,kind:x.kind,
   polarity:x.polarity,timeSecond:second,sourceBasis:x.sourceBasis,
   specialistCompetenceNotInferred:true,measurementNotAuthenticated:true});
 }
 const research=inspectVideoObservations203({...a.batch,providerId:actualProviderId,
  providerVersion:a.track.providerVersion,observations:obs});
 const methodSummary=appraiseVideoMethodCues204(research,cues);
 aspects.sort((x,y)=>x.timeSecond-y.timeSecond||x.annotationId.localeCompare(y.annotationId));
 return {schema:'205.aspects.1',state:'research_only',videoId,provider:a.track.provider,
  research,methodSummary,aspects,originalSpokenLanguageNotInferred:true,
  noModelConfidenceAsTruth:true,sourceTextRetained:false,noAutomaticOriginalityClaim:true,
  rankingAuthorized:false};
}
