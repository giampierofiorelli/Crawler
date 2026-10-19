# S86b — Capability preservation of S85/S86 and extraction recovery on real pages (owner decision, 2026-10-19)

**Owner brief, verbatim:** `.claude/skills/pee-guided-learning/references/owner-s87-capability-preservation-2026-10-19.md`.
The owner proposed S87 (intervention C), then put two checks first:
1. a capability-preservation verification of S85 and S86 (old–new–combined, four sets);
2. a comparison of extraction recovery on the same pages: old extractors, S86, and knowledge-guided extraction.

S87 was **not started**.

**What did not change:**
- R3 stays open.
- No acquisition was run.
- No ranking authorisation changed.
- No schema change.

**Full suite:** 4,847 tests pass.

**Evidence labels.**
- **[I]** implementation.
- **[R]** development or regression material: spent pages and requests, and same-author probes.
- **[B]** blind reference: annotated before any run, but on spent pages.

Nothing here is independent validation (§5).

## 1. Method: four sets per merge, from sealed probes

**Probes.** For each merged mechanism, I generated probes from **every alternative of the old reader's own vocabularies**, then added the quantities the new mechanism claims:
- units and spellings;
- bound cues;
- range forms;
- context words;
- header units and heading words;
- dimension/unit pairs and their mismatches.

**Sealing.** The expectations state the English meaning, not either build's output. They were written and committed before any run:
- `evaluation/s86b/request-probes.json` (150 probes; commit db1b0b9);
- `extraction-probes.json` (132 probes).

**Classification.** Each probe runs on the old and the new build and falls into one of four sets:
- **only old:** a capability at risk;
- **only new:** a capability added;
- **both:** a duplicate, now consolidated;
- **neither:** a shared gap.

A wrong old answer counts as wrong. Old capabilities are verified, not merely kept.

**Scripts:** `scripts/s86b-request-capabilities.mjs` and `scripts/s86b-extraction-capabilities.mjs` (`--build`, `--sets`).

## 2. Results

### 2.1 Request side (S85: Phase253's own quantity reader replaced by the shared quantity knowledge) [R]

Builds compared: pre-S85 `94f9346`, S85 `c9648e7`, S86 `884b6fc`, and after this step's fixes.

| | only old | only new | both | neither | correct of 150 |
|---|---|---|---|---|---|
| First run (pre-S85 vs S86) | **2** | 4 | 128 | 16 | 130 → 132 |
| After the fixes below | **0** | 18 | 130 | 2 | 148 |

**Lost in S85, now restored in the shared reader [I]:**
- **"5 litres+":** a `+` did not end a unit, so the quantity was not read at all.
- **"between 3 litres and 5 litres":** with the unit after both numbers, the range was read as two minimum capacities (3 and 5).

**Shared gaps in old and new, fixed at the mechanism [I]:**
- **Abbreviation dots:** the dot of "min." / "max." was taken as a sentence break, so the bound was lost.
- **Bound after the property word:** "45 cm wide or less" and "45 cm wide max" lost the bound (8 forms).
- **"shorter than":** it now names a height.
- **Comparative or -ing verb after the category name** ("a dishwasher quieter than 44 dB(A)", "a dishwasher using less than 1 kWh"): the request was answered **out of scope**. Phase248 now ends the purchase phrase there.

**Still shared gaps:**
- "kilogrammes" (a spelling missing from the shared vocabulary).
- "around 1500 W". My own expectation (a minimum) was arguably wrong. Both builds keep the value visible.

**206 spent requests:** no answer changed. **Regression tests:** in `tests/s86_extraction_quantities.test.ts`.

### 2.2 Extraction side (S86: local unit tables replaced by the shared typing) [R]

Builds compared: pre-S86 `c9648e7` and S86.

| | only old | only new | both | neither | typed correctly |
|---|---|---|---|---|---|
| First run | **0** | 17 | 97 | 18 | 0 → 94 |
| After the safety fix | 0 | 18 | 97 | 17 | 94 |

**No capability was lost.**

**Gained:**
- units outside the old lists: L/day, m³/min, kWh/annum, Pa, bar, dB(C), lux, rpm;
- table headers: dB(A), CADR m³/h, airflow, L/day, grams, lb, ml, quarts.

**Old capabilities that were not correct:**
- "dB(A)" was stored as "db" (the A-weighting was lost);
- CADR and airflow shared one class.

Both were corrected in S86.

**Shared gaps** (all at **candidate finding**, before any interpretation):
- **Table cells carrying their own unit** ("196 g" under "Weight") are never candidates. The reader only takes a unit from a parenthesised header.
- **Headings outside a closed word list** ("Battery (mAh)", "Pressure (bar)", "Brightness (nits)", "(%)") are never candidates.
- **6 of 10 first-person measured prose statements** are never candidates.
- **"12 litres a day" in prose** is captured as "12 litres". The rate becomes a volume, which is a meaning error.
- **Safety, now fixed [I]:** a "Rated power (W)" column was read as a measured result in both builds. The unsafe-header list had "rating" but not "rated". The table reader is now version v3.

### 2.3 The three configurations on the 12 retained S80 pages [B]

**The reference.** Four annotators read only line-numbered worksheets of each page's visible text (every line holding a digit), following `ANNOTATION-PROTOCOL.md`. They labelled every technical quantity with:
- evidential role;
- kind;
- subject (the reviewed product or another product).

**Sealing.** The reference was sealed by hash before any page run (`evaluation/s86b/page-reference-freeze.json`). Annotations, worksheets and runs are private.

**What the reference holds:**
- 125 measured results (first mentions);
- 170 declared values;
- 67 test conditions.

**These pages are not thin.** The S86 report called them "too thin in quantities to show recovery". That was wrong: the readers found 7 of them.

**Scripts:** `scripts/s86b-page-recovery.mjs` and `s86b-page-score.mjs`. Public counts are in `evaluation/s86b/page-score-*.json`.

**Results on the 125 measured results:**

| Configuration | Candidate | Accepted, kind correct | Stored, attributed correctly | Other products' results put on the reviewed product | Accepted values that are not results |
|---|---|---|---|---|---|
| Old extractors (`c9648e7`) | 6 | 6 (untyped) | 6 | 0 | 1 |
| S86 (`884b6fc`) | 6 | 6 | 6 | 0 | 1 |
| Knowledge-guided: Phase272 plan (screen admits its leads) | 68 | 68 | 49 | **11** | **41** |
| Plan + 1D-A2 semantic tables + 1E lessons (shadow) | 91 | 68 | 49 | 11 | 41 |

- In the shadow configuration, the 23 extra table candidates are refused by the screen by design. Their method cue is not admitted, and the reason recorded is the generic `malformed_lead`.
- **First run kept unchanged.** In my runner's first run every attribution came out unresolved, because it read a field that does not exist. The re-run (`*.r2`) uses `pageProductLead265`, as ingestion does.

**Diagnosis: where information is lost.**

1. **Recogniser.** This is the dominant loss: S86 never makes a candidate of 119 of 125 results. Interpretation and attribution are fine on what is found: 6 of 6 correct. The knowledge-compiled plan finds 62 more.
2. **Still missed with the plan (57):**
   - 24 results for other products in comparison lists and tables;
   - 12 hedged or bounded values ("around 250 kWh", "below 1 kWh", "46-47 dB");
   - 8 written in words ("four minutes", "two-thirds");
   - 5 in label–value "Test Data" tables;
   - 2 values the publisher derived (room size from its own CADR);
   - 6 other prose.
3. **What the plan's reading gets wrong.** It has no condition-versus-result rule and no declaration check on brand or AHAM CADR. Of its 41 accepted non-results:
   - 26 are temperatures or times that are **settings or programme presets**;
   - 8 are **CADR values declared by the brand or quoted from AHAM**;
   - 3 are particle-size labels;
   - 4 are other.

   Its subject assignment also puts 11 other products' results on the reviewed product. Admitted as it stands, it would store about 50 wrong values for 43 recovered.
4. **The plan path is not operational.** The live wave reads without a plan (the plan is used only in a shadow branch). So today the operational store gains the 6, not the 68.

**Answer to the owner's question.** Unifying the vocabulary improved meaning, not discovery, because discovery still runs through local recognisers:
- the Phase225 candidate pattern;
- Phase226's header-only units and heading word list.

The shared knowledge already finds eleven times more results through the plan path. What blocks it is precision: settings, declarations and other products. Coverage is not what is missing.

## 3. Permanent rule (owner instruction, recorded in the skill)

Every future merge of two mechanisms reports the four sets from probes that are:
- generated from every alternative of both mechanisms;
- sealed before the run.

Old capabilities are checked for correctness, not only presence. A merge with a non-empty "only old" set is not finished.

Rule text: `.claude/skills/pee-guided-learning/references/evaluation-and-reporting.md`.

## 4. Net change [I]

**`src`:**
- `quantity_knowledge.ts`: `+` boundary; two-unit "between" range.
- `phase253_request_constraints.ts`: bound after the property word; abbreviation dots; "shorter".
- `phase248_advisory_journey.ts`: the purchase phrase ends at a comparative or -ing verb.
- `phase226_transient_test_tables.ts`: "rated".
- Reader version string.

There is no new vocabulary list, module or table.

**Added:**
- 4 scripts;
- 1 test.

## 5. Not shown, and what is needed

- **Independent validation.** All material is spent: the 12 S80 pages, the 206 requests and the same-author probes. The page reference is blind to the readers but was made on pages already used. Generalisation needs **new, authorised pages**, annotated before reading.
  - That needs an owner acquisition policy, for example 15–20 test-publisher pages across 4–5 hosts, under the S85 wave gate.
- **User outcome.** Unchanged: no answer changed on the 206 requests. The 6 stored results reach advice only through D28 (shadow).

## 6. Recommended next step (needs the owner's go-ahead)

**Admit knowledge-guided discovery operationally, behind the three precision guards §2.3 measured:**
1. A **condition-versus-result rule.** A value the clause sets, or a programme preset, is a condition, not a result. It reuses the plan's existing `conditionTerms272` and the Phase225 setpoint reading.
2. The **observation-level declaration check** (`declaredInClause225`), applied to plan readings and spec boxes ("lab-reported", AHAM).
3. **Per-clause subject assignment** for comparison lists. A result named for another product stays unresolved, never the page product.

Each guard should be measured as precision and recall against this reference, with first runs kept. Then the same check should run on new authorised pages before claiming any improvement.

S87 (candidate intake) follows. It will then have real unresolved observations to learn from: hedged values, number words, unknown headings.
