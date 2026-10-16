/**
 * Phase263 — one read-only view of the six operation gates PEE already enforces for a source, so that a restriction on
 * one operation is not read as a prohibition of every other one, and permission for one is never read as permission
 * for the next. Nothing here grants, changes or stores anything; each gate is derived from the existing field that
 * decides it, and the enforcing module stays authoritative:
 *   discovery              → Phase75 approvedMetadataDiscovery75 / Phase223 publicMetadataDiscoveryGate223
 *   access (page reads)    → source policy, sources.retention 'blocked', host_access suspension, operator research policy
 *   temporary interpretation → only on bytes lawfully accessed (CDPA s28A position, Phase249)
 *   structured retention   → sources.retention (Phase249 class policy, per-source grant, reservations, caps)
 *   original analysis      → PEE's own statements citing revisions (category_items), not gated by the source's retention
 *   publication            → a per-source policy granting derived_publication (exportShards246)
 * See docs/phase263/PHASE263-ASSESSMENT.md for the legal reasoning; this is not a legal decision.
 */
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import type {WebSourcePolicy} from './web_evidence_acquisition.js';
import type {ResearchPolicy257} from './phase257_research_planning.js';
import {approvedMetadataDiscovery75} from './phase75_source_discovery.js';
import {publicMetadataDiscoveryGate223} from './phase223_public_metadata_access.js';

export interface Gate263 {status:string;basis:string;allows:boolean}
export interface OperationGates263 {
 schema:'pee263.operation-gates.v1';sourceId:string;host:string;
 discovery:Gate263;access:Gate263;temporaryInterpretation:Gate263;structuredRetention:Gate263;originalAnalysis:Gate263;publication:Gate263;
 independentGates:true;legalReviewPerformed:false;
}
export function operationGates263(store:KnowledgeStore246,sourceId:string,ctx:{asOf:string;researchPolicy?:ResearchPolicy257|null}):OperationGates263{
 const s=store.db.prepare('SELECT source_id,host,policy_json,retention FROM sources WHERE source_id=?').get(sourceId) as {source_id:string;host:string;policy_json:string|null;retention:string}|undefined;
 if(!s)throw Error('phase263_unknown_source');
 let policy:WebSourcePolicy|undefined;try{policy=s.policy_json?JSON.parse(s.policy_json) as WebSourcePolicy:undefined;}catch{policy=undefined;}
 const prohibited=!!policy&&(policy.basis==='refused'||policy.websiteTerms==='reviewed_prohibited');
 const robotsDisallowed=policy?.robots==='disallowed';
 const host=store.db.prepare('SELECT suspended_until,reason FROM host_access WHERE host=?').get(s.host) as {suspended_until:string|null;reason:string|null}|undefined;
 const suspended=!!host?.suspended_until&&Date.parse(host.suspended_until)>Date.parse(ctx.asOf);
 const g=(status:string,basis:string,allows:boolean):Gate263=>({status,basis,allows});

 const discovery=prohibited||robotsDisallowed?g('blocked',prohibited?'source policy: refused or terms reviewed as prohibiting the use':'robots disallowed',false):
  policy&&approvedMetadataDiscovery75(policy,ctx.asOf)?g('allowed_reviewed_metadata','Phase75 reviewed metadata-discovery policy',true):
  policy&&publicMetadataDiscoveryGate223(policy,ctx.asOf)?g('allowed_public_metadata','Phase223 public metadata mode (asserts no licence)',true):
  g('requires_operator_registry_entry','no source policy record; discovery channels come only from an operator registry',false);

 const readsAllowed=(ctx.researchPolicy as {allowSourceReads?:boolean}|null|undefined)?.allowSourceReads===true;
 const access=prohibited||s.retention==='blocked'?g('blocked','source policy or retention class blocks use',false):
  robotsDisallowed?g('blocked','robots disallowed',false):
  suspended?g('suspended',`host suspended until ${host!.suspended_until} (${host!.reason??'restriction'}); reversible, never bypassed`,false):
  !readsAllowed?g('not_authorised_by_research_policy','the operator research policy disables source reads',false):
  g('permitted_subject_to_runtime_checks','research policy allows reads; robots and 403/429 are checked at fetch time',true);

 const temporaryInterpretation=access.status==='blocked'?g('blocked','no lawful access',false):
  g('only_on_lawfully_accessed_bytes','transient in-memory processing of bytes fetched under the access gate (CDPA s28A position)',access.allows);

 const retentionStatus:Record<string,Gate263>={
  facts_retained:g('per_source_grant','source policy grants fact_storage',true),
  facts_retained_class_policy:g('class_policy_capped','Phase249 class policy: individual facts, per-host cap, reservations honoured, private only',true),
  local_pending_rights_review:g('local_pending_rights_review','expiring local-only cache, never exported',true),
  metadata_only:g('metadata_only','identity and hashes only (no grant, reservation or cap reached)',false),
  blocked:g('blocked','source blocked',false)};
 // A machine-readable reservation (TDM reservation, Content-Signal ai-input=no, noai) acts per revision (Phase249); it
 // keeps that source's observations as metadata only even when the class policy would retain them.
 const reserved=!!store.db.prepare(`SELECT 1 FROM research_gaps g JOIN revisions r ON r.revision_id=g.ref_id WHERE g.kind='machine_readable_reservation'
  AND g.resolved_at IS NULL AND r.source_id=? AND r.state='current' LIMIT 1`).get(s.source_id);
 const structuredRetention=reserved&&s.retention!=='blocked'?g('machine_readable_reservation','a TDM/ai-input reservation is honoured (legally relevant in the EU, DSM art 4(3)); identity metadata only',false):
  retentionStatus[s.retention]??g('unknown_retention_class',s.retention,false);

 // PEE's own statements citing a source remain possible whatever the source's retention class; a blocked source only
 // stops new acquisition from it.
 const originalAnalysis=s.retention==='blocked'||prohibited?g('existing_citations_only','no new acquisition; earlier citations stay attributable',false):
  g('allowed_with_citation','PEE-authored statements (category_items) cite revisions; not a copy of source expression',true);

 const publication=policy?.permittedOperations?.includes('derived_publication')&&!prohibited?g('per_source_policy','source policy grants derived_publication',true):
  g('not_permitted_private_only','retained values are private; public export needs a per-source derived_publication grant',false);

 return {schema:'pee263.operation-gates.v1',sourceId:s.source_id,host:s.host,discovery,access,temporaryInterpretation,structuredRetention,originalAnalysis,publication,
  independentGates:true,legalReviewPerformed:false};
}
