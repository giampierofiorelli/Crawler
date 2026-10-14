import {decideSelectiveUserReviewResearch,auditAiCandidate,proposeTaxonomyResearch,
 type UnresolvedQuestion,type ReviewSourceGrant} from '../src/selective_user_evidence.js';
const grant:ReviewSourceGrant={sourceId:'licensed_for_demo_only',host:'reviews.example.org',
 approvedDocumentUrl:'https://reviews.example.org/demo-rights',licenceValidUntil:'2027-01-01',
 approvalRecorded:true,automatedAcquisitionAllowed:true,commercialAnalysisAllowed:true,
 aiExtractionAllowed:true,remoteModelTransferAllowed:false,derivedObservationPublicationAllowed:false};
const base:UnresolvedQuestion={id:'long_wear_glasses',productVariantId:'sample_headphone_01',criterionId:'comfort',
 question:'Is the headphone comfortable for eight hours with glasses?',context:'Eight hour wear with glasses',
 gapType:'ergonomic_experience',professionalCoverage:'partial',materialityBasis:'user_explicit',
 materialityReference:'fictional explicit user statement demo case'};
const asOf='2026-10-10';
const choose=(question:UnresolvedQuestion,grants:ReviewSourceGrant[]=[grant])=>decideSelectiveUserReviewResearch({question,grants,asOf});
const p=choose(base);
const scenarios=[
 {scenario:'unresolved experience',status:p.status,permission:p.permittedProcessing},
 {scenario:'professional tests sufficient',status:choose({...base,professionalCoverage:'sufficient_for_question'}).status},
 {scenario:'measurement missing',status:choose({...base,gapType:'controlled_performance_measurement'}).status},
 {scenario:'uncleared source rights',status:choose(base,[]).status},
 {scenario:'unknown user context',status:choose({...base,context:null}).status}
];
const candidateAudit=auditAiCandidate({plan:p,question:base,
 record:{reviewId:'sample_review_01',sourceId:'licensed_for_demo_only',productVariantId:'sample_headphone_01',
  sourceUrl:'https://reviews.example.org/sample-review',
  text:'With my glasses on for eight hours I felt pressure around my ears.',incentive:'unknown'},
 candidate:{reviewId:'sample_review_01',criterionId:'comfort',claimedContext:'Eight hour wear with glasses',
  claim:'One reviewer reports pressure after long wear with glasses',
  evidenceSpan:'I felt pressure around my ears',polarity:'negative'}});
const learning=proposeTaxonomyResearch({auditedPlans:[p],knownCriterionIds:['comfort'],
 hypotheses:[{questionId:'long_wear_glasses',candidateCriterionId:'comfort_glasses_pressure'}]});
console.log(JSON.stringify({purpose:'synthetic_research_only',scenarios,candidateAudit,learning},null,2));
