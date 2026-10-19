# S87b — The general model of a scientific observation: survival across modules and transfer to unseen groups

**Owner decision (verbatim).** "Si procedi, ma devi anche capire che non stai lavorando sulla generalizzazione e questa
è grave". The decision is in `.claude/skills/pee-guided-learning/references/owner-s87b-generalisation-2026-10-19.md`; the
owner review of S87a it follows is in `owner-review-s87a-2026-10-19.md`.

**Scope.** Cross-system work alongside R3; R3 is not closed. Kinds: inference and evaluation. Maturity: shadow. No
network request, and no change to any operational module's behaviour. As findings, this report supersedes S87a §§2 and
4 (see S87a §10).

**Tier.** Authentic controlled (T2) on material spent by earlier phases:
- 472 gold observations from the Phase270–272, Step 1C and Step 1D-B gold sets;
- the mechanism is independent of them, but they are not held-out in absolute terms;
- the reference for the scoring is a blind annotation by a separate Claude agent (not independent human gold).

## 0. Outcome first

1. **The measurement answers the owner's question in numbers.** Each observation enters as a perfect reading would give
   it, and the census counts what survives each module boundary:
   - **validation:** 0 of 472 survive, because the publisher is a constant;
   - **the two measurement linkers** disagree on 267;
   - **storage** drops what is needed to link a value to a measurement (254 → 115);
   - **stated conditions:** 20% are carried by the "general" axes, and 0% in 9 of the 14 groups;
   - **with the category's teaching withheld,** nothing reaches a measurement.

   The "general" knowledge was itself fitted to the category it was developed on.
2. **Built:** a category-free observation model (`src/observation_model.ts`, shadow). It gives the measurand's kind and
   basis, and types each stated condition by its structure. It was developed on 2 groups only and frozen (commit
   c72440d) before it saw the other 12.
3. **Transfer, first run on the 12 unseen groups (6 categories, 6 publishers), unchanged:**

   | | Development (2 groups) | Unseen (12 groups) | Existing axes on unseen |
   |---|---|---|---|
   | Conditions typed correctly | 97% | **79%** | 14% |
   | Precision of the conditions typed | 99% | 95% | — |
   | Coverage of the conditions typed | 98% | 83% | — |
   | Measurand kind | 197/204 | **259/268** | — |
   | Measurand basis, where the text states one | 68/74 | **36/79** | — |

   - The model never consults category teaching, so every unseen category is also an *untaught* category for it.
   - **Worst group:** televisions on techradar.com, at 53%.
   - The drop from development to unseen (97% → 79%; 68/74 → 36/79) is the generalisation gap, and it is reported as
     such.
4. **What transfers and what does not.**
   - **Transfers:** structure. Another quantity is recognised through the unit knowledge; a relation between observations
     is recognised as comparison design; settings and instruments are recognised by the head of the phrase.
   - **Does not transfer:** domain content words ("peak HDR", "10% window", "small drawer", "no other devices on").
   - **Basis:** the drop is the largest error. A run's energy, water, cost or time is a per-run quantity even without
     the word "per", and the model does not know that general principle yet.
5. **Not done:**
   - nothing is wired into storage, validation or advice;
   - the 206 answers are unchanged;
   - **operational propagation is still open.** It needs a versioned change to the store schema, which is an owner
     decision.

## 1. Why the earlier work was not generalisation

| Requirement (skill `generalization-method.md`) | S86c / S87a |
|---|---|
| A principle is stated over relations or types (Part B §2) | Rules over words and taught measurement names (e.g. "per 100 eco cycles" in an id) |
| Group splits, worst group (Part B §3) | One store copy; 84 rows, mostly from one publisher |
| Validated on groups not used to find it (Part D §4) | Corrections found and measured on the same rows |
| Explicit lists are avoided | `TAUGHT87` (six categories), `FIRST_HAND` (cue list) |

Each fix improved the rows it was found on. None was shown to carry to another category or publisher. The
generalisation method in the skill already forbade this; it was not applied.

## 2. The model of a scientific observation (the owner's question)

An observation is the following tuple. The VIM (International Vocabulary of Metrology) is cited only for the meaning of
measurand and influence quantity; nothing is imported from it.

| Element | Content | Where PEE holds it today | Survives to |
|---|---|---|---|
| Subject | the product and variant measured | reader subject → `product_id`, association | store; validation (asks for an association) |
| Quantity | value, unit, kind | QK typing | store keeps value and unit; the kind can be re-derived for 309 of 472 |
| Measurand | kind + metric + **basis** (per run, per period, per unit, per area) + taught measurement | QK metric (85/472); Phase272 link (254); rule link (131) | store: no measurand words and no measurement id → 115 recoverable |
| Conditions | influence quantities, operating settings, instrument, method, procedure state, comparison design, sample | reader codes (3 codes); QK axes (20%); teaching terms (30%) | store: reader codes only (0 of 922 stated conditions) |
| Evidential role | measured, derived, declared, setting | Phase265 `evidence_role` | store; validation |
| Method | protocol or named procedure | `method_cue`, `protocol_codes` | validation checks one constant protocol |
| Uncertainty | stated tolerance, range, rounding | ranges in QK | not represented downstream |
| Provenance | source, reporting agent, extractor, block | row fields | store; validation (publisher constant) |
| Relation to knowledge | taught measurement, the outcomes it bears on, the conditions it requires | two linkers, D27/D28 | not stored; validation does not consult it |
| Justified uses | record, describe, compare within or across sources, rank | S87a assessment (shadow) | nowhere operational |

## 3. Information survival, measured (`evaluation/s87b/census-baseline.json`)

Oracle input: each of the 472 gold observations as a perfect reading would give it. Current code (8474eb3), unchanged.

| Boundary | Carried, with own teaching | Carried, teaching withheld |
|---|---|---|
| Unit recognised | 407 | 407 |
| Kind resolved | 328 | 328 |
| General metric | 85 | 85 |
| Taught measurement, Phase272 linker | 254 (ambiguous: 19) | 0 |
| Taught measurement, rule linker (`knowledge_link`) | 131 | 0 |
| **The two linkers disagree** | **267** | — |
| After storage: kind recoverable | 309 | 309 |
| After storage: measurement recoverable | 115 | 0 |
| Stated conditions carried (922): reader codes | 0 | 0 |
| Stated conditions carried: QK axes | 182 | 182 |
| Stated conditions carried: teaching terms | 277 | 0 |
| **Validated (Phase268)** | **0** (472 × `publisher_not_qualified`) | 0 |

**Per group (with teaching).** QK axes carry 38% of the conditions on housefresh.com air purifiers and 43% on
airpurifierfirst.com, and **0% in 9 groups**. The general pack's axes were built on air-purifier pages.

**Units not recognised** (65): money (p, GBP/yr, c, usd/year: 55), delta E (9), microns (1).

## 4. The mechanism (`src/observation_model.ts`, shadow)

- **Measurand:** kind from the unit (QK), the metric when the knowledge names one, and the basis.
  - The basis is read from "per / each / a X", from the unit ("/yr"), and from durations that name their task or end
    state.
  - Money is recognised as a quantity (ISO 4217 symbols). It is a candidate addition to the QK pack; the pack is not
    changed.
- **Conditions by structure, in order:**
  1. the instrument, decided by the head of the phrase;
  2. a relation between observations, which makes the condition comparison design whatever it mentions;
  3. money;
  4. another quantity, whose kind is its axis (via QK units), unless it names a setting's level;
  5. an operating setting (reusing the 1G cue `SETTING1G`, now exported without any change in behaviour);
  6. a method;
  7. a procedure state;
  8. a sample;
  9. identity;
  10. otherwise unclassified (abstain).
- **Comparability key:** kind | metric | basis | settings and quantity conditions.
- **Category teaching is never consulted.** A test asserts this.

**Complexity account.** Nine cue patterns of domain-general words: about 120 entries, all metrology or appliance
operation. There is no product, publisher or category vocabulary, no lesson registry entry, and one exported cue.
Development used two iterations, on the two development groups only:
- **it0:** 82% on development;
- **it1:** three principles:
  - relation before object;
  - a duration of a named task is per task;
  - number words are numbers.

Development stopped because the remaining errors needed product knowledge (instrument brand names) or had no words.

## 5. Transfer results (first run, unchanged: `evaluation/s87b/check-firstrun.json`)

| Unseen group | Conditions scored | Correct | Precision | Existing axes | Kind | Basis (stated) |
|---|---|---|---|---|---|---|
| air fryers @ lovemoney.com | 50 | 60% | 97% | 0% | 15/15 | — |
| air fryers @ trustedreviews.com | 38 | 92% | 100% | 0% | 13/13 | 6/13 |
| air fryers @ techradar / tomsguide | 5 | 100% | 100% | 0% | 7/7 | 1/2 |
| air purifiers @ airpurifierfirst.com | 120 | 98% | 98% | 43% | 80/80 | 8/11 |
| air purifiers @ techradar.com | 4 | 100% | 100% | 50% | 2/2 | — |
| dehumidifiers @ idealhome.co.uk | 9 | 78% | 78% | 0% | 9/9 | 2/3 |
| dishwashers @ trustedreviews.com | 15 | 93% | 100% | 0% | 13/13 | **0/13** |
| televisions @ techradar.com | 45 | **53%** | 86% | 0% | 26/27 | — |
| televisions @ tomsguide.com | 22 | 82% | 82% | 0% | 50/58 | — |
| televisions @ trustedreviews.com | 1 | (n=1) | — | 0% | 17/17 | 0/1 |
| tumble dryers @ trustedreviews.com | 82 | 67% | 100% | 4% | 27/27 | **1/18** |

There are 47 conditions the annotator classed "other" ("luminance measurement metadata", "range", "test room"). They are
counted apart and not scored.

**Error families on unseen groups.** This is diagnosis only; no change was made after the check run.
- **Content vocabulary (largest):**
  - picture content ("peak HDR", "fullscreen HDR", "10% window", read as a quantity);
  - configuration ("small drawer", "compartments in use", "steam option on");
  - environment state ("no other devices on");
  - relation words missing from the cue ("energy matched conditions").
- **Basis:** a run's energy, water and cost ("eco programme", "a drying cycle", "cost of a cook") are per run without
  "per". The general principle is *extensive quantities reported for a named run are per that run*. It was found on
  the unseen groups, so any version of it is now tuned and cannot be reported as unseen.

## 6. Principles: found, implemented, demonstrated (skill Part D §6)

| Principle | Implemented | Demonstrated on unseen groups |
|---|---|---|
| A condition is typed by the structure of its phrase; another quantity takes its kind as axis | yes | yes: 79% vs 14%, 6 categories, 6 publishers |
| A relation between observations is comparison design, not its object | yes (it1) | yes on air fryers, tumble dryers; misses "matched" |
| The measurand includes its basis; comparability needs equal basis | yes | partly: 36/79; the extensive-quantity principle is missing |
| Content vocabulary belongs in knowledge, not code | no | the failures show it: every error family is content words a category's teaching already holds in part (teaching terms carried 30–100% of conditions per group in the census) |
| One representation of "what this value is" across modules | no (shadow only) | — |

## 7. Limits

- **Spent material:** the gold sets were used in earlier phases. The reference annotation is by a Claude agent. Many
  inputs are annotator words, not page words, so the reading boundary itself is not re-measured here (no page bytes are
  retained, except for S80).
- **Shadow only:** nothing operational reads the model. The 206 answers are unchanged.
- **Group sizes:** 3 unseen groups have fewer than 5 scored conditions.
- **The live standing research policy still awaits owner confirmation,** so fresh unseen pages cannot be fetched to
  validate a tuned version.

## 8. Next (proposed; needs owner decisions where marked)

1. **Store the observation model with each test row:**
   - fields: kind, metric, basis, typed conditions, measurand words;
   - versioned, so the store keeps what the census shows it loses;
   - it is a store schema change and needs an **owner decision**.
2. **Content vocabulary as knowledge:**
   - the structural classifier consults category teaching terms (and, for untaught categories, the general pack)
     instead of code lists;
   - then measure on **fresh unseen pages**, which needs the standing policy.
3. **One measurement linker.** Reconcile the Phase272 linker and the rule linker (267 disagreements) into one, measured
   group by group.
4. **Validation from knowledge:** replace Phase268's publisher constant with the model's comparability key, plus the
   method's fixed conditions, in shadow first.
