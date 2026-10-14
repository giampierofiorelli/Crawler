/** Phase194: narrow, read-only candidate retrieval for documentary duplication.
 * Studied (not bundled): datasketch MinHashLSH, text-dedup MinHash/false-positive check,
 * dedupe active record linkage, changedetection.io snapshot change detection.
 * No semantic inference of experiment identity or plagiarism. No ranking authorization.
 * Input excerpts must be acquired with appropriate rights; no remote crawling is performed.
 */
import {createHash} from 'node:crypto';
import {normalizeDiscoveryUrl192} from './phase192_lineage_marketplace_screen.js';
import {lookupScreening193,type ScreeningLedger193,type SourceRevision193,
 type ScreeningLookup193} from './phase193_screening_memory.js';

export type Basis194='publisher_bytes'|'rights_appropriate_extract'|'analyst_annotation';
export interface Document194 {
 sourceId:string;url:string;variantIds:readonly string[];
 /** Only authorized local text; never reproduced in report. */
 text:string;basis:Basis194;contentHash:string;
}
export type CandidateReason194='identical_publisher_bytes'|'same_normalized_url'|
 'same_normalized_text'|'near_duplicate_shingles';
export interface Candidate194 {
 sourceA:string;sourceB:string;reason:CandidateReason194;
 jaccard:number|null;
 /** Even perfect text identity is not evidence of one shared test event. */
 action:'inspect_document_relationship_not_experiment_merge';
 sourceAttributionVerified:false;testEventMerged:false;
}
export interface RetrievalReport194{
 schema:'194.1';phase:194;state:'research_only';documents:number;
 pairsConsidered:number;allPairsPossible:number;signatureParameters:{permutations:64;bands:16;rows:4;
 shingleTokens:5;exactResemblanceFloor:0.60};
 candidates:readonly Candidate194[];unmatchedSourceIds:readonly string[];
 sourceAttributionVerified:false;testEventMergesAuthorized:false;publicRankingAllowed:false;
 approximateRetrievalCanMissRewrites:true;
}
const sha=(s:string|Uint8Array)=>createHash('sha256').update(s).digest('hex');
const isHex=(s:unknown):s is string=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(s);
const tokenize=(s:string)=>s.toLowerCase().normalize('NFKC').replace(/[\p{P}\p{S}]+/gu,' ').split(/\s+/).filter(Boolean);
const unique=<T>(a:readonly T[])=>new Set(a).size===a.length;
function shingles194(s:string):Set<string>{
 const ts=tokenize(s),ret=new Set<string>();
 for(let i=0;i+5<=ts.length;i++)ret.add(ts.slice(i,i+5).join(' '));
 return ret;
}
/** Deterministic bottom-k seeded minimum signatures (candidate generation only).
 * 64 independent salted SHA-256 hashes; NOT a calibrated probability model.
 */
function signatures194(shingles:Set<string>):readonly string[]{
 if(shingles.size===0)return [];
 const keys=[...shingles].sort();const sig:string[]=[];
 for(let j=0;j<64;j++){
  const seed=String(j).padStart(2,'0')+':';let best='f'.repeat(16);
  for(const key of keys){const h=sha(seed+key).slice(0,16);if(h<best)best=h;}
  sig.push(best);
 }
 return sig;
}
function validate194(docs:readonly Document194[]):void{
 if(!Array.isArray(docs)||docs.length>2500||!unique(docs.map(x=>x?.sourceId)))throw Error('invalid194_corpus');
 for(const d of docs){
  if(!id(d?.sourceId)||!Array.isArray(d.variantIds)||d.variantIds.length>100||
    !d.variantIds.every(id)||!unique(d.variantIds)||
    !['publisher_bytes','rights_appropriate_extract','analyst_annotation'].includes(d.basis)||
    typeof d.text!=='string'||d.text.length>20000||!isHex(d.contentHash)||
    sha(d.text)!==d.contentHash)throw Error('invalid194_document');
  normalizeDiscoveryUrl192(d.url);
 }
}
/** Single-pass deterministic blocking plus exact verification for returned pairs.
 * Exact match of authorized publisher bytes may identify duplicate documents, but
 * neither a duplicate document nor a same-value measurement proves the same test.
 * LSH recall is heuristic; never say that unmatched items are independent.
 */
export function findDocumentCandidates194(docs:readonly Document194[]):RetrievalReport194{
 validate194(docs);
 const sorted=[...docs].sort((a,b)=>a.sourceId.localeCompare(b.sourceId));
 const bucket=new Map<string,string[]>();
 // A repeated template (site chrome/affiliate boilerplate) is not evidence that
 // independently authored technical reviews share original measurements.
 const rawSets=new Map(sorted.map(d=>[d.sourceId,shingles194(d.text)]));
 const df=new Map<string,number>();
 for(const sh of rawSets.values())for(const x of sh)df.set(x,(df.get(x)??0)+1);
 const frequentLimit=sorted.length<12?Number.POSITIVE_INFINITY:Math.max(3,Math.ceil(sorted.length*0.25));
 const sets=new Map(sorted.map(d=>[d.sourceId,
   new Set([...rawSets.get(d.sourceId)!].filter(x=>df.get(x)!<=frequentLimit))]));
 const candidates=new Map<string,Candidate194>();let pairsConsidered=0;
 const add=(a:Document194,b:Document194,reason:CandidateReason194,jaccard:number|null)=>{
  const [aa,bb]=[a.sourceId,b.sourceId].sort();const key=aa+'|'+bb;
  const priority:CandidateReason194[]=['identical_publisher_bytes','same_normalized_url',
    'same_normalized_text','near_duplicate_shingles'];
  const old=candidates.get(key);if(old&&priority.indexOf(old.reason)<=priority.indexOf(reason))return;
  candidates.set(key,{sourceA:aa,sourceB:bb,reason,jaccard,
   action:'inspect_document_relationship_not_experiment_merge',
   sourceAttributionVerified:false,testEventMerged:false});
 };
 const byId=new Map(sorted.map(d=>[d.sourceId,d]));
 for(const d of sorted){
  const sh=sets.get(d.sourceId)!;
  const keys=new Set<string>();
  keys.add('url:'+normalizeDiscoveryUrl192(d.url));
  if(d.basis==='publisher_bytes')keys.add('publisher:'+d.contentHash);
  // Exact extracted/annotated text is a candidate, never conclusive identity.
  keys.add('text:'+sha(tokenize(d.text).join(' ')));
  const sig=sh.size>=5?signatures194(sh):[];
  if(sig.length===64){for(let band=0;band<16;band++){
   keys.add('band:'+band+':'+sig.slice(band*4,band*4+4).join(':'));
  }}
  const neighbors=new Set<string>();
  for(const key of keys)for(const prior of bucket.get(key)??[])neighbors.add(prior);
  for(const otherId of [...neighbors].sort()){
   const p=byId.get(otherId)!;pairsConsidered++;
   const sameUrl=normalizeDiscoveryUrl192(p.url)===normalizeDiscoveryUrl192(d.url);
   const exactBytes=p.basis==='publisher_bytes'&&d.basis==='publisher_bytes'&&p.contentHash===d.contentHash;
   const sameText=tokenize(p.text).length>=25&&tokenize(d.text).length>=25&&
    sha(tokenize(p.text).join(' '))===sha(tokenize(d.text).join(' '));
   if(exactBytes){add(p,d,'identical_publisher_bytes',1);continue;}
   if(sameUrl){add(p,d,'same_normalized_url',null);continue;}
   if(sameText){add(p,d,'same_normalized_text',1);continue;}
   const a=sets.get(p.sourceId)!,b=sets.get(d.sourceId)!;
   // No automatic similarity match if too little distinctive content remains;
   // mark this as a recall limit, not independent evidence.
   if(a.size<5||b.size<5)continue;
   let shared=0;for(const shingle of a)if(b.has(shingle))shared++;
   const jac=shared/(a.size+b.size-shared);
   if(jac>=0.60)add(p,d,'near_duplicate_shingles',Number(jac.toFixed(6)));
  }
  for(const key of keys){const vals=bucket.get(key)??[];vals.push(d.sourceId);bucket.set(key,vals);}
 }
 const matched=new Set<string>();for(const c of candidates.values()){matched.add(c.sourceA);matched.add(c.sourceB);}
 return {schema:'194.1',phase:194,state:'research_only',documents:sorted.length,
  pairsConsidered,allPairsPossible:sorted.length*(sorted.length-1)/2,
  signatureParameters:{permutations:64,bands:16,rows:4,shingleTokens:5,exactResemblanceFloor:0.60},
  candidates:[...candidates.values()].sort((a,b)=>a.sourceA.localeCompare(b.sourceA)||a.sourceB.localeCompare(b.sourceB)),
  unmatchedSourceIds:sorted.map(d=>d.sourceId).filter(x=>!matched.has(x)),
  sourceAttributionVerified:false,testEventMergesAuthorized:false,publicRankingAllowed:false,
  approximateRetrievalCanMissRewrites:true};
}
/** A publisher byte snapshot MUST be freshly acquired and hashed before reuse.
 * HTTP ETags, page timestamps, and the URL alone cannot prove original bytes unchanged.
 * Reuses Phase193's explicit policy, scope and content gates without bypassing review.
 */
export function checkFreshPublisherSnapshot194(args:{ledger:ScreeningLedger193;
 revision:SourceRevision193;freshPublisherBytes:Uint8Array|null;
 scope?:'document'|'field'}):ScreeningLookup193{
 if(args.freshPublisherBytes===null){return {
  verdict:'screen_required_unverified_revision',reused:null,
  reason:'No newly observed original publisher bytes; server metadata and old fingerprints are not proof of freshness.',
  fullDocumentRescreenSkipped:false,mayUseAsIndependentTest:false,candidatePreserved:true};}
 if(args.revision.contentBasis!=='publisher_bytes')return {
  verdict:'screen_required_unverified_revision',reused:null,
  reason:'Publisher-byte revalidation cannot authenticate excerpts or analyst annotations.',
  fullDocumentRescreenSkipped:false,mayUseAsIndependentTest:false,candidatePreserved:true};
 const actual=sha(args.freshPublisherBytes);
 return lookupScreening193(args.ledger,{...args.revision,contentHash:actual},args.scope??'field');
}
export interface PairLabel194{sourceA:string;sourceB:string;textuallyRelated:boolean;
 /** Gold labels are externally annotated, not inferred from similarity. */
 reviewedBy:string;reviewProtocol:string;}
/** Explicit evaluation accounting; caller must supply independently adjudicated labels
 * before claiming a real-world result. Missing labeled pairs aren't assumed negatives.
 */
export function evaluateCandidateRetrieval194(result:RetrievalReport194,labels:readonly PairLabel194[]){
 const predicted=new Set(result.candidates.map(c=>c.sourceA+'|'+c.sourceB));
 const seen=new Set<string>();let tp=0,fp=0,fn=0,tn=0;
 const known=new Set([...result.unmatchedSourceIds,...result.candidates.flatMap(c=>[c.sourceA,c.sourceB])]);
 for(const p of labels){
  if(!id(p.sourceA)||!id(p.sourceB)||p.sourceA===p.sourceB||
   typeof p.textuallyRelated!=='boolean'||typeof p.reviewedBy!=='string'||!p.reviewedBy.trim()||
   typeof p.reviewProtocol!=='string'||!p.reviewProtocol.trim()||
   !known.has(p.sourceA)||!known.has(p.sourceB))throw Error('invalid194_label');
  const key=[p.sourceA,p.sourceB].sort().join('|');if(seen.has(key))throw Error('invalid194_repeated_label');seen.add(key);
  const yes=predicted.has(key);
  if(yes&&p.textuallyRelated)tp++;else if(yes)fp++;else if(p.textuallyRelated)fn++;else tn++;
 }
 return {labeledPairs:labels.length,tp,fp,fn,tn,
  precision:tp+fp?tp/(tp+fp):null,recall:tp+fn?tp/(tp+fn):null,
  externallyReviewedLabelsAuthenticated:false,
  noClaimsAboutUnlabeledPairs:true};
}
