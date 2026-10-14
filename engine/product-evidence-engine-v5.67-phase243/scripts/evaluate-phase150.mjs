import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {evaluateDocumentReferences150,referenceManifest150} from '../dist/src/phase150_document_reference_benchmark.js';
import {readBidirectionalDocument149} from '../dist/src/phase149_bidirectional_discourse_candidates.js';
const sha=x=>createHash('sha256').update(x).digest('hex');
const span=(t,s)=>{const start=t.indexOf(s);if(start<0)throw Error('missing_grounded_span:'+s);return {start,end:start+s.length,literal:s};};
function make({id,category,text,mention,target=null,truth='same_textual_referent',phenomenon='cross_paragraph',
 sourceUrl=null,origin='constructed',permission='unestablished',reviewer='phase150_developer',aliases=[]}){
 const host=sourceUrl??`https://example.com/developer-authored/${id}`;
 return {id,split:'development',origin,permission,sourceGroupId:id,productFamilyId:id,categoryId:category,
 input:{document:{text,sha256:sha(text),source:{id,originalDocumentId:id,url:host,title:origin==='constructed'?'Invented evaluation text':'Brief attributed original editorial excerpt',role:'original_product_test'}},
 ...(aliases.length?{pageIdentity:{reviewedProductId:'caller_hint_not_authenticated',reviewedVariantId:'caller_hint_not_authenticated',reviewedAliases:aliases}}:{})},
 annotations:mention?[{id:id+'_a1',mention:span(text,mention),phenomenon,
 votes:reviewer?[{reviewerId:reviewer,truth,...(target?{targetSpan:span(text,target)}:{})}]:[]}]:[]};
}
// Long documents are ORIGINAL DEVELOPER-WRITTEN FIXTURES, not real professional review passages.
const constructed=[
 make({id:'washer_long_context',category:'washing_machine',text:
  'Aster X100 was tested with cotton shirts on the standard cycle. The washing cycle took 114 minutes, while the spin speed was set to 1200 rpm. The detergent drawer was checked separately. The lab retained the same water supply.\n\nThis model then ran a synthetic-fabric cycle at another temperature. The remaining moisture was recorded, but the report did not claim that the temperature alone caused the change. The operator cleaned the filter before the next session.\n\nA later test repeated the first programme. The results were recorded but have not been compared to another product.',
 mention:'This model',target:'Aster X100'}),
 make({id:'cd_forward_context',category:'cd_player',text:
  'This player sounded balanced on the first recording. The reviewer kept the amplifier and speakers unchanged and did not measure the frequency response directly. The disc transport was inspected separately from the sound test. TEAC VRDS-701 includes a DAC and analogue outputs.\n\nA listening session used the same recordings but a different pair of headphones. The reviewer described a change in presentation and explicitly called this a subjective judgement.\n\nNo measurement of the transport mechanism was published.',
 mention:'This player',target:'TEAC VRDS-701',phenomenon:'forward'}),
 make({id:'tv_competing_models',category:'television',text:
  'Orion V500 and Birch B200 were tested in the same room. The first television had its brightness measured in HDR mode. The second television used SDR settings with a different white point. The reviewing team logged both protocols separately.\n\nThis TV looked brighter in a scene that contained very small highlights. However, the reviewer did not identify which model was connected during the second viewing. The colorimeter was calibrated before the test.\n\nNeither observation establishes a superiority claim across the two models.',
 mention:'This TV',truth:'unresolved_from_passage',phenomenon:'comparison'}),
 make({id:'oven_variant_context',category:'oven',text:
  'Aster X100 and Aster X100 Pro were placed side by side. The base version was set to 180°C. The Pro model used a different convection setting and the reviewers recorded its energy use separately. A temperature probe was installed on both shelves.\n\nThis model reached the higher reading after twenty minutes. The notes did not specify whether the sentence described the base oven or the Pro variant. The fan was switched off before a later test.\n\nThe numerical readings were kept as separate observations.',
 mention:'This model',truth:'unresolved_from_passage',phenomenon:'variant',aliases:['Aster X100','Aster X100 Pro']}),
 make({id:'speaker_component_context',category:'loudspeaker',text:
  'Lumen S100 uses a tweeter and a woofer. The woofer enclosure was damped for the listening trial, and the crossover was adjusted for the second run. The engineer took notes about both.\n\nIt sounded harsh during the first recording. The sentence did not say whether the woofer, the whole speaker or the crossover adjustment produced this impression. The amplifier was replaced before the next recording.\n\nNo isolated frequency response was reported.',
 mention:'It',truth:'unresolved_from_passage',phenomenon:'component'}),
 make({id:'coffee_claim_vs_measure',category:'coffee_machine',text:
  'Lumen C30 advertises a fast brewing time according to the packaging. The manufacturer also describes a detachable milk tank and a warming plate. Neither statement is presented as an independent laboratory measurement.\n\nThis model measured a longer extraction time under the review setup. The water temperature was changed, and the filter basket was cleaned between shots. The reviewer did not publish identical settings for the advertised number.\n\nThese reports must remain distinct until the protocols can be checked.',
 mention:'This model',truth:'same_textual_referent',target:'Lumen C30',phenomenon:'condition'}),
 make({id:'airfryer_basket_context',category:'air_fryer',text:
  'Raven A120 was used for a batch of potato wedges. The removable basket has a perforated insert and a temperature sensor near the back of its cavity. The sensor was not independently calibrated during this trial.\n\nIt ran hotter than expected after twelve minutes. The editor did not clarify whether the sentence described the basket sensor, the cooking compartment or the temperature setting. The model was unplugged before the final inspection.\n\nA further cooking trial used a different portion size.',
 mention:'It',truth:'unresolved_from_passage',phenomenon:'component'})
];
// Each publisher excerpt is well below 25 words and source-linked. No full copyrighted review retained.
const editorial=[
 make({id:'whathifi_cd_short',category:'cd_player',origin:'original_professional',reviewer:null,
 sourceUrl:'https://www.whathifi.com/hi-fi/cd-players/marantz-cd-70',
 text:'It can show CD text and track information, and you can also use it to navigate the player’s settings',
 mention:'It',truth:'unresolved_from_passage',phenomenon:'backward'}),
 make({id:'rtings_tv_panel_short',category:'television',origin:'original_professional',reviewer:null,
 sourceUrl:'https://www.rtings.com/tv/reviews/tcl/qm8k',
 text:'The WHVA panel in this TV is supposed to improve viewing angles, and despite our scoring, it does.',
 mention:'it',truth:'unresolved_from_passage',phenomenon:'component'}),
 make({id:'techradar_coffee_frother_short',category:'coffee_machine',origin:'original_professional',reviewer:null,
 sourceUrl:'https://www.techradar.com/home/coffee-machines/one-year-on-the-ninja-prestige-dualbrew-is-still-the-most-versatile-coffee-maker-ive-ever-tested-heres-why-its-the-best-pick-for-your-small-kitchen',
 text:"It doesn't heat your milk like a steam wand, so you need to follow the 'recipe' guide stuck to the side of the machine",
 mention:'It',truth:'unresolved_from_passage',phenomenon:'component'})
];
// Disjoint source hosts for original snippets; none declared as authorized or independently annotated.
const input=[...constructed,...editorial];
const manifest=referenceManifest150(input);
const result=evaluateDocumentReferences150(input,manifest);
const lineRows=result.rows.map(r=>({caseId:r.caseId,kind:r.origin,category:r.categoryId,phenomenon:r.phenomenon,
 sourceUrl:input.find(c=>c.id===r.caseId)?.input.document.source.url,
 sourceTextSha256:input.find(c=>c.id===r.caseId)?.input.document.sha256,
 prediction:r.predicted,phase149Status:r.proposalStatus,candidateCount:r.candidateCount,
 developerDescriptiveGold:r.split==='development'&&r.origin==='constructed'?r.gold:null,
 correctTentative:r.origin==='constructed'?r.correctTentativeLink:null,
 falseTentative:r.origin==='constructed'?r.falseTentativeLink:null,
 independentScoringAllowed:r.scorableIndependentlyAttested}));
const report={phase:150,build:'4.74-phase150',benchmarkId:'phase150_nonblind_constructed_plus_short_editorial',manifestSha256:manifest,
 rightsOriginalFullTextIncluded:false,originalLongReviewsAnalyzed:false,originalEditorialShortExcerpts:editorial.length,
 constructedLongDocuments:constructed.length,independentGoldAnnotations:0,
 precisionOnIndependentOriginalReviews:null,recallOnIndependentOriginalReviews:null,
 comparisonBaseline:'phase149_output_as_read_only_predicate; no new coreference model developed',
 developmentDescriptive:result.developmentDescriptive,independentlyAttestedHoldout:result.holdoutAttested,
 sourceRows:lineRows,warnings:result.warnings};
writeFileSync('PHASE150-LONG-DOCUMENT-REFERENCE-DIAGNOSTIC.json',JSON.stringify(report,null,2)+'\n');
writeFileSync('evaluation/phase150/CONSTRUCTED-LONG-DOCUMENT-CORPUS.json',JSON.stringify({
 source:'developer_created_not_independent',frozenBeforeCode:false,entries:constructed},null,2)+'\n');
writeFileSync('research/phase150_original_editorial_short_excerpt_registry.json',JSON.stringify({
 source:'public_review_text_checked_2026_10_11',permission:'not_established',redistribution:'short_attributed_quotes_only',
 independentAnnotation:false,entries:editorial.map(e=>({id:e.id,url:e.input.document.source.url,
 category:e.categoryId,briefSourceExcerpt:e.input.document.text,sha256:e.input.document.sha256}))},null,2)+'\n');
console.log(JSON.stringify({construct:constructed.length,editorial:editorial.length,
 development:result.developmentDescriptive,holdout:result.holdoutAttested,
 rows:lineRows.map(r=>({id:r.caseId,prediction:r.prediction,status:r.phase149Status,correct:r.correctTentative,false:r.falseTentative}))},null,2));
