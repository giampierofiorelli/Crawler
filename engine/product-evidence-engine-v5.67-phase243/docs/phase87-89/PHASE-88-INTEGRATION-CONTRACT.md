# Phase 88 — Source-authorized HTML intake, reviewed-registry validation and quarantine

**Product Evidence Engine | 10 October 2026 | companion integration contract, NOT mainline merge**

## Delivered implementation

`phase88/approved_html_intake.ts` is a fail-closed TypeScript adapter that *requires* three injected mainline dependencies: the reviewed category-field registry (Phase85/knowledge model), authorized read (Phase68/69), and quarantined manufacturer-claim intake (Phase72). It invokes the Phase87 stored recipe through the already tested TypeScript → Python CLI bridge. There is **no source fetch**, no instruction to Ollama and no alternative ranking/publishing path.

Execution order:

1. Validate request URL (HTTPS, no userinfo, fragments or explicit port), product model, category, reviewed recipe SHA-256 identifier, timestamp and requested field names. Reject price, offers, sales, customer ratings and discontinued/retirement-like fields in this lane.
2. Ask the mainline reviewed field registry whether the requested field keys belong to this category, with a review receipt. No registry approval means **no source fetch**.
3. Ask the existing Phase69 source reader to perform the **real source policy, robots, terms and rights authorization**. Fail if any decision/receipt is missing, if final URL differs from approved URL, if response is not HTML, or if it exceeds 750 kB. These checks supplement, **not replace**, the actual Phase69 security path.
4. Invoke `phase87Call('extract_stored',...)`, which opens the reviewed, integrity-checked Phase87 SQLite strategy and deterministically reads fields from the authorized transient HTML. There is **no automatic AI fallback on failure**. A missing/suspended recipe requires the separate controlled recipe-review lifecycle.
5. Reject mismatched product model, altered strategy hash, wrong URL, non-finite values, unknown registry keys, invalid units and any origin/state other than `manufacturer_declared` / `quarantined_not_independently_tested`.
6. Submit the **entire checked claim batch** to the injected Phase72 quarantine handler. Require its receipt to confirm only the quarantined manufacturer-evidence role and number of accepted claims. Return status, count and receipt, **not an independent test, score, recommendation or publication permission**.

The actual Phase69 and Phase72 callback signatures are **not known** here and the injection contract is not by itself proof of security. Production wiring must adapt the genuine existing functions, not fake those receipts. The caller's category selection, reviewer receipts, and in-house rights checking require production authentication/audit. Phase72's batch write must be atomic; the standalone contract cannot roll back side effects if an incorrectly written external callback writes partial records then reports failure.

## Tests executed

- Phase87 existing companion: **36/36 Python tests passed**, using mocked local Ollama and synthetic HTML.
- Phase88 TypeScript isolated tests: **10/10 passed**, source/rights/registry denials, exact URLs/redirects, exclusions, quarantined evidence classification and no partial submissions on local validation failure.
- Phase88 end-to-end interface test: **1/1 passed**, using real Python subprocess and SQLite recipe memory, a synthetic two-model qualification and a different third synthetic model, with simulated Phase85 registry, Phase69 read and Phase72 quarantine. There were **zero Ollama calls** during stored-recipe reuse.
- **No mainline v4.14 source was executable here**, so none of the previous 610 TS/JS + 94 Python + 7 release/launch tests were rerun. No real manufacturer site, real installed local model, live database, or source-rights validation was tested.

## Operational and methodological boundaries

- The Python Phase87 SQLite store is still a companion experiment; production should use the mainline Phase85 authoritative reviewed-recipe store or explicitly migrate with a safe one-authority design. Never create two independently approved strategies for the same source without conflict resolution.
- `phase87Call` spawns a Python subprocess for each call, which is an integration convenience, not a throughput-proven production architecture. Monitor timeout, resource cost, cache permissions, concurrency, and potential single-writer SQLite limitations. This adapter does not claim faster throughput than existing systems.
- The parser supports constrained numeric tables, definition lists and short explicit label/value HTML; not unbounded prose understanding, full HTML5 error recovery, JavaScript rendering, PDF, variant ambiguity or original professional test interpretation.
- This phase does not change market sufficiency, deep research, matching, original test lineage, independent-lab measurements, reviewer rights, confirmed retirement logic, recommendation ranking or retailer-link placement.

## Exact baseline blocker

Earlier chat generated `product-evidence-engine-v4.14-phase86.zip`, visible in Library, but the raw file cannot be brought into this working environment because the file service reports: `This Project file does not have an authorized raw-byte materialization path`. Consequently Phase88 **cannot** be described as v4.15 or a fully integrated original codebase. Once that file is provided as a mountable attachment, inspect actual dependencies, execute staging script, wire callbacks, run all original and new suites, then create a true cumulative repository release.
