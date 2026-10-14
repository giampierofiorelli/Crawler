import {readFileSync,writeFileSync} from 'node:fs';
import {inspectSparseEvidence191} from '../dist/src/phase191_sparse_source_integrity.js';
const dossier=JSON.parse(readFileSync('evaluation/phase189/annotated-live-source-pilot.json','utf8'));
const ctx=dossier.sourcePages.map(s=>({sourceId:s.id,relationship:'independent_editorial',
 money:'undisclosed_or_unknown',method:'original_measurement_protocol_described',
 productSupply:s.id.startsWith('notebookcheck')?'loaned':'unknown',
 provenanceLevel:'unverified_annotation',evidenceLocator:'Manual research review of methodology, not publisher-file custody.',
 independenceNote:'Annotation supports cautious categorisation only; never external admission.'}));
const origins=dossier.records.map(r=>({recordId:r.id,origin:r.kind==='instrument_measurement'?'publisher_performed_original_test':
 r.kind==='manufacturer_statement'?'manufacturer_provided_claim':r.kind==='editorial_interpretation'?'republication_or_inference':
 r.kind==='owner_anecdote'?'consumer_experience':'publisher_performed_original_test',
 methodTrace:['instrument_measurement','structured_expert_assessment','contextual_expert_observation'].includes(r.kind)?
 'manually_traced_to_original_method':'source_attribution_only',
 originLocator:'Phase189 hand-annotated source location; external signature not verified.'}));
const items=[
 {candidate:{category:'vacuum',variantId:'dyson_v15_detect',name:'Dyson V15 Detect'},
  question:{id:'dyson_bare_noise',category:'vacuum',variantId:'dyson_v15_detect',field:'operating_noise',
   protocol:'rtings_vacuum_v1.4',condition:'bare_floor',kind:'numeric_maximum',threshold:72,unit:'dba'},required:false},
 {candidate:{category:'laptop',variantId:'thinkbook_16_g7_qoy_21nh0005ge',name:'ThinkBook 16 G7 QOY test SKU'},
  question:{id:'laptop_web_battery',category:'laptop',variantId:'thinkbook_16_g7_qoy_21nh0005ge',
   field:'wifi_battery_runtime',protocol:'notebookcheck_wifi_v1.3',condition:'edge131_150nits',kind:'numeric_minimum',threshold:24,unit:'hours'},required:false},
 {candidate:{category:'headphones',variantId:'bose_headphones_700',name:'Bose Headphones 700'},
  question:{id:'headphone_anc',category:'headphones',variantId:'bose_headphones_700',field:'anc_attenuation_410hz',
   protocol:'soundguys_anc_curve',condition:'anc_on_410hz',kind:'numeric_minimum',threshold:12,unit:'db'},required:false},
 {candidate:{category:'dehumidifier',variantId:'unresearched_fixture',name:'Unknown demonstrator'},
  question:{id:'unknown_room',category:'dehumidifier',variantId:'unresearched_fixture',field:'water_removal',
   protocol:'unknown_method',condition:'standard',kind:'numeric_minimum',threshold:15,unit:'litres_per_day'},required:true},
];
const out=inspectSparseEvidence191({dossier,contexts:ctx,origins,requests:items});
writeFileSync('evaluation/phase191/source-ecology-research-demo.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({findings:out.findings.map(f=>({variantId:f.variantId,knowledgeState:f.knowledgeState,
 sourceCoverage:f.sourceCoverage,rankingPermitted:f.rankingPermitted})),publicRankingAllowed:out.publicRankingAllowed},null,2));
