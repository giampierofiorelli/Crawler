# Product Evidence Engine — Phase 114
## Real professional review audit: “Trovami tutti i migliori robot che igienizzano il pavimento”
**Date:** 2026-10-11. **Baseline:** v4.37, phase 113. **Status:** Bounded, tested research extension; NOT an integrated general-purpose language model; NOT a consumer-validated comprehensive ranking.

## Executive finding
This stress test exposes a genuine semantic and evidential gap. The literal request asks for **the best robot floor cleaners overall, with floor-hygiene capability as an additional eligibility/selection consideration**. It does *not* ask primarily for maximum microbial-kill performance. Hygiene itself is ambiguous: everyday wet cleaning, sanitization (reducing microbes), or disinfection of particular bacteria/viruses. Floor cleaning, mop-pad self-washing, and microbiological efficacy are DIFFERENT entities, not three measurements of the same attribute.

The older Phase113 controlled schema has `Goal113` values `least_noise | hygiene_effectiveness | unknown` and categories `vacuum_cleaner | dishwasher | unknown`. It cannot represent the independent overall objective plus an additional capability requirement, nor a robotic floor-mop class. It would block as unsupported or collapse the purpose into hygiene effectiveness. This is an **observed code design gap**, not an empirically measured error rate of a live LLM.

The bounded Phase114 guard models:
- `objective = best_overall_with_capability` for the user's exact request;
- `objective = maximize_floor_hygiene` for “robot che igienizzano di più”;
- `floor_hygiene` as an additional capability, with the specific sense still unresolved;
- independent microbiological testing on the floor as separate from a manufacturer's germ-kill claim;
- missing assay as missing knowledge, *not* product failure.

Because there is no validated multi-criterion preference policy and none of the FOUR examined expert reviews establishes a quantitative independent on-floor microbe kill rate, neither an unconditional overall winner nor a ranking by disinfection effectiveness may be published from these records. The illustrative four models are **not a census of all available products**.

## Direct source examination: four real original RTINGS reviews
The following are concise, independently checked factual paraphrases from the named original reviews, not long extracts or republished review content. Each observation preserves a source URL and original review identity. Beware: an independent review's reporting of a maker's promise does NOT convert the claim into independent validation.

| Exact reviewed product | Independent professional observations relevant to overall suitability | Hygiene-specific evidence | Test-bench caveat |
|---|---|---|---|
| eufy Omni S2 | Dock washes roller with hot water; has wet mopping; RTINGS reports weak dried-stain removal and less-than-excellent floor debris pickup. | eufy **claims** its electrolytic solution removes 99.99% of germs. RTINGS reports that manufacturer claim, **not a microbiological floor assay by RTINGS**. | RTINGS robot v1.1 |
| Dreame Aqua10 Ultra Roller | Continuous clean-water roller rinsing while mopping; strong hard-floor debris pickup; some dried marks require multiple passes. | A cleaner mop/less dragged dirt is plausible floor-cleanliness evidence, **not direct proof of microbial inactivation**. | RTINGS robot v1.1 |
| Roborock Saros 10R | Strong stain removal under the tested deep-clean conditions and strong hard-floor performance; pad washing at the dock. | No independent floor microbiological assay found in the examined RTINGS review. | RTINGS robot v1.1, retested |
| Roborock Saros 20 | Excellent bare-floor debris pickup; relatively weaker stain cleaning vs Saros 10R; strong pet-hair pickup but obstacle/pet-waste weakness. | Mop washing in the dock is not a microbial floor outcome test; no such assay found in the examined review. | RTINGS robot v1.0, **do not pool numeric results with v1.1 without protocol qualification** |

Original articles:
- https://www.rtings.com/robot-vacuum/reviews/eufy/omni-s2
- https://www.rtings.com/robot-vacuum/reviews/dreame/aqua10-ultra-roller
- https://www.rtings.com/robot-vacuum/reviews/roborock/saros-10r
- https://www.rtings.com/robot-vacuum/reviews/roborock/saros-20
- Relevant comparison: https://www.rtings.com/robot-vacuum/tools/compare/dreame-aqua10-ultra-roller-vs-roborock-saros-10r/112555/88296
- Relevant comparison: https://www.rtings.com/robot-vacuum/tools/compare/roborock-saros-20-vs-roborock-saros-10r/127216/88296

## A second independent source reveals a serious ontology trap
Vacuum Wars measures the temperature of water used **at docking stations to clean mop pads**. That is an independent *dock-water-temperature* test. It is NOT an independent assay for reduced viable bacteria/viruses **on a cleaned floor**. It would be a serious false positive to transform hot dock water into certified or quantified floor disinfection.
https://vacuumwars.com/mop-dock-temperature-test/

Scientific definition of cleaning versus sanitizing versus disinfecting: US CDC (2025):
https://www.cdc.gov/hygiene/cleaning-disinfecting/

## Correct interpretation of the original request
1. Select the relevant category: autonomous robots with wet floor cleaning, not any robot vacuum or a hand steam mop.
2. Determine the PRIMARY objective: overall suitability among such robots. Consider quality of mechanical floor cleaning, vacuuming, navigation, usability, pet hair, upkeep, reliability and test applicability. **Do not replace this with microbial-kill maximization.**
3. Understand the additional floor-hygiene phrase; distinguish ordinary cleaning from independently tested sanitization/disinfection and ask a targeted question **only if** this distinction materially affects the candidate universe. If no explicit preference weights are elicited, a contextual shortlist can be given but not a fabricated definitive quantitative global ranking.
4. Keep separate: machine removes dust/dirt, mopping removes stains, reduction of cross-contamination while mopping, disinfecting mops in the dock, manufacturer floor-germ claims, experimentally measured bacterial reduction on floor, experimentally measured viral inactivation on floor.
5. If strict microbial disinfection is required and no eligible original tests are found, **abstain from declaring verified disinfecting products**, do not label all products ineffective. The user may accept the alternative goal of good general cleaning; obtain clarification before falsely narrowing candidates.
6. Offer a secondary view 'greatest independently measured floor microbiological reduction' **only when measurements comparable on the same organisms, methods, contact times, surfaces and modes exist**. Otherwise clearly say it cannot yet be calculated.

## What Phase114 actually changes
New, additive experimental files:
- `src/phase114_hygiene_capability_audit.ts`
- `tests/phase114_hygiene_capability_audit.test.ts`
- `scripts/demo-phase114.mjs`
- `audit/phase114/real-expert-review-intent-audit.json`
- This report

The module takes manually structured review facts and builds an auditable evidence-eligibility profile. It does not autonomously read webpages, interpret natural language generically, run a local LLM, calculate MCDA ranking weights, or mutate any canonical data. It is deliberately not wired into the public launch pipeline. It returns a null ranked result where no supported ranking is possible. This is a successful **gap-detection test**, not a successful production ranking test.

## Evaluation status
- 14 new bounded-module unit tests passed on developer-authored cases.
- 116 relevant JavaScript/TypeScript tests across Phases 110–114 passed in a completed run.
- The four original professional reviews were read by the assistant through public web evidence; no live Ollama execution or independent two-person annotation occurred.
- Full historical cumulative suites are not claimed rerun in this release. The previous v4.37 files have been retained by construction; file hash continuity is checked separately.

## Next missing capabilities, in priority order
**P0** Add an expressive, compositional canonical-intent schema: domain, primary objective, additional capability predicates, whether each is soft/hard/unresolved, user preferences and unresolved meanings; carry this schema unchanged into ranking.

**P0** Create a typed evidence ontology for cleaning versus sanitization/disinfection and for TARGET and LOCATION: floor vs pad/dock, bacteria vs virus, test organism, units, surface, mode and dwell/contact time. Manufacturer declarations must never be promoted into independent evidence.

**P0** Source-wide extraction must capture *indirect* and negative expert observations (stain smearing, contamination spread, recurring maintenance, pet-waste risks), not just marketing feature presence.

**P1** Calibrate category-specific suitability and multi-criterion rankings from anchored scales and confirmed/user-elicitated tradeoffs; do not make hygiene the largest weight just because it was mentioned.

**P1** Build a qualified empirical corpus of independent microbiological surface tests if an actual disinfectant ranking is offered; where these are absent, offer scientifically honest alternatives and possible follow-up research.

**P1** Validate the parser with spontaneous real-user queries, genuine paraphrases and contrast sets: 'best overall with X', 'best at X', 'must be certified for X', 'prefer X', 'please show the complete list', 'floors vs dock', bacteria vs viruses. Measure intent confusion, false gate exclusions and rank-invariance failures. Subject to the same snapshot/ranking policy, semantic equivalents must have identical full rankings.
