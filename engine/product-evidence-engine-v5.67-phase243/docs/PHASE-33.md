# Phase 33 — Purchase Decision Intelligence (v0.6)

## Decision: do not collapse three decisions into one opaque score

1. **Product fit**: the best-fit ranking from `rank()` remains unchanged.
2. **Purchase opportunity**: per-variant exact-SKU, market, currency and condition; currently observed offer and historical context.
3. **User's decision**: urgency and willingness to pay/wait are user choices, not inferred instructions to buy.

The module `src/purchase_decision.ts` returns an ordered shortlist with offer and timing annotations. A second-best fit may be attractive to buy today, but the code **never silently replaces the best-fit winner** or issues a buy/wait forecast.

## Contract and usage

`assessPurchaseDecision({ fit, offers, history, market, currency, asOf, urgency, maxDeliveryDays, maxOfferAgeHours, minHistoryDays })`

- `fit` is an already evaluated `RankingResult`; incomplete evidence is not silently made comparable.
- `offers` contain fresh timestamped merchant observations. The best offer is the cheapest **total price including shipping**, restricted to the same market, currency, exact variant and new condition.
- `history` contains timestamped comparable total prices. A daily minimum is counted once per calendar day; median is descriptive and calculated only when enough distinct days exist.
- `urgency: immediate` can require delivery within `maxDeliveryDays`. `weeks` and `flexible` do not impose that immediate delivery condition.
- The return includes `bestFitVariantId`, the original-order `shortlist`, and `immediateAlternatives` only when the user needs the item immediately.

## Hard limits — not production-ready

- No statistical price prediction or claim that waiting will lower prices.
- The ±5% labels around observed median are **illustrative UI bands**, not a validated price-timing model.
- Historical observations can be sparse, biased by source or season, and do not yet use a bounded rolling lookback or completeness estimate. The `minHistoryDays` policy is necessary but not sufficient.
- A historical median is not an expected future price, fair price, or guaranteed saving.
- No merchant trust scoring, warranty/returns assessment, taxes, cross-border duties, delivery guarantees, price tracking subscriptions, alerting, or affiliation reconciliation.
- Offers and history are passed as data; no live merchant connector is claimed.
- This phase uses the v0.5 experimental engine and **synthetic fit scores only**. Real review-score normalization remains unvalidated.
- Future versions must add source authorization, timestamp provenance, validity windows, historical coverage and out-of-sample backtesting before any predictive or imperative timing recommendation.

## Acceptance criteria covered by automated tests

- Fit winner is never replaced by a price signal.
- Price comparison includes shipping.
- Stale offers, wrong market, wrong condition, too-slow delivery are excluded.
- Incomplete fit evidence is not promoted as an actionable quality alternative.
- Historical daily duplicate snapshots cannot inflate history sample days.
- Future history is excluded; insufficient history yields no timing signal.
- Invalid prices and freshness policies fail closed.
- No mutation of the original ranking object.

## Next phase (not yet built)

Build a validated observation pipeline for real, authorized price sources with price history retention, precise SKU matching, time-bound price coverage, returns/warranty metadata, and a controlled experiment that measures whether the purchase context changes informed decisions and regret—not just conversion rate.
