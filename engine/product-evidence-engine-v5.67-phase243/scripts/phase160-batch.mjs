#!/usr/bin/env node
/* One command replays a rights-scoped batch. No network, DB or scientific writes. */
import fs from 'node:fs';
import {runReviewBatch160} from '../dist/src/phase160_batch_review_pipeline.js';
const flags=process.argv.slice(2);const option=name=>{let n=flags.indexOf(name);return n>=0?flags[n+1]:undefined};
const input=option('--manifest'), output=option('--out'), predictions=option('--neural');
if(!input||!output||input===output){console.error('Usage: node scripts/phase160-batch.mjs --manifest batch.json --out results.json [--neural pred.json]');process.exit(2);}
try{
 const manifest=JSON.parse(fs.readFileSync(input,'utf8'));
 const neural=predictions?JSON.parse(fs.readFileSync(predictions,'utf8')):undefined;
 const result=runReviewBatch160(manifest,neural);
 fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'w'});
 console.log(JSON.stringify({datasetId:result.datasetId,mode:result.mode,documents:result.docCount,
   quarantined:result.cases.filter(c=>c.result==='quarantined').length,neural:result.cases.filter(c=>c.neuralProcessed).length}));
 if(result.cases.some(c=>c.result==='quarantined'))process.exitCode=3;
}catch(e){console.error(e instanceof Error?e.message:String(e));process.exit(2);}
