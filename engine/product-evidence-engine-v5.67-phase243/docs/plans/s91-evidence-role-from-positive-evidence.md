# S91 — Evidence role from positive evidence; documentary context; a check rich in original measurements

**Roadmap step.** R3 / R3-C (continuation; owner review verbatim in `owner-review-s90-2026-10-20.md`). R3 is **not**
closed.

**Scope.**
- Shadow only. No store migration, no ranking.
- Pages were fetched under the standing internal research policy.

**Exclusions, none bypassed:**
- Modern Castle answered 403 to its robots file.
- Erin's Audio Corner's robots file redirects, and the redirect was denied.
- The Archimago URL is plain HTTP, which the transport does not allow.

So this check has no audio pages.

**Correction recorded.** The S90 report said 9 never-seen publishers; the right count is 8. A dated note is in the S90
report.

## 1. What changed

| Change | Kind |
|---|---|
| **Documentary context** (`documentContextOf`): one object carried to the definitions (details below) | reading → interpretation |
| **Evidence role from positive evidence, ranked by locality** (`roleEvidence`, `roleFromEvidence`). Details below. | interpretation |
| **Measurement cues as data** (pd.5 `evidenceCues.measurement`: lasted, maxed, completed, …); declaration cues extended | knowledge |
| **Per-role evaluation** (`scripts/s91-role-eval.mjs`, `s91-check.mjs`): per class, the reference, predictions, precision, coverage, recall and abstentions, beside both trivial baselines | evaluation |

**What the documentary context object carries:**
- structural label and container;
- section and its role;
- table context;
- whether the value sits in a methodology section;
- page type;
- whether the document reports its own testing.

**How the role is decided.** Each evidence item has a locality level, and the most local evidence decides. A tie, or no
evidence at all, leaves the role **unresolved**: an abstention, never "measured by default".

| Class | Positive evidence | Locality |
|---|---|---|
| Measured | measuring verb or observation verb in the clause | clause |
| Measured | first-person test context in the clause | clause |
| Measured | first-person test context in the sentence | sentence |
| Measured | instrument (from the definitions' instrument dimension) in the sentence | sentence |
| Measured | test table | structure |
| Measured | test section with first person, or with a procedure condition | section |
| Measured | tested document plus an operating setting in the clause | section |
| Declared | declaration cue in the clause | clause |
| Declared | specification table or "label: value" line | structure |
| Quoted and test condition | the S86c sentence signals | — |

**Development** (spent S89 and S90 checks, three reformulations):
- In S90, precision of "declared" was 94% and precision of "measured" rose from 7% to 17%.
- In S89, recall of "measured" fell from 69% to 25%.
- About half the values were left unresolved.

## 2. Independent check — first run (unchanged; `evaluation/s91/check-firstrun-*.json`)

**Material:** 402 values from pages rich in original measurements, from 3 never-seen publishers:

| Publisher | Category | Pages |
|---|---|---|
| Air Purifier First | air purifiers | 7 |
| Smart Robot Reviews | robots | 1 |
| Notebookcheck | robots | 5 |

The reference attributes 180 values to a property, with these roles: declared 83, measured 74, test condition 15,
other 8.

### Property attribution

| Arm | Correct | Wrong | Abstained | False (of 222) | Precision | Recall |
|---|---|---|---|---|---|---|
| **S91** | **101** | 1 | 78 | **2** | **97%** | 56% |
| S91 + S90 learned layer | 103 | 1 | 76 | 2 | 97% | 57% |
| unit kind only | 173 | 4 | 3 | 111 | 60% | 96% |

**Learning helps on new documents for the first time:** +2 correct values and no new false attribution. The gain is small,
but measured on documents the layer never saw.

### Evidence role (180 values)

| Model | Correct | Abstained | Measured: precision / recall | Declared: precision / recall |
|---|---|---|---|---|
| S91 positive evidence | 59 | 80 | 16/28 (57%) / 22% | 41/65 (63%) / 49% |
| S90 role model (same build) | **89** | 11 | 60/118 (51%) / 81% | 27/44 (61%) / 33% |
| trivial "all measured" | 74 | 0 | 74/180 / 100% | — |
| trivial "all declared" | **83** | 0 | — | 83/180 / 100% |

## 3. What the results show

1. **Attribution is now precise on independent, measurement-rich pages.** 2 false attributions out of 222 (97%); recall is
   56%. This is the third independent check: precision went 80% → 82% → 97% across the three, depending on the material.
2. **The positive-evidence role model is a negative result on this material.** It abstains on 80 of 180 values. When it
   decides, its precision is only slightly higher than the S90 model's (57% vs 51% for measured, 63% vs 61% for
   declared). Overall it is worse (59 vs 89) and below the "all declared" baseline. The owner predicted this: "non basta a
   migliorare automaticamente l'accuratezza: deve poi riuscire a riconoscere positivamente sia le dichiarazioni sia le
   misure originali." Positive recognition is still too weak.
3. **Why the original measurements are missed** (42 of 74 unresolved, all "no positive evidence"):
   - **Air Purifier First (27 values):** the publisher's own results are bare table cells ("41.4 dBA"). The table has no
     heading or caption the 1D-A2 semantics recognise as a test table. The document reports its testing elsewhere (a
     particle counter, a noise meter), but nothing connects that statement to the table.
   - **Notebookcheck (15 values):** observation verbs are missing from the data ("consumed", "approximately … loud").
4. **What this means.** Provenance has to be linked across the document: the publisher's methodology statement
   (instrument, test procedure) to the table or section that reports its results. The 1G table interpreter already has
   such method links (`methodLinks`, `ContextLink1G`), so these should be reused rather than built anew. These findings
   were recorded after the first run, not tuned.

## 4. Status

| Capability | Maturity | Held-out result |
|---|---|---|
| Definition-driven attribution (known objects, ranges, structure) | implemented, shadow | precision 80% / 82% / 97% on three independent checks; recall 40% → 49% → 56% |
| Learning with uncertainty states | implemented, shadow | +2 correct on independent documents (first measurable gain) |
| Evidence role, positive-evidence model | implemented, shadow | worse than the S90 model and the majority baseline; abstains too much |
| Evidence role, S90 model | kept (`roleModel: 's90'`) | 89/180; measured recall 81% at 51% precision |

**Next (experimental, reversible):**
- Connect methodology statements to the tables and sections that report results, reusing the 1G method links and
  `ContextLink1G`.
- Use the S90 role model as the base and the positive evidence only to correct it where evidence exists. Measure both
  again on a new independent check.
- Add the observation verbs found here only after that check is designed, so that the check stays clean.

## 5. Files

**Public:**
- `evaluation/s91/*`;
- `scripts/s91-role-eval.mjs`, `scripts/s91-check.mjs`;
- the definitions pack (pd.5);
- `src/definition_interpreter.ts`;
- `tests/s89_definition_learning.test.ts` (S91 role tests).

**Private:** `private-eval/s91/`, with text hashed in the pee-knowledge copy. No page bytes are committed.
