# Product Evidence Engine — Phase 92: signed recipe suspension and controlled supersession

**Date:** 10 October 2026  
**Release:** v4.17.0  
**Starting point:** intact user-provided cumulative v4.16 Phase91 repository, with all 632 baseline archive files retained.  
**Status:** research-grade offline implementation, tested on constructed HTML. Neither production workflow nor live rights-cleared acquisition has been demonstrated.

## What actually changed

The Phase91 drift gate could refuse to reuse a recipe needing review, but Phase85 could not replace that recipe within its authoritative store. Phase92 closes this *offline software lifecycle* gap for **reviewed manufacturer HTML recipes**:

1. `ReviewedRecipeStore.suspendHtml(signedEvent)` records a reviewer-signed suspension, immediately removing that exact source/category/template recipe from `loadHtml()` and therefore from the real Phase90→Phase68/69→Phase70 intake. Suspension does not suspend Phase82 market discovery.
2. `ReviewedRecipeStore.supersedeHtml({previousDigest,newRecord,trainingReferences,heldOut,event})` qualifies a new reviewed recipe against **2–6 independently labelled held-out product pages**, verifies that these pages do **not reuse a model or URL from the original qualification manifest**, verifies the signature of an explicitly authorised reviewer over the entire transition, and atomically appends the new version and lifecycle event to the Phase85 store.
3. `loadHtmlHistory()` exposes complete immutable recipe versions and suspension/supersession events for audit. `loadHtml()` exposes **only the currently active version** to Phase90, and `load()` retains the original JSON-LD-only legacy interface.
4. Each signed transition binds exact host, path prefix, category, previous and next SHA-256 recipe digests, SHA-256 of full prior and next stored record including the independently reviewed mapping context, UTC timestamp, reviewed reference manifest, separate reviewer ID and approval receipt. Ed25519 public keys are supplied as a **trusted external configuration**, not stored in the recipe catalogue.
5. Replaying an obsolete transition, changing a history record after a transition, replacing a version without qualification, signing with an unknown key, tampering with receipts, or ordering events backward fails closed. The old Phase89 case stays attached to the **previous digest**; it is not erased or falsely marked cleared. A fresh, separately reviewed digest is checked independently.

The existing single-writer, atomic rename, fsync and SHA integrity-checked JSON envelope is unchanged. There is no parallel SQLite authority for approval, no cloud API, no external full crawler, no automatic model-based approval or silent reinterpretation of publisher text. Manufacturer claims remain quarantined, distinct from original laboratory measurements.

## Additional source files

- `src/phase92_recipe_lifecycle.ts`: canonical Ed25519 event payload and signature verification, immutable lineage binding, independent qualification-manifest comparison, real deterministic Phase87 held-out extraction.
- `src/phase85_source_recipes.ts`: backward-compatible active/history projection, signed suspension, atomic signed version supersession. No changes to the legacy JSON-LD recipe type or caller signature.
- `tests/phase92_recipe_lifecycle.test.ts`: 11 new offline integration, failure, audit, cryptographic, disjoint-reference and release-safety checks.

## Exact authorisation flow

**No self-approving LLM.** The phase87 proposal and its original qualification must already have been checked and separately reviewed, producing a standard `ReviewedHtmlRecord`. Before Phase92 accepts a replacement, a caller must supply:

- The prior exact recipe digest and full reviewed successor record, with the **same approved category-field registry version/reference** and source scope.
- Original qualification reference manifest (URL, model, independently labelled expected fields and label receipt per product) whose digest matches the original Phase87 qualification hash and assessor receipts already embedded in the proposed/reviewed recipe.
- **Two to six disjoint held-out pages**, their exact model identity, URL, independent field-value labels and distinct receipt metadata. Phase92 executes the real Phase87 parser against transient in-memory HTML and requires exact numeric/unit agreement for all fields; it refuses ambiguous extraction or one-sided passes. Raw HTML, expected numeric labels and source excerpts are not persisted to the Phase85 catalogue.
- A cryptographic Ed25519 signature from the **externally trusted reviewer** who is named in the already-reviewed successor's `human_review`, covering predecessor, successor, source scope, contextual field mapping, held-out proof digest and UTC event timestamp. A human-authenticated back-office UI or trusted signing service must prepare and authorise this signature in deployment.

For `supersedeHtml`, create the held-out proof with `qualifyHtmlReplacementHeldOut(newRecord,samples)` and an event shaped as `HtmlLifecycleEvent`, sign `phase92SigningMessage(unsignedEvent)` with Ed25519 outside the public ingestion process, then pass the approved event, training references and held-out samples to `supersedeHtml`. The method **repeats** qualification before writing and verifies the signature independently; a claimed proof cannot bypass the actual extraction checks. A suspension uses a signed `action:'suspend'` event, no successor and no held-out proof.

Production needs trusted keys injected when constructing `new ReviewedRecipeStore(absoluteFilename, trustedReviewerPublicKeys)`. A file with signed transitions intentionally refuses to load when those keys are unavailable, rather than presenting a possibly untrusted active method. Earlier v4.16 catalogues remain readable without any migration. `addHtml` still installs the first reviewed version for an empty scope; replacing existing/suspended scopes must use `supersedeHtml`.

## Test results (separately completed suites)

| Executed command/suite | Passed |
|---|---:|
| `npm test`: mainline JS/TS including Phase92 | 635 |
| `npm run test:companion`: Phase87/89 Python tests | 60 |
| `npm run test:companion`: Phase88/89 TypeScript/Node tests | 16 |
| `npm run test:primary` | 47 |
| `npm run test:ingestion` | 21 |
| `npm run test:phase84` | 26 |
| `npm run test:launch` | 4 |
| `npm run test:release` | 3 |
| **Sum of distinct test cases across separately completed suites** | **812** |

The 11 new Phase92 cases check suspension/no-HTTP access, actual Phase90/68/69/70 quarantine with the new version and Phase89 monitoring, rejected mismatched labels, repeated models, untrusted signatures, missing verifier key, tampering and envelope recomputation, stale predecessor, legacy compatibility, overlap with the original training set, chronology, and historical-record integrity. See `audit/phase92/*.log` for the recorded command outputs. These counts are **software cases**, not field validation samples.

## Boundaries and risks that remain

- Tests use wholly constructed manufacturer pages, simulated source-policy receipts, generated test signing keys and test-created reference labels. No real manufacturer site was crawled; no real external content rights or terms were newly cleared, and **no authenticated human editor actually performed an approval** in this test environment. A signature proves possession of a configured private key, not that the signer is a human, independent, or competent reviewer.
- The original Phase87 qualification sample receipts and external annotations are attestations, not independently proven in this environment. Phase92 can match their recorded manifest and enforce disjoint product identities, but cannot know whether training and held-out labels were genuinely independently prepared or whether they represent a sufficiently diverse source sample.
- The Phase85 store uses an atomic, file-based, single-writer lock, not a replicated, transactionally coordinated multi-worker database. The integrity hash is not a remote witness; a malicious administrator who replaces the **entire store with an older valid snapshot** could roll back history. Production needs durable transactional history, authenticated review permissions, protected signing keys, an out-of-band monotonic audit checkpoint, recovery/backup, and secure rollover.
- Phase89's SQLite drift status is still an *advisory companion*. Phase91's read gate is active only when callers specify `watchDbPath`; a source not configured for monitoring does not gain that safeguard. A signed Phase92 suspension is enforced even without the watch DB. Production should require a healthy monitor and explicit central state for every monitored intake.
- No browser-based JavaScript rendering, PDF extraction, deeply nested prose, fuzzy model identity, independent expert-test interpretation, or live-source benchmark was added. The Python subprocess per held-out page has not been load-tested.
- Authorization of source retrieval, terms, robots, rights, and independent original-test handling stays entirely in the earlier modules. Passing Phase92 does not approve acquisition of new content or public consumer rankings.

## Next prioritised engineering task

Move the authoritative version history and reviewed actor identities into a transactional, authenticated deployment store, with a non-rollbackable audit trail and watch reconciliation. Then conduct a *permissioned*, independently labelled trial on varied genuine HTML manufacturer sources, measuring field-level precision, missed fields, template drift, reviewer workload, latency and inference calls. No production-ready or superiority claim should precede those tests.
