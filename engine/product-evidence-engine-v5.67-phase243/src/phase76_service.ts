/** Consumer demand -> Phase 75 research. A queued task never claims analysis
 * is in progress until it obtains a worker lease. Findings remain unreviewed.
 */
import {Phase76RequestQueue,type PublicRequestView} from './phase76_request_queue.js';
import {Phase75ResearchJournal} from './phase75_memory.js';
import {runPhase75Research} from './phase75_runtime.js';
import {planCategoryCapabilities,type CategoryIdentity} from './category_cognitive_mesh.js';
import type {LocalCapabilityWorker} from './category_research_execution.js';
import type {ResearchGap} from './phase75_priority.js';
export interface ProductResearchWorker {
 execution:'local_only';
 /** Research-only product discovery. The worker must use rights-approved sources. */
 research(input:{categoryId:string;categoryLabel:string;productLabel:string;
  useCaseKey:string;asOf:string}):Promise<{
   outcome:'source_candidates_found'|'no_sufficient_material';
   sourceReferenceIds:string[];
  }>;
}
export interface Phase76Services {
 queue:Phase76RequestQueue;journal:Phase75ResearchJournal;
 catalog:readonly CategoryIdentity[];workers:readonly LocalCapabilityWorker[];
 productWorker?:ProductResearchWorker;
 gaps:readonly ResearchGap[];
}
export async function workNextUserRequest(services:Phase76Services,at=new Date().toISOString()):Promise<
 {processed:false;reason:'no_pending_request'}|{processed:true;view:PublicRequestView;workExecuted:boolean}>{
 const claimed=await services.queue.claimNext(at,180000,r=>{
  if(r.productLabel!==null)return services.productWorker?.execution==='local_only';
  const plan=planCategoryCapabilities({label:r.categoryLabel,catalog:services.catalog,asOf:at});
  return plan.tasks.some(t=>t.status==='ready_for_research'&&
   services.workers.some(w=>w.execution==='local_only'&&w.capability===t.capability));
 });
 if(!claimed)return {processed:false,reason:'no_pending_request'};
 try{
  // Product-specific demand cannot be fulfilled by category research alone.
  if(claimed.productLabel!==null){
   if(!services.productWorker||services.productWorker.execution!=='local_only'){
    return {processed:true,view:await services.queue.settle(claimed,'awaiting_research_capacity',[],at),workExecuted:false};
   }
   const x=await services.productWorker.research({categoryId:claimed.categoryId,
    categoryLabel:claimed.categoryLabel,productLabel:claimed.productLabel,
    useCaseKey:claimed.useCaseKey,asOf:at});
   if(!x||!Array.isArray(x.sourceReferenceIds)||x.sourceReferenceIds.length>20||
    x.sourceReferenceIds.some(id=>!/^([a-z][a-z0-9_]{0,119})$/.test(id))||
    !['source_candidates_found','no_sufficient_material'].includes(x.outcome)||
    x.outcome==='source_candidates_found'&&x.sourceReferenceIds.length===0)
    throw Error('Invalid product research result');
   const status=x.outcome==='source_candidates_found'?'awaiting_independent_review':'insufficient_evidence';
   return {processed:true,view:await services.queue.settle(claimed,status,[],at,x.sourceReferenceIds),workExecuted:true};
  }
  const plan=planCategoryCapabilities({label:claimed.categoryLabel,catalog:services.catalog,asOf:at});
  const ready=plan.tasks.filter(t=>t.status==='ready_for_research');
  const hasWorker=ready.some(t=>services.workers.some(w=>w.execution==='local_only'&&w.capability===t.capability));
  if(!hasWorker){
   return {processed:true,view:await services.queue.settle(claimed,'awaiting_research_capacity',[],at),workExecuted:false};
  }
  const results=await runPhase75Research({label:claimed.categoryLabel,catalog:services.catalog,
   asOf:at,workers:services.workers,journal:services.journal,gaps:services.gaps,maxTasks:2});
  const rows=results.executed.outcomes;
  const status=rows.some(x=>x.status==='executed_pending_independent_review')||
   results.pendingTaskIds.some(t=>t.startsWith(claimed.categoryId+'_'))?
   'awaiting_independent_review':
   rows.some(x=>x.status==='no_verified_references')?'insufficient_evidence':
   rows.some(x=>x.status==='worker_rejected')?'temporarily_unavailable':
   'awaiting_research_capacity';
  return {processed:true,view:await services.queue.settle(claimed,status,rows.map(r=>r.taskId),at,
   [...new Set(rows.flatMap(r=>r.referenceIds))]),
   workExecuted:results.executed.actualWorkExecuted};
 }catch(err){
  // Even logging here must not contain untrusted source text or user prompts.
  return {processed:true,view:await services.queue.settle(claimed,'temporarily_unavailable',[],at),
   workExecuted:false};
 }
}
