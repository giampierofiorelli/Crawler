import fs from 'node:fs';
import {trainNativeModel123,proposeNativeIntent123,planNativeResearch123} from '../dist/src/phase123_native_learned_intent.js';
import {interpretQuestion122} from '../dist/src/phase122_native_question_to_research.js';
const {samples}=JSON.parse(fs.readFileSync('research/phase123_training_examples.json','utf8'));
const {cases}=JSON.parse(fs.readFileSync('research/phase123_developer_challenge.json','utf8'));
// Frozen deterministic stratified split; no challenge text is part of fit or calibration.
const train=samples.filter((_,i)=>i%5!==4);
const calibration=samples.filter((_,i)=>i%5===4);
const model=trainNativeModel123(train,calibration);
const ctx={verifiedCategory:'floor_cleaning_robot'};
const table=cases.map(c=>{
  const result=proposeNativeIntent123(model,c.text,ctx);
  const base=interpretQuestion122(c.text,ctx);
  const baseline=(base.queryState==='bounded_proposal'&&base.objective)?
    ({least_human_work:'autonomy',best_performance:'performance',best_value:'value'})[base.objective]:null;
  return {id:c.id,expected:c.expected,baseline,proposal:result.label,status:result.status,
    similarity:result.bestSimilarity,margin:result.separation,
    correct:result.status==='proposed'&&result.label===c.expected,
    wrongAcceptance:result.status==='proposed'&&result.label!==c.expected};
});
const evaluated={date:'2026-10-11',name:'Phase123 constructed diagnostic, NOT blind real-user evaluation',
 trainingSize:train.length,calibrationSize:calibration.length,challengeSize:cases.length,
 trainingProvenance:'author_constructed_not_independently_labeled',
 challengeProvenance:'developer_authored_frozen_at_execution_not_independent',
 modelHash:model.hash,thresholds:{cosine:model.acceptedSimilarity,margin:model.acceptedMargin},
 calibration:model.validation,
 baseline:{correctAccepted:table.filter(x=>x.baseline===x.expected).length,
  incorrectAccepted:table.filter(x=>x.baseline!==null&&x.baseline!==x.expected).length},
 proposed:{correctAccepted:table.filter(x=>x.correct).length,
  incorrectAccepted:table.filter(x=>x.wrongAcceptance).length,
  abstained:table.filter(x=>x.status!=='proposed').length},
 examples:table,
 realBlindUserAccuracy:null,rankingValidated:false,webExecuted:false};
fs.writeFileSync('PHASE123-CONSTRUCTED-CHALLENGE-RESULTS.json',JSON.stringify(evaluated,null,2)+'\n');
console.log(JSON.stringify({baseline:evaluated.baseline,new:evaluated.proposed,calibration:model.validation,thresholds:evaluated.thresholds,wrong:table.filter(x=>x.wrongAcceptance)},null,2));
const zero={candidateCount:0,verifiedMetricKeys:[],hasIndependentlyReviewedQualityPolicy:false,protocolComparable:false};
for(const q of [
'Quali robot mi fanno perdere meno tempo per la manutenzione?',
'Trovami i robot che sono in grado di salire gli scalini',
'E se cercassimo robot con vapore?',
'robot migliore qualità prezzo',
'non voglio lavaggio'] ){
 const r=planNativeResearch123(model,q,zero,ctx);
 console.log(JSON.stringify({query:q,status:r.next,label:r.proposal.label,metricMissing:r.unmet,queryHints:r.researchQueries}));
}
