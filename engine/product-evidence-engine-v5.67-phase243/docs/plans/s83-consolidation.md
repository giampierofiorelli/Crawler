# S83 — R3 consolidation (owner review of S82, 2026-10-19)

**Roadmap step.** R3, still current. This is a consolidation inside R3, not a new phase. Owner review, verbatim:
`.claude/skills/pee-guided-learning/references/owner-r3-consolidation-s83-2026-10-19.md`. It continues
`docs/plans/s82-architecture-check.md`.

**Anti-drift checklist.**
1. **Step:** R3.
2. **Kind:** inference and integration on the user path (conditions), consolidation (removal of superseded code).
   - No new module, rule file, knowledge layer or reasoning path.
   - One small cue list was added: negation cues in the Phase225 reader (`NEGATED_BEFORE`), disclosed in §3.
3. **Level and tier:**
   - L3 on the user path: per-measurement conditions, three states.
   - L2 shadow: D28 on the ranking path.
   - Tiers: T1 batteries; T2 on the store's real rows and on the 206 spent regression requests.
4. **Unseen data:** none independent. Every set used here is spent or same-author; see §5.
5. **Complexity:** see §6.
6. **Negation:** an absent condition is "not verifiable", never failed. A difference must be documented to count as incompatible.
7. **Shadow only:**
   - no public ranking authorisation changed;
   - `VALIDATED_NEW_AUTHORISATIONS` is still empty;
   - the restrict-only ra.2 gate is unchanged.
8. **First runs:** committed unchanged. This includes the first S83 battery run that showed a regression (§2).

## 1. requires_condition per measurement on the user path (condition 1)

Commit `4708a1a`.
- **Per measurement.** `goalAssessment269` outcomes carry `conditionsByMeasure`, which replaces `requiredConditions`. The old field pooled the conditions of every measurement of a need, so a measurement was asked for another measurement's conditions.
  - On the 206 regression requests, 19 condition lists in 8 measure/outcome pairs were pooled wrongly.
- **Three states.** Phase271 comparative groups give each taught condition one of three states, each with its basis:
  - **verified:** every result records it;
  - **incompatible:** a result positively records a relevant difference (for example a reduced food load);
  - **not verifiable:** not recorded, or PEE cannot read it yet.
- **Comparability wording.**
  - `comparable_conditions_not_verifiable` replaces `comparable_with_unmet_conditions`.
  - The ra.1 and ra.2 refusal is renamed `conditions_not_verified` (was `conditions_not_met`). The refusal itself stands; only the claim that the conditions were "not met" is gone.
- **Advice text.** The advice says "not verifiable from the records: …" instead of "does not record".
- **No absolute ban.** Two tests under different conditions are refused only when a difference is documented. A normalisation the knowledge justifies still compares (QK kr.4 rules, unchanged).

## 2. D28: conditions derived from the original test records (condition 2)

**Validity per observation.** `conditionsMetFromRecords` and `conditionsMetFromStoreRecords` live in `knowledge_link.ts`, where they existed in shadow since S82. They now check each test separately:
- Each required condition is verified or not verifiable, with where the record shows it: stated, reader code of the value's sentence, or reader code of the document protocol.
- The method is recorded.
- A test is *usable* when it verifies every required condition.

Complete tests are grouped by the existing `compareUnderKnowledge`. A documented difference keeps two tests apart and is listed as incompatible.

**Two answers, kept apart.** The first S83 version merged them; the battery caught the error (below).

| Question | Answer |
|---|---|
| What the dimension **as compiled** meets | The conditions every one of its tests verifies, minus any documented difference. A catalog holding all its tests can claim no more. |
| What a catalog **restricted** to the complete tests could meet (the owner's precaution: three complete tests are not discarded because two are incomplete) | The largest comparable group of complete tests of **two or more distinct products**, its conditions, and the tests it sets aside. One product's test never shows a condition of comparing it. |

**On the ranking path.** `authorisationTrace` entries gain `derivedConditions`:
- observation counts;
- the derived, declared, unsupported and not-declared conditions;
- what ra.2 would decide with the derived conditions;
- the restricted subset and its decision.

All of it is **shadow**:
- the public decision is computed exactly as before;
- a pair the derived conditions would newly enable reads `new_authorisation_shadow_only`;
- a restricted catalog reads `restricted_catalog_shadow_only`.

Test `phase270_ranking_authorisation`, "S83 D28 shadow", shows a signed catalog that declares a condition the store records do not show:
- the public decision stays `authorised`;
- the trace reports the condition as unsupported, with `conditions_not_verified`.

**Regression found and fixed.** The first S83 run on the sealed S82 battery (spent; run kept unchanged in `evaluation/s83/s82battery-K+-regression-s83-before-fix.json`) scored 17/19 with **2 over-claims**:
- `S2-K-af-1`: one fryer's complete test was taken to show "same food load";
- `S2-K-ap-1`: one purifier's recorded mode was taken to show "same mode pairing".

A single product's test was being read as showing a condition of a comparison.

- **fix1:** a group must hold two products. The over-claims were gone, but the battery abstained on 3 units (16/19), because the merged answer then dropped the conditions every test shows.
- **fix2:** the two answers above, kept apart. The battery is back to 19/19 on every arm, with the same S82 figures under each ablation.

**On real data.** `scripts/s83-d28-store-check.mjs`, output `evaluation/s83/d28-store-check-*.json`.
- Phase268 validates 3 of the store's 12 test rows. The catalog it would compile has one dimension, the empty-run energy, which requires no condition.
- There is no recovery to observe on real data yet.
- Read as other measurements, the 3 records supply no food-load or doneness condition, so nothing is derived wrongly.
- With the reader axes, one record is kept apart because its compartments are not established as the same (not "different"). Without the reader axes, all three pool.

## 3. Condition vocabulary: progressive, one reader at a time (condition 3)

**Phase225 negation fixed before its codes gain weight.** Probe v3; `TEST_LEAD_EXTRACTOR265` names it.
- "empty" counts only where it states the condition: not negated, and not a verb ("empty the basket").
- "preheat" counts only where not negated ("no need to preheat", "without preheating").
- Counterexamples are in `tests/s83_consolidation.test.ts`. Probe v2 read both negated forms as conditions; v3 does not.
- The stated forms are still read: "running it empty at 200 °C", "including a preheat".
- Effect on the spent S80 pages: none. No real page used the negated forms.

**Unified so far, through the existing quantity-knowledge mechanism:**
- The Phase225/265 codes `load_empty`, `all_compartments` and `single_compartment` are values of two overlay axes (`reader-conditions.v1.json`, S82).
- They are now read by D28 on the ranking path (shadow) as well as by the link and evidence programs.

**Deliberately not unified yet:**
- **Phase271 comparative-result codes** (`same_food_load`, `quality_assessed_same_task`, `quantity_reduced`). They map to teaching conditions directly, not to quantity-knowledge axes. Unifying them needs new axes (food load, doneness), which is a teaching decision. The map is one entry in `COMPARATIVE_MEASURES271`.
- **Setpoint, one-hour duration, from cold, power meter.** The teaching names no axis for them.
- **Phase268 protocol fields and Phase270 codes.** Unchanged, as the owner asked: not every vocabulary at once.

## 4. Superseded code: what was removed, what was kept, and why (condition 4)

The S82 census was reused; no new census was run.

| Item | Decision | Reason |
|---|---|---|
| Pooled `requiredConditions` (goal assessment) | **Removed** (step 1) | Superseded by the per-measurement reading; its only consumers were the advice texts and Phase271, both moved |
| `comparable_with_unmet_conditions`, `conditionsMet/conditionsMissing` (Phase271) | **Removed** (step 1) | Replaced by the three states |
| `src/spec_test_evidence.ts` + test (Phase 59) | **Removed** | Marked deprecated since Phase 60 (successor `technical_vs_independent.ts`); no module, script, evaluation or replay imports it; last version in commit `d305652`; dated note in `docs/PHASE-59-…md` |
| Stale "link-rules v6/v7, shadow only" comments in `knowledge_link.ts` | **Corrected** | They named rule versions the code no longer loads |
| Old rule files (link-rules v1–v8, rules v1–v3, quantity packs v1–v2) | **Kept as replay data**; listed in `resources/quantity-knowledge/README.md` | No operational code branches on them; replay tests and scripts pass them explicitly. They are history, not operational path |
| ra.1 (`outcomeAuthorised270`) | **Kept** | Owner S79: kept as a restriction (the release rule needs both rules) |
| "Dead" deduplication in `acquireConditionAxes` | **Kept; census corrected** | Not dead: it stops re-proposing an axis when the pack already carries acquired axes (an overlay passed back in) |
| `planConditionIds272`, `linkToMeasure272`, `decisionEvidence` | **Kept** | Read by replay scripts (Phase272 A/B, R1/R2 experiments, the Step 3 demo) and several tests; removal needs those replays retired first |
| Phase145/166/185, phase121 modules | **Kept** | Off the operational path, but each has a chain of importers (phase146/147/167/169/170/171/187); not in the condition scope of this step |

## 5. Validation (condition 6)

Every set below is **development or spent**. None is independent validation.

| Check | Result |
|---|---|
| Request-to-advice regression: 206 spent requests (Phase248/250/251/266/271, S80), every field (`evaluation/s83/advice-diff-*.json`, counts only) | Baseline rerun: identical. Step 1: 61 requests change structure (per-measurement conditions), 1 statement reworded, **0 decisions changed**. Step 2 vs step 1: identical. The harness passes no signed catalog, so the D28 trace is not exercised here |
| Sealed S82 battery (spent), S83 final | K+ 19/19, 0 over-claims. Ablations: without taught conditions 6/19 (8 over-claims); without reader axes 16/19 (3 abstentions); without assessments 17/19; without proxies 19/19. All identical to S82 |
| S81 development battery (spent) | 60/65, 0 over-claims (= S82) |
| S81 held-back battery (spent) | 53/55, 0 over-claims (= S82) |
| Recovery of justified conclusions | D28 restricted subset: three tests, one incomplete; the two complete tests of two products show all three conditions (S82 derived two). Phase225: stated empty run and preheat still read |
| Counterexamples | One product's complete test (no subset); a documented load difference (two groups, incompatible); a declared condition with no record (unsupported); Phase225 negated and verb forms |
| Dependency checks | Decision with and without the trace identical (ranking test); vertical path fitness 4/4 (fault injection) |
| Real store | §2 |
| Full suite | `npm test`: 4,829 tests pass (the 15 fewer are those of the removed deprecated module) |

## 6. Net architectural effect (condition 7)

**Consolidated.**
- One reading of `requires_condition` per measurement now serves the advice, comparative and ranking paths. Before, the user path pooled per need.
- One condition-state vocabulary is used on the user path: verified, incompatible, not verifiable.
- The D28 derivation reuses the existing comparability program (`compareUnderKnowledge`) and the reader overlay. It adds no rules.

**Removed.**
- The pooled field and the two-state Phase271 fields.
- One deprecated module: 179 lines, plus 97 test lines.
- `src/` since S82: +164 / −234 lines.

**Not added.**
- No module, rule file, rule-set version, knowledge layer or adapter.
- One negation cue list (Phase225) and one shadow trace field.

**Remaining complexity, stated plainly.**
- About five condition vocabularies remain: Phase225 codes partly mapped; Phase268 fields; Phase270 codes; Phase271 codes; teaching concepts. One shared representation is still a target.
- ra.1 is still computed for the release rule.
- Two-question D28 output is richer than a list; it is consumed only by the trace.

**Behaviour.**
- No wrongly pooled conditions are shown to users.
- No "not met" for an unrecorded condition.
- Negated reader conditions are not read.
- The ranking trace shows when a catalog's declared conditions are not supported by its records.

**Regressions.** One found in development (D28 over-claim) and fixed; final runs match S82 on every spent set.

## 7. Limits and unresolved (R3 stays open)

- **No independent material.** The batteries are same-author and spent. The real store holds 3 validated tests of one measurement that needs no condition. D28 has not met a real case where it would change a decision.
- **D28 promotion.** Using derived conditions publicly needs independent validation and an owner decision. Until then `VALIDATED_NEW_AUTHORISATIONS` stays empty.
- **Still open from D29:**
  - the Phase268 whole-appliance compartments default;
  - `goalAssessment269.relevantMeasures` and the Phase248 journey reading any `measured_by` as establishing;
  - E27 operating-axis lists treated as closed across products.
- **Vocabulary:** the Phase271 codes and setpoint/duration need teaching axes before they can join the shared representation.
