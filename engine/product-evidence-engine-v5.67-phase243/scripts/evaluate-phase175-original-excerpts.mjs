import fs from 'node:fs';
import {analyzeNeedDiscourse175} from '../dist/src/phase175_disclosure_semantics.js';
const input=JSON.parse(fs.readFileSync('evaluation/phase175/public_short_original_excerpts.json','utf8'));
const results=[];
for(const c of input.originalSources){
 const x=analyzeNeedDiscourse175({question:c.verbatimShortOriginalSourceExcerpt,language:'en'});
 results.push({id:c.id,url:c.url,actualTask:x.task,roles:x.equipment.map(e=>({equipment:e.equipment,role:e.role,actor:e.actor})),
  unresolvedIssues:x.unresolvedIssues,unknownNeeds:x.unknownNeeds,requested:x.requestedEquipment,
  rank:false,decisionValidation:'not_assessed',parsingDiagnostic:'developer_inspection_required'});
}
const output={phase:175,kind:'short_public_original_excerpt_diagnostic_not_blinded_or_full_query_benchmark',
 sourceCount:results.length,accuracy:null,precision:null,recall:null,independentAnnotators:0,
 caveat:'The excerpts are partial and the developer was aware of source themes. No independent gold labels or population generalization.',results};
fs.writeFileSync('evaluation/phase175/public_original_excerpt_diagnostic.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
