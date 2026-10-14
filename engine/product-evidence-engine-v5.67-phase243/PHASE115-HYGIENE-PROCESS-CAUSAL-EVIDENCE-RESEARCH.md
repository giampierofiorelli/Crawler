# Product Evidence Engine — Phase 115
## Floor hygiene as an end-to-end cleaning process: expert research, causal evidence and bounded software extension

**Date:** 2026-10-11  
**Cumulative baseline:** v4.38/Phase114 (kept intact)  
**Release:** v4.39/Phase115  
**Evidence level:** Original official public-health guidance + peer-reviewed studies + independent expert reviews. **No actual robot-floor microbiological experiment or empirical consumer-ranking validation conducted.**

## Executive decision (Italian)

La ricerca **corregge la fase 114**. Un robot può contribuire a mantenere un pavimento igienicamente pulito grazie a rimozione meccanica, lavaggio efficace, panno pulito all'inizio, risciacqui durante il lavoro, separazione dello sporco e pulizia/asciugatura finale. Un'analisi limitata a temperatura e certificazioni antimicrobiche ignorerebbe fattori importanti per l'igiene quotidiana. Tuttavia, **un meccanismo plausibile non è una misura di disinfezione**, e lavare il panno prima e dopo non impedisce necessariamente la contaminazione durante il ciclo.

La richiesta *«trovami i migliori robot che igienizzano il pavimento»* rimane un obiettivo **best overall with additional hygiene-related capability**, non *maximum floor microbiological kill*. Il motore deve poter esprimere una conclusione condizionata sulla pulizia domestica ordinaria senza inventare prestazioni antimicrobiche. Se l'utente chiede disinfezione verificata, la soglia probatoria è invece diversa e richiede misure indipendenti appropriate.

## 1. What the experts actually show

| Proposition | Direct supporting source | What it permits | What it does NOT permit |
|---|---|---|---|
| Ordinary household cleaning removes dirt and many germs; routine disinfection is usually unnecessary unless illness or special risk is present. | [CDC: Cleaning and Disinfecting, 2025](https://www.cdc.gov/hygiene/cleaning-disinfecting/); [CDC: When and How to Clean and Disinfect Your Home](https://www.cdc.gov/hygiene/about/when-and-how-to-clean-and-disinfect-your-home.html) | Include mechanical cleaning in normal household hygiene. | Claim that a **particular robot using water only** has removed a given percentage of bacteria or viruses. CDC describes soap/detergent, water and scrubbing, not this robot's controlled microbial test. |
| Microfiber floor mopping with detergent reduced sampled microbial contamination better than a traditional cotton system, **95% versus 68%** in a study using 24 rooms per test condition. Disinfectant addition did not improve the tested microfiber result. | [Rutala et al., American Journal of Infection Control 2007; PubMed PMID 17980233](https://pubmed.ncbi.nlm.nih.gov/17980233/) | The physical cleaning system can matter substantially. | Transfer 95% to autonomous robot pads, an untreated hard floor, different surfaces, water-only cleaning, or bacteria/virus-specific kill. Different systems, contexts, endpoints and conditions. |
| Dirty cleaning solutions, reusable mops and neglected rinsing may redistribute microorganisms. Health-care procedures specify regular rinsing and replacing dirty mop heads. | [CDC: Environmental Cleaning Procedures](https://www.cdc.gov/healthcare-associated-infections/hcp/cleaning-global/procedures.html); [CDC: Rational Approach to Disinfection](https://www.cdc.gov/infection-control/hcp/disinfection-sterilization/rational-approach.html) | Pad freshness **during** use, water separation and maintenance belong in the causal model. | Conclude any specific robot has prevented microbial transfer without testing it. |
| Mechanized laundering of manual floor mops yielded lower mean plate counts than manual washing (**278 versus 502 CFU/plate**); additional hypochlorite pre-soak had no statistically significant effect in the study groups. | [Singh et al., Indian Journal of Medical Microbiology, 2021, PMID 33892975](https://pubmed.ncbi.nlm.nih.gov/33892975/) | Pad reprocessing matters and should not be ignored. | Assume a robot dock is equivalent to commercial laundering, or that its pad is disinfected. This study tested the **mops**, not the floor as a robot cleans. |
| Wiping effectiveness varies with contact pressure, wiping motion, medium, agent, contact time and organism transfer. | [Jacobshagen et al., 2020, GMS/PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7273320/); [ASTM E2967 method description (withdrawn 2024)](https://store.astm.org/standards/e2967) | Design a controlled robot-floor lab assay including removal and transfer, not merely germ kill. | Claim a withdrawn ASTM standard is currently active or that applying a wipe method unchanged validates robot performance. |
| EPA distinguishes surface cleaning, bacterial sanitizing and disinfecting; antimicrobial claims require appropriate evidence and, for registered products, label contact times. | [EPA definitions](https://www.epa.gov/coronavirus-and-disinfectants/whats-difference-between-products-disinfect-sanitize-and-clean); [EPA Antimicrobial Manual](https://www.epa.gov/pesticide-registration/pesticide-registration-manual-chapter-4-additional-considerations) | Require target-specific assays for bacteria and viruses instead of inferring from marketing words. | Equate a pad-washing temperature, a cleanliness adjective or a germ-kill maker claim with independently tested floor disinfection. |
| Real dock temperatures may differ materially from advertised peaks; dock-hot-water and on-floor heated water are **different processes**. Vacuum Wars specifically measured dock wash cycles and identifies Narwal Flow as a rare on-floor warm-water system. | [Vacuum Wars, Sept. 16 2026: dock water measurement](https://vacuumwars.com/robot-vacuum-mop-dock-temperature-test/); [Vacuum Wars: Narwal Flow](https://vacuumwars.com/narwal-flow-review/); [Vacuum Wars: Narwal Flow 2](https://vacuumwars.com/narwal-flow-2-review/) | Separate actual/measured dock water, maker thermal claims and observed heated floor-mopping capability. | Use hotter dock water alone to assign a microbiological efficacy score. Thermometer measurements are not cultures or viral inactivation assays. |
| RTINGS observed continuous clean-water roller rinsing while the Dreame Aqua10 operates, a potential advantage over dragging dirty pads; reviewers also caution about missed pet waste. | [RTINGS: Dreame Aqua10 Ultra Roller](https://www.rtings.com/robot-vacuum/reviews/dreame/aqua10-ultra-roller); [RTINGS direct comparison to Saros 10R](https://www.rtings.com/robot-vacuum/tools/compare/roborock-saros-10r-vs-dreame-aqua10-ultra-roller/88296/112555) | Store both positive mechanism and separate contamination risk, with reviewer attribution. | Turn their caution about **possible** waste smearing into a directly observed smearing event or measured bacterial-transfer result. |

**Important limitations:** hospital intervention studies concern other equipment and environments; extrapolating a mechanism to domestic robots is a **qualified scientific analogy**, not a validated quantitative conversion. Distinguish reductions in culturable microorganisms on floors, cleaning-pad bioburden, visible soil, and infection risk: they are different outcomes. In an ordinary home, cleanliness is also influenced by recontamination from people and animals after the cleaning cycle.

## 2. Correct causal process model

```
Cleaning readiness BEFORE run
  ├─ Was pad washed? Was it completely dried during storage?
  └─ Starting pad and water conditions (unknown unless tested)
                   │
                   v
During cleaning on the floor
  ├─ Actual soil removal (tested stains, spills, dust)
  ├─ Material/contact/pressure, dwell, coverage, detergent when appropriate
  ├─ Continuous rinsing or return-to-dock interval
  ├─ Is dirty water kept separate from clean water?
  └─ Risks: pad saturated with soil, contamination smear, missed pet waste
                   │
                   v
After cleaning and before the next cycle
  ├─ Wash pad; verify HOW and under which conditions
  ├─ Dry pad; minimize prolonged wet storage
  └─ Contaminated reservoir and dock maintenance
                   │
                   v
POSSIBLE operational contribution to ordinary hygiene
                   !=
MEASURED microbial reduction on FLOOR for organism X, surface Y, mode Z
```

### Before/during/after are NOT substitutes

- **Before:** starting with a washed pad matters to initial hygiene, but there is no proof it is sterile. If the station only washes after a run, we cannot silently assert it performed a new wash immediately before the next one.
- **During:** periodic or continuous rinsing and separate dirty-water collection may reduce buildup and cross-transfer, **if the mechanisms work under the particular conditions**. These are more direct process indicators for cleanliness over a long floor run than an after-run wash alone.
- **After:** automatic washing/drying can help next-cycle readiness and minimize bad wet storage. It does not retroactively disinfect the floor.
- **Temperature:** thermal cleaning of the pad/dock can help remove grease/soil; actual microbial inactivation requires temperature, exposure time, substrate and organism-specific evidence. Heating water *on the floor* is also not automatically validated disinfection. Some current robots do use heated water while mopping; it is inaccurate to state that none do.

### Water-only caveat

Water plus rubbing can remove some matter physically. **The specific CDC generalization about removal of most household germs references soap/detergent and mechanical cleaning**, and the 2007 microfiber study used a detergent. Neither establishes equal microbial removal by every water-only robot. Therefore label pure-water floor cleaning as a plausible physical process contribution, not an independently quantified antibacterial effect.

## 3. The ontology the database now needs

Separate the following *product-neutral* evidence objects, each with source, exact variant, original-test identity, observed conditions, version and publication context:

1. `observed product mechanism`: e.g. roller actively rinses, dock washes, pad dries, floor is wetted; observed by an independent tester versus merely declared by manufacturer.
2. `measured process property`: e.g. dock wash-water temperature in degrees C, actual run-time rinse rate (when measured), cleaning duration, water usage, specific conditions.
3. `observed cleaning outcome`: e.g. stains removed, residual debris, visible smearing, water retained. It is NOT a microbiological assay.
4. `independent targeted microbiological outcome`: test organism, sample location (floor versus pad), surface, method, before/after result, units, context, controlled comparison, uncertainty.
5. `scientific explanatory bridge`: an **independent general published finding** describing a mechanism. Mark its inferential distance; never let it become a direct product-test fact.
6. `reviewer warning or extrapolation`: risk prediction separated from an event the reviewer personally observed.
7. `customer value`: a request-specific suitability projection only; it must never modify shared product evidence.

A conclusion such as “continuous rinsing may mitigate retained soil” is a **conditional mechanistic inference**. It can inform an explanation or a cautious qualitative preference, but its unknown magnitude and unmeasured microbiological effect must stay explicit. No arbitrary fixed numerical bonus for continuous rinse, hot dock water, or number of marketed hygiene features.

## 4. Original expert article pilot: FOUR manual observations, not a complete category ranking

The executable fixture `audit/phase115/manual-original-review-mechanism-audit.json` uses observations manually structured from named original articles:

- **Dreame Aqua10 Ultra Roller** — RTINGS documents continuous fresh-water roller rinsing during mopping, post-cycle dock washing/drying, and raises a pet-waste avoidance/spreading concern. The latter is stored as *expert warning*, not as a directly observed event. Source: https://www.rtings.com/robot-vacuum/reviews/dreame/aqua10-ultra-roller
- **Roborock Saros 10R** — RTINGS documents effective floor washing and pad washing at its dock. Lack of a record of during-run rinsing in our fixture is NOT an asserted absence of that feature. Source: https://www.rtings.com/robot-vacuum/reviews/roborock/saros-10r
- **eufy Omni S2** — RTINGS reports a heated mop-washing dock and floor washing. Manufacturer microbiological claims are not upgraded to tested floor outcomes. Source: https://www.rtings.com/robot-vacuum/reviews/eufy/omni-s2
- **Narwal Flow** — Vacuum Wars documents an on-floor warm-water system, real-time roller cleaning and on-board collection of dirty water. The fixture records the *feature*, **not an independently measured on-floor water temperature** and not microbial kill. Source: https://vacuumwars.com/narwal-flow-review/

All four have **zero qualified independent floor microbiology assays in the source material examined here**. This is a finding about the consulted source set, not that the products cannot reduce microbes. No numerical feature score, winner, virus claim or comprehensive list of the market is produced. Different source methodologies are not blindly pooled.

## 5. What the original user request should produce

The phrase *“trovami i migliori robot che igienizzano il pavimento”* is ambiguous about whether the user wants ordinary cleaning or demonstrated microbial inactivation, but is **not** ambiguous about the *primary ranking purpose*: best overall WITH an added hygiene-related capability, rather than best at disinfecting.

An intelligent interface should:

- Provisionally interpret everyday hygiene as effective wet cleaning with credible soil management where that reading is consistent with other context; show the distinction without asserting product-specific sanitization.
- Preserve a soft capability requirement until the user's real hard constraint is established, and avoid discarding viable products solely because they lack a microbiological study.
- Evaluate general product suitability from professionally tested outcomes and negative findings, while incorporating documented pad cleaning, dirty-water handling, and contamination risks as relevant secondary evidence—not just counting features.
- If the exact microbial meaning could materially change the recommendation, ask **one targeted question** about ordinary cleanliness versus specifically verified bacterial/viral reduction.
- Optionally provide a **separate** antimicrobial-efficacy comparison only if compatible independent on-floor assays exist. Do not automatically replace the original overall ranking objective.

## 6. Implementation, tests, exact limitations

Files added:
- `src/phase115_hygiene_process_reasoning.ts`
- `tests/phase115_hygiene_process_reasoning.test.ts`
- `audit/phase115/run-real-source-audit.mjs` + structured output, regression logs and verification record
- this report and cumulative documentation / manifest

The module models independent source provenance, site/target types (floor, pad, dock, on-board dirty water), stages of process, expert caution versus observed harm, endpoint-specific microbial assays, unreviewed manufacturer claims, reproducible candidate sorting, test deduplication and conflict states. It directly calls the Phase114 bounded intent interpreter and provides a strict adapter for Phase114 facts. Evidence that cannot be safely mapped, such as an unspecified stain-removal direction or a germ claim without method, is retained in an **unresolved registry** rather than quietly converted.

Test status recorded in `audit/phase115/`: **26 new scenario unit tests passed; 1,022 compiled JS/TS tests and 177 companion/Python/launch/release tests passed across completed runs = 1,199 tests**. These are SOFTWARE and constructed-data guarantees, **not a validated algorithm for predicting microbial removal**. Original public expert articles were inspected and **manually** encoded into the pilot, not automatically crawled or evaluated by an installed local model. The existing public recommendation runtime remains unchanged.

## 7. Next scientific experiment needed before quantitative hygiene ranking

Use an independently administered, blinded, replicated **robot floor microbiology assay** with qualified laboratory safety. Do not attempt to culture pathogens in a home. For each exact robot+mode+firmware and several realistic flooring materials/soil types:

- Obtain microbial counts **before and after** defined floor cleaning in comparable zones; use an appropriately selected non-pathogenic surrogate when required, and report target organisms/assay controls, log10 reduction and uncertainty.
- Sample *cross-transfer* by checking clean areas after the machine traverses contaminated sections; measure starting/mid/end-run pad loads, the clean/dirty water pathways, dock wash outcome and pad bioburden after storage.
- Record measured surface/contact water temperature **separately** from dock temperature, floor wetness/contact duration, detergent use/compatibility, pad rinse frequency, suction, actual route/coverage and cross-contamination events.
- Compare routine wet cleaning versus claimed antibacterial/virucidal modes. Vary dirt and organic loads; report failures and conditions, not just headline efficacy.
- Independently annotate source statements and estimate extraction recall/precision; test whether mechanistic indicators predict measured microbial outcomes **out of sample**. Until validated, keep causal proxies and microbiological performance separate.

**Release gate:** quantitative on-floor bacterial/viral ranking must remain disabled until appropriately qualified comparable assays exist. Routine household floor cleaning may still be discussed or compared using applicable expert test observations, with caveats that the biological effect has not been directly measured.
