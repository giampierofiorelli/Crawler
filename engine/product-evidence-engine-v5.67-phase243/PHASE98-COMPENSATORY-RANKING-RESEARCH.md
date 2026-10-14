# Product Evidence Engine — Phase 98
## Evidence-backed correction: comparative trade-offs, qualitative drawbacks and personalized value modelling

**Date:** 11 October 2026  
**Codebase:** cumulative v4.22 experimental research extension of v4.21 / Phase 97  
**Status:** New research-only TypeScript prototype and controlled tests. **Not** a consumer-calibrated ranking algorithm, an autonomous mapping from prose to numbers, or a release ranking change.

## 1. Decision and correction of the Phase 97 assumption

The user has identified a substantive conceptual defect. Phase97 treats an independently supported failure of a confirmed **essential** need as a potential non-compensatory exclusion. It is useful for genuine hard requirements, but **essential/important/optional are priority descriptors, not automatically hard/soft acceptability decisions**. An important drawback often deserves a preference penalty rather than a veto, and may rationally be outweighed by other important benefits. This is exactly the point of *compensatory* MCDA. The hard gate must be narrow, explicitly user-confirmed, independently supported, and context-specific. Ordinary strengths and weaknesses should enter the **same calibrated, criterion-level value model**.

Corrected decision structure:

1. Interpret user purpose, context, task and minimum acceptability separately from preferences and trade-offs.
2. Determine whether there is a **true** hard incompatibility (verified failure of an explicitly non-negotiable, relevant outcome); otherwise preserve the candidate.
3. Translate observed original-professional-test measures and qualitative observations into **reviewed performance levels** on meaningful category/task-specific criteria. Numeric measurements and prose enter this common performance assessment, with distinct provenance.
4. Elicit the user's **value of changes in performance**, not the source publisher's stars or the emotional valence of a sentence. Use coherent cardinal component value functions when possible.
5. Derive user-specific **swing weights** on the range that actually distinguishes candidates; weight names alone do not establish the right numbers.
6. Aggregate only when additive independence is defensible; otherwise consider outranking, explicit interactions or pairwise qualitative preference. Show uncertainty and missing evidence separately.
7. Rank *eligible* products conditionally when the evidence supports it; show major drawbacks, comparative benefits and sensitivity. Never publish an unvalidated 'best' product.

**Priority rule:** `essential` is not synonymous with `hard veto`. An essential criterion can matter greatly in the trade-off unless the user declares a minimum bound that must hold. A reviewer cannot unilaterally convert 'important to this person' into 'absolutely unacceptable'.

## 2. Research findings and exact sources

| Research | What it actually supports | Consequence for the engine |
|---|---|---|
| UK Government Analysis Function, *Introductory Guide to MCDA*, 1 May 2024 | Compensatory value model combines criterion values and swing weights; performance and preference must be distinct; simple weights from criterion labels are invalid; additive form requires mutual preferential independence; sensitivity analyses are needed. | Use calibrated criterion-level value functions, explicit swing weighting and uncertainty; don't give generic 'comfort = 20 points' by decree. |
| HM Treasury, *Green Book 2026* | Warns against 'simple weighting and scoring' without objective methodological basis; recommends structured MCDA for applicable complex trade-offs. | No invented 0–100 scores that just hide an LLM judgment. |
| HM Treasury/Department for Energy Security and Net Zero, MCDA supplementary guidance (HTML) | Explicitly mentions mixing qualitative and quantitative performance, pairwise ratings, trade-off sensitivity, concern about overlapping/interdependent criteria. | Both numerical lab results and reviewed prose can influence preference value. |
| Bana e Costa & Vansnick, MACBETH (1994); Bana e Costa et al. (2011) | Builds coherent cardinal values from verbal pairwise *difference in attractiveness* comparisons, with consistency checking and mathematical procedures. | User/reviewer can answer structured comparison questions without directly inventing numbers; don't claim our short prototype implements MACBETH. |
| García-Lapresta & González del Pozo (2019), EJOR | Ordinal qualitative levels need not have equal psychological distances; arbitrary cardinalization can be meaningless. | 'Minor/moderate/severe' cannot automatically be mapped to 25/50/75. |
| Greco, Mousseau & Słowiński (2008); Kadziński et al. (2013) | Robust ordinal regression tests which rankings are necessary vs only possible across additive functions consistent with pairwise preferences. | Longer-term preference-learning approach: robust ranking under incomplete elicitation, not a single brittle weight vector. |
| Cinelli et al., taxonomy of MCDA methods (2020/2021) | Formal indifference, preference and veto thresholds; ELECTRE-type outranking allows noncompensatory constraints in specific cases. | Veto only for expressly confirmed hard requirements, not every negative finding. |
| Greco, Mousseau & Słowiński (2014), interacting criteria | Additive functions can misrepresent dependence or synergies; richer models address interactions. | Prevent double-counting and review comfort×fit, weight×portability, ANC×microphone interactions where context warrants. |
| ISPOR MCDA Good Practices Reports 1–2 (2016) | Structured criteria, preference elicitation, transparent uncertainty and validation; applied primarily to health decision settings. | Methodological transfer, not proof of superior consumer decisions. |
| ISPOR quantitative benefit-risk report (2023) | Warns against double-counting, inappropriate dependence assumptions, unexamined heterogeneity and uncertainty. | Track one original experiment once, avoid counting both a qualitative description and the same measurement as independent benefits. |
| Baymard, negative-review user-study | 53% of users in its own study sought negative reviews for one or more products. | Drawbacks must be visible and explained, but this does **not** imply twice the penalty, an exclusion rule or a validated ranking weight. |

### Verifiable references (direct URLs)

1. UK Government Analysis Function, MCDA guide: https://analysisfunction.civilservice.gov.uk/policy-store/an-introductory-guide-to-mcda/
2. HM Treasury *Green Book* 2026: https://www.gov.uk/government/publications/the-green-book--2/the-green-book-2026
3. UK MCDA supplementary guidance, HTML: https://www.gov.uk/government/publications/green-book-supplementary-guidance-multi-criteria-decision-analysis/use-of-multi-criteria-decision-analysis-in-options-appraisal-of-economic-cases
4. Bana e Costa & Vansnick (1994), original MACBETH: https://doi.org/10.1111/j.1475-3995.1994.00325.x
5. Bana e Costa, De Corte & Vansnick (2011), overview: https://orbi.umons.ac.be/handle/20.500.12907/34054
6. García-Lapresta & González del Pozo (2019), qualitative ordinal scales: https://doi.org/10.1016/j.ejor.2019.05.015
7. Greco, Mousseau & Słowiński (2008), robust ordinal regression: https://doi.org/10.1016/j.ejor.2007.08.013
8. Kadziński, Greco & Słowiński, robust ordinal regression/preference learning: https://link.springer.com/article/10.1007/s10994-013-5365-4
9. Cinelli et al., MCDA method selection and veto: https://pmc.ncbi.nlm.nih.gov/articles/PMC7970504/
10. Greco, Mousseau & Słowiński, interacting criteria: https://doi.org/10.1016/j.ejor.2014.05.022
11. ISPOR MCDA Report 1 (2016): https://www.ispor.org/publications/journals/value-in-health/abstract/Volume-19--Issue-1/Multiple-Criteria-Decision-Analysis-for-Health-Care-Decision-Making-An-Introduction--Report-1-of-the-ISPOR-MCDA-Emerging-Good-Practices-Task-Force
12. ISPOR MCDA Report 2 (2016): https://www.ispor.org/publications/journals/value-in-health/abstract/Volume-19--Issue-2/Multiple-Criteria-Decision-Analysis-for-Health-Care-Decision-Making-Emerging-Good-Practices--Report-2-of-the-ISPOR-MCDA-Emerging-Good-Practices-Task-Force
13. ISPOR quantitative benefit-risk practice (2023): https://www.ispor.org/heor-resources/good-practices/article/quantitative-benefit-risk-assessment-in-medical-product-decision-making
14. Baymard negative-review UX findings: https://baymard.com/research-articles/respond-to-negative-user-reviews
15. Method selection architecture: https://arxiv.org/abs/2106.07378

## 2a. Should a flaw naturally matter *more* than an equal benefit? Behavioural evidence is mixed

Research on *loss aversion* gives a legitimate reason to test an asymmetric preference curve, **but not** to impose a universal multiplier on every negative product observation. A 2014 meta-analysis focused specifically on **product choice** found loss aversion but substantial variation across categories, reference points and research methods: https://www.sciencedirect.com/science/article/pii/S0022435914000189 . A broad 2024 meta-analysis of 607 estimates from 150 articles suggested a mean coefficient near 1.955 in its assembled literature, but it did not establish a universal consumer-product defect weight: https://topcat.aeaweb.org/articles?id=10.1257%2Fjel.20221698 . Another 2024 meta-analysis of risky choice estimated a lower parameter, 1.31 (95% CI 1.10–1.53), and warned about sparse quality data: https://doi.org/10.1016/j.joep.2024.102740 . A 2025 re-meta-analysis questioned robustness under symmetrical gains and losses: https://doi.org/10.1016/j.joep.2025.102801 . **Different scope, models and data prevent comparing these coefficients as a universal correction.**

Therefore: leave the value function free to express a steep disutility around an important threshold **when elicited from this user's actual trade-offs**, with asymmetry and reference point documented. Do not hardcode `negative ×2`, and never confuse monetary risky choice loss-aversion coefficients with a tested headphone comfort penalty.

## 3. Why 'a negative review = minus N' is not justified

A negative passage is source evidence about **performance**, not a unit of personal disutility. The path must remain explicit:

`Original test → excerpt-anchored proposition → original-test/method/context/variant identity → reviewed per-criterion performance → (separate) elicited user-specific preference value → swing weights and bounded trade-offs → ranking + reasons`.

The NLP model may **propose** labels (e.g., 'pressure after extended wear', 'noticeable', 'under test conditions'), never a fictitious −25 utility merely because 'painful' is negative. A calibrated/elicited assessment of what that outcome means on a criterion value scale is necessary for quantitative trade-offs. If this calibration has not been done, retain the ordinal claim and the recommendation uncertainty rather than manufacturing precision. Automatic numeric conversion of vague severity adjectives is out of scope.

The same source article may contain ten negative sentences about one single test. Ten sentences do not multiply the negative impact tenfold. Aggregate by *criterion × actual original test × exact product/variant × conditions*, and reconcile conflicting independent tests before mapping to a preference level.

## 4. Illustrative calculation: how a flaw can be worth tolerating

This is **a fictional scenario**, not consumer research or an expert assessment of real headphones. Scores and weights are invented solely to demonstrate the algorithm if they were independently elicited.

Three criteria and their user-specific hypothetical *swing* weights: comfort 0.20, sound 0.40, noise cancellation 0.40.

Two fictional products:

| Criterion | Weight | Product A value | Product B value |
|---|---:|---:|---:|
| Comfort | 0.20 | 25 (real, contextual drawback in the fiction) | 100 |
| Sound | 0.40 | 100 | 70 |
| Noise cancellation | 0.40 | 100 | 70 |
| **Total conditional value** | **1.00** | **85** | **76** |

With comfort as an **ordinary trade-off criterion**, product A ranks above B despite its discomfort, which must still be disclosed. If the user explicitly requires long-term comfort above a threshold and reliable original testing establishes that A fails, A is **provisionally excluded**, independent of its numeric score. If the failure itself is uncertain, hold rather than fabricate a pass or fail.

Important: an interval-scale score is **relative to the elicited preference model and selected range of interest**. 85 is not a scientific 85% product quality rating, a probability of satisfaction or a universally valid expert grade.

## 5. Proposed production-oriented architecture (not yet completed)

### Inputs and separation of duties
- `src/needs_discovery.ts` defines tasks and articulated importance. Add **explicit yes/no hard minimum requirement**, verified against the actual user's confirmed intent. 'Essential' alone must not create a hard veto.
- `src/phase95_professional_review_intake.ts` and `src/phase96_qualitative_review_evidence.ts` generate bounded, source-anchored evidence. No grades are extracted directly from generic sentiment.
- `src/phase97_noncompensatory_qualitative_gate.ts` becomes a **hard-constraint adjudicator only**, or is refactored so its output cannot automatically veto every importance='essential' category. **It is not yet refactored in this phase.**
- A new curated mapping/review layer assigns independent-test observations to value *performance levels* defined for each product category/task context; it cannot create its own weights.
- Elicit value anchors and swing weights through a separately designed preference module (initially explicit preference exercises; later MACBETH/robust ordinal regression where justified). Avoid excessive questions, use pairwise comparisons only when ambiguity affects selection.
- New `src/phase98_tradeoff_value_model.ts` implements **a bounded, experimental weighted component value model** once all elicited values and reviewer confirmations are supplied. It does not learn weights, issue numeric ratings from prose, authenticate reviewer signatures, or alter `launch_rank.ts`.
- A later empirical evaluator should measure how often rankings remain stable, how often a flagged flaw is tolerated by actual users, how often a true hard need is overlooked, and whether the explanations capture relevant negative and positive test evidence.

### Uncertainty, exclusions, and robustness
- Input value from an independently documented performance assessment may have plausible min/max level bounds; if no evidence exists the bound is the full criterion's elicited [0,100] range, **not an imputed zero or average**.
- Calculate lower/upper overall value bounds; do not label these statistical confidence intervals.
- Show an ordering only if candidate A's lower bound exceeds B's upper bound, conditioned on the *elicited* value functions and weights. More sophisticated preference-weight robustness will require varied weights or a set of compatible models.
- Refuse winner claims when unresolved explicit hard requirements or contradictory evidence could change the result.
- Keep severe safety/accessibility conflicts and hard incompatibilities separate from ordinary utilitarian trade-offs.
- Explain the largest positive and negative criterion contributions, cite original test URLs, state what the model has not tested.

### Why not just use ELECTRE / PROMETHEE / MACBETH by default?

A single named MCDA algorithm does not automatically resolve subjective preference elicitation, semantic extraction quality, threshold calibration, dependence or review provenance. **Classic compensatory value modelling** is a workable first research implementation for ordinary trade-offs, while ELECTRE-style outranking is a candidate for veto and incomparability, and MACBETH can help elicit coherent cardinal values from verbal comparisons. A robustness layer can later approximate UTA/robust ordinal regression. Method choice must be decided after empirical user tasks and realistic heterogeneous source data, not from abstract popularity.

## 6. Executed research prototype and tests

- Source: `src/phase98_tradeoff_value_model.ts`
- Tests: `tests/phase98_tradeoff_value_model.test.ts`
- Script: `npm run test:phase98`

The prototype demands independently documented component value scales and a normalized set of user swing weights. It rejects unanchored scales, wrong product IDs, source-inapplicable observations, unreviewed methods, manufacturer-origin evidence as original tests, duplicate criterion assignments and fabricated sentiment-based levels. It keeps hard minima distinct from soft trade-offs and returns conditional ranking and source-attributed contribution breakdowns. Unresolved hard needs or overlapping total-value ranges prevent a decisive order. It is **research only** and exposes `publicationReady:false` and `rankingEligible:false`.

- **13/13 new TypeScript tests passed**.
- **698/698 JavaScript/TypeScript tests passed** using five completed shards (including the 13 new tests).
- Companion Python 60 and Node 16 passed; primary Python 47; ingestion Python 21; evaluation Python 26; launch 4; release 3 (release rerun sequentially after a parallel-output clash); **875 distinct tests passed**.
- An attempted full-suite monolithic execution timed out after one completed shard; the five independent bounded shards completed successfully. Counts do not include double-counting the focused Phase98 tests.
- No performance on real purchased/used products, blinded human reference labels, rank calibration, real local-model NLP accuracy or live website access tested.

## 7. Empirical follow-up, minimum viable design

Construct an independently annotated original-professional-test corpus, stratified by product categories and criterion types; include non-scored remarks, underexplained negatives, actual quantified results, different original tests sharing syndicated text, context-specific faults, and review-methodology conflicts. Separately elicit actual user preferences and hard needs through realistic comparative choices. Use a blinded holdout to measure:

- Ranking accuracy against the *user's observed choices* (pairwise agreement, not a claim of universally objectively correct products).
- False veto and missed genuine incompatibility rates (explicit user-confirmed hard minima).
- Qualitative evidence labeling agreement and error rates per aspect/context/original test.
- Stability of top choice across tested elicitation alternatives, plausible performance uncertainty and source withdrawals.
- Explanatory fidelity: does every material ranking contribution link to evidence and a preference mapping?
- Data acquisition/right-to-use feasibility, source drift, LLM calls per source change, human validation effort.

All technical-source and independent-test restrictions from the cumulative phases remain unchanged. The project does not become a generic price comparison service and affiliate links remain downstream of independent ranking.
