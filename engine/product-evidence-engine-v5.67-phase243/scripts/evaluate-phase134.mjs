/** Reproducible, constructed scenarios. This is NOT a product-review benchmark. */
import {createHash} from 'node:crypto';
import {inspectAtomicCandidate134,inspectCandidateSet134} from '../dist/src/phase134_atomic_context_evidence.js';
import {writeFileSync} from 'node:fs';
const sha=s=>createHash('sha256').update(s).digest('hex');
const examples=[
 ['explicit_measurement','The airflow metric measures particle delivery.','airflow metric','particle delivery','measures'],
 ['missing_evidence','No evidence establishes that the steam feature measures surface sterilization.','steam feature','surface sterilization','measures'],
 ['missing_proof_not_ineffectiveness','No evidence establishes that the steam feature measures surface sterilization.','steam feature','surface sterilization','not_evidence_of'],
 ['explicit_negative','The heater does not improve dust removal.','heater','dust removal','contributes_to'],
 ['contracted_negative',"The heater doesn't improve dust removal.",'heater','dust removal','contributes_to'],
 ['uncertain_effect','The fan setting may improve particulate capture.','fan setting','particulate capture','contributes_to'],
 ['manufacturer_only','The manufacturer claims that its heater improves hygiene.','heater','hygiene','contributes_to'],
 ['multi_sentence','The robot has a heated dock. It removes more soil after two passes.','heated dock','more soil','contributes_to']
];
function sample([id,text,s,o,label]){
 const idxS=text.indexOf(s),idxO=text.indexOf(o);
 if(idxS<0||idxO<0)throw Error('bad_test_fixture');
 const source={id:`synthetic_${id}`,originalDocumentId:`synthetic_${id}_v1`,url:'https://example.org/not-a-real-review',title:'Constructed test fixture',role:'original_product_test'};
 const document={text,source,sha256:sha(text)};
 const candidate={id,label,subjectSpan:{start:idxS,end:idxS+s.length},objectSpan:{start:idxO,end:idxO+o.length},evidenceSpan:{start:0,end:text.length},sourceId:source.id,originalDocumentId:source.originalDocumentId,documentSha256:document.sha256,evidenceSha256:sha(text)};
 return {id,text,decision:inspectAtomicCandidate134({document,candidate})};
}
const rows=examples.map(sample);
const output={phase:134,date:'2026-10-11',dataset:'developer-authored-constructed-scenarios',real_original_reviews:0,independent_evaluation:false,model_accuracy_claim:false,
 policy:'hypotheses_only_no_autonomous_learning_or_ranking',counts:Object.fromEntries(['quarantined_candidate','abstain_for_review','rejected_candidate','invalid_source'].map(k=>[k,rows.filter(r=>r.decision.status===k).length])),rows};
writeFileSync(new URL('../PHASE134-CONSTRUCTED-SCENARIO-TRACE.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({scenarios:rows.length,counts:output.counts,allRankingAuthorized:rows.some(r=>r.decision.rankingAuthorized)},null,2));
