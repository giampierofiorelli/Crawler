# Product Evidence Engine — Phase 234 technical report (v5.58.0)

**Date:** 14 October 2026. **Canonical predecessor:** `product-evidence-engine-v5.57-phase233-FULL.zip`. All changes and tests are offline. No PEE autonomous live Internet access is claimed.

## Objective and original-document defect

The PDF intake used to extract author-declared physical specifications, component-table values and intervals, but could not encode an item's expressly stated **standard/optional** status. An accessory mentioned in a manufacturer technical sheet is not automatically fitted to every machine and a feature listed as optional is not a guaranteed included capability. In the provided **Philips Azurion 7 B20/12** PDF, page 9 includes **Standard accessories (patient table)** and **Optional accessories** in the right column; page 19 explicitly labels **ClarityIQ technology (Optional)**. These are manufacturer declarations, not independent performance tests, proof of installed configuration or current SKU availability.

## Implementation

- `document_intake/phase228_extract.py`: added `authored_status_chunks234`, a bounded recognizer for *explicit parenthesized status* (`feature (optional|standard)`) or an accessory list that begins with **Standard accessories (named component)** and can switch to **Optional accessories** only in the same spatial column and on the same PDF page. The inferred target never becomes a verified SKU. A conditional item such as “Set of arm supports (if cradle option is chosen)” is omitted from unconditional status claims; so are unscoped optional lists, marketing sentences, a separated footnote and text past an interrupted list.
- New categorical claims have `value:null`, `unit:'availability'`, `availabilityKind:feature|accessory`, `optionStatus:standard|optional`, and an explicit `scopeComponent:'patient table'` **only** for scoped accessory items; otherwise `scopeComponent:null`. The `model` stays `null` and `modelAssignment:'unresolved'`. Provenance includes page, line and original PDF SHA-256, without storing document text in the emitted receipt. The claim is a *publisher statement needing review*: `testedPerformance:false`, `exactVariantVerified:false`, `rankingAuthorized:false`.
- `src/phase228_document_observer.ts`: typed the categorical claims and added a fail-closed check at the Python→TypeScript boundary. Wrong status, unit, numerical values, untrusted scope, product/variant promotion or `rankingAuthorized:true` is rejected. Phase233 interval validation remains unchanged and still requires `optionStatus:'not_established'`.
- `tests/phase234_pdf_explicit_option_scope.test.ts`: 9 integration tests, including positive and negative cases. `evaluation/phase234/` contains 4 synthetic PDF fixtures and optional developer-only ReportLab generator (not a runtime dependency).
- `scripts/phase234-evaluate-original-pdfs.mjs`: replays the five uploaded original PDFs by **file path**, compares structured claims, checks prior counts, tests eight manually selected document anchors and emits only JSON findings/hashes. The original PDFs are **not** packaged in PEE. No new dependencies were added to `package.json`.

## Original PDF evaluation (in-sample, not held-out)

| Manufacturer PDF | Prior Phase233 claims | Phase234 claims | Added standard/optional leads |
|---|---:|---:|---:|
| Dyson Big+Quiet | 10 | 10 | 0 |
| Dyson Airblade Wash+Dry | 10 | 10 | 0 |
| Dreame Aqua 10 Pro Track | 2 | 2 | 0 |
| Philips CX50 | 22 | 22 | 0 |
| Philips Azurion 7 B20/12 | 3 | 27 | 24 |

Azurion leads comprise **17 accessory** claims (5 standard, 12 optional) and **7 feature** claims (1 standard, 6 optional). **8/8 manually chosen anchors** have the expected type, explicit status, page and scope. The original six Dyson variant weights, 22 Philips CX50 sonde data points, Azurion intervals and `6 cm/s` speed remain unaffected. Conditional accessories are omitted, not silently classified as included.

This comparison is **in-sample**; the same source PDFs were available while designing the implementation. It is **not** an unbiased measure of recall, accuracy or false-positive rates on unseen manufacturer documents. Some valid accessories remain deliberately unextracted because of complex conditionals or formatting.

## Test and integrity results

The release test counts and exact executed shards are recorded separately in `PHASE234-TEST-RESULTS.json`. PDF fixtures test safe list boundaries, cross-column rejection, footnotes, conditions and categorical metadata. TypeScript compilation uses preexisting local Node types as an *environment-only* symlink, which must not be included in the release. The full cumulative ZIP retains all existing predecessor files unchanged except documented intentional source/version edits. Original PDF bytes, temporary working directories, `node_modules` and compiled `dist` outputs are not included as new payloads.

## Limits and next work

- An explicit manufacturer “optional” label does not establish whether a particular commercial SKU includes the feature, whether the accessory is currently obtainable, or whether it is compatible with other configurations.
- Component-specific sub-options such as “if cradle option is chosen”, installation dependencies, regional availability and legacy revision-specific bundles are not generalized here. Document-scoped lists outside a single well-formed column and complex tables continue to require review.
- No OCR, image-only tables or generalized semantic understanding have been established; no ranking is authorized by these leads.
- Obtain and annotate **held-out original PDF technical sheets before changing the extractor** to measure variant/component false attribution and unsupported cases. Once access to a suitable runtime is available, independently validate actual network requests made by PEE.

## Technical reference links

- [Poppler `pdftotext` manual](https://manpages.debian.org/unstable/poppler-utils/pdftotext.1.en.html) (the existing PDF text layout engine).
- [pdfplumber repository](https://github.com/jsvine/pdfplumber) (comparative reference discussed in earlier phases, *not* installed).
- [ISO 32000-2 PDF specification, PDF Association](https://pdfa.org/resource/pdf-specification-index/) (background for why PDF layout is not equivalent to semantic table structure).

Uploaded PDFs are cited in this report by title and page, not by invented web addresses.
