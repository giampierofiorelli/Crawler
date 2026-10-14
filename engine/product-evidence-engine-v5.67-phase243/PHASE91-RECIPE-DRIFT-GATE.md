# Product Evidence Engine — Phase 91: review-safe reuse and source discovery continuity

**Date:** 10 October 2026  
**Version:** 4.16.0  
**Baseline:** complete user-supplied repository, v4.15 Phase 90, preserved cumulatively.  
**Status:** offline research-grade integration and unit-tested safety gate; no live authorized manufacturer retrieval, deployed database or human adjudication.

## Problem confirmed in Phase 90

The Phase 89 SQLite ledger identified a manufacturer HTML recipe with two distinct models whose structures had diverged, and queued a requalification case. Phase 90 recorded that decision but **did not check the queue before the next authorized HTML acquisition**. Therefore a previously reviewed recipe might keep running on other models even though its method had been flagged. A success on a different model could still quarantine data while the advisory case remained pending. This was contrary to the project's design that strategies are reused only while behaving correctly.

The Phase 82 market discovery scheduler is broader than an individual extraction recipe. Blocking a recipe must **not** disable lawful product/feed discovery, current model detection, independent professional test research or the category's coverage management.

## Implemented changes

1. **Read-only exact-scope Phase 89 status**: `WatchLedger.case_status` and `.case_status_many`, via the existing bounded `phase89.cli` interface, retrieve the advisory case status for source host + path-prefix + category + exact reviewed recipe SHA-256. They do not write approvals or revoke policies. The checksum matches the Phase 89 source key algorithm.
2. **Fail-closed preflight inside real Phase 90 intake**: `src/phase90_html_mainline.ts` calls `checkReviewedHtmlRecipeWatch()` **after retrieving a reviewed recipe from Phase 85 but before Phase 68 planning or Phase 69 network operations**, only when `watchDbPath` is configured. A pending or manually closed case blocks the exact recipe. An inaccessible ledger also blocks this monitored path, returning a distinct reason and no evidence. No LLM fallback is invoked. It does not falsely record a further extraction event for a preflight-blocked attempt.
3. **Closure is not reapproval**: Phase 89's `close_case` merely records an administrative disposition; it cannot make the original recipe eligible. The safety gate blocks both `pending_review` and `closed_manually` records for the *same recipe digest*. A future distinct human-approved recipe and properly versioned Phase85 migration must provide the actual requalification path.
4. **Phase 82-compatible discovery view**: `planMarketWatchWithRecipeReview` delegates the discovery budget/rights/host logic unchanged to the real `planMarketWatch()`. It separately reports affected reviewed HTML recipes and their matching source IDs, without treating a source watch as permission to retrieve a page or operate an LLM. Thus legitimate market discovery can continue.
5. **Bounded local subprocess**: `src/phase91_watch_gate.ts` calls only Python's local `phase89.cli`, with 10 s timeout, bounded request/response sizes and validation of returned scope hash, recipe digest and status. No cloud AI, commercial search/scraping API, new crawler or new strategy authority was introduced.

## Regression and safety tests

All listed suites were executed **individually** in this environment and passed. An attempted combined `npm run test:all-research` exceeded the single process time allowance partway through the companion tests; it is **not** counted as a completed combined run.

| Suite | Passed | Evidence |
|---|---:|---|
| Mainline TS/JS (`npm test`) | 624 | `audit/phase91/test-all-research.log` (full npm test section) |
| Phase 87 + 89 Python companions | 60 | `audit/phase91/python-companion.log` |
| Phase 88 + 89 Node companions | 16 | `audit/phase91/node-companion.log` |
| Primary-source Python | 47 | `audit/phase91/primary.log` |
| Ingestion Python | 21 | `audit/phase91/ingestion.log` |
| Evaluation Python (Phase 83/84) | 26 | `audit/phase91/phase84.log` |
| Launch artifact | 4 | `audit/phase91/launch.log` |
| Release artifact | 3 | `audit/phase91/release.log` |
| **Total of separately completed test runs** | **801 / 801** | No observed failures |

The six new Phase 91 tests verify legitimate extraction without drift, two distinct structural failures triggering a source-recipe gate, refusal *before any web transport*, safe behavior after manual ticket closure, independent Phase82 discovery, telemetry outage fail-closed, and exact-source scope identification. The all-mainline JS suite includes these six tests.

## Important boundaries

- **The ledger remains advisory evidence with local SQLite persistence**, not an authenticated, distributed review system. The gate is enabled **only on intake requests supplying `watchDbPath`**; callers omitting that argument follow earlier Phase90 behavior. Production should require a configured, access-controlled watch ledger for monitored sources; a missing or recreated database can erase evidence of past drift. Recipe suspension should ultimately be authoritative and transactional in Phase85.
- A manually closed case remains blocked for that exact recipe. Phase85 currently cannot safely replace an active HTML recipe at the same scope; the future requalification/migration workflow must be implemented before claiming automated recovery.
- The Phase82 market-watch plan contains **no real HTTP operations and no persisted scheduler**. It cannot legally authorize data retrieval or independently discover actual products.
- No data rights, terms or robots permissions on live sites were newly checked. The existing Phase68/69 authorization remains mandatory. Reviewer identities/receipts in fixtures do not constitute genuine human validation.
- Test success does not establish extraction quality on diverse real HTML, independent laboratory accuracy, model equivalence, operational throughput or end-user recommendation quality. The Python process is spawned for each status/extraction; production cost is not measured.
- Manufacturer-provided values remain quarantined declared specifications and never become original independent test measurements, ranking evidence or manufacturer-discontinuation proofs through this path.

## Follow-on priority (Phase 92)

Implement **proper recipe lifecycle authority** inside Phase85: explicit suspension/revocation, immutable version supersession with a human approval trail, authenticated review and independent held-out product checks, reconciliation of Phase89 drift events, and safe restart only when the new procedure is separately qualified. Preserve all older versions for audit and avoid altering the JSON-LD contract. Then run a legally authorized, independently labelled real-site source validation before claiming generalized coverage.

## Cumulative architecture that remains unchanged

Market/categorical research, user-needs interpretation, product/variant identity, source rights and robots, exact-original-test provenance, manufacturer vs independent evidence, evidence matrix quarantine, source discovery, market coverage, category learning, lifecycle/discontinuation verification and affiliate-independent recommendations remain distinct. Retailer stock or price never retires a manufacturer model. The preferred acquisition stack remains in-house, with targeted commodity parsers, optional lawful browser rendering and reusable source recipes; local LLM proposes only when necessary. No mandatory paid search or scraping API and no complete external AI crawler framework have been added.
