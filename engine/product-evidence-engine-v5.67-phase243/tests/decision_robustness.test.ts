import test from 'node:test';
import assert from 'node:assert/strict';
import {auditDecisionRobustness} from '../src/decision_robustness.js';
import {fixture} from './robustness_fixtures.js';

test('baseline captures opposed task advantages and mandatory mismatch without inventing a winner',()=>{
 const out=auditDecisionRobustness(fixture(),[{id:'remove_first_battery',kind:'withhold_original_test',reference:'Research stress test — fictional battery observation',provenance:'analyst_stress_test',originalTestId:'original_ba'}]);
 assert.equal(out.baseline.direction,'opposed_signals');
 assert.equal(out.baseline.mandatoryStatuses[1],'declared_or_observed_failure_signal');
 assert.equal(out.winnerId,null);
 assert.equal(out.confidenceProbability,null);
 assert.equal(out.publicationReady,false);
});
test('removing an actual original test changes the evidence without negative imputation',()=>{
 const out=auditDecisionRobustness(fixture(),[{id:'remove_first_battery',kind:'withhold_original_test',reference:'Fictional evidence removal',provenance:'analyst_stress_test',originalTestId:'original_ba'}]);
 assert.equal(out.conclusion,'sensitivity_detected');
 assert.equal(out.testedScenarios[0].direction,'second_only');
 assert.ok(out.testedScenarios[0].evidenceGaps.includes('battery'));
 assert.ok(out.observedChanges[0].changedFields.includes('direction'));
 assert.ok(out.unresolvedQuestions.some(x=>x.includes('battery')));
});
test('user-confirmed alternative preference remains separate from missing evidence',()=>{
 const out=auditDecisionRobustness(fixture(),[{id:'mic_essential',kind:'priority_alternative',provenance:'user_confirmed_alternative',reference:'Hypothetical user preference confirmation',priorities:{mic:'essential'}}]);
 assert.equal(out.testedScenarios[0].provenance,'user_confirmed_alternative');
 assert.equal(out.baseline.mandatoryStatuses[0],'requirements_appear_met_in_available_evidence');
 assert.equal(out.testedScenarios[0].mandatoryStatuses[0],'unresolved_mandatory_requirements');
 assert.equal(out.conclusion,'sensitivity_detected');
});
test('analyst alternative never masquerades as confirmed preference',()=>{
 const out=auditDecisionRobustness(fixture(),[{id:'mic_essential',kind:'priority_alternative',provenance:'analyst_stress_test',reference:'Not a user response',priorities:{mic:'essential'}}]);
 assert.equal(out.testedScenarios[0].mandatoryStatuses[0],'unresolved_mandatory_requirements');
 assert.match(out.testedScenarios[0].note,/Unconfirmed/);
});
test('no tested change cannot be called scientific robustness or probability',()=>{
 const out=auditDecisionRobustness(fixture(),[{id:'no_change',kind:'priority_alternative',provenance:'user_confirmed_alternative',reference:'Same priority already selected',priorities:{mic:'important'}}]);
 assert.equal(out.conclusion,'no_change_in_tested_scenarios');
 assert.equal(out.winnerId,null);
 assert.equal(out.confidenceProbability,null);
 assert.ok(out.limitations.some(x=>x.includes('DOES NOT')));
});
test('original input is immutable during counterfactual test withholding',()=>{
 const input=fixture();
 const before=JSON.stringify(input);
 auditDecisionRobustness(input,[{id:'omit_mic_a',kind:'withhold_original_test',provenance:'analyst_stress_test',reference:'Whole-source omission',originalTestId:'original_ma'}]);
 assert.equal(JSON.stringify(input),before);
});
test('unreferenced withdrawal is forbidden',()=>{
 assert.throws(()=>auditDecisionRobustness(fixture(),[{id:'wrong_test',kind:'withhold_original_test',provenance:'analyst_stress_test',reference:'Unknown',originalTestId:'unknown_test'}]),/Unknown original test/);
});
test('invalid, duplicated and undocumented scenarios fail closed',()=>{
 const a={id:'variant_one',kind:'priority_alternative' as const,provenance:'analyst_stress_test' as const,reference:'Example',priorities:{mic:'essential' as const}};
 assert.throws(()=>auditDecisionRobustness(fixture(),[a,a]),/Unidentified or undocumented/);
 assert.throws(()=>auditDecisionRobustness(fixture(),[{...a,reference:''}]),/Unidentified or undocumented/);
 assert.throws(()=>auditDecisionRobustness(fixture(),[{...a,priorities:{not_real:'essential'}}]),/Unsupported priority/);
 assert.throws(()=>auditDecisionRobustness(fixture(),[{...a,priorities:{mic:'ninety_percent' as never}}]),/Unsupported priority/);
});
test('missing baseline evidence is not filled with a synthetic point estimate',()=>{
 const input=fixture();
 input.originalLaboratory.export.measurements=[];
 input.originalLaboratory.publishedUncertainties=[];
 const out=auditDecisionRobustness(input,[{id:'priority',kind:'priority_alternative',provenance:'user_confirmed_alternative',reference:'User alternate hypothetical',priorities:{mic:'essential'}}]);
 assert.equal(out.baseline.direction,'no_supported_direction');
 assert.equal(out.conclusion,'sensitivity_detected');
 assert.equal(out.winnerId,null);
 assert.ok(out.baseline.evidenceGaps.includes('mic'));
});
test('commercial data injection is rejected through upstream validation',()=>{
 const input=fixture();
 (input as unknown as Record<string,unknown>).amazonPrice='500';
 assert.throws(()=>auditDecisionRobustness(input,[{id:'valid',kind:'priority_alternative',provenance:'analyst_stress_test',reference:'X',priorities:{mic:'essential'}}]),/Commercial input/);
});
test('scenario count is an implementation guard, not scientific sample',()=>{
 assert.throws(()=>auditDecisionRobustness(fixture(),[]),/Provide 1/);
 assert.throws(()=>auditDecisionRobustness(fixture(),Array.from({length:33},(_,i)=>({id:'sample_'+i,kind:'priority_alternative' as const,provenance:'analyst_stress_test' as const,reference:'Test',priorities:{mic:'important' as const}}))),/Provide 1/);
});

test('all-directional-evidence-missing still reports mandatory priority change',()=>{
 const input=fixture();input.originalLaboratory.export.measurements=[];input.originalLaboratory.publishedUncertainties=[];
 const out=auditDecisionRobustness(input,[{id:'mic_optional',kind:'priority_alternative',provenance:'user_confirmed_alternative',reference:'Different confirmed task requirement',priorities:{mic:'essential'}}]);
 assert.equal(out.baseline.direction,'no_supported_direction');
 assert.equal(out.testedScenarios[0].direction,'no_supported_direction');
 assert.equal(out.conclusion,'sensitivity_detected');
 assert.ok(out.observedChanges[0].changedFields.includes('unresolvedEssentialNeeds'));
});
