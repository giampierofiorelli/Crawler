# Product Evidence Engine — Phase 184 technical report

**Date:** 12 October 2026  
**Canonical predecessor:** v5.07 / Phase183  
**Output:** Real EPA ENERGY STAR room-air-cleaner CSV intake, schema-specific locale support, explicit registry quarantine, source-replay audit, product journal pilot.  
**Status:** software integration tested on genuine user-supplied CSV bytes; no independent lab evidence admission and no product ranking.

## 1. Evidence received and preserved

The attached `ENERGY_STAR_Certified_Room_Air_Cleaners_V3.0_20261012.csv` was actually opened and stored as a local source snapshot, **not downloaded by PEE**. It contains 96,867 bytes, **247 registry rows**, and **36 fields**. SHA-256: `4d7d3203e95ef8c2553a55a51799438470d5f71f01c49c295ede8013d608be91`. `ENERGY STAR Unique ID` has 247 distinct seven-digit identifiers. There are 75 distinct strings in the `Brand Name` column (not necessarily 75 distinct current manufacturers). Source markets are US/Canada combined (220), US only (24) and Canada only (3). These counts are calculations on the supplied original bytes.

Public primary-source metadata: https://data.energystar.gov/Active-Specifications/ENERGY-STAR-Certified-Room-Air-Cleaners-V3-0/gaa3-swy6 ; EPA data license https://edg.epa.gov/EPA_Data_License.html ; program V3 specification https://www.energystar.gov/room-air-cleaners-v30 ; key criteria https://www.energystar.gov/products/air_purifiers_cleaners/key_product_criteria . The specification's effective date is 9 October 2025. Public metadata visible during research may have a different update timestamp or row count from this uploaded CSV; no remote snapshot hash was available to attest that this particular file is an unchanged official download. **Do not call its uploaded filename proof of an EPA-issued snapshot time.**

## 2. Engineering changes, in the original cumulative codebase

- Extended `src/phase183_source_measurement_intake.ts` without replacing its provenance or journal contracts. Now it supports literal source headers including spaces and units, and an **opt-in comma-decimal grammar per column**. Original CSV row byte offsets and hashes remain tied to source bytes; the strict decimal-point default remains intact.
- Added `inspectTechnicalCsv183`, a read-only bounded inspection entrypoint that reuses the existing CSV parser instead of inventing a second one.
- Added `src/phase184_real_epa_registry_pilot.ts`, consuming the original source bytes through the existing Phase183 staging. It refuses old expected hashes, checks registry entry IDs, market and grouped/duplicate model labels, uses explicitly mapped source dimensions and units, and retains every withheld row with a reason.
- Added original source, machine-readable quarantined audit, executable reproduction script, tests and `docs/phase184/README.md` to the release.
- Executed the existing Phase183 journal on an actual LEVOIT Core 400S source row. Recorded smoke CADR 231 cfm and IEF 5.8 cfm/W as unreviewed registry claims. Replay and stale-history checks work; the test does not certify performance or retail identity.

## 3. Actual pilot output (US market)

| Measure | Observed result |
|---|---:|
| Registry entries examined | 247 |
| Source fields | 36 |
| Candidate entries for staging (not proven retail SKUs) | 218 |
| Quarantined numerical source claims | 2,398 (11 per candidate) |
| Grouped/wildcard identity entries withheld | 16 |
| Duplicate brand/model entries withheld | 10 |
| Canada-only entries withheld | 3 |
| Total withheld, all reasons | 29 |
| Catalog promotions / authorized product rankings | **0 / 0** |

The 11 source fields include particulate CADR metrics, CADR per watt, integrated energy factor, estimated annual energy use, ozone emissions and **room area derived from smoke CADR**. These values are measurements/claims under the ENERGY STAR registry evidence class, not independent comparative tests. The test schema did not create normalization weights, composite scores, suitability vetoes, claim endorsement or price judgments.

## 4. Reliability, limits and science admission boundaries

The publisher describes several CADR fields as manufacturer-reported, while the ENERGY STAR certification program involves recognized certification bodies. Accordingly, `certification_registry_manufacturer_reported` is a distinct class; it is not a direct original consumer-laboratory review and must not enter `OriginalTest181(scope:'exact_variant_original_professional_test')` by reassignment or signature alone. The source's EPA `Room Size (sq.ft.)` field is a function of smoke CADR (for standard ceiling assumptions), not independent corroboration. See https://www.energystar.gov/products/air_cleaners and official dataset column descriptions.

The source lacks directly comparable evidence for acoustics at specific fan settings, real filter replacement costs, VOC removal, medical/health effects, prices, precise current retail availability and full market coverage. The 218 staged entries are not 218 independently matched purchasable variants; even apparently unique model numbers can require further identity confirmation. Thus **the uploaded CSV is insufficient to generate an objective overall 'best air purifier' ranking**. Other professional tests and the user's conditions must inform the dynamic comparison.

Integrity here means replay of provided original bytes and internal observation identities. It does **not** verify the source was published unaltered by EPA or supply an authenticated independent science reviewer. The source's public-data license generally allows reuse of EPA-produced public data unless stated otherwise, subject to applicable restrictions and metadata; it provides no warranty. PEE's independent source-access and rights controls remain necessary for autonomous retrieval.

## 5. Tests and reproducibility

- Original-source pilot: `npm run demo:phase184` after TypeScript compilation regenerates `evaluation/phase184/epa_us_quarantined_audit.json` from original CSV bytes and checks replay hashes.
- Targeted Phase183+184: **49 passing TypeScript tests** (37 prior + 12 new), including original CSV audit, model/market traps, comma-decimal handling, wrong source hash, mutation, source-row provenance and journal integration.
- Eligible TypeScript full regression: **2,798 tests in 146 suites**, excluding the historically quarantined Phase91/92 suites, all passing.
- Python regressions: **212 tests in six groups**, all passing; historical warnings involving SQLite connections remain.
- A test count validates the specified software contracts and processing of the supplied source; it is not an independent benchmark of ranking accuracy, product knowledge validity or acquisition automation.

The original file and `evaluation/phase184/epa_us_quarantined_audit.json` are bundled inside the cumulative ZIP. They must remain a **quarantine data set**, never silently promoted to a product catalog.

## 6. Phase 185 priorities

1. Verify an independent fresh EPA export through an approved acquisition route; diff registry ID, published revision, units and source-schema changes against this preserved snapshot.
2. Resolve a small *independently reviewed, held-out* sample of model identities and assess whether registry certification fields can be admitted in a distinct, appropriately weighted **certification-evidence class** without pretending they are independent professional test results. The admission decision must depend on authenticated evidence and policy, not solely a cryptographic hash.
3. Retrieve original professional test measurements for the exact same physical variants and comparable conditions, subject to permissions; store disagreements without erasing previous versions.
4. Connect source-backed, independently approved product knowledge to Phase181's on-demand deterministic ranking, leaving inadequate coverage or missing decisive criteria visible in the first response.
5. Keep source refresh and category novelty work from Phases179–182 and avoid giant dependency installations or Colab requirements.

**No new GitHub repository or local model is required to proceed with this source pilot.**
