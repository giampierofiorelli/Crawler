#!/usr/bin/env node
/** Offline upload-bound audio-activity map + optional caller-supplied timed captions.
 * Usage: node scripts/phase211-audio-timeline.mjs phase210-receipt.json local.mp4 out.json
 * Optional: --captions subtitle.srt srt user_supplied_captions manual en --annotations annotations.json
 * No downloading, ASR, speech detection, source authentication, text persistence,
 * or approval of product claims. Captions stay in memory until the process exits.
 */
import {readFileSync,statSync,createReadStream,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {alignAudioEvidence211,parseEphemeralCaptions211} from '../dist/src/phase211_audio_claim_alignment.js';
const args=process.argv.slice(2);
if(args.length!==3 && args.length!==10)throw Error('phase211_usage');
const [receiptPath,mp4Path,outPath]=args.slice(0,3).map(v=>resolve(v));
if([receiptPath,mp4Path].includes(outPath))throw Error('phase211_overwrite_refused');
let captions=null,annotations=[];
if(args.length===10){
 if(args[3]!=='--captions'||args[8]!=='--annotations')throw Error('phase211_arguments');
 const captionPath=resolve(args[4]),annotationPath=resolve(args[9]);
 if([receiptPath,mp4Path,outPath].includes(captionPath)||[receiptPath,mp4Path,outPath].includes(annotationPath))throw Error('phase211_paths');
 const fmt=args[5],origin=args[6],version=args[7];
 if(!['srt','vtt'].includes(fmt))throw Error('phase211_format');
 // Explicit source-language identifier is in the annotation manifest, not a guess based on text.
 const manifest=JSON.parse(readFileSync(annotationPath,'utf8'));
 if(Object.keys(manifest).sort().join(',')!=='annotations,language'||!Array.isArray(manifest.annotations))throw Error('phase211_annotations');
 annotations=manifest.annotations;
 captions={origin,toolVersion:version,language:manifest.language,
  cues:parseEphemeralCaptions211(readFileSync(captionPath,'utf8'),fmt)};
}
const priorEnvelope=JSON.parse(readFileSync(receiptPath,'utf8'));
if(priorEnvelope.schema!=='pee210.offline-probe.v1'||!priorEnvelope.receipt)throw Error('phase211_prior');
const prior=priorEnvelope.receipt;
const stat=statSync(mp4Path);
if(!stat.isFile()||stat.size!==prior.uploadByteLength||stat.size>120_000_000)throw Error('phase211_file_size_or_identity');
let hash=createHash('sha256');
for await (const chunk of createReadStream(mp4Path))hash.update(chunk);
if(hash.digest('hex')!==prior.observedUploadSha256)throw Error('phase211_upload_hash_mismatch');
const exec=(bin,opts)=>{
 const p=spawnSync(bin,opts,{encoding:'utf8',timeout:45000,maxBuffer:3*1024*1024});
 if(p.error||p.status!==0)throw Error(`phase211_${bin}_failed`);
 return p;
};
const probe=JSON.parse(exec('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type,codec_name', '-of','json',mp4Path]).stdout);
const duration=Number(probe.format?.duration);
if(!probe.streams?.some(s=>s.codec_type==='audio')||!Number.isFinite(duration)||Math.abs(duration-prior.durationSeconds)>.02)throw Error('phase211_audio_stream_or_duration');
const thresholdDb=-20,minimumSilenceSeconds=0.4;
const p=exec('ffmpeg',['-nostdin','-hide_banner','-loglevel','info','-i',mp4Path,'-map','0:a:0',
 '-af',`silencedetect=noise=${thresholdDb}dB:d=${minimumSilenceSeconds}`,'-f','null','-']);
const silentIntervals=[];
let start=null;
for(const line of p.stderr.split(/\r?\n/)){
 const s=line.match(/silence_start:\s*(\d+(?:\.\d+)?)/);
 if(s){if(start!==null)throw Error('phase211_malformed_ffmpeg_log');start=Number(s[1]);}
 const end=line.match(/silence_end:\s*(\d+(?:\.\d+)?)/);
 if(end){if(start===null)throw Error('phase211_malformed_ffmpeg_log');
  silentIntervals.push({startSecond:Math.round(start*1000)/1000,endSecond:Math.min(prior.durationSeconds,Math.round(Number(end[1])*1000)/1000)});start=null;}
}
if(start!==null&&prior.durationSeconds-start>=minimumSilenceSeconds)silentIntervals.push({startSecond:Math.round(start*1000)/1000,endSecond:prior.durationSeconds});
const output=alignAudioEvidence211({schema:'pee211.audio-case.v1',prior,
 profile:{schema:'pee211.audio-profile.v1',uploadSha256:prior.observedUploadSha256,durationSeconds:prior.durationSeconds,
 thresholdDb,minimumSilenceSeconds,silentIntervals,detectionMethod:'ffmpeg_silencedetect',audioContainsSpeech:'unknown'},
 captions,annotations});
mkdirSync(dirname(outPath),{recursive:true});
writeFileSync(outPath,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({caseId:output.caseId,uploadSha256:output.uploadSha256,
 silenceIntervals:output.acoustics.silentIntervals.length,spokenWordsAuthenticated:false,
 captionsProvided:output.speechTranscribed,claimsAdmittedAsScientificEvidence:0,
 output:outPath},null,2));
