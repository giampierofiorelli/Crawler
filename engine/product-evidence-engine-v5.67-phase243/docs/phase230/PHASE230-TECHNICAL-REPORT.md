# Product Evidence Engine — Phase230 technical report

**Date:** 2026-10-13  
**Release:** v5.54.0  
**Base:** full v5.53 phase229 archive, 3,518 predecessor files preserved.  
**Scope:** Empirical, offline evaluation on three original manufacturer-authored PDF documents provided by the user; bounded PDF reading improvements.

## What was actually tested

All **three genuine, user-uploaded files** were read by the PEE's own `document_intake/phase228_extract.py` and by its Node/TypeScript `parseDocumentBytes228` wrapper. The PDFs were not retrieved by PEE's Internet connector; no website was fetched by the PEE in this phase. The original public PDF URLs were not supplied and are not inferred from filenames. Manufacturer logos/text alone are not validation of a file's download origin. Each PDF is identified in the attached benchmark through its **SHA-256 fingerprint**, not by storing its content in the software package.

| Uploaded PDF | Size | Baseline v5.53 extraction | v5.54 extraction | Selected hand-annotated reference fields matched |
|---|---:|---:|---:|---:|
| Dyson Purifier Big+Quiet Formaldehyde technical specification | 787,070 B | 0 | 10 | 10 / 10 |
| Dyson Airblade Wash+Dry WD04/WD05/WD06 technical specification | 1,048,938 B | 0 | 0 | 0 / 5 |
| Dreame Aqua 10 Pro Track multilingual user manual | 10,344,975 B | rejected (>6 MB) | 2 | 2 / 7 |

**12 of 22 selected and manually checked fields** were found, with no output outside those selected fields. This is *not* a statistical estimate of real-world precision/recall, nor exhaustive annotation. Cases were selected for engineering diagnosis; two documents contain omissions deliberately left unresolved. All output values are *unverified manufacturer document claims* and are barred from ranking.

Examples actually recognized by the software:
- Dyson Purifier Big+Quiet: height **830 mm**, width **415 mm**, depth **434 mm** and base diameter **371 mm** (source PDF p.1); net weight **11.90 kg**, box weight **17.55 kg**, input voltage **120 V**, and sound power level **39.8 dBA** (airflow setting 2) and **56 dBA** (setting 10) (PDF p.2). These are producer specifications, *not independently measured observations*.
- Dreame manual p.19 (English specification sheet within 156-page multilingual PDF): robot rated voltage **14.4 V**, rated power **75 W**. The robot's model appears on that page, but the parser **does not verify or assign** an exact variant. It does not conflate those values with the adjacent base station or battery sections.
- The Wash+Dry PDF p.1 lists model-specific WD04/WD05/WD06 weights and distinct electrical variants, which the reader **rightly leaves unresolved** until a component/model-scoped extractor is evaluated. It also contains manufacturer-described testing, which is not equivalent to independent experimental evidence.

One dangerous mistake was caught and repaired during development: the initial revised parser interpreted **a carbon filter's net weight** as if it were the whole purifier's net weight. The current reader recognizes the main product's 11.90 kg weight while withholding component weights rather than misassigning them.

## Concrete code changes

1. `document_intake/phase228_extract.py`: separate **12 MB PDF** and **6 MB DOCX** caps; limit text/coordinate preview to **24 PDF pages**; normalize XML-disallowed control glyphs in Poppler bounding-box output without accepting malformed table structure; parse narrow, explicitly named numerical fields and authored dual imperial/metric values without calculating conversions; avoid making component weight a product weight; support explicit V and related units in table-cell parsing. Unknown models and nontrivial tables remain unresolved.
2. `src/phase228_document_observer.ts`: pass the PDF-specific byte cap into the same existing, robots-aware HTTPS reader; retain the DOCX cap, transient binary and SHA-256 receipt, and ranking quarantine.
3. `src/approved_web_reader.ts`: raises the transport's **maximum permitted caller-requested cap** from 6 MB to 12 MB; its normal HTML and robots call sites retain their prior smaller request limits. Network protection against private addresses, redirects and encoded responses is unchanged. This is a deliberate upper-bound increase, not permission to fetch arbitrary content.
4. `tests/phase230_original_pdf_hardening.test.ts`: **6 new synthetic regression tests** including multi-unit dimensions, scoped component weight, page 19, determinism/no raw text, PDF/DOCX caps, and prior geometry fixture.
5. `evaluation/phase230/REAL-PDF-MANUAL-GOLD.json` and `scripts/phase230-evaluate-original-pdfs.mjs`: a reproducible evaluation with the three separately supplied source PDFs, no originals embedded in the repo. Each file remains identified by SHA-256. No claim is given `exactVariantVerified`, `rankingAuthorized`, or `testedPerformance`.

## Test accounting

- TypeScript compilation: **PASS**; environment-supplied `@types/node` symlink for development only, not part of the archive or runtime dependency set.
- Focused inherited + new tests: **28 / 28 passed** (22 inherited + 6 new).
- Full compiled TypeScript regression: **4,075 / 4,075 passed across 16 shards**, zero failures. Phase229 had 15 shards; adding a test file moved one old file into shard 16. We explicitly executed that final shard, rather than misreporting the truncated count from 15.
- Three actual manufacturer PDFs executed through the Node/PEE parser: **3 / 3 parsed or safely abstained**. This is a processing count, not a rate of correct field recognition.
- Python legacy suite: not rerun. No original web acquisition; no DNS or SearXNG live success claimed.

## Unresolved problems and priorities

1. **Model/variant and component scope**: the multiple Dyson Wash+Dry models and the robot/base/battery sections within the Dreame PDF need distinct relationship-aware assignments. Do not hardcode these examples into general ranking rules.
2. **Larger manuals and selective pages**: the first-24-page limit allowed this Dreame manual's English specification page 19, but can miss specifications later in other manuals. Future document navigation should identify relevant headings and pages with explicit budgets rather than scanning indefinitely.
3. **OCR, complex merged tables, images**: not added. Some PDFs need layout models/OCR; test on a larger independently annotated corpus before dependencies.
4. **Source scope**: original PDF URLs, publisher issue dates/version changes and market matching are unverified for these user uploads. The on-document revision (Dyson Purifier **11/23**, Dyson Wash+Dry **04.18.24**) is visible but cannot prove how the uploaded bytes were obtained.
5. **Network**: this work runs on user-uploaded PDF bytes, not on PEE-fetched URLs. A live search/fetch trial remains a separate prerequisite.

## Technical references and document sources

- Poppler `pdftotext` bounding-box and layout options (development guidance): https://manpages.debian.org/unstable/poppler-utils/pdftotext.1.en.html
- PDF Association: limits of arbitrary, untagged PDF tables and structural semantics: https://pdfa.org/resource/tagged-pdf-q-a/
- Optional `pdfplumber` implementation/documentation (not adopted): https://github.com/jsvine/pdfplumber
- Dreame manual's own documented manufacturer page for e-manuals: https://global.dreametech.com/pages/user-manuals-and-faqs (this is **not** a verified link to the exact uploaded binary)
- Dyson Wash+Dry manual refers to: https://www.dyson.com/docs (this is **not** a verified link to the exact uploaded binary)

The external URLs above are reference links, not evidence of PEE live web navigation in this phase. The user-uploaded PDFs remain the original ground-truth materials available in this conversation and are deliberately not redistributed within the full release.

## Reproduction

```bash
npm run build
node --test dist/tests/phase228_document_observer.test.js dist/tests/phase229_pdf_geometry.test.js dist/tests/phase230_original_pdf_hardening.test.js
for shard in $(seq 1 16); do node scripts/run-test-shards.mjs "$shard"; done
node scripts/phase230-evaluate-original-pdfs.mjs --purifier /path/to/Purifier.pdf --washdry /path/to/WashDry.pdf --dreame /path/to/Dreame.pdf
```

Runtime PDF requirements: Python 3 and Poppler `pdftotext`; no new npm/Python package is introduced in production. The optional synthetic-fixture generator uses ReportLab only during development.
