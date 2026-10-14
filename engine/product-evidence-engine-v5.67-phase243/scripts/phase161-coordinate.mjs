#!/usr/bin/env node
/** Offline Phase161 intake: validate worker audit against an untrusted neural report,
 * then pass only source-bound hypotheses to the Phase160 PEE coordinator. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {runReviewBatch160} from '../dist/src/phase160_batch_review_pipeline.js';
const sha=t=>createHash('sha256').update(t).digest('hex');
const args=process.argv.slice(2);
const get=flag=>{const k=args.indexOf(flag);return k<0?null:args[k+1]};
const manifestPath=get('--manifest'), predPath=get('--neural'), auditPath=get('--audit'), outPath=get('--out');
if(!manifestPath||!predPath||!auditPath||!outPath||new Set([manifestPath,predPath,auditPath,outPath]).size!==4){
 console.error('Usage: node scripts/phase161-coordinate.mjs --manifest SOURCE.json --neural RESULT.json --audit WORKER_AUDIT.json --out SUMMARY.json');
 process.exit(2);
}
try{
 const m=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 const n=JSON.parse(fs.readFileSync(predPath,'utf8'));
 const a=JSON.parse(fs.readFileSync(auditPath,'utf8'));
 const docs=m.documents;
 if(m.protocol!=='pee.phase160.batch.v1'||!Array.isArray(docs)||!a||a.protocol!=='pee.phase161.worker.v1'||
    a.datasetId!==m.datasetId||a.totalDocuments!==docs.length||n.model_integration_status!=='local_offline_worker_not_connected_to_PEE'||
    !/^[a-f0-9]{64}$/.test(a.checkpoint_fingerprint)||a.checkpointAuthenticated!==false||a.rankingAuthorized!==false||
    a.scientificEvidenceApproved!==false||a.identityMergeAuthorized!==false||a.modelQualityBenchmark!==false||
    !a.document_sha256||typeof a.document_sha256!=='object'||!a.failures||typeof a.failures!=='object'||!n.cases||typeof n.cases!=='object')
    throw Error('phase161_invalid_worker_audit');
 const ids=new Set(docs.map(d=>d.id));
 if(ids.size!==docs.length||docs.some(d=>a.document_sha256[d.id]!==sha(d.text)||d.sha256!==sha(d.text))||
    Object.keys(a.document_sha256).length!==ids.size||a.processed!==Object.keys(n.cases).length||
    Object.keys(n.cases).some(k=>!ids.has(k)||n.cases[k].source_sha256!==sha(docs.find(d=>d.id===k).text))||
    Object.keys(a.failures).some(k=>!ids.has(k)||Object.hasOwn(n.cases,k))||
    a.processed+Object.keys(a.failures).length!==ids.size)
    throw Error('phase161_neural_audit_source_disagreement');
 const result=runReviewBatch160(m,n,a);
 const summary={phase:161,protocol:'pee.phase161.coordination.v1',datasetId:m.datasetId,
   checkpointFingerprint:a.checkpoint_fingerprint,checkpointAuthenticated:false,
   inferredCount:a.freshInferCalls,cacheHits:a.cacheHits,workerFailures:a.failures,
   ...result, safety:{...result.safety,modelQualityBenchmark:false,canonicalWriteAuthorized:false,rankingAuthorized:false}};
 if(fs.existsSync(outPath))throw Error('phase161_output_already_exists');
 fs.writeFileSync(outPath,JSON.stringify(summary,null,2)+'\n',{flag:'wx',mode:0o600});
 console.log(JSON.stringify({documents:summary.docCount,neural:result.cases.filter(c=>c.neuralProcessed).length,
  nativeOnly:result.cases.filter(c=>!c.neuralProcessed).length,quarantined:result.cases.filter(c=>c.result==='quarantined').length,
  workerFailures:Object.keys(a.failures).length}));
}catch(e){console.error(e instanceof Error?e.message:String(e));process.exitCode=2;}
