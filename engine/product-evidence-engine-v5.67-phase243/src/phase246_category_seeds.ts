/** Phase246 — initial category profiles for air fryers, coffee machines and toasters.
 *
 * Every item here is ASSISTANT-AUTHORED and UNREVIEWED ('technical_hypothesis'). They are research questions
 * and plausible technical framings that direct what to look for, not facts. None states that a product,
 * brand or feature is better. Promotion to 'reviewed_general_knowledge' or 'evidence_supported_finding'
 * happens only through KnowledgeStore246.reviewCategoryItem246 with a verified receipt and cited revisions.
 */
import type {KnowledgeStore246,CategorySection246} from './phase246_knowledge_store.js';
import type {StudyStream179} from './phase179_category_learning.js';
import type {ConceptKind128} from './phase128_category_cognition_dialogue_bridge.js';

type Seed=[CategorySection246,string,StudyStream179?,{kind:ConceptKind128;id:string;aliases:string[]}?];
export const CATEGORY_ALIASES246:Record<string,string[]>={
 air_fryers:['air fryer','airfryer','air fryers'],coffee_machines:['coffee machine','espresso machine','coffee maker'],toasters:['toaster','toasters']};

export const CATEGORY_SEEDS246:Record<string,Seed[]>={
 air_fryers:[
  ['user_goals','Cook small portions for one person without heating a full oven.','user_outcomes',{kind:'task',id:'cook_single_portion',aliases:['cook for one','single portion']}],
  ['user_goals','Get crisp exterior texture on chips and breaded foods with little added oil.','user_outcomes',{kind:'outcome',id:'crisp_texture',aliases:['crispy','crisp results','crispiness']}],
  ['user_goals','Cook two different foods at once with different settings and finish them together.','user_outcomes',{kind:'task',id:'cook_two_foods_simultaneously',aliases:['dual basket','two zones','cook two foods']}],
  ['user_questions','What is the best air fryer for someone living alone?','user_outcomes'],
  ['user_questions','Which air fryer cooks food most evenly and produces genuinely crispy results?','user_outcomes'],
  ['user_questions','Is a dual-basket model worthwhile for someone with a small kitchen?','user_outcomes'],
  ['product_subtypes','Subtypes include single drawer/basket, dual drawer (two independent zones), oven-style with shelves, and lid add-ons; they differ in footprint, loading geometry and airflow path.','equipment_families'],
  ['mechanisms','A heating element above the food and a fan circulate hot air; airflow distribution across the basket, not total volume, plausibly governs evenness.','technical_mechanisms',{kind:'mechanism',id:'forced_hot_air_convection',aliases:['hot air circulation','convection fan']}],
  ['mechanisms','Food in a single layer exposes more surface to moving air; overfilling plausibly reduces crisping, so usable crisping capacity may be smaller than declared volume.','technical_mechanisms'],
  ['technical_characteristics','Declared characteristics typically include drawer volume in litres, rated power in watts, temperature range, number of zones, presets, dimensions and dishwasher-safe parts.','product_variant_observations'],
  ['performance_outcomes','Relevant outcomes: browning/crisping uniformity across the basket, time to cook a standard load, moisture retention, noise, and odour; none follows directly from declared watts or litres.','observable_performance',{kind:'outcome',id:'cooking_evenness',aliases:['cooks evenly','even cooking','evenness']}],
  ['spec_need_relevance','Drawer volume bounds batch size for one person versus a family, but the usable single-layer floor area may matter more for crisp foods than litres.','critical_feasibility'],
  ['spec_need_relevance','External footprint and height matter for a small kitchen; a dual-drawer unit may be wider than a single drawer of the same total volume.','critical_feasibility',{kind:'environment',id:'small_kitchen',aliases:['small kitchen','limited counter space']}],
  ['quality_measurements','Professional methods to look for: standard chip/frozen-food loads with browning assessment across positions, time-to-temperature, measured temperature accuracy, energy use per cycle, noise level.','original_test_methods'],
  ['constraints_requirements','Counter space, cupboard height, socket power and household size constrain the suitable capacity and format.','critical_feasibility'],
  ['failure_modes_safety','Hot exterior surfaces, non-stick coating wear, basket handle failure and smoke from fat build-up are failure modes to verify from reports and tests, not from listings.','contradictions_and_limits',{kind:'failure',id:'coating_wear',aliases:['non-stick wear','coating peeling']}],
  ['trade_offs','Larger or dual-zone units add flexibility but take more space and may preheat and clean less conveniently; a hypothesis to test, not a rule.','contradictions_and_limits'],
  ['trade_offs','Cleaning effort depends on basket and crisper-plate design and dishwasher compatibility; declared dishwasher-safe does not establish ease of cleaning.','observable_performance',{kind:'outcome',id:'cleaning_effort',aliases:['easy to clean','cleaning difficulty']}],
  ['unknowns_priorities','Unknown: whether declared capacity correlates with usable crisping area; priority is finding original tests that report evenness by basket position.','critical_feasibility'],
 ],
 coffee_machines:[
  ['user_goals','Make espresso-based drinks with good taste and little effort.','user_outcomes',{kind:'outcome',id:'espresso_quality',aliases:['good espresso','espresso quality']}],
  ['user_goals','Get reliable, repeatable coffee with low routine maintenance.','user_outcomes',{kind:'outcome',id:'low_maintenance',aliases:['little maintenance','low maintenance','easy upkeep']}],
  ['user_questions','Which coffee machine makes genuinely good espresso with minimal effort?','user_outcomes'],
  ['user_questions','What should someone prioritize if they want reliable coffee but very little maintenance?','user_outcomes'],
  ['product_subtypes','Machine types: manual/semi-automatic pump espresso, bean-to-cup automatic, capsule/pod, filter/drip, and lever; they differ in user effort, control, consumables and cleaning.','equipment_families'],
  ['mechanisms','Espresso extraction depends on water temperature stability, pressure at the puck, grind size, dose and time; a declared pump bar rating describes the pump, not pressure at the coffee.','technical_mechanisms',{kind:'mechanism',id:'extraction_parameters',aliases:['extraction','brew pressure','brew temperature']}],
  ['mechanisms','Heating systems (thermoblock, thermocoil, single boiler, heat exchanger, dual boiler) plausibly affect warm-up time and temperature stability between shots.','technical_mechanisms'],
  ['technical_characteristics','Declared characteristics include pump pressure in bar, power, water tank volume, bean hopper capacity, grinder type, milk system, dimensions and descaling program.','product_variant_observations'],
  ['performance_outcomes','Relevant outcomes: brew temperature accuracy and stability, shot-to-shot consistency, extraction yield or TDS where measured, milk texture, warm-up time and noise.','observable_performance',{kind:'outcome',id:'shot_consistency',aliases:['consistency','repeatable shots']}],
  ['spec_need_relevance','A higher declared bar figure is not evidence of better espresso; temperature stability and grinder consistency are hypotheses with stronger mechanistic links to taste.','critical_feasibility'],
  ['quality_measurements','Professional methods to look for: brew water temperature measured at the group or in cup, repeated shots for consistency, TDS/refractometer extraction measures, warm-up time, energy use, and descaling burden.','original_test_methods'],
  ['constraints_requirements','Ongoing costs (beans versus capsules, filters, descaler), counter space and whether a separate grinder is needed constrain the choice.','critical_feasibility',{kind:'environment',id:'ongoing_costs',aliases:['running costs','ongoing cost','consumables']}],
  ['failure_modes_safety','Scale build-up, pump wear, brew-group fouling in automatic machines and milk-system hygiene are failure modes to verify from long-term reports.','contradictions_and_limits',{kind:'failure',id:'scale_buildup',aliases:['limescale','scale build-up']}],
  ['trade_offs','Automation reduces effort but may limit control and add cleaning parts; manual machines offer control but need skill and a good grinder. A framing to test against evidence.','contradictions_and_limits'],
  ['unknowns_priorities','Unknown: independent reliability data by model; priority is original tests with repeated-shot temperature and consistency measurements.','critical_feasibility'],
 ],
 toasters:[
  ['user_goals','Brown bread evenly on both sides and across each slice.','user_outcomes',{kind:'outcome',id:'even_browning',aliases:['browns evenly','even browning','even toast']}],
  ['user_goals','Get the same result for different bread thicknesses and repeated rounds.','user_outcomes',{kind:'outcome',id:'repeatable_results',aliases:['consistent results','repeatability']}],
  ['user_questions','Which toaster browns bread most evenly?','user_outcomes'],
  ['user_questions','What matters if I want consistent results for different bread thicknesses?','user_outcomes'],
  ['product_subtypes','Subtypes: 2-slot and 4-slot pop-up, long-slot, wide-slot, and conveyor/oven-style; they differ in slot geometry and number of independent controls.','equipment_families'],
  ['mechanisms','Radiant elements on both sides of each slot heat the bread; element spacing and slot centring plausibly govern evenness, and thermal carry-over affects consecutive rounds.','technical_mechanisms',{kind:'mechanism',id:'radiant_element_heating',aliases:['heating elements','radiant heat']}],
  ['technical_characteristics','Declared characteristics include number and width of slots, power, browning levels, defrost/reheat/bagel functions, lift lever and crumb tray.','product_variant_observations'],
  ['performance_outcomes','Relevant outcomes: browning uniformity within a slice and between slots, consistency across consecutive batches, time to toast, exterior temperature.','observable_performance'],
  ['spec_need_relevance','Slot width and depth determine whether thick or tall bread fits; self-centring guides may matter for evenness with varying thickness. Both are hypotheses to check against tests.','critical_feasibility',{kind:'capability',id:'thick_bread_fit',aliases:['wide slots','thick bread','bread thickness']}],
  ['quality_measurements','Professional methods to look for: toasting standard white bread at fixed settings and measuring browning uniformity (visual scales or colourimetry), repeat-batch tests and exterior temperature checks.','original_test_methods'],
  ['constraints_requirements','Bread types used, counter space and number of people served constrain slot count and format.','critical_feasibility'],
  ['failure_modes_safety','Crumb fires, hot exterior housings, lever mechanism failure and uneven element ageing are failure modes to verify from reports and recalls.','contradictions_and_limits',{kind:'failure',id:'hot_exterior',aliases:['hot sides','exterior heat']}],
  ['trade_offs','More browning levels do not establish finer control; a toaster can declare many settings yet produce uneven results. A framing to test, not a fact.','contradictions_and_limits'],
  ['unknowns_priorities','Unknown: which declared features correlate with measured evenness; priority is original tests reporting per-slot browning measurements.','critical_feasibility'],
 ],
};

/** Adds the seed hypotheses to the store (idempotent). Returns item ids. */
export function seedCategoryHypotheses246(store:KnowledgeStore246,categoryId:string,at?:string):string[]{
 const seeds=CATEGORY_SEEDS246[categoryId];if(!seeds)throw Error('246_no_seed_for_category');
 return seeds.map(([section,statement,studyStream,concept])=>store.addCategoryItem246({categoryId,section,statement,
  knowledgeClass:'technical_hypothesis',provenance:'assistant_authored_unreviewed',studyStream,concept},at));
}
