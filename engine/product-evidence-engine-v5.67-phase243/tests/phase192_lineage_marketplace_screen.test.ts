import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzeSourceLineage192,resemblance192,normalizeDiscoveryUrl192,
 type ClaimLineage192,type DocumentContext192} from '../src/phase192_lineage_marketplace_screen.js';
import type {SourceRecord189,ResearchDossier189,SourcePage189,Question189} from '../src/phase189_source_pilot_reasoning.js';
import type {SourceContext191,RecordOrigin191,FieldRequest191} from '../src/phase191_sparse_source_integrity.js';
const baseline=JSON.parse(readFileSync('evaluation/phase189/annotated-live-source-pilot.json','utf8')) as ResearchDossier189;
const syntheticText=('The tester describes a specific air-flow measurement at a fixed operating condition using a named method. '+
 'A careful comparison separates an observed result from a promotional claim or a copied table. '+
 'The field and protocol determine how far the measured result can be applied to a decision. ').repeat(2);
type Sample={d:ResearchDossier189;contexts:SourceContext191[];origins:RecordOrigin191[];docs:DocumentContext192[];
 lineage:ClaimLineage192[];requests:FieldRequest191[]};
const n='Manual annotation and hypothesis only; no authenticated publisher custody was obtained.';
function sample():Sample{
 const d=structuredClone(baseline),contexts:SourceContext191[]=[],origins:RecordOrigin191[]=[],docs:DocumentContext192[]=[],lineage:ClaimLineage192[]=[];
 for(const page of d.sourcePages){
  contexts.push({sourceId:page.id,relationship:'independent_editorial',money:'undisclosed_or_unknown',
   method:'original_measurement_protocol_described',productSupply:'unknown',provenanceLevel:'unverified_annotation',
   evidenceLocator:n,independenceNote:n});
  docs.push({sourceId:page.id,productVariantIds:[...new Set(d.records.filter(x=>x.sourceId===page.id).map(x=>x.variantId))],
   pageType:'single_product_review',selectionBasis:'original_criterion_tests',analysisText:'',examined:true,
   firstPublished:null,canonicalHint:null,citesSourceIds:[],notes:n});
 }
 for(const r of d.records){
  const direct=r.kind==='instrument_measurement'&&!(r.derivedFrom?.length);
  origins.push({recordId:r.id,origin:direct?'publisher_performed_original_test':'republication_or_inference',
   methodTrace:direct?'manually_traced_to_original_method':'source_attribution_only',originLocator:n});
  lineage.push({recordId:r.id,producerId:direct?r.sourceId:null,testEventId:direct?r.originalGroup:null,
   originSourceId:direct?r.sourceId:null,relationship:direct?'direct_test_claim':'unresolved',
   strength:direct?'source_and_method_traced':'unresolved',locator:n});
 }
 const question:Question189={id:'measured_noise',category:'vacuum',variantId:'dyson_v15_detect',field:'operating_noise',
  protocol:'rtings_vacuum_v1.4',condition:'bare_floor',kind:'numeric_maximum',unit:'dba',threshold:72};
 const requests:FieldRequest191[]=[{candidate:{category:'vacuum',variantId:'dyson_v15_detect',name:'Dyson V15 Detect'},question,required:false}];
 return {d,contexts,origins,docs,lineage,requests};
}
const go=(s:Sample)=>analyzeSourceLineage192({dossier:s.d,contexts:s.contexts,origins:s.origins,
 requests:s.requests,documents:s.docs,lineage:s.lineage});
function add(s:Sample,sourceId:string,record?:Partial<SourceRecord189>){
 const p:SourcePage189={id:sourceId,publisher:'Fixture publication',url:`https://fixture.example/${sourceId}/`,
 model:'Fixture product model',method:'Synthetic document for tests',notes:'Never an original commercial review'};
 s.d.sourcePages=[...s.d.sourcePages,p];
 s.contexts.push({sourceId,relationship:'independent_editorial',money:'affiliate_disclosed',
 method:'method_not_established',productSupply:'unknown',provenanceLevel:'unverified_annotation',
 evidenceLocator:n,independenceNote:n});
 s.docs.push({sourceId,productVariantIds:['dyson_v15_detect'],pageType:'ranked_buying_list',
  selectionBasis:'marketplace_stars_only',analysisText:syntheticText,examined:true,
  firstPublished:'2023-01-01',canonicalHint:null,citesSourceIds:[],notes:n});
 if(record){const first=s.d.records.find(x=>x.id==='v15_noise')!;
  const r:SourceRecord189={...first,id:`${sourceId}_record`,sourceId,originalGroup:`${sourceId}_group`,
   context:'Hypothetical fixture text with an authored numerical claim, not real independent testing.',...record};
  s.d.records=[...s.d.records,r];
  s.origins.push({recordId:r.id,origin:'republication_or_inference',methodTrace:'not_traced',originLocator:n});
  s.lineage.push({recordId:r.id,producerId:null,testEventId:null,originSourceId:null,
   relationship:'unresolved',strength:'unresolved',locator:n});
 }
}
function row(s:Sample){return go(s).coverage[0]}
test('works on previous cross-category annotated records; never authorizes published rank',()=>{
 const s=sample(),r=go(s);assert.equal(r.publicRankingAllowed,false);
 assert.equal(r.automaticFraudAllegations,false);assert.equal(r.countIsNotScientificConfidence,true);
 assert.equal(r.baseline191.publicRankingAllowed,false);assert.equal(r.documentsDiscovered,4);
 assert.equal(r.coverage[0].discoveredDocuments,1);
});
test('source count distinct from independent original event count',()=>{const s=sample();add(s,'amazon_list');
 const r=go(s);assert.equal(r.documentsDiscovered,5);assert.equal(row(s).marketplaceStarsOnlyLists,1);
 assert.equal(row(s).claimedOriginalEventGroups,1);assert.equal(row(s).independentExperimentsVerified,null);
});
test('Amazon-star-only affiliate roundup does not become professional original test',()=>{
 const s=sample();add(s,'star_only');const r=go(s);
 assert.equal(r.sourceUse.find(x=>x.sourceId==='star_only')!.scope,'discovery_only');
 assert.ok(r.reviewNeeded.some(x=>x.includes('star_only marketplace-only ranking')));
 assert.equal(r.coverage[0].visibility,'retained_with_evidence');
});
test('Amazon-star-only list cannot promote a product with zero original sources',()=>{
 const s=sample();add(s,'star_only');s.docs.at(-1)!.productVariantIds=[...s.docs.at(-1)!.productVariantIds,'uncovered_product'];
 s.requests=[{candidate:{category:'vacuum',variantId:'uncovered_product',name:'Unreviewed fixture vacuum'},
  question:{id:'unknown',category:'vacuum',variantId:'uncovered_product',field:'operating_noise',
  protocol:'rtings_vacuum_v1.4',condition:'bare_floor',kind:'numeric_maximum',threshold:72,unit:'dba'},required:true}];
 const x=row(s);assert.equal(x.discoveredDocuments,1);assert.equal(x.claimedOriginalEventGroups,0);
 assert.equal(x.evidenceState,'not_yet_documented');assert.equal(x.visibility,'retained_research_needed');
});
test('affiliate disclosure alone does not discard original testing',()=>{const s=sample();s.contexts[0].money='affiliate_disclosed';
 assert.equal(go(s).sourceUse.find(x=>x.sourceId==='rtings_v15')!.scope,'original_evidence_candidate');
});
test('sponsorship removes source-level original-evidence candidate status',()=>{const s=sample();s.contexts[0].money='sponsored';
 assert.equal(go(s).sourceUse.find(x=>x.sourceId==='rtings_v15')!.scope,'contextual_research_only');
});
test('manufacturer specs are provisional, not automatically false',()=>{const s=sample();s.contexts[0].relationship='manufacturer_owned';
 assert.equal(go(s).sourceUse.find(x=>x.sourceId==='rtings_v15')!.scope,'provisional_specification_only');
});
test('unexplained mixed buying list cannot be automatically original evidence',()=>{
 const s=sample();s.docs[0].selectionBasis='mixed_disclosed_method';
 assert.equal(go(s).sourceUse[2].scope,'contextual_research_only');
});
test('canonical query tracking is a retrieval hint not proof of test authorship',()=>{
 const u='https://example.org/page?utm_source=x&tag=affiliate&version=2';
 assert.equal(normalizeDiscoveryUrl192(u),'https://example.org/page?version=2');
 const s=sample();s.docs[0].canonicalHint='https://fixture.example/more-recent-page/';
 assert.equal(go(s).canonicalOrEarliestDoesNotProveOriginality,true);
});
test('two URLs for same document are detected, without inflating independent tests',()=>{
 const s=sample();add(s,'same_url');s.d.sourcePages.at(-1)!.url='https://www.rtings.com/vacuum/reviews/dyson/v15-detect?utm_campaign=x';
 assert.ok(go(s).documentLinks.some(e=>e.reason==='same_url'));
 assert.equal(row(s).uniqueUrls,1);
});
test('normalised identical lengthy text detects an exact duplicated article',()=>{
 const s=sample();add(s,'copy_a');add(s,'copy_b');
 assert.ok(go(s).documentLinks.some(x=>x.reason==='exact_normalized_text'&&x.evidence==='confirmed_document_match'));
});
test('paraphrased/near duplicate text only generates review candidate',()=>{
 const s=sample();add(s,'copy_a');add(s,'copy_b');
 s.docs.at(-1)!.analysisText=syntheticText.replace('careful comparison','cautious comparison');
 assert.ok(go(s).documentLinks.some(x=>x.reason==='near_duplicate_text'&&x.evidence==='candidate_needs_review'));
});
test('semantically unrelated or short text never automatically merges',()=>{
 assert.equal(resemblance192('Works great!','Works great!'),0);
 const s=sample();add(s,'copy_a');add(s,'copy_b');
 s.docs.at(-1)!.analysisText='Unrelated distinct content about coffee brewing '.repeat(30);
 assert.ok(!go(s).documentLinks.some(x=>x.reason==='exact_normalized_text'||x.reason==='near_duplicate_text'));
});
test('explicit citation creates lineage clue, not proof that article copied test',()=>{
 const s=sample();add(s,'citation');s.docs.at(-1)!.citesSourceIds=['rtings_v15'];
 const e=go(s).documentLinks.find(x=>x.reason==='explicit_citation');
 assert.equal(e!.evidence,'candidate_needs_review');
});
test('matching two exact numbers on different publisher pages is only a copy candidate',()=>{
 const s=sample();add(s,'same_number',{value:s.d.records.find(x=>x.id==='v15_noise')!.value});
 const r=go(s);assert.ok(r.potentialCopiedMeasurements.some(x=>x.recordIds.includes('same_number_record')));
 assert.ok(r.reviewNeeded.some(x=>x.includes('possible shared measurement')));
});
test('different number is not silently treated as copied',()=>{
 const s=sample();add(s,'different_number',{value:14});
 assert.equal(go(s).potentialCopiedMeasurements.length,0);
});
test('known quoted original observation resolves lineage to one source event',()=>{
 const s=sample();add(s,'republished',{derivedFrom:['v15_noise'],originalGroup:'v15_noise_root'});
 const r=s.d.records.at(-1)!;r.originalGroup=s.d.records.find(x=>x.id==='v15_noise')!.originalGroup;
 s.lineage.at(-1)!.originSourceId='rtings_v15';s.lineage.at(-1)!.relationship='quoted_or_republished_result';
 s.lineage.at(-1)!.producerId='rtings_v15';s.lineage.at(-1)!.testEventId=r.originalGroup;
 s.lineage.at(-1)!.strength='source_and_method_traced';
 const x=go(s);assert.equal(row(s).claimedOriginalEventGroups,1);
 assert.equal(row(s).derivativeOrQuotedRecordCount,1);
 assert.ok(x.tracedEventGroups.some(y=>y.relatedRecordIds.includes(r.id)));
});
test('two independent studies may produce the same value without being deduplicated as one event',()=>{
 const s=sample();add(s,'second_lab',{value:s.d.records.find(x=>x.id==='v15_noise')!.value});
 s.docs.at(-1)!.selectionBasis='original_criterion_tests';
 s.contexts.at(-1)!.method='original_measurement_protocol_described';
 s.origins.at(-1)!.origin='publisher_performed_original_test';
 s.origins.at(-1)!.methodTrace='manually_traced_to_original_method';
 s.lineage.at(-1)!.producerId='second_lab';s.lineage.at(-1)!.testEventId='second_lab_event';
 s.lineage.at(-1)!.originSourceId='second_lab';s.lineage.at(-1)!.relationship='direct_test_claim';
 s.lineage.at(-1)!.strength='source_and_method_traced';
 const r=go(s);assert.equal(row(s).claimedOriginalEventGroups,2);
 assert.equal(row(s).independentExperimentsVerified,null);
 assert.ok(r.potentialCopiedMeasurements.length>0);
});
test('a different numerical protocol cannot be considered copied measurement',()=>{
 const s=sample();add(s,'other_protocol',{protocol:'different_method'});
 assert.equal(go(s).potentialCopiedMeasurements.length,0);
});
test('a different product model cannot be considered copied numerical observation',()=>{
 const s=sample();add(s,'other_model',{variantId:'shark_stratos_cordless',originalGroup:'other_product_group'});
 s.docs.at(-1)!.productVariantIds=['shark_stratos_cordless'];
 assert.equal(go(s).potentialCopiedMeasurements.length,0);
});
test('an article with independent additional measurement retains a distinct test event',()=>{
 const s=sample();add(s,'new_measure',{field:'different_feature',originalGroup:'new_event',value:37,unit:'dba'});
 s.docs.at(-1)!.selectionBasis='original_criterion_tests';
 s.contexts.at(-1)!.method='original_measurement_protocol_described';
 s.origins.at(-1)!.origin='publisher_performed_original_test';
 s.origins.at(-1)!.methodTrace='manually_traced_to_original_method';
 s.lineage.at(-1)!.producerId='new_test_lab';s.lineage.at(-1)!.testEventId='new_event';
 s.lineage.at(-1)!.originSourceId='new_measure';s.lineage.at(-1)!.relationship='direct_test_claim';
 s.lineage.at(-1)!.strength='source_and_method_traced';
 const r=go(s);assert.ok(r.tracedEventGroups.some(x=>x.eventKey==='new_test_lab:new_event'));
});
test('unknown original owner remains unresolved and prompts verification',()=>{
 const s=sample();add(s,'unknown_origin',{value:80});
 assert.ok(row(s).unresolvedOriginRecords>0);
 assert.ok(go(s).reviewNeeded.some(x=>x.includes('Trace dyson_v15_detect')));
});
test('number of sources is not a source-quality score, and ranking stays blocked',()=>{
 const s=sample();for(let i=0;i<5;i++)add(s,'spam_'+i);
 const r=go(s);assert.equal(r.documentsDiscovered,9);
 assert.equal(row(s).claimedOriginalEventGroups,1);assert.equal(r.publicRankingAllowed,false);
});
test('unexamined docs count as discovered but not examined',()=>{
 const s=sample();add(s,'unknown');s.docs.at(-1)!.examined=false;
 assert.equal(row(s).discoveredDocuments,2);assert.equal(row(s).examinedDocuments,1);
});
test('source ordering permutations never affect output',()=>{
 const s=sample();add(s,'candidate');const a=go(s);
 s.d.sourcePages=[...s.d.sourcePages].reverse();s.docs.reverse();s.lineage.reverse();s.contexts.reverse();s.origins.reverse();s.d.records=[...s.d.records].reverse();
 assert.deepEqual(go(s),a);
});
test('reject duplicate document source IDs',()=>{const s=sample();s.docs[1].sourceId=s.docs[0].sourceId;assert.throws(()=>go(s));});
test('reject missing lineages',()=>{const s=sample();s.lineage.pop();assert.throws(()=>go(s));});
test('reject unrecognised page kind and unsupported selection method',()=>{
 const s=sample();(s.docs[0] as any).pageType='guaranteed_best';assert.throws(()=>go(s));
 const s2=sample();(s2.docs[0] as any).selectionBasis='most_profitable';assert.throws(()=>go(s2));
});
test('reject lineages claiming trace without a producer and test event',()=>{
 const s=sample();s.lineage[0].producerId=null;assert.throws(()=>go(s));
});
test('reject test claimed as conducted by this page when page differs from origin',()=>{
 const s=sample();s.lineage[0].originSourceId='rtings_stratos';assert.throws(()=>go(s));
});
test('reject invented origin source for a copied assertion',()=>{
 const s=sample();s.lineage[0].relationship='quoted_or_republished_result';
 s.lineage[0].originSourceId='ghost';assert.throws(()=>go(s));
});
test('reject self citation, unknown source citation and canonical non-https',()=>{
 for(const change of [(s:Sample)=>s.docs[0].citesSourceIds=['rtings_v15'],
 (s:Sample)=>s.docs[0].citesSourceIds=['ghost'],
 (s:Sample)=>s.docs[0].canonicalHint='http://example.com/']){
  const s=sample();change(s);assert.throws(()=>go(s));}
});
test('reject same physical event with contradictory original sources',()=>{
 const s=sample();add(s,'event_copy');const line=s.lineage.at(-1)!;
 line.strength='source_and_method_traced';line.relationship='direct_test_claim';
 line.producerId=s.lineage.find(x=>x.recordId==='v15_noise')!.producerId;
 line.testEventId=s.lineage.find(x=>x.recordId==='v15_noise')!.testEventId;
 line.originSourceId='event_copy';assert.throws(()=>go(s));
});
test('reject invented candidate or document product mapping',()=>{
 const s=sample();s.docs[0].productVariantIds=['unrelated_product'];
 assert.throws(()=>go(s));
});

test('Amazon-stars-only article inventing a lab-shaped event does not count as eligible original event',()=>{
 const s=sample();add(s,'stars_faux_test',{value:80});const rec=s.d.records.at(-1)!;
 s.origins.at(-1)!.origin='publisher_performed_original_test';
 s.origins.at(-1)!.methodTrace='manually_traced_to_original_method';
 s.lineage.at(-1)!.producerId='invented_lab';s.lineage.at(-1)!.testEventId='invented_event';
 s.lineage.at(-1)!.originSourceId='stars_faux_test';s.lineage.at(-1)!.relationship='direct_test_claim';
 s.lineage.at(-1)!.strength='source_and_method_traced';
 assert.equal(row(s).claimedOriginalEventGroups,1);
 assert.ok(!go(s).tracedEventGroups.some(x=>x.eventKey==='invented_lab:invented_event'));
});
test('publisher lab origin wrongly labelled manufacturer-provided does not count as independently reported event',()=>{
 const s=sample();s.origins.find(x=>x.recordId==='v15_noise')!.origin='manufacturer_provided_claim';
 assert.equal(row(s).claimedOriginalEventGroups,0);
});
