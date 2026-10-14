# Product Evidence Engine — Phase 104
## Entity-centred evidence intelligence: persistent identity, defeasible conclusions, change and memory

**11 October 2026 | v4.28 | Cumulative research implementation | Not a production recommender**

## Executive decision

**Treat a product as a persistent epistemic entity, not a passive row in a catalogue and not a self-directed language-model agent.** Its durable identity connects test executions, manufacturer specifications, verified qualitative observations, comparison frames, calibration, reviewer agreement/disagreement, uncertainty and past decisions. A shared, inspectable reasoning engine maintains materialized *conclusions about that entity* from independently reviewed evidence; it can change or withdraw a conclusion without retrieving the same article again. The source of truth remains Phase101's approved claim store, never a newly generated narrative.

**Delivered and tested in Phase104:** `src/phase104_entity_cognition.ts`, 14 new TypeScript tests, source-free worked demonstration and hash-chained transition history. In this narrow implementation an entity has an explicit state for each `(exact variant, criterion, operating context)`, derived from Phase102/103. When the authoritative claim set changes, the module records which claim identities were added or removed and updates the relevant entity's state. When an unrelated product changes, it avoids recomputing the existing result. It emits only advisory review tasks, without LLM, network, autonomous scraping or publication. **This is a bounded truth-maintenance prototype, not the full ATMS, knowledge graph, argumentation engine or reinforcement-learning system described below.**

## Why this is more than a database but less than an artificial organism

Ordinary catalogue records answer: *which products have which features?* The evidence engine must answer: *what does each independently tested result justify, under what conditions, what contradicts it, what changed since the last assessment, and what can safely be concluded for this user's purpose?* The moving unit is a **justified conclusion under revision**, rather than a mutable score or sentence.

The term 'living' is a useful product-design metaphor for a continuously revised knowledge representation. It does not imply awareness, selfhood, subjective experience, intrinsic goals, or that every product gets its own independent LLM. We recommend centralized admission, trust, evaluation and security policies; products are persistent domain aggregates with interpretable state and a shared inference service.

### A product's seven bounded behaviours (target architecture)

1. **Identify:** Resolve exact manufacturer, model, variant, revision, firmware and market before attaching evidence. No inherited performance from another SKU merely because the family name matches.
2. **Observe:** New licensed/authorized input enters source-policy checks, model matching and the quarantined evidence process of earlier phases. An LLM can propose interpretation, never self-approve evidence.
3. **Remember:** Store approved structured claims once, with source locators, method, test identity, human/machine interpretation version and conditions. The original article need not be copied into user-facing or query-time data.
4. **Justify:** Every derived judgement retains dependencies on original claims/tests and reviewed calibrations. A restated test is not a second independent experiment.
5. **Disagree:** A contradictory assertion is represented alongside its evidence. First investigate differences in protocol, contexts, scale, samples and original test identity; do not erase or automatically majority-vote.
6. **Revise:** When evidence is superseded or withdrawn, invalidate affected derived conclusions and preserve the old derivation and transition chronology. A product does not become bad when evidence disappears; its evidence status becomes unknown or provisional.
7. **Ask and explain:** Produce *bounded* tasks to obtain evidence, review calibration or reconcile sources where a user decision could change, with transparent reasons and no automatic LLM loops.

At request time, preference reasoning from Phases98–100 reads these contextual entity conclusions, applies genuine non-negotiable requirements separately, and trades off ordinary strengths and weaknesses. Convergence is a disclosure about evidence, not a bonus automatically added to product utility.

## Scientific and engineering foundations — scope of transfer

| Evidence | What it actually supports | Proposed use | What it does not prove |
|---|---|---|---|
| Doyle, *A Truth Maintenance System* (1979), [original MIT record](https://dspace.mit.edu/entities/publication/5377b306-4ecc-4687-b1f5-78cbb4a0543a), [journal DOI](https://doi.org/10.1016/0004-3702(79)90008-0) | Retaining reasons for beliefs and revising those beliefs when assumptions are contradicted | Dependency-directed revision and explanation | Our Phase104 statuses are not a full truth-maintenance formalism |
| de Kleer, *An Assumption-Based TMS* (1986), [DOI](https://doi.org/10.1016/0004-3702(86)90080-9) | Maintaining compatible/incompatible assumption sets, not discarding every hypothesis during conflict | Later support multiple context/protocol interpretations without global collapse | No ATMS implementation or formal completeness claim today |
| Dung, *On the Acceptability of Arguments* (1995), [DOI](https://doi.org/10.1016/0004-3702(94)00041-X) | Formal semantics for attacks between arguments | Future support/refutation structure for qualitative expert claims | A negative adjective is not automatically a formally valid counterargument |
| W3C [PROV-O](https://www.w3.org/TR/prov-o/), [PROV vocabulary](https://www.w3.org/ns/prov) | Entities, activities, agents, generation, derivation, invalidation and revisions | Auditable claim-to-conclusion lineage | A URL/hash alone does not authenticate a reviewer |
| W3C [OWL-Time](https://www.w3.org/TR/owl-time/) | Temporal representation and relations among instants and intervals | Separate publication, test execution, manufacturing/firmware validity, acquisition and assessment times | Temporal metadata does not establish that a hardware revision has materially changed |
| W3C [SHACL](https://www.w3.org/TR/shacl/) | Checkable constraints on RDF graph data | Reference for schema-level validation of future typed evidence graphs | We have not integrated an RDF store or conforming SHACL validator |
| AWS [Event sourcing pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/event-sourcing-pattern.html) | Reconstruct current state from recorded events, support historical/time-specific views and materialized projections | Derived knowledge transitions and audit/replay | A second journal must not become a competing authority for reviewed source evidence |
| DeLong et al., *Neurosymbolic AI for Reasoning Over Knowledge Graphs* (2025), [DOI](https://doi.org/10.1109/TNNLS.2024.3420218) | Survey of combinations of symbolic constraints and learned methods for KG reasoning | Hybrid extraction + deterministic justifications + selectively learned calibrations | This does not validate an LLM's interpretation of an unfamiliar review |
| Liu et al., *Neural-Symbolic Reasoning over Knowledge Graphs* (2025), [ACM DOI](https://doi.org/10.1145/3748239.3748249) | Survey of KG reasoning and incomplete/noisy data | Architecture for typed, context-scoped queries | No reason to replace the existing relational store simply to claim a knowledge graph |
| Ni et al., *Risk-Controlled Event-Driven Cascading Updates for Knowledge Graph Consistency Restoration* (ACL Findings 2026), [ACL Anthology](https://aclanthology.org/2026.findings-acl.2111/) | Research on cascading relational updates after localized changes | Long-term research direction: graph-based dependency invalidation at scale | Its experimental uncertainty guarantees do not transfer to our engine without implementation and validation |

### Critical separations

**Truth of a tested observation ≠ trustworthiness of the test ≠ agreement among testers ≠ usefulness to a user.** These are linked but distinct variables. A product may be excellent for one task, unsuitable for another, objectively loud but subjectively tolerable, or uncertain because three supposedly independent reviewers used the same apparatus and procedure. Do not force them into a universal property named `qualityScore`.

Similarly, **no claim recorded ≠ characteristic not tested ≠ observed failure**. The next data model should explicitly record `assessed`, `not_assessed`, `assessed_not_reported`, `not_known`, `not_applicable` and `blocked_rights` only when those statuses themselves are evidenced. Absent facts remain absent otherwise. Phase103 already identifies this as a major gap.

## Proposed future knowledge graph / relational hybrid

```text
Category -> Criterion -> OperatingContext -> CalibratedScale
ProductFamily -> ExactVariant -> Hardware/FirmwareRevision
OriginalTestExecution -> TestProtocol -> Condition -> SourcePublication
OriginalTestExecution -> Observation -> EvidenceClaim
EvidenceClaim -> Supports/Challenges -> ContextualConclusion
ContextualConclusion -> DependsOn -> {EvidenceClaim, ApprovedCalibration, Context, Identity}
ContextualConclusion -> Supersedes -> PriorConclusion
UserNeed -> PreferenceConstraints -> ContextualConclusion -> DecisionExplanation
EvidenceChangeEvent -> Invalidates -> DerivedConclusion -> ReassessmentTask
```

The links above are design targets, not a claim that the Phase104 prototype already persists every edge. Build with stable IDs and constraints first; relational tables and materialized JSON views are sufficient until graph-shaped queries justify a dedicated graph database. Index by variant, criterion, context, original test identity, source, calibration version and dependency. Treat embeddings only as retrieval aids, never as adjudicated factual memory. Keep reviewer/source policy decisions outside the generative subsystem.

### Inference contracts (future production)

- **Non-monotonicity:** acceptance of a new test can downgrade a once reasonable conclusion; revisions must not discard the original evidence history.
- **Dependencies:** derived judgement records the exact source claim IDs, unique original test IDs, calibration ID/version, protocol/context scope and inference rule version. Recompute when any dependency changes.
- **Context isolation:** noise in carpet turbo mode is not silently pooled with hard-floor normal mode; qualitative reviewer-specific terms do not become decibels.
- **Partial order:** distinct disconnected comparison groups remain incomparable. Source disagreement does not become a fabricated probability.
- **Independence caution:** originally independent tests may share calibration instruments or producer-provided samples; record method/source dependence separately from duplicate publication checks.
- **Event time:** keep test-observed-at, source-published-at, source-retrieved-at, knowledge-decided-at, last-validated-at, and knowledge-effective-time distinctly.
- **Authority:** human approval and data reuse clearance stay under existing authenticated rights/policy processes. A checksum and `approved: true` payload are not a trust certificate.
- **Invalidation:** no positive utility boost for number of sources; evidence coverage and agreement affect explanation/uncertainty handling, not product merit itself.
- **Version drift:** changes in hardware, software, tester methodology, source policy, calibration thresholds, or decision logic trigger scoped re-evaluation.

## Delivered Phase104 implementation

**New module:** `src/phase104_entity_cognition.ts` exports `EntityCognition104` and typed `EntityBelief104` / `EntityTransition104` contracts. It has no LLM, network, text ingestion or ranking route. It is an *epistemic projection* of the reviewed Phase101 snapshot, interpreted through the existing Phase102 frame validator and Phase103 convergence evaluator.

- Entity key: `(categoryId, exact variantId, criterionId, frameId)`.
- Belief states: `unobserved`, `described_uncalibrated`, `observed_not_calibrated`, `provisionally_supported`, `convergent`, `disputed`, `uncertain`, `incomparable`.
- Every input frame is integrity-recomputed and checked against registered exact variant identities; timing must not regress.
- The entity's active evidence fingerprint depends only on claims touching that exact variant, including claims where it is the compared model. An unrelated product's new claim does not trigger a spurious reasoning event.
- Changed dependencies cause a transactional SQLite state update and append-only, SHA-256 chained transition including added/removed claim IDs, state before/after and time.
- An unchanged snapshot is idempotent. A frame revision affecting only another product merely refreshes the observed snapshot reference without creating a new inference event.
- After restart, `productMind` and `history` return persisted context-scoped conclusions and advisory next-research tasks; `verifyJournal()` validates the on-disk chain as currently stored.
- Evidence removed from the approved source store disappears from current dependencies; uncertainty and conclusions can reverse instead of staying artificially high.
- Original-test IDs are deduplicated: two report/claim entries for the same original test do not count as two confirmations. Qualitative words without calibrated anchors do not become scalar values.
- All results retain `consumerRankingApproved=false`, `probabilityCorrect=null`, `llmCalls=0`, and do not initiate research automatically.

**Reproducible constructed example:** `scripts/phase104-demo.mjs` writes `audit/phase104/constructed-entity-evolution.json`. The five observed states for a fictional vacuum's noise performance are: `unobserved` → `provisionally_supported` (one anchored expert result) → `convergent` (two distinct original tests, same anchored level) → `disputed` (third original test differs) → `convergent` (third claim withdrawn after hypothetical review). No live publisher reviewed or contacted during this demonstration.

### Actual test evidence

- JS/TS mainline compiled tests, including **14 new Phase104 tests**: **799 passed** in 5 sharded groups.
- Python primary-source validator: **47 passed**.
- Python ingestion: **21 passed**.
- Evaluation Python: **26 passed**.
- Phase87–89 companion Python: **60 passed**.
- Companion Node: **16 passed**.
- Launch artifact: **4 passed**.
- Release packaging: **3 passed**.
- **Total distinct suites: 976 passed**. No empirical performance accuracy/recall or expert calibration is implied by these test counts.

## Gaps and risks: do not claim the intelligence is finished

1. **Not a complete ATMS or argumentation engine.** The current module only maps Phase103 convergence to epistemic states, not proof rules, alternate assumption environments, attack/support graph semantics or full dependency-propagation across multiple criteria.
2. **Store authority:** SQLite knowledge projection is a separate derived cache and event ledger, not another source of reviewed claims. Production needs transactional hand-off from Phase101/authoritative PostgreSQL, authentication and crash/replay/outbox guarantees. The two stores are not yet atomically coupled.
3. **Tamper resistance:** SQLite triggers prevent ordinary UPDATE/DELETE; the hash chain detects many accidental changes but not administrator-level complete history rewrite. Anchor signed checkpoints externally for regulatory-grade audit.
4. **Claims still narrow:** Phase101 supports a limited set of noisy-product descriptor and measurement types. Expand via reviewed category ontologies and typed observations, not generic adjectives.
5. **Source truth:** Assertions of independent reviewers, authorizations and calibers are inputs from earlier stages, not cryptographic human proof.
6. **Coverage and shared methodological dependence:** Phase103 still cannot prove whether a non-mention means unassessed; it does not model correlated instruments, shared samples or common data sources.
7. **Review tasks are advisory:** no task scheduler dispatch, budgeted Value of Information, credentialed reviewers, or approval workflow was added here.
8. **No population validation:** Real reviews, blinded human annotations, cross-source context matching, real-source retrieval, statistical calibration and user outcome improvement remain untested.
9. **No product-ranking integration:** The research-state projection intentionally cannot change public recommendations. Later gating requires held-out validation, preference scale acceptance and error/abstention metrics.
10. **No production scaling proof:** Node built-in SQLite is experimental in the tested Node v22 and the implementation is single-host/single-writer. For multiworker reliable event delivery, use durable transactional database+outbox, followed by measured scalability tests.

## Research programme to make entities increasingly intelligent

**A. Provenance graph and explicit review coverage:** define stable IDs, provenance and reviewed completeness statuses at the original test × criterion × context grain; check source dependence. Unit-test every evidence mutation and profile projection.

**B. Argument graph and defeasible conclusion rules:** add support/attack edges and conditional assumptions; implement conflict explanation with human-readable competing reasons, not majority-voting; validate on adversarial counterexamples.

**C. Relational entity intelligence:** allow safe multi-hop propagation to affected comparison pairs and category-level benchmark scales, with bounded graph-depth and retained derivation paths. Avoid transitive preference inference across incompatible contexts.

**D. Calibrate from real labels:** blinded independent extractors annotate reviewed qualitative claims and method/context. Measure extraction precision/recall, cross-annotator reliability, incorrect exclusion risk, false comparability and disagreement resolution. Only then fit optional Bradley–Terry / Rasch / calibrated Bayesian models where identifiable, with explicit uncertainty.

**E. Active information gathering:** use a decision-relevance gate from earlier phases. Ask for a new experiment only if it might change a product's comparison or clarify user needs. Record bounded attempts and estimated cost; no endless autonomous loops.

**F. Real-world decision validation:** evaluate whether source-derived judgments improve task-specific product choices compared with a documented simpler baseline, including calibration, stability, fairness across categories and robustness to removed evidence. Testing prototypes with synthetic examples is not a substitute.

### Architecture acceptance criteria

A viable end-state should reconstruct *why* a judgment existed as of time T; replace a removed lab observation without contamination; correctly distinguish independent tests from repeats; preserve incompatible contexts; know which criterion lacks evidence; refrain from inferring a universal score from adjectives; update only impacted entities; and answer a user query without re-reading source text or invoking the LLM by default. Improvements must be proven on held-out, independently labeled real examples.

**Disposition:** Continue evolving the existing cumulative engine. Do not restart it around a new graph database, generic autonomous agent framework or an arbitrary neural model. The highest-value future work is the explicit **dependency/argument knowledge model plus genuine expert evidence coverage**, while preserving the empirical validity discipline established in Phases 56–103.
