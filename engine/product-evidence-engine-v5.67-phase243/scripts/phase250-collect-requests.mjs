#!/usr/bin/env node
/** Phase250 — collects candidate real buying questions for an untouched request set from the official Stack Exchange
 * API (api.stackexchange.com; the sites' own pages are disallowed to crawlers by robots.txt and are never fetched).
 * Content is CC BY-SA (version per post); attribution is kept per case. The raw API responses go to the private
 * evaluation directory, never to Git. Fixed query plan, recorded with the output, so the candidate pool is reproducible.
 * Usage: node scripts/phase250-collect-requests.mjs --exclude FILE_WITH_IDS --out PRIVATE_FILE
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {dirname,resolve} from 'node:path';
const F=Object.fromEntries(process.argv.slice(2).filter(a=>a!=="--plan-b").reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
export const PLAN250=[
 {site:'cooking',tagged:'equipment',q:'buy'},{site:'cooking',tagged:'equipment',q:'recommend'},{site:'cooking',tagged:'equipment',q:'choosing'},
 {site:'cooking',tagged:'equipment',q:'looking for'},{site:'cooking',tagged:'appliances',q:'buy'},{site:'cooking',tagged:'appliances',q:'which'},
 {site:'coffee',q:'buy'},{site:'coffee',q:'recommend'},{site:'coffee',q:'which machine'},{site:'coffee',q:'grinder'},
];
/** Second plan (recorded before any gold): the first plan's buying questions were mostly cookware and knives, so
 * appliance questions were sampled explicitly to measure need recall where PEE has category knowledge. */
export const PLAN250B=['coffee maker','espresso machine','blender','toaster','air fryer','kettle','pressure cooker','stand mixer','food processor','slow cooker']
 .map(q=>({site:'cooking',q:q+' buy'}));
const plan=process.argv.includes('--plan-b')?PLAN250B:PLAN250;
const exclude=new Set(readFileSync(resolve(F.exclude),'utf8').split(/\s+/).filter(Boolean));
const seen=new Map();const log=[];
for(const p of plan){
 const u=new URL('https://api.stackexchange.com/2.3/search/advanced');
 for(const [k,v] of Object.entries({order:'desc',sort:'relevance',site:p.site,q:p.q,pagesize:'50',filter:'withbody',...(p.tagged?{tagged:p.tagged}:{})}))u.searchParams.set(k,v);
 const r=await fetch(u,{headers:{'accept-encoding':'gzip','user-agent':'PEE-research/250 (evaluation; contact via repository owner)'}});
 log.push({...p,status:r.status});
 if(r.status===403||r.status===429){console.error('stopped: HTTP',r.status);break;}
 const j=await r.json();
 if(j.backoff)await new Promise(res=>setTimeout(res,j.backoff*1000));
 for(const it of j.items??[]){const key=`${p.site}:${it.question_id}`;if(exclude.has(String(it.question_id))||seen.has(key))continue;
  seen.set(key,{site:`${p.site}.stackexchange.com`,questionId:it.question_id,title:it.title,body:it.body,link:it.link,author:it.owner?.display_name??null,
   license:it.content_license??null,created:it.creation_date,tags:it.tags});}
 await new Promise(res=>setTimeout(res,1100));
}
mkdirSync(dirname(resolve(F.out)),{recursive:true});
writeFileSync(resolve(F.out),JSON.stringify({schema:'pee250.request-candidates.v1',collectedAt:new Date().toISOString(),plan,log,candidates:[...seen.values()]},null,1));
console.log(JSON.stringify({requests:log.length,log,candidates:seen.size}));
