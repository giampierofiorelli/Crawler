# Product Evidence Engine — Phase 125: Compositional question hypotheses, dialogue context, and in-house retrieval

**Date:** 11 October 2026  
**Cumulative base:** v4.48 / Phase124  
**Code version:** v4.49 / Phase125  
**Status:** research prototype, **not** validated free-language comprehension or autonomous professional-review recommendation.

## Decision and why it matters

Phase123's developer-built intent classifier accepted 4/30 constructed test requests; Phase124's frozen small public-user sample accepted 2/12 with the expected coarse goal. Simply training another single-label classifier would again lose negative requirements, environment details, objective combinations and conversational referents. A user may ask for the best model, the best value and the least manual work in one request; a model can be good at aspirating but not washing; an explicit ban on washing must be distinguished from not needing it.

**Phase125 therefore adds a category-schema-guided *provisional frame*, not a verdict.** The frame separately represents:

- category, and whether it was explicitly named or inherited from caller-asserted verified dialogue context;
- zero, one or multiple decision lenses (`performance`, `value`, `autonomy`, `capability_discovery`);
- task requirements, prohibited capabilities, named operating environments and named new capabilities;
- personal budget only if explicitly monetary and budget-scoped, with currency and bounds;
- references to previously presented competing products, only when the caller explicitly claims a verified candidate set and contextual turn identifier;
- unknown features, contradictory mentions, negation ambiguity, and the evidence still needed before a recommendation.

### Why this is supported by the literature, and what is not

1. **Schema-guided dialogue state:** Rastogi et al., *Towards Scalable Multi-domain Conversational Agents: The Schema-Guided Dialogue Dataset* (2019), present tasks of slot filling and dialogue-state tracking across dynamic schemas and discuss unseen services. Our native *described category schema* is analogous as an engineering pattern; we have not implemented their neural model or validated zero-shot performance: https://research.google/pubs/towards-scalable-multi-domain-conversational-agents-the-schema-guided-dialogue-dataset/
2. **Annotations and contextual slots:** Zang et al., *MultiWOZ 2.2* (2020) discuss errors in dialogue-state labels, additional corrections to 17.3% of utterances, and standardized slot spans. This cautions against treating one developer-assigned intent label as independent truth: https://aclanthology.org/2020.nlp4convai-1.13/
3. **Behavioral tests:** Ribeiro et al., *Beyond Accuracy: Behavioral Testing of NLP Models with CheckList* (ACL 2020), describe systematic tests on negations, capability failures and invariances beyond simple accuracy: https://aclanthology.org/2020.acl-main.442/
4. **Lexical source retrieval:** Robertson and Zaragoza, *The Probabilistic Relevance Framework: BM25 and Beyond* (2009), give the information-retrieval basis for our existing local candidate search. BM25 relevance is not source authenticity or factual correctness: https://doi.org/10.1561/1500000019

The papers do **not** show that this specific simple parser has general comprehension, nor do they establish how to rank robot models. Our rules and schema terminology are a project implementation choice.

## Implemented files and execution

- `src/phase125_compositional_dialogue_frame.ts` — native TypeScript schema validation, conservative phrase/span-based compositional proposal, negation-scope checks, multiple goals, verified-context candidate handling, source obligations and Phase124 sidecar comparison.
- `retrieveComposedCandidates125` — calls the already-owned Phase122 BM25 over *locally supplied passages*, without scraping APIs, paid web search or an external LLM. It only emits relevant candidate passage IDs/URLs; if meaning is unresolved it makes no query.
- `tests/phase125_compositional_dialogue_frame.test.ts` — constructed/adversarial checks for general versus personal, value, autonomy, explicit and uncertain negation, follow-up referents, contradictions, multi-goal requests, category reuse, currency budget and rights filtering.
- `scripts/evaluate-phase125.mjs` — immutable source-question replay of the earlier frozen Phase124 excerpts; does not retrain the classifier and does not rewrite the Phase124 baseline.
- `PHASE125-FROZEN-QUESTION-DIAGNOSTIC.json` — case-by-case replay linked to each original public question; diagnostic labels remain developer assigned.

Run: `npm run test:phase125` and `npm run demo:phase125`.

## Frozen public-question replay (NOT blinded)

The Phase124 corpus consists of **12 excerpts from nine linked public user threads**, collected before Phase125 (paths `research/phase124_authentic_questions.json`). Phase124 classifier previously accepted the developer's expected goal on 2/12 with no incorrect accepted coarse labels, deferring the remainder.

**Phase125 on the same already-visible sample:** the expected coarse goal appears in a `candidate_needs_evidence` frame without detected hazards for **11/12**; the remaining request, “Which one would you choose?”, is correctly blocked because it does not supply a verified comparison set. This is **only developer-scored detection against coarse labels**, not independently labeled accuracy or successful slot extraction on all cases. The developer knew the 12 queries and even detected/corrected a negation bug during the implementation. The results therefore cannot be used as a blind improvement estimate, precision guarantee or a deployment threshold.

Specific error found and repaired: in the public-user question “does NOT include a mopping function (95% carpet)”, an early heuristic allowed the “does not” to wrongly modify *carpet*. The final parser bounds negation by the most recent named aspect. It consequently records mopping as excluded and carpet as an operating environment. Other multi-clause negations remain unvalidated.

## How this changes an autonomy request

With externally verified floor-robot conversation context, “Quali robot richiedono meno interventi umani?” produces a **candidate** `autonomy` goal, and requires original evidence for intervention frequency, minutes of human care, uninterrupted completion, the cleaning-quality threshold and compatible test methods. It can retrieve related passages *already available locally*. It **cannot** infer real intervention frequencies from auto-empty, heated wash or dryer features, and it cannot select a winner without measured comparable evidence.

If the user asks instead “un robot con vapore”, the pilot ontology can recognize *steam* as a capability **hypothesis** and look for observed on-floor steam performance. It neither certifies floor sanitization nor equates dock-only hot water with floor steam. Unknown capabilities require independent semantic research and never generate factual claims.

## Hard boundaries and unresolved scientific/engineering work

1. **Limited language:** the current recognizer is still a small, hand-reviewed lexicon/heuristic segmenter. It is *not* an open-world model, calibrated confidence estimator or compositional-semantic grammar capable of arbitrary sentence logic. Spans can still be ambiguous. It has not been trained for reliable cross-lingual generalization.
2. **Context attestations:** `categoryVerified` and `candidatesVerified` are supplied by the caller. They do not cryptographically prove user confirmation, candidate exposure or historical turn provenance. Dialogue storage and independent validity checks are still needed.
3. **Evidence:** local snippets are editorial notes or caller-approved data, not original publisher article bytes. A rights-reviewed flag is an assertion. A BM25 hit never verifies a professional measurement or that the passage refers to the right product.
4. **Web:** no actual source has been freshly fetched by Phase125. Source discovery remains bounded to the permission-gated internal module from Phase124; the new component does not demonstrate live unscripted browsing or full article measurement extraction.
5. **Quality:** no specialist-approved numeric suitability floors, product-wide representative dataset, cross-lab comparability bridge or production ranking is established by this release.
6. **Evaluation:** the 12-user-prompt sample is small, purposive and previously inspected. Obtain a larger independently labeled, unseen, multilingual corpus with compound goals, negative requirements, follow-up candidate state and unknown classes. Measure goal-level F1, exact frame match, hard-constraint error, abstention/coverage, candidate-source provenance and downstream product decisions separately.
7. **Architecture:** benchmark native methods first; if they cannot meet accuracy/coverage targets, test replaceable **local** open-weight models versus our own parsing. Training a general LLM from zero has not been justified on cost/data/capability grounds. There are **no new third-party services** in this phase.

## Verification

- Compilation: `tsc -p tsconfig.json` succeeded.
- Phase125 tests: **38/38 passed** (constructed tests, including negative and adversarial cases).
- Bounded TypeScript regression **excluding the two known legacy Phase91/92 files**: **1,300/1,300 passed** over 84 test files in 11 controlled groups.
- Python primary original-source checks: **47/47 passed**; Python ingestion checks **21/21 passed**.
- No failure observed in tests completed; **full historical regression remains incomplete** because Phase91 and Phase92 still require an independently completed run. This status must not be written as “all tests passed”.

**Next experiment:** hold back an independently collected compound-request corpus *before* further parser edits, compare against an in-house non-lexical alternative with verified provenance, and execute a permitted real-source acquisition plus product-attributed outcome extraction. Do not invent full-market recommendations without those gates.
