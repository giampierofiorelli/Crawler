# Phase 45 — Manufacturer list-price budget signals

## Purpose

Provide *advisory* budget context from authorized, independently sourced manufacturer MSRP/RRP, without collecting or displaying current merchant prices, historical Amazon prices, price alerts, or purchasing-time recommendations.

## Invariants

1. Product ranking runs before and independently of the merchant-link resolver and the MSRP/RRP context module.
2. A manufacturer list price is **not** the current selling price, nor evidence that a strict budget can be met.
3. Unknown, unauthorized, stale, duplicate, wrong-market, wrong-currency, or wrong-variant manufacturer records fail closed (`unavailable`).
4. A flexible budget may show a `slightly_above_list_reference` signal if the official reference is within the user's chosen percentage tolerance (0–30%). Default tolerance is 10%; **strict** budgets never receive this signal.
5. Budget signals are annotations, not a ranking feature, affordability promise, hard filter, or retailer promotion.
6. Launch output contains no numeric manufacturer list prices or merchant prices.
7. No Amazon APIs or Amazon-derived ranking inputs are introduced.

## API

`buildLaunchRecommendation({..., budgetPreference: 'flexible', flexibleStretchPercent: 15})`

Each candidate has `budgetReference.band`, `budgetReference.signal`, and `budgetReference.message`. Signals are:

- `within_list_reference`
- `slightly_above_list_reference` (only flexible budgets)
- `substantially_above_list_reference`
- `unavailable`

For an example budget of £100, a **verified** manufacturer list reference of £112 is slightly above with a 15% tolerance, but not with a 10% tolerance. This does **not** mean the product sells for £112 today.

## Outstanding blockers

- No production manufacturer data or rights evidence has been connected; synthetic tests do not prove real-world recommendation accuracy.
- The engine uses synthetic 0–10 dimension scales; real test normalization and comparability remain open.
- Manufacturer list-price information must not be presented as a current market price or used to guarantee hard-budget eligibility.
- Amazon Associates compliance is not certified by code tests; final review of actual site, disclosures, and link generation remains necessary.
- This is a **budget context** feature, not a price-comparison or purchase-timing feature.
