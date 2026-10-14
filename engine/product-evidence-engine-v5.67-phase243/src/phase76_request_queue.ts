/** Phase 76: consumer request lifecycle, intentionally separate from unverified research.
 * Single-host atomic file ledger; no raw user queries, source text or personal data.
 * NOT a distributed queue; production needs a transactional DB + authenticated edge.
 */
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {createHash, randomBytes, randomUUID, timingSafeEqual} from 'node:crypto';
import {routeCategory, type CategoryIdentity, type CategoryRoute} from './category_cognitive_mesh.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const now=()=>new Date().toISOString();
const code=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,119}$/.test(s);
const iso=(s:string)=>typeof s==='string'&&Number.isFinite(Date.parse(s))&&/^\d{4}-\d\d-\d\dT/.test(s);
export type RequestStatus='queued'|'researching'|'awaiting_research_capacity'|'awaiting_independent_review'|
 'insufficient_evidence'|'temporarily_unavailable'|'unable_to_complete'|'ready';
export interface RequestRow {
 id:string; categoryId:string; categoryLabel:string; productLabel:string|null; useCaseKey:string; scopeHash:string;
 status:RequestStatus; accessHashes:string[]; createdAt:string; updatedAt:string;
 attempts:number; leaseHash:string|null; leaseUntil:string|null;
 /** ONLY externally authenticated, independently verified results can be displayed. */
 approvedResultId:string|null; reviewReferenceId:string|null;
 taskIds:string[]; researchReferenceIds:string[]; nextAllowedAt:string|null;
}
interface Snapshot {version:1;revision:number;requests:RequestRow[];}
const blank=():Snapshot=>({version:1,revision:0,requests:[]});
const valid=(r:RequestRow)=>code(r.id)&&code(r.categoryId)&&code(r.useCaseKey)&&
 typeof r.categoryLabel==='string'&&r.categoryLabel.length<=90&&r.categoryLabel.trim()===r.categoryLabel&&
 (r.productLabel===null||typeof r.productLabel==='string'&&r.productLabel.length<=100&&r.productLabel.trim()===r.productLabel)&&
 /^[0-9a-f]{64}$/.test(r.scopeHash)&&Array.isArray(r.accessHashes)&&r.accessHashes.length>0&&r.accessHashes.length<=100&&r.accessHashes.every(x=>/^[0-9a-f]{64}$/.test(x))&&
 iso(r.createdAt)&&iso(r.updatedAt)&&Number.isInteger(r.attempts)&&r.attempts>=0&&r.attempts<=100&&
 ['queued','researching','awaiting_research_capacity','awaiting_independent_review','insufficient_evidence','temporarily_unavailable','unable_to_complete','ready'].includes(r.status)&&
 (r.leaseHash===null||/^[0-9a-f]{64}$/.test(r.leaseHash))&&
 (r.leaseUntil===null||iso(r.leaseUntil))&&(r.nextAllowedAt===null||iso(r.nextAllowedAt))&&
 (r.approvedResultId===null||code(r.approvedResultId))&&(r.reviewReferenceId===null||code(r.reviewReferenceId))&&
 (r.status==='ready'?(!!r.approvedResultId&&!!r.reviewReferenceId):r.approvedResultId===null)&&
 Array.isArray(r.taskIds)&&r.taskIds.length<=20&&r.taskIds.every(code)&&
 Array.isArray(r.researchReferenceIds)&&r.researchReferenceIds.length<=100&&r.researchReferenceIds.every(code)&&
 (r.status==='researching'?(r.leaseHash!==null&&r.leaseUntil!==null):r.leaseHash===null&&r.leaseUntil===null);
function parse(raw:string):Snapshot{
 if(raw.length>8_000_000)throw Error('Request ledger exceeds size cap');
 const x=JSON.parse(raw) as {payload:string;sha256:string};
 if(typeof x.payload!=='string'||sha(x.payload)!==x.sha256)throw Error('Request ledger integrity mismatch');
 const obj=JSON.parse(x.payload) as Snapshot;
 if(obj.version!==1||!Number.isSafeInteger(obj.revision)||obj.revision<0||
 !Array.isArray(obj.requests)||obj.requests.length>10000||!obj.requests.every(valid)||
 new Set(obj.requests.map(r=>r.id)).size!==obj.requests.length||
 new Set(obj.requests.map(r=>r.scopeHash)).size!==obj.requests.length)throw Error('Invalid request ledger');
 return obj;
}
function pack(s:Snapshot){const payload=JSON.stringify(s);return JSON.stringify({sha256:sha(payload),payload});}
const safeMessage:Record<RequestStatus,string>={
 queued:'Abbiamo ricevuto la tua richiesta e l’abbiamo inserita nella coda di ricerca.',
 researching:'Stiamo esaminando le informazioni disponibili per questa categoria.',
 awaiting_research_capacity:'La tua richiesta è registrata, ma la ricerca non è ancora iniziata.',
 awaiting_independent_review:'La prima analisi è terminata. Stiamo verificando le evidenze prima di proporti una risposta.',
 insufficient_evidence:'Abbiamo esaminato le fonti disponibili, ma non abbiamo ancora prove sufficienti per consigliarti un prodotto.',
 temporarily_unavailable:'La ricerca ha incontrato un problema temporaneo. Puoi controllare lo stato più tardi.',
 unable_to_complete:'Non siamo riusciti a completare la ricerca. Non abbiamo informazioni sufficienti per una raccomandazione attendibile.',
 ready:'La valutazione verificata è disponibile.'
};
export interface PublicRequestView {
 requestId:string;status:RequestStatus;message:string;updatedAt:string;
 canClosePage:true;nextCheckSeconds:number|null;reviewedResultId:string|null;
 /** Information is not fabricated while a category is unknown or under review. */
 unverifiedRecommendationsExcluded:true;
}
const view=(r:RequestRow):PublicRequestView=>({requestId:r.id,status:r.status,message:safeMessage[r.status],
 updatedAt:r.updatedAt,canClosePage:true,
 nextCheckSeconds:['ready','insufficient_evidence','unable_to_complete'].includes(r.status)?null:
 r.status==='awaiting_research_capacity'?120:r.status==='awaiting_independent_review'?60:30,
 reviewedResultId:r.status==='ready'?r.approvedResultId:null,unverifiedRecommendationsExcluded:true});
export interface SubmitResponse {view:PublicRequestView;accessToken:string;deduplicated:boolean;}
export interface IntakeResult {kind:'clarify';reason:'category_missing_or_unsafe'|'alias_collision';categoryIds:string[];message:string;}
export interface Claim {requestId:string;leaseToken:string;categoryId:string;categoryLabel:string;productLabel:string|null;useCaseKey:string;}
export interface VerifiedResultAttestation {
 requestId:string;resultId:string;reviewReferenceId:string;verifiedAt:string;
 independentSourceCount:number;
 /** Audited original TEST identities, not merely two republished articles. */
 verifiedOriginalTestIds:string[];
 /** Must match observations actually registered by the research worker. */
 verifiedEvidenceReferenceIds:string[];
}
export class Phase76RequestQueue {
 constructor(readonly filePath:string){if(!path.isAbsolute(filePath))throw Error('Ledger path must be absolute');}
 async load():Promise<Snapshot>{try{return parse(await fs.readFile(this.filePath,'utf8'));}
 catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return blank();throw e;}}
 private async transaction<T>(f:(s:Snapshot)=>T):Promise<T>{
  await fs.mkdir(path.dirname(this.filePath),{recursive:true});
  const lock=this.filePath+'.lock';
  // Bounded attempt, no stale lock auto deletion (do not steal an active writer's lock).
  let acquired=false;
  for(let i=0;i<30;i++){
   try{await fs.mkdir(lock);acquired=true;break;}
   catch(e){if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;
    await new Promise(resolve=>setTimeout(resolve,20));}
  }
  if(!acquired)throw Error('Request queue busy');
  let tmp:string|null=null;
  try{
   const s=await this.load();const output=f(s);s.revision++;
   if(s.requests.length>10000||!s.requests.every(valid))throw Error('Invalid request update');
   const payload=pack(s);tmp=this.filePath+'.tmp.'+randomUUID();
   const h=await fs.open(tmp,'wx',0o600);try{await h.writeFile(payload);await h.sync();}finally{await h.close();}
   await fs.rename(tmp,this.filePath);tmp=null;
   const dir=await fs.open(path.dirname(this.filePath),'r');try{await dir.sync();}finally{await dir.close();}
   return output;
  }finally{if(tmp)await fs.rm(tmp,{force:true});await fs.rmdir(lock);}
 }
 /** Site/backend must provide a structured category; natural-language routing is a separate adapter. */
 async submit(input:{categoryLabel:string;productLabel?:string;useCaseKey:string;catalog:readonly CategoryIdentity[];asOf?:string}):Promise<SubmitResponse|IntakeResult>{
  if(!code(input.useCaseKey)||input.useCaseKey.length>60)throw Error('Use-case must be a controlled identifier');
  const route=routeCategory(input.categoryLabel,input.catalog);
  if(route.status==='needs_clarification'||route.status==='ambiguous')return {kind:'clarify',
   reason:route.status==='ambiguous'?'alias_collision':'category_missing_or_unsafe',
   categoryIds:route.status==='ambiguous'?route.candidateCategoryIds:[],
   message:'Per trovare informazioni affidabili, puoi precisare quale tipologia di prodotto intendi?'};
  const productLabel=input.productLabel?.trim()||null;
  if(input.productLabel!==undefined&&(!productLabel||productLabel.length>100||/[<>\r\n]/.test(productLabel)))
   throw Error('Invalid product label');
  const categoryId=route.status==='known'?route.identity.categoryId:route.provisionalId;
  const categoryLabel=route.status==='known'?route.identity.label:route.label;
  const scopeHash=sha(JSON.stringify([categoryId,categoryLabel,productLabel?.toLowerCase()??null,input.useCaseKey]));
  const asOf=input.asOf??now();if(!iso(asOf))throw Error('Invalid time');
  return this.transaction(s=>{
   const existing=s.requests.find(r=>r.scopeHash===scopeHash);
   if(existing){
    // A follow-up receives its own access credential; no requester text is persisted.
    if(existing.accessHashes.length>=100)throw Error('Subscriber capacity exceeded');
    const token=randomBytes(32).toString('hex');
    existing.accessHashes.push(sha(token));
    return {view:view(existing),accessToken:token,deduplicated:true};
   }
   const token=randomBytes(32).toString('hex');
   const r:RequestRow={id:'req_'+randomUUID().replace(/-/g,''),categoryId,categoryLabel,productLabel,useCaseKey:input.useCaseKey,scopeHash,
    accessHashes:[sha(token)],status:'queued',createdAt:asOf,updatedAt:asOf,attempts:0,
    leaseHash:null,leaseUntil:null,approvedResultId:null,reviewReferenceId:null,
    taskIds:[],researchReferenceIds:[],nextAllowedAt:null};
   s.requests.push(r);
   return {view:view(r),accessToken:token,deduplicated:false};
  });
 }
 /** No personally identifying details are served: only generic research progress. */
 async publicStatus(requestId:string,accessToken:string):Promise<PublicRequestView|null>{
  if(!code(requestId)||typeof accessToken!=='string'||!/^[0-9a-f]{64}$/.test(accessToken))return null;
  const x=(await this.load()).requests.find(r=>r.id===requestId);
  if(!x)return null;
  const submitted=Buffer.from(sha(accessToken),'hex');
  return x.accessHashes.some(h=>timingSafeEqual(Buffer.from(h,'hex'),submitted))?view(x):null;
 }
 async claimNext(asOf=now(),leaseMs=180000,capacityAvailable:(r:Readonly<RequestRow>)=>boolean=()=>false):Promise<Claim|null>{
  if(!iso(asOf)||!Number.isInteger(leaseMs)||leaseMs<1000||leaseMs>900000)throw Error('Invalid lease');
  return this.transaction(s=>{
   const ready=s.requests.find(r=>(r.status==='queued'||r.status==='temporarily_unavailable'||
    r.status==='researching'&&r.leaseUntil!==null&&Date.parse(r.leaseUntil)<=Date.parse(asOf)||
    r.status==='awaiting_research_capacity'&&capacityAvailable(r))&&
    (r.nextAllowedAt===null||Date.parse(r.nextAllowedAt)<=Date.parse(asOf))&&r.attempts<3);
   if(!ready)return null;
   const leaseToken=randomBytes(32).toString('hex');
   ready.status='researching';ready.attempts++;ready.updatedAt=asOf;
   ready.leaseHash=sha(leaseToken);ready.leaseUntil=new Date(Date.parse(asOf)+leaseMs).toISOString();
   return {requestId:ready.id,leaseToken,categoryId:ready.categoryId,
    categoryLabel:ready.categoryLabel,productLabel:ready.productLabel,useCaseKey:ready.useCaseKey};
  });
 }
 async settle(claim:Claim,status:Exclude<RequestStatus,'queued'|'researching'|'ready'>,
  taskIds:readonly string[]=[],asOf=now(),researchReferenceIds:readonly string[]=[]):Promise<PublicRequestView>{
  if(!iso(asOf)||taskIds.length>20||!taskIds.every(code)||
    researchReferenceIds.length>100||!researchReferenceIds.every(code))throw Error('Invalid settlement');
  return this.transaction(s=>{
   const r=s.requests.find(r=>r.id===claim.requestId);
   if(!r||r.status!=='researching'||r.leaseHash!==sha(claim.leaseToken)||
    r.leaseUntil===null||Date.parse(r.leaseUntil)<Date.parse(asOf))throw Error('Invalid or expired worker lease');
   r.status=status==='temporarily_unavailable'&&r.attempts>=3?'unable_to_complete':status;
   r.updatedAt=asOf;r.leaseHash=null;r.leaseUntil=null;
   r.taskIds=[...new Set(taskIds)];
   r.researchReferenceIds=[...new Set(researchReferenceIds)];
   r.nextAllowedAt=status==='temporarily_unavailable'&&r.attempts<3?
    new Date(Date.parse(asOf)+60000*r.attempts).toISOString():null;
   return view(r);
  });
 }
 /** Server-internal only, NEVER route this via the consumer HTTP API.
  * Verification authorizer must authenticate a human or trusted quality-gate decision.
  */
 async publishVerified(attestation:VerifiedResultAttestation,
  authorizer:(attestation:VerifiedResultAttestation)=>Promise<boolean>):Promise<PublicRequestView>{
  if(!code(attestation.requestId)||!code(attestation.resultId)||!code(attestation.reviewReferenceId)||
   !iso(attestation.verifiedAt)||!Number.isInteger(attestation.independentSourceCount)||
   attestation.independentSourceCount<2||
   !Array.isArray(attestation.verifiedOriginalTestIds)||attestation.verifiedOriginalTestIds.length<2||
   !attestation.verifiedOriginalTestIds.every(code)||
   new Set(attestation.verifiedOriginalTestIds).size!==attestation.verifiedOriginalTestIds.length||
   attestation.verifiedOriginalTestIds.length!==attestation.independentSourceCount||
   !Array.isArray(attestation.verifiedEvidenceReferenceIds)||
   attestation.verifiedEvidenceReferenceIds.length<2||
   !attestation.verifiedEvidenceReferenceIds.every(code)||
   new Set(attestation.verifiedEvidenceReferenceIds).size!==attestation.verifiedEvidenceReferenceIds.length)
   throw Error('Incomplete independent evidence review');
  if(!await authorizer(attestation))throw Error('Independent review not authenticated');
  return this.transaction(s=>{
   const r=s.requests.find(r=>r.id===attestation.requestId);
   if(!r||r.status!=='awaiting_independent_review')throw Error('Not eligible for verified publication');
   if(!attestation.verifiedEvidenceReferenceIds.every(ref=>r.researchReferenceIds.includes(ref)))
    throw Error('Unlinked independent evidence reference');
   r.status='ready';r.updatedAt=attestation.verifiedAt;
   r.approvedResultId=attestation.resultId;r.reviewReferenceId=attestation.reviewReferenceId;
   return view(r);
  });
 }
}
