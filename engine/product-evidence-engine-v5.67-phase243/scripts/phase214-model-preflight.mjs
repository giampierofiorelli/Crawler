#!/usr/bin/env node
/** Inspect local model in streaming mode. No network; no trained weights shipped.
 * This validates a digest chosen by the analyst, not the authority of the pin.
 */
import {readFileSync,openSync,readSync,closeSync,statSync,createReadStream,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname,basename} from 'node:path';
import {qualifyLocalWhisperModel214} from '../dist/src/phase214_asr_model_integrity.js';
const fail=(r)=>{throw Error('phase214_'+r)};
const args=process.argv.slice(2);
if(args.length!==3)fail('usage_manifest_model_result');
const [manifestFile,modelFile,resultFile]=args.map(x=>resolve(x));
if(new Set([manifestFile,modelFile,resultFile]).size!==3)fail('paths');
const manifest=JSON.parse(readFileSync(manifestFile,'utf8'));
if(basename(modelFile)!==manifest.modelId)fail('basename_does_not_match_pin');
const size=statSync(modelFile).size;
if(!statSync(modelFile).isFile())fail('model_not_file');
const fd=openSync(modelFile,'r');const header=Buffer.alloc(8);
try {if(readSync(fd,header,0,8,0)!==8)fail('short_header');} finally {closeSync(fd);}
const h=createHash('sha256');for await(const b of createReadStream(modelFile))h.update(b);
const observation={observedSha256:h.digest('hex'),byteLength:size,magicHex:header.subarray(0,4).toString('hex'),vocabSize:header.readInt32LE(4)};
const qualification=qualifyLocalWhisperModel214(manifest,observation);
mkdirSync(dirname(resultFile),{recursive:true});
writeFileSync(resultFile,JSON.stringify(qualification,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify({qualification:'research_only',modelId:qualification.modelId,sourceAuthenticated:false,asrRan:false}));
