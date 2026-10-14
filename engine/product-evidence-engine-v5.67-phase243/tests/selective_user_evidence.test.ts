import test from 'node:test';
import assert from 'node:assert/strict';
import {decideSelectiveUserReviewResearch,auditAiCandidate,proposeTaxonomyResearch,
 type UnresolvedQuestion,type ReviewSourceGrant,type AiObservationCandidate,type ReviewTextRecord} from '../src/selective_user_evidence.js';
const q:UnresolvedQuestion={
 id:'glasses_comfort',productVariantId:'headphone_a',criterionId:'comfort_long',
 question:'Is prolonged use uncomfortable for someone wearing glasses?',
 context:'Eight hours with prescription glasses',gapType:'ergonomic_experience',
 professionalCoverage:'partial',materialityBasis:'user_explicit',materialityReference:'user request case 17'
};
const grant:ReviewSourceGrant={
 sourceId:'community_one',host:'reviews.example.org',approvedDocumentUrl:'https://reviews.example.org/licence-2026',
 licenceValidUntil:'2027-02-01',approvalRecorded:true,automatedAcquisitionAllowed:true,
 commercialAnalysisAllowed:true,aiExtractionAllowed:true,remoteModelTransferAllowed:false,
 derivedObservationPublicationAllowed:false
};
const get=(question:UnresolvedQuestion=q,grants:ReviewSourceGrant[]=[grant])=>decideSelectiveUserReviewResearch({question,grants,asOf:'2026-10-10'});
const modify=(changes:Partial<UnresolvedQuestion>)=>({...q,...changes});
test('material situational gap creates a limited candidate research plan',()=>{
 const p=get();assert.equal(p.status,'candidate_research_only');assert.deepEqual(p.sourceIds,['community_one']);
 assert.equal(p.sourceHosts.community_one,'reviews.example.org');assert.equal(p.permittedProcessing,'local_ai_candidate_extraction_only');
 assert.equal(p.resultInfluence,'not_allowed_until_separate_human_and_legal_review');
});
test('professional evidence sufficient: do not search',()=>assert.equal(get(modify({professionalCoverage:'sufficient_for_question'})).status,'no_search_sufficient_professional_evidence'));
test('a missing use context calls for one clarification instead',()=>assert.equal(get(modify({context:null})).status,'clarify_user_need_first'));
test('unknown need is clarified first',()=>assert.equal(get(modify({gapType:'unknown_need'})).status,'clarify_user_need_first'));
test('missing controlled measurement does not trigger subjective reviews',()=>assert.equal(get(modify({gapType:'controlled_performance_measurement'})).status,'professional_test_required'));
test('technical compatibility must not be answered with anecdotes',()=>assert.equal(get(modify({gapType:'technical_compatibility'})).status,'professional_test_required'));
test('non material gaps do not trigger new gathering',()=>assert.equal(get(modify({materialityBasis:'not_established',materialityReference:null})).status,'not_decision_material'));
test('no permission: fail closed',()=>assert.equal(get(q,[]).status,'rights_blocked'));
test('expired grant: fail closed',()=>assert.equal(get(q,[{...grant,licenceValidUntil:'2026-09-01'}]).status,'rights_blocked'));
test('mere read access without commercial processing rights does not suffice',()=>assert.equal(get(q,[{...grant,commercialAnalysisAllowed:false}]).status,'rights_blocked'));
test('AI access not granted means no AI processing',()=>assert.equal(get(q,[{...grant,aiExtractionAllowed:false}]).status,'rights_blocked'));
test('an Amazon review source cannot enter this path',()=>assert.equal(get(q,[{...grant,host:'www.amazon.co.uk'}]).status,'rights_blocked'));
test('source document cannot be an Amazon URL',()=>assert.equal(get(q,[{...grant,approvedDocumentUrl:'https://amazon.co.uk/policy'}]).status,'rights_blocked'));
test('duplicate grant ambiguity fails closed',()=>assert.throws(()=>get(q,[grant,{...grant}]),/Ambiguous/));
test('invalid claimed certainty is rejected without reference',()=>assert.throws(()=>get(modify({materialityReference:null})),/inspectable/));
test('commercial questions are not admitted into review search',()=>assert.throws(()=>get(modify({question:'Is this the best Amazon discount available?'})),/Invalid/));
const record:ReviewTextRecord={reviewId:'review_001',sourceId:'community_one',productVariantId:'headphone_a',sourceUrl:'https://reviews.example.org/r1',
 text:'When wearing glasses for eight hours, the pressure around my ears became uncomfortable.',incentive:'unknown'};
const candidate:AiObservationCandidate={reviewId:'review_001',criterionId:'comfort_long',claimedContext:'Eight hours with prescription glasses',
 claim:'Reviewer reports pressure while wearing glasses for eight hours',polarity:'negative',
 evidenceSpan:'the pressure around my ears became uncomfortable'};
test('anchored AI candidate stays quarantined, even with a matching excerpt',()=>{
 const a=auditAiCandidate({plan:get(),question:q,record,candidate});
 assert.equal(a.sourceEvidenceAnchored,true);assert.equal(a.canInfluenceRanking,false);
 assert.equal(a.sourceIdentityVerified,false);assert.ok(a.issues.includes('incentive_status_unknown'));
});
test('fabricated excerpt detected',()=>assert.equal(auditAiCandidate({plan:get(),question:q,record,candidate:{...candidate,evidenceSpan:'A perfect comfortable experience'}}).sourceEvidenceAnchored,false));
test('wrong product variant is detected',()=>assert.equal(auditAiCandidate({plan:get(),question:q,record:{...record,productVariantId:'headphone_b'},candidate}).exactVariantMatched,false));
test('source link host must match the approved grant',()=>assert.ok(auditAiCandidate({plan:get(),question:q,record:{...record,sourceUrl:'https://unexpected.example.org/r1'},candidate}).issues.includes('no_permitted_selective_plan')));
test('different criterion detected',()=>assert.equal(auditAiCandidate({plan:get(),question:q,record,candidate:{...candidate,criterionId:'battery_life'}}).matchingCriterion,false));
test('declared incentives require disclosure',()=>assert.ok(auditAiCandidate({plan:get(),question:q,record:{...record,incentive:'declared'},candidate}).issues.includes('incentive_must_be_disclosed')));
test('no plan no extraction',()=>assert.ok(auditAiCandidate({plan:get(q,[]),question:q,record,candidate}).issues.includes('no_permitted_selective_plan')));
test('new criteria are only research proposals tied to an unresolved real case',()=>{
 const p=proposeTaxonomyResearch({auditedPlans:[get(),get(modify({id:'other_case',professionalCoverage:'sufficient_for_question'}))],
  knownCriterionIds:['comfort_long'],hypotheses:[{questionId:'glasses_comfort',candidateCriterionId:'temple_pressure'},
  {questionId:'other_case',candidateCriterionId:'invented_aspect'}]});
 assert.deepEqual(p.proposed,['temple_pressure']);assert.equal(p.rankingWeightsModified,false);assert.equal(p.publishedClaimsModified,false);
});
