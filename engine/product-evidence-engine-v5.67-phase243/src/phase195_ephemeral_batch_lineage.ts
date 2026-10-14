/** Phase195: ephemeral same-product, multi-source lineage analysis without review-body retention.
 * It consumes rights-appropriate texts IN MEMORY, reuses Phase194's candidate index,
 * and returns ONLY compact derived metadata. No web fetching, test admission, experiment
 * merging, publisher custody proof, source-authorship claim, or public ranking.
 * A SHA-256 digest is not anonymous; absence of saved text limits future similarity
 * recomputation. Re-fetch original sources where licensed and re-screen revisions.
 */
import {createHash} from 'node:crypto';
import {writeFileSync,renameSync,mkdirSync,openSync,closeSync,fsyncSync,unlinkSync,readFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {findDocumentCandidates194,type Document194,type CandidateReason194} from './phase194_candidate_retrieval.js';
import {normalizeDiscoveryUrl192} from './phase192_lineage_marketplace_screen.js';

export type DateSignal195='publisher_datePublished'|'publisher_dateModified'|'visible_publication'|
 'visible_updated'|'archive_capture'|'first_seen_by_pee'|'claimed_test_performed';
export interface DatedSignal195{kind:DateSignal195;iso:string;}
export type AttributionType195='explicitly_cites'|'claims_republication'|'reports_test_of';
export interface Attribution195{targetSourceId:string;kind:AttributionType195;}
export interface Measurement195{
 field:string;value:number;unit:string;protocol:string;condition:string;
 producerId:string|null;testEventId:string|null;
 /** Source's claim only. No attribution becomes verified without original-source review. */
 basis:'original_test_claimed'|'third_party_test_reported'|'manufacturer_specification'|'unknown_origin';
}
export interface ReviewIn195{
 sourceId:string;url:string;category:string;variantId:string;
 /** A rights-authorized, transient string. NOT persisted, logged, returned or reproduced. */
 transientText:string;
 textBasis:'rights_appropriate_extract'|'analyst_annotation';
 dates:readonly DatedSignal195[];
 attribution:readonly Attribution195[];
 measurements:readonly Measurement195[];
}
export interface BatchInput195{reviews:readonly ReviewIn195[];batchId:string;analyzedAt:string;}
export type ChronologyIssue195='modified_before_published'|'first_seen_before_claimed_publication'|
 'republication_predates_cited_publication'|'date_signal_disagreement';
export interface TimelineAlert195{sourceId:string;relatedSourceId:string|null;issue:ChronologyIssue195;
 action:'verify_timestamp_and_publication_history';originalityProven:false;}
export interface CompactSource195{sourceId:string;url:string;category:string;variantId:string;
 /** Digest of the authorized transient extract/annotation, NOT authenticated publisher bytes. */
 transientExtractSha256:string;fingerprintBasis:'rights_appropriate_extract'|'analyst_annotation';
 dates:readonly DatedSignal195[];claimCount:number;claimedOriginalCount:number;
 status:'original_origin_unverified';needsFreshPublisherCheck:true;}
export interface DocumentLink195{sourceA:string;sourceB:string;reason:CandidateReason194;
 jaccard:number|null;action:'inspect_not_auto_merge';}
export interface ClaimCollision195{
 sourceA:string;sourceB:string;field:string;fingerprint:string;
 label:'same_measurement_fields_possible_shared_source';
 action:'review_original_test_identity';testEventsMerged:false;
}
export interface ExplicitLink195{from:string;to:string;type:AttributionType195;
 proof:'source_supplied_unverified';testEventsMerged:false;}
export interface ProductCoverage195{
 category:string;variantId:string;sourceCount:number;claimCount:number;
 originalTestsVerified:0;noSourceTextRetained:true;
}
export interface BatchResult195{
 schema:'195.1';state:'research_only';batchId:string;analyzedAt:string;
 retention:'derived_metadata_only';sourceBodiesStored:false;
 sources:readonly CompactSource195[];documentCandidates:readonly DocumentLink195[];
 measurementCollisions:readonly ClaimCollision195[];explicitAttribution:readonly ExplicitLink195[];
 chronologyAlerts:readonly TimelineAlert195[];coverage:readonly ProductCoverage195[];
 originalTestIdentityVerified:false;testEventMergesAuthorized:false;
 /** Unlike full original publisher bytes, transient extract hash cannot revalidate the source. */
 skipFutureSourceScreeningWithoutFreshRead:false;publicRankingAllowed:false;
}
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const sid=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(s);
const tag=(s:unknown):s is string=>typeof s==='string'&&/^[A-Za-z0-9_.:\-\/ ]{1,140}$/.test(s);
const hex64=(s:unknown):s is string=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const iso=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(s)&&
 !Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,19)===s.slice(0,19);
const day=(s:string)=>Date.parse(s);
const uniq=<T>(x:readonly T[])=>new Set(x).size===x.length;
const signalKinds:DateSignal195[]=['publisher_datePublished','publisher_dateModified','visible_publication','visible_updated','archive_capture','first_seen_by_pee','claimed_test_performed'];
const linkKinds:AttributionType195[]=['explicitly_cites','claims_republication','reports_test_of'];
const bases:Measurement195['basis'][]=['original_test_claimed','third_party_test_reported','manufacturer_specification','unknown_origin'];
function check195(input:BatchInput195):void{
 if(!input||!sid(input.batchId)||!iso(input.analyzedAt)||!Array.isArray(input.reviews)||
 input.reviews.length>1500||!uniq(input.reviews.map(r=>r?.sourceId)))throw Error('invalid195_batch');
 const ids=new Set(input.reviews.map(r=>r.sourceId));
 for(const r of input.reviews){
  if(!sid(r?.sourceId)||!sid(r.category)||!sid(r.variantId)||
   typeof r.transientText!=='string'||r.transientText.length>20000||
   !['rights_appropriate_extract','analyst_annotation'].includes(r.textBasis)||
   !Array.isArray(r.dates)||r.dates.length>16||
   !Array.isArray(r.attribution)||r.attribution.length>50||
   !Array.isArray(r.measurements)||r.measurements.length>100)throw Error('invalid195_review');
  if(typeof r.url!=='string'||r.url.length>3000)throw Error('invalid195_review');
  normalizeDiscoveryUrl192(r.url);
  for(const d of r.dates)if(!d||!signalKinds.includes(d.kind)||!iso(d.iso)||day(d.iso)>day(input.analyzedAt))
   throw Error('invalid195_dates');
  if(!uniq(r.dates.map((d:DatedSignal195)=>d.kind+'|'+d.iso)))throw Error('invalid195_duplicate_date');
  for(const l of r.attribution)if(!l||!ids.has(l.targetSourceId)||l.targetSourceId===r.sourceId||
   !linkKinds.includes(l.kind))throw Error('invalid195_attribution');
  if(!uniq(r.attribution.map((l:Attribution195)=>l.targetSourceId+'|'+l.kind)))throw Error('invalid195_duplicate_attribution');
  for(const m of r.measurements){
   if(!m||!sid(m.field)||!Number.isFinite(m.value)||!tag(m.unit)||!tag(m.protocol)||
    !tag(m.condition)||!bases.includes(m.basis)||
    (m.producerId!==null&&!sid(m.producerId))||
    (m.testEventId!==null&&!sid(m.testEventId)))throw Error('invalid195_measurement');
  }
 }
}
function first195(r:ReviewIn195,kinds:readonly DateSignal195[]):number|null{
 const dates=r.dates.filter(d=>kinds.includes(d.kind)).map(d=>day(d.iso));
 return dates.length?Math.min(...dates):null;
}
const sourceKey195=(r:ReviewIn195)=>r.category+'|'+r.variantId;
const claimFingerprint195=(r:ReviewIn195,m:Measurement195)=>
 sha(JSON.stringify([r.category,r.variantId,m.field,m.value,m.unit,m.protocol,m.condition]));
/** Compute comparisons in one product-scoped session; never retain review text.
 * Measurements and publisher dates are user-supplied research annotations, NOT verified facts.
 * A collision or time ordering cannot establish common original experiment identity.
 */
export function analyzeEphemeralBatch195(input:BatchInput195):BatchResult195{
 check195(input);
 const ordered=[...input.reviews].sort((a,b)=>a.sourceId.localeCompare(b.sourceId));
 const byId=new Map(ordered.map(r=>[r.sourceId,r]));
 const groups=new Map<string,ReviewIn195[]>();
 for(const r of ordered){const k=sourceKey195(r);groups.set(k,[...(groups.get(k)??[]),r]);}
 const docCandidates:DocumentLink195[]=[];
 for(const [_,reviewGroup] of [...groups].sort(([a],[b])=>a.localeCompare(b))){
  const transient:Document194[]=reviewGroup.map(r=>({
   sourceId:r.sourceId,url:r.url,variantIds:[r.variantId],text:r.transientText,
   basis:r.textBasis,contentHash:sha(r.transientText)}));
  const ret=findDocumentCandidates194(transient);
  for(const c of ret.candidates)docCandidates.push({sourceA:c.sourceA,sourceB:c.sourceB,
   reason:c.reason,jaccard:c.jaccard,action:'inspect_not_auto_merge'});
 }
 docCandidates.sort((a,b)=>a.sourceA.localeCompare(b.sourceA)||a.sourceB.localeCompare(b.sourceB));
 const sources:CompactSource195[]=ordered.map(r=>({sourceId:r.sourceId,
  url:normalizeDiscoveryUrl192(r.url),category:r.category,variantId:r.variantId,
  transientExtractSha256:sha(r.transientText),fingerprintBasis:r.textBasis,
  dates:[...r.dates].sort((a,b)=>a.kind.localeCompare(b.kind)||a.iso.localeCompare(b.iso)).map(d=>({kind:d.kind,iso:d.iso})),
  claimCount:r.measurements.length,
  claimedOriginalCount:r.measurements.filter(m=>m.basis==='original_test_claimed').length,
  status:'original_origin_unverified',needsFreshPublisherCheck:true}));
 const hits=new Map<string,{r:ReviewIn195;m:Measurement195}[]>();
 for(const r of ordered)for(const m of r.measurements){const key=claimFingerprint195(r,m);
  hits.set(key,[...(hits.get(key)??[]),{r,m}]);}
 const collisions:ClaimCollision195[]=[];
 for(const [key,entries] of hits)for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
  const a=entries[i],b=entries[j];if(a.r.sourceId===b.r.sourceId)continue;
  // Exact same numeric observation is ONLY a review cue, not a merge or plagiarized fact.
  collisions.push({sourceA:a.r.sourceId,sourceB:b.r.sourceId,field:a.m.field,fingerprint:key,
   label:'same_measurement_fields_possible_shared_source',action:'review_original_test_identity',testEventsMerged:false});
 }
 collisions.sort((a,b)=>a.sourceA.localeCompare(b.sourceA)||a.sourceB.localeCompare(b.sourceB)||a.field.localeCompare(b.field));
 const links:ExplicitLink195[]=ordered.flatMap(r=>r.attribution.map(l=>({from:r.sourceId,to:l.targetSourceId,
  type:l.kind,proof:'source_supplied_unverified' as const,testEventsMerged:false as const})))
  .sort((a,b)=>a.from.localeCompare(b.from)||a.to.localeCompare(b.to)||a.type.localeCompare(b.type));
 const flags:TimelineAlert195[]=[];
 const addFlag=(sourceId:string,issue:ChronologyIssue195,relatedSourceId:string|null=null)=>{
  const key=sourceId+'|'+issue+'|'+relatedSourceId;
  if(flags.some(f=>f.sourceId+'|'+f.issue+'|'+f.relatedSourceId===key))return;
  flags.push({sourceId,relatedSourceId,issue,action:'verify_timestamp_and_publication_history',originalityProven:false});
 };
 for(const r of ordered){
  const pub=first195(r,['publisher_datePublished','visible_publication']);
  const edit=first195(r,['publisher_dateModified','visible_updated']);
  const seen=first195(r,['first_seen_by_pee','archive_capture']);
  if(pub!==null&&edit!==null&&edit<pub)addFlag(r.sourceId,'modified_before_published');
  if(pub!==null&&seen!==null&&seen<pub)addFlag(r.sourceId,'first_seen_before_claimed_publication');
  const pdates=r.dates.filter(x=>x.kind==='publisher_datePublished'||x.kind==='visible_publication');
  if(pdates.length>=2&&new Set(pdates.map(x=>x.iso)).size>1)addFlag(r.sourceId,'date_signal_disagreement');
  for(const l of r.attribution){
   if(l.kind==='explicitly_cites')continue;
   const target=byId.get(l.targetSourceId)!;
   if(sourceKey195(target)!==sourceKey195(r))continue;
   const tp=first195(target,['publisher_datePublished','visible_publication']);
   if(pub!==null&&tp!==null&&pub<tp)addFlag(r.sourceId,'republication_predates_cited_publication',target.sourceId);
  }
 }
 flags.sort((a,b)=>a.sourceId.localeCompare(b.sourceId)||a.issue.localeCompare(b.issue)||
  (a.relatedSourceId??'').localeCompare(b.relatedSourceId??''));
 const coverage:ProductCoverage195[]=[...groups].map(([_,rs])=>({category:rs[0].category,variantId:rs[0].variantId,
  sourceCount:rs.length,claimCount:rs.reduce((s,r)=>s+r.measurements.length,0),
  originalTestsVerified:0 as const,noSourceTextRetained:true as const})).sort((a,b)=>a.category.localeCompare(b.category)||a.variantId.localeCompare(b.variantId));
 return {schema:'195.1',state:'research_only',batchId:input.batchId,analyzedAt:input.analyzedAt,
  retention:'derived_metadata_only',sourceBodiesStored:false,sources,
  documentCandidates:docCandidates,measurementCollisions:collisions,
  explicitAttribution:links,chronologyAlerts:flags,coverage,
  originalTestIdentityVerified:false,testEventMergesAuthorized:false,
  skipFutureSourceScreeningWithoutFreshRead:false,publicRankingAllowed:false};
}
/** Only a derived allowlisted result is serializable. The raw input NEVER enters this file.
 * Hashes/URL may still be linkable; restrict permissions and retention as needed.
 */
function strictMetadata195(report:BatchResult195):BatchResult195{
 const allowed=new Map<string,Set<string>>([
  ['root',new Set(['schema','state','batchId','analyzedAt','retention','sourceBodiesStored','sources','documentCandidates','measurementCollisions','explicitAttribution','chronologyAlerts','coverage','originalTestIdentityVerified','testEventMergesAuthorized','skipFutureSourceScreeningWithoutFreshRead','publicRankingAllowed'])],
  ['source',new Set(['sourceId','url','category','variantId','transientExtractSha256','fingerprintBasis','dates','claimCount','claimedOriginalCount','status','needsFreshPublisherCheck'])],
  ['date',new Set(['kind','iso'])],['candidate',new Set(['sourceA','sourceB','reason','jaccard','action'])],
  ['collision',new Set(['sourceA','sourceB','field','fingerprint','label','action','testEventsMerged'])],
  ['attribution',new Set(['from','to','type','proof','testEventsMerged'])],
  ['alert',new Set(['sourceId','relatedSourceId','issue','action','originalityProven'])],
  ['coverage',new Set(['category','variantId','sourceCount','claimCount','originalTestsVerified','noSourceTextRetained'])]]);
 const examine=(obj:unknown,which:string):void=>{
  if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error('unsafe195_report');
  const keys=Object.keys(obj);if(keys.length!==allowed.get(which)!.size||keys.some(k=>!allowed.get(which)!.has(k)))
   throw Error('unsafe195_report_keys');
 };
 examine(report,'root');
 if(report.schema!=='195.1'||report.retention!=='derived_metadata_only'||report.sourceBodiesStored||
  report.publicRankingAllowed||report.originalTestIdentityVerified||report.testEventMergesAuthorized||
  report.skipFutureSourceScreeningWithoutFreshRead||!sid(report.batchId)||!iso(report.analyzedAt))throw Error('unsafe195_report');
 const each=(arr:readonly unknown[],shape:string)=>{if(!Array.isArray(arr))throw Error('unsafe195_report');for(const x of arr)examine(x,shape);};
 each(report.sources,'source');for(const x of report.sources){normalizeDiscoveryUrl192(x.url);
  if(!sid(x.sourceId)||!sid(x.category)||!sid(x.variantId)||!hex64(x.transientExtractSha256)||
    !['rights_appropriate_extract','analyst_annotation'].includes(x.fingerprintBasis)||
    !Number.isSafeInteger(x.claimCount)||x.claimCount<0||!Number.isSafeInteger(x.claimedOriginalCount)||
    x.claimedOriginalCount<0||x.claimedOriginalCount>x.claimCount||
    x.status!=='original_origin_unverified'||x.needsFreshPublisherCheck!==true||
    x.url.length>3000)throw Error('unsafe195_report');
   each(x.dates,'date');for(const d of x.dates)if(!signalKinds.includes(d.kind)||!iso(d.iso))throw Error('unsafe195_report');}
 each(report.documentCandidates,'candidate');for(const c of report.documentCandidates)
  if(!sid(c.sourceA)||!sid(c.sourceB)||
   !['identical_publisher_bytes','same_normalized_url','same_normalized_text','near_duplicate_shingles'].includes(c.reason)||
   (c.jaccard!==null&&(!Number.isFinite(c.jaccard)||c.jaccard<0||c.jaccard>1))||c.action!=='inspect_not_auto_merge')throw Error('unsafe195_report');
 each(report.measurementCollisions,'collision');for(const c of report.measurementCollisions)
  if(!sid(c.sourceA)||!sid(c.sourceB)||!sid(c.field)||!hex64(c.fingerprint)||
   c.action!=='review_original_test_identity'||c.label!=='same_measurement_fields_possible_shared_source'||
   c.testEventsMerged!==false)throw Error('unsafe195_report');
 each(report.explicitAttribution,'attribution');for(const a of report.explicitAttribution)
  if(!sid(a.from)||!sid(a.to)||!linkKinds.includes(a.type)||a.proof!=='source_supplied_unverified'||
   a.testEventsMerged!==false)throw Error('unsafe195_report');
 each(report.chronologyAlerts,'alert');for(const a of report.chronologyAlerts)
  if(!sid(a.sourceId)||(a.relatedSourceId!==null&&!sid(a.relatedSourceId))||
   !['modified_before_published','first_seen_before_claimed_publication','republication_predates_cited_publication','date_signal_disagreement'].includes(a.issue)||
   a.action!=='verify_timestamp_and_publication_history'||a.originalityProven!==false)throw Error('unsafe195_report');
 each(report.coverage,'coverage');for(const c of report.coverage)
  if(!sid(c.category)||!sid(c.variantId)||!Number.isSafeInteger(c.sourceCount)||c.sourceCount<0||
   !Number.isSafeInteger(c.claimCount)||c.claimCount<0||c.originalTestsVerified!==0||c.noSourceTextRetained!==true)throw Error('unsafe195_report');
 return report;
}
export function writeDerivedMetadata195(path:string,report:BatchResult195):void{
 if(!path.endsWith('.json'))throw Error('invalid195_path');strictMetadata195(report);
 mkdirSync(dirname(path),{recursive:true});const temp=path+'.phase195.tmp';let fd:number|undefined;
 try{fd=openSync(temp,'wx',0o600);writeFileSync(fd,JSON.stringify(report,null,2)+'\n','utf8');fsyncSync(fd);
  closeSync(fd);fd=undefined;renameSync(temp,path);
  try{const dir=openSync(dirname(path),'r');try{fsyncSync(dir)}finally{closeSync(dir)}}catch{/* filesystem limitation */}
 }catch(err){if(fd!==undefined)closeSync(fd);try{unlinkSync(temp)}catch{/* noop */}throw err;}
}
export function readDerivedMetadata195(path:string):BatchResult195{
 const raw=readFileSync(path,'utf8');if(raw.length>20000000)throw Error('invalid195_size');
 return strictMetadata195(JSON.parse(raw) as BatchResult195);
}
