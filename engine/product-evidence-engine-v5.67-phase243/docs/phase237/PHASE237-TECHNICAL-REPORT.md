# Product Evidence Engine — Phase 237 technical report (v5.61.0)

**Date:** 14 October 2026. **Canonical input:** `product-evidence-engine-v5.60-phase236-FULL.zip` (3,657 previous files). **Outcome:** compiled TypeScript build; **4,145/4,145** approved TypeScript tests across **16 completed shards**; eleven new tests; replay of ten original manufacturer PDFs. These are author statements, not verified independent scientific measurements or market-SKU evidence.

## Why this feature

Phase236 correctly preserved an authored machine-control operating-range statement for Tefal MultiCook's Yogurt programme but did not read its table of cooking programmes. Manufacturer operating tables often describe **multiple simultaneous axes**: programme name; ingredient/food type; default time; adjustable time range; default temperature. Flattening a number out of this table could misattribute it to the product, ignore ingredient context, or mistake a recommended recipe for measured output.

## Actual implementation

`document_intake/phase228_extract.py` contains a bounded `operating_programme_table_chunks237` path, integrated into the PDF intake. It demands the entire printed programme-table header (`Programs`, `Automatic`, `Cooking Time`, `Food`, `Default`, `Range`, `Temperature`). It then requires a unique complete author-written time interval, a default duration inside it, and exactly one valid temperature. Four-way multi-food rows are admitted only with all four distinct printed food names (`Veg`, `Fish`, `Poultry`, `Meat`) and per-food time and temperature or a stable shared programme temperature. Minor Poppler layout wrap `~24h` is tolerated only as an unrelated interstitial line, never as a food/default input. Incomplete axes, duplicate foods, invalid bounds, missing temperature, an isolated recipe grid, or multiple intervals are rejected.

Claims contain one **typed tuple** each (`programTableSetting`: programme, food type or null, default duration in minutes, lower/upper user-adjustable minutes, temperature in Celsius, `manufacturer_programme_table_not_test`). `locator.page`, `locator.line` (specific food data line), and `locator.row` (programme row) preserve PDF location. Whole-document SHA-256, original source provenance, model-unverified flags, and no-body-retention boundary remain intact. Conversion of the PDF's explicitly printed hours/minutes to minutes is deterministic, not an estimated measurement. This is not a generic PDF grid solver.

The TypeScript Python-process boundary (`src/phase228_document_observer.ts`) strictly validates tuple types/units, bounds, source status, program/food consistency, component scope, refusal to attach a verified product variant, and disallows independent-tested or ranking-authorized promotion. The existing document-source restrictions remain enforced. No new required npm dependency, Python model, AI API, cloud service or OCR package.

## Original ten-PDF developer corpus replay

| PDF | v5.60 claims | v5.61 claims | New programme-grid tuples |
|---|---:|---:|---:|
| Dyson Big+Quiet | 10 | 10 | 0 |
| Dyson Wash+Dry | 10 | 10 | 0 |
| Dreame Aqua 10 | 2 | 2 | 0 |
| Philips CX50 | 22 | 22 | 0 |
| Philips Azurion | 27 | 27 | 0 |
| Lavazza Classy Pro DWC | 2 | 2 | 0 |
| **Tefal MultiCook Advanced 45-in-1** | **1** | **24** | **23** |
| Miele WWI860 | 10 | 10 | 0 |
| Tefal Steam Cuisine | 1 | 1 | 0 |
| Miele Professional catalogue | 23 | 23 | 0 |

The 23 newly decoded Tefal tuples include four food-specific settings for each of Baking, Soup, Steam and Stew, and seven single-programme rows. For example Soup has authored defaults for Veg 40 min, Fish 45 min, Poultry 50 min and Meat 60 min, range 10–180 minutes, shared default temperature 100 °C. All ten original PDFs are already development data, **not** independent heldout research. Counts are candidate declarations, **not** accuracy/recall figures.

### Conflicting authored source statements are preserved

The same Tefal manual states **Yogurt adjustable 6–12 hours** in programme prose (printed p. 14 / PDF p. 17), while the programme table (PDF p. 12) prints **1–12 hours**. These disagree about the lower bound. Phase237 preserves both, records `pdf_programme_table_vs_prose_conflict_unresolved` and does not silently reconcile them. Both remain provisional author claims; neither may authorize ranking or performance claims. The 8-hour default agrees, but the lower bound does not.

## Verification and limitations

- Eleven new synthetic TypeScript tests passed: independent food-value tuples, shared range/temperature, no ranking/SKU promotion, duplicate/incomplete rows, missing temperature/range, wrong default, recipe-table rejection, deterministic output, and no publisher body retention.
- Entire admitted TypeScript regression: **4,145 passes, 0 failures in 16 finished groups**, details in `PHASE237-TEST-RESULTS.json` and shard logs. The full Python test corpus was **not** rerun. Test fixtures are fictional, created with development-only ReportLab; their PDF bytes are inside the release for tests. The original copyrighted manufacturer PDF files are not included.
- Ten manufacturer originals were replayed with their actual uploaded bytes in the local runtime; report includes hashes and derived tuples only. They cannot independently establish generalization or robust precision.
- Multi-axis rows outside this strict programme-grid subset, complex merged cells, recipe/nutrition timetables, DOCX grid generalization, scanner-only PDFs, PDF page 25+, and language variation are **not** solved. Technical performance test results require an entirely separate evidence/method-review path.
- The PEE's own live source discovery/download remains unverified in this runtime, and ChatGPT web access must never be claimed as PEE autonomous network success.

## Next engineering priorities

1. Pre-register a completely new manufacturer-document holdout **before** tuning any more parsers, annotate true/false assignments and abstentions, evaluate model/component/food/condition mistakes separately from mere count of extractions.
2. Make source-level conflicting statements a typed, queryable discrepancy edge, with dates, product variant and source scope; do not resolve conflicts through recency guessing or majority voting.
3. Expand table reading only when a new field grammar is demonstrated on held-out originals, with explicit row/column correspondence, wrapped headings, non-ASCII units and type-safe provenance.
4. Resume PEE independent online source discovery, obey source/robots/terms, and measure real acquisition rather than synthetic transport.

## Technical references

- Poppler `pdftotext` and `-layout`: https://manpages.debian.org/unstable/poppler-utils/pdftotext.1.en.html
- W3C HTML table associations as a structural analogy (not a PDF parsing claim): https://www.w3.org/WAI/tutorials/tables/
- pdfplumber's table extraction architecture as a non-production engineering comparison: https://github.com/jsvine/pdfplumber

All manufacturer specifications and instructions are unverified publisher statements. No PDF source bodies are repackaged.
