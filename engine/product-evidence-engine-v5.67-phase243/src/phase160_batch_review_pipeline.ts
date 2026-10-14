/** Phase160: offline, source-bound, batch-capable orchestration.
 * This module never authenticates source rights/checkpoints, writes scientific
 * evidence, merges product identities, or changes ranking.
 */
import {createHash} from 'node:crypto';
import {analyzeEnglishReview156} from './phase156_review_document_engine.js';
import {analyzeGLiNER25ColabCase159} from './phase159_colab_gliner25_coordinator.js';
import {reviewRelationCandidates163} from './phase163_relation_candidate_bridge.js';
import type {CheckedRelation163} from './phase163_relation_candidate_bridge.js';
import type {ReaderInput139} from './phase139_unmarked_english_candidate_reader.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const idOk=(s:unknown):s is string=>typeof s==='string'&&/^[a-z0-9_]{1,50}$/.test(s);
const sourceOk=(s:unknown):s is string=>typeof s==='string'&&/^https:\/\/[a-z0-9][a-z0-9.-]+\/[a-z0-9/?=&%_.+\-#]*$/i.test(s)&&s.length<=2000;
export type DocKind160='constructed'|'published_short_excerpt'|'rights_permitted_full_review';
export type Rights160='constructed_original'|'short_citation_research'|'document_owner'|'permission_granted'|'public_domain';
export interface BatchDoc160 {id:string;kind:DocKind160;rightsBasis:Rights160;rightsStatement:string;
  category:string;sourceTitle:string;sourceUrl:string;sourceRole:'original_product_test'|'manufacturer_specification'|'original_expert_method'|'user_problem_report';
  text:string;sha256:string;independentGoldAvailable?:boolean;}
export interface BatchManifest160 {protocol:'pee.phase160.batch.v1';datasetId:string;documents:BatchDoc160[];}
interface RawCase160 {input:string;entities:Record<string,any>;source_url?:string;source_title?:string;source_sha256?:string;seconds_inference:number;offset_errors:unknown[];relation_candidates?:unknown;relation_extraction_status?:unknown;}
export interface ExternalNeuralBatch160 {model_id:string;model_architecture:string;gliner2_version:string;
  model_integration_status:string;case_status?:string;cases:Record<string,RawCase160>;}
export interface BatchOutcome160 {protocol:'pee.phase160.results.v1';datasetId:string;docCount:number;
  mode:'native_only'|'native_and_external_neural'|'mixed';cases:{id:string;kind:DocKind160;category:string;
  sourceUrl:string;documentSha256:string;neuralProcessed:boolean;nativeMentionCount:number;
  nativeMeasurementCount:number;nativeRelationCount:number;neuralSpanCount:number;neuralRelationCount:number;relationCandidates:CheckedRelation163[];
  roleSummaries:{surface:string;status:string}[];featureValueSummaries:{feature:string;value:string;assignment:string}[];
  unresolved:string[];result:'processed'|'quarantined';error?:string;independentlyAnnotated:false;
  sourceAuthenticated:false;canonicalWriteAuthorized:false;rankingAuthorized:false;}[];
  safety:{scientificEvidenceApproved:false;sourceRightsAuthenticated:false;checkpointAuthenticated:false;
    modelQualityBenchmark:false;identityMergeAuthorized:false;canonicalWriteAuthorized:false;rankingAuthorized:false;};}
const allowedRights=(kind:DocKind160,right:Rights160)=>kind==='constructed'?right==='constructed_original':
 kind==='published_short_excerpt'?right==='short_citation_research':
 ['document_owner','permission_granted','public_domain'].includes(right);
function validateDoc(v:BatchDoc160,ids:Set<string>):void {
 if(!v||!idOk(v.id)||ids.has(v.id))throw Error('phase160_invalid_or_duplicate_document_id');ids.add(v.id);
 if(!['constructed','published_short_excerpt','rights_permitted_full_review'].includes(v.kind)||
  !allowedRights(v.kind,v.rightsBasis)||typeof v.rightsStatement!=='string'||v.rightsStatement.length<8||v.rightsStatement.length>500)
  throw Error(`phase160_invalid_rights_declaration:${v.id}`);
 if(!sourceOk(v.sourceUrl)||typeof v.sourceTitle!=='string'||!v.sourceTitle.trim()||v.sourceTitle.length>300||
  !['original_product_test','manufacturer_specification','original_expert_method','user_problem_report'].includes(v.sourceRole)||
  typeof v.category!=='string'||v.category.length>70||!v.category.trim())throw Error(`phase160_invalid_source_metadata:${v.id}`);
 if(typeof v.text!=='string'||!v.text.trim()||v.text.length>120000||
  (v.kind==='published_short_excerpt'&&v.text.length>500)||v.sha256!==sha(v.text))
  throw Error(`phase160_document_digest_or_length_invalid:${v.id}`);
 if(v.independentGoldAvailable===true)throw Error('phase160_independent_annotation_proof_not_in_contract');
}
export interface OfflineWorkerAudit161 { protocol:'pee.phase161.worker.v1';datasetId:string;checkpoint_fingerprint:string;
 checkpointAuthenticated:false;rankingAuthorized:false;scientificEvidenceApproved:false;identityMergeAuthorized:false;
 processed:number;totalDocuments:number;document_sha256:Record<string,string>;failures:Record<string,string>;}
export function runReviewBatch160(manifest:BatchManifest160,neural?:ExternalNeuralBatch160,workerAudit?:OfflineWorkerAudit161):BatchOutcome160 {
 if(!manifest||manifest.protocol!=='pee.phase160.batch.v1'||!idOk(manifest.datasetId)||
  !Array.isArray(manifest.documents)||manifest.documents.length<1||manifest.documents.length>100)
  throw Error('phase160_invalid_manifest');
 const ids=new Set<string>();for(const v of manifest.documents)validateDoc(v,ids);
 if(neural&&(neural.model_id!=='fastino/gliner2.5-small-v1'||neural.model_architecture!=='boundary'||
  !['standalone_colab_not_connected_to_PEE','local_offline_worker_not_connected_to_PEE'].includes(neural.model_integration_status)||
  !/^\d+\.\d+\.\d+$/.test(neural.gliner2_version)||!neural.cases||typeof neural.cases!=='object'||
  Object.keys(neural.cases).length>100||Object.keys(neural.cases).some(x=>!ids.has(x))))
  throw Error('phase160_untrusted_external_neural_batch');
 if(neural?.model_integration_status==='local_offline_worker_not_connected_to_PEE'){
  if(!workerAudit||workerAudit.protocol!=='pee.phase161.worker.v1'||
   workerAudit.datasetId!==manifest.datasetId||!(/^[0-9a-f]{64}$/.test(workerAudit.checkpoint_fingerprint))||
   workerAudit.checkpointAuthenticated!==false||workerAudit.rankingAuthorized!==false||
   workerAudit.scientificEvidenceApproved!==false||workerAudit.identityMergeAuthorized!==false||
   workerAudit.totalDocuments!==manifest.documents.length||workerAudit.processed!==Object.keys(neural.cases).length||
   !workerAudit.document_sha256||!workerAudit.failures||
   Object.keys(workerAudit.document_sha256).length!==manifest.documents.length||
   manifest.documents.some(d=>workerAudit.document_sha256[d.id]!==d.sha256)||
   Object.keys(workerAudit.failures).some(k=>!ids.has(k)||Object.hasOwn(neural.cases,k))||
   Object.keys(workerAudit.failures).length+workerAudit.processed!==manifest.documents.length)
   throw Error('phase161_missing_or_mismatched_worker_audit');
 }
 const cases:BatchOutcome160['cases']=[];let neuralCount=0;
 for(const doc of manifest.documents){
  const input:ReaderInput139={document:{text:doc.text,sha256:doc.sha256,
   source:{id:doc.id,originalDocumentId:doc.id,url:doc.sourceUrl,title:doc.sourceTitle,role:doc.sourceRole}}};
  const record:BatchOutcome160['cases'][number]={id:doc.id,kind:doc.kind,category:doc.category,
   sourceUrl:doc.sourceUrl,documentSha256:doc.sha256,neuralProcessed:false,nativeMentionCount:0,
   nativeMeasurementCount:0,nativeRelationCount:0,neuralSpanCount:0,neuralRelationCount:0,relationCandidates:[],roleSummaries:[],featureValueSummaries:[],
   unresolved:[],result:'processed',independentlyAnnotated:false,sourceAuthenticated:false,
   canonicalWriteAuthorized:false,rankingAuthorized:false};
  try{
   const native=analyzeEnglishReview156(input);
   record.nativeMentionCount=native.mentions.length;record.nativeMeasurementCount=native.measurements.length;
   record.nativeRelationCount=native.relations.length;record.unresolved=native.unresolved;
   const caseData=neural?.cases[doc.id];
   if(caseData){
    const expectedStatus=doc.kind==='constructed'?'constructed_diagnostic_not_independent_benchmark':
     doc.kind==='published_short_excerpt'?'published_short_excerpts_not_independent_benchmark':
       'rights_permitted_full_review_unannotated';
    const envelope={model_id:neural!.model_id,model_architecture:neural!.model_architecture,
      gliner2_version:neural!.gliner2_version,model_integration_status:neural!.model_integration_status,
      case_status:expectedStatus,cases:{[doc.id]:caseData}};
    const coordinated=analyzeGLiNER25ColabCase159(input,envelope,doc.id);
    record.neuralProcessed=true;neuralCount++;
    record.neuralSpanCount=coordinated.neuralSpans.length;
    if(caseData.relation_candidates!==undefined||caseData.relation_extraction_status!==undefined){
     if(neural?.model_integration_status!=='local_offline_worker_not_connected_to_PEE')
      throw Error('phase163_relations_require_local_worker_audit');
     record.relationCandidates=reviewRelationCandidates163(doc.text,caseData.relation_candidates,
      caseData.relation_extraction_status,coordinated.neuralSpans);
     record.neuralRelationCount=record.relationCandidates.length;
    }
    record.roleSummaries=coordinated.modelInterpretations.map(x=>({surface:x.surface,status:x.status}));
    record.featureValueSummaries=coordinated.featureValueCandidates.map(x=>({feature:x.feature,value:x.value,assignment:x.assignment}));
    record.unresolved=[...new Set([...record.unresolved,...coordinated.unresolved,
      ...(record.relationCandidates.some(c=>c.entityTypeCheck!=='matched')?['relation_endpoint_not_confirmed_by_entity_spans']:[]),
      ...(record.neuralRelationCount?['neural_relation_hypotheses_not_verified']:[])])].sort();
   }
  }catch(e){record.result='quarantined';record.error=e instanceof Error?e.message:'unknown_error';record.neuralProcessed=false;
    record.neuralSpanCount=0;record.neuralRelationCount=0;record.relationCandidates=[];record.roleSummaries=[];record.featureValueSummaries=[];
    record.unresolved=[...new Set([...record.unresolved,'case_quarantined'])].sort();}
  cases.push(record);
 }
 return {protocol:'pee.phase160.results.v1',datasetId:manifest.datasetId,docCount:cases.length,
  mode:neuralCount===0?'native_only':neuralCount===cases.length?'native_and_external_neural':'mixed',cases,
  safety:{scientificEvidenceApproved:false,sourceRightsAuthenticated:false,checkpointAuthenticated:false,
   modelQualityBenchmark:false,identityMergeAuthorized:false,canonicalWriteAuthorized:false,rankingAuthorized:false}};
}
