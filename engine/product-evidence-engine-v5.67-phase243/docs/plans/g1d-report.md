# G1d — Scientific relation integrity and verified semantic retrieval: report

- **Date:** 2026-10-21.
- **Authorisation:** verbatim in `.claude/skills/pee-guided-learning/references/owner-g1d-authorisation-2026-10-21.md`.
- **Preregistration:** `evaluation/g1d/preregistration.json` (committed before any run).
- **Roadmap step:** R3 (kind: inference, learning; relations, retrieval).
- **Maturity:** proposed. Nothing is promoted.

## 1. Outcome

**The source examination confirms and explains the G1c finding.**

- Of the 70 G1b situation → strategy links, two new blind judges reading the original source passages found that **51 concern
  nothing the source says**, 4 are mere co-mention and 13–15 are supported or conditional. The judges agreed on 68 of 70.
- The main cause is structural, not semantic. In **18 of the 24** relations the sources do assert, the asserting clause sits in
  a column the G1b projection never kept. G1b then linked on any strategy word left in the remaining cells ("leak risk" of a
  countertop unit → "building leak").

**A general, reviewable derivation method was built and measured once on a sealed reference.**

- Method R1 re-reads every row with all its cells. A link exists only where a clause asserts the strategy's action.
- Precision rose from **0.32 (G1b) to 0.77**, recall fell from **0.79 to 0.54**.
- This is below the preregistered gate (precision ≥ 0.80 *and* recall above G1b's). Following the owner's stop rule, R1 is
  not promoted and no further heuristics were added.

**Verified retrieval in three stages roughly halves G1c's invented proposals but still fails the development gates.**

- On the spent set: 37 invented against 66 for G1c D, and 11 of 24 requests reached against 14.
- The actual fused ranking was measured for the first time and is **not better** than vector-only retrieval.

**Two concrete operational gains.**

- Lost explicit limits in long requests: **33 → 5 of 78**, development set.
- The open-debt statuses of the architecture contract are now protected by tests that fail on the G1b corruption.

The sealed G1 and G1b sets stay sealed.

## 2. What is implemented (all shadow unless stated)

| Component | File | What it does |
|---|---|---|
| Contract-status protection (**operational**) | `docs/architecture/open-debt-ledger.json`, `scripts/open-debt-ledger.mjs`, `tests/contract_status_ledger.test.ts` | Pins each open-debt entry's item, status and progress by hash. A change needs its own ledger record with date, author and reason, one entry at a time. No two entries may share a non-trivial status. Statuses use the contract vocabulary. Verified to fail on the corrupted contract of e8d44a3. |
| Source re-reading | `src/relation_integrity_g1d.ts` `sourceRowsG1d` | Every projection row is re-read from its original document. Table rows keep every cell with its header and N1 column role; structured cases keep every field with its role; stored teaching items keep their statement. The source's own epistemic label (e.g. "PROPOSED_NOT_TESTED", a "(PROPOSED)" heading) is kept. All 926 rows are re-read completely. |
| Relation derivation R1 (r1.3, frozen) | same, `deriveRelationsG1d` | A strategy's teaching statement is split into the condition it applies under and its action, using English grammar ('X: Y', 'X needs Y', 'may be met by Y'; asides and 'only if' clauses go to the condition). A link needs a clause of an asserting cell (alternative, function, caveat, condition, evidence, method) that names a strategy-specific action term. It must also mean the strategy: bge similarity ≥ 0.65 to the strategy's whole statement, used as a check, never as the cause. Each relation keeps polarity (applies / conditional / contraindicated), condition, verbatim quote, header, source status, nature (expert guidance, demonstrated effectiveness or teaching) and provenance, with status `derived_unreviewed`. |
| Category applicability | same, `categoryApplicabilityG1d` | Owner rule: essential incompatibility → unsuitable; modifiable or unverified condition → conditional; nonessential disadvantage → suitable with the disadvantage noted; no consumer situation → not a purchase situation. |
| Verified retrieval | `src/verified_retrieval_g1d.ts` | Stage 1: the vector, lexical and typed rankings and their actual fusion, each exposed. Stage 2: each retrieved situation verified (consumer situation, category applicability, asserted strategies, match strength). Stage 3: categories only from verified situations; equally close situations of different categories are competing, and neither is proposed. Owner contraindication rule. A question only between competing verified situations, asking the user which is theirs. Missing knowledge leads to a typed research need or abstention, never a question. |
| Limits in long requests (**operational**) | `src/request_coverage80.ts` rc80.6 | In requests of more than three sentences, each segment carrying a strong requirement cue (obligation, comparison or bound, explicit refusal) is checked on its own. Questions are excluded. |
| Tests | `tests/g1d_relation_integrity.test.ts` (4), `tests/contract_status_ledger.test.ts` (3), `tests/s80_request_coverage.test.ts` (+3) | Co-mention never links; relations keep their provenance; the owner rule as a mechanism; questions only between competing situations; research instead of questions when knowledge is missing; fused ranking exposed; advice unchanged. |

**Full suite:** 5,087 tests passed. The A5 store-access census is unchanged: the new modules do not touch the store.

**Model use.** The bge-small model and the G1c index are reused; no other model or service was added.

**Change to a G1c file.** `typeScores` in `src/semantic_retrieval_g1c.ts` is now exported so that the fused ranking can be
reproduced. Its behaviour is unchanged, but the file hash recorded in `evaluation/g1c/freeze.json` no longer matches.

## 3. What the source examination supports

### Trace of the 120 audited rows

- **Judges:** two new blind Claude agents, source-only judgement per strategy.
- **Results:** `evaluation/g1d/trace.json`.

| G1b link (70) | Judge T1 | Judge T2 | Agreed |
|---|---|---|---|
| Not addressed by the source | 51 | 51 | 51 |
| Co-mention only | 4 | 4 | 4 |
| Supported | 10 | 8 | 8 |
| Conditional | 5 | 7 | 5 |

- **Agreement:** 1,057 of 1,080 row × strategy pairs.
- **Relations both judges found:** 24. G1b linked 15 and missed 9.
- **Nature:** every one is *expert guidance*. None is demonstrated effectiveness, mechanism or causal evidence.
- **Source status:** about a fifth of the rows carry the sources' own label "PROPOSED_NOT_TESTED / SYNTHETIC TEACHING
  SCENARIO", "hypotheses" or "actual survey observation: false". The packages are teaching material, not tested results.
- **Extraction fidelity:** the extracted row is a partial reading of its source in 33 (T1) to 56 (T2) of 120 rows.

**Where the evidence lives.** Of the 24 asserting clauses, 18 are in cells the projection dropped. They sit in columns such as
"Required function or alternative", "Relevant solution/evidence", "Expected PEE capability" and "Correct PEE response".

**Interpretation.** These distinctions are supported by the source passages as read by Claude agents. They are not
independent expert validation, and the strategies' scientific correctness is not established by any of this: every
supported relation is a recommendation, without evidence of effectiveness.

### Sealed relation reference R

- **Material:** 100 never-audited rows (50 G1b-linked, 50 unlinked), annotated blind from the sources by two agents.
- **Adjudication:** a third blind agent settled 38 items.
- **Sealing:** sealed before any method run (`evaluation/g1d/ref-freeze.json`).
- **Agreement:** relations 894 of 900; category applicability 68 of 100.
- **Content:** R holds 24 positive pairs. It holds **no contraindicated pair**, so contraindication handling is untested on R.

## 4. Which improvements are demonstrated

### Relations (sealed R, first run unchanged, `evaluation/g1d/relations-check-firstrun.json`)

| | Proposed | Correct | Precision | Recall (of 24) |
|---|---|---|---|---|
| R0, G1b links | 60 | 19 | 0.32 | 0.79 |
| R1, r1.3 | 17 | 13 | **0.77** | 0.54 |

- R1's polarity is right on 12 of its 13 correct links.
- **Gate not met** (≥ 0.80 and recall above R0).

Development on the trace rows only (`relations-dev-it0..it3.json`, three reformulations):

| Iteration | Precision | Recall |
|---|---|---|
| G1b | 0.21 | 0.63 |
| r1.0 | 0.34 | 0.67 |
| r1.1 | 0.48 | 0.46 |
| r1.3 at the frozen setting | 0.65 | 0.46 |

**Category applicability is not demonstrated.** On R, r1.3 agrees with the reference on 40 of 100 rows, while the trivial
"always conditional" answer agrees on 62. The sources make nearly every product route conditional on something still to be
verified, and the method does not identify which condition, or its kind, reliably.

**Known defects of the frozen r1.3**, found by the tests and not fixed, because fixing them would invalidate the sealed run:

1. After hyphen splitting, the ventilation strategy keeps only a common term, so outdoor-air ventilation can never be linked.
2. "A purifier is not a substitute for …" is not read as an incompatibility.

### Retrieval (spent I3 set, blind pooled judgements, `evaluation/g1d/l1-it0.json`)

| Ranking | Precision@5 | Precision@10 | Pooled recall@10 |
|---|---|---|---|
| Vector only | 0.150 | 0.095 | 0.851 |
| **Actual fused ranking** (vector + lexical + typed) | 0.133 | 0.093 | 0.836 |
| Category-first (named category, 8 requests) | 0.316 | — | — |

- G1c's missing measurement is now made: fusion does not improve retrieval quality.
- Pooled recall is high relative to the pool. Precision stays low: most retrieved situations are not relevant.

### Why similar situations of other categories produce invented proposals

The diagnosis covers the nearest neighbours of the 39 problem requests:

1. **Generic framing.** The similarity is dominated by the sentence frame ("I need…", "I have £400…"), not the problem.
2. **Density.** The largest packages (dishwashers 284 rows, televisions 275) attract vague requests.
3. **No correct taught category.** In about two thirds of the errors no taught category is right, but a nearest neighbour always
   exists. Similarity alone can therefore never abstain.

### Selection (spent I3, one diagnostic run, `evaluation/g1d/selection-dev-it0.json`)

| Arm | Problem requests reached (of 24) | Invented (39 problem requests) | Safety probes failed (of 42) |
|---|---|---|---|
| C1 | 9 | 18 | 19 |
| G1b | 11 | 51 | 20 |
| G1c D | 14 | 66 | 26 |
| **V (G1d)** | 11 | **37** | 26 |

- V roughly halves G1c D's invented proposals. It still fails the selection gate (≥ 12 reached with ≤ 18 invented) and the
  safety gate (≤ 19).
- V asked 8 questions, all between competing verified situations, and recorded 5 typed research needs.
- V is **worse than D on negation probes** (5 of 6 failed against 3). V queries with the raw request and does not reuse D's
  negation masking.
- V fails all 6 contraindication probes. The source-derived category applicability is too unreliable (above) for the owner
  rule to take effect: the rule works as a mechanism (tested) but rarely receives a correct "unsuitable" input.

### Lost limits (`evaluation/g1d/limits-*.json`, `advice-diff-rc806b.json`)

| Set | Before (rc80.5) | After (rc80.6) |
|---|---|---|
| Short development set | 8 of 98 | 8 of 98 |
| **Long development set** (40 new messages, 4–10 sentences) | **33 of 78** | **5 of 78** |

- **206-request regression:** 36 answers gain "Not interpreted" statements, 46 spans in all. About a third state real
  preferences ("it should be portable", "I prefer decaf", "I don't want to skimp"); the rest are narrative. No category,
  decision, constraint or ranking changes.
- **Tried variants, recorded unchanged:** without the question exclusion, 106 extra spans in 66 answers
  (`advice-diff-rc806.json`).
- "Kept" means reported, not understood.

## 5. What requires independent verification

- **Expert review of the relations.** Every relation judgement here (trace, reference, adjudication) comes from Claude agents
  reading the sources, not from domain experts. The 51-of-70 finding is consistent across two independent audits (G1c and G1d)
  but remains agent judgement.
- **Contraindication handling.** The sealed reference contains no contraindicated pair, so it is not evaluated on independent
  material.
- **Generalisation.** None is claimed: the sealed G1 and G1b request sets were not used, as the gates were not met.
- **Limits in long real requests.** The long development set was written by an agent. Real long requests (the spent
  Stack Exchange posts) show the noise cost but carry no limit annotations.

## 6. Proposed next step (not authorised)

The evidence points away from more automatic derivation and towards **reviewed relations**.

1. The R1 method produces a short, reviewable list of candidate relations (61 across the 926 rows), each with its quote,
   header and source status.
2. That list could be reviewed, by the owner or under an explicit review protocol, and only reviewed relations used in
   verification.
3. Category applicability likewise needs the condition and its kind identified per row, which the sources state in prose that
   the current cues do not capture.
4. Retrieval should then be re-measured with D's negation handling carried into V.

## 7. What was consulted

- SKILL.md §§0–2b.
- The G1c report.
- The G1c and G1d preregistrations.
- The owner's G1d authorisation, verbatim.
- The source of `situation_knowledge_g1b.ts`, `relation_claims_n1.ts` (table roles), `semantic_retrieval_g1c.ts`,
  `request_coverage80.ts` and `phase253_request_advice.ts` (coverage).
- The original package passages behind the traced rows, through the blind judges' inputs.
