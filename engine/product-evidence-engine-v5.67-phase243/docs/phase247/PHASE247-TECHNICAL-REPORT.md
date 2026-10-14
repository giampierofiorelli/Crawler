# Phase247 — Extraction generalization, reusable knowledge, relational category knowledge

**Base:** `b7f9d4c` (Phase246). **Date:** 2026-10-14.

All numbers in this report come from runs in this session. Strict first-run held-out results are kept unchanged in their own files. Adjudication is recorded separately in `evaluation/phase247/heldout-adjudication.json`.

## 1. Assessment: the most important problems found

1. **Extraction had been tuned to the pages it was developed on.**
   - The Phase245 sets scored 0.97–1.00 recall *after* tuning on them.
   - The first genuinely new pages (Phase246) scored 0.10.
   - The failures were not in HTML parsing. Every failure traced to one of three causes:
     - **page entity identity**: duplicate JSON-LD Product blocks made the main product ambiguous, so every value was withheld;
     - **attribution**: upsell-card prices were assigned to the main product, and a stale structured-data price appeared on a discontinued page;
     - **value normalization**: axis-marked dimensions and counted items were not parsed.
2. **Product identity was fragile in ways no metric captured.** This is the most important finding.
   - Comparison widgets keyed product columns by a *price* ("£175.98") or by "This item".
   - Category pages, review pages and JavaScript app shells became "products" from their titles alone.
   - The same Lelit machine became two records, because a later page revealed a stronger identifier.
   - Each of these would silently corrupt a product database.
3. **Retention policy, not storage, blocks reusable product knowledge.**
   - No source has a reviewed `fact_storage` policy, so 1,346 observed declarations are counted but not kept.
   - The revisit planner shows the consequence: once the revisit interval passes, re-researching a metadata-only source is "low value", because a refetch yields only a hash.
4. **The code repository is public.**
   - The committed evaluation gold and result files contain short declared values (prices, dimensions) from third-party pages.
   - The knowledge shards contain product names, URLs and hashes.
   - These are factual and short, but they are publicly visible. This is the user's decision (§5).
5. **Access, not extraction, limits real-world coverage.**
   - Of 46 product pages attempted in this wave, only 16 were fetched.
   - The others failed on robots.txt returning 403, refusals, stale URLs, cross-site redirects, or JavaScript-only shells.
6. **Phase243 prioritization ignored diversity and positive evidence at ties.**
   - One prolific site could fill a wave: the toaster wave was 6 of 6 Dualit.
   - A lead carrying a reviewed independent-test strength was treated like any unverified lead.

## 2. Implemented improvements and why

### 2.1 Extractor: generic interpretation fixes (`src/phase245_spec_extraction.ts`, `phase245_value_normalizer.ts`, `phase245_table_grid.ts`)

No site-specific rules were added. Each version was frozen before any new held-out run:

| Version | Commit | Change |
|---|---|---|
| spec-extractor-2 | `2921304` (frozen) | Entity resolution: JSON-LD Product nodes cluster on a shared strong identifier, the same resolved URL, or the same exact name, never on similar names. The subject is the entity bound to the canonical URL, otherwise the one whose name is the page heading. All nodes of the subject contribute. Prices under non-price labels are product cards. A listing that says "discontinued" does not promote its price. Text-only card groups without spec context are held back. "Attribute value" list items are split. Axis-marked dimensions, counted items and `cc` are normalized. |
| spec-extractor-3 | `eb249e2` (frozen) | One-row key/value tables. `<br>`-separated "Label: value" lines. Structured data that disagrees with a visible declaration is held back and both are flagged. Described quantities ("Water tank 1.9L"). |
| spec-extractor-4 | `c1d4baf` | Comparison widgets: a price or "This item" never names a product; a Name/Product row identifies the columns. **Development-only:** made after seeing held-out set 2. |

**Alternatives considered.**
- A third-party HTML parser or a readability library: rejected. No observed failure came from parsing or main-content detection.
- An ML entity model such as GLiNER: not justified. The errors were structural (which entity a value belongs to), not about recognizing spans.
- No dependency was added.

**Transport.** Redirects are still never followed by the transport. It now *reports* the target URL. The wave tool follows only same-site HTTPS redirects, each robots-checked and counted, and records every hop.

### 2.2 Persistent knowledge (`src/phase246_knowledge_store.ts`, schema v1 → v3, migrated automatically)

- **Re-derivation instead of refetch.** Identical bytes seen under new extraction rules or new identity rules re-derive only that revision:
  - unchanged values are revived;
  - reviewed declarations are kept;
  - old readings remain as `superseded_by_extractor` history;
  - product links are recomputed;
  - records that lose all support are marked `unsupported_after_rederivation`, never deleted.
- **Alias identity keys (v2).** A product later seen under a stronger identifier resolves to the same record. Identifiers accumulate on the record.
- **Product evidence rule.** A title alone does not create a product. The page also needs at least one of:
  - structured product data;
  - a product declaration;
  - `og:type` = product;
  - one or two purchase controls (a listing page has many).

  Otherwise a gap is recorded.
- **`revisitPlan246`.** Deterministic. It skips sources verified recently and refetches only when the rules changed *and* either values are retainable or an identity gap exists. It flags metadata-only revisits as low value.
- **`exportShards246` / `importShards246`.** One NDJSON file per table, in key order, with a hashed manifest. An unchanged store exports byte-identical files, so a git history shows exactly which knowledge changed. Import verifies every hash.
- **`rightsWorksheet246`** and `--rights FILE`: only operator-reviewed policies are applied. Nothing is self-granted.

### 2.3 Relational, source-graded category knowledge (`src/phase247_category_relations.ts`, schema v3)

- **`revision_properties`.** Records which attributes each page declares, as labels only and never values. This is page-structure metadata, so it is kept under every retention class. It produces a per-category **declared-attribute vocabulary**, with the note that frequency is not importance.
- **`category_relations`.** Typed relations between items and declared attributes: `enables`, `may_support`, `measured_by`, `may_risk`, `not_sufficient_for`. Each has a support grade, with promotion rules enforced in code:
  - `hypothesis`;
  - `method_reference`: must cite a revision from a test publisher;
  - `reviewed`: needs a verified receipt;
  - `evidence_supported`: also needs an independent original-test revision.
- **Compiles into the existing Phase116 `CategoryModel116`** and runs its audit, which lists goals that no method measures. Research priorities are derived from the graph:
  - goals without a measurement method;
  - hypothesis relations that need evidence;
  - methods with no results yet;
  - declared attributes with no explained outcome.
- **Relation changes are versioned.** They invalidate the compiled Phase128 artifact and create a new profile version.

### 2.4 Phase243 prioritization (`src/phase243_budgeted_category_search.ts`)

- Within equal priority, families alternate. Priority order is never overridden.
- A reviewed original-test strength adds priority to identity verification, as it already did for deep review.

## 3. Results

### 3.1 Untouched held-out sets

Hosts were never fetched before, gold was committed before the run, and each run happened once on frozen code.

| Set | Pages / expected facts | Extractor | Correct | False associations | False positives | Precision | Recall | Required abstentions |
|---|---|---|---:|---:|---:|---:|---:|---:|
| 247-1 (gold `564c39c`) | 6 / 65 + 1 listing page | **spec-extractor-2** | 42 | **0** | 3 | **0.933** | **0.646** | 6/6 |
| same pages | | old ee2336f | 41 | 5 | 4 | 0.820 | 0.631 | 6/6 |
| 247-2 (gold `3ced2c2`) | 5 / 61 | **spec-extractor-3** | 49 | **0** | 2 | **0.961** | **0.803** | — |
| same pages | | old ee2336f | 45 | 1 | 6 | 0.865 | 0.738 | — |

**Adjudicated (separate file):**
- 247-1: 43/65, 2 false positives, precision 0.956;
- 247-2: 50/61, 1 false positive, precision 0.98.

**Reading the results.**
- **What improved:** on new pages, the gain is mainly precision and association safety. False associations went 5 → 0 and 1 → 0.
- **What did not:** recall improvements were modest on these particular sets. The old extractor already managed 0.63–0.74 recall on pages without the Phase246 failure modes.
- **The Phase246 jump is a development result.** The 3/29 → 28/29 on the Phase246 pages addressed failure modes that were frequent there.
- **Sample size:** 11 scored pages from 11 hosts. That is small.

### 3.2 Development and regression sets

All are seen pages, with spec-extractor-4 (`evaluation/phase247/dev/`):

| Set | Result |
|---|---|
| Phase245 dev | 92/92 |
| unseen-1 | 30/31 |
| unseen-2 | 61/62 |
| Phase246 held-out (now dev) | 28/29 (was 3/29) |
| 247-1 (now dev) | 61/65 |
| 247-2 (now dev) | 60/61 |

These are not generalization claims.

### 3.3 Tests

**4,326 of 4,326** TypeScript tests pass: 4,302 before this round plus 24 new.
- 9 for extraction generalization;
- 6 new store tests, covering re-derivation, revisit plan, shards, alias keys, the title-only rule and unsupported marking;
- 3 for category relations;
- 2 for prioritization;
- 4 from updated store tests.

The full suite takes 28 s.

### 3.4 Prioritization audit

Source: `evaluation/phase247/phase243-audit/prioritization-audit.json`, with a budget of 6 actions over 200 synthetic seeds per shape.

| Family sizes | Families covered, before → after | Strong lead selected, before → after |
|---|---|---|
| [12,1] | 1.47 → 2 | 0.47 → 1.0 |
| [20,2,1,1] | 2 → 4 | 0.29 → 1.0 |
| [30,1,1,1,1] | 1.75 → 5 | 0.21 → 1.0 |

On the recorded toaster leads, families covered went 1 → 2.

## 4. Retained product and category knowledge (current store)

- **Store state:** schema v3; 37 sources, 59 revisions, 80 sightings; journal verified with 825 events.
- **Products:** 107 identities. 101 are active: 47 `extracted_unverified` and 54 `discovered` (named in comparison tables). 6 are marked unsupported: two review pages, a listing page, two app shells, and one duplicate.
- **Key basis of active products:** GTIN 5, brand+MPN 5, product group 3, host SKU 22, host-scoped name 66.
- **Declarations:** **0 retained**; 1,346 observed but not retained (no rights). Attribute vocabulary: 1,283 label observations.
- **Categories with products:**
  - air fryers 4, coffee machines 9, toasters 6, blenders 5;
  - steam cookers 3, deep fryers 2, kettles 2, rice cookers 1.
- **Category knowledge:**
  - 54 items: 48 assistant hypotheses and 6 method pointers;
  - 18 relations: 13 hypotheses and 5 method references (CHOICE methods, each tied to an observed revision);
  - 0 reviewed and 0 evidence-supported.
- **Phase116 audit:**
  - toasters: every goal has a measurement method;
  - coffee: "low maintenance" is unmeasured;
  - air fryers: "cook for one", "two foods at once" and "crisp texture" are unmeasured.

  **Nothing here is verified category knowledge.** What is now real is the structure that turns sources into graded knowledge, and an audited list of what is missing.

## 5. Durable storage and retention

### 5.1 Storage comparison

| Option | Cost / effort | Fit |
|---|---|---|
| **Private GitHub repo for knowledge shards** (recommended now) | free; Claude Code sessions can clone and push | Deterministic shards diff cleanly, history is the audit trail, and SQLite rebuilds in seconds. Not a concurrent database, and repo size limits apply (fine for 10⁵ products as NDJSON). |
| Object storage (Cloudflare R2 / Backblaze B2) for SQLite snapshots and a raw-byte cache | ~free tier; needs a secret and a network allow-list | Recommended as the *second* step, when a raw-byte cache becomes allowed or snapshots outgrow git |
| Managed DB (Turso/libSQL, Neon) | free tier; schema port | Only when several writers or online queries are needed |
| Persistent volume | not available in this environment | — |

**Implemented:**
- the shard export/import;
- verified backups (`VACUUM INTO`);
- the CLI (`scripts/phase246-knowledge.mjs`: `export-shards`, `import-shards`, `backup`, `revisit-plan`, `rights-worksheet`, `category-graph`, `reconcile`).

The working SQLite store at `~/.local/share/product-evidence-engine/knowledge/` is **ephemeral** in this cloud container. The only durable copy is the metadata shards committed to the public code repository (`knowledge/phase246/shards/`).

### 5.2 Retention

**What can be retained:**
- **Now, by anyone, without review:** URLs, hashes, times, product identities and identifiers, attribute labels (no values), research gaps, and assistant-authored text.
- **After a recorded per-source review:** short declared values, ≤120 characters, with property, unit, section and locator, and never page text. This needs a `WebSourcePolicy` with a rights basis, a rights document, a reviewer, a validity date and `fact_storage`.
- **Never:** page bodies, article text, images.

**Local pending-rights cache:** implemented, off by default. It is local-only, expires (default 30 days), is excluded from exports and cannot be promoted. It is useful for working within one session. It does not make knowledge durable.

### 5.3 Decisions needed from the user

1. **Create a private repository for knowledge** (for example `giampierofiorelli/pee-knowledge`) and add it to the session. Shards then go there instead of the public code repo.
2. **Decide whether the existing public files should stay public:** the evaluation gold/results with short third-party values, and the metadata shards. I have not moved or deleted anything.
3. **Rights:**
   - either review the terms of the most useful sources and record policies (`rights-worksheet` lists them by declarations observed: Dualit, Origin Coffee, Ma Caféine, DID, Euronics…);
   - or authorize the local pending cache;
   - or keep metadata-only.

## 6. Research reuse and gaps

- **Re-derived from local bytes instead of refetching:**
  - all 24 Phase245 pages and 20 Phase246 pages re-extracted with SHA verification and **0 network requests**, which avoided at least 11 refetches the planner had requested;
  - 11 previously ambiguous Dualit identities resolved;
  - 3 title-only gaps closed;
  - the duplicate Lelit record was consolidated.
- **Revalidated:** 3 regression pages from Phase246 (one byte-identical, two changed with identical extraction).
- **Not recoverable:**
  - Phase244 page bytes (hashes only);
  - Hamilton Beach spec tabs (JavaScript-loaded);
  - two app-shell pages.
- **Raw bytes in this session's scratch directory disappear with the container.**

## 7. Costs and resources

- **Live wave:**
  - 84 requests over 47 hosts, out of a budget of 90 requests and 12 per host;
  - 12.7 MB, 167 s of network time;
  - 16 pages fetched out of 46 attempted;
  - 25 stop reasons (robots 403/unknown, 403, cross-site redirects, 404/410);
  - search engine use: ~20 queries for discovery.
- **Extraction:** about 60–80 ms per page. Held-out runs took 0.29–0.38 s for 5–6 pages.
- **Store:** full re-derivation of 59 revisions took 2.7–4.5 s; report process RSS was 56 MB.
- **Tests:** full suite 28 s.

## 8. Limitations and next steps

**Limitations:**
- Held-out samples are small (11 scored pages).
- spec-extractor-4 has not been validated on held-out pages.
- Client-rendered pages are not covered by HTML-only extraction.
- No declaration values are retained.
- Category knowledge has no reviewed or evidence-supported relation yet.
- The product-page signal can still drop documentation pages that show a single "Buy" control.

**Next highest-value steps:**
1. The rights/storage decision (§5.3). Without it, product knowledge cannot accumulate.
2. A larger untouched held-out set (≥30 pages, ≥20 hosts) to validate spec-extractor-4 and measure variance.
3. Selective rendering for JavaScript shells, where permitted (Playwright is available).
4. Retrieving original test *results* (not just methods) from sources whose terms allow it, so relations can become evidence-supported.
5. A session-start hook that imports shards from the private knowledge repo.
