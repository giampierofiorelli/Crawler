/** Synthetic execution of a complete internal page-to-claim audit.
 * Sources below DO NOT exist. This is NOT a live source acquisition test.
 */
import {observeDiscoveredPages222} from '../src/phase222_transient_public_page_observer.js';
import {auditObservedClaims224} from '../src/phase224_claim_lineage.js';
import {readFileSync} from 'node:fs';
import type {Registry220,Run220} from '../src/phase220_autonomous_discovery_worker.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
const registry:Registry220=JSON.parse(readFileSync('docs/phase220/phase220-category-vocabulary.json','utf8'));
const now='2026-10-13T19:00:00Z';
const hosts=['synthetic-footwear-source.test','synthetic-review-source.test'];
const items=hosts.map((host,i)=>({url:`https://${host}/catalog/ax20`,sourceId:`fixture_${i}`,verification:'unverified_url_only' as const}));
const sources=hosts.map((host,i)=>({watch:{id:`fixture_${i}`,host,categoryId:'football_footwear',
  channel:'specialist_editorial' as const,mechanism:'approved_index_delta' as const,
  tier:'exploration' as const,rightsClearedForMetadata:false,nextCheckAt:now,lastCheckAt:null,quietChecks:0,errors:0},
  sitemapPath:'/sitemap.xml',pathPrefix:'/'}));
const reg:Registry220={...registry,sources};
const run:Run220={schema:'pee220.run.1',mode:'synthetic_fixture',requestSha256:'0'.repeat(64),
 intent:{status:'needs_category',categoryId:null,slotValues:{},clarification:null,key:null,confirmedByUser:false},
 localIntake:{suggestionCount:0,unresolvedIssues:0},decision:'candidate_discovery_attempted',
 plannedSourceIds:[],sourceOutcomes:[],networkRequests:[],candidates:items,limitations:[],
 rankingAuthorized:false,independentEvidenceVerified:false,
 checkpoint:{schema:'pee220.checkpoint.1',observations:[],watchSources:[],evidenceReceipts:[],rankingAuthorized:false}};
const transport:SourceTransport={async get(url){
 const robots=url.endsWith('/robots.txt'),other=url.includes(hosts[1]);
 const p={'@context':'https://schema.org','@type':'Product',name:'Fictional AG Boot',brand:'Fictional Company',
  model:'AX20',sku:'AX20-AG',additionalProperty:[{'@type':'PropertyValue',name:'Stud height',
  value:other?15:12,unitText:'mm'},{'@type':'PropertyValue',name:'Surface',value:'AG'}]};
 const body=robots?'User-agent: *\nAllow: /\n':'<html><script type="application/ld+json">'+JSON.stringify(p)+'</script><body>UNRETAINED FAKE BODY</body></html>';
 return {status:200,finalUrl:url,contentType:robots?'text/plain':'text/html',body,rawBytes:Buffer.from(body)};
}};
const observations=await observeDiscoveredPages222({run,registry:reg,observedAt:now,mode:'synthetic_fixture',fixtureTransport:transport});
const audit=auditObservedClaims224(observations);
console.log(JSON.stringify({schema:'pee224.synthetic-demo.v1',sourceType:'fabricated_test_fixture_not_live',
 networkMode:'synthetic_fixture',transportCalls:observations.networkRequests.length,
 observations,audit},null,2));
