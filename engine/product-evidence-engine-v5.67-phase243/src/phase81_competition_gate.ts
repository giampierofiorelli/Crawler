/** Safety boundary between a model's archival status and the CURRENT-product
 * ranking pipeline. A competitor cannot slip into a shortlist by omitting a
 * lifecycle record. A discontinued model ALWAYS keeps an accessible archive.
 */
import type {ProductLifecycleDecision} from './phase80_product_lifecycle.js';
import type {LaunchVariant, LaunchRequest} from './launch_rank.js';
import type {Evidence,RankingResult} from './types.js';
import {rankPriceFree} from './launch_rank.js';
export interface CurrentProductGateResult {
 allowedVariantIds:string[];
 excludedDiscontinuedIds:string[];
 awaitingLifecycleVerificationIds:string[];
}
export function gateCurrentProducts(
 variantIds:readonly string[], lifecycleByVariant:Readonly<Record<string,ProductLifecycleDecision>>
):CurrentProductGateResult {
 if(!Array.isArray(variantIds)||new Set(variantIds).size!==variantIds.length||
 variantIds.some(x=>typeof x!=='string'||!x.length)||!lifecycleByVariant||typeof lifecycleByVariant!=='object')
 throw Error('Invalid lifecycle gating input');
 const allowedVariantIds:string[]=[];
 const excludedDiscontinuedIds:string[]=[];
 const awaitingLifecycleVerificationIds:string[]=[];
 for(const id of variantIds){
  const l=lifecycleByVariant[id];
  if(!l||!l.persistentState){awaitingLifecycleVerificationIds.push(id);continue;}
  if(l.persistentState.confirmedDiscontinued||l.modelState==='discontinued')
   excludedDiscontinuedIds.push(id);
  if(l.persistentState.confirmedDiscontinued||l.modelState==='discontinued')continue;
  if(l.modelState!=='current'||!l.eligibleForCurrentProductCompetition)
   awaitingLifecycleVerificationIds.push(id);
  else allowedVariantIds.push(id);
 }
 return {allowedVariantIds,excludedDiscontinuedIds,awaitingLifecycleVerificationIds};
}
/** Explicit lifecycle-aware entrypoint. All public recommendation routes MUST
 * use a lifecycle gate, not call the legacy synthetic ranking function directly.
 * This remains a SYNTHETIC demo scorer, not public recommendation authorisation.
 */
export function rankCurrentPriceFree(
 variants:readonly LaunchVariant[],evidence:readonly Evidence[],request:LaunchRequest,
 lifecycleByVariant:Readonly<Record<string,ProductLifecycleDecision>>
):{ranking:RankingResult;gate:CurrentProductGateResult;publicationReady:false} {
 const gate=gateCurrentProducts(variants.map(v=>v.id),lifecycleByVariant);
 const allowed=new Set(gate.allowedVariantIds);
 const ranking=rankPriceFree(variants.filter(v=>allowed.has(v.id)),[...evidence],request);
 return {ranking,gate,publicationReady:false};
}
export interface ProductPageLifecycleView {
 remainsAccessible:true;
 appearance:'greyed_out'|'normal';
 showInCurrentComparisons:boolean;
 showInCurrentRecommendations:boolean;
 bannerText:string|null;
 allowHistoricalSpecsAndTests:true;
}
export function productPageLifecycleView(l:ProductLifecycleDecision):ProductPageLifecycleView {
 const discontinued=l.persistentState.confirmedDiscontinued||l.modelState==='discontinued';
 return {remainsAccessible:true,appearance:discontinued?'greyed_out':'normal',
  showInCurrentComparisons:!discontinued&&l.modelState==='current',
  showInCurrentRecommendations:!discontinued&&l.modelState==='current',
  bannerText:discontinued?'Fuori produzione: questo modello non partecipa più alle classifiche e alle raccomandazioni dei prodotti attuali.':null,
  allowHistoricalSpecsAndTests:true};
}
