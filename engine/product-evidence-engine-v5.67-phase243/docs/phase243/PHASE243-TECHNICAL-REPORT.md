# Product Evidence Engine — Phase 243 technical report

Date: 2026-10-14. Version: **5.67.0**. Parent: verified v5.66.0 Phase242 ZIP.

## Executive implementation verdict

**Implemented a working, deterministically tested and reversible budgeted category-research planner.** It reuses `src/phase80_population_portfolio.ts` rather than replacing the existing original-evidence review, user-scope and publication gates. Added a hash-checked append-only metadata-only local journal. **It does not autonomously scan live websites, authenticate source reviews, decide best products, or learn statistically from actual research outcomes yet.** It makes resource allocation explicit, measurable and tunable once a genuine web ingestion worker supplies reviewed signals.

The first-pass goal is to discover a broad population while paying for cheap checks before deep dives and **postponing** low-promise products. Weak signals affect *research priority* only. A reviewed original independent test documenting a serious problem may pause a general-need deep dive; two independent unverified community concerns may cause a **reversible soft pause only** under `lean_bootstrap`, never a quality verdict. A lone negative report or marketplace-star lead only demotes. Manufacturer features can motivate discovery but not justify performance rankings. Sources syndicated from the same original are deduplicated.

## Code introduced

- `src/phase243_budgeted_category_search.ts` — `planBudgetedCategoryWave243`, `freezeWave243`, `validateSnapshot243`, `evaluatePausedMisses243`. Uses existing Phase80 research-population priority. Explicit per-wave budget in **abstract effort units** and different costs for identity verification, cheap screening, deep review and reconsideration. Scheduled output includes exact reason codes for each product. Reproducible tie-break by product ID. No new runtime dependency.
- `src/phase243_budgeted_journal.ts` — `emptyResearchJournal243`, `appendResearchDecision243`, `validateResearchJournal243`, `loadResearchJournal243`, `saveResearchJournal243`. SHA-256-linked JSON snapshots with optional atomic local file persistence and source snapshot checksum. Hash chaining detects accidental tampering; NOT externally signed proof. Stored data are metadata and decisions, not publisher PDF/article bodies. Production multi-host replication/backups/DB migrations still need implementation.
- `tests/phase243_budgeted_category_search.test.ts`, `tests/phase243_budgeted_journal.test.ts` — 37 tests across safe scoping, provenance boundaries, suspension/restart, budget, tail coverage, repeated source, safety, source changes, journaling and tamper detection.
- `scripts/phase243-evaluate-budget.mjs`, `evaluation/phase243/CONSTRUCTED-90-CANDIDATE-PILOT.json` — 90 **fictional** products for deterministic scheduling examples. This is *not* evidence of real-world win rates or measured time savings.
- Test regression script/logs under `scripts/phase243-*` and `docs/phase243/test-logs`; `package.json` updated to 5.67.0 and `npm run test:phase243`.

## Resource policy

Planning inputs must be trusted upstream. They include exact product/variant and market, editorial-source distinctness, reviewed original testing claims, previous research stage, operator-versioned budget and demand scope. The module accepts no URL, operator-free rights grant or general claim that a product is best.

1. **First pass:** cheap identity / cheap screening, many candidates, explicitly bounded effort. Product records remain searchable even if the research on them stops.
2. **Early deprioritization:** reviewed negative independent result can temporarily suspend expensive work. Two independent community concerns can also soft-pause **only** in explicitly selected lean mode. One weak concern cannot. Stars cannot independently justify proof or exclusion. Positive manufacturer statements alone never count as proven superiority.
3. **Early deep dives:** Phase80 priority plus evidence-based leads prioritize reviewed candidates, with bounded allocation to possible non-mainstream/long-tail candidates. No domain/brand whitelist, no fabricated market coverage.
4. **Second-pass recovery:** an explicitly authorized `review_suspended_due_to_shortage` mode reopens suspended candidates if the minimum number of reviewed promising alternatives was not met; this threshold is only a **planning target**, not evidence sufficiency or market exhaustion. A changed need or updated source revision also triggers reappraisal. A model-specific safety alert **cannot be overridden** by scarcity/user enthusiasm/audit scheduling. A confirmed hard need mismatch cannot be overridden in the same scope without a source or scope change.
5. **Blind-spot audit:** schedule a small periodic sample of temporarily suspended candidates (`auditEveryNWaves`, `auditSuspendedMaxPerWave`), charged to same bounded budget. Human/upstream independently reviewed audit outcomes can signal a missed good candidate. No automatic policy rewrite until a properly measured and separately approved audit.
6. **Re-run invariant:** same fully frozen context, source snapshot, policy and candidate list -> same decisions and work-unit allocations. The plan does not change external ranking.

Thresholds (two independent soft negative origins, selection of budget units, 20% tail slots, every-five-waves audit in constructed pilot) are **experiment settings and not scientifically calibrated**. Measure false-negative candidate losses and cost/time before promoting production thresholds.

## Constructed pilot (NOT real-world benchmark)

From 90 fictional air-fryer records with varied stages/signals and a 40-unit experimental budget:

- First wave scheduled 15 low-cost screens and 5 deep reviews, spending exactly 40 abstract units; 20 candidates were temporarily suspended in first-pass triage, **0** permanently excluded.
- Every-fifth-wave configuration caused 2 previously suspended records to be selected for periodic audit, charged to the same budget.
- Explicit shortage recovery scheduled 5 suspended records for reconsideration.
- Product ranking was never authorized. The simulation measures scheduling logic only; it makes no claim about discovery completeness, real precision/recall or seconds/dollars saved.

Reproduce with `npm run build && node scripts/phase243-evaluate-budget.mjs`.

## Regression execution and status

- `npm run test:phase243`: **37/37 passed** following final safety guards.
- Cumulative TS tests: **4,243 distinct passing tests; zero unresolved failures**, across the original 17 file shards. The first parallel pass timed out for shards 13 and 15: **not counted as passed**. Those were separately executed in six smaller segments (69+40+35 and 49+77+25 tests; 0 failures). The modified shard 14 was rerun after the final change (161 passed). All other unchanged shards passed the previous run. Thus the recorded cumulative test total is an aggregate from successful reruns, **not one uninterrupted single process**.
- TypeScript compiler `tsc`: passed.
- Historical PDF corpus replay and complete Python suite: **not rerun** because Phase243 introduces research scheduling, not a PDF parser. No live PEE web crawl/HTTP benchmark, source-rights audit or LLM processing performed.

## Important limitations and next work

1. **Mainline linkage remains incomplete.** The planner is a callable, working module built on Phase80, but not yet invoked from an authenticated Phase220/221/223 discovery job end-to-end. No assertion of new real products discovered, real wall-clock speedup or dollar savings.
2. Source-review booleans supplied to planning structures must be backed by **trusted ingestion and/or signed review receipts**. The module validates shape and cross-market attachment, not the truth of a web claim or the person making it.
3. The SHA-256 journal detects inadvertent edits but is **not authenticated against an adversary able to rewrite a whole journal**. Local JSON is not a durable distributed production DB, does not verify upstream bodies and does not itself contain the full category knowledge base.
4. Need independent systematic evaluation across brands/categories with reviewed gold labels and a high recall constraint for genuinely excellent or niche-fitted models. Audit both missed-winner rates and actual cost/time per justified recommendation. Keep exploration of less-known brands; avoid first-sweep closed-world bias.
5. Category knowledge from the user's manufacturer PDFs is useful offline research for the assistant, not an independently validated product ranking; all learned properties need provenance and review before influencing advice.
6. Before automatic web invocation, integrate the research scheduler after lawful source discovery with bounded fetches, immutable source-revision fingerprints, per-source/version screening memory, interruption recovery and state transition receipts. Do not grant source permissions or publish rankings via planner output.

Relevant existing PEE pieces retained: `src/phase75_priority.ts`, `src/phase77_decision_research.ts`, `src/phase79_adaptive_search_decision.ts`, `src/phase80_population_portfolio.ts`, `src/phase82_market_watch.ts`, `src/phase193_screening_memory.ts`, `src/phase220_autonomous_discovery_worker.ts`, and subsequent evidence admission gates. This avoids duplicating earlier safety contracts.
