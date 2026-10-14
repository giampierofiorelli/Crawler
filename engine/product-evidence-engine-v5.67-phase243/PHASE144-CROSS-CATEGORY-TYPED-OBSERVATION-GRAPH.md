# Product Evidence Engine — Phase 144: typed cross-category observation graph

**Date:** 11 October 2026  
**Cumulative version:** v4.68 / Phase 144; parent v4.67 / Phase 143  
**Engineering policy:** English-first; native TypeScript; no new runtime dependencies or model weights; no production evidence promotion or ranking changes.

## Decision and observed result

The preceding Phase143 experiment revealed that a subject–verb–object reader missed almost all relations in brief original professional review passages from **washing machines, dishwashers, air purifiers, headphones and laptops**. The only old Phase139 relation in six excerpts incorrectly nominated a wash cycle as a product surface name. Adding more synonyms alone would not solve absent reviewed-product subjects, numerical comparisons or test conditions.

Phase144 independently implements `readCrossCategoryObservations144`, a separate **quantity-centered, typed observation** stage. It captures explicitly written values with document offsets, original-span SHA-256, simple dimensional categories, qualifiers, surface modes/test settings, locally supported endpoints, reporting attribution, and explicit unresolved-product statuses. It does **not** use a page hint as evidence that the omitted subject is the reviewed product. It does not assert causal, semantic entailment or tested-condition comparability.

**Six already-exposed professional snippets:** Phase144 located **12 typed quantity candidates** (distribution by category 1, 2, 3, 2, 2, 2), where the prior Phase139 reader proposed **one relation hypothesis**. These figures measure *different types of output* and **must not be presented as comparable accuracy/recall rates**. For the 12 candidates: four `subject_unresolved`, four `endpoint_unresolved`, one `comparator_unresolved`, one `claim_only`, one `setting_not_outcome`, one `candidate_quarantined`. Only the last is eligible even to remain as a local candidate, not as verified evidence.

**Three additional short publisher snippets selected after the code was written:** one television display measurement (`cd/m²`) was detected and correctly kept without an endpoint; a dehumidifier claim with `dB` and a coffee temperature with `°C` were **not detected**. These were developer-selected and observed, not blinded, independently annotated or a valid holdout. Do not tune on these snippets then reuse them to claim unseen performance.

## Implementation

`src/phase144_cross_category_observation_graph.ts` calls the existing Phase139 provenance/digest/ID guard and returns an additive graph of observations. It neither rewrites older phases nor pretends the old predicate reader has become a semantic parser. Its output includes:

- original source ID and SHA-256 for every document;
- exact source character offsets and SHA-256 for each numerical measurement, evidence sentence, condition, surface subject and endpoint;
- numerical type (`percentage`, `duration`, `screen_luminance`, `acoustic_level`, `operating_cost`), explicit unit and qualifiers such as `lower_bound`;
- `modeOrSetting` for named test modes/cycles and bounded `respectively` list alignment, clearly marked as **surface hypotheses**;
- `manufacturer_claim`, `test_or_reviewer_report` or `unknown` reporting status;
- explicit uncertainty statuses for no verified subject, absent metric endpoint, comparison to an older model, manufacturer-only advertising and a setting not to be confused with an outcome;
- bounded scanning with visible `coverageTruncated`; `no_candidate` never means the feature is absent;
- hard-coded `measuredProductAuthenticated:false`, `sourceAuthenticated:false`, `scientificReviewRequired:true`, `canonicalWriteAuthorized:false`, `rankingAuthorized:false`.

A sample sentence about Maytag's Heavy Duty cycle returns a 79.8% stain-removal candidate, but a `subject_unresolved` decision because **a cycle is not a product**. An adjacent sentence about a Normal cycle's 68% does **not inherit** the previous sentence's stain endpoint. A Bosch `respectively` construction produces three tentative alignments, but the percentage metric remains undefined. A SoundGuys excerpt keeps packaged 60-hour advertising separate from observed 54 h 43 min runtime; an older purifier variant's noise number is not reused for the reviewed model. In a Notebookcheck passage, 150 cd/m² is identified as a test setting, not an additional laptop battery result. All such statements still require checks outside Phase144.

This stage is a deliberately bounded step toward a document graph, **not** GLiNER2-like learned entity recognition, true VerbNet semantic-role assignment, a dependency parser, an NLI model, coreference resolution or automatic scientific knowledge growth. The four studied AI codebases (GLiNER2, DeepKE, medSpaCy, Snorkel) and TypeSafe design notes remain engineering references, not installed dependencies. WordNet, VerbNet and VADER data and original attribution included in Phase141 remain intact; none are used to turn lexical similarity into proof.

## Limits and scientific caution

1. Quantities are recognized using a **restricted unit grammar**. Missing examples: degrees Celsius, `dB` without the A suffix, kWh, mL, watts and diverse local/unit typography. Measurements in tables, formulas or HTML may have a different structure.
2. The stage cannot infer that an unlabeled percentage means stain-removal efficiency, energy reduction or a quality score. It declines cross-sentence endpoint inheritance.
3. Character-level extraction does not establish external identity of a product or the authenticity of the website snapshot. A caller-provided reviewed-product title/alias is context, never scientific proof.
4. This module is not connected to canonical category-knowledge update or the deterministic ranking; that remains the job of existing reviewed evidence gates.
5. Some distinctions still rely on bounded local verbal cues. Arbitrarily long nested clauses, sophisticated negation, passive attribution, numeric ranges, complicated multi-measure comparisons and full-document cross-reference may be misread or omitted.
6. Even a 'candidate_quarantined' outcome is only a **hypothesis**, not a verified scientific assertion. No blinded external gold samples, model-vs-model comparison, production memory/latency or end-to-end source-custody evaluation has been completed.

## Evaluation and release verification

- New focused authored assertions: **26/26**.
- Eligible TypeScript regression: **1,753 tests passing across 103 test files**; the same two earlier Phase91/92 timeout-prone legacy test files are excluded and not claimed to have passed.
- Python suites: **77 tests passing** (47 `primary_sources`, 21 `ingestion`, nine Phase133 probe tests).
- No new production dependencies, Python runtime requirement, AI weights, paid web API, automatic ingestion into scientific facts or alteration of ranking policy.
- File preservation and SHA-256 change audit are recorded in `PHASE144-RELEASE-VERIFICATION.json` and `PHASE144-FILE-MANIFEST.sha256`.

Reproducible within the existing TypeScript development environment:

```bash
npm run build
node --test dist/tests/phase144_cross_category_observation_graph.test.js
node scripts/evaluate-phase144.mjs
node scripts/phase144_regress.mjs
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s primary_sources -t . -p 'test_*.py'
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s ingestion -p 'test_*.py'
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s tests-python -p 'test_phase133*.py'
```

## Original review sources

**Six previously exposed, Phase143 developmental sources** are retained verbatim as *short excerpt fixtures*, with their URLs and limitations, in `research/phase143_cross_category_sources.json`:

- Trusted Reviews, Hisense washing machine: https://www.trustedreviews.com/reviews/hisense-wf5s1045bw/
- Reviewed, Maytag washing machine: https://www.reviewed.com/laundry/content/maytag-mvw7232hw-top-load-washing-machine-review
- Reviewed, Bosch dishwasher: https://www.reviewed.com/dishwashers/content/bosch-800-series-shp78cm5n-dishwasher-review
- HouseFresh, Philips purifier: https://housefresh.com/philips-3200-review/
- SoundGuys, Belkin headphones: https://www.soundguys.com/belkin-soundform-isolate-review-135156/
- Notebookcheck, Lenovo laptop: https://www.notebookcheck.net/More-than-24-hrs-battery-life-for-less-than-1-000-Lenovo-ThinkBook-16-G7-QOY-laptop-review.958162.0.html

**Additional original sources examined after the new extraction logic was written**, with only brief excerpts conserved in `research/phase144_postcode_challenge.json`:

- RTINGS, Samsung The Frame 2026: https://www.rtings.com/tv/reviews/samsung/the-frame-2026
- TechRadar, Meaco 12L Low Energy Dehumidifier: https://www.techradar.com/home/air-quality/meaco-12le-low-energy-dehumidifier-review
- Trusted Reviews, Nespresso Vertuo Lattissima: https://www.trustedreviews.com/reviews/nespresso-vertuo-lattissima/

No whole third-party article is included in the release and this report does not establish a license to redistribute one.

## Next development priority

Broaden **dimensional parsing** using standards-backed quantity/unit representations rather than an expanding list of brand-specific regexes, then test on a newly assembled and genuinely untouched multi-category original-document set. Extend source-span/protocol attachment, explicit comparison subject linking and document-level reference resolution. Freeze independent annotations *before* tuning and report selective precision, candidate recall and wrong-entity attribution separately. Only scientifically reviewed source receipts may reach the existing PEE knowledge and ranking pipeline.
