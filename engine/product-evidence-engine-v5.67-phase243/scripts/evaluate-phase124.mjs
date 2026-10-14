import fs from 'node:fs';
import {trainNativeModel123,proposeNativeIntent123,planNativeResearch123} from '../dist/src/phase123_native_learned_intent.js';
import {interpretQuestion122} from '../dist/src/phase122_native_question_to_research.js';
import {attemptResearch124} from '../dist/src/phase124_end_to_end_attempt.js';
const {samples}=JSON.parse(fs.readFileSync('research/phase123_training_examples.json','utf8'));
const {cases}=JSON.parse(fs.readFileSync('research/phase124_authentic_questions.json','utf8'));
const model=trainNativeModel123(samples.filter((_,i)=>i%5!==4),samples.filter((_,i)=>i%5===4));
const context={verifiedCategory:'floor_cleaning_robot'};
const zero={candidateCount:0,verifiedMetricKeys:[],hasIndependentlyReviewedQualityPolicy:false,protocolComparable:false};
const results=cases.map(c=>{
 const pred=proposeNativeIntent123(model,c.text,context);
 const legacy=interpretQuestion122(c.text,context);
 const expectedAutoDefer=Boolean(c.id==='real_08'||c.id==='real_09'||c.id==='real_12');
 const goalAccepted=pred.status==='proposed';
 const goalCorrect=goalAccepted&&pred.label===c.expected;
 const attempt=attemptResearch124(model,c.text,context,[],[]);
 return {id:c.id,source:c.source,text:c.text,referenceIntent:c.expected,needsAdditionalConstraints:expectedAutoDefer,
  phase123Label:pred.label,phase123Status:pred.status,legacyObjective:legacy.objective,legacyQueryState:legacy.queryState,
  correctAccepted:goalCorrect,incorrectAccepted:goalAccepted&&!goalCorrect,
  protectedConstraintViolation:expectedAutoDefer&&goalAccepted,
  attemptOutcome:attempt.state,queriesAttempted:attempt.retrieval.attemptedQueries,rankingAuthorized:attempt.publicRankingAuthorized};
});
const summary={corpus:'real Reddit question excerpts, purposive/manual and not statistically representative',
 dateFrozen:'2026-10-11',trainingLeakage:'not incorporated in training/calibration; seen by developer during evaluation',
 authorAnnotatedNotIndependent:true,questionCount:results.length,
 correctlyAccepted:results.filter(x=>x.correctAccepted).length,
 incorrectlyAccepted:results.filter(x=>x.incorrectAccepted).length,
 abstainedOrReviewed:results.filter(x=>!x.correctAccepted&&!x.incorrectAccepted).length,
 constraintViolations:results.filter(x=>x.protectedConstraintViolation).length,
 candidatesFound:results.filter(x=>x.attemptOutcome==='candidate_sources_found').length,
 noEvidenceDeferrals:results.filter(x=>!x.rankingAuthorized).length,
 generalizationValidated:false,endToEndWebValidated:false,autoExtractValidated:false,
 rows:results};
fs.writeFileSync('PHASE124-AUTHENTIC-PROMPT-BASELINE.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({tested:summary.questionCount,acceptedCorrect:summary.correctlyAccepted,acceptedWrong:summary.incorrectlyAccepted,abstain:summary.abstainedOrReviewed,constraintViolations:summary.constraintViolations,states:Object.fromEntries([...new Set(results.map(x=>x.attemptOutcome))].map(x=>[x,results.filter(r=>r.attemptOutcome===x).length]))},null,2));
