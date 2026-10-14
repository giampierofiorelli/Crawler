/** Constructed behavioral demonstration. NO real local LLM was executed. */
import {writeFileSync,mkdirSync} from 'node:fs';
import {auditModelProposal113,surfaceSensitivity113,assessIntentBenchmark113,
  type IntentProposal113,type ReferenceCase113,type ModelCaseResult113}
  from '../src/phase113_local_intent_interpreter.js';
import type {EvidenceSnapshot112,Measurement112} from '../src/phase112_semantic_ranking_invariance.js';
const q='Which vacuum cleaners are quietest on hard floors';
const at=(slot:IntentProposal113['anchors'][number]['slot'],value:string,phrase:string)=>{
  const start=q.indexOf(phrase);if(start<0)throw Error('missing demonstration anchor');
  return {slot,value,exactText:phrase,start,end:start+phrase.length};
};
const p:IntentProposal113={schema:'phase113_intent_proposal_v1',category:'vacuum_cleaner',
  goal:'least_noise',surface:'bare_floor',requirements:[],hygieneTargets:[],
  ambiguous:false,unresolvedText:[],anchors:[
    at('category','vacuum_cleaner','vacuum cleaners'),
    at('goal','least_noise','quietest'),at('surface','bare_floor','hard floors')]};
const products=[
  {id:'tineco_s11',name:'Tineco PURE ONE S11',bare:67.8,carpet:64.1,url:'https://www.rtings.com/vacuum/reviews/tineco/pure-one-s11'},
  {id:'dyson_v11',name:'Dyson V11',bare:70.2,carpet:71.4,url:'https://www.rtings.com/vacuum/reviews/dyson/v11'},
  {id:'dyson_v15',name:'Dyson V15 Detect',bare:70.5,carpet:71.0,url:'https://www.rtings.com/vacuum/reviews/dyson/v15-detect'},
  {id:'shark_stratos_iz682h',name:'Shark Stratos tested IZ682H',bare:74.2,carpet:75.7,
    url:'https://www.rtings.com/vacuum/reviews/shark/stratos-cordless'}];
const snapshot:EvidenceSnapshot112={snapshotId:'rtings_noise_reference_pilot',categoryId:'vacuum_cleaner',
  methodId:'rtings_vacuum_method_v1_4',evidenceRevision:'manual_web_validation_20261011',
  variantIds:products.map(x=>x.id),measurements:products.flatMap(product=>[
    ['bare_floor',product.bare],['low_pile_carpet',product.carpet]].map(
      ([contextId,value])=>({variantId:product.id,productName:product.name,criterionId:'noise_dba',
        contextId, value,unit:'dBA',methodId:'rtings_vacuum_method_v1_4',sourceUrl:product.url,
        originalTestId:'rtings_'+product.id,provenanceStatus:'independent_measured'} as Measurement112)))};
const gold=(id:string,goldIntentGroup:string,goldLabel:ReferenceCase113['goldLabel']):ReferenceCase113=>({
  id,family:'vacuum',goldIntentGroup,goldLabel,goldProvenance:'constructed_by_developer',adjudicatorIds:[]});
const cases=[gold('italian_floor','bare_floor','resolvable'),gold('english_floor','bare_floor','resolvable'),
  gold('english_carpet','low_pile_carpet','resolvable'),gold('unknown_surface','unspecified','ambiguous'),
  gold('cordless_constraint','cordless_bare_floor','resolvable')];
const res=(id:string,status:ModelCaseResult113['status'],proposedIntentGroup:string|null):ModelCaseResult113=>({id,status,proposedIntentGroup});
const predictions=[res('italian_floor','resolved','bare_floor'),res('english_floor','resolved','bare_floor'),
  res('english_carpet','resolved','bare_floor'),res('unknown_surface','clarification',null),
  res('cordless_constraint','abstained',null)];
const artifact={phase:113,status:'constructed_fixture_not_local_model_inference',
  proposalAudit:auditModelProposal113(q,p),surfaceSensitivity:surfaceSensitivity113(snapshot,
    'no_additional_user_constraints_confirmed'),
  benchmark:assessIntentBenchmark113(cases,predictions),
  qualifications:{localModelWasRun:false,annotationsIndependentlyJudged:false,
    representsRealConsumerUtterances:false,measurementsManuallyTranscribedFromProfessionalReviews:true,
    originalSources:products.map(x=>x.url),rankNotPublished:true}};
mkdirSync('audit/phase113',{recursive:true});
writeFileSync('audit/phase113/constructed-language-robustness.json',JSON.stringify(artifact,null,2)+'\n');
console.log('Wrote constructed-language-robustness.json; no real LLM run');
