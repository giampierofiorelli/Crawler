/** Phase 49: documentary admission gate for INDEPENDENT test evidence.
 * A review record is an assertion requiring authenticated human verification;
 * code cannot establish that a publisher owns rights or a cited document exists.
 * Numeric scoring remains synthetic and NOT suitable for a consumer launch.
 */
import { createHash } from 'node:crypto';
const keys = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
/** Deterministic fingerprint of the entire relevant test record. */
export function evidenceFingerprint(e) {
    return createHash('sha256').update(JSON.stringify({
        id: e.id, originalTestId: e.originalTestId, source: e.source, sourceUrl: e.sourceUrl,
        testedVariantId: e.testedVariantId, applicableVariantIds: [...e.applicableVariantIds].sort(),
        dimension: e.dimension, value: e.value, scale: e.scale, protocolId: e.protocolId,
        conditions: keys(e.conditions), status: e.status, rights: e.rights,
    })).digest('hex');
}
const present = (value) => typeof value === 'string' && value.trim().length > 0;
function date(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT.*(?:Z|[+-]\d\d:\d\d)$/.test(value))
        return NaN;
    return Date.parse(value);
}
function safeHttps(value) {
    try {
        const u = new URL(value);
        return u.protocol === 'https:' && !u.username && !u.password && !['localhost', '127.0.0.1', '::1'].includes(u.hostname);
    }
    catch {
        return false;
    }
}
/** Fail closed, including when an approval is duplicated or has expired. */
export function auditEvidenceReviews(records, approvals, nowIso, eligibleVariantIds) {
    const now = date(nowIso);
    if (!Number.isFinite(now))
        throw new Error('Valid audit time required');
    const eligible = new Set(eligibleVariantIds);
    const admitted = [], rejected = [];
    const idCounts = new Map();
    for (const e of records)
        idCounts.set(e.id, (idCounts.get(e.id) ?? 0) + 1);
    // Conflicting syndicated copies must NOT silently pool into the same original test.
    const originalKeys = new Map();
    for (const e of records) {
        const key = `${e.originalTestId}\u0000${e.dimension}\u0000${e.testedVariantId}`;
        const normalized = JSON.stringify({ value: e.value, protocolId: e.protocolId, conditions: keys(e.conditions) });
        const group = originalKeys.get(key) ?? new Set();
        group.add(normalized);
        originalKeys.set(key, group);
    }
    for (const e of records) {
        const refuse = (reason) => { rejected.push({ evidenceId: e.id, reason }); };
        if (!present(e.id) || (idCounts.get(e.id) ?? 0) !== 1) {
            refuse('missing_or_duplicate_evidence_id');
            continue;
        }
        if (!safeHttps(e.sourceUrl)) {
            refuse('untrusted_source_url');
            continue;
        }
        const host = new URL(e.sourceUrl).hostname.toLowerCase();
        if (host === 'amzn.to' || /(?:^|\.)amazon\.[a-z.]+$/.test(host)) {
            refuse('amazon_source_not_allowed_for_independent_ranking');
            continue;
        }
        if (!eligible.has(e.testedVariantId) || e.applicableVariantIds.length !== 1 ||
            e.applicableVariantIds[0] !== e.testedVariantId) {
            refuse('unverified_cross_variant_applicability');
            continue;
        }
        if (e.status !== 'admitted' || e.rights !== 'authorized' || e.scale !== 'synthetic_0_10' ||
            !Number.isFinite(e.value) || e.value < 0 || e.value > 10 ||
            ![e.source, e.originalTestId, e.protocolId].every(present)) {
            refuse('invalid_evidence_status_or_measurement');
            continue;
        }
        const key = `${e.originalTestId}\u0000${e.dimension}\u0000${e.testedVariantId}`;
        if ((originalKeys.get(key)?.size ?? 0) > 1) {
            refuse('conflicting_syndicated_test_copies');
            continue;
        }
        const matches = approvals.filter(a => a.evidenceId === e.id);
        if (matches.length !== 1) {
            refuse('missing_or_ambiguous_editorial_review');
            continue;
        }
        const a = matches[0];
        if (a.evidenceFingerprint !== evidenceFingerprint(e)) {
            refuse('review_does_not_match_evidence');
            continue;
        }
        if (a.publisherType !== 'independent_testing') {
            refuse('nonindependent_source');
            continue;
        }
        if (a.status !== 'approved' || ![
            a.id, a.reviewer, a.publisherIdentityReference, a.commercialReuseGrantReference,
            a.testMethodologyReference, a.originalTestReference, a.exactTestedVariantReference,
        ].every(present)) {
            refuse('approval_or_documentation_missing');
            continue;
        }
        const start = date(a.reviewedAt), expiry = date(a.expiresAt);
        if (!Number.isFinite(start) || !Number.isFinite(expiry) || start > now || expiry <= now || expiry <= start) {
            refuse('approval_expired_or_not_yet_valid');
            continue;
        }
        admitted.push(e);
    }
    return { admitted, rejected, publishable: false };
}
