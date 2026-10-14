/** Constructed software scenarios; DO NOT claim these were real user inquiries or human-assessed. */
import {createBlindAnnotationTemplate,evaluateSelectiveGate,
 type EvaluationCase} from '../src/selective_evaluation.js';
import type {UnresolvedQuestion,ReviewSourceGrant} from '../src/selective_user_evidence.js';
import {writeFileSync} from 'node:fs';
const now='2026-10-10';
const exampleGrant:ReviewSourceGrant={sourceId:'example_authorized',host:'example.org',
 approvedDocumentUrl:'https://example.org/license-fixture',licenceValidUntil:'2028-01-01',
 approvalRecorded:true,automatedAcquisitionAllowed:true,commercialAnalysisAllowed:true,
 aiExtractionAllowed:true,remoteModelTransferAllowed:false,derivedObservationPublicationAllowed:false};
function make(id:string,question:string,criterion:string,context:string|null,gapType:UnresolvedQuestion['gapType'],
 coverage:UnresolvedQuestion['professionalCoverage'],basis:UnresolvedQuestion['materialityBasis'],
 grants:ReviewSourceGrant[]=[],category='headphones'):EvaluationCase {
 return {caseId:id,category,question:{id,productVariantId:category==='vacuum'?'vacuum_a':'headphone_a',criterionId:criterion,
 question,context,gapType,professionalCoverage:coverage,materialityBasis:basis,
 materialityReference:basis==='not_established'?null:'constructed example research case '+id},
 grants,asOf:now,origin:'constructed_scenario',sourceReference:'CONSTRUCTED FIXTURE — not a source or a user interview',
 split:id.endsWith('_held')?'held_out':'development'};
}
const cases:EvaluationCase[]=[
 make('comfort_held','Does the headband cause pressure on the temples when wearing glasses for eight hours?','comfort_long','Eight hours with prescription glasses','ergonomic_experience','partial','user_explicit',[exampleGrant]),
 make('earfatigue_demo','Do the ear pads make ears too warm after wearing headphones for several hours?','ear_thermal','Four-hour work sessions','long_term_use','missing','user_explicit',[exampleGrant]),
 make('training_fit_held','Will these headphones slip when running on an indoor treadmill for forty minutes?','sport_fit','Indoor running on treadmill','situational_experience','partial','mandatory_user_requirement',[exampleGrant]),
 make('battery_meas_demo','How long does battery life last at the specified volume with ANC enabled?','battery_life','ANC at measured volume','controlled_performance_measurement','missing','user_explicit',[exampleGrant]),
 make('bluetooth_codec_held','Does this model support the specific Bluetooth codec required by my device?','codec_compatibility','Device supports only a particular codec','technical_compatibility','missing','mandatory_user_requirement',[]),
 make('expert_covered_demo','What is the measured noise attenuation in the controlled acoustic test?','anc_attenuation','Controlled standardized laboratory condition','controlled_performance_measurement','sufficient_for_question','user_explicit',[]),
 make('unknown_setting_held','Will these headphones be comfortable and suitable for my needs?','unknown_context',null,'unknown_need','missing','user_explicit',[]),
 make('no_rights_demo','Does the headband become uncomfortable after a whole working day?','comfort_long','Eight-hour workday with glasses','ergonomic_experience','missing','user_explicit',[]),
 make('not_material_held','Do some people dislike how the case hinge feels after months?','hinge_feel','Case opening during normal use','long_term_use','missing','not_established',[exampleGrant]),
 make('vacuum_pets_demo','Does hair tangle around the roller after months of using it with a long-haired cat?','hair_tangle','Long-haired pets over several months','long_term_use','partial','user_explicit',[exampleGrant],'vacuum'),
 make('vacuum_noise_held','What is the measured noise level when using the motorized floor head?','vacuum_noise','Controlled measurement on hard floors','controlled_performance_measurement','partial','mandatory_user_requirement',[exampleGrant],'vacuum'),
 make('vacuum_storage_demo','Is the vacuum easy to carry and store in a narrow hallway daily?','storage_access','Small flat with narrow hallway','ergonomic_experience','partial','user_explicit',[exampleGrant],'vacuum'),
 make('vacuum_filter_held','Is a certified HEPA filtration class stated for the exact vacuum variant?','filter_class','Certified filter specification required','technical_compatibility','missing','mandatory_user_requirement',[],'vacuum'),
 make('noise_context_demo','Does the product remain comfortable on a six-hour train journey?','comfort_train','Six-hour train journey','situational_experience','sufficient_for_question','user_explicit',[exampleGrant]),
 make('vacuum_ask_held','Would this vacuum work well for the conditions in my home?','home_context',null,'unknown_need','partial','user_explicit',[],'vacuum'),
 make('no_material_demo','Does the carry bag feel pleasant to touch during unpacking?','bag_touch','Unboxing and touching carry pouch','situational_experience','missing','not_established',[exampleGrant])
];
const report=evaluateSelectiveGate({cases});
if(report.metrics!==null)throw Error('Metrics must not exist without human annotations');
const result={researchStatus:'constructed_software_scenarios_only',note:'These cases are authored testing prompts; not observed user questions, licensed reviews or independently assigned gold labels.',
 evaluation:report,annotationsTemplate:createBlindAnnotationTemplate(cases)};
writeFileSync('phase67-constructed-evaluation-output.json',JSON.stringify(result,null,2)+'\n');
writeFileSync('phase67-blind-annotation-template.json',JSON.stringify(result.annotationsTemplate,null,2)+'\n');
console.log(JSON.stringify({cases:report.caseCount,referenceJudgments:report.evaluatedCaseCount,
 metrics:report.metrics,predictions:report.rows.reduce<Record<string,number>>((a,r)=>{a[r.predicted]=(a[r.predicted]??0)+1;return a},{}),
 status:result.researchStatus},null,2));
