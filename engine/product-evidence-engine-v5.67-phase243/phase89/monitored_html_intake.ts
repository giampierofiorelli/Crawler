/**
 * Phase 89 source-strategy observation wrapper around Phase 88.
 *
 * This invokes the Phase88 authorized/quarantined path first. The separate
 * monitoring store is advisory: it cannot supply permissions, approve methods,
 * publish claims, or decide when the model is called. Audit-store failures
 * after quarantine do not imply that Phase72's already-committed write rolled
 * back. Production requires reconciled transactional outbox semantics.
 */
import { createHash } from 'node:crypto';
import { intakeApprovedHTML } from '../phase88/approved_html_intake.ts';
import type { IntakeInput,IntakeDependencies,IntakeResult } from '../phase88/approved_html_intake.ts';
import { watchLedgerCall } from './watch_client.ts';
import type { WatchInput,WatchResult,WatchOutcome } from './watch_client.ts';

export type MonitoredInput = IntakeInput & Readonly<{
  watchDbPath:string;
  sourceHost:string;
  pathPrefix:string;
}>;
export type MonitorDeps = IntakeDependencies & Readonly<{
  recordWatch?: (event:WatchInput)=>Promise<WatchResult>;
}>;
export type MonitoredResult = Readonly<{
  result:IntakeResult;
  monitoring:'recorded'|'unavailable_after_quarantine';
  advisoryAction:WatchResult['action']|null;
  monitoringError?:string;
  automaticLlmCalls:0;
}>;
export class IntakeFailureWithWatch extends Error {
  readonly cause:unknown;
  readonly advisoryAction:WatchResult['action']|null;
  readonly watchRecorded:boolean;
  readonly watchError?:string;
  constructor(cause:unknown,watch:WatchResult|null,watchError?:string){
    super(cause instanceof Error ? cause.message : 'phase89_intake_failed');
    this.name='IntakeFailureWithWatch';
    this.cause=cause;
    this.advisoryAction=watch?.action??null;
    this.watchRecorded=watch!==null;
    this.watchError=watchError;
  }
}
function failureClass(error:unknown):WatchOutcome {
  const message=error instanceof Error?error.message:'';
  if(/^phase87_recipe_missing_or_ambiguous_field:[a-z][a-z0-9_]{1,63}$/.test(message))
    return 'structural_missing';
  if(message==='phase87_unknown_or_suspended_recipe')return 'recipe_suspended';
  if(message==='phase88_unapproved_source'||message==='phase88_source_redirect_or_mismatch'||
     message==='phase88_source_receipts_missing')return 'source_access_blocked';
  // Do not infer network errors, content drift, reviewer decisions or authorisation
  // from unknown thrown error strings. Such cases need human reconciliation.
  return 'manual_validation_required';
}
function errorReceipt(error:unknown){
  // An internal observation identifier, never confused with a Phase69 receipt.
  const message=error instanceof Error?error.message:'unknown';
  return 'error-observed-'+createHash('sha256').update(message).digest('hex');
}
export async function intakeWithStrategyWatch(
  input:MonitoredInput,deps:MonitorDeps
):Promise<MonitoredResult>{
  if(!input.watchDbPath||typeof input.watchDbPath!=='string'||
      !input.sourceHost||!input.pathPrefix)
    throw new Error('phase89_missing_watch_configuration');
  const record=deps.recordWatch??((event:WatchInput)=>watchLedgerCall<WatchResult>('record',event));
  const base=()=>({db_path:input.watchDbPath,record:{
    source_host:input.sourceHost,path_prefix:input.pathPrefix,
    category:input.category,recipe_id:input.recipeId,
    url:input.url,model:input.model,observed_at:input.asOf,
  }});
  let result:IntakeResult;
  try{
    // Phase88 enforces actual Phase69 policy and Phase72 quarantine callbacks.
    result=await intakeApprovedHTML(input,deps);
  }catch(cause){
    let watch:WatchResult|null=null,watchError:string|undefined;
    try{
      const envelope=base();
      watch=await record({...envelope,record:{...envelope.record,
        event_type:failureClass(cause),receipt_id:errorReceipt(cause),
      }});
    }catch(e){watchError=e instanceof Error?e.message:'monitor_failed';}
    throw new IntakeFailureWithWatch(cause,watch,watchError);
  }
  try{
    const envelope=base();
    const status=await record({...envelope,record:{...envelope.record,
      event_type:'quarantined_success',receipt_id:result.receiptId,
    }});
    return {result,monitoring:'recorded',advisoryAction:status.action,
      automaticLlmCalls:0};
  }catch(error){
    // Important: never claim the quarantine was undone or suppress it.
    return {result,monitoring:'unavailable_after_quarantine',
      advisoryAction:null,automaticLlmCalls:0,
      monitoringError:error instanceof Error?error.message:'monitor_failed'};
  }
}
