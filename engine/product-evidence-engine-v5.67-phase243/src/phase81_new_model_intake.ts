/** New models may first appear with manufacturer specs alone or with original
 * independent reviews. Discovery and source evaluation precede ANY rankings.
 * Upstream must authenticate cited publisher/source identity and legal rights.
 */
import type {ProductLifecycleDecision} from './phase80_product_lifecycle.js';
export interface NewModelEvidenceLead {
 sourceId:string;originalWorkId:string;
 kind:'manufacturer_specs'|'manufacturer_performance_claim'|
  'independent_professional_review'|'independent_original_test';
 identityMatched:boolean;verifiedProvenance:boolean;
 /** Indicates only permission to process the lead, not product score approval. */
 lawfulToProcess:boolean;
}
export interface NewModelIntake {
 productId:string;categoryId:string;
 identityConfirmed:boolean;
 lifecycle:ProductLifecycleDecision;
 leads:readonly NewModelEvidenceLead[];
}
export interface NewModelIntakeDecision {
 productId:string;
 state:'identity_unconfirmed'|'archived_discontinued'|'specifications_only'|
   'independent_review_found'|'original_test_found'|'discovery_only';
 discoveryRecord:'lightweight_stub'|'structured_specifications'|'research_evidence_pending';
 queue:ReadonlyArray<'verify_product_identity'|'collect_manufacturer_specs'|
  'discover_independent_reviews'|'verify_independent_methods_and_rights'|'assess_original_tests'>;
 candidateForEvidenceReview:boolean;
 competitionAuthorized:false;
 inferredPerformanceFromSpecs:false;
 sourceIds:string[];
}
const safe=(s:unknown):s is string=>typeof s==='string'&&/^[a-z0-9][a-z0-9_.:-]{0,127}$/.test(s);
export function triageNewModel(input:NewModelIntake):NewModelIntakeDecision {
 if(!input||!safe(input.productId)||!safe(input.categoryId)||
 typeof input.identityConfirmed!=='boolean'||!input.lifecycle||
 !Array.isArray(input.leads)||input.leads.length>500||
 input.leads.some(l=>!l||!safe(l.sourceId)||!safe(l.originalWorkId)||
 !['manufacturer_specs','manufacturer_performance_claim','independent_professional_review','independent_original_test'].includes(l.kind)||
 typeof l.identityMatched!=='boolean'||typeof l.verifiedProvenance!=='boolean'||
 typeof l.lawfulToProcess!=='boolean'))throw Error('Invalid new model input');
 const trusted=input.leads.filter(l=>l.identityMatched&&l.verifiedProvenance&&l.lawfulToProcess);
 const originals=new Map<string,NewModelEvidenceLead>();
 for(const l of trusted)if(!originals.has(l.originalWorkId)||l.kind==='independent_original_test')
  originals.set(l.originalWorkId,l);
 const documents=[...originals.values()];
 const specs=documents.some(l=>l.kind==='manufacturer_specs');
 const test=documents.some(l=>l.kind==='independent_original_test');
 const review=documents.some(l=>l.kind==='independent_professional_review');
 let state:NewModelIntakeDecision['state']='discovery_only';
 let queue:NewModelIntakeDecision['queue']=[];
 if(input.lifecycle.modelState==='discontinued')state='archived_discontinued';
 else if(!input.identityConfirmed){state='identity_unconfirmed';queue=['verify_product_identity'];}
 else if(test){state='original_test_found';queue=['verify_independent_methods_and_rights','assess_original_tests'];}
 else if(review){state='independent_review_found';queue=['verify_independent_methods_and_rights','discover_independent_reviews'];}
 else if(specs){state='specifications_only';queue=['discover_independent_reviews'];}
 else queue=['collect_manufacturer_specs','discover_independent_reviews'];
 return {
  productId:input.productId,state,
  discoveryRecord:state==='archived_discontinued'||state==='identity_unconfirmed'||state==='discovery_only'?
   'lightweight_stub':state==='specifications_only'?'structured_specifications':'research_evidence_pending',
  queue,candidateForEvidenceReview:input.lifecycle.modelState!=='discontinued'&&input.identityConfirmed&&(test||review),
  competitionAuthorized:false,inferredPerformanceFromSpecs:false,
  sourceIds:[...new Set(documents.map(l=>l.sourceId))]
 };
}
