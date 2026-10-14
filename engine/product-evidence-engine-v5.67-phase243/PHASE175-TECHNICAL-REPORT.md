# PEE Phase 175 — upstream discourse roles and cross-category public-query probe

Date: 2026-10-12. Parent: **canonical v4.98/Phase174 ZIP**, not a rebuilt approximation. Status: bounded English-only engineering research module, **not** a generally validated language model, scientifically admitted technical ontology, real-product suitability engine, or ranking system.

## Why this block

Phases 172–174 demonstrated that usage cues can prompt relevant *research hypotheses*. However, a recognized appliance noun is not necessarily the appliance the person wishes to purchase. An appliance may already be owned, owned or used by another person, present in a rented household, a competing solution, or expressly ruled out. These mistakes can corrupt any later recommendation. Phase175 investigates **equipment-role attachment** before category-specific causal dimensions are considered.

## Actual architecture

`src/phase175_disclosure_semantics.ts` invokes the actual Phase174 implementation for the exact request, which itself recomputes the Phase173→172 chain. It refuses a caller-supplied Phase174 output that does not exactly match recomputation. Equipment mention detection uses bounded English aliases with offsets, followed by `buildContextGraph154` from the previously developed review-language analysis. Phase154 is an MIT-licensed ConText-inspired implementation already inside PEE, with its prior third-party attribution retained. Phase175 adds task-specific guarded attachment: request vs possession vs household presence vs third-party equipment vs excluded or compared alternatives. The graph records speaker/other actor, proof excerpts and unresolved cases. Neither the context graph nor a lexical match proves the user's true intent.

The module also recognizes one **explicit** two-device shared-budget construction and distinguishes a currency-denominated range from two unassignable prices. It retains money values as user-asserted candidates; there is no product-price lookup or verified joint optimization. An immediately local generic “filter” near named drinking-water contaminants is a *context-inferred* family, marked as such, not proven by a literal appliance name. “I need no RO” and “reverse osmosis is not an option” remain solution constraints, but there is **no automatic veto of actual products**.

### Hard boundaries

- English only; finite alias/context grammar; no learned embeddings or model inference; no broad negation/coreference/ellipsis support.
- The `knownRoleSignature` hashes **only** recognized device roles, task, detected budget and selected research issues. Equality is not semantic equivalence, and cannot authorize identical recommendation claims without externally validated canonization and verified evidence snapshots.
- A third person's appliance is not automatically the buyer's property. “My house currently has” means contextual presence, not title ownership.
- The word *filter* plus PFAS gives a category **hypothesis**, not evidence of effectiveness, a certification or a remedy.
- `sourceMeasurementsVerified`, `productEvidenceVerified`, `hardExclusionsAuthorized`, `choiceChangeAuthorized`, `rankingAuthorized` and semantic validation always remain `false`.
- The new role graph **does not rewrite** the older Phase174 facets, cannot silently turn an inherited scope conflict into a ranking claim, and has no live API or recommender deployment.

## Source-first development challenge

Before Phase175 source modifications, `evaluation/phase175/original_post_source_freeze.json` recorded **12 separate original public posts**, with thread URL, original post date, developer synopsis and prospective problem tags. Later `public_short_original_excerpts.json` stored **short verbatim source fragments**. These are intentionally incomplete extracts, and some do not name the product at all; treating them as full-query ground truth would be invalid. The developer was aware of the source topics, prepared the excerpts, implemented the fixes and inspected outputs. **Independent gold labels = 0, accuracy/recall/precision = not measured.** The diagnostic file preserves every output and explicit uncertainty.

Sources (public user-post material, **not** trusted product-performance evidence):

- Vacuum for ageing parents and cleaning workload: https://www.reddit.com/r/VacuumCleaners/comments/1wb9zub/whats_the_best_vacuum_cleaners_for_aging_parents/
- Parents and carpeted stairs, lifting limitation: https://www.reddit.com/r/VacuumCleaners/comments/o3o8j6
- Existing central vacuum and limited access: https://www.reddit.com/r/VacuumCleaners/comments/1kc4dit
- Gifted espresso machine and grinder: https://www.reddit.com/r/espresso/comments/1tdxyro/gifted_an_incredible_machine_but_cant_afford_a/
- Explicit budget covering espresso machine *and* grinder: https://www.reddit.com/r/espresso/comments/1n6ermu/help_me_choose_a_grinder_espresso_machine_for/
- Whether to buy any pasta machine rather than make pasta by hand: https://www.reddit.com/r/pasta/comments/1f0ecle
- Seeking a specific hand-crank pasta roller: https://www.reddit.com/r/pasta/comments/1j60gto
- Kettle used for tea and with an espresso machine: https://www.reddit.com/r/BuyItForLife/comments/1t60clr/electric_kettle_w_temp_control_to_the_degree/
- Gas-hob compatible (non-electric) kettle: https://www.reddit.com/r/BuyItForLife/comments/1uzm833/tea_kettle_recommendations/
- PFAS/fluoride concern with reverse osmosis unavailable: https://www.reddit.com/r/WaterFilters/comments/1ueqb24/do_any_filters_removereduce_fluoride_and_forever/
- Multiple water contaminants and installation difficulty: https://www.reddit.com/r/WaterFilters/comments/1f3ro9i
- Well water, whole-house treatment and RO restriction: https://www.reddit.com/r/WaterTreatment/comments/1k5orvb

### What this exposed

1. “I've got about $1500 to spend” was initially incorrectly read as owning a grinder; it is now correctly interpreted as a monetary declaration, while explicit “both” can support a candidate joint purchase scope.
2. A casual “do I really need a pasta machine” was initially mislabeled as a committed purchase; now it is a candidate **solution comparison**, including the option not to purchase.
3. A robot vacuum alias overlapped with the generic “vacuum” suffix, making two purchase targets; overlapping aliases are now resolved conservatively.
4. “For my espresso machine” is equipment context, not a second requested device.
5. “Reverse osmosis is not an option” must not be erased by a general water-filter request. A generic *filter* next to a named contaminant is only a category clue.
6. A post excerpt about a gifted branded device, with no category noun or model registry, correctly remains unresolved. The missing product name must not be fabricated.
7. Third-party owners, people who use a product, and household equipment presence need distinct fields. However, full multi-turn referent resolution and implicit user identity are still unsolved.

## Test record

- `tests/phase175_discourse_semantics.test.ts`: **67 passing** deterministic software tests, including 15 additional developer-authored adversarial repairs for negations, affordability, and ambiguous accessory names; source offsets, inherited-context tamper rejection, quoted source-problem repairs, multi-device budget scope, negation/negative ownership, third-party and household context, alias collisions, limited-scope fingerprint metamorphisms, source-policy/authority denial, and cautious unknown-category handling.
- **Eligible TypeScript regression**: **2,490 passing across 135 eligible test files in 13 separately executed groups**. Historic Phase91/92 quarantined test files remain excluded as in the v4.98 parent. See `evaluation/phase175/regression-ts-recovery.json` for the subsequent re-run with all 67 targeted tests; the earlier `regression-ts.json` is retained as an historical checkpoint.
- **Python**: **212 passing across 6 discovery commands**. Existing SQLite `ResourceWarning`s persist in the `tests-companion` group; no Python production behavior was modified. See `evaluation/phase175/regression-python.json`.
- Public post short-fragment diagnostic: 12 sources, *no independent annotation*, source/topic/developer contamination possible, deliberately **no performance estimate**. See `evaluation/phase175/public_original_excerpt_diagnostic.json`.

## Research and engineering next actions (Phase176)

- Build a **source-blinded, independently annotated** original-user benchmark if independent labellers become available; record annotator disagreements and unknowns, include source and author de-duplication, and avoid training/tuning on evaluation threads.
- Explicitly audit the review-era semantics modules 125, 132, 142, 151 and 154 for rigorous, reusable scope and contextual roles, rather than proliferating literal category rules. Test long requests, counterfactuals, anaphora, quotations, sarcasm, multi-turn revisions, varying device actors, brand-only mentions and *unexpressed* goals.
- Integrate category-agnostic discourse anchors with **reviewed, versioned** need→mechanism→measurable-performance registries. Specialist methods must specify source/protocol edition, operating conditions and exact product variant. See Phase172–174 restrictions; do not mistake public advice or manufacturer claims for product measurements.
- Develop a no-product-recommendation option for unsolved goals and a verified joint-device choice framework *only once* independently admissible evidence exists. Ranking tie stability and explanation provenance must remain Phase112/169–171 controlled.
- Keep existing GitHub ZIPs as research inputs; request missing exact source packages when genuinely needed, but do not add unreviewed dependencies or local neural weights automatically. No user computer/Colab requirement for these offline steps.

## Interruption recovery and additional adversarial repair (12 October 2026)

The first recovered Phase175 build compiled, but **3 of 45 targeted tests failed**. Scope leakage caused a previously owned machine to be confused with a newly requested one. This was repaired using predicate-aware boundaries over the **existing Phase154 context graph**, while conserving coordinated equipment under one predicate. Subsequent adversarial cases exposed false ownership from monetary sentences, negative purchase/RO constraints, conditional needs, curly apostrophes and a bare pasta-extruder reference. The latest **67/67** targeted tests and **2,490/2,490** eligible TS regression tests pass, alongside **212/212** Python tests.

The adversarial sentences are written by the developer after seeing defects, so cannot establish generalization, benchmark accuracy or domain relevance. An inferred bare extruder requires an explicit local pasta context, carries `bounded_pasta_context_inference` provenance and is not a verified product family. Neither the inherited frozen public original-post corpus nor any accepted expert causal evidence was silently rewritten.

Integrity handling: a direct copy of the temporary development folder was found to omit two historical v4.98 files and alter other historical files (including generated Python caches); the release is therefore reconstructed from the **canonical v4.98 ZIP bytes**, replacing only `package.json`, then adding explicitly new Phase175 files. See `PHASE175-RELEASE-VERIFICATION.json`.
