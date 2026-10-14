# Product Evidence Engine — Phase 116 addendum: "Which robot removes stains best?"
**Date:** 11 October 2026. **Status:** research prototype, user-query interpretation bounded to a known stain-cleaning pattern; not a published market ranking or a scientifically calibrated NLP engine.

## Executive design verdict

The question **"Quale robot toglie le macchie meglio?"** asks about the *quality of stain removal*. It **does not** state a maximum number of passes, a time budget, or a requirement to remove stains in one pass. Those are other defensible performance dimensions, but must **not be silently substituted** for the primary endpoint.

Keep a category-neutral *goal vs outcome vs cost/efficiency* distinction. For robotic floor mops, represent at least:

1. **Outcome / effectiveness:** original test's observed stain residue (or amount removed) after an explicitly defined and comparable test horizon. Explicit stain composition, age, substrate, cleaning mode, protocol, units and revision.
2. **Pass efficiency:** stain remaining after 1, 2, 3 ... passes, or passes needed to reach an **explicit** removal threshold.
3. **Time efficiency:** directly observed seconds/minutes to reach a **defined and common** cleanliness target; don't infer time from passes.
4. **Side effects:** stain smearing/redeposition and residual moisture, independently recorded rather than hidden in the outcome. These can be disclosed in the product card and considered in a broader goal when grounded and the user values them.

A user who asks generically for stain removal should get a comparison on the first dimension *where comparable endpoint data exist*, accompanied by clear descriptions of the number of passes used in the original tests and an option to see the other lenses. If only a publisher's speed-weighted composite is available, do not relabel it "best final cleaning" or derive a final stain endpoint from it. Present it explicitly as the publisher's mixed metric, not an independently decomposed one.

The engine must NOT compare a measurement after one pass for product A with a measurement after four passes for product B. Nor should it assume that all tests can be harmonized across labs, revisions, stains and surfaces. A full ranking can be withheld when comparable outcomes do not exist; absence of testing is not product failure.

## Primary-source findings and limitations

- **RTINGS, Robot Vacuum Test Bench 1.1, updated 27 July 2026:** now splits robotic mopping into stain scrubbing, smearing and residual moisture, photographing the stain between passes. It explicitly notes the relevance of passes 2 and 3 and that earlier passes can soften stains before lifting them. It identifies navigation as another factor that influences how often an area is revisited. This is **RTINGS' published method**, not evidence that any particular product is best: https://www.rtings.com/robot-vacuum/tests/changelogs/1-1
- **Vacuum Wars, "Stain Scores and Streaks", updated 18 September 2026:** its method deliberately weights earlier successful cleaning attempts more heavily, and also evaluates water left behind. The composite is useful for its intended purpose but cannot be reinterpreted as a pure terminal cleaning outcome: https://vacuumwars.com/stain-scores-and-streaks-how-we-developed-a-better-mopping-test/
- **Vacuum Wars, methodology overview:** details repeated trials and residue/water use; test descriptions and versions have evolved: https://vacuumwars.com/how-vacuum-wars-tests-robot-vacuums/
- **Vacuum Wars, system comparison:** roller and spinning mops do not have a consistently clear mopping-performance winner merely by technology type; actual outcomes matter: https://vacuumwars.com/robot-vacuum-mop-systems/
- **IEC/ASTM 62885-6:2023:** an authoritative published standard for certain wet hard-floor cleaners, but **explicitly excludes robotic wet hard-floor cleaning appliances**. It cannot be represented as an applicable robot-test certification: https://webstore.iec.ch/en/publication/66770

## Software implementation

Files added to the **cumulative v4.40 Phase116 repository**:

- `src/phase116_stain_outcome_semantics.ts` — verifies metric provenance and exact testing context; distinguishes generic endpoint, first-pass, time and passes-to-target requests; demands shared laboratory, protocol version, setup, surface, stain, mode, observation horizon and a defined threshold for efficiency views; returns no full ranking when these conditions fail.
- `tests/phase116_stain_outcome_semantics.test.ts` — 14 constructed tests for intent invariance, generic-effectiveness tie vs first-pass reversal, incompatible pass horizons, composite-score exclusion, missing data, version mismatch, threshold mismatch, deterministic input-order invariance, and contradictory endpoints.

This is an additional **decision-query adapter**. It does not mutate the canonical knowledge database or reinterpret the original reviews. It does not claim to implement full multilingual semantic understanding or a live cross-laboratory calibration model. All numeric values in test fixtures are **invented for unit tests**.

### Example of logically different rankings

Constructed products Alpha and Beta both leave **2% residual stain after 4 standardized passes**. Alpha leaves 50% after pass 1; Beta leaves 10% after pass 1. The ordinary "removes stains best" view correctly reports **a tie under the documented final endpoint**; the optional "single pass" view favors Beta. **The original query has not implicitly requested speed**.

### Future QA requirements

1. On real original expert data, extract *per-pass residual or reduction measurements* when actually available, recording test version and each pass, not inventing locked/paywalled numbers from qualitative prose.
2. Define and approve category protocol bridges, if possible, before any cross-publisher comparison. A similar-sounding "stain score" is not necessarily the same endpoint.
3. Preserve a full test-outcome vector in the product's canonical memory; derive the user's preferred lens in the separate query layer. Product facts must remain invariant under query order, language, user identity and personal preference.
4. When the user asks simply for "better stain removal" and a comparative ranking depends materially on unspecified stain types or floor substrates, show the relevant scope and a targeted follow-up; do not secretly choose the metric most favorable to a product.
5. Test the bounded intent parser on independently collected genuine prompts, including "better cleaning" vs "fastest", negation, temporal conditions and paraphrases. The current parser is a constrained demonstration, not a validated production interpreter.

**Evidence standard:** no public market-wide winners, no unobserved cleaning percentages, no cross-methodology harmonization by fiat, and no extrapolation of speed from pass count.
