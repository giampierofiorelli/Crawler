# Product Evidence Engine — Phase 99
## From professional review statements to compensated, evidence-grounded personal trade-offs

**Date:** 11 October 2026  
**Baseline:** v4.22 / Phase 98; cumulative release **v4.23**  
**Status:** Code integrated in the *research-stage comparison path*; no public ranking change, no real-user calibration, no live review ingestion proved in this phase.

## 1. Decision and scope

The user's specific correction to Phases 61/97 remains binding: *a product weakness is normally a negative contribution to user value, not a veto*. The model must also allow a strength to compensate for an ordinary weakness. A veto needs an **explicitly confirmed non-negotiable user requirement** and independently supported, applicable failure. The existing Phase98 engine applies this distinction after performance evidence is mapped onto independently reviewed criterion levels and separately elicited swing weights.

Phase99 closes the concrete interface gap between the earlier original-review intake and that comparative model:

`Authorized original professional test → Phase96 quarantined proposition with source, exact variant, context and original-test identity → independently reviewed claim and method → separate adjudicator maps whole criterion outcome to an elicited level, with uncertainty and conflict explanation → Phase98 personal trade-offs → sensitivity across explicit user preference scenarios → conditional, explained comparison.`

Every numerical value continues to belong to a **documented user preference/value model** rather than being copied from editorial star scores or assigned by an LLM because it encounters words such as “excellent,” “disappointing” or “poor.” Values still require independent elicitation and calibration. This component does not perform automatic qualitative-to-cardinal conversion.

## 2. Why the method follows expert practice

| Expert source | Actual methodological contribution | Conservative translation into code |
|---|---|---|
| UK Government Analysis Function, MCDA supplementary guidance, 2024 | Qualitative and quantitative criteria can enter a structured choice model; local performance scales are distinct from *swing weights*, which must reflect the value of performance changes, not merely the names of features. | Preserve an evidence-to-performance mapping separately from user value scale and swing weights. Phase99 never derives weights from reviewer prose. |
| Bana e Costa, De Corte & Vansnick, MACBETH (2011) | Elicit a cardinal value model through coherent qualitative pairwise difference-of-attractiveness judgments. | Existing Phase98 accepts separately reviewed cardinal criterion levels; **Phase99 does not claim to implement the MACBETH optimization/elicitation algorithm**. |
| ISPOR MCDA Emerging Good Practices, report 2 (2016) | Transparent criteria, process design, uncertainty, implementation and evaluation, including precautions in drawing conclusions from a model. | Fail closed on unreviewed mappings, preserve uncertainty and review documentation; no authorization to publish rankings. ISPOR's health-care application does not validate consumer electronics results. |
| Kadziński et al., Robust ordinal regression (2013) | Necessary vs possible rankings over all preference models consistent with decision-maker judgments. | Evaluate **only** supplied reviewed preference scenarios, and refrain from declaring stability when they reverse. This is sensitivity testing, **not** complete robust ordinal regression. |
| Cochrane Handbook Chapter 21, qualitative evidence (2024 handbook) | Synthesized qualitative findings should account for context, limitations, relevance, adequacy and coherence; repeated reports are not automatically additional independent studies. | Keep exact use context and method, require separate approval, reconcile conflicting findings and retain original-test lineage. This is an analogy, not a formal application of GRADE-CERQual to commercial reviews. |

### Exact expert sources

1. UK Government Analysis Function, *Use of Multi-Criteria Decision Analysis in options appraisal*: https://www.gov.uk/government/publications/green-book-supplementary-guidance-use-of-multi-criteria-decision-analysis/use-of-multi-criteria-decision-analysis-in-options-appraisal-of-economic-cases
2. Bana e Costa, De Corte & Vansnick (2011), *MACBETH*: https://orbi.umons.ac.be/handle/20.500.12907/34054 ; DOI: https://doi.org/10.1002/9780470400531.eorms0970
3. ISPOR Task Force (2016), *MCDA Emerging Good Practices, Report 2*: https://www.ispor.org/heor-resources/good-practices/article/multiple-criteria-decision-analysis-for-health-care-decision-making---emerging-good-practices ; https://doi.org/10.1016/j.jval.2015.12.016
4. Kadziński, Greco & Słowiński (2013), *Robust ordinal regression in preference learning and ranking*: https://link.springer.com/article/10.1007/s10994-013-5365-4
5. Cochrane Handbook, Chapter 21, *Qualitative evidence*: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-21
6. Previously researched Phases 56, 59, 61, 63, 64, 96, 97 and 98 are cumulative method and code precedents contained in the repository. Their authorizations and empirical limitations remain unchanged.

## 3. Implemented source code

- **`src/phase99_qualitative_tradeoff_bridge.ts`**: new standalone compositional adapter; imports the actual `assessQualitativeNeeds` validator (Phase96) and `evaluateCompensatoryTradeoffs` model (Phase98).
- **`tests/phase99_qualitative_tradeoff_bridge.test.ts`**: constructed scenarios for contextual negatives, compensating strengths, model identity, source approvals, independent adjudication, contradictory findings, repeated passages, incomplete evidence, actual hard requirement, and sensitivity reversals.
- **`package.json`**: `4.23.0`, new `test:phase99` command; all prior scripts maintained.
- **`README.md`**: cumulative integration documentation.

### Main model inputs

1. **The original professional test**: a `QuarantinedQualitativeFinding` with exact model/variant, criterion, source URL, source-page digest, bounded paraphrased proposition, explicit use context and original-test ID.
2. **Independent statement approval**: the Phase96 reviewer receipt must verify semantic fidelity, described method and data adequacy. A review of source claims is not the same as rating the product.
3. **Separate performance adjudication**: one per product and criterion, identifying exactly which approved findings are considered, the reviewed performance level, optional plausible-level interval, a separate assessor, documentation and reconciliation when professional tests disagree.
4. **User values**: the Phase98 confirmed preference model, with anchored criterion scales and elicited swing weights, plus optionally independently reviewed alternative preference models.
5. **Hard requirements**: only explicitly recorded non-negotiables. Any asserted independent pass/failure must correspond to a known reviewed performance record for the same product and criterion. An authenticated production process and independent check that such a test truly proves the threshold remain future work.

### Output

- One Phase98 *research-only* trade-off result with contribution values per criterion and non-negotiable screening.
- Per-criterion signed first-minus-second contribution **intervals**, showing which candidate benefits and which is disadvantaged under the elicited scale. These are not statistical confidence intervals.
- Evidence traces: original-test IDs, URLs, proposition summaries and finding IDs; repeated sentences within one original test do not inflate weights.
- Pending source observations that have not been adjudicated. Relevant unreviewed negative evidence blocks a claimed robust conditional winner rather than disappearing.
- Scenarios of explicit reviewed preference models. The label `conditional_under_one_elicited_profile` is intentionally different from `robust_across_reviewed_scenarios`. **Neither label asserts mathematical robustness across all feasible preference weights**.
- `publicationReady=false` and `rankingEligible=false` always.

## 4. What worked in constructed software tests

A **fully fictional** demonstration compares headphone A and B with three independently elicited *assumed* criteria: comfort, sound and ANC. A suffers on comfort, but is stronger on sound and ANC. The previously constructed Phase98 preference weights and level values produce illustrative outcomes of **85 vs 76**, preserving the comfort drawback in the explanation without excluding A. Under a *different assumed preference scenario*, with comfort more important, B becomes preferred. The module therefore suppresses a supposedly robust winner across those two scenarios. No consumer preference study validates these numbers.

Additional controls reject mapping an observation to the wrong product, unverified/rejected original claims, duplicate mappings, attributing one passage to two distinct criteria, conflicting original-test findings with no reconciliation, unsupported claimed hard vetoes and context mismatch. Ambiguous or missing evidence is explicitly retained; a blank finding is never a zero product score.

## 5. Limits and priorities

**Still missing**:

- Genuine original-review HTML acquisition under the existing Phase69 access controls, with a fixed diverse source corpus and independently annotated benchmark. Phase99 itself made **zero live web crawling requests**.
- Authenticated review signatures/roles connected to Phase92–93 trust controls. Textual reviewer IDs and receipts can be forged in isolation.
- Independently validated mapping from professional text to concrete performance levels; proof that the ordinal levels and user-value scales capture meaningful preferences. Existing tests use entirely synthetic, author-constructed data.
- Effective preference elicitation from real users using swing comparison and/or properly implemented MACBETH, not fabricated default weights.
- Full preference-space robustness / robust ordinal regression; current module checks only supplied, reviewed preference scenarios.
- Diagnosis of non-additive criterion interactions, absent/outdated test reports, source conflict semantics, and cross-category generalizability.
- Integration with public recommendation ranking, which must remain unchanged until an evidence-based validation stage.

**Next sensible validation**: build an independently annotated set of authentic professional-review statements, independently adjudicate a small product×task comparison against actual user preference judgments, and measure decision reversals, omission of relevant adverse findings, false hard exclusions, reviewer agreement, evidence-mapping correctness, and calibration burden. Only then widen automatic review of repeated source templates or the LLM proposer; reviewer oversight must be proportionate to measured risk and error rates.

## 6. Exact reproducibility

```bash
npm install
npm run test:phase99
npm test
npm run test:companion
npm run test:primary
npm run test:ingestion
npm run test:phase84
npm run test:launch
npm run test:release
```

Verification results, version-to-version checksums and exact test execution status are included in `PHASE99-RELEASE-MANIFEST.json` and `audit/phase99/` within the ZIP. Unit-test green is not a validation of judgments made by people, a production model, or publisher acquisition rights.
