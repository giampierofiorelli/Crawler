# Product Evidence Engine — Phase 235 technical report (v5.59.0)

**Date:** 2026-10-14. **Canonical predecessor:** `product-evidence-engine-v5.58-phase234-FULL.zip`. **Status:** real code updated, TypeScript built and cumulative regression executed offline. **No independent product testing, proven live search or rankings.**

## Why this work was necessary

Five additional original manufacturer PDFs were supplied after the v5.58 release and were annotated **before** modifying the parser. The preregistration records 29 *selected* examples of numerical specifications, model/feature relationships, constraints, and exclusion cases; it is not a complete corpus annotation. The original v5.58 reader extracted **zero** product-specification leads from four of the five, and made **one confirmed false categorical assignment** on the Tefal MultiCook manual. Specifically on printed PDF page **24**, a table header split as `of pasta in the bowl (optional)` was incorrectly promoted to an optional product feature. Initial, unchanged-reader results are preserved in `PHASE235-NEW-PDF-UNSEEN-BASELINE.json` and described in `PHASE235-NEW-PDF-INITIAL-AUDIT.md`.

These sources were unseen **for the first baseline run only**; after using them to design the fixes, they are **development examples**, not holdout evidence of general accuracy. No claims below should be interpreted as a measured recall, precision, safety or recommendation-quality rate on unseen documents.

## Actual implementation

1. **False optional-feature guard** (`document_intake/phase228_extract.py`). The bounded `feature (optional)` reader now excludes grammatically incomplete feature labels beginning with prepositions/articles/conjunctions. The real MultiCook page-24 false positive is eliminated; legitimate complete labels such as `User quality control mode (Optional)` still work. This is not a general semantic table parser.
2. **Multi-model product-catalogue grids**. `catalog_grid_chunks235` recognizes a clearly printed `Product Code` header with 3–9 separate product columns, and numeric rows whose labels explicitly carry a unit: `Capacity (kg)`, `Net Weight (kg)`, or `Spin Speed (rpm)`. It requires a coherent, full-width two-row-or-more grid; each numerical cell remains attached to its **complete, specific column heading** (e.g., `PWM 507` vs `PWM 507 Hygiene`, `PDR 507 HP` vs `PDR 507`). Ambiguous, duplicate, incomplete and mixed-type grids abstain. Claims carry `catalogModel` and `catalogType=document_declared_catalog_product`; they do **not** become verified variants, product selections or independent experiments.
3. **Bounded typed technical-sheet extraction**. Recognizes a small set of author-written `... in kg`, `... in mm`, `... per cycle in l` fields, a specifically laid-out two-line `kWh per 100 operating cycles` field, whole-device dimensions written `H × W × D`, and explicitly written electrical ranges (`V`, `kW`). Structured dimensions carry a vector with named height/width/depth axes; energy and water have separate `measurementBasis` denominators; ranges preserve both bounds, not a misleading scalar. No units are guessed from neighbouring prose.
4. **One unresolved conditional accessory form**. Items literally declared `(on certain models only)` (such as `rice bowl`) can now be represented as `conditional_unresolved`; the manufacturer has **not** identified which model includes them. The rest of conditional logic, such as `if an optional refrigerator is combined` or `only with a selected option`, remains unextracted/under review, not presumed present.
5. **Fictitious identity bug fix**. Poppler splitting `Model identifier` into separate columns previously allowed the old model regex to assert a device named `identifier`. Generic metadata field words (`identifier`, `number`, etc.) can no longer be assigned as a product model. The WWI860 PDF's model identity therefore remains explicitly unresolved in current extracted claims; it is not inferred from the filename.
6. **Typed Python→TypeScript trust boundary** (`src/phase228_document_observer.ts`). Added checks for full catalogue column names, structured vectors, denominator-specific consumptions, conditional item status and the new author-written electrical intervals. A new claim cannot silently be admitted as a verified product/variant or a performance result. All new claims stay publisher-declared, `rankingAuthorized=false`, `testedPerformance=false`, `exactVariantVerified=false`.

The implementation uses existing Python standard library and Poppler `pdftotext`; no new production package dependencies. Original publisher PDF contents are not packaged into the release or retained in resulting claim records; page/line, claim units and SHA-256 are preserved.

## Original five-PDF before-and-after comparison

| User-provided PDF | Untouched v5.58 claim count | v5.59 structured leads | Interpretation |
|---|---:|---:|---|
| Lavazza Classy Pro DWC (36 pp.) | 0 | **0** | Installation-pressure and optional-fridge dependencies are still intentionally unresolved; no invented specs. |
| Tefal MultiCook Advanced 45-in-1 (33 pp.) | **1, incorrect** | **0** | False optional product feature eliminated; multi-axis cooking-program tables still not parsed. |
| Miele WWI860 WCS (4 pp.) | 0 | **10** | Nominal 9 kg load, 94 kg machine weight, dimensions, 49 kWh/100 cycles, 48 L/cycle and electrical intervals, with exact per-field units/bases. |
| Tefal Steam Cuisine 700 CL / 1000 CL (8 pp.) | 0 | **1** | Rice bowl is **conditional on unidentified models**, never marked universally included. Recipe-cooking guidance remains separate. |
| Miele Professional Product Range 2021 (40 pp.) | 0 | **23** | Typed model-column claims on pages 10 and 16, not copied across similar model identifiers. |

Eleven manually chosen positive examples and the prior false-positive negative check pass in a narrow replay (12/12 targeted checks); these were **selected and used for development** and cannot establish population-wide accuracy. The original preregistration also identifies additional values still missed, including Lavazza installation constraints, Tefal program ranges and Miele's material identifier/max spin speed on the individual sheet. Do not misdescribe 29 heterogeneous anchors as 29 comparable positive product specifications.

### Traceable examples from the PDFs

- **Miele WWI860 specification sheet:** p.1, `Load in kg 9`; p.2, energy `49 kWh` **per 100 operating cycles** and water `48 L` **per cycle**; p.3, H/W/D `850×596×643 mm`, `Weight in kg 94`, `Voltage in V 220–240`, and rated load `2.10–2.40 kW`. The source is a manufacturer declaration, not an independent performance test.
- **Miele Professional 2021 catalogue:** p.10, `PWM 507` net mass **98 kg**, distinct from `PWM 507 Hygiene` **101 kg**. P.16, `PDR 507 HP` net mass **68.5 kg**, distinct from `PDR 507` **49 kg**. Multiple catalogues and current commercial SKUs have not been reconciled.
- **Tefal MultiCook:** p.24, the word `optional` applies to a cooking-table salt header, not an optional appliance feature. P.12 complex mode × ingredient × temperature × time relationships must not become unconditional performance metrics.
- **Tefal Steam Cuisine:** p.5, the rice bowl is `on certain models only`. P.8 recipe timing ranges for foods are not a measured intrinsic appliance speed.
- **Lavazza Classy Pro DWC:** p.9 milk tube length depends on whether an optional fridge is combined with the machine. The current structured reader **abstains** rather than asserting 40 cm or 50 cm unconditionally.

## Backward compatibility on the five earlier PDFs

The Python→TypeScript original replay still produces **10** leads for Dyson Purifier Big+Quiet, **10** for Dyson Wash+Dry, **2** for Dreame Aqua 10, **22** for Philips CX50 and **27** for Philips Azurion. These are development-sample, publisher-authored, provisional data and are **not ranked**. Separate, already acknowledged OCR/scanned-document and complex-grid limitations remain.

## Test and release evidence

- TypeScript compile: `npm run build` succeeded.
- Phase235 integration: **13/13** tests passed, with synthetic original PDF fixtures generated in `evaluation/phase235/` and running the real Python reader through the production TypeScript document observer.
- Cumulative TypeScript regression: **4,121 tests passed across 16 shards, no reported failures** (the historical Phase91/92 excluded suites remain outside this approved run; no blanket claim is made for all Python suites).
- Recorded outputs: `docs/phase235/PHASE235-REGRESSION-LOG.txt`, `docs/phase235/targeted.log`, `PHASE235-NEW-PDF-POSTCHANGE-BENCHMARK.json` and `PHASE235-10-ORIGINAL-PDF-OBSERVATIONS.json` (the ten-PDF log has been regenerated after the discovered Miele model-identifier bug was fixed).
- No actual live Internet transport by PEE was executed or verified. A separate ChatGPT web lookup would not constitute that proof.

## Explicit limitations and next priority

This remains a small set of **fail-closed layout/label recognizers**, not a general PDF table reconstruction, autonomous reading comprehension, OCR, full 40-page catalogue audit or exhaustive manufacturer-specification cataloguer. The source parser examines only the **first 24 pages**, at most **90 results**, and might miss or abstain on valid facts. Some tables provide recipe settings, not product specifications. A document may be old, region-specific or superseded. Matching publisher-declared model text does not prove a currently available purchasable product.

Next priority: broad but precise conditional option/installation dependency modelling (without turning conditions into included SKU features), program-specific cooking/recipe table recognition with context, stronger model-ID resolution from multi-line technical sheets, and newly sourced original PDFs annotated **before** another tuning cycle. Preserve all existing research/dependencies and original-evidence admission gates.

## Technical references

- Poppler `pdftotext` command manual: https://manpages.debian.org/unstable/poppler-utils/pdftotext.1.en.html
- `pdfplumber` open-source geometry/table implementation (design reference; **not** a PEE production dependency): https://github.com/jsvine/pdfplumber
- PDF Association technical PDF resource: https://pdfa.org/resource/pdf-specification-index/
- W3C WAI tables introduction (conceptual reference for explicit row/column semantics, not proof PDF itself provides table associations): https://www.w3.org/WAI/tutorials/tables/
