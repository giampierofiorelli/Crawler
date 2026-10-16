import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,chmodSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {researchJobFromGap182} from '../src/phase182_gap_research_orchestrator.js';
import {discoveryTargetFromJob261} from '../src/phase261_discovery_bridge.js';
import type {SourceTransport,SourceResponse} from '../src/approved_web_reader.js';
import {validateMetadataPilotPolicy264,loadMetadataPilotPolicy264,MetadataPilotGate264,assessBrand264,exactMatches264,wikidataSearchUrl264,wikidataEntitiesUrl264,
 discoverDomain264,classifyForJob264,type MetadataPilotPolicy264} from '../src/phase264_metadata_pilot.js';

// Phase264: gate, policy and Wikidata assessment on fixtures only (no network in tests). Hosts are fictional.
const T0=Date.parse('2026-10-16T12:00:00.000Z');
const policy=(o:Partial<MetadataPilotPolicy264>={}):MetadataPilotPolicy264=>({schema:'pee264.metadata-discovery-policy.v1',policyId:'pilot_test',revision:1,
 issuedAt:'2026-10-16T11:00:00.000Z',expiresAt:'2026-10-23T11:00:00.000Z',authorisation:'test fixture authorisation, not an owner decision',
 operations:['wikidata_entity_lookup','robots_fetch','sitemap_metadata'],jobIds:['research_'+'a'.repeat(32)],maxRequests:6,maxRequestsPerHost:3,minIntervalMs:1000,
 maxResponseBytes:2_000_000,maxClockSkewSeconds:300,userAgent:'PEEMetadataPilot/264 (https://github.com/example/project; research bot) node/22',
 prohibited:{pageRetrieval:true,factRetention:true,sourceRegistration:true,evidenceAdmission:true,ranking:true},...o});
function clock(){let t=T0;const waits:number[]=[];return {waits,advance:(ms:number)=>{t+=ms;},now:()=>new Date(t),sleep:async(ms:number)=>{waits.push(ms);t+=ms;}};}
const ok=(url:string,body:string,extra:Partial<SourceResponse>={}):SourceResponse=>({status:200,finalUrl:url,contentType:url.endsWith('.txt')?'text/plain':url.includes('api.php')?'application/json':'application/xml',body,...extra});
const WD='{"search":[]}';

test('the policy is operation-specific, short-lived and fails closed on any missing safeguard',()=>{
 const now=new Date(T0);
 assert.equal(validateMetadataPilotPolicy264(policy(),now).policyId,'pilot_test');
 const bad:[Partial<MetadataPilotPolicy264>,RegExp][]=[
  [{expiresAt:'2026-10-24T11:00:01.000Z'},/at most 7 days/],[{issuedAt:'2026-10-16T12:30:00.000Z'},/not yet valid/],
  [{issuedAt:'2026-10-01T00:00:00.000Z',expiresAt:'2026-10-08T00:00:00.000Z'},/expired/],[{maxRequests:61},/maxRequests/],[{minIntervalMs:500},/minIntervalMs/],
  [{maxResponseBytes:2_000_001},/maxResponseBytes/],[{userAgent:'Mozilla/5.0 (X11)'},/userAgent/],[{operations:['page_retrieval' as never]},/operations/],
  [{prohibited:{pageRetrieval:false} as never},/prohibited/],[{jobIds:['job_1']},/jobIds/]];
 for(const [o,re] of bad)assert.throws(()=>validateMetadataPilotPolicy264(policy(o),now),re);
 assert.throws(()=>validateMetadataPilotPolicy264({...policy(),extra:1},now),/unknown field/);
 assert.throws(()=>validateMetadataPilotPolicy264(policy(),new Date(NaN)),/trusted clock/);
 // Loaded only through the Phase257 protected-file checks.
 const dir=mkdtempSync(join(tmpdir(),'pee264-'));const f=join(dir,'policy.json');writeFileSync(f,JSON.stringify(policy()));chmodSync(f,0o600);chmodSync(dir,0o700);
 assert.equal(loadMetadataPilotPolicy264(f,now).revision,1);
 chmodSync(f,0o666);assert.throws(()=>loadMetadataPilotPolicy264(f,now),/writable by group or others/);
});

test('the gate enforces scope, accepted domains, budgets, spacing and byte caps',async()=>{
 const c=clock();const seen:{url:string;ua:string;cap:number}[]=[];
 const tr:SourceTransport={async get(url,ua,cap){seen.push({url,ua,cap});return ok(url,url.includes('api.php')?WD:'User-agent: *\nAllow: /\n');}};
 const g=new MetadataPilotGate264(policy(),tr,c);
 const wd=g.transportFor('wikidata_entity_lookup'),rb=g.transportFor('robots_fetch'),sm=g.transportFor('sitemap_metadata');
 await wd.get(wikidataSearchUrl264('Vortex'),'x',5_000_000);
 assert.equal(seen[0].cap,2_000_000,'the per-response byte cap is the policy\'s, whatever the caller asks');
 assert.match(seen[0].ua,/^PEEMetadataPilot\/264 \(https:/,'the identifiable User-Agent is always sent');
 await assert.rejects(wd.get('https://www.wikidata.org/w/api.php?action=edit&format=json&maxlag=5','x',1),/wikidata_call_not_authorised/);
 await assert.rejects(wd.get('https://www.wikidata.org/w/index.php?action=raw&format=json&maxlag=5','x',1),/not_the_wikidata_api/);
 await assert.rejects(wd.get(wikidataSearchUrl264('x').replace('maxlag=5','maxlag=50'),'x',1),/wikidata_call_not_authorised/);
 await assert.rejects(rb.get('https://maker.pee264-fixture.test/robots.txt','x',1),/domain_not_accepted/);
 g.allowDomain('maker.pee264-fixture.test');
 await assert.rejects(rb.get('https://maker.pee264-fixture.test/products/a','x',1),/robots_path_only/,'robots operation cannot read a page');
 await rb.get('https://maker.pee264-fixture.test/robots.txt','x',1);
 await sm.get('https://maker.pee264-fixture.test/sitemap.xml','x',1);
 await sm.get('https://maker.pee264-fixture.test/sitemap-2.xml','x',1);
 await assert.rejects(sm.get('https://maker.pee264-fixture.test/sitemap-3.xml','x',1),/host_budget_exhausted/);
 assert.ok(c.waits.length>=3&&c.waits.every(w=>w>=1000-1),'at least one second between requests');
 await wd.get(wikidataEntitiesUrl264(['Q1']),'x',1);await wd.get(wikidataEntitiesUrl264(['Q2']),'x',1);
 await assert.rejects(wd.get(wikidataEntitiesUrl264(['Q3']),'x',1),/request_budget_exhausted/);
 assert.equal(g.totals().requests,6);
});

test('provider instructions stop the pilot or the domain; the clock and expiry are checked on every request',async()=>{
 const c=clock();
 const tr:SourceTransport={async get(url){if(url.includes('slow.'))return ok(url,'',{status:503,retryAfter:'120'});
  if(url.includes('search=lag'))return ok(url,'{"error":{"code":"maxlag","info":"Waiting for db: 6 seconds lagged."}}');
  if(url.includes('search=limit'))return ok(url,'',{status:429});return ok(url,url.includes('api.php')?WD:'User-agent: *\nAllow: /\n',{date:new Date(c.now()).toUTCString()});}};
 const g=new MetadataPilotGate264(policy({maxRequests:20}),tr,c);
 g.allowDomain('slow.pee264-fixture.test');g.allowDomain('fine.pee264-fixture.test');
 const r=await g.transportFor('robots_fetch').get('https://slow.pee264-fixture.test/robots.txt','x',1);assert.equal(r.status,503);
 await assert.rejects(g.transportFor('sitemap_metadata').get('https://slow.pee264-fixture.test/sitemap.xml','x',1),/host_halted/,'Retry-After stops that domain, no retry');
 await g.transportFor('robots_fetch').get('https://fine.pee264-fixture.test/robots.txt','x',1);
 await g.transportFor('wikidata_entity_lookup').get(wikidataSearchUrl264('lag'),'x',1);
 assert.equal(g.halted,'maxlag_stop','a maxlag error (HTTP 200) stops the pilot');
 await assert.rejects(g.transportFor('robots_fetch').get('https://fine.pee264-fixture.test/robots.txt','x',1),/pilot_halted/);
 // 429 halts; a skewed server clock halts; expiry mid-run refuses.
 const g2=new MetadataPilotGate264(policy({maxRequests:20}),tr,clock());await g2.transportFor('wikidata_entity_lookup').get(wikidataSearchUrl264('limit'),'x',1);assert.equal(g2.halted,'stop_429');
 const c3=clock();const skew:SourceTransport={async get(url){return ok(url,WD,{date:new Date(T0+3600_000).toUTCString()});}};
 const g3=new MetadataPilotGate264(policy(),skew,c3);await assert.rejects(g3.transportFor('wikidata_entity_lookup').get(wikidataSearchUrl264('a'),'x',1),/clock_untrusted/);
 const c4=clock();const g4=new MetadataPilotGate264(policy(),{async get(url){return ok(url,WD);}},c4);c4.advance(8*86400000);
 await assert.rejects(g4.transportFor('wikidata_entity_lookup').get(wikidataSearchUrl264('a'),'x',1),/policy_expired/);
});

test('Wikidata P856 is a claim: exact identity, ambiguity, ended and multiple values are reported, never guessed',()=>{
 const search={search:[{id:'Q10',label:'Vortex',match:{type:'label',text:'Vortex'}},{id:'Q11',label:'Vortex Appliances',match:{type:'alias',text:'VORTEX'}},{id:'Q12',label:'Vortexx'}]};
 assert.deepEqual(exactMatches264('Vortex',search),['Q10','Q11']);
 const site=(url:string,q:Record<string,unknown>={},rank='normal')=>({mainsnak:{snaktype:'value',datavalue:{value:url}},rank,qualifiers:q});
 const ent=(id:string,types:string[],sites:unknown[])=>({id,claims:{P31:types.map(t=>({mainsnak:{datavalue:{value:{id:t}}}})),P856:sites}});
 // One company with a current site, plus a film with the same name: unambiguous, the film excluded.
 const a=assessBrand264('Vortex',['Q10','Q11'],{entities:{Q10:ent('Q10',['Q4830453'],[site('https://www.vortex.example/'),site('https://old.vortex.example/',{P582:[{}]})]),Q11:ent('Q11',['Q11424'],[])}});
 assert.equal(a.status,'unambiguous');assert.deepEqual(a.candidateDomains.map(d=>d.host),['www.vortex.example']);
 assert.ok(a.reasons.includes('ended_or_deprecated_website_excluded')&&a.reasons.includes('exact_match_of_non_organisation_type_excluded'));
 // Two organisations sharing the name: ambiguous, no candidate domain.
 const b=assessBrand264('Vortex',['Q10','Q11'],{entities:{Q10:ent('Q10',['Q4830453'],[site('https://a.example/')]),Q11:ent('Q11',['Q783794'],[site('https://b.example/')])}});
 assert.equal(b.status,'ambiguous');assert.equal(b.candidateDomains.length,0);
 // A brand entity with regional sites: candidates flagged, manufacturer may differ.
 const c=assessBrand264('Vortex',['Q10'],{entities:{Q10:ent('Q10',['Q431289'],[site('https://uk.vortex.example/',{P1001:[{datavalue:{value:{id:'Q145'}}}]}),site('https://de.vortex.example/',{},'deprecated'),site('https://www.vortex.example/')])}});
 assert.equal(c.status,'unambiguous');assert.deepEqual(c.candidateDomains.map(d=>d.host).sort(),['uk.vortex.example','www.vortex.example']);
 assert.ok(c.reasons.includes('brand_entity_manufacturer_may_differ')&&c.reasons.includes('multiple_current_official_websites'));
 assert.equal(c.candidateDomains.find(d=>d.host==='uk.vortex.example')?.regional,true);
 assert.equal(assessBrand264('Vortex',[],{}).status,'unresolved');
 assert.equal(assessBrand264('Vortex',['Q10'],{entities:{Q10:ent('Q10',['Q5'],[site('https://x.example/')])}}).status,'unresolved','a person is not a brand');
});

test('sitemap metadata through Phase75 and the gate gives attributed leads; known URLs, other models and duplicates are separated',async()=>{
 const c=clock();const host='maker.pee264-fixture.test';
 const xml=`<?xml version="1.0"?><urlset>${['/p/vx100-air-fryer','/p/vx100-air-fryer?utm_source=x','/p/zx900-air-fryer','/p/kettle-k1','/p/known-page','/blog/news'].map(p=>`<url><loc>https://${host}${p}</loc></url>`).join('')}</urlset>`;
 const tr:SourceTransport={async get(url){return url.endsWith('/robots.txt')?ok(url,'User-agent: *\nAllow: /\n'):ok(url,xml);}};
 const g=new MetadataPilotGate264(policy(),tr,c);
 const d=await discoverDomain264(g,host,new Date(T0).toISOString(),['vx100'],new Set([host]));
 assert.equal(d.status,'candidate_urls_found');assert.equal(d.knownHost,true);assert.equal(g.totals().requests,2,'robots + one sitemap');
 const job={jobId:researchJobFromGap182('air_fryers',{kind:'missing_declaration',reference:'prd_x:width_max',action:'t'}).jobId,categoryId:'air_fryers',gapKind:'missing_declaration' as const,productId:'prd_x',criterion:'width_max'};
 const t=discoveryTargetFromJob261(job,{market:'uk'});
 const target={...t,subject:{...t.subject,knownIdentifiers:['vx100']}};
 const r=classifyForJob264(d.urls,target,{observed:new Set([`https://${host}/p/known-page`]),knownHost:true,categoryTerms:['fryer'],seen:new Set()});
 const why=Object.fromEntries(r.rejected.map(x=>[new URL(x.url).pathname,x.reason]));
 assert.equal(why['/p/zx900-air-fryer'],'url_names_other_model');assert.equal(why['/p/known-page'],'already_observed');
 assert.ok(r.leads.some(l=>l.attribution==='url_token_matches_known_identifier'&&l.categoryRelevant));
 assert.equal(r.leads.find(l=>l.url.endsWith('/p/kettle-k1'))?.categoryRelevant,false,'kept as a lead, marked not relevant to the job category');
 assert.ok(r.leads.every(l=>l.stages.pageRetrievalPermitted===false&&l.stages.factualInformationRetained===false&&l.stages.documentRegistered===false));
});
