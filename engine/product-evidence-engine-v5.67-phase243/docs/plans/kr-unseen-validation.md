# Knowledge and rules on unseen sources (KV) — 2026-10-18

Owner authorisation (2026-10-18): a small experiment on genuinely new documents.
- Limits: 8–10 pages, 3–4 publishers, at most 20 HTTP requests.
- An independent reference is sealed before any run; the first run is kept unchanged.
- Unjustified interpretations and unjustified abstentions are measured separately.
- New documents, new publishers and new structures are kept apart.
- The store and ranking stay unchanged.

**Tiers.**
- T2-untouched first run on unseen pages.
- Fixes after the first run are TUNED and labelled as such.
- The 69 development pages are spent.

## 0. Outcome

1. **Coverage is the first obstacle, not the rules.**
   - Of the 7 pages fetched, only one presents its quantities in HTML tables: 49 values on the Meaco 12L product page.
   - The other 6 carry about 340 quantities outside tables:
     - the Vacuum Wars reviews and roundup in prose and lists;
     - the Meaco listing in cards;
     - the two Bosch pages are client-rendered (3 static text blocks, 0 quantities; the data sit in JSON).
   - The knowledge layer reads table values, so on 6 of 7 new pages the general rules never get a value to judge.
   - Step 1D-B found the same limit for a different reader.
2. **On the values it does get, kind identification transfers** (first run, both arms):
   - 32 of 44 quantities correct;
   - 0 unjustified kind interpretations, 0 unjustified kind abstentions;
   - 1 correct abstention: a bare "41dB(A)" that nothing on the page settles;
   - 11 not typed: values with no printed unit, humidity percentages the pack has no kind for, and two ranges the
     scanner misses;
   - 2 non-quantities typed: the model name "12L" read as a volume, and a 2-year warranty read as a duration (the
     protocol counts warranties as non-quantities).
3. **Conditions and comparability did not transfer.**
   - The page's rating-point table gives, per row, temperature, humidity, extraction and wattage. PEE reads every cell
     as its own quantity, so the temperature and humidity of a row are not conditions of that row's results: 13 of 15
     reference conditions are missed.
   - Consequence, on the 30 informative pairs (extraction and power at different rating points):

     | Arm | Unjustified comparability |
     |---|---|
     | B (rules) | 30 of 30 |
     | A (qk.2.1) | 15 of 30 |

   - B is worse than A because its K10 rule ("one presented test = same table and labels") treated the six rating
     points of one product as one test.
   - 25 further pairs (dimensions, rating temperatures) are not informative: comparing a width with a height, or two
     rating temperatures, is not a test comparison. This is a limitation of the pre-registered pair definition.

## 1. What was done (HTTP accounting)

- **Protocol, scorer and code freeze:** `6e59e35`. Ordered selection: `e09ed84`. Amendment before any page request:
  `1325dd7`. All committed before the first request.
- **Requests:** 14 of 20.
  - 4 robots: `blog.meaco.com` answered with a 301 to itself, which is treated as robots unavailable, so nothing was
    requested from it.
  - 7 pages.
  - 3 redirects: two Vacuum Wars month pages redirect to the evergreen roundup; the substitute was blocked by the
    per-host cap of 6.
- **Gate:** no Content-Signal, TDM or noai reservation, no paywall, no prior canonical URL, no duplicate.

**Pages and novelty** (`evaluation/kr-unseen/source-selection.json`):

| Pages | Publisher | Novelty | Values in tables |
|---|---|---|---|
| 3 | vacuumwars.com | new publisher, new category (robot vacuums, no teaching), new structures | 0 |
| 2 | meaco.com | new documents of a known publisher (2 earlier product pages are in the store) | 49 (one page) |
| 2 | bosch-home.ie | new documents of a known publisher (bosch-home.co.uk in the store) | 0 (client-rendered) |

- The scored values come from one page, of one known publisher, in one taught category.
- The new-publisher and new-category pages contributed no scored value.
- So this run is evidence about **a new document and a new structure** (a rating-point grid), not about new publishers
  or categories.

## 2. Reference and arms

- **Reference:**
  - a fresh-context agent annotated the 49 values from the page text only;
  - fields: quantity or not, kind, justification, metric, conditions, test group, applicable statement;
  - sealed in `evaluation/kr-unseen/gold-freeze.json` before any arm ran.
- **Arms:**
  - A = `18932bc` (qk.2.1, before kind evidence, document protocols and rules);
  - B = the frozen build (qk.2.2 + kr.1/KR2).
- **Scores:** `evaluation/kr-unseen/score-first-arm-{a,b}.json` (unchanged).

## 3. Causes and candidate principles (higher-order analysis)

| Error | Cause | Candidate principle | Status |
|---|---|---|---|
| Row temperature and humidity not read as conditions of the row's extraction and wattage; within-source comparability across rating points | Mechanism: a cell's value is either a result or a condition of the record, and nothing decides which | **P1. Conditions belong to the test record, not to the metric.** A value whose kind is what a condition axis required by a co-recorded result is measured in (temperature and humidity for an inlet air state) is a condition of that record's results; every result of the record shares those conditions | found, not implemented (needs the record roles in the table reading and a composite inlet-air-state axis) |
| Six rating points of one product treated as one presented test | Rule scope: K10 took "same table and labels" for "same test" | **P2. Within-source comparability holds between products of one test.** Two values of one product under the same labels are two tests, told apart by something the record does not show | **implemented (data-only rule change, Q14), TUNED** |
| Wattage at different rating points compared as plain power | Knowledge gap: a dehumidifier's power draw depends on the rating point too | Subsumed by P1: the record's conditions apply to all its results, whatever their metric | found |
| "12L" in a model name read as a volume | Mechanism: no notion that a quantity-shaped token in a name is an identifier | **P3. A number inside a product or model name is part of an identifier, never a measurement** (the skill already states this for declarations) | found, not implemented |
| Relative humidity percentages untyped | Knowledge gap: no relative-humidity kind | add a relative-humidity kind and its role in inlet air state (with P1) | found |

**P2, verified after the first run** (TUNED, `evaluation/kr-unseen/score-tuned-p2-arm-b.json`):
- unseen page: unjustified comparability 55 → 40. The 15 extraction pairs are now "conditions unestablished". The
  remaining 40 are 15 power pairs (needs P1) and 25 non-informative pairs.
- 69 development pages, not used to find it: 4 pairs change, all of them two values of one product in one cell. Two
  are input lag at two signal modes on a TV page; two are an air-purifier pair. All 4 are corrections, and there are 0
  regressions.
- The acoustic reference is unchanged.
- A test covers both sides.
- It is a rule change in the data; the code only now states each value's product as a fact.

## 4. What this shows, and what it does not

- **Shown:**
  - On a new document with a new structure, kind identification with justification transferred without a single
    unjustified interpretation or abstention.
  - The general rules did not see their real scope problem until the new structure: a rating-point grid where
    conditions sit in cells, not labels.
  - That problem was diagnosed to a rule (P2), corrected in the rule data and checked on independent development
    groups.
- **Not shown:**
  - Anything about new publishers or new categories: their pages gave the layer no table values.
  - P1, the principle behind most remaining errors, is not implemented.
  - One scored page is a first signal, not a generalisation result.
- **Next obstacles, by evidence:**
  1. reading quantities outside tables (prose, lists, cards) and client-rendered data, with the same knowledge and
     scope rules;
  2. P1, record roles (result or condition) in tables;
  3. a relative-humidity kind and a composite inlet air state;
  4. a new unseen set, chosen for table and non-table layouts, after 1 and 2.
- **A data-handling error and its correction.** The annotation inputs (full rendered page text for this experiment,
  page sentences for K9) were committed to the private repository. They were redacted to hashes and lengths in
  `8fbb147`. The text remains in that repository's history (commits `0517659` and `f73c0d1`); a history rewrite needs
  the owner's decision.
