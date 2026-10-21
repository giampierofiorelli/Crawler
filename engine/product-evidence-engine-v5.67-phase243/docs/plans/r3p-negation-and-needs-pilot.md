# R3-P: negation foundation and knowledge-guided needs pilot — report

**Owner authorisation:** `.claude/skills/pee-guided-learning/references/owner-r3p-authorisation-2026-10-20.md`, verbatim.

**Status:** the experimental package is complete. Nothing here claims R3, R4 or R5 complete. No production ranking was
authorised or produced.

Preregistration and seals:
- `evaluation/r3p/preregistration.json`;
- `negation-freeze.json` (stage 1);
- `needs-freeze.json` (stage 2, commit 41f1c64).

First runs, committed unchanged:

| Stage | Files | Commit |
|---|---|---|
| Negation | `negation-check-firstrun-{s103,r3p}.json` | 6e03e07 |
| Needs | `needs-check-firstrun-{s103,r3p}.json` | 7b3f48b |

Diagnosis: `needs-diagnosis-posthoc.json`, post hoc, under `needs-failure-causes.json` with amendments 1–3.

Builds:

| Build | Commit | Used as |
|---|---|---|
| S103 | 35fb8f4 | Baseline |
| R3-P stage 1 | b4fd4dd | Negation stage |
| R3-P stage 2 | 58676ef | Frozen build for arms A, B and C-lite |

Arms A and B run the same code with the same negation correction; only the knowledge switch differs (owner
requirement).

## 0. Outcome in brief

**Negation (stage 1).** The shared scope/negation/contrast reader removed the harmful inverse constraint and added no
new harm on the sealed T1 set. It is the one capability from this package that may be considered for controlled
(shadow) use.

**Needs pilot (stage 2).** On fresh, sealed material PEE finds very few of the shopper's needs in every arm:

| Arm | Correct needs (of 100 reference needs) | Invented |
|---|---|---|
| S103 | 7 | 4 |
| A | 7 | 4 |
| B | 10 | 6 |
| C-lite | 11 | 7 |

The development figures did not transfer: B found 46 of 57 labels on spent development requests, against 10 of 100
here.

**What causes the losses.** The dominant cause is upstream of needs: the product category is not recognised in 28 of
the 49 requests. When the correct category is supplied (post-hoc single-mechanism counterfactual), correct needs
triple:

| Arm | Correct, first run | Correct, category supplied |
|---|---|---|
| A | 7 | 21 |
| B | 10 | 31 |

**What knowledge adds.** B over A, with the correct category: +10 correct, +9 acceptable, +7 invented. Knowledge helps,
but one addition in four is invented.

**Where the knowledge went.** Of the needs whose category was recognised, 13 were missed because the relation exists
in the owner's research packages but was lost or altered on the way into the store (K-lost, each with a reconstructed
document-to-store chain). Only 3 are truly absent (K-absent). 10 were reachable and lost to the selection rule (S).

**No harm observed in the sealed material.** No hard exclusion changed between arms. No need was created from a
negated or indifferent aspect. No limit was applied that the reference does not apply.

**Recommendation.** Keep the needs interpretation experimental and shadow. Do not promote B. The next decision concerns
order:
- category/target recognition, which comes first in the dependency chain;
- recovery of the relations lost in acquisition (N1);
- the semantic consolidation (N0);
- hypothesis selection (N2).

§7 weighs these by severity, dependency and permanence, not by frequency.

## 1. Material and evidence tiers

**Stage 1 (negation): T1.**
- 40 Claude-authored requests and synthetic document passages.
- A blind Claude-agent reference, sealed.

**Stage 2 (needs): 49 requests.**

| Source | Requests | Tier |
|---|---|---|
| Fresh agent-authored (air purifiers 12, coffee 12, dishwashers 12, dehumidifiers 6) | 42 | T1 |
| Real Stack Exchange questions (CC BY-SA, API only) | 7 | Authentic wording |

Real-request shortfall: air purifiers 2/12, coffee 3/12, dishwashers 0/12, dehumidifiers 2/6. Most candidates were
repairs, installations or other products; the shortfall is declared, not filled (`needs-collection-receipt.json`).
Dehumidifiers form the transfer set, as they were not used in development.

**Reference.** Two blind Claude-agent annotations per set, adjudicated by a third:

| Set | Adjudications |
|---|---|
| Authored | 69 |
| Real | 19 |

This is not human validation.

**Label-list limit.** The preregistered label list held outcome and environment concepts only. Store concepts of
other kinds (`milk_drinks` task, `scale_buildup` failure, `grind_range` capability) could not be labelled. One correct
`milk_drinks` output per arm (request a21) was therefore scored as invented, because the reference used
`other:milk_drinks`. The first-run figures are kept unchanged; the post-hoc correction is +1 correct and −1 invented per
arm.

**Timing of the diagnosis protocol.** The protocol was registered before the sealed stage-2 first runs. It was
informed by the development runs and the stage-1 runs, and was amended three times before the seal, at the owner's
request.

## 2. Stage 1: negation, scope and contrast

**Mechanism.** One shared reader (`language_scope.ts`, QK pack `language.en.scope`, qk.2.6):
- proposition negation flips a bound and its closure;
- requirement negation ("I don't need more than…") yields a preference, never an applied limit;
- indifference ("doesn't bother me") is a stance;
- negated cues are masked in document reading (declaration cues over the full scope, test cues only when tight).

Four duplicate readers were retired: the Phase253 NEGATION / BOUND_NEGATIONS, the quantityBound no/not special case,
the Phase248 NEGATORS80 / CLAUSE80 and the Phase252 indifference patterns.

**First run (sealed, T1), S103 → R3-P:**

| Measure | S103 | R3-P |
|---|---|---|
| Limit read on the wrong side | 1 | **0** |
| Exact handling | 20 | 24 |
| Limits detected | 22 | 24 |
| Closure agreement | 21 | 23 |
| Missed limits that should apply | 14 | 13 |
| Over-cautious "ask" when the limit should apply | 2 | 0 |
| Harmful applied limits | 0 | 0 |
| Stance became a need | 6 | 6 |

All 6 "stance became a need" cases were examined post hoc: 5 are scorer artefacts (the words occur only in spans
marked "not interpreted"). 1 is real ("quietest", n10), corrected in the stage-2 build after the first run and labelled
as such.

**Documents.** Identical in both builds: 23 of 91 reference values read, role correct 13/16, 1 invented measurement and
1 result read as a declaration in both. The masking changed nothing measurable.

**Development regression.** On the 206 spent requests, 2 answers changed, both explained (r033 coverage side effect;
r106 "doesn't … break within 18 months" now a minimum, which is correct). Pages S89–S103 are unchanged.

**The owner's test cases (unit tests, `tests/r3p_language_scope.test.ts`)** behave as specified:

| Request | Result |
|---|---|
| "nothing over N" | Inclusive maximum |
| "more than N" | Strict minimum |
| "not less than N" | Inclusive minimum |
| "I don't need more than N" | No mandatory maximum |
| "noise doesn't bother me" | No quiet requirement |

**A gap the stage did not cover.** The negation of a *feature* has no representation in the answer. Probe sentences
written for the N0 design (not evaluation cases) showed that "I don't want a milk frother" yields the need
`milk_drinks` on the frozen build. The sealed needs material did not exercise this case: harmful stance counts are 0
in every arm. The error remains a demonstrated risk, not an observed error in the evaluation (§5).

## 3. Stage 2: needs pilot — first runs

The reference contains 78 expressed and 22 inferred needs. Figures are over the whole reference.

| Measure | S103 | A | B | C-lite |
|---|---|---|---|---|
| Expressed needs found (of 78) | 7 | 7 | 9 | 9 |
| Inferred needs found (of 22) | 0 | 0 | 1 | 2 |
| Correct needs output | 7 | 7 | 10 | 11 |
| Acceptable needs output | 2 | 2 | 6 | 6 |
| Invented needs output | 4 | 4 | 6 | 7 |
| Needs from negated or indifferent aspects (harmful) | — | 0 | 0 | 0 |
| Feature read as need | — | 0 | 0 | 0 |
| Limit applied when the reference does not | 0 | 0 | 0 | 0 |
| Exclusions changed between arms | — | 0 | 0 | 0 |
| Clauses left uninterpreted | — | 207 | 176 | 176 |
| Reference questions asked (of 110) | — | 18 | 18 | 18 |
| Features found (of 33) | — | 2 | 2 | 2 |

**By source.**

| Source | Requests | Reference needs | Correct, A | Correct, B | Correct, C | Invented, B |
|---|---|---|---|---|---|---|
| Real | 7 | 20 | 2 | 4 | 4 | 0 |
| Authored | 42 | 80 | 5 | 6 | 7 | 6 |

**By category (correct needs).**

| Category | Requests | Reference needs | A | B | C |
|---|---|---|---|---|---|
| Air purifiers | 13 | 30 | 0 | 1 | 1 |
| Coffee machines | 12 | 27 | 2 | 3 | 3 |
| Coffee grinders | 3 | 5 | 1 | 1 | 1 |
| Dishwashers | 11 | 17 | 1 | 1 | 1 |
| Dehumidifiers (transfer) | 8 | 19 | 3 | 4 | 5 |

**Development vs sealed.** On the 48 spent development requests, B found 46 of 57 labels and A 40. The collapse on
fresh material shows that stage-2 development was fitted to its material: anchors, thresholds and the cap of one were
all tuned there. This is the result the seal was designed to expose. It is reported, not explained away.

## 4. Diagnosis (post hoc, multi-label; supported explanations, not causal proof)

**Units and judges.** The units are each reference need missed by an arm and each output need the reference does not
support.
- **Mechanical tests:** field comparisons by the main session.
- **K-lost / K-absent / K-present:** an independent agent reading only the research packages and a read-only store
  copy, 31 units. Two of its 14 K-lost chains were re-checked against the source and the store by the main session,
  and both hold.
- **Invented needs:** an independent agent reading only the request, the reference and the statements, 21 units.
- **M (existing modules):** a counterfactual run of `researchUserGoal172` on all 49 texts.

Tags:

| Tag | Meaning |
|---|---|
| L-category-unnamed | The product category is not recognised and the request never names the product |
| L-category-named | The product category is not recognised although the request names the product |
| L-words | Need wording not recognised |
| S | The concept was reachable but not kept by selection |
| K-lost | The relation exists in a package but was lost or altered in the store; chain reconstructed |
| K-absent | Not documented |
| K-present | Already usable in the store |
| concept-not-in-catalogue | The reference needed an `other:` label |
| REP-not-a-need-concept | Budget or a buy-or-not decision, represented elsewhere |
| K-incorrect | An inferred need not supported by the statement |
| R | The reference is disputable |

**Arm B, 90 missed needs** (counts overlap):

| Tag | Units |
|---|---|
| L-category (unrecognised category) | 63 |
| — product never named | 42 |
| — product named but not recognised | 21 |
| concept-not-in-catalogue | 20 |
| K-lost | 13 |
| S (selection) | 10 |
| REP-not-a-need-concept | 4 |
| K-absent | 3 |
| L-words | 2 |

For arm A the same picture holds, except that the 10 S units appear as L-words: A has no selection stage.

**Arm B, 6 invented needs:**

| Cause | Units | What happened |
|---|---|---|
| L-category | 2 | Wrong category: an air-purifier request given a coffee-machine cost need; a grinder request given a dishwasher noise need |
| L-words | 1 | "water temperature" matched limescale |
| K-incorrect | 2 | "cutlery" and "water" matched incidental test-load and limitation statements |
| R (reference disputable) | 1 | The `milk_drinks` label-list artefact |

C adds one more invented need, judged defensible (R).

**Why the category is not recognised.** The concrete mechanisms found, each traced on the frozen build:
- a context object becomes a second product candidate ("the dishwasher runs while we watch telly" → dishwashers or
  televisions?);
- the purchase-phrase head picks the wrong noun ("Moving into a rented place… worth buying one?" → "moving");
- question forms without a purchase phrase ("Will a dehumidifier fix it?" → the mould);
- missing aliases ("purifier" alone, "air filter");
- cross-category word captures ("filters" → coffee machines; "grinder" + "household asleep" → dishwashers);
- requests that only describe a situation and never name the product (42 needs), where naming the category is
  itself an inference.

**K-lost: knowledge lost in acquisition.** The owner's packages contain consumer situation → criterion → evidence
tables. Translation into the store lost the situation wording, reduced subjects to row ids ("N17"), dropped the need
column, left needs as untyped text not linked to their concept, or created no row.

Example chain, re-checked:
- coffee package line 414 pairs "very little counter space" with "machine footprint including working clearances";
- the stored statement keeps only the criterion;
- that statement even carries an unrelated dehumidifier metric type.

This supports the owner's hypothesis: PEE acquired the technical facts but not the relations that say when they
apply.

**M: existing modules.** The counterfactual does not support M as a cause for these categories. Phase172 recognises
4 coffee requests and reads 5 noise requests (air purifiers, dishwashers, a grinder) as refrigerator noise. Re-using it
as it stands would add errors. The off-path Phase56/61/168 modules take structured input, not text.

**REP.** No sealed unit failed at a documented incompatibility (I-1…I-15). The 4 REP-not-a-need-concept units are
budget and buy-or-not decisions, which the reference recorded as needs and PEE represents as a limit or a question.
The demonstrated I-2 risk (rejected feature) was not exercised by the material.

**Survival measure (owner request).** The judge found 25 needed relations or concepts documented in the packages:

| Outcome | Count | Notes |
|---|---|---|
| Survived in usable form in the store | 11 (K-present) | 10 of them in requests whose category was not recognised |
| Lost or altered | 14 (K-lost) | |

A further 4 were not documented (K-absent), and 2 were budget limits outside category knowledge (undetermined).

**Causal status.** These are supported explanations. Only the category cause has a single-mechanism test (the oracle
counterfactual). The others need their own one-mechanism experiments:
- restore the lost package rows for the 13 K-lost units;
- relax the "a word must name the concept" rule for the 10 S units;
- add the missing aliases.

## 5. The owner's seven questions

**1. Did negation remove the harmful inverse constraint without new harm?**
- Yes, for limits, on the sealed T1 set: wrong-side reading 1 → 0, harmful applications 0 → 0, exact handling 20 → 24,
  no document regression, 2 explained changes in 206 development answers.
- No new harm appeared in the needs pilot (harmful stance 0 in every arm).
- Not covered: a rejected *feature* has no representation in the answer (I-2). The frother probe shows a
  demonstrated, unobserved-in-evaluation risk.

**2. Does B beat A because of knowledge?**
- First run (same code, same negation): B 10 correct vs A 7, invented 6 vs 4.
- With the correct category supplied (post hoc): 31 vs 21 correct, 12 vs 5 invented, 11 vs 2 acceptable.
- The gain is attributable to the knowledge switch, since that is the only difference. It is small in absolute terms,
  bought with invented needs (2 K-incorrect in the first run), and shown on T1-dominated material.
- Not shown: a reliable improvement.

**3. Which knowledge was inaccessible on the request path?**
- **K-lost:** 13 needed relations exist in the owner packages but were lost or altered on the way into the store.
- **Concept gaps:** 20 reference needs have no concept in the catalogue, among them compact size, taste, mobility,
  limescale, quiet during sleep for dehumidifiers, deciding whether to buy, and running cost for air purifiers.
- **Gated knowledge:** 11 needs whose knowledge is present but sits behind the unrecognised category.
- **Unlinked context:** no situation → outcome relation exists in the store (NR §2.1).

**4. Can C-lite propose useful relations without engineering?**
- Not shown. The 19 knowledge-derived candidate rules added 1 correct inferred need over B and 1 defensible extra, on
  fresh material.
- No candidate was written to pass tests: the rules were generated from stored teaching and admitted under S103.
- Too small to judge. It stays shadow.

**5. Does anything transfer?**
- Not shown beyond trivial counts.
  - Transfer set (dehumidifiers): A 3, B 4, C 5 correct of 19.
  - Real requests: B 4 vs A 2 of 20.
- The development → sealed collapse is evidence against transfer of the tuned stage-2 mechanism.

**6. Which limitations remain?**

| Kind | Limitation |
|---|---|
| Linguistic | Category and target recognition (63 of 90 B misses); alias gaps |
| Representational | Content kinds (feature vs outcome vs problem); rejected features; budget and decisions vs needs; the label vocabulary not matching the concept kinds |
| Scientific | Few K-absent needs (3); the knowledge mostly exists |
| Evidential | Stored statements are machine-translated and unreviewed; incidental word matches produce K-incorrect inferences |
| Architectural | Needs are computed only after a category is fixed; acquisition loses relational knowledge (K-lost); development tuning does not generalise |

**7. Is any narrow capability sufficient for controlled use?**
- The shared negation reader for numeric limits is, as a shadow capability on the request path (validated on sealed T1
  requests, no new harm, regression explained).
- The needs interpretation (B) and C-lite are not.

**Stop conditions of the authorisation:**

| Condition | Result |
|---|---|
| False exclusions increased? | No (0) |
| Attribution weakened? | Not applicable |
| Evidence insufficient? | Yes for real requests (7) and transfer |
| Results regressed against S103? | No (A equals S103) |
| Scope expanded? | No |

R3-P therefore stays experimental.

## 6. Capabilities by maturity and kind

| Capability | Kind | Maturity | Evidence |
|---|---|---|---|
| Shared negation/scope/contrast reader (requests, documents) | Inference (language) | Integrated on the request path, validated on sealed T1 | Stage 1 first run; 206-request regression |
| Negated need → preference (never an exclusion) | Inference | Integrated, validated on T1 | Stage 1; needs pilot harmful counts 0 |
| Knowledge-guided need interpretation (arm B) | Inference / transfer | Experimental, opt-in, shadow; fails on fresh material | Stage 2 first run |
| C-lite knowledge-derived candidate rules | Learning (proposal) | Experimental, shadow; no measurable value | Stage 2 first run |
| Failure-cause diagnosis (multi-label, K-lost chain) | Method | Used once, post hoc | This report |

## 7. What to decide next (owner decision; nothing authorised here)

Weighed by severity, dependency and permanence, not by frequency.

1. **Target/category recognition comes first in the dependency chain.** Needs are interpreted only once a category is
   fixed. It accounts for 63 of 90 misses, and the oracle counterfactual triples correct needs.
   - The permanent mechanism should not be more aliases alone. The packages' situation tables can also say which
     category a situation calls for (the same `activates` relation, at category level).
   - A context object must not become a second product.
   - It must be validated on unseen phrasing.
   - A situation-only request should still be answered by a question, as now.
2. **N1: recovery of lost relations.** This is a re-derivation of the packages' situation rows with document, line and
   hash, with concept-gap records (`teaching_relevance`, owner decision). It addresses the 13 K-lost needs and the
   concept gaps.
   - It is permanent and category-general.
   - It depends on 1 to reach the answer.
3. **N2: selection.** 10 S losses, plus the K-incorrect inventions from incidental words.
   - It requires the hypothesis groups and defeaters, validated against false positives before the cap of one is
     lifted (owner condition).
4. **N0: semantic consolidation.** No sealed failure was observed at a documented incompatibility. The rejected-feature
   risk (I-2) is demonstrated, and its severity is high because it inverts the shopper's meaning.
   - It is a prerequisite for representing rejections and content kinds, which 1–3 will need.
5. **Evaluation material.**
   - Extend the label list to all concept kinds.
   - Find a better source of real purchase questions; Stack Exchange yields mostly repairs and installations.
   - Report T1 and authentic tiers separately.

**Not recommended:** fixing the frozen build's errors one by one, adding category-specific phrases, or lifting the
cap of one before N2 is validated.

## 8. Records

Public counts are in `evaluation/r3p/`:
- `needs-check-firstrun-{s103,r3p}.json`;
- `needs-diagnosis-posthoc.json`;
- `needs-collection-receipt.json`;
- `needs-freeze.json`.

Private detail is in `$PEE_PRIVATE_EVAL_DIR/r3p/`:
- requests, annotations, references;
- run rows;
- diagnosis units and judgements;
- the oracle counterfactual run.

The real requests (CC BY-SA, with attribution) are not published in this commit; they are published with the
material only on the owner's instruction. The vertical contract D31 records the R3-P findings.
