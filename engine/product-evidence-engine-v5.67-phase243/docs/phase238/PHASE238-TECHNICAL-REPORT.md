# Product Evidence Engine — Phase 238 Technical Report

**Release:** v5.62.0  
**Date:** 2026-10-14  
**Canonical base:** `product-evidence-engine-v5.61-phase237-FULL.zip`

## Verified engineering outcome

1. **Typed intra-document discrepancy graph.** `src/phase238_document_discrepancy_graph.ts` connects to `parseDocumentBytes228`, compares only source-local author claims with compatible unit, variant/model/component scope, measurement denominator, food-specific context, and conditions. Supported conflict classes: whole-programme prose-versus-table, the same explicitly declared model's incompatible scalar, and the same accessory state/condition's incompatible component value. It reports claim SHA-256 IDs and original page/line locators, **never** selects a winning value, infers version or authorises ranking. On the ten prior developer PDFs, it identifies the known Tefal Yogurt table-versus-prose conflict. `medias 2(1).pdf` has **one** unresolved edge in the replay.
2. **PDF input size** increased from 12,000,000 to 40,000,000 bytes so that manuals such as Lavazza Assoluta can be processed. **DOCX remains at 6,000,000 bytes**. The test rejection threshold was updated accordingly, and a 40,000,001-byte PDF still fails. Poppler text/bbox reading covers **only the first 24 PDF pages**, with hard child process timeout, output ceiling and 90-claim cap. Changing the byte limit does **not** mean reading 204 pages or removing trust boundaries.
3. **Bounded English, authored-specification block reader.** `document_intake/phase228_extract.py` now recognizes self-contained English `TECHNICAL SPECIFICATIONS` / `TECHNICAL DESCRIPTION` blocks that terminate at `COMMUNICATION MODULE`. Supports exactly attributable dual-unit mass, three-axis dimensions, power supply voltage/frequency ranges, nominal power and complete paired `with filter` versus `without filter` capacities. Separately, energy-saving prose must explicitly state **both** modes on the same page for condition-scoped consumption extraction. Absence/ambiguity abstains; recipes and setup instructions are not specifications. Claims are author statements only, with original location, SHA-256, scoped conditions and no retained document text.
4. **TypeScript receipt guards** reject the new extraction method if scope, unit, conditions, vector axes, numerical shape, verified identity, ranking or source role diverge. The Miele WWI860 repeated upload uses the **same original SHA-256** and is not independent corroboration.

## Original manufacturer PDF evaluation and frozen target denominator

Original manufacturer PDFs are never included in the ZIP. The new `Lavazza Assoluta` file (`BTC_Assoluta_MAN_UTE_WEB_PKG00002365_A_20250711.pdf`) has 204 pages, **37,628,569 bytes**, source SHA-256 `8bb542d9f76ccd5598738af60273157dbf10387144fa480407528cabac93800f`.

Before the Phase238 reader was tuned, a dated evaluation sheet froze **14** English targets. **v5.61 initially rejected the 37.6MB file** for exceeding 12MB. The Phase238 40MB intermediate build opened the file but yielded **zero claims**. After extending the conservative extractor, it identifies **nine of the 14 preregistered target groups**, with no known value/scope mismatch in those nine checked against the source: voltage 220–240 V, frequency 50–60 Hz, nominal power 1550 W, dimensions 358×220×435 mm (H/W/L), weight 10 kg, 1.5 L tank without filter, 1.3 L tank with filter (p7), networked standby 0.6 W and low-power 0.47 W (p15). Five are still missing: minimum user-programmable coffee dose (p23) and four beverage presets/limits (p25). The latter lie outside the first-24-page intake. **9/14 is coverage of specific manually frozen fields on this now-development PDF, not an accuracy or F1 score for unseen PDFs.** No independent scientific testing was performed.

The duplicate Miele WWI860 (`FS_11359330_GBE_GB-en-GB(2).pdf`, same SHA-256 as `(1)`) yields ten already-known, unverified manufacturer declarations. It is not a second independent data source.

**Replay:** 12 local PDF paths representing 11 distinct manufacturer PDFs (Miele duplicate included). **All ten predecessor documents' extracted claim counts remain unchanged**. The Tefal documentation still contains conflicting Yogurt durations, retained as one unresolved contradiction edge. The previously unseen Lavazza Assoluta is now a development sample, not eligible as future unseen holdout.

## Test contract

- TypeScript compiler: **passed**.
- **4,163 / 4,163 admitted TypeScript tests passed** in **16 / 16 completed shards**, no failed tests. This is 18 new tests versus Phase237: 11 graph tests + seven manual-reader tests. The historic PDF binary-size rejection test was updated from 12MB to 40MB, and passed. All **24 targeted Phase238+Phase230 tests passed**.
- **Full Python test corpus not rerun**. The Python reader *was* exercised directly and through the TypeScript boundary on synthetic fixtures and real PDFs.
- No live network browsing by the PEE runtime was established. ChatGPT web browsing does not count as PEE web capability.
- Neither manufacturer statements nor operating tables are original laboratory evidence, exact verified retail variants, or authorised rankings.

## Technical scope and future priorities

The technical-block reader is an intentional **restricted text/layout subset** rather than universal PDF interpretation; arbitrary columns, image-only pages, OCR, captions/diagrams, country-specific translations, and whole-document reading are not yet solved. A document can be valid and still yield no claims. Large PDF budgets must be tuned for actual deployment memory/CPU. The graph does not align conflicting editions or other documents; that requires secure entity/edition/region/version matching and verified equivalence first. Improve generalisation with a genuinely fresh, prenoted document set **before** implementation, and measure false product assignment, missed scopes and abstentions as well as coverage.

## Engineering references

- Poppler `pdftotext` original text and geometry extraction: https://poppler.freedesktop.org/ ; https://manpages.debian.org/unstable/poppler-utils/pdftotext.1.en.html
- `pdfplumber` layout/table reconstruction as a comparative reference, not mandatory PEE dependency: https://github.com/jsvine/pdfplumber
- W3C table-association structure (relevant to the HTML reader, *not* proof of correctness in PDF): https://www.w3.org/WAI/tutorials/tables/

Reproduction: `npm run build`, `npm run test:phase238`, `bash docs/phase238/run-regression-final.sh` in an environment with Node/TypeScript and Poppler installed. Author originals were used for local replay but **are not shipped**. The bundled PDF fixtures are artificially generated and are not independent benchmarks.
