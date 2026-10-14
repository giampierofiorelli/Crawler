/**
 * Phase 62 — RESEARCH-ONLY deterministic, auditable decision sensitivity.
 * Scientific guidance: ISPOR MCDA (2016) and systematic review (2023) recommend
 * testing decision sensitivity to inputs/assumptions, not fabricating confidence.
 *
 * This is NOT SMAA, a probability model, a validated ranking or a licence clearance.
 * Every scenario must be explicitly attributed; no random weights, imputation,
 * proprietary review scores, Amazon feeds or numerical confidence levels.
 */
import {createHash} from 'node:crypto';
import {evaluateContextualFunctionalSuitability, type ContextualFunctionalResult} from './contextual_functional_suitability.js';
import type {Importance} from './needs_discovery.js';

export type FunctionalInput=Parameters<typeof evaluateContextualFunctionalSuitability>[0];
export type SensitivityScenario =
 | {id:string; kind:'priority_alternative'; reference:string; provenance:'user_confirmed_alternative'|'analyst_stress_test'; priorities:Record<string,Importance>}
 | {id:string; kind:'withhold_original_test'; reference:string; provenance:'analyst_stress_test'; originalTestId:string};
export type Signal='first_only'|'second_only'|'opposed_signals'|'no_supported_direction';
export interface SensitivitySnapshot {
  scenarioId:string;
  scenarioKind:'baseline'|SensitivityScenario['kind'];
  provenance:'baseline_confirmed'|SensitivityScenario['provenance'];
  reference:string;
  direction:Signal;
  firstSignals:string[];
  secondSignals:string[];
  mandatoryStatuses:[ContextualFunctionalResult['variants'][0]['mandatoryStatus'],ContextualFunctionalResult['variants'][1]['mandatoryStatus']];
  unresolvedEssentialNeeds:[string[],string[]];
  concerns:[string[],string[]];
  evidenceGaps:string[];
  eligibleForPublicRanking:false;
  conditionalOnly:true;
  note:string;
}
export interface DecisionRobustnessAudit {
  purpose:'decision_sensitivity_research_only';
  publicationReady:false;
  confidenceProbability:null;
  winnerId:null;
  scenarioCoverage:'only_the_enumerated_scenarios';
  baseline:SensitivitySnapshot;
  testedScenarios:SensitivitySnapshot[];
  observedChanges:{scenarioId:string;changedFields:string[];reason:string}[];
  conclusion:'sensitivity_detected'|'no_change_in_tested_scenarios'|'not_assessable';
  unresolvedQuestions:string[];
  limitations:string[];
}
const safeId=(s:unknown):s is string=>typeof s==='string' && /^[a-z][a-z0-9_]*$/.test(s) &&
 !/(?:price|budget|cost|retailer|amazon|affiliate|promotion|marketing|commission)/i.test(s);
const safeText=(s:unknown):s is string=>typeof s==='string'&&s.trim().length>0&&s.length<=500;
function snapshot(result:ContextualFunctionalResult,scenarioId:string,kind:SensitivitySnapshot['scenarioKind'],
  provenance:SensitivitySnapshot['provenance'],reference:string,note:string):SensitivitySnapshot {
  const firstSignals=result.criteria.filter(c=>c.comparison==='potential_practical_advantage_first').map(c=>c.needId);
  const secondSignals=result.criteria.filter(c=>c.comparison==='potential_practical_advantage_second').map(c=>c.needId);
  const direction:Signal=firstSignals.length&&secondSignals.length?'opposed_signals':
     firstSignals.length?'first_only':secondSignals.length?'second_only':'no_supported_direction';
  const evidenceGaps=result.criteria.filter(c=>c.importance!=='irrelevant'&&
    c.perVariant.some(v=>v.state==='not_assessed'||v.state==='reported_interval_indeterminate'||v.state==='observed_concern')).map(c=>c.needId);
  return {scenarioId,scenarioKind:kind,provenance,reference,direction,firstSignals,secondSignals,
    mandatoryStatuses:[result.variants[0].mandatoryStatus,result.variants[1].mandatoryStatus],
    unresolvedEssentialNeeds:[...result.variants.map(v=>[...v.unresolvedNeedIds])] as [string[],string[]],
    concerns:[...result.variants.map(v=>[...v.concernNeedIds])] as [string[],string[]],
    evidenceGaps,eligibleForPublicRanking:false,conditionalOnly:true,note};
}
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
/** The caller supplies a documented finite set of alternative assumptions;
 *  test omissions re-run the entire upstream pipeline, not just a stale result.
 */
export function auditDecisionRobustness(input:FunctionalInput,scenarios:readonly SensitivityScenario[]):DecisionRobustnessAudit {
  if(!Array.isArray(scenarios)||scenarios.length===0||scenarios.length>32)
    throw Error('Provide 1–32 explicitly documented scenarios (implementation resource guard, not a scientific threshold)');
  const base=evaluateContextualFunctionalSuitability(input);
  const baseline=snapshot(base,'baseline','baseline','baseline_confirmed','Confirmed input state',
    'Descriptive pairwise evidence: never a statistical winner or a purchase recommendation');
  const found=new Set<string>(['baseline']);
  const testedScenarios:SensitivitySnapshot[]=[];
  for(const scenario of scenarios){
    if(!scenario||!safeId(scenario.id)||found.has(scenario.id)||!safeText(scenario.reference))throw Error('Unidentified or undocumented scenario');
    found.add(scenario.id);
    // Clone avoids mutating the user's original preferences and evidence.
    const revised:FunctionalInput=structuredClone(input);
    let note='';
    if(scenario.kind==='priority_alternative') {
      if(!['user_confirmed_alternative','analyst_stress_test'].includes(scenario.provenance)||
        !scenario.priorities||Object.keys(scenario.priorities).length===0)throw Error('Invalid priority scenario');
      for(const [id,priority] of Object.entries(scenario.priorities)){
        if(!safeId(id)||!input.category.criteria.some(c=>c.id===id)||
          (typeof priority!=='string'||!['essential','important','nice_to_have','irrelevant'].includes(priority)))throw Error('Unsupported priority alternative');
      }
      revised.answers.priorities={...revised.answers.priorities,...scenario.priorities};
      // A sensitivity analysis of analyst choices must NOT pretend user confirmation.
      if(scenario.provenance==='analyst_stress_test')revised.answers.confirmInterpretation=false;
      note=scenario.provenance==='analyst_stress_test' ?
        'Unconfirmed analytical stress test, not an inferred user preference or ranking':
        'User-confirmed alternative preference as attested by caller; no identity verification here';
    }else if(scenario.kind==='withhold_original_test') {
      if(scenario.provenance!=='analyst_stress_test'||!safeId(scenario.originalTestId))throw Error('Invalid source withdrawal scenario');
      const before=revised.originalLaboratory.export.measurements;
      if(!before.some(r=>r.original_test_id===scenario.originalTestId))throw Error('Unknown original test identifier');
      const excluded=new Set(before.filter(r=>r.original_test_id===scenario.originalTestId).map(r=>r.record_id));
      revised.originalLaboratory.export.measurements=before.filter(r=>!excluded.has(r.record_id));
      revised.originalLaboratory.publishedUncertainties=revised.originalLaboratory.publishedUncertainties.filter(
        r=>!excluded.has(r.recordId));
      // Clearly mark altered export bytes with a reproducible derived hash; not the original data hash.
      revised.originalLaboratory.export.input_sha256=createHash('sha256').update(JSON.stringify({
        counterfactual:true,originalExportSha256:input.originalLaboratory.export.input_sha256,
        withheldOriginalTestId:scenario.originalTestId,records:revised.originalLaboratory.export.measurements})).digest('hex');
      note='Counterfactual whole-original-test withholding; modified export hash is derived, NOT an original publisher file';
    }else throw Error('Unsupported scenario kind');
    const result=evaluateContextualFunctionalSuitability(revised);
    testedScenarios.push(snapshot(result,scenario.id,scenario.kind,scenario.provenance,scenario.reference,note));
  }
  const observedChanges=testedScenarios.flatMap(s=>{
    const changedFields:string[]=[];
    for(const key of ['direction','firstSignals','secondSignals','mandatoryStatuses','unresolvedEssentialNeeds','concerns','evidenceGaps'] as const)
      if(!equal(baseline[key],s[key]))changedFields.push(key);
    return changedFields.length?[{scenarioId:s.scenarioId,changedFields,reason:s.note}]:[];
  });
  const unresolvedQuestions=[...new Set([baseline,...testedScenarios].flatMap(s=>[
    ...s.evidenceGaps.map(id=>`Missing or incomplete admissible evidence for ${id}`),
    ...s.unresolvedEssentialNeeds.flat().map(id=>`Essential requirement unresolved: ${id}`)
  ]))];
  const conclusion=observedChanges.length?'sensitivity_detected':
    baseline.direction==='no_supported_direction'&&testedScenarios.every(s=>s.direction==='no_supported_direction')?
      'not_assessable':'no_change_in_tested_scenarios';
  return {purpose:'decision_sensitivity_research_only',publicationReady:false,confidenceProbability:null,
    winnerId:null,scenarioCoverage:'only_the_enumerated_scenarios',baseline,testedScenarios,
    observedChanges,conclusion,unresolvedQuestions,limitations:[
      'No statistical robustness, decision confidence or probability of superiority is inferred.',
      'No changes across chosen scenarios DOES NOT establish global robustness or a validated recommendation.',
      'Sources and licensing remain unverified; laboratory measurements may be fictional.',
      'Analyst stress tests do not represent measured user preference distributions.',
      'No missing evidence is imputed or treated as poor product quality.',
      'Commercial pricing, Amazon, affiliate and marketing inputs do not enter this audit.',
      'This is a deterministic audit inspired by MCDA sensitivity analysis, NOT a SMAA implementation.',
    ]};
}
