/** Real published measurements, manually transcribed and checked 2026-10-11.
 * Not an automated source ingestion experiment, not a verified purchase ranking.
 * RTINGS original test reports Methodology v1.4 for these four reviews.
 * Source URLs are references, not copies of editorial prose.
 */
import {boundedNoiseRequest112,rankSameIntent112,compareEquivalentRequests112,
  type EvidenceSnapshot112,type Measurement112} from '../src/phase112_semantic_ranking_invariance.js';
const reviews=[
 {variantId:'tineco_s11',productName:'Tineco PURE ONE S11',bare:67.8,carpet:64.1,
  sourceUrl:'https://www.rtings.com/vacuum/reviews/tineco/pure-one-s11'},
 {variantId:'dyson_v11',productName:'Dyson V11',bare:70.2,carpet:71.4,
  sourceUrl:'https://www.rtings.com/vacuum/reviews/dyson/v11'},
 {variantId:'dyson_v15',productName:'Dyson V15 Detect',bare:70.5,carpet:71.0,
  sourceUrl:'https://www.rtings.com/vacuum/reviews/dyson/v15-detect'},
 {variantId:'shark_stratos_iz682h',productName:'Shark Stratos tested unit IZ682H',bare:74.2,carpet:75.7,
  sourceUrl:'https://www.rtings.com/vacuum/reviews/shark/stratos-cordless'}
];
const measurements=reviews.flatMap(r=>[
 {variantId:r.variantId,productName:r.productName,criterionId:'noise_dba' as const,
  contextId:'bare_floor' as const,value:r.bare,unit:'dBA' as const,
  methodId:'rtings_vacuum_method_v1_4',sourceUrl:r.sourceUrl,originalTestId:'rtings_'+r.variantId,
  provenanceStatus:'independent_measured' as const},
 {variantId:r.variantId,productName:r.productName,criterionId:'noise_dba' as const,
  contextId:'low_pile_carpet' as const,value:r.carpet,unit:'dBA' as const,
  methodId:'rtings_vacuum_method_v1_4',sourceUrl:r.sourceUrl,originalTestId:'rtings_'+r.variantId,
  provenanceStatus:'independent_measured' as const} ] satisfies Measurement112[]);
const evidence:EvidenceSnapshot112={snapshotId:'phase112_rtings_pilot',categoryId:'vacuum_cleaner',
  methodId:'rtings_vacuum_method_v1_4',evidenceRevision:'manually_checked_20261011',
  variantIds:reviews.map(r=>r.variantId),measurements};
const requests=[
 {user:'invented_a',query:'Cercami gli aspirapolveri che fanno meno rumore sui pavimenti duri'},
 {user:'invented_b',query:'Which vacuum cleaners make the least noise on hard floors'},
 {user:'invented_c',query:'Dammi gli aspirapolveri più silenziosi sui pavimenti duri'},
 {user:'invented_d',query:'Which vacuums are quietest on bare floors'},
 {user:'invented_e',query:'Dammi gli aspirapolveri meno rumorosi sulla moquette'},
 {user:'invented_f',query:'Quali aspirapolveri cordless sono più silenziosi sui pavimenti duri'}
];
const projection=requests.map(r=>{
 const parsed=boundedNoiseRequest112(r.query,'no_additional_user_constraints_confirmed');
 return {user:r.user,utterance:r.query,status:parsed.status,
  ...(parsed.status==='verified_bounded_grammar'?{context:parsed.intent.contextId,
   result:rankSameIntent112(parsed.intent,evidence)}:{reason:parsed.reason})};
});
const aa=boundedNoiseRequest112(requests[0].query,'no_additional_user_constraints_confirmed');
const bb=boundedNoiseRequest112(requests[1].query,'no_additional_user_constraints_confirmed');
if(aa.status!=='verified_bounded_grammar'||bb.status!=='verified_bounded_grammar')throw Error('pilot_parser_error');
const invariance=compareEquivalentRequests112({intent:aa.intent,snapshot:evidence},{intent:bb.intent,snapshot:evidence});
console.log(JSON.stringify({pilot:'phase112_manually_grounded_source_measurements',
 reviewer:'RTINGS',method:'RTINGS Vacuum Test Bench v1.4',
 originalPublications:reviews.map(({variantId,sourceUrl})=>({variantId,sourceUrl})),
 evidenceType:'four_published_independent_original_test_reviews_one_laboratory',
 utterances:'constructed_variations_not_authentic_user_research',
 invariantPair:invariance,projections:projection,
 limitation:'single_criterion_noise_only; no overall product recommendation; model never ran over live reviews; exact model variant confirmation beyond tested unit is incomplete',
 publicationReady:false},null,2));
