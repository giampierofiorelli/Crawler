#!/usr/bin/env node
/** S103 (owner authorisation 2026-10-20, item 6): "Report which existing stored observations can actually be rederived under
 * current retention and rights rules, which cannot, and why. Do not assume that all original page bodies remain available."
 *
 * Read-only census of the live knowledge store (a copy). For every current revision:
 *  - is its derivation current? (stored extractor_version against the code's SPEC_EXTRACTOR_VERSION + IDENTITY_RULES246;
 *    the gated scientific readings, when a store has them, also name the reader, definitions and quantity knowledge);
 *  - are its bytes still held? The store never keeps page bodies (revisions.raw_body_stored is 0 by schema), so the only
 *    copies are private evaluation files of this container (private-eval/<wave>/raw/*.html, archive/pages/*.html), matched
 *    by SHA-256. They are NOT in the private repository (copies there skip raw/ and pages/), so they do not survive the
 *    container;
 *  - may it be re-read? Values are re-derived only for value-retaining retention classes; a host that refused access is not
 *    re-fetched while suspended; a re-fetch needs an active research policy (never automatic).
 * Writes public counts (evaluation/s103/rederivation-census.json) and per-revision detail (private-eval/s103/).
 * Usage: node scripts/s103-rederivation-census.mjs */
import {readFileSync,writeFileSync,existsSync,readdirSync,statSync,copyFileSync,mkdtempSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
const D=new URL('../dist/src/',import.meta.url).pathname;
const {SPEC_EXTRACTOR_VERSION}=await import(D+'phase245_spec_extraction.js');const {IDENTITY_RULES246,VALUE_RETAINING246}=await import(D+'phase246_knowledge_store.js');
const {loadQuantityKnowledge}=await import(D+'quantity_knowledge.js');const {observationSemanticsRules}=await import(D+'observation_semantics.js');
const BASE=join(homedir(),'.local/share/product-evidence-engine');const PE=join(BASE,'private-eval');
const live=join(process.env.PEE_KNOWLEDGE_DIR??join(BASE,'knowledge'),'pee246.sqlite');
const dir=mkdtempSync(join(homedir(),'.cache-s103-'));const copy=join(dir,'store.sqlite');copyFileSync(live,copy);
const db=new DatabaseSync(copy,{readOnly:true});const q=(s,...a)=>db.prepare(s).all(...a);
const sha=b=>createHash('sha256').update(b).digest('hex');
// private page copies held in this container
const held=new Map();
const walk=d=>{for(const e of readdirSync(d,{withFileTypes:true})){const p=join(d,e.name);if(e.isDirectory())walk(p);else if(/\.html?$/.test(e.name)&&statSync(p).size<20e6)held.set(sha(readFileSync(p)),p.slice(BASE.length+1).split('/').slice(0,2).join('/'));}};
for(const d of [PE,join(BASE,'archive')])if(existsSync(d))walk(d);
const current=`${SPEC_EXTRACTOR_VERSION}+${IDENTITY_RULES246}`;
const hasTable=t=>q("SELECT count(*) n FROM sqlite_master WHERE type='table' AND name=?",t)[0].n>0;
const counts=t=>hasTable(t)?new Map(q(`SELECT revision_id r,count(*) n FROM ${t} GROUP BY revision_id`).map(x=>[x.r,x.n])):new Map();
const decl=counts('declarations'),leads=counts('test_measurements265'),quals=counts('qualitative_observations270'),comps=counts('comparative_results271'),sci=counts('scientific_readings98');
const access=new Map(q('SELECT host,restricted,suspended_until,reason FROM host_access').map(x=>[x.host,x]));
const now=new Date().toISOString();
const rows=[];
for(const r of q("SELECT r.revision_id,r.url,r.sha256,r.extractor_version,r.retention,s.host,s.source_type FROM revisions r JOIN sources s USING(source_id) WHERE r.state='current'")){
 const derived={declarations:decl.get(r.revision_id)??0,testLeads:leads.get(r.revision_id)??0,qualitative:quals.get(r.revision_id)??0,comparative:comps.get(r.revision_id)??0,scientificReadings:sci.get(r.revision_id)??0};
 const stale=r.extractor_version!==current&&!r.extractor_version.startsWith(current+'+');
 const bytes=held.get(r.sha256)??null;const a=access.get(r.host);const suspended=!!a&&a.suspended_until>now;
 const retains=VALUE_RETAINING246.includes(r.retention);
 let cls,why;
 if(!stale){cls='current';why='derived by the current extractor and identity rules';}
 else if(!retains){cls='not_rederivable_rights';why=`retention ${r.retention}: values are not retained for this source, so re-reading would keep none`;}
 else if(bytes){cls='rederivable_now_container_only';why=`bytes held privately in this container (${bytes}); not in the private repository, so lost with the container`;}
 else if(suspended){cls='not_rederivable_access';why=`bytes not held; host ${r.host} refused access (${a.reason}) and is suspended until ${a.suspended_until}`;}
 else{cls='rederivable_only_by_refetch';why='bytes not held anywhere; a re-fetch needs an active research policy, robots permission and budget (never automatic)';}
 rows.push({revisionId:r.revision_id,host:r.host,sourceType:r.source_type,retention:r.retention,storedDerivation:r.extractor_version,stale,bytesHeld:!!bytes,bytesWhere:bytes,suspended,derived,class:cls,why});}
const T={};const inc=(k,n=1)=>T[k]=(T[k]??0)+n;
for(const r of rows){inc('revisions');inc('class:'+r.class);inc('derivation:'+r.storedDerivation);if(r.bytesHeld)inc('bytesHeldInContainer');
 for(const [k,v] of Object.entries(r.derived)){inc('derived:'+k,v);inc(`derived:${k}:${r.class}`,v);}}
const out={schema:'pee.s103.rederivation-census.v1',date:now.slice(0,10),
 statement:'S103 item 6: which stored observations can be re-derived under current retention and rights rules, which cannot, and why. Counts only; per-revision detail is private.',
 currentDerivation:current,quantityKnowledge:loadQuantityKnowledge().identity,observationSemantics:observationSemanticsRules().version,
 storeHasScientificReadings:hasTable('scientific_readings98'),pageCopiesHeldInContainer:held.size,
 bodiesInStore:q('SELECT sum(raw_body_stored) n FROM revisions')[0].n??0,
 classes:{current:'derived by the current extractor and identity rules',rederivable_now_container_only:'stale; the page bytes are held in this container only (private evaluation copies)',
  rederivable_only_by_refetch:'stale; the bytes are not held: only a new, authorised fetch can re-derive',not_rederivable_access:'stale; bytes not held and the host refused access (suspended)',not_rederivable_rights:'stale; retention keeps no values for this source'},
 totals:T};
writeFileSync(new URL('../evaluation/s103/rederivation-census.json',import.meta.url),JSON.stringify(out,null,1)+'\n');
mkdirSync(join(PE,'s103'),{recursive:true});writeFileSync(join(PE,'s103','rederivation-census-detail.json'),JSON.stringify({...out,rows},null,1)+'\n');
console.log(JSON.stringify(T,null,1));
