# S90 — Document structure connected to the definitions; learning with uncertainty states; a second independent check

**Roadmap step.** R3 / R3-C (continuation; owner review verbatim in `owner-review-s89-2026-10-20.md`). R3 is **not**
closed.

**Scope.**
- Shadow only. No store migration, no ranking.
- Pages were fetched under the standing internal research policy: robots-checked, with no reservations on any page.
- 15 check pages came from 4 publishers never used before: Stuff, Pocket-lint, Engadget and Audioholics.
- Two pre-registered publishers were excluded, not bypassed:
  - Tech Advisor: the transport refused it ("no safe public IPv4 address");
  - Home Theater Review: its redirect was denied.

## 1. What changed (reuse, not new recognisers)

| Change | Existing component reused | Kind |
|---|---|---|
| A value inherits its **structural label** (table row and column headers, the label of a "label: value" line) and its **section** (heading path) | Step 1D-A2 `readDocumentSemantics1D2` | reading → interpretation |
| **Evidence role decided by structure first, sentence second** (`roleFrom`). Details below. | S86c `observationRole86c` | interpretation |
| **Section cues and provenance cues as data** in the definitions pack (pd.4: `documentSections`, `evidenceCues`), so a correction propagates | — | knowledge |
| **Band principle.** A value bounding another quantity's range ("+8 dB from 200 Hz to 10 kHz") is that quantity's condition | — | inference |
| **Subsumed metrics.** A property declares the QK metrics it covers (capacity ⊇ tank capacity), so they are not competing concepts | QK pack | knowledge |
| **Sentence-scoped objects.** A competing object must be named in the value's own sentence, not the window | — | inference |
| **Learning with uncertainty states** (owner: "una fonte specialistica autorevole può fornire conoscenza utile anche prima di una seconda conferma"). Details below. | `definition_learning.ts` | learning |

**How the role is decided:**
- In a specification table or section, the role is "declared".
- In a test table or section, it is "measured".
- A clause that attributes a capability to the product ("has", "equipped with", "rated") without a measuring verb is
  "declared".

**How learning changed:**
- One source teaches a term as `candidate`, with lower weight and never decision-usable.
- Independent publishers make it `supported`.
- Structural labels seed learning.
- Three checks guard against drift: specificity (the term accompanies values of the property's kind), identity (words of
  the product's name are excluded), and sentence boundaries.

## 2. Development (spent material; S89 check pages)

**Attribution:**

| | S89 first run | S90 with structure |
|---|---|---|
| Correct of 113 | 48 | 63 |
| False of 228 | 8 | 9 |
| Recall | 42% | 56% |
| Precision | 80% | 80% |

**Evidence role:** 61 against the trivial 55.

**Learned layer:**
- learned from S88, S89-learn and S89-check pages: 26 terms (7 supported, 19 candidate);
- learned from the other pages only: on the S89 check it gives +1 correct and no false attribution.

## 3. Independent check — first run (unchanged; `evaluation/s90/check-firstrun-*.json`)

208 values from 4 never-seen publishers. The blind reference attributes 82 of them to a property; 74 of those are declared
specifications.

| Arm | Correct | Wrong | Abstained | False (of 126) | Precision | Recall | Role correct (of 82) |
|---|---|---|---|---|---|---|---|
| S89 code (commit 6d35176) | 33 | 7 | 42 | 1 | 80% | 40% | 7 |
| S90, no structure | 35 | 7 | 40 | 1 | 81% | 43% | 19 |
| **S90 + structure** | **40** | 8 | 34 | **1** | **82%** | **49%** | **34** |
| S90 + structure + learned layer | = | = | = | = | = | = | = |
| unit kind only | 55 | 7 | 20 | 46 | 51% | 67% | — |

Role baselines: trivial "all measured" gets 5 of 82; majority "all declared" gets 74 of 82.

## 4. What the results show

1. **Structure recovers values without losing precision.** On publishers never seen, recall rises from 40% (S89) to 49%,
   with precision unchanged (80% → 82%) and one false attribution in 126. This is the owner's request ("recuperare
   informazioni corrette senza reintrodurre falsi collegamenti"), met in part. Recall is still below half.
2. **Role improves strongly against the previous step (7 → 34) but stays far below the majority baseline (74).**
   - 30 of the errors are declarations read as measured with the reason "no other role". The S86c classifier defaults to
     "measured" when nothing in the sentence says otherwise.
   - On pages that mostly describe specifications, that default is wrong. The default itself must change: without a
     measuring verb or test context, the role should stay unresolved, or be declared on product-description passages.
   - This was found after the first run and is recorded, not tuned.
3. **Learning is not yet shown on independent documents.** The frozen layer (26 terms) changed nothing on these 208
   values. On development material it added one correct value. The mechanism acquires and verifies terms, and they
   propagate, but their contribution on new publishers is not measurable yet.
4. **Precision across categories and publishers is now stable.** Two independent checks (S89, S90) on 9 never-seen
   publishers both give about 80% precision; the unit-kind baseline gives 36% and 51%.

   > **Correction (2026-10-20, owner review of S90).** The publisher count above is wrong. The groups actually evaluated
   > are 4 in S89 (T3, Homes & Gardens, Expert Reviews, Sound & Vision; Digital Trends returned no usable page) and 4 in
   > S90, so 8 in total, not 9.

## 5. Status

| Capability | Maturity | Kind |
|---|---|---|
| Definition-driven attribution with known objects, plausible ranges, subsumption, band principle | implemented, shadow; precision held-out twice | inference + knowledge |
| Structural label and role inheritance (reuse of 1D-A2) | implemented, shadow; +9 recall points held-out | reading → interpretation |
| Evidence role | improved, below the majority baseline; default identified | interpretation |
| Learning with uncertainty states | implemented; effect on independent documents not shown | learning |

**Next (experimental, reversible):**
- Replace the "measured by default" rule with "unresolved by default". Use page type (1D-A2 `pageType`) and section to
  decide declarations.
- Measure learning on a wave with several measuring publishers per category.
- Then a third independent check.

## 6. Files

**Public:**
- `evaluation/s90/*`;
- `scripts/s90-structure-eval.mjs`, `scripts/s90-learn.mjs`, `scripts/s90-check.mjs`;
- the definitions pack (pd.4);
- `src/definition_interpreter.ts` (structure, role), `src/definition_learning.ts`.

**Private:** `private-eval/s90/`, with text hashed in the pee-knowledge copy. No page bytes are committed.
