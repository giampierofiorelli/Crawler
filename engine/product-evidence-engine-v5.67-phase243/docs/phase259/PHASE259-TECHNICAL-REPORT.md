# Phase259 technical report — real-data validation of source intelligence before persistence

**Date:** 2026-10-16. **Branch:** `claude/typescript-network-transport-test-1givnd`.

| Item | Value |
|---|---|
| Expectations sealed | `58165a9` |
| Checkpoint A | `66d034a`: baseline, no code change |
| Checkpoint B | `2a9258b`: corrections |
| Full suite | 4,440 tests pass, exit 0 |
| Private store | verified, unchanged |
| Reads, fetches, translation, admission, ranking | none |

## What real retained metadata holds

Retained per source record (Phase246):

- source type and whether it was asserted or inferred;
- host;
- revision id, URL, SHA-256, fetch date, current or superseded state;
- product attribution (own page or table column);
- product identity state;
- declared property names;
- host access suspensions (`host_access`: 17 restricted hosts, 403).

**Not retained for any source:**

- publisher country, language, product market;
- rights or robots policy (`policy_json` is null for all 90 sources);
- originality, method, sponsorship;
- screening decisions (`screening_verdict` is null for all 140 revisions);
- any verified contribution.

All of these stay unknown. Nothing was inferred from a domain suffix, a currency or a host.

## Results (`scripts/phase259-real-source-baseline.mjs`; `evaluation/phase259/baseline.json`, `after.json`)

**Sample:** 6 real records:

- an operator-asserted manufacturer, a heuristic-typed manufacturer, a retailer, an unknown-type source;
- a table-only product on a page shared by three products;
- an editorial source (fresh for the Phase258 code; expectations sealed before the run).

| Measure | Baseline | After |
|---|---|---|
| Real records represented safely | 4/6 (unknown and editorial types impossible) | 6/6 |
| Information lost in the descriptor | revision identity, inferred-vs-asserted type, table attribution, identity state | none |
| Unknown recorded honestly (country, language, market, rights, robots) | 6/6 | 6/6 |
| Matches with the sealed expectations (role, basis, attribution) | — | 6/6 |
| Screening decisions reusable | 0 (none persisted) | 0 (none persisted) |
| Records seen but unrepresentable, over the 19 jobs' categories | 23 | 0 |
| Selections, over the 19 jobs | 12, **all** the product's own already-read page lacking the criterion | 0 |
| Jobs reporting no fresh candidate | — | 19/19 |
| Wrong-product sources excluded | 98 | 126 |
| Already-read pages excluded | — | 17 |
| Table-only attributions excluded | — | 2 |
| Restricted hosts among job sources | 0 | 0 |
| Phase196 route (no retained text) | runs; 6 sources in 2 lanes; no lineage signal | same |

**Why 0 fresh candidates is the right answer.** Every Phase257 job concerns a value that the product's retained pages
do not declare. Re-reading those pages is reinspection (Phase255), not new research. New sources need discovery,
which is not retained and not allowed in this phase.

**Phase196 compared with Phase258.** With no text retained, Phase195 lineage has nothing to compare. My Phase258 pilot
had fed it an invented, shared corpus, which made that comparison artificial. On real metadata Phase196 sees only:

- `derived_followup` for declaring sources;
- `unscoped_review` for everything else.

Phase258's retained block keeps the distinctions Phase196 cannot express: inferred or asserted, table or own page,
already read.

## General corrections (checkpoint B, tests first)

1. **`role_unknown` and `not_retained`.** A source type that does not determine a role is represented, never
   guessed.
2. **`SourceDescriptor258.retained`** (optional, backward compatible) and **`descriptorFromRetained259`**: retained
   facts verbatim; the unretained ones stay unknown.
3. **Selection excludes, with a reason:**
   - an already-read page (`already_read_without_criterion`, `already_retained_with_criterion`);
   - a table attribution;
   - a restricted host;
   and reports `noFreshCandidates`.
4. **Product scope before URL de-duplication.** A comparison page shared by three products had folded one product's
   record into another's (found in this run).

**Regression:** the Phase258 synthetic pilot is unchanged (13/13); the Phase193, 196 and 197 suites pass.

## Persistence requirements for Phase260 (justified by this data)

The principle: **derive, don't copy.** Revision identity, source type and basis, attribution, identity state,
declared criteria and host access are already in Phase246 tables; the descriptor's `retained` block is a projection
of them. Only facts the store does not hold need persisting, all append-only through the existing hash-chained
`events` journal:

| Need | Durable form (reuse) | Why (evidence) |
|---|---|---|
| Reviewed source facts not retained today: roles beyond source type, statement kinds, publisher country, language (BCP 47), product market, specialist basis, tradition, sponsorship, originality | event `source_annotation_recorded`: source and revision (or product) scope, field, value, basis, `reviewId`, supersedes; plus one projection table rebuilt from the journal | 0 of 90 sources have any of these; 34 have no determinable role |
| Rights and robots review references | the same annotation event (field `access`) | `policy_json` is null for all 90 |
| Screening decisions (Phase193) | event `screening_decision_recorded` (`DecisionEvent193` payload); `revisions.screening_verdict` as a cache | 0 of 140 revisions have one, so no reuse is possible today |
| Source-state changes | event `source_state_changed` (`SourceStateEvent258` payload); `host_access` remains the source for 403 restrictions, not copied | 17 restricted hosts exist only as access suspensions |
| Verified contribution | event `source_contribution_verified` (validated `ContributionFeedback258`); no score columns | none exists; nothing to score |
| Supersession and recovery | events are immutable; a correction is a new event with `supersedes`; projections are rebuilt from the journal | the existing journal is already hash-chained and verified on every snapshot |

**Never persist:**

- guessed country, language or market;
- unreviewed roles;
- scores;
- declared values in public outputs.

## Limitations

- **Sample size and gold.** The sample is small (6 records), with developer expectations. The 19-job coverage is
  metadata-only.
- **No language claim.** No multilingual interpretation was tested or claimed. No real source has a known language.
- **No reuse possible yet.** Screening reuse could not be tested on real data: none exists.
