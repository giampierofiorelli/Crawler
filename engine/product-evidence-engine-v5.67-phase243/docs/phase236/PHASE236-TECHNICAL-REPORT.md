# Product Evidence Engine — Phase 236 technical report (v5.60.0)

**Date:** 14 October 2026. **Canonical base:** `product-evidence-engine-v5.59-phase235-FULL.zip` (3,615 prior files). **Scope:** bounded, offline original-PDF reading. **Release:** code built, 13 new tests and 4,134 approved TypeScript tests passed across 16 separate shard executions; ten manufacturer PDFs replayed. **Not established:** general extraction accuracy on unseen sources, PEE live network navigation, independently measured performances, scientific admissibility or product ranking.

## Purpose and causal distinction

Previously the original Lavazza **Classy Pro DWC** manual led to zero extracted claims despite an explicit two-branch dependency on an **optional fridge**: page 9 requires the milk tube **50 cm with the optional fridge** or **40 cm otherwise**. A reader must not confuse these *usage selection rules* with either optional fridge included in a retail package or a fixed length universally supplied in every market/SKU.

The original Tefal **MultiCook Advanced 45 in 1** manual specifies the Yogurt **program** setting (page 17): default **8 hours**, user-adjustable **6–12 hours**. These are *machine control parameters*, not laboratory tests of yoghurt quality, recommended recipe cooking times, power consumption, or evidence that performance has been independently validated.

All ten original manufacturer documents were previously used in development (the five newer ones were initially unseen at their Phase235 baseline). Hence Phase236 replay is a **development regression**, not a blind generalization experiment.

## Implementation — actual code changes

### 1. Explicit two-branch component configuration

`document_intake/phase228_extract.py` adds `configuration_use_chunks236`. It requires all of the following on one page in one text column:

- A locally explicit two-component kit declaration such as `with two milk tubes`;
- A complete `If ... (optional item/accessory) is combined with the machine/appliance` branch with author-declared metric and imperial values and a specified component;
- The **immediately following** `Otherwise` branch for the **same** component;
- Coherent metric/imperial pair tolerances, separate positive and different lengths, no intervening headings or missing branch.

Its two candidate claims preserve `scopeComponent`, `condition`, `configurationDependency.triggerAccessory` and `triggerState`, page/line locator and document SHA-256; no original manual text or bytes are stored in output. Both candidates have `model=null`, `modelAssignment=unresolved`, `optionStatus=not_established`, `exactVariantVerified=false`, `testedPerformance=false`, and `rankingAuthorized=false`. The optional fridge is **not** asserted to be included. No generic natural-language dependency reasoning is claimed; other conditional phrasings remain unsupported.

### 2. Conservative machine operating-program setting

`operating_program_chunks236` requires one explicitly printed `... FUNCTION` heading, a nearby corresponding **machine-menu selection** instruction, and two authored, adjacent sentences declaring default time plus adjustable minimum and maximum. It emits one structured range with the **default** stored separately in `programSetting`, `scopeComponent='yogurt program'`, and `context='operating_instruction_not_test'`. It requires positive, bounded, consistent times. Recipe quantities, isolated cooking advice, multiple programme headings and incomplete author assertions are not converted into machine specifications or measured outcomes.

This is an intentionally narrow original-English-text pattern, not a general multi-axis table parser. Tefal's larger cooking programme grid and steam cooking-by-food tables remain unparsed rather than spuriously ranked.

### 3. Security and semantic boundary

`src/phase228_document_observer.ts` adds typed claim fields and **fail-closed Python→TypeScript validation**. It specifically disallows silently assigning a conditional value to a verified model, treating optional accessories as bundled, flattening programme intervals to scalars, or classifying a cooking programme as a scientific performance test. The existing source/robots/rights restrictions and document body retention limits are preserved.

**Production dependencies:** unchanged; Python standard library, already-required Poppler `pdftotext`, existing Node/TypeScript. No `pdfplumber`, Docling, AI model, external OCR API or SaaS added.

## Ten real source PDF replay

| Original manufacturer document | Phase235 count | Phase236 count | Interpretation |
|---|---:|---:|---|
| Dyson Big+Quiet technical sheet | 10 | 10 | No loss of existing extracted leads |
| Dyson Wash+Dry WD04/WD05/WD06 | 10 | 10 | Exact variant purchase status still unresolved |
| Dreame Aqua 10 Pro Track manual | 2 | 2 | No loss of existing leads |
| Philips CX50 sheet | 22 | 22 | Sonde/component scopes preserved |
| Philips Azurion 7 B20/12 sheet | 27 | 27 | Numerical and availability scopes preserved |
| **Lavazza Classy Pro DWC manual** | **0** | **2** | 50 cm if optional fridge present; 40 cm otherwise (p. 9) |
| **Tefal MultiCook Advanced 45-in-1 manual** | **0** | **1** | Yogurt default 8 h, adjustable range 6–12 h (p. 17), operational not test |
| Miele WWI860 specification sheet | 10 | 10 | Per-cycle denominators preserved |
| Tefal Steam Cuisine manual | 1 | 1 | Conditional rice bowl remains unresolved |
| Miele Professional 2021 catalogue | 23 | 23 | Per-model column scopes preserved |

These are **counts of provisional structured declarations**, not precision, recall, unique valid product features or independent test results. The count increase on Tefal is an operating-control statement; the known false `of pasta in the bowl (optional)` feature remains suppressed. Results plus hashes and locators are in `PHASE236-TEN-ORIGINAL-PDF-REPLAY.json`. The original PDF files are **not** in either ZIP.

## Verification

- TypeScript compilation succeeded (`tsc -p tsconfig.json`) with the local development-only Node type definitions; no new npm dependencies committed.
- Thirteen new targeted TypeScript tests passed (`tests/phase236_configuration_and_program_scope.test.ts`). Positive and adversarial synthetic fixtures cover both conditional branches, unpaired clauses, missing kit/otherwise, inconsistent units, model non-promotion, machine programme default+range, recipe-only guidance, contradictions, duplicate programme settings and reproducibility.
- **4,134/4,134 approved TypeScript tests passed** over **16 shards**, zero failures. The first combined execution exceeded the command duration limit **after two successful shards**; the remaining 14 shards were run **individually** and all returned 0. Logs are under `docs/phase236/`. The compiled Phase91/Phase92 TypeScript test files **were included** in the 16 shards. The separate full Python test corpus was **not** rerun.
- Original ten PDFs replayed from original user-provided bytes via the real TypeScript bridge. All original-source hashes and developer-sample count expectations matched the recorded evaluation; *not an unseen holdout*. Synthetic fixture PDF bytes are separate and explicitly fictitious.

## Open engineering risks and next steps

1. **Generalization:** first pre-register a genuinely new collection of original documents not consulted during design and blind-annotate model/feature/condition evidence. Report product/component identity false-assignment rates and abstention, not just number of claims.
2. **Conditional language:** support broader condition operators and many-to-one accessories with explicit provenance/logic, no guessed SKU package contents; safeguards against condition scope crossing columns/pages.
3. **Programme tables:** independently parse structured multi-axis cooking tables as manufacturer **operating settings**, with row-key, food type, temperature/time, adjustable vs default and excluded recipe/food-context metadata, never as independent performance.
4. **Scanned PDFs / DOCX:** OCR requires separate quality/licence/cost evaluation; no claim of general extraction from diagrams or image-only tables. General DOCX nested/merged table recovery is not established.
5. **PEE online autonomy:** local original-file reading and ChatGPT's web browsing are not evidence of a working PEE web-search/crawling runtime. Test real independent connections when available.

### Technical references (readable URLs)

- Poppler `pdftotext`: https://manpages.debian.org/unstable/poppler-utils/pdftotext.1.en.html
- pdfplumber table extraction design reference (not installed in production): https://github.com/jsvine/pdfplumber
- W3C accessible table associations: https://www.w3.org/WAI/tutorials/tables/
- The source PDFs were supplied by the user and are **not** redistributed in either released software ZIP.
