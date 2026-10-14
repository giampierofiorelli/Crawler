import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {InterpretationMemory101,type SourcePointer,type StoredClaim} from '../src/phase101_interpretation_memory.js';
import {ResearchDiscoveryQueue108,QueryNeutralEvidence108,PersonalizedEvidenceQuery108,SourceIndependentIntake108}
  from '../src/phase108_query_neutral_evidence.js';
import {EntityCognition104} from '../src/phase104_entity_cognition.js';
import {IncrementalReasoningGraph105} from '../src/phase105_incremental_reasoning_graph.js';
import {PersonalizedRecomputation107,type ReviewedTradeoffContext107} from '../src/phase107_personalized_recomputation.js';

const at='2026-10-11T09:00:00Z';
const src=(originalTestId:string):SourcePointer=>({
  sourceUrl:'https://testlab.example.org/lab/dishwasher-hygiene',originalTestId,
  sourceRevisionSha256:'a'.repeat(64),sourceSpanSha256:'b'.repeat(64),sourceLocator:'#methods',
  methodologyReference:'documented method with organism specificity',
  assessmentReference:'human review of independent original lab test',
  assessorId:'reviewer_one',assessedAt:at,originalTestLineageReviewed:true,
  exactVariantReviewed:true,contextReviewed:true
});
const protocol=(criterionId:string)=>({
  categoryId:'dishwasher',criterionId,frameId:'reviewed_hygiene_cycle',scope:'whole_category' as const,
  semanticsReference:'explicitly defined organism and endpoints for this criterion',
  methodologyReference:'test methodology independent of any user request',
  expertReviewReference:'independent expert signed-off category criterion',reviewerId:'reviewer_one'
});
const gap=(criterionId:string)=>({gapId:'missing_'+criterionId,categoryId:'dishwasher',
  criterionId,frameId:'reviewed_hygiene_cycle',reason:'new_criterion_proposed' as const,
  triggerReference:'researchjob_normalized_2026'});
function setup(path?:string){
  const mem=new InterpretationMemory101(path?join(path,'canonical.sqlite'):':memory:');
  for(const v of ['alpha','beta','gamma'])mem.registerProduct({categoryId:'dishwasher',
    variantId:v,displayName:'Dishwasher '+v});
  const gaps=new ResearchDiscoveryQueue108(path?join(path,'research.sqlite'):':memory:');
  const view=new QueryNeutralEvidence108(mem,gaps);
  const end=()=>{gaps.close();mem.close();};
  return {mem,gaps,view,end};
}
const bacterial=(id:string,variantId:string):StoredClaim=>({id,categoryId:'dishwasher',variantId,
  criterionId:'bacteria_reduction',frameId:'reviewed_hygiene_cycle',kind:'calibrated_level',
  levelId:'bacterial_reduction_demonstrated',scaleReference:'reviewed bacteria reduction endpoint and level scale',
  source:src(id)});
const bacteriaKey={categoryId:'dishwasher',criterionId:'bacteria_reduction',frameId:'reviewed_hygiene_cycle'};
const virusKey={categoryId:'dishwasher',criterionId:'virus_inactivation',frameId:'reviewed_hygiene_cycle'};

test('two radically different user intents cannot alter common product evidence',()=>{
  const f=setup();try{
    f.mem.recordApprovedClaim(bacterial('lab_alpha_bacteria','alpha'));
    const canonicalBefore=f.view.evidenceIdentity(bacteriaKey);
    f.view.researchGap(gap('virus_inactivation'));
    assert.equal(f.view.evidenceIdentity(bacteriaKey),canonicalBefore);
    assert.deepEqual(f.view.expertClaims(bacteriaKey).map(x=>x.id),['lab_alpha_bacteria']);
    assert.deepEqual(f.view.expertClaims(virusKey),[]);
    assert.equal(f.view.coverage(virusKey).variants.length,3);
    assert.ok(f.view.coverage(virusKey).variants.every(v=>v.status==='not_yet_assessed'));
    assert.equal(f.view.coverage(virusKey).protocol,'unreviewed_category_criterion');
    assert.equal(f.gaps.gaps().length,1);
  }finally{f.end();}
});
test('query-triggered gap is a research task, not a negative claim or product exclusion',()=>{
  const f=setup();try{
    f.view.researchGap(gap('virus_inactivation'));
    const s=f.view.coverage(virusKey);
    assert.equal(s.variants.find(v=>v.variantId==='alpha')!.status,'not_yet_assessed');
    assert.equal(s.variants.find(v=>v.variantId==='beta')!.status,'not_yet_assessed');
    assert.equal(f.view.expertClaims(virusKey).length,0);
  }finally{f.end();}
});
test('independent criterion adoption applies to whole category, not first queried model',()=>{
  const f=setup();try{
    f.view.researchGap(gap('virus_inactivation'));
    f.gaps.adoptCriterion(protocol('virus_inactivation'));
    const scope=f.view.coverage(virusKey);
    assert.equal(scope.protocol,'independently_reviewed_category_criterion');
    assert.deepEqual(scope.variants.map(x=>x.variantId),['alpha','beta','gamma']);
    assert.ok(scope.variants.every(x=>x.status==='not_yet_assessed'));
    assert.equal(f.view.expertClaims(virusKey).length,0);
  }finally{f.end();}
});
test('bacterial evidence never becomes virus evidence merely because user asks about viruses',()=>{
  const f=setup();try{
    f.gaps.adoptCriterion(protocol('bacteria_reduction'));
    f.mem.recordApprovedClaim(bacterial('lab_bacteria','alpha'));
    f.view.researchGap(gap('virus_inactivation'));
    f.gaps.adoptCriterion(protocol('virus_inactivation'));
    assert.equal(f.view.coverage(bacteriaKey).variants[0].status,'evidence_recorded');
    assert.equal(f.view.coverage(virusKey).variants[0].status,'not_yet_assessed');
    assert.equal(f.view.valueLevels({...virusKey,scaleReference:'reviewed viral inactivation endpoint scale'}).performance.length,0);
  }finally{f.end();}
});
test('research prompts with user preferences cannot be inserted as global protocol',()=>{
  const f=setup();try{
    assert.throws(()=>f.gaps.adoptCriterion({...protocol('virus_inactivation'),
      userId:'user_one'} as Parameters<typeof f.gaps.adoptCriterion>[0]),/not_independently_reviewed/);
    assert.throws(()=>f.gaps.adoptCriterion({...protocol('virus_inactivation'),
      scope:'for_alpha_only'} as unknown as Parameters<typeof f.gaps.adoptCriterion>[0]),/not_independently_reviewed/);
    assert.throws(()=>f.gaps.flag({...gap('virus_inactivation'),
      interpretation:'this dishwasher kills viruses'} as Parameters<typeof f.gaps.flag>[0]),/invalid_research_only_gap/);
  }finally{f.end();}
});
test('approved category protocols and research prompts cannot overwrite their established meaning',()=>{
  const f=setup();try{
    const p=protocol('virus_inactivation');f.gaps.adoptCriterion(p);f.gaps.adoptCriterion(p);
    assert.throws(()=>f.gaps.adoptCriterion({...p,methodologyReference:'completely different methodology'}),
      /criterion_revision_requires_explicit_requalification/);
    const g=gap('virus_inactivation');f.gaps.flag(g);f.gaps.flag(g);
    assert.throws(()=>f.gaps.flag({...g,reason:'insufficient_test_coverage'}),/research_gap_id_conflict/);
  }finally{f.end();}
});
test('research queue persistence is separate from persistent canonical evidence',()=>{
  const path=mkdtempSync(join(tmpdir(),'pee-phase108-'));
  try{
    let f=setup(path);f.view.researchGap(gap('virus_inactivation'));
    f.gaps.adoptCriterion(protocol('virus_inactivation'));f.end();
    f=setup(path);
    assert.equal(f.gaps.gaps().length,1);
    assert.equal(f.view.coverage(virusKey).protocol,'independently_reviewed_category_criterion');
    assert.equal(f.view.expertClaims(virusKey).length,0);
    f.end();
  }finally{rmSync(path,{recursive:true,force:true});}
});
test('read model result is a copy and cannot modify the authoritative claim',()=>{
  const f=setup();try{
    f.mem.recordApprovedClaim(bacterial('lab_alpha_bacteria','alpha'));
    const before=f.view.evidenceIdentity(bacteriaKey);
    const claims=f.view.expertClaims(bacteriaKey);
    (claims[0] as {variantId:string}).variantId='gamma';
    assert.equal(f.view.evidenceIdentity(bacteriaKey),before);
    assert.equal(f.view.expertClaims(bacteriaKey)[0].variantId,'alpha');
  }finally{f.end();}
});
test('an independently reviewed new finding updates canonical knowledge for all future users',()=>{
  const f=setup();try{
    f.view.researchGap(gap('virus_inactivation'));
    f.gaps.adoptCriterion(protocol('virus_inactivation'));
    const before=f.view.evidenceIdentity(virusKey);
    f.mem.recordApprovedClaim({id:'lab_virus',categoryId:'dishwasher',variantId:'gamma',
      criterionId:'virus_inactivation',frameId:'reviewed_hygiene_cycle',kind:'calibrated_level',
      levelId:'viral_inactivation_evaluated',scaleReference:'reviewed viral inactivation endpoint scale',
      source:src('lab_virus')});
    assert.notEqual(f.view.evidenceIdentity(virusKey),before);
    assert.equal(f.view.coverage(virusKey).variants.find(v=>v.variantId==='gamma')?.status,'evidence_recorded');
    assert.equal(f.view.coverage(virusKey).variants.find(v=>v.variantId==='alpha')?.status,'not_yet_assessed');
    assert.deepEqual(f.view.expertClaims(virusKey).map(c=>c.id),['lab_virus']);
  }finally{f.end();}
});
function personalize(){
  const memory=new InterpretationMemory101();
  for(const variantId of ['alpha','beta'])memory.registerProduct({categoryId:'vacuum',variantId,displayName:'Vacuum '+variantId});
  const cognition=new EntityCognition104();const graph=new IncrementalReasoningGraph105();
  const recommender=new PersonalizedRecomputation107(memory,cognition,graph);
  const projection=new PersonalizedEvidenceQuery108(memory,recommender);
  const store=(variantId:string,criterionId:string,levelId:string)=>{
    const originalTestId='lab_'+criterionId+'_'+variantId;
    memory.recordApprovedClaim({id:originalTestId,categoryId:'vacuum',variantId,criterionId,
      frameId:'normal',kind:'calibrated_level',levelId,scaleReference:criterionId+' reviewed scale research',
      source:src(originalTestId)});
  };
  for(const c of ['noise','cleaning'])for(const v of ['alpha','beta'])
    store(v,c,c==='noise'?(v==='alpha'?'poor':'good'):(v==='alpha'?'good':'poor'));
  const template:ReviewedTradeoffContext107={
    nodeId:'personal_request_one',categoryId:'vacuum',useContextId:'household',variantIds:['alpha','beta'],
    criterionFrames:[{criterionId:'noise',frameId:'normal',scaleReference:'noise reviewed scale research'},
      {criterionId:'cleaning',frameId:'normal',scaleReference:'cleaning reviewed scale research'}],
    reviewedPreferenceModel:{profileReference:'confirmed preference request profile',userPreferencesConfirmed:true,
      independentlyReviewedAdditiveAssumptions:true,additiveReviewReference:'independent additive review',
      criteria:[{criterionId:'noise',swingWeight:0.6,weightElicitationReceipt:'noise swing expert review',valueScaleElicitationReceipt:'noise reviewed scale research',
        levels:[{id:'poor',value:0,description:'poor acoustic outcome'},
          {id:'good',value:100,description:'good acoustic outcome'}]},
        {criterionId:'cleaning',swingWeight:0.4,weightElicitationReceipt:'cleaning swing expert review',valueScaleElicitationReceipt:'cleaning reviewed scale research',
          levels:[{id:'poor',value:0,description:'poor cleaning'},
            {id:'good',value:100,description:'excellent cleaning'}]}]},
    hardRequirements:[],ordinalJudgements:[],preferenceExplorationConfirmed:true,
    preferenceExplorationReference:'confirmed but incomplete ranking preferences'
  };
  const close=()=>{graph.close();cognition.close();memory.close();};
  return {memory,projection,template,close};
}
test('different users receive different conditional rankings while authoritative fact hashes remain identical',()=>{
  const f=personalize();try{
    const a=f.projection.evaluate(f.template,at);
    const bContext=structuredClone(f.template);bContext.nodeId='personal_request_two';
    bContext.reviewedPreferenceModel.criteria[0].swingWeight=0.3;
    bContext.reviewedPreferenceModel.criteria[1].swingWeight=0.7;
    bContext.preferenceExplorationReference='different user confirmed cleaning priority';
    const b=f.projection.evaluate(bContext,at);
    assert.equal(a.result.status,'ready_research');assert.equal(b.result.status,'ready_research');
    assert.notEqual(a.contextDigest,b.contextDigest);
    assert.deepEqual(a.canonicalFrameDigests,b.canonicalFrameDigests);
    assert.deepEqual((a.result.cache?.payload as {primary:{conditionalOrder:string[]}}).primary.conditionalOrder,
      ['beta','alpha']);
    assert.deepEqual((b.result.cache?.payload as {primary:{conditionalOrder:string[]}}).primary.conditionalOrder,
      ['alpha','beta']);
    assert.equal(a.sharedProductScoreWritten,false);assert.equal(b.sharedProductScoreWritten,false);
    assert.equal(a.result.publicationReady,false);assert.equal(b.result.publicationReady,false);
  }finally{f.close();}
});
test('query-specific projection cannot rewrite user weight into product memory',()=>{
  const f=personalize();try{
    const before=f.memory.snapshotReviewedFrame({categoryId:'vacuum',criterionId:'noise',frameId:'normal'});
    f.projection.evaluate(f.template,at);
    const after=f.memory.snapshotReviewedFrame({categoryId:'vacuum',criterionId:'noise',frameId:'normal'});
    assert.deepEqual(after,before);
    assert.equal(JSON.stringify(after).includes('swingWeight'),false);
  }finally{f.close();}
});

test('source-independent intake refuses to convert request intent directly into global product knowledge',()=>{
  const f=setup();try{
    const admission=new SourceIndependentIntake108(f.mem,f.gaps);
    const c=bacterial('bacterial_source_01','alpha');
    const r={claim:c,reviewerId:'reviewer_one',
      independentSourceAuditReference:'assessed original test without user request priorities',
      fullSourceAspectAuditReference:'all review aspects checked for source coverage independent of query',
      fullSourceAspectReviewCompleted:true as const,
      interpretationScope:'source_observation_independent_of_user_request' as const,
      categoryProtocolScope:'all_eligible_category_variants' as const,
      evaluatorVerifiedContext:true as const};
    assert.throws(()=>admission.admit(r),/category_criterion_must_be_independently_adopted/);
    f.gaps.adoptCriterion(protocol('bacteria_reduction'));
    assert.throws(()=>admission.admit({...r,interpretationScope:'this_user_wanted_hygiene'} as unknown as typeof r),
      /user_query_cannot_author_canonical_interpretation/);
    assert.throws(()=>admission.admit({...r,fullSourceAspectReviewCompleted:false} as unknown as typeof r),
      /user_query_cannot_author_canonical_interpretation/);
    assert.throws(()=>admission.admit({...r,questionSpecificWeight:0.9} as typeof r),
      /user_query_cannot_author_canonical_interpretation/);
    admission.admit(r);
    assert.deepEqual(f.view.expertClaims(bacteriaKey).map(x=>x.id),['bacterial_source_01']);
  }finally{f.end();}
});
test('source-derived finding can be approved once and reused regardless of who found the gap',()=>{
  const f=setup();try{
    f.gaps.adoptCriterion(protocol('bacteria_reduction'));
    const intake=new SourceIndependentIntake108(f.mem,f.gaps);
    const req={claim:bacterial('independent_a','alpha'),reviewerId:'reviewer_one',
      independentSourceAuditReference:'source independently evaluated against original test method',
      fullSourceAspectAuditReference:'all available source aspects systematically reviewed',
      fullSourceAspectReviewCompleted:true as const,
      interpretationScope:'source_observation_independent_of_user_request' as const,
      categoryProtocolScope:'all_eligible_category_variants' as const,evaluatorVerifiedContext:true as const};
    const before=f.view.evidenceIdentity(bacteriaKey);
    intake.admit(req);
    const after=f.view.evidenceIdentity(bacteriaKey);
    assert.notEqual(before,after);
    f.view.researchGap(gap('virus_inactivation'));
    assert.equal(f.view.evidenceIdentity(bacteriaKey),after);
    assert.equal(f.view.expertClaims(bacteriaKey)[0].source.originalTestId,'independent_a');
  }finally{f.end();}
});

test('research queue refuses to store raw user prompts or direct identifiers',()=>{
  const f=setup();try{
    assert.throws(()=>f.view.researchGap({...gap('virus_inactivation'),
      triggerReference:'Please find my dishwasher and remember my details'}),/invalid_research_only_gap/);
    assert.equal(f.gaps.gaps().length,0);
  }finally{f.end();}
});

// Phase108 hardening: order-of-query independence and complete pairwise coverage.
test('pairwise expert observations cover BOTH compared variants without inventing a ranking',()=>{
  const f=setup();try{
    f.mem.recordApprovedClaim({
      id:'original_pair_alpha_beta',categoryId:'dishwasher',variantId:'alpha',
      criterionId:'noise',frameId:'reviewed_hygiene_cycle',kind:'pairwise',
      comparedVariantId:'beta',relation:'better',comparisonBasis:'same_original_test',
      source:src('original_pair_test')
    });
    const coverage=f.view.coverage({categoryId:'dishwasher',criterionId:'noise',frameId:'reviewed_hygiene_cycle'});
    assert.deepEqual(coverage.variants.find(v=>v.variantId==='alpha')?.activeClaimIds,['original_pair_alpha_beta']);
    assert.deepEqual(coverage.variants.find(v=>v.variantId==='beta')?.activeClaimIds,['original_pair_alpha_beta']);
    assert.equal(coverage.variants.find(v=>v.variantId==='gamma')?.status,'not_yet_assessed');
    assert.equal(f.view.evidenceIdentity(virusKey),f.mem.snapshotReviewedFrame(virusKey).revisionSha256);
  }finally{f.end();}
});

test('first-query order cannot change canonical facts, revisions, or adopted category protocol',()=>{
  const outcome=(order:'hygiene_first'|'quiet_first')=>{
    const f=setup();try{
      if(order==='hygiene_first'){
        f.view.researchGap(gap('virus_inactivation'));
        f.view.researchGap(gap('bacteria_reduction'));
      }else{
        f.view.researchGap(gap('bacteria_reduction'));
        f.view.researchGap(gap('virus_inactivation'));
      }
      // Source interpretation and category protocol do not use the triggering query.
      f.gaps.adoptCriterion(protocol('bacteria_reduction'));
      const intake=new SourceIndependentIntake108(f.mem,f.gaps);
      intake.admit({claim:bacterial('independent_laboratory_bacteria','alpha'),
        reviewerId:'reviewer_one',
        independentSourceAuditReference:'original test reviewed independently of a consumer query',
        fullSourceAspectAuditReference:'comprehensive full source aspect inventory verified',
        fullSourceAspectReviewCompleted:true,
        interpretationScope:'source_observation_independent_of_user_request',
        categoryProtocolScope:'all_eligible_category_variants',
        evaluatorVerifiedContext:true
      });
      const result={revision:f.view.evidenceIdentity(bacteriaKey),
        claims:f.view.expertClaims(bacteriaKey),
        bacteria:f.view.coverage(bacteriaKey),
        viruses:f.view.coverage(virusKey)};
      return result;
    }finally{f.end();}
  };
  assert.deepEqual(outcome('hygiene_first'),outcome('quiet_first'));
});

test('changing research gaps never changes evidence or falsely records negative findings',()=>{
  const f=setup();try{
    const before=f.view.evidenceIdentity(virusKey);
    f.view.researchGap(gap('virus_inactivation'));
    f.gaps.adoptCriterion(protocol('virus_inactivation'));
    assert.equal(f.view.evidenceIdentity(virusKey),before);
    const summary=f.view.coverage(virusKey);
    assert.equal(summary.protocol,'independently_reviewed_category_criterion');
    assert.ok(summary.variants.every(v=>v.status==='not_yet_assessed'));
    assert.deepEqual(f.view.expertClaims(virusKey),[]);
  }finally{f.end();}
});

test('withdrawn original pairwise finding no longer counts for either variant',()=>{
  const f=setup();try{
    f.mem.recordApprovedClaim({id:'original_pair_a_b',categoryId:'dishwasher',variantId:'alpha',
      criterionId:'noise',frameId:'reviewed_hygiene_cycle',kind:'pairwise',
      comparedVariantId:'beta',relation:'worse',comparisonBasis:'same_original_test',
      source:src('original_pair_a_b')});
    const criterion={categoryId:'dishwasher',criterionId:'noise',frameId:'reviewed_hygiene_cycle'};
    assert.equal(f.view.coverage(criterion).variants.find(v=>v.variantId==='beta')?.status,'evidence_recorded');
    f.mem.withdrawClaim('original_pair_a_b','documented reviewer source retraction','2026-10-11T09:05:00Z');
    assert.ok(f.view.coverage(criterion).variants.every(v=>v.status==='not_yet_assessed'));
  }finally{f.end();}
});
