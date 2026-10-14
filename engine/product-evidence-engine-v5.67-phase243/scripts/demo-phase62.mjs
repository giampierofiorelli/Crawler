/** All records, references, and values in this demo are fictional. */
import {writeFileSync} from 'node:fs';
import {fixture} from '../dist/tests/robustness_fixtures.js';
import {auditDecisionRobustness} from '../dist/src/decision_robustness.js';
const result=auditDecisionRobustness(fixture(),[
 {id:'no_battery_a',kind:'withhold_original_test',provenance:'analyst_stress_test',reference:'FICTIONAL whole-original-test sensitivity: first battery measurement withdrawn',originalTestId:'original_ba'},
 {id:'mic_is_essential',kind:'priority_alternative',provenance:'analyst_stress_test',reference:'FICTIONAL alternate requirement; not user validated',priorities:{mic:'essential'}},
 {id:'user_changes_mic',kind:'priority_alternative',provenance:'user_confirmed_alternative',reference:'FICTIONAL user-confirmed alternative for demonstration',priorities:{mic:'essential'}}
]);
const output=JSON.stringify({synthetic_fixture:true,not_real_source_data:true,not_a_recommendation:true,analysis:result},null,2);
if(process.argv[2])writeFileSync(process.argv[2],output+'\n');else console.log(output);
