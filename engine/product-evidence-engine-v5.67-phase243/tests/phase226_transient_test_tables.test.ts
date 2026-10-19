import test from 'node:test';
import assert from 'node:assert/strict';
import {probeTransientTestTables226} from '../src/phase226_transient_test_tables.js';
import {probeTransientTestContent225} from '../src/phase225_transient_test_probe.js';
import {createHash} from 'node:crypto';
const url='https://review-lab.example.org/tests/review';
const products=[
 {name:'Sample Footwear AX11',model:'AX11',sku:'SKU-AX11'},
 {name:'Sample Footwear BX20',model:'BX20',sku:'SKU-BX20'}];
const intro='<p>We weighed the test samples ourselves using a digital scale.</p>';
const make=(body:string,prefix=intro)=>`<html><head><title>Research fixture</title></head><body>${prefix}${body}</body></html>`;
const table=(rows:string,heads='<th scope="col">Model</th><th scope="col">Measured mass (g)</th>')=>
 `<table><caption>Our test measurements</caption><thead><tr>${heads}</tr></thead><tbody>${rows}</tbody></table>`;
const row=(id:string,v:string)=>`<tr><th scope="row">${id}</th><td>${v}</td></tr>`;
const setup=(html:string,ps=products)=>probeTransientTestContent225(html,url,{productLeads:ps,
 documentSha256:createHash('sha256').update(html).digest('hex')});
test('two explicit tested row models remain distinct with different candidate identities',()=>{
 const x=setup(make(table(row('AX11','196')+row('BX20','210'))));
 assert.equal(x.tableResults226,2);assert.equal(x.candidates.length,2);
 assert.deepEqual(x.candidates.map(v=>v.value).sort((a,b)=>a-b),[196,210]);
 assert.ok(x.candidates.every(c=>c.methodCue==='bounded_table_result_with_local_method'));
 assert.ok(x.candidates.every(c=>c.subjectAssignment==='table_row_declared_model_unverified'));
 assert.deepEqual(new Set(x.candidates.map(c=>c.subject?.model)),new Set(['AX11','BX20']));
 assert.ok(x.candidates.every(c=>c.scientificEvidenceAdmitted===false&&c.exactVariantVerified===false));
 assert.equal(x.sourceBodyRetained,false);assert.equal(x.sourcePassagesRetained,false);
 assert.ok(!JSON.stringify(x).includes('We weighed the test samples'));
});
test('missing nearby first-person testing text: table numbers never automatically count as tests',()=>{
 const x=setup(make(table(row('AX11','196')),'<p>The company provided these values.</p>'));
 assert.equal(x.candidates.length,0);
});
test('manufacturer attribution and negative testing block table lead',()=>{
 for(const p of ['<p>Manufacturer claims that we measured these values.</p>',
                  '<p>We did not test the samples.</p>']){
  assert.equal(setup(make(table(row('AX11','196')),p)).candidates.length,0);
 }
});
test('units must be explicitly present and match, no implicit conversion or inference',()=>{
 const heads='<th scope="col">Model</th><th scope="col">Measured mass</th>';
 assert.equal(setup(make(table(row('AX11','196'),heads))).tableResults226,0);
 assert.equal(setup(make(table(row('AX11','0.2 kg')))).tableResults226,0);
 assert.equal(setup(make(table(row('AX11','196 g')))).tableResults226,1);
 // S86 (2026-10-19): "196 grams" under a "(g)" header is the same unit, read by the quantity knowledge (no conversion); it
 // was refused before only because the closed unit list lacked "grams". A different unit (0.2 kg above) is still refused.
 assert.equal(setup(make(table(row('AX11','196 grams')))).tableResults226,1);
});
test('model match is exact; AX11 does not automatically match AX110 or other page products',()=>{
 assert.equal(setup(make(table(row('AX110','196')))).tableResults226,0);
 assert.equal(setup(make(table(row('AX11','196'))),products.concat([products[0]])).tableResults226,0);
});
test('explicitly advertised column excluded while test column remains a candidate',()=>{
 const heads='<th scope="col">Model</th><th scope="col">Measured mass (g)</th><th scope="col">Advertised mass (g)</th>';
 const values='<tr><th scope="row">AX11</th><td>196</td><td>190</td></tr>';
 const r=setup(make(table(values,heads)));assert.equal(r.tableResults226,1);
 assert.equal(r.candidates[0].value,196);
});
test('complex table colspan/rowspan and ambiguous headers safely abstain',()=>{
 const v=row('AX11','196');
 const bad=[table(v).replace('scope="col">Model','scope="col" colspan="2">Model'),
  table(v.replace('scope="row"','scope="row" rowspan="2"')),
  table(v).replace('scope="row"','scope="col"'),
  table(v).replace('scope="col">Measured mass','scope="row">Measured mass'),
  table(v).replace('<thead>','<thead><tr><th scope="col">Extra</th></tr>')];
 for(const b of bad)assert.equal(setup(make(b)).tableResults226,0);
});
test('table-only without product leads does not attach unverified row to wrong product',()=>{
 const html=make(table(row('AX11','196')));
 const probe=probeTransientTestTables226(html,url,{productLeads:[]});
 assert.equal(probe.candidates.length,0);assert.equal(probe.scientificEvidenceAdmitted,false);
});
test('compartment capacity cannot be substituted with total product volume',()=>{
 const ps=[{name:'Fictional Bin BT9',model:'BT9',sku:'BT9'}];
 const heads='<th scope="col">Model</th><th scope="col">Measured compartment volume (l)</th><th scope="col">Manufacturer total volume (l)</th>';
 const rows='<tr><th scope="row">BT9</th><td>18</td><td>60</td></tr>';
 const a=setup(make(table(rows,heads)),ps);
 assert.equal(a.tableResults226,1);assert.equal(a.candidates[0].value,18);
 // S86 (2026-10-19): stored units are the quantity knowledge's canonical keys (were the Phase265 table's lowercase spellings); same unit, same value
 assert.equal(a.candidates[0].unit,'L');
 assert.equal(a.candidates[0].publisherDeclaredDimension,'volume');
 assert.equal(a.candidates[0].publisherDeclaredTargetScope,'compartment_unspecified');
});
test('data from script, JSON-LD, and HTML comments cannot create table measurements',()=>{
 const b=table(row('AX11','196'));
 const html=make(`<script type="application/ld+json">${JSON.stringify({html:b})}</script><!-- ${b} -->`);
 assert.equal(setup(html).tableResults226,0);
});
test('same page is deterministic and changing source/model/value changes identity',()=>{
 const a=make(table(row('AX11','196')));
 const x=setup(a),y=setup(a),z=setup(a.replace('196','197'));
 assert.deepEqual(x,y);assert.notEqual(x.candidates[0].id,z.candidates[0].id);
});
test('budgets bound tables and output to 20 candidates',()=>{
 const ps=Array.from({length:30},(_,i)=>({name:`Fictional Model X${i}`,model:`X${i}`,sku:`X${i}`}));
 const rows=ps.map((p)=>row(p.model,'190')).join('');
 const x=probeTransientTestTables226(make(table(rows)),url,{productLeads:ps});
 assert.ok(x.candidates.length<=20);assert.equal(x.truncated,true);
});
test('honours alternative row model labelled by full product name',()=>{
 const a=setup(make(table(row('Sample Footwear AX11','196'))));
 assert.equal(a.tableResults226,1);assert.equal(a.candidates[0].subject?.model,'AX11');
});
test('no table can authenticate publisher originality or approve ranking',()=>{
 const x=setup(make(table(row('AX11','196'))));
 assert.equal(x.rankingAuthorized,false);assert.equal(x.independenceAuthenticated,false);
 assert.equal(x.protocolAuthenticated,false);assert.equal(x.candidates[0].originalWorkReviewed,false);
});
import {observeDiscoveredPages222} from '../src/phase222_transient_public_page_observer.js';
import {auditTestLeads225} from '../src/phase225_test_lead_audit.js';
import type {Registry220,Run220} from '../src/phase220_autonomous_discovery_worker.js';
import {readFileSync} from 'node:fs';
const reference:Registry220=JSON.parse(readFileSync('docs/phase220/phase220-category-vocabulary.json','utf8'));
const registry:Registry220={...reference,sources:[{watch:{id:'review226',host:'review-lab.example.org',categoryId:'football_footwear',
 mechanism:'approved_index_delta',channel:'specialist_editorial',tier:'exploration',rightsClearedForMetadata:false,
 nextCheckAt:'2026-10-13T19:00:00Z',lastCheckAt:null,quietChecks:0,errors:0},sitemapPath:'/sitemap.xml',pathPrefix:'/'}]};
const run:Run220={schema:'pee220.run.1',mode:'synthetic_fixture',requestSha256:'c'.repeat(64),
 intent:{status:'needs_category',categoryId:null,slotValues:{},clarification:null,key:null,confirmedByUser:false},
 localIntake:{suggestionCount:0,unresolvedIssues:0},decision:'candidate_discovery_attempted',
 plannedSourceIds:[],sourceOutcomes:[],networkRequests:[],
 candidates:[{sourceId:'review226',url,verification:'unverified_url_only'}],limitations:[],rankingAuthorized:false,
 independentEvidenceVerified:false,checkpoint:{schema:'pee220.checkpoint.1',observations:[],watchSources:[],
 evidenceReceipts:[],rankingAuthorized:false}};
test('end-to-end fixture: one HTML GET, JSON-LD product ID, table lead, source audit, zero promotion',async()=>{
 const content=make(table(row('AX11','196')))+'';
 const article=content.replace('</head>',`<script type="application/ld+json">${JSON.stringify({
  '@context':'https://schema.org','@type':'Product',name:products[0].name,model:products[0].model,sku:products[0].sku})}</script></head>`);
 const fetched:string[]=[];
 const observation=await observeDiscoveredPages222({run,registry,observedAt:'2026-10-13T19:05:00Z',mode:'synthetic_fixture',
  fixtureTransport:{async get(href){fetched.push(href);
   const robots=href.endsWith('/robots.txt');const body=robots?'User-agent: *\nAllow: /\n':article;
   return {status:200,finalUrl:href,contentType:robots?'text/plain':'text/html',body,rawBytes:Buffer.from(body)};
  }}});
 assert.deepEqual(fetched,['https://review-lab.example.org/robots.txt',url]);
 assert.equal(observation.receipts[0].productLeads.length,1);
 assert.equal(observation.receipts[0].transientTestProbe225.tableResults226,1);
 assert.equal(observation.receipts[0].transientTestProbe225.candidates[0].value,196);
 const audited=auditTestLeads225(observation);
 assert.equal(audited.candidateCount,1);assert.equal(audited.independentTestsAuthenticated,0);
 assert.equal(audited.evidencePromoted,0);assert.equal(audited.rankingAuthorized,false);
 assert.ok(!JSON.stringify(observation).includes('We weighed the test samples'));
});
test('auditor rejects forged table evidence and missing dimensional annotation',async()=>{
 const content=make(table(row('AX11','196'))).replace('</head>',`<script type="application/ld+json">${JSON.stringify({
  '@context':'https://schema.org','@type':'Product',name:products[0].name,model:products[0].model,sku:products[0].sku})}</script></head>`);
 const observed=await observeDiscoveredPages222({run,registry,observedAt:'2026-10-13T19:05:00Z',mode:'synthetic_fixture',
  fixtureTransport:{async get(href){const robots=href.endsWith('/robots.txt');const body=robots?'User-agent: *\nAllow: /\n':content;
   return {status:200,finalUrl:href,contentType:robots?'text/plain':'text/html',body,rawBytes:Buffer.from(body)};
  }}});
 const forged=structuredClone(observed);
 (forged.receipts[0].transientTestProbe225.candidates[0] as {scientificEvidenceAdmitted:boolean}).scientificEvidenceAdmitted=true;
 assert.throws(()=>auditTestLeads225(forged),/phase225_claim_promoted_or_scope_mismatch/);
 const missing=structuredClone(observed);
 (missing.receipts[0].transientTestProbe225.candidates[0] as {publisherDeclaredDimension?:string}).publisherDeclaredDimension=undefined;
 assert.throws(()=>auditTestLeads225(missing),/phase225_claim_promoted_or_scope_mismatch/);
});
