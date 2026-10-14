import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {planWebEvidenceAcquisition,type WebCandidate,type WebSourcePolicy} from '../src/web_evidence_acquisition.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
import {captureScopedPrimaryFacts217,compareScopedFactCaptures217,
 type FactCaptureRequest217,type FactCustodyResult217} from '../src/phase217_primary_fact_custody.js';
import type {Triage216,SpecObservation216} from '../src/phase216_primary_claim_triage.js';

// Phase216 results originate from a real MP4 ASR replay, but these HTML bytes,
// permissions and review IDs are deliberately synthetic. This is NOT an Apple fetch.
const root=new URL('../../docs/phase216/',import.meta.url);
const triage=JSON.parse(readFileSync(new URL('PHASE216-REAL-CLAIM-TRIAGE.json',root),'utf8')) as Triage216;
const facts=(JSON.parse(readFileSync(new URL('primary-source-observations.json',root),'utf8')) as {facts:SpecObservation216[]}).facts;
const target='https://www.apple.com/uk/iphone-18-pro/specs/';
const moment='2026-10-13T15:00:00Z';
const candidate:WebCandidate={id:'synthetic_primary_fixture',sourceId:'apple_fixture',url:target,
 exactVariantId:'iphone18promax',originalTestId:null,lineageAttestationReference:null,
 kind:'manufacturer_technical_document',publishedAt:null,updatedAt:null,metadataOrigin:'human_supplied'};
const policy:WebSourcePolicy={sourceId:candidate.sourceId,host:'www.apple.com',basis:'verified_open_licence',
 rightsDocumentId:'SYNTHETIC_RIGHTS_FIXTURE_NOT_REAL',rightsDocumentUrl:'https://creativecommons.org/licenses/by/4.0/',
 reviewedBy:'synthetic_operator',reviewedAt:'2026-10-13T14:00:00Z',validUntil:'2026-11-01T14:00:00Z',
 permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation'],
 robots:'allowed',robotsCheckedAt:'2026-10-13T14:00:00Z',websiteTerms:'reviewed_permitted',
 termsCheckedAt:'2026-10-13T14:00:00Z',commercialUseReviewed:true};
const phraseBright='iPhone 18 Pro Max outdoor peak brightness 3,000 nits';
const phraseRefresh='iPhone 18 Pro Max adaptive maximum refresh rate 120 hz';
const body=`<html><head><title>Fixture only</title></head><body><p>${phraseBright}</p><p>${phraseRefresh}</p></body></html>`;
const hash=(s:string)=>createHash('sha256').update(Buffer.from(s)).digest('hex');
function makeRequest(overrides:Partial<FactCaptureRequest217>={},html=body):FactCaptureRequest217{
 const plan=planWebEvidenceAcquisition({exactVariantId:candidate.exactVariantId,userQuestion:'document original scoped model facts',
  asOf:moment,maxDaysSinceCheck:7,candidates:[candidate],existing:[],policies:[policy]});
 const transport:SourceTransport={async get(url){
  if(url.endsWith('/robots.txt'))return {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /'};
  return {status:200,finalUrl:url,contentType:'text/html',body:html,rawBytes:Buffer.from(html)};
 }};
 return {triage,facts,plan,queueItem:plan.items[0],candidate,policy,checkedAt:moment,
  anchors:[{factId:'apple18uk_outdoor_brightness',reviewId:'annotated_anchor_check',exactFragment:phraseBright,scopeReviewed:true}],
  expectedDocumentSha256:hash(html),fixtureTransport:transport,...overrides};
}
const run=(overrides:Partial<FactCaptureRequest217>={},html=body)=>captureScopedPrimaryFacts217(makeRequest(overrides,html));

test('actual phase216 real-video result links to synthetic primary-document fixture, never publishes',async()=>{
 const result=await run();assert.equal(result.state,'fixture_only');
 assert.equal(result.revisionState,'expected_version_matches');
 assert.equal(result.capturedSha256,hash(body));
 assert.deepEqual(result.anchors,[{factId:'apple18uk_outdoor_brightness',finding:'exact_fragment_present_once'}]);
 assert.equal(result.publisherIdentityIndependentlyAuthenticated,false);assert.equal(result.independentPerformanceTestAuthenticated,false);
 assert.equal(result.rankingAuthorized,false);assert.equal(result.trustBadgeAuthorized,false);
 const json=JSON.stringify(result);assert.ok(!json.includes(phraseBright)&&!json.includes('<html>'));
});
test('no expected hash is first observation, not verified origin',async()=>{
 const r=await run({expectedDocumentSha256:null});assert.equal(r.revisionState,'first_observation');
 assert.equal(r.state,'fixture_only');assert.equal(r.originalReviewerAuthenticated,false);
});
test('changed complete byte version needs review even if phrase remains unchanged',async()=>{
 const r=await run({expectedDocumentSha256:'a'.repeat(64)});
 assert.equal(r.revisionState,'version_changed');
 assert.equal(compareScopedFactCaptures217(triage,[r]).claims.find(x=>x.claimId==='brightness')?.sourceStatus,'source_revision_requires_review');
});
test('changed content eliminates exact phrase, no silent numerical match',async()=>{
 const r=await run({expectedDocumentSha256:null},body.replace('3,000 nits','3,500 nits'));
 assert.equal(r.anchors[0].finding,'fragment_absent');
 assert.equal(compareScopedFactCaptures217(triage,[r]).claims.find(x=>x.claimId==='brightness')?.sourceStatus,'anchor_recheck_needed');
});
test('repeated exact fragments are ambiguous',async()=>{
 const r=await run({expectedDocumentSha256:null},body+phraseBright);
 assert.equal(r.anchors[0].finding,'fragment_ambiguous');
});
test('review not performed remains explicit and cannot pass anchor gate',async()=>{
 const r=await run({anchors:[{factId:'apple18uk_outdoor_brightness',reviewId:'review_pending',scopeReviewed:false,exactFragment:phraseBright}]});
 assert.equal(r.anchors[0].finding,'anchor_scope_not_reviewed');
});
test('both same-page facts can be collected, preserving one document version',async()=>{
 const r=await run({anchors:[
  {factId:'apple18uk_outdoor_brightness',reviewId:'b_review',scopeReviewed:true,exactFragment:phraseBright},
  {factId:'apple18uk_max_refresh',reviewId:'r_review',scopeReviewed:true,exactFragment:phraseRefresh}]});
 assert.equal(r.anchors.length,2);assert.equal(r.anchors[1].finding,'exact_fragment_present_once');
 assert.equal(compareScopedFactCaptures217(triage,[r]).claims.find(x=>x.claimId==='refresh')?.sourceStatus,'all_linked_facts_captured_in_fixture');
});
test('cross-region page or fact cannot be attached to another variant',async()=>{
 const r=makeRequest({anchors:[{factId:'apple17uk_weight',reviewId:'foo',scopeReviewed:true,exactFragment:'iPhone 17 Pro Max mass 231 g'}]});
 await assert.rejects(captureScopedPrimaryFacts217(r),/phase217_anchor_scope_mismatch/);
});
test('scope different condition cannot be substituted',async()=>{
 const wrong=facts.map(f=>f.factId==='apple18uk_outdoor_brightness'?{...f,conditionId:'normal_indoor'}:f);
 await assert.rejects(run({facts:wrong}),/phase217_anchor_scope_mismatch/);
});
test('fact not present in phase216 compared evidence cannot be smuggled',async()=>{
 const newFact={...facts[0],factId:'new_undocumented_fact',sourceUrl:target,variantId:'iphone18promax'};
 await assert.rejects(run({facts:[...facts,newFact],anchors:[{factId:'new_undocumented_fact',reviewId:'review',exactFragment:phraseBright,scopeReviewed:true}]}),/phase217_anchor_scope_mismatch/);
});
test('anchor must contain exactly annotated numeric value and unit',async()=>{
 for(const exactFragment of ['iPhone 18 Pro Max 3,200 nits','iPhone 18 Pro Max outdoor brightness 3000 bits']){
  await assert.rejects(run({anchors:[{factId:'apple18uk_outdoor_brightness',reviewId:'review',exactFragment,scopeReviewed:true}]}),/phase217_anchor_not_about_quantity/);
 }
});
test('different candidate URL is invalid despite same source hostname',async()=>{
 await assert.rejects(run({candidate:{...candidate,url:'https://www.apple.com/uk/iphone-18-pro/'}}),/phase217_invalid_source_boundary/);
});
test('different product variant cannot borrow matching numerical text',async()=>{
 await assert.rejects(run({candidate:{...candidate,exactVariantId:'iphone17promax'}}),/phase217_invalid_source_boundary/);
});
test('rights denied stops before any page bytes can be processed',async()=>{
 const denied={...policy,websiteTerms:'reviewed_prohibited' as const};
 const plan=planWebEvidenceAcquisition({exactVariantId:candidate.exactVariantId,userQuestion:'document original scoped model facts',asOf:moment,maxDaysSinceCheck:7,candidates:[candidate],existing:[],policies:[denied]});
 const result=await run({policy:denied,plan,queueItem:plan.items[0]});
 assert.equal(result.state,'blocked');assert.equal(result.capturedSha256,null);
});
test('robots disallow stops page content retrieval',async()=>{
 let visits=0;const transport:SourceTransport={async get(url){visits++;
  if(url.endsWith('robots.txt'))return {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nDisallow: /uk/iphone-18-pro'};
  throw Error('must not reach site');}};
 const result=await run({fixtureTransport:transport});assert.equal(result.state,'blocked');assert.equal(visits,1);
});
test('unavailable original bytes or missing binary capture cannot become evidence',async()=>{
 const transport:SourceTransport={async get(url){
  if(url.endsWith('robots.txt'))return {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /'};
  return {status:200,finalUrl:url,contentType:'text/html',body,rawBytes:undefined};}};
 const r=await run({fixtureTransport:transport});assert.equal(r.state,'blocked');
});
test('same content from two captures of one source does not create independent measurements',async()=>{
 const capture=await run();const summary=compareScopedFactCaptures217(triage,[capture,capture]);
 assert.equal(summary.rankingAuthorized,false);assert.equal(summary.factsFromPublisherNotIndependentlyMeasured,true);
 assert.equal(summary.claims.find(c=>c.claimId==='brightness')?.sourceStatus,'all_linked_facts_captured_in_fixture');
});
test('contradictory byte snapshots for one URL hold entire claim',async()=>{
 const r=await run();const other=await run({expectedDocumentSha256:null},body+' ');
 const summary=compareScopedFactCaptures217(triage,[r,other]);
 assert.equal(summary.claims.find(x=>x.claimId==='brightness')?.sourceStatus,'source_revision_requires_review');
});
test('no source capture cannot be confused with invalid product quality',()=>{
 const summary=compareScopedFactCaptures217(triage,[]);
 assert.ok(summary.claims.every(x=>x.sourceStatus==='no_eligible_capture'));
 assert.equal(summary.rankingAuthorized,false);
});
test('tampered claims with fake authority must be rejected',()=>{
 const capture:FactCustodyResult217={schema:'pee217.scoped-primary-fact-custody.v1',state:'fixture_only',sourceUrl:target,
  sourceId:'test',observedOn:'2026-10-13',capturedSha256:'a'.repeat(64),expectedSha256:null,
  revisionState:'first_observation',anchors:[{factId:'apple18uk_outdoor_brightness',finding:'exact_fragment_present_once'}],reason:null,
  rawPublisherTextRetained:false,rawAnchorTextRetained:false,sourceMaterialIsManufacturerStatementOnly:true,
  publisherIdentityIndependentlyAuthenticated:false,productModelInDocumentIndependentlyAuthenticated:false,
  originalReviewerAuthenticated:false,independentPerformanceTestAuthenticated:false,
  rankingAuthorized:false,trustBadgeAuthorized:false};
 assert.throws(()=>compareScopedFactCaptures217(triage,[{...capture,rankingAuthorized:true} as unknown as FactCustodyResult217]),/phase217_invalid_capture/);
});

test('duplicate same factId with contradictory values is never selected by list order',async()=>{
 const conflicting=[...facts,{...facts.find(f=>f.factId==='apple18uk_outdoor_brightness')!,value:3500}];
 await assert.rejects(run({facts:conflicting}),/phase217_ambiguous_source_fact/);
});
