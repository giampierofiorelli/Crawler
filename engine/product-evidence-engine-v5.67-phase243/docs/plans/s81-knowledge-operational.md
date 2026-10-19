# S81 — Making scientific knowledge operational (R3; owner brief 2026-10-19)

**Roadmap step.** R3, still the current step. Owner brief, verbatim:
`.claude/skills/pee-guided-learning/references/owner-r3-knowledge-operational-2026-10-19.md`. It continues
`docs/plans/s80-r3-consolidation.md`.

**Anti-drift checklist (roadmap §4).**

| # | Question | Answer |
|---|---|---|
| 1 | Step | R3 (scientific knowledge consulted). No R5 (nothing is learned by PEE), no R7 (nothing reaches advice). |
| 2 | Kind | Inference over acquired knowledge. Not vocabulary: no term, alias or category word added. Not learning, not transfer. |
| 3 | Level and tier | L2 (code + T1 tests), L3 on two structured batteries over the real teaching (one held back, run once), plus a T2 census on spent real pages. Rates are over the whole batteries. |
| 4 | Unseen data | The held-back battery was sealed before any code change and run once; same author, so not independent human validation. No genuinely independent material was available: the S80 pages are spent and were used only as a development census. |
| 5 | Complexity | 11 new input predicates (7 for evidence and links, 4 for program `comparable`) over kinds of knowledge already in the store; link-rules v8 (+7 evidence rules, 23 rules in the new program `comparable`); about 190 lines in `knowledge_link.ts`. One general English pattern (a condition whose name says identity, variant or model). No category code. |
| 6 | Negation | Every absence is closed over the record and named: a required condition "not shown" by the record is never "not met"; an attribute the teaching relates to nothing bears on nothing. |
| 7 | Evidence links | Unchanged kinds; what each licenses is now checked against every required condition. Shadow only: `rankingInput:false`. |
| 8 | Integrity | Gold written and committed before any run; held-back battery sealed by hash before any change; first runs committed unchanged; later runs labelled TUNED or after-change. |
| 9 | Standing warnings | No per-category fix, no new architecture (the existing Datalog engine and rule files), materials preserved (v1–v7 rules loadable), shadow until R7. |

## 1. Trace: where the acquired knowledge stopped

The whole path from the store's teaching to a conclusion was traced in the code.

| Path | What reached the reasoning | Where it stopped |
|---|---|---|
| Advice (`phase253`) | measured_by, requires_condition, sufficiency (ra.2), proxies | Knowledge only gates a **signed catalog**. Catalogs come only from Phase268, which hard-codes one air-fryer protocol (setpoint, one hour, empty load) and a publisher allow-list; the teaching is never read there. ra.2 checks `conditionsMet`, which the catalog **declares** (D28). So knowledge can refuse but never establish. |
| Reading-side reasoning (`knowledge_link`, KR `link` + `evidence`) | typed values, measurements, outcomes, force | **No consumer**: its conclusions reach no decision. And: |
| — required conditions | 23 of 79 taught requirements (those naming a quantity-knowledge axis) | the other **56 were invisible and treated as met**: a conclusion from an absence over an incomplete record (lk.6 rule E3). |
| — sufficiency | the store's 56 verdicts (16 establish, 37 inform only, 3 unclear) | `teachingView` used them only when the caller passed an overlay file; a plain caller got "unverified" everywhere. |
| — attribute proxies | — | the 49 `not_sufficient_for` relations from **declared attributes** (capacity, HEPA class, peak-brightness claim, litres per cycle) were dropped by the view: no inference used them. |
| Pairwise comparability (QK `compare`) | the metric's own generic requirements | the **teaching was never consulted**: two products' results of a measurement whose required conditions are unknown compared as "comparable". |
| Translated statements (6,118, store v10) | — | used only by the internal caveat shadow. |
| Request understanding | literal aliases | S80: the first failing stage in 6 of 6 requests. |

## 2. Reasoning on correctly structured facts (owner step 2)

Two batteries of structured cases over the **real acquired teaching** of 7 categories (air fryers, air purifiers,
coffee machines, dehumidifiers, dishwashers, televisions, tumble dryers). Gold was written from six stated principles
before any run (`evaluation/s81/battery.json`, commit `c187556`). The held-back battery
(`battery-heldback.json`: different measurements, conditions and attributes) was sealed by hash before any code
change (`73199f8`) and run once on the frozen mechanism.

Layers keep the failure kinds apart:
- **R:** the measurement is identified, so this is reasoning only;
- **A:** a declared attribute;
- **C:** two products' typed results (comparability);
- **I:** a typed quantity only (concept identification).

The principles:
- **P1 type**;
- **P2 sufficiency**;
- **P3 proxy**;
- **P4 required conditions**;
- **P5 comparability:** every non-identity required condition shown by both results and equal;
- **P6 metamorphic**.

Arms: the same algorithms, different knowledge.
- **K0:** no teaching.
- **Kc:** the teaching as callers got it.
- **Ks:** Kc plus the store's verdicts, the best the old code could do.
- **K+:** the S81 mechanism.
- **K+ ablations:** without required conditions, without proxies, without verdicts.

| Arm (units scored) | Dev: correct / over-claims / unjustified abstentions / wrong (65) | Held-back first run (55) |
|---|---|---|
| K0 knowledge off | 13 / 8 / 36 / 8 | 10 / 6 / 31 / 8 |
| Kc as called before S81 | 24 / 8 / 29 / 4 | 19 / 6 / 23 / 7 |
| Ks old code + store verdicts | 31 / 11 / 22 / 1 | 27 / 10 / 15 / 3 |
| **K+ kr81** | 60 / 0 / 5 / 0 (TUNED, dev) | **51 / 1 / 3 / 0** |
| K+ without required conditions | 49 / 13 / 3 / 0 | 41 / 12 / 1 / 1 |
| K+ without attribute proxies | 45 / 0 / 20 / 0 | 40 / 1 / 14 / 0 |
| K+ without sufficiency verdicts | 47 / 0 / 18 / 0 | 38 / 0 / 16 / 1 |

Metamorphic checks pass on K+ (renaming changes nothing; removing the only supporting relation withdraws the
conclusion; changing one condition value makes a pair not comparable).

## 3. Kinds of failure, kept apart (owner step 3)

Every failure of the old code (Ks, dev) has one cause:

| Cause | Units | Kind |
|---|---|---|
| The incomplete-translation cap fired on links already identified | 6 abstentions, 1 wrong | **reasoning** (rule scope) |
| Untyped requirements treated as met | 3 over-claims (+1 masked) | **representation → unsound negation** |
| Attribute proxies unavailable | 13 abstentions | **knowledge unavailable to inference** |
| Comparability ignores the teaching | 8 over-claims, 1 abstention | **knowledge not consulted** |
| Two energy or luminance values not identifiable | 2 abstentions | **concept identification** (no "load" or "window" typing) |

The remaining K+ failures on the held-back set are not reasoning failures:
- **1 over-claim (representation):** "programme" named among many other components of a dishwasher acoustic condition counted as showing the whole condition. A condition concept can only be typed whole or by single axes.
- **2 abstentions (language and extraction):** "12 dH, 20 g" and "both drawers vs one drawer". The quantity knowledge does not read a bare "g" or "dH"; a wording difference is not shown to be a condition difference.
- **1 abstention (concept identification):** the dehumidifier removal measurement has no typed measurand.

## 4. What was corrected (kr81.2, `src/knowledge_link.ts`, `resources/quantity-knowledge/link-rules.v8.json`)

All inside the existing KR engine and rule files; rules as data, each with its statement and source.

1. **Condition concepts.**
   - Every `requires_condition` becomes `requires_cond(M,C)`.
   - A condition is shown when the record states it (`value_states`) or states every axis it names (`cond_axis`).
   - Evidence rule E3 now also requires that no required condition is unshown. A requirement PEE cannot check is never treated as met.
   - Identity conditions (the name says identity, variant or model) must be shown per result, but are never required to be equal across products.
2. **Program `comparable`.** The stages run in order, and the earliest stage with a finding decides:
   1. the quantity-knowledge verdict;
   2. a required condition documented different (quantities of one kind with no common value, or different named axis values);
   3. a required condition not shown by both, or described differently without documented difference;
   4. otherwise comparable.
3. **Attribute proxies.** Rule EA1: a declared attribute the teaching marks not sufficient for an outcome bears on it as an indirect indicator only.
4. **The incomplete-translation cap** (lk.5) applies to links made by type, not to identified links.
5. **One source of truth for sufficiency.** `teachingView` reads the store's verdicts by default; `null` reproduces the pre-S81 view.
6. **Counterexample-guided correction.**
   - lk.7 had added a "required-condition preference" in the link program, tuned once on the dev battery.
   - On the store's real energy rows it would have preferred an empty-run reading that records the compartments as the cooking-task measurement. Recording a condition one procedure requires is not evidence against a procedure that does not require it.
   - The rule was withdrawn in lk.8, and the counterexample is a test.

**Description logic and first-order logic used where they help, with no new reasoner:**
- stratified negation with every absence closed over a named record;
- identity conditions as functional per individual (each result binds its own product), never as an equality constraint across individuals;
- no class-level inference beyond the store's relations.

Tests: `tests/s81_knowledge_reasoning.test.ts` (8). The suite is 4,836 tests, all passing. The user path is
unchanged: `phase253` does not import the module.

## 5. Real readings (step 6 measurement; development only)

The 12 S80 pages are spent and were never used as validation (`evaluation/s81/real-census-s80pages-kr812-b.json`).
They were read with the whole-document reader, and the same values were reasoned about by the old and the new rules.

- **Readings:** 443 values read, 63 linked to a taught measurement.
- **Withdrawn conclusions:** 7 of the 8 "partial evidence" conclusions of the old rules are withdrawn. All are air-purifier CADR values whose record shows no filter condition, decay control or model identity.
  - **Source check:** none of the four purifier pages states the filter condition, and none states a background-decay or sham control.
  - The withdrawals are correct: the knowledge prevented 7 conclusions the science does not support.
- **25 cross-product pairs:** all mode-power values in one table at the top fan setting.
  - They are comparable before and after; the taught same-fan-setting condition is shown equal.
  - The knowledge confirms the comparison; it does not change it.
- **Required conditions on these 63 linked values: 153.**
  - 35 identity;
  - 38 typed and shown;
  - 15 typed and not stated;
  - **65 with no axis.** No reader captures them (open debt D27).

**Wording and declarations.**
- Declared-attribute proxies match only 9 of the 170 retained declaration rows in the taught categories, because the teaching's attribute names differ from page labels ("capacity" vs "Extraction rate at 20 °C and 60 % RH").
- Widening the match would create false identities: "Water tank capacity" is not the taught "capacity". It stays exact.
- No new wording recogniser was built. S76 and R3 cycle 3 showed that lexical overlap cannot establish concept identity, and S80 showed literal aliases fail on paraphrase. The blocker stays as measured there.

## 6. Shadow evidence validation (step 7)

The knowledge-driven checks above are the general replacement for Phase268's coded protocol. They decide:
- which measurement a result is;
- which conditions the science requires;
- whether the record shows them;
- what the result bears on, and with what force;
- whether two products' results compare.

All of it is shadow; no public ranking path changed.

On the store's operational rows (12 test measurements):
- the 8 energy rows stay **ambiguous** between empty-run and cooking-task energy;
- the other 4 match no taught measurement.

The operational reader (Phase265) records conditions as protocol codes (`load_empty`, `duration_1h`,
`all_compartments`) that the knowledge cannot consult, and the quantity knowledge has no load axis. Phase268 reaches
its conclusion by code; the knowledge cannot yet reproduce it from the records. This is the precise blocker for
replacing the coded protocol (D27).

D28 is a second finding: ra.2 trusts the catalog's own `conditionsMet` list. Recorded, not changed: ranking rules
are owner decisions.

## 7. The five answers the owner asked for

**What the existing system could already infer.**
- Link typed values to taught measurements by kind, metric and fixed conditions.
- Grade force from source verdicts when an overlay was passed.
- Mark measurement proxies as indirect.
- Compare two values on kinds, metrics and stated axes, with derivations.

Over the structured batteries: 31 of 65 and 27 of 55 correct, with 11 and 10 over-claims.

**What was corrected or implemented.** Condition concepts in the evidence program, program `comparable`, attribute
proxies, the cap's scope, and the store verdicts as default (§4). One tuned rule was withdrawn on a counterexample.

**What improvement comes specifically from scientific knowledge.** The same algorithm with and without each kind of
knowledge, on the held-back set:
- **Required conditions** remove 11 over-claims (12 → 1).
- **Attribute proxies** add 11 correct conclusions (40 → 51).
- **Sufficiency verdicts** add 13 correct conclusions (38 → 51).

On real pages, the requirements withdrew 7 unsupported conclusions, each checked against the page text.

**What generalises across categories.** One principle applies in all 7 categories with no category code: results
compare only when every taught required condition is shown equal. The conditions differ by category:

| Category | Condition |
|---|---|
| Air purifiers | fan setting, filter condition |
| Dishwashers | programme, energy boundary, method edition |
| Televisions | signal mode |
| Dehumidifiers | inlet temperature and humidity |
| Coffee machines | consecutive shots, beans and grind |
| Tumble dryers | task, load and mode |
| Air fryers | food load, doneness, compartments |

Held-back comparability: 13 correct, 0 over-claims (with the requirements) vs 9 correct, 6 over-claims (same
algorithm without them). Worst category with knowledge: dishwashers, 9 of 11 (1 over-claim).

**What remains unverified.**
- **No genuinely independent material:** both batteries are by the same author as the mechanism (same model family), and the real-page census is on spent pages without gold for evidence force.
- **No user-facing decision changed:** everything is shadow.
- **Readers capture few conditions:** 65 of 153 required conditions on real readings are uncapturable today.
- **Partial axis coverage of a condition is not representable:** it causes the held-back over-claim.
- **Wording-to-concept connection:** unchanged.

**Success criterion.** Met at the level of correctly structured facts and in shadow:
- the reusable principle of condition-bound comparability, and the sufficiency, proxy and condition principles, are applied by the same algorithms across 7 categories;
- the gain disappears when the acquired knowledge is removed;
- on real pages it withdrew 7 unsupported conclusions.

It is not yet operational. The precise blockers are on the connection side:
- **D27:** conditions in documents are not captured as condition concepts or typed axes;
- **wording:** it reaches concepts only by aliases;
- **D28:** the ranking gate trusts declared `conditionsMet`.

**R3 does not close:** tests passing and shadow gains are not an operational improvement of decisions.

## 8. Recommended next steps (within R3, no new architecture)

1. **Condition capture as typed facts (D27).** Have the readers emit the conditions they already see (Phase265 codes, 1G setting rows, protocol statements in scope) as quantity-knowledge axes or condition-concept states, starting with axes the teaching already names (load, compartments, duration, setpoint). This makes the store's rows identifiable by knowledge, and lets kr81 replace Phase268's coded protocol in shadow.
2. **Derive `conditionsMet` from records (D28)** in shadow, and compare it with declared catalogs before any ranking change (owner decision).
3. **Measure on genuinely new material** once an acquisition budget is authorised. The S80 pages are spent.

## 9. Files

| Area | Files |
|---|---|
| Code | `src/knowledge_link.ts` (kr81.2), `resources/quantity-knowledge/link-rules.v7.json` (kept for replay), `link-rules.v8.json` (default) |
| Tests | `tests/s81_knowledge_reasoning.test.ts` |
| Evaluation | `evaluation/s81/`: both batteries, first runs and after-change runs of every arm, real-page census (counts); `scripts/s81-battery.mjs`, `scripts/s81-real-census.mjs` |
| Private | `private-eval/s81/real-census-*.json` (per-value detail of the withdrawn conclusions) |
| Contract | `docs/architecture/vertical-contract.json`: D27, D28 |
