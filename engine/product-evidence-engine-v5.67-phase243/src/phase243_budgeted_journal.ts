/** Research-only append-only snapshot journal for Phase243 priority decisions.
 * On disk stores only hashes, typed decisions and metadata: no publisher bodies.
 * Hash chaining detects accidental changes, NOT malicious edits by a key holder.
 * Retains suspended product IDs and reasons; does not certify publisher evidence.
 */
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,renameSync,existsSync,unlinkSync,openSync,closeSync,fsyncSync} from 'node:fs';
import {dirname,basename,join} from 'node:path';
import {validateSnapshot243,type Snapshot243} from './phase243_budgeted_category_search.js';
export interface JournalEvent243 {
 sequence:number;recordedAt:string;previousHash:string;entryHash:string;
 snapshot:Snapshot243;
}
export interface ResearchJournal243 {
 schema:'pee243.research-journal.v1';events:readonly JournalEvent243[];
 authorizedProductRanking:false;signaturesVerified:false;
}
const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
const origin=sha('pee243 research journal origin');
const date=(x:string)=>/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(x)&&
 Number.isFinite(Date.parse(x));
export function emptyResearchJournal243():ResearchJournal243 {
 return {schema:'pee243.research-journal.v1',events:[],authorizedProductRanking:false,
  signaturesVerified:false};
}
export function validateResearchJournal243(j:ResearchJournal243):void {
 if(!j||j.schema!=='pee243.research-journal.v1'||j.authorizedProductRanking!==false||
  j.signaturesVerified!==false||!Array.isArray(j.events)||j.events.length>100000)
  throw Error('phase243_invalid_journal');
 let prev=origin,last=0;
 for(let i=0;i<j.events.length;i++){
  const e=j.events[i];
  if(!e||e.sequence!==i+1||!date(e.recordedAt)||Date.parse(e.recordedAt)<last||
   e.previousHash!==prev||!validateSnapshot243(e.snapshot)||
   e.entryHash!==sha(JSON.stringify({sequence:e.sequence,recordedAt:e.recordedAt,
    previousHash:e.previousHash,snapshot:e.snapshot})))
   throw Error('phase243_broken_journal_chain');
  last=Date.parse(e.recordedAt);prev=e.entryHash;
 }
}
export function appendResearchDecision243(j:ResearchJournal243,s:Snapshot243,
 recordedAt:string):ResearchJournal243 {
 validateResearchJournal243(j);
 if(!validateSnapshot243(s)||!date(recordedAt)||
  j.events.length>0&&Date.parse(recordedAt)<Date.parse(j.events.at(-1)!.recordedAt))
  throw Error('phase243_invalid_journal_append');
 const body={sequence:j.events.length+1,recordedAt,
  previousHash:j.events.at(-1)?.entryHash??origin,snapshot:structuredClone(s)};
 const next:{schema:ResearchJournal243['schema'];events:JournalEvent243[];
  authorizedProductRanking:false;signaturesVerified:false}={...j,
  events:[...j.events,{...body,entryHash:sha(JSON.stringify(body))}]};
 validateResearchJournal243(next);return next;
}
/** Optional single-host metadata-only persistence. The caller chooses and authorizes path. */
export function loadResearchJournal243(path:string):ResearchJournal243 {
 if(!existsSync(path))return emptyResearchJournal243();
 const bytes=readFileSync(path);
 if(bytes.length>50_000_000)throw Error('phase243_journal_too_large');
 const journal=JSON.parse(bytes.toString('utf8')) as ResearchJournal243;
 validateResearchJournal243(journal);return journal;
}
export function saveResearchJournal243(path:string,j:ResearchJournal243):void {
 validateResearchJournal243(j);
 if(typeof path!=='string'||path.length>800||!path.endsWith('.json'))
  throw Error('phase243_bad_journal_path');
 const temp=join(dirname(path),'.'+basename(path)+'.'+process.pid+'.tmp');
 const body=JSON.stringify(j,null,2)+'\n';
 try{
  writeFileSync(temp,body,{flag:'wx',mode:0o600});
  const fd=openSync(temp,'r');try{fsyncSync(fd);}finally{closeSync(fd);}
  renameSync(temp,path);
 }catch(err){try{unlinkSync(temp);}catch{}throw err;}
}
