#!/usr/bin/env node
/** Phase261 — genuine-job offline discovery pilot and blocker assessment.
 * - Jobs: the 19 genuine Phase257 jobs (evaluation/phase257/policy-demo.json), re-derived through Phase182.
 * - Store: a COPY of the verified pee-knowledge snapshot, outside Git (the live store is not opened).
 * - Policy: the real operator research policy (Phase257), which disables live reads.
 * - Blocker assessment: every job against the OPERATIONAL discovery registry state (there is none for these categories).
 * - Pilot: two genuine jobs through Phase82/75 with OFFLINE FIXTURE channels on fictional hosts (*.pee261-fixture.test),
 *   public-metadata mode with basis "unknown" (no rights review asserted). Fixture candidates are not discoveries.
 * Output: ids, counts and reason codes only (no URLs of real pages, no declaration values). Zero network calls.
 * Usage: node scripts/phase261-discovery-pilot.mjs [--out FILE]
 */
import {writeFileSync,copyFileSync,mkdirSync,rmSync,readFileSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {loadResearchPolicy257} from '../dist/src/phase257_research_planning.js';
import {discoveryTargetFromJob261,discoverForTarget261,assessDiscovery261} from '../dist/src/phase261_discovery_bridge.js';
const out=process.argv.includes('--out')?process.argv[process.argv.indexOf('--out')+1]:null;
const dir=join(homedir(),'.local','share','product-evidence-engine','arms261');mkdirSync(dir,{recursive:true});
const dbf=join(dir,'real-copy.sqlite');for(const x of ['','-wal','-shm'])rmSync(dbf+x,{force:true});
copyFileSync('/home/user/pee-knowledge/snapshot/pee246.sqlite',dbf);
const policyPath=process.env.PEE_RESEARCH_POLICY??join(homedir(),'.local','share','product-evidence-engine','research-policy','research-policy.json');
const now=new Date();const policy=loadResearchPolicy257(policyPath,now);const asOf=now.toISOString();
const store=new KnowledgeStore246(dbf);const statsBefore=JSON.stringify(store.stats246());
const demo=JSON.parse(readFileSync('evaluation/phase257/policy-demo.json','utf8'));
const jobs=demo.plans.flatMap(p=>p.jobs.map(j=>({jobId:j.jobId,categoryId:p.categoryId,gapKind:j.gapKind,productId:j.productId,criterion:j.criterion})));
// The operational discovery registry: none exists for PEE's policy categories (the Phase220 vocabulary covers other
// categories and has no sources; the Phase244 registry is test-only). Assessed as it is: empty.
const operational={schema:'pee220.registry.1',vocabulary:[],sources:[],policies:[]};

// 1. Mapping and blockers for all 19 jobs.
const assessed=[];let mapped=0;const mapFailures=[];
for(const j of jobs){
 try{const t=discoveryTargetFromJob261(j,{market:policy.market,store});mapped++;assessed.push(assessDiscovery261({target:t,registry:operational,researchPolicy:policy,store}));}
 catch(e){mapFailures.push({jobId:j.jobId,error:String(e.message).slice(0,120)});}
}
const blockerCounts={};for(const a of assessed)for(const b of a.blockers)blockerCounts[b]=(blockerCounts[b]??0)+1;

// 2. Offline fixture pilot on two genuine jobs: the first job with an exact identifier in each of two categories.
const pick=cat=>assessed.find(a=>a.categoryId===cat&&a.knownIdentifierCount>0)??assessed.find(a=>a.categoryId===cat);
const pilotJobs=[pick('air_fryers'),pick('coffee_machines')].filter(Boolean).map(a=>jobs.find(j=>j.jobId===a.jobId));
const pilot=[];
for(const [i,j] of pilotJobs.entries()){
 const t=discoveryTargetFromJob261(j,{market:policy.market,store});
 const host=`maker${i}.pee261-fixture.test`,lab=`lab${i}.pee261-fixture.test`;
 const own=t.subject.knownIdentifiers[0]??null;
 // Fixture listing: one URL naming the job product's exact identifier (when it has one), one naming another model,
 // one without a model code, one outside the source's path scope.
 const paths=[own?`/p/${own}-specifications`:null,'/p/zz9999-other-model','/p/buying-guide','/news/launch'].filter(Boolean);
 const xml=`<?xml version="1.0"?><urlset>${paths.map(p=>`<url><loc>https://${host}${p}</loc></url>`).join('')}</urlset>`;
 const transport={async get(url){return url.endsWith('/robots.txt')?{status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /\n'}:
  {status:200,finalUrl:url,contentType:'application/xml',body:xml};}};
 const w=(id,h,channel)=>({watch:{id,categoryId:j.categoryId,host:h,channel,mechanism:'sitemap_delta',tier:'core',rightsClearedForMetadata:true,nextCheckAt:asOf,lastCheckAt:null,quietChecks:0,errors:0},
  sitemapPath:'/sitemap.xml',pathPrefix:'/p/',discoveryAccess:'public_metadata'});
 const pol=(sourceId,h)=>({sourceId,host:h,basis:'unknown',rightsDocumentId:null,rightsDocumentUrl:null,reviewedBy:null,reviewedAt:null,validUntil:null,
  permittedOperations:['metadata_discovery'],robots:'unknown',robotsCheckedAt:null,websiteTerms:'unknown',termsCheckedAt:null,commercialUseReviewed:false});
 const reg={schema:'pee220.registry.1',vocabulary:[],sources:[w('fixture_maker_index',host,'manufacturer_product_index'),w('fixture_lab_feed',lab,'professional_test_feed')],
  policies:[pol('fixture_maker_index',host),pol('fixture_lab_feed',lab)]};
 const d=await discoverForTarget261({target:t,registry:reg,researchPolicy:policy,asOf,mode:'offline_fixture',fixtureTransport:transport,store});
 const live=await discoverForTarget261({target:t,registry:reg,researchPolicy:policy,asOf,mode:'live',fixtureTransport:{async get(){throw Error('no network');}},store});
 pilot.push({jobId:j.jobId,categoryId:j.categoryId,criterion:j.criterion,gapKind:j.gapKind,identityState:t.subject.identityState,knownIdentifierCount:t.subject.knownIdentifiers.length,
  evidence:{statementKinds:t.evidence.statementKinds,channels:t.evidence.channels},
  channels:{selected:d.channels.selected,wrongLane:d.channels.wrongLane},
  fixtureCandidates:d.candidates.map(c=>({path:own?new URL(c.url).pathname.replace(own,'<job-identifier>'):new URL(c.url).pathname,attribution:c.attribution,jobId:c.jobId===j.jobId,
   source:c.registrySourceId,sourceIdentityRegistered:c.stages.sourceIdentityRegistered,genuineDiscovery:c.genuineDiscovery})),
  rejected:d.rejected.map(r=>({path:new URL(r.url).pathname,reason:r.reason})),
  outOfScopeDropped:paths.length-d.candidates.length-d.rejected.length,
  networkCalls:d.networkCalls,liveMode:live.status,liveNetworkCalls:live.networkCalls,checkpointObservations:d.observations.length});
}
const result={schema:'pee261.discovery-pilot.v1',runAt:asOf,policy:{policyId:policy.policyId,revision:policy.revision,market:policy.market,allowSourceReads:policy.allowSourceReads},
 input:'19 genuine Phase257 jobs; copy of pee-knowledge snapshot (outside Git); live store not opened',
 mapping:{jobs:jobs.length,mapped,mapFailures},
 operationalState:{registrySources:0,authorisedChannels:assessed.reduce((a,x)=>a+x.authorisedChannels,0),blockerCounts},
 assessed,pilot,
 totals:{fixtureCandidates:pilot.reduce((a,p)=>a+p.fixtureCandidates.length,0),genuineNewDiscoveries:0,
  correctlyAttributed:pilot.reduce((a,p)=>a+p.fixtureCandidates.filter(c=>c.jobId&&c.source==='fixture_maker_index').length,0),
  wrongProductRejected:pilot.reduce((a,p)=>a+p.rejected.filter(r=>r.reason==='url_names_other_model').length,0),
  alreadyObservedOnRealData:'not exercised: fixture hosts are fictional and no real host has a discovery policy (unit-tested on a temporary store)',
  liveNetworkCalls:pilot.reduce((a,p)=>a+p.networkCalls.live+p.liveNetworkCalls.live,0)},
 storeUnchanged:JSON.stringify(store.stats246())===statsBefore};
store.close();
const text=JSON.stringify(result,null,1)+'\n';if(out)writeFileSync(out,text);process.stdout.write(text);
if(mapped!==jobs.length||result.totals.liveNetworkCalls!==0||!result.storeUnchanged)process.exitCode=1;
