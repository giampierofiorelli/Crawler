# Phase 117 — Category-neutral goal outcome comparability
**11 October 2026 | v4.41 | Cumulative research prototype**

## Decision and motivation

The Phase116 user question, "Quale robot toglie le macchie meglio?", demonstrated a systematic risk: the engine might substitute *how quickly* a product achieves a result for *how well* it achieves that result. This is not peculiar to robotic floor cleaning. Dishwashers may finish with less soil but use more time; headphones can have an ANC feature without demonstrating better attenuation. Those examples illustrate the logical distinction; **this phase does not claim empirical findings about any specific product**.

Phase117 implements one reusable comparison procedure across categories instead of a growing collection of case-specific score substitutions. A **verified goal** is matched to an explicitly defined, independently measured endpoint in the Phase116 category function graph. The comparison's primary dimension must be stated separately: `outcome_effectiveness`, `time_efficiency`, `pass_efficiency` or `side_effect`. The engine must not promote an alternative dimension because it happens to contain available or favorable numbers.

## Implemented files

- `src/phase117_goal_outcome_comparison.ts`: pure, category-neutral evaluator with an immutable-input comparison API; category goal → `measured_by` endpoint binding; strict metric/protocol/test-context/horizon/threshold matching; revision-pinned candidate sets and data fingerprints; duplicate experiment de-duplication; deterministic ties and complete-list abstention; separate handling of uncertainty reported by the source.
- `reviewedObservationBridge116To117`: narrowly maps a Phase116 **independently measured** goal endpoint only when missing protocol, test setup, context, metric, unit, and horizon information are provided explicitly. It refuses features, qualitative observations, manufacturer numbers, absent protocol metadata, and incompatible units. **Caller-provided review metadata is not independently verified by this function.**
- `tests/phase117_goal_outcome_comparison.test.ts`: 24 constructed unit cases, including the robot-stain effectiveness/one-pass divergence, real category-model templates for dishwasher cleaning and headphone ANC measurements, test revisions and surfaces, missing data, syndication, disputes, uncertainty, category-specific side effects, and metamorphic input-order checks.
- `package.json`: test scripts for both Phase116 modules and Phase117, version v4.41.0.

## Evidence contract

A comparable experiment requires the same: category, goal, direct endpoint, **dimension**, measured metric, unit, sign/direction, independent laboratory, protocol revision, setup, context (including relevant surface, stain, noise profile, mode etc.), observation horizon and, for time/pass efficiency, target threshold. Reported intervals must be preserved and must not be silently treated as equivalent when they overlap or are missing for another candidate. When evidence is incomplete or conflicts, the full ordered comparison is withheld; the candidate's status and reason remain visible.

The complete source evidence is query neutral. `snapshotFingerprint` is calculated from source records and candidates, not the preferred outcome lens. Different verified questions select alternative **views** of the same evidence, not alternative records of what the products did. Verified intent and source-revision identifiers remain separate. Exact measurement ties are ties of the *reported values only*, not evidence of clinical or practical equivalence.

## Invariants and safety boundaries

1. **A mechanism is never a measured result.** Hot water, a roller, ANC hardware or a docking interval provides neither a score nor an automatic performance bonus.
2. **No comparability by name alone.** Similar labels like "stain score" cannot bridge two publishers. Different horizons, floors, soils, noise stimuli, thresholds, units and versions block direct ranking.
3. **No invented outcome at test time.** This code uses structured results only. Test fixture URLs at `example.org` and numeric outcomes are **synthetic**, not real product experiments. The repository's older source references are background for method design, not observational inputs to this module.
4. **No ranking via missingness.** One untested product does not become the weakest product; multiple original experiments require a reviewed synthesis policy, and a syndicated copy does not add another independent observation.
5. **No semantic self-verification.** `explicitly_verified_semantic_frame` is required from an external interpreter and independent adjudicator. Simply setting that string in a caller does not itself prove the user's intent. No arbitrary multilingual language competence is claimed.
6. **No unearned statistical claim.** Point-value ordering is descriptive, not a test of statistical superiority. Reported intervals are kept, and uncertainty blocks a full ordered list when needed. Differently defined intervals have not been statistically calibrated.

## Scientific and original publisher background (previously provided Phase116 material)

- NIST's product/function modeling: https://www.nist.gov/publications/core-product-model-representing-design-information
- ISO 9241-11 on measurable user outcomes in context: https://www.iso.org/standard/63500.html
- RTINGS *Robot Vacuum Test Bench 1.1* discusses pass-by-pass observations, streaking and residual water: https://www.rtings.com/robot-vacuum/tests/changelogs/1-1
- Vacuum Wars explains speed-weighted stain metrics: https://vacuumwars.com/stain-scores-and-streaks-how-we-developed-a-better-mopping-test/
- Original methodological limitations: [`PHASE116-STAIN-OUTCOME-VS-EFFICIENCY-RESEARCH.md`](PHASE116-STAIN-OUTCOME-VS-EFFICIENCY-RESEARCH.md)

These references support why endpoints and protocols must be distinguished; they **do not validate a market-wide ranking** or demonstrate accuracy of Phase117 on extracted real product data. The Phase116 notes identify IEC/ASTM 62885-6:2023 as excluding robotic wet hard-floor cleaning appliances, so it cannot validate this category's robot testing.

## Remaining work

- Collect and independently verify original measured results for a common cohort, with complete contexts, revision, endpoints and intervals. Assess whether those data genuinely permit a same-method comparison; a result may legitimately be *not rankable*.
- Ground the verified-intent contract using independently labelled genuine user prompts, including negation, context changes, translations, paraphrases and unknown constraints. Current Phase116 bounded string patterns are **not** a production parser.
- Build human-reviewed original-source extraction into the Phase101/104/108 canonical evidence path, preserving measurement vectors, source permission, and change invalidation. Phase117 currently runs as a **companion**, not a mainline publication gate.
- Consider approved protocol bridges only when actual equivalence evidence supports them. They must not be inferred from similar metric labels.
- Define source-level uncertainty metadata beyond basic numerical intervals, including what the interval statistically represents and whether a comparison is warranted.

**Release scope:** cumulative source and tests delivered; no live local LLM, no real product ranking validation and no published recommendations.
