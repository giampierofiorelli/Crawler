import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeVideoDiscovery205,normalizeTranscriptTrack205,inspectTranscriptAspects205,
 type TranscriptTrack205,type AspectAnnotation205,type DiscoveryInput205} from '../src/phase205_video_provider_normalization.js';
import {type VideoEvidenceBatchIn203,type VideoSearchPlan203} from '../src/phase203_video_evidence_search.js';
const v='aB1cD2eF3_4', ch='UC'+'X'.repeat(22),url=`https://www.youtube.com/watch?v=${v}`;
const plan:VideoSearchPlan203={schema:'203.1',researchPlanHash:'phase182abc',tasks:[{
 jobId:'job1',exactVariantId:'machine_one',criterionId:'taste',query:'espresso test',language:'it',
 regionHint:'IT',method:'youtube_metadata_only',sourcePriority:'open_specialist_exploration',
 requiresExactVariantReview:true,authority:'research_only'}],useExistingPhase182Jobs:true,
 newCrawlerCreated:false,creatorOAuthRequired:false,automaticDownloadsEnabled:false,
 rankingAuthorized:false};
const jsHit=(patch:Record<string,unknown>={})=>({videoUrl:url,title:'One machine tested',
 channelId:ch,publishedAt:'2026-10-12T12:00:00Z',selectedLanguageHint:'it',...patch});
const discovery=(patch:Record<string,unknown>={}):DiscoveryInput205=>({plan,jobId:'job1',
 provider:'youtubejs_parsed_snapshot',providerVersion:'youtubei.js_18.1.0',
 parsedHits:[jsHit()],...patch} as DiscoveryInput205);
const official=()=>({kind:'youtube#searchListResponse',items:[{kind:'youtube#searchResult',
 id:{kind:'youtube#video',videoId:v},snippet:{channelId:ch,title:'One machine tested',
 publishedAt:'2026-10-12T12:00:00Z'}}]});
const track=(patch:Partial<TranscriptTrack205>={}):TranscriptTrack205=>({
 provider:'youtubejs_transcript_segment',providerVersion:'youtubei.js_18.1.0',videoUrl:url,
 status:'available',accessReviewId:'access_review',selectedTrackLanguage:'it',
 spokenLanguageReviewed:null,captionKind:'unknown',youtubeJsSegments:[{start_ms:'123456',
 end_ms:'126400',text:'An Italian espresso taste preference'}],...patch});
const batch=(patch:Partial<Omit<VideoEvidenceBatchIn203,'observations'>>={}):Omit<VideoEvidenceBatchIn203,'observations'>=>({
 videoUrl:url,sourceId:'video_one',channelId:ch,exactVariantId:'machine_one',categoryId:'coffee_machines',
 language:'it',uploadDate:'2026-10-12',access:'rights_cleared_transcript',rightsReviewId:'access_review',
 providerId:'youtubejs',providerVersion:'youtubei.js_18.1.0',variantMatchedByReviewId:null,expertiseReviewId:null,
 sponsorship:'unknown',existingEventGroups:[],...patch});
const annotation=(patch:Partial<AspectAnnotation205>={}):AspectAnnotation205=>({
 annotationId:'ann1',segmentIndex:0,criterionId:'cup_taste',disciplineId:'italian_espresso',
 outcomeId:'cup_quality',protocolId:null,kind:'personal_taste',polarity:'negative',
 sourceBasis:'ai_extraction_unverified',reviewerReceiptId:null,reportedEventGroupId:null,
 methodCue:null,...patch});
const inspect=(x:Record<string,unknown>={})=>inspectTranscriptAspects205({track:track(),batch:batch(),
 annotations:[annotation()],...x});

test('unofficial YouTube.js is never relabelled official',()=>{
 const out=normalizeVideoDiscovery205(discovery());
 assert.equal(out.provider,'youtubejs_parsed_snapshot');
 assert.ok(out.hits[0].needsReview.includes('unofficial_parser_source'));
 assert.equal(out.noPlatformRequestsMade,true);assert.equal(out.rankingsChanged,false);
 assert.equal(out.hits[0].originalTestVerified,false);
});
test('official API snapshot retains its own provider, reused from Phase203',()=>{
 const out=normalizeVideoDiscovery205(discovery({provider:'youtube_data_api_official_snapshot',
  parsedHits:undefined,officialSnapshot:official()}));
 assert.equal(out.provider,'youtube_data_api_official_snapshot');
 assert.equal(out.hits[0].videoId,v);assert.equal(out.hits[0].exactVariantReviewed,false);
});
for(const name of ['youtube_data_api_official_snapshot','youtubejs_parsed_snapshot'] as const){
 test(`reject wrong provider input shape: ${name}`,()=>{
  assert.throws(()=>normalizeVideoDiscovery205(discovery({provider:name,
   officialSnapshot:official(),parsedHits:[jsHit()]})),/phase205_provider_shape/);
 });
}
test('existing research job required; no parallel queue',()=>{
 assert.throws(()=>normalizeVideoDiscovery205(discovery({jobId:'new_job'})),/phase205_discovery_scope/);
 assert.equal(normalizeVideoDiscovery205(discovery()).noNewQueue,true);
});
test('YouTube watch, Shorts, short and live aliases deduplicated',()=>{
 const videos=[url,`https://youtu.be/${v}`,`https://www.youtube.com/shorts/${v}`,
  `https://m.youtube.com/live/${v}`];
 const out=normalizeVideoDiscovery205(discovery({parsedHits:videos.map(u=>jsHit({videoUrl:u}))}));
 assert.equal(out.hits.length,1);assert.equal(out.hits[0].url,url);
 assert.ok(out.hits[0].needsReview.includes('duplicate_upload_reference'));
});
test('conflicting channel metadata does not silently settle creator identity',()=>{
 const out=normalizeVideoDiscovery205(discovery({parsedHits:[jsHit(),jsHit({channelId:'UC'+'Q'.repeat(22)})]}));
 assert.equal(out.hits[0].channelId,null);
 assert.ok(out.hits[0].needsReview.includes('metadata_conflict'));
});
test('unknown channel retained as exploration lead',()=>{
 const out=normalizeVideoDiscovery205(discovery({parsedHits:[jsHit({channelId:null,publishedAt:null})]}));
 assert.ok(out.hits[0].needsReview.includes('channel_identity_missing'));
 assert.ok(out.hits[0].needsReview.includes('publication_date_missing'));
});
for(const bad of [`https://youtube.com.evil.test/watch?v=${v}`,
 `https://www.youtube.com/watch?v=${v}&v=${v}`,`http://www.youtube.com/watch?v=${v}`]){
 test('reject forged video URL '+bad.slice(0,25),()=>{
  assert.throws(()=>normalizeVideoDiscovery205(discovery({parsedHits:[jsHit({videoUrl:bad})]})),/phase203_/);
 });
}
for(const patch of [{channelId:'@influencer'},{publishedAt:'today'},
 {selectedLanguageHint:'Italian'},{title:'<script>alert(1)</script>\n'}]){
 test('reject untrusted source fields '+Object.keys(patch),()=>{
  assert.throws(()=>normalizeVideoDiscovery205(discovery({parsedHits:[jsHit(patch)]})),/phase205_parsed_hit/);
 });
}
test('no popularity fields or author validation included',()=>{
 const out=normalizeVideoDiscovery205(discovery());
 assert.equal(JSON.stringify(out).includes('subscriberCount'),false);
 assert.equal(out.hits[0].creatorExpertiseVerified,false);
});
test('YouTube.js milliseconds become deterministic second bounds',()=>{
 const r=normalizeTranscriptTrack205(track());
 assert.equal(r.firstSecond,123);assert.equal(r.lastSecond,127);
 assert.equal(r.segmentCount,1);assert.equal(r.captionKind,'unknown');
});
test('transcript-api seconds lead to same canonical timestamp as YouTube.js',()=>{
 const t=track({provider:'youtube_transcript_api_snippet',providerVersion:'1.2.4',
  youtubeJsSegments:undefined,captionKind:'asr',transcriptApiSegments:[{
   start:123.456,duration:2.944,text:'An Italian espresso taste preference'}]});
 const r=normalizeTranscriptTrack205(t);
 assert.equal(r.firstSecond,123);assert.equal(r.lastSecond,127);
 assert.ok(r.missingChecks.includes('automatic_caption_accuracy_unverified'));
 const outcome=inspectTranscriptAspects205({track:t,batch:batch({providerId:'youtube_transcript_api',providerVersion:'1.2.4'}),annotations:[annotation()]});
 assert.equal(outcome.aspects[0].timeSecond,123);
});
test('caption overlaps permitted, regression for transcript-api source',()=>{
 const t=track({provider:'youtube_transcript_api_snippet',youtubeJsSegments:undefined,
  transcriptApiSegments:[{start:1.1,duration:2,text:'One interpretation'},
   {start:2.2,duration:2,text:'Overlapping second caption'}]});
 assert.equal(normalizeTranscriptTrack205(t).segmentCount,2);
});
test('translated track does not infer original spoken language',()=>{
 const r=normalizeTranscriptTrack205(track({selectedTrackLanguage:'en',captionKind:'translated'}));
 assert.equal(r.spokenLanguageReviewed,null);
 assert.ok(r.missingChecks.includes('translation_fidelity_unverified'));
 assert.ok(r.missingChecks.includes('original_spoken_language_unverified'));
});
test('manual vs ASR is an annotation, not a new experiment',()=>{
 const human=normalizeTranscriptTrack205(track({captionKind:'human'}));
 const asr=normalizeTranscriptTrack205(track({captionKind:'asr'}));
 assert.equal(human.videoId,asr.videoId);assert.equal(human.newIndependentTestsAdmitted,false);
 assert.equal(asr.newIndependentTestsAdmitted,false);
});
for(const status of ['unavailable','blocked','no_transcript','not_permitted','needs_review'] as const){
 test(`missing ${status} is explicit non-evidence`,()=>{
  const r=normalizeTranscriptTrack205(track({status,youtubeJsSegments:[],accessReviewId:null}));
  assert.equal(r.status,status);assert.equal(r.segmentCount,0);
  assert.ok(r.missingChecks.includes(`source_${status}`));
 });
}
test('content must not enter an unavailable/blocked track',()=>{
 assert.throws(()=>normalizeTranscriptTrack205(track({status:'blocked'})),/phase205_unavailable_has_content/);
});
test('available transcript needs access review and language',()=>{
 assert.throws(()=>normalizeTranscriptTrack205(track({accessReviewId:null})),/phase205_unreviewed_track/);
 assert.throws(()=>normalizeTranscriptTrack205(track({selectedTrackLanguage:null})),/phase205_unreviewed_track/);
});
test('YouTube.js numeric milliseconds reject scientific notation or NaN',()=>{
 for(const invalid of ['-1','NaN','12.3','1e3','999999999999999']){
  assert.throws(()=>normalizeTranscriptTrack205(track({youtubeJsSegments:[{
   start_ms:invalid,end_ms:'3000',text:'not persisted'}]})),/phase205_(segment|segment_timestamp)/);
 }
});
for(const bad of [{start_ms:'3000',end_ms:'2000',text:'valid'},
 {start_ms:'1',end_ms:'1000',text:''},
 {start_ms:'1',end_ms:'1000',text:'x\u0001y'}]){
 test('invalid segment bounds/text rejected',()=>{
  assert.throws(()=>normalizeTranscriptTrack205(track({youtubeJsSegments:[bad]})),/phase205_segment/);
 });
}
test('out-of-order tracks rejected but overlapping captions permitted',()=>{
 assert.throws(()=>normalizeTranscriptTrack205(track({youtubeJsSegments:[
  {start_ms:'2000',end_ms:'3000',text:'a'},{start_ms:'1000',end_ms:'4000',text:'b'}]})),/phase205_unsorted_segments/);
});
test('timestamp overflow and too-long durations rejected',()=>{
 assert.throws(()=>normalizeTranscriptTrack205(track({youtubeJsSegments:[
  {start_ms:'0',end_ms:'86400001',text:'a'}]})),/phase205_segment/);
 assert.throws(()=>normalizeTranscriptTrack205(track({youtubeJsSegments:[
  {start_ms:'0',end_ms:'600001',text:'a'}]})),/phase205_segment/);
});
test('returned track metadata contains no editorial words',()=>{
 const content='Distinctive unpublished private transcript phrase XYZ';
 const r=normalizeTranscriptTrack205(track({youtubeJsSegments:[{start_ms:'0',end_ms:'2000',text:content}]}));
 assert.equal(JSON.stringify(r).includes(content),false);
 assert.equal(r.captionBodiesStored,false);assert.equal(r.perSegmentTextHashesStored,false);
});
test('aspect pipeline reuses 203 event lineage and never grants original tests',()=>{
 const x=inspect({annotations:[annotation({reportedEventGroupId:'original_exp'})],
  batch:batch({existingEventGroups:['original_exp']})});
 assert.equal(x.research.candidates[0].lineageStatus,'known_event_already_reported');
 assert.equal(x.research.candidates[0].independentTestAdmitted,false);
 assert.equal(x.noAutomaticOriginalityClaim,true);
});
test('personal taste remains a personal experience, even if negative',()=>{
 const x=inspect();
 assert.equal(x.aspects[0].kind,'personal_taste');
 assert.equal(x.aspects[0].polarity,'negative');
 assert.equal(x.research.candidates[0].mode,'specialist_practical_opinion');
 assert.equal(x.research.candidates[0].specialistAuthorityVerified,false);
 assert.equal(x.research.candidates[0].finding,'contradicts');
});
test('daily use opinion remains distinct from instrument reading',()=>{
 const x=inspect({annotations:[annotation({kind:'daily_use',polarity:'positive'}),
  annotation({annotationId:'ann2',kind:'instrument_claim',polarity:'positive'})]});
 assert.equal(x.research.candidates[0].mode,'specialist_practical_opinion');
 assert.equal(x.research.candidates[1].mode,'instrument_reading_claimed');
 assert.ok(x.research.candidates.every(o=>!o.visualProofAuthenticated));
});
test('a claimed demonstration cannot be made visually authenticated by ASR',()=>{
 const x=inspect({annotations:[annotation({kind:'demonstration_claim'})]});
 assert.equal(x.research.candidates[0].mode,'claimed_visible_demonstration');
 assert.equal(x.research.candidates[0].visualProofAuthenticated,false);
});
test('PyABSA-inspired aspect/polarity is not a truth probability or general rating',()=>{
 const x=inspect({annotations:[annotation({kind:'method_explanation',polarity:'mixed'})]});
 assert.equal(x.aspects[0].polarity,'mixed');
 assert.equal(x.research.candidates[0].finding,'inconclusive');
 assert.equal(x.noModelConfidenceAsTruth,true);assert.equal(x.rankingAuthorized,false);
});
test('commercial pitch not interpreted as independent lab result',()=>{
 const x=inspect({annotations:[annotation({kind:'sales_pitch',polarity:'positive',
  methodCue:'commercial_pitch'})]});
 assert.equal(x.research.candidates[0].mode,'commercial_promotion');
 assert.equal(x.methodSummary.aiUnverifiedCues.length,1);
 assert.equal(x.methodSummary.noExperimentsAdmitted,true);
});
test('human-annotated methodology cue follows Phase204 human review lane',()=>{
 const x=inspect({annotations:[annotation({kind:'method_explanation',sourceBasis:'human_annotation',
  reviewerReceiptId:'human_rev',methodCue:'setup_parameters_disclosed'})]});
 assert.equal(x.methodSummary.mode,'methodology_followup');
 assert.equal(x.methodSummary.methodReviewLeads[0],'cue_ann1');
 assert.equal(x.methodSummary.rankingAuthorized,false);
});
test('AI cannot forge reviewer receipt',()=>{
 assert.throws(()=>inspect({annotations:[annotation({reviewerReceiptId:'fake_human'})]}),/phase205_annotation/);
});
test('human requires named receipt but receipt still does not authenticate claim',()=>{
 assert.throws(()=>inspect({annotations:[annotation({sourceBasis:'human_annotation'})]}),/phase205_annotation/);
 const x=inspect({annotations:[annotation({sourceBasis:'human_annotation',reviewerReceiptId:'rev1'})]});
 assert.equal(x.research.candidates[0].findingRequiresHumanVerification,true);
});
test('segment reference must exist and belong to same video',()=>{
 assert.throws(()=>inspect({annotations:[annotation({segmentIndex:4})]}),/phase205_annotation/);
 assert.throws(()=>inspect({batch:batch({videoUrl:`https://youtu.be/Q1234567890`})}),/phase205_aspect_scope/);
});
test('different track selected language cannot be silently used',()=>{
 assert.throws(()=>inspect({batch:batch({language:'en'})}),/phase205_aspect_scope/);
});
test('different source access receipt cannot be silently used',()=>{
 assert.throws(()=>inspect({batch:batch({rightsReviewId:'other_review'})}),/phase205_aspect_scope/);
});
test('unknown exact variant cannot be treated as validated',()=>{
 const x=inspect();assert.equal(x.research.exactVariantReviewRequired,true);
 assert.equal(x.research.rankingAuthorized,false);
});
test('track text does not persist even through 203 and 204 compositions',()=>{
 const secret='Original private subtitle phrase uniquely recognizable';
 const x=inspect({track:track({youtubeJsSegments:[{start_ms:'123456',end_ms:'126400',text:secret}]})});
 assert.equal(JSON.stringify(x).includes(secret),false);
 assert.equal(x.sourceTextRetained,false);
 assert.equal(x.research.transcriptPersisted,false);
 assert.equal(x.research.candidates[0].textHmacSha256,null);
});
test('deterministic output for identical scoped annotations',()=>{
 assert.deepEqual(inspect(),inspect());
});
test('aspects of different criteria remain separate',()=>{
 const x=inspect({annotations:[annotation({criterionId:'cup_taste'}),annotation({
  annotationId:'ann2',criterionId:'cleanability',kind:'daily_use',polarity:'negative'})]});
 assert.deepEqual(x.aspects.map(a=>a.criterionId),['cup_taste','cleanability']);
});
test('no source network, foreign package or model needed',()=>{
 assert.equal(normalizeVideoDiscovery205(discovery()).noPlatformRequestsMade,true);
 assert.equal(inspect().sourceTextRetained,false);
});

test('provider labels cannot be forged across caption libraries',()=>{
 assert.throws(()=>inspect({batch:batch({providerId:'youtube_transcript_api'})}),/phase205_provider_mismatch/);
 assert.throws(()=>inspect({batch:batch({providerVersion:'unrelated_version'})}),/phase205_provider_version_mismatch/);
});
test('provider disclosure is derived from inspected track, not a forged input',()=>{
 const x=inspect({batch:batch({providerId:null,providerVersion:null})});
 assert.equal(x.research.providerDisclosure,'youtubejs:youtubei.js_18.1.0');
});

// These source archives stay in the cumulative distribution as non-executable research inputs.
// Each result can be independently reproduced without installing their dependency stacks.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
for(const [filename,digest] of [
 ['YouTube.js-main.zip','2168a86350961c99be22b7aaa3c023febe76e411156d1661376316b7debd9e36'],
 ['youtube-transcript-api-master.zip','e973d9fb7b9e343ff2a361b73cef8aa9ab734e189d22786b928f8941fb534cf5'],
 ['PyABSA-2 2.zip','a3e13dae478fdb22de373d96e200a04220df80f36bf1792c8d2a69f583a8c0bd']
] as const){
 test('external source code remains recoverable and unchanged: '+filename,()=>{
  const buf=readFileSync(`research/phase205-external-code/${filename}`);
  assert.equal(createHash('sha256').update(buf).digest('hex'),digest);
  const registry=JSON.parse(readFileSync('research/phase205-external-code/SOURCE-RETENTION-REGISTER.json','utf8'));
  const source=registry.repos.find((r:{repository:string})=>r.repository===filename);
  assert.equal(source.sha256,digest);
  assert.equal(source.status,'retained_source_archive_not_installed');
 });
}
