# Product Evidence Engine — Phase 143: cross-category professional-review transfer pilot

**Date:** 2026-10-11  
**Release:** v4.67 / Phase 143 (additive to v4.66 / Phase 142)  
**Scope:** English-language original professional reviews, no new model or dependency, no ranking or canonical evidence writes.

## Executive finding

The user's request to broaden beyond vacuum cleaners, particularly to washing machines, exposed a real failure in the existing English candidate reader. In a **six-snippet, five-publisher, five-category diagnostic**, the unmodified Phase139 reader proposed one relation, but the subject was **“Heavy Duty”**, a washer cycle that the surface-form recognizer wrongly classified as a product name. It proposed no subject–relation pairs in the remaining five deliberately short excerpts. Phases140–142 made zero additional proposals for these six excerpts.

This is **not** an accuracy benchmark: the snippets were selected and examined by the developer, not independently annotated, and some deliberately omit the reviewed product's name. This is a transfer failure diagnostic, not evidence that the engine performs at a particular precision/recall level on complete unseen reviews. The low extraction count is partly expected from the reader's conservative policy requiring explicit product subjects.

A small, **category-neutral** Phase143 subject-identity screen now marks any relation whose subject is only inferred from typography as `unverified_surface_name_abstain`. It also keeps exact caller-supplied page aliases at `page_alias_candidate_only`; neither establishes external identity or claim validity. This catches the misleading “Heavy Duty” association without hard-coding washer cycles. All of these outputs remain non-authoritative.

## Sources and cross-category obstacles

These are original, editorially tested reviews found for this phase, not product specifications or customer star ratings. The six short diagnostic quotations (under 25 words each per page) are recorded with source URLs and provenance status in `research/phase143_cross_category_sources.json`. Five hosts do not overlap with the previously named Phase138/Phase140 experimental publishers, but this has **not** been proved a wholly source-disjoint holdout relative to every dataset used across the PEE project.

| Category | Publisher and original review | What it challenges |
| --- | --- | --- |
| Washing machine | [Trusted Reviews: Hisense WF5S1045BW](https://www.trustedreviews.com/reviews/hisense-wf5s1045bw/) | cost per cycle, mass/water retention, reviewer observation and implicit reference to reviewed model |
| Washing machine | [Reviewed: Maytag MVW7232HW](https://www.reviewed.com/laundry/content/maytag-mvw7232hw-top-load-washing-machine-review) | multiple named wash cycles, percentage of stains removed, product-vs-program identity |
| Dishwasher | [Reviewed: Bosch SHP78CM5N](https://www.reviewed.com/dishwashers/content/bosch-800-series-shp78cm5n-dishwasher-review) | several cycle names and corresponding cleaning percentages that must remain correctly aligned |
| Air purifier | [HouseFresh: Philips 3200](https://housefresh.com/philips-3200-review/) | fan speed, noise level in dBA, shorthand model naming, comparison with previous model |
| Headphones | [SoundGuys: Belkin SoundForm Isolate](https://www.soundguys.com/belkin-soundform-isolate-review-135156/) | manufacturer-claimed battery runtime versus independently measured runtime; ANC condition occurs outside short chosen snippet |
| Laptop | [Notebookcheck: Lenovo ThinkBook 16 G7 QOY](https://www.notebookcheck.net/More-than-24-hrs-battery-life-for-less-than-1-000-Lenovo-ThinkBook-16-G7-QOY-laptop-review.958162.0.html) | Wi-Fi battery test with stated screen brightness and lower-bound value, model variant |

Source verification: direct editorial page extraction was successful for Reviewed, HouseFresh, SoundGuys and Notebookcheck; for Trusted Reviews, indexed search retrieved the relevant page and passage, but direct page opening returned an error. Do not equate a search excerpt with a complete archived source snapshot. This pilot does not claim redistribution permissions for whole articles. Neither page titles nor user-provided aliases are independent product-identity authentication.

## Untuned old reader diagnostics

| Reader | Candidate output across six brief snippets |
| --- | ---: |
| Phase139 text mention/relation reader | 1 relation hypothesis on the Maytag quote; surface subject “Heavy Duty” was incorrect |
| Phase140 structural supplement | 0 supplementary proposals |
| Phase141 lexical supplement | 0 lexical proposals |
| Phase142 scope screen | 0 frames to screen |
| Phase143 subject-identity safety gate | 1 unverified-surface-name abstention; 0 facts promoted |

The one Phase139 proposal was **already quarantined**, not scientific evidence. The Phase143 adapter makes its identity failure explicit so downstream consumers cannot mistake the surface name for verified product identity. It does **not** solve the semantic recall failures. All counts are per six selected snippets, not a statistic about general product review coverage.

## Added files and reproducibility

- `research/phase143_cross_category_sources.json`: six source URLs, conservative short excerpts, categories, aliases supplied only as page hints, known phenomena and provenance limitations.
- `scripts/evaluate-phase143.mjs`: runs unchanged Phase139–142 behavior on the new snippets and then Phase143 identity screen; writes `PHASE143-CROSS-CATEGORY-BASELINE-DIAGNOSTIC.json`.
- `src/phase143_cross_domain_subject_guard.ts`: original TS subject-identity screen without new runtime dependencies.
- `tests/phase143_cross_domain_subject_guard.test.ts`: seven new authored cases including named programme confusion, untrusted page alias, digest integrity, output permissions and alias-order invariance.
- `scripts/phase143_regress.mjs`: TypeScript test suite excluding the two previously excluded Phase91/92 legacy files, with results in `PHASE143-REGRESSION-GROUPS.json`.

Reproduce within the repository's normal Node development environment:

```bash
npm run build
node --test dist/tests/phase143_cross_domain_subject_guard.test.js
node scripts/evaluate-phase143.mjs
node scripts/phase143_regress.mjs
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s primary_sources -t . -p 'test_*.py'
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s ingestion -p 'test_*.py'
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s tests-python -p 'test_phase133*.py'
```

Validation performed: **7/7 focused**, **1,727 passing TypeScript tests across 102 eligible files**, **77 Python tests** (47 + 21 + 9). No new runtime library, model weights, paid API, remote service, or canonical writes. The existing sources were preserved; prior compiled Python cache files regenerated by initial tests were restored from the parent archive.

## What must happen next

1. **Do not add washer-specific regular expressions** as the main solution. The main failure is role and referent disambiguation: product vs cycle vs feature vs test condition vs metric.
2. Build a complete-review reading track, with rights-reviewed original snapshots and continuous paragraph references, not only artificially isolated excerpts. Token offsets and model-variant provenance must survive segmentation.
3. Define category-neutral typed events such as `test_observation`, `manufacturer_claim`, `feature`, `test_setting`, `comparison`, `measurement`, `cycle_or_mode`; populate labels using independent annotation and preserve ambiguity.
4. Introduce a blind, publisher/source-disjoint **gold** benchmark frozen before further tuning. The six cases here are **now exposed to the developer** and must remain regression/diagnostic cases, not the unseen final test.
5. Compare native extraction against one optional offline neural model only if permitted weights and operational constraints pass a separate audit; existing GLiNER2, DeepKE, medSpaCy, Snorkel and TypeSafe technical studies remain references, not required runtime integrations.
6. Report candidate recall, wrongly merged entities, incorrectly assigned measures, abstention coverage, false positives, false negatives, latency and peak memory. Distinguish “no extracted fact” from “feature absent”.

**Source-knowledge policy:** no original publisher assertion automatically becomes canonical, no model ranking changes, and no evaluation figure is presented as independently validated accuracy.
