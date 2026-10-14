# Product Evidence Engine — Phase 189 technical report

**Date:** 12 October 2026  
**Canonical base:** PEE v5.12 / Phase188  
**Research-only result:** cross-category original-review *manual annotation* pilot and deterministic protocol/context reasoning; **not a reviewed product catalogue or user-facing scientific rank**.

## Executive decision

The four user-supplied codebases have important lessons, but copying their entire algorithms into the website now is **not justified**. The PEE currently needs stronger **evidence applicability** and **multi-criterion robustness tests**, not more uncalibrated model weights. Phase189 implements those two capabilities narrowly, without installing or copying the open-source repositories, and carries forward all original PEE source-trust gates unchanged.

A longer implementation would not itself demonstrate a more intelligent model. The comparative results must be measured on held-out expert originals and real English shopping intents before integrating any algorithm into the public ranking. Conversely, we should not underinvest in substantial future code where an unmet function has evidence of benefit.

## Verified public original-source pilot

Publicly readable original review pages checked on 12 October 2026; atomic facts were manually paraphrased in `evaluation/phase189/annotated-live-source-pilot.json`. **No full original document text, legally licensed corpus, publisher-source hash, or independent professional review approval** was imported. The pilot is explicitly `research_only_not_reviewed_or_admitted`. These are *analyst annotations of actual web sources*, not signed original source custody.

| Category | Original expert source | Exact model and verified source details | Risk evaluated |
|---|---|---|---|
| Vacuums | [RTINGS Dyson V15 Detect](https://www.rtings.com/vacuum/reviews/dyson/v15-detect) and [Shark Stratos Cordless IZ862H](https://www.rtings.com/vacuum/reviews/shark/stratos-cordless) | Vacuum methodology **v1.4** for both: maximum hose airflow **71.9 vs 59.2 CFM**; hard-floor noise **70.5 vs 74.2 dBA** | Performance dimensions distinct from emptying dust and under-furniture maneuverability; editorial summary dependent on same original review |
| Laptops | [Notebookcheck Lenovo ThinkBook 16 G7 QOY](https://www.notebookcheck.net/More-than-24-hrs-battery-life-for-less-than-1-000-Lenovo-ThinkBook-16-G7-QOY-laptop-review.958162.0.html) | Explicit reviewed configuration **21NH0005GE**; Wi-Fi v1.3 runtime **26h 54min** at 150 cd/m²; measured **297.9 cd/m²** on reviewed WUXGA panel | Do not generalize battery test to gaming, another panel, or other Snapdragon variant; ARM software observations require user-specific checks |
| Headphones | [SoundGuys Bose Headphones 700](https://www.soundguys.com/product/bose-headphones-700/) | ANC-on attenuation chart shows **19.5 dB at 410 Hz**; editorial review includes praise for overall ANC and notes non-folding design | A point on a frequency curve does not certify broadband ANC or suitability for all aircraft noise; editorial praise not independent measurement |

Methodology original links: [RTINGS How We Test Vacuums](https://www.rtings.com/vacuum/learn/how-we-test); [SoundGuys How We Test](https://www.soundguys.com/how-we-test/). Notebookcheck reports a borrowed review sample supplied by the manufacturer or a retailer but states the lender could not influence the review; source procurement policies are another property to record, not a binary dismissal.

### Test design and results

- **Four source webpages, three categories, four exact reviewed product variants, fourteen manually annotated observations.**
- **32 tests** including grounded measured examples plus deliberately synthetic adversarial mutations of the annotations (forged cross-product derivative, contradictory measurements, source metadata changes, absent field, wrong scope, cycles, editorial copy, material protocol/condition changes and candidate-set insertion).
- Demonstration: six manually authored *hypothetical* requirements. The research-only system marks Dyson's 70.5 dBA `observed_threshold_met` for a **hypothetical** 72 dBA maximum and Shark 74.2 dBA `observed_threshold_missed`; Lenovo's 26.9 h Wi-Fi benchmark meets **hypothetical** 24 h in that test but cannot establish gaming endurance; Bose 19.5 dB at 410 Hz meets **hypothetical** 18 dB at precisely that frequency but cannot establish cabin-wide isolation. These cutoffs are test inputs **not scientific product recommendations, independently validated usage thresholds or real user requirements**.
- Strict pairwise Pareto relation on **two comparable RTINGS measurements**: V15 measured higher hose airflow and lower bare-floor noise than Shark. Only these two reviewed dimensions are compared, without any overall best assertion; additional or missing dimensions correctly make a richer comparison incomparable.
- Results saved: `evaluation/phase189/research-pilot-results.json`; reproducer `node scripts/phase189_demo.mjs` after build.

**Important limitation:** These results test engineering guards on an author-created corpus. The study is *not blinded*, the annotator and implementer are not independent, original source document hashes are not available, and no statistical superiority over a baseline is established. Claiming that Phase189 is more accurate for shopping choices would be unwarranted. The production signed ranking (Phase181/187) has not been activated by this corpus.

## Implemented engineering changes

`src/phase189_source_pilot_reasoning.ts`: small original TS research-only comparator with explicit eligibility gates for exact category/product/field, protocol, test conditions and unit; distinct qualitative/contextual signals, derivative provenance DAG and dependency grouping; controlled `not_established`, `conflicting_originals`, numeric match/miss (under hypothetical inputs), `context_observed_only` outputs. It always sets `rankingAllowed:false`, `independentSourceRightsVerified:false`. Uncertain fields remain unknown, never scored as failure.

`auditStrictPareto189` implements a limited, candidate-set-independent Pareto relation with all compared original numeric fields present and exactly matched. It does *not* implement TOPSIS, ELECTRE, rank weights, heuristic confidence, GRADE scoring or category-wide multiobjective product ranking. This is a deliberately conservative small reuse of the methodological insight from Scikit-Criteria.

## More-code decision: the four uploaded repos

| Source-code resource | Evidence from previously completed source audit | Phase189 conclusion |
|---|---|---|
| **Carneades 4 (MPL-2.0)** | Typed statements, presumptions/exceptions, arguments, issues and proof standards | Phase188 already incorporates a bounded provenance/argument explanation. Next gain: explicit, tested exception rules and validity under changed usage contexts, not copied legal weighing thresholds. |
| **Scikit-Criteria (BSD-3)** | Pairwise dominance and rank-invariance checks; other methods normalize or weigh criteria | Phase189 includes original strict Pareto check. Future: compare ranking stability across review-authorized preference ranges, using source-calibrated uncertainties; do not install full Python runtime merely to claim sophistication. |
| **ASReview (Apache-2.0)** | Active learning source screening, Max/Uncertainty/Hybrid strategies | Potentially very valuable for the **Phase182/179 source screening queue** after a real corpus, representative human labels, recall evaluation and safe stopping criterion exist. Not a claim-verifier or evidence authority. |
| **pgmpy (MIT)** | Bayesian graphical modeling, prior estimators and exact inference | Highly expressive but empirically unsupported for claim reliability absent calibrated likelihoods, dependence studies and hold-out tests. Defer. |

Technical prior audit with source files: `PEE-PHASE188-FOUR-REPOSITORIES-SOURCE-AUDIT-2026-10-12.md`.

## Next phase priorities

1. Build a licensed, reviewed original-source benchmark with sources from **two genuinely independent labs** for an exactly matched product variant and protocol; include contradictory tests, original methods and error bars.
2. Independent annotation of unseen authentic English shopper questions, hard constraints and importance ranges, plus blind comparison with existing Phase181/187/188 outputs. Prefer actual correctness, provenance and omission metrics over total test count or subjective enthusiasm.
3. Extend the Phase182 existing source queue with an ASReview-inspired relevance experiment **offline**. Only adopt additional dependencies if benchmark gains justify cost, deployment, license and maintenance.
4. Evaluate exception graphs and robust optimization under preference uncertainty. Avoid every field becoming a universal scalar weight.
5. No third-party source permission or original review bytes needed **for this proof-of-concept**; request narrowly identified accessible originals when required for the authorized product catalogue.

## Integration and preservation

All core Phase188 files should remain byte-identical except the npm version/package scripts, new source/tests/docs/data and continuity report. The production runtime remains untouched. Historical Phase91/92 regressions remain quarantined; clean ZIP extraction and full eligible TS/Python tests required before release.
