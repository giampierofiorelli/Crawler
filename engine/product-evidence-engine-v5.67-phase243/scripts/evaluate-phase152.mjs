import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {inspectReferenceSurfaceSafety152} from '../dist/src/phase152_product_surface_safety.js';
const hash=x=>createHash('sha256').update(x).digest('hex');
// Short direct quotes transcribed from publicly accessible publisher pages.
// NOT a full article, NOT an independent evaluation or unexposed holdout.
const samples=[
 {id:'p152_techradar_airfryer',category:'air_fryer',source:'TechRadar',url:'https://www.techradar.com/home/air-fryers/cosori-dual-blaze-twinfry-compact-review',text:'The Cosori Dual Blaze Twinfry Compact Air Fryer is nicely designed, with a sleek matte finish and clear controls.'},
 {id:'p152_whathifi_cd',category:'cd_player',source:'What Hi-Fi?',url:'https://www.whathifi.com/hi-fi/cd-players/thought-cd-was-dead-our-audio-experts-pick-out-the-best-cd-players-and-some-of-our-favourite-test-discs-that-you-can-own-for-ever',text:'The Marantz CD6007 may have been succeeded by the recently released CD 70, but there’s still stock available and at a lower price.'},
 {id:'p152_housefresh_air',category:'air_purifier',source:'HouseFresh',url:'https://housefresh.com/philips-3200-review/',text:'The 3200 is a stylish mid-sized device that promises performance on par with the larger, now-discontinued Philips 3000i Series.'},
 {id:'p152_trusted_washer',category:'washing_machine',source:'Trusted Reviews',url:'https://www.trustedreviews.com/reviews/hisense-wf5s1045bw/',text:'the similarly-priced Samsung WW90T684DLH cost just 30p for this cycle.'},
 {id:'p152_notebookcheck_laptop',category:'laptop',source:'Notebookcheck',url:'https://www.notebookcheck.net/More-than-24-hrs-battery-life-for-less-than-1-000-Lenovo-ThinkBook-16-G7-QOY-laptop-review.958162.0.html',text:'Lenovo ThinkBook 16 G7 QOY 21NH0005GE'},
 {id:'p152_rtings_tv',category:'television',source:'RTINGS',url:'https://www.rtings.com/tv/reviews/lg/gallery-2026',text:'The Samsung The Frame Pro 2026 is a much better TV than the LG Gallery 2026.'},
];
const rows=samples.map(x=>{
 const input={document:{text:x.text,sha256:hash(x.text),source:{id:x.id,originalDocumentId:x.id,url:x.url,title:x.source,role:'original_product_test'}}};
 const g=inspectReferenceSurfaceSafety152(input);
 return {id:x.id,category:x.category,publisher:x.source,sourceUrl:x.url,originalExcerpt:x.text,excerptSha256:hash(x.text),
 phase151Anchors:g.baseline151.baseline149.baseline148.anchors.map(a=>a.span.literal),
 scannerCandidates:g.possibleSurfaces.map(s=>({literal:s.span.literal,offset:s.span.start,baselineIndexed:s.recognizedByBaseline})),
 referenceProposals:g.links.map(l=>({mention:l.mention.literal,baseline:l.phase151Decision,newDecision:l.decision})),
 validation:'post_code_source_excerpt_diagnostic_not_independent',
 rankingAuthorized:false,canonicalWriteAuthorized:false};
});
const result={phase:152,origin:'publisher_page_short_excerpts',sourceDocuments:6,annotatedIndependent:0,
 originalFullDocumentsRedistributed:0,precision:null,recall:null,noMeasuredAccuracyClaim:true,
 crossPublisherGeneralizationNotEstablished:true,rows};
writeFileSync('PHASE152-POSTCODE-EDITORIAL-DIAGNOSTIC.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({samples:rows.length,candidates:rows.map(r=>[r.id,r.scannerCandidates.map(c=>c.literal)])},null,2));
