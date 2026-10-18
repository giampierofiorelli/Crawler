# Generalisation method — assessment of the owner research against PEE, and the working discipline

**Sources.**
- Owner research [research-generalization-2026-10-18.md](research-generalization-2026-10-18.md), preserved verbatim.
- The repository at Crawler `dc80b9f`.
- The 1G results (`evaluation/tables-1g/`).

**What this file is.**
- **Part A** is Claude's assessment. It is analysis, not capability.
- **Part B** is the discipline Claude Code follows during development.
- **Part C** lists the mechanisms PEE itself must eventually own in software. They are proposed, not built.

The owner's order of work (S50) applies:
1. strengthen the general interpretation and learning mechanism first;
2. then integrate the scientific knowledge through it.

The scientific knowledge is meant to be one of the instruments of generalisation, not a second system.

**Where it sits.** This methodology belongs in this skill, not in a separate component. Its reasons:
- the skill already holds evaluation discipline (`evaluation-and-reporting.md`, §2a principles 7, 11, 15, 18);
- duplicating that discipline elsewhere would split it.

## Part A — what 1G already does, what it only imitates, what is missing

Verified facts behind the table (Crawler `dc80b9f`):
- `src/table_interpreter1g.ts` imports only the 1F acquisition, the Phase245 DOM, the Phase272 generic lexicon and its
  own lesson registry. It does **not** consult the knowledge store, the category teaching (`measured_by`,
  `requires_condition`, `not_sufficient_for`) or any extraction plan.
- It defines about 25 module-level recognisers. Many are hand-written vocabularies: `PROPERTY_WORDS`, `PROPERTY_HEAD`,
  `SETTING`, `TEST_CUE`, `SPEC_CUE`, `CERT_CUE`, `METHOD_HEAD`, `EXPLICIT_ESTIMATE`, `RECURRENCE`, `PRICE_CUE`,
  `RATING_CUE`, `IDENT_CUE`, `CONDITION_QUALIFIER`, `PARAMETERS`, `BRAND_LABEL`/`MODEL_LABEL`, plus extra units and
  dimension words.
- `devDependencies` hold only `typescript` and `@types/node`; there is no property-based testing library.
- **Check-set conditions:** of the 28 elements with unannotated extra conditions, 8 are equivalent wording the string
  scorer does not recognise ("4.8 ACH" for "4.8 air changes per hour"), 4 are ranges read from labels, and the rest
  come from numbers in prose label cells, which are genuinely spurious.
  - So the condition result is partly a scorer limit and partly an interpreter error.
  - 8/54 is a lower bound; equivalent wording could raise it to at most 16/54.
- **The check set was not out-of-distribution.**
  - Every check-set publisher also appears in development.
  - C07 and C08 share S16's template, C01 shares S01's, and C02 duplicated C01.

| Technique | Already realised in 1G | Imitated by heuristics | Missing | Becomes general when |
|---|---|---|---|---|
| Constraint reasoning (CSP, weighted) | Whole-table hypotheses; hard violations (`unjustified_header_*`, two product levels); counted named signals; weak signals only break ties; abstention when tied | HTML header markup is a soft signal (the owner calls it a hard constraint when the association is explicit); there are no dimensional-incompatibility constraints; the "assumption count" is only header-level parsimony | Typed constraints from knowledge ("this quantity needs a condition"; "kWh is not W"); an explicit cost for every undocumented assumption | Constraints are expressed over predicates and types (below), not over word lists |
| Scientific types (QUDT-like) | `UNIT_LEXICON272` unit → dimension; dimension-homogeneity checks of lines | Dimension words chosen by hand; "coverage" was wrongly an area word until it was removed | Dimension algebra (power × time = energy), weighting (dB vs dBA), application metrics (CADR, a measure defined by a method), conversions | Quantity kind, unit, metric, method and condition are separate knowledge records (the owner's table) consulted by one algorithm |
| ILP (relations, not words) | The observation record has the slots: `product`, `property`, `unit`, `conditions`, `evidence`, `methodLinks`, `sourceCells` | Label roles come from vocabularies, not from learned relations | A relational layer (`hasQuantity`, `appliesToProduct`, `underCondition`, `supportedBySource`, `hasMethod`) with rules induced from annotated examples and counterexamples | Rules are data induced and checked against counterexamples, not code paths |
| CEGIS (counterexamples) | Claude's development loop: failed decision → general mechanism → switchable lesson → ablation (GL1–GL8); GL9–GL10 kept provisional because the check set suggested them | The verifier was the same development annotation each time | Accumulated counterexample suite (every counterexample becomes a permanent test); a verifier that searches (metamorphic and property generators); a stop rule | Part B §2 |
| Metamorphic / property-based testing | Transposition and column permutation on real tables; method removal and contradiction; spec table nearby; irrelevant links (fixtures) | Fixtures are hand-written, few, fixed | Unit-conversion invariance, product-name substitution, setting change → condition change, generated families with shrinking | A seeded generator in `node:test`; `fast-check` only if justified, since it would be a new dev dependency |
| OOD generalisation | None demonstrated | The check set (same publishers, partly same templates) | Group splits by publisher, category, template signature, measurand and method; deduplication; worst-group reporting | Part B §3; needs owner-authorised unseen pages |
| MDL (prefer fewer exceptions) | Lessons are few and named; parsimony on header levels | — | A complexity account per change (recognisers, entries, special cases) and a rule to prefer moving vocabulary into knowledge | Part B §4 |
| Selective prediction | Abstention (`unknown` evidence class; `ambiguous`; fields filled only when tied hypotheses agree); the eval separates "abstained" from "wrong" | — | Coverage–precision accounting per field; judging whether abstentions are justified; equivalence-aware scoring | Part B §5 |
| IRM / Group DRO | — | — | Not applicable without trained models; only their principles (invariance across groups, worst-group evaluation) are used | — |

**Already present elsewhere in PEE, to reuse rather than rebuild:**
- category teaching relations (`phase247_category_relations.ts`, Phase269–272 teaching);
- the extraction plan compiled from knowledge (`phase272_extraction_plan.ts`);
- the reading identity and reconsideration (`readingsToReconsider265` in `phase246_knowledge_store.ts`; debt D14: row-based only);
- template structural signatures (`scripts/step1d-a2-template-signatures.mjs`), usable as an OOD grouping key;
- experience cases and replays (`scripts/experience-*.mjs`);
- the lesson registries `table_lessons1e.ts` and `table_interpreter1g_lessons.ts`.

**Conclusion.**
- 1G already realises the *shape* of joint constrained inference and selective prediction.
- It *imitates* scientific typing and relational learning with vocabularies.
- It *lacks* typed knowledge consultation, counterexample accumulation, OOD validation and complexity accounting.
- The missing parts are mechanisms (Part C), not more lessons.

## Part B — working discipline for Claude Code

### 1. Lesson admission (before any interpretive change is promoted)

Every lesson in a registry (`table_interpreter1g_lessons.ts`, `table_lessons1e.ts` or a successor) records the eight
owner fields. Where a lesson has no entry for a field, it records why.

| Field | Content | Existing field |
|---|---|---|
| Failure mechanism | the general defect, from the first failed decision | `failedDecision` |
| Principle | structural or scientific knowledge that corrects it, stated without publishers, templates or products | `rule` |
| Applicability | structures and conditions where it should hold | `applicability` |
| Counterexamples | where it could fail; each one has a test | `counterexamples`, `tests` |
| Independent evidence | the result on data not used to build it, with that data's group: publisher, category, template, measurand | `evidence` (to be split) |
| Ablation | the effect of removing it, on development and on independent data | `evidence` |
| Regression | correct behaviour it worsens (lost correct values, new wrong values, new false measurements) | `evidence` |
| Rollback | the switch that disables it, and the reading-identity change it causes | lesson id in the digest |

**Promotion rules**
- A lesson whose effect is shown only on development data stays **provisional**.
- `active` requires effect on independent groups and no unexplained regression.
  - Under this rule GL1, GL5 and GL8 (development-only effect) would be provisional. Changing their state changes the
    1G reading identity and needs a fresh run, so it is left to the next phase.
- A lesson suggested by a check or held-out set can never be validated by that set.

### 2. Counterexample-guided development (CEGIS-inspired, not formal synthesis)

1. **State the candidate as a principle over relations or types,** for example: "power and energy differ by
   dimension". It is never a pattern over words, such as "annual power".
2. **Search for counterexamples with a verifier that is not the development annotation alone:** metamorphic families,
   generated variants, other groups.
3. **When a counterexample is found:**
   - reformulate the principle;
   - add the counterexample to a permanent suite that every later iteration must keep passing;
   - never add a branch that only excludes the counterexample.
4. **Stop rules.**
   - At most three reformulations per mechanism on the same data before taking it to independent data.
   - Data used to search counterexamples becomes development data (spent).
   - "89 → 110 on the same eight tables" is not progress.
5. **A counterexample from a check set is recorded,** but its lesson stays provisional (GL9–GL10 precedent).

### 3. Out-of-distribution validation protocol

- **Group keys:**
  - publisher (host);
  - category;
  - template signature (`step1d-a2-template-signatures.mjs`);
  - measurand or quantity kind;
  - method;
  - product identity.
- **Splits:**
  - every observation of a group stays on one side (leave-one-group-out);
  - the development side is frozen before the check side is examined.
- **Deduplication and grouping** (corrected 2026-10-18, owner review of bb64e96; the earlier wording "deduplication by
  page content hash and by template signature" is superseded, see S51):
  - identical copies (same content hash) are removed from independent counts;
  - pages that share a template, or whose content derives from the same source, are **grouped**, not deleted: they stay
    as legitimate evidence and count as one group in splits and in the worst-group report;
  - a table identical in structure and source to a development table is not independent (C02 = C01; C07/C08 ≈ S16).
- **Report:**
  - overall result;
  - the worst group;
  - unjustified interpretations;
  - tier, with the annotator stated (a Claude agent is not independent human gold).
- **Data:**
  - only retained pages already in scope, or owner-authorised new pages under a policy (robots, rights, budget);
  - the current dev and check sets are exposed and can never serve as independent verification again.

### 4. Complexity account (MDL-inspired)

- **Every interpretive change reports:**
  - recognisers or vocabulary entries added or removed;
  - special cases;
  - lessons.
- **When two variants are comparable on independent data,** prefer the one with fewer exceptions and the one that
  moves vocabulary into knowledge records.
- **MDL never overrides independent evidence or scientific constraints.**

### 5. Selective-prediction reporting

- **Per field** (product, quantity, unit, conditions, evidence class): coverage, precision of what was produced, full
  correctness, abstentions.
- **Abstention classes:**
  - justified — the source does not establish it;
  - unjustified — the source establishes it;
  - rule disagreement — for example, the annotation's default "declared" against PEE's "unknown".
- **Scoring:** recognise equivalent wording and unit-equivalent values before calling a condition or unit wrong; the
  current string-containment scorer under-reports.

### 6. Units, quantities, metrics, methods, conditions — keep them apart (owner distinction)

- Unit (dBA, W, kWh, m³/h); quantity kind (sound level, power, energy, volume flow); application metric (CADR, stain
  removal); method (the protocol); conditions (mode, temperature, duration, distance).
- A unit ontology does not define application metrics or methods.

**Unknown measure procedure** (owner): internal knowledge first → QUDT and, if useful, UCUM as references → authoritative
scientific or normative sources → reconstruct quantity, unit, method, conditions, meaning → validate and store as
knowledge (not code) → reconsider unresolved earlier readings.
- No online search for a measure already known.
- Online access only under an owner-authorised policy, honouring robots, rights and budget.
- **Licences:**
  - QUDT is stated by the owner to be CC BY 4.0 (attribution). Verify before any import.
  - UCUM's terms are not yet verified.
  - Consulting a vocabulary as a design reference and incorporating its data are different operations.

### 7. Developer capability versus PEE capability

- Claude applying this method during development is not PEE learning.
- A capability counts for PEE only when PEE's code performs it: consulting knowledge, checking a counterexample suite,
  gating a lesson, reconsidering readings. It must also be measured on PEE's deployed or shadow path.

## Part C — mechanisms PEE must own in software (proposed; not built, not authorised)

1. **Typed scientific knowledge.** *Built 2026-10-18 (GK), see `docs/plans/quantity-knowledge.md` and S51.*
   - Quantity kinds, dimensions with the algebra needed (power, energy, time; flow; level weighting), units with
     conversions, and application metrics defined by method.
   - Superseded on one point: general metrology is a versioned public data pack in the code repository
     (`resources/quantity-knowledge/`), not store records; category teaching stays in the store and is typed by the
     pack. UCUM not incorporated (licence forbids derivative works); QUDT identifiers only (CC BY 4.0).
   - One interface (`src/quantity_knowledge.ts`); consumers: 1G layer, request understanding (opt-in and the Phase253
     rate guard), typed relevance link. Legacy vocabularies still to migrate (debt D20).
   - *Extended 2026-10-18 (KN, S52):* qk.2 adds methods with fixed conditions, physical relations (consistency checks
     with implied assumptions), ordinal class scales with regimes, and label language; consumers add comparability across
     methods and scales, class requirements in requests and evidence needs naming methods. Not yet used by any decision (D22).
2. **Knowledge consultation in the global interpreter.** *Partly built (GK): as a layer over the frozen 1G reading,
   with its own identity; with/without measured on spent pages (`evaluation/quantity-knowledge/reading-final.json`).*
   - Expected measurands, units and required conditions of a category enter 1G as typed constraints and support.
   - They never act as acquisition gates.
   - Measured by a with/without-knowledge ablation on identical inputs. When the effect is zero, find out whether the
     knowledge was not consulted, not used, or not needed.
3. **Relational observation layer.**
   - The predicates over observations, with interpretation rules as data.
   - Induction from annotated examples and counterexamples is a later step, judged by independent data.
4. **Lesson gate in code.**
   - A check that refuses `active` without the Part B §1 fields and independent-group evidence.
   - It automates presence and procedure, not semantic truth.
5. **Counterexample and metamorphic harness.**
   - Generated families with a seeded generator, permanent counterexample suites, unit-conversion and identity-
     substitution relations.
6. **Reconsideration of unresolved readings** when knowledge changes. This extends `readingsToReconsider265` beyond
   rows (debt D14).
7. **Group-split evaluation harness** with deduplication and worst-group metrics.

**Proposed order** (Claude's recommendation, for the owner to decide):
1. Group-split harness and equivalence-aware scoring (7, §5), so that progress becomes measurable.
2. Typed knowledge and its consultation in 1G (1–2), moving hand-written vocabulary into knowledge where the evidence
   supports it.
3. Lesson gate and counterexample harness (4–5).
4. Relational layer and induction (3).
5. Reconsideration (6), when the store integration is authorised.

The scientific-knowledge integration proper follows step 2, as the owner decided.

## Part D — higher-order learning (owner decision 2026-10-18, S58)

A permanent learning principle, not a mandatory implementation.

1. **Reason about the rules, not only with them.** After each error, correction or new rule, look for the structure it
   shares with other rules:
   - the same scope pattern ("a statement about X covers Y only if …");
   - the same precedence pattern (specific over general, own words over document);
   - the same comparability pattern (a condition required by a metric);
   - the same evidence pattern (a method fixes conditions).

   Several rules sharing one pattern are a candidate principle.
2. **State the principle once, over reified objects.** Where PEE's knowledge already makes kinds, metrics, methods,
   condition axes and scopes into objects, a principle is one first-order rule quantified over them. Example: for every
   metric M and condition C, if M requires C and C is not stated for O, the comparability of O is not established. Prefer
   this to a new formalism.
3. **Generalise from cases, then try to break it.**
   - Positive and negative cases (experience cases, adjudications, counterexample suites) are the material.
   - ILP-style generalisation (the least general rule covering the positives and no negative), metamorphic variants and
     deliberately constructed counterexamples are the tests.
   - A principle that fails a counterexample is narrowed or dropped. It is never patched with an exception for that
     case.
4. **Validate on groups not used to find it**: another category, publisher, structure or measurand. Agreement on the
   cases that suggested it is not evidence.
5. **When first order is not enough** (a rule must quantify over rules or predicates themselves, e.g. "every scope rule
   must name its covered evidence classes", or learn which predicate a new category needs), first try a meta-level
   check or a schema in the rule data. Only then propose a bounded, reversible higher-order mechanism, with its benefit
   measured before adoption.
6. **Report three things separately:** principles found; principles implemented; principles demonstrated (on which
   groups, which tier).

