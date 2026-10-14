/** Experimental opt-in exploration of beneficial near-misses.
 * Not a commercial upsell engine. Uses ONLY admitted evidence already evaluated
 * by rank(); never changes the primary filtered ranking.
 * Thresholds are demonstration policy, not validated consumer or scientific cutoffs.
 */
import { rank } from './engine.js';
import type { Candidate, Evidence, Request, Variant } from './types.js';

export interface TradeoffPolicy {
  enabled: boolean;
  /** If true, budget is strictly non-negotiable and never relaxed. */
  budgetIsHard: boolean;
  maxExtraPricePercent: number;
  maxExtraPriceAbsolute: number;
  minScoreGain: number;
  minSavingAbsolute: number;
  maxScoreLossForSaving: number;
  /** Numeric specification limits that user has explicitly called flexible. */
  flexibleSizeLimits?: Record<string, { maxExtraAbsolute: number; maxExtraPercent: number }>;
}
export type TradeoffKind = 'spend_a_little_more' | 'save_with_similar_fit' | 'slightly_larger';
export interface TradeoffSuggestion {
  kind: TradeoffKind;
  variantId: string;
  comparedWithId: string;
  price: number;
  currency: string;
  priceDifference: number;
  score: number;
  baselineScore: number;
  scoreDifference: number;
  relaxedConstraint: string;
  evidenceIds: string[];
  explanation: string;
}
export interface TradeoffReport {
  primary: ReturnType<typeof rank>;
  suggestions: TradeoffSuggestion[];
  warnings: string[];
}
const DEFAULT: TradeoffPolicy = {
  enabled: false, budgetIsHard: true,
  maxExtraPricePercent: 20, maxExtraPriceAbsolute: 30,
  minScoreGain: 1, minSavingAbsolute: 10, maxScoreLossForSaving: 0.3
};
const EPS = 1e-9;
const isComplete = (c: Candidate) => c.score !== null && c.coverage >= 1 - EPS;
function bestComplete(candidates: Candidate[]): Candidate | undefined {
  return candidates.filter(isComplete).sort((a,b) => (b.score! - a.score!) || a.variantId.localeCompare(b.variantId))[0];
}
function finiteNonNegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be finite and nonnegative`);
}
function baseMatch(v: Variant, request: Request): boolean {
  return v.market === request.market && v.currency === request.currency;
}
function mandatorySpecsMatch(v: Variant, request: Request, ignore?: string): boolean {
  return Object.entries(request.requiredSpecifications ?? {}).every(([key,value]) => key === ignore || v.specifications[key] === value);
}
function eligibleForComparison(v: Variant, request: Request, ignore?: string): boolean {
  return baseMatch(v, request) && mandatorySpecsMatch(v, request, ignore);
}
/** Opt-in alternatives outside one explicitly flexible constraint, plus optional savings. */
export function discoverTradeoffs(
  variants: Variant[], evidence: Evidence[], request: Request,
  overrides: Partial<TradeoffPolicy> = {}
): TradeoffReport {
  const policy = {...DEFAULT, ...overrides};
  const primary = rank(variants, evidence, request);
  const warnings = [
    'All ranking values are synthetic 0–10 demonstration scores, not real product performance.',
    'Policy thresholds are illustrative; score differences are not statistically validated.',
    'These alternatives do not override the original filters or hard constraints.'
  ];
  if (!policy.enabled) return {primary, suggestions: [], warnings};
  for (const [key,value] of Object.entries({
    maxExtraPricePercent:policy.maxExtraPricePercent, maxExtraPriceAbsolute:policy.maxExtraPriceAbsolute,
    minScoreGain:policy.minScoreGain, minSavingAbsolute:policy.minSavingAbsolute,
    maxScoreLossForSaving:policy.maxScoreLossForSaving
  })) finiteNonNegative(value, key);
  for (const [key,limit] of Object.entries(policy.flexibleSizeLimits ?? {})) {
    if (!(key in (request.requiredSpecifications ?? {}))) throw new Error(`No size constraint to relax: ${key}`);
    if (typeof request.requiredSpecifications![key] !== 'number') throw new Error(`Size limit must be numeric: ${key}`);
    finiteNonNegative(limit.maxExtraAbsolute, `${key} maxExtraAbsolute`);
    finiteNonNegative(limit.maxExtraPercent, `${key} maxExtraPercent`);
  }
  const baseline = bestComplete(primary.candidates);
  if (!baseline) return {primary, suggestions: [], warnings:[...warnings,'No fully evidenced in-filter baseline; no superiority claims permitted.']};
  const confirmedBaseline = baseline;
  const byId = new Map(variants.map(v => [v.id,v]));
  const baselineVariant = byId.get(baseline.variantId)!;
  const suggestions: TradeoffSuggestion[] = [];
  const offered = new Set<string>();
  function add(kind: TradeoffKind, candidate: Candidate, variant: Variant, constraint: string, explanation: string) {
    if (!isComplete(candidate) || offered.has(candidate.variantId)) return;
    offered.add(candidate.variantId);
    suggestions.push({kind,variantId:candidate.variantId,comparedWithId:confirmedBaseline.variantId,
      price:variant.price,currency:variant.currency,priceDifference:variant.price-baselineVariant.price,
      score:candidate.score!,baselineScore:confirmedBaseline.score!,scoreDifference:candidate.score!-confirmedBaseline.score!,
      relaxedConstraint:constraint,evidenceIds:[...candidate.usedEvidenceIds],explanation});
  }
  // Explore just beyond an explicitly SOFT budget. Never override a hard budget.
  if (!policy.budgetIsHard && request.maxPrice !== undefined && request.maxPrice > 0) {
    const maxExtra = Math.min(policy.maxExtraPriceAbsolute,request.maxPrice*policy.maxExtraPricePercent/100);
    if (maxExtra > 0) {
      const relaxed = rank(variants,evidence,{...request,maxPrice:request.maxPrice+maxExtra});
      for (const candidate of relaxed.candidates) {
        const v = byId.get(candidate.variantId)!;
        if (!eligibleForComparison(v,request) || v.price <= request.maxPrice || v.price > request.maxPrice+maxExtra+EPS) continue;
        if (!isComplete(candidate) || candidate.score! - baseline.score! < policy.minScoreGain-EPS) continue;
        add('spend_a_little_more',candidate,v,'maxPrice',
          `Costs ${v.currency} ${(v.price-request.maxPrice).toFixed(2)} above the stated limit; stronger fit in this synthetic scoring model. Requires user approval to exceed budget.`);
      }
    }
  }
  // Downsell: a cheaper in-filter product with nearly the same fully evidenced fit.
  for (const candidate of primary.candidates) {
    const v = byId.get(candidate.variantId)!;
    if (!isComplete(candidate) || v.id===baseline.variantId) continue;
    const saving=baselineVariant.price-v.price;
    if (saving+EPS<policy.minSavingAbsolute || candidate.score!+EPS<baseline.score!-policy.maxScoreLossForSaving) continue;
    add('save_with_similar_fit',candidate,v,'none',
      `Saves ${v.currency} ${saving.toFixed(2)} against the leading in-filter option, with a small difference in synthetic fit.`);
  }
  // Numeric maximum size preferences may be relaxed only when explicitly marked flexible.
  for (const [key,limit] of Object.entries(policy.flexibleSizeLimits ?? {})) {
    const maximum = request.requiredSpecifications![key] as number;
    if (!Number.isFinite(maximum) || maximum <= 0) throw new Error(`Invalid size limit: ${key}`);
    const extra=Math.min(limit.maxExtraAbsolute,maximum*limit.maxExtraPercent/100);
    if (extra<=0) continue;
    const rest={...request.requiredSpecifications};delete rest[key];
    const relaxed=rank(variants,evidence,{...request,requiredSpecifications:rest});
    for (const candidate of relaxed.candidates) {
      const v=byId.get(candidate.variantId)!;
      const size=v.specifications[key];
      if (!eligibleForComparison(v,request,key) || (request.maxPrice!==undefined && v.price>request.maxPrice)) continue;
      if (typeof size!=='number' || !Number.isFinite(size) || size<=maximum || size>maximum+extra+EPS) continue;
      if (!isComplete(candidate) || candidate.score!-confirmedBaseline.score! < policy.minScoreGain-EPS) continue;
      add('slightly_larger',candidate,v,key,
        `Exceeds preferred ${key} by ${(size-maximum).toFixed(2)} units, while remaining within budget; requires confirmation that the extra size fits.`);
    }
  }
  suggestions.sort((a,b) => (b.scoreDifference-a.scoreDifference) || a.variantId.localeCompare(b.variantId));
  return {primary,suggestions,warnings};
}
