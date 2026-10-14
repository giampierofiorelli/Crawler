/** Phase188: deterministic, read-only argument/provenance audit of a Phase187
 * reviewer-authorized field comparison. Inspired by (not copied from) the
 * Carneades argument model, GRADE-CERQual questions and W3C PROV-O.
 * This module NEVER authorizes a ranking, evidence intake or website display.
 * Its signed review records contextual observations and their derivations.
 */
import {createPublicKey,verify} from 'node:crypto';
import {canonicalJson180,type TrustedRankingAuthority180} from './phase180_reviewed_first_answer.js';
import {compareFieldEvidence187,type FieldGoal187,type FieldCatalog187,type SignedFieldCatalog187,
 type FieldDecision187,type FieldObservation187} from './phase187_field_evidence_bridge.js';

export type ArgumentKind188='certified_measurement'|'independent_measurement'|'manufacturer_specification'|
 'structured_expert_observation'|'contextual_expert_observation'|'editorial_inference';
export type Stance188='for'|'against';
export interface Argument188 {
 id:string;claimId:string;variantId:string;fieldId:string;stance:Stance188;
 kind:ArgumentKind188;sourceGroupId:string;rootSourceId:string;
 sourceUrl:string;originalSha256:string;originalLocator:string;
 methodReference:string;context:string;
 /** Exact ID from signed Phase187 document, null for separate reviewed commentary. */
 observationId:string|null;
 /** Derived comments point at earlier arguments; they are never new independent experiments. */
 derivedFrom:readonly string[];
}
export interface Claim188 {id:string;variantId:string;fieldId:string;statement:string;useProfileId:string;}
export interface ArgumentLedger188 {
 phase:188;schema:'188.1';market:string;category:string;revision:string;fieldCatalogRevision:string;
 reviewedAt:string;expiresAt:string;reviewReference:string;rightsReference:string;
 reviewer:string;coverageStatement:string;claims:readonly Claim188[];arguments:readonly Argument188[];
}
export interface SignedArgumentLedger188 {ledger:ArgumentLedger188;keyId:string;signatureBase64:string;}
export type Conclusion188='limited_field_support'|'field_inadequate'|'contested'|'provisional'|'undetermined';
export interface ClaimAudit188 {
 claimId:string;variantId:string;fieldId:string;state:Conclusion188;
 /** Counts are provenance diagnostics, NOT vote totals or confidence scores. */
 reviewerDeclaredSourceGroups:number;duplicateOrDerivedArguments:number;
 supportingRootGroups:readonly string[];challengingRootGroups:readonly string[];
 qualitativeSignals:readonly string[];editorialInterpretations:readonly string[];
 reasons:readonly string[];researchGaps:readonly string[];
}
export interface ReasoningAudit188 {
 phase:188;language:'en';status:'audited'|'research_required';
 fieldDecision:FieldDecision187;ledgerRevision:string|null;
 claims:readonly ClaimAudit188[];warnings:readonly string[];researchGaps:readonly string[];
 noGeneralProductRanking:true;noProbabilityEstimates:true;noAutomaticEvidenceAdmission:true;
 noClaimOfIndependenceWithoutExternalReview:true;
}
const id=(v:unknown):v is string=>typeof v==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(v)&&!['constructor','prototype','__proto__'].includes(v);
const stamp=(v:unknown)=>typeof v==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(v)&&Number.isFinite(Date.parse(v));
const text=(v:unknown,min=10,max=500)=>typeof v==='string'&&v.length>=min&&v.length<=max&&v.trim()===v;
const hash=(v:unknown)=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const url=(v:unknown)=>typeof v==='string'&&v.length<2048&&/^https:\/\/[^\s/?#]+\//.test(v);
const unique=(arr:readonly string[])=>new Set(arr).size===arr.length;
const kindSet:ArgumentKind188[]=['certified_measurement','independent_measurement','manufacturer_specification',
 'structured_expert_observation','contextual_expert_observation','editorial_inference'];
const kindSource:Partial<Record<ArgumentKind188,FieldObservation187['sourceClass']>>={
 certified_measurement:'certified_or_verified_register',independent_measurement:'independent_professional_test',
 manufacturer_specification:'manufacturer_specification'};
const warnings=[
 'An argument graph explains source dependencies; it does not measure scientific certainty or establish source independence.',
 'A reviewer signature authenticates submitted metadata, not the truth of a review, exact retail identity or source rights.',
 'Editorial repetitions are not additional tests; structured expert experience is not an instrument measurement.',
 'Neither this audit nor a source count changes the Phase187 field verdict or creates an overall product ranking.'];
function withheld(decision:FieldDecision187,reason:string):ReasoningAudit188{return {
 phase:188,language:'en',status:'research_required',fieldDecision:decision,ledgerRevision:null,claims:[],
 warnings,researchGaps:[reason],noGeneralProductRanking:true,noProbabilityEstimates:true,
 noAutomaticEvidenceAdmission:true,noClaimOfIndependenceWithoutExternalReview:true};}
function validatedLedger(l:ArgumentLedger188,c:FieldCatalog187,g:FieldGoal187):void{
 if(!l||l.phase!==188||l.schema!=='188.1'||l.market!==g.market||l.category!==g.category||
 l.fieldCatalogRevision!==c.revision||![l.revision,l.reviewReference,l.rightsReference,l.reviewer].every(id)||
 !stamp(l.reviewedAt)||!stamp(l.expiresAt)||Date.parse(l.reviewedAt)<Date.parse(c.reviewedAt)||
 Date.parse(l.expiresAt)<=Date.parse(l.reviewedAt)||!text(l.coverageStatement,15,1000)||
 !Array.isArray(l.claims)||l.claims.length<1||l.claims.length>200||!Array.isArray(l.arguments)||l.arguments.length>1500)
 throw Error('bad188_ledger');
 const variants=new Map(c.variants.map(v=>[v.id,v]));
 const policy=c.policies.find(p=>p.profileId===g.profileId);
 if(!policy)throw Error('unknown188_policy');
 const claims=new Map<string,Claim188>();
 for(const q of l.claims){
  if(![q?.id,q?.variantId,q?.fieldId,q?.useProfileId].every(id)||claims.has(q.id)||!variants.has(q.variantId)||
    q.fieldId!==policy.dimension||q.useProfileId!==g.profileId||!text(q.statement,12,500))throw Error('bad188_claim');
  claims.set(q.id,q);
 }
 const nodes=new Map<string,Argument188>();
 for(const n of l.arguments){
  const q=claims.get(n?.claimId);if(!q||![n?.id,n?.variantId,n?.fieldId,n?.sourceGroupId,n?.rootSourceId,
   n?.originalLocator,n?.methodReference].every(id)||nodes.has(n.id)||n.variantId!==q.variantId||n.fieldId!==q.fieldId||
   !kindSet.includes(n.kind)||!['for','against'].includes(n.stance)||!url(n.sourceUrl)||!hash(n.originalSha256)||
   !text(n.context,12,500)||!Array.isArray(n.derivedFrom)||n.derivedFrom.length>20||
   !n.derivedFrom.every(id)||!unique(n.derivedFrom)||
   (n.observationId!==null&&!id(n.observationId)))throw Error('bad188_argument');
  const measured=kindSource[n.kind as ArgumentKind188];
  if(measured){
   // A quantitative or certified assertion must point to the exact signed Phase187 observation.
   const o=variants.get(n.variantId)!.observations.find(o=>o.id===n.observationId);
   if(!o||o.dimension!==n.fieldId||o.sourceClass!==measured||o.sourceUrl!==n.sourceUrl||
    o.originalSha256!==n.originalSha256||o.originalLocator!==n.originalLocator||
    o.protocolId!==policy.protocolId||o.protocolVersion!==policy.protocolVersion||
    o.unit!==policy.unit||o.derivedFrom!==null||n.derivedFrom.length)throw Error('bad188_source_binding');
   const fits=policy.kind==='numeric_minimum'?typeof o.value==='number'&&o.value>=policy.threshold!&&
    (policy.thresholdMax===null||o.value<=policy.thresholdMax):o.value===policy.claim;
   if((n.stance==='for')!==fits)throw Error('bad188_stance_value');
  }else if(n.observationId!==null)throw Error('bad188_qualitative_binding');
  if(n.kind==='editorial_inference'&&n.derivedFrom.length===0)throw Error('unanchored188_editorial');
  nodes.set(n.id,n);
 }
 // All commentary dependencies must be acyclic and stay in this exact claim and source family.
 const seen=new Set<string>(),visiting=new Set<string>();
 function visit(n:Argument188):void{
  if(visiting.has(n.id))throw Error('cycle188');if(seen.has(n.id))return;visiting.add(n.id);
  for(const key of n.derivedFrom){const parent=nodes.get(key);
   if(!parent||parent.claimId!==n.claimId||parent.variantId!==n.variantId||parent.fieldId!==n.fieldId||
    parent.sourceGroupId!==n.sourceGroupId||parent.rootSourceId!==n.rootSourceId)
    throw Error('invalid188_derivation');
   visit(parent);
  }
  visiting.delete(n.id);seen.add(n.id);
 }
 for(const n of nodes.values())visit(n);
 // Review groups must not split one experiment into many apparent independent sources.
 const groupRoots=new Map<string,string>(),rootGroups=new Map<string,string>();
 for(const n of nodes.values()){
  const group=`${n.variantId}:${n.fieldId}:${n.sourceGroupId}`,root=`${n.variantId}:${n.fieldId}:${n.rootSourceId}`;
  if(groupRoots.has(group)&&groupRoots.get(group)!==root||rootGroups.has(root)&&rootGroups.get(root)!==group)
   throw Error('bad188_independence_partition');
  groupRoots.set(group,root);rootGroups.set(root,group);
 }
 // Avoid one physical observation masquerading as independent experiments.
 const origins=new Map<string,string>();
 for(const n of nodes.values()){
  const k=`${n.variantId}:${n.fieldId}:${n.originalSha256}:${n.originalLocator}`;
  const prev=origins.get(k);
  if(prev&&prev!==n.sourceGroupId)throw Error('duplicate188_origin_groups');
  origins.set(k,n.sourceGroupId);
 }
}
function authenticate(e:SignedArgumentLedger188|null,authority:TrustedRankingAuthority180):ArgumentLedger188|null{
 if(!e||!id(e.keyId)||!authority?.publicKeys||!Object.prototype.hasOwnProperty.call(authority.publicKeys,e.keyId)||
 !/^[A-Za-z0-9+/]+={0,2}$/.test(e.signatureBase64??''))return null;
 try{const signature=Buffer.from(e.signatureBase64,'base64');
  if(signature.length!==64||!verify(null,Buffer.from(canonicalJson180(e.ledger)),createPublicKey(authority.publicKeys[e.keyId]),signature))return null;
  return e.ledger;
 }catch{return null;}
}
/** Read-only: returns Phase187 verbatim and adds auditable argument scope, NOT a re-ranking. */
export function auditFieldArguments188(args:{goal:FieldGoal187;catalog:SignedFieldCatalog187|null;
 ledger:SignedArgumentLedger188|null;authority:TrustedRankingAuthority180}):ReasoningAudit188{
 const fieldDecision=compareFieldEvidence187({goal:args.goal,catalog:args.catalog,authority:args.authority});
 if(fieldDecision.catalogRevision===null||!fieldDecision.comparedDimension||!args.catalog)
  return withheld(fieldDecision,'Authenticated Phase187 field knowledge is required before auditing arguments.');
 const l=authenticate(args.ledger,args.authority);
 if(!l)return withheld(fieldDecision,'No independently authorized argument ledger is available.');
 if(Date.parse(args.authority.asOf)<Date.parse(l.reviewedAt)||Date.parse(args.authority.asOf)>Date.parse(l.expiresAt))
  return withheld(fieldDecision,'Argument review has expired or is future-dated.');
 try{validatedLedger(l,args.catalog.catalog,args.goal);}catch(e){return withheld(fieldDecision,`Argument review rejected: ${(e as Error).message}.`);}
 const result:ClaimAudit188[]=[],gaps:string[]=[];
 for(const claim of l.claims){
  const all=l.arguments.filter(a=>a.claimId===claim.id);
  const grouped=new Map<string,Argument188[]>();for(const a of all){const k=a.sourceGroupId;
   grouped.set(k,[...(grouped.get(k)??[]),a]);}
  const forGroups:string[]=[],againstGroups:string[]=[],qualitative:string[]=[],editorial:string[]=[];
  let measuredFor=false,measuredAgainst=false,manufacturerFor=false;
  for(const [group,parts] of [...grouped.entries()].sort(([a],[b])=>a.localeCompare(b,'en'))){
   const direct=parts.filter(a=>a.derivedFrom.length===0&&a.kind!=='editorial_inference');
   // Deduplicate derived and copied presentations: at most one root group contributes context.
   if(direct.some(a=>a.stance==='for'))forGroups.push(group);
   if(direct.some(a=>a.stance==='against'))againstGroups.push(group);
   measuredFor ||=direct.some(a=>a.stance==='for'&&['certified_measurement','independent_measurement'].includes(a.kind));
   measuredAgainst ||=direct.some(a=>a.stance==='against'&&['certified_measurement','independent_measurement'].includes(a.kind));
   manufacturerFor ||=direct.some(a=>a.stance==='for'&&a.kind==='manufacturer_specification');
   for(const a of parts){
    if(['structured_expert_observation','contextual_expert_observation'].includes(a.kind))qualitative.push(a.id);
    if(a.kind==='editorial_inference')editorial.push(a.id);
   }
  }
  const row=[...fieldDecision.compatible,...fieldDecision.provisional,...fieldDecision.held].find(r=>r.variantId===claim.variantId);
  const contradictory=forGroups.some(g=>againstGroups.includes(g))||Boolean(forGroups.length&&againstGroups.length);
  const reasons:string[]=[],research:string[]=[];
  let state:Conclusion188='undetermined';
  if(row?.disposition==='inadequate_for_field'&&measuredAgainst)state='field_inadequate';
  else if(contradictory){state='contested';reasons.push('Conflicting pro/contra original evidence or expert observations require contextual reconciliation.');}
  else if(row?.disposition==='reviewed_field_fit'&&measuredFor)state='limited_field_support';
  else if(manufacturerFor||qualitative.length)state='provisional';
  if(state==='limited_field_support')reasons.push('Only the confirmed Phase187 technical field is supported; no broader product-performance inference follows.');
  if(state==='field_inadequate')reasons.push('A linked reviewed measure challenges the required technical field; other product properties are not assessed.');
  if(state==='provisional')reasons.push('Only manufacturer or qualitative context is available; this does not certify the technical field.');
  if(state==='undetermined')reasons.push('No admissible independent support for the reviewed claim; absence is not a failing score.');
  if(state==='contested'||state==='undetermined'||state==='provisional'){
   const gap=`${claim.variantId}:${claim.fieldId}: review original conflicting or missing protocol-compatible evidence.`;
   research.push(gap);gaps.push(gap);
  }
  const duplicateOrDerived=all.length-grouped.size;
  result.push({claimId:claim.id,variantId:claim.variantId,fieldId:claim.fieldId,state,
   reviewerDeclaredSourceGroups:grouped.size,duplicateOrDerivedArguments:duplicateOrDerived,
   supportingRootGroups:forGroups.sort(),challengingRootGroups:againstGroups.sort(),
   qualitativeSignals:qualitative.sort(),editorialInterpretations:editorial.sort(),reasons,researchGaps:research});
 }
 result.sort((a,b)=>a.claimId.localeCompare(b.claimId,'en'));
 return {phase:188,language:'en',status:'audited',fieldDecision,ledgerRevision:l.revision,claims:result,
  warnings,researchGaps:[...new Set(gaps)].sort(),noGeneralProductRanking:true,noProbabilityEstimates:true,
  noAutomaticEvidenceAdmission:true,noClaimOfIndependenceWithoutExternalReview:true};
}
