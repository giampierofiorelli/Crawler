/** Phase 183 — source-preserving local intake of tabular technical measurements.
 * This stage is *not* source acquisition or scientific review. It consumes a
 * permission-reviewed operator-local copy AFTER the existing Phase68/69 source
 * controls, and emits quarantined observations only. Certification registry
 * figures must never masquerade as independent comparative performance tests.
 */
import {createHash} from 'node:crypto';

const sha=(x:string|Uint8Array)=>createHash('sha256').update(x).digest('hex');
const identity=(x:unknown):x is string=>typeof x==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(x)&&!['__proto__','constructor','prototype'].includes(x);
const utc=(x:unknown):x is string=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(x)&&Number.isFinite(Date.parse(x));
const officialUrl=(x:unknown):x is string=>typeof x==='string'&&x.length<2048&&/^https:\/\/[a-z0-9.-]+\/[a-zA-Z0-9%_./?=&-]*$/i.test(x);
const normalize=(x:string)=>x.trim().replace(/\s+/g,' ').toLocaleLowerCase('en');
// Source-published column headings may include spaces, units and punctuation.
// This is only a *literal column match*, never an inferred unit or dimension.
const columnLabel=(x:unknown):x is string=>typeof x==='string'&&x.length>0&&x.length<=180&&x.trim()===x&&
 !/[\x00-\x1f\x7f]/.test(x)&&!['__proto__','constructor','prototype'].includes(x);
export type DataRole183='certification_registry_manufacturer_reported'|'independent_original_test_table'|'manufacturer_specification';
export interface SourceCustody183 {
 sourceId:string;sourceUrl:string;licenseUrl:string;rightsReviewReference:string;
 permissionStatus:'operator_reviewed_local_fact_storage';
 sourceRole:DataRole183;sourceRevision:string;protocolId:string;protocolVersion:string;
 market:string;obtainedAt:string;rightsReviewedAt:string;
 acquisition:'operator_supplied_offline_copy';
}
export interface ModelScope183 {variantId:string;brand:string;modelNumber:string;categoryId:string;}
export interface ColumnMeasure183 {column:string;dimensionKey:string;unit:string;min:number;max:number;decimalSeparator?:'.'|',';}
export interface TableSchema183 {brandColumn:string;modelColumn:string;measurements:readonly ColumnMeasure183[];}
export interface StagedObservation183 {
 variantId:string;dimensionKey:string;value:number;unit:string;
 sourceColumn:string;sourceRow:number;sourceId:string;sourceUrl:string;
 sourceRole:DataRole183;protocolId:string;protocolVersion:string;sourceRevision:string;
 documentSha256:string;rowSha256:string;rowByteStart:number;rowByteEnd:number;
 observationId:string;status:'quarantined_original_source_claim';
 independentPerformanceProven:false;rankingAuthorized:false;
}
export interface IntakeResult183 {
 phase:183;schema:'183.intake.1';categoryId:string;variantId:string;
 documentSha256:string;sourceRole:DataRole183;sourceId:string;
 status:'staged_unreviewed'|'blocked';reason:string;
 observations:readonly StagedObservation183[];
 rightsDeclaredByOperatorOnly:true;independentScienceReviewed:false;
 canonicalProductKnowledgeUpdated:false;rankingAuthorized:false;
 resultHash:string;
}
interface CsvCell {value:string;}
interface CsvRow {cells:CsvCell[];start:number;end:number;}
/** Bounded RFC4180-style parser with byte-addressable source rows. Rejects
 * ambiguous malformed quotes and non-UTF8, formula-like cells are data only.
 */
function parseCsv183(s:string):CsvRow[]{
 const rows:CsvRow[]=[];let pos=0,start=0,cells:CsvCell[]=[],value='',quoted=false,afterQuote=false,fieldStart=true;
 const pushCell=()=>{cells.push({value});value='';afterQuote=false;fieldStart=true;if(cells.length>150)throw Error('phase183_too_many_columns');};
 const pushRow=(end:number)=>{pushCell();if(rows.length>=1500)throw Error('phase183_too_many_rows');rows.push({cells,start,end});cells=[];start=end;};
 for(;pos<s.length;pos++){
  const ch=s[pos];
  if(quoted){if(ch==='"'){
   if(s[pos+1]==='"'){value+='"';pos++;}else{quoted=false;afterQuote=true;}
  }else{value+=ch;}continue;}
  if(afterQuote&&ch!==','&&ch!=='\r'&&ch!=='\n')throw Error('phase183_bad_quoted_csv');
  if(ch==='"'){if(!fieldStart)throw Error('phase183_bad_csv_quote');quoted=true;fieldStart=false;continue;}
  if(ch===','){pushCell();continue;}
  if(ch==='\r'||ch==='\n'){
   if(ch==='\r'&&s[pos+1]==='\n')pos++;
   pushRow(pos+1);continue;
  }
  if(ch==='\u0000')throw Error('phase183_nul');
  if(ch!==' '||!fieldStart)fieldStart=false;
  value+=ch;
  if(value.length>20000)throw Error('phase183_csv_cell_too_large');
 }
 if(quoted)throw Error('phase183_unclosed_csv_quote');
 if(value!==''||cells.length||afterQuote)pushRow(s.length);
 return rows;
}
/** Read-only schema inspection for an authorized local source snapshot.
 * No semantic approval, rights grant or model identity inference is implied. */
export function inspectTechnicalCsv183(csvBytes:Uint8Array):{
 headers:readonly string[];rows:readonly {rowNumber:number;cells:readonly string[];
 byteStart:number;byteEnd:number;rowSha256:string;}[];documentSha256:string;}{
 if(!(csvBytes instanceof Uint8Array)||csvBytes.byteLength<15||csvBytes.byteLength>650_000)
  throw Error('phase183_invalid_csv_size');
 let text:string;try{text=new TextDecoder('utf-8',{fatal:true}).decode(csvBytes);}catch{throw Error('phase183_invalid_utf8');}
 const bom=text.charCodeAt(0)===0xfeff?3:0;if(bom)text=text.slice(1);
 const rows=parseCsv183(text);
 if(rows.length<2)throw Error('phase183_no_data_rows');
 const headers=rows[0].cells.map(x=>x.value.trim());
 if(headers.some(x=>!columnLabel(x))||new Set(headers).size!==headers.length)throw Error('phase183_invalid_headers');
 if(rows.some(x=>x.cells.length!==headers.length))throw Error('phase183_ragged_rows');
 const records=rows.slice(1).map((r,i)=>{
  const byteStart=bom+Buffer.byteLength(text.slice(0,r.start),'utf8');
  const byteEnd=bom+Buffer.byteLength(text.slice(0,r.end),'utf8');
  return {rowNumber:i+2,cells:r.cells.map(c=>c.value),byteStart,byteEnd,
   rowSha256:sha(csvBytes.subarray(byteStart,byteEnd))};
 });
 return {headers,rows:records,documentSha256:sha(csvBytes)};
}
export function stageTechnicalTable183(input:{csvBytes:Uint8Array;custody:SourceCustody183;
 scope:ModelScope183;schema:TableSchema183;asOf:string;}):IntakeResult183{
 const {csvBytes,scope,custody,schema}=input;
 if(!(csvBytes instanceof Uint8Array)||csvBytes.byteLength<15||csvBytes.byteLength>650_000||
  !utc(input.asOf)||!identity(scope?.variantId)||!identity(scope?.categoryId)||
  typeof scope.brand!=='string'||!scope.brand.trim()||scope.brand.length>150||
  typeof scope.modelNumber!=='string'||!scope.modelNumber.trim()||scope.modelNumber.length>150||
  /[*#?]/.test(scope.modelNumber)||!custody||!identity(custody.sourceId)||
  !officialUrl(custody.sourceUrl)||!officialUrl(custody.licenseUrl)||
  !identity(custody.rightsReviewReference)||!identity(custody.sourceRevision)||
  !identity(custody.protocolId)||!identity(custody.protocolVersion)||!identity(custody.market)||
  !utc(custody.obtainedAt)||!utc(custody.rightsReviewedAt)||
  Date.parse(custody.obtainedAt)>Date.parse(input.asOf)||Date.parse(custody.rightsReviewedAt)>Date.parse(input.asOf)||
  custody.acquisition!=='operator_supplied_offline_copy'||
  custody.permissionStatus!=='operator_reviewed_local_fact_storage'||
  !['certification_registry_manufacturer_reported','independent_original_test_table','manufacturer_specification'].includes(custody.sourceRole)||
  !schema||typeof schema.brandColumn!=='string'||typeof schema.modelColumn!=='string'||
  !Array.isArray(schema.measurements)||schema.measurements.length<1||schema.measurements.length>30)
  throw Error('phase183_invalid_intake_contract');
 const keys=[schema.brandColumn,schema.modelColumn,...schema.measurements.map(x=>x.column)];
 if(keys.some(x=>!columnLabel(x))||new Set(keys).size!==keys.length||
  schema.measurements.some(m=>!identity(m.dimensionKey)||!identity(m.unit)||
   m.decimalSeparator!==undefined&&!['.',','].includes(m.decimalSeparator)||
   !Number.isFinite(m.min)||!Number.isFinite(m.max)||m.min>=m.max||
   m.min < -1e12||m.max>1e12)||
  new Set(schema.measurements.map(m=>m.dimensionKey)).size!==schema.measurements.length)throw Error('phase183_invalid_schema');
 const bytesHash=sha(csvBytes);
 const deny=(reason:string):IntakeResult183=>{
  const base={phase:183 as const,schema:'183.intake.1' as const,categoryId:scope.categoryId,
   variantId:scope.variantId,documentSha256:bytesHash,sourceRole:custody.sourceRole,
   sourceId:custody.sourceId,status:'blocked' as const,reason,observations:[] as StagedObservation183[],
   rightsDeclaredByOperatorOnly:true as const,independentScienceReviewed:false as const,
   canonicalProductKnowledgeUpdated:false as const,rankingAuthorized:false as const};
  return {...base,resultHash:sha(JSON.stringify(base))};
 };
 let text:string;
 try{text=new TextDecoder('utf-8',{fatal:true}).decode(csvBytes);}catch{return deny('invalid_utf8');}
 if(text.charCodeAt(0)===0xfeff)text=text.slice(1); // BOM allowed; row offsets remain from source byte encoding.
 let rows:CsvRow[];
 try{rows=parseCsv183(text);}catch{return deny('malformed_or_unbounded_csv');}
 if(rows.length<2)return deny('no_data_rows');
 const header=rows[0].cells.map(c=>c.value.trim());
 if(new Set(header).size!==header.length||header.some(x=>!columnLabel(x)))return deny('invalid_or_duplicate_headers');
 if(rows.some(r=>r.cells.length!==header.length))return deny('ragged_rows');
 const indexes=keys.map(x=>header.indexOf(x));
 if(indexes.some(n=>n<0))return deny('required_columns_missing');
 const matches=rows.slice(1).map((r,i)=>({r,i:i+2})).filter(({r})=>
  normalize(r.cells[indexes[0]].value)===normalize(scope.brand)&&
  normalize(r.cells[indexes[1]].value)===normalize(scope.modelNumber));
 if(matches.length!==1)return deny(matches.length?'ambiguous_duplicate_exact_model':'exact_model_not_found');
 const {r,i}=matches[0];const observations:StagedObservation183[]=[];
 for(let j=0;j<schema.measurements.length;j++){
  const m=schema.measurements[j],raw=r.cells[indexes[j+2]].value.trim();
  // Only a plain scalar can become a measurement. No unit inference,
  // ambiguous ranges, wildcards or locale-dependent decimal parsing.
  const comma=m.decimalSeparator===',';
  // A comma must be an expressly declared decimal separator, never guessed
  // from a data value and never interpreted as a thousands separator.
  const numericGrammar=comma?/^(?:0|[1-9]\d{0,10})(?:,\d{1,2})?$/:/^(?:0|[1-9]\d{0,10})(?:\.\d{1,8})?$/;
  if(!numericGrammar.test(raw))return deny(`missing_or_ambiguous_measurement:${m.dimensionKey}`);
  const n=Number(comma?raw.replace(',','.'):raw);
  if(!Number.isFinite(n)||n<m.min||n>m.max)return deny(`out_of_range:${m.dimensionKey}`);
  // Offsets refer to bytes in the ORIGINAL UTF-8 document (works with BOM/newlines).
  const start=Buffer.byteLength(text.slice(0,r.start),'utf8')+(csvBytes.byteLength-Buffer.byteLength(text,'utf8'));
  const end=Buffer.byteLength(text.slice(0,r.end),'utf8')+(csvBytes.byteLength-Buffer.byteLength(text,'utf8'));
  const exactRow=csvBytes.subarray(start,end);
  const base={variantId:scope.variantId,dimensionKey:m.dimensionKey,value:n,unit:m.unit,
   sourceColumn:m.column,sourceRow:i,sourceId:custody.sourceId,sourceUrl:custody.sourceUrl,
   sourceRole:custody.sourceRole,protocolId:custody.protocolId,protocolVersion:custody.protocolVersion,
   sourceRevision:custody.sourceRevision,documentSha256:bytesHash,rowSha256:sha(exactRow),
   rowByteStart:start,rowByteEnd:end};
  observations.push({...base,observationId:`claim_${sha(JSON.stringify(base)).slice(0,32)}`,
   status:'quarantined_original_source_claim',independentPerformanceProven:false,rankingAuthorized:false});
 }
 const base={phase:183 as const,schema:'183.intake.1' as const,categoryId:scope.categoryId,
  variantId:scope.variantId,documentSha256:bytesHash,sourceRole:custody.sourceRole,
  sourceId:custody.sourceId,status:'staged_unreviewed' as const,reason:'requires_variant_protocol_rights_and_independent_scientific_review',
  observations,rightsDeclaredByOperatorOnly:true as const,independentScienceReviewed:false as const,
  canonicalProductKnowledgeUpdated:false as const,rankingAuthorized:false as const};
 return {...base,resultHash:sha(JSON.stringify(base))};
}
/** Re-checks exact local bytes before handing a claim to a human reviewer.
 * The content never enters ranking through this function. */
export function verifyStagedSpan183(result:IntakeResult183,csvBytes:Uint8Array):boolean{
 if(!result||result.phase!==183||result.schema!=='183.intake.1'||
  !Array.isArray(result.observations)||result.rankingAuthorized!==false||
  result.canonicalProductKnowledgeUpdated!==false||result.independentScienceReviewed!==false||
  !(csvBytes instanceof Uint8Array)||sha(csvBytes)!==result.documentSha256)return false;
 const {resultHash,...payload}=result;
 if(sha(JSON.stringify(payload))!==resultHash)return false;
 return result.observations.every(o=>o.status==='quarantined_original_source_claim'&&
  o.documentSha256===result.documentSha256&&o.sourceId===result.sourceId&&
  o.variantId===result.variantId&&o.independentPerformanceProven===false&&o.rankingAuthorized===false&&
  Number.isSafeInteger(o.rowByteStart)&&Number.isSafeInteger(o.rowByteEnd)&&
  o.rowByteStart>=0&&o.rowByteEnd<=csvBytes.byteLength&&o.rowByteEnd>o.rowByteStart&&
  sha(csvBytes.subarray(o.rowByteStart,o.rowByteEnd))===o.rowSha256);
}

/** Bridge back to the actual Phase182 research jobs. A tabular source arriving
 * via an operator's permitted local copy must answer the exact requested model
 * and, for a missing-test job, the actual missing dimension. A valid plan hash
 * is an integrity check, not proof that this user has publishing authority.
 */
import type {ResearchPlan182} from './phase182_gap_research_orchestrator.js';
export interface LinkedIntake183 {
 jobId:string;planHash:string;input:IntakeResult183;
 pendingScientificReview:true;catalogPromotionAuthorized:false;
}
export function stageForResearchJob183(args:{plan:ResearchPlan182;jobId:string;
 csvBytes:Uint8Array;custody:SourceCustody183;scope:ModelScope183;
 schema:TableSchema183;operatorSourceUrl:string;}):LinkedIntake183{
 const {plan:p}=args;
 if(!p||p.phase!==182||p.schema!=='182.1'||p.planningOnly!==true||
  p.rankingAuthorized!==false||p.hardExclusionsAuthorized!==false||
  !Array.isArray(p.jobs)||p.jobs.length>100)throw Error('phase183_invalid_prior_plan');
 const {planHash,...body}=p;
 if(sha(JSON.stringify(body))!==planHash)throw Error('phase183_prior_plan_integrity_failed');
 const job=p.jobs.find(j=>j.jobId===args.jobId);
 if(!job||job.kind!=='exact_variant_source_research'||job.exactVariantId!==args.scope.variantId||
  p.categoryId!==args.scope.categoryId||p.market!==args.custody.market||
  job.authority!=='research_only'||job.status!=='queued'||
  job.gapKind==='missing_test'&&(!job.criterionId||
   !args.schema.measurements.some(m=>m.dimensionKey===job.criterionId))||
  args.operatorSourceUrl!==args.custody.sourceUrl)throw Error('phase183_job_source_or_variant_mismatch');
 const input=stageTechnicalTable183({...args,asOf:p.asOf});
 return {jobId:job.jobId,planHash,pendingScientificReview:true,
  catalogPromotionAuthorized:false,input};
}

export interface ClaimRevision183 {
 sequence:number;priorHash:string;intakeHash:string;documentSha256:string;
 criterionValues:readonly {dimensionKey:string;value:number;unit:string;protocolVersion:string;observationId:string;}[];
 reviewState:'conflict_requires_review'|'pending_independent_review';eventHash:string;
}
export interface IntakeJournal183 {
 phase:183;schema:'183.journal.1';categoryId:string;variantId:string;
 revision:number;events:readonly ClaimRevision183[];snapshotHash:string;
 scientificallyApproved:false;rankingAuthorized:false;
}
const initialJournal183=(categoryId:string,variantId:string)=>sha(JSON.stringify(['phase183',categoryId,variantId]));
export function openIntakeJournal183(categoryId:string,variantId:string):IntakeJournal183{
 if(!identity(categoryId)||!identity(variantId))throw Error('phase183_invalid_journal_ids');
 return {phase:183,schema:'183.journal.1',categoryId,variantId,revision:0,events:[],
  snapshotHash:initialJournal183(categoryId,variantId),scientificallyApproved:false,rankingAuthorized:false};
}
function verifyJournal183(j:IntakeJournal183):void{
 if(!j||j.phase!==183||j.schema!=='183.journal.1'||!identity(j.categoryId)||!identity(j.variantId)||
  !Number.isSafeInteger(j.revision)||j.revision<0||j.revision>2000||!Array.isArray(j.events)||
  j.events.length!==j.revision||j.scientificallyApproved!==false||j.rankingAuthorized!==false)
  throw Error('phase183_invalid_journal');
 let prev=initialJournal183(j.categoryId,j.variantId);
 for(let i=0;i<j.events.length;i++){
  const e=j.events[i];if(!e||e.sequence!==i+1||e.priorHash!==prev||
   !/^[0-9a-f]{64}$/.test(e.documentSha256)||!/^[0-9a-f]{64}$/.test(e.intakeHash)||
   !Array.isArray(e.criterionValues)||e.criterionValues.length>30||
   e.criterionValues.some((v:ClaimRevision183['criterionValues'][number])=>!identity(v.dimensionKey)||!identity(v.unit)||!identity(v.protocolVersion)||
    typeof v.value!=='number'||!Number.isFinite(v.value)||!/^claim_[0-9a-f]{32}$/.test(v.observationId))||
   !['conflict_requires_review','pending_independent_review'].includes(e.reviewState))throw Error('phase183_corrupted_history');
  const {eventHash,...remainder}=e;
  if(sha(JSON.stringify(remainder))!==eventHash)throw Error('phase183_corrupted_history');
  prev=eventHash;
 }
 if(prev!==j.snapshotHash)throw Error('phase183_corrupted_history');
}
/** Appending a new revision never overwrites old measurements. Divergent
 * values, units or protocol versions yield a conspicuous reviewer conflict.
 * Even non-conflicting revisions are *not* science approval. */
export function appendStagedIntake183(args:{journal:IntakeJournal183;intake:IntakeResult183;
 sourceBytes:Uint8Array;expectedRevision:number;expectedHash:string;}):IntakeJournal183{
 const {journal:j,intake:r}=args;verifyJournal183(j);
 if(args.expectedRevision!==j.revision||args.expectedHash!==j.snapshotHash)
  throw Error('phase183_stale_journal');
 if(j.categoryId!==r.categoryId||j.variantId!==r.variantId||r.status!=='staged_unreviewed'||
  !r.observations.length||!verifyStagedSpan183(r,args.sourceBytes))throw Error('phase183_untrusted_intake');
 if(j.events.some(e=>e.intakeHash===r.resultHash))return structuredClone(j);
 if(j.revision>=2000)throw Error('phase183_journal_full');
 const historical=new Map<string,{value:number;unit:string;protocolVersion:string}>();
 for(const e of j.events)for(const v of e.criterionValues)historical.set(v.dimensionKey,v);
 const measurements=r.observations.map(o=>({dimensionKey:o.dimensionKey,value:o.value,unit:o.unit,
  protocolVersion:o.protocolVersion,observationId:o.observationId}));
 const conflict=measurements.some(v=>{const h=historical.get(v.dimensionKey);
  return h&&(h.value!==v.value||h.unit!==v.unit||h.protocolVersion!==v.protocolVersion);
 });
 const base:Omit<ClaimRevision183,'eventHash'>={sequence:j.revision+1,priorHash:j.snapshotHash,
  intakeHash:r.resultHash,documentSha256:r.documentSha256,criterionValues:measurements,
  reviewState:conflict?'conflict_requires_review':'pending_independent_review'};
 const event={...base,eventHash:sha(JSON.stringify(base))};
 return {...j,revision:j.revision+1,events:[...j.events.map(x=>structuredClone(x)),event],snapshotHash:event.eventHash};
}
