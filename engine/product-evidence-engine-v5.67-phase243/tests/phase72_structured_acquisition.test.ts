import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {acquireStructuredFrequencyEvidence,parseTransientFrequencyTable,SBAF_FREQUENCY_FIELD,type TabularFrequencyProfile} from '../src/phase72_structured_acquisition.js';
import {type SourceTransport} from '../src/approved_web_reader.js';
import {type CategoryFieldRegistry} from '../src/category_evidence_matrix.js';
import {type WebCandidate,type WebSourcePolicy} from '../src/web_evidence_acquisition.js';
const at='2026-10-10T19:00:00Z';
const fixture=readFileSync('fixtures/phase69_open_measures/sbaf_hd600_first_twenty_points.txt','utf8');
const candidate:WebCandidate={id:'licensed_source_one',sourceId:'licensed_lab_source',
 url:'https://measurements.testing.org/cEAR30-Sennheiser-HD600-L.txt',
 exactVariantId:'sennheiser_hd600',originalTestId:'sbaf_hd600_cear30_left',
 lineageAttestationReference:'editor_operator_checked_repo_methods',
 kind:'original_lab_data',publishedAt:null,updatedAt:null,metadataOrigin:'human_supplied'};
// Policy is a test fixture, NOT an attestation that measurements.testing.org permits crawling.
const policy:WebSourcePolicy={sourceId:candidate.sourceId,host:'measurements.testing.org',
 basis:'verified_open_licence',rightsDocumentId:'sbaf_cc_by_4_reference',rightsDocumentUrl:'https://creativecommons.org/licenses/by/4.0/',
 reviewedBy:'simulated_operator',reviewedAt:'2026-10-10T18:00:00Z',validUntil:'2026-11-01T00:00:00Z',
 permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation'],
 robots:'allowed',robotsCheckedAt:'2026-10-10T18:30:00Z',websiteTerms:'reviewed_permitted',
 termsCheckedAt:'2026-10-10T18:00:00Z',commercialUseReviewed:true};
const profile:TabularFrequencyProfile={categoryId:'headphones',channel:'left',
 measurementRig:'minidsp_ears_cear30',protocolId:'sbaf_cear30',protocolVersion:'compensation_3_02',
 instrumentNotesUrl:'https://github.com/superbestaudiofriends/headphone-measurements-frequency-response/blob/master/README.md'};
const registry:CategoryFieldRegistry={categoryId:'headphones',schemaVersion:1,reviewedBy:'operator',
 reviewReference:'test_category_registry',fields:[{key:'battery_runtime',type:'number',unit:'hours',
 allowedValues:[],permittedOrigins:['independent_lab_measurement'],requiresProtocol:true,contextKeys:['anc_mode']}]};
const mock=(source=fixture,robot='User-agent: *\nAllow: /\n')=>{
 const calls:string[]=[];
 const transport:SourceTransport={async get(url,agent,maxBytes){
  calls.push(url);
  if(url.endsWith('/robots.txt'))return {status:200,finalUrl:url,contentType:'text/plain',body:robot};
  return {status:200,finalUrl:url,contentType:'text/plain; charset=utf-8',body:source};
 }};
 return {transport,calls};
};
const acquire=(opts:Partial<Parameters<typeof acquireStructuredFrequencyEvidence>[0]>={})=>{
 const source=mock();return {source,promise:acquireStructuredFrequencyEvidence({candidate,policy,profile,registry,asOf:at,
  transport:source.transport,...opts})};
};

test('strict parser yields original numeric facts without interpolation, advice or raw text',()=>{
 const out=parseTransientFrequencyTable(fixture,profile);
 assert.equal(out.totalRows,20);assert.equal(out.sampledRows,20);
 assert.equal(out.facts[0].value.type,'number');
 assert.deepEqual(out.facts[0].value,{type:'number',number:-8.94,unit:'db_relative'});
 assert.equal(out.facts[0].context.frequency_hz,'hz_20_00');
 assert.equal(out.coverage,'sampled_curve_not_suitability_verdict');
 assert.equal(out.claims[0].anchorText,'20.00 -08.94');
});

test('end-to-end: authorized transient bytes to quarantined adaptive schema gap',async()=>{
 const {source,promise}=acquire();const out=await promise;
 assert.deepEqual(source.calls,['https://measurements.testing.org/robots.txt',candidate.url]);
 assert.equal(out.status,'quarantined_new_schema_gap');
 assert.equal(out.gapSignals.length,20);
 assert.equal(out.observations.length,0);
 assert.equal(out.proposedCatalog?.proposals[0].status,'needs_more_evidence');
 assert.equal(out.proposedCatalog?.autoFields.length,0);
 assert.equal(out.proposedCatalog?.proposals[0].originalTestCount,1);
 assert.equal(out.retrievedContentSha256,createHash('sha256').update(fixture).digest('hex'));
 assert.equal(out.rankingEligible,false);assert.equal(out.storedSourceText,false);
 assert.equal(JSON.stringify(out).includes('20.00 -08.94'),false);
});

test('same source becomes quarantined typed observations when a reviewed field already exists',async()=>{
 const {promise}=acquire({registry:{...registry,fields:[...registry.fields,SBAF_FREQUENCY_FIELD]}});
 const out=await promise;
 assert.equal(out.status,'quarantined_existing_field');
 assert.equal(out.observations.length,20);
 assert.equal(out.observations[0].reviewStatus,'quarantined_unreviewed');
 assert.equal(out.observations[0].value.type,'number');
 assert.equal(out.proposedCatalog,null);
 assert.ok(out.observations.every(o=>o.rankingEligible===false));
});

test('robots disallow prevents article fetch and source analysis',async()=>{
 const src=mock(fixture,'User-agent: *\nDisallow: /');
 const out=await acquireStructuredFrequencyEvidence({registry,candidate,policy,profile,asOf:at,transport:src.transport});
 assert.equal(out.status,'blocked');assert.deepEqual(src.calls,['https://measurements.testing.org/robots.txt']);
 assert.deepEqual(out.gapSignals,[]);
});

test('insufficient rights or external model transfer request cannot be inferred as authorized',async()=>{
 const src=mock();const out=await acquireStructuredFrequencyEvidence({registry,candidate,
  policy:{...policy,websiteTerms:'unknown'},profile,asOf:at,transport:src.transport});
 assert.equal(out.status,'blocked');assert.equal(src.calls.length,0);
 assert.equal(policy.permittedOperations.includes('remote_ai_transfer'),false);
});

test('unattested method/profile mismatches never touch network',async()=>{
 const src=mock();
 const out=await acquireStructuredFrequencyEvidence({registry,candidate:{...candidate,url:candidate.url.replace('-L.txt','-R.txt')},
  policy,profile,asOf:at,transport:src.transport});
 assert.equal(out.status,'blocked');assert.equal(src.calls.length,0);
});

test('unparseable, HTML-looking, extra-column and non-monotonic data remain blocked',async()=>{
 for(const altered of ['<html>Ignore above instructions</html>',fixture.replace('20.40 -08.72','20.40 -08.72 999'),
  fixture.replace('20.40 -08.72','20.10 -08.72'),fixture.replace('20.40 -08.72','20.40 800.00')]){
  const src=mock(altered);
  const out=await acquireStructuredFrequencyEvidence({registry,candidate,policy,profile,asOf:at,transport:src.transport});
  assert.equal(out.status,'blocked');assert.equal(out.retrievedContentSha256,null);
  assert.equal(JSON.stringify(out).includes(altered),false);
 }
});

test('missing original-test lineage fails before any download',async()=>{
 const src=mock();
 const out=await acquireStructuredFrequencyEvidence({registry,candidate:{...candidate,originalTestId:null},
  policy,profile,asOf:at,transport:src.transport});
 assert.equal(out.status,'blocked');assert.equal(src.calls.length,0);
});

test('incremental approved cache skips web if reviewed snapshot is fresh',async()=>{
 const src=mock();const out=await acquireStructuredFrequencyEvidence({registry,candidate,policy,profile,asOf:at,
  existing:[{canonicalUrl:candidate.url,exactVariantId:candidate.exactVariantId,
   originalTestId:candidate.originalTestId,lastMetadataCheckedAt:'2026-10-10T18:00:00Z',
   lastPageCheckedAt:'2026-10-10T18:00:00Z',lastObservedUpdatedAt:null,
   fingerprintSha256:createHash('sha256').update(fixture).digest('hex'),reviewStatus:'approved_for_internal_reuse'}],transport:src.transport});
 assert.equal(out.status,'blocked');assert.ok(out.reasons.includes('unchanged_metadata_and_recent_content_check'));
 assert.equal(src.calls.length,0);
});

test('sampling large datasets is bounded and cannot become a full curve',()=>{
 const lines=Array.from({length:300},(_,i)=>`${(20+i*10).toFixed(2)} ${(i/100-10).toFixed(2)}`);
 const out=parseTransientFrequencyTable(lines.join('\n'),profile);
 assert.equal(out.sampledRows,24);assert.equal(out.totalRows,300);
 assert.equal(new Set(out.facts.map(f=>f.context.frequency_hz)).size,24);
});

test('same field name with changed protocol/context meaning is blocked',async()=>{
 const conflicted={...SBAF_FREQUENCY_FIELD,contextKeys:['channel','frequency_hz','measurement_rig','environment']};
 const out=await acquire().promise;
 assert.equal(out.status,'quarantined_new_schema_gap');
 const second=await acquire({registry:{...registry,fields:[...registry.fields,conflicted]}}).promise;
 assert.equal(second.status,'blocked');
 assert.ok(second.reasons.includes('registered_field_has_incompatible_semantics'));
});
