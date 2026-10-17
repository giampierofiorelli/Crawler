/** Phase270 — teaching through the Phase252/269 mechanism (owner brief §9). No hard-coded substitution: each change is a
 * taught need, alias, measurement, condition or proxy, cited to its source, entering the store as a technical hypothesis.
 *
 * 1. Recognition gaps recorded in Phase269 on DEVELOPMENT requests (U4 dual zone, U6 "least power", C2 "traditional
 *    Italian espresso"), taught as deltas to the t269 teachings. Phrases come from those development requests and the
 *    packages; overlaps with the Phase270 generalisation set are listed in OVERLAP270 and reported, never chosen from it.
 *    (D2, an unassessed factual need, was a code defect in Phase253 and is fixed there.)
 * 2. Dehumidifiers (package B, PEE-DEHUMIDIFIERS-CONSOLIDATED-RESEARCH-2026-10-15): a minimal teaching pilot. The
 *    package cites R01-R37 but its source register (section 17) is empty, so every dehumidifier lesson is an
 *    instructor hypothesis marked "awaiting source verification"; no reference is reconstructed or invented.
 */
import type {CategoryTeaching252,TeachingSource252,Taught252,TaughtNeed252} from './phase252_category_teaching.js';
import type {NeedLesson250} from './phase250_category_lessons.js';
import type {ConceptKind128} from './phase128_category_cognition_dialogue_bridge.js';

const S=(text:string,basis:Taught252['basis'],...sources:string[]):Taught252=>({text,basis,sources});
const N=(id:string,kind:ConceptKind128,statement:string,aliases:string[]):NeedLesson250=>({id,kind,statement,aliases});
const TN=(n:NeedLesson250,x:Omit<TaughtNeed252,keyof NeedLesson250>):TaughtNeed252=>({...n,...x});
const AWAITING='Awaiting source verification: package refs';

export const SOURCES270:readonly TeachingSource252[]=[
 {id:'dehum_pkg',url:'owner-research:dehumidifiers/consolidated-2026-10-15',publisher:'owner research package B: PEE dehumidifiers consolidated research (2026-10-15)',role:'owner_research_package',
  consulted:'2026-10-17',access:'private owner research; its source register (R01-R37) is missing, so its references are unverified',
  teaches:'moisture balance, condition-dependent removal, comparability classes, problem-first diagnosis, building and leak alternatives'},
];

/** Delta to AIR_FRYER_TEACHING269 (t269.1): U4 and U6. */
export const AIR_FRYER_TEACHING270:CategoryTeaching252={
 categoryId:'air_fryers',version:'t270.a1',written:'2026-10-17',registry:{aliases:[],partPhrases:[]},subtypes:[],mechanisms:[],
 needs:[
  TN(N('cook_two_foods_simultaneously','task','Cook two different foods at once with different settings and finish them together.',['dual zone','dual-zone','two different things','different settings, done together','two foods at once']),
   {measureId:'two_zone_cooking_test',conditions:['compartments_in_use'],
    outcome:S('Two-food simultaneous full-cycle test: both zones loaded and running, finished core temperature and quality of each food, readiness aligned; dual zone is a workflow, not proof of speed or independence. Package 2.1 B2, 6.1, finding 9.','method_reference','af_pkg')}),
  TN(N('low_energy_use','outcome','Use relatively little electricity per cooking session.',['least power','least electricity']),{}),
 ],
 sourceRoutes:[],interpretation:[],applicability:[],gaps:[],
};
/** Delta to COFFEE_TEACHING269 (t269.c1): C2. */
export const COFFEE_TEACHING270:CategoryTeaching252={
 categoryId:'coffee_machines',version:'t270.c1',written:'2026-10-17',registry:{aliases:[],partPhrases:[]},subtypes:[],mechanisms:[],
 needs:[TN(N('espresso_quality','outcome','Make espresso-based drinks with good taste and little effort.',['traditional italian espresso','italian espresso','best-tasting espresso','best-tasting traditional']),{})],
 sourceRoutes:[],interpretation:[],applicability:[],gaps:[],
};

/** Dehumidifiers: minimal registration (boundary, needs, measurements, conditions, proxies, alternatives). */
export const DEHUMIDIFIER_TEACHING270:CategoryTeaching252={
 categoryId:'dehumidifiers',version:'t270.d1',written:'2026-10-17',
 registry:{aliases:['dehumidifier','dehumidifiers'],partPhrases:[]},
 subtypes:[S(`Refrigerant (compressor), desiccant and Peltier machines remove moisture differently; the word desiccant or Peltier proves no winter advantage or low running cost. ${AWAITING} R09-R12 (finding 5).`,'instructor_hypothesis','dehum_pkg')],
 mechanisms:[S(`Water removal is an environmental function, not a product constant: temperature, inlet humidity, airflow, defrost and cycling change it. ${AWAITING} R01-R02 (finding 1).`,'instructor_hypothesis','dehum_pkg')],
 needs:[
  TN(N('moisture_removal','outcome','Remove enough moisture to keep the room at a safe humidity.',['windows are wet','smells damp','feels damp','clothes never dry','clammy','condensation']),
   {measureId:'removal_at_room_conditions',conditions:['matched_temperature_humidity'],
    outcome:S(`Water removal measured at the user's room temperature and humidity (litres per day with the protocol stated), not a rating point projected to a home. ${AWAITING} R01, R07 (4.2, 4.4).`,'instructor_hypothesis','dehum_pkg'),
    proxies:[{attribute:'capacity',kind:'not_sufficient_for',note:S(`A declared litres-per-day capacity holds at its own test point only; tank size and coverage area are not removal. ${AWAITING} R01, R07 (finding 8, 4.2).`,'instructor_hypothesis','dehum_pkg')}]}),
  TN(N('low_energy_use','outcome','Use little electricity for the moisture removed.',['electricity is expensive','electricity bills']),
   {measureId:'energy_per_litre_matched',conditions:['matched_temperature_humidity'],
    outcome:S(`Litres per kWh at a common duty point, including idle and defrost, under the same conditions for every machine. ${AWAITING} R01, R17 (finding 8).`,'instructor_hypothesis','dehum_pkg'),
    proxies:[{attribute:'power',kind:'not_sufficient_for',note:S(`Lower watts is not lower electricity per litre: a 150 W unit may remove less per kWh or miss the load, a 400 W one may short-cycle. ${AWAITING} R01, R08 (counterexample B).`,'instructor_hypothesis','dehum_pkg')}]}),
  TN(N('cold_room_use','environment','Will run in a cold room, where removal and defrost differ from warm test points.',['unheated','cellar','damp in winter','cold walls']),{}),
  TN(N('leak_or_structural_alternative','environment','There may be a leak, rain penetration or structural damp: repair and ventilation come before any appliance.',['active leak','mould behind','rain penetration','structural damp','after rain']),{}),
 ],
 sourceRoutes:[],
 interpretation:[S(`Compare two results only with the same variable, mechanism, inlet temperature and humidity, mode, accounting and electricity boundary; otherwise show them separately. ${AWAITING} R07 (section 5).`,'instructor_hypothesis','dehum_pkg')],
 applicability:[S(`Mould prevention is a building and health claim: a dehumidifier does not repair a leak or remove existing mould. ${AWAITING} R13-R15 (finding 6).`,'instructor_hypothesis','dehum_pkg')],
 gaps:[S(`The package source register (R01-R37) is missing; every dehumidifier lesson stays unverified until the register is supplied or the sources are re-found.`,'instructor_hypothesis','dehum_pkg')],
 conditions:[{id:'matched_temperature_humidity',statement:S(`Condition: the same inlet temperature and relative humidity (and mode, duration, accounting) for every compared machine. ${AWAITING} R01, R07 (section 5).`,'instructor_hypothesis','dehum_pkg')}],
};
/** Teaching phrases that also occur in a Phase270 generalisation request (reported, never chosen from it). */
export const OVERLAP270:readonly {phrase:string;request:string;origin:string}[]=[
 {phrase:'least power',request:'G3',origin:'development request U6 ("use the least power")'},
 {phrase:'windows are wet',request:'H1',origin:'package B section 6 need table ("The windows are wet every morning")'},
 {phrase:'unheated',request:'H2',origin:'package B 4.2 ("an unheated UK cellar")'},
 {phrase:'mould behind',request:'H3',origin:'package B section 6 need table ("There is mould behind the wardrobe")'},
];
