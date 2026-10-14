# Product Evidence Engine — Phase 106
## Deterministic, source-pinned knowledge recomputation
**Date:** 11 October 2026  
**Version:** v4.30 (research, not production)  
**Baseline:** Exact complete v4.29 Phase105 repository; all earlier source files preserved.

## What was delivered

Phase105 already knew which conclusions were stale. Phase106 *actually recomputes* two narrowly scoped derived objects using stored expert evidence, records the derivation, and supports a fresh-read check against all upstream stores:

1. **Direct comparison** of **two exact product variants in the same category, criterion and use-context frame**: uses `reasonOverEvidenceFrame102` on the original Phase101 interpreted-claim snapshot, preserving original-test lineage, direct claims, conflicts, equivalent claims and absence of comparison. Does not convert adjectives into decibels or publisher scores, or infer a global ranking from a single pair.
2. **Deterministic explanation** from that recorded pair result: uses a fixed template, retains original-test identifiers, source URLs, test-method references, original claim IDs and the dependency result digest. Does not invent prose about experiments or reliability; no model is invoked.

`src/phase106_recomputation_worker.ts` is the new worker. `src/phase105_incremental_reasoning_graph.ts` now adds the `projection_research_cache` table and stores a payload, evaluator version, SHA-256 digest, exact relevant belief fingerprints and derived-result digests in one **graph-database** transaction. Phase105's old `acknowledgeComputed` remains a separate *unverified-hash-only* mechanism; a legacy checksum is not treated as a valid Phase106 computation.

**No customer ranking is activated.** Phase98–100 weight/value functions remain separate: until such inputs have genuinely reviewed and context-relevant scales, the `personalized_tradeoff` node returns `awaiting_reviewed_evaluator` and stays dirty. A verified execution of computer code is not an experimentally validated product judgement.

## Knowledge-refresh protocol

```text
Phase101 immutable, reviewed, normalized observations
      ↓ fixed-frame snapshot and per-variant evidence fingerprints
Phase104 evidence-derived beliefs + append-only journal
      ↓ replay under persistent checkpoint
Phase105 dependency graph (dirty comparison → dirty explanation)
      ↓ fixed allowlisted evaluators, topological dependency order
Phase106 deterministic pair comparison → explanation
      ↓ compare pinned evidence before/after; atomic graph write
Research-only cache with evaluator, claim IDs, original tests and digests
      ↓ revalidate all three stores on EACH retrieval
Fresh research result, or null/stale; never auto-published
```

Every recomputation first synchronizes the relevant Phase104 beliefs to the current Phase101 snapshot, drains the journal through Phase105, runs the narrow deterministic evaluator, pins per-belief fingerprints, rechecks source changes, and stores the result and its dependency references atomically **inside the Phase105 SQLite file**. The cache is evicted within the same graph transaction when a Phase104 event invalidates its node.

For a query or internal read, `ResearchRecomputation106.readFresh(nodeId)` checks that the Phase104 journal is fully consumed by Phase105, recomputes **metadata fingerprints of structured evidence** from Phase101, compares the pinned fingerprints, checks the cached-result checksum and recursively checks derived inputs. It does **not** retrieve original review text or infer new sentiment. This read-time validation is intentionally conservative and can be costly at scale because Phase101 snapshots scan the relevant frame; a trustworthy transactional revision index is future work.

If source evidence changes *before Phase104 emits its event*, the cache is refused anyway: the Phase101 record digest no longer matches the original Phase104 belief. If an unrelated model changes, the pinned fingerprint of the two products involved does not change, and their comparison remains available. This avoids the earlier possibility of invalidating unrelated products solely because the source frame's global revision changed.

For security, fixed evaluators require the exact reviewed `engineReference` string and compatible node shape. Arbitrary computation identifiers are rejected. The result is `ready_research` only in this limited engineering sense; all records retain `publicationReady=false` and `rankingEligible=false`.

## Constructed demonstration (no real reviews)

- Original test 1: fictional Alpha is quieter than Beta in a stated operation frame. The engine stores `supported_better` and produces a traced explanation.
- Another fictional product Gamma gains an unrelated noise descriptor. The original Alpha/Beta comparison remains fresh.
- Original test 2 asserts the reverse Alpha/Beta comparison in the same frame. The previously cached explanation becomes unavailable immediately; the worker synchronizes new evidence, invalidates comparison and explanation, and recomputes both to `contested`.
- Both results retain distinct original-test and claim IDs. No majority vote, mean score, guessed decibel measurement or product winner is produced.

Run: `node dist/examples/phase106-recomputation-demo.js audit/phase106/constructed-recomputation.json`.

## Observed verification

| Tests | Passed |
|---|---:|
| Compiled TypeScript/JavaScript (5 completed shards) | **827/827** |
| Primary-source Python | **47/47** |
| Ingestion Python | **21/21** |
| Phase83–84 evaluation Python | **26/26** |
| Companion Python | **60/60** |
| Companion Node | **16/16** |
| Launch artefact checks | **4/4** |
| Release artefact checks | **3/3** |
| **Total distinct completed tests** | **1,004/1,004** |

**New Phase106 cases: 16**, included in the compiled JavaScript total. They verify direct comparison, dependent explanation, contradictory primary tests, withdrawals, persistence through restart, unchanged unrelated evidence, pre-journal stale-read refusal, legacy unverified hash rejection, tampering detection, invalid evaluator blocking, review-gated trade-off, missing comparisons, changed evidence during computation and dependency digest checks.

Log files are under `audit/phase106/logs`. Tests are local deterministic software tests. No real professional-review corpus was acquired in this phase and no commercial source-rights decision is asserted.

## Research basis, what it supports, and limits

1. **de Kleer, J. (1986), *An assumption-based TMS*.** Research foundation for maintaining justifications and revising conclusions on new premises; we implement dependency-triggered recomputation, *not a general ATMS or default logic solver*. https://doi.org/10.1016/0004-3702(86)90080-9
2. **McSherry, F., Murray, D., Isaacs, R., Isard, M. (2013), *Differential Dataflow*.** Demonstrates incrementally maintained computations on evolving inputs; our selective directed graph and fixed evaluators do not implement Differential Dataflow or its performance guarantees. https://www.microsoft.com/en-us/research/publication/differential-dataflow/
3. **W3C PROV Constraints (2013)** describes event ordering among generation, usage, derivation and invalidation. The Phase101→Phase106 provenance chain is an engineering adaptation, not formal PROV compliance. https://www.w3.org/TR/prov-constraints/
4. **SQLite isolation documentation.** Explains transactional isolation, WAL snapshot isolation and serialised writers. Graph result and invalidation are committed atomically *within one SQLite database*; different Phase101/104/105 files remain separate transactions. https://www.sqlite.org/isolation.html
5. **SQLite WAL documentation.** Explicitly warns that transactions involving multiple attached databases are atomic per database, not globally atomic as a set. The Phase106 fresh-read protocol is *not* a substitute for a shared ACID transaction. https://www.sqlite.org/wal.html
6. **Chris Richardson, *Transactional Outbox*.** Reliable relay should write messages as part of the producer's transaction; our journal and checkpoint replay resembles reliable projection processing, but it is not a complete cross-store outbox integration. https://microservices.io/patterns/data/transactional-outbox.html
7. **PostgreSQL documentation, `REFRESH MATERIALIZED VIEW`.** Distinguishes persisted computed views and their refresh semantics; Phase106's cache is narrower, source-pinned and stores only specific derivations. https://www.postgresql.org/docs/current/sql-refreshmaterializedview.html

## Open issues that cannot be advertised as solved

- **Multi-store race:** The three authoritative stores do not share one transaction. The worker checks freshness before and after commits, and reads check again, but a concurrent writer may still commit immediately after a check. Production requires transactionally consistent revision tokens, trusted isolation, or a shared storage boundary.
- **Retrieval costs:** `readFresh` currently rebuilds a structured Phase101 frame snapshot to verify fingerprints. This does not reread articles or call LLMs but is not O(1). A revision index or shared Postgres backend needs data-quality testing and concurrency benchmarks.
- **Verifier authority:** Phase101's assessor fields/receipts are inputs to the prototype, not proof of independent assessor identity or signed licensed evidence. A malicious process able to write the graph database could forge a computation; SHA-256 is not an authenticated signature. A fixed evaluator string alone is not governance.
- **Algorithm scope:** Implemented only same-context direct pair comparison and conservative explanations. Missing comparisons remain unknown, cross-protocol measurements are never merged, and no MACBETH/Rasch/Bradley–Terry/ranking is implemented by this phase.
- **Ranking integration:** Phase98–100 personalized trade-offs must be wired using real calibrated scales and preferences, independently validated as fair to the particular user's needs; absent values are not zero, low confidence is not a negative product score, and an ordinary defect is not an automatic veto.
- **Empirical quality:** No held-out authentic corpus, blinded adjudication, false-positive/false-negative rates, latency at scale, or real model test. The source-reuse/licensing checks remain separate acquisition responsibilities.

## Next empirical and architectural steps

1. Create an exact-variant, independently labelled benchmark spanning professional original reviews, explicit methods, qualitative claims, single-product and head-to-head test data, changed corrections, republications and conflicting evidence. Evaluate factual/attribution precision, missed claims, misleading comparisons, and time to reconcile.
2. Introduce an authoritative monotonic *per-belief* revision receipt and transactionally consistent source-journal/outbox. Test concurrent source changes, multiple workers, process termination and crashes after the graph commit.
3. Implement a reviewed registry of genuinely calibrated criterion-value functions for Phase98–100. Only after that wire conditional personalized trade-off projections, with human-verifiable explanations and abstention where weights or evidence are insufficient.
4. Study incremental performance using varied graph fan-out and update rates; compare recompute costs to full refresh instead of assuming a speed improvement from constructed tests.
