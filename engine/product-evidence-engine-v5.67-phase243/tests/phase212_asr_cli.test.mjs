import test from 'node:test';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';import {mkdtempSync,writeFileSync,mkdirSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join,resolve} from 'node:path';import {createHash} from 'node:crypto';
const cli=resolve('scripts/phase212-local-transcribe.mjs');
const py=resolve('scripts/phase212-faster-whisper-local.py');
test('probe accurately reports no bundled model and no inference',()=>{
 const p=spawnSync('node',[cli,'--probe'],{encoding:'utf8',timeout:15000});
 assert.equal(p.status,0);const report=JSON.parse(p.stdout);assert.equal(report.modelWeightsBundled,false);
 assert.equal(report.inferenceExecuted,false);assert.equal(report.noAutomaticDownload,true);
});
test('offline runner rejects missing weights instead of fetching anything',()=>{
 const d=mkdtempSync(join(tmpdir(),'pee212-'));
 try{
  const m=join(d,'tiny.mp4');writeFileSync(m,'not a real video');
  const sha=createHash('sha256').update('not a real video').digest('hex');
  const p=spawnSync('python',[py,'--media',m,'--expected-sha256',sha,
   '--model-dir',join(d,'missing-model'),'--duration-seconds','1'],{encoding:'utf8',timeout:15000});
  assert.notEqual(p.status,0);assert.match(p.stderr,/missing_local_model_or_media|No such file/);
  assert.equal(p.stdout,'');
 }finally{rmSync(d,{recursive:true,force:true})}
});
test('source hash prevents an ASR attempt on a replaced video',()=>{
 const d=mkdtempSync(join(tmpdir(),'pee212-'));
 try{
  const m=join(d,'tiny.mp4'),model=join(d,'model');writeFileSync(m,'media');
  mkdirSync(model);writeFileSync(join(model,'model.bin'),'example fake weights');
  const p=spawnSync('python',[py,'--media',m,'--expected-sha256','f'.repeat(64),
   '--model-dir',model,'--duration-seconds','1'],{encoding:'utf8',timeout:15000});
  assert.notEqual(p.status,0);assert.match(p.stderr,/source_hash_mismatch/);
  assert.equal(p.stdout,'');
 }finally{rmSync(d,{recursive:true,force:true})}
});
test('wrapper refuses a fake local model rather than writing output',()=>{
 const d=mkdtempSync(join(tmpdir(),'pee212-'));
 try{
  const m=join(d,'tiny.mp4'),model=join(d,'model'),out=join(d,'result.json'),receipt=join(d,'prior.json');
  writeFileSync(m,'dummy data');mkdirSync(model);writeFileSync(join(model,'model.bin'),'fake');
  writeFileSync(receipt,JSON.stringify({schema:'pee210.offline-probe.v1',receipt:{
    durationSeconds:1,uploadByteLength:10,observedUploadSha256:createHash('sha256').update('dummy data').digest('hex')}}));
  const p=spawnSync('node',[cli,receipt,m,model,out],{encoding:'utf8',timeout:15000});
  assert.notEqual(p.status,0);assert.equal(existsSync(out),false);
 }finally{rmSync(d,{recursive:true,force:true})}
});
