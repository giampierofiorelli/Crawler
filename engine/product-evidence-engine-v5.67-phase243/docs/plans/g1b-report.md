# G1b: situation-linked scientific knowledge — report, 2026-10-21

| Item | Value |
|---|---|
| Owner authorisation (verbatim) | `.claude/skills/pee-guided-learning/references/owner-g1b-authorisation-2026-10-21.md` |
| Permanent requirement | `SKILL.md` §2b, bidirectional scientific knowledge |
| Preregistration | `evaluation/g1b/preregistration.json` (c8a8c2c), committed before development and material |
| Roadmap step | R3 |
| Supersedes | nothing |
| Linked from | decision row G1b-result, roadmap entry, open debt D35 |

No change was made to:
- ranking;
- evidence authority;
- the operational store;
- network-read authorisations;
- the set of categories.

## 0. Outcome

**1. The knowledge exists and is now represented in both directions, as a derived and rebuildable projection.**
- **What it is built from:** what PEE already held for its taught categories.
  - **Situation rows:** 926 consumer situations and needs from the owner packages and the store. Each row keeps its
    document hash and line, or its case or item id.
  - **Strategy links:** 167 rows are linked to stored no-purchase strategies through the experts' own guidance (for
    example "ventilation … before appliance advice"), with the sources' contraindications.
  - **General needs:** the quantity-knowledge aspects, use contexts and facets. They are recognised as needs, never as
    category evidence, and each is realised by the named category's own concepts.
- **Both directions are tested:**
  - need → strategies → categories;
  - category → the needs it may serve.

**2. Reaching that knowledge from a new problem is not yet demonstrated.**
- Three goal-first methods were compared on spent requests:
  - **M1:** word overlap;
  - **M2:** role- and specificity-gated coverage;
  - **M3:** M2 plus distributional similarity learned from the packages.
- None met the preregistered selection criterion: more relevant knowledge reached than C1, without more invented
  proposals. At the last reformulation M2 reached 11 of 24 against 9, but with 51 invented proposals against 18.
- So the goal-first path was **not frozen**, and both sealed sets stay **unspent for it**.

**3. What the diagnosis now separates (post hoc, spent material).** In 24 problem requests whose answer lies in PEE's
knowledge:

| Bottleneck | Requests | What happens |
|---|---|---|
| **Precision** | 12 of 24 | A relevant documented situation shares at least two content words with the request. Word-level methods do find these rows, but rare, meaningless words outweigh them and produce inventions. |
| **Paraphrase** | 12 of 24 | No relevant row shares two content words: the knowledge exists in other words. |

Neither role gating nor distributional similarity learned from the packages solved either one.

**4. The G1 residues on the operational path are closed or isolated.**

| Residue | Result |
|---|---|
| Questions with a cause | 54 of 54 questions now carry their cause. The 10 that compensate for a limit of PEE say so in the answer. |
| Expressed limits lost | Fell from 19 to 4 of 65 on spent material, and from 12 to 10 of 32 on the G1 set (not an independent measure; §4). **Not closed** |
| Decision fields | Unchanged |

## 1. Implementation

### 1.1 Knowledge (`src/situation_knowledge_g1b.ts`, shadow, derived, no store write)

**Sources.** Only taught categories:

| Source | What is taken |
|---|---|
| Owner packages: air fryers, coffee, dehumidifiers, dishwashers, air purifiers, televisions | N1 row roles (situation, need, alternative, condition and caveat cells) and the structured consumer-need cases (utterance, goal, evidence and the inference to avoid) |
| Store | Goal- and situation-side concepts and the 9 stored strategies |

Inventory: `evaluation/g1b/inventory.json`, 1,653 rows, 926 after removing duplicates.

**Untaught packages are excluded:** robot cleaners, soundbars and speakers.

**What each part of the projection means.**

| Part | Meaning |
|---|---|
| Situation row | A documented expression with its guidance, provenance and `epistemic:'documented_relevance'`. It never asserts causation. |
| Strategy link | The row's guidance names terms specific to a stored strategy, or the row is that strategy's own concept. 167 rows are linked. Links cross categories when the source does: a dehumidifier row can lead to "ventilation", which is stored under air purifiers. |
| Contraindications | Directive guidance ("do not recommend an appliance as a substitute for repair") and the structured cases' inferences to avoid. They are kept as conditions and never used as evidence. |
| General needs | The quantity-knowledge aspects, use contexts and facets: noise, small space, night bedroom, residue… They are recognised as needs and excluded from category evidence. In a named category they are realised by that category's own concepts and their `measured_by` relations, so the measurement stays specific to the category (§2b, rule 1). |
| Category → needs | `needsOfCategoryG1b` reads the same rows from the other side. |

**Tests (`tests/g1b_situation_knowledge.test.ts`, 5).**
- Provenance on every row.
- Identical rebuild.
- No store write.
- Both directions.
- "quiet" alone points to no category.
- A general need is realised in the named category.
- Shadow, and outside knowledge with a typed research need pending authorisation.
- Residues R1–R3.

### 1.2 Goal-first methods (shadow)

- **M1:** idf-weighted word overlap.
- **M2:**
  - only the request's own content counts: object mentions, negated or indifferent words, and function words are
    excluded;
  - general needs are kept apart;
  - category spread is weighted;
  - a coherence gate requires two content words, or one specific word;
  - from development iteration it2: a coverage cosine.
- **M3:** M2 plus PPMI co-occurrence similarity learned only from the taught packages. No external model, no new
  dependency.

### 1.3 Operational residues (test-first; `phase253_request_advice.ts`, `request_coverage80.ts`, `phase253_advice_contract.ts`)

| Fix | What changed |
|---|---|
| R1 | Stated limits are kept, and request coverage applies, in every answer, including out-of-scope ones. A one-word clause naming a general need ("and is quiet") is reported when nothing used it. |
| R2 | A limit read but not mappable to anything PEE checks (`unmappedConstraints`) is reported as stated but not checked, never silently consumed. |
| R3 | `questionCauses` on every question: `user_only`, `not_understood`, `knowledge_gap` or `integration`. A question that makes up for PEE's own limit (`not_understood`) comes with a limitation that says so. |

## 2. Development results (spent I3 set; `evaluation/g1b/dev-it0..it3.json`)

Problem requests (39); 24 have a taught relevant family or a relevant stored strategy.

| Method / iteration | Reached (of 24) | Relevant no-purchase strategy (of 10) | Invented proposals | Selection criterion |
|---|---|---|---|---|
| C1 (baseline) | 9 | 0 | 18 | — |
| M1 | 16 | 9 | 189 | no |
| M2 it0 | 12 | 4 | 110 | no |
| M2 it1 (coherence gate, spread weighting) | 10 | 4 | 74 | no |
| M2 it2 (coverage cosine 0.30) | 3 | 0 | 21 | no |
| M2 it3 (cosine 0.15 + gate; last) | 11 | 2 | 51 | no |
| M3 (each iteration) | = M2 | = M2 | ≈ M2 | no |

**Post-hoc checks, not reformulations (`dev-it3-posthoc-keep-general-terms.json`).**
- Keeping general-need words as evidence changes nothing (11, 52), so it is not the cause.
- An oracle check finds a relevant row sharing at least two content words in 12 of the 24 requests: 6 of 10 for
  strategies.

**Conclusion of development.**
- The knowledge projection can link situations, needs and strategies, including cross-category no-purchase ones.
- The matching methods available without a semantic model cannot select it with enough precision.
- About half of the problems are expressed in words the knowledge does not share.

## 3. First independent verifications

**GF: not run.** As preregistered, a method that did not pass development is not run on sealed material. Both sets stay
available:
- **G1 set:** first GF check, with its declared limit that aggregate results of other arms were seen.
- **New G1b set:** 75 requests, sealed, never read (`evaluation/g1b/n-freeze.json`):
  - written by a new independent author agent;
  - 38 of the 75 state explicit limits;
  - agreement before adjudication: category-needed 1.00, sufficient 1.00, outside-catalogue 0.97, primary-strategy
    overlap 0.73.

## 4. Residue check (G1 set, one run; `evaluation/g1b/residue-check-firstrun.json`)

**Not independent for the operational path:** the same set measured C0 in G1, and its aggregates were seen. The fixes
were designed on spent material only.

| Measure | G1 (C0) | G1b (C0) | Preregistered |
|---|---|---|---|
| Expressed limits lost (32) | 12 | **10** | ≤ 4 on the new set: not assessable there; not met here |
| Questions carrying a cause | 0 of 54 | **54 of 54** | 100% met |
| `user_only` questions where the reference records a user-only uncertainty | — | 43 of 44 | — |
| `not_understood` questions with PEE's limitation stated | — | 10 of 10 | — |

**On spent material** (206 set and I3), limits lost fell from 19 to 4 of 65.

**On the G1 set,** the remaining losses are qualitative limits the coverage counts as covered. They are not diagnosed
case by case, to keep the set clean.

## 5. Regression and suite

**206 requests:** 34 answers changed (`evaluation/g1b/advice-diff.json`), in three kinds of field only:
- coverage statements;
- unassessed parts;
- limitation statements.

Shortlist, exclusions, ranking, category, needs, response and constraints are unchanged in all 206.

**Question causes on 266 spent requests:**
- 130 `user_only`;
- 21 `not_understood`;
- 0 unclassified.

**A5 census** re-reviewed: three read-only `store.db` accesses in the shadow module; no write, event or table change.

**Full suite:** 5,070 passed.

## 6. Transferability

- **What transfers by construction.**
  - The projection is category-agnostic code over category-specific sources.
  - Strategy links cross categories where the expert guidance does.
  - The category direction reuses each category's own concepts and measurements.
- **What is not shown.** That a new problem is mapped to the right knowledge. This failed on development, so no claim
  of transfer is made.

## 7. Limits

- Development used one spent set (I3, 60 requests; 24 problem requests with reachable knowledge). The strategy key comes
  from one blind agent.
- The oracle and post-hoc checks are post hoc.
- N1 header roles are the admitted vocabulary n1.1. Its column roles are imperfect (H1 exact 0.37), so some package rows
  are mis-roled or missing; the dehumidifier package gives only 17 rows.
- The residue measure on the G1 set is not independent, and its "kept" test is a word and number overlap.

## 8. What this means for the next decision (not authorised)

The binding problem is now precisely located: **reading a described problem as one of the situations PEE already
knows.** Neither the knowledge nor its representation is the bottleneck any more.

Two directions could address it, each validated once on the still-unspent sealed sets:

| Direction | What it means | What it needs |
|---|---|---|
| **A. Typed situations from the packages** | Claude-authored, reviewable typing of the 926 rows into situation types (for example "excess indoor moisture", "cooking odour") with provenance, aggregating the many expressions each type has, plus a matcher over types rather than single rows. | No new dependency. Precision should rise, because types pool evidence; paraphrase coverage rises only as far as the pooled expressions reach. |
| **B. A small local sentence-embedding model** | Comparing a request with situation expressions by meaning, offline. | It addresses paraphrase directly, but is a model dependency the owner has excluded so far, so it needs an owner decision. Measured, it would show how much of the paraphrase gap a semantic matcher closes. |

**Recommendation:** run A first, because it needs no dependency decision. It still needs its own preregistration and
the owner's go-ahead, since G1b's reformulations are spent. Then measure the paraphrase residue it leaves,
and decide on B with that number.

**Residue M6:** the remaining qualitative limits need a diagnosis on new spent material, before any further operational
change.

## 9. Maturity and kind

| Capability | Maturity | Kind |
|---|---|---|
| Situation-linked knowledge projection, both directions | implemented in shadow, tested (wiring) | vocabulary, inference |
| Goal-first reading over it | not validated (development criterion not met) | inference |
| Questions with a cause | **operational** | integration |
| No silent loss of stated limits | **operational**, partial | integration |

## 10. Correction (2026-10-21, after the owner review)

**What §8 said.** "Neither the knowledge nor its representation is the bottleneck any more."

**Why that is too definitive.** The owner's review
(`.claude/skills/pee-guided-learning/references/owner-review-g1b-2026-10-21.md`) points out three things:
- the tests show that the structure can be built, rebuilt and read in both directions, not that its links are
  scientifically correct;
- the N1 roles the projection relies on did not reach their accuracy threshold (H1 exact 0.37), so some roles and links
  may be wrong or missing;
- a perfect retriever cannot correct errors in the knowledge it indexes.

**The corrected reading.** Three capabilities remain distinct and unmeasured, each needing its own measure:
1. retrieval accuracy;
2. the scientific correctness of the retrieved links;
3. the final strategy decision.

**On the comparison.** The PPMI similarity tested here (M3) is an elementary distributional method learned from the
packages. It is **not** a test of a pretrained sentence-embedding model, and its failure says nothing about one. The
§8 sequencing ("A first, then B") is superseded: the owner will send one consolidated prompt comparing:
- A: typed situations;
- B: local embeddings;
- A+B;
- A+B with relation checks.
