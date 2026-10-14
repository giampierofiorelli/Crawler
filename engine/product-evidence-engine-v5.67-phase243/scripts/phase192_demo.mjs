import {readFileSync,writeFileSync} from 'node:fs';
import {analyzeSourceLineage192} from '../dist/src/phase192_lineage_marketplace_screen.js';
const dossier=JSON.parse(readFileSync('evaluation/phase189/annotated-live-source-pilot.json','utf8'));
// Real records are prior hand annotations, NOT authenticated source content;
// the shopping-list example is an explicitly synthetic adversarial fixture.
dossier.sourcePages.push({id:'fixture_stars_list',publisher:'Synthetic Affiliate List (FICTION)',
 url:'https://fictional.example/amazon-list/',model:'Illustrative fictional vacuum',
 method:'No original test: the invented list follows marketplace star ratings.',
 notes:'Synthetic scenario only: NOT an actual Amazon or publisher page.'});
const contexts=dossier.sourcePages.map(s=>({sourceId:s.id,
 relationship:s.id==='fixture_stars_list'?'retailer_owned':'independent_editorial',
 money:s.id==='fixture_stars_list'?'affiliate_disclosed':'undisclosed_or_unknown',
 method:s.id==='fixture_stars_list'?'method_not_established':'original_measurement_protocol_described',
 productSupply:'unknown',provenanceLevel:'unverified_annotation',
 evidenceLocator:'Analyst annotations only. No custody of source bytes.',
 independenceNote:'Not an externally verified independent lab assessment.'}));
const origins=dossier.records.map(r=>({recordId:r.id,
 origin:r.kind==='instrument_measurement'?'publisher_performed_original_test':'republication_or_inference',
 methodTrace:r.kind==='instrument_measurement'?'manually_traced_to_original_method':'source_attribution_only',
 originLocator:'Analyst note, not a document authenticity certificate.'}));
const documents=dossier.sourcePages.map(s=>({sourceId:s.id,
 productVariantIds:s.id==='fixture_stars_list'?['fictional_vacuum']:
   [...new Set(dossier.records.filter(r=>r.sourceId===s.id).map(r=>r.variantId))],
 pageType:s.id==='fixture_stars_list'?'ranked_buying_list':'single_product_review',
 selectionBasis:s.id==='fixture_stars_list'?'marketplace_stars_only':'original_criterion_tests',
 analysisText:'',examined:true,firstPublished:null,canonicalHint:null,citesSourceIds:[],
 notes:'Research annotation, not a pasted copyrighted full article.'}));
const lineage=dossier.records.map(r=>({recordId:r.id,
 producerId:r.kind==='instrument_measurement'?r.sourceId:null,
 testEventId:r.kind==='instrument_measurement'?r.originalGroup:null,
 originSourceId:r.kind==='instrument_measurement'?r.sourceId:null,
 relationship:r.kind==='instrument_measurement'?'direct_test_claim':'unresolved',
 strength:r.kind==='instrument_measurement'?'source_and_method_traced':'unresolved',
 locator:'Reported original source link from Phase189; no independent custody.'}));
const requests=[
 {candidate:{category:'vacuum',variantId:'dyson_v15_detect',name:'Dyson V15 Detect'},question:{id:'vacuum_noise',
 category:'vacuum',variantId:'dyson_v15_detect',field:'operating_noise',protocol:'rtings_vacuum_v1.4',
 condition:'bare_floor',kind:'numeric_maximum',threshold:72,unit:'dba'},required:false},
 {candidate:{category:'laptop',variantId:'thinkbook_16_g7_qoy_21nh0005ge',name:'ThinkBook 16 G7 QOY test SKU'},question:{id:'web_battery',
 category:'laptop',variantId:'thinkbook_16_g7_qoy_21nh0005ge',field:'wifi_battery_runtime',
 protocol:'notebookcheck_wifi_v1.3',condition:'edge131_150nits',kind:'numeric_minimum',threshold:24,unit:'hours'},required:false},
 {candidate:{category:'headphones',variantId:'bose_headphones_700',name:'Bose Headphones 700'},question:{id:'anc_point',
 category:'headphones',variantId:'bose_headphones_700',field:'anc_attenuation_410hz',protocol:'soundguys_anc_curve',
 condition:'anc_on_410hz',kind:'numeric_minimum',threshold:12,unit:'db'},required:false},
 {candidate:{category:'vacuum',variantId:'fictional_vacuum',name:'Fictional untested vacuum'},question:{id:'unknown_noise',
 category:'vacuum',variantId:'fictional_vacuum',field:'operating_noise',protocol:'rtings_vacuum_v1.4',
 condition:'bare_floor',kind:'numeric_maximum',threshold:72,unit:'dba'},required:true}
];
const result=analyzeSourceLineage192({dossier,contexts,origins,requests,documents,lineage});
writeFileSync('evaluation/phase192/multi-category-lineage-demo.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({sources:result.documentsDiscovered,fields:result.coverage.map(c=>({
 variant:c.variantId,discovered:c.discoveredDocuments,fieldRelevant:c.fieldRelevantDocuments,
 events:c.claimedOriginalEventGroups,state:c.evidenceState})),
 excludedFixtureFromTesting:result.sourceUse.find(s=>s.sourceId==='fixture_stars_list'),
 publicRankingAllowed:result.publicRankingAllowed},null,2));
