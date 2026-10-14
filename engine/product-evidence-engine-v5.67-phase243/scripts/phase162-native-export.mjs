#!/usr/bin/env node
/** Private span-level native baseline for EXACT SAME Phase160 manifests as neural worker.
 * No network, no authority, never store full publisher text in release artifacts.
 */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {runReviewBatch160} from '../dist/src/phase160_batch_review_pipeline.js';
import {analyzeEnglishReview156} from '../dist/src/phase156_review_document_engine.js';
const arg=n=>{const i=process.argv.indexOf(n);return i<0?null:process.argv[i+1]};
const inp=arg('--manifest'),out=arg('--out');
if(!inp||!out||inp===out||fs.existsSync(out)){console.error('Usage: --manifest input.json --out new-output.json');process.exit(2)}
try{
 const manifest=JSON.parse(fs.readFileSync(inp,'utf8'));
 // Reuse all established Phase160 rights, length and content hash checks.
 runReviewBatch160(manifest);
 const predictions={};const failures={};
 for(const d of manifest.documents){
  try{
   const source={id:d.id,originalDocumentId:d.id,url:d.sourceUrl,title:d.sourceTitle,role:d.sourceRole};
   const r=analyzeEnglishReview156({document:{text:d.text,sha256:d.sha256,source}});
   predictions[d.id]={sha256:d.sha256,entities:{
    product_model:r.mentions.map(m=>({text:m.surface,start:m.span.start,end:m.span.end,role:m.role})),
    measured_value:r.measurements.map(m=>({text:m.quantity.literal,start:m.quantity.start,end:m.quantity.end,assignment:m.assignment})),
    product_feature:r.measurements.map(m=>({text:m.label.literal,start:m.label.start,end:m.label.end})),
    brand:[]},truncationReasons:r.truncationReasons};
  }catch(e){failures[d.id]=String(e).slice(0,250)}
 }
 const receipt={protocol:'pee.phase162.native_spans.v1',datasetId:manifest.datasetId,
   sourceManifestDigest:createHash('sha256').update(fs.readFileSync(inp)).digest('hex'),
   predictions,failures,modelQualityBenchmark:false,canonicalWriteAuthorized:false,rankingAuthorized:false};
 fs.writeFileSync(out,JSON.stringify(receipt,null,2)+'\n',{flag:'wx',mode:0o600});
 console.log(JSON.stringify({documents:manifest.documents.length,processed:Object.keys(predictions).length,failed:Object.keys(failures).length}));
}catch(e){console.error(e instanceof Error?e.message:String(e));process.exitCode=2}
