/** Phase248 — category names PEE recognises in requests (vocabulary only; no product or quality claims).
 * A name being listed does not mean PEE holds category knowledge for it: the journey checks the store. */
import type {CategoryEntry248} from './phase248_advisory_journey.js';
import {ADOPTED_LESSONS250,registryWithLessons250} from './phase250_category_lessons.js';
export const CATEGORY_REGISTRY248:readonly CategoryEntry248[]=[
 {id:'air_fryers',aliases:['air fryer','airfryer','air-fryer','dual basket air fryer','two-drawer air fryer'],cues:['air fry','air fried','air frying']},
 {id:'coffee_machines',aliases:['coffee machine','espresso machine','coffee maker','bean to cup','pod machine','espresso maker'],cues:['espresso','cappuccino','latte','flat white','coffee']},
 {id:'toasters',aliases:['toaster'],cues:['toast','crumpets','bagels']},
 {id:'toaster_ovens',aliases:['toaster oven','mini oven','toaster convection oven','convection toaster oven','countertop oven']},
 {id:'kettles',aliases:['kettle']},
 {id:'blenders',aliases:['blender','smoothie maker'],cues:['smoothies','smoothie']},
 {id:'deep_fryers',aliases:['deep fryer','deep fat fryer','chip pan']},
 {id:'rice_cookers',aliases:['rice cooker']},
 {id:'steam_cookers',aliases:['steamer','steam cooker','food steamer'],partPhrases:['milk steamer','steamer basket','steamer insert','steamer rack','steamer pan','steam wand','steamer wand']},
];
/** Phase250: the registry PEE uses now — the Phase248 registry extended by the adopted category lessons. */
export const CATEGORY_REGISTRY250:readonly CategoryEntry248[]=registryWithLessons250(CATEGORY_REGISTRY248,ADOPTED_LESSONS250);
