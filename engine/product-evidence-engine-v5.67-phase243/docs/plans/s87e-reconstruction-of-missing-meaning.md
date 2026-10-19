# S87e — Reconstructing the meaning the store loses: what transfers to unseen publishers and what does not

**Owner review of S87d (verbatim).** It is preserved in `.claude/skills/pee-guided-learning/references/owner-review-s87d-2026-10-19.md`.
- "Vorrei che Claude utilizzasse il contratto v0.2 per ricostruire realmente le informazioni sconosciute, attingendo al
  contesto originale e alla conoscenza scientifica disponibile."
- "Le prestazioni andrebbero misurate separatamente per dichiarazioni, test quantitativi, valutazioni qualitative e
  confronti tra prodotti."
- The review authorises experimental, reversible work, but not the migration.

**Scope.** Shadow only:
- no store write (the store is opened read-only);
- no operational change;
- no category-specific rules;
- no network request.

**Tier.** Authentic controlled (T2). The material is retained pages and spent gold. The references are blind
Claude-agent annotations, not independent human experts. Nothing is superseded.

## 0. Outcome first

1. **The four contract defects found in review are fixed** (contract v0.3; §1).
2. **Knowledge-based reconstruction transfers to unseen publishers.**
   - The method was developed on 16 hosts, frozen, then run once on **61 unseen hosts** (298 declarations).
   - **Quantity kind:** recovered for 173 of 209, with **2 wrong**.
   - **Categorical scale:** 65 of 68 correct.
   - Both rely on the shared quantity knowledge (units, kinds, scales), not on phrases.
3. **Phrase heuristics do not transfer. This is the main negative finding:**

   | Slot | Development | Unseen hosts |
   |---|---|---|
   | Object of interest | 9 right, 1 wrong | **18 right, 30 wrong** |
   | Conditions found | 8 of 14 | **3 of 24** |
   | Basis | 3 of 3 | **1 of 5** |

   The "object of interest" rule would *introduce* 30 errors; it is **rejected**.
4. **Quantitative tests: the header bridge recovers meaning, but the method does not transfer cleanly.**
   - On development pages, the header bridge recovers the basis for 6 of 6 values that sit alone in table cells:
     "0.9 kWh" takes "Energy consumption eco clean" from its row header.
   - On the unseen pages, the kind is right for 36 of 69, wrong for 11, and abstained for 22 (sound levels in dB,
     which the knowledge treats as ambiguous).
   - The role reconstruction **adds nothing** over "everything is a measured result": it does not recognise values
     from specification boxes.
5. **Qualitative judgements and comparisons could not be tested from documents:**
   - qualitative: 24 stored rows on 4 retained pages, with no matching reference;
   - comparisons: no retained page bytes.

   They are represented, but not reconstructed (§5).

## 1. Contract v0.3 (corrections to v0.2's code)

| Review finding | Correction | Evidence |
|---|---|---|
| **A.** "100% conformance" hid unusable records | `checkStructure` (can it be stored) and `assessCompleteness` (per purpose: interpret, describe, compare, decide) are separate | Live store: 12 of 12 test rows valid, **0 of 12 interpretable**. 79 of 87 comparative rows comparable with stated inferences. No record is complete for decisions: no table holds uncertainty |
| **B.** Declared attributes treated as neutral judgements | A **categorical** result form (nominal, ordinal, boolean) separate from **judgement** (with polarity) | "Material: stainless steel" is categorical nominal; "Remote control: Yes" is categorical boolean |
| **C.** Attributions stronger than evidence | Unverified page associations are *inferred*. A test cue is "reported test, method unspecified"; instrumented measurement needs a stated meter or instrument. Every result has a **derivation**: observed, calculated (with inputs) or assumed | Tariff costs are *calculated* (energy × tariff). "Appliance class only" rows have no product identity (v0.2 had counted them as identified) |
| **D.** Comparisons reduced to single values | A **comparison** form (experiment, task, relation, members, reasons), plus a constructor for stated comparative judgements | 87 comparative rows become 14 comparison sets with their members |

**Also corrected (found while measuring).** Price, unitless number, range, dimensions and options declarations had been
mapped as categorical. They are now quantities: about 429 rows.

## 2. Material and protocol (pre-registered: `evaluation/s87e/preregistration.json`)

| Type | Stored rows | Original context available | Reference |
|---|---|---|---|
| Declarations | 2,385 | all 2,385 (121 retained pages, 77 hosts), recovered by locator, including table cells with row and column headers | blind annotation of 373 (≤4 quantity + 2 other per host), hash-sealed before scoring |
| Quantitative tests | 96 (S80 copy) | 84 rows on 10 retained pages | S86b blind page annotations (sealed earlier) |
| Qualitative judgements | 33 (S80 copy) | 24 rows on 4 pages | none matching: not scored |
| Comparisons | 87 | none (pages not retained) | none: structural only |

**Splits.**
- Declarations: development = 16 hosts (75 items), fixed by sha256 order before any annotation was seen; check = 61
  hosts (298 items).
- Tests: development = trustedreviews.com pages (15 rows); check = housefresh.com and expertreviews.co.uk (69 rows).

**Techniques (from the S87c study).**
- **A:** the value and its own label, typed with the quantity knowledge.
- **B:** A plus document roles: row and column headers, table header row, caption.
- **C:** B with each slot decided by the agreement of independent signals; disagreement abstains (majority vote with
  abstention).

C was chosen on development, frozen (`freeze.json`, `freeze-tests.json`) and run once on the check groups. The first
runs are committed unchanged.

## 3. Declarations: results (`dev-it1.json`, `check-firstrun.json`)

| Slot | A (check) | B (check) | **C (check)** | C (development) |
|---|---|---|---|---|
| Form (quantity vs categorical) | 277/287 | 277/287 | 277/287 | 68/73 |
| Quantity kind: correct / produced / wrong | 181 / 186 / 5 | 181 / 186 / 5 | **173 / 175 / 2** | 53 / 53 / 0 |
| Categorical scale | 65/68 | 65/68 | **65/68** | 13/13 |
| Conditions: correct of produced; annotated found | 3 of 5; 3/24 | 6 of 10; 3/24 | 6 of 10; **3/24** | 10 of 12; 8/14 |
| Object of interest: right / wrong | 18 / 30 | 18 / 30 | **18 / 30** | 9 / 1 |
| Basis: correct / annotated (false positives) | 1/5 (1) | 1/5 (1) | 1/5 (1) | 3/3 (0) |
| Named procedure: false positives | 0 | 0 | 0 | 0 |

**Not a property.** 11 items in the check sample are identifiers, stock text or links that were stored as declarations.
The adapters cannot flag them; that is a storage error upstream.

**Reading.**
- **C trades 8 recovered kinds for 3 fewer errors.** It abstains when the unit and the label's kind words disagree.
  This is the precision–coverage choice the literature recommends.
- **The two knowledge-based slots generalise:**
  - kind: precision 99% on unseen hosts;
  - scale: 96%.

  Both rest on data in the QK pack (units, kinds, the EU energy-class scale), not on code.
- **The slots built from English phrase cues were tuned on 75 items and failed on 298:**
  - object of interest: "words before a property term";
  - conditions: modifiers in the label;
  - basis: "per…" and run cues.

  This repeats the pattern S87b found for conditions: structure transfers, phrase lists do not.

## 4. Quantitative tests: results (`test-dev-it1.json`, `test-check-firstrun.json`)

| Slot | Development (15) | Check (69) | Note |
|---|---|---|---|
| Quantity kind: correct / produced / wrong | 14 / 14 / 0 | 36 / 47 / 11 | 4 of the 11 are naming only (reference "volumetric_flow_rate" vs "flow_rate"); 5 are lengths read as durations (the unit "m": metres or minutes); 22 dB values abstained (the knowledge says dB alone may be sound pressure, sound power or a signal-to-noise ratio) |
| Basis | 6 of 6 recovered (+1 false) | not scorable | The S86b reference encodes a basis only for per-cycle energy; the check pages hold none. 8 "per run" durations (clean-down times) are plausible but unverified; 3 follow a wrong kind |
| Role | 13/15 | 63/69 | **Equal to the baseline "everything is a measured result".** The 6 declared or quoted values (spec boxes) were not recognised. The S86c role control reused here was developed on these HouseFresh pages, so even this result is not independent |
| Property (word overlap with the reference description, a weak proxy) | 12/15 | 41/59 | — |

**Header bridge (development iteration 1).** A value alone in a table cell takes its words from the row and column
headers. That turned basis recovery on development pages from 1/6 into 6/6. This is the document-level principle the
sources describe: TAT-QA finds that scale and meaning often sit only in headers.

## 5. Qualitative judgements and comparisons

- **Qualitative.** The contract represents all 310 reference judgements (S87d). Reconstruction from documents was not
  scored: the 24 stored rows with retained pages have no matching reference, and annotating them would be a new
  reference set.
- **Comparisons.**
  - The 87 values are represented as 14 comparison sets with members (structural).
  - No page bytes are retained, so the relations cannot be reconstructed from the documents offline.
  - Stated comparative judgements ("A better than B, because…") have a contract constructor, but no reader produces
    them yet.

## 6. What this shows about generalisation

| Mechanism | Transfers? | Why |
|---|---|---|
| Unit → kind via the shared knowledge pack | **Yes** (99% precision) | The knowledge is data that does not depend on the category |
| Scale knowledge (EU energy class) | **Yes** | Same reason |
| Document role filling (headers carry meaning) | **Yes on development, not tested on check** (the check pages had no table-cell values with a basis) | A structural principle |
| Phrase rules for object, conditions, basis | **No** | Words tuned on 16 hosts do not cover 61 others |
| Role from sentence cues (S86c) | **No gain** | It does not see document structure (spec boxes) |

**Conclusion.** Reliable reconstruction comes from **knowledge held as data** and from **document structure**. It does
not come from more phrase rules. The next step should move condition, object and basis knowledge into data, as the
S87c study recommends: declarative property models with their condition dimensions, and a lexicon with its lifecycle.
That step should also use structure (spec box vs test section; table headers) for roles, and measure each step on
unseen hosts. Words learned from the store's own declarations (2,385 labels across 77 hosts) are candidate material,
promoted only through the knowledge lifecycle.

## 7. Limits

- Blind references are Claude agents. Property scoring is a word-overlap proxy.
- The S80 pages were spent by S86c.
- The test check set is 69 rows from 3 hosts, two of them dominated by one publisher (HouseFresh, 68).
- The declarations sample is ≤6 items per host: the worst-host figures rest on few items.
- `src/observation_reconstruction.ts` gained the test-value function after the declarations check run. The declarations
  code is unchanged (diff from 301a6ec shows additions only).
- Nothing is stored and nothing operational reads these modules. Full suite: 4,869 passed.
