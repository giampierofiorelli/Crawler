# Product Evidence Engine — Phase 100
## Decision-relevant preference questions, exact restricted swing-weight robustness and reviewed qualitative evidence

**Research and implementation:** 11 October 2026  
**Cumulative source:** `product-evidence-engine-v4.23-phase99.zip` (v4.23, Phase 99)  
**New research build:** v4.24, Phase 100  
**Status:** Integrated research component; **not** a consumer-validated ranking algorithm, an implementation of full MACBETH/UTA-GMS, or a public recommendation release.

## Executive verdict

Phase 99 already connects source-anchored observations from original independent professional tests to independently adjudicated performance levels and user-specific value scales. The outstanding problem was how to handle **uncertain preferences**, especially when a negative qualitative observation could be compensated by a sufficiently important positive outcome, without making up numerical sentiment scores or asking a long fixed questionnaire.

Phase 100 adds a bounded, deterministic preference-analysis module on top of an **actual Phase 99 evaluation**. It examines **all non-negative normalized swing-weight vectors compatible with independently confirmed ordinal comparisons** (for two to five reviewed criteria). It computes lower and upper bounds on the difference between two products and only offers **one** additional question when a comparison between two whole-criterion improvements is capable of tightening that uncertainty envelope. If new evidence is missing or a genuine hard requirement is unresolved/failed, it asks **no preference question**; obtaining relevant original evidence or handling the nonnegotiable is the priority.

The result is a **restricted exact linear-polytope analysis**, not an estimated probability that a product is best. Reviewers' qualitative adjectives never become arbitrary numerical scores. Values are always inherited from *separately reviewed* Phase 98–99 category-specific scales. No LLM or external service is involved in the repeated decision calculation. The established product-acquisition and professional-original-test-source rules remain unchanged.

### Source → interpretation → user value separation

1. **Observed evidence (Phase 95/96):** source URL, original test identity, exact model, context, method, source digest, paraphrased proposition and review status.
2. **Independent adjudication (Phase 99):** a different assessor maps the complete set of relevant reviewed findings to one performance level, with a possible interval. Conflicts are preserved; repeated publication does not multiply evidence.
3. **Reviewed user-value scale (Phase 98):** anchored 0–100 levels reflect elicited valuations of *performance outcomes*, not editorial sentiment. A rating from a reviewer is never treated as the value scale.
4. **Explicit preferences (Phase 100):** compare improvements from the reviewed worst to best level of each criterion. Confirmed comparisons constrain otherwise uncertain **swing weights**.
5. **Conditional decision:** compute which product dominates for every compatible weight model and every admissible criterion-performance interval. A documented ordinary drawback contributes negatively but can be offset; only an independently supported failure of an explicitly non-negotiable user requirement is an exclusion.

## What expert evidence supports

| Authority | What is established by that source | What our code actually implements |
|---|---|---|
| UK Government Analysis Function, 2024, MCDA supplementary guidance | The value of the swing from worst to best determines the relevant comparative weight; mixing performance scales directly or simply asking which attribute sounds important is not correct. Sensitivity analysis is fundamental. | Every preference question identifies the two *full criterion swings* and uses reviewed anchor descriptions. The code does not invent absolute numeric weights from answers. |
| Bana e Costa & Chagas, 2004; Bana e Costa & Vansnick, 1994, MACBETH | Quantitative value models can be constructed from consistency-checked verbal pairwise **differences of attractiveness**, using appropriate mathematical programming. | A lightweight **ordinal inequality-only** mechanism for swings. We do **not** derive the cardinal scales from the answers, implement MACBETH's qualitative-intensity categories or claim MACBETH calibration. |
| Greco, Mousseau & Słowiński, 2008, UTA-GMS; Kadziński et al., robust ordinal regression | Necessary preferences hold for **all** compatible value functions; possible preferences hold for **some**. | Exactly enumerate the vertices of a **restricted normalized swing-weight polytope** for the *already reviewed additive criterion scales* and evaluate worst-case differences. Not full UTA-GMS, which also admits unknown criterion value functions. |
| Braziunas/Boutilier lineage; Vayanos et al., 2020, Robust Active Preference Elicitation | Sequential questions may concentrate on decision-relevant uncertainty, often under set-based uncertainty or regret criteria. | A deterministic one-question proposal that maximizes the **sum of reductions in two answer-conditional score-difference interval widths**, excluding redundant and unhelpful pairs. No claims of optimality, learnt preference distributions or proven minimum user burden. |
| Adaptive Choice-Based Conjoint research (Cunningham, Deal & Chen, 2010; studies of respondents) | Large fixed full-profile tasks can overload people; tailoring choice tasks to preferences can be helpful but is not universally better in all contexts. | Limit the screen to a single grounded, optional question. No user field study or measurement of real question burden has occurred. |

### Mathematical contract

Let \(v_{A,i}\in[\ell_{A,i},u_{A,i}]\) and \(v_{B,i}\in[\ell_{B,i},u_{B,i}]\) denote reviewed criterion-specific value intervals inferred from the already adjudicated original evidence; their endpoints are **not probabilities**. Allow a weight vector

\[W=\{w:\ w_i\ge0,\ \sum_i w_i=1,\ w_a\ge w_b\text{ for confirmed swing comparisons},\ w_a=w_b\text{ when explicitly declared equal}\}.\]

Answers indicating a strict preference are checked for **strict feasibility**; they constrain the closed polytope using \(w_a\ge w_b\) because no meaningful numerical minimum difference is known. This includes arbitrarily close positive differences in the bound calculation without inventing a margin. The exact restricted worst/best differences are

\[D_{\min}=\min_{w\in W}\sum_iw_i(\ell_{A,i}-u_{B,i}),\qquad D_{\max}=\max_{w\in W}\sum_iw_i(u_{A,i}-\ell_{B,i}).\]

For an additive linear objective over this bounded polytope, extrema occur at vertices. The implementation enumerates those vertices with Gaussian elimination and feasibility checks, within an enforced 2–5 criteria / 14 question limit. It does **not** rely on random Monte Carlo or a guessed representative weighting. Five-decimal rounding inherited from Phase 98 is conservatively expanded by a small explicit engineering tolerance; close comparisons must remain unresolved rather than declared winners.

- If \(D_{\min}>0\) beyond the documented numerical tolerance, A is **necessary** in this restricted model; likewise if \(D_{\max}<0\), B is necessary.
- Otherwise the output is **underdetermined**. The numeric interval describes compatible values, not statistical confidence.
- Before evaluating, source evidence gaps, relevant unadjudicated findings and unresolved/failed *explicit* non-negotiables take precedence. The module has no authority to relax a veto.
- The order recorded in Phase 99 for one confirmed *point* weight profile remains valid **under that profile**. Phase 100 only widens the preference analysis after a **separate explicit authorization to explore preferences**. An unresolved wider analysis does not retroactively invalidate a user's previously confirmed preference profile.

### Selecting a question

For each unasked pair of reviewed criteria, hypothetically condition on either full swing being more important. Reject pairs where either strict answer is inconsistent with preferences already provided. Evaluate the intervals after the two possible responses and choose a pair that reduces the aggregate answer-conditioned interval widths; this is **only a deterministic elicitation heuristic**, not a prediction of user answers, a probability-weighted expected information gain or a proof of minimum questions. The user may also answer that the improvements matter equally. At most **one** next question is returned. Suppress it completely if the current rank is already necessary, no useful question exists, evidence is missing, or a hard requirement blocks ordinary comparison.

## Code delivered

- `src/phase100_adaptive_preference_envelope.ts`: exact restricted feasible-weight envelope, provenance-aware Phase 99 handoff, source-gap/hard-need priority, confirmed pairwise judgments, strict-sign contradiction detection, optional single swing-comparison prompt, no LLM.
- `tests/phase100_adaptive_preference_envelope.test.ts`: genuine Phase 96 → 99 → 100 composition with *synthetic original-test records*, known trade-offs, interval robustness, missing data, explicit hard veto, unconfirmed/redundant/conflicting answers, exact review-scale invariants, and an example of necessary first or second product.
- `package.json`: v4.24.0 and `npm run test:phase100`.
- `README.md`: cumulative phase reference; previous Phases 49–99 retained.
- `audit/phase100/`: completed test outputs and integrity/continuity manifest.

### A worked constructed example

In the controlled headphone tests, hypothetical product A has a comfort problem but stronger sound and noise-control performance than B. On the already reviewed Phase 99 *specific* weights A wins conditionally **85 vs 76**. If Phase 100 intentionally explores *every* compatible swing weighting before asking additional questions, the relative-value interval straddles zero: **do not claim A universally wins**. Giving comfort priority over both competing swings supports B in this constructed setting. Another reviewed evidence profile, in which A performs substantially better across every dimension, can support A under every admissible weighting. The module never treats the comfort problem as an automatic exclusion unless an independently proved, explicitly non-negotiable requirement fails.

No product performance in this example is a statement about any actual retail headphone. The percentages and scale values are invented *controlled test assumptions* in the previous Phase 99 test fixture.

## Verification and strict limits

The code and full cumulative repository compile under TypeScript NodeNext. Regression suite counts and checksum evidence are in the separate phase-100 release manifest and log files. Test inputs are constructed and no empirical accuracy, consistency of actual user elicitation, real-publisher rights, real evaluator identity or production throughput has been validated. Phase 100 does not silently call an LLM or introduce a scraping provider.

**Do not call this completed product calibration.** Outstanding tasks:

1. **Human preference study:** representative people must compare actual use-case improvement swings; measure test/retest stability, fatigue, comprehension, question count, conflict rate and actual purchase-choice consistency. Compare with a short baseline interface, not just internal simulations.
2. **Anchored criterion value functions:** independent assessment and calibration for key product categories; expert methodology must establish the meaningful scale ranges from actual observed product performance. The current code consumes these scales but does not learn them from source adjectives.
3. **Original-review empirical annotation:** a legitimate corpus of original professional reviews with independent labels for specific positive/negative claims, conditions, variant identities and reconciled performance levels. Evaluate false positives, missed dealbreakers, source disagreement and transfer to unseen publishers.
4. **Full optimization comparison:** evaluate implementing true MACBETH or UTA-GMS/robust ordinal regression via a validated solver, or retaining the simpler system if it suffices empirically. Test preferential independence and interactions between criteria before trusting an additive model.
5. **Operational integration:** authenticate user preference confirmations and independent adjudications, persist decisions safely, and introduce a publication gate backed by measured evidence. Until then `rankingEligible=false`, `publicationReady=false`.

## Exact verifiable technical and research references

1. UK Government Analysis Function (2024), *Use of Multi-Criteria Decision Analysis in options appraisal of economic cases*. https://www.gov.uk/government/publications/green-book-supplementary-guidance-use-of-multi-criteria-decision-analysis/use-of-multi-criteria-decision-analysis-in-options-appraisal-of-economic-cases
2. UK Government, *Multi-criteria analysis: a manual*, methods and swing-weighting. https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/7612/1132618.pdf
3. Bana e Costa, C. A. & Chagas, M. P. (2004), *A career choice problem: An example of how to use MACBETH to build a quantitative value model based on qualitative value judgments*, European Journal of Operational Research 153(2). https://doi.org/10.1016/S0377-2217(03)00155-3
4. Bana e Costa, C. A. & Vansnick, J.-C. (1994), *MACBETH — An Interactive Path Towards the Construction of Cardinal Value Functions*, International Transactions in Operational Research 1(4). https://doi.org/10.1111/j.1475-3995.1994.00325.x
5. Bana e Costa, De Corte & Vansnick (2011), *MACBETH*, Wiley Encyclopedia of Operations Research and Management Science. https://doi.org/10.1002/9780470400531.eorms0970
6. Greco, S., Mousseau, V. & Słowiński, R. (2008), *Ordinal regression revisited: Multiple criteria ranking using a set of additive value functions*, European Journal of Operational Research 191(2). https://doi.org/10.1016/j.ejor.2007.08.013 (author-hosted paper: https://www.lamsade.dauphine.fr/mcda/biblio/PDF/GMS-EJOR2008.pdf)
7. *Robust ordinal regression in preference learning and ranking*, Machine Learning (2013). https://link.springer.com/article/10.1007/s10994-013-5365-4
8. Vayanos, P., Ye, Y., McElfresh, D., Dickerson, J. & Rice, E. (2020), *Robust Active Preference Elicitation*, research preprint and related work. https://arxiv.org/abs/2003.01899
9. *Interactive resolution of multiobjective combinatorial optimization problems by incremental elicitation of criteria weights* (2018), quantitative incremental preference-elicitation method. https://www.sciencedirect.com/science/article/pii/S2193943821000923
10. Cunningham, C. E., Deal, K. & Chen, Y. (2010), *Adaptive Choice-Based Conjoint Analysis*, The Patient, 3, 257–273. https://doi.org/10.2165/11537870-000000000-00000
11. Phase 99 cumulative technical research, included unchanged: [`PHASE99-QUALITATIVE-TO-TRADEOFF-RESEARCH.md`](PHASE99-QUALITATIVE-TO-TRADEOFF-RESEARCH.md).

**License reminder:** Publisher access conditions and rights review still apply upstream, but this phase is about preference reasoning, not crawling; review text is not acquired here and no rights prohibition is bypassed.
