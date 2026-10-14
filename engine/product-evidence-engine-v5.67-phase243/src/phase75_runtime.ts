/** Coordinate priority, a bounded worker execution, and durable unreviewed memory.
 * No work product, approval, or source body is treated as a verified fact.
 */
import {randomUUID} from 'node:crypto';
import {planCategoryCapabilities,type CategoryIdentity,type CapabilityCompletionReceipt} from './category_cognitive_mesh.js';
import {executeCategoryResearchCycle,type LocalCapabilityWorker} from './category_research_execution.js';
import {prioritizeCategoryResearch,type ResearchGap} from './phase75_priority.js';
import {Phase75ResearchJournal} from './phase75_memory.js';
export async function runPhase75Research(input:{
 label:string;catalog:readonly CategoryIdentity[];asOf:string;
 workers:readonly LocalCapabilityWorker[];journal:Phase75ResearchJournal;
 gaps:readonly ResearchGap[];maxTasks?:number;completionReceipts?:readonly CapabilityCompletionReceipt[];
}){
 const snapshot=await input.journal.load();
 const plan=planCategoryCapabilities({label:input.label,catalog:input.catalog,asOf:input.asOf,
   completionReceipts:input.completionReceipts});
 const priority=prioritizeCategoryResearch({plan,gaps:input.gaps,asOf:input.asOf,
   maxTasks:input.maxTasks??3,pendingTaskIds:snapshot.pendingTaskIds});
 const executed=await executeCategoryResearchCycle({label:input.label,catalog:input.catalog,asOf:input.asOf,
   workers:input.workers,completionReceipts:input.completionReceipts,
   onlyTaskIds:priority.selected.map(p=>p.taskId),maxTasks:input.maxTasks??3,
   pendingTaskIds:snapshot.pendingTaskIds});
 // Record all execution attempts, not a claim of successful validation.
 const next=await input.journal.record('run_'+randomUUID().replace(/-/g,'_'),
   plan.route.status==='known'?plan.route.identity.categoryId:
   plan.route.status==='unknown'?plan.route.provisionalId:'unclassified',input.asOf,executed);
 return {priority,executed,persistedRevision:next.revision,
   pendingTaskIds:next.pendingTaskIds,
   productionDatabaseConnected:false,rankingEligible:false as const};
}
