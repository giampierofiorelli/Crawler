# Product Evidence Engine — Phase 241 technical report

**Release:** v5.65.0 | **Date:** 2026-10-14 | **Language of primary engineering pipeline:** English | **Scope:** source-independent staging of product knowledge.

## Executive verdict: change the architecture, not the manufacturer's regex list

The user's central criticism is borne out by measurement. In v5.64.0, the four previously unseen original Tefal PDFs yielded **zero structured claims** each despite containing specifications, operating instructions, restrictions, accessories, technical tables and variant clauses. This reveals a structural generalization gap; adding more brand-, page- or category-specific expressions is not a satisfactory solution. The new v5.65.0 does **not** claim to have solved that gap. It introduces a **cross-source evidence intermediate representation** (IR) and deliberately holds unverifiable meaning apart from measurable values. Extraction accuracy on these four PDFs remains **zero** in the default production PDF reader after this change.

### Baseline: four manufacturer PDFs frozen before modifying PEE

| Original file | PDF pages | v5.64.0 baseline | v5.65.0 default reader | Notes on genuine source content |
|---|---:|---:|---:|---|
| `JM4188_IFU.pdf` | 43 | 0 claims | 0 claims | Pizza oven internal item number **JM4120** on physical PDF p4, inconsistent with file name; 4 kW heat input, two gas supply categories, g/h rates; p4 600/900 mm are **minimum installation clearances**, not oven dimensions. |
| `DT8280_IFU_compressed.pdf` | 12 | 0 | 0 | Manual covers **DT81XX and DT82XX** (p1); accessories with asterisks depend on model (p2); BOOST and 8-minute standby/auto-off have explicit conditions (p8). |
| `SV6131_IFU.pdf` | 2 | 0 | 0 | Fold-out visual manual covering several SV61xx series variants; source has **two power ranges without a safe exact-model map** (p1). A PDF page may contain many sub-panels. |
| `FV6673_Tefal_Freemove_Power_IFU_User_Manual.pdf` | 15 | 0 | 0 | Safety notice on p4 concerning models **at least 2600 W** is not the rated power of FV6673; p6–7 discuss recharge/cooling steps, p11 discusses auto-off, p13 a problem/causes/solutions table. |

Original PDFs are not bundled with the release. The freeze file includes hashes and version. These four are now DEVELOPMENT samples, not a blind unseen validation set. They are manufacturer statements, not independent performance testing.

### Why the old approach is insufficient

- Physical proximity of a number to a picture, or of a number to a line, does not establish a product attribute. A **600 mm wall clearance**, **2600 W applicability threshold**, and **8-minute auto-off period** have different semantic roles.
- Original source documents can cover a **product family, regional supply variant, product component or accessory**. The filename itself is not reliable proof of exact model identity.
- PDF reading order and visually merged cells frequently misrepresent rows and headings; HTML carries its own DOM table semantics (`th`, `scope`, `headers`) that should be preserved, not flattened.
- More products from the same category may reveal what properties recur, but **frequency does not establish a physical mechanism, product compatibility, accurate numeric outcome or causal explanation**.

## Code implemented

1. `src/phase241_unified_product_facts.ts`: a conservative format-independent source fact contract, linked to the existing Phase228-240 PDF/DOCX `DocClaim228`. Every fact carries property, numeric scalar/range/text representation, component, condition, variant, market, evidence role, source locator, producer and source SHA. It never authorizes ranking or independent scientific evidence.
2. An HTML bridge handles explicit property/value pairs (`dl/dt/dd`), basic two-cell row-header tables, and schema.org `Product` `PropertyValue`/`specification`/`additionalProperty` JSON-LD. Unknown properties work without a brand- or category-specific list. All results remain unverified, without exact model assignment. **This is bounded HTML parsing, not a complete HTML5 DOM/grid reader.** Multiple Products in JSON-LD are rejected rather than mixed; irregular tables are skipped.
3. Semantic **role review** is distinct from parsing a number. Ordinary numeric values from PDF/HTML remain **unresolved** by default, including possible safety requirements. Explicit programme, feature availability and source-scoped component types from the existing reader retain their author-declared scope, but none becomes verified performance evidence.
4. `proposeCategoryAttributes241`: with a **verified product/category identity and reviewed role provided by an upstream authority**, repeated named attributes in two distinct products and two distinct source documents may become **candidate category attributes** only, with provenance and counts. Repeated versions of one product, differing units, conditions, component-only measurements or multiple categories cannot create cross-product support. No averaging and no automatic promotion to ranking.
5. `scripts/phase241-evaluate-unified.mjs`: offline CLI demonstrating a common IR and accepting local PDF/DOCX/HTML paths, no external provider. Source bodies are not emitted or bundled.
6. `scripts/phase241_probe_layout.py`: **optional research-only** `pdfplumber` geometry probe; not required by PEE. On Pizza Pronto physical PDF page 4, it detects **five unassigned row/column numerical candidates** (not five certified specifications). A complete general layout recognizer is not implemented. One further probe of the 2-page visual SV manual timed out in the environment; no result for that probe is claimed.

## Technical approach for the next phases: the same knowledge engine for PDF, Word and web

**Recommended end-to-end architecture:**

**1. Source acquisition and custody.** Preserve canonical URL, byte SHA, publication/revision date, author, rights, market, language, and raw-source lifecycle constraints. Distinguish manufacturer, publisher editorial, independent original tests, PR derivatives and user experience reports. Live PEE browsing remains unverified.

**2. Modality-specific perception, format-neutral output.** PDF: native text/coordinates + line/grid reconstruction + optional page vision and OCR when required; DOCX: OOXML paragraphs, styles, section/table hierarchy; HTML: DOM, accessibility table header associations, semantic HTML and JSON-LD. Produce typed structural blocks and source-bound spans with page/element coordinates. No assumption that the first number found is a product parameter.

**3. Semantic understanding independent of layout.** Resolve entities (parent product, variant, part, accessory, programme, model family); relations (attribute, purpose, required accessory, option, condition, cause, failure mode, mitigation, operating procedure). Typed quantities including units, ranges and denominators. Unknown association stays unknown. A single universal extractor should not be confused with a single purely regex-based parser; high-quality multilingual/multimodal models are an optional backend after benchmark.

**4. Product evidence graph.** A source statement is NOT yet a verified product truth. Link typed assertions to their original citations, units, conditions, markets, version, reliability classification and original experiment method if any. Preserve internal source conflicts and multiple document versions. The manufacturer manual never certifies comparative performance.

**5. Incremental category learning.** Across **distinct verified product entities**, collect candidate property definitions, typical functions, inputs/outputs, maintenance patterns, boundary conditions and failure modes. Separate *common vocabulary* from *common mechanisms* and *measured comparative performance*. Require corroboration of semantic equivalence before merging aliases; do not let agreement among copied manufacturer data masquerade as independent validation. Log learning, policy changes and regressions. Category hypotheses are reusable in future source searches, but are revisable rather than fixed truth.

**6. Decision/UX layer.** Translate everyday consumer goals into justified criteria, check product/market/variant compatibility and safety gates, assess measured outcomes and trade-offs. Ranking must remain deterministic for equivalent canonical intent and evidence snapshots. User-facing output should explain evidence and uncertainty, with optional detail.

## Open-source research and selection

- **Docling / DoclingDocument** — a strong architectural reference for a common hierarchy of text, tables, image blocks, layout, page provenance, header/footer separation, across formats. https://github.com/docling-project/docling and https://github.com/docling-project/docling/blob/main/docs/concepts/docling_document.md . **Recommendation:** use this idea, benchmark Docling on held-out originals before running model workers in production. Not installed here.
- **pdfplumber** — useful existing coordinate/table debugging backend for PDF. https://github.com/jsvine/pdfplumber . **Recommendation:** optional geometry baseline now, not mandatory dependency. It identifies structures but does not automatically understand variant applicability.
- **Microsoft Table Transformer** — a possible visual table recognition backend; MIT code, with model weight/deployment/licence checks still required. https://github.com/microsoft/table-transformer and https://github.com/microsoft/table-transformer/blob/main/LICENSE . **Recommendation:** only test as fallback for image/multicolumn failures.
- **PaddleOCR PP-StructureV3** — supports OCR, layout, tables, reading order and chart processing; more complex runtime and model stack. https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/pipeline_usage/PP-StructureV3.en.md . **Recommendation:** candidate for optional local worker with benchmarked memory/CPU/licences, not automatically added.
- **deepdoctection** — mature configurable document understanding stack, heavier PyTorch model worker. https://github.com/deepdoctection/deepdoctection . **Recommendation:** reference/testing only pending measured gains and deployment assessment.
- **W3C WAI tables** — reliable HTML header semantics via th/scope/headers, unlike implicit visual guessing: https://www.w3.org/WAI/tutorials/tables/ .
- **Schema.org Product and PropertyValue/QuantitativeValue** — interoperable authored structured source hints, not certificates of correctness: https://schema.org/Product , https://schema.org/PropertyValue , https://schema.org/QuantitativeValue .

**License principle:** a repository's source-code licence does not automatically apply to its pretrained model weights, external datasets or the manufacturer's PDFs. No new production dependencies were installed.

## Evaluation results and limitations

- **18 new Phase241 TypeScript tests** cover native PDF/DOCX bridge, HTML basic grid/DL/JSON-LD bridge, arbitrary labels, ranges including negative temperatures, ambiguous model tables, cross-script multi-product ambiguity, semantics and category support gates, and non-promotion of visual review slots.
- The existing full TypeScript regression is tracked separately in `PHASE241-FULL-TYPESCRIPT-TEST-LOG.txt` and summarized only after the process finishes successfully.
- **All four newly uploaded PDF documents still yield 0 structured claims in the default parser**. A cross-format IR does not by itself fix a weak perception/extraction stage. Optional geometry produced five UNASSIGNED table-cell candidates on one real page; not verified product specs and not source-independent accuracy metrics.
- No blind test on previously unseen documents after the development phase; no autonomous live PEE web crawl; no full Python test corpus rerun; no claims of real performance ranking or general AI comprehension.

## Next acceptance gates (Phase242+)

1. Freeze a truly new holdout corpus **before building another layout module**, with unseen brands and mixed documents and paired PDF/HTML versions of the same content; keep a separate adversarial negative set.
2. Choose one source-neutral *structural block+table graph* contract and implement robust adapters. Compare Poppler+native, pdfplumber, Docling, Table Transformer on the SAME pages. Evaluate correct product/variant/context linkage, not extracted number totals. Measure F1, false positive attachment, abstention, latency, RAM, licensing and deployment burden.
3. Build source-grounded semantic relation recovery with multiple evidence spans and explicit contradictions. Check whether a lightweight native implementation actually approaches a model worker; only adopt a model if proven useful.
4. Allow category knowledge growth to learn roles and mechanisms across verified products and brands, with provenance; maintain a separate original test-performance graph and versioned re-evaluation.
5. Link to the existing PEE live discovery pipeline. Test actual autonomous acquisition separately from ChatGPT web search, which is not proof of PEE runtime network access.
