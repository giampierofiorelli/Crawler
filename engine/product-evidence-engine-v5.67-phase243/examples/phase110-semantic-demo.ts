import {extractReview110,scoreHeldout110,type SourceInput110,type Model110} from '../src/phase110_local_semantic_extractor.js';
const para='Strong cleaning performance, but the motor makes a high-pitched noise at full power.';
const note='Long pet hair accumulates around the roller after multiple cleaning cycles.';
const source:SourceInput110={reportId:'constructed_review_v1',originalTestId:'constructed_test_1',
  sourceUrl:'https://example.org/fictional/vacuum',categoryId:'vacuum',
  inventoryReviewerId:'example_auditor',inventoryReviewReference:'fictional inventory review only',
  variants:['fictional_vacuum'],blocks:[
    {segmentId:'body',locator:'#body',surface:'paragraph',accessible:true,
      representation:'complete',content:para},
    {segmentId:'footnote',locator:'#maintenance-note',surface:'footnote',accessible:true,
      representation:'complete',content:note},
    {segmentId:'source_info',locator:'#author-info',surface:'paragraph',accessible:true,
      representation:'complete',content:'Publisher information, 2025.'}]};
function claim(segmentId:string,aspect:string,text:string,kind:'observation'|'maintenance',
  polarity:'favorable'|'unfavorable'){
  return {segmentId,candidate:{variantId:'fictional_vacuum',relatedVariantIds:[],
    conceptId:aspect,criterionId:null,kind,polarity,assertionCode:aspect+'_observed',
    evidenceMode:'expert_judgement',epistemicStatus:'observed',conditionCodes:[],
    evidenceStart:0,evidenceEnd:text.length,evidenceText:text}};
}
const simulated:Model110={name:'SIMULATED_NOT_A_REAL_LOCAL_MODEL',async extract({mode,blocks}){
  const segmentId=blocks[0].segmentId;
  if(segmentId==='body'&&mode==='initial')return {claims:[claim('body','cleaning_quality',
    'Strong cleaning performance','observation','favorable')],emptySegments:[]};
  if(segmentId==='body'&&mode==='omissions')return {claims:[claim('body','noise_tone',
    'the motor makes a high-pitched noise at full power','observation','unfavorable')],emptySegments:[]};
  if(segmentId==='footnote'&&mode==='initial')return {claims:[claim('footnote','pet_hair_wrap',
    'Long pet hair accumulates around the roller','maintenance','unfavorable')],emptySegments:[]};
  return {claims:[],emptySegments:segmentId==='source_info'?[segmentId]:[]};
}};
const packet=await extractReview110(source,simulated);
const quality=scoreHeldout110([{surface:'paragraph',expected:['clean','noise'],predicted:['clean','noise']},
  {surface:'footnote',expected:['hair','condition'],predicted:['hair']}]);
console.log(JSON.stringify({phase:110,status:'constructed_fixture_not_live_ollama',
  reportId:packet.manifest.reportId,segments:packet.manifest.segments.length,
  proposals:packet.proposed.map(x=>({conceptId:x.atom.conceptId,kind:x.atom.kind,
    polarity:x.atom.polarity,sourceSegment:x.atom.segmentId,isProvisional:x.atom.isProvisional})),
  unresolvedSegments:packet.unresolvedSegments,issues:packet.problems,
  passageTextPersisted:false,semanticApprovalPending:true,
  demonstrationOnlyMetrics:quality},null,2));
