/** Phase 68: entirely constructed inputs. NO live website, licence or product evidence. */
import {planWebEvidenceAcquisition,type WebCandidate,type WebSourcePolicy}
  from '../src/web_evidence_acquisition.js';
const date='2026-10-10T15:00:00Z';
const approved:WebSourcePolicy={sourceId:'lab_fixture',host:'lab.fixture.org',
 basis:'written_permission',rightsDocumentId:'fictional_record_not_real_approval',
 rightsDocumentUrl:'https://lab.fixture.org/fictional-rights',reviewedBy:'fictional_editor',
 reviewedAt:'2026-10-09T10:00:00Z',validUntil:'2027-10-01T00:00:00Z',
 permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation'],
 robots:'allowed',robotsCheckedAt:'2026-10-10T14:00:00Z',websiteTerms:'reviewed_permitted',
 termsCheckedAt:'2026-10-09T14:00:00Z',commercialUseReviewed:true};
const source=(id:string,url:string,originalTestId:string):WebCandidate=>({id,sourceId:'lab_fixture',url,
 exactVariantId:'headphone_variant_2026',originalTestId,lineageAttestationReference:'fictional_editorial_record',
 kind:'original_professional_test',publishedAt:'2026-09-20T12:00:00Z',
 updatedAt:'2026-10-01T12:00:00Z',metadataOrigin:'publisher_feed'});
const planned=planWebEvidenceAcquisition({asOf:date,exactVariantId:'headphone_variant_2026',
 userQuestion:'Will these headphones work well for commuting on a noisy train?',
 maxDaysSinceCheck:7,policies:[approved],existing:[{
 canonicalUrl:'https://lab.fixture.org/test/a',exactVariantId:'headphone_variant_2026',
 originalTestId:'execution_a',lastMetadataCheckedAt:'2026-10-10T10:00:00Z',
 lastPageCheckedAt:'2026-10-09T10:00:00Z',lastObservedUpdatedAt:'2026-10-01T12:00:00Z',
 fingerprintSha256:null,reviewStatus:'approved_for_internal_reuse'}],
 candidates:[source('known_test','https://lab.fixture.org/test/a','execution_a'),
 source('new_test','https://lab.fixture.org/test/b','execution_b'),
 {...source('blocked_source','https://another.fixture.org/test/c','execution_c'),sourceId:'unlicensed_source'}]});
console.log(JSON.stringify({notice:'ALL SOURCES AND POLICIES ARE FICTIONAL SOFTWARE FIXTURES',
 result:planned},null,2));
