import fs from 'node:fs';
import {hygieneKnowledgeAudit114} from '../dist/src/phase114_hygiene_capability_audit.js';
const review=(id,url,kind,context,origin='independent_observation')=>({
 kind,origin,sourceUrl:url,originalTestId:id,context});
const s2='https://www.rtings.com/robot-vacuum/reviews/eufy/omni-s2';
const aqua='https://www.rtings.com/robot-vacuum/reviews/dreame/aqua10-ultra-roller';
const saros10='https://www.rtings.com/robot-vacuum/reviews/roborock/saros-10r';
const saros20='https://www.rtings.com/robot-vacuum/reviews/roborock/saros-20';
const entries=[
 {id:'eufy_omni_s2',name:'eufy Omni S2',facts:[
  review('rtings_s2_2026',s2,'wet_mopping_floor','hard_floor'),
  review('rtings_s2_2026',s2,'independent_stain_removal','hard_floor_dried_stain_performance_weak'),
  review('rtings_s2_2026',s2,'manufacturer_floor_germ_claim','on_floor_percentage_is_eufy_claim_not_rtings_microbiology','manufacturer_declaration'),
  review('rtings_s2_2026',s2,'dock_hot_mop_wash','mop_cleaned_at_dock')
 ]},
 {id:'dreame_aqua10_ultra_roller',name:'Dreame Aqua10 Ultra Roller',facts:[
  review('rtings_aqua10_2026',aqua,'wet_mopping_floor','hard_floor'),
  review('rtings_aqua10_2026',aqua,'continuous_clean_roller_rinse','during_floor_cleaning'),
  review('rtings_aqua10_2026',aqua,'independent_hard_floor_pickup','hard_floor_strong'),
  review('rtings_aqua10_2026',aqua,'dock_hot_mop_wash','dock_maintenance_not_floor')
 ]},
 {id:'roborock_saros_10r',name:'Roborock Saros 10R',facts:[
  review('rtings_saros10r_2025_updated2026',saros10,'wet_mopping_floor','hard_floor'),
  review('rtings_saros10r_2025_updated2026',saros10,'independent_stain_removal','hard_floor_stains_strong'),
  review('rtings_saros10r_2025_updated2026',saros10,'dock_hot_mop_wash','dock_only')
 ]},
 {id:'roborock_saros_20',name:'Roborock Saros 20',facts:[
  review('rtings_saros20_2026',saros20,'wet_mopping_floor','hard_floor'),
  review('rtings_saros20_2026',saros20,'independent_hard_floor_pickup','hard_floor_strong'),
  review('rtings_saros20_2026',saros20,'independent_stain_removal','hard_floor_stain_removal_worse_than_saros10r'),
  review('rtings_saros20_2026',saros20,'dock_hot_mop_wash','dock_only')
 ]}
];
const requests=[
 'Trovami tutti i migliori robot che igienizzano il pavimento',
 'Trovami i robot che igienizzano di più il pavimento'
];
const results=requests.map(q=>hygieneKnowledgeAudit114(q,entries,'manual_four_rtings_reviews_20261011'));
const output={caseDescription:'Manually reviewed, real professional RTINGS review evidence; small deliberately selected sample, not representative',
 testedReviewUrls:[s2,aqua,saros10,saros20],modelCalls:0,
 humanLabelledIntent:{first:'best_overall_with_capability',second:'maximize_floor_hygiene'},
 protocolNotes:'RTINGS Saros20 tested methodology v1.0; S2, Aqua10, Saros10R reported v1.1. No automatic cross-version numeric comparison.',
 findings:results};
fs.writeFileSync('audit/phase114/real-expert-review-intent-audit.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({objectives:results.map(x=>x.primaryGoal),examined:results[0].rows.length,
 microbeAssays:0,rankPublished:results[0].overallRanking!==null},null,2));
