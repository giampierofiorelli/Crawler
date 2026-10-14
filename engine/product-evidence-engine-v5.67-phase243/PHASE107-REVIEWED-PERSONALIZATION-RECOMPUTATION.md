# Product Evidence Engine — Phase 107
## Recomputing personalized research comparisons from durable, approved evidence memory
**11 October 2026 | version 4.31 | bounded offline research implementation**

### Executive finding

The cumulative Phase106 stack already maintained source-derived interpretations (Phase101), entity belief histories (Phase104), incremental invalidation (Phase105), and deterministic recomputation of **direct pairwise evidence** and explanations (Phase106). Its `personalized_tradeoff` node remained deliberately unimplemented. Phase107 closes this specific engineering gap **for two exact variants, two to five criteria, previously adjudicated calibrated-level claims and an explicitly reviewed preference model**. The path is:

1. Retrieve *active* Phase101 `calibrated_level` claims for each product × criterion × test frame × **exact** reviewed value-scale reference. No original review body is accessed.
2. Require a single reconciled active level per product and criterion. Contradictory calibrated claims halt recomputation pending adjudication; untested criteria stay *unknown*.
3. Submit eligible, provenance-linked observations to the existing **Phase98** compensatory value engine; a bad result reduces an attribute's contribution but is not a veto. A confirmed non-negotiable constraint remains an explicit separate gate; its asserted original-test reference must also match an active original-test record.
4. Apply an added **Phase100** source-free handoff that uses the original exact bounded convex-polytope helpers for ordinal preference sensitivity, *without falsely asserting Phase99 article-level input was rerun*. An unknown weight difference does not get fabricated as a cardinal magnitude. Indeterminate cases remain indeterminate; a potential question is generated only when it can narrow the model's interval.
5. Register a Phase105 immutable, digest-pinned profile and 2 × N belief dependencies. Recompute only after synchronization and journal replay. Atomically commit a digest-pinned research payload in the graph SQLite database and validate source fingerprints, graph checkpoint and actual current journal on reads.
6. Always return `publicationReady=false`, `rankingEligible=false`, `llmCalls=0`, and `sourceTextRequired=false`. This is a research comparison, **not a publicly deployable recommendation ranking**.

### What was implemented

- `src/phase107_personalized_recomputation.ts`: `PersonalizedRecomputation107.register`, `.recompute`, `.readFresh`, and typed reviewed context. Immutable profile digest includes the original user preference model, criterion-frame mappings, confirmed hard criteria, full-swing ordinal judgments and two exact variants. Changing preferences requires a new node identity.
- `src/phase100_adaptive_preference_envelope.ts`: added `assessAdaptiveFromStoredReviewedValues`, using Phase100's original polytope machinery to evaluate the **Phase98 value contributions** and produce either bounded necessary preference, underdetermination, missing evidence or hard-constraint hold. Outward rounding padding prevents accidental overconfidence from Phase98's five-decimal rounding. It explicitly does not impersonate a Phase99 output.
- `src/phase105_incremental_reasoning_graph.ts`: extends the research-only cache allowlist to an immutable-profile-bound `phase107_reviewed_tradeoff_v1` evaluator for `personalized_tradeoff` nodes; continues denying algorithms on inappropriate node types. It does not change the launch build's public ranking logic.
- `tests/phase107_personalized_recomputation.test.ts`: 15 constructed cases.
- `examples/phase107-personalized-demo.ts` and `audit/phase107/constructed-personalized-revision.json`: reproducible **fictional** illustration.

### Important distinction: ranking score vs epistemic agreement

The numeric score is a **conditional, locally calibrated user preference value**, *not* an expert rating, confidence, probability, intrinsic product excellence, decibel estimate or agreement percentage. Convergence across independent original tests is tracked separately by Phase103 and should not be used as a bonus added to an existing criterion score: that double-counts evidence. A mediocre attribute can be outweighed by strong ones within a validated additive value model. No generic negative adjective automatically vetoes a product, and the word `essential` alone does not make a criterion a hard requirement.

A source-free research read recomputes **neither source acquisition nor qualitative interpretation**. It checks that the stored prior adjudication is still active and that all dependent revisions still match. Derived caches are recalculated on relevant changes. The source link, original-test ID and adjudication receipt remain auditable references; the article is not republished.

### Methodological basis — primary links and applicability limits

| First-party / original source | Supported idea | What it does not establish |
|---|---|---|
| [UK Government Analysis Function, *Use of Multi-Criteria Decision Analysis in options appraisal* (2024)](https://www.gov.uk/government/publications/green-book-supplementary-guidance-use-of-multi-criteria-decision-analysis/use-of-multi-criteria-decision-analysis-in-options-appraisal-of-economic-cases) | Criterion value functions, explicitly specified performance swings, trade-offs, sensitivity analyses; words alone do not make weights | No automatically calibrated ratings for domestic appliances; additive value independence must be checked |
| [Greco et al., *Robust ordinal regression in preference learning and ranking*, Machine Learning](https://link.springer.com/article/10.1007/s10994-013-5365-4) | Necessary/possible preferences across compatible value functions | Phase100 is a restricted convex linear weight envelope, not full robust ordinal regression / UTA-GMS |
| [McSherry et al., *Differential dataflow*, CIDR 2013](https://www.microsoft.com/en-us/research/publication/differential-dataflow/) | Updating derived computational results incrementally is a rigorous research field | Phase105-107 is *not* a production differential-dataflow implementation |
| [W3C PROV overview](https://www.w3.org/TR/prov-overview/) and [PROV primer](https://www.w3.org/TR/prov-primer/) | Entity, activity, origin, derivation and revision provenance | Merely recording URL and receipts is not proof that a review or reviewer is authentic |
| [Cochrane Handbook, Chapter 15](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-15) | Absence of convincing evidence must not be misinterpreted as evidence of no difference | Health-intervention synthesis is an analogy, not a consumer-ranking standard |
| [SQLite WAL official documentation](https://www.sqlite.org/wal.html) | WAL cross-file `ATTACH` transactions are not atomic as a multi-file set; concurrency restrictions remain | Digest-based revalidation cannot confer true atomic snapshots across Phase101,104,105 SQLite files |
| [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) and [2026 ARIA Evaluation Planning Manual](https://www.nist.gov/publications/aria-evaluation-planning-manual-elements-aria-style-ai-evaluations) | Need risk-aware evaluation, red-team tests, real user assessments, and documented monitoring | Passing synthetic software tests is not validation of real-world consumer-recommendation quality |

### Reproducible constructed example

Two fictional vacuum cleaners, two fictional original-test interpretations and fictional user values. Noise is weighted 0.60 and cleaning 0.40 **solely to demonstrate arithmetic**. First, Alpha is poor on noise and good on cleaning; Beta is good on noise and poor on cleaning. Phase98 values are **Alpha 40, Beta 60**, so the first conditional ranking is Beta–Alpha. The memory then withdraws Alpha's old noise adjudication and records a new reviewed level of good. The prior cache immediately fails readFresh; after selective synchronization/recompute the conditional order becomes **Alpha–Beta**. Phase100's ordinal exploration without additional magnitude judgments reports the bounded preference as underdetermined. No inference or web article read was needed at query time.

File: `audit/phase107/constructed-personalized-revision.json`. Values, source URLs and assessor attestations are demonstrative, not observed facts.

### Software verification

- Compiled JavaScript/TypeScript: **841** across five completed bounded groups. A sequential combined run timed out *after* four groups completed; the remaining group was run alone and completed. The final targeted test group was repeated following the additional hard-veto check.
- Primary-source Python: **47**; ingestion Python: **21**; evaluation Python: **26**.
- Companion Python: **60**; companion Node: **16**; launch: **4**; release: **3**.
- Total executed passing cases across groups: **1,018**; Phase107-specific cases: **15**, included in the 842.
- **Zero** independently adjudicated real reviewer documents and **zero** human preference experiments in this release. Confidence calibration, false-veto rates, rank accuracy, user decision quality and live production races remain **unmeasured**.

### Remaining engineering/scientific risks — ranked

1. **No real calibration of subjective levels.** A source's calibrated level and model/user attestations are currently represented as checked metadata, not cryptographically authenticated identity or observed human validation. Need multiple independently assessed real products, cross-publisher reference anchors, held-out judgments and adjudication reconciliation. Do not reuse ordinal adjectives as universal numeric observations.
2. **No cross-SQLite atomic transaction.** The pre/post fingerprint + journal checks fail closed for detected concurrent changes, but cannot guarantee a global instantaneous snapshot under every race. Migrate to one transactional authority or implement a robust transactional outbox/version-fence protocol with concurrency fault injection.
3. **Strict ordinal preference has no finite value gap.** The system must allow an arbitrarily narrow strict difference; no phantom guaranteed winner. The additive assumption and full-swing elicitation also require genuine user confirmation.
4. **Potential hard veto claims need semantic threshold adjudication.** Phase107 now requires the original test to be active and exactly linked; that does NOT show that the recorded observation scientifically proves the claimed failure. A dedicated signed hard-threshold record and explicit user confirmation should be the next policy layer.
5. **Semantic evidence quality/contradictions.** Phase101 has deliberately strict one-active-level-per-cell behavior: independent calibrated claims that conflict must be reconciled upstream rather than voted or weighted automatically. Phase103 convergence and disagreement information needs fuller coupling to validity assessment.
6. **Scope and scaling.** Two candidates, 2–5 criteria, one single-host research SQLite per component, bounded cache size. Real preference profiles, overlapping tasks, more products, concurrent writes, historical version migration and complete original-test capture remain to be evaluated.
7. **Independence.** Phase98's additive independence flag currently requires reviewed assertion, not empirical demonstration; feature interactions may invalidate simple weighted additions. A nonadditive decision model may eventually be necessary.

### Next empirically useful phase

Build a small, properly permissioned, **independently annotated professional test calibration corpus**, with at least two trained assessors and explicit test-context/variant lineage; use it to assess whether original qualitative descriptions can be mapped to reusable criterion scales without silently changing their meanings. Concurrently implement a cross-store fault-injection test harness or single transactional evidence outbox. Protect the already established rule: ordinary strengths and weaknesses influence comparison; **only documented, genuinely non-negotiable failures** block a candidate. None of this can claim scientific completion at 100% without out-of-sample evidence.
