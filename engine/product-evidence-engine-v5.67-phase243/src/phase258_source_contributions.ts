/**
 * Phase258 — source contributions and multilingual-ready source metadata. A contract layered on the existing source
 * intelligence, not a new engine:
 *  - Phase196 keeps planning source reviews from MaterialRole196; materialRoleFor196 maps a richer descriptor onto it
 *    deterministically and never upgrades interpretation, promotion or derivative material;
 *  - expertise uses the Phase197 basis vocabulary (AssessorExpertise197), which excludes nationality;
 *  - nothing here retrieves, interprets, translates, scores or admits anything.
 *
 * A descriptor records what a source may contribute (roles; a source may have several), the kind of each statement
 * (declared specification, instrumental measurement, observed practical result, reported experience, expert
 * interpretation, promotional assertion, unverified opinion, safety notice), and, as separate facts, the publisher's
 * country, the source language (BCP 47, "und" when unknown), the product market, testing conditions, specialist basis
 * and any cultural tradition. Country and language are never authority.
 */
import type {AssessorExpertise197} from './phase197_evidence_sufficiency.js';
import type {MaterialRole196} from './phase196_source_intelligence.js';

export const SOURCE_ROLES258=['manufacturer_specification','independent_measurement','structured_professional_testing','qualified_cultural_expertise',
 'original_video_demonstration','journalism','news_report','press_release','product_safety_information','derivative_publication',
 'retailer_listing','user_experience_report'] as const;
export const STATEMENT_KINDS258=['declared_specification','instrumental_measurement','observed_practical_result','reported_experience',
 'expert_interpretation','promotional_assertion','unverified_opinion','safety_notice'] as const;
export type SourceRole258=typeof SOURCE_ROLES258[number];
export type StatementKind258=typeof STATEMENT_KINDS258[number];
type Basis=AssessorExpertise197['expertise'];
const BASES:readonly Basis[]=['documented_professional_practice','sensory_training','protocol_authorship','domain_standard_experience','not_established'];

export interface SourceDescriptor258 {
 schema:'pee258.source-descriptor.v1';origin:'synthetic_fixture'|'operator_metadata';
 descriptorId:string;sourceId:string;url:string;
 roles:SourceRole258[];statementKinds:StatementKind258[];
 /** ISO 3166-1 alpha-2 of the publisher, or "unknown". Never an authority signal. */
 publisherCountry:string;
 /** BCP 47; "und" when the language is not determined. Not detected automatically by PEE today. */
 language:string;
 /** The market of the product variant discussed (e.g. "uk", "jp"), or "unknown". */
 productMarket:string;
 product:{productId:string|null;identityStatus:'unverified'|'reviewed'};
 testingConditions:{declared:boolean;conditionIds:string[]};
 method:{described:boolean;referenceId:string|null};
 specialist:{domainId:string;basis:Basis;basisReferenceId:string|null}|null;
 /** A tradition materially relevant to the outcome: always requires qualified specialist validation. */
 culturalTradition:{traditionId:string;specialistValidationRequired:true;expertiseBasisRequired:true}|null;
 sponsorship:'none_declared'|'sponsored'|'affiliate_links'|'gifted_product'|'unknown';
 originality:'original'|'derivative'|'syndicated'|'unknown';
 derivedFrom:string[];
 access:{rights:'unreviewed'|'reviewed_metadata_only'|'reviewed_short_quotation'|'not_permitted';robots:'unknown'|'allowed'|'disallowed'};
 /** The original short statement, verbatim and language-tagged, only where rights allow it. */
 statement:{text:string|null;language:string;provenance:{revisionHash:string|null;locator:string|null};interpretedConceptIds:string[]}|null;
 limitations:string[];
}
const KEYS=['schema','origin','descriptorId','sourceId','url','roles','statementKinds','publisherCountry','language','productMarket','product',
 'testingConditions','method','specialist','culturalTradition','sponsorship','originality','derivedFrom','access','statement','limitations'];
const ID=/^[a-z][a-z0-9_.:-]{0,100}$/;
const fail=(m:string):never=>{throw Error('phase258_invalid_descriptor: '+m);};
const strict=(o:unknown,keys:string[],what:string)=>{if(!o||typeof o!=='object'||Array.isArray(o))fail(what+' not an object');
 for(const k of Object.keys(o as object))if(!keys.includes(k))fail(`unknown field ${what==='descriptor'?'':what+'.'}${k}`);
 for(const k of keys)if(!(k in (o as object)))fail(`missing field ${what}.${k}`);};
const list=<T extends string>(v:unknown,allowed:readonly T[],what:string,nonEmpty=true):T[]=>{
 if(!Array.isArray(v)||(nonEmpty&&!v.length)||v.length>20||v.some(x=>!allowed.includes(x as T))||new Set(v).size!==v.length)fail(what);return v as T[];};
const ids=(v:unknown,what:string)=>{if(!Array.isArray(v)||v.length>50||v.some(x=>typeof x!=='string'||!ID.test(x)))fail(what);return v as string[];};

/** Well-formed BCP 47 (RFC 5646) language tag for the subset PEE records: language (2–3 letters, incl. und, mul, zxx),
 * optional script (4 letters), optional region (2 letters or 3 digits), optional variants. Well-formedness only. */
export function languageTag258(t:unknown):boolean{
 return typeof t==='string'&&/^(?:[a-z]{2,3})(?:-[A-Z][a-z]{3})?(?:-(?:[A-Z]{2}|\d{3}))?(?:-(?:[a-z0-9]{5,8}|\d[a-z0-9]{3}))*$/.test(t);
}
export function validateSourceDescriptor258(d0:unknown):SourceDescriptor258{
 strict(d0,KEYS,'descriptor');const d=d0 as SourceDescriptor258;
 if(d.schema!=='pee258.source-descriptor.v1')fail('schema');
 if(!['synthetic_fixture','operator_metadata'].includes(d.origin))fail('origin');
 for(const k of ['descriptorId','sourceId'] as const)if(typeof d[k]!=='string'||!ID.test(d[k]))fail(k);
 let u:URL|null=null;try{u=new URL(d.url);}catch{fail('url');}
 if(!u||u.protocol!=='https:'||u.username||u.password)fail('url');
 const roles=list(d.roles,SOURCE_ROLES258,'roles'),kinds=list(d.statementKinds,STATEMENT_KINDS258,'statementKinds');
 if(typeof d.publisherCountry!=='string'||!(d.publisherCountry==='unknown'||/^[A-Z]{2}$/.test(d.publisherCountry)))fail('publisherCountry (ISO 3166-1 alpha-2 or unknown)');
 if(!languageTag258(d.language))fail('language (BCP 47; use "und" when undetermined)');
 if(typeof d.productMarket!=='string'||!(d.productMarket==='unknown'||/^[a-z]{2,10}$/.test(d.productMarket)))fail('productMarket');
 strict(d.product,['productId','identityStatus'],'product');
 if(d.product.productId!==null&&!ID.test(d.product.productId))fail('product.productId');
 if(!['unverified','reviewed'].includes(d.product.identityStatus))fail('product identity status');
 strict(d.testingConditions,['declared','conditionIds'],'testingConditions');ids(d.testingConditions.conditionIds,'testingConditions.conditionIds');
 strict(d.method,['described','referenceId'],'method');if(d.method.described&&!d.method.referenceId)fail('method.referenceId required when described');
 if(d.specialist!==null){strict(d.specialist,['domainId','basis','basisReferenceId'],'specialist');
  if(!ID.test(d.specialist.domainId))fail('specialist.domainId');
  if(!BASES.includes(d.specialist.basis))fail('specialist.basis (nationality, language or fame are not a basis)');
  if(d.specialist.basis!=='not_established'&&!d.specialist.basisReferenceId)fail('specialist.basisReferenceId required for a stated basis');}
 if(d.culturalTradition!==null){strict(d.culturalTradition,['traditionId','specialistValidationRequired','expertiseBasisRequired'],'culturalTradition');
  if(!ID.test(d.culturalTradition.traditionId))fail('culturalTradition.traditionId');
  if(d.culturalTradition.specialistValidationRequired!==true||d.culturalTradition.expertiseBasisRequired!==true)fail('a cultural tradition always requires specialist validation with a stated basis');}
 if(!['none_declared','sponsored','affiliate_links','gifted_product','unknown'].includes(d.sponsorship))fail('sponsorship');
 if(!['original','derivative','syndicated','unknown'].includes(d.originality))fail('originality');
 ids(d.derivedFrom,'derivedFrom');
 strict(d.access,['rights','robots'],'access');
 if(!['unreviewed','reviewed_metadata_only','reviewed_short_quotation','not_permitted'].includes(d.access.rights)||!['unknown','allowed','disallowed'].includes(d.access.robots))fail('access');
 if(d.statement!==null){strict(d.statement,['text','language','provenance','interpretedConceptIds'],'statement');
  if(d.statement.text!==null){if(d.access.rights!=='reviewed_short_quotation')fail('statement text needs reviewed short-quotation rights');
   if(typeof d.statement.text!=='string'||d.statement.text.length>280)fail('statement text must be short (≤ 280)');}
  if(!languageTag258(d.statement.language))fail('statement.language');
  strict(d.statement.provenance,['revisionHash','locator'],'statement.provenance');
  if(d.statement.provenance.revisionHash!==null&&!/^[0-9a-f]{64}$/.test(d.statement.provenance.revisionHash))fail('statement.provenance.revisionHash');
  ids(d.statement.interpretedConceptIds,'statement.interpretedConceptIds');}
 if(!Array.isArray(d.limitations)||d.limitations.length>20||d.limitations.some(x=>typeof x!=='string'||!/^[a-z0-9_]{3,80}$/.test(x)))fail('limitations');
 // Epistemic consistency.
 if(roles.includes('independent_measurement')){
  if(!kinds.includes('instrumental_measurement'))fail('an independent measurement role needs an instrumental measurement statement (an opinion is not a measurement)');
  if(['sponsored','gifted_product'].includes(d.sponsorship))fail('a sponsored or gifted measurement is not independent');}
 if(roles.includes('press_release')&&kinds.some(k=>k==='instrumental_measurement'||k==='observed_practical_result'))fail('a press release carries promotional assertions, not measurements or observations');
 if(roles.includes('qualified_cultural_expertise')&&(!d.specialist||d.specialist.basis==='not_established'))fail('qualified expertise needs a specialist with a stated basis');
 return d;
}
/** Deterministic mapping onto Phase196's material role. Only method-bearing original material is upgraded. */
export function materialRoleFor196(d:SourceDescriptor258):MaterialRole196{
 const original=d.originality==='original',k=new Set(d.statementKinds),r=new Set(d.roles);
 if(r.has('derivative_publication')||d.originality==='derivative'||d.originality==='syndicated')return 'derived_citation';
 if(r.has('independent_measurement')&&k.has('instrumental_measurement')&&original&&d.method.described)return 'original_instrumental_claim';
 if((r.has('structured_professional_testing')||r.has('original_video_demonstration'))&&k.has('observed_practical_result')&&original&&d.method.described)return 'structured_practical_claim';
 if(r.has('manufacturer_specification')&&k.has('declared_specification'))return 'manufacturer_specification';
 return 'unclassified';
}
/** A source term for a language-neutral concept: terminology data, never a translation and never reviewed by default. */
export interface TermObservation258 {conceptId:string;term:string;language:string;sourceDescriptorId:string;status:'candidate_unreviewed'}
export function validateTermObservation258(t0:unknown):TermObservation258{
 strict(t0,['conceptId','term','language','sourceDescriptorId','status'],'term');const t=t0 as TermObservation258;
 if(!ID.test(t.conceptId)||!ID.test(t.sourceDescriptorId)||typeof t.term!=='string'||!t.term.trim()||t.term.length>80||!languageTag258(t.language))fail('term');
 if(t.status!=='candidate_unreviewed')fail('term status: only candidate_unreviewed exists until a review process does');
 return t;
}
/** What PEE supports today, per language task (Phase258 audit). Accepting Unicode or a tag is not understanding. */
export const LANGUAGE_CAPABILITIES258={
 languageDetection:'none',
 structuralHtmlExtraction:'language_independent_structure_with_english_label_heuristics',
 terminologyMatching:['en'],
 semanticInterpretation:['en'],
 faithfulnessChecking:['en'],
 translation:'none',
 frontendLocalization:'partial_it_clarification_labels_phase127',
} as const;
