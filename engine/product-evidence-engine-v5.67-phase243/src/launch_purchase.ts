/** Production launch boundary: no price, history, timing, or Amazon API dependency.
 * Approval records are supplied by a human-operated compliance workflow, not inferred.
 */
import type { RankingResult } from './types.js';
import { resolvePurchaseLinks, type ApprovedPurchaseLink, type PurchaseLinksResult } from './purchase_links.js';

export interface PurchaseLinkApprovalRecord {
  id: string;
  variantId: string;
  market: string;
  retailer: 'amazon' | 'other';
  destinationUrl: string;
  reviewer: string;
  approvedAt: string;
  expiresAt: string;
  evidenceReference: string;
  merchantAgreementReference: string;
  exactVariantEvidenceReference: string;
  sourceRightsReference: string;
  status: 'approved' | 'draft' | 'revoked';
}
export interface LaunchPurchaseResult extends PurchaseLinksResult {
  rejectedApprovalIds: string[];
}
const nonblank = (v: string): boolean => typeof v === 'string' && v.trim().length > 0;
const instant = (v: string): number => /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(v) ? Date.parse(v) : NaN;
/** Require one unexpired, traceable human approval per exact merchant destination. */
export function resolveLaunchPurchaseLinks(
  ranking: RankingResult,
  market: string,
  offers: readonly ApprovedPurchaseLink[],
  approvals: readonly PurchaseLinkApprovalRecord[],
  nowIso: string,
): LaunchPurchaseResult {
  const now = instant(nowIso);
  if (!Number.isFinite(now)) throw new Error('Invalid evaluation instant');
  const rejectedApprovalIds: string[] = [];
  const approvedOffers: ApprovedPurchaseLink[] = [];
  for (const offer of offers) {
    const matches = approvals.filter(a => a.variantId === offer.variantId && a.market === offer.market &&
      a.retailer === offer.retailer && a.destinationUrl === offer.url);
    if (matches.length !== 1) {
      rejectedApprovalIds.push(`${offer.variantId}:missing_or_ambiguous_approval`);
      continue;
    }
    const a = matches[0];
    const start = instant(a.approvedAt), end = instant(a.expiresAt);
    const valid = a.status === 'approved' && [a.id,a.reviewer,a.evidenceReference,
      a.merchantAgreementReference,a.exactVariantEvidenceReference,a.sourceRightsReference].every(nonblank) &&
      Number.isFinite(start) && Number.isFinite(end) && start <= now && now < end;
    if (!valid) { rejectedApprovalIds.push(a.id || `${offer.variantId}:invalid_approval`); continue; }
    approvedOffers.push(offer);
  }
  const resolved = resolvePurchaseLinks(ranking, market, approvedOffers);
  return { ...resolved, rejectedApprovalIds };
}
