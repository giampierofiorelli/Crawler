# Product Evidence Engine — Phase 93
## Reviewer trust, acquisition consistency, mandatory monitoring, permissioned evaluation readiness

**Date:** 10 October 2026  
**Version:** v4.18.0  
**Basis:** exact, user-supplied v4.17 Phase92 ZIP. **All 646 baseline archive members preserved.**  
**Status:** implemented research-stage controls; fully offline synthetic verification, NOT production operations or live-source validation.

## Outcome

Phase93 closes several known gaps in the v4.17 *research* acquisition path without switching crawler framework or introducing paid crawling, search or scraping APIs. The Phase85 file catalogue remains the **single authoritative recipe store**; no independent SQLite recipe-approval store has been added. Its snapshot is now explicitly checked around authorized source access. Deployment approval can be bounded by a signed, externally pinned authorization policy. The existing Phase89 SQLite watch must be present and healthy in the newly offered `monitoringMode:'required'` profile. An offline evaluation harness produces denominatored field outcomes, including omissions and blocked cases, for subsequently authorized genuine publisher pages.

### Implemented code

1. `src/phase93_reviewer_policy.ts` — checks an **externally root-signed Ed25519 policy** listing reviewer signing public keys, exact source host, category, path prefix, permitted actions, dates and revocations. The exact complete policy SHA-256 must be pinned by deployment configuration outside the catalogue. `createPolicyEnforcedRecipeStore` injects these permissions into Phase85 **new** suspension and supersession writes, in addition to Phase92's existing event signature checks. Historical event signatures remain verifiable with retained public keys; a revocation does not silently rewrite history. Private signing keys are never passed to source-extraction code.
2. `src/phase85_source_recipes.ts` — backward-compatible optional `approveLifecycle` authorization gate, plus `snapshotHtml()` returning a consistent hash of the catalog's validated record set and its currently active recipes. The atomic file write, original JSON-LD records and immutable phase92 history remain.
3. `src/phase90_html_mainline.ts` — optimistic consistency checks **before and after** acquisition: if the catalogue changes or a watch case appears while bytes are being read, the attempted extraction is blocked and no observations return. Strict mode refuses a missing watch database **before HTTP** and refuses to return a success when the watch write is unavailable. A final state recheck follows successful telemetry. The Phase68/69 rights-checked reader and Phase70 quarantine are unchanged.
4. `src/phase93_permissioned_pilot.ts` — no new HTTP client; passes independently labelled cases through the real mainline rights gate in strict watch mode, with `transportFor` defaulting to the existing approved source reader when no injected mock transport is provided. Reports *field-level* exact agreement, incorrect fields, omitted reference fields, unexpected extracted fields, blocked cases, and reference-denominated precision/recall where definable. The same evaluator can use pre-authorized live access in a future environment, but none was executed here. It blocks repeated case/model/URL identities and disallows the recipe reviewer as reference annotator. The provided assessor identity and legal permissions remain attestations; this code cannot authenticate them.
5. `tests/phase93_operational_controls.test.ts` — eight new tests covering signed grants, expiry, forgery, revoked reviewers, scope restrictions, signed policy rollback pinning, strict watch behavior, catalogue changes mid-fetch and pilot denominators. Additional regression suites confirm earlier components still work.

### Control sequence

`Phase85 active recipe snapshot → (strict) Phase89 watch check → Phase68 plan → Phase69 robots/terms/rights check → transient HTML parsing through Phase87 → Phase85 snapshot recheck + Phase89 recheck → Phase70 quarantined matrix → (strict) durable watch receipt → final snapshot + watch recheck → research-only result`

The local model is **never** invoked along the repeated-recipe path. A flagged strategy is not retrained or approved automatically. A signed suspension/supersession remains under Phase92; external reviewer policy adds a separate, root-trusted permission layer.

## Explicit limitations

- **NOT a transactional multi-worker deployment**: Phase85 is still a local-file single-writer catalogue with an atomic-rename/fsync protocol, and Phase89 is an independent local SQLite watch. The snapshot/recheck design is optimistic. It cannot guarantee a single serializable transaction across HTTP, the catalogue, the watch database and any future production evidence database. An adverse change during the last few instructions after the final check remains a race until there is a centralized transaction/lease design.
- **NOT proven rollback resistance for the catalogue**: the signature and external *policy* digest protect the trust policy against silent downgrade when properly pinned. A separate out-of-band monotonic *catalogue event* checkpoint, tested backup/recovery and a transactional authority are still necessary to prevent historical snapshots being restored.
- **NOT authenticated human identity**: Ed25519 proves only private-key possession. A production operator login, independently managed key lifecycle, protected signing service and signed policy-rollout procedure remain required. A privileged deployment operator could still bypass the protected factory by constructing the older `ReviewedRecipeStore` directly; production access paths must enforce factory use and disallow unreviewed caller wiring.
- **NOT a deployed live source**: all eight new tests use generated signing keys, simulated policy receipts and constructed HTML pages. The pilot harness demonstrates how to measure performance; its synthetic precision/recall result does not establish real-world accuracy or generalizability. Rights, robots and terms need actual approval for *each* source.
- **NO independent performance inference from maker specifications**: manufacturer declarations remain `manufacturer_technical_specification` quarantined facts. Original independent professional testing and original-lab results remain separate; neither sales prices nor affiliate links affect recommendation scoring. No retirement inference from out-of-stock retail status.
- **No mandatory scraping/search provider**: this stays in-house with low-level HTML parsing and optional local LLM at the proposal stage. Browser-based rendering, PDFs and unconstrained prose are not claimed.

## Future, genuinely permissioned pilot protocol

1. Obtain *documented* publisher-specific lawful processing terms, current site authorization, actual applicable robots controls and exact permitted operations. Do not simulate the rights receipt for a live endpoint. Prior permission may not extend to retaining text, training, publishing or distributing source values.
2. Select multiple distinct products across independent *real* HTML templates, rather than merely several pages using the same constructed structure. Include pages with variant ambiguity, HTML definition lists, tables, absent or reformatted specifications, and explicit unit variants. Declare exclusions and blocked pages ahead of time.
3. Have annotators independently label exact model/variant, values, units, context and relevant reference fields without using the recipe-proposing LLM. Authenticate assessor identity and resolve disagreements while recording the adjudication. Training/approval samples and evaluation samples must not overlap.
4. Run `runPermissionedHtmlPilot` with real reviewed source policies and a correctly configured Phase85 catalogue plus strict Phase89 watch, in an environment with authorized HTTPS/DNS and secrets isolation. Do not auto-follow arbitrary discovered URLs.
5. Publish a reproducible methodological report of attempted/succeeded/blocked requests, missing fields, false extraction, exact-unit failures, cost/latency, model invocation count, review hours, maintenance intervals and template drift; show source/category strata and confidence ranges when sample design warrants. Without real annotated denominators, make no comparative performance claims.
6. Only after measured reliability and service/security review consider multi-worker SQL persistence, remote checkpoint witnesses, signed review service integration and authorized JS-rendered page support. Compare external frameworks only upon observed technical/cost need, not by assumption.

## Verification and source links

Local full TypeScript/JavaScript suites completed in **four separate, bounded groups** after build, yielding **643 passing tests** (168 + 149 + 158 + 168); the grouping was needed because a single monolithic container invocation repeatedly timed out without an observed assertion failure. Separate prior suites passed: Phase87–89 companion **60 Python + 16 Node**, original first-party Python **47**, ingestion **21**, Phase83/84 evaluation **26**, launch **4**, release **3**. **Total 820 passing test cases across completed runs**. These are overlapping *software coverage* categories but separate test invocations, not 820 independent real-world observations. Complete successful logs are retained under `audit/phase93/`.

Technical references, scoped to the stated properties:

- Node.js `crypto` asymmetric key and signature APIs: https://nodejs.org/api/crypto.html
- SQLite transaction isolation and serializing writes: https://www.sqlite.org/isolation.html
- SQLite WAL concurrency and operational constraints: https://www.sqlite.org/wal.html
- NIST AI RMF on representative test sets and external validity: https://airc.nist.gov/airmf-resources/airmf/3-sec-characteristics/
- Previous first-party internal phase92 record: `PHASE92-SIGNED-RECIPE-LIFECYCLE.md`.

**Next phase recommendation (Phase 94):** make an actual migration plan and test harness for a transactional single-authority recipe+review+watch catalogue, keyed by signed monotonic event sequence and a separately anchored checkpoint, before claiming concurrency-safety or deployment readiness. Independently obtain authorization and real reference labels for a source pilot rather than repeatedly expanding synthetic correctness tests.
