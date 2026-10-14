/** Phase91: a read-only, per-recipe drift gate and Phase82 scheduling view.
 * The Phase85 store alone authorizes strategy definitions. Phase89's telemetry
 * may BLOCK a strategy, never authorize data access, approval or rankings.
 * Discovery planning remains distinct from recipe extraction.
 */
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {planMarketWatch,type WatchSource,type MarketWatchPlan} from './phase82_market_watch.js';
import type {ReviewedHtmlRecord} from './phase85_source_recipes.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
const idHash=/^[0-9a-f]{64}$/;
export type RecipeWatchScope={source_host:string;path_prefix:string;category:string;recipe_id:string};
export type RecipeWatchState=RecipeWatchScope & {
 source_key:string;case_status:'none'|'pending_review'|'closed_manually';
 safe_to_reuse_under_review_gate:boolean;review_reason:string|null;
 automatic_llm_calls:0;automatic_approval:false;
};
function sourceKey(x:RecipeWatchScope){
 // Exactly the sorted-key JSON representation used by the Phase89 Python ledger.
 return sha(JSON.stringify({category:x.category,host:x.source_host,prefix:x.path_prefix}));
}
export function htmlScope(r:ReviewedHtmlRecord):RecipeWatchScope {
 return {source_host:r.recipe.source_host,path_prefix:r.recipe.path_prefix,
  category:r.recipe.category,recipe_id:r.recipe.recipe_sha256};
}
function checkStatus(x:unknown,scope:RecipeWatchScope):RecipeWatchState {
 const r=x as RecipeWatchState;
 if(!r||r.source_key!==sourceKey(scope)||r.recipe_id!==scope.recipe_id||
 !['none','pending_review','closed_manually'].includes(r.case_status)||
 r.safe_to_reuse_under_review_gate!==(r.case_status==='none')||
 r.automatic_llm_calls!==0||r.automatic_approval!==false||
 (r.review_reason!==null&&typeof r.review_reason!=='string'))
 throw Error('phase91_untrusted_watch_state');
 return {...scope,...r};
}
async function pythonRead<T>(action:'case_status'|'case_status_many',input:Record<string,unknown>):Promise<T>{
 const payload=JSON.stringify(input);
 if(Buffer.byteLength(payload,'utf8')>16_384)throw Error('phase91_input_cap');
 return await new Promise<T>((resolvePromise,reject)=>{
  const p=spawn('python3',['-m','phase89.cli',action],{
   cwd:root,env:{...process.env,PYTHONPATH:root},stdio:['pipe','pipe','ignore'],shell:false});
  let output='',finished=false;
  const timer=setTimeout(()=>{p.kill();done(Error('phase91_watch_timeout'));},10_000);
  function done(err?:Error,data?:T){if(finished)return;finished=true;clearTimeout(timer);
   if(err)reject(err);else resolvePromise(data as T);}
  p.on('error',e=>done(e));
  p.stdin.on('error',()=>{});
  p.stdout.on('data',(chunk:Buffer)=>{output+=chunk.toString('utf8');
   if(Buffer.byteLength(output,'utf8')>64_000){p.kill();done(Error('phase91_output_cap'));}});
  p.on('close',code=>{
   if(finished)return;
   try{const r=JSON.parse(output) as {ok:boolean;result:T;error:string};
    if(code!==0||r.ok!==true)done(Error('phase91_watch_unavailable'));
    else done(undefined,r.result);
   }catch{done(Error('phase91_invalid_watch_reply'));}
  });
  p.stdin.end(payload);
 });
}
/** Any review case (even closed) continues to block the SAME recipe digest.
 * Closure is an advisory receipt, not a requalification or Phase85 migration.
 */
export async function checkReviewedHtmlRecipeWatch(args:{watchDbPath:string;recipe:ReviewedHtmlRecord}):Promise<RecipeWatchState>{
 if(!args.watchDbPath||!args.recipe)throw Error('phase91_missing_watch_configuration');
 const scope=htmlScope(args.recipe);
 if(!idHash.test(scope.recipe_id))throw Error('phase91_invalid_recipe_digest');
 const r=await pythonRead<RecipeWatchState>('case_status',{db_path:args.watchDbPath,...scope});
 return checkStatus(r,scope);
}
/** Phase82 continues lawful feed/discovery planning even if ONE recipe needs
 * requalification. It is forbidden to use this plan as an authorization to fetch.
 * Monitoring failure fails the entire view rather than reporting a false "clear".
 */
export async function planMarketWatchWithRecipeReview(args:{asOf:string;maxChecks:number;
 maxChecksPerHost:number;sources:readonly WatchSource[];recipes:readonly ReviewedHtmlRecord[];
 watchDbPath:string}):Promise<{
 discoveryPlan:MarketWatchPlan;
 recipeIntakeBlocked:readonly {recipeId:string;sourceHost:string;category:string;watchSourceIds:string[];caseStatus:'pending_review'|'closed_manually'}[];
 recipeIntakeClearCount:number;actualNetworkRequests:0;automaticLlmCalls:0;
}>{
 if(!args.watchDbPath||!Array.isArray(args.recipes)||args.recipes.length>100||
 new Set(args.recipes.map(x=>x.recipe.recipe_sha256)).size!==args.recipes.length)
 throw Error('phase91_invalid_review_plan');
 // Phase82 first validates rights, budgets and metadata source shapes (no I/O).
 const discoveryPlan=planMarketWatch({asOf:args.asOf,maxChecks:args.maxChecks,
  maxChecksPerHost:args.maxChecksPerHost,sources:args.sources});
 const scopes=args.recipes.map(htmlScope);
 const statuses=scopes.length?await pythonRead<RecipeWatchState[]>('case_status_many',{
  db_path:args.watchDbPath,recipes:scopes}):[];
 if(!Array.isArray(statuses)||statuses.length!==scopes.length)throw Error('phase91_incomplete_watch_statuses');
 const checked=statuses.map((r,i)=>checkStatus(r,scopes[i]));
 const blocked=checked.filter(x=>!x.safe_to_reuse_under_review_gate);
 return {discoveryPlan,recipeIntakeBlocked:blocked.map(x=>({recipeId:x.recipe_id,
  sourceHost:x.source_host,category:x.category,
  watchSourceIds:args.sources.filter(s=>s.host===x.source_host&&s.categoryId===x.category).map(s=>s.id),
  caseStatus:x.case_status as 'pending_review'|'closed_manually'})),
  recipeIntakeClearCount:checked.length-blocked.length,
  actualNetworkRequests:0,automaticLlmCalls:0};
}
