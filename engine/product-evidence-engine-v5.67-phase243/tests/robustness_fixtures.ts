import type {FunctionRule} from '../src/contextual_functional_suitability.js';
import type {NeedsCategory, NeedsAnswers} from '../src/needs_discovery.js';
import type {ReviewedCriterion,TechnicalSpecification} from '../src/technical_vs_independent.js';
import type {OriginalLabMeasurement, NeedToTestRule,QuarantinedLabExport} from '../src/lab_needs_bridge.js';
import type {PublishedExpandedUncertainty} from '../src/lab_uncertainty.js';
// ALL EXAMPLE PRODUCTS, VALUES, TESTS AND DOCUMENTS ARE FICTIONAL.
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
export const fixture=()=>({category,answers,exactVariantIds:variants,functionalRules,
 technical:{rules:[techRule],evidence:[spec('conn_a','headphone_a',true),spec('conn_b','headphone_b',false)]},
 originalLaboratory:{export:originalExport,mappingRules,publishedUncertainties:uncertainties}});
