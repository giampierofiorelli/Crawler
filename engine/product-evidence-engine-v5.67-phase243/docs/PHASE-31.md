# Phase 31 — Smart Trade-off Discovery (v0.5)

## Purpose
The user may enter a budget or preferred size that excludes an option offering a **meaningful improvement** in the user's actual priorities. The system should explain that near-miss **without changing the requested results**, and should also identify cheaper nearly-equivalent options. This is not an upselling module.

## Implemented
- `src/tradeoffs.ts`: `discoverTradeoffs()` wraps the existing deterministic `rank()` without modifying the original results.
- **Explicit opt-in** (`enabled: true`). Hard budget is the default and is never relaxed. Soft budget relaxation requires `budgetIsHard: false` and is capped by **both** an absolute and percentage ceiling.
- **Size**: only a named, numeric upper limit explicitly marked flexible can be relaxed; both absolute and percentage ceilings apply. Other required specifications, market, currency, and budget remain hard.
- **Symmetric savings**: a lower-priced, almost-as-good fully evidenced in-filter option may be highlighted.
- No suggestion without a fully covered in-filter reference option and fully covered admissible evidence for the suggested product. Evidence IDs accompany every suggestion.
- The primary ranking is preserved byte-for-byte. Alternatives outside filters are in a separate list. No affiliate commissions influence ordering.
- Tests cover strict constraints, cross-market products, missing/unlicensed evidence, insufficient benefits, and unchanged primary results.

## Usage

```ts
import {discoverTradeoffs} from './src/tradeoffs.js';

const report = discoverTradeoffs(variants, evidence, request, {
  enabled: true,
  budgetIsHard: false,       // ONLY if user marked budget flexible
  maxExtraPricePercent: 20,
  maxExtraPriceAbsolute: 30,
  minScoreGain: 1,
  flexibleSizeLimits: {
    widthCm: {maxExtraAbsolute: 3, maxExtraPercent: 10}
  }
});
// report.primary: original in-filter ranking
// report.suggestions: separate, opt-in suggestions
```

The `widthCm` example requires `request.requiredSpecifications.widthCm` to exist as a **numeric maximum**. This is a provisional convention: the existing engine currently treats all required specifications as **exact equality**, so the main ranking will only match an exact width of 30, not all widths <= 30. **This must be replaced with typed constraint operators (`<=`, `>=`, `equals`, etc.) before real consumer use.** The synthetic test fixture deliberately demonstrates an exact-width starting point.

## Critical limitations
1. All scores and test products are synthetic. `minScoreGain`, `maxScoreLossForSaving`, size and budget tolerances are **arbitrary demonstration thresholds**, not empirically validated effect sizes or recommendations.
2. This module operates on the `rank()` in-memory inputs. It is **not yet wired to PostgreSQL**, authenticated approvals, live merchant prices, rights revocation propagation or the production normalization gate. In production it must consume **only a trusted, live, validated evidence snapshot**.
3. `rank()` compares synthetic, compatible 0–10 scales; real cross-source measurements are **not** normalized. No meaningful real-world uplift may be claimed yet.
4. The evidence must actually concern the needs that motivate the recommendation. The current dimension set is fixed to carpet/pet hair/ease, even for the size demonstration.
5. There is no user-facing UI or preference confirmation. In production, users should be able to distinguish absolute vs flexible limits and dismiss trade-off suggestions.
6. The current model lacks stock/availability verification, shipping and total cost, warranty and repairability, and uncertainty intervals. Do not use in live shopping decisions.
7. Suggested products are not automatically a statistically significant improvement. Marketing must not describe numerical differences as a proven "quality leap".

## Next development gate
- Implement typed constraints (hard/soft, min/max/exact, units and tolerance) in the base engine; ensure size is treated as a maximum rather than equality.
- Connect trade-off discovery to a trustworthy snapshot and live merchant offers with revocation-aware caching.
- Run PostgreSQL integration tests on an actual server (not available in this environment), including rights expiry and transaction rollback.
- Establish validated category-specific score calibration and independently assessed recommendation scenarios.
