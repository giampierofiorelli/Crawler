#!/usr/bin/env node
/** Phase262 — offline general-search pilot on genuine research jobs (expectations sealed in evaluation/phase262/expected.json).
 * - Jobs: genuine Phase257 jobs (evaluation/phase257/policy-demo.json); store: a COPY of the verified snapshot (outside Git).
 * - Index: ONE controlled fixture search index (documents built in memory from retained metadata plus fictional hosts),
 *   served through the real Phase223 response parsing in synthetic_fixture mode. Fixture URLs are not discoveries.
 * - Arms: G = existing Phase223 question path with a manufactured question and a test-only vocabulary; T = Phase262 typed path.
 * - Also: metadata-only historical assessment for all 19 jobs; capability states.
 * Output: labels, counts and reason codes only (no real URLs, names or identifiers). Zero network calls.
 * Usage: node scripts/phase262-search-pilot.mjs [--out FILE]
 */
import {writeFileSync,copyFileSync,mkdirSync,rmSync,readFileSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {loadResearchPolicy257} from '../dist/src/phase257_research_planning.js';
import {planSearchQueries223} from '../dist/src/phase223_search_discovery.js';
import {discoveryTargetFromJob261} from '../dist/src/phase261_discovery_bridge.js';
import {planJobSearch262,searchForTarget262,historicalAssessment262} from '../dist/src/phase262_job_search.js';
const out=process.argv.includes('--out')?process.argv[process.argv.indexOf('--out')+1]:null;
const dir=join(homedir(),'.local','share','product-evidence-engine','arms262');mkdirSync(dir,{recursive:true});
const dbf=join(dir,'real-copy.sqlite');for(const x of ['','-wal','-shm'])rmSync(dbf+x,{force:true});
copyFileSync('/home/user/pee-knowledge/snapshot/pee246.sqlite',dbf);
const policy=loadResearchPolicy257(process.env.PEE_RESEARCH_POLICY??join(homedir(),'.local','share','product-evidence-engine','research-policy','research-policy.json'),new Date());
const store=new KnowledgeStore246(dbf);const statsBefore=JSON.stringify(store.stats246());
const expected=JSON.parse(readFileSync('evaluation/phase262/expected.json','utf8'));
const demo=JSON.parse(readFileSync('evaluation/phase257/policy-demo.json','utf8'));
const jobs=demo.plans.flatMap(p=>p.jobs.map(j=>({jobId:j.jobId,categoryId:p.categoryId,gapKind:j.gapKind,productId:j.productId,criterion:j.criterion})));
const norm=s=>String(s??'').normalize('NFKD').toLowerCase().replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const targets=jobs.map(j=>({j,t:discoveryTargetFromJob261(j,{market:policy.market,store})}));

// Pilot jobs, chosen by rule (expected.json): P1 has a cross-site exact identifier, P2 has none but a brand and name.
const prod=id=>store.db.prepare('SELECT brand,name,declared_model,identifiers_json FROM products WHERE product_id=?').get(id);
const P1=targets.find(x=>x.j.categoryId==='air_fryers'&&x.t.subject.knownIdentifiers.length>0);
const P2=targets.find(x=>x.j.categoryId==='air_fryers'&&x.t.subject.knownIdentifiers.length===0&&prod(x.j.productId)?.brand&&prod(x.j.productId)?.name);
const ownPage=id=>store.db.prepare("SELECT r.url,s.host FROM product_sources ps JOIN revisions r USING(revision_id) JOIN sources s USING(source_id) WHERE ps.product_id=? AND ps.role='main_product' ORDER BY r.fetched_at DESC LIMIT 1").get(id);
const p1=prod(P1.j.productId),p2=prod(P2.j.productId);const ids1=JSON.parse(p1.identifiers_json);
const declared1=String(ids1.gtin13??ids1.gtin14??ids1.gtin12??ids1.gtin8??ids1.gtin??ids1.mpn??p1.declared_model??'');
const own1=ownPage(P1.j.productId),own2=ownPage(P2.j.productId);
const b1=norm(p1.brand),b2=norm(p2.brand),slug2=norm(p2.name).split(' ').slice(0,8).join('-');
// One controlled index: document label -> URL and title words (titles exist only in this fixture and are never output).
const LAB='kitchen-lab.pee262-fixture.test',MIRROR='news-mirror.pee262-fixture.test',FORUM='fryer-forum.pee262-fixture.test',GUIDE='home-guide.pee262-fixture.test';
const docs=[
 ['P1.independent_new_domain',`https://${LAB}/tests/${b1}-${declared1}-measured`,`${b1} ${declared1} air fryer capacity measured test review`],
 ['P1.syndicated_copy',`https://${MIRROR}/2026/${b1}-${declared1}-measured`,`${b1} ${declared1} air fryer capacity measured test review`],
 ['P1.tracking_duplicate',`https://${LAB}/tests/${b1}-${declared1}-measured?utm_source=feed`,`${b1} ${declared1} air fryer capacity measured test review`],
 ['P1.already_known_url',own1.url,`${b1} ${declared1} specifications`],
 ['P1.manufacturer_doc_known_host',`https://${own1.host}/support/${declared1}-user-manual`,`${b1} ${declared1} user manual specifications`],
 ['P1.other_model',`https://${LAB}/tests/${b1}-zx900-measured`,`${b1} zx900 air fryer capacity measured test review`],
 ['P2.specialist_new_domain',`https://${FORUM}/reviews/${slug2}`,`${norm(p2.name)} dimensions width review`],
 ['P2.retailer_known_host',`https://${own2.host}/${slug2}-specifications`,`${norm(p2.name)} dimensions specifications`],
 ['P2.other_model',`https://${FORUM}/reviews/${b2}-zx900-air-fryer`,`${b2} zx900 air fryer dimensions specifications`],
 ['shared.roundup',`https://${GUIDE}/best-air-fryers`,'best air fryers independent product review tests 2026'],
 ['shared.unsafe_http',`http://${GUIDE}/air-fryer-review`,'air fryer review specifications manual'],
 ['shared.unsafe_private_ip','https://10.0.0.7/air-fryer-review','air fryer review specifications manual'],
 ['shared.malformed','not a url','air fryer review specifications manual']];
const tok=s=>new Set(norm(s).split(' ').filter(Boolean));
let searchCalls=0;
const transport={async get(url){
 if(url.endsWith('/robots.txt'))return {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /\n'};
 searchCalls++;const q=tok(new URL(url).searchParams.get('q'));
 const hits=docs.map(([label,u,title])=>({label,u,score:[...tok(title)].filter(w=>q.has(w)).length})).filter(d=>d.score>=2)
  .sort((a,b)=>b.score-a.score||a.u.localeCompare(b.u));
 return {status:200,finalUrl:url,contentType:'application/json',body:JSON.stringify({results:hits.map(h=>({url:h.u,title:'fixture'}))})};}};
const config={schema:'pee223.search-config.1',provider:'searxng',endpoint:'https://search.pee262-fixture.test/search',enabled:true,maxQueries:2,maxResults:30,serviceAccessReviewed:true};
const labelOf=u=>{for(const [label,du] of docs){try{const a=new URL(du),b=new URL(u);a.searchParams.delete('utm_source');if(a.toString()===b.toString())return label;}catch{}}return 'unlabelled';};
// Arm G: the existing question path (manufactured question, test-only vocabulary), identical for every job.
const vocabulary=[{categoryId:'air_fryers',displayName:'air fryer',aliases:['air fryer','air fryers'],essentialSlots:[]}];
const G=planSearchQueries223('I need an air fryer',{schema:'pee220.registry.1',vocabulary,sources:[],policies:[]});
const secret=[norm(declared1),b1,b2,...norm(p2.name).split(' ')].filter(w=>w&&w.length>=2).sort((a,b)=>b.length-a.length);
const redact=q=>{let s=q;for(const w of secret)s=s.replace(new RegExp(`\\b${w}\\b`,'g'),'<id-or-name>');return s.replace(/(?:<id-or-name>\s*)+/g,'<id-or-name> ').trim();};
async function arm(name,pilot,tag){
 const plan=name==='T'?planJobSearch262(pilot.t,{store}):{schema:'pee262.job-search-plan.v1',targetId:pilot.t.targetId,jobId:pilot.j.jobId,
  queries:G.queries.map(q=>({query:q,purpose:/specifications/.test(q)?'declared_specification':'performance_measurement',usesExactIdentifier:false})),
  plan:{key:G.key,status:G.status,queries:G.queries},queryWordsLanguage:'en',languageNeutralTerms:[],userTextSent:false,notYetExpressible:[]};
 const before=searchCalls;
 const r=await searchForTarget262({target:pilot.t,plan,config,researchPolicy:policy,mode:'synthetic_fixture',fixtureTransport:transport,store});
 const cands=r.candidates.map(c=>({label:labelOf(c.url),publisher:c.publisher,role:c.role,attribution:c.attribution,purpose:c.purpose}));
 const about=l=>expected.documents[l]?.aboutJob??null;
 return {arm:name,job:tag,queries:plan.queries.map(q=>({query:redact(q.query),purpose:q.purpose,usesExactIdentifier:q.usesExactIdentifier})),
  mentionsCriterionWord:plan.queries.some(q=>/\b(?:capacity|dimensions|weight|power|price)\b/.test(q.query)),
  candidates:cands,rejected:r.rejected.map(x=>({label:labelOf(x.url),reason:x.reason})),
  metrics:{candidates:cands.length,relevant:cands.filter(c=>about(c.label)===tag).length,newDomainCandidates:cands.filter(c=>c.publisher==='new_domain').length,
   newDomains:[...new Set(r.candidates.filter(c=>c.publisher==='new_domain').map(c=>c.host))].length,
   wrongAttribution:cands.filter(c=>c.attribution==='url_token_matches_known_identifier'&&about(c.label)!==tag).length,
   unresolvedIdentity:cands.filter(c=>c.attribution==='product_unknown').length,
   alreadySeenExcluded:r.rejected.filter(x=>x.reason==='already_observed').length,otherModelRejected:r.rejected.filter(x=>x.reason==='url_names_other_model').length,
   searchCalls:searchCalls-before,requests:r.cost.requests,liveNetworkCalls:r.cost.liveNetworkCalls},status:r.status,capabilityStates:r.capabilityStates};
}
const results=[];
for(const [pilot,tag] of [[P1,'P1'],[P2,'P2']])for(const name of ['G','T'])results.push(await arm(name,pilot,tag));
// Expectation check for the typed arm.
const check=[];
for(const [label,e] of Object.entries(expected.documents)){
 const job=label.startsWith('P2.')?'P2':'P1';const r=results.find(x=>x.arm==='T'&&x.job===job);
 const c=r.candidates.find(x=>x.label===label),rj=r.rejected.find(x=>x.label===label);
 let ok;
 if(e.expect==='candidate')ok=!!c&&c.publisher===e.publisher&&c.attribution===e.attribution;
 else if(e.expect==='rejected')ok=!!rj&&rj.reason===e.reason;
 else if(e.expect==='candidate_or_absent'){const all=results.filter(x=>x.arm==='T').flatMap(x=>x.candidates.filter(y=>y.label===label));ok=all.every(y=>y.attribution===e.attribution);}
 else ok=!c&&!rj&&!results.some(x=>x.candidates.some(y=>y.label===label));
 check.push({label,expect:e.expect,met:ok,observed:c?{publisher:c.publisher,attribution:c.attribution}:rj?{rejected:rj.reason}:'absent'});
}
// Live mode on the genuine jobs: refused without a request.
const live=await searchForTarget262({target:P1.t,plan:planJobSearch262(P1.t,{store}),config,researchPolicy:policy,mode:'live',store});
// Metadata-only historical assessment for all 19 jobs.
const hist=targets.map(({j})=>({jobId:j.jobId,categoryId:j.categoryId,criterion:j.criterion,...historicalAssessment262(store,j)}));
const histCounts={};for(const h of hist)histCounts[h.class]=(histCounts[h.class]??0)+1;
const result={schema:'pee262.search-pilot.v1',runAt:new Date().toISOString(),
 input:'genuine Phase257 jobs; copy of pee-knowledge snapshot (outside Git); ONE controlled fixture search index; Phase223 synthetic_fixture mode',
 policy:{policyId:policy.policyId,revision:policy.revision,market:policy.market,allowSourceReads:policy.allowSourceReads},
 pilotJobs:{P1:{jobId:P1.j.jobId,criterion:P1.j.criterion,exactIdentifiers:P1.t.subject.knownIdentifiers.length},P2:{jobId:P2.j.jobId,criterion:P2.j.criterion,exactIdentifiers:P2.t.subject.knownIdentifiers.length}},
 armG:{manufacturedQuestion:true,queriesIdenticalForBothJobs:true,status:G.status},
 results,expectationCheck:{met:check.filter(c=>c.met).length,of:check.length,rows:check},
 live:{status:live.status,requests:live.cost.requests},
 historical:{counts:histCounts,pilot:hist.filter(h=>h.jobId===P1.j.jobId||h.jobId===P2.j.jobId),all:hist.map(h=>({jobId:h.jobId,class:h.class,reinspectionOpportunity:h.reinspectionOpportunity,newDiscoveryNeeded:h.newDiscoveryNeeded}))},
 capabilityStates:{adapterExists:true,providerConfiguredAndPermitted:false,realDiscoveryDemonstrated:false,verifiedUsefulEvidence:false},
 genuineNewDiscoveries:0,liveNetworkCalls:0,storeUnchanged:JSON.stringify(store.stats246())===statsBefore};
store.close();
const text=JSON.stringify(result,null,1)+'\n';if(out)writeFileSync(out,text);process.stdout.write(text);
if(!result.storeUnchanged||results.some(r=>r.metrics.wrongAttribution>0||r.metrics.liveNetworkCalls>0))process.exitCode=1;
