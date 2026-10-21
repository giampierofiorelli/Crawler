# Coordinated plan after R3-P, integrating the external architecture audit (2026-10-21)

**Status:** proposal for owner decision. It is read-only work: no code, knowledge, store or test was changed.

Sources:
- **Owner decision:** verbatim in `.claude/skills/pee-guided-learning/references/owner-decision-post-r3p-and-audit-2026-10-21.md`.
  That file also holds the forwarded external audit (Part A).
- **R3-P report:** `docs/plans/r3p-negation-and-needs-pilot.md`.
- **Needs research:** `docs/plans/needs-reasoning-research.md`.
- **N0 inventory:** `docs/plans/needs-model-inventory-n0.md`.
- **Roadmap:** R3 / R3-C, R4–R7.

One programme, one session per branch (owner S80). Streams are ordered by dependency, not by "finish one before the
next".

## 0. In brief

1. **Of the audit's 5 blocking findings:**
   - 3 are verified (C2 test gap, vertical contract wrong, decision stage blocked);
   - 2 are partially confirmed (the "300 code word lists" is the right order of magnitude; the withheld pairs are
     recorded but not pinned by a test).
   - No verbatim machine-translated text was found in answers.
   - The `needInterpretation` field carries needs inferred from unreviewed statements and cites their ids, documents
     and lines. Only evaluation scripts read it; no presentation layer consumes it. The risk is therefore latent, not an
     observed exposure.
2. **Of the structural findings,** most are verified, with corrected counts. Two of the three import cycles, and the
   stale contract entry, were introduced by R3-P stage 2 itself; Claude reports this as its own debt.
3. **The plan** has seven streams:
   - A: integrity and safety;
   - B: N0 essential model;
   - C: object, category and goal recognition;
   - D: relation conservation, N1, together with the store's journal and rederivability;
   - E: selection and validation, N2/N3;
   - F: document reading R4 with extraction and attribution;
   - G: evaluation infrastructure.

   R5–R7 stay the declared destination. Nothing in the plan is code cleanup for its own sake: every structural item is
   tied to a capability it unblocks.
4. **Proposed first increment, for authorisation:**
   - stream A in full (small, test-first);
   - the N0 essential model in shadow;
   - a read-only N1 survival census over the full packages.
5. **Not proposed now (owner):** archive moves, a store split, blanket regex removal.

## 1. Verification of the external audit

Classes: verified, partially confirmed, superseded, not demonstrated. Every row was checked by the main session on the
current code (branch head 6969977 and frozen build 58676ef).

### 1.1 Findings presented as blocking R3-C

| # | Finding | Class | Evidence |
|---|---|---|---|
| A1 | The C2 machine-translation test runs only with default options | **Verified**, with a qualification | `tests/s80_decision_safety.test.ts:105` calls `adviseFromRequest253(..., {})` |
| A2 | The contract says `knowledge_statements` and `product_facts` are on no user path; both are imported at runtime; the contract test checks exports, not connections | **Verified** | Contract: "none on any path" and "evaluation scripts only". `need_interpretation.ts:20,23` import `statementsOf` and `loadProductFunctions`; `phase253_request_advice.ts:13` imports `interpretNeeds` and `:25` imports `caveatsAbout` |
| A3 | Knowledge cannot change a decision; C3/C4 can only score intermediate fields | **Verified** | Contract stages `evidence_validation`, `comparable_assessment` and `authorised_ranking` are `blocked` |
| A4 | About 300 regex and word-list constants act as knowledge in code; a clean knowledge-vs-words ablation is not possible | **Partially confirmed** | 216 top-level regex constants and 85 word-list sets in `src/` |
| A5 | The two withheld pairs have no recorded status | **Partially confirmed** | Status recorded, but not pinned by a test |

Detail per finding:

- **A1.** Probe (5 requests, option off and on; all 13,410 stored statement fragments of 25 characters or more
  searched): no statement text appears verbatim in any answer.
  - With the option on, the answer carries needs inferred from unreviewed statements and cites statement ids,
    `document:line` and reliability class.
  - No presentation layer consumes `needInterpretation`: only `phase253` sets it, and only `scripts/r3p-needs-*.mjs`
    read it.
  - Verdict: a test gap and a latent exposure, not an observed one. The probe is small.
- **A2.** The stale entries come from R3-P stage 2, which added these imports without updating the contract (Claude's
  own debt).
- **A3.** Already known since S80 ("no request can reach a justified ranking"), but not yet written into a
  preregistered C3/C4 scoring.
- **A4.** On the request path:

  | Module | Regex literals | Word sets |
  |---|---|---|
  | `phase248` | 42 | 6 |
  | `phase253_request_advice` | 29 | 2 |
  | `phase253_request_constraints` | 29 | 0 |
  | `quantity_knowledge` | 49 | 6 |
  | `phase125` | 14 | 0 |

  Some are grammar, not domain knowledge, so "all knowledge" is an overstatement. The ablation limit is real.
- **A5.** Both pairs are recorded as `remain_withheld` in `evaluation/s80/withheld-pairs-verification.json` (S80; a
  same-model reading). The release rule is tested generically (`new_authorisation_pending_validation`), but no test
  pins these two live-store pairs.

### 1.2 Structural findings

| # | Finding | Class | Evidence |
|---|---|---|---|
| S1 | `KnowledgeStore246` is a god object; direct writes far exceed journal events; only one table is rebuildable; `db` exposed; other modules write through it | **Verified** (counts differ) | 1,590 lines. About 100 method-like members (audit: 65). 71 direct writes (audit: 82; counting methods differ). 37 `this.event(` calls. `readonly db` is public (`:405`). Writes through `store.db` from `knowledge_statements` (2), `phase247_category_relations` (4) and `phase260_source_memory_store` (6). Only `source_memory260` is a read-only projection of the hash-chained journal |
| S2a | 5 legacy SQLite stores plus a Postgres path | **Verified** | Own `DatabaseSync` in phase101, 104, 105, 108 and 109; `db_adapter.ts` |
| S2b | 9 table readers, 8 discovery modules, about 7 unit vocabularies | **Partially confirmed** | 10 table-named modules, but 1E/1G files are layers of one reader, so "9 readers" overstates. 24 discovery, search and research modules, so the audit's 8 undercounts. Unit vocabularies not counted |
| S2c | `src/index.ts` exports the old path, not phase253/phase246 | **Verified** | `index.ts` has 0 references to phase253 or phase246 |
| S3 | Three runtime import cycles | **Verified** | See below |
| S4 | Navigation is hard | **Verified** | 229 of 304 source files phase-named; 279 phase scripts; 482 root files match manifest, continuation or release patterns (more than the audit's "about 110"); directory named `phase243` |
| S5 | `engines` says `>=20` but `node:sqlite` needs 22.5 or later | **Verified** | `package.json` `{"node":">=20"}`; the container runs 22.22 |
| S6 | Most tests use built inputs; about 400 evaluation scripts | **Partially confirmed** | 400 scripts confirmed; "most tests" not counted |

The three cycles in S3:

| Cycle | Imports | Origin |
|---|---|---|
| `need_interpretation` ↔ `phase253` | `need_interpretation.ts:25` ↔ `phase253_request_advice.ts:13` | Introduced by R3-P |
| `quantity_knowledge` ↔ `language_scope` | `:18` ↔ `:15` | Introduced by R3-P |
| `phase75` ↔ `phase223` | | Older |

**Superseded:** none. **Not demonstrated:** the "about 7 unit vocabularies" count, and the claim that the store
"calls extraction and discovery code" (not checked here).

### 1.3 How the audit meets R3-P (the owner's mapping)

| R3-P result | Audit finding | Link |
|---|---|---|
| Category and goal not recognised (63/90) | Old request-to-advice paths; `index.ts` exports the old path; Phase125 on the path | Recognition is spread over phase248 regexes, Phase125 and registry aliases; no single owner (stream C) |
| Relations lost in acquisition (14 of 25) | Store god object; most writes not journalled; one rebuildable table | Untested hypothesis: translation writes statements through `store.db`, not through journalled methods, so a lossy derivation cannot be replayed or audited. Stream D measures this before designing N1 |
| Incompatible need representations | Duplicate modules | The N0 inventory (15 incompatibilities) is the concrete map (stream B) |
| Inferences from unreviewed knowledge | A1 | Stream A, test with the opt-in options on |
| A/B experiments not clean | A4 | Stream G classifies code word lists into grammar and domain knowledge before any knowledge-vs-words claim |
| Existing capabilities unused | A2 | A reachability check makes the contract describe the real path |

## 2. The coordinated programme

### Stream A: integrity and safety (R3-C C1/C2; can start now)

1. **C2 under all options.** Extend the C2 test to every opt-in option (`needInterpretation` with A, B and candidates,
   `ranking`).
   - Assert that no stored statement text reaches the answer.
   - Decide, as an owner decision, whether statement ids and `document:line` citations of unreviewed knowledge may
     appear in an experimental field. Default proposal: allowed only inside `needInterpretation.trace` and marked
     experimental.
   - Assert that no presentation consumer reads `needInterpretation`.
2. **Reachability in the contract test.** Compute runtime imports from the advice entry point and compare them with
   each module's declared status. Fix the two wrong entries (`knowledge_statements`, `product_facts`).
3. **The two withheld pairs.** A test pins both live-store pairs to `remain_withheld` until a recorded validation
   changes them.
4. **C3/C4 scoring note.** Preregister that with evidence validation and ranking blocked, the decision stage scores
   only "precise missing evidence" or "justified abstention", never ranking.
5. **Store write discipline, test-first and measured before any change.**
   - List every write not covered by a journal event, and every external write through `store.db`.
   - Then route the external writes through store methods.
   - `db` becomes private only after the list is empty, with an equivalence test on a store copy (C1).
   - No store split.
6. **The two R3-P cycles.** Move `needKnowledge269` and the scope-vocabulary loader to the modules that own them
   (behaviour-equivalent; regression on the 206 requests).
7. **`engines`.** Set to `>=22.5`.

Exit: all C2 and C1 tests pass with the opt-in options on, the contract reflects the real path, and the 206-request
regression is unchanged.

### Stream B: N0 essential (semantic prerequisite; after A2 lands)

- **One model of the request's object and stance:**
  - object role: requested, owned, context, hypothesised, alternative;
  - content kind: outcome, quality, constraint, function, feature, property, context, obstacle;
  - stance: wanted, not needed, unwanted (with strength), excluded, indifferent;
  - basis and force, under the rules already decided (owner N0-design review).
- **A rejected-feature slot in the answer contract.** An explicit exclusion uses the Phase168 "verify absent for exact
  variant" operation.
- **Reuse, not rewrite.** Build on `need_interpretation`, `phase253_request_constraints` and `language_scope`, and
  absorb valid distinctions from Phase56/61/168. Phase172 is not reused as is: R3-P showed its rules misread noise as
  refrigerator noise.
- **Exit:**
  - the N0 inventory's semantic incompatibilities resolved one by one, each by a recorded owner decision;
  - equivalence tests for the duplications;
  - the counterexample suite of NR §8 (including the four mop/frother stances) passing;
  - no loss of `not_sufficient_for` or `requires_condition`.

### Stream C: object, category and goal recognition (uses B)

- **Not more synonyms (owner).** Separate the requested product from owned, context and hypothesised objects ("the
  dishwasher runs while we watch telly").
- **When no product is named,** propose candidate solution families with their basis, and ask, rather than fix a
  category.
- **Goal → solution-family links** come from knowledge (the packages' situation tables, at category level). They need
  stream D's re-derivation; until then only object-role recognition proceeds.
- **Exit:** on new sealed requests:
  - category, or the decision to ask, is correct;
  - no context object becomes a product;
  - the result is reported for named and unnamed requests separately.

### Stream D: conservation of scientific relations (N1) with the store's rederivability

1. **Read-only census first.**
   - Over all owner packages: how many situation/criterion/evidence rows exist, and how many survive in the store in
     usable form (the R3-P measure, 11 of 25, extended to all packages).
   - How the translation (`knowledge_translation.ts`) writes them: journalled or direct.
2. **Then re-derivation of the lost relations** from the package rows:
   - by document, line and quote hash;
   - claim level `teaching_relevance` (owner-admitted);
   - concept-gap records where no concept exists;
   - S103 admission;
   - unvalidated clinical inferences blocked, while study-supported health knowledge stays acquirable (owner).
3. **The relation between journal coverage and loss** is tested, not assumed.

Exit: survival measured before and after on the same rows; every new relation with provenance and status `proposed`;
the store remains rebuildable for the new rows.

### Stream E: selection and validation (N2, N3)

- Hypothesis groups, defeaters and statuses replace the cap of one only after validation against false positives
  (owner).
- K-incorrect inferences from incidental words are a stop condition.
- N3: preregistered evaluation with a category unused in development; real and authored tiers reported separately.

### Stream F: document reading, extraction, attribution (R4; continues independently)

- R4 (evidence linking across the whole document) keeps its meaning and proceeds on its own track.
- It shares only the store-write discipline of stream A and the provenance fields of stream D.

### Stream G: evaluation infrastructure

- A label vocabulary covering all concept kinds (the R3-P `milk_drinks` artefact).
- A better source of real purchase questions.
- Classification of code word lists (A4) into grammar and domain knowledge, so that later A/B claims can name what is
  switched off. Moving domain lists into packs happens inside B and C as their consumers are consolidated, never as a
  blanket removal.

### Destination (unchanged): R5–R7

R5 (rule learning), R6 (transfer), R7 (use in advice) stay the declared destination. Streams B–E supply their
prerequisites: typed relations with provenance, a single need model, a selection mechanism validated against false
positives.

### Not proposed now (owner)

- moving files to `archive/`;
- splitting `KnowledgeStore246`;
- blanket regex removal;
- renaming the engine directory.

They need a dependency analysis first and would not unblock a capability now.

## 3. Dependencies

```
A (integrity/safety) ──► B (N0 essential) ──► C (object/category/goal)
        │                       │                    ▲
        └──► D1 census ──► D2 re-derivation (N1) ────┘ (goal→family links)
                                │
                                └──► E (N2 selection, N3 validation) ──► R5–R7
F (R4 reading) runs alongside; G supports every evaluation.
```

## 4. Proposed first increment (for owner authorisation)

| Item | Kind | Exit | Stop if |
|---|---|---|---|
| A1–A7 | Integrity (test-first) | Tests green with opt-in options on; contract reachability; pairs pinned; 206-request regression unchanged | Any behaviour change on the request path not explained |
| B: N0 essential model, shadow | Vocabulary and inference | NR §8 suite; inventory incompatibilities each closed by a decision; no relation kind lost | A semantic choice not covered by an owner decision |
| D1: survival census (read-only) | Diagnosis | Per-package survival table with document, line and store id | — |

## 5. Preservation of the R3-P originals (owner question)

**Current state.** `pee-knowledge/private-eval/r3p/` holds the R3-P material with text and label fields replaced by
SHA-256 (commit 6e374a5). The full originals exist only in this container (`$PEE_PRIVATE_EVAL_DIR/r3p/`):
- 42 Claude-authored requests;
- 7 Stack Exchange questions;
- the annotations, references and run rows.

A direct full copy was refused by the session's automatic permission check; it was not retried or worked around.

**Rights review:**

| Content | Status |
|---|---|
| Claude-authored requests, annotations, adjudications, run rows | PEE's own work; no third-party rights |
| The 7 Stack Exchange questions | CC BY-SA 3.0/4.0, obtained through the official API; redistribution permitted with attribution and share-alike; each record carries author, link and licence |
| Page bytes, third-party articles | None |

Keeping these in the **private** repository is within the licences and within PEE's retention rules.

**Options:**
1. **Recommended.** The owner explicitly authorises a full-text copy of `$PEE_PRIVATE_EVAL_DIR/r3p/` (needs,
   negation, runs, dev; not the store copies) into `pee-knowledge/private-eval/r3p-originals/`, with a CLAUDE.md row.
   The session's permission prompt must then be approved by the owner; it is not bypassed.
2. Keep the hashed copy only. The experiment stays verifiable but not re-examinable.

## 6. Anti-drift checklist (roadmap §4)

1. **Step:** R3 / R3-C, with the R3-P findings; streams B–E are proposals pending authorisation.
2. **Kind:** verification and planning.
3. **Level and tier:** none (no runs). The A1 probe is 5 constructed requests.
4. **Unseen data:** not applicable.
5. **Complexity:** none added.
6. **Negation:** not applicable.
7. **Evidence links:** each audit verdict cites `file:line`.
8. **Integrity:** no first run touched.
9. **Standing warnings:**
   - no per-category fixes (stream C refuses synonym lists);
   - no new architecture (reuse);
   - preserve materials (§5);
   - shadow until R7.
