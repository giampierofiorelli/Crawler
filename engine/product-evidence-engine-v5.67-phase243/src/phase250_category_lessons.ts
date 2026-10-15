/** Phase250 — category lessons: versioned, budgeted teaching material that extends the EXISTING category knowledge
 * (Phase246 store items and concept aliases, Phase248 category registry). A lesson teaches a category's user needs,
 * the everyday words people use for them, and counterexamples (phrases where the same words mean something else).
 *
 * Every need item is ASSISTANT-AUTHORED and UNREVIEWED ('technical_hypothesis'): it frames what users ask for and what
 * to look for, never that a product, brand or feature performs better. Lessons are applied through the store's own
 * APIs (addCategoryItem246, addConceptAliases246) and the registry type CategoryEntry248; nothing here is a separate
 * knowledge base. Need ids come from the pre-registered catalogue evaluation/phase250/need-catalogue.json.
 *
 * Two curricula were written for the Phase250 A/B/C comparison under the same budget (LESSON_BUDGET250):
 *  - B, fixed: one lesson per category for a fixed list of common kitchen categories, written from general category
 *    knowledge before any Phase250 failure analysis.
 *  - C, adaptive: lessons chosen from the failures of the repaired journey on the spent development sets.
 */
import type {KnowledgeStore246,CategorySection246} from './phase246_knowledge_store.js';
import type {ConceptKind128} from './phase128_category_cognition_dialogue_bridge.js';
import type {CategoryEntry248} from './phase248_advisory_journey.js';

export interface NeedLesson250 {id:string;kind:ConceptKind128;statement:string;aliases:string[];counterexamples?:string[]}
export interface CategoryLesson250 {
 categoryId:string;
 /** Registry additions for a category PEE does not name yet, or extra names for one it does. */
 registry?:{aliases?:string[];cues?:string[];partPhrases?:string[];aliasContext?:Record<string,string[]>};
 needs:NeedLesson250[];
 /** At most one mechanism and one measurement-method statement per category (hypotheses, no concept). */
 mechanism?:string;measurement?:string;
}
/** Pre-registered equal budget per arm (counted by lessonBudget250). */
export const LESSON_BUDGET250={categories:12,needs:45,phrases:260,counterexamples:30} as const;

const H=(id:string,kind:ConceptKind128,statement:string,aliases:string[],counterexamples?:string[]):NeedLesson250=>({id,kind,statement,aliases,counterexamples});

/** Arm B — fixed curriculum, written from general category knowledge (2026-10-15, before the failure analysis). */
export const CURRICULUM_B250:readonly CategoryLesson250[]=[
 {categoryId:'coffee_machines',needs:[
  H('milk_drinks','task','Make milk-based drinks such as cappuccino and latte with frothed or steamed milk.',['milk drinks','milk foam','froth milk','frothed milk','steamed milk','steam wand','milk frother','microfoam','cappuccino','latte','flat white']),
  H('ease_of_use','outcome','Make coffee with little effort, skill or attention.',['easy to use','simple to use','little effort','minimal effort','one touch','push button','fully automatic','no fuss','convenient']),
  H('batch_capacity','environment','Make enough coffee for several people or an office.',['many cups','several cups','lots of coffee','large batch','for the office','office use','many people','several people','big pot']),
  H('espresso_quality','outcome','',['good coffee','great tasting','tastes good','quality coffee','better coffee','best coffee','excellent coffee','nice coffee']),
  H('ongoing_costs','environment','',['long term costs','cost per cup','price of pods','capsule cost','cheap to run','running cost']),
  H('scale_buildup','failure','',[],['hard to','hardest','hard time']),
  H('extraction_parameters','mechanism','',[],['pressure cooker','pressure canner']),
 ]},
 {categoryId:'coffee_grinders',registry:{aliases:['coffee grinder','burr grinder','blade grinder','hand grinder','manual grinder','electric grinder','coffee mill','grinder'],partPhrases:['spice grinder','meat grinder','grinder attachment','built in grinder','integrated grinder']},
  mechanism:'Burr grinders crush beans between two burrs at a set gap; blade grinders chop them, which plausibly yields a wider particle-size spread.',
  measurement:'Professional methods to look for: particle-size distribution by sieve or laser diffraction at fixed settings, grind retention, noise level and time per dose.',
  needs:[
  H('grind_consistency','outcome','Grind coffee to an even particle size.',['consistent grind','even grind','uniform grind','grind consistency','uneven grind','fines','boulders']),
  H('grind_range','capability','Grind for several brew methods, from espresso to coarse.',['espresso grind','fine enough for espresso','coarse grind','french press grind','different brew methods','grind settings','grind size']),
  H('low_noise','outcome','Grind quietly.',['quiet','quietest','noisy','loud','noise','silent']),
  H('portability','environment','Grind away from home: travel, camping or work.',['travel','camping','portable','take to work']),
 ]},
 {categoryId:'manual_coffee_brewers',registry:{aliases:['french press','aeropress','pour over','moka pot','cezve','ibrik','percolator','cafetiere','chemex','stovetop espresso maker']},
  mechanism:'Immersion brewers steep grounds in water; percolation and pressure brewers push water through a bed of grounds; strength follows mainly from dose, grind and contact time.',
  measurement:'Professional methods to look for: brew strength (TDS) and extraction yield at a fixed recipe, temperature retention and brew time.',
  needs:[
  H('brew_strength','outcome','Make strong, full-bodied coffee.',['strong coffee','stronger coffee','strongest coffee','full bodied','bold coffee']),
  H('espresso_quality','outcome','Make good-tasting coffee.',['good coffee','better coffee','quality coffee','tastes better']),
  H('portability','environment','Brew coffee while travelling or camping.',['travel','camping','portable']),
 ]},
 {categoryId:'kettles',measurement:'Professional methods to look for: time to boil a fixed volume, temperature accuracy at each setting, energy per boil and noise.',
  needs:[
  H('temperature_control','capability','Heat water to a chosen temperature or keep it warm.',['variable temperature','temperature control','temperature settings','keep warm','set the temperature','specific temperature','green tea']),
  H('fast_boil','outcome','Boil water quickly.',['boils quickly','fast boil','quick boil','boil fast','rapid boil']),
  H('scale_buildup','failure','Limescale and water-quality problems.',['limescale','hard water','descale','water quality']),
  H('low_noise','outcome','Boil quietly.',['quiet','noisy','loud']),
 ]},
 {categoryId:'toasters',needs:[
  H('batch_capacity','environment','Toast enough slices at once for the household.',['four slice','4 slice','four slots','many slices']),
 ]},
 {categoryId:'toaster_ovens',mechanism:'Top and bottom elements, sometimes with a convection fan, heat a small cavity; element placement plausibly governs evenness.',
  needs:[
  H('versatility','capability','Do several cooking tasks: bake, broil, roast and toast.',['versatility','versatile','bake','broil','roast','multiple functions']),
  H('even_heating','outcome','Cook evenly across the cavity.',['even heat','cooks evenly','hot spots','even cooking']),
  H('batch_capacity','environment','Fit large items such as a pizza or a chicken.',['fit a pizza','whole chicken','12 inch pizza','large enough']),
  H('small_kitchen','environment','Fit limited counter space.',['counter space','small kitchen','limited space']),
 ]},
 {categoryId:'air_fryers',needs:[
  H('batch_capacity','environment','Cook enough food for a family at once.',['family of four','large capacity','big enough','for four people','whole family']),
 ]},
 {categoryId:'blenders',mechanism:'Blade speed, jar shape and motor power under load plausibly govern how finely hard ingredients are broken down.',
  measurement:'Professional methods to look for: ice crushing and smoothie texture at fixed recipes, noise level and jar cleaning.',
  needs:[
  H('hard_ingredients','capability','Blend hard ingredients: ice, nuts, hard fruit.',['crush ice','ice','nuts','hard fruit','coconut','frozen fruit'],['ice cream']),
  H('smooth_texture','outcome','Produce smooth purees, smoothies and nut milks.',['smooth','puree','pureeing','nut milk','almond milk']),
  H('low_noise','outcome','Blend quietly.',['quiet','noisy','loud']),
  H('cleaning_effort','outcome','Easy to clean.',['easy to clean','cleaning','dishwasher']),
 ]},
 {categoryId:'food_processors',registry:{aliases:['food processor']},
  needs:[
  H('chopping_slicing','task','Chop, slice, grate and shred.',['chop','chopping','slicing','grate','grating','shred']),
  H('dough_kneading','task','Knead or mix dough.',['dough','knead','kneading','pastry']),
  H('versatility','capability','Replace several kitchen tools.',['multipurpose','multi purpose','all in one','replace several','versatile']),
  H('small_kitchen','environment','Fit limited space.',['counter space','small kitchen','limited space']),
 ]},
 {categoryId:'stand_mixers',registry:{aliases:['stand mixer','kitchen mixer']},
  mechanism:'A planetary motion moves the beater around the bowl; motor power under load and gearing plausibly govern heavy-dough performance.',
  needs:[
  H('dough_kneading','task','Knead heavy bread, pizza or pasta dough.',['dough','knead','kneading','bread dough','pizza dough']),
  H('versatility','capability','Use attachments for other tasks.',['attachments','pasta attachment','versatile']),
  H('durability','outcome','Survive heavy use without the motor failing.',['durable','burn out','long lasting','reliable']),
  H('batch_capacity','environment','Mix large batches.',['large batches','bowl size','double batch']),
 ]},
 {categoryId:'pressure_cookers',registry:{aliases:['pressure cooker','electric pressure cooker','multicooker','multi cooker','instant pot']},
  mechanism:'A sealed pot raises the boiling point, so food cooks faster; electric multicookers add programmed modes.',
  measurement:'Professional methods to look for: time to pressure, cooking time for standard loads, pressure and temperature accuracy, safety-valve behaviour.',
  needs:[
  H('versatility','capability','Offer several cooking modes: slow cook, rice, saute.',['slow cook','saute','yogurt','multiple functions','several functions']),
  H('fast_cooking','outcome','Cook beans and stews faster.',['cook faster','cooks quickly','dried beans','cooking time']),
  H('batch_capacity','environment','A pot size suited to the quantity cooked.',['size','quart','capacity','big enough','too small','overcrowd']),
  H('ease_of_use','outcome','Simple to operate.',['easy to use','beginner','simple to use']),
 ]},
 {categoryId:'rice_cookers',needs:[
  H('rice_quality','outcome','Cook rice and other grains well.',['perfect rice','fluffy rice','sushi rice','brown rice','quinoa','grains']),
  H('keep_warm','capability','Keep food warm after cooking.',['keep warm','keeps warm','warm for hours']),
  H('batch_capacity','environment','Cook enough rice for the household.',['cups of rice','large family','capacity']),
 ]},
];

/** Arm C — adaptive lessons, chosen from failures of the repaired journey on spent development sets (filled after the
 * gap analysis recorded in evaluation/phase250/gap-analysis.json). */
export const ADAPTIVE_C250:readonly CategoryLesson250[]=[
 {categoryId:'air_fryers',needs:[
  H('cook_single_portion','task','',['on my own','just myself','only me','live alone','cooking for one']),
  H('crisp_texture','outcome','',['crunch','soggy','crispier','not crispy']),
  H('cook_two_foods_simultaneously','task','',['two things at once','two dishes at once','two foods at once']),
  H('cooking_evenness','outcome','',['uniformly','half raw','undercooked','unevenly','raw in the middle']),
  H('small_kitchen','environment','',['much room','no room','worktop','kitchen space','tiny kitchen']),
  H('cleaning_effort','outcome','',['wash','washing','scrub','scrubbing','greasy']),
 ]},
 {categoryId:'coffee_machines',registry:{cues:['espresso shots']},needs:[
  H('espresso_quality','outcome','',['taste i want','better quality','quality of the cup','good coffee','strongest coffee','great espresso','proper espresso']),
  H('shot_consistency','outcome','',['shots vary','vary a lot','all over the place','same result every time','inconsistent','more stable']),
  H('low_maintenance','outcome','',['hate cleaning','descaling chore','little upkeep']),
  H('ongoing_costs','environment','',['long term costs','cheapest','cost per cup','pods are expensive','capsules are expensive']),
  H('milk_drinks','task','Make milk-based drinks such as cappuccino and latte with frothed or steamed milk.',['latte','cappuccino','milk foam','frothed milk','steamed milk','milk frother','steam wand']),
  H('ease_of_use','outcome','Make coffee with little effort, skill or attention.',['automatically','little effort','not much effort','no fuss','simplest']),
  H('scale_buildup','failure','',[],['hard to','hardest','hard time','builds on top','long term']),
  H('extraction_parameters','mechanism','',[],['pressure cooker']),
 ]},
 {categoryId:'toasters',needs:[
  H('even_browning','outcome','',['pale on one side','burnt on','one side','stripes','dark patches','patchy','uneven']),
  H('thick_bread_fit','capability','',['chunky','crumpets','homemade bread','doorstop']),
  H('hot_exterior','failure','',['hot outside','burns','too hot to touch','gets hot']),
 ]},
 {categoryId:'coffee_grinders',registry:{aliases:['coffee grinder','burr grinder','blade grinder','hand grinder','electric grinder','grinder'],partPhrases:['built in grinder','integrated grinder','meat grinder','spice grinder']},
  mechanism:'Burr grinders crush beans between two burrs at a set gap; blade grinders chop them, which plausibly yields a wider particle-size spread.',
  needs:[
  H('grind_consistency','outcome','Grind coffee to an even particle size.',['consistent grind','even grind','uniform grind','fines','boulders']),
  H('grind_range','capability','Grind for several brew methods, from espresso to coarse.',['espresso grind','french press grind','grind settings','grind size','different brew methods']),
  H('low_noise','outcome','Grind quietly.',['quiet','noisy','loud']),
  H('portability','environment','Grind away from home: travel, camping or work.',['travel','portable','camping','take to work']),
 ]},
 {categoryId:'pressure_cookers',registry:{aliases:['pressure cooker','electric pressure cooker','instant pot','multicooker']},
  needs:[
  H('batch_capacity','environment','A pot size suited to the quantity cooked.',['size','too small','overcrowd','capacity','quart']),
  H('versatility','capability','Offer several cooking modes: slow cook, rice, saute.',['slow cook','yogurt','saute','several functions']),
  H('fast_cooking','outcome','Cook beans and stews faster.',['dried beans','cook faster','cooking time']),
 ]},
 {categoryId:'food_processors',registry:{aliases:['food processor']},needs:[
  H('versatility','capability','Replace several kitchen tools.',['multipurpose','multi purpose','all in one','tasks overlap']),
 ]},
 {categoryId:'stand_mixers',registry:{aliases:['stand mixer','kitchen mixer']},needs:[
  H('dough_kneading','task','Knead heavy bread, pizza or pasta dough.',['dough','knead','kneading']),
 ]},
 {categoryId:'blenders',needs:[
  H('hard_ingredients','capability','Blend hard ingredients: ice, nuts, hard fruit.',['hard fruit','coconut','crush ice','nuts'],['ice cream']),
  H('smooth_texture','outcome','Produce smooth purees, smoothies and nut milks.',['puree','pureeing','almond milk','nut milk','smooth']),
 ]},
];

/** Lessons PEE now uses (Phase250 decision, development configuration): the first run on untouched set 3 gave B and C
 * comparable gains (need recall 8/24 and 7/24 against 0/24; 12 wrong category attributions each against A's 15),
 * so both are kept, except B's manual_coffee_brewers lesson, whose names made five coffee and grinder requests
 * ambiguous. Bare "grinder" names a coffee grinder only in a coffee context (set 3: spice, peanut-butter and allspice
 * grinders were attributed to coffee grinders). This union was not run first on untouched material: the next phase
 * must measure it on a new set. */
export const ADOPTED_LESSONS250:readonly CategoryLesson250[]=[
 ...ADAPTIVE_C250,
 ...CURRICULUM_B250.filter(l=>l.categoryId!=='manual_coffee_brewers'),
 {categoryId:'coffee_grinders',registry:{aliasContext:Object.fromEntries(['grinder','hand grinder','manual grinder','electric grinder','blade grinder'].map(a=>[a,['coffee','espresso','beans','brew','pour over','french press','aeropress','moka']]))},needs:[]},
 {categoryId:'toaster_ovens',registry:{aliases:['otg','oven toaster griller']},needs:[]},
 {categoryId:'steam_cookers',registry:{partPhrases:['bamboo steamer']},needs:[]},
];

/** Phrases, counterexamples, needs and categories a curriculum uses, against LESSON_BUDGET250. */
export function lessonBudget250(lessons:readonly CategoryLesson250[]){
 const phrases=lessons.reduce((a,l)=>a+(l.registry?.aliases?.length??0)+(l.registry?.cues?.length??0)+l.needs.reduce((b,n)=>b+n.aliases.length,0),0);
 const counterexamples=lessons.reduce((a,l)=>a+(l.registry?.partPhrases?.length??0)+l.needs.reduce((b,n)=>b+(n.counterexamples?.length??0),0),0);
 const needs=lessons.reduce((a,l)=>a+l.needs.filter(n=>n.aliases.length).length,0);
 const used={categories:lessons.length,needs,phrases,counterexamples};
 const within=Object.entries(LESSON_BUDGET250).every(([k,v])=>used[k as keyof typeof used]<=v);
 return {...used,within};
}

/** Needs that a declared specification can check, by SPEC_CRITERIA249 decision key (any category). The need says
 * what the user wants; the user still confirms the value before a shortlist is built. */
export const NEED_CRITERIA250:Readonly<Record<string,readonly string[]>>={batch_capacity:['capacity_min'],small_kitchen:['width_max','depth_max','height_max']};
/** Registry for the journey: the base registry extended by the lessons (new categories appended; names, cues, part
 * phrases and need counterexamples merged). The base array is not modified. */
export function registryWithLessons250(base:readonly CategoryEntry248[],lessons:readonly CategoryLesson250[]):CategoryEntry248[]{
 type Mut={id:string;aliases:string[];cues?:string[];partPhrases?:string[];needCounterexamples?:Record<string,readonly string[]>;aliasContext?:Record<string,readonly string[]>};
 const out:Mut[]=base.map(e=>({id:e.id,aliases:[...e.aliases],...(e.cues?{cues:[...e.cues]}:{}),...(e.partPhrases?{partPhrases:[...e.partPhrases]}:{}),
  ...(e.needCounterexamples?{needCounterexamples:{...e.needCounterexamples}}:{}),...(e.aliasContext?{aliasContext:{...e.aliasContext}}:{})}));
 for(const l of lessons){
  let e:Mut|undefined=out.find(x=>x.id===l.categoryId);
  if(!e){if(!l.registry?.aliases?.length)throw Error('250_new_category_needs_aliases');e={id:l.categoryId,aliases:[]};out.push(e);}
  const add=(a:readonly string[]|undefined,b:readonly string[]|undefined)=>[...new Set([...(a??[]),...(b??[])])];
  e.aliases=add(e.aliases,l.registry?.aliases);
  if(l.registry?.cues?.length)e.cues=add(e.cues,l.registry.cues);
  if(l.registry?.partPhrases?.length)e.partPhrases=add(e.partPhrases,l.registry.partPhrases);
  const ce={...(e.needCounterexamples??{})} as Record<string,readonly string[]>;
  for(const n of l.needs)if(n.counterexamples?.length)ce[n.id]=add(ce[n.id],n.counterexamples);
  if(Object.keys(ce).length)e.needCounterexamples=ce;
  if(l.registry?.aliasContext)e.aliasContext={...(e.aliasContext??{}),...l.registry.aliasContext};
 }
 for(const e of out)(e as Mut&{needCriteria?:Readonly<Record<string,readonly string[]>>}).needCriteria=NEED_CRITERIA250;
 return out;
}

/** Applies lessons to a store through its own APIs (idempotent): a need the category already carries gains the
 * lesson's aliases; a new need becomes a 'user_goals' hypothesis item carrying the concept; mechanism and measurement
 * statements become hypothesis items without a concept. Returns what changed. */
export function applyLessons250(store:KnowledgeStore246,lessons:readonly CategoryLesson250[],at=new Date().toISOString()){
 let itemsAdded=0,aliasUpdates=0;
 for(const l of lessons){
  const existing=new Set(store.categoryItems246(l.categoryId).filter(i=>i.concept).map(i=>i.concept!.id));
  const add=(section:CategorySection246,statement:string,studyStream:string,concept?:{kind:ConceptKind128;id:string;aliases:string[]})=>{
   const before=store.categoryItems246(l.categoryId).length;
   store.addCategoryItem246({categoryId:l.categoryId,section,statement,knowledgeClass:'technical_hypothesis',provenance:'assistant_authored_unreviewed',
    studyStream:studyStream as never,concept},at);
   if(store.categoryItems246(l.categoryId).length>before)itemsAdded++;};
  for(const n of l.needs){
   if(existing.has(n.id)){if(n.aliases.length)aliasUpdates+=store.addConceptAliases246(l.categoryId,n.id,n.aliases,at);continue;}
   if(!n.statement||!n.aliases.length)continue;
   add('user_goals',n.statement,'user_outcomes',{kind:n.kind,id:n.id,aliases:n.aliases.slice(0,40)});existing.add(n.id);
  }
  if(l.mechanism)add('mechanisms',l.mechanism,'technical_mechanisms');
  if(l.measurement)add('quality_measurements',l.measurement,'original_test_methods');
 }
 return {itemsAdded,aliasUpdates};
}
