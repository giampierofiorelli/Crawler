# S94 — Consolidated scientific algorithm evaluation (three sequential stages)

**Roadmap step.** R3 / R3-C (owner review of S93, verbatim in `owner-review-s93-2026-10-20.md`). **R3 is not closed.**

**Scope.** Shadow only. No store migration, no ranking authorisation, no production model dependency. The advisory path is
unchanged: 206 spent requests answered by the build at the end of S93 and by the S94 build give **0 changed answers**
(`evaluation/s94/advice-diff-s93end-s94.json`).

## Outcome in one table

| Stage | What it adds | Development (spent, tuned) | Independent first run | Verdict |
|---|---|---|---|---|
| 0 | Head-word hierarchy removed (owner correction) | "robot height" now `different_object` from `obstacle_height`; "charging time" only `shares_head_term` | — | Applied |
| 1 | Whole-table relations: arithmetic cell dependencies, statistic rows, row subjects, collective method links | calculated 31 → 106 of 206; inputs 1 → 59 of 140; nature 225 → 304 of 700 | **New publishers (SSDs, monitors): no opportunity** (no HTML comparison tables). **Smartphones (known template):** calculated 8 → 48 of 94 (1 error), inputs 0 → 39 of 70, subject 52 of 52 | Works where tables carry the relation; generalisation across publishers **not shown** |
| 2 | Hybrid vector-symbolic alignment (PPMI + graph neighbourhood for retrieval; symbolic checks for identity) | held-out: 2 of 3 decisions correct (19 identities) | **New sealed reference (11 identities): 0 correct** (1 related promoted). Vector retrieval puts 11 of 11 identities among the candidates (lexical 8) | Identity: **negative**. Retrieval: positive. Hierarchy: 0 of 22 |
| 2 | Learned definitions reused on later pages | — | 11 promoted, **used 0 times** on 398 new values | Not demonstrated |
| 3 | Qwen2.5-1.5B, S76 input vs structured input | — | 1 correct identity in 3 runs (25 reference identities); structured input 0 of 2 decided | **Negative; suspended by the owner** |

## 1. Stage 0: false hierarchies (owner correction)

`proposeDefinitions` (S93) made a learned concept `narrower_than` any property whose surface term equals its head word.
Replaced by `semanticRelation` (I-ADOPT: a property is a quantity kind **and** an object of interest):
- a shared head word alone → `shares_head_term` (lexical evidence, never a hierarchy);
- same kind, and a modifier names an object the property's definition names → `narrower_than`;
- same kind, other object → `different_object` (neither identical nor broader);
- every relation is `verified:false` until later documents confirm it.

On the S93 learning material: "robot height" → `different_object` of `obstacle_height`; "charging time" → no hierarchy
with `run_duration` (its object is not defined). Attribution unchanged (relations are not used to attribute).

## 2. Stage 1: joint table and document inference

**References used as architecture:** Limaye et al. 2010 and TableMiner+ (one hypothesis must explain every row of a
column), Sato (column type in the context of the table), TUTA (header tree and cell dependencies).

**Mechanism (`tableRelations1G`, `src/table_interpreter1g.ts`; read by `evidenceLinksOf` and `provenanceAndNature`):**
- **Relative difference by arithmetic.** One formula for the whole table and one reference value per row group (rows of a
  single cell head a group). Every row's printed precision bounds the reference (interval stabbing). A group needs 3
  agreeing rows, or 2 and a reference row. Five formulas compete; the best must beat the others. No words.
- **Statistic rows.** A row label beginning with a statistic (average, median, minimum, n=…) holds calculated values.
- **Row subject.** Decided only when the table shows a product axis (a row names the reviewed product, or one relation
  ties the rows); otherwise a header naming the reviewed product fixes its column; otherwise nothing.
- **Collective method link.** A method statement of the table's own or an ancestor section that names one of its
  quantities; else the document-wide method statements (naming no quantity), applied defeasibly (decision S54).
- **Collective typing.** The base values of a verified comparison table are members of one procedure.
- **Provenance and derivation stay separate.** A derived cell is `calculated` with provenance `publisher`; its inputs (own
  value cell, reference cell) are listed as the calculation's inputs. It is never a measurement.

**Development (spent: S93 check after its unchanged first run, S93 development reference; three reformulations and two
code-bug fixes, recorded in `freeze-stage1.json`):**

| 700 technical values | C1 (S92) | R1 (S93) | T1 | T1-noarith | T1-nostat | T1-nomember |
|---|---|---|---|---|---|---|
| Nature correct | 218 | 225 | **304** | 231 | 298 | 300 |
| Calculated: correct / predicted (reference 206) | 0/0 | 31/55 | **106/130** | 37/61 | 100/124 | 106/130 |
| False calculations on measured or declared | 0 | 18 | 18 | 18 | 18 | 18 |
| Calculations with an input found (of 140) | 0 | 1 | **59** | 1 | 59 | 59 |
| Row subject decided / correct | — | — | 117 / 117 | | | |

**Independent first runs (unchanged; `check-firstrun.json`, `check-wave2-firstrun.json`):**

| | C1 (S92) | R1 (S93) | T1 | T1c (+ comparatives) |
|---|---|---|---|---|
| **Wave A: SSDs (Tom's Hardware) and monitors (TechSpot), new publishers, 226 technical values** | | | | |
| Nature correct | **70** | 59 | 59 | 59 |
| Calculated correct / predicted (reference 18) | 0/0 | 1/16 | 1/16 | 1/16 |
| False calculations | 0 | 14 | 14 | 14 |
| **Wave B: smartphones (Notebookcheck: same template as development), 151 technical values** | | | | |
| Nature correct | 4 | 12 | **54** | 56 |
| Calculated correct / predicted (reference 94) | 0/0 | 8/9 | **48/49** | 50/51 |
| Calculations with an input found (of 70) | 0 | 0 | **39** | 39 |
| Correct reference line reached when elsewhere | 1/3 | 1/9 | **39/51** (3.5 lines per value) | 39/51 |
| Row subject decided / correct | — | — | 52 / 52 | |

**What this shows.**
- On pages whose tables carry the relation, the mechanism is precise: 1 wrong calculation in 49, and every decided row
  subject correct. Most of the gain comes from the arithmetic (ablation T1-noarith loses it).
- Wave A has **no HTML comparison table** (the charts are images), so Stage 1 had no opportunity there. Generalisation
  beyond one publisher's template is **not demonstrated**.
- Wave A exposed an S93 error: "maximum brightness 445 nits" is a measured extreme of one device, not a statistic over a
  set, but S93's aggregate rule reads it as calculated (14 of 16 false calculations). S93 provenance × nature scores
  **below** the S92 rules on these pages (59 against 70). Recorded, not tuned.
- The S93 calculations on air purifiers (coverage from CADR, statistics in prose) are untouched by tables: 10 of 34 on
  development, unchanged.

## 3. Stage 2: hybrid vector-symbolic entity understanding

**References:** OWL2Vec* (concepts embedded with their graph neighbourhood), LogMap (lexical anchors, then logical checks
that reject incoherent mappings), ChemDataExtractor 2.0 (typed quantities before relations), I-ADOPT. None installed.

**Mechanism (`alignHybrid`, `src/knowledge_translation.ts`).** PPMI vectors trained on the owner's 89 package files
(6,316 paragraphs) retrieve candidates and support `related`. **Identity always needs a lexical anchor** (an alias, or a
name word with the vector's clear first choice) and passes the symbolic checks (semantic type, quantity kind and metric).
Disjoint typing is `incompatible`; a head anchor with an uncovered name is a hierarchy candidate.

**Reference.** The old references held only lexically retrieved candidates, so a vector-retrieved candidate was
unannotated. A **new blind reference** was built with pooled candidates (lexical top 4, vector top 4, one control): 120
never-aligned mentions of the transfer packages, 622 candidates (311 vector-only), annotated blind by three agents and
sealed (`align-freeze.json`).

**First run (`align-s94-firstrun.json`; 11 identities):**

| Arm | Decided | Correct | Related promoted | Other wrong |
|---|---|---|---|---|
| Lexical identifier (cycle 2) | 12 | **2** | 7 | 3 |
| Type gate (S75) | 6 | 0 | 4 | 2 |
| Hybrid H | 1 | 0 | 1 | 0 |
| H without vectors / graph / typing | 0 / 4 / 1 | 0 / 0 / 0 | | |
| H without the semantic-type check (ablation) | 3 | 2 | 1 | 0 |

- **Retrieval improves:** vectors put **11 of 11** reference identities among the candidates; lexical retrieval 8.
- **Identity does not:** on development the vector was as confident on related concepts (14–15 cases) as on identities
  (1–5), and the semantic-type check rejected most reference identities. No rule over these signals separates identity
  from relatedness. Stopped after one reformulation, as preregistered.
- **Hierarchy:** 0 of 22 hierarchy candidates correct.
- On the S76 transfer examples (second use): lexical 3 of 17, type gate 1 of 6, H 0 of 1.

**Learning reuse.** Definitions learned from all earlier material (S88–S93), with the Stage 0 typing: 11 promoted, still
including weak concepts ("aluminum", "c hot", "weighing"). On the 398 new values none was used. **Not demonstrated.**

## 4. Stage 3: controlled Qwen re-evaluation

**Setup (preregistered in `preregistration-stage3.json`).**
- Model: Qwen2.5-1.5B-Instruct, local CPU (4 threads), S77 full-sequence readout.
- Isolation: a separate virtual environment and a weight cache outside the repositories; shadow only.
- Decision rule: the S76 frozen rule, unchanged.
- Structured input: the phrase's semantic type and quantity typing; the concept's typing and up to five graph
  relations; the symbolic checks; the distributional relatedness, labelled as not identity.

**Results (`evaluation/r3/semantic-s94-*.json`; with the semantic-type gate, without it in brackets):**

| Run | Reference identities | Decided | Correct | Wrong: related promoted | Wrong: other |
|---|---|---|---|---|---|
| S76 input, S76 transfer examples | 14 | 1 (6) | 1 (0) | 0 (1) | 0 (5) |
| Structured input, S76 transfer examples | 14 | 2 (2) | 0 (0) | 0 (0) | 2 (2) |
| S76 input, new S94 reference | 11 | 8 (14) | 0 (0) | 4 (5) | 4 (9) |
| Structured input, new S94 reference | 11 | — | — | — | — |

The last run was stopped by the owner's decision after 6 of its estimated 30 minutes, and is **not executed**.

**Costs:**
- 2.8–3.7 s per candidate pair.
- About 9.5 GB of memory (float32).
- 22–29 minutes per run of 396–622 pairs.
- 1 h 22 min in total for three runs, plus a 1.2 GB runtime and 3 GB of weights.

**Verdict.**
- The model recovers 1 identity in 3 runs.
- The structured input does not help: 0 correct of 2 decided, against 1 of 1 with the S76 input on the same examples.
- On new data the model promotes related or unrelated concepts to identity.
- The best non-generative arm on the new reference, the lexical identifier, reaches 2 of 12.
- The preregistered stop rule is met: no gain over the non-generative arms, more wrong identities, high cost.

**Owner decision (2026-10-20, verbatim in `owner-decision-qwen-suspension-2026-10-20.md`):**
- Qwen is suspended as an R3 development direction; code, results and reasons are kept.
- This does not exclude language models for ever.

## 5. Is R3 met?

- **Scientific generalisation:** not met.
  - The one mechanism with strong independent gains (Stage 1) was shown on a known page template only.
  - The vector-symbolic alignment fails identity on new data.
  - Learned definitions are never reused.
  - S93's provenance × nature rule degrades on a new publisher.
- **Operational validation (C3/C4):** not met. The advisory path is unchanged (0 of 206 answers differ). No end-to-end
  request reached a justified ranking through these mechanisms.

**What should stay integrated (shadow):**
- Stage 0 relation typing.
- Stage 1 table relations: precise, opt-in, no regression on pages without tables.

**What should not:**
- Qwen as an R3 direction (suspended by the owner).
- The hybrid identity rule.
- The S93 aggregate rule as written (maxima of one device are not statistics).

**Next targeted work before R4:**
- Test table relations on a second publisher with HTML comparison tables.
- Restrict the aggregate rule to statistics over a set.
- Alignment needs richer concept structure (object and quantity per concept) before any validator can separate identity
  from relatedness.

## 6. Files

**Public (counts only):**
- `evaluation/s94/*`: preregistrations, freezes, seals, development, first runs, advisory diff;
- `scripts/s94-*.mjs`;
- `src/table_interpreter1g.ts`, `src/definition_interpreter.ts`, `src/definition_learning.ts`, `src/knowledge_translation.ts`;
- `tests/s94_table_relations.test.ts`.

**Private:** `private-eval/s94/`, `private-eval/r3/align/s94/`, `private-eval/r3/semantic/`. The pee-knowledge copy has
its text hashed, and no page bytes or page text.

**Access:**
- Excluded, not bypassed: GSMArena, Phoronix, KitGuru and PCMag (their robots files name Claude or AI agents), TFTCentral
  (robots blocked) and TechPowerUp (robots 421).
- All requests were made under the standing policy.
