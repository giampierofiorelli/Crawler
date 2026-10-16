#!/usr/bin/env node
/** Phase264 — the single live, metadata-only discovery pilot (criteria sealed in evaluation/phase264/criteria.json).
 * - Authorisation: the owner-approved policy file (protected, outside Git), validated by MetadataPilotGate264, which is
 *   the only transport: Wikidata API lookups, then robots.txt and sitemap metadata on accepted candidate domains.
 * - Jobs: the genuine Phase257 jobs listed in the policy; store: a COPY of the verified snapshot (read only).
 * - No product page or article is retrieved, no value retained, no source registered, nothing ranked.
 * - Refuses to run twice: the first run is preserved unchanged.
 * Output: the full report privately (privateEvaluationDir249()/phase264, mode 0600); counts only in the repository.
 * Usage: node scripts/phase264-metadata-pilot.mjs [--policy FILE]
 */
import {writeFileSync,copyFileSync,mkdirSync,rmSync,readFileSync,existsSync} from 'node:fs';import {join,dirname} from 'node:path';import {homedir} from 'node:os';
import {setTimeout as sleep} from 'node:timers/promises';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {privateEvaluationDir249} from '../dist/src/phase249_retention_policy.js';
import {restrictedHttpsTransport} from '../dist/src/approved_web_reader.js';
import {discoveryTargetFromJob261} from '../dist/src/phase261_discovery_bridge.js';
import {loadMetadataPilotPolicy264,MetadataPilotGate264,wikidataSearchUrl264,wikidataEntitiesUrl264,exactMatches264,
 discoverDomain264,classifyForJob264,storeContext264,fileUsageLedger264} from '../dist/src/phase264_metadata_pilot.js';

const arg=n=>process.argv.includes(n)?process.argv[process.argv.indexOf(n)+1]:null;
const policyPath=arg('--policy')??join(homedir(),'.local','share','product-evidence-engine','metadata-pilot','policy.json');
// --rehearse DIR: offline rehearsal with a fixture transport (no network), outputs in DIR; never counts as the run.
const rehearse=arg('--rehearse');
const privDir=rehearse??join(privateEvaluationDir249(),'phase264');const privFile=join(privDir,'pilot-firstrun.json');
const pubFile=rehearse?join(rehearse,'public.json'):'evaluation/phase264/pilot-firstrun-public.json';
if(rehearse)for(const f of [privFile,pubFile])rmSync(f,{force:true});
if(existsSync(privFile)||existsSync(pubFile)){console.error('phase264: a first run already exists; it is preserved unchanged and the pilot is not repeated');process.exit(2);}
const startedAt=new Date();
const policy=loadMetadataPilotPolicy264(policyPath,startedAt);

const dir=join(homedir(),'.local','share','product-evidence-engine','arms264');mkdirSync(dir,{recursive:true});
const dbf=join(dir,'real-copy.sqlite');for(const x of ['','-wal','-shm'])rmSync(dbf+x,{force:true});
copyFileSync('/home/user/pee-knowledge/snapshot/pee246.sqlite',dbf);
const store=new KnowledgeStore246(dbf);const statsBefore=JSON.stringify(store.stats246());
const {observed,knownHosts}=storeContext264(store);
const market=JSON.parse(readFileSync('evaluation/phase257/policy-demo.json','utf8'));
const jobs=market.plans.flatMap(p=>p.jobs.map(j=>({jobId:j.jobId,categoryId:p.categoryId,gapKind:j.gapKind,productId:j.productId,criterion:j.criterion})))
 .filter(j=>policy.jobIds.includes(j.jobId));
if(jobs.length!==policy.jobIds.length)throw Error('phase264: policy names a job that is not a genuine Phase257 job');
const CATEGORY_TERMS={air_fryers:['fryer','air-fry','airfry'],coffee_machines:['coffee','espresso','bean-to-cup','barista'],
 blenders:['blender','blend'],kettles:['kettle'],toasters:['toaster']};
const targets=jobs.map(j=>{const t=discoveryTargetFromJob261(j,{market:market.policy?.market??'uk',store});
 const brand=j.productId?store.db.prepare('SELECT brand FROM products WHERE product_id=?').get(j.productId)?.brand??null:null;
 return {j,t,brand:brand&&String(brand).trim()?String(brand).trim():null};});

const fixture={async get(url){const u=new URL(url);const d=new Date().toUTCString();
 if(u.hostname==='www.wikidata.org'){const a=u.searchParams.get('action');
  if(a==='wbsearchentities'){const q=u.searchParams.get('search');return {status:200,finalUrl:url,contentType:'application/json; charset=utf-8',date:d,body:JSON.stringify({search:[{id:'Q'+(100+[...q].reduce((h,c)=>h*31+c.charCodeAt(0),7)%900000),label:q}]})};}
  const ids=u.searchParams.get('ids').split('|');return {status:200,finalUrl:url,contentType:'application/json',date:d,body:JSON.stringify({entities:Object.fromEntries(ids.map((id,i)=>[id,{claims:{P31:[{mainsnak:{datavalue:{value:{id:'Q4830453'}}}}],
   P856:[{rank:'normal',mainsnak:{snaktype:'value',datavalue:{value:`https://www.brand${i}.pee264-rehearsal.test/`}}}]}}]))})};}
 if(u.pathname==='/robots.txt')return {status:200,finalUrl:url,contentType:'text/plain',date:d,body:'User-agent: *\nAllow: /\n'};
 return {status:200,finalUrl:url,contentType:'application/xml',date:d,body:`<urlset><url><loc>https://${u.hostname}/air-fryer/af100</loc></url><url><loc>https://${u.hostname}/about</loc></url></urlset>`};}};
// Phase265: usage across every execution of this policy id is kept in a protected ledger (a rehearsal uses its own).
// The Phase264 first run (1 request) predates the ledger and is its seed.
const ledger=fileUsageLedger264(rehearse?join(rehearse,'usage.json'):join(dirname(policyPath),`usage-${policy.policyId}.json`),policy.policyId,
 rehearse?null:{requests:1,reason:'Phase264 first run 2026-10-16, before the ledger existed'});
const gate=new MetadataPilotGate264(policy,rehearse?fixture:restrictedHttpsTransport,{now:()=>new Date(),sleep:ms=>sleep(ms)},ledger);
const errors=[];
const wd=gate.transportFor('wikidata_entity_lookup');
const getJson=async url=>{const r=await wd.get(url,policy.userAgent,policy.maxResponseBytes);
 if(r.status!==200||!/^application\/json/i.test(r.contentType??''))throw Error('wikidata_response_rejected:'+r.status);
 const j=JSON.parse(r.body);if(j?.error)throw Error('wikidata_error:'+String(j.error.code).slice(0,40));return j;};

// 1. Wikidata: one search per distinct brand (sorted), then one batched entity read.
const brands=[...new Set(targets.map(x=>x.brand).filter(Boolean))].sort();
const matches=new Map();
for(const b of brands){if(gate.halted)break;try{matches.set(b,exactMatches264(b,await getJson(wikidataSearchUrl264(b))));}catch(e){errors.push({step:'wbsearchentities',brand:b,error:String(e.message).slice(0,120)});}}
const allIds=[...new Set([...matches.values()].flat())];let entities={entities:{}};
if(allIds.length&&!gate.halted){try{entities=await getJson(wikidataEntitiesUrl264(allIds.slice(0,50)));}catch(e){errors.push({step:'wbgetentities',error:String(e.message).slice(0,120)});}}
// Phase265: the gate recomputes each assessment from the Wikidata responses it received and alone accepts domains.
const assessments=brands.map(b=>matches.has(b)?gate.acceptBrandDomains(b):{brand:b,status:'unresolved',reasons:['lookup_not_completed'],entities:[],candidateDomains:[]});

// 2. Candidate official domains of unambiguous brands: robots, then sitemap metadata (Phase75 through the gate).
const asOf=new Date().toISOString().slice(0,10);
const domains=new Map();
for(const a of assessments.filter(a=>a.status==='unambiguous'))for(const d of a.candidateDomains){
 if(domains.has(d.host)){domains.get(d.host).brands.push(a.brand);continue;}
 const terms=[...new Set(targets.filter(x=>x.brand===a.brand).flatMap(x=>[...CATEGORY_TERMS[x.j.categoryId]??[],...x.t.subject.knownIdentifiers]))];
 const before=gate.log.length;let r;
 try{r=await discoverDomain264(gate,d.host,asOf,terms,knownHosts);}catch(e){r={host:d.host,knownHost:false,status:'blocked',reasons:['discovery_error:'+String(e.message).slice(0,80)],urls:[]};}
 const log=gate.log.slice(before);
 const stops=log.filter(l=>/^stop_(?:401|403|429)|retry_after/.test(l.outcome));
 const robots=log.find(l=>l.operation==='robots_fetch');const sitemapReqs=log.filter(l=>l.operation==='sitemap_metadata'&&l.status!==null);
 const resource=stops.length?'blocked':robots?.status===200&&!sitemapReqs.length?'blocked':
  r.status==='candidate_urls_found'||r.status==='nothing_relevant'?'accessible':'unavailable';
 domains.set(d.host,{host:d.host,brands:[a.brand],entity:d.entity,entityKind:d.kind,multipleCurrentValues:d.multipleCurrentValues,regional:d.regional,
  known:r.knownHost,resource,phase75:{status:r.status,reasons:r.reasons},requests:log.map(l=>({op:l.operation,path:l.path,status:l.status,bytes:l.bytes,outcome:l.outcome})),urls:r.urls});
}

// 3. Leads per job from that brand's domains (leads only; never evidence).
const seen=new Set();const perJob=[];
for(const x of targets){
 const ds=[...domains.values()].filter(d=>x.brand&&d.brands.includes(x.brand));
 const leads=[],rejected=[];
 for(const d of ds){const c=classifyForJob264(d.urls,x.t,{observed,knownHost:d.known,categoryTerms:CATEGORY_TERMS[x.j.categoryId]??[],seen});leads.push(...c.leads);rejected.push(...c.rejected);}
 perJob.push({jobId:x.j.jobId,categoryId:x.j.categoryId,gapKind:x.j.gapKind,brand:x.brand,brandStatus:x.brand?assessments.find(a=>a.brand===x.brand).status:'no_brand',
  knownIdentifiers:x.t.subject.knownIdentifiers.length,leads,rejected});
}
const statsAfter=JSON.stringify(store.stats246());store.close?.();
const finishedAt=new Date();const totals=gate.totals();
const count=(xs,f)=>xs.filter(f).length;const allLeads=perJob.flatMap(p=>p.leads),allRej=perJob.flatMap(p=>p.rejected);
const statusOf=o=>o.replace(/_retry_after$/,'');
const summary={
 brands:{jobs:targets.length,jobsWithoutBrand:count(targets,x=>!x.brand),distinctBrands:brands.length,
  unambiguous:count(assessments,a=>a.status==='unambiguous'),ambiguous:count(assessments,a=>a.status==='ambiguous'),unresolved:count(assessments,a=>a.status==='unresolved'),
  reasonCounts:Object.entries(assessments.flatMap(a=>a.reasons).reduce((m,r)=>(m[r.replace(/^\d+_/,'n_')]=(m[r.replace(/^\d+_/,'n_')]??0)+1,m),{})).sort()},
 domains:{candidates:domains.size,known:count([...domains.values()],d=>d.known),new:count([...domains.values()],d=>!d.known),
  accessible:count([...domains.values()],d=>d.resource==='accessible'),blocked:count([...domains.values()],d=>d.resource==='blocked'),unavailable:count([...domains.values()],d=>d.resource==='unavailable'),
  multipleCurrentValues:count([...domains.values()],d=>d.multipleCurrentValues),regional:count([...domains.values()],d=>d.regional),brandEntity:count([...domains.values()],d=>d.entityKind==='brand')},
 urls:{sitemapUrlsReturned:[...domains.values()].reduce((s,d)=>s+d.urls.length,0),
  leads:allLeads.length,exactIdentifier:count(allLeads,l=>l.attribution==='url_token_matches_known_identifier'),
  attributionUnknown:count(allLeads,l=>l.attribution!=='url_token_matches_known_identifier'),
  categoryIrrelevant:count(allLeads,l=>!l.categoryRelevant),otherModelRejected:count(allRej,r=>r.reason==='url_names_other_model'),
  alreadyObserved:count(allRej,r=>r.reason==='already_observed'),duplicate:count(allRej,r=>r.reason==='duplicate'),
  jobsWithExactIdentifierLead:count(perJob,p=>p.leads.some(l=>l.attribution==='url_token_matches_known_identifier'))},
 network:{requests:totals.requests,bytes:totals.bytes,maxResponseBytesSeen:Math.max(0,...gate.log.map(l=>l.bytes)),
  wikidataRequests:count(gate.log,l=>l.operation==='wikidata_entity_lookup'&&l.status!==null),robotsRequests:count(gate.log,l=>l.operation==='robots_fetch'&&l.status!==null),
  sitemapRequests:count(gate.log,l=>l.operation==='sitemap_metadata'&&l.status!==null),
  statusCounts:Object.entries(gate.log.filter(l=>l.status!==null).reduce((m,l)=>(m[l.status]=(m[l.status]??0)+1,m),{})).sort(),
  rateLimitResponses:count(gate.log,l=>l.status===429||/retry_after|maxlag/.test(l.outcome)),
  serverErrors:count(gate.log,l=>(l.status??0)>=500),forbidden:count(gate.log,l=>l.status===403),networkErrors:count(gate.log,l=>l.outcome==='network_error'),
  gateRefusals:Object.entries(gate.log.filter(l=>l.status===null&&l.outcome!=='network_error').reduce((m,l)=>(m[l.outcome.replace(/:.*/,'')]=(m[l.outcome.replace(/:.*/,'')]??0)+1,m),{})).sort(),
  pilotHalted:totals.halted,hostsHalted:Object.values(totals.haltedHosts).map(statusOf).sort(),scriptErrors:errors.length,
  minSpacingMs:gate.log.filter(l=>l.status!==null||l.outcome==='network_error').map(l=>Date.parse(l.at)).reduce((a,t,i,xs)=>i?Math.min(a,t-xs[i-1]):a,Infinity)},
 integrity:{withinRequestBudget:totals.requests<=60,withinByteCap:gate.log.every(l=>l.bytes<=2000000),productPagesRetrieved:0,valuesRetained:0,sourcesRegistered:0,
  retriesAfterStop:0,storeUnchanged:statsBefore===statsAfter,policyRevision:policy.revision,policyExpiresAt:policy.expiresAt,
  durationSeconds:Math.round((finishedAt-startedAt)/1000)}};
summary.network.minSpacingMs=Number.isFinite(summary.network.minSpacingMs)?summary.network.minSpacingMs:null;

mkdirSync(privDir,{recursive:true,mode:0o700});
writeFileSync(privFile,JSON.stringify({schema:'pee264.pilot-firstrun.v1',private:true,startedAt:startedAt.toISOString(),finishedAt:finishedAt.toISOString(),
 policyId:policy.policyId,summary,assessments,domains:[...domains.values()],perJob,requestLog:gate.log,errors},null,1)+'\n',{mode:0o600});
mkdirSync('evaluation/phase264',{recursive:true});
writeFileSync(pubFile,JSON.stringify({schema:'pee264.pilot-firstrun-public.v1',note:'counts and reason codes only; URLs, brands, hosts and entity ids stay in the private report',
 run:{date:startedAt.toISOString().slice(0,10),firstRun:true},summary},null,1)+'\n');
console.log(JSON.stringify(summary,null,1));
