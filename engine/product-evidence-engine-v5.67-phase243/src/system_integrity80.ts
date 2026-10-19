/** S80 C1 (owner R3 consolidation, priority 1): one integrity record for a run of PEE: is the private store, the
 * compiled code, the knowledge and the active rules the same system the run claims to be?
 *
 * Found in S80: a container kept a Phase249 schema-3 live store while code and snapshot were at schema 10. Nothing
 * reported it: every run on that container would have read stale knowledge. This record is computed read-only (the
 * store is opened read-only through verifyStoreFile249) and is attached to every S80 evaluation run; `findings` lists
 * what must be fixed before a result counts.
 */
import {existsSync,readdirSync,statSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {STORE_SCHEMA_VERSION246,verifyStoreFile249} from './phase246_knowledge_store.js';
import {DEFAULT_RANKING_AUTHORISATION,RANKING_AUTHORISATION_VERSION,VALIDATED_NEW_AUTHORISATIONS} from './phase253_request_advice.js';
import {TRANSLATION_CUES_FILE} from './knowledge_translation.js';
import {LINK_RULES_FILE} from './knowledge_link.js';
import {loadQuantityKnowledge} from './quantity_knowledge.js';
import {SPEC_EXTRACTOR_VERSION} from './phase245_spec_extraction.js';
import {DOCUMENT_EVIDENCE_VERSION} from './document_evidence.js';
import {GUIDED_READER272_VERSION} from './phase265_test_measurements.js';

export type IntegrityFinding80=
 |'store_missing'|'store_schema_mismatch'|'store_integrity_failed'|'store_journal_broken'
 |'compiled_code_stale'|'source_tree_dirty'|'default_ranking_not_release_rule'|'new_authorisation_without_validation_record'
 |'live_store_behind_snapshot'|'live_store_diverged_from_snapshot'|'live_store_unsaved_changes';
export interface SystemIntegrity80 {
 schema:'pee80.system-integrity.v1';
 code:{commit:string|null;sourceTreeDirty:boolean|null;staleCompiled:string[]};
 store:{path:string;schemaVersion:number|null;expectedSchemaVersion:number;integrityOk:boolean;journalOk:boolean;
  counts:Record<string,number>|null;sha256:string|null};
 snapshot:{relation:string|null;commit:string|null}|null;
 active:{rankingAuthorisation:string;rankingRuleVersion:string;validatedNewAuthorisations:number;
  translationCues:string;linkRules:string;quantityKnowledge:string;specExtractor:string;documentEvidence:string;guidedReader:string};
 findings:IntegrityFinding80[];
}
const ENGINE=join(dirname(fileURLToPath(import.meta.url)),'..','..');
const git=(...a:string[])=>{try{return execFileSync('git',['-C',ENGINE,...a],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{return null;}};

/** Source files whose compiled module is missing or older than the source (a run would execute old logic). */
export function staleCompiled80(engine=ENGINE):string[]{
 const src=join(engine,'src'),dist=join(engine,'dist','src');if(!existsSync(src))return [];
 return readdirSync(src).filter(f=>f.endsWith('.ts')&&!f.endsWith('.d.ts')).filter(f=>{
  const js=join(dist,f.replace(/\.ts$/,'.js'));return !existsSync(js)||statSync(js).mtimeMs+1<statSync(join(src,f)).mtimeMs;}).sort();
}
/** `snapshotStatus`: the output of `scripts/knowledge-snapshot.mjs status` (its lineage relation), when available. */
export function systemIntegrity80(storePath:string,opts:{snapshotStatus?:{lineage?:{relation?:string}|null;snapshotCommit?:string|null}|null;engine?:string}={}):SystemIntegrity80{
 const findings:IntegrityFinding80[]=[];
 let store:SystemIntegrity80['store']={path:storePath,schemaVersion:null,expectedSchemaVersion:STORE_SCHEMA_VERSION246,integrityOk:false,journalOk:false,counts:null,sha256:null};
 if(!existsSync(storePath))findings.push('store_missing');
 else{
  const v=verifyStoreFile249(storePath);
  store={...store,schemaVersion:v.schemaVersion,integrityOk:v.integrityOk,journalOk:v.journalOk,counts:v.counts,sha256:v.sha256};
  if(v.schemaVersion!==STORE_SCHEMA_VERSION246)findings.push('store_schema_mismatch');
  if(!v.integrityOk)findings.push('store_integrity_failed');
  if(!v.journalOk)findings.push('store_journal_broken');
 }
 const stale=staleCompiled80(opts.engine??ENGINE);if(stale.length)findings.push('compiled_code_stale');
 const dirty=git('status','--porcelain','--','src','resources');const sourceTreeDirty=dirty===null?null:dirty.length>0;
 if(sourceTreeDirty)findings.push('source_tree_dirty');
 if(DEFAULT_RANKING_AUTHORISATION!=='ra.2')findings.push('default_ranking_not_release_rule');
 if(VALIDATED_NEW_AUTHORISATIONS.some(v=>!v.validation||!v.validation.trim()))findings.push('new_authorisation_without_validation_record');
 const rel=opts.snapshotStatus?.lineage?.relation??null;
 if(rel==='live_behind')findings.push('live_store_behind_snapshot');
 if(rel==='diverged')findings.push('live_store_diverged_from_snapshot');
 if(rel==='live_ahead')findings.push('live_store_unsaved_changes');
 return {schema:'pee80.system-integrity.v1',
  code:{commit:git('rev-parse','--short','HEAD'),sourceTreeDirty,staleCompiled:stale},store,
  snapshot:opts.snapshotStatus?{relation:rel,commit:opts.snapshotStatus.snapshotCommit??null}:null,
  active:{rankingAuthorisation:DEFAULT_RANKING_AUTHORISATION,rankingRuleVersion:RANKING_AUTHORISATION_VERSION,
   validatedNewAuthorisations:VALIDATED_NEW_AUTHORISATIONS.length,translationCues:TRANSLATION_CUES_FILE,linkRules:LINK_RULES_FILE,
   quantityKnowledge:loadQuantityKnowledge().identity,specExtractor:SPEC_EXTRACTOR_VERSION,documentEvidence:DOCUMENT_EVIDENCE_VERSION,
   guidedReader:GUIDED_READER272_VERSION},
  findings};
}
/** Findings that invalidate a result: the run would not be the system it claims to be. Unsaved live changes and a dirty
 * tree are reported but do not invalidate (they are the normal state while developing). */
export const BLOCKING_FINDINGS80:ReadonlySet<IntegrityFinding80>=new Set<IntegrityFinding80>(['store_missing','store_schema_mismatch','store_integrity_failed',
 'store_journal_broken','compiled_code_stale','default_ranking_not_release_rule','new_authorisation_without_validation_record',
 'live_store_behind_snapshot','live_store_diverged_from_snapshot']);
