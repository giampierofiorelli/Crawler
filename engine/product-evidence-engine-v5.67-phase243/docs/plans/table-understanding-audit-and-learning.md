# Table understanding and operational learning — Stages A–D (2026-10-18)

Owner assignment: "PRODUCT EVIDENCE ENGINE — TABLE UNDERSTANDING AND OPERATIONAL LEARNING — Stages A–D" (authorised 2026-10-18).
Its two conditions:
- every error must be diagnosable (operation, available information, missing evidence, all independent blockers);
- verified lessons must change the reader through general, versioned rules applied automatically in shadow reading, with the
  operational path protected until Step 4.

**Tier.** Development evidence only.
- HTTP requests: zero.
- Every page is retained and spent: Phase268–272, Step 1C and Step 1D-B.
- The 18-table sample informed the lessons.
- The annotator was a separate Claude agent, not independent human ground truth.
- Nothing here is held-out, and there is no generalisation claim.

**Not changed:**
- the default reader;
- the general prose extraction;
- ranking and signing;
- the live store (SHA-256 `5dd1e763…5b07`, unchanged and opened read-only);
- D12–D14;
- Step 4.

**Consulted:**
- the skill, §0–§2a;
- `references/evaluation-and-reporting.md`;
- `docs/plans/experience-pilot-step1d-a2.md`, `experience-pilot-step1d-b.md` and `continuous-learning-step3-versioned-reading.md`;
- the code of `phase245_*`, `document_semantics.ts`, `phase265_test_measurements.ts`, `phase225_transient_test_probe.ts` and
  `experience_attribution_scoring.ts`.

## 1. Outcome

| Question | Answer |
|---|---|
| Is the inventory auditable? | Yes. 75 DOM tables, 1,831 cells and 1,800 value elements on 69 pages; every element has a state and **all** of its independent blockers (`src/table_ledger1e.ts`). No element disappears silently: 435 of 435 annotated cells are in the ledger. |
| Is the default reader unchanged? | Yes. The ledger without lessons equals `structuredTableLeads1D2` on 69 of 69 pages. The `check` against `base0` is identical (0 differences); no-plan output is 54 of 54 identical; the Step 1A/1B replays are identical; the full suite passes (§8). |
| Is failure localisation reproducible? | Yes. 67 adjudicated items, each with its stage, earliest blocker and every blocker (`adjudication-cmp1.json`). |
| Are the disagreements adjudicable? | Yes. Confirmed failures, justified abstentions, scorer artefacts and page-level method disagreements are kept apart (§6). |
| Is there a reusable lesson whose effect is measured? | Yes, with a limit. **TL2 header units** gains 22 values on 2 publishers with different table structures, with 0 new wrong; **TL6 cell identity** gains 2 and removes 2 wrong values, one of them outside its provenance. Both are promoted **for the shadow reader only**. No lesson is shown to transfer to an unseen publisher. |
| Is anything promoted to trusted evidence? | No. Table leads keep `methodCue: structured_table_measurement_term`, which the persistence screen refuses. |
| Rejected lessons | TL7 v1 (−75 correct values) and TL7 v2 (−12 correct CADR values that the publisher measured itself), both kept with their evidence. |

**Development effect, all spent gold sets (382 values, 31 documents):**

| Arm | Correct | Wrong product or false identity | New wrong vs C | Lost vs C | Negative controls read | Table leads, 63-page corpus |
|---|---|---|---|---|---|---|
| C: frozen Step 1D-A2 semantic tables | 200 | 14 | — | — | 40 | 51 |
| P: promoted lessons (TL2, TL5, TL6), the default `candidate_1e_tables` | 220 | 14 | 1, a scorer artefact (§7.3) | 0 | 40 | 97 |
| E: all shadow lessons (TL1–TL7) | 223 | 13 | 0 | 0 | 37 | 101 |

## 2. What Phase245 and `document_semantics` already do (Stage A)

The structural audit is `scripts/tables-1e-audit.mjs inventory` (`evaluation/tables-1e/inventory-audit1.json`).

**Coverage**
- Of the 75 DOM tables, 2 are nested and never read. The other 73 are read.
- 326 of the 1,831 cells have no reader block. All 326 are header cells.
- 6 RTINGS pages are client-rendered: their tables are not in the retained HTML (acquisition).

**Phase245 grid** (`buildTableGrid245` / `interpretTableGrid245`)
- Modes:
  - key_value: 38;
  - unsupported: 26;
  - products in rows: 6;
  - products in columns: 5.
- The `headers`/`scope` attributes are captured but unused.
- A placeholder corner cell flips the orientation (F-T8, §6). This is the production specification path; none of the affected
  facts is in the live store.

**`readDocumentSemantics1D2`**
- It skips tables that are nested, have no grid, or come after the 40th.
- Context comes from the heading, caption, headers and the last `<p>` before the table, if that paragraph contains "we" or
  "I": test 13, specification 22, unknown 38.
- `structuredTableLeads1D2` then applies these gates:
  - hard exclusion;
  - specification context;
  - header cell;
  - first-column label;
  - line length;
  - unknown context without a test label;
  - declaration cue;
  - certification body;
  - price;
  - plan unit;
  - dimension term;
  - range;
  - duplicate;
  - output cap.

**The prose reader**
- Phase225, plan-guided Phase272, merged by `testLeadsFromHtml265`.
- It also reads table-cell blocks as prose. Before this work, that was the source of 20 of the 89 sampled table measurements,
  including all 11 false ones.

## 3. Loss points: the decision ledger

`tableLedger1E(sem, plan, …)` evaluates every gate on every value element independently (no short circuit). It records the
gate, rule id and stage of each blocker, ordered acquisition < structure < context < evidence < element < output.

**Census on 69 pages** (`inventory-audit1.json`)
- 1,800 value elements, 1,358 of them outside label cells.
- 65 elements become leads; 1,293 are rejected.
- 984 of the rejected elements have **more than one** independent blocker. Fixing a single gate would not have released them.

**Most frequent blockers**
- R08, unknown context with no test label: 1,138.
- R12, no plan unit: 879.
- R03, specification table: 488.

**Notes the ledger raises without changing any outcome**
- 4 unknown-context tables with a first-person method statement in their section.
- 8 tables with units in their headers.
- 5 setting axes.
- 384 compound cells.
- 29 cells holding a value and a currency.

## 4. Equivalence

| Check | Result |
|---|---|
| Ledger without lessons vs `structuredTableLeads1D2` | 69 of 69 pages identical (`inventory-audit1.json`; test "no regression") |
| Default policies vs the frozen baseline `base0` | `check1`, `check2` and `check3` identical, 0 differences |
| No plan | 54 of 54 identical |
| Step 3 reading identity without lessons | unchanged (test "reproducibility and versioning") |

## 5. The ledger contract

Each element (`Element1E`) records:
- its kind: number, range, bound, currency, dash, or text;
- its value and unit;
- its state: `table_lead`, `rejected`, `dash_unexplained` or `label`;
- **all** blockers, as `{rule, stage, gate, detail}`;
- the lessons applied to it.

Each cell (`CellLedger1E`) records its position, header flag, row and column labels and reader block. Each table records its
notes. `publicLedger1E` is the value-free public form. Reason codes R01–R17 and P0 are in `RULES1E`, and the stage of each in
`STAGE_OF1E`.

A dash is never a value and never zero. A price element is never a measurement.

## 6. Comparison and adjudication (Stage C)

**The sample** (`sample.json`) was frozen before any annotation or comparison:
- 18 tables S01–S18 from 8 publishers;
- strata: matrices, specification sheets, rating tables, setting rows, compound cells, placeholder corner cells, and layout or
  control tables.

**The annotation** was made blind by a separate Claude agent from source packets. It was sealed (`annotation-freeze.json`,
SHA `d26d742d…`) before the mechanical comparison:
- 435 cells;
- 272 elements, 89 of them measured.

**Frozen arm C** (`compare-cmp1.json`), on the 89 measured elements:
- 33 correct;
- 2 wrong product (a scorer artefact);
- 9 unresolved;
- 45 not read;
- 11 false measurements;
- 0 of 48 reads that need a condition carry one;
- axes agree on 8 of 18 tables for rows and 4 of 18 for columns; context agrees on 15 of 18.

**The 67 adjudicated items** (`adjudication-cmp1.json`):

| Class | Items | Mechanisms |
|---|---|---|
| Confirmed failure | 20 | F-T1 method statement outside the last paragraph (8); F-T2 bare, thousands-separator or header units (6); F-T3 dimension word only in the heading (4); F-T4 a price drops the whole cell (part of 10); F-T6 cells with equal text collapse (1) |
| Confirmed false measurement | 11 | F-T7: the prose reader reads table cells. 9 are AHAM-sourced CADR values in S12; 2 come from the S16 specification table |
| Plan vocabulary, not a table problem | 16 | TV %, Delta-E |
| Disagreement on a page-level method | 6 | S15: the method statement sits inside a specification-table cell |
| Justified abstention | 6 + 4 | 4 combine context and identity |
| Out of scope, no plan | 2 | — |
| Scorer artefact | 2 | the frozen Step 1C scorer treats "smart" and "air" as generic words |

**Outside the attribution items:**
- F-T5: conditions not carried (39 elements).
- F-T8: Phase245 placeholder corner cell (S03, S13).

## 7. Lessons (Stage D): `src/table_lessons1e.ts`

**What a lesson records**
- id and version;
- state;
- `appliedIn`;
- rule;
- applicability;
- counterexamples, each with a test;
- provenance: the adjudication file and the frozen rule it relaxes;
- tests;
- measured evidence.

Lessons never name publishers, templates or products.

**Where they apply**
- Only `promoted` lessons apply by default, and only in the shadow policy `candidate_1e_tables`.
- The active set's digest (ids and versions) is part of the Step 3 reading identity:
  `semanticReading = SEMANTIC_TABLES1D2_VERSION + '+lessons1e:' + digest`.
- So any lesson change gives a new reading version, and earlier readings become reconsiderable.
- Current promoted set: TL2 v1, TL5 v2, TL6 v1. Digest `83048646b9fc98ac`.

**Promotion rule.** A lesson is promoted when all of these hold:
- a measured gain on development gold or on confirmed sample failures, on **two or more publishers**;
- 0 new wrong values (after adjudication);
- an ablation that confirms the effect;
- tests of both the desired and the undesired behaviour.

Single-publisher or neutral lessons stay provisional.

| Lesson | Ver. | State | Relaxes | Development evidence |
|---|---|---|---|---|
| TL1 section method scope: an unknown-context table is read as test results when a first-person measuring statement in the same section, before the table, names a dimension its numbers carry, and the table has no specification signal | 1 | provisional | R08 | Ablation: −3 correct and +1 wrong without it. All gains are on one publisher, its provenance |
| TL2 header units: a bare number takes the single plan unit named by its own row or column labels | 1 | **promoted** | R12 | Ablation: −22 correct without it, 0 new wrong, on 2 publishers (products in rows with a brightness-window header; products in columns with a dBA header) |
| TL3 dimension from the table context (heading, caption, linked statement) | 1 | provisional | R14 | Neutral on gold; needed only in the sample (S14) |
| TL4 compound cells: a currency rejects only the currency element | 1 | provisional | R11 | Neutral on gold; tested on fixtures only |
| TL5 setting axes give the condition and are never products. v2: also attaches the condition to another reader's lead of the same cell | 2 | **promoted** | — | v1 left only 4 of 57 sample reads with a condition, because the earlier prose lead shadowed the table lead. v2 with every lesson: 12 of 57, all 12 equal to the annotation, on 2 publishers. Gold: 8 values gain their condition, 8 of 8 agree. On its own (promoted set) it acts only on test-context tables: 4 of 53 in the sample, 0 on gold. The gold gains also need TL1 |
| TL6 cell identity: equal texts in two cells are two observations | 1 | **promoted** | R16 | Ablation: −2 correct and +2 wrong without it; one gain is outside its provenance |
| TL7 table cells owned by the table: withdraw a prose-reader lead from a cell the table shows to be a declaration (specification table, certification body or declaration cue in the labels, without a test cue) | 3 | provisional | — | **v1 rejected:** dropping every table-cell prose lead lost 75 correct values (`goldeval-dev1`). **v2 rejected:** treating a rating name (CADR, energy rating) as a declaration lost 12 correct values that the publisher measured or estimated in its own test room (`goldeval-dev3`). v3: neutral on gold. In the sample it removes the 2 false measurements from the specification table (S16), but not the 9 in S12, whose declaration evidence is outside the table |
| TL8 placeholder corner cell orientation | 1 | provisional, **not applied** | — | Confirmed failure (S03, S13) in the production Phase245 path, outside this assignment; recorded as D16 |

### 7.1 Do the lessons change the shadow reading?

Yes, automatically:
- `candidate_1e_tables` loads `activeTableLessons1E()` when no list is passed.
- `testLeadsFromHtml265` with `tableLessons` uses the ledger's emission.
- TL7 and TL5 act on the merge.
- Every withdrawal (`shadowDiagnostics.tl7DroppedBlockReaderLeads`) and every attached condition
  (`shadowDiagnostics.tl5ConditionsAttached`) is recorded, with block, offset and reason.
- Without lessons, the output and the identity are byte-identical to before.

### 7.2 Formal properties (`tests/table_lessons1e.test.ts`, `tests/table_ledger1e.test.ts`; fictional fixtures, tier T1)

| Property | Test |
|---|---|
| Coverage and conservation | every cell and element is in the ledger, and every rejection has its blockers. On real pages: 435 of 435 annotated cells |
| Equivariance | swapping product columns, or transposing with `th scope`, gives the same observations |
| Name change changes attribution | renaming a column header moves its values |
| Non-vacuity | with the lessons, the per-speed table is read with product and condition; without them, nothing is read |
| Evidence sensitivity | no read without the method statement, with a statement about another quantity, with a statement in another section, or from a specification table in the same section |
| Identity safety | a setting label never becomes a product, even with a judge that accepts any text |
| Scientific fidelity | a cost is never a measurement; an explicit zero is a value |
| Partiality | a dash is neither a value nor zero |
| Reproducibility and versioning | same input gives the same output; the lesson set is part of the identity; no lessons gives the Step 1D-A2 identity |
| No regression | without lessons, the ledger equals the frozen reader |
| TL5 v2 | every lead of a setting cell carries its setting, attachments are recorded, and the default is untouched |

Equivariance on real pages is not tested: no real table was permuted.

### 7.3 Development evaluation

`scripts/tables-1e-goldeval.mjs` runs on every value-level gold set: Step 1C; Phase272 untouched and development; Step 1D-B.

**Gold results per arm** (dev7, final code)
- C → E: correct 200 → 223. Gained 23, lost 0, new wrong 0, wrong removed 1.
- C → P: gained 20, lost 0, wrong removed 1, new wrong 1.

**The one new wrong value in P is a scorer artefact.** Two cells of one table hold the same text, one for each product:
- The prose reader collapses equal blocks and reads only the first cell. TL2 now resolves that cell to its own column product,
  correctly.
- The scorer matches gold by value and subject, so it counts that lead against the other product's equal value.
- No lead attributes a value to the wrong product. With TL1 the table reader also reads the second cell, and the artefact
  disappears.

**By host** (C → E, correct values)

| Host | C | E |
|---|---|---|
| AirPurifierFirst | 17 | 35 |
| Tom's Guide | 23 | 27 |
| HouseFresh | 124 | 125 |
| TechRadar, TrustedReviews, Ideal Home | unchanged | unchanged |
| RTINGS | no gold values (client-rendered pages) | no gold values |

**Leave-one-publisher-out** (`outsideProvenance`)
- Outside its provenance publishers, every lesson's ablation loses 0 values, except TL6 (1).
- So the gains are on the publishers the lessons came from. Transfer is shown only by TL6, once.

**Other measures**
- Negative controls read (gold): 40 (C), 40 (P), 37 (E).
- Conditions on gold (`conditions-dev7.json`; 189 gold values that state a condition; same value and exact subject):
  - C: 0 leads with a condition;
  - E: 8, 8 of them agreeing;
  - E−TL5: 0;
  - P: 0.
- Sample (`compare-cmp*.json`), on 89 measured elements:

| Run | Correct | Unresolved | Not read | False measurements | Reads with condition / needing one |
|---|---|---|---|---|---|
| cmp1, C | 33 | 9 | 45 | 11 | 0 / 48 |
| cmp7, P | 48 | 1 | 38 | 11 | 4 / 53 |
| cmp6, E | 52 | 1 | 34 | 9 | 12 / 57 (12 of 12 correct) |

- Superseded tuned runs, kept unchanged:
  - cmp2 (TL7 v1): 48 correct, 0 false;
  - cmp3 (TL7 v2): 52 correct, 0 false, but it lost the 12 gold values;
  - cmp4 (TL7 v3, TL5 v1).
- The goldeval runs dev1–dev6 hold the intermediate states.

## 8. Regressions, time and memory

| Check | Result |
|---|---|
| Full suite (`npm test`) | 4,612 tests pass across 21 shards (lesson tests 10 of 10) |
| `check3` vs `base0` (every default policy, 69 pages) | identical |
| Step 1A / 1B replays, default build | identical to Step 1D-B (`replay-s1{a,b}-default-1e`) |
| Replays with `candidate_1c_semantics_tables` | identical (`-semantics-1e`) |
| Replays with `candidate_1e_tables` | same as the semantic policy; 0 lost successes (`-tables-1e`, `-tables-1e2`) |
| Live store | SHA unchanged; not written |
| Time and memory | ledger inventory on 69 pages: 4.9 s, 238 MB peak RSS. Gold evaluation (31 documents × 10 arms + 63-page corpus × 2 arms): 83 s, 340 MB peak RSS |

## 9. Limits

- Every number here comes from spent pages. The sample informed the lessons, and the goldeval sets were seen repeatedly. These
  are tuned development figures, never held-out ones.
- The annotator is a Claude agent.
- Gains are concentrated on two publishers (AirPurifierFirst and Tom's Guide). Transfer to an unseen publisher is untested.
- The gold sets score values and subjects, not conditions. Conditions were measured separately and loosely: a containment match
  on 189 values.
- Equivariance and transposition were tested on fixtures only.
- 9 sampled AHAM-sourced CADR values are still read as measurements by the shared plan-guided reader, because the evidence that
  they are declarations is outside the table (D17, extending D15).
- Condition carrying is still weak: 12 of 57 sampled reads even with every lesson.
- The 6 client-rendered pages and 2 nested tables stay unread.
- F-T8 is not fixed (D16).
- No experience cases (EX-T*) were added. Lesson provenance points to the adjudication items instead.

## 10. Integration blockers (before any operational use, Step 4)

1. A held-out evaluation of the promoted lessons on unseen publishers. It needs owner-authorised pages; not requested here.
2. D15 and D17: a document-level declaration screen, and condition capture beyond setting axes, before any table or
   plan-guided reading can be persisted.
3. D16: the Phase245 placeholder corner cell (TL8) in the production path, for its owner.
4. The scorer cannot tell cells apart (the §7.3 artefact). A cell-position-aware scorer is needed before table attribution can
   be scored precisely.
5. Lessons stay shadow-only until Step 4. Persistence, ranking and signing are untouched.

## 11. Files

**Code**
- `src/table_ledger1e.ts`
- `src/table_lessons1e.ts`
- the `src/phase265_test_measurements.ts` hook (shadow only)
- `src/document_semantics.ts`: exports `TABLE_GATES1D2`; no behaviour change

**Scripts**
- `scripts/tables-1e-audit.mjs`
- `scripts/tables-1e-compare.mjs`
- `scripts/tables-1e-goldeval.mjs`
- `scripts/tables-1e-conditions.mjs`
- `scripts/experience-observe.mjs`: the `candidate_1e_tables` policy

**Tests**
- `tests/table_ledger1e.test.ts`
- `tests/table_lessons1e.test.ts`

**Public, value-free results:** `evaluation/tables-1e/`.

**Private results:** `pee-knowledge/private-eval/tables-1e/`. This holds the annotations, the full comparisons and the goldeval
documents.

**New open debts:** D16 and D17 in `docs/architecture/vertical-contract.json`.
