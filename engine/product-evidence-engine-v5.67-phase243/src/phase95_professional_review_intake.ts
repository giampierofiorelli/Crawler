/**
 * Phase95: professional ORIGINAL review ingestion, not manufacturer specifications.
 * Transient HTML -> bounded deterministic interpretation -> Phase69 source checks
 * -> Phase70 evidence matrix. No article text, model prompt or rating is persisted.
 * Rules are intentionally narrow: this initial adapter recognizes a single-model
 * review's explicit continuous battery duration. Other criteria need reviewed
 * source-/method-specific extractors before they can enter this channel.
 */
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readApprovedSource,type SourceTransport,type TransientWebClaim} from './approved_web_reader.js';
import {planWebEvidenceAcquisition,type WebCandidate,type WebSourcePolicy} from './web_evidence_acquisition.js';
import {buildCategoryEvidenceMatrix,type CategoryFieldRegistry,type ProposedStructuredFact,
 type QuarantinedMatrixObservation} from './category_evidence_matrix.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
const id=(s:unknown)=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,119}$/.test(s);
interface RawFact {field_key:string;number:number;unit:string;usage:string;literal:string;anchor:string;}
interface ParserResult {model:string;article_type:string;facts:RawFact[];source_html_saved:false;}

async function parseReviewHtml(body:string,expectedModel:string,comparisonModels?:readonly string[]):Promise<ParserResult> {
 if(Buffer.byteLength(body,'utf8')>750_000)throw Error('review_input_cap');
 const raw=JSON.stringify({html:body,expected_model:expectedModel,comparison_models:comparisonModels});
 return new Promise((resolveResult,reject)=>{
  const child=spawn('python3',['-m','phase95.review_html'],{
   cwd:root,env:{...process.env,PYTHONPATH:root},shell:false,stdio:['pipe','pipe','ignore']});
  let output='',settled=false;
  const timer=setTimeout(()=>{child.kill();finish(Error('review_parser_timeout'));},15000);
  function finish(e?:Error,v?:ParserResult){if(settled)return;settled=true;clearTimeout(timer);
   if(e)reject(e);else resolveResult(v!);}
  child.on('error',e=>finish(e));
  child.stdout.on('data',(buf:Buffer)=>{output+=buf.toString('utf8');
   if(output.length>30_000){child.kill();finish(Error('review_parser_output_cap'));}});
  child.stdin.on('error',()=>{});
  child.on('close',code=>{
   try{const r=JSON.parse(output) as {ok:boolean;result:ParserResult;error?:string};
    if(code!==0||!r.ok)finish(Error(String(r.error??'review_parser_failed')));
    else finish(undefined,r.result);
   }catch{finish(Error('invalid_review_parser_result'));}
  });
  child.stdin.end(raw);
 });
}
export type ReviewIntakeResult={
 purpose:'original_professional_review_evidence';
 status:'quarantined'|'blocked';sourceUrl:string;sourceSha256:string|null;
 observations:QuarantinedMatrixObservation[];reasons:string[];
 testedModel:string;originalTestId:string|null;
 parsedCount:number;localModelCalls:0;sourceTextStored:false;
 rankingEligible:false;publicationReady:false;
};

/** All remote retrieval is delegated to the existing secure Phase69 reader. */
export async function acquireOriginalProfessionalReview(args:{
 registry:CategoryFieldRegistry;candidate:WebCandidate;policy:WebSourcePolicy;
 asOf:string;expectedModel:string;methodId:string;methodVersion:string;
 /** Honest experimental description. Does not imply that a publisher verified it. */
 transport?:SourceTransport;
 comparisonModels?:readonly string[];
}):Promise<ReviewIntakeResult>{
 const {candidate,registry,policy,asOf,expectedModel}=args;
 const out:ReviewIntakeResult={purpose:'original_professional_review_evidence',status:'blocked',
  sourceUrl:candidate?.url??'',sourceSha256:null,observations:[],reasons:[],
  testedModel:expectedModel,originalTestId:candidate?.originalTestId??null,
  parsedCount:0,localModelCalls:0,sourceTextStored:false,rankingEligible:false,publicationReady:false};
 if(!candidate||candidate.kind!=='original_professional_test'||
    !id(candidate.originalTestId)||!candidate.lineageAttestationReference||
    !registry||!Array.isArray(registry.fields)||!id(args.methodId)||!id(args.methodVersion)||
    typeof expectedModel!=='string'||expectedModel.length>100){
  out.reasons=['unverified_original_review_or_method_identity'];return out;
 }
 const f=registry.fields.find(x=>x.key==='continuous_battery_hours');
 if(!f||f.type!=='number'||f.unit!=='hours'||
    !f.permittedOrigins.includes('independent_lab_measurement')||
    !f.requiresProtocol||!f.contextKeys.includes('usage')||f.contextKeys.length!==1){
  out.reasons=['reviewed_original_test_field_not_available'];return out;
 }
 const plan=planWebEvidenceAcquisition({exactVariantId:candidate.exactVariantId,
  userQuestion:'Find original, criterion-specific professional laboratory results',
  asOf,maxDaysSinceCheck:7,candidates:[candidate],existing:[],policies:[policy]});
 const item=plan.items[0];
 if(item?.action!=='retrieve_for_research'){
  out.reasons=item?.reasons??['acquisition_not_planned'];return out;
 }
 const proposed:ProposedStructuredFact[]=[];
 let parserError:string|null=null;
 const read=await readApprovedSource({plan,queueItem:item,candidate,policy,
  checkedAt:asOf,transport:args.transport,transientClaimExtractor:async body=>{
   try{
    const parsed=await parseReviewHtml(body,expectedModel,args.comparisonModels);
    if(parsed.model!==expectedModel||!['single_product_professional_review','multi_product_comparison'].includes(parsed.article_type)||
     parsed.source_html_saved!==false||parsed.facts.length>5)throw Error('unexpected_parser_data');
    if(!parsed.facts.length)throw Error('no_supported_original_test_observation');
    const claims:TransientWebClaim[]=[];
    for(const [n,fact] of parsed.facts.entries()){
     if(fact.field_key!=='continuous_battery_hours'||fact.unit!=='hours'||
       !['anc_on','unspecified'].includes(fact.usage)||!Number.isFinite(fact.number)||
       fact.number<=0||fact.number>200||!body.includes(fact.anchor)||
       !fact.anchor.includes(fact.literal)||!/\d/.test(fact.literal)||
       fact.anchor.length<10||fact.anchor.length>300)throw Error('unanchored_or_invalid_review_fact');
     // Original test method is an independent provenance claim requiring later review.
     // Do not assume matching numeric claims across different methods are comparable.
     const context={usage:fact.usage};
     claims.push({criterionId:fact.field_key,valueText:fact.literal,anchorText:fact.anchor});
     proposed.push({observationId:`review_observation_${n+1}`,fieldKey:fact.field_key,
      origin:'independent_lab_measurement',value:{type:'number',number:fact.number,unit:'hours'},
      context,protocolId:args.methodId,protocolVersion:args.methodVersion,
      valueTextSha256:digest(fact.literal),anchorSha256:digest(fact.anchor)});
    }
    out.parsedCount=proposed.length;
    return claims;
   }catch(e){parserError=e instanceof Error?e.message:'review_parse_failure';throw e;}
  }});
 if(read.status!=='quarantined'){
  out.reasons=[...read.reasons,...(parserError?[`review_${parserError}`]:[])];return out;
 }
 out.sourceSha256=read.evidence.contentSha256;
 const matrix=buildCategoryEvidenceMatrix({registry,candidate,policy,asOf,
  processing:read.evidence,proposed});
 out.reasons=matrix.rejected.map(x=>`${x.observationId}:${x.reason}`);
 if(matrix.rejected.length||matrix.observations.length!==proposed.length){
  out.reasons.unshift('review_matrix_incomplete');return out;
 }
 out.observations=matrix.observations;
 out.status='quarantined';
 return out;
}
