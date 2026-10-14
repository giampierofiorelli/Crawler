import {readFileSync,writeFileSync} from 'node:fs';
import {stageEpaRegistry184} from '../dist/src/phase184_real_epa_registry_pilot.js';
import {compareEpaListing185} from '../dist/src/phase185_registry_evidence_review.js';
const csv=readFileSync('evaluation/phase184/source/ENERGY_STAR_Certified_Room_Air_Cleaners_V3.0_20261012.csv');
const ref=JSON.parse(readFileSync('evaluation/phase185/epa_product_listings_operator_transcription.json','utf8'));
const pilot=stageEpaRegistry184({csvBytes:csv,expectedSha256:ref.sourceSnapshotSha256,market:'us',
 obtainedAt:'2026-10-12T20:00:00Z',reviewedAt:'2026-10-12T20:00:00Z',asOf:'2026-10-12T20:00:00Z',
 rightsReviewReference:'epa_public_data_license_review',sourceRevision:'operator_export_2026_10_12'});
const compared=ref.officialListings.map(page=>compareEpaListing185({pilot,originalCsv:csv,page}));
const base={phase:185,sourceSnapshotSha256:pilot.documentSha256,registryRows:pilot.rows,
 stagingCandidates:pilot.candidates.length,heldCandidates:pilot.held.length,checks:compared.map(c=>({
 entryId:c.entryId,brand:c.brand,modelNumber:c.modelNumber,comparedFields:c.reviewedClaims.length,
 missingFromTranscription:c.missingOnOfficialPage,disagreements:c.disagreements,
 samePublisherConsistencyOnly:true,commercialSkuVerified:false,independentComparativeTest:false,
 sourceUrl:c.officialPageUrl,comparisonHash:c.comparisonHash})),
 actualReviewedPublicationSignatures:0,rankingAuthorized:false,productCatalogPromotionAuthorized:false};
writeFileSync('evaluation/phase185/epa_crosscheck_audit.json',JSON.stringify(base,null,2)+'\n');
console.log(JSON.stringify({phase:185,rows:base.registryRows,checked:compared.length,
 matchingFields:compared.reduce((s,c)=>s+c.reviewedClaims.length,0),conflicts:compared.reduce((s,c)=>s+c.disagreements.length,0),rankings:0}));
