/** Reproducible constructed demo, NOT an independent human-reviewed benchmark. */
import {createHash} from 'node:crypto';
import {writeFileSync,mkdirSync} from 'node:fs';
import {advanceUserRequest164,newRequestSession164} from '../dist/src/phase164_user_request_journey.js';
import {planQualitativeNeedResearch168} from '../dist/src/phase168_qualitative_need_research_bridge.js';
const sha=(s)=>createHash('sha256').update(s).digest('hex');
const defs=[['quiet_operation','quiet','performance_quality','noise_comfort'],
 ['steam_wand','steam wand','feature_presence','frother_availability'],
 ['quick_heatup','quick heat-up','performance_quality','warmup_speed']];
const brain={categoryId:'coffee_machine',schemaVersion:1,aliases:['coffee machine'],
 sources:[{id:'constructed_reference',url:'https://example.org/fixture',title:'Constructed source',
 originalDocumentId:'constructed_original',role:'original_expert_method'}],
 concepts:defs.map(([id,alias])=>({id,kind:'capability',aliases:[alias],label:id,
 evidenceKeys:['test_'+id],state:'reviewed_definition',review:{reviewId:'constructed_review',
 reviewerId:'fictional_reviewer',reviewScope:'category_definition',sourceRefIds:['constructed_reference']}})),
 quality:[],distinctions:[]};
const facets=defs.map(([aspectId,,evidenceSemantics,criterionId])=>({categoryId:'coffee_machine',
 aspectId,criterionId,evidenceSemantics,categoryReviewReference:'constructed_schema_receipt'}));
const examples=[
 {question:'Best coffee machine must have a steam wand',confirmed:[['steam_wand','required','steam wand']]},
 {question:'Best coffee machine ideally quiet',confirmed:[['quiet_operation','preferred','quiet']]},
 {question:'Best coffee machine no need for quick heat-up',confirmed:[]},
 {question:'Best coffee machine must have quiet',confirmed:[['quiet_operation','required','quiet']]},
];
const finding={findingId:'constructed_noise_test',exactVariantId:'model_a',criterionId:'noise_comfort',
 proposition:'This appliance was audibly distracting during a constructed test.',
 polarity:'unfavourable',basis:'hands_on_observation',context:{usage:'studio_flat'},
 methodologyReference:'constructed_test_plan',qualification:'No genuine lab testing performed.',
 originalTestId:'constructed_original_test',sourceUrl:'https://example.org/fictional-article',
 sourceSha256:sha('fictional source'),sourceSpanSha256:sha('fictional span'),sourceSpanBytes:15,
 reviewStatus:'quarantined_for_semantic_method_and_rights_review',
 evidenceKind:'original_professional_qualitative_observation',quantifiedMeasurement:false,
 weight:null,numericScore:null};
const approval={findingId:finding.findingId,reviewerId:'fictional_human',
 reviewReference:'synthetic_review_not_real',validatedSourceSha256:finding.sourceSha256,
 reviewedAt:'2026-10-12T08:00:00Z',semanticFaithfulness:'confirmed',methodAssessment:'documented',
 adequacyAssessment:'documented',criterionImplication:'concerns'};
const outputs=[];
for(const [i,entry] of examples.entries()){
 const {question,confirmed}=entry;
 const request=advanceUserRequest164(newRequestSession164('phase168_demo_'+i),{
  turnId:'turn_1',question,language:'en',brains:[brain]});
 const confirmations=confirmed.map(([aspectId,meaning,exactUserPhrase])=>({
  confirmationId:'constructed_confirmation_'+aspectId,turnId:'turn_1',questionSha256:sha(question),
  aspectId,meaning,exactUserPhrase,confirmationEventReference:'fictional_user_event_ref',
  confirmedContext:{usage:'studio_flat'}}));
 const result=planQualitativeNeedResearch168({question,request,facets,confirmations,
  variantEvidence:[{variantId:'model_a',findings:[finding],approvals:[approval]},
   {variantId:'model_b',findings:[],approvals:[]}]});
 outputs.push({question,result});
}
const dir='evaluation/phase168';mkdirSync(dir,{recursive:true});
writeFileSync(dir+'/PHASE168-CONSTRUCTED-QUALITATIVE-RESEARCH.json',JSON.stringify({
 phase:168,experiment:'synthetic context/variant/source gating only',
 evidenceAuthenticity:'all schemas, confirmations, review findings and review receipts are constructed fixtures',
 modelInference:'none',independentAnnotation:false,results:outputs},null,2)+'\n');
console.log(JSON.stringify(outputs.map(x=>({question:x.question,
 requirements:x.result.requirements.map(r=>[r.aspectId,r.status]),
 variants:x.result.variantPreviews.map(v=>[v.variantId,v.assessments.map(a=>a.status)]),
 rankingAuthorized:x.result.rankingAuthorized})),null,2));
