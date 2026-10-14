/** Phase 158: opt-in local model hypotheses aligned to the ORIGINAL document.
 * Local model responses are hints. No rankings, database writes or merges.
 */
import {createHash} from 'node:crypto';
import type {ReaderInput139} from './phase139_unmarked_english_candidate_reader.js';
import {analyzeEnglishReview156} from './phase156_review_document_engine.js';
import {bridgeExtructProductData157} from './phase157_structured_product_bridge.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const isObj=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const allowed=new Set(['product','brand']);
export interface Hypothesis158 {start:number;end:number;surface:string;label:'product'|'brand';confidence:number|null;
 alignment:'existing_heuristic_mention'|'new_model_only';heuristicRole:string|null;sourceSha256:string;
 identityVerified:false;scientificEvidence:false;canonicalWriteAuthorized:false;rankingAuthorized:false;}
export interface Coordinated158 {phase:158;documentSha256:string;heuristic:ReturnType<typeof analyzeEnglishReview156>;
 structured:ReturnType<typeof bridgeExtructProductData157>|null;neuralHypotheses:Hypothesis158[];
 neuralModelExecutedWithinPEE:false;localRunnerClaimedExecution:boolean;neuralInputAccepted:boolean;issues:string[];
 sourceAuthenticated:false;identityMergeAuthorized:false;canonicalWriteAuthorized:false;rankingAuthorized:false;}
export function analyzeEnglishReviewWithLocalHints158(input:ReaderInput139,
 localOutput:unknown=null,extructData:unknown=null):Coordinated158 {
 const t=input.document.text;
 if(t.length>2_000_000||sha(t)!==input.document.sha256)throw Error('phase158_document_sha_mismatch');
 const heuristic=analyzeEnglishReview156(input);
 const structured=extructData===null?null:bridgeExtructProductData157(input,extructData);
 const issues:string[]=[];const hints:Hypothesis158[]=[];
 let accepted=false;let ran=false;
 if(localOutput===null){issues.push('offline_neural_checkpoint_not_supplied');}
 else if(!isObj(localOutput)||localOutput.phase!==158||localOutput.runtime!=='offline_local_gliner2'||
   localOutput.sourceSha256!==sha(t)||localOutput.checkpointFilesystemVerified!==true||
   localOutput.scientificEvidence!==false||localOutput.identityMergeAuthorized!==false||
   localOutput.rankingAuthorized!==false||!Array.isArray(localOutput.predictions)){
  issues.push('invalid_or_unbound_local_inference_output');
 } else {
  ran=true;
  if(localOutput.predictions.length>500||localOutput.truncated===true){issues.push('neural_candidate_budget_exceeded');}
  else {accepted=true;
   const unique=new Set<string>();
   for(const v of localOutput.predictions){
    if(!isObj(v)||!Number.isSafeInteger(v.start)||!Number.isSafeInteger(v.end)||
       !allowed.has(String(v.label))||typeof v.surface!=='string'||
       !(v.start as number>=0&&(v.end as number)>(v.start as number)&&(v.end as number)<=t.length)||
       t.slice(v.start as number,v.end as number)!==v.surface||v.surface.length>160||
       (v.confidence!==null&&(typeof v.confidence!=='number'||!Number.isFinite(v.confidence)||v.confidence<0||v.confidence>1))){
     issues.push('unverifiable_neural_span_skipped');continue;
    }
    const key=`${v.start}:${v.end}:${v.label}`;if(unique.has(key))continue;unique.add(key);
    const existing=heuristic.mentions.find(m=>m.span.start===v.start&&m.span.end===v.end);
    hints.push({start:v.start as number,end:v.end as number,surface:v.surface,label:v.label as 'product'|'brand',
     confidence:v.confidence as number|null,alignment:existing?'existing_heuristic_mention':'new_model_only',
     heuristicRole:existing?.role??null,sourceSha256:sha(t),identityVerified:false,scientificEvidence:false,
     canonicalWriteAuthorized:false,rankingAuthorized:false});
   }
  }
 }
 if(hints.some(v=>v.alignment==='new_model_only'))issues.push('model_only_spans_require_human_or_independent_verification');
 if(structured?.truncated)issues.push('structured_metadata_truncated');
 return {phase:158,documentSha256:sha(t),heuristic,structured,neuralHypotheses:hints,
  neuralModelExecutedWithinPEE:false,localRunnerClaimedExecution:ran,neuralInputAccepted:accepted,issues:[...new Set(issues)].sort(),sourceAuthenticated:false,
  identityMergeAuthorized:false,canonicalWriteAuthorized:false,rankingAuthorized:false};
}
