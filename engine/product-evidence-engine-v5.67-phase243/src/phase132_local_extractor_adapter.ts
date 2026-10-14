/** Offline interchange contract for experiments with optional open-weight/local models.
 * No network, models, package imports, inference, or automatic knowledge promotion.
 * An untrusted model's proposed spans must match an authenticated-by-caller snapshot;
 * matching a digest does NOT independently authenticate the publisher.
 */
import {createHash} from 'node:crypto';
import {screenRelationContext132, type Label132, type Span132} from './phase132_contextual_relation_guard.js';
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
export interface OfflineModelCandidate132 {
  modelId:string; modelDigest:string;
  sourceId:string; originalDocumentId:string; documentSha256:string;
  subject:Span132; object:Span132; evidence:Span132;
  predictedRelation:Label132; providerRawScore?:number;
}
export interface OfflineSource132 {sourceId:string;originalDocumentId:string; text:string;sha256:string}
/** Supplied by our OWN reviewed registry, NOT by the model output. */
export interface ApprovedLocalModel132 {modelId:string;modelDigest:string;licenseReviewed:string;localOnly:true}
export type OfflineReview132={status:'rejected'|'requires_human_review';reasons:string[];
  label:Label132; subject?:string;object?:string;evidence?:string;
  sourceId:string; modelId:string; knowledgeWriteAuthorized:false; rankingAuthorized:false;
  semanticPolicyVersion:'132.1'};
const isSpan=(t:string,s:Span132)=>s&&Number.isSafeInteger(s.start)&&Number.isSafeInteger(s.end)&&s.start>=0&&s.end>s.start&&s.end<=t.length;
export function inspectLocalCandidate132(x:OfflineModelCandidate132,source:OfflineSource132,approvedModels:readonly ApprovedLocalModel132[]):OfflineReview132 {
 if(!x||!source||!x.modelId||!x.sourceId||!x.originalDocumentId)throw Error('incomplete_offline_candidate');
 if(!['measures','contributes_to','conditioned_on','not_evidence_of'].includes(x.predictedRelation))throw Error('unsupported_relation_label');
 const initial:OfflineReview132={status:'rejected',reasons:[],label:x.predictedRelation,
  sourceId:x.sourceId,modelId:x.modelId,knowledgeWriteAuthorized:false,rankingAuthorized:false,
  semanticPolicyVersion:'132.1'};
 const reasons:string[]=[];
 if(!/^[a-f0-9]{64}$/.test(x.modelDigest)||!approvedModels?.some(m=>m.modelId===x.modelId&&m.modelDigest===x.modelDigest&&m.localOnly===true&&!!m.licenseReviewed))reasons.push('unreviewed_model_metadata');
 if(x.sourceId!==source.sourceId||x.originalDocumentId!==source.originalDocumentId||
    x.documentSha256!==source.sha256||source.sha256!==digest(source.text))reasons.push('source_identity_mismatch');
 if(!isSpan(source.text,x.subject)||!isSpan(source.text,x.object)||!isSpan(source.text,x.evidence))reasons.push('invalid_spans');
 if(reasons.length)return {...initial,reasons};
 if(x.subject.start<x.evidence.start||x.subject.end>x.evidence.end||x.object.start<x.evidence.start||x.object.end>x.evidence.end)
   return {...initial,reasons:['entity_not_in_evidence']};
 const ctx=screenRelationContext132({text:source.text.slice(x.evidence.start,x.evidence.end),
  subject:{start:x.subject.start-x.evidence.start,end:x.subject.end-x.evidence.start},
  object:{start:x.object.start-x.evidence.start,end:x.object.end-x.evidence.start},label:x.predictedRelation});
 const out={...initial,subject:source.text.slice(x.subject.start,x.subject.end),object:source.text.slice(x.object.start,x.object.end),
  evidence:source.text.slice(x.evidence.start,x.evidence.end)};
 if(!ctx.allowHypothesis)return {...out,reasons:ctx.reasons};
 return {...out,status:'requires_human_review',reasons:ctx.qualifiers.map(q=>'qualifier_'+q)};
}
