/**
 * PRICE-FREE PUBLIC LAUNCH PATH (Phase 48).
 * Product quality is ranked exclusively on eligible independent evidence and mandatory
 * product specifications. No MSRP/RRP, live prices, offers, budgets, price history,
 * timing signals or Amazon data are consumed by ranking.
 * Affiliate links are independently resolved only AFTER the ranking is complete.
 */
import { rankPriceFree } from './launch_rank.js';
import { auditEvidenceReviews, type EvidenceApproval } from './evidence_review.js';
import type { LaunchVariant, LaunchRequest } from './launch_rank.js';
import type { Evidence, RankingResult, Candidate } from './types.js';
import { resolveLaunchPurchaseLinks, type PurchaseLinkApprovalRecord } from './launch_purchase.js';
import type { ApprovedPurchaseLink, PurchaseLink } from './purchase_links.js';

/** Public launch inputs deliberately omit prices and budget filters. */
export type { LaunchVariant, LaunchRequest } from './launch_rank.js';

export interface LaunchCandidate {
  variantId: string;
  score: number | null;
  coverage: number;
  dimensionScores: Candidate['dimensionScores'];
  usedEvidenceIds: string[];
  notes: string[];
  purchaseLinks: PurchaseLink[];
}
export interface LaunchRecommendation {
  winnerId: string | null;
  outcome: RankingResult['outcome'];
  candidates: LaunchCandidate[];
  disclosure: string;
  warnings: string[];
  rejectedApprovalIds: string[];
  rejectedEvidence: { evidenceId: string; reason: string }[];
  publicationReady: false;
  purpose: 'synthetic_demo';
}

const merchantOrPriceKey = /(?:price|msrp|rrp|cost|budget|deal|discount|sale|availability|retailer|merchant|amazon|affiliate|commission)/i;

export function buildLaunchRecommendation(input: {
  variants: readonly LaunchVariant[];
  evidence: readonly Evidence[];
  evidenceApprovals: readonly EvidenceApproval[];
  purpose: 'synthetic_demo';
  request: LaunchRequest;
  offers: readonly ApprovedPurchaseLink[];
  approvals: readonly PurchaseLinkApprovalRecord[];
  nowIso: string;
}): LaunchRecommendation {
  // No production normalization exists: callers MUST opt into an explicit nonpublishable fixture mode.
  if (input.purpose !== 'synthetic_demo') throw new Error('Production ranking disabled: no validated real-world scoring profiles');
  if (!Array.isArray(input.evidenceApprovals)) throw new Error('Independent evidence approval records required');
  // Fail closed on legacy budget/list-price integration attempts, including JS callers.
  // An ignored budget is misleading; require callers to remove the control entirely.
  if (Object.hasOwn(input.request, 'maxPrice')) {
    throw new Error('Price and budget filtering are disabled for the public launch');
  }
  const unsafe = input as Record<string, unknown>;
  for (const name of ['manufacturerListPrices','manufacturerPublishers','manufacturerPriceApprovals',
    'budgetPreference','flexibleStretchPercent','priceHistory','currentPrices','purchaseTiming']) {
    if (Object.hasOwn(unsafe, name)) throw new Error(`Price-related launch input is disabled: ${name}`);
  }

  if (Object.keys(input.request.requiredSpecifications ?? {}).some(key => merchantOrPriceKey.test(key))) {
    throw new Error('Price or merchant specifications cannot be used as launch filters');
  }

  // Whitelist product identity and noncommercial specifications. Incoming legacy
  // JS objects may contain price fields; they cannot influence the launch engine.
  const neutralVariants: LaunchVariant[] = input.variants.map(v => ({
    id: v.id, familyId: v.familyId, market: v.market, sku: v.sku,
    currency: v.currency,
    specifications: Object.fromEntries(Object.entries(v.specifications).filter(([key]) => !merchantOrPriceKey.test(key))),
  }));
  const neutralRequest: LaunchRequest = {
    market: input.request.market, currency: input.request.currency,
    weights: {...input.request.weights},
    requiredSpecifications: input.request.requiredSpecifications ? {...input.request.requiredSpecifications} : undefined,
  };
  const audit = auditEvidenceReviews(input.evidence, input.evidenceApprovals, input.nowIso, neutralVariants.map(v=>v.id));
  const ranking = rankPriceFree(neutralVariants, audit.admitted, neutralRequest);
  const purchase = resolveLaunchPurchaseLinks(ranking, input.request.market, input.offers, input.approvals, input.nowIso);
  return {
    winnerId: ranking.winnerId,
    outcome: ranking.outcome,
    candidates: ranking.candidates.map(candidate => ({
      variantId: candidate.variantId,
      score: candidate.score,
      coverage: candidate.coverage,
      dimensionScores: {...candidate.dimensionScores},
      usedEvidenceIds: [...candidate.usedEvidenceIds],
      notes: [...candidate.notes],
      purchaseLinks: (purchase.linksByVariant[candidate.variantId] ?? []).map(link => ({...link})),
    })),
    disclosure: purchase.disclosure,
    warnings: [...ranking.warnings,
      'SYNTHETIC DEMONSTRATION ONLY: DO NOT PUBLISH RECOMMENDATIONS TO CONSUMERS.',
      'Evidence documentation is asserted by reviewers, not independently verified by this code.',
      'Price and budget filtering are not offered. Confirm current selling prices on retailer websites.',
      ...purchase.warnings],
    rejectedApprovalIds: [...purchase.rejectedApprovalIds],
    rejectedEvidence: audit.rejected.map(item=>({...item})),
    publicationReady: false,
    purpose: 'synthetic_demo',
  };
}
