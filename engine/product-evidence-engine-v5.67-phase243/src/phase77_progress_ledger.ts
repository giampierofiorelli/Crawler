/** Phase 77: durable demand research progress. Single-host pilot only.
 * Only structured scopes/stage receipts: no raw user utterances, review text or contacts.
 * Reviewer authorization is provided by trusted backend, never accepted via public API.
 */
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {createHash,randomBytes,randomUUID,timingSafeEqual} from 'node:crypto';
import {STEPS,type ResearchStep,type DemandMode} from './phase77_decision_research.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,119}$/.test(s);
const stamp=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(s)&&Number.isFinite(Date.parse(s));
export type StageState='not_started'|'working'|'verified'|'blocked';
export interface StageRow {step:ResearchStep;state:StageState;receiptId:string|null;verifiedAt:string|null;}
export interface DemandProgressRow {
 id:string;scopeHash:string;mode:DemandMode;accessHashes:string[];createdAt:string;updatedAt:string;
 stages:StageRow[];nextScheduledCheckAt:string|null;approvedResultId:string|null;
 approvedReviewId:string|null;progressBlockedReason:string|null;
}
interface Snapshot {version:1;revision:number;rows:DemandProgressRow[];}
const empty=():Snapshot=>({version:1,revision:0,rows:[]});
const valid=(r:DemandProgressRow)=>id(r.id)&&/^[a-f0-9]{64}$/.test(r.scopeHash)&&
 ['functional_discovery','specific_product','category_comparison'].includes(r.mode)&&
 Array.isArray(r.accessHashes)&&r.accessHashes.length>0&&r.accessHashes.length<=100&&
 r.accessHashes.every(h=>/^[a-f0-9]{64}$/.test(h))&&stamp(r.createdAt)&&stamp(r.updatedAt)&&
 Array.isArray(r.stages)&&r.stages.length===STEPS.length&&r.stages.every((s,i)=>s.step===STEPS[i]&&
 ['not_started','working','verified','blocked'].includes(s.state)&&
 (s.state==='verified'?(id(s.receiptId)&&stamp(s.verifiedAt)):s.receiptId===null&&s.verifiedAt===null))&&
 (r.nextScheduledCheckAt===null||stamp(r.nextScheduledCheckAt))&&
 (r.approvedResultId===null||id(r.approvedResultId))&&
 (r.approvedReviewId===null||id(r.approvedReviewId))&&
 (r.approvedResultId===null)===(r.approvedReviewId===null)&&
 (r.approvedResultId===null||r.stages.every(s=>s.state==='verified'))&&
 (r.progressBlockedReason===null||id(r.progressBlockedReason));
function readSnapshot(raw:string):Snapshot {
 if(raw.length>8_000_000)throw Error('Progress ledger exceeds size cap');
 const x=JSON.parse(raw) as {payload:string;sha256:string};
 if(typeof x.payload!=='string'||sha(x.payload)!==x.sha256)throw Error('Progress ledger integrity mismatch');
 const s=JSON.parse(x.payload) as Snapshot;
 if(s.version!==1||!Number.isSafeInteger(s.revision)||s.revision<0||
 !Array.isArray(s.rows)||s.rows.length>10000||!s.rows.every(valid)||
 new Set(s.rows.map(x=>x.scopeHash)).size!==s.rows.length||
 new Set(s.rows.map(x=>x.id)).size!==s.rows.length)throw Error('Invalid progress ledger');
 return s;
}
function writeSnapshot(s:Snapshot){const payload=JSON.stringify(s);return JSON.stringify({payload,sha256:sha(payload)});}
const now=()=>new Date().toISOString();
export interface ProgressView {
 requestId:string;status:'queued'|'working'|'blocked'|'awaiting_independent_review'|'ready';
 steps:{step:ResearchStep;state:StageState}[];
 completedVerifiedSteps:number;totalSteps:number;
 currentStep:ResearchStep|null;nextScheduledCheckAt:string|null;
 /** Time is not guessed. Only a committed backend schedule is exposed. */
 estimatedCompletionAt:null;automaticNotificationAvailable:false;
 reviewedResultId:string|null;canReturnLater:true;
}
function view(r:DemandProgressRow):ProgressView {
 const all=r.stages.every(s=>s.state==='verified');
 const active=r.stages.find(s=>s.state==='working');
 const first=r.stages.find(s=>s.state!=='verified');
 return {requestId:r.id,status:r.approvedResultId?'ready':
 r.progressBlockedReason||r.stages.some(s=>s.state==='blocked')?'blocked':
 all?'awaiting_independent_review':active?'working':'queued',
 steps:r.stages.map(s=>({step:s.step,state:s.state})),
 completedVerifiedSteps:r.stages.filter(s=>s.state==='verified').length,
 totalSteps:r.stages.length,currentStep:r.approvedResultId?null:(active??first)?.step??null,
 nextScheduledCheckAt:r.nextScheduledCheckAt,estimatedCompletionAt:null,
 automaticNotificationAvailable:false,reviewedResultId:r.approvedResultId,canReturnLater:true};
}
export class Phase77ProgressLedger {
 constructor(readonly filePath:string){if(!path.isAbsolute(filePath))throw Error('Progress ledger needs absolute path');}
 async load():Promise<Snapshot>{try{return readSnapshot(await fs.readFile(this.filePath,'utf8'));}
 catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return empty();throw e;}}
 private async transaction<T>(cb:(s:Snapshot)=>T):Promise<T>{
  await fs.mkdir(path.dirname(this.filePath),{recursive:true});
  const lock=this.filePath+'.lock';let acquired=false;
  for(let n=0;n<40;n++)try{await fs.mkdir(lock);acquired=true;break;}
   catch(e){if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;
    await new Promise(resolve=>setTimeout(resolve,20));}
  if(!acquired)throw Error('Progress ledger busy');
  let tmp:string|null=null;
  try{
   const s=await this.load(),out=cb(s);s.revision++;
   if(s.rows.length>10000||!s.rows.every(valid))throw Error('Invalid progress update');
   tmp=this.filePath+'.tmp.'+randomUUID();const h=await fs.open(tmp,'wx',0o600);
   try{await h.writeFile(writeSnapshot(s));await h.sync();}finally{await h.close();}
   await fs.rename(tmp,this.filePath);tmp=null;
   const dir=await fs.open(path.dirname(this.filePath),'r');
   try{await dir.sync();}finally{await dir.close();}return out;
  }finally{if(tmp)await fs.rm(tmp,{force:true});await fs.rmdir(lock);}
 }
 async submit(scopeHash:string,mode:DemandMode,asOf=now()):Promise<{
  view:ProgressView;accessToken:string;deduplicated:boolean}>{
  if(!/^[a-f0-9]{64}$/.test(scopeHash)||!stamp(asOf)||
   !['functional_discovery','specific_product','category_comparison'].includes(mode))
   throw Error('Invalid research scope');
  return this.transaction(s=>{
   const old=s.rows.find(r=>r.scopeHash===scopeHash);
   const token=randomBytes(32).toString('hex');
   if(old){if(old.mode!==mode||old.accessHashes.length>=100)throw Error('Invalid duplicate demand');
    old.accessHashes.push(sha(token));return {view:view(old),accessToken:token,deduplicated:true};}
   const row:DemandProgressRow={id:'req_'+randomUUID().replaceAll('-',''),scopeHash,mode,
    accessHashes:[sha(token)],createdAt:asOf,updatedAt:asOf,
    stages:STEPS.map(step=>({step,state:'not_started',receiptId:null,verifiedAt:null})),
    nextScheduledCheckAt:null,approvedResultId:null,approvedReviewId:null,progressBlockedReason:null};
   s.rows.push(row);return {view:view(row),accessToken:token,deduplicated:false};
  });
 }
 /** Only a verified token may expose the internal scope binding to the trusted adapter. */
 async authorizedContext(requestId:string,token:string):Promise<{view:ProgressView;scopeHash:string}|null>{
  if(!id(requestId)||typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))return null;
  const row=(await this.load()).rows.find(r=>r.id===requestId);
  if(!row)return null;
  const submitted=Buffer.from(sha(token),'hex');
  return row.accessHashes.some(h=>timingSafeEqual(Buffer.from(h,'hex'),submitted))?
   {view:view(row),scopeHash:row.scopeHash}:null;
 }
 async publicStatus(requestId:string,token:string):Promise<ProgressView|null>{
  return (await this.authorizedContext(requestId,token))?.view??null;
 }
 private async trust<T extends object>(ref:T,approve:(r:T)=>Promise<boolean>){
  if(!await approve(ref))throw Error('Authoritative backend verification required');
 }
 /** A worker task actually began. Backend-authorized, never exposed publicly. */
 async startStep(requestId:string,step:ResearchStep,asOf:string,
  approve:(ref:{requestId:string;step:ResearchStep;asOf:string})=>Promise<boolean>):Promise<ProgressView>{
  if(!id(requestId)||!STEPS.includes(step)||!stamp(asOf))throw Error('Invalid step');
  await this.trust({requestId,step,asOf},approve);
  return this.transaction(s=>{
   const r=s.rows.find(x=>x.id===requestId);if(!r||r.approvedResultId)throw Error('Missing/closed request');
   const i=STEPS.indexOf(step),row=r.stages[i];
   if(row.state!=='not_started'||r.stages.slice(0,i).some(s=>s.state!=='verified'))
    throw Error('Stage prerequisites not verified');
   row.state='working';r.updatedAt=asOf;return view(r);
  });
 }
 /** A genuine blocker is visible instead of letting a spinner run forever. */
 async blockStep(input:{requestId:string;step:ResearchStep;reasonCode:string;at:string},
  approve:(ref:typeof input)=>Promise<boolean>):Promise<ProgressView>{
  if(!id(input.requestId)||!STEPS.includes(input.step)||!id(input.reasonCode)||!stamp(input.at))
   throw Error('Invalid block receipt');
  await this.trust(input,approve);
  return this.transaction(s=>{
   const r=s.rows.find(x=>x.id===input.requestId);
   if(!r||r.approvedResultId)throw Error('Missing/closed request');
   const stage=r.stages.find(x=>x.step===input.step);
   if(!stage||stage.state!=='working')throw Error('Stage not active');
   stage.state='blocked';r.progressBlockedReason=input.reasonCode;r.updatedAt=input.at;
   return view(r);
  });
 }
 /** Re-entry only after external evidence/capacity changes, backend-authorized. */
 async resumeStep(input:{requestId:string;step:ResearchStep;reasonCode:string;at:string},
  approve:(ref:typeof input)=>Promise<boolean>):Promise<ProgressView>{
  if(!id(input.requestId)||!STEPS.includes(input.step)||!id(input.reasonCode)||!stamp(input.at))
   throw Error('Invalid resume receipt');
  await this.trust(input,approve);
  return this.transaction(s=>{
   const r=s.rows.find(x=>x.id===input.requestId);
   if(!r||r.approvedResultId||r.progressBlockedReason!==input.reasonCode)
    throw Error('Block not eligible for resumption');
   const stage=r.stages.find(x=>x.step===input.step);
   if(!stage||stage.state!=='blocked')throw Error('Stage not blocked');
   stage.state='working';r.progressBlockedReason=null;r.updatedAt=input.at;
   return view(r);
  });
 }
 /** A recorded research milestone is NOT a claim of product quality.
  * The trusted backend must check the receipt against actual source/worker records. */
 async verifyStep(input:{requestId:string;step:ResearchStep;receiptId:string;verifiedAt:string},
  approve:(ref:typeof input)=>Promise<boolean>):Promise<ProgressView>{
  if(!id(input.requestId)||!STEPS.includes(input.step)||!id(input.receiptId)||!stamp(input.verifiedAt))
   throw Error('Invalid milestone receipt');
  await this.trust(input,approve);
  return this.transaction(s=>{
   const r=s.rows.find(x=>x.id===input.requestId);if(!r||r.approvedResultId)throw Error('Missing/closed request');
   const i=STEPS.indexOf(input.step),row=r.stages[i];
   if(row.state!=='working'||r.stages.slice(0,i).some(s=>s.state!=='verified'))
    throw Error('Stage not actually active');
   row.state='verified';row.receiptId=input.receiptId;row.verifiedAt=input.verifiedAt;
   r.updatedAt=input.verifiedAt;return view(r);
  });
 }
 async scheduleCheck(requestId:string,scheduledFor:string,at:string,
  approve:(ref:{requestId:string;scheduledFor:string;at:string})=>Promise<boolean>):Promise<ProgressView>{
  if(!id(requestId)||!stamp(scheduledFor)||!stamp(at)||Date.parse(scheduledFor)<=Date.parse(at))
   throw Error('A real future scheduler reservation is required');
  await this.trust({requestId,scheduledFor,at},approve);
  return this.transaction(s=>{
   const r=s.rows.find(x=>x.id===requestId);if(!r||r.approvedResultId)throw Error('Missing/closed request');
   r.nextScheduledCheckAt=scheduledFor;r.updatedAt=at;return view(r);
  });
 }
 async publishVerified(input:{requestId:string;resultId:string;reviewId:string;verifiedAt:string},
  approve:(ref:typeof input)=>Promise<boolean>):Promise<ProgressView>{
  if(!id(input.requestId)||!id(input.resultId)||!id(input.reviewId)||!stamp(input.verifiedAt))
   throw Error('Invalid approval');
  await this.trust(input,approve);
  return this.transaction(s=>{
   const r=s.rows.find(x=>x.id===input.requestId);
   if(!r||r.approvedResultId||r.stages.some(x=>x.state!=='verified'))
    throw Error('Research milestones incomplete');
   r.approvedResultId=input.resultId;r.approvedReviewId=input.reviewId;
   r.updatedAt=input.verifiedAt;r.nextScheduledCheckAt=null;return view(r);
  });
 }
}
