# Product Evidence Engine — Phase 157: product-specific GitHub source intake and first external product-pair diagnostic

**Date:** 11 October 2026  
**Input baseline:** v4.80 / Phase156 cumulative (1,664 entries)  
**New upstream materials:** the five **original ZIPs uploaded by the user**, read directly and archived byte-for-byte.  
**Disposition:** a tested, opt-in extruct-output bridge plus a frozen historical WDC/DITTO pair-evaluation harness. No trained models integrated in this phase.

## Executive engineering decision

The new repositories contribute three genuinely different capabilities: structured product data extraction (`extruct`), product-identity matching (`Ditto` and the WDC benchmark), and neural extraction/classification of product attributes and opinion aspects (OA-Mine and PyABSA). **Their original source is usable, but their model capabilities are not supplied by the source files alone.** In particular, the five ZIPs do not include production-ready neural inference checkpoints. No dependency installation or automatic network download has occurred.

Continue in this order: (1) structured extraction and provenance, (2) checkpoint/licence/runtime qualification for learned matching and aspect extraction, (3) source-disjoint evaluation on real matching pairs **and separately** complete professional product reviews, (4) only then route reviewed outputs into the knowledge system. Preserve independent-test measurements separately from merchant/manufacturer marketing specifications throughout.

## Local-source audit and suitability

| Source | Actual files and architecture inspected | Engineering judgement | Important limitations |
|---|---|---|---|
| [OA-Mine](https://github.com/xinyangz/OAMine) | `candidate_generation/chunk.py`, `candidate_generation/preprocess.py`, `value_grouping/README.md` and supporting weak-supervision / grouping code | Designed for **open-world attribute/value discovery from e-commerce titles**; relevant to unseen category vocabularies and product names | The candidate segmentation **requires pretrained BERT impact scores**, and grouping requires transformer representations/training. The in-domain checkpoint is linked externally, not included. `candidate_generation/chunk.py` fetches stopwords by **network at import time**; not suitable for PEE's offline runtime without a local/offline replacement. Apache-2.0 code licence; checkpoint and training data require separate checks. |
| [Ditto](https://github.com/megagonlabs/ditto) | `ditto_light/dataset.py`, `ditto_light` matcher, `data/wdc/*/test.txt`, `requirements.txt` | **Entity-matching candidate** for pairs of product titles/sheets, not automatic proof of SKU equality; source archive includes useful historical WDC title-only labelled pairs | README targets Python 3.7.7, PyTorch 1.9, Transformers 4.9.2, spaCy large English model and NVIDIA Apex for one training workflow. No full trained matching checkpoint in archive. Licence Apache-2.0 for code; data provenance/redistribution licence to verify independently. |
| [extruct](https://github.com/scrapinghub/extruct) | `extruct/_extruct.py`, `extruct/jsonld.py`, `extruct/w3cmicrodata.py`, `extruct/opengraph.py`, `tests/*`, `requirements.txt` | **Most immediate low-risk upstream capability:** extract JSON-LD / Microdata / OpenGraph / other embedded semantic metadata from supplied HTML before attempting model-based interpretation | Python package has `lxml`, `rdflib`, `pyrdfa3`, `mf2py`, `jstyleson`, and other dependencies. The actual `extruct.extract()` **has not been installed or executed here**. A new, separately tested PEE bridge consumes its documented output shape. Extruct does not authenticate manufacturer claims or supply location offsets for each HTML property. BSD-3-Clause. |
| [WDC Products](https://github.com/wbsg-uni-mannheim/wdcproducts) | README, benchmark generation notebooks, preprocessing/scripts, licence | Critical **external matching evaluation methodology**; available full benchmark files are linked rather than embedded in this small archive | README cautions that some scripts need 64GB+ RAM and GPU; the full WDC Products benchmark itself is not included. BSD-3-Clause code licence does not automatically establish rights in any third-party product records. This phase uses the **historical labelled WDC title pairs actually bundled in Ditto**, not a claim to have run the full later WDC Products benchmark. |
| [PyABSA](https://github.com/yangheng95/PyABSA) | `pyabsa/tasks/AspectTermExtraction`, `AspectSentimentTripletExtraction`, `AspectPolarityClassification`, `checkpoints.json`, requirements, setup | Relevant for **product-attribute opinion sentiment and aspect/target terms**; must be distinguished from empirical performance evidence | The ZIP contains checkpoint *references*, not the complete English ATE/APC checkpoints. Many dependencies and checkpoint-download workflows need security/licence review. On case-sensitive systems `setup.py` references `README.md`, whereas the uploaded archive exposes `README.MD`; check this before installation. MIT code licence; model/data licences must be reviewed separately. |

Each ZIP is preserved under `research/upstream_source_archives/`. Exact checksums and member counts are in `PHASE157-UPSTREAM-ARCHIVE-INVENTORY.json`; the original `LICENSE` remains in every archive. Their reuse does **not** require third-party branding in the PEE public interface under these permissive code licences, but appropriate copyright and licence notices must remain within the technical distribution as applicable. Commercial use of third-party model weights/datasets is **not yet cleared**.

## New working product metadata path (opt-in)

`src/phase157_structured_product_bridge.ts` exposes:

- `bridgeExtructProductData157(input, extructData)`: bounded typed interpretation of already-extracted extruct `json-ld` / `microdata` data, supporting `Product`, `ProductGroup`, `hasVariant`, `@graph`, brand, model, SKU, MPN, GTIN and `additionalProperty` candidates.
- `analyzeEnglishReviewWithExtruct157(input, extructData)`: **parallel**, non-authoritative coordination with actual v4.80 `analyzeEnglishReview156()` on the same source document. Scientific interpretations are never silently replaced by merchant metadata.

These functions are **not** a wholesale port of extruct. They do not crawl or parse HTML, load a neural model, invoke Python, write to the canonical database, or change ranking. Upstream extruct is an optional preprocessor that may be made available after dependency/runtime review. **Unlocated** HTML metadata attributes are explicitly represented with `sourceHtmlOffset:null` and a property path; no fabricated source-span coordinates are allowed. Multiple `Product` nodes or `ProductGroup`/variant edges are not automatically merged. A text similarity to the publisher page title indicates correspondence to a **page**, not a verified commercial identity.

Seven new automated TypeScript tests cover JSON-LD graphs, product/variant separation, Microdata shape, unrelated `Review`/`Offer`, malformed digests, budgets/truncation and v4.80 coordination. These tests use developer-authored examples, not a real publisher HTML benchmark.

## First external labelled product pair diagnostic

`python scripts/phase157_wdc_eval.py --ditto-zip research/upstream_source_archives/ditto-master.zip` reads **four** `data/wdc/{cameras,computers,shoes,watches}/test.txt` files directly from the original Ditto ZIP. The aggregated `all/test.txt` is deliberately not double-counted. A malformed line with embedded tabulation is excluded rather than repaired speculatively. Dataset checksum, sample counts and outcomes are preserved in `PHASE157-WDC-EXTERNAL-PAIR-DIAGNOSTIC.json`.

The diagnostic is a **purposefully simple positive-only lexical reference**: propose matching only when the two titles share at least one product-like alphanumeric model token. All other pairs remain unresolved, **not confirmed different products**. The outcome is:

| Historical WDC title pairs | Count |
|---|---:|
| Valid externally labelled pairs | 4,251 |
| Gold positive (same product) | 1,156 |
| Gold negative (different product) | 3,095 |
| Match candidates proposed by token-overlap heuristic | 825 |
| Those candidates matching positive gold | 570 |
| Those candidates contradicting negative gold (**false merges if auto-accepted**) | 255 |
| Abstentions | 3,426 |
| Candidate precision over proposed matches | 69.09% |
| Recall of positive labels as proposed matches | 49.31% |

**Interpretation:** 255/825 token-overlap matching proposals are false against these gold labels. Never equate lexical overlaps with verified product identity. This is **not** an accuracy report for PEE v4.80, Ditto's actual trained model, GLiNER2, or end-to-end professional review extraction. It is not source-disjoint proof of future generalisation: WDC historical datasets have their own construction and sampling limitations. `WDC Products` (2024) and `Ditto`'s bundled WDC (2019) must not be confused as the same benchmark version.

## Regression and limits

- TypeScript project compiled with Node v22/TypeScript local compiler; **2,059 eligible tests passed** across 117 files in ten shards; no failures; two pre-existing Phase91/92 legacy files excluded (same policy as baseline). See `PHASE157-TYPESCRIPT-REGRESSION.json`.
- **77 Python tests passed**: `primary_sources` 47, `ingestion` 21, `tests-python` 9. The first `unittest discover -s primary_sources` invocation produced a relative-import error because of invocation method; rerunning using proper package-qualified modules produced 47/47 passing. Do not silently interpret this as a code failure or as a successful first invocation.
- Phase157 adds **no** production runtime dependencies, neural checkpoint downloads, model training, auto source crawler, API billing, source-authenticity guarantees or public third-party credits.
- No real complete publisher HTML or full review has been run through Phase157. There is still **no independent quality estimate** for model recognition or aspect extraction on unseen professional reviews.
- Next steps should be large coherent integrations and evidence-led model qualification rather than continuing small ad hoc regex expansions. Benchmark comparison must measure false SKU merge first, category transfer, CPU/RAM, absolute runtime, model licence, checkpoint source and reversibility.

## Exact next tasks

1. **Qualify pretrained checkpoints** for GLiNER2; Ditto model matching; English PyABSA aspect extraction; OA-Mine in-domain BERT. For every checkpoint, obtain the actual license, origin, file checksum, source/training constraints, size, CPU inference performance, and ability to deploy without new always-on services. If a checkpoint is unavailable or not commercially cleared, explicitly stop that branch, not the whole pipeline.
2. Run full extruct on representative **authorized real product-page HTML** as an offline upstream stage, preserving raw page custody and JSON-LD field paths. Compare with v4.80 plain-text reading; ensure publisher/merchant data are not treated as independent lab measurements.
3. Implement actual optional inference adapters (prefer small local models and runtime isolation), then test on unseen refrigerator, air fryer, coffee machine, oven, television and other categories. Source-/product-disjoint matching pairs are **distinct** from fully annotated review documents.
4. Keep canonical product database, scientific approvals and deterministic ranking closed until verified evidence and explicit review. Preserve `sourceAuthenticated=false`, `identityVerified=false`, `canonicalWriteAuthorized=false`, `rankingAuthorized=false` as appropriate.

## Upstream links and source trails

- OA-Mine: https://github.com/xinyangz/OAMine ; publication: https://arxiv.org/abs/2204.13874
- Ditto: https://github.com/megagonlabs/ditto ; publication: https://arxiv.org/abs/2004.00584
- extruct: https://github.com/scrapinghub/extruct
- WDC Products: https://github.com/wbsg-uni-mannheim/wdcproducts ; benchmark publication: https://arxiv.org/abs/2301.09521
- PyABSA: https://github.com/yangheng95/PyABSA
- Bundled historical WDC description: `research/upstream_source_archives/ditto-master.zip` → `ditto-master/data/wdc/README.md`

All version-specific claims in this report were checked against the **user's actual uploaded ZIP files**, not assumed from these live upstream URLs.
