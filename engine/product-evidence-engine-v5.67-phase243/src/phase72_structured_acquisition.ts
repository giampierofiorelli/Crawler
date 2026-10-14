/**
 * Phase 72 — proof-of-flow adapter for structured, self-evolving research evidence.
 * Source content is transient, never persisted; publication/ranking never enabled.
 * The shipping parser is strictly deterministic for SBAF-style tabular measurements.
 * An AI-generated candidate can be swapped in ONLY behind a separate, audited,
 * local extractor and source-specific semantic checks. Nothing in this module
 * authorizes browser access or an external AI provider.
 */
import {createHash} from 'node:crypto';
import {readApprovedSource, type SourceTransport, type TransientWebClaim} from './approved_web_reader.js';
import {planWebEvidenceAcquisition, type WebCandidate, type WebSourcePolicy, type KnownWebEvidence, type EvidenceProcessingResult} from './web_evidence_acquisition.js';
import {buildCategoryEvidenceMatrix, type CategoryFieldRegistry, type MatrixFieldDefinition, type ProposedStructuredFact, type QuarantinedMatrixObservation} from './category_evidence_matrix.js';
import {captureSchemaGap,discoverAdaptiveSchema,adaptiveSignature,type AutoResearchCatalog,type GapSignal} from './adaptive_schema_evolution.js';

const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const field:MatrixFieldDefinition={
 key:'relative_frequency_response_db',type:'number',unit:'db_relative',allowedValues:[],
 permittedOrigins:['independent_lab_measurement'],requiresProtocol:true,
 contextKeys:['channel','frequency_hz','measurement_rig']
};
const safeId=(s:string)=>/^[a-z][a-z0-9_]{0,119}$/.test(s);
export const SBAF_FREQUENCY_FIELD:MatrixFieldDefinition=Object.freeze({...field});
export interface TabularFrequencyProfile {
 readonly categoryId:'headphones';
 readonly channel:'left'|'right';
 readonly measurementRig:'minidsp_ears_cear30';
 readonly protocolId:'sbaf_cear30';
 readonly protocolVersion:'compensation_3_02';
 readonly instrumentNotesUrl:string;
}
/** Strict source adapter configuration: the URL/file/rig/version are pre-attested by an operator. */
function profileMatchesCandidate(profile:TabularFrequencyProfile,candidate:WebCandidate):boolean {
 if(profile.categoryId!=='headphones'||!['left','right'].includes(profile.channel)||
    profile.measurementRig!=='minidsp_ears_cear30'||
    profile.protocolId!=='sbaf_cear30'||profile.protocolVersion!=='compensation_3_02'||
    !profile.instrumentNotesUrl.startsWith('https://github.com/superbestaudiofriends/headphone-measurements-frequency-response/'))return false;
 try {
  const path=decodeURIComponent(new URL(candidate.url).pathname);
  return path.endsWith(`-`+(profile.channel==='left'?'L':'R')+'.txt')&&
   /(?:\/|^)cEAR30-[A-Za-z0-9-]+-[LR]\.txt$/.test(path)&&candidate.kind==='original_lab_data'&&
   !!candidate.originalTestId&&!!candidate.lineageAttestationReference;
 }catch{return false;}
}
export interface ParsedTransientMeasurement {claims:TransientWebClaim[];facts:ProposedStructuredFact[];sampledRows:number;totalRows:number;coverage:'sampled_curve_not_suitability_verdict';}
/** Numeric row must directly appear in the source, with no model-created interpolation or scale conversion. */
export function parseTransientFrequencyTable(body:string,profile:TabularFrequencyProfile):ParsedTransientMeasurement {
 if(typeof body!=='string'||body.length>250000||body.length<10||body.includes('\0'))throw Error('Unsupported source text');
 const lines=body.trim().split(/\r?\n/);
 if(lines.length<4||lines.length>1200)throw Error('Unexpected measurement count');
 const rows:{line:string;frequency:number;response:number;frequencyRaw:string;responseRaw:string}[]=[];
 for(const raw of lines){
  const line=raw.trim();
  const m=/^(\d{1,5}(?:\.\d{1,3})?)\s+(-?\d{1,3}(?:\.\d{1,3})?)$/.exec(line);
  if(!m)throw Error('Not a two-column numeric measurement dataset');
  const frequency=Number(m[1]),response=Number(m[2]);
  if(frequency<10||frequency>25000||response< -100||response>100||
     !Number.isFinite(frequency)||!Number.isFinite(response)||
     (rows.length>0&&frequency<=rows[rows.length-1].frequency))throw Error('Non-monotonic or out-of-range measurement');
  rows.push({line,frequency,response,frequencyRaw:m[1],responseRaw:m[2]});
 }
 // Bounded, evenly distributed point sampling: never claim complete-curve coverage.
 const count=Math.min(rows.length,24);
 const indexes=new Set(Array.from({length:count},(_,i)=>Math.round(i*(rows.length-1)/(count-1))));
 const chosen=[...indexes].map(i=>rows[i]);
 const claims:TransientWebClaim[]=[];const facts:ProposedStructuredFact[]=[];
 for(let n=0;n<chosen.length;n++){
  const row=chosen[n];
  const context={channel:profile.channel,frequency_hz:'hz_'+row.frequencyRaw.replace('.','_'),
   measurement_rig:profile.measurementRig};
  if(!Object.values(context).every(safeId))throw Error('Unrepresentable frequency context');
  const observationId=`frequency_observation_${n+1}`;
  claims.push({criterionId:field.key,valueText:row.responseRaw,anchorText:row.line});
  facts.push({observationId,fieldKey:field.key,origin:'independent_lab_measurement',
   value:{type:'number',number:row.response,unit:'db_relative'},context,
   protocolId:profile.protocolId,protocolVersion:profile.protocolVersion,
   valueTextSha256:sha(row.responseRaw),anchorSha256:sha(row.line)});
 }
 return {claims,facts,sampledRows:chosen.length,totalRows:rows.length,coverage:'sampled_curve_not_suitability_verdict'};
}
export type StructuredAcquisitionOutcome= {
 purpose:'experimental_web_to_dynamic_matrix_pipeline';
 status:'blocked'|'quarantined_existing_field'|'quarantined_new_schema_gap';
 reasons:string[];
 sourceUrl:string;
 retrievedContentSha256:string|null;
 observations:QuarantinedMatrixObservation[];
 gapSignals:GapSignal[];
 proposedCatalog:AutoResearchCatalog|null;
 sampledRows:number;
 totalRows:number;
 storedSourceText:false;
 publicationReady:false;
 rankingEligible:false;
};
/** No network if source policy rejects; the injected transport supports offline contract tests. */
export async function acquireStructuredFrequencyEvidence(input:{
 candidate:WebCandidate;policy:WebSourcePolicy;registry:CategoryFieldRegistry;
 profile:TabularFrequencyProfile;asOf:string;
 existing?:readonly KnownWebEvidence[];transport?:SourceTransport;
}):Promise<StructuredAcquisitionOutcome>{
 const {candidate,policy,registry,profile,asOf}=input;
 const out:StructuredAcquisitionOutcome={purpose:'experimental_web_to_dynamic_matrix_pipeline',status:'blocked',
  reasons:[],sourceUrl:candidate.url,retrievedContentSha256:null,observations:[],gapSignals:[],
  proposedCatalog:null,sampledRows:0,totalRows:0,storedSourceText:false,publicationReady:false,rankingEligible:false};
 if(registry.categoryId!==profile.categoryId||!profileMatchesCandidate(profile,candidate)){
  out.reasons=['source_profile_not_attested_or_variant_unmatched'];return out;
 }
 const plan=planWebEvidenceAcquisition({exactVariantId:candidate.exactVariantId,
  userQuestion:'independent source frequency response measurements',asOf,maxDaysSinceCheck:7,
  candidates:[candidate],existing:input.existing??[],policies:[policy]});
 const queued=plan.items[0];
 if(queued.action!=='retrieve_for_research'){
  out.reasons=[...queued.reasons];return out;
 }
 let parsed:ParsedTransientMeasurement|null=null;
 const result=await readApprovedSource({plan,queueItem:queued,candidate,policy,checkedAt:asOf,
  transport:input.transport,transientClaimExtractor:(body)=>{
   parsed=parseTransientFrequencyTable(body,profile);
   return parsed.claims;
  }});
 if(result.status!=='quarantined'||!parsed){
  out.reasons=result.status==='blocked'?result.reasons:['transient_parse_missing'];return out;
 }
 const transient:ParsedTransientMeasurement=parsed;
 out.retrievedContentSha256=result.evidence.contentSha256;
 out.sampledRows=transient.sampledRows;
 out.totalRows=transient.totalRows;
 if(registry.fields.some(f=>f.key===field.key)){
  const registered=registry.fields.find(f=>f.key===field.key)!;
  if(adaptiveSignature({kind:'field',field:registered})!==adaptiveSignature({kind:'field',field})){
   out.reasons=['registered_field_has_incompatible_semantics'];return out;
  }
  const matrix=buildCategoryEvidenceMatrix({registry,candidate,policy,processing:result.evidence,
   asOf,proposed:transient.facts});
  out.observations=matrix.observations;
  out.reasons=matrix.rejected.map(r=>`${r.observationId}:${r.reason}`);
  out.status=matrix.observations.length>0?'quarantined_existing_field':'blocked';
 }else{
  for(const fact of transient.facts){
   const found=captureSchemaGap({registry,proposal:{kind:'field',field},fact,candidate,
    policy,processing:result.evidence,asOf});
   if(found.status==='quarantined_gap_signal')out.gapSignals.push(found.signal);
   else out.reasons.push(`${fact.observationId}:${found.reason}`);
  }
  out.proposedCatalog=discoverAdaptiveSchema(registry,out.gapSignals);
  out.status=out.gapSignals.length>0?'quarantined_new_schema_gap':'blocked';
 }
 // Transient source bytes and raw claim/anchor excerpts do not appear in the output.
 return out;
}
