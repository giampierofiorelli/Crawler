#!/usr/bin/env node
/** Phase258 bounded pilot (dry run, no network, no store access). 4 retained product records (ids only) and 13
 * SYNTHETIC source-metadata fixtures (".example" hosts) across 6 markets and 5 languages plus "und". Expected labels are
 * fixed below, before the run. Measures role classification, provenance, duplication, geographic neutrality,
 * language-metadata integrity and preservation of unverified identity and access, and compares with the Phase196 route.
 * Usage: node scripts/phase258-source-pilot.mjs [--out FILE]
 */
import {writeFileSync} from 'node:fs';import {resolve} from 'node:path';
import {validateSourceDescriptor258,materialRoleFor196,languageTag258} from '../dist/src/phase258_source_contributions.js';
import {emptySourceLedger258,recordSourceState258,selectSourcesForJob258} from '../dist/src/phase258_source_memory.js';
import {analyzeEphemeralBatch195} from '../dist/src/phase195_ephemeral_batch_lineage.js';
import {emptyLedger193} from '../dist/src/phase193_screening_memory.js';
import {loadPublisherSeed196,planSourceReviews196} from '../dist/src/phase196_source_intelligence.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
// Retained product records (identity unverified in the store).
const P={airfryer:'prd_41185d853e4a0eed26933056',espresso:'prd_da4477a15c09160dea80cef6',kettle:'prd_5061f6355633f0e3eb34069b',rice:'prd_64fe1802534086b5110fcd7e'};
const CAT={[P.airfryer]:'air_fryers',[P.espresso]:'coffee_machines',[P.kettle]:'kettles',[P.rice]:'rice_cookers'};
const D=(id,o)=>({schema:'pee258.source-descriptor.v1',origin:'synthetic_fixture',descriptorId:'d_'+id,sourceId:'s_'+id,url:`https://${id.replace(/_/g,'-')}.example/item`,
 roles:['manufacturer_specification'],statementKinds:['declared_specification'],publisherCountry:'GB',language:'en-GB',productMarket:'uk',
 product:{productId:P.airfryer,identityStatus:'unverified'},testingConditions:{declared:false,conditionIds:[]},method:{described:false,referenceId:null},
 specialist:null,culturalTradition:null,sponsorship:'none_declared',originality:'original',derivedFrom:[],access:{rights:'unreviewed',robots:'unknown'},
 statement:null,limitations:['synthetic_fixture_metadata_only'],...o});
// expected: Phase196 material role and the Phase258 lane for the job kind given in `job`.
const fixtures=[
 [D('maker_uk',{}),'manufacturer_specification'],
 [D('retailer_us',{roles:['retailer_listing'],publisherCountry:'US',language:'en-US',productMarket:'us'}),'manufacturer_specification'],
 [D('lab_de',{roles:['independent_measurement'],statementKinds:['instrumental_measurement'],publisherCountry:'DE',language:'de-DE',productMarket:'de',product:{productId:P.espresso,identityStatus:'unverified'},method:{described:true,referenceId:'lab_method_v2'},testingConditions:{declared:true,conditionIds:['water_temp_measured']}}),'original_instrumental_claim'],
 [D('review_fr',{roles:['structured_professional_testing'],statementKinds:['observed_practical_result','reported_experience'],publisherCountry:'FR',language:'fr-FR',productMarket:'fr',product:{productId:P.espresso,identityStatus:'unverified'},method:{described:true,referenceId:'review_protocol'},sponsorship:'gifted_product'}),'structured_practical_claim'],
 [D('barista_it',{roles:['qualified_cultural_expertise'],statementKinds:['expert_interpretation'],publisherCountry:'IT',language:'it-IT',productMarket:'it',product:{productId:P.espresso,identityStatus:'unverified'},specialist:{domainId:'espresso_preparation',basis:'documented_professional_practice',basisReferenceId:'barista_profile'},culturalTradition:{traditionId:'italian_espresso',specialistValidationRequired:true,expertiseBasisRequired:true}}),'unclassified'],
 [D('rice_jp',{roles:['qualified_cultural_expertise'],statementKinds:['expert_interpretation','reported_experience'],publisherCountry:'JP',language:'ja',productMarket:'jp',product:{productId:P.rice,identityStatus:'unverified'},specialist:{domainId:'rice_preparation',basis:'sensory_training',basisReferenceId:'sensory_course'},culturalTradition:{traditionId:'japanese_rice_preparation',specialistValidationRequired:true,expertiseBasisRequired:true}}),'unclassified'],
 [D('video_us',{roles:['original_video_demonstration'],statementKinds:['observed_practical_result'],publisherCountry:'US',language:'en-US',productMarket:'us',method:{described:true,referenceId:'video_setup'}}),'structured_practical_claim'],
 [D('safety_gb',{roles:['product_safety_information'],statementKinds:['safety_notice'],product:{productId:P.kettle,identityStatus:'unverified'}}),'unclassified'],
 [D('news_de',{roles:['journalism'],statementKinds:['reported_experience'],publisherCountry:'DE',language:'de',productMarket:'de',product:{productId:P.espresso,identityStatus:'unverified'}}),'unclassified'],
 [D('copy_us',{roles:['derivative_publication'],statementKinds:['reported_experience'],publisherCountry:'US',language:'en',productMarket:'unknown',product:{productId:P.espresso,identityStatus:'unverified'},originality:'derivative',derivedFrom:['s_lab_de']}),'derived_citation'],
 [D('press_jp',{roles:['press_release'],statementKinds:['promotional_assertion'],publisherCountry:'JP',language:'ja-JP',productMarket:'jp',product:{productId:P.rice,identityStatus:'unverified'}}),'unclassified'],
 [D('owner_und',{roles:['user_experience_report'],statementKinds:['unverified_opinion'],publisherCountry:'unknown',language:'und',productMarket:'unknown',product:{productId:null,identityStatus:'unverified'}}),'unclassified'],
 [D('forum_fr',{roles:['user_experience_report'],statementKinds:['reported_experience'],publisherCountry:'FR',language:'fr',productMarket:'fr',access:{rights:'not_permitted',robots:'disallowed'}}),'unclassified'],
];
const descs=fixtures.map(([d])=>validateSourceDescriptor258(d));
const role=fixtures.map(([d,exp])=>({sourceId:d.sourceId,expected:exp,got:materialRoleFor196(d)}));
// Phase196 route on the same sources (one annotation per source, material role from the mapping).
const corpus='A practical engineering evaluation of appliance controls and timed performance records was performed in a configured laboratory setup. '.repeat(8);
const batch=analyzeEphemeralBatch195({batchId:'batch_258',analyzedAt:'2026-10-16T10:00:00Z',reviews:descs.map(d=>({sourceId:d.sourceId,url:d.url,category:CAT[d.product.productId]??'air_fryers',variantId:d.product.productId??'unknown_product',transientText:corpus,textBasis:'analyst_annotation',dates:[],attribution:[],measurements:[]}))});
const m196=planSourceReviews196({batch,ledger:emptyLedger193(),seed:loadPublisherSeed196('data/phase196/publisher-method-seed.json'),
 annotations:descs.map(d=>({sourceId:d.sourceId,materialRole:materialRoleFor196(d),field:'capacity_min',market:d.productMarket==='unknown'?'unknown':d.productMarket.toUpperCase(),protocol:null,sourceRevision:null,freshPublisherBytes:null}))});
const lanes196=Object.fromEntries(m196.rows.map(r=>[r.sourceId,r.priorityLane]));
const distinctRoles=d=>d.roles.join('+');
const collapsedIn196=Object.values(descs.reduce((g,d)=>{const k=lanes196[d.sourceId];(g[k]??=new Set()).add(distinctRoles(d));return g;},{})).reduce((s,set)=>s+(set.size-1),0);
// Dry-run selection for planned jobs (Phase257 kinds), with source states including a 404 and an operator retirement.
let L=emptySourceLedger258();
for(const d of descs)L=recordSourceState258(L,{sourceId:d.sourceId,state:'discovered',cause:{kind:'discovery',reviewId:null},at:'2026-10-16T10:00:00.000Z'});
L=recordSourceState258(L,{sourceId:'s_video_us',state:'temporarily_unavailable',cause:{kind:'http_status',httpStatus:404},at:'2026-10-16T11:00:00.000Z'});
const jobs=[{productId:P.airfryer,criterion:'capacity_min',gapKind:'missing_declaration'},{productId:P.espresso,criterion:'extraction_temperature',gapKind:'missing_test'},
 {productId:P.rice,criterion:'texture_outcome',gapKind:'missing_test'},{productId:P.kettle,criterion:'capacity_min',gapKind:'declaration_conflict'}];
const sel=jobs.map(job=>selectSourcesForJob258({job,descriptors:descs,feedback:[],states:L,maxSources:4}));
const swapped=descs.map(d=>({...d,publisherCountry:{GB:'JP',JP:'GB',US:'DE',DE:'US',IT:'FR',FR:'IT'}[d.publisherCountry]??d.publisherCountry}));
const selSwap=jobs.map(job=>selectSourcesForJob258({job,descriptors:swapped,feedback:[],states:L,maxSources:4}));
const lanesOk=sel.every((s,i)=>s.selected.every(x=>jobs[i].gapKind==='missing_test'?x.lane!=='declaration':x.lane==='declaration'));
const out={schema:'pee258.pilot.v1',fixtures:'synthetic source metadata; product ids are retained records with unverified identity',
 markets:[...new Set(descs.map(d=>d.productMarket))].sort(),languages:[...new Set(descs.map(d=>d.language))].sort(),
 measured:{
  roleClassification:{correct:role.filter(r=>r.got===r.expected).length,of:role.length},
  provenance:{withSourceIdUrlAndOrigin:descs.filter(d=>d.sourceId&&d.url&&d.origin==='synthetic_fixture').length,of:descs.length},
  duplication:{derivativesCollapsed:sel.flatMap(s=>s.collapsed).map(c=>c.sourceId+'->'+c.duplicateOf)},
  geographicPreference:{selectionChangedBySwappingPublisherCountry:sel.some((s,i)=>JSON.stringify(s.selected.map(x=>x.sourceId))!==JSON.stringify(selSwap[i].selected.map(x=>x.sourceId))),requesterCountryUsed:false},
  languageMetadata:{allValidBcp47:descs.every(d=>languageTag258(d.language)),undeterminedKeptAsUnd:descs.filter(d=>d.language==='und').length,translationsCreated:0},
  identityAndAccess:{selectedWithUnverifiedIdentity:sel.flatMap(s=>s.selected).filter(x=>x.identityStatus==='unverified').length,selected:sel.flatMap(s=>s.selected).length,
   notPermittedExcluded:sel.every(s=>s.excluded.some(x=>x.sourceId==='s_forum_fr'))},
  laneFitsGap:lanesOk,
  phase196Comparison:{lanes:lanes196,distinctRoleSetsMergedWithinA196Lane:collapsedIn196,unclassifiedIn196:role.filter(r=>r.got==='unclassified').map(r=>r.sourceId)}},
 selections:sel.map(s=>({job:s.job,selected:s.selected.map(x=>({sourceId:x.sourceId,lane:x.lane,exactProduct:x.exactProduct,language:x.language,unfamiliar:x.unfamiliar})),
  collapsed:s.collapsed,excluded:s.excluded,notSuited:s.notSuited.length})),
 networkCalls:0,storeAccess:false};
const txt=JSON.stringify(out,null,1)+'\n';if(F.out)writeFileSync(resolve(F.out),txt);
console.log(JSON.stringify(out.measured,null,0));
for(const s of out.selections)console.log(s.job.gapKind,s.job.criterion,'->',s.selected.map(x=>x.sourceId+':'+x.lane).join(', '),'| collapsed',JSON.stringify(s.collapsed),'| excluded',s.excluded.length);
