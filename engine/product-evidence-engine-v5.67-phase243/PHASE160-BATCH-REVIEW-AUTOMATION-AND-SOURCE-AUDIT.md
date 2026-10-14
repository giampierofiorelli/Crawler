# Product Evidence Engine v4.84 — Phase 160

Date: 12 October 2026. Baseline: verified cumulative `product-evidence-engine-v4.83-phase159.zip`. Scope: **English-first, explicit batch review coordination, direct audit of newly uploaded product-domain repositories, and scientifically quarantined evaluation**.

## Executive finding

**A repeatable, executable batch harness now exists**. `runReviewBatch160` handles 1–100 source-hashed documents in one invocation, invokes the established Phase156 native reader for each, and optionally consumes correctly bound GLiNER2.5 external predictions through the modified Phase159 coordinator. It preserves PEE's previously adapted medSpaCy-style context, Snorkel-style vote diagnostics, GLiNER2-style span/window logic and DeepKE-style mention-evidence graphs in their existing main analytical pipeline. A failed neural source case can be quarantined without preventing analysis of other documents.

This is a **substantial workflow expansion**, not proof that PEE now fully understands reviews or that GLiNER2.5 is operating within PEE's local runtime. **Real pretrained neural inference was NOT executed in Phase160.** Only the already executed, supplied Phase159 Colab outputs were replayed, alongside three authentic short RTINGS excerpts on the native engine. The Python neural adapter was exercised with a fake deterministic extractor to test boundaries, format and UTF-16 positions; the actual GLiNER2.5 model was not locally loaded. A stable inference host and a rights-permitted, independently annotated full-review corpus are still missing.

## New implementation and components

| Component | What is newly executable | What is not claimed |
|---|---|---|
| `src/phase160_batch_review_pipeline.ts` | Source/rights declaration, SHA-256, English document kind, 100-document limit, per-case native / external-neural coordination, quarantined error outcome, compact per-doc diagnostics with source URL and digest | Legal rights verification, independent review annotation, automatic source acquisition, product identity or science approval |
| Modified `src/phase159_colab_gliner25_coordinator.ts` | A third, strictly source-bound external case type `rights_permitted_full_review_unannotated`; requires exact title, source URL, content SHA and correct spans for documents up to 120,000 UTF-16 units | Claim that the full document was actually professionally reviewed or independently annotated |
| `scripts/phase160-batch.mjs` | One command for repeatable local batch intake / optional external results, no internet / DB required | Scheduled execution service, publisher scraping |
| `scripts/phase160_gliner_batch.py` | Optional *offline* pretrained-model batch invocation, overlapping character windows and duplicate consolidation; conversion of Python Unicode offsets to JavaScript UTF-16 offsets | Pretrained model inference actually performed in Phase160; certified model weights; performance benchmarking on full documents |
| `src/phase160_attribute_eval.ts` | Adapted ExtractGPT `pieutils/evaluation.py` five mutually exclusive error groups NN/NV/VN/VC/VW for externally supplied annotations | Existing independent gold, calibrated confidence, scientific evidence or any effect on ranking |

**Important boundaries.** The manifest's rights declaration is a caller assertion, not validation of permission. It is a safety and audit gate, not a substitute for a legal review. Any missing/conflicting external model result remains unverified. A confidence is a model score, not an accuracy statistic. Full original copyrighted reviews are neither supplied in this package nor scraped.

The new CLI does **not** perform automated internet research. It takes user/organisation-authorised text through a source-preserving manifest. The corresponding optional GLiNER2.5 runner requires an already-local checkpoint and explicitly disables model downloading when executed in an offline environment; this prevents an unexpected heavyweight runtime dependency in PEE deployments. Operational automation on a persistent server is next, subject to deployment decisions.

## New source-code audit (original uploaded ZIPs opened directly)

| Archive | SHA-256 | Observed license | Decision |
|---|---|---|---|
| ExtractGPT-main.zip | `02c6a8588d854c9f5ac269b501087eddd1c6a440e5c845c214b1d3bb331198c5` | Apache-2.0 LICENSE | Ported the five-way attribute evaluation logic into TypeScript, preserving internal Apache-2.0 license and selected original `pieutils/evaluation.py` |
| wdc-pave-main.zip | `a9e6e01be1cb3e1b5966fca8fce7bea4ed11a1493318d8df866b92ddf638b871` | No explicit LICENSE or license statement found in uploaded root/readmes | Technical research only. No Python code copied or weights incorporated; legal clearance is required before actual source reuse |
| wdcproducts-main(1).zip | `c763efd62c184f806d99de08f02425a17942902732887443dced62e8dcf3b923` | LICENSE present; existing source | SHA-256 identical to the previously retained WDC Products archive. Do not duplicate |
| MAVE-main.zip | `11e3b9b94fd42e4721538f27cc3ab0b609cb232621758231fea74bc498777cbe` | CC BY-NC 4.0 LICENSE | No MAVE code or dataset imported or used for training; research/background only |

Upstream links: [ExtractGPT](https://github.com/wbsg-uni-mannheim/ExtractGPT), [WDC PAVE](https://github.com/wbsg-uni-mannheim/wdc-pave), [WDC Products](https://github.com/wbsg-uni-mannheim/wdcproducts), [MAVE](https://github.com/google-research-datasets/MAVE). The ExtractGPT author's article is linked in their README: https://arxiv.org/abs/2310.12537 . Source-specific notices reside **in internal technical files**, not the user-facing website UI. The entire uploaded repositories are excluded from the cumulative ZIP.

## Results recorded in this release

### Five-case **mixed** execution (not independent benchmark)

`research/phase160/phase160_five_case_diagnostic_manifest.json` includes:

- Two **developer-constructed** examples: Maytag refrigerator vs GE, and De'Longhi coffee machine vs Breville. The **existing genuine GLiNER2.5 Colab predictions from Phase159** are reused; 7 and 5 neural spans respectively, with Phase159 roles and source-aligned candidates; no new inference.
- Three **previously selected original, short** RTINGS publisher passages: Maytag and LG refrigerators, and COSORI air fryer. Only the **native Phase156** analysis was run, with 0, 1 and 1 extracted mentions respectively. No GLiNER2.5 prediction was executed on these genuine publisher passages.

**5/5 cases processed without quarantine**, 2 neural replay and 3 native-only, as written in `PHASE160-MIXED-BATCH-DIAGNOSTIC.json`. This demonstrates case-routing, schema separation and replay, **not overall extraction quality**. Inputs are selected and unannotated; there is no independence, source-disjoint evaluation, whole-editorial-review processing or measures of precision/recall.

### 100-document stress check

A synthetic batch repeating the original constructed Maytag text with 100 distinct IDs completed: **100/100 native cases processed**, 0 quarantine in approximately 0.28 s wall-clock on this tool environment. This is a repeatability/candidate-volume test, **not** a throughput estimate for diverse full-length reviews or a neural inference benchmark. The result summary is retained in `PHASE160-BATCH-STRESS.json`; not presented as independently sourced user reviews.

### Regression and code checks

- `npm run build`: succeeded.
- **2,085 JavaScript/TypeScript tests** passed in **120 eligible files** in **ten separately recorded groups**, Phase91/92 legacy tests excluded as in prior releases. A subsequent one-line full-review source-status fix was validated with the 19 Phase159/160 focused tests; the attempted second all-file pass timed out, so **a post-fix complete regression is not claimed**. See `PHASE160-TYPESCRIPT-REGRESSION.json` and `PHASE160-POSTPATCH-VALIDATION.json`.
- **84 Python tests** passed: 47 primary sources, 21 ingestion and 16 in tests-python (three new Phase160 tests). The tests involving neural model calls use a stub extractor and do **not** constitute pretrained checkpoint inference.
- New targeted Phase160 tests: seven TypeScript plus three Python; include provenance and digest, rights declarations, record budgets, isolated corrupted neural spans, experimental full-document contract, UTF-16 adjustment and field-evaluation buckets.
- Science database, ranking and identity merging remain without automatic permissions.

## Operational use

```bash
npm run build
node scripts/phase160-batch.mjs \
  --manifest research/phase160/phase160_five_case_diagnostic_manifest.json \
  --neural research/phase159/GLINER25-COLAB-CONSTRUCTED-PILOT.json \
  --out batch-results.json
```

Without `--neural`, the same manifests run the native PEE path. With an already prepared local GLiNER2.5 checkpoint on a suitable machine, the optional `scripts/phase160_gliner_batch.py` can produce the external predictions file; **this was not exercised with actual weights**. The model is not automatically downloaded by PEE.

## Next priority / release gate

1. Provision a persistent internal **inference worker** with reviewed weights, pinned revision/hashes and licence. Exercise multi-document real neural inference; record memory, cold/warm CPU and, if used, GPU costs. Do not require the user to shuttle heavyweight weights or repeatedly operate Colab.
2. Assemble rights-cleared **complete** professional English reviews across categories; arrange independent source-disjoint annotations of product/variant names, test conditions, measurements and attribution. This cannot be substituted with short manually chosen excerpts.
3. Evaluate improvements and false matches against the frozen Phase160 native baseline. Break down abstention, missed mentions, false merges, value attribution, and reviewer-vs-manufacturer claim errors. Do not enable automatic scientific database writes or ranking based on model confidence.
4. Consider additional source-porting from ExtractGPT as justified by measured quality; WDC PAVE and MAVE stay excluded pending licence/rights qualification. Keep all upstream ZIPs outside lean releases.
