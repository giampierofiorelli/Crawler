/** Phase 89: local telemetry bridge. Contains no HTTP fetching, LLM or approval. */
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');

export type WatchOutcome = 'quarantined_success'|'structural_missing'|
  'source_access_blocked'|'transient_acquisition_failure'|
  'recipe_suspended'|'manual_validation_required';
export type WatchInput = Readonly<{
  db_path:string;
  record:{source_host:string;path_prefix:string;category:string;
    recipe_id:string;url:string;model:string;observed_at:string;
    event_type:WatchOutcome;receipt_id:string};
}>;
export type WatchResult = Readonly<{
  event_id:string;idempotent_replay:boolean;source_key:string;
  recipe_id:string;recent_distinct_structural_failures:number;
  action:'reuse_when_authorized'|'observe_more_models'|
    'human_requalification_required'|'access_review_required_no_ai'|
    'manual_recipe_status_check'|'retry_under_source_policy_no_ai'|
    'manual_validation_no_ai';
  review_case:null|{status:string;reason:string;raised_at:string;distinct_models_at_trigger:number};
  automatic_llm_calls:0;automatic_approval:false;
}>;

export async function watchLedgerCall<T>(
  action:'record'|'pending'|'close_case',input:Record<string,unknown>,
  options:{python?:string;timeoutMs?:number}={}
):Promise<T>{
  const data=JSON.stringify(input);
  if(Buffer.byteLength(data,'utf8')>16_384)throw new Error('phase89_payload_too_large');
  const timeout=options.timeoutMs??10_000;
  if(!Number.isInteger(timeout)||timeout<1000||timeout>70_000)throw new Error('phase89_invalid_timeout');
  return await new Promise<T>((resolvePromise,reject)=>{
    const child=spawn(options.python??'python3',['-m','phase89.cli',action],{
      cwd:ROOT,stdio:['pipe','pipe','pipe'],shell:false,
      env:{...process.env,PYTHONPATH:ROOT}
    });
    let output='',ended=false;
    const timer=setTimeout(()=>{child.kill();finish(new Error('phase89_timeout'));},timeout);
    function finish(error?:Error,result?:T){
      if(ended)return;
      ended=true;clearTimeout(timer);
      if(error)reject(error);else resolvePromise(result as T);
    }
    child.on('error',finish);
    child.stdout.on('data',(buffer:Buffer)=>{
      output+=buffer.toString('utf8');
      if(output.length>60_000){child.kill();finish(new Error('phase89_response_limit'));}
    });
    child.stdin.on('error',()=>{});
    child.on('close',status=>{
      try{
        const reply=JSON.parse(output) as {ok:boolean;result?:T;error?:string};
        if(status!==0||reply.ok!==true)finish(new Error(`phase89_${reply.error??'process_failure'}`));
        else finish(undefined,reply.result);
      }catch{finish(new Error('phase89_invalid_reply'));}
    });
    child.stdin.end(data);
  });
}
