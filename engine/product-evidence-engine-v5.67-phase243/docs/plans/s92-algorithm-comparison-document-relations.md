# S92 — A circumscribed comparison of algorithms: document relations, evidence combination, R3 non-generative learning

**Roadmap step.** R3 / R3-C (owner review of S91, verbatim in `owner-review-s91-2026-10-20.md`). R3 is **not** closed.

**Scope.**
- Shadow only. No store migration, no ranking, no LLM.
- Pages were fetched under the standing internal research policy.

## Contents

1. Where the work stands against the original programme
2. Diagnosis before design (spent S89–S91 material)
3. What was compared (reuse first)
4. Development (spent material; TUNED)
5. Independent check, first run (unchanged)
6. What S92 establishes and what it does not
7. Next (experimental, reversible)
8. Files

## 1. Where the work stands against the original programme

The owner's review recovers two levels of the research. Both are kept apart here.

**The six programme names** (memo "Memoria strategica", 17 Oct 2026, §6.3):

| Programme name | Served by S92? |
|---|---|
| Domain generalization | Yes: never-seen publishers and a never-taught category (stick vacuums) |
| Ontology learning / knowledge-graph induction | Yes: arm family E (R3 document concepts with typed relations) |
| Continual learning | Partly: earlier capability is scored, and losses are reported against A0 and A1 |
| Transfer learning | Partly: the document-relation mechanism is category-independent and is measured on the new category |
| Meta-learning | **No** |
| Active curriculum selection | **No** |

**The S87c method names actually used:**
- DocRED / EIDER / SciREX: evidence selection by co-occurrence, bridge and nearest-instance inheritance.
- Snorkel and FlyingSquid: a label model without gold, with selective abstention.
- Distant supervision and Snowball: the existing learning mechanism.
- The three R3 non-generative mechanisms: semantic-type gating, PPMI distributional similarity, document concepts.

**Not run:**
- a lightweight joint HTML and text model (only if the first approaches were insufficient);
- LLMs;
- aspect-based opinion extraction.

## 2. Diagnosis before design (spent S89–S91 material)

File: `evaluation/s92/diagnosis-1g-vs-reference.json`.

- **A reuse gap.** The definition interpreter read the Step 1D-A2 structure but never consulted the 1G table interpreter.
  - 1G already links method statements to result tables: `contextLinks`, `classify`, `ContextLink1G`.
  - 1G also has a typed whole-document model: `DocumentModel1G`, with statements typed method, declaration or estimate.
  - The WD reader (`document_evidence.ts`) gives each prose value an evidence class. Since the S77 audit (A1-16), that
    class includes a page-level default, "a page that reports its own test covers its sentences". This is the same
    "measured by default" that failed in S90.
- **Where the measured values are.** Of 134 reference measured values, 32 are table cells and 102 are prose. The main
  problem is therefore cross-sentence linking, as DocRED and SciREX report.
  - Of the 32 table cells, 1G linked 10 to a method statement.
  - Two finer relation errors appeared:
    - **calculation input against output:** measured watts became "estimated" because they sit next to a running-cost
      calculation;
    - **twin tables:** the second of two identical result tables inherited nothing.

## 3. What was compared (reuse first)

| Arm | What it is | Existing component reused |
|---|---|---|
| A0 / A1 | S90 and S91 role models (references) | — |
| B | A1 plus the 1G table evidence and its method links | 1G `classify` / `ContextLink1G` |
| B2 | B plus two provisional 1G lessons (details below) | 1G lesson mechanism |
| C | Evidence selection over the whole document (details below) | 1G `DocumentModel1G`, `blockKind1G`, `dimensionsIn1G` |
| C1 | C plus the situation type of the value's clause (details below) | — |
| D | Label model over seven signals | new: `evidence_combination.ts` (no earlier label model existed) |
| D2 | Like D, but each signal abstains without evidence (details below) | same |
| E0–E3 | Learning with the R3 mechanisms switched on one by one: E1 type gating (`denotationOf`), E2 PPMI proposals (`trainDistributional`), E3 document concepts with typed relations (`documentConcepts`) | `definition_learning.ts`, `knowledge_translation.ts` |

**B2: the two provisional 1G lessons.** They run only on request.
- **GL11:** an input of a calculation that a method statement names keeps the method's provenance.
- **GL12:** a twin table, with the same quantity signature under the same parent section, inherits its twin's links.

**C: evidence selection.** Statements are linked to the value by three relations:
- **co-occurrence:** the neighbouring sentences;
- **bridge:** a statement naming the value's quantity in the same section, an ancestor section or a methodology section;
- **the 1G table links.**

The nearest evidence decides; a tie of opposite roles abstains. Every decision carries a pointer to the statement that
supports it.

**C1: situation type** (Friedrich et al. 2016), from grammar only:
- an attributive measure phrase ("a 3L dust bag") reads as declared;
- an episodic past predicate ("it lasted 13 minutes") reads as measured.

**D and D2: the label model.** It uses the FlyingSquid triplet estimator, needs no gold and abstains below a margin of 0.5.
In D2, A0 votes only when it has a reason other than its default, and WD is left out because its page-level default
cannot be separated from its evidence. D2 is run twice on the check:
- refit on the check items, without their labels;
- with the frozen model fitted on development.

## 4. Development (spent material; TUNED)

**Material.** 375 values with a reference role, from the S89, S90 and S91 checks. Three reformulations were allowed.
- **Role:** two were used. Reformulation 1 added the situation type; reformulation 2 made the label-model signals abstain
  without evidence.
- **Learning:** one was used. A stricter grammatical gate was tried and **rejected**. It removed verbs such as
  "climbing" and "picked" that carried correct attributions, and FrameNet frames are evoked by verbs too.

| Arm | Correct / 375 | Abstained | Measured: precision / recall | Declared: precision / recall | Against A0 |
|---|---|---|---|---|---|
| A0 | 181 | 34 | 45% / 75% | 76% / 37% | — |
| A1 | 124 | 179 | 54% / 23% | 73% / 44% | — |
| B | 135 | 170 | 64% / 35% | 73% / 41% | +39 / −85 |
| C | 154 | 143 | 65% / 46% | 73% / 43% | +43 / −70 |
| C1 | 179 | 112 | 67% / 52% | 74% / 51% | +60 / −62 |
| D | 200 | 19 | 48% / 81% | 78% / 43% | +22 / −3 |
| **D2** | **197** | 90 | **64% / 54%** | **78% / 59%** | +54 / −38 |

In D, the label model rated A0 at 0.83 reliability. A0 and WD share a page-level default, and correlated signals inflate
each other. This is the documented limit of the method, and D2 corrects it.

**Learning** (layers learned from S88–S90; target S91): no learning 101 correct; E0 103; E1 103; E2 104; E3 104. E3 also
produced 16 concepts with typed relations. False attributions stayed at 2 in every case.

Freeze: `evaluation/s92/freeze.json`, committed before any check page was fetched.

## 5. Independent check, first run (unchanged)

File: `evaluation/s92/check-firstrun.json`.

**Access exclusions** (amendments 1–3, none bypassed):

| Publisher | Reason |
|---|---|
| HGTV | robots answered 403 |
| Bob Vila, TechHive | the transport refused: no safe public IPv4 address |
| Canadian Woodworking, The Gadgeteer | blocked by the environment's network |
| The Independent | robots response denied |
| Reviewed | robots cannot be read as allowing PEE; the script fails closed |
| Good Housekeeping, Guardian, Wired, Popular Mechanics, The Verge, PCMag, ZDNet | these publishers refuse AI crawlers; treated as a refusal |

**Material.** 14 pages, 191 values, from 5 never-seen publishers:

| Category | Publisher | Values |
|---|---|---|
| Stick vacuums (never taught) | NBC Select | 37 |
| Stick vacuums (never taught) | Real Homes | 65 |
| Robots (taught) | BestReviews on NewsNation | 27 |
| Robots (taught) | The Ambient | 23 |
| Robots (taught) | NBC Select | 6 |
| Robots (taught) | Real Homes | 20 |
| Robots (taught) | Livingetc | 13 |

**Blind reference.** It was sealed before any arm ran, and the annotator read each whole page. 116 values carry a
property:

| Role | Values |
|---|---|
| declared | 102 |
| measured | **6** |
| quoted | 1 |
| other | 7 |

78 values carry the line of the statement that establishes their provenance.

**The check is not what the owner asked for.** The pages rich in original measurements belonged to publishers that were
excluded for access reasons. The pages that remained are mostly specification lists. As a result:
- **declared:** the check measures precision and coverage;
- **measured:** it has no statistical power (6 values).

### Evidence role (116 values; trivial "all declared" = 102)

| Arm | Correct | Abstained | Predicted measured (correct) | Declared: precision / recall | Against A0 |
|---|---|---|---|---|---|
| A0 (S90) | 53 | 11 | 40 (4) | 100% / 48% | — |
| A1 (S91) | 56 | 39 | 8 (3) | 100% / 52% | +8 / −5 |
| B / B2 | 56 | 39 | 8 (3) | 100% / 52% | +8 / −5 |
| C | 58 | 38 | 7 (3) | 100% / 54% | +10 / −5 |
| C1 | 65 | 25 | 13 (3) | 100% / 61% | +15 / −3 |
| D (refit) | 61 | 11 | 32 (4) | 100% / 56% | +9 / −1 |
| **D2 (refit)** | 65 | 22 | 16 (3) | 100% / 61% | +13 / −1 |
| **D2 (frozen development model)** | **66** | 22 | 15 (3) | 100% / 62% | +14 / −1 |

**Linked method.** For 31–35 correct decisions, the reference puts the provenance statement on another line of the page.
In only **1** of them does the arm's evidence reach that line, in every arm. The document links almost never select the
statement the reader would cite.

### Property attribution (116 values; 75 outside the definitions)

| Category | Correct | Wrong | Abstained | False attributions |
|---|---|---|---|---|
| Robots (taught) | 40 | 2 | 16 | 7 of 31 |
| Stick vacuums (never taught) | 17 | **25** | 16 | 13 of 44 |

**Learning.** The E0–E3 layers changed nothing on these pages, whether learned inductively or transductively; the
transductive layer lost one correct value.

**Knowledge-graph induction (E3, transductive).**
- 68 reference values are technical quantities outside the definitions (24 distinct concepts).
- 10 of them fall under an induced concept.
- Of 260 pairs of values that share a reference concept, 11 are grouped together. All 11 pairs grouped are correct.

## 6. What S92 establishes and what it does not

1. **The reuse gap was real, and closing it helps without loss on development.**
   - B and C add +16 and +35 correct decisions against A1, with 5 losses.
   - Precision on measured values rises from 45% (A0) to 64–67%.
   - On the check, every arm that uses document relations or combines evidence beats A0 with few losses:
     C1 +15 / −3, D2 +13 / −1.
   - Precision on declarations stays at 100%.
2. **The label model with abstaining signals (D2) is the best combination found.**
   - Refitted without gold on new pages, it matches the development model (65 against 66).
   - Its main errors are the false "measured" calls, 13 on the check, half of them caused by the situation type.
   - It remains far below the trivial "all declared" baseline (66 against 102) on this unbalanced material.
3. **Document links do not yet select the statement a reader would cite** (1 of about 33). Linking by shared quantity
   and proximity finds statements of the right kind, rarely the right one. This is the gap that DocRED/EIDER-style
   evidence selection is meant to close, and S92 has not closed it.
4. **Transfer to a never-taught category fails mainly for one reason: two close definitions, not a lack of vocabulary.**
   - 25 of 25 wrong attributions on stick vacuums read the runtime on one charge as `run_duration` instead of
     `battery_runtime`.
   - The other false attributions are new concepts with no definition: charging time, suction expressed in air watts.
   - Found after the run; recorded, not tuned.
5. **The R3 mechanisms gave no measurable benefit on new pages.**
   - **Type gating:** no effect.
   - **PPMI:** proposes plausible terms ("total power output" → amplifier power; "robot height" → obstacle height) and
     +1 on development, 0 on the check.
   - **Document concepts:** the induced concepts are consistent (11 of 11 pairs) but cover few values (10 of 68).
   - So the owner's hypothesis, that these mechanisms work better with the new representation, is **not supported yet**.
     It is not refuted either, because the check offers little to learn from.
6. **Not demonstrated:**
   - recognising original measurements on independent pages (6 values);
   - any benefit on the full path to advice (not measured);
   - meta-learning and active curriculum selection.

## 7. Next (experimental, reversible)

- **A check really rich in original measurements, built before choosing the publishers.** Find accessible publishers
  first; Notebookcheck and Air Purifier First worked in S91.
- **Evidence selection that picks the statement, not only its kind.** Score candidate statements by their arguments:
  shared product, shared quantity and instrument, as in the EIDER and SciREX rules.
- **The `battery_runtime` / `run_duration` distinction.** Teach it as a definition relation (the charge against one run),
  through the general mechanism, then measure it on the never-taught category.
- **Make E3 concepts reachable by a new definition.** Charging time and air watts are the obvious candidates. This is the
  link between knowledge-graph induction and the definitions that S92 did not test.

## 8. Files

**Public (counts only):**
- `evaluation/s92/*`;
- `scripts/s92-role-eval.mjs`, `scripts/s92-learn-eval.mjs`, `scripts/s92-check.mjs`;
- `src/definition_interpreter.ts` (evidence links, role from links, situation type);
- `src/evidence_combination.ts`;
- `src/definition_learning.ts` (E switches);
- `src/table_interpreter1g.ts` and `src/table_interpreter1g_lessons.ts` (GL11, GL12);
- `tests/s92_document_relations.test.ts`.

**Private:** `private-eval/s92/`. The pee-knowledge copy has text hashed and no page bytes or page text.
