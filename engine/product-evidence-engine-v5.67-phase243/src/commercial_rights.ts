/** Phase 38. Fail-closed commercial use authorization; NO vendor permission is inferred.
 * This module is a technical control, not a legal determination or license.
 */
export type CommercialProvider = 'amazon' | 'keepa' | 'awin' | 'ebay' | 'google_merchant';
export type CommercialUse = 'current_price_display' | 'history_storage' | 'history_publication' | 'price_alert' | 'cross_merchant_comparison';
export interface CommercialGrant {
  provider: CommercialProvider;
  status: 'draft' | 'approved' | 'revoked';
  market: string;
  permittedUses: CommercialUse[];
  /** ID of an actual executed agreement/letter, not a link to public API docs. */
  signedAgreementId: string | null;
  /** Identifiable reviewer who verified the agreement and its scope. */
  reviewedBy: string | null;
  reviewedAt: string | null;
  validFrom: string | null;
  validUntil: string | null;
  /** Explicit written exception to Amazon's default prohibition on price tracking/alerts. */
  amazonPriceTrackingExceptionId?: string | null;
  /** Explicit written permission for Amazon-content aggregation/analysis in this use case. */
  amazonAggregationExceptionId?: string | null;
  /** Confirmation that the product's principal-purpose and mobile requirements were reviewed. */
  amazonProductUseApprovalId?: string | null;
}
export interface AuthorizationResult { authorized: boolean; reasons: string[] }
const parseInstant = (value: string | null): number => value && /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? Date.parse(value) : NaN;
const nonempty = (s: string | null | undefined): boolean => typeof s === 'string' && s.trim().length > 0;
/** Any missing grant, market mismatch, scope mismatch or ambiguous date fails closed. */
export function authorizeCommercialUse(
  grant: CommercialGrant | undefined, provider: CommercialProvider,
  use: CommercialUse, market: string, at: string
): AuthorizationResult {
  const reasons: string[] = [];
  const t = parseInstant(at);
  if (!Number.isFinite(t)) throw new Error('Invalid authorization check time');
  if (!grant) return { authorized: false, reasons: ['no_grant'] };
  if (grant.provider !== provider) reasons.push('provider_mismatch');
  if (grant.status !== 'approved') reasons.push('not_approved');
  if (grant.market !== market) reasons.push('market_out_of_scope');
  if (!grant.permittedUses.includes(use)) reasons.push('use_not_granted');
  if (!nonempty(grant.signedAgreementId) || !nonempty(grant.reviewedBy)) reasons.push('no_verified_written_agreement');
  const from = parseInstant(grant.validFrom), until = parseInstant(grant.validUntil), reviewed = parseInstant(grant.reviewedAt);
  if (![from, until, reviewed].every(Number.isFinite) || t < from || t > until || reviewed > t || from > until) reasons.push('invalid_or_expired_grant');
  if (provider === 'google_merchant') reasons.push('merchant_pricing_reports_not_public_comparison_source');
  if (provider === 'amazon') {
    if (!nonempty(grant.amazonProductUseApprovalId)) reasons.push('amazon_use_case_not_cleared');
    if (['history_storage','history_publication','price_alert'].includes(use) &&
      !nonempty(grant.amazonPriceTrackingExceptionId)) reasons.push('amazon_price_tracking_exception_missing');
    if (['history_storage','history_publication','cross_merchant_comparison'].includes(use) &&
      !nonempty(grant.amazonAggregationExceptionId)) reasons.push('amazon_aggregation_exception_missing');
  }
  return { authorized: reasons.length === 0, reasons };
}
/** Provider and usage gates are evaluated independently: a current-price grant never implies history rights. */
export function authorizeAll(
  grants: CommercialGrant[], provider: CommercialProvider, uses: CommercialUse[], market: string, at: string
): AuthorizationResult {
  const matches = grants.filter(g => g.provider === provider && g.market === market);
  if (matches.length !== 1) return { authorized: false, reasons: [matches.length ? 'ambiguous_grants' : 'no_grant'] };
  const reasons = [...new Set(uses.flatMap(u => authorizeCommercialUse(matches[0], provider, u, market, at).reasons))];
  return { authorized: reasons.length === 0, reasons };
}
