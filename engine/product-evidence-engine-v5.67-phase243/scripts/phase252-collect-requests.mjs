#!/usr/bin/env node
/** Phase252 — collects the untouched real-request set 5 exactly as pre-registered in evaluation/phase252/protocol.json:
 * Stack Exchange API only (site pages are disallowed to crawlers and never fetched), one page per (site, term) of each
 * category stratum, excluded ids, the eligibility regex on titles, de-duplication across strata in listed order and a
 * deterministic sha256('252:<id>') order. Raw responses stay in the private evaluation directory (outside Git).
 * Run Node with NODE_USE_ENV_PROXY=1 so fetch uses the container proxy.
 * Usage: node scripts/phase252-collect-requests.mjs --exclude IDS_FILE --out PRIVATE_FILE [--frame 5b] [--protocol FILE --salt S]
 * (--protocol/--salt: the Stage 4 teaching evaluation, evaluation/phase252/teaching-protocol.json, salt 252t)
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {dirname,resolve} from 'node:path';import {createHash} from 'node:crypto';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const P=JSON.parse(readFileSync(F.protocol?resolve(F.protocol):new URL('../evaluation/phase252/protocol.json',import.meta.url),'utf8'));
const ELIGIBLE=new RegExp(P.collection.eligibility_title_regex,'i');const MAX_REQUESTS=P.collection.max_requests??60;const SALT=F.salt??'252';
const exclude=new Set(readFileSync(resolve(F.exclude),'utf8').split(/\s+/).filter(Boolean));
const ent=s=>s.replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x27;/g,"'").replace(/&#[0-9]+;/g,' ').replace(/&nbsp;/g,' ').replace(/&[a-z]+;/g,m=>m==='&amp;'?'&':' ');
const plain=html=>ent(html.replace(/<pre[\s\S]*?<\/pre>/gi,' ').replace(/<code>[\s\S]*?<\/code>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
const cut=(s,n=1500)=>s.length<=n?s:s.slice(0,s.lastIndexOf(' ',n)).trim();
const log=[];const strata={};const taken=new Set();let stopped=null;
const item=(stratum,site,it,q,salt)=>{const title=ent(it.title);return {stratum,site:`${site}.stackexchange.com`,questionId:it.question_id,title,text:cut(`${title}. ${plain(it.body??'')}`),link:it.link,
 author:it.owner?.display_name?ent(it.owner.display_name):null,license:it.content_license??null,created:it.creation_date,query:q,order:createHash('sha256').update(`${salt}:${it.question_id}`).digest('hex')};};
if(F.frame==='5b'){// amendment_5b: tagged=equipment, by votes; the set 5 pool ids are added to --exclude by the caller
 const pool=new Map();
 for(const [site,pages] of [['cooking',4],['coffee',2]])for(let page=1;page<=pages;page++){
  const u=new URL('https://api.stackexchange.com/2.3/questions');
  for(const [k,v] of Object.entries({order:'desc',sort:'votes',site,tagged:'equipment',pagesize:'100',page:String(page),filter:'withbody'}))u.searchParams.set(k,v);
  const r=await fetch(u,{headers:{'accept-encoding':'gzip'}});
  if(r.status===403||r.status===429){log.push({site,page,status:r.status});stopped='HTTP '+r.status;break;}
  const j=await r.json();log.push({site,page,status:r.status,items:(j.items??[]).length,quotaRemaining:j.quota_remaining});
  for(const it of j.items??[])if(!exclude.has(String(it.question_id))&&!pool.has(it.question_id)&&ELIGIBLE.test(ent(it.title)))pool.set(it.question_id,item('_5b',site,it,'tagged:equipment','252b'));
  await new Promise(res=>setTimeout(res,1100));
 }
 strata._5b=[...pool.values()].sort((a,b)=>a.order.localeCompare(b.order));
}
else outer:for(const [stratum,queries] of Object.entries(P.collection.strata)){
 const seen=new Map();
 for(const [site,q] of queries){
  if(log.length>=MAX_REQUESTS){stopped='api_budget';break outer;}
  const u=new URL('https://api.stackexchange.com/2.3/search/advanced');
  for(const [k,v] of Object.entries({order:'desc',sort:'relevance',site,q,pagesize:'50',filter:'withbody'}))u.searchParams.set(k,v);
  const r=await fetch(u,{headers:{'accept-encoding':'gzip'}});
  if(r.status===403||r.status===429){log.push({site,q,status:r.status});stopped='HTTP '+r.status;break outer;}
  const j=await r.json();log.push({site,q,status:r.status,items:(j.items??[]).length,quotaRemaining:j.quota_remaining});
  if(j.backoff)await new Promise(res=>setTimeout(res,j.backoff*1000));
  for(const it of j.items??[]){const id=String(it.question_id);if(exclude.has(id)||taken.has(id)||seen.has(id))continue;
   const title=ent(it.title);if(!ELIGIBLE.test(title))continue;
   seen.set(id,{stratum,site:`${site}.stackexchange.com`,questionId:it.question_id,title,text:cut(`${title}. ${plain(it.body??'')}`),link:it.link,
    author:it.owner?.display_name?ent(it.owner.display_name):null,license:it.content_license??null,created:it.creation_date,query:q,
    order:createHash('sha256').update(`${SALT}:${id}`).digest('hex')});}
  await new Promise(res=>setTimeout(res,1100));
 }
 for(const id of seen.keys())taken.add(id);
 strata[stratum]=[...seen.values()].sort((a,b)=>a.order.localeCompare(b.order));
}
mkdirSync(dirname(resolve(F.out)),{recursive:true});
writeFileSync(resolve(F.out),JSON.stringify({schema:'pee252.request-candidates.v1',collectedAt:new Date().toISOString(),stopped,log,strata},null,1));
console.log(JSON.stringify({requests:log.length,stopped,failed:log.filter(l=>l.status!==200).length,eligible:Object.fromEntries(Object.entries(strata).map(([k,v])=>[k,v.length]))}));
