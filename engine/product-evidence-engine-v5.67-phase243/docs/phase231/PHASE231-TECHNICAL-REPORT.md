# Product Evidence Engine — Phase231 (v5.55.0)

Date: 2026-10-13. Baseline: cumulative Phase230 v5.54.0 source archive; source code and historical research retained. New work is an **offline document-reading improvement**, not a live web research milestone.

## What changed in executable code

- `document_intake/phase228_extract.py`: introduced an intentionally narrow **Poppler coordinate-based multi-component table reader**. It requires a `Name` row with three or more distinct, spatially separated alphanumeric component codes. It reads explicitly labelled scalar fields (`number of elements`, `scanplane aperture`, `field of view`) and refuses duplicate identifiers, parallel numeric contents within a cell, merged/ambiguous cells, vague headings, and rows outside the identifiable table segment. It does not infer a main-product SKU or merge values across variants.
- `src/phase228_document_observer.ts`: admits optional `componentModel` and `componentType` in receipts. Their presence never implies exact `model` verification, an independent test, or rank permission. Page coordinates, source-document SHA-256, extraction method and publisher-claim role remain intact. Existing JSON schema remains backwards-compatible.
- The Python parser now distinguishes dimensional quantities from **compound speed units** (`cm/s`, `mm/s`, `m/s`, `km/h`) and flow `l/s`. The initial Azurion baseline was unsafe: it truncated `6 cm/s` to `6 cm`. The updated reader preserves the unit and refuses partial unit parses such as `cm/something`.
- Added original-style synthetic PDF fixtures, a reproducible generator and TypeScript regressions for scoped component values, duplicate headers, competing values in one cell, insufficient header evidence, compound units and non-retention.
- Added `scripts/phase231-evaluate-original-pdfs.mjs`: optional local evaluation against the **five original user-supplied PDFs** (not included in the package). The accompanying report uses their SHA-256 fingerprints, never replicates the original PDF bodies.

## Empirical evidence and important limitations

| User-provided manufacturer PDF | v5.54 extracted claims | v5.55 extracted claims | Scope |
|---|---:|---:|---|
| Dyson Purifier Big+Quiet Formaldehyde (2p) | 10 | 10 | Unverified producer specifications |
| Dyson Airblade Wash+Dry WD04/WD05/WD06 (6p) | 0 | 0 | Multiple variants remain deliberately unresolved |
| Dreame Aqua 10 Pro Track multilingual manual (156p) | 2 | 2 | English technical page; only first 24 pages analyzed |
| Philips CX50 CompactXtreme (24p) | 0 | 22 | **22 candidate fields scoped to transducer codes**, NOT main ultrasound system |
| Philips Azurion 7 B20/12 (28p) | 1, incorrect `6 cm` | 1, corrected `6 cm/s` | Manufacturer text only; most technical tables remain unparsed |

Eight selected CX50 component/value/page fields were cross-checked against source pages 14 and 15 (8 of 8 matched); they were **selected during implementation and are not held-out testing**. Do not infer general-world precision, recall or product-suitability from these figures. Many legitimate manufacturer specs remain unextracted, notably the table and module sections of Azurion and the model-specific WD04/WD05/WD06 weight/SKU list. This selective reader intentionally prefers abstention over unsafe scope assignment.

Examples of document-grounded extracted values: Philips CX50 pages 14–15 contain `C5-1: 160` elements, `C8-5: 22.4 mm` scanplane aperture, `L12-3: 38 mm` scanplane aperture, `X7-2t: 2500` elements, and `L15-7io: 23 mm` scanplane aperture. Those are claims from a Philips manufacturer document, not independent measurements and not proof of a purchasable SKU in the user's market.

### Comparison to available open-source work

`pdfplumber` v0.11.9 was executed in the development environment against the *original* PDFs. With default settings it recovered an approximately 44-row, 8-column table on Philips CX50 p.14, with plausible component headings. On Azurion p.5, its returned table mixed several table headings/sections; on Wash+Dry p.1 the text strategy fragmented columns. Accordingly, `pdfplumber` is **not an unconditional general solution**. Its geometry/line-intersection model informed the restricted column-scoping approach, but no production dependency was introduced. The executable PEE code continues to rely on the already-used Poppler reader, Python standard library and TypeScript.

Public technical references (research only, not fetched by PEE):
- pdfplumber source, table finder and debug tools: https://github.com/jsvine/pdfplumber
- pdfplumber table algorithm description: https://github.com/jsvine/pdfplumber#extracting-tables
- Poppler pdftotext coordinate/XML options: https://manpages.debian.org/unstable/poppler-utils/pdftotext.1.en.html

## Safety, provenance, restrictions

- Original PDFs transient and file-content extraction bounded; no article/PDF body or original user PDFs included in ZIP.
- Claims retain document hash, page, geometry and extraction method; they are neither independently verified nor promoted into rank-authorized evidence.
- Component codes remain **document-declared subcomponents** (`componentModel`) with `model=null` and `modelAssignment=unresolved`. No variant, national market, SKU, configuration option, or performance conclusion is inferred.
- No OCR, trained PDF model, new npm/Python production dependency or automated PEE Internet acquisition was added.
- Some manufacturer PDFs use visual drawings, merged cells, human-readable formatting or single-model tables that this limited parser deliberately does not handle. Med-tech documents are used strictly as layout stress tests, not for medical product recommendations.

## Verification

- See `PHASE231-REAL-PDF-BENCHMARK.json` and `PHASE231-TEST-RESULTS.json` in deliverables for exact findings and regression status.
- Focused test command (includes inherited suites): `node --test dist/tests/phase228_document_observer.test.js dist/tests/phase229_pdf_geometry.test.js dist/tests/phase230_original_pdf_hardening.test.js dist/tests/phase231_component_pdf_tables.test.js`.
- Full TypeScript shards: `node scripts/run-test-shards.mjs` after `npm run build`. Historical suite exclusions unchanged.
- Real PDF benchmark script accepts all five binary file locations via `--purifier`, `--washdry`, `--dreame`, `--cx50`, `--azurion`.

## Next steps

1. Separate model and variant scopes in document-level specification lines (such as WD04/WD05/WD06), not only multi-column transducer tables. Keep product/component/SKU/voltage configurations distinct.
2. Add support for generic left-label/right-value layout tables with explicit section scope, and ranges/uncertainty (`89.5–119.5 cm`) without silently reducing them to a single scalar.
3. Evaluate on a **held-out collection** of original documents from more independent manufacturers, with human-reviewed source/field/variant annotations and false-attribution measurements. The five provided PDFs do not constitute a robust general benchmark.
4. Prioritize OCR and layout-model complexity only if evidenced by such evaluations. Independently, actual live PEE Internet search/fetch remains unproven.
