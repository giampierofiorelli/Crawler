# Phase 61 — Integrated contextual functional suitability

**10 October 2026 | Experimental decision module, not a release-ready recommender.**

## What was actually built

`src/contextual_functional_suitability.ts` composes existing modules rather than inventing a new universal weighted score:

1. `needs_discovery.ts`: task and context selected by the person, explicit/confirmed essential needs.
2. `technical_vs_independent.ts`: manufacturer technical fields distinct from independent findings, promotional fields rejected, exact-variant review mapping.
3. `lab_needs_bridge.ts`: original lab record → user task, matched measurement unit, protocol, variant and recorded conditions.
4. `lab_uncertainty.ts`: lab-reported expanded uncertainty tied to exact source record. Unknown uncertainty is never treated as zero.
5. **New Phase 61 integrator**: documented task thresholds, non-compensatory essential functions, provisional practical-difference screening, missing-evidence flags and context-dependent trade-offs.

Outputs are `needsConfirmed`, criterion-level screening for each of two exact variants, `nonCompensatoryFlags`, conditional `tradeoffs`, and explicit reasons for unknown outcomes. It always returns `publicationReady=false`, `rankingEligible=false`, `winnerId=null`, `overallProductScore=null`, and `statisticalConfidence=null`.

## Scientific justification, distinguished from original design choices

| Design feature | Evidence basis | What has NOT been validated |
|---|---|---|
| Task, user and context before comparing products | ISO 9241-11 covers effectiveness, efficiency and satisfaction in a specified context, including consumer products | An ISO-certified product-ranking algorithm does not follow automatically |
| Essential minimum functionality before extra advantages | MCDA good-practice guidance recommends explicit criteria and decision structure; Kano-type literature distinguishes asymmetric attribute effects | The *exact* mandatory constraints/thresholds for consumer products must be elicited/tested |
| Measured outcome distinct from nominal manufacturer's performance | Metrology guidance distinguishes measurements, measurement conditions and uncertainty | A result in one lab context may not predict an individual's real-world performance |
| Not every observed numeric difference matters | NIST's measurement uncertainty guidance, and MCDA need for meaningful preference/trade-off elicitation | Our provisional absolute-margin comparison is not a validated practical-importance metric |
| Transparent missing and conflicting evidence | Evidence quality and decision-uncertainty principles in GRADE/SMAA, transferred cautiously | No empirical calibration, no general-purpose confidence probability |
| Alternative advantage can coexist with a mandatory failure | Non-compensatory screening is an explicit **product-design choice** consistent with user-defined dealbreakers | Must measure whether such screening actually improves decisions |

**No fixed 70/30 specification-vs-review trust split** is introduced. Structural compatibility can be checked against an official technical attribute but remains `declared_match`, never `independently_verified`. A claimed nominal runtime cannot stand in for tested runtime. A source's editorial score is not converted into a laboratory measurement.

## What the prototype does when evaluating an actual task

Fictional example: an employee needs a work-headset with USB compatibility and >=16 hours of talk time; speech intelligibility in background noise is valuable but optional. There are two fictional headphones, A and B, with technical specification and controlled laboratory observations.

- **USB connectivity**: specification reports A compatible, B not compatible. The integrator flags B as a mandatory-functional mismatch. It does **not** claim this was independently verified.
- **Call runtime**: fictional lab point observations are 22 h (A) and 14 h (B), with fictional lab-reported expanded uncertainties of ±1 h each under the same method and conditions. With the user's own >=16 h requirement, the reported intervals fall entirely above/below that value. This is screening under stated assumptions, NOT a statistical or real-world guarantee.
- **Microphone speech intelligibility**: fictional lab point observations favour B, with a documented *illustrative* preference margin. The integrator preserves B's task-specific advantage without cancelling its USB requirement failure.
- **No global ranking**: the returned result is a transparent constraint and evidence audit; it deliberately does not declare a product winner.

All numerical data and references in the tests are **fictional**. A string such as `fictional_preference` is not an authenticated user assertion or scientifically validated threshold. Source rights and signatures have not been verified. Production ingestion must tie threshold/reference to authenticated evidence and prohibit fabricated approvals.

## Why the algorithm currently refuses an overall winner

Even a passing numerical gate can fail to transport to a real person and setting. An expanded uncertainty interval is not itself a statistical significance test, a true performance distribution, a guaranteed future range or a validated criterion for product superiority. Cross-category weight scales, inter-criterion dependence, practical significance, longitudinal reliability, accessibility and safety need further empirical and expert review.

The present prototype only assesses **two exact variants**, using independently reviewed task mappings. Task relevance/conditions and quality-control status of the original lab are as asserted in fixture data. It does **not** yet implement: owner-review bias correction, long-term failure likelihood, expert-calibrated utility functions, evidence-coverage fairness or robust rank probabilities. The `role='continuity'` is a label, not a longitudinal hazard model. No source authenticates the contract/copyright status automatically.

## Required next gates before consumer output

1. Obtain actual authorized data for 10–20 exact UK variants from original professional labs; reproduce links to original studies, test conditions, and rights chain.
2. Develop independently audited category/task measurement maps; identify which use cases need practical thresholds, how those thresholds are elicited, and when no threshold is defensible.
3. Assess transportability from lab to home context, bias and independence of professional/owner reviews, correlated attributes, uncertainty and repeatability.
4. Evaluate expert-predeclared situations, missing evidence, systematic failure modes, sensitivity to plausible user priorities and whether the recommended product changes robustly.
5. Compare against a baseline in tests with actual shoppers and measure task suitability, misrecommendations, comprehension, not merely satisfaction or affiliate conversion.
6. After legal and scientific review, implement a separately reviewed production engine. Never turn this experimental module on by toggling a deployment flag.

## Source links (readable / copyable)

- ISO 9241-11:2018 usability, consumer products and context: https://www.iso.org/standard/63500.html
- NIST definition of usability: https://csrc.nist.gov/glossary/term/usability
- ISPOR 2016 MCDA Introduction Report 1: https://www.ispor.org/heor-resources/good-practices/article/multiple-criteria-decision-analysis-for-health-care-decision-making---an-introduction
- ISPOR 2016 MCDA Emerging Good Practices Report 2: https://www.ispor.org/heor-resources/good-practices/article/multiple-criteria-decision-analysis-for-health-care-decision-making---emerging-good-practices
- NIST measurement and uncertainty: https://pml.nist.gov/cuu/Uncertainty/coverage.html
- NIST repeatability and reproducibility: https://www.nist.gov/publications/nistsematech-engineering-statistics-handbook-chapter-2-measurement-process
- Kano attributes/consumer quality exploratory empirical study: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0183888
- Stochastic Multicriteria Acceptability Analysis (SMAA): https://doi.org/10.1016/j.ejor.2005.12.037
- Cochrane Handbook, certainty of evidence: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14

These sources support *principles*, not the software's validation as a decision-making system. Most evidence was summarized in the earlier 10 October 2026 scientific research report. The present document records a technical implementation derived from that report, not a new systematic literature review.

## Commands executed

```bash
npm test
npm run test:launch
npm run test:release
python -m unittest discover -s primary_sources -t . -p 'test_*.py'
python -m unittest discover -s ingestion -p 'test_*.py'
```

All executable tests are synthetic and deterministic. A passing test verifies a programmed rule, not legal clearance or product quality.
