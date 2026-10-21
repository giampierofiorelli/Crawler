# G1c — Scientific semantic retrieval and bidirectional knowledge: report

- **Date:** 2026-10-21.
- **Authorisation:** verbatim in `.claude/skills/pee-guided-learning/references/owner-g1c-authorisation-2026-10-21.md`.
  Its line 149 lists the sections this report must keep apart, and they appear in that order below.
- **Preregistration:** `evaluation/g1c/preregistration.json` (committed before any run).
- **Roadmap step:** R3 (kind: inference, learning; retrieval).
- **Maturity:** proposed. Nothing is promoted.

## 1. Outcome in one paragraph

**Fundamental goal (owner):** show that PEE can retrieve and reuse relevant scientific knowledge through meaning, from a
need and from a category, without increasing invented hypotheses, wrong interpretations or unjustified decisions.

**Not met.** A local sentence-embedding model now runs offline on the CPU over a rebuildable index of 7,094 knowledge
units, each tied to its id, provenance, review status and model version. It finds relevant knowledge more often than the
typed lexical method. But it **raises invented proposals**, and **no method passed development**:

- No method (A typed situations, B embeddings, C hybrid, D hybrid with verification) reached the preregistered criterion:
  at least 12 of 24 problem requests reached with at most 18 invented proposals.
- The best reach was 16–17 of 24, but with 61–123 invented proposals.
- No gate on the available signals reaches the criterion; the precision–reach frontier on spent data shows this (§4).
- Pure embeddings were the least safe method on the semantic safety probes (35 of 42 failed).

So the sealed G1 and G1b sets stay sealed and nothing is promoted.

Two further results matter for the knowledge itself:

- **Strategy links:** the blind audit found **51 of 70 G1b strategy links inappropriate**.
- **Lost limits:** the operational path lost far fewer stated limits after a test-first fix (development set: 33 → 8 of
  98).

## 2. Implemented

| Component | File | Status |
|---|---|---|
| Pinned model manifest | `resources/semantic-retrieval/models.v1.json` | Both models listed below; SHA-256 checked before every load. |
| Embedder | `src/semantic_embedding_g1c.ts` | Own WordPiece tokenizer; CLS/mean pooling; L2-normalised; network never used at run time. |
| Knowledge-unit index | `src/semantic_retrieval_g1c.ts` | `SemanticIndexG1c`: one record per unit with canonical id, kind, category, provenance, review status, model id/revision, text SHA-256. Re-indexing is idempotent; a changed text is replaced in place; a unit without provenance is refused. In memory, rebuilt from the projection and the store copy: no store write, no remote database. |
| Methods A–D | `goalFirstG1c` | Shadow only; each proposal keeps its supporting units with provenance; similarity never sets a requirement, exclusion, efficacy claim or ranking (tested: the advice is byte-identical). |
| Category direction | `needsInCategoryG1c` | Units of one category nearest to a need phrase (tested; not measured). |
| G1b row matcher | `matchRowsG1b` in `src/situation_knowledge_g1b.ts` | Exposed for fusion; G1b behaviour unchanged (its tests pass). |
| Situation types (A) | private `private-eval/g1c/situation-types.json` | 70 types written by an independent Claude agent from the 926 rows (914 typed); status `claude_typed_unreviewed`. |
| Lost-limits fix | `src/request_coverage80.ts` (rc80.5) | Operational: see §7. |

The two pinned models:

| Role | Model | Revision | Licence | Size |
|---|---|---|---|---|
| Primary | BAAI/bge-small-en-v1.5 | `5c38ec7c…` | MIT | 133 MB |
| Secondary | sentence-transformers/all-MiniLM-L6-v2 | `1110a243…` | Apache-2.0 | 91 MB |

The runtime is onnxruntime-node 1.20.1 (MIT), an exact devDependency.

Tests (`tests/g1c_semantic_retrieval.test.ts`, 5; a deterministic stand-in embedder, the weights are never needed):

- the records' fields;
- no duplication;
- replacement in place;
- refusal without provenance;
- the **re-indexing check**: a new unit is found from two different need phrasings and from its category;
- shadow behaviour;
- D's verification: an owned product is set aside, negated words are not evidence, a generic need proposes no category;
- A's typed matching.

Full suite after all changes: **5,077 tests passed**. The A5 store-access census was re-measured and reviewed (one
read-only access added; no write).

Defects found by the tests (both fixed):

- One general need had empty text and was silently refused. It now uses its label.
- The category score summed the reciprocal ranks of a category's three best rows, so a category with several weak rows
  beat one close match. A category is now scored by its best row. This change counts as reformulation 2.

## 3. Development results (spent I3 set only)

**Material.**

- The 60 I3 requests, their adjudicated reference and the blind strategy key of G1.
- At most 2 categories and 2 strategies per method (equal candidate count).
- Results: `evaluation/g1c/dev-it0.json`, `dev-it1.json` and `dev-it2.json`; decision in `evaluation/g1c/freeze.json`.

Problem requests: reach of the 24 with taught knowledge; invented proposals over all 39.

| Method | it0 (registered) | it1 (D: corroboration) | it2 (best-row category score) |
|---|---|---|---|
| C1 (baseline) | 9 / 18 | 9 / 18 | 9 / 18 |
| G1b M2 (baseline) | 11 / 51 | 11 / 51 | 11 / 51 |
| A typed situations | 14 / 122 | 14 / 122 | 14 / 121 |
| B embeddings | 14 / 74 | 14 / 74 | **16** / 83 |
| C hybrid (RRF) | **17** / 122 | 17 / 122 | 16 / 123 |
| D hybrid + verification | 15 / 75 | 15 / 61 | 14 / 66 |

**Criterion:** reach ≥ 12 **and** invented ≤ 18. No method passes.

Reformulations:

- **Reformulation 1 (D only).** A situation counts only when two independent retrievers found it, and a strategy must also
  rank among the three nearest strategy units of the verified request. This was motivated by the it0 diagnosis and the
  L2 audit.
- **Reformulation 2.** The test-found defect above.
- **Reformulation 3.** Not used: the diagnosis below shows no gate on these signals can meet the criterion.

### Post-hoc diagnosis on the spent data (not reformulations)

Absolute similarity does not separate plausible from invented categories
(`evaluation/g1c/dev-posthoc-separation-*.json`).

| bge-small cosine ≥ | Plausible categories | Invented | Requests reached |
|---|---|---|---|
| 0.62 | 15 | 42 | 15 |
| 0.65 | 13 | 28 | 13 |
| 0.68 | 9 | 13 | 9 |
| 0.72 | 4 | 4 | 4 |

- No relevant strategy is above 0.60 when strategies are matched directly by similarity.
- all-MiniLM-L6-v2 separates worse: at best 9 plausible with 25 invented. **bge-small stays the primary model.**

Requiring retrievers to agree gives this frontier:

| Gate | Reach | Invented |
|---|---|---|
| B, A and G1b agree | 7 | 12 |
| B and C1 agree | 8 | 11 |
| B and A agree | 10 | 20 |
| Two of B, A, G1b, C1 | 14 | 38 |

Every gate within 18 invented reaches fewer requests than C1 alone (9).

**Where the invented proposals come from.** Even with perfect abstention on the 15 problem requests that have no taught
knowledge, the requests that do have knowledge would still yield 31–73 invented proposals per method. With D at it1:

| D proposal | Right | Of |
|---|---|---|
| First category | 10 | 35 |
| Second category | 5 | 20 |
| Strategies | 3 | 24 |

The bottleneck is **precision among close neighbours**, not recall:

- The right knowledge is usually among the retrieved units.
- Similar-sounding situations of other categories are equally near.
- Requests rarely state the distinguishing fact.

### Level 1 — retrieval relevance (blind pooled judging)

**Method.**

- **Pool:** the top five units of each method for each of the 60 spent requests; 662 unique request–unit pairs.
- **Judging:** shuffled with seed 20261021 and split across three blind Claude agents, one judgement per pair. Method
  identity was hidden.
- **Results:** `evaluation/g1c/l1-it1.json`.

| Method | Precision@5 strict | Precision@5 lenient (incl. partly) | Problem requests with ≥ 1 relevant unit |
|---|---|---|---|
| A (lexical over types) | 0.06 | 0.15 | 8 / 39 |
| B (embeddings) | 0.17 | 0.36 | 13 / 39 |
| D (verified query) | 0.19 | 0.32 | 13 / 39 |

**Limit of this table.** The retrieved list of C is, as implemented, the embedding neighbours of the request, so C equals
B here. The fused ranking is used for proposals, but it is not what the pool shows.

**Reading.** Embeddings find relevant knowledge about three times as often as lexical matching over typed situations.
Even so, four of five retrieved units are judged not relevant. Retrieval is better, not good.

### Semantic safety probes (development only, not used for selection)

- **Probe set:** 42 probes, six per type, written by an independent Claude agent.
- **Failure:** a method proposes a category or strategy the probe says must not be proposed.
- **Results:** `probes` in `evaluation/g1c/dev-it2.json`.

| Method | Failed (of 42) | Acceptable reached |
|---|---|---|
| C1 | 19 | 15 |
| G1b | 20 | 15 |
| A | 26 | 17 |
| **B embeddings** | **35** | 22 |
| C hybrid | 36 | 22 |
| D verified | 26 | 23 |

**Reading.**

- Raw similarity is the least safe method. It fails all six negation probes and all six contraindication probes, and 5
  of 6 generic-need probes.
- D's verification removes many failures: negation 6 → 3, cause vs symptom 5 → 3, generic need 5 → 4. It is still worse
  than the baselines, because it proposes more.
- Every method fails contraindication probes (5 or 6 of 6). As preregistered, a purchase whose supporting sources
  contraindicate it is **kept as a conditional proposal, not removed**. The probe author judged that it should not be
  proposed at all. This is a design question for the owner, not a tuning knob.

### Operational residue: lost explicit limits

**Material.**

- A new development-only set: 50 messages with 98 stated limits and exact spans, written by an independent Claude agent
  and never used for validation.
- The 206 spent requests for regression.

**Root cause.** The coverage check (rc80.2) treated any sentence with no recognised word and no number as background. A
limit stated in a sentence of its own was dropped silently, for example "Nothing louder than a fridge, please, and it
needs to be gentle on the electric bill."

**Fix (rc80.5, test-first, two new tests in `tests/s80_request_coverage.test.ts`).**

- A sentence carrying an English requirement cue is also checked. Cues are obligation or desire modals, negation and
  limit or comparison words; function words only, with no category or phrase list.
- A one-word clause opened by "without" or "than" is reported.
- Both apply only to requests of at most three sentences. On the 206 regression requests, 420 of the 426 extra reports
  of an unguarded version came from posts of four or more sentences, where they were narrative noise.

| Measure | Before | After |
|---|---|---|
| Lost limits, development set (`limits-dev-before.json` → `limits-dev-final.json`) | **33 of 98** | **8 of 98** |
| Noise | 9 of 16 | 3 |
| Energy | 6 of 14 | 1 |
| Size | 6 of 26 | 1 |
| Other | 7 of 16 | 1 |
| 206-request regression (`advice-diff-final.json`) | — | **1 answer changed**, coverage statements only; no category, decision, constraint, question or ranking change |

The changed answer is a three-sentence request whose need phrases are now reported instead of dropped.

Variants that were tried are recorded unchanged:

| Variant | Lost | Extra reports | Changed answers | Files |
|---|---|---|---|---|
| No length guard | 8 | 426 | 87 | `advice-diff-rc805.json`, `limits-dev-after-rc805.json` |
| Narrow cue set | 19 | 179 | 59 | `limits-dev-try-narrow.json` (regression detail private) |

**Limits of this fix.**

- Every development message has one or two sentences, so loss inside long posts is not measured and remains possible.
- "Kept" means *reported* (as a constraint or as "not interpreted"). It does not mean *understood*: "whisper-quiet" is
  now stated as not interpreted, not read as a noise requirement.
- The G1 sealed set (10 of 32 lost in G1b, not independent) was not re-run.

## 4. Independent checks

**Not run.** The preregistration allows the G1 first check, and then the G1b generalisation set, only after a method
passes development. None did. Both sets stay sealed:

- the G1 set has had no G1c run;
- the G1b set of 75 requests has never been read.

## 5. Scientific correctness of the links (level 2, blind audit)

- **Sample:** `evaluation/g1c/audit-sample.json`, seed 20261021, sealed before judging: 60 random unlinked rows and 60
  random strategy-linked rows of 926.
- **Judges:** two blind Claude agents. A third blind agent adjudicated their 23 disagreements. None saw how the links were
  built.
- **Results:** `evaluation/g1c/audit-l2.json`.

| | Unlinked rows (60) | Strategy-linked rows (60) |
|---|---|---|
| Situation coherent | 54 | 59 |
| Category relevant: yes / partly / no | 46 / 13 / 1 | 43 / 15 / 2 |
| Contraindications faithful (where present) | 13 of 13 | 15 of 15 |
| **Strategy links appropriate / inappropriate / unclear** | — | **14 / 51 / 5 of 70** |

Agreement between the two judges:

| Field | Agreement |
|---|---|
| Coherence | 120 of 120 |
| Contraindications | 120 of 120 |
| Category | 100 of 120 |
| Strategy verdicts | 67 of 70 |

**Reading.**

- The situation rows and their category assignments are mostly sound.
- The **situation → strategy links are mostly wrong.** Every strategy is affected; for example, "cannot plumb" is
  appropriate in 3 of 18 links and "ventilation" in 2 of 12.
- The G1b linking rule (a guidance cell shares terms of a given specificity with the strategy) confuses shared vocabulary
  with a relation.
- Any method that proposes strategies through these links inherits the error. This is why D does not trust a link alone.

These are agent judgements, not expert review, on one projection version (g1b.4).

## 6. Costs and limits of the local model

All measured on this container's CPU, two threads.

| Item | Measure |
|---|---|
| Model load | 0.55–0.64 s |
| Indexing 7,094 units (926 situations, 9 strategies, 41 general needs, 6,118 typed statements) | 81–85 s (statements dominate: about 12 ms per unit) |
| Per request (embedding the query + all six arms) | about 200 ms |
| Resident memory | about 540 MB (model, runtime, store copy and the full index) |
| Disk | 133 MB (bge-small) + 91 MB (MiniLM) + the runtime package |
| Network | only the one-time download from the official repositories (pinned revisions, SHA-256 verified); no request text or knowledge leaves the machine |

**Limits.**

- Similarities are uncalibrated rank signals. No probability is reported anywhere.
- The model rates superficially similar situations of different categories as close as the right one (§3).
- The model ignores negation, which is why it fails every negation probe without D.
- The index is held in memory and rebuilt per run. A persisted index (keyed by unit id, text hash and model revision)
  would remove the 80 s, but it was not built because nothing is promoted.

## 7. Generalisation demonstrated

**None.** The sealed sets were not run (§4), so no generalisation claim is made.

On bidirectional knowledge (SKILL.md §2b):

| Direction | What exists | Status |
|---|---|---|
| Need → knowledge | B/C/D retrieve situations, strategies and statements | Measured on spent material only |
| Category → needs | `needsInCategoryG1c` searches one category's units for a need phrase | Tested on the stand-in embedder; not measured on authentic requests |

Both directions use one index, with no duplicated statement. General needs remain needs: D never takes them as category
evidence, and a generic need alone proposes no category.

## 8. Path to integrating semantic retrieval into the existing modules (proposed, not authorised)

1. **Do not integrate retrieval into the request path.** It has not passed development, and its safety failures are worse
   than the baselines'.
2. **Repair the knowledge before retrieving it.** The situation → strategy links fail the scientific audit (51 of 70).
   They should be rebuilt as reviewed relations (situation type → strategy, with the condition under which it applies)
   rather than lexical overlaps. The 70 situation types are a candidate backbone, but they need review.
3. **Ask for the distinguishing fact.** The precision bottleneck (§3) suggests the useful role of semantic retrieval is
   to propose a short list of *competing* documented situations and then ask the one user-only question that separates
   them. That is a different decision rule from proposing the top candidates, and it would need its own preregistered
   test.
4. **Where retrieval can serve now.** The index is a clean, rebuildable component (ids, provenance, model version,
   idempotent re-indexing). Its first stable consumer could be **knowledge-side work**: finding candidate duplicate or
   related statements and situations across categories for review, and the category direction. Neither decides anything
   for a shopper. Each would need its own measure before use.
5. **Integrate the lost-limits fix on its own.** It is general, test-first, operational, and its regression is one changed
   answer. It is already in this build; the owner can ask for it to be reverted.

## 9. Correction of an earlier error (G1b records)

While updating D35, I found that my G1b commit (e8d44a3) had overwritten the `resolvedStatus` of every open-debt entry
in `docs/architecture/vertical-contract.json` with D35's text:

- statuses such as "open", "resolved_retention_reader_weak" and the D31–D34 texts were replaced;
- the field was added to four entries that had none.

Fix:

- The file is rebuilt from the pre-G1b version (6c7de15), with only D35's progress and status re-applied.
- After the fix, every other entry is identical to 6c7de15.
- The contract tests passed both before and after the fix, so they do not protect this field. A test that pins each
  entry's status to its own history is a proposed follow-up.

## 10. What was consulted

- SKILL.md (§§0–2b).
- The G1b report (§§8, 10).
- The G1 and G1b preregistrations.
- The owner's G1b review and G1c authorisation, verbatim.
- The source of `situation_knowledge_g1b.ts`, `request_coverage80.ts`, `phase253_request_advice.ts` (coverage and
  quantity requirements) and `need_model_n0.ts` (types).
