/** Phase 38: offline, transparent denominator-first coverage audit. Never creates live coverage claims. */
import { authorizeAll, type CommercialGrant, type CommercialProvider, type CommercialUse } from './commercial_rights.js';
export interface PilotVariant { variantId: string; market: string; category: string; identityReviewed: boolean }
export interface PilotOffer {
  provider: CommercialProvider; variantId: string; merchantId: string;
  exactVariantVerified: boolean; totalPriceVerified: boolean; inStock: boolean;
  observedAt: string; condition: 'new'|'used'|'refurbished';
}
export interface PilotInput {
  variants: PilotVariant[]; offers: PilotOffer[]; grants: CommercialGrant[];
  asOf: string; market: string; maxAgeHours: number;
}
export interface ProviderCoverage {
  provider: CommercialProvider; eligibleVariants: number; matchingVariants: number;
  freshVariants: number; publishableVariants: number; distinctMerchants: number;
  matchingCoverage: number; freshCoverage: number; publishableCoverage: number;
  rights: 'cleared_for_current_display' | 'blocked'; rightsReasons: string[];
}
export interface PilotReport { market: string; denominator: number; providers: ProviderCoverage[]; warnings: string[] }
const PROVIDERS: CommercialProvider[] = ['amazon','keepa','awin','ebay','google_merchant'];
export function auditCoverage(input: PilotInput): PilotReport {
  const now = Date.parse(input.asOf);
  if (!Number.isFinite(now) || !Number.isFinite(input.maxAgeHours) || input.maxAgeHours <= 0) throw new Error('Invalid audit configuration');
  const ids = input.variants.map(v=>v.variantId);
  if (new Set(ids).size !== ids.length || ids.some(id=>!id)) throw new Error('Duplicate or missing variant ID');
  const eligible = input.variants.filter(v=>v.market===input.market && v.identityReviewed);
  const known = new Set(eligible.map(v=>v.variantId));
  const warnings: string[] = [];
  if (eligible.length !== 30) warnings.push('pilot_target_30_verified_variants_not_met');
  if (input.offers.some(o=>!known.has(o.variantId))) warnings.push('offers_for_unverified_or_out_of_scope_variants_excluded');
  const providers = PROVIDERS.map(provider => {
    const offers = input.offers.filter(o=>o.provider===provider && known.has(o.variantId) && o.condition==='new');
    const matched = offers.filter(o=>o.exactVariantVerified);
    const fresh = matched.filter(o=>{
      const time=Date.parse(o.observedAt);
      return Number.isFinite(time) && time<=now && now-time<=input.maxAgeHours*3_600_000;
    });
    const complete = fresh.filter(o=>o.totalPriceVerified && o.inStock);
    const rights = authorizeAll(input.grants, provider, ['current_price_display','cross_merchant_comparison'] as CommercialUse[],input.market,input.asOf);
    const count=(a:PilotOffer[])=>new Set(a.map(o=>o.variantId)).size;
    const fraction=(a:PilotOffer[])=>eligible.length?count(a)/eligible.length:0;
    return {
      provider, eligibleVariants:eligible.length, matchingVariants:count(matched),
      freshVariants:count(fresh), publishableVariants:rights.authorized?count(complete):0,
      distinctMerchants:new Set(complete.map(o=>o.merchantId)).size,
      matchingCoverage:fraction(matched),freshCoverage:fraction(fresh),
      publishableCoverage:rights.authorized?fraction(complete):0,
      rights:rights.authorized?'cleared_for_current_display' as const:'blocked' as const,
      rightsReasons:rights.reasons
    };
  });
  return {market:input.market,denominator:eligible.length,providers,warnings};
}
