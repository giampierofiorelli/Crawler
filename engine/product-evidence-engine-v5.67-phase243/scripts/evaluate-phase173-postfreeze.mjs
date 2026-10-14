/** Run post-implementation, never independently labeled, online paraphrase diagnostics. */
import fs from 'node:fs';
import {researchTaskScope173} from '../dist/src/phase173_goal_scope_adapter.js';
import {proposeNeedMechanismGraph173} from '../dist/src/phase173_need_mechanism_graph.js';
const root=JSON.parse(fs.readFileSync('evaluation/phase173/postfreeze_public_challenge.json','utf8'));
const output={phase:173,status:root.status,notAnAccuracyBenchmark:true,developerParaphraseInputs:true,
 results:root.cases.map(c=>{
  const x=researchTaskScope173({question:c.paraphrase,language:'en'});
  const graph=proposeNeedMechanismGraph173(x);
  return {id:c.id,sourceUrl:c.sourceUrl,task:x.task,target:x.target,ownedEquipment:x.ownedEquipment,
   candidateNeedIds:x.needs.map(n=>n.id),unresolvedIssues:x.unresolvedIssues,
   links:graph.links.length,missingMethodLinks:graph.links.filter(l=>l.methodStatus==='original_method_missing').length,
   rankingAuthorized:x.rankingAuthorized};
 })};
fs.writeFileSync('evaluation/phase173/postfreeze_public_diagnostic.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
