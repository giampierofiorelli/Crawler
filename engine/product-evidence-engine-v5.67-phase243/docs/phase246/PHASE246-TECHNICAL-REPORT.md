# Phase246 — Product Evidence Engine: persistent product and category knowledge from live research

Base: `ee2336f` (Phase245). Date of the work: 2026-10-14. Everything below reports what was actually run. Separate capabilities are kept apart: **browsing** (fetching pages under robots and budgets), **extraction** (the Phase245 extractor, unchanged), **persistence** (this phase), **category learning** (unreviewed hypotheses plus method pointers), **source verification** (not done), **ranking** (not authorized anywhere) and **production deployment** (not done).

## 1. Architecture audit and where Phase246 fits

| Existing component | What it holds | Persistent? | Phase246 relation |
|---|---|---|---|
| Phase101 `InterpretationMemory101` (sqlite) | reviewed interpretations of original-test claims | yes | unchanged; Phase246 never writes reviewed test evidence |
| Phase104 `EntityCognition104` / Phase105 `IncrementalReasoningGraph105` (sqlite) | belief journal and dependency graph for reviewed beliefs | yes | unchanged; Phase105 is keyed to Phase104 beliefs, so Phase246 keeps its own small derived-node graph for staging artifacts and does not alter Phase105 |
| Phase128 `CategoryBrain128` / Phase129 growth cycle | category concepts, proposed vs reviewed | **no** (in memory) | Phase246 persists category items and compiles them into a Phase128 brain (`categoryBrain246`, `compileCategory246`) without adding a parallel ontology |
| Phase179 study streams | labels for category learning work | no | used as labels on category items |
| Phase193 screening ledger | per-revision screening decisions | JSON file | looked up for each ingested revision (`screeningVerdict`) |
| Phase222/241/244/245 | transient live observation and extraction | **no** | Phase246 is the missing persistent staging tier |
| Phase243 budgeted wave and journal | prioritization, reversible suspension | journal file | the store exports candidates (`candidates243`), and the live wave plans with `planBudgetedCategoryWave243` |

New code:
- `src/phase246_knowledge_store.ts`: `KnowledgeStore246` (node:sqlite, no new dependency).
- `src/phase246_category_seeds.ts`: initial unreviewed hypotheses for the three categories.
- Scripts:
  - `scripts/phase246-knowledge.mjs`: operator CLI.
  - `scripts/phase246-live-wave.mjs`: bounded wave.
  - `scripts/phase246-recovery-inventory.mjs`
  - `scripts/phase246-regression.mjs`
  - `scripts/phase246-adjudicate.mjs`
  - `scripts/phase246-build-store.sh`
- Tests: `tests/phase246_knowledge_store.test.ts` (15 tests).

### Store model, enforced in code and schema

- **Sources, revisions and products are separate tables.**
  - A revision is `(url, sha256)`. `raw_body_stored` has a CHECK constraint that forces it to 0, so no page body is ever stored.
  - Identical bytes seen again are recorded as a *sighting*. A different hash for the same URL *supersedes* the old revision: its declarations become `superseded_by_revision` and dependent derived nodes become stale.
- **Product identity uses exact identifiers only.** The priority order is:
  1. GS1-valid GTIN
  2. brand + MPN
  3. host-scoped product group
  4. host-scoped SKU
  5. host-scoped name

  Similar names never merge. Variants are separate rows under their product.
- **Product identity states** are `discovered`, `extracted_unverified` and `reviewed`. The `reviewed` state needs a receipt accepted by a caller-supplied verifier.
- **Declarations** carry a fixed `evidence_role` derived from the source type (`manufacturer_declaration`, `retailer_declaration`, …).
  - Columns `independent_test_evidence` and `ranking_authorized` have CHECK constraints that force them to 0.
  - `verifyDeclarationForPurpose246` marks a declaration usable for one named purpose. It requires retained rights and a verified receipt, and it never changes the evidence role.
- **Rights gate** (`retentionFor246`):
  - `facts_retained` requires an approved Phase75 policy that is in date, with a robots check under 24 h old, *and* `fact_storage` among the permitted operations.
  - Unknown rights give `metadata_only` (identity, hash, time, counts, gaps; no declared values).
  - A refused basis or disallowed robots gives `blocked`.
  - There is an optional local `local_pending_rights_review` cache. It is off by default, expires, is excluded from exports unless explicitly requested, and can never be promoted.
- **Category knowledge** is stored as items in 12 sections. The knowledge classes are kept apart:
  - `observed_pattern`: only from retained declarations of at least 2 products; the statement always says that frequency is not importance.
  - `technical_hypothesis`
  - `reviewed_general_knowledge`: needs a verified receipt.
  - `evidence_supported_finding`: also needs a cited revision from an `independent_original_test` source.

  A profile version is appended only when the profile hash changes. Profiles carry `rankingAuthorized:false` and `performanceEstablished:false`.
- **Durability features:**
  - Append-only `events` table with a hash chain; triggers block UPDATE and DELETE, and `verifyJournal` checks the chain.
  - Schema migrations by `user_version`; the store refuses a database newer than the software.
  - Export/import with a content hash. Import refuses an existing target and a tampered export.
  - Backup with `VACUUM INTO`.
  - The store refuses a `/tmp` path unless `PEE_ALLOW_TMP_STORE` is set.

## 2. Recoverability of Phase244–245 research (no refetch)

Source: `evaluation/phase246/recovery-inventory.json` (generated without network access).

| Item | Count | Status |
|---|---:|---|
| Phase245 manifest pages | 24 (18 hosts) | **24/24 raw bytes recovered, SHA-256 verified** against the recorded hash (they survived in this session's scratch directory, which is ephemeral) |
| Main products re-extracted | 23 (22 distinct after exact-identity dedup; the two Pololu pages are one product) | re-extracted with the current extractor, not the original run |
| Promoted declarations re-extractable | 1,075 | **not retained** in the store (rights unknown); counts kept |
| Products named in comparison tables | 55 | stored as `discovered` identities |
| Phase244 receipts | 6 receipts, 40 recorded Phase241 facts, 60 discovery-only leads | receipts hold hashes and derived facts only, **not page bytes**; nothing was reconstructed |
| Gold annotations | 24 entries, 185 expected facts | **evaluation artifacts only**; never ingested as product knowledge |

What cannot be recovered or claimed:
- Robots and terms status at the original fetch time was not re-verified.
- Phase244 pages exist only as hashes. A URL plus SHA-256 is not treated as the page.
- Once this container is reclaimed, the raw bytes are gone. Only hashes, identities, counts and gaps persist in the store and export.

## 3. Preserved product knowledge (current store)

Store totals:
- 21 sources, 43 revisions, 44 sightings, 77 products, 18 variants.
- **0 retained declarations**; 1,111 declarations observed but not retained.
- 54 category items and 3 category versions.
- 32 open research gaps: 21 `declarations_not_retained_rights` and 11 `main_product_ambiguous`.
- 122 journal events; journal verified.

Product identity basis:

| Key basis | State | Count |
|---|---|---:|
| GTIN | extracted_unverified | 1 |
| brand+MPN | extracted_unverified | 3 |
| host group | extracted_unverified | 2 |
| host SKU | extracted_unverified | 6 |
| host name | extracted_unverified | 13 |
| host name (table-named) | discovered | 52 |
| any | reviewed | **0** |

Why there are no declaration values: no source has a reviewed rights policy that permits `fact_storage`. The Phase244 test-only registry was deliberately **not** converted into a rights attestation. All values were therefore observed and counted but not kept. See §9 for the decision needed.

Known identity weaknesses:
- Review pages yield page-title "products", e.g. "Switchback Travel | Keen Durand Mid WP Review". They stay `extracted_unverified`.
- Products for the new categories are thin: air fryers 2, coffee machines 2, toasters 1. 11 of the 12 Dualit product pages declare two JSON-LD Product blocks, so no identity was assigned and a gap records the reason (§6).

## 4. Category knowledge profiles (version 1 each)

All three categories cover all 12 sections. **No item is reviewed. Nothing here is verified knowledge.**

| Category | Items | Assistant-authored hypotheses | Professional-method pointers (paraphrase plus observed revision) | Observed patterns | Reviewed | Phase128 snapshot |
|---|---:|---:|---:|---:|---:|---|
| air_fryers | 21 | 19 | 2 (CHOICE method) | 0 | 0 | `c4fb19b483c5…` |
| coffee_machines | 17 | 15 | 2 (CHOICE method) | 0 | 0 | `8e762042591e…` |
| toasters | 16 | 14 | 2 (CHOICE method) | 0 | 0 | `7882614c5a19…` |

- **Verified:** nothing has been verified as true.
- **Grounded in an observed source revision:** the 6 method pointers. They state *what a published lab method measures*, for example:
  - CHOICE runs four toasting cycles at a reference shade to judge evenness and repeatability;
  - it measures coffee temperature consistency over four consecutive coffees;
  - it uses fixed chip masses by basket size.

  They are tied to URL + SHA-256 and are not test results.
- **Hypothetical:** all 48 seed items. Examples:
  - usable crisping area may matter more than litres;
  - a declared bar rating describes the pump, not pressure at the puck;
  - slot width and centring may matter for thick bread.

  Each is phrased as a hypothesis or research question, and none ranks a product or brand.
- **User questions from the brief** are stored verbatim in `user_questions` and linked to goal concepts: cook for one, crisp texture, dual basket / small kitchen, espresso quality, low maintenance, even browning, repeatable results.
- **Observed patterns: none.** They need retained declarations of at least 2 products, and none are retained. They are shown working with permitted synthetic sources in test 5.

## 5. Live research wave: sites, budgets and measurements

Budget, set before the wave and enforced in `scripts/phase246-live-wave.mjs`:
- 80 requests in total, at most 25 per host;
- 1,800 s elapsed;
- 60 MB;
- 4 s politeness delay per host;
- a 401/403/429 response or a robots refusal suspends the host, with no retry.

Measured use (`evaluation/phase246/live-wave-report.json`):

| Requests | Bytes | Elapsed | Network time | Report process RSS |
|---:|---:|---:|---:|---:|
| **45 / 80** | 12.4 MB | 542 s (includes gold writing between steps) | 37.8 s | 56 MB |

| Host | Requests | Outcome |
|---|---:|---|
| dualit.com (smaller UK manufacturer) | 15 | all 200 |
| choice.com.au (independent tester, methods) | 4 | all 200 |
| lakeland.co.uk | 4 | 200; the collection listing yielded 0 product links (JS-rendered grid), so it was **low yield** and not pursued |
| origincoffee.co.uk | 2 | 200 |
| switchbacktravel.com, prodirectsport.com, brabantia.com | 2 each | regression, 200 |
| ypc.co.uk | 2 | product page **403**, so the host was suspended |
| currys.co.uk | 1 | **robots.txt 403**, so robots is unknown and nothing was fetched |
| charlies.co.uk | 3 | product URLs redirect; redirects are refused by the transport and not followed |
| which.co.uk | 2 | method page redirect, not followed |
| towerhousewares.co.uk, swan-brand.co.uk | 2 each | robots 404, sitemap 404; abandoned |
| salter.com | 1 | redirect on robots; abandoned |
| johnlewis.com | 1 | robots only; not used (budget kept) |

Discovery and planning:
- **Leads:** 93 discovery leads, recorded in `evaluation/phase246/live-wave-leads.json`. Sources:
  - one Dualit product sitemap, with offline curation that excluded parts and consumables;
  - search-result lists, with the queries recorded;
  - one listing page.
- **Phase243 plan:** `planBudgetedCategoryWave243` ran once per category with an effort budget of 6 and family = host:
  - air fryers: 6 leads, 6 chosen;
  - coffee machines: 6 leads, 6 chosen;
  - toasters: 13 leads, 6 chosen, all Dualit, because 12 of the 13 toaster leads were Dualit.

  In every plan `marketCoverageCertified` and `rankingAuthorized` were false and `discoveryMustContinue` was true.
- **Pages fetched:**
  - 3 regression pages;
  - 6 held-out pages (two substitutions after a 403 or redirect, made *before* any annotation);
  - 8 operational pages;
  - 3 professional method pages.

  The per-page yield is in the report and §6.
- **Lesser-known brands:** Dualit, Lelit (via Origin Coffee), Tower (attempted, blocked by retailers), Swan (lead only, not chosen by Phase243 within budget).

## 6. Validation, kept separate from knowledge

**Regression pages** (seen in development, so this is not holdout; `evaluation/phase246/regression.json`):

| Page | Bytes changed? | Same frozen extractor, old bytes → new bytes |
|---|---|---|
| Brabantia Bo 36 L | **No** (identical SHA) | 0 → 0 facts. **Expected abstention holds.** |
| Switchback Keen review | **Yes** (same length, different hash) | 18 → 18 facts, identical set |
| ProDirect Hypervenom | **Yes** (+171 bytes) | 3 → 3 facts, identical set; 15 variants |

**New held-out pages.** The extractor was frozen at `ee2336f` (verified unchanged with `git diff`). Gold was written from visible text and committed in `953c535` *before* the extractor ran. The extractor ran once on 6 pages and 29 expected facts.

| View | Correct | False associations | False positives | Precision | Recall |
|---|---:|---:|---:|---:|---:|
| **Strict first run** (`results/heldout-strict-firstrun.json`) | 3 | 0 | 5 | **0.375** | **0.103** |
| Phase244 baseline, same pages | 0 | 0 | 1 | 0 | 0 |
| Adjudicated (`results/heldout-adjudicated.json`; decisions recorded with reasons) | 4 / 30 | 2 | 2 | 0.500 | 0.133 |

What the adjudication changed:
- One gold omission was accepted: Lelit "Interface" is a single value.
- Two strict false positives were re-labelled as **false associations**: related-product prices (£25 cup, £2.95 guide) attributed to the Lelit main product.
- One false positive is a **stale structured-data price** (£59.99) on a discontinued Lakeland page whose visible text says Unavailable.

Why recall was low:
- On 4 of 6 held-out pages (all Dualit) and 7 of 8 operational Dualit pages, the page declares two JSON-LD `Product` blocks ("Air Fryer - Black" and "Air Fryer"). The extractor correctly refuses to merge similar names, marks the main product ambiguous, and **holds back** every value: 15 held back, 9 of which equal the gold value. These are counted as misses in both views, not as correct.
- Unlabelled list lines inside a card ("Boiler capacity 250 cc") are held back as "multiple values for one label".

No extractor change was made in this phase. Any fix (for example, merging two JSON-LD blocks only when they share the canonical URL and image) would need a new untouched evaluation set. **These pages are now spent as holdout.**

## 7. Lifecycle tests (`tests/phase246_knowledge_store.test.ts`, 15 tests, all passing)

1. A live observation (synthetic HTML through the real Phase245 extractor) becomes an `extracted_unverified`, GTIN-keyed product. Its declarations have the role `manufacturer_declaration`, and no page text is stored (checked against a marketing sentence).
2. and 3. A new store instance reads the product and its values without the page. Identical bytes produce a sighting with no new products, declarations or revisions. The same GTIN on another host merges into the same product as a second source. The same name with a different GTIN does not merge. Name-only keys never merge across hosts.
4. ProductGroup variants are distinct rows with their own declarations, and are not reported as conflicts.
5. Observed patterns come only from retained declarations of at least 2 products and carry the frequency disclaimer. Assistant-authored patterns and directly asserted reviewed classes are rejected. A new observation makes the patterns stale.
6. Reviewing a category item makes `compiled128:<cat>` stale and also its transitive dependant. The unrelated category stays fresh. Recompiling yields a Phase128 `reviewed_definition` with source role `original_expert_method`. Versions increment only on change.
7. A new revision of the same URL supersedes the old declarations and stales the dependent summary. Disagreement between sources is kept as a conflict, not resolved by vote or recency.
8. Unknown rights keep metadata only and record a gap. Blocked robots store nothing. "Robots allowed" without `fact_storage` is not enough to retain values. The pending cache is not promotable, not exported by default, and is purged on expiry.
9. Manufacturer declarations cannot be set as test evidence or ranking input; SQL CHECK constraints block it. Verification for a purpose keeps the evidence role. An evidence finding citing a manufacturer page is rejected. The Phase243 wave over store candidates is `rankingAuthorized:false`.
10. A child Node process reloads from the database file and from a `VACUUM INTO` backup. Export → import into a new file gives identical reads. Import refuses an existing target and a tampered export.
    - 10b. The store refuses `/tmp` by default, refuses a newer schema, and the event journal is append-only.
11. Phase243 budgets apply to store candidates (unknown-rights stub included). Host suspension works: 2 restrictions, or 1 robots refusal, then a reversible lift. A Phase193 unscreened revision gets `screen_required_new_document` and a gap.
12. Full suite: **4,302 / 4,302 pass** (4,287 before this phase plus 15 new). No existing test was changed.

Additional tests: stale robots check downgrades retention; seeded profiles cover all 12 sections and compile through Phase128; an ambiguous main product records a gap instead of guessing.

## 8. Storage location, backup and recovery

| What | Where | Durable? |
|---|---|---|
| Working store | `$PEE_KNOWLEDGE_DIR/pee246.sqlite`, default `~/.local/share/product-evidence-engine/knowledge/pee246.sqlite` | **No, not in this environment.** The cloud container is reclaimed after inactivity. |
| Backup | `~/.local/share/product-evidence-engine/backups/pee246-<timestamp>.sqlite` | Same limitation |
| Portable export (metadata only, no declaration values, no page text) | `knowledge/phase246/pee246-export.json` in the repository, with content hash | Survives through git. It is **not** a rights-cleared publication of product data. |
| Raw page bytes | session scratch directory only | **Ephemeral**; never committed |

Commands:

```bash
# status / backup / export
node scripts/phase246-knowledge.mjs status
node scripts/phase246-knowledge.mjs backup --out ~/pee-backups/pee246-$(date +%Y%m%d).sqlite
node scripts/phase246-knowledge.mjs export --out knowledge/phase246/pee246-export.json

# recover in a new machine/session from the committed export
npm run build
node scripts/phase246-knowledge.mjs import --from knowledge/phase246/pee246-export.json --db ~/.local/share/product-evidence-engine/knowledge/pee246.sqlite

# rebuild from recorded inputs when raw bytes are still available (hash-checked)
RAW_RECOVERED=dir1,dir2 WAVE_STATE=state.json WAVE_RAW=dir scripts/phase246-build-store.sh
```

## 9. Rights and retention limitations

- No source in this phase has a reviewed rights policy. Every value was therefore observed but **not retained**; the store keeps identity, hashes, times, counts and gaps.
- Robots allowance and public URLs were treated as technical access only, not as permission to store or reuse.
- The Phase244 test-only registry was **not** used as a rights attestation.
- Method pointers are short paraphrases written by the assistant, with a link to the observed revision. No article text is stored or committed.
- The committed export holds URLs, hashes, product names and identifiers, and assistant-authored category text. A publication or redistribution decision is still the operator's to make.

**Decision needed (not decided here):**
- (a) a durable destination for the store: for example a private repository or bucket, a mounted volume, or the user's own drive receiving the export file;
- (b) per-source rights policies with `fact_storage` for the sources whose values should be kept (for example the manufacturer pages), or a decision to enable the local, expiring pending-rights cache.

Until then, nothing here should be described as permanently preserved product knowledge.

## 10. What remains unverified or undone

- **Identity and verification.** No product identity, declaration or category item is reviewed. There is no source verification and no authentication of publishers.
- **Category knowledge.**
  - Category profiles are hypotheses plus method pointers. No performance outcome is established for any product.
  - There are no observed patterns for the new categories, because no values are retained.
  - Coverage is very small: 5 identified products across the three categories. The toaster sample is single-brand (Dualit). Tower products were not reachable under the access rules.
- **Extraction and evaluation.**
  - The extractor has a confirmed weakness on pages with duplicate JSON-LD Product blocks.
  - Held-out recall is 0.10 strict / 0.13 adjudicated. That is a result, not a target.
- **Not done in this phase.** The Phase105 graph is not wired to staging nodes. There is no automated re-observation schedule, no PDF manuals, and no reviewer UI.
- **Separate capabilities.** Browsing worked within budget. Extraction quality is as measured above. Persistence works, as shown by the tests and the reload checks. Ranking and production deployment were not attempted.
