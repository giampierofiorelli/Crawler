/** Phase182 — research-gap execution bridge. Research is NOT evidence admission.
 * Reuses Phase129/179 category workers and Phase68/69 rights-aware exact-product
 * acquisition; never supplies automatic review, measurements or rankings.
 * Caller must supply protected operator policy/registry; user text cannot grant rights.
 */
import {createHash} from 'node:crypto';
import {type DynamicDecision181,type ResearchGap181} from './phase181_dynamic_knowledge_ranking.js';
import {runCategoryInvestigation179,type CategoryPlan179} from './phase179_category_learning.js';
import {type CategoryIdentity} from './category_cognitive_mesh.js';
import {type LocalCapabilityWorker,type ResearchCycleResult} from './category_research_execution.js';
import {planWebEvidenceAcquisition,type WebCandidate,type WebSourcePolicy,
 type KnownWebEvidence,type QueueAction} from './web_evidence_acquisition.js';
import {readApprovedSource,type SourceTransport} from './approved_web_reader.js';

const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(s)&&!['__proto__','constructor','prototype'].includes(s);
const stamp=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(s)&&Number.isFinite(Date.parse(s));
const uniq=<T>(items:readonly T[])=>[...new Set(items)];
const gapTypes:readonly ResearchGap181['kind'][]=['new_category','missing_product','missing_criterion','missing_test','stale_knowledge','scope_unconfirmed','unconfirmed_need','no_catalog','need_review'];
const priority:Record<ResearchGap181['kind'],number>={missing_criterion:0,missing_test:1,missing_product:2,stale_knowledge:3,new_category:4,no_catalog:5,need_review:6,unconfirmed_need:7,scope_unconfirmed:8};
export type ResearchKind182='category_research'|'exact_variant_source_research'|'requirement_clarification'|'independent_review';
export interface ResearchJob182 {
 jobId:string;categoryId:string;kind:ResearchKind182;gapKind:ResearchGap181['kind'];reference:string;
 exactVariantId:string|null;criterionId:string|null;
 priorityOrder:number;authority:'research_only';status:'queued';
}
export interface ResearchPlan182 {
 phase:182;schema:'182.1';categoryId:string;categoryLabel:string;market:string;
 asOf:string;inputFingerprint:string;knowledgeRevision:string|null;policyRevision:string|null;
 jobs:readonly ResearchJob182[];omittedByBudget:number;planHash:string;
 planningOnly:true;rankingAuthorized:false;hardExclusionsAuthorized:false;
}
const planContent=(p:Omit<ResearchPlan182,'planHash'>)=>JSON.stringify(p);
/** Phase254: the per-gap bounds and job identity of planResearchGaps182, exported so a caller WITHOUT a signed
 * Phase181 decision can preview the exact job a gap would become. A preview is not a plan and grants no authority:
 * planResearchGaps182 remains the only way to obtain a ResearchPlan182, and it still requires the Phase181 decision. */
export function researchJobFromGap182(categoryId:string,g:ResearchGap181):ResearchJob182{
 if(!id(categoryId))throw Error('phase182_bad_plan_input');
 if(!g||!gapTypes.includes(g.kind)||typeof g.reference!=='string'||g.reference.length>210||
  typeof g.action!=='string'||g.action.length>1000)throw Error('phase182_untrusted_gap');
 // Product identifiers and criteria are bounded *before* being handed to a worker.
 let kind:ResearchKind182,variant:string|null=null,criterion:string|null=null;
 if(g.kind==='missing_test'){
  const sep=g.reference.lastIndexOf(':');
  const variantPart=g.reference.slice(0,sep),criterionPart=g.reference.slice(sep+1);
  if(sep<=0||!id(variantPart)||!id(criterionPart))throw Error('phase182_bad_variant_or_criterion');
  variant=variantPart;criterion=criterionPart;kind='exact_variant_source_research';
 }else if(g.kind==='missing_product'){
  if(!id(g.reference))throw Error('phase182_bad_variant');variant=g.reference;kind='exact_variant_source_research';
 }else if(['unconfirmed_need','scope_unconfirmed'].includes(g.kind)){
  if(!id(g.reference))throw Error('phase182_bad_reference');kind='requirement_clarification';
 }else if(g.kind==='need_review'){
  if(!id(g.reference))throw Error('phase182_bad_reference');kind='independent_review';
 }else {
  if(!id(g.reference))throw Error('phase182_bad_reference');kind='category_research';
 }
 const spec=[categoryId,kind,g.kind,g.reference,variant,criterion];
 return {jobId:`research_${sha(JSON.stringify(spec)).slice(0,32)}`,categoryId,kind,gapKind:g.kind,
  reference:g.reference,exactVariantId:variant,criterionId:criterion,priorityOrder:priority[g.kind as ResearchGap181['kind']],
  authority:'research_only',status:'queued'};
}
/** A gap is a RESEARCH hint, not a command allowing unsupervised browsing. */
export function planResearchGaps182(args:{decision:DynamicDecision181;categoryId:string;categoryLabel:string;
 market:string;asOf:string;maxJobs?:number}):ResearchPlan182 {
 const {decision:d,categoryId,categoryLabel,market,asOf}=args;
 const max=args.maxJobs??20;
 if(!d||d.phase!==181||d.source!=='signed_product_knowledge'||d.rankingsPrecomputed!==false||
   d.researchAccessPerformed!==false||!id(categoryId)||!id(market)||!stamp(asOf)||
   typeof categoryLabel!=='string'||!(/^[a-zA-Z][a-zA-Z0-9 /-]{2,99}$/.test(categoryLabel))||
   !id(d.rankInputFingerprint)||!Array.isArray(d.researchGaps)||d.researchGaps.length>300||
   !Number.isSafeInteger(max)||max<1||max>100)throw Error('phase182_bad_plan_input');
 const jobs:ResearchJob182[]=d.researchGaps.map(g=>researchJobFromGap182(categoryId,g));
 const sorted=[...new Map(jobs.map(x=>[x.jobId,x])).values()].sort((a,b)=>a.priorityOrder-b.priorityOrder||a.jobId.localeCompare(b.jobId,'en'));
 const base:Omit<ResearchPlan182,'planHash'>={phase:182,schema:'182.1',categoryId,categoryLabel,market,asOf,
  inputFingerprint:d.rankInputFingerprint,knowledgeRevision:d.knowledgeRevision,policyRevision:d.policyRevision,
  jobs:sorted.slice(0,max),omittedByBudget:sorted.length-Math.min(sorted.length,max),planningOnly:true,
  rankingAuthorized:false,hardExclusionsAuthorized:false};
 return {...base,planHash:sha(planContent(base))};
}
export interface CuratedVariantSources182 {
 variantId:string;candidates:readonly WebCandidate[];existing:readonly KnownWebEvidence[];
 /** Must originate from protected operator source registry, not the visitor's input. */
 sourceRegistry:'operator_curated_unverified';
}
export interface ResearchOutcome182 {
 jobId:string;kind:ResearchKind182;
 status:'clarification_needed'|'awaiting_independent_review'|'category_worker_missing'|
 'worker_attempted_pending_review'|'no_curated_sources'|'source_policy_blocked'|
 'source_research_quarantined'|'source_retrieval_blocked'|'already_reviewed_source_reuse';
 discoveryRecords:readonly {candidateId:string;action:QueueAction;reasons:readonly string[];
  sourceUrl:string|null;contentSha256:string|null}[];
 sourceReferenceIds:readonly string[];notes:readonly string[];
}
export interface ResearchRun182 {
 phase:182;schema:'182.1';planHash:string;runHash:string;asOf:string;
 outcomes:readonly ResearchOutcome182[];categoryExecution:ResearchCycleResult|null;
 sourceRetrievalAttempts:number;sourcePagesQuarantined:number;sourceBodiesRetained:false;allFindingsPendingIndependentReview:true;
 canonicalKnowledgeUpdated:false;rankingAuthorized:false;reviewReceiptsIssued:0;
}
/** Explicit trust boundary: operator provides source catalog, permissions, local
 * workers and optional transport. Nothing in an HTTP request can confer them.
 * Default never downloads pages; even permitted retrieval remains quarantine.
 */
export async function executeResearchGaps182(args:{plan:ResearchPlan182;
 categoryCatalog:readonly CategoryIdentity[];workers:readonly LocalCapabilityWorker[];
 operatorSources:readonly CuratedVariantSources182[];sourcePolicies:readonly WebSourcePolicy[];
 existingWorkerBudget?:number;maxSourceReads?:number;transport?:SourceTransport;
 allowSourceReads?:boolean;}):Promise<ResearchRun182>{
 const {plan:p}=args;
 if(!p||p.phase!==182||p.schema!=='182.1'||!id(p.categoryId)||!id(p.market)||!stamp(p.asOf)||
  p.rankingAuthorized!==false||p.hardExclusionsAuthorized!==false||p.planningOnly!==true||
  !Array.isArray(p.jobs)||p.jobs.length>100||!Number.isSafeInteger(p.omittedByBudget)||p.omittedByBudget<0||
  !Array.isArray(args.categoryCatalog)||!Array.isArray(args.workers)||args.workers.length>20||
  !Array.isArray(args.operatorSources)||args.operatorSources.length>100||
  !Array.isArray(args.sourcePolicies)||args.sourcePolicies.length>1000) {
  // Hash validated below with a reconstruction that excludes the hash field.
  throw Error('phase182_invalid_execution');
 }
 const {planHash,...remainder}=p;
 if(!id(p.inputFingerprint)||typeof p.categoryLabel!=='string'||!(/^[a-zA-Z][a-zA-Z0-9 /-]{2,99}$/.test(p.categoryLabel))||
  ![p.knowledgeRevision,p.policyRevision].every(x=>x===null||id(x))||
  p.jobs.some((x,i)=>i>0&&(p.jobs[i-1].priorityOrder>x.priorityOrder||
   p.jobs[i-1].priorityOrder===x.priorityOrder&&p.jobs[i-1].jobId.localeCompare(x.jobId,'en')>0)))
  throw Error('phase182_tampered_plan');
 if(sha(planContent(remainder))!==planHash||p.jobs.some(j=>j.categoryId!==p.categoryId||j.status!=='queued'||
   j.authority!=='research_only'||j.jobId!==`research_${sha(JSON.stringify([j.categoryId,j.kind,j.gapKind,j.reference,j.exactVariantId,j.criterionId])).slice(0,32)}`||
   priority[j.gapKind as ResearchGap181['kind']]!==j.priorityOrder||!gapTypes.includes(j.gapKind)||!['category_research','exact_variant_source_research','requirement_clarification','independent_review'].includes(j.kind))||
   new Set(p.jobs.map(x=>x.jobId)).size!==p.jobs.length)
  throw Error('phase182_tampered_plan');
 const cap=args.maxSourceReads??0,workerBudget=args.existingWorkerBudget??2;
 if(!Number.isSafeInteger(cap)||cap<0||cap>5||!Number.isSafeInteger(workerBudget)||workerBudget<0||workerBudget>10||
  (cap>0&&args.allowSourceReads!==true))throw Error('phase182_read_requires_explicit_operator_opt_in');
 const sources=new Map<string,CuratedVariantSources182>();
 for(const s of args.operatorSources){if(!id(s?.variantId)||sources.has(s.variantId)||
   s.sourceRegistry!=='operator_curated_unverified'||!Array.isArray(s.candidates)||s.candidates.length>50||
   !Array.isArray(s.existing)||s.existing.length>200)throw Error('phase182_invalid_operator_registry');
  sources.set(s.variantId,s);
 }
 let categoryExecution:ResearchCycleResult|null=null;
 const hasCategory=p.jobs.some(x=>x.kind==='category_research');
 if(hasCategory){
  const result=await runCategoryInvestigation179({label:p.categoryLabel,catalog:args.categoryCatalog,
   asOf:p.asOf,workers:args.workers,maxTasks:workerBudget});
  categoryExecution=result.execution;
 }
 let retrievalAttempts=0,pagesQuarantined=0;
 const outcomes:ResearchOutcome182[]=[];
 const readCache=new Map<string,{status:'blocked'|'quarantined';sourceUrl:string|null;digest:string|null;reasons:string[]}>();
 for(const j of p.jobs){
  let status:ResearchOutcome182['status']='awaiting_independent_review';
  const records:ResearchOutcome182['discoveryRecords'][number][]=[],notes:string[]=[],references:string[]=[];
  if(j.kind==='requirement_clarification'){
   status='clarification_needed';notes.push('Ask for explicit user confirmation; never infer a hard constraint from missing evidence.');
  }else if(j.kind==='independent_review'){
   status='awaiting_independent_review';notes.push('Independent reviewer receipt is required. Research workers cannot issue it.');
  }else if(j.kind==='category_research'){
   const executed=categoryExecution?.outcomes.some(x=>x.status==='executed_pending_independent_review'||x.status==='no_verified_references');
   status=executed?'worker_attempted_pending_review':'category_worker_missing';
   references.push(...(categoryExecution?.outcomes.flatMap(x=>x.referenceIds)??[]));
   notes.push('Existing Phase129/179 worker results stay quarantined.');
  }else{
   const curated=sources.get(j.exactVariantId!);
   if(!curated||!curated.candidates.length){status='no_curated_sources';
    notes.push('Need independently discovered exact-variant original source metadata.');
   }else{
    const researchPlan=planWebEvidenceAcquisition({exactVariantId:j.exactVariantId!,
     userQuestion:'Independent empirical research on this exact product and use case',
     asOf:p.asOf,maxDaysSinceCheck:14,candidates:curated.candidates,policies:args.sourcePolicies,
     existing:curated.existing});
    for(const item of researchPlan.items){
     const candidate=curated.candidates.find(c=>c.id===item.candidateId)!;
     let digest:string|null=null,sourceUrl=item.canonicalUrl;
     const recordReasons=[...item.reasons];
     if(item.action==='retrieve_for_research'&&(retrievalAttempts<cap||readCache.has([j.exactVariantId,candidate.id].join(':')))){
      // A shared original source can satisfy several research gaps but must be read once.
      const cacheId=[j.exactVariantId,candidate.id].join(':');
      let result=readCache.get(cacheId);
      if(!result){
       const policy=args.sourcePolicies.find(x=>x.sourceId===candidate.sourceId);
       if(!policy){result={status:'blocked',sourceUrl:null,digest:null,reasons:['missing_policy']};}
       else{
        const read=await readApprovedSource({plan:researchPlan,queueItem:item,candidate,policy,
         checkedAt:p.asOf,transport:args.transport});
        result=read.status==='quarantined'?{status:'quarantined',sourceUrl:read.url,
         digest:read.evidence.contentSha256,reasons:[...read.evidence.reasons]}:
         {status:'blocked',sourceUrl:read.url,digest:null,reasons:[...read.reasons]};
       }
       readCache.set(cacheId,result);retrievalAttempts++;
       if(result.status==='quarantined')pagesQuarantined++;
      }
      digest=result.digest;sourceUrl=result.sourceUrl;recordReasons.push(...result.reasons);
      if(result.status==='quarantined')status='source_research_quarantined';
      else if(status!=='source_research_quarantined')status='source_retrieval_blocked';
     }else if(item.action==='reuse_existing'&&status!=='source_research_quarantined'){
      status='already_reviewed_source_reuse';
     }else if(status==='awaiting_independent_review')status='source_policy_blocked';
     records.push({candidateId:item.candidateId,action:item.action,reasons:recordReasons,sourceUrl,contentSha256:digest});
    }
    notes.push('Retrieved page bytes and extracted claims are not published or retained; independent method and rights review remains required.');
   }
  }
  outcomes.push({jobId:j.jobId,kind:j.kind,status,discoveryRecords:records,
   sourceReferenceIds:uniq(references).sort(),notes});
 }
 const base={phase:182 as const,schema:'182.1' as const,planHash:p.planHash,asOf:p.asOf,
  outcomes,categoryExecution,sourceRetrievalAttempts:retrievalAttempts,sourcePagesQuarantined:pagesQuarantined,sourceBodiesRetained:false as const,
  allFindingsPendingIndependentReview:true as const,canonicalKnowledgeUpdated:false as const,
  rankingAuthorized:false as const,reviewReceiptsIssued:0 as const};
 return {...base,runHash:sha(JSON.stringify(base))};
}

/** Durable *research-operation* checkpoint, not an evidence database. A JSON store
 * can persist this immutable receipt chain and re-run unresolved tasks. This
 * neither authenticates the source nor authorizes a scientific conclusion. */
export interface ResearchRunReceipt182 {
 sequence:number;planHash:string;runHash:string;previousHash:string;
 statuses:readonly {jobId:string;status:ResearchOutcome182['status']}[];
 receiptHash:string;
}
export interface ResearchJournal182 {
 phase:182;schema:'182.journal.1';categoryId:string;revision:number;
 receipts:readonly ResearchRunReceipt182[];snapshotHash:string;
 researchOnly:true;rankingAuthorized:false;scientificClaimsReviewed:false;
}
const receiptPayload=(r:Omit<ResearchRunReceipt182,'receiptHash'>)=>JSON.stringify(r);
const initialJournalHash=(categoryId:string)=>sha(JSON.stringify(['phase182.journal.1',categoryId]));
export function openResearchJournal182(categoryId:string):ResearchJournal182{
 if(!id(categoryId))throw Error('phase182_invalid_journal_category');
 return {phase:182,schema:'182.journal.1',categoryId,revision:0,receipts:[],
  snapshotHash:initialJournalHash(categoryId),researchOnly:true,rankingAuthorized:false,
  scientificClaimsReviewed:false};
}
function validateJournal182(j:ResearchJournal182):void{
 if(!j||j.phase!==182||j.schema!=='182.journal.1'||!id(j.categoryId)||
  !Number.isSafeInteger(j.revision)||j.revision<0||j.revision>10000||
  !Array.isArray(j.receipts)||j.receipts.length!==j.revision||
  j.researchOnly!==true||j.rankingAuthorized!==false||j.scientificClaimsReviewed!==false)
  throw Error('phase182_corrupted_journal');
 let prev=initialJournalHash(j.categoryId);
 for(let i=0;i<j.receipts.length;i++){
  const r=j.receipts[i];
  if(!r||r.sequence!==i+1||r.previousHash!==prev||
   !/^[a-f0-9]{64}$/.test(r.planHash)||!/^[a-f0-9]{64}$/.test(r.runHash)||
   !Array.isArray(r.statuses)||r.statuses.length>100||
   r.statuses.some((x:{jobId:string;status:ResearchOutcome182['status']})=>!x||typeof x.jobId!=='string'||!/^research_[a-f0-9]{32}$/.test(x.jobId)||
    !['clarification_needed','awaiting_independent_review','category_worker_missing',
     'worker_attempted_pending_review','no_curated_sources','source_policy_blocked',
     'source_research_quarantined','source_retrieval_blocked','already_reviewed_source_reuse'].includes(x.status))||
   sha(receiptPayload({sequence:r.sequence,planHash:r.planHash,runHash:r.runHash,
    previousHash:r.previousHash,statuses:r.statuses}))!==r.receiptHash)throw Error('phase182_corrupted_journal');
  prev=r.receiptHash;
 }
 if(prev!==j.snapshotHash)throw Error('phase182_corrupted_journal');
}
export function appendResearchRun182(args:{journal:ResearchJournal182;plan:ResearchPlan182;
 run:ResearchRun182;expectedRevision:number;expectedHash:string}):ResearchJournal182{
 const {journal:j,plan:p,run:r}=args;
 validateJournal182(j);
 if(args.expectedRevision!==j.revision||args.expectedHash!==j.snapshotHash)
  throw Error('phase182_stale_journal');
 if(j.categoryId!==p.categoryId||p.planHash!==r.planHash||r.phase!==182||r.schema!=='182.1'||
  r.canonicalKnowledgeUpdated!==false||r.rankingAuthorized!==false||r.reviewReceiptsIssued!==0||
  r.sourceBodiesRetained!==false||r.allFindingsPendingIndependentReview!==true||
  r.outcomes.length!==p.jobs.length||
  r.outcomes.some((o,i)=>o.jobId!==p.jobs[i].jobId)||
  r.runHash!==sha(JSON.stringify({phase:r.phase,schema:r.schema,planHash:r.planHash,asOf:r.asOf,
   outcomes:r.outcomes,categoryExecution:r.categoryExecution,sourceRetrievalAttempts:r.sourceRetrievalAttempts,
   sourcePagesQuarantined:r.sourcePagesQuarantined,sourceBodiesRetained:r.sourceBodiesRetained,
   allFindingsPendingIndependentReview:r.allFindingsPendingIndependentReview,
   canonicalKnowledgeUpdated:r.canonicalKnowledgeUpdated,rankingAuthorized:r.rankingAuthorized,
   reviewReceiptsIssued:r.reviewReceiptsIssued})))throw Error('phase182_untrusted_run');
 const prior=j.receipts.find(x=>x.runHash===r.runHash&&x.planHash===p.planHash);
 if(prior)return {...j,receipts:j.receipts.map(x=>({...x,statuses:x.statuses.map(s=>({...s}))}))};
 if(j.revision>=10000)throw Error('phase182_journal_full');
 const entry:Omit<ResearchRunReceipt182,'receiptHash'>={sequence:j.revision+1,
  planHash:p.planHash,runHash:r.runHash,previousHash:j.snapshotHash,
  statuses:r.outcomes.map(o=>({jobId:o.jobId,status:o.status}))};
 const nextReceipt={...entry,receiptHash:sha(receiptPayload(entry))};
 return {...j,revision:j.revision+1,receipts:[...j.receipts.map(x=>({...x,statuses:x.statuses.map(s=>({...s}))})),nextReceipt],
  snapshotHash:nextReceipt.receiptHash};
}
