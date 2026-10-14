import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inspectSparseEvidence191,validateSourceContext191,
 type SourceContext191,type RecordOrigin191,type FieldRequest191} from '../src/phase191_sparse_source_integrity.js';
import type {ResearchDossier189,SourceRecord189,SourcePage189,Question189} from '../src/phase189_source_pilot_reasoning.js';
const actual=JSON.parse(readFileSync('evaluation/phase189/annotated-live-source-pilot.json','utf8')) as ResearchDossier189;
const dossier=()=>structuredClone(actual);
const contexts=():SourceContext191[]=>[
 {sourceId:'rtings_v15',relationship:'independent_editorial',money:'undisclosed_or_unknown',method:'original_measurement_protocol_described',productSupply:'unknown',provenanceLevel:'unverified_annotation',evidenceLocator:'RTINGS review and public methodology',independenceNote:'Manual classification, not independently verified publisher custody.'},
 {sourceId:'rtings_stratos',relationship:'independent_editorial',money:'undisclosed_or_unknown',method:'original_measurement_protocol_described',productSupply:'unknown',provenanceLevel:'unverified_annotation',evidenceLocator:'RTINGS review and public methodology',independenceNote:'Manual classification, not independently verified publisher custody.'},
 {sourceId:'notebookcheck_thinkbook',relationship:'independent_editorial',money:'undisclosed_or_unknown',method:'original_measurement_protocol_described',productSupply:'loaned',provenanceLevel:'unverified_annotation',evidenceLocator:'Notebookcheck review and battery method',independenceNote:'Loan was reported by publisher; not verified as an independent experiment.'},
 {sourceId:'soundguys_bose700',relationship:'independent_editorial',money:'undisclosed_or_unknown',method:'original_measurement_protocol_described',productSupply:'unknown',provenanceLevel:'unverified_annotation',evidenceLocator:'SoundGuys review and audio method',independenceNote:'Manual classification, source independence has not been independently certified.'}
];
const q=(variantId='dyson_v15_detect',field='operating_noise',kind:'numeric_maximum'|'experiential_context'='numeric_maximum'):Question189=>({
 id:'specific_need',category:'vacuum',variantId,field,condition:field==='operating_noise'?'bare_floor':'bin_emptying',
 protocol:'rtings_vacuum_v1.4',kind,...(kind==='numeric_maximum'?{threshold:72,unit:'dba'}:{})});
const item=(question=q(),name='Vacuum review unit'):FieldRequest191=>({candidate:{category:question.category,variantId:question.variantId,name},question,required:false});
const origins=(d:ResearchDossier189):RecordOrigin191[]=>d.records.map(r=>({
 recordId:r.id,origin:r.kind==='instrument_measurement'?'publisher_performed_original_test':
  r.kind==='manufacturer_statement'?'manufacturer_provided_claim':
  r.kind==='owner_anecdote'?'consumer_experience':
  r.kind==='editorial_interpretation'?'republication_or_inference':'publisher_performed_original_test',
 methodTrace:r.kind==='instrument_measurement'||r.kind==='structured_expert_assessment'||
  r.kind==='contextual_expert_observation'?'manually_traced_to_original_method':'source_attribution_only',
 originLocator:'Manual annotation of source location, not custody of publisher bytes.'
}));
const go=(d=dossier(),cs=contexts(),requests:FieldRequest191[]=[item()],os=origins(d))=>
 inspectSparseEvidence191({dossier:d,contexts:cs,origins:os,requests});
function addSource(d:ResearchDossier189,cs:SourceContext191[],role:SourceContext191['relationship'],money:SourceContext191['money'],method:SourceContext191['method'],kind:SourceRecord189['kind'],opts:Partial<SourceRecord189>={}){
 const id='synthetic_source';d.sourcePages=[...d.sourcePages,{id,publisher:'Fixture only',url:'https://manufacturer.example/product/test',model:'Fixture model',method:'Fixture method of publication',notes:'Synthetic source, never a real product assertion'}];
 cs.push({sourceId:id,relationship:role,money,method,productSupply:'unknown',provenanceLevel:'unverified_annotation',evidenceLocator:'Synthetic fixture field paragraph',independenceNote:'An invented metadata record, for adversarial testing only.'});
 const observation:SourceRecord189={id:'synthetic_record',sourceId:id,category:'dehumidifier',variantId:'model_fixture_x',field:'moisture_removal',kind,originalGroup:'synthetic_root',protocol:'test_method_x',condition:'standard_test',position:'Synthetic capacity specification',context:'Only a made-up source to validate how scarce evidence remains visible.',...(kind==='instrument_measurement'||kind==='manufacturer_statement'?{value:20,unit:'litres_per_day'}:{}),...opts};
 d.records=[...d.records,observation];
 return observation;
}
const sparseQ:Question189={id:'sparse_requirement',category:'dehumidifier',variantId:'model_fixture_x',field:'moisture_removal',condition:'standard_test',protocol:'test_method_x',kind:'numeric_minimum',threshold:18,unit:'litres_per_day'};
const sparseItem=()=>item(sparseQ,'Fixture-only dehumidifier');

test('original cross-category professional pages present but no public ranking authorized',()=>{
 const r=go();assert.equal(r.findings.length,1);assert.equal(r.findings[0].knowledgeState,'reported_original_test_unadmitted');
 assert.equal(r.findings[0].thresholdFinding,'observed_threshold_met');assert.equal(r.publicRankingAllowed,false);
 assert.equal(r.findings[0].rootCount,1);assert.equal(r.findings[0].sourceCoverage,'single_original_root');
 assert.equal(r.findings[0].absenceMeansPoorPerformance,false);
});
test('sparse single source retained, not automatically defective or omitted',()=>{
 const r=go();assert.equal(r.findings[0].visibility,'retained_with_evidence');
 assert.ok(r.findings[0].limitations.some(s=>s.includes('one scoped original')));
});
test('new category with zero sources remains a visible exact product candidate',()=>{
 const r=go(dossier(),contexts(),[sparseItem()]);
 assert.equal(r.findings[0].knowledgeState,'not_yet_documented');assert.equal(r.knownCandidates,1);
 assert.deepEqual(r.uncoveredCandidateIds,['model_fixture_x']);assert.equal(r.findings[0].rankingPermitted,false);
});
test('unknown exact variant in a known category also stays visible',()=>{
 const r=go(dossier(),contexts(),[item(q('new_vacuum_2026'))]);
 assert.deepEqual(r.uncoveredCandidateIds,['new_vacuum_2026']);assert.equal(r.findings[0].visibility,'retained_research_needed');
});
test('manufacturer capacity is retained provisionally, not a measured independent lab test',()=>{
 const d=dossier(),cs=contexts();addSource(d,cs,'manufacturer_owned','undisclosed_or_unknown','method_not_established','manufacturer_statement');
 const r=go(d,cs,[sparseItem()]).findings[0];assert.equal(r.knowledgeState,'manufacturer_specification_provisional');
 assert.equal(r.thresholdFinding,'not_applicable');assert.equal(r.visibility,'retained_provisional');
 assert.ok(r.researchActions.some(x=>x.includes('independent measurement')));
});
test('retailer listing also retains provisional specification without conferring certification',()=>{
 const d=dossier(),cs=contexts();addSource(d,cs,'retailer_owned','affiliate_disclosed','method_not_established','manufacturer_statement');
 const r=go(d,cs,[sparseItem()]).findings[0];assert.equal(r.knowledgeState,'manufacturer_specification_provisional');
 assert.ok(r.commercialSignals.some(x=>x.includes('affiliate_disclosed')));
});
test('manufacturer-labelled lab-like number cannot pass as independent experiment',()=>{
 const d=dossier(),cs=contexts();addSource(d,cs,'manufacturer_owned','advertising_disclosed','original_measurement_protocol_described','instrument_measurement');
 const r=go(d,cs,[sparseItem()]).findings[0];assert.equal(r.knowledgeState,'manufacturer_specification_provisional');
 assert.equal(r.thresholdFinding,'not_applicable');
});
test('sponsored editorial numerical content remains disclosed promotional material',()=>{
 const d=dossier(),cs=contexts();addSource(d,cs,'independent_editorial','sponsored','original_measurement_protocol_described','instrument_measurement');
 const r=go(d,cs,[sparseItem()]).findings[0];assert.equal(r.knowledgeState,'commercial_promotion_only');
 assert.equal(r.thresholdFinding,'not_applicable');assert.ok(r.commercialSignals.some(x=>x.includes('sponsored')));
});
test('an unascertained method cannot silently become an independent field measurement',()=>{
 const cs=contexts();cs[0].method='method_not_established';const r=go(dossier(),cs).findings[0];
 assert.equal(r.knowledgeState,'unverified_report');assert.equal(r.thresholdFinding,'not_applicable');
 assert.ok(r.researchActions.some(x=>x.includes('method')));
});
test('affiliation disclosed does not automatically declare a lab result false',()=>{
 const cs=contexts();cs[0].money='affiliate_disclosed';
 const r=go(dossier(),cs).findings[0];
 assert.equal(r.knowledgeState,'reported_original_test_unadmitted');
 assert.ok(r.commercialSignals.some(s=>s.includes('affiliate_disclosed')));
});
test('laptop loan remains a disclosed caveat while field is visible',()=>{
 const question:Question189={id:'laptop_need',category:'laptop',variantId:'thinkbook_16_g7_qoy_21nh0005ge',field:'wifi_battery_runtime',
 protocol:'notebookcheck_wifi_v1.3',condition:'edge131_150nits',kind:'numeric_minimum',threshold:24,unit:'hours'};
 const r=go(dossier(),contexts(),[item(question,'ThinkBook test configuration')]).findings[0];
 assert.equal(r.knowledgeState,'reported_original_test_unadmitted');assert.ok(r.commercialSignals.some(x=>x.includes('loaned')));
});
test('single professional practical observation is useful but not a numeric proof',()=>{
 const qq={...q('dyson_v15_detect','emptying_dust_exposure','experiential_context')};
 const r=go(dossier(),contexts(),[item(qq)]).findings[0];assert.equal(r.knowledgeState,'professional_usage_observation_only');
 assert.equal(r.thresholdFinding,'not_applicable');assert.equal(r.visibility,'retained_provisional');
});
test('independent publisher repeating manufacturer measurement cannot launder it into lab evidence',()=>{
 const d=dossier();const os=origins(d);
 os.find(o=>o.recordId==='v15_noise')!.origin='manufacturer_provided_claim';
 const result=go(d,contexts(),[item()],os).findings[0];
 assert.equal(result.knowledgeState,'manufacturer_specification_provisional');
 assert.equal(result.thresholdFinding,'not_applicable');
 assert.ok(result.commercialSignals.some(s=>s.includes('supplied or commissioned')));
});
test('lab numbers from an original method but untraced field claim are not authenticated',()=>{
 const d=dossier(),os=origins(d);os.find(o=>o.recordId==='v15_noise')!.methodTrace='not_traced';
 const result=go(d,contexts(),[item()],os).findings[0];
 assert.equal(result.knowledgeState,'unverified_report');
 assert.equal(result.rankingPermitted,false);
});
test('reject duplicated, missing or fabricated record-origin links',()=>{
 const d=dossier(),os=origins(d);
 assert.throws(()=>go(d,contexts(),[item(),sparseItem()],os.slice(1)));
 assert.throws(()=>go(d,contexts(),[item()], [...os.slice(1),os[1]]));
 const bad=origins(d);(bad[0] as any).origin='magic_reliability';assert.throws(()=>go(d,contexts(),[item()],bad));
});
test('unknown claim origin triggers specific trace research instead of exclusion',()=>{
 const d=dossier(),os=origins(d);os.find(o=>o.recordId==='v15_noise')!.origin='unresolved';
 const result=go(d,contexts(),[item()],os).findings[0];
 assert.equal(result.visibility,'retained_provisional');
 assert.ok(result.researchActions.some(s=>s.includes('originating tester')));
});
test('unknown financial relationship triggers verification, not automatic fraud declaration',()=>{
 const r=go().findings[0];assert.ok(r.researchActions.some(s=>s.includes('material connections')));
 assert.equal(r.sourceNatureNotProofOfTruth,true);
});
test('uncertain source relationship is neither automatically independent nor automatically marketing',()=>{
 const cs=contexts();cs[0].relationship='unknown';const r=go(dossier(),cs).findings[0];
 assert.equal(r.knowledgeState,'unverified_report');assert.equal(r.rankingPermitted,false);
});
test('mandatory poorly sourced characteristic calls for targeted review, not auto failure',()=>{
 const r=go(dossier(),contexts(),[{...item(q('never_searched')),required:true}]).findings[0];
 assert.ok(r.researchActions.some(s=>s.includes('Mandatory')));assert.equal(r.absenceMeansPoorPerformance,false);
});
test('source root reuse does not inflate distinct evidence roots',()=>{
 const d=dossier();const orig=d.records.find(r=>r.id==='v15_noise')!;
 d.records=[...d.records,{...orig,id:'v15_noise_representation',context:'Re-published same number in the same experiment and source family.'}];
 const r=go(d).findings[0];assert.equal(r.rootCount,1);
});
test('two conflicting original measurements require reconciliation and block numeric threshold use',()=>{
 const d=dossier(),cs=contexts();const orig=d.records.find(r=>r.id==='v15_noise')!;
 d.records=[...d.records,{...orig,id:'v15_noise_second_lab',originalGroup:'second_lab_root',value:80,sourceId:'rtings_stratos'}];
 const r=go(d,cs).findings[0];assert.equal(r.knowledgeState,'conflicting_measurements');
 assert.equal(r.thresholdFinding,'not_applicable');assert.ok(r.researchActions.some(s=>s.includes('Resolve')));
});
test('method mismatch never proves product failure',()=>{
 const question={...q(),protocol:'unrelated_protocol'};
 const r=go(dossier(),contexts(),[item(question)]).findings[0];
 assert.equal(r.knowledgeState,'not_yet_documented');assert.equal(r.visibility,'retained_research_needed');
});
test('condition mismatch likewise does not provide numeric proof',()=>{
 const r=go(dossier(),contexts(),[item({...q(),condition:'bin_emptying'})]).findings[0];
 assert.equal(r.thresholdFinding,'not_applicable');
});
test('reject duplicate source context entries instead of accepting attacker chosen duplicate',()=>{
 assert.throws(()=>validateSourceContext191(dossier(),[contexts()[0],contexts()[0],contexts()[2],contexts()[3]]));
});
test('reject missing or unknown publisher context',()=>{
 assert.throws(()=>validateSourceContext191(dossier(),contexts().slice(1)));
 const cs=contexts();cs[0].sourceId='unknown_source';assert.throws(()=>validateSourceContext191(dossier(),cs));
});
test('reject unsourced marketing classification and invented affiliation categories',()=>{
 const cs=contexts();(cs[0] as any).money='scientifically_proven';assert.throws(()=>validateSourceContext191(dossier(),cs));
});
test('reject duplicate candidate field requests',()=>{
 assert.throws(()=>go(dossier(),contexts(),[item(),item()]));
});
test('deterministic output under source-context permutations',()=>{
 assert.deepEqual(go(dossier(),contexts(),[item(),sparseItem()]),go(dossier(),contexts().reverse(),[sparseItem(),item()]));
});
test('original cross-category corpus cannot authorize a public product rank',()=>{
 const r=go(dossier(),contexts(),[item(),sparseItem()]);
 assert.equal(r.publicRankingAllowed,false);assert.equal(r.sourceReviewIsNotProofOfScientificValidity,true);
 assert.ok(r.findings.every(f=>f.rankingPermitted===false));
});

test('conflicting marketing number cannot veto legitimate original lab result, but is flagged',()=>{
 const d=dossier(),cs=contexts();addSource(d,cs,'manufacturer_owned','advertising_disclosed',
 'original_measurement_protocol_described','instrument_measurement',{
 id:'marketing_number',category:'vacuum',variantId:'dyson_v15_detect',field:'operating_noise',
 protocol:'rtings_vacuum_v1.4',condition:'bare_floor',value:90,unit:'dba',originalGroup:'brand_promo'});
 const r=go(d,cs,[item()]).findings[0];
 assert.equal(r.knowledgeState,'reported_original_test_unadmitted');
 assert.equal(r.thresholdFinding,'observed_threshold_met');
 assert.ok(r.researchActions.some(x=>x.includes('promotional numbers')));
});
