# Product Evidence Engine — Phase 229 technical report

**Date:** 2026-10-13  
**Release:** v5.53.0  
**Canonical predecessor:** `product-evidence-engine-v5.52-phase228-FULL.zip`  
**Scope:** Bounded PDF coordinate-table specification lead extraction, no new runtime Python or npm dependency.

## Answer-first result

The Phase228 PDF path recognized obvious `Key: value unit` text. It could not associate separate label and value text placed in two visual columns. Phase229 adds **a cautious alignment path** using Poppler `pdftotext -bbox-layout` (already part of the PDF runtime dependency). It accepts rows only when at least two vertically consecutive rows contain recognized full labels on a stable left column and numeric values with recognized units in a stable right column. It rejects singleton rows, parallel numeric columns, unrecognized units and intrusive middle columns. A PDF listing multiple models remains model-unresolved, regardless of geometry. All observed values remain **unverified publisher claims, never scientific test evidence or ranking inputs**.

The application still has no empirically validated real-manufacturer-PDF extraction accuracy and no working live Internet search from this execution container. Source research by ChatGPT is distinct from PEE's own network access.

## Changes in executable software

- `document_intake/phase228_extract.py`: uses the existing transient bytes and Poppler `-bbox-layout`, with a second bounded subprocess and XHTML word/line geometry parsed by Python's standard library. The original `-layout` key-value path remains. It returns only normalized label/value/unit, model hypothesis, document hash, page/bounding box locator, extraction method and unresolved reasons. Two extraction paths on the same page do not count the same measurement twice.
- `src/phase228_document_observer.ts`: adds typed optional PDF bounding-box locator and an extraction-method marker without weakening HTTPS/DNS pinning, robots, MIME, permissions, domain, original-byte hashing or ranking gates.
- `tests/phase229_pdf_geometry.test.ts`: 10 new adversarial/integration tests using fictional, explicitly labelled PDFs. Includes two-column positive, single-row refusal, parallel-value ambiguity, two declared models, invalid units, intrusive columns, two-path deduplication, deterministic replay, Phase228 compatibility, and actual synthetic network-boundary-to-document-observer flow.
- `evaluation/phase229/SYNTHETIC-*.pdf`: test fixtures made for this phase using ReportLab **development tooling only**. These files do not represent genuine products or manufacturer materials.
- `scripts/phase229-evaluate-pdf-layout.mjs`: reproducible synthetic-gold evaluation of the actual compiled PEE reader. Output `docs/phase229/PHASE229-SYNTHETIC-PDF-EVALUATION.json`.
- `docs/phase229/PHASE229-PDFPLUMBER-COMPARISON.json`: separate, **optional** evaluation-environment-only table discovery comparison; `pdfplumber` is **not** adopted as a runtime dependency.

## Evidence, limitations and performance

- On seven constructed PDF fixtures, 7 expected normalized specifications were produced, 0 false associations and 0 misses. Precision/recall computed against those contrived examples are 1.0/1.0 **for the fixtures only**. Those numbers are not defensible estimates for real brochures, scanned manuals or review PDFs.
- The comparison environment has `pdfplumber` 0.11.9 installed. With a text-based table strategy it found one raw table on each of five fixtures, including empty cells; we did **not** validate its cell-to-model associations in PEE's schema. We cannot claim an accuracy improvement or a fair production latency comparison. It is a possible later benchmark candidate, not a dependency decision.
- Poppler is invoked twice for eligible text PDFs (one `-layout`, one `-bbox-layout`). The existing Node worker has a 15-second outer timeout, each Python Poppler subprocess has a 12-second limit, PDF bytes are capped at 6MB and extraction at 12 pages. Two invocations increase runtime, and complex PDFs may time out; profiling is required on real manufacturer originals.
- Geometry does **not** turn a PDF into a semantically tagged table. A two-column layout can represent unrelated nearby text; candidate observations are rank-neutral and require independent model/variant and source-role checks. No PDF OCR, merged-cell inference, complex multi-column association, or old Word `.doc` support is added.
- All document bytes are transient in the executed reader. The result contains field values, locators, hashes and reason codes, not a stored copy of the source document. Test fixtures are intentionally packaged for reproducibility.
- `pdfplumber` is present in the evaluation environment but absent from the production dependency manifest. No SearXNG service, new crawler, new network rights assumptions or pretrained model were introduced.

## Testing carried out

- `npm run build`: passed with environment-provided Node type definitions linked **only** in the build workspace.
- Targeted inherited + new PDF tests: **22/22 passed**, of which **10 new Phase229 tests**.
- Compiled TypeScript suite: **4,069/4,069 tests passed over 15 executed shards**, 0 failures. Per-shard logs accompany this report. These tests mix module and synthetic-fixture verification; they are not 4,069 independent real PDF observations.
- Synthetic evaluation: 7 fictional PDFs, 7 gold claims correctly recovered, 0 ranking permissions.
- Python companion regression not rerun; no claim of passing it during this phase.
- DNS verification from the runner: `github.com` and `www.gov.uk` both returned `Temporary failure in name resolution`. **Zero** actual manufacturer PDFs were fetched by the PEE.

## External technical references (URLs)

1. Poppler `pdftotext` official Debian manual documents `-bbox-layout` with word/block/line bounding boxes: https://manpages.debian.org/unstable/poppler-utils/pdftotext.1.en.html
2. `pdfplumber` maintained GitHub documentation describes line/text/table strategies and the danger of assuming alignment equals a reliable table: https://github.com/jsvine/pdfplumber/blob/stable/README.md
3. PDF Association explains tagged PDF and optional logical table semantics, rather than guaranteeing table structure in arbitrary PDF: https://pdfa.org/resource/tagged-pdf-q-a/
4. Microsoft OOXML tables, already used in the DOCX path, remain structurally distinct from PDF geometry: https://learn.microsoft.com/en-us/office/open-xml/word/working-with-wordprocessingml-tables

The links are external technical sources consulted separately from PEE's internal execution. **None is proof of an Internet fetch by the PEE binary.**

## Reproduction

```bash
npm run build
node --test dist/tests/phase228_document_observer.test.js dist/tests/phase229_pdf_geometry.test.js
node scripts/phase229-evaluate-pdf-layout.mjs
for shard in $(seq 1 15); do node scripts/run-test-shards.mjs "$shard"; done
```

PDF runtime requires Python 3 and Poppler `pdftotext`; the optional comparison additionally requires pdfplumber and is not part of PEE. No external web access is required for these tests.

## Priority for Phase230

Benchmark on a rights-appropriate set of **original manufacturer PDF datasheets** from distinct publishers, with annotated exact SKU/model, region, page, table row, expected cell, value and unit. Challenge false-assignment rate explicitly. Then compare a coordinate/Poppler baseline with pdfplumber under equally normalized outputs and time/memory/deployment measurements. Consider OCR for scanned PDFs only after reliable provenance and layout quality gates. Separately, operational Internet connectivity and a real SearXNG search remain blocked and must be demonstrated on a capable host rather than inferred from synthetic tests.
