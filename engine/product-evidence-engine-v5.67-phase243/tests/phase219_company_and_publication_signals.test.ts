import test from 'node:test';
import assert from 'node:assert/strict';
import {assessCompanyFeedback219,triagePublications219,planPublicationWatch219,
 type CompanyFeedback219,type PublicationCandidate219} from '../src/phase219_company_and_publication_signals.js';
import type {WatchSource} from '../src/phase82_market_watch.js';
const when='2026-10-13T16:00:00Z';
const press:PublicationCandidate219={
 sourceId:'press',url:'https://maker.org/news/releases/new-model',originalWorkId:'origin_press_1',
 publisherId:'maker',publisherRole:'manufacturer',manufacturerId:'maker',productId:'espresso_x',
 categoryId:'espresso',publishedAt:when,kind:'manufacturer_press_release',
 permission:'reviewed_metadata_only',permissionRecordId:'permission_1',
 publisherIdentityReviewed:true,exactVariantReviewed:true,originalWorkIdentityReviewed:true,
 editorialIndependence:'manufacturer_supplied',methodStatus:'unreviewed'};
const data=(pubs:PublicationCandidate219[])=>triagePublications219({publications:pubs,
 knownProducts:[],knownCategoryIds:['espresso']});
const feedback:CompanyFeedback219={source:'trustpilot',sourceUrl:'https://www.trustpilot.com/review/maker.org',
 reviewId:'r1',manufacturerId:'maker',subjectBusinessId:'maker',
 responsibleParty:'manufacturer',modelId:null,market:'GB',topics:['support','warranty'],
 publishedAt:when,access:'explicit_platform_licence',permissionRecordId:'licensed_1',
 reviewAuthenticity:'unverified'};
const assess=(rows:CompanyFeedback219[])=>assessCompanyFeedback219({manufacturerId:'maker',feedback:rows});
const watch:WatchSource={id:'news',categoryId:'espresso',host:'maker.org',
 channel:'manufacturer_newsroom',mechanism:'rss',tier:'core',rightsClearedForMetadata:true,
 nextCheckAt:'2026-10-12T00:00:00Z',lastCheckAt:null,quietChecks:0,errors:0};
test('maker press announcement suggests official specs rather than product performance',()=>{
 const r=data([press]);assert.equal(r.decisions[0].action,'collect_official_specs');
 assert.equal(r.phase82.candidates[0].action,'collect_official_specs');
 assert.equal(r.phase82.candidates[0].rankingAuthorized,false);
 assert.equal(r.decisions[0].independentTestAdmitted,false);
});
test('press reprint linked to reviewed original does not create another news event',()=>{
 const r=data([press,{...press,sourceId:'wire',url:'https://newspublisher.org/press/story',
  publisherId:'wire',publisherRole:'press_wire',kind:'wire_reprint'}]);
 assert.equal(r.phase82.candidates[0].distinctOriginalWorks,1);
 assert.equal(r.phase82.deduplicatedReprints,1);
 assert.equal(r.decisions[1].action,'discovery_only');
});
test('unverified origin reprint never inherits verified original release identity',()=>{
 const r=data([press,{...press,sourceId:'wire',url:'https://newspublisher.org/press/story',
 publisherId:'wire',publisherRole:'press_wire',kind:'wire_reprint',originalWorkIdentityReviewed:false,
 originalWorkId:null}]);
 assert.equal(r.phase82.candidates[0].distinctOriginalWorks,2);
 assert.equal(r.decisions[1].independentTestAdmitted,false);
});
test('editorial news without product test protocol is discovery only',()=>{
 const r=data([{...press,kind:'original_editorial_article',publisherRole:'media_outlet',publisherId:'media',
  url:'https://news.org/report',editorialIndependence:'reviewed_independent',
  methodStatus:'unreviewed'}]);
 assert.equal(r.decisions[0].action,'inspect_original_editorial_work');
 assert.equal(r.phase82.candidates[0].action,'retain_discovery_stub');
});
test('a professional review with reviewed independence and original identity queues later appraisal',()=>{
 const r=data([{...press,kind:'editorial_product_review',publisherRole:'media_outlet',publisherId:'media',
  url:'https://news.org/review',editorialIndependence:'reviewed_independent',
  methodStatus:'firsthand_claim_unreviewed'}]);
 assert.equal(r.phase82.candidates[0].action,'review_independent_evidence');
 assert.equal(r.decisions[0].action,'inspect_original_editorial_work');
 assert.equal(r.decisions[0].scientificEvidenceAdmitted,false);
});
test('media claims about a reviewed method trigger investigation but no lab proof',()=>{
 const r=data([{...press,kind:'editorial_product_review',publisherRole:'media_outlet',publisherId:'media',
 url:'https://news.org/review',editorialIndependence:'reviewed_independent',
 methodStatus:'original_method_reviewed'}]);
 assert.equal(r.decisions[0].action,'investigate_original_test');
 assert.equal(r.decisions[0].independentTestAdmitted,false);
 assert.equal(r.phase82.candidates[0].rankingAuthorized,false);
});
test('paid editorials do not become professional independent reviews',()=>{
 const r=data([{...press,kind:'sponsored_article',publisherRole:'media_outlet',
 publisherId:'media',url:'https://news.org/sponsored',editorialIndependence:'sponsored'}]);
 assert.equal(r.decisions[0].sourceCategory,'sponsored');
 assert.equal(r.phase82.candidates[0].action,'retain_discovery_stub');
});
test('media repetition of PR is not considered independent when not reviewed',()=>{
 const r=data([{...press,kind:'editorial_product_review',publisherRole:'media_outlet',
 publisherId:'media',url:'https://news.org/brief',editorialIndependence:'manufacturer_supplied',
 methodStatus:'firsthand_claim_unreviewed'}]);
 assert.equal(r.phase82.candidates[0].action,'retain_discovery_stub');
 assert.ok(r.decisions[0].reasonCodes.includes('editorial_independence_unverified'));
});
test('safety alert is escalated for primary notice verification, not a recall verdict',()=>{
 const r=data([{...press,kind:'news_safety_alert',publisherRole:'media_outlet',
 publisherId:'media',url:'https://news.org/alert'}]);
 assert.deepEqual(r.safetyNoticesToVerify,['https://news.org/alert']);
 assert.equal(r.decisions[0].action,'verify_primary_safety_notice');
 assert.equal(r.decisions[0].rankingAuthorized,false);
});
test('news of discontinuation requires primary manufacturer verification',()=>{
 const r=data([{...press,kind:'news_discontinuation',publisherRole:'media_outlet',
 publisherId:'media',url:'https://news.org/end'}]);
 assert.equal(r.decisions[0].action,'verify_discontinuation');
 assert.equal(r.phase82.candidates[0].manufacturingRetirementAuthorized,false);
});
test('manufacturer-supplied release reprinted by a nonmanufacturer requires manufacturer origin check',()=>{
 const r=data([{...press,publisherRole:'press_wire',publisherId:'wire'}]);
 assert.equal(r.decisions[0].action,'discovery_only');
 assert.ok(r.decisions[0].reasonCodes.includes('manufacturer_origin_unverified'));
});
test('uncleared access never enters watch queue or implies content extraction',()=>{
 const a=data([{...press,permission:'not_permitted',permissionRecordId:null},
 {...press,sourceId:'hold',url:'https://maker.org/hold',permission:'unreviewed',permissionRecordId:null}]);
 assert.equal(a.phase82.candidates.length,0);
 assert.deepEqual(a.decisions.map(x=>x.action),['blocked_access','hold_access_review']);
 assert.equal(a.noNetworkRequests,true);assert.equal(a.noFullTextStored,true);
});
test('not exact product variant still requires identity work, no official specs yet',()=>{
 const r=data([{...press,exactVariantReviewed:false}]);
 assert.equal(r.decisions[0].action,'verify_product_identity');
 assert.equal(r.phase82.candidates.length,0);
});
test('not verified publisher never passes phase82 publisher truth gate',()=>{
 const r=data([{...press,publisherIdentityReviewed:false}]);
 assert.equal(r.phase82.candidates.length,0);
});
test('malicious and local source URLs are rejected',()=>{
 for(const bad of ['http://maker.org/','https://127.0.0.1/','https://username:pwd@maker.org/',
 'https://maker.org:8090/','https://maker.org/#fragment','https://localhost/review'])
 assert.throws(()=>data([{...press,url:bad}]),/phase219_publication_input/);
});
test('a claimed permission without a record is rejected',()=>{
 assert.throws(()=>data([{...press,permissionRecordId:null}]),/phase219_publication_input/);
});
test('full editorial bodies and scientific evidence are never returned',()=>{
 const r=data([press]);assert.equal(r.noFullTextStored,true);
 assert.equal(r.decisions.every(x=>!x.scientificEvidenceAdmitted&&!x.canReadFullText),true);
 assert.equal(r.rankingsChanged,false);
});
test('Trustpilot feedback with unreviewed access is held, not scraped or scored',()=>{
 const r=assess([{...feedback,access:'unreviewed',permissionRecordId:null}]);
 assert.equal(r.blockedOrHeld,1);assert.equal(r.acceptedDistinctReports,0);
 assert.equal(r.noPlatformAccessPerformed,true);assert.equal(r.noTrustScoreInference,true);
});
test('Trustpilot feedback with no licence cannot be presumed lawful because public',()=>{
 const r=assess([{...feedback,access:'not_permitted',permissionRecordId:null}]);
 assert.equal(r.blockedOrHeld,1);assert.equal(r.companyExperience.supportOrWarranty,0);
});
test('maker warranty and repairs are company experience and never technical lab evidence',()=>{
 const r=assess([feedback]);assert.equal(r.companyExperience.supportOrWarranty,1);
 assert.equal(r.notProductPerformanceEvidence,true);assert.equal(r.rankingAuthorized,false);
});
test('third-party courier and retailer complaints do not damage manufacturer support counts',()=>{
 const r=assess([{...feedback,reviewId:'r2',responsibleParty:'carrier',subjectBusinessId:'carrier',topics:['third_party_carrier']},
 {...feedback,reviewId:'r3',responsibleParty:'retailer',subjectBusinessId:'seller',topics:['retailer_shipping']}]);
 assert.equal(r.companyExperience.supportOrWarranty,0);assert.equal(r.excludedAsDifferentResponsibleParty,2);
});
test('manufacturer direct-shop delivery is useful commerce experience but not product performance',()=>{
 const r=assess([{...feedback,reviewId:'r4',responsibleParty:'manufacturer_direct_shop',topics:['direct_sale_delivery']}]);
 assert.equal(r.companyExperience.directCommerce,1);assert.equal(r.companyExperience.productProblemLeads,0);
});
test('product failure without known model cannot be attributed to specific product',()=>{
 const r=assess([{...feedback,topics:['product_failure'],modelId:null}]);
 assert.equal(r.companyExperience.productProblemLeads,0);
});
test('specific product failure is only a lead even when model is named',()=>{
 const r=assess([{...feedback,topics:['product_failure'],modelId:'espresso_x'}]);
 assert.equal(r.companyExperience.productProblemLeads,1);
 assert.equal(r.notProductPerformanceEvidence,true);
});
test('reviews with unknown responsibility are not attributed to manufacturer',()=>{
 const r=assess([{...feedback,responsibleParty:'unknown'}]);
 assert.equal(r.unresolvedResponsibility,1);assert.equal(r.companyExperience.supportOrWarranty,0);
});
test('same review id cannot be double counted across reposting',()=>{
 const r=assess([feedback,feedback]);assert.equal(r.acceptedDistinctReports,1);
 assert.equal(r.duplicateObservations,1);assert.equal(r.companyExperience.supportOrWarranty,1);
});
test('conflicting metadata with identical review ID is rejected',()=>{
 assert.throws(()=>assess([feedback,{...feedback,topics:['pricing']}]),/phase219_duplicate_review_metadata_conflict/);
});
test('cross-manufacturer fields are rejected',()=>{
 assert.throws(()=>assess([{...feedback,manufacturerId:'other'}]),/phase219_manufacturer_scope/);
});
test('unreviewed company feedback cannot leak raw text',()=>{
 const r=assess([feedback]);assert.equal(r.noReviewBodiesStored,true);
 assert.equal(JSON.stringify(r).includes('Excellent'),false);
});
test('manufacturer newsroom and editorial RSS reuse the pre-existing Phase82 watch plan',()=>{
 const r=planPublicationWatch219({asOf:when,maxChecks:1,maxChecksPerHost:1,sources:[watch]});
 assert.deepEqual(r.selectedSourceIds,['news']);assert.equal(r.actualNetworkRequests,0);
});
test('blocked RSS source is not scheduled despite being called a press release feed',()=>{
 const r=planPublicationWatch219({asOf:when,maxChecks:1,maxChecksPerHost:1,
 sources:[{...watch,rightsClearedForMetadata:false}]});
 assert.deepEqual(r.blockedSourceIds,['news']);assert.equal(r.actualNetworkRequests,0);
});
test('watch adapter blocks irrelevant source channels rather than creating new monitoring infrastructure',()=>{
 assert.throws(()=>planPublicationWatch219({asOf:when,maxChecks:1,maxChecksPerHost:1,
 sources:[{...watch,channel:'retailer_new_models'}]}),/phase219_watch_channel_scope/);
});
