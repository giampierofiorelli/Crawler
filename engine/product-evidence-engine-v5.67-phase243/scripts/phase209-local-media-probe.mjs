#!/usr/bin/env node
/** Phase209 CLI. Offline, controlled, ephemeral audiovisual probe; never downloads.
 * node scripts/phase209-local-media-probe.mjs <source-manifest.json> <media.webm> <output.json>
 * The source manifest needs a `source` object of the Phase209 schema.
 * It is a probe for decoding/frame reachability, not a review or ground truth.
 */
import {readFileSync,writeFileSync,statSync,mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {inspectEphemeralLicensedMedia209} from '../dist/src/phase209_licensed_original_media.js';
const args=process.argv.slice(2);
if(args.length!==3){console.error('usage: node scripts/phase209-local-media-probe.mjs <source-json> <local-webm> <output-json>');process.exit(2);}
const [manifestPath,mediaPath,outputPath]=args.map(x=>resolve(x));
const source=JSON.parse(readFileSync(manifestPath,'utf8')).source;
const stat=statSync(mediaPath);
if(!stat.isFile()||stat.size<16||stat.size>120_000_000)throw Error('phase209_media_size_or_kind');
const bytes=readFileSync(mediaPath);
const receipt=inspectEphemeralLicensedMedia209({source,bytes,
 acquisition:process.env.PEE209_OPERATOR_VERIFIED==='1'?'operator_offline':'synthetic_fixture',
 independentOriginalDigest:null});
const run=(bin,params)=>{
 const result=spawnSync(bin,params,{encoding:'utf8',timeout:25000,maxBuffer:1024*1024,env:{...process.env,AV_LOG_FORCE_NOCOLOR:'1'}});
 if(result.error||result.status!==0)throw Error(`phase209_${bin}_failed`);
 return result.stdout;
};
const probe=JSON.parse(run('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type,codec_name',
 '-of','json',mediaPath]));
const duration=Number(probe.format?.duration);
if(!Number.isFinite(duration)||duration<=0||duration>1800||
 !probe.streams?.some(s=>s.codec_type==='video'))throw Error('phase209_unusable_video');
const times=[0,duration/3,duration*2/3]
 .map(x=>Math.round(x*1000)/1000).filter((t,i,a)=>!a.slice(0,i).includes(t));
const scratch=mkdtempSync(join(tmpdir(),'pee209-frames-'));
let frames=[];
try{
 for(let i=0;i<times.length;i++){
  const f=join(scratch,`frame-${i}.png`);
  run('ffmpeg',['-nostdin','-hide_banner','-loglevel','error','-ss',String(times[i]),'-i',mediaPath,
   '-frames:v','1','-vf','scale=320:-2','-y',f]);
  let pixels;try{pixels=readFileSync(f);}catch{throw Error('phase209_requested_frame_unavailable');}
  if(pixels.length<40)throw Error('phase209_frame_empty');
  frames.push({atSecond:times[i],pngSha256:createHash('sha256').update(pixels).digest('hex'),
   samplePixelsRetained:false});
 }
}finally{rmSync(scratch,{recursive:true,force:true});}
const output={schema:'pee209.decode-probe.v1',state:'research_only',receipt,
 decodeMethod:'local_ffprobe_ffmpeg',durationSeconds:duration,
 videoCodecNames:probe.streams.filter(s=>s.codec_type==='video').map(s=>s.codec_name),
 hasAudioTrack:probe.streams.some(s=>s.codec_type==='audio'),frameSamples:frames,
 sampleFramesRetained:false,mediaBytesRetained:false,independentHumanAnnotations:0,
 productTestValidated:false,providerAccuracy:null,publicRankingAuthorized:false};
mkdirSync(dirname(outputPath),{recursive:true});writeFileSync(outputPath,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({caseId:receipt.caseId,durationSeconds:duration,frames:frames.length,
 sourceOriginalAuthenticated:false,humanLabels:0,output:outputPath},null,2));
