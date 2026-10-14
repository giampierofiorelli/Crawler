/**
 * Retailer-neutral purchase link resolution. No Amazon API or content is consumed.
 * A merchant link is an independently approved destination, never ranking evidence.
 * This module intentionally does not display prices, availability or purchase timing.
 */
import type { RankingResult } from './types.js';
export type Retailer = 'amazon' | 'other';
export interface ApprovedPurchaseLink {
    variantId: string;
    market: string;
    retailer: Retailer;
    retailerName: string;
    url: string;
    exactVariantVerified: boolean;
    independentlySourced: boolean;
    rightsApproved: boolean;
    destinationApproved: boolean;
    amazonAssociateTag?: string;
}
export interface PurchaseLink {
    variantId: string;
    retailerName: string;
    url: string;
    affiliate: boolean;
}
export interface PurchaseLinksResult {
    ranking: RankingResult;
    linksByVariant: Record<string, PurchaseLink[]>;
    disclosure: string;
    warnings: string[];
}
/** Fail closed: caller must independently validate evidence and merchant destination. */
export declare function resolvePurchaseLinks(ranking: RankingResult, market: string, offers: readonly ApprovedPurchaseLink[]): PurchaseLinksResult;
