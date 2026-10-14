# PEE Phase174 technical report

Cumulative research report is also included in the ZIP at `docs/phase174/PHASE174-CROSS-CATEGORY-TRANSFER-REPORT.md`.

# Product Evidence Engine — Phase 174
## Cross-category task/need transfer, professional methods and falsification probes

**Date:** 12 October 2026  
**Canonical predecessor:** v4.97 / Phase173. **Release:** v4.98 / Phase174.

### Status and limits

**Implemented, compiled and software-tested research prototype.** The new module is **not** a deployed adviser, independent semantic benchmark, technically certified category knowledge base, or authorized scientific product-ranking engine. Existing Phase164, Phase169–171, Phase172 and Phase173 source, rights and ranking controls remain in force. No product evidence, numerical rankings, exclusions, trained model or external model weights are introduced.

The user suggested **electric kettles, drinking-water filtration and pasta-making machines** to challenge generalisation outside the five Phase172 categories. We have treated the new families as adversarial *transfer probes*, not as grounds for claiming the English-language problem is solved.

### Implementation

`src/phase174_category_transfer_probe.ts` reuses the **actual Phase173 task-scope output** for the **same input**; an inconsistent externally supplied Phase173 object is rejected. It produces separately:

1. **Task type:** selecting equipment, comparing approaches, using/troubleshooting existing equipment or unresolved.
2. **Target category vs owned devices:** explicit target evidence spans, conservative ownership mention evidence, and abstention when two categories cannot be safely resolved. `I already own a kettle but need a water filter for PFAS` targets filtration; `I need a kettle and a water filter` stays unresolved as a single-product question.
3. **Candidate user need facets:** exact textual spans, polarity (wanted/rejected/ambiguous), prospective engineering mechanism, and potential observable. Generic reliability and physical fit/installation space facets are shared across the three categories, but transfer remains a hypothesis.
4. **Protocol pointers:** links to *published methods, certification scopes, or manufacturer manuals*, tagged with distinct evidential authority. No methods pointer is a product-specific measurement; absent methods are marked `method_missing`.
5. **Visible cautions:** PFAS cannot be dealt with by boiling; named-contaminant certification is different from general filtration; physical installation constraints, materials in contact with water and sheet-versus-extrusion requirements should not be buried in optional explanation.
6. **Stable bounded fingerprint:** same recognized task, category and candidate need IDs/polarities give the same fingerprint under supported paraphrases. This does **not** validate complete semantic equivalence or authorize ranking.

**Adjacent repair:** `src/phase173_goal_scope_adapter.ts` closes a narrowly documented regression in which “I ordered an espresso machine; which grinder should I buy?” could be misread as shopping for a two-device setup instead of a grinder accessory. The fix was verified by the Phase174 inherited-scope test.

All facets are `userAssertionOnly:true`, `domainReviewNeeded:true`, `verifiedProductCapability:false`, `hardExclusionAuthorized:false`, `rankingWeightAuthorized:false`. All outputs carry `languageUnderstandingValidated:false`, `realProductEvidenceAvailable:false`, `rankingAuthorized:false` and `exclusionsAuthorized:false`.

#### Why the three product families reveal different pitfalls

| Family | Everyday need | Proposed technical questions | Decisive caution |
|---|---|---|---|
| Electric kettles | "Only boil enough for one cup"; easier lifting; precise pouring; limit water/plastic contact | Minimum safe fill, overboil time, filled handling effort, contact path materials, spout flow | Minimum marked fill and operating conditions matter more than advertised total capacity; a metal exterior proves nothing about internal wetted surfaces |
| Drinking-water filters | Taste; lead; named PFAS; hard-water deposits; renting | Precisely named contaminant reduction claims, verified product certification directory entry, capacity/replacement, installation modification, hardness versus treatment | NSF/ANSI 42 aesthetics, NSF/ANSI 53 health-related claims and NSF/ANSI 58 RO are not interchangeable claims. PFAS filtering must be substance- and model-specific |
| Pasta machines | Sheets/ravioli versus extruded penne/rigatoni; less manual kneading; cleaning | Sheeter/roller path vs extrusion die geometry, compatible accessories, dough mixing steps, clearing food-contact parts | Ownership of a roller does not establish a need for another roller; models and dies must be checked before calling an extruder suitable |

These are *engineering research questions*, not numerical or causal approvals. One kettle limescale strainer intercepting flakes does not imply it can remove dissolved hardness minerals. For chemical/safety-related concerns, seek official water authority/testing evidence rather than transferring a consumer post into a water-quality diagnosis.

### Independent specialist material actually reviewed

| Source | URL | Authority / admitted use | Important boundary |
|---|---|---|---|
| Which? — how kettles are tested (updated 14 Oct 2025) | https://www.which.co.uk/reviews/kettles/article/how-we-test-kettles-aYVyI4A7WEY6 | Independent professional comparative procedure for boil time, minimum fill, overboil, limescale filter, handling | No specific kettle measurements imported and no permission to assume current test protocol conditions are identical to past variants |
| NSF — standards overview | https://www.nsf.org/consumer-resources/articles/standards-water-treatment-systems | Certification-category definitions | Mere standard name is not a specific substance-reduction claim |
| NSF — NSF/ANSI 42, 53 and 401, 16 Dec 2025 | https://www.nsf.org/knowledge-library/nsf-ansi-42-53-and-401-filtration-systems-standards | Aesthetic vs health vs emerging claim scopes | Individual approved products and reduction claims must be looked up separately |
| NSF — PFAS in drinking water | https://www.nsf.org/consumer-resources/articles/pfas-drinking-water | PFAS warnings and 53/58 certification guidance | Certification and specific chemical coverage can change; a general claim does not prove all PFAS removal |
| US EPA — reducing PFAS with a home filter | https://www.epa.gov/cleanups/reducing-pfas-your-drinking-water-home-filter | Official public-health consumer guidance | The EPA warns certification conditions/thresholds may not match all current PFAS target concentrations, as discussed in its publication; verify actual directory and current standard |
| Marcato — official product manuals | https://helpcenter.marcato.it/hc/en-150/articles/30193632756241-Manuals | Manufacturer-design/function reference for roller/cutters | Not independent performance tests and not transferable between accessories |
| Philips — HR2660/03 support | https://www.usa.philips.com/c-p/HR2660_03/7000-series-pasta-maker/support | Manufacturer reference for a particular automatic pasta maker | Product-family illustration, not a comparative ranking or a capability assertion about all variants |

The five source pointers embedded in the TypeScript module are intentionally a narrower subset. `methodStatus:'published_scope_to_review'` still means the precise experiment, calibration, test unit and individual model are unverified.

### Authentic user problems: provenance and contamination

- `evaluation/phase174/public_usage_development_cases.json` contains **12 developer-written condensed paraphrases** from selected Reddit discussions; `public_usage_development_diagnostic.json` stores the output. They influenced rule design and tests.
- `evaluation/phase174/additional_public_development_cases.json` contains **five more independently sourced threads** discovered later, with links and clearly labelled **developer-written paraphrases**; `additional_public_development_diagnostic.json` stores the outputs. These were evaluated after the initial rules existed, but were *subsequently seen during development*. Neither group is independently gold-labelled or held out for publishable accuracy estimates.
- Public comments can reveal goals, confusion and scenarios. They are **not evidence that a particular filter removes a contaminant, that a kettle lasts longer, or that a pasta machine has a particular validated capability**.

Five later original thread links:

1. https://www.reddit.com/r/BuyItForLife/comments/1j75qty/electric_kettle_with_plasticfree_internals/
2. https://www.reddit.com/r/WaterFilters/comments/1v9tqul/ro_system_for_renting/
3. https://www.reddit.com/r/WaterFilters/comments/1ofn2ye/water_filter_recommendation/
4. https://www.reddit.com/r/pasta/comments/vpkzzz
5. https://www.reddit.com/r/pasta/comments/cbfii3

**The second diagnostic exposes material gaps.** The module misses a directly expressed total budget ('$200'), the nuances of an already-owned pitcher being replaced by another filter, renter installation being *potentially* restrictive rather than explicitly prohibited, and verifying an accessory against a stand-mixer interface. It also treats “water filter upgrade” as having an unknown treatment objective, which requires a human clarification or more language competence. None of these is hidden as success, and no selection or product veto is made.

### Verification performed

- TypeScript build: **passed** with temporary external Node typings; no new dependency or weights bundled.
- Phase174 targeted: **71/71 tests passed**. Includes inherited-scope authenticity, category abstention, safe negative polarity, literal span preservation, owned-versus-target distinction, identical recognized facet fingerprints under a supported paraphrase, manufacturer/certification/professional method separation, explicit safety cautions, and no rank authorisation.
- TypeScript eligible regression: **2,423 passed, 0 failed, 134 files in 13 groups**. Phase91 and Phase92 remain historically quarantined. See `evaluation/phase174/regression-ts.json`.
- Python inherited groups: **212 passed, 0 failed, six groups**, with **58 ResourceWarning lines** in the inherited `tests-companion` group relating to older SQLite resource handling. See `evaluation/phase174/regression-python.json`.
- The test figures measure **software behaviour under defined cases**. They are not model accuracy, product suitability, independent causality verification or production operation.

### Explicit next-phase engineering gates

1. Freeze a truly independently annotated, source-and-author-separated **authentic English input corpus** before modifying the code further; track content rights, scope, target, ownership, negation, ambiguous references, and true abstentions. Benchmark errors on *full original queries* where lawful; do not treat designed paraphrases as a blind evaluation.
2. Generalize the already-developed Phase125 monetary/constraint parser but revise its `$ = USD` assumption for global users. Build an audited **budget/ownership/compatibility composition** layer, including systems with multiple purchased components (machine + grinder, host mixer + accessory).
3. Build category knowledge with **versioned, independently verified** `goal → physical mechanism → controlled metric → test method → exact product variant` edges. Neither keyword matches nor reviewer notes without authenticated sources can advance a ranking gate.
4. Test **rank-order invariance** on verified semantically equivalent inputs with the exact same snapshot, policy and candidate products. Changed constraints may change a ranking, but only from real authenticated product comparison traces.
5. Test explanation **decision correctness, visible decisive incompatibilities and abstentions**, rather than only subjective satisfaction or short-answer preferences.

### Disposition

Phase174 is closed as a reproducible **cross-category research and guardrail increment**. Causal knowledge, category classification, authentic-language generalization and model recommendation remain open until independently demonstrated. The cumulative prior code, research reports and previous phase tests are preserved.
