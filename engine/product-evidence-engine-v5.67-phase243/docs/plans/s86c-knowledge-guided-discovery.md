# S86c — Knowledge-guided evidence discovery and precision recovery (owner decision, 2026-10-19)

**Owner brief, verbatim:** `.claude/skills/pee-guided-learning/references/owner-s86c-knowledge-guided-discovery-2026-10-19.md`.

**What did not change:**
- R3 stays open.
- No acquisition was run.
- No ranking authorisation changed.
- No schema change.
- The production reading (no plan) is unchanged: the same leads on the 12 pages, the same 132 extraction probes, and the same 206 request answers.
- S87 not started.

**Full suite:** 4,850 tests pass.

**Evidence labels.**
- **[I]** implementation.
- **[R]** development or regression material: the 12 spent S80 pages, measured against the blind S86b reference.
- **[T]** same-author tests.

Every figure for configuration D after its first run is **tuned on these pages**. Nothing is independently validated (§6).

## 1. The measurement, verified before changing the reader

### 1.1 Count reconciliation

The freeze record says 123 measured and 175 declared; the S86b report said 125 and 170. **The freeze record is right.** Scorer v1 had two counting defects:

- It keyed results on role + line + value. So a repeat printed with a rounded value counted as a new result: "35" for 35.2, "56" for 56.7, "53" for 53.6. That gave +3 measured and +3 declared.
- Two mentions of the same value on one line were merged into one. That gave −1 measured, −7 declared and −4 conditions.

One declared value is non-numeric (the energy class "C").

### 1.2 Scorer v2

`scripts/s86c-page-score.mjs`. v1 and its results stay unchanged.

**Counting and matching:**
- The unit is the annotators' **first mention**. A repeat maps to its first mention.
- Matching is **one-to-one** between candidates and mentions.
- A candidate is *anchored* when the annotated surface occurs around the candidate's own value offset. Otherwise it may match by line similarity (≥ 0.5) and is flagged.
- Candidates matching no mention are listed for manual review, never credited.
- Further readings of one result count as **duplicate rows**.

**Manual audit of the pairings:**
- All 105 pairings of the S86b plan reading (C) and all 7 of A and B were read: **0 wrong pairings**.
- One similarity-only pairing is a correct "Test Data" table row.
- All 23 "unmatched" stored values of C are explained. They are repeats of results already counted (summary, body, table). One is not: a number taken from a model code ("MAFD661B0G" → "0 g").

### 1.3 Candidate, admitted and actually persisted are now separate

`scripts/s86c-page-recovery.mjs` ingests each reading into a throwaway copy of the live store, under the operational Phase249 class policy, and reads the rows back.

**Correction to S86b.** Its "stored, attributed correctly" column was the screen plus the subject association, not storage. Under the default store policy nothing at all is kept from these pages (metadata only). With the operational policy, what is admitted is persisted.

## 2. What was built [I]: one set of controls in the existing guided reader

**Where it lives.**
- The controls are in `phase225_transient_test_probe.ts`, inside the Phase272 plan-guided pass. The option is `precision86c`, plan only.
- They are part of the **reading identity**, so rows never collide with uncontrolled plan rows (Step 3).
- In controlled mode, the legacy prose and table records go through the same role and subject checks: one mechanism for every reading.
- There is no new module, store, schema or vocabulary list. `DECLARED_BODY272` (AHAM, ANSI, ISO, IEC, ENERGY STAR …) moved from `document_semantics.ts` into the shared plan vocabulary, so the two readers share one definition.

**The five controls:**

| Control | What it decides |
|---|---|
| **role** (`observationRole86c`) | The evidential role of each value in its own clause, in this order: certified or quoted (a certification body); declared (the shared `declaredInClause225`, "lab-reported", "stated", specs); programme preset (default, pre-set); unresolved (approximate value, or a generic statement such as "usually take 25 minutes"); derived ("works out", "based on", room sizes); test condition (a temperature with no measuring verb; a duration, load or size introduced by a setting verb or preposition nearer than any measuring verb); otherwise measured. A label before a colon stays with its value; a clause opened by "and" continues the previous one. Values set aside are kept as `classifiedObservations86c` (role and reason, no text), never discarded silently. |
| **subject** (`otherProductInClause86c`) | The name **nearest** the value decides: in its clause, owning the parenthesis the value sits in, or in a table row label. Other products, other versions ("v1", "previous model") and results "achieved by" another product withhold the page product. The value stays as an unresolved result, never on the wrong product. Two exact identity rules: a generic measurement token ("PM1") is not a model code, and a mention whose words are all words of the page product's name is the page product. No similarity matching. |
| **repeats** | One result read several times (same subject, value, unit, conditions) is offered once. This also stops repeats from filling the reader's 40-record bound. |
| **boundary** | A number glued to letters (a model code "B0G", "PM2.5") is not a quantity. |
| **structure** | A bare value (a table cell, or a label-value box entry) is read with its row label, including the `th` cells the block list leaves out, and its section heading. In a specifications section it is a declaration. Outside a test section or test label it is not a result. Inside one, it is a result even without a taught term ("Test Data", "Noise levels test results"). |

## 3. Results on the 12 spent S80 pages, against the blind reference [R]

Scorer v2. 123 measured results are present. "Correct" means stored with correct attribution: on the reviewed product, or left unresolved when it belongs to another product.

| Configuration | Found | Stored on reviewed product, correct | Other product's result stored unresolved (correct) | Other product's result on reviewed product | Non-results stored as results | Duplicate rows |
|---|---|---|---|---|---|---|
| A — pre-S86 (`c9648e7`) | 6 | 6 | 0 | 0 | 1 | 0 |
| B — S86 operational (`884b6fc`; same on the current build) | 6 | 6 | 0 | 0 | 1 | 0 |
| C — S86b plan reading (`e06b482`) | 66 | 43 | 6 | **10** | **40** | **23** |
| D — first run (kept unchanged) | 64 | 42 | – | 4 | 10 | 7 |
| **D — S86c final (tuned)** | **77** | **53** | **23** | **0** | **1** | 6 |

The S86b report counted C's non-results as 41. Scorer v2 counts the same set as 40 (1 is the "0 g" from a model code).

**Ablations (each control off, final build):**

| Control off | Change against final D |
|---|---|
| role | non-results stored 1 → **22** |
| subject | other products' results on the reviewed product 0 → **13** |
| repeats | duplicate rows 6 → **22**; found 77 → 70 (the bound fills with repeats) |
| boundary | non-results 1 → 4 |
| structure | found 77 → 68; misattributed 0 → 8; non-results 1 → 5 |

**Four sets** (`evaluation/s86c/four-sets-final.json`), per measured result stored correctly:
- **A vs D:** only old **0**, only new 70, both 6, neither 47. No legacy capability is lost.
  - The four-set check caught one loss during development: a legacy result whose sentence holds "200°C", whose unit capital was read as a product name. It was fixed with a test.
- **C vs D:** only C 1 ("alert sounded with 10 minutes left to run", now read as a condition; the annotators say a measured observation), only D 28, both 48.

**Role of the 64 values D set aside that match the reference:**
- **58 are not results**, rightly kept out. 40 of them carry a role compatible with the reference: a programme preset counts as the manufacturer's setting, a certified figure as quoted.
- **6 are results withheld:**
  - 2 derived room sizes (`derived`, by design);
  - 2 read as conditions;
  - 1 approximate;
  - 1 on a declaration cue.

**Remaining failures:**

| Kind | Count | Example or cause |
|---|---|---|
| Non-result stored | 1 | "10 minutes felt too long" (a repeat of a preset) |
| Reviewed result left unresolved | 1 | |
| Duplicate rows | 6 | The same result read with different conditions or subjects |

**Results still missed (46):**

| Cause | Count |
|---|---|
| Other products' results not reached | 19 (16 on the long comparison page, where the guided reader's 40-record bound is reached; two different products with the same value in one block are merged) |
| Written in words ("four minutes", "two-thirds") | 8 |
| Approximate or bounded ("around 250 kWh", "below 1 kWh", "46-47 dB") | 9 |
| Derived | 2 |
| Hyphenated units ("20-minutes", "4-hour") | 2 |
| Setting vs observation ambiguous | 2 |
| Other prose | 4 |

**Number words, approximate values and the record bound were not changed.** Recall expansion without a precision rule was out of scope. These are the next candidates.

## 4. First outcomes, kept unchanged

- **Scorer v1 and S86b results:** unchanged. v2 is a separate version.
- **First run of the v2 runner:** every reading persisted 0. The store was opened without the operational policy. Rerun with the policy; the first files were replaced only after this was understood, and the defect is recorded here.
- **D first run:** recorded unchanged in the table above. After it there were 9 fix rounds on these pages: the role refinements; the structure control; mention identity; repeats inside the bound; name detection (digits, single names, labels, unit capitals); variants; legacy-record consolidation. Each is a general rule. None names a page or product. All are tuned on spent material.
- **First S86c test run:** 2 of 3 failed.
  - A derivation cue in an earlier clause ("Based on its CADR, …") was not seen.
  - The legacy pass kept another version's result ("the AP500 v1 … 58 dBA") on the page product.

  Both were fixed in the mechanism, not the test.

## 5. Net change [I]

- **`src`:** +139 / −14 lines in 4 files: `phase225` (the controls), `phase265` (option and reading identity), `phase272` (`DECLARED_BODY272`), `document_semantics` (uses it).
- **Added:**
  - `tests/s86c_guided_precision.test.ts` (3 tests): role cases; subject cases including another version and unit capitals; and a fictional page read with and without the controls, through the reading identity and real ingestion.
  - Scripts `s86c-page-recovery.mjs` and `s86c-page-score.mjs`.
- **Nothing retired.** The uncontrolled plan reading stays available as configuration C for comparison. Removing it needs the capability check above on new pages first.

## 6. Not shown, and the independent evaluation needed

**What is not shown.**
- **Independent generalisation.** The 12 pages are spent, and all D figures after the first run are tuned. No unseen authorised page bytes exist. The only retained page bytes are the 12 S80 pages.
- **Operational admission.** Not done. The live wave reads without a plan, and D stays shadow.

**Proposed independent evaluation** (needs an owner acquisition policy; not requested here):
1. **Pages.** 15–20 test-publisher review pages:
   - from at least 4 hosts, at least 2 of them not among the S80 hosts;
   - in the taught categories;
   - fetched under the S85 wave gate.
2. **Reference.** The same blind annotation protocol, by annotators who see only the page text, **sealed before any reading**. Code frozen at a commit.
3. **Runs.** Configurations B, C and D, run once. The first run is reported unchanged.
4. **Pre-registered criteria for D:**
   - correct stored results at least 5 times B's;
   - other products' results on the reviewed product at most 2 % of stored results;
   - non-results at most 5 % of stored results;
   - only-old = 0 against B.

## 7. Recommended next step (owner decision)

1. **The independent evaluation above** decides whether D's precision holds on pages it was not tuned on. If it does, the next decision is admission: D replaces the production reading for taught categories, behind the same controls.
2. **S87.** The classified observations (`classifiedObservations86c`, role and reason, no text) are what S87's intake would receive from extraction:
   - unresolved approximate values;
   - unknown headings;
   - other products' results awaiting identity.
