# R1 — conformity verification: how much of what PEE does comes from knowledge, and how much from code (2026-10-18)

**Roadmap step:** R1 (`.claude/skills/pee-guided-learning/references/roadmap.md`).
**Exit criteria:** the owner's four (S64), §2–§5 below.
**Data:** spent pages only (development and evaluation pages already examined), zero HTTP. Every count comes from a
committed script output in `evaluation/r1/`.

## 1. The answer to the central question

**PEE learns nothing by itself today.** All of its knowledge was written by Claude, or taught by Claude from the owner's
packages:
- 278 of the 284 teaching items in the store are `assistant_authored_unreviewed`; 6 are professional method references;
- 0 rules or relations were produced by the software.

Within that, the newer reading stack (1G with QK, WD, QE, FC) makes its decisions in three different ways:

| Decision (76 retained pages) | Decisions | Depends on declarative knowledge (changes when it is removed) | Made by code alone, or by data no ablation removed |
|---|---|---|---|
| Value found (number + unit) | 2,249 | units data (not ablated: without units nothing is found) | number and unit parser |
| Kind of a value | 3,248 | 104 (methods, kind words); 92% are decided by the unit alone (SI dimensions, data) | — |
| Metric named | 3,248 | **384 (all metric names)** | — |
| Conditions of a value | 3,248 | **830** (condition vocabulary 793; metrics' required conditions; the KR record program 36) | 2,418 have none |
| Product a value belongs to | 3,248 | **0** | **3,248: entirely code** (nearest mention, section heading, page subject) |
| Evidence class | 2,110 | **0** | **2,110: entirely code** (78% "unknown") |
| Number inside a model name (P3) | 139 | 0 | 139: code |
| Comparability verdict (pairs) | 4,723 | **1,595** | 3,128 (dimension, unit, kind from the unit) |
| Qualitative statement (present, polarity, type, evidence) | 1,608 | **1,608: all depend on the vocabulary** | the judgement logic is code |
| Function statement | 478 | 426 (vocabulary) | 52 (a code pattern: "X function") |
| Mode or setting | 390 | 106 (condition vocabulary) | 284 (code patterns: "speed N", capitalised "X mode") |

Ablation outputs: `decision-census-first.json`; recorded provenance: `provenance-census-first.json`.

**In plain terms:**
- **What a value is** comes mostly from units and dimensions. This is standard scientific knowledge, held as data.
- **What a value is about** (its metric, conditions, qualitative aspect, function) comes from vocabularies Claude wrote
  as data.
- **Whom a value is about, and how strong the evidence is,** is decided by code alone. These are among the most
  consequential decisions, and no knowledge takes part in them.
- **The measurement-method knowledge decides few cases** (about 3% of kinds), but those are the cases where it matters
  (§4).

**Where the knowledge sits** (static census, `knowledge-map.json`):

| | Newer stack (8 files, 2,280 lines) | Older plan-guided stack (8 files, 2,584 lines) |
|---|---|---|
| Regular expressions in code / words in their alternations | 259 / 810 | 410 / 1,162 |
| Word lists in code / items | 24 / 129 | 36 / 307 |
| Declarative data | QK pack 2,502 strings, functions 760 | the store's teaching via the extraction plan |
| Executed rules | kr.3: 81 rules; product: 45 rules | none |

The whole engine: 50,732 lines, 2,704 regular expressions (7,628 alternation words), 987 word lists in code.

## 2. Criterion 1: rules no stronger than the evidence, also in combination

**Audit:** all 28 rules that use negation (`rules.v2.json`, `product-rules.v1.json`), classified by what they license.

| Class | Rules | Verdict |
|---|---|---|
| Weak conclusions from an absence ("undetermined", "not established", "unassessed") | Q12, F2, F5, F6, F7, F12, E4 | sound |
| Internal ranking and defaults | J9, J12, J14, F14, F15 | sound |
| "This statement names no other product" (scope) | C4, C5, K2, X2, X3 | **residual risk:** an unrecognised name lets scope apply; the absence of a *recognised* mention is not the absence of a mention |
| "This value has no metric of its own" (P1) | P1c, P1e | **residual risk,** for the same reason (an unrecognised metric) |
| Presence from a document | F3, F4, F6, F7 | sound, closed over the document; F6 creates 4,117 "not verified" facts per reading, meaningful only for a question (a need) |
| **A conclusion stronger than the evidence** | **M6, F10 (kr.2); E1–E2, E5–E7 (pr.2); E6** | **corrected** |

**Corrections:**
1. **Unknown is not different** (`rules.v3.json`, kr.3, and M6/M8 of pr.3).
   - A difference of conditions or states is concluded only by definition or by statement: two ranks of one series,
     highest vs lowest, two numbers in one unit, two named values of a closed non-operating list (dust vs smoke), or a
     stated difference.
   - Otherwise the reading is "not shown equal" or "relation unknown".
   - `rules.v2.json` is kept for reproduction; the code now passes only the facts a rules file declares.
2. **Relevant ≠ supports ≠ refutes ≠ measured** (pr.3).
   - Effectiveness is assessed **per aspect** (response time, air quality reached, oscillation, energy...).
   - Only a direct test or measurement of the function, or of the mode that realises it, supports or refutes an aspect,
     bounded to its statement.
   - An opinion or a claim is only relevant. A component's behaviour is only relevant. A value in auto mode measures
     the energy aspect and nothing else.
   - An unspecified sensor is tied to no function.

**Equivalence replays** (what changed, and why):

| | Before | After |
|---|---|---|
| Comparability verdicts, 4,723 pairs | — | **0 verdicts changed** |
| "Different condition" findings | 318 | 136 documented; **182 (57%) claimed a difference the record does not show**, now "not shown equal" |
| FC (spent reference): effectiveness "evidence" | 43 | **1** (the only direct test or measurement of an aspect) |
| FC: present functions with effectiveness unassessed | 39 | 63 |
| FC: "different state" pairs | 418 | 192 (the other 226 are "relation unknown") |
| FC: performance statements linked to a function | 15 | 12 (the unspecified-sensor links were removed) |
| Reach (functions 117, presence correct 110, modes 45, modes on results 28) | — | unchanged |

(`compare-replay-first.json`; `evaluation/function-fc/score-r1-replay-b-fc1.json`. The FC reference is spent, so this
is a replay, not an evaluation.)

**Tests:**
- **Derivations of combined relations** (component + mode + measured value + opinion): relevant, never support.
- **Shape tests over the rule set:** every assessment needs a statement or result; support and refutation need direct
  test evidence; a difference of states needs a definition or a statement.
- **Metamorphic tests:** renaming the product keeps the inferences; removing the only support withdraws them; another
  mode changes the condition.

Counts: 17 FC tests and 9 KR tests. The full suite passes: 4,711 tests, including the vertical-path fitness tests (the
request → advice path is intact).

## 3. Criterion 2: knowledge, rules and hand-coded behaviour told apart

§1 gives the separation with counts, both static (where knowledge is written) and dynamic (which decisions depend on it,
verified by ablation).

## 4. Criterion 3: the effect of consulting scientific knowledge

**Measured: an effect.** On the K9 blind acoustic adjudication (120 table values, sealed; spent pages, development
evidence), remove the measurement-method knowledge (documented methods and protocols, standards):
- correct interpretations fall from **82 to 42**;
- **40 unjustified abstentions** appear;
- no unjustified interpretation appears.

Units, dimensions and words alone are not enough: the method knowledge is what lets PEE say which sound level a dB
value is. Output: `ac-ablation-first.json`.

**Already measured in Phase272** (untouched pages, tier T2): the store's teaching, compiled into an extraction plan,
raised values found by the older extractor from 2 to 65 of 163, and decision-usable values from 1 to 45.

**Diagnosis: the newer readers do not consult the teaching at all** (0 references in the 7 modules). The most scientific
knowledge PEE holds never informs WD, QE or FC:
- taught outcomes;
- 63 `measured_by` relations;
- 81 `requires_condition` relations;
- 49 `not_sufficient_for` relations.

That knowledge informs only the older plan-guided extractors and the advice. So PEE has **two reading stacks with
overlapping responsibilities**: the one that feeds the store and the advice, and the newer shadow one that holds the
quantity knowledge, the rules and the functions. This is the duplication the skill warns against (no parallel engines).
Resolving it is an architecture question, for the owner (§6).

## 5. Criterion 4: which learning and generalisation mechanisms exist

| Mechanism | Status | What it really does |
|---|---|---|
| Inference over typed facts with proofs (KR, stratified Datalog) | **operational** (L3) | derives conclusions; its rules are written by Claude; kr.1 reproduced earlier code exactly; record (P1) and product derive genuinely new conclusions |
| Knowledge as data, reused on an unseen product (competency question CQ4) | **operational** | a relation added as data is used without code; added by Claude, not learned |
| Teaching guides extraction (older stack) | **demonstrated** (L4, T2, Phase272) | consults the store; improves the extraction of taught categories |
| Cross-category method patterns (`transferablePrinciples272`) | implemented; **effect not shown** | aggregates taught patterns into hypotheses for a new category; extraction did not improve (Phase272 §7) |
| Statistical learners (Phase123 intent, Phase131 relation classifier) | implemented, **disconnected** | trained on developer-written examples; learn labels, not rules; not used by the current reading or knowledge |
| Table lessons (1E; 1G GL1–GL10) | operational, written by Claude | versioned rules with counterexamples and ablations: Claude's learning recorded in software, not PEE's |
| Experience cases (Step 1A/1B) | operational | store and replay past situations: a regression memory, not induction |
| Rule or relation induction, hypothesis promotion (`generalization-method.md` Part C) | **proposed, not built** | — |
| Withdrawal of a conclusion when its support goes | **operational within a reading** (CQ5) | recomputed per record; derivations are not persisted (versioned reading identity, Step 3) |

**Competency questions answered by the software, with derivations** (`competency-first.json`):

| Question | Answer |
|---|---|
| CQ1: declared vs verified in use | answered |
| CQ2: why two values do not compare | answered |
| CQ3: auto-mode wattage relevant to energy, insufficient for control quality | answered |
| CQ4: a new relation used on an unseen product | answered, from data Claude added |
| CQ5: a conclusion made controversial by a contradiction, and withdrawn without support | answered |
| CQ6: unknown vs documented-different settings | answered |
| CQ7: can PEE acquire a rule by itself? | **no** |

## 6. What this changes, and what it implies for the next steps

**What it changes:**
- PEE's reading is mainly vocabulary plus code. Its inference is real but entirely hand-written. Its scientific
  knowledge works where it is consulted (acoustics: 40 of 120 values), but the richest part of it (the teaching)
  never reaches the newer readers.
- Four rules concluded more than their evidence. In the cases measured, they overstated differences in 57% of findings
  and effectiveness in 42 of 43 cases. All four are now corrected and tested.
- The decisions with the most consequence (product attribution, evidence class) use no knowledge. They are where
  errors become false knowledge (the FC review's concern about attribution).

**Implications (proposals, for R2 onward):**
1. **Owner decision (architecture):** unify the two reading stacks. Either the newer stack consults the store's teaching
   (outcomes, `measured_by`, conditions) through the same rules, or the older plan-guided extractors are retired in its
   favour. Until then, every improvement is made twice or only half-used.
2. **R2:** extend the "unknown ≠ different / relevant ≠ supports" principle to the scope negations (absence of a
   *recognised* mention), and to attribution and evidence class. That moves those decisions from code into typed
   facts and rules, with their own uncertainty.
3. **R3:** measure whether the teaching changes the newer readers' interpretation. This is the knowledge-isolation
   experiment of R1, repeated once the connection exists.
4. **R5:** PEE's first own learning mechanism. Today it has none.
