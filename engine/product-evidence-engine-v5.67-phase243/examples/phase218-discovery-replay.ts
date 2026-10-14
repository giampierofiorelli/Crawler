/** Bounded Phase218 end-to-end SOFTWARE demonstration. Synthetic publisher HTML,
 * synthetic permission registry, no external requests. Never label as real capture. */
import {createHash} from 'node:crypto';
import {planWebEvidenceAcquisition,type WebCandidate,type WebSourcePolicy} from '../src/web_evidence_acquisition.js';
import {captureDiscoveredPageVideos218,reconcileDiscoveredVideoOrigins218} from '../src/phase218_discovery_first_video_provenance.js';
import type {DiscoveryReport205} from '../src/phase205_video_provider_normalization.js';

const now='2026-10-13T16:20:00Z';
const pageUrl='https://reviews.example.org/phones/long-term-camera-review';
const videoId='M7lc1UVf-VE'; // YouTube official embedding documentation sample, not a reviewed product
const html=`<!doctype html><html><head><script type="application/ld+json">
{"@type":"VideoObject","embedUrl":"https://www.youtube.com/embed/${videoId}",
"contentUrl":"https://media.example.org/sample.mp4"}</script></head>
<body><iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1"></iframe></body></html>`;
const candidate:WebCandidate={id:'fixture_video_page',sourceId:'fixture_publisher',url:pageUrl,
 exactVariantId:'camera_a',originalTestId:null,lineageAttestationReference:null,
 kind:'original_editorial_assessment',publishedAt:null,updatedAt:null,metadataOrigin:'search_result'};
const policy:WebSourcePolicy={sourceId:candidate.sourceId,host:'reviews.example.org',
 basis:'verified_open_licence',rightsDocumentId:'SYNTHETIC_ONLY_NOT_A_REAL_LICENCE',
 rightsDocumentUrl:'https://creativecommons.org/licenses/by/4.0/',reviewedBy:'fixture_operator',
 reviewedAt:'2026-10-13T16:00:00Z',validUntil:'2026-10-30T16:00:00Z',
 permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation'],
 robots:'allowed',robotsCheckedAt:'2026-10-13T16:00:00Z',websiteTerms:'reviewed_permitted',
 termsCheckedAt:'2026-10-13T16:00:00Z',commercialUseReviewed:true};
const plan=planWebEvidenceAcquisition({exactVariantId:'camera_a',userQuestion:'original reviewed product media',
 asOf:now,maxDaysSinceCheck:7,candidates:[candidate],existing:[],policies:[policy]});
const receipt=await captureDiscoveredPageVideos218({plan,queueItem:plan.items[0],candidate,policy,
 checkedAt:now,expectedDocumentSha256:createHash('sha256').update(html).digest('hex'),
 fixtureTransport:{async get(url){
  if(url.endsWith('/robots.txt'))return {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /'};
  return {status:200,finalUrl:url,contentType:'text/html',body:html,rawBytes:Buffer.from(html)};
 }}});
const discovery:DiscoveryReport205={schema:'205.discovery.1',state:'research_only',jobId:'fixture_job',
 provider:'youtube_data_api_official_snapshot',providerVersion:'synthetic_snapshot',hits:[{
 videoId,url:`https://www.youtube.com/watch?v=${videoId}`,title:'Synthetic discovery record',
 channelId:null,publishedAt:null,languageHint:null,
 needsReview:['synthetic_metadata','exact_variant_unverified'],exactVariantReviewed:false,
 creatorExpertiseVerified:false,originalTestVerified:false}],
 noNewQueue:true,sourceIdentityPreserved:true,independentEventsAdmitted:false,
 rankingsChanged:false,noPlatformRequestsMade:true};
const result=reconcileDiscoveredVideoOrigins218({discovery,pageCaptures:[receipt]});
process.stdout.write(JSON.stringify({case:'phase218_synthetic_end_to_end_demo',rightsFixtureOnly:true,
 actualPublisherCaptured:false,actualYouTubeDataAPIQueried:false,
 priorVideoScreenRecordingUsed:false,pageCapture:receipt,origins:result},null,2)+'\n');
