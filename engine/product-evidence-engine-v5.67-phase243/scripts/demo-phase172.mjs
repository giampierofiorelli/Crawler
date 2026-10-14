/** Phase172 bounded diagnostic on PARAPHRASED public posts, not independent evaluation. */
import {readFileSync,writeFileSync} from 'node:fs';
import {researchUserGoal172,explainGoalResearch172} from '../dist/src/phase172_goal_suitability_guide.js';
const cases=JSON.parse(readFileSync('evaluation/phase172/public_usage_seed.json','utf8'));
const rows=cases.cases.map(c=>{
 const p=researchUserGoal172({question:c.paraphrase,language:'en'});
 const display=explainGoalResearch172(p);
 return {id:c.id,sourceUrl:c.sourceUrl,category:p.category,categoryBasis:p.categoryBasis,
  detectedHypothesisIds:p.candidates.map(x=>x.id),dimensions:p.unresolvedDimensions,
  askedQuestion:display.nextQuestion,brief:display.brief,immediateCautions:display.mustSeeNow,
  hasIndependentGroundTruth:false,claimOfAccuracy:false,rankingAuthorized:false};
});
const result={experiment:'phase172_public_post_paraphrase_smoke_diagnostic',
 evaluatedWithNeuralModel:false,representativeSample:false,
 independentAnnotations:false,doesNotMeasureAccuracy:true,cases:rows};
writeFileSync('evaluation/phase172/public_usage_diagnostic.json',JSON.stringify(result,null,2)+'\n');
console.log(rows.map(r=>`${r.id}: ${r.category} | ${r.detectedHypothesisIds.join(',')}`).join('\n'));
