/**
 * Phase260 — minimal persistent source memory on the existing Phase246 store. Not another store:
 *  - the authority is the existing hash-chained `events` journal; four event kinds are added to it;
 *  - `source_memory260` (migration v4) is a read-only projection of those events, rebuilt deterministically;
 *  - source identity, revisions, product links, declared criteria, access suspensions (`host_access`), retention and
 *    identity states stay in their canonical tables and are never copied: records point at them and are checked
 *    against them when written.
 *
 * Validation and supersession are the existing ones: Phase193 for screening decisions (scope, revision, policy rules
 * and its own supersession chain), Phase258 for source states (a 404 or 503 is temporary; only an operator retires;
 * a move gives a new id that inherits nothing) and contribution feedback (no scores), and the Phase258 descriptor
 * validator for annotations (an annotation must leave a valid descriptor).
 *
 * Trust. A reviewId is a reference, not proof. A record that claims a review is accepted only when the operator's
 * verifier accepts it (the Phase246 receipt pattern); it is then "verifier_accepted": attributable, not
 * authenticated. An operator annotation without that is kept as "operator_annotation". A permissive access annotation
 * needs the verifier. Unknown is the absence of an annotation, never a recorded value. No record admits evidence,
 * authorises access or ranking, or changes a canonical row; the protected operator policy and source-access checks
 * remain the only access authority.
 */
import {createHash} from 'node:crypto';
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import {recordScreening193,emptyLedger193,type ScreeningDecision193,type ScreeningLedger193} from './phase193_screening_memory.js';
import {normalizeDiscoveryUrl192} from './phase192_lineage_marketplace_screen.js';
import {recordSourceState258,emptySourceLedger258,validateFeedback258,type SourceLedger258,type SourceStateEvent258In,
 type ContributionFeedback258} from './phase258_source_memory.js';
import {validateSourceDescriptor258,descriptorFromRetained259,type SourceDescriptor258} from './phase258_source_contributions.js';
import {SPEC_CRITERIA249} from './phase249_decision.js';

export const SOURCE_MEMORY_KINDS260=['source_annotation_recorded','screening_decision_recorded','source_state_changed','source_contribution_verified'] as const;
export type Kind260=typeof SOURCE_MEMORY_KINDS260[number];
/** Descriptor facts the store does not hold. Roles and statement kinds add to what the canonical source type gives. */
export const ANNOTATION_FIELDS260=['roles','statementKinds','publisherCountry','language','productMarket','specialist','culturalTradition',
 'sponsorship','originality','method','testingConditions','access'] as const;
export type AnnotationField260=typeof ANNOTATION_FIELDS260[number];
export interface ReviewClaim260 {reviewId:string;reviewerId:string;reviewedAt:string}
/** Supplied by the operator's environment. There is no default: nothing here approves a review by itself. */
export type ReviewVerifier260=(claim:ReviewClaim260&{recordId:string;kind:Kind260})=>boolean;
export type Basis260='operator_annotation'|'verifier_accepted'|'unverified_claim';

export type Input260=
 {kind:'source_annotation_recorded';recordId:string;sourceId:string;revisionId:string;productId:string|null;criterion:string|null;
  field:AnnotationField260;/** null retracts the superseded annotation (back to unknown). */value:unknown;
  basis:'operator_annotation'|'independently_verified';review:ReviewClaim260;supersedes:string|null;at:string}|
 {kind:'screening_decision_recorded';recordId:string;revisionId:string;decision:ScreeningDecision193}|
 {kind:'source_state_changed';recordId:string;event:SourceStateEvent258In;review:ReviewClaim260|null}|
 {kind:'source_contribution_verified';feedback:ContributionFeedback258;review:ReviewClaim260;supersedes:string|null};

export interface MemoryRow260 {record_id:string;kind:Kind260;event_seq:number;source_id:string;revision_id:string|null;product_id:string|null;
 criterion:string|null;field:string|null;value_json:string;basis:Basis260;review_id:string|null;supersedes:string|null;superseded_by:string|null;
 recorded_at:string;payload_sha256:string}

const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const canon=(v:unknown):string=>JSON.stringify(v,(_k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?
 Object.fromEntries(Object.entries(x as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b))):x);
const ID=/^[a-z][a-z0-9_.:-]{0,100}$/;
const STAMP=/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/;
const fail=(m:string):never=>{throw Error('phase260_'+m);};
const KINDS=new Set<string>(SOURCE_MEMORY_KINDS260);
const COLS=['record_id','kind','event_seq','source_id','revision_id','product_id','criterion','field','value_json','basis','review_id','supersedes',
 'superseded_by','recorded_at','payload_sha256'] as const;
const WRITER='source_memory260_writer',HEAD='source_memory260_head';
const IN_KINDS=`kind IN (${SOURCE_MEMORY_KINDS260.map(()=>'?').join(',')})`;

interface Event260 {seq:number;kind:Kind260;payload:Record<string,any>}
function memoryEvents(store:KnowledgeStore246):Event260[]{
 return (store.db.prepare(`SELECT seq,kind,payload_json FROM events WHERE ${IN_KINDS} ORDER BY seq`).all(...SOURCE_MEMORY_KINDS260) as
  {seq:number;kind:Kind260;payload_json:string}[]).map(r=>({seq:r.seq,kind:r.kind,payload:JSON.parse(r.payload_json)}));
}
function headOf(store:KnowledgeStore246):string{
 const r=store.db.prepare(`SELECT COUNT(*) n,COALESCE(MAX(seq),0) m FROM events WHERE ${IN_KINDS}`).get(...SOURCE_MEMORY_KINDS260) as {n:number;m:number};
 return `${r.n}:${r.m}`;
}
const storedHead=(store:KnowledgeStore246)=>(store.db.prepare('SELECT v FROM store_meta WHERE k=?').get(HEAD) as {v:string}|undefined)?.v??'0:0';
function requireJournal(store:KnowledgeStore246){if(!store.verifyJournal().ok)fail('journal_tampered: the event chain does not verify; nothing is replayed or recorded');}
function requireSchema(store:KnowledgeStore246){if(store.schemaVersion()<4)fail('store_not_migrated');}

// ---- the projection: one fold shared by recording and replay ------------------------------------------------------------------
function rowFor(e:Event260):MemoryRow260{
 const p=e.payload;const base={record_id:p.recordId,kind:e.kind,event_seq:e.seq,supersedes:p.supersedes??null,superseded_by:null,
  recorded_at:p.at,payload_sha256:sha(canon(p)),review_id:p.review?.reviewId??null,basis:p.basis as Basis260};
 if(e.kind==='source_annotation_recorded')return {...base,source_id:p.sourceId,revision_id:p.revisionId,product_id:p.productId,criterion:p.criterion,field:p.field,value_json:canon(p.value)};
 if(e.kind==='screening_decision_recorded')return {...base,source_id:p.sourceId,revision_id:p.revisionId,product_id:null,criterion:p.decision.source.field,
  field:p.decision.scope,value_json:canon({action:p.decision.action,reason:p.decision.reason,reviewBasis:p.decision.reviewBasis,policyVersion:p.decision.source.policyVersion,market:p.decision.source.market})};
 if(e.kind==='source_state_changed')return {...base,source_id:p.event.sourceId,revision_id:null,product_id:null,criterion:null,field:'state',value_json:canon({state:p.event.state,cause:p.event.cause})};
 return {...base,source_id:p.feedback.sourceId,revision_id:null,product_id:p.feedback.scope.productId,criterion:p.feedback.scope.criterion,field:'contribution',
  value_json:canon({jobId:p.feedback.jobId,outcome:p.feedback.outcome,reliability:p.feedback.reliability,relevance:p.feedback.relevance})};
}
/** Deterministic replay of the verified journal (Phase193/258 ledgers re-validated on the way). */
export function replaySourceMemory260(store:KnowledgeStore246):MemoryRow260[]{
 requireJournal(store);const events=memoryEvents(store);
 screeningLedgerFrom(events);stateLedgerFrom(events);
 const rows=new Map<string,MemoryRow260>();
 for(const e of events){const r=rowFor(e);
  if(e.payload.schema!=='pee260.source-memory.v1'||!ID.test(r.record_id)||rows.has(r.record_id))fail('replay_invalid_record '+String(r.record_id));
  if(r.supersedes){const old=rows.get(r.supersedes);if(!old||old.superseded_by)fail('replay_bad_supersession '+r.record_id);old!.superseded_by=r.record_id;}
  rows.set(r.record_id,r);}
 return [...rows.values()];
}
const digestRows=(rows:readonly MemoryRow260[])=>sha([...rows].sort((a,b)=>a.event_seq-b.event_seq).map(r=>canon(Object.fromEntries(COLS.map(c=>[c,r[c]])))).join('\n'));
const tableRows=(store:KnowledgeStore246)=>store.db.prepare(`SELECT ${COLS.join(',')} FROM source_memory260 ORDER BY event_seq`).all() as unknown as MemoryRow260[];
function withWriter<T>(store:KnowledgeStore246,f:()=>T):T{
 store.db.exec('BEGIN IMMEDIATE');
 try{store.db.prepare('INSERT OR REPLACE INTO store_meta VALUES (?,?)').run(WRITER,'1');const r=f();
  store.db.prepare('DELETE FROM store_meta WHERE k=?').run(WRITER);store.db.exec('COMMIT');return r;}
 catch(e){store.db.exec('ROLLBACK');throw e;}
}
function writeRow(store:KnowledgeStore246,r:MemoryRow260){
 store.db.prepare(`INSERT INTO source_memory260(${COLS.join(',')}) VALUES (${COLS.map(()=>'?').join(',')})`).run(...COLS.map(c=>r[c] as never));
}

/** Projection state against a full replay of the verified journal. */
export function checkSourceMemory260(store:KnowledgeStore246){
 requireSchema(store);
 if(!store.verifyJournal().ok)return {journalOk:false,projectionConsistent:false,records:0,head:headOf(store)};
 const expected=replaySourceMemory260(store);
 return {journalOk:true,projectionConsistent:digestRows(expected)===digestRows(tableRows(store))&&storedHead(store)===headOf(store),records:expected.length,head:headOf(store)};
}
/** Rebuilds the projection from the verified journal, atomically. Running it twice gives the same table. */
export function rebuildSourceMemory260(store:KnowledgeStore246){
 requireSchema(store);const rows=replaySourceMemory260(store);
 withWriter(store,()=>{store.db.exec('DELETE FROM source_memory260');for(const r of rows)writeRow(store,r);
  store.db.prepare('INSERT OR REPLACE INTO store_meta VALUES (?,?)').run(HEAD,headOf(store));});
 return {rebuilt:true as const,records:rows.length,digest:digestRows(rows)};
}
/** Idempotent recovery: rebuilds only when the projection does not match the journal (e.g. after an import, which
 * carries the journal but not the projection, or after a memory event appended outside this module). */
export function recoverSourceMemory260(store:KnowledgeStore246){
 const c=checkSourceMemory260(store);if(!c.journalOk)fail('journal_tampered: recovery refuses to replay a broken chain');
 if(c.projectionConsistent)return {recovered:false as const,records:c.records};
 return {recovered:true as const,records:rebuildSourceMemory260(store).records};
}

// ---- ledgers rebuilt from the journal (existing Phase193/258 semantics) ----------------------------------------------------------
function screeningLedgerFrom(events:readonly Event260[]):{ledger:ScreeningLedger193;recordBySeq:string[]}{
 let ledger=emptyLedger193();const recordBySeq:string[]=[];
 for(const e of events)if(e.kind==='screening_decision_recorded'){ledger=recordScreening193(ledger,e.payload.decision as ScreeningDecision193);recordBySeq.push(e.payload.recordId);}
 return {ledger,recordBySeq};
}
function stateLedgerFrom(events:readonly Event260[]):{ledger:SourceLedger258;records:{recordId:string;sourceId:string}[]}{
 let ledger=emptySourceLedger258();const records:{recordId:string;sourceId:string}[]=[];
 for(const e of events)if(e.kind==='source_state_changed'){const ev=e.payload.event as SourceStateEvent258In;ledger=recordSourceState258(ledger,ev);records.push({recordId:e.payload.recordId,sourceId:ev.sourceId});}
 return {ledger,records};
}
/** The Phase193 ledger held in the journal, for lookupScreening193 or ingestObservation246's `screening` option. */
export function screeningLedger260(store:KnowledgeStore246):ScreeningLedger193{requireJournal(store);return screeningLedgerFrom(memoryEvents(store)).ledger;}
/** The Phase258 source-state ledger held in the journal, for selectSourcesForJob258. */
export function sourceStateLedger260(store:KnowledgeStore246):SourceLedger258{requireJournal(store);return stateLedgerFrom(memoryEvents(store)).ledger;}
/** Active (unsuperseded) contribution feedback, for selectSourcesForJob258. */
export function contributions260(store:KnowledgeStore246):ContributionFeedback258[]{
 const active=new Set((store.db.prepare("SELECT record_id FROM source_memory260 WHERE kind='source_contribution_verified' AND superseded_by IS NULL").all() as {record_id:string}[]).map(r=>r.record_id));
 return memoryEvents(store).filter(e=>e.kind==='source_contribution_verified'&&active.has(e.payload.recordId)).map(e=>e.payload.feedback as ContributionFeedback258);
}

// ---- canonical bindings (read, never copied) -----------------------------------------------------------------------------------
interface RevisionRow {revision_id:string;source_id:string;url:string;sha256:string;fetched_at:string;state:string;host:string;source_type:string;source_type_basis:string}
const revisionRow=(store:KnowledgeStore246,revisionId:string)=>store.db.prepare(`SELECT r.revision_id,r.source_id,r.url,r.sha256,r.fetched_at,r.state,s.host,s.source_type,s.source_type_basis
 FROM revisions r JOIN sources s USING(source_id) WHERE r.revision_id=?`).get(revisionId) as RevisionRow|undefined;
const linked=(store:KnowledgeStore246,revisionId:string,productId:string)=>!!store.db.prepare('SELECT 1 FROM product_sources WHERE revision_id=? AND product_id=?').get(revisionId,productId);
const linkedToSource=(store:KnowledgeStore246,sourceId:string,productId:string)=>!!store.db.prepare('SELECT 1 FROM product_sources ps JOIN revisions r USING(revision_id) WHERE r.source_id=? AND ps.product_id=?').get(sourceId,productId);
const sourceExists=(store:KnowledgeStore246,sourceId:string)=>!!store.db.prepare('SELECT 1 FROM sources WHERE source_id=?').get(sourceId);
/** The Phase259 descriptor of one retained (revision, product) record, derived from canonical tables. */
export function retainedDescriptor260(store:KnowledgeStore246,revisionId:string,productId:string|null):SourceDescriptor258{
 const r=revisionRow(store,revisionId)??fail('unknown_revision');
 const link=productId?store.db.prepare('SELECT role FROM product_sources WHERE revision_id=? AND product_id=? ORDER BY role').get(revisionId,productId) as {role:string}|undefined:undefined;
 if(productId&&!link)fail('cross_product: the product is not linked to this revision');
 const p=productId?store.db.prepare('SELECT identity_state FROM products WHERE product_id=?').get(productId) as {identity_state:string}:{identity_state:'discovered'};
 // The same inputs as the Phase259 real-data validation (scripts/phase259-real-source-baseline.mjs).
 const props=productId?(store.db.prepare('SELECT property FROM declarations WHERE revision_id=? AND product_id=?').all(revisionId,productId) as {property:string}[]).map(x=>x.property):[];
 const restricted=!!store.db.prepare('SELECT 1 FROM host_access WHERE host=? AND (restricted>0 OR suspended_until IS NOT NULL)').get(r.host);
 const d=descriptorFromRetained259({productId:productId??'none',source_id:r.source_id,url:r.url,host:r.host,source_type:r.source_type,source_type_basis:r.source_type_basis,
  attribution:link?.role??'main_product',revision_id:r.revision_id,sha256:r.sha256,fetched_at:r.fetched_at,state:r.state,identity_state:p.identity_state,nd:props.length,declaredProperties:props,restricted});
 return productId?d:{...d,product:{productId:null,identityStatus:'unverified'}};
}

// ---- annotations overlay ---------------------------------------------------------------------------------------------------------
/** Anything beyond "not permitted"/"disallowed"/unreviewed asserts a right; restrictive annotations need no verifier. */
const permissiveAccess=(v:any)=>!!v&&((v.rights!=='not_permitted'&&v.rights!=='unreviewed')||v.robots==='allowed');
function overlay(d:SourceDescriptor258,field:AnnotationField260,value:unknown):SourceDescriptor258{
 const x:any=structuredClone(d);
 if(field==='roles')x.roles=[...new Set([...x.roles.filter((r:string)=>r!=='role_unknown'),...(value as string[])])];
 else if(field==='statementKinds')x.statementKinds=[...new Set([...x.statementKinds.filter((k:string)=>k!=='not_retained'),...(value as string[])])];
 else x[field]=value;
 return x;
}
/** Active annotations that apply to a record: same canonical revision, same product (or source-level for that revision),
 * same criterion scope, not superseded, and later than the source's latest "changed" state (a change voids earlier reviews). */
function applicable(store:KnowledgeStore246,revisionId:string,productId:string|null,criterion:string|null):MemoryRow260[]{
 const r=revisionRow(store,revisionId);if(!r)return [];
 const changed=(store.db.prepare("SELECT MAX(event_seq) m FROM source_memory260 WHERE kind='source_state_changed' AND source_id=? AND json_extract(value_json,'$.state')='changed'").get(r.source_id) as {m:number|null}).m??0;
 return (store.db.prepare(`SELECT ${COLS.join(',')} FROM source_memory260 WHERE kind='source_annotation_recorded' AND superseded_by IS NULL AND source_id=? AND revision_id=?
  AND (product_id IS NULL OR product_id IS ?) AND criterion IS ? AND event_seq>? ORDER BY event_seq`).all(r.source_id,revisionId,productId,criterion,changed) as unknown as MemoryRow260[])
  .filter(x=>x.value_json!=='null');
}
function currentState(store:KnowledgeStore246,sourceId:string):string|null{
 const r=store.db.prepare("SELECT value_json FROM source_memory260 WHERE kind='source_state_changed' AND source_id=? ORDER BY event_seq DESC LIMIT 1").get(sourceId) as {value_json:string}|undefined;
 return r?JSON.parse(r.value_json).state:null;
}
/** A Phase258 descriptor for one retained record with its applicable annotations. The `retained` block stays derived
 * from canonical tables; annotations add facts and say on what basis. */
export function descriptorWithMemory260(store:KnowledgeStore246,revisionId:string,productId:string|null){
 let d=retainedDescriptor260(store,revisionId,productId);const used:{recordId:string;field:string;basis:Basis260}[]=[];
 for(const a of applicable(store,revisionId,productId,null)){d=overlay(d,a.field as AnnotationField260,JSON.parse(a.value_json));used.push({recordId:a.record_id,field:a.field!,basis:a.basis});}
 if(used.some(u=>u.basis==='operator_annotation'))d={...d,limitations:[...new Set([...d.limitations,'operator_annotation_unverified'])]};
 const state=currentState(store,revisionRow(store,revisionId)!.source_id);
 if(state==='changed')d={...d,limitations:[...new Set([...d.limitations,'source_changed_re_review_required'])]};
 return {descriptor:validateSourceDescriptor258(d),annotations:used,state,accessAuthorized:false as const,evidenceAdmitted:false as const};
}

// ---- recording -------------------------------------------------------------------------------------------------------------------
function checkClaim(c:ReviewClaim260|null|undefined,what:string):ReviewClaim260{
 if(!c||!ID.test(c.reviewId)||!ID.test(c.reviewerId)||!STAMP.test(c.reviewedAt))fail(`invalid_review_claim: ${what}`);return c!;
}
function verified(verify:ReviewVerifier260|undefined,claim:ReviewClaim260,recordId:string,kind:Kind260):void{
 if(typeof verify!=='function'||verify({...claim,recordId,kind})!==true)fail('review_not_verified: a reviewId string is not proof that a review happened');
}
const rowById=(store:KnowledgeStore246,recordId:string)=>store.db.prepare(`SELECT ${COLS.join(',')} FROM source_memory260 WHERE record_id=?`).get(recordId) as unknown as MemoryRow260|undefined;
const SCHEMA='pee260.source-memory.v1';

function annotationPayload(store:KnowledgeStore246,x:Extract<Input260,{kind:'source_annotation_recorded'}>,verify?:ReviewVerifier260){
 if(!ID.test(x.recordId)||!STAMP.test(x.at))fail('invalid_annotation: identifiers');
 if(!(ANNOTATION_FIELDS260 as readonly string[]).includes(x.field))fail('invalid_annotation: field (canonical facts such as source type, revisions, identity or host access are not annotated)');
 if(x.criterion!==null&&!SPEC_CRITERIA249[x.criterion])fail('invalid_annotation: criterion');
 if(!['operator_annotation','independently_verified'].includes(x.basis))fail('invalid_annotation: basis');
 const claim=checkClaim(x.review,'annotation');
 const rev=revisionRow(store,x.revisionId)??fail('invalid_annotation: unknown revision');
 if(rev.source_id!==x.sourceId)fail('invalid_annotation: the revision belongs to another source');
 if(x.productId!==null&&!linked(store,x.revisionId,x.productId))fail('cross_product: the product is not linked to this revision');
 // A retraction (null value) ends its chain: it is history, not an active annotation to supersede.
 const same=(r:MemoryRow260)=>r.kind==='source_annotation_recorded'&&r.value_json!=='null'&&r.source_id===x.sourceId&&r.revision_id===x.revisionId&&r.product_id===x.productId&&r.criterion===x.criterion&&r.field===x.field;
 if(x.supersedes!==null){const old=rowById(store,x.supersedes);if(!old||old.superseded_by||!same(old))fail('invalid_annotation: supersedes must name the active annotation of the same scope and field');}
 else{const open=(store.db.prepare(`SELECT ${COLS.join(',')} FROM source_memory260 WHERE kind='source_annotation_recorded' AND superseded_by IS NULL AND record_id!=?`).all(x.recordId) as unknown as MemoryRow260[]).find(same);
  if(open)fail('invalid_annotation: an active annotation exists for this scope and field; supersede it explicitly ('+open.record_id+')');}
 if(x.value===null){if(x.supersedes===null)fail('invalid_annotation: a retraction must supersede an annotation');}
 else{
  const base=retainedDescriptor260(store,x.revisionId,x.productId);
  if(canon(x.value)===canon((base as any)[x.field])||(x.field==='roles'&&canon(x.value)===canon(['role_unknown']))||(x.field==='statementKinds'&&canon(x.value)===canon(['not_retained'])))
   fail('invalid_annotation: no information (unknown stays the absence of an annotation)');
  // The annotation must leave a valid descriptor together with the other annotations active for this record.
  let d=base;for(const a of applicable(store,x.revisionId,x.productId,null))if(a.field!==x.field)d=overlay(d,a.field as AnnotationField260,JSON.parse(a.value_json));
  try{validateSourceDescriptor258(overlay(d,x.field,x.value));}catch(e){fail('invalid_annotation: '+(e as Error).message);}
 }
 const permissive=x.field==='access'&&permissiveAccess(x.value);
 if(permissive&&x.basis!=='independently_verified')fail('invalid_annotation: a permissive access annotation must be independently verified (and still authorises nothing)');
 if(x.basis==='independently_verified')verified(verify,claim,x.recordId,x.kind);
 return {schema:SCHEMA,recordId:x.recordId,sourceId:x.sourceId,revisionId:x.revisionId,productId:x.productId,criterion:x.criterion,field:x.field,value:x.value,
  basis:x.basis==='independently_verified'?'verifier_accepted':'operator_annotation',review:claim,supersedes:x.supersedes,at:x.at};
}
function screeningPayload(store:KnowledgeStore246,x:Extract<Input260,{kind:'screening_decision_recorded'}>,verify?:ReviewVerifier260){
 if(!ID.test(x.recordId))fail('invalid_screening: recordId');
 const rev=revisionRow(store,x.revisionId)??fail('invalid_screening: unknown revision');const d=x.decision;const s=d?.source;
 if(!s||s.sourceId!==rev.source_id)fail('invalid_screening: the decision names another source');
 let sameUrl=false;try{sameUrl=normalizeDiscoveryUrl192(s.url)===normalizeDiscoveryUrl192(rev.url);}catch{sameUrl=false;}
 if(!sameUrl)fail('invalid_screening: the decision names another URL than the revision');
 if(s.contentBasis==='publisher_bytes'&&s.contentHash!==rev.sha256)fail('invalid_screening: publisher bytes must match the revision hash');
 if(d.scope==='field'&&!linked(store,x.revisionId,s.variantId))fail('cross_product: a field-scoped decision must name a product linked to this revision');
 if(d.scope==='document'&&s.variantId!=='page'&&!linked(store,x.revisionId,s.variantId))fail('cross_product: the decision names a product not linked to this revision');
 for(const c of d.retainedCandidateVariantIds??[])if(!store.db.prepare('SELECT 1 FROM products WHERE product_id=? UNION SELECT 1 FROM variants WHERE variant_id=?').get(c,c))fail('invalid_screening: unknown retained candidate '+c);
 // Phase193 validation, ordering and supersession, on the ledger held in the journal.
 const {ledger,recordBySeq}=screeningLedgerFrom(memoryEvents(store));
 let next:ScreeningLedger193|null=null;try{next=recordScreening193(ledger,d);}catch(e){fail('invalid_screening: '+(e as Error).message);}
 const sup=next!.events.at(-1)!.supersedesSeq;
 const claim:ReviewClaim260={reviewId:d.reviewTicket,reviewerId:d.reviewerId,reviewedAt:d.reviewedAt};
 // Only a human screen lets Phase193 skip re-screening, so only that claim must pass the verifier.
 const human=d.reviewBasis==='human_source_screen';if(human)verified(verify,claim,x.recordId,x.kind);
 return {schema:SCHEMA,recordId:x.recordId,sourceId:rev.source_id,revisionId:x.revisionId,decision:d,basis:human?'verifier_accepted':'unverified_claim',
  review:claim,supersedes:sup===null?null:recordBySeq[sup-1],at:d.reviewedAt};
}
function statePayload(store:KnowledgeStore246,x:Extract<Input260,{kind:'source_state_changed'}>,verify?:ReviewVerifier260){
 if(!ID.test(x.recordId))fail('invalid_state: recordId');const ev=x.event;
 if(!ev||!sourceExists(store,ev.sourceId))fail('invalid_state: unknown source');
 if(ev.cause?.kind==='http_status'&&[401,403].includes(ev.cause.httpStatus))
  fail('invalid_state: 401/403 are access refusals, recorded by recordAccess246 as reversible host suspensions, never as a source state');
 const {ledger,records}=stateLedgerFrom(memoryEvents(store));
 try{recordSourceState258(ledger,ev);}catch(e){fail('invalid_state: '+(e as Error).message);}
 const causeReview=(ev.cause as {reviewId?:string|null}).reviewId??null;let basis:Basis260='unverified_claim';let claim:ReviewClaim260|null=null;
 if(causeReview!==null){claim=checkClaim(x.review,'state');if(claim.reviewId!==causeReview)fail('invalid_state: review claim does not match the cause');
  verified(verify,claim,x.recordId,x.kind);basis='verifier_accepted';}
 if(ev.cause.kind==='feedback'){const f=rowById(store,ev.cause.feedbackId);
  if(!f||f.kind!=='source_contribution_verified'||f.superseded_by||f.source_id!==ev.sourceId)fail('invalid_state: useful needs active verified feedback for this source');
  if(['no_contribution','not_retrievable'].includes(JSON.parse(f!.value_json).outcome))fail('invalid_state: feedback without a contribution does not make a source useful');
  basis='verifier_accepted';}
 const prev=[...records].reverse().find(r=>r.sourceId===ev.sourceId)?.recordId??null;
 return {schema:SCHEMA,recordId:x.recordId,event:ev,basis,review:claim,supersedes:prev,at:ev.at};
}
function contributionPayload(store:KnowledgeStore246,x:Extract<Input260,{kind:'source_contribution_verified'}>,verify?:ReviewVerifier260){
 let f:ContributionFeedback258|null=null;try{f=validateFeedback258(x.feedback);}catch(e){fail('invalid_contribution: '+(e as Error).message);}
 if(!sourceExists(store,f!.sourceId))fail('invalid_contribution: unknown source');
 if(f!.scope.productId!==null&&!linkedToSource(store,f!.sourceId,f!.scope.productId))fail('cross_product: the product is not linked to this source');
 const claim=checkClaim(x.review,'contribution');if(claim.reviewId!==f!.reviewId)fail('invalid_contribution: review claim does not match the feedback');
 if(x.supersedes!==null){const old=rowById(store,x.supersedes);
  if(!old||old.kind!=='source_contribution_verified'||old.superseded_by||old.source_id!==f!.sourceId||JSON.parse(old.value_json).jobId!==f!.jobId)
   fail('invalid_contribution: supersedes must name the active feedback of the same source and job');}
 verified(verify,claim,f!.feedbackId,'source_contribution_verified');
 return {schema:SCHEMA,recordId:f!.feedbackId,feedback:f!,basis:'verifier_accepted',review:claim,supersedes:x.supersedes,at:f!.at};
}

/**
 * Records one memory event: validates it against canonical tables and existing validators, then appends the journal
 * event and updates the projection in ONE transaction. Re-recording an identical record is a no-op (an idempotent
 * retry after an interruption); the same recordId with different content is refused.
 */
export function recordSourceMemory260(store:KnowledgeStore246,x:Input260,opts:{verify?:ReviewVerifier260;/** test-only fault injection */_faultAfterJournal?:boolean}={}){
 requireSchema(store);
 if(!x||!KINDS.has((x as {kind:string}).kind))fail('unknown_kind');
 requireJournal(store);if(storedHead(store)!==headOf(store))recoverSourceMemory260(store);
 // Validation, the idempotency check and the write share one IMMEDIATE transaction: a second writer waits for the write
 // lock and then validates against the first writer's record, so two records can never supersede the same one.
 return withWriter(store,()=>{
  if(storedHead(store)!==headOf(store))fail('concurrent_journal_change: retry');
  const payload:Record<string,any>=x.kind==='source_annotation_recorded'?annotationPayload(store,x,opts.verify):x.kind==='screening_decision_recorded'?screeningPayload(store,x,opts.verify):
   x.kind==='source_state_changed'?statePayload(store,x,opts.verify):contributionPayload(store,x,opts.verify);
  const prior=rowById(store,payload.recordId);
  if(prior){
   // An identical retry is a no-op. For states and screenings the supersession pointer is computed (on a retry it
   // would point at the record itself), so it is left out of the comparison.
   const stored=memoryEvents(store).find(e=>e.seq===prior.event_seq)?.payload;
   if(prior.kind===x.kind&&stored&&canon({...stored,supersedes:null})===canon({...payload,supersedes:null}))return {status:'already_recorded' as const,recordId:prior.record_id,eventSeq:prior.event_seq,basis:prior.basis};
   fail('record_id_conflict: '+prior.record_id+' already holds different content');
  }
  store.event(x.kind,payload,payload.at);
  const seq=(store.db.prepare('SELECT MAX(seq) m FROM events').get() as {m:number}).m;
  if(opts._faultAfterJournal)throw Error('phase260_test_fault_after_journal');
  const row=rowFor({seq,kind:x.kind,payload});
  if(row.supersedes&&store.db.prepare('UPDATE source_memory260 SET superseded_by=? WHERE record_id=? AND superseded_by IS NULL').run(row.record_id,row.supersedes).changes!==1)
   fail('supersession_conflict: '+row.supersedes+' is no longer active');
  writeRow(store,row);
  store.db.prepare('INSERT OR REPLACE INTO store_meta VALUES (?,?)').run(HEAD,headOf(store));
  return {status:'recorded' as const,recordId:row.record_id,eventSeq:seq,basis:row.basis};
 });
}

/** What PEE remembers about one source: canonical facts read live, memory records from the projection. */
export function sourceMemory260(store:KnowledgeStore246,sourceId:string){
 const s=store.db.prepare('SELECT source_id,host,source_type,source_type_basis,retention FROM sources WHERE source_id=?').get(sourceId) as Record<string,string>|undefined;
 if(!s)fail('unknown_source');
 const host=store.db.prepare('SELECT restricted,suspended_until,last_status FROM host_access WHERE host=?').get(s!.host) as Record<string,unknown>|undefined;
 const rows=store.db.prepare(`SELECT ${COLS.join(',')} FROM source_memory260 WHERE source_id=? ORDER BY event_seq`).all(sourceId) as unknown as MemoryRow260[];
 return {canonical:{...s,hostAccess:host??null},state:currentState(store,sourceId),
  active:rows.filter(r=>!r.superseded_by&&r.value_json!=='null'),history:rows,
  accessAuthorized:false as const,evidenceAdmitted:false as const,rankingAuthorized:false as const};
}
