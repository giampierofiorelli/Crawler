#!/usr/bin/env node
/** Offline whisper.cpp optional runner. Requires an independently built CLI
 * and a complete GGML multilingual model provided locally. Does not download.
 * Transient waveform/CLI JSON live only in 0700 temp directory and are erased.
 * Output is restricted to textless Phase212 evaluation, never recommendations.
 */
import {existsSync,readFileSync,writeFileSync,statSync,mkdirSync,mkdtempSync,rmSync,realpathSync,createReadStream} from 'node:fs';
import {resolve,dirname,join,basename} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {evaluateLocalAsr212} from '../dist/src/phase212_local_asr_evaluation.js';
import {qualifyLocalWhisperModel214} from '../dist/src/phase214_asr_model_integrity.js';
import {normalizeWhisperCppWindow213} from '../dist/src/phase213_whispercpp_normalization.js';
const fail=(r)=>{throw Error('phase213_'+r)};
const hash=async(file)=>{const h=createHash('sha256');for await(const b of createReadStream(file))h.update(b);return h.digest('hex')};
const args=process.argv.slice(2);
if(args[0]==='--probe'&&args.length===1){
 const p=spawnSync('ffmpeg',['-version'],{encoding:'utf8',timeout:5000});
 console.log(JSON.stringify({schema:'pee213.whispercpp-capability.v1',ffmpegAvailable:p.status===0,
  whisperCppBuiltInRelease:false,completeModelBundled:false,requiresLocalBinaryAndWeights:true,
  noAutomaticDownload:true,actualInferenceExecuted:false},null,2));process.exit(0);
}
if(args.length!==5&&args.length!==6)fail('usage_requires_receipt_media_model_cli_output_and_pin');
let [receiptFile,mediaFile,modelFile,cliFile,outFile]=args.slice(0,5).map(a=>resolve(a));
const manifestFile=args[5]?resolve(args[5]):null;
if(new Set([receiptFile,mediaFile,modelFile,cliFile,outFile]).size!==5)fail('paths');
if(!existsSync(modelFile)||!existsSync(cliFile)||!existsSync(mediaFile))fail('local_model_or_binary_missing');
modelFile=realpathSync(modelFile);cliFile=realpathSync(cliFile);
const size=statSync(modelFile).size;
if(size<25_000_000||size>5_000_000_000||/^for-tests-/i.test(basename(modelFile)))fail('incomplete_or_test_only_model');
if(!statSync(cliFile).isFile())fail('cli_not_file');
const input=JSON.parse(readFileSync(receiptFile,'utf8'));
if(input.schema!=='pee210.offline-probe.v1'||!input.receipt)fail('receipt');
const receipt=input.receipt;
if(!Number.isFinite(receipt.durationSeconds)||receipt.durationSeconds<=0||receipt.durationSeconds>1200||
 !statSync(mediaFile).isFile()||statSync(mediaFile).size!==receipt.uploadByteLength||
 !/^[0-9a-f]{64}$/.test(receipt.observedUploadSha256)||
 await hash(mediaFile)!==receipt.observedUploadSha256)fail('file_mismatch');
const ver=spawnSync(cliFile,['--version'],{encoding:'utf8',timeout:10000,maxBuffer:4096});
if(ver.status!==0||!String(ver.stdout).includes('whisper.cpp version:'))fail('unrecognized_whispercpp_binary');
const version=ver.stdout.match(/whisper\.cpp version:\s*(\d+\.\d+\.\d+(?:[a-z0-9.-]{0,15})?)/)?.[1];
if(!version)fail('cli_version');
// Make no persisted plaintext output or retained media. One invocation per window
// ensures language auto-detection is repeated, not assigned to every word.
const modelHash=await hash(modelFile);
if(!manifestFile)fail('model_pin_required_for_inference');
const pin=JSON.parse(readFileSync(manifestFile,'utf8'));
if(basename(modelFile)!==pin.modelId)fail('model_label_pin_mismatch');
const modelFd=(await import('node:fs')).openSync(modelFile,'r');
const modelHeader=Buffer.alloc(8);
try { if((await import('node:fs')).readSync(modelFd,modelHeader,0,8,0)!==8)fail('short_model_header'); } finally {(await import('node:fs')).closeSync(modelFd);}
qualifyLocalWhisperModel214(pin,{observedSha256:modelHash,byteLength:size,magicHex:modelHeader.subarray(0,4).toString('hex'),vocabSize:modelHeader.readInt32LE(4)});
const temp=mkdtempSync(join(tmpdir(),'pee213-asr-'));
try{
 let segments=[];
 for(let offset=0;offset<receipt.durationSeconds;offset+=15){
  const win=Math.min(15,receipt.durationSeconds-offset);
  const wav=join(temp,'window.wav'),prefix=join(temp,'transient');
  const ff=spawnSync('ffmpeg',['-nostdin','-v','error','-y','-ss',String(offset),'-t',String(win),'-i',mediaFile,
   '-vn','-ac','1','-ar','16000','-c:a','pcm_s16le',wav],{timeout:30000,encoding:'utf8'});
  if(ff.status!==0||!existsSync(wav))fail('ffmpeg_failed');
  const run=spawnSync(cliFile,['-m',modelFile,'-f',wav,'--language','auto','--no-gpu',
   '--output-json','--output-file',prefix,'--no-prints','--threads','3'],
    {timeout:120000,encoding:'utf8',maxBuffer:8000});
  if(run.status!==0||!existsSync(prefix+'.json'))fail('whispercpp_inference_failed');
  const source=JSON.parse(readFileSync(prefix+'.json','utf8'));
  const parsed=normalizeWhisperCppWindow213(source,{uploadSha256:receipt.observedUploadSha256,
   durationSeconds:receipt.durationSeconds,offsetSeconds:offset,windowSeconds:win,
   modelSha256:modelHash,modelLabel:basename(modelFile),engineVersion:version});
  segments.push(...parsed.segments);
  rmSync(wav,{force:true});rmSync(prefix+'.json',{force:true});
 }
 const evaluation=evaluateLocalAsr212({schema:'pee212.local-asr.v1',uploadSha256:receipt.observedUploadSha256,
  durationSeconds:receipt.durationSeconds,runtime:{engine:'whispercpp_local',engineVersion:version,
   modelSha256:modelHash,modelLabel:basename(modelFile),inferenceMode:'local_cpu',
   languageStrategy:'multilingual_windows',noRemoteInference:true,inputShaVerified:true,engineRan:true},segments});
 segments=[];
 mkdirSync(dirname(outFile),{recursive:true});
 writeFileSync(outFile,JSON.stringify(evaluation,null,2)+'\n',{flag:'wx',mode:0o600});
 console.log(JSON.stringify({schema:'pee213.local-result.v1',evaluationPath:outFile,
  segmentCount:evaluation.segmentCount,transcriptRetained:false,independentGold:0}));
}finally{rmSync(temp,{recursive:true,force:true})}
