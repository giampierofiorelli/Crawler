# Product Evidence Engine — Phase 105
## Revision-safe, incrementally invalidated knowledge dependencies

**Date:** 11 October 2026  
**Version:** v4.29 research-only cumulative extension of v4.28 Phase104  
**State:** Implemented; 12 new controlled tests passed; full regression suite separately completed. No real review article is scraped in this phase. No consumer recommendation has been approved by this new subsystem.

## Design decision

The product entities developed in Phases101–104 must *change their derived beliefs when relevant evidence changes* without re-reading the original review or recomputing unrelated comparisons. This phase establishes an explicitly registered, durable dependency graph for derived product comparisons, personalized trade-offs and explanations. It **does not** add a second source-of-truth for professional observations, perform sentiment-to-score conversion, infer a product winner, or treat entities as sentient.

**Authoritative pipeline:**

1. Phase101 holds normalized, reviewed, active observations and withdrawals, retaining provenance and source locators (not full article text).
2. Phase102 checks the exact product, criterion and use-context scope of reusable interpretations.
3. Phase103 describes within-criterion convergence and incompatibility across original independent tests.
4. Phase104 produces derived epistemic states and a global append-only SHA-256-linked event history when its entity snapshots change.
5. **Phase105**, newly implemented, consumes that ordered history with a durable `(sequence, eventHash)` checkpoint, identifies exactly which registered downstream computations depend on the changed belief, and marks them `needs_recomputation` in one SQLite transaction.
6. External, separately validated computation can supply a digest of a newly generated result. Phase105 stores this as `computed_unverified`, **never** as authorization to rank or publish. The Phase104 journal must be fully consumed and declared upstream dependencies recomputed before acknowledgement.

A product's **strengths and weaknesses, including expert-written qualitative observations**, continue to enter personalization via Phases96–100, not via an arbitrary Phase105 consensus or reputation score. A tolerable shortcoming contributes a negative criterion value in the context requested; veto applies only to independently substantiated failure of an *explicitly non-negotiable* user requirement. Phase105 is the dependency-refresh mechanism for such calculations, not the value-calibration algorithm.

## Modules and contracts implemented

- `src/phase104_entity_cognition.ts` now exposes `journalPage(afterSequence, afterHash, limit)`. It verifies the global history and the checkpoint, returns contiguous events in order and reports whether more are available. Checkpoints refuse an altered, truncated or replaced history.
- `src/phase105_incremental_reasoning_graph.ts` adds `IncrementalReasoningGraph105` with immutable registered definitions. Dependency sources are exact belief cells (`category, variant, criterion, frame`) or other pre-existing derived nodes. New nodes may only depend on already existing nodes, preventing cycles. Duplicate dependencies, unknown references and cross-category references fail closed.
- The graph's SQLite schema stores projection definitions, reverse-dependency edges, current dirty/computed-unverified status, durable journal checkpoint and append-only invalidation entries. Replay of a page of source events and update of the graph checkpoint is atomic within this graph store. A repeated poll is idempotent.
- `acknowledgeComputed` requires that all journal events have been consumed and all derived dependencies be recomputed. Its digest only represents a *reported cache output*, not verified correctness or permission to publish.
- `tests/phase105_incremental_reasoning_graph.test.ts`: twelve tests covering selective invalidation, repeated replay, evidence withdrawal and conflict, stale-computation rejection, dependency order, pagination, crash-safe persistence, journal mismatch, invalid definitions, globally ordered multi-entity events, append-only history and no LLM/source text/price/ranking shortcut.
- `examples/phase105-dependency-demo.ts`, run as a constructed demonstration in `audit/phase105/constructed-incremental-propagation.json`.

### Constructed five-event demonstration

Two fictional vacuum cleaners have noise and ergonomics belief cells. Four derived nodes are registered: `noise_comparison`, `ergonomics_comparison`, `overall_tradeoff` (depends on both), and `tradeoff_explanation` (depends on overall trade-off). The first four events initialize the belief cells. After a fully observed checkpoint, one new reviewer descriptor changes the noise cell for product Alpha. Phase105 reads **one** new event and invalidates precisely:

`noise_comparison -> overall_tradeoff -> tradeoff_explanation`.

`ergonomics_comparison` remains `computed_unverified`, which means *unchanged cached research computation*, not proven correct. It is not recomputed, and no LLM call, article replay or numerical sentiment conversion occurs. Total phase105 LLM calls: **zero**.

## Scientific and engineering references

1. **Johan de Kleer (1986), *An assumption-based TMS*.** Motivates recording logical assumptions and justifications so conclusions can be revisited in the presence of conflicting information. Our graph implements only a conservative subset (registered dependencies and invalidation), **not ATMS labels, nogoods, or a complete default-logic solver**. https://doi.org/10.1016/0004-3702(86)90080-9
2. **W3C PROV-O, W3C Recommendation (2013).** Specifies how to relate derived entities, revisions and invalidations to their provenance. Phase105's event pointers and evidence keys are analogous structures, **not a claim of PROV ontology conformance**. https://www.w3.org/TR/prov-o/
3. **McSherry, Murray, Isaacs & Isard (2013), *Differential Dataflow*.** Formalizes efficient incremental computation for changing data and iterative analyses. Our simple reverse-dependency invalidator **is not Differential Dataflow** and does not implement incremental arithmetic updates or iterative query plans. https://www.microsoft.com/en-us/research/publication/differential-dataflow/
4. **PostgreSQL community documentation, *Incremental View Maintenance*.** Distinguishes updating the affected subset from full materialized-view refresh. Useful architectural analogy, not a performance benchmark or an implementation of pg_ivm. https://wiki.postgresql.org/wiki/Incremental_View_Maintenance
5. **Materialize Documentation, *Arrangements*.** Describes indexed state for incremental view maintenance and how updates propagate through dataflows. Useful to evaluate future scaling, not a recommendation to migrate to a particular commercial service. https://materialize.com/docs/fundamentals/concepts/arrangements/
6. **UK Intellectual Property Office, *Exceptions to copyright*.** UK text/data mining exception described for *non-commercial research*, subject to lawful access and other conditions. Consequently a public review page and an original downstream judgement **do not themselves establish commercial automatic-ingestion rights**. This is an isolated acquisition-policy question; it does not change the independence of our analysis. https://www.gov.uk/guidance/exceptions-to-copyright

## Verified tests and artifact continuity

Run on the supplied v4.28 full source tree extended to v4.29:

| Suite | Completed / passed |
|---|---:|
| JavaScript/TypeScript compiled, five bounded shards | 811 / 811 |
| Python original primary sources | 47 / 47 |
| Python ingestion | 21 / 21 |
| Python evaluation | 26 / 26 |
| Companion Python | 60 / 60 |
| Companion Node | 16 / 16 |
| Launch checks | 4 / 4 |
| Release checks | 3 / 3 |
| **Total distinct completed tests** | **988 / 988** |
| **New Phase105 tests (included in JS total)** | **12 / 12** |

The source was compiled successfully with the repository's TypeScript compiler. The ZIP integrity is checked separately in the release manifest. All pre-existing files were retained; the Phase104 journal module, `package.json` and README have deliberate, localized changes. See `audit/phase105/` and `PHASE105-RELEASE-VERIFICATION.json`.

## Important incomplete work — no overclaim

1. **Cross-database atomicity:** Phase101, Phase104, and Phase105 use different SQLite stores. A checkpoint-based replay makes downstream updates recoverable, but there is not yet a single ACID transaction spanning all three databases. A crash or new evidence between Phase104 and Phase105 may leave derived nodes momentarily stale until replay; production serving must check freshness and block stale results. The `acknowledgeComputed` upstream check is not a cross-database transaction or defense against a concurrent update immediately afterward.
2. **No built-in verified recomputation:** Nodes are invalidated and dependencies traversed; the comparison/ranking/explanation evaluators are not yet wired as a durable worker that recomputes real results and proves methodological eligibility. `computed_unverified` is expressly not an approved value or a publishable conclusion.
3. **Authenticated governance:** SHA-256 and append-only SQLite triggers are useful internal integrity signals, but not authentication, physical tamper resistance, legal chain of custody, or external notarization. Production demands controlled migrations, auth and trusted anchoring.
4. **Incremental scalability:** Registration, replay and reverse-dependency traversal have only been tested on constructed, small graphs. No measured throughput for millions of claims, high fan-out, multiworker contention, concurrent reader isolation, or recovery from arbitrary power loss has been demonstrated.
5. **Coverage and activation:** For a new product or criterion, Phase104 must actually synchronize the corresponding belief snapshot. Phase105 only reacts to emitted events and only to dependencies registered. Missing registrations cannot be inferred by the graph.
6. **Empirical reasoning quality:** We have not established calibration accuracy, uncertainty reliability, reviewer agreement quality, fair treatment of conflicting sources or product recommendation usefulness through independently annotated real professional-review corpora. These remain the core scientific tests.

**Next strongest phase:** design an evaluator registry and replay-safe asynchronous outbox or shared PostgreSQL transaction boundary; recompute derived nodes in dependency order against pinned snapshots; verify provenance and invariants before exposing them as *reviewed* cache results. Set up a controlled corpus with genuine original-test records and independently adjudicated comparisons. Do not use ranking weights or sentiment scores as proxies for evidence certainty.
