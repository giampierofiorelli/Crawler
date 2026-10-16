# Phase260 — Minimal Persistent Source Memory

**Date:** 2026-10-16. **Base:** Phase259 HEAD `63274e2`. **Branch:** `claude/typescript-network-transport-test-1givnd`.
**Checkpoints:** A `6cac8c3` (migration and journal integration); B in the final commit (in-transaction validation,
recovery and regression tests). **Evidence tier:** T1 (developer tests and a real-data compatibility check; no
held-out evaluation applies).

## 1. Result

The four-event design from the Phase259 report is implemented in full, with no new store and no new framework.

- **Authority:** the existing Phase246 hash-chained `events` journal, which gains four kinds:
  - `source_annotation_recorded`;
  - `screening_decision_recorded`;
  - `source_state_changed`;
  - `source_contribution_verified`.
- **Projection:** the new `source_memory260` table (store migration v4), rebuilt deterministically from the
  journal.
- **Module:** `src/phase260_source_memory_store.ts`.
  - Writes go through `recordSourceMemory260`.
  - Rebuilding and recovery use `rebuildSourceMemory260`, `recoverSourceMemory260` and `checkSourceMemory260`.
  - Reads use `descriptorWithMemory260`, `screeningLedger260`, `sourceStateLedger260`, `contributions260` and
    `sourceMemory260`.

**On the real store.**

- The live store was migrated to v4 after the migration had been verified on a copy.
- The projection is empty: **no record was written**. No review was manufactured and no observation was modified.
- The snapshot is synced and verified as pee-knowledge `252f92f`. The private README line about the schema was updated
  in `32f7b2d`.

## 2. Reuse (what is not rebuilt)

| Need | Reused | How |
|---|---|---|
| Durable, tamper-evident history | Phase246 `events`, `store.event`, `verifyJournal`, append-only triggers | Memory events share the existing chain. Replay runs only after the chain verifies. |
| Migration | Phase246 `MIGRATIONS`, applied in one transaction | v4 adds one table, one index and three triggers. No existing table is altered. |
| Screening rules | Phase193 `recordScreening193` and `lookupScreening193` | The ledger is rebuilt from the journal. Phase193 keeps its scope, revision, policy, market, order and supersession rules. |
| Source states | Phase258 `recordSourceState258` | 404 and 503 are temporary; only an operator retires a source; a move creates a new id. |
| Contribution feedback | Phase258 `validateFeedback258` | No scores, no agreement flags. |
| Annotation meaning | Phase258 `validateSourceDescriptor258` and Phase259 `descriptorFromRetained259` | An annotation must leave a valid descriptor, together with the annotations already active for the same record. |
| Review trust | The Phase246 receipt-and-verifier pattern (`reviewProductIdentity246`) | A claimed review is accepted only if the operator's verifier accepts it. |

**Never copied.** These stay in their canonical tables and are read live, never written by Phase260:

- source identity and type;
- revisions (URL, SHA-256, state);
- product links and attribution;
- declared criteria;
- identity states;
- retention and rights policy (`sources.policy_json`);
- access suspensions (`host_access`).

A memory record only points at them, and they are checked when the record is written:

- the revision must belong to the source;
- the product must be linked to the revision, or to the source for feedback;
- a publisher-bytes screening decision must carry the revision's hash and URL.

## 3. Safety rules as implemented

- **Trust basis is explicit.** Each record has a `basis`:
  - `operator_annotation`: an operator's claim. Its `reviewId` is a reference, not proof, and the descriptor
    carries the limitation `operator_annotation_unverified`.
  - `verifier_accepted`: the operator's verifier accepted the review claim. This is attributable, not authenticated.
  - `unverified_claim`: for example a Phase193 `annotated_research_trial`. It never enables screening reuse.
- **No default verifier exists.** A human screen, a retirement, a `reviewed` state, contribution feedback, an
  `independently_verified` annotation and any permissive access annotation are all refused without one.
- **Unknown stays unknown.** Recording `und`, `unknown`, `role_unknown` or `not_retained`, or any value equal to the
  retained default, is refused as no information. A retraction (`value: null`) must supersede an annotation; it
  returns the field to unknown and ends that chain.
- **Roles add to the canonical source type and never replace it.** The canonical source type is changed only by the
  existing Phase253 classification.
- **Append-only, with explicit supersession:**
  - an annotation or contribution that replaces an active one must name it;
  - states and screenings supersede by their own ledgers' keys;
  - nothing is deleted.
- **Changed and moved sources inherit nothing.**
  - Annotations are bound to one revision, so a new revision of the URL starts empty.
  - A `changed` state voids earlier annotations of the source; the descriptor then carries
    `source_changed_re_review_required`.
  - A `moved` source's successor id has no state, review or feedback.
- **Temporary failures are not retirement.** 404, 503 and similar statuses can only set `temporarily_unavailable`.
  A 401 or 403 is refused as a source state, because those are recorded by the existing `recordAccess246` as
  reversible host suspensions.
- **The projection is read-only.** Triggers refuse INSERT, UPDATE and DELETE outside the module's own transaction.
  CHECK columns fix `evidence_admitted`, `access_authorized` and `ranking_authorized` at 0.
- **Every write is atomic and serialised.** Validation, the idempotency check, the journal event and the projection
  update share one `BEGIN IMMEDIATE` transaction.
  - An identical retry returns `already_recorded`.
  - The same id with other content is refused.
  - A memory event appended outside the module is detected by `checkSourceMemory260` and absorbed by
    `recoverSourceMemory260`. If its meaning is invalid, everything fails closed.
- **Unchanged gates.**
  - The protected operator research policy (Phase257) remains the only access authority.
  - The source-access checks (robots, terms, rights, suspensions) and Phase180 ranking are unchanged.
  - Selection stays a dry run with `fetches: 0`.

## 4. Verification

**Tests: `tests/phase260_source_memory_store.test.ts`, 12 tests, all passing.** These cover the brief's ten items
plus two regression cases.

| Brief item | Test |
|---|---|
| 1–3: create, persist, close, reopen, recover | "1-3" |
| 4: supersede without losing history | "4"; retraction as well |
| 5: rebuild the projection from the journal | "5": rebuild is deterministic and identical to the incremental table; direct writes are refused |
| 6: refuse malformed, cross-product and unauthorised claims | "6": 26 refusals. None reaches the journal. |
| 7: detect tampered history | "7": replay, rebuild, recovery and recording all refuse |
| 8: preserve Phase246 records through migration | "8": v3 → v4 leaves canonical content and the journal identical; a newer store is refused |
| 9: Phase193 scope and revision rules | "9": reuse only for the same bytes, policy and market; a trial never enables reuse; order rule kept |
| 10: rights, ranking and evidence gates unchanged | "10": canonical tables hash-identical after all four kinds; flags 0; declarations unchanged |
| Changed, moved, temporary | the source-lifecycle test |
| Interruption, idempotency, recovery, import | the recovery test: fault after the journal append rolls back; export/import rebuilds an identical projection |
| Concurrency | two connections cannot both supersede one record |
| Fail-closed | a well-chained but invalid event (404 retiring a source) blocks replay and recording |

**Other checks.**

- **Real-data compatibility** (`scripts/phase260-real-store-compat.mjs`, output
  `evaluation/phase260/real-store-compat.json`), run on a copy outside Git:
  - migration 3 → 4 with 0 canonical tables changed;
  - journal 1,373 events, verified;
  - projection empty and consistent before and after rebuild;
  - all 189 retained (revision, product) links give a descriptor identical to Phase259's.
- **Regression:** `phase246`, `193`, `249`, `252`, `257`, `258`, `259` and `260` together: 129 of 129 tests.
- **Full suite** (`npm test`), run once after implementation: **4,452 tests passed**, exit 0.
- **Store:** `knowledge-snapshot.mjs verify` passes:
  - remote `252f92f`, live content matches the remote;
  - integrity and journal OK;
  - 90 sources, 140 revisions, 189 products, 2,385 declarations, 1,374 events. The extra event is an earlier
    `backup_written` entry, not a memory record.

## 5. Defects found and fixed during the phase

1. **Validation ran outside the write transaction** (my own review, before any push). Two writers could both validate
   a supersession of the same record and leave a journal that could not be replayed.
   - Validation now runs inside `BEGIN IMMEDIATE`.
   - A supersession that no longer matches an active row aborts the transaction.
   - A two-connection test covers it.
2. **A test fixture had silently fallen back to metadata-only retention.** Its robots check was older than the Phase75
   freshness rule allows, so no declaration was retained. The assertion "declarations remain unchanged" passed
   vacuously until it was also made to require at least one declaration. The fixture now uses a fresh robots check.
3. **Retractions were treated as active annotations.** A retraction is now history: it ends its chain.
4. **The descriptor's inputs could diverge from Phase259.** The descriptor first counted only current declarations and
   used `revision_properties` labels, which differ from the Phase259 inputs validated on real data. It now uses the
   same inputs, and the 189/189 equality check confirms it.

## 6. Limitations (stated plainly)

- **Integrity, not security.**
  - A local writer with database access can drop the triggers. This is also true of the existing append-only events.
  - The chain is tamper-evident, not authenticated.
  - `verifier_accepted` means the operator's verifier accepted a claim; it is not a signature.
- **No operator tooling.** There is no command-line tool for operators to record reviews or annotations. None was
  needed, and none was used on the real store.
- **Annotation scope.**
  - Annotations are per revision, so a source-level fact such as publisher country is restated per revision. This is
    deliberate: a changed page must not inherit.
  - Criterion-scoped annotations are stored but not merged into the descriptor, which has no per-criterion fields.
- **Screening verdict cache.** `revisions.screening_verdict` is not written. Callers derive the verdict from
  `screeningLedger260`, which can be passed to `ingestObservation246`. This supersedes the Phase259 "cache" note.
- **Replay cost.** The Phase193 ledger replay is quadratic in the number of screening decisions. That is acceptable
  at today's count (0), but should be revisited above a few thousand decisions.

## 7. Phase261 proposal (not implemented)

The highest-priority gap is still new-source discovery: 19 valid jobs, 0 fresh candidates. The proposal is to
investigate the smallest connection from Phase257 jobs to the existing discovery facilities:

- `phase75_source_discovery.ts`: sitemap discovery, only for policies cleared for metadata discovery;
- `phase82_market_watch.ts`: scheduled watch of upstream-cleared metadata channels;
- `phase220_autonomous_discovery_worker.ts`: the vertical slice through Phase82 and Phase75 with an operator
  registry.

Candidates would become `discovered` source states and unverified leads in Phase260 memory, never identities,
evidence or permissions. See `CONTINUATION-PROMPT.md`.
