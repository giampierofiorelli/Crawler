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
import {mkdirSync,existsSync,writeFileSync,readFileSync,renameSync,rmSync,readdirSync,copyFileSync,statSync} from 'node:fs';
import {dirname,join,resolve as resolvePath} from 'node:path';
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
import {classDecision249,type SourceClassPolicy249,type Reservations249} from './phase249_retention_policy.js';

export const STORE_SCHEMA_VERSION246=4;
/** Version of the store's identity rules; part of the derivation version recorded per revision, so a rule
 * change re-derives revisions whose bytes are available, like an extractor change. */
export const IDENTITY_RULES246='identity-4';
export type SourceType246='manufacturer'|'retailer'|'independent_original_test'|'editorial'|'community'|
 'promotional_announcement'|'reference_encyclopedia'|'unknown';
/** facts_retained_class_policy (Phase249): individual factual declarations kept privately under a documented
 * source-class policy (no per-source grant); never published, capped per host, reservations honoured. */
export type RetentionClass246='facts_retained'|'facts_retained_class_policy'|'local_pending_rights_review'|'metadata_only'|'blocked';
/** Retention classes whose declaration values are kept in the private store. */
export const VALUE_RETAINING246:readonly RetentionClass246[]=['facts_retained','facts_retained_class_policy','local_pending_rights_review'];
export type IdentityState246='discovered'|'extracted_unverified'|'reviewed'|'unsupported_after_rederivation'|'merged';
export type DeclarationState246='extracted_unverified'|'reviewed'|'verified_for_purpose'|'superseded_by_revision'|'superseded_by_extractor'|'expired_pending_rights';
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
 /** Phase249 source-class policy for factual observations (private, capped). Absent = per-source grants only. */
 classPolicy?:SourceClassPolicy249|null;
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
/** Phase252: the single model-code token of a product page URL's last path segment ("/microwaves/qs204aeb/",
 * "/henry-cordless-hvb160/"), or null when there is none or more than one. Used only to keep apart two pages that
 * share a generic name; a URL token is never used to merge anything. */
export function urlModelToken252(url:string):string|null{
 let seg='';try{seg=new URL(url).pathname.split('/').filter(Boolean).pop()??'';}catch{return null;}
 const t=[...new Set(seg.toLowerCase().split(/[-_.+]/).filter(x=>/^(?=[a-z0-9]*\d)(?=[a-z0-9]*[a-z])[a-z0-9]{4,}$/.test(x)))];
 return t.length===1?t[0]:null;
}
/** Every exact-identifier key of one identity, strongest first. The host-scoped name is used only when no
 * identifier exists. Two records sharing any of these keys denote the same product. */
export function productKeys246(i:Parameters<typeof productKey246>[0]):string[]{
 const keys:string[]=[];const g=i.gtin?validGtin246(i.gtin):null;
 if(g)keys.push('gtin:'+g);
 if(i.brand&&i.mpn&&i.mpn.trim().length>=3)keys.push(`mpn:${slug(i.brand)}:${slug(i.mpn)}`);
 if(i.productGroupId)keys.push(`group:${i.host}:${slug(i.productGroupId)}`);
 if(i.sku)keys.push(`sku:${i.host}:${slug(i.sku)}`);
 if(!keys.length)keys.push(productKey246(i).key);
 return keys;
}
/** Rights gate: what may be kept from one source under this installation's storage policy. */
export function retentionFor246(policy:WebSourcePolicy|undefined,storage:StoragePolicy246,asOf:string):RetentionClass246{
 if(!policy)return storage.localPendingRightsCache.enabled?'local_pending_rights_review':'metadata_only';
 if(policy.basis==='refused'||policy.websiteTerms==='reviewed_prohibited'||policy.robots==='disallowed')return 'blocked';
 if(approvedMetadataDiscovery75(policy,asOf)&&policy.permittedOperations.includes('fact_storage'))return 'facts_retained';
 return storage.localPendingRightsCache.enabled?'local_pending_rights_review':'metadata_only';
}
/** Retention with the Phase249 class policy: a per-source decision (grant, refusal, prohibited terms, robots) always
 * wins; otherwise the class policy applies, subject to per-observation checks at ingest (reservations, host cap). */
function retentionWithClassPolicy(policy:WebSourcePolicy|undefined,storage:StoragePolicy246,asOf:string):RetentionClass246{
 const base=retentionFor246(policy,storage,asOf);
 if(base!=='metadata_only'&&base!=='local_pending_rights_review')return base;
 if(policy&&(policy.basis==='refused'||policy.websiteTerms==='reviewed_prohibited'||policy.robots==='disallowed'))return base;
 return storage.classPolicy?'facts_retained_class_policy':base;
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
 // v2: alias keys, so an identity found later under a stronger identifier resolves to the same product.
 `CREATE TABLE product_keys (key TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(product_id));
  INSERT OR IGNORE INTO product_keys SELECT json_extract(identifiers_json,'$._key'),product_id FROM products WHERE json_extract(identifiers_json,'$._key') IS NOT NULL;`,
 // v3: which attributes a page declares (labels only, never values: page-structure metadata kept under every
 // non-blocked retention class), and typed, source-graded relations between category items.
 `CREATE TABLE revision_properties (revision_id TEXT NOT NULL REFERENCES revisions(revision_id), product_id TEXT NOT NULL,
   property_key TEXT NOT NULL, property_label TEXT NOT NULL, PRIMARY KEY(revision_id,product_id,property_key));
  CREATE TABLE category_relations (relation_id TEXT PRIMARY KEY, category_id TEXT NOT NULL, from_ref TEXT NOT NULL, to_ref TEXT NOT NULL,
   kind TEXT NOT NULL, support TEXT NOT NULL, qualification TEXT NOT NULL, source_revision_ids_json TEXT NOT NULL,
   review_json TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`,
 // v4 (Phase260): source memory. The authority is the hash-chained events journal; this table is only its projection,
 // rebuilt deterministically by phase260_source_memory_store.ts. Triggers keep it read-only outside that module's own
 // transaction, and the CHECK columns state what a memory record never is: evidence, an access permission or a ranking.
 `CREATE TABLE source_memory260 (record_id TEXT PRIMARY KEY, kind TEXT NOT NULL, event_seq INTEGER NOT NULL,
   source_id TEXT NOT NULL REFERENCES sources(source_id), revision_id TEXT REFERENCES revisions(revision_id),
   product_id TEXT REFERENCES products(product_id), criterion TEXT, field TEXT, value_json TEXT NOT NULL,
   basis TEXT NOT NULL CHECK(basis IN ('operator_annotation','verifier_accepted','unverified_claim')), review_id TEXT,
   supersedes TEXT, superseded_by TEXT, recorded_at TEXT NOT NULL, payload_sha256 TEXT NOT NULL,
   evidence_admitted INTEGER NOT NULL DEFAULT 0 CHECK(evidence_admitted=0),
   access_authorized INTEGER NOT NULL DEFAULT 0 CHECK(access_authorized=0),
   ranking_authorized INTEGER NOT NULL DEFAULT 0 CHECK(ranking_authorized=0));
  CREATE INDEX source_memory260_source ON source_memory260(source_id,kind);
  CREATE TRIGGER source_memory260_ro_insert BEFORE INSERT ON source_memory260 WHEN COALESCE((SELECT v FROM store_meta WHERE k='source_memory260_writer'),'0')<>'1'
   BEGIN SELECT RAISE(ABORT,'source_memory260_read_only_projection'); END;
  CREATE TRIGGER source_memory260_ro_update BEFORE UPDATE ON source_memory260 WHEN COALESCE((SELECT v FROM store_meta WHERE k='source_memory260_writer'),'0')<>'1'
   BEGIN SELECT RAISE(ABORT,'source_memory260_read_only_projection'); END;
  CREATE TRIGGER source_memory260_ro_delete BEFORE DELETE ON source_memory260 WHEN COALESCE((SELECT v FROM store_meta WHERE k='source_memory260_writer'),'0')<>'1'
   BEGIN SELECT RAISE(ABORT,'source_memory260_read_only_projection'); END;`,
];

export interface SourceInput246 {sourceId:string;host:string;sourceType:SourceType246;
 sourceTypeBasis:'operator_asserted'|'heuristic_unverified';policy?:WebSourcePolicy;}
export interface ObservationInput246 {
 source:SourceInput246;url:string;sha256:string;bytes:number;httpStatus:number;fetchedAt:string;runId:string;
 extractorVersion:string;extraction:SpecExtraction245|null;categoryHypotheses:readonly string[];
 /** Optional Phase193 ledger to link screening decisions for this revision. */
 screening?:{ledger:ScreeningLedger193;market:string;policyVersion:string};
 /** Phase249: machine-readable reservations seen for this page (robots Content-Signal, TDM reservation, noai). */
 reservations?:Reservations249;
}
export interface IngestResult246 {revisionId:string;newRevision:boolean;rederived?:boolean;retention:RetentionClass246;
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
   // Phase249: the operational store holds private retained values; it must live outside any Git working tree
   // so it cannot be committed by accident (PEE_ALLOW_STORE_IN_REPO=1 for deliberate local experiments only).
   if(insideGitWorkTree249(path)&&!process.env.PEE_ALLOW_STORE_IN_REPO)throw Error('249_refusing_store_inside_git_worktree');
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
 event(kind:string,payload:unknown,at=new Date().toISOString()):void{
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
  const retention=retentionWithClassPolicy(s.policy,this.storage,asOf);
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
  const derivationVersion=o.extractorVersion+'+'+IDENTITY_RULES246;
  return this.tx(()=>{
   const retention=this.registerSource(o.source,o.fetchedAt);
   if(retention==='blocked'){this.event('observation_blocked',{url:o.url,sourceId:o.source.sourceId},o.fetchedAt);
    return {revisionId:'',newRevision:false,retention,productIds:[],variantIds:[],declarationsSeen:0,declarationsRetained:0,
     supersededRevisionIds:[],staleNodes:[],screeningVerdict:null};}
   const revisionId='rev_'+sha(o.url+'|'+o.sha256).slice(0,24);
   const existing=this.db.prepare('SELECT revision_id FROM revisions WHERE revision_id=?').get(revisionId);
   let rederive=false;let priorLinks:string[]=[];const stale=new Set<string>();
   if(existing){
    this.db.prepare('INSERT OR IGNORE INTO sightings VALUES (?,?,?)').run(revisionId,o.fetchedAt,o.runId);
    const prev=this.db.prepare('SELECT extractor_version,retention FROM revisions WHERE revision_id=?').get(revisionId) as {extractor_version:string;retention:string};
    // Same bytes, same extraction rules: nothing new to learn. Same bytes under NEW rules (or a retention
    // class that now allows keeping values): re-derive this revision only; reviewed declarations are kept.
    if(!o.extraction||(prev.extractor_version===derivationVersion&&prev.retention===retention)){
     this.event('revision_seen_again',{revisionId},o.fetchedAt);
     const products=(this.db.prepare('SELECT DISTINCT product_id FROM product_sources WHERE revision_id=?').all(revisionId) as {product_id:string}[]).map(r=>r.product_id);
     return {revisionId,newRevision:false,retention,productIds:products,variantIds:[],declarationsSeen:0,declarationsRetained:0,
      supersededRevisionIds:[],staleNodes:[],screeningVerdict:null};
    }
    rederive=true;
    // Product links of this revision are derived: recomputed under the new rules (products themselves are kept).
    priorLinks=(this.db.prepare('SELECT DISTINCT product_id FROM product_sources WHERE revision_id=?').all(revisionId) as {product_id:string}[]).map(r=>r.product_id);
    this.db.prepare('DELETE FROM product_sources WHERE revision_id=?').run(revisionId);
    this.db.prepare('DELETE FROM revision_properties WHERE revision_id=?').run(revisionId);
    const old=this.db.prepare("SELECT declaration_id FROM declarations WHERE revision_id=? AND state='extracted_unverified'").all(revisionId) as {declaration_id:string}[];
    this.db.prepare("UPDATE declarations SET state='superseded_by_extractor' WHERE revision_id=? AND state='extracted_unverified'").run(revisionId);
    for(const n of this.invalidate(['rev:'+revisionId,...old.map(d=>'decl:'+d.declaration_id)],'extraction_rules_changed'))stale.add(n);
    this.event('revision_rederived',{revisionId,from:prev.extractor_version,to:derivationVersion,retentionFrom:prev.retention,retentionTo:retention,superseded:old.length},o.fetchedAt);
   }
   // A different revision of the same URL supersedes the current one.
   const previous=rederive?[]:this.db.prepare("SELECT revision_id FROM revisions WHERE url=? AND state='current'").all(o.url) as {revision_id:string}[];
   const superseded:string[]=[];
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
   if(rederive)this.db.prepare('UPDATE revisions SET extractor_version=?,retention=?,declarations_seen=? WHERE revision_id=?').run(derivationVersion,retention,facts.length,revisionId);
   else this.db.prepare('INSERT INTO revisions VALUES (?,?,?,?,?,?,?,?,?,?,NULL,?,0,?,0)').run(revisionId,o.source.sourceId,o.url,o.sha256,o.bytes,o.httpStatus,
    o.fetchedAt,derivationVersion,retention,'current',verdict,facts.length);
   // Products and variants (identity metadata is retained under every non-blocked class).
   const productIds:string[]=[];const variantIds:string[]=[];
   const upsertProduct=(name:string|null,ids:Record<string,string>,state:IdentityState246,role:string):string=>{
    const ki={host,name,brand:ids.brand??null,gtin:ids.gtin13??ids.gtin14??ids.gtin12??ids.gtin8??ids.gtin??null,
     mpn:ids.mpn??null,sku:ids.sku??null,productGroupId:ids.productGroupID??null};
    let k:{key:string;basis:string}=productKey246(ki);let keys=productKeys246(ki);
    // Resolve through alias keys first: the same product may have been recorded under a weaker identifier.
    const lookup=(ks:string[])=>[...new Set(ks.map(key=>(this.db.prepare('SELECT product_id FROM product_keys WHERE key=?').get(key) as {product_id:string}|undefined)?.product_id).filter(Boolean) as string[])];
    let hits=lookup(keys);
    // Phase252: a generic page name ("20 Litre Microwave Oven") shared by two model pages of one host is not one
    // product. When the name-only key hits a product whose own pages carry a different model code in their URL, this
    // page's product is keyed by its own URL model code instead, and the collision is recorded as a gap.
    const token=k.basis==='host_name'&&role==='main_product'?urlModelToken252(o.url):null;
    if(token&&hits.length){
     const other=(this.db.prepare("SELECT r.url FROM product_sources ps JOIN revisions r USING(revision_id) WHERE ps.product_id=? AND ps.role='main_product'").all(hits[0]) as {url:string}[])
      .map(r=>urlModelToken252(r.url)).filter((x):x is string=>!!x);
     if(other.length&&!other.includes(token)){
      this.addGap('product',hits[0],'identity_name_shared_by_model_pages',`page ${o.url.slice(0,160)} has the same name but model code ${token}`,'review_identity_split',o.fetchedAt);
      k={key:`model:${host}:${token}`,basis:'host_model'};keys=[k.key];hits=lookup(keys);
     }
    }
    if(hits.length>1)this.addGap('product',hits[0],'identity_keys_split_across_products',`exact identifiers of one page product point to ${hits.length} stored products: ${hits.join(',')}`.slice(0,300),'review_identity_merge',o.fetchedAt);
    const pid=hits[0]??'prd_'+sha(k.key).slice(0,24);
    const row=this.db.prepare('SELECT identity_state,category_hypotheses_json,identifiers_json FROM products WHERE product_id=?').get(pid) as
     {identity_state:string;category_hypotheses_json:string;identifiers_json:string}|undefined;
    if(!row){
     this.db.prepare('INSERT INTO products VALUES (?,?,?,?,?,?,?,NULL,?,?,?)').run(pid,k.basis,name,ids.brand??null,ids.model??ids.mpn??null,
      canon({...ids,_key:k.key}),state,canon([...new Set(o.categoryHypotheses)].sort()),o.fetchedAt,o.fetchedAt);
    }else{
     const cats=[...new Set([...JSON.parse(row.category_hypotheses_json),...o.categoryHypotheses])].sort();
     const keepState=row.identity_state==='reviewed'?'reviewed':row.identity_state==='merged'?'merged':null;
     const newState=keepState??(state==='extracted_unverified'||row.identity_state==='unsupported_after_rederivation'?state==='discovered'&&row.identity_state!=='unsupported_after_rederivation'?row.identity_state:state:row.identity_state);
     // Identifiers only accumulate (first value per identifier kept); the original key stays the record's _key.
     const merged={...ids,...JSON.parse(row.identifiers_json)};
     this.db.prepare('UPDATE products SET last_seen=?,category_hypotheses_json=?,identity_state=?,identifiers_json=? WHERE product_id=?').run(o.fetchedAt,canon(cats),newState,canon(merged),pid);
    }
    for(const key of keys)this.db.prepare('INSERT OR IGNORE INTO product_keys VALUES (?,?)').run(key,pid);
    this.db.prepare('INSERT OR IGNORE INTO product_sources VALUES (?,?,?)').run(pid,revisionId,role);
    if(!productIds.includes(pid))productIds.push(pid);
    return pid;
   };
   let mainId:string|null=null;
   // A page title alone (h1/og:title without structured product data or any product declaration) is not
   // evidence that the page is about one product: category pages and app shells have titles too.
   // A product-type page (og:type product, or one or two purchase controls rather than a grid of them) also counts.
   const sig=x?.mainProduct.pageSignals;
   const productPage=!!sig&&(/^(?:product|og:product|product\.item)$/.test(sig.ogType??'')||(sig.purchaseControls>=1&&sig.purchaseControls<=2&&!/^(?:article|website|blog)$/.test(sig.ogType??'')));
   const productEvidence=!!x&&(x.mainProduct.source==='json_ld'||x.mainProduct.source==='microdata'||x.facts.some(f=>f.product.ref==='main')||productPage);
   if(x&&x.mainProduct.name&&!x.mainProduct.ambiguous&&!productEvidence)
    this.addGap('source',revisionId,'no_product_declared',`page title "${x.mainProduct.name.slice(0,80)}" without product data or declarations`,'classify_page_type',o.fetchedAt);
   if(x&&x.mainProduct.name&&!x.mainProduct.ambiguous&&productEvidence){
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
   // Phase249 class policy: per-observation checks (reservations, per-host cap) decide this revision's retention.
   let effective:RetentionClass246=retention;let kinds:readonly string[]|null=null;
   if(retention==='facts_retained_class_policy'&&this.storage.classPolicy){
    const counted=(this.db.prepare(`SELECT DISTINCT d.product_id FROM declarations d JOIN revisions r USING(revision_id) JOIN sources s ON s.source_id=r.source_id
     WHERE s.host=? AND d.retention='facts_retained_class_policy' AND d.state NOT IN ('superseded_by_revision','superseded_by_extractor')`).all(host) as {product_id:string}[]).map(r=>r.product_id);
    const d=classDecision249(this.storage.classPolicy,o.source.sourceType,o.reservations,counted.length,!!mainId&&counted.includes(mainId));
    if(d.retain)kinds=d.rule.valueKinds;
    else{effective='metadata_only';this.addGap('source',revisionId,d.reason,`class policy ${this.storage.classPolicy.policyId}: ${d.reason}`.slice(0,300),
     d.reason==='insubstantial_part_cap_reached'?'per_source_rights_review_to_exceed_cap':'respect_reservation_metadata_only',o.fetchedAt);}
    this.db.prepare('UPDATE revisions SET retention=? WHERE revision_id=?').run(effective,revisionId);
   }
   const keep=VALUE_RETAINING246.includes(effective);
   const expires=retention==='local_pending_rights_review'?new Date(Date.parse(o.fetchedAt)+this.storage.localPendingRightsCache.expiresAfterDays*86400000).toISOString():null;
   const role=declarationRole246(o.source.sourceType);
   // Products named in comparison tables are identity metadata (state 'discovered'), kept under every non-blocked class.
   for(const f of facts)if(f.product.ref==='named')ownerOf(f);
   // Attribute vocabulary (labels only) for every attributed declaration, whatever the retention class.
   for(const f of facts){const pid=f.product.ref==='main'?mainId:f.product.ref==='named'&&f.product.name?named.get(f.product.name)??null:null;
    if(pid)this.db.prepare('INSERT OR IGNORE INTO revision_properties VALUES (?,?,?,?)').run(revisionId,pid,f.propertyKey,f.property.slice(0,80));}
   if(keep)for(const f of facts){
    const pid=ownerOf(f);if(!pid)continue;
    if(kinds&&!kinds.includes(f.value.kind))continue;
    const vid=f.variant&&mainId===pid?variantIds.find(v=>(this.db.prepare('SELECT name FROM variants WHERE variant_id=?').get(v) as {name:string}).name===f.variant)??null:null;
    const did='dcl_'+sha(canon([revisionId,pid,vid,f.variant,f.section,f.propertyKey,f.value])).slice(0,24);
    // A declaration re-derived unchanged under new rules is revived rather than duplicated.
    const res=this.db.prepare(`INSERT INTO declarations(declaration_id,revision_id,product_id,variant_id,property,property_key,value_json,
     raw_value,section,component,method,locator,flags_json,evidence_role,retention,state,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(declaration_id) DO UPDATE SET state='extracted_unverified',retention=excluded.retention,expires_at=excluded.expires_at,
      method=excluded.method,locator=excluded.locator,flags_json=excluded.flags_json WHERE declarations.state='superseded_by_extractor'`)
     .run(did,revisionId,pid,vid,f.property,f.propertyKey,canon(f.value),f.rawValue.slice(0,120),f.section,f.component,f.method,f.locator.slice(-200),
      canon(f.flags),role,effective,'extracted_unverified',expires);
    if(Number(res.changes))retained++;
   }
   this.db.prepare('UPDATE revisions SET declarations_retained=? WHERE revision_id=?').run(retained,revisionId);
   this.db.prepare('INSERT OR IGNORE INTO sightings VALUES (?,?,?)').run(revisionId,o.fetchedAt,o.runId);
   for(const pid of priorLinks)if(!this.db.prepare('SELECT 1 FROM product_sources WHERE product_id=?').get(pid)){
    this.db.prepare("UPDATE products SET identity_state='unsupported_after_rederivation' WHERE product_id=? AND identity_state NOT IN ('reviewed','merged')").run(pid);
    this.event('product_unsupported_after_rederivation',{productId:pid,revisionId},o.fetchedAt);}
   if(x&&!x.mainProduct.ambiguous)this.resolveGaps246(revisionId,'main_product_ambiguous',o.fetchedAt);
   if(mainId)this.resolveGaps246(revisionId,'no_product_declared',o.fetchedAt);
   if(x&&x.mainProduct.ambiguous)this.addGap('source',revisionId,'main_product_ambiguous',
    `page declares ${x.mainProduct.declaredProductCount} products; identity not assigned, ${x.ambiguous.length} values held back`,'resolve_main_product_identity',o.fetchedAt);
   if(keep&&retained){for(const ref of [revisionId,mainId,...productIds].filter(Boolean) as string[])this.resolveGaps246(ref,'declarations_not_retained_rights',o.fetchedAt);}
   if(!keep&&facts.length)this.addGap('product',mainId??revisionId,'declarations_not_retained_rights',
    `${facts.length} declarations observed; retention needs fact_storage permission or an operator storage decision`,'review_source_rights_then_reobserve',o.fetchedAt);
   if(verdict&&verdict!=='reuse_screening_decision')this.addGap('product',mainId??revisionId,'screening_required',
    `Phase193 verdict ${verdict}`,'screen_source_revision',o.fetchedAt);
   // Category-level aggregates over this category become stale when new declarations arrive.
   for(const c of o.categoryHypotheses)for(const n of this.invalidate(['category_observations:'+c],'new_observation'))stale.add(n);
   this.event('revision_ingested',{revisionId,url:o.url,sha256:o.sha256,retention,seen:facts.length,retained,superseded},o.fetchedAt);
   return {revisionId,newRevision:!rederive,rederived:rederive,retention,productIds,variantIds,declarationsSeen:facts.length,declarationsRetained:retained,
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
 products246(filter:{category?:string;includeInactive?:boolean}={}):string[]{
  const rows=this.db.prepare(`SELECT product_id,category_hypotheses_json FROM products ${filter.includeInactive?'':"WHERE identity_state NOT IN ('unsupported_after_rederivation','merged')"} ORDER BY product_id`).all() as {product_id:string;category_hypotheses_json:string}[];
  return rows.filter(r=>!filter.category||JSON.parse(r.category_hypotheses_json).includes(filter.category)).map(r=>r.product_id);
 }
 declarations246(productId:string,opts:{includeSuperseded?:boolean}={}){
  const rows=this.db.prepare(`SELECT * FROM declarations WHERE product_id=? ${opts.includeSuperseded?'':"AND state NOT IN ('superseded_by_revision','superseded_by_extractor','expired_pending_rights')"} ORDER BY property_key,declaration_id`).all(productId) as Record<string,string|number|null>[];
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
  if(r.retention!=='facts_retained'&&r.retention!=='facts_retained_class_policy')throw Error('246_rights_insufficient_for_promotion');
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
 /** Closes open gaps of one kind for one reference (the gap row is kept with its resolution time). */
 resolveGaps246(refId:string,kind:string,at=new Date().toISOString()):number{
  const n=Number(this.db.prepare('UPDATE research_gaps SET resolved_at=? WHERE ref_id=? AND kind=? AND resolved_at IS NULL').run(at,refId,kind).changes);
  if(n)this.event('gap_resolved',{refId,kind,count:n},at);
  return n;
 }
 /** Maintenance: identity gaps of revisions that now have a main product are resolved. */
 reconcileIdentityGaps246(at=new Date().toISOString()):number{
  const rows=this.db.prepare(`SELECT g.ref_id,g.kind FROM research_gaps g WHERE g.kind IN ('main_product_ambiguous','no_product_declared') AND g.resolved_at IS NULL AND EXISTS
   (SELECT 1 FROM product_sources ps WHERE ps.revision_id=g.ref_id AND ps.role='main_product')`).all() as {ref_id:string;kind:string}[];
  return rows.reduce((a,r)=>a+this.resolveGaps246(r.ref_id,r.kind,at),0);
 }
 /** Phase249: closes 'declarations_not_retained_rights' gaps of products and revisions that now hold retained values
 * (after a retention policy change re-derived them). */
 reconcileRetentionGaps249(at=new Date().toISOString()):number{
  const refs=(this.db.prepare(`SELECT DISTINCT product_id ref FROM declarations WHERE state='extracted_unverified' AND retention IN ('facts_retained','facts_retained_class_policy','local_pending_rights_review')
   UNION SELECT DISTINCT revision_id FROM declarations WHERE state='extracted_unverified'`).all() as {ref:string}[]).map(r=>r.ref);
  let n=0;for(const r of refs)n+=this.resolveGaps246(r,'declarations_not_retained_rights',at);
  // Phase263: a rights gap must not outlive its cause. When no current revision linked to the product (or the revision
  // itself) is still held back by its retention class, the missing values are an extraction, identity or absence
  // question, not a rights one: the gap is closed and the reason journaled. Gaps of still-restricted revisions stay open.
  const open=this.db.prepare("SELECT DISTINCT ref_id FROM research_gaps WHERE kind='declarations_not_retained_rights' AND resolved_at IS NULL").all() as {ref_id:string}[];
  for(const {ref_id} of open){
   const linked=this.db.prepare(`SELECT r.retention FROM revisions r WHERE r.state='current' AND (r.revision_id=? OR r.revision_id IN (SELECT revision_id FROM product_sources WHERE product_id=?))`)
    .all(ref_id,ref_id) as {retention:string}[];
   if(linked.some(r=>!VALUE_RETAINING246.includes(r.retention as RetentionClass246)))continue;
   const closed=Number(this.db.prepare("UPDATE research_gaps SET resolved_at=? WHERE ref_id=? AND kind='declarations_not_retained_rights' AND resolved_at IS NULL").run(at,ref_id).changes);
   if(closed){n+=closed;this.event('gap_reclassified',{refId:ref_id,kind:'declarations_not_retained_rights',count:closed,
    reason:linked.length?'all_current_linked_revisions_retain_values':'no_current_linked_revision'},at);}
  }
  return n;
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
 /** Phase251: adds a category hypothesis to ONE product, with its evidence journaled (basis, citing revisions). It never
  * touches identity, never merges products and applies to that product's variants by construction. */
 assignProductCategory251(productId:string,categoryId:string,evidence:{basis:string[];revisionIds:string[];detail:string},at=new Date().toISOString()):boolean{
  if(!ident(categoryId)||!evidence.basis.length||!shortText(evidence.detail,300))throw Error('251_invalid_category_assignment');
  const row=this.db.prepare('SELECT category_hypotheses_json FROM products WHERE product_id=?').get(productId) as {category_hypotheses_json:string}|undefined;
  if(!row)throw Error('251_unknown_product');
  for(const r of evidence.revisionIds)if(!this.db.prepare('SELECT 1 FROM revisions WHERE revision_id=?').get(r))throw Error('246_unknown_source_revision');
  const cats:string[]=JSON.parse(row.category_hypotheses_json);if(cats.includes(categoryId))return false;
  this.tx(()=>{this.db.prepare('UPDATE products SET category_hypotheses_json=? WHERE product_id=?').run(canon([...cats,categoryId].sort()),productId);
   this.event('product_category_assigned',{productId,categoryId,basis:evidence.basis,revisionIds:evidence.revisionIds,detail:evidence.detail},at);
   this.invalidate(['category:'+categoryId,'category_observations:'+categoryId],'product_category_assigned');});
  return true;
 }
 /** Phase251: retires a category item (it stays in the table, journaled, and stops being returned). Used to withdraw
  * an item that should not be category knowledge, e.g. a persistence test item. Nothing is deleted. */
 retireCategoryItem246(itemId:string,reason:string,at=new Date().toISOString()):boolean{
  if(!/^cat_[0-9a-f]{20}$/.test(itemId)||!/^[a-z0-9_]{3,60}$/.test(reason))throw Error('251_invalid_retirement');
  const it=this.db.prepare('SELECT category_id,superseded_by FROM category_items WHERE item_id=?').get(itemId) as {category_id:string;superseded_by:string|null}|undefined;
  if(!it)throw Error('251_unknown_item');if(it.superseded_by)return false;
  this.tx(()=>{this.db.prepare('UPDATE category_items SET superseded_by=?,updated_at=? WHERE item_id=?').run('retired:'+reason,at,itemId);
   this.event('category_item_retired',{itemId,categoryId:it.category_id,reason},at);this.invalidate(['category:'+it.category_id,'catitem:'+itemId],'category_item_retired');});
  return true;
 }
 /** Phase252: splits a product whose name-only identity covers pages of different models. The declarations and
  * source links of the named revisions (whole pages, never single values) move to a new product keyed by the moved
  * page's model code; both records get their model code as declared_model and a model key, so re-ingesting either
  * page resolves to its own product. Refused if a moved declaration belongs to a variant (no evidence-free moves
  * between variants) or if the original would keep no page. Journaled with everything needed to reverse it. */
 splitProductIdentity252(productId:string,move:{revisionIds:string[];movedModel:string;keptModel:string;reason:string;detail:string},at=new Date().toISOString()):string{
  const p=this.db.prepare('SELECT * FROM products WHERE product_id=?').get(productId) as Record<string,string>|undefined;
  if(!p)throw Error('252_unknown_product');
  const code=/^[a-z0-9]{3,24}$/;if(!code.test(move.movedModel)||!code.test(move.keptModel)||move.movedModel===move.keptModel||!/^[a-z0-9_]{3,60}$/.test(move.reason)||!shortText(move.detail,300)||!move.revisionIds.length)throw Error('252_invalid_split');
  const own=(this.db.prepare("SELECT revision_id FROM product_sources WHERE product_id=? AND role='main_product'").all(productId) as {revision_id:string}[]).map(r=>r.revision_id);
  if(move.revisionIds.some(r=>!own.includes(r))||own.every(r=>move.revisionIds.includes(r)))throw Error('252_split_must_keep_and_move_own_pages');
  const qs=move.revisionIds.map(()=>'?').join(',');
  const decls=this.db.prepare(`SELECT declaration_id,variant_id FROM declarations WHERE product_id=? AND revision_id IN (${qs})`).all(productId,...move.revisionIds) as {declaration_id:string;variant_id:string|null}[];
  if(decls.some(d=>d.variant_id))throw Error('252_split_would_move_variant_declarations');
  const host=new URL((this.db.prepare('SELECT url FROM revisions WHERE revision_id=?').get(move.revisionIds[0]) as {url:string}).url).host;
  const newKey=`model:${host}:${move.movedModel}`,keptKey=`model:${host}:${move.keptModel}`;
  if(this.db.prepare('SELECT 1 FROM product_keys WHERE key=? OR key=?').get(newKey,keptKey))throw Error('252_model_key_exists');
  const newId='prd_'+sha(newKey).slice(0,24);
  const seen=this.db.prepare(`SELECT min(fetched_at) a,max(fetched_at) b FROM revisions WHERE revision_id IN (${qs})`).get(...move.revisionIds) as {a:string;b:string};
  this.tx(()=>{
   this.db.prepare('INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(newId,'host_model',p.name,p.brand,move.movedModel.toUpperCase(),
    canon({_key:newKey,splitFrom:productId}),p.identity_state,canon({split252:{from:productId,reason:move.reason,detail:move.detail,at}}),p.category_hypotheses_json,seen.a,seen.b);
   this.db.prepare(`UPDATE declarations SET product_id=? WHERE product_id=? AND revision_id IN (${qs})`).run(newId,productId,...move.revisionIds);
   this.db.prepare(`UPDATE product_sources SET product_id=? WHERE product_id=? AND revision_id IN (${qs})`).run(newId,productId,...move.revisionIds);
   this.db.prepare('UPDATE products SET declared_model=?,identity_review_json=? WHERE product_id=?').run(move.keptModel.toUpperCase(),
    canon({split252:{to:newId,reason:move.reason,detail:move.detail,at,previousDeclaredModel:p.declared_model??null}}),productId);
   this.db.prepare('INSERT INTO product_keys VALUES (?,?)').run(newKey,newId);this.db.prepare('INSERT INTO product_keys VALUES (?,?)').run(keptKey,productId);
   this.event('product_identity_split',{from:productId,to:newId,movedRevisionIds:move.revisionIds,movedDeclarationIds:decls.map(d=>d.declaration_id),
    newKey,keptKey,movedModel:move.movedModel,keptModel:move.keptModel,previousDeclaredModel:p.declared_model??null,reason:move.reason,detail:move.detail},at);
   this.invalidate(['product:'+productId,'product:'+newId,...decls.map(d=>'decl:'+d.declaration_id),...JSON.parse(p.category_hypotheses_json).map((c:string)=>'category_observations:'+c)],'product_identity_split');
  });
  return newId;
 }
 /** Phase252: reverses splitProductIdentity252 from its journal event (the split product is kept, marked merged). */
 reverseProductSplit252(newProductId:string,reason:string,at=new Date().toISOString()):boolean{
  if(!/^[a-z0-9_]{3,60}$/.test(reason))throw Error('252_invalid_reversal');
  const ev=(this.db.prepare("SELECT payload_json FROM events WHERE kind='product_identity_split' ORDER BY seq DESC").all() as {payload_json:string}[])
   .map(e=>JSON.parse(e.payload_json)).find(e=>e.to===newProductId);
  if(!ev)throw Error('252_unknown_split');
  if((this.db.prepare('SELECT identity_state FROM products WHERE product_id=?').get(newProductId) as {identity_state:string}).identity_state==='merged')return false;
  const qs=ev.movedRevisionIds.map(()=>'?').join(',');
  this.tx(()=>{
   this.db.prepare(`UPDATE declarations SET product_id=? WHERE product_id=? AND revision_id IN (${qs})`).run(ev.from,newProductId,...ev.movedRevisionIds);
   this.db.prepare(`UPDATE product_sources SET product_id=? WHERE product_id=? AND revision_id IN (${qs})`).run(ev.from,newProductId,...ev.movedRevisionIds);
   this.db.prepare('DELETE FROM product_keys WHERE key IN (?,?)').run(ev.newKey,ev.keptKey);
   this.db.prepare("UPDATE products SET identity_state='merged' WHERE product_id=?").run(newProductId);
   this.db.prepare('UPDATE products SET declared_model=? WHERE product_id=?').run(ev.previousDeclaredModel,ev.from);
   this.event('product_identity_split_reversed',{from:ev.from,to:newProductId,reason},at);
   this.invalidate(['product:'+ev.from,'product:'+newProductId,...ev.movedDeclarationIds.map((d:string)=>'decl:'+d)],'product_identity_split_reversed');
  });
  return true;
 }
 /** Phase253: types a source registered as 'unknown' from journaled evidence (basis 'heuristic_unverified'), and
  * re-derives the evidence role of that source's unclassified declarations. Only 'unknown' sources can be typed here:
  * an operator-asserted type is never overwritten. No value, product or identity changes; reversible from the journal. */
 classifySourceType253(sourceId:string,to:'manufacturer'|'retailer',evidence:{rule:string;detail:string},at=new Date().toISOString()):boolean{
  if(!/^[a-z0-9_]{3,60}$/.test(evidence.rule)||!shortText(evidence.detail,300))throw Error('253_invalid_source_classification');
  const s=this.db.prepare('SELECT source_type,source_type_basis FROM sources WHERE source_id=?').get(sourceId) as {source_type:string;source_type_basis:string}|undefined;
  if(!s)throw Error('253_unknown_source');if(s.source_type===to&&s.source_type_basis==='heuristic_unverified')return false;
  if(s.source_type!=='unknown')throw Error('253_only_unknown_sources_can_be_classified');
  const decls=(this.db.prepare("SELECT d.declaration_id FROM declarations d JOIN revisions r USING(revision_id) WHERE r.source_id=? AND d.evidence_role='unclassified_declaration'").all(sourceId) as {declaration_id:string}[]).map(d=>d.declaration_id);
  const role=declarationRole246(to);
  this.tx(()=>{this.db.prepare("UPDATE sources SET source_type=?,source_type_basis='heuristic_unverified' WHERE source_id=?").run(to,sourceId);
   const up=this.db.prepare('UPDATE declarations SET evidence_role=? WHERE declaration_id=?');for(const d of decls)up.run(role,d);
   this.event('source_type_classified',{sourceId,from:s.source_type,fromBasis:s.source_type_basis,to,rule:evidence.rule,detail:evidence.detail,declarationIds:decls},at);
   this.invalidate(['source:'+sourceId,...decls.map(d=>'decl:'+d)],'source_type_classified');});
  return true;
 }
 /** Phase253: reverses classifySourceType253 from its journal event. */
 reverseSourceClassification253(sourceId:string,reason:string,at=new Date().toISOString()):boolean{
  if(!/^[a-z0-9_]{3,60}$/.test(reason))throw Error('253_invalid_reversal');
  const ev=(this.db.prepare("SELECT payload_json FROM events WHERE kind='source_type_classified' ORDER BY seq DESC").all() as {payload_json:string}[]).map(e=>JSON.parse(e.payload_json)).find(e=>e.sourceId===sourceId);
  if(!ev)throw Error('253_unknown_classification');
  const s=this.db.prepare('SELECT source_type FROM sources WHERE source_id=?').get(sourceId) as {source_type:string};if(s.source_type===ev.from)return false;
  this.tx(()=>{this.db.prepare('UPDATE sources SET source_type=?,source_type_basis=? WHERE source_id=?').run(ev.from,ev.fromBasis,sourceId);
   const up=this.db.prepare('UPDATE declarations SET evidence_role=? WHERE declaration_id=?');for(const d of ev.declarationIds)up.run(declarationRole246(ev.from),d);
   this.event('source_type_classification_reversed',{sourceId,to:ev.from,reason},at);
   this.invalidate(['source:'+sourceId,...ev.declarationIds.map((d:string)=>'decl:'+d)],'source_type_classification_reversed');});
  return true;
 }
 /** Adds request vocabulary to every item carrying a concept (vocabulary only; class, state and review unchanged). */
 addConceptAliases246(categoryId:string,conceptId:string,aliases:readonly string[],at=new Date().toISOString()):number{
  const rows=this.db.prepare('SELECT item_id,aliases_json FROM category_items WHERE category_id=? AND concept_id=?').all(categoryId,conceptId) as {item_id:string;aliases_json:string}[];
  let changed=0;
  for(const r of rows){const cur:string[]=JSON.parse(r.aliases_json);
   const next=[...new Map([...cur,...aliases].filter(a=>shortText(a,80)).map(a=>[a.toLowerCase(),a.trim()])).values()].slice(0,40);
   if(next.length!==cur.length){this.db.prepare('UPDATE category_items SET aliases_json=?,updated_at=? WHERE item_id=?').run(canon(next),at,r.item_id);changed++;}}
  if(changed){this.event('concept_aliases_added',{categoryId,conceptId,count:aliases.length},at);this.invalidate(['category:'+categoryId],'concept_aliases_added');}
  return changed;
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
  // Relations (schema v3) are part of the versioned profile: a new or re-graded relation is a new version.
  const relations=(this.db.prepare('SELECT relation_id,support FROM category_relations WHERE category_id=? ORDER BY relation_id').all(categoryId) as {relation_id:string;support:string}[]).map(r=>[r.relation_id,r.support]);
  const body={categoryId,items:items.map(i=>[i.itemId,i.knowledgeClass,i.state,i.review?.reviewId??null]),...(relations.length?{relations}:{})};
  const version=(this.db.prepare('SELECT MAX(version) AS v FROM category_versions WHERE category_id=?').get(categoryId) as {v:number|null}).v??0;
  return {schema:'pee246.category-profile.v1',categoryId,version,profileSha256:sha(canon(body)),sections,
   counts:{relations:relations.length,items:items.length,reviewed:items.filter(i=>i.state==='reviewed').length,hypotheses:items.filter(i=>i.knowledgeClass==='technical_hypothesis').length,
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
 invalidate(keys:readonly string[],reason:string):string[]{
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
   'derived_nodes','derived_edges','host_access','research_gaps','events','product_keys','revision_properties','category_relations']){
   let rows=this.db.prepare(`SELECT * FROM ${t}`).all() as Record<string,unknown>[];
   if(t==='declarations'&&!opts.includePendingRights)rows=rows.filter(r=>r.retention==='facts_retained'||r.retention==='facts_retained_class_policy');
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
 private static readonly TABLE_KEYS:Record<string,string>={sources:'source_id',revisions:'revision_id',sightings:'revision_id,seen_at,run_id',
  products:'product_id',variants:'variant_id',product_sources:'product_id,revision_id,role',declarations:'declaration_id',category_items:'item_id',
  category_versions:'category_id,version',derived_nodes:'node_id',derived_edges:'dep_key,node_id',host_access:'host',research_gaps:'gap_id',events:'seq',
  product_keys:'key',revision_properties:'revision_id,product_id,property_key',category_relations:'relation_id'};
 /** Diff-friendly export: one NDJSON file per table, rows in primary-key order, canonical JSON, plus a manifest
  * with per-file SHA-256. Re-exporting an unchanged store reproduces identical files, so a git history of
  * these files shows exactly which knowledge changed. Pending-rights values are excluded unless requested. */
 exportShards246(dir:string,opts:{includePendingRights?:boolean;audience?:'private'|'public'}={}):{manifestSha256:string;files:Record<string,{rows:number;sha256:string}>;audience:'private'|'public'}{
  // A public destination (e.g. a public repository) is publication: declaration values go there only when the
  // source policy permits derived publication; pending-rights values never do.
  const audience=opts.audience??'private';
  if(audience==='public'&&opts.includePendingRights)throw Error('246_pending_rights_never_public');
  const publishable=new Set((this.db.prepare('SELECT source_id,policy_json FROM sources').all() as {source_id:string;policy_json:string|null}[])
   .filter(r=>{try{return !!r.policy_json&&(JSON.parse(r.policy_json).permittedOperations??[]).includes('derived_publication');}catch{return false;}}).map(r=>r.source_id));
  const revSource=new Map((this.db.prepare('SELECT revision_id,source_id FROM revisions').all() as {revision_id:string;source_id:string}[]).map(r=>[r.revision_id,r.source_id]));
  mkdirSync(dir,{recursive:true});
  const files:Record<string,{rows:number;sha256:string}>={};
  for(const [t,key] of Object.entries(KnowledgeStore246.TABLE_KEYS)){
   let rows=this.db.prepare(`SELECT * FROM ${t} ORDER BY ${key}`).all() as Record<string,unknown>[];
   if(t==='declarations'&&!opts.includePendingRights)rows=rows.filter(r=>r.retention==='facts_retained'||r.retention==='facts_retained_class_policy');
   if(t==='declarations'&&audience==='public')rows=rows.filter(r=>r.retention==='facts_retained'&&publishable.has(revSource.get(r.revision_id as string)??''));
   const body=rows.map(r=>canon(r)).join('\n')+(rows.length?'\n':'');
   const f=join(dir,t+'.ndjson');writeFileSync(f+'.tmp',body,{mode:0o600});renameSync(f+'.tmp',f);
   files[t+'.ndjson']={rows:rows.length,sha256:sha(body)};
  }
  const manifest={schema:'pee246.knowledge-shards.v1',storeSchemaVersion:this.schemaVersion(),storagePolicy:this.storage,
   includesPendingRights:!!opts.includePendingRights,audience,files};
  const text=JSON.stringify(manifest,null,1)+'\n';writeFileSync(join(dir,'manifest.json'),text,{mode:0o600});
  return {manifestSha256:sha(text),files,audience};
 }
 /** Rebuilds a NEW store from a shard directory after verifying every file hash. */
 static importShards246(dir:string,dbPath:string,storage:StoragePolicy246=DEFAULT_STORAGE_POLICY246):KnowledgeStore246{
  const m=JSON.parse(readFileSync(join(dir,'manifest.json'),'utf8'));
  if(m.schema!=='pee246.knowledge-shards.v1')throw Error('246_shards_schema');
  if(m.storeSchemaVersion>STORE_SCHEMA_VERSION246)throw Error('246_export_newer_than_software');
  const tables:Record<string,unknown[]>={};
  for(const [f,info] of Object.entries(m.files as Record<string,{rows:number;sha256:string}>)){
   const body=readFileSync(join(dir,f),'utf8');
   if(sha(body)!==info.sha256)throw Error('246_shard_integrity_failed:'+f);
   tables[f.replace(/\.ndjson$/,'')]=body.split('\n').filter(Boolean).map(l=>JSON.parse(l));
  }
  const body={schema:'pee246.knowledge-export.v1',storeSchemaVersion:m.storeSchemaVersion,storagePolicy:m.storagePolicy,
   includesPendingRights:m.includesPendingRights,notice:'rebuilt from shards',tables};
  const tmp=dbPath+'.import.json';writeFileSync(tmp,JSON.stringify({...body,contentSha256:sha(canon(body))}),{mode:0o600});
  try{return KnowledgeStore246.import246(tmp,dbPath,storage);}finally{rmSync(tmp,{force:true});}
 }

 // ---------------- revisit planning ----------------
 /** Decides, per current source revision, whether visiting it again has a purpose. Deterministic for a
  * given store state and asOf. Nothing is fetched here. */
 revisitPlan246(opts:{asOf:string;extractorVersion:string;baseIntervalDays?:number;urls?:readonly string[]}){
  const base=opts.baseIntervalDays??30;const asOf=Date.parse(opts.asOf);
  const revs=this.db.prepare(`SELECT r.revision_id,r.url,r.retention,r.extractor_version,r.declarations_seen,s.host,
   (SELECT MAX(seen_at) FROM sightings x WHERE x.revision_id=r.revision_id) AS last_seen FROM revisions r JOIN sources s USING(source_id)
   WHERE r.state='current' ORDER BY r.url`).all() as {revision_id:string;url:string;retention:string;extractor_version:string;declarations_seen:number;host:string;last_seen:string}[];
  const plan:{url:string;revisionId:string;action:string;reason:string;intervalDays:number;ageDays:number;rulesChanged:boolean}[]=[];
  for(const r of revs){
   if(opts.urls&&!opts.urls.includes(r.url))continue;
   const history=this.db.prepare('SELECT fetched_at FROM revisions WHERE url=? ORDER BY fetched_at').all(r.url) as {fetched_at:string}[];
   // Pages observed to change get a shorter interval (half the shortest observed change gap, 3..base days).
   const gaps=history.slice(1).map((h,i)=>(Date.parse(h.fetched_at)-Date.parse(history[i].fetched_at))/86400000).filter(g=>g>0);
   const interval=gaps.length?Math.max(3,Math.min(base,Math.min(...gaps)/2)):base;
   const age=(asOf-Date.parse(r.last_seen))/86400000;
   const identityGap=!!this.db.prepare("SELECT 1 FROM research_gaps WHERE resolved_at IS NULL AND ref_id=? AND kind='main_product_ambiguous'").get(r.revision_id);
   const valuesKeepable=VALUE_RETAINING246.includes(r.retention as RetentionClass246);
   const rulesChanged=r.extractor_version!==opts.extractorVersion+'+'+IDENTITY_RULES246;
   let action:string,reason:string;
   if(this.hostSuspended246(r.host,opts.asOf)){action='skip';reason='host_suspended';}
   else if(r.retention==='blocked'){action='skip';reason='source_blocked';}
   else if(rulesChanged&&(valuesKeepable||identityGap)){action='refetch';reason=valuesKeepable?'extraction_rules_changed_values_retainable':'extraction_rules_changed_identity_gap';}
   else if(age<interval){action='skip';reason=`verified_${Math.floor(age)}d_ago_interval_${Math.round(interval)}d`;}
   else if(!valuesKeepable&&!identityGap){action='low_value';reason='metadata_only_source_revisit_yields_hash_only';}
   else {action='refetch';reason='revisit_interval_elapsed';}
   plan.push({url:r.url,revisionId:r.revision_id,action,reason,intervalDays:Math.round(interval*10)/10,ageDays:Math.round(age*10)/10,rulesChanged});
  }
  const count=(a:string)=>plan.filter(p=>p.action===a).length;
  return {asOf:opts.asOf,extractorVersion:opts.extractorVersion,summary:{revisions:plan.length,refetch:count('refetch'),skip:count('skip'),lowValue:count('low_value')},plan};
 }

 // ---------------- rights review ----------------
 /** Per-source worksheet for an operator rights decision: what is observed, what is retained now, and what a
  * fact_storage policy would allow keeping. It grants nothing. */
 rightsWorksheet246(){
  return (this.db.prepare(`SELECT s.source_id,s.host,s.source_type,s.retention,COUNT(r.revision_id) AS revisions,
   COALESCE(SUM(r.declarations_seen),0) AS seen,COALESCE(SUM(r.declarations_retained),0) AS retained
   FROM sources s LEFT JOIN revisions r USING(source_id) GROUP BY s.source_id ORDER BY seen DESC,s.host`).all() as Record<string,string|number>[]).map(x=>({
   sourceId:x.source_id,host:x.host,sourceType:x.source_type,currentRetention:x.retention,revisions:x.revisions,
   declarationsObserved:x.seen,declarationsRetained:x.retained,
   retainableWithFactStoragePolicy:x.seen,
   decisionNeeded:x.retention==='facts_retained'?'none':'operator review of the site terms; record a WebSourcePolicy with basis, rights document, reviewer, validity and permittedOperations including fact_storage, or keep metadata only',
   whatWouldBeStored:'short declared values (<=120 chars) with property, unit, section, locator and the page hash; never page text or images'}));
 }
 /** Consistent online backup (SQLite VACUUM INTO) to a new file. */
 backup246(destPath:string):void{
  if(existsSync(destPath))throw Error('246_backup_target_exists');
  mkdirSync(dirname(destPath),{recursive:true});
  this.db.exec(`VACUUM INTO '${destPath.replace(/'/g,"''")}'`);
 }
 /** Phase249: timestamped, verified backup in `dir`, keeping the newest `keep` backups. Each backup gets a manifest
  * (SHA-256, schema version, counts, journal check) so a restore can be checked before use. */
 backupRotate249(dir:string,keep=7,at=new Date().toISOString()):{path:string;manifest:BackupManifest249;removed:string[]}{
  if(!Number.isInteger(keep)||keep<1)throw Error('249_invalid_keep');
  mkdirSync(dir,{recursive:true});
  const path=join(dir,`pee-knowledge-${at.replace(/[:.]/g,'-')}.sqlite`);
  this.backup246(path);
  const manifest=verifyStoreFile249(path);
  if(!manifest.integrityOk||!manifest.journalOk){rmSync(path,{force:true});throw Error('249_backup_failed_verification');}
  writeFileSync(path+'.manifest.json',JSON.stringify(manifest,null,1)+'\n');
  const all=readdirSync(dir).filter(f=>/^pee-knowledge-.*\.sqlite$/.test(f)).sort();
  const removed=all.slice(0,Math.max(0,all.length-keep)).map(f=>join(dir,f));
  for(const f of removed){rmSync(f,{force:true});rmSync(f+'.manifest.json',{force:true});}
  this.event('backup_written',{path,sha256:manifest.sha256,removed:removed.length},at);
  return {path,manifest,removed};
 }
 stats246(){
  const c=(sql:string)=>(this.db.prepare(sql).get() as {n:number}).n;
  return {schemaVersion:this.schemaVersion(),sources:c('SELECT COUNT(*) n FROM sources'),revisions:c('SELECT COUNT(*) n FROM revisions'),
   sightings:c('SELECT COUNT(*) n FROM sightings'),products:c('SELECT COUNT(*) n FROM products'),variants:c('SELECT COUNT(*) n FROM variants'),
   declarations:c('SELECT COUNT(*) n FROM declarations'),declarationsRetained:c("SELECT COUNT(*) n FROM declarations WHERE retention='facts_retained'"),
   declarationsRetainedClassPolicy:c("SELECT COUNT(*) n FROM declarations WHERE retention='facts_retained_class_policy' AND state NOT IN ('superseded_by_revision','superseded_by_extractor')"),
   declarationsPendingRights:c("SELECT COUNT(*) n FROM declarations WHERE retention='local_pending_rights_review' AND state!='expired_pending_rights'"),
   declarationsObservedNotRetained:c('SELECT COALESCE(SUM(declarations_seen-declarations_retained),0) n FROM revisions'),
   categoryItems:c('SELECT COUNT(*) n FROM category_items'),categoryVersions:c('SELECT COUNT(*) n FROM category_versions'),
   staleDerived:c("SELECT COUNT(*) n FROM derived_nodes WHERE state='stale'"),openGaps:c('SELECT COUNT(*) n FROM research_gaps WHERE resolved_at IS NULL'),
   events:c('SELECT COUNT(*) n FROM events'),suspendedHosts:c('SELECT COUNT(*) n FROM host_access WHERE suspended_until IS NOT NULL')};
 }
}

/** Phase249 storage helpers. */
export function insideGitWorkTree249(path:string):boolean{
 let d=dirname(resolvePath(path));
 for(let i=0;i<64;i++){if(existsSync(join(d,'.git')))return true;const up=dirname(d);if(up===d)return false;d=up;}
 return false;
}
export interface BackupManifest249 {file:string;sha256:string;bytes:number;schemaVersion:number|null;integrityOk:boolean;journalOk:boolean;
 counts:Record<string,number>;verifiedAt:string}
/** Opens a store file read-only and checks SQLite integrity, the hash-chained event journal and basic counts. */
export function verifyStoreFile249(path:string):BackupManifest249{
 const bytes=readFileSync(path);const db=new DatabaseSync(path,{readOnly:true});
 try{
  const integrity=(db.prepare('PRAGMA integrity_check').get() as {integrity_check:string}).integrity_check==='ok';
  const version=(db.prepare('PRAGMA user_version').get() as {user_version:number}).user_version;
  const count=(t:string)=>{try{return (db.prepare(`SELECT COUNT(*) n FROM ${t}`).get() as {n:number}).n;}catch{return -1;}};
  const counts=Object.fromEntries(['sources','revisions','products','declarations','category_items','events'].map(t=>[t,count(t)]));
  // The hash-chained journal is re-verified on the read-only connection (the file is never modified).
  const rows=db.prepare('SELECT * FROM events ORDER BY seq').all() as {at:string;kind:string;payload_json:string;previous_sha256:string;event_sha256:string}[];
  let prev='0'.repeat(64),journalOk=true;
  for(const r of rows){if(r.previous_sha256!==prev||sha(canon({at:r.at,kind:r.kind,payload:JSON.parse(r.payload_json),prev}))!==r.event_sha256){journalOk=false;break;}prev=r.event_sha256;}
  db.close();
  return {file:path,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,schemaVersion:version,
   integrityOk:integrity,journalOk,counts,verifiedAt:new Date().toISOString()};
 }catch(e){try{db.close();}catch{/* already closed */}throw e;}
}
/** Restores a verified backup over `target`, keeping the replaced file as `<target>.replaced-<time>`. */
export function restoreStore249(backup:string,target:string,at=new Date().toISOString()):{restored:string;keptPrevious:string|null;manifest:BackupManifest249}{
 const m=verifyStoreFile249(backup);
 if(!m.integrityOk||!m.journalOk)throw Error('249_backup_not_restorable');
 const mf=backup+'.manifest.json';
 if(existsSync(mf)){const rec=JSON.parse(readFileSync(mf,'utf8')) as BackupManifest249;if(rec.sha256!==m.sha256)throw Error('249_backup_hash_mismatch');}
 mkdirSync(dirname(target),{recursive:true});
 let kept:string|null=null;
 if(existsSync(target)){kept=`${target}.replaced-${at.replace(/[:.]/g,'-')}`;renameSync(target,kept);
  for(const x of ['-wal','-shm'])if(existsSync(target+x))renameSync(target+x,kept+x);}
 copyFileSync(backup,target);
 if(statSync(target).size!==m.bytes)throw Error('249_restore_size_mismatch');
 return {restored:target,keptPrevious:kept,manifest:m};
}
