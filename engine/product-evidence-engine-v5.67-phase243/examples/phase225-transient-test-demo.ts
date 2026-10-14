/** Explicitly synthetic Phase225 software trace. No live publication or network. */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {observeDiscoveredPages222} from '../src/phase222_transient_public_page_observer.js';
import {auditTestLeads225} from '../src/phase225_test_lead_audit.js';
import type {Registry220,Run220} from '../src/phase220_autonomous_discovery_worker.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const robots='User-agent: *\nAllow: /\n';
function body(name:string,model:string,outcome:string,ad:string){
 const ld={'@context':'https://schema.org','@type':'Product',name,model,sku:model};
 return `<html><head><script type="application/ld+json">${JSON.stringify(ld)}</script></head><body>
 <h2>How we tested</h2><p>We tested ${name} using a digital scale.</p>
 <h2>Test results</h2><p>We measured ${outcome} using a digital scale.</p>
 <p>Manufacturer advertises ${ad}.</p></body></html>`;
}
const pages:Record<string,string>={
 'https://synthetic-footwear.test/article':body('Fictional Shoe A11','A11','weight at 206 g','an all-surface outsole'),
 'https://synthetic-waste.test/article':body('Fictional Recycling Bin B22','B22','usable capacity at 23 L','a total capacity of 60 L')
};
const base:Registry220=JSON.parse(readFileSync('docs/phase220/phase220-category-vocabulary.json','utf8'));
const sources=[['footwear','synthetic-footwear.test','football_footwear'],['waste','synthetic-waste.test','recycling_bins']].map(([id,host,categoryId])=>({
 watch:{id,host,categoryId,mechanism:'approved_index_delta' as const,channel:'specialist_editorial' as const,
 tier:'exploration' as const,rightsClearedForMetadata:false,nextCheckAt:'2026-10-13T18:00:00Z',lastCheckAt:null,quietChecks:0,errors:0},
 sitemapPath:'/sitemap.xml',pathPrefix:'/'}));
const registry:Registry220={...base,sources};
const run:Run220={schema:'pee220.run.1',mode:'synthetic_fixture',requestSha256:sha('phase225-synthetic-run'),
 intent:{status:'needs_category',categoryId:null,slotValues:{},clarification:null,key:null,confirmedByUser:false},
 localIntake:{suggestionCount:0,unresolvedIssues:0},decision:'candidate_discovery_attempted',plannedSourceIds:[],
 sourceOutcomes:[],networkRequests:[],candidates:[
 {sourceId:'footwear',url:'https://synthetic-footwear.test/article',verification:'unverified_url_only'},
 {sourceId:'waste',url:'https://synthetic-waste.test/article',verification:'unverified_url_only'}],
 limitations:[],rankingAuthorized:false,independentEvidenceVerified:false,
 checkpoint:{schema:'pee220.checkpoint.1',observations:[],watchSources:[],evidenceReceipts:[],rankingAuthorized:false}};
const transport:SourceTransport={async get(url){const robot=url.endsWith('/robots.txt');
 const html=robot?robots:pages[url];if(html===undefined)throw Error('unsupported_fixture_url');
 return {status:200,finalUrl:url,contentType:robot?'text/plain':'text/html',body:html,rawBytes:Buffer.from(html)};
}};
const observation=await observeDiscoveredPages222({run,registry,observedAt:'2026-10-13T18:00:00Z',mode:'synthetic_fixture',fixtureTransport:transport});
const audit=auditTestLeads225(observation);
process.stdout.write(JSON.stringify({schema:'pee225.synthetic-demonstration.v1',synthetic:true,
 requests:observation.networkRequests,methodLeads:observation.receipts.map(r=>({url:r.url,status:r.status,
 candidateCount:r.transientTestProbe225.candidates.length,
 candidates:r.transientTestProbe225.candidates.map(c=>({value:c.value,unit:c.unit,instrument:c.instrument,
  subject:c.subject?.name,subjectAssignment:c.subjectAssignment,scientificEvidenceAdmitted:c.scientificEvidenceAdmitted}))})),
 audit,sourceBodiesStored:false,rankedProducts:0},null,2)+'\n');
