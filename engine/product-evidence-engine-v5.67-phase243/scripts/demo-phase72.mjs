/** Offline demonstration only: synthetically granted host + authentic CC BY 4.0 fixture. */
import {readFileSync,writeFileSync} from 'node:fs';
import {acquireStructuredFrequencyEvidence} from '../dist/src/phase72_structured_acquisition.js';
const now='2026-10-10T19:00:00Z';
const candidate={id:'example_source',sourceId:'test_lab',url:'https://measurements.testing.org/cEAR30-Sennheiser-HD600-L.txt',
 exactVariantId:'sennheiser_hd600',originalTestId:'sbaf_hd600_left',lineageAttestationReference:'operator_lineage_attestation',
 kind:'original_lab_data',publishedAt:null,updatedAt:null,metadataOrigin:'human_supplied'};
const policy={sourceId:'test_lab',host:'measurements.testing.org',basis:'verified_open_licence',
 rightsDocumentId:'mock_license_assessment',rightsDocumentUrl:'https://creativecommons.org/licenses/by/4.0/',
 reviewedBy:'fixture_reviewer',reviewedAt:'2026-10-10T18:00:00Z',validUntil:'2026-11-01T00:00:00Z',
 permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation'],
 robots:'allowed',robotsCheckedAt:'2026-10-10T18:30:00Z',websiteTerms:'reviewed_permitted',
 termsCheckedAt:'2026-10-10T18:30:00Z',commercialUseReviewed:true};
const profile={categoryId:'headphones',channel:'left',measurementRig:'minidsp_ears_cear30',
 protocolId:'sbaf_cear30',protocolVersion:'compensation_3_02',
 instrumentNotesUrl:'https://github.com/superbestaudiofriends/headphone-measurements-frequency-response/blob/master/README.md'};
const registry={categoryId:'headphones',schemaVersion:1,reviewedBy:'operator',reviewReference:'demo_registry',
 fields:[{key:'battery_runtime',type:'number',unit:'hours',allowedValues:[],permittedOrigins:['independent_lab_measurement'],
 requiresProtocol:true,contextKeys:['anc_mode']}]};
const fixture=readFileSync('fixtures/phase69_open_measures/sbaf_hd600_first_twenty_points.txt','utf8');
const transport={async get(url){return url.endsWith('/robots.txt')?
 {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /'}:
 {status:200,finalUrl:url,contentType:'text/plain',body:fixture};}};
const outcome=await acquireStructuredFrequencyEvidence({candidate,policy,profile,registry,asOf:now,transport});
const report={demo:'offline simulated transport / documented open-license excerpt',
 sourceRepository:'https://github.com/superbestaudiofriends/headphone-measurements-frequency-response',
 realNetworkRequestMade:false,sourceAuthorizationVerifiedLive:false,
 state:outcome.status,sourceSha256:outcome.retrievedContentSha256,measurements:outcome.sampledRows,
 novelDimensions:outcome.proposedCatalog?.proposals.map(x=>({key:x.key,status:x.status,
 originalTestCount:x.originalTestCount,sourceCount:x.sourceCount,variantCount:x.variantCount,blockers:x.blockers}))??[],
 rankingEligible:false,publicationReady:false};
writeFileSync('audit/phase72/offline-demonstration.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
