# S86 — Shared scientific quantity understanding across extraction (owner decision S86, 2026-10-19)

**Scope.** This is the extraction slice of intervention A (S84/S85): the quantity knowledge (QK) that types user requests since S85 now also types what the operational readers extract from pages.

**Owner brief, verbatim:** `.claude/skills/pee-guided-learning/references/owner-s86-extraction-quantities-2026-10-19.md`.

**What did not change:**
- R3 stays open, and no R step is claimed.
- No acquisition was run.
- No ranking authorisation changed.
- No schema migration was made.
- Interventions B, C and D were not started.

**Full suite:** 4,846 tests pass.

**Evidence labels.**
- **[I]** implementation.
- **[R]** observed on development or regression material: the 12 retained S80 pages, the store rows and the 206 spent requests.
- **[T]** same-author tests.

Nothing here is independently validated (§5).

## 1. The operational extraction paths, and where they did not use the shared typing

The path is: the live wave runs `testLeadsFromHtml265`, which calls the Phase225 prose probe, the Phase226 table probe and the Phase270 comparative reader; then the Phase265 screen; then the store (`test_measurements265`, `comparative_results271`); then the consumers (Phase268 validation and catalog, `knowledge_link` D28, Phase271 and the advice).

| Place | Before S86 | S86 |
|---|---|---|
| Phase265 screen | its own unit table (`UNITS`, which turned `db(a)` into `db` and lost the A-weighting) and a table of units per publisher dimension | **removed**: unit and kind come from the shared typing; the stored unit is QK's canonical key (`kWh`, `dBA`, `m^3/h`, `L/day`; the printed form where the canonical one does not read back, e.g. `%`) |
| Phase226 tables | three closed unit lists and a spelling map; header measurand from 7 coarse words ("CADR" and "airflow" both became `airflow`) | **removed**: header and cell units are read by QK; the header's measurand is the QK metric its words name (`cadr`, `free_airflow`, `dehumidifier_capacity` …). The heading's own word still decides when it names no metric, so a contradiction with the unit ("Measured time (W)") is still withheld |
| Phase225 prose probe | closed unit list in the candidate pattern; "52 dB(A)" read as "52 dB" | dB(A) kept. The candidate pattern itself is **unchanged** (see §4) |
| Phase270 comparative | own unit mapping (minutes, kWh, pence, cents) | **unchanged in what it writes** (the store's comparative units stay comparable with the 87 current rows). Typing of its units is derived on read; cost in pence stays Phase270's own tariff semantics, since QK has no currency |
| `knowledge_link` (D28 on store rows) | ad hoc re-parse (`kwh` → `kWh`) | the shared `typeStoredQuantity` |
| Phase268 protocol unit | string equality (`'kwh'`) | `sameUnit` (stored legacy `kwh` and canonical `kWh` are the same unit); the signed catalog keeps Phase181's lowercase unit identifiers |
| Phase245 declarations | its own normaliser (`UNIT_ALIASES`) | **unchanged** (see §4) |

**Shared functions [I], in `quantity_knowledge.ts`:**
- `typeObservedValue`: unit key, kinds, kind, metric, weighting, time denominator, and a status of `typed`, `kind_ambiguous` or `unit_not_recognised` with its reason.
- `typeStoredQuantity`.
- `sameUnit`.

There is no new vocabulary, ontology or table. The typing is derived from what is stored (unit key, the measurand the reader recorded, condition and instrument), not copied into new columns.

## 2. Observation-level evidential role (declaration ≠ measurement)

**One shared check [I]: `declaredInClause225`.**
- A value is treated as declared when its own clause carries the existing `DECLARATION_CUE272` (claimed, rated, manufacturer, spec, listed …) and nothing after that cue is the tester reporting a result.
- So "the claimed noise level of 52 dB(A) … we measured 58 dB(A)" keeps 58 dB(A) and sets 52 dB(A) aside.

**Where it applies:**
- the Phase225 prose probe, per value;
- Phase270 comparative clauses and list lines, together with Phase225's existing screens for another source (`secondary`) and for a test not done (`negated`), now exported and shared.

**Journaling.** Values set aside are counted (`declaredValuesSkipped86`) and journaled with the ingestion's rejections as `declared_value_not_measured`. They are never stored as measured.

Publisher identity alone no longer makes a value a first-hand result. Within a test publisher's page, each value's own clause decides.

**Kept unchanged:**
- the S85 guards (comparative rows only from test publishers, declarations not counted as independent results, sufficiency basis);
- the D15/D17 declaration screens;
- Phase226's "unsafe header" rule (manufacturer, claimed, advertised … columns are never read);
- the separation of qualitative observations.

**Sufficiency [T].** An independent reviewer's sufficiency assessment is not product evidence. Without a verified signed catalog of original tests there is no ranking: no catalog, a null catalog and a wrongly signed catalog were each tested, with a control that ranks.

## 3. Results

**The 12 retained S80 pages [R].**
- Script: `scripts/s86-extraction-compare.mjs`. Private output; public counts in `evaluation/s86/extraction-diff-*.json`.
- Baseline at `c9648e7`, recorded before any change.

| | Before | After |
|---|---|---|
| Test leads | 7 | the same 7 (values, blocks and conditions identical) |
| Kind established | 0 (dimension `not_established`) | 5 (energy ×2, duration ×2, volume) |
| Explicitly unresolved | — | 2 sound levels (`kind_ambiguous`: pressure or power level not stated) |
| New false leads / lost leads | — | 0 / 0 |
| Comparative results | 0 | 0 |
| Declared values set aside | — | 0 |

- **The two sound levels.** I checked both against the page text: "I recorded a noise level reading of 63dB" and "I measured the dishwasher at just 48.5dB". Neither states a weighting, so `dB` unspecified is correct.
- By convention, a tester's meter reading is a sound pressure level. QK does not encode that convention, and no instrument was recorded, so the kind stays open rather than assumed.
- **These pages are too few, and too thin in quantities, to show recovery.** They contain no CADR, airflow, rate or comparative tables.

**Store rows, typed on read [R]** (`evaluation/s86/stored-typing.json`; nothing rewritten):

| Rows | Typed | Unresolved |
|---|---|---|
| 12 test rows | 12: energy 8, duration 2, ratio 2 | 0 |
| 87 comparative rows | 55: duration 30, energy 25 | 32 cost rows in pence (`unit_not_recognised`: QK has no currency) |

- Before S86, none of these rows carried a typed kind (`dimension_basis` = `not_established` on all 12).
- The D28 real-catalog check is identical to S83 (`d28-store-check-s86.json`).

**The 206 spent requests [R]:** identical to S85.

**Counterexamples [T]** (`tests/s86_extraction_quantities.test.ts`, plus a ranking test):

| Case | Result |
|---|---|
| Manufacturer specification in a test sentence | Set aside; the tester's value kept, with its A-weighting reaching the stored unit (`dBA`) |
| Rated power beside a measured energy | Still a declaration (Phase268 rule unchanged) |
| Measured vs declared acoustic levels | A manufacturer column is never read; an unspecified dB stays unspecified |
| CADR vs airflow columns | Stored as `cadr` and `free_airflow` |
| Rate vs capacity columns | `periodic_volume` vs `volume` |
| Documented vs missing test conditions | Codes present vs absent |
| Method mentioned but not performed | No lead; no comparative result (prose and list lines) |
| A quoted maker figure in a comparison | Set aside |

**Knowledge on/off.** Without the shared typing (the baseline build):
- 0 of 7 S80 leads and 0 of 99 store rows have a kind;
- the A-weighting is lost at the screen;
- CADR and airflow columns share one dimension.

**First outcomes, kept unchanged.**
- **First run of the existing extraction tests**, after the change: it found one defect of mine, which I fixed so the heading word stays the declaration. The shared typing had let a unit silently override the publisher's heading word ("Measured time (W)"), so a contradictory column was no longer withheld.
- **First S86 counterexample run:** 3 of 6 failed. Two were defects of mine (the declared-clause exemption accepted any "our"; a list line bypassed the screen), fixed through the shared check. The third was a wrong expectation of mine (power_meter is a condition code).
- **Test expectations updated, with dated notes,** only where stored unit keys became canonical (`db` → `dB`, `l` → `L`, `seconds` → `s`) and where "196 grams" under a "(g)" header is now read: the same unit, refused before only because of a closed list.
- **The reader-version string** was shortened once, to keep Step 3 reading identities within their 80-character limit.

## 4. Net change and what is still duplicated

- `src`: +129 / −37 lines.
- **Removed:**
  - Phase265's two unit tables;
  - Phase226's three unit lists and its spelling map;
  - `knowledge_link`'s ad hoc parse;
  - the string comparison of protocol units.
- **Added:**
  - the shared typing functions (about 30 lines);
  - the clause-level declaration check (shared by two readers);
  - the screen and journal wiring.

**Still local, with the reason:**
- **The Phase225 prose candidate pattern.** It decides which numbers become candidates. Widening it to every unit QK reads would also turn condition parameters ("measured from 1 m") into result leads, unless a condition-versus-result rule is applied first (the plan path has one). That is the next increment, not done here.
- **Phase270's writer units and cost semantics.** Kept so new rows stay comparable with the 87 current rows; QK has no currency.
- **Phase245 declarations (`UNIT_ALIASES`).** Every specification check of the advice (`phase249` conversions) depends on them; typing declarations is a separate slice with its own regression.

**Versioning.** The reader version is now `pee225-probe.v4+pee226-tables.v2+pee227-headers`. Rows from earlier readers are not reinterpreted: they keep their keys and are typed only on read. A new reading of the same revision supersedes them through Step 3.

## 5. Not shown

- **Independent validation.** No genuinely unseen, authorised pages are held. The 12 S80 pages are spent and quantity-poor, and the store rows come from pages no longer held. Recovery of CADR, rate or acoustic observations on real pages is therefore shown only by same-author fixtures.
- **Live behaviour.** Not exercised: no acquisition was authorised.

## 6. Next highest-value cross-system integration

**Typed observations → the existing candidate path (C, the design reported in S85), starting with what extraction already counts but drops:**
- `unit_not_recognised`;
- `kind_ambiguous` with its reason;
- headings that name no metric;
- declared values set aside.

These become journaled research gaps (no schema change, no request text), so knowledge acquired from pages, like that from requests, can propose candidate vocabulary for owner adoption.

That is the first step of the bidirectional loop. It needs the owner's go-ahead for C's first form. An alternative of equal value, staying inside A, is the Phase225 prose candidate finding through QK, behind a condition-versus-result rule.
