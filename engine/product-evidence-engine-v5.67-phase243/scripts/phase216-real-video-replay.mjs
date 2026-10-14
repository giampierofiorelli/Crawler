// Offline replay. CLI args: full-whisper-json, phase210-receipt-json, phase215-crossdecode-json,
// phase216-spec-facts-json, output-JSON. No audio or transcript is saved to output.
import {readFileSync,writeFileSync} from 'node:fs';
import {triagePrimaryClaims216} from '../dist/src/phase216_primary_claim_triage.js';
import {evaluateLocalAsr212} from '../dist/src/phase212_local_asr_evaluation.js';
const args=process.argv.slice(2);
if(args.length!==5)throw Error('usage: node scripts/phase216-real-video-replay.mjs <ASR> <receipt> <crossdecode> <facts> <output>');
const read=i=>JSON.parse(readFileSync(args[i],'utf8'));
const raw=read(0),receipt=read(1).receipt,crossDecode=read(2),factFile=read(3);
if(raw?.result?.language!=='en'||!Array.isArray(raw.transcription)||factFile.schema!=='pee216.analyst-primary-observations.v1')throw Error('not_expected_case');
const transcript={schema:'pee212.local-asr.v1',uploadSha256:receipt.observedUploadSha256,
 durationSeconds:65.177,runtime:{engine:'whispercpp_local',engineVersion:'1.9.5',modelSha256:crossDecode.modelSha256,
 modelLabel:'ggml-base.bin',inferenceMode:'local_cpu',languageStrategy:'global_language',noRemoteInference:true,inputShaVerified:true,engineRan:true},
 segments:raw.transcription.map((s,i)=>({id:`f${i}`,startSecond:s.offsets.from/1000,endSecond:s.offsets.to/1000,
 text:s.text,language:'en',languageBasis:'global_only',words:[]}))};
evaluateLocalAsr212(transcript,null);
const claims=[
 {claimId:'weight_delta',startSecond:36.08,endSecond:41.92,segmentIds:['f7'],kind:'manufacturer_spec_report',metricId:'mass',conditionId:'nominal',variantId:'iphone18promax',comparisonVariantId:'iphone17promax',market:null,value:16,heardUnit:'grams'},
 {claimId:'brightness',startSecond:47.2,endSecond:51.84,segmentIds:['f9'],kind:'manufacturer_spec_report',metricId:'display_brightness',conditionId:'peak_outdoor',variantId:'iphone18promax',comparisonVariantId:null,market:'uk',value:3000,heardUnit:'bits'},
 {claimId:'refresh',startSecond:47.2,endSecond:51.84,segmentIds:['f9'],kind:'manufacturer_spec_report',metricId:'display_refresh',conditionId:'adaptive_max',variantId:'iphone18promax',comparisonVariantId:null,market:'uk',value:120,heardUnit:'hertz'}
];
const result=triagePrimaryClaims216({transcript,receipt,crossDecode,claims,facts:factFile.facts});
writeFileSync(args[4],JSON.stringify(result,null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({schema:result.schema,cases:result.claims.map(c=>({claimId:c.claimId,state:c.state})),transcriptTextRetained:result.transcriptBodyRetained,rankingAuthorized:result.rankingAuthorized},null,2));
