import { type EvidenceApproval } from './evidence_review.js';
import type { LaunchVariant, LaunchRequest } from './launch_rank.js';
import type { Evidence, RankingResult, Candidate } from './types.js';
import { type PurchaseLinkApprovalRecord } from './launch_purchase.js';
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
    rejectedEvidence: {
        evidenceId: string;
        reason: string;
    }[];
    publicationReady: false;
    purpose: 'synthetic_demo';
}
export declare function buildLaunchRecommendation(input: {
    variants: readonly LaunchVariant[];
    evidence: readonly Evidence[];
    evidenceApprovals: readonly EvidenceApproval[];
    purpose: 'synthetic_demo';
    request: LaunchRequest;
    offers: readonly ApprovedPurchaseLink[];
    approvals: readonly PurchaseLinkApprovalRecord[];
    nowIso: string;
}): LaunchRecommendation;
