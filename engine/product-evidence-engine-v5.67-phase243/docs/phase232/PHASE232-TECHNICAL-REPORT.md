# Product Evidence Engine — Phase232 technical report (v5.56.0)

Date: 2026-10-13. Canonical predecessor: `product-evidence-engine-v5.55-phase231-FULL.zip`. Offline phase; autonomous Internet browsing by the PEE remains unverified.

## Evidence-led defect

Five original user-provided manufacturer PDFs were examined during phases 230–231. The 6-page Dyson Airblade Wash+Dry PDF contains explicit weight assignments for variants WD04, WD05 and WD06 on page 1, including line wraps, but Phase231 had returned zero numeric claims. This is a scope/format defect, not a lack of data in the source. The other four documents serve as regression comparators.

## Executable changes

1. `document_intake/phase228_extract.py` now has a strictly limited `variant_weight_chunks232` branch for complete manufacturer-authored fields `net weight`, `packaged weight`, `unit weight`, and `shipping weight`. It recognizes two or more distinct alphanumeric variant IDs in an explicit `model = value kg` mapping, including manufacturer-specified `lb / kg` dual units. No unit conversion occurs. It permits a single wrapped continuation (optionally separated by one empty layout line), only when the preceding field ends with a semicolon and the next line begins with a further model assignment. It rejects partially parsed lines, duplicate identifiers, ambiguous ranges, incomplete units and extra prose.
2. Each extracted claim retains `variantModel` and `variantType=document_declared_product_variant` with a page/line locator, source-document SHA-256 and `sourceRole=publisher_document_claim_unverified`. `model` remains null, `modelAssignment=unresolved`, and `exactVariantVerified=false`. No ranking is permitted.
3. `src/phase228_document_observer.ts` now types the additional optional fields and validates these unresolved-scope invariants at the Python-to-TypeScript boundary. This does not install a third-party dependency or modify the existing HTTP acquisition policy.
4. `tests/phase232_variant_pdf_weights.test.ts` adds nine negative/positive unit tests, with a deterministic synthetic PDF fixture generator and fixture PDFs in `evaluation/phase232/`. `scripts/phase232-evaluate-original-pdfs.mjs` compares the exact five originals via temporary local reads, checks receipt invariants and selected documented values, and produces JSON without copying the PDF bodies.

## Empirical original-document replay

| Document | Phase231 | Phase232 | Interpretation |
|---|---:|---:|---|
| Dyson purifier Big+Quiet | 10 | 10 | Unverified manufacturer data; no difference |
| Dyson Airblade Wash+Dry WD04/05/06 | 0 | **6** | Explicit variant weights (3 net + 3 packaged) |
| Dreame Aqua 10 Pro Track | 2 | 2 | Unverified manufacturer data; no difference |
| Philips CX50 | 22 | 22 | Component-scoped measurements for ultrasound transducers |
| Philips Azurion 7 B20/12 | 1 | 1 | Earlier `cm/s` unit correction retained |

The six *selected during development* Dyson PDF page-1 anchors were manually checked: net weights WD04 4.25 kg, WD05 4.52 kg, WD06 8.38 kg, packaged weights WD04 6.06 kg, WD05 6.64 kg and WD06 12.41 kg. All 6 are present in the current output, preserving the correct variant and unit. **This is an in-sample check, not a statistical claim of real-world recall or accuracy.** Every extracted number is a manufacturer declaration, not an independent experiment. All of the original document binaries remain outside both ZIP packages.

## Executed verification

- Compilation: `npm run build`, succeeded.
- Focused inherited and new suites: **43 passed, 0 failed**, including 9 new tests.
- Full allowed TypeScript regression suite: **4,090 passed, 0 failed**, across 16 shards using `node scripts/run-test-shards.mjs`. The two pre-existing problematic legacy suites remain excluded as in prior phases; this report does not claim they were executed.
- Original-PDF replay: 5/5 files read, 6/6 manually annotated Dyson variant anchors matched, no publisher PDF body retained in receipts; four prior document counts unchanged.

## Limits, next research and development

- Only narrow explicitly written *weight* variant mappings are handled. General per-variant technical tables, voltage-specific SKUs, complex component/optional feature hierarchy, PDF numeric ranges and OCR remain unresolved. A successful parse does **not** verify that a particular variation can be purchased in the user's market.
- The PEE still cannot demonstrate live general web search, fetching or scientific evidence ranking in this container. Only local tests and document processing occurred.
- No held-out corpus from unrelated manufacturers was evaluated in this phase; do not infer general accuracy from five in-sample examples.
- Next: safely extract genuine ranges as intervals, correctly bind section-scoped manufacturer options and SKUs to variants/components, then evaluate on held-out original documents. Evaluate external model-based PDF reading only if precision/false-binding error on independently annotated files justifies costs and deployment.

Earlier technical source comparisons already in the cumulative package: `docs/phase231/PHASE231-TECHNICAL-REPORT.md` (pdfplumber / Poppler). Official code references: https://github.com/jsvine/pdfplumber and https://manpages.debian.org/unstable/poppler-utils/pdftotext.1.en.html. No new live GitHub repository was integrated or executed.
