# Continuous scientific learning — Step 1A: small, replayable experience-memory pilot

Owner assignment of 2026-10-17. This implements step 1 of `docs/plans/continuous-scientific-learning-readiness.md` at
pilot scale and supersedes nothing.

**Constraints observed:**
- no HTTP;
- no change to acquisition, extraction, teaching, ranking or schema;
- local artefacts only;
- focused tests only.

## 0. Outcome

**The foundation works.**
- There are 18 authentic cases across 5 categories and 5 hosts.
- Each case keeps three separate states: historical, current and reference.
- The replay is deterministic and labels every case with one transition.
- On the frozen build, 15 of the 16 document cases reproduce their committed history.

**The first replay already found something the aggregate figures hid.** The tuned Phase272 mention change lost a success:
- **Case:** EX-05, a TV peak-brightness value.
- **Before:** correctly attributed.
- **Now:** bound to another product named on the same page.

**Two method defects were found and fixed:**
- One committed "absent" (EX-11) is an artefact of one-to-one scoring, not a reader failure.
- The first false-positive observer keyed on the subject, so a re-attributed false positive looked "corrected". It now
  keys on the source-block hash.

## 1. Cases and why

Values, product names and text stay private:
- the case set: `pee-knowledge/private-eval/experience/pilot-cases.json`;
- its public, value-free index: `evaluation/experience/pilot-index.json`, which carries `privateCasesSha256`.

| Case | Kind | Family | Category | Host | Historical (frozen) | Why selected |
|---|---|---|---|---|---|---|
| EX-01 | value | F1 identity by default | TV | tomsguide | wrong product | multi-product page; subject default |
| EX-02 | value | F1 identity by default | air purifier | housefresh | wrong product | same family, different host and category |
| EX-03 | value | F1 identity by default | TV | trustedreviews | wrong product | the tuned rule later corrects it |
| EX-04 | value | S attribution success | air purifier | housefresh | correct | twin of EX-02 (same page) |
| EX-05 | value | S attribution success | TV | tomsguide | correct | twin of EX-01 (same page) |
| EX-06 | value | F8 identity variant | TV | trustedreviews | variant name | audited acceptable variant |
| EX-07 | value | F8 identity variant | dishwasher | trustedreviews | variant name | same, second category |
| EX-08 | value | F1 headline identity | air purifier | techradar | wrong product | headline sentence taken as product |
| EX-09 | value | S extraction success | TV | trustedreviews | correct | table-cell value |
| EX-10 | value | S extraction success | air fryer | trustedreviews | correct | cooking category control |
| EX-11 | value | F3 lost under guidance | air purifier | housefresh | absent (committed) | only the exploratory pass found it |
| EX-12 | false positive | F2 qualitative overreach | air purifier | housefresh | emitted | finding gold does not contain |
| EX-13 | false positive | F2 qualitative overreach | TV | tomsguide | emitted | same, second category |
| EX-14 | qualitative | S extraction success | dishwasher | expertreviews | correct | qualitative success outside cooking |
| EX-15 | qualitative | F3 lost under guidance | air fryer | tomsguide | absent | guided plan omits it |
| EX-16 | qualitative | S extraction success | air fryer | tomsguide | correct | twin of EX-15 (same page) |
| EX-17 | request | F5 category recognition | tumble dryer | — | clarification | unknown category not recognised |
| EX-18 | request | S gap recognition | tumble dryer | — | out of scope (gap stated) | correct gap statement |

**Selection:**
- Each failure family has at least two cases, on different hosts or in different categories.
- Five successes are twins of failures on the same page, so a fix that simply moves the error can be seen.
- Every case was taken from the Phase272 untouched first runs (arm B) or the frozen request set. Nothing was annotated
  newly for the pilot.

## 2. Representation

`src/experience_cases.ts` is pure: no I/O, store or network. An `ExperienceCase` (`pee.experience-case.v1`) carries:

- **Identity:** id, kind and family.
- **Source:** category, host, document tag and SHA-256, evaluation, run, gold id, historical arm, and the historical build's
  commit and path.
- **Item:** the private value and unit, or the dimension, direction and subject, or the request text.
- **Three states:**
  - `historical`: committed, never edited;
  - `historicalCheck`: a re-observation on the frozen build. A disagreement is recorded here.
  - `reference`: the expectation plus `basis` and an `independence` statement. The annotator is Claude, and in two cases
    the developer audited it; this limit is stated in the case.
- **Learning fields:**
  - generic computed `features`;
  - `cause`: candidate vs confirmed;
  - `lesson`: always `hypothesis`, with applicability and exceptions;
  - `supports` and `counterexamples`;
  - `maturity`.

**Replay verdicts** compare each state with the reference, never history with current directly:
- `preserved_success`, `lost_success`, `corrected`, `persistent_failure`;
- `unreproducible`: inputs missing, bytes not matching the receipt, or no build.

**`recurringPatterns`** only proposes candidates: two or more failing cases of one family sharing a feature, across two or
more hosts or categories, with the successes that share the feature listed as counterexamples.

**Scripts:**
- `scripts/experience-observe.mjs`: observes one case with one build.
- `scripts/experience-pilot-build.mjs`: builds the set and refuses to overwrite.
- `scripts/experience-replay.mjs`: verifies the set's hash against the public index and never overwrites.

## 3. Provenance completeness

- **Document cases (16 of 16):** each has the page SHA-256 checked against the wave receipt, a gold id, a run id, a
  historical build, and a plan digest. All plans equal the frozen Phase272 digests.
- **Frozen arm-B build** (c206c9a; extractor hashes equal `extractor-freeze-known.sha256`): it reproduces 15 of 16
  committed states.
- **EX-11 is not reproduced.** The frozen build does find the value. The committed "absent" arises because two gold items
  share the same value and unit (`sameValueGoldIds`) and the whole-document scoring is one-to-one. History is kept
  unchanged, and the disagreement is recorded.
- **Requests (2 cases):** record-only from `unknown-category-pilot.json` (build 20fa5ae). They are not re-observed, because
  that build's worktree is not kept.
- **Missing everywhere:** a block locator in the committed runs. Locators come from the re-observation.

## 4. Historical vs current (replay `current-c652424`)

| Transition | n | Cases |
|---|---|---|
| preserved_success | 8 | EX-04, 06, 07, 09, 10, 14, 16, 18 |
| lost_success | 1 | **EX-05**: the tuned mention rule re-binds a correct value to another product on the page |
| corrected | 2 | EX-03 (tuned mention rule); EX-11 (scoring artefact, not a reader change) |
| persistent_failure | 7 | EX-01, 02, 08, 12, 13, 15, 17 |
| unreproducible | 0 | — |

EX-03 and EX-05 come from the same tuned change: one correction and one regression. The Phase272 aggregate showed only the
net gain.

## 5. Replay results and limits

**Control runs:**
- **`frozen-self`:** the frozen build replayed against itself.
  - EX-11 shows "corrected": the artefact.
  - EX-18 shows "lost": c206c9a predates the gap rule of 20fa5ae.
  - So the control behaves as expected, and per-case builds are needed.
- **`fault-injection-ex14`:** one success was forced to "absent". It is detected (lost_success 2, regression true). The run
  is labelled `fault_injection` and is not evidence.

**Limits:**
- 18 cases is a pilot, not a measurement.
- The reference is Claude-annotated gold; two cases also carry a developer audit.
- Request cases have no frozen re-observation.
- The replay depends on private raw pages and the live store, which are not in this repository.
- Subject matching reuses the Phase272 rule: Jaccard ≥ 0.6 or a shared model code.

## 6. Support for future learning

- **Candidate patterns:** 6 are proposed. The feature `document_names_several_products` occurs in 5 successes too, so it is
  **non-discriminative**. The replay exposes this through its counterexamples instead of promoting it.
- **Discriminative candidate:** `subject_is_not_page_product` (F1: EX-01, 02, 03; F8: EX-06, 07), with one counterexample
  (EX-04).
- **Inside the cases:** each lesson stays a hypothesis attached to its cases. Nothing is fed back into extraction, teaching
  or ranking.
- **Regression gate:** the replay can serve as one. Any `lost_success` sets `regression: true`.

## 7. Roadmap problems found

1. **Step 2 must first gate the existing tuned change.** EX-05 shows that the Phase272 tuned mention rule has an
   unmeasured cost.
2. **Committed outcomes are not always exactly reproducible.** One-to-one whole-document scoring couples items (EX-11).
   Cases must record same-value siblings.
3. **Phase272 "lost" counts are partly scorer artefacts**, so they are unreliable as regression evidence.
4. **Each case needs its own historical build.** One frozen build cannot replay rules introduced later (EX-18), so builds
   must be retained or their worktrees recreated by commit.
5. **Features need versioned, discriminative detectors.** Today they are computed ad hoc in the builder.

## 8. Next step: effort and prerequisites (not started)

**Step 1B, gating the existing tuned attribution change.** Effort S.

**Scope:**
- add 4–6 cases of the EX-05 type with their twins;
- re-audit the 8 Phase272 "lost" items one case at a time;
- compute the replay cost of keeping vs reverting the change.

There is no extractor change.

**Prerequisites:**
- the existing private pages (no new HTTP);
- the frozen worktrees (c206c9a, 09526c4);
- one documented owner decision afterwards: keep or revert.

## Reproduce

Run from the engine directory, after `npx tsc -p tsconfig.json`. Each label is new; replays never overwrite.

```
node scripts/experience-replay.mjs <label>
node scripts/experience-replay.mjs <label> --current /home/user/p272-frozenB/engine/product-evidence-engine-v5.67-phase243/dist/src
node scripts/experience-replay.mjs <label> --inject-fault EX-14
node --test dist/tests/experience_cases.test.js
```
