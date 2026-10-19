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
import {lstatSync,realpathSync,statSync,readFileSync} from 'node:fs';import {resolve,dirname} from 'node:path';
import {researchJobFromGap182,assembleResearchPlan182,executeResearchGaps182,type ResearchPlan182,type ResearchRun182,type CuratedVariantSources182} from './phase182_gap_research_orchestrator.js';
import type {WebSourcePolicy} from './web_evidence_acquisition.js';
import {insideGitWorkTree249} from './phase246_knowledge_store.js';
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

// ---- Checkpoint B: the current protected policy, re-checked at execution ----------------------------------------
/** Loads the operator policy from a protected local file: a regular file (not a symbolic link) at its canonical path,
 * outside every Git work tree, not writable by group or others (nor its directory), owned by this user, small and
 * strictly valid against the trusted clock. Anything else denies: there is no permissive default. */
/** Phase264: the protected-file checks of the operator policy, shared by every operation-specific policy: an absolute
 * canonical regular file, outside any Git work tree, not a link, owned by this user, not group/world-writable (nor
 * its directory), at most 64 KiB, valid JSON. Returns the parsed JSON; meaning is validated by the caller. */
export function readProtectedPolicyFile257(path:string):unknown{
 const abs=resolve(path);let st;
 try{st=lstatSync(abs);}catch{throw Error('phase257_policy_missing: '+abs);}
 if(st.isSymbolicLink())throw Error('phase257_policy_path: a symbolic link is not accepted');
 if(!st.isFile())throw Error('phase257_policy_path: not a regular file');
 if(realpathSync(abs)!==abs)throw Error('phase257_policy_path: not the canonical path (a directory on the path is a link)');
 if(insideGitWorkTree249(abs))throw Error('phase257_policy_path: inside a Git work tree');
 if(st.mode&0o022)throw Error('phase257_policy_path: writable by group or others');
 if(statSync(dirname(abs)).mode&0o022)throw Error('phase257_policy_path: directory writable by group or others');
 if(typeof process.getuid==='function'&&st.uid!==process.getuid())throw Error('phase257_policy_path: not owned by this user');
 if(st.size>65_536)throw Error('phase257_policy_path: too large');
 try{return JSON.parse(readFileSync(abs,'utf8'));}catch{throw Error('phase257_invalid_policy: not JSON');}
}
export function loadResearchPolicy257(path:string|undefined=process.env.PEE_RESEARCH_POLICY,now:Date=new Date()):ResearchPolicy257{
 if(!path)throw Error('phase257_policy_missing: no policy path (PEE_RESEARCH_POLICY)');
 const raw=readProtectedPolicyFile257(path);
 return validateResearchPolicy257(raw,now);
}
export interface PolicyRun257 {run:ResearchRun182;policyRevision:string;executedAt:string;
 /** Phase257: always true. Reads, workers and transports are never passed to Phase182. */
 dryRunOnly:true;sourceReads:0;workerTasks:0;evidenceAdmitted:false;rankingAuthorized:false}
/** Execution wrapper. Loads the CURRENT policy (never a policy object travelling with the plan), checks the plan
 * against it with the trusted clock, then runs the unchanged executeResearchGaps182 with reads, workers and transport
 * disabled whatever the caller passes. The plan hash is verified by Phase182 as integrity only. */
export async function executeUnderPolicy257(args:{plan:ResearchPlan182;policyPath?:string;now?:()=>Date;
 operatorSources?:readonly CuratedVariantSources182[];sourcePolicies?:readonly WebSourcePolicy[]}):Promise<PolicyRun257>{
 const now=(args.now??(()=>new Date()))();
 const policy=loadResearchPolicy257(args.policyPath??process.env.PEE_RESEARCH_POLICY,now);
 const p=args.plan;
 if(!p||p.phase!==182||p.planningOnly!==true||p.rankingAuthorized!==false||p.hardExclusionsAuthorized!==false)throw Error('phase257_plan_flags');
 if(!policy.categories.includes(p.categoryId))throw Error('phase257_category_not_in_policy');
 if(p.market!==policy.market)throw Error('phase257_market_mismatch');
 if(p.policyRevision!==policyRevision257(policy))throw Error('phase257_policy_revision_mismatch');
 if(!Array.isArray(p.jobs)||p.jobs.length>policy.maxJobsPerPlan)throw Error('phase257_too_many_jobs');
 for(const j of p.jobs){
  if(!(policy.needKinds as readonly string[]).includes(j.gapKind))throw Error('phase257_kind_not_in_policy');
  let expected;try{expected=researchJobFromGap182(p.categoryId,{kind:j.gapKind,reference:j.reference,action:'check'});}catch{throw Error('phase257_job_not_phase182');}
  if(JSON.stringify(expected)!==JSON.stringify(j))throw Error('phase257_job_not_phase182');
 }
 const run=await executeResearchGaps182({plan:p,categoryCatalog:[],workers:[],existingWorkerBudget:0,
  operatorSources:args.operatorSources??[],sourcePolicies:args.sourcePolicies??[],maxSourceReads:0,allowSourceReads:false});
 if(run.sourceRetrievalAttempts!==0)throw Error('phase257_invariant_broken: a source was read');
 return {run,policyRevision:policyRevision257(policy),executedAt:now.toISOString(),dryRunOnly:true,sourceReads:0,workerTasks:0,evidenceAdmitted:false,rankingAuthorized:false};
}

// ---------------------------------------------------------------------------------------------------------------------
// S85 (owner: before any further live acquisition, the owner policy must really be enforced; the comprehensive gate is
// intervention D). The interim enforcement for the live wave (scripts/phase246-live-wave.mjs): the wave reads its
// policy through readProtectedPolicyFile257, validates it here, and asks waveRequestGate257 before EVERY request. A wave
// without a valid, unexpired, unchanged policy makes no request; its own budget can never exceed the policy's; spending
// recorded under the same policy id by earlier waves counts against the policy total.
export interface WavePolicyBudget257 {maxRequests:number;maxPerHost:number;maxHosts?:number;politenessMs:number;maxSeconds:number;maxBytes:number}
export interface WavePolicy257 {policyId:string;revision:number;expiresAt:string;budget:WavePolicyBudget257;
 /** requests the owner records as already spent under this policy (optional; the larger of this and the receipts counts) */
 spent?:number}
const POSITIVE=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
/** End of the expiry day when the policy gives a date only (owner policies say "expires 2026-10-24"). */
export function wavePolicyExpiry257(p:{expiresAt:string}):number{
 return /^\d{4}-\d{2}-\d{2}$/.test(p.expiresAt)?Date.parse(p.expiresAt+'T23:59:59.999Z'):Date.parse(p.expiresAt);
}
export function validateWavePolicy257(raw:unknown,now:Date=new Date()):WavePolicy257{
 const p=raw as Record<string,unknown>;
 if(!p||typeof p!=='object')throw Error('wave_policy_invalid: not an object');
 if(typeof p.policyId!=='string'||!/^[a-z0-9][a-z0-9_.:-]{2,80}$/i.test(p.policyId))throw Error('wave_policy_invalid: policyId');
 if(typeof p.expiresAt!=='string'||!Number.isFinite(wavePolicyExpiry257(p as {expiresAt:string})))throw Error('wave_policy_invalid: expiresAt');
 if(wavePolicyExpiry257(p as {expiresAt:string})<now.getTime())throw Error('wave_policy_expired: '+p.expiresAt);
 const b=p.budget as Record<string,unknown>|undefined;
 for(const k of ['maxRequests','maxPerHost','politenessMs','maxSeconds','maxBytes'])if(!b||!POSITIVE(b[k]))throw Error('wave_policy_invalid: budget.'+k);
 if(b!.maxHosts!==undefined&&!POSITIVE(b!.maxHosts))throw Error('wave_policy_invalid: budget.maxHosts');
 if(p.spent!==undefined&&!POSITIVE(p.spent))throw Error('wave_policy_invalid: spent');
 return {policyId:p.policyId,revision:Number(p.revision??0),expiresAt:p.expiresAt,budget:b as unknown as WavePolicyBudget257,...(p.spent!==undefined?{spent:Number(p.spent)}:{})};
}
/** The wave's own budget must stay inside the policy: every limit at most the policy's, the delay at least the policy's. */
export function waveBudgetWithinPolicy257(budget:Record<string,unknown>,p:WavePolicy257):string[]{
 const bad:string[]=[];
 for(const k of ['maxRequests','maxPerHost','maxSeconds','maxBytes'] as const)if(!POSITIVE(budget[k])||Number(budget[k])>p.budget[k])bad.push(k);
 // an absent maxHosts is filled from the policy at init; a stated one may not exceed it
 if(p.budget.maxHosts!==undefined&&budget.maxHosts!==undefined&&(!POSITIVE(budget.maxHosts)||Number(budget.maxHosts)>p.budget.maxHosts))bad.push('maxHosts');
 if(budget.politenessMs!==undefined&&!POSITIVE(budget.politenessMs))bad.push('politenessMs');
 return bad;
}
/** Asked before every request. null: the policy permits it; otherwise the reason it does not (the wave stops on it). */
export function waveRequestGate257(a:{policy:WavePolicy257|null;policyDigestAtInit:string|null;policyDigestNow:string|null;
 priorSpent:number;requests:readonly {host:string}[];host:string;now:Date}):string|null{
 if(!a.policy||!a.policyDigestAtInit)return 'no_owner_policy';
 if(!a.policyDigestNow)return 'owner_policy_missing';
 if(a.policyDigestNow!==a.policyDigestAtInit)return 'owner_policy_changed';
 if(wavePolicyExpiry257(a.policy)<a.now.getTime())return 'owner_policy_expired';
 const spent=Math.max(a.priorSpent,a.policy.spent??0);
 if(spent+a.requests.length>=a.policy.budget.maxRequests)return 'owner_policy_request_budget_exhausted';
 if(a.requests.filter(r=>r.host===a.host).length>=a.policy.budget.maxPerHost)return 'owner_policy_per_host_budget_exhausted';
 if(a.policy.budget.maxHosts!==undefined&&!a.requests.some(r=>r.host===a.host)&&new Set(a.requests.map(r=>r.host.replace(/^www\./,''))).size>=a.policy.budget.maxHosts)
  return 'owner_policy_host_budget_exhausted';
 return null;
}
