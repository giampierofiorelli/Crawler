# Phase 73 — Category Cognition, cold start and preventive research
**Product Evidence Engine v4.1.0 · 10 October 2026 · research only**

## Architectural verdict

Treat the proposed "brain" as a **coordinated capability network** over a durable, versioned knowledge store, not a collection of LLMs acting as databases. One small model (or future ensemble where measured value justifies it) may suggest candidate classifications and dimensions, but specialist services own validation, methods, licensing, provenance, schema change, scheduling and decisions. All modules refer to the same immutable evidence identities. Multiple LLM calls are a possible implementation of specialized reasoning, not a prerequisite.

An ordinary relational store is appropriate as the transactional system of record. A category-aware, versioned ontology / evidence graph offers the adaptive layer. Relational tables, typed JSONB criteria, directed evidence relations and event/audit records can coexist; no automatic ALTER TABLE after each novel field is necessary. Retrieval indexes or vector search may later help discover candidates, but cannot substitute for exact measurements, provenance or validation.

The project has *two different learning problems*:

1. **Within-category growth** (Phases 70–72): propose novel field/relation, test independent evidence, promote a reviewed immutable registry version, and backfill gaps.
2. **New-category growth** (Phase 73): detect genuinely unknown category, investigate user purposes/failure modes and measurement conventions, construct a provisional category blueprint, then activate an initial reviewed research schema. The initial blueprint is not already a scored comparison model.

## Scenario A: an unknown product category

A first request mentions `dehumidifiers`, absent from the reviewed catalog.

1. Deterministic identity matching checks only canonical names and registered aliases. No uncertain nearest-neighbour guess silently maps it to `air purifiers` or `fans`.
2. It creates a `provisional_dehumidifiers` *research workspace*, without pretending that this is a production category or that measurements already exist.
3. The coordinator queues category identity/boundaries, users' actual purposes, risks/failure modes, product variants, independent source landscape, licence and web access checks, test protocols, candidate dimensions and provenance/independence review. It cannot access the web from this plan alone.
4. Before any tests exist, `createCategoryInvestigationDossier` can already collect **typed research questions** about needs, failure modes, variant boundaries and methods. It may attach candidate field definitions as explicitly unverified hypotheses. These are not evidence and cannot become ranking attributes merely because a question was asked. The eight baseline research axes ensure the initial category investigation looks beyond a narrow specification sheet.
5. Only approved web ingestion (Phases 68–72) can provide source-attested structured signals. A proposal might be a precisely defined measurable criterion with units, conditions and test methods. This is a **hypothesis** until evidence supports it. A short-list of possible domain criteria should be researched and not simply invented as if validated.
6. One test does not open a field automatically. The reference *research threshold* implemented here requires multiple original tests, multiple sources and multiple variants. This is an engineering safeguard, **not a scientific guarantee of evidential validity or a universal minimum**; methods may be incompatible even after crossing it.
7. Semantically incompatible definitions (for instance capacity measured under different assumptions, or inconsistent units) generate conflicts, not silent average values.
8. After the whole initial category research process is externally verified, an authenticated reviewer may promote chosen hypotheses into **version 1 of a research registry** under a new canonical ID. The provisional workspace remains a traceable predecessor. Publication and ranking remain disabled.
9. Only separate methodological, product identity, legal and recommendation quality processes can make this category suitable for real recommendations.

## Scenario B: an already-known category

For an established and reviewed category, the coordinator skips discovery from zero. It checks *coverage* and *freshness*, then plans selective field backfill or changed-category monitoring. For a category recorded in the catalog but still under research, it continues the cold-start workflow rather than treating the existence of a record as proof of maturity.

## Proactive work

`planPreventiveCategoryWork` accepts recorded, structured and dated gaps: stale evidence, missing coverage, a method change or a category change. It deduplicates and bounds work by an explicit task budget and does **not** make web requests, assign invented confidence or endlessly rescan sites. Proactive tasks can later be ranked by verified decision relevance, risk, recency and available budget; no unvalidated numerical priority score is used today.

Potential future scheduled work includes: expanding sources after a new independent test appears, retiring discontinued variants, reviewing drift in test methods, identifying emerging subcategories and tracking new user problems. They are *design goals*, not implemented automatic jobs.

## Specialized capabilities and shared memory

| Capability | Research input | Durable output (after validation) |
|---|---|---|
| Category identification | User's category label and reviewed aliases | Canonical category or unreviewed workspace |
| User needs and risk discovery | Target use cases and independently sourced needs | Structured needs, hazards, priority questions |
| Method specialist | Test protocols, units, comparability conditions | Controlled field definitions and comparability constraints |
| Source and rights specialist | Candidate URLs, site terms, rights records and lineage | Accessible-source decisions, rights and audit references |
| Evidence specialist | Approved transient read and anchored facts | Quarantined measurements/assessments with source hashes |
| Ontology/schema specialist | Independently supported dimensions and relations | Provisional category blueprint or versioned schema candidate |
| Monitoring specialist | Recorded missing coverage, freshness, method change | Bounded research task plan |
| Decision specialist | Independently reviewed category and product evidence | Future context-specific recommendations (NOT wired in Phase 73) |

The capabilities exchange typed records via one coordinator; this is **not** evidence that independently trained LLMs communicate or that a self-modifying model exists.

## Implemented in Phase 73

- `src/category_cognitive_mesh.ts`: bounded exact-match category identity routing; safe unknown category workspaces; 11-stage dependency-ordered bootstrap plan; reviewed-category research/freshness plan; externally attested completion receipts with structural dependency checks; cross-category *research-only* criterion hypotheses checked against Phase 72 rights, anchoring and provenance metadata; original-test/source/variant deduplication; semantic conflict detection; human-reviewed initial category schema; bounded preventive work plan.
- `tests/category_cognitive_mesh.test.ts`: cold start, known-category reuse, ambiguous aliases, unsafe identifiers, dependency gates, rights failure, fake anchors, source identity mismatch, questions before any tests, multiple tests for one source, duplicate rows, conflicting definitions, validated schema promotion, mandatory upstream review, preventive work and incomplete-category restrictions.
- `db/migrations/008_category_cognitive_workspace.sql`: research-only category workspaces, preliminary research questions, capability tasks, criterion proposals and source provenance. Schema is drafted, **not executed** against PostgreSQL, and no transactional persistence driver is wired.
- `scripts/demo-phase73.mjs`: fully offline demonstration showing category routing and task plans; it makes zero web/model/database calls.
- `package.json`: updated to 4.1.0 with Phase 73 demo and targeted tests; `src/index.ts` exports the new module.

## Hard boundaries and security notes

- A `completionReceipts` entry is an **assertion**, not cryptographic proof of completion; actual workflows must authenticate reviewers, authorize each capability and verify evidence. The demo uses a manually supplied example receipt.
- Proposal checks rely on operation-specific source policy attestations and the existing quarantined processing result. They do not retroactively authorize scraping, remote AI transfer or copyright-restricted reuse.
- Source independence relies on editorially attested original-test IDs. Different source labels alone are insufficient proof of scientifically independent tests; later adjudication is required.
- The database prevents many illegal states using types/check constraints, but it does not yet enforce authenticated write permissions, recursive JSONB content screening, rights revocation, verified workflow execution, or complete provenance joins. SQL migrations have not been exercised in a real PostgreSQL server.
- The approved-source reader was previously tested on mocked HTTP responses. The Phase 73 implementation adds **no live acquisition and no real LLM integration**.
- Specialized AI actors must not edit the active category registry, legal source allowlist or commercial ranking rules by issuing ordinary text suggestions.

## Source standards and methods (architectural inspiration, not validation of this implementation)

- W3C, SHACL: https://www.w3.org/TR/shacl/ — constraint checking for evolving graph schemas.
- W3C, PROV-O: https://www.w3.org/TR/prov-o/ — provenance of entities, activities and agents.
- Schema.org, Product: https://schema.org/Product and `additionalProperty`: https://schema.org/additionalProperty — variable product specifications.
- PostgreSQL, JSON types: https://www.postgresql.org/docs/current/datatype-json.html — flexible typed records in a transactional store.
- PostgreSQL, constraints: https://www.postgresql.org/docs/current/ddl-constraints.html — integrity checks for durable records.
- Existing original/rights example: https://github.com/superbestaudiofriends/headphone-measurements-frequency-response — earlier pilot data source, not a discovery result of this phase.

## Recommended next phase: Phase 74

1. Implement persistent category workspaces and a trusted execution ledger with authenticated reviewers, tested migration and rollback.
2. Implement an actual bounded category classifier / hypothesis generator in a network-isolated model adapter, calibrated against a manually labelled suite of known, ambiguous and unseen product labels.
3. Wire the coordinator to allowed source discovery and capture, with rights and test-method provenance checked per operation and no paywall/block bypass.
4. Benchmark unknown-category bootstrap accuracy against human-designed schemas, measuring important omitted criteria, spurious criteria, variant errors, test independence errors and method incompatibilities.
5. Only then enable budgeted preventive scheduling and evaluate whether specialist LLM models improve this compared with one shared model plus deterministic validators.
