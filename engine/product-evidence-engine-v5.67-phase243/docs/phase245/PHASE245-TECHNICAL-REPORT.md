# Phase245 — generic HTML specification extraction and table-grid interpretation

Builds on Phase244 (commit `a7d01fc`). Research-only: every extracted value is an
`unverified_source_declaration` with `rankingAuthorized:false`, `scientificTestEvidence:false`;
no page text is stored; no new dependencies.

## 1. What was built

| Module | Purpose |
|---|---|
| `src/phase245_html_dom.ts` | Bounded, dependency-free HTML tree builder: implied end tags (p/li/dt/dd/tr/td/th/option, table sections), raw-text elements, entities, quote-aware tag scanning (attributes of any length), structural locators. Not a conforming HTML5 parser; never executes scripts. |
| `src/phase245_table_grid.ts` | HTML table model: rows of the table's own sections, cells placed in the first free slot, `rowspan`/`colspan` (incl. `rowspan=0` to section end), original coordinates and spans kept. Interpretation: key/value tables (incl. full-width `th` section rows and multi-level row labels), products in columns (multi-level column headers → product + variant; `colspan` values shared across the products they cover), products in rows (minimal unique 1–3 column key; `rowspan` values shared across the products they cover), implicit header rows for `td`-only tables, product-code header detection. Abstains with explicit reasons: value spanning several properties, missing product header/key, missing label, overlapping cells, no header on multi-column tables, too few quantitative columns for a product-per-row reading. |
| `src/phase245_value_normalizer.ts` | Keeps the authored text; normalizes only unambiguous forms: quantities (+bounds `max.`/`min.`, qualifiers, converted alternatives, bracketed conditions), ranges, prices (symbol/code/label hint such as "MSRP (US$)"), option lists, imperial compound weights, axis-labelled and unlabelled dimensions (incl. trailing "(WxHxD)" notes), unit conversions "A / B", booleans (bare Y/N only for question labels). Reports `per_variant` (several variants in one cell), `compound` (several quantities for different things), `prose` — none of these is ever promoted. |
| `src/phase245_spec_extraction.ts` | Generic extraction: JSON-LD and microdata (Product, ProductGroup + variant-specific `additionalProperty`, `PropertyValue`, `QuantitativeValue` incl. UN/CEFACT unit codes, `Offer`/`AggregateOffer` prices); `dl` (including sources that swap `dt`/`dd` inside per-pair wrappers); tables via the grid; repeated label/value structures detected from sibling **structure** (tag + child-tag sequence), alternating label/value siblings, reusable components repeated across sections, and explicit measurable `Label: value` items inside prose bullet lists. Region model: navigation/header/footer/aside, class/id words for related/recommended/listing/ads/reviews/cookies/finance/pagination, item-card listings (≥3 siblings each with link + image), links, and an untrustworthy `<main>` (holding almost no page text). Main product = single JSON-LD/microdata product, else single `h1`, else `og:title`; several declared products → main product ambiguous. Section context from `aria-labelledby`, nearby headings, accordion headers and full-width table rows. Conflicts (same product/variant/section/property, different values) are kept apart; duplicates are merged with `also_declared_at`. `toFacts241()` maps promoted facts onto the Phase241 contract. |
| `src/phase222_transient_public_page_observer.ts` | Each live page receipt now carries `specifications245` (main product, promoted facts with product/variant/section/locator/flags, ambiguous count, abstention reasons). Phase241/244 fields are unchanged. |
| `scripts/phase245-evaluate.mjs` | Scores the Phase244 baseline (Phase241 HTML IR as wired in Phase222) and Phase245 on identical bytes against hand-written gold. |

No selector, regular expression or rule names a brand, site or platform. The vocabulary of
non-main-content words (related, recommended, breadcrumb, cookie, finance, pagination…) is generic
English page vocabulary.

## 2. Baseline verified before changes

Full TypeScript suite at `a7d01fc`: **4,261 / 4,261** (212 files); Phase244 targeted tests 10/10.

## 3. Evaluation protocol

* Pages were fetched with the engine's own transport (`restrictedHttpsTransport`, HTTPS proxy,
  `ProductEvidenceResearchBot`) only after `publicRobotsDecision223` returned `allow`; 4-second
  per-host spacing. Raw HTML stays outside the repository; `evaluation/phase245/pages-manifest.json`
  records URL, HTTP status, retrieval time, byte size and SHA-256 of the exact bytes evaluated.
* Gold annotations were written by hand from the pages' own content (raw HTML / visible text dumps),
  not from extractor output. Each gold file lists expected facts (product, property, normalized value,
  optionally section/variant), required abstentions, forbidden attributions and acceptable extras.
* A promoted fact is **correct** if product, property, section (when given), variant and value match;
  a **false association** if its property/value matches gold but the owner/section is wrong, or it
  violates a forbidden attribution; otherwise a **false positive** (unless listed as acceptable).
  A second correct declaration of an already matched fact is counted as a duplicate, not an error.
  Very large tables are scored on a declared subset of products; every promoted fact about a scored
  product is judged.
* **Dev set** (12 pages, 8 sites): used to build the rules; gold written after seeing output.
* **Unseen set 1** (6 pages, 5 sites: Apple, Bosch ×2, Pimoroni, RTINGS, Scan): gold committed in
  `30df149` **before** running the code frozen at `31cbb5b`.
* **Unseen set 2** (6 pages, 5 sites: Pololu ×2, Wickes, Richer Sounds, SparkFun, John Lewis): gold
  committed in `545a5fd` **before** running the code frozen at `f51efeb`.
* After each held-out run the set was used for failure analysis and therefore became diagnostic.

## 4. Results

### 4.1 Held-out results (each set run once on code frozen before its gold was used)

| Set / code | Pipeline | Expected | Correct | False assoc. | False pos. | Missed | Abstentions | Precision | Recall |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Unseen 1 @ `31cbb5b` | Phase244 baseline | 31 | 3 | 0 | 0 | 28 | 6/6 | 1.00 | 0.10 |
| Unseen 1 @ `31cbb5b` | Phase245 | 31 | 4 | 0 | 3 | 27 | 5/6 | 0.57 | 0.13 |
| Unseen 2 @ `f51efeb` | Phase244 baseline | 62 | 12 | 0 | 0 | 50 | 1/1 | 1.00 | 0.19 |
| Unseen 2 @ `f51efeb` | Phase245 | 62 | 37 | 0 | 13 | 25 | 1/1 | 0.74 | 0.60 |

The first frozen version generalized poorly (it had been fitted to the dev pages). The second frozen
version, after one round of failure analysis on unseen set 1, generalized better on new sites but with
precision 0.74 under strict scoring. Manual review of the 13 unseen-2 false positives against the
pages: 7 were genuine declarations missing from the gold (Pololu "Motor/Logic supply voltage",
"PCB dev codes", "Other PCB markings"; John Lewis variant colours ×3); 5 were genuinely wrong values
(footnote digits glued to values: "1.2 A2", "2.4 A2", "0.5 g1", "0.4″ × 0.7″1"; "Y" not read as yes);
1 was a faithful but un-normalized value ("100 Watts (into 8 Ohms)" kept as text). Adjudicated
precision 44/50 = 0.88. Zero false product associations in both held-out runs.

### 4.2 Final code on all sets (diagnostic: every set has been used for development by now)

| Set | Pipeline | Expected | Correct | False assoc. | False pos. (strict) | Missed | Abstentions | Precision | Recall | Total ms |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Dev (12) | baseline | 92 | 39 | 0 | 0 | 53 | 7/7 | 1.00 | 0.42 | 116 |
| Dev (12) | Phase245 | 92 | 92 | 0 | 1 | 0 | 7/7 | 0.99 | 1.00 | 1,001 |
| Unseen 1 (6) | baseline | 31 | 3 | 0 | 0 | 28 | 6/6 | 1.00 | 0.10 | 27 |
| Unseen 1 (6) | Phase245 | 31 | 30 | 0 | 4 | 1 | 6/6 | 0.88 | 0.97 | 200 |
| Unseen 2 (6) | baseline | 62 | 12 | 0 | 0 | 50 | 1/1 | 1.00 | 0.19 | 48 |
| Unseen 2 (6) | Phase245 | 62 | 61 | 0 | 10 | 1 | 1/1 | 0.86 | 0.98 | 375 |

Adjudication of the remaining strict false positives (each checked in the page HTML):
* Correct declarations absent from gold: Bosch "Packing unit: 1 piece" ×2, Scan "Manufacturer code",
  Pololu supply voltages ×2, "PCB dev codes", "Other PCB markings", "Size", "Weight", John Lewis
  variant colours ×3, iPhone "Compatible networks" (dev).
* Representation disagreement: Scan GTIN extracted as text (gold said number; GTINs are identifiers).
* **Genuine error: John Lewis "Useful guides = Coffee Machines Buying Guide View the guide"** — a drawer
  heading paired with its link content, introduced when dialogs stopped being excluded.

### 4.3 Abstentions and non-attribution observed on real pages

* Brabantia (2 pages): 0 main-product facts. The served HTML for this agent is a listing of *other*
  products under the product's `h1`; their capacities are not attributed (see §6).
* Apple AirPods Pro: identical Height/Width/Depth/Weight lists for earbud and charging case → held
  back as conflicting; "Chip" (two chips in one list) not merged.
* Wikipedia iPhone infobox: Weight/Dimensions/Battery cells containing "15 … 15 Plus …" → `per_variant`.
* John Lewis "Capacity: Bean hopper 250g Water tank 1.4L" → `compound`, not promoted.
* Lakeland unlabelled bullet "Approx. 29 x 42 x 27.5cm H" → not read; RTINGS (client-rendered JSON)
  and PSREF static shell → no facts; Arduino/Pimoroni feature prose → not read; Scan finance tables and
  John Lewis delivery options → not product facts.

### 4.4 Runtime and resources (24 pages, 3 runs each, Node 22)

Phase245 median **45 ms/page**, max **315 ms** (1.3 MB Wikipedia page, 22,567 nodes), total 1,321 ms;
Phase241 baseline total 147 ms (≈9× less CPU). Heap growth per extraction up to 43 MB; process RSS
213 MB for the whole run. Details: `evaluation/phase245/results/runtime-and-heap.txt`.

### 4.5 Test suites

* `npm run test:phase245`: **26/26** (synthetic fixtures reproducing every structure above, including
  microdata, ProductGroup variants, merged cells, related-product exclusion, conflicts, abstentions).
* Phase244: 10/10. Full TypeScript corpus: **4,287 / 4,287** (213 files).

## 5. Classification of capabilities

**5.1 Implemented and verified on held-out real pages** (unseen sets at freeze points): JSON-LD
Product/ProductGroup prices and properties; key/value spec tables (`th`/`td` and `td`/`td` with
full-width section rows); `dl` lists; repeated div/span label/value lists; section-separated
duplicates (product vs package); refusal to attribute listing/related content; conflict and
per-variant/compound abstention; live Phase222 receipts (`specifications245`, verified against
switchbacktravel.com through the HTTPS proxy).

**5.2 Tested only on synthetic or previously seen examples**: microdata `Product`/`PropertyValue`/
`QuantitativeValue` (no held-out page used Product microdata); multi-level column headers with
product + variant levels; `rowspan`/`colspan` shared values (real only on dev Wikipedia tables);
`rowspan=0`; swapped `dt`/`dd`; reusable cross-section components; product-code header orientation
(seen only on a rendered PSREF page); untrustworthy `<main>`; footnote-marker removal; Y/N booleans;
"A / B" conversions; bracketed conditions. All fixes after each held-out run are, by construction,
verified only on pages already seen.

**5.3 Unresolved technical limitations**
* Pages whose specifications are rendered client-side (Brabantia, RTINGS, PSREF) carry no static
  specifications. Headless rendering was measured (§6) but not integrated.
* Unlabelled bullet specifications ("Input voltage - 7-15V", "Approx. 29 x 42 x 27.5cm H") are not
  read; semantic parsing of free text is not implemented.
* Multi-variant pages: page-level facts are attributed to the product group and flagged
  `variant_scope_unverified` — which variant a visible spec block belongs to is not resolved.
* Product names from table headers/keys are publisher text, not verified identities; no identity
  resolution across sources.
* Units: unrecognized units stay text (e.g. ″, ′′, IOPS, g-force "G", years); no unit conversion
  between systems is performed (alternatives are only kept when authored).
* Gold sets are small (24 pages, 185 expected facts) and annotated by one annotator; the gold missed
  several genuine declarations, so recall/precision figures carry annotation error.

**5.4 Empirically observed failures and proposed next steps**
* First freeze overfit the dev set (unseen-1 recall 0.13). Next: keep a rotating untouched set and
  report only first-run numbers per freeze.
* Remaining genuine error: drawer heading + link content read as a pair ("Useful guides"). Next:
  treat heading-plus-link-only content as navigation even inside dialogs.
* Footnote digits glued to values (fixed for `<sup><a href="#…">` markers only); other footnote
  conventions (plain `<sup>1</sup>`) remain ambiguous with exponents (cm², m³).
* Orientation of tables without `th` relies on heuristics (implicit header row, product-code header,
  quantitative-column ratio); misreadings are possible on unseen layouts — a homogeneity test (one
  unit/kind per property line) is the next candidate.
* Same-label/different-object lists (Apple earbud vs case) are only held back, not resolved; using
  image `alt` text or captions as component context is a candidate.

## 6. Fallback investigation (not integrated)

**Headless rendering** (pre-installed Chromium headless shell + `playwright-core` in a scratch
directory, through the HTTPS proxy, bot user agent): Brabantia 18.8 s and 477 network requests,
PSREF 7.9 s and 77 requests, versus ~1 request and 15–400 ms for the static path. Brabantia still
yielded **no** specifications after rendering for this agent (the served content is a listing), so
rendering would not have recovered its data; PSREF did expose large model tables (after which the
product-code orientation rule was added). Rendering also fetches scripts/APIs whose robots status is
not individually checked by the engine. Recommendation: optional, per-source, operator-enabled worker
only, with its own robots/budget controls — not a default path.

**Semantic model fallback**: not implemented. Sending page text to a remote model is the
`remote_ai_transfer` operation in `WebSourcePolicy.permittedOperations`, which no Phase244 test-only
policy grants. Measured input size: visible body text median 13.9k characters (≈3.5k tokens), max
107k characters (≈27k tokens) per page before main-content trimming; latency and cost would add a
model round trip per page and depend on the chosen model's pricing. It would also need its own
precision evaluation (hallucinated values are a precision risk that structural extraction does not
have). Recommendation: only for pages where structural extraction abstains, only under an explicit
`remote_ai_transfer` permission, with outputs kept in the same unverified, abstention-preserving
contract and scored on held-out gold before any use.

## 7. Correction to an earlier statement

In the Phase244 conversation the Brabantia failure was attributed to specifications held in
site-specific `<span>` elements. That was wrong: the served HTML contains no specifications for the
Bo Pedal Bin at all; the `product-label-attribute` spans are "New"/"Limited edition" badges, and the
visible content is a listing of other products.

## 8. Reproduce

```bash
npm run build && npm run test:phase245
node scripts/phase245-evaluate.mjs --pages <dir with TAG.html> --gold evaluation/phase245/gold-unseen2/unseen2-gold.json --verbose 1
```
Fetch the pages listed in `evaluation/phase245/pages-manifest.json` with the engine transport under
robots rules and compare SHA-256 before scoring; changed pages invalidate their gold.
