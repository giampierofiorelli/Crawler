# Phase255 technical report — reuse retained evidence before requesting research

**Date:** 2026-10-16. **Branch:** `claude/typescript-network-transport-test-1givnd`.
**Commits:** `790cec9` (fresh gold, sealed before any code change), `f6535f4` (corrections, tests, first run).
**Full suite:** 4,415 tests pass, exit 0. **Private store:** pee-knowledge `38495fe`, verified, unchanged.

## 1. Root causes found (first failing step)

| Case | First failing step |
|---|---|
| Kettle "…**700ml** … Kettle" | `capacityFromName249` accepted only 1–2-digit litres or quarts, so the name token was never read. |
| Blender "Commercial Blender 2L **1500W**" | Names were read only for capacity. Its only power-like row, "power supply = 13 amp plug fitted", is correctly excluded, so the check said `no_declaration`. |
| Toaster "17(w) x 41(d) x 20.3(h)"; steamer "Capacity = 6" | Values without a unit were coded `no_declaration` or `not_comparable`, so Phase254 asked for new research. |
| Unlabelled triples ("46 x 21 x 22 cm") | Coded `no_declaration`: the evidence is retained, but its axis order is not stated. |
| Declared ranges ("960 - 1140W") | Never compared. |
| Rice cooker "**Gross** Dimensions (WxHxD)" | Read as product dimensions, producing a false conflict with the net dimensions (320 vs 340 mm). |
| Steamers and deep fryers (found by the fresh baseline) | The journey's `unsupported_category` (no category-knowledge items) made `adviseFromRequest253` answer out of scope, even when the user stated a checkable limit and the products carry declarations. |

## 2. Existing modules reused

- Phase245 values (`range`, `number`, `dimensions` with axes);
- Phase249 `checkCriterion`, `axisValue249` and `capacityFromName249` (extended, not replaced);
- Phase253 `adviseFromRequest253`;
- Phase254 `researchNeedsFromAdvice254`.

No new parser was added. `phase166` was not needed.

## 3. Corrected general mechanisms

- **Name quantities.**
  - Exactly one volume token, now including `ml` and `cl`, or exactly one wattage token (`powerFromName249`).
  - Never a range, two tokens, a mass ("1KG") or a bare model number.
  - A name value is used only when no declaration of that property exists. "Deep Fat Fryer – 3000W" keeps its
    declared 2600 W.
  - It is cited as a product-name declaration: a declared rating, never a measurement.
- **Ranges** decide only when every declared value is on the same side of the limit; otherwise `range_straddles`.
- **Precise codes** for retained but incomplete values:
  - `unit_missing`: the unit is never assumed;
  - `axes_unlabelled`;
  - `range_straddles`.
  These codes are no longer reported as "no declaration".
- **Gross dimensions are packaging.** Component, slot and box dimensions were already excluded.
- **Categories without category knowledge.** Limits the user stated are checked, with the limitation "only the
  limits you stated are checked; other needs are not understood". Without a stated limit the answer stays out of
  scope.
- **Phase254 bridge.** The new codes go to a new destination, `source_reinspection`: re-read the same permitted source
  page. It is not new research and has no Phase182 gap. Phase182 authorisation rules are unchanged.

## 4. Evaluation (fresh set, T1)

**Set:** 12 new requests on retained steamers, deep fryers, a rice cooker and kettles. The gold was written from raw
declarations before any change, by the code author. Results are optimistic and not held-out.

| Measure | Before | After |
|---|---|---|
| Correct response type | 3 / 12 | 12 / 12 |
| Correct product status | 3 / 25 | 25 / 25 |
| Correct factual comparisons (gold include or exclude) | 2 / 13 | 13 / 13 |
| Checkable products left unknown | 2 | 0 |
| Wrong inclusions / wrong exclusions | 0 / 0 | 0 / 0 |
| Need destination and criterion correct (gold unknown) | — | 12 / 12 |
| Unnecessary research requests | 2 | 0 |
| Source or variant misattribution | — | 0 |

The negative controls all hold:

- the name never overrides a declaration;
- a steamer's "Water capacity 1L" (a tank) is not cooking capacity;
- packaging dimensions are ignored;
- no unit is assumed;
- a price in another currency stays not actionable.

## 5. Changes to actual product advice

- **Phase253 advice set** (development):
  - product checks 132 → 137 of 138;
  - missed inclusions 2 → 1;
  - wrong inclusions 0, harm 0;
  - correct responses unchanged at 37/43.
- **Newly decided products:**
  - the Waring blender is included on its "1500W" name rating;
  - the 700 ml kettle is excluded from ≥ 1.5 L;
  - the pod machine's "960–1140 W" fails ≥ 1400 W;
  - the rice cooker is checkable on width;
  - steamers and deep fryers are now advised on, from stated limits.

## 6. Unnecessary research prevented

Phase254 needs set (development, gold written under the old taxonomy):

| Measure | Before | After |
|---|---|---|
| Research needs | 28 | 23 |
| False needs | 1 | 0 |
| Within budget | 20 | 20 |
| Omitted by budget | 8 | 3 |

The 2 "missed" needs are products now decided outright, which correctly need nothing. The 3 "wrong destinations" are
unlabelled or unit-less dimensions: they now go to `source_reinspection` instead of research or reextraction. That
change is deliberate.

Fresh set: unnecessary research 2 → 0.

## 7. Regressions and unresolved errors

**No regression** in Phase253 advice or in Phase254 attribution (30/30). Phase182 has 29/29 tests passing.

**Unresolved:**
- `source_reinspection` has no executor. It requires re-fetching a permitted page under the same source policy; that
  is not authorised or implemented.
- One Phase253 inclusion is still missed.
- Names with several quantities stay unread, by design.

## 8. Skill updates

- **SKILL.md:** one reusable principle. Classify retained evidence before requesting research (absent, retained but
  not comparable, retained but incomplete). Never assume a unit, and a name quantity never overrides a declaration.
- **current-state.md:** the Phase255 entry.
- **decisions-and-supersessions.md:** S25. Phase253 treated `unsupported_category` as "no advice possible", which was
  too strict for stated limits.

## 9. Git and database state

- HEAD after this report: see `git log`.
- All Phase255 commits are pushed.
- pee-knowledge `38495fe`: verified (integrity, journal, live matches remote), 2,385 declarations, unchanged.

## 10. Continuation prompt

See `CONTINUATION-PROMPT.md`.
