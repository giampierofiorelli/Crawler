import fs from 'node:fs';
import {trainNativeModel123,planNativeResearch123} from '../dist/src/phase123_native_learned_intent.js';
const train=JSON.parse(fs.readFileSync('research/phase123_training_examples.json')).samples;
const prior=JSON.parse(fs.readFileSync('PHASE122-OPEN-QUERY-DIAGNOSTIC.json')).results;
const model=trainNativeModel123(train.filter((_,i)=>i%5!==4),train.filter((_,i)=>i%5===4));
const cov={candidateCount:0,verifiedMetricKeys:[],hasIndependentlyReviewedQualityPolicy:false,protocolComparable:false};
const results=prior.map(r=>{let p=planNativeResearch123(model,r.query,cov,{verifiedCategory:'floor_cleaning_robot'});
 return {ordinal:r.ordinal,query:r.query,previousObjective:r.result.objective,
  phase123Status:p.next,phase123ProposedLabel:p.proposal.label,
  researchTasks:p.unmet,searchExecuted:p.searchExecuted,publicRankingAuthorized:p.publicRankingAuthorized};});
fs.writeFileSync('PHASE123-PRIOR-REQUESTS-DIAGNOSTIC.json',JSON.stringify({
  description:'Previous user requests reused for qualitative, non-blind diagnostics. No independent labels.',
  examples:results},null,2)+'\n');
for(const r of results)console.log(r.ordinal,r.previousObjective,'=>',r.phase123ProposedLabel,r.phase123Status);
