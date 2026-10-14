# Product Evidence Engine v5.63.0 — Phase239 Technical Report

**Date:** 2026-10-14. **Status:** implemented and locally tested; **no** autonomous live PEE web acquisition or independent lab-performance evaluation demonstrated.

## Executive result

Starting with the **canonical v5.62 Phase238 complete archive**, the Phase239 PDF reader added two restricted manufacturer-authored instruction types:

1. A **cooking-guide tuple** retaining food, **explicitly printed drawer number**, food mass, cooking time interval and recommended temperature together. A complete 3-column header and adjacent food → drawer/timing/temperature → load lines must be present on one physical PDF page. No food identity is inferred from illustrations. Ambiguous or repeated food/drawer pairs are rejected together.
2. A **manual programme control interval** storing explicitly worded thermostat and timer controls, classified as machine settings, not cooking performance or temperature accuracy.

These are new typed fields in the existing Python→TypeScript contract (`DocClaim228.cookingGuideSetting` and `.manualControlSetting`), with validation against malformed values, scopes, verified SKUs and ranking promotion. No new mandatory npm or production Python dependency; PDF parsing still uses installed Poppler via stdin and temporary process memory. The fixture generator optionally uses ReportLab **only during developer fixture creation**; tests consume committed fictional PDFs.

## Frozen, formerly unseen original-PDF check

**Crucial methodological boundary:** The 24 positive targets and 13 specific negative-assignment guards were recorded **before** executing the unchanged v5.62 reader. Unchanged-v5.62 parsed **0** claims across three PDFs. The original baseline and source SHA-256 appear in the cumulative package in `docs/phase239`. The PDFs became **development samples** once used for Phase239 changes; they are not an independent post-tuning holdout.

| Real original (user supplied) | Baseline v5.62 | Phase239 | Interpretation |
|---|---:|---:|---|
| Jamie Oliver by Tefal Dual Air Fryer, EY905J in filename (45 PDF pages) | 0 | **11** | 9 manufacturer cooking-guide tuples, 2 explicit manual controls |
| Tefal/Moulinex Dolci ice-cream maker (56 PDF pages) | 0 | **0** | Icon-based programme headings/variant options not safely resolved |
| Tefal Inicio Grill Adjust, GC242D in filename (8 PDF pages) | 0 | **0** | Pictogram-linked food identities and settings unresolved |

The EY905J manual's physical page 10 has two distinct frozen-fries recommendations: drawer 1, 600 g, 15–20 min at 180°C, and drawer 2, 300 g, 10–15 min at 180°C. It also has a 1.2 kg chicken entry (45–60 min, 200°C) and other full rows. Physical page 8 declares the **manual** thermostat 40–200°C and timer 0–60 min. This is the original author's **guide**, not an independent study or observed result. The filename does **not** establish exact commercial retail-variant equivalence.

**Frozen selected-case recovery: 5 of 24 targets** (the two controls, the two specifically registered fries lines and the registered chicken line). The other six EY905J guide tuples were newly extracted but were not separate positive targets in the frozen registration. **Zero observed violations of the 13 selected negative-assignment guards**. Neither the positive denominator nor the negative checks are a statistically representative estimate of precision, recall or generalization.

Examples of guarded non-claims: physical page 7's **15 cm ventilation clearance is not product width**; Dolci physical page 7's **−22 to −13°C refers to the *external freezer*, not internal cooling**; Dolci's programme icons and *depending on model* footnotes must not become SKU entitlements; Inicio Grill's illustrated 5–11 min value lacks text-grounded food identification; multilingual repetitions are not independent corroboration. Warranty support telephone numbers are irrelevant technical specifications.

## Synthetic regression and safety

Eight entirely fictional PDFs and **12 new tests** cover complete multi-axis cooking guide rows, two separate drawer scopes, authored grams and ranges, independent manual thermostat/timer, no row label, missing load, duplicate food/drawer association, absent heading, absurd temperature, contradictory controls, stable replay and the TypeScript evidence-denial boundary. They are fixtures, not original manufacturer measurements.

- Build: **passed** (`npm run build`).
- New targeted TypeScript tests: **12/12 passed**.
- Cumulative TypeScript: **4,175 passed, 0 failed**. Sixteen ordinary groups (4,158 tests) and the two slower historical Phase91/92 files (17 tests) were completed and logged separately. First overly concurrent batch timed out; its incomplete results are **not** credited. Historical test exclusion status is explicit in the JSON.
- Original replays: all **12 predecessor PDFs unchanged by claim count**; three new PDFs 11/0/0. Existing manufacturer disagreements remain unresolved and are not overridden.
- Entire Python test corpus **not rerun**. PEE runtime autonomous live browsing **not demonstrated**.

## Engineering limitations and next phase

The new cooking-guide recognizer intentionally supports only flat English text-backed PDF tables with explicit 3-column headers and nearby complete rows; it is **not** a general PDF grid model, OCR or icon interpreter. It still scans only the **first 24 physical pages**, and cannot certify edition, geography or purchased SKU identity. More complicated tables may rightly produce zero claims. Both new shapes prohibit independent performance admission and ranking.

**Phase240:** implement evidence-grounded image/icon-to-column matching only if geometric association is independently verified (prefer bounded visual-review candidate path), and pursue another *unseen frozen corpus* to measure false model/component assignment. Consider deterministic layout reading where no heavy extra dependency is needed; alternative parsers must win on held-out accuracy/cost before adoption. The eventual independent live acquisition test must use the actual PEE transport, robots and rights checks, not ChatGPT web browsing.

## Implementation, provenance and links

- Original untouched v5.62 baseline, preregistration with SHA-256, original test diagnoses: `docs/phase239/PHASE239-THREE-NEW-PDF-*`, `docs/phase239/PHASE239-PDFPLUMBER-DIAGNOSTIC.json`.
- Per-original replay with SHA-256 and type counts: `docs/phase239/PHASE239-15-ORIGINAL-PDF-REPLAY.json`.
- Frozen-target tally and negative controls: `docs/phase239/PHASE239-REAL-PDF-EVALUATION.json`.
- Tests and raw group logs: `docs/phase239/PHASE239-REGRESSION-RESULTS.json` and `docs/phase239/test-logs/`.
- W3C table header association guidance: https://www.w3.org/WAI/tutorials/tables/ ; practical PDF-layout diagnostic reference: https://github.com/jsvine/pdfplumber ; Poppler utilities: https://poppler.freedesktop.org/ . These are engineering references, **not evidence** that PEE can interpret arbitrary PDF pages.

No manufacturer PDF originals or publisher prose bodies are included in the release ZIP. The schema retains SHA-256, page/line location, unverified source role, no raw body, no verified exact product variant, no reviewed method, and no ranking authorization.
