# Phase271 — Independent review, authentic evidence completion and scientific category knowledge integration

Owner directive of 17 Oct 2026, consolidated. It supersedes `docs/phase270/REPORT.md` as the current status. **Stopped for independent review.**

## A. Starting state

- Start commit `4a7a0f2` (Phase270 closed). Store schema v7. Full suite green.
- Preserved baselines, recorded before any change:
  - the Phase269/270 gold sets and first runs (private, unchanged);
  - the Phase270 extraction results on its documents: subject exact 0.351, precision 0.925, qualitative 1/24;
  - the cross-category baseline before teaching (`evaluation/phase271/cross-baseline.json`).
- Production signing was disabled. Two publication acknowledgements were in force.

## B. Research packages (Stage A, all nine families)

All supplied packages are preserved unmodified in the private `pee-knowledge` repository (`research-packages/`).
Metadata-only inventories are in two places:
- private: `research-inventory/phase271/`, six files;
- public: `evaluation/phase271/research-package-inventory.json`, with no content.

> **Correction (Phase272, 2026-10-17).** The table first published here mislabelled families 04–08 (it listed "04
> Dishwashers v1", "05 Air purifiers v1.0.0 … v1.1.0 companion missing", "06 Ovens / countertop" and unnamed 07/08).
> The rows below are re-derived from the verified `evaluation/phase271/research-package-inventory.json`; nothing else in
> this report changes. The v1.1.0 gap belongs to the robot package (05), not to air purifiers (04).

| Family | Version found (inventory JSON) | State at the end of Phase271 |
|---|---|---|
| 01 Air fryers | reconstruction of compendium v2.2.0 + 34 addenda | taught (Phase269/270); **original v3.9.0 not supplied** |
| 02 Dehumidifiers | consolidated research + restored register R01–R39 | taught (Phase270); provenance reconciled (§C, t271.d2) |
| 03 Coffee machines and grinders | cumulative package | partly taught (Phase269/270) |
| 04 Air purifiers | v1.2.0-research-complete | **taught Phase271** (t271.ai1); nothing missing |
| 05 Robot vacuum cleaners and mops | v1.0.0-research (Supplement 02 alone headed v1.1.0) | inventoried only; `CONSUMER-NEEDS-TEACHING-CASES.json` (the probable v1.1.0 companion) is absent |
| 06 Household dishwashers | v2.0.0-research (embeds countertop v1.0.0) | **taught Phase271** (t271.di1); the separate countertop v1.0.0 zip is byte-identical to the embedded folder |
| 07 Televisions | v1.0.0-research | inventoried only |
| 08 Soundbars | v1.0.0-research | inventoried only |
| 09 Speakers | — | **not supplied** in Phase271 (received in Phase272) |

Nothing missing was regenerated or reconstructed.

## C. Dehumidifier provenance (R01–R39)

The register was reconciled entry by entry, without inventing links or findings.
- **Classes:**
  - 19 regulatory;
  - 6 guidance;
  - 5 partial;
  - 4 peer-reviewed original;
  - 2 government laboratory;
  - 1 independent experiment;
  - 1 synthesis;
  - 1 unresolved.
- **Anomalies:**
  - R38 is cited only in the original text.
  - R39 is never cited.
  - R24 duplicates R02's URL.
- **Teaching version t271.d2:**
  - `upgradeDehumidifierProvenance271` retires the "awaiting provenance" items and applies the restored register.
  - Every lesson is labelled "not re-verified by PEE".
- **Proposal:** at most 10 requests to re-verify R01, R02, R07, R08, R13, R14 and R17. Owner decision needed.

## D. Comparative-result retention (store v8)

- **Table:** `comparative_results271` extends the Phase246/265 store; it is not a parallel store.
- **Database-level guarantees (CHECK constraints):**
  - five identity states: exact variant, named product, equipment class, ambiguous, unresolved;
  - measurand is duration, energy or cost; a cost must be `derived_from_tariff`;
  - `ranking_input=0`;
  - independence and verification are fixed.
- **Duplicates:** `experiment_key` is a content hash. A republished experiment is marked `duplicate_of_revision` and is never counted as a replication.
- **Classes and subjects:**
  - An oven stays an oven, never an air-fryer variant.
  - An article headline is no longer stored as a product: the headline rule in `testDocumentSubject268` applies, and one such product was retired.
- **Comparability (`comparativeEvidence271`):**
  - values are compared only within one experiment and one task, with matched loads;
  - a reduced load (`quantity_reduced`) is not comparable;
  - different experiments are never compared;
  - taught conditions are checked against the recorded codes.
- **Live store:** 87 rows from 2 authentic experiments (a Which? laboratory test and a lovemoney home test), with 48 duplicate rows ignored.
- **Demonstrated chain:** extracted → attributed → retained → retrieved → judged for comparability → used or rejected.
  - "I already have a fan oven…" → `no_purchase_check`. The answer gives the air fryer vs oven kWh for each dish, states the scope and labels the values as publisher-reported and unreviewed.
  - "Which air fryer…" → the evidence is rejected for this choice: no matched same-class experiment exists, and compartments in use are never recorded. The question stays unassessed and nothing is ranked.
- **Tests:** `tests/phase271_comparative_retention.test.ts` (3 tests, fictional data).

## E. Attribution and extraction (development set, tuned — not held-out)

| Phase270 documents | Before | After |
|---|---|---|
| Exact subject attribution | 0.351 | 1.0 |
| Precision | 0.925 | 0.949 |
| Qualitative findings | 1/24 | 11/24 |

How subjects are now resolved:
- appliance lists ("Our appliances:");
- exact-token row labels when one class has several named products;
- the "than the" target rule.

Products are never merged on similar names. These documents were used for tuning, so they are reported as development only.

## F. Held-out extraction (Phase271, frozen before tuning)

The extractor was frozen first (`extractor-freeze-untouched.sha256`) and the gold was annotated before any run. The first run is committed unchanged.

| Five untouched documents | First run | After change |
|---|---|---|
| Quantitative | 0/3 | 0/3 (decibels and seconds are not read) |
| Qualitative | 9/49 (precision 0.50) | 11/49 (precision 0.478) |
| Subjects: correct / incorrect / unresolved | 6 / 2 / 1 | 7 / 2 / 2 |

The "after change" run comes from changes made with this set already seen. Its gains are therefore **not held-out evidence**; they are shown only for transparency.

Qualitative extraction now covers table cells, lists, product headings, reviews without first person and noise outcomes. It keeps `rankingInput:false`.

## G. Air-fryer frozen question

**Assessable:**
- energy vs an owned oven, within one experiment and with the scope stated.

**Not assessable:**
- which air fryer to buy (no matched multi-model experiment);
- cooking quality;
- small-portion use.

**Live pursuit:** 7 of 9 continuation requests used (2 hosts). One request was lost to a 404 listing page. The elapsed-time window expired, so the unspent request budget was carried into a recorded continuation. No robots rule or access control was bypassed.

## H. Runtime vs inventoried knowledge

- **At runtime:** air fryers, coffee and dehumidifiers (t271.d2), plus dishwashers and air purifiers, new in this phase.
- **Inventoried only:** families 06, 07 and 08.
- **Never product facts:** packages teach concepts, conditions and proxy relations only.

## I. Cross-category transfer (dishwashers, air purifiers)

There is no category-specific engine. The teaching is generated from the inventories (`phase271_category_teaching.ts`). The development set and the untouched set are frozen separately.

| Untouched set | Before | After |
|---|---|---|
| Category | 0 | 0.75 |
| Outcomes | 0 | 0.375 |
| Criteria | 0 | 0.357 |
| Proxies | 0 | 0.5 |
| Conditions | 0 | 0.308 |
| Unassessed | 0 | 0.313 |
| Decision | 0.313 | 0.563 |

- The development set scores 1.0, but it was tuned, so that score is not held-out.
- **Failure:** PU7 is classified as a dishwasher.
- **Overlap with the dev set, asserted in tests:**
  - PU1: fine-particle reduction / wildfire smoke;
  - PU2: room coverage / square metres.
- **Regression:** the Phase269/270 sets are unchanged (`cross-regression-check.json` and the `*-phase271-*` runs).

## J. Negative controls

| Case | Control | Result |
|---|---|---|
| WU2, WU3, PU2 | impressive specification | no ranking |
| WU5 | alternative to buying | no ranking |
| PU4 | unmeasurable claim | no ranking |
| PU7 | conflicting evidence | no ranking |
| PU8 | incomparable results | no ranking |

## K. Safeguards

- **Signer:** a `SigningKey270` handle now holds only keyId, environment and public key. Private keys sit in a module-private WeakMap that only `signCompiledCatalog270` can reach.
  - That function signs only a catalog it compiled itself and that passed every policy check.
  - A copied or forged handle is refused (`unknown_key_handle`).
  - There is no general-purpose `sign(bytes)` left.
- **Production signing:** still refused unconditionally. No production key was requested or generated.
- **Publication acknowledgements:** extracted into `applyAcknowledgements`. Each one covers exactly one finding (commit, file, line and value digest).
  - Tests show unrelated findings are not suppressed.
  - They were not broadened.
- **Publication guard:** 0 findings.

## L. Blockers by type

- **Evidence:** no matched same-class multi-model experiment for air fryers; compartments in use are never recorded.
- **Extraction:** decibel and seconds measurements are not read; PU7 is misclassified.
- **Provenance:** the dehumidifier register needs live re-verification (budget needed).
- **Missing material:** the speakers package (09), air fryers v3.9.0, and the robot package's consumer-needs teaching cases (its probable v1.1.0 companion). *(Corrected in Phase272: an earlier wording attributed the v1.1.0 companion to air purifiers.)*
- **Policy:** production signing (owner decision; it stays disabled).

## M. Next milestone

Obtain one matched, multi-model, completed-task air-fryer experiment that records the compartments in use. The source would be either an owner-supplied source or a bounded budget of about 3 hosts and 20 requests. Then re-run the frozen question.

**Owner decisions requested:**
1. the comparative-source budget;
2. the dehumidifier re-verification budget (at most 10 requests);
3. production signing (it stays off);
4. supply of the missing material listed in §L.

## Verification

- `npx tsc -p tsconfig.json` passes.
- `npm test`: 4540 tests passed.
- Publication guard: 0 findings.
- The private snapshot is synced and verified (pee-knowledge `646c335`).
