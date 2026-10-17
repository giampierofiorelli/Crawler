# Phase272 — Scientific-knowledge-guided extraction and cross-category meta-learning

Owner brief of 17 Oct 2026 and strategy memo "Memoria strategica — apprendimento, estrazione, generalizzazione"
(2026-10-17). This report supersedes `docs/phase271/REPORT.md` as the current status. **Stopped for independent review.**

## 1. Answer first

**Does scientific knowledge supplied before reading improve extraction? Yes, on taught categories, measured on untouched
pages. It does not yet do so for an untaught category, and it brings a serious attribution weakness.**

Untouched first run, committed unchanged (`evaluation/phase272/ab-untouched-firstrun.json`): 16 new pages, 4 categories,
independent gold.

| | A: extractor as at 09526c4 | B: same extractor + plan from the store | E: A + wide generic vocabulary, no knowledge |
|---|---|---|---|
| Quantitative values found | 2 / 163 | **65 / 163** (88 leads; precision 0.75) | 2 / 163 as findings; 77 / 163 only as unconfirmed leads |
| Wrong-product attribution among matched values | 1 of 2 | **20 of 65** (audited: 14 true wrong product, 5 naming variants, 1 headline) | — |
| Values usable by the decision path (matched, right product, retainable, linked to a taught measurement) | 1 | **45** | 1 |
| Conditions recognised (taught condition labels on matched values) | 0 / 1 | 23 / 64 | — |
| Qualitative findings | 12 / 123 (precision 0.71) | **58 / 123** (precision 0.56) | 12 / 123 (27 more as leads) |
| Untaught qualitative findings (30 in gold) | 1 | 1 | — |

- B improves on A in **every** category, both quantitatively and qualitatively (§5).
- The ablation matters. A wider generic vocabulary alone (E) *locates* even more values, but only as unconfirmed leads. The
  knowledge-guided arm turns them into attributed, condition-labelled and decision-linked findings: 45 usable against 1.
- So the knowledge contributes precision, linking and attribution, not raw recall. Recall gains come mostly from reading the
  right units and the whole page.
- **Negative results:**
  - B binds other models' values to the reviewed product on comparison reviews (14 of 65 matched values, all comparison content);
  - B's qualitative precision is lower than A's (0.56 vs 0.71);
  - B loses 1 value and 7 qualitative findings that A or E found;
  - the unknown-category pilot showed **no** extraction gain (§7).

## 2. What was read and preserved

**Read:**
- the Phase271 report (its §B labels are now corrected, with a dated note);
- `.claude/skills/pee-guided-learning` (SKILL, current-state, decisions);
- the teaching relations (Phase247/252);
- the extractors (Phase225/226/265/269/270);
- the comparative store (Phase271);
- the evaluation scripts (Phase269-271);
- the owner memo. It is treated as a hypothesis, and §4 and §9-§10 of the memo shaped this design: an A/B/C ablation, guided + exploratory reading, no parallel engine, evaluation-leakage rules.

**Preserved:** Phase271 baselines, store v8, signing restrictions (production still disabled), publication guard.

**Owner material preserved privately** (pee-knowledge):
- the speakers package 09 v1.0.0 (Stage-A inventory `research-inventory/phase272/speakers.json`: 17 outcomes, 31
  measurement links, 24 proxies, 11 conditions; R10 and R36 share a URL; the compendium duplicates its components);
- the strategy memo (`owner-documents/`).

The re-sent 04 and 05 zips are byte-identical to the copies already preserved.

## 3. The mechanism (smallest connection, no new extractor)

- **`src/phase272_extraction_plan.ts` — `compileExtractionPlan272(store, category)`:**
  - **What it reads:** only what the store holds for the category. Taught outcomes and their need phrases; taught
    measurement concepts; conditions and proxies via `measured_by`, `requires_condition` and `not_sufficient_for`;
    category nouns.
  - **How it derives the plan:**
    - Terms are chosen by distinctiveness across the taught categories.
    - Units come from a generic physical-unit lexicon, selected by the dimensions the category's own statements name.
    - No category is named in the code; a test asserts this.
    - The plan is `isEvidence:false` and is never stored.
- **The existing readers take an optional `plan` and `exploratory` flag:**
  - **Phase225 probe:** the guided pass reads plan units. It admits a value when its own sentence or table label uses
    a taught term of that unit's dimension. It rejects:
    - declarations, ranges, bounds and thresholds;
    - hypothetical projections;
    - condition durations;
    - parameters printed before a taught condition term (e.g. "10% window").
    It also reads beyond the first 380 blocks.
  - **Phase265:**
    - clause-level attribution to the document's named products;
    - a sentence headline is not a product name.
  - **Phase269:** the guided qualitative pass. Taught outcome plus a generic evaluative lexicon; contrasts split; adjectives never become scores.
  - **Exploratory pass:** generic units and evaluations, recorded only as research leads.
- **Without a plan the output is byte-identical** to the frozen arm-A build on all 54 retained authentic pages
  (`scripts/phase272-no-plan-equivalence.mjs`; arm A runs from a separate build of 09526c4).
- **The store never keeps plan-guided qualitative codes.** They fall outside the Phase270 amendment and are withheld at ingest (tested).
  Guided quantitative leads remain unreviewed `test_measurements265` leads with `rankingAuthorized:false`.
- **Televisions were taught** (package 07, t272.tv1) by the existing generator, before any television page was read.

## 4. Protocol, freeze and budget

**Frozen, then committed, before any untouched request:**
- protocol and addendum: arms, dev/untouched split, gold and scoring rules (`evaluation/phase272/protocol*.json`);
- source selection: pages chosen from search titles only, with each page's search-summary exposure recorded; pages whose numbers appeared in a summary were excluded;
- arm-A file hashes;
- B/C/E code, scorer and plan digests (`extractor-freeze-known.sha256`, `plans-frozen-known.json`);
- for tumble dryers, a separate later freeze (`unknown-category-freeze.sha256`).

**Gold:** five independent annotator agents (one per category), working from plain-text renderings with the frozen rules
and the taught label lists. They saw no extractor code or output. Gold hashes are committed (`gold-untouched*-freeze.json`);
gold contents are private. Frozen does not mean author-independent: the annotators are Claude.

**Budget:** owner policy `pee272_guided_extraction_research` (60 requests, ≤6 hosts, ≤15 per host, 7 days).
- **Used: 30 requests on 5 hosts:**

| Host | Requests |
|---|---|
| Trusted Reviews | 12 |
| Tom's Guide | 5 |
| TechRadar | 5 |
| Expert Reviews | 4 |
| HouseFresh | 4 |

- **Stops:** none (robots allowed every path; no reservations; no 4xx).
- **Why 30 stayed unused:** stopped because the evidence sufficed.

## 5. Results by category (untouched first run; tier T2 authentic controlled)

| Category | Gold values / findings | A values | B values (leads; wrong product) | A findings | B findings (emitted) |
|---|---|---|---|---|---|
| Air fryers | 16 / 37 | 0 | 6 (17; 0) | 9 | 13 (21) |
| Dishwashers | 10 / 29 | 0 | 2 (5; 2*) | 1 | 11 (14) |
| Air purifiers | 62 / 26 | 0 | 35 (38; 4) | 2 | 14 (32) |
| Televisions | 75 / 31 | 2 | 22 (27; 14) | 0 | 20 (36) |

\*The two dishwasher "wrong" values are naming variants of the same product (CF 57CF0W vs CF 57CF0W-80).

**Interpretation:**
- **Air purifiers:** the gain is largest. The taught measurements name sound, airflow and power, and HouseFresh reports them in prose and table cells.
- **Televisions:** recall rises 2 → 22, but most wrong-product values are here. Tom's Guide pages compare three other TVs in tables and prose.
- **Dishwashers:** gold values are few, and several are costs in pence; no arm reads currency.
- **Air fryers:** values are mainly observed cooking times. The plan admits some; settings and doneness times remain hard.

**Other measured items:**
- **Decision-usable:** A 1, B 45.
- **Lost by guidance:** 1 value and 7 findings (mostly untaught dimensions such as preheat time and apps).
- **C's exploratory pass:** adds 47 gold values as leads, beyond B's findings.

**Development results (tuned; never reported as untouched):**
- three Phase272 dev pages: values A 1/28 → B 24/28, findings 1/16 → 10/16;
- old frozen air-fryer gold (Phase270/271 sets, documents read in earlier phases): values unchanged (37/60; 0/3), findings 9 → 13 /24 and 12 → 17 /49.

**After-change run (tuned on the spent untouched set: `ab-untouched-after-change.json`):** products named in body
text and table headers become document products. Wrong-product values fall 20 → 15 of 66, and usable values rise 45 → 51. This is
**not** held-out evidence.

## 6. Cross-category transfer

The same mechanism, with no category-specific extractor, worked across four scientifically different measurement types:
- cooking time and results;
- cleaning and drying, energy and water;
- airflow, decay time, noise and power;
- luminance, input lag and picture judgements.

It improved both quantities and qualities in each.

What did **not** transfer:
- table-to-product attribution in comparison reviews;
- currency-denominated derived costs;
- Delta E (no unit word in the lexicon);
- untaught qualitative dimensions (1 of 30 found by B).

## 7. Unknown category: tumble dryers

There is no owner package for tumble dryers, and they are excluded from teaching. The research step's material came only from 2 public method pages read under the
policy. Requests were authored before any page was read (`unknown-category-requests.json`). Results are in `unknown-category-pilot.json`
and `ab-td-*-firstrun.json`.

| Capability | Result |
|---|---|
| 1 Recognise the gap | Before the change, a request was routed to dishwashers or into clarification by shared need words. After a generic rule (an unknown purchase phrase overrides shared need words; regression sets unchanged), 1 of 3 research requests and the reuse request are `out_of_scope` ("category onboarding needed"). The 2 misses fail at purchase-phrase detection ("I want a quiet tumble dryer…", "Is a heat pump tumble dryer worth it…"). A fictional "garment steamer" was routed to steam cookers through the shared head word "steamer": a similar-name category confusion (D9). |
| 2 Relevant principles | Six transferable method patterns recur in at least two taught categories (energy, duration, fraction, mass, power, sound), each with its source measurements, required conditions and proxy attributes. |
| 3 Methods and sources | PEE read 2 method pages (Trusted Reviews, Expert Reviews). **Selecting them was operator-assisted (Claude web search)**; PEE did not search. |
| 4 Provisional relations | Five hypotheses: energy, sound, fraction, duration, temperature. Each is attributed to its source categories (e.g. energy ← air fryers `low_energy_use`, dishwashers `energy_per_cycle_and_workload`) and labelled `instructor_hypothesis`. |
| 5 Better extraction after learning | **Not shown.** On 4 untouched review pages (27 values, 31 findings): A 1/27; B with the transfer-only plan 1/27; B with the learned plan 1/27. Findings: 0 → 2 / 31. Exploratory leads matched 10/27. Learning changed basis labels, not reading. The provisional measurements' terms are generic words ("energy"), which the plan's distinctiveness filter discards. |
| 6 Hypothesis vs verified | Kept. Sound, duration and fraction became `method_reference`, citing the page; energy and temperature stayed `instructor_hypothesis`; mass became a research lead; every item stays `technical_hypothesis` / unreviewed in the store. |
| 7 Reuse | A later request is recognised as `tumble_dryers`, with energy and sound outcomes stated as unassessed, decision `research`, and no ranking. The learned teaching is kept in the store, but the code registry does not yet load learned categories automatically. |

No claim of generalisation is made from this pilot.

## 8. Research programme for category diversity (plan; no new infrastructure)

The experiment can run offline with the pieces now in place:
- the plan compiler;
- the transfer procedure (`transferablePrinciples272` over any SUBSET of taught categories);
- the A/B scorer.

**Design:**
- **Held-out categories, never taught:** each needs about 4 untouched pages and independent gold, as for tumble dryers.
  Candidates by distance from the curriculum:
  - near: washing machines, vacuum cleaners;
  - mid: kettles, hair dryers;
  - far: mattresses, headphones.
- **Curricula:** subsets of the taught families at sizes 3, 6 and 9.
  - At each size, compare "similar" subsets (e.g. heating appliances: air fryers, coffee, dehumidifiers) with "diverse" subsets (thermal + optical + acoustic + cleaning).
  - Use at least three random orders per size; never pick the best order.
- **Measure per held-out category:**
  - B-vs-A gain in values and findings;
  - wrong-product rate;
  - decision-usable count;
  - number of method pages needed before a gain appears.
- **Separate:**
  - document quantity (pages per family held constant);
  - source quality (method page vs review);
  - repeated principles (dimension recurrence counts);
  - new mechanisms (dimensions absent from the curriculum);
  - transferable versus category-specific rules (plan items derived from principles vs from the category's own teaching).
- **Report** with denominators and spread across orders; no percentages on fewer than about 10 items alone.

**Prerequisites first:**
- (a) **D10:** transferred measurements need dimension-level terms that survive the distinctiveness filter;
- (b) **D9:** otherwise the curve measures attribution noise.

Budget: about 6 held-out categories × 5 pages, about 30 requests per round.

## 9. Phase271 review corrections

- **Inventory labels:** the §B table of the Phase271 report is corrected from the verified inventory JSON, with a dated note. 04 is air purifiers, 05 robot cleaners (whose v1.1.0 companion is missing), 06 dishwashers, 07 televisions, 08 soundbars.
- **Tuned vs unseen:** kept apart throughout (§5).
- **Comparable but conditions unmet:** `comparativeEvidence271` groups now carry `comparability: comparable |
  comparable_with_unmet_conditions | not_comparable`.
  - The live "I already have a fan oven…" answer now adds: "These results are comparable only within that experiment (same task and food load); the experiment does not record compartments in use, which the comparison requires, so it is a conditional comparison, not an established one."
  - Tested in `tests/phase271_comparative_retention.test.ts`.

## 10. Safeguards and verification

- **Tests:**
  - `npm test`: all shards pass;
  - new `tests/phase272_guided_extraction.test.ts` (5) and `tests/phase272_category_research.test.ts` (3);
  - vertical contract updated (D8 note; D9 attribution; D10 unknown-category transfer) and its test passes.
- **Regression:**
  - the Phase269/270/271 request sets are unchanged after the gap rule;
  - no-plan equivalence: 54/54 pages.
- **Unchanged:** ranking safeguards, `rankingInput:false`, Phase181 catalog verification and production signing (disabled).
- **Publication:** the guard runs before push; third-party page bytes stay in the private evaluation directory; public files carry ids, counts and hashes only.

## 11. Blockers and next actions

1. **D9:** comparison-review attribution. Bind values to column and clause products; keep the unresolved state; never default to the page product. Measure on new untouched pages.
2. **D10:** transferred plans must carry dimension-level terms and units. The purchase-phrase parser misses unknown-product requests; learned categories need a data-driven registry entry.
3. **Owner decision:** retention of plan-guided qualitative codes for non-cooking outcomes (an extension of the Phase270 amendment).
4. **Units:** currency-denominated derived costs and Delta E are not read.
5. **Next milestone:** a second untouched round after D9/D10 (about 20 requests, same policy class), plus the first two held-out categories of §8.
