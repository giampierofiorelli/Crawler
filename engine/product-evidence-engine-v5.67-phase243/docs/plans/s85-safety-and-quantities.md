# S85 — Cross-system consolidation: safety guards and shared quantity understanding (owner decision S85, 2026-10-19)

**Scope.** One bounded implementation, as the owner asked:
- the safety and evidence-role guards;
- an acquisition policy checkpoint;
- intervention A of S84 on the request path.

Interventions B, C and D are not started (§6).

Owner brief, verbatim: `.claude/skills/pee-guided-learning/references/owner-s85-consolidation-2026-10-19.md`.

**Roadmap.**
- This is cross-system architecture work. It does not complete any R step.
- R3 stays open, and its exit criteria (C1–C4) are unchanged.
- No ranking authorisation was added, and no live request was made.

**Commits.**
- `99b3d0d` step 1 (safety);
- `94f9346` step 2 (acquisition checkpoint);
- the step 3 and report commit, which follows them.

**Evidence labels.**
- **[R]** regression on spent material (the 206 requests);
- **[T]** tests written for this step (same author);
- **[O]** offline rehearsal.

Nothing here is independent validation (§5). Full suite: 4,839 tests pass.

## 1. Step 1 — evidence-role and sufficiency safeguards (restrict-only)

| Risk (S84) | Change | Verified |
|---|---|---|
| A manufacturer's or another non-test page's comparative results stored as measured tests | `applyComparative271` stores comparative results as first-hand measured tests only when the source role (`reportedBy265`, the existing mapper) is a test publisher; others are withheld, counted and journaled with their role. `comparativeEvidence271` also excludes and counts non-test rows. No schema change | [T] manufacturer and editorial pages store 0 rows, each journaled with its reason; a test-publisher page unchanged. Store census: all 87 current rows unaffected |
| Specification values on test-publisher pages counted as independent results (journey) | They no longer count; independent results reach advice only through validated test evidence (Phase268) | Code; the store held 0 such rows |
| Provenance: `testing_status` constant whatever the source | Now true by construction: only test-publisher rows are stored with it | [T] |
| Same-model assessment taken as sufficient (owner decision 1) | `sufficiencyOf247` reports a **ranking basis** for an established verdict: an independent assessor, original evidence (the relation promoted to `evidence_supported` by a verified receipt citing an independent original test), or a verified review receipt. ra.2 refuses `sufficiency_same_model_only` when there is none. Source independence and assessor independence stay distinct; no blanket human approval is required | [T] a same-model-only relation does not rank; the same relation promoted on original evidence ranks; an independent assessor ranks. **Exposure (S78 census, live store, `evaluation/s78/authorisation-census-s85-*`): release-authorised pairs 13 → 0**; the 15 affected pairs now refuse with the explicit reason. The real signed catalog is unaffected (its only dimension is a proxy, already refused) |

The 206 requests are identical after step 1 [R]: no request supplies a signed catalog.

A professional's structured qualitative evaluation is not touched by these gates. Qualitative observations keep their own role.

## 2. Step 2 — acquisition policy checkpoint (offline only)

- **The gap.** The live wave (`scripts/phase246-live-wave.mjs`) stored the owner policy file but did not apply it. Only its `--budget` argument was enforced.
- **Smallest enforceable safeguard.** Built inside the existing research-policy owner (`phase257`, reusing `readProtectedPolicyFile257`):
  - `init` validates the policy and refuses a budget above it. The policy must be a protected file, outside any Git tree, unexpired; a date-only expiry covers its whole day.
  - **Before every request**, `waveRequestGate257` re-reads the policy and stops if it is missing, changed or expired.
  - It also stops if this wave, plus the requests earlier waves recorded under the same policy id (found from their receipts) and any spend the owner records, would exceed the policy. The per-host and host-count limits apply too.
  - A state without a policy is offline only: every network command refuses.
- **Distinct access statuses.** `robots_unknown` (an unreadable robots file: fail-closed for the wave, not a refusal, no suspension on its own) is now kept apart from:
  - `robots_disallowed`;
  - `forbidden` (401/403);
  - `rate_limited` (429);
  - `error`.

  A missing robots.txt (404) stays allowed, as before. Robots fail-closed behaviour, 401/403/429 suspension and Retry-After handling are unchanged.
- **Offline rehearsal [O].** Each of these stopped before any request, with 0 requests recorded:
  - no policy;
  - an expired policy;
  - a budget above the policy;
  - a policy inside a Git tree;
  - a policy changed after init;
  - a policy already exhausted by an earlier wave.

  Unit tests [T] cover the gate.
- **Deferred to D:**
  - one gate shared with the metadata pilot (Phase264 keeps its own, which already enforces its policy);
  - `ok` outcomes recorded;
  - idempotent access events;
  - the discovery pilots' `restricted>0` exclusion.

## 3. Step 3 — intervention A on the request path

**One quantity semantics.** What a quantity in a request *is* (number, range, unit, kind) now comes only from the quantity knowledge (QK). Phase253 iterates the quantities QK finds and keeps only what is specific to checking declarations:
- the bound;
- the property;
- the available space;
- the criterion;
- the declaration unit symbol.

Its own unit regex (`UNIT`, `QTY`), dimension table (`dimensionOf`) and QK veto block were removed.

**QK gained three capabilities Phase253 had, without new vocabulary:**

| Capability | How |
|---|---|
| Rates written as words: "12 litres a day", "0.5 kWh daily" | The pack's existing `basisWords`, until now read only in labels |
| "between 3 and 5 litres" as a range | A bare "and" never makes one |
| The inch mark before a word: `10" steamer` | The rule against symbols that are also English words no longer applies to a symbol with no letter |

**Advice combines the two readings once.**
- Only a checkable constraint hides a QK reading.
- A typed QK reading replaces Phase253's "unclear property" note for the same span.
- A quantity whose measurand QK names but that has no bound ("extracts 12 litres a day") stays visible, with a question: "at least or at most?". Nothing is assumed.

**Boundary checks (owner).**

| Request | Before | Now |
|---|---|---|
| "quiet dishwasher" | quiet lost without trace | category dishwashers; objective **quiet (noise)**, typed by QK's existing aspect vocabulary when it qualifies the product (before its name or predicated of it) |
| "most reliable dishwasher" | out of scope (target read as "most") | category dishwashers; objective "most reliable dishwasher" (the existing stated-objective reader). The pre-nominal evaluative adjectives already in the boundary list now modify the head instead of ending it |
| "espresso machine with a steam wand", "with high brew pressure", "air fryer with a convection fan" | outcome needs sent to research | **feature preferences**, kept and visible (statement and unassessed objective), never outcome needs or checks. Rule from the store's concept kind: a `mechanism`, or a `task` named as equipment ("with a steam wand") |
| "I want to make lattes …" | need milk_drinks | unchanged (a use stays a need) |

**The six S84 counterexamples [T, and run on the live store].**

| Request | Before | Now |
|---|---|---|
| "between 3 and 5 litres" | capacity ≥ 3 | unchanged |
| "fits a space 40 cm wide" | width ≤ 40, available space | unchanged |
| "extracts 12 litres a day" | wrongly asked "at least 12 l (capacity)?" | a typed moisture-removal rate, with an "at least or at most" question, and no capacity check |
| "at least 2 kg capacity" | dropped by Phase253 | stated as a typed requirement (mass, min) |
| "at least 55 inches" | typed by QK, then suppressed | stated (length, min); the "unclear property" note replaced |
| "44 dB(A)", "15 bar" | — | dB(A): a typed requirement with the existing sound-pressure / sound-power question. 15 bar (no bound, no measurand): visible as "stated but not checked" |

"a 2 kg chicken" makes no requirement. A bare "2000–2400 W" stays a candidate.

## 4. Step 4 — measured effect

**Request-to-advice regression [R].**
- 206 spent requests, with the harness widened to also compare constraints, unmapped constraints, quantity requirements, questions, feature preferences, shortlist and exclusions.
- Pre-S85 build: worktree at `45e818d`. The diffs, counts only, are in `evaluation/s85/`.

| Run | Changed requests | Decisions | Constraints / shortlist / exclusions |
|---|---|---|---|
| First run (kept unchanged) | 15 | 1 (research → clarify) | 0 |
| After fix1 | 6 | 0 | 0 |

**What the first run found, and what was fixed:**
- **A new false recognition.** "struggles with some doughs" was read as the feature "dough": the task-as-equipment rule was too wide. It now requires "with/has a / an / the / built-in".
- **A lost capability.** The inch mark followed by a word (36", 10" …) was no longer read. Fixed in QK (above).
- **Noise.** "5 years" was noted as a non-comparable unit. A unit declarations are never stated in is now ignored by Phase253, as before.

**The 6 remaining changes after fix1, each inspected:**
- **3 correct recoveries:**
  - "an air purifier quiet enough to sleep next to" → quiet (noise);
  - "a compact air fryer" → compact (size footprint);
  - "a more expensive kitchen scale" → target "kitchen scale" instead of "more".
- **3 internal notes** on newly read inch forms ("8-Inch", "2 in.", "3x 3.5″"). They are unmapped and not shown in the answer text.
- **0** new false recognitions, wrong bounds or product exclusions.

**Knowledge on/off [T].**
- Without the QK option, the advice keeps Phase253's checks but gives no typed requirements. "at least 55 inches" is stated only with QK.
- Phase253 itself now always uses QK for typing. The "off" arm of the old Phase253 is the pre-S85 build, compared above.

**Other suites.**
- QK-dependent suites pass (quantity knowledge, tables, documents, KR, request coverage).
- One QK test that asserted the old internal split (a rate noted as "not a volume" by Phase253) was updated, with a dated note. The guarantee "a rate is never checked as a capacity" is kept and now also asserts QK's typed reading.
- Full suite: 4,839 tests pass.

**Net code.**
- `src` since S84: +218 / −56.
- **Removed:** Phase253's unit regex, dimension table and veto block (one of the two request quantity semantics).
- **Added:** the safeguards of steps 1–2 (sufficiency basis, comparative gate, wave policy gate: about 90 lines); the boundary logic (aspect objectives, feature preferences, pre-nominal adjectives: about 60 lines); QK rate and range support (about 15 lines).
- **Vocabulary added:** 9 degree words ("most", "very" …).
- **Reused rather than added:** the existing boundary adjectives, QK aspects and `basisWords`. No new module, rule file or store table.

**Unchanged safeguards:**
- ra.2 restrict-only and the S79 release rule; `VALIDATED_NEW_AUTHORISATIONS` empty;
- signed-catalog verification; Phase268 validation;
- robots fail-closed; 401/403/429 suspension; Retry-After;
- retention classes; the D15/D17 declaration screens (the table readers stay unconnected);
- the store and its snapshot (no write).

## 5. Validation still outstanding

- **No independent material was used.** The 206 requests are spent, and every test here is same-author.
- No unused, independently authored request set is held in the repository under the evaluation rules. Independent validation of A needs new requests written by others, sealed before a first run.
- **Request-side only.** No extraction reader uses the shared typing yet. Stored test and comparative rows are still typed by local tables.

## 6. Next interventions (not started) and the qualitative observations

- **B.** One sufficiency/force vocabulary; one explanation table; concept-kind roles reviewed. The "steam wand" alias sits on a task concept; the kind rule above handles it, but the data should be reviewed.
- **C. Candidate intake, a design to submit.**
  - Keep only the uninterpreted span, normalised, with numbers and proper names removed, never the request.
  - Record it as a journaled research gap of kind `vocabulary_candidate`, with its origin (request hash, date, category) and a count from recurring experience cases.
  - A collision check against category names and existing aliases.
  - Promotion only through owner-adopted lessons; retire and expiry supported.
  - No schema-v11 migration is needed for this first form.
- **D.**
  - one acquisition gate shared by the live wave and the metadata pilot;
  - access outcomes recorded idempotently, with `ok`;
  - search plans from the goal assessment's measures and conditions (permitted as a research objective; access stays under policy).
- **Qualitative observations** (9 rows, retained under the Phase270 amendment). They are kept. Their natural consumer is the existing `qualitative_needs.relevantObservations`, now that requests carry QK aspects ("quiet" → noise). Connecting them belongs to B/C.
- **Unreachable modules.** Retirement stays incremental, after dependency and replay checks.
- **Semantic models.** No change (H4 later, from existing scores).
- **Roadmap.** The R4 heading is restored as it was before commit `842550d`; content and order unchanged.

**Next highest-value bounded integration.** The extraction slice of A:
- type stored test leads and comparative rows with QK, behind the declaration screen;
- re-derive them with Step 3 versioning.

This would carry A-weighting and the measurand (CADR vs airflow) into the store, and let D28 and comparison read typed records.
