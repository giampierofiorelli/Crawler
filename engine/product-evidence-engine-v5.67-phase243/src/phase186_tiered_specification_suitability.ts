/** Phase186: evidence-aware TECHNICAL-SUITABILITY screen, not a general product winner.
 * A published capacity or certified efficiency measure can answer a specific
 * engineering question in the absence of an independent consumer review.
 * No universal source-quality percentages, inferred test results or hidden vetoes.
 * Signed inputs authenticate a reviewer, NOT scientific accuracy or legal rights.
 * Narrow US WINDOW room-AC pilot. Portable/SACC and UK systems are intentionally
 * incompatible with this calculation and require their own reviewed policy.
 */
import {createPublicKey, verify} from 'node:crypto';
import {canonicalJson180, type TrustedRankingAuthority180} from './phase180_reviewed_first_answer.js';

export type SourceTier186='manufacturer_technical_spec'|'certification_register'|'independent_lab_test';
export type Dimension186='rated_cooling_capacity'|'certified_ceer'|'tested_cooling_effectiveness';
export interface Observation186 {
 id:string; variantId:string; dimension:Dimension186; value:number; unit:'btu_per_hour'|'btu_per_watt_hour'|'degrees_f_per_hour';
 sourceTier:SourceTier186; sourceUrl:string; documentHash:string; protocolId:string;
 protocolVersion:string; originalReference:string; /** Claimed retail identity is reviewed upstream, not inferred by this module. */
}
export interface Variant186 {id:string;name:string;observations:readonly Observation186[];}
export interface SizingBand186 {minSquareFeet:number;maxSquareFeet:number;minCapacityBtuPerHour:number;maxCapacityBtuPerHour:number;}
export interface TieredEvidenceCatalog186 {
 phase:186;schema:'186.1';market:'us';category:'window_room_air_conditioner';
 knowledgeVersion:string;policyVersion:string;reviewReference:string;reviewedAt:string;expiresAt:string;
 sourceRightsReference:string;identityReviewReference:string;coverageStatement:string;
 capacityProtocolId:string;capacityProtocolVersion:string;
 /** Only an explicit audited lookup policy (not a capacity number supplied by the shopper). */
 sizingBands:readonly SizingBand186[];
 variants:readonly Variant186[];
}
export interface SignedEvidenceCatalog186 {catalog:TieredEvidenceCatalog186;keyId:string;signatureBase64:string;}
export interface Goal186 {
 market:'us';category:'window_room_air_conditioner';confirmation:'user_confirmed_web';squareFeet:number; ceilingFeet:number;
 exposure:'typical'|'unusually_sunny'|'heavily_shaded'|'unknown';
 additionalHeatLoad:'no_known_extra'|'present'|'unknown';
 /** CEER is a specific energy-efficiency dimension, not a proxy for cooling, comfort or best overall. */
 comparison:'suitability_only'|'certified_efficiency';
}
export interface ScreenRow186 {variantId:string;name:string;
 outcome:'sized_from_certified_capacity'|'manufacturer_indicated_only'|'capacity_below_guidance'|'capacity_above_guidance'|'missing_capacity'|'conflicting_evidence';
 capacityBtuPerHour:number|null;capacityTier:SourceTier186|null;
 ceer:number|null;ceerSourceUrl:string|null;
 evidenceUrls:readonly string[];cautions:readonly string[];}
export interface OrderRow186 {variantId:string;name:string;rank:number;ceer:number|null;comparisonBasis:'certified_ceer_only'|'same_suitability_tier';evidenceUrls:readonly string[];}
export interface TieredDecision186 {
 phase:186;status:'conditional_specification_comparison'|'research_required';
 ordered:readonly OrderRow186[];screened:readonly ScreenRow186[];provisional:readonly ScreenRow186[];held:readonly ScreenRow186[];
 cautions:readonly string[];researchGaps:readonly string[];policyVersion:string|null;knowledgeVersion:string|null;
 noIndependentConsumerCoolingReviewAssumed:true;notAGeneralBestProductRanking:true;marketCoverageComplete:false;
 researchAccessPerformed:false;}
const id=(x:unknown):x is string=>typeof x==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(x)&&!['__proto__','constructor','prototype'].includes(x);
const time=(x:unknown):x is string=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(x)&&Number.isFinite(Date.parse(x));
const sha=(x:unknown)=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const positive=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)&&x>0;
const url=(x:unknown)=>{try{const u=new URL(x as string);return u.protocol==='https:'&&!u.username&&!u.password&&u.hostname.length>3;}catch{return false;}};
function validate(c:TieredEvidenceCatalog186){
 if(!c||c.phase!==186||c.schema!=='186.1'||c.market!=='us'||c.category!=='window_room_air_conditioner'||
  ![c.knowledgeVersion,c.policyVersion,c.reviewReference,c.sourceRightsReference,c.identityReviewReference,c.capacityProtocolId,c.capacityProtocolVersion].every(id)||
  !time(c.reviewedAt)||!time(c.expiresAt)||Date.parse(c.expiresAt)<=Date.parse(c.reviewedAt)||
  typeof c.coverageStatement!=='string'||c.coverageStatement.length<15||!Array.isArray(c.sizingBands)||
  !c.sizingBands.length||c.sizingBands.length>40||!Array.isArray(c.variants)||c.variants.length>1200)throw Error('bad186_catalog');
 const bands=[...c.sizingBands].sort((a,b)=>a.minSquareFeet-b.minSquareFeet);
 for(let i=0;i<bands.length;i++){
  const b=bands[i];if(!positive(b.minSquareFeet)||!positive(b.maxSquareFeet)||b.maxSquareFeet<=b.minSquareFeet||
   !positive(b.minCapacityBtuPerHour)||!positive(b.maxCapacityBtuPerHour)||b.maxCapacityBtuPerHour<b.minCapacityBtuPerHour||
   (i>0&&b.minSquareFeet<bands[i-1].maxSquareFeet))throw Error('bad186_sizing_bands');
 }
 const ids=new Set<string>(),observedIds=new Set<string>();
 for(const v of c.variants){
  if(!id(v?.id)||ids.has(v.id)||typeof v.name!=='string'||v.name.length<3||v.name.length>160||
   !Array.isArray(v.observations)||v.observations.length>30)throw Error('bad186_variant');
  ids.add(v.id);
  for(const o of v.observations){
   if(!id(o?.id)||observedIds.has(o.id)||o.variantId!==v.id||!positive(o.value)||!url(o.sourceUrl)||!sha(o.documentHash)||
    (o.sourceTier==='certification_register'&&new URL(o.sourceUrl).hostname!=='www.energystar.gov')||
    !id(o.protocolId)||!id(o.protocolVersion)||!id(o.originalReference)||
    !['rated_cooling_capacity','certified_ceer','tested_cooling_effectiveness'].includes(o.dimension)||
    !['manufacturer_technical_spec','certification_register','independent_lab_test'].includes(o.sourceTier)||
    (o.dimension==='rated_cooling_capacity'&&(o.unit!=='btu_per_hour'||o.sourceTier==='independent_lab_test'))||
    (o.dimension==='certified_ceer'&&(o.unit!=='btu_per_watt_hour'||o.sourceTier!=='certification_register'))||
    (o.dimension==='tested_cooling_effectiveness'&&(o.unit!=='degrees_f_per_hour'||o.sourceTier!=='independent_lab_test')))
    throw Error('bad186_evidence_identity_method_or_unit');
   observedIds.add(o.id);
  }
 }
}
function authenticated(s:SignedEvidenceCatalog186|null,a:TrustedRankingAuthority180):TieredEvidenceCatalog186|null{
 if(!s||!a||!a.publicKeys||!id(s.keyId)||!Object.prototype.hasOwnProperty.call(a.publicKeys,s.keyId)||
  typeof s.signatureBase64!=='string'||!/^[A-Za-z0-9+/]+={0,2}$/.test(s.signatureBase64))return null;
 try{const signature=Buffer.from(s.signatureBase64,'base64');if(signature.length!==64||
   !verify(null,Buffer.from(canonicalJson180(s.catalog)),createPublicKey(a.publicKeys[s.keyId]),signature))return null;
  validate(s.catalog);return s.catalog;}catch{return null;}
}
const baseCautions=[
 'A specification-based comparison is not a measured whole-product performance ranking.',
 'Source authenticity, legal reuse, product identity, sizing guidance and scoring relevance require external domain review; a signature alone does not prove them.',
 'Missing tests or data do not mean poor product performance. Market coverage is not established.',
];
function notReady(gaps:string[]):TieredDecision186{return {phase:186,status:'research_required',ordered:[],screened:[],provisional:[],held:[],cautions:baseCautions,researchGaps:gaps,
 policyVersion:null,knowledgeVersion:null,noIndependentConsumerCoolingReviewAssumed:true,notAGeneralBestProductRanking:true,marketCoverageComplete:false,researchAccessPerformed:false};}
/** Narrow conditional comparison. Eligibility uses certified rated capacity within
 * an externally reviewed sizing band. Manufacturer-only capacities are visible
 * as leads for verification, not quietly transformed into passes. A user wanting
 * solar/heat-load corrections must get proper load analysis rather than an
 * unjustified multiplication factor. CEER comparisons require same test protocol.
 */
export function compareRoomAcSpecifications186(input:{goal:Goal186;reviewedCatalog:SignedEvidenceCatalog186|null;authority:TrustedRankingAuthority180}):TieredDecision186{
 const {goal,authority}=input;
 if(!goal||goal.market!=='us'||goal.category!=='window_room_air_conditioner'||goal.confirmation!=='user_confirmed_web'||!positive(goal.squareFeet)||goal.squareFeet>10000||
  !positive(goal.ceilingFeet)||!['typical','unusually_sunny','heavily_shaded','unknown'].includes(goal.exposure)||
  !['no_known_extra','present','unknown'].includes(goal.additionalHeatLoad)||
  !['suitability_only','certified_efficiency'].includes(goal.comparison))throw Error('bad186_goal');
 if(!authority||authority.market!=='us'||!time(authority.asOf))throw Error('bad186_authority');
 if(goal.ceilingFeet!==8||goal.exposure!=='typical'||goal.additionalHeatLoad!=='no_known_extra')
  return notReady(['Room cooling-load guidance requires a reviewed adjustment for ceiling height, solar exposure, occupants or other heat gains. Do not apply unreviewed factors.']);
 const c=authenticated(input.reviewedCatalog,authority);
 if(!c)return notReady(['Acquire and externally review a valid, signed exact-product specification catalog and sizing policy.']);
 if(Date.parse(authority.asOf)<Date.parse(c.reviewedAt)||Date.parse(authority.asOf)>Date.parse(c.expiresAt))
  return notReady(['Refresh or reconcile stale or future-dated specification and sizing evidence.']);
 const band=c.sizingBands.find(b=>goal.squareFeet>=b.minSquareFeet&&goal.squareFeet<b.maxSquareFeet);
 if(!band)return notReady(['No reviewed guidance band covers this room size; obtain an appropriate cooling-load assessment.']);
 const eligible:ScreenRow186[]=[],provisional:ScreenRow186[]=[],held:ScreenRow186[]=[],gaps:string[]=[];
 for(const v of c.variants){
  const capacity=v.observations.filter(o=>o.dimension==='rated_cooling_capacity');
  const certified=capacity.filter(o=>o.sourceTier==='certification_register'&&o.protocolId===c.capacityProtocolId&&o.protocolVersion===c.capacityProtocolVersion);
  const unmatched=capacity.filter(o=>o.sourceTier==='certification_register'&&(o.protocolId!==c.capacityProtocolId||o.protocolVersion!==c.capacityProtocolVersion));
  const specs=capacity.filter(o=>o.sourceTier==='manufacturer_technical_spec');
  let row:ScreenRow186={variantId:v.id,name:v.name,outcome:'missing_capacity',capacityBtuPerHour:null,capacityTier:null,
   ceer:null,ceerSourceUrl:null,evidenceUrls:[],cautions:[]};
  // Disagreements or duplicate records require source-specific adjudication.
  if(unmatched.length||certified.length>1||specs.length>1||(certified.length&&specs.length&&certified[0].value!==specs[0].value)){
   row={...row,outcome:'conflicting_evidence',cautions:['Multiple, non-comparable or contradictory capacity values need a source/method review.']};
  }else{
   const selected=certified[0]??specs[0];
   if(selected){
    row={...row,capacityBtuPerHour:selected.value,capacityTier:selected.sourceTier,evidenceUrls:[selected.sourceUrl]};
    if(!certified.length){row.outcome='manufacturer_indicated_only';row.cautions=['Capacity is manufacturer-stated; verify model identity and rating method before confirming suitability.'];}
    else if(selected.value<band.minCapacityBtuPerHour){row.outcome='capacity_below_guidance';row.cautions=['Certified cooling capacity is below this reviewed sizing band.'];}
    else if(selected.value>band.maxCapacityBtuPerHour){row.outcome='capacity_above_guidance';row.cautions=['Potential oversizing; larger capacity is not automatically better for humidity or efficiency.'];}
    else row.outcome='sized_from_certified_capacity';
   }
  }
  if(row.outcome==='sized_from_certified_capacity'){
   const candidates=v.observations.filter(o=>o.dimension==='certified_ceer');
   if(candidates.length===1){row.ceer=candidates[0].value;row.ceerSourceUrl=candidates[0].sourceUrl;row.evidenceUrls=[...new Set([...row.evidenceUrls,candidates[0].sourceUrl])].sort();}
   else if(candidates.length>1){row.outcome='conflicting_evidence';row.ceer=null;row.cautions=['Duplicate efficiency observations require reconciliation.'];}
  }
  if(row.outcome==='sized_from_certified_capacity')eligible.push(row);
  else if(row.outcome==='manufacturer_indicated_only'&&row.capacityBtuPerHour!==null&&
   row.capacityBtuPerHour>=band.minCapacityBtuPerHour&&row.capacityBtuPerHour<=band.maxCapacityBtuPerHour){
   provisional.push(row);gaps.push(`${v.id}: manufacturer-only capacity fit: confirm exact-variant certification and rating method.`);
  }else {held.push(row);gaps.push(`${v.id}: ${row.outcome} — investigate exact-variant capacity, installation and test conditions.`);}
 }
 eligible.sort((a,b)=>a.variantId.localeCompare(b.variantId,'en'));provisional.sort((a,b)=>a.variantId.localeCompare(b.variantId,'en'));held.sort((a,b)=>a.variantId.localeCompare(b.variantId,'en'));
 const order:OrderRow186[]=[];
 if(goal.comparison==='certified_efficiency'){
  const ceerEvidence=eligible.map(e=>({e,o:c.variants.find(v=>v.id===e.variantId)!.observations.find(o=>o.dimension==='certified_ceer')}));
  // CEER values from different procedures cannot be compared, even if both are certified.
  const withCeer=ceerEvidence.filter(x=>x.o&&x.e.ceer!==null);
  const protocols=new Set(withCeer.map(x=>`${x.o!.protocolId}:${x.o!.protocolVersion}`));
  if(protocols.size>1){gaps.push('Certification efficiency observations have incompatible methods or versions; no efficiency order is supported.');}
  else{
   withCeer.sort((a,b)=>b.e.ceer!-a.e.ceer!||a.e.variantId.localeCompare(b.e.variantId,'en'));
   withCeer.forEach(({e},i)=>order.push({variantId:e.variantId,name:e.name,rank:i>0&&e.ceer===withCeer[i-1].e.ceer?order[i-1].rank:i+1,
    ceer:e.ceer,comparisonBasis:'certified_ceer_only',evidenceUrls:e.evidenceUrls}));
  }
  for(const e of eligible)if(e.ceer===null)gaps.push(`${e.variantId}: missing comparable certified CEER; not treated as inefficient.`);
 }else{
  // A capacity band is a feasibility condition, NOT a numeric preference for
  // greater nominal capacity. All eligible candidates tie unless another
  // separately reviewed preference is provided.
  for(const e of eligible)order.push({variantId:e.variantId,name:e.name,rank:1,ceer:e.ceer,
   comparisonBasis:'same_suitability_tier',evidenceUrls:e.evidenceUrls});
 }
 const cautions=[...baseCautions,`Sizing guidance: ${band.minSquareFeet}–${band.maxSquareFeet} sq ft; nominal cooling band ${band.minCapacityBtuPerHour}–${band.maxCapacityBtuPerHour} Btu/h.`,
  goal.comparison==='certified_efficiency'?'The displayed order compares certified CEER ONLY, not cooling speed, noise, reliability or general best product.':'All eligible capacities are tied: additional original tests or stated preferences are required to choose the best product.',
  ...(provisional.length?['Manufacturer-only capacity matches are displayed in a separate provisional group, NOT ranked as certified matches.']:[]),
  ...(!order.length?['No justified comparative order is available for these conditions.']:[])];
 return {phase:186,status:order.length?'conditional_specification_comparison':'research_required',ordered:order,screened:eligible,provisional,held,
  cautions,researchGaps:[...new Set(gaps)].sort(),knowledgeVersion:c.knowledgeVersion,policyVersion:c.policyVersion,
  noIndependentConsumerCoolingReviewAssumed:true,notAGeneralBestProductRanking:true,marketCoverageComplete:false,researchAccessPerformed:false};
}
