# Product Evidence Engine — Phase 74
## Bounded capability execution and unknown-category intake
**Version:** 4.2.0  
**Date:** 10 October 2026  
**Status:** Implemented, compiled and tested OFFLINE. No external research service or database is connected.

### Purpose
Phase 73 could plan the tasks for a previously unseen product category but could not execute them. Phase 74 introduces two independent, auditable execution boundaries:

1. `executeCategoryResearchCycle`: evaluates the dependency plan, calls only configured local capability workers for currently ready tasks, collects URL/hash-based references and structured research questions, and produces an **unreviewed category dossier**. No self-certified completion receipts are generated. Repeated jobs can be withheld using `pendingTaskIds` until an independent reviewer handles them.
2. `executeColdStartEvidenceStage`: gates actual source acquisition on ALL prerequisite research completion receipts. Once ready, `acquireColdStartCategoryEvidence` invokes the prior rights/robots-gated HTTPS reader and a local ephemeral interpreter. It then generates structured `CategoryCriterionSignal`s and a provisional `CategoryBlueprint`. Two independently attested original tests and variants may create a *research* criterion candidate, not approval or production ranking.

This answers the "new category" problem: the system can first build an investigation plan, execute bounded preliminary research, record missing dimensions, and eventually suggest a category schema, **without assuming that the first product it sees defines the entire category**.

### Integration contract and what has not been done
- **All `LocalCapabilityWorker` and `LocalSemanticAdapter` implementations are injected.** The demo and tests use local synthetic workers and simulated HTTP responses. No actual general-purpose LLM, third-party search service or AI model was called.
- **No database writes take place.** `009_category_research_execution.sql` is a proposed additive migration, not an applied production migration.
- **No real public web-page download was performed in Phase 74.** The HTTPS transport from Phase 69 remains available but requires externally attested policies and live access.
- Source policies, claimed original-test independence, and completion receipts are still plain input objects. In deployment they MUST be issued and verified by an authenticated, permissioned, audited service, not trusted merely because the objects contain reviewer names.
- A local model promise alone is NOT proof that an adapter cannot transfer source text to remote systems. Implementations must be vetted for actual outbound traffic, logging, telemetry, model loading, and retention. The executor neither grants remote transfer nor stores raw source bytes.
- A single review, however many facts extracted, does not count as multiple independent tests. The blueprint preserves semantic conflicts and always remains unreviewed.
- `robots.txt` checks are technical crawling checks separate from copyright and contractual rights. The policy gate is not a legal opinion about every website.
- The research execution journal stores references and digests, not articles, but acquisition and database rights still require legal analysis.

### New modules
- `src/category_research_execution.ts`: execution scheduler with dependency review, worker result sanitization, pending task idempotency, and cold-start intake gating.
- `src/category_cold_start_intake.ts`: source-scoped transient interpretation of unknown categories, rights checks, exact-variant and original-test provenance, structured signals, provisional blueprint.
- `src/phase72_semantic_intake.ts`: exports its original passage/numeric binding validator for reuse by the cold-start path.
- `src/web_evidence_acquisition.ts`: precise handling of short literal numeric values (e.g. `14`), with token-boundary checks, while retaining support for earlier paraphrased qualitative assessments.
- `db/migrations/009_category_research_execution.sql`: proposed tables for task execution metadata, source-reference digests and quarantined intake runs. No text archive.
- `tests/category_research_execution.test.ts`: synthetic data; includes unknown category routing, worker execution, prerequisite gating, two-source extraction, duplicate-test suppression, fake numbers, absent rights, malformed evidence, idempotency and conflicting definitions.

### Development sequence and next real-world milestones
1. Integrate a genuinely local AI or deterministic extraction adapter and a clearly licensed source-discovery adapter. Log hashes and structured evidence, not source bodies. Benchmark extraction against blind human annotation before relying on it.
2. Implement an **authenticated reviewer service** for source grants, provenance attestations, category research receipts and schema promotions, with role permissions and audit signatures. The current supplied receipt objects are not cryptographically or independently authenticated.
3. Test `restrictedHttpsTransport` against an *actually authorized* public resource and verify permissions, robots behavior, server rate limits, and parsing. The previous SBAF repository is a candidate source but its rights/terms must be rechecked for the specific retrieval method.
4. Apply and roll back the migrations on a disposable PostgreSQL instance, then implement transactional idempotent writes. Test against concurrent tasks, duplicate original-test IDs, version changes, and partial failures.
5. Measure cold-start category coverage and precision: missed user outcomes, incompatible metrics, false new fields, incorrect product variants, spurious source independence and unsafe conclusions. Treat these as empirical gates before public recommendations.
6. Add a scheduled, budget-limited proactive queue for known categories, using explicit staleness and coverage gaps. Do not trigger broad crawling or self-review from the research workers themselves.

### Public reference for exemplar open measurements
- Original repository: https://github.com/superbestaudiofriends/headphone-measurements-frequency-response
- The present Phase 74 tests intentionally use synthetic dehumidifier examples; their `.org.uk` lab names, source permissions and analyst receipts are fictional fixtures, not endorsements, licenses, or evidence of an actual study.
