import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const run=(bin,args)=>spawnSync(bin,args,{encoding:'utf8',timeout:25000,maxBuffer:2e6});
function setup(){
 const dir=mkdtempSync(join(tmpdir(),'pee211-t-'));
 const mp4=join(dir,'clip.mp4');
 const out=run('ffmpeg',['-nostdin','-v','error','-f','lavfi','-i','color=c=black:s=160x90:r=5:d=2',
  '-f','lavfi','-i','sine=frequency=440:duration=2','-c:v','mpeg4','-c:a','aac','-shortest','-y',mp4]);
 assert.equal(out.status,0,out.stderr);
 const hash=createHash('sha256').update(readFileSync(mp4)).digest('hex');
 const prior={schema:'pee210.user-upload-receipt.v1',caseId:'clip211_cli',receivedFileName:'clip.mp4',
  observedUploadSha256:hash,uploadByteLength:readFileSync(mp4).length,durationSeconds:2,hasAudio:true,
  sourceOriginalAuthenticated:false,independentGoldLabels:0,rankingAuthorized:false,observations:[]};
 const receipt=join(dir,'p210.json');
 writeFileSync(receipt,JSON.stringify({schema:'pee210.offline-probe.v1',receipt:prior}));
 return {dir,mp4,receipt};
}
test('211 actual ffmpeg processing of synthetic audible clip has no fake words',()=>{
 const f=setup();try{
  const output=join(f.dir,'audio.json');const p=run('node',['scripts/phase211-audio-timeline.mjs',f.receipt,f.mp4,output]);
  assert.equal(p.status,0,p.stderr);
  const r=JSON.parse(readFileSync(output,'utf8'));
  assert.equal(r.speechTranscribed,false);assert.equal(r.acoustics.audioContainsSpeech,'unknown');
  assert.equal(r.rankingAuthorized,false);assert.equal(r.captionCueCount,0);assert.equal(r.uploadSha256,createHash('sha256').update(readFileSync(f.mp4)).digest('hex'));
 }finally{rmSync(f.dir,{recursive:true,force:true});}
});
test('211 rejects tampered original media before decoding',()=>{
 const f=setup();try{
  const b=readFileSync(f.mp4);b[b.length-10]^=1;writeFileSync(f.mp4,b);
  const p=run('node',['scripts/phase211-audio-timeline.mjs',f.receipt,f.mp4,join(f.dir,'result.json')]);
  assert.notEqual(p.status,0);assert.match(p.stderr,/phase211_upload_hash_mismatch/);
 }finally{rmSync(f.dir,{recursive:true,force:true});}
});
test('211 optional user-supplied captions remain transient and never certify outcome',()=>{
 const f=setup();try{
  const captions=join(f.dir,'sub.srt'), annotations=join(f.dir,'annotations.json'), output=join(f.dir,'result.json');
  const phrase='A fictional test says the espresso tastes perfect';
  writeFileSync(captions,`1\n00:00:00,300 --> 00:00:01,300\n${phrase}\n`);
  writeFileSync(annotations,JSON.stringify({language:'en',annotations:[{claimId:'c1',cueId:'cue1',criterionId:'taste.espresso',kind:'outcome_judgement'}]}));
  const p=run('node',['scripts/phase211-audio-timeline.mjs',f.receipt,f.mp4,output,
   '--captions',captions,'srt','user_supplied_captions','captions-v1','--annotations',annotations]);
  assert.equal(p.status,0,p.stderr);
  const outputText=readFileSync(output,'utf8');const obj=JSON.parse(outputText);
  assert.equal(obj.captionCueCount,1);assert.equal(obj.annotationCount,1);
  assert.equal(obj.candidates[0].spokenStatementVerified,false);
  assert.equal(obj.trustBadgeAuthorized,false);assert.equal(outputText.includes(phrase),false);
 }finally{rmSync(f.dir,{recursive:true,force:true});}
});
