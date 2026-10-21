# G1: goal-first knowledge with diagnostic gates — report, 2026-10-21

- **Owner authorisation (verbatim):** `.claude/skills/pee-guided-learning/references/owner-g1-authorisation-2026-10-21.md`.
- **Preregistration:** `evaluation/g1/preregistration.json` (d1f1778). It was committed before any material, code or run.
- **Roadmap step served:** R3 (need understanding).
- **Answers, exclusions and ranking:** no ranking, exclusion, shortlist or evidence guarantee changed.
- **Linked from:** decision row G1-result, the roadmap entry and open debt D35. It supersedes nothing.

## 0. Outcome

**The diagnosis came first and changed the plan.**

- **Refuted premises.** The counterfactual experiments E1–E5 refuted two premises of the goal-first design as I had
  specified it:
  - **Relocating the strategies is not enough.** Taking PEE's 9 stored no-purchase strategies out of their category
    (E2) reaches the relevant strategy in 1 of 13 requests.
  - **Name-only matching does not help.** Matching by concept names instead of loose words (E4) does not reduce
    invented families; they rise from 25 to 40.
- **What blocks is not only the category key.** Three findings show it:
  - **No situation links.** The stored strategies carry no links to the situations they address.
  - **Generic needs become evidence.** Needs such as "quiet" or "noise" are stored as concepts of several families (38
    phrases), so they count as evidence for whichever family holds them.
  - **The downstream ignores the strategies.** Even when the right category is supplied (E1), the operational path
    raises the stored no-purchase strategy in 1 of 12 requests.

As the owner instructed, I stopped the affected part: the need-scoped representation and the goal-first shadow path
(arm GF). I propose the alternative in §6.

**What the diagnosis did justify was done.**

- **Six integration defects fixed on the operational path,** test-first.
- **Typed research needs for knowledge gaps, also without a category.** They stay pending authorisation, and Phase257 is
  unchanged.
- **Results on 75 sealed independent requests** (first run, unchanged):

  | Measure | Before | After |
  |---|---|---|
  | Stated limits lost | 21 of 32 | 12 of 32 |
  | Outside-knowledge requests recognised with a typed research need | 0 of 22 | 13 of 22 |
  | Harm (shortlist, exclusion or ranking changes) | — | 0 |

- **Need understanding itself did not improve.** A problem described without naming a product still reaches a relevant
  family in 3 of 13 requests. That is the open debt D35.

## 1. Store v10 vs code v14 (clarified first, as asked)

**It is not a fault.**

- **How migrations run.** `KnowledgeStore246` applies the missing migrations whenever it opens a store
  (`src/phase246_knowledge_store.ts:433-441`).
- **What v11–v14 do.** They are additive: new tables, columns, and indexes on the new tables. They do not modify data.
- **Why the live store is still at v10.** It was last written on 2026-10-19, before v11 existed (S98, 2026-10-20). Since
  then every run has used copies, and `knowledge-snapshot.mjs` opens the store read-only.
- **What happens on the next open.** The first time the current build opens the live store, it will add empty v11–v14
  structures. From then on, older builds refuse to open it (`246_store_newer_than_software`).
- **What G1 did.** G1 never opened the live store with the store class. Every experiment ran on copies under
  `~/.cache-g1/`.
- **What any operational schema change needs.** A separate admission decision, and a snapshot `sync` afterwards.

## 2. Diagnostic results (spent I3 set, 60 requests; first run committed unchanged)

**Files.**
- Public counts: `evaluation/g1/diag-firstrun.json`.
- Script: `scripts/g1-diagnosis.mjs`.
- Private detail: `$PEE_PRIVATE_EVAL_DIR/g1/diag/`.

**Relevance key.** Which no-purchase strategy is relevant to which request was decided by a blind Claude agent from the
I3 reference, without seeing any arm output (`strategy-key.json`): 13 of 60 requests have one.

**How the arms work.** Each arm changes one mechanism of C and freezes the rest. With no switch, C is identical to c.1
on all 60 requests (verified; `tests/g1_diagnosis_switches.test.ts`).

| Arm (one change) | Correct primary family | Families justified / invented | Relevant strategy reached (of 13) | Unjustified commitments | Correct object roles (of 22) | AUC justified vs invented |
|---|---|---|---|---|---|---|
| C1 (c.1) | 10 | 16 / 25 | 0 | 16 | 7 | 0.53 |
| E2 strategies as their own candidates | 10 | 16 / 21 | 1 | 16 | 7 | 0.48 |
| E3 family list from the store | **11** | 17 / 23 | 0 | 16 | 7 | 0.56 |
| E4 evidence = concept names only | 10 | 16 / **40** | 0 | **8** | 7 | 0.61 |
| E5 oracle object roles | 9 | 15 / 23 | 0 | **13** | **14** | 0.53 |
| E2+E3+E4+E5 (supplementary) | 8 | 13 / 33 | 2 | 5 | 14 | 0.59 |

**E1: the category supplied as if the shopper had named it, on the frozen operational path.**
- The reference names a catalogue family in 29 requests. The path takes the supplied category in 24 of them.
- It recognises a need in 7 of the 29.
- Of the 12 requests that also have a relevant stored strategy, it raises that strategy in **1** (through
  `no_purchase_check`).

**Post-hoc check (not preregistered; `evaluation/g1/diag-posthoc-phrase.json`).** Matching whole concept phrases instead
of single words:
- gives 8 justified families against 19 invented (C1: 16 against 25), and finds the primary family in 5 (C1: 10);
- 10 of the 19 invented families come from phrases taught under several families ("quiet", "noise", "sound"), out of
  38 such phrases.

**Gate decisions (preregistered).**

| Gate | Criterion | Result | Decision |
|---|---|---|---|
| Representation | E2 reaches ≥ 3 of the stored-alternative requests | 1 of 13 overall | **refuted:** stopped |
| Typed matching | E4 removes ≥ 30% of invented families and keeps ≥ 9 of 10 hits | invented +60%, hits kept | **refuted:** stopped |
| Integration | each defect reproduced by a failing test | 6 of 6 reproduced | **proceeded** |

**What the diagnosis shows about causes (diagnostic, spent material).**

1. **Knowledge that exists cannot be used.**
   - A stored strategy (for example "repair and ventilation come before any appliance") is one sentence. Nothing links
     it to the everyday situations it addresses (condensation on windows, black spots on a ceiling).
   - Changing its scope alone does not make it reachable (E2).
   - The downstream does not consult it even when the category is right (E1).
   - Both are **representation and integration** causes, not knowledge absence.
2. **Generic needs taught as family concepts produce invented families** (post-hoc check). This is a **representation**
   cause: a cross-category need ("quiet") must not be evidence for one family.
3. **Word-level evidence does not discriminate** (AUC 0.53, close to chance), and concept "names" are themselves
   everyday phrases, so name-only matching is still word matching (E4). This is an **algorithm** cause.
4. **Object roles matter, but modestly.** With oracle roles, correct roles go from 7 to 14 of 22 and unjustified
   commitments from 16 to 13 (E5). This is an **interpretation** cause.
5. **Integration of taught but unregistered categories** is real but small (E3: +1 correct family, 2 fewer invented).
6. **Truly absent knowledge** remains the cause for families PEE was never taught. No experiment here can change that;
   the sealed set measures it (§5).

The retrospective classes of the architectural review overstated reachability. The "stored alternative" knowledge is too
thin, a single sentence, to be reached from a described problem.

## 3. Implementation

**Operational path: integration fixes.** Each one reproduced its defect in `tests/g1_integration_fixes.test.ts` before
the fix.

| Fix | What changed | Where |
|---|---|---|
| F1 | Without a category, stated limits are kept as constraints (nothing is checked), and request coverage reports unrecognised goals as not assessed (principle 8) | `phase253_request_advice.ts` |
| F2 | Grammar, not a word list: after a buying verb an indirect object or a possessive is skipped ("buy him an automatic machine"); a phrase that begins with an auxiliary, a modal or a subject pronoun is a question form, never a product ("what can I do") | `phase248_advisory_journey.ts` |
| F3 | A clarification always asks something. When needs are recognised but none has a taught question, it asks for the shopper's own limit | `phase253_request_advice.ts` |
| F4 | A no-purchase alternative or a constraint is never offered as one of the product's goals | `phase248_advisory_journey.ts` |
| F5 | A category taught in the store but missing from the code registry is recognised by its own name only. It is never inferred from need words, and no learned alias is added | `phase253_request_advice.ts`, `CategoryEntry248.recognition` |
| F6 | Knowledge gaps without a category raise typed research needs (`missing_category_knowledge` for a named product PEE does not know; `missing_need_knowledge` for a goal no knowledge relates to), pending authorisation. Phase257's need kinds are unchanged, so they can never become a live read | `phase254_research_needs.ts` |

**Not implemented.** Raising a category's stored no-purchase alternatives whenever a problem is described.
- Without situation → strategy links, PEE would list all of the category's alternatives, including irrelevant ones
  (cooker extraction for pollen). That would hide the defect behind noise, which the owner ruled out.
- The defect stays with D35.

**Shadow: diagnosis switches on C.**
- `goal_understanding_c.ts` gains an optional `diag` with four switches: `families`, `strategyScope`, `evidence` and
  `oracleRoles`.
- Defaults are unchanged and tested.

**Tests and checks.**
- **New tests:** `g1_integration_fixes` (6) and `g1_diagnosis_switches` (3).
- **One superseded assertion:** the Phase254 test "a request with no category creates nothing" now accepts only typed,
  pending knowledge-gap needs, per the owner's G1 instruction (decision row G1-result).
- **A5 census:** reviewed and re-recorded. Two read-only `store.db` accesses were added, with no write, event or table
  change (`evaluation/a5/store-write-census.json`, `reviews`).
- **Full suite:** 5,065 passed, 0 failed.

## 4. Regression (206 spent requests)

Files: `evaluation/g1/advice-diff.json` (public counts) and `$PEE_PRIVATE_EVAL_DIR/g1/advice/` (full answers).

- **Shortlists, exclusions, ranking, category and needs:** unchanged in all 206.
- **113 answers changed, every change attributed:**

  | Cause | Answers |
  |---|---|
  | F1: not-assessed parts and stated limits kept without a category | 54 |
  | F3: a question added to a clarification that had none | 53 |
  | F4: alternatives removed from goal questions | 6 |
  | Explained F2 regression | 1 |

- **The regression (r058, a real question about skillets).** It used to be "out of scope" only because a garbled term
  ("would be recommended") happened to be read as a product. It now gets the general question.
- **An earlier F2/F5 draft** also changed four further answers for the worse:
  - a generic need word pulled tumble dryers into ambiguous lists;
  - three unknown products lost their out-of-scope answer.

  Both were corrected (name-only recognition, the grammar of indirect objects) before the freeze. This was development
  on spent material.

## 5. Independent validation (sealed G1 set, first run, unchanged)

**Files.**
- Counts: `evaluation/g1/check-firstrun.json`.
- Freeze: `evaluation/g1/freeze.json`.
- Seal: `evaluation/g1/r-freeze.json`.

**Material.**
- **Requests:** 75, by an independent Claude author agent that knew only the frozen knowledge catalogue.
- **Annotation:** two blind Claude annotators, then an adjudicator.
- **Agreement before adjudication:** category-needed 0.97, sufficient 0.97, outside-catalogue 1.00, primary-strategy
  overlap 0.76. The agreement is high; two instances of the same model explain part of it.
- **Strata (mechanical rule from the reference):** A 16, U 13, NS 9, NA 8, X 14, Z 15.
- **Tier:** T1, Claude-authored and Claude-annotated, no human validation.

**Arms.**
- **C0-before:** the operational path before the fixes.
- **C0:** the operational path after the fixes.
- **C1:** goal understanding C.
- **GF:** not run (stopped by the gate).

| Measure | Stratum | C0-before | C0 | C1 |
|---|---|---|---|---|
| M1 relevant catalogue entry reached | A (named) | 13/16 | 13/16 | 14/16 |
| | U (problem, known family) | 3/13 | 3/13 | 3/13 |
| | NS (no-purchase, known strategy) | 6/9 | 6/9 | 6/9 |
| M2 invented entries (all 75) | | 5 | 5 | 23 |
| M3 outside knowledge recognised, with a typed research need | NA+X (22) | 7 (0 typed) | **13 (13 typed)** | 16 (0 typed) |
| M3 wrong commitments | NA+X | 1 | 1 | 2 |
| M4 no-purchase and purchase both presented | eligible 9 | 1 | 1 | 0 |
| M5 unjustified abstention | A+U (29) | 12 | 12 | 10 |
| M6 expressed limits lost | all (32) | 21 | **12** | — |
| M7 questions about a user-only uncertainty | all | 40/43 | 50/54 | 48/53 |
| M7 questions carrying their cause | all | 0 | 0 | 0 |
| Harm: decision fields changed | | — | **0** | — |

**Against the preregistered thresholds.** The GF thresholds (M1 U +20 points, NS ≥ 50% and +30 points, M3 ≥ 60%,
M4 ≥ 50%) cannot be assessed, because GF was not run. For the operational path:

| Threshold | Result |
|---|---|
| M6 = 0 after the fixes | **not met:** 12 of 32 still lost, mainly named products PEE does not hold (X: 5 of 9) and limits on named categories the coverage counts as covered (A: 3) |
| M3 outside knowledge with a typed research need, on the operational path | **13 of 22 (59%)**; the GF threshold of 60% is not formally applicable |
| Harm 0 | **met** |

## 6. Stopped part and the alternative proposal (not authorised; for the owner's decision)

**Stopped.** The need-scoped representation as specified (relocating stored strategies) and the goal-first matcher by
concept names. Both are refuted by E2 and E4.

**Proposed alternative: G1b, situation-linked knowledge before a goal-first path.**

1. **Situation → need → strategy links.**
   - Purchase and no-purchase strategies, with conditions and provenance.
   - Re-derived only from knowledge PEE holds: the owner-package situation tables of **taught** categories (D1: 632
     documented situation → need relations, of which 48 survive in the store), and the 9 stored alternatives.
   - No new categories, no translation of untaught packages.
2. **Generic needs as category-independent nodes** ("quiet", "small space", "running cost") that are never evidence for
   a family. Derived from the 38 phrases taught under several families.
3. **A phrase- and role-level matcher.** Whole phrases, the N0 object roles and the shared negation scope. Evaluated
   against E4 and the post-hoc check on spent material first.
4. **The GF arm then runs once on the sealed G1 set,** which is still unspent for GF: no development used it, and only
   aggregate counts of C0 and C1 were read.
5. **Fixes still open on the operational path:**
   - the M6 residue: limits stated with an unknown named product;
   - question causes (M7);
   - the downstream consultation of stored strategies, once relevance can be decided from links (E1).

**Representation choice for G1b.** Prefer a derived, rebuildable projection over the existing tables (items,
statements, N1-style row claims on copies). Persist only after validation, as an additive table with provenance and
review. This keeps compatibility, provenance, reviews and rebuildability. No `category_id` migration is needed for the
experiment.

## 7. Limits

- The diagnosis is post hoc on spent material and uses a blind but single-agent strategy key.
- The post-hoc phrase check was not preregistered.
- **Independence of the sealed set:**
  - the author agent knew the knowledge catalogue (needed for stratification);
  - annotators and adjudicator are Claude agents; no human validation;
  - strata are unbalanced after mechanical assignment (U 13, NA 8).
- M6 and M2 for the operational path are measured by word and number overlap and by catalogue-id presence in the answer
  text. These are approximations, declared in `scripts/g1-check.mjs`.
- C1 on the sealed set is a baseline only: C was not developed further.

## 8. Prerequisites for future operational integration

- **For any goal-first output in the answer:**
  - G1b links and a phrase- and role-level matcher;
  - a GF first run on the sealed G1 set meeting the preregistered thresholds;
  - questions carrying their cause;
  - zero harm.
- **For any persistent knowledge change:**
  - an admission decision;
  - the live store opened once by the current build (v10 → v14, additive), then a snapshot `sync`;
  - G2 rebuildability covering the new structures.
- **For autonomous research:** an owner decision on Phase257 network reads. The typed research needs exist now but stay
  pending authorisation.

**Maturity and kind.**

| Capability | Before | After G1 | Kind |
|---|---|---|---|
| No silent loss without a category | — | **operational**, partial (21 → 12 lost) | integration |
| Typed research needs from gaps without a category | — | **operational**, planning only (pending authorisation) | inference |
| Recognition of taught but unregistered categories | — | **operational**, name only | vocabulary (derived from the store) |
| Goal-first path | proposed | **stopped** (refuted premise); G1b proposed | inference |
