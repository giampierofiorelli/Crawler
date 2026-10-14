// This audit uses independently READ (but manually structured) expert observations.
// No automated article parsing; no microbial assay and no retail/price data.
import {hygieneProcessAudit115} from '../../dist/src/phase115_hygiene_process_reasoning.js';
import {writeFileSync} from 'node:fs';
const R='https://www.rtings.com/robot-vacuum/reviews/';
const V='https://vacuumwars.com/narwal-flow-review/';
const common=(step,target,sourceUrl,originalTestId,context='reviewed conditions, hardwood/tiles')=>({step,target,finding:'present',origin:'independent_product_test',sourceUrl,originalTestId,method:'hands-on professional qualitative observations; see original review for protocol',context});
const products=[
 {id:'dreame_aqua10_ultra_roller',name:'Dreame Aqua10 Ultra Roller',evidence:[
 common('wet_floor_wiping','floor',R+'dreame/aqua10-ultra-roller','rtings_aqua10_v1_1'),
 common('during_cycle_pad_rinsing','pad',R+'dreame/aqua10-ultra-roller','rtings_aqua10_v1_1'),
 common('post_cycle_pad_washing','pad',R+'dreame/aqua10-ultra-roller','rtings_aqua10_v1_1'),
 common('pad_drying','pad',R+'dreame/aqua10-ultra-roller','rtings_aqua10_v1_1'),
 common('expert_warns_pet_waste_transfer','floor',R+'dreame/aqua10-ultra-roller','rtings_aqua10_v1_1','reviewer warning based on risk of failing pet waste avoidance')
 ]},
 {id:'roborock_saros_10r',name:'Roborock Saros 10R',evidence:[
 common('wet_floor_wiping','floor',R+'roborock/saros-10r','rtings_saros10r_v1_1'),
 common('post_cycle_pad_washing','pad',R+'roborock/saros-10r','rtings_saros10r_v1_1')
 ]},
 {id:'eufy_omni_s2',name:'eufy Omni S2',evidence:[
 common('wet_floor_wiping','floor',R+'eufy/omni-s2','rtings_s2_v1_1'),
 common('dock_heated_pad_washing','dock',R+'eufy/omni-s2','rtings_s2_v1_1'),
 common('post_cycle_pad_washing','pad',R+'eufy/omni-s2','rtings_s2_v1_1')
 ]},
 {id:'narwal_flow',name:'Narwal Flow',evidence:[
 common('wet_floor_wiping','floor',V,'vacuumwars_narwal_flow_2026'),
 common('heated_water_on_floor','floor',V,'vacuumwars_narwal_flow_2026'),
 common('during_cycle_pad_rinsing','pad',V,'vacuumwars_narwal_flow_2026'),
 common('onboard_dirty_water_capture','onboard_water',V,'vacuumwars_narwal_flow_2026'),
 common('post_cycle_pad_washing','pad',V,'vacuumwars_narwal_flow_2026')
 ]}
];
const audit=hygieneProcessAudit115('Trovami tutti i migliori robot che igienizzano il pavimento',products,'v115_original_review_manual_20261011');
writeFileSync('audit/phase115/manual-original-review-mechanism-audit.json',JSON.stringify({audit,sourceMethod:'manually structured from original professional articles reviewed via public web; not live crawler/LLM nor a measured microbiological comparison',reviewedSourceUrls:[R+'dreame/aqua10-ultra-roller',R+'roborock/saros-10r',R+'eufy/omni-s2',V]},null,2));
console.log(JSON.stringify({products:audit.products.map(x=>({id:x.id,mechanisms:x.claims.map(c=>c.id),independentlyTestedFloorBacteria:x.assays.bacteria.length,independentlyTestedFloorViruses:x.assays.viruses.length})),rankedProducts:audit.rankedProducts,clarification:audit.clarification},null,2));
