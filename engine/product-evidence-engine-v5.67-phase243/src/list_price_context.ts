/** Independent manufacturer RRP/MSRP context. NOT an offer, a retail price, or a budget guarantee.
 * Does not use Amazon or merchant data. Never excludes/reorders ranked products.
 */
import type { Market } from './types.js';

export interface ManufacturerListPriceRecord {
  variantId: string;
  market: Market;
  currency: string;
  amount: number;
  sourceKind: 'manufacturer';
  sourceUrl: string;
  verifiedAt: string;
  validUntil: string;
  rights: 'authorized' | 'unknown' | 'prohibited';
  exactVariantVerified: boolean;
  reviewer: string;
  evidenceReference: string;
}
export type BudgetPreference = 'none' | 'flexible' | 'strict';
export type ListPriceBand = 'within_reference' | 'above_reference' | 'unknown';
/** Advisory MSRP/RRP proximity; never a selling-price claim or eligibility gate. */
export type BudgetReferenceSignal = 'within_list_reference' | 'slightly_above_list_reference' | 'substantially_above_list_reference' | 'unavailable';
export interface ListPriceContext {
  variantId: string;
  band: ListPriceBand;
  message: string;
  signal: BudgetReferenceSignal;
}
export interface ListPriceAssessment {
  contextByVariant: Record<string, ListPriceContext>;
  warnings: string[];
}
const dateValue = (s: string): number => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(s) ? Date.parse(s) : NaN;
/** No redirects or non-HTTPS links are accepted as manufacturer evidence URLs. */
function validEvidenceUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && url.hostname.includes('.') && !url.username && !url.password &&
      !url.hash && !['localhost', '127.0.0.1'].includes(url.hostname) &&
      !url.hostname.endsWith('.local') && url.port === '';
  } catch { return false; }
}
export type ListPriceRejection = 'missing' | 'ambiguous' | 'invalid_source' | 'invalid_rights' |
  'variant_unverified' | 'invalid_amount' | 'invalid_dates' | 'stale' | 'missing_review';
export interface ListPriceAuditEntry { variantId: string; accepted: boolean; reason?: ListPriceRejection; }
/** Audit deliberately excludes amounts, URLs, and retailer data. */
export function auditManufacturerListPrices(input: {
  variantIds: readonly string[]; records: readonly ManufacturerListPriceRecord[];
  market: Market; currency: string; nowIso: string;
}): ListPriceAuditEntry[] {
  const now = dateValue(input.nowIso);
  if (!Number.isFinite(now)) throw new Error('Invalid assessment timestamp');
  return input.variantIds.map(variantId => {
    const matches = input.records.filter(r => r.variantId === variantId && r.market === input.market && r.currency === input.currency);
    const reject = (reason: ListPriceRejection): ListPriceAuditEntry => ({variantId, accepted:false, reason});
    if (matches.length === 0) return reject('missing');
    if (matches.length !== 1) return reject('ambiguous');
    const r = matches[0];
    if (r.sourceKind !== 'manufacturer' || !validEvidenceUrl(r.sourceUrl)) return reject('invalid_source');
    if (r.rights !== 'authorized') return reject('invalid_rights');
    if (r.exactVariantVerified !== true) return reject('variant_unverified');
    if (!Number.isFinite(r.amount) || r.amount <= 0) return reject('invalid_amount');
    const from = dateValue(r.verifiedAt), to = dateValue(r.validUntil);
    if (!Number.isFinite(from) || !Number.isFinite(to) || from >= to || from > now) return reject('invalid_dates');
    if (now >= to) return reject('stale');
    if (!r.reviewer?.trim() || !r.evidenceReference?.trim()) return reject('missing_review');
    return {variantId, accepted:true};
  });
}
const noRetailGuarantee = 'Manufacturer list-price reference only; not a current selling price or a guarantee of affordability. Check the retailer price.';
/** Fail closed: unknown rights, ambiguous duplicates, stale records or mismatched variants yield no band. */
export function assessManufacturerListPrices(input: {
  variantIds: readonly string[];
  records: readonly ManufacturerListPriceRecord[];
  market: Market;
  currency: string;
  budget?: number;
  preference: BudgetPreference;
  /** Opt-in tolerance for a flexible budget, as a percentage (0..30). Never applies to strict. */
  flexibleStretchPercent?: number;
  nowIso: string;
}): ListPriceAssessment {
  const now = dateValue(input.nowIso);
  if (!Number.isFinite(now)) throw new Error('Invalid assessment timestamp');
  if (input.budget !== undefined && (!Number.isFinite(input.budget) || input.budget <= 0)) throw new Error('Invalid budget');
  const stretch = input.flexibleStretchPercent ?? 10;
  if (!Number.isFinite(stretch) || stretch < 0 || stretch > 30) throw new Error('Invalid flexible budget tolerance');
  const warnings: string[] = [];
  if (input.budget !== undefined) warnings.push(noRetailGuarantee);
  if (input.preference === 'strict' && input.budget !== undefined)
    warnings.push('Strict budget cannot be guaranteed without current selling prices. No candidates are removed on the basis of list prices.');
  const contextByVariant: Record<string, ListPriceContext> = Object.create(null);
  const audit = auditManufacturerListPrices(input);
  for (const [index, variantId] of input.variantIds.entries()) {
    const matching = input.records.filter(r => r.variantId === variantId && r.market === input.market && r.currency === input.currency);
    const valid = audit[index].accepted;
    const band: ListPriceBand = !valid || input.budget === undefined || input.preference === 'none' ? 'unknown' :
      matching[0].amount <= input.budget ? 'within_reference' : 'above_reference';
    const signal: BudgetReferenceSignal = band === 'within_reference' ? 'within_list_reference' :
      band === 'above_reference' && input.preference === 'flexible' && matching[0].amount <= input.budget! * (1 + stretch / 100)
        ? 'slightly_above_list_reference' :
      band === 'above_reference' ? 'substantially_above_list_reference' : 'unavailable';
    const message = band === 'within_reference' ? 'Manufacturer list-price reference falls within your stated budget; actual selling price may differ.' :
      band === 'above_reference' ? 'Manufacturer list-price reference exceeds your stated budget; the actual selling price may be lower or higher.' :
      'No verified, authorized manufacturer list-price reference for budget guidance.';
    contextByVariant[variantId] = {variantId, band, message, signal};
  }
  return {contextByVariant, warnings};
}
