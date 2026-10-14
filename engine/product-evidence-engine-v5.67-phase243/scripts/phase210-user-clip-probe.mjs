#!/usr/bin/env node
/** Phase210: opt-in, offline, bounded evaluation of user-supplied MP4 bytes.
 * Usage: node scripts/phase210-user-clip-probe.mjs notes.json input.mp4 output.json
 * No original-video/authorship/competence validation is implied. No download.
 */
import {readFileSync,writeFileSync,mkdirSync,statSync,mkdtempSync,rmSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {inspectUserSuppliedVideo210} from '../dist/src/phase210_user_supplied_video.js';
if(process.argv.length!==5)throw Error('phase210_usage: notes.json input.mp4 output.json');
const [notesPath,mp4Path,outPath]=process.argv.slice(2).map(v=>resolve(v));
if(mp4Path===outPath||notesPath===outPath)throw Error('phase210_refuse_overwrite_source');
const stat=statSync(mp4Path);
if(!stat.isFile()||stat.size<32||stat.size>120_000_000)throw Error('phase210_invalid_size');
const manifest=JSON.parse(readFileSync(notesPath,'utf8'));
if(!manifest||Object.keys(manifest).sort().join(',')!==['caseId','notes'].sort().join(','))throw Error('phase210_invalid_notes_manifest');
const run=(bin,args)=>{
 const p=spawnSync(bin,args,{encoding:'utf8',timeout:45000,maxBuffer:1024*1024});
 if(p.error||p.status!==0)throw Error(`phase210_${bin}_failed`);
 return p.stdout;
};
const probe=JSON.parse(run('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type,codec_name,width,height',
 '-of','json',mp4Path]));
const seconds=Number(probe.format?.duration);
const video=probe.streams?.find(s=>s.codec_type==='video');
if(!video||!['h264','hevc','mpeg4','av1'].includes(video.codec_name)||
 !Number.isFinite(seconds)||seconds<=0||seconds>1800)throw Error('phase210_invalid_media');
const bytes=readFileSync(mp4Path);
const receipt=inspectUserSuppliedVideo210({schema:'pee210.upload-input.v1',caseId:manifest.caseId,
 receivedFileName:mp4Path.split('/').at(-1),bytes:new Uint8Array(bytes),durationSeconds:seconds,
 hasAudio:probe.streams.some(s=>s.codec_type==='audio'),originalPublisherUrl:null,notes:manifest.notes});
const times=[0,seconds/4,seconds/2,seconds*3/4].map(v=>Math.round(v*1000)/1000);
const dir=mkdtempSync(join(tmpdir(),'pee210-'));
const sampled=[];
try{
 for(let i=0;i<times.length;i++){
  const path=join(dir,`frame-${i}.png`);
  run('ffmpeg',['-nostdin','-hide_banner','-loglevel','error','-ss',String(times[i]),'-i',mp4Path,
   '-frames:v','1','-vf','scale=320:-2','-y',path]);
  const b=readFileSync(path);
  if(b.length<50)throw Error('phase210_no_frame');
  sampled.push({atSecond:times[i],decodedPngSha256:createHash('sha256').update(b).digest('hex')});
 }
}finally{rmSync(dir,{force:true,recursive:true});}
const output={schema:'pee210.offline-probe.v1',researchOnly:true,receipt,
 videoCodec:video.codec_name,dimensions:{width:video.width,height:video.height},
 sampledFrames:sampled,rawMediaRetainedInOutput:false,decodedFramesRetained:false,
 mediaSourceAuthenticity:'user_upload_bytes_only',
 scienceClaim:'none',humanIndependentGoldLabels:0};
mkdirSync(dirname(outPath),{recursive:true});
writeFileSync(outPath,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({caseId:receipt.caseId,sha256:receipt.observedUploadSha256,
 seconds,hasAudio:receipt.hasAudio,frames:sampled.length,sourceOriginalAuthenticated:false,
 scientificGoldLabels:0,output:outPath},null,2));
