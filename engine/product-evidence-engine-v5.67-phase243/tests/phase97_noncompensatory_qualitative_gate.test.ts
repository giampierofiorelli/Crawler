import test from 'node:test';
import assert from 'node:assert/strict';
import {screenNonCompensatoryEvidence,evaluateNonCompensatorySuitability,
 type HardConstraintAdjudication,type QualitativeVariantEvidence} from '../src/phase97_noncompensatory_qualitative_gate.js';
import type {ContextualFunctionalResult,CriterionAssessment} from '../src/contextual_functional_suitability.js';
import type {QuarantinedQualitativeFinding,ReviewEvidenceApproval,QualitativeNeed} from '../src/phase96_qualitative_review_evidence.js';
// These are entirely fictional product examples and simulated reviews.
const ids=['headphone_a','headphone_b'] as const;
const numeric=(mode:'pass'|'fail'|'unknown'|'declared_fail'='pass',confirmed=true):ContextualFunctionalResult=>{
 const state:CriterionAssessment['perVariant'][0]['state']=mode==='fail'?'reported_interval_fails':mode==='unknown'?'not_assessed':
 mode==='declared_fail'?'declared_mismatch':'reported_interval_meets';
 const source=mode==='declared_fail'?'TECHNICAL_SPECIFICATION':mode==='unknown'?'NO_ADMISSIBLE_EVIDENCE':'INDEPENDENT_EVIDENCE';
 const c:CriterionAssessment={needId:'long_wear_comfort',importance:'essential',role:'main_task',lane:'observed_task_outcome',
  perVariant:[{variantId:ids[0],state,sourceType:source,reasoning:'Fictional task test'},
   {variantId:ids[1],state:'reported_interval_meets',sourceType:'INDEPENDENT_EVIDENCE',reasoning:'Fictional task test'}],
  comparison:'no_supported_pair',comparisonExplanation:'Fixture',needsAttention:false};
 const bonus:CriterionAssessment={...c,needId:'excellent_sound',importance:'important',
  perVariant:[{variantId:ids[0],state:'reported_interval_meets',sourceType:'INDEPENDENT_EVIDENCE',reasoning:'Better fictional sound'},
   {variantId:ids[1],state:'not_assessed',sourceType:'NO_ADMISSIBLE_EVIDENCE',reasoning:'Unknown'}]};
 return {purpose:'contextual_functional_suitability_research_only',publicationReady:false,rankingEligible:false,
  winnerId:null,overallProductScore:null,statisticalConfidence:null,needsConfirmed:confirmed,
  variants:[{variantId:ids[0],mandatoryStatus:'unresolved_mandatory_requirements',mandatoryNeedIds:['long_wear_comfort'],unresolvedNeedIds:[],concernNeedIds:[]},
   {variantId:ids[1],mandatoryStatus:'unresolved_mandatory_requirements',mandatoryNeedIds:['long_wear_comfort'],unresolvedNeedIds:[],concernNeedIds:[]}],
  criteria:[c,bonus],nonCompensatoryFlags:[],tradeoffs:[],auditNotes:[]};
};
const baseNeed:QualitativeNeed={criterionId:'long_wear_comfort',importance:'essential',
 context:{wear_duration:'eight_hours',fit:'tester'},avoidAdverseFinding:true};
const hex='b'.repeat(64);
const adverse:QuarantinedQualitativeFinding={findingId:'headband_pressure',exactVariantId:ids[0],
 criterionId:'long_wear_comfort',proposition:'The tester reported painful pressure during extended use.',
 polarity:'unfavourable',basis:'hands_on_observation',context:{...baseNeed.context},
 methodologyReference:'direct_eight_hour_fit_assessment',qualification:'Tester-specific experience.',
 originalTestId:'independent_comfort_run_a',sourceUrl:'https://professional.example.org/headphones/a',
 sourceSha256:hex,sourceSpanSha256:'c'.repeat(64),sourceSpanBytes:93,
 reviewStatus:'quarantined_for_semantic_method_and_rights_review',
 evidenceKind:'original_professional_qualitative_observation',quantifiedMeasurement:false,weight:null,numericScore:null};
const approve=(f:QuarantinedQualitativeFinding,implication:ReviewEvidenceApproval['criterionImplication']='concerns'):
 ReviewEvidenceApproval=>({findingId:f.findingId,reviewerId:'reviewer_test',reviewReference:'independent_review_of_source',
  validatedSourceSha256:f.sourceSha256,reviewedAt:'2026-10-11T01:00:00Z',semanticFaithfulness:'confirmed',
  methodAssessment:'documented',adequacyAssessment:'documented',criterionImplication:implication});
const adj=(other:Partial<HardConstraintAdjudication>={}):HardConstraintAdjudication=>({
 variantId:ids[0],criterionId:'long_wear_comfort',findingIds:[adverse.findingId],
 judgment:'documented_user_incompatibility',reviewerId:'independent_adjudicator',
 reviewReference:'checked_full_original_test',confirmedUserRequirementReference:'user_confirmed_no_extended_pain',
 reviewedAt:'2026-10-11T02:00:00Z',independentlyAuthenticated:false,...other});
const two=(withAdverse=true):QualitativeVariantEvidence[]=>[
 {variantId:ids[0],needs:[baseNeed],findings:withAdverse?[adverse]:[],approvals:withAdverse?[approve(adverse)]:[]},
 {variantId:ids[1],needs:[baseNeed],findings:[],approvals:[]}];
const run=(input:Partial<Parameters<typeof screenNonCompensatoryEvidence>[0]>={})=>
 screenNonCompensatoryEvidence({functional:numeric(),qualitativeByVariant:two(),adjudications:[],...input});

test('a confirmed but unadjudicated adverse review holds the candidate, not automatic exclusion',()=>{
 const r=run();assert.equal(r.variants[0].outcome,'hold_for_adjudication');
 assert.equal(r.variants[0].exclusions.length,0);
 assert.equal(r.variants[0].holds[0].channel,'professional_qualitative');
 assert.equal(r.variants[1].outcome,'conditional_comparison_only');
 assert.equal(r.publicationReady,false);assert.equal(r.winnerId,null);
});
test('independently examined hard user incompatibility provisionally excludes regardless of unrelated advantages',()=>{
 const r=run({adjudications:[adj()]});
 assert.equal(r.variants[0].outcome,'provisionally_excluded');
 assert.equal(r.variants[0].eligibleForConditionalComparison,false);
 assert.equal(r.variants[0].exclusions[0].findingIds[0],'headband_pressure');
 assert.deepEqual(r.variants[0].exclusions[0].originalTestIds,['independent_comfort_run_a']);
 assert.equal(r.comparisonStatus,'one_conditionally_eligible');
 assert.equal(r.overallProductScore,null);assert.equal(r.rankingEligible,false);
});
test('a real Phase61 independent uncertainty interval failing an essential threshold excludes provisionally',()=>{
 const r=run({functional:numeric('fail'),qualitativeByVariant:two(false)});
 assert.equal(r.variants[0].outcome,'provisionally_excluded');
 assert.equal(r.variants[0].exclusions[0].channel,'independent_lab');
});
test('manufacturer mismatch is a hold, not misrepresented as a direct lab-confirmed exclusion',()=>{
 const r=run({functional:numeric('declared_fail'),qualitativeByVariant:two(false)});
 assert.equal(r.variants[0].outcome,'hold_for_adjudication');
 assert.equal(r.variants[0].holds[0].channel,'manufacturer_declaration');
});
test('unknown essential evidence is held, not treated as a negative test',()=>{
 const r=run({functional:numeric('unknown'),qualitativeByVariant:two(false)});
 assert.equal(r.variants[0].outcome,'hold_for_adjudication');
 assert.equal(r.variants[0].exclusions.length,0);
 assert.equal(r.variants[0].holds[0].channel,'missing_or_uncertain');
});
test('explicit user confirmation must precede even independently demonstrated exclusion',()=>{
 const r=run({functional:numeric('fail',false),qualitativeByVariant:two(false)});
 assert.equal(r.variants[0].outcome,'hold_for_adjudication');
 assert.equal(r.variants[0].exclusions.length,0);
});
test('context mismatch yields no qualitative veto',()=>{
 const q=two();q[0]={...q[0],needs:[{...baseNeed,context:{wear_duration:'short',fit:'tester'}}]};
 const r=run({qualitativeByVariant:q});
 assert.equal(r.variants[0].outcome,'conditional_comparison_only');
 assert.equal(r.variants[0].reviewedQualitativeAssessments[0].status,'not_applicable');
});
test('two independent contradictory reviews cause a hold, even with an attempted veto adjudication',()=>{
 const pos:QuarantinedQualitativeFinding={...adverse,findingId:'no_pressure_in_other_test',
  polarity:'favourable',proposition:'A different tester reported a comfortable fit over extended use.',
  originalTestId:'independent_comfort_run_b',sourceUrl:'https://secondlab.example.org/headphones/a'};
 const q=two();q[0]={...q[0],findings:[adverse,pos],approvals:[approve(adverse),approve(pos,'supports')]};
 const r=run({qualitativeByVariant:q,adjudications:[adj()]});
 assert.equal(r.variants[0].outcome,'hold_for_adjudication');
 assert.equal(r.variants[0].exclusions.length,0);
 assert.equal(r.variants[0].holds[0].kind,'contradiction');
});
test('weak methodology leaves an essential unresolved, cannot be used as a certified veto',()=>{
 const q=two();q[0]={...q[0],approvals:[{...approve(adverse),methodAssessment:'uncertain'}]};
 const r=run({qualitativeByVariant:q});
 assert.equal(r.variants[0].outcome,'hold_for_adjudication');
 assert.equal(r.variants[0].exclusions.length,0);
 assert.throws(()=>run({qualitativeByVariant:q,adjudications:[adj()]}),/unsubstantiated_adjudication/);
});
test('a favourable professional opinion remains support and never erases a hard adverse lab finding',()=>{
 const positive:QuarantinedQualitativeFinding={...adverse,findingId:'favourable_other_aspect',
  criterionId:'excellent_sound',polarity:'favourable',proposition:'The second tester praised the detail of the sound.',
  context:{listening:'quiet_room'},originalTestId:'independent_sound_run'};
 const q=two(false);q[0]={...q[0],needs:[baseNeed,{criterionId:'excellent_sound',importance:'important',
  context:{listening:'quiet_room'},avoidAdverseFinding:false}],findings:[positive],
  approvals:[approve(positive,'supports')]};
 const r=run({functional:numeric('fail'),qualitativeByVariant:q});
 assert.equal(r.variants[0].outcome,'provisionally_excluded');
 assert.equal(r.variants[0].support.length,1);
});
test('important but nonessential adverse criticism is a drawback and not an exclusion',()=>{
 const drawback={...adverse,findingId:'limited_microphone',criterionId:'excellent_sound',
  proposition:'A limitation was observed in the nonessential listening criterion.',
  context:{listening:'quiet_room'}};
 const q=two(false);q[0]={...q[0],needs:[baseNeed,{criterionId:'excellent_sound',importance:'important',
  context:{listening:'quiet_room'},avoidAdverseFinding:false}],findings:[drawback],approvals:[approve(drawback)]};
 const r=run({qualitativeByVariant:q});
 assert.equal(r.variants[0].outcome,'conditional_comparison_only');
 assert.equal(r.variants[0].nonFatalDrawbacks.length,1);
});
test('a documented limitation without negative sentiment can trigger a hard hold',()=>{
 const desc={...adverse,polarity:'descriptive' as const,
  proposition:'This headphone lacks a required adjustment during extended wear.'};
 const q=two();q[0]={...q[0],findings:[desc],approvals:[approve(desc,'concerns')]};
 assert.equal(run({qualitativeByVariant:q}).variants[0].outcome,'hold_for_adjudication');
});
test('a vague negative subjective inference cannot be upgraded to exclusion',()=>{
 const q=two();q[0]={...q[0],findings:[{...adverse,basis:'editorial_inference'}]};
 assert.throws(()=>run({qualitativeByVariant:q,adjudications:[adj()]}),/unsubstantiated_adjudication/);
});
test('duplicate or cross-variant findings are rejected rather than attributed to wrong product',()=>{
 const q=two();q[0]={...q[0],findings:[{...adverse,exactVariantId:ids[1]}]};
 assert.throws(()=>run({qualitativeByVariant:q}),/cross_variant/);
 assert.throws(()=>run({qualitativeByVariant:[q[0],q[0]]}),/wrong_or_duplicate_variant/);
});
test('a forged or unscoped hard decision is never accepted',()=>{
 assert.throws(()=>run({adjudications:[adj({independentlyAuthenticated:true as never})]}),/invalid_constraint/);
 assert.throws(()=>run({adjudications:[adj({criterionId:'excellent_sound'})]}),/adjudication_not_for_confirmed_essential/);
 assert.throws(()=>run({adjudications:[adj({findingIds:['invented_claim']})]}),/unsubstantiated_adjudication/);
});
test('the adjudicator must be different from the original evidence assessor and review later',()=>{
 assert.throws(()=>run({adjudications:[adj({reviewerId:'reviewer_test'})]}),/unsubstantiated_adjudication/);
 assert.throws(()=>run({adjudications:[adj({reviewedAt:'2026-10-10T00:00:00Z'})]}),/unsubstantiated_adjudication/);
});
test('a stated user aversion to defects cannot be silently invented by a reviewer',()=>{
 const q=two();q[0]={...q[0],needs:[{...baseNeed,avoidAdverseFinding:false}]};
 assert.throws(()=>run({qualitativeByVariant:q,adjudications:[adj()]}),/unsubstantiated_adjudication/);
});
test('the alternative conditional comparison is not a product winner or public ranking',()=>{
 const r=run({qualitativeByVariant:two(false)});
 assert.equal(r.comparisonStatus,'multiple_conditionally_eligible');
 assert.equal(r.variants[0].eligibleForConditionalComparison,true);
 assert.equal(r.winnerId,null);
});

test('end-to-end Phase61 original-lab screening feeds Phase97 gate (not a handcrafted score)',()=>{
 // Fictional original tests, declared document and confirmed requirements.
 const category={id:'headphones',label:'Illustrative headphone task',criteria:[
  {id:'connection',label:'Required connection',requiredEvidence:'wired',concern:'No required port'},
  {id:'battery',label:'Call battery runtime',requiredEvidence:'measured_runtime',concern:'Call cut off'}],
  questions:[{id:'scenario',title:'Main usage',stage:'essential_context' as const,
   choices:[{id:'working',label:'Work calls',activates:['connection','battery']}]}]};
 const variants:[string,string]=[ids[0],ids[1]];
 const asOf='2026-10-01T00:00:00Z';
 const p=(id:string)=>({sourceUrl:'https://maker.example.org/details',documentId:'technicaldoc',
  documentSha256:'a'.repeat(64),publisherName:'Fictional manufacturer',capturedAt:asOf,rightsMode:'research_only' as const,
  approval:{reviewerId:'testerone',documentSha256:'a'.repeat(64),exactVariantId:id,
   reviewedAt:asOf,status:'approved' as const,evidenceReference:'fictional_check'}});
 const measurements=variants.map((v,i)=>({record_id:`battery_${i}`,original_test_id:`lab_run_${i}`,
  test_url:`https://lab.example.org/run/${i}`,tested_variant:v,criterion:'runtime',measurement:i?22:10,
  unit:'hours',protocol_id:'call_loop',protocol_version:'1',conditions:{microphone:'on',codec:'aac'},tested_at:asOf}));
 const functionalInput={category,answers:{choices:{scenario:'working'},confirmInterpretation:true,
  priorities:{connection:'essential' as const,battery:'essential' as const}},exactVariantIds:variants,
  functionalRules:[
   {needId:'connection',role:'main_task' as const,lane:'declared_structural_capability' as const,unit:'boolean',
    threshold:{kind:'equal_to' as const,value:true,basis:'explicit_user_requirement' as const,reference:'user_connectivity'},mappingReference:'reviewed_connector_map'},
   {needId:'battery',role:'main_task' as const,lane:'observed_task_outcome' as const,unit:'hours',
    threshold:{kind:'at_least' as const,value:16,basis:'explicit_user_requirement' as const,reference:'user_full_day_calls'},mappingReference:'reviewed_battery_map'}],
  technical:{rules:[{criterionId:'connection',specFieldKey:'wired_connect',specNature:'physical_or_functional_attribute' as const,unit:'boolean',
   context:{port:'usb'},reviewedBy:'testerone',reviewReference:'tech_registry'}],
   evidence:variants.map((v,i)=>({id:`connection_${i}`,exactVariantId:v,criterionId:'connection',value:true,unit:'boolean',
    context:{port:'usb'},origin:'TECHNICAL_SPECIFICATION' as const,sourceType:'manufacturer_technical_document' as const,
    documentSection:'technical_specifications' as const,specFieldKey:'wired_connect',nature:'physical_or_functional_attribute' as const,
    provenance:p(v)}))},
  originalLaboratory:{export:{source_kind:'original_independent_lab_measurements' as const,review_only:true as const,
   ranking_input_approved:false as const,rights_status:'human_attested_not_cryptographically_verified' as const,
   publisher_domain:'lab.example.org',input_sha256:'a'.repeat(64),measurements},
   mappingRules:[{categoryId:'headphones',needId:'battery',measurementCriterion:'runtime',unit:'hours',
    favourableDirection:'higher' as const,protocolId:'call_loop',protocolVersion:'1',conditions:{microphone:'on',codec:'aac'},
    reviewReference:'battery_protocol_review'}],
   publishedUncertainties:measurements.map(m=>({recordId:m.record_id,originalTestId:m.original_test_id,
    testedVariant:m.tested_variant,measuredValue:m.measurement,unit:'hours',expandedUncertainty:1,coverageFactor:2,
    uncertaintyMethod:'fictional_measurement',documentationUrl:'https://lab.example.org/methods',
    reportingBasis:'original_lab_reported' as const,uncertaintyScope:'full_reported_measurand' as const}))}};
 const emptyQual=ids.map(variantId=>({variantId,
  needs:[{criterionId:'battery',importance:'essential' as const,context:{codec:'aac'},avoidAdverseFinding:true}],
  findings:[],approvals:[]}));
 const result=evaluateNonCompensatorySuitability({functionalInput,qualitativeByVariant:emptyQual,adjudications:[]});
 assert.equal(result.variants[0].outcome,'provisionally_excluded');
 assert.equal(result.variants[0].exclusions[0].channel,'independent_lab');
 assert.equal(result.variants[1].outcome,'conditional_comparison_only');
 assert.equal(result.winnerId,null);
});
