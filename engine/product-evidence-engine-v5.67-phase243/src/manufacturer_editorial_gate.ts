/** Offline, fail-closed editorial gate for manufacturer MSRP/RRP references.
 * No Amazon content, retailer offers, network requests or price tracking.
 * Documents and reviewer identities MUST be verified by a separate trusted workflow.
 */
import { createHash } from 'node:crypto';
import type { ManufacturerListPriceRecord } from './list_price_context.js';

export interface ManufacturerPublisherApproval {
  manufacturerId: string;
  /** Exact DNS hostname(s), not suffixes/wildcards. Never inferred from the submitted record. */
  exactHosts: readonly string[];
  identityEvidenceReference: string;
  rightsEvidenceReference: string;
  rightsScope: 'internal_list_price_budget_reference';
  reviewedBy: string;
  reviewedAt: string;
  validUntil: string;
  status: 'approved' | 'revoked';
}
export interface ManufacturerPriceEditorialApproval {
  approvalId: string;
  /** Immutable SHA-256 fingerprint of every price record field; any change invalidates approval. */
  recordSha256: string;
  manufacturerId: string;
  /** Submission reviewer cannot approve their own work. */
  submittedBy: string;
  reviewedBy: string;
  reviewedAt: string;
  validUntil: string;
  /** Reference to captured source evidence; content must be reviewed outside this module. */
  captureEvidenceReference: string;
  /** Hash of the independently retained screenshot/PDF/text evidence snapshot (not its URL). */
  captureSha256: string;
  variantMatchEvidenceReference: string;
  rightsEvidenceReference: string;
  status: 'approved' | 'revoked';
}
export type EditorialRejection = 'missing_approval' | 'ambiguous_approval' | 'invalid_approval' |
  'record_modified' | 'unverified_publisher' | 'source_not_allowlisted' | 'approval_expired' |
  'review_not_independent' | 'rights_unverified';
export interface EditorialGateEntry { variantId: string; accepted: boolean; reason?: EditorialRejection; }

/** Stable schema-constrained encoding: property order and exact fields are fixed. */
export function fingerprintManufacturerRecord(r: ManufacturerListPriceRecord): string {
  const payload = [1,r.variantId,r.market,r.currency,r.amount,r.sourceKind,r.sourceUrl,r.verifiedAt,
    r.validUntil,r.rights,r.exactVariantVerified,r.reviewer,r.evidenceReference];
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}
const dateValue = (s: string): number => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(s) ? Date.parse(s) : NaN;
const present = (value: string | undefined): boolean => !!value?.trim();
const approveTime = (reviewedAt: string, validUntil: string, now: number): 'ok' | 'invalid' | 'expired' => {
  const reviewed = dateValue(reviewedAt), expires = dateValue(validUntil);
  if (![reviewed, expires].every(Number.isFinite) || reviewed > now || reviewed >= expires) return 'invalid';
  return now >= expires ? 'expired' : 'ok';
};
/** Never silently accept a self-declared record without a distinct approval and source registry. */
export function gateManufacturerRecords(input: {
  records: readonly ManufacturerListPriceRecord[];
  publishers: readonly ManufacturerPublisherApproval[];
  approvals: readonly ManufacturerPriceEditorialApproval[];
  nowIso: string;
}): { acceptedRecords: ManufacturerListPriceRecord[]; audit: EditorialGateEntry[] } {
  const now = dateValue(input.nowIso);
  if (!Number.isFinite(now)) throw new Error('Invalid editorial gate timestamp');
  const audit: EditorialGateEntry[] = [];
  const acceptedRecords: ManufacturerListPriceRecord[] = [];
  const reject = (variantId: string, reason: EditorialRejection): void => {audit.push({variantId,accepted:false,reason});};
  for (const record of input.records) {
    const {variantId} = record;
    const matches = input.approvals.filter(a => a.recordSha256 === fingerprintManufacturerRecord(record));
    if (matches.length === 0) { reject(variantId,'missing_approval'); continue; }
    if (matches.length !== 1 || input.approvals.filter(a => a.approvalId === matches[0].approvalId).length !== 1) {
      reject(variantId,'ambiguous_approval'); continue;
    }
    const a = matches[0];
    if (a.status !== 'approved' || !present(a.approvalId) || !present(a.manufacturerId) ||
      !present(a.submittedBy) || !present(a.reviewedBy) || !present(a.captureEvidenceReference) ||
      !present(a.variantMatchEvidenceReference) || !present(a.rightsEvidenceReference) ||
      !/^[a-f0-9]{64}$/.test(a.captureSha256) ||
      !/^[a-f0-9]{64}$/.test(a.recordSha256)) { reject(variantId,'invalid_approval'); continue; }
    if (a.submittedBy.trim().toLowerCase() === a.reviewedBy.trim().toLowerCase() ||
      record.reviewer.trim().toLowerCase() === a.reviewedBy.trim().toLowerCase()) {
      reject(variantId,'review_not_independent'); continue;
    }
    if (dateValue(a.reviewedAt) < dateValue(record.verifiedAt)) {reject(variantId,'invalid_approval');continue;}
    const approvalTime=approveTime(a.reviewedAt,a.validUntil,now);
    if (approvalTime !== 'ok') { reject(variantId,approvalTime === 'expired'?'approval_expired':'invalid_approval'); continue; }
    const matchingPublishers = input.publishers.filter(p => p.manufacturerId === a.manufacturerId);
    if (matchingPublishers.length !== 1) {reject(variantId,'unverified_publisher');continue;}
    const publisher=matchingPublishers[0];
    if (publisher.status !== 'approved' || !present(publisher.reviewedBy) ||
      !present(publisher.identityEvidenceReference) || !present(publisher.rightsEvidenceReference) ||
      publisher.rightsScope !== 'internal_list_price_budget_reference') {
      reject(variantId,'rights_unverified');continue;
    }
    if (a.rightsEvidenceReference !== publisher.rightsEvidenceReference) {
      reject(variantId,'rights_unverified');continue;
    }
    if (publisher.reviewedBy.trim().toLowerCase() === a.submittedBy.trim().toLowerCase()) {
      reject(variantId,'review_not_independent');continue;
    }
    const publisherTime=approveTime(publisher.reviewedAt,publisher.validUntil,now);
    if (publisherTime !== 'ok') {reject(variantId,publisherTime === 'expired'?'approval_expired':'unverified_publisher');continue;}
    let host: string;
    try {
      const url=new URL(record.sourceUrl);
      if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) throw new Error('unsafe');
      host=url.hostname.toLowerCase();
    } catch { reject(variantId,'source_not_allowlisted');continue; }
    if (!publisher.exactHosts.some(h => h === host && h !== '' && h !== 'localhost')) {
      reject(variantId,'source_not_allowlisted');continue;
    }
    if (record.rights !== 'authorized' || record.exactVariantVerified !== true ||
      record.sourceKind !== 'manufacturer' || record.evidenceReference !== a.captureEvidenceReference ||
      dateValue(record.validUntil) <= now) {
      reject(variantId,'rights_unverified');continue;
    }
    acceptedRecords.push(record);
    audit.push({variantId,accepted:true});
  }
  return {acceptedRecords,audit};
}
