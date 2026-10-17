/** Phase181: verified PRODUCT KNOWLEDGE -> ON-DEMAND decision, not a stockpile
 * of user-specific rankings. The catalog is an externally reviewed, signed
 * per-product observation snapshot, never a pre-ranked answer. Signed content
 * authenticates the issuer; source science and methods require external audit.
 * Research gaps are instructions to existing Phase129/179 research workers;
 * the presence of a gap does not mean the worker accessed the Internet.
 */
import {createPublicKey,verify} from 'node:crypto';
import {assertDecisionSnapshot177,type DecisionSnapshot177,type CriterionPriority177} from './phase177_decision_snapshot.js';
import {canonicalJson180,type TrustedRankingAuthority180} from './phase180_reviewed_first_answer.js';

const nameOK=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(s)&&!['__proto__','prototype','constructor'].includes(s);
const stamp=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(s)&&Number.isFinite(Date.parse(s));
const urlOK=(s:unknown):s is string=>typeof s==='string'&&s.length<2048&&/^https:\/\/[^\s/?#]+\//.test(s);
const number=(n:unknown,min=0,max=10000)=>Number.isSafeInteger(n)&&Number(n)>=min&&Number(n)<=max;
const distinct=(x:readonly string[])=>x.length===new Set(x).size;
const priority:readonly CriterionPriority177[]=['hard','high','normal','low'];
export interface KnowledgeDimension181 {
 key:string;label:string;value:unknown;methodId:string;protocolVersion:string;
 /** Reviewed weights are per-dimension AND per-priority, not invented from UI phrases. */
 weightUnits:Readonly<Record<CriterionPriority177,number>>;
 weightingReviewReference:string;normalizationReviewReference:string;
}
export interface ProductObservation181 {
 dimensionKey:string;valuePoints:number;hardOutcome:'pass'|'fail'|'unknown';
 /** Exact product and dimension binding for original test evidence. */
 evidenceId:string;
}
export interface ProductKnowledge181 {
 variantId:string;name:string;observations:readonly ProductObservation181[];
}
/** Phase269: limitation codes a test carries into the answer (rendered by the request path). */
export const TEST_LIMITATIONS181=['identity_by_product_name_only','condition_from_same_paragraph','load_from_document_protocol','load_from_publisher_protocol',
 'all_compartments_running','includes_preheat','fixed_duration_not_cooking_task','single_publisher'] as const;
export interface OriginalTest181 {
 id:string;variantId:string;dimensionKey:string;originalTestId:string;
 methodId:string;protocolVersion:string;sourceUrl:string;observedAt:string;
 /** Phase269: 'exact_variant' only when the tested subject's own model code identifies the variant; a test of a product
  * named without a model code is 'named_product' and the answer must say the variant is not verified. */
 scope:'exact_variant_original_professional_test'|'named_product_original_professional_test';
 /** Phase269: the raw measured quantity (never converted to a score when a transformation is not justified). */
 measured?:{value:number;unit:string;direction:'lower_is_better'|'higher_is_better'};
 limitations?:readonly (typeof TEST_LIMITATIONS181)[number][];
}
export interface ProductKnowledgeCatalog181 {
 phase:181;schema:'181.1';market:string;categoryId:string;
 knowledgeRevision:string;policyRevision:string;reviewedAt:string;expiresAt:string;
 discoveredVariantIds:readonly string[];coverageStatement:string;marketCoverageComplete:false;
 dimensions:readonly KnowledgeDimension181[];originalTests:readonly OriginalTest181[];
 products:readonly ProductKnowledge181[];externalReviewReference:string;
}
export interface SignedCatalog181 {catalog:ProductKnowledgeCatalog181;keyId:string;signatureBase64:string;}
/** Phase257: 'missing_declaration' (an original maker or retailer specification of a criterion for a product) and
 * 'declaration_conflict' (sources disagree for a product and criterion) are specification research; 'missing_test' stays
 * independent performance measurement only. */
export type ResearchGap181={kind:'new_category'|'missing_product'|'missing_criterion'|'missing_test'|'missing_declaration'|'declaration_conflict'|'stale_knowledge'|'scope_unconfirmed'|'unconfirmed_need'|'no_catalog'|'need_review';reference:string;action:string};
export interface DynamicDecision181 {
 phase:181;language:'en';source:'signed_product_knowledge';status:'ranking_ready'|'research_required';
 firstLayer:readonly string[];visibleCautions:readonly string[];
 rankInputFingerprint:string;knowledgeRevision:string|null;policyRevision:string|null;
 ranked:readonly {variantId:string;name:string;rank:number;scorePoints:number;
  originalTestIds:readonly string[];sourceUrls:readonly string[]}[];
 held:readonly {variantId:string;name:string;reason:string}[];
 researchGaps:readonly ResearchGap181[];
 coverage:{discovered:number;reviewed:number;notYetReviewed:number;marketCoverageComplete:false};
 /** No catalog may authenticate itself, no user request may approve research. */
 rankingsPrecomputed:false;researchAccessPerformed:false;scientificValidityNotEstablishedBySignature:true;
}
const gap=(kind:ResearchGap181['kind'],reference:string,action:string):ResearchGap181=>({kind,reference,action});
function pending(snapshot:DecisionSnapshot177,gaps:ResearchGap181[],reason:string):DynamicDecision181{
 return {phase:181,language:'en',source:'signed_product_knowledge',status:'research_required',
  firstLayer:['No evidence-supported ranking is available for the current requirements.'],visibleCautions:[reason],
  rankInputFingerprint:snapshot.rankInputFingerprint,knowledgeRevision:null,policyRevision:null,
  ranked:[],held:[],researchGaps:gaps,coverage:{discovered:0,reviewed:0,notYetReviewed:0,marketCoverageComplete:false},
  rankingsPrecomputed:false,researchAccessPerformed:false,scientificValidityNotEstablishedBySignature:true};
}
function validateCatalog(c:ProductKnowledgeCatalog181):void{
 if(!c||c.phase!==181||c.schema!=='181.1'||![c.market,c.categoryId,c.knowledgeRevision,c.policyRevision,c.externalReviewReference].every(nameOK)||
  !stamp(c.reviewedAt)||!stamp(c.expiresAt)||Date.parse(c.expiresAt)<=Date.parse(c.reviewedAt)||
  c.marketCoverageComplete!==false||typeof c.coverageStatement!=='string'||c.coverageStatement.length<12||c.coverageStatement.length>700||
  !Array.isArray(c.discoveredVariantIds)||c.discoveredVariantIds.length<1||c.discoveredVariantIds.length>1500||
  !c.discoveredVariantIds.every(nameOK)||!distinct(c.discoveredVariantIds)||
  !Array.isArray(c.dimensions)||c.dimensions.length>120||!Array.isArray(c.products)||c.products.length>1500||
  !Array.isArray(c.originalTests)||c.originalTests.length>10000)throw Error('phase181_bad_catalog');
 const discovered=new Set(c.discoveredVariantIds);
 const definitions=new Map<string,KnowledgeDimension181>();
 for(const d of c.dimensions){
  if(!nameOK(d?.key)||definitions.has(d.key)||typeof d.label!=='string'||d.label.trim()!==d.label||d.label.length<3||d.label.length>300||
   !nameOK(d.methodId)||!nameOK(d.protocolVersion)||!nameOK(d.weightingReviewReference)||!nameOK(d.normalizationReviewReference)||
   !d.weightUnits||Object.getPrototypeOf(d.weightUnits)!==Object.prototype||
   Object.keys(d.weightUnits).sort().join(',')!=='hard,high,low,normal'||
   priority.some(p=>!number(d.weightUnits[p],1,100000))||!d.value||typeof d.value!=='object')throw Error('phase181_bad_dimension');
  // Prevent exotic prototypes and undefined numbers from entering trusted JSON.
  canonicalJson180(d.value);definitions.set(d.key,d);
 }
 const tests=new Map<string,OriginalTest181>();
 for(const e of c.originalTests){
  if(!nameOK(e?.id)||tests.has(e.id)||!discovered.has(e.variantId)||!definitions.has(e.dimensionKey)||
   !nameOK(e.originalTestId)||!nameOK(e.methodId)||!nameOK(e.protocolVersion)||
   !urlOK(e.sourceUrl)||!stamp(e.observedAt)||Date.parse(e.observedAt)>Date.parse(c.reviewedAt)||
   !['exact_variant_original_professional_test','named_product_original_professional_test'].includes(e.scope)||
   (e.measured!==undefined&&(!e.measured||typeof e.measured.value!=='number'||!Number.isFinite(e.measured.value)||!nameOK(e.measured.unit)||
    !['lower_is_better','higher_is_better'].includes(e.measured.direction)))||
   (e.limitations!==undefined&&(!Array.isArray(e.limitations)||e.limitations.length>TEST_LIMITATIONS181.length||!e.limitations.every((l:string)=>(TEST_LIMITATIONS181 as readonly string[]).includes(l)))))throw Error('phase181_bad_test');
  tests.set(e.id,e);
 }
 const products=new Set<string>();
 for(const p of c.products){
  if(!nameOK(p?.variantId)||products.has(p.variantId)||!discovered.has(p.variantId)||
   typeof p.name!=='string'||p.name.trim().length<2||p.name.length>180||
   !Array.isArray(p.observations)||p.observations.length>120||
   !distinct(p.observations.map((o:ProductObservation181)=>o.dimensionKey)))throw Error('phase181_bad_product');
  products.add(p.variantId);
  for(const o of p.observations){
   const e=tests.get(o.evidenceId),d=definitions.get(o.dimensionKey);
   if(!d||!number(o.valuePoints)||!['pass','fail','unknown'].includes(o.hardOutcome)||!e||
    e.variantId!==p.variantId||e.dimensionKey!==o.dimensionKey||e.methodId!==d.methodId||
    e.protocolVersion!==d.protocolVersion||o.hardOutcome==='unknown'&&o.valuePoints!==0)
    throw Error('phase181_wrong_product_protocol_or_measurement');
  }
 }
}
function verifiedCatalog(envelope:SignedCatalog181|null,authority:TrustedRankingAuthority180):ProductKnowledgeCatalog181|null{
 if(!envelope||!nameOK(envelope.keyId)||!authority.publicKeys||
  !Object.prototype.hasOwnProperty.call(authority.publicKeys,envelope.keyId)||
  typeof envelope.signatureBase64!=='string'||!/^[a-zA-Z0-9+/]+={0,2}$/.test(envelope.signatureBase64))return null;
 try{
  const signature=Buffer.from(envelope.signatureBase64,'base64');
  if(signature.length!==64||!verify(null,Buffer.from(canonicalJson180(envelope.catalog)),
   createPublicKey(authority.publicKeys[envelope.keyId]),signature))return null;
  validateCatalog(envelope.catalog);return envelope.catalog;
 }catch{return null;}
}
/** No rank is part of the signed catalog. Each changed criterion/priority reranks
 * the same trusted per-product knowledge on demand. External source/policy review
 * remains a mandatory upstream process, not a boolean passed by the shopper.
 */
export function dynamicKnowledgeAnswer181(args:{snapshot:DecisionSnapshot177;catalog:SignedCatalog181|null;
 authority:TrustedRankingAuthority180;requestedVariantId?:string}):DynamicDecision181{
 const {snapshot,authority}=args;assertDecisionSnapshot177(snapshot);
 if(!authority||!stamp(authority.asOf)||!nameOK(authority.market)||!authority.publicKeys||
  Object.getPrototypeOf(authority.publicKeys)!==Object.prototype)throw Error('phase181_invalid_authority');
 if(args.requestedVariantId!==undefined&&!nameOK(args.requestedVariantId))throw Error('phase181_invalid_product_id');
 if(!['product_selection','solution_comparison'].includes(snapshot.scope.task)||!snapshot.scope.category)
  return pending(snapshot,[gap('scope_unconfirmed',snapshot.scope.category??'category','Confirm the product-selection category or investigate a goal-to-solution route.')],
   'The requested shopping category is not established.');
 const confirmed=snapshot.criteria.filter(c=>c.status==='confirmed');
 const c=verifiedCatalog(args.catalog,authority);
 if(!c){return pending(snapshot,[gap(args.catalog?'need_review':'no_catalog',snapshot.scope.category,
  'Acquire, verify and independently approve original per-product evidence; do not invent a ranking.')],
  'No authenticated per-product knowledge is available for this category.');}
 if(c.categoryId!==snapshot.scope.category||c.market!==authority.market)
  return pending(snapshot,[gap('new_category',snapshot.scope.category,
   'Investigate this category and market using the existing Phase129/179 category research cycle.')],
   'The available catalog addresses a different category or market.');
 if(Date.parse(authority.asOf)<Date.parse(c.reviewedAt)||Date.parse(authority.asOf)>Date.parse(c.expiresAt))
  return pending(snapshot,[gap('stale_knowledge',c.knowledgeRevision,'Refresh expired or future-dated product evidence through independent source review.')],
   'The product knowledge revision is not currently valid.');
 if(!confirmed.length)return pending(snapshot,[gap('unconfirmed_need',snapshot.scope.category,
  'Confirm the criterion that materially affects the choice before publishing a personalized ranking.')],
  'Unconfirmed language hypotheses cannot authorize product ranking.');
 const definitions=new Map(c.dimensions.map(x=>[x.key,x]));
 const missing=confirmed.filter(x=>{const d=definitions.get(x.key);return !d||d.label!==x.label||canonicalJson180(d.value)!==canonicalJson180(x.value);});
 if(missing.length){return pending(snapshot,missing.map(x=>gap('missing_criterion',x.key,
  'Study this exact goal/value and validate its required tests and policy; do not ignore an unrecognized need.')),
  'The verified knowledge does not cover every confirmed requirement.');}
 const weights=new Map(confirmed.map(x=>[x.key,definitions.get(x.key)!.weightUnits[x.priority]]));
 const weightSum=[...weights.values()].reduce((a,b)=>a+b,0);
 const evidence=new Map(c.originalTests.map(x=>[x.id,x]));
 const productMap=new Map(c.products.map(x=>[x.variantId,x]));
 const ranked:DynamicDecision181['ranked'][number][]=[],held:DynamicDecision181['held'][number][]=[],gaps:ResearchGap181[]=[];
 for(const p of c.products){
  const observations=new Map(p.observations.map(x=>[x.dimensionKey,x]));
  const failed=confirmed.find(x=>x.priority==='hard'&&observations.get(x.key)?.hardOutcome==='fail');
  if(failed){held.push({variantId:p.variantId,name:p.name,reason:`Evidence shows failure of essential criterion: ${failed.key}`});continue;}
  const uncertain=confirmed.find(x=>!observations.has(x.key)||
   observations.get(x.key)?.hardOutcome==='unknown'||
   (x.priority==='hard'&&observations.get(x.key)?.hardOutcome!=='pass'));
  if(uncertain){held.push({variantId:p.variantId,name:p.name,reason:`Required comparative evidence or essential compatibility is missing: ${uncertain.key}`});
   gaps.push(gap('missing_test',`${p.variantId}:${uncertain.key}`,'Locate and review an original protocol-compatible test for this exact variant and requirement.'));continue;}
  const refs=confirmed.map(x=>evidence.get(observations.get(x.key)!.evidenceId)!);
  const scorePoints=Math.round(confirmed.reduce((sum,x)=>sum+observations.get(x.key)!.valuePoints*weights.get(x.key)!,0)/weightSum);
  ranked.push({variantId:p.variantId,name:p.name,rank:0,scorePoints,
   originalTestIds:[...new Set(refs.map(r=>r.originalTestId))].sort(),
   sourceUrls:[...new Set(refs.map(r=>r.sourceUrl))].sort()});
 }
 for(const variantId of c.discoveredVariantIds){if(!productMap.has(variantId)){
  held.push({variantId,name:variantId,reason:'Discovered, but no independently reviewed exact-product evidence.'});
  gaps.push(gap('missing_product',variantId,'Investigate the exact product/variant, its test protocols and source custody.'));
 }}
 if(args.requestedVariantId&&!c.discoveredVariantIds.includes(args.requestedVariantId))
  gaps.push(gap('missing_product',args.requestedVariantId,'Investigate the explicitly requested product even if it is not yet in the catalog.'));
 ranked.sort((a,b)=>b.scorePoints-a.scorePoints||a.variantId.localeCompare(b.variantId,'en'));
 ranked.forEach((v,i)=>{v.rank=i>0&&v.scorePoints===ranked[i-1].scorePoints?ranked[i-1].rank:i+1;});
 held.sort((a,b)=>a.variantId.localeCompare(b.variantId,'en'));
 const uniqGaps=[...new Map(gaps.map(g=>[`${g.kind}:${g.reference}`,g])).values()].sort((a,b)=>
  `${a.kind}:${a.reference}`.localeCompare(`${b.kind}:${b.reference}`,'en'));
 const reviewed=c.products.length;
 return {phase:181,language:'en',source:'signed_product_knowledge',
  status:ranked.length?'ranking_ready':'research_required',
  firstLayer:ranked.length?[`Best fit among ${ranked.length} evidenced candidates for the confirmed requirements: ${ranked[0].name}.`,
   'The order was calculated from reviewed per-product knowledge for this decision, not retrieved from a precomputed ranking.']:
   ['No product meets the available evidence requirements for a supported ranking.'],
  visibleCautions:[`The research recorded ${c.discoveredVariantIds.length} candidates; complete market coverage is not established.`,
   ...(held.length?[`${held.length} candidates remain unranked or fail requirements.`]:[]),
   'The authentic signature does not independently establish scientific quality of the underlying tests or scoring policy.'],
  rankInputFingerprint:snapshot.rankInputFingerprint,knowledgeRevision:c.knowledgeRevision,policyRevision:c.policyRevision,
  ranked,held,researchGaps:uniqGaps,
  coverage:{discovered:c.discoveredVariantIds.length,reviewed,notYetReviewed:c.discoveredVariantIds.length-reviewed,marketCoverageComplete:false},
  rankingsPrecomputed:false,researchAccessPerformed:false,scientificValidityNotEstablishedBySignature:true};
}
