# Phase 81: new models and permanent model retirement

**Status (10 October 2026):** implemented in deterministic TypeScript with tests and a proposed PostgreSQL migration. No live manufacturer site, scheduler or DB was exercised.

## Requirement clarified

- A **new model** can appear with (a) documented manufacturer specifications only, (b) genuine professional reviews, or (c) independent original laboratory tests. These are distinct evidence states.
- Manufacturer facts can populate a discovery stub and a factual specification record. Manufacturer performance promises cannot become observed performance or independently validated rankings.
- Independently reviewed/tested models are queued for provenance, rights and method appraisal. An available review does **not** by itself approve a public ranking or displace an existing leader.
- **Production discontinued** means a manufacturer/official source conclusively confirms that the exact model is no longer manufactured. It is not inferred from inventory or lack of a retailer listing. Retail `sold out` and `out of stock` are not lifecycle inputs and were removed from this module and proposed lifecycle schema.
- Once confirmed, the model retains its permanent product URL, technical history and existing reviews, but the page gets a highly visible *Fuori produzione* badge and subdued presentation. Its current-product recommendation/comparison eligibility is **always false**, even if there is remaining unopened stock somewhere or a later current listing causes a provenance conflict. An explicit privileged correction to false evidence, if ever necessary, is a separate audited operation, not an automatic reactivation.
- A successor SKU is a **new model record**; it does not revive the discontinued predecessor.

## Components

- `src/phase80_product_lifecycle.ts`: verified official lifecycle sources + monotonic persisted retirement tombstone; conflicts cause review, never automatic revival.
- `src/phase81_new_model_intake.ts`: triage for spec-only, review-led, and original-test-led discovery. Evidence intake is *not* a publication licence.
- `src/phase81_competition_gate.ts`: lifecycle-aware research-only ranking wrapper and product page projection. Missing lifecycle decisions fail closed for *current-product recommendations*.
- `db/migrations/014_model_retirement_and_new_model_evidence.sql`: additive immutability and a view excluding retired models. Proposal only, not applied.
- `tests/phase81_lifecycle_and_new_models.test.ts`: synthetic cases covering archived pages, spec-only vs independently tested launches, inability to reenter rankings, and stock irrelevance.

## Limits and follow-up

Canonical manufacturer model/SKU matching, real authentication of signed/archived sources, identity reconciliation, long-running ingestion, final page UX, rights clearance, database transactional test and production-gate rollout are still pending. Official global production notices may be marked `market: global` and apply across markets, while jurisdiction-specific sources retain the associated market. Cross-market model aliases still require authoritative identity verification.

The legacy `rankPriceFree` and synthetic launch pipeline remain demonstrators. Before production, every ranking endpoint must enforce a shared lifecycle gate at the backend or DB query level. The new isolated wrapper demonstrates the rule; its presence alone cannot guarantee future endpoints use it.
