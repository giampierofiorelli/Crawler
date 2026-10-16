/**
 * Phase257 — policy-bounded research planning (Phase256 architecture decision).
 *
 * planResearchFromNeeds257 turns Phase254 research needs into a standard ResearchPlan182 under an operator research
 * policy. It is pure: no network, no store access, no write. It never constructs a Phase181 decision and leaves the
 * signed-ranking path (dynamicKnowledgeAnswer181 → planResearchGaps182) unchanged. Job identity, bounds and plan
 * assembly are Phase182's own (researchJobFromGap182, assembleResearchPlan182). The plan hash is an integrity
 * fingerprint, never a permission: execution re-checks the plan against the current policy (executeUnderPolicy257).
 *
 * Product identity: Phase182 calls the product reference exactVariantId, but PEE's product records are not reviewed
 * exact variants. Every planned job therefore carries an identity annotation with exactVariantVerified:false.
 */
import {createHash} from 'node:crypto';
import {researchJobFromGap182,assembleResearchPlan182,type ResearchPlan182} from './phase182_gap_research_orchestrator.js';
import {SPEC_CRITERIA249} from './phase249_decision.js';
import type {ResearchNeeds254,ResearchNeed254} from './phase254_research_needs.js';

const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const ID=/^[a-z][a-z0-9_.:-]{0,100}$/;
const POLICY_ID=/^[a-z][a-z0-9_]{2,60}$/;
const STAMP=/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/;
const DAY=86_400_000;

/** Specification research only in Phase257 (owner decision): independent tests and identity review are not allowed. */
export const PHASE257_NEED_KINDS=['missing_declaration','declaration_conflict'] as const;
export type PolicyNeedKind257=typeof PHASE257_NEED_KINDS[number];
export interface ResearchPolicy257 {
 schema:'pee257.research-policy.v1';policyId:string;revision:number;
 /** Explicit operator choice; never inferred from a user's location or currency. */
 market:string;issuedAt:string;expiresAt:string;
 categories:string[];needKinds:PolicyNeedKind257[];maxJobsPerPlan:number;
 /** Phase257 restrictions: must be false / 0 / 0. They are not switches that enable reads or workers. */
 allowSourceReads:false;maxSourceReads:0;maxWorkerTasks:0;
}
const POLICY_KEYS=['schema','policyId','revision','market','issuedAt','expiresAt','categories','needKinds','maxJobsPerPlan','allowSourceReads','maxSourceReads','maxWorkerTasks'];

/** Strict validation against a trusted clock. Throws, naming the problem; an invalid policy denies everything. */
export function validateResearchPolicy257(p0:unknown,now:Date):ResearchPolicy257{
 const p=p0 as Record<string,unknown>;const bad=(m:string):never=>{throw Error('phase257_invalid_policy: '+m);};
 if(!p||typeof p!=='object'||Array.isArray(p))bad('not an object');
 for(const k of Object.keys(p))if(!POLICY_KEYS.includes(k))bad(`unknown field ${k}`);
 for(const k of POLICY_KEYS)if(!(k in p))bad(`missing field ${k}`);
 if(p.schema!=='pee257.research-policy.v1')bad('schema');
 if(typeof p.policyId!=='string'||!POLICY_ID.test(p.policyId))bad('policyId');
 if(!Number.isSafeInteger(p.revision)||(p.revision as number)<1||(p.revision as number)>1_000_000)bad('revision');
 if(typeof p.market!=='string'||!/^[a-z]{2,10}$/.test(p.market))bad('market must be explicit (e.g. "uk")');
 for(const k of ['issuedAt','expiresAt'])if(typeof p[k]!=='string'||!STAMP.test(p[k] as string)||!Number.isFinite(Date.parse(p[k] as string)))bad(k);
 const issued=Date.parse(p.issuedAt as string),expires=Date.parse(p.expiresAt as string);
 if(expires<=issued||expires-issued>30*DAY)bad('expiresAt must be after issuedAt and at most 30 days later');
 if(!(now instanceof Date)||!Number.isFinite(now.getTime()))bad('no trusted clock');
 if(now.getTime()<issued)bad('not yet valid');
 if(now.getTime()>=expires)bad('expired');
 const cats=p.categories;
 if(!Array.isArray(cats)||!cats.length||cats.length>50||cats.some(c=>typeof c!=='string'||!/^[a-z][a-z0-9_]{2,60}$/.test(c))||new Set(cats).size!==cats.length)bad('categories must be a non-empty list of category ids');
 const kinds=p.needKinds;
 if(!Array.isArray(kinds)||!kinds.length||kinds.some(k=>!(PHASE257_NEED_KINDS as readonly string[]).includes(k as string))||new Set(kinds).size!==kinds.length)bad('need kind not allowed in Phase257');
 if(!Number.isSafeInteger(p.maxJobsPerPlan)||(p.maxJobsPerPlan as number)<1||(p.maxJobsPerPlan as number)>20)bad('maxJobsPerPlan must be 1-20');
 if(p.allowSourceReads!==false||p.maxSourceReads!==0)bad('source reads are disabled in Phase257');
 if(p.maxWorkerTasks!==0)bad('local research workers are disabled in Phase257');
 return p as unknown as ResearchPolicy257;
}
/** A revision-bound identifier that satisfies the Phase182 validator (no "@"). */
export const policyRevision257=(p:ResearchPolicy257)=>`policy:${p.policyId}:r${p.revision}`;

/** Phase254 need kind → the gap kind it may become (specification research only). */
const GAP_OF:Record<string,PolicyNeedKind257>={missing_declaration:'missing_declaration',conflicting_declarations:'declaration_conflict'};
const NEED_KEYS=['needId','kind','destination','status','reason','categoryId','criterion','productId','identity','volatile','gap181','phase182','requests','priority'];
export interface PlannedJob257 {jobId:string;needId:string;needKind:string;productId:string;criterion:string;
 identity:{productId:string;keyBasis:string|null;identityState:string|null;exactVariantVerified:false};requests:number}
export interface HeldNeed257 {needId:string;needKind:string;productId:string|null;criterion:string|null;
 reason:'not_external_research'|'kind_not_in_policy'|'other_category'|'product_not_current'|'omitted_by_phase254_budget'|'omitted_by_policy_budget'}
export interface ResearchPlanning257 {
 schema:'pee257.research-planning.v1';plan:ResearchPlan182;jobs:PlannedJob257[];held:HeldNeed257[];
 policy:{policyId:string;revision:number;market:string};
 planningOnly:true;executionAuthorized:false;rankingAuthorized:false;evidenceAdmitted:false;sourcePermissionsGranted:false;
}
const malformed=(m:string):never=>{throw Error('phase257_malformed_need: '+m);};
/** Rejects tampered needs; returns the Phase182 job only for an in-scope specification need. */
function checkNeed(n:ResearchNeed254,categoryId:string){
 if(!n||typeof n!=='object')malformed('not an object');
 for(const k of Object.keys(n))if(!NEED_KEYS.includes(k))malformed(`unknown field ${k}`);
 if(typeof n.needId!=='string'||!/^need_[0-9a-f]{24}$/.test(n.needId))malformed('needId');
 if(n.phase182?.eligible!==false)malformed('a need cannot claim Phase182 eligibility');
 if(n.destination!=='research')return null;
 if(!['pending_authorization','omitted_by_budget'].includes(n.status))malformed('status');
 if(n.categoryId!==categoryId)return null;
 const gapKind=GAP_OF[n.kind];if(!gapKind)return null;
 if(typeof n.productId!=='string'||!ID.test(n.productId))malformed('productId');
 if(typeof n.criterion!=='string'||!SPEC_CRITERIA249[n.criterion])malformed('criterion');
 if(!n.gap181||n.gap181.kind!==gapKind||n.gap181.reference!==`${n.productId}:${n.criterion}`)malformed('gap does not match the need');
 const job=researchJobFromGap182(categoryId,n.gap181!);
 if(!n.phase182.jobPreview||n.phase182.jobPreview.jobId!==job.jobId)malformed('job preview does not match Phase182');
 if(n.identity&&n.identity.productId!==n.productId)malformed('identity belongs to another product');
 return job;
}

/** Pure planner. The caller supplies a trusted clock (now) for policy validity; asOf is only the plan's timestamp. */
export function planResearchFromNeeds257(args:{needs:ResearchNeeds254;categoryId:string;categoryLabel:string;policy:ResearchPolicy257;
 asOf:string;now:Date;knowledgeFingerprint?:string}):ResearchPlanning257{
 const policy=validateResearchPolicy257(args.policy,args.now);
 const N=args.needs;
 if(!N||N.schema!=='pee254.research-needs.v1'||N.planningOnly!==true||N.rankingAuthorized!==false||N.evidenceAdmitted!==false||
  N.sourcePermissionsGranted!==false||!Array.isArray(N.needs)||N.needs.length>500)throw Error('phase257_malformed_needs');
 if(!policy.categories.includes(args.categoryId))throw Error('phase257_category_not_in_policy');
 if(args.knowledgeFingerprint!==undefined&&!/^[0-9a-f]{64}$/.test(args.knowledgeFingerprint))throw Error('phase257_bad_knowledge_fingerprint');
 const held:HeldNeed257[]=[];const candidates=new Map<string,{job:NonNullable<ReturnType<typeof checkNeed>>;need:ResearchNeed254}>();
 const hold=(n:ResearchNeed254,reason:HeldNeed257['reason'])=>{if(!held.some(h=>h.needId===n.needId&&h.reason===reason))held.push({needId:n.needId,needKind:n.kind,productId:n.productId,criterion:n.criterion,reason});};
 for(const n of N.needs){
  const job=checkNeed(n,args.categoryId);
  if(n.destination!=='research'){hold(n,'not_external_research');continue;}
  if(n.categoryId!==args.categoryId){hold(n,'other_category');continue;}
  const kind=GAP_OF[n.kind];if(!kind||!policy.needKinds.includes(kind)||!job){hold(n,'kind_not_in_policy');continue;}
  if(n.identity&&['merged','unsupported_after_rederivation'].includes(n.identity.identityState)){hold(n,'product_not_current');continue;}
  if(n.status==='omitted_by_budget'){hold(n,'omitted_by_phase254_budget');continue;}
  if(!candidates.has(job.jobId))candidates.set(job.jobId,{job,need:n});
 }
 const all=[...candidates.values()];
 const inputFingerprint='needs:sha256:'+sha(JSON.stringify(all.map(x=>[x.need.needId,x.job.jobId]).sort()));
 const plan=assembleResearchPlan182({categoryId:args.categoryId,categoryLabel:args.categoryLabel,market:policy.market,asOf:args.asOf,inputFingerprint,
  knowledgeRevision:args.knowledgeFingerprint?`snapshot:sha256:${args.knowledgeFingerprint}`:null,policyRevision:policyRevision257(policy),
  jobs:all.map(x=>x.job),maxJobs:policy.maxJobsPerPlan});
 const planned=new Set(plan.jobs.map(j=>j.jobId));
 for(const x of all)if(!planned.has(x.job.jobId))hold(x.need,'omitted_by_policy_budget');
 const jobs:PlannedJob257[]=plan.jobs.map(j=>{const n=candidates.get(j.jobId)!.need;
  return {jobId:j.jobId,needId:n.needId,needKind:n.kind,productId:n.productId!,criterion:n.criterion!,
   identity:{productId:n.productId!,keyBasis:n.identity?.keyBasis??null,identityState:n.identity?.identityState??null,exactVariantVerified:false},requests:n.requests.length};});
 return {schema:'pee257.research-planning.v1',plan,jobs,held,policy:{policyId:policy.policyId,revision:policy.revision,market:policy.market},
  planningOnly:true,executionAuthorized:false,rankingAuthorized:false,evidenceAdmitted:false,sourcePermissionsGranted:false};
}
