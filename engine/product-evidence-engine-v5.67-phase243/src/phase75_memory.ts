/** Phase 75: durable, bounded, research-only metadata journal.
 * Atomic JSON snapshot: suitable for a single-host pilot, not a substitute for
 * a transactional multi-host database. Never persists webpage bodies or prompts.
 */
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import type {ResearchCycleResult} from './category_research_execution.js';
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,119}$/.test(s);
export interface ResearchJournalRow {
 runId:string;categoryId:string;asOf:string;
 taskIds:string[];
 /** Structured task statuses only; never raw page content, interpretations or free prose. */
 statuses:Record<string,string>;
 sourceReferenceIds:string[];
 fingerprints:string[];
 reviewState:'pending_independent_review';
 rankingEligible:false;
}
export interface ResearchJournalState {version:1;revision:number;rows:ResearchJournalRow[];pendingTaskIds:string[];}
const empty=():ResearchJournalState=>({version:1,revision:0,rows:[],pendingTaskIds:[]});
const safeStamp=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(s)&&Number.isFinite(Date.parse(s));
const safeRow=(r:ResearchJournalRow)=>id(r.runId)&&id(r.categoryId)&&safeStamp(r.asOf)&&
 Array.isArray(r.taskIds)&&r.taskIds.length<=20&&r.taskIds.every(id)&&
 Array.isArray(r.sourceReferenceIds)&&r.sourceReferenceIds.length<=200&&r.sourceReferenceIds.every(id)&&
 Array.isArray(r.fingerprints)&&r.fingerprints.length<=40&&r.fingerprints.every(x=>/^[a-f0-9]{64}$/.test(x))&&
 r.reviewState==='pending_independent_review'&&r.rankingEligible===false&&
 Object.keys(r.statuses??{}).length<=20&&Object.entries(r.statuses).every(([k,v])=>id(k)&&
 ['executed_pending_independent_review','no_verified_references','missing_local_worker','worker_rejected','waiting_for_independent_review'].includes(v));
const safeState=(s:ResearchJournalState)=>s?.version===1&&Number.isSafeInteger(s.revision)&&s.revision>=0&&
 Array.isArray(s.rows)&&s.rows.length<=10000&&s.rows.every(safeRow)&&
 Array.isArray(s.pendingTaskIds)&&s.pendingTaskIds.length<=20000&&s.pendingTaskIds.every(id)&&
 new Set(s.pendingTaskIds).size===s.pendingTaskIds.length&&
 new Set(s.rows.map(r=>r.runId)).size===s.rows.length;
function envelope(state:ResearchJournalState){const payload=JSON.stringify(state);return JSON.stringify({sha256:hash(payload),payload});}
function parseEnvelope(raw:string):ResearchJournalState {
 if(raw.length>8_000_000)throw Error('Research journal exceeds cap');
 const x=JSON.parse(raw) as {sha256:string;payload:string};
 if(typeof x?.payload!=='string'||x.sha256!==hash(x.payload))throw Error('Journal integrity mismatch');
 const state=JSON.parse(x.payload) as ResearchJournalState;
 if(!safeState(state))throw Error('Invalid journal schema');
 return state;
}
export class Phase75ResearchJournal {
 constructor(readonly filePath:string){if(!path.isAbsolute(filePath))throw Error('Journal path must be absolute');}
 async load():Promise<ResearchJournalState>{
  try{return parseEnvelope(await fs.readFile(this.filePath,'utf8'));}
  catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return empty();throw e;}
 }
 /** Caller supplies results of an approved worker execution; journal grants no approvals. */
 async record(runId:string,categoryId:string,asOf:string,result:ResearchCycleResult):Promise<ResearchJournalState>{
  if(!id(runId)||!id(categoryId)||!safeStamp(asOf)||!result||
   result.purpose!=='category_research_executed_not_verified'||result.publicationReady!==false||
   result.rankingEligible!==false||result.completionReceiptsIssued!==0||
   (result.plan.route.status==='known'?result.plan.route.identity.categoryId:
    result.plan.route.status==='unknown'?result.plan.route.provisionalId:'')!==categoryId)
   throw Error('Journal accepts only unreviewed research cycles');
  const statuses=Object.fromEntries(result.outcomes.map(r=>[r.taskId,r.status]));
  const row:ResearchJournalRow={runId,categoryId,asOf,
   taskIds:result.outcomes.map(r=>r.taskId),statuses,
   sourceReferenceIds:[...new Set(result.outcomes.flatMap(r=>r.referenceIds))].sort(),
   fingerprints:[...new Set(result.outcomes.flatMap(r=>r.workProductSha256?[r.workProductSha256]:[]))].sort(),
   reviewState:'pending_independent_review',rankingEligible:false};
  if(!safeRow(row))throw Error('Unsafe research metadata');
  await fs.mkdir(path.dirname(this.filePath),{recursive:true});
  const lock=this.filePath+'.lock';
  await fs.mkdir(lock); // exclusive; concurrent writers fail safely, never overwrite
  let tmp:string|null=null;
  try {
   const state=await this.load();
   const prior=state.rows.find(r=>r.runId===runId);
   if(prior){if(JSON.stringify(prior)!==JSON.stringify(row))throw Error('Run ID conflict');return state;}
   const updated:ResearchJournalState={version:1,revision:state.revision+1,
    rows:[...state.rows,row],pendingTaskIds:[...new Set([...state.pendingTaskIds,
      ...result.outcomes.filter(o=>o.status==='executed_pending_independent_review').map(o=>o.taskId)])].sort()};
   if(!safeState(updated))throw Error('Journal capacity exhausted');
   tmp=this.filePath+'.tmp.'+randomUUID();
   const handle=await fs.open(tmp,'wx',0o600);
   try{await handle.writeFile(envelope(updated),'utf8');await handle.sync();}finally{await handle.close();}
   await fs.rename(tmp,this.filePath);tmp=null;
   const dir=await fs.open(path.dirname(this.filePath),'r');
   try{await dir.sync();}finally{await dir.close();}
   return updated;
  }finally{
   if(tmp)await fs.rm(tmp,{force:true});
   await fs.rmdir(lock);
  }
 }
}
