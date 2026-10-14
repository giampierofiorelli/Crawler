# Product Evidence Engine — Phase 123: native intent learning, semantic uncertainty and local research bridge

**Date:** 11 October 2026  
**Input:** cumulative v4.46, Phase 122  
**Status:** experimental in-house prototype; **NOT** a validated open-domain interpreter, source-verification engine or autonomous recommendation system.

## Decision and experimental result

The user correctly identified a gap: the system cannot autonomously interpret genuinely novel natural-language product requests, discover the necessary original evidence, validate it and create a defensible ranking end-to-end. Phases 116–122 provide valuable individual invariants and gates, but not that complete capability. Adding manually keyed phrases for *steam, stairs, carpets, less manual work* would not solve this generalization problem.

Phase 123 therefore implements a **tiny local supervised, IT/EN intent proposal model**, without external LLMs, search APIs, hosted classifiers, SaaS, scraping platforms or mandatory new runtime dependencies. It is a scientific baseline that can be independently evaluated, not a solved semantic interpreter.

**Measured finding:** on a **developer-created, non-blind diagnostic** of 30 requests, 4 were assigned their constructed reference label, **0 wrong labels were accepted**, and **26 were rejected/deferred**. This is high abstention (**26/30**) and **inadequate coverage**. The 100 training samples, 25 threshold-calibration samples and all 30 diagnostic prompts were authored for this project; the diagnostic was examined during development, so the result must **not** be reported as independent accuracy, real-user accuracy, or proof of semantic generalization. The older phrase-based Phase122 interpreter correctly accepted **0** of these constructed diagnostic labels and wrongly accepted **1**, but this is not a robust model comparison. Independent blind human-labelled testing remains missing.

This is a reason to build a much better evaluation set before introducing an open-weights local LLM, **not** a reason to claim that a handful of extra code rules gives production-level comprehension.

## Research consulted and what it does and does not support

1. Ribeiro et al. (2020), *Beyond Accuracy: Behavioral Testing of NLP Models with CheckList*, ACL. Methodological reason to test negation, paraphrase, compositionality and directional changes independently from average accuracy: https://aclanthology.org/2020.acl-main.442/ . We follow its principles; **we did not execute the CheckList package or reproduce the paper's experiments**.
2. Joulin et al. (2017), *Bag of Tricks for Efficient Text Classification*, EACL. Shows that simple word/subword representations can be meaningful classification baselines: https://aclanthology.org/E17-2068/ . Our tiny TF-IDF/class-prototype learner is **not** fastText and inherits none of its reported accuracy or scale.
3. El-Yaniv & Wiener (2010), *On the Foundations of Noise-free Selective Classification*, JMLR. Formal motivation for a reject option and risk–coverage trade-offs: https://www.jmlr.org/papers/v11/el-yaniv10a.html . Our small-sample thresholds are developer-calibrated and **not** probabilistic confidence, statistical guarantees or theoretically optimal risk controls.
4. Robertson & Zaragoza, *The Probabilistic Relevance Framework: BM25 and Beyond*: https://doi.org/10.1561/1500000019 . Phase122 already has an internal BM25 local passage retriever; Phase123 **reuses** it rather than implementing a second index.
5. NIST, Soboroff (2025), *Don't Use LLMs to Make Relevance Judgments*: https://www.nist.gov/publications/dont-use-llms-make-relevance-judgments . Independent relevance annotations remain important even if a model is introduced to assist extraction.
6. Lewis et al. (2020), *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*: https://arxiv.org/abs/2005.11401 . Source-backed facts should be separately retrievable; the retrieved passage is not automatically trusted or comparable.

## Implementation

### A. Learned hypothesis, no hosted model

`src/phase123_native_learned_intent.ts` implements all algorithms locally in TypeScript:

- Simple deterministic normalization, word unigram/bigram and within-token 3/4/5-character n-grams, weighted TF-IDF, cosine class prototypes and nearest labelled example similarity.
- Five **pilot** intent classes: autonomy / minimum human work, maximum performance, best value for money, capability discovery, and other/non-shopping/out-of-domain.
- A reproducible 100/25 training/calibration split. Class-specific centroids are built from the 100 training examples only. Similarity and winning-margin thresholds are chosen on the 25 developer-created calibration examples with a cost that penalizes wrong accepted labels. **Scores are not probabilities.**
- Conservative abstention for low-similarity/low-margin requests; constraint review for negation and explicitly separate requested goals.
- Use of **already verified** floor-cleaning-robot conversation context for elliptical follow-ups, while protecting two known competing pilot domains. This category guard is narrow and not a general cross-domain parser.
- Explicit and separate `legacyBoundedCandidate` from Phase122; disagreement between confidently proposed interpretations blocks progress rather than silently replacing one. Existing limited capabilities are not discarded.

It **does not** learn a new concept's physical meaning (e.g., climbing stairs versus crossing thresholds), bind a source to a product, infer user preferences, or publish any ranking.

Training records: `research/phase123_training_examples.json` (125 manually constructed samples, 25 per class). Challenge cases: `research/phase123_developer_challenge.json` (30 constructed examples with author-supplied expected labels). No independent annotator or representative sampling; the data include artificially balanced classes.

### B. A new goal is a research problem, not a guessed score

`planNativeResearch123()` produces an explicit path for uncertain and unknown goals, such as "E se cercassimo robot con vapore?" or "Trovami i robot che sono in grado di salire gli scalini":

- If a generic capability search is provisionally detected, it requests an independent goal definition, product discovery, exact product identity, independently corroborated capability and market availability.
- If confidence is too weak, `investigate_unknown_goal` preserves the user's wording as a **search seed**, lists semantic goals still to establish and does **not** assign the label `steam`, `stair_climbing` or any physical endpoint.
- If constraints are negated or several goals conflict, pause the planner for constraint resolution. A linguistic negation is not a positive feature request.
- For performance, value and autonomy, reuse **Phase122's reviewed evidence-obligation registry**, including verified quality floor, measured outcomes, pricing when applicable and method comparability.

Nothing here discovers sources on the public Internet or grants permission to publish. `publicRankingAuthorized=false`, `searchExecuted=false`, `evidenceVerified=false` throughout.

### C. Native local retrieval, with strict limits

`src/phase123_local_semantic_evidence_bridge.ts` connects Phase123 research queries to the existing Phase122 local BM25 retriever. It can query rights-asserted **locally supplied** passages and return candidate document IDs, preserving `sourceIdentityVerified=false`, `interpretiveGroundingConfirmed=false` and `productMeasurementsVerified=false`. No source is upgraded to verified evidence merely because it shares keywords with the question.

If no local candidate is found, the output is `acquire_new_sources`: **this is a required next action, not proof that web search ran**. All URLs used in bridge unit tests are fabricated `example.org` fixtures, not sources proving real robot capabilities. Caller-supplied rights flags are likewise not authenticated licenses.

## Test record and observed deficiencies

- **29 Phase123 unit tests passed**. Tests cover data validation, deterministic replay, negation, multiple requested rankings, absent and explicit context, conflict handling, unknown-goal research, local source selection, rights exclusion and publication gating.
- **272 TypeScript tests passed** in a selected cumulative set for phases 111–113 and 117–123, including the new tests.
- **47 primary-source tests** and **21 ingestion tests** passed in their separate Python suites.
- The entire legacy regression was **not** run or cleared in this phase; phase121/phase120 had unresolved legacy test timeouts and this phase does not claim they disappeared.
- `PHASE123-CONSTRUCTED-CHALLENGE-RESULTS.json` has exact per-case results. Diagnostic after iteration: **4 accepted correct, 0 accepted wrong, 26 deferred** in the developer-created set. This is a *development diagnostic*, not an independent benchmark.
- `PHASE123-PRIOR-REQUESTS-DIAGNOSTIC.json` replays ten previous user-provided or adapted questions qualitatively. The new model still misses some previously recognized phrasing. Phase122 alternatives are retained explicitly, rather than overriding earlier evidence or silently claiming language understanding.

### Known failure types

1. Many open-ended autonomy requests do not meet the strict threshold. Short training and incomplete semantics lead to high abstention; increasing the threshold cannot solve conceptual understanding.
2. Negation guard is deliberately conservative and sometimes blocks valid autonomously expressed goals. Parsing negation **scope** remains unsolved.
3. The five classes are research labels, not an adequate ontology of every type of user request. A new category or objective requires source-grounded scientific definition, not blindly inventing an endpoint.
4. Combining two ranking requests into one objective remains prohibited; a future multi-intent representation is needed.
5. `verifiedCategory` is a trusted context supplied by the caller: the model cannot verify conversation continuity itself.
6. Local BM25 will miss semantic matches without shared words; positive lexical hits are neither semantic proofs nor original experiments.
7. No autonomous crawler-to-review-to-SKU-to-measurement pipeline is running. No market candidates were exhaustively searched. No full ranking can legitimately be produced by this new module.

## Required next research/engineering steps (not claimed complete)

1. Independently collect and annotate a **real**, rights-controlled, natural distribution of consumer queries across categories; have multiple independent annotators adjudicate category, intent, goal, scope, negation, context and ambiguities. Set a locked held-out test corpus and leakage detection before further tuning.
2. Publish risk–coverage curves, macro metrics by category/intention/language, intentional hard negatives and false-assignment costs. Compare the Phase122 baseline, this native n-gram model, and any stronger **in-house** classifier on the **same locked test**.
3. Build a compositional semantic frame (multiple requests, task targets, surfaces, mandatory/optional constraints, personal/general mode) with explicit provenance. Retrain on real examples instead of endless handcrafted rules.
4. Connect the existing native rights-aware web acquisition modules to the research planner behind permissions and policy gates. A failed search must trigger safe continuation/uncertainty, not manufactured products.
5. Build source-span extraction/identity verification, protocol checks and goal-specific completeness gates using real original reviews, including Phase118 wrong-product attribution adversarial cases.
6. Only if documented native approaches fail adequate blind tests, compare **a replaceable open-weights LLM run fully locally** against the in-house baseline. Neither a SaaS dependence nor training a foundation model from scratch is justified from this 125-example experiment; building a proprietary fine-tuned task model is a separate feasibility question.

**Stop rule:** do not advertise this as autonomous shopping advice or an autonomous research engine until question-to-source-to-measurement-to-ranking reliability is demonstrated end-to-end on unseen, independently scored cases. Passing code tests or retrieving a local document does not satisfy that condition.
