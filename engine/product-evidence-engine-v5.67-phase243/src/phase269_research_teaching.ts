/** Phase269 — scientific teaching for air fryers from the owner's research package, through the existing Phase252
 * teaching machinery (needs, measurement methods, declared-attribute proxies) extended with measurement ids, test
 * conditions and measurement proxies. Nothing here is reviewed evidence: every statement enters the store as a
 * technical hypothesis, with the package section and the package's own status label kept in the text.
 *
 * Source: PEE-AIR-FRYERS-RESEARCH-RECOVERED.zip (16 Oct 2026), a RECONSTRUCTED handoff of the air-fryer compendium
 * v2.2.0 plus 34 later addenda; not a byte-for-byte copy of the original v3.9.0 archive. The package itself stays in
 * private storage; only short PEE-authored paraphrases and section references are here. Publisher-reported numbers are
 * deliberately not copied: the teaching says what to measure and how to interpret it, never how a product performs.
 *
 * Teaching was chosen from the DEVELOPMENT requests only (evaluation/phase269/teaching-eval-set.json, D1-D7); phrases
 * that also occur in an untouched request are listed in UNTOUCHED_OVERLAP269 and reported.
 */
import type {CategoryTeaching252,TeachingSource252,Taught252,TaughtNeed252} from './phase252_category_teaching.js';
import type {NeedLesson250} from './phase250_category_lessons.js';
import type {ConceptKind128} from './phase128_category_cognition_dialogue_bridge.js';

const PKG='PEE-AIR-FRYERS-COMPLETE-COMPENDIUM v2.2.0 (recovered)';
export const RESEARCH_SOURCES269:readonly TeachingSource252[]=[
 {id:'af_pkg',url:'owner-research:air-fryers/v2.2.0-recovered',publisher:`owner research package: ${PKG} and addenda Phase2-17`,role:'owner_research_package',
  consulted:'2026-10-16',access:'private owner research (documentary; not independently re-verified by PEE)',
  teaches:'mechanisms, attribute ontology (SPEC/PROXY/MEASURE), comparability gate, need-to-measurement mapping, energy and no-buy decision model'},
 {id:'which_oven',url:'https://www.which.co.uk/reviews/air-fryers/article/air-fryer-vs-oven-energy-cost-cooking-results-compared-aPpAt8D1Agy5',publisher:'Which? (UK), as recorded in the package',
  role:'independent_test_publisher',consulted:'2026-10-16 (via the package; not fetched by PEE)',access:'public article',
  teaches:'one named air fryer and one named oven, energy and time for completed dishes including preheat; not a category average'},
 {id:'cnz_fixed',url:'https://www.consumer.org.nz/home-and-living/kitchen/air-fryers/air-fryer-vs-oven-do-air-fryers-really-save-you-money',publisher:'Consumer NZ (fetched in the Phase269 untouched set)',
  role:'independent_test_publisher',consulted:'2026-10-16',access:'public article',
  teaches:'power consumption recorded at 200 C for 30 minutes (fixed duration); on that basis ovens were cheaper on average; small quick cooks may still favour air fryers'},
 {id:'rtings_basket',url:'https://www.rtings.com/air-fryer/learn/research',publisher:'RTINGS research, as recorded in the package',role:'independent_test_publisher',
  consulted:'2026-10-16 (via the package)',access:'membership-gated in Phase268 (not bypassed)',
  teaches:'usable single-layer basket area matters more than declared litres for fries; one-model intervention, not a universal threshold'},
 {id:'cr_clean',url:'https://www.consumerreports.org/air-fryers/how-to-clean-an-air-fryer-a1143384780/',publisher:'Consumer Reports, as recorded in the package',role:'independent_test_publisher',
  consulted:'2026-10-16 (via the package)',access:'public article',
  teaches:'dishwasher-safe claims are common while top cleanability scores are rare: a component claim is not ease of cleaning'},
];
const S=(text:string,basis:Taught252['basis'],...sources:string[]):Taught252=>({text,basis,sources});
const N=(id:string,kind:ConceptKind128,statement:string,aliases:string[]):NeedLesson250=>({id,kind,statement,aliases});
const TN=(n:NeedLesson250,x:Omit<TaughtNeed252,keyof NeedLesson250>):TaughtNeed252=>({...n,...x});

const EMPTY_RUN={measureId:'energy_empty_run',
 statement:S('Fixed-duration energy of an appliance run at a set temperature for a set time, empty or with an unspecified load (e.g. one hour at 200 C, or 30 minutes at 200 C). Package status: PROXY.','source_backed_observation','af_pkg','cnz_fixed'),
 note:S('A fixed-duration run measures heat-up, losses and cycling, not energy to finish a meal: a fixed-run lab found ovens cheaper on average, a completed-dish lab one air fryer cheaper for small dishes. Package Phase14, 7.2.','source_backed_observation','af_pkg','cnz_fixed','which_oven')};

export const AIR_FRYER_TEACHING269:CategoryTeaching252={
 categoryId:'air_fryers',version:'t269.1',written:'2026-10-16',
 registry:{aliases:['air fryer','airfryer','air fryers'],partPhrases:[]},
 subtypes:[S('Single and dual-basket drawers, divided or stacked drawers, air-fryer ovens and ovens with an air-fry mode are different architectures; dual zone does not mean thermally independent zones or unrestricted power. Package 2.1.','source_backed_observation','af_pkg')],
 mechanisms:[S('An air fryer is a compact forced-convection cooker; rated watts, fan speed and set temperature are proxies, not delivered heat or food temperature. Package 1.1, 3.1 (physical principle).','source_backed_observation','af_pkg')],
 needs:[
  TN(N('low_energy_use','outcome','Use relatively little electricity per cooking session.',['electricity is expensive','cheaper to run','energy per meal']),
   {measureId:'energy_per_cooking_task',conditions:['same_food_load','completed_doneness','compartments_in_use'],
    outcome:S('Electricity for a completed cooking task: plug-metered kWh from switch-on, including preheat and every batch, for the same food, quantity and doneness, with the compartments actually used recorded. Package 4 (MEASURE), 7.2.','method_reference','af_pkg','which_oven'),
    proxies:[{attribute:'power',kind:'not_sufficient_for',note:S('Rated watts is not kWh per task: heaters cycle, and a lower-rated small appliance may finish a small load with less energy. Package 1.3, 4.','source_backed_observation','af_pkg')}],
    proxyMeasures:[EMPTY_RUN]}),
  TN(N('cooking_results','outcome','Cook food well: the intended browning, crispness, moisture and doneness for the foods actually cooked.',['cooking results','cooks well','cooking quality','cooking performance','good results']),
   {measureId:'cooking_outcome_assessment',conditions:['same_food_load','completed_doneness'],
    outcome:S('Outcome assessment on the user\'s kind of food: browning colour, crispness (blinded panel or instrumental), moisture and safe core temperature, on the same food lot, load and endpoint. Package 3.4, 4, 5.3.','method_reference','af_pkg'),
    proxyMeasures:[EMPTY_RUN]}),
  TN(N('crisp_texture','outcome','Get crisp exterior texture on chips and breaded foods with little added oil.',['crispiest','crispy chips','soggy chips']),
   {measureId:'cooking_outcome_assessment',conditions:['same_food_load','completed_doneness'],
    outcome:S('Crispness is food-specific: a controlled same-food loaded test with mass loss plus blinded crisp sorting or texture instruments. Package 3.4, 6.2.','method_reference','af_pkg')}),
  TN(N('cooking_evenness','outcome','Cook and brown food evenly across the basket.',['evenly']),
   {measureId:'cooking_evenness_test',conditions:['same_food_load','completed_doneness'],
    outcome:S('Spatial distribution of browning and doneness across positions for a defined load (standard photographs or colorimeter, core temperatures). Package 4 (MEASURE), 5.3.','method_reference','af_pkg'),
    proxies:[{attribute:'capacity',kind:'not_sufficient_for',note:S('Declared litres do not establish usable single-layer area or evenness. Package 1.2.','source_backed_observation','af_pkg','rtings_basket')}]}),
  TN(N('cook_single_portion','task','Cook small portions for one person without heating a full oven.',['cook for myself','hate leftovers']),
   {measureId:'usable_cooking_area',
    outcome:S('Usable single-layer cooking area and small-load results on the person\'s own foods and portions (energy, time and quality for one serving). Package 6.2 ("I cook for myself").','method_reference','af_pkg','rtings_basket'),
    proxies:[{attribute:'capacity',kind:'not_sufficient_for',note:S('A litre figure is not a number of people; a large nominal volume does not make an appliance better for one person. Package 0 guardrail, 6.1.','source_backed_observation','af_pkg')}]}),
  TN(N('batch_capacity','environment','Cook enough food for a family at once.',['batches','dinner for four','large batches']),
   {measureId:'batch_cooking_test',conditions:['same_food_load'],
    outcome:S('Weighed complete high-load meal: portions reaching quality and safe core temperature together, batches needed, spatial quality map. Package 6.2 ("Dinner for four, no second batch").','method_reference','af_pkg'),
    proxies:[{attribute:'capacity',kind:'not_sufficient_for',note:S('No population-wide litre cut-off: nominal volume without single-layer area can still need batches. Package 6.2, reconciliation 4.','source_backed_observation','af_pkg','rtings_basket')}]}),
  TN(N('cleaning_effort','outcome','Easy to clean after cooking.',['hassle to clean','clean after','fewer dishes','faster cleaning']),
   {measureId:'cleaning_effort_assessment',
    outcome:S('Timed removal of representative soils after repeated use, including the fixed interior, drying and part-specific dishwasher instructions. Package 4, Phase15.','method_reference','af_pkg','cr_clean'),
    proxies:[{attribute:'dishwasher safe',kind:'not_sufficient_for',note:S('Dishwasher-safe is a part-level maker claim; it is not ease of cleaning, does not cover the fixed interior and says nothing about coating wear. Package Phase15.','source_backed_observation','af_pkg','cr_clean')}]}),
  TN(N('cook_two_foods_simultaneously','task','Cook two different foods at once with different settings and finish them together.',[]),
   {measureId:'two_zone_cooking_test',conditions:['compartments_in_use'],
    outcome:S('Two-food simultaneous full-cycle test: each zone alone and both together under a meal-relevant load, finished core temperatures and timing deviation. Package 2.1 (B2), 6.2.','method_reference','af_pkg')}),
  TN(N('oven_alternative','environment','Already owns an oven or another appliance that could do the job, so buying may be unnecessary.',['already have an oven','already have a fan oven','have a fan oven','keep using the oven','use the oven instead','instead of the oven']),
   {question:'Which meals and portions would you cook in it, and how often? With an oven already at home, buying is worthwhile only if the measured energy, time or results for those meals are better.'}),
  TN(N('single_compartment_use','environment','Would use only one compartment of a multi-compartment air fryer.',['one drawer','one basket','only use one']),{}),
 ],
 sourceRoutes:[],
 interpretation:[
  S('Comparability gate: numbers compare directly only with the same product revision, zone, food and load, endpoint, preheat and method version; otherwise qualitative discussion only, never pooled leaderboards. Package 5.3.','source_backed_observation','af_pkg'),
  S('Different labs answer different questions (fixed-duration energy, energy per completed dish, mass-loss crispness, panel scores): describe each result separately. Package 1.4, 5.3, Phase14.','source_backed_observation','af_pkg','cnz_fixed','which_oven'),
 ],
 applicability:[
  S('An existing oven can be the right answer: no-buy is valid when the existing appliance meets the food, quantity and quality need, when use is infrequent, or when complete-meal savings are absent. Package Phase13 decision model, Phase14.','source_backed_observation','af_pkg','which_oven'),
  S('A whole-appliance measurement with every compartment running does not represent use of one drawer; preserve the operating configuration of each test. Package 2.1, Phase268 audit.','instructor_hypothesis','af_pkg'),
 ],
 gaps:[
  S('Open in the package: energy per complete meal at several household sizes, practical portion capacities by geometry, dual-zone simultaneous power and quality, test-retest variability. These stay unknown, not inferred.','source_backed_observation','af_pkg'),
 ],
 conditions:[
  {id:'same_food_load',statement:S('Condition: the same food (state, cut, starting temperature), the same edible quantity and the same load arrangement in every compared run. Package 5.3 (2).','source_backed_observation','af_pkg')},
  {id:'completed_doneness',statement:S('Condition: every compared run reaches the same endpoint (safe core temperature and the target browning or crispness), with preheat and batches included in time and energy. Package 5.3 (3)-(4), 7.2.','source_backed_observation','af_pkg')},
  {id:'compartments_in_use',statement:S('Condition: the zones, drawers or racks in use are recorded and match the use being compared (one drawer is not two). Package 2.1, 5.3 (1).','source_backed_observation','af_pkg')},
 ],
};
/** Phase269 cross-category transfer: the same learning process for coffee machines, from the owner's coffee package
 * (PEE-COFFEE-COMPLETE-CUMULATIVE-KNOWLEDGE-PACKAGE.md, consolidated 15 Oct 2026: six documents, no fresh primary-source
 * re-verification). Chosen from the package only; every coffee evaluation request is untouched. Naming contract: a need
 * whose id ends in '_alternative' means equipment the person already owns (the decision becomes a no-purchase check). */
export const COFFEE_SOURCES269:readonly TeachingSource252[]=[
 {id:'coffee_pkg',url:'owner-research:coffee/cumulative-2026-10-15',publisher:'owner research package: PEE coffee machines and grinders, cumulative (6 documents)',role:'owner_research_package',
  consulted:'2026-10-17',access:'private owner research (documentary; not independently re-verified by PEE)',
  teaches:'inference rules (0.2), heat and pressure (5.1-5.2), protocol catalogue and comparability key (7.1-7.3), Italian expertise as attributed practice'},
];
export const COFFEE_TEACHING269:CategoryTeaching252={
 categoryId:'coffee_machines',version:'t269.c1',written:'2026-10-17',
 registry:{aliases:['coffee machine','espresso machine','coffee maker'],partPhrases:[]},
 subtypes:[],mechanisms:[],
 needs:[
  TN(N('espresso_quality','outcome','Make espresso-based drinks with good taste and little effort.',['proper espresso','espresso like the bar','coffee like at the bar']),
   {measureId:'espresso_sensory_assessment',conditions:['same_beans_and_grind'],
    outcome:S('Blind coded sensory assessment of espresso (trained assessors for description, target consumers for liking) with the same beans, roast age, grinder and recipe for every machine. Package 7.1 SENSORY, 0.2 rule 2.','method_reference','coffee_pkg'),
    proxies:[{attribute:'power',kind:'not_sufficient_for',note:S('Rated watts says nothing about temperature at the coffee bed over successive shots. Package 5.1.','source_backed_observation','coffee_pkg')}]}),
  TN(N('shot_consistency','outcome','Get reliable, repeatable shots.',['shots vary','inconsistent shots']),
   {measureId:'brew_temperature_stability',conditions:['consecutive_shots','same_beans_and_grind'],
    outcome:S('Temperature at the group or coffee bed over first, second and nth consecutive shots, with shot time to a fixed cup mass. Package 5.1 lab teaching, 7.1 ESP-TEMP-FLOW and ESP-REPEAT.','method_reference','coffee_pkg'),
    proxies:[{attribute:'pid',kind:'not_sufficient_for',note:S('PID is regulation at a sensor, not a measured temperature at the puck; placement, tuning and group inertia decide. Package 5.1.','source_backed_observation','coffee_pkg')}]}),
  TN(N('moka_alternative','environment','Already owns a moka pot or another brewer that may meet the need, so buying may be unnecessary.',['moka pot','stovetop espresso','use the moka','use a moka']),{}),
 ],
 sourceRoutes:[],
 interpretation:[S('Compatibility key: metric, apparatus, exact model and revision, beans and roast age, grind, basket, dose, beverage mass, water, protocol and operator must match before results are compared. Package 7.3.','source_backed_observation','coffee_pkg')],
 applicability:[S('A machine result obtained with an unspecified or different grinder cannot rank beverage quality; Italian practitioner preferences stay attributed, never universal truth. Package 0.2 rules 2-3.','source_backed_observation','coffee_pkg')],
 gaps:[],
 conditions:[
  {id:'same_beans_and_grind',statement:S('Condition: the same beans, roast age, grinder and grind setting, dose and recipe for every compared machine. Package 0.2 rule 2, 7.3.','source_backed_observation','coffee_pkg')},
  {id:'consecutive_shots',statement:S('Condition: measured over first-from-cold, second and later consecutive shots under a stated idle time. Package 5.1.','source_backed_observation','coffee_pkg')},
 ],
};
/** Teaching phrases that also occur in an untouched request (reported, never chosen from it). */
export const UNTOUCHED_OVERLAP269:readonly {phrase:string;request:string;origin:string}[]=[
 {phrase:'cook for myself',request:'U2',origin:'package 6.2 need-language table ("I cook for myself")'},
 {phrase:'moka pot',request:'C4',origin:'coffee package taxonomy (BREW: moka pot) and Italian need phrase "Uso la moka"'},
 {phrase:'evenly',request:'U5',origin:'development failure D7 ("cooks chicken evenly"); package term "browning evenness"'},
];
