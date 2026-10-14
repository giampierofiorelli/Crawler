import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {discoverEntityInventory153} from '../dist/src/phase153_entity_inventory.js';
const sha=t=>createHash('sha256').update(t).digest('hex');
// Examined after initial code and the earlier nine short-excerpt developer
// diagnostics. Intentionally not used for fixes in this phase. Not a gold set.
const cases=[
 {id:'p153_postcode_reviewed_bosch',url:'https://www.reviewed.com/dishwashers/best-right-now/best-bosch-dishwashers/',publisher:'Reviewed',category:'dishwasher',
 title:'Best Bosch Dishwashers 2026',text:'Bosch 800 Series SHP78CM5N',targets:['Bosch 800 Series SHP78CM5N']},
 {id:'p153_postcode_expertreviews_eufy',url:'https://www.expertreviews.co.uk/home-garden/vacuums-cleaning/eufy-clean-x10-pro-omni-review',publisher:'Expert Reviews',category:'robot_vacuum',
 title:'Eufy Clean X10 Pro Omni review',text:'The Eufy Clean X10 Pro Omni has gathered them all into one convenient package.',targets:['Eufy Clean X10 Pro Omni']},
 {id:'p153_postcode_techhive_robot',url:'https://www.techhive.com/article/2340503/roborock-s8-maxv-ultra-review.html',publisher:'TechHive',category:'robot_vacuum',
 title:'Roborock S8 MaxV Ultra review',text:'Alternatives like the Eufy X10 Pro Omni and iRobot Roomba j9+ offer comparable or even better performance.',targets:['Eufy X10 Pro Omni','iRobot Roomba j9+']}
];
const results=cases.map(c=>{
 const d={document:{text:c.text,sha256:sha(c.text),source:{id:c.id,originalDocumentId:c.id,url:c.url,title:c.title,role:'original_product_test'}}};
 const g=discoverEntityInventory153(d);return {id:c.id,url:c.url,publisher:c.publisher,category:c.category,
 excerpt:c.text,excerptSha256:sha(c.text),targets:c.targets.map(target=>({target,located:g.mentions.some(m=>m.span.literal===target)})),
 observedCandidates:g.mentions.map(m=>m.span.literal),independentAnnotation:false,scientificEvidence:false};
});
const report={phase:153,origin:'postcode_short_excerpt_challenge_not_independent',tuningWithTheseExamples:false,
 validatedFullReviews:0,independentAnnotators:0,precision:null,recall:null,rows:results,
 matched:results.flatMap(r=>r.targets).filter(x=>x.located).length,
 targetCount:results.flatMap(r=>r.targets).length,
 errors:results.flatMap(r=>r.targets.filter(x=>!x.located).map(x=>({sourceId:r.id,target:x.target})))};
writeFileSync('PHASE153-POSTCODE-CHALLENGE.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({matched:report.matched,targetCount:report.targetCount,errors:report.errors},null,2));
