import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectUserSuppliedVideo210, type UserUploadInput210} from '../src/phase210_user_supplied_video.js';
const bytes=Uint8Array.from([0,0,0,32,102,116,121,112,...Array(50).fill(0)]);
const input=():UserUploadInput210=>({schema:'pee210.upload-input.v1',caseId:'case210',receivedFileName:'screen.mp4',
 bytes:new Uint8Array(bytes),durationSeconds:65.2,hasAudio:true,originalPublisherUrl:null,notes:[
 {atSecond:10,kind:'visible_text_claim',description:'An adjustable aperture is claimed on screen',method:'frame_inspection',independentlyCorroborated:false},
 {atSecond:25,kind:'numeric_overlay',description:'Infrared display with numerical temperatures',method:'frame_inspection',independentlyCorroborated:false}]});
test('Phase210 valid receipt textless and explicitly unverified',()=>{const o=inspectUserSuppliedVideo210(input());
 assert.equal(o.independentGoldLabels,0);assert.equal(o.rankingAuthorized,false);
 assert.equal(o.sourceOriginalAuthenticated,false);assert.equal(o.creatorExpertiseVerified,false);
 assert.equal(o.observations.length,2); assert.match(o.observedUploadSha256,/^[0-9a-f]{64}$/);
 assert.equal(JSON.stringify(o).includes('data:video'),false);
});
test('Phase210 deterministic artifact-bound hash',()=>{const a=inspectUserSuppliedVideo210(input());
 const b=inspectUserSuppliedVideo210(input());assert.deepEqual(a,b);
 const c=input();c.bytes[30]=1;assert.notEqual(inspectUserSuppliedVideo210(c).observedUploadSha256,a.observedUploadSha256);});
for (const [name,change] of [
 ['misleading publisher URL',(a:UserUploadInput210)=>{a.originalPublisherUrl='https://youtube.com/watch?v=fake';}],
 ['false human gold label',(a:UserUploadInput210)=>{(a as unknown as Record<string,unknown>).goldLabels=2;}],
 ['hidden text injection',(a:UserUploadInput210)=>{(a.notes[0] as unknown as Record<string,unknown>).transcript='fake words';}],
 ['claim corroborated without review',(a:UserUploadInput210)=>{(a.notes[0] as unknown as Record<string,unknown>).independentlyCorroborated=true;}],
 ['invalid timestamps',(a:UserUploadInput210)=>{a.notes[1].atSecond=9;}],
 ['frame beyond end',(a:UserUploadInput210)=>{a.notes[1].atSecond=70;}],
 ['invalid video type',(a:UserUploadInput210)=>{a.receivedFileName='screen.webm';}],
 ['bogus MP4',(a:UserUploadInput210)=>{a.bytes[4]=0;}],
 ['duration zero',(a:UserUploadInput210)=>{a.durationSeconds=0;}],
 ['no original body',(a:UserUploadInput210)=>{a.bytes=new Uint8Array(5);}]
] as const){test(`Phase210 rejects ${name}`,()=>{const a=input();change(a);assert.throws(()=>inspectUserSuppliedVideo210(a),/phase210_/);});}
test('Phase210 permits unknown real-world product while showing deficiencies',()=>{
 const a=input();a.notes=[];const o=inspectUserSuppliedVideo210(a);
 assert.equal(o.observations.length,0);assert.ok(o.missingChecks.includes('exact_product_variant_independently_verified'));
});
test('Phase210 forbids arbitrary opinion truth promotions',()=>{
 const a=input();a.notes=[{atSecond:1,kind:'analyst_inference',description:'Possibly a comparative product review',method:'frame_inspection',independentlyCorroborated:false}];
 assert.equal(inspectUserSuppliedVideo210(a).measurementsScientificallyVerified,false);
});
