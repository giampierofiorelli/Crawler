/** Phase246 — persistent, versioned product and category knowledge from authorized live research.
 *
 * Position in the architecture (extends, does not replace):
 *  - Phase101/104/105 remain the canonical store for REVIEWED, interpreted original-test evidence and its
 *    dependency graph. This store is the persistent STAGING tier that was missing between live observation
 *    (Phase222/241/245, transient) and those reviewed tiers: sources, byte revisions, product identities,
 *    unverified declarations, category hypotheses, research gaps and access history.
 *  - Category knowledge is kept as versioned items that compile into the existing Phase128 CategoryBrain128
 *    (proposed vs reviewed side by side) and Phase125 dialogue schema; Phase179 study streams label items.
 *  - Phase193 screening decisions are looked up per source revision; Phase243 receives candidates and
 *    host suspensions for budgeted, reversible waves.
 *
 * Integrity rules enforced here:
 *  - No page body, excerpt or full article is stored: only hashes, identities, short declared values.
 *  - Retention is decided per source policy. Unknown rights retain metadata only (URL, hash, time,
 *    identity); declarations need 'fact_storage' permission, or an explicit, expiring, local-only
 *    pending-rights cache that is never exported by default and never promoted.
 *  - A declaration is never independent test evidence and never authorizes ranking.
 *  - Product identities merge only on exact identifiers (valid GTIN, brand+MPN, host-scoped SKU/name);
 *    similar names never merge. Variants stay distinct.
 *  - A new source revision supersedes the old revision's declarations and marks dependent derived
 *    artifacts stale, leaving unrelated knowledge untouched.
 */
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {mkdirSync,existsSync,writeFileSync,readFileSync,renameSync,rmSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {homedir} from 'node:os';
import type {WebSourcePolicy} from './web_evidence_acquisition.js';
import {approvedMetadataDiscovery75} from './phase75_source_discovery.js';
import type {SpecExtraction245,Fact245} from './phase245_spec_extraction.js';
import type {Value245} from './phase245_value_normalizer.js';
import {validateBrain128,compileCategoryKnowledge128,type CategoryBrain128,type Concept128,type SourceRef128,
 type ConceptKind128,type Review128} from './phase128_category_cognition_dialogue_bridge.js';
import type {StudyStream179} from './phase179_category_learning.js';
import {lookupScreening193,type ScreeningLedger193,type SourceRevision193} from './phase193_screening_memory.js';
import type {CandidateResearch243} from './phase243_budgeted_category_search.js';

export const STORE_SCHEMA_VERSION246=1;
export type SourceType246='manufacturer'|'retailer'|'independent_original_test'|'editorial'|'community'|
 'promotional_announcement'|'reference_encyclopedia'|'unknown';
export type RetentionClass246='facts_retained'|'local_pending_rights_review'|'metadata_only'|'blocked';
export type IdentityState246='discovered'|'extracted_unverified'|'reviewed';
export type DeclarationState246='extracted_unverified'|'reviewed'|'verified_for_purpose'|'superseded_by_revision'|'expired_pending_rights';
export type KnowledgeClass246='observed_pattern'|'technical_hypothesis'|'reviewed_general_knowledge'|'evidence_supported_finding';
export const CATEGORY_SECTIONS246=['user_goals','product_subtypes','mechanisms','technical_characteristics',
 'performance_outcomes','spec_need_relevance','quality_measurements','constraints_requirements',
 'failure_modes_safety','trade_offs','user_questions','unknowns_priorities'] as const;
export type CategorySection246=typeof CATEGORY_SECTIONS246[number];
export type ItemProvenance246='assistant_authored_unreviewed'|'source_declaration_aggregate'|'professional_method_reference'|'reviewer_supplied';

/** Operator-owned storage policy. It is NOT a rights attestation; it states what this installation may keep. */
export interface StoragePolicy246 {
 policyVersion:string;
 /** Local-only cache for declarations whose rights are not yet reviewed. Off by default. Never exported
  * unless explicitly requested, never promoted, expires automatically. */
 localPendingRightsCache:{enabled:boolean;expiresAfterDays:number};
 /** Whether category-level aggregate patterns may be derived from declarations that are not retained. */
 deriveAggregatesFromUnretainedDeclarations:boolean;
}
export const DEFAULT_STORAGE_POLICY246:StoragePolicy246={policyVersion:'pee246-default-deny',
 localPendingRightsCache:{enabled:false,expiresAfterDays:30},deriveAggregatesFromUnretainedDeclarations:false};
/** Default durable location: outside /tmp, overridable with PEE_KNOWLEDGE_DIR. */
export function defaultKnowledgeDir246():string{
 return process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local','share','product-evidence-engine','knowledge');
}

const sha=(x:string|Buffer)=>createHash('sha256').update(x).digest('hex');
const canon=(v:unknown):string=>JSON.stringify(v,(_k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?
 Object.fromEntries(Object.entries(x as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b))):x);
const norm=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const slug=(s:string)=>norm(s).replace(/[^\p{L}\p{N}+.-]+/gu,'_').replace(/^_+|_+$/g,'').slice(0,90);
const ident=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,79}$/.test(s);
const iso=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(s)&&Number.isFinite(Date.parse(s));
const hex64=(s:unknown):s is string=>typeof s==='string'&&/^[0-9a-f]{64}$/.test(s);
const shortText=(s:unknown,max=300):s is string=>typeof s==='string'&&s.trim().length>0&&s.length<=max&&!/[<>\r\n]/.test(s);

/** GS1 check digit for GTIN-8/12/13/14. */
export function validGtin246(raw:string):string|null{
 const d=String(raw).replace(/\s+/g,'');
 if(!/^\d{8}$|^\d{12,14}$/.test(d))return null;
 const digits=d.split('').map(Number);const check=digits.pop()!;
 const sum=digits.reverse().reduce((a,n,i)=>a+n*(i%2===0?3:1),0);
 return (10-sum%10)%10===check?d.padStart(14,'0'):null;
}
/** Exact-identifier product key. Names only ever key within one host; nothing merges on similarity. */
export function productKey246(i:{host:string;name:string|null;brand?:string|null;gtin?:string|null;mpn?:string|null;
 sku?:string|null;productGroupId?:string|null}):{key:string;basis:'gtin'|'brand_mpn'|'host_group'|'host_sku'|'host_name'}{
 const g=i.gtin?validGtin246(i.gtin):null;
 if(g)return {key:'gtin:'+g,basis:'gtin'};
 if(i.brand&&i.mpn&&i.mpn.trim().length>=3)return {key:`mpn:${slug(i.brand)}:${slug(i.mpn)}`,basis:'brand_mpn'};
 if(i.productGroupId)return {key:`group:${i.host}:${slug(i.productGroupId)}`,basis:'host_group'};
 if(i.sku)return {key:`sku:${i.host}:${slug(i.sku)}`,basis:'host_sku'};
 if(!i.name)throw Error('246_product_without_identity');
 return {key:`name:${i.host}:${slug(i.name)}`,basis:'host_name'};
}
/** Rights gate: what may be kept from one source under this installation's storage policy. */
export function retentionFor246(policy:WebSourcePolicy|undefined,storage:StoragePolicy246,asOf:string):RetentionClass246{
 if(!policy)return storage.localPendingRightsCache.enabled?'local_pending_rights_review':'metadata_only';
 if(policy.basis==='refused'||policy.websiteTerms==='reviewed_prohibited'||policy.robots==='disallowed')return 'blocked';
 if(approvedMetadataDiscovery75(policy,asOf)&&policy.permittedOperations.includes('fact_storage'))return 'facts_retained';
 return storage.localPendingRightsCache.enabled?'local_pending_rights_review':'metadata_only';
}
/** The evidentiary role of a declaration is fixed by its source type; none is an independent test result. */
export function declarationRole246(t:SourceType246):string{
 return {manufacturer:'manufacturer_declaration',retailer:'retailer_declaration',independent_original_test:
  'test_publisher_declaration_unreviewed',editorial:'editorial_declaration',community:'community_report',
  promotional_announcement:'promotional_claim',reference_encyclopedia:'secondary_reference_declaration',unknown:'unclassified_declaration'}[t];
}

const MIGRATIONS:string[]=[
 // v1
 `CREATE TABLE sources (source_id TEXT PRIMARY KEY, host TEXT NOT NULL, source_type TEXT NOT NULL,
   source_type_basis TEXT NOT NULL, policy_json TEXT, policy_digest TEXT, retention TEXT NOT NULL, created_at TEXT NOT NULL);
  CREATE TABLE revisions (revision_id TEXT PRIMARY KEY, source_id TEXT NOT NULL REFERENCES sources(source_id),
   url TEXT NOT NULL, sha256 TEXT NOT NULL, bytes INTEGER NOT NULL, http_status INTEGER NOT NULL, fetched_at TEXT NOT NULL,
   extractor_version TEXT NOT NULL, retention TEXT NOT NULL, state TEXT NOT NULL, superseded_by TEXT,
   screening_verdict TEXT, raw_body_stored INTEGER NOT NULL DEFAULT 0 CHECK(raw_body_stored=0),
   declarations_seen INTEGER NOT NULL, declarations_retained INTEGER NOT NULL, UNIQUE(url,sha256));
  CREATE TABLE sightings (revision_id TEXT NOT NULL REFERENCES revisions(revision_id), seen_at TEXT NOT NULL, run_id TEXT NOT NULL,
   PRIMARY KEY(revision_id,seen_at,run_id));
  CREATE TABLE products (product_id TEXT PRIMARY KEY, key_basis TEXT NOT NULL, name TEXT, brand TEXT, declared_model TEXT,
   identifiers_json TEXT NOT NULL, identity_state TEXT NOT NULL, identity_review_json TEXT, category_hypotheses_json TEXT NOT NULL,
   first_seen TEXT NOT NULL, last_seen TEXT NOT NULL);
  CREATE TABLE variants (variant_id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(product_id), name TEXT NOT NULL,
   identifiers_json TEXT NOT NULL, attributes_json TEXT NOT NULL);
  CREATE TABLE product_sources (product_id TEXT NOT NULL, revision_id TEXT NOT NULL, role TEXT NOT NULL,
   PRIMARY KEY(product_id,revision_id,role));
  CREATE TABLE declarations (declaration_id TEXT PRIMARY KEY, revision_id TEXT NOT NULL REFERENCES revisions(revision_id),
   product_id TEXT NOT NULL REFERENCES products(product_id), variant_id TEXT, property TEXT NOT NULL, property_key TEXT NOT NULL,
   value_json TEXT NOT NULL, raw_value TEXT NOT NULL, section TEXT, component TEXT, method TEXT NOT NULL, locator TEXT NOT NULL,
   flags_json TEXT NOT NULL, evidence_role TEXT NOT NULL, retention TEXT NOT NULL, state TEXT NOT NULL,
   expires_at TEXT, review_json TEXT, verified_purposes_json TEXT NOT NULL DEFAULT '[]',
   independent_test_evidence INTEGER NOT NULL DEFAULT 0 CHECK(independent_test_evidence=0),
   ranking_authorized INTEGER NOT NULL DEFAULT 0 CHECK(ranking_authorized=0));
  CREATE INDEX decl_product ON declarations(product_id,property_key);
  CREATE TABLE category_items (item_id TEXT PRIMARY KEY, category_id TEXT NOT NULL, section TEXT NOT NULL, statement TEXT NOT NULL,
   knowledge_class TEXT NOT NULL, provenance TEXT NOT NULL, source_revision_ids_json TEXT NOT NULL, study_stream TEXT,
   concept_kind TEXT, concept_id TEXT, aliases_json TEXT NOT NULL, state TEXT NOT NULL, review_json TEXT,
   created_at TEXT NOT NULL, updated_at TEXT NOT NULL, superseded_by TEXT);
  CREATE TABLE category_versions (category_id TEXT NOT NULL, version INTEGER NOT NULL, profile_sha256 TEXT NOT NULL,
   previous_sha256 TEXT, created_at TEXT NOT NULL, reason TEXT NOT NULL, PRIMARY KEY(category_id,version));
  CREATE TABLE derived_nodes (node_id TEXT PRIMARY KEY, kind TEXT NOT NULL, deps_json TEXT NOT NULL,
   state TEXT NOT NULL CHECK(state IN ('stale','fresh')), result_sha256 TEXT, computed_at TEXT, stale_reason TEXT);
  CREATE TABLE derived_edges (dep_key TEXT NOT NULL, node_id TEXT NOT NULL REFERENCES derived_nodes(node_id), PRIMARY KEY(dep_key,node_id));
  CREATE TABLE host_access (host TEXT PRIMARY KEY, ok INTEGER NOT NULL DEFAULT 0, restricted INTEGER NOT NULL DEFAULT 0,
   last_status TEXT, suspended_until TEXT, reason TEXT);
  CREATE TABLE research_gaps (gap_id TEXT PRIMARY KEY, scope TEXT NOT NULL, ref_id TEXT NOT NULL, kind TEXT NOT NULL,
   detail TEXT NOT NULL, next_action TEXT NOT NULL, created_at TEXT NOT NULL, resolved_at TEXT);
  CREATE TABLE events (seq INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, kind TEXT NOT NULL, payload_json TEXT NOT NULL,
   previous_sha256 TEXT NOT NULL, event_sha256 TEXT NOT NULL);
  CREATE TRIGGER events_no_update BEFORE UPDATE ON events BEGIN SELECT RAISE(ABORT,'append_only_events'); END;
  CREATE TRIGGER events_no_delete BEFORE DELETE ON events BEGIN SELECT RAISE(ABORT,'append_only_events'); END;
  CREATE TABLE store_meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);`,
];

export interface SourceInput246 {sourceId:string;host:string;sourceType:SourceType246;
 sourceTypeBasis:'operator_asserted'|'heuristic_unverified';policy?:WebSourcePolicy;}
export interface ObservationInput246 {
 source:SourceInput246;url:string;sha256:string;bytes:number;httpStatus:number;fetchedAt:string;runId:string;
 extractorVersion:string;extraction:SpecExtraction245|null;categoryHypotheses:readonly string[];
 /** Optional Phase193 ledger to link screening decisions for this revision. */
 screening?:{ledger:ScreeningLedger193;market:string;policyVersion:string};
}
export interface IngestResult246 {revisionId:string;newRevision:boolean;retention:RetentionClass246;
 productIds:string[];variantIds:string[];declarationsSeen:number;declarationsRetained:number;
 supersededRevisionIds:string[];staleNodes:string[];screeningVerdict:string|null;}
export interface CategoryItemInput246 {categoryId:string;section:CategorySection246;statement:string;
 knowledgeClass:KnowledgeClass246;provenance:ItemProvenance246;sourceRevisionIds?:readonly string[];
 studyStream?:StudyStream179;concept?:{kind:ConceptKind128;id:string;aliases:readonly string[]};}
export interface ReviewReceipt246 {reviewId:string;reviewerId:string;reviewedAt:string;
 /** Store revision ids the reviewer relied on. */
 sourceRevisionIds:readonly string[];note:string;}

export class KnowledgeStore246 {
 readonly db:DatabaseSync;readonly path:string;readonly storage:StoragePolicy246;
 constructor(path:string,storage:StoragePolicy246=DEFAULT_STORAGE_POLICY246){
  if(path!==':memory:'){
   if(path.startsWith('/tmp/')&&!process.env.PEE_ALLOW_TMP_STORE)throw Error('246_refusing_ephemeral_tmp_store');
   mkdirSync(dirname(path),{recursive:true});
  }
  this.path=path;this.storage=storage;
  if(!storage||typeof storage.policyVersion!=='string'||!(storage.localPendingRightsCache?.expiresAfterDays>=1))throw Error('246_invalid_storage_policy');
  this.db=new DatabaseSync(path);
  this.db.exec('PRAGMA busy_timeout=3000; PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
  this.migrate();
 }
 /** Safe schema upgrade: applies missing migrations in one transaction; refuses newer stores. */
 private migrate():void{
  const v=(this.db.prepare('PRAGMA user_version').get() as {user_version:number}).user_version;
  if(v>MIGRATIONS.length)throw Error('246_store_newer_than_software');
  for(let i=v;i<MIGRATIONS.length;i++){
   this.db.exec('BEGIN IMMEDIATE');
   try{this.db.exec(MIGRATIONS[i]);this.db.exec(`PRAGMA user_version=${i+1}`);this.db.exec('COMMIT');}
   catch(e){this.db.exec('ROLLBACK');throw e;}
  }
 }
 schemaVersion():number{return (this.db.prepare('PRAGMA user_version').get() as {user_version:number}).user_version;}
 close():void{this.db.close();}
 private tx<T>(f:()=>T):T{this.db.exec('BEGIN IMMEDIATE');try{const r=f();this.db.exec('COMMIT');return r;}catch(e){this.db.exec('ROLLBACK');throw e;}}
 private event(kind:string,payload:unknown,at=new Date().toISOString()):void{
  const prev=(this.db.prepare('SELECT event_sha256 FROM events ORDER BY seq DESC LIMIT 1').get() as {event_sha256:string}|undefined)?.event_sha256??'0'.repeat(64);
  const body=canon({at,kind,payload,prev});
  this.db.prepare('INSERT INTO events(at,kind,payload_json,previous_sha256,event_sha256) VALUES (?,?,?,?,?)')
   .run(at,kind,canon(payload),prev,sha(body));
 }
 /** Verifies the append-only event chain (detects accidental edits; not a signature). */
 verifyJournal():{events:number;ok:boolean}{
  const rows=this.db.prepare('SELECT * FROM events ORDER BY seq').all() as {at:string;kind:string;payload_json:string;previous_sha256:string;event_sha256:string}[];
  let prev='0'.repeat(64);
  for(const r of rows){if(r.previous_sha256!==prev||sha(canon({at:r.at,kind:r.kind,payload:JSON.parse(r.payload_json),prev}))!==r.event_sha256)return {events:rows.length,ok:false};prev=r.event_sha256;}
  return {events:rows.length,ok:true};
 }

 // ---------------- sources, access and suspension ----------------
 registerSource(s:SourceInput246,asOf=new Date().toISOString()):RetentionClass246{
  if(!s||!/^[a-z0-9][a-z0-9_.:-]{0,120}$/i.test(s.sourceId)||!/^[a-z0-9.-]+$/.test(s.host))throw Error('246_invalid_source');
  const retention=retentionFor246(s.policy,this.storage,asOf);
  const digest=s.policy?sha(canon(s.policy)):null;
  const old=this.db.prepare('SELECT host,policy_digest,retention FROM sources WHERE source_id=?').get(s.sourceId) as {host:string;policy_digest:string|null;retention:string}|undefined;
  if(old&&old.host!==s.host)throw Error('246_source_identity_collision');
  if(!old){this.db.prepare('INSERT INTO sources VALUES (?,?,?,?,?,?,?,?)').run(s.sourceId,s.host,s.sourceType,s.sourceTypeBasis,
   s.policy?canon(s.policy):null,digest,retention,asOf);this.event('source_registered',{sourceId:s.sourceId,retention});}
  else if(old.policy_digest!==digest||old.retention!==retention){
   this.db.prepare('UPDATE sources SET policy_json=?,policy_digest=?,retention=?,source_type=?,source_type_basis=? WHERE source_id=?')
    .run(s.policy?canon(s.policy):null,digest,retention,s.sourceType,s.sourceTypeBasis,s.sourceId);
   this.event('source_policy_changed',{sourceId:s.sourceId,from:old.retention,to:retention});
  }
  return retention;
 }
 /** Access outcomes feed reversible host suspension (403/429/robots refusals), never bypass. */
 recordAccess246(host:string,outcome:'ok'|'forbidden'|'rate_limited'|'robots_disallowed'|'error',at=new Date().toISOString()):{suspended:boolean}{
  this.db.prepare('INSERT OR IGNORE INTO host_access(host) VALUES (?)').run(host);
  if(outcome==='ok')this.db.prepare('UPDATE host_access SET ok=ok+1,last_status=? WHERE host=?').run(outcome,host);
  else this.db.prepare('UPDATE host_access SET restricted=restricted+1,last_status=? WHERE host=?').run(outcome,host);
  const r=this.db.prepare('SELECT restricted,ok FROM host_access WHERE host=?').get(host) as {restricted:number;ok:number};
  // Two restrictions (or one robots refusal) suspend the host for 30 days; reversible, not an exclusion.
  if(outcome==='robots_disallowed'||(outcome!=='ok'&&outcome!=='error'&&r.restricted>=2)){
   const until=new Date(Date.parse(at)+30*86400000).toISOString();
   this.db.prepare('UPDATE host_access SET suspended_until=?,reason=? WHERE host=?').run(until,outcome,host);
   this.event('host_suspended',{host,until,reason:outcome},at);
   return {suspended:true};
  }
  return {suspended:false};
 }
 hostSuspended246(host:string,asOf=new Date().toISOString()):boolean{
  const r=this.db.prepare('SELECT suspended_until FROM host_access WHERE host=?').get(host) as {suspended_until:string|null}|undefined;
  return !!r?.suspended_until&&Date.parse(r.suspended_until)>Date.parse(asOf);
 }
 liftSuspension246(host:string,reason:string):void{
  this.db.prepare('UPDATE host_access SET suspended_until=NULL,restricted=0,reason=? WHERE host=?').run('lifted:'+reason,host);
  this.event('host_suspension_lifted',{host,reason});
 }

 // ---------------- observations ----------------
 /** Ingests one observed page revision. Identical bytes are a sighting, not new knowledge. */
 ingestObservation246(o:ObservationInput246):IngestResult246{
  if(!o||!/^https:\/\//.test(o.url)||!hex64(o.sha256)||!iso(o.fetchedAt)||!Number.isInteger(o.httpStatus)||
   !/^[a-z0-9_.:-]{1,80}$/i.test(o.runId)||!shortText(o.extractorVersion,80))throw Error('246_invalid_observation');
  return this.tx(()=>{
   const retention=this.registerSource(o.source,o.fetchedAt);
   if(retention==='blocked'){this.event('observation_blocked',{url:o.url,sourceId:o.source.sourceId},o.fetchedAt);
    return {revisionId:'',newRevision:false,retention,productIds:[],variantIds:[],declarationsSeen:0,declarationsRetained:0,
     supersededRevisionIds:[],staleNodes:[],screeningVerdict:null};}
   const revisionId='rev_'+sha(o.url+'|'+o.sha256).slice(0,24);
   const existing=this.db.prepare('SELECT revision_id FROM revisions WHERE revision_id=?').get(revisionId);
   if(existing){
    this.db.prepare('INSERT OR IGNORE INTO sightings VALUES (?,?,?)').run(revisionId,o.fetchedAt,o.runId);
    this.event('revision_seen_again',{revisionId},o.fetchedAt);
    const products=(this.db.prepare('SELECT DISTINCT product_id FROM product_sources WHERE revision_id=?').all(revisionId) as {product_id:string}[]).map(r=>r.product_id);
    return {revisionId,newRevision:false,retention,productIds:products,variantIds:[],declarationsSeen:0,declarationsRetained:0,
     supersededRevisionIds:[],staleNodes:[],screeningVerdict:null};
   }
   // A different revision of the same URL supersedes the current one.
   const previous=this.db.prepare("SELECT revision_id FROM revisions WHERE url=? AND state='current'").all(o.url) as {revision_id:string}[];
   const superseded:string[]=[];const stale=new Set<string>();
   for(const p of previous){
    this.db.prepare("UPDATE revisions SET state='superseded',superseded_by=? WHERE revision_id=?").run(revisionId,p.revision_id);
    const decls=this.db.prepare("SELECT declaration_id FROM declarations WHERE revision_id=? AND state!='superseded_by_revision'").all(p.revision_id) as {declaration_id:string}[];
    this.db.prepare("UPDATE declarations SET state='superseded_by_revision' WHERE revision_id=?").run(p.revision_id);
    superseded.push(p.revision_id);
    for(const n of this.invalidate(['rev:'+p.revision_id,...decls.map(d=>'decl:'+d.declaration_id)],'source_revision_changed'))stale.add(n);
   }
   const host=o.source.host;const x=o.extraction;
   let verdict:string|null=null;
   if(o.screening){
    const rev:SourceRevision193={sourceId:o.source.sourceId.replace(/[^a-zA-Z0-9_.:-]/g,'_'),url:o.url,contentHash:o.sha256,contentBasis:'publisher_bytes',
     policyVersion:o.screening.policyVersion,market:o.screening.market,category:(o.categoryHypotheses[0]??'unclassified').replace(/[^a-zA-Z0-9_.:-]/g,'_'),
     variantId:'page',field:null,observedAt:o.fetchedAt.replace(/\.\d+Z$/,'Z'),classificationRevision:'phase246.v1'};
    verdict=lookupScreening193(o.screening.ledger,rev,'document').verdict;
   }
   const facts=x?.facts??[];
   this.db.prepare('INSERT INTO revisions VALUES (?,?,?,?,?,?,?,?,?,?,NULL,?,0,?,0)').run(revisionId,o.source.sourceId,o.url,o.sha256,o.bytes,o.httpStatus,
    o.fetchedAt,o.extractorVersion,retention,'current',verdict,facts.length);
   // Products and variants (identity metadata is retained under every non-blocked class).
   const productIds:string[]=[];const variantIds:string[]=[];
   const upsertProduct=(name:string|null,ids:Record<string,string>,state:IdentityState246,role:string):string=>{
    const k=productKey246({host,name,brand:ids.brand??null,gtin:ids.gtin13??ids.gtin14??ids.gtin12??ids.gtin8??ids.gtin??null,
     mpn:ids.mpn??null,sku:ids.sku??null,productGroupId:ids.productGroupID??null});
    const pid='prd_'+sha(k.key).slice(0,24);
    const row=this.db.prepare('SELECT identity_state,category_hypotheses_json,identifiers_json FROM products WHERE product_id=?').get(pid) as
     {identity_state:string;category_hypotheses_json:string;identifiers_json:string}|undefined;
    if(!row){
     this.db.prepare('INSERT INTO products VALUES (?,?,?,?,?,?,?,NULL,?,?,?)').run(pid,k.basis,name,ids.brand??null,ids.model??ids.mpn??null,
      canon({...ids,_key:k.key}),state,canon([...new Set(o.categoryHypotheses)].sort()),o.fetchedAt,o.fetchedAt);
    }else{
     const cats=[...new Set([...JSON.parse(row.category_hypotheses_json),...o.categoryHypotheses])].sort();
     const newState=row.identity_state==='reviewed'?'reviewed':(state==='extracted_unverified'?'extracted_unverified':row.identity_state);
     this.db.prepare('UPDATE products SET last_seen=?,category_hypotheses_json=?,identity_state=? WHERE product_id=?').run(o.fetchedAt,canon(cats),newState,pid);
    }
    this.db.prepare('INSERT OR IGNORE INTO product_sources VALUES (?,?,?)').run(pid,revisionId,role);
    if(!productIds.includes(pid))productIds.push(pid);
    return pid;
   };
   let mainId:string|null=null;
   if(x&&x.mainProduct.name&&!x.mainProduct.ambiguous){
    mainId=upsertProduct(x.mainProduct.name,{...x.mainProduct.identifiers},'extracted_unverified','main_product');
    for(const v of x.variants){
     const vk=productKey246({host,name:v.name,sku:v.sku});
     const vid='var_'+sha(mainId+'|'+vk.key).slice(0,24);
     this.db.prepare('INSERT OR IGNORE INTO variants VALUES (?,?,?,?,?)').run(vid,mainId,v.name,canon({sku:v.sku}),canon(v.properties));
     variantIds.push(vid);
    }
   }
   const named=new Map<string,string>();
   const ownerOf=(f:Fact245):string|null=>{
    if(f.product.ref==='main')return mainId;
    if(f.product.ref==='named'&&f.product.name){
     if(!named.has(f.product.name))named.set(f.product.name,upsertProduct(f.product.name,{},'discovered','named_in_table'));
     return named.get(f.product.name)!;}
    return null;
   };
   let retained=0;
   const keep=retention==='facts_retained'||retention==='local_pending_rights_review';
   const expires=retention==='local_pending_rights_review'?new Date(Date.parse(o.fetchedAt)+this.storage.localPendingRightsCache.expiresAfterDays*86400000).toISOString():null;
   const role=declarationRole246(o.source.sourceType);
   // Products named in comparison tables are identity metadata (state 'discovered'), kept under every non-blocked class.
   for(const f of facts)if(f.product.ref==='named')ownerOf(f);
   if(keep)for(const f of facts){
    const pid=ownerOf(f);if(!pid)continue;
    const vid=f.variant&&mainId===pid?variantIds.find(v=>(this.db.prepare('SELECT name FROM variants WHERE variant_id=?').get(v) as {name:string}).name===f.variant)??null:null;
    const did='dcl_'+sha(canon([revisionId,pid,vid,f.variant,f.section,f.propertyKey,f.value])).slice(0,24);
    const res=this.db.prepare(`INSERT OR IGNORE INTO declarations(declaration_id,revision_id,product_id,variant_id,property,property_key,value_json,
     raw_value,section,component,method,locator,flags_json,evidence_role,retention,state,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
     .run(did,revisionId,pid,vid,f.property,f.propertyKey,canon(f.value),f.rawValue.slice(0,120),f.section,f.component,f.method,f.locator.slice(-200),
      canon(f.flags),role,retention,'extracted_unverified',expires);
    if(Number(res.changes))retained++;
   }
   this.db.prepare('UPDATE revisions SET declarations_retained=? WHERE revision_id=?').run(retained,revisionId);
   this.db.prepare('INSERT OR IGNORE INTO sightings VALUES (?,?,?)').run(revisionId,o.fetchedAt,o.runId);
   if(x&&x.mainProduct.ambiguous)this.addGap('source',revisionId,'main_product_ambiguous',
    `page declares ${x.mainProduct.declaredProductCount} products; identity not assigned, ${x.ambiguous.length} values held back`,'resolve_main_product_identity',o.fetchedAt);
   if(!keep&&facts.length)this.addGap('product',mainId??revisionId,'declarations_not_retained_rights',
    `${facts.length} declarations observed; retention needs fact_storage permission or an operator storage decision`,'review_source_rights_then_reobserve',o.fetchedAt);
   if(verdict&&verdict!=='reuse_screening_decision')this.addGap('product',mainId??revisionId,'screening_required',
    `Phase193 verdict ${verdict}`,'screen_source_revision',o.fetchedAt);
   // Category-level aggregates over this category become stale when new declarations arrive.
   for(const c of o.categoryHypotheses)for(const n of this.invalidate(['category_observations:'+c],'new_observation'))stale.add(n);
   this.event('revision_ingested',{revisionId,url:o.url,sha256:o.sha256,retention,seen:facts.length,retained,superseded},o.fetchedAt);
   return {revisionId,newRevision:true,retention,productIds,variantIds,declarationsSeen:facts.length,declarationsRetained:retained,
    supersededRevisionIds:superseded,staleNodes:[...stale].sort(),screeningVerdict:verdict};
  });
 }
 /** Removes expired local pending-rights declarations; metadata and receipts stay. */
 purgeExpired246(asOf=new Date().toISOString()):number{
  const n=Number(this.db.prepare("UPDATE declarations SET state='expired_pending_rights',value_json='null',raw_value='' WHERE retention='local_pending_rights_review' AND expires_at<=? AND state!='expired_pending_rights'").run(asOf).changes);
  if(n)this.event('pending_rights_declarations_expired',{count:n},asOf);
  return n;
 }

 // ---------------- product knowledge reads and reviews ----------------
 product246(productId:string){
  const p=this.db.prepare('SELECT * FROM products WHERE product_id=?').get(productId) as Record<string,string>|undefined;
  if(!p)return null;
  return {productId,keyBasis:p.key_basis,name:p.name,brand:p.brand,declaredModel:p.declared_model,
   identifiers:JSON.parse(p.identifiers_json),identityState:p.identity_state as IdentityState246,
   categoryHypotheses:JSON.parse(p.category_hypotheses_json) as string[],firstSeen:p.first_seen,lastSeen:p.last_seen,
   variants:(this.db.prepare('SELECT * FROM variants WHERE product_id=? ORDER BY name').all(productId) as Record<string,string>[])
    .map(v=>({variantId:v.variant_id,name:v.name,identifiers:JSON.parse(v.identifiers_json),attributes:JSON.parse(v.attributes_json)})),
   sources:(this.db.prepare(`SELECT r.url,r.sha256,r.fetched_at,r.state,ps.role,s.source_type,r.retention FROM product_sources ps JOIN revisions r USING(revision_id)
    JOIN sources s USING(source_id) WHERE ps.product_id=? ORDER BY r.fetched_at`).all(productId) as Record<string,string>[]),
   rankingAuthorized:false as const,independentTestEvidence:false as const};
 }
 products246(filter:{category?:string}={}):string[]{
  const rows=this.db.prepare('SELECT product_id,category_hypotheses_json FROM products ORDER BY product_id').all() as {product_id:string;category_hypotheses_json:string}[];
  return rows.filter(r=>!filter.category||JSON.parse(r.category_hypotheses_json).includes(filter.category)).map(r=>r.product_id);
 }
 declarations246(productId:string,opts:{includeSuperseded?:boolean}={}){
  const rows=this.db.prepare(`SELECT * FROM declarations WHERE product_id=? ${opts.includeSuperseded?'':"AND state NOT IN ('superseded_by_revision','expired_pending_rights')"} ORDER BY property_key,declaration_id`).all(productId) as Record<string,string|number|null>[];
  return rows.map(r=>({declarationId:r.declaration_id as string,revisionId:r.revision_id as string,variantId:r.variant_id as string|null,
   property:r.property as string,propertyKey:r.property_key as string,value:JSON.parse(r.value_json as string) as Value245|null,
   rawValue:r.raw_value as string,section:r.section as string|null,method:r.method as string,evidenceRole:r.evidence_role as string,
   retention:r.retention as RetentionClass246,state:r.state as DeclarationState246,flags:JSON.parse(r.flags_json as string) as string[],
   verifiedPurposes:JSON.parse(r.verified_purposes_json as string) as string[],independentTestEvidence:false as const,rankingAuthorized:false as const}));
 }
 /** Unresolved disagreements: same product/variant/section/property with different current values. */
 conflicts246(productId:string){
  const d=this.declarations246(productId);const g=new Map<string,typeof d>();
  for(const x of d){const k=[x.variantId,x.section,x.propertyKey].join('|');g.set(k,[...(g.get(k)??[]),x]);}
  return [...g].filter(([,v])=>new Set(v.map(x=>canon(x.value))).size>1).map(([k,v])=>({key:k,values:v.map(x=>({value:x.value,revisionId:x.revisionId}))}));
 }
 reviewProductIdentity246(productId:string,receipt:ReviewReceipt246,verify:(r:ReviewReceipt246)=>boolean):void{
  if(!verify||!verify(receipt))throw Error('246_review_not_verified');
  this.tx(()=>{
   const n=this.db.prepare("UPDATE products SET identity_state='reviewed',identity_review_json=? WHERE product_id=?").run(canon(receipt),productId).changes;
   if(!n)throw Error('246_unknown_product');
   this.event('product_identity_reviewed',{productId,reviewId:receipt.reviewId},receipt.reviewedAt);
   this.invalidate(['product:'+productId],'identity_reviewed');
  });
 }
 /** Marks a declaration usable for one named purpose. Requires retained rights and an independent verifier.
  * It never turns a declaration into test evidence or a ranking input. */
 verifyDeclarationForPurpose246(declarationId:string,purpose:string,receipt:ReviewReceipt246,verify:(r:ReviewReceipt246)=>boolean):void{
  if(!ident(purpose))throw Error('246_invalid_purpose');
  const r=this.db.prepare('SELECT retention,state,verified_purposes_json FROM declarations WHERE declaration_id=?').get(declarationId) as {retention:string;state:string;verified_purposes_json:string}|undefined;
  if(!r)throw Error('246_unknown_declaration');
  if(r.retention!=='facts_retained')throw Error('246_rights_insufficient_for_promotion');
  if(r.state==='superseded_by_revision'||r.state==='expired_pending_rights')throw Error('246_declaration_not_current');
  if(!verify||!verify(receipt))throw Error('246_review_not_verified');
  const purposes=[...new Set([...JSON.parse(r.verified_purposes_json),purpose])].sort();
  this.tx(()=>{
   this.db.prepare("UPDATE declarations SET state='verified_for_purpose',review_json=?,verified_purposes_json=? WHERE declaration_id=?").run(canon(receipt),canon(purposes),declarationId);
   this.event('declaration_verified_for_purpose',{declarationId,purpose,reviewId:receipt.reviewId},receipt.reviewedAt);
   this.invalidate(['decl:'+declarationId],'declaration_reviewed');
  });
 }

 // ---------------- research gaps ----------------
 addGap(scope:'product'|'category'|'source',refId:string,kind:string,detail:string,nextAction:string,at=new Date().toISOString()):string{
  const id='gap_'+sha(canon([scope,refId,kind])).slice(0,20);
  this.db.prepare('INSERT OR IGNORE INTO research_gaps VALUES (?,?,?,?,?,?,?,NULL)').run(id,scope,refId,kind,detail.slice(0,300),nextAction,at);
  return id;
 }
 gaps246(filter:{scope?:string;refId?:string}={}){
  return (this.db.prepare('SELECT * FROM research_gaps WHERE resolved_at IS NULL ORDER BY gap_id').all() as Record<string,string>[])
   .filter(g=>(!filter.scope||g.scope===filter.scope)&&(!filter.refId||g.ref_id===filter.refId));
 }

 // ---------------- category knowledge ----------------
 addCategoryItem246(i:CategoryItemInput246,at=new Date().toISOString()):string{
  if(!ident(i.categoryId)||!CATEGORY_SECTIONS246.includes(i.section)||!shortText(i.statement))throw Error('246_invalid_category_item');
  if(i.knowledgeClass==='reviewed_general_knowledge'||i.knowledgeClass==='evidence_supported_finding')
   throw Error('246_reviewed_classes_require_review_promotion');
  if(i.knowledgeClass==='observed_pattern'&&i.provenance!=='source_declaration_aggregate')throw Error('246_pattern_requires_aggregate_provenance');
  const revs=[...(i.sourceRevisionIds??[])];
  for(const r of revs)if(!this.db.prepare('SELECT 1 FROM revisions WHERE revision_id=?').get(r))throw Error('246_unknown_source_revision');
  if(i.provenance==='professional_method_reference'&&!revs.length)throw Error('246_method_reference_requires_source');
  if(i.concept&&(!ident(i.concept.id)||!i.concept.aliases.length))throw Error('246_invalid_concept');
  const id='cat_'+sha(canon([i.categoryId,i.section,norm(i.statement)])).slice(0,20);
  return this.tx(()=>{
   const exists=this.db.prepare('SELECT 1 FROM category_items WHERE item_id=?').get(id);
   if(!exists){
    this.db.prepare('INSERT INTO category_items VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NULL,?,?,NULL)').run(id,i.categoryId,i.section,i.statement,
     i.knowledgeClass,i.provenance,canon(revs),i.studyStream??null,i.concept?.kind??null,i.concept?.id??null,canon(i.concept?.aliases??[]),
     'proposed_unverified',at,at);
    this.event('category_item_added',{itemId:id,categoryId:i.categoryId,class:i.knowledgeClass},at);
    this.invalidate(['category:'+i.categoryId],'category_item_added');
   }
   return id;
  });
 }
 /** Review promotion. reviewed_general_knowledge needs a verified receipt; evidence_supported_finding also
  * needs at least one cited revision from an independent original-test source. */
 reviewCategoryItem246(itemId:string,toClass:'reviewed_general_knowledge'|'evidence_supported_finding',receipt:ReviewReceipt246,
  verify:(r:ReviewReceipt246)=>boolean):void{
  const it=this.db.prepare('SELECT * FROM category_items WHERE item_id=?').get(itemId) as Record<string,string>|undefined;
  if(!it)throw Error('246_unknown_category_item');
  if(!verify||!verify(receipt)||!receipt.sourceRevisionIds.length)throw Error('246_review_not_verified');
  for(const r of receipt.sourceRevisionIds)if(!this.db.prepare('SELECT 1 FROM revisions WHERE revision_id=?').get(r))throw Error('246_unknown_source_revision');
  if(toClass==='evidence_supported_finding'){
   const ok=receipt.sourceRevisionIds.some(r=>(this.db.prepare('SELECT s.source_type FROM revisions r JOIN sources s USING(source_id) WHERE r.revision_id=?').get(r) as {source_type:string}).source_type==='independent_original_test');
   if(!ok)throw Error('246_finding_requires_independent_original_test');
  }
  this.tx(()=>{
   this.db.prepare("UPDATE category_items SET state='reviewed',knowledge_class=?,review_json=?,updated_at=? WHERE item_id=?").run(toClass,canon(receipt),receipt.reviewedAt,itemId);
   this.event('category_item_reviewed',{itemId,toClass,reviewId:receipt.reviewId},receipt.reviewedAt);
   this.invalidate(['category:'+it.category_id,'catitem:'+itemId],'category_item_reviewed');
  });
 }
 categoryItems246(categoryId:string){
  return (this.db.prepare("SELECT * FROM category_items WHERE category_id=? AND superseded_by IS NULL ORDER BY section,item_id").all(categoryId) as Record<string,string>[])
   .map(r=>({itemId:r.item_id,section:r.section as CategorySection246,statement:r.statement,knowledgeClass:r.knowledge_class as KnowledgeClass246,
    provenance:r.provenance as ItemProvenance246,sourceRevisionIds:JSON.parse(r.source_revision_ids_json) as string[],studyStream:r.study_stream,
    concept:r.concept_id?{kind:r.concept_kind as ConceptKind128,id:r.concept_id,aliases:JSON.parse(r.aliases_json) as string[]}:null,
    state:r.state as 'proposed_unverified'|'reviewed',review:r.review_json?JSON.parse(r.review_json) as ReviewReceipt246:null}));
 }
 /** Observed category patterns from RETAINED, current declarations of distinct products (or, if the storage
  * policy allows, from transient counts supplied by the caller). Frequency is reported, never importance. */
 deriveObservedPatterns246(categoryId:string,at=new Date().toISOString()):string[]{
  const rows=this.db.prepare(`SELECT d.product_id,d.property_key,d.property,d.value_json FROM declarations d JOIN products p USING(product_id)
   WHERE d.state IN ('extracted_unverified','reviewed','verified_for_purpose') AND p.category_hypotheses_json LIKE ?`).all('%"'+categoryId+'"%') as Record<string,string>[];
  const by=new Map<string,{label:string;products:Set<string>;nums:number[];unit:string|null}>();
  for(const r of rows){
   const v=JSON.parse(r.value_json) as Value245;const e=by.get(r.property_key)??{label:r.property,products:new Set(),nums:[],unit:null};
   e.products.add(r.product_id);
   if(v&&(v.kind==='quantity'||v.kind==='price')){const n=v.kind==='quantity'?v.number:v.amount;const u=v.kind==='quantity'?v.unit:v.currency;
    if(e.unit===null||e.unit===u){e.unit=u;e.nums.push(n);}}
   by.set(r.property_key,e);
  }
  const total=new Set(rows.map(r=>r.product_id)).size;const ids:string[]=[];
  for(const [key,e] of [...by].sort((a,b)=>a[0].localeCompare(b[0]))){
   if(e.products.size<2)continue;
   const range=e.nums.length>=2?`; declared values ${Math.min(...e.nums)}–${Math.max(...e.nums)} ${e.unit}`:'';
   const id=this.addCategoryItem246({categoryId,section:'technical_characteristics',knowledgeClass:'observed_pattern',
    provenance:'source_declaration_aggregate',studyStream:'product_variant_observations',
    statement:`"${e.label}" declared for ${e.products.size} of ${total} observed products${range}. Frequency of declaration is not evidence of importance or performance.`.slice(0,300)},at);
   ids.push(id);
   this.registerDerived246('pattern:'+categoryId+':'+key,'observed_pattern',['category_observations:'+categoryId],sha(id));
  }
  return ids;
 }
 /** Versioned category profile: sections with classes kept apart. Committing a version is append-only. */
 categoryProfile246(categoryId:string){
  const items=this.categoryItems246(categoryId);
  const sections=Object.fromEntries(CATEGORY_SECTIONS246.map(s=>[s,{
   observedPatterns:items.filter(i=>i.section===s&&i.knowledgeClass==='observed_pattern'),
   technicalHypotheses:items.filter(i=>i.section===s&&i.knowledgeClass==='technical_hypothesis'),
   reviewedGeneralKnowledge:items.filter(i=>i.section===s&&i.knowledgeClass==='reviewed_general_knowledge'),
   evidenceSupportedFindings:items.filter(i=>i.section===s&&i.knowledgeClass==='evidence_supported_finding')}]));
  const body={categoryId,items:items.map(i=>[i.itemId,i.knowledgeClass,i.state,i.review?.reviewId??null])};
  const version=(this.db.prepare('SELECT MAX(version) AS v FROM category_versions WHERE category_id=?').get(categoryId) as {v:number|null}).v??0;
  return {schema:'pee246.category-profile.v1',categoryId,version,profileSha256:sha(canon(body)),sections,
   counts:{items:items.length,reviewed:items.filter(i=>i.state==='reviewed').length,hypotheses:items.filter(i=>i.knowledgeClass==='technical_hypothesis').length,
    patterns:items.filter(i=>i.knowledgeClass==='observed_pattern').length},
   products:this.products246({category:categoryId}).length,gaps:this.gaps246({scope:'category',refId:categoryId}).length,
   rankingAuthorized:false as const,performanceEstablished:false as const};
 }
 commitCategoryVersion246(categoryId:string,reason:string,at=new Date().toISOString()):{version:number;profileSha256:string;changed:boolean}{
  const p=this.categoryProfile246(categoryId);
  const last=this.db.prepare('SELECT version,profile_sha256 FROM category_versions WHERE category_id=? ORDER BY version DESC LIMIT 1').get(categoryId) as {version:number;profile_sha256:string}|undefined;
  if(last&&last.profile_sha256===p.profileSha256)return {version:last.version,profileSha256:p.profileSha256,changed:false};
  const version=(last?.version??0)+1;
  this.db.prepare('INSERT INTO category_versions VALUES (?,?,?,?,?,?)').run(categoryId,version,p.profileSha256,last?.profile_sha256??null,at,reason.slice(0,200));
  this.event('category_version_committed',{categoryId,version,profileSha256:p.profileSha256},at);
  return {version,profileSha256:p.profileSha256,changed:true};
 }
 categoryVersions246(categoryId:string){return this.db.prepare('SELECT * FROM category_versions WHERE category_id=? ORDER BY version').all(categoryId);}

 // ---------------- derived artifacts and invalidation ----------------
 registerDerived246(nodeId:string,kind:string,deps:readonly string[],resultSha256:string|null=null):void{
  const old=this.db.prepare('SELECT deps_json FROM derived_nodes WHERE node_id=?').get(nodeId) as {deps_json:string}|undefined;
  if(old&&old.deps_json!==canon([...deps].sort()))throw Error('246_derived_dependencies_changed_use_new_node');
  if(!old){this.db.prepare('INSERT INTO derived_nodes VALUES (?,?,?,?,?,?,NULL)').run(nodeId,kind,canon([...deps].sort()),resultSha256?'fresh':'stale',resultSha256,resultSha256?new Date().toISOString():null);
   for(const d of deps)this.db.prepare('INSERT OR IGNORE INTO derived_edges VALUES (?,?)').run(d,nodeId);}
  else if(resultSha256)this.markComputed246(nodeId,resultSha256);
 }
 markComputed246(nodeId:string,resultSha256:string):void{
  this.db.prepare("UPDATE derived_nodes SET state='fresh',result_sha256=?,computed_at=?,stale_reason=NULL WHERE node_id=?").run(resultSha256,new Date().toISOString(),nodeId);
 }
 /** Marks every node reachable from the changed keys as stale (transitively); returns their ids. */
 private invalidate(keys:readonly string[],reason:string):string[]{
  const seen=new Set<string>();const queue=[...keys];
  while(queue.length){
   const k=queue.shift()!;
   for(const r of this.db.prepare('SELECT node_id FROM derived_edges WHERE dep_key=?').all(k) as {node_id:string}[]){
    if(seen.has(r.node_id))continue;seen.add(r.node_id);
    this.db.prepare("UPDATE derived_nodes SET state='stale',stale_reason=? WHERE node_id=?").run(reason,r.node_id);
    queue.push('node:'+r.node_id);
   }
  }
  return [...seen].sort();
 }
 staleNodes246(){return this.db.prepare("SELECT node_id,kind,stale_reason FROM derived_nodes WHERE state='stale' ORDER BY node_id").all() as {node_id:string;kind:string;stale_reason:string|null}[];}
 derivedNode246(nodeId:string){return this.db.prepare('SELECT * FROM derived_nodes WHERE node_id=?').get(nodeId) as {state:string;result_sha256:string|null}|undefined;}

 // ---------------- Phase128 bridge ----------------
 /** Builds a Phase128 CategoryBrain128 from this store's category items: reviewed items with a concept become
  * reviewed definitions (their review cites store sources mapped to Phase128 source roles); everything else
  * stays proposed_unverified. Sources whose type has no Phase128 role cannot back a reviewed concept. */
 categoryBrain246(categoryId:string,aliases:readonly string[]):CategoryBrain128{
  const roleOf:Partial<Record<SourceType246,SourceRef128['role']>>={independent_original_test:'original_product_test',
   manufacturer:'manufacturer_specification',community:'user_problem_report'};
  const items=this.categoryItems246(categoryId).filter(i=>i.concept);
  const sources=new Map<string,SourceRef128>();
  const refFor=(revId:string,method:boolean):string|null=>{
   const r=this.db.prepare('SELECT r.url,r.revision_id,s.source_type FROM revisions r JOIN sources s USING(source_id) WHERE r.revision_id=?').get(revId) as {url:string;revision_id:string;source_type:SourceType246}|undefined;
   if(!r)return null;
   const role=method&&(r.source_type==='independent_original_test'||r.source_type==='editorial')?'original_expert_method':roleOf[r.source_type];
   if(!role)return null;
   const id=('src_'+r.revision_id.replace(/^rev_/,'')).slice(0,80);
   sources.set(id,{id,url:r.url,title:'Source revision '+r.revision_id,originalDocumentId:('doc_'+r.revision_id.replace(/^rev_/,'')).slice(0,80),role});
   return id;
  };
  const concepts:Concept128[]=[];
  for(const i of items){
   const refs=(i.review?.sourceRevisionIds??[]).map(r=>refFor(r,i.provenance==='professional_method_reference')).filter(Boolean) as string[];
   const reviewed=i.state==='reviewed'&&refs.length>0;
   const base={id:i.concept!.id,kind:i.concept!.kind,label:i.statement.slice(0,160).trim(),aliases:[...new Map(i.concept!.aliases.map(a=>[a.toLowerCase(),a.trim()])).values()],evidenceKeys:[]};
   if(concepts.some(c=>c.id===base.id))continue;
   concepts.push(reviewed?{...base,state:'reviewed_definition',review:{reviewId:ident(i.review!.reviewId)?i.review!.reviewId:'r_'+sha(i.review!.reviewId).slice(0,12),
    reviewerId:ident(i.review!.reviewerId)?i.review!.reviewerId:'reviewer_'+sha(i.review!.reviewerId).slice(0,8),sourceRefIds:[...new Set(refs)].sort(),reviewScope:'category_definition'} as Review128}:
    {...base,state:'proposed_unverified'});
  }
  const brain:CategoryBrain128={categoryId,schemaVersion:1,aliases:[...aliases],sources:[...sources.values()].sort((a,b)=>a.id.localeCompare(b.id)),
   concepts:concepts.sort((a,b)=>a.id.localeCompare(b.id)),quality:[],distinctions:[]};
  validateBrain128(brain);
  return brain;
 }
 /** Compiles the Phase128 projection and records it as a derived node depending on the category items. */
 compileCategory246(categoryId:string,aliases:readonly string[]){
  const compiled=compileCategoryKnowledge128(this.categoryBrain246(categoryId,aliases));
  this.registerDerived246('compiled128:'+categoryId,'phase128_compiled_category',['category:'+categoryId]);
  this.markComputed246('compiled128:'+categoryId,compiled.ontologySnapshot);
  return compiled;
 }

 // ---------------- Phase243 bridge ----------------
 /** Store products as Phase243 candidates; research state follows what is actually stored. */
 candidates243(categoryId:string,market:string,familyId='unreviewed_family'):CandidateResearch243[]{
  return this.products246({category:categoryId}).map(pid=>{
   const p=this.product246(pid)!;const d=this.declarations246(pid);
   return {product:{id:pid,categoryId,market,familyId,stage:d.length?'structured_record':'discovery_stub',editorialAppearances:[],
    officialProductIdentityConfirmed:p.identityState==='reviewed',marketListingConfirmed:false,novelVerifiedTechnicalFeature:false,
    explicitNeedTriggered:false,validatedNicheFit:false,verifiedDiscontinued:false},
    researchState:p.sources.some(s=>s.role==='main_product')?'cheap_screened':'unseen',signals:[],suspendedUnderScope:null,reviewedHighPotential:false};
  });
 }

 // ---------------- export, import, backup ----------------
 /** JSON export. Pending-rights declarations are excluded unless explicitly requested; never page bodies. */
 export246(opts:{includePendingRights?:boolean}={}){
  const tables:Record<string,unknown[]>={};
  for(const t of ['sources','revisions','sightings','products','variants','product_sources','declarations','category_items','category_versions',
   'derived_nodes','derived_edges','host_access','research_gaps','events']){
   let rows=this.db.prepare(`SELECT * FROM ${t}`).all() as Record<string,unknown>[];
   if(t==='declarations'&&!opts.includePendingRights)rows=rows.filter(r=>r.retention==='facts_retained');
   tables[t]=rows;
  }
  const body={schema:'pee246.knowledge-export.v1',storeSchemaVersion:this.schemaVersion(),storagePolicy:this.storage,
   includesPendingRights:!!opts.includePendingRights,
   notice:opts.includePendingRights?'CONTAINS DECLARATIONS PENDING RIGHTS REVIEW: local use only, not for publication or redistribution.':
    'Declarations limited to sources whose policy permits fact storage.',tables};
  return {...body,contentSha256:sha(canon(body))};
 }
 writeExport246(path:string,opts:{includePendingRights?:boolean}={}):string{
  const e=this.export246(opts);mkdirSync(dirname(path),{recursive:true});
  const tmp=path+'.tmp';writeFileSync(tmp,JSON.stringify(e)+'\n',{mode:0o600});renameSync(tmp,path);return e.contentSha256;
 }
 /** Rebuilds a store from an export into a NEW database file (refuses to overwrite). */
 static import246(exportPath:string,dbPath:string,storage:StoragePolicy246=DEFAULT_STORAGE_POLICY246):KnowledgeStore246{
  const e=JSON.parse(readFileSync(exportPath,'utf8'));
  const {contentSha256,...body}=e;
  if(e.schema!=='pee246.knowledge-export.v1'||sha(canon(body))!==contentSha256)throw Error('246_export_integrity_failed');
  if(e.storeSchemaVersion>STORE_SCHEMA_VERSION246)throw Error('246_export_newer_than_software');
  if(existsSync(dbPath))throw Error('246_import_target_exists');
  const s=new KnowledgeStore246(dbPath,storage);
  s.db.exec('PRAGMA foreign_keys=OFF; BEGIN IMMEDIATE; DROP TRIGGER events_no_update; DROP TRIGGER events_no_delete;');
  try{
   for(const [t,rows] of Object.entries(e.tables as Record<string,Record<string,unknown>[]>)){
    for(const r of rows){const cols=Object.keys(r);
     s.db.prepare(`INSERT INTO ${t}(${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`).run(...cols.map(c=>r[c] as never));}
   }
   s.db.exec(`CREATE TRIGGER events_no_update BEFORE UPDATE ON events BEGIN SELECT RAISE(ABORT,'append_only_events'); END;
    CREATE TRIGGER events_no_delete BEFORE DELETE ON events BEGIN SELECT RAISE(ABORT,'append_only_events'); END; COMMIT; PRAGMA foreign_keys=ON;`);
  }catch(err){s.db.exec('ROLLBACK');s.close();rmSync(dbPath,{force:true});throw err;}
  if(!s.verifyJournal().ok){s.close();throw Error('246_imported_journal_broken');}
  return s;
 }
 /** Consistent online backup (SQLite VACUUM INTO) to a new file. */
 backup246(destPath:string):void{
  if(existsSync(destPath))throw Error('246_backup_target_exists');
  mkdirSync(dirname(destPath),{recursive:true});
  this.db.exec(`VACUUM INTO '${destPath.replace(/'/g,"''")}'`);
 }
 stats246(){
  const c=(sql:string)=>(this.db.prepare(sql).get() as {n:number}).n;
  return {schemaVersion:this.schemaVersion(),sources:c('SELECT COUNT(*) n FROM sources'),revisions:c('SELECT COUNT(*) n FROM revisions'),
   sightings:c('SELECT COUNT(*) n FROM sightings'),products:c('SELECT COUNT(*) n FROM products'),variants:c('SELECT COUNT(*) n FROM variants'),
   declarations:c('SELECT COUNT(*) n FROM declarations'),declarationsRetained:c("SELECT COUNT(*) n FROM declarations WHERE retention='facts_retained'"),
   declarationsPendingRights:c("SELECT COUNT(*) n FROM declarations WHERE retention='local_pending_rights_review' AND state!='expired_pending_rights'"),
   declarationsObservedNotRetained:c('SELECT COALESCE(SUM(declarations_seen-declarations_retained),0) n FROM revisions'),
   categoryItems:c('SELECT COUNT(*) n FROM category_items'),categoryVersions:c('SELECT COUNT(*) n FROM category_versions'),
   staleDerived:c("SELECT COUNT(*) n FROM derived_nodes WHERE state='stale'"),openGaps:c('SELECT COUNT(*) n FROM research_gaps WHERE resolved_at IS NULL'),
   events:c('SELECT COUNT(*) n FROM events'),suspendedHosts:c('SELECT COUNT(*) n FROM host_access WHERE suspended_until IS NOT NULL')};
 }
}
