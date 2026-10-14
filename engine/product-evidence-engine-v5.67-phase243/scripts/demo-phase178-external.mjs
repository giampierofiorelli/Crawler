import {readFileSync,writeFileSync} from 'node:fs';
import {proposeWebIntake177} from '../dist/src/phase177_web_intake.js';
const path='evaluation/phase178/external-public-post-diagnostic-inputs.json';
const input=JSON.parse(readFileSync(path,'utf8'));
const results=input.cases.map(c=>{const r=proposeWebIntake177(c.paraphrase);return {id:c.id,url:c.url,intentReviewTarget:c.intent,reviewerTargets:c.reviewTargets,originalEnglishRequest:r.originalEnglishRequest,equipmentRoles:r.equipmentRoles,suggestions:r.suggestions.map(s=>({key:s.key,label:s.label,span:s.observedSpan})),unresolvedIssues:r.unresolvedIssues,hasUnmappedGoal:r.unmappedGoalText!==null,confirmedNeeds:r.hasConfirmedNeeds,rankingAuthorized:r.rankingAuthorized}});
writeFileSync('evaluation/phase178/external-public-post-diagnostic-results.json',JSON.stringify({phase:178,benchmarkAccuracyClaim:false,independentHumanAnnotation:false,afterCodeFreeze:true,results},null,2)+'\n');
console.log('External public-post diagnostic executed:',results.length,'cases. No blind accuracy estimate.');
for(const r of results)console.log(r.id,'hypotheses',r.suggestions.length,'unmapped',r.hasUnmappedGoal);
