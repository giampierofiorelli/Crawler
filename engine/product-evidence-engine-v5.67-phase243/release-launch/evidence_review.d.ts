import type { Evidence } from './types.js';
export interface EvidenceApproval {
    id: string;
    evidenceId: string;
    /** SHA-256 of the complete test record; editing a score, source, protocol or variant invalidates approval. */
    evidenceFingerprint: string;
    status: 'approved' | 'draft' | 'revoked';
    reviewer: string;
    publisherType: 'independent_testing' | 'manufacturer' | 'retailer';
    reviewedAt: string;
    expiresAt: string;
    publisherIdentityReference: string;
    commercialReuseGrantReference: string;
    testMethodologyReference: string;
    originalTestReference: string;
    exactTestedVariantReference: string;
}
export interface EvidenceRejection {
    evidenceId: string;
    reason: string;
}
export interface EvidenceAudit {
    admitted: Evidence[];
    rejected: EvidenceRejection[];
    /** Always false: synthetic normalization has not been validated for real products. */
    publishable: false;
}
/** Deterministic fingerprint of the entire relevant test record. */
export declare function evidenceFingerprint(e: Evidence): string;
/** Fail closed, including when an approval is duplicated or has expired. */
export declare function auditEvidenceReviews(records: readonly Evidence[], approvals: readonly EvidenceApproval[], nowIso: string, eligibleVariantIds: readonly string[]): EvidenceAudit;
