# Third increment — goal understanding (C) and scientific relation interpretation (T): report, 2026-10-21

Owner authorisation: `.claude/skills/pee-guided-learning/references/owner-third-increment-authorisation-2026-10-21.md`
(verbatim). Preregistration before any code or material: `evaluation/i3/preregistration.json`. Sources were verified
before use: `evaluation/i3/source-verification.json`. All 8 exist; 6 are verified as cited and 2 are identified with
high or medium-high confidence; the corrections are recorded there.

Roadmap step served: **R3**; the work prepares C and R4. Nothing here affects answers, exclusions or ranking.

## 0. Outcome in one paragraph

Both parts were implemented, developed on spent material, frozen, and run once on fresh sealed material. **Neither met
its preregistered threshold.** Nothing is promoted.

- **C (goal understanding, shadow):**
  - It does what was designed: it separates requested, owned, context and rejected objects; it keeps hypotheses apart
    from needs, each with reason, references, conditions and counter-evidence (100% of hypotheses); it asks or abstains
    instead of always committing.
  - On 60 fresh requests it did not interpret problems better than the current path. Primary family found in 3 of 39
    non-named requests (current path: 1). It invented more families (25 vs 11) and made more unjustified commitments
    (16 vs 12). Its questions were judged neither better nor worse than the current ones (17 vs 17).
  - The main cause is measured: PEE's knowledge covers the primary family of only 11 of the 60 requests. On the other
    49, C fills the gap with the nearest family it knows instead of recognising that it does not know.
- **T (table semantics):**
  - A model of column types and links learned from the spent annotations looked better on development: F1 0.59 vs 0.50
    by leave-one-document-out.
  - On 70 rows of tables never sampled and disjoint by template, it collapsed: F1 0.14 vs 0.40 for the frozen header
    vocabulary. It had learned the meaning one template gives to "verification" columns.
  - Neither method reaches the admission bar (0.80 / 0.60).

## 1. Capabilities implemented (maturity: implemented in shadow; none validated)

| Capability | Where | Kind |
|---|---|---|
| Object roles: requested, owned, context, alternative, hypothesised (N0) **plus rejected** (shared negation scope) | `src/goal_understanding_c.ts` | inference |
| Product-family hypotheses from the store's goal- and situation-side knowledge (taught concepts, statements, optionally N1 claims), never a need: `hypothesis_unverified`, reason, support with references and shared words, conditions, counter-evidence | same | inference (hypothesis lane) |
| Action: commit only when the shopper names the family or one hypothesis clearly dominates; otherwise ask the question separating the leading hypotheses; abstain when no knowledge supports any family | same | inference |
| Alternative column methods for teaching tables (header + cell denotation; learned naive Bayes) and a learned link model; the frozen n1.1 default unchanged; learned models are data with provenance (`resources/knowledge-translation/relation-{role,link}-model.v1.json`) | `src/relation_claims_n1.ts` | inference, learning |
| Guard: claims of a non-admitted method cannot enter the store under the admitted mapping | `recordClaimsN1` (mapping check) | safety |

Tests: `tests/i3_goal_understanding_c.test.ts` (5) protect the shadow guarantee, the hypothesis fields, rejected and
owned roles, abstention without knowledge, and the T2 non-admission. C is not on the request path: no answer field and no
import from the advice path. Full suite: 5,056 passed, 0 failed. The 206 answers are unchanged (`evaluation/i3/advice-diff.json`).

## 2. Independent performance (first runs, committed unchanged)

**Material.**

| Set | Content | Annotation | Agreement before adjudication | Seal |
|---|---|---|---|---|
| R | 60 requests by a new independent author agent | two blind annotators + adjudicator | type 0.93, sufficiency 0.92, shared primary family 0.78 | `evaluation/i3/r-freeze.json` |
| H3 | 70 rows from 18 relation tables never sampled before, disjoint from all used tables by header template, in 9 documents | two blind annotators + adjudicator | exact links F1 0.72, column types 0.92 | `evaluation/i3/h3-freeze.json` |

H3 limit (declared): Claude saw these tables' headers during the D1 adjudication (first increment), and the tables come
from the same owner packages. Air fryers was an N1 development category; these are different tables.

**C on R** (`evaluation/i3/c-check-firstrun.json`, `c-judge-scores-firstrun.json`). C0 = current path, C1 = C, C2 =
C with N1 claims.

| Measure | C0 | C1 | C2 | Threshold |
|---|---|---|---|---|
| Non-named requests with the primary family among hypotheses | 1/39 | 3/39 | 2/39 | ≥ C0 + 20 points: **not met** |
| Families proposed (all requests): in plausible or acceptable / invented | 11 / 11 | 16 / 25 | 14 / 24 | invented ≤ 15%: **not met** |
| Unjustified commitments (committed when the reference says one family is not yet justified) | 12 | 16 | 15 | not above C0: **not met** |
| Correct abstentions (reference: nothing fits; 4 requests) | 1 | 4 | 4 | — |
| Unjustified abstentions | 1 | 1 | 2 | — |
| Named requests: family correct (21) | 7 | 7 | 7 | equal |
| Objects mentioned in PEE's vocabulary: found / role correct (18) | — | 16 / 7 | 16 / 7 | — |
| Questions, blind pairwise vs C0 (C better / C0 better / equal) | — | 17 / 17 / 9 | 8 / 6 / 1 | ≥ 60% of non-tied: **not met** |
| Questions addressing the key uncertainty (yes / partly) | 3 / 9 | 3 / 11 | 0 / 3 | — |
| Hypothesis justification fields complete | — | 35/35 | 34/34 | 100%: met |
| Support judged relevant (yes / partly / no; sample of 34) | — | — | 13 / 10 / 11 | — |
| Harm: answers changed; rejected family hypothesised | 0; 0 | 0; 0 | 0; 0 | 0: met |

Claims (C2) did not help C: the "claims help C" criterion is not met.

**T on H3** (`evaluation/i3/t-check-firstrun.json`). Exact links mean pair, direction and kind:

| Arm | Exact precision / recall / F1 | Pair precision / recall | Invented pairs | Column types | Provenance complete |
|---|---|---|---|---|---|
| T1 header vocabulary (n1.1) | 0.38 / 0.43 / 0.40 | 0.53 / 0.60 | 47% | 0.50 | 58 of 58 claims |
| T2 learned types + learned links | 0.13 / 0.15 / 0.14 | 0.36 / 0.42 | 64% | 0.39 | 58 of 58 claims |
| header + cell content (secondary) | 0.38 / 0.43 / 0.40 | 0.53 / 0.60 | 47% | 0.50 | — |
| learned types, chain links (secondary) | 0.20 / 0.24 / 0.22 | 0.38 / 0.46 | 62% | 0.39 | — |

Unsupported upgrades: 0 in every arm. Admission: **not met**. Improvement claim (T2 ≥ T1 + 0.10 F1): **not met**; T2 is
worse.

## 3. Harmful errors

- **C forces a known family on unknown problems.** On the 49 requests whose primary family is outside PEE's knowledge,
  C1 proposes an invented family in 20 (C0: 10) and commits to one in 15 (C0: 10). 11 of those 15 commitments come from
  the rule "one hypothesis clearly dominates", which compares families with each other but never asks how much of the
  message the knowledge explains.
- **Spurious support.** A third of the sampled supports are unrelated to the message: shared words that are not shared
  meaning.
- **The learned table model encoded a template.** Its main H3 confusion is method read as property (27 columns): on the
  N1 tables, "verification" columns held properties to verify; on H3 they hold methods. The header vocabulary's main
  confusion is method read as evidence (27), which is milder.

No harm reached an answer: C is shadow, and non-admitted claims cannot be stored.

## 4. Progress against baselines

| Area | Development (tuned, spent) | Independent first run |
|---|---|---|
| C, non-named, family found | 37/55 vs C0 12/55 | 3/39 vs 1/39 |
| T, F1 | 0.59 vs 0.50 | 0.14 vs 0.40 |

The development gains did not survive new material. This is the generalisation gap the owner's research warned about.

Real progress:
- the representation of hypotheses as separate from needs, with their justification;
- explicit abstention, with 4 of 4 correct "nothing fits" abstentions vs 1;
- tests that keep C out of every decision;
- a measured map of what PEE's knowledge covers.

## 5. Residual problems and prerequisites (the next steps the evidence points to)

1. **Coverage of knowledge is the first limit of goal understanding.**
   - 49 of 60 fresh requests ask about families PEE has never been taught.
   - Before better reasoning, PEE needs to recognise when a problem lies outside its knowledge, and say so.
   - Measured candidate rule, not implemented: commit or hypothesise only when the knowledge explains a sufficient share of
     the message's content words, otherwise ask or abstain.
   - Teaching new families is outside this increment.
2. **Shared words are not shared meaning.**
   - Hypothesis support needs the same typing the table work needs: what a phrase denotes (situation, goal, property,
     method), not only its stems.
   - The negation and stance scope already exists (N0); a role-compatible match does not.
3. **Learning from a few templates does not transfer.**
   - Any learned table method must be trained on annotations from many templates and checked by leave-template-out, not
     leave-document-out (documents of one package share templates).
   - The available annotated material is about 190 rows from about 50 tables. That is too few templates.
4. **Questions.** Generating a question from the top hypotheses' texts is no better than the current path. A useful
   question must target what separates the hypotheses (a situation fact), which needs typed knowledge (point 2).
5. **H3 independence limit.** Same packages, headers previously seen. A truly independent table set would need new
   documents (an owner package or retrieved sources); this was not requested, as instructed.

## 6. Alternatives considered

- **Header plus cell content** (the existing denotation reader): no gain on development or H3; the denotations are too
  coarse for column roles.
- **Learned with content features:** worse than learned without them on development; not chosen.
- **Removing the anchor guard:** not done. C uses a separate hypothesis lane instead, so the R3-P guard on needs stays
  unchanged.
- **A language model:** excluded (no heavy dependencies; Qwen suspended by the owner).

## 7. Records

- **Counts:** `evaluation/i3/*`.
- **Private material:** `$PEE_PRIVATE_EVAL_DIR/i3/` (requests, annotations, references, judgements, run detail), copied to
  pee-knowledge `private-eval/i3/`.
- **Skill references:** decision rows I3-start and I3-result; roadmap entries; contract debt D34.

## 8. Correction (2026-10-21, after the owner review)

§0 said C "separates requested, owned, context and rejected objects". That holds for the representation only. On the
sealed requests, 16 of the 18 objects in PEE's vocabulary were found, but only 7 of 18 roles were correct
(`evaluation/i3/c-check-firstrun.json`). Object-role assignment is therefore **not** a demonstrated capability. The
owner review that pointed this out is preserved in `.claude/skills/pee-guided-learning/references/owner-review-third-increment-2026-10-21.md`.
