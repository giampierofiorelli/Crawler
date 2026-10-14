# Product Evidence Engine — Phase 108
## Query-neutral canonical product knowledge, source-complete intake and personalized ranking isolation
**11 October 2026 | v4.32 | Research-only implementation, not a public-ranking release**

## Executive decision

The initial user question **must not** shape the underlying interpretation of a product, its original professional reviews, or the baseline value of its characteristics. A person asking for dishwashers that are effective against bacteria and viruses may legitimately receive a different *user-scoped ranking* from someone prioritizing cleaning, drying and quietness. Both questions must interrogate the **same source-derived canonical evidence**.

User questions can identify missing evidence. Such questions generate only *research gap tasks*, never product facts or negative product findings. Once a new criterion or source finding is independently reviewed, it becomes reusable **category-wide knowledge** and is available to every subsequent user, regardless of who first prompted the investigation.

This phase fixes the architectural separation for the cumulative Phase101–107 engine; it does **not** claim to validate the completeness of expert-review interpretation or authenticity of reviewer attestations.

## 1. The four separate knowledge planes

| Plane | Canonical? | User-request dependent? | Controls |
|---|---|---|---|
| Exact product/variant and expert-test observations (Phase101) | Yes | No | Original-test lineage, exact variant, methods, immutable normalized claim, withdrawal/version history |
| Context, comparative interpretation and convergence (Phases102–104) | Shared derived evidence | No | Traceable source claims, conditions, uncertainty, independent-test grouping, conflict flags |
| Research backlog and new-category-criterion proposals (Phase108) | No: a work queue | Triggered by a query, reviewed independently | No direct claims; category-wide criterion adoption; no raw prompt stored |
| User-scoped value, hard requirements, ordinal sensitivity and conditional ranking (Phases98–100,107) | No: a decision projection | Yes | Versioned preferences and source fingerprints; cannot rewrite global facts; research-only status |

**Invariant:** For fixed source evidence E and a fixed scientific interpretation policy M, shared product knowledge K(E,M) must be invariant to user preference U and the order in which users ask questions. Only the derived decision R(K,U) may change. This invariant is a **design requirement tested on constructed cases**, not an assertion of real-world scientific calibration.

Equivalently:

- `Canonical(Product, Evidence, ReviewedMethod) → ReusableKnowledge`.
- `Personalized(Query, Preferences, ReusableKnowledge) → UserScopedComparison`.
- `UserQuery → ResearchGapProposal`, **never** `UserQuery → CanonicalExpertFact`.
- `ReviewedNewEvidence → CanonicalKnowledgeRevision → InvalidateDependentProjections`.

## 2. Example: a dishwasher asked about bacteria *and* viruses

A user asks: “What are the best dishwashers that also kill bacteria and viruses?”

1. Retrieve the product's *entire existing* independent evidence entity: washing, drying, noise, energy, reliability, and any antimicrobial evidence, without retroactively reinterpreting those features through this request.
2. Keep explicit bacterial-reduction and viral-inactivation criteria separate; even bacterial sanitation evidence does not by itself support viral inactivation.
3. If viral evidence is absent, report **not yet assessed / evidence absent** — not a failure and not a reason to permanently exclude the model.
4. Optionally create a research gap. A reviewer must approve an exact criterion, protocol, endpoint and context **for the whole category**, not only the model originally requested.
5. Review original professional tests comprehensively, not just the text fragment matching the query. Require a full-source aspect audit declaration and independent original-test contextual assessment. A real product result enters Phase101 only if supported by its original method and exact variant.
6. A future user prioritizing low noise still sees the same germ-reduction knowledge even if it has zero weight in that user's ranking.

**Technical/health terminology:** NSF states that [NSF/ANSI 184 residential dishwasher certification](https://www.nsf.org/consumer-resources/articles/dishwasher-certification) confirms a minimum **5-log/99.999% bacterial reduction in the sanitizing cycle**, not a general claim of virucidal performance. The US EPA [distinguishes sanitizing and disinfecting](https://www.epa.gov/coronavirus-and-disinfectants/whats-difference-between-products-disinfect-sanitize-and-clean). EPA's chemical-product definitions must not be mechanically imposed as a dishwasher engineering standard, but they make the biological endpoint distinction clear. Never infer an exact virus from an unspecified claim to remove 'germs'.

## 3. Scientific and engineering references (source links)

| Primary research / authoritative documentation | What it supports | What it does not prove |
|---|---|---|
| [Microsoft Azure Architecture Center — CQRS](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs) | Separation of authoritative write model and query-specific read projections, independent lifecycles, eventual consistency/transactional outbox risks | Does not certify the current three-DB implementation as atomic |
| [W3C PROV Primer](https://www.w3.org/TR/prov-primer/) and [PROV Overview](https://www.w3.org/TR/prov-overview/) | Observations and subsequent derivations should preserve entity, activity, source and revision provenance | A URI or assessor string is not independent authentication |
| [Google, *Rules of Machine Learning*](https://developers.google.com/machine-learning/guides/rules-of-ml) | Feedback loops can alter learned or deployed system behavior; monitor training/serving skew | Our source-review extractor is not automatically debiased by having hashes |
| [*A survey on popularity bias in recommender systems*](https://link.springer.com/article/10.1007/s11257-024-09406-0) | Feedback, exposure and selective data collection can reinforce bias and underserve less-visible items | Does not give a universal formula for correcting our product-test source coverage |
| [*Dynamic feedback loops in recommender systems* (2026)](https://doi.org/10.1007/s10844-026-01025-y) | Iterative recommendations may distort attention and preference representation | Not a direct evaluation of Product Evidence Engine |
| [NSF dishwasher certification](https://www.nsf.org/consumer-resources/articles/dishwasher-certification) | Organism-specific bacterial reduction under certified sanitizing cycle | Does not show blanket efficacy against viruses |
| [U.S. EPA difference between disinfecting, sanitizing, cleaning](https://www.epa.gov/coronavirus-and-disinfectants/whats-difference-between-products-disinfect-sanitize-and-clean) | Biological endpoint terms have different meanings | Chemical-product regulatory statements are not identical to appliance test standards |
| [UK Government MCDA guidance](https://www.gov.uk/government/publications/green-book-supplementary-guidance-use-of-multi-criteria-decision-analysis/use-of-multi-criteria-decision-analysis-in-options-appraisal-of-economic-cases) | Value models are context/preference conditional, not product-intrinsic truth | Does not provide calibrated appliance ratings or universal preference weights |

## 4. Implemented in v4.32

**`src/phase108_query_neutral_evidence.ts`**, a constrained research-only boundary:

- `QueryNeutralEvidence108` exposes read-only snapshots, revision fingerprints, active reviewed claims and separately calibrated levels. It contains **no API** for a user's question to update a product claim.
- `PersonalizedEvidenceQuery108` reuses Phase107 source-free recomputation and checks **before and after** that the canonical source-frame fingerprints did not change. It returns a user-scoped result and no shared product score. Phase107 continues to disallow public launch/ranking.
- `ResearchDiscoveryQueue108` stores normalized **research job IDs** and suspected gaps in a separate SQLite store. It does not hold raw prompts or create new performance facts. Duplicate IDs cannot silently change meaning.
- `ReviewedCategoryCriterion108` is adopted independently for the whole category; for registered models, absence of a claim is displayed as `not_yet_assessed`, not `failed`.
- `SourceIndependentIntake108` is a restricted route to the existing Phase101 writer requiring an independently adopted category criterion, original-test context, an assessor identity match, a source-wide aspect-audit reference and a source-independent interpretation declaration. It rejects query-specific payload fields and premature writes. **These attestations are structural, not cryptographically authenticated; nor do they prove the review really was comprehensive.**
- No original article body is retrieved or stored in these new query operations; no new LLM calls are made.

The new interfaces do **not** remove or alter the existing low-level `InterpretationMemory101.recordApprovedClaim` interface. A production write authorization boundary that prevents *every* upstream caller from bypassing the new admission interface remains an open requirement. The Phase108 restriction applies to callers that use the new protected adapter. Other existing ingestion paths must be audited or migrated before claiming end-to-end enforcement.

## 5. Test results and what they establish

Eighteen **constructed**, targeted Phase108 test cases pass. Tests cover:

- A gap request leaves shared source fingerprints and product interpretations unchanged.
- Unknown virus efficacy is not treated as negative product performance or automatically inferred from bacterial results.
- A new criterion is scoped to all three fictional dishwashers, including those the user did not search for.
- Raw user requests and extra preference fields are rejected in the research queue and canonical-intake adapter.
- Independent reviewed findings can enter the common memory and are reusable thereafter, regardless of the triggering request.
- Two users receive opposite conditional rankings of the **same** fictional vacuum cleaners while source-frame fingerprints are identical; no personalized weight is written to the canonical memory.
- Persistence of the research queue, separate from persistent product claims.

Full compilation and all six completed JavaScript/TypeScript test groups: **860 pass**, with shard 1 executed as two smaller independent processes. Supporting completed suites: primary Python 47; ingestion Python 21; evaluation Python 26; companion Python 60; companion Node 16; launch 4; release 3. **Total 1,037 passing software tests**, executed in bounded groups. All groups were rerun after the final Phase108 hardening changes; the partial/timed-out earlier combined run is not counted.

No independently annotated real dishwasher review has been ingested for Phase108. The examples and apparent assessment receipts are **fictional software fixtures**, never evidence that any real dishwasher kills/inactivates a virus. No reviewer authenticity, extraction completeness, benefit-weight elicitation, source-representative coverage or production concurrency was empirically validated here.

A reproducible example is saved as `audit/phase108/constructed-request-neutrality.json`.


### Hardening audit: invariance and pairwise source coverage (four extra cases)

- Request-order counterfactual: hygiene-first vs alternate-first research backlog sequences yield identical full canonical source-backed claim records and revision fingerprints for the same original evidence. A query-triggered research task does not become part of the interpretation.
- A single reviewed pairwise comparison `alpha` vs `beta` provides evidence **about both exact variants**, even if the source record identifies only `alpha` as the focal variant. The secondary product no longer incorrectly appears `not_yet_assessed` in the source coverage view.
- Even after adopting a category-wide research protocol, absence of virus-specific evidence is preserved as `not_yet_assessed`, without a negative finding or an inferred failure.
- Withdrawal of the original pairwise comparison removes its coverage contribution to **both** variants and preserves the withdrawal in the canonical revision history.

These are constructed software invariants; they do not validate real expert conclusions, data coverage, reviewer credentials, or the soundness of applying a given scientific protocol to an actual product. Source-complete ingestion and authenticated acceptance across all upstream writer interfaces remain P0 requirements.

## 6. Remaining risks (prioritized)

**P0 — Source-complete acquisition and backfill.** A query-neutral schema does not guarantee a query-neutral *extractor*. Enforce a category-defined aspect inventory and source-completeness audit independent of the first question. After adopting a new criterion, re-examine applicable previously reviewed sources and all eligible variants, not merely the product that triggered discovery. Mark `not_mentioned`, `not_tested`, `not_yet_assessed` and `method_inapplicable` separately when grounded; never equate silence with a negative test.

**P0 — Trust/authentication boundary.** SourceOriginalTest, assessor, original revision, review method, interpretation receipts and category protocol adoption require authenticated approval records, not only booleans and textual declarations. Restrict low-level canonical writer entry points and test bypass attacks. Our Phase108 adapter is intentionally provisional.

**P0 — Cross-store atomicity.** Phase101/104/105 and the new research queue are separate SQLite databases. Pre/post revision checks reduce stale output but are not a global atomic transaction. Implement a single authority or a transactional outbox with crash/restart concurrency tests.

**P1 — Selection bias from research traffic.** Even if a user never changes a fact, frequently requested characteristics may become better documented while obscure variants are neglected. Audit coverage per criterion, category, publisher, brand, variant and use case; backfill fairly across all eligible products; avoid feeding clicks or requests back into intrinsic suitability.

**P1 — Science of the knowledge graph.** Preserve objective observations, original-test context, reviewer convergence and disagreement, calibrated criterion levels, and user-conditioned utility as distinct objects. True performance is not equivalent to an expert consensus count, and no universal numeric 'excellent dishwasher' score should be written as fact.

**P1 — Real-world falsification.** Use multiple expert annotators blinded to which user query motivated acquisition; compare extracted full-source aspect inventories under randomized first-query orders. Measure recall of material positives/negatives, false bacterial→viral generalizations, change in canonical fingerprints, coverage bias across products, and downstream rank quality against independently evaluated decisions.

**Release boundary:** retain `publicationReady=false` and `rankingEligible=false` for this experimental path. Keep retailer links/affiliate information outside intrinsic evidence and preference comparisons.
