/** Phase211: ephemeral caption/annotation alignment for the exact Phase210 upload.
 * A time match does not establish that a claim is true, visually demonstrated,
 * spoken by a qualified person, or an independent experiment. No raw caption text
 * is copied into the returned metadata or any persistent store.
 */
import type {UserUploadReceipt210} from './phase210_user_supplied_video.js';

const fail=(why:string):never=>{throw Error('phase211_'+why);};
const record=(x:unknown):x is Record<string,unknown>=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const exact=(x:unknown,keys:readonly string[])=>record(x)&&Object.keys(x).length===keys.length&&Object.keys(x).every(k=>keys.includes(k));
const id=(v:unknown):v is string=>typeof v==='string'&&/^[a-z][a-z0-9_.:-]{0,80}$/.test(v)&&!['__proto__','constructor','prototype'].includes(v);
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const hex=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{64}$/.test(v);
const language=(v:unknown):v is string=>typeof v==='string'&&/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(v);
const sec=(v:number)=>Math.round(v*1000)/1000;

export interface AudioSilence211{startSecond:number;endSecond:number;}
export interface AudioProfile211{
 schema:'pee211.audio-profile.v1';uploadSha256:string;durationSeconds:number;
 thresholdDb:number;minimumSilenceSeconds:number;silentIntervals:AudioSilence211[];
 detectionMethod:'ffmpeg_silencedetect';audioContainsSpeech:'unknown';
}
export type CaptionOrigin211='local_asr'|'user_supplied_captions'|'single_reviewer_transcription';
export interface CaptionCue211{id:string;startSecond:number;endSecond:number;text:string;}
export interface CaptionInput211{origin:CaptionOrigin211;toolVersion:string;language:string;cues:CaptionCue211[];}
export type ClaimType211='technical_assertion'|'numeric_measurement_report'|'practical_observation'|'outcome_judgement'|'subjective_preference'|'disclosure'|'unclassified';
export interface ClaimAnnotation211{claimId:string;cueId:string;criterionId:string;kind:ClaimType211;}
export interface AudioCaseInput211{
 schema:'pee211.audio-case.v1';prior:UserUploadReceipt210;profile:AudioProfile211;
 captions:CaptionInput211|null;annotations:ClaimAnnotation211[];
}
export interface AudioCaseResult211{
 schema:'pee211.audio-case-result.v1';caseId:string;uploadSha256:string;
 originalSourceVerified:false;speechTranscribed:boolean;transcriptReviewedIndependently:false;
 acoustics:{thresholdDb:number;minimumSilenceSeconds:number;silentIntervals:AudioSilence211[];audioContainsSpeech:'unknown';};
 captionOrigin:CaptionOrigin211|null;captionToolVersion:string|null;captionLanguage:string|null;
 captionCueCount:number;annotationCount:number;
 candidates:{claimId:string;criterionId:string;kind:ClaimType211;atSecond:number;endSecond:number;
 cueId:string;nearbyVisualNoteSeconds:number[];alignmentStatus:'temporal_proximity_only';
 claimedMeasurementVerified:false;spokenStatementVerified:false;originalVideoVerified:false;rankingAuthorized:false;}[];
 independentGoldLabels:0;rankingAuthorized:false;trustBadgeAuthorized:false;
 transcriptTextRetained:false;audioRetained:false;visualSourceProven:false;
 missingChecks:string[];
}
/** Produces *candidate* metadata, not an extraction model or certified speech evidence. */
export function alignAudioEvidence211(input:AudioCaseInput211):AudioCaseResult211{
 if(!exact(input,['schema','prior','profile','captions','annotations'])||input.schema!=='pee211.audio-case.v1')fail('input');
 const {prior,profile,captions,annotations}=input;
 if(!record(prior)||prior.schema!=='pee210.user-upload-receipt.v1'||!hex(prior.observedUploadSha256)||
 prior.sourceOriginalAuthenticated!==false||prior.independentGoldLabels!==0||prior.rankingAuthorized!==false||prior.hasAudio!==true||
 !finite(prior.durationSeconds)||prior.durationSeconds<=0)fail('parent_receipt');
 if(!exact(profile,['schema','uploadSha256','durationSeconds','thresholdDb','minimumSilenceSeconds','silentIntervals','detectionMethod','audioContainsSpeech'])||
 profile.schema!=='pee211.audio-profile.v1'||profile.uploadSha256!==prior.observedUploadSha256||
 profile.durationSeconds!==prior.durationSeconds||!finite(profile.thresholdDb)||profile.thresholdDb> -5||profile.thresholdDb< -70||
 !finite(profile.minimumSilenceSeconds)||profile.minimumSilenceSeconds<0.1||profile.minimumSilenceSeconds>5||
 profile.detectionMethod!=='ffmpeg_silencedetect'||profile.audioContainsSpeech!=='unknown'||
 !Array.isArray(profile.silentIntervals)||profile.silentIntervals.length>1000)fail('audio_profile');
 let previous=-1;
 const safeSilences:AudioSilence211[]=[];
 for(const interval of profile.silentIntervals){
  if(!exact(interval,['startSecond','endSecond'])||!finite(interval.startSecond)||!finite(interval.endSecond)||
  interval.startSecond<0||interval.startSecond<previous||interval.endSecond<=interval.startSecond||
  interval.endSecond>prior.durationSeconds+0.005||interval.endSecond-interval.startSecond+0.002<profile.minimumSilenceSeconds)fail('silence_intervals');
  previous=interval.endSecond;
  safeSilences.push({startSecond:sec(interval.startSecond),endSecond:sec(interval.endSecond)});
 }
 if(!Array.isArray(annotations)||annotations.length>150)fail('annotations');
 const cues=new Map<string,CaptionCue211>();
 let cueCount=0;
 if(captions!==null){
  if(!exact(captions,['origin','toolVersion','language','cues'])||
   !['local_asr','user_supplied_captions','single_reviewer_transcription'].includes(captions.origin)||
   typeof captions.toolVersion!=='string'||!/^[A-Za-z0-9_.:/-]{1,100}$/.test(captions.toolVersion)||
   !language(captions.language)||!Array.isArray(captions.cues)||captions.cues.length>300)fail('captions');
  let lastStart=-1;
  for(const cue of captions.cues){
   if(!exact(cue,['id','startSecond','endSecond','text'])||!id(cue.id)||cues.has(cue.id)||
    !finite(cue.startSecond)||!finite(cue.endSecond)||cue.startSecond<0||cue.startSecond<lastStart||
    cue.endSecond<=cue.startSecond||cue.endSecond>prior.durationSeconds+0.005||
    typeof cue.text!=='string'||cue.text.length<1||cue.text.length>700||
    /[\u0000-\u0008\u000e-\u001f\u007f]/.test(cue.text))fail('caption_cue');
   cues.set(cue.id,cue);lastStart=cue.startSecond;cueCount++;
  }
 }else if(annotations.length)fail('annotations_without_captions');
 const seen=new Set<string>();
 const candidates:AudioCaseResult211['candidates']=[];
 for(const claim of annotations){
  if(!exact(claim,['claimId','cueId','criterionId','kind'])||!id(claim.claimId)||seen.has(claim.claimId)||
   !id(claim.cueId)||!id(claim.criterionId)||!['technical_assertion','numeric_measurement_report','practical_observation','outcome_judgement','subjective_preference','disclosure','unclassified'].includes(claim.kind)||
   !cues.has(claim.cueId))fail('claim');
  seen.add(claim.claimId);
  const cue=cues.get(claim.cueId)!;
  const nearby=prior.observations.filter(note=>note.atSecond>=cue.startSecond-2&&note.atSecond<=cue.endSecond+2).map(note=>note.atSecond);
  candidates.push({claimId:claim.claimId,criterionId:claim.criterionId,kind:claim.kind,
   atSecond:sec(cue.startSecond),endSecond:sec(cue.endSecond),cueId:cue.id,
   nearbyVisualNoteSeconds:nearby,alignmentStatus:'temporal_proximity_only',
   claimedMeasurementVerified:false,spokenStatementVerified:false,originalVideoVerified:false,rankingAuthorized:false});
 }
 candidates.sort((a,b)=>a.atSecond-b.atSecond||a.claimId.localeCompare(b.claimId));
 return {schema:'pee211.audio-case-result.v1',caseId:prior.caseId,uploadSha256:prior.observedUploadSha256,
  originalSourceVerified:false,speechTranscribed:captions!==null,transcriptReviewedIndependently:false,
  acoustics:{thresholdDb:profile.thresholdDb,minimumSilenceSeconds:profile.minimumSilenceSeconds,
   silentIntervals:safeSilences,audioContainsSpeech:'unknown'},
  captionOrigin:captions?.origin??null,captionToolVersion:captions?.toolVersion??null,captionLanguage:captions?.language??null,
  captionCueCount:cueCount,annotationCount:candidates.length,candidates,
  independentGoldLabels:0,rankingAuthorized:false,trustBadgeAuthorized:false,
  transcriptTextRetained:false,audioRetained:false,visualSourceProven:false,
  missingChecks:['transcribed_words_and_timestamps_require_source_review','publisher_and_original_video_provenance',
  'qualified_independent_annotation','per_claim_visual_or_instrumental_verification','exact_product_variant_and_procedure']};
}

/** Strict small SRT/VTT reader, only for transcripts acquired by the caller lawfully.
 * Text remains in the transient return. Caller must not persist these cues.
 */
export function parseEphemeralCaptions211(raw:string,format:'srt'|'vtt'):CaptionCue211[]{
 if(typeof raw!=='string'||raw.length>250_000||raw.length===0||!['srt','vtt'].includes(format))fail('subtitle_input');
 const source=raw.replace(/\r\n?/g,'\n').replace(/^\uFEFF/,'').trim();
 if(format==='vtt'&&!/^WEBVTT(?:\s|$)/.test(source))fail('vtt_header');
 const blocks=(format==='vtt'?source.replace(/^WEBVTT[^\n]*\n?/, '').trim():source).split(/\n\s*\n/).filter(Boolean);
 const results:CaptionCue211[]=[];
 const parseTime=(value:string)=>{
  const m=/^(?:(\d{2}):)?(\d{2}):(\d{2})[.,](\d{3})$/.exec(value);
  if(!m||Number(m[2])>59||Number(m[3])>59)return NaN;
  return Number(m[1]??0)*3600+Number(m[2])*60+Number(m[3])+Number(m[4])/1000;
 };
 for(const b of blocks){
  if(format==='vtt'&&(/^(NOTE|STYLE|REGION)(\s|$)/.test(b)))continue;
  const lines=b.split('\n');
  const n=lines.findIndex(s=>s.includes('-->'));
  if(n<0||n>1||lines.slice(n+1).length<1)fail('subtitle_block');
  const times=/^([0-9:.,]+) --> ([0-9:.,]+)(?:\s+.*)?$/.exec(lines[n]);
  if(!times)fail('subtitle_timing');
  const matched=times!;
  const startSecond=parseTime(matched[1]),endSecond=parseTime(matched[2]);
  const txt=lines.slice(n+1).join(' ').replace(/<[^>]*>/g,'').trim();
  if(!Number.isFinite(startSecond)||!Number.isFinite(endSecond)||endSecond<=startSecond||txt.length<1||txt.length>700)fail('subtitle_cue');
  if(results.length&&startSecond<results[results.length-1].startSecond)fail('subtitle_order');
  results.push({id:`cue${results.length+1}`,startSecond,endSecond,text:txt});
  if(results.length>300)fail('subtitle_count');
 }
 return results;
}
