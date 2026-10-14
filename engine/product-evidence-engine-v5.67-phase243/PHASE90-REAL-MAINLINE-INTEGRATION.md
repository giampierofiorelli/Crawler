# Product Evidence Engine — Phase 90: Cumulative mainline integration

**Date:** 10 October 2026  
**Version:** 4.15.0 (research-grade integrated source tree)  
**Baseline:** User-supplied `product-evidence-engine-v4.14-phase86(1).zip`, SHA-256 `8ca3f18a9c489fd2e7ffe347fbcf243bcab45185b381eeac2c0f46b638d6493b`.

## What is now integrated

The uploaded baseline contained the genuine source code for all previous project phases, including 68/69 source policy and robot verification, 70 categorical evidence quarantine, 72 semantic intake, 82 market watch, 85 reviewed JSON-LD recipes, and 86 local-only AI proposals. Earlier HTML companions 87–89 and their tests/docs have been added **without deleting previous source files**.

`src/phase85_source_recipes.ts` now supports two reviewed strategy families **inside its single authoritative, checksummed, single-writer local JSON store**:

- Legacy JSON-LD source recipes; `load()` and `add()` retain their previous signatures and behavior.
- Approved Phase87 HTML recipe records; new `loadHtml()` and `addHtml()`. HTML records carry qualification and distinct independent-label receipts, a human review receipt, the Phase87 recipe digest, the category registry review reference/version, and reviewed field-context declarations. Duplicate active HTML scope is rejected. An HTML record cannot override a stored JSON-LD record or smuggle source article bytes into the recipes store.

The standalone Phase87 SQLite `StrategyMemory` remains present **only for historical companion tests and replay**. **The new production-path research adapter does not use it as recipe authority.** Phase89 SQLite stores *advisory monitoring outcomes*, not approved strategies.

`src/phase90_html_mainline.ts` makes the real in-house connection:

1. Loads exactly one reviewed HTML recipe from the authoritative Phase85 store, checks exact host/path, selected manufacturer document and exact category schema/version/review reference, numeric-only fields, units, origin restrictions and reviewed field contexts.
2. Calls the **actual Phase68** `planWebEvidenceAcquisition`; refuses to fetch when source permissions or review metadata are inadequate.
3. Calls the **actual Phase69** `readApprovedSource` with optional test-injected transport. This checks source policy, site terms, fresh robots rules and response boundaries. HTML remains transient.
4. Inside Phase69's authorized temporary extraction callback, invokes the **actual Phase87 Python HTML parser** through a constrained local subprocess. The reviewed recipe enforces exact `<h1>` model and structural mapping; no inference model is used in repeat reads. Only numeric manufacturer-declared fields can pass.
5. Requires bounded, unique original-page literal anchors containing both the reviewed label and value. A valid HTML structure without a satisfactory original-text anchor is **intentionally rejected**, not weakened into untraceable facts. Phase69 retains only hashes.
6. Calls the **actual Phase70** `buildCategoryEvidenceMatrix` with the Phase69 evidence digests; observations remain `quarantined_unreviewed`, non-publishable and excluded from recommendation ranking. It does not write to the user-facing scoring database.
7. If a Phase89 watch database is explicitly supplied, records outcome and source/template drift as telemetry. Two distinct products with repeated structural failures can request human requalification. **No automatic LLM call or recipe approval occurs.** Monitoring failure is surfaced separately and never reclassifies accepted evidence.

### Why Phase70 is invoked directly rather than through the Phase72 prose adapter

Phase72's `validateTransientSuggestionBinding` intentionally disallows angle brackets in quote anchors. A normal HTML table separates its label and numeric value with markup, so pretending it is a prose-style source excerpt would either lose traceability or require weakening Phase72's safeguards. Phase90 uses Phase69's native authorized transient claim interface and Phase70's native digest-verified structured-fact quarantine directly. **Phase72 and its earlier tests remain unmodified**. This is a controlled architecture decision, not a bypass of Phase69 rights checks or quarantine rules.

## Empirical verification in this environment

All tests used local synthetic pages and simulated authorizations; a real manufacturer and actual permission documents were NOT contacted. No genuine installed Ollama model was benchmarked. No production database or cloud browser was exercised.

| Test suite | Passed |
|---|---:|
| Mainline TypeScript / JavaScript, including 8 new Phase90 tests | **618 / 618** |
| Original primary-source Python | **47 / 47** |
| Original ingestion Python | **21 / 21** |
| Original evaluation Python, Phases 83–84 | **26 / 26** |
| Phase87 + Phase89 companion Python | **60 / 60** |
| Phase88 + Phase89 companion Node/TypeScript | **16 / 16** |
| Original launch artifact | **4 / 4** |
| Original release artifact | **3 / 3** |
| **All suites together** | **795 / 795** |

Logs live under `audit/phase90/`. The v4.14 baseline originally had 610 mainline JS tests; Phase90 adds 8. Earlier research-only companion tests are retained, not silently counted as new production coverage. Tests here used a preinstalled `@types/node` from a system Node toolchain via an excluded local `node_modules` symlink. A fresh environment should install the declared npm development dependencies normally.

## Limits and next engineering targets

- **Research integration, not a deployed product.** This validates source integration against mocked authorized transport and independently labelled *synthetic* fixtures; no source permission has been established for a real website.
- The Phase85 store is still a single-writer local JSON file, not a multi-worker transactional PostgreSQL strategy registry. Authenticated review receipts, recipe revocation, version migration and cross-worker concurrency are not production-complete.
- `readApprovedSource` verifies rights and robots at run time using Phase68/69; it should not be bypassed by an external crawler or a broader JS renderer.
- The HTML parser is deliberately narrow: simple numerical tables, definition lists, key/value sections and spec cards. It does not read PDFs, ambiguous variants, full prose reviews or JavaScript-only DOM. It does not infer product quality, discontinuation, expert consensus, stock or prices.
- Phase90's strict original-literal anchoring rejects some otherwise parsable HTML. Measure recall, error modes, independent-field accuracy and false model matches on **legally accessible real pages** before relaxing or extending it.
- Phase89 is an advisory telemetry SQLite ledger; it is not yet a durable distributed outbox or integrated with Phase82's scheduling persistence. A returned quarantined observation has not been committed to a production database.
- Local subprocess cost and throughput have not been benchmarked; consider a controlled long-lived worker after measuring throughput and memory.
- Never infer that constructed reviewer receipts are real human approval. For real sources, authenticate reviewer identity and verify data rights, page terms, robots, and exact-model labels with actual independently reviewed documentation.

## Reproduction

```
# From repository root, Node >=20 and Python >=3.10
npm install
npm test
npm run test:companion
npm run test:primary
npm run test:ingestion
npm run test:phase84
npm run test:launch
npm run test:release
```

The optional Phase90 test helper `tests/fixtures/generate-phase90.py` generates a **fictional** independently labelled 2-model HTML training fixture, without any network request. `tests/phase90_html_mainline.test.ts` executes the held-out third product through the real Phase68/69/70 functions and Phase85 store, and confirms two distinct drift failures trigger an advisory review with zero model calls.

## Cumulative non-negotiable decisions

- Internal web acquisition remains preferred. Use commodity HTTP, parsers and approved browser automation where justified; do not add a mandatory full scraping framework, paid search or scraping API or a cloud LLM dependency.
- Independent professional *original tests* form the evidence bedrock for product suitability. Manufacturer declared specifications are distinct and remain quarantined.
- Research, product/variant identity, independent-test lineage, rights, category understanding, lifecycle control, market sufficiency, user personalization, ranking, and retailer-link placement must never be collapsed into a scrape-and-score shortcut.
- Retired product status is never inferred from retailer stock or offers. Product ranking is independent of affiliate relationships, retailers and price inputs.
- A local LLM may propose a method only when needed. Repeat acquisition uses reviewed deterministic extraction until real monitoring evidence shows the method should be requalified.
