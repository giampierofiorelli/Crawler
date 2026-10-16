# End-to-End Reality Check — Can PEE Deliver Its Advisory Service?

**Date:** 2026-10-16. **Base:** Phase265 HEAD `d1af26b`, reviewed. This is a deliberate audit, not a development phase.

**Evidence labels used throughout:**

- **[auth]**: authentic material;
- **[T1]**: synthetic fixtures or controlled data;
- **[op]**: measured on the operational path.

No network request was made. No live store was opened or modified; every run used a copy of the verified snapshot or a
temporary store. The Phase264 pilot was not touched.

## Summary

PEE can take an ordinary request for a known appliance category and return an honest, cited, **unordered factual
shortlist** from retained manufacturer and retailer specifications. It handles budget, size and capacity limits, and
it declines to rank. That is all it can do today.

It **cannot produce an evidence-based recommendation or ranking for any real product**:

1. **There is no authentic independent performance evidence at all.** The 4 "test source" revisions are metadata only
   (three CHOICE "how we test" methodology pages and one RTINGS headphone review); none holds a product result.
2. **No route connects stored evidence to the ranking engines.** The request path never calls the Phase180 or Phase181
   ranking code. No code produces the signed, reviewer-scored catalog those engines need. Phase265 test measurements
   never reach the decision layer.

Given hand-built evidence that meets their contracts, the ranking engines themselves work correctly and
deterministically [T1].

On the frozen requests, the first real blockers were language and rule defects. Two were fixed, with measured gains and
no regressions on 43 earlier cases. The decisive obstacle is evidence, and it needs an owner decision.

## 1. Baseline (frozen first)

**Files:**

- `evaluation/phase266/requests.json`: 7 requests with gold, frozen at `f388d3a` before any run.
- `1dc5630`: removed declared values that the first commit had wrongly placed in the public gold (S23). This is
  disclosed here; the values remain in Git history at `f388d3a`.
- Private gold with values: `privateEvaluationDir249()/phase266/`.

**Primary category: coffee machines.** Every category has 0 authentic test results, so evidence could not decide.
Coffee machines have the most retained authentic declarations: 11 products, 74 current declarations. R2 (open goal)
and R7 (air fryers) test category discovery and a second category.

**Operational path:** `adviseFromRequest253`. It runs `runJourney248`, then `extractConstraints253`, the Phase177
snapshot, `eligibleCandidates253` and `decideAdvice249`, on a copy of the verified snapshot. Runner:
`scripts/phase266-reality-baseline.mjs`.

**Runs:**

- `baseline.json` (`a8a1d4b`), committed unchanged;
- `after-fix1.json`;
- `after-fix2.json`.

All are public-form files; the full runs are private.

| Req | Kind | Gold | Baseline [op] | After fixes [op] |
|---|---|---|---|---|
| R1 | Explicit category, height ≤ 35 cm and < £250 | Shortlist of 3 | Shortlist 2/3; 5 correct exclusions; 1 false "unknown" (a "Height under filter holder" declaration read as a conflicting overall height) | Same |
| R2 | Goal only ("live alone, cook quickly, little electricity") | Clarify, propose solution types | Clarification: "air fryers or pressure cookers?" ✓ | Same |
| R3 | Water tank ≥ 1.5 L | Shortlist of 5 | Read as generic capacity. **Wrong exclusion** of a qualifying machine on its boiler volume; 1/5 found; 7 unknown | **4/5 found, 0 wrong**; 1 correct exclusion; 2 cautious unknowns (tank volume given in text) |
| R4 | "Which espresso machine makes the best-tasting … under £600?" | Budget shortlist of 8, taste stated as unassessed, no order | **Out of scope**: the purchase was read as "espresso machine makes the" | Shortlist **8/8**; 1 correct unknown (price in another currency); unordered; taste not named as unassessed (need not recognised) |
| R5 | "What is the quietest coffee machine?" | Abstain or clarify; no noise data | Clarification ✓; does not say noise data is missing (need not recognised) | Same |
| R6 | "Under 5000 Canadian dollars" | 1 meets, the rest unknown | Clarification: **budget not read** (CAD unsupported) | Same (not fixed) |
| R7 | "Best air fryer for a family of four" | Ask the capacity; no "best" | Asks the capacity ✓ | Same |

**Why no ranking, for every request (none is rankable):**

| Code | Meaning | Baseline | After |
|---|---|---|---|
| A | requirement missing from the user | 2 (R2, R7) | 2 |
| B | no authentic evidence | 2 (R1, R5) | 4 (R1, R3, R4, R5) |
| G | rule or understanding defect | 3 (R3, R4, R6) | 1 (R6) |
| C, D, E, F | — | 0 observed operationally | — |

- **E (stored evidence cannot reach comparison)** is structurally true for test measurements, but no authentic one
  exists, so it was never triggered on real data.
- **H (need not recognised: taste, noise)** occurs alongside B in R4 and R5.

## 2. One operational trace: R4 "best-tasting traditional Italian espresso for under £600"

| Stage | Component | Actual output | Status |
|---|---|---|---|
| Goal → purchase target | `purchaseTarget253` (Phase248) | Baseline: other = "espresso machine makes the" (head "the") | **Incorrect: first blocker.** Fixed: coffee_machines |
| Category | `runJourney248` category stage | Candidates [coffee_machines], but unresolved because the target named an unknown term | Consumable only after the fix |
| Need recognition | Phase248 needs, `CONCEPT_VOCABULARY248` | [] — "best-tasting … espresso" does not match the `espresso_quality` aliases ("tasting coffee", "flavour", …) | **Incomplete (H)** |
| Technical criteria | `extractConstraints253` | budget_max 600 GBP, stated | Correct |
| Candidates | `eligibleCandidates253` (store copy) | 9 coffee machines (authentic retailer and manufacturer declarations) | Correct |
| Evidence | `test_measurements265`, independent test sources | 0 test values; 0 authentic test documents | **Missing (B)** |
| Provenance and identity | Phase246 products, cited declarations | Cited per product; identity "extracted_unverified" | Correct for declarations |
| Comparison | `decideAdvice249` spec checks | Budget meets for 8; 1 incomparable currency | Correct |
| Decision | `decideAdvice249` | requirements_shortlist, unordered. **No `signedRelease` is passed by `adviseFromRequest253`; Phase181 is never called** | **Structural (E/G): no ranking route** |
| Final answer | `Advice253` | "8 of 9 meet every stated requirement (alphabetical, not ranked)", plus "Checks use declared specifications, not independent tests" | Honest but silent on taste |

**Manual intervention:** none for the factual path. A ranking would need a human reviewer to score and sign a catalog,
which nothing produces.

## 3. Authentic-evidence assessment [auth]

| Material | Available | What it supports |
|---|---|---|
| Retained declarations (private store) | 2,385 from 90 sources and 140 revisions: manufacturer 339, retailer 294, editorial 40, reference 912, unclassified 800 | Factual specification checks only |
| Authentic independent test results | **0** in every category | — |
| "Independent test" revisions | 4, metadata only, no body: 3 CHOICE "how we test" pages (air fryers, toasters, coffee machines), 1 RTINGS headphone review | Method pointers; no product values |
| Professional method references (category items) | 2 per category for air fryers, coffee machines and toasters | Method context, not evidence |
| Locally available raw authentic documents | 3 Sharp microwave manufacturer pages, lawfully re-fetched in Phase252; 2 match the recorded SHA-256, the third has no recorded hash | Manufacturer declarations |
| Owner research packages | Not in the repository or the environment | — |

**Pilot** (`scripts/phase266-authentic-pilot.mjs`, output `evaluation/phase266/authentic-pilot.json`). The 3 authentic
pages went through the operational path (live-wave `observations`, then `ingest-observations` under the class policy)
into a temporary store:

- 3 main products identified;
- **78 manufacturer declarations retained**, roles correct;
- **0 test leads, which is correct** (no test content);
- journal ok.

This proves the declaration path on authentic bytes and shows no false test extraction. **It does not validate test
extraction:** no authentic test document exists to try.

**Minimum package for a meaningful real-document pilot (needs the owner's rights decision):**

- 3–5 original test articles for one category (coffee machines or air fryers);
- each with explicit measured values (for example noise in dB, brew temperature, capacity, energy) and a stated
  method;
- covering at least 2 products already in the store, by exact model;
- fetched once under a reviewed rights decision, or supplied by the owner.

Success would be measured as leads extracted, correct product attribution and values persisted, against hand-made gold.

## 4. Controlled decision-engine test [T1]

`tests/phase266_controlled_decision.test.ts` (4 tests). It uses fictional machines, hypothetical reviewer scores and a
key generated in the test, through the existing Phase177 snapshot, Phase181 `dynamicKnowledgeAnswer181`, and
`decideAdvice249` with a Phase180 release:

| Property | Result |
|---|---|
| Multiple candidates; justified, deterministic ranking | ✓ |
| Essential constraint excludes the best-measured product | ✓ |
| Positive and negative contributions; order changes with priorities | ✓ |
| Legitimate tie (equal scores share rank 1) | ✓ |
| Missing value → held, research gap, not scored as zero | ✓ |
| Incomparable or unestablished essential outcome → held | ✓ |
| Catalog order or repeated runs do not change the answer | ✓ |
| No product with sufficient evidence → research required (justified abstention) | ✓ |
| Documented conflict (two observations of one dimension) | Fails closed for the **whole catalog**; per-product conflict handling is absent |
| Comparing raw measurements | **Not in PEE**: Phase180/181 rank reviewer-assigned `valuePoints` and weights. Converting measurements to points belongs to an external reviewer whom nothing supplies. Phase101–108 reviewed tiers are `rankingEligible:false` and not bridged |
| `decideAdvice249` with a signed release | `ranked_recommendation` ✓; without one (as the request path always calls it), never |

My first expectation for the Phase180 case was miscalculated; the engine's order (B 8,900 > A 8,700) was correct, and
the test asserts it.

**Conclusion.** The decision core can produce correct, deterministic recommendations when given reviewed, scored
evidence. **Discovery, review and scoring, not the ranking arithmetic, are the bottleneck.**

## 5. Ranked bottlenecks

| # | Observed failure (evidence) | Capability prevented | Fix exists? | Minimum action | Needs |
|---|---|---|---|---|---|
| 1 | 0 authentic test results in any category (§3); B in 4/7 requests | Any performance answer; any ranking | Pipeline exists (Phase225/226/265), unproven on real tests | Obtain the minimum authentic test package (§3) for one category | **Owner rights decision and/or network authorisation** |
| 2 | No route from evidence to ranking: `adviseFromRequest253` never passes a release or catalog; no catalog or release producer; Phase265 rows unreachable; conflicts fail closed (§2, §4) | Evidence-based recommendation even once tests exist | Ranking engines exist (Phase180/181); bridge missing | Owner decides who reviews, scores and signs, and the scoring policy. Then: compile reviewed Phase265 rows into a Phase181 catalog, and call `dynamicKnowledgeAnswer181` from the request path when one is configured | **Owner decision (review and signing authority, scoring policy)**; architecture |
| 3 | Requirements and needs misread: purchase target (R4, fixed), water tank (R3, fixed), CAD budget (R6), taste and noise needs not recognised (R4, R5), "What blender crushes ice best?" still misparsed | Correct answers on ordinary wording; correctly stating what is unassessed | Partly (Phase125 budget, Phase248 vocabulary) | Small rule and vocabulary corrections, each measured | None |
| 4 | Spec-check false unknowns: component heights read as overall height (R1) | Complete factual shortlists | `axisValue249` exists | Exclude component heights ("under filter holder") from the overall height | None |
| 5 | Two disconnected consumer surfaces: the Phase178 web server ranks only from configured signed data and never reads the store; the request path reads the store and never ranks | A single user-facing product | Both halves exist | Join them after #2 | Architecture |

**Outstanding technical debt, not investigated, because it did not affect the selected evaluation (no ingestion or
pilot run was needed):** the four suspected Phase265 review issues (repeat-ingestion retention, sitemap index
validation, source reclassification consistency, evaluation assertions).

## 6. Minimal fixes

Two fixes, each reproduced on the baseline, then re-run on the identical evaluation.

**Fix 1 — the water-tank requirement** (`phase253_request_constraints.ts`, `phase249_decision.ts`):

- a volume said of a water tank or reservoir becomes `water_tank_capacity_min`;
- it is checked against tank declarations, and a generic "Capacity" only when the value names the water tank;
- boilers are excluded from product capacity.
- **Result on R3:** wrong exclusions 1 → 0; qualifying products found 1/5 → 4/5.

**Fix 2 — the purchase noun phrase** (`purchaseTarget253`, Phase248). An article inside the phrase ends it ("which X
makes the …"). **Result on R4:** out of scope → the correct 8-product budget shortlist.

**Regression check:**

- Phase253 benchmark: 43 cases, spent set, development rerun, with and without the fixes. Exactly 1 case changed (r15),
  towards its gold (out_of_scope); 0 regressions.
- Focused suites (Phase248–259): 98/98.
- New tests: `tests/phase266_reality_fixes.test.ts` (2).

## 7. Metrics

| Metric | Baseline | After fixes | Evidence tier |
|---|---|---|---|
| Consumer goals correctly interpreted (purchase target or category) | 6/7 | 7/7 | op, frozen synthetic-text requests on authentic declarations |
| Essential stated requirements correctly identified | 2/5 | 4/5 | op |
| Performance needs recognised (taste, noise, capacity for four) | 1/3 | 1/3 | op |
| Genuine evidence documents available: authentic test documents | 0 | 0 | auth |
| Genuine evidence documents available: authentic raw pages (manufacturer) | 3 | 3 | auth |
| Authentic test values extracted | not tested (no authentic test document) | not tested | — |
| Test leads on authentic manufacturer pages | 0 of 0 present (correct) | — | auth |
| Correct product attribution, authentic test values | not tested | not tested | — |
| Correct product attribution, authentic declarations | 3/3 pages | — | auth |
| Correct product attribution, synthetic test values | 7/7 (Phase265) | — | T1 |
| Measurements durably retained: authentic | 0 (none exist) | 0 | auth |
| Measurements durably retained: synthetic | 8/8 (Phase265) | — | T1 |
| Measurements available to decision logic | 0 (no route) | 0 | op |
| Justified recommendations: ranked | 0/7 (correct: none rankable) | 0/7 | op |
| Justified recommendations: factual shortlists | 1 (R1 partial) | 3 (R1, R3, R4) | op |
| Justified abstentions or clarifications | 3 (R2, R5, R7) | 3 | op |
| Unjustified abstentions or non-answers | 2 (R4, R6) | 1 (R6) | op |
| Incorrect recommendations or unsupported claims | 1 (R3 wrong exclusion) | 0 | op |
| Controlled ranking correctness | — | 4/4 tests | T1 |

**Unit tests are reported separately:** 6 new tests (2 for the fixes, 4 controlled). Full suite: 4,493 passed across 19
shards, exit 0.

## 8. Technical verification

- **Full suite:** 4,493 passed, exit 0.
- **Store:** `knowledge-snapshot.mjs verify` gives verified, live = remote, unchanged. Every run used copies.
- **Commits:** `f388d3a`, `1dc5630`, `a8a1d4b`, then the fixes, runs, tests and this report (see `git log`).

## 9. Product-readiness answers

1. **Does PEE understand an ordinary consumer request?** Partly. It reliably finds the category and stated numeric
   limits for known categories (7/7 targets and 4/5 requirements after the fixes). It does not reliably recognise
   performance goals (taste, noise: 1/3), unusual currencies, or every question phrasing.
2. **Can it find or use authentic independent performance evidence?** No. It holds none, cannot lawfully fetch any
   without a new authorisation, and its test extraction has never run on an authentic test document.
3. **Can it associate evidence with products and variants?** For authentic declarations, yes, at page level (3/3), with
   variant identity unverified. For test values, only on synthetic fixtures.
4. **Can it compare genuinely relevant performance measures?** No. Only declared specifications (size, capacity,
   budget, power) are compared. Performance comparison needs reviewed scores that nothing produces.
5. **Can it produce an evidence-based recommendation when evidence is sufficient?** The ranking engines can, on
   controlled evidence (T1). The operational request path cannot: it never connects to them.
6. **The single most important obstacle:** the absence of authentic, rights-cleared independent test evidence, together
   with a reviewed route turning it into rankable knowledge. Code alone cannot remove it; it needs an owner decision.
7. **Smallest next experiment:**
   - the owner authorises (or supplies) 3–5 original coffee-machine or air-fryer test articles with measured values,
     covering 2+ stored products;
   - run them once through the existing extraction-to-persistence path, against hand-made gold;
   - review the extracted rows by hand into one small Phase181 catalog, under an owner-approved scoring note;
   - answer one frozen request end to end.

   This measures real extraction yield and attribution, and the first genuine evidence-based recommendation, or shows
   exactly where it fails.

Stopped for independent review.
