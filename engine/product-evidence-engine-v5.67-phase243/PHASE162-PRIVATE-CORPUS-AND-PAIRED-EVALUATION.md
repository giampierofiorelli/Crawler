# PEE Phase 162 / v4.86 — Private source corpus and matched evaluation

**Baseline:** Product Evidence Engine v4.85, Phase161. **Release scope:** a reusable, offline, rights-declared full-document corpus preparation process, span-level native exports, and a matched neural-vs-native evaluation. No new live model inference, publisher crawling, deployed inference host, verified external human gold, confirmed scientific findings, or rank/database changes.

## What is executable

1. `scripts/phase162_corpus_prepare.py`: reads an operator-controlled JSON index and separately stored UTF-8 document files; verifies SHA-256; requires a source URL, role, kind and a rights declaration; rejects unsafe paths, duplicate documents/URLs and cross-split sharing of either product family or publisher group; writes private `pee.phase160.batch.v1` manifests in chunks of at most 100, segregated into development and frozen-holdout splits. Source permissions are **operator declarations, not independently authenticated**. The record limit is 5,000, the per-document limit is 120,000 UTF-16 code units. No crawling or scraping takes place.
2. `scripts/phase162-native-export.mjs`: invokes the existing Phase160 manifest validator; runs the full-document Phase156 native analyzer and records raw model, feature and quantitative spans with the exact input digest, keeping output private. The `brand` inventory is not emitted by the native pathway and stays empty rather than inventing detections. No legacy output is overwritten.
3. `scripts/phase162_benchmark.py`: compares exactly aligned character spans by label (`product_model`, `brand`, `product_feature`, `measured_value`) against a separately supplied source-hashed gold file. It reports TP/FP/FN and precision/recall/F1 per label, document coverage/missing results, and a strict *paired subset* to avoid comparing unequal document selections. Its methods cannot prove that human annotation was independent or blind: `independentBenchmarkEstablished` is always false until that is externally checked through the earlier Phase137/150 workflow. A confidence score is never equated with accuracy. Outputs do not confer scientific approval.

### Private running example

```bash
python scripts/phase162_corpus_prepare.py --index /private/pee-corpus/index.json --private-root /private/pee-corpus/text --out-dir /private/pee-jobs
npm run build
node scripts/phase162-native-export.mjs --manifest /private/pee-jobs/<datasetId>.json --out /private/pee-eval/native.json
# Only after a trusted worker has executed *actual* checkpoint inference on precisely the same manifest:
python scripts/phase162_benchmark.py --manifest /private/pee-jobs/<datasetId>.json --native /private/pee-eval/native.json --neural /private/pee-results/<datasetId>.neural.json --gold /private/pee-gold/<datasetId>.json --out /private/pee-eval/paired.json
```

The corpus index schema requires `protocol: pee.phase162.corpus.v1`, `datasetId`, and `records` containing Phase160 source fields plus `textFile`, `sha256`, `split`, `productFamilyId`, `publisherGroupId`. Full-review kinds require a declared owner, permission, or public-domain basis. It does not certify these claims. Gold protocol: `pee.phase162.gold.v1`, same datasetId, `annotationProcess` as `developer_constructed` or `external_human_adjudication_unverified`, `cases` keyed by document id with SHA-256 and four explicit span-label arrays. All offsets are UTF-16 code units.

## Actual results (do not confuse with independent benchmark)

Two **constructed** snippets from the *genuinely executed* Phase159 Colab JSON were replayed, without re-executing GLiNER2.5, and manually specified developer labels were used for diagnostic comparison. The Python generator `scripts/phase162_constructed_pilot.py` and `research/phase162/` retain the reproducible replay inputs. Exact-span matches on the two-case paired subset:

| Label | Gold mentions | Native TP/FP/FN | Pre-existing neural TP/FP/FN |
|---|---:|---:|---:|
| Product model | 8 | 1 / 2 / 7 | 4 / 0 / 4 |
| Brand | 5 | 0 / 0 / 5 | 5 / 0 / 0 |
| Feature | 2 | 0 / 0 / 2 | 2 / 0 / 0 |
| Measured value | 1 | 0 / 0 / 1 | 1 / 0 / 0 |

These small, constructed and researcher-labelled passages are not a source/product-disjoint sample. Neural output comes from the earlier *real* Google Colab execution, not from this release, and the native engine has different feature/brand output contracts. The table demonstrates a diagnostic extraction gap, not calibrated model accuracy or a fair operational comparison of complete editorial reviews. Gold annotation does not test product/tested-versus-comparison relations, unit comparability or scientific evidence acceptance; these require separate labels and evaluation.

Corpus preparation stress: 205 **constructed** source records, divided into four batches (100, 4, 100, 1) with product-family and publisher-group split disjointness; the test exercises **manifest preparation only**, not model inference or retrieval. `PHASE162-CORPUS-PREPARATION-STRESS.json` records counts, no source text. The corpus preparation script itself was tested against real files in a temporary local directory.

## Verification and limitations

- TypeScript compilation passed; **2,087 TypeScript tests across 121 eligible files**, grouped, no errors; Phase91/92 excluded as inherited. The new native exporter is a CLI using existing TypeScript library code. `PHASE162-TYPESCRIPT-REGRESSION.json` records each group.
- Python: 47 primary source tests, 21 ingestion tests and 27 tests-python tests, **95 passed**; 5 new Phase162 tests covering paired metrics, source/gold alignment, split leakage, missing neural results and UTF-16. See `PHASE162-PYTHON-REGRESSION.json`.
- `PHASE162-CONSTRUCTED-PAIRED-DIAGNOSTIC.json`: only developer-constructed gold, no independent quality claim. Publisher full-review source rights, model checkpoint presence, and external annotation independence remain unverified.
- The Phase161 resident worker remains **undeployed**. We have not measured model cold/warm CPU throughput, GPU usage, RAM, whole-editorial-review runtime, independent precision/recall or end-to-end recommendation quality.
- Private full texts/annotator packets must stay out of public ZIPs; no third-party full repository copies or weights are bundled. Public site remains PEE-branded with legally required upstream attribution retained only in technical files.

## What prevents real professional-review benchmarking

A trusted long-lived execution host with GLiNER2.5 checkpoints, publisher-authorised complete original English product-test documents from multiple editors/categories, and genuinely independent blind gold annotations. A public article URL is not permission to redistribute or persist the whole article. The next work should qualify those sources and host, run a frozen source- and product-disjoint corpus, measure failures on real reviews and add attribute-to-product attribution labels only after errors are observed. Model candidates must remain separate from approved scientific evidence and user ranking.

## Source / method references

- GLiNER2 source: https://github.com/fastino-ai/GLiNER2 ; model: https://huggingface.co/fastino/gliner2.5-small-v1
- medSpaCy: https://github.com/medspacy/medspacy ; Snorkel: https://github.com/snorkel-team/snorkel ; DeepKE: https://github.com/zjunlp/DeepKE
- ExtractGPT evaluation adapted previously, Apache 2.0: https://github.com/wbsg-uni-mannheim/ExtractGPT
- Prior internal Phase137 source custody, Phase150 disjoint benchmark, Phase159 actual external Colab, Phase160 batch and Phase161 worker reports inside this ZIP. No new claim is based on an unverified outside publication.
