# Product Evidence Engine — Phase 183 technical report

**Date:** 2026-10-12  
**Canonical predecessor:** v5.06 / Phase182  
**Scope:** model-exact, rights-declared local tabular observation intake; Phase182 gap-job binding; versioned and conflict-aware staging.  
**Claim level:** software implementation and controlled tests, **not** autonomous original-source acquisition, scientific measurement approval or real-product ranking.

## 1. Engineering outcome

Phase182 could plan permission-aware source retrieval but the test pilot remained metadata-only, because automated commercial access to RTINGS was not established. Phase183 introduces `src/phase183_source_measurement_intake.ts` to handle a separate, narrowly scoped type of source: bounded tabular technical data supplied locally by an authorized operator. It does not introduce a second product ontology or a competing ranking engine.

The new component:

- Requires explicit offline source origin and an operator-controlled rights assessment reference, license URL, market, source revision, protocol version, and source URL. These are **declarations** that a production authority must authenticate; a local function does not confer rights.
- Parses a bounded RFC4180-style UTF-8 CSV, including quoted and multiline fields, with strict duplicate-header, field-count and numerical-format checks.
- Matches **exact brand and model number**, rejects wildcard identity and duplicate matches; cannot silently transfer scores between product variants.
- Maps only explicitly supplied columns to dimensions and units. Values stay *source claims*, not independent observations and not 0–10,000 normalized ranking points. Arbitrary schema metadata is not proof of correct units.
- Emits one stable observation identity per exact variant, source document, measurement, unit, source revision and protocol version; retains exact row byte offsets and SHA-256 digests without storing source row text.
- Connects to a Phase182 exact-variant missing-test job, ensuring the requested dimension, category and market agree with the local source and model.
- Writes an append-only, hash-checked product-scoped journal. Revision, unit and protocol changes can trigger `conflict_requires_review` and cannot overwrite the previous claims.
- Always returns `independentScienceReviewed:false`, `canonicalProductKnowledgeUpdated:false` and `rankingAuthorized:false`. No signatory, independent reviewer or normalization policy is fabricated.

## 2. Genuine primary source investigated

**EPA ENERGY STAR Certified Room Air Cleaners V3.0**, https://data.energystar.gov/Active-Specifications/ENERGY-STAR-Certified-Room-Air-Cleaners-V3-0/gaa3-swy6 . The dataset documents the specification effective 9 October 2025 and, when checked on 12 October 2026, reported a dataset update on 28 September 2026. Metadata includes model identifiers, specific CADR dimensions and units, and the EPA public-data license. Critically, its descriptions identify rated CADR measurements as *manufacturer-reported* under the certification system. A certification listing must not be presented as a hands-on comparative professional review, proof of household outcome, or ranking normalization.

**EPA Data License**, https://edg.epa.gov/EPA_Data_License.html , states that EPA-produced data are normally public domain unless otherwise specified, and disclaims warranties. Individual dataset metadata and access/website conditions still require checking.

**ENERGY STAR Products Tools and Resources**, https://www.energystar.gov/products/productstr , says certified-product files are downloadable as CSV, XML and accessible via API, and that the product lists are updated daily. This supports an incremental source strategy: periodically refresh source snapshots, preserve version and identity, and re-evaluate changed observations.

**ENERGY STAR room air cleaner specification**, https://www.energystar.gov/room-air-cleaners-v30 . Protocol requirements differ by edition, so numbers cannot be mixed without review.

### What was actually accessed

The official metadata and license were read through an external public web research tool. **The PEE worker fetched no live dataset**. The development container lacked DNS access to `data.energystar.gov`; a separate attempted official PDF download also failed. The CSV in automated tests is a short, **hand-authored illustrative fixture**, not the original EPA dataset and not a verified product measurement sample. No real-product dataset was downloaded or retained; no professional testing scores were extracted or admitted.

A correct real pilot needs an authorized, exact original CSV or API export with source snapshot hash, publisher schema and rights/terms/robots assessments appropriate to the acquisition route. Ideally verify at least two exact products and two protocol-comparable metrics, with independently prepared reviewer annotations. Certification-registry readings should enter the correct evidence class, and should not be forced into Phase181's existing `scope:'exact_variant_original_professional_test'` contract.

## 3. Scientific and authorization boundaries

The new staging function cannot produce Phase181 normalized `valuePoints`, `hardOutcome`, or any independently reviewed `OriginalTest181`. It cannot publish a `SignedCatalog181`. It also cannot assign engineering suitability merely from EPA CADR alone: room sizing, airflow, noise and pollutant-specific performance can change the decision and are not all covered by one certificate.

Phase68/69 crawler access continues to require independent rights, terms and live robots review. A locally obtained file with an operator-controlled rights declaration is distinct from a claim that the PEE autonomously crawled that website. For other content sources, do not infer commercial permission solely from public accessibility. The journal's hashes detect accidental/inconsistent rewriting within the provided snapshot but are not an authenticated append-only database or reviewer signature.

## 4. Tests

Targeted TypeScript tests cover exact model identity, duplicate model rows, quoted fields, UTF-8 BOMs and byte offsets, malformed CSV and missing numerical fields, rights-source declarations, publication guard flags, Phase182 job binding and market/scope restrictions, replay idempotency, conflicting source revisions, protocol changes and tampering. 37 targeted TypeScript tests passed; full eligible regression: 2,786 tests across 145 files in 14 isolated groups; six Python groups: 212 tests passed. Historic Phase91/92 TypeScript suites remain excluded; Python tests-companion reported 70 historical SQLite connection ResourceWarning lines. See `tests/phase183_source_measurement_intake.test.ts` and `evaluation/phase183/regression-*.json`. Historic Phase91/92 quarantined suites remain excluded from eligible regression; Python tests remain independent.

## 5. What's next

1. Operator-secured original bulk/API source acquisition (provenance and legally verified permission), with an actual source snapshot and true numeric field definitions.
2. Build a typed scientific evidence admission policy distinguishing certification registry / manufacturer declared data / independent original professional tests, validating measurement procedures and normalization before any ranking.
3. Test a real exact-variant source against independently checked annotations, including wrong-model and mismatched-protocol traps.
4. Connect verified product-specific evidence to the Phase181 catalog and generate on-demand deterministic rankings for confirmed English criteria, preserving coverage gaps.
5. Keep a continuous refresh/change signal for both new and established categories; do not overwrite prior product histories or force users into a chat.

No new GitHub repository or neural-model dependency was required or installed in this phase. Existing research and product knowledge remain canonical.
