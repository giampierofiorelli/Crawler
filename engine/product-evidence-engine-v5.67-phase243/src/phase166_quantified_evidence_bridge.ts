/** Phase166 — English quantitative request -> ORIGINAL-evidence research bridge.
 * Uses the existing PEE source-span/measurement discipline (Phases 125, 145,
 * 164, 165). Design references: Recognizers-Text number-with-unit,
 * NLP.js edge handling and wink-nlp token segmentation. NO upstream source
 * copied, NO new runtime dependencies, NO verified product claims or rankings.
 */
import {createHash} from 'node:crypto';
import {advanceUserRequest164,type RequestSession164,type RequestOutput164}
 from './phase164_user_request_journey.js';
import type {CategoryBrain128} from './phase128_category_cognition_dialogue_bridge.js';
import type {IndexedPassage122} from './phase122_native_local_retrieval.js';
import type {CategoryIdentity} from './category_cognitive_mesh.js';

const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_]{0,80}$/.test(s);
const quantityUnit='dBA|dB|millimet(?:er|re)s?|centimet(?:er|re)s?|met(?:er|re)s?|inches|inch|in\\b|mm|cm|ml|lit(?:er|re)s?|kilograms?|kg|grams?|g\\b|l\\b';
const value='(?:\\d{1,5}(?:\\.\\d{1,3})?)';
const comparators='no more than|no less than|at least|at most|less than|more than|up to|under|below|over|above|maximum|minimum|max|min';
const limitRE=new RegExp(`\\b(${comparators})\\s+(${value})\\s*(${quantityUnit})(?![a-z])`,'gi');
const adjectivalRE=new RegExp(`\\b(no wider than|no taller than|no deeper than|no louder than|no heavier than|not wider than|not taller than|not deeper than|not louder than)\\s+(${value})\\s*(${quantityUnit})(?![a-z])`,'gi');
const betweenRE=new RegExp(`\\bbetween\\s+(${value})\\s+(?:and|to)\\s+(${value})\\s*(${quantityUnit})(?![a-z])`,'gi');
const moneyRE=/(?:\b(under|below|less than|at most|up to|no more than|over|above|more than|at least|no less than|max(?:imum)?|min(?:imum)?)\s*)?([£$€])\s*(\d{1,3}(?:,\d{3})+|\d{1,6})(?:\.(\d{1,2}))?\b/gi;
export type Metric166='width'|'height'|'depth'|'weight'|'capacity'|'noise'|'price'|'unbound_dimension';
export type Direction166='strict_lt'|'lte'|'strict_gt'|'gte'|'range_inclusive'|'unresolved';
export interface QuantityCandidate166 {
 id:string;span:{start:number;end:number;literal:string};metric:Metric166;
 direction:Direction166;minimum:number|null;maximum:number|null;
 canonicalUnit:'cm'|'kg'|'L'|'dBA'|'GBP'|'EUR'|'USD'|null;
 rawUnit:string;scope:'hard_candidate'|'soft_preference'|'unresolved';
 reason:string|null;userMeaningConfirmed:false;evidenceValidated:false;
}
export interface QuantifiedAudit166 {
 phase:166;sourceQuestionSha256:string;kind:'english_quantity_candidates';
 candidates:readonly QuantityCandidate166[];unresolvedSpans:readonly {start:number;end:number;literal:string;reason:string}[];
 canonicalConstraintFingerprint:string;requiresUserConfirmation:boolean;userMeaningVerified:false;rankingAuthorized:false;
}
function unit(raw:string):{canonical:QuantityCandidate166['canonicalUnit'];factor:number;dimension:'length'|'mass'|'volume'|'sound'}|null{
 const u=raw.toLowerCase();
 if(['mm','millimeter','millimetre','millimeters','millimetres'].includes(u))return {canonical:'cm',factor:0.1,dimension:'length'};
 if(['cm','centimeter','centimetre','centimeters','centimetres'].includes(u))return {canonical:'cm',factor:1,dimension:'length'};
 if(['meter','metre','meters','metres'].includes(u))return {canonical:'cm',factor:100,dimension:'length'};
 if(['in','inch','inches'].includes(u))return {canonical:'cm',factor:2.54,dimension:'length'};
 if(['kg','kilogram','kilograms'].includes(u))return {canonical:'kg',factor:1,dimension:'mass'};
 if(['g','gram','grams'].includes(u))return {canonical:'kg',factor:0.001,dimension:'mass'};
 if(['ml'].includes(u))return {canonical:'L',factor:0.001,dimension:'volume'};
 if(['l','litre','liter','litres','liters'].includes(u))return {canonical:'L',factor:1,dimension:'volume'};
 if(u==='dba')return {canonical:'dBA',factor:1,dimension:'sound'};
 if(u==='db')return {canonical:null,factor:1,dimension:'sound'}; // dB != A-weighted dBA
 return null;
}
function semanticMetric(prefix:string,dim:'length'|'mass'|'volume'|'sound',adjective=''):Metric166{
 if(/wider/.test(adjective))return 'width';
 if(/taller/.test(adjective))return 'height';
 if(/deeper/.test(adjective))return 'depth';
 if(dim==='mass')return 'weight';
 if(dim==='volume')return /\b(?:capacity|basket|tank|volume|holds?|size)\b/.test(prefix)?'capacity':'unbound_dimension';
 if(dim==='sound')return 'noise';
 if(dim==='length'){
  const matches=[...prefix.matchAll(/\b(width|wide|height|tall|depth|deep)\b/gi)];
  const axis=matches.at(-1)?.[1]?.toLowerCase();
  return axis?axis==='width'||axis==='wide'?'width':axis==='height'||axis==='tall'?'height':'depth':'unbound_dimension';
 }
 return 'unbound_dimension';
}
function direction(comparator:string):Direction166{
 const c=comparator.toLowerCase();
 if(['under','below','less than'].includes(c))return 'strict_lt';
 if(['no more than','at most','up to','maximum','max','no wider than','no taller than','no deeper than','no louder than','no heavier than','not wider than','not taller than','not deeper than','not louder than'].includes(c))return 'lte';
 if(['over','above','more than'].includes(c))return 'strict_gt';
 if(['no less than','at least','minimum','min'].includes(c))return 'gte';
 return 'unresolved';
}
const round=(n:number)=>Math.round((n+Number.EPSILON)*1e6)/1e6;
export function auditQuantifiedRequest166(question:string):QuantifiedAudit166{
 if(typeof question!=='string'||question.length<3||question.length>4000)throw Error('invalid_quantified_question');
 const candidates:QuantityCandidate166[]=[];
 const add=(start:number,end:number,metric:Metric166,dir:Direction166,min:number|null,max:number|null,
  canonicalUnit:QuantityCandidate166['canonicalUnit'],rawUnit:string,reason:string|null)=>{
  const prefix=question.slice(Math.max(0,start-65),start).toLowerCase().split(/[.!?;,]/).at(-1)??'';
  const negated=/\b(?:not|never|don'?t|do not)\s*$/.test(prefix)&& !/^no (?:more|less|wider|taller|deeper|louder|heavier)/i.test(question.slice(start));
  const uncertain=/\b(?:about|around|roughly|approximately|maybe|perhaps)\s*$/.test(prefix);
  const soft=/\b(?:ideally|preferably|prefer|would like|if possible)\b/.test(prefix);
  const why=reason??(negated?'negated_comparator_scope':uncertain?'approximate_quantity':null);
  candidates.push({id:'q166_'+candidates.length,span:{start,end,literal:question.slice(start,end)},metric,
   direction:why?'unresolved':dir,minimum:min,maximum:max,canonicalUnit,
   rawUnit,scope:why?'unresolved':soft?'soft_preference':'hard_candidate',reason:why,
   userMeaningConfirmed:false,evidenceValidated:false});
 };
 const overlaps=(start:number,end:number)=>candidates.some(x=>x.span.start<end&&start<x.span.end);
 for(const m of question.matchAll(betweenRE)){
  const u=unit(m[3]);const start=m.index!,end=start+m[0].length;
  if(!u)continue;
  const prefix=question.slice(Math.max(0,start-55),start).toLowerCase().split(/[.!?;,]/).at(-1)??'';
  const metric=semanticMetric(prefix,u.dimension);
  const low=round(Number(m[1])*u.factor),high=round(Number(m[2])*u.factor);
  add(start,end,metric,'range_inclusive',low,high,u.canonical,m[3],
   low>high?'reversed_range':metric==='unbound_dimension'?'unbound_dimension':!u.canonical?'ambiguous_acoustic_weighting':null);
 }
 for(const re of [adjectivalRE,limitRE])for(const m of question.matchAll(re)){
  const start=m.index!,end=start+m[0].length;if(overlaps(start,end))continue;
  const u=unit(m[3]);if(!u)continue;
  const prefix=question.slice(Math.max(0,start-55),start).toLowerCase().split(/[.!?;,]/).at(-1)??'';
  const metric=semanticMetric(prefix,u.dimension,re===adjectivalRE?m[1].toLowerCase():'');
  const dir=direction(m[1]),v=round(Number(m[2])*u.factor);
  const why=metric==='unbound_dimension'?'unbound_dimension':!u.canonical?'ambiguous_acoustic_weighting':null;
  add(start,end,metric,dir,dir==='gte'||dir==='strict_gt'?v:null,dir==='lte'||dir==='strict_lt'?v:null,
   u.canonical,m[3],why);
 }
 for(const m of question.matchAll(moneyRE)){
  const start=m.index!,end=start+m[0].length;if(overlaps(start,end))continue;
  const dir=m[1]?direction(m[1]):'unresolved';
  const v=Number(m[3].replaceAll(',','')+(m[4]?'.'+m[4]:''));
  const canonical=m[2]==='£'?'GBP':m[2]==='€'?'EUR':'USD';
  add(start,end,'price',dir,dir==='gte'||dir==='strict_gt'?v:null,dir==='lte'||dir==='strict_lt'?v:null,
   canonical,m[2],!m[1]?'price_without_explicit_comparator':null);
 }
 candidates.sort((a,b)=>a.span.start-b.span.start||a.span.end-b.span.end);
 // Never evaluate malformed/overlapping candidates as a hard filter.
 // Reject impossible conjunctions: do not resolve conflicting hard limits by order.
 const groups=new Map<string,QuantityCandidate166[]>();
 for(const c of candidates.filter(c=>c.scope==='hard_candidate'&&c.canonicalUnit&&c.metric!=='unbound_dimension')){
  const key=`${c.metric}/${c.canonicalUnit}`;groups.set(key,[...(groups.get(key)??[]),c]);
 }
 for(const values of groups.values()){
  if(values.length<2)continue;
  const lower=Math.max(...values.map(x=>x.minimum??-Infinity));
  const upper=Math.min(...values.map(x=>x.maximum??Infinity));
  const strictAtEqual=values.some(x=>(x.direction==='strict_lt'&&x.maximum===upper)||
   (x.direction==='strict_gt'&&x.minimum===lower));
  if(lower>upper||(lower===upper&&strictAtEqual))for(const c of values){
   c.scope='unresolved';c.reason='contradictory_quantity_bounds';c.direction='unresolved';
  }
 }
 const unsupportedRE=new RegExp(`\\b(${comparators})\\s+(${value})\\s*([a-z°%]{1,15})(?![a-z])`,'gi');
 for(const m of question.matchAll(unsupportedRE)){
  const start=m.index!,end=start+m[0].length;
  if(overlaps(start,end))continue;
  // Unsupported quantity stays visible rather than being silently discarded.
  candidates.push({id:'q166_'+candidates.length,span:{start,end,literal:question.slice(start,end)},
   metric:'unbound_dimension',direction:'unresolved',minimum:null,maximum:null,canonicalUnit:null,
   rawUnit:m[3],scope:'unresolved',reason:'unsupported_or_unbound_quantity_unit',
   userMeaningConfirmed:false,evidenceValidated:false});
 }
 candidates.sort((a,b)=>a.span.start-b.span.start||a.span.end-b.span.end);
 const unresolvedSpans=candidates.filter(x=>x.scope==='unresolved')
  .map(x=>({...x.span,reason:x.reason??'unresolved'}));
 return {phase:166,sourceQuestionSha256:sha(question),kind:'english_quantity_candidates',
  candidates,unresolvedSpans,canonicalConstraintFingerprint:sha(JSON.stringify(candidates.map(x=>({
   metric:x.metric,direction:x.direction,minimum:x.minimum,maximum:x.maximum,
   unit:x.canonicalUnit,scope:x.scope,reason:x.reason
  })).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))))),
  requiresUserConfirmation:candidates.length>0,
  userMeaningVerified:false,rankingAuthorized:false};
}
export interface EvidenceObservation166 {
 id:string;productId:string;metric:Exclude<Metric166,'unbound_dimension'>;
 canonicalUnit:NonNullable<QuantityCandidate166['canonicalUnit']>;value:number;
 sourceKind:'independent_original_test'|'manufacturer_specification'|'customer_review';
 sourceUrl:string;originalDocumentId:string;documentSha256:string;
 testProtocolId:string|null;reviewReceiptId:string|null;
 /** Structural declarations are NOT signatures or proof of independent review. */
 independentlyAuthenticated:false;
}
export type ConditionalStatus166='candidate_fit_not_verified'|'candidate_failure_not_verified'|
 'insufficient_evidence'|'uncomparable_evidence'|'contradictory_evidence'|'unresolved_intent';
export interface ProductEvidenceScreen166 {
 productId:string;quantityId:string;status:ConditionalStatus166;
 citedObservationIds:readonly string[];excludedFromRanking:false;reason:string;
}
export interface EvidenceBridge166 {
 phase:166;sourceQuestionSha256:string;requestAction:RequestOutput164['action'];
 categoryId:string|null;quantityAudit:QuantifiedAudit166;
 screens:readonly ProductEvidenceScreen166[];researchObligations:readonly string[];
 evidenceOriginalityProven:false;independentReviewAuthenticated:false;
 constraintsConfirmed:false;comparabilityCertified:false;
 productRankingAuthorized:false;publicationAuthorized:false;
}
const metricUnits166:Record<string,readonly string[]>={width:['cm'],height:['cm'],depth:['cm'],
 weight:['kg'],capacity:['L'],noise:['dBA'],price:['GBP','USD','EUR']};
function checks(obs:readonly EvidenceObservation166[],products:readonly string[]){
 if(obs.length>1000||products.length>100||new Set(products).size!==products.length||!products.every(id)||
  new Set(obs.map(x=>x.id)).size!==obs.length)throw Error('invalid_phase166_product_or_evidence_set');
 for(const o of obs){
  if(!o||!id(o.id)||!products.includes(o.productId)||!id(o.productId)||
   !['width','height','depth','weight','capacity','noise','price'].includes(o.metric)||
   !['cm','kg','L','dBA','GBP','EUR','USD'].includes(o.canonicalUnit)||
   !metricUnits166[o.metric]?.includes(o.canonicalUnit)||
   !Number.isFinite(o.value)||o.value<0||
   !['independent_original_test','manufacturer_specification','customer_review'].includes(o.sourceKind)||
   !/^https:\/\/[^\s/]+\/\S+/.test(o.sourceUrl)||!id(o.originalDocumentId)||
   !/^[0-9a-f]{64}$/.test(o.documentSha256)||
   (o.testProtocolId!==null&&!id(o.testProtocolId))||
   (o.reviewReceiptId!==null&&!id(o.reviewReceiptId))||
   o.independentlyAuthenticated!==false)throw Error('invalid_phase166_evidence');
 }
}
function within(q:QuantityCandidate166,v:number):boolean{
 if(q.direction==='strict_lt')return v<q.maximum!;
 if(q.direction==='lte')return v<=q.maximum!;
 if(q.direction==='strict_gt')return v>q.minimum!;
 if(q.direction==='gte')return v>=q.minimum!;
 if(q.direction==='range_inclusive')return v>=q.minimum!&&v<=q.maximum!;
 return false;
}
/** Never excludes a product, even when documented candidate values fail.
 * Downstream Phases97/99 require confirmed user constraints + authenticated
 * independently reviewed evidence before any real decision. */
export function screenQuestionEvidence166(request:RequestOutput164,question:string,
 products:readonly string[],observations:readonly EvidenceObservation166[]=[]):EvidenceBridge166{
 if(!request||request.phase!==164||sha(question)!==request.requestSha256||
  !Array.isArray(products)||!Array.isArray(observations))throw Error('question_or_request_mismatch_166');
 checks(observations,products);
 const quantityAudit=auditQuantifiedRequest166(question);
 const screens:ProductEvidenceScreen166[]=[];const obligations=new Set<string>(request.research.obligations);
 for(const q of quantityAudit.candidates){
  obligations.add(`confirm_quantity_${q.id}_${q.metric}`);
  if(q.scope==='unresolved'||q.metric==='unbound_dimension')obligations.add(`clarify_quantity_${q.id}`);
  for(const productId of products){
   let status:ConditionalStatus166='unresolved_intent',reason='quantity_or_unit_ambiguity';
   let citedObservationIds:string[]=[];
   if(q.scope!=='unresolved'&&q.metric==='price'&&q.canonicalUnit){
    status='insufficient_evidence';reason='needs_current_authenticated_price_not_historical_review_price';
    obligations.add(`acquire_current_authorized_price_for_${productId}`);
   }else if(q.scope!=='unresolved'&&q.metric!=='unbound_dimension'&&q.canonicalUnit){
    const relevant=observations.filter(o=>o.productId===productId&&o.metric===q.metric&&
      o.canonicalUnit===q.canonicalUnit&&o.sourceKind==='independent_original_test'&&
      o.testProtocolId!==null&&o.reviewReceiptId!==null);
    citedObservationIds=relevant.map(x=>x.id).sort();
    if(!relevant.length){status='insufficient_evidence';reason='no_structurally_reviewed_original_test';}
    else if(new Set(relevant.map(o=>o.testProtocolId)).size>1){
     status='uncomparable_evidence';reason='test_protocols_not_normalized';
    }else{
     const outcomes=new Set(relevant.map(o=>within(q,o.value)));
     if(outcomes.size>1){status='contradictory_evidence';reason='opposing_original_test_measurements';}
     else if(outcomes.has(true)){status='candidate_fit_not_verified';reason='compatible_candidate_requires_authentication_and_user_confirmation';}
     else {status='candidate_failure_not_verified';reason='potential_failure_requires_independent_adjudication';}
    }
   }
   if(status==='insufficient_evidence'&&q.metric!=='price')obligations.add(`acquire_original_${q.metric}_test_for_${productId}`);
   if(status==='uncomparable_evidence')obligations.add(`harmonize_${q.metric}_test_protocol_for_${productId}`);
   if(status==='contradictory_evidence')obligations.add(`adjudicate_conflicting_${q.metric}_for_${productId}`);
   screens.push({productId,quantityId:q.id,status,citedObservationIds,excludedFromRanking:false,reason});
  }
 }
 if(products.length===0)obligations.add('discover_and_verify_product_universe');
 obligations.add('independently_authenticate_original_sources_and_review_receipts');
 obligations.add('confirm_user_nonnegotiable_constraints_before_exclusion');
 return {phase:166,sourceQuestionSha256:sha(question),requestAction:request.action,
  categoryId:request.categoryId,quantityAudit,screens,
  researchObligations:[...obligations].sort(),evidenceOriginalityProven:false,
  independentReviewAuthenticated:false,constraintsConfirmed:false,
  comparabilityCertified:false,productRankingAuthorized:false,publicationAuthorized:false};
}
export function advanceAndPlanRequest166(session:RequestSession164,input:{
 turnId:string;question:string;language:'en'|'it';brains:readonly CategoryBrain128[];
 passages?:readonly IndexedPassage122[];evidence?:'not_assessed'|'needs_acquisition'|'reviewed_sufficient';
 researchCatalog?:readonly CategoryIdentity[];catalogAsOf?:string;
},products:readonly string[]=[],observations:readonly EvidenceObservation166[]=[]){
 const request=advanceUserRequest164(session,input);
 // English-first: Italian requests need a different quantitative adapter.
 if(input.language!=='en')return {request,evidenceBridge:null,reason:'english_only_quantified_adapter'} as const;
 return {request,evidenceBridge:screenQuestionEvidence166(request,input.question,products,observations),reason:null} as const;
}
