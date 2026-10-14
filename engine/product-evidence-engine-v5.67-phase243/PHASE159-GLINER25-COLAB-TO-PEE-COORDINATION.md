# Product Evidence Engine v4.83 / Phase159 — first executed-neural-output coordination

Date: 12 October 2026. Baseline: Phase158/v4.82. Scope: **English**, externally executed GLiNER2.5 diagnostic results, review-reading and strict scientific/ranking separation.

## Executive finding

**Functional:** first authentic GLiNER2.5 Small model inference output, run by the user on Google Colab, has now been consumed **as externally generated, non-authoritative hypotheses** by the PEE TypeScript review pipeline. The integration uses the raw uploaded JSON, validates model/case/schema and exact source offsets, cross-compares the spans with Phase156 document mentions, applies the medSpaCy-derived scoped-context rules and the Snorkel-derived label-vote diagnostics, and derives cautious *textually evidenced* roles for products and co-located feature/quantity candidates. No remote service or 296 MB model weights are introduced into the PEE deployment.

**Not demonstrated:** model weights available inside PEE, provenance attestation for the actual downloaded checkpoint revision, comprehensive semantic understanding, independently annotated accuracy/recall, full publisher-review neural inference, verified product identity, independently measured feature values, canonical database ingestion, or ranking changes.

## Supplied external execution — exact claims

User-provided `PEE-GLiNER25-pilot-results.json` reports:

- Model ID `fastino/gliner2.5-small-v1`, architecture `boundary`, installed gliner2 version `2.1.0`, Python `3.13.16`. **These are self-reported runtime properties, not a signed checkpoint identity.** The model card and code are publicly available at https://huggingface.co/fastino/gliner2.5-small-v1 and https://github.com/fastino-ai/GLiNER2 .
- Two **constructed** snippets only, no original publisher paragraphs: a Maytag/GE fridge comparison and a De'Longhi/Breville coffee-machine comparison. Raw results are preserved at `research/phase159/GLINER25-COLAB-CONSTRUCTED-PILOT.json` without weights, and matched against the supplied original user upload in development.
- Fridge: seven source-aligned neural spans (two `product_model`, three `brand`, one `product_feature`, one `measured_value`); 0 reported offset errors; runtime 0.838 s as reported by Colab. Coffee: five spans (two `product_model`, two `brand`, one `product_feature`); 0 reported offset errors; runtime 0.430 s. The timings are external-environment diagnostic timings, **not local service latency**. Confidence scores are **not** accuracy metrics.

## Actual new implementation

`src/phase159_colab_gliner25_coordinator.ts` exports `analyzeGLiNER25ColabCase159(input,report,caseId)` and returns a non-authoritative, deterministic Phase159 ledger. It calls the existing `analyzeEnglishReview156` as its baseline (the Phase154/155/156 pipeline already includes medSpaCy-inspired scoped context, Snorkel label statistics, GLiNER2 overlap/window ports, and a DeepKE-style evidence graph). It then:

1. Validates the declared full source SHA-256 against the source text, report model ID/architecture, supported case status, exact input equality, offset-error flag, allowed labels, span text and start/end positions, 0–1 confidence, duplicate spans, and candidate budgets. Mismatches are rejected rather than silently converted to evidence. A matching untrusted self-reported report is **not** cryptographic attestation of the inference runtime.
2. Compares each neural span with current heuristic mentions using `exact`, `overlap` or `not_found`. Nested brand/model pairs are **not** automatically merged as product identities.
3. Processes model mentions through bounded English sentence/clause cue checking with disambiguated unique short aliases. Explicit testing, explicit non-testing, comparisons and genuine contradictory test statements receive different *provisional* discourse statuses, supported by offset-linked cue surfaces. These are narrow textual diagnostics, not semantic entailment proofs.
4. Builds a medSpaCy-derived context graph for every neural span and a Snorkel-derived vote matrix for test/non-test/comparison cues. Vote conflicts are descriptive and cannot override scientific review.
5. Pairs an exact source-aligned neural feature with a numerical value **only when exactly one feature candidate occurs in that sentence**. Attempts provisional model linkage through an associated repeated brand surface. This is not a verification that a publisher measured that value: `isPublisherMeasurement:false` and `scientificEvidence:false` remain fixed.
6. Retains `sourceAuthenticated:false`, `checkpointAuthenticated:false`, `independentlyAnnotated:false`, `modelQualityBenchmark:false`, `identityMergeAuthorized:false`, `canonicalWriteAuthorized:false`, and `rankingAuthorized:false` regardless of model confidence.

`tests/phase159_gliner25_colab_coordinator.test.ts`: **12 new tests**, including original user-result replay, altered text/SHA, hallucinated spans, overconfident predictions, bogus model provenance, unrecognised labels, duplicates, error flags, contradictory statements, and a separately qualified *short published-excerpt* report schema for future Colab runs. `scripts/phase159-replay.mjs` generates two auditable diagnostics without network access:

- `PHASE159-COLAB-COORDINATION-DIAGNOSTIC.json` — raw neural span comparison with Phase156 and provisional roles and feature/value pair.
- `PHASE159-REAL-REVIEW-EXCERPT-DIAGNOSTIC.json` — **native engine only** on three short publisher passages, no inferred neural output.

## Result: two constructed inputs

| Case | Phase156 heuristic full-surface mentions | GLiNER2.5 spans | Product reference roles from combined Phase159 | Source-aligned feature/value |
|---|---:|---:|---|---|
| Maytag MRT311FFFE / GE GTS22KGNRWW | 2 | 7 | Maytag model `explicitly_tested`; GE `comparison_only` | `cooling noise` + `44.9 dBA`, provisional Maytag name reference, **not independently measured evidence** |
| De'Longhi Dedica Duo / Breville Bambino | 2 | 5 | De'Longhi `explicitly_tested`; Breville `explicitly_not_tested`, plus comparison cue | None |

**Important correction:** the coffee text states the Breville is *compared with* the De'Longhi and separately says it was not tested in the article. The two statements are not contradictory. Earlier conversational speculation called this a contradiction; the actual coordinated output does **not**. A separate constructed counterfactual with both an explicit test and explicit non-test of Breville does produce `both_tested_and_not_tested` with an unresolved audit reason.

The baseline Phase156 spans sometimes cover brand+model together, while the neural model returns brand and code as separate spans. These are not naturally comparable as named-entity *accuracy* counts. New neural-only features and measurements are potential recall opportunities, not proven correct annotation metrics.

## Original publisher excerpts — deliberately bounded diagnostic

Original RTINGS sources verified 12 October 2026:

- Maytag refrigerator, https://www.rtings.com/refrigerator/reviews/maytag/mrt311fffh-black — original short, 13-word test-unit passage; Phase156 did not recover a model mention.
- LG STUDIO refrigerator, https://www.rtings.com/refrigerator/reviews/lg/studio-srfb27w3 — original 8-word capacity sentence; Phase156 recovered a `reviewed_surface` mention.
- COSORI Dual Blaze air fryer, https://www.rtings.com/air-fryer/reviews/cosori/dual-blaze-6-8qt-caf-p583s-single-basket — original 14-word cooking-speed passage; Phase156 recovered a mention but did not reconcile it to the page title (role unresolved).

These excerpts were chosen by the developer while inspecting the articles. **No pretrained GLiNER2.5 inference was executed on these publisher excerpts** in the present release and no independent gold labels or sample-size-based precision/recall claims exist. The short passages are preserved with URLs, exact quote/source hashes, and native outputs in the local diagnostic file only. Any review text ingestion will continue to depend on source rights and provenance; full copyrighted editorial articles are not packaged here.

## Next executable neural comparison, from an iPhone

`PEE-GLiNER25-REAL-REVIEWS-iPhone-COLAB.ipynb` is a standalone Colab notebook prepared with the **same three short publisher passages**. The user can upload it to Colab and select `Run all`, with no edits, terminal or 296 MB chat upload. It downloads weights in Colab and emits a small `PEE-GLiNER25-real-excerpts-results.json` file. The coordinator already supports the explicit separate status `published_short_excerpts_not_independent_benchmark`, requires source URL/title matching for each passage, and continues to mark the reported source **unverified**. This new notebook is **syntax/structure checked locally, not executed** here.

## Tested regression and archive rules

- `npm run build`: success.
- TypeScript/Node: **2,078 passed across 119 eligible test files** (ten bounded groups, phase91/92 historical exclusions). Execution was split: the first 8 groups completed before the caller's global timeout; the two remaining groups were independently run, and the phase159 group was re-run after adding test #12. Counts and run topology are recorded in `PHASE159-TYPESCRIPT-REGRESSION.json`, not represented as one uninterrupted invocation.
- Python: original **81 tests passed** (47 primary sources, 21 ingestion, 13 tests-python). No new Python runtime dependencies.
- Original 1,664 v4.82 ZIP members preserved byte-for-byte except intentionally updated `README.md` and `package.json`. New code, tests, diagnostics and provenance are additive. Historical license material remains untouched. No upstream repository ZIPs or model weights are copied into the lightweight release.

## Limitations and the next gate

The production-quality question remains: on rights-permitted, source-disjoint **complete English professional reviews** with independently annotated entities, relations, test conditions and measurements, does the pretrained model improve useful recall **without** increasing false product merges or manufacturing facts? The three unmarked short publisher samples and two constructed neural cases cannot answer that question. Model/checkpoint licence, revision pinning, downloadable artifact hash, CPU/RAM/latency on the eventual server, and dependency isolation remain open. No automatic ranking or scientific-record integration should occur until that evidence is available.
