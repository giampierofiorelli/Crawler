# Product Evidence Engine — Phase 129: closing the research-to-category-memory loop

**Date:** 11 October 2026. **Version:** 4.53-phase129. **Status:** working, bounded research and schema-growth prototype. No production end-to-end web research, independent category classification or commercial product ranking has been validated.

## Design finding

The earlier system had a real discontinuity: Phase73/74 planned and, with supplied local workers, performed new-category research; Phase128 represented reviewed domain concepts and produced Phase125/127 dialogue schemas. Between them there was no first-class transaction that could check an observation's original document identity, literal text anchoring, independent review, category snapshot revision and subsequent query projection.

Phase129 makes that relationship executable **without adding a hosted search API, third-party agent, new LLM or second canonical product database**. It reuses Phase73/74 research planning/execution and Phase128 ontology review/compilation. Every new observation remains an untrusted proposal until review. The software handles *process integrity*; it does not authenticate the text itself or replace expert adjudication.

## Scientific and technical sources (direct URLs)

1. **W3C PROV-O (2013)** specifies representations for entities, activities, responsible agents and derivations. It supports separate links between original documents, proposed observations and reviewed claims. The Phase129 TS structures are provenance-inspired and **not an implementation of PROV-O/RDF**. https://www.w3.org/TR/prov-o/
2. **W3C PROV-AQ (2013)** explicitly cautions that provenance records themselves are not automatically trustworthy; this motivates identity/authentication as a separate gate. https://www.w3.org/TR/prov-aq/
3. **Zablith et al., *Ontology evolution: a process-centric survey* (2015 journal volume, online 2013)** treats ontology evolution as an end-to-end multi-stage process, not a single insertion operation. https://doi.org/10.1017/S0269888913000349
4. **W3C SHACL (2017)** describes constraint-based validation for RDF graphs. The bounded TypeScript validators in this project serve a comparable *purpose* but **are not SHACL-conformant**. https://www.w3.org/TR/shacl/
5. **EPA, *Guide to Air Cleaners in the Home*** distinguishes particulate CADR (clean-air delivery rate), appropriate room sizes and gas filtration. CADR relates to particles, not a universal measure of odor or gas removal. This was the independent reference for the category example below. https://www.epa.gov/indoor-air-quality-iaq/guide-air-cleaners-home
6. **AHAM Verifide, *Air Filtration Standards*** explains pollutant-specific CADR (smoke, pollen, dust), independent verification and room-sizing guidance. Its test program is not proof that a particular arbitrary model has a measured value unless that model's listing is checked. https://ahamverifide.org/ahams-air-filtration-standards/
7. **Chhetri et al. (2025), *Bridging the Scientific Knowledge Gap and Reproducibility*** surveys evidence, assertion and provenance ontologies, supporting explicit evidence attribution rather than undifferentiated statements. https://doi.org/10.1145/3701716.3715483

### Interpretation of the science

The evidence above supports the decision to keep a versioned ontology, grounded source spans, staged hypotheses, review and deterministic recomputation. **It does not prove** that our extractor is an adequate automatic scientific reader, that a knowledge graph alone solves open-domain language understanding, or that new product categories can safely be approved without independent evaluation.

## Implemented code

`src/phase129_category_growth_cycle.ts`:

- `investigateCategory129`: executes the existing Phase74 category capability plan through *caller-provided local workers*. Unknown categories go through the same dependency stages as before. It does not fabricate completed research receipts.
- `bootstrapReviewedCategory129`: requires a complete existing Phase73 cold-start research chain plus a trusted caller authenticating *every* completion receipt. Creates a reviewed **empty category identity**, without inventing product functions or quality benchmarks. The returned transaction is not persisted automatically.
- `nativeMeasurementNameObserver129`: a small **category-agnostic** pattern extractor for explicitly named candidate metrics such as `clean air delivery rate (CADR)`. This is deliberately weak, lexical, English-oriented, and only produces hypotheses. It is not a substitute for semantic reading or source validation.
- `stageCategoryObservations129`: accepts authorized, full-text *supplied* source observations and a local extractor; checks SHA-256 of the supplied text, exact literal offsets and original document identity, source role, boundedness, duplication, timestamps and permission flags; routes concepts into Phase128 quarantine. It does not retain raw article text in its output. The flags are caller assertions, **not** proof of legal permission or authentic retrieval.
- `approveGrowth129`: pins the old category ontology fingerprint, checks the whole batch integrity, requires an externally authenticated review callback, reuses Phase128 promotion checks and returns a new category snapshot. It reports that invalidation is required but does **not** commit an ACID database transaction or dispatch durable dependency jobs.
- `interpretAfterGrowth129`: derives a new language schema from the *same* reviewed ontology using Phase125; it cannot authorize product rankings.

### Actual pilot and its interpretation

A passage from the genuine **EPA air-cleaner guide** was supplied as a fixture and processed locally. The source-specific part was the text provided as input, **not** the extraction rule. The generic extractor discovered the named measurement candidate `Clean Air Delivery Rate (CADR)`, verified its exact substring position in that input and staged the proposal. Before review the live ontology was unchanged. After a simulated trusted review, a new `outcome` concept appeared in the reviewed ontology and the snapshot changed. Neither the metric nor its name became a numerical product test; there is no best-air-cleaner ranking.

In another controlled test, a `task` candidate with an anchored source phrase was approved, after which Phase125 recognized the new task in a query and generated an evidence obligation. **This extractor was supplied by the test**; it is not claimed as a second autonomous open-domain semantic reader. The test proves the bridge works when given a defensible candidate, not that general-purpose candidate discovery is solved.

In one test, an existing Phase74 `local_only` worker submitted a source-reference research record. Phase74 marked it pending independent review and issued **zero** completion receipts. Again, the source reference was passed by a constructed worker, not discovered from the open internet by this phase.

## Critical gaps still open

1. **Live autonomous source discovery/read/extraction:** Phase75 discovery and Phase74 approved-reader components exist, but this phase has not demonstrated a connected live permitted research cycle culminating in reliable new-category semantic evidence. The trusted source transport, robots/rights policy, canonical document records and an empirically evaluated general-purpose local extractor must be joined and tested in a controlled live crawl.
2. **Open-domain semantics:** The lexical acronym observer only recognizes a narrow family of explicit technical names. It does not autonomously identify user problems, causal mechanisms, failure modes, numerical measurements or whether a claimed criterion is necessary. A scientific classification/evaluation corpus is required before upgrading it.
3. **Independent review:** TypeScript callback checks are replaceable integration points; reviewer authentication and authorization must be enforced by a trusted application, not by source content or a fabricated user identifier.
4. **Durable transactional growth:** Category changes and language-cache invalidation are returned as a transaction candidate; ACID persistence, Phase105 dependency wiring and rollback were not implemented or verified in this phase.
5. **Research completeness:** A source-backed concept is not a reviewed quality criterion. Before ranking, independent quality-method research must connect user goals to appropriate measured endpoints, test conditions, thresholds when justified, and real comparable product measurements. Absence of evidence is not a product failure.
6. **Coverage/reliability:** Real untrained new-category discovery precision/recall, multilingual prompts, source misattribution, false promotion and large-scale incremental-operation cost remain unmeasured.

## Suggested next empirical test (Phase130)

Use an authorized first-party source corpus **not used for coding or tuning**, with separate independently adjudicated labels. Start with a new category outside floor robots. Run the actual source acquisition transport and native extraction, record all retrieved and missed essential category concepts, authenticate review decisions and measure precision/recall, reviewer workload, source-attribution failures, and what newly reviewed knowledge does to previously unseen user questions. Compare the full internal approach with a strictly local model only if the observed failure pattern warrants it. Preserve the same original evidence snapshots for that comparison.

## Test accounting

- Phase129 tests: see `PHASE129-RELEASE-VERIFICATION.json` for the final observed counts.
- Regression excludes historic `phase91_watch_gate.test.js` and `phase92_recipe_lifecycle.test.js` due to previous repeated timeouts; does not claim they passed.
- All category examples and permissions in unit tests are controlled fixtures. Original sources were consulted independently for research and linked above; no live category crawl has been performed in this phase.
