import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const run=(cmd,args,opts={})=>spawnSync(cmd,args,{timeout:30000,encoding:'utf8',...opts});
test('Phase210 real MP4 decoding, receipt has no frames/media/transcript',()=>{
 const dir=mkdtempSync(join(tmpdir(),'pee210-clip-test-'));
 try{
  const media=join(dir,'short.mp4'),manifest=join(dir,'notes.json'),out=join(dir,'result.json');
  const mk=run('ffmpeg',['-nostdin','-v','error','-f','lavfi','-i','color=black:s=320x180:r=10:d=3',
   '-c:v','libx264','-pix_fmt','yuv420p','-y',media]);
  assert.equal(mk.status,0,mk.stderr);
  writeFileSync(manifest,JSON.stringify({caseId:'phase210_mp4_test',notes:[{atSecond:1,
   kind:'visually_demonstrated_action',description:'Synthetic black frame only',method:'frame_inspection',independentlyCorroborated:false}]}));
  const p=run('node',['scripts/phase210-user-clip-probe.mjs',manifest,media,out]);
  assert.equal(p.status,0,p.stderr);
  const result=JSON.parse(readFileSync(out,'utf8'));
  assert.equal(result.receipt.captureKind,'user_supplied_screen_recording');
  assert.equal(result.receipt.hasAudio,false);
  assert.equal(result.sampledFrames.length,4);
  assert.equal(result.receipt.sourceOriginalAuthenticated,false);
  assert.equal(result.humanIndependentGoldLabels,0);
  assert.equal(result.decodedFramesRetained,false);
  assert.equal('rawMedia' in result,false);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('Phase210 refuses shell-like manipulations in user content',()=>{
 const dir=mkdtempSync(join(tmpdir(),'pee210-nasty-'));
 try{
  const data=join(dir,'manifest.json'),video=join(dir,'fake.mp4'),out=join(dir,'out.json');
  writeFileSync(data,JSON.stringify({caseId:'any',notes:[],forcePublisherAuthenticated:true}));
  writeFileSync(video,Buffer.alloc(200));
  const p=run('node',['scripts/phase210-user-clip-probe.mjs',data,video,out]);
  assert.notEqual(p.status,0);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
