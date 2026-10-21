# Second increment N1 — scientific relations recovered as row claims (report, 2026-10-21)

Owner authorisation: `.claude/skills/pee-guided-learning/references/owner-n1-authorisation-2026-10-21.md` (verbatim).
Collateral research, byte copy: `research-n1-scientific-relations-2026-10-21.txt`. It was used as hypotheses, not
instructions. Preregistration before any code or gold: `evaluation/n1/preregistration.json`.

Roadmap step served: **R3** (translation fidelity and completeness). The work also prepares C and R4 without anticipating
their decisions.

## 0. Outcome in one paragraph

PEE can now hold the relations of a teaching-table row as one structured claim, kept in the same store (v14):
- the row's cells with their roles;
- the links between them, with each condition or caveat attached to the link it qualifies;
- the document SHA-256, line and cell hashes;
- a status of *teaching relevance, machine-derived, unreviewed*.

The claims rebuild exactly from the document bytes. They never change an answer.

On the **held-out** rows, the frozen mechanism finds which columns are related reasonably well (H1 pair precision 0.81,
recall 0.66). It often gets the **kind or direction** of the link wrong (exact precision 0.37, recall 0.30), and it
invents 19% of its pairs. The preregistered admission bar is precision ≥ 0.80, recall ≥ 0.60 and invented ≤ 10%. It is
**not met**, so **no claim was written to the live store**.

On 48 sealed fresh requests:
- recovered relations **did not** improve need understanding (B+N1 = B);
- retrieval over them was **not** better than over the existing statements, and was more often contradicting (11 items
  vs 2).

The store as written today keeps almost none of these relations (exact link recall 0.00–0.02). So the recovery is a real
gain in *representation*. It is not yet a demonstrated gain in *use*.

## 1. What was built (implemented; maturity: proposed, shadow)

| Piece | Where | Kind |
|---|---|---|
| Header vocabulary (general; no category, product or food words), built from development headers only | `resources/knowledge-translation/relation-roles.v1.json` | vocabulary |
| Row claims: roles, chain links (situation → need → function/property → method/evidence), qualifiers, provenance, mapping version | `src/relation_claims_n1.ts` | inference (relevance only) |
| Store v14 `relation_claims_n1`. Schema enforces `claim_type='teaching_relevance'`, `ranking_input=0`, support hypothesis/reviewed | `src/phase246_knowledge_store.ts` | storage |
| Record (idempotent, one transaction with its event); supersede by mapping or document bytes; review (verified receipt, full receipt in the journal); rebuild check | `recordClaimsN1`, `reviewClaimN1`, `rebuildCheckN1` | durability (A5) |
| Projection to phase247 edges where both ends are taught items (`measured_by`, `may_support`, always hypothesis); writes nothing | `claimEdges247N1` | compatibility |
| Retrieval over statements (R0) or claims (R1), category optional | `retrieveKnowledgeN1` in `src/need_interpretation.ts` | retrieval |
| Opt-in switch `needInterpretation.claims`: claim pairs join arm B through the **unchanged** R3-P guards | `knowledgeOutcomes(…,{claims})`, `claimStatementsN1` | experimental consumer |

**Safety invariants**, tested in `tests/n1_relation_claims.test.ts` (7 tests):
- the switch never changes the answer;
- an inferred need from a claim is `experimental_unverified` with the claim in its path;
- phase247 relations and assessments are untouched;
- a review never turns relevance into a result.

**Contract and records**:
- the request path now imports `relation_claims_n1` and `knowledge_translation` (imported, not executed unless the switch
  is on), recorded in `vertical-contract.json`;
- the A5 static census was re-measured (external store writes 13 → 16, all in one transaction with their event);
- the new evaluation scorer is registered as a reviewed reader of the experimental field (C2 permanence test);
- open debt **D33** is registered.

## 2. Knowledge recovered and correctly represented

**Store copy.** Claims of every translated document were derived onto a store copy (`evaluation/n1/materialise.json`;
the live store was never written). The copy holds 1,010 row claims, 1,537 links, 464 qualifier attachments and 3,087
participants:

| Category | Claims | Links |
|---|---|---|
| air_fryers | 135 | 310 |
| air_purifiers | 85 | 141 |
| coffee_machines | 43 | 62 |
| dehumidifiers | 17 | 68 |
| dishwashers | 440 | 656 |
| televisions | 290 | 300 |

Links by kind: `assessed_by` 848, `relevant_to` 525, `addressed_by` 164.

**Durability (L2) on the store copy:**

| Check | Result |
|---|---|
| Rebuild from document bytes and mapping | equal for 1,010 of 1,010 |
| Re-run | 0 new rows |
| Duplicate input | 0 new rows |
| A write failing validation | refused, rows and journal unchanged |
| phase247 relations, assessments, statements, items | unchanged |
| Journal hash chain | intact (1,974 events) |

**Representation comparison** (preregistered; development criterion: the simplest form with no loss). Measured on all
1,010 claims:

| Form | Rows reconstructed exactly | Links with a slot | Qualifier attachments kept |
|---|---|---|---|
| (1) phase247 edges only | 0 | 1,012 have a kind; 6 have both ends as taught items | 1 of 464 |
| (2) row claim | 1,010 of 1,010 | all | 464 of 464 |
| (3) claim + projection | as (2) | 4 projected edges | as (2) |

Chosen: (2), with (3)'s projection available read-only. `relevant_to` has no phase247 kind, and almost no cell is a
taught item. Writing claims as edges would therefore either lose them or create items from cell text, which is bulk
translation by another name.

**Fidelity (L1).** Exact means pair, direction and kind all match:

| Set | Status | Arm | Exact precision / recall | Column pairs precision / recall | Invented pairs | Qualifiers right on matched links |
|---|---|---|---|---|---|---|
| Development, 40 rows (dishwashers 26, air fryers 8, coffee 4, air purifiers 2) | **tuned, spent** | T1 it0 → it3 | 0.48 / 0.54 → **0.78 / 0.79** | 0.58 / 0.65 → 0.88 / 0.89 | 42% → 12.5% | 0.79 → 0.92 |
| Development | | T0 (store as written) | 0.03 / 0.02 | 0.10 / 0.05 | 90% | — |
| **H1 held-out**, 50 rows (televisions 40, dehumidifiers 10) | first run | T1 | **0.37 / 0.30** | **0.81 / 0.66** | 19% | 0.72 |
| H1 | | T0 | 0.00 / 0.00 | — | — | — |
| **H2 held-out**, 30 rows (speakers, soundbars, robot cleaners; never translated) | first run | T1 | 0.38 / 0.40 | 0.58 / 0.61 | 42% | 0.47 |
| All 80 held-out rows | first run | T0 | 0.00 / 0.00 | 0.24 / 0.04 | 76% | — |

- **Column roles (L0)** agree with the D1 adjudicated roles on 0.83 of development columns, 0.54 for H1 and 0.69 for H2.
- **Unsupported upgrades** (a link typed as establishing or causal): **0** everywhere. No claim says more than relevance.
- **Rows asserting no relation:** the held-out reference had none, so this check is untested.

Development change log: three reformulations, all general rules, each in the vocabulary's `noteReformulations`. Then
frozen (`evaluation/n1/freeze.json`). Development rows came from one repeated dishwasher template (26 of 40). The gap
between development (0.78) and held-out (0.37) shows that the rules fit that material more than they generalise.

## 3. Knowledge actually usable

**Need understanding (L4)** on 48 fresh requests. They were written by an independent agent: 12 per category, half
naming the product. They were annotated blind twice, adjudicated and sealed (`evaluation/n1/q-freeze.json`).

| Arm | Expressed found (of 64) | Inferred found (of 28) | Correct | Acceptable | Invented | From recovered relations | Answer changed | Harm |
|---|---|---|---|---|---|---|---|---|
| A (no knowledge) | 5 | 2 | 7 | 1 | 4 | — | — | 0 |
| B (statements) | 6 | 3 | 9 | 5 | 6 | — | 0 | 0 |
| B+N1 | 6 | 3 | 9 | 5 | 6 | **0** | 0 | 0 |

The consumer claim (≥ +3 reference needs over B) is **not met**.

Post-hoc diagnosis (`evaluation/n1/l4-diagnosis-posthoc.json`, frozen code unchanged):
- **23 of 48 requests get no category.** All situation-only requests but one fall here, and arms B and B+N1 infer only
  inside a recognised category.
- **Where a category was recognised,** claims reached 71 outcomes. Statements already reached 69 of them. The other 2 were
  stopped by the R3-P anchor guard (a request word must name the outcome). That guard is kept: it is the guard against
  invented needs.

**Retrieval (L3)**, top 5 per request:
- Items from both arms were pooled, shuffled and judged blind by two Claude agents, each covering half the requests
  (575 items, `evaluation/n1/l3-scores-firstrun.json`).

| Category | Arm | Requests with a relevant item | Relevant / irrelevant / contradicting | Irrelevant share |
|---|---|---|---|---|
| as recognised | R0 statements | **40** | 111 / 122 / 2 | 0.52 |
| as recognised | R1 claims | 38 | 92 / 106 / **11** | 0.51 |
| withheld (unknown) | R0 | 39 | 100 / 137 / 3 | 0.57 |
| withheld (unknown) | R1 | 36 | 90 / 138 / **12** | 0.58 |

- The L3 criterion is **not met**: fewer requests have a relevant item, and contradicting items are far above 2.
- Contradicting claims were mostly the "opposite situation" (7 of 12): a row sharing the request's words but describing the
  reverse case, or a need the shopper rules out.
- Retrieval does not yet apply the request's stances (negation, indifference), unlike need interpretation.

## 4. Independent results and generalisation

**Independent material.**
- H1, H2 and Q were never used in development.
- References were sealed before any N1 code ran on them: L1 at e6c63fa, Q at 85f6898. The freeze was committed at 1550cb5,
  before the first runs.
- **Disclosure:** the developer saw one H1 row's format, and some H1 headers during the D1 adjudication. No rule was built
  from them.
- All first runs are committed unchanged: `heldout-l1-firstrun.json`, `needs-check-firstrun.json`,
  `l3-scores-firstrun.json`.

**Generalisation.**
- Which columns relate transfers moderately to unseen documents (H1 pairs 0.81 / 0.66). It transfers poorly to packages of
  never-translated categories (H2 0.58 / 0.61).
- Link kinds do not transfer. On televisions the pair is right in 92% of predictions, but the kind or direction in 8%.
- Post-hoc cause: headers naming a verification activity ("Required verification", "Verification needed") hold the
  **property to verify**. The annotators read them so; N1 reads them as a test method.

**Tiers.**
- Requests: T1 (Claude-authored by an independent agent).
- References: Claude agents only (two blind annotators plus an adjudicator). No human validation.
- Agreement before adjudication on L1: exact links F1 0.79, column pairs F1 0.92, column types 0.84.

## 5. Errors, limits, regressions, uncertainty

- **Admission failed.** Claims stay on store copies (`~/.cache-i2/n1/`), and no live-store write was made. Opening the
  live store with this build adds the empty table (migration v14). That is a schema change, not a knowledge change.
- **Small and unbalanced samples.** H1 dehumidifiers had 10 rows, and 6 held-out row contents are duplicated across
  documents. Development was dominated by one template.
- **One mapping version.** The vocabulary is a fixed set of English header cues. Headers outside it fall back to `other`,
  and that row loses its links.
- **Regression.** The 206-request answers are unchanged on both the live-store copy and the claims copy
  (`evaluation/n1/advice-diff-live.json`, `advice-diff-claims-store.json`).
- **Full suite:** 5,051 passed, 0 failed (first increment 5,044; plus the 7 N1 tests).
- **Changed tests** (each extends a list earlier increments also extended): the v3 simulation drops the new table; the
  pinned schema history names v14; the C2 permanence list names the new scorer.
- **G2 is unchanged.** `relation_assessments` are still not rebuildable from the journal. Claim reviews are: the journal
  carries the full receipt.

## 6. Alternatives considered and why not

- **Fix the existing translator (T0).** Its statement is binary and anchored on one subject cell. A row with a situation,
  goal, attribute, test and caveat cannot fit, and that is the D1 cause. Patching it would add a second meaning to the
  same rows.
- **Write claims as phase247 relations.** That table's key is binary and its ends must be items. Measured: 0 rows fully
  representable and 463 of 464 qualifiers lost. It would also make every consumer of `relations247` see unreviewed
  material.
- **A separate database or engine:** excluded by the owner.
- **A language model for roles and links:** no heavy dependencies; Qwen is suspended by the owner.
- **Use the D1 adjudicated roles as input:** that would put gold into the mechanism.
- **Treat situation → need as a link.** Rejected on development: the guide's `relevant_to` targets a property. The
  situation stays a participant, and the consumer pairs it with the row's need by role.

## 7. Prerequisites left for C, N2 and R4

**For N1 admission** (a new mapping version, evaluated on fresh held-out rows, never on H1/H2 again):
- header semantics of verification columns ("what to verify" vs "how to verify");
- link-kind evidence from cell content, not only headers;
- rows that assert nothing.

**For C** (object roles; goal → solution family):
- situation-only requests need a category or solution family before any knowledge can act. 23 of 48 had none: that is the
  first loss point.
- N1 claims are available there as candidate links situation → need → function (`addressed_by` 164 on the copy). They are
  unreviewed and hypothesis-only.

**For N2 (needs):**
- retrieval must apply the request's stances (negation, indifference) before any claim is shown; 7 of 12 contradictions
  came from this;
- the one-inference-per-request limit and the anchor guard should be re-examined only on sealed material.

**For R4 (evidence):**
- `assessed_by` links (848 on the copy) name what verifies a property, with qualifiers. Projection to phase247
  `measured_by` needs the cell → taught-item alignment, which today succeeds for almost no cell (6 links).

## 8. Records

- **Evaluation files** (counts only): `evaluation/n1/{preregistration, l1-annotation-guide, l1-freeze, q-freeze, freeze,
  dev-l1-it0..it3, heldout-l1-firstrun, needs-check-firstrun, l3-scores-firstrun, l4-diagnosis-posthoc, materialise,
  advice-diff-*}.json`.
- **Private material:** annotations, references, judgements, detail and request texts in `$PEE_PRIVATE_EVAL_DIR/n1/`,
  copied to pee-knowledge `private-eval/n1/`. No page bytes, no store copies.
- **Skill references:** decision rows N1-start and N1-result; roadmap progress entry; contract open debt D33.
- **Full suite:** 5,051 passed, 0 failed, after the three test-list updates in §5.

## 9. Owner review (2026-10-21, after this report)

The owner's review is preserved verbatim in `.claude/skills/pee-guided-learning/references/owner-review-n1-2026-10-21.md`;
its cited figures were checked against the committed records.

- **Status:** N1 is a completed first experiment, not a failure to redo. The representation and its rebuild are
  established; operational scientific capability is not validated. Claims stay off the live store.
- **Not to do:** repeat N1 by adding header rules for the held-out categories.
- **Fourth finding:** the guard requiring a request word that names the outcome can block the reasoning PEE should
  develop. The protection stays, but a scientifically motivated hypothesis must be kept apart from a need attributed to
  the user. A hypothesis may be considered, checked and turned into a question; it never becomes a requirement or an
  exclusion automatically.
- **Proposed next (not yet authorised):** C in shadow, and general semantic table understanding by comparing methods, in
  parallel. Success should include handling new problems, recognising what PEE does not know and asking better questions.
