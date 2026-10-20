# S93 — Verifiable links, provenance separate from the nature of the result, the learning cycle

**Roadmap step.** R3 / R3-C (owner review of S92, verbatim in `owner-review-s92-2026-10-20.md`). R3 is **not** closed.

**Scope.**
- Shadow only. No store migration, no ranking, no LLM.
- Pages were fetched under the standing internal research policy.

**The owner asked to verify three effects before any claim:**
1. links to the original statement that are actually correct;
2. a reliable distinction between declared, measured and calculated results, with provenance kept apart and calculation
   assumptions identifiable;
3. a definition learned from documents that improves the reading of later documents.

The owner also asked to audit FlyingSquid against annotated data.

## Contents

1. Label-model audit (S92 material, spent)
2. What changed (general mechanisms, switchable)
3. Development (spent material; TUNED)
4. Independent check, first run (unchanged)
5. The three effects: verdict
6. Next (experimental, reversible)
7. Files

## 1. Label-model audit (S92 material, spent)

File: `evaluation/s93/label-model-audit.json`. FlyingSquid's reliability estimates, compared with the reliability
measured against the blind references:

| Signal | Estimated | Measured | Material |
|---|---|---|---|
| bridge | 0.99 | 0.68 | development |
| co-occurrence | 0.99 | 0.60 | S92 check |
| table links | 0.50 (not identifiable) | 0.81 | development |
| WD page default | — | 0.51 | development |
| WD page default | — | 0.17 | S92 check |
| S90 default | — | 0.38 | development |
| S90 default | — | 0.03 | S92 check |

- **The estimates are wrong in both directions.**
- **A0 and A1 are dependent within one true class:** phi 0.89 on measured values and 0.68 on declared values. This
  violates the independence assumption, as the owner suspected.
- **Consequence:** the label model is reported, not relied on. The rules with abstention (C1) stay the reference.

## 2. What changed (general mechanisms, switchable)

| Mechanism | What it does | Kind |
|---|---|---|
| Verifiable statements | Every link names its originating statement (1G block and sentence). For a table value these are the method statements 1G linked to the cell, not the cell. A structural decision points to the heading that announces the section's role. | reading → interpretation |
| Argument-based choice | Among a section's candidate statements, the choice goes to the one sharing the value's quantity, product and instrument, then the nearest (EIDER / SciREX). S92 took the first in document order. | inference |
| Coreference | The same value printed elsewhere, in a statement that says who obtained or stated it (EIDER's second rule). | inference |
| Provenance × nature | Two separate readings. Provenance: publisher, manufacturer or third party. Nature: measured, calculated, declared or condition. A calculation keeps the provenance of its inputs and never becomes a measurement. Calculation outputs are recognised, and their assumptions (tariff, hours of use, frequency) are kept. | representation |
| Object resolution | A property is its quantity and its object (I-ADOPT). When the chosen term belongs to a property with a generic object, and the sentence or document names the object of a same-kind property, the object decides. No vocabulary is added. | inference over the definitions |
| Lexical specificity | The more specific term wins a tie ("charging time" over "time"). | inference |
| Learning cycle | A weak explanation (a candidate term) no longer blocks a new concept. Induced concepts are verified without gold before promotion (details below). A verified concept becomes a candidate definition, narrower than the property whose head term it shares; it is loaded into the pack and reaches every reader. | learning |

**The calculation outputs recognised:**
- costs or per-period values in a calculation context;
- statistics over a set;
- ratios derived from two readings.

**The verification checks of the learning cycle:** publishers, documents, occurrences, a coherent magnitude, values that
vary, a quantity denotation, and a phrase not already a term.

Tests: `tests/s93_provenance_learning.test.ts`. They found three bugs, all fixed before the freeze:
- sentence boundaries cut by decimal points;
- a tie between a specific and a generic term;
- the output's own period taken as an assumption.

## 3. Development (spent material; TUNED)

A new blind reference was annotated for development: provenance, nature, evidence line and assumption lines on the 293
values of S89 and S91 (`nature-dev-freeze.json`).

**Nature and links:**

| | R0 (S92 C1) | R1 (S93) |
|---|---|---|
| Nature correct (of 293) | 131 | 134 |
| Calculated values recognised (of 26) | 0 | 13 (precision 52%) |
| Precision on declared values | 67% | 75.5% |
| Recall on measured values | 53% | 42% |
| Links reaching the reference line when it is elsewhere | 6 of 52 | 11 of 46 |

**Attribution on S92 (spent):**

| | Correct (of 116) | Wrong |
|---|---|---|
| Base | 57 | 27 |
| With object resolution | **78** | **6** |

**Learning cycle on S92:** no benefit.
- Inductive: no effect.
- Transductive: +1 concept matched, +3 false attributions.

## 4. Independent check, first run (unchanged)

File: `evaluation/s93/check-firstrun.json`.

**Material.** The sources were chosen for accessibility and measurement density before the categories. Both publishers
were used in S91 with other pages, so the check is new in pages, not in publishers.

| Publisher | Category | Pages | Values |
|---|---|---|---|
| Air Purifier First | air purifiers (taught) | 6 | 224 |
| Notebookcheck | laptops (never taught) | 6 | 238 |

**Blind reference.** Two independent annotators, one per category, read the whole pages. The reference was sealed
before any arm ran. 407 values are technical quantities:

| Nature | Values |
|---|---|
| measured | 112 |
| calculated | 180 |
| declared | 73 |
| condition | 38 |
| other | 4 |

406 values carry a provenance line, and 129 calculated values carry assumption lines. On laptops most values are
comparison-table deltas (+x%) about other laptops.

### Nature (407 values)

| | R0 (S92 C1) | R1 (S93) |
|---|---|---|
| Correct | 87 | **91** |
| Abstained | 208 | 214 |
| Measured: correct / predicted (precision) | 47 / 106 (44%) | 34 / 86 (40%) |
| Calculated: correct / predicted (precision); recall | 0 / 0; 0% | **18 / 30 (60%); 10%** |
| Declared: correct / predicted (precision) | 39 / 79 (49%) | 38 / 63 (60%) |
| Links reaching the reference line when it is elsewhere | 3 of 77 (4%) | **15 of 71 (21%)** |
| Calculations whose assumption is found (of 129) | — | **0** |

By category, the links improve on air purifiers (15 of 59 against 3 of 72) and not on laptops (0 in both).

### Role, measured against declared (185 values; trivial "all measured" = 112, "all declared" = 73)

| Arm | Correct | Abstained | Measured: precision / recall | Declared: precision / recall |
|---|---|---|---|---|
| A0 (S90) | **132** | 3 | 73% / 88% | 92% / 45% |
| C1 (S92 rules) = R1 | 86 | 70 | **90%** / 42% | 74% / 53% |
| D2 (label model, refit without gold) | 107 | 51 | **91%** / 57% | 80% / 59% |

### Attribution

On 119 values with a defined property, every arm gives 34 correct, 0 wrong and 2 false. Object resolution and the
learned definitions changed nothing: no learned definition was used, and no same-kind conflict occurred on these pages.

## 5. The three effects: verdict

1. **Links to the original statement.** They improve but are not yet reliable.
   - Reaching the reference line when it is elsewhere: 4% → 21% overall, 5% → 25% on air purifiers, 0 on laptops.
   - The links are now verifiable: every decision names its statement or its heading.
2. **Declared / measured / calculated.** The distinction now exists, but it is not reliable.
   - Calculated values were invisible before (0 recognised); now 18 of 180, at 60% precision.
   - Assumptions were found for **none** of the 129 annotated calculations. The reference's assumptions are mostly the
     inputs: the compared value, the test-room volume, the 60-minute test. They are not tariffs or hours of use, the
     only kind the reader recognises.
   - On laptops the calculations are relative differences in comparison tables (+x%), whose inputs sit in other cells.
     The sentence-level rule cannot see them.
   - Diagnosis after the run; recorded, not tuned.
   - Provenance (publisher, manufacturer) is unchanged against S92: 151 correct of 407 in both arms.
3. **A learned definition that improves later reading.** **Not demonstrated.**
   - The cycle produces "charging time" (narrower than `run_duration`) and "robot height" (narrower than
     `obstacle_height`), with typed relations.
   - It also promotes weak concepts ("aluminum", "either side", "surround speakers").
   - On the check no learned definition was used: the pages contained none of these concepts.
   - On spent material the effect was nil or negative.

**Other findings:**
- **Object resolution** (`battery_runtime` against `run_duration`): a large gain on spent S92 (+21 correct, −21 wrong),
  with no opportunity on these pages. A demonstration on a later independent page is still owed.
- **The label model:**
  - on this check (refit without gold) it is the best balance between precision and recall on measured values;
  - the audit shows that its reliability estimates are not trustworthy, so its result is not a validation of the
    method;
  - S90's "measured by default" scores more correct decisions (132) only because measured values are the majority
    here, at 73% precision.

**Status of the capabilities:**

| Capability | Maturity | Held-out result |
|---|---|---|
| Verifiable statement links | implemented, shadow | correct link elsewhere 21% (was 4%) |
| Provenance × nature | implemented, shadow | calculated: 60% precision, 10% recall; assumptions 0 of 129 |
| Object resolution | implemented, shadow | development only (+21 correct); no opportunity on the check |
| Learning cycle (concept → verified definition) | implemented, shadow | no effect on later pages; not demonstrated |
| Label model | implemented; estimates audited as unreliable | reported only |

## 6. Next (experimental, reversible)

- **Table relations for calculations.** A delta or percentage column defined against a reference row or another cell.
  The inputs are the cells; this extends the 1G table model and adds no words.
- **Assumptions as arguments of the calculation.** The inputs of a calculation (the values it combines, the test
  conditions) as well as tariffs and usage, identified by the same argument selection as the links.
- **Learning.** Stronger verification (concept head that denotes a quantity of the reviewed product, replication on held
  out documents). Then a check whose later pages contain the induced concepts, so the effect can be measured.
- **Object resolution.** A check page set where same-kind conflicts occur (battery-powered products with task
  durations).

## 7. Files

**Public (counts only):**
- `evaluation/s93/*`;
- `scripts/s93-*.mjs`;
- `src/definition_interpreter.ts`, `src/definition_learning.ts`, `src/table_interpreter1g.ts` (GL12 keeps links,
  `statedParameters1G`);
- `tests/s93_provenance_learning.test.ts`.

**Private:** `private-eval/s93/`. The pee-knowledge copy has text hashed and no page bytes or page text.
