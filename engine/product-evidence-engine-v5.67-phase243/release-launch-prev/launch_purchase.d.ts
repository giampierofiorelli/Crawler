/** Production launch boundary: no price, history, timing, or Amazon API dependency.
 * Approval records are supplied by a human-operated compliance workflow, not inferred.
 */
import type { RankingResult } from './types.js';
import { type ApprovedPurchaseLink, type PurchaseLinksResult } from './purchase_links.js';
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
/** Require one unexpired, traceable human approval per exact merchant destination. */
export declare function resolveLaunchPurchaseLinks(ranking: RankingResult, market: string, offers: readonly ApprovedPurchaseLink[], approvals: readonly PurchaseLinkApprovalRecord[], nowIso: string): LaunchPurchaseResult;
