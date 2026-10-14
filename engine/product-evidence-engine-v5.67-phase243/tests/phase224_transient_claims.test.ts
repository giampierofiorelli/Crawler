import {PAGE_MAX_BYTES} from '../src/approved_web_reader.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {extractTransientClaims224} from '../src/phase224_transient_structured_claims.js';
import {auditObservedClaims224} from '../src/phase224_claim_lineage.js';
import {observeDiscoveredPages222} from '../src/phase222_transient_public_page_observer.js';
import type {Registry220,Run220} from '../src/phase220_autonomous_discovery_worker.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
const urlA='https://example-bootmaker.org/p/alpha';const urlB='https://example-bootreview.org/review/alpha';
const date='2026-10-13T19:00:00Z';
const html=(data:unknown)=>`<html><head><script type="application/ld+json">${JSON.stringify(data)}</script></head><body>TOP SECRET ARTICLE TEXT COPYRIGHT NEVER RETAIN</body></html>`;
const product=(capacity:unknown,props:unknown[]=[])=>(
 {'@context':'https://schema.org','@type':'Product',name:'Example AG Football Boot',brand:{name:'ExampleSport'},model:'AX-20',sku:'AX20-AG',
  additionalProperty:[{'@type':'PropertyValue',name:'Stack height',value:capacity,unitText:'mm'},...props],description:'NO TEXT STORAGE'});
const field=(name:string,value:unknown,unitText?:string)=>({'@type':'PropertyValue',name,value,...(unitText?{unitText}:{})});
test('Atomic numeric and categorical declarations, tied to publisher model hypothesis, never independent evidence',()=>{
 const s=html(product(12,[field('Surface','AG'),field('Plate Type','firm ground')]));
 const x=extractTransientClaims224(s,urlA);
 assert.equal(x.claims.length,3);assert.equal(x.claims.find(c=>c.propertyKey==='stack height')?.value,12);
 assert.equal(x.claims.find(c=>c.propertyKey==='surface')?.value,'AG');
 assert.ok(x.claims.every(c=>c.claimStatus==='publisher_declaration_unverified'&&!c.rankingAuthorized&&!c.independentMeasurement));
 assert.equal(x.conflictingPropertyKeys.length,0);assert.equal(x.subjectsWithWeakIdentity,0);
 assert.ok(!JSON.stringify(x).includes('TOP SECRET'));
 assert.ok(!JSON.stringify(x).includes('NO TEXT STORAGE'));
});
test('Recycling-bin capacity only when actually structured; no fabricated per-compartment inference',()=>{
 const bin={'@context':'https://schema.org','@type':'Product',name:'Synthetic Sorter',brand:'Household Co',sku:'RB-20',
  additionalProperty:[field('Total capacity',60,'L'),field('Compartments',2),field('Material','stainless steel')],
  description:'Two compartments both 30L maybe'};
 const x=extractTransientClaims224(html(bin),'https://example-bins.org/products/bins');
 assert.equal(x.claims.length,3);assert.deepEqual(x.claims.filter(c=>c.propertyKey.includes('compartment')).map(c=>c.value),[2]);
 assert.equal(x.claims.some(c=>c.propertyKey==='capacity per compartment'),false);
 assert.equal(x.rankingAuthorized,false);
});
test('Reprinted Review is not measurement; itemReviewed product can carry unverified properties',()=>{
 const page=html({'@context':'https://schema.org','@type':'Review',reviewRating:{ratingValue:5},
  itemReviewed:product(15,[field('Surface','AG')])});
 const x=extractTransientClaims224(page,urlB);
 assert.equal(x.claims.length,2);assert.equal(x.claims.some(c=>c.propertyKey==='rating'),false);
 assert.ok(x.claims.every(c=>c.independentMeasurement===false));
});
test('Ignore free text, rating aggregations, non-Schema markup and malformed HTML',()=>{
 for(const p of [
  '<html><body>12 mm peak, AG FG, 5 stars, bestseller</body></html>',
  '<html><script type="application/ld+json">{"@type":"Product","name":"Y","additionalProperty":[{"@type":"PropertyValue","name":"Weight","value":10}]}</script></html>',
  '<html><script type="application/ld+json">{wrong}</script></html>',
  html({'@context':'https://evil.example/','@type':'Product',name:'Y',additionalProperty:[field('Weight',10)]})
 ])assert.equal(extractTransientClaims224(p,urlA).claims.length,0);
});
test('Reject prose, unsafe property names, unsafe units, non numeric strings, tracking numbers',()=>{
 const values=[field('Warranty','Read the review article and its conclusions before purchase'),
  field('__proto__',22),field('Weight',10,'<script>'),field('Weight','12 kg weight'),field('Height','about 12')];
 assert.equal(extractTransientClaims224(html(product(12,values)),urlA).claims.length,1);
});
test('Reject malicious source URL and bounded input; never trust arbitrary local URLs',()=>{
 assert.equal(extractTransientClaims224(html(product(12)),'file:///tmp/fake').claims.length,0);
 assert.equal(extractTransientClaims224(html(product(12)),'http://example.org/p').claims.length,0);
 assert.equal(extractTransientClaims224(html(product(12)),urlA+'x'.repeat(900000)).claims.length,0);
 assert.equal(extractTransientClaims224('<html>'+('A'.repeat(PAGE_MAX_BYTES+1))+'</html>',urlA).claims.length,0);
});
test('Deduplicate identical declarations and mark contradictory values on same page',()=>{
 const x=extractTransientClaims224(html(product(12,[field('Stack height','12','mm'),field('Stack height',15,'mm')])),urlA);
 assert.equal(x.claims.length,2);assert.equal(x.conflictingPropertyKeys.length,1);
});
test('Different claim value or source URL changes deterministic provenance IDs',()=>{
 const a=extractTransientClaims224(html(product(12)),urlA);const b=extractTransientClaims224(html(product(12)),urlA);
 const c=extractTransientClaims224(html(product(13)),urlA);const d=extractTransientClaims224(html(product(12)),urlB);
 assert.deepEqual(a,b);assert.notEqual(a.claims[0].claimId,c.claims[0].claimId);
 assert.notEqual(a.claims[0].claimId,d.claims[0].claimId);
});
test('Arrays and graph syntax are bounded, and result is deterministically sorted',()=>{
 const p=product(12);const x=extractTransientClaims224(html({'@context':'https://schema.org','@graph':[p,p]}),urlA);
 assert.equal(x.claims.length,1);assert.equal(x.truncated,false);
 const many=product(12,Array.from({length:80},(_,i)=>field('Trait '+i,i)));
 const y=extractTransientClaims224(html(many),urlA);assert.ok(y.claims.length<=24);
 assert.equal(y.truncated,true);
});
test('Weak product identity is recorded instead of claiming exact variant',()=>{
 const p=product(12);delete (p as {sku?:string}).sku;delete (p as {model?:string}).model;
 const x=extractTransientClaims224(html(p),urlA);assert.equal(x.subjectsWithWeakIdentity,1);
 assert.equal(x.claims[0].exactVariantAuthenticated,false);
});
const base:Registry220=JSON.parse(readFileSync('docs/phase220/phase220-category-vocabulary.json','utf8'));
const source=(id:string,host:string)=>({watch:{id,host,categoryId:'football_footwear',mechanism:'approved_index_delta' as const,
 channel:'specialist_editorial' as const,tier:'exploration' as const,
 rightsClearedForMetadata:false,nextCheckAt:date,lastCheckAt:null,quietChecks:0,errors:0},sitemapPath:'/sitemap.xml',pathPrefix:'/'});
const registry:Registry220={...base,sources:[source('a','example-bootmaker.org'),source('b','example-bootreview.org')]};
const run:Run220={schema:'pee220.run.1',mode:'synthetic_fixture',requestSha256:'a'.repeat(64),
 intent:{status:'needs_category',categoryId:null,slotValues:{},clarification:null,key:null,confirmedByUser:false},
 localIntake:{suggestionCount:0,unresolvedIssues:0},decision:'candidate_discovery_attempted',
 plannedSourceIds:[],sourceOutcomes:[],networkRequests:[],
 candidates:[{sourceId:'a',url:urlA,verification:'unverified_url_only'},
 {sourceId:'b',url:urlB,verification:'unverified_url_only'}],limitations:[],rankingAuthorized:false,independentEvidenceVerified:false,
 checkpoint:{schema:'pee220.checkpoint.1',observations:[],watchSources:[],evidenceReceipts:[],rankingAuthorized:false}};
function transport(other=15):SourceTransport{return {async get(url){
  const robots=url.endsWith('/robots.txt');const body=robots?'User-agent: *\nAllow: /\n':html(product(url===urlA?12:other));
  return {status:200,finalUrl:url,contentType:robots?'text/plain':'text/html',body,rawBytes:Buffer.from(body)};
 }};}
test('INTEGRATED Phase223 URL -> Phase222 same transient GET -> Phase224 declared claims, no second fetch',async()=>{
 const obs=await observeDiscoveredPages222({run,registry,observedAt:date,mode:'synthetic_fixture',fixtureTransport:transport()});
 assert.equal(obs.networkRequests.length,4);assert.equal(obs.receipts.length,2);
 assert.equal(obs.receipts[0].structuredDeclarations224.claims.length,1);
 assert.ok(obs.receipts.every(r=>r.responseSha256?.length===64&&r.structuredDeclarations224.claims[0].sourceUrl===r.url));
 const audit=auditObservedClaims224(obs);
 assert.equal(audit.claimCount,2);assert.equal(audit.observedSources,2);assert.equal(audit.disagreements.length,1);
 assert.ok(audit.reasonCodes.includes('conflicting_publisher_values_require_review'));
 assert.equal(audit.rankingAuthorized,false);assert.equal(audit.originalTestsVerified,0);
 assert.ok(!JSON.stringify(obs).includes('TOP SECRET ARTICLE'));
});
test('Agreement between unverified sources still does not authenticate a measurement or market variant',async()=>{
 const obs=await observeDiscoveredPages222({run,registry,observedAt:date,mode:'synthetic_fixture',fixtureTransport:transport(12)});
 const audit=auditObservedClaims224(obs);
 assert.equal(audit.disagreements.length,0);assert.equal(audit.originalTestsVerified,0);assert.equal(audit.exactVariantsVerified,0);
});
test('Explicit registry prohibition blocks Phase224 before source page GET',async()=>{
 const reg:Registry220={...registry,policies:[{sourceId:'deny_a',host:'example-bootmaker.org',basis:'refused',
  rightsDocumentId:null,rightsDocumentUrl:null,reviewedBy:null,reviewedAt:null,validUntil:null,
  permittedOperations:[],robots:'unknown',robotsCheckedAt:null,websiteTerms:'unknown',termsCheckedAt:null,commercialUseReviewed:false}]};
 const obs=await observeDiscoveredPages222({run,registry:reg,observedAt:date,mode:'synthetic_fixture',fixtureTransport:transport()});
 assert.equal(obs.receipts[0].status,'blocked');assert.equal(obs.receipts[0].structuredDeclarations224.claims.length,0);
 assert.equal(obs.networkRequests.length,2);
 assert.ok(auditObservedClaims224(obs).reasonCodes.includes('some_pages_not_read_due_to_access_controls'));
});
test('Reject tampered observations that could promote publisher declarations',async()=>{
 const obs=await observeDiscoveredPages222({run,registry,observedAt:date,mode:'synthetic_fixture',fixtureTransport:transport()});
 assert.throws(()=>auditObservedClaims224({...obs,independentEvidenceVerified:true as false}),/phase224_untrusted_observation/);
 const tampered=structuredClone(obs);(tampered.receipts[0].structuredDeclarations224.claims[0] as {claimStatus:string}).claimStatus='independent_test';
 assert.throws(()=>auditObservedClaims224(tampered),/phase224_claim_scope_mismatch/);
});
test('Without readable structured facts the audit refuses to infer product specifications',()=>{
 const x=auditObservedClaims224();assert.equal(x.claimCount,0);assert.equal(x.rankingAuthorized,false);
 assert.ok(x.reasonCodes.includes('no_machine_readable_atomic_claims'));
});
test('Repeated identical pages across source discovery and search do not inflate claim count',async()=>{
 const obs=await observeDiscoveredPages222({run,registry,observedAt:date,mode:'synthetic_fixture',fixtureTransport:transport(12)});
 const audit=auditObservedClaims224(obs,obs);
 assert.equal(audit.claimCount,2);assert.equal(audit.observedSources,2);
 assert.equal(audit.disagreements.length,0);
});
test('Product variants with differing model codes are not conflated for cross-page conflict',async()=>{
 const adapter:SourceTransport={async get(url){const isRobot=url.endsWith('/robots.txt');
  const modified=url===urlB?{...product(14),model:'AX-21',sku:'AX21-AG'}:product(12);
  const body=isRobot?'User-agent: *\nAllow: /\n':html(modified);
  return {status:200,finalUrl:url,contentType:isRobot?'text/plain':'text/html',body,rawBytes:Buffer.from(body)};
 }};
 const obs=await observeDiscoveredPages222({run,registry,observedAt:date,mode:'synthetic_fixture',fixtureTransport:adapter});
 assert.equal(auditObservedClaims224(obs).disagreements.length,0);
});
test('No false cross-source merge when product has no manufacturer and model',async()=>{
 const adapter:SourceTransport={async get(url){const isRobot=url.endsWith('/robots.txt');
  const p={'@context':'https://schema.org','@type':'Product',name:'Generic Bin',
   additionalProperty:[field('Capacity',url===urlA?20:60,'L')]};
  const body=isRobot?'User-agent: *\nAllow: /\n':html(p);
  return {status:200,finalUrl:url,contentType:isRobot?'text/plain':'text/html',body,rawBytes:Buffer.from(body)};
 }};
 const obs=await observeDiscoveredPages222({run,registry,observedAt:date,mode:'synthetic_fixture',fixtureTransport:adapter});
 assert.equal(auditObservedClaims224(obs).disagreements.length,0);
 assert.ok(auditObservedClaims224(obs).reasonCodes.includes('weak_product_identity'));
});
