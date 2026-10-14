# Phase 185 — registry evidence boundaries and same-publisher checks

Canonical input: cumulative v5.08, including original user-provided ENERGY STAR Certified Room Air Cleaners V3.0 CSV. Snapshot SHA-256: `4d7d3203e95ef8c2553a55a51799438470d5f71f01c49c295ede8013d608be91`.

## Purpose and limitations

This module addresses a concrete error pathway: a certification registry entry must not be rebranded as an independent professional performance test or a proved retail variant, then sent to Phase181 on-demand ranking as an `OriginalTest181`.

`compareEpaListing185` compares a **manually transcribed** second presentation on the **same EPA publisher website** to the original uploaded CSV. That is a same-publisher consistency check only, **not independent corroboration**. An official URL or human-entered facts are not proof that a page was actually downloaded, independently signed, or untouched. Individual product links and values are preserved in `evaluation/phase185/epa_product_listings_operator_transcription.json`. No trusted external ranking/review key is bundled.

`sourceFacts185` requires an out-of-band, pinned reviewer public key and an exact Ed25519 signature over permission to **display attributable registry facts only**. The unit, model, ESUID, timestamp, source hash and dimension scope must all match. A successful source-display review still cannot authorize a ranking, `OriginalTest181`, a commercial SKU match, pollutant removal claims, or independent performance classification. The test-generated private key is ephemeral and exists only within tests; it is NOT an actual science-review authority.

Room Size (sq.ft.) is derived from smoke CADR, not an independent second measure. ENERGY STAR's own product page states smoke CADR is manufacturer-reported; certification follows EPA recognized certification bodies, but that is not equivalent to a separate consumer comparative review.

## Real check

- LEVOIT Core 400S, ESUID 4027325, EPA listing: https://www.energystar.gov/productfinder/product/certified-room-air-cleaners/details/4027325/export/pdf — 231/240/259 cfm smoke/dust/pollen, 5.8 cfm/W integrated energy factor, 358 sq. ft. derived size.
- Alen BreatheSmart 25i, ESUID 4481446, EPA listing: https://www.energystar.gov/productfinder/product/certified-room-air-cleaners/details/4481446/export/pdf — 97/106/105 cfm smoke/dust/pollen, 6.6 cfm/W IEF, 90 kWh/y annual energy, 0 ppb ozone, 150 sq. ft. derived size.
- Both sources were accessed as web-readable representations and transcribed, not captured as independently attested original publisher byte streams.
- 12 aligned source fields, 0 observed mismatches, 0 review signatures issued in the actual audit, 0 real rank-authorized product observations.

Official methodology: https://www.energystar.gov/products/air_purifiers_cleaners/key_product_criteria ; official dataset: https://data.energystar.gov/Active-Specifications/ENERGY-STAR-Certified-Room-Air-Cleaners-V3-0/gaa3-swy6 ; AHAM Verifide distinction: https://ahamverifide.org/directory-of-air-cleaners/ .

## Reproduce

Run from the root with TypeScript available: `npm run test:phase185` and `npm run demo:phase185`. The demo reads the genuine stored CSV and operator-transcribed listing values to create `evaluation/phase185/epa_crosscheck_audit.json`. No network use; no promotion or ranking. Historical Phase91/92 suites remain excluded in eligible cumulative regression only.

## Next work

Retrieve a genuinely independent comparison method/measurement for the exact physical variant, with access/republication rights, test-condition match and dispute policy. Prefer first acquiring an authenticated publisher-original export and controlled rights metadata before broad automated admission. Do not infer category-wide completeness or product ranking readiness from the two checks.
