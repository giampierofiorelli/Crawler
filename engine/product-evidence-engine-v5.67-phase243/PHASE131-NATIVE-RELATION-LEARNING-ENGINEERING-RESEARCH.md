# Product Evidence Engine — Phase 131: native learned relations and evidence gating

**Date:** 2026-10-11. **Basis:** cumulative v4.54/Phase130. **Status:** exploratory, not independently validated, not production-ready. The study and code preserve the project's in-house decision architecture. No third-party LLM, inference API, training service, or new runtime package has been introduced.

## Scientific question

Can a **locally trained specialist model** learn to distinguish relations among a product property, a measured outcome, a test condition, and the absence of supporting evidence without simply expanding Phase130's metric-name regex dictionary? Could that learned relation safely contribute to the category knowledge graph?

**Finding:** the first statistical learner is feasible in-house, but in a deliberately small cross-domain challenge it generalizes poorly and commits a critical scope/polarity error. It must produce **review hypotheses**, never product facts or rankings. This does **not** establish that a local pretrained encoder or LLM is mandatory. It establishes that the present bag-of-words baseline is insufficient.

## What scientific and AI research establishes

1. **Document-level relation extraction (DocRED).** Yao et al. (ACL 2019) provide a benchmark whose relations can require evidence distributed across sentences. A local single-sentence bag-of-words classifier cannot claim that capability. Primary paper: https://aclanthology.org/P19-1074/
2. **Span and graph-aware information extraction (DyGIE++).** Wadden et al. (EMNLP-IJCNLP 2019) jointly model entities, relations and events, using contextualized span representations and graph updates for dependencies across sentences. Their reported improvements apply to the evaluated datasets, not our product corpus. https://aclanthology.org/D19-1585/
3. **Weak supervision (Snorkel).** Ratner et al. (PVLDB 2017) use labeling functions and estimate their noise and dependencies. The Phase131 learner has *manually assigned training labels*, and does **not** implement the Snorkel generative noise model, pretrained transformers, learned span detection or weak-supervision de-correlation. https://pmc.ncbi.nlm.nih.gov/articles/PMC5951191/ ; https://doi.org/10.14778/3157794.3157797
4. **Few-shot relation classification and NOTA.** The TACL study *Revisiting Few-shot Relation Classification: Evaluation Data and Classification Schemes* discusses evaluation problems around the none-of-the-above category. Our `unrelated` class and abstention are distinct: the first concerns semantic absence of an asserted relation, the second concerns our own uncertainty. We do not conflate them. https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00392/106791/Revisiting-Few-shot-Relation-Classification
5. **Provenance.** W3C PROV-O describes entities, activities, derivations and agents. Our source ID, original-document ID, content digest, exact source spans and evidence digest implement an internal analogous traceability objective; they are not a claim of W3C PROV-O conformance or publisher authenticity. https://www.w3.org/TR/prov-o/
6. **Trustworthiness and evaluation.** NIST AI RMF stresses measurement and management of risks of AI systems. In this project the most important risk is promoting a statistically plausible but logically wrong relation to product quality evidence. https://www.nist.gov/itl/ai-risk-management-framework

## What is implemented

`src/phase131_local_relation_learning.ts` provides:

- An original in-house **multinomial Naive Bayes** statistical model, using numeric feature counts and Laplace smoothing; five trained labels: `measures`, `contributes_to`, `conditioned_on`, `not_evidence_of`, `unrelated`.
- Features from ordered entity markers, local surrounding tokens, words and bigrams *between* the annotated entities, direction, distance, and limited negation cues.
- Reproducible deterministic training and a content-derived model version. No network access or third-party model is required.
- A validation-only **log-likelihood margin** selection process. The margin is *not a calibrated probability of correctness*; thresholds are fixed before the challenge evaluation.
- A classifier that explicitly *abstains* instead of always producing a relation, and keeps `unrelated` conceptually separate from abstention.
- A source-bound proposal function: candidate only, exact original source and document IDs, content SHA-256 and quoted sentence offsets. The evidence span includes leading negations and cannot silently bridge sentence boundaries.
- A separate relation-review queue. The type permits research obligations but **no canonical relation promotion, no claim of causal effects, no quality score, and no ranking authorization**.
- Validation that corrupted document bytes, substituted source IDs, swapped original document IDs and cross-sentence unsupported pairs are rejected.

The **entity pairs are explicitly pre-marked** in the input. The new model does not discover new entities, resolve their identities, identify the tested product itself, independently verify a publisher, gather web pages or identify scientific-quality proof.

## Experiment protocol and observed results

The fixture files in `evaluation/phase131/` were written and frozen **before the new classifier code**. All texts and labels were nevertheless invented by the same developer, are short, and have not been independently annotated. This is a transparent constructed pilot, *not* a blind externally verified evaluation or original-source corpus. The development corpus reuses syntactic templates: 60 training examples, 12 validation examples, and 18 challenge examples spanning several product domains with distinct phrasing.

The output is saved in `PHASE131-RELATION-LEARNING-EVALUATION.json`, including **every** challenge item, expected label, predicted label, margin and abstention. Model version: `c04176d8b403b251`.

| Measure | Result |
|---|---:|
| Training examples | 60 |
| Calibration examples | 12 |
| Accepted and correct on calibration | 3 / 12 |
| New challenge examples | 18 |
| Accepted predictions | 5 / 18 (27.8% coverage) |
| Correct accepted predictions | 4 / 5 (80% observed precision) |
| Incorrect accepted predictions | 1 / 5 |
| Abstentions | 13 / 18 |
| Known valid positive relations recovered | 4 / 15 (26.7% within this constructed sample) |

**Most consequential failure:** the sentence about *runtime not being an indicator of cleaning quality* is incorrectly accepted as `measures`. The model assigns it a large positive margin. This is particularly dangerous because a superficially confident relation could invert a product recommendation if promoted automatically. **We have not tuned the classifier against this challenge error after observing it**; fixing it on this test set and then counting the same set as an unbiased evaluation would contaminate the benchmark.

Additional failures: no `contributes_to` relations are accepted on the new challenge, despite four ground-truth constructed positives. This confirms that lexical feature learning from 60 heavily templated records does not generalize adequately to unfamiliar technical prose.

### Interpretation of the scores

- The 80% figure is **not a population precision estimate**; it involves five accepted predictions on synthetic text and one serious error.
- The 100% calibration precision is **3/3 accepted**, so it does not establish reliability.
- The model's abstention selection deliberately trades away coverage to reduce mistakes, but cannot prevent a high-margin mistake.
- The experiment has no independent publisher snapshots or rights verification; exact substring hashing only verifies integrity *against text supplied to this runtime*.
- No LLM was tested. There is no evidential basis yet to assert that an LLM would perform better, worse, or be necessary.

## Structural decision for the knowledge graph

1. **Raw source assertion**: the original document, source role, version, offsets, and observed timestamp, if authenticated by the acquisition service.
2. **Candidate semantic relation**: subject, object, relation label, uncertainty and context, with original-source anchored evidence. A high model margin is only a *selection heuristic*.
3. **Research obligations**: measurement standard/version, units, substrate/conditions, scientific validity, causal vs correlational claims, product attribution and contradictions in the full document.
4. **Independent scientific review**: only a trusted process can validate the meaning, scope and actual support. Source authenticity and rights checks are separate from text hashing.
5. **Approved category graph update**: future work must integrate approved relationships transactionally with Phase128–129 schema versions and dependency invalidation; this phase does not pretend that it is already implemented.
6. **Query interpretation** can reuse only approved ontology relationships. **Product recommendations** require additional original comparable measurements and the existing ranking gates, not simply knowledge of a causal mechanism.

## Engineering decision and prioritized next evidence

Do not attempt to brute-force general semantic understanding by adding one regex per missed construction. A more serious native learning comparison requires independently annotated **original professional-source text** with source/publisher/version partitions, held-out *whole publisher and category* splits, and an explicit false-attribution/negation audit. The corpus must include examples in which the critical qualifier is in another sentence, and where a mechanism is hypothesized but its benefit has not been measured.

Recommended controlled experiments, still owned by us:

- Move from bag-of-words to a lightweight **position-aware contextual encoder** or sequence model with entity spans, trained on permissioned evidence. Compare with an appropriately licensed open-weight local encoder **only if** the internal model's held-out performance and cost justify the comparison; an LLM is not the default.
- Evaluate per-label precision/recall, accepted-claim error, zero-claim examples, abstention/coverage, calibration validity, reviewer workload, and cross-source leakage.
- Add verification of quantifier, negation and exception scope over full passages, while treating unhandled cross-sentence cases as unsupported rather than asserting them.
- Convert independently reviewed relation candidates into versioned graph nodes/edges, preserving distinctions among *suggests*, *measures*, *is measured under*, *fails to establish* and *is empirically confirmed*. Never infer product supremacy from a mechanism or test existence alone.
- Demonstrate permitted original-page acquisition and a **real cold-start** from product/category discovery through verified learning; neither of these is complete in Phase131.

**Verdict:** Phase131 is a measured technical experiment, not an autonomous intelligence milestone. It provides a real locally trained learner and exposes why semantic representations, data quality and controlled promotion matter more than unit-test counts.
