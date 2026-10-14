/** Synthetic extraction audit. Not automated article interpretation or live crawl. */
import {makeEphemeralInventory109,SourceWideSemanticMemory109,
  type SemanticAtom109} from '../src/phase109_source_wide_semantic_intake.js';
const p=makeEphemeralInventory109({reportId:'demo_vacuum_review_v1',originalTestId:'test_original_1',
  sourceUrl:'https://lab.example.org/reviews/vacuum',categoryId:'vacuum',
  inventoryReviewerId:'research_assessor',inventoryReviewReference:'full article inventory audited synthetically',
  blocks:[
    {segmentId:'summary',locator:'#summary',surface:'paragraph',accessible:true,content:'Summary text for fictional vacuum'},
    {segmentId:'noise_table',locator:'#noise-table',surface:'table',accessible:true,content:'Invented table for fictional vacuum'},
    {segmentId:'footnote',locator:'#method-note',surface:'footnote',accessible:true,content:'Mode changed during fictional noise test'},
    {segmentId:'brush_caption',locator:'#brush-caption',surface:'caption',accessible:true,content:'Fictional pet hair brush observation'}
  ]});
const db=new SourceWideSemanticMemory109();
const a=(atomId:string,segmentId:string,conceptId:string,criterionId:string|null,
  kind:SemanticAtom109['kind'],assertionCode:string):SemanticAtom109=>({
  atomId,segmentId,conceptId,criterionId,kind,assertionCode,variantId:'alpha',
  relatedVariantIds:[],polarity:kind==='context'?'not_applicable':'unfavorable',
  epistemicStatus:'observed',evidenceMode:'expert_judgement',conditionCodes:['high_power_mode'],
  reviewReference:'human checked synthetic segment interpretation',isProvisional:false
});
try{
  db.register(p);
  db.addAtom(p.reportId,a('noise_tone','noise_table','tonal_whine','noise','observation','tonal_whine_present'));
  db.addAtom(p.reportId,a('mode_context','footnote','power_setting','operating_conditions','context','test_in_high_mode'));
  db.addAtom(p.reportId,a('pet_hair','brush_caption','pet_hair_wrap',null,'maintenance','brush_wrap_with_pet_hair'));
  db.auditSegment(p.reportId,{segmentId:'summary',status:'no_product_observation',atomIds:[],
    noObservationReason:'no_product_claim',reviewReference:'synthetic summary contained no additional finding'});
  for(const [segmentId,atomId] of [['noise_table','noise_tone'],['footnote','mode_context'],['brush_caption','pet_hair']])
    db.auditSegment(p.reportId,{segmentId,status:'extracted',atomIds:[atomId],
      reviewReference:'independent synthetic adjudication of segment'});
  db.seal(p.reportId,'synthetic complete manifest approval record');
  const before=db.allAtoms(p.reportId);
  db.adoptMapping('vacuum',{conceptId:'pet_hair_wrap',criterionId:'brush_maintenance',
    reviewerId:'taxonomy_reviewer',scope:'whole_category',
    methodologyReference:'whole category approved maintenance rubric',
    approvalReference:'fictional category-wide schema review'});
  const out={phase:109,synthetic:true,sourceTextStored:false,llmCallsDuringQuery:0,
    coverage:db.coverage(p.reportId),
    originalTestId:p.originalTestId,
    conditionsPreserved:before.find(x=>x.atomId==='mode_context')?.conditionCodes,
    unexpectedAspectBefore:null,unexpectedAspectAfter:db.effectiveCriterion(p.reportId,'pet_hair'),
    evidenceForProduct:db.atomsForVariant(p.reportId,'alpha').map(x=>({id:x.atomId,conceptId:x.conceptId,
      criterionId:x.criterionId,kind:x.kind,assertionCode:x.assertionCode}))};
  console.log(JSON.stringify(out,null,2));
}finally{db.close();}
