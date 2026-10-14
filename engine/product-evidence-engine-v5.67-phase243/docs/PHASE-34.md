# Phase 34 — Authorized Price Observation Foundation (v0.7)

## Purpose
Build a controlled foundation for real-world price histories **without claiming a working live price feed, validated predictions, or a buy-now model**. The product-fit ranking remains separate from purchase opportunity. The user may prefer to wait, buy a second-best fit today, or pay more for the best fit knowingly.

## Implemented
- `src/price_observations.ts`: `quarantinePriceFeed()` validates feed permission, documented usage scope, merchant/market/currency, verified exact variant identity, landed price including shipping and tax, timestamps and HTTPS product URLs. **All accepted records remain quarantined** until independently reviewed and persisted.
- `summarizeMerchantHistory()` computes **descriptive** historical statistics for one merchant and exact variant, with a bounded lookback, independent observed days, coverage ratio, and gap controls. It does not combine changing retailer panels into an apparently continuous series.
- `db/migrations/004_price_observations.sql`: append-oriented observation table, rights source table, review gate, and a read-time approval view. Rights revocation/expiry immediately affects the view. SQL has **not been executed on a live PostgreSQL instance**.
- `tests/price_observations.test.ts`: adversarial cases for permissions, duplicates, variant identity, missing tax/shipping, source scope, time, and insufficient historical coverage.

## What this phase does NOT do
- No API connection, price crawling, scraping, or license acquisition. Example URLs and merchants are fictional placeholders.
- No verified merchant SKU/GTIN mapping workflow yet. The `identityVerified` field must come from an external human-reviewed identity process, not be accepted from untrusted input as proof.
- No persisted ingestion transaction or reviewer authentication for price feeds. `review_status` is a gate, not a security system.
- No validation against a live PostgreSQL database. No alert scheduler or notifications.
- No tax jurisdiction calculations, warranty/returns score, marketplace seller assessment, coupons, dynamic shipping by postal code, currency conversion, or final checkout price guarantee.
- No statistical forecasts. **A historical median is not the future expected price, the fair value, or guaranteed savings.**
- The history summary is a per-merchant description; a market-wide low-price history requires a documented stable retailer panel or a coverage-adjusted method.
- Even with 50% day coverage, sampling can be systematically biased (promotional periods, feed outages, time-of-day effects). Thresholds are configurable engineering heuristics, not empirically validated.

## Data provider due diligence (before connecting one)
For each source, obtain a signed/commercially valid agreement covering: price display, retention/history, geographic markets, rate limits, data freshness, attribution, resale restrictions, use in automated ranking, audit rights, and withdrawal/deletion obligations. Confirm retailer identity and whether marketplace sellers are included. Verify exact GTIN/MPN/SKU and regional configurations. **Never treat a public URL or a technically accessible API as a license.**

## Recommended next experiment
1. Select one category, one market and a *small set of sources with explicit data rights*.
2. Log price observation coverage and outages over time before issuing any timing advice.
3. Compare descriptive medians with a naive baseline; only consider prediction after sufficient data for out-of-sample, time-split backtests (including promotions, seasonality, and merchant-panel churn).
4. User study: measure comprehension, choice quality, regret, and willingness to wait **in addition to affiliate conversion**. Never use fabricated urgency or scarcity claims.
5. Keep product-fit winner and timing status separately visible for every ranked product.

## Run
`npm install && npm test` and `python3 -m unittest discover -s ingestion -p 'test_*.py' -v`.
