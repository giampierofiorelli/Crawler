# S80 — R3 consolidation and validation (owner decision S80, 2026-10-19)

**Roadmap step.** R3, closing consolidation R3-C, exit criteria C1–C4. Owner text, verbatim:
`.claude/skills/pee-guided-learning/references/owner-r3-consolidation-2026-10-19.md`.

**Anti-drift checklist (roadmap §4).**

| # | Question | Answer |
|---|---|---|
| 1 | Step | R3-C. |
| 2 | Kind | No new knowledge; integrity, safety, evaluation, and three general mechanism corrections. |
| 3 | Level and tier | T2 authentic controlled. Rates are over the whole sealed references. |
| 4 | Unseen data | Gains measured on set H, which was never used to build the fixes. H shares publishers and templates with D, so this is not new-publisher transfer. |
| 5 | Complexity | 1 module (rc80), 2 guards in the table grid, 1 class filter, 1 negation scope. No phrase, category or product list. |
| 6 | Negation | "Not interpreted" is closed over the request text and the recognised elements only. |
| 7 | Evidence links | No new link. |
| 8 | Integrity | First runs committed unchanged before any analysis. References sealed by hash before any run. |
| 9 | Standing warnings | No per-category fix. No new architecture. Shadow rules unchanged. |

**Who did the work.** This session alone. The session that had done S76–S79 was told to stop work on the branch
(one session per branch).

## 1. Priority 1 — system integrity (C1)

**Defect found and corrected.**

- **What happened.** This container kept a Phase249 store (schema 3, 54 category items) while the code and the
  snapshot were at schema 10.
- **Why load did not catch it.** `knowledge-snapshot.mjs load` skipped whenever a live store existed.
- **What it would have caused.** The Stop-hook `sync` would have saved the stale store over the v10 snapshot in the
  private repository.
- **Outcome.** Nothing was overwritten: the store was restored from the snapshot, and the old file was kept.

**Corrections.**

- **Journal lineage on `load` and `sync`.** Content events and schema version are compared.
  - A store that is behind the snapshot is replaced on `load`.
  - A store that is ahead (unsaved work) is kept.
  - A diverged store is kept and reported.
  - `sync` refuses to save a store that is behind or diverged.
  - 7 tests use real SQLite stores and a local git origin.
- **`src/system_integrity80.ts` and `scripts/s80-integrity.mjs`.** They give a read-only record of:
  - the store's schema, integrity and journal;
  - compiled modules older than their source;
  - the active ranking rule and validated authorisations;
  - the active cue, link-rule, quantity-knowledge and reader versions;
  - the snapshot lineage.

  The record is attached to every S80 run. Blocking findings invalidate a result. 6 tests.

## 2. Priority 2 — decision safety (C2)

- **The production entry point no longer accepts `rankingAuthorisation:'ra.1'`.**
  - Any caller could otherwise switch the unsafe rule back on (owner: never restore ra.1).
  - ra.1 stays in the trace and is still callable directly, for comparisons.
- **End-to-end guards on the full request → advice path** (`tests/s80_decision_safety.test.ts`, 5 tests):
  - a withheld pair (ra.2 would accept, ra.1 refused) never orders products;
  - the same catalog ranks once no rule refuses it (control);
  - no positive sufficiency evidence means no ranking, even where ra.1 alone would have accepted;
  - a caller cannot select ra.1;
  - machine-translated caveats that PEE holds for the answer reach no field of it (non-vacuous: the shadow returns
    them).
- **The two withheld authorisations, verified against their sources**
  (`evaluation/s80/withheld-pairs-verification.json`). Both remain withheld.
  - Dishwasher residual-soil score:
    - the protocol is only proposed;
    - the source says no single soil measures "clean", so the score is valid only for the soils it covers;
    - the replication and blinding conditions are missing.
  - Litres per completed workload:
    - it is an analytical compound, not an observed measurement;
    - its only taught condition is an energy condition;
    - the workload definition is not taught.

## 3. Priority 3 — independent end-to-end validation (C3)

**Protocol.** `evaluation/s80/protocol.json`, committed before any request (`8593f03`).

- **Requests.** Six new requests: D1 is the owner's (translated); D2, D3 and H1–H3 were written by Claude.
- **Pages.** 12 pages on 3 hosts.
  - None of the 982 previously seen URLs is among them.
  - Their products are not among the store's 200 products.
- **Network use.** 15 HTTP requests (budget 20, owner authorisation), robots and reservations checked.
- **Frozen build.** `0567e96`, run in a git worktree.
- **Reference.**
  - Written by fresh-context agents from the page text only, before any PEE output existed.
  - Same model family, so it is not independent human validation.
  - Sealed by SHA-256 (`03db5ac`).
- **Source discovery was Claude's.** PEE has no configured search service (Phase223 needs an operator SearXNG
  endpoint). This is a limit of the path, not a PEE capability.

**Path run per request** (`scripts/s80-e2e.mjs`, the build's own commands):

1. Advice before reading.
2. Reading and ingestion into a store copy.
3. Advice after reading.
4. Phase268 validation and a catalog signed with an ephemeral evaluation key.
5. Advice with that catalog.

**Scoring.**

- S3–S5 are deterministic (`scripts/s80-score.mjs`).
- S1, S2 and S6 are scored by a blind same-model judge. For H, the judge was also blind to which build produced which
  answer (key sealed before judging).

### Set D, first run (frozen build; committed unchanged)

| Stage | Result |
|---|---|
| S1 goals | D1 partial, D2 fail, D3 fail. The first failing stage is S1 in all three. |
| S3 reading | Independent test measurements found: 16/38. Declarations found: 0/29. Two TrustedReviews pages: 0 values. |
| S4 attribution | 0 values on a wrong product, but 6 pseudo-products created from table labels ("SPEED 1".."SPEED 5", "Minimum lifespan"). |
| S5 classification | 12 measured values stored as declarations (under-claims). 0 over-claims. 0 harmful validated. |
| S6 decision | No ranking (correct). Two answers said "No checkable requirement is stated yet" after dropping stated requirements: misleading. D1 with the catalog showed an ordered empty-run proxy list next to "the list is unordered". |

**What S1 dropped silently.**

- D1: "two foods at the same time", "than a conventional oven".
- D2: "on a short programme", "without using a lot of water". D2 also gained an invented drying need, inferred from
  "proper+without+wat".
- D3: "quiet enough to sleep", "25 square metre".

## 4. Priority 4 — targeted fixes (C4)

**Chosen by harm, all general.**

1. **Request coverage, rc80** (`src/request_coverage80.ts`; principle 8).
   - A clause with content words that no recognised element covers is stated as "Not interpreted" and kept among the
     unassessed objectives.
   - A number no constraint consumed is stated as "Stated but not checked".
   - The false "no checkable requirement" sentence is replaced.
   - No phrase or category list. Background sentences of long requests are skipped. Identifiers and URLs are not
     requirements. The text shows at most four parts.
2. **Negation scope** (phase248 overlap inference). A negator and up to four content words after it, up to the clause
   end, are never need evidence.
3. **spec-extractor-8** (Phase245).
   - Column headers that are settings of one product, or sentence-case property labels, never become product
     identities. This mirrors the existing row-key guard.
   - Taxonomy class names (`category-reviews`, `brands-x`) and modifier classes (`has-share-float`) are not region
     roles. They had excluded whole review articles.
4. **"The list is unordered"** is shown only with a shortlist.

**Regression checks (spent material).**

- 181 earlier requests (phase248–250 journey sets, phase266): needs 1 more correct, 0 lost, 0 decision changes.
- 0 of the 39 stored column-table products would be refused by the identity guard.
- The pages of earlier extraction gold sets are no longer held, so extraction was not re-scored on them (stated as a
  limit).
- Full suite: 4,828 tests pass.

### Set H: frozen build vs fixed build `59c96e4`, each run once (committed unchanged)

| Measure (whole sealed reference) | Frozen | Fixed |
|---|---|---|
| S1 (judge, pass=2/partial=1/fail=0, 3 requests) | 2 | 3 |
| S2 | 4 | 4 |
| S6 | 4 | 4 |
| Stated requirements dropped silently | 5 | 0 |
| S3 test measurements found | 3/33 | 7/33 |
| S3 declarations found | 5/36 | 13/36 |
| S4 values on a wrong product | 0 | 0 |
| Pseudo-products created | 0 | 0 |
| S5 over-claims / harmful validated | 1 / 0 | 1 / 0 |
| Harmful conclusions (judge) | 0 | 0 |
| Justified rankings | 0 | 0 |

D re-run with the fixed build (development: D was used to build the fixes):

- test measurements found: 16/38 → 22/38;
- declarations found: 0/29 → 12/29;
- 0 wrong products;
- 0 pseudo-products.

**C4 as defined is met:**

- H improves on S1 and on reading;
- no new wrong attribution;
- no new unjustified conclusion.

**The gain is modest, and of a precise kind:**

- PEE now **says** what it did not understand and reads more of what pages print.
- It does **not** understand more of the request.
- No answer changed decision.

## 5. What the evaluation shows about PEE's real performance

- **The first failing stage is understanding the request** (S1) in 6 of 6 requests on both builds.
  - Needs are matched on literal aliases ("save water" is an alias; "without using a lot of water" is not).
  - The taught concepts often exist (`water_per_cycle_and_workload`, `quiet_night_operation`,
    `cook_two_foods_simultaneously`), but the user's wording does not reach them.
- **No request can reach a justified ranking.**
  - Phase268 validation knows one protocol of one publisher (Expert Reviews' one-hour empty-run energy).
  - Every TrustedReviews and HouseFresh measurement is refused with `publisher_not_qualified`.
  - The only fitting new measurement (H1-b, an energy figure) was missed by the test-lead reader, which read a 5 l
    capacity instead. Validation then refused that capacity.
- **Measured test tables are stored as declarations** (under-claims: 18 on D after fixes). This is safe, but it is
  measurement evidence lost.
- **Not read:** an older TrustedReviews template with results in prose only (AEG page: 0 tables, 1 fact).
- **Evaluation catalog for non-air-fryer categories.** `compileCatalog268` does not filter by category, so the
  catalog was rejected as invalid in D2, D3, H2 and H3. The rejection fails closed, so there is no harm. It is a limit
  of the evaluation, and a defect to fix before that path is used beyond air fryers.

## 6. Does R3 close?

**No, by the owner's own condition:**

> almeno un miglioramento operativo generalizzabile della conoscenza scientifica

(at least one generalisable operational improvement of scientific knowledge).

- The S80 fixes improve honesty, reading and identity safety on unseen pages.
- None shows scientific knowledge changing a conclusion on new data.

The two highest-value next steps, both general:

1. **Need recognition that reaches the taught concepts from the user's own wording.** For example, from the
   concept's statement and measurements, with negation and comparison handled. It must be measured on new requests
   with the S80 harness, never on D or H.
2. **A second validation protocol, for a publisher whose method each page states** (TrustedReviews' measured
   water/energy; HouseFresh's room, smoke and sensor protocol).
   - This is where the taught `measured_by` relations and conditions would change a decision.
   - It needs an owner-authorised validation-policy revision (policies are owner decisions).

## 7. Files

| Area | Files |
|---|---|
| Code | `src/system_integrity80.ts`, `src/request_coverage80.ts`, `src/phase245_table_grid.ts`, `src/phase245_spec_extraction.ts` (spec-extractor-8), `src/phase248_advisory_journey.ts`, `src/phase253_request_advice.ts`, `src/phase253_advice_contract.ts`, `scripts/knowledge-snapshot.mjs`, `scripts/s80-integrity.mjs`, `scripts/s80-e2e.mjs`, `scripts/s80-score.mjs` |
| Tests | `tests/phase250_knowledge_snapshot.test.ts` (+7), `tests/s80_system_integrity.test.ts`, `tests/s80_decision_safety.test.ts`, `tests/s80_request_coverage.test.ts`, `tests/s80_table_identity.test.ts` |
| Public evaluation | `evaluation/s80/`: protocol, seal, runs, scores, judge summaries, withheld-pairs verification |
| Private (pee-knowledge) | `private-eval/s80/`: references, full runs, judge files, blind key; `policy/s80-e2e-validation-policy.json` |
