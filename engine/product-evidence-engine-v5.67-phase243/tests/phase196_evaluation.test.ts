import test from 'node:test';import assert from 'node:assert/strict';
import {analyzeEphemeralBatch195} from '../src/phase195_ephemeral_batch_lineage.js';
import {emptyLedger193} from '../src/phase193_screening_memory.js';
import {loadPublisherSeed196,planSourceReviews196} from '../src/phase196_source_intelligence.js';
import {evaluateSourceQueue196,type SourceLabel196} from '../src/phase196_evaluation.js';
const known='https://www.which.co.uk/review/a',unknown='https://newexpert.example.com/review/b',stars='https://stars.example.org/list';
const batch=analyzeEphemeralBatch195({batchId:'evaluation_fixture',analyzedAt:'2026-10-13T12:00:00Z',reviews:[
 {sourceId:'known',url:known,category:'home_appliances',variantId:'model_1',transientText:'A',textBasis:'analyst_annotation',dates:[],measurements:[],attribution:[]},
 {sourceId:'unknown',url:unknown,category:'home_appliances',variantId:'model_1',transientText:'B',textBasis:'analyst_annotation',dates:[],measurements:[],attribution:[]},
 {sourceId:'stars',url:stars,category:'home_appliances',variantId:'model_1',transientText:'C',textBasis:'analyst_annotation',dates:[],measurements:[],attribution:[]} ]});
const a=(sourceId:string,materialRole:'original_instrumental_claim'|'marketplace_stars_only'='original_instrumental_claim')=>
 ({sourceId,market:'UK',field:'noise',protocol:'bench_v1',materialRole,sourceRevision:null,freshPublisherBytes:null});
const get=(maxQueue=2)=>planSourceReviews196({seed:loadPublisherSeed196('data/phase196/publisher-method-seed.json'),
 ledger:emptyLedger193(),batch,annotations:[a('known'),a('unknown'),a('stars','marketplace_stars_only')],maxQueue});
const labels:SourceLabel196[]=[
 {sourceId:'known',containsOriginalCriterionEvidence:true,isMarketplaceStarsOnly:false,provenance:'synthetic_fixture',reviewerIds:[]},
 {sourceId:'unknown',containsOriginalCriterionEvidence:true,isMarketplaceStarsOnly:false,provenance:'synthetic_fixture',reviewerIds:[]},
 {sourceId:'stars',containsOriginalCriterionEvidence:false,isMarketplaceStarsOnly:true,provenance:'synthetic_fixture',reviewerIds:[]}];
test('196 evaluation reports queue labels transparently and does not claim external validation',()=>{
 const x=evaluateSourceQueue196(get(),labels);
 assert.equal(x.precisionAtQueue,1);assert.equal(x.recallAtQueue,1);
 assert.equal(x.newSourceOriginalsInQueue,1);assert.equal(x.marketplaceOnlyInQueue,0);
 assert.equal(x.goldLabelsExternallyAuthenticated,false);assert.equal(x.finalRecommendationEffect,null);
 assert.equal(x.testEventFalseMergeRate,null);assert.equal(x.rewrittenCopyRecall,null);
});
test('196 incomplete label coverage prevents corpus recall claim',()=>{
 const x=evaluateSourceQueue196(get(),[labels[0]]);
 assert.equal(x.recallAtQueue,null);assert.equal(x.labelCoverageComplete,false);
});
test('196 precision undefined on all-unlabeled queue',()=>{
 const x=evaluateSourceQueue196(get(),[]);assert.equal(x.precisionAtQueue,null);
});
test('196 a non-original queue item lowers precision (synthetic only)',()=>{
 const altered=labels.map(l=>l.sourceId==='known'?{...l,containsOriginalCriterionEvidence:false}:l);
 const x=evaluateSourceQueue196(get(),altered);assert.equal(x.precisionAtQueue,0.5);
});
test('196 never conflates stars-only and authenticated original label',()=>{
 assert.throws(()=>evaluateSourceQueue196(get(),[{...labels[2],containsOriginalCriterionEvidence:true}]),/invalid_label/);
});
test('196 independent adjudication label needs distinct reviewers but still cannot be authenticated internally',()=>{
 const l={...labels[0],provenance:'independently_adjudicated_original' as const};
 assert.throws(()=>evaluateSourceQueue196(get(),[l]),/invalid_label/);
 const x=evaluateSourceQueue196(get(),[{...l,reviewerIds:['one','two']}]);
 assert.equal(x.goldLabelsExternallyAuthenticated,false);
});
test('196 evaluating unknown label source fails safely',()=>{
 assert.throws(()=>evaluateSourceQueue196(get(),[{...labels[0],sourceId:'bogus'}]),/invalid_label/);
});
test('196 duplicate labels fail safely',()=>{
 assert.throws(()=>evaluateSourceQueue196(get(),[labels[0],labels[0]]),/invalid_labels/);
});
