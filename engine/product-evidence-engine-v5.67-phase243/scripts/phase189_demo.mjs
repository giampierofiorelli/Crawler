import {readFileSync,writeFileSync} from 'node:fs';
import {assessQuestion189,auditStrictPareto189} from '../dist/src/phase189_source_pilot_reasoning.js';
const d=JSON.parse(readFileSync('evaluation/phase189/annotated-live-source-pilot.json','utf8'));
const questions=[
 {id:'dyson_floor_noise_max72',category:'vacuum',variantId:'dyson_v15_detect',field:'operating_noise',condition:'bare_floor',protocol:'rtings_vacuum_v1.4',kind:'numeric_maximum',threshold:72,unit:'dba'},
 {id:'shark_floor_noise_max72',category:'vacuum',variantId:'shark_stratos_iz862h',field:'operating_noise',condition:'bare_floor',protocol:'rtings_vacuum_v1.4',kind:'numeric_maximum',threshold:72,unit:'dba'},
 {id:'lenovo_24hr_wifi',category:'laptop',variantId:'thinkbook_16_g7_qoy_21nh0005ge',field:'wifi_battery_runtime',condition:'edge131_150nits',protocol:'notebookcheck_wifi_v1.3',kind:'numeric_minimum',threshold:24,unit:'hours'},
 {id:'lenovo_24hr_gaming_not_inferred',category:'laptop',variantId:'thinkbook_16_g7_qoy_21nh0005ge',field:'wifi_battery_runtime',condition:'gaming_full_brightness',protocol:'notebookcheck_wifi_v1.3',kind:'numeric_minimum',threshold:24,unit:'hours'},
 {id:'bose_anc_410hz_min18',category:'headphones',variantId:'bose_headphones_700',field:'anc_attenuation_410hz',condition:'anc_on_410hz',protocol:'soundguys_anc_curve',kind:'numeric_minimum',threshold:18,unit:'db'},
 {id:'bose_airplane_broadband_unknown',category:'headphones',variantId:'bose_headphones_700',field:'anc_attenuation_410hz',condition:'aircraft_cabin_all_frequencies',protocol:'soundguys_anc_curve',kind:'numeric_minimum',threshold:18,unit:'db'},
];
const findings=questions.map(q=>assessQuestion189(d,q));
const pareto=auditStrictPareto189(d,{category:'vacuum',variantA:'dyson_v15_detect',variantB:'shark_stratos_iz862h',criteria:[
 {field:'hose_airflow',protocol:'rtings_vacuum_v1.4',condition:'maximum_hose_airflow',unit:'cfm',direction:'higher'},
 {field:'operating_noise',protocol:'rtings_vacuum_v1.4',condition:'bare_floor',unit:'dba',direction:'lower'}]});
const result={phase:189,sourceType:'manually_paraphrased_original_review_pages',notApprovedForRanking:true,
 rawOriginalReviewsIncluded:false,sourcePageCount:d.sourcePages.length,atomicRecordCount:d.records.length,
 categoryCount:new Set(d.records.map(r=>r.category)).size,findings,pareto};
writeFileSync('evaluation/phase189/research-pilot-results.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({sourcePageCount:result.sourcePageCount,atomicRecordCount:result.atomicRecordCount,
 categoryCount:result.categoryCount,findings:findings.map(x=>[x.questionId,x.state]),pareto:pareto.state},null,2));
