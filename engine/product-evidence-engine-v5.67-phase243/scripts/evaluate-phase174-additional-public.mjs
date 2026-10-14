import fs from 'node:fs';
import {researchCategoryTransfer174} from '../dist/src/phase174_category_transfer_probe.js';
const input=JSON.parse(fs.readFileSync('evaluation/phase174/additional_public_development_cases.json','utf8'));
const outputs=input.cases.map(c=>{
 const r=researchCategoryTransfer174({question:c.input,language:'en'});
 return {id:c.id,source:c.source,input:c.input,issueToCheck:c.issueToCheck,target:r.target,
  task:r.task,owned:r.ownedEquipmentEvidence174,recognized:r.facets.map(f=>`${f.id}:${f.polarity}`),
  issues:r.unresolvedIssues,clarification:r.clarification,rankingAuthorized:r.rankingAuthorized};
});
const out={phase:174,unseenDuringInitialRules:true,subsequentlyObservedDuringDevelopment:true,
 independentlyAnnotated:false,benchmarkAccuracyEstablished:false,performanceClaimsSupported:false,cases:outputs};
fs.writeFileSync('evaluation/phase174/additional_public_development_diagnostic.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(outputs.map(({id,target,task,recognized,issues})=>({id,target,task,recognized,issues})),null,2));
