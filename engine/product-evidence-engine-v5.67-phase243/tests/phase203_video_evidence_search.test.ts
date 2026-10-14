import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {canonicalYouTubeVideo203,planVideoSearch203,inspectYouTubeSearchSnapshot203,
 inspectVideoObservations203,type VideoEvidenceBatchIn203,type VideoObservationIn203}
 from '../src/phase203_video_evidence_search.js';
import {type ResearchPlan182} from '../src/phase182_gap_research_orchestrator.js';
import {type SourceMatrix196} from '../src/phase196_source_intelligence.js';
const videoId='aB1cD2eF3_4';const ch='UC'+'A'.repeat(22);
const videoUrl=`https://www.youtube.com/watch?v=${videoId}`;
const observation=(x:Partial<VideoObservationIn203>={}):VideoObservationIn203=>({
 observationId:'obs1',atSecond:123,durationSeconds:15,criterionId:'espresso_quality',
 disciplineId:'italian_espresso',outcomeId:'cup_quality',protocolId:'recipe_v1',
 mode:'spoken_claim',finding:'supports',reportedEventGroupId:null,reviewerReceiptId:null,
 sourceBasis:'ai_extraction_unverified',transientExcerpt:'This coffee is excellent',...x});
const batch=(x:Partial<VideoEvidenceBatchIn203>={}):VideoEvidenceBatchIn203=>({
 videoUrl,sourceId:'video_espresso_1',channelId:ch,exactVariantId:'espresso_one',
 categoryId:'coffee_machines',language:'it',uploadDate:'2026-10-09',
 access:'public_url_ai_provider',rightsReviewId:null,providerId:'gemini',providerVersion:'model_v1',
 variantMatchedByReviewId:null,expertiseReviewId:null,sponsorship:'unknown',
 observations:[observation()],existingEventGroups:[],...x});
const plan=():ResearchPlan182=>({phase:182,schema:'182.1',categoryId:'coffee_machines',
 categoryLabel:'Coffee machines',market:'uk',asOf:'2026-10-13T08:00:00Z',inputFingerprint:'abc',
 knowledgeRevision:null,policyRevision:null,planHash:'abc123',omittedByBudget:0,
 planningOnly:true,rankingAuthorized:false,hardExclusionsAuthorized:false,
 jobs:[{jobId:'research_job1',categoryId:'coffee_machines',kind:'exact_variant_source_research',
 gapKind:'missing_test',reference:'espresso_one:espresso_quality',exactVariantId:'espresso_one',
 criterionId:'espresso_quality',priorityOrder:0,authority:'research_only',status:'queued'}]});
const matrix=()=>({schema:'196.1',state:'research_only',publicRankingAllowed:false} as SourceMatrix196);
const searchArgs=()=>({plan:plan(),matrix:matrix(),scopes:[{jobId:'research_job1',
 exactVariantId:'espresso_one',criterionId:'espresso_quality',productName:'Machine espresso ABC',
 disciplineId:'italian_espresso',outcomeId:'cup_quality',languages:['en','it','ja']}],maxTasks:20});
const entry=(id=videoId)=>({kind:'youtube#searchResult',
 id:{kind:'youtube#video',videoId:id},snippet:{channelId:ch,title:'Machine ABC tested',
 publishedAt:'2026-09-20T12:00:00Z',description:'Sponsored for links'}});
const snapshot=(items:unknown=[entry()])=>({kind:'youtube#searchListResponse',items});

test('canonical watch, short URL, Shorts and live share one identity',()=>{
 for(const u of [videoUrl,`https://youtu.be/${videoId}?t=99`,
  `https://www.youtube.com/shorts/${videoId}`,`https://m.youtube.com/live/${videoId}`]){
  assert.deepEqual(canonicalYouTubeVideo203(u),{videoId,url:videoUrl});
 }
});
for(const bad of ['http://youtube.com/watch?v='+videoId,'https://youtube.com.evil.org/watch?v='+videoId,
 `https://www.youtube.com@evil.test/watch?v=${videoId}`,'https://evil.test/video',
 `https://www.youtube.com/playlist?list=${videoId}`,`https://www.youtube.com/watch?v=x`,
 `https://www.youtube.com/watch?v=${videoId}&v=${videoId}`,
 `https://www.youtube.com/watch?v=${videoId}#t=40`,
 `https://www.youtube.com:444/watch?v=${videoId}`,
 `https://www.youtube.com/redirect?url=https://www.youtube.com/watch?v=${videoId}`]){
 test('reject untrusted or ambiguous video URL: '+bad.slice(0,45),()=>{
  assert.throws(()=>canonicalYouTubeVideo203(bad),/phase203_/);
 });
}
test('existing Phase182 job drives language and specialist discovery, not a new queue',()=>{
 const out=planVideoSearch203(searchArgs());
 assert.equal(out.tasks.length,6);assert.equal(out.newCrawlerCreated,false);
 assert.equal(out.creatorOAuthRequired,false);assert.equal(out.rankingAuthorized,false);
 assert.deepEqual([...new Set(out.tasks.map(x=>x.language))],['en','it','ja']);
 assert.ok(out.tasks.some(x=>x.sourcePriority==='open_specialist_exploration'));
 assert.ok(out.tasks.some(x=>x.regionHint==='JP'));
});
test('deterministic planning and max budget without use of popularity',()=>{
 const args=searchArgs();assert.deepEqual(planVideoSearch203(args),planVideoSearch203(args));
 assert.equal(planVideoSearch203({...args,maxTasks:2}).tasks.length,2);
});
test('no Phase182 research job must never generate new search tasks',()=>{
 assert.throws(()=>planVideoSearch203({...searchArgs(),scopes:[{...searchArgs().scopes[0],jobId:'other_job'}]}),/phase203_search_scope/);
});
test('different variant or criterion must not borrow an existing research job',()=>{
 for(const s of [{exactVariantId:'other_variant'},{criterionId:'other_criterion'}])
  assert.throws(()=>planVideoSearch203({...searchArgs(),scopes:[{...searchArgs().scopes[0],...s}]}));
});
test('invalid language and oversized budget are rejected',()=>{
 assert.throws(()=>planVideoSearch203({...searchArgs(),maxTasks:999}));
 assert.throws(()=>planVideoSearch203({...searchArgs(),scopes:[{...searchArgs().scopes[0],languages:['???']}]}));
});
test('known publisher cannot suppress open-specialist discovery',()=>{
 const out=planVideoSearch203(searchArgs());
 assert.equal(out.tasks.filter(x=>x.sourcePriority==='known_criteria_scoped').length,3);
 assert.equal(out.tasks.filter(x=>x.sourcePriority==='open_specialist_exploration').length,3);
});
test('official search response yields metadata-only, no competence, test or model authentication',()=>{
 const out=inspectYouTubeSearchSnapshot203('research_job1',snapshot());
 assert.equal(out.hits.length,1);assert.equal(out.hits[0].videoId,videoId);
 assert.equal(out.hits[0].creatorCompetenceReviewed,false);
 assert.equal(out.hits[0].exactVariantReviewed,false);
 assert.equal(out.hits[0].testOriginalityVerified,false);
 assert.equal(out.hits[0].paidPromotion,'unknown');
 assert.equal(out.sourceBodiesStored,false);
});
test('duplicate search results for same video are never counted twice',()=>{
 assert.equal(inspectYouTubeSearchSnapshot203('research_job1',snapshot([entry(),entry()])).hits.length,1);
});
test('search metadata does not become proof even when title contains prestige claims',()=>{
 const row=entry();row.snippet.title='Best Italian certified espresso maker!';
 const out=inspectYouTubeSearchSnapshot203('research_job1',snapshot([row]));
 assert.equal(out.hits[0].creatorCompetenceReviewed,false);
 assert.equal(out.hits[0].paidPromotion,'unknown');
});
test('unsupported response type fails closed',()=>{
 assert.throws(()=>inspectYouTubeSearchSnapshot203('research_job1',snapshot().items),/phase203_metadata/);
});
test('nonvideo results fail closed',()=>{
 const row=entry();row.id.kind='youtube#channel';
 assert.throws(()=>inspectYouTubeSearchSnapshot203('research_job1',snapshot([row])),/phase203_item/);
});
test('invalid channel identity, timestamp and ID rejected',()=>{
 for(const overrides of [{channelId:'any'}, {publishedAt:'yesterday'}, {title:''}]){
  const row=entry();Object.assign(row.snippet,overrides);
  assert.throws(()=>inspectYouTubeSearchSnapshot203('research_job1',snapshot([row])),/phase203_item/);
 }
});
test('untrusted caption or AI note does not create proof or badge',()=>{
 const out=inspectVideoObservations203(batch());
 assert.equal(out.candidates.length,1);
 assert.equal(out.candidates[0].independentTestAdmitted,false);
 assert.equal(out.candidates[0].visualProofAuthenticated,false);
 assert.equal(out.consumerBadgeAuthorized,false);
 assert.equal(out.rankingAuthorized,false);
 assert.equal(out.automaticCaptionsFetched,false);
 assert.equal(out.rightsReviewRequired,true);
});
test('transient quote absent from returned object even when field contains sensitive text',()=>{
 const text='Unique potentially sensitive phrase user note';
 const out=inspectVideoObservations203(batch({observations:[observation({transientExcerpt:text})]}));
 assert.equal(JSON.stringify(out).includes(text),false);
 assert.equal(out.candidates[0].textHmacSha256,null);
 assert.equal(out.noUnkeyedTextFingerprints,true);
});
test('optional keyed HMAC does not produce an ordinary SHA-256 excerpt digest',()=>{
 const key=new Uint8Array(32).fill(77);
 const out=inspectVideoObservations203(batch({sessionHmacKey:key}));
 assert.match(out.candidates[0].textHmacSha256!,/^[0-9a-f]{64}$/);
 assert.notEqual(out.candidates[0].textHmacSha256,
  createHash('sha256').update(observation().transientExcerpt).digest('hex'));
 assert.ok(!JSON.stringify(out).includes('77,77'));
});
test('weak HMAC key rejected',()=>{
 assert.throws(()=>inspectVideoObservations203(batch({sessionHmacKey:new Uint8Array(8)})),/phase203_hmac_key/);
});
test('timestamps preserved as deep links, without falsely claiming verification',()=>{
 const out=inspectVideoObservations203(batch());
 assert.equal(out.candidates[0].urlAtTime,`${videoUrl}&t=123s`);
 assert.equal(out.candidates[0].findingRequiresHumanVerification,true);
});
test('AI cannot label its own observation as visually checked',()=>{
 assert.throws(()=>inspectVideoObservations203(batch({observations:[observation({
  mode:'visually_checked_demonstration',reviewerReceiptId:'review1'})]})),/phase203_visual_assertion/);
});
test('human review is still a recorded claim, not authenticated visual proof',()=>{
 const out=inspectVideoObservations203(batch({observations:[observation({
  sourceBasis:'human_annotation',mode:'visually_checked_demonstration',reviewerReceiptId:'review1'})]}));
 assert.equal(out.candidates[0].visualProofAuthenticated,false);
});
test('a claimed demonstration cannot be upgraded to an observed demonstration',()=>{
 const out=inspectVideoObservations203(batch({observations:[observation({mode:'claimed_visible_demonstration'})]}));
 assert.equal(out.candidates[0].mode,'claimed_visible_demonstration');
});
test('a claimed instrument reading is not admitted as an authenticated measurement',()=>{
 const out=inspectVideoObservations203(batch({observations:[observation({mode:'instrument_reading_claimed'})]}));
 assert.equal(out.candidates[0].independentTestAdmitted,false);
});
test('known written test event is recognized as previously reported, not counted anew',()=>{
 const out=inspectVideoObservations203(batch({existingEventGroups:['experiment_one'],
  observations:[observation({reportedEventGroupId:'experiment_one'})]}));
 assert.equal(out.candidates[0].lineageStatus,'known_event_already_reported');
 assert.equal(out.experimentMergeAuthorized,false);
});
test('unknown event association requests review, does not automatically merge',()=>{
 const out=inspectVideoObservations203(batch({observations:[observation({reportedEventGroupId:'different_event'})]}));
 assert.equal(out.candidates[0].lineageStatus,'group_requires_review');
 assert.equal(out.experimentMergeAuthorized,false);
});
test('no reported test event remains unknown',()=>{
 const out=inspectVideoObservations203(batch());
 assert.equal(out.candidates[0].lineageStatus,'unknown_event');
 assert.ok(out.missingChecks.includes('test_event_originality_unresolved'));
});
test('a sponsored segment does not become independent evidence',()=>{
 const out=inspectVideoObservations203(batch({sponsorship:'disclosed',
  observations:[observation({mode:'commercial_promotion'})]}));
 assert.equal(out.candidates[0].independentTestAdmitted,false);
});
test('Italian language does not qualify creator automatically',()=>{
 const out=inspectVideoObservations203(batch({language:'it'}));
 assert.equal(out.expertiseReviewRequired,true);
});
test('a claimed specialist review ID is not silently authenticated',()=>{
 const out=inspectVideoObservations203(batch({expertiseReviewId:'expert_review1'}));
 assert.equal(out.expertiseReviewRequired,false);
 assert.equal(out.candidates[0].specialistAuthorityVerified,false);
});
test('creator permission is not required for public AI URL candidate but provider identity is',()=>{
 assert.throws(()=>inspectVideoObservations203(batch({providerId:null})),/phase203_provider_required/);
 assert.equal(inspectVideoObservations203(batch()).rightsReviewRequired,true);
});
test('provided transcript requires a separate rights review, without creator OAuth universally',()=>{
 assert.throws(()=>inspectVideoObservations203(batch({access:'rights_cleared_transcript',
  providerId:null,providerVersion:null})),/phase203_transcript_rights/);
 const out=inspectVideoObservations203(batch({access:'rights_cleared_transcript',
  providerId:null,providerVersion:null,rightsReviewId:'rights1'}));
 assert.equal(out.rightsReviewRequired,false);
});
test('wrong video domain is rejected before annotating',()=>{
 assert.throws(()=>inspectVideoObservations203(batch({videoUrl:'https://youtu.be.evil.test/'+videoId})),/phase203_/);
});
test('impossible segment bounds and video timecodes rejected',()=>{
 for(const o of [{atSecond:-1},{atSecond:1.3},{durationSeconds:0},{durationSeconds:1000}])
  assert.throws(()=>inspectVideoObservations203(batch({observations:[observation(o)]})),/phase203_observation/);
});
test('reject fake text or extreme excerpts instead of saving full transcript',()=>{
 assert.throws(()=>inspectVideoObservations203(batch({observations:[observation({transientExcerpt:'a'.repeat(1601)})]})));
});
test('duplicate observation IDs cannot inflate source evidence',()=>{
 assert.throws(()=>inspectVideoObservations203(batch({observations:[observation(),observation()]})),/phase203_observation_batch/);
});
test('determinism under observation permutation',()=>{
 const x=observation(),y=observation({observationId:'obs2',atSecond:30});
 const a=inspectVideoObservations203(batch({observations:[x,y]}));
 const b=inspectVideoObservations203(batch({observations:[y,x]}));
 assert.deepEqual(a,b);
});
test('rare product with zero video observations remains present and unpenalized',()=>{
 const out=inspectVideoObservations203(batch({observations:[]}));
 assert.deepEqual(out.candidates,[]);
 assert.equal(out.rankingAuthorized,false);
});
