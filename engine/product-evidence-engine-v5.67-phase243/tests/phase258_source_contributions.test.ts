import test from 'node:test';import assert from 'node:assert/strict';
import {languageTag258,validateSourceDescriptor258,materialRoleFor196,validateTermObservation258,LANGUAGE_CAPABILITIES258,type SourceDescriptor258} from '../src/phase258_source_contributions.js';
// Phase258 checkpoint A, written before the module. All source descriptors are synthetic fixtures (".example" hosts).
const base:SourceDescriptor258={schema:'pee258.source-descriptor.v1',origin:'synthetic_fixture',descriptorId:'d_maker_uk',sourceId:'s_maker_uk',
 url:'https://maker.example/uk/af55',roles:['manufacturer_specification'],statementKinds:['declared_specification'],
 publisherCountry:'GB',language:'en-GB',productMarket:'uk',product:{productId:'prd_41185d853e4a0eed26933056',identityStatus:'unverified'},
 testingConditions:{declared:false,conditionIds:[]},method:{described:false,referenceId:null},specialist:null,culturalTradition:null,
 sponsorship:'none_declared',originality:'original',derivedFrom:[],access:{rights:'unreviewed',robots:'unknown'},statement:null,limitations:['no_text_retained_rights_unreviewed']};
const D=(o:Partial<SourceDescriptor258>)=>validateSourceDescriptor258({...base,...o});

test('BCP 47 language tags are validated, with an explicit undetermined state; nothing is translated',()=>{
 for(const t of ['en','en-GB','it','it-IT','fr','fr-FR','de','de-DE','ja','ja-JP','zh-Hant-TW','und','mul','zxx'])assert.equal(languageTag258(t),true,t);
 for(const t of ['english','EN-gb-x','ja_JP','en-','', 'e','toolongtag'])assert.equal(languageTag258(t),false,t);
 assert.throws(()=>D({language:'italian'}),/language/);
 assert.equal(D({language:'und'}).language,'und','an unknown language is recorded as und, never guessed');
});
test('a source may serve several roles; statement kinds keep experience, observation, measurement, interpretation and promotion apart',()=>{
 const v=D({roles:['structured_professional_testing','original_video_demonstration'],statementKinds:['observed_practical_result','reported_experience'],
  method:{described:true,referenceId:'method_page_1'},testingConditions:{declared:true,conditionIds:['frozen_chips_500g']}});
 assert.deepEqual(v.roles,['structured_professional_testing','original_video_demonstration']);
 assert.throws(()=>D({roles:['independent_measurement'],statementKinds:['instrumental_measurement'],sponsorship:'sponsored'}),/independent/,'a sponsored measurement is not independent');
 assert.throws(()=>D({roles:['independent_measurement'],statementKinds:['expert_interpretation']}),/measurement/,'an opinion is not a measurement');
 assert.throws(()=>D({roles:['press_release'],statementKinds:['instrumental_measurement']}),/press release/);
 assert.throws(()=>D({authorityScore:0.9} as never),/unknown field/,'no authority scores');
 assert.throws(()=>D({countryRank:1} as never),/unknown field/);
});
test('expertise needs an explicit basis; nationality is never a basis; cultural traditions require specialist validation',()=>{
 const ok=D({roles:['qualified_cultural_expertise'],statementKinds:['expert_interpretation'],publisherCountry:'JP',language:'ja',productMarket:'jp',
  specialist:{domainId:'rice_cooking_tradition',basis:'documented_professional_practice',basisReferenceId:'profile_ref_1'},
  culturalTradition:{traditionId:'japanese_rice_preparation',specialistValidationRequired:true,expertiseBasisRequired:true}});
 assert.equal(ok.culturalTradition?.specialistValidationRequired,true);
 assert.throws(()=>D({specialist:{domainId:'espresso',basis:'nationality' as never,basisReferenceId:null}}),/basis/);
 assert.throws(()=>D({specialist:{domainId:'espresso',basis:'documented_professional_practice',basisReferenceId:null}}),/basisReferenceId/);
 assert.throws(()=>D({culturalTradition:{traditionId:'italian_espresso',specialistValidationRequired:false as never,expertiseBasisRequired:true}}),/specialist validation/);
 assert.throws(()=>D({roles:['qualified_cultural_expertise'],statementKinds:['expert_interpretation'],specialist:null}),/qualified/,'qualified expertise needs a stated basis');
});
test('original statements only where rights allow; identity and access stay as recorded; models and quantities are not prose',()=>{
 assert.throws(()=>D({statement:{text:'容量 4.5L',language:'ja',provenance:{revisionHash:null,locator:null},interpretedConceptIds:['capacity_min']}}),/rights/);
 const q=D({access:{rights:'reviewed_short_quotation',robots:'allowed'},language:'ja',statement:{text:'容量 4.5L',language:'ja',provenance:{revisionHash:'a'.repeat(64),locator:'table:capacity'},interpretedConceptIds:['capacity_min']},limitations:[]});
 assert.equal(q.statement?.text,'容量 4.5L','kept verbatim, not translated');
 assert.throws(()=>D({product:{productId:'prd_x',identityStatus:'verified_exact_variant' as never}}),/identity/);
 assert.equal(D({}).product.identityStatus,'unverified');
 assert.throws(()=>D({statement:{text:'x'.repeat(400),language:'en',provenance:{revisionHash:null,locator:null},interpretedConceptIds:[]},access:{rights:'reviewed_short_quotation',robots:'allowed'}}),/short/);
});
test('mapping to Phase196 material roles never upgrades interpretation, promotion or derivative material',()=>{
 assert.equal(materialRoleFor196(D({})),'manufacturer_specification');
 assert.equal(materialRoleFor196(D({roles:['independent_measurement'],statementKinds:['instrumental_measurement'],method:{described:true,referenceId:'m'}})),'original_instrumental_claim');
 assert.equal(materialRoleFor196(D({roles:['structured_professional_testing'],statementKinds:['observed_practical_result'],method:{described:true,referenceId:'m'}})),'structured_practical_claim');
 assert.equal(materialRoleFor196(D({roles:['structured_professional_testing'],statementKinds:['observed_practical_result']})),'unclassified','no described method: not structured testing');
 assert.equal(materialRoleFor196(D({roles:['derivative_publication'],statementKinds:['reported_experience'],originality:'derivative'})),'derived_citation');
 assert.equal(materialRoleFor196(D({roles:['qualified_cultural_expertise'],statementKinds:['expert_interpretation'],specialist:{domainId:'d',basis:'sensory_training',basisReferenceId:'r'}})),'unclassified');
 assert.equal(materialRoleFor196(D({roles:['press_release'],statementKinds:['promotional_assertion']})),'unclassified');
 assert.equal(materialRoleFor196(D({roles:['news_report'],statementKinds:['reported_experience']})),'unclassified');
});
test('language capabilities are stated honestly: only English has scoped semantic interpretation; nothing is translated',()=>{
 assert.deepEqual(LANGUAGE_CAPABILITIES258.semanticInterpretation,['en']);
 assert.equal(LANGUAGE_CAPABILITIES258.translation,'none');assert.equal(LANGUAGE_CAPABILITIES258.languageDetection,'none');
 assert.ok(validateTermObservation258({conceptId:'capacity_min',term:'容量',language:'ja',sourceDescriptorId:'d1',status:'candidate_unreviewed'}));
 assert.throws(()=>validateTermObservation258({conceptId:'capacity_min',term:'容量',language:'ja',sourceDescriptorId:'d1',status:'reviewed',translation:'capacity'} as never),/unknown field|status/);
});
