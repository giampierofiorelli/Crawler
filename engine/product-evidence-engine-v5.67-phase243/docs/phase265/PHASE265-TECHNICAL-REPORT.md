# Phase265 — Metadata Authorisation Boundary and Persistent Test Measurements

**Date:** 2026-10-16. **Base:** Phase264 HEAD `9259ddb`.

**Commits:**

- Checkpoint A (gate boundary): `e7f9faf`.
- Scenarios frozen: `336bf6f`.
- Checkpoint B (persistence path): `f1d1c5e`.
- First evaluation run, unchanged: `d7b1d0c`.
- Report: the commit that adds this file.

**Labels used throughout:**

- **[impl]**: implemented;
- **[sw]**: demonstrated in software (tests and runs below);
- **[T1]**: synthetic fixtures only (fictional `.test` hosts, invented products);
- **[real-copy]**: a read-only copy of the real store;
- **[unproven]**: not shown on authentic documents.

There was no network request this phase. The Phase264 pilot was not re-run, renewed or reinterpreted, and its
first-run files are unchanged.

## 1. Baseline verified

- **Repository:** HEAD `9259ddb`, branch `claude/typescript-network-transport-test-1givnd`, clean tree.
- **Store:** `knowledge-snapshot.mjs verify` gives verified, live = remote, 1,374 events, schema v4.
- **Read:** the Phase263 and Phase264 reports, and the code of Phase225, 226, 227 (inside 226), 246, 249, 260 and
  264, plus the operational scripts `phase246-live-wave.mjs` and `phase246-knowledge.mjs`.

## 2. Phase264 authorisation boundary corrected [impl][sw]

**The defect, confirmed.** `MetadataPilotGate264.request()` had two gaps:

- it let `sitemap_metadata` fetch any HTTPS path on an accepted domain except `/robots.txt`;
- `allowDomain(host)` accepted any host a caller named.

The operation label was the only proof that a URL was a sitemap.

**Fix** (`src/phase264_metadata_pilot.ts`; the smallest change in the gate itself):

| Requirement | Now |
|---|---|
| Only sitemaps established by the approved process | The gate keeps its own set of sitemap URLs per host. It holds `https://<host>/sitemap.xml` of an accepted domain, the same-host `Sitemap:` lines of the robots.txt the gate received, and the `<loc>` children of a sitemap index the gate received. A `sitemap_metadata` request for anything else is refused with `sitemap_url_not_established`. URLs listed in a `urlset` are pages, so they are never added. |
| Operation label is not proof | The check is on the URL against the established set. Relabelling a page as `robots_fetch` fails `robots_path_only`, which now also refuses a query string. |
| Domains bound to the Wikidata assessment | `allowDomain` is removed. `acceptBrandDomains(brand)` recomputes `assessBrand264` from the Wikidata search and entity responses **this gate received**. Only an unambiguous result opens its current P856 hosts. A caller cannot name a domain, and a brand the gate never searched opens nothing. |
| Existing restrictions | Unchanged: robots path, byte cap, expiry, rate spacing, operation scope, stop on 403, 429, 5xx, Retry-After or maxlag, and the Date-skew check. |
| Expiry right before sending | Halts, host halts and expiry are rechecked **after** the enforced delay, immediately before the transport call. A delayed request past expiry is never sent (tested: transport calls = 1). |
| Budget across executions | Budgets were per gate instance, so a second execution under the same policy would have had a fresh 60. Now `fileUsageLedger264` keeps a protected JSON ledger keyed by **policyId**, so a new revision cannot reset it. Each request is recorded before it is sent, and the gate refuses once ledger usage reaches `maxRequests`. The runner seeds the ledger with the Phase264 first run (1 request). |

**Tests** (`tests/phase264_metadata_pilot.test.ts`, 7 tests, including the new adversarial one). Each of the following
is refused, and no page or article URL ever reaches the transport:

- a product page, an article, `/sitemap.xml?page=2` and `#x`, `/products.xml`, `/robots.txt` via the sitemap
  operation;
- a sitemap on a host named only in robots.txt, and one on a host named only in an index;
- a page listed in a received `urlset`;
- a page requested through the robots operation.

Also tested:

- the delayed-request expiry;
- the ledger across two gates and a revision bump;
- a seed lower than the recorded usage.

The runner was rehearsed offline with its fixture transport only: no network, and the real ledger was not touched.

## 3. Where the test leads disappeared [sw: code trace]

| Link | Finding |
|---|---|
| Phase225 `probeTransientTestContent225` (prose), Phase226/227 `probeTransientTestTables226` (tables, H43 links) | Working conservative extractors. They return leads with value, unit, condition, instrument, method cue and subject assignment, plus the "unverified" flags. |
| Callers | Only `phase222_transient_public_page_observer.ts` (a transient receipt), `phase225_test_lead_audit.ts` and evaluation scripts. |
| Operational observation builders | `phase246-live-wave.mjs observations` and `phase246-knowledge.mjs ingest-recovered` ran **only** the Phase245 specification extractor. |
| `ObservationInput246` | Had no field for a lead. **This is the exact break: no lead ever reached `ingestObservation246`.** |
| Phase246 `declarations` as a target | `product_id` is NOT NULL. An unresolved subject (`not_identified`, `multiple_models_unresolved`) would have to be forced onto a product, which fabricates an identity. There is no column for a test condition, an instrument, the basis of the dimension or the subject assignment. `evidence_role` exists (`test_publisher_declaration_unreviewed`) but is fixed by source type, which suits a declaration and not a test row's qualifiers. |
| Phase249 | Already provides what is needed: `independent_original_test` keeps numeric measurement kinds only, capped at 25 products per host; reservations are honoured. No change needed. |
| Phase260 | Source memory needs a canonical source and holds annotations, not measurements. Not the right home. |

**Decision: one staging table in the same store.** It is not a parallel engine: it uses the same ingest transaction,
the same retention decision, the same journal, supersession, export and backup. The existing structures cannot
represent a legitimately unresolved subject or the qualifiers.

## 4. What was implemented [impl]

- **`src/phase265_test_measurements.ts`:**
  - `testLeadsFromHtml265` runs the existing Phase225 probe on the same transient bytes, with the page's own product as
    the only product lead;
  - `screenTestLead265`. It refuses:
    - leads from another revision;
    - leads claiming review, independence, admission or ranking;
    - malformed tokens;
    - unknown units;
    - a unit that does not fit a publisher-declared dimension (for example W under a time header). Nothing is ever
      converted.
  - `subjectAssociation265`: a lead attaches to the page product only when its subject is exactly that product's
    recorded identity; otherwise `subject_unresolved` with a NULL product;
  - `reportedBy265`:
    - a manufacturer source gives `manufacturer`;
    - a test-publisher source gives `test_publisher_operator_asserted`;
    - anything else gives `other_publisher`.
- **Store migration v5:** `test_measurements265`. It keeps:
  - lead id and extractor version;
  - block hash, index and offset;
  - the revision, and through it URL, SHA-256, fetch time, host and source type;
  - the product (nullable), subject association and assignment;
  - value and unit;
  - dimension and its basis (`publisher_table_header` or `not_established`), and target scope;
  - condition, instrument and method cue;
  - evidence role and reporter;
  - retention, state, superseded-by-revision, expiry and recorded time.

  CHECK constraints fix these values: independence `not_established`, verification `unreviewed`, market `unknown`,
  exact variant verified 0, scientific evidence admitted 0, independent test evidence 0, ranking authorised 0.
- **`ingestObservation246`:**
  - new optional `testLeads`, applied inside the same transaction under the revision's effective Phase249 retention;
  - when values are not retained, only counts are journaled (`test_measurements_withheld`) and a gap records why;
  - test-measurement products count towards the per-host cap; an unresolved row counts once per revision;
  - a new revision supersedes with a link; a new lead-extractor version re-derives the revision's rows;
  - the same bytes offered again are a no-op, and leads first offered on a later sighting are applied once;
  - journal event `test_measurements_ingested` (counts and codes, no values); gap `test_measurement_subject_unresolved`.
- **Reads:**
  - `testMeasurements265({productId|null, revisionId, includeSuperseded})`;
  - `testMeasurementConflicts265(productId)`: groups only measurements whose dimension the publisher declared, by
    dimension, unit, condition and scope; it reports `conflicting_values` or `repeated_observation`, and repetition
    says nothing about independence;
  - CLI `phase246-knowledge.mjs test-measurements [--product ID]`.
- **Export, import, shards and purge** treat rows exactly like declarations:
  - pending-rights rows are excluded unless requested;
  - public shards require `facts_retained` plus derived publication;
  - expired pending-rights rows lose their value.
- **Builders:** `phase246-live-wave.mjs observations` and `phase246-knowledge.mjs ingest-recovered` now attach
  `testLeads`. `ingest-observations` passes them through.
- **Defect found and fixed in Phase225 (D1).** The prose numeric pattern ended in `\b`, so a percentage followed by a
  space ("80 % using") could never match. Percent results were silently lost. It now ends at a non-alphanumeric
  character, and `mmHg` is still refused. A regression test was added. Found by the Phase265 unit test, before the
  evaluation run.

## 5. Evaluation (frozen first, run once) [sw][T1]

- **Scenarios** (`evaluation/phase265/scenarios.json`, frozen at `336bf6f` before the implementation): 11 synthetic
  pages.
- **Path**, only through the operational CLIs:
  1. fixture HTML;
  2. `phase246-live-wave.mjs observations` (Phase245 + Phase225/226/227);
  3. `phase246-knowledge.mjs ingest-observations` (Phase246, Phase249 class or default-deny policy);
  4. the process exits;
  5. reopen, read, close, reopen, read.
- **Runner:** `scripts/phase265-persistence-eval.mjs`. **Results:** `evaluation/phase265/persistence-firstrun.json`,
  committed unchanged at `d7b1d0c`. **11 of 11 scenarios match their frozen expectations.**

| Measure | Result |
|---|---|
| Leads extracted (offered to the store) | 12 (11 distinct, plus 1 re-offered by the repeat) |
| Persisted | 8 |
| Associated with the page's own product | 7 (all exact-identity; unverified association) |
| Retained without a product | 1 (two-product page; `not_identified`) |
| Rejected | 1 (`unit_dimension_mismatch`: W under a time header) |
| Withheld for rights | 2 (`machine_readable_reservation`: 1; `metadata_only` under default-deny: 1) |
| Not extracted | the ZX900 row (not the page product: no lead); manufacturer claim and "did not test" prose (0 leads) |
| Duplicates on repeat | 0 (1 already stored) |
| Supersession | 1 row `superseded_by_revision`, linked to its successor; 7 current |
| Conflicts | 1 `conflicting_values`: noise dB 52 vs 58 from two test publishers on one product |
| Equal after reopening (twice) | yes |
| Incorrect attribution | 0 |
| Incorrect evidence promotion | 0 (manufacturer stays `manufacturer` / `manufacturer_declaration`) |
| Prose fragments in either store | 0 of 428 24-character windows |
| CHECK refusals (ranking, independent evidence, admission, independence, verification) | 5 of 5 |
| Decision-layer candidates using a test measurement | 0 |
| Journals | ok (class 21 events, deny 3) |

**Focused tests** (`tests/phase265_test_measurements.test.ts`, 9 tests, real extraction and ingestion on temporary
stores, separate fixtures). Every test case the brief listed is covered:

| Brief case | Covered by |
|---|---|
| 1 | Survives reopen, with provenance, condition, instrument and roles. |
| 2 | Idempotent repeat; leads offered later; a new extractor re-derives. |
| 3 | Revision link; conflict versus repeated observation. |
| 4 | Two-product page; probe with two models; another model's row; no attribution to the similarly named product. |
| 5 | Manufacturer stays manufacturer-reported; self-described "independent lab" on an editorial source stays `other_publisher` and `not_established`. |
| 6 | W/time withheld; % kept with dimension `not_established`; tampered leads refused. |
| 7 | TDM reservation; Content-Signal `ai-input=no`; default-deny; per-host cap reached by a test-measurement product; pending-rights expiry and export exclusion. |
| 8 | CHECK constraints; the decision layer reads none. |
| 9 | No body, passage or tag in any table. |
| 10 | Phase264 adversarial test, §2. |

**Real-store copy [real-copy].** Migration v4 to v5 changed no existing table, the journal still holds 1,374 events,
and the store has 0 test measurements. No real page body exists to re-ingest, by design, so the real store gains no
measurement this phase.

## 6. Checks

- **Focused:**
  - Phase225/226/227/222/265: 64 of 64;
  - Phase264, 75, 69, 223: 35 of 35;
  - Phase220–269: 548 of 548.
- **Full suite (`npm test`):** 4,487 tests passed across 19 shards, exit 0.
- **Store:** verified before and after. `knowledge-snapshot.mjs sync` gives synced, remote `2a66111`, content
  unchanged. The live store and the snapshot are still schema v4 with identical content. The new code migrates them to
  v5 on first open, adding one empty table; this was verified on a copy (§5). The next save records v5.

## 7. Status for independent review

- **Implemented and demonstrated in software:**
  - the gate boundary (§2);
  - persistence through the operational builders and the CLI ingest, with durable retrieval after reopening (§4, §5).
- **Validated only on synthetic fixtures (T1):**
  - all extraction-to-persistence results;
  - the 11 scenarios and 9 tests were written by the developer, so they are not author-independent.
- **Unproven on authentic publisher documents [unproven]:**
  - extraction yield and precision on real test articles;
  - subject association on real pages (most real test pages review several products, so many leads will be
    `subject_unresolved`; 15 of 19 job products have no cross-site identifier);
  - unit and dimension handling beyond the fixtures.
- **Remaining blockers:**
  - **Rights:** no lawful retrieval of a real test article is authorised. Phase249 would keep numeric measurements
    (capped) once one is retrieved.
  - **Identity:** an unresolved subject needs a review path that attaches it to a product without guessing; not built.
  - **Evidence admission:** no path promotes a row to reviewed or independent evidence, by design. The Phase101/104/105
    reviewed tiers remain the only route, and they need method, originality and independence review.

**Not changed:**

- the Phase249 policy and the research policy;
- no source registration, no ranking, no live request;
- no teaching packages imported.
