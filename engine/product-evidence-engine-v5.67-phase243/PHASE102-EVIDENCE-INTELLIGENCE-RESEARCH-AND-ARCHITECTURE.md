# Product Evidence Engine — Phase 102
## A scientifically governed evidence-intelligence layer over reusable professional-test knowledge

**Date:** 11 October 2026  
**Cumulative codebase:** v4.25/Phase 101 → v4.26/Phase 102  
**Status:** research architecture + working deterministic query prototype + software regression tests. **Not** an empirically calibrated expert-equivalent engine and **not** publication-authorized product ranking.

## Executive engineering decision

The project's distinctive capability should be the *persistent, source-traceable, context-aware interpretation of original product testing*, queried without re-reading article bodies or running an LLM for every user. Information can be useful well beyond the user/question that caused its original extraction. But an expert's adjective is not itself a measurement, and an archive of observations is not automatically a statistical estimator or a customer-specific utility function.

Maintain **four fundamentally different objects**:

1. **The original observation:** what one original test did or judged, on an exact variant, under explicit conditions, attached to a method, unit, version and source pointer.
2. **The evidence appraisal:** what limitations, conflicts, dependence on other reports, missingness, and relevance apply to the observation; uncertainty is not an overall product rating.
3. **The comparison/interpretation:** what relationships among products are established in a defined criterion/context (and what cannot be compared). The comparison may remain qualitative or partially ordered, with no invented distance.
4. **The user's value model:** which trade-offs are acceptable to this person; how large a difference matters; which explicitly confirmed requirements truly cannot be compromised.

Never fuse these into a single universal “AI quality score”. The reusable intelligence lies in converting independently sourced material into **typed, versioned, explainable, revisable facts and conditional relations**. A downstream decision model can combine them only under separately elicited/calibrated preferences.

## Cumulative compatibility and findings from the actual repository

The v4.25 code was inspected, not reconstructed from summaries. Existing modules already include:

- Phase 61: task-specific non-compensatory criteria and independent-lab context.
- Phase 63–64: original-test lineage and methodology appraisal.
- Phase 68–72: permitted access, original source readers and quarantined claims.
- Phase 85–93: source-specific extraction recipes, their approval/requalification and monitoring.
- Phase 95–96: quantitative/qualitative professional-review acquisition and qualitative approval scaffolding.
- Phase 97: essential-feature screening, which later phases explicitly narrow to genuinely confirmed non-negotiables.
- Phase 98–100: compensatory value modelling, qualitative-to-tradeoff bridge, preference uncertainty and selective questioning.
- Phase 101: SQLite-backed `InterpretationMemory101` storing four typed objects: `descriptor`, `pairwise`, `measurement`, `calibrated_level`; no article body in the operational memory; some ranking logic is **noise-specific**.

**Gap found during source review:** Phase 101's noise `tiers` can misleadingly suggest order between disconnected sets when users interpret tier numbers as a complete ranking. The new Phase 102 query does not synthesize an order from disconnected comparison components. It returns a state for **each directly examined pair**. The old method is retained for compatibility but should not be used as a definitive cross-catalogue rank without further repair and evaluation.

Other current limitations: many stored descriptors are noise-centric; source assertions about reviewer authentication are receipts, not proof of a real reviewer; independent `originalTestId` attribution relies on prior human lineage verification; there is no representative real publisher/consumer gold dataset or calibrated cross-reviewer noise scale; Node's built-in SQLite remains experimental for production.

## Scientific-method selection: use methods only for the problem they solve

| Method / scientific family | Evidence and applicability | What to implement or retain | Preconditions and boundaries |
|---|---|---|---|
| **W3C PROV / PROV-O** | Represent entities, activities and agents involved in creating derived records | Explicit `test execution → source revision/span → extracted statement → validated proposition → comparative interpretation → query result`, all versioned | Provenance alone does not make the original test reliable or prove permission |
| **W3C Data Quality Vocabulary** | Data fitness-for-use and quality annotations should be transparent, not reduced to a universal quality scale | Criterion-specific coverage, freshness, methodological completeness, reviewer identity/authentication state | Quality measurements must have declared, independently assessed definitions |
| **Fact verification / NLI (FEVER paradigm)** | Evidence-based support, refutation and insufficient information are distinct outcomes | Test extraction of negation, conditions, affected variant, measurement vs opinion and citation fidelity | FEVER concerns factual Wikipedia claims; performance on product-review language must be separately measured |
| **GRADE-CERQual (analogical transfer)** | Methodological limitations, coherence, adequacy and relevance for qualitative synthesis | Evidence-appraisal checklist PER finding; retain explanation, context and reasons for concerns | Not a consumer-review certificate or a source-reputation multiplier; no auto “90% confident” |
| **Krippendorff alpha / annotation theory** | Measure reproducibility of human annotations, including disagreement about coding | Independent annotation, adjudication audit, agreement separately for extraction and performance-class mapping | Requires several genuine human labels and a predeclared coding manual |
| **ISO/IEC measurements / NIST metrology** | Quantities require precise methods, units, conditions and uncertainty | Do not pool dB sound power and sound pressure, or tests in different operating modes; keep uncertainty | An engineering measurement does not automatically capture perceived annoyance or user value |
| **Anchoring vignettes (King et al.)** | People use verbal response categories differently | Candidate design for shared reference products/conditions and reviewer-language calibration | Assumptions of vignette equivalence and response consistency are substantive and require testing |
| **Many-facet Rasch / ordinal item response** | Can model multiple sources of rating variation, including rater severity | R&D option for sufficiently overlapping product × reviewer × rubric designs | Needs linked observations, coherent unidimensional constructs, fit and invariant-item diagnostics; don't fit to sparse slogans |
| **Bradley–Terry / Thurstone** | Estimate latent pairwise preference or performance positions from linked observed comparisons | R&D option for dense-enough, comparable explicit relative-test graph | Check graph connectivity, model specification, uncertainty, selection bias and context homogeneity; no fit on disconnected scraps |
| **Robust ordinal regression (UTA-GMS)** | Identify necessary/possible preferences given incomplete value-function information | Reuse Phase 100's constrained-envelope logic, later graduate to validated optimization | User constraints and preference information, independently assessed criterion-value scales; not a generic ranking of reviewer adjectives |
| **MACBETH / swing weighting / MCDA** | Derive value differences and user preferences from explicit comparisons of performance changes | Keep performance calibration distinct from personal preference elicitation; query only if decision may change | Never derive weights from labels alone; trade-off elicitation requires validated scales and users' choices |
| **Selective prediction / abstention** | Conditional abstention can trade coverage for reliability | Unresolved comparison, incomparable context, insufficient support or request-more-evidence outcomes | Calibrate abstention error rates on representative held-out data; no generic safety guarantees |
| **Conformal prediction (optional)** | Coverage guarantees rely on exchangeability or specific tested shift-handling assumptions | Investigate only after a stable probabilistic estimator, gold labels and calibration set exist | Not an automatic uncertainty wrapper for unsupervised LLM claims or changed publisher distributions |
| **Active learning / value of information** | Focus annotation and source exploration on uncertain cases most useful to subsequent decisions | Queue only the conflicting/low-coverage sources, reviewers, contexts or criteria that may alter conclusions | Requires an estimated workload and independent measurement of decision benefit |
| **NIST AI RMF, Model Cards** | Monitor actual validation, intended use, drift, failure patterns and evaluation slices | Per-source/category/version error metrics, evaluation manifests, rollback & stop conditions | Compliance or performance not established by implementing documentation alone |

This is a **research stack**, not a demand to integrate each statistical model immediately. Claims about scientific validity are conditioned on their original domain and assumptions.

## Architecture to build: a relational core plus evidence relations

**Use PostgreSQL as the future authoritative transaction store**, with normalized tables, constraints, an append-only history and JSONB only for truly heterogeneous protocol/context metadata. An in-process graph/relationship projection is sufficient at first; a graph database, vector store and autonomous agent are *optional accelerators*, not preconditions.

Suggested durable entities and immutable identifiers:

- `product_variant(id, category, brand, model, sku, market, valid_from, superseded_by)` — distinguish exact physical revisions.
- `test_execution(id, original_publisher, lab_or_reviewer, method_id, tested_variant, execution_date, independence_lineage_id)` — unit of independent testing, separate from articles.
- `source_revision(id, canonical_url, retrieved_at, source_sha256, source_role, permissions_scope, review_status)`; `source_locator(id, source_revision_id, DOM/path-or-section locator, span_digest)`.
- `observation(id, test_execution_id, variant_id, criterion_id, context_frame_id, kind, directional_semantics, numeric_value, unit, protocol_id, uncertainty_basis)` — do not let text descriptors masquerade as measurement.
- `interpretation(id, observation_ids, semantic_proposition_id, calibration_id, assessment_status, assessor_or_model_version, rule_version, valid_from)`.
- `calibration_registry(id, category_id, criterion_id, context_scope, anchors, method, validation_goldset_id, limitations, status)` — **never infer from adjectives without approved calibration**.
- `comparison(id, variant_a, variant_b, criterion_id, context_frame_id, relation, supporting_test_execution_ids, disputed_by, revision_id)`.
- `evidence_appraisal(id, finding_id, methodological_limitations, coherence, adequacy, relevance, reasoned_comments, reviewer_receipt)`.
- `preference_profile(id, requested_task, user_confirmed_hard_requirements, value_swings, constraints, version)`; *no source-scoring fields here*.
- `derived_projection(id, parent_interpretation_ids, method_version, computed_at, snapshot_sha256, validity_status)`.
- `audit_event(id, target_id, kind, actor, receipt, supersedes, created_at)` — no silent edits or deletions.

**Critical constraints:** foreign-key exact variant matching; explicit source roles and content-rights disposition; no multiplication of reports from the same experiment; condition-based comparison keys; unique interpretation lineage; irreversibility of withdrawals except signed reviewed replacement; invalidate/recompute only dependent projections when a source, test identity or calibration changes. Cache key must include evidence revision, category rubric, calibration version and method version; user ranking adds preference-profile version.

### Processing sequence

```text
Approved professional source + source identity/rights/robots
  → original-test execution + exact product variant + documented conditions
  → bounded structured extraction (LLM only on a novel unresolved pattern)
  → faithfulness checks (support/refute/unknown, negation, attribution, context)
  → semantic observation stored once, source locator + digest retained
  → independent-lineage dedup + method/quality appraisal + conflict review
  → optional category-specific scale calibration when data justify it
  → stored pairwise/contextual comparisons + uncertain/incomparable states
  → user's needs and confirmed non-negotiables
  → robust personal trade-offs, selective clarification and explanations
  → retrieval-only query whenever existing evidence is sufficient
```

When a source article cannot be fetched again, retained derived observations can still answer within their previously approved scope, but the audit should disclose whether their original text is presently re-verifiable; a hash is not a replacement for the text or a copyright grant. No article body is necessary in the *operational query* DB.

## Phase 102 implementation actually delivered

Files:
- `src/phase102_evidence_knowledge.ts` — a pure deterministic query interpretation engine over stored, current, immutable evidence.
- `src/phase101_interpretation_memory.ts` — a new read-only, transactionally consistent `snapshotReviewedFrame()` method; existing storage and Phase 101 read API retained.
- `tests/phase102_evidence_knowledge.test.ts` — 16 real runnable tests with constructed, explicitly fictional review assertions.

The new query processes `snapshotReviewedFrame` records already inserted in SQLite; it does **not** read the original article, send an LLM request or fabricate a cardinal ranking. The output is an exhaustive set of per-pair **direct** states (`supported_better`, `supported_worse`, `reported_equivalent`, `contested`, `not_directly_comparable`) for up to the existing 250-product research boundary, with original-test IDs and claim citations. It also returns reviewed descriptor terms, measurement metadata and calibrated levels. Repeated claims from one original test are consolidated for support counting. Disputed scale levels remain disputed; plausible intervals remain intervals.

This is deliberately **not** a statistical model; it does not claim superiority where comparisons are sparse, nor derive a transitive ordering across separate reviewer tests without an independently justified common one-dimensional criterion. It is an enforceable interface for later calibration/decision algorithms.

The snapshot SHA-256 is an audit checksum of current included claims, registered products and withdrawn IDs, not an authenticated signature or a guarantee that an assessor genuinely reviewed the data. The Phase 101 persistence is Node 22 experimental `node:sqlite` with a single-process scope, not production PostgreSQL.

### Worked scenario (constructed, not real products)

An expert testing execution T1 explicitly finds Vacuum A quieter than B. A syndicated copy repeats T1; this remains **one original test**, not two. Another independent test T2 establishes that C is quieter than D. The query reports A better than B, C better than D, and **A versus C not directly comparable**. If T3 finds B quieter than A under the same registered context, the A–B relation is **contested**, with both test IDs, without averaging them or discarding either. Describing A as “somewhat noisy” remains visible as a reviewer-relative opinion and never independently creates a dB reading. The user's request for *least noisy* changes the relevance of the noise criterion, not the historically recorded observation.

## Calibration plan: deliberately stratified, not universal

For every `(category, criterion, context)` frame:

1. Define the construct: e.g., vacuum noise measured on hard floor at a named operating mode; perceived low-frequency annoyance is a *different* construct.
2. Create a rubric and source-annotator instructions; include negation, comparisons, absolute/relative judgment, unknown, model variants, evidence-bearing passage identity and qualifiers.
3. Independently label real original tests and passages. Record adjudication and interrater reliability; evaluate against held-out original publishers and product models.
4. Construct anchors: reviewed reference products under controlled comparable methods and contexts. Test whether reviewer words are comparable across publishers. Do not assume a universal meaning of “fairly quiet”.
5. Use a statistical latent-quality method **only** where repeated overlapping original observations allow fit and external validation. Compare the method to a deterministic/no-calibration baseline before adoption.
6. Calibrate out-of-domain detection and abstention; monitor different publishers, time periods and category subtypes. Retract or version a calibration after drift.
7. Validate actual human decisions: relevance of trade-offs, harmful false exclusions, ranking agreement, sensitivity to priorities, and explanation faithfulness. A high extraction F1 is insufficient if user choices get worse.

### Evaluation plan and stopping criteria

Separate these measures rather than a single “AI accuracy” number:

| Layer | Required measures and slices | Failure condition |
|---|---|---|
| Acquisition | Authoritative host, exact SKU/variant, method, coverage, access failures | Incorrect model/variant mapping or unauthorized extraction |
| Claim extraction | Precision/recall of adverse, favorable, comparative, conditional and negated findings; source-span fidelity | Fabricated/inverted claim, dropped condition or measured status |
| Independent evidence lineage | False independent-test count, syndicated-source collapse, inconsistent protocols | Two publications treated as independent original experiments |
| Qualitative interpretation | Adjudicated expert disagreement, cross-reviewer calibration bias, holdout-by-publisher errors | Global adjective-to-score map without an empirical common scale |
| Comparisons | Pairwise correctness, abstention recall, conflict detection, graph disconnectedness | Treat unknown A vs C as A better or worse solely by table row position |
| Personalization | Hard-veto false positives, preference-sensitive reversals, regret and explanation validity | Trade-off veto without explicitly non-negotiable user need |
| Efficiency & maintenance | Retrieval latency, model calls, backfill invalidations, stale calibrations, costs | New user request reprocesses reviewed unchanged article without reason |

The pilot must reserve separate training/development, annotation, calibration and **publisher-held-out test** sets. Do not generate independent gold labels with the LLM whose extraction quality is being assessed. Annotators should record different use cases and conditions; source-date leakage and same-test syndication must not contaminate holdout.

## Ranked engineering follow-ups (not claimed implemented)

**Next A — high priority:** portable transactional PostgreSQL catalogue, phase101 category-neutral claim ontology, multiwriter approvals, invalidation chain and benchmarkable query API. Phase 102's deterministic pair-reasoner becomes a projection.

**Next B:** independent gold corpus of real permitted original professional tests from multiple publishers for one category (vacuum noise) and then a structurally different second domain (e.g., headphone comfort). Include explicit tests where a defect is tolerable or decisive depending on user needs.

**Next C:** independently calibrated anchor references for the first `category × criterion × context`, with testable invariance assumptions; cross-publisher blind validation and documented interrater agreement. Add BT/Rasch methods only after confirming overlapping observations sufficient to identify their parameters.

**Next D:** validated value functions and incremental elicitation for personal decisions (Phase 98–100), plus controlled counterfactual explanations; no product-catalogue-wide overall universal score.

**Next E:** small observational pilot with user decision tasks; compare against an honest baseline: lab-measurement sorting, star-rating sorting, and manual expert synthesis. Demonstrate material gain in decision correctness, not only features or speed.

## Scientific primary sources and their precise scope

1. W3C, **PROV Model Primer** — entity/activity/agent provenance; does not certify truth. https://www.w3.org/TR/prov-primer/
2. W3C, **Data Quality Vocabulary** — express fitness-for-use metadata and quality annotations; not a universal numeric quality definition. https://www.w3.org/TR/vocab-dqv/
3. Lewin et al., **GRADE-CERQual**, PLOS Medicine (2015): qualitative evidence appraisal methodology for health/social interventions; transfer to consumer reviews is proposed, not validated. https://doi.org/10.1371/journal.pmed.1001895
4. Cochrane Handbook, **Chapter 21 — Qualitative evidence**: research synthesis and CERQual integration. https://training.cochrane.org/handbook/current/chapter-21
5. Thorne et al., **FEVER** (NAACL 2018): evidence-supported/refuted/not-enough-info annotation; not a test of our parser. https://aclanthology.org/N18-1074/
6. Krippendorff, **reliability assessment resources** (University of Pennsylvania): reliability of human content coding; numeric scores require a real annotated sample. https://www.asc.upenn.edu/krippendorffs-alpha-reliability
7. King, Murray, Salomon & Tandon, **Enhancing the Validity and Cross-Cultural Comparability of Measurement in Survey Research**, APSR 2004: anchoring vignettes; assumptions must be assessed. https://gking.harvard.edu/publication/enhancing-the-validity-and-cross-cultural-comparability-of-measurement-in-survey-research/
8. Winsteps/Linacre, **Many-Facet Rasch model theory**: rater/item/subject facets and latent scales; model fit and identifiability required. https://www.winsteps.com/facetman/theory.htm
9. **Uncertainty quantification in the Bradley–Terry–Luce model** (Information and Inference 2023): confidence and sparse comparison graphs; not an out-of-the-box consumer-quality score. https://doi.org/10.1093/imaiai/iaac032
10. Greco et al./Kadziński et al., **Robust ordinal regression in preference learning and ranking** (Machine Learning): necessary vs possible preferences given incomplete value functions. https://link.springer.com/article/10.1007/s10994-013-5365-4
11. UK Government Analysis Function, **An Introductory Guide to MCDA** (1 May 2024): performance scales and swing weighting, warns against weights based merely on criterion names. https://analysisfunction.civilservice.gov.uk/policy-store/an-introductory-guide-to-mcda/
12. UK HM Treasury, **Green Book supplementary MCDA guidance** (24 June 2024): MCDA for mixed qualitative and quantitative criteria, sensitivity of trade-offs. https://www.gov.uk/government/publications/green-book-supplementary-guidance-use-of-multi-criteria-decision-analysis/use-of-multi-criteria-decision-analysis-in-options-appraisal-of-economic-cases
13. ISPOR Task Force, **MCDA good practices report 2** (2016): checklist and step-by-step evaluation discipline; healthcare domain. https://www.ispor.org/heor-resources/good-practices/article/multiple-criteria-decision-analysis-for-health-care-decision-making---emerging-good-practices
14. IEC **60704-2-1:2026**, dry vacuum cleaners acoustical noise protocol, under defined conditions; norm may require purchase for its full text. https://webstore.iec.ch/en/publication/86833
15. NIST, **TN 1297 Appendix D**, repeatability, reproducibility, defined method and measurement uncertainty. https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-appendix-d1-terminology
16. NIST, **AI RMF Playbook — Measure**: operational validity and monitoring, documentation, and representativeness, not a certification of this software. https://airc.nist.gov/airmf-resources/playbook/measure/
17. Settles, **Active Learning Literature Survey** (2009): selectively querying annotators when labels are costly. https://minds.wisconsin.edu/handle/1793/60660
18. **Selective Prediction-Set Models with Coverage Rate Guarantees**, Biometrics 2023: abstention under model/evaluation assumptions; developed in healthcare. https://doi.org/10.1111/biom.13612
19. Zou & Liu, **Coverage-Guaranteed Prediction Sets for Out-of-Distribution Data**, AAAI 2024: illustrates ordinary conformal coverage failure when exchangeability fails. https://doi.org/10.1609/aaai.v38i15.29673
20. Mitchell et al., **Model Cards for Model Reporting**, FAT* 2019: document model scope, evaluation and limitations. https://doi.org/10.1145/3287560.3287596

**Research caveat:** None of these papers directly demonstrates that the proposed combined architecture outperforms current recommendation systems, nor do they define a validated universal score from qualitative consumer-product reviews. The design synthesizes methods conditionally and proposes how to test the claim of differentiation.
