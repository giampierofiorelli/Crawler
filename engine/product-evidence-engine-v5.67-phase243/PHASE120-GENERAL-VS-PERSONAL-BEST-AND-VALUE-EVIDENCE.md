# Product Evidence Engine — Phase 120
## General vs personal recommendations, expert functional baselines and dual best/value views

**Date:** 11 October 2026. **Cumulative base:** v4.43 phase119. **Release:** research prototype v4.44 phase120, not approved for live rankings.

## Executive verdict

The user may request either **the best robot overall** or **the best value robot overall**, intentionally providing no filters. **An intentionally general evaluation frame is a valid task**, not automatically a missing field requiring the user to choose vacuum, mopping, or both. Its frame and category referent must nonetheless be correctly identified: if *robot* is literally unconstrained and no floor-cleaning context is established, the system cannot assume a floor cleaner; that is a different ambiguity.

When the context is robot floor cleaners, general comparisons should transparently cover distinct **vacuum-only, mop-only, and combined** task lanes and optionally indicate the strongest **all-around combined** option. An individual user's requirements can instead select or prioritize task lanes, surfaces, hair/pets, carpets, dwelling, thresholds, privacy, maintenance and budget. Explicit hard exclusions are respected. **Neither mode may fabricate the other mode's preferences.**

Two *objective lenses* should always be available on the same evidence snapshot: **best performance** and **best value**. The one explicitly requested comes first; the other can appear nearby, clearly secondary, to reveal any meaningful price/performance difference. The optional pane must not silently change the user's criteria or rank using a stale price.

### Research verdict on “more functions”

**Supported in part:** a complete, highly capable all-around robot can reasonably receive credit for having more *meaningfully useful and successfully tested* jobs covered, and a general best-value pick should clear transparent category-specific minimum quality/functional standards.

**Not supported:** “the maximum number of listed features is the best,” or “every robot must include all aspirating, mopping, dock, steam and stair functions to qualify as good value.” That would inappropriately exclude excellent specialist floor cleaners and award unsupported points to a product for unused, inconvenient, ineffective or unreleased functionality.

Do not conflate *essential functional minimum*, *proven performance*, *functional versatility*, *user-facing convenience*, *novelty*, and *price*. Do not make device technology (e.g. steam generator) mandatory without evidence of a necessary outcome (e.g. measured stain-removal objective).

## Primary-source findings (direct, copyable links)

1. **Vacuum Wars, Robot Vacuum Buyers Guide, updated 30 Sep 2026.** Distinguishes cleaning goals, pets/carpet, hard floors, mixed flooring, obstacle avoidance, dock automation, furniture thresholds, and price. Says long feature lists are not useful by themselves; extra premium features can have diminishing returns. Explicit classes for best without mop and best robot mops. Its 2026 guide is editorial evidence for category segmentation, **not** proof of an optimal weighting policy for our system.
   https://vacuumwars.com/robot-vacuum-buyers-guide/
2. **Vacuum Wars, original testing methodology.** Documents distinct observations and methods; a capability name or mechanism alone cannot stand in for performance data.
   https://vacuumwars.com/how-vacuum-wars-tests-robot-vacuums/
3. **Which?, “Great Value recommendations,” 12 Aug 2023.** Its Great Value methodology requires a sufficient test result and a price generally at least 20% below the category average; category-specific floors differ. It is evidence for separate *good-enough quality* and *affordability* gates. **Do not transplant Which?'s 20% rule, 60–70% ratings or its catalog average to robot vacuums as universal law**; 2023 figures are historical examples of its described policy.
   https://www.which.co.uk/news/article/which-great-value-recommendations-aLqUj1R4kBHZ
4. **RTINGS, Calculated Worth, 12 Aug 2021.** Constructs price/score frontier and explicitly warns it does not tell everyone what to buy; its worth depends on how closely the tested score represents the buyer's needs. This is **not** a verified current all-category robot price-value formula.
   https://www.rtings.com/company/calculated-worth
5. **Thompson, Hamilton & Rust (2005), “Feature Fatigue: When Product Capabilities Become Too Much of a Good Thing,” Journal of Marketing Research 42(4), 431–442.** Three studies show too many features can reduce real usability/satisfaction and customers may give features more weight before than after use. The study does not measure today's robot vacuum products; it is strong conceptual counter-evidence to raw feature counts.
   https://doi.org/10.1509/jmkr.2005.42.4.431
6. **HM Treasury, “Use of Multi-Criteria Decision Analysis in options appraisal of economic cases,” updated 16 May 2024.** Separate screening for critical factors from trade-offs, use meaningful relative differences (“swing weighting”), and analyze decision sensitivity. Explicitly warns that simple weighted scoring lacks transparency/objectivity compared with a robust MCDA analysis. Public-policy methods must be adapted carefully for consumer purchases.
   https://www.gov.uk/government/publications/green-book-supplementary-guidance-multi-criteria-decision-analysis/use-of-multi-criteria-decision-analysis-in-options-appraisal-of-economic-cases
7. **Consumer Reports, Robotic Mop Buying Guide.** Distinguishes mop-only devices from hybrid vacuum/mop models and explains carpet-lifting limitations; useful corroboration that task classes have different capabilities.
   https://www.consumerreports.org/appliances/robotic-mops/buying-guide/
8. **RTINGS, Robot Vacuum Bench 1.1 (2026).** Distinguishes aspects of robotic wet cleaning; support for measuring cleaning outcomes rather than trusting hardware labels.
   https://www.rtings.com/robot-vacuum/tests/changelogs/1-1

### Important scientific interpretation

There is **no single externally validated consensus list of indispensable robot features** suitable for universal rank qualification. An expert-authored baseline is a transparent *editorial decision policy* grounded in observed failure risks, original measurements and the category/job. It has to be reviewed, versioned and tested. Criteria for **general complete combo** differ from those for **vacuum specialist**, **mop specialist**, and **a carpet-heavy house**. Hard/soft requirements need explicit and distinct status. The mere presence of an automatic mop-wash system cannot be converted into a stain-removal score.

## Proposed category intelligence (query-neutral)

For each task archetype, maintain:

- **Essential operational goals**: job outcomes with a minimum defensible standard, plus failure/security requirements applicable to the job. For combined robot general evaluation, include *both* independent vacuum and mop endpoint coverage before any 'good full combo' claim.
- **Breadth of useful jobs**: number and range of **demonstrably fulfilled user goals**, not count of switches, sensors, marketing modes or components. Include documented applicability and tradeoffs. One mechanism can support several goals but must not inflate the score repeatedly.
- **Performance quality**: actual effectiveness, edge/corner coverage, task execution robustness, nuisance failures, operating conditions and uncertainty. Use comparable original measurements; do not transport ratings across labs/revisions by declaration.
- **Convenience**: maintenance time, dock autonomy, noise, ease of use and servicing, separately from cleaning effectiveness.
- **Commercial availability**: SKU and region, released functionality and price date. Announced or future-firmware functions never count as currently proven.
- **Economics**: landed price, consumables, repair/lifespan when documented, and marginal benefits of spending more; never numeric overall score ÷ price without a justified scale.

## Correct user-facing behaviors

| User's query (robot floor cleaner context established) | Valid response policy |
|---|---|
| “Qual è il miglior robot?” | General evaluation without a mandatory question, across transparent vacuum/mop/combo lanes; show strongest all-around eligible *only if* quality baseline and ranking evidence support it; a compact second value panel |
| “Qual è il robot con il miglior rapporto qualità-prezzo?” | General value evaluation with minimum job-quality gates for each lane, same-market prices, best overall performance as secondary context; show multiple options if no robust winner |
| “Qual è il miglior robot aspirapolvere?” | General vacuum task: combo devices still eligible if independent vacuuming performance is good; don't demand mop hardware |
| “Qual è il miglior robot che aspira e lava?” | General *combined* task: both tasks and independent relevant measures required; specialized devices not eligible for combo ranking |
| “Ho 110 m², moquette in due camere, gatti e una soglia di 3 cm; voglio il migliore” | Contextual assessment of carpets, hair, reachable space and proven threshold geometry; price-free performance first, value panel second |
| “Stessa casa, ma miglior qualità-prezzo” | Same functional hard gates and task relevance; price/cost and performance trade-offs; optional premium-performance panel |
| “Mi interessa solo aspirare” | No mop requirement, combo hardware permitted if competitive vacuuming |
| “Non voglio assolutamente la funzione lavaggio” | Explicit hardware exclusion, exclude known combos; unknown hardware requires verification |
| “Qual è il miglior robot?” with NO floor-cleaner referent | Clarify robot category (e.g. floor cleaners vs industrial/educational) rather than silently guessing |

### Recommended UI principle

**Primary lens**: Best overall (if requested) or Best value. **Secondary lens**: the other, visually less prominent. Both must disclose the **comparison lane** and **baseline** and link to original evidence. Do not show an authoritative top-three table when data permit only a partial dominance graph. Highlight uncertainty without treating unseen results as failures.

## Implementation Phase 120

- Added `src/phase120_general_personal_dual_lens.ts` and tests. The adapter **reuses** `routeCleaningRobotRequest119` for reviewed functional eligibility and compatible original-test partial dominance.
- Accepts **reviewer-confirmed**, not freely generated, `mode = general | personal`, task scope and exclusions.
- An explicit **general** mode with `scope = undecided` generates three category lanes **without a forced clarification question**. An explicit combined scope generates only the combo lane. A personal mode with unresolved task retains a targeted clarification.
- Produces primary (`best_performance` or `best_value`) plus secondary lens from exactly the same immutable evidence snapshot. Request emphasis changes display order, not facts.
- Requires a separately supplied expert baseline with version and source references; a **combined** baseline cannot omit either aspirating or mopping outcome minimum. The numeric requirements in unit tests are **deliberately fictional fixtures** and ARE NOT approved standards.
- Distinguishes reviewed minimum reached / failed / missing evidence / cannot currently purchase / no price; does not confer wins for lower price below minimum or unreviewed extra features.
- The output **does not** publish a winning product; it is a bounded research-only decision frame. A full general ranking still requires a complete, calibrated, category-relevant and independent endpoint protocol and a valid value interpretation.

## Gaps left open before production

1. Category-expert empirical consultation and approval of minimum functional and outcome **thresholds**, including severity-dependent exclusions and criteria for specialist vs combo products; no one-number feature count.
2. Automatic, accurate discovery of original sources and source-to-SKU proof; especially the Phase118 malicious misattribution issue.
3. Full independent endpoint coverage / outcome comparability and long-run reliability evidence; inability to test a function cannot turn into zero performance.
4. General-purpose verified open-text parser and canonical intent contract; distinguish a deliberate general request, partial context and an actual ambiguous category; genuine multilingual user-question benchmark.
5. Actual all-around decision rule justified by independent expert-reviewed utility, or an explicit partial order and appropriate subgroup winners. **Do not silently install arbitrary weighting.**
6. Valid prices per shipping market and actual total ownership cost; robust sensitivity and useful upgrade cost differences.
7. Mainline integration, original review ingestion and independent human adjudicated live product ranking benchmark. The new unit tests are synthetic, not empirical ranking evidence.

**Release boundary:** the main recommendation endpoint remains unchanged; the phase120 module operates on constructed and externally adjudicated inputs. No claim that actual robot winners have been established.
