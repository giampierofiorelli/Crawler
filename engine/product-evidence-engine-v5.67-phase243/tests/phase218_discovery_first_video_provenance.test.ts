import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {planWebEvidenceAcquisition,type WebCandidate,type WebSourcePolicy} from '../src/web_evidence_acquisition.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
import {extractTransientVideoLocations218,captureDiscoveredPageVideos218,
 reconcileDiscoveredVideoOrigins218,type PageVideoCaptureRequest218,
 type PageVideoCapture218} from '../src/phase218_discovery_first_video_provenance.js';
import type {DiscoveryReport205} from '../src/phase205_video_provider_normalization.js';

// Deliberately synthetic, NOT a publisher video review or a rights grant for a live site.
const time='2026-10-13T16:20:00Z';
const page='https://reviews.example.org/phones/long-term-camera-review';
const video='M7lc1UVf-VE'; // real official YouTube API documentation example ID, not asserted PEE review
const candidate:WebCandidate={id:'fixture_video_page',sourceId:'fixture_publisher',url:page,
 exactVariantId:'camera_a',originalTestId:null,lineageAttestationReference:null,
 kind:'original_editorial_assessment',publishedAt:null,updatedAt:null,metadataOrigin:'search_result'};
const policy:WebSourcePolicy={sourceId:candidate.sourceId,host:'reviews.example.org',basis:'verified_open_licence',
 rightsDocumentId:'FIXTURE_ONLY_NOT_REAL_PERMISSION',rightsDocumentUrl:'https://creativecommons.org/licenses/by/4.0/',
 reviewedBy:'synthetic_test',reviewedAt:'2026-10-13T16:00:00Z',validUntil:'2026-11-01T16:00:00Z',
 permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation'],
 robots:'allowed',robotsCheckedAt:'2026-10-13T16:00:00Z',websiteTerms:'reviewed_permitted',
 termsCheckedAt:'2026-10-13T16:00:00Z',commercialUseReviewed:true};
const body=`<html><head><script type="application/ld+json">{"@context":"https://schema.org","@type":"VideoObject","name":"Fixture","embedUrl":"https://www.youtube.com/embed/${video}","contentUrl":"https://media.example.org/video.mp4"}</script></head><body><iframe src="https://www.youtube-nocookie.com/embed/${video}?autoplay=1"></iframe></body></html>`;
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
function request(html=body,custom:Partial<PageVideoCaptureRequest218>={},onVisit?:(url:string)=>void):PageVideoCaptureRequest218{
 const plan=planWebEvidenceAcquisition({exactVariantId:'camera_a',userQuestion:'original reviewed product media',asOf:time,
  maxDaysSinceCheck:7,candidates:[candidate],existing:[],policies:[policy]});
 const transport:SourceTransport={async get(url){onVisit?.(url);
  if(url.endsWith('/robots.txt'))return {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /'};
  return {status:200,finalUrl:url,contentType:'text/html',body:html,rawBytes:Buffer.from(html)};
 }};
 return {plan,queueItem:plan.items[0],candidate,policy,checkedAt:time,
  expectedDocumentSha256:hash(html),fixtureTransport:transport,...custom};
}
const capture=(html=body,custom:Partial<PageVideoCaptureRequest218>={})=>
 captureDiscoveredPageVideos218(request(html,custom));
const provider:DiscoveryReport205={schema:'205.discovery.1',state:'research_only',jobId:'job_1',
 provider:'youtube_data_api_official_snapshot',providerVersion:'v3',hits:[{
 videoId:video,url:`https://www.youtube.com/watch?v=${video}`,title:'Synthetic example',
 channelId:'UC'+'A'.repeat(22),publishedAt:'2025-09-12T12:00:00Z',languageHint:'en',
 needsReview:['exact_variant_unverified'],exactVariantReviewed:false,
 creatorExpertiseVerified:false,originalTestVerified:false}],noNewQueue:true,
 sourceIdentityPreserved:true,independentEventsAdmitted:false,rankingsChanged:false,noPlatformRequestsMade:true};

test('literal iframe and VideoObject reveal existing YouTube ID and a distinct unverified media URL',()=>{
 const hits=extractTransientVideoLocations218(body);
 assert.equal(hits.length,3);
 assert.equal(hits.filter(x=>x.youtubeVideoId===video).length,2);
 assert.equal(hits.find(x=>x.locationType==='declared_content_url')?.url,'https://media.example.org/video.mp4');
 assert.ok(hits.every(x=>x.videoBytesAuthenticated===false&&x.publisherIdentityVerified===false));
});
test('capture uses existing Phase69 reader and full actual fixture byte hash without page body retention',async()=>{
 const r=await capture();assert.equal(r.status,'fixture_only');assert.equal(r.documentSha256,hash(body));
 assert.equal(r.versionStatus,'matches_expected');assert.equal(r.locations.length,3);
 assert.equal(r.webpageBodyRetained,false);assert.equal(r.originalVideoVerified,false);
 assert.equal(JSON.stringify(r).includes('<html>'),false);
});
test('same video discovered from existing YouTube job and a webpage is one candidate with distinct provenance',async()=>{
 const r=await capture();const joined=reconcileDiscoveredVideoOrigins218({discovery:provider,pageCaptures:[r]});
 assert.equal(joined.videos.length,1);
 assert.equal(joined.videos[0].canonicalUrl,`https://www.youtube.com/watch?v=${video}`);
 assert.deepEqual(joined.videos[0].discoveredOnPages,[page]);
 assert.equal(joined.videos[0].sourceKinds.length,3);
 assert.equal(joined.videos[0].channelClaimBasis,'provider_metadata_unreviewed');
 assert.equal(joined.videos[0].originalTestAuthenticated,false);
 assert.equal(joined.unresolvedExternalLocations.length,1);
 assert.equal(joined.mediaDownloaded,false);assert.equal(joined.rankingAuthorized,false);
});
test('no Youtube metadata is required when discovering via page embed',async()=>{
 const res=reconcileDiscoveredVideoOrigins218({discovery:null,pageCaptures:[await capture()]});
 assert.equal(res.videos.length,1);assert.equal(res.videos[0].channelId,null);
 assert.equal(res.videos[0].channelClaimBasis,'unknown');
});
test('a capture without rights/terms remains blocked and does not load publisher HTML',async()=>{
 let pages=0;const denied:WebSourcePolicy={...policy,websiteTerms:'reviewed_prohibited'};
 const p=planWebEvidenceAcquisition({exactVariantId:'camera_a',userQuestion:'original reviewed product media',asOf:time,
  maxDaysSinceCheck:7,candidates:[candidate],existing:[],policies:[denied]});
 const r=await capture(body,{plan:p,queueItem:p.items[0],policy:denied,
  fixtureTransport:{async get(){pages++;throw Error('unexpected network');}}});
 assert.equal(r.status,'blocked');assert.equal(pages,0);assert.equal(r.documentSha256,null);
});
test('robots disallow aborts after first robots call, no article visit',async()=>{
 const urls:string[]=[];const req=request(body,{},u=>urls.push(u));
 req.fixtureTransport={async get(url){urls.push(url);return {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nDisallow: /phones/'};}};
 const r=await captureDiscoveredPageVideos218(req);assert.equal(r.status,'blocked');assert.equal(urls.length,1);
});
test('missing complete original response bytes blocks and never falls back to excerpt text',async()=>{
 const req=request();req.fixtureTransport={async get(url){
  if(url.endsWith('/robots.txt'))return {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /'};
  return {status:200,finalUrl:url,contentType:'text/html',body};
 }};
 const r=await captureDiscoveredPageVideos218(req);assert.equal(r.status,'blocked');
});
test('changed publisher document version is labeled but is not claimed material change',async()=>{
 const r=await capture(body,{expectedDocumentSha256:'a'.repeat(64)});
 assert.equal(r.versionStatus,'changed');assert.equal(r.locations.length,3);
 assert.ok(reconcileDiscoveredVideoOrigins218({discovery:null,pageCaptures:[r]}).videos[0].missingChecks.includes('page_revision_changed'));
});
test('two revisions of same URL cannot be treated as two independent videos',async()=>{
 const a=await capture();const b=await capture(body+'\n',{expectedDocumentSha256:null});
 const res=reconcileDiscoveredVideoOrigins218({discovery:null,pageCaptures:[a,b]});
 assert.equal(res.videos.length,1);
 assert.ok(res.videos[0].missingChecks.includes('page_snapshot_conflict'));
});
test('discovery reconciliation rejects a provider result with inconsistent canonical video ID',()=>{
 const bad={...provider,hits:[{...provider.hits[0],videoId:'9'.repeat(11)}]};
 assert.throws(()=>reconcileDiscoveredVideoOrigins218({discovery:bad,pageCaptures:[]}),/phase218_provider_video_id_mismatch/);
});
test('quoted URLs in scripts, comments and template are not interpreted as iframe embeds',()=>{
 const html=`<!-- <iframe src="https://www.youtube.com/embed/${video}"></iframe> -->
  <script>const fake = '<iframe src="https://www.youtube.com/embed/${video}"></iframe>';</script>
  <template><iframe src="https://www.youtube.com/embed/${video}"></iframe></template>
  <noscript><iframe src="https://www.youtube.com/embed/${video}"></iframe></noscript>`;
 assert.deepEqual(extractTransientVideoLocations218(html),[]);
});
test('JSON-LD @graph, alternate type array and multiple original-video identities stay distinct',()=>{
 const html=`<script type='application/ld+json'>{"@graph":[{"@type":["Thing","VideoObject"],"embedUrl":"https://www.youtube.com/embed/${video}"},{"@type":"VideoObject","embedUrl":"https://www.youtube.com/embed/AAAAAAAAAAA"}]}</script>`;
 const found=extractTransientVideoLocations218(html);assert.deepEqual(found.map(x=>x.youtubeVideoId),['AAAAAAAAAAA',video]);
});
test('reject redirect-like, credentialed, local, insecure and playlist-only video URLs',()=>{
 const values=['http://www.youtube.com/embed/M7lc1UVf-VE','https://user:pass@www.youtube.com/embed/M7lc1UVf-VE',
  'https://www.youtube.com/embed/videoseries?list=PL123','https://localhost/clip.mp4',
  'https://192.168.1.2/movie.mp4','https://www.youtube.com/embed/M7lc1UVf-VE?list=PLxyz',
  'https://www.youtube.com.evil.org/embed/M7lc1UVf-VE'];
 const html=values.map(x=>`<iframe src="${x}"></iframe>`).join('');
 // A public external host with misleading youtube subdomain is an external player, never a YouTube ID.
 const found=extractTransientVideoLocations218(html);
 assert.equal(found.filter(x=>x.youtubeVideoId!==null).length,0);
 assert.ok(found.every(x=>x.locationType==='external_player'));
});
test('a real web page can host a direct movie URL without supplying video identity or byte proof',()=>{
 const hits=extractTransientVideoLocations218('<script type="application/ld+json">{"@type":"VideoObject","contentUrl":"https://cdn.publishersite.org/video/model-test.mp4"}</script>');
 assert.equal(hits.length,1);assert.equal(hits[0].youtubeVideoId,null);
 assert.equal(hits[0].locationType,'declared_content_url');assert.equal(hits[0].videoBytesAuthenticated,false);
});
test('malformed JSON-LD and unsafely long page are rejected or ignored, never parsed as video proof',()=>{
 assert.deepEqual(extractTransientVideoLocations218('<script type="application/ld+json">{broken}</script>'),[]);
 assert.throws(()=>extractTransientVideoLocations218('x'.repeat(1_000_001)),/phase218_html_size/);
});
test('duplicate iframe references do not count as separate video events',()=>{
 const html=`<iframe src="https://www.youtube.com/embed/${video}"></iframe>`.repeat(4);
 assert.equal(extractTransientVideoLocations218(html).length,1);
});
test('conflicting channels for one same YouTube ID are not reconciled by arbitrary order',()=>{
 const r=reconcileDiscoveredVideoOrigins218({discovery:{...provider,hits:[
  provider.hits[0],{...provider.hits[0],channelId:'UC'+'Z'.repeat(22)}]},pageCaptures:[]});
 assert.equal(r.videos.length,1);assert.equal(r.videos[0].channelId,null);
 assert.ok(r.videos[0].missingChecks.includes('channel_metadata_conflict'));
});
test('fixture status cannot be relabeled publisher authenticated through caller fields',async()=>{
 const r=await capture();const altered={...r,originalVideoVerified:true} as unknown as PageVideoCapture218;
 assert.throws(()=>reconcileDiscoveredVideoOrigins218({discovery:null,pageCaptures:[altered]}),/phase218_capture_record/);
});
test('source scope cannot silently switch candidate or policy',async()=>{
 await assert.rejects(capture(body,{candidate:{...candidate,url:'https://another.host.org/foo'}}),/phase218_capture_boundary/);
 await assert.rejects(capture(body,{policy:{...policy,sourceId:'other'}}),/phase218_capture_boundary/);
});

test('HTML comment containing JSON-LD must not create a false discovered video',()=>{
 const html=`<!-- <script type="application/ld+json">{"@type":"VideoObject","embedUrl":"https://www.youtube.com/embed/${video}"}</script> -->`;
 assert.deepEqual(extractTransientVideoLocations218(html),[]);
});
test('legitimate discovery-page query remains attributable without pretending media authorization',async()=>{
 const pageWithQuery=page+'?sort=newest';
 const report=await capture();
 const altered={...report,pageUrl:pageWithQuery} satisfies PageVideoCapture218;
 const joined=reconcileDiscoveredVideoOrigins218({discovery:null,pageCaptures:[altered]});
 assert.deepEqual(joined.videos[0].discoveredOnPages,[pageWithQuery]);
});
