# Product Evidence Engine — Phase 242 source-code audit and model-neutral table bridge

**Release candidate:** PEE v5.66.0 · **Date:** 2026-10-14 · **Language:** English-first PEE internals.

## Executive verdict

The two archives supplied by the user are genuine, useful **source-code repositories**, but **neither ZIP includes pretrained inference weights**. They are **not** ready-to-use trained PDF readers in this container. Installing either full stack as a mandatory PEE dependency would contradict the project's lightweight, replaceable-inference design. Their documented output structures nevertheless allow an immediate improvement: a common transient table-cell graph that works with TATR cells, PaddleOCR `pred_html` and simple HTML source tables. This phase implements and tests that *interface*, not the vision models or broad PDF generalization.

## Supplied archives inspected (read source, not hypothetical GitHub examples)

| Source ZIP | SHA-256 | Members | Inference weights found | Repo licence |
|---|---|---:|---|---|
| `table-transformer-main.zip` | `45a5e2cf785ed7a06e5e3a98d4d4be67b904ec17ac3d177db79bb639a6747410` | 76 | **0** `.pth/.onnx/.pt/...` model files | MIT, `LICENSE` |
| `PaddleOCR-main.zip` | `666a6eb4c3a0bdf84e113482acf11d6c7b4731a4e65ef9317e96b52c2474ad8e` | 2,969 | **0** model weight files | Apache-2.0, `LICENSE` |

The archive date and exact Git commit cannot be reliably reconstructed from a GitHub ZIP without `.git`. GitHub URLs below provide the public upstream, not a claim that this ZIP was checked out at a particular commit. Third-party checkpoint licenses, external models, runtime requirements and datasets must be assessed individually before deployment; a repository code license does not settle them.

## Source-level findings

### Microsoft Table Transformer (TATR)

Inspected: `README.md`, `docs/INFERENCE.md`, `src/inference.py`, `src/postprocess.py`, `src/grits.py`, `environment.yml`, `LICENSE`.

- The model predicts **table detection** and **table structure** from **images**. Obtaining text for the table still requires PDF text tokens or OCR supplied separately (`tokens` list with `[xmin,ymin,xmax,ymax]` image-coordinate word boxes).
- `src/inference.py::structure_to_cells` exposes `row_nums`, `column_nums`, `bbox`, `column header`, `projected row header`, and `cell text`. This is significantly more expressive than CSV, which discards source bounding boxes and multirow header semantics.
- `src/inference.py::cells_to_html` creates HTML with `rowspan` and `colspan`. It does **not** by itself resolve whether a cell is a technical specification for the parent appliance, an accessory or a regional variant.
- Upstream model checkpoints are listed separately (around 110 MB each for detection/structure choices). The example `environment.yml` specifies Python 3.10, PyTorch, Torchvision and CUDA-oriented dependencies; CPU fallback may be possible but **actual PEE CPU/RAM/latency were not measured**.
- `src/grits.py` and model evaluation distinguish grid topology, geometry and text correctness; these are promising *evaluation methods*. Product-specific semantic linkage requires an additional score.
- Domain shift from PubTables-1M and FinTabNet to multilingual appliance instructions, pictograms and fold-out manuals is unmeasured. **Not selected as a mandatory dependency.**

Sources: https://github.com/microsoft/table-transformer ; https://github.com/microsoft/table-transformer/blob/main/docs/INFERENCE.md ; https://github.com/microsoft/table-transformer/blob/main/LICENSE ; https://github.com/microsoft/table-transformer/blob/main/src/inference.py

### PaddleOCR / PaddleX PP-StructureV3

Inspected: `README.md`, `LICENSE`, `pyproject.toml`, `paddleocr/_pipelines/pp_structurev3.py`, `paddleocr/_pipelines/table_recognition_v2.py`, `tests/pipelines/test_table_recognition_v2.py`, and `docs/version3.x/pipeline_usage/PP-StructureV3.en.md`.

- The repository supports OCR, layout, table structure, text, charts and document parsing; the actual `PPStructureV3` interface is a PaddleX pipeline wrapper, **not a self-contained low-dependency PDF parser**.
- `pyproject.toml` requires `paddlex[ocr-core]>=3.7.0,<3.8.0`; broader document parsing loads additional extras, runtime and downloadable model resources. Hardware/deployment footprint remains unmeasured.
- The documented `table_res_list` contains `pred_html`, `cell_box_list` and `table_ocr_pred`. The documentation does **not explicitly guarantee that the Nth bounding box corresponds to the Nth parsed HTML cell**, so Phase242 deliberately does not pair them by index.
- A `pred_html` topology can be safely staged without a model running. This is **not proof** that PaddleOCR can recognize any of the user's uploaded PDFs or infer the meaning of pictograms.
- The OCR/layout/code capabilities and the checkpoint model licensing need separate verification; do not distribute font assets or vendor documents from the source ZIP.

Sources: https://github.com/PaddlePaddle/PaddleOCR ; https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/pipeline_usage/PP-StructureV3.en.md ; https://github.com/PaddlePaddle/PaddleOCR/blob/main/LICENSE

## Changes made in PEE v5.66.0

- `src/phase242_table_structure_bridge.ts` defines `TableGrid242`, with source document SHA-256, source identifier, source page, row/column indices, merged spans, optional geometries, producer and **unresolved semantic association**. `rankingAuthorized:false`, `scientificEvidenceAdmitted:false` and `sourceDocumentStored:false` are enforced.
- `fromTatrCells242` validates the documented TATR `cells` output, rejects invalid boxes, duplicate grid assignments, non-contiguous spans, absent text and bad source identity; preserves TATR image-space bounding boxes without calling them PDF coordinates.
- `fromPaddleStructure242` reads **bounded simple** `pred_html` table markup (including row/column spans), refuses unsafe/ambiguous HTML and leaves `cell_box_list` geometries **unmapped** until alignment can be proven.
- `fromHtmlTable242` maps ordinary simple HTML tables to the *same* cell graph. It is a bounded HTML subset, **not a general HTML5 DOM / accessibility-header implementation**. Multiple tables must be isolated by a future DOM adapter, rather than mixed silently.
- This graph is intentionally a **perception/structure layer**. It contains no automatically inferred product IDs, model assignments, standard/optional classification, dimensions, energy use, technical outcome or scientific results. Integrating a live model is a separate milestone.
- `tests/phase242_table_structure_bridge.test.ts` and `scripts/phase242-evaluate-bridges.mjs` use **fictional synthetic table outputs**. No original publisher document or commercial source repository is embedded in the release.
- The project version is updated to **5.66.0**, with `test:phase242` and `demo:phase242` script hooks. No mandatory npm dependencies added.

## Safety and generalization constraints

1. Numerical units alone do not determine the role of a claim: `600 mm` may be a wall clearance, not oven size; `2600 W` may be an applicability threshold, not model rating. Do not promote structural cells to product facts without relation/role verification.
2. A file named `JM4188` may say internal `JM4120` and have multiple gas categories. Keep both references unresolved until authenticated product identity and market are established.
3. A single source manual may describe an entire family, alternative accessories or mutually exclusive programmes; do not propagate one value across all variants.
4. Icons require semantic image interpretation, not just table grid reconstruction. **Neither archive, without its models, resolves Inicio Grill or Dolci pictograms**.
5. Even with a trained vision model, category learning requires distinct verified product identities, independent sources, semantic equivalence, conditions and original testing where performance claims are at issue.
6. Model output can be wrong or adversarial. Staging tables is not publisher permission, verified data, ranking authorization or a guarantee of safe product selection.

## Evidence and test level

- Real source-code audit of the two user-supplied ZIPs: **yes**.
- A model-free TypeScript adapter with real supported output *shapes*: **yes**.
- Actual TATR or Paddle model inferencing on original PDFs: **no** (checkpoints unavailable and dependencies not added).
- Benchmark against independent unseen manufacturer PDF/HTML pairs: **not yet**.
- Replayed complete historic PDF corpus with live vision model: **no**.
- Autonomous PEE web acquisition in this environment: **still unverified**.
- Full TypeScript regression and individual new test results: see `PHASE242-TEST-RESULTS.json` and `PHASE242-ALL-TS-TEST-LOG.txt` once complete.

## Recommended next measured experiment

1. Freeze at least 20 unseen held-out pages across **different brands and product categories**, plus genuine HTML equivalents, with manually reviewed exact cell-to-entity/role/variant ground truth; include negative controls (installation distance, conditions, accessories, warnings, unrelated quantities).
2. Compare **native Poppler/layout**, **pdfplumber**, **TATR** and **PaddleOCR** with identical page renders at recorded DPI. Record cell-grid GriTS-like accuracy *and separately* product attachment precision, safety-critical false attachment, recall/coverage, abstention, CPU/GPU RAM, cold start, page latency and total model footprint.
3. Test a model behind a **replaceable local worker** only if it materially improves correct, scoped extraction on held-out documents without unacceptable deployment costs. Keep model version, checkpoint SHA, licence and load policy explicit.
4. Align OCR text spans to table cells with geometric bounds and confidence; add page coordinates and text span citations to an auditable graph. Never join tokens to cells solely by array order.
5. Resolve product family/model/part/programme/market/condition via a reviewed relation layer; verify against manufacturer-independent sources for comparative claims. Only then allow candidate category knowledge to grow.

**Do not report an increase in actual PDF recognition accuracy from this release.** The change is architectural compatibility plus safety checks, not model inference.
