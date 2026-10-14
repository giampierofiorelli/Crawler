/** Phase187: reusable, signed field-level evidence and conditional suitability.
 * This is a separately reviewed field policy, NOT a scientific certification engine.
 * It retains existing Phase181 original-test rank, Phase185 display-only facts,
 * and Phase186 AC pilot as distinct evidence lanes. No source becomes self-authorizing.
 */
import {createPublicKey,verify} from 'node:crypto';
import {canonicalJson180,type TrustedRankingAuthority180} from './phase180_reviewed_first_answer.js';
import type {DynamicDecision181} from './phase181_dynamic_knowledge_ranking.js';
import type {DisplayProjection185} from './phase185_registry_evidence_review.js';
import type {TieredDecision186} from './phase186_tiered_specification_suitability.js';

export type SourceClass187='manufacturer_specification'|'certified_or_verified_register'|'independent_professional_test';
export type FieldKind187='numeric_minimum'|'exact_certified_claim';
export interface FieldPolicy187 {
 id:string;kind:FieldKind187;dimension:string;unit:string;protocolId:string;protocolVersion:string;
 /** A user cannot invent thresholds. They belong to this externally reviewed use profile. */
 threshold:number|null;thresholdMax:number|null;claim:string|null;profileId:string;
 /** Explicit dimension-only comparison, never an overall product comparison. */
 comparison:'no_order'|'higher_certified_value'|'lower_certified_value';
 /** The signed domain policy states which evidence classes can establish this field. */
 acceptedForFit:readonly Exclude<SourceClass187,'manufacturer_specification'>[];
 reviewReference:string;reviewedApplicability:string;
}
export interface FieldObservation187 {
 id:string;variantId:string;dimension:string;value:number|string;unit:string;
 protocolId:string;protocolVersion:string;sourceClass:SourceClass187;
 sourceUrl:string;originalSha256:string;originalLocator:string;
 sourceRightsReference:string;identityReviewReference:string;
 /** A derived quantity may be shown but cannot independently affect a comparison. */
 derivedFrom:string|null;
}
export interface FieldVariant187 {id:string;name:string;observations:readonly FieldObservation187[];}
export interface FieldCatalog187 {
 phase:187;schema:'187.1';market:string;category:string;revision:string;reviewedAt:string;expiresAt:string;
 externalReviewer:string;rightsAuditReference:string;coverageStatement:string;marketCoverageComplete:false;
 policies:readonly FieldPolicy187[];variants:readonly FieldVariant187[];
}
export interface SignedFieldCatalog187 {catalog:FieldCatalog187;keyId:string;signatureBase64:string;}
export interface FieldGoal187 {market:string;category:string;profileId:string;confirmedByUser:true;}
export interface FieldRow187 {variantId:string;name:string;value:number|string|null;
 sourceClass:SourceClass187|null;sourceUrl:string|null;
 disposition:'reviewed_field_fit'|'provisional_manufacturer_fit'|'inadequate_for_field'|'manufacturer_indicated_below_requirement'|'missing_field'|'conflict_or_method_mismatch';
 explanation:string;}
export interface FieldDecision187 {
 phase:187;language:'en';status:'bounded_field_comparison'|'research_required';
 comparedDimension:string|null;comparisonScope:string|null;
 /** Ranking is permitted only for the single explicitly reviewed field; ties keep equal rank. */
 ordered:readonly {variantId:string;rank:number;value:number;sourceUrl:string}[];
 compatible:readonly FieldRow187[];provisional:readonly FieldRow187[];held:readonly FieldRow187[];
 cautions:readonly string[];researchGaps:readonly string[];
 catalogRevision:string|null;policyReviewReference:string|null;
 noGeneralProductRanking:true;noIndependentReviewInferred:true;coverageNotProved:true;
}
const id=(v:unknown):v is string=>typeof v==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(v)&&!['__proto__','prototype','constructor'].includes(v);
const protocolVersion=(v:unknown)=>typeof v==='string'&&/^[a-z0-9][a-z0-9_.:-]{0,100}$/.test(v);
const stamp=(v:unknown):v is string=>typeof v==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(v)&&Number.isFinite(Date.parse(v));
const finite=(v:unknown)=>typeof v==='number'&&Number.isFinite(v);
const url=(s:unknown)=>{try{const u=new URL(s as string);return u.protocol==='https:'&&!u.username&&!u.password&&u.hostname.includes('.');}catch{return false;}};
const hash=(s:unknown)=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const warning=[
 'This compares one reviewed technical dimension only, not overall product quality.',
 'A reviewer signature does not independently establish publisher authenticity, scientific validity, source rights or retail-variant matching.',
 'Missing evidence is not a failing test result. Market coverage is not established.'
];
const notReady=(reason:string):FieldDecision187=>({phase:187,language:'en',status:'research_required',comparedDimension:null,comparisonScope:null,
 ordered:[],compatible:[],provisional:[],held:[],cautions:warning,researchGaps:[reason],catalogRevision:null,policyReviewReference:null,
 noGeneralProductRanking:true,noIndependentReviewInferred:true,coverageNotProved:true});
function validate(c:FieldCatalog187):void{
 if(!c||c.phase!==187||c.schema!=='187.1'||![c.market,c.category,c.revision,c.externalReviewer,c.rightsAuditReference].every(id)||
  !stamp(c.reviewedAt)||!stamp(c.expiresAt)||Date.parse(c.expiresAt)<=Date.parse(c.reviewedAt)||
  c.marketCoverageComplete!==false||typeof c.coverageStatement!=='string'||c.coverageStatement.trim().length<15||
  !Array.isArray(c.policies)||!c.policies.length||c.policies.length>50||
  !Array.isArray(c.variants)||!c.variants.length||c.variants.length>1000)throw Error('bad187_catalog');
 const profiles=new Set<string>();
 for(const p of c.policies){
  if(![p?.id,p?.dimension,p?.unit,p?.protocolId,p?.profileId,p?.reviewReference].every(id)||!protocolVersion(p?.protocolVersion)||
   typeof p.reviewedApplicability!=='string'||p.reviewedApplicability.length<12||profiles.has(p.profileId)||
   !Array.isArray(p.acceptedForFit)||!p.acceptedForFit.length||p.acceptedForFit.length>2||
   new Set(p.acceptedForFit).size!==p.acceptedForFit.length||
   p.acceptedForFit.some((x:SourceClass187)=>!['certified_or_verified_register','independent_professional_test'].includes(x))||
   !['numeric_minimum','exact_certified_claim'].includes(p.kind)||
   !['no_order','higher_certified_value','lower_certified_value'].includes(p.comparison)||
   (p.kind==='numeric_minimum'&&(!finite(p.threshold)||
    (p.thresholdMax!==null&&(!finite(p.thresholdMax)||p.thresholdMax<p.threshold!))||p.claim!==null))||
   (p.kind==='exact_certified_claim'&&(!id(p.claim)||p.threshold!==null||p.thresholdMax!==null||p.comparison!=='no_order')))
   throw Error('bad187_field_policy');
  profiles.add(p.profileId);
 }
 const variants=new Set<string>(), observations=new Set<string>();
 for(const v of c.variants){
  if(!id(v?.id)||variants.has(v.id)||typeof v.name!=='string'||v.name.trim().length<2||v.name.length>160||
   !Array.isArray(v.observations)||v.observations.length>100)throw Error('bad187_variant');
  variants.add(v.id);
  for(const o of v.observations){
   if(![o?.id,o?.variantId,o?.dimension,o?.unit,o?.protocolId,o?.originalLocator,o?.sourceRightsReference,o?.identityReviewReference].every(id)||!protocolVersion(o?.protocolVersion)||
    observations.has(o.id)||o.variantId!==v.id||!(finite(o.value)||id(o.value))||!url(o.sourceUrl)||!hash(o.originalSha256)||
    (o.derivedFrom!==null&&!id(o.derivedFrom))||
    !['manufacturer_specification','certified_or_verified_register','independent_professional_test'].includes(o.sourceClass))
    throw Error('bad187_observation');
   observations.add(o.id);
  }
 }
}
function authenticated(e:SignedFieldCatalog187|null,a:TrustedRankingAuthority180):FieldCatalog187|null{
 if(!e||!id(e.keyId)||!a?.publicKeys||!Object.prototype.hasOwnProperty.call(a.publicKeys,e.keyId)||
  typeof e.signatureBase64!=='string'||!/^[A-Za-z0-9+/]+={0,2}$/.test(e.signatureBase64))return null;
 try{const sig=Buffer.from(e.signatureBase64,'base64');
  if(sig.length!==64||!verify(null,Buffer.from(canonicalJson180(e.catalog)),createPublicKey(a.publicKeys[e.keyId]),sig))return null;
  validate(e.catalog);return e.catalog;
 }catch{return null;}
}
/** No source browsing and no unreviewed parameter inference in this function. */
export function compareFieldEvidence187(args:{goal:FieldGoal187;catalog:SignedFieldCatalog187|null;authority:TrustedRankingAuthority180}):FieldDecision187{
 const {goal,authority}=args;
 if(!goal||![goal.market,goal.category,goal.profileId].every(id)||goal.confirmedByUser!==true||
  !authority||!id(authority.market)||!stamp(authority.asOf)||!authority.publicKeys)throw Error('bad187_request');
 if(goal.market!==authority.market)return notReady('Market is not covered by the trusted reviewer.');
 const c=authenticated(args.catalog,authority);
 if(!c)return notReady('No authenticated and externally reviewed field catalog is available.');
 if(c.market!==goal.market||c.category!==goal.category)return notReady('The reviewed catalog applies to a different market or category.');
 if(Date.parse(authority.asOf)<Date.parse(c.reviewedAt)||Date.parse(authority.asOf)>Date.parse(c.expiresAt))return notReady('The field catalog is stale or future-dated.');
 const p=c.policies.find(p=>p.profileId===goal.profileId);
 if(!p)return notReady('The requested usage profile has no reviewed technical interpretation.');
 const compatible:FieldRow187[]=[],provisional:FieldRow187[]=[],held:FieldRow187[]=[],gaps:string[]=[];
 for(const v of c.variants){
  const relevant=v.observations.filter(o=>o.dimension===p.dimension);
  const matches=relevant.filter(o=>o.unit===p.unit&&o.protocolId===p.protocolId&&o.protocolVersion===p.protocolVersion&&o.derivedFrom===null&&
   (p.kind==='numeric_minimum'?typeof o.value==='number':typeof o.value==='string'));
  const conflicting=relevant.length!==matches.length||matches.length>1&&matches.some(o=>o.value!==matches[0].value);
  const unapprovedSource=matches.some(o=>o.sourceClass!=='manufacturer_specification'&&!p.acceptedForFit.includes(o.sourceClass));
  let row:FieldRow187={variantId:v.id,name:v.name,value:null,sourceClass:null,sourceUrl:null,disposition:'missing_field',explanation:'No reviewed comparable observation for this field.'};
  if(conflicting||unapprovedSource){row={...row,disposition:'conflict_or_method_mismatch',explanation:'Conflicting, derived or method-incompatible observations require reconciliation.'};}
  else if(matches.length){
   // Duplicate observations of the same value from one registry or replicated displays do not count twice.
   const independent=matches.find(o=>o.sourceClass==='independent_professional_test');
   const registry=matches.find(o=>o.sourceClass==='certified_or_verified_register');
   const selected=independent??registry??matches[0];
   const pass=p.kind==='numeric_minimum'?(Number(selected.value)>=p.threshold!&&
    (p.thresholdMax===null||Number(selected.value)<=p.thresholdMax)):selected.value===p.claim;
   const certified=selected.sourceClass!=='manufacturer_specification';
   row={...row,value:selected.value,sourceClass:selected.sourceClass,sourceUrl:selected.sourceUrl,
    disposition:!pass?(certified?'inadequate_for_field':'manufacturer_indicated_below_requirement'):certified?'reviewed_field_fit':'provisional_manufacturer_fit',
    explanation:!pass?(certified?'Reviewed measurement/claim does not meet this field requirement.':'Manufacturer-stated value appears below the requirement; verify before excluding this model.'):
     (certified?'Reviewed field evidence meets this limited requirement.':'Manufacturer-stated field match is provisional; verify original source and method.')};
  }
  if(row.disposition==='reviewed_field_fit')compatible.push(row);
  else if(row.disposition==='provisional_manufacturer_fit'){provisional.push(row);gaps.push(`${v.id}: verify manufacturer-stated fit independently or through applicable certification.`);}
  else {held.push(row);gaps.push(`${v.id}: ${row.disposition}; investigate exact-variant source and method.`);}
 }
 const sortRows=(rows:FieldRow187[])=>rows.sort((a,b)=>a.variantId<b.variantId?-1:a.variantId>b.variantId?1:0);
 sortRows(compatible);sortRows(provisional);sortRows(held);
 const ordered:FieldDecision187['ordered'][number][]=[];
 if(p.comparison!=='no_order'&&p.kind==='numeric_minimum'){
  const rows=compatible.filter(r=>typeof r.value==='number'&&r.sourceClass==='certified_or_verified_register'||
    typeof r.value==='number'&&r.sourceClass==='independent_professional_test');
  rows.sort((a,b)=>((p.comparison==='higher_certified_value'?-1:1)*(Number(a.value)-Number(b.value)))||
   (a.variantId<b.variantId?-1:a.variantId>b.variantId?1:0));
  for(let i=0;i<rows.length;i++)ordered.push({variantId:rows[i].variantId,rank:i&&rows[i].value===rows[i-1].value?ordered[i-1].rank:i+1,
   value:Number(rows[i].value),sourceUrl:rows[i].sourceUrl!});
  if(rows.length<compatible.length)gaps.push('Some field-suitable products lack an orderable comparable value.');
 }
 const cautions=[...warning,`Field: ${p.dimension}; protocol: ${p.protocolId} / ${p.protocolVersion}; review: ${p.reviewReference}.`,
  p.comparison==='no_order'?'No winner is inferred from field eligibility. Suitable products are tied on this requirement.':
   'The numerical order refers ONLY to this reviewed dimension; it is not a general best-product ranking.',
  ...(provisional.length?['Manufacturer-only matches remain visible but are not ranked as confirmed field fits.']:[])];
 return {phase:187,language:'en',status:compatible.length?'bounded_field_comparison':'research_required',comparedDimension:p.dimension,
  comparisonScope:p.reviewedApplicability,ordered,compatible,provisional,held,cautions,researchGaps:gaps.sort(),
  catalogRevision:c.revision,policyReviewReference:p.reviewReference,noGeneralProductRanking:true,noIndependentReviewInferred:true,coverageNotProved:true};
}
/** The existing original-professional-test rank, registry-fact display and AC
 * specification comparison remain DIFFERENT decisions. Never silently merge
 * scores/ranks or promote a display-only registry claim to ranking authority.
 */
export function projectEvidenceLanes187(args:{originalTestDecision?:DynamicDecision181;
 attributedFacts?:DisplayProjection185;acSizing?:TieredDecision186;fieldDecision?:FieldDecision187}){
 return {phase:187 as const,
  independentOriginalTestRanking:args.originalTestDecision?.status==='ranking_ready'?args.originalTestDecision.ranked:[],
  registryDisplayOnly:args.attributedFacts?.status==='source_attributed_facts_available'?args.attributedFacts.facts:[],
  roomAcSizingOnly:args.acSizing?.status==='conditional_specification_comparison'?args.acSizing.ordered:[],
  fieldSpecificOnly:args.fieldDecision?.status==='bounded_field_comparison'?args.fieldDecision.ordered:[],
  neverCombineRanksAutomatically:true as const,
  noEvidenceTierPromotion:true as const,
  notWebPublishableWithoutScopeBinding:true as const,
  warnings:[...new Set([...(args.originalTestDecision?.visibleCautions??[]),...(args.attributedFacts?.reasons??[]),
   ...(args.acSizing?.cautions??[]),...(args.fieldDecision?.cautions??[])])],
 };
}
