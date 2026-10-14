/**
 * Phase 56: research-informed NEEDS DISCOVERY PROTOTYPE.
 * No prices, retailer attributes, Amazon data, or publication-grade recommendations.
 * This module maps explicitly selected use cases onto evidence requirements; it
 * does not infer measured performance from user language or product specifications.
 */
import type { Dimension } from './types.js';

export type Importance = 'essential' | 'important' | 'nice_to_have' | 'irrelevant';
export type DecisionStatus = 'needs_context' | 'needs_confirmation' | 'insufficient_evidence' | 'criteria_mapped';
export interface DecisionCriterion {
  id: string;
  label: string;
  /** Exact evidence capability expected from a licensed, comparable original test. */
  requiredEvidence: string;
  /** Toy scoring mapping, if any; NEVER use for actual original laboratory data. */
  syntheticDimension?: Dimension;
  /** A relevant failure/disadvantage to explain if supported by admissible evidence. */
  concern: string;
}
export interface Choice { id: string; label: string; activates: string[]; }
export interface DecisionQuestion {
  id: string;
  title: string;
  stage: 'essential_context' | 'refinement';
  choices: Choice[];
}
export interface NeedsCategory {
  id: string;
  label: string;
  criteria: DecisionCriterion[];
  questions: DecisionQuestion[];
}
export interface NeedsAnswers {
  /** One of the exact declared options for each answered question. */
  choices: Record<string,string>;
  /** Explicit corrections to inferred relevance; user can mark an issue essential or irrelevant. */
  priorities?: Record<string, Importance>;
  /** User confirms their interpreted priorities and can skip optional questions. */
  confirmInterpretation?: boolean;
}
export interface InterpretedCriterion {
  id: string;
  label: string;
  importance: Importance;
  requiredEvidence: string;
  evidenceAvailable: boolean;
  concern: string;
  /** Is an *assumption* until the user explicitly confirms? */
  origin: 'declared_priority' | 'scenario_inference';
}
export interface DecisionQuestionPrompt { id: string; title: string; options: {id:string;label:string}[]; }
export interface DecisionNeedsResult {
  status: DecisionStatus;
  criteria: InterpretedCriterion[];
  nextQuestions: DecisionQuestionPrompt[];
  evidenceGaps: string[];
  uncertainties: string[];
  /** Only for the existing SYNTHETIC 3-dimension demo; no publication or lab measurements. */
  syntheticWeights: Record<Dimension, number> | null;
  publicationReady: false;
  purpose: 'needs_prototype';
}
const forbiddenInputKey = /(?:price|cost|budget|msrp|rrp|deal|discount|sale|retailer|merchant|amazon|affiliate|commission)/i;
const importanceOrder: Record<Importance,number> = {essential:3,important:2,nice_to_have:1,irrelevant:0};
function ensureSafeId(id:string) {
  if (!id || !/^[a-z][a-z0-9_]*$/.test(id) || forbiddenInputKey.test(id)) throw new Error(`Unsupported or commercial identifier: ${id}`);
}
function validateCategory(category: NeedsCategory):void {
  ensureSafeId(category.id);
  const criterionIds = new Set<string>();
  for (const c of category.criteria) {
    ensureSafeId(c.id);
    ensureSafeId(c.requiredEvidence);
    if (criterionIds.has(c.id)) throw new Error(`Duplicate criterion ${c.id}`);
    criterionIds.add(c.id);
    if (!c.label.trim() || !c.concern.trim()) throw new Error('Empty criterion description');
  }
  if (!category.criteria.length) throw new Error('Missing category criteria');
  const questions = new Set<string>();
  for (const q of category.questions) {
    ensureSafeId(q.id);
    if (questions.has(q.id) || !q.choices.length) throw new Error(`Invalid or duplicate question ${q.id}`);
    questions.add(q.id);
    const seen = new Set<string>();
    for (const choice of q.choices) {
      ensureSafeId(choice.id);
      if (seen.has(choice.id)) throw new Error(`Duplicate choice ${choice.id}`);
      seen.add(choice.id);
      if (!choice.activates.every(id=>criterionIds.has(id))) throw new Error(`Unknown criterion in ${q.id}`);
    }
  }
}
/** Pure and deterministic: a needs questionnaire is not a validated preference-elicitation system. */
export function interpretDecisionNeeds(
  category: NeedsCategory,
  answers: NeedsAnswers,
  availableEvidence: ReadonlySet<string>,
  maxQuestions = 2,
): DecisionNeedsResult {
  validateCategory(category);
  if (!Number.isSafeInteger(maxQuestions) || maxQuestions < 0 || maxQuestions > 10) throw new Error('Invalid question limit');
  for (const [key,value] of Object.entries(answers.choices)) {
    ensureSafeId(key); ensureSafeId(value);
    const q = category.questions.find(q=>q.id===key);
    if (!q || !q.choices.some(c=>c.id===value)) throw new Error(`Unknown answer ${key}: ${value}`);
  }
  for (const [key,value] of Object.entries(answers.priorities ?? {})) {
    ensureSafeId(key);
    if (!category.criteria.some(c=>c.id===key) || !Object.hasOwn(importanceOrder,value)) throw new Error(`Invalid priority ${key}`);
  }
  for (const ev of availableEvidence) ensureSafeId(ev);
  const active = new Set<string>();
  for (const q of category.questions) {
    const choice = q.choices.find(c=>c.id===answers.choices[q.id]);
    if (choice) for (const criterionId of choice.activates) active.add(criterionId);
  }
  for (const [id,priority] of Object.entries(answers.priorities??{})) {
    if (priority==='irrelevant') active.delete(id); else active.add(id);
  }
  const criteria:InterpretedCriterion[] = category.criteria.filter(c=>active.has(c.id)).map(c=>({
    id:c.id,label:c.label,requiredEvidence:c.requiredEvidence,
    importance:answers.priorities?.[c.id] ?? 'important',
    evidenceAvailable:availableEvidence.has(c.requiredEvidence),
    origin:Object.hasOwn(answers.priorities??{},c.id)?'declared_priority':'scenario_inference',
    concern:c.concern
  }));
  const remaining = category.questions.filter(q=>!(q.id in answers.choices));
  const required = remaining.filter(q=>q.stage==='essential_context');
  const open = required.length ? required : answers.confirmInterpretation ? [] : remaining;
  const nextQuestions = open.slice(0,maxQuestions).map(q=>({
    id:q.id,title:q.title,options:q.choices.map(c=>({id:c.id,label:c.label}))
  }));
  const evidenceGaps = criteria.filter(c=>!c.evidenceAvailable).map(c=>c.id);
  const uncertainties:string[] = [];
  if (required.length) uncertainties.push('Missing essential use-case context');
  if (!answers.confirmInterpretation) uncertainties.push('Needs and implied priorities have not been confirmed by the user');
  if (evidenceGaps.length) uncertainties.push('Some requested needs lack admissible test evidence: '+evidenceGaps.join(', '));
  if (criteria.length===0) uncertainties.push('No decision criteria identified');
  // Important subtlety: missing evidence on a selected need MUST NOT be silently ignored.
  const status: DecisionStatus = required.length ? 'needs_context'
    : !answers.confirmInterpretation || criteria.length===0 ? 'needs_confirmation'
    : evidenceGaps.length ? 'insufficient_evidence'
    : 'criteria_mapped';
  let syntheticWeights:Record<Dimension,number>|null = null;
  if (status==='criteria_mapped') {
    const synthetic = {carpet:0,pet_hair:0,ease:0};
    for (const criterion of criteria) {
      const definition = category.criteria.find(c=>c.id===criterion.id)!;
      if (!definition.syntheticDimension) {
        uncertainties.push(`No validated synthetic scoring mapping for ${criterion.id}`);
        continue;
      }
      synthetic[definition.syntheticDimension] += importanceOrder[criterion.importance];
    }
    if (Object.values(synthetic).some(x=>x>0) && criteria.every(c=>category.criteria.find(x=>x.id===c.id)?.syntheticDimension)) {
      syntheticWeights = synthetic;
    }
  }
  return {status,criteria,nextQuestions,evidenceGaps,uncertainties,syntheticWeights,publicationReady:false,purpose:'needs_prototype'};
}

/** Example only: deliberately exposes mismatches in the toy ranking's available evidence. */
export const vacuumNeedsPrototype: NeedsCategory = {
  id:'vacuum', label:'Vacuum cleaner — research prototype',
  criteria:[
    {id:'carpet_cleaning',label:'Carpet cleaning effectiveness',requiredEvidence:'carpet',syntheticDimension:'carpet',concern:'May leave embedded dirt in carpet'},
    {id:'hard_floor_cleaning',label:'Hard-floor cleaning effectiveness',requiredEvidence:'hard_floor',concern:'May scatter debris on hard floors'},
    {id:'pet_hair_removal',label:'Pet-hair removal effectiveness',requiredEvidence:'pet_hair',syntheticDimension:'pet_hair',concern:'May struggle with embedded pet hair'},
    {id:'handling',label:'Handling and ease of use',requiredEvidence:'ease',syntheticDimension:'ease',concern:'May feel awkward or heavy in daily use'},
    {id:'noise',label:'Measured sound level',requiredEvidence:'noise',concern:'May be too noisy for the environment'},
    {id:'filtration',label:'Filtration and particle containment',requiredEvidence:'filtration',concern:'May emit fine particles while cleaning'},
    {id:'maintenance',label:'Maintenance effort',requiredEvidence:'maintenance',concern:'May be difficult to clean or maintain'},
  ],
  questions:[
    {id:'floors',title:'Which surfaces will you mainly clean?',stage:'essential_context',choices:[
      {id:'carpet',label:'Mainly carpet',activates:['carpet_cleaning']},
      {id:'hard',label:'Mainly hard floors',activates:['hard_floor_cleaning']},
      {id:'mixed',label:'Both carpet and hard floors',activates:['carpet_cleaning','hard_floor_cleaning']},
    ]},
    {id:'pets',title:'Do you regularly need to remove pet hair?',stage:'essential_context',choices:[
      {id:'yes',label:'Yes',activates:['pet_hair_removal']},
      {id:'no',label:'No',activates:[]},
    ]},
    {id:'handling_preference',title:'Does ease of carrying and manoeuvring matter?',stage:'refinement',choices:[
      {id:'yes',label:'Yes',activates:['handling']},{id:'no',label:'Not particularly',activates:[]},
    ]},
    {id:'noise_preference',title:'Is a quiet machine particularly important?',stage:'refinement',choices:[
      {id:'yes',label:'Yes',activates:['noise']},{id:'no',label:'Not particularly',activates:[]},
    ]},
    {id:'filtration_preference',title:'Do you want to prioritise fine-particle filtration?',stage:'refinement',choices:[
      {id:'yes',label:'Yes',activates:['filtration']},{id:'no',label:'Not particularly',activates:[]},
    ]},
    {id:'maintenance_preference',title:'Is low-maintenance cleaning important?',stage:'refinement',choices:[
      {id:'yes',label:'Yes',activates:['maintenance']},{id:'no',label:'Not particularly',activates:[]},
    ]},
  ],
};

/**
 * Second example category. All capabilities are deliberately distinct from the
 * existing vacuum-only synthetic scores; no fabricated headphone mapping.
 */
export const headphonesNeedsPrototype: NeedsCategory = {
  id:'headphones',label:'Headphones — research prototype',
  criteria:[
    {id:'anc',label:'Measured active noise cancellation',requiredEvidence:'headphone_anc',concern:'May not suppress relevant environmental noise'},
    {id:'comfort',label:'Long-session comfort',requiredEvidence:'headphone_comfort',concern:'May cause discomfort during prolonged listening'},
    {id:'mic',label:'Voice-call microphone performance',requiredEvidence:'headphone_mic',concern:'Callers may struggle to hear you in noisy places'},
    {id:'latency',label:'Audio latency',requiredEvidence:'headphone_latency',concern:'Sound may lag behind the image or game'},
    {id:'battery',label:'Measured battery life',requiredEvidence:'headphone_battery',concern:'May need charging during frequent use'},
    {id:'leakage',label:'Sound leakage',requiredEvidence:'headphone_leakage',concern:'Others nearby may hear your audio'},
  ],
  questions:[
    {id:'usage',title:'What will you mainly use the headphones for?',stage:'essential_context',choices:[
      {id:'commute',label:'Commuting and travel',activates:['anc','battery']},
      {id:'calls',label:'Work calls and meetings',activates:['mic','comfort']},
      {id:'gaming',label:'Gaming and video',activates:['latency','comfort']},
      {id:'listening',label:'Focused music listening',activates:['comfort','leakage']},
    ]},
    {id:'session',title:'How long do you normally wear them?',stage:'refinement',choices:[
      {id:'long',label:'Long sessions',activates:['comfort']},
      {id:'short',label:'Short sessions',activates:[]},
    ]},
    {id:'shared_space',title:'Will you often listen close to other people?',stage:'refinement',choices:[
      {id:'yes',label:'Yes',activates:['leakage']},
      {id:'no',label:'No',activates:[]},
    ]},
  ],
};
