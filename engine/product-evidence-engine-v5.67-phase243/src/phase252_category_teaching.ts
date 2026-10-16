/**
 * Phase252 — proactive category teaching for two pilot categories (microwave_ovens, headphones), chosen by the criteria
 * in evaluation/phase252/teaching-pilot-selection.json.
 *
 * Two kinds of teaching are compared in Stage 4 under the same phrase budget:
 *  - LEXICAL_L252: vocabulary-based lessons in the Phase250 format (names and need phrases), written from general
 *    knowledge only, BEFORE any research for this phase (committed first).
 *  - Research-guided teaching (added after the research, in this module): material built from consulted sources that
 *    teaches what to understand, where and how to research, how to interpret evidence and how to apply it, compiled
 *    into the existing registry, store items and category relations.
 * Nothing here is reviewed evidence: every statement enters the store as a technical hypothesis.
 */
import type {CategoryLesson250,NeedLesson250} from './phase250_category_lessons.js';
import type {ConceptKind128} from './phase128_category_cognition_dialogue_bridge.js';

const N=(id:string,kind:ConceptKind128,statement:string,aliases:string[],counterexamples?:string[]):NeedLesson250=>({id,kind,statement,aliases,...(counterexamples?{counterexamples}:{})});

/** Pre-registered per-category budget, the same for the lexical and the research-guided arm. */
export const TEACHING_BUDGET252={needs:10,phrases:45,counterexamples:12} as const;

/** Arm L — vocabulary-based lessons, written 2026-10-16 from general knowledge, before the Phase252 research. */
export const LEXICAL_L252:readonly CategoryLesson250[]=[
 {categoryId:'microwave_ovens',registry:{aliases:['microwave','microwaves','microwave oven','microwave ovens']},needs:[
  N('batch_capacity','environment','Cook or heat enough food for several people or large dishes.',['family','large plates','big enough','large dish','for four']),
  N('small_kitchen','environment','Fit a small kitchen or limited counter space.',['small kitchen','limited counter space','compact','small space']),
  N('fast_heating','outcome','Heat food quickly.',['heats quickly','fast','quick','powerful']),
  N('even_heating','outcome','Heat food evenly without cold spots.',['evenly','cold spots','even heating','uneven']),
  N('ease_of_use','outcome','Simple to operate.',['easy to use','simple controls','simple to use']),
  N('cleaning_effort','outcome','Easy to clean.',['easy to clean','cleaning']),
  N('grill_browning','task','Grill or brown food.',['grill','browning','crispy']),
  N('defrosting','task','Defrost frozen food.',['defrost','defrosting']),
 ]},
 {categoryId:'headphones',registry:{aliases:['headphones','headphone','earphones','earbuds','headset','in-ear','over-ear']},needs:[
  N('noise_cancelling','outcome','Block outside noise.',['noise cancelling','noise canceling','anc','block noise']),
  N('comfort','outcome','Comfortable to wear for long periods.',['comfortable','comfort','long sessions']),
  N('sound_quality','outcome','Good sound.',['sound quality','good sound','bass','clear sound']),
  N('battery_life','outcome','Long battery life.',['battery life','long battery']),
  N('wireless','environment','Wireless connection.',['wireless','bluetooth']),
  N('durability','outcome','Last a long time.',['durable','last long','break']),
  N('microphone_calls','task','Make calls.',['calls','microphone','mic']),
  N('portability','environment','Easy to carry or travel with.',['portable','travel','foldable']),
  N('sport_fit','task','Use while exercising.',['running','gym','workout']),
 ]},
];
