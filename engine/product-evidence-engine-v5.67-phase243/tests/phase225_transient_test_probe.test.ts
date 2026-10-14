import {PAGE_MAX_BYTES} from '../src/approved_web_reader.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {probeTransientTestContent225} from '../src/phase225_transient_test_probe.js';
import {auditTestLeads225} from '../src/phase225_test_lead_audit.js';
import {observeDiscoveredPages222} from '../src/phase222_transient_public_page_observer.js';
import type {Registry220,Run220} from '../src/phase220_autonomous_discovery_worker.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
import {readFileSync} from 'node:fs';
const url='https://example-method-review.test/football/test';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const product=(name:string,model:string)=>`<script type="application/ld+json">${JSON.stringify({
 '@context':'https://schema.org','@type':'Product',name,model,brand:'Sample Maker',sku:model})}</script>`;
const wrap=(section:string,extra='')=>`<html><head>${extra}</head><body><article>${section}</article></body></html>`;
const football=wrap(`<h2>How we tested</h2><p>We tested the Sample Maker AX11 on a synthetic pitch using a digital scale.</p>
 <h2>Test results</h2><p>We measured the weight of the AX11 boot at 196 g using a digital scale under 20 °C.</p>
 <p>We did not test the AX12 on a wet pitch: 250 g is only a manufacturer specification.</p>`,product('Sample Maker AX11','AX11'));
const bin=wrap(`<h2>Testing method</h2><p>We tested the Sample Bin BT9 with a calibrated gauge.</p>
 <p>We recorded the usable volume at 21 L using a calibrated gauge.</p>
 <p>Advertised total capacity 60 L; nothing is known about each compartment.</p>`,product('Sample Bin BT9','BT9'));
test('football: method plus measured first-person outcome yields research-only hypothesis with no body storage',()=>{
 const result=probeTransientTestContent225(football,url,{productLeads:[{name:'Sample Maker AX11',model:'AX11',sku:'AX11'}]});
 assert.equal(result.candidates.filter(x=>x.value===196).length,1);
 assert.equal(result.candidates.filter(x=>x.value===250).length,0);
 assert.equal(result.candidates[0].methodCue,'test_section_with_method_cue');
 assert.equal(result.candidates[0].instrument,'digital scale');
 assert.equal(result.candidates[0].classification,'publisher_reported_measurement_lead_only');
 assert.equal(result.candidates[0].scientificEvidenceAdmitted,false);
 assert.equal(result.sourceBodyRetained,false);
 assert.ok(!JSON.stringify(result).includes('We measured the weight'));
});
test('bin: no compartment inference, only literal measured numeric outcome',()=>{
 const x=probeTransientTestContent225(bin,url,{productLeads:[{name:'Sample Bin BT9',model:'BT9',sku:'BT9'}]});
 assert.deepEqual(x.candidates.map(c=>c.value),[21]);
 assert.equal(x.candidates[0].unit,'l');assert.equal(x.candidates[0].exactVariantVerified,false);
});
test('manufacturer marketing and unsupported number are not treated as tested evidence',()=>{
 const x=probeTransientTestContent225(wrap('<p>Manufacturer claims a 65 L total capacity.</p><p>The value is 90%.</p>'),url);
 assert.equal(x.candidates.length,0);assert.equal(x.rankingAuthorized,false);
});
test('explicit negation and comparator claims cannot become test results',()=>{
 const x=probeTransientTestContent225(wrap('<p>We did not test rival QX9 which weighs 197 g.</p><p>Other reviewers measured 50 mm.</p>'),url);
 assert.equal(x.candidates.length,0);
});
test('JS and script JSON-LD fake method prose are excluded',()=>{
 const x=probeTransientTestContent225(wrap('<p>Ordinary introduction.</p>', `<script>document.body.innerHTML='We measured at 999 g';</script>${product('X','M1')}`),url);
 assert.equal(x.candidates.length,0);
});
test('ambiguous multiple models never force an exact variant',()=>{
 const x=probeTransientTestContent225(football,url,{productLeads:[{name:'Brand AX11',model:'AX11',sku:'AX11'},
  {name:'Brand AX12',model:'AX12',sku:'AX12'}]});
 assert.equal(x.candidates[0].subject,null);assert.equal(x.candidates[0].subjectAssignment,'multiple_models_unresolved');
});
test('same content yields deterministic candidate IDs; distinct URL changes provenance',()=>{
 const a=probeTransientTestContent225(bin,url),b=probeTransientTestContent225(bin,url);
 assert.deepEqual(a,b);assert.notEqual(a.candidates[0].id,probeTransientTestContent225(bin,'https://other-review.test/test').candidates[0].id);
});
test('bad URLs, bodies outside budget, and no article body retention',()=>{
 assert.equal(probeTransientTestContent225(bin,'http://example.org/path').candidates.length,0);
 assert.equal(probeTransientTestContent225(bin,'file:///etc/passwd').candidates.length,0);
 assert.equal(probeTransientTestContent225('x'.repeat(PAGE_MAX_BYTES+1),url).candidates.length,0);
 assert.equal(probeTransientTestContent225('<html>'+('x'.repeat(PAGE_MAX_BYTES+1))+'</html>',url).candidates.length,0);
});
test('excerpt quoted by seller cannot masquerade as independent test',()=>{
 const x=probeTransientTestContent225(wrap('<p>According to the manufacturer, we measured 34 L in our test using a meter.</p>'),url);
 assert.equal(x.candidates.length,0);
});
const base:Registry220=JSON.parse(readFileSync('docs/phase220/phase220-category-vocabulary.json','utf8'));
const registry:Registry220={...base,sources:[{watch:{id:'method',host:'example-method-review.test',categoryId:'football_footwear',
 mechanism:'approved_index_delta',channel:'specialist_editorial',tier:'exploration',rightsClearedForMetadata:false,
 nextCheckAt:'2026-10-13T18:00:00Z',lastCheckAt:null,quietChecks:0,errors:0},sitemapPath:'/sitemap.xml',pathPrefix:'/'}]};
const run:Run220={schema:'pee220.run.1',mode:'synthetic_fixture',requestSha256:'b'.repeat(64),
 intent:{status:'needs_category',categoryId:null,slotValues:{},clarification:null,key:null,confirmedByUser:false},
 localIntake:{suggestionCount:0,unresolvedIssues:0},decision:'candidate_discovery_attempted',
 plannedSourceIds:[],sourceOutcomes:[],networkRequests:[],
 candidates:[{sourceId:'method',url,verification:'unverified_url_only'}],limitations:[],rankingAuthorized:false,
 independentEvidenceVerified:false,
 checkpoint:{schema:'pee220.checkpoint.1',observations:[],watchSources:[],evidenceReceipts:[],rankingAuthorized:false}};
const transport=(page=football):SourceTransport=>({async get(href){const robot=href.endsWith('/robots.txt');
 const body=robot?'User-agent: *\nAllow: /\n':page;
 return {status:200,finalUrl:href,contentType:robot?'text/plain':'text/html',body,rawBytes:Buffer.from(body)};
}});
test('integrated already-approved HTML GET runs Phase224 and Phase225 in same fetch',async()=>{
 const x=await observeDiscoveredPages222({run,registry,observedAt:'2026-10-13T18:00:00Z',
  mode:'synthetic_fixture',fixtureTransport:transport()});
 assert.deepEqual(x.networkRequests,['https://example-method-review.test/robots.txt',url]);
 assert.equal(x.receipts[0].transientTestProbe225.candidates.length,1);
 assert.equal(x.receipts[0].responseSha256,sha(football));
 const audit=auditTestLeads225(x);
 assert.equal(audit.candidateCount,1);assert.equal(audit.independentTestsAuthenticated,0);
 assert.equal(audit.evidencePromoted,0);assert.equal(audit.rankingAuthorized,false);
 assert.ok(!JSON.stringify(x).includes('We measured the weight'));
});
test('audit deduplicates repeated source observation and detects version change',async()=>{
 const one=await observeDiscoveredPages222({run,registry,observedAt:'2026-10-13T18:00:00Z',mode:'synthetic_fixture',fixtureTransport:transport()});
 const two=await observeDiscoveredPages222({run,registry,observedAt:'2026-10-13T18:01:00Z',mode:'synthetic_fixture',fixtureTransport:transport(football.replace('196 g','197 g'))});
 assert.equal(auditTestLeads225(one,one).candidateCount,1);
 const audit=auditTestLeads225(one,two);
 assert.equal(audit.candidateCount,2);assert.deepEqual(audit.sourceRevisionConflicts,[url]);
});
test('explicit registry prohibition blocks page fetch and no candidate is produced',async()=>{
 const denied:Registry220={...registry,policies:[{sourceId:'no',host:'example-method-review.test',basis:'refused',
  rightsDocumentId:null,rightsDocumentUrl:null,reviewedBy:null,reviewedAt:null,validUntil:null,
  permittedOperations:[],robots:'unknown',robotsCheckedAt:null,websiteTerms:'unknown',termsCheckedAt:null,commercialUseReviewed:false}]};
 const x=await observeDiscoveredPages222({run,registry:denied,observedAt:'2026-10-13T18:00:00Z',
  mode:'synthetic_fixture',fixtureTransport:transport()});
 assert.equal(x.networkRequests.length,0);
 assert.equal(x.receipts[0].status,'blocked');assert.equal(auditTestLeads225(x).candidateCount,0);
});
test('audit rejects forged scientific admission, reviewer verification or scope mismatch',async()=>{
 const x=await observeDiscoveredPages222({run,registry,observedAt:'2026-10-13T18:00:00Z',
  mode:'synthetic_fixture',fixtureTransport:transport()});
 const clone=structuredClone(x);
 (clone.receipts[0].transientTestProbe225.candidates[0] as {rankingAuthorized:boolean}).rankingAuthorized=true;
 assert.throws(()=>auditTestLeads225(clone),/phase225_claim_promoted_or_scope_mismatch/);
 const clone2=structuredClone(x);
 (clone2.receipts[0].transientTestProbe225.candidates[0] as {value:number}).value=100;
 assert.throws(()=>auditTestLeads225(clone2),/phase225_claim_promoted_or_scope_mismatch/);
});
