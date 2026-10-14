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

const forbidden = /(?:^|\.)amazon\.(?:co\.uk|com|de|fr|it|es|nl|se|pl|com\.be|ie)$/i;
const validTag = /^[A-Za-z0-9_-]+-\d{2}$/;

/** Fail closed: caller must independently validate evidence and merchant destination. */
export function resolvePurchaseLinks(
  ranking: RankingResult,
  market: string,
  offers: readonly ApprovedPurchaseLink[],
): PurchaseLinksResult {
  const linksByVariant: Record<string, PurchaseLink[]> = Object.fromEntries(
    ranking.candidates.map(candidate => [candidate.variantId, []]),
  );
  const warnings: string[] = [];
  const seen = new Set<string>();
  for (const offer of offers) {
    if (!Object.hasOwn(linksByVariant, offer.variantId) || offer.market !== market) continue;
    if (!offer.exactVariantVerified || !offer.independentlySourced || !offer.rightsApproved || !offer.destinationApproved) {
      warnings.push(`Purchase link withheld for ${offer.variantId}: approval or exact-match verification missing`);
      continue;
    }
    let url: URL;
    try { url = new URL(offer.url); } catch { warnings.push(`Invalid purchase URL for ${offer.variantId}`); continue; }
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash ||
      url.hostname === 'localhost' || url.hostname.endsWith('.localhost') ||
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(url.hostname)) {
      warnings.push(`Unsafe purchase URL for ${offer.variantId}`); continue;
    }
    if (offer.retailer === 'amazon') {
      // Conservative UK-only allowlist until each additional marketplace has its own reviewed policy.
      if (market !== 'UK' || url.hostname !== 'www.amazon.co.uk' ||
          !offer.amazonAssociateTag || !validTag.test(offer.amazonAssociateTag) ||
          url.searchParams.get('tag') !== offer.amazonAssociateTag ||
          !/^\/dp\/[A-Z0-9]{10}\/?$/.test(url.pathname)) {
        warnings.push(`Amazon link withheld for ${offer.variantId}: UK canonical product URL or Associate tag invalid`);
        continue;
      }
    } else if (forbidden.test(url.hostname) || url.hostname.endsWith('.amazon.co.uk')) {
      warnings.push(`Retailer misclassified for ${offer.variantId}`); continue;
    }
    const key = `${offer.variantId}|${url.hostname}|${url.pathname}|${url.search}`;
    if (seen.has(key)) continue;
    seen.add(key);
    linksByVariant[offer.variantId].push({
      variantId: offer.variantId,
      retailerName: offer.retailer === 'amazon' ? 'Amazon' : offer.retailerName,
      url: url.toString(),
      affiliate: true,
    });
  }
  return {
    // Identity preservation: do not mutate, rerank or filter candidates.
    ranking,
    linksByVariant,
    disclosure: 'Some purchase links are affiliate links. We may earn a commission. Retailer relationships do not affect product rankings. As an Amazon Associate I earn from qualifying purchases.',
    warnings,
  };
}
