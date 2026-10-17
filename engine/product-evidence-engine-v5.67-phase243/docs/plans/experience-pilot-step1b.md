# Continuous scientific learning — Step 1B: attribution reliability and dependable replay

This is the owner's Step 1B brief of 2026-10-17. It follows Step 1A (`docs/plans/experience-pilot-step1a.md`, commit
fc7a040) and supersedes no report. Corrections to earlier texts are recorded as a dated note (S42 in the skill's
supersession log).

**Constraints observed:**
- no HTTP;
- no change to production extractors, teaching, ranking or schema;
- the live store was only read;
- focused tests only.

**Tiers:**
- **T1:** synthetic fixtures.
- **T2-spent:** authentic pages of the Phase272 untouched set. The tuned Phase272 rule was written on this set, so these
  results are tuned results and never held-out evidence.
- Nothing in this step is independent validation. The gold is Claude-annotated, frozen before any run, and not
  author-independent.

## 0. Outcome

1. **PEE can now replay attribution experiences dependably.** Each verdict names its inputs (document bytes, the
   historical and current builds by reader-content hash, the plan digest, the matching rule and the scorer limits).
   - A changed knowledge state is reported as `incomparable_state`, never as a regression or a correction. This was
     shown on a scratch store copy.
2. **The replay recognises when a correction damages a success.** The tuned Phase272 rule does not attribute anything
   itself. It widens the document's product list, and that switches on an existing rule: *bind a value to the nearest
   product named before it in its sentence*.
   - On the spent set it corrects 8 values and breaks 2: EX-05, and the new case EX-19.
   - Both breaks have the same grammar: "X performs better than Y and Z at *v*" and "X has less lag (*v*) than Y".
3. **Explicit uncertainty can be measured instead of forced.** An evaluation-only counterfactual leaves a value unresolved
   when its sentence names two or more products before it.
   - It turns 3 wrong attributions into unresolved ones.
   - It also costs 4 correct ones.
   - So "unresolved" is safer, but this simple policy is not yet better.
4. **Most reported losses were not losses.** None of the 8 Phase272 "lost by guidance" items was found by the existing
   reader:
   - 4 are scoring artefacts;
   - 4 are genuine guided mislinks, hidden by de-duplication.

## 1. Verified builds, knowledge state and evaluation inputs

| Input | Verified state |
|---|---|
| Historical build | arm B c206c9a (`/home/user/p272-frozenB`, clean): its 8 extractor source hashes equal `evaluation/phase272/extractor-freeze-known.sha256`; reader-content hash `9ffce022…` |
| Current build | fc7a040: reader sources unchanged since that commit (`srcDirty:false`); reader-content hash `e0026e3b…` |
| Knowledge state | private store restored from `pee-knowledge/snapshot/pee246.sqlite`. Opening SQLite rewrites the file, so its bytes are recorded but not used for comparability. The **compiled plan digest per category** is the governing knowledge state; all observations used digests equal to `plans-frozen-known.json` |
| Document bytes | each page's SHA-256 checked against the wave receipt and the case record on every observation |
| Identity rule | core-token Jaccard ≥ 0.6 or a shared digit-bearing token; its digest (`8275855…`) is recorded with every replay |
| Scoring rules | committed historical states come from whole-document **one-to-one** scoring, and identical (value, unit, subject) leads count once. The replay observes each case on its own, so same-value gold siblings are flagged (`allocationAmbiguous`) |
| Reference | `gold-untouched.json`, frozen before the Phase272 first run (hash in `gold-untouched-freeze.json`); EX-06 and EX-07 add the recorded developer audit of naming variants |

**Tooling changes:**
- **`src/experience_cases.ts`:**
  - `AttributionClass`: correct, accepted variant, wrong product, unresolved but preserved, missing;
  - the `incomparable_state` transition;
  - class counts in the summary.
- **`scripts/experience-observe.mjs`:**
  - `buildIdentity`;
  - `MATCHING_RULE_DIGEST`;
  - the labelled `ambiguity_preserving` counterfactual.
- **`scripts/experience-replay.mjs`** (schema v2):
  - `--set` and `--policy`;
  - a provenance block;
  - the comparability check;
  - sibling flags.
- **`scripts/experience-pilot-build.mjs`:** `--set step1b`. The Step 1A set and its hash are untouched.
- **New:**
  - `scripts/experience-attribution-census.mjs`;
  - `src/experience_metamorphic.ts`;
  - `scripts/experience-metamorphic.mjs`.

**Knowledge-state demonstration:** `replay-s1a-changed-knowledge-demo`, run on a scratch copy with one television
teaching item removed.
- Exactly the 6 television cases become `incomparable_state`; the rest are unchanged.
- No regression is flagged.
- The copy was then deleted.

## 2. EX-05: cause and competing behaviours

The rule tuned after the Phase272 first run adds products to `documentMentions272` that are named at least twice in the
body or in a table header. On the LG B6 page the list grows from 1 product to 5.

The guided reader's clause rule (`clauseSubject` in `phase225_transient_test_probe.ts`) works like this:
- it was written before the tuning and is inactive while a page has fewer than two mentions;
- once active, it binds a value to the **nearest preceding** named model in the value's sentence.

| Sentence pattern (paraphrased) | Frozen (page default) | Tuned (nearest name) | Counterfactual (≥2 names → unresolved) | Reference |
|---|---|---|---|---|
| "X performs better than Y and Z … at *v*" (EX-05) | X ✔ | Z ✘ | unresolved | X |
| "X has less lag (*v₁*) than Y (*v₂*)" (EX-19, EX-20) | X ✔, X ✘ | Y ✘, Y ✔ | unresolved, unresolved | X, Y |
| "X's *v₀* is beaten by Y (*v₁*) and Z (*v₂*)" (EX-21) | X ✘ | Z ✔ | unresolved | Z |
| "X … twice as bright as Y (*v*)" (EX-22) | X ✘ | Y ✔ | Y ✔ | Y |
| one other product named near the value (EX-03, EX-23) | page ✘ | named ✔ | named ✔ | named |
| "matches the pricier P (both … *v*)" (EX-24) | page product ✘ | an unrelated third product ✘ | unchanged ✘ | P (and the page product) |

**Cause (confirmed by re-observation on both builds):**
- Proximity is right when the value sits in brackets directly after a product name.
- It is wrong when the value belongs to the sentence's grammatical subject and other products are named only as objects
  of comparison.
- EX-03 was corrected by the same proximity rule because its value follows its product directly.

**Census of the whole spent set** (`evaluation/experience/census-phase272-untouched.json`; 163 gold values, each observed
on its own):

| Behaviour | Correct | Wrong product | Unresolved (preserved) | Missing |
|---|---|---|---|---|
| Frozen arm B | 48 | 22 | 0 | 93 |
| Tuned (current) | 54 | 16 | 0 | 93 |
| Tuned + unresolved counterfactual | 50 | 13 | 7 | 93 |

- **Frozen → tuned:** 8 corrected, 2 broken.
- **Tuned → counterfactual:** 3 wrong become unresolved; 4 correct become unresolved.
- These counts describe the spent set, not held-out accuracy. They differ slightly from the Phase272 one-to-one scorer
  (20 → 15 wrong of 66).
- The census counts EX-23 as correct; see §3.

## 3. New success, failure and counterexample cases (EX-19 – EX-24)

These are 6 authentic cases from retained pages:
- the private set is `pee-knowledge/private-eval/experience/step1b-cases.json`;
- the public value-free index is `evaluation/experience/step1b-index.json`.

All 6 historical states reproduce on the frozen build, except EX-24, which is recorded unchanged.

| Case | Category | Historical | Tuned | Counterfactual | Role |
|---|---|---|---|---|---|
| EX-19 | TV | correct | **wrong** | unresolved | second regression of the EX-05 mechanism |
| EX-20 | TV | wrong | correct | unresolved | twin of EX-19 (same sentence) |
| EX-21 | TV | wrong | correct | unresolved | counterexample to "several names → unresolved" |
| EX-22 | TV (second page) | wrong | correct | correct | success of the tuned rule elsewhere |
| EX-23 | air purifier | wrong | "correct" | "correct" | **identity artefact**: the stored name is truncated (the word before the code is taken as the brand). It passes only through the shared model code |
| EX-24 | air purifier | absent (committed) | wrong | wrong | "both" statement. The committed "absent" is a de-duplication artefact; the tuned build moves the value to a third, unrelated product |

**Replays:**
- `replay-s1b-tuned-fc7a040`: lost 1, corrected 4, persistent 1.
- `replay-s1b-frozen-self` (control): preserved 1, persistent 5, no regression.
- `replay-s1b-ambiguity-cf`: lost 1 (now unresolved, not wrong), corrected 2, persistent 3.

The Step 1A set, replayed with v2 (`replay-s1a-tuned-fc7a040`), gives the same transitions as Step 1A. The new classes show
EX-05 as *correct → wrong product*; under the counterfactual it is *correct → unresolved* (`replay-s1a-ambiguity-cf`).

## 4. Metamorphic test results and limits (T1, fictional fixtures)

The fixtures and the expected results were fixed before either build was run. Results:
`evaluation/experience/metamorphic-{frozen-c206c9a,current-fc7a040}.json`.

| Relation (precondition) | Frozen | Current |
|---|---|---|
| MR1a: table body rows reversed (named table values exist) | holds | holds |
| MR1b: product columns swapped | **violated**: second-column values are not read | **violated**: same |
| MR2a/b: unrelated product paragraph after or before the results (named prose values) | holds | holds |
| MR3: page main product changed (a value whose sentence names a tested product) | **violated**: the values follow the page product | holds |
| MR3 oracle: "Korvo performs better than Zentra … at *v*" → Korvo | **violated** (page product) | **violated** (nearest name: Zentra) |

**Findings:**
- **MR1b is a recall defect, not an attribution error.** A table value is read only in the column next to the row label.
  The values that are read follow their column correctly.
- **The current build fixed MR3's page-product dependence.**
- **The oracle reproduces EX-05 on synthetic input.** MR3 itself holds on the current build while its oracle fails: a
  consistent wrong answer satisfies a relation. Metamorphic relations detect inconsistency, not correctness.

**Limits:**
- Three relations, one category plan, invented pages.
- These results are not evidence of accuracy on real pages.
- `tests/experience_metamorphic.test.ts` checks the harness with stub extractors. It does not assert that any build passes.

## 5. Genuine extractor failures versus scoring artefacts

The audit is in `evaluation/experience/step1b-loss-audit.json`. It is a developer audit, not independent.

| Item | Class | Evidence (paraphrased) |
|---|---|---|
| ap-q13 (EX-11) | scorer duplicate-allocation artefact | the reader emits **two** leads with this value (table and prose), and the scorer counts identical (value, unit, subject) leads once |
| af-o5, af-o11, af-o19 | scorer lenient-match artefact | arm E was credited through one shared word ("cook", "cooking") with unrelated sentences; no arm reads the speed finding |
| ap-o17, ap-o24, ap-o25, tv-o17 | **genuine guided mislink** | the plan links the clause to a wrong taught outcome (sensor → odour, app → quiet night, mode list → quiet night, "dialogue is clear" → motion clarity), and de-duplication then drops it, so it never becomes an exploratory lead |

**Summary:**
- 0 of the 8 were found by arm A.
- "Lost by guidance" therefore means "reached only by the knowledge-free exploratory arm".
- Genuine extractor failures elsewhere:
  - EX-05 and EX-19 (wrong product);
  - EX-24 (wrong product in a "both" statement);
  - EX-23 (malformed identity accepted by the matching rule);
  - MR1b (column-position recall).
- The mislink mechanism is the same family as the F2 false positives (EX-12, EX-13).

## 6. Observations retained with unresolved identity

- **Shipped behaviour:** the current build leaves a value unresolved only for table cells that occur in several columns.
  None occurred in the cases.
- **Counterfactual (evaluation only):** 7 of 163 values would be preserved as unresolved, 3 of them previously wrong.
  - Under the reference these do not count as correct.
  - They are not used for ranking.
- **"Both" statements (EX-24):** they need a multi-subject or unresolved representation. Neither exists today; this is
  recorded debt.
- **Unresolved retention in the store:** not implemented. Leads are transient, and no store change was made.

## 7. Risks of keeping versus reverting the tuned change

| Option | Gain | Harm |
|---|---|---|
| Keep (current) | +8 correct attributions | 2 previously correct values become wrong (EX-05, EX-19) and 1 value moves to an unrelated product (EX-24). A wrong identity is the worst outcome for a buying adviser |
| Revert to frozen | the two regressions disappear | 8 values return to the wrong (page) product; MR3's page-product dependence returns |
| Constrain (counterfactual) | 3 wrong become unresolved | 4 correct become unresolved; EX-24 is unchanged |

Every option still leaves wrong attributions (13–22 of 163). All these leads are classified unverified and never rank, so
the consumer risk today is in what later stages would do with them, not in current rankings.

## 8. Lessons: supported, contradicted and still provisional

- **Supported** (spent set plus synthetic):
  - nearest-name proximity is reliable for a value in brackets directly after a product name (EX-20, EX-21, EX-22);
  - it is unreliable when other products are named only as comparison objects (EX-05, EX-19, MR3 oracle);
  - a page-product default is wrong in comparison prose (EX-01, EX-03, MR3 on frozen).
- **Contradicted:**
  - the Step 1A lesson on EX-05 ("the reviewed product's values are still bound correctly"), for the tuned build;
  - the Phase272 reading of "lost by guidance" as a loss against the existing reader;
  - the idea that "several names in the sentence → unresolved" is safe without cost (EX-21).
- **Provisional:**
  - "adjacency binds, otherwise the grammatical subject, otherwise unresolved". It is a hypothesis built on the spent set
    and needs untouched pages.
  - "a model-code match is not an identity" (EX-23, one case).
  - "plan linking needs a stricter anchor than one shared word" (4 mislinks).

No lesson was promoted.

## 9. Skill update

`.claude/skills/pee-guided-learning/SKILL.md` gains **§0, the permanent strategic mission**:
- the cumulative-learning mission, the three kinds of learning and the closed cycle;
- uncertainty as a research problem: retain provisionally when permitted, investigate when worthwhile, never promote
  without support;
- the phase-assessment rule;
- the lesson requirements: provenance, applicability, counterexamples, maturity and rollback;
- a table separating the mission, verified capabilities, open debt and current-phase authorisation.

The existing sections are unchanged. S42 in `references/decisions-and-supersessions.md` records the corrections above.
There is no second skill.

## 10. Recommendation and next small step (not started)

**Decision: constrain, after further testing; do not revert now.** Keep the tuned change. Its clause bindings are already
labelled unverified and never rank. No production change is made until a frozen alternative wins on untouched pages.

**Proposed Step 1C (needs owner approval):**
1. **Freeze** an "adjacency → grammatical subject → unresolved" attribution rule, written only from development pages and
   EX-01 – EX-24.
2. **Evaluate it on 4–6 new untouched comparison reviews.** This needs an owner HTTP decision:
   - the Phase272 policy has 30 of 60 requests unused, but it is scoped to Phase272 and expires on 2026-10-24;
   - the readiness review recorded "no new HTTP budget".
3. **Annotate the gold before any run.** Then do one first run on three arms: frozen, tuned and constrained.
4. **Use as the acceptance criterion:**
   - zero new lost successes on the replay of EX-01 – EX-24;
   - on the untouched pages, no rise in wrong-product values and a stated trade-off for unresolved values;
   - the metamorphic relations as a regression gate.
5. **Track separately:** MR1b column recall, plan mislinks, and the "both" representation.

**Effort and dependencies:**
- **Effort:** M. About one session plus annotation.
- **Dependencies:**
  - the HTTP decision;
  - the frozen worktrees (c206c9a, 09526c4);
  - the private snapshot.
- **Without HTTP:** the rule can be frozen and replayed on spent data only. It would then be reported as tuned.

**Validation honesty:**
- **Implemented:** replay tooling, provenance, counterfactual and metamorphic harness.
- **Previously seen:** everything measured here (spent set).
- **Independent:** nothing yet.
- **Unproven:** any attribution rule's accuracy on new pages.

## Reproduce

Run from the engine directory, after `npx tsc -p tsconfig.json`. Labels must be new; nothing is overwritten.

```
node scripts/experience-pilot-build.mjs --set step1b
node scripts/experience-replay.mjs <label> --set step1b [--policy ambiguity_preserving] [--current <dist>]
node scripts/experience-attribution-census.mjs <label>
node scripts/experience-metamorphic.mjs <label> [--build <dist>]
node --test dist/tests/experience_cases.test.js dist/tests/experience_metamorphic.test.js
```
