# S97 — Causal audit: where acquired knowledge stops

**Roadmap step.** R3 (owner review of S96, 2026-10-20, verbatim in `owner-review-s96-causal-audit-2026-10-20.md`).
This is a diagnosis:
- no new reading algorithm, no category profile, no network request, no store change;
- counterfactuals run on spent material only (post hoc), behind options that are off by default.

## Outcome

**The main cause is structural.** Since S88, every improvement to how PEE reads evidence has been built on a line that
neither operational path imports:
- the property definitions, the definition interpreter, the typed entities;
- the qualitative evidence reader, the table relations;
- QK conditions, methods and relations.

| Operational path | What it uses instead |
|---|---|
| Store-writing (live-wave `observations`) | the Phase245 specification extractor and the Phase225/226/265 test-lead readers |
| User path (`adviseFromRequest253`) | store rows and regexes |

Nine phases of gains were therefore measured on a parallel evaluation harness and never reached a stored row or an
answer. The vertical contract did not list this as debt until now (D30).

Inside each path, knowledge is lost at specific, identifiable steps. Several of them come from earlier decisions that
were right at the time and silently became wrong when knowledge grew.

**The owner's four categories, with evidence:**

| Category | Where (examples, with counts) |
|---|---|
| **Never acquired** | **Vocabulary:** 37 of the 103 S96 values the candidates should read but missed have no known term near the value ("brightness of 300 nits", "display latency"). **Page text:** the regex block reader `textBlocks225` reads none of the article text in unclosed `<p>` paragraphs (Home Cinema Choice: 0 of 42 quantities). **Qualitative wording:** "motion clarity" for blur |
| **Acquired but disconnected** | **QK metrics:** 13 of 19 had no definition, so the reader could not use them (S96 connected them, shadow only). **`knowledge_statements`:** 6,118 rows, read only by the uncalled `teachingCaveatsShadow`. **`qualitative_observations270`:** no reader at all. **The whole definition pack:** off the operational path. **Same values, two readers:** the interpreter never receives the product-name, condition/result and product judgements that `document_evidence` already computes for the same values, nor the conditions QK's `typeQuantity` reads around each value |
| **Lost or impoverished** | **S96 transfer:** `conditions: []`, methods, traps, relations and line provenance dropped, which makes **every pair of values of an acquired property "comparable"** (95 of 95 on the S96 pages). **Ingestion:** `typeObservedValue` computes QK conditions and discards them, and the store has no column for them. **Teaching:** basis flattened into a `[...]` text suffix that advice strips; statement scope never persisted (6,118 of 6,118 `[]`); the generator truncates and drops inventory keys. **Comparative results:** 87 of 87 rows without a product. **Qualitative store:** admits 5 cooking outcomes only. **Acquired aspects:** carry no polarity or kinds |
| **Available but not used** | **S89 known-object guard:** "display" and "video signal" are recorded as objects of *no defined property*, and the guard blocked 63 values after S96 defined display quantities. **S89 `termScore` rule:** stating a property's object makes it stricter. **Journey output:** the user path discards `measuredBy`, `cautions` and unmeasured concepts. **QK request bounds:** opt-in, and no operational caller passes them. **Relation support grades:** never reviewed (200 hypotheses, 56 `same_model_not_independent` verdicts), so no stored relation can authorise ranking |

## 1. The map (four read-only searches, each claim checked against the code)

- **Store (24 tables).**
  - On the user path, only three relation kinds of `category_relations` are read: `measured_by`, `not_sufficient_for`
    and `requires_condition`.
  - `test_measurements265` reaches advice only as a shadow trace, and only with a signed catalog. Production signing
    throws by design.
  - `comparative_results271` is reached only for air fryers and only for one measure (`energy_per_cooking_task`).
  - `qualitative_observations270` has no reader; `knowledge_statements` has none on any path.
  - `variants` and `revision_properties` are read, then discarded.
- **QK.** Only these reach operational decisions:
  - units and kinds;
  - metric terms (for table-lead measurands);
  - single-word aspects (as "not assessed" objectives).

  Conditions, methods, relations, scales, phenomena, aspect polarity and conventional basis are shadow-only, or computed
  and then discarded.
- **Definition pack.** Every field is shadow-only.
- **Unsynchronised copies of one concept.**
  - Measurands live in about ten places: QK metrics, definitions, S96 overlays, store concepts, `SPEC_CRITERIA249`
    regexes, test-lead dimensions, comparative measurands, protocol and catalog keys.
  - Conditions live in about eight: QK axes (12), definition dimensions (20, of which only 6 map a QK axis), store
    condition concepts, Phase225 codes, Phase271 code maps, entity conditions, `acq_` axes, catalog names.
  - **Six QK axes have no definition dimension at all:** window size, signal mode, reference gamut, inlet air state, air
    changes, drive level.

## 2. Case tracing (the sealed S96 values, post hoc)

The S96 candidates should read 103 values that E1 missed (131 with a property, 28 read correctly). The first point of loss for each:

| First loss point | Values |
|---|---|
| Blocked by the S89 known-object or competitor rule | 63 |
| No known term anywhere near the value | 37 |
| Wrong property | 2 |
| Term in the value's own words but not used | 1 |

**Conditions the knowledge requires:**

| Requirement | Values | Stated on the page | Can be received |
|---|---|---|---|
| Window size, for peak luminance | 21 | 6 | No: no definition dimension exists |
| Reference gamut, for gamut coverage | 5 | 5 | No: no definition dimension exists |

## 3. Earlier decisions that propagate

1. **Shadow first, integration never** (S86–S96).
   - Each phase evaluated a new reader beside the operational one; none set an integration step.
   - The vertical contract (principle 10) did not record it.
   - Result: every later improvement inherited the same disconnection.
2. **Display recorded as a negative guard** (S89 `knownObjects`). Its note says these objects "are not the object of any
   defined property". When S96 defined display quantities the invariant became false, and nothing checked it.
3. **Object rule in `termScore`** (S89). Once a definition states its object nouns, wider-context support needs the
   object in the value's own words. **Counterfactual C3** (stating the display as the object of the display metrics) lost
   31 correct refresh-rate readings on development: completing the knowledge made the reader worse.
4. **Two condition vocabularies** (S88). The definition pack mirrors 6 of QK's 12 axes, so a requirement QK states cannot
   be received by a definition.
5. **A store schema without typed quantities** (Phase246/265). Kind, metric and QK conditions are computed at ingestion
   and have no column.
6. **Teaching stored as text** (Phase252). Basis, scope and condition content became strings or empty fields, which no
   later component can reason with.

## 4. Counterfactual link restoration (`scripts/s97-audit.mjs`, `evaluation/s97/audit-r1.json`)

All on spent material, against sealed references. "S0" is S96's E1.

| Change | Attribution (S96 / dev) | Regressions S89–S93 (1,604 sealed values) | Conditions read | Comparability verdicts (S96 pages) |
|---|---|---|---|---|
| S0 | 28 / 61 correct | — | 0 | 95 comparable |
| **C1+C2: conditions carried into candidates, plus the conditions QK already reads** | unchanged | none (C1 = S0 on every set) | 5 values; 16 missing defining conditions reported | **29 comparable, 64 conditions not established, 2 not comparable** |
| C3: object of interest stated + object licence | 26 / 25 correct, more wrong | 3–6 broken per set, false attributions up | — | — |

**What C1+C2 restores.** It improves a second capability, comparability safety, without costing attribution. The 95
"comparable" verdicts of the S96 overlay were a defect S96 introduced: it would have compared peak luminance values
measured on different window sizes.

**What C1+C2 does not restore.** The condition *reading* stays weak: QK found a condition for only 5 of 28 values.

**C3 fails because of decision 3**, not because the object is wrong knowledge. It was not tuned further on spent material.

**Advice.** No restoration can change an answer: none of these components is on the user path. That is the finding, not
a measurement gap.

## 5. Links that can be restored without new structures (for an owner decision)

1. **One operational reader.** Decide whether the definition interpreter (with the QK conditions and the
   `document_evidence` judgements it already lacks) replaces or feeds the Phase225/245/265 readers at ingestion.
   Everything else depends on this.
2. **Keep what is computed.** Store the QK-typed kind, metric and conditions that `typeObservedValue` already produces
   (columns or a journal field). Do not recompute them downstream.
3. **One condition vocabulary.** Definition dimensions should be views of QK axes (C1 derives them). The same applies
   to Phase225 codes and Phase271 maps, mapped once.
4. **Complete transfers.** The S96 overlay should carry conditions (C1), traps and non-equivalences (`notEstablished`,
   `notEquivalentTo`), method and source line. Aspects should carry polarity and kinds.
5. **Re-check invariants when knowledge grows.** For example: "known objects own no defined property"; and the
   `termScore` object rule needs revising before objects of interest are stated.
6. **Store-side readers already written but never called.** `qualitative_observations270`, `knowledge_statements`
   (scope persisted), and comparative rows linked to products.

## 6. Limits

- Post hoc on spent references; counts are diagnostic, not held-out evidence.
- Single annotators per page; the S94 development key is Claude's.
- The C2 condition reading comes from QK's existing reader only; better condition reading was not attempted.
- R3 is not satisfied, and no R4 recommendation is made.

## Files

- **Public:**
  - `scripts/s97-audit.mjs` and `evaluation/s97/audit-r1.json`;
  - options in `src/scientific_entities.ts` (`transferConditions`, `objectOwners`) and `src/definition_interpreter.ts`
    (`objectLicence`), all off by default;
  - test `tests/s96_scientific_entities.test.ts` (C1);
  - contract debt D30.
- **Private:** `private-eval/s97/audit-r1-detail.json`.
