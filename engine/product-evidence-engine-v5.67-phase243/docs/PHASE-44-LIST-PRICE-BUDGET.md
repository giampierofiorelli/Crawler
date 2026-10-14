# Phase 44 — Independent manufacturer list-price budget context

## Decision
The launch product recommends the best **product**, not the best **deal**. The ranking engine must never receive Amazon API data, Amazon prices, retailer commissions, or retailer availability. Merchant links are attached only after independent ranking. The site does not offer price history, alerts, market price comparison, or buy-now/wait advice.

## Implementation
- `src/list_price_context.ts` accepts **independent manufacturer MSRP/RRP references** with source URL, variant ID, market, currency, amount, rights, verification time, expiry, reviewer and documentary evidence reference.
- A single verified, unexpired, authorized record for the exact variant and market may produce an indicative `within_reference` or `above_reference` band relative to the user's budget. Conflicting/duplicate, unlicensed, stale, unsupported, or unverified records produce `unknown`.
- The public launch response contains **no monetary amount** and makes no claim about actual retail affordability. No price comparisons are generated.
- A **strict** budget remains *unverified*, not enforced, when only manufacturer list prices are available. This is intentional: it would be misleading to guarantee affordability or remove a product solely from MSRP.
- `buildLaunchRecommendation` computes the ranking first, attaches non-ranking budget context second, and only then resolves approved merchant links. A merchant's commercial information cannot change the winner.

## Critical limitations
- Manufacturer MSRP is not a current selling price. `within_reference` does **not** mean purchasable within budget; `above_reference` does **not** mean unaffordable. This phase must not be presented as hard-budget fulfillment.
- The original `Variant.price` field persists in legacy experimental modules; the restricted launch path bypasses the legacy budget filter. A future schema migration should rename or remove this ambiguous field before real ingestion.
- No manufacturer data feed has been connected; the tests use synthetic examples. Rights status is manually supplied, **not independently verified by software**.
- No legal review or Amazon account approval has occurred. Merchant link compliance remains a separate requirement. This change does not constitute Amazon Associates certification.
- The scoring engine uses synthetic dimensions and has not been validated on real product testing data.

## Validation
Run `npm test`, `npm run test:launch`, and `python3 -m unittest discover -s ingestion -p 'test_*.py' -v`.
