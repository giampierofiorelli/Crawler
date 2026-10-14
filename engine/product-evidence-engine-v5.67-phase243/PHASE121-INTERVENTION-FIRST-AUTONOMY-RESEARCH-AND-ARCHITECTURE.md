# Phase 121 — How to rank robots that require less human intervention

**Date:** 11 October 2026. **Starting repository:** v4.44 Phase120. **Status:** independently sourced methodology investigation, additive reviewed-input research prototype; no measured market-wide autonomy winner validated.

## Executive verdict

A user's request for **the most autonomous robot / the robot requiring least human intervention** identifies a legitimate evaluative goal distinct from (a) greatest cleaning effectiveness, (b) best value for money, and (c) manufacturer's list of automatic mechanisms. It can be a **primary comparison view** for general or contextual questions. Cleaning outcome and suitability are **eligibility gates**, not quantities to trade silently for lower intervention. For a general cleaning robot question, preserve separate vacuum, mop, combined lanes per Phase120. A hands-free robot is not automatically a good cleaner.

**Important research finding:** RTINGS directly measures *intervention rate* on an obstacle course (not only obstacle avoidance); Vacuum Wars separately measures hair tangling, navigation, cleaning and dock features; Which? warns users to prioritize reliable mapping and navigation over a long inventory of modes, and notes the need for upkeep. These are multiple original *partial lenses*. They do **not** jointly constitute an independent, publicly available, standardized 30-day hands-off human-workload dataset for the 2026 robot market. Therefore the current module must not publish a complete real-product autonomy ranking.

## Verified original expert methods and primary links

1. **RTINGS, “Our Robot Vacuum Tests: Obstacle Avoidance,” 20 June 2025.** https://www.rtings.com/robot-vacuum/tests/obstacle-avoidance
   - Documents an actual **Intervention Rate**, separately from obstacle avoidance, on bare floor and carpet. A robot alerting the tester it needs help counts as intervention. Records three test runs and uses worst run for its specific score. This is direct evidence for the importance of rescue/failure events, **not** a measurement of long-term ownership labor or refilling intervals.
2. **Vacuum Wars, “How Vacuum Wars Tests Robot Vacuums,” last updated 4 November 2025.** https://vacuumwars.com/how-vacuum-wars-tests-robot-vacuums/
   - Publishes separate tests for carpet debris, 7-inch hair tangling, navigation/coverage, a 24-obstacle course, and dock-function inventory. It supports avoiding a purely feature-count model; a hair-tangle amount is **not** automatically equivalent to minutes of work required to clear it.
3. **Vacuum Wars, Robot Vacuum hub, updated 30 September 2026.** https://vacuumwars.com/robot-vacuums/
   - Explains differences among overall score, value, pet-hair use, obstacle handling, mop, dock features, and navigation. Its own scoring factors evolve; a current aggregated ranking is not a directly observed human-minutes measurement.
4. **Vacuum Wars, “The Best Robot Vacuum for Pet Hair,” updated 7 October 2026.** https://vacuumwars.com/best-robot-vacuum-for-pet-hair/
   - Explicitly distinguishes pet-hair pickup from hair-tangle resistance and advises checking the brush, wheels, filter and dock. Even strong anti-tangle systems still require periodic attention.
5. **Which?, “Best robot vacuum cleaners 2026: expertly tested and reviewed,” published 15 July 2026, current page revised September–October.** https://www.which.co.uk/reviews/robot-vacuum-cleaners/article/how-to-buy-the-best-robot-vacuum-cleaner-aD8i64c224SY
   - Reliable navigation/mapping, scheduled cleaning, standard-mode performance, and maintenance remain key. Self-emptying dock claims may reduce frequent emptying but do not remove every ownership task.
6. **RTINGS, “How We Test Vacuums,” 14 March 2025.** https://www.rtings.com/vacuum/learn/how-we-test
   - Evaluates both *User Maintenance* and *Recurring Cost*, incorporating ease of cleaning and replacement recommendations. It does not offer an experimentally measured universal lifetime burden in minutes for robot cleaners.
7. **IEC/ASTM 62885-7:2020 + Amd1:2022** (scope reference, not a certification of autonomy): https://webstore.iec.ch/en/publication/76953
   - Applies to dry-cleaning robot performance methods; this citation **does not mean the standard defines a four-dimension autonomy leaderboard or covers autonomous wet-mopping**.

## Four necessary evidence dimensions, and why they must remain separate

| Dimension | Desired user outcome | Proper observed evidence | Common invalid substitution |
|---|---|---|---|
| Unattended completion | Required task finishes without an intervention, in the tested environment | Completed unattended sessions / attempted scheduled sessions, with sample count and observation period | Claimed navigation sensors, nominal battery hours or area coverage |
| Rescue/interruption | Robot does not get trapped, snag cables or demand human rescue | Directly counted rescue/intervention episodes per defined tasks and scenario | Obstacle detection claims or marketing AI recognition counts |
| Routine manual care | Less human time spent replenishing, emptying, replacing and cleaning parts | **Observed minutes** of user service per specified period, including bin/bag, water, pads, filter, dock, brushes and related routine actions as applicable | Number of automated dock features or speculative 'X days hands-free' |
| Unplanned/manual fixes | Fewer unforeseen stoppages, jams, failures and corrective actions | **Observed minutes** spent troubleshooting or removing tangles/obstructions per defined period | Two-run hair-tangle mass as though it were minutes; claimed reliability |

Optionally include initial mapping/setup and moving the machine between inaccessible floors, or preparation/decluttering per run, but do not combine with recurrent workload without explicit, empirically defensible time horizon and amortization. **Autonomous washing/drying is an operating mechanism; proof of reduced user effort needs an observed consequence.** Clean-water refilling, dirty-water disposal and dock-tray care remain relevant unless the specific installation genuinely automates them.

## General vs contextual evaluation

- **General:** admit a reviewed default home scenario, with its floor mix, area, obstacle density, cleaning frequency, water connection, pets/hair loading, period and task mode clearly documented; do not silently state it is universal. Provide separate lanes for vacuum-only, mop-only and combined when the task has not been selected. Results are *conditional on the reviewed scenario*.
- **Personal:** changed household details define a **new scenario** (pets, long hair, carpet, 150 m², children, thresholds, water plumbing, room layout, need for daily cleaning). Reuse measurements if scientifically transferable; otherwise withhold cross-context comparison. The same verified intent and same evidence snapshot give exactly the same full pairwise output across paraphrases/languages.
- **Autonomy as primary user goal:** include a primary autonomy panel and optionally show the best-performance and best-value lenses as secondary, using the same unchanged fact database. A user who asks only for best performance should not have autonomy covertly replace their primary objective; autonomy may be a disclosed subdimension of convenience.
- **Commercialization:** current SKU/firmware/hardware/region and installation assumptions matter. Future promised automatic functions are not measured present-day autonomy.

## Phase121 implementation

`src/phase121_autonomy_workload_comparison.ts` consumes a Phase120 already-reviewed category-goal frame plus a **versioned, independently reviewed autonomy test protocol** and SKU-associated metrics. It does not change the earlier primary/secondary rankings. It exposes an autonomy-first third comparison lens. Required evidence dimensions are unattended-completion fraction, rescue interventions per 100 tasks, observed routine human minutes per 30 days and observed unplanned minutes per 30 days. A fifth explicit policy dimension may represent task preparation minutes. Units are **definitions for data contracts, not values established by the cited reviews**.

Quality floor: Phase120's separate expert-reviewed task outcome minimum must be met to enter autonomy comparisons. The adapter rejects missing or noncomparable measurements, developer-invented values in place of sources, source mismatches, duplicated result entries, wrong SKU binding, different protocol/conditions, insufficient observation exposure, and out-of-range results. It compares bounded intervals conservatively with **no universal weighted sum, no automatic normalization across lab methods and no human-workload inference from features**. Results distinguish strict partial dominance, tradeoffs and unresolved pairwise comparisons. Comparing finite tests with different run/day exposures is withheld.

### Controlled synthetic QA examples (not claims about real robots)

- Both models clean adequately. Robot Alpha has 98% unattended completion, 1 rescue event per 100 tasks, 4 minutes routine care and 1 minute unexpected care per 30 days in a **constructed** comparable benchmark; Beta has 80%, 8, 14 and 6 respectively. Under those invented measurements Alpha dominates Beta in all four dimensions. The code cannot infer this from their dock specifications.
- Gamma has higher autonomy on rescue episodes but substantially more routine servicing than Alpha. It remains a **tradeoff**, not a secretly weighted winner.
- An attractive 'zero maintenance' brand claim, a one-day expo demo or a missing measurement cannot become 0 observed interventions. A robot below the minimum cleaning quality remains excluded from the verified ranking even if it never stops.

These invented numbers are only executable unit-test fixtures. They do not estimate actual human workload for any released product.

## QA and outstanding research/engineering gaps

1. No broad robot dataset yet directly observes *all* relevant human interactions under a shared, prolonged protocol. Real consumer comparisons can present separate publisher measurements and qualified observations in the meantime, **without fabricating a total ranking**.
2. To validate in the field, assemble a prospective, reviewer-verified sample across products: record scheduled and actually completed sessions, machine abort/recovery, human rescue count and duration, preparation, refills, wastewater, dock cleaning, brush untangling, sensor/filter care and replacement. Include task quality checks, household conditions, purchased SKU, current firmware/modes, observation days, number of sessions, and censored intervals. Register the definitions *before* observing winners.
3. Track observed user work in actual minutes, **not** guessed time per action. Separate scheduled from unexpected events and initial setup from recurring work. Do not overinterpret zero incidents in finite trials or extrapolate a 30-day time figure from a few cycles. Use confidence intervals only if a defensible sampling method is given.
4. The Phase120 expert thresholds are not empirically calibrated. Source-to-SKU verified flags are **assertions supplied by a separate review process**, not self-verifying external citations. Phase118 adversarial misattribution remains open.
5. No live local LLM or authenticated web extraction, full user-intent equivalence corpus, independent original-review metric extraction, validated cost-of-ownership estimates or end-to-end market ranking has been accomplished by Phase121.

**Release boundary:** this is a typed and tested research adapter, not a consumer ranking. Full test results and cumulative file integrity are recorded separately in `PHASE121-RELEASE-VERIFICATION.json`.
