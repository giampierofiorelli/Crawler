# Original roadmap Step 3 — versioned scientific reading and safe evidence re-derivation

Date: 2026-10-17. Base: Crawler 8496f2f (Step 1D-A2 complete; frozen 1D-A2 candidate ebda3d4).
Supersedes: nothing. Linked from: `docs/plans/continuous-scientific-learning-readiness.md` (progress note, §5) and the
skill's decisions log (S46).

**Outcome.** Every plan-guided quantitative reading is now identified by the exact scientific plan and reader
configuration that produced it. A revised plan, a zero-result reading, a rollback and a rights change re-derive stored
evidence consistently. The no-plan path keeps its historical identity and behaviour byte for byte. No schema migration,
no new dependency, no new pages, no HTTP budget spent, live store unchanged.

## 1. Versioning before Step 3

| Element | Before (8496f2f) |
|---|---|
| Source revision | `rev_ + sha(url \| sha256)`: depends on the bytes only (kept; a plan change never changes the revision) |
| Spec derivation | `derivationVersion = extractorVersion + '+' + IDENTITY_RULES246` (`spec-extractor-7+identity-4`); supersedes on change (kept) |
| Test leads (Phase265) | `extractorVersion = TEST_LEAD_EXTRACTOR265` (`pee225-probe.v2+pee226-tables.v1+pee227-headers`) **whatever plan guided the reading** |
| Measurement id | `tm_ + sha(revisionId \| leadId)`: same lead id under another version hits the same row |
| Supersede | rows of another version → `superseded_by_extractor`, but only after the empty-candidate and non-retaining early returns |
| ON CONFLICT | revived `state='current'` and the version, not the derived columns |
| Comparative (Phase271) | `extractorVersion + '+cmp271'`; supersede → `superseded_by_reader`; no revival on rollback |
| Seen-again branch | identical bytes re-applied test leads and comparatives, but the retention class decision was not re-taken |

## 2. Failure modes — demonstrated versus suspected

Demonstrated by `scripts/step3-versioning-demo.mjs` (T1 synthetic, one fictional page, temporary stores), run against
the 8496f2f build (`evaluation/step3/versioning-demo-before-8496f2f.json`) and after
(`evaluation/step3/versioning-demo-after.json`):

| Scenario | Before | After |
|---|---|---|
| D1 no-plan, plan A, plan B get distinct versions | FAIL (all equal) | ok |
| D2 a value read only by plan A stays current after plan B | FAIL | ok |
| D3 a new version with zero results leaves earlier rows current | FAIL | ok |
| D4 same lead id under v2 keeps v1's method cue, condition, instrument, subject, locator | FAIL | ok |
| D5 plan A → B → A reproduces A | ok | ok |
| D6 re-derivation under a reservation now in force writes/keeps values | FAIL (1 persisted) | ok (0) |
| D7 comparative rollback v1 → v2 → v1 leaves no current row | FAIL (0 rows) | ok (1) |

Suspected, not demonstrated on authentic data: none of D2–D7 had already corrupted the live store, because no
plan-guided reading had ever been persisted there (all 12 stored rows are base-reader rows). They would have occurred
at the first plan revision.

## 3. Modules reused (no new engine, no DVC/MLflow)

- `phase272_extraction_plan.ts` — plan digest (`compiledFrom.digest`); new `planContentDigest272` recomputes it from
  the content, verified equal for compiled plans.
- `phase265_test_measurements.ts` — the existing reader and its version constant.
- `phase246_knowledge_store.ts` — revisions, `superseded_by_extractor` / `superseded_by_reader` states, the journal
  (`test_measurements_ingested`, `test_measurements_withheld`), `classDecision249` retention.
- `phase249_retention_policy.ts` — reservations and class policy, unchanged.

## 4. New identity and compatibility behaviour

- `ReadingConfiguration265` (`pee.reading-configuration.v1`): base reader, guided reader
  (`pee225-guided272.v1+pee265-cells272.v1`), plan `{schema, categoryId, contentDigest, compiledDigest,
  digestVerified}`, semantic reading (`pee.document-semantics.v1d2+tables1d2.v1` or null).
- Identity = `TEST_LEAD_EXTRACTOR265 + '+r1:' + sha256(canonical effective fields).slice(0,24)` — 75 characters, under
  the 80 limit; 96-bit digest. Only fields that change candidates are hashed (exploratory flag, category label and
  compiled label are not), so identical effective inputs give identical identities.
- Recoverable: the full configuration is written into the journal payload of every plan-guided ingest or withhold;
  `readingConfigurations265()` lists them with a `verified` recomputation; an integrity check
  `265_reading_configuration_mismatch` refuses a configuration that does not hash to its identity. An unknown identity
  (a version with no journalled configuration, e.g. the base reader or a hand-supplied version) is never attributed to
  a plan: it is not listed and never proposed for reconsideration; its rows still follow the ordinary supersede rules.
- No plan → `readingConfiguration265` returns null → identity is exactly `TEST_LEAD_EXTRACTOR265`, no extra fields.
- Store: supersede now runs before the empty and non-retaining returns; a zero-result reading that superseded rows is
  journalled; ON CONFLICT revives a `superseded_by_extractor` row with all derived columns of the new reading; the
  seen-again branch re-takes the class decision (a reservation now in force withholds, journalled with the
  configuration).
- Comparative results keep the base reader version (plans do not change them), are revived on rollback
  (`ON CONFLICT … WHERE state='superseded_by_reader'`) and journal `comparative_results_superseded`.
- `readingsToReconsider265(plansNow)` lists revisions whose stored reading identity differs from the current plans
  (re-derivation candidates; it re-derives nothing by itself).
- The Step 1D-A2 table reader stays evaluation/shadow-only; its persistence gate is unchanged. The semantic field is
  part of the identity so that, if it is ever authorised, it cannot share a version with a reading without it.

## 5. Tests

- `tests/step3_versioned_reading.test.ts`: 11 tests, all pass: identity (no-plan legacy version and output unchanged;
  relabelled plan → same identity, label unverified); same plan no-op; revised plan; changed semantic configuration;
  zero-result reading; same lead id under another version (every ON CONFLICT column); rollback with reconsideration;
  rights in force on re-derivation; expired pending-rights never revived; configuration/version mismatch refused;
  comparative results (plan-independent, reader rollback revives, empty reader leaves none current). Unknown identities
  are exercised by hand-supplied versions in the collision and rights tests.
- `scripts/step3-store-copy-rederivation.mjs` (T2 authentic controlled: the 17 retained air-fryer revisions on a copy
  of the live store; `evaluation/step3/store-copy-rederivation-step3.json`): S0 12 base rows; S1 no plan 10 already
  stored + 2 new; S2 plan A 87 current (2 base superseded); S3 same plan again no-op; S4 plan B 83 current (4 A rows
  superseded); S5 rollback to A equals S2; S6 rollback to no plan equals today's no-plan reading (12). 9/9 checks true:
  no-plan keeps every stored row, same plan no-op, revised plan distinct, rollback reproduces, each step current =
  its reading, no-plan rollback reproduces, comparatives unchanged by plans (87), no values in non-retaining rows,
  journal ok throughout. Reconsider list under a changed plan: 14 revisions / 87 measurements. Live store SHA-256
  unchanged.

## 6. No-plan equivalence and regressions

| Check | Result |
|---|---|
| No-plan reading equivalence before/after | 54/54 identical |
| Step 1C reproduction | 7/1/13/55, as committed |
| Step 1D-A2 evaluation rerun (frozen candidate) | identical to dev1, 0 differences, all arms |
| Replays with the semantics policy | identical to 1D-A2 (1A 9/0/4/5; 1B 1/0/4/1) |
| Default-build replays before/after Step 3 | identical (1A lost 1 = EX-05; 1B lost 1 = EX-19, both pre-existing) |
| Focused suites | 96/96 |
| Full suite | 4,595 passing |
| Live store | unchanged (`5dd1e763…5607`) |
| Ranking, signing, approval | unchanged, disabled for Phase265 rows |

No success lost; results are deterministic (repeated runs give equal digests).

## 7. Migration and retention concerns

- No schema migration: identities fit the existing `extractor_version` column; configurations live in existing journal
  payloads.
- Re-derivation never invents links: in S6 two Ninja DoubleStack rows became `subject_unresolved` under today's
  reader, as the reader dictates.
- New open debt **D12** (`vertical-contract.json`): base-reader drift. Today's no-plan reader no longer produces 2 of
  the 12 stored rows and produces 2 new ones; Step 3 identifies readings by plan, but a base-reader code change without
  a version bump is still invisible. Bumping `TEST_LEAD_EXTRACTOR265` is the existing remedy; it is not done here
  (that would change the historical identity the brief requires to be kept).
- Retention: a re-derivation under a reservation now in force writes no values and supersedes the earlier current
  rows (D6). Earlier withheld rows are never resurrected by a rollback.

## 8. Is Step 3 complete?

Yes, within its scope: versioned identity, recoverable configuration, supersede/revive on revision, zero results and
rollback, rights on re-derivation, comparative rollback, legacy equivalence, demonstrated on synthetic and authentic
retained data. Remaining known limit: D12.

## 9. Step 4 prerequisites

- A decision on D12 (when and how to bump the base reader version, and re-derive the 12 live rows).
- An owner decision on whether any plan-guided reading may be persisted to the live store (none is today).
- Step 1D-B (untouched test of the frozen candidate) still needs an HTTP authorisation.

## 10. Step 2 status

Development-only, not complete. Nothing in Step 3 changes that.

## 11. Not done (by instruction)

No ranking, approval, signing, release or teaching; no retuning of attribution, inventory, tables, qualitative reading
or vocabulary; no new pages; no Step 1D-B budget; no Step 4.
