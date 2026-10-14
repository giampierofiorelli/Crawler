/** Phase 75: deterministic, explainable selection of *research*, never ranking. */
import type {CategoryTaskPlan,CognitiveTask,Capability} from './category_cognitive_mesh.js';
export type GapClass='unknown_category'|'safety_uncertainty'|'method_uncertainty'|'poor_coverage'|'stale_evidence'|'user_decision_uncertainty';
export interface ResearchGap {
  id:string;categoryId:string;gapClass:GapClass;
  /** Curated 0-3 ordinal severity; NOT a calibrated probability. */
  severity:0|1|2|3;
  affectedUses:number;
  sourceIds:readonly string[];
  /** Number of distinct *original tests*, independently verified upstream. */
  distinctOriginalTests:number;
  lastCheckedAt:string|null;
  asOf:string;
  nextAllowedAt:string|null;
  rightsStatus:'cleared_for_discovery'|'unknown'|'blocked';
}
export interface ResearchPriority {
  taskId:string;capability:Capability;categoryId:string;
  /** Ordinal priority, not a measured probability of changing a ranking. */
  priority:number;reasons:string[];
  webDiscoveryPermitted:boolean;
  rankingEligible:false;
}
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,119}$/.test(s);
const validAt=(s:string|null)=>s===null||typeof s==='string'&&Number.isFinite(Date.parse(s))&&/^\d{4}-\d\d-\d\dT/.test(s);
const CLASS_WEIGHT:Record<GapClass,number>={unknown_category:5,safety_uncertainty:6,method_uncertainty:5,poor_coverage:4,stale_evidence:3,user_decision_uncertainty:5};
const GAP_RELEVANCE:Partial<Record<Capability,GapClass[]>>={
 category_identity:['unknown_category'],use_case_research:['unknown_category','user_decision_uncertainty'],
 failure_and_safety_research:['safety_uncertainty'],test_method_research:['method_uncertainty'],
 criterion_design:['method_uncertainty','user_decision_uncertainty'],
 source_landscape:['poor_coverage','unknown_category'],source_rights_review:['poor_coverage'],
 coverage_analysis:['poor_coverage','user_decision_uncertainty'],targeted_backfill:['poor_coverage'],
 freshness_review:['stale_evidence'],category_change_watch:['stale_evidence']};
const CAPABILITY_WEIGHT:Partial<Record<Capability,number>>={category_identity:5,source_rights_review:5,failure_and_safety_research:4,test_method_research:4,source_landscape:3,coverage_analysis:3,freshness_review:2};
export function prioritizeCategoryResearch(input:{plan:CategoryTaskPlan;gaps:readonly ResearchGap[];asOf:string;maxTasks:number;pendingTaskIds?:readonly string[]}):{
 selected:ResearchPriority[];blocked:{taskId:string;reason:string}[]; noAutomaticPublication:true;
} {
 if(!Number.isFinite(Date.parse(input.asOf))||!Number.isInteger(input.maxTasks)||input.maxTasks<0||input.maxTasks>20||
    !Array.isArray(input.gaps)||input.gaps.length>500||new Set(input.gaps.map(g=>g.id)).size!==input.gaps.length||
    !Array.isArray(input.plan?.tasks)||input.plan.tasks.length>50)throw Error('Invalid priority inputs');
 const pending=new Set(input.pendingTaskIds??[]);
 const available:ResearchPriority[]=[];const blocked:{taskId:string;reason:string}[]=[];
 for(const task of input.plan.tasks){
  if(task.status!=='ready_for_research'){blocked.push({taskId:task.id,reason:'dependencies_not_reviewed'});continue;}
  if(pending.has(task.id)){blocked.push({taskId:task.id,reason:'previous_run_pending_review'});continue;}
  const gaps=input.gaps.filter(g=>g.categoryId===task.categoryId);
  if(gaps.some(g=>!id(g.id)||!id(g.categoryId)||!Object.hasOwn(CLASS_WEIGHT,g.gapClass)||
   ![0,1,2,3].includes(g.severity)||!Number.isInteger(g.affectedUses)||g.affectedUses<0||g.affectedUses>1000000||
   !Number.isInteger(g.distinctOriginalTests)||g.distinctOriginalTests<0||!Array.isArray(g.sourceIds)||
   g.sourceIds.length>100||!validAt(g.asOf)||!validAt(g.lastCheckedAt)||!validAt(g.nextAllowedAt)||
   Date.parse(g.asOf)>Date.parse(input.asOf)||g.lastCheckedAt!==null&&Date.parse(g.lastCheckedAt)>Date.parse(input.asOf)))
   throw Error('Invalid gap input');
  const relevant=GAP_RELEVANCE[task.capability];
  const eligible:ResearchGap[]=gaps.filter(g=>(!relevant||relevant.includes(g.gapClass))&&
   g.rightsStatus!=='blocked'&&(!g.nextAllowedAt||Date.parse(g.nextAllowedAt)<=Date.parse(input.asOf)));
  // There is a baseline cold-start research need even before any measured gap exists.
  const baseline=CAPABILITY_WEIGHT[task.capability]??1;
  const urgency=eligible.length?Math.max(...eligible.map(g=>CLASS_WEIGHT[g.gapClass]+g.severity*2+
    (g.distinctOriginalTests===0?2:0)+(g.affectedUses>0?1:0))):0;
  const rightsClear=eligible.some(g=>g.rightsStatus==='cleared_for_discovery');
  // Having a ready research task does not itself grant permission to retrieve any URL.
  available.push({taskId:task.id,categoryId:task.categoryId,capability:task.capability,
   priority:baseline+urgency,reasons:[eligible.length?'gap_priority':'baseline_category_research',
    rightsClear?'discovery_scope_must_be_rechecked':'no_cleared_discovery_scope'],
   webDiscoveryPermitted:false,rankingEligible:false});
 }
 available.sort((a,b)=>b.priority-a.priority||a.taskId.localeCompare(b.taskId));
 return {selected:available.slice(0,input.maxTasks),blocked,noAutomaticPublication:true};
}
