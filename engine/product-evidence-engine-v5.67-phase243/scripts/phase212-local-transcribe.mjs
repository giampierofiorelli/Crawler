#!/usr/bin/env node
/** Phase212 offline ASR bridge: no remote API, no download, no copied transcripts.
 * node scripts/phase212-local-transcribe.mjs --probe
 * node scripts/phase212-local-transcribe.mjs receipt.json media.mp4 /local/model-dir out.json
 * Requires externally provisioned faster-whisper + weights. stdout transcript only
 * within child -> parent pipe; persistent JSON is explicitly textless.
 */
import {existsSync,readFileSync,writeFileSync,statSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {evaluateLocalAsr212} from '../dist/src/phase212_local_asr_evaluation.js';
const err=(name)=>{throw Error('phase212_'+name)};
const args=process.argv.slice(2);
const runner=resolve(import.meta.dirname,'phase212-faster-whisper-local.py');
if(args.length===1&&args[0]==='--probe'){
 const py=spawnSync('python',['-c','import importlib.util,json;print(json.dumps({"numpy":bool(importlib.util.find_spec("numpy")),"faster_whisper":bool(importlib.util.find_spec("faster_whisper"))}))'],{encoding:'utf8',timeout:10000});
 const m=py.status===0?JSON.parse(py.stdout):{numpy:false,faster_whisper:false};
 console.log(JSON.stringify({schema:'pee212.capability.v1',offlineEngine:'faster_whisper_local',
  pythonPackageAvailable:m.faster_whisper,modelWeightsBundled:false,
  inferenceExecuted:false,requiresLocallyProvidedModel:true,noAutomaticDownload:true},null,2));
 process.exit(0);
}
if(args.length!==4)err('usage');
const [receiptPath,mediaPath,modelDir,outPath]=args.map(resolve);
if(new Set([receiptPath,mediaPath,modelDir,outPath]).size!==4)err('paths_not_distinct');
if(!existsSync(modelDir)||!statSync(modelDir).isDirectory()||!existsSync(resolve(modelDir,'model.bin')))err('local_model_required');
const envelope=JSON.parse(readFileSync(receiptPath,'utf8'));
if(envelope.schema!=='pee210.offline-probe.v1'||!envelope.receipt)err('prior');
const receipt=envelope.receipt;
if(!Number.isFinite(receipt.durationSeconds)||receipt.durationSeconds>1200||
 !statSync(mediaPath).isFile()||statSync(mediaPath).size!==receipt.uploadByteLength||
 !/^[0-9a-f]{64}$/.test(receipt.observedUploadSha256))err('media_identity');
const h=createHash('sha256');const {createReadStream}=await import('node:fs');
for await(const data of createReadStream(mediaPath))h.update(data);
if(h.digest('hex')!==receipt.observedUploadSha256)err('source_hash_mismatch');
const run=spawnSync('python',[runner,'--media',mediaPath,'--expected-sha256',receipt.observedUploadSha256,
 '--model-dir',modelDir,'--duration-seconds',String(receipt.durationSeconds),'--strategy','multilingual_windows'],
 {encoding:'utf8',timeout:240000,maxBuffer:5*1024*1024});
if(run.error||run.status!==0)err('offline_asr_unavailable_or_failed:'+String(run.stderr).slice(0,250));
let transient;try{transient=JSON.parse(run.stdout)}catch{err('invalid_engine_output')}
if(transient.uploadSha256!==receipt.observedUploadSha256||transient.durationSeconds!==receipt.durationSeconds)err('receipt_mismatch');
const evaluation=evaluateLocalAsr212(transient);
// Drop text as soon as the bounded analysis has completed; never persist it.
transient=null;
mkdirSync(dirname(outPath),{recursive:true});
writeFileSync(outPath,JSON.stringify(evaluation,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify({output:outPath,segmentCount:evaluation.segmentCount,
 wordCount:evaluation.wordCount,referenceGold:0,transcriptRetained:false},null,2));
