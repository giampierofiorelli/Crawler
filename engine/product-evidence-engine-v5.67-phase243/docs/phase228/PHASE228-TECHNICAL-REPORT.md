# Product Evidence Engine — Phase 228 technical report

**Date:** 2026-10-13  
**Version:** v5.52.0  
**Cumulative predecessor:** `product-evidence-engine-v5.51-phase227-FULL.zip`  
**Scope:** Add bounded transient PDF and DOCX specification-reading to the existing autonomous URL discovery, preserving fail-closed evidence gates. **No real Internet retrieval by PEE occurred.**

## Verified result

The executable PEE can now route discovered `.pdf` and `.docx` document URLs through the established HTTPS DNS-pinned reader, apply existing robots and host prohibition checks, verify original binary response, and invoke a **local, transient document reader**. The resulting receipt contains original document SHA-256, source URL, a declared model hypothesis, document-page or DOCX table-row location, and a small set of explicit quantitative specification leads. Neither input document bytes nor article text are returned or stored in the evidence receipt. Information claimed in a document is **not** treated as independently measured product performance or as an authorized ranking input.

## Actual implementation

- `src/phase228_document_observer.ts`: bounded integration from Phase220 `Run220`/`Registry220` and Phase223 SearXNG `SearchRun223` candidates. Matches only URLs within the registered original host/path, checks existing refusals (cannot be overridden), fetches `robots.txt`, enforces MIME, status, final URL and `rawBytes`; routes to a local Python helper. Distinguishes synthetic-fixture and live modes; fixtures cannot be injected into live mode. Maximum 12 documents per run and 6MB per document. Reports failure instead of inventing values.
- `document_intake/phase228_extract.py`: reads bytes from standard input and emits **structured JSON only**, using no external Python packages. PDF reads machine-readable text from a bounded 12-page range via installed Poppler `pdftotext -layout`. DOCX uses ZIP/OOXML table and paragraph primitives with bounded archive/file sizes, rejects unsupported merged cells and active content. No OCR is implemented. Ambiguous/multi-model documents do not assign claims to a model.
- `src/approved_web_reader.ts`: retains existing TLS, pinned DNS and SSRF defenses; raises the hard byte ceiling from 1MB to 6MB solely so caller-bounded document reads are possible and explicitly advertises PDF/DOCX as acceptable formats. Existing calls continue using their smaller per-request maximum.
- `scripts/phase228-run.mjs`: the real (no mock option) CLI executes discovery, HTML observation, **document observation**, optional SearXNG general search and the same document observation on search leads. The output separates unverified specification leads from independently verified evidence.
- `scripts/phase228-evaluate-documents.mjs`, `evaluation/phase228/SYNTHETIC-*` and `tests/phase228_document_observer.test.ts`: end-to-end-in-software offline synthetic fixtures, negative cases and regression coverage. Synthetic documents are made-up test artifacts, **not manufacturer documents**.

### Category stress tests

The fictional football-boot PDF declares `BOOT-A1`, `Weight: 215 g`, `Length: 290 mm`. The fictional recycling-bin DOCX declares `BIN-40`, `Total capacity: 40 L`, `Compartment capacity: 18 L`, and `Height: 64 cm`. These are **5 unverified source-declared specifications**, not verified shoe test outcomes or verified usable bin volume. A second synthetic PDF lists two models and therefore produces model-unresolved leads; an image-only PDF produces `pdf_image_only_or_needs_ocr`; an OOXML merged table is conservatively skipped.

### Tests actually rerun

- TypeScript build: **passed**, using a locally available `@types/node` for compilation only; no new project runtime npm package was installed or bundled.
- Newly implemented document intake test file: **12 / 12 passed**.
- Full TypeScript suite: **4059 passed in 15 independently executed shards**, zero reported failures; exact logs in `docs/phase228/TS-SHARD-*.log`. This runner includes files according to its own shard algorithm; figures are not comparable to previous releases' differently scoped admitted suite counts without checking the test inventory.
- Synthetic document evaluation: 2 original fictional files analyzed, 5 specification leads, 0 scientific evidence admitted and 0 rankings. Replay: `docs/phase228/PHASE228-SYNTHETIC-REPLAY.json`.
- Actual CLI for English football boot and recycling bin requests: process executed; no external sources were configured, **0 acquired documents and 0 rankings**, as documented in `PHASE228-CLI-FOOTBALL.json` and `PHASE228-CLI-BINS.json`.
- Python suite was **not rerun** for this phase. No real-vendor PDF/DOCX extraction accuracy (precision/recall) was measured.

## Methodological constraints and current limits

1. A PDF is often primarily a presentation format; text order and table geometry can be ambiguous. The current version accepts explicit key–value specifications from extracted lines, **does not infer values from ambiguous PDF columns**, and reports when PDF table geometry has not been validated. This is deliberately more conservative than an invented cross-model match.
2. Tagged PDFs may carry document structure including headings and tables, but ordinary PDFs frequently lack dependable semantic tags. An extension to a validated tagged-PDF or coordinate-aware table reader needs publisher-disjoint real examples with independently reviewed expected answers, not synthetic-only demos.
3. DOCX preserves OOXML table cells more directly; this reader accepts only simple unmerged two-column tables and explicit label/value lines. Multi-column, merged and nested structures remain unresolved. Legacy binary `.doc` is not supported.
4. Scanned/image-only PDFs require OCR and subsequent human/layout verification. The current parser explicitly reports the need rather than hallucinating.
5. Product manufacturer declarations can inform specifications, but do not prove durability, fit, independent test methods or applicability to a given country/product variant. URLs, byte digest, model hypothesis and per-claim locator are retained, while exact variant/market verification and independent ranking remain **false**.
6. Per-document budget 6 MB and first 12 PDF pages limit coverage, intentionally. No general-purpose attachment index, scanned-PDF OCR, PDF tables with cross-column cell geometry or actual PEE web acquisition was demonstrated.
7. Some rights/licences and site access restrictions apply even to public pages. This system does **not** assume that a hyperlink grants general commercial content reuse; nor does it require a fabricated individual written licence just to access ordinary publicly accessible documents. Host-specific prohibitions, login gates and `robots.txt` still apply.

## External technical sources consulted (links)

- PDF Association, [Tagged PDF FAQ](https://pdfa.org/resource/tagged-pdf-q-a/) and [PDF structure and accessibility](https://pdfa.org/techniques-for-accessible-pdf-background/): logical reading order and table semantics may exist, but should not be assumed for every PDF.
- PDF Association, [AI and PDF FAQ](https://pdfa.org/faq-ai-and-pdf/): limitations and affordances of PDF text/structural metadata.
- Microsoft Learn, [WordprocessingML tables](https://learn.microsoft.com/en-us/office/open-xml/word/working-with-wordprocessingml-tables): `tbl`, `tblGrid`, `tr`, `tc` and OOXML table relationships.
- Poppler [pdftotext manual](https://manpages.debian.org/unstable/poppler-utils/pdftotext.1.en.html): text layout is an approximation, page bounds and encoding options.
- [pdfplumber maintained repository](https://github.com/jsvine/pdfplumber): potential later table layout benchmarking for machine-generated PDFs; scanning/OCR not supplied. **Not integrated as dependency.**
- [Apache Tika supported formats](https://tika.apache.org/docs/4.0.x/formats.html): alternative heavy document-processing service; studied but **not introduced**.

## Reproduction commands

```bash
npm run build
node --test dist/tests/phase228_document_observer.test.js
node scripts/phase228-evaluate-documents.mjs
node scripts/run-test-shards.mjs 1  # repeat with 2..15
node scripts/phase228-run.mjs --request 'I need comfortable football boots for artificial grass' --registry docs/phase220/phase220-category-vocabulary.json --state /tmp/pee228-football.json
```

For PDFs, the deployment host needs `pdftotext` (Poppler); for both formats Python 3 is required. The standard-library DOCX parser does not need `python-docx` in production. These executables should be container-isolated in production before accepting arbitrary untrusted documents at scale. The fixture PDFs/DOCXs were generated for tests using reportlab/python-docx **only at development time**, not at production runtime.

**Next engineering step:** benchmark PDF table/label association and scanned-PDF detection on legitimately obtained, publisher-disjoint real product datasheets, then connect reviewed document claims to exact model/market knowledge registers without upgrading manufacturer specifications into original independent tests. Operational Internet connectivity and a running discovery index remain the main end-to-end blocker.
