# Phase 71 — Autonomous adaptive category ontology (RESEARCH ONLY)
**Product Evidence Engine v3.9.0 — 10 October 2026**

## User requirement and decision
The system must be able to recognise when its representation is inadequate. It should grow by learning *what questions matter* and *what measurements, properties and relationships are needed*, rather than relying on a frozen universal spreadsheet. Do this incrementally, without silently rewriting existing facts or permitting an AI to fabricate a performance rating. Continue with web-first, licence-checked acquisition; APIs remain optional.

**Implemented:** a version-aware adaptive research ontology in `src/adaptive_schema_evolution.ts`; an isolated automatic research catalog for fields and graph relationships; anchored gap evidence intake; contradiction detection; original-test deduplication; human-reviewed additive field promotion to new immutable registry version; targeted field backfill plans; historical schema-compatible reads; privacy-preserving anonymised need prioritisation; PostgreSQL research persistence DDL (`db/migrations/006_adaptive_schema_research.sql`).

**Not implemented:** live source discovery, successful live web retrieval in this phase, LLM extraction calibrated against original reviews, automatic DB execution/persistence adapter, scheduled refresh, legal rights authentication, authenticated editor workflow, model accuracy validation, production ranking of these new fields. `readApprovedSource()` from phase 69 still returns quarantined hashes without a real extraction engine. Phase 71 adds no crawler and calls no third-party API.

## Adaptive representation (four layers)
1. **Core identity and provenance:** stable product, *exact variant*, version, publisher, original test, dated permissions. Not mutable by model proposals.
2. **Typed category dimensions:** numeric + exact units, controlled qualitative judgments, booleans; every observation has method and use-case context. Immutable category registry versions support safe additions without altering old data.
3. **Typed knowledge graph:** contextual `compatible_with`, `incompatible_with`, `requires`, `tested_with`, `has_accessory` links support complex relations that do not belong in one scalar cell. Edges remain research-quarantined; a relation is never converted into a star rating.
4. **Derived reasoning and coverage:** existing `derived_evidence_hypothesis` is separate from observed facts. Phase 71 can recognise gaps and plan new source searches. Research hypotheses are neither product facts nor eligible for recommendations.

## Fully automatic versus reviewed steps
```
An unmet user need (hash + controlled scenario, no raw question)
       |
       +--> prioritise research for an absent dimension (does not prove a fact)
       |
Authorized transient source analysis (upstream; not live connected yet)
       |
       v
Anchored gap signal: exact variant, origin, original test, source, hashes,
  rights/robots/terms attestations, proposed controlled definition
       |
       v
Deduplicate original tests; compare type/unit/context/relation semantics
       |
       +-- conflict/inadequate support --> research backlog
       |
       +-- at least 2 distinct original tests, 2 sources, 2 variants
                               |
                               v
               AUTO-GROW research schema sandbox
                   (new typed field or graph relation)
                               |
              +----------------+----------------+
              |                                 |
       Missing-field research planning      human-method & provenance review
       (NO automatic permission to crawl)               |
                                     optional audited field promotion
                                        to schema version N+1
                                        (never overwrites N)
```
**Important:** test IDs / source rights currently arrive through metadata attestations, not independently authenticated proof. A malicious caller could forge them. The threshold is only a conservative *candidate discovery heuristic*, not an empirical confidence level or production permission. All new source observations and graph edges remain quarantined; promotion requires an out-of-band authenticated human approval process in production. Relational promotion is NOT yet implemented; only research graph storage is.

## Concrete examples (invented — software verification, NOT product evidence)
A headphone research category has `battery_runtime` as a numeric measure in `hours` with a specified ANC state. The system discovers that users repeatedly care about understanding speech in an office. With two distinct original tests, publishers and product variants, a controlled `speech_intelligibility_with_anc` field (`poor|fair|good`, `environment` and `noise_type`) can automatically enter the research catalog. A separate `headset_works_with_console` compatibility relationship is representable as a typed contextual edge. Neither becomes an invented 8/10 rating.

If one source reports a field in `decibels` and another reports a qualitative judgment with the same proposed key, the definitions conflict. No averaging or conversion is performed. The system cannot silently redefine `battery_runtime` from `hours` to `minutes`, nor can it add uncontrolled units or field names to an approved schema.

When a reviewer explicitly approves an additive new field, registry v1 remains unchanged and registry v2 includes the addition. Phase 71's compatibility read selects old observations only when the *entire* field definition remains identical. This preserves comparability without backfilling invented values. Research backfill tasks target only new fields absent for a variant; tasks confer no permission to access the web.

## Database design / safeguards
Migration 006 is ADDITIVE to migration 005 and still UNEXECUTED against PostgreSQL. `adaptive_schema_proposal` stores controlled schema proposals only; `adaptive_schema_signal` records bounded independent evidence support and its rights-grant reference; `adaptive_schema_promotion_review` stores auditable decisions; `structured_evidence_relation` stores context-specific graph edges. All added candidate / edge records have SQL-level `publication_ready=FALSE` and `ranking_eligible=FALSE`. Production rights and integrity constraints need further strengthening, including publisher–grant consistency, attestation authentication, retention limits, revocation propagation, and permissions that prevent unreviewed direct SQL inserts.

**No original article bodies, passages, prompts, embeddings, or AI prose** are needed or intentionally present in the new application data structures. Storing structured facts does not establish lawful access, reuse or mining. Upstream rights review remains mandatory. Raw source text should remain transient and be discarded after authorised analysis, without creating permanent content archives.

## Tests run in this phase
- TypeScript compilation with locally available Node type definitions (no network-installed dependencies).
- JavaScript test suite (404 passing, including 12 adaptive tests; constructed fixtures only).
- Python primary source tests (47 passing); Python ingestion tests (21 passing).
- Existing launch tests run separately. See `audit/phase71` for saved logs and outcomes.
- SQL migration checked structurally only; no PostgreSQL instance was available to exercise DDL / real transaction behaviour.
- No live fetching, lab validation or human test annotations.

## References (official documentation)
- PostgreSQL 15 JSONB indexed data and operators: https://www.postgresql.org/docs/15/datatype-json.html
- PostgreSQL ALTER TABLE and migration behaviour: https://www.postgresql.org/docs/current/sql-altertable.html
- W3C PROV Data Model (provenance of entities, activities, agents): https://www.w3.org/TR/prov-dm/
- W3C PROV-O ontology: https://www.w3.org/TR/prov-o/
- UK CDPA section 29A: https://www.legislation.gov.uk/ukpga/1988/48/section/29A
- EU DSM Directive 2019/790 Article 4: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019L0790

## Next gated engineering task
Integrate lawful, limited real-web acquisition (starting from a first-party/open-licensed dataset), extract category facts on an ephemeral buffer, produce grounded anchors and schema gap signals, and compare against *human-labelled data* for factual/method accuracy. Then add a PostgreSQL transaction repository with immutable registry snapshots, authenticated review, revocation propagation and selective refresh jobs. Do not claim that syntactic source anchoring proves interpretation accuracy.
