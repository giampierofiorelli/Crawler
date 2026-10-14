/** Phase196 offline evaluation harness. Metrics describe input labels, not scientific
 * validation. A synthetic label cannot be promoted into original-source proof.
 */
import {type SourceMatrix196} from './phase196_source_intelligence.js';
export type LabelProvenance196='synthetic_fixture'|'research_annotation'|'independently_adjudicated_original';
export interface SourceLabel196{
 sourceId:string;containsOriginalCriterionEvidence:boolean;isMarketplaceStarsOnly:boolean;
 provenance:LabelProvenance196;reviewerIds:readonly string[];
}
export interface QueueEvaluation196{
 schema:'196.evaluation.1';labelProvenance:readonly LabelProvenance196[];
 labelCoverageComplete:boolean;queueSize:number;labeledSources:number;positiveSources:number;
 trueOriginalsInQueue:number;nonOriginalsInQueue:number;
 precisionAtQueue:number|null;recallAtQueue:number|null;
 newSourceOriginalsInQueue:number;marketplaceOnlyInQueue:number;
 fullCorpusBenchmarked:false;goldLabelsExternallyAuthenticated:false;
 testEventFalseMergeRate:null;rewrittenCopyRecall:null;
 finalRecommendationEffect:null;conclusionsRestrictedToSuppliedLabels:true;
}
const id=(x:unknown):x is string=>typeof x==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(x);
export function evaluateSourceQueue196(matrix:SourceMatrix196,labels:readonly SourceLabel196[]):QueueEvaluation196{
 if(!matrix||matrix.schema!=='196.1'||matrix.state!=='research_only'||matrix.publicRankingAllowed!==false||
  matrix.experimentMergesAuthorized!==false||!Array.isArray(matrix.rows)||!Array.isArray(matrix.reviewQueue)||
  !Array.isArray(labels)||labels.length>1500)throw Error('phase196_invalid_evaluation');
 const rowMap=new Map(matrix.rows.map(r=>[r.sourceId,r]));
 if(rowMap.size!==matrix.rows.length||new Set(labels.map(l=>l?.sourceId)).size!==labels.length)
  throw Error('phase196_invalid_labels');
 const byId=new Map<string,SourceLabel196>();
 for(const label of labels){
  if(!id(label?.sourceId)||!rowMap.has(label.sourceId)||
   typeof label.containsOriginalCriterionEvidence!=='boolean'||
   typeof label.isMarketplaceStarsOnly!=='boolean'||
   !['synthetic_fixture','research_annotation','independently_adjudicated_original'].includes(label.provenance)||
   !Array.isArray(label.reviewerIds)||label.reviewerIds.length>5||
   label.reviewerIds.some((x:unknown)=>!id(x))||new Set(label.reviewerIds).size!==label.reviewerIds.length||
   (label.provenance==='independently_adjudicated_original'&&label.reviewerIds.length<2)||
   (label.containsOriginalCriterionEvidence&&label.isMarketplaceStarsOnly))throw Error('phase196_invalid_label');
  byId.set(label.sourceId,label);
 }
 const q=matrix.reviewQueue.map(x=>{
  if(!id(x.sourceId)||!rowMap.has(x.sourceId)||x.purpose!=='research_only'||
   x.claimedIndependenceUnverified!==true)return null;
  return byId.get(x.sourceId)??null;
 });
 if(new Set(matrix.reviewQueue.map(x=>x.sourceId)).size!==matrix.reviewQueue.length||
  matrix.reviewQueue.length>matrix.rows.length||q.some((x,i)=>matrix.reviewQueue[i].sourceId===undefined))
  throw Error('phase196_invalid_queue');
 const complete=labels.length===matrix.rows.length;
 const positives=labels.filter(x=>x.containsOriginalCriterionEvidence).length;
 const trueSelected=q.filter(x=>x?.containsOriginalCriterionEvidence).length;
 const falseSelected=q.filter(x=>x&&!x.containsOriginalCriterionEvidence).length;
 const labeledQueue=trueSelected+falseSelected;
 const novel=matrix.reviewQueue.filter(x=>rowMap.get(x.sourceId)?.publisherKind==='unregistered'&&
  byId.get(x.sourceId)?.containsOriginalCriterionEvidence).length;
 return {schema:'196.evaluation.1',labelProvenance:[...new Set(labels.map(x=>x.provenance))].sort(),
  labelCoverageComplete:complete,queueSize:q.length,labeledSources:labels.length,
  positiveSources:positives,trueOriginalsInQueue:trueSelected,nonOriginalsInQueue:falseSelected,
  precisionAtQueue:labeledQueue===0?null:trueSelected/labeledQueue,
  recallAtQueue:complete?(positives===0?null:trueSelected/positives):null,
  newSourceOriginalsInQueue:novel,marketplaceOnlyInQueue:q.filter(x=>x?.isMarketplaceStarsOnly).length,
  fullCorpusBenchmarked:false,goldLabelsExternallyAuthenticated:false,
  testEventFalseMergeRate:null,rewrittenCopyRecall:null,finalRecommendationEffect:null,
  conclusionsRestrictedToSuppliedLabels:true};
}
