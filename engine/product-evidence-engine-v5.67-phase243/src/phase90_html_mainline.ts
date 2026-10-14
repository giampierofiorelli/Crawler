/**
 * Phase 90 — real mainline integration: Phase85 reviewed HTML strategy memory,
 * Phase68/69 authorized ephemeral acquisition, Phase70 evidence quarantine,
 * and optional Phase89 advisory strategy-watch telemetry.
 * No alternative rights reader, data ranking, retail scores or LLM fallback.
 */
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readApprovedSource,type SourceTransport,type TransientWebClaim} from './approved_web_reader.js';
import {planWebEvidenceAcquisition,type WebCandidate,type WebSourcePolicy} from './web_evidence_acquisition.js';
import {buildCategoryEvidenceMatrix,type CategoryFieldRegistry,type ProposedStructuredFact,
 type QuarantinedMatrixObservation} from './category_evidence_matrix.js';
import {ReviewedRecipeStore,type ReviewedHtmlRecord} from './phase85_source_recipes.js';
import {checkReviewedHtmlRecipeWatch} from './phase91_watch_gate.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const denied=/(?:^|_)(?:price|prices|stock|availability|discount|affiliate|merchant|seller|rating|ratings|review|reviews|score|ranking|recommendation|retired|retirement|discontinued)(?:_|$)/i;
const id=(s:unknown)=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,119}$/.test(s);
const date=(s:unknown)=>typeof s==='string'&&!Number.isNaN(Date.parse(s));
const safeUrl=(raw:string)=>{
 try{const u=new URL(raw);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash&&u.hostname.includes('.');}
 catch{return false;}
};

/** Python returns only a bounded JSON result. It never retrieves URLs. */
async function pythonAction<T>(module:string,action:string,data:Record<string,unknown>):Promise<T>{
 const raw=JSON.stringify(data);if(Buffer.byteLength(raw,'utf8')>6_000_000)throw Error('input_cap');
 return new Promise<T>((ok,bad)=>{
  const child=spawn('python3',['-m',module,action],{cwd:root,env:{...process.env,PYTHONPATH:root},stdio:['pipe','pipe','ignore'],shell:false});
  let output='',finished=false;
  const timer=setTimeout(()=>{child.kill();done(new Error('timeout'));},15000);
  function done(error?:Error,result?:T){if(finished)return;finished=true;clearTimeout(timer);if(error)bad(error);else ok(result as T);}
  child.on('error',e=>done(e));
  child.stdout.on('data',(b:Buffer)=>{output+=b.toString('utf8');if(output.length>200000){child.kill();done(Error('output_cap'));}});
  child.stdin.on('error',()=>{});
  child.on('close',code=>{
   try{const r=JSON.parse(output) as {ok:boolean;result:T;error:string};
    if(code!==0||r.ok!==true)done(Error(String(r.error??'python_failed').slice(0,160)));
    else done(undefined,r.result);
   }catch{done(Error('invalid_python_output'));}
  });
  child.stdin.end(raw);
 });
}

type ExtractValue={value:number;unit:string;origin:string;evidence_state:string;
 source_url:string;model:string;strategy_sha256:string};
function allowedScope(url:string,r:ReviewedHtmlRecord):boolean {
 try{const u=new URL(url),p=String(r.recipe.path_prefix);
  return safeUrl(url)&&u.hostname===r.recipe.source_host&&
   (p.endsWith('/')?u.pathname.startsWith(p):u.pathname===p||u.pathname.startsWith(p+'/'));
 }catch{return false;}
}
/** Locate a bounded literal containing BOTH the reviewed label and numeric value.
 * If literal source placement is ambiguous, prefer an omission over a false anchor.
 * The python HTML parser independently verifies model, candidate ID and unit. */
function originalAnchor(html:string,label:string,value:number):{anchor:string;literal:string}|null {
 if(typeof label!=='string'||label.length<2||label.includes('<')||label.includes('>')||!Number.isFinite(value))return null;
 const at=html.indexOf(label);
 if(at<0||html.indexOf(label,at+label.length)>=0)return null;
 const window=html.slice(at,at+260);
 const escaped=String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const rx=new RegExp('(?:^|[^0-9.])('+escaped+')(?![0-9.])','g');
 const matches=[...window.matchAll(rx)];
 if(matches.length!==1||matches[0].index===undefined||matches[0].index>230)return null;
 const literal=matches[0][1];
 const end=at+matches[0].index+matches[0][0].length;
 const anchor=html.slice(at,Math.min(html.length,Math.max(end,at+12)));
 if(anchor.length<10||anchor.length>300||!anchor.includes(literal))return null;
 return {anchor,literal};
}
function selectedRecord(registry:CategoryFieldRegistry,candidate:WebCandidate,r:ReviewedHtmlRecord):boolean {
 if(!allowedScope(candidate.url,r)||r.recipe.category!==registry.categoryId||
  r.registryReviewReference!==registry.reviewReference||r.registrySchemaVersion!==registry.schemaVersion||
  r.recipe.mappings.length>20||!r.recipe.mappings.length)return false;
 for(const m of r.recipe.mappings){
  const f=registry.fields.find(x=>x.key===m.field_key);
  if(!f||f.type!=='number'||f.unit!==m.unit||f.requiresProtocol||
   f.permittedOrigins.length!==1||f.permittedOrigins[0]!=='manufacturer_technical_specification'||
   denied.test(f.key)||
   !r.context[m.field_key]||Object.keys(r.context[m.field_key]).length!==f.contextKeys.length||
   !f.contextKeys.every(k=>id(r.context[m.field_key][k])))return false;
 }
 return true;
}
export type HtmlMainlineResult={
 status:'quarantined'|'blocked';reasons:string[];sourceUrl:string;
 observations:QuarantinedMatrixObservation[];recipeSha256:string|null;
 advisoryAction:string|null;monitoring:'not_requested'|'recorded'|'unavailable';
 recipeWatch:'not_requested'|'cleared'|'requalification_required'|'unavailable';
 rankingEligible:false;publicationReady:false;localModelCalls:0;storedSourceHtml:false;
};
export async function acquireReviewedHtmlSpecifications(args:{
 registry:CategoryFieldRegistry;candidate:WebCandidate;policy:WebSourcePolicy;
 asOf:string;expectedModel:string;recipeStore:ReviewedRecipeStore;
 transport?:SourceTransport;watchDbPath?:string;
 /** Phase93: mandatory monitoring in permissioned pilot/deployment profiles. */
 monitoringMode?:'research_optional'|'required';
}):Promise<HtmlMainlineResult>{
 const {registry,candidate,policy,asOf,expectedModel,recipeStore}=args;
 const result:HtmlMainlineResult={status:'blocked',reasons:[],sourceUrl:candidate?.url??'',
  observations:[],recipeSha256:null,advisoryAction:null,monitoring:'not_requested',recipeWatch:'not_requested',
  rankingEligible:false,publicationReady:false,localModelCalls:0,storedSourceHtml:false};
 let recipe:ReviewedHtmlRecord|null=null;
 let catalogRevision:string|null=null;
 let skipWatchRecord=false;
 let observation:'quarantined_success'|'structural_missing'|'source_access_blocked'|'manual_validation_required'='manual_validation_required';
 try{
  if(!candidate||!registry||!policy||!date(asOf)||!expectedModel||expectedModel.length>100||
   candidate.kind!=='manufacturer_technical_document'||!safeUrl(candidate.url)){
   result.reasons=['invalid_input_or_manufacturer_source'];return result;
  }
  if(args.monitoringMode==='required'&&!args.watchDbPath){
   result.reasons=['phase93_monitoring_configuration_required'];return result;
  }
  const catalog=await recipeStore.snapshotHtml();catalogRevision=catalog.revisionSha256;
  const matches=catalog.active.filter(r=>selectedRecord(registry,candidate,r));
  if(matches.length!==1){result.reasons=['no_unique_reviewed_html_strategy_or_registry_mismatch'];return result;}
  recipe=matches[0];result.recipeSha256=recipe.recipe.recipe_sha256;
  // Phase91: a persisted drift case always suspends this exact recipe digest,
  // even when the advisory ticket is marked 'closed_manually'. Closure cannot
  // approve a method or bypass the Phase85 review/versioning process.
  if(args.watchDbPath){
   try{
    const state=await checkReviewedHtmlRecipeWatch({watchDbPath:args.watchDbPath,recipe});
    if(!state.safe_to_reuse_under_review_gate){
     result.recipeWatch='requalification_required';
     result.advisoryAction='human_requalification_required';
     result.reasons=['reviewed_html_recipe_requalification_required'];
     skipWatchRecord=true;
     return result;
    }
    result.recipeWatch='cleared';
   }catch{
    result.recipeWatch='unavailable';result.monitoring='unavailable';
    result.reasons=['recipe_watch_preflight_unavailable'];
    skipWatchRecord=true;
    return result;
   }
  }
  const plan=planWebEvidenceAcquisition({exactVariantId:candidate.exactVariantId,
   userQuestion:'Independent empirical research on this exact product and use case',
   asOf,maxDaysSinceCheck:7,candidates:[candidate],existing:[],policies:[policy]});
  const item=plan.items[0];
  if(item.action!=='retrieve_for_research'){
   result.reasons=item.reasons;observation='source_access_blocked';return result;
  }
  const proposed:ProposedStructuredFact[]=[];let extractionProblem:string|null=null;
  const read=await readApprovedSource({plan,queueItem:item,candidate,policy,checkedAt:asOf,
   transport:args.transport,transientClaimExtractor:async body=>{
    try{
     if(Buffer.byteLength(body,'utf8')>750000)throw Error('html_cap');
     const extracted=await pythonAction<Record<string,ExtractValue>>('phase87.cli','extract',{
      recipe:recipe!.recipe,url:candidate.url,model:expectedModel,html:body});
     const keys=Object.keys(extracted);
     if(keys.length!==recipe!.recipe.mappings.length)throw Error('incomplete_fields');
     const claims:TransientWebClaim[]=[];
     for(const [i,m] of recipe!.recipe.mappings.entries()){
      const x=extracted[m.field_key];
      if(!x||x.model!==expectedModel||x.source_url!==candidate.url||
       x.strategy_sha256!==recipe!.recipe.recipe_sha256||
       x.origin!=='manufacturer_declared'||x.evidence_state!=='quarantined_not_independently_tested'||
       x.unit!==m.unit||!Number.isFinite(x.value)||denied.test(m.field_key))throw Error('invalid_declared_value');
      const bound=originalAnchor(body,m.label,x.value);
      if(!bound)throw Error('no_unique_original_anchor');
      claims.push({criterionId:m.field_key,valueText:bound.literal,anchorText:bound.anchor});
      proposed.push({observationId:`html_reviewed_${i+1}`,fieldKey:m.field_key,
       origin:'manufacturer_technical_specification',
       value:{type:'number',number:x.value,unit:x.unit},context:recipe!.context[m.field_key],
       protocolId:null,protocolVersion:null,
       valueTextSha256:sha(bound.literal),anchorSha256:sha(bound.anchor)});
     }
     return claims;
    }catch(e){extractionProblem=e instanceof Error?e.message:'html_extraction_failed';throw e;}
   }});
  if(read.status!=='quarantined'){
   observation=extractionProblem?(/^(?:recipe_missing_or_ambiguous_field:|no_unique_original_anchor$)/.test(extractionProblem)?'structural_missing':'manual_validation_required'):'source_access_blocked';
   result.reasons=[...read.reasons,...(extractionProblem?[`html_recipe_${extractionProblem}`]:[])];return result;
  }
  // Phase93 optimistic revision and drift check after source read, before matrix construction.
  // A source may change its reviewed strategy DURING an HTTP fetch. Never
  // interpret those bytes under a strategy which is no longer in force.
  const current=await recipeStore.snapshotHtml();
  if(current.revisionSha256!==catalogRevision||
   !current.active.some(x=>x.recipe.recipe_sha256===recipe!.recipe.recipe_sha256)){
   result.reasons=['phase93_catalog_changed_during_acquisition'];
   skipWatchRecord=true;return result;
  }
  if(args.watchDbPath){
   try{const fresh=await checkReviewedHtmlRecipeWatch({watchDbPath:args.watchDbPath,recipe:recipe!});
    if(!fresh.safe_to_reuse_under_review_gate){
     result.recipeWatch='requalification_required';result.advisoryAction='human_requalification_required';
     result.reasons=['phase93_watch_changed_during_acquisition'];skipWatchRecord=true;return result;
    }
   }catch{result.recipeWatch='unavailable';result.monitoring='unavailable';
    result.reasons=['phase93_watch_recheck_unavailable'];skipWatchRecord=true;return result;}
  }
  const matrix=buildCategoryEvidenceMatrix({registry,candidate,policy,processing:read.evidence,asOf,proposed});
  if(matrix.rejected.length>0||matrix.observations.length!==recipe.recipe.mappings.length){
   result.reasons=['reviewed_matrix_rejected_some_claims',...matrix.rejected.map(x=>x.reason)];return result;
  }
  result.status='quarantined';result.observations=matrix.observations;
  observation='quarantined_success';return result;
 }catch(e){result.reasons=[e instanceof Error?e.message:'unexpected_failure'];return result;}
 finally{
  if(args.watchDbPath&&recipe&&!skipWatchRecord){
   try{
    const recorded=await pythonAction<{action:string}>('phase89.cli','record',{
     db_path:args.watchDbPath,record:{source_host:recipe.recipe.source_host,
      path_prefix:recipe.recipe.path_prefix,category:registry.categoryId,
      recipe_id:recipe.recipe.recipe_sha256,url:candidate.url,model:expectedModel,
      observed_at:asOf,event_type:observation,
      receipt_id:'mainline-'+sha(JSON.stringify([candidate.url,expectedModel,asOf,observation]))}});
    result.monitoring='recorded';result.advisoryAction=recorded.action;
   }catch{result.monitoring='unavailable';}
  }
  // A second Phase93 consistency check after durable telemetry closes the
  // normal post-read gap as much as this file-based architecture permits.
  // It is NOT a serializable transaction with the rights/monitor/catalogue DBs.
  if(args.monitoringMode==='required'&&result.status==='quarantined'&&recipe){
   try{
    const finalSnapshot=await recipeStore.snapshotHtml();
    const watch=await checkReviewedHtmlRecipeWatch({watchDbPath:args.watchDbPath!,recipe});
    if(finalSnapshot.revisionSha256!==catalogRevision||!watch.safe_to_reuse_under_review_gate){
     result.status='blocked';result.observations=[];result.reasons=['phase93_post_record_consistency_failed'];
    }
   }catch{
    result.status='blocked';result.observations=[];result.reasons=['phase93_post_record_consistency_unavailable'];
   }
  }
  // Phase93 deployment path must not return a success if its required
  // outcome was not durably observed by the watch ledger. The matrix above
  // is ephemeral and no public result was published.
  if(args.monitoringMode==='required'&&result.status==='quarantined'&&result.monitoring!=='recorded'){
   result.status='blocked';result.observations=[];result.reasons=['phase93_required_monitor_write_failed'];
  }
 }
}
