/** Replay previously frozen (Phase124) authentic-user sample without tuning labels. */
import {readFileSync,writeFileSync} from 'node:fs';
import {composeQuestion125,floorRobotSchema125} from '../dist/src/phase125_compositional_dialogue_frame.js';
const source=JSON.parse(readFileSync('research/phase124_authentic_questions.json','utf8'));
const labels={autonomy:'autonomy',value:'value',performance:'performance',capability:'capability_discovery'};
const records=source.cases.map(c=>{
 const verifiedCategory={categoryId:'floor_cleaning_robot',categoryVerified:true};
 const frame=composeQuestion125(c.text,[floorRobotSchema125],verifiedCategory);
 const expected=labels[c.expected];
 // Non-comparable open anaphora must not count as resolved, even if best-performance lexical cue matches.
 const accepted=frame.status==='candidate_needs_evidence'&&frame.goals.includes(expected);
 return {id:c.id,originalSourceUrl:c.source,expectedGoal:expected,goals:frame.goals,
  status:frame.status,aspects:frame.aspects.map(x=>({id:x.aspectId,role:x.role})),
  userBudget:frame.userBudget,hazards:frame.hazards,acceptedExpectedGoal:accepted,
  independentSemanticValidation:false,measuresOrRankingsGenerated:false};
});
const obj={phase:125,comparedAgainst:'phase124 frozen user questions (visible in development, NOT blind)',
 promptCount:records.length,goalAcceptedWithNoDetectedHazards:records.filter(x=>x.acceptedExpectedGoal).length,
 missingOrReview:records.filter(x=>!x.acceptedExpectedGoal).length,
 allSourceUrlsPreserved:true,
 warning:'Developer-created evaluation and goal annotations; not statistically representative; acceptance does NOT establish real meaning or independent correctness.',
 records};
writeFileSync('PHASE125-FROZEN-QUESTION-DIAGNOSTIC.json',JSON.stringify(obj,null,2)+'\n');
console.log(JSON.stringify({promptCount:obj.promptCount,accepted:obj.goalAcceptedWithNoDetectedHazards,
 review:obj.missingOrReview,records:records.map(x=>[x.id,x.goals,x.status,x.hazards])},null,2));
