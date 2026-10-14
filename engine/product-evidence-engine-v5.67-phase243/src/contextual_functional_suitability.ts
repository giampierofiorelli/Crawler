/**
 * Phase 61: evidence-informed Contextual Functional Suitability (CFS), RESEARCH ONLY.
 *
 * Composes three existing research modules: user needs (56), exact-variant
 * original-laboratory comparisons (57), source-reported expanded uncertainty
 * (58), and specification / independent-evidence separation (60).
 *
 * This is NOT a calibrated decision model, a licence audit, an expert certification,
 * a probability estimate, an unqualified ranking, or a production recommendation.
 * No price, Amazon, retailer data, marketing claim or synthetic score belongs here.
 */
import {interpretDecisionNeeds, type NeedsAnswers, type NeedsCategory, type Importance} from './needs_discovery.js';
import {bridgeNeedsToOriginalLab, type NeedToTestRule, type QuarantinedLabExport} from './lab_needs_bridge.js';
import {auditOriginalLabUncertainty, type PublishedExpandedUncertainty} from './lab_uncertainty.js';
import {separateTechnicalAndIndependentEvidence, type AdmissibleFact, type ReviewedCriterion} from './technical_vs_independent.js';

export type FunctionLane = 'declared_structural_capability'|'observed_task_outcome';
export type TaskRole = 'main_task'|'task_friction'|'accessibility'|'continuity'|'safety';
export interface DocumentaryThreshold {
  /** A threshold must come from the USER or an explicit external validation, not the engine. */
  kind:'at_least'|'at_most'|'equal_to';
  value:number|boolean;
  basis:'explicit_user_requirement'|'documented_domain_threshold';
  reference:string;
}
export interface PracticalDifference {
  /** Small differences cannot be sold as meaningful without a documented margin. */
  minimumAbsoluteDifference:number;
  basis:'user_stated'|'domain_validated';
  reference:string;
}
export interface FunctionRule {
  needId:string;
  role:TaskRole;
  lane:FunctionLane;
  unit:string;
  /** Required only to assess pass/fail against an essential requirement. */
  threshold?:DocumentaryThreshold;
  /** Required to suggest that an OBSERVED difference could matter in practice. */
  practicalDifference?:PracticalDifference;
  /** An expert-auditable mapping, not a signed licence or scientific validation. */
  mappingReference:string;
}
export type TaskScreeningState =
  | 'not_assessed'
  | 'declared_match'
  | 'declared_mismatch'
  | 'observed_value_only'
  | 'observed_concern'
  | 'reported_interval_meets'
  | 'reported_interval_fails'
  | 'reported_interval_indeterminate';
export interface CriterionAssessment {
  needId:string;
  importance:Importance;
  role:TaskRole;
  lane:FunctionLane;
  perVariant:[{
    variantId:string;
    state:TaskScreeningState;
    observedValue?:number|boolean;
    interval?:[number,number];
    sourceType:'TECHNICAL_SPECIFICATION'|'INDEPENDENT_EVIDENCE'|'NO_ADMISSIBLE_EVIDENCE';
    sourceRecordId?:string;
    reasoning:string;
  },{
    variantId:string;
    state:TaskScreeningState;
    observedValue?:number|boolean;
    interval?:[number,number];
    sourceType:'TECHNICAL_SPECIFICATION'|'INDEPENDENT_EVIDENCE'|'NO_ADMISSIBLE_EVIDENCE';
    sourceRecordId?:string;
    reasoning:string;
  }];
  comparison:
    'no_supported_pair'|'declared_attributes_only'|'observed_difference_not_established'|
    'observed_similarity_or_uncertain'|'potential_practical_advantage_first'|'potential_practical_advantage_second';
  comparisonExplanation:string;
  needsAttention:boolean;
}
export interface VariantTaskScreening {
  variantId:string;
  mandatoryStatus:'declared_or_observed_failure_signal'|'requirements_appear_met_in_available_evidence'|'unresolved_mandatory_requirements'|'no_essential_requirements_confirmed';
  mandatoryNeedIds:string[];
  unresolvedNeedIds:string[];
  concernNeedIds:string[];
}
export interface ContextualFunctionalResult {
  purpose:'contextual_functional_suitability_research_only';
  publicationReady:false;
  rankingEligible:false;
  winnerId:null;
  overallProductScore:null;
  statisticalConfidence:null;
  needsConfirmed:boolean;
  variants:[VariantTaskScreening,VariantTaskScreening];
  criteria:CriterionAssessment[];
  /** No quality scores, and no assertion that a winner is statistically established. */
  nonCompensatoryFlags:string[];
  tradeoffs:string[];
  auditNotes:string[];
}
const forbidden=/(?:price|cost|budget|msrp|rrp|deal|discount|sale|retailer|merchant|amazon|affiliate|commission|marketing|promotion|sponsored|advertis|manufacturer_claim)/i;
const safeId=(id:unknown):id is string=>typeof id==='string' && /^[a-z][a-z0-9_]*$/.test(id)&&!forbidden.test(id);
function checkCommercialFields(obj:unknown,level=0) {
  if (level>16) throw new Error('Input nesting too deep');
  if(!obj||typeof obj!=='object')return;
  for(const [key,v] of Object.entries(obj)){
    if(forbidden.test(key)) throw new Error('Commercial input is prohibited in functional suitability');
    if(typeof v==='object')checkCommercialFields(v,level+1);
  }
}
function validateRules(rules:FunctionRule[],category:NeedsCategory){
  if(!Array.isArray(rules)||rules.length===0||rules.length>100)throw Error('Missing functional rule set');
  const seen=new Set<string>();
  for(const r of rules) {
    if(!r||!safeId(r.needId)||seen.has(r.needId)||!category.criteria.some(c=>c.id===r.needId)||
       !['main_task','task_friction','accessibility','continuity','safety'].includes(r.role)||
       !['declared_structural_capability','observed_task_outcome'].includes(r.lane)||
       !r.unit?.trim()||!r.mappingReference?.trim()) throw Error('Unreviewed or duplicate functional rule');
    seen.add(r.needId);
    if(r.threshold){
      const t=r.threshold;
      if(!['at_least','at_most','equal_to'].includes(t.kind)||
         !['explicit_user_requirement','documented_domain_threshold'].includes(t.basis)||!t.reference?.trim()||
         !((typeof t.value==='number'&&Number.isFinite(t.value)) || typeof t.value==='boolean')||
         (typeof t.value==='boolean'&&t.kind!=='equal_to'))throw Error('Unjustified or invalid threshold');
    }
    if(r.practicalDifference){
      const p=r.practicalDifference;
      if(r.lane!=='observed_task_outcome'||!Number.isFinite(p.minimumAbsoluteDifference)||
         p.minimumAbsoluteDifference<=0||!['user_stated','domain_validated'].includes(p.basis)||!p.reference?.trim())
        throw Error('Practical difference requires nonzero documented reference and measured outcome');
    }
  }
}
function checkThreshold(value:number|boolean,t:DocumentaryThreshold):boolean{
  if(typeof value!==typeof t.value)throw Error('Threshold and observed value types are incompatible');
  if(t.kind==='equal_to')return value===t.value;
  if(typeof value!=='number'||typeof t.value!=='number')throw Error('Numerical threshold requires numbers');
  return t.kind==='at_least'?value>=t.value:value<=t.value;
}
function intervalCheck(range:[number,number],t:DocumentaryThreshold):'meets'|'fails'|'indeterminate' {
  if(typeof t.value!=='number')throw Error('A numerical measurement requires a numerical threshold');
  const [lo,hi]=range;
  if(t.kind==='at_least')return lo>=t.value?'meets':hi<t.value?'fails':'indeterminate';
  if(t.kind==='at_most')return hi<=t.value?'meets':lo>t.value?'fails':'indeterminate';
  return lo===hi&&lo===t.value?'meets':(hi<t.value||lo>t.value)?'fails':'indeterminate';
}
function empty(variantId:string,reason:string) {
  return {variantId,state:'not_assessed' as const,sourceType:'NO_ADMISSIBLE_EVIDENCE' as const,reasoning:reason};
}
/**
 * Integrates upstream AUDITS without laundering their documentary source approvals
 * into legal clearance. A proof-of-concept task screening, never a live ranking.
 */
export function evaluateContextualFunctionalSuitability(input:{
  category:NeedsCategory;
  answers:NeedsAnswers;
  exactVariantIds:[string,string];
  functionalRules:FunctionRule[];
  technical:{rules:ReviewedCriterion[]; evidence:AdmissibleFact[]};
  originalLaboratory:{export:QuarantinedLabExport;mappingRules:NeedToTestRule[];publishedUncertainties:PublishedExpandedUncertainty[]};
}):ContextualFunctionalResult {
  checkCommercialFields(input);
  const {category,answers,exactVariantIds,functionalRules}=input;
  if(!Array.isArray(exactVariantIds)||exactVariantIds.length!==2||exactVariantIds[0]===exactVariantIds[1]||
     !exactVariantIds.every(safeId))throw Error('Require two distinct exact variants');
  validateRules(functionalRules,category);
  // Each original upstream validator re-runs against raw records.
  const technical=separateTechnicalAndIndependentEvidence({exactVariantIds,
    rules:input.technical.rules,evidence:input.technical.evidence});
  const bridge=bridgeNeedsToOriginalLab({category,answers,exactVariantIds,
    export:input.originalLaboratory.export,mappingRules:input.originalLaboratory.mappingRules});
  const uncertainty=auditOriginalLabUncertainty({bridge,
    originalExport:input.originalLaboratory.export,
    publishedUncertainties:input.originalLaboratory.publishedUncertainties});
  const initialNeeds=interpretDecisionNeeds(category,answers,new Set());
  const needsConfirmed=!!answers.confirmInterpretation &&
    !initialNeeds.uncertainties.includes('Missing essential use-case context') && initialNeeds.criteria.length>0;
  // Exact original measurement identity and context are already checked in bridge/audit.
  const criteria:CriterionAssessment[]=initialNeeds.criteria.map(need=>{
    const rule=functionalRules.find(r=>r.needId===need.id);
    const fallbackRole:TaskRole=rule?.role??'main_task';
    const fallbackLane:FunctionLane=rule?.lane??'observed_task_outcome';
    const base=exactVariantIds.map(v=>empty(v,rule?'No admissible evidence for this task under the required context':'No reviewed task-to-evidence mapping')) as CriterionAssessment['perVariant'];
    let pair:CriterionAssessment['comparison']='no_supported_pair';
    let pairExplanation='No supported cross-product conclusion';
    if(rule?.lane==='declared_structural_capability'){
      const c=technical.criteria.find(c=>c.criterionId===need.id);
      if(c){
        for(let i=0;i<2;i++){
          const entry=c.byVariant[i];
          const s=entry.technicalSpecification;
          if(!s||s.nature!=='physical_or_functional_attribute'||s.unit!==rule.unit||entry.status==='needs_editorial_review')continue;
          // Declared features may support a fit check but NEVER laboratory performance.
          const fit=rule.threshold?checkThreshold(s.value,rule.threshold):null;
          base[i]={variantId:exactVariantIds[i],state:fit===null?'not_assessed':fit?'declared_match':'declared_mismatch',
            sourceType:'TECHNICAL_SPECIFICATION',observedValue:s.value,sourceRecordId:s.sourceId,
            reasoning:fit===null?'Documented technical attribute; no user- or domain-specified acceptability threshold':
              `Technical documentation indicates ${fit?'a match':'a mismatch'}; independent verification is not established`};
        }
        if(base.every(x=>x.sourceType==='TECHNICAL_SPECIFICATION')){
          pair='declared_attributes_only';
          pairExplanation='Comparison of manufacturer-documented technical attributes only; not independently tested performance';
        }
      }
    } else if(rule?.lane==='observed_task_outcome') {
      const c=bridge.comparisons.find(c=>c.needId===need.id);
      const a=uncertainty.assessments.find(c=>c.needId===need.id);
      if(c?.status==='descriptive_only' && c.firstValue!==undefined && c.secondValue!==undefined && c.unit===rule.unit){
        for(let i=0;i<2;i++){
          const n=i===0?c.firstValue:c.secondValue;
          const reported=a?.firstInterval && a?.secondInterval &&
            (a.status==='reported_intervals_separated'||a.status==='reported_intervals_overlap_or_touch');
          const range=reported?(i===0?a!.firstInterval!:a!.secondInterval!):undefined;
          const t=range && rule.threshold?intervalCheck(range,rule.threshold):null;
          base[i]={variantId:exactVariantIds[i],state:t==='meets'?'reported_interval_meets':t==='fails'?'reported_interval_fails':
              t==='indeterminate'?'reported_interval_indeterminate':
              rule.threshold&&!checkThreshold(n,rule.threshold)?'observed_concern':'observed_value_only',
            observedValue:n,interval:range,sourceType:'INDEPENDENT_EVIDENCE',
            sourceRecordId:c.sourceRecordIds?.[i],
            reasoning:range ? (t===null?'Reported uncertainty interval available; no documented acceptability threshold':
              'Threshold compared to laboratory-reported expanded interval, NOT a significance test or real-world guarantee'):
              'Point observation only: unknown measurement uncertainty must not be treated as zero'};
        }
        pair='observed_difference_not_established';
        pairExplanation='Comparable point observations alone do not establish real-world superiority or practical importance';
        if(c.firstValue===c.secondValue){
          pair='observed_similarity_or_uncertain';
          pairExplanation='Same observed value, not proof of equivalent performance';
        }else if(a?.status==='reported_intervals_overlap_or_touch'){
          pair='observed_similarity_or_uncertain';
          pairExplanation='Reported expanded intervals overlap; no superiority or equivalence inference';
        }else if(a?.status==='reported_intervals_separated' && rule.practicalDifference &&
          Math.abs(c.firstValue-c.secondValue)>=rule.practicalDifference.minimumAbsoluteDifference){
          pair=c.direction==='first_observed_better'?'potential_practical_advantage_first':'potential_practical_advantage_second';
          pairExplanation='Reported expanded intervals are disjoint AND a pre-documented relevance margin was met; conditional signal only, not a statistically validated recommendation';
        }
      }
    }
    return {needId:need.id,importance:need.importance,role:fallbackRole,lane:fallbackLane,perVariant:base,
      comparison:pair,comparisonExplanation:pairExplanation,needsAttention:need.importance==='essential'&&
      base.some(x=>!['declared_match','reported_interval_meets'].includes(x.state))};
  });
  const variants=exactVariantIds.map((variantId,i)=>{
    const essentials=criteria.filter(c=>c.importance==='essential');
    const concerns=essentials.filter(c=>['declared_mismatch','reported_interval_fails'].includes(c.perVariant[i].state));
    const unresolved=essentials.filter(c=>!['declared_match','reported_interval_meets','declared_mismatch','reported_interval_fails'].includes(c.perVariant[i].state));
    return {variantId,
      mandatoryStatus:!needsConfirmed?'unresolved_mandatory_requirements':
        !essentials.length?'no_essential_requirements_confirmed':
        concerns.length?'declared_or_observed_failure_signal':
        unresolved.length?'unresolved_mandatory_requirements':
        'requirements_appear_met_in_available_evidence',
      mandatoryNeedIds:essentials.map(c=>c.needId),
      unresolvedNeedIds:unresolved.map(c=>c.needId),
      concernNeedIds:concerns.map(c=>c.needId)};
  }) as [VariantTaskScreening,VariantTaskScreening];
  const nonCompensatoryFlags=criteria.filter(c=>c.importance==='essential').flatMap(c=>
    c.perVariant.filter(v=>['declared_mismatch','reported_interval_fails'].includes(v.state)).map(v=>
      `${v.variantId}: ${c.needId} raises a mandatory-task failure concern which optional strengths MUST NOT offset`));
  const advantageA=criteria.filter(c=>c.comparison==='potential_practical_advantage_first').map(c=>c.needId);
  const advantageB=criteria.filter(c=>c.comparison==='potential_practical_advantage_second').map(c=>c.needId);
  const tradeoffs=advantageA.length&&advantageB.length ?
    [`Observed, source-conditional advantages differ by task: first variant (${advantageA.join(', ')}) versus second (${advantageB.join(', ')}); no overall winner established`] : [];
  return {purpose:'contextual_functional_suitability_research_only',publicationReady:false,
    rankingEligible:false,winnerId:null,overallProductScore:null,statisticalConfidence:null,
    needsConfirmed,variants,criteria,nonCompensatoryFlags,tradeoffs,auditNotes:[
      'No calibrated weights, universal quality score or public winner is generated.',
      'Manufacturer structural attributes remain declared facts; nominal performance specifications never substitute for independent task outcomes.',
      'A missing test or unreported uncertainty never automatically means a product is worse.',
      'Source approvals and rights statuses in these fixtures are unverified documentary assertions, not legal clearances.',
      'Disjoint expanded-uncertainty intervals and documented relevance margins are descriptive screening criteria, not hypothesis tests.',
      'Price, retailer, Amazon and promotional data must never influence this decision layer.',
    ]};
}
