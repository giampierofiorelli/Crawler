import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {CONCEPT_VOCABULARY248} from '../src/phase248_concept_vocabulary.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {applyLessons250,ADOPTED_LESSONS250} from '../src/phase250_category_lessons.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {AIR_FRYER_TEACHING269,RESEARCH_SOURCES269,COFFEE_TEACHING269,COFFEE_SOURCES269} from '../src/phase269_research_teaching.js';
import {AIR_FRYER_TEACHING270,COFFEE_TEACHING270,DEHUMIDIFIER_TEACHING270,SOURCES270,upgradeDehumidifierProvenance271} from '../src/phase270_teaching.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';

// Phase270 §9: the development failures U4, U6, C2 (Phase269 teaching set) and a package-B example; never the
// Phase270 generalisation requests.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee270t-'));let n=0;
function store(with270:boolean){
 const s=new KnowledgeStore246(join(dir,`t${++n}.sqlite`));
 for(const c of ['air_fryers','coffee_machines'])seedCategoryHypotheses246(s,c,'2026-10-16T08:00:00.000Z');
 for(const [id,al] of Object.entries(CONCEPT_VOCABULARY248.coffee_machines))s.addConceptAliases246('coffee_machines',id,al);
 applyLessons250(s,ADOPTED_LESSONS250,'2026-10-16T08:00:00.000Z');
 registerTeachingSources252([...RESEARCH_SOURCES269,...COFFEE_SOURCES269,...SOURCES270]);
 applyTeaching252(s,[AIR_FRYER_TEACHING269,COFFEE_TEACHING269],'2026-10-16T08:30:00.000Z');
 if(with270)applyTeaching252(s,[AIR_FRYER_TEACHING270,COFFEE_TEACHING270,DEHUMIDIFIER_TEACHING270],'2026-10-17T08:30:00.000Z');
 return s;
}
const ask=(s:KnowledgeStore246,t:string)=>adviseFromRequest253(t,s,CATEGORY_REGISTRY250);
const U4='Best dual zone air fryer for cooking two different things for dinner at the same time?';
const U6="Which air fryer will use the least power when I'm just reheating leftovers for one?";
const C2='Which espresso machine makes the best-tasting traditional Italian espresso at home?';

test('the development recognition gaps close through teaching, with the taught measurement and its condition',()=>{
 const before=store(false),after=store(true);
 assert.ok(!ask(before,U4).needs.includes('cook_two_foods_simultaneously'));
 const u4=ask(after,U4);assert.ok(u4.needs.includes('cook_two_foods_simultaneously'));
 const o=u4.goalAssessment!.outcomes.find(x=>x.need==='cook_two_foods_simultaneously')!;
 assert.deepEqual([o.relevantMeasures,o.conditionsByMeasure,o.coverage],[['two_zone_cooking_test'],[{measure:'two_zone_cooking_test',conditions:['compartments_in_use']}],'unassessed']);
 assert.ok(!ask(before,U6).needs.includes('low_energy_use'));assert.ok(ask(after,U6).needs.includes('low_energy_use'));
 const c2=ask(after,C2);assert.ok(c2.needs.includes('espresso_quality'));
 assert.deepEqual(c2.goalAssessment!.outcomes.find(x=>x.need==='espresso_quality')!.relevantMeasures,['espresso_sensory_assessment']);
 before.close();after.close();
});

test('dehumidifiers: package-B teaching registers the category; every lesson is marked as awaiting source verification',()=>{
 const s=store(true);
 const a=ask(s,'My bedroom smells damp. Which dehumidifier should I get?');
 assert.equal(a.category,'dehumidifiers');assert.ok(a.needs.includes('moisture_removal'));
 const o=a.goalAssessment!.outcomes.find(x=>x.need==='moisture_removal')!;
 assert.deepEqual([o.relevantMeasures,o.rejectedProxies,o.conditionsByMeasure],[['removal_at_room_conditions'],['attr:capacity'],[{measure:'removal_at_room_conditions',conditions:['matched_temperature_humidity']}]]);
 assert.ok(a.unassessedObjectives.includes('moisture_removal'));assert.notEqual(a.response,'ranked_recommendation');
 const items=s.categoryItems246('dehumidifiers').filter(i=>i.provenance==='assistant_authored_unreviewed'&&i.section!=='user_goals');
 assert.ok(items.length>=8);assert.ok(items.every(i=>/Awaiting source verification|register \(R01-R37\) is missing/.test(i.statement)),'every lesson says its references are unverified');
 // A leak is a context: the decision is a no-purchase check, not a purchase.
 const leak=ask(s,'Water came in after rain and now there is mould behind the bed. Do I need a dehumidifier?');
 assert.equal(leak.goalAssessment!.decision,'no_purchase_check');
 s.close();
});

test('Phase271: the restored R01-R39 register replaces "awaiting source verification" without losing the taught relations',()=>{
 const s=store(true);const r=upgradeDehumidifierProvenance271(s,'2026-10-17T12:00:00.000Z');assert.ok(r.retired>=8,JSON.stringify(r));
 const active=s.categoryItems246('dehumidifiers').filter(i=>i.section!=='user_goals');
 assert.ok(active.every(i=>!/Awaiting source verification/.test(i.statement)));
 assert.ok(active.filter(i=>i.provenance==='assistant_authored_unreviewed').every(i=>/not re-verified by PEE|not reopened by PEE/.test(i.statement)),'no lesson claims PEE verified a source');
 const a=ask(s,'My bedroom smells damp. Which dehumidifier should I get?');const o=a.goalAssessment!.outcomes.find(x=>x.need==='moisture_removal')!;
 assert.deepEqual([o.relevantMeasures,o.rejectedProxies,o.conditionsByMeasure],[['removal_at_room_conditions'],['attr:capacity'],[{measure:'removal_at_room_conditions',conditions:['matched_temperature_humidity']}]]);
 assert.deepEqual(upgradeDehumidifierProvenance271(s,'2026-10-17T12:00:00.000Z').retired,0,'idempotent');
 s.close();
});
