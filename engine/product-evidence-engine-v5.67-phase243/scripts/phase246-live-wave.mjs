#!/usr/bin/env node
/** Phase246 bounded live research wave: robots-checked fetches through the engine transport with explicit,
 * persistent budgets (total requests, per-host requests, elapsed seconds, bytes), per-host politeness delay,
 * and stop-on-restriction (403/429/robots refusal suspends the host; nothing is retried or bypassed).
 *
 *  node scripts/phase246-live-wave.mjs <command> --state STATE.json [--raw DIR] ...
 *   init --budget '{"maxRequests":80,"maxPerHost":25,"maxSeconds":900,"maxBytes":60000000}'
 *   robots --hosts h1,h2           fetch robots.txt once per host (counts against the budget)
 *   sitemap --url U --match RE [--limit N] [--category C]   list matching URLs from one sitemap as discovery leads
 *   links --url U --match RE [--limit N] [--category C]     same-host links from one listing page as discovery leads
 *   leads --urls U1,U2 --category C --query Q   offline: record leads from a search-result list
 *   curate --from BUCKET --category C --match RE [--exclude RE]   offline operator assignment of leads to a category
 *   plan --category C --budget N   Phase243 budgeted choice of leads to screen (cheap_screen actions only)
 *   fetch --items tag=url,... --role R --category C --source-type T
 *   observations --out FILE        build Phase246 observation records from fetched raw bytes (runs the frozen extractor)
 *   report                         budgets, per-host outcomes, timings, resource use
 * Raw bytes are written only to --raw (an operator scratch directory, never the repository).
 * Roles: regression | heldout_eval | operational | method_reference.
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {homedir} from 'node:os';
import {join,resolve} from 'node:path';
import {restrictedHttpsTransport as T,RESEARCH_AGENT,PAGE_MAX_BYTES} from '../dist/src/approved_web_reader.js';
import {publicRobotsDecision223} from '../dist/src/phase223_public_metadata_access.js';
import {planBudgetedCategoryWave243} from '../dist/src/phase243_budgeted_category_search.js';
import {readProtectedPolicyFile257,validateWavePolicy257,waveBudgetWithinPolicy257,waveRequestGate257} from '../dist/src/phase257_research_planning.js';
import {readdirSync,statSync} from 'node:fs';

const [cmd,...rest]=process.argv.slice(2);
const F={};for(let i=0;i<rest.length;i++){if(rest[i].startsWith('--')){const k=rest[i].slice(2);F[k]=rest[i+1]&&!rest[i+1].startsWith('--')?rest[++i]:true;}}
if(!F.state){console.error('--state required');process.exit(2);}
const statePath=resolve(F.state);const rawDir=F.raw?resolve(F.raw):null;
const sha=b=>createHash('sha256').update(b).digest('hex');
const now=()=>new Date().toISOString();
let S=existsSync(statePath)?JSON.parse(readFileSync(statePath,'utf8')):null;
const save=()=>writeFileSync(statePath,JSON.stringify(S,null,1));
const POLITENESS_MS=4000;
// Phase268: an owner budget may raise (never lower) the per-host delay and cap the number of distinct hosts.
// S87a: a host's delay is at least the policy's, its robots Crawl-delay (for this agent or *), and it doubles after a server
// error or timeout (capped at 120 s): adaptive, per host, never shortened below the policy
const politenessMs=(host)=>{const base=Math.max(POLITENESS_MS,Number(S?.budget?.politenessMs??0));if(!host)return base;
 const cd=S?.robots?.[host]?.crawlDelayMs??0;const back=S?.hosts?.[host]?.backoffMs??0;return Math.min(120000,Math.max(base,cd,back));};
function crawlDelayMs(body){if(!body)return 0;let applies=false,ms=0;
 for(const raw of String(body).split(/\r?\n/)){const line=raw.replace(/#.*/,'').trim();if(!line)continue;const [k,...v]=line.split(':');const key=k.trim().toLowerCase(),val=v.join(':').trim();
  if(key==='user-agent'){applies=val==='*'||RESEARCH_AGENT.toLowerCase().includes(val.toLowerCase());continue;}
  if(applies&&key==='crawl-delay'){const n=Number(val);if(Number.isFinite(n)&&n>0)ms=Math.max(ms,Math.min(120,n)*1000);}}
 return ms;}

// S85 (owner: the policy must really be enforced before any further live acquisition). The policy file is read through
// the protected reader (regular file outside any Git tree, owned by this user, not group/other-writable), validated, and
// its digest kept; every request re-reads it and stops if it is missing, changed or expired, or if this wave plus the
// requests earlier waves recorded under the same policy id would exceed the policy. Without a policy, no request is made.
const policyDigest=p=>{try{return sha(readFileSync(p));}catch{return null;}};
const PRIOR_RECENT=[];
function priorSpentFor(policyId,self){
 const roots=[join(homedir(),'.local/share/product-evidence-engine/private-eval'),process.env.PEE_PRIVATE_EVAL_DIR,'/home/user/pee-knowledge/private-eval'].filter(Boolean);
 let n=0;const seen=new Set();
 const walk=d=>{let es;try{es=readdirSync(d,{withFileTypes:true});}catch{return;}
  for(const e of es){const f=join(d,e.name);if(e.isDirectory()){walk(f);continue;}if(!e.name.endsWith('.json')||resolve(f)===self)continue;
   try{if(statSync(f).size>50_000_000)continue;const t=readFileSync(f,'utf8');if(!t.includes(policyId)||!t.includes('pee246.live-wave.v1'))continue;
    const j=JSON.parse(t);const k=j.startedAt+'|'+(j.requests?.length??0);
    if(j.schema==='pee246.live-wave.v1'&&j.policy?.policyId===policyId&&!seen.has(k)){seen.add(k);n+=j.requests?.length??0;
     // S87a: a standing policy counts rolling windows, so earlier requests travel with their time and host
     for(const q of j.requests??[])PRIOR_RECENT.push({host:q.host,at:q.at});}}catch{}}};
 for(const r of roots)walk(r);return n;
}
if(cmd==='init'){
 if(S)throw Error('state exists; refusing to reset budgets');
 const budget=JSON.parse(F.budget);let pol={};
 if(F.policy){const path=resolve(F.policy);const policy=validateWavePolicy257(readProtectedPolicyFile257(path));
  const bad=waveBudgetWithinPolicy257(budget,policy);if(bad.length)throw Error('wave budget exceeds the owner policy: '+bad.join(','));
  budget.politenessMs=Math.max(Number(budget.politenessMs??0),policy.budget.politenessMs);
  if(policy.budget.maxHosts!==undefined)budget.maxHosts=Math.min(Number(budget.maxHosts??policy.budget.maxHosts),policy.budget.maxHosts);
  pol={policy,policyPath:path,policyDigest:policyDigest(path)};}
 else console.error('no --policy: this state can be used offline only; every network command will refuse');
 S={schema:'pee246.live-wave.v1',startedAt:now(),agent:RESEARCH_AGENT,budget,...pol,requests:[],hosts:{},robots:{},leads:[],plans:[],pages:[],stopReasons:[]};
 save();console.log(JSON.stringify(S.budget));process.exit(0);
}
if(!S)throw Error('run init first');
const NETWORK=['robots','sitemap','links','fetch'].includes(cmd);
let PRIOR_SPENT=0;
if(NETWORK){
 if(!S.policy||!S.policyPath)throw Error('no owner policy in this state: network commands refuse (init with --policy)');
 validateWavePolicy257(readProtectedPolicyFile257(S.policyPath)); // re-validated now: expiry, shape, protected path
 PRIOR_SPENT=priorSpentFor(S.policy.policyId,statePath);
 console.error(`policy ${S.policy.policyId}: ${PRIOR_SPENT} requests recorded by earlier waves, ${S.requests.length} by this one, limit ${S.policy.budget.maxRequests}`);
}

const elapsed=()=>(Date.now()-Date.parse(S.startedAt))/1000;
const bytesUsed=()=>S.requests.reduce((a,r)=>a+(r.bytes??0),0);
function budgetBlock(host){
 const b=S.budget;
 if(S.requests.length>=b.maxRequests)return 'total_request_budget_exhausted';
 if(S.requests.filter(r=>r.host===host).length>=b.maxPerHost)return 'per_host_budget_exhausted';
 if(b.maxHosts&&!S.requests.some(r=>r.host===host)&&new Set(S.requests.map(r=>r.host.replace(/^www\./,''))).size>=b.maxHosts)return 'distinct_host_budget_exhausted';
 const ra=S.hosts[host]?.retryAfterUntil;if(ra&&Date.now()<Date.parse(ra))return 'retry_after_not_elapsed';
 if(elapsed()>=b.maxSeconds)return 'elapsed_time_budget_exhausted';
 if(bytesUsed()>=b.maxBytes)return 'byte_budget_exhausted';
 if(S.hosts[host]?.suspended)return 'host_suspended:'+S.hosts[host].suspended;
 return null;
}
async function polite(host){
 const last=S.hosts[host]?.lastAt?Date.parse(S.hosts[host].lastAt):0;const d=politenessMs(host)-(Date.now()-last);
 if(d>0)await new Promise(r=>setTimeout(r,d));
}
/** Same-site redirect policy: https only, same host or its www./bare twin, at most 3 hops. Each hop is a
 * separate, counted, robots-checked request; anything else stops with the redirect recorded. */
const sameSite=(a,b)=>a.replace(/^www\./,'')===b.replace(/^www\./,'');
async function requestFollowing(url,purpose,maxBytes=PAGE_MAX_BYTES){
 let cur=url;const chain=[];
 for(let hop=0;hop<=3;hop++){
  const x=await request(cur,purpose,maxBytes);
  const loc=x.rec?.redirectLocation;
  if(!loc)return {...x,finalUrl:cur,redirects:chain};
  let next;try{next=new URL(loc,cur);}catch{return {...x,finalUrl:cur,redirects:chain};}
  chain.push({from:cur,to:next.href,status:x.rec.redirectStatus});
  // Phase268: a redirect to the same URL (typically a cookie or anti-bot step) is an access control; never repeated.
  if(next.href===cur){S.stopReasons.push({at:now(),url:cur,reason:'self_redirect_not_repeated'});save();return {blocked:'self_redirect',finalUrl:cur,redirects:chain};}
  if(next.protocol!=='https:'||!sameSite(next.host,new URL(cur).host)){S.stopReasons.push({at:now(),url:cur,reason:'cross_site_redirect_not_followed:'+next.host});save();return {...x,finalUrl:cur,redirects:chain};}
  if(next.host!==new URL(cur).host){const d=await allowed(next.href);if(d!=='allow')return {...x,finalUrl:cur,redirects:chain,robots:d};}
  cur=next.href;
 }
 return {blocked:'too_many_redirects',finalUrl:cur,redirects:chain};
}
async function request(url,purpose,maxBytes=PAGE_MAX_BYTES){
 const host=new URL(url).host;
 const block=waveRequestGate257({policy:S.policy??null,policyDigestAtInit:S.policyDigest??null,policyDigestNow:S.policyPath?policyDigest(S.policyPath):null,
  priorSpent:PRIOR_SPENT,requests:S.requests,host,now:new Date(),priorRecent:PRIOR_RECENT})??budgetBlock(host);
 if(block){S.stopReasons.push({at:now(),url,reason:block});save();return {blocked:block};}
 await polite(host);
 const t0=Date.now();let r,err=null;
 let redirect=null;
 try{r=await T.get(url,RESEARCH_AGENT,maxBytes);}catch(e){err=(e.code??'')+' '+e.message;if(e.redirectLocation)redirect={status:e.redirectStatus,location:e.redirectLocation};}
 const rec={at:now(),host,url,purpose,status:r?.status??redirect?.status??null,bytes:r?.rawBytes?.length??0,ms:Date.now()-t0,error:err,
  ...(redirect?{redirectStatus:redirect.status,redirectLocation:redirect.location}:{})};
 S.requests.push(rec);
 const h=S.hosts[host]??={ok:0,restricted:0,errors:0,suspended:null,lastAt:null};h.lastAt=rec.at;
 if(r&&r.status>=200&&r.status<300)h.ok++;
 else if(r&&(r.status===401||r.status===403||r.status===429)){h.restricted++;h.suspended=`http_${r.status}`;S.stopReasons.push({at:rec.at,url,reason:`host_suspended_after_http_${r.status}`});}
 else if(!redirect)h.errors++;
 // Phase268: any Retry-After is honoured (suspension for 429; a dated wait otherwise); it is never shortened.
 if(r?.retryAfter){h.retryAfter=r.retryAfter;const sec=/^\d+$/.test(r.retryAfter)?Number(r.retryAfter)*1000:Date.parse(r.retryAfter)-Date.now();
  h.retryAfterUntil=new Date(Date.now()+(Number.isFinite(sec)&&sec>0?sec:3600_000)).toISOString();S.stopReasons.push({at:rec.at,url,reason:'retry_after:'+r.retryAfter});}
 if(h.errors>=3&&!h.suspended){h.suspended='repeated_errors';S.stopReasons.push({at:rec.at,url,reason:'host_suspended_after_repeated_errors'});}
 // S87a: adaptive back-off after a server error or a transport failure; reset by a success
 if((r&&r.status>=500)||(!r&&!redirect))h.backoffMs=Math.min(120000,Math.max(10000,(h.backoffMs??0)*2));else if(r&&r.status<300)h.backoffMs=0;
 save();return {r,rec};
}
async function robotsFor(host){
 if(S.robots[host])return S.robots[host];
 const x=await requestFollowing(`https://${host}/robots.txt`,'robots',512000);
 if(x.blocked)return null;
 // RFC 9309 2.3.1.2: robots.txt redirects may be followed; only a same-site chain ending at /robots.txt is accepted here.
 const endedAtRobots=x.redirects?.length&&new URL(x.finalUrl).pathname==='/robots.txt'&&sameSite(new URL(x.finalUrl).host,host);
 S.robots[host]={status:x.r?.status??null,finalUrl:endedAtRobots&&x.r?`https://${host}/robots.txt`:(x.r?.finalUrl??null),contentType:x.r?.contentType??null,
  fetchedAt:x.rec?.at??now(),body:x.r?x.r.body:null,error:x.rec?.error??x.blocked??null,redirects:x.redirects??[],
  crawlDelayMs:x.r&&x.r.status===200?crawlDelayMs(x.r.body):0};save();
 return S.robots[host];
}
async function allowed(url){
 const host=new URL(url).host;const rb=await robotsFor(host);
 if(!rb)return 'budget_blocked';
 if(rb.body===null)return 'robots_unavailable';
 const d=publicRobotsDecision223({status:rb.status,finalUrl:rb.finalUrl,contentType:rb.contentType,body:rb.body},url);
 if(d!=='allow'){const h=S.hosts[host]??={ok:0,restricted:0,errors:0,suspended:null,lastAt:null};h.suspended='robots_'+d;
  S.stopReasons.push({at:now(),url,reason:'robots_'+d});save();}
 return d;
}

switch(cmd){
 case 'robots':for(const h of String(F.hosts).split(',')){const r=await robotsFor(h);console.log(h,r?r.status:'blocked',r?.error??'');}break;
 case 'sitemap':{
  const d=await allowed(F.url);if(d!=='allow'){console.log('sitemap not allowed:',d);break;}
  const x=await request(F.url,'sitemap',20_000_000);if(x.blocked||!x.r||x.r.status!==200){console.log('sitemap failed',x.blocked??x.r?.status??x.rec?.error);break;}
  let body=Buffer.from(x.r.rawBytes);if(F.url.endsWith('.gz')||(body[0]===0x1f&&body[1]===0x8b))body=gunzipSync(body);
  const locs=[...body.toString('utf8').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m=>m[1].replace(/&amp;/g,'&'));
  const re=new RegExp(F.match,'i');const hits=locs.filter(u=>re.test(u)).slice(0,Number(F.limit??200));
  for(const u of hits)if(!S.leads.some(l=>l.url===u))S.leads.push({url:u,category:F.category??null,from:F.url,discoveredAt:now()});
  save();console.log(`sitemap ${F.url}: ${locs.length} locs, ${hits.length} matched`);for(const u of hits.slice(0,60))console.log(' ',u);break;}
 case 'links':{
  // Discovery from one listing page: same-host links matching --match become leads (page bytes are not kept).
  const d=await allowed(F.url);if(d!=='allow'){console.log('listing not allowed:',d);break;}
  const x=await request(F.url,'listing');if(x.blocked||!x.r||x.r.status!==200){console.log('listing failed',x.blocked??x.r?.status??x.rec?.error);break;}
  const base=new URL(F.url);const re=new RegExp(F.match,'i');
  const hrefs=[...Buffer.from(x.r.rawBytes).toString('utf8').matchAll(/href="([^"#]+)"/g)].map(m=>{try{const u=new URL(m[1].replace(/&amp;/g,'&'),base);u.search='';return u.href;}catch{return null;}})
   .filter(u=>u&&new URL(u).host===base.host&&re.test(u));
  const hits=[...new Set(hrefs)].slice(0,Number(F.limit??100));
  for(const u of hits)if(!S.leads.some(l=>l.url===u))S.leads.push({url:u,category:F.category??null,from:F.url,discoveredAt:now()});
  save();console.log(`listing ${F.url}: ${hits.length} matched`);for(const u of hits)console.log(' ',u);break;}
 case 'leads':{
  // Offline: record leads found through a search engine result list (query recorded; no site request made).
  let n=0;for(const u of String(F.urls).split(','))if(!S.leads.some(l=>l.url===u&&l.category===F.category)){S.leads.push({url:u,category:F.category,from:'search:'+F.query,discoveredAt:now()});n++;}
  save();console.log(F.category,'+',n);break;}
 case 'curate':{
  // Operator curation without network: assign leads from one bucket to a category by URL pattern, excluding
  // parts/consumables. Recorded in state so the selection is auditable.
  const inc=new RegExp(F.match,'i'),exc=F.exclude?new RegExp(F.exclude,'i'):null;let n=0;
  for(const l of S.leads)if(l.category===F.from&&inc.test(l.url)&&!(exc&&exc.test(l.url))){S.leads.push({...l,category:F.category,curatedFrom:F.from});n++;}
  S.curation=[...(S.curation??[]),{at:now(),from:F.from,category:F.category,match:F.match,exclude:F.exclude??null,added:n}];
  save();console.log(F.category,'+',n);break;}
 case 'plan':{
  // Phase243: leads become discovery stubs; the planner spends a small effort budget on cheap screens and
  // keeps every unscreened lead in the population (no exclusion). Family = host, so one host cannot fill the wave.
  const cat=F.category;const leads=S.leads.filter(l=>l.category===cat&&!S.hosts[new URL(l.url).host]?.suspended);
  const id=u=>'lead_'+sha(u).slice(0,16);
  const fam=u=>new URL(u).host.replace(/[^a-z0-9]+/g,'_');
  const cands=leads.map(l=>({product:{id:id(l.url),categoryId:cat,market:'uk',familyId:fam(l.url),stage:'discovery_stub',editorialAppearances:[],
   officialProductIdentityConfirmed:false,marketListingConfirmed:false,novelVerifiedTechnicalFeature:false,explicitNeedTriggered:false,
   validatedNicheFit:false,verifiedDiscontinued:false},researchState:'unseen',signals:[],suspendedUnderScope:null,reviewedHighPotential:false}));
  const ctx={categoryId:cat,market:'uk',scopeKey:cat+'_uk_general',asOf:now().replace(/\.\d+Z$/,'Z'),waveOrdinal:1,explicitUserNeedProductIds:[],
   changedSourceRevisionProductIds:[],recoveryMode:'normal',population:{categoryId:cat,market:'uk',enrichmentBudget:0,independentDiscoveryPasses:1,
   discoveredNewPlausibleInRecentPasses:leads.length,reviewedFamilyIds:[...new Set(leads.map(l=>fam(l.url)))],demandMode:'general_launch_seed'},
   policy:{version:'pee246_wave1',mode:'lean_bootstrap',effortBudget:Number(F.budget??6),unitCost:{identity:1,cheap_screen:1,deep_review:4,revisit:2},
   minimumCredibleCandidateCount:2,reservedTailActionPercent:20,auditSuspendedMaxPerWave:1,auditEveryNWaves:5}};
  const w=planBudgetedCategoryWave243(ctx,cands);
  const chosen=w.choices.map(c=>leads.find(l=>id(l.url)===c.productId).url);
  S.plans.push({category:cat,at:now(),leads:leads.length,effortBudget:ctx.policy.effortBudget,spent:w.spentEffortUnits,chosen,
   marketCoverageCertified:w.marketCoverageCertified,rankingAuthorized:w.rankingAuthorized,discoveryMustContinue:w.discoveryMustContinue});
  save();console.log(JSON.stringify(S.plans.at(-1),null,1));break;}
 case 'fetch':{
  if(!rawDir)throw Error('--raw required');mkdirSync(rawDir,{recursive:true});
  for(const it of String(F.items).split(',')){
   const i=it.indexOf('=');const tag=it.slice(0,i),url=it.slice(i+1);
   if(S.pages.some(p=>p.tag===tag))throw Error('duplicate tag '+tag);
   const d=await allowed(url);
   if(d!=='allow'){S.pages.push({tag,url,role:F.role,category:F.category??null,sourceType:F['source-type']??'unknown',outcome:'not_fetched_'+d});save();console.log(tag,'NOT FETCHED',d);continue;}
   const x=await requestFollowing(url,F.role);
   if(x.blocked){S.pages.push({tag,url,role:F.role,category:F.category??null,sourceType:F['source-type']??'unknown',outcome:'not_fetched_'+x.blocked});save();console.log(tag,'BLOCKED',x.blocked);continue;}
   const ok=x.r&&x.r.status===200;
   const row={tag,url,finalUrl:x.finalUrl,redirects:x.redirects,role:F.role,category:F.category??null,sourceType:F['source-type']??'unknown',outcome:ok?'fetched':'http_'+(x.r?.status??'error'),
    httpStatus:x.r?.status??null,contentType:x.r?.contentType??null,bytes:x.rec.bytes,ms:x.rec.ms,fetchedAt:x.rec.at,sha256:x.r?sha(x.r.rawBytes):null};
   if(ok)writeFileSync(join(rawDir,tag+'.html'),x.r.rawBytes);
   // S87a: the private page archive (content-addressed, outside any repository), only without a machine-readable reservation
   if(ok&&S.policy?.pageArchive?.enabled){const {detectReservations249}=await import('../dist/src/phase249_retention_policy.js');
    const h=new URL(x.finalUrl??url).host;const rb=S.robots[h]?.status===200?S.robots[h].body??null:null;const rs=detectReservations249(rb,Buffer.from(x.r.rawBytes).toString('utf8'));
    const reserved=rs.contentSignalAiInput==='no'||rs.tdmReservation||rs.noaiMeta;
    if(reserved)row.archive='withheld_reservation';else{const A=join(homedir(),'.local/share/product-evidence-engine/archive/pages');mkdirSync(A,{recursive:true});
     const f=join(A,row.sha256+'.html');if(!existsSync(f))writeFileSync(f,x.r.rawBytes);
     writeFileSync(join(A,'index.jsonl'),JSON.stringify({sha256:row.sha256,url:row.finalUrl??url,fetchedAt:row.fetchedAt,policyId:S.policy.policyId,reservations:rs})+'\n',{flag:'a'});row.archive='archived';}}
   S.pages.push(row);save();console.log(tag,row.outcome,row.bytes,row.ms+'ms',row.sha256?.slice(0,12));
  }
  break;}
 case 'observations':{
  const {extractSpecifications245,SPEC_EXTRACTOR_VERSION}=await import('../dist/src/phase245_spec_extraction.js');
  const {detectReservations249}=await import('../dist/src/phase249_retention_policy.js');
  // Phase265: the Phase225/226/227 test-result probe runs on the same transient bytes; only its leads travel on.
  const {testLeadsFromHtml265,testDocumentSubject268}=await import('../dist/src/phase265_test_measurements.js');
  // Phase270: qualitative outcome codes travel with the observation; the store keeps them only under the pee249 v2 amendment.
  const {qualitativeObservations269}=await import('../dist/src/phase269_qualitative_observations.js');
  // Step 1D-A2 (--shadow-semantics, off by default): the same transient bytes are also read through the semantic-document
  // contract with the category's extraction plan (compiled read-only from the live store). Only counts go to the yield;
  // the observation that is ingested is unchanged, and table-reader leads are checked against the persistence screen.
  let SHADOW=null;
  if(F['shadow-semantics']){const st=await import('../dist/src/phase246_knowledge_store.js');const reg=await import('../dist/src/phase248_category_registry.js');
   const sem=await import('../dist/src/document_semantics.js');const pl=await import('../dist/src/phase272_extraction_plan.js');const tl=await import('../dist/src/phase265_test_measurements.js');
   const live=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');
   SHADOW={sem,pl,tl,reg,store:new st.KnowledgeStore246(live)};}
  const out=[];
  // S85: a refusal, an unreadable robots file and a temporary error stay distinct statuses (were all 'forbidden')
  const ACCESS={robots_deny:'robots_disallowed',robots_unknown:'robots_unknown',http_429:'rate_limited',http_401:'forbidden',http_403:'forbidden',repeated_errors:'error'};
  for(const [host,h] of Object.entries(S.hosts))if(h.suspended)out.push({access:{host,outcome:ACCESS[h.suspended]??'error',at:h.lastAt??now()}});
  for(const p of S.pages){
   if(p.outcome!=='fetched'||!rawDir)continue;const f=join(rawDir,p.tag+'.html');if(!existsSync(f))continue;
   const b=readFileSync(f);if(sha(b)!==p.sha256)continue; // never trust bytes that do not match the receipt
   const host=new URL(p.finalUrl??p.url).host;const t0=Date.now();
   // Phase268: a test document's product is the reviewed subject, not its headline.
   const x=testDocumentSubject268(extractSpecifications245(b.toString('utf8'),p.finalUrl??p.url),p.sourceType);
   // Phase249: machine-readable reservations (robots Content-Signal, TDM reservation, noai) travel with the observation.
   const robotsBody=S.robots[host]?.status===200?S.robots[host].body??null:null;
   const reservations=detectReservations249(robotsBody,b.toString('utf8'));
   out.push({observation:{source:{sourceId:'src_'+host.replace(/[^a-z0-9]+/gi,'_'),host,sourceType:p.sourceType,sourceTypeBasis:'operator_asserted'},
    url:p.finalUrl??p.url,sha256:p.sha256,bytes:p.bytes,httpStatus:p.httpStatus,fetchedAt:p.fetchedAt,runId:(F.run??'phase246_wave1')+'_'+p.role,
    extractorVersion:SPEC_EXTRACTOR_VERSION,extraction:p.role==='method_reference'?null:x,categoryHypotheses:p.category&&p.category!=='mixed'?[p.category]:[],reservations,
    testLeads:testLeadsFromHtml265(b.toString('utf8'),p.finalUrl??p.url,p.sha256,p.role==='method_reference'?null:x,{category:p.category}),
    ...(p.role==='method_reference'?{}:{qualitative270:{readerVersion:'phase270-qual-1',observations:qualitativeObservations269(b.toString('utf8')).observations}})},
    yield:{tag:p.tag,role:p.role,mainProduct:x.mainProduct.name,ambiguousMain:x.mainProduct.ambiguous,declarations:x.facts.length,
     heldBack:x.ambiguous.length,variants:x.variants.length,extractMs:Date.now()-t0}});
   out.at(-1).yield.testLeads=out.at(-1).observation.testLeads.probe.candidates.length;
   if(SHADOW&&p.role!=='method_reference'&&SHADOW.reg.CATEGORY_REGISTRY250.some(e=>e.id===p.category)){const html=b.toString('utf8'),u=p.finalUrl??p.url;
    const d=SHADOW.sem.readDocumentSemantics1D2(html,u);const plan=SHADOW.pl.compileExtractionPlan272(SHADOW.store,p.category,SHADOW.reg.CATEGORY_REGISTRY250.find(e=>e.id===p.category)?.aliases??[],[]);
    const c=SHADOW.tl.testLeadsFromHtml265(html,u,p.sha256,x,{category:p.category,plan,semantics:d}).probe.candidates.filter(k=>k.methodCue==='structured_table_measurement_term');
    out.at(-1).yield.shadowSemantics={pageType:d.pageType.kind,principalFromStructure:!!d.principal.name,conflicts:d.principal.conflicts.length,tables:d.tables.length,
     testTables:d.tables.filter(t=>t.context==='test').length,alignedBlocks:d.alignment.aligned,blocks:d.alignment.blocks,tableReaderLeads:c.length,
     persistenceAdmitted:c.filter(k=>SHADOW.tl.screenTestLead265(k,{url:u,sha256:p.sha256}).ok).length,ms:d.stats.milliseconds};}
  }
  if(SHADOW)SHADOW.store.close();
  writeFileSync(resolve(F.out),JSON.stringify(out));
  for(const o of out)if(o.yield)console.log(JSON.stringify(o.yield));
  break;}
 case 'report':{
  const per={};for(const r of S.requests){const p=per[r.host]??={requests:0,bytes:0,ms:0,statuses:{}};p.requests++;p.bytes+=r.bytes;p.ms+=r.ms;p.statuses[r.status??r.error]=(p.statuses[r.status??r.error]??0)+1;}
  const mem=process.memoryUsage();
  console.log(JSON.stringify({budget:S.budget,used:{requests:S.requests.length,bytes:bytesUsed(),elapsedSeconds:Math.round(elapsed()),
   networkMs:S.requests.reduce((a,r)=>a+r.ms,0)},perHost:per,hostState:S.hosts,stopReasons:S.stopReasons,plans:S.plans,
   pages:S.pages.map(({tag,url,role,category,sourceType,outcome,bytes,ms,sha256})=>({tag,url,role,category,sourceType,outcome,bytes,ms,sha256})),
   leads:S.leads.length,reportProcessRssMb:Math.round(mem.rss/1048576)},null,1));
  break;}
 default:console.error('unknown command');process.exitCode=2;
}
