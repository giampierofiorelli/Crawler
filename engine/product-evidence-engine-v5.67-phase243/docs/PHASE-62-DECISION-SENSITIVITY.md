# Phase 62 — Robustness of Evidence-Based Product Decisions
**Date:** 10 October 2026  
**Status:** Research implementation, fictional data only; not validated or deployable.  
**Code:** `src/decision_robustness.ts`, `tests/decision_robustness.test.ts`, `tests/robustness_fixtures.ts`.

## Evidence-based conclusion

A product ranking that is plausible for one set of priorities or one set of tests
is **not necessarily robust** if a user changes what matters, a source is withdrawn,
or important evidence is missing. Formal multi-criteria decision analysis (MCDA)
recommends explicit sensitivity analysis rather than presenting point outputs as
unconditional conclusions. The core scientific sources are *methodological
inspiration*: they study decision analysis largely in health and operations
research, **not direct empirical validation of this consumer recommendation engine**.

There is no empirical data in this project sufficient to estimate distributions
of preference weights, real-world product performance, reviewer error or
publisher source availability. Therefore, **we must NOT estimate probabilities
of a product being best**. We implement only an auditable, deterministic
scenario test (a subset of sensitivity analysis). Any interpretation of the
result beyond those enumerated scenarios would be unsupported.

## Scientific sources: what they support and what they do not

1. **ISPOR MCDA Good Practices, Report 1**, Thokala et al., *Value in Health*,
   2016. Establishes explicit criteria, trade-offs and structured MCDA.
   Does **not** specify a universal consumer-electronics quality score.
   https://www.ispor.org/heor-resources/good-practices/article/multiple-criteria-decision-analysis-for-health-care-decision-making---an-introduction
2. **ISPOR MCDA Good Practices, Report 2**, Marsh et al., *Value in Health*,
   2016. Covers validation, implementation and analysis of uncertain scores,
   weights and heterogeneity. Not a certified product ranking method.
   https://www.ispor.org/heor-resources/good-practices/article/multiple-criteria-decision-analysis-for-health-care-decision-making---emerging-good-practices
3. **Sensitivity Analysis Approaches in MCDA: A Systematic Review**,
   *Applied Soft Computing*, vol. 148 (2023), article 110915. Describes
   sensitivity analysis as fundamental for inspecting ranking stability
   and how changing assumptions can change preferred options. It does not
   justify choosing arbitrary perturbation ranges.
   https://www.sciencedirect.com/science/article/pii/S156849462300933X
4. **Tervonen & Lahdelma (2007), Implementing SMAA**, *European Journal of
   Operational Research* 178(2), pp. 500–513. Models uncertain or missing
   criterion measurements and preferences using specified distributions,
   with Monte Carlo computation. **We do not implement SMAA because we
   lack empirically justified distributions.**
   https://research.aalto.fi/en/publications/implementing-stochastic-multicriteria-acceptability-analysis/
5. **ISPOR-SMDM Uncertainty Analysis**, Briggs et al., *Value in Health*,
   2012. Separates parameter uncertainty, heterogeneity and structural
   uncertainty; advocates uncertainty reporting and sensitivity analysis.
   No inference about the reliability of consumer reviews follows automatically.
   https://www.ispor.org/heor-resources/good-practices/article/model-parameter-estimation-and-uncertainty-analysis
6. **ISPOR Modeling Principles**, Weinstein et al., 2003. States that outputs
   should disclose assumptions and remain conditional, and not be black boxes.
   https://pubmed.ncbi.nlm.nih.gov/12535234/
7. **ISPOR Quantitative Benefit-Risk Task Force**, *Value in Health*, 2023.
   Recommends avoiding double counting, examining attribute dependencies,
   and conducting sensitivity analysis; transfer to consumer products is an
   engineering adaptation that still needs validation.
   https://www.sciencedirect.com/science/article/pii/S1098301522047805
8. **NIST on measurement uncertainty**, Kacker (2000). Measurement
   uncertainty is not interchangeable with consumer preference or decision
   confidence. Reported expanded intervals from labs are interpreted by the
   upstream Phase 58 module, not used to synthesize invented p-values.
   https://www.nist.gov/publications/interpretation-guide-expression-uncertainty-measurement

## Exactly what Phase 62 implements

- **Input:** a complete, separately audited Phase 61 scenario with confirmed
  needs, exact variants, documentary function-to-test mappings and
  source-reported uncertainty. All source data in the included example is
  **fictional** and all editorial/rights attestations are unverified.
- **Baseline:** compute a pairwise *descriptive* functional-suitability
  assessment; never infer an overall winner.
- **Preference counterfactual:** a documented alternative priority changes
  the needs input. Either it is *attested as user-confirmed* by the caller,
  or clearly labeled an *analyst-only stress test* and NOT impersonated as
  a real user preference. No speculative percentage of users is assigned.
- **Withhold original test:** remove all records belonging to an explicitly
  identified original test, and remove its associated uncertainties. Re-run
  the Phase 61 validator and bridge. The resulting source fingerprint is
  marked as **derived counterfactual**, not an authentic publisher export.
- **Change analysis:** compare mandatory-task concerns, unresolved essential
  requirements, missing admissible evidence and criterion-specific possible
  advantages. Report only changed fields and tested scenarios.
- **Zero numerical confidence:** no scores, probability of superiority,
  imputed measurement, default weight perturbation, randomized scenario or
  overall winner. A `no_change_in_tested_scenarios` result **does not mean
  the product recommendation is robust**; it speaks only about those tests.
- **Commercial quarantine:** Amazon, affiliate commissions, price feeds,
  marketing claims or retailer availability cannot enter the input graph.

## Fictional demonstration

The sample has two imaginary headsets, fictional original laboratory
measurements and two competing task advantages. On the baseline, one variant
has a structural mismatch for an essential connection requirement;
therefore that concern cannot be compensated by an advantage in microphone
measurements. Withholding one original battery test changes the set of
supported task-level signals and reveals missing battery evidence. Making
microphone intelligibility an essential criterion creates a new potential
mandatory uncertainty or concern. The output is a **map of decision
sensitivity and missing data, not a ranking**.

Commands:

```bash
npm test
npm run test:primary
npm run test:ingestion
npm run test:launch
npm run test:release
npm run build && node scripts/demo-phase62.mjs
```

## Non-assumptive roadmap / gates before any public recommendation

1. Obtain **real** original test data with verified commercial-use rights;
   confirm exact variants, methods, provenance and licensable fields.
2. Measure inter-rater agreement for original test interpretation and
   evaluate duplicated/syndicated results; do not assert source independence
   from publisher names alone.
3. Define candidate **decision-critical** measurements from user research
   and real usability studies, rather than from analyst intuition.
4. Elicit actual user thresholds and preference revisions; explore
   context-specific materiality only where there is a validated basis.
5. If empirical repeatability distributions and user preference uncertainty
   become available, evaluate formal SMAA/MCDA probabilistic analysis with
   appropriate predeclared model, sensitivity checks and independent review.
6. Test against blinded expert assessments and live user decisions, with
   prespecified error/acceptance criteria; no claim of superior decisions
   before validation.
7. Audit source and data licensing and actual Amazon-link presentation
   separately; do not interpret the current test suite as legal approval.

## What remains unresolved

There is no authenticated professional test feed, no validated cross-category
utility mapping, no real-user preference distribution, no calibrated
practical-importance threshold, no verified rights to use a third-party
publisher's underlying records and no measured improvement in users' choices.
The code does not guess these missing facts.
