# First increment of the coordinated plan: report (2026-10-21)

**Authorisation:** the owner's single consolidated instruction, verbatim in
`.claude/skills/pee-guided-learning/references/owner-first-increment-authorisation-2026-10-21.md`.

**Scope:** stream A (A1–A7), B (N0 essential, shadow only) and D1 (read-only scientific census). Not authorised and
not started: N1–N3, R4–R7, store structure changes, archive moves, blanket regex removal.

**Roadmap step:** R3 / R3-C (C1, C2 and the C3/C4 scoring limits), with the coordinated plan's B and D1 as
preparation for C, N1 and N2.

**Commits** (branch `claude/typescript-network-transport-test-1givnd`):

| Commit | Content |
|---|---|
| 9ec087a | Authorisation; D1 protocol registered before any judgement |
| f2e54a9 | Stream A: A1–A4, A6, A7 |
| 3ff5791 | D1 census and A5 census |
| The commit carrying this report | N0 shadow, report, records |

## 0. In brief

1. **Integrity and safety (A).** Five protections are now pinned by tests:
   - unreviewed knowledge cannot reach the answer as fact under any experimental option (A, B, C-lite), including the
     ranking path;
   - the contract records the real request path, measured rather than asserted;
   - both withheld pairs stay withheld end to end;
   - C3/C4 are recorded as scoring abstention and missing evidence while ranking is blocked;
   - the two R3-P import cycles are gone, and Node's minimum version matches what the code uses.

   The answers to 206 requests are unchanged in every field.
2. **Store census (A5).** The audit's "71 writes vs 37 events" does not mean 34 unjournalled writes: 62 of the 71
   writes append an event. The real gap is different: **the journal is an audit trail, not a source.** It carries the
   full content of almost no row.

   One guarantee exists only in the table and is decision-relevant: the independence, citation, assessor and note of
   each relation assessment (G2). No structural change was made.
3. **N0 essential (B), shadow.** One representation now separates:
   - object role;
   - content kind;
   - five stances (wanted, not needed, unwanted with strength to determine, excluded, indifferent);
   - force, provenance and epistemic status.

   It keeps `not_sufficient_for` and `requires_condition`. The mop and milk-frother counterexamples pass. A rejected
   function is represented without becoming a positive need, and the frozen path's opposite reading is reported as a
   conflict. Of the 15 inventory incompatibilities:
   - 8 are represented and tested, 3 of them by recorded owner decisions;
   - 7 are outside the essential model, each with a reason.
4. **Scientific census (D1).** The packages document 4,391 situation, need, criterion and evidence relations in 161
   tables.
   - 1,910 sit in documents never translated (robot floor cleaners, soundbars, speakers, two air-purifier
     supplements).
   - Of the 2,481 in translated documents, 266 survive in the store (151 typed, 115 untyped); 2,215 are altered,
     unrepresentable or lost.
   - The translator that wrote the store reproduces it exactly (6,118 of 6,118 statements), so the causes below are
     **demonstrated in code**, not supposed.

## 1. Changes implemented

| Item | Change | Files |
|---|---|---|
| A1 | `EXPERIMENTAL_FIELDS253` lists the fields that carry unreviewed inferences, and `withoutExperimental253` is the projection a presentation must use. The need interpretation declares `status: experimental_unreviewed` and a note that its content is not an established fact. A source scan fails when any new module or script reads an experimental field without review. | `src/phase253_advice_contract.ts`, `src/need_interpretation.ts`, `tests/i1_experimental_isolation.test.ts` |
| A2 | The contract gains a `reachability` record: the runtime import closure of the entry point (77 modules), and the modules executed per option, measured with V8 coverage and with the setup excluded. Each registered scientific module carries a measured `requestPath`. The stale R3-P claims are corrected by a dated note, and `need_interpretation` and `language_scope` are registered. | `docs/architecture/vertical-contract.json`, `tests/request_path_probe.ts`, `tests/i1_reachability.test.ts`, `scripts/i1-reachability-record.mjs` |
| A3 | Both `remain_withheld` pairs are pinned on the full path. This adds tests only; no production code changed. | `tests/i1_withheld_pairs.test.ts` |
| A4 | C3/C4 scoring limits registered and tied to the contract's blocked stages. Roadmap R3-C amendment. | `evaluation/r3c/c3-c4-scoring-limits.json`, `tests/i1_c3c4_scoring_limits.test.ts`, `roadmap.md` |
| A5 | Census only: the write and journal census, the rederivation check, and seven guarantees to preserve. The store is unchanged. | `scripts/a5-store-write-census.mjs`, `scripts/a5-rederivation-check.mjs`, `evaluation/a5/*`, `tests/i1_store_write_census.test.ts` |
| A6 | Two import cycles removed. `needKnowledge269` moved to `phase247_category_relations`, its data owner, and is re-exported from phase253 unchanged. `language_scope` reads the default scope words through `quantity_pack_file` instead of importing `quantity_knowledge`. | `src/phase247_category_relations.ts`, `src/phase253_request_advice.ts`, `src/language_scope.ts`, `src/quantity_pack_file.ts`, `tests/i1_import_cycles.test.ts` |
| A7 | `engines.node` `>=20` → `>=22.13.0` (details below the table). Lockfile regenerated by npm. | `package.json`, `package-lock.json`, `tests/i1_node_engines.test.ts` |
| B | `src/need_model_n0.ts` (shadow) builds the model from the existing readers. The only new data are general English role and stance cues. Debt D32 is registered. | `src/need_model_n0.ts`, `resources/request-semantics/need-model-n0.v1.json`, `tests/i1_need_model_n0.test.ts`, `evaluation/n0/incompatibilities.json` |
| D1 | Read-only census, with the cause trace on the store-writing translator. | `scripts/d1-relation-census.mjs`, `scripts/d1-cause-trace.mjs`, `evaluation/d1/*` |

**Why 22.13.0 and not the plan's 22.5.**
- Node 22.13.0 is the first version where `node:sqlite` runs without a flag.
- The `readOnly` option the code uses dates from 22.12.
- From 22.5 to 22.12, `node:sqlite` needs `--experimental-sqlite`, which no script passes.

## 2. Verifications run, and results

| Check | Result |
|---|---|
| A1: whole answer except the experimental field, under arms A, B and C-lite, 5 requests | Identical to the answer without the option. Non-vacuous: B infers a need in this world |
| A1: unreviewed statement text and ids | Never outside the experimental field; statement text never anywhere in the answer |
| A1: ranking path (signed catalog that ranks) under A, B and C-lite | Ranked answer identical; no statement id in `ranked` or the authorisation trace |
| A1: store CHECK constraints | Refuse a translated statement marked reviewed or usable for ranking |
| A2: reachability test on the old contract | Fails (as it should) |
| A2: stale "not imported" claim re-introduced | Fails (as it should) |
| A2: on the new contract | Passes; `knowledge_statements` and `product_facts` run only with `needInterpretation` |
| A3: the two pairs with the strongest assessment and their own conditions met | Neither orders products; decision `new_authorisation_pending_validation` (ra.2 alone would accept) |
| A3: with the basis recorded for them (same-model) | Refused earlier (`sufficiency_same_model_only`) |
| A6: runtime import cycles | Only the older phase75 ↔ phase223 cycle remains (outside this authorisation) |
| A6: equivalence | Scope vocabulary deep-equal to the pack section; one `needKnowledge269` function |
| 206-request regression vs c1588cf (before the increment): stream A | 0 fields changed |
| 206-request regression: final build | See §2.1 |
| Full suite: stream A | 5,033 passed |
| Full suite: final | See §2.1 |
| D1 column roles | Two blind annotators, Cohen's kappa 0.849; 152 disagreements adjudicated by recorded rules |
| D1 survival outcomes | Independent judge on 60 seeded units: 52/60 fine-grained, 60/60 survived-vs-not |
| D1 reproduction | Translator at 8cf307c re-run on every translated document: 3,549 of 3,549 lines and 6,118 of 6,118 statements identical to the store |
| D1 provenance | 27 of 27 translated documents match the package SHA-256; no statement line beyond its document; 1,216 of 2,020 table statements' quote hashes recomputed by the table formula (the rest come from pattern matching, whose quote is not a cell join) |
| A5 journal | Hash chain intact (0 breaks in 1,919 events) |
| N0 | 9 tests: mop stances, frother, object roles, kinds and force, relation preservation, X2, X6, X14, X15, shadow, inventory classification |

### 2.1 Final run

| Check | Result |
|---|---|
| Full suite, final build | 5,044 tests passed across 25 shards; 0 failed |
| 206-request regression vs c1588cf (`evaluation/i1/advice-diff-final.json`) | 0 fields changed in any answer |

## 3. Scientific census (D1)

**Protocol:** `evaluation/d1/census-protocol.json`, registered in 9ec087a before any judgement.

**Material:**
- 89 package documents, 8 of them byte-identical copies;
- 313 tables;
- column roles from two blind annotators plus adjudication;
- 161 relation tables (a consumer-side column and a product-side column).

**Unit:** a documented relation is a pair of cells of one row whose roles form a link: situation→need,
situation→criterion, need→criterion, criterion→evidence, need→evidence or situation→evidence.

| Category | Docs (translated) | Relation tables | Relations | Survived typed | Survived untyped | Altered | Unrepresentable | Lost | Not translated |
|---|---|---|---|---|---|---|---|---|---|
| air fryers | 21 (1) | 17 | 481 | 58 | 61 | 0 | 193 | 153 | 16 |
| air purifiers | 5 (1) | 13 | 580 | 29 | 11 | 0 | 74 | 113 | 353 |
| coffee machines | 1 (1) | 2 | 130 | 17 | 10 | 0 | 62 | 41 | 0 |
| dehumidifiers | 3 (1) | 3 | 460 | 23 | 5 | 0 | 153 | 58 | 221 |
| dishwashers | 16 (15) | 38 | 1,032 | 0 | 0 | 654 | 2 | 376 | 0 |
| televisions | 8 (8) | 34 | 388 | 24 | 28 | 0 | 34 | 302 | 0 |
| robot floor cleaners | 8 (0) | 14 | 404 | 0 | 0 | 0 | 0 | 0 | 404 |
| soundbars | 8 (0) | 6 | 80 | 0 | 0 | 0 | 0 | 0 | 80 |
| speakers | 9 (0) | 34 | 836 | 0 | 0 | 0 | 0 | 0 | 836 |
| **Total** | 89 docs (8 duplicates) | 161 | 4,391 | 151 | 115 | 654 | 518 | 1,043 | 1,910 |

Survival of the 2,481 relations in translated documents:
- 10.7% survive (266);
- 6.1% survive typed, i.e. usable by a reasoning program (151).

The R3-P figure (11 of 25 survived) came from a sample selected by request relevance, not from the whole packages; the
two are not comparable.

**By link type** (whole packages):
- situation→need: 48 survive of 632;
- need→evidence: 34 of 814;
- situation→evidence: 126 of 1,561;
- criterion→evidence: 24 of 590.

**Demonstrated causes** (code and data; the store is reproduced exactly by its translator):

| Cause | Relations | Where it is shown |
|---|---|---|
| Document never selected for translation | 1,910 | `scripts/s78-record-statements.mjs`: one file per category from `section-split.json` for air purifiers, coffee and air fryers; all TV and household-dishwasher files; the dehumidifier consolidated file. Robot cleaners, soundbars and speakers are not listed |
| Row subject is an identifier column | 654 (dishwashers) | Translator: with no subject-role header the first column is the subject; in the need atlases it is a row id (N01…). Every pair hangs off "N17" |
| Binary subject→cell design | 518 | Translator: one statement per subject→cell; a relation between two non-subject cells (e.g. need→evidence when the situation is the subject) has no slot |
| Cell header without translation role | 420 | Probe-tested header by header with the store's translator: headers outside `tableHeaderRoles` drop every cell under them |
| Row produced no statement | 276 (246 TV) | Every non-subject cell of the row was dropped |
| Cell with a role, not recognised or split | 331 | Mixed (pattern split or truncation); the mechanism per cell is not traced (hypothesis, see §4) |
| Cells present in separate statements | 16 | Both cells kept, with different partners |
| Self-check drops | 2 statements | `knowledge_statements.recordTranslation` skips statements whose rendering lost a negation (counted in the event only) |

**Provenance and knowledge status:**
- every stored statement carries document SHA-256, line, headings and quote hash;
- all are `machine_translated_unreviewed`, never ranking inputs;
- reliability class per statement type: reliable type 3,189, unreliable type 2,637, unmeasured type 292;
- only 348 of 6,118 statements (5.7%) have a category concept on either end;
- category items are all `proposed_unverified`, 278 of 284 assistant-authored.

**Dependencies on the store structure** (schema and code):
- `knowledge_statements` is binary (subject, object, parts) and has no situation, need or qualifier slot, so a
  three-way situation→criterion→evidence row cannot be one statement.
- `category_relations` has no situation→need kind (its kinds: `measured_by`, `not_sufficient_for`,
  `requires_condition`, `enables`, `may_support`, `may_risk`).
- Statements are written through `store.db` by `knowledge_statements.ts`, with one summary event per document. They
  are rederivable from (package SHA-256, translator source), not from the journal.

## 4. Hypotheses not yet demonstrated

- **Recovery would help.** That recovering the lost relations (N1) would improve need recognition on fresh requests
  is the R3-P K-lost explanation, still untested by a one-mechanism experiment. 13 of the R3-P misses had a
  reconstructed chain.
- **The 331 role-bearing cells.** For them the census shows the loss, not its exact code path.
- **Altered versus lost.** The mechanical "altered" count (654) is an upper bound: the independent judge counted 8 of
  17 sampled "altered" units as "lost".
- **The 33 items and 21 relations.** They exist only in the store (other categories, import and pilot scripts). How
  they were produced is not reproduced by code teaching.
- **N0 shadow is not evaluated.** It is tested on written counterexamples only, never on sealed requests. Its cues
  (owned, hypothesised, alternative) are untested on real phrasing.
- **D1 covers tables only.** Relations stated in prose are not counted.

## 5. Incompatibilities and residual risks

1. **The frozen operational path still reads milk_drinks from "I don't want a milk frother".** N0 represents the
   rejection and reports the conflict, but changes nothing: owner rule, shadow only.
2. **Seven inventory incompatibilities are outside the essential model:**
   - I-6 importance weights;
   - I-7 session state;
   - I-8 lane authority, which needs an owner decision;
   - I-10 sufficiency spelling;
   - I-11 type name;
   - I-13 questions, which must keep the Phase126/127 checks;
   - I-15 module header.
3. **Store guarantees before any structural change** (`evaluation/a5/guarantees.json`):
   - G2: assessment independence and citation exist only in `relation_assessments`;
   - the journal carries the content of almost no row;
   - a write-test artefact (category `pee_write_test`) sits in the persistent store, kept and not removed.
4. **The executed-module record is a lower bound.** It depends on the probe requests: `scientific_evidence98` needs
   products and a v11 store to run.
5. **One cycle remains.** The older phase75 ↔ phase223 cycle is outside this authorisation.
6. **Category recognition.** A dishwasher request worded "removes dried egg … best?" is read as another product
   (`target other`). This is an example of the R3-P category-recognition gap (stream C), seen while writing A3 and
   not changed.

## 6. Prerequisites for C, N1, N2 and later steps

- **Stream C (object, category and goal recognition):**
  - the N0 object roles exist in shadow, but are tested only on written cases;
  - C needs sealed requests (named and unnamed products) scored on role and category, before any decision effect;
  - goal → solution-family links need N1 relations.
- **N1 (recovering relations):** D1 gives the rows and the causes.
  - The table rows are recoverable from the packages by document, line and quote hash, but the store has **no slot**
    for a situation→need or need→evidence link outside a subject→cell statement. N1 needs a relation record with
    both ends and qualifiers: an owner decision on schema, after A5's guarantees.
  - Re-translating the 1,910 relations of never-selected documents is a separate, mechanical step that needs owner
    authorisation (it writes the store).
  - The 654 identifier-subject rows need the translator to take the subject from the role, not the first column.
- **N2 (selection and validation):** needs N0 integrated (stances as defeaters) and N1 relations. It is evaluated
  against false positives on sealed material.
- **A5 follow-up (structural):**
  - carry G2 row by row;
  - decide whether events should carry content (journal as source) or stay an audit trail;
  - only then make `db` private.
- **R4–R7:** unchanged. The cross-programme rule (a learned fact keeps its conditions, relations and provenance)
  applies to N1 and R4 alike, and D1 measures exactly that rule's current failure.

## 7. Maturity and kind (CLAUDE.md)

| Capability | Kind | Maturity |
|---|---|---|
| Experimental-field isolation (C2 permanent) | Safety | Operational (enforced by tests on the user path) |
| Measured reachability in the contract | Integrity | Operational (test-enforced) |
| Withheld-pair pinning | Safety | Operational |
| C3/C4 scoring limit | Evaluation | Registered |
| Store write/journal census | Diagnosis | Measured once (re-runnable) |
| N0 essential representation | Vocabulary | Proposed → shadow; not evaluated on sealed data |
| D1 relation survival census | Diagnosis of acquisition | Measured once; mechanical with independent validation |

**Learning and transfer:** none shown.

## 8. Anti-drift checklist (roadmap §4)

1. **Step:** R3 / R3-C, plus the coordinated plan's first increment (owner authorisation 2026-10-21).
2. **Kind:** integrity, safety, vocabulary (shadow) and diagnosis.
3. **Level and tier:**
   - A: T1 synthetic, plus regression on 206 spent requests;
   - D1: authentic owner material, read-only;
   - N0: T1.
4. **Unseen data:** none used, none spent.
5. **Complexity:**
   - +1 shadow module, +1 cue pack, +1 tiny pack-file module;
   - 2 cycles removed;
   - no new dependency.
6. **Negation:** N0 separates four non-wanted stances. "I don't need" is never an exclusion.
7. **Evidence links:** `not_sufficient_for` and `requires_condition` are preserved (tested).
8. **Integrity:**
   - R3-P sealed materials and originals untouched;
   - store unchanged;
   - snapshot opened read-only only.
9. **Standing warnings:**
   - no category-specific rules;
   - no parallel engine (N0 projects existing readers);
   - no archive moves;
   - no store split;
   - no regex removal.

## 9. Note added after the owner review (2026-10-21)

Owner review verbatim in `.claude/skills/pee-guided-learning/references/owner-review-first-increment-2026-10-21.md`.
Two readings of this report are corrected, without changing its results:
- **C2 "permanent".** The protections in §1 (A1) are automatic checks: the field list, the projection without
  experimental fields, and the consumer scan. A static scan does not show that every future presentation is safe. An
  explicit publication interface that exposes only authorised fields (an allow-list) is still open.
- **N0.** "8 represented and tested" means represented and tested in shadow, on written cases. It does not mean 8
  incompatibilities solved in operational behaviour. N0 is not validated on independent requests.
