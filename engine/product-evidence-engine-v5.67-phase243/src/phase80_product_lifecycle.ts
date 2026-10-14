/** Model manufacturing lifecycle, not retailer stock or offer availability.
 * Verified discontinuation is a model-identity-level exclusion for CURRENT-product
 * recommendations. A stale current listing cannot undo a confirmed tombstone.
 * Source authentication and identity matching occur upstream; they are NOT proven
 * by an inbound boolean. Research-stage policy only.
 */
export interface ProductLifecycleEvidence {
 sourceId:string;
 kind:'manufacturer_discontinued_notice'|'manufacturer_current_listing'|'new_model_announced';
 verified:boolean;market:string;verifiedAt:string;
}
/** Persist this result across runs. A confirmed retirement is monotonic; do not
 * reset it merely because the crawler has fewer sources on its next pass.
 */
export interface PersistentModelLifecycle {
 confirmedDiscontinued:boolean;
 retirementSourceIds:readonly string[];
}
export interface ProductLifecycleDecision {
 modelState:'discontinued'|'current'|'uncertain';
 eligibleForCurrentProductCompetition:boolean;
 productPage:'archive_greyed_out'|'normal_or_unverified';
 banner:'discontinued_confirmed'|'none';
 needsVerification:boolean;
 sourceIds:string[];
 /** This is not itself a test, assessment, or ranking authorisation. */
 newModelNeedsIndependentTests:boolean;
 persistentState:PersistentModelLifecycle;
}
export function assessProductLifecycle(
 market:string,records:readonly ProductLifecycleEvidence[],
 previous:PersistentModelLifecycle={confirmedDiscontinued:false,retirementSourceIds:[]}
):ProductLifecycleDecision {
 const valid=(x:unknown)=>typeof x==='string'&&x.length>0&&x.length<=160;
 if(!valid(market)||!Array.isArray(records)||records.length>500||
 !previous||typeof previous.confirmedDiscontinued!=='boolean'||
 !Array.isArray(previous.retirementSourceIds)||previous.retirementSourceIds.length>500||
 !previous.retirementSourceIds.every(valid)||records.some(r=>!r||
 !valid(r.sourceId)||!valid(r.market)||(r.market!==market&&r.market!=='global')||
 !Number.isFinite(Date.parse(r.verifiedAt))||typeof r.verified!=='boolean'||
 !['manufacturer_discontinued_notice','manufacturer_current_listing','new_model_announced'].includes(r.kind)))
 throw Error('Invalid manufacturing lifecycle evidence');
 const verified=records.filter(r=>r.verified);
 const retirementSources=[...new Set([...previous.retirementSourceIds,
  ...verified.filter(r=>r.kind==='manufacturer_discontinued_notice').map(r=>r.sourceId)])];
 const discontinued=previous.confirmedDiscontinued||retirementSources.length>0;
 const active=verified.some(r=>r.kind==='manufacturer_current_listing');
 const conflicting=discontinued&&active;
 // Even conflicting newer notices cannot silently restore an archived model.
 const modelState=discontinued?'discontinued':active?'current':'uncertain';
 return {
  modelState,eligibleForCurrentProductCompetition:modelState==='current',
  productPage:discontinued?'archive_greyed_out':'normal_or_unverified',
  banner:discontinued?'discontinued_confirmed':'none',
  needsVerification:conflicting||modelState==='uncertain',
  sourceIds:[...new Set([...retirementSources,...verified.map(r=>r.sourceId)])],
  newModelNeedsIndependentTests:verified.some(r=>r.kind==='new_model_announced'),
  persistentState:{confirmedDiscontinued:discontinued,retirementSourceIds:retirementSources}
 };
}
