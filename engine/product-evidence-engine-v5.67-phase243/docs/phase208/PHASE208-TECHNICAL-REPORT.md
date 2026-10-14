# Product Evidence Engine — Phase208 technical report (v5.32.0)

**Date:** 13 October 2026  
**Predecessor:** `product-evidence-engine-v5.31-phase207.zip`  
**Status:** bounded engineering increment. No real-world provider accuracy, original-video authenticity or validated purchase improvement established.

## Executive verdict

The largest immediately demonstrable failure mode in the video-evidence workflow was an invalid A/B comparison: two providers could be scored using different video/product scopes or distinct reviewer/source sets, leading to apparent superiority produced by dataset differences. Phase208 now enforces a common fixed cohort and shared signed review set before any paired diagnostic. It exposes abstention separately from wrong answers and reports missing critical buyer criteria. This closes a software evaluation-design gap; it does **not** solve the still-blocking lack of independently reviewed original media.

## Files and architecture

- `src/phase208_paired_provider_trial.ts`: `comparePairedVideoProviders208` accepts 2–5 named provider family arms. Every arm calls `admitSignedBenchmark207`, which in turn reuses Phase206 evaluation. It checks the same canonical video scope, exact variant, product category, criterion, discipline, language, review source, signing policy, case review signatures, pair review signatures and evaluation instant across providers. Unidentical cohorts or unsigned/modified freezes fail closed.
- It compares each resolved classification field on exactly the same reviewed cases: both correct, both wrong, only left/right correct, one-sided responses, dual abstention. Disagreements and unresolved truth labels are not silently relabelled. It also checks whether critical requested criteria have any exact-variant, task-relevant signed annotations. No claim is made that such an annotation proves a good espresso, reliable knife or functional product.
- `tests/phase208_paired_provider_trial.test.ts`: 29 adversarial and regression-focused software tests; synthetic signatures and judgments are never interpreted as real reviewer credentials.
- `scripts/phase208-public-metadata-fair-replay.mjs`: a reproducible non-inference replay of six public URL leads from Phase206, three category trials and four named provider families, all **not run**. Source receipts and claims are not fabricated.
- `docs/phase208/README.md`: operational benchmark protocol; all parent files and all three third-party source archives retained.

## Authentic-source pilot and provider comparison results

The inherited six YouTube source leads are authentic public URL discoveries, NOT verified media bodies or reviewed video experiments. Across the categories espresso machines (2 links), air fryers (2) and Japanese knives (2), Phase208 returned **0 reviewed video bodies, 0 dual-review gold labels, 0 completed provider executions, `accuracy: null`**. The expected criteria remained missing. The four providers in the replay are candidates, not providers experimentally benchmarked.

No human assessors have been recruited or independently credential-checked, original video bytes have not been authenticated, and no comparison of latency, precision/recall, creator expertise, sentiment extraction or final product rankings was run on original videos. Accordingly **no statement of provider superiority is justified**.

## Test results

- TypeScript compilation: passed.
- 29/29 new Phase208 targeted software tests: passed.
- Cumulative TypeScript: **3,701 verified passed** across 14 grouped/bounded runs, including 12 separately completed files in the legacy group. Inherited `phase91_watch_gate.test.js` and `phase92_recipe_lifecycle.test.js` remain **unconcluded**, not passed. The first full regression process exceeded its time limit; final totals were reconstructed from per-group logs, and the modified group was re-run after the last patch.
- Python: **212 passed**, divided into 47 primary, 21 ingestion, 26 evaluation, 12 Phase95, 35 tests-python, 71 companion; historical ResourceWarnings remain warnings.
- Detailed machine-readable results are in `PHASE208-TEST-RESULTS.json`; original test logs under `docs/phase208/test-logs/`.

Test success establishes properties of the comparison protocol **on authored fixtures**. It is not independent validation of any AI, reviewer, external library or purchase recommendation.

## Direct comparison with Phase207

| Capability | Phase207 v5.31 | Phase208 v5.32 |
| --- | --- | --- |
| Review authenticity | Key/signature validation, still without independent real-world verification | Reused unchanged |
| Provider evaluation | One provider at a time | Fixed-cohort pairwise analysis with identical signed labels and case scope |
| Abstention | Per-provider metrics | Explicit one-sided / dual abstention vs paired correctness |
| Buyer criteria | Case scope and relevance | Reports exact-variant labelled coverage gaps on critical criteria (research-only) |
| YouTube access | Metadata leads, no body | Unchanged; no prohibited acquisition path introduced |
| Actual source-reviewed gold | Zero | Zero |
| Product rankings and site badges | Unchanged | Unchanged |
| External libraries | Preserved, not installed | Preserved, not installed |

## Risks, limits and next work

The signature policy is configured by an operator; it does not prove an actual independent person watched the footage. An operator can still supply an entirely fictional label set. Provider `runStatus` is a claim, not an authenticated process execution or cost measurement. A product's success cannot be inferred from the mere existence of a specialist observation. Statistical advantage estimates from small, biased or hypothetical sets would be unwarranted.

Phase209 should focus on controlled, legal access to a small real audio/video benchmark, independently verified professional/language annotators, precise outcome observations, and a reproducible A/B run of native PEE against available provider candidates. The gating and abstention metrics from Phase208 can then be used without accepting unverifiable synthetic ground truth.

## Original sources and source-code candidates

1. [W3C PROV-O](https://www.w3.org/TR/prov-o/) — provenance entities/activities/agents, derivations and source relations.
2. [Cochrane Handbook, Chapter 5](https://www.cochrane.org/node/97) — one original study may appear in multiple reports.
3. [NIST AI RMF, MEASURE](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) — measurable context-bound evaluation with documented uncertainties.
4. [YouTube official captions documentation](https://developers.google.com/youtube/v3/docs/captions/download) — uploader/edit permission required for the official download method.
5. [MediaWiki API imageinfo](https://www.mediawiki.org/wiki/API:Imageinfo) — potential metadata source for properly licensed alternative video benchmarks; not integrated in Phase208.
6. Original code packages in `research/phase205-external-code/` and Phase205 code audit: YouTube.js, youtube-transcript-api, PyABSA. No new package or model was installed.
