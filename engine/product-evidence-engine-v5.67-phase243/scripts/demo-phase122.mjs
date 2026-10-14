import {planQuestionResearch122} from '../dist/src/phase122_native_question_to_research.js';
import {searchInternalPassages122} from '../dist/src/phase122_native_local_retrieval.js';
const question=process.argv.slice(2).join(' ')||'Quali robot richiedono meno interventi umani?';
const context={verifiedCategory:'floor_cleaning_robot'};
const coverage={candidateCount:0,verifiedMetricKeys:[],hasIndependentlyReviewedQualityPolicy:false,protocolComparable:false};
const plan=planQuestionResearch122(question,coverage,context);
const local=searchInternalPassages122(plan,[]);
process.stdout.write(JSON.stringify({question,plan,local},null,2)+'\n');
