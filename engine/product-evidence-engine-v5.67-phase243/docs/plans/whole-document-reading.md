# Whole-document reading with shared knowledge and rules (WD), 2026-10-18

## Brief and boundaries

**Owner brief (2026-10-18, Italian).** Four connected objectives:
1. Read the whole document: paragraphs, lists, cards, DOM structures, embedded data and client-rendered pages. Evidence
   anywhere on the page uses the same scientific knowledge and the same attribution and reasoning rules.
2. Review every inherited restriction critically: obligation, technical limit, empirical criterion, or our own prudence.
3. Improve the rules rather than transfer them: test their premises, look for counterexamples, find more general
   principles.
4. Measure the operational benefit stage by stage. Preserve first runs. Keep development data, already-examined data
   and authentic new data apart.

**Same brief:** "non autorizzerei né una cancellazione della cronologia né una nuova politica rigida basata su questa
analisi preliminare. Lascerei intatti i materiali." The following stay unchanged:
- retention and access rules;
- Git history;
- the store and ranking.

There was no HTTP request.

**Companion documents:**
- `docs/plans/restriction-audit.md` (objective 2);
- `docs/plans/whole-document-reading-sota.md` (state of the art).

## 1. What was built

| Part | Where | What it does |
|---|---|---|
| Whole-document reader `wd.1` | `src/document_evidence.ts` | Tables go through 1G + knowledge, unchanged. Everything else becomes segments: key-value pairs (dl, two-part grids, "Label: value" lines), sentences of paragraphs, lists, captions and leaf text, and embedded data (JSON-LD, `__NEXT_DATA__`, Next.js flight data, application/json). Every quantity is typed by `typeQuantity` with the same document statements and scope rules as table values |
| Shared document statements | `documentStatements1G` (`src/table_interpreter1g_knowledge.ts`) | The KR statement builder, extracted so both readers use one copy |
| P1 record program | `resources/quantity-knowledge/rules.v2.json` (kr.2), program `record`; `applyRecordRoles` | Conditions belong to the test record, not the metric. In a record (a sentence; a table row on a record axis; a body row of a table whose properties are columns), a single value with no metric of its own is a condition of the record when its kind is what a condition axis takes and a co-recorded metric requires that axis. It then applies to every result of the record, whatever its metric |
| Knowledge qk.2.3 | `build/v2-additions.py` | `relative_humidity` (ISO 80000-5) as a **specialisation** of ratio (words refine a percentage, so no new ambiguity); `%RH`; the inlet air state as a composite of temperature and relative humidity; `conventionalBasis` (a dehumidifier capacity is per 24 h, ENERGY STAR); `operatingCondition` axes; 16 qualitative aspects and evaluation words (source `pee`: reading vocabulary, never product facts) |
| Qualitative observations | same reader | Codes only (no text): aspect, polarity (with negation), strength (hedges), operating conditions, product, basis (tested / opinion / reported by others / manufacturer claim), author. `rankingInput:false` |
| P3 | same reader | A number inside a product or model name is part of an identifier: known names, and number+unit tokens glued inside a capitalised name |
| Evaluation | `scripts/wd-eval.mjs`, `scripts/wd-score.mjs`, `scripts/wd-funnel.mjs`, `scripts/wd-live-yield.mjs` | Protocol `evaluation/whole-document/protocol.json` (committed `3fb3a55`, before any reader code); reference sealed in `gold-freeze.json` (`963c3b0`) before the build was frozen (`f4c7250`) |

**Kept rules.** Kept on purpose, with their reasons:
- tables and P2's consequence (rule Q14);
- the Phase245 conflict check, which prevented 116 wrong attributions (audit F3);
- exact-name matching: names are never merged.

**P2 replaced by test identity, as the owner asked.** Q14's wording now says P2 follows from P1: two values of one
product compare when their records state the same conditions, and when nothing is stated, something unrecorded tells
them apart. The named test a prose value comes from ("in our hair-wrap test") is recorded as its `method` condition.
This was added in the tuned pass.

## 2. Development (69 spent pages; tuned here)

**Where quantities are and what reaches the knowledge** (`evaluation/whole-document/dev-funnel-wd1.json`):

| | Before | wd.1 |
|---|---|---|
| Table values | 1,089 (813 typed) | same |
| Values outside tables offered to the knowledge | 0 | 1,538 |
| Of which kind established | — | 1,385 |
| Of which part of a name (P3) | — | 116 |
| Of which attributed to a product | — | 970 (sentence 120, section 621, pair section 97, page 31, embedded item 101) |
| Qualitative observations (codes) | 158 (cooking pages only) | 650 |

**Rule changes measured on the tables** (equivalence against `3fb3a55`; acoustic reference unchanged at 82 correct, 0
unjustified interpretations and 0 unjustified abstentions):

1. **P1, conventional basis and relative humidity.**
   - On the 69 development pages: 0 differences.
   - On the KV rating-point table (already examined): 30 verdicts changed. All 30 errors of the KV first run are
     corrected (15 extraction pairs, 15 wattage pairs: "different inlet air state").
   - 8 humidity values are now typed.
2. **Operating conditions recorded from a value's own labels**, whether or not the metric requires them (tuned pass).
   - 310 verdicts changed, 280 of them on the development pages.
   - A sample of 15 were all corrections. Values at different fan speeds had been called "comparable" because the
     knowledge did not require the fan setting for that metric: 172 such pairs are now "not comparable, different fan
     setting".
   - This is a defect of the previous reading, found by asking why a condition should matter only when a rule names
     it.

## 3. Authentic evaluation (non-table content of the 7 KV pages)

**Data classes.**
- **Authentic new:** everything outside HTML tables, never read by the developer before the first run.
- **New to PEE:** one publisher (vacuumwars.com) and one category (robot vacuums).

**Reference.**
- 1,347 quantities and 395 qualitative statements, annotated by four fresh-context annotators from a neutral Chromium
  rendering (JavaScript off, network blocked) and a flattened data view.
- 516 quantities repeat another item and count once, leaving 831 reference quantities: 281 measurement-like and 550
  non-quantities (name parts 344 on two pages, prices, warranties).

**Arms.**
- A: the live readers.
- B: the knowledge layer, tables only (`3fb3a55`).
- C: wd.1 (`f4c7250`), first run.

**Results** (counts; `score-first-scorerfix-arm-*.json`; first run in `score-first-arm-*.json`):

| Stage (reference measurement-like items: 281) | A live | B tables | C first run | C tuned (TUNED) |
|---|---|---|---|---|
| Reached | 5 | 1 | **95 (34%)** | 102 |
| Not reached | 276 | 280 | 186 | 177 |
| Kind correct / unjustified interpretation / unjustified abstention / justified abstention | 0 / 0 / 5 / 0 | 1 / 0 / 0 / 0 | **84 / 8 / 0 / 3** | 91 / 8 / 0 / 3 |
| Product correct / wrong / missing / justified none | 3 / 2 / 0 / 0 | 0 / 1 / 0 / 0 | 50 / 5 / 22 / 13 | 55 / 5 / 23 / 13 |
| Conditions attributed / not attributed / spurious | 0 / 5 / 0 | — | 0 / 66 / 2 | 11 / 55 / 9 |
| Evidence class correct / wrong / missing | 4 / 1 / 0 | 1 / 0 / 0 | 56 / 4 / 35 | 60 / 5 / 37 |
| Non-quantity typed as a measurement | 0 | 2 | 9 | 11 |
| Wrong conclusions (any) | 2 | 3 | 25 | 28 |

| Qualitative (395 reference statements) | A | C first run | C tuned |
|---|---|---|---|
| Reached | 0 | 93 | 93 |
| Aspect agrees / polarity correct / product correct | — | 63 / 65 / 80 | same |
| Basis correct | — | 17 | 85 |
| Conditions attributed / not | — | 7 / 23 | same |

**By page** (first run, measurement-like items reached):

| Page | Reached |
|---|---|
| Vacuum Wars T80S review | 30 of 56 |
| Vacuum Wars Qrevo review | 25 of 50 |
| Vacuum Wars roundup | 1 of 58 |
| Meaco 12L (outside tables) | 4 of 6 |
| Meaco collection | 8 of 16 |
| Bosch, two client-rendered pages | 13 of 45 and 12 of 44, all from embedded data, read by a format reader written blind (no development page had flight data) |

Arm A reaches 5 of these 281 items.

**A measurement correction, not tuning.**
- The first scorer placed qualitative statements by word overlap normalised by the shorter text, so a three-word line
  inside a paragraph won.
- It was fixed after the first run (`first-scorerfix`). The builds and reader outputs are identical.
- Quantities are unchanged; qualitative reach went from 20 to 93.
- Both scorings are committed.

**Tuned pass (TUNED: the set is now spent).** The changes:
- decimal comma ("81,5 cm" is 81.5 cm);
- hyphenated units ("2-inch");
- a unit stated in a pair's label;
- h:mm durations;
- operating conditions recorded from labels;
- the named test as a method condition;
- the qualitative basis covered by the document's own test statement, as protocols cover values (C1–C5).

## 4. What was lost, and why (first run)

| Loss | Count | Cause | Class |
|---|---|---|---|
| Unitless scores and counts | about 60 | Rating scores, counts and test scores have no unit, so the quantity knowledge cannot type them; whether they are evidence is a separate question | knowledge gap (not a quantity kind) |
| The roundup page | 57 of 58 | Product cards whose layout the segmenter does not pair, and names without model tokens | mechanism |
| Embedded Bosch values | 64 of 89 | Values whose unit is in the property name or in another leaf (partly fixed in the tuned pass) | mechanism |
| Name parts read as volumes | 9 (Meaco collection 7) | Card titles such as "Arete One 20L" outside the product list | P3 coverage |
| Conditions | 66 not attributed | The first run read conditions only when the metric requires them; robot-vacuum values have no metric, so floor type, hair length and test name were dropped | rule premise, corrected in the tuned pass (11 now) |
| Evidence class missing | 35 | Review sentences with no first-person cue | same cause as the qualitative basis |

## 5. What the experiment shows, and what it does not

**Shown:**
- The same knowledge and rules read evidence outside tables.
- On authentic new content, the reach of measurement-like items rose from 2% (live readers) to 34%. Kinds were correct
  for 84 of the 95 reached; 0 kinds were missing without reason; 8 were unjustified interpretations.
- Qualitative statements are now represented as attributed codes: 93 of 395 reached on the first run.
- P1 resolved the KV comparability errors.
- The condition rule's hidden premise ("a condition matters only if a rule requires it") was false. Correcting it
  changed 280 development verdicts, all sampled ones for the better.

**Not shown:**
- Generalisation beyond these 7 pages; the set is now spent.
- Precision of the qualitative aspects beyond overlap with the annotators' paraphrases.
- Use of any of this in advice or ranking: nothing reaches the store or the ranking.

**Next obstacles, by measured cost:**
1. card and roundup layouts;
2. units carried by sibling data leaves;
3. unitless scores, with their scales (a rating score kind with its scale and publisher);
4. evidence class from document-level test statements for values, as was done for the qualitative basis;
5. a new authentic set, for which new acquisition needs the owner's authorisation and the sites' terms read first
   (Selfridges, John Lewis and Argos were offered).
