# Continuous scientific learning — Step 1D-A2: HTML-first semantic reading and reuse of existing capabilities

This is the owner's Step 1D-A2 brief of 2026-10-17. It follows Step 1D-A (`docs/plans/experience-pilot-step1d-a.md`,
0d87903) and supersedes no report.

**Constraints observed:**
- **HTTP:** none (0 requests); only pages already held privately.
- **Not changed:** production extraction defaults, the knowledge store and its schema, ranking, retention and signing
  (production signing stays disabled).
- **Not created:** no parser framework, database, publisher memory, CSS-selector list or product dictionary.
- **Step 1D-B:** not started; its research budget is untouched.

**Tier:** all results are **development evidence**. The Step 1C, Phase272 and Step 1D-A pages were examined while the
contract was built; nothing here is held-out. The Step 1C first run (93efede) and the Step 1D-A baseline (0d87903) are
preserved and reproduced exactly (§5.4). The reported runs use the frozen build ebda3d4.

## 0. Outcome

1. **The loss was architectural, as the owner suspected.** Phase245 already rebuilds the DOM, page regions, JSON-LD
   identities and table grids, but no measurement reader receives any of it. Each reader re-reads the raw HTML with regular
   expressions, and the Phase226 table reader rejected all 33 tables on these 21 pages (§1, §3).
2. **Reusing the Phase245 table grid recovers values that were being lost.** The values sat in table cells whose unit and
   measure name were in the row or column header. On the Phase272 untouched set (163 gold values, spent):

   | Arm | Correct | Missing | Wrong product / false identity | Unresolved | Declarations read as results (negative controls) |
   |---|---|---|---|---|---|
   | A (Step 1D-A) | 60 | 93 | 6 / 0 | 4 | 16 |
   | B (+ structural identity and context) | 60 | 93 | 6 / 0 | 4 | 16 |
   | C (+ structured test-table reader) | **86** | **60** | 12 / 2 | 3 | 16 |

   - 0 regressions on all three sets; no additional declaration read as a test result; 0 improper merges.
   - The 8 new wrong items in C are 6 variant-name disagreements between the page's own table header and the gold, plus 2
     scorer artefacts on an identical name (§10). None binds a value to another product family.
3. **Structural identity improves recognition without new merges:**
   - gold products found by the inventory: 28 → 34 of 37 (untouched set), with no new split, merge or non-gold product;
   - headline sentences proposed as the page's main product: 6 (A) → 0 (B) (§5.2);
   - qualitative findings bound to a wrong product: 10 → 6 (untouched) and 3 → 2 (development), with one more correct
     (§5.3).
4. **The contract reaches the ordinary observation path in shadow mode.** `phase246-live-wave.mjs observations
   --shadow-semantics` reads 19 retained pages and finds 49 table values. Its ingested observations are identical to the
   default run, timings aside. The persistence screen admits 0 of the 49 (§4).
5. **Duplication found and not yet removable:** 7 regex table parsers in 6 modules, 4 HTML flatteners and 9
   heading/section rules (§1.3). The contract gives one shared structural reading. The old readers stay, because the default
   path must remain byte-identical (54 of 54 pages, §5.4).
6. **Recommendation:** freeze arm C (ebda3d4) as the Step 1D-B candidate, with the checks in §11. It is ready for an
   untouched test. It is not ready for production.

## 1. Map of reusable capabilities and information-loss boundaries

Traced from call sites and data contracts (the audit read the modules, not their names).

### 1.1 What each module discovers and who receives it

| Module | Discovers | Kept? | Received by | Lost or re-derived |
|---|---|---|---|---|
| `phase245_html_dom.ts` (`parseHtml245`) | Full DOM with parent links, raw-text bodies (JSON-LD, `<title>`), entities | Transient tree | Phase245; `phase248_safety_notices` | Never reaches a test reader |
| `phase245_spec_extraction.ts` (`classifyRegions245`) | Boilerplate tags/roles, class-word markers, related microdata, item listings, comparison markers | Internal map only | Nobody outside Phase245 (a count survives) | Readers have no region model; Step 1D-A used "from the first h1" |
| `phase245_spec_extraction.ts` (`extractSpecifications245`) | JSON-LD/microdata Product, `itemReviewed`, `@graph`, identifiers; `og:*`; nearest-heading section; tables via the grid | `mainProduct` + facts | Readers use `mainProduct.name` only | Review objects, ItemList, canonical URL and `<title>` are discarded |
| `phase245_table_grid.ts` | rowspan/colspan slots, header rows/columns, captions, multi-level header paths, products in rows/columns | Grid + readings | Phase245 only | `id`/`headers` captured, unused; never offered to test readers |
| `phase225` `textBlocks225` | `p/li/td/th/h1-6` text by regex | Strings (+ tags on request) | All test, qualitative and comparative readers | div/span/dd/figcaption/blockquote text, links, attributes, cell positions and heading levels; no region skipping |
| `phase225` guided pass | A plan unit plus a taught term in the sentence or previous block | ≤20 / ≤40 records per page | `phase265` → store | A table cell's label is the previous cell, not its header; record caps |
| `phase226_transient_test_tables.ts` | Only flat tables (thead/tbody, one header row, `scope`/`headers`, method prose ≤280 characters before) | ≤20 | Phase225 | Rejects any colspan/rowspan, nested markup or missing thead: **0 results on all 21 pages, 33 tables skipped** |
| `phase265` `comparisonCells272` | Header row of ≥2 product names; cell text → column product | Map keyed by cell text | Step 1C candidate | Position is lost: equal cell texts in two columns become ambiguous |
| `phase269` qualitative, `phase270` comparative | Their own regex tables and nearest-heading rules | Observations | Store (qualitative codes; comparative v8) | Same flattening |
| `phase153_entity_inventory.ts` | Open-class name lattice over plain text | Offset spans | Phase154/155 only (a diagnostic count in Phase225) | Not consumed by the observation path |
| `experience_entity_inventory.ts` (Step 1D-A) | Model-token spans, typing, alias links, heading-hierarchy section | Inventory | Step 1C candidate (evaluation) | Saw no structure: no JSON-LD, no table headers outside the blocks, no regions |

### 1.2 Where information is lost (census of the values arm A never reads)

Source: `scripts/step1d-a2-missing-census.mjs` → `evaluation/experience/step1d-a2-missing-dev1.json`.

| Set | Missing in A | In a table cell | Prose, unit next to the value | Prose, unit elsewhere | Outside reader blocks | Absent from the HTML |
|---|---|---|---|---|---|---|
| Phase272 untouched | 93 | 66 | 19 | 7 | 1 | 0 |
| Step 1C pages | 26 | 16 | 4 | 4 | 2 | 0 |
| Phase272 development | 4 | 0 | 4 | 0 | 0 | 0 |

- **Every unread value is in the HTML.** None is absent, and none is only in scripts.
- **Most unread values are table cells:** 82 of 123. Their unit or measure name is in the header, which the flat block list
  separates from the number. This is the boundary arm C crosses.
- **Record caps:** lifting the probe's 20/40-record and 8-per-block caps on a scratch copy of the build reads 7 more Step 1C
  values, all correct (all on the bedroom roundup). The caps were kept (§8).

### 1.3 Duplicated responsibilities

| Responsibility | Implementations | Shared now? |
|---|---|---|
| HTML → text | `phase225` fragment/decode; `phase226` txt/entities (6 named entities only); `phase241` noTags; `phase245` textOf245 | The contract reuses `textOf245`, aligned to `textBlocks225` |
| Table parsing | `phase226`; `comparisonCells272`; `phase269`; `phase270`; `phase241` (×2); `phase242` | The contract uses `buildTableGrid245`/`interpretTableGrid245` only |
| Section and heading context | 9 rules (phase225 cue length; 269 h2–h4; 270 h1–h6 and 6000-character look-back; 265 h1–h3; 1C nearest; 1D-A chain; 245 nearest) | DOM heading hierarchy in the contract |
| Product mentions | `documentMentions272`, `MODEL_TOKEN`, 269 `MODEL_WORD`, 270 `MODEL`, 1D-A `modelLike1D`, 1C `prepareMentions1C` | Not merged (§2) |
| Units | 5 normalisers | The table reader uses the Phase272 lexicon only |

The old parsers were not removed. They define the default path, which must stay byte-identical until a held-out test
justifies switching.

## 2. Phase153 versus Step 1D-A

- **Why Step 1D-A built its own detector.** Phase153 takes plain text only. Its candidates are offset spans with no block
  or heading structure. It accepts any run of three or more capitalised tokens anywhere, including headings, menus, bylines
  and chains across paragraph breaks. It proposed 28–118 entities per page, and its links only ever abstain (a monotone
  veto). Step 1D-A needed typed entities, alias links and section scope tied to the readers' blocks.
- **Why Phase153 found 15 of 17 Step 1C gold products.** Its open-class lattice nominates code-less multi-word names that a
  model-token anchor never sees.
- **Measured as a candidate source for the Step 1D-A resolver.** The filter is conservative: `possible_product` plus a
  recurring surface or a title match.

  | Set | Phase153 proposals, all → filtered | Gold products among filtered | Gold products B misses that it would add | Filtered proposals naming no gold product |
  |---|---|---|---|---|
  | Phase272 untouched | 456 → 56 | 16 | **1** (IQAir Atem X) | 30 |
  | Step 1C pages | 180 → 24 | 6 | 0 | 14 |
  | Phase272 development | 81 → 12 | 4 | 0 | 5 |

- **Decision: not connected.** One gained product would cost 30 unsupported candidates on the same pages (49 over all
  sets). The structured names in §4 already supply most of the code-less names, with provenance and no noise. These are
  Ninja Crispi, the T-Fal and Sharp air fryers and the PuroAir comparison rows: 28 → 34 found. Phase153 remains the
  open-class option for pages with no structured identity, behind the same typing rules. That is a separate question for
  Step 1D-B, not a gain shown here.

## 3. Phase245 versus Phase225/226 structural reading

| Aspect | Phase245 (grid and DOM) | Phase225/226 (regex) |
|---|---|---|
| rowspan/colspan | Rebuilt into slots; shared cells distributed and flagged | Table rejected |
| Header rows/columns | Leading th rows and columns, implicit header row, multi-level paths, full-width section titles | Exactly one header row |
| `scope`, `id`/`headers` | `scope` used for header rows; `headers` captured, unused | Flat `id`/`headers` check required |
| Products in rows or columns | Both, with a key column; "Model/Name" rows | First column must be a model label equal to the page lead |
| Nested markup in cells | Read through the DOM | Cell rejected |
| Caption | Kept | Used as method context |
| Method context | None | First-person prose ≤280 characters before the table (**reused by the contract**) |
| Regions | Boilerplate model (see below) | None |

Two Phase245 behaviours could not be reused as they are:
- **Over-strict region model for test reading.** The class word `reviews` on a TechRadar `<article>` excludes the whole
  review, test data table included. Whole HouseFresh comparison tables fall "outside main". Applied as is, it would hide
  the blocks of **43 of the 93** unread untouched values and 54 of the 162 locatable untouched gold values. The contract
  therefore excludes only boilerplate tags/roles, related-product microdata and item listings:
  - this hard exclusion covers 0 untouched gold values;
  - it covers 4 Step 1C gold values, but it only stops identity spans being taken from those blocks; values there are still
    read (0 regressions);
  - the class-word reasons are reported, not applied.
- **Comparison tables with a placeholder corner** ("Row 0 - Cell 0") are read by Phase245 as products-in-rows, taking the
  row labels for products. The contract does not trust that orientation. It decides orientation from which header group
  names the document's own products (§4). It uses no placeholder pattern.

## 4. What was integrated, and what stays gated

**New transient contract** `src/document_semantics.ts` (`readDocumentSemantics1D2`, 249 lines). It is built from
`parseHtml245`, `classifyRegions245` and `buildTableGrid245`/`interpretTableGrid245`, with no new parser. It states:
- **metadata:** `<title>`, `og:title/type/url`, canonical URL, h1s and JSON-LD types. Products are classified as top-level,
  reviewed item (a Product carrying a Review, or `itemReviewed`) or ItemList entry. Only Product entries count in an
  ItemList, so pros/cons lists and breadcrumbs do not;
- **page type:** single-product review, product detail, comparison, roundup, methodology or other, each with the signals
  that set it;
- **principal product:** only on single-product pages, from structured identity;
- **conflicts:** recorded, never resolved. They cover a name absent from the headline, a headline sentence used as a
  structured name, a "Review" suffix removed, and several structured products;
- **per reader block** (the same `textBlocks225` list, aligned to DOM nodes by text: at least 99.0% of blocks aligned on
  every page): region and reason, DOM heading path, section role (methodology, test results, specifications), links (text
  and absolute URL), emphasis, figure, table cell position;
- **per table:** grid, header rows, cell labels (row and column header text), caption, heading, and context (test,
  specification, unknown). The context comes from the table's own heading, caption and header, or from first-person method
  prose directly before it (the Phase226 rule);
- **names with provenance:** JSON-LD; table product headers (only header groups mostly made of name-shaped cells; never the
  first column of a key/value specification table); link texts.

**Consumers reached (narrow optional extensions only):**

| Consumer | Extension | Effect |
|---|---|---|
| Step 1D-A inventory | `structured: {names, excludedBlocks}` | Structured names become product forms with their source. A name that only adds category-noun descriptors ("… OLED", "… Dishwasher") to one document form is that form. Size or edition words ("XL", "Pro", "Series") never qualify. Boilerplate blocks are not read for identity |
| Step 1C candidate | `cellOf(blockIndex)` | A table cell's product comes from its own header by grid position, before the cell-text map. A non-product header leaves the value unresolved |
| Phase265 `testLeadsFromHtml265` | `semantics` (with a plan only) | Structured test-table reader (§4.1) |
| Phase269 qualitative | Existing `mentions`/`page` options fed from the contract | Scope from structural identity (§5.3) |
| Ordinary observation command | `--shadow-semantics` | Counts only. The ingested observation is identical; the persistence screen admits 0 of 49 table leads |

**4.1 Structured test-table reader** (`structuredTableLeads1D2`). It reads cells of non-boilerplate, non-specification
tables. A table of unknown context is read only for rows whose own label is a test cue. A value is kept only if all of
these hold:
- the unit is in the cell, or is the single unit named by the cell's own labels;
- the unit is in the category plan;
- a taught term or dimension word appears in its labels;
- there is no declaration cue and no certification body (AHAM, ANSI, ISO, IEC, ENERGY STAR, UL, CE) in the labels;
- it is not a range, a bound or a price.

Several values in one cell are read separately. Its leads carry methodCue `structured_table_measurement_term`, which
`screenTestLead265` does not admit.

**Intentionally gated:**
- the default path (no plan) is byte-identical to Phase272 arm A on 54 of 54 retained pages;
- no structured-table lead can reach the store;
- the new inventory and candidate inputs are evaluation-only;
- page type, principal and conflicts are not shown to users;
- links are leads, never identity or product evidence;
- template signatures are not operational (§7).

## 5. Before/after metrics (development; build ebda3d4; `evaluation/experience/step1d-a2-dev1.json`)

### 5.1 Measurements (items scored by the frozen Step 1C scorer)

| Set (gold) | A: correct / wrong / false id. / unresolved / missing | B | C | Regressions vs A (B, C) | New wrong vs A (C) |
|---|---|---|---|---|---|
| Phase272 untouched (163) | 60 / 6 / 0 / 4 / 93 | 60 / 6 / 0 / 4 / 93 | **86 / 12 / 2 / 3 / 60** | 0, 0 | 8 (§10) |
| Step 1C pages (102) | 72 / 0 / 0 / 4 / 26 | same | same | 0, 0 | 0 |
| Phase272 development (28) | 24 / 0 / 0 / 0 / 4 | same | same | 0, 0 | 0 |

The table reader produced 51 leads on the untouched set that arm B does not: 43 correct, 6 wrong product (variants), 2
false identity (scorer), and 0 values that are not in the gold.

### 5.2 Identity and page structure

| Measure (untouched; Step 1C; development) | A | B |
|---|---|---|
| Gold products found by the inventory | 28/37; 17/18; 4/5 | **34/37**; 17/18; 4/5 |
| Gold products split across entities | 3; 2; 0 | 3; 2; 0 |
| Product entities naming no gold product | 58; 15; 14 | 58; **12**; **12** |
| Improper merges | 0; 0; 0 | 0; 0; 0 |
| Headline sentence proposed as the page's main product (21 pages) | 6 | **0** |

- **Single-product pages:** identical principals in A and B (both from the Phase245 JSON-LD).
- **B's gain:** it never takes a headline sentence for a product (5 comparison/roundup pages and IQAir).
- **The IQAir page:** the structured name is itself a headline, so B leaves the principal empty and records the conflict.
  That product is missed there.
- **Method:** the automatic principal score (gold principal = subject of at least half the gold values) is crude, because
  reviews dominated by comparison tables have no such subject. The counts above are a developer adjudication of the names
  each arm proposed, and are labelled as such.

### 5.3 Qualitative scope (Phase269 reader; B feeds it the contract's mentions and principal)

| Set (qualitative gold items) | Correct | Wrong product | Unresolved | Emitted findings bound to a non-gold product |
|---|---|---|---|---|
| Phase272 untouched (101) | 38 → 39 | 10 → **6** | 1 → 4 | 23 → **15** |
| Phase272 development (16) | 6 → 7 | 3 → **2** | 1 → 1 | 10 → 9 |

Qualitative recall is unchanged (52 and 6 missing): structure narrows scope, it does not find new findings.

### 5.4 Reproducibility, replays and metamorphic relations

- **Step 1C candidate without the new hooks:** 7 / 1 / 13 / 55 on the Step 1C pages, the frozen first run exactly.
- **Arm A** reproduces the Step 1D-A results exactly on all three sets.
- **Default (no-plan) path:** identical to Phase272 arm A (09526c4) on 54 of 54 pages.
- **Replays with arm C:**
  - Step 1A: 9 preserved, **4 corrected (3 in Step 1D-A)**, 5 persistent, 0 lost;
  - Step 1B: 1 preserved, 4 corrected, 1 persistent, 0 lost.
- **Metamorphic relations (T1):** **6 of 6 hold**. "Product columns swapped" was violated in every arm since Step 1B; it now
  holds, because the grid reader binds by column position and the fixture's method sentence gives the table its test
  context. The fixture was known: development evidence.
- **Synthetic adversarial tests** (`tests/document_semantics.test.ts`, 10 tests, fictional brands):
  - markup-only changes;
  - inserted navigation with product links;
  - title contradiction;
  - headline as a structured name;
  - pros/cons ItemList versus product ItemList;
  - changed heading nesting;
  - linked competitor;
  - multi-product table with a placeholder corner;
  - specification table, certification label and a bare number without a unit label;
  - variants in table headers ("K10" / "K10 Pro" / "K10 XL") and a descriptor-only extension.
- **Suite:** full suite 4,584 tests pass; vertical fitness and contract tests pass. Debt D11 was added to the contract.

## 6. Contributions (ablations of C on the untouched set)

| Component off | Correct | Wrong + false id. | Reading |
|---|---|---|---|
| none (C) | 86 | 14 | |
| grid cell products (`cells`) | 73 | 27 | Without position, table values fall to the page or section product: **21 new wrong** |
| table product-header names | 83 | 11 (+6 unresolved) | Header names let comparison rows bind |
| JSON-LD names | 86 | 14 | No effect on values (identity recall only) |
| link names | 86 | 14 | None |
| boilerplate exclusion | 86 | 14 | None on these pages |
| structural principal | 86 | 14 | On the Step 1C pages, turning it off adds 1 wrong value |
| table reader with every B component off (T) | 73 | 27 | The table reader alone is unsafe |

**Tables carry the gain. Position-based attribution is what makes it safe.** Metadata and structured data improve
recognition and page roles, not the value counts.

## 7. Source and template learning (bounded proof)

`scripts/step1d-a2-template-signatures.mjs`, run on 30 acquired pages from 5 publishers, gives
`evaluation/experience/step1d-a2-templates-dev1.json`. Each page gets a structural signature, with no text and no CSS
selectors. The other pages of the same group predict the held-out page:

| Feature (leave-one-page-out agreement) | Publisher host | Host + page type | Host + page type + category |
|---|---|---|---|
| Structured-product shape (reviewed item / headline in name / none) | 18 of 30 | **27 of 27** | 25 of 25 |
| "Review" suffix in the structured name | 29 of 30 | 27 of 27 | 25 of 25 |
| Test-table shape | 20 of 30 | 16 of 27 | 17 of 25 |
| Heading that introduces the test table | 21 of 30 | 17 of 27 | 17 of 25 |
| Where the gold values sit (test table / prose / …) | 18 of 30 | 14 of 27 | **17 of 25** |

Remaining cases in each column had no majority to predict from.

- **A publisher is not a template.** TechRadar uses distinct comparison and review templates. Tom's Guide TV reviews carry
  comparison tables; its air-fryer reviews carry none.
- **Template identity facts transfer within a publisher's page type.** These are where the reviewed product is declared and
  the habit of putting the headline or "Review" into the structured name.
- **Where results sit also depends on the category.** It transfers only within publisher, page type and category, and even
  then it misses 4 of 25. Those 4 count as changed layouts. The generic reader keeps running, so each would be detected.
- **No existing store or experience mechanism holds such lessons yet.** The experience cases can carry them as provisional
  cases (family, provenance, counterexample). Nothing was promoted, and no publisher table or database was created.
  Publisher authority was never used as evidence of testing: every value still needs its own test context.

## 8. Cost, performance and safeguards

- **Cost:** the contract costs 38–62 ms per page on average (by set). A whole document takes 106–255 ms for A→C under the
  evaluation harness. The DOM never truncated (≤8,144 nodes; cap 250,000). No dependency, service or HTTP request.
- **Size:**
  - contract: 249 lines;
  - inventory: 48 changed lines;
  - candidate: 7;
  - Phase265: 13;
  - Phase225: 5 (type only);
  - tests: 91;
  - evaluation, census and template scripts: 272.
- **Safeguards kept because a risk was demonstrated:**
  - grid-position binding (without it, 21 wrong values);
  - certification and declaration labels (in a development iteration, AHAM CADR ratings were read as results: 3 negative
    controls);
  - specification-table exclusion;
  - descriptor words limited to category nouns (in development, an "XL" size word treated as a descriptor merged a variant;
    fixed before the reported run);
  - no product from a link alone;
  - the persistence screen.
- **Over-strict and not applied:** the Phase245 class-word regions (§3).
- **Over-strict but kept unchanged:**
  - **the record caps** (7 correct values hidden). Changing them changes the default path, so this is left as an
    owner-visible decision after Step 1D-B;
  - **the sentence-level "according to" declaration cue.** It rejects "according to our sensor" (1 value); it is a
    linguistic rule and was not pursued here.

## 9. Remaining unread evidence and why (arm C; `evaluation/experience/step1d-a2-missing-dev1.json`)

**Phase272 untouched: 60 missing.** First rejecting gate:
- **Category vocabulary:**
  - 24 TV gamut percentages (% is not in the TV plan);
  - 8 Delta-E values (a unit-less metric not in the generic lexicon);
  - 4 °C and 2 pence values (not lexicon units);
  - 1 noise value (dB is not in the air-fryer plan).
- **Prose without the taught term:** 9 (3 with no term in the sentence, 6 with the unit elsewhere).
- **Defensible rejections:** 1 range, 1 hypothetical "if you…" sentence, 1 "according to" cue.
- **Later reader rules:** 4.
- **Tables:** 2 cells with no unit in cell or labels; 1 specification table; 1 table of unknown context.
- **Outside the reader blocks:** 1.

**Step 1C pages: 26 missing.**
- **Per-product summary boxes with no test cue:** 15 table cells (HouseFresh boxes such as "Noise level in decibels…": not a
  test context, so not read). The existing guided reader would read 7 of them if its record caps were lifted (§1.2).
- **Unit only elsewhere:** 3.
- **Ranges:** 2.
- **Outside the reader blocks:** 2.
- **Units outside the lexicon:** 3 (Delta-E, USD/year, microns).
- **Later rule:** 1.

**Phase272 development: 4 missing.** A range, a hypothetical sentence, no taught term, and a later rule (1 each).

What would recover more, in order of value:
1. **Teach the TV plan gamut coverage and Delta-E** (category science; 32 values).
2. **A reviewed rule for summary boxes inside a tested product's section** (15 values).
3. **The cap decision** (7 values).

None needs new HTTP.

## 10. Incorrect or uncertain cases in C

| Gold subject | Read as | Values | Nature |
|---|---|---|---|
| Candy CF 57CF0W-80 | Candy CF 57CF0W (Test Data table header) | 2 | Variant suffix: the page's header omits it (EX-32 family) |
| Samsung S85H (series) | Samsung QE65S85H (Test Data table header) | 2 | Series vs full regional code (EX-31 family) |
| Winix A230 | Winix A231 (comparison row header) | 1 | The page's row names A231; the gold names A230 |
| CleanAirKits Luggable XL-7 | CleanAirKits Luggable XL (row header) | 1 | Size or variant suffix in the gold, not in the row |
| Smart Air Sqair | Smart Air Sqair | 2 | **Scorer artefact:** the frozen scorer treats "Smart Air" as generic words and calls the identical name a false identity |

- **Six of the eight read the exact name the page prints in the table header**, where the gold annotator chose a related
  variant. They need a variant-statement rule or annotation review, not a looser match.
- **The scorer artefact** stays as it is (the scorer is frozen) and is reported here.
- **Distinct identity problems in C:** 11, covering 21 measurements. That is 2 more than in Step 1D-A, because values never
  read before can now be wrong.
  - 8 are "identity present, not used", mostly the variant cases above and the earlier grammar cases.
  - 3 are "not detected": Xiaomi Elite (a code-less name), IQAir Atem X (only a headline in the structured data), and Smart
    Air Sqair (the scorer artefact).

## 11. Readiness for Step 1D-B

**Ready to freeze arm C at ebda3d4 for an untouched test on genuinely new pages,** with these checks pre-registered:
1. **Primary:** correct values versus arm A, and new wrong or false-identity values. Variant disagreements and scorer
   artefacts are reported apart, with classes decided before scoring.
2. **Safety:**
   - no negative control (declaration) read as a result;
   - no improper merge;
   - no headline accepted as a main product;
   - default path byte-identical.
3. **Coverage:** a single-product review with a test-data table, a multi-product comparison table, a roundup and a page
   with no structured data. Use more than one category per publisher, because templates differ by category (§7).
4. **Not part of Step 1D-B:**
   - the cap change;
   - TV vocabulary teaching;
   - Phase153 candidates (each is a separate, measurable change).

**Not ready for production.** Nothing here is held-out. Table leads are deliberately unpersistable. Persisting them needs an
untouched result and an owner decision on the persistence screen.

## 12. Provenance and legal boundaries

- **Pages:** only copies already held under the existing private policies. No new acquisition. No page bytes, text or values
  committed.
- **Private:**
  - `pee-knowledge/private-eval/experience/step1d-a2-dev1.json`;
  - `step1d-a2-missing-dev1.json`;
  - `step1d-a2-templates-dev1.json`;
  - the replay copies.
- **Public (counts, ids, classes and structural signatures only):**
  - `evaluation/experience/step1d-a2-dev1.json`, `step1d-a2-missing-dev1.json` and `step1d-a2-templates-dev1.json`;
  - `metamorphic-semantics-1d2.json`;
  - `replay-s1a-semantics-1d2.json` and `replay-s1b-semantics-1d2.json`.
- **Metadata as evidence:** structured data and links are read as document organisation, never as test evidence. No
  manufacturer catalog or external identity source was consulted.

Sections consulted: the skill's SKILL.md and decisions log, the Step 1D-A report, and the Phase272 extraction-plan and
guided-reader code. The Phase245/153/225/226/265/269/270 modules were audited by function and data contract, together with
their call sites.
