import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateContextualFunctionalSuitability, type FunctionRule} from '../src/contextual_functional_suitability.js';
import type {NeedsCategory,NeedsAnswers} from '../src/needs_discovery.js';
import type {ReviewedCriterion,TechnicalSpecification} from '../src/technical_vs_independent.js';
import type {OriginalLabMeasurement,NeedToTestRule,QuarantinedLabExport} from '../src/lab_needs_bridge.js';
import type {PublishedExpandedUncertainty} from '../src/lab_uncertainty.js';

// ALL PRODUCTS, MEASUREMENTS, VALUES AND DOCUMENTS BELOW ARE FICTIONAL.
const variants=['headphone_a','headphone_b'] as [string,string];
const category:NeedsCategory={id:'headphones',label:'Illustrative headset task context',
 criteria:[
  {id:'connection',label:'Compatible connection',requiredEvidence:'connector',concern:'Cannot connect to work device'},
  {id:'battery',label:'Usable call runtime',requiredEvidence:'runtime',concern:'Cannot last the meeting'},
  {id:'mic',label:'Intelligible call',requiredEvidence:'voice',concern:'Listeners cannot understand speech'},
 ],
 questions:[{id:'scenario',title:'Main use',stage:'essential_context',choices:[{id:'remote_work',label:'Work calls',activates:['connection','battery','mic']}]}]};
const answers:NeedsAnswers={choices:{scenario:'remote_work'},confirmInterpretation:true,
 priorities:{connection:'essential',battery:'essential',mic:'important'}};
const hash='a'.repeat(64);
const provenance=(id:string)=>({sourceUrl:'https://manufacturer.example.org/technical/details',documentId:'technicalone',
 documentSha256:hash,publisherName:'Illustrative manufacturer',capturedAt:'2026-10-01T00:00:00Z',rightsMode:'research_only' as const,
 approval:{reviewerId:'reviewerone',documentSha256:hash,exactVariantId:id,reviewedAt:'2026-10-02T00:00:00Z',status:'approved' as const,evidenceReference:'fictional_review'}});
const techRule:ReviewedCriterion={criterionId:'connection',specFieldKey:'usb_audio_supported',specNature:'physical_or_functional_attribute',unit:'boolean',
 context:{laptop:'wired_usb'},reviewedBy:'reviewerone',reviewReference:'fictional_technical_mapping'};
const spec=(id:string,v:string,value:boolean):TechnicalSpecification=>({id,exactVariantId:v,criterionId:'connection',value,
 unit:'boolean',context:{laptop:'wired_usb'},origin:'TECHNICAL_SPECIFICATION',sourceType:'manufacturer_technical_document',
 documentSection:'technical_specifications',specFieldKey:'usb_audio_supported',nature:'physical_or_functional_attribute',provenance:provenance(v)});
const record=(id:string,variant:string,criterion:string,value:number,unit:string):OriginalLabMeasurement=>({
 record_id:id,original_test_id:`original_${id}`,test_url:`https://lab.example.org/tests/${id}`,tested_variant:variant,
 criterion,measurement:value,unit,protocol_id:criterion==='battery_runtime'?'call_loop':'call_noise',
 protocol_version:'1',conditions:criterion==='battery_runtime'?{microphone:'on',codec:'aac'}:{background:'office_noise',microphone:'on'},
 tested_at:'2026-01-20T00:00:00Z'});
const rows=[record('ba','headphone_a','battery_runtime',22,'hours'),record('bb','headphone_b','battery_runtime',14,'hours'),
 record('ma','headphone_a','speech_intelligibility',70,'percent'),record('mb','headphone_b','speech_intelligibility',95,'percent')];
const originalExport:QuarantinedLabExport={source_kind:'original_independent_lab_measurements',review_only:true,
 ranking_input_approved:false,rights_status:'human_attested_not_cryptographically_verified',
 publisher_domain:'lab.example.org',input_sha256:hash,measurements:rows};
const mappingRules:NeedToTestRule[]=[
 {categoryId:'headphones',needId:'battery',measurementCriterion:'battery_runtime',unit:'hours',favourableDirection:'higher',
 protocolId:'call_loop',protocolVersion:'1',conditions:{microphone:'on',codec:'aac'},reviewReference:'fictional_battery_method'},
 {categoryId:'headphones',needId:'mic',measurementCriterion:'speech_intelligibility',unit:'percent',favourableDirection:'higher',
 protocolId:'call_noise',protocolVersion:'1',conditions:{background:'office_noise',microphone:'on'},reviewReference:'fictional_mic_method'},
];
const uncertainty=(r:OriginalLabMeasurement,range:number):PublishedExpandedUncertainty=>({recordId:r.record_id,originalTestId:r.original_test_id,
 testedVariant:r.tested_variant,measuredValue:r.measurement,unit:r.unit,expandedUncertainty:range,coverageFactor:2,
 uncertaintyMethod:'fictional repeated measurement and calibration',documentationUrl:`https://lab.example.org/methods/${r.record_id}`,
 reportingBasis:'original_lab_reported',uncertaintyScope:'full_reported_measurand'});
const uncertainties=rows.map((r,i)=>uncertainty(r,i<2?1:2));
const functionalRules:FunctionRule[]=[
 {needId:'connection',role:'main_task',lane:'declared_structural_capability',unit:'boolean',
  threshold:{kind:'equal_to',value:true,basis:'explicit_user_requirement',reference:'fictional_user_requirement'},mappingReference:'task_mapping_one'},
 {needId:'battery',role:'main_task',lane:'observed_task_outcome',unit:'hours',
  threshold:{kind:'at_least',value:16,basis:'explicit_user_requirement',reference:'fictional_user_requirement'},
  practicalDifference:{minimumAbsoluteDifference:3,basis:'user_stated',reference:'fictional_preference'},mappingReference:'task_mapping_two'},
 {needId:'mic',role:'task_friction',lane:'observed_task_outcome',unit:'percent',
  practicalDifference:{minimumAbsoluteDifference:10,basis:'domain_validated',reference:'illustrative_not_real_validation'},mappingReference:'task_mapping_three'},
];
const fixture=()=>({category,answers,exactVariantIds:variants,functionalRules,
 technical:{rules:[techRule],evidence:[spec('conn_a','headphone_a',true),spec('conn_b','headphone_b',false)]},
 originalLaboratory:{export:originalExport,mappingRules,publishedUncertainties:uncertainties}});
const run=(i:ReturnType<typeof fixture>=fixture())=>evaluateContextualFunctionalSuitability(i);
const criterion=(id:string,i=fixture())=>run(i).criteria.find(x=>x.needId===id)!;

test('integrates technical fit, test outcomes and need importance without a winner or score',()=>{
 const v=run();assert.equal(v.purpose,'contextual_functional_suitability_research_only');
 assert.equal(v.winnerId,null);assert.equal(v.overallProductScore,null);assert.equal(v.rankingEligible,false);
 assert.equal(v.criteria.length,3);assert.equal(v.needsConfirmed,true);
 assert.equal(v.criteria.find(x=>x.needId==='connection')?.perVariant[0].sourceType,'TECHNICAL_SPECIFICATION');
 assert.equal(v.criteria.find(x=>x.needId==='battery')?.perVariant[0].sourceType,'INDEPENDENT_EVIDENCE');
});
test('non-compensatory mandatory connection failure is visible despite optional microphone advantage',()=>{
 const v=run();assert.equal(v.variants[1].mandatoryStatus,'declared_or_observed_failure_signal');
 assert.equal(v.variants[1].concernNeedIds.includes('connection'),true);
 assert.equal(v.criteria.find(x=>x.needId==='mic')?.comparison,'potential_practical_advantage_second');
 assert.equal(v.nonCompensatoryFlags.length>0,true);assert.equal(v.winnerId,null);
});
test('lab reported expanded intervals support only qualified threshold screening',()=>{
 const r=criterion('battery');assert.equal(r.perVariant[0].state,'reported_interval_meets');
 assert.equal(r.perVariant[1].state,'reported_interval_fails');
 assert.equal(r.perVariant[0].sourceRecordId,'ba');
 assert.equal(r.comparison,'potential_practical_advantage_first');
});
test('opposed task advantages remain a tradeoff, never averaged into a winner',()=>{
 const v=run();assert.equal(v.tradeoffs.length,1);assert.equal(v.overallProductScore,null);
});
test('missing interval never makes unknown precision seem zero',()=>{
 const i=fixture();i.originalLaboratory.publishedUncertainties=[];
 const v=run(i);const c=v.criteria.find(x=>x.needId==='battery')!;
 assert.equal(c.perVariant[0].state,'observed_value_only');
 assert.equal(c.perVariant[1].state,'observed_concern');
 assert.equal(c.comparison,'observed_difference_not_established');
 assert.equal(v.variants[0].mandatoryStatus,'unresolved_mandatory_requirements');
});
test('overlapping intervals and point differences never imply a practical advantage',()=>{
 const i=fixture();i.originalLaboratory.publishedUncertainties=uncertainties.map(x=>({...x,expandedUncertainty:10}));
 assert.equal(criterion('battery',i).comparison,'observed_similarity_or_uncertain');
});
test('without a documented meaningful difference, even separated intervals do not establish practicality',()=>{
 const i=fixture();i.functionalRules=functionalRules.map(r=>r.needId==='battery'?{...r,practicalDifference:undefined}:r);
 assert.equal(criterion('battery',i).comparison,'observed_difference_not_established');
});
test('technical nominal performance claims cannot substitute for missing independent tests',()=>{
 const i=fixture();i.originalLaboratory.export={...originalExport,measurements:rows.filter(r=>r.criterion!=='battery_runtime')};
 i.originalLaboratory.publishedUncertainties=uncertainties.filter(x=>!['ba','bb'].includes(x.recordId));
 assert.equal(criterion('battery',i).perVariant[0].state,'not_assessed');
 assert.equal(run(i).variants[0].mandatoryStatus,'unresolved_mandatory_requirements');
});
test('a manufacturer field with explicit marketing label is rejected by inherited gate',()=>{
 const i=fixture();i.technical.evidence=[{...spec('conn_a','headphone_a',true),documentSection:'marketing' as never}];
 assert.throws(()=>run(i),/Marketing/);
});
test('incompatible original test protocol leaves no supported pair',()=>{
 const i=fixture();i.originalLaboratory.export={...originalExport,measurements:rows.map(r=>r.record_id==='bb'?{...r,protocol_version:'2'}:r)};
 assert.equal(criterion('battery',i).comparison,'no_supported_pair');
});
test('products missing independent results are not punished with fabricated low scores',()=>{
 const i=fixture();i.originalLaboratory.export={...originalExport,measurements:rows.filter(r=>r.tested_variant!=='headphone_b')};
 i.originalLaboratory.publishedUncertainties=uncertainties.filter(u=>u.testedVariant!=='headphone_b');
 assert.equal(criterion('battery',i).perVariant[1].state,'not_assessed');assert.equal(run(i).winnerId,null);
});
test('unconfirmed user interpretation cannot be treated as established task success',()=>{
 const i=fixture();i.answers={...answers,confirmInterpretation:false};
 const v=run(i);assert.equal(v.needsConfirmed,false);assert.equal(v.variants[0].mandatoryStatus,'unresolved_mandatory_requirements');
});
test('inputs that attempt to inject commercial data into any nested record are rejected',()=>{
 const i=fixture();(i as unknown as Record<string,unknown>).amazonCommission=50;
 assert.throws(()=>run(i),/Commercial input/);
});
test('an arbitrary practical threshold without a declared basis is invalid',()=>{
 const i=fixture();i.functionalRules=functionalRules.map(r=>r.needId==='mic'?{...r,practicalDifference:{minimumAbsoluteDifference:12,basis:'engine_guess' as never,reference:'arbitrary'}}:r);
 assert.throws(()=>run(i),/Practical difference/);
});
test('technical-only structural constraint never turns into independently verified performance',()=>{
 const r=criterion('connection');assert.equal(r.comparison,'declared_attributes_only');
 assert.equal(r.perVariant[0].state,'declared_match');assert.match(r.perVariant[0].reasoning,/independent verification is not established/);
});

test('marketing payload in an otherwise shaped technical record is rejected',()=>{
 const i=fixture();(i.technical.evidence[0] as unknown as Record<string,unknown>).marketingClaim='best ever';
 assert.throws(()=>run(i),/Commercial input/);
});
