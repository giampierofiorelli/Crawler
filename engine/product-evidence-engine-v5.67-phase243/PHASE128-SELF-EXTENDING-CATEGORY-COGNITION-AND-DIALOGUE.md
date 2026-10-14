# Product Evidence Engine — Phase 128: self-extending category knowledge as the shared basis for research and dialogue

**Date:** 11 October 2026  
**Version:** v4.52-phase128, cumulative successor to v4.51-phase127.  
**Status:** executable, bounded architectural bridge; **not** an independently validated autonomous category-learning/recommendation service. No newly tested consumer products, newly authenticated review content or public market rankings are claimed.

## Verdict and what was already in the repository

The proposal to let the knowledge database expand *like a shared, revisable conceptual memory* is sound as an engineering direction. It is **not a new idea that requires throwing away the previous architecture**. The repo already included:

| Existing phase | Verified, existing role | Missing interface addressed here |
|---|---|---|
| 71 `adaptive_schema_evolution.ts` | Discovers/quarantines/proposes new schema fields and product relationships; reviewed promotion; type and provenance checks | Knowledge about product purposes and quality needs a dialogue-oriented projection |
| 73 `category_cognitive_mesh.ts` | Category recognition and unknown-category investigation across use cases, failures, methods, provenance and context | New category research should eventually generate reusable language schemas, not remain only a report |
| 74 `category_research_execution.ts` | Executes scoped local research workers; separately records lack of independent approval | Ontology deltas must be staged and reviewed before activation |
| 101–109 | Original-evidence memory, entity states, dependencies, incremental revision and query-neutral facts | Changes to category knowledge need to invalidate interpretations as well as conclusions |
| 116 | Function → mechanism → observed outcome → failure model, including test method and scope | Quality and user-language meanings should point back to outcomes, not marketing feature lists |
| 125–127 | Compositional request hypotheses, reviewed ambiguities and dialogue state | Schemas were supplied separately rather than derived from evolving shared category knowledge |

**The new contract:** one reviewed category knowledge snapshot may be projected into (a) the Phase125 question schema, (b) the Phase127 ambiguity registry, (c) category-specific quality-method dimensions, and (d) a list of missing research. Product measurements stay in the original, separately governed evidence ledger; category concepts are not measured product facts.

## The scientific evidence: what it supports and what it does not

1. **NIST, Fenves (2002), _A Core Product Model for Representing Design Information_.** Separates product function, behavior, form, material and their relationships. It supports a reusable, extendable domain model. It does **not** define scores for consumer products or verify our system. Full source: https://www.nist.gov/publications/core-product-model-representing-design-information ; report DOI: https://doi.org/10.6028/NIST.IR.6736
2. **Baizal, Widyantoro & Maulidevi (2020), _Computational model for generating interactions in conversational recommender system based on product functional requirements_, Data & Knowledge Engineering.** Uses a product ontology with *functional requirements*, generating questions, candidate recommendations and explanations. Its user study reports preference for functional-requirement interaction over flat technical-feature interaction and measured improvements in explanation trust within that study. This is the closest direct published antecedent to our desired *same category knowledge → product understanding + clarification* coupling. It does not validate our implementation. https://doi.org/10.1016/j.datak.2020.101813 ; https://www.sciencedirect.com/science/article/pii/S0169023X1830524X
3. **Ciroku et al. (2024), _RevOnt: Reverse engineering of competency questions from knowledge graphs via language models_, Journal of Web Semantics.** Demonstrates the methodological connection between ontology concepts and the questions a knowledge base should be able to answer; includes a benchmark of manually annotated competency questions. It employs models in its own method; it does **not** show that an in-house non-LLM system can infer arbitrary new intent. https://doi.org/10.1016/j.websem.2024.100822 ; https://www.sciencedirect.com/science/article/pii/S1570826824000088
4. **W3C PROV-O (2013).** Provides provenance entities, activities, derivations, revisions, and invalidations, applicable to audited evidence graphs. Our object links are analogous but **not PROV-O conformance**. https://www.w3.org/TR/prov-o/
5. **W3C SHACL (Recommendation, 2017).** Formal language for validating RDF graph data using explicit constraints; motivates typed evidence/quality schema validation. Our TypeScript validation is **not a SHACL processor**. https://www.w3.org/TR/shacl/
6. **Doyle (1979), _A Truth Maintenance System_.** Grounds the idea of retaining justifications and revising conclusions instead of overwriting a mutable score. Phase104–106 implement restricted dependency mechanisms, **not a complete TMS**. https://doi.org/10.1016/0004-3702(79)90008-0
7. **RTINGS, Robot Vacuum Test Bench 1.1 (2026).** Its updated robot mopping methods distinguish stains, smearing and residual moisture, reinforcing the separation between mechanisms and directly observed consumer outcomes. Its testing approach is one possible source-specific rubric, not a universally sufficient robot-quality definition. https://www.rtings.com/robot-vacuum/tests/changelogs/1-1
8. **Vacuum Wars, robot vacuum testing methodology.** Independent editorial method examples for differentiating navigation, vacuuming, mopping and maintenance dimensions. Protocol differences must remain documented rather than combined into arbitrary universal scores. https://vacuumwars.com/how-vacuum-wars-tests-robot-vacuums/
9. **ISO/IEC 25010:2023.** Defines nine product-quality characteristics for ICT/software products, *not* all consumer appliances. Relevant as an example of systematic domain-specific quality characteristics, not as an appliance certification. https://www.iso.org/standard/78176.html

## The target domain model

A category's durable information is a typed, versioned network:

```
CATEGORY (e.g. robot floor cleaner)
  ├── USER JOB / FUNCTION (vacuum, mop, move across levels)
  │   ├── CONTEXT (carpet, pet hair, threshold geometry, room layout)
  │   ├── MECHANISM (brush, roller, robot carrier, vapor generator)
  │   ├── MEASURED OUTCOME (soil left after test, successful tasks, minutes of human work)
  │   │    └── ORIGINAL TEST and PROTOCOL (date, substrate, unit, number of passes)
  │   ├── FAILURE / SIDE EFFECT (entanglement, smearing, floor damage)
  │   └── QUALITY CRITERION (evaluated scope, review and calibration provenance)
  ├── DOMAIN MEANINGS (door threshold ≠ full staircase)
  │    └── CONVERSATIONAL QUESTION (only after reviewed decision impact)
  ├── PRODUCT / VARIANT (original-evidence ledger is the separate authority)
  └── RESEARCH GAPS (what is missing; what cannot yet be asserted)
```

**'Good product' is not a fixed count of functions.** A category has user purposes and qualitative/quantitative outcomes, with minimum performance requirements only when backed by an appropriate scope and calibration. Quality, value for money and low-maintenance autonomy are distinct decision views. Brand new capabilities, such as stair climbing or steam application, must not be assumed either helpful or already measured merely because present in a feature list.

## Growth workflow

1. **Discovery:** newly discovered category, product function, mechanism, criterion, context or meaning triggers a scoped investigation. Use the existing Phase73/74 category plan and source controls; do not spawn unbounded self-directed crawlers.
2. **Research:** consult original, permitted expert methodology and product tests. Record distinct original documents, contexts, claim spans, protocol versions and provenance. Novel terms enter as candidate hypotheses, not truth.
3. **Quality control:** enforce identity, rights, product variant, role of each source, compatibility of measurements and source-document linkage. Distinguish original measured quality from expert-method discussions and from manufacturers' feature declarations.
4. **Promotion:** after explicitly reviewed category definitions, promote a new node/quality method/meaning; advance the schema version. In a future deployment, review identity must be authenticated by the trusted source-of-truth, not merely a self-reported ID string.
5. **Recomputation:** invalidate dependent language projections and downstream materialized interpretations when the category snapshot changes. **Phase128 only emits invalidation indicators and content fingerprints**; transactional persistence and Phase105 job wiring are still needed.
6. **Use in dialogue:** Phase125 derives only the reviewed aliases and evidence keys; Phase127 derives reviewed meaning alternatives. If knowledge is absent, research; if interpretations differ materially after authenticated product evaluation, ask one meaningful question; otherwise continue.
7. **Repeat:** route discoveries and knowledge gaps into the next bounded category research cycle; never take user answers as independent measurements of products.

## What Phase128 actually implements

`src/phase128_category_cognition_dialogue_bridge.ts`:

- Validates a typed source-linked category memory containing **tasks, environmental contexts, capabilities, meanings, outcomes, failures and mechanisms**.
- Keeps unreviewed candidates invisible to the live question schema; detects source-document mismatch; rejects duplicate identities and simple exact alias collisions before promotion.
- Supports explicit review-gated concept, quality-method and meaning-definition promotion; carries versioning and signals invalidation. No new dependency, commercial service or LLM required.
- Compiles the *same reviewed snapshot* into Phase125 `CategorySchema125` (language aliases and evidence keys) and Phase127 `ReviewedAmbiguity127` (possible readings, not product outcomes). This is the missing connection.
- Generates research-gap instructions for missing quality methods, proposed concepts and incompletely measured Phase116 function definitions.
- Delegates entirely new category routing to **existing** Phase73 planners rather than inventing a second cold-start research framework.
- Uses content-based ontology fingerprinting: concept synonym/meaning/quality changes invalidate the projected schema even when a human accidentally leaves the integer version unchanged.
- Returns `rankingAuthorized:false`; source URL/reviewer ID strings are structurally checked but are **not** proof that a reviewer truly exists, that a claim was extracted correctly, or that a source is licensed for automated ingestion.

The tests use constructed category definitions, fake category variants, and source-reference metadata as fixtures. **No professional product review was automatically ingested in this phase.** No independent sample proves that the engine discovers arbitrary product functions from texts or interprets unseen languages. The old Phase125 parser still uses bounded lexical recognition; the new bridge enriches its category lexicon instead of magically fixing NLP generalization.

## Three scenarios and gates

**A. User: 'Voglio un robot aspirapolvere per moquette, senza lavaggio.'** The approved category graph provides a carpet context and separate vacuum/mopping jobs; the interpreter creates candidate goals/negative constraints, not an automatic product claim. Only a verified product comparison may select a winner.

**B. User: 'Un robot con vapore.'** A newly observed vapore mechanism/capability is staged with its source links. Once independently reviewed it becomes an allowed concept and Italian/English request vocabulary. The fact that the mechanism exists does not establish the final floor temperature, cleaning benefit, or sanitation level. Missing actual-outcome measurements remain research tasks.

**C. User: 'Quale robot sale gli scalini?'** One reviewed category memory can contain both interpretations, *door threshold* and *full staircase*. It projects their options into the Phase127 controller. If alternative eligibility and outcome consequences are not independently reviewed, the controller researches instead of automatically asking or ranking.

## Evaluation needed before declaring an evolving 'brain'

- Freeze unrelated real user questions and multi-turn interactions, with expert adjudication, **before** revising the lexicon. Measure unseen-category intent coverage, wrong constraints, ambiguity-question usefulness and correctly reused conversation state.
- Test domain growth on at least two unrelated product types (e.g. floor robots vs headphones), including names/criteria never represented in existing code. Compare reviewed category growth to baseline static schemas.
- Run authorized live original-source ingestion and verify both schema precision and category research recall. Annotate source provenance, original experiments and false inferred links.
- Confirm product rankings remain query-neutral under ontology revisions, including snapshot versioning, and are identical for semantically equivalent requests at the same pinned data revision.
- Quantify expert review time and human workload, false promotions, duplicate concept merges, rollback success, incremental-change costs and actual question-turn reductions.
- Audit runtime security: authentic reviewer identities, ACID write boundaries across stores, version pinning, allowed crawling, source licensing and cache invalidation. **None is validated end-to-end by this module.**

## Verification

- **Phase128 tests:** 33 / 33 passed (synthetic and adversarial constructed fixtures).
- **TypeScript regression:** 1,385 / 1,385 tests passed across 87 eligible files, excluding two pre-existing legacy files `phase91_watch_gate.test.js` and `phase92_recipe_lifecycle.test.js` that were already unresolved/time-limited in previous versions. Hence **not** a complete unconstrained historical-suite pass.
- **Python original-source and ingestion test suites:** 47 + 21 = 68 passed.
- No new dependency added to package. `npm run build` passed.
- `PHASE128-RELEASE-VERIFICATION.json` provides exact checked and unchecked claims.
