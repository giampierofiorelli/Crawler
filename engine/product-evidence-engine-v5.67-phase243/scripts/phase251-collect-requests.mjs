#!/usr/bin/env node
/** Phase251 — collects the untouched real-request set 4 exactly as pre-registered in evaluation/phase251/protocol.json:
 * Stack Exchange API only (site pages are disallowed to crawlers and never fetched), fixed queries per site, excluded
 * ids, an eligibility regex on titles, and a deterministic sha256 order per site. Raw responses stay in the private
 * evaluation directory. Run Node with NODE_USE_ENV_PROXY=1 so fetch uses the container proxy.
 * Usage: node scripts/phase251-collect-requests.mjs --exclude IDS_FILE --out PRIVATE_FILE
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {dirname,resolve} from 'node:path';import {createHash} from 'node:crypto';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const P=JSON.parse(readFileSync(new URL('../evaluation/phase251/protocol.json',import.meta.url),'utf8'));
const QUERIES=['buy','recommend','which should I','looking for','worth'];
const ELIGIBLE=new RegExp(P.collection.eligibility_title_regex,'i');
const exclude=new Set(readFileSync(resolve(F.exclude),'utf8').split(/\s+/).filter(Boolean));
const ent=s=>s.replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#[0-9]+;/g,' ').replace(/&[a-z]+;/g,' ');
const log=[];const bySite={};
outer:for(const site of Object.keys(P.collection.sites_and_quotas)){
 const seen=new Map();
 for(const q of QUERIES){
  const u=new URL('https://api.stackexchange.com/2.3/search/advanced');
  for(const [k,v] of Object.entries({order:'desc',sort:'relevance',site,q,pagesize:'50',filter:'withbody'}))u.searchParams.set(k,v);
  const r=await fetch(u,{headers:{'accept-encoding':'gzip'}});log.push({site,q,status:r.status});
  if(r.status===403||r.status===429){console.error('stopped: HTTP',r.status);break outer;}
  const j=await r.json();if(j.backoff)await new Promise(res=>setTimeout(res,j.backoff*1000));
  for(const it of j.items??[]){if(exclude.has(String(it.question_id))||seen.has(it.question_id))continue;
   seen.set(it.question_id,{site:`${site}.stackexchange.com`,questionId:it.question_id,title:ent(it.title),body:it.body,link:it.link,
    author:it.owner?.display_name?ent(it.owner.display_name):null,license:it.content_license??null,created:it.creation_date});}
  await new Promise(res=>setTimeout(res,1100));
 }
 bySite[site]=[...seen.values()].filter(c=>ELIGIBLE.test(c.title))
  .map(c=>({...c,order:createHash('sha256').update(`${site}:${c.questionId}`).digest('hex')})).sort((a,b)=>a.order.localeCompare(b.order));
}
mkdirSync(dirname(resolve(F.out)),{recursive:true});
writeFileSync(resolve(F.out),JSON.stringify({schema:'pee251.request-candidates.v1',collectedAt:new Date().toISOString(),log,bySite},null,1));
console.log(JSON.stringify({requests:log.length,failed:log.filter(l=>l.status!==200).length,eligible:Object.fromEntries(Object.entries(bySite).map(([k,v])=>[k,v.length]))}));
