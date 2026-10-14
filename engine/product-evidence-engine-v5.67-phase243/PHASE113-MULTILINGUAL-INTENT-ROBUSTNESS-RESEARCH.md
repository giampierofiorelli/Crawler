# Product Evidence Engine — Phase 113
## Local structured intent proposals, ambiguity/omission safeguards, and semantic-invariance evaluation

**Date:** 2026-10-11  
**Version:** 4.37.0  
**Status:** integrated experimental software, not a validated multilingual intent recognizer, and not a public product-ranking implementation.

## Executive verdict

The correct objective is not merely *same top recommendation for paraphrases*. It is:

> Given the same independently verified user intent, explicit constraints, preferences, candidate set, evaluation policy and immutable evidence snapshot, produce the same full ranking, unresolved products, ties and explanations. Material differences in meaning must be detected, not suppressed to create apparent stability.

The pre-existing Phase112 engine already imposed this rule on **verified input frames**, but its linguistic parser was an intentionally restricted grammar. Phase113 adds a **local-only Ollama JSON-schema proposal adapter**, a strict **grounding/omission/scope audit**, a **snapshot-conditioned clarification test**, a **behavioral benchmark harness** that distinguishes constructed cases from independent annotations, and 31 new executable tests.

**Not achieved:** Real Ollama inference, independent human intent annotation, general multilingual parsing accuracy, fielded end-user clarification UX, universal omission recall, arbitrary-domain ranking, and an independently validated ranking-quality advantage.

## Why the previous answer was not sufficient

A deterministic ranking algorithm cannot repair a misinterpreted question. Two people may say different words while intending the same use case; conversely, two outwardly similar requests may differ in hard requirements, preferred characteristics, intended surface, user circumstances or applicability of original tests. Detecting equivalence from a model's apparent confidence or matching keyword embeddings is insufficient. The challenge is **correctly identifying the meaning** before comparing rankings.

We found no usable live Ollama binary in this execution environment. Thus the 31 tests use controlled responses and a mocked local HTTP transport. They test the adapter and gates, not an actual local language model.

## Scientific references and their exact contribution

1. Ribeiro et al. (2020), *Beyond Accuracy: Behavioral Testing of NLP Models with CheckList*. https://aclanthology.org/2020.acl-main.442/ — behavioral capability tests; paraphrase invariance, negation and sensitivity to meaningful edits. Does not validate our specific consumer-product parser.
2. Li et al. (2021), *MTOP: A Comprehensive Multilingual Task-Oriented Semantic Parsing Benchmark*. https://aclanthology.org/2021.eacl-main.257/ — intent and nested-slot parsing across languages; original corpus comprises roughly 100k annotated utterances, six languages, 11 domains. These domains are not a substitute for our product-specific annotated utterances.
3. Papicchio et al. (2025), *SQUAB: Evaluating LLM robustness to Ambiguous and Unanswerable Questions in Semantic Parsing*. https://aclanthology.org/2025.emnlp-main.906/ — evaluate ambiguity and genuinely unavailable answers, not just parsing accuracy on well-formed questions.
4. Xin et al. (2021), *The Art of Abstention: Selective Prediction and Error Regularization for NLP*. https://aclanthology.org/2021.acl-long.84/ — principled abstention under uncertain prediction; does not prescribe our own acceptance threshold.
5. Kumar & Black (2020), *ClarQ: A large-scale and diverse dataset for Clarification Question Generation*. https://aclanthology.org/2020.acl-main.651/ — clarification when necessary rather than guessing. Its StackExchange data do not calibrate consumer-shopping dialogue directly.
6. Aliannejadi et al., ClariQ conversational clarification challenge. https://github.com/aliannejadi/ClariQ — disambiguation-need detection and choosing questions. Useful evaluation design; not a directly deployable shopping grammar.
7. Hua et al. (2025), *Flaw or Artifact? Rethinking Prompt Sensitivity in Evaluating LLMs*. https://aclanthology.org/2025.emnlp-main.1006/ — warns that apparent wording sensitivity can arise from overly rigid answer matching. We compare canonical *meaning* and structured ranking, not literal output text.
8. Ollama, official structured outputs documentation. https://github.com/ollama/ollama/blob/main/docs/capabilities/structured-outputs.mdx — local `/api/chat`, JSON-schema `format`, low-temperature generation; format validity does not guarantee correctness of meaning.
9. RTINGS original professional-review sources from the Phase112 manual pilot (single-publisher v1.4 protocol; figures are **not** newly live-extracted here):
   - https://www.rtings.com/vacuum/reviews/tineco/pure-one-s11
   - https://www.rtings.com/vacuum/reviews/dyson/v11
   - https://www.rtings.com/vacuum/reviews/dyson/v15-detect
   - https://www.rtings.com/vacuum/reviews/shark/stratos-cordless
   Two conditions were previously transcribed: hard floor and low-pile carpet; a particular variant's test identity matters (Shark IZ682H). A cross-context rank inversion is evidence that a missing surface can matter.

All numbered methodological papers are external scientific inputs. Their adoption here is **our system design**, not an algorithm published and validated by those authors.

## Product architecture: nonnegotiable separation

`User utterance → ephemeral local model proposal → structural validation → literal grounding audit → omission/negation/constraint/scope audit → independent confirmation or clarification → frozen canonical intent → deterministic ranking on frozen evidence snapshot → user-specific answer`

The product's canonical evidence database sits entirely outside this pathway. The query *cannot* change original professional observations, source interpretation, evidence status, independent-convergence data or manufacturer-vs-lab distinctions.

### The new proposal contract

File: `src/phase113_local_intent_interpreter.ts`

- `category`: supported vacuum cleaner or dishwasher, or unknown. Dishwashers have no published comparative hygiene ranking in this narrow integration.
- `goal`: least measured noise, hygiene effectiveness, or unknown.
- `surface`: hard floor, low-pile carpet, unspecified, conflicting or irrelevant.
- `requirements[]`: explicit requirements and their hard/soft/unclear strength. An additional requirement cannot silently disappear.
- `hygieneTargets[]`: bacterial reduction is kept distinct from viral inactivation.
- `anchors[]`: exact source substrings plus UTF-16 positions for major slots.
- `ambiguous` and `unresolvedText`: ambiguity must remain representable rather than being replaced with a guessed default.

**Important:** A correctly located quotation only proves that text appears in the utterance. It does not prove the model has correctly interpreted its negation, intensity, scope or implication. For this reason the model's proposed frame is *never* marked as `explicitly_verified_semantic_frame` by this module.

### Safe local execution

`makeLocalOllamaIntentModel113({modelId:'<locally installed model>'})`

- Only loopback `http://localhost:<port>/api/chat`, `127.0.0.1` or IPv6 `::1` is accepted. There is no commercial API fallback.
- Uses a JSON schema, `stream:false`, `temperature:0`, timeout, bounded response size and exact strict schema validation.
- Model output is treated as untrusted. A schema-conforming hallucination remains possible.
- Query and source text are not written to any canonical-product memory by this path; transient model request still contains the user's current text.
- The adapter accepts an injected transport so automated software tests do not pretend to run a real Ollama instance.

### Omissions and ambiguity guards

The audit requires grounded category/goal/context and recognizes selected high-risk expressions such as cordless, pet hair, price ceilings, bacteria and viruses. It signals negation and possible absolute requirements for further scope review; the whole request must be adjudicated before ranking eligibility.

**Limitation:** This lexicon is a small safety net, not proof that all constraints in arbitrary languages are identified. Unknown semantics can still be omitted while the JSON passes structural validation. Product rollout requires independent human-labeled tests and measured false-negative rates.

### Clarification relevance

`surfaceSensitivity113` evaluates *both* documented test contexts against the same frozen evidence snapshot:

- If rankings differ materially, it recommends clarifying which context matters.
- If they do not differ, it records a conditionally invariant order, **without falsely claiming the user specified a context or issuing a public recommendation**.
- Missing measurements, ties, non-comparable methods and altered snapshots stay visible instead of being optimized away.

It does not ask for confirmation solely because a phrase differs; it asks when an unresolved meaning or a consequential ambiguity needs resolution.

## Evaluation methodology — what must be measured next

Construct a multi-category corpus of **authentic, consented human shopping queries**, labeled independently by at least two adjudicators. Sample common paraphrases and intentionally difficult cases:

1. Paraphrases of exactly the same goal (including Italian/English), reordered phrases and small typos.
2. Single changes in material constraints (with/without cord; budget; absolute vs preferred threshold; context).
3. Negation, attachment, conjunction, deictic references, implicit contexts and multiple goals.
4. Unanswerable product/measurement requests, missing evidence, unsupported new categories.
5. Different user preference profiles that may legitimately reverse rankings.
6. Adversarial text trying to trick the semantic parser into dropping a requirement.

Use a held-out evaluation split at **intent-family and user levels**, preventing exact paraphrase families from appearing in both development and assessment. Adjudicators label category, task, applicable context, preferences, mandatory requirements, ambiguities and whether two requests really mean the same thing. Resolve disagreement with a third adjudicator; report agreement per facet, and do not equate agreement with truth.

Recommended diagnostics:

| Dimension | Check | Critical failure |
|---|---|---|
| Same-intent invariance | Complete list including ties/unranked, same source snapshot and reasons | Equivalent utterances obtain different ranked products |
| False equivalence | Cross-intent pairs differing in a real constraint | Model merges different intents and discards a condition |
| Slot accuracy | Category, surface, task, soft/hard requirements | A requirement silently omitted |
| Abstention | Risk-coverage curve at calibrated thresholds | Model auto-ranks uncertain or unsupported input |
| Clarification utility | Outcome difference conditional on user answer | Wastes user time with irrelevant questions or skips consequential ones |
| End-to-end ranking | Compare against independent expert reference preferences, using fixed evidence | Incorrect product choice despite correct frame |
| Temporal stability | Frozen versus changed source snapshots | Semantic difference incorrectly blamed on an evidence update |
| Locale robustness | Validated equivalent utterances across languages | Unjustified locale-dependent ranking changes |

False merging of materially different needs deserves separate attention even when the headline equivalence score looks good. Report confidence intervals only after the sample design and independence assumptions are established. Include an explicit error taxonomy and adjudication log.

The `assessIntentBenchmark113` code returns no empirical accuracy for **constructed/developer-authored labels**, even when simulated predictions look perfect. External metadata is explicitly *declared, not cryptographically verified*: a production evaluation needs auditable annotation records and real model executions.

## Verification performed in this turn

- 31/31 new Node/TypeScript unit tests passed using mocked model outputs and an injected local HTTP transport.
- 982/982 JavaScript/TypeScript cumulative tests passed across explicitly completed shards and individual runs. Stalled/interrupted large-process attempts are not counted.
- 60 companion Python + 16 companion Node + 47 primary-source Python + 21 ingestion Python + 26 evaluation Python + 4 launch Node + 3 release Node passed separately = 177.
- **Total executed successful assertions reported by test runners:** 1,159 test cases. These are tests, **not model prediction accuracy observations**.
- A constructed audit artifact in `audit/phase113/constructed-language-robustness.json` demonstrates a deliberately false merge; its `empiricalModelAccuracy` correctly remains `null`.
- All 1,144 files of baseline v4.36 are present; only `package.json` is modified among pre-existing files, before this README addition and release files. No previous source code or tests were replaced.

**Not executed:** a real Ollama model; production browser/crawler acquisitions; independent human-user request benchmarks; full multi-category product-ranking validation. These must not be inferred from test counts.

## Required follow-on: Phase114

1. Execute the actual local model on several hundred independently adjudicated authentic multilingual requests after validating a local runtime and model choice. Do not substitute model simulations.
2. Build human review interfaces and cryptographically or operationally authenticated labels; evaluate two annotators plus adjudication.
3. Measure the exact-match semantic-frame quality, false-equivalence rate, false-constraint-omission rate, and selective risk/coverage by category and language.
4. Implement calibrated, low-friction user confirmation where needed; avoid asking a human to sign every routine request.
5. Run end-to-end full-ranking stability with frozen canonical product evidence and verified user preference profiles. Only then consider lifting research-only gates.

## Reproducibility

```bash
npm run build
npm run test:phase113
node dist/examples/phase113-intent-demo.js
npm run test:primary
npm run test:ingestion
npm run test:phase84
npm run test:companion
npm run test:launch
npm run test:release
```

The bounded cumulative test runner is `node scripts/run-test-shards.mjs <shard number>`; the slow fifth group can be run as individual test files to avoid time limits in this execution environment.
