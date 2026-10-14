import fs from 'node:fs';
import {researchCategoryTransfer174} from '../dist/src/phase174_category_transfer_probe.js';
const input=JSON.parse(fs.readFileSync('evaluation/phase174/public_usage_development_cases.json','utf8'));
const cases=input.items.map(item=>{
 const x=researchCategoryTransfer174({question:item.input,language:'en'});
 return {id:item.id,source:item.source,input:item.input,reviewFocus:item.reviewFocus,
  observedTarget:x.target,targetBasis:x.targetBasis,task:x.task,
  recognizedFacetIds:x.facets.filter(f=>f.polarity==='wanted').map(f=>f.id),
  nonRequestedFacets:x.facets.filter(f=>f.polarity!=='wanted').map(f=>({id:f.id,polarity:f.polarity})),
  unresolvedIssues:x.unresolvedIssues,clarification:x.clarification,
  methodCoverage:x.methodPointers.map(m=>({facet:m.facetId,observable:m.observable,status:m.methodStatus})),
  rankAuthorized:x.rankingAuthorized};
});
const result={phase:174,sourceStatus:input.status,benchmarkAccuracyEstablished:false,
  authorsOfLabelsIndependent:false,publicPostOriginalsAreProductEvidence:false,
  cases};
fs.writeFileSync('evaluation/phase174/public_usage_development_diagnostic.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({count:cases.length,summary:cases.map(x=>({id:x.id,task:x.task,target:x.observedTarget,facets:x.recognizedFacetIds,issues:x.unresolvedIssues}))},null,2));
