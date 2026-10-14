# Product Evidence Engine — Phase 233 technical report (v5.57.0)

**Date:** 13 October 2026. **Canonical predecessor:** `product-evidence-engine-v5.56-phase232-FULL.zip`. All work in this phase was offline. The current execution environment was not used to establish working live Internet access for the PEE. None of the five original manufacturer PDFs is packaged in the software ZIP.

## Specific defect and engineering objective

The previous reader was able to extract several scalar specifications and explicit multi-variant weights, but did not model numeric intervals. A specification such as `89.5-119.5 cm` must not silently become a single measurement, and a voltage or C-arm measurement must not be attached to an unrelated variant or component.

Original document cases established before modification:

- Philips **Azurion 7 B20/12**, PDF page 5: source-image distance is `89.5-119.5 cm` for the **frontal C-arm** and `87.9-130.6 cm` for the **lateral L-arc**. The two values are not interchangeable.
- Dyson **Airblade Wash+Dry** technical specification, PDF page 1: input voltage is **100–120 V** under `low voltage`, **200–240 V** under `high voltage`. The document also specifies an operating temperature range of **0–40 °C** (in a dual Fahrenheit/Celsius expression) and required water pressure of **14.5–116 psi**.

These are manufacturer-authored specifications, not independent tests. The labels and values above were checked against the supplied PDF pages; no source URL is invented for uploaded documents.

## Implementation

1. `document_intake/phase228_extract.py` adds `interval_chunks233` and `_bounded_interval233`: bounded, explicit author-written ranges using a narrow label whitelist. It accepts complete intervals only, rejects descending/equal bounds and unrecognized tails, and preserves both endpoints and the unit. It does not calculate unit conversions. Fahrenheit/Celsius parallel range notation is accepted only when both published temperature spans are present in a recognized format; the source's Celsius values are used rather than converting the Fahrenheit values.
2. C-arm geometry is scoped only to an explicitly named `technical specifications frontal C-arm` or `technical specifications lateral L-arc` section and only for the corresponding *source image distance* fields. That scope is not propagated onto other quantities. Voltage qualifiers are recorded as conditions (`low voltage`/`high voltage`), not inferred as stock-keeping variants or market availability.
3. A range claim has `value: null` and its own structured `{lower,upper,unit}` property, preventing scalar consumers from treating the lower endpoint as a point estimate. The interval has `scopeComponent` and/or `condition` if explicit; `optionStatus` remains `not_established`, avoiding a false claim of standard/optional availability.
4. `src/phase228_document_observer.ts` types these claims and validates their boundaries, unit consistency, scope, non-scalar value and unverified evidence status at the Python/TypeScript boundary. Claim IDs incorporate the source hash and complete range scope.
5. `tests/phase233_scoped_pdf_numeric_ranges.test.ts`: **9** new positive and negative tests. `evaluation/phase233/` contains four synthetic fixture PDFs and an optional developer-only generator (`reportlab`, *not* a runtime dependency). `scripts/phase233-evaluate-original-pdfs.mjs` replays the original five PDFs supplied by the user, preserving only hash, structured result and source locations in the output.

No changes were made to the core autonomous search configuration, rights/access behavior, scoring or ranking. No new runtime dependencies were introduced.

## Empirical checks, original five manufacturer PDF documents

| Manufacturer document | Prior (232) claim count | Phase 233 claim count | Newly extracted interval claims |
|---|---:|---:|---:|
| Dyson Big+Quiet formaldehyde purifier | 10 | 10 | 0 |
| Dyson Airblade Wash+Dry | 6 | **10** | 4 |
| Dreame Aqua 10 Pro Track | 2 | 2 | 0 |
| Philips CX50 | 22 | 22 | 0 |
| Philips Azurion 7 B20/12 | 1 | **3** | 2 |

All **6/6 manually chosen original-document interval anchors** were found with the intended lower and upper bounds, unit, document page and scoped condition/component. The **6 earlier Dyson variant weight claims** and **22 earlier Philips CX50 transducer component claims** remain present. Azurion's previously recognized `6 cm/s` is retained as speed, not length.

**Evidence-quality limits:** These five PDFs were already reviewed during development. This is an *in-sample regression check*, not a held-out evaluation, and it cannot establish general extraction precision, recall, or false-attribution rate. Synthetic test passes cannot substitute for an independent original-document corpus. The current parser handles only a limited set of interval layouts and explicit labels. It intentionally abstains on more complex tables, mixed units, unrecognized qualifiers, and ambiguous optional/variant hierarchies.

## Verification actually executed

- `npm run build`: TypeScript compilation **passed**.
- 24 focused tests (phase 231, 232, and 233 files): **24 passed, 0 failed**. Nine tests were added in this phase.
- Full allowed compiled TypeScript regression: **4,099 passed, 0 failed**, across **16 shards**, via `node scripts/run-test-shards.mjs`.
- Original PDF replay: five originals analyzed offline; 6/6 selected range anchors matched. Every new range remains a publisher statement, `model=null`, `modelAssignment=unresolved`, `testedPerformance=false`, `rankingAuthorized=false`, without original PDF bodies or article text in emitted receipts.
- As in previous phases, the old inconclusive legacy test suites 91 and 92 are not represented as validated by this regression count.

## Known limitations / next action

1. General multi-option and per-SKU hierarchies (standard vs optional vs available-as-accessory) still require deterministic, source-grounded scope. `optionStatus=not_established` is deliberate.
2. Intervals in elaborate tables, mixed-language PDF pages, split-line labels, values such as `100–120 V at 60 Hz`, and several unit families remain unsupported. The `24`-page/PDF size limits and OCR restrictions are unchanged.
3. Evaluate against newly obtained, blinded/held-out manufacturer technical specification PDFs from unrelated document layouts, with annotations before changing the extractor. Track exact variant-component attribution errors, not just the number of claims detected.
4. Verify Internet access and general search in a runtime that can actually reach an authorized search engine. This step remains **not demonstrated** and cannot be replaced by ChatGPT browsing.

Reference implementation documentation already preserved in the cumulative pack: [Poppler pdftotext](https://manpages.debian.org/unstable/poppler-utils/pdftotext.1.en.html), [pdfplumber source](https://github.com/jsvine/pdfplumber). These were not installed as new PEE dependencies during phase 233.
