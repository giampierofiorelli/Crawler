# Product Evidence Engine — Phase 185 technical report

**Date:** 12 October 2026. **Canonical predecessor:** v5.08 / Phase184. **Output:** same-publisher original model consistency check and signed, narrowly scoped source-fact display gate. **Status:** bounded engineering implementation, not approved independent product rankings.

## Summary

A user-provided EPA ENERGY STAR V3.0 CSV was retained byte for byte (SHA-256 `4d7d3203e95ef8c2553a55a51799438470d5f71f01c49c295ede8013d608be91`). The Phase184 intake remains unchanged, including all 247 records, 218 US-market staging candidates, 29 withheld entries and 2,398 quarantined numerical source claims. This phase does **not** promote those claims to Phase181 professional-test evidence.

## Real-source evaluation

Two official product listing presentations were checked against the retained original CSV:

| EPA product ID | Brand/model | Aligned fields | Contradictions found |
|---|---|---:|---:|
| 4027325 | LEVOIT Core 400S | 5 | 0 |
| 4481446 | Alen BreatheSmart 25i | 7 | 0 |

Official primary URLs: https://www.energystar.gov/productfinder/product/certified-room-air-cleaners/details/4027325/export/pdf and https://www.energystar.gov/productfinder/product/certified-room-air-cleaners/details/4481446/export/pdf . Fields comprise CADR for smoke/dust/pollen, IEF and derived room area, with energy/ozone fields additionally checked for Alen. These are **two presentations by the same source**, not two independent laboratory results. The product pages were manually transcribed during research; no PDF bytes were ingested or authenticated by the application. The website data may change after the capture, and neither listing validates a purchasable retail SKU.

Official dataset metadata: https://data.energystar.gov/Active-Specifications/ENERGY-STAR-Certified-Room-Air-Cleaners-V3-0/gaa3-swy6 ; EPA product criteria: https://www.energystar.gov/products/air_purifiers_cleaners/key_product_criteria ; ENERGY STAR third-party certification policy: https://www.energystar.gov/products/air_purifiers_cleaners/partners . AHAM Verifide describes a distinct directory where model performance is independently verified by a third-party laboratory: https://ahamverifide.org/directory-of-air-cleaners/ . Do **not** conflate AHAM tests, official registry display consistency or independent professional consumer reviews.

## Engineering work

`src/phase185_registry_evidence_review.ts` integrates actual Phase184 source-replay verification with a typed evidence boundary. A same-publisher comparison checks exact ESUID, brand, model, official URL, dimensions, physical units, scalar values and source provenance. It records missing fields and conflicts, and labels room size as derived from smoke CADR.

A separate `sourceFacts185` entrypoint accepts a signed, time-bounded permission from an out-of-band pinned authority, scoped to one document hash, EPA entry, check hash, market and named dimensions. At most it projects **source-attributed registry facts for display**. It cannot create `OriginalTest181`, change the catalog, assign value points, disqualify a model or order products. No real independent review signature was issued: the tests use a disposable keypair strictly to verify the authorization protocol. Signature verification authenticates an issuer, not science.

Saved reproducible records: `evaluation/phase185/epa_product_listings_operator_transcription.json`, `evaluation/phase185/epa_crosscheck_audit.json`, plus source and tests. Run `npm run demo:phase185` and `npm run test:phase185`.

## Remaining work

The original CSV does not supply authenticated EPA publisher bytes, confirmed exact retail variant matching or independent original professional test comparisons. Prices, acoustics, replacement filters/costs, current regional availability and suitability for specific user health claims remain outside the evidence. Neither observed equality of EPA fields nor a test signature validates rank weights, scope, complete market coverage or decision quality.

Next: independent authentic source acquisition and test-condition reconciliation; scientific evidence policies per category and measure; admitted, independently reviewed variant observations with approved ranking policy; UX to display source gaps. Keep continuously growing product knowledge and dynamic ranking architecture, no mandatory precomputed lists or chat interface.

## Verified regression and packaging

- Phase185 targeted: **20 passed** including two real-source same-publisher checks, forged review rejection, exact ESUID/model/unit comparisons, stale/replayed review scope, derived-metric dependency and non-promotion to Phase181 ranking.
- Eligible cumulative TypeScript: **2,818 tests / 147 suites**, all passed across 14 groups, consistently excluding quarantined historical Phase91/92 suites.
- Python: **212 tests** across six groups, all passed, with 70 historical SQLite resource warning lines in the companion suite.
- Demo audit: 247 registry records, 2 products crosschecked, 12 equal values, no observed conflicts, **0 actual independent review signatures or product rankings**.
- The automated tests demonstrate software behavior, not statistical generalization, independent expert validation or real-product recommendation accuracy.
