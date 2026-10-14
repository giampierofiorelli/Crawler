/** Phase224 read-only audit of unverified product-attribute leads from Phase222.
 * Does not pool sources as independent evidence; a conflict is an unresolved
 * publisher disagreement, never a detected product defect or a test result.
 */
import type {Observation222} from './phase222_transient_public_page_observer.js';
import type {DeclaredAtomicClaim224} from './phase224_transient_structured_claims.js';
const norm=(v:string)=>v.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export interface ClaimDisagreement224{
 identity:string;propertyKey:string;sourceUrls:readonly string[];
 /** Values are publisher declarations, not independently verified measurements. */
 declarations:readonly {sourceUrl:string;value:number|string;unit:string|null}[];
 status:'unresolved_source_or_market_or_variant_conflict';
}
export interface EvidenceGap224{
 claimCount:number;observedSources:number;originalTestsVerified:0;
 exactVariantsVerified:0;independenceReviewed:false;
 reasonCodes:readonly string[];
 disagreements:readonly ClaimDisagreement224[];
 noSourceBodiesStored:true;rankingAuthorized:false;
 schema:'pee224.claim-audit.v1';
}
export function auditObservedClaims224(...runs:readonly (Observation222|null)[]):EvidenceGap224{
 const claims:DeclaredAtomicClaim224[]=[];const origins=new Set<string>();const seenClaimIds=new Set<string>();
 let blocked=0,weak=0,truncated=0;
 for(const run of runs){
  if(!run)continue;
  if(run.schema!=='pee222.page-observation.v1'||run.noSourceBodiesStored!==true||
   run.rankingAuthorized!==false||run.independentEvidenceVerified!==false)
   throw Error('phase224_untrusted_observation');
  for(const receipt of run.receipts){
   if(receipt.status==='blocked'){blocked++;continue;}
   const declaration=receipt.structuredDeclarations224;
   if(!declaration||declaration.schema!=='pee224.transient-declarations.v1'||
    declaration.sourceBodiesRetained!==false||declaration.rankingAuthorized!==false)
    throw Error('phase224_missing_transient_declarations');
   weak+=declaration.subjectsWithWeakIdentity;
   if(declaration.truncated)truncated++;
   for(const claim of declaration.claims){
    if(claim.sourceUrl!==receipt.url||claim.claimStatus!=='publisher_declaration_unverified'||
     claim.independentMeasurement!==false||claim.rankingAuthorized!==false)throw Error('phase224_claim_scope_mismatch');
    if(!seenClaimIds.has(claim.claimId)){claims.push(claim);seenClaimIds.add(claim.claimId);}
    origins.add(receipt.url);
   }
  }
 }
 // Only a repeated brand + declared model (and SKU if provided) may produce a
 // potential cross-publisher disagreement. Title similarity is insufficient.
 const grouped=new Map<string,DeclaredAtomicClaim224[]>();
 for(const c of claims){
  const brand=norm(c.subject.brand??''),model=norm(c.subject.model??''),sku=norm(c.subject.sku??'');
  if(!brand||(!model&&!sku))continue;
  const id=JSON.stringify([brand,model,sku,c.propertyKey]);
  grouped.set(id,[...(grouped.get(id)??[]),c]);
 }
 const disagreements:ClaimDisagreement224[]=[];
 for(const [key,items] of grouped){
  const distinct=new Map<string,ClaimDisagreement224['declarations'][number]>();
  for(const c of items){const id=JSON.stringify([c.sourceUrl,c.value,c.unit]);
   distinct.set(id,{sourceUrl:c.sourceUrl,value:c.value,unit:c.unit});
  }
  const declarations=[...distinct.values()].sort((a,b)=>a.sourceUrl.localeCompare(b.sourceUrl)||String(a.value).localeCompare(String(b.value)));
  if(new Set(declarations.map(d=>JSON.stringify([d.value,d.unit]))).size<2)continue;
  const [brand,model,sku,propertyKey]=JSON.parse(key) as [string,string,string,string];
  disagreements.push({identity:JSON.stringify([brand,model,sku]),propertyKey,
   sourceUrls:[...new Set(declarations.map(d=>d.sourceUrl))].sort(),declarations,
   status:'unresolved_source_or_market_or_variant_conflict'});
 }
 disagreements.sort((a,b)=>a.identity.localeCompare(b.identity)||a.propertyKey.localeCompare(b.propertyKey));
 const reasonCodes=['claims_are_unverified_publisher_declarations','no_independent_performance_tests_authenticated',
  'no_exact_market_variant_scope_authenticated'];
 if(!claims.length)reasonCodes.push('no_machine_readable_atomic_claims');
 if(weak)reasonCodes.push('weak_product_identity');
 if(truncated)reasonCodes.push('bounded_claim_extraction_truncated');
 if(blocked)reasonCodes.push('some_pages_not_read_due_to_access_controls');
 if(disagreements.length)reasonCodes.push('conflicting_publisher_values_require_review');
 return {schema:'pee224.claim-audit.v1',claimCount:claims.length,observedSources:origins.size,
  originalTestsVerified:0,exactVariantsVerified:0,independenceReviewed:false,
  reasonCodes,disagreements,noSourceBodiesStored:true,rankingAuthorized:false};
}
