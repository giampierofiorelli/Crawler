import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectUserSuppliedVideo210} from '../src/phase210_user_supplied_video.js';
import {alignAudioEvidence211,parseEphemeralCaptions211,type AudioCaseInput211} from '../src/phase211_audio_claim_alignment.js';
const parent=inspectUserSuppliedVideo210({schema:'pee210.upload-input.v1',caseId:'clip211',
 receivedFileName:'clip.mp4',bytes:Uint8Array.from([0,0,0,50,102,116,121,112,...Array(80).fill(1)]),
 durationSeconds:65.2,hasAudio:true,originalPublisherUrl:null,
 notes:[{atSecond:10,kind:'visible_text_claim',description:'Some onscreen technology claim',method:'frame_inspection',independentlyCorroborated:false},
 {atSecond:25,kind:'numeric_overlay',description:'An onscreen temperature measurement',method:'frame_inspection',independentlyCorroborated:false}]});
const fresh=():AudioCaseInput211=>({schema:'pee211.audio-case.v1',prior:parent,
 profile:{schema:'pee211.audio-profile.v1',uploadSha256:parent.observedUploadSha256,durationSeconds:parent.durationSeconds,
 thresholdDb:-20,minimumSilenceSeconds:0.4,silentIntervals:[{startSecond:39.974,endSecond:40.416}],
 detectionMethod:'ffmpeg_silencedetect',audioContainsSpeech:'unknown'},captions:null,annotations:[]});
const captioned=():AudioCaseInput211=>{
 const x=fresh();x.captions={origin:'local_asr',toolVersion:'asr-1',language:'en',cues:[
 {id:'cue1',startSecond:9.1,endSecond:10.9,text:'A made-up spoken claim for the test only'},
 {id:'cue2',startSecond:24,endSecond:25.4,text:'Made-up 40 degree claim in authored fixture'}]};
 x.annotations=[{claimId:'claim1',cueId:'cue1',criterionId:'camera.aperture',kind:'technical_assertion'},
 {claimId:'claim2',cueId:'cue2',criterionId:'thermal.heat',kind:'numeric_measurement_report'}];return x;
};
test('211 real-style audio-only profile has no transcript or gold labels',()=>{
 const x=alignAudioEvidence211(fresh());assert.equal(x.captionCueCount,0);assert.equal(x.speechTranscribed,false);
 assert.equal(x.acoustics.silentIntervals.length,1);assert.equal(x.independentGoldLabels,0);
 assert.equal(x.rankingAuthorized,false);assert.equal(x.trustBadgeAuthorized,false);
 assert.equal(x.originalSourceVerified,false);assert.equal(x.acoustics.audioContainsSpeech,'unknown');
});
test('211 ephemeral caption text not copied to output even at time match',()=>{
 const input=captioned();const text=input.captions!.cues[0].text;
 const out=alignAudioEvidence211(input);
 assert.equal(out.candidates.length,2);assert.deepEqual(out.candidates[0].nearbyVisualNoteSeconds,[10]);
 assert.deepEqual(out.candidates[1].nearbyVisualNoteSeconds,[25]);
 assert.equal(out.candidates[1].claimedMeasurementVerified,false);
 assert.equal(out.candidates[0].spokenStatementVerified,false);
 assert.equal(out.captionOrigin,'local_asr');assert.equal(out.independentGoldLabels,0);
 assert.equal(JSON.stringify(out).includes(text),false);
 assert.equal(JSON.stringify(out).includes('40 degree'),false);
});
test('211 one reviewer source still cannot assert speech accuracy',()=>{
 const i=captioned();i.captions!.origin='single_reviewer_transcription';
 const o=alignAudioEvidence211(i);assert.equal(o.transcriptReviewedIndependently,false);
});
test('211 captions do not imply two independent experiments',()=>{
 const i=captioned();i.annotations.push({claimId:'claim3',cueId:'cue2',criterionId:'thermal.heat',kind:'numeric_measurement_report'});
 const o=alignAudioEvidence211(i);assert.equal(o.candidates.length,3);assert.equal(o.independentGoldLabels,0);
});
test('211 earlier visual note cannot become validation for spoken claim',()=>{
 const i=captioned();i.captions!.cues[0].startSecond=12.01;i.captions!.cues[0].endSecond=12.3;
 const o=alignAudioEvidence211(i);assert.deepEqual(o.candidates[0].nearbyVisualNoteSeconds,[]);
});
test('211 sorts claim candidates deterministically by time',()=>{
 const i=captioned();i.annotations.reverse();assert.equal(alignAudioEvidence211(i).candidates[0].claimId,'claim1');
});
const invalidCases:[string,(i:AudioCaseInput211)=>void][]=[
 ['different media hash',x=>{x.profile.uploadSha256='0'.repeat(64);} ],
 ['duration spoof',x=>{x.profile.durationSeconds=65.1;}],
 ['pretend source authenticated',x=>{(x.prior as unknown as Record<string,unknown>).sourceOriginalAuthenticated=true;}],
 ['pretend gold label',x=>{(x.prior as unknown as Record<string,unknown>).independentGoldLabels=2;}],
 ['wrong speech status',x=>{(x.profile as unknown as Record<string,unknown>).audioContainsSpeech='yes';}],
 ['audio threshold out of bounds',x=>{x.profile.thresholdDb=2;}],
 ['silence negative',x=>{x.profile.silentIntervals[0].startSecond=-1;}],
 ['silence ending before start',x=>{x.profile.silentIntervals[0].endSecond=10;}],
 ['too short silence',x=>{x.profile.silentIntervals[0].endSecond=40.01;}],
 ['overlapping silence',x=>{x.profile.silentIntervals.push({startSecond:40.1,endSecond:41});}],
 ['injected raw text into profile',x=>{(x.profile as unknown as Record<string,unknown>).transcript='inject';}],
 ['claim but no caption',x=>{x.annotations=[{claimId:'x',cueId:'y',criterionId:'z',kind:'unclassified'}];}],
 ['duplicate cue IDs',x=>{x.captions!.cues[1].id='cue1';}],
 ['out of order cues',x=>{x.captions!.cues[1].startSecond=4;}],
 ['cue beyond media',x=>{x.captions!.cues[1].endSecond=100;}],
 ['freeform protocol text',x=>{x.captions!.toolVersion='my stolen transcript is here';}],
 ['injected external confidence',x=>{(x.captions!.cues[0] as unknown as Record<string,unknown>).gold=true;}],
 ['unknown claimed kind',x=>{(x.annotations[0] as unknown as Record<string,unknown>).kind='science_proven';}],
 ['unknown claimed cue',x=>{x.annotations[0].cueId='absent';}],
 ['duplicate claim IDs',x=>{x.annotations[1].claimId='claim1';}],
 ['injected result proof',x=>{(x.annotations[0] as unknown as Record<string,unknown>).rankingAuthorized=true;}],
 ['invalid language',x=>{x.captions!.language='english';}]
];
for(const [label,mutate] of invalidCases){test(`211 rejects ${label}`,()=>{
 const i=captioned();mutate(i);assert.throws(()=>alignAudioEvidence211(i),/phase211_/);
});}
test('211 parses SRT, preserving only transient text',()=>{
 const arr=parseEphemeralCaptions211('1\n00:00:09,100 --> 00:00:10,900\nTest words\n\n2\n00:00:24,000 --> 00:00:25,400\nDifferent words','srt');
 assert.equal(arr.length,2);assert.equal(arr[0].startSecond,9.1);assert.equal(arr[1].text,'Different words');
});
test('211 parses VTT and strips markup',()=>{
 const arr=parseEphemeralCaptions211('WEBVTT\n\n00:09.100 --> 00:10.900\n<b>Example</b> words','vtt');
 assert.deepEqual(arr,[{id:'cue1',startSecond:9.1,endSecond:10.9,text:'Example words'}]);
});
for(const [label,raw,format] of [
 ['bad VTT header','no vtt\n\n00:00.000 --> 00:01.000\nHello','vtt'],
 ['backwards','1\n00:00:05,000 --> 00:00:04,000\nTest','srt'],
 ['hours without proper timing','1\n00:xx:05,000 --> 00:00:06,000\nTest','srt'],
 ['empty captions','', 'srt'],
 ['invalid seconds','1\n00:00:65,000 --> 00:00:66,000\nTest','srt']
] as const){test(`211 rejects malformed subtitles ${label}`,()=>assert.throws(()=>parseEphemeralCaptions211(raw,format),/phase211_/));}
