/** Qualitative developer-annotated examples only; not an accuracy benchmark. */
import {readFileSync,writeFileSync} from 'node:fs';
import {researchUserGoal172} from '../dist/src/phase172_goal_suitability_guide.js';
import {mapGoalToMethodResearch172} from '../dist/src/phase172_domain_protocol_registry.js';
const inFile='evaluation/phase172/new_public_challenge_cases.json';
const data=JSON.parse(readFileSync(inFile,'utf8'));
const out=data.cases.map(c=>{
 const p=researchUserGoal172({question:c.paraphrase,language:'en'});
 const actual=p.candidates.map(x=>x.id);
 const hard=p.hardConstraintCandidates.map(x=>x.id);
 const methods=mapGoalToMethodResearch172(p);
 const missing=c.expectedCandidateIds.filter(x=>!actual.includes(x));
 const unexpected=actual.filter(x=>!c.expectedCandidateIds.includes(x));
 const hardMissing=(c.expectedHardConstraintIds??[]).filter(x=>!hard.includes(x));
 return {id:c.id,sourceUrl:c.sourceUrl,developerProposedCategory:c.category,inferredCategory:p.category,
  categoryDisagrees:c.category!==p.category,developerProposedCandidateIds:c.expectedCandidateIds,
  observedCandidateIds:actual,missing,unexpected,hardCandidateIds:hard,hardMissing,
  methodDimensionsWithoutRegistryCoverage:methods.dimensions.filter(x=>!x.methods.length).map(x=>x.dimension),
  rankingAuthorized:p.rankingAuthorized,originalSourceEvaluatedByModel:false};
});
const report={date:'2026-10-12',nature:'developer_paraphrase_challenge_diagnostic_not_blinded_accuracy',
 sourceCount:out.length,categoryDisagreements:out.filter(x=>x.categoryDisagrees).length,
 casesWithDeveloperLabelDisagreements:out.filter(x=>x.categoryDisagrees||x.missing.length||x.unexpected.length||x.hardMissing.length).length,
 metricValidity:'NOT accuracy: developer-proposed labels, incomplete semantics, sample not representative, no independent annotators',
 cases:out};
writeFileSync('evaluation/phase172/new_public_challenge_diagnostic.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sources:report.sourceCount,categoryDisagreements:report.categoryDisagreements,
 casesWithDeveloperLabelDisagreements:report.casesWithDeveloperLabelDisagreements},null,2));
for(const x of out.filter(x=>x.categoryDisagrees||x.missing.length||x.unexpected.length||x.hardMissing.length))
 console.log('REVIEW',x.id,'category:',x.inferredCategory,'extra:',x.unexpected,'missing:',x.missing,'hard missing:',x.hardMissing);
