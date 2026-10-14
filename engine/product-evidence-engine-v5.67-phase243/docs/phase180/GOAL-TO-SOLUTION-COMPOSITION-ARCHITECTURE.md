# Product Evidence Engine — Goal-to-solution composition

**Date:** 12 October 2026  
**Status:** engineering feasibility and architectural decision for future implementation; **not implemented or empirically validated as a recommender**.  
**Canonical software baseline reviewed:** `product-evidence-engine-v5.03-phase179.zip` (Phase 179).  
**Audience/product:** English-first, website-first, editable decision snapshots. This note preserves the user's proposed capability as an extension of existing project work; it does not replace or revise prior canonical artifacts.

## 1. User need and proposed capability

A user may articulate **an outcome** without knowing any product category, equipment family or technical specification: e.g., “I want to make fresh rigatoni at home” or “I want to bake a cake, but I have little space”. The PEE should investigate not only *which product is best within a specified category*, but also **which feasible means or compatible combination of means will deliver the outcome**.

Candidate answers may include:

1. Use or adapt equipment already owned (no purchase, a consumable or verified compatible accessory).
2. A single multifunctional appliance or integrated solution.
3. A minimal, functionally complete combination of products from one or more categories.
4. A different technology or approach, where the user's goal does not require the initially imagined category.
5. An explicit abstention or a targeted clarification if feasibility, compatibility or performance cannot yet be verified.

**Prevent compulsory bundles**: recommending extra purchases without necessity or a validated advantage is a failure. This system is an independent decision aid, not an upsell engine.

## 2. Why this is feasible, and what published research actually establishes

- NIST's *A Functional Basis for Engineering Design: Reconciling and Evolving Previous Efforts* explains the engineering role of representing overall function and decomposing it into subfunctions. It is a design foundation, **not evidence that an LLM can automatically perform valid goal decompositions**. https://www.nist.gov/publications/functional-basis-engineering-design-reconciling-and-evolving-previous-efforts
- Zanker, Aschinger & Jessenitschnig (2010), *Constraint-based personalised configuring of product and service bundles* (DOI: 10.1504/IJMASSC.2010.037653), investigates configurations of multiple products/services with constraints and user preferences. This supports feasibility of constraint-based bundle configuration in the studied domains, **not product-specific accuracy for PEE**. https://www.inderscience.com/info/inarticle.php?artid=37653 and https://bia.unibz.it/esploro/outputs/journalArticle/Constraint-based-personalized-configuring-of-product-and/991006493777401241
- Uta and coauthors (2024), *Knowledge-based recommender systems: overview and research directions*, describes constraint-based product recommendation, inconsistent user requirements and knowledge-acquisition burdens. https://pmc.ncbi.nlm.nih.gov/articles/PMC10925703/
- Google OR-Tools CP-SAT documents a mature integer constraint solver with explicit feasible/infeasible/unknown states. The GitHub repository is Apache-2.0 licensed. **Evaluate before adding**: solve limited pilot cases with the project's current deterministic code or a small in-process enumerator first, then compare OR-Tools in a separate performance/deployment/maintenance benchmark. https://developers.google.com/optimization/cp/cp_solver ; https://github.com/google/or-tools

The cited research provides engineering approaches to *model and search* a configuration space. It does not prove that a generated solution is technically adequate: **domain evidence and validation remain the limiting factors**.

## 3. Reuse the actual v5.03 implementation

The canonical ZIP contains these relevant existing modules:

- `src/phase116_category_function_model.ts`: category function/mechanism/outcome model; stages, evidence provenance, cautions around inferring results from the presence of a mechanism.
- `src/phase117_goal_outcome_comparison.ts`: reviewed goal-outcome comparisons and exact measurement contracts; explicitly not a production recommendation engine.
- `src/phase164_user_request_journey.ts`: bounded natural-language request journey, all outputs as hypotheses/research proposals.
- `src/phase177_decision_snapshot.ts`: website-first, user-confirmed criteria, immutable revision history and distinct unconfirmed suggestions.
- `src/phase129_category_growth_cycle.ts`: existing category discovery/quarantine/review; do not add another ontology promotion mechanism.
- `src/phase179_category_learning.ts`: category research plan, need→outcome→mechanism→observable→method candidate edges and append-only research ledger.
- Phase105/106 dependency and recomputation controls, and Phase169–171 exact-source/test/identity admission policy (see their original records): respect rather than bypass them.

Do not reinterpret Phase175/176 dialogue features as a mandatory chat user experience. Allow them as optional tooling for parsing free-form revisions and professional review narratives.

## 4. Proposed typed model (design, not yet code)

- `Goal`: original English utterance; intended observable outcome; usage environment; success/quality criteria; hard boundaries; any ambiguity.
- `Subgoal`: **reviewed** dependency steps/functional requirements, with provenance and applicability conditions. Distinguish necessary, optional and mutually exclusive steps.
- `SolutionOperator`: a technological capability, equipment type, verified existing asset, service or process that *can* fulfill a specified subgoal under explicit preconditions, conditions and limitations. Not a promise that a product performs well.
- `Item`: exact make/model/variant/accessory and supported functions, compatibility references and independent original results, versioned by source and test protocol.
- `SolutionCandidate`: either a single item, a compatible set of items, a no-purchase path, or a conditional family-level strategy. Keep candidate-vs-authorized distinction explicit.
- `CompatibilityEdge`: typed requirement/relation such as accessory-to-model fit, power and electrical requirements, space and installation, size/shape of output, capacity, safety and maintenance, with source provenance; **unknown cannot silently become compatible**.
- `DecisionSnapshot`: use Phase177 to bind user-confirmed goal, owned assets, budget, priorities and restrictions to a versioned proposed solution set. Candidate knowledge updates cannot silently alter confirmed requirements.
- `EvidenceTrace`: for each asserted function, compatibility, critical exclusion and ranking difference, link exact source, product identity, test configuration, source timestamp and knowledge/policy versions.

## 5. Solution search and ranking authorization

1. Interpret English outcome and ask at most decision-critical questions. Do not assume a category.
2. Generate a tentative subgoal graph from the **reviewed function library**, flagging unknown steps. The system must not make up causal relations as facts.
3. Enumerate alternative technology pathways and eligible operators (including existing equipment and no-purchase options).
4. Apply hard constraints (verified technical feasibility, safety, space, electrical fit, accessory compatibility, user hard requirements, budget if strict). Exclude only on admitted evidence, not unverified inference. Classify uncertainty as `unknown` or `needs-check` rather than as pass.
5. Compose feasible candidates; use deterministic, bounded exact enumeration on small pilot catalogs. Benchmark solver alternatives only if search complexity warrants them.
6. Assess outcome adequacy of the **whole configuration**. A set of individually well-rated products does not prove combined compatibility, achievable result, operating effort or performance. Include setup, accessories, total cost of ownership, maintenance, space, time, energy, and complexity when pertinent and measured/verified.
7. Expose a transparent minimal set of distinct options; compare only with justified criteria and protocol-compatible evidence. No unjustified aggregate score; no cross-scenario scores without a defined policy.
8. Preserve a reproducible ranked decision based on same confirmed goals, assets, evidence snapshots and rank policy, with stable ties and reasons. A new item or knowledge version triggers explicit recomputation and difference tracing; old snapshots remain reproducible.
9. Abstain if critical requirements or real evidence are missing, even if an attractive-looking solution can be assembled.

**Important:** Optimizing product bundles is a different task from recommending frequently co-purchased items. Purchased-together frequency does not demonstrate functional need or technical compatibility.

## 6. Concrete category-pilot examples (illustrations, not product claims)

### Fresh rigatoni
- Goal: produce fresh rigatoni at home; identify shape/forming requirements, dough workflow, cleaning and available equipment.
- Compare strategy families: a purpose-appropriate standalone machine; a compatible attachment to an already-owned base unit; multiple tools if independently adequate; a non-purchase/manual strategy only if it can really meet the shape requirement.
- Hard edge: a device designed only for rolling flat sheets or cutting ribbons must **not** be treated as producing extruded tube shapes merely because it is rated highly as a pasta maker.
- Pilot falsification: count incorrect shape-capability assumptions, incompatibility misses, unnecessary purchases, unexplained extra items and unsupported exact-model recommendations.

### Baking cakes in limited space
- Determine cake dimensions, available equipment, electrical/installation constraints, temperature/control demands, and required accessories.
- Compare a verified existing oven, feasible compact cooking appliances and the minimum necessary add-ons; don't infer that an appliance with a named “bake” mode bakes any particular cake well.
- Joint outcomes must be checked rather than extrapolated blindly from a nominal temperature setting.

### Household floor-cleaning outcome
- Distinguish vacuuming, wet cleaning, stairs, pet hair, surfaces, storage, physical handling and ongoing maintenance. Assess whether one combined machine, two specialised machines, or use of current equipment better achieves the requested outcome. Avoid counting a self-washing mechanism as demonstrated hygiene performance.

## 7. Independent validation and stop/go milestones

- **Phase A:** model only goals→functional subgoals and independent alternative pathways. Evaluate source-disjoint original English requests and expert-defined completion requirements. Do not infer a product winner.
- **Phase B:** implement exact evidence-checked compatibility and asset-reuse graph. Pilot on real manuals/spec sheets and independent professional tests for a manageable, documented set of models.
- **Phase C:** test solution compositions. Compare solver output with independently worked expert configurations; report false feasibility, missing mandatory components, unjustified add-ons, underdocumented pathways and relative total cost.
- **Phase D:** integrate into web-first criterion revisions, show a conditional options view, and measure objective choice correctness and missed decisive constraints in a controlled usability assessment.
- **Phase E:** connect the Phase179 category-growth process, new technology families, revised operating methods and updated product catalogs. Reviewed knowledge changes trigger versioned invalidation/recomputation, never silent rewriting.

Evaluation should compare (1) single-item-only baseline, (2) capability-aware single-or-composite search, (3) an ablation without owned-equipment knowledge, on held-out goals and verified product configurations. Source-disjoint evaluation and human expert review are necessary; no statistical accuracy is claimed here.

## 8. Risks and safeguards

- **False decomposition:** missing prerequisite; inventing a reason a tool is needed.
- **False compatibility:** same branded family, accessory name or connection interface does not establish exact-model compatibility.
- **Composite performance gap:** individually measured product quality is not evidence that the entire workflow succeeds.
- **Unnecessary expenditure:** bundles can become disguised cross-selling; include avoid-purchase and simpler alternatives by design.
- **Unbounded combinatorics:** limit candidate breadth, cap bundle sizes by reviewed task logic, separate prerequisites/optionals, and only use a solver when benchmarks show need.
- **Evaluation leakage:** do not treat examples that shaped the rules as independent accuracy tests.
- **Stale evidence:** product revision, changed accessories, newly released technology and new methods can invalidate earlier conclusions, requiring policy-versioned recomputation.

## 9. Decision

**Proceed with research and a bounded proof of concept in a future phase, preserving v5.03 as canonical.** The proposed feature is technically plausible and strongly aligned with the user's original goal-first product vision. It is currently *not* a claim that PEE can autonomously discover and recommend validated complete multi-product solutions. First demonstrate decomposition + compatibility + authorized evidence on 2–3 scenarios, then generalize and connect the continuous category-learning work. No new dependency, model or external repository is installed as a result of this note.
