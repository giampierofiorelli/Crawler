#!/usr/bin/env node
/** Phase248: fetch and parse GOV.UK product safety alerts, reports and recalls (OPSS, Open Government Licence v3.0)
 * for one category, through the engine's restricted HTTPS transport, after a robots.txt check, within a request budget,
 * one request at a time with a pause between requests. Nothing is retained by this script beyond the --out file the
 * operator names; persisting notices in the knowledge store needs an owner-approved source policy
 * (see evaluation/phase248/policies/gov-uk-opss-ogl.proposed.json).
 *
 *  node scripts/phase248-safety-notices.mjs fetch --category air_fryers --max 20 --out FILE [--raw DIR] [--pause-ms 1000]
 *  node scripts/phase248-safety-notices.mjs parse --raw DIR --out FILE        (re-parse saved content API JSON offline)
 *  node scripts/phase248-safety-notices.mjs profile --in FILE --category C    (category hazard profile)
 */
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {restrictedHttpsTransport as T,RESEARCH_AGENT,robotsDecision} from '../dist/src/approved_web_reader.js';
import {parseSafetyNotice248,categorySafetyProfile248,SAFETY_NOTICE_PARSER248} from '../dist/src/phase248_safety_notices.js';
import {CATEGORY_REGISTRY248} from '../dist/src/phase248_category_registry.js';

const [cmd,...rest]=process.argv.slice(2);
const F=Object.fromEntries(rest.reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const HOST='https://www.gov.uk';
const FORMAT='product_safety_alert_report_recall';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
let used=0;const budget=Number(F.budget??60);
async function get(url){
 if(used>=budget)throw Error('budget_exhausted');used++;
 const r=await T.get(url,RESEARCH_AGENT,3_000_000);await pause(Number(F['pause-ms']??1000));
 if(r.status===403||r.status===429)throw Error(`stopped_${r.status}`); // restriction: stop, never retry or bypass
 return r;
}
async function fetchCategory(){
 const cat=CATEGORY_REGISTRY248.find(c=>c.id===F.category);if(!cat)throw Error('unknown category');
 const robots=await get(`${HOST}/robots.txt`);
 const allowed=p=>robots.status===200?robotsDecision(robots.body,p):'unknown';
 const max=Number(F.max??20);const links=new Map();
 for(const alias of cat.aliases){
  const p=`/api/search.json?filter_format=${FORMAT}&q=${encodeURIComponent(alias)}&count=${max}&fields=link,title`;
  if(allowed(p)!=='allow'){console.error('robots',allowed(p),p);continue;}
  const r=await get(HOST+p);if(r.status!==200)continue;
  for(const x of JSON.parse(r.body).results??[])if(x.link?.startsWith('/product-safety-alerts-reports-recalls/'))links.set(x.link,x.title);
  if(links.size>=max)break;
 }
 const notices=[];const at=new Date().toISOString();
 if(F.raw)mkdirSync(F.raw,{recursive:true});
 for(const link of [...links.keys()].slice(0,max)){
  const p='/api/content'+link;if(allowed(p)!=='allow'){console.error('robots',p);continue;}
  const r=await get(HOST+p);if(r.status!==200){console.error(r.status,p);continue;}
  const doc=JSON.parse(r.body);if(F.raw)writeFileSync(join(F.raw,link.split('/').pop()+'.json'),r.body);
  notices.push(parseSafetyNotice248(doc,HOST+link,at,CATEGORY_REGISTRY248));
 }
 return notices;
}
if(cmd==='fetch'){
 const notices=await fetchCategory();
 writeFileSync(resolve(F.out),JSON.stringify({schema:'pee248.safety-notices.v1',parser:SAFETY_NOTICE_PARSER248,category:F.category,requests:used,notices},null,1)+'\n');
 console.log(JSON.stringify({category:F.category,requests:used,notices:notices.length,inCategory:notices.filter(n=>n.product.categoryIds.includes(F.category)).length}));
}else if(cmd==='parse'){
 const at='offline';const notices=readdirSync(F.raw).filter(f=>f.endsWith('.json')).sort().map(f=>{const d=JSON.parse(readFileSync(join(F.raw,f),'utf8'));
  return {file:f,...parseSafetyNotice248(d,HOST+(d.base_path??''),at,CATEGORY_REGISTRY248)};});
 writeFileSync(resolve(F.out),JSON.stringify({schema:'pee248.safety-notices.v1',parser:SAFETY_NOTICE_PARSER248,notices},null,1)+'\n');
 console.log(notices.length,'parsed');
}else if(cmd==='profile'){
 const {notices}=JSON.parse(readFileSync(resolve(F.in),'utf8'));
 console.log(JSON.stringify(categorySafetyProfile248(notices,F.category),null,1));
}else{console.error('usage: see header');process.exit(2);}
