/** Entirely synthetic metadata. No Trustpilot access, scraping or live publisher fetch. */
import {triagePublications219,assessCompanyFeedback219,planPublicationWatch219,
 type PublicationCandidate219,type CompanyFeedback219} from '../src/phase219_company_and_publication_signals.js';
import type {WatchSource} from '../src/phase82_market_watch.js';
const now='2026-10-13T16:00:00Z';
const press:PublicationCandidate219={sourceId:'maker',url:'https://maker.org/newsroom/2026/new-model',
 originalWorkId:'release_123',publisherId:'maker',publisherRole:'manufacturer',manufacturerId:'maker',
 productId:'coffee_a',categoryId:'coffee_machine',publishedAt:now,kind:'manufacturer_press_release',
 permission:'reviewed_metadata_only',permissionRecordId:'fictional_permission_fixture',
 publisherIdentityReviewed:true,exactVariantReviewed:true,originalWorkIdentityReviewed:true,
 editorialIndependence:'manufacturer_supplied',methodStatus:'unreviewed'};
const publications=[press,{...press,sourceId:'wire',url:'https://presswire.org/releases/new-model',
 publisherId:'wire',publisherRole:'press_wire' as const,kind:'wire_reprint' as const},
 {...press,sourceId:'magazine',url:'https://magazine.org/review/coffee-a',
 publisherId:'magazine',publisherRole:'media_outlet' as const,kind:'editorial_product_review' as const,
 originalWorkId:'editorial_888',editorialIndependence:'reviewed_independent' as const,
 methodStatus:'firsthand_claim_unreviewed' as const}];
const review:CompanyFeedback219={source:'trustpilot',sourceUrl:'https://www.trustpilot.com/review/maker.org',
 reviewId:'fixture_1',manufacturerId:'maker',subjectBusinessId:'maker',responsibleParty:'manufacturer',
 modelId:null,market:'GB',topics:['warranty'],publishedAt:now,access:'unreviewed',
 permissionRecordId:null,reviewAuthenticity:'unverified'};
const watch:WatchSource={id:'newsroom',categoryId:'coffee_machine',host:'maker.org',
 channel:'manufacturer_newsroom',mechanism:'rss',tier:'core',rightsClearedForMetadata:false,
 nextCheckAt:'2026-10-12T00:00:00Z',lastCheckAt:null,quietChecks:0,errors:0};
const output={schema:'pee219.synthetic-replay.v1',fixtureOnly:true,
 publication:triagePublications219({publications,knownProducts:[],knownCategoryIds:['coffee_machine']}),
 company:assessCompanyFeedback219({manufacturerId:'maker',feedback:[review]}),
 watch:planPublicationWatch219({asOf:now,maxChecks:4,maxChecksPerHost:1,sources:[watch]}),
 realSourceFetched:false,trustpilotAccess:false,rankingAuthorized:false};
process.stdout.write(JSON.stringify(output,null,2)+'\n');
