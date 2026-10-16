#!/usr/bin/env node
/** Reality check 2026-10-16: the only authentic source documents available locally — three manufacturer product pages
 * lawfully re-fetched in Phase252 (robots allowed, HTTP 200; SHA-256 recorded in evaluation/phase252/*), bytes kept
 * outside Git — through the operational extraction-to-persistence path:
 *   scripts/phase246-live-wave.mjs observations (Phase245 + Phase225/226/227) → scripts/phase246-knowledge.mjs
 *   ingest-observations (Phase246/249 class policy) → reopen → read.
 * Into a temporary store only; the live store is never opened. Public output: counts and codes only (S23).
 * Usage: node scripts/phase266-authentic-pilot.mjs --raw DIR
 */
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,existsSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
if(!F.raw)throw Error('--raw DIR required');
const out='evaluation/phase266/authentic-pilot.json';if(existsSync(out))throw Error(out+' exists: committed unchanged');
const sha=b=>createHash('sha256').update(b).digest('hex');
const audit=JSON.parse(readFileSync('evaluation/phase252/identity-audit.json','utf8'));const splits=JSON.parse(readFileSync('evaluation/phase252/identity-verified-splits.json','utf8'));
const recorded=new Map();for(const s of splits.splits)for(const k of ['keep','move'])if(s[k]?.sha256)recorded.set(s[k].model,{url:s[k].url,sha256:s[k].sha256});
const urls=[...new Set(JSON.stringify(audit).match(/https:\/\/www\.sharpconsumer\.com\/microwaves\/[a-z0-9]+\//g)??[])];
const base=join(homedir(),'.local','share','product-evidence-engine','reality');mkdirSync(base,{recursive:true});
const dir=mkdtempSync(join(base,'authentic-'));const db=join(dir,'pilot.sqlite');
const pages=[];
for(const url of urls){const model=url.split('/').at(-2);const f=resolve(F.raw,model+'.html');if(!existsSync(f))continue;
 const b=readFileSync(f);const h=sha(b);const rec=recorded.get(model);
 pages.push({tag:model,url,finalUrl:url,redirects:0,role:'operational',category:'microwave_ovens',sourceType:'manufacturer',outcome:'fetched',httpStatus:200,
  contentType:'text/html',bytes:b.length,ms:0,fetchedAt:'2026-10-16T00:42:00.000Z',sha256:h,hashMatchesPhase252Record:rec?rec.sha256===h:null});}
const state={schema:'pee246.live-wave.v1',startedAt:'2026-10-16T00:00:00.000Z',budget:{maxRequests:0,maxPerHost:0,maxSeconds:0,maxBytes:0},requests:[],hosts:{},robots:{},leads:[],plans:[],stopReasons:[],pages};
const st=join(dir,'state.json'),obs=join(dir,'obs.json');writeFileSync(st,JSON.stringify(state));
const node=a=>execFileSync(process.execPath,['--no-warnings',...a],{encoding:'utf8'});
node(['scripts/phase246-live-wave.mjs','observations','--state',st,'--raw',resolve(F.raw),'--out',obs,'--run','reality_check_authentic']);
const o=JSON.parse(readFileSync(obs,'utf8')).filter(x=>x.observation);
const ing=JSON.parse(node(['scripts/phase246-knowledge.mjs','ingest-observations','--file',obs,'--db',db,'--storage-policy','class']));
const s=new KnowledgeStore246(db);
const products=s.db.prepare("SELECT COUNT(*) n FROM products WHERE identity_state!='discovered'").get().n;
const decls=s.db.prepare("SELECT COUNT(*) n FROM declarations WHERE state='extracted_unverified'").get().n;
const roles=s.db.prepare('SELECT evidence_role r,COUNT(*) n FROM declarations GROUP BY 1').all();
const tm=s.testMeasurements265({includeSuperseded:true}).length;const journal=s.verifyJournal();s.close();
const res={schema:'pee266.authentic-pilot.v1',tier:'authentic manufacturer product pages (not test documents)',
 documents:pages.map(p=>({model:p.tag,bytes:p.bytes,hashMatchesPhase252Record:p.hashMatchesPhase252Record})),
 observations:o.length,testLeadsExtracted:o.reduce((a,x)=>a+x.observation.testLeads.probe.candidates.length,0),
 testLeadReasons:[...new Set(o.flatMap(x=>x.observation.testLeads.probe.blockingReasons))].sort(),
 ingest:ing.results.map(r=>({retention:r.retention,products:r.products,declarationsSeen:r.declarationsSeen,declarationsRetained:r.declarationsRetained,testMeasurements:r.testMeasurements})),
 store:{mainProducts:products,currentDeclarations:decls,evidenceRoles:roles,testMeasurements:tm,journal},
 note:'temporary store outside Git; the live knowledge store was not opened'};
writeFileSync(out,JSON.stringify(res,null,1)+'\n');console.log(JSON.stringify(res,null,1));
