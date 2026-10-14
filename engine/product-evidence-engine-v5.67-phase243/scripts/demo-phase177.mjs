// Deterministic web-state demonstration without product claims.
import {initWebsiteDecision177,renderWebDecision177} from '../dist/src/phase177_web_intake.js';
import {applyDecisionAction177,undoDecision177,compareDecisions177} from '../dist/src/phase177_decision_snapshot.js';
const q='I need a water filter for PFAS, and replacement filter costs matter.';
const {snapshot:start,intake}=initWebsiteDecision177('web_demo',q);
if(intake.suggestions.length<2)throw Error('missing_known_bounded_candidates');
const first=start.criteria[0];
const {snapshot:confirmed}=applyDecisionAction177(start,{type:'confirm_candidate',source:'user_web_control',key:first.key,priority:'hard'});
const {snapshot:changed}=applyDecisionAction177(confirmed,{type:'set_priority',source:'user_web_control',key:first.key,priority:'low'});
const {snapshot:restored}=undoDecision177(changed,confirmed);
const result={phase:177,question:q,initialRevision:start.revision,candidateKeys:start.criteria.map(x=>x.key),
  editRevision:confirmed.revision,changeRevision:changed.revision,undoRevision:restored.revision,
  changedInputs:compareDecisions177(confirmed,changed).changeInConfirmedInputs,
  undoPreservesConfirmedInputs:compareDecisions177(restored,confirmed).rankInputsEqual,
  view:renderWebDecision177(restored),rankingAuthorized:false};
console.log(JSON.stringify(result,null,2));
