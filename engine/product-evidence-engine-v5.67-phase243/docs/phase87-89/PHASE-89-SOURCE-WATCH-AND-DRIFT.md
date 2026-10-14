# Product Evidence Engine — Phase 89: source-strategy feedback, drift detection, and human requalification queue

**Date:** 10 October 2026  
**Delivery:** Executed, offline cumulative **companion** built from the actual available Phase 88 source tree.  
**Mainline baseline:** v4.14 / Phase 86, documented but **not accessible as raw repository bytes**.  
**Status:** Controlled end-to-end tests passed; **not merged into v4.14, not a production source watcher**.

## Why this phase exists

Phase 85 introduced reviewed, reusable deterministic manufacturer JSON-LD recipes, Phase 86 supplied bounded local-LLM recipe proposals, Phase 87 extended reviewed extraction to explicit HTML numeric specifications, and Phase 88 gave the separate HTML extractor an integration contract for the real Phase 68/69 authorized read and Phase 72 manufacturer-claim quarantine. Phase 89 adds an observable feedback path, not a second crawler or an alternative evidence/ranking system:

`Phase82 source watch (future real wiring) → Phase68/69 authorized source read → Phase88 intake → Phase87 reviewed recipe → Phase72 quarantine → Phase89 watch observation → if repeated qualified structural errors, advisory human-review queue → separately approved Phase85/87 recipe lifecycle`.

The local LLM is **not invoked** by Phase 89. A pending review case is an instruction to inspect the source and existing recipe, **not** approval for automated re-prompting or for publishing a replacement method.

## New, actually implemented files

- `phase89/watch_ledger.py`: small SQLite ledger; parameterized writes, transaction lock, idempotent event fingerprint, UTC ordering checks, distinct-model drift logic and pending-review queue.
- `phase89/cli.py`: bounded, JSON-only subprocess command interface (`record`, `pending`, `close_case`). It has no network I/O or LLM dependency.
- `phase89/watch_client.ts`: TypeScript-to-Python bounded subprocess bridge for this advisory ledger.
- `phase89/monitored_html_intake.ts`: wrapper that calls the **actual companion Phase88 intake function** first and records success or a classified failure. Unknown exceptions never become inferred HTML drift.
- `tests/test_phase89.py` (20 tests), `tests/test_phase89_scope_regression.py` (4), and `tests/phase89_watch.test.mts` (5).
- **Security correction to existing companion:** Phase 87 `_source_scope` now treats an un-slashed path prefix as an exact path segment (`/products` cannot match `/products-evil`) and rejects URL fragments, with new tests. This is an isolated companion correction; original v4.14 was not modified.

All Phase87/88 source code, previous controlled tests, existing continuity dossier and Phase84–86 documentation are retained unchanged except the scoped Phase87 hardening described above.

## Exact monitoring semantics

1. **One result per observed model:** normalized model identity is hashed and counted once for a source scope and recipe. Two URLs showing the same model do not count as two independently failing products.
2. **Bounded observation window:** structural drift needs *two distinct model identities* whose most recent observations show `structural_missing` during the previous 7 days. This is a conservative implementation threshold, **not an empirically calibrated failure-rate rule**.
3. **Safe separation of failure causes:** access denial, missing policy/rights receipts, source redirect and other source-authority issues are not interpreted as new HTML layouts. A transient acquisition failure requests an authorized retry; unfamiliar errors request manual validation. The system cannot discover fresh HTML values from an access failure.
4. **Recovery before escalation:** a more recent successful quarantine for the same model supersedes that model's previous failed observation. Existing open human-review cases remain open until manually adjudicated; successful extraction is not retrospective proof that the source had no drift.
5. **Durable, idempotent record:** repeated identical event timestamps and receipts cannot inflate failure counts. Conflicting outcomes for the same model at the same instant, or stale events, are rejected.
6. **Human review:** a recorded structural pattern opens one pending case scoped to source host + path prefix + category + exact strategy digest. Human `close_case` records a *receipt digest*, but cannot approve, install, reactivate or substitute recipes. Closing does not re-open a case for the same recipe; a revised strategy should have a distinct hash and go through normal independent approval.
7. **Data minimization:** stored records contain SHA-256 digests for scope/model/receipt plus strategy digest, outcome and timestamp. No HTML, text excerpt, numeric specification or article body is retained. Local SQLite file paths must still be operator-controlled in production.
8. **No unapproved secondary evidence:** Phase88/Phase87 only produce `manufacturer_declared`, quarantined claims. Independent professional tests, uncertainty/lineage, no-show of discontinued vs stock and user-fit conclusions are untouched.

### Existing Phase 87 suspension rule is still separate

Phase87's experimental strategy store **suspends a recipe after two consecutive structural extraction failures**, including repeats from one model. Phase89's **source-wide advisory requalification** uses a stricter two-distinct-model rule. That means a recipe might become conservatively suspended before Phase89 opens a source-wide review case. Do not misrepresent Phase89 as having replaced Phase87's suspension algorithm. Harmonizing failure telemetry with the actual authoritative Phase85 store is a deliberate remaining integration task, as opposed to quietly altering earlier logic.

## Real executed controlled checks

| Suite | Executed here | Interpretation |
|---|---:|---|
| Existing Phase87 Python plus Phase89 Python + scope regression | **60/60 passed** | Synthetic HTML, SQLite and model/rights simulators |
| Existing Phase88 TypeScript + Python/SQLite e2e plus Phase89 tests | **16/16 passed** | Controlled TypeScript → Python CLI → SQLite, Phase88 authorization/quarantine seams |
| **Total executed companion tests** | **76/76 passed** | Code behavior on constructed fixtures, **not** live source coverage or model accuracy |
| Reported historical Phase86 JS/TS | **610 (not rerun)** | Previous chat report; the actual mainline is not accessible |
| Reported historical Phase86 Python | **94 (not rerun)** | Previous chat report, 47 primary + 21 ingestion + 26 evaluation |
| Reported historical launch/release checks | **7 (not rerun)** | Previous chat report |

The actual e2e tests demonstrate: correctly quarantined manufacturer value on a valid stored recipe; two different models with changed table labels causing zero quarantined bad records and one pending review; rights denial resulting in zero quarantines and no structural-drift case; telemetry outage after completed quarantine clearly reported as `unavailable_after_quarantine` without claiming a rollback. No public domains were crawled; no real Ollama model was run.

## Critical boundaries

- **This is not the v4.15 mainline release.** Earlier v4.14 ZIP was visible in Library, but the source file transfer reported `This Project file does not have an authorized raw-byte materialization path`. The Phase68/69/72/82/85 signatures are therefore still uninspected/unwired.
- The Phase89 watch ledger is *separate* from the experimental Phase87 recipe memory, and both are separate from the inaccessible Phase85 production-like reviewed strategy store. A future mainline integration must establish one authoritative recipe lifecycle and make the telemetry an add-on to existing Phase82 monitoring, not a competing scheduler.
- Monitoring is currently a synchronous after-the-fact write. **No cross-database transaction/outbox guarantee** exists between the Phase72 quarantine and the watch ledger. The wrapper explicitly reports a committed quarantine with missing monitoring and requires reconciliation/alerts. True production requires an authenticated transactional outbox or equivalent durable retry.
- **Security is an injected seam**, not proven source authorization. The Phase88 fixture reader returns constructed receipts. Real robots/terms/licence/policy/host checks still belong in Phase69 and must be re-run at source acquisition.
- Reviewer identities and receipts are strings, **not authenticated**. The system never learns that a reviewed field is genuinely correct merely because a hash or string was supplied.
- The seven-day/two-model threshold is an engineering safety default needing empirical assessment with independently labelled, authorized pages. No recall, precision, false alarm rate, CPU/LLM cost or production scale is claimed.
- Poll scheduling, ETag/304 validators, source discovery, browser JS rendering and live source monitoring are *not* implemented here. The existing Phase82 market watch must eventually own those jobs; this phase only contributes outcomes and queued review requests.

## How to run

Extract the ZIP and run:

```sh
bash scripts/run-companion-tests.sh
```

To inspect the advisory queue (with a DB created by a prior controlled run):

```sh
printf '{"db_path":"/path/to/operator-controlled/watch.sqlite3"}' | python3 -m phase89.cli pending
```

To safely **stage** without claiming merge, first supply the original v4.14 repository as a mountable ZIP, extract it, inspect its files, then run:

```sh
bash scripts/stage-into-v4.14.sh /path/to/extracted/product-evidence-engine-v4.14-phase86
```

The staging script refuses missing mainline source files or name collisions; even after successful staging, the real Phase69/72/82/85 contracts must be wired, the authoritative store reconciled, and all mainline tests rerun. Do **not** ship, rank, republish or autonomously retrain based on this companion.

## Next concrete development milestone

1. Obtain v4.14 raw source files with authorized local access, verify archive checksum, inspect real `readApprovedSource`, Phase72 quarantine, Phase82 watch scheduler and Phase85/86 recipe lifecycle.
2. Merge the additive Phase87/88/89 capabilities into one authoritative store and ensure source policy approval precedes every page read, including unchanged/conditional requests.
3. Add an authenticated, durable outbox/reconciliation job for successful quarantine events and human review cases; avoid reporting committed partial writes as atomic success.
4. Evaluate actual authorized HTML sources across distinct layouts and held-out product models; measure correct extractions, missed values, false drift alerts, human review effort and repeat LLM avoidance.

**Preserved principal decision:** build the acquisition orchestration internally, reuse ordinary parser/browser components where justified, and require independent evidence of a material net advantage before adopting an external crawling framework or commercial scraping API.
